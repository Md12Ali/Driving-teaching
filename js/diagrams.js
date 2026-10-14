// Original teaching pictures, drawn as SVG so they stay sharp and can be translated.
// diagram(id, L) returns an SVG string. L holds the translated words (see i18n labels).

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function defs(id) {
  const m = (name, cls) => `<marker id="${name}-${id}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="${cls}-fill"/></marker>`;
  return `<defs>${m('g', 'd-go')}${m('b', 'd-blue')}${m('o', 'd-amber')}${m('k', 'd-ink')}</defs>`;
}

// Car seen from above, centred on (x, y), angle in degrees (0 = facing up).
function car(x, y, a = 0, kind = 'learner', s = 1) {
  const body = kind === 'learner' ? 'd-car-l' : kind === 'parked' ? 'd-car-p' : 'd-car-o';
  return `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">
    <rect x="-14" y="-26" width="28" height="52" rx="7" class="${body}"/>
    <rect x="-11" y="-14" width="22" height="9" rx="2" class="d-glass"/>
    <rect x="-11" y="10" width="22" height="7" rx="2" class="d-glass"/>
    ${kind === 'learner' ? '<rect x="-6" y="-2" width="12" height="9" rx="1.5" fill="#fff" stroke="#ccc" stroke-width=".6"/><text x="0" y="5.6" text-anchor="middle" font-size="8" font-weight="800" fill="#c8102e">L</text>' : ''}
  </g>`;
}

const t = (x, y, s, anchor = 'middle', cls = 'd-label') => `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${esc(s)}</text>`;
const path = (d, color = 'g', dashed = false) => `<path d="${d}" class="d-path d-${{ g: 'go', b: 'blue', o: 'amber', k: 'ink' }[color]}-stroke${dashed ? ' d-dash' : ''}" marker-end="url(#${color}-@ID)"/>`;
const num = (x, y, n, cls = 'd-num') => `<g class="${cls}"><circle cx="${x}" cy="${y}" r="13"/><text x="${x}" y="${y + 5}" text-anchor="middle">${n}</text></g>`;
const grass = '<rect width="640" height="360" class="d-grass"/>';
const hRoad = (y, h = 90) => `<rect x="0" y="${y}" width="640" height="${h}" class="d-road"/><line x1="0" y1="${y + h / 2}" x2="640" y2="${y + h / 2}" class="d-centre"/>`;
const vRoad = (x, y1, y2, w = 90, line = true) => `<rect x="${x}" y="${y1}" width="${w}" height="${y2 - y1}" class="d-road"/>${line ? `<line x1="${x + w / 2}" y1="${y1}" x2="${x + w / 2}" y2="${y2}" class="d-centre"/>` : ''}`;
const gw = (x, y, w) => `<line x1="${x}" y1="${y}" x2="${x + w}" y2="${y}" class="d-giveway"/><line x1="${x}" y1="${y + 6}" x2="${x + w}" y2="${y + 6}" class="d-giveway"/>`;
const pill = (x, y, w, s, cls = 'd-pill') => `<g class="${cls}"><rect x="${x - w / 2}" y="${y - 15}" width="${w}" height="30" rx="15"/>${t(x, y + 5, s, 'middle', 'd-pill-text')}</g>`;
const cone = (d, cls) => `<path d="${d}" class="${cls}"/>`;

