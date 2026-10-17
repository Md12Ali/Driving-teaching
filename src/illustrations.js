// Original illustrations (flat style), drawn in code: free to use, sharp at any size,
// and they switch colours for dark mode. Canvas: 1200 x 420.

let n = 0;
const W = 1200, H = 420;

/* ---------- building blocks ---------- */
const sky = (id) => `<defs>
  <linearGradient id="sky${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--il-sky1)"/><stop offset="1" style="stop-color:var(--il-sky2)"/></linearGradient>
  <linearGradient id="road${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--il-road2)"/><stop offset="1" style="stop-color:var(--il-road1)"/></linearGradient>
</defs><rect width="${W}" height="${H}" fill="url(#sky${id})"/>`;

const sun = (x, y, r = 46) => `<circle cx="${x}" cy="${y}" r="${r + 22}" style="fill:var(--il-sun)" opacity=".18"/><circle cx="${x}" cy="${y}" r="${r}" style="fill:var(--il-sun)"/>`;
const cloud = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" style="fill:var(--il-cloud)"><ellipse cx="0" cy="0" rx="46" ry="18"/><ellipse cx="-26" cy="4" rx="28" ry="14"/><ellipse cx="18" cy="-12" rx="30" ry="20"/><ellipse cx="40" cy="4" rx="26" ry="13"/></g>`;
const hills = (y, cls = 'il-hill1', amp = 40) => `<path d="M0 ${y} C 200 ${y - amp} 380 ${y + amp * 0.4} 600 ${y - amp * 0.6} S 1000 ${y + amp * 0.3} 1200 ${y - amp * 0.8} V ${H} H 0 Z" class="${cls}"/>`;
const ground = (y, cls = 'il-grass') => `<rect x="0" y="${y}" width="${W}" height="${H - y}" class="${cls}"/>`;
const tree = (x, y, s = 1, v = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-5" y="-6" width="10" height="40" rx="3" class="il-trunk"/><circle cx="0" cy="-30" r="34" class="${v === 1 ? 'il-leaf1' : 'il-leaf2'}"/><circle cx="-18" cy="-14" r="22" class="${v === 1 ? 'il-leaf2' : 'il-leaf1'}"/><circle cx="20" cy="-18" r="24" class="il-leaf1" opacity=".9"/></g>`;
const bush = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" class="il-leaf2"><circle cx="0" cy="0" r="18"/><circle cx="20" cy="4" r="14"/><circle cx="-18" cy="4" r="13"/></g>`;

function house(x, y, w = 120, h = 100, body = '#f4d6b0', roof = '#b85c38', door = '#2a72cf') {
  const win = (wx, wy) => `<rect x="${wx}" y="${wy}" width="22" height="24" rx="3" class="il-window"/><path d="M${wx + 11} ${wy}v24M${wx} ${wy + 12}h22" stroke="#fff" stroke-width="2" opacity=".7"/>`;
  return `<g transform="translate(${x} ${y})">
    <rect x="0" y="${-h}" width="${w}" height="${h}" fill="${body}"/>
    <path d="M-10 ${-h} L${w / 2} ${-h - 46} L${w + 10} ${-h} Z" fill="${roof}"/>
    <rect x="${w / 2 - 13}" y="-44" width="26" height="44" rx="3" fill="${door}"/>
    ${win(14, -h + 22)}${win(w - 36, -h + 22)}${h > 80 ? win(14, -54) + win(w - 36, -54) : ''}
  </g>`;
}

function shop(x, y, w, h, body, awning, label) {
  return `<g transform="translate(${x} ${y})"><rect x="0" y="${-h}" width="${w}" height="${h}" fill="${body}"/>
    <rect x="10" y="-62" width="${w - 20}" height="52" rx="4" class="il-window"/>
    <path d="M0 ${-h + 40} h${w} v22 ${Array.from({ length: Math.floor(w / 20) }, () => 'q-10 12 -20 0').join(' ')} Z" fill="${awning}"/>
    <rect x="12" y="${-h + 10}" width="${w - 24}" height="24" rx="4" fill="#fff" opacity=".9"/><text x="${w / 2}" y="${-h + 27}" text-anchor="middle" font-size="14" font-weight="800" fill="#334155">${label}</text></g>`;
}

// Side-view hatchback. dir = 1 faces right, -1 faces left.
function car(x, y, s = 1, color = '#ffffff', dir = 1, learner = false) {
  return `<g transform="translate(${x} ${y}) scale(${s * dir} ${s})">
    <ellipse cx="0" cy="4" rx="96" ry="8" fill="#000" opacity=".18"/>
    <path d="M-92 -10 Q-94 -40 -70 -44 L-40 -48 Q-22 -78 18 -80 L44 -80 Q66 -78 80 -50 L92 -44 Q100 -40 98 -12 Z" fill="${color}" stroke="#1e293b" stroke-width="3" stroke-linejoin="round"/>
    <path d="M-30 -50 Q-16 -72 14 -73 L14 -50 Z" class="il-glass"/><path d="M22 -73 L42 -73 Q58 -71 70 -50 L22 -50 Z" class="il-glass"/>
    <rect x="86" y="-40" width="10" height="7" rx="2" fill="#fde68a"/><rect x="-94" y="-38" width="7" height="8" rx="2" fill="#ef4444"/>
    ${learner ? `<g transform="translate(-10 -48) scale(${dir} 1)"><rect x="-12" y="-1" width="24" height="22" rx="2" fill="#fff" stroke="#cbd5e1"/><text x="0" y="17" text-anchor="middle" font-size="18" font-weight="900" fill="#dc2626" font-family="Arial">L</text></g>` : ''}
    ${[-54, 56].map((wx) => `<circle cx="${wx}" cy="-8" r="19" fill="#1f2937"/><circle cx="${wx}" cy="-8" r="8" fill="#cbd5e1"/>`).join('')}
  </g>`;
}

// Car seen from behind, for scenes looking down the road.
function rearCar(x, y, s = 1, color = '#ffffff', learner = false) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="6" rx="78" ry="9" fill="#000" opacity=".2"/>
    <rect x="-70" y="-26" width="22" height="30" rx="6" fill="#1f2937"/><rect x="48" y="-26" width="22" height="30" rx="6" fill="#1f2937"/>
    <path d="M-72 -10 L-66 -60 Q-62 -70 -50 -72 L50 -72 Q62 -70 66 -60 L72 -10 Q72 0 62 0 L-62 0 Q-72 0 -72 -10 Z" fill="${color}" stroke="#1e293b" stroke-width="3"/>
    <path d="M-46 -112 Q-40 -122 -28 -122 L28 -122 Q40 -122 46 -112 L56 -72 L-56 -72 Z" fill="${color}" stroke="#1e293b" stroke-width="3"/>
    <path d="M-40 -110 L40 -110 L48 -78 L-48 -78 Z" class="il-glass"/>
    <rect x="-66" y="-56" width="26" height="12" rx="3" fill="#ef4444"/><rect x="40" y="-56" width="26" height="12" rx="3" fill="#ef4444"/>
    <rect x="-22" y="-34" width="44" height="14" rx="2" fill="#facc15"/>
    ${learner ? '<g transform="translate(-12 -66)"><rect x="0" y="0" width="24" height="24" rx="2" fill="#fff" stroke="#cbd5e1"/><text x="12" y="19" text-anchor="middle" font-size="19" font-weight="900" fill="#dc2626" font-family="Arial">L</text></g>' : ''}
  </g>`;
}

const person = (x, y, s = 1, shirt = '#dc2626', pants = '#1e293b') => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-9" y="-36" width="7" height="36" rx="3" fill="${pants}"/><rect x="2" y="-36" width="7" height="36" rx="3" fill="${pants}"/><rect x="-13" y="-76" width="26" height="44" rx="10" fill="${shirt}"/><circle cx="0" cy="-90" r="12" fill="#c68a5e"/></g>`;
const cyclist = (x, y, s = 1, dir = 1) => `<g transform="translate(${x} ${y}) scale(${s * dir} ${s})"><circle cx="-30" cy="-18" r="18" fill="none" stroke="#1f2937" stroke-width="5"/><circle cx="32" cy="-18" r="18" fill="none" stroke="#1f2937" stroke-width="5"/><path d="M-30 -18 L-4 -18 L18 -46 L32 -18 M-4 -18 L-14 -46 M14 -50 L24 -50" stroke="#2a72cf" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M-12 -46 L6 -84 L18 -50" stroke="#f59e0b" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="10" cy="-96" r="11" fill="#c68a5e"/><path d="M0 -104 q10 -10 22 0" stroke="#dc2626" stroke-width="6" fill="none"/></g>`;
const post = (x, y, h) => `<rect x="${x - 4}" y="${y - h}" width="8" height="${h}" rx="3" fill="#64748b"/>`;
const trafficLight = (x, y, on = 'g') => `${post(x, y, 120)}<rect x="${x - 18}" y="${y - 200}" width="36" height="90" rx="8" fill="#111827"/>
  <circle cx="${x}" cy="${y - 182}" r="11" fill="${on === 'r' ? '#ef4444' : '#3b3f46'}"/><circle cx="${x}" cy="${y - 155}" r="11" fill="${on === 'a' ? '#f59e0b' : '#3b3f46'}"/><circle cx="${x}" cy="${y - 128}" r="11" fill="${on === 'g' ? '#22c55e' : '#3b3f46'}"/>`;
const giveWay = (x, y) => `${post(x, y, 110)}<path d="M${x - 40} ${y - 170} L${x + 40} ${y - 170} L${x} ${y - 104} Z" fill="#fff" stroke="#dc2626" stroke-width="10" stroke-linejoin="round"/>`;
const speedSign = (x, y, v) => `${post(x, y, 100)}<circle cx="${x}" cy="${y - 132}" r="36" fill="#fff" stroke="#dc2626" stroke-width="9"/><text x="${x}" y="${y - 120}" text-anchor="middle" font-size="32" font-weight="900" fill="#111827" font-family="Arial">${v}</text>`;
const roundaboutSign = (x, y) => `${post(x, y, 100)}<circle cx="${x}" cy="${y - 136}" r="40" fill="#1d5fae" stroke="#fff" stroke-width="4"/>
  ${[0, 120, 240].map((a) => `<g transform="rotate(${a} ${x} ${y - 136})"><path d="M${x - 6} ${y - 162} A26 26 0 0 1 ${x + 22} ${y - 146}" stroke="#fff" stroke-width="7" fill="none"/><path d="M${x + 14} ${y - 152} L${x + 28} ${y - 142} L${x + 12} ${y - 136} Z" fill="#fff"/></g>`).join('')}`;
const mwaySign = (x, y) => `${post(x - 60, y, 90)}${post(x + 60, y, 90)}<rect x="${x - 100}" y="${y - 190}" width="200" height="104" rx="10" fill="#1d5fae" stroke="#fff" stroke-width="5"/>
  <text x="${x - 70}" y="${y - 150}" font-size="22" font-weight="800" fill="#fff" font-family="Arial">M25</text><text x="${x - 70}" y="${y - 112}" font-size="20" font-weight="700" fill="#fff" font-family="Arial">London</text>
  <path d="M${x + 50} ${y - 108} V${y - 160} M${x + 36} ${y - 146} L${x + 50} ${y - 162} L${x + 64} ${y - 146}" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/>`;
const cone = (x, y) => `<path d="M${x - 14} ${y} L${x} ${y - 40} L${x + 14} ${y} Z" fill="#f97316"/><rect x="${x - 9}" y="${y - 24}" width="18" height="6" fill="#fff"/><rect x="${x - 18}" y="${y - 3}" width="36" height="6" rx="2" fill="#f97316"/>`;
const flag = (x, y) => `${post(x, y, 140)}<g transform="translate(${x + 4} ${y - 140})">${[0, 1, 2, 3].map((r) => [0, 1, 2, 3, 4].map((c) => `<rect x="${c * 14}" y="${r * 12}" width="14" height="12" fill="${(r + c) % 2 ? '#111827' : '#fff'}"/>`).join('')).join('')}</g>`;
const badge = (x, y, r = 46) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#16a34a"/><circle cx="${x}" cy="${y}" r="${r - 8}" fill="none" stroke="#fff" stroke-width="4" opacity=".6"/><path d="M${x - 20} ${y} L${x - 6} ${y + 15} L${x + 22} ${y - 14}" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
const flatRoad = (y, h = 70) => `<rect x="0" y="${y}" width="${W}" height="${h}" class="il-roadflat"/><rect x="0" y="${y - 8}" width="${W}" height="8" class="il-kerb"/><path d="M0 ${y + h / 2} H${W}" stroke="#f8fafc" stroke-width="4" stroke-dasharray="36 28" opacity=".8"/>`;

/* ---------- scenes ---------- */
const SCENES = {
  hero: (id) => `${sky(id)}${sun(1090, 96, 50)}${cloud(220, 90, 1.2)}${cloud(720, 70, 0.9)}${hills(260, 'il-hill2', 50)}${hills(300, 'il-hill1', 40)}
    <path d="M520 420 C 560 360 760 350 760 300 C 760 262 600 262 640 228 C 670 204 820 214 850 196" fill="none" class="il-road-s" stroke-width="70" stroke-linecap="round"/>
    <path d="M520 420 C 560 360 760 350 760 300 C 760 262 600 262 640 228 C 670 204 820 214 850 196" fill="none" stroke="#f8fafc" stroke-width="4" stroke-dasharray="20 18" opacity=".8"/>
    ${[[600, 382, 1, '#0ea5e9'], [742, 330, 2, '#8b5cf6'], [700, 268, 3, '#f97316'], [660, 232, 4, '#10b981']].map(([x, y, k, c]) => `<circle cx="${x}" cy="${y}" r="15" fill="${c}" stroke="#fff" stroke-width="4"/><text x="${x}" y="${y + 6}" text-anchor="middle" font-size="16" font-weight="800" fill="#fff">${k}</text>`).join('')}
    ${flag(848, 200)}
    ${tree(120, 340, 1.4)}${tree(300, 360, 1.1, 2)}${tree(1040, 330, 1.3, 2)}${tree(1150, 360, 1)}${bush(960, 380, 1.2)}
    ${car(330, 400, 1.05, '#ffffff', 1, true)}`,

  first: (id) => `${sky(id)}${sun(1040, 100)}${cloud(260, 80)}${hills(250, 'il-hill2', 30)}${ground(280, 'il-grass')}
    <path d="M0 300 H1200 V420 H0 Z" class="il-tarmac"/>
    ${[160, 360, 560, 760, 960].map((x) => `<path d="M${x} 300 L${x - 60} 420" stroke="#f8fafc" stroke-width="5" opacity=".75"/>`).join('')}
    ${cone(700, 380)}${cone(820, 380)}${cone(940, 380)}${cone(1060, 380)}
    ${tree(80, 290, 1.1)}${tree(1140, 290, 1.1, 2)}
    ${car(400, 392, 1.15, '#ffffff', 1, true)}`,

  junctions: (id) => `${sky(id)}${cloud(900, 80, 1.1)}${sun(180, 100, 40)}${hills(240, 'il-hill2', 30)}${ground(250)}
    ${house(40, 300, 130, 110, '#f4d6b0', '#b85c38')}${house(200, 300, 120, 100, '#e7e5e4', '#475569', '#16a34a')}${house(880, 300, 140, 110, '#fde68a', '#9a3412')}${house(1050, 300, 120, 100, '#fecaca', '#7c2d12', '#1e293b')}
    <path d="M360 420 L560 250 L640 250 L840 420 Z" fill="url(#road${id})"/>
    <path d="M600 250 V420" stroke="#f8fafc" stroke-width="5" stroke-dasharray="24 20" opacity=".8"/>
    <path d="M440 352 L360 352 L360 300 L500 300 Z" fill="url(#road${id})"/>
    <path d="M500 300 L520 284" stroke="#f8fafc" stroke-width="5" stroke-dasharray="8 6"/><path d="M490 312 L512 294" stroke="#f8fafc" stroke-width="5" stroke-dasharray="8 6"/>
    ${giveWay(470, 330)}${rearCar(520, 404, 0.8, '#ffffff', true)}${rearCar(578, 268, 0.22, '#ef4444')}${bush(320, 320)}${bush(880, 330, 1.2)}`,

  traffic: (id) => `${sky(id)}${cloud(320, 70)}${cloud(980, 100, 0.8)}
    ${[0, 1, 2, 3, 4, 5, 6].map((i) => house(i * 172, 290, 172, 150, ['#f4d6b0', '#e7e5e4', '#fde68a', '#fecaca', '#d9f99d', '#e0e7ff', '#f4d6b0'][i], ['#9a3412', '#475569', '#7c2d12', '#334155', '#9a3412', '#1e293b', '#475569'][i], ['#2a72cf', '#16a34a', '#dc2626', '#1e293b', '#7c3aed', '#0f766e', '#b45309'][i])).join('')}
    <rect x="0" y="290" width="${W}" height="18" class="il-kerb"/>${flatRoad(308, 112)}
    ${car(420, 352, 0.75, '#94a3b8', 1)}${car(600, 352, 0.75, '#2a72cf', 1)}${car(780, 352, 0.75, '#64748b', 1)}
    ${car(150, 356, 0.75, '#ffffff', 1, true)}${car(980, 412, 0.85, '#ef4444', -1)}`,

  roundabouts: (id) => `${sky(id)}${sun(1060, 90, 40)}${cloud(500, 70)}${hills(240, 'il-hill2', 30)}${ground(250)}
    <ellipse cx="640" cy="370" rx="520" ry="80" fill="url(#road${id})"/><ellipse cx="640" cy="362" rx="210" ry="34" class="il-island"/>${tree(640, 350, 0.8, 2)}
    <path d="M300 320 Q640 270 980 320" stroke="#f8fafc" stroke-width="4" stroke-dasharray="22 18" fill="none" opacity=".7"/>
    ${roundaboutSign(150, 330)}${trafficLight(1110, 330, 'g')}${car(900, 414, 0.8, '#ffffff', -1, true)}${car(360, 360, 0.55, '#8b5cf6', 1)}`,

  hazards: (id) => `${sky(id)}${cloud(780, 70)}
    ${shop(0, 300, 220, 170, '#e0e7ff', '#2a72cf', 'BAKERY')}${shop(220, 300, 200, 150, '#fde68a', '#dc2626', 'MARKET')}${shop(420, 300, 220, 180, '#d9f99d', '#16a34a', 'PHARMACY')}${shop(640, 300, 200, 160, '#fecaca', '#7c3aed', 'CAFÉ')}${shop(840, 300, 220, 170, '#e7e5e4', '#0f766e', 'BOOKS')}${shop(1060, 300, 160, 150, '#f4d6b0', '#b45309', 'POST')}
    <rect x="0" y="290" width="${W}" height="18" class="il-kerb"/>${flatRoad(308, 112)}
    ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${560 + i * 26}" y="312" width="16" height="104" fill="#f8fafc"/>`).join('')}
    <circle cx="548" cy="250" r="12" fill="#f59e0b"/>${post(548, 300, 40)}
    ${person(620, 366, 0.85, '#dc2626')}${person(990, 296, 0.75, '#2a72cf')}${cyclist(840, 404, 0.85, -1)}${speedSign(470, 300, 20)}
    ${car(1080, 412, 0.85, '#ffffff', -1, true)}${car(300, 352, 0.7, '#0ea5e9', 1)}`,

  manoeuvres: (id) => `<rect width="${W}" height="${H}" class="il-tarmac"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => `<path d="M${120 + i * 96} 40 V 190" stroke="#f8fafc" stroke-width="5"/><path d="M${120 + i * 96} 410 V 260" stroke="#f8fafc" stroke-width="5"/>`).join('')}
    <path d="M120 40 H1080 M120 410 H1080" stroke="#f8fafc" stroke-width="5"/>
    ${[0, 1, 2, 4, 5, 7, 8, 9].map((i) => `<g transform="translate(${168 + i * 96} 115) rotate(${i % 2 ? 180 : 0})"><rect x="-30" y="-62" width="60" height="124" rx="16" fill="${['#94a3b8', '#2a72cf', '#ef4444', '#64748b', '#10b981', '#8b5cf6', '#f59e0b', '#94a3b8', '#0ea5e9', '#e11d48'][i]}"/><rect x="-24" y="-34" width="48" height="22" rx="4" fill="#1e293b"/><rect x="-24" y="24" width="48" height="16" rx="4" fill="#1e293b"/></g>`).join('')}
    <rect x="${120 + 6 * 96 + 6}" y="46" width="84" height="140" fill="rgba(34,197,94,.3)"/>
    <path d="M940 330 C 820 330 700 300 696 170" stroke="#22c55e" stroke-width="7" stroke-dasharray="16 12" fill="none"/>
    <g transform="translate(940 330) rotate(-90)"><rect x="-30" y="-62" width="60" height="124" rx="16" fill="#fff" stroke="#1e293b" stroke-width="3"/><rect x="-24" y="-34" width="48" height="22" rx="4" fill="#1e293b"/><rect x="-24" y="24" width="48" height="16" rx="4" fill="#1e293b"/><rect x="-10" y="-6" width="20" height="18" rx="2" fill="#fff" stroke="#cbd5e1"/><text x="0" y="9" text-anchor="middle" font-size="15" font-weight="900" fill="#dc2626" font-family="Arial">L</text></g>
    <circle cx="756" cy="190" r="14" fill="#facc15" stroke="#0f172a" stroke-width="3"/>`,

  fast: (id) => `${sky(id)}${sun(200, 90, 44)}${cloud(820, 80, 1.2)}${hills(230, 'il-hill2', 26)}${ground(236)}
    <path d="M60 420 L560 236 L640 236 L1140 420 Z" fill="url(#road${id})"/>
    <path d="M600 236 L600 420" stroke="#64748b" stroke-width="12"/>
    <path d="M330 420 L580 236 M870 420 L620 236" stroke="#f8fafc" stroke-width="5" stroke-dasharray="28 22" opacity=".8"/>
    ${mwaySign(980, 330)}${rearCar(330, 404, 0.85, '#ffffff', true)}${rearCar(500, 296, 0.35, '#2a72cf')}${rearCar(560, 256, 0.16, '#ef4444')}${tree(1140, 300, 0.9, 2)}${tree(60, 300, 0.9)}`,

  test: (id) => `${sky(id)}${sun(1080, 90, 44)}${cloud(400, 70)}${hills(240, 'il-hill2', 30)}${ground(250)}
    <g transform="translate(560 300)"><rect x="0" y="-150" width="420" height="150" fill="#e2e8f0"/><rect x="0" y="-170" width="420" height="24" fill="#1d5fae"/><text x="210" y="-152" text-anchor="middle" font-size="16" font-weight="800" fill="#fff">DRIVING TEST CENTRE</text>
      ${[30, 110, 270, 350].map((x) => `<rect x="${x}" y="-120" width="50" height="40" rx="4" class="il-window"/>`).join('')}<rect x="180" y="-90" width="60" height="90" rx="4" fill="#1e293b"/></g>
    ${flag(1030, 300)}<rect x="0" y="300" width="${W}" height="120" class="il-tarmac"/>${[0, 1, 2, 3].map((i) => `<path d="M${640 + i * 110} 310 V 400" stroke="#f8fafc" stroke-width="5"/>`).join('')}
    ${car(320, 400, 1.05, '#ffffff', 1, true)}${badge(170, 150)}${tree(70, 290, 1.1)}`,
};

export function illustration(name, { label = '', cls = '' } = {}) {
  const fn = SCENES[name];
  if (!fn) return '';
  const id = `il${(n += 1)}`;
  return `<svg class="il block h-auto w-full ${cls}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">${fn(id)}</svg>`;
}
