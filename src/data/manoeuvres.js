// Manoeuvre cheat-sheets. Each step has a car pose { x, y, a } on the 640x360 scene,
// the steering position, a reference point to look for, and the observations to make.
// Reference points differ between cars and drivers: these are common starting points to adapt.
import { car, hroad, line, t, tree, W, H } from '../diagrams/kit.js';

const CAR = { w: 24, l: 50 };

// ---- Scenes ----
function streetScene({ parkedLeft = [], parkedRight = [] } = {}) {
  // Vertical road. Pavement on the left from x=40 to 100. Kerb line x = 100.
  return `<rect width="${W}" height="${H}" class="grass"/>
    <rect x="40" y="0" width="60" height="${H}" class="kerb"/>
    <rect x="100" y="0" width="280" height="${H}" class="road"/>
    <rect x="380" y="0" width="60" height="${H}" class="kerb"/>
    <line x1="240" y1="0" x2="240" y2="${H}" class="cline"/>
    ${parkedLeft.map(([x, y]) => car(x, y, 0, 'parked', CAR)).join('')}
    ${parkedRight.map(([x, y]) => car(x, y, 180, 'parked', CAR)).join('')}
    ${tree(20, 60)}${tree(20, 220)}${tree(470, 120)}${tree(470, 300)}`;
}

function carParkScene(emptyBay) {
  // Bays along the top (y 40-100), lines every 30 from x=150. Aisle below.
  const lines = [];
  for (let x = 150; x <= 480; x += 30) lines.push(line(x, 40, x, 100, 'bay'));
  const cars = [];
  for (let i = 0; i < 11; i += 1) {
    const cx = 165 + i * 30;
    if (cx === emptyBay || [225, 405].includes(cx)) continue;
    cars.push(car(cx, 70, i % 2 ? 180 : 0, 'parked', { w: 22, l: 46 }));
  }
  return `<rect width="${W}" height="${H}" class="grass"/>
    <rect x="110" y="20" width="410" height="260" class="road"/>
    ${line(150, 40, 480, 40, 'bay')}${lines.join('')}${cars.join('')}
    <rect x="${emptyBay - 13}" y="43" width="26" height="54" fill="rgba(34,197,94,0.28)"/>
    ${t(emptyBay, 32, 'Target bay', 'txt-s')}
    ${tree(60, 60)}${tree(60, 200)}${tree(570, 90)}${tree(575, 240)}`;
}

function pullRightScene() {
  return `<rect width="${W}" height="${H}" class="grass"/>
    <rect x="160" y="0" width="30" height="${H}" class="kerb"/>
    <rect x="190" y="0" width="110" height="${H}" class="road"/>
    <rect x="300" y="0" width="30" height="${H}" class="kerb"/>
    <line x1="245" y1="0" x2="245" y2="${H}" class="cline"/>
    ${tree(120, 70)}${tree(120, 260)}${tree(380, 160)}${tree(380, 320)}
    ${t(470, 60, 'Two car lengths', 'txt-s')}${t(470, 80, '≈ 8 to 10 metres', 'txt-s muted')}`;
}

