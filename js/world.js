// Shared low-poly building blocks for the 3D scenes.
// Units are metres. Cars are built facing +z; Object3D.lookAt() aims +z at a target.
import * as THREE from 'three';

export const PALETTE = {
  grass: 0x6f8f4e,
  grassDark: 0x58753d,
  asphalt: 0x3a3d42,
  pavement: 0xb9b2a5,
  marking: 0xf3f0e8,
  yellow: 0xf2c230,
  learner: 0xe8e4da,
  others: [0x2f6fb0, 0xc0432f, 0x3c8a5c, 0x7a5aa6, 0x2b2f36, 0xd08a2c],
  house: [0xc9b79c, 0xb07a5a, 0xd7cfc0, 0x9c8f80, 0xc4a484],
  roof: [0x5b4a42, 0x6b3f33, 0x474b52],
};

const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.05, ...extra });

export function makeLights(scene, { sunPos = [30, 50, 20], shadowSize = 60 } = {}) {
  scene.add(new THREE.HemisphereLight(0xdfe9ff, 0x4a5a3a, 1.1));
  const sun = new THREE.DirectionalLight(0xfff1dc, 2.1);
  sun.position.set(...sunPos);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const c = sun.shadow.camera;
  c.left = c.bottom = -shadowSize;
  c.right = c.top = shadowSize;
  c.near = 1;
  c.far = 200;
  sun.shadow.bias = -0.0005;
  scene.add(sun);
  return sun;
}

export function ground(size = 240, color = PALETTE.grass) {
  const g = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat(color));
  g.rotation.x = -Math.PI / 2;
  g.receiveShadow = true;
  return g;
}

// A flat rectangle lying on the ground, centred at (x, z), sized w (x) by d (z).
export function slab(x, z, w, d, color, y = 0.01) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat(color));
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, y, z);
  m.receiveShadow = true;
  return m;
}

// Straight road segment with pavements. axis 'x' or 'z'. from/to along that axis, centre on the other.
export function road(group, { axis = 'z', from, to, centre = 0, width = 6, pavement = 2.2, centreLine = true }) {
  const len = Math.abs(to - from);
  const mid = (from + to) / 2;
  const along = (a, b, w, d, color, y) => axis === 'z' ? slab(b, a, w, d, color, y) : slab(a, b, d, w, color, y);
  group.add(along(mid, centre, width, len, PALETTE.asphalt, 0.02));
  if (pavement) {
    group.add(along(mid, centre - width / 2 - pavement / 2, pavement, len, PALETTE.pavement, 0.05));
    group.add(along(mid, centre + width / 2 + pavement / 2, pavement, len, PALETTE.pavement, 0.05));
  }
  if (centreLine) {
    const start = Math.min(from, to);
    for (let p = start + 1; p < start + len - 1; p += 6) {
      group.add(along(p + 1.5, centre, 0.15, 3, PALETTE.marking, 0.03));
    }
  }
}

// Double dashed give way line across a road end.
export function giveWayLine(group, { axis = 'z', at, centre = 0, width = 3, offset = 0 }) {
  for (const k of [0, 0.45]) {
    for (let s = -width / 2 + 0.3; s < width / 2; s += 0.9) {
      const a = at + (axis === 'z' ? k : -k);
      const m = axis === 'z'
        ? slab(centre + offset + s, a, 0.55, 0.2, PALETTE.marking, 0.035)
        : slab(a, centre + offset + s, 0.2, 0.55, PALETTE.marking, 0.035);
      group.add(m);
    }
  }
}

export function tree(x, z, s = 1) {
  const t = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15 * s, 0.2 * s, 1.4 * s, 6), mat(0x6b4f36));
  trunk.position.y = 0.7 * s;
  const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1 * s, 0), mat(Math.random() > 0.5 ? PALETTE.grassDark : 0x4f6b35, { flatShading: true }));
  crown.position.y = 2.1 * s;
  for (const m of [trunk, crown]) { m.castShadow = true; t.add(m); }
  t.position.set(x, 0, z);
  return t;
}

