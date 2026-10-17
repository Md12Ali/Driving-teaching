// One teaching picture per lesson. Original drawings, UK left-hand traffic.
import { svg, t, path, num, pill, lead, car, person, tree, cyclist, grass, paper, hroad, vroad, gw, line, W, H } from './kit.js';
import { manoeuvreById, MV_CAR } from '../data/manoeuvres.js';

// Manoeuvre overview: scene plus every key position, the last one solid.
function manoeuvreOverview(id) {
  const m = manoeuvreById[id];
  const poses = m.steps.map((s) => s.pose);
  const trail = poses.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ');
  return m.scene() + `<path d="${trail}" class="p p-go dash" style="stroke-width:3"/>`
    + poses.slice(0, -1).map((p) => car(p.x, p.y, p.a, 'learner', { ...MV_CAR, cls: 'ghost' })).join('')
    + poses.map((p, i) => num(p.x + 24, p.y - 22, i + 1)).join('')
    + car(poses.at(-1).x, poses.at(-1).y, poses.at(-1).a, 'learner', MV_CAR)
    + m.labels.map(([x, y, s]) => t(x, y, s, 'txt-s')).join('');
}

const D = {
  cockpit: () => paper()
    + `<rect x="200" y="60" width="180" height="250" rx="40" class="car-l"/><rect x="216" y="110" width="148" height="40" rx="6" class="glass"/><rect x="216" y="250" width="148" height="30" rx="6" class="glass"/>`
    + `<rect x="220" y="170" width="56" height="62" rx="10" class="panel"/><rect x="304" y="170" width="56" height="62" rx="10" class="panel"/><circle cx="332" cy="160" r="20" class="ink-s" style="stroke-width:5"/>`
    + `<rect x="270" y="96" width="40" height="9" rx="3" class="f-ink"/><rect x="176" y="128" width="20" height="14" rx="3" class="f-ink"/><rect x="384" y="128" width="20" height="14" rx="3" class="f-ink"/>`
    + num(200, 200, 1) + t(178, 205, 'Doors', 'txt-b', 'end')
    + num(332, 248, 2) + t(332, 292, 'Seat', 'txt-b')
    + num(300, 152, 3) + t(150, 160, 'Steering', 'txt-b', 'end') + lead(156, 155, 286, 152)
    + `<path d="M310 175 L355 228" stroke="#dc2626" stroke-width="5"/>` + num(372, 210, 4) + t(150, 250, 'Seatbelt', 'txt-b', 'end') + lead(156, 245, 358, 212)
    + num(290, 80, 5) + t(290, 48, 'Mirrors', 'txt-b')
    + t(530, 90, 'D · S · S · S · M', 'txt-xl') + ['Doors shut', 'Seat position', 'Steering reach', 'Seatbelt on', 'Mirrors set'].map((x, i) => t(450, 130 + i * 30, `${i + 1}. ${x}`, '', 'start')).join('')
    + t(290, 340, 'Right-hand drive: the driver sits on the right', 'txt-s muted'),

  pedals: () => paper()
    + `<rect x="150" y="70" width="340" height="200" rx="20" class="panel"/>`
    + [['C', 'Clutch', 230, 'f-amb', 110, 'Left foot'], ['B', 'Brake', 320, 'f-red', 110, 'Right foot'], ['A', 'Accelerator', 410, 'f-go', 95, 'Right foot']].map(([k, n, x, c, y, f]) =>
      `<rect x="${x - 30}" y="${y}" width="60" height="${k === 'A' ? 130 : 90}" rx="10" class="${c}"/><text x="${x}" y="${y + (k === 'A' ? 75 : 55)}" text-anchor="middle" font-size="30" font-weight="800" fill="#fff">${k}</text>${t(x, 300, n, 'txt-b')}${t(x, 322, f, 'txt-s muted')}`).join('')
    + t(320, 45, 'A · B · C from right to left', 'txt-b')
    + path('M470 180 C 520 180 520 150 560 150', 'k', { arrow: true }) + t(585, 140, 'Squeeze,', 'txt-s', 'middle') + t(585, 158, "don't stab", 'txt-s'),

  'moving-off': () => grass() + hroad(110, 140) + `<rect x="0" y="250" width="${W}" height="16" class="kerb"/>`
    + `<path d="M346 228 L540 210 L540 250 Z" class="zone-mir"/><path d="M346 202 L540 150 L540 186 Z" class="zone-mir"/>`
    + `<path d="M348 200 L398 140 L440 152 Z" class="zone-blind"/><path d="M348 242 L404 252 L432 248 Z" class="zone-blind"/>`
    + car(320, 222, -90)
    + num(420, 276, 1) + num(560, 236, 2) + num(380, 222, 3) + num(170, 222, 4) + num(560, 168, 5) + num(420, 126, 6)
    + t(455, 300, 'Left blind spot', 'txt-s', 'start') + t(170, 196, 'Ahead', 'txt-s')
    + t(445, 100, 'Right blind spot: last look', 'txt-s warn', 'start')
    + path('M292 222 C 220 222 170 206 40 204', 'g')
    + pill(110, 40, 140, 'P · Prepare') + pill(270, 40, 140, 'O · Observe', 'p2') + pill(420, 40, 120, 'M · Move', 'p3')
    + t(30, 300, 'Mirrors (blue) and blind spots (red)', 'txt-s muted', 'start'),

  steering: () => paper()
    + `<circle cx="180" cy="180" r="105" class="ink-s" style="stroke-width:18"/><circle cx="180" cy="180" r="22" class="f-ink"/><path d="M180 180 H85 M180 180 H275 M180 180 V285" class="ink-s" style="stroke-width:12"/>`
    + `<circle cx="96" cy="124" r="16" fill="#d9a77f" stroke="#8a5a3a" stroke-width="2"/><circle cx="264" cy="124" r="16" fill="#d9a77f" stroke="#8a5a3a" stroke-width="2"/>`
    + path('M80 140 A105 105 0 0 0 104 262', 'g') + path('M286 230 A105 105 0 0 0 262 100', 'b')
    + t(48, 220, 'Pull', 'go txt-b') + t(318, 160, 'Push', 'blu txt-b')
    + vroad(430, 0, H, 150) + `<rect x="410" y="0" width="20" height="${H}" class="kerb"/>`
    + car(468, 270, 0) + `<line x1="430" y1="300" x2="456" y2="300" stroke="#facc15" stroke-width="4"/>` + t(470, 340, 'about 1 m from the kerb', 'txt-s')
    + path('M468 240 L468 50', 'k', { dash: true }) + t(468, 30, 'Look far ahead', 'txt-b'),

  gears: () => paper()
    + `<rect x="120" y="50" width="400" height="260" rx="22" class="panel"/>`
    + `<path d="M200 110 V250 M320 110 V250 M440 110 V250 M200 180 H440" class="ink-s" style="stroke-width:8;stroke-linecap:round"/>`
    + [[200, 100, '1', '0–10'], [200, 262, '2', '5–20'], [320, 100, '3', '15–30'], [320, 262, '4', '25–40'], [440, 100, '5', '35+'], [440, 262, 'R', 'Reverse']].map(([x, y, g, s]) =>
      `<circle cx="${x}" cy="${y}" r="26" class="${g === 'R' ? 'f-red' : 'f-blu'}"/><text x="${x}" y="${y + 9}" text-anchor="middle" font-size="24" font-weight="800" fill="#fff">${g}</text>${t(x + 38, y + 6, s, 'txt-s', 'start')}`).join('')
    + t(320, 175, 'N', 'txt-b') + t(320, 340, 'Rough speed range in mph. Your car may differ; listen to the engine.', 'txt-s muted'),

  mspsl: () => paper()
    + [['M', 'Mirrors', '#fbbf24'], ['S', 'Signal', '#fde68a'], ['P', 'Position', '#86efac'], ['S', 'Speed', '#fda4af'], ['L', 'Look', '#93c5fd']].map(([k, n, c], i) =>
      `<g transform="translate(${80 + i * 120} 150)"><circle r="44" fill="${c}" stroke="#0f172a" stroke-width="3"/><text y="12" text-anchor="middle" font-size="34" font-weight="800" fill="#0f172a">${k}</text></g>${t(80 + i * 120, 225, n, 'txt-b')}${i < 4 ? `<path d="M${128 + i * 120} 150 L${150 + i * 120} 150" class="p p-ink" marker-end="url(#ak-@ID)"/>` : ''}`).join('')
    + t(320, 290, 'Look: Look · Assess · Decide · Act', 'txt-b') + t(320, 320, 'Use it before every turn, junction, lane change or change of speed', 'txt-s muted'),

  'angle-start': () => grass() + vroad(170, 0, H, 230) + `<rect x="150" y="0" width="20" height="${H}" class="kerb"/>`
    + car(196, 140, 0, 'parked') + car(198, 228, 0)
    + path('M198 200 C 198 170 236 150 248 110 L 248 40', 'g')
    + `<path d="M210 220 L330 270 L330 300 Z" class="zone-blind"/>` + t(350, 320, 'Right blind spot: check again as you pull out', 'txt-s warn', 'start')
    + `<line x1="160" y1="168" x2="160" y2="200" stroke="#facc15" stroke-width="4"/>` + t(130, 190, '≈1 m gap', 'txt-s', 'end')
    + car(330, 70, 180, 'other') + t(360, 40, 'Oncoming traffic', 'txt-s', 'start')
    + t(520, 150, 'Slow clutch,', 'txt-b') + t(520, 172, 'lots of steering', 'txt-b'),

  turning: () => grass() + hroad(40, 100) + vroad(275, 140, H, 90)
    + `<rect x="275" y="150" width="90" height="12" fill="rgba(255,255,255,0.6)"/>`
    + path('M560 120 C 420 120 352 128 350 190 L 350 330', 'g')
    + path('M170 65 C 270 65 330 80 333 150 L 333 330', 'a')
    + `<circle cx="322" cy="98" r="7" class="f-amb"/>` + t(322, 30, 'Turning point', 'txt-s')
    + person(292, 156) + person(352, 156)
    + t(505, 190, 'Give way to people crossing', 'txt-s') + lead(370, 160, 420, 178)
    + t(560, 160, 'Turn left', 'go txt-b') + t(110, 112, 'Turn right', 'amb txt-b')
    + car(575, 120, -90) + car(140, 65, 90)
    + t(130, 340, 'UK: drive on the left', 'txt-s muted', 'start'),

  emerging: () => grass() + hroad(30, 80) + `<line x1="320" y1="110" x2="320" y2="${H}" stroke="var(--paper)" stroke-width="6"/>`
    + vroad(110, 110, 330, 80, { centre: false }) + gw(110, 116, 150, 116) + gw(110, 122, 150, 122) + car(130, 160, 0)
    + `<path d="M130 140 L10 40 L270 40 Z" class="zone-view"/>` + t(150, 350, 'Open junction: good view', 'txt-b')
    + vroad(450, 110, 330, 80, { centre: false }) + `<rect x="398" y="114" width="50" height="76" rx="12" class="hedge"/><rect x="532" y="114" width="50" height="76" rx="12" class="hedge"/>`
    + gw(450, 116, 490, 116) + gw(450, 122, 490, 122) + car(470, 160, 0) + path('M470 240 L470 190', 'g') + path('M470 186 L470 132', 'g', { dash: true })
    + t(580, 240, 'Peep and creep', 'go txt-b') + t(490, 350, 'Closed junction: poor view', 'txt-b')
    + car(40, 50, 90, 'other') + cyclist(600, 90, -90),

  crossroads: () => grass() + hroad(135, 90) + vroad(275, 0, H, 90)
    + path('M298 330 L298 190 C 298 168 320 158 380 158 L 620 158', 'g')
    + path('M342 30 L342 170 C 342 192 320 203 260 203 L 20 203', 'b')
    + car(298, 300, 0) + car(342, 60, 180, 'other')
    + t(470, 120, 'Pass right side to right side', 'txt-s') + t(250, 330, 'You', 'txt-b', 'end') + t(390, 50, 'Other car', 'txt-s', 'start')
    + t(120, 60, 'Unmarked crossroads:', 'txt-b') + t(120, 82, 'nobody has priority', 'txt-s'),

  roundabout: () => grass() + `<circle cx="320" cy="170" r="135" class="road"/><circle cx="320" cy="170" r="55" fill="var(--grass)" stroke="var(--line)" stroke-width="4"/>`
    + vroad(275, 290, H, 90) + vroad(275, 0, 50, 90) + `<rect x="0" y="125" width="200" height="90" class="road"/><rect x="440" y="125" width="200" height="90" class="road"/>`
    + gw(275, 296, 320, 296)
    + path('M292 350 L292 300 C 292 240 240 200 160 198 L 40 198', 'g')
    + path('M305 350 L305 290 C 305 210 240 205 230 150 C 230 100 300 60 300 10', 'b')
    + path('M312 350 L312 300 C 312 262 250 248 240 190 C 232 130 280 98 330 98 C 392 98 410 142 470 142 L 610 142', 'a')
    + pill(110, 262, 120, 'Left') + t(110, 296, 'Signal left on approach', 'txt-s')
    + pill(130, 50, 120, 'Ahead', 'p4') + t(130, 84, 'Signal left after the exit before', 'txt-s')
    + pill(540, 262, 120, 'Right', 'p3') + t(540, 296, 'Signal right, then left', 'txt-s')
    + `<path d="M470 80 A160 160 0 0 1 480 210" class="p p-ink dash" marker-end="url(#ak-@ID)"/>` + t(560, 40, 'Give way to traffic', 'txt-s') + t(560, 58, 'from the right', 'txt-s')
    + car(298, 330, 0),

  lights: () => grass() + vroad(200, 0, H, 240, { centre: false })
    + line(320, 0, 320, H, 'cline') + line(260, 0, 260, 200, 'cline') + line(380, 0, 380, 200, 'cline')
    + `<line x1="200" y1="210" x2="320" y2="210" class="stopl"/><line x1="200" y1="250" x2="320" y2="250" class="stopl"/>`
    + `<rect x="203" y="212" width="114" height="36" fill="rgba(34,197,94,0.25)"/>` + t(260, 236, 'Cyclists', 'txt-s')
    + `<g transform="translate(160 140)"><rect x="-14" y="0" width="28" height="70" rx="5" class="box"/><circle cy="14" r="9" class="lamp-off"/><circle cy="35" r="9" class="lamp-off"/><circle cy="56" r="9" fill="#22c55e"/></g>`
    + car(230, 290, 0) + car(290, 290, 0)
    + path('M230 180 L230 120 C 230 90 210 80 180 80', 'g', { w: 4 }) + path('M290 180 L290 60', 'g', { w: 4 })
    + t(230, 340, 'Left lane: left', 'txt-s') + t(300, 340, 'Ahead', 'txt-s', 'start')
    + `<rect x="410" y="30" width="200" height="140" class="road"/><path d="M420 40 L600 40 L600 160 L420 160 Z M420 40 L600 160 M600 40 L420 160" class="yellow-box"/>` + t(510, 190, 'Box junction: do not', 'txt-s') + t(510, 208, 'enter unless exit is clear', 'txt-s')
    + t(510, 260, 'Stop at the first line;', 'txt-s') + t(510, 278, 'the box ahead is for cyclists', 'txt-s'),

  crossings: () => grass() + `<rect x="0" y="120" width="${W}" height="120" class="road"/><line x1="0" y1="180" x2="${W}" y2="180" class="cline"/>`
    + [0, 1, 2, 3, 4, 5].map((i) => `<rect x="110" y="${124 + i * 19}" width="80" height="11" class="zebra"/>`).join('')
    + `<circle cx="96" cy="108" r="9" class="beacon"/><circle cx="204" cy="252" r="9" class="beacon"/>`
    + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<polyline points="${210 + i * 12},126 ${216 + i * 12},134" fill="none" stroke="#facc15" stroke-width="3"/>`).join('')
    + person(150, 106) + t(150, 290, 'Zebra crossing', 'txt-b') + t(150, 310, 'Give way to anyone on it', 'txt-s')
    + `<rect x="430" y="124" width="70" height="112" fill="none" stroke="var(--line)" stroke-width="3" stroke-dasharray="4 6"/>`
    + `<g transform="translate(540 40)"><rect x="-16" y="0" width="32" height="70" rx="6" class="box"/><circle cy="14" r="9" fill="#dc2626"/><circle cy="35" r="9" fill="#f59e0b"/><circle cy="56" r="9" class="lamp-off"/></g>`
    + t(470, 290, 'Light-controlled crossing', 'txt-b') + t(470, 310, 'Flashing amber (pelican): give way', 'txt-s')
    + car(40, 150, 90) + t(320, 345, 'Never park or overtake on the zigzags', 'txt-s warn'),

  meeting: () => grass() + `<rect x="0" y="100" width="${W}" height="160" class="road"/><line x1="0" y1="180" x2="${W}" y2="180" class="cline"/>`
    + `<rect x="0" y="84" width="${W}" height="16" class="kerb"/><rect x="0" y="260" width="${W}" height="16" class="kerb"/>`
    + [250, 320, 390].map((x) => car(x, 120, 90, 'parked')).join('')
    + car(520, 238, -90, 'other') + path('M490 238 L320 238', 'b')
    + car(140, 120, 90) + t(20, 70, 'Wait here, well back', 'go txt-b', 'start')
    + path('M170 120 C 210 120 210 160 250 160 L 400 160 C 440 160 440 125 480 125', 'g', { dash: true })
    + t(430, 70, 'Parked cars on YOUR side', 'txt-s') + `<line x1="440" y1="138" x2="440" y2="152" stroke="#facc15" stroke-width="4"/>` + t(470, 300, 'Leave about 1 m (a door\'s width)', 'txt-s')
    + t(520, 330, 'Oncoming car goes first', 'txt-s blu'),

  hazards: () => grass() + vroad(250, 0, H, 140)
    + `<rect x="250" y="250" width="140" height="110" fill="rgba(250,204,21,0.25)"/><rect x="250" y="130" width="140" height="120" fill="rgba(34,197,94,0.2)"/><rect x="250" y="0" width="140" height="130" fill="rgba(42,114,207,0.2)"/>`
    + t(470, 305, 'Near', 'txt-b', 'start') + t(470, 195, 'Middle', 'txt-b', 'start') + t(470, 70, 'Far', 'txt-b', 'start')
    + car(285, 300, 0) + car(285, 175, 0, 'other') + car(355, 60, 180, 'other')
    + cyclist(266, 225, 0) + t(400, 240, 'Cyclist: pass with 1.5 m+', 'txt-s', 'start') + lead(278, 228, 396, 236)
    + person(410, 95) + t(430, 100, 'Child near the kerb', 'txt-s', 'start')
    + `<line x1="232" y1="205" x2="232" y2="275" stroke="#facc15" stroke-width="4"/>` + t(222, 245, '2-second gap', 'txt-s', 'end')
    + tree(120, 80) + tree(150, 260) + t(120, 340, 'Ask: what might happen next?', 'txt-b'),

  following: () => paper()
    + [[20, 6, 6], [30, 9, 14], [40, 12, 24], [50, 15, 38], [60, 18, 55], [70, 21, 75]].map(([mph, a, b], i) => {
      const y = 40 + i * 48, s = 5.2;
      return `${t(70, y + 20, `${mph} mph`, 'txt-b', 'end')}<rect x="85" y="${y}" width="${a * s}" height="28" rx="4" fill="#fbbf24"/><rect x="${85 + a * s}" y="${y}" width="${b * s}" height="28" rx="4" fill="#dc2626"/>${t(95 + (a + b) * s, y + 20, `${a + b} m`, 'txt-b', 'start')}`;
    }).join('')
    + `<rect x="430" y="320" width="14" height="14" fill="#fbbf24"/>` + t(450, 332, 'Thinking', 'txt-s', 'start') + `<rect x="530" y="320" width="14" height="14" fill="#dc2626"/>` + t(550, 332, 'Braking', 'txt-s', 'start')
    + t(320, 350, 'Typical dry-road stopping distances (Highway Code)', 'txt-s muted'),

  'parallel-park': () => manoeuvreOverview('parallel'),
  'reverse-bay': () => manoeuvreOverview('reverse-bay'),
  'forward-bay': () => manoeuvreOverview('forward-bay'),
  'pull-up-right': () => manoeuvreOverview('pull-up-right'),

  'emergency-stop': () => paper() + hroad(150, 110)
    + car(90, 178, 90) + `<rect x="190" y="160" width="330" height="38" fill="rgba(220,38,38,0.18)"/>` + car(560, 178, 90)
    + path('M120 178 L520 178', 'a', { dash: true })
    + [['React', 140], ['Brake firmly', 280], ['Stop', 420], ['Check all round', 560]].map(([s, x], i) => `${num(x, 70, i + 1)}${t(x, 110, s, 'txt-b')}`).join('')
    + t(320, 310, 'Brake first, clutch just before you stop', 'txt-b') + t(320, 335, 'With ABS: keep pressing hard, you can still steer', 'txt-s muted'),

  bends: () => grass() + `<path d="M-20 300 C 200 300 360 300 420 220 C 480 140 470 60 660 40" class="road-s" stroke-width="80"/>`
    + `<path d="M-20 300 C 200 300 360 300 420 220 C 480 140 470 60 660 40" class="cline"/>`
    + `<rect x="170" y="272" width="110" height="24" fill="rgba(245,158,11,0.55)"/>` + t(225, 345, 'Brake here, before the bend', 'amb txt-b')
    + car(110, 282, 90) + `<circle cx="455" cy="160" r="10" class="f-amb"/>` + lead(140, 282, 450, 165) + t(480, 200, 'Limit point: furthest', 'txt-s', 'start') + t(480, 218, 'road you can see', 'txt-s', 'start')
    + t(390, 300, 'Steady speed', 'go txt-b') + tree(330, 140, 26) + tree(380, 110, 22) + tree(560, 260, 20),

  dual: () => grass() + `<rect x="0" y="80" width="${W}" height="150" class="road"/><line x1="0" y1="155" x2="${W}" y2="155" class="cline"/><rect x="0" y="60" width="${W}" height="16" fill="#5d7a3f"/>`
    + `<path d="M660 330 C 440 330 360 240 220 232 L -20 232" class="road-s" stroke-width="44"/>`
    + car(520, 192, -90, 'other') + car(390, 290, -70)
    + path('M360 282 C 310 260 260 238 170 232', 'g')
    + `<path d="M405 282 L580 300 L560 250 Z" class="zone-mir"/>` + t(510, 350, 'Slip road: match the speed', 'txt-b')
    + t(180, 290, 'Mirror + right blind spot', 'txt-s') + t(120, 125, 'Keep left unless overtaking', 'txt-b')
    + t(450, 40, 'Central reservation', 'txt-s muted'),

  motorway: () => grass() + `<rect x="0" y="70" width="${W}" height="190" class="road"/>`
    + line(0, 133, W, 133, 'cline') + line(0, 196, W, 196, 'cline') + `<rect x="0" y="54" width="${W}" height="16" fill="#5d7a3f"/>`
    + `<path d="M270 260 C 180 262 110 300 -20 330" class="road-s" stroke-width="40"/>`
    + [[580, '300', 3], [490, '200', 2], [400, '100', 1]].map(([x, v, n]) => `<g transform="translate(${x} 278)"><rect x="-14" y="0" width="28" height="44" class="sign-blue"/>${[...Array(n)].map((_, k) => `<line x1="-8" y1="${32 - k * 10}" x2="8" y2="${24 - k * 10}" stroke="#fff" stroke-width="4"/>`).join('')}</g>${t(x, 345, `${v} yd`, 'txt-s')}`).join('')
    + car(340, 228, -90) + path('M312 228 C 270 232 230 262 160 292', 'g')
    + `<g transform="translate(330 20)"><rect x="-26" y="0" width="52" height="30" class="box"/><path d="M-10 5 L10 25 M10 5 L-10 25" stroke="#dc2626" stroke-width="5"/></g>` + t(370, 40, 'Red X: lane closed', 'txt-s warn', 'start')
    + car(520, 165, -90, 'other') + car(150, 100, -90, 'other') + t(40, 110, 'Lane 3', 'txt-s muted', 'start') + t(40, 172, 'Lane 2', 'txt-s muted', 'start') + t(560, 238, 'Lane 1', 'txt-s muted')
    + t(600, 30, 'Traffic → left', 'txt-s muted', 'end'),

  weather: () => paper()
    + [['Dry', 23, '#16a34a'], ['Wet (×2)', 46, '#2a72cf'], ['Icy (up to ×10)', 230, '#64748b']].map(([n, d, c], i) => {
      const y = 60 + i * 90, s = 1.8;
      return `${t(140, y + 24, n, 'txt-b', 'end')}<rect x="155" y="${y}" width="${Math.min(d * s, 470)}" height="36" rx="6" fill="${c}"/>${t(165 + Math.min(d * s, 470), y + 24, `${d} m`, 'txt-b', 'start')}`;
    }).join('')
    + t(320, 330, 'Stopping distance from 30 mph. Slow down and leave a bigger gap.', 'txt-s muted')
    + `<g transform="translate(560 40)"><circle r="16" fill="#fbbf24"/></g>`,

  independent: () => paper()
    + `<rect x="80" y="60" width="190" height="230" rx="22" class="box"/><rect x="95" y="80" width="160" height="170" rx="8" fill="#d9e8f2"/>`
    + `<path d="M140 230 L140 160 C 140 130 170 120 215 120" class="p p-go" marker-end="url(#ag-@ID)"/>` + t(175, 275, 'In 200 m turn right', 'txt-s')
    + `<rect x="350" y="70" width="230" height="150" rx="10" class="sign-green"/><path d="M465 200 V120 M465 120 H410 M465 120 H520" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round"/>`
    + `<text x="400" y="104" text-anchor="middle" class="sign-txt" fill="#facc15">A12</text><text x="535" y="104" text-anchor="middle" class="sign-txt">Ilford</text>`
    + t(320, 320, 'Follow the sat nav, road signs, or both', 'txt-b') + t(320, 345, 'Wrong turn? Stay calm and safe. It is not a fault.', 'txt-s muted'),

  'show-me': () => paper()
    + `<rect x="60" y="60" width="240" height="200" rx="18" class="panel"/>` + t(180, 100, 'TELL ME', 'txt-xl blu')
    + t(180, 140, 'Before you drive', 'txt-b') + t(180, 170, 'Explain a safety check:', 'txt-s') + t(180, 190, 'tyres, brakes, oil, lights…', 'txt-s')
    + `<rect x="340" y="60" width="240" height="200" rx="18" class="panel"/>` + t(460, 100, 'SHOW ME', 'txt-xl go')
    + t(460, 140, 'While driving', 'txt-b') + t(460, 170, 'Use a control safely:', 'txt-s') + t(460, 190, 'washers, demister, horn…', 'txt-s')
    + t(320, 310, 'Wrong answer = 1 driving fault', 'txt-b') + t(320, 335, 'Losing control while showing = serious or dangerous', 'txt-s warn'),

  eco: () => grass() + hroad(130, 100)
    + car(80, 155, 90) + `<g transform="translate(560 60)"><rect x="-14" y="0" width="28" height="70" rx="5" class="box"/><circle cy="14" r="9" fill="#dc2626"/><circle cy="35" r="9" class="lamp-off"/><circle cy="56" r="9" class="lamp-off"/></g>`
    + `<rect x="130" y="138" width="270" height="34" fill="rgba(34,197,94,0.25)"/>` + t(265, 120, 'Ease off early: let the car roll', 'go txt-b')
    + `<rect x="400" y="138" width="120" height="34" fill="rgba(220,38,38,0.2)"/>` + t(460, 210, 'Not late, hard braking', 'warn txt-s')
    + path('M110 155 L520 155', 'g', { dash: true })
    + t(320, 290, 'Plan ahead · smooth controls · change up early', 'txt-b') + t(320, 315, 'Saves fuel and is safer', 'txt-s muted'),

  faults: () => paper()
    + [['Driving fault (minor)', 'Not potentially dangerous. Up to 15 allowed.', '#fbbf24', '#0f172a'], ['Serious fault', 'Potentially dangerous. One = fail.', '#f97316', '#fff'], ['Dangerous fault', 'Actual danger. One = fail.', '#dc2626', '#fff']].map(([n, d, c, tc], i) => {
      const y = 40 + i * 90;
      return `<rect x="70" y="${y}" width="500" height="70" rx="14" fill="${c}"/><text x="95" y="${y + 32}" font-size="20" font-weight="800" fill="${tc}">${n}</text><text x="95" y="${y + 55}" font-size="14" font-weight="600" fill="${tc}">${d}</text>`;
    }).join('')
    + t(320, 330, 'Pass: 15 or fewer driving faults and no serious or dangerous faults', 'txt-b'),

  'test-day': () => paper()
    + `<line x1="60" y1="170" x2="580" y2="170" stroke="var(--panel-line)" stroke-width="6"/>`
    + [['Licence', 'Check'], ['Eyesight', '20 m plate'], ['Tell me', 'Question'], ['Drive', '~35 min'], ['Show me', 'While driving'], ['Result', 'Feedback']].map(([a, b], i) => {
      const x = 70 + i * 100;
      return `<circle cx="${x}" cy="170" r="22" class="f-blu"/><text x="${x}" y="176" text-anchor="middle" font-size="15" font-weight="800" fill="#fff">${i + 1}</text>${t(x, 120, a, 'txt-b')}${t(x, 225, b, 'txt-s')}`;
    }).join('')
    + t(320, 300, 'Includes 20 to 35 minutes of independent driving,', 'txt-s') + t(320, 320, 'one reversing exercise and maybe an emergency stop', 'txt-s'),
};

const VB = { 'parallel-park': 'parallel', 'reverse-bay': 'reverse-bay', 'forward-bay': 'forward-bay', 'pull-up-right': 'pull-up-right' };

export function diagram(id, label = '') {
  const fn = D[id];
  const vb = VB[id] ? manoeuvreById[VB[id]].vb : undefined;
  return fn ? svg(fn(), vb ? { label, vb } : { label }) : '';
}

export const DIAGRAM_IDS = Object.keys(D);
