// Scenario definitions for the 3D lab.
// UK roads: traffic drives on the left. North is -z, east is +x.
// Paths are lists of [x, z] points. Keys are [time, distance, ease?] where distance can be a
// number, 'end', or a marker name with an optional offset ('hold', 'hold+30', 'pass-60').
import * as THREE from 'three';
import { PALETTE, road, giveWayLine, house, tree, seeded, slab } from './world.js';

function street(group, rnd, { xs = [], zs = [], along = 'z', from, to, spacing = 9 }) {
  // Houses either side of a road. xs/zs: the line(s) to place houses on.
  if (along === 'z') {
    for (const x of xs) for (let z = from; z < to; z += spacing) {
      group.add(house(x, z, x < 0 ? Math.PI / 2 : -Math.PI / 2, rnd));
    }
  } else {
    for (const z of zs) for (let x = from; x < to; x += spacing) {
      group.add(house(x, z, z < 0 ? 0 : Math.PI, rnd));
    }
  }
}

function scatterTrees(group, rnd, n, avoid) {
  for (let i = 0; i < n; i++) {
    const x = (rnd() - 0.5) * 140, z = (rnd() - 0.5) * 140;
    if (avoid(x, z)) continue;
    group.add(tree(x, z, 0.8 + rnd() * 0.6));
  }
}

const arc = (cx, cz, r, a0, a1, step = 12) => {
  const pts = [];
  const dir = a1 > a0 ? 1 : -1;
  for (let a = a0; dir > 0 ? a <= a1 + 0.01 : a >= a1 - 0.01; a += step * dir) {
    const rad = THREE.MathUtils.degToRad(a);
    pts.push([cx + Math.cos(rad) * r, cz + Math.sin(rad) * r]);
  }
  return pts;
};

