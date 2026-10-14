import * as THREE from '../../vendor/three.module.min.js';
import { OrbitControls } from '../../vendor/OrbitControls.js';
import { PALETTE, makeLights, ground, car, setCarLights, steerWheels, makeRenderer, fitToCanvas } from '../world.js';
import { ENVS } from './envs.js';
import { Vehicle, joystick, keyboard, MAX_STEER } from './drive.js';
import { mirrorCones, blindSpots, referenceLines, idealPath } from './overlays.js';
import { GUIDES } from './guides.js';
import { LANGS, setLang, savedLang, onLang, topicText, labels, lang } from '../i18n.js';
import { diagram } from '../diagrams.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage off */ } },
};

const toastEl = $('[data-toast]');
function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => toastEl.classList.remove('show'), 2200); }

/* ---------- Traffic ---------- */
class Traffic {
  constructor(def) {
    this.def = def;
    this.closed = !!def.closed;
    this.curve = new THREE.CatmullRomCurve3(def.points.map(([x, z]) => new THREE.Vector3(x, 0, z)), this.closed, 'centripetal');
    this.L = this.curve.getLength();
    this.d = (def.offset || 0) * this.L;
    this.v = def.speed;
    this.mesh = car(def.color);
    if (def.stopAt) {
      const pts = this.curve.getSpacedPoints(600);
      let best = 0, bd = Infinity;
      pts.forEach((p, i) => { const dd = (p.x - def.stopAt[0]) ** 2 + (p.z - def.stopAt[1]) ** 2; if (dd < bd) { bd = dd; best = i; } });
      this.stopD = (best / 600) * this.L;
    }
  }

  update(dt, lights, learner) {
    let target = this.def.speed;
    if (this.def.grp && this.stopD != null && lights[this.def.grp] !== 'green') {
      const gap = this.stopD - this.d;
      if (gap > -0.5 && gap < 35) target = Math.min(target, Math.max(0, gap * 0.8));
      if (gap > -0.5 && gap < 0.4) target = 0;
    }
    // Do not drive into the learner car.
    const p = this.mesh.position, f = new THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh.quaternion);
    const dx = learner.x - p.x, dz = learner.z - p.z;
    const ahead = dx * f.x + dz * f.z, side = Math.abs(dx * f.z - dz * f.x);
    if (ahead > 0 && ahead < 9 && side < 2.3) target = Math.min(target, Math.max(0, (ahead - 5) * 1.2));
    const dv = target - this.v;
    this.v += Math.sign(dv) * Math.min(Math.abs(dv), (dv < 0 ? 7 : 3) * dt);
    this.d += this.v * dt;
    if (this.d > this.L) this.d = this.closed ? this.d - this.L : 0;
    const u = this.d / this.L;
    const pt = this.curve.getPointAt(u), tan = this.curve.getTangentAt(u);
    this.mesh.position.copy(pt);
    this.mesh.lookAt(pt.x + tan.x, 0, pt.z + tan.z);
    setCarLights(this.mesh, { braking: dv < -0.2 || this.v < 0.1, time: performance.now() / 1000 });
  }
}

/* ---------- App ---------- */
const canvas = $('[data-view]');
let renderer;
try {
  renderer = makeRenderer(canvas);
} catch (err) {
  console.error(err);
  $('[data-loading]').hidden = true;
  $('[data-no3d]').hidden = false;
  throw err;
}
const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 600);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI * 0.49;
controls.enabled = false;

const state = {
  env: store.get('dash-env', 'tjunction'),
  cam: store.get('dash-cam', 'rear'),
  ov: store.get('dash-ov', { mirrors: false, blind: false, ref: false, path: true }),
  pathKey: null,
  signal: null,
  lights: { ns: 'green', ew: 'red' },
  lightsAuto: false,
};
if (!ENVS[state.env]) state.env = 'tjunction';

