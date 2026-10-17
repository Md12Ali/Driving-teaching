import { PHASES, LESSONS, lessonsInPhase } from '../data/curriculum.js';
import { store, lessonScore, phaseScore } from '../store.js';
import { diagram } from '../diagrams/index.js';
import { esc, icon, badge, bar, card, pageHead, PHASE_STYLE, $, $$ } from '../ui.js';

const FILTERS = [['all', 'All'], ['none', 'Not started'], ['practising', 'Practising'], ['mastered', 'Mastered']];
let filter = 'all';
let query = '';

export function render(root, params) {
  const focus = Number(params.get('phase')) || null;
  root.innerHTML = `
    ${pageHead('A to Z curriculum', 'From first lesson to test pass', 'Four phases, 30 lessons. Students: read each lesson before you drive it, then rate yourself with your instructor.')}
    <div class="mb-5 flex flex-wrap items-center gap-2">
      <div class="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        ${FILTERS.map(([k, l]) => `<button data-filter="${k}" aria-pressed="${k === filter}" class="rounded-full border border-slate-300 px-3.5 py-1.5 text-sm font-semibold aria-pressed:border-slate-900 aria-pressed:bg-slate-900 aria-pressed:text-white dark:border-slate-700 dark:aria-pressed:border-white dark:aria-pressed:bg-white dark:aria-pressed:text-slate-900">${l}</button>`).join('')}
      </div>
      <label class="ml-auto w-full sm:w-72"><span class="sr-only">Search lessons</span>
        <input type="search" data-q value="${esc(query)}" placeholder="Search, e.g. roundabout" class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900">
      </label>
    </div>
    <div data-list></div>`;

  const draw = () => {
    const q = query.trim().toLowerCase();
    const st = store.active;
    let shown = 0;
    $('[data-list]', root).innerHTML = PHASES.map((p) => {
      const ls = lessonsInPhase(p.id).filter((l) => {
        if (filter !== 'all' && lessonScore(l, st).status !== filter) return false;
        if (!q) return true;
        return [l.title, l.short, l.objective, ...l.steps.flat()].join(' ').toLowerCase().includes(q);
      });
      shown += ls.length;
      if (!ls.length) return '';
      const s = phaseScore(p.id, st);
      return `<section id="phase-${p.id}" class="mb-10 scroll-mt-20">
        <div class="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div><p class="text-xs font-bold uppercase tracking-wider ${PHASE_STYLE[p.id].text}">Phase ${p.id}</p><h2 class="text-xl font-extrabold tracking-tight">${esc(p.title)}</h2></div>
          <div class="w-full max-w-xs sm:w-56"><div class="mb-1 flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400"><span>${s.mastered}/${s.total} mastered</span><span>${s.pct}%</span></div>${bar(s.pct, PHASE_STYLE[p.id].bar)}</div>
        </div>
        <ol class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          ${ls.map((l) => {
            const sc = lessonScore(l, st);
            const n = LESSONS.indexOf(l) + 1;
            return `<li><a href="#/lesson/${l.id}" class="${card} group flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
              <div class="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">${diagram(l.diagram, l.title)}</div>
              <div class="flex flex-1 flex-col gap-2 p-4">
                <div class="flex items-center gap-2"><span class="text-xs font-bold tabular-nums text-slate-400">${String(n).padStart(2, '0')}</span>${badge(sc.status)}${st.studied[l.id] ? `<span class="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400">${icon('check', 'size-3.5')} Studied</span>` : ''}</div>
                <h3 class="font-extrabold leading-snug tracking-tight group-hover:text-brand-600 dark:group-hover:text-brand-400">${esc(l.title)}</h3>
                <p class="text-sm text-slate-600 dark:text-slate-400">${esc(l.short)}</p>
                <div class="mt-auto pt-2">${bar(sc.pct, 'bg-emerald-500', 'h-1.5')}</div>
              </div>
            </a></li>`;
          }).join('')}
        </ol>
      </section>`;
    }).join('') || `<p class="${card} p-6 text-center text-slate-600 dark:text-slate-400">No lessons match. Try another filter or search.</p>`;
  };

  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter]');
    if (!b) return;
    filter = b.dataset.filter;
    $$('[data-filter]', root).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    draw();
  });
  $('[data-q]', root).addEventListener('input', (e) => { query = e.target.value; draw(); });
  draw();
  if (focus) requestAnimationFrame(() => document.getElementById(`phase-${focus}`)?.scrollIntoView({ block: 'start' }));
}
