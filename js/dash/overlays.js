// Teaching overlays attached to the learner car (car-local coordinates: forward +z, left +x, right-hand drive).
import * as THREE from '../../vendor/three.module.min.js';

const Y = 0.07;
const flat = (pts, color, opacity, y = Y) => {
  const shape = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
  const geo = new THREE.ShapeGeometry(shape);
  geo.rotateX(-Math.PI / 2); // shape (x, y) -> world (x, -y as z) so we pass -z above
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide }));
  m.position.y = y;
  m.renderOrder = 2;
  return m;
};

const outline = (pts, color, y = Y + 0.01) => {
  const g = new THREE.BufferGeometry().setFromPoints([...pts, pts[0]].map(([x, z]) => new THREE.Vector3(x, y, z)));
  return new THREE.Line(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 }));
};

// Wedge from apex, centred on angle a (radians, 0 = backwards -z, positive = towards +x), half-width w, length len.
function wedge(apex, a, w, len, color, opacity) {
  const pts = [apex];
  for (let i = 0; i <= 8; i++) {
    const ang = a - w + (2 * w * i) / 8;
    pts.push([apex[0] + Math.sin(ang) * len, apex[1] - Math.cos(ang) * len]);
  }
  const g = new THREE.Group();
  g.add(flat(pts, color, opacity), outline(pts, color));
  return g;
}

export function mirrorCones() {
  const g = new THREE.Group();
  g.add(wedge([0, -2.05], 0, THREE.MathUtils.degToRad(11), 32, 0x3fa9ff, 0.2)); // interior mirror
  g.add(wedge([0.98, 0.85], THREE.MathUtils.degToRad(12), THREE.MathUtils.degToRad(8), 26, 0x2fe0c8, 0.22)); // left door mirror
  g.add(wedge([-0.98, 0.85], THREE.MathUtils.degToRad(-12), THREE.MathUtils.degToRad(8), 26, 0xa48bff, 0.22)); // right door mirror
  return g;
}

export function blindSpots() {
  const g = new THREE.Group();
  const zones = [
    // Rear quarter blind spots: outside the door-mirror view, beside and behind the car.
    [[1.0, 0.4], [4.2, -0.6], [4.2, -6.5], [1.3, -2.4]],
    [[-1.0, 0.4], [-4.2, -0.6], [-4.2, -6.5], [-1.3, -2.4]],
  ];
  const mats = [];
  for (const z of zones) {
    const m = flat(z, 0xff3b2a, 0.38);
    mats.push(m.material);
    g.add(m, outline(z, 0xff6a4a));
  }
  // A-pillar blind spots ahead of each front corner.
  for (const s of [1, -1]) {
    const pts = [[s * 0.8, 1.0], [s * 4.8, 11], [s * 7.2, 9.6]];
    const m = flat(pts, 0xffa21a, 0.32);
    mats.push(m.material);
    g.add(m, outline(pts, 0xffb84a));
  }
  g.userData.pulse = (t) => { for (const m of mats) m.opacity = 0.26 + Math.sin(t * 3) * 0.1; };
  return g;
}

function dashedLine(g, x1, z1, x2, z2, color, w = 0.09, dash = 0.6, gap = 0.4) {
  const len = Math.hypot(x2 - x1, z2 - z1);
  const ux = (x2 - x1) / len, uz = (z2 - z1) / len;
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95, depthWrite: false });
  const geo = new THREE.PlaneGeometry(w, dash);
  geo.rotateX(-Math.PI / 2);
  const rot = Math.atan2(ux, uz);
  for (let s = 0; s < len; s += dash + gap) {
    const m = new THREE.Mesh(geo, mat);
    const c = s + dash / 2;
    m.position.set(x1 + ux * c, Y + 0.02, z1 + uz * c);
    m.rotation.y = rot;
    m.renderOrder = 3;
    g.add(m);
  }
}

export function referenceLines() {
  const g = new THREE.Group();
  const neon = 0xfff200;
  dashedLine(g, -7, -1.3, 7, -1.3, neon, 0.12); // rear axle line
  dashedLine(g, -7, -0.15, 7, -0.15, 0xffd000, 0.09); // B-pillar line
  dashedLine(g, 0.82, 1.6, 0.82, 10, neon); // front wheel tracks forward
  dashedLine(g, -0.82, 1.6, -0.82, 10, neon);
  dashedLine(g, 0.9, -2.1, 0.9, -10, 0xfff8a0, 0.07); // car width behind
  dashedLine(g, -0.9, -2.1, -0.9, -10, 0xfff8a0, 0.07);
  // Glowing markers on the B-pillars and rear wheels.
  const dot = new THREE.MeshBasicMaterial({ color: neon });
  for (const [x, y, z] of [[0.9, 1.0, -0.15], [-0.9, 1.0, -0.15], [0.95, 0.33, -1.3], [-0.95, 0.33, -1.3]]) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), dot);
    s.position.set(x, y, z);
    g.add(s);
  }
  return g;
}

// Ideal path ribbon with chevrons, in world coordinates.
export function idealPath(points, { reverse = false } = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal');
  const g = new THREE.Group();
  const n = Math.max(20, Math.floor(curve.getLength() * 2));
  const pos = [], idx = [];
  const w = 0.35;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const p = curve.getPointAt(u), t = curve.getTangentAt(u);
    const lx = t.z, lz = -t.x;
    pos.push(p.x + lx * w, Y + 0.03, p.z + lz * w, p.x - lx * w, Y + 0.03, p.z - lz * w);
    if (i < n) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  const color = reverse ? 0x9dff5a : 0x2bff88;
  const ribbon = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide }));
  ribbon.renderOrder = 2;
  g.add(ribbon);
  const chev = new THREE.Shape([new THREE.Vector2(-0.7, -0.35), new THREE.Vector2(0, 0.45), new THREE.Vector2(0.7, -0.35), new THREE.Vector2(0, -0.05)]);
  const chevGeo = new THREE.ShapeGeometry(chev);
  chevGeo.rotateX(-Math.PI / 2); // shape +y now points to -z
  chevGeo.rotateY(Math.PI); // point to +z so lookAt-style rotation works
  const chevMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95, depthWrite: false, side: THREE.DoubleSide });
  const L = curve.getLength();
  for (let s = 1.5; s < L - 0.5; s += 2.5) {
    const u = s / L;
    const p = curve.getPointAt(u), t = curve.getTangentAt(u);
    const m = new THREE.Mesh(chevGeo, chevMat);
    m.position.set(p.x, Y + 0.05, p.z);
    m.rotation.y = Math.atan2(t.x, t.z);
    m.renderOrder = 3;
    g.add(m);
  }
  return g;
}
