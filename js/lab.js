// 3D scenario lab: plays a scenario on a timeline the user can scrub.
import * as THREE from '../vendor/three.module.min.js';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { SCENARIOS } from './scenarios.js';
import { scenarioText, t as tr } from './i18n.js';

const escH = (v) => String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
import { PALETTE, makeLights, ground, car, setCarLights, makeRenderer, fitToCanvas } from './world.js';

const ease = {
  in: (f) => 1 - (1 - f) * (1 - f), // decelerate into the key
  out: (f) => f * f, // accelerate out of the previous key
  io: (f) => f * f * (3 - 2 * f),
};

class Actor {
  constructor(def) {
    this.def = def;
    this.curve = new THREE.CatmullRomCurve3(def.path.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal');
    this.length = this.curve.getLength();
    this.markers = {};
    const samples = 800;
    const pts = this.curve.getSpacedPoints(samples);
    for (const [name, [mx, mz]] of Object.entries(def.markers || {})) {
      let best = 0, bestD = Infinity;
      pts.forEach((p, i) => {
        const d = (p.x - mx) ** 2 + (p.z - mz) ** 2;
        if (d < bestD) { bestD = d; best = i; }
      });
      this.markers[name] = (best / samples) * this.length;
    }
    this.keys = def.keys.map(([t, d, e]) => [t, this.resolve(d), e]);
    this.signals = (def.signals || []).map(([a, b, side]) => [this.toTime(a), this.toTime(b), side]);
    this.mesh = car(def.learner ? PALETTE.learner : def.color, { learner: !!def.learner });
  }

  resolve(d) {
    if (typeof d === 'number') return d;
    if (d === 'end') return this.length;
    const m = /^([a-z0-9]+)([+-][\d.]+)?$/i.exec(d);
    if (!m || !(m[1] in this.markers)) throw new Error(`Unknown marker ${d}`);
    return this.markers[m[1]] + (m[2] ? parseFloat(m[2]) : 0);
  }

  // Numbers are times; strings are distances turned into the time the actor gets there.
  toTime(v) {
    return typeof v === 'number' ? v : this.timeAt(this.resolve(v));
  }

  distAt(t) {
    const k = this.keys;
    if (t <= k[0][0]) return k[0][1];
    for (let i = 1; i < k.length; i++) {
      if (t <= k[i][0]) {
        const [t0, d0] = k[i - 1], [t1, d1, e] = k[i];
        let f = (t - t0) / (t1 - t0);
        if (e) f = ease[e](f);
        return d0 + (d1 - d0) * f;
      }
    }
    return k[k.length - 1][1];
  }

  timeAt(d) {
    const end = this.keys[this.keys.length - 1][0];
    for (let t = 0; t <= end; t += 0.02) if (this.distAt(t) >= d) return t;
    return end;
  }

  update(t) {
    const d = this.distAt(t);
    const visible = d >= -0.01 && d <= this.length + 0.01;
    this.mesh.visible = visible;
    if (!visible) return;
    const u = THREE.MathUtils.clamp(d / this.length, 0, 1);
    const p = this.curve.getPointAt(u);
    const tan = this.curve.getTangentAt(u);
    this.mesh.position.copy(p);
    this.mesh.lookAt(p.x + tan.x, 0, p.z + tan.z);
    const v = d - this.distAt(t - 0.15);
    const vPrev = this.distAt(t - 0.15) - this.distAt(t - 0.3);
    const braking = v < 0.01 || v < vPrev - 0.008;
    const sig = this.signals.find(([a, b]) => t >= a && t <= b);
    setCarLights(this.mesh, { signal: sig ? sig[2] : null, braking, time: t });
  }
}

export class Lab {
  constructor(root) {
    this.root = root;
    this.canvas = root.querySelector('canvas');
    this.renderer = makeRenderer(this.canvas);
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 400);
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.enableZoom = false;
    this.controls.maxPolarAngle = Math.PI * 0.45;
    this.controls.enabled = !matchMedia('(pointer: coarse)').matches;
    this.time = 0;
    this.playing = false;
    this.speed = 1;
    this.view = 'overview';
    this.clock = new THREE.Clock();
    this.visibleOnScreen = false;
    this.ui = {
      play: root.querySelector('[data-lab=play]'),
      restart: root.querySelector('[data-lab=restart]'),
      scrub: root.querySelector('[data-lab=scrub]'),
      time: root.querySelector('[data-lab=time]'),
      steps: root.querySelector('[data-lab=steps]'),
      caption: root.querySelector('[data-lab=caption]'),
      title: root.querySelector('[data-lab=title]'),
      blurb: root.querySelector('[data-lab=blurb]'),
      tabs: root.querySelectorAll('[data-scenario]'),
      views: root.querySelectorAll('[data-view]'),
      speed: root.querySelector('[data-lab=speed]'),
    };
    this.bind();
    new IntersectionObserver(([e]) => {
      this.visibleOnScreen = e.isIntersecting;
      if (e.isIntersecting) {
        this.clock.getDelta();
        if (!this.started && !matchMedia('(prefers-reduced-motion: reduce)').matches) this.setPlaying(true);
        this.started = true;
      }
    }, { threshold: 0.05 }).observe(this.canvas);
    this.load('tjunction');
    this.renderer.setAnimationLoop(() => this.tick());
  }

