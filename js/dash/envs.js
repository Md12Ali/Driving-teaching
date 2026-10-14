// The five dashboard environments. UK roads: drive on the left. North is -z, east is +x.
// Headings: a car with heading h faces (sin h, cos h). North = PI, east = PI/2, south = 0, west = -PI/2.
import * as THREE from '../../vendor/three.module.min.js';
import { PALETTE, road, giveWayLine, house, tree, seeded, slab, car, trafficLight } from '../world.js';

const N = Math.PI, E = Math.PI / 2, S = 0, W = -Math.PI / 2;
const white = () => new THREE.MeshStandardMaterial({ color: PALETTE.marking, roughness: 0.8, side: THREE.DoubleSide });

// Thin painted line between two ground points.
function line(g, x1, z1, x2, z2, w = 0.12, y = 0.036) {
  const len = Math.hypot(x2 - x1, z2 - z1);
  const geo = new THREE.PlaneGeometry(w, len);
  geo.rotateX(-Math.PI / 2); // lies flat, length along z
  const m = new THREE.Mesh(geo, white());
  m.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
  m.rotation.y = Math.atan2(x2 - x1, z2 - z1);
  m.receiveShadow = true;
  g.add(m);
}

function dashed(g, x1, z1, x2, z2, dash = 2, gap = 2.5, w = 0.12) {
  const len = Math.hypot(x2 - x1, z2 - z1);
  const ux = (x2 - x1) / len, uz = (z2 - z1) / len;
  for (let s = 0; s < len; s += dash + gap) {
    const e = Math.min(s + dash, len);
    line(g, x1 + ux * s, z1 + uz * s, x1 + ux * e, z1 + uz * e, w);
  }
}

// Painted lane arrow at (x, z), pointing along heading h. bend: 0 ahead, 1 left, -1 right.
function laneArrow(g, x, z, h, bend = 0) {
  const shape = new THREE.Shape();
  shape.moveTo(-0.12, -2.2); shape.lineTo(0.12, -2.2); shape.lineTo(0.12, 0.3);
  shape.lineTo(0.42, 0.3); shape.lineTo(0, 1.4); shape.lineTo(-0.42, 0.3); shape.lineTo(-0.12, 0.3);
  shape.closePath();
  const m = new THREE.Mesh(new THREE.ShapeGeometry(shape), white());
  m.rotation.x = -Math.PI / 2; // shape +y becomes -z
  const holder = new THREE.Group();
  holder.add(m);
  // Shape points to -z after rotation; turn so it points along heading h, then bend it.
  holder.rotation.y = h + Math.PI + bend * 0.6;
  holder.position.set(x, 0.037, z);
  g.add(holder);
}

function parked(g, x, z, h, color) {
  const c = car(color);
  c.position.set(x, 0, z);
  c.rotation.y = h;
  g.add(c);
  return c;
}

function arcPts(r, a0, a1, step = 10) {
  const pts = [];
  const dir = Math.sign(a1 - a0);
  for (let a = a0; dir > 0 ? a <= a1 : a >= a1; a += step * dir) {
    const t = THREE.MathUtils.degToRad(a);
    pts.push([Math.cos(t) * r, Math.sin(t) * r]);
  }
  return pts;
}

function trees(g, rnd, n, avoid, spread = 150) {
  for (let i = 0; i < n; i++) {
    const x = (rnd() - 0.5) * spread, z = (rnd() - 0.5) * spread;
    if (!avoid(x, z)) g.add(tree(x, z, 0.8 + rnd() * 0.7));
  }
}