const vehicle = new Vehicle();
const joy = joystick($('[data-joy]'));
const keys = keyboard();
let scene, envCtx, traffic = [], learnerMesh, overlays = {}, pathGroup = null, dragging = null;

function buildScene(id) {
  const env = ENVS[id];
  scene?.traverse((o) => { o.geometry?.dispose?.(); });
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xbfd6e3);
  scene.fog = new THREE.Fog(0xbfd6e3, 80, 220);
  makeLights(scene, { shadowSize: 60 });
  scene.add(ground(500));
  envCtx = {};
  const world = new THREE.Group();
  env.build(world, envCtx);
  scene.add(world);
  traffic = env.traffic.map((d) => new Traffic(d));
  traffic.forEach((tr) => scene.add(tr.mesh));

  learnerMesh = car(PALETTE.learner, { learner: true });
  overlays = { mirrors: mirrorCones(), blind: blindSpots(), ref: referenceLines() };
  for (const [k, g] of Object.entries(overlays)) { g.visible = !!state.ov[k]; learnerMesh.add(g); }
  scene.add(learnerMesh);
  vehicle.reset(env.spawn);

  const keysList = Object.keys(env.paths);
  if (!keysList.includes(state.pathKey)) state.pathKey = keysList[0];
  showPath();

  $('[data-lights-ctl]').hidden = !env.lights;
  renderPathChips();
  syncLights();
}

function showPath() {
  if (pathGroup) { scene.remove(pathGroup); pathGroup.traverse((o) => o.geometry?.dispose?.()); }
  pathGroup = new THREE.Group();
  const env = ENVS[state.env];
  const keysList = state.pathKey === 'all' ? Object.keys(env.paths) : [state.pathKey];
  // The bay park shows both of its parts together.
  const list = state.env === 'bay' ? Object.keys(env.paths) : keysList;
  for (const k of list) { const p = env.paths[k]; if (p) pathGroup.add(idealPath(p.points, { reverse: p.reverse })); }
  pathGroup.visible = !!state.ov.path;
  scene.add(pathGroup);
}

function renderPathChips() {
  const env = ENVS[state.env];
  const entries = Object.entries(env.paths);
  $('[data-path-chips]').innerHTML = entries.length > 1 && state.env !== 'bay'
    ? entries.map(([k, p]) => `<button class="chip" data-path="${k}" aria-pressed="${k === state.pathKey}">${esc(p.label)}</button>`).join('')
    : `<span class="chip-note">${esc(entries.map(([, p]) => p.label).join(' → '))}</span>`;
}

/* ---------- Traffic lights ---------- */
let lightsBusy = false;
function syncLights() {
  for (const l of envCtx.lights || []) l.set(state.lights[l.grp]);
  const word = (s) => ({ green: 'Green', red: 'Red', amber: 'Amber', redamber: 'Red + amber' }[s]);
  $('[data-lights-state]').textContent = `North–south: ${word(state.lights.ns)} · East–west: ${word(state.lights.ew)}`;
}
function switchLights() {
  if (lightsBusy) return;
  lightsBusy = true;
  const from = state.lights.ns === 'green' ? 'ns' : 'ew';
  const to = from === 'ns' ? 'ew' : 'ns';
  state.lights[from] = 'amber'; syncLights();
  setTimeout(() => { state.lights[from] = 'red'; syncLights(); }, 2000);
  setTimeout(() => { state.lights[to] = 'redamber'; syncLights(); }, 3000);
  setTimeout(() => { state.lights[to] = 'green'; syncLights(); lightsBusy = false; }, 4500);
}
$('[data-lights-switch]').addEventListener('click', switchLights);
$('[data-lights-auto]').addEventListener('click', (e) => {
  state.lightsAuto = !state.lightsAuto;
  e.currentTarget.setAttribute('aria-pressed', String(state.lightsAuto));
});
setInterval(() => { if (state.lightsAuto && ENVS[state.env].lights) switchLights(); }, 14000);

