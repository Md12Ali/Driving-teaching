// Cockpit & blind spot simulator: a right-hand-drive car parked at the left kerb, ready to move off.
// Car faces +z; its left is +x. The driver sits on the right (-x).
import * as THREE from '../vendor/three.module.min.js';
import { PALETTE, makeLights, ground, road, house, tree, seeded, car, person, cyclist, makeRenderer, fitToCanvas, setCarLights } from './world.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const canvas = $('[data-view]');
let renderer;
try { renderer = makeRenderer(canvas); } catch (err) {
  $('[data-loading]').hidden = true; $('[data-no3d]').hidden = false; throw err;
}
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfd6e3);
scene.fog = new THREE.Fog(0xbfd6e3, 60, 170);
makeLights(scene, { sunPos: [-30, 45, 25], shadowSize: 40 });
scene.add(ground(400));

/* ---------- Street ---------- */
const world = new THREE.Group();
road(world, { axis: 'z', from: -150, to: 150, width: 8 });
const rnd = seeded(77);
for (let z = -90; z < 90; z += 9) { world.add(house(12, z, -Math.PI / 2, rnd)); world.add(house(-12, z, Math.PI / 2, rnd)); }
for (let z = -80; z < 80; z += 14) { world.add(tree(6.4, z + 4, 0.9)); world.add(tree(-6.4, z + 9, 0.9)); }
const parkedAhead = car(PALETTE.others[4]); parkedAhead.position.set(2.9, 0, 9.5); world.add(parkedAhead);
const parkedBehind = car(PALETTE.others[2]); parkedBehind.position.set(2.9, 0, -9); world.add(parkedBehind);
scene.add(world);

/* ---------- The car and its interior ---------- */
const CAR_X = 2.9;
const carG = new THREE.Group();
carG.position.set(CAR_X, 0, 0);
scene.add(carG);
const m = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8, ...o });
const trim = m(0x2a2e34), dark = m(0x1c1f23), fabric = m(0x3b4048), paint = m(PALETTE.learner, { roughness: 0.45, metalness: 0.2 });
const box = (w, h, d, mat, x, y, z, rx = 0) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); b.position.set(x, y, z); b.rotation.x = rx; b.castShadow = true; carG.add(b); return b; };

// Body shell (seen from inside and in the door mirrors).
box(1.76, 0.42, 4.1, paint, 0, 0.55, 0);            // lower body
box(1.7, 0.12, 1.4, paint, 0, 0.82, 1.35);           // bonnet
box(1.7, 0.12, 0.7, paint, 0, 0.82, -1.72);          // boot
// Thin pillar between two car-local points.
const pillar = (a, b, r, mat) => {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, A.distanceTo(B), 8), mat);
  mesh.position.copy(A).add(B).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  carG.add(mesh);
  return mesh;
};
for (const s of [1, -1]) {
  box(0.06, 0.5, 2.6, trim, s * 0.86, 0.72, -0.4);          // door panels up to the window line
  pillar([s * 0.76, 0.98, 0.68], [s * 0.66, 1.42, 0.16], 0.045, dark); // A-pillars
  box(0.1, 0.46, 0.16, dark, s * 0.8, 1.2, -0.78);          // B-pillars (behind the driver's shoulder)
  pillar([s * 0.78, 0.98, -1.75], [s * 0.68, 1.42, -1.3], 0.09, dark); // C-pillars
}
box(1.5, 0.05, 2.0, m(0x8d9097), 0, 1.44, -0.62);   // roof lining
box(1.6, 0.2, 0.5, dark, 0, 0.9, 0.78);             // dashboard
box(1.2, 0.3, 0.12, fabric, 0, 0.68, -1.25);        // rear seat back
box(0.5, 0.5, 0.12, fabric, 0.38, 0.88, -0.6);      // passenger seat back
box(0.5, 0.5, 0.12, fabric, -0.38, 0.88, -0.6);     // driver seat back (seen when turning round)
const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.022, 10, 36), m(0x15171a));
wheel.position.set(-0.38, 0.98, 0.32); wheel.rotation.x = -0.35; carG.add(wheel);
const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 16), m(0x15171a));
hub.rotation.x = Math.PI / 2 - 0.35; hub.position.copy(wheel.position); carG.add(hub);

