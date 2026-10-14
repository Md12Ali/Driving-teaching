// Hero scene: a learner car driving a loop through a small low-poly town.
import * as THREE from '../vendor/three.module.min.js';
import { PALETTE, makeLights, ground, car, house, tree, seeded, setCarLights, makeRenderer, fitToCanvas } from './world.js';

const ROAD_W = 6.4;

function loopCurve() {
  const pts = [];
  const n = 14;
  const rnd = seeded(3);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = 34 + (rnd() - 0.5) * 16;
    pts.push(new THREE.Vector3(Math.cos(a) * r * 1.25, 0, Math.sin(a) * r));
  }
  return new THREE.CatmullRomCurve3(pts, true, 'centripetal');
}

function ribbon(curve, width, y, color, segments = 500) {
  const pos = [], idx = [];
  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    const p = curve.getPointAt(u % 1);
    const t = curve.getTangentAt(u % 1);
    const left = new THREE.Vector3(t.z, 0, -t.x).normalize();
    pos.push(p.x + left.x * width / 2, y, p.z + left.z * width / 2);
    pos.push(p.x - left.x * width / 2, y, p.z - left.z * width / 2);
    if (i < segments) {
      const a = i * 2;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color, roughness: 0.9, side: THREE.DoubleSide }));
  m.receiveShadow = true;
  return m;
}

export function startHero(canvas) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  const sky = 0xf1d9b8;
  scene.background = new THREE.Color(sky);
  scene.fog = new THREE.Fog(sky, 60, 190);
  const sun = makeLights(scene, { sunPos: [-60, 38, -40], shadowSize: 70 });
  sun.color.set(0xffd8a8);
  scene.add(ground(500, 0x7c9a55));

  const curve = loopCurve();
  scene.add(ribbon(curve, ROAD_W + 4, 0.015, PALETTE.pavement));
  scene.add(ribbon(curve, ROAD_W, 0.03, PALETTE.asphalt));

  // Centre line dashes.
  const dashGeo = new THREE.BoxGeometry(0.16, 0.02, 2.6);
  const dashMat = new THREE.MeshStandardMaterial({ color: PALETTE.marking });
  const len = curve.getLength();
  const dashes = new THREE.InstancedMesh(dashGeo, dashMat, Math.floor(len / 6));
  const m4 = new THREE.Object3D();
  for (let i = 0; i < dashes.count; i++) {
    const u = (i * 6) / len;
    const p = curve.getPointAt(u), t = curve.getTangentAt(u);
    m4.position.set(p.x, 0.045, p.z);
    m4.lookAt(p.x + t.x, 0.045, p.z + t.z);
    m4.updateMatrix();
    dashes.setMatrixAt(i, m4.matrix);
  }
  scene.add(dashes);

  // Town: houses and trees placed clear of the road.
  const samples = curve.getSpacedPoints(300);
  const clear = (x, z, r) => samples.every((p) => (p.x - x) ** 2 + (p.z - z) ** 2 > r * r);
  const rnd = seeded(19);
  for (let i = 0; i < 140; i++) {
    const a = rnd() * Math.PI * 2, r = 12 + rnd() * 80;
    const x = Math.cos(a) * r * 1.3, z = Math.sin(a) * r;
    const isHouse = rnd() < 0.45;
    if (!clear(x, z, isHouse ? 12.5 : 7)) continue;
    if (isHouse) {
      // Face the nearest road point.
      let near = samples[0], nd = Infinity;
      for (const p of samples) { const d = (p.x - x) ** 2 + (p.z - z) ** 2; if (d < nd) { nd = d; near = p; } }
      const hs = house(x, z, Math.atan2(near.x - x, near.z - z), rnd);
      scene.add(hs);
    } else {
      scene.add(tree(x, z, 0.9 + rnd() * 0.8));
    }
  }

  // Cars: learner on the left lane, others going both ways.
  const cars = [
    { mesh: car(PALETTE.learner, { learner: true }), u: 0, speed: 0.022, lane: 1.6, dir: 1 },
    { mesh: car(PALETTE.others[1]), u: 0.45, speed: 0.026, lane: 1.6, dir: 1 },
    { mesh: car(PALETTE.others[0]), u: 0.2, speed: 0.03, lane: 1.6, dir: -1 },
    { mesh: car(PALETTE.others[2]), u: 0.7, speed: 0.027, lane: 1.6, dir: -1 },
  ];
  for (const c of cars) scene.add(c.mesh);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 500);
  const pointer = new THREE.Vector2();
  window.addEventListener('pointermove', (e) => {
    pointer.set(e.clientX / window.innerWidth - 0.5, e.clientY / window.innerHeight - 0.5);
  }, { passive: true });

  let visible = true, t = 0;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }).observe(canvas);
  const clock = new THREE.Clock();
  const look = new THREE.Vector3();

  function place(c, time) {
    const u = (((c.u + c.dir * c.speed * time) % 1) + 1) % 1;
    const p = curve.getPointAt(u), tan = curve.getTangentAt(u).multiplyScalar(c.dir);
    // Drive on the left of the direction of travel.
    const left = new THREE.Vector3(tan.z, 0, -tan.x).normalize();
    c.mesh.position.set(p.x + left.x * c.lane, 0, p.z + left.z * c.lane);
    c.mesh.lookAt(c.mesh.position.x + tan.x, 0, c.mesh.position.z + tan.z);
    // Indicate briefly on the sharper parts of the loop for a bit of life.
    const ahead = curve.getTangentAt((u + c.dir * 0.03 + 1) % 1).multiplyScalar(c.dir);
    const turn = tan.x * ahead.z - tan.z * ahead.x;
    setCarLights(c.mesh, { signal: Math.abs(turn) > 0.25 ? (turn > 0 ? 'right' : 'left') : null, braking: false, time });
  }

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.1);
    if (!visible) return;
    if (!reduce) t += dt;
    fitToCanvas(renderer, camera);
    for (const c of cars) place(c, t);
    const narrow = canvas.clientWidth < 700;
    const a = t * 0.05 + 0.6;
    const R = narrow ? 92 : 72;
    camera.position.set(Math.cos(a) * R + pointer.x * 6, (narrow ? 46 : 32) - pointer.y * 4, Math.sin(a) * R * 0.85);
    look.lerp(cars[0].mesh.position, reduce ? 1 : 1 - Math.pow(0.05, dt));
    camera.lookAt(look.x * 0.6, 0, look.z * 0.6);
    renderer.render(scene, camera);
  }
  place(cars[0], 0);
  look.copy(cars[0].mesh.position);
  renderer.setAnimationLoop(frame);
}