export const SCENARIOS = {
  tjunction: {
    title: 'Emerging right at a T-junction',
    blurb: 'A closed junction onto a busy road. Watch the routine: MSPSL, stop at the line, peep and creep, wait for a safe gap.',
    duration: 18,
    camera: { pos: [-13, 31, 27], target: [1, 0, 5] },
    build(g) {
      const rnd = seeded(11);
      road(g, { axis: 'x', from: -130, to: 130, centre: 0, width: 6 });
      road(g, { axis: 'z', from: 3, to: 70, centre: 0, width: 6, centreLine: false });
      giveWayLine(g, { axis: 'z', at: 3.05, centre: 0, width: 3, offset: -1.5 });
      // Give way triangle on the approach, pointing back at the driver.
      const tri = new THREE.Shape([new THREE.Vector2(-0.7, 0), new THREE.Vector2(0.7, 0), new THREE.Vector2(0, -3)]);
      const triMesh = new THREE.Mesh(new THREE.ShapeGeometry(tri), new THREE.MeshStandardMaterial({ color: PALETTE.marking, side: THREE.DoubleSide }));
      triMesh.rotation.x = -Math.PI / 2;
      triMesh.position.set(-1.5, 0.034, 7.5);
      g.add(triMesh);
      street(g, rnd, { xs: [-10, 10], along: 'z', from: 14, to: 60 });
      street(g, rnd, { zs: [-11], along: 'x', from: -50, to: 50, spacing: 10 });
      street(g, rnd, { zs: [11], along: 'x', from: -50, to: -12, spacing: 10 });
      street(g, rnd, { zs: [11], along: 'x', from: 16, to: 50, spacing: 10 });
      // Hedge on the corners makes it a closed junction.
      for (const x of [-7.6, 7.6]) {
        const hedge = new THREE.Mesh(new THREE.BoxGeometry(4, 1.8, 6), new THREE.MeshStandardMaterial({ color: PALETTE.grassDark, roughness: 1 }));
        hedge.position.set(x, 0.9, 8.6);
        hedge.castShadow = true;
        g.add(hedge);
      }
      scatterTrees(g, rnd, 50, (x, z) => Math.abs(z) < 16 || Math.abs(x) < 16);
    },
    actors: [
      {
        name: 'learner', learner: true,
        path: [[-1.5, 45], [-1.5, 12], [-1.5, 5.6], [-1.5, 4.6], [-1.3, 2], [-0.4, 0], [1.2, -1.2], [4, -1.5], [10, -1.5], [70, -1.5]],
        markers: { line: [-1.5, 5.6], creep: [-1.5, 4.9] },
        keys: [[0, 0], [3, 24], [6, 'line', 'in'], [8.5, 'line'], [9.5, 'creep', 'io'], [12.6, 'creep'], [14.6, 'creep+11', 'out'], [18, 'end']],
        signals: [[1, 15.5, 'right']],
      },
      {
        name: 'from-right', color: PALETTE.others[1],
        path: [[130, 1.5], [-130, 1.5]],
        markers: { mid: [0, 1.5] },
        keys: [[0, 'mid-88'], [8, 'mid'], [18, 'mid+110']],
      },
      {
        name: 'from-left', color: PALETTE.others[0],
        path: [[-130, -1.5], [130, -1.5]],
        markers: { mid: [0, -1.5] },
        keys: [[0, 'mid-105'], [10.5, 'mid'], [18, 'mid+75']],
      },
    ],
    steps: [
      { t: 0, title: 'Mirrors', text: 'Check the interior mirror, then the right door mirror, well before the junction.' },
      { t: 1, title: 'Signal', text: 'Signal right in good time so following traffic knows the plan.' },
      { t: 2.5, title: 'Position', text: 'Keep to the left half of the road on approach. Do not drift towards the centre.' },
      { t: 4, title: 'Speed', text: 'Brake first, then select a low gear. Be ready to stop: this is a closed junction.' },
      { t: 6, title: 'Look (LADA)', text: 'Stop at the line. Look right, left, right. Assess, decide, act.' },
      { t: 8.5, title: 'Peep and creep', text: 'Creep forward slowly to see past the hedge without poking into the road.' },
      { t: 10.5, title: 'Wait for a safe gap', text: 'Traffic from both directions. Only go if nobody has to slow down or swerve.' },
      { t: 12.6, title: 'Go', text: 'Emerge decisively into the left lane of the new road. Mirrors after the turn, cancel the signal.' },
    ],
  },

  roundabout: {
    title: 'Turning right at a roundabout',
    blurb: 'Third exit (turning right). Signal right on approach, give way to traffic from the right, signal left after passing the exit before yours.',
    duration: 20,
    camera: { pos: [-22, 26, 30], target: [0, 0, 3] },
    build(g) {
      const rnd = seeded(23);
      const asphalt = new THREE.MeshStandardMaterial({ color: PALETTE.asphalt, roughness: 0.9 });
      const ring = new THREE.Mesh(new THREE.RingGeometry(5.2, 12.6, 64), asphalt);
      ring.rotation.x = -Math.PI / 2; ring.position.y = 0.025; ring.receiveShadow = true;
      g.add(ring);
      const island = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.4, 0.25, 48), new THREE.MeshStandardMaterial({ color: PALETTE.grassDark, roughness: 1 }));
      island.position.y = 0.12; island.receiveShadow = true;
      g.add(island);
      const kerb = new THREE.Mesh(new THREE.TorusGeometry(5.3, 0.12, 6, 48), new THREE.MeshStandardMaterial({ color: 0xe8e4da }));
      kerb.rotation.x = Math.PI / 2; kerb.position.y = 0.2;
      g.add(kerb);
      g.add(tree(0, 0, 1.2));
      for (const [axis, sign] of [['z', 1], ['z', -1], ['x', 1], ['x', -1]]) {
        road(g, { axis, from: sign * 12, to: sign * 90, centre: 0, width: 6 });
      }
      giveWayLine(g, { axis: 'z', at: 12.6, centre: 0, width: 3, offset: -1.5 });
      giveWayLine(g, { axis: 'z', at: -13.05, centre: 0, width: 3, offset: 1.5 });
      giveWayLine(g, { axis: 'x', at: 13.05, centre: 0, width: 3, offset: 1.5 });
      giveWayLine(g, { axis: 'x', at: -12.6, centre: 0, width: 3, offset: -1.5 });
      // Advance direction sign on the south approach.
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 6), new THREE.MeshStandardMaterial({ color: 0x777777 }));
      post.position.set(-4.6, 1.2, 34); g.add(post);
      const board = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.3, 0.08), new THREE.MeshStandardMaterial({ color: 0x1d5fae }));
      board.position.set(-4.6, 2.6, 34); g.add(board);
      street(g, rnd, { xs: [-11, 11], along: 'z', from: 22, to: 70, spacing: 10 });
      street(g, rnd, { xs: [-11, 11], along: 'z', from: -70, to: -22, spacing: 10 });
      scatterTrees(g, rnd, 60, (x, z) => Math.hypot(x, z) < 20 || Math.abs(x) < 15 || Math.abs(z) < 8);
    },
    actors: [
      {
        name: 'learner', learner: true,
        path: [[-1.5, 60], [-1.5, 22], [-1.5, 15], [-2.2, 11.5], ...arc(0, 0, 9, 112, 340, 12), [11.5, -1.8], [16, -1.5], [80, -1.5]],
        markers: { line: [-1.5, 14.9], exit2: [0, -9], exit3: [9, -1.5] },
        keys: [[0, 0], [3, 30], [5.5, 'line', 'in'], [8.6, 'line'], [11, 'line+12', 'out'], [20, 'end']],
        signals: [[0.5, 'exit2-1', 'right'], ['exit2+1', 'exit3+6', 'left']],
      },
      {
        name: 'circulating', color: PALETTE.others[2],
        path: [[90, 1.5], [16, 1.5], [12, 1.9], ...arc(0, 0, 9, 14, 168, 12), [-12, 1.9], [-16, 1.5], [-90, 1.5]],
        markers: { pass: [-1.9, 8.8] },
        keys: [[0, 'pass-62'], [7.2, 'pass'], [20, 'pass+110']],
        signals: [['pass-30', 'pass+12', 'left']],
      },
      {
        name: 'from-north', color: PALETTE.others[3],
        path: [[1.5, -90], [1.5, -16], [1.9, -12], ...arc(0, 0, 9, -78, 76, 12), [1.9, 12], [1.5, 16], [1.5, 90]],
        markers: { line: [1.5, -15] },
        keys: [[0, 'line-60'], [7.5, 'line', 'in'], [8.5, 'line'], [12, 'line+30', 'out'], [20, 'line+100']],
        signals: [['line+17', 'line+34', 'left']],
      },
    ],
    steps: [
      { t: 0, title: 'Plan', text: 'Read the advance sign early. Third exit means turning right.' },
      { t: 0.5, title: 'Mirrors and signal', text: 'Check mirrors, then signal right. On a two-lane approach you would take the right lane.' },
      { t: 3, title: 'Speed', text: 'Slow down, choose a low gear and start looking right well before the line.' },
      { t: 5.5, title: 'Give way to the right', text: 'A car is already on the roundabout from the right. Wait at the line.' },
      { t: 8.6, title: 'Go when clear', text: 'Move off smoothly and keep to the inside of the circulating lane.' },
      { at: 'exit2', title: 'Signal left', text: 'Just after passing the exit before yours, switch to a left signal.' },
      { at: 'exit3', title: 'Exit', text: 'Check the left mirror for cyclists, leave into the left lane, cancel the signal.' },
    ],
  },

  meeting: {
    title: 'Meeting traffic with parked cars',
    blurb: 'Parked cars on both sides. The obstruction is on our side first, so we hold back and let the oncoming car through.',
    duration: 24,
    camera: { pos: [-14, 19, 22], target: [0, 0, -6] },
    follow: true, // overview camera tracks the learner along the street
    build(g) {
      const rnd = seeded(5);
      road(g, { axis: 'z', from: -130, to: 70, centre: 0, width: 7.2 });
      street(g, rnd, { xs: [-11, 11], along: 'z', from: -100, to: 50, spacing: 9 });
      scatterTrees(g, rnd, 50, (x) => Math.abs(x) < 18);
    },
    parked: [
      ...[-6, -11, -16, -21].map((z, i) => ({ x: -2.75, z, heading: Math.PI, color: PALETTE.others[(i + 2) % 6] })),
      ...[-36, -41, -46].map((z, i) => ({ x: 2.75, z, heading: 0, color: PALETTE.others[(i + 4) % 6] })),
    ],
    actors: [
      {
        name: 'learner', learner: true,
        path: [[-1.8, 45], [-1.8, 8], [-1.8, 3.5], [-1.2, 0], [0, -4], [0, -21], [-1, -25.5], [-1.8, -29], [-1.8, -120]],
        markers: { hold: [-1.8, 3.5] },
        keys: [[0, 0], [3, 26], [5.6, 'hold', 'in'], [9.2, 'hold'], [13, 'hold+28', 'out'], [24, 'end']],
      },
      {
        name: 'oncoming-1', color: PALETTE.others[1],
        path: [[1.8, -125], [1.8, -56], [0.3, -50], [0.3, -32], [1.8, -27], [1.8, 70]],
        markers: { mid: [1.8, -13] },
        keys: [[0, 'mid-60'], [6.4, 'mid'], [24, 'mid+150']],
      },
      {
        name: 'oncoming-2', color: PALETTE.others[0],
        path: [[1.8, -125], [1.8, -53], [1.5, -51], [0.3, -47], [0.3, -35], [1.8, -30], [1.8, 70]],
        markers: { wait: [1.8, -53] },
        keys: [[0, 'wait-62'], [10.5, 'wait', 'in'], [16.8, 'wait'], [20, 'wait+20', 'out'], [24, 'wait+60']],
      },
    ],
    steps: [
      { t: 0, title: 'Look well ahead', text: 'Parked cars on our side and an oncoming car in the distance. Spot it early.' },
      { t: 2, title: 'Whose obstruction?', text: 'The parked cars are on our side, so be ready to give way. It is not a right of way.' },
      { t: 3.6, title: 'Mirrors, then slow', text: 'Check the interior mirror before slowing so following traffic is not surprised.' },
      { t: 5.6, title: 'Hold back', text: 'Wait well back with a clear view and room to pull out without reversing.' },
      { t: 9.2, title: 'Go when clear', text: 'Mirrors, move out and leave about a door\'s width (around 1 m) from the parked cars.' },
      { t: 14, title: 'Back to normal position', text: 'Now the parked cars are on the other side. The oncoming driver should wait for us.' },
      { t: 16.8, title: 'Acknowledge', text: 'A small wave to say thanks, keep scanning for doors opening and people between cars.' },
    ],
  },
};