/* ---------- UI ---------- */
$('[data-env-tabs]').innerHTML = Object.entries(ENVS).map(([k, e]) =>
  `<button role="tab" data-env="${k}" aria-selected="${k === state.env}"><b>${e.short}</b><span>${esc(e.label)}</span></button>`).join('');
$('[data-env-tabs]').addEventListener('click', (e) => {
  const b = e.target.closest('[data-env]');
  if (b) setEnv(b.dataset.env);
});
function setEnv(id, opts = {}) {
  state.env = id;
  store.set('dash-env', id);
  $$('[data-env]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.env === id)));
  if (opts.path) state.pathKey = opts.path;
  buildScene(id);
  snapCamera = true;
}

$$('[data-cam]').forEach((b) => b.addEventListener('click', () => setCam(b.dataset.cam)));
function setCam(c) {
  state.cam = c;
  store.set('dash-cam', c);
  $$('[data-cam]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cam === c)));
  controls.enabled = c === 'orbit';
  if (c === 'orbit') {
    camera.up.set(0, 1, 0);
    controls.target.set(vehicle.x, 0.5, vehicle.z);
  }
  snapCamera = true;
}

$$('[data-ov]').forEach((b) => {
  b.setAttribute('aria-pressed', String(!!state.ov[b.dataset.ov]));
  b.addEventListener('click', () => {
    const k = b.dataset.ov;
    state.ov[k] = !state.ov[k];
    store.set('dash-ov', state.ov);
    b.setAttribute('aria-pressed', String(state.ov[k]));
    if (k === 'path') pathGroup.visible = state.ov.path; else overlays[k].visible = state.ov[k];
  });
});
$('[data-path-chips]').addEventListener('click', (e) => {
  const b = e.target.closest('[data-path]');
  if (!b) return;
  state.pathKey = b.dataset.path;
  if (!state.ov.path) $('[data-ov=path]').click();
  showPath();
  renderPathChips();
});

$$('[data-signal]').forEach((b) => b.addEventListener('click', () => {
  state.signal = state.signal === b.dataset.signal ? null : b.dataset.signal;
  $$('[data-signal]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.signal === state.signal)));
}));
$$('[data-rotate]').forEach((b) => b.addEventListener('click', () => { vehicle.h += Number(b.dataset.rotate) * THREE.MathUtils.degToRad(15); vehicle.v = 0; }));
$('[data-reset]').addEventListener('click', () => { vehicle.reset(ENVS[state.env].spawn); snapCamera = true; });

const tools = $('[data-tools]');
$('[data-tools-toggle]').addEventListener('click', (e) => {
  const open = tools.classList.toggle('is-collapsed') === false;
  e.currentTarget.setAttribute('aria-expanded', String(open));
});
if (innerWidth < 900 || innerHeight < 520) { tools.classList.add('is-collapsed'); $('[data-tools-toggle]').setAttribute('aria-expanded', 'false'); }

/* ---------- Guides drawer ---------- */
const drawer = $('[data-drawer]'), scrim = $('[data-scrim]');
function setDrawer(open) {
  drawer.classList.toggle('is-open', open);
  drawer.setAttribute('aria-hidden', String(!open));
  scrim.hidden = !open;
  $('[data-drawer-toggle]').setAttribute('aria-expanded', String(open));
}
$('[data-drawer-toggle]').addEventListener('click', () => setDrawer(!drawer.classList.contains('is-open')));
$('[data-drawer-close]').addEventListener('click', () => setDrawer(false));
scrim.addEventListener('click', () => setDrawer(false));

let openGuide = store.get('dash-guide', null);
function renderGuides() {
  const L = labels();
  $('[data-guides]').innerHTML = GUIDES.map((g) => {
    const tt = topicText(g.topic);
    const steps = g.steps || tt.steps || [];
    const open = g.id === openGuide;
    return `<details class="guide" data-guide="${g.id}" ${open ? 'open' : ''}>
      <summary><span>${esc(g.steps ? g.title : tt.title || g.title)}</span><button class="show-btn" data-show="${g.id}">Show in 3D</button></summary>
      <div class="guide-body">
        ${g.steps ? '' : `<p class="guide-simple">${esc(tt.simple)}</p>`}
        <div class="guide-pic">${diagram(g.topic, L)}</div>
        <ol>${steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
        ${(g.extra || []).map((x) => `<p class="guide-extra">${esc(x)}</p>`).join('')}
        ${tt.tip ? `<p class="guide-tip">${esc(tt.tip)}</p>` : ''}
      </div>
    </details>`;
  }).join('');
}
$('[data-guides]').addEventListener('click', (e) => {
  const b = e.target.closest('[data-show]');
  if (!b) return;
  e.preventDefault();
  const g = GUIDES.find((x) => x.id === b.dataset.show);
  openGuide = g.id;
  store.set('dash-guide', g.id);
  applyGuide(g);
  if (innerWidth < 900) setDrawer(false);
});
$('[data-guides]').addEventListener('toggle', (e) => {
  if (e.target.open) { openGuide = e.target.dataset.guide; store.set('dash-guide', openGuide); }
}, true);

function applyGuide(g) {
  const s = g.setup;
  const ov = { mirrors: false, blind: false, ref: false, path: !!s.overlays.path, ...s.overlays };
  if (typeof ov.path === 'string') { state.pathKey = ov.path; ov.path = true; }
  state.ov = { mirrors: !!ov.mirrors, blind: !!ov.blind, ref: !!ov.ref, path: !!ov.path };
  store.set('dash-ov', state.ov);
  $$('[data-ov]').forEach((b) => b.setAttribute('aria-pressed', String(state.ov[b.dataset.ov])));
  setEnv(s.env);
  setCam(s.camera);
  toast(g.steps ? g.title : topicText(g.topic).title || g.title);
}

/* ---------- Language ---------- */
const langSel = $('[data-lang-select]');
langSel.innerHTML = LANGS.map((l) => `<option value="${l.code}">${esc(l.name)}</option>`).join('');
langSel.addEventListener('change', () => setLang(langSel.value));
onLang(() => { langSel.value = lang(); renderGuides(); });

/* ---------- Drag the car ---------- */
const ray = new THREE.Raycaster();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const ndc = (e) => { const r = canvas.getBoundingClientRect(); return new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); };
canvas.addEventListener('pointerdown', (e) => {
  if (state.cam === 'driver') return;
  ray.setFromCamera(ndc(e), camera);
  const { body, cabin, roof } = learnerMesh.userData;
  const hit = ray.intersectObjects([body, cabin, roof], false)[0];
  const gp = new THREE.Vector3();
  ray.ray.intersectPlane(groundPlane, gp);
  // Touch-friendly: a press within about 2.6 m of the car also picks it up.
  if (!hit && Math.hypot(gp.x - vehicle.x, gp.z - vehicle.z) > 2.6) return;
  dragging = { id: e.pointerId, ox: vehicle.x - gp.x, oz: vehicle.z - gp.z };
  controls.enabled = false;
  canvas.setPointerCapture(e.pointerId);
  vehicle.v = 0;
  e.preventDefault();
});
canvas.addEventListener('pointermove', (e) => {
  if (!dragging || e.pointerId !== dragging.id) return;
  ray.setFromCamera(ndc(e), camera);
  const gp = new THREE.Vector3();
  if (ray.ray.intersectPlane(groundPlane, gp)) { vehicle.x = gp.x + dragging.ox; vehicle.z = gp.z + dragging.oz; }
});
const endDrag = (e) => { if (dragging && e.pointerId === dragging.id) { dragging = null; controls.enabled = state.cam === 'orbit'; } };
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);

/* ---------- Loop ---------- */
const clock = new THREE.Clock();
let snapCamera = true;
const camTarget = new THREE.Vector3();
const lookTarget = new THREE.Vector3();
const local = (x, y, z) => new THREE.Vector3(x, y, z).applyQuaternion(learnerMesh.quaternion).add(learnerMesh.position);
let lastCar = new THREE.Vector3();

function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  fitToCanvas(renderer, camera);

  const input = keys.any ? { throttle: keys.throttle, steer: keys.steer } : { throttle: joy.active ? joy.y : 0, steer: joy.active ? joy.x : 0 };
  if (!dragging) vehicle.update(dt, input);
  learnerMesh.position.set(vehicle.x, 0, vehicle.z);
  learnerMesh.rotation.y = vehicle.h;
  steerWheels(learnerMesh, vehicle.steer);
  setCarLights(learnerMesh, { signal: state.signal, braking: vehicle.braking, time: t });
  overlays.blind.userData.pulse?.(t);
  const inside = state.cam === 'driver';
  learnerMesh.userData.roof.visible = !inside;
  if (learnerMesh.userData.sign) learnerMesh.userData.sign.visible = !inside;
  for (const tr of traffic) tr.update(dt, state.lights, vehicle);

  // Camera presets.
  const k = snapCamera ? 1 : 1 - Math.pow(0.0005, dt);
  if (state.cam === 'overhead') {
    camera.up.set(0, 0, -1);
    const ahead = local(0, 0, 9);
    camTarget.set(ahead.x, 46, ahead.z + 0.01);
    lookTarget.set(ahead.x, 0, ahead.z);
  } else if (state.cam === 'driver') {
    camera.up.set(0, 1, 0);
    camTarget.copy(local(-0.38, 1.2, -0.2));
    lookTarget.copy(local(-0.38, 1.0, 20));
  } else if (state.cam === 'rear') {
    camera.up.set(0, 1, 0);
    camTarget.copy(local(3.6, 3.6, -8.5));
    lookTarget.copy(local(0, 0.6, 6));
  }
  if (state.cam === 'orbit') {
    const delta = learnerMesh.position.clone().sub(lastCar);
    camera.position.add(delta);
    controls.target.add(delta);
    if (snapCamera) { camera.position.set(vehicle.x + 14, 12, vehicle.z + 14); controls.target.set(vehicle.x, 0.5, vehicle.z); }
    controls.update();
  } else {
    const fast = state.cam === 'driver' ? 1 : k;
    camera.position.lerp(camTarget, fast);
    if (snapCamera || state.cam === 'driver') camera._look = lookTarget.clone();
    camera._look = (camera._look || lookTarget.clone()).lerp(lookTarget, fast);
    camera.lookAt(camera._look);
  }
  camera.fov = state.cam === 'driver' ? 70 : 50;
  camera.updateProjectionMatrix();
  snapCamera = false;
  lastCar.copy(learnerMesh.position);

  // HUD.
  hud.speed.textContent = Math.round(vehicle.mph);
  hud.gear.textContent = Math.abs(vehicle.v) < 0.05 ? 'N' : vehicle.v > 0 ? 'D' : 'R';
  const wheelDeg = (vehicle.steer / MAX_STEER) * 540; // 1.5 turns lock to lock each way
  hud.wheel.style.transform = `rotate(${-wheelDeg}deg)`;
  const turns = Math.abs(wheelDeg / 360);
  hud.turns.textContent = turns < 0.05 ? 'Straight' : `${turns.toFixed(1)} turn${turns >= 0.95 ? 's' : ''} ${wheelDeg > 0 ? 'left' : 'right'}`;

  renderer.render(scene, camera);
}
const hud = { speed: $('[data-speed]'), gear: $('[data-gear]'), wheel: $('[data-wheel]'), turns: $('[data-turns]') };

/* ---------- Start ---------- */
setLang(savedLang()).then(() => { langSel.value = lang(); });
renderGuides();
buildScene(state.env);
setCam(state.cam);
$('[data-loading]').hidden = true;
renderer.setAnimationLoop(frame);
const hashGuide = location.hash.slice(1);
if (hashGuide) { const g = GUIDES.find((x) => x.id === hashGuide); if (g) applyGuide(g); }