export const ENVS = {
  tjunction: {
    label: 'T-junction',
    short: 'A',
    spawn: { x: -1.75, z: 30, h: N },
    build(g) {
      const rnd = seeded(31);
      road(g, { axis: 'x', from: -120, to: 120, width: 7 });
      road(g, { axis: 'z', from: 3.5, to: 90, width: 7, centreLine: true });
      giveWayLine(g, { axis: 'z', at: 3.6, centre: 0, width: 3.5, offset: -1.75 });
      laneArrow(g, -1.75, 9, N, 0);
      parked(g, 12, -2.65, E, PALETTE.others[2]);
      parked(g, 17.5, -2.65, E, PALETTE.others[4]);
      parked(g, 2.65, 15, S, PALETTE.others[3]);
      parked(g, 2.65, 20.5, S, PALETTE.others[5]);
      for (let z = 14; z < 80; z += 9) { g.add(house(-11.5, z, Math.PI / 2, rnd)); g.add(house(11.5, z, -Math.PI / 2, rnd)); }
      for (let x = -60; x < 60; x += 10) g.add(house(x, -12, 0, rnd));
      trees(g, rnd, 50, (x, z) => Math.abs(z) < 18 || Math.abs(x) < 18);
    },
    paths: {
      right: { label: 'Turn right', points: [[-1.75, 26], [-1.75, 7], [-1.6, 3.5], [-0.9, 0.8], [0.9, -1.2], [4, -1.75], [18, -1.75]] },
      left: { label: 'Turn left', points: [[-1.75, 26], [-1.75, 7], [-2.1, 4.2], [-3.6, 2.3], [-6.5, 1.75], [-18, 1.75]] },
    },
    traffic: [
      { points: [[-120, -1.75], [120, -1.75]], speed: 9, color: PALETTE.others[0], offset: 0.2 },
      { points: [[120, 1.75], [-120, 1.75]], speed: 10, color: PALETTE.others[1], offset: 0.65 },
    ],
  },

  roundabout: {
    label: 'Roundabout',
    short: 'B',
    spawn: { x: -1.75, z: 45, h: N },
    build(g) {
      const rnd = seeded(41);
      const asphalt = new THREE.MeshStandardMaterial({ color: PALETTE.asphalt, roughness: 0.9 });
      const ring = new THREE.Mesh(new THREE.RingGeometry(7.8, 19.5, 80), asphalt);
      ring.rotation.x = -Math.PI / 2; ring.position.y = 0.025; ring.receiveShadow = true;
      g.add(ring);
      const island = new THREE.Mesh(new THREE.CylinderGeometry(7.8, 8, 0.25, 64), new THREE.MeshStandardMaterial({ color: PALETTE.grassDark }));
      island.position.y = 0.12; island.receiveShadow = true;
      g.add(island);
      g.add(tree(0, 0, 1.4), tree(3, 2, 1), tree(-2.5, -2.5, 1.1));
      // Lane divider on the circulating carriageway.
      const ringPts = arcPts(13.5, 0, 360, 4);
      for (let i = 0; i < ringPts.length - 1; i += 2) line(g, ...ringPts[i], ...ringPts[i + 1]);
      for (const [axis, sign] of [['z', 1], ['z', -1], ['x', 1], ['x', -1]]) {
        road(g, { axis, from: sign * 17, to: sign * 100, width: 14, centreLine: false });
        for (const off of [-3.5, 3.5]) {
          if (axis === 'z') dashed(g, off, sign * 20, off, sign * 100);
          else dashed(g, sign * 20, off, sign * 100, off);
        }
        if (axis === 'z') line(g, 0, sign * 19, 0, sign * 100, 0.14);
        else line(g, sign * 19, 0, sign * 100, 0, 0.14);
      }
      giveWayLine(g, { axis: 'z', at: 18.9, centre: 0, width: 7, offset: -3.5 });
      giveWayLine(g, { axis: 'z', at: -19.35, centre: 0, width: 7, offset: 3.5 });
      giveWayLine(g, { axis: 'x', at: 19.35, centre: 0, width: 7, offset: 3.5 });
      giveWayLine(g, { axis: 'x', at: -18.9, centre: 0, width: 7, offset: -3.5 });
      // Lane arrows on the south approach: left lane for left/ahead, right lane for right.
      laneArrow(g, -5.25, 28, N, 1); laneArrow(g, -5.25, 34, N, 0);
      laneArrow(g, -1.75, 31, N, -1);
      for (const s of [1, -1]) for (let p = 30; p < 90; p += 10) {
        g.add(house(-16 * s - (s > 0 ? 0 : 0), p * s, s > 0 ? Math.PI / 2 : Math.PI / 2, rnd));
        g.add(house(16 * s, p * s, -Math.PI / 2, rnd));
      }
      trees(g, rnd, 60, (x, z) => Math.hypot(x, z) < 26 || Math.abs(x) < 22 || Math.abs(z) < 12, 170);
    },
    paths: {
      right: { label: 'Right (3rd exit)', points: [[-1.75, 42], [-1.75, 24], [-1.9, 17], ...arcPts(11, 100, 350), [17, -1.75], [26, -1.75], [50, -1.75]] },
      ahead: { label: 'Ahead (2nd exit)', points: [[-5.25, 42], [-5.25, 24], [-5.6, 18], ...arcPts(16, 112, 250), [-5.25, -19], [-5.25, -28], [-5.25, -50]] },
      left: { label: 'Left (1st exit)', points: [[-5.25, 42], [-5.25, 24], [-5.8, 17.5], ...arcPts(16, 112, 160, 8), [-19, 5.25], [-28, 5.25], [-50, 5.25]] },
    },
    traffic: [
      { points: arcPts(16, 0, 360, 6), closed: true, speed: 8, color: PALETTE.others[2], offset: 0 },
      { points: [[5.25, -100], [5.25, -22], [5.6, -17], ...arcPts(16, -70, 70), [5.25, 20], [5.25, 100]], speed: 9, color: PALETTE.others[3], offset: 0.3 },
    ],
  },

  parallel: {
    label: 'Parallel park',
    short: 'C',
    spawn: { x: -0.3, z: -4.5, h: N },
    build(g) {
      const rnd = seeded(51);
      road(g, { axis: 'z', from: -120, to: 120, width: 8 });
      parked(g, -3.05, -4, N, PALETTE.others[0]); // target car
      parked(g, -3.05, 9.5, N, PALETTE.others[4]); // car behind the gap
      parked(g, -3.05, -10, N, PALETTE.others[5]);
      for (let z = -80; z < 80; z += 9) { g.add(house(-12, z, Math.PI / 2, rnd)); g.add(house(12, z, -Math.PI / 2, rnd)); }
      trees(g, rnd, 40, (x) => Math.abs(x) < 18);
    },
    paths: {
      park: { label: 'Reverse into the gap', reverse: true, points: [[-0.3, -4.5], [-0.3, -2], [-0.6, 0.2], [-1.6, 1.8], [-2.6, 3], [-3.0, 4.2], [-3.0, 4.6]] },
    },
    traffic: [
      { points: [[2, -120], [2, 120]], speed: 8, color: PALETTE.others[1], offset: 0.1 },
      { points: [[2, -120], [2, 120]], speed: 8, color: PALETTE.others[2], offset: 0.6 },
    ],
  },

  bay: {
    label: 'Reverse bay',
    short: 'D',
    spawn: { x: -9, z: 3.4, h: E },
    build(g) {
      const rnd = seeded(61);
      g.add(slab(0, 5, 44, 34, PALETTE.asphalt, 0.02));
      // Two rows of bays: north row (z -4.8..0) and south row (z 9.6..14.4).
      for (const [zOpen, zBack] of [[0, -4.8], [9.6, 14.4]]) {
        for (let i = 0; i <= 10; i++) line(g, -12 + i * 2.4, zOpen, -12 + i * 2.4, zBack);
        line(g, -12, zBack, 12, zBack);
      }
      const colors = PALETTE.others;
      [0, 1, 3, 4, 6, 8, 9].forEach((i, k) => parked(g, -10.8 + i * 2.4, -2.4, k % 2 ? S : N, colors[k % 6]));
      [1, 2, 5, 7, 8].forEach((i, k) => parked(g, -10.8 + i * 2.4, 12, k % 2 ? N : S, colors[(k + 2) % 6]));
      // Target bay: index 5 (x = 1.2) is empty; give it a soft highlight.
      const hl = slab(1.2, -2.4, 2.2, 4.6, 0x3aa86b, 0.03);
      hl.material.transparent = true; hl.material.opacity = 0.35;
      g.add(hl);
      for (const x of [-20, 20]) for (let z = -10; z < 22; z += 10) g.add(tree(x, z, 1.1));
      for (let x = -30; x <= 30; x += 10) { g.add(house(x, -16, 0, rnd)); g.add(house(x, 26, Math.PI, rnd)); }
      trees(g, rnd, 40, (x, z) => Math.abs(x) < 34 && z > -22 && z < 32, 160);
    },
    paths: {
      forward: { label: '1. Drive past', points: [[-9, 3.4], [0, 3.4], [5.4, 3.4]] },
      reverse: { label: '2. Reverse in', reverse: true, points: [[5.4, 3.4], [4.1, 2.9], [2.6, 1.6], [1.6, 0], [1.25, -1.6], [1.2, -2.6]] },
    },
    traffic: [
      { points: [[30, 7.4], [-30, 7.4]], speed: 4, color: PALETTE.others[1], offset: 0.4 },
      { points: [[-30, 7.4], [30, 7.4]], speed: 3.5, color: PALETTE.others[3], offset: 0.1, lane: true },
    ],
  },

  crossroads: {
    label: 'Crossroads',
    short: 'E',
    spawn: { x: -1.75, z: 30, h: N },
    lights: true,
    build(g, ctx) {
      const rnd = seeded(71);
      road(g, { axis: 'z', from: -120, to: 120, width: 7, centreLine: false });
      road(g, { axis: 'x', from: -120, to: 120, width: 7, centreLine: false });
      // Centre lines stop short of the box; solid stop lines on each approach (left half).
      for (const s of [1, -1]) {
        dashed(g, 0, s * 6, 0, s * 120); dashed(g, s * 6, 0, s * 120, 0);
      }
      line(g, -3.5, 4.6, 0, 4.6, 0.35); line(g, 0, -4.6, 3.5, -4.6, 0.35);
      line(g, 4.6, 0, 4.6, 3.5, 0.35); line(g, -4.6, -3.5, -4.6, 0, 0.35);
      const lights = [];
      for (const [x, z, rot, grp] of [[-4.6, 5.2, 0, 'ns'], [4.6, -5.2, Math.PI, 'ns'], [5.2, 4.6, Math.PI / 2, 'ew'], [-5.2, -4.6, -Math.PI / 2, 'ew']]) {
        const tl = trafficLight();
        tl.group.position.set(x, 0, z);
        tl.group.rotation.y = rot;
        g.add(tl.group);
        lights.push({ ...tl, grp });
      }
      ctx.lights = lights;
      for (const s of [1, -1]) for (let p = 16; p < 70; p += 10) {
        g.add(house(12 * s, p, -Math.PI / 2 * s, rnd)); g.add(house(12 * s, -p, -Math.PI / 2 * s, rnd));
      }
      trees(g, rnd, 50, (x, z) => Math.abs(z) < 20 || Math.abs(x) < 20);
    },
    paths: {
      ahead: { label: 'Ahead', points: [[-1.75, 26], [-1.75, 0], [-1.75, -26]] },
      right: { label: 'Turn right', points: [[-1.75, 26], [-1.75, 6], [-1.3, 2], [0.6, -0.9], [4, -1.75], [20, -1.75]] },
      left: { label: 'Turn left', points: [[-1.75, 26], [-1.75, 6], [-2.3, 3.6], [-4, 2], [-6.5, 1.75], [-20, 1.75]] },
    },
    traffic: [
      { points: [[1.75, -120], [1.75, 120]], speed: 9, color: PALETTE.others[0], offset: 0.35, grp: 'ns', stopAt: [1.75, -6.7] },
      { points: [[-120, -1.75], [120, -1.75]], speed: 9, color: PALETTE.others[1], offset: 0.1, grp: 'ew', stopAt: [-6.7, -1.75] },
      { points: [[120, 1.75], [-120, 1.75]], speed: 8, color: PALETTE.others[2], offset: 0.55, grp: 'ew', stopAt: [6.7, 1.75] },
    ],
  },
};
