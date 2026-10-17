// Shared UI pieces. All return HTML strings styled with Tailwind classes.
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Simple line icons (24px grid).
const P = {
  home: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21V5M8 7h7',
  car: 'M5 16l1.5-5a2 2 0 0 1 2-1.5h7a2 2 0 0 1 2 1.5L19 16M4 16h16v3H4zM7 19v1.5M17 19v1.5M7.5 13.5h.01M16.5 13.5h.01',
  cards: 'M7 4h12a1 1 0 0 1 1 1v12M4 7h12a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z',
  clipboard: 'M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1zM8 5H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2M9 12l2 2 4-4',
  users: 'M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM21 19v-1a4 4 0 0 0-3-3.9M15 4.1a3 3 0 0 1 0 5.8',
  film: 'M4 4h16v16H4zM8 4v16M16 4v16M4 9h4M4 15h4M16 9h4M16 15h4',
  sun: 'M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  moon: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',
  monitor: 'M3 5h18v11H3zM8 20h8M12 16v4',
  check: 'M5 12l5 5L20 7',
  x: 'M6 6l12 12M18 6 6 18',
  chevR: 'M9 6l6 6-6 6',
  chevL: 'M15 6l-6 6 6 6',
  play: 'M7 4l13 8-13 8z',
  pause: 'M7 4h3v16H7zM14 4h3v16h-3z',
  shuffle: 'M3 7h4l10 10h4M3 17h4l3-3M14 10l3-3h4M18 4l3 3-3 3M18 14l3 3-3 3',
  flip: 'M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  upload: 'M12 20V9M7 14l5-5 5 5M5 4h14',
  print: 'M7 9V3h10v6M7 17H5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2M7 14h10v7H7z',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  steer: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM12 14.5V21M9.6 11.2 3.4 9.5M14.4 11.2l6.2-1.7',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12h.01',
  alert: 'M12 3l10 18H2zM12 10v5M12 18h.01',
  bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z',
  edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
  flag: 'M5 21V4M5 4h11l-2 4 2 4H5',
  arrowR: 'M5 12h14M13 6l6 6-6 6',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01',
  route: 'M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6 15V9a4 4 0 0 1 4-4h2M18 9v6a4 4 0 0 1-4 4h-2',
  grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
};
export const icon = (name, cls = 'size-5') => `<svg class="${cls} shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${P[name] || ''}"/></svg>`;

// Status badges: Green = Mastered, Amber = Practising, Grey = Not started.
export const STATUS = {
  mastered: { label: 'Mastered', cls: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/30', dot: 'bg-emerald-500', bar: 'bg-emerald-500' },
  practising: { label: 'Practising', cls: 'bg-amber-100 text-amber-900 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/30', dot: 'bg-amber-500', bar: 'bg-amber-500' },
  none: { label: 'Not started', cls: 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-500/15 dark:text-slate-300 dark:ring-slate-400/25', dot: 'bg-slate-400', bar: 'bg-slate-400' },
};
export const badge = (status, extra = '') => {
  const s = STATUS[status] || STATUS.none;
  return `<span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${s.cls} ${extra}"><span class="size-1.5 rounded-full ${s.dot}"></span>${s.label}</span>`;
};

// Level colours for the self-assessment (0-3).
export const LEVEL_STYLE = [
  'aria-pressed:bg-slate-600 aria-pressed:text-white dark:aria-pressed:bg-slate-500',
  'aria-pressed:bg-amber-400 aria-pressed:text-amber-950',
  'aria-pressed:bg-amber-500 aria-pressed:text-white',
  'aria-pressed:bg-emerald-600 aria-pressed:text-white',
];

export function bar(pct, cls = 'bg-brand-600 dark:bg-brand-400', h = 'h-2') {
  return `<div class="${h} w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><div class="h-full rounded-full ${cls} transition-[width] duration-500" style="width:${pct}%"></div></div>`;
}

export function ring(pct, size = 140, label = 'Test ready') {
  const r = 52, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
  return `<div class="relative shrink-0" style="width:${size}px;height:${size}px">
    <svg viewBox="0 0 120 120" class="size-full -rotate-90" aria-hidden="true">
      <circle cx="60" cy="60" r="${r}" fill="none" stroke-width="12" class="stroke-slate-200 dark:stroke-slate-800"/>
      <circle cx="60" cy="60" r="${r}" fill="none" stroke-width="12" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}" class="stroke-brand-600 transition-[stroke-dashoffset] duration-700 dark:stroke-brand-400"/>
    </svg>
    <div class="absolute inset-0 grid place-content-center text-center"><span class="text-3xl font-extrabold tabular-nums tracking-tight">${pct}%</span><span class="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">${esc(label)}</span></div>
  </div>`;
}

export const card = 'rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900';
export const btn = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[.98] disabled:opacity-50';
export const btnPrimary = `${btn} bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-400 dark:text-slate-950`;
export const btnGhost = `${btn} border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800`;
export const btnDanger = `${btn} border border-red-300 bg-white text-red-700 hover:bg-red-50 dark:border-red-500/40 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-500/10`;

export const PHASE_STYLE = {
  1: { chip: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300', bar: 'bg-sky-500', ring: 'ring-sky-500/30', text: 'text-sky-700 dark:text-sky-300' },
  2: { chip: 'bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300', bar: 'bg-violet-500', ring: 'ring-violet-500/30', text: 'text-violet-700 dark:text-violet-300' },
  3: { chip: 'bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300', bar: 'bg-orange-500', ring: 'ring-orange-500/30', text: 'text-orange-700 dark:text-orange-300' },
  4: { chip: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300', bar: 'bg-emerald-500', ring: 'ring-emerald-500/30', text: 'text-emerald-700 dark:text-emerald-300' },
};
export const phaseChip = (p, title) => `<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${PHASE_STYLE[p].chip}">Phase ${p}${title ? ` · ${esc(title)}` : ''}</span>`;

export function pageHead(kicker, title, intro = '', actions = '') {
  return `<header class="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div class="max-w-2xl"><p class="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">${esc(kicker)}</p>
      <h1 class="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">${esc(title)}</h1>
      ${intro ? `<p class="mt-2 text-slate-600 dark:text-slate-400">${intro}</p>` : ''}</div>
    ${actions ? `<div class="flex flex-wrap gap-2">${actions}</div>` : ''}
  </header>`;
}

let toastTimer;
export function toast(msg) {
  const el = $('[data-toast]');
  el.textContent = msg;
  el.hidden = false;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 2400);
}

export function download(filename, text, type = 'application/json') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = filename;
  document.body.append(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

export const fmtDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? esc(iso) : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};