// Mirrors render the world from their own cameras.
function makeMirror({ w, h, pos, look, fov, housing }) {
  const rt = new THREE.WebGLRenderTarget(512, Math.round(512 * h / w));
  rt.texture.colorSpace = THREE.SRGBColorSpace;
  rt.texture.wrapS = THREE.RepeatWrapping;
  rt.texture.repeat.x = -1; // mirror image
  rt.texture.offset.x = 1;
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: rt.texture }));
  glass.position.set(...pos);
  glass.rotation.y = Math.PI; // face the driver (towards -z)
  carG.add(glass);
  if (housing) {
    const hsg = new THREE.Mesh(new THREE.BoxGeometry(w + 0.04, h + 0.04, 0.08), paint);
    hsg.position.set(pos[0], pos[1], pos[2] + 0.045);
    carG.add(hsg);
  }
  const cam = new THREE.PerspectiveCamera(fov, w / h, 0.1, 300);
  carG.add(cam);
  cam.position.set(pos[0], pos[1], pos[2] - 0.02);
  cam.lookAt(carG.localToWorld(new THREE.Vector3(...look)));
  return { rt, cam, glass };
}
carG.updateMatrixWorld(true);
const mirrors = {
  interior: makeMirror({ w: 0.27, h: 0.075, pos: [0, 1.32, 0.36], look: [0, 1.1, -20], fov: 16 }),
  left: makeMirror({ w: 0.2, h: 0.13, pos: [1.02, 1.02, 0.52], look: [3.2, 0.9, -20], fov: 22, housing: true }),
  right: makeMirror({ w: 0.2, h: 0.13, pos: [-1.02, 1.02, 0.52], look: [-3.2, 0.9, -20], fov: 22, housing: true }),
};
// The mirror cameras must not see the glass they render to.
for (const mi of Object.values(mirrors)) mi.glass.layers.set(1);

/* ---------- Driver's view and the 6-point check ---------- */
const camera = new THREE.PerspectiveCamera(72, 1, 0.03, 400);
camera.layers.enable(1);
const HEAD = new THREE.Vector3(-0.38, 1.2, -0.25);
const STEPS = [
  { key: 'lbs', n: 1, name: 'Left blind spot', look: [3.5, 0.95, -3.0], head: [-0.3, 1.2, -0.2], fov: 72, text: 'Look over your left shoulder through the rear side window. Is anyone on the pavement or close behind on the left?' },
  { key: 'lm', n: 2, name: 'Left mirror', look: [1.02, 1.02, 0.52], fov: 30, text: 'Left door mirror: the kerb side. Watch for cyclists, people and cars behind on the left.' },
  { key: 'im', n: 3, name: 'Interior mirror', look: [0, 1.32, 0.36], fov: 26, text: 'Interior mirror: the whole road behind you. What is coming, and how fast?' },
  { key: 'ahead', n: 4, name: 'Ahead', look: [-0.38, 1.05, 25], fov: 72, text: 'Look ahead: parked cars, people crossing, traffic coming towards you.' },
  { key: 'rm', n: 5, name: 'Right mirror', look: [-1.02, 1.02, 0.52], fov: 30, text: 'Right door mirror: traffic coming up on your right as you pull out.' },
  { key: 'rbs', n: 6, name: 'Right blind spot', look: [-4.0, 0.95, -2.6], head: [-0.48, 1.2, -0.18], fov: 72, text: 'Last look over your right shoulder, just before moving. Anyone the mirror cannot show? Only move if it is safe.' },
];
$('[data-steps]').innerHTML = STEPS.map((s) => `<li><button data-step="${s.key}" aria-pressed="false"><b>${s.n}</b><span>${s.name}</span></button></li>`).join('');