  bind() {
    const { play, restart, scrub, tabs, views, speed, steps } = this.ui;
    play.addEventListener('click', () => this.setPlaying(!this.playing));
    restart.addEventListener('click', () => { this.seek(0); this.setPlaying(true); });
    scrub.addEventListener('input', () => { this.setPlaying(false); this.seek(parseFloat(scrub.value)); });
    speed.addEventListener('click', () => {
      this.speed = this.speed === 1 ? 0.5 : 1;
      speed.textContent = this.speed === 1 ? '1×' : '½×';
      speed.setAttribute('aria-label', this.speed === 1 ? tr('speedNormal') : tr('speedHalf'));
    });
    tabs.forEach((b) => b.addEventListener('click', () => this.load(b.dataset.scenario)));
    views.forEach((b) => b.addEventListener('click', () => this.setView(b.dataset.view)));
    steps.addEventListener('click', (e) => {
      const li = e.target.closest('[data-t]');
      if (!li) return;
      this.seek(parseFloat(li.dataset.t));
      this.setPlaying(true);
    });
  }

  setPlaying(p) {
    this.playing = p;
    if (p && this.time >= this.sc.duration) this.seek(0);
    this.ui.play.textContent = p ? tr('pause') : tr('play');
    this.ui.play.setAttribute('aria-pressed', String(p));
    this.clock.getDelta();
  }