export function house(x, z, rotY = 0, rnd = Math.random) {
  const h = new THREE.Group();
  const w = 5 + rnd() * 2, d = 6, ht = 4 + rnd() * 1.5;
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, ht, d), mat(PALETTE.house[Math.floor(rnd() * PALETTE.house.length)]));
  body.position.y = ht / 2;
  const roofGeo = new THREE.ConeGeometry(Math.max(w, d) * 0.75, 2, 4);
  roofGeo.rotateY(Math.PI / 4);
  const roof = new THREE.Mesh(roofGeo, mat(PALETTE.roof[Math.floor(rnd() * PALETTE.roof.length)], { flatShading: true }));
  roof.scale.set(w / Math.max(w, d), 1, d / Math.max(w, d));
  roof.position.y = ht + 1;
  for (const m of [body, roof]) { m.castShadow = true; m.receiveShadow = true; h.add(m); }
  h.position.set(x, 0, z);
  h.rotation.y = rotY;
  return h;
}

// Seeded random so scenes look the same every load.
export function seeded(seed = 7) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

const wheelGeo = new THREE.CylinderGeometry(0.33, 0.33, 0.24, 14);
wheelGeo.rotateZ(Math.PI / 2);

export function car(color, { learner = false } = {}) {
  const g = new THREE.Group();
  const paint = mat(color, { roughness: 0.45, metalness: 0.25 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.6, 4.1), paint);
  body.position.y = 0.6;
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.55, 2.1), mat(0x23272e, { roughness: 0.2, metalness: 0.4 }));
  cabin.position.set(0, 1.17, -0.25);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 1.9), paint);
  roof.position.set(0, 1.48, -0.25);
  for (const m of [body, cabin, roof]) { m.castShadow = true; g.add(m); }

  const tyre = mat(0x16181b);
  for (const [x, z] of [[0.82, 1.3], [-0.82, 1.3], [0.82, -1.3], [-0.82, -1.3]]) {
    const w = new THREE.Mesh(wheelGeo, tyre);
    w.position.set(x, 0.33, z);
    w.castShadow = true;
    g.add(w);
  }

  // Lights. Car faces +z, so its left side is +x.
  const head = mat(0xfff6d8, { emissive: 0xfff2c0, emissiveIntensity: 0.4 });
  for (const x of [0.6, -0.6]) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.14, 0.05), head);
    l.position.set(x, 0.72, 2.06);
    g.add(l);
  }
  const brakeMat = mat(0x5a0f0f, { emissive: 0xff2222, emissiveIntensity: 0.15 });
  for (const x of [0.6, -0.6]) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.14, 0.05), brakeMat);
    l.position.set(x, 0.72, -2.06);
    g.add(l);
  }
  const indicators = { left: [], right: [] };
  for (const side of ['left', 'right']) {
    const x = side === 'left' ? 0.84 : -0.84;
    for (const z of [2.0, -2.0]) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), mat(0x6b4a12, { emissive: 0xffa21a, emissiveIntensity: 0 }));
      m.position.set(x, 0.75, z);
      g.add(m);
      indicators[side].push(m);
    }
  }

  if (learner) {
    const plateTex = learnerPlateTexture();
    const pm = new THREE.MeshBasicMaterial({ map: plateTex });
    for (const z of [2.08, -2.08]) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.42), pm);
      p.position.set(0, 0.62, z);
      if (z < 0) p.rotation.y = Math.PI;
      g.add(p);
    }
    const sign = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 0.3), mat(0xf2c230));
    sign.position.set(0, 1.62, -0.25);
    g.add(sign);
  }

  g.userData = { indicators, brakeMat };
  return g;
}

let _plate;
function learnerPlateTexture() {
  if (_plate) return _plate;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, 64, 64);
  x.fillStyle = '#d0021b'; x.font = 'bold 52px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText('L', 32, 35);
  _plate = new THREE.CanvasTexture(c);
  _plate.colorSpace = THREE.SRGBColorSpace;
  return _plate;
}

// Indicator and brake light state. signal: 'left' | 'right' | null.
export function setCarLights(c, { signal = null, braking = false, time = 0 }) {
  const on = Math.floor(time * 2.6) % 2 === 0;
  for (const side of ['left', 'right']) {
    for (const m of c.userData.indicators[side]) {
      m.material.emissiveIntensity = signal === side && on ? 2.4 : 0;
    }
  }
  c.userData.brakeMat.emissiveIntensity = braking ? 1.6 : 0.15;
}

export function makeRenderer(canvas) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.0;
  return r;
}

// Keep a renderer + camera sized to its canvas's CSS box.
export function fitToCanvas(renderer, camera) {
  const canvas = renderer.domElement;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  if (canvas.width !== Math.floor(w * renderer.getPixelRatio()) || canvas.height !== Math.floor(h * renderer.getPixelRatio())) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
}