const view = { q: new THREE.Quaternion(), fov: 72, head: HEAD.clone() };
const target = { q: new THREE.Quaternion(), fov: 72, head: HEAD.clone() };
function aim(localLook, headLocal = HEAD) {
  const eye = carG.localToWorld(new THREE.Vector3(...(Array.isArray(headLocal) ? headLocal : headLocal.toArray())));
  const at = carG.localToWorld(new THREE.Vector3(...localLook));
  const mtx = new THREE.Matrix4().lookAt(eye, at, new THREE.Vector3(0, 1, 0));
  return { q: new THREE.Quaternion().setFromRotationMatrix(mtx), eye };
}
let current = 'ahead';
function goStep(key, { quiet = false } = {}) {
  const s = STEPS.find((x) => x.key === key);
  current = key;
  const { q, eye } = aim(s.look, s.head || HEAD);
  target.q.copy(q); target.fov = s.fov; target.head.copy(eye);
  $$('[data-step]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.step === key)));
  if (!quiet) $('[data-caption]').innerHTML = `<b>${s.n}. ${s.name}.</b> ${s.text}`;
  freeLook = false; $('[data-free]').setAttribute('aria-pressed', 'false');
}
$('[data-steps]').addEventListener('click', (e) => { const b = e.target.closest('[data-step]'); if (b) { stopPlay(); goStep(b.dataset.step); } });

let playTimer = null;
function stopPlay() { clearTimeout(playTimer); playTimer = null; $('[data-play]').classList.remove('is-playing'); }
$('[data-play]').addEventListener('click', () => {
  if (playTimer) { stopPlay(); return; }
  $('[data-play]').classList.add('is-playing');
  let i = 0;
  const next = () => {
    goStep(STEPS[i].key);
    i += 1;
    playTimer = i < STEPS.length ? setTimeout(next, 2600) : setTimeout(() => { stopPlay(); $('[data-caption]').innerHTML = '<b>Done.</b> If everything is clear: handbrake off and move off slowly. Signal only if it helps someone.'; }, 2600);
  };
  next();
});

// Free look by dragging.
let freeLook = false, drag = null, yaw = 0, pitch = 0;
$('[data-free]').addEventListener('click', (e) => {
  freeLook = !freeLook;
  e.currentTarget.setAttribute('aria-pressed', String(freeLook));
  if (freeLook) {
    const eul = new THREE.Euler().setFromQuaternion(view.q, 'YXZ');
    yaw = eul.y; pitch = eul.x;
    $$('[data-step]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
    $('[data-caption]').innerHTML = '<b>Free look.</b> Drag to look around the car.';
  }
});
canvas.addEventListener('pointerdown', (e) => {
  if (!freeLook) { freeLook = true; $('[data-free]').setAttribute('aria-pressed', 'true'); const eul = new THREE.Euler().setFromQuaternion(view.q, 'YXZ'); yaw = eul.y; pitch = eul.x; target.fov = 72; target.head.copy(carG.localToWorld(HEAD.clone())); }
  drag = { x: e.clientX, y: e.clientY, id: e.pointerId };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag || e.pointerId !== drag.id) return;
  yaw += (e.clientX - drag.x) * 0.006;
  pitch = THREE.MathUtils.clamp(pitch + (e.clientY - drag.y) * 0.004, -0.8, 0.6);
  drag.x = e.clientX; drag.y = e.clientY;
});
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('pointercancel', () => { drag = null; });

/* ---------- Hazards ---------- */
const HAZ = [
  { key: 'ped', name: 'Pedestrian on the pavement', where: 'left blind spot', make: () => person(0xd63a2f), place: (t) => [5.0, 0, -3.2 + Math.sin(t * 0.5) * 1.2, Math.cos(t * 0.5) > 0 ? 0 : Math.PI] },
  { key: 'cyc', name: 'Cyclist coming up behind', where: 'right blind spot', make: () => cyclist(0x1d5fae), place: (t) => { const z = -14 + ((t * 2.2) % 13); return [1.5, 0, z, 0]; } },
  { key: 'car', name: 'Car approaching from behind', where: 'interior and right mirrors', make: () => car(PALETTE.others[1]), place: (t) => { const z = -55 + ((t * 5) % 40); return [1.2, 0, z, 0]; } },
  { key: 'van', name: 'Oncoming car ahead', where: 'ahead', make: () => car(PALETTE.others[0]), place: (t) => { const z = 60 - ((t * 7) % 110); return [-2, 0, z, Math.PI]; } },
  { key: 'child', name: 'Child behind the car', where: 'interior mirror and over the shoulder', make: () => { const p = person(0xf2c230); p.scale.setScalar(0.62); return p; }, place: (t) => [2.9 + Math.sin(t * 0.8) * 0.4, 0, -3.1, 0] },
];
const hzState = Object.fromEntries(HAZ.map((h) => [h.key, ['ped', 'cyc', 'car'].includes(h.key)]));
for (const h of HAZ) { h.obj = h.make(); scene.add(h.obj); h.label = document.createElement('div'); h.label.className = 'hz-label'; h.label.textContent = h.name; $('[data-labels]').append(h.label); }
let showLabels = true, testActive = false;

function renderHz() {
  $('[data-hz-list]').innerHTML = HAZ.map((h) => `
    <button class="tog hz" data-hz="${h.key}" aria-pressed="${hzState[h.key]}" ${testActive ? 'disabled' : ''}>
      <span><b>${testActive ? '?' : h.name}</b><small>${testActive ? 'hidden during test' : h.where}</small></span></button>`).join('');
}
$('[data-hz-list]').addEventListener('click', (e) => {
  const b = e.target.closest('[data-hz]');
  if (!b || testActive) return;
  hzState[b.dataset.hz] = !hzState[b.dataset.hz];
  renderHz();
});
$('[data-hz-all]').addEventListener('click', () => { if (testActive) return; const all = !HAZ.every((h) => hzState[h.key]); HAZ.forEach((h) => { hzState[h.key] = all; }); renderHz(); });
$('[data-labels-toggle]').addEventListener('click', (e) => { showLabels = !showLabels; e.currentTarget.setAttribute('aria-pressed', String(showLabels)); });
$('[data-test]').addEventListener('click', () => {
  testActive = true;
  const keys = HAZ.map((h) => h.key).sort(() => Math.random() - 0.5);
  const n = 1 + Math.floor(Math.random() * 3);
  HAZ.forEach((h) => { hzState[h.key] = keys.slice(0, n).includes(h.key); });
  $('[data-reveal]').disabled = false;
  renderHz();
  stopPlay(); goStep('ahead');
  $('[data-caption]').innerHTML = '<b>Test.</b> Do the 6-point check (tap Play or each step). What can you see? Then tap Reveal.';
});
$('[data-reveal]').addEventListener('click', () => {
  testActive = false;
  $('[data-reveal]').disabled = true;
  const on = HAZ.filter((h) => hzState[h.key]);
  $('[data-caption]').innerHTML = `<b>Hazards in this test (${on.length}):</b> ${on.map((h) => `${h.name} (${h.where})`).join('; ')}.`;
  renderHz();
});
$('[data-tools-toggle]').addEventListener('click', (e) => {
  const open = $('[data-tools]').classList.toggle('is-collapsed') === false;
  e.currentTarget.setAttribute('aria-expanded', String(open));
});
if (innerWidth < 900 || innerHeight < 520) { $('[data-tools]').classList.add('is-collapsed'); $('[data-tools-toggle]').setAttribute('aria-expanded', 'false'); }

/* ---------- Loop ---------- */
const clock = new THREE.Clock();
const tmp = new THREE.Vector3();
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  fitToCanvas(renderer, camera);

  for (const h of HAZ) {
    const [x, y, z, ry] = h.place(t);
    h.obj.position.set(x, y, z);
    h.obj.rotation.y = ry;
    h.obj.visible = hzState[h.key];
    if (h.obj.userData.indicators) setCarLights(h.obj, { time: t });
  }

  // Ease the head and gaze.
  const k = 1 - Math.pow(0.002, dt);
  if (freeLook) {
    target.q.setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
    view.q.copy(target.q);
  } else {
    view.q.slerp(target.q, k);
  }
  view.fov += (target.fov - view.fov) * k;
  view.head.lerp(target.head, k);
  camera.position.copy(view.head);
  camera.quaternion.copy(view.q);
  camera.fov = view.fov;
  camera.updateProjectionMatrix();

  // Mirrors (render at a lower rate on small screens).
  for (const mi of Object.values(mirrors)) {
    renderer.setRenderTarget(mi.rt);
    renderer.render(scene, mi.cam);
  }
  renderer.setRenderTarget(null);
  renderer.render(scene, camera);

  // Labels.
  const w = canvas.clientWidth, hgt = canvas.clientHeight;
  for (const h of HAZ) {
    const show = showLabels && !testActive && hzState[h.key];
    tmp.copy(h.obj.position); tmp.y += 2.1;
    tmp.project(camera);
    const vis = show && tmp.z < 1 && Math.abs(tmp.x) < 1.1 && Math.abs(tmp.y) < 1.1;
    h.label.style.display = vis ? 'block' : 'none';
    if (vis) h.label.style.transform = `translate(${(tmp.x * 0.5 + 0.5) * w}px, ${(-tmp.y * 0.5 + 0.5) * hgt}px) translate(-50%, -100%)`;
  }
}

renderHz();
const startAim = aim(STEPS[3].look);
view.q.copy(startAim.q); target.q.copy(startAim.q);
view.head.copy(startAim.eye); target.head.copy(startAim.eye);
goStep('ahead');
$('[data-caption]').innerHTML = '<b>Moving off from the kerb.</b> Tap Play to run the 6-point check, or tap each step. Turn hazards on and off on the right.';
$('[data-loading]').hidden = true;
renderer.setAnimationLoop(frame);
