// Small SVG drawing kit for the teaching pictures.
// Canvas is 640 x 360. Angles in degrees: 0 = car facing up (north), 90 = facing right (east).
// UK roads: on a road running up/down, northbound traffic uses the LEFT half;
// on a road running left/right, eastbound traffic uses the TOP half.

export const W = 640;
export const H = 360;

export const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

let uid = 0;
export function svg(body, { label = '', vb = `0 0 ${W} ${H}`, cls = '' } = {}) {
  const id = `m${(uid += 1)}`;
  const m = (name, colour) => `<marker id="${name}-${id}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="${colour}"/></marker>`;
  return `<svg class="dg block h-auto w-full ${cls}" viewBox="${vb}" role="img" aria-label="${esc(label)}" xmlns="http://www.w3.org/2000/svg">
    <defs>${m('ag', 'f-go')}${m('ab', 'f-blu')}${m('aa', 'f-amb')}${m('ar', 'f-red')}${m('ak', 'f-ink')}</defs>
    ${body.replaceAll('@ID', id)}</svg>`;
}

// Text with a soft halo so it reads on roads and grass.
export const t = (x, y, s, cls = '', anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}" class="txt ${cls}">${esc(s)}</text>`;

const ARROW = { g: 'ag', b: 'ab', a: 'aa', r: 'ar', k: 'ak' };
const STROKE = { g: 'p-go', b: 'p-blu', a: 'p-amb', r: 'p-red', k: 'p-ink' };
export const path = (d, c = 'g', { dash = false, arrow = true, w } = {}) =>
  `<path d="${d}" class="p ${STROKE[c]}${dash ? ' dash' : ''}"${w ? ` style="stroke-width:${w}"` : ''}${arrow ? ` marker-end="url(#${ARROW[c]}-@ID)"` : ''}/>`;

export const num = (x, y, n) => `<g class="num"><circle cx="${x}" cy="${y}" r="13"/><text x="${x}" y="${y + 5}" text-anchor="middle">${n}</text></g>`;
export const pill = (x, y, w, s, v = '') => `<g class="pill ${v}"><rect x="${x - w / 2}" y="${y - 15}" width="${w}" height="30" rx="15"/><text x="${x}" y="${y + 5}" text-anchor="middle">${esc(s)}</text></g>`;
export const lead = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="lead"/>`;

// Car seen from above, centred on (x, y). kind: learner | other | parked | red | ghost-learner
export function car(x, y, a = 0, kind = 'learner', { w = 24, l = 50, cls = '' } = {}) {
  const body = { learner: 'car-l', other: 'car-o', parked: 'car-p', red: 'car-r' }[kind] || 'car-l';
  const hw = w / 2, hl = l / 2;
  const plate = kind === 'learner'
    ? `<rect x="-5" y="${hl * 0.06}" width="10" height="9" rx="1.5" fill="#fff" stroke="#cbd5e1" stroke-width=".6"/><text x="0" y="${hl * 0.06 + 7.4}" text-anchor="middle" font-size="8" font-weight="800" fill="#dc2626">L</text>`
    : '';
  return `<g transform="translate(${x} ${y}) rotate(${a})" class="${cls}">
    <rect x="${-hw}" y="${-hl}" width="${w}" height="${l}" rx="${w * 0.28}" class="${body}"/>
    <rect x="${-hw + 3}" y="${-hl * 0.5}" width="${w - 6}" height="${l * 0.17}" rx="2" class="glass"/>
    <rect x="${-hw + 3}" y="${hl * 0.42}" width="${w - 6}" height="${l * 0.13}" rx="2" class="glass"/>
    ${plate}
  </g>`;
}

export const person = (x, y, r = 7) => `<circle cx="${x}" cy="${y}" r="${r}" class="ped"/>`;
export const tree = (x, y, r = 14) => `<circle cx="${x}" cy="${y}" r="${r}" class="tree"/>`;
export function cyclist(x, y, a = 0) {
  return `<g transform="translate(${x} ${y}) rotate(${a})"><rect x="-3" y="-14" width="6" height="28" rx="3" class="f-ink"/><circle cx="0" cy="0" r="6" class="ped"/></g>`;
}

// Roads
export const grass = () => `<rect width="${W}" height="${H}" class="grass"/>`;
export const paper = () => `<rect width="${W}" height="${H}" class="paper"/>`;
export const hroad = (y, h = 90, { x1 = 0, x2 = W, centre = true, kerb = 0 } = {}) =>
  `${kerb ? `<rect x="${x1}" y="${y - kerb}" width="${x2 - x1}" height="${h + kerb * 2}" class="kerb"/>` : ''}<rect x="${x1}" y="${y}" width="${x2 - x1}" height="${h}" class="road"/>${centre ? `<line x1="${x1}" y1="${y + h / 2}" x2="${x2}" y2="${y + h / 2}" class="cline"/>` : ''}`;
export const vroad = (x, y1, y2, w = 90, { centre = true, kerb = 0 } = {}) =>
  `${kerb ? `<rect x="${x - kerb}" y="${y1}" width="${w + kerb * 2}" height="${y2 - y1}" class="kerb"/>` : ''}<rect x="${x}" y="${y1}" width="${w}" height="${y2 - y1}" class="road"/>${centre ? `<line x1="${x + w / 2}" y1="${y1}" x2="${x + w / 2}" y2="${y2}" class="cline"/>` : ''}`;
export const gw = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="gw"/>`;
export const line = (x1, y1, x2, y2, cls = 'sline') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"/>`;
