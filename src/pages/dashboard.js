import { PHASES, LESSONS, lessonsInPhase } from '../data/curriculum.js';
import { TELL_ME, SHOW_ME } from '../data/showme.js';
import { MANOEUVRES } from '../data/manoeuvres.js';
import { store, readiness, phaseScore, lessonScore, nextLesson, mockResult, routeProgress } from '../store.js';
import { SESSIONS, STAGES } from '../data/route.js';
import { illustration } from '../illustrations.js';
import { esc, icon, ring, bar, badge, card, btnPrimary, btnGhost, PHASE_STYLE, STATUS, fmtDate } from '../ui.js';

export function render(root) {
  const st = store.active;
  const r = readiness(st);
  const next = nextLesson(st);
  const mocks = store.mocks;
  const last = mocks[0];
  const lr = last ? mockResult(last) : null;
  const known = [...TELL_ME, ...SHOW_ME].filter((q) => st.showme[q.id] === 'known').length;

  const rp = routeProgress(st);
  const cur = rp.current;
  const curStage = cur ? STAGES.find((x) => x.id === cur.stage) : null;

  root.innerHTML = `
  <section class="${card} relative mb-6 overflow-hidden">
    <div class="h-80 w-full sm:h-auto sm:aspect-[3/1]">${illustration('hero', { label: 'The road from first lesson to test pass', cls: 'h-full' })}</div>
    <div class="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-slate-950/10 sm:bg-gradient-to-r sm:from-slate-950/80 sm:via-slate-950/30"></div>
    <div class="absolute inset-x-0 bottom-0 p-5 sm:inset-y-0 sm:right-auto sm:flex sm:max-w-lg sm:flex-col sm:justify-center sm:p-8">
      <p class="text-xs font-bold uppercase tracking-wider text-amber-300">Teaching route · ${rp.done}/${rp.total} sessions done</p>
      ${cur ? `<h1 class="mt-1 text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">Session ${SESSIONS.indexOf(cur) + 1}: ${esc(cur.title)}</h1>
        <p class="mt-1 text-sm text-white/80">Stage ${curStage.id} · ${esc(curStage.title)} · ${esc(cur.where)}</p>
        <div class="mt-4 flex flex-wrap gap-2"><a href="#/route/${cur.id}" class="${btnPrimary}">Open lesson plan ${icon('arrowR', 'size-4')}</a><a href="#/route" class="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur hover:bg-white/25">${icon('route', 'size-4')} Full route</a></div>`
        : '<h1 class="mt-1 text-2xl font-extrabold text-white">Route complete. Ready for the test!</h1>'}
    </div>
  </section>

  <section class="${card} overflow-hidden">
    <div class="flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:p-7">
      ${ring(r.pct, 148)}
      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">Progress for</p>
        <h2 class="truncate text-2xl font-extrabold tracking-tight sm:text-3xl">${esc(st.name)}</h2>
        <div class="mt-3 flex flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"><span class="size-2 rounded-full bg-emerald-500"></span>${r.mastered} mastered</span>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900 dark:bg-amber-500/15 dark:text-amber-300"><span class="size-2 rounded-full bg-amber-500"></span>${r.practising} practising</span>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 dark:bg-slate-500/15 dark:text-slate-300"><span class="size-2 rounded-full bg-slate-400"></span>${r.none} not started</span>
        </div>
        <p class="mt-3 text-sm text-slate-600 dark:text-slate-400">${icon('book', 'inline size-4 -mt-0.5')} ${r.studied} of ${r.total} lessons studied before the car</p>
      </div>
      <div class="flex flex-col gap-2 sm:w-64">
        ${next ? `<a href="#/lesson/${next.id}" class="${btnPrimary} justify-between"><span class="truncate">Next: ${esc(next.title)}</span>${icon('arrowR', 'size-4')}</a>` : `<p class="rounded-xl bg-emerald-100 p-3 text-sm font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">Every lesson mastered. Time for mock tests!</p>`}
        <a href="#/mock-test/new" class="${btnGhost}">${icon('clipboard', 'size-4')} Start a mock test</a>
      </div>
    </div>
    <div class="border-t border-slate-100 px-5 py-3 text-xs text-slate-500 sm:px-7 dark:border-slate-800 dark:text-slate-400">Test readiness = how far every skill on the checklists has moved from <b>Not started</b> to <b>Independent</b>.</div>
  </section>

  <h2 class="mb-3 mt-8 text-lg font-extrabold tracking-tight">Curriculum</h2>
  <div class="grid gap-4 sm:grid-cols-2">
    ${PHASES.map((p) => {
      const s = phaseScore(p.id, st);
      const ls = lessonsInPhase(p.id);
      return `<a href="#/curriculum?phase=${p.id}" class="${card} group block p-5 transition hover:-translate-y-0.5 hover:shadow-md">
        <div class="flex items-start justify-between gap-3">
          <div><p class="text-xs font-bold uppercase tracking-wider ${PHASE_STYLE[p.id].text}">Phase ${p.id}</p><h3 class="text-lg font-extrabold tracking-tight">${esc(p.title)}</h3></div>
          <span class="text-2xl font-extrabold tabular-nums">${s.pct}%</span>
        </div>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">${esc(p.summary)}</p>
        <div class="mt-4">${bar(s.pct, PHASE_STYLE[p.id].bar)}</div>
        <div class="mt-3 flex flex-wrap gap-1.5" aria-label="Lesson status">
          ${ls.map((l) => `<span title="${esc(l.title)}: ${STATUS[lessonScore(l, st).status].label}" class="size-3 rounded-full ${STATUS[lessonScore(l, st).status].dot}"></span>`).join('')}
        </div>
        <p class="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">${s.mastered} of ${s.total} lessons mastered</p>
      </a>`;
    }).join('')}
  </div>

  <div class="mt-8 grid gap-4 lg:grid-cols-3">
    <a href="${last ? `#/mock-test/${last.id}` : '#/mock-test/new'}" class="${card} block p-5 transition hover:shadow-md">
      <div class="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">${icon('clipboard', 'size-4')} Latest mock test</div>
      ${last ? `
        <p class="mt-2 text-xl font-extrabold ${lr.pass ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}">${lr.pass ? 'Pass' : 'Fail'}</p>
        <p class="text-sm text-slate-600 dark:text-slate-400">${fmtDate(last.date)} · ${lr.d} driving · ${lr.s} serious · ${lr.x} dangerous</p>
        <p class="mt-2 text-xs text-slate-500">${mocks.length} mock test${mocks.length === 1 ? '' : 's'} recorded</p>`
        : '<p class="mt-2 text-sm text-slate-600 dark:text-slate-400">No mock tests yet. Record one on the digital test sheet.</p>'}
    </a>
    <a href="#/show-me-tell-me" class="${card} block p-5 transition hover:shadow-md">
      <div class="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">${icon('cards', 'size-4')} Show me, tell me</div>
      <p class="mt-2 text-xl font-extrabold tabular-nums">${known} / 21 known</p>
      <div class="mt-3">${bar(Math.round((known / 21) * 100), 'bg-emerald-500')}</div>
      <p class="mt-2 text-xs text-slate-500">14 tell me · 7 show me questions</p>
    </a>
    <div class="${card} p-5">
      <div class="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">${icon('steer', 'size-4')} Manoeuvre cheat-sheets</div>
      <ul class="mt-2 divide-y divide-slate-100 dark:divide-slate-800">
        ${MANOEUVRES.map((m) => {
          const l = LESSONS.find((x) => x.id === m.lesson);
          return `<li><a href="#/manoeuvres/${m.id}" class="flex items-center justify-between gap-2 py-2 text-sm font-semibold hover:text-brand-600 dark:hover:text-brand-400">${esc(m.title)} ${badge(lessonScore(l, st).status)}</a></li>`;
        }).join('')}
      </ul>
    </div>
  </div>

  <p class="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
    <span class="font-semibold">Status key:</span> ${badge('mastered')} every skill Independent ${badge('practising')} in progress ${badge('none')} not started yet
  </p>`;
}