const D = {
  cockpit: (L) => `${grass.replace('d-grass', 'd-paper')}
    ${car(320, 180, 0, 'learner', 3.2)}
    ${num(250, 150, 1)}${t(232, 155, L.doors, 'end')}
    ${num(320, 230, 2)}${t(320, 268, L.seat)}
    ${num(300, 165, 3)}
    ${num(390, 150, 4)}${t(408, 155, L.seatbelt, 'start')}
    ${num(320, 92, 5)}
    ${t(150, 60, L.mirrors, 'middle', 'd-label d-strong')}${t(150, 210, L.steering, 'middle', 'd-label d-strong')}
    <line x1="190" y1="205" x2="288" y2="168" class="d-leader"/><line x1="185" y1="66" x2="306" y2="92" class="d-leader"/>
    <g class="d-legend">${t(520, 80, 'D · S · S · S · M', 'middle', 'd-label d-big')}</g>
    ${['doors', 'seat', 'steering', 'seatbelt', 'mirrors'].map((k, i) => t(520, 120 + i * 30, `${i + 1}. ${L[k]}`, 'middle')).join('')}`,

  controls: (L) => `<rect width="640" height="360" class="d-paper"/>
    <rect x="150" y="60" width="340" height="220" rx="18" class="d-panel"/>
    ${[['C', L.clutch, 230, 'd-amber-fill'], ['B', L.brake, 320, 'd-red-fill'], ['A', L.accelerator, 410, 'd-go-fill']].map(([k, n, x, c]) => `
      <rect x="${x - 30}" y="${k === 'A' ? 110 : 130}" width="60" height="${k === 'A' ? 110 : 80}" rx="10" class="${c}"/>
      ${t(x, k === 'A' ? 175 : 180, k, 'middle', 'd-pedal')}
      ${t(x, 310, n, 'middle', 'd-label d-strong')}`).join('')}
    ${t(230, 50, L.leftFoot)}${t(365, 50, L.rightFoot)}
    <line x1="290" y1="38" x2="440" y2="38" class="d-leader"/>`,

  'moving-off': (L) => `${grass}${hRoad(110, 140)}<rect x="0" y="92" width="640" height="18" class="d-pavement"/>
    ${cone('M298,162 L110,178 L110,226 Z', 'd-mirror-cone')}${cone('M298,138 L110,116 L110,128 Z', 'd-mirror-cone')}
    ${cone('M292,166 L232,222 L204,212 Z', 'd-blind')}${cone('M292,134 L244,114 L222,120 Z', 'd-blind')}
    ${car(320, 150, 90)}
    ${t(200, 262, L.blindSpot, 'middle', 'd-label d-warn')}${t(110, 245, L.mirrorView, 'middle', 'd-label')}
    ${pill(430, 300, 130, `P · ${L.prepare}`)}${pill(570, 300, 120, `O · ${L.observe}`, 'd-pill d-pill-2')}${pill(500, 340, 110, `M · ${L.move}`, 'd-pill d-pill-3')}
    ${path('M350,150 C420,150 480,162 600,162', 'g')}`,

  steering: (L) => `<rect width="640" height="360" class="d-paper"/>
    <circle cx="190" cy="180" r="110" class="d-wheel"/><circle cx="190" cy="180" r="22" class="d-wheel-hub"/>
    <line x1="190" y1="180" x2="95" y2="180" class="d-wheel-spoke"/><line x1="190" y1="180" x2="285" y2="180" class="d-wheel-spoke"/><line x1="190" y1="180" x2="190" y2="290" class="d-wheel-spoke"/>
    <circle cx="105" cy="120" r="16" class="d-hand"/><circle cx="275" cy="120" r="16" class="d-hand"/>
    ${path('M88,140 A110,110 0 0 0 110,262', 'g')}${path('M292,230 A110,110 0 0 0 270,100', 'b')}
    ${t(60, 230, L.pull, 'middle', 'd-label d-go-text')}${t(330, 160, L.push, 'middle', 'd-label d-blue-text')}
    ${vRoad(430, 0, 360, 150)}<rect x="412" y="0" width="18" height="360" class="d-pavement"/>
    ${car(470, 260, 0)}
    <line x1="430" y1="300" x2="456" y2="300" class="d-measure"/>${t(470, 335, L.oneMetre, 'middle', 'd-label d-small')}
    ${path('M470,225 L470,60', 'k', true)}${t(505, 40, L.lookAhead)}`,

  mspsl: (L) => `<rect width="640" height="360" class="d-paper"/>
    ${[['M', L.mirrors], ['S', L.signal], ['P', L.position], ['S', L.speed], ['L', L.look]].map(([k, n], i) => `
      <g transform="translate(${70 + i * 125} 140)"><circle r="44" class="d-step d-step-${i}"/>${t(0, 14, k, 'middle', 'd-step-letter')}</g>
      ${t(70 + i * 125, 215, n, 'middle', 'd-label d-strong')}
      ${i < 4 ? `<path d="M${118 + i * 125},140 L${146 + i * 125},140" class="d-path d-ink-stroke" marker-end="url(#k-@ID)"/>` : ''}`).join('')}
    ${t(320, 290, 'L = Look · Assess · Decide · Act', 'middle', 'd-label d-big')}`,

  'junctions-turn': (L) => `${grass}${hRoad(40, 100)}${vRoad(275, 140, 360, 90)}
    <rect x="200" y="160" width="50" height="10" class="d-zebra-mini"/>
    ${path('M540,115 C420,115 352,125 350,190 L350,330', 'g')}
    ${path('M170,65 C270,65 330,80 333,150 L333,330', 'o')}
    <circle cx="322" cy="98" r="6" class="d-amber-fill"/>${t(320, 30, L.turningPoint, 'middle', 'd-label d-small')}
    <g transform="translate(292 160)"><circle r="7" class="d-person"/></g><g transform="translate(372 160)"><circle r="7" class="d-person"/></g>
    ${t(500, 185, L.giveWayPeople, 'middle', 'd-label')}<line x1="380" y1="170" x2="420" y2="178" class="d-leader"/>
    ${t(560, 160, L.turnLeft, 'middle', 'd-label d-go-text')}${t(110, 110, L.turnRight, 'middle', 'd-label d-amber-text')}
    ${car(570, 115, -90)}${car(140, 65, 90)}`,

  'junctions-emerge': (L) => `${grass}${hRoad(30, 80)}<line x1="320" y1="0" x2="320" y2="360" class="d-divider"/>
    <g>${vRoad(110, 110, 330, 80, false)}${gw(110, 116, 40)}${car(130, 160, 0)}
      ${cone('M130,140 L10,40 L270,40 Z', 'd-view')}${t(150, 350, L.open, 'middle', 'd-label d-strong')}</g>
    <g>${vRoad(450, 110, 330, 80, false)}<rect x="400" y="112" width="48" height="70" rx="10" class="d-hedge"/><rect x="532" y="112" width="48" height="70" rx="10" class="d-hedge"/>
      ${gw(450, 116, 40)}${car(470, 150, 0)}${path('M470,240 L470,190', 'g')}${path('M470,185 L470,128', 'g', true)}
      ${t(560, 240, L.peep, 'middle', 'd-label d-go-text')}${t(490, 350, L.closed, 'middle', 'd-label d-strong')}</g>`,

  crossroads: (L) => `${grass}${hRoad(135, 90)}${vRoad(275, 0, 360, 90)}
    ${path('M298,330 L298,190 C298,168 320,158 380,158 L620,158', 'g')}
    ${path('M342,30 L342,170 C342,192 320,203 260,203 L20,203', 'b')}
    ${car(298, 300, 0)}${car(342, 60, 180, 'other')}
    ${t(460, 125, L.passBehind, 'middle', 'd-label')}${t(250, 330, L.you, 'end', 'd-label d-strong')}${t(390, 50, L.other, 'start', 'd-label')}`,

  roundabouts: (L) => `${grass}<circle cx="320" cy="170" r="135" class="d-road-fill"/><circle cx="320" cy="170" r="55" class="d-island"/>
    ${vRoad(275, 290, 360, 90)}${vRoad(275, 0, 50, 90)}<rect x="0" y="125" width="200" height="90" class="d-road"/><rect x="440" y="125" width="200" height="90" class="d-road"/>
    ${gw(275, 296, 45)}
    ${path('M292,350 L292,300 C292,240 240,200 160,198 L40,198', 'g')}
    ${path('M305,350 L305,290 C305,210 240,205 230,150 C230,100 300,60 300,10', 'b')}
    ${path('M312,350 L312,300 C312,262 250,248 240,190 C232,130 280,98 330,98 C392,98 410,142 470,142 L610,142', 'o')}
    ${pill(110, 260, 130, L.left)}${t(110, 295, L.signalLeft, 'middle', 'd-label d-small')}
    ${pill(130, 50, 130, L.ahead, 'd-pill d-pill-2')}
    ${pill(540, 260, 130, L.right, 'd-pill d-pill-3')}${t(540, 295, L.signalRight, 'middle', 'd-label d-small')}
    <path d="M470,80 A160,160 0 0 1 480,210" class="d-path d-ink-stroke d-dash" marker-end="url(#k-@ID)"/>${t(560, 40, L.trafficFromRight, 'middle', 'd-label d-small')}
    ${car(298, 330, 0)}`,

  meeting: (L) => `${grass}<rect x="0" y="100" width="640" height="160" class="d-road"/><line x1="0" y1="180" x2="640" y2="180" class="d-centre"/>
    <rect x="0" y="260" width="640" height="16" class="d-pavement"/><rect x="0" y="84" width="640" height="16" class="d-pavement"/>
    ${[250, 320, 390].map((x) => car(x, 238, -90, 'parked', 0.9)).join('')}
    ${car(120, 140, 90, 'other')}${path('M150,140 L310,140', 'b')}
    ${car(520, 225, -90)}${t(520, 300, L.waitHere, 'middle', 'd-label d-go-text')}
    ${path('M490,225 C450,225 450,192 420,192 L250,192 C220,192 220,225 170,225', 'g', true)}
    ${t(320, 300, L.parked, 'middle', 'd-label d-small')}<line x1="210" y1="205" x2="210" y2="222" class="d-measure"/>${t(470, 75, L.giveWay + ': ' + L.you, 'middle', 'd-label d-strong')}`,

  crossings: (L) => `${grass}<rect x="0" y="120" width="640" height="120" class="d-road"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${110 + i * 0}" y="${124 + i * 19}" width="80" height="11" class="d-zebra"/>`).join('')}
    <circle cx="96" cy="108" r="9" class="d-beacon"/><circle cx="204" cy="252" r="9" class="d-beacon"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<polyline points="${250 + i * 12},126 ${256 + i * 12},134" class="d-zigzag"/>`).join('')}
    ${t(150, 290, L.zebra, 'middle', 'd-label d-strong')}
    <rect x="430" y="124" width="70" height="112" class="d-studs"/>
    <g transform="translate(540 50)"><rect x="-16" y="0" width="32" height="70" rx="6" class="d-light-box"/><circle cy="14" r="9" class="d-red-fill"/><circle cy="35" r="9" class="d-amber-fill d-blink"/><circle cy="56" r="9" class="d-off"/></g>
    ${t(470, 290, L.lights, 'middle', 'd-label d-strong')}${t(320, 335, L.zigzag, 'middle', 'd-label d-small')}`,

  bends: (L) => `${grass}<path d="M-20,300 C200,300 360,300 420,220 C480,140 470,60 640,40" class="d-road-curve"/>
    <path d="M-20,300 C200,300 360,300 420,220 C480,140 470,60 640,40" class="d-centre-curve"/>
    <rect x="170" y="268" width="110" height="28" class="d-brake-zone"/>${t(225, 340, L.brakeHere, 'middle', 'd-label d-amber-text')}
    ${car(110, 282, 90)}<circle cx="455" cy="160" r="10" class="d-amber-fill"/>
    <line x1="140" y1="282" x2="450" y2="165" class="d-leader"/>${t(500, 220, L.limitPoint, 'start', 'd-label')}
    ${t(370, 330, L.steady, 'middle', 'd-label d-go-text')}`,

  hazards: (L) => `${grass}${vRoad(250, 0, 360, 140)}
    <rect x="250" y="250" width="140" height="70" class="d-zone d-zone-1"/><rect x="250" y="130" width="140" height="120" class="d-zone d-zone-2"/><rect x="250" y="0" width="140" height="130" class="d-zone d-zone-3"/>
    ${t(470, 290, L.near, 'start', 'd-label')}${t(470, 195, L.middle, 'start', 'd-label')}${t(470, 70, L.far, 'start', 'd-label')}
    ${car(285, 300, 0)}${car(285, 175, 0, 'other')}
    <line x1="230" y1="200" x2="230" y2="275" class="d-measure"/>${t(220, 245, L.twoSeconds, 'end', 'd-label d-small')}
    <g transform="translate(410 60)"><circle r="8" class="d-person"/></g><g transform="translate(212 110)"><circle r="8" class="d-person"/></g>`,

  emergency: (L) => `<rect width="640" height="360" class="d-paper"/>${hRoad(150, 110)}
    ${car(90, 178, 90)}${car(560, 178, 90)}
    <rect x="190" y="160" width="330" height="38" class="d-stop-bar"/>
    ${[[L.react, 140], [L.brakeFirm, 280], [L.stop, 420], [L.checkAround, 560]].map(([s, x], i) => `${num(x, 70, i + 1)}${t(x, 110, s, 'middle', 'd-label d-strong')}`).join('')}
    ${path('M120,178 L520,178', 'o', true)}`,

  manoeuvres: (L) => `${grass}<rect x="0" y="40" width="300" height="300" class="d-road"/><rect x="0" y="20" width="30" height="340" class="d-pavement"/>
    ${car(60, 90, 0, 'parked', 0.9)}${car(60, 300, 0, 'parked', 0.9)}
    <g opacity=".35">${car(150, 110, 0)}</g><g opacity=".6">${car(110, 180, 25)}</g>${car(62, 210, 0)}
    ${path('M150,140 C150,170 70,170 64,230', 'g')}${t(150, 30, L.parallelPark, 'middle', 'd-label d-strong')}
    <rect x="330" y="40" width="310" height="300" class="d-road"/>
    ${[0, 1, 2, 3, 4].map((i) => `<line x1="${360 + i * 60}" y1="60" x2="${360 + i * 60}" y2="170" class="d-bay"/>`).join('')}
    ${car(390, 110, 0, 'parked', 0.9)}${car(510, 110, 180, 'parked', 0.9)}
    <g opacity=".4">${car(560, 260, 90)}</g>${car(450, 120, 0)}
    ${path('M560,240 C520,240 452,220 450,155', 'g')}${t(485, 30, L.bayPark, 'middle', 'd-label d-strong')}
    ${t(320, 350, L.slowly, 'middle', 'd-label d-go-text')}`,

  dual: (L) => `${grass}<rect x="0" y="80" width="640" height="150" class="d-road"/><line x1="0" y1="155" x2="640" y2="155" class="d-lane"/>
    <rect x="0" y="60" width="640" height="16" class="d-reserve"/>
    <path d="M640,330 C440,330 360,240 220,232 L0,232" class="d-road-curve d-slip"/>
    ${car(520, 192, -90, 'other')}${car(390, 290, -70)}
    ${path('M360,282 C310,260 260,238 170,232', 'g')}
    ${cone('M405,282 L580,300 L560,250 Z', 'd-mirror-cone')}${t(510, 350, L.slipRoad, 'middle', 'd-label')}
    ${t(180, 290, L.checkRight, 'middle', 'd-label d-small')}${t(120, 125, L.keepLeft, 'middle', 'd-label d-strong')}`,

  independent: (L) => `<rect width="640" height="360" class="d-paper"/>
    <rect x="80" y="70" width="190" height="230" rx="22" class="d-device"/><rect x="95" y="90" width="160" height="170" rx="8" class="d-screen"/>
    <path d="M140,240 L140,170 C140,140 170,130 215,130" class="d-path d-go-stroke" marker-end="url(#g-@ID)"/>
    <rect x="360" y="70" width="210" height="140" rx="10" class="d-sign"/>
    <path d="M465,190 L465,120 M465,120 L420,120 M465,120 L510,120" class="d-sign-road"/>
    ${t(400, 105, 'A12', 'middle', 'd-sign-text')}${t(530, 105, 'Ilford', 'middle', 'd-sign-text')}
    ${t(320, 320, L.satNav, 'middle', 'd-label d-strong')}${t(320, 348, L.wrongTurn, 'middle', 'd-label d-small')}`,

  test: (L) => `<rect width="640" height="360" class="d-paper"/>
    <rect x="160" y="30" width="320" height="300" rx="16" class="d-panel"/>
    ${[L.mock, L.showMe, L.manoeuvresShort, L.calm].map((s, i) => `<rect x="195" y="${70 + i * 62}" width="30" height="30" rx="6" class="d-check"/><path d="M201,${86 + i * 62} l7,7 l14,-16" class="d-tick"/>${t(245, 92 + i * 62, s, 'start', 'd-label d-strong')}`).join('')}`,
};

export function diagram(id, L) {
  const fn = D[id];
  if (!fn) return '';
  const uid = `${id}-${Math.random().toString(36).slice(2, 7)}`;
  return `<svg class="diagram" viewBox="0 0 640 360" role="img" xmlns="http://www.w3.org/2000/svg">${defs(uid)}${fn(L).replaceAll('@ID', uid)}</svg>`;
}

export const HAS_DIAGRAM = Object.keys(D);