export const MANOEUVRES = [
  {
    id: 'parallel',
    lesson: 'parallel-park',
    title: 'Parallel park',
    vb: '30 40 420 300',
    summary: 'Reverse into a space behind a parked car, finishing close and parallel to the kerb within about two car lengths.',
    scene: () => streetScene({ parkedLeft: [[114, 128], [114, 292]] }),
    labels: [[114, 98, 'Target car'], [70, 326, 'Kerb']],
    steps: [
      { title: 'Position alongside', pose: { x: 152, y: 128, a: 0 }, wheel: 0,
        text: 'Pull up alongside the target car, about 1 metre away and parallel to it. Your rear bumper should be level with, or just behind, theirs.',
        ref: { x: 126, y: 153, label: 'Rear bumpers level' }, look: 'Mirrors and left blind spot before stopping. Select reverse.' },
      { title: 'Reverse to the point of turn', pose: { x: 152, y: 150, a: 0 }, wheel: 0,
        text: 'Full all-round check. Creep back slowly in a straight line until the target car\'s rear bumper appears in the middle of your rear side window.',
        ref: { x: 126, y: 153, label: 'Their rear bumper in your rear side window' }, look: 'All round: both blind spots, rear window, mirrors.' },
      { title: 'Full left lock', pose: { x: 143, y: 182, a: 38 }, wheel: -1,
        text: 'Look all round again, then steer one full turn to the left while creeping back. The rear swings in towards the kerb.',
        ref: { x: 100, y: 230, label: 'Kerb appears in rear window corner' }, look: 'Front right corner swings out: check for traffic before steering.' },
      { title: 'Straighten at 45°', pose: { x: 132, y: 197, a: 38 }, wheel: 0,
        text: 'When the car is at about 45° to the kerb, straighten the wheel and keep reversing slowly in a straight line.',
        ref: { x: 108, y: 186, label: 'Left mirror: kerb nearly meets the car' }, look: 'Keep checking the rear window and left mirror.' },
      { title: 'Full right lock', pose: { x: 117, y: 214, a: 0 }, wheel: 1,
        text: 'When the kerb in the left door mirror looks close, steer right to bring the front in. Stop as the car becomes parallel.',
        ref: { x: 102, y: 214, label: 'Close to the kerb' }, look: 'Final all-round check. Watch the car behind.' },
      { title: 'Finish', pose: { x: 115, y: 212, a: 0 }, wheel: 0,
        text: 'Straighten the wheel. You should be close to and parallel with the kerb, within about two car lengths of the target car. A small shunt to correct is allowed.',
        ref: null, look: 'Handbrake on, neutral if you are asked to stop here.' },
    ],
    faults: ['Not observing all round, especially before steering', 'Hitting or mounting the kerb', 'Finishing too far out or at an angle', 'Reversing too fast or too many shunts'],
  },
  {
    id: 'reverse-bay',
    lesson: 'reverse-bay',
    title: 'Reverse bay park',
    vb: '100 15 440 255',
    summary: 'Reverse into a bay, finishing within the lines. Drive out forwards.',
    scene: () => carParkScene(285),
    labels: [],
    steps: [
      { title: 'Approach slowly', pose: { x: 200, y: 165, a: 90 }, wheel: 0,
        text: 'Drive slowly along the row, about 1.5 to 2 car lengths from the bay ends. Look into your target bay to make sure it is empty.',
        ref: null, look: 'Pedestrians between cars, cars reversing out.' },
      { title: 'Stop at the reference point', pose: { x: 352, y: 165, a: 90 }, wheel: 0,
        text: 'Stop when your door mirror is level with the line three past your target bay (adjust this point for your car).',
        ref: { x: 360, y: 100, label: 'Mirror level with this line' }, look: 'Full all-round observation. Select reverse.' },
      { title: 'Full left lock', pose: { x: 311, y: 161, a: 135 }, wheel: -1,
        text: 'Creep back with full left lock. The rear swings round towards the target bay.',
        ref: { x: 270, y: 100, label: 'Watch the bay lines in both mirrors' }, look: 'Keep looking all round, especially behind and the front swinging out.' },
      { title: 'Straighten', pose: { x: 285, y: 128, a: 180 }, wheel: 0,
        text: 'When the bay lines look parallel to the car in both door mirrors, straighten the wheel.',
        ref: { x: 285, y: 100, label: 'Lines parallel in both mirrors' }, look: 'Both mirrors and over the shoulder.' },
      { title: 'Reverse in', pose: { x: 285, y: 70, a: 180 }, wheel: 0,
        text: 'Reverse straight back until the front of the car is inside the bay. Stop with the car central between the lines.',
        ref: null, look: 'Final check all round. Handbrake, neutral.' },
    ],
    faults: ['Finishing over the lines or across two bays', 'Not looking all round in a busy car park', 'Too many shunts', 'Not reacting to pedestrians or other cars'],
  },
  {
    id: 'forward-bay',
    lesson: 'forward-bay',
    title: 'Forward bay park',
    vb: '100 15 440 255',
    summary: 'Drive forwards into a bay, then reverse out safely.',
    scene: () => carParkScene(285),
    labels: [],
    steps: [
      { title: 'Approach with room', pose: { x: 150, y: 190, a: 90 }, wheel: 0,
        text: 'Drive slowly, keeping well away from the bays so you have room to turn in.',
        ref: null, look: 'Mirrors; signal left if it helps anyone.' },
      { title: 'Turn point', pose: { x: 248, y: 190, a: 90 }, wheel: 0,
        text: 'When the first line of your target bay is just ahead of your left door mirror, look into the bay and get ready to steer.',
        ref: { x: 270, y: 100, label: 'Bay line just ahead of your left mirror' }, look: 'Left blind spot: pedestrians and cyclists.' },
      { title: 'Full left lock', pose: { x: 280, y: 164, a: 45 }, wheel: -1,
        text: 'Steer firmly left at walking pace. The front swings into the bay.',
        ref: null, look: 'Watch both bay lines and the cars either side.' },
      { title: 'Straighten', pose: { x: 285, y: 123, a: 0 }, wheel: 0,
        text: 'Straighten as the car becomes parallel with the lines.',
        ref: { x: 285, y: 100, label: 'Lines parallel' }, look: 'Ahead and both sides.' },
      { title: 'Drive in and stop', pose: { x: 285, y: 72, a: 0 }, wheel: 0,
        text: 'Drive slowly in and stop with the whole car inside the bay.',
        ref: null, look: 'Handbrake, neutral if asked to stop.' },
      { title: 'Reverse out', pose: { x: 248, y: 139, a: 90 }, wheel: -1,
        text: 'Full all-round observation, then reverse slowly with left lock so the car turns to face along the aisle. Give way to anyone passing.',
        ref: null, look: 'Both blind spots and behind, all the way out.' },
    ],
    faults: ['Turning in too early and crossing into the next bay', 'Reversing out without full observation', 'Finishing over the lines'],
  },
  {
    id: 'pull-up-right',
    lesson: 'pull-up-right',
    title: 'Pull up on the right',
    vb: '100 40 460 310',
    summary: 'Pull up on the right-hand side of the road, reverse about two car lengths, then rejoin the traffic.',
    scene: () => pullRightScene(),
    labels: [],
    steps: [
      { title: 'Driving on the left', pose: { x: 216, y: 300, a: 0 }, wheel: 0,
        text: 'When asked to pull up on the right, check your mirrors and plan where you will stop.',
        ref: null, look: 'Interior and right mirrors; oncoming traffic.' },
      { title: 'Cross the road', pose: { x: 252, y: 230, a: 22 }, wheel: 1,
        text: 'Signal right if it helps, and cross only when the road is clear in both directions.',
        ref: null, look: 'Right blind spot before moving across.' },
      { title: 'Stop on the right', pose: { x: 287, y: 165, a: 0 }, wheel: 0,
        text: 'Stop close to and parallel with the right-hand kerb.',
        ref: { x: 300, y: 165, label: 'Close to the right kerb' }, look: 'Handbrake, then full observation before reversing.' },
      { title: 'Reverse two car lengths', pose: { x: 287, y: 265, a: 0 }, wheel: 0,
        text: 'Reverse in a straight line about two car lengths. Look mainly through the rear window, checking the mirrors and blind spots.',
        ref: null, look: 'All round, all the way back. Stop for anyone coming.' },
      { title: 'Rejoin', pose: { x: 252, y: 200, a: -22 }, wheel: -1,
        text: 'Full 6-point check (extra care: you are facing oncoming traffic). Signal if needed and move off to the left when safe.',
        ref: null, look: 'Both blind spots; traffic from both directions.' },
      { title: 'Back on the left', pose: { x: 216, y: 120, a: 0 }, wheel: 0,
        text: 'Return to your normal driving position on the left.',
        ref: null, look: 'Mirrors as you build up speed.' },
    ],
    faults: ['Crossing in front of oncoming traffic', 'Rejoining without full observation', 'Hitting the kerb or reversing too far'],
  },
];

export const manoeuvreById = Object.fromEntries(MANOEUVRES.map((m) => [m.id, m]));
export const MV_CAR = CAR;