  setView(v) {
    this.view = v;
    this.ui.views.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === v)));
    if (v === 'overview') this.resetCamera();
  }

  resetCamera() {
    const { pos, target } = this.sc.camera;
    const narrow = this.canvas.clientWidth < 560;
    const scale = narrow ? 1.35 : 1;
    this.camera.position.set(pos[0] * scale, pos[1] * scale, pos[2] * scale);
    this.controls.target.set(...target);
    this.controls.update();
  }

  load(id) {
    this.sc = SCENARIOS[id];
    this.ui.tabs.forEach((b) => b.setAttribute('aria-selected', String(b.dataset.scenario === id)));
    if (this.scene) this.scene.traverse((o) => { o.geometry?.dispose?.(); });
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcfe0ea);
    scene.fog = new THREE.Fog(0xcfe0ea, 70, 170);
    makeLights(scene, { shadowSize: 55 });
    scene.add(ground(400));
    const world = new THREE.Group();
    this.sc.build(world);
    for (const p of this.sc.parked || []) {
      const c = car(p.color);
      c.position.set(p.x, 0, p.z);
      c.rotation.y = p.heading;
      world.add(c);
    }
    scene.add(world);
    this.actors = this.sc.actors.map((a) => new Actor(a));
    this.learner = this.actors.find((a) => a.def.learner);
    for (const a of this.actors) scene.add(a.mesh);
    this.scene = scene;
    this.scenarioId = id;
    this.stepTimes = this.sc.steps.map((st) => (st.at ? this.learner.timeAt(this.learner.resolve(st.at)) : st.t));
    this.ui.scrub.max = String(this.sc.duration);
    this.renderText();
    this.lastStep = -1;
    this.resetCamera();
    this.seek(0);
    this.setPlaying(!matchMedia('(prefers-reduced-motion: reduce)').matches && this.visibleOnScreen);
  }

  // Fill the titles and steps in the current language.
  renderText() {
    const txt = scenarioText(this.scenarioId);
    this.steps = this.sc.steps.map((st, i) => ({
      t: this.stepTimes[i],
      title: txt.steps?.[i]?.[0] ?? st.title,
      text: txt.steps?.[i]?.[1] ?? st.text,
    }));
    this.ui.title.textContent = txt.title || this.sc.title;
    this.ui.blurb.textContent = txt.blurb || this.sc.blurb;
    this.ui.steps.innerHTML = this.steps.map((st, i) => `
      <li data-t="${st.t.toFixed(2)}" tabindex="0">
        <span class="step-n">${i + 1}</span>
        <span><strong>${escH(st.title)}</strong><span class="step-text">${escH(st.text)}</span></span>
      </li>`).join('');
    this.ui.steps.querySelectorAll('li').forEach((li) => li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); li.click(); }
    }));
    this.lastStep = -1;
  }

  refreshText() {
    this.renderText();
    this.seek(this.time);
    this.ui.play.textContent = this.playing ? tr('pause') : tr('play');
  }

  seek(t) {
    this.time = THREE.MathUtils.clamp(t, 0, this.sc.duration);
    for (const a of this.actors) a.update(this.time);
    this.ui.scrub.value = String(this.time);
    this.ui.time.textContent = `${this.time.toFixed(1)}s`;
    let idx = 0;
    this.steps.forEach((s, i) => { if (this.time >= s.t - 0.001) idx = i; });
    if (idx !== this.lastStep) {
      this.lastStep = idx;
      this.ui.steps.querySelectorAll('li').forEach((li, i) => {
        li.classList.toggle('is-active', i === idx);
        li.classList.toggle('is-done', i < idx);
      });
      const active = this.ui.steps.children[idx];
      const box = this.ui.steps.closest('.lab-side');
      if (active && box && box.scrollHeight > box.clientHeight) {
        const top = active.offsetTop - box.offsetTop - 60;
        box.scrollTo({ top, behavior: 'smooth' });
      }
      const s = this.steps[idx];
      this.ui.caption.innerHTML = `<strong>${escH(s.title)}.</strong> ${escH(s.text)}`;
    }
  }

  tick() {
    const dt = Math.min(this.clock.getDelta(), 0.1);
    if (!this.visibleOnScreen) return;
    fitToCanvas(this.renderer, this.camera);
    if (this.playing) {
      this.seek(this.time + dt * this.speed);
      if (this.time >= this.sc.duration) this.setPlaying(false);
    }
    if (this.view === 'driver') {
      const m = this.learner.mesh;
      const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(m.quaternion);
      const want = m.position.clone().addScaledVector(fwd, -7.5).add(new THREE.Vector3(0, 3.6, 0));
      this.camera.position.lerp(want, 1 - Math.pow(0.001, dt));
      this.camera.lookAt(m.position.clone().addScaledVector(fwd, 9).add(new THREE.Vector3(0, 0.8, 0)));
    } else {
      if (this.sc.follow) {
        // Slide camera and target together so the learner stays in frame.
        const lz = this.learner.mesh.position.z;
        const wantZ = THREE.MathUtils.clamp(lz - 4, -70, this.sc.camera.target[2]);
        const dz = (wantZ - this.controls.target.z) * (1 - Math.pow(0.02, dt));
        this.controls.target.z += dz;
        this.camera.position.z += dz;
      }
      this.controls.update();
    }
    this.renderer.render(this.scene, this.camera);
  }
}
