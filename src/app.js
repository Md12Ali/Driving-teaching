// App shell: navigation, hash router, top bar (student profile and theme).
import { store, theme, readiness } from './store.js';
import { lessonById } from './data/curriculum.js';
import { manoeuvreById } from './data/manoeuvres.js';
import { esc, icon, $ } from './ui.js';
import * as dashboard from './pages/dashboard.js';
import * as curriculum from './pages/curriculum.js';
import * as lesson from './pages/lesson.js';
import * as manoeuvres from './pages/manoeuvres.js';
import * as showme from './pages/showme.js';
import * as mock from './pages/mocktest.js';
import * as students from './pages/students.js';
import * as resources from './pages/resources.js';
import * as routePages from './pages/route.js';
import { sessionById } from './data/route.js';

const NAV = [
  { href: '#/', label: 'Dashboard', short: 'Home', icon: 'home', match: /^\/$/, bottom: true },
  { href: '#/route', label: 'Teaching route', short: 'Route', icon: 'route', match: /^\/route/, bottom: true },
  { href: '#/curriculum', label: 'A to Z lessons', short: 'Lessons', icon: 'book', match: /^\/(curriculum|lesson)/, bottom: true },
  { href: '#/manoeuvres', label: 'Manoeuvres', short: 'Manoeuvres', icon: 'steer', match: /^\/manoeuvres/ },
  { href: '#/show-me-tell-me', label: 'Show me, tell me', short: 'Show me', icon: 'cards', match: /^\/show-me/ },
  { href: '#/mock-test', label: 'Mock tests', short: 'Mock test', icon: 'clipboard', match: /^\/mock-test/, bottom: true },
  { href: '#/students', label: 'Students', short: 'Students', icon: 'users', match: /^\/students/ },
  { href: '#/resources', label: 'Resources', short: 'Resources', icon: 'film', match: /^\/resources/ },
  { href: '#/more', label: 'More', short: 'More', icon: 'grid', match: /^\/(more|manoeuvres|show-me|students|resources)/, bottom: true, onlyBottom: true },
];

const ROUTES = [
  [/^\/$/, (v) => dashboard.render(v), 'Dashboard'],
  [/^\/route$/, (v, q) => routePages.renderRoute(v, q), 'Teaching route'],
  [/^\/route\/([\w-]+)$/, (v, q, id) => routePages.renderSession(v, q, id), (id) => sessionById[id]?.title || 'Session'],
  [/^\/more$/, (v) => routePages.renderMore(v), 'More'],
  [/^\/curriculum$/, (v, q) => curriculum.render(v, q), 'A to Z lessons'],
  [/^\/lesson\/([\w-]+)$/, (v, q, id) => lesson.render(v, q, id), (id) => lessonById[id]?.title || 'Lesson'],
  [/^\/manoeuvres(?:\/([\w-]+))?$/, (v, q, id) => manoeuvres.render(v, q, id), (id) => `Manoeuvres · ${manoeuvreById[id]?.title || 'Parallel park'}`],
  [/^\/show-me-tell-me$/, (v) => showme.render(v), 'Show me, tell me'],
  [/^\/mock-test$/, (v) => mock.renderList(v), 'Mock tests'],
  [/^\/mock-test\/([\w-]+)$/, (v, q, id) => mock.renderSheet(v, q, id), 'Mock test sheet'],
  [/^\/students$/, (v) => students.render(v), 'Students'],
  [/^\/resources$/, (v) => resources.render(v), 'Resources'],
];

const app = $('[data-app]');
let cleanup = null;

function navHTML(kind, path) {
  if (kind === 'side') {
    return NAV.filter((n) => !n.onlyBottom).map((n) => `<a href="${n.href}" ${n.match.test(path) ? 'aria-current="page"' : ''} class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 aria-[current=page]:bg-brand-50 aria-[current=page]:text-brand-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:aria-[current=page]:bg-brand-500/15 dark:aria-[current=page]:text-brand-200">${icon(n.icon)}${n.label}</a>`).join('');
  }
  return `<div class="mx-auto grid max-w-lg grid-cols-5">${NAV.filter((n) => n.bottom).map((n) => `<a href="${n.href}" ${n.match.test(path) ? 'aria-current="page"' : ''} class="flex flex-col items-center gap-0.5 px-1 py-2 text-[11px] font-semibold text-slate-500 aria-[current=page]:text-brand-600 dark:text-slate-400 dark:aria-[current=page]:text-brand-400">${icon(n.icon, 'size-6')}${n.short}</a>`).join('')}</div>`;
}

const THEMES = [['system', 'monitor', 'System theme'], ['light', 'sun', 'Light theme'], ['dark', 'moon', 'Dark theme']];

function topbar() {
  const t = theme.get();
  const cur = THEMES.find((x) => x[0] === t) || THEMES[0];
  const r = readiness();
  $('[data-topbar]').innerHTML = `
    <a href="#/students" class="flex max-w-[11rem] items-center gap-2 rounded-full border border-slate-300 py-1 pl-1 pr-3 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800" title="Switch student">
      <span class="grid size-7 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white dark:bg-brand-400 dark:text-slate-950">${esc(store.active.name.trim().charAt(0).toUpperCase() || '?')}</span>
      <span class="truncate">${esc(store.active.name)}</span><span class="hidden text-xs text-slate-500 sm:inline">${r.pct}%</span>
    </a>
    <button class="grid size-9 place-items-center rounded-full border border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800" data-theme aria-label="${cur[2]}. Change theme" title="${cur[2]}">${icon(cur[1], 'size-4')}</button>`;
  $('[data-side-foot]').innerHTML = `<p class="px-2 text-xs text-slate-500 dark:text-slate-400">Progress is saved on this device. Export it from <a class="font-semibold underline" href="#/students">Students</a>.</p>`;
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('[data-theme]')) return;
  const i = THEMES.findIndex((x) => x[0] === theme.get());
  theme.set(THEMES[(i + 1) % THEMES.length][0]);
  topbar();
});

function route() {
  const raw = location.hash.slice(1) || '/';
  const [path, qs] = raw.split('?');
  const params = new URLSearchParams(qs || '');
  cleanup?.();
  cleanup = null;
  const view = document.createElement('div');
  let title = 'Dashboard';
  for (const [re, fn, t] of ROUTES) {
    const m = path.match(re);
    if (!m) continue;
    cleanup = fn(view, params, m[1]) || null;
    title = typeof t === 'function' ? t(m[1]) : t;
    break;
  }
  if (!view.childElementCount) { view.innerHTML = '<p class="py-10 text-center">Page not found. <a class="font-semibold text-brand-600 underline" href="#/">Go to the dashboard</a></p>'; title = 'Not found'; }
  app.replaceChildren(view);
  document.title = `${title} · Driving Teaching`;
  $('[data-crumb]').textContent = title;
  $('[data-nav=side]').innerHTML = navHTML('side', path);
  $('[data-nav=bottom]').innerHTML = navHTML('bottom', path);
  topbar();
  if (!params.get('phase') && !params.get('stage')) window.scrollTo(0, 0);
}

store.subscribe(() => topbar());
addEventListener('hashchange', route);
theme.apply();
route();
