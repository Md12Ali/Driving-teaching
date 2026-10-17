import { STAGES, SESSIONS, sessionById, sessionsInStage, LESSON_SHAPE } from '../data/route.js';
import { lessonById } from '../data/curriculum.js';
import { MANOEUVRES } from '../data/manoeuvres.js';
import { store, routeProgress, lessonScore } from '../store.js';
import { diagram } from '../diagrams/index.js';
import { illustration } from '../illustrations.js';
import { esc, icon, card, bar, btnGhost, btnPrimary, pageHead, toast, $, $$ } from '../ui.js';

const ST = {
  none: { label: 'Not started', cls: 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-500/15 dark:text-slate-300', dot: 'bg-slate-400', num: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100' },
  doing: { label: 'In progress', cls: 'bg-amber-100 text-amber-900 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-300', dot: 'bg-amber-500', num: 'bg-amber-400 text-amber-950' },
  done: { label: 'Done', cls: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300', dot: 'bg-emerald-500', num: 'bg-emerald-600 text-white' },
};
const pill = (v) => `<span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${ST[v].cls}"><span class="size-1.5 rounded-full ${ST[v].dot}"></span>${ST[v].label}</span>`;
const STAGE_TEXT = ['', 'text-sky-700 dark:text-sky-300', 'text-violet-700 dark:text-violet-300', 'text-fuchsia-700 dark:text-fuchsia-300', 'text-orange-700 dark:text-orange-300', 'text-rose-700 dark:text-rose-300', 'text-cyan-700 dark:text-cyan-300', 'text-indigo-700 dark:text-indigo-300', 'text-emerald-700 dark:text-emerald-300'];
const manoeuvreFor = (lessonId) => MANOEUVRES.find((m) => m.lesson === lessonId);

/* ---------- The whole route ---------- */
export function renderRoute(root, params) {
  const draw = () => {
    const rp = routeProgress();
    const cur = rp.current;
    root.innerHTML = `
    <section class="${card} relative mb-8 overflow-hidden">
      <div class="aspect-[3/1] max-h-72 w-full overflow-hidden sm:aspect-[3.4/1]">${illustration('hero', { label: 'A road from first lesson to the test', cls: 'h-full' })}</div>
      <div class="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p class="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">Teaching route · ${esc(store.active.name)}</p>
          <h1 class="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">What to teach next, from first drive to test standard</h1>
          <p class="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">${SESSIONS.length} sessions in ${STAGES.length} stages, in the order most instructors teach them. Each session tells you where to drive, what to teach, the common problems and when the pupil is ready to move on. Commonly quoted guidance for UK learners is around 45 hours of lessons plus 22 hours of private practice; every pupil is different.</p>
          <div class="mt-4 flex items-center gap-3"><div class="max-w-md flex-1">${bar(rp.pct, 'bg-emerald-500', 'h-3')}</div><span class="text-sm font-bold tabular-nums">${rp.done} / ${rp.total} done</span></div>
        </div>
        ${cur ? `<a href="#/route/${cur.id}" class="${btnPrimary} justify-between lg:min-w-72"><span class="text-left"><span class="block text-xs font-semibold opacity-80">${store.routeStatus(cur.id) === 'doing' ? 'Continue' : 'Next'}: session ${SESSIONS.indexOf(cur) + 1}</span><span class="block">${esc(cur.title)}</span></span>${icon('arrowR', 'size-5')}</a>` : '<p class="rounded-xl bg-emerald-100 p-3 font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">Route complete. Good luck on test day!</p>'}
      </div>
    </section>

    <nav class="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1" aria-label="Stages">
      ${STAGES.map((s) => {
        const ss = sessionsInStage(s.id);
        const d = ss.filter((x) => store.routeStatus(x.id) === 'done').length;
        return `<a href="#/route?stage=${s.id}" data-jump="${s.id}" class="flex shrink-0 items-center gap-2 rounded-full border border-slate-300 px-3.5 py-1.5 text-sm font-semibold hover:bg-white dark:border-slate-700 dark:hover:bg-slate-900"><span class="grid size-6 place-items-center rounded-full ${d === ss.length ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700'} text-xs font-bold">${d === ss.length ? '✓' : s.id}</span>${esc(s.title)}</a>`;
      }).join('')}
    </nav>

    ${STAGES.map((s) => {
      const ss = sessionsInStage(s.id);
      const d = ss.filter((x) => store.routeStatus(x.id) === 'done').length;
      return `<section id="stage-${s.id}" class="mb-10 scroll-mt-20">
        <div class="${card} overflow-hidden">
          <div class="relative aspect-[3/1] max-h-56 w-full overflow-hidden sm:aspect-[4.2/1]">${illustration(s.art, { label: s.title, cls: 'h-full' })}
            <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-4 pt-10 sm:p-5 sm:pt-14">
              <p class="text-xs font-bold uppercase tracking-wider text-white/80">Stage ${s.id} · ${d}/${ss.length} done</p>
              <h2 class="text-xl font-extrabold tracking-tight text-white sm:text-2xl">${esc(s.title)}</h2>
            </div>
          </div>
          <div class="flex flex-wrap items-start gap-x-6 gap-y-1 border-b border-slate-100 px-5 py-3 text-sm dark:border-slate-800">
            <p class="text-slate-700 dark:text-slate-300">${esc(s.blurb)}</p>
            <p class="flex items-center gap-1.5 font-semibold text-slate-500 dark:text-slate-400">${icon('target', 'size-4')} ${esc(s.where)}</p>
          </div>
          <ol class="divide-y divide-slate-100 dark:divide-slate-800">
            ${ss.map((x) => {
              const n = SESSIONS.indexOf(x) + 1;
              const v = store.routeStatus(x.id);
              const isCur = cur && cur.id === x.id;
              return `<li class="flex items-center gap-3 px-4 py-3 sm:px-5 ${isCur ? 'bg-brand-50/70 dark:bg-brand-500/10' : ''}">
                <button data-cycle="${x.id}" title="Change status" aria-label="Session ${n} status: ${ST[v].label}. Tap to change." class="grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold ${ST[v].num}">${v === 'done' ? icon('check', 'size-4') : n}</button>
                <a href="#/route/${x.id}" class="group min-w-0 flex-1">
                  <span class="block font-bold leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400">${esc(x.title)}</span>
                  <span class="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400"><span>${icon('flag', 'inline size-3.5 -mt-0.5')} ${esc(x.hours)} hrs</span><span class="truncate">${esc(x.where)}</span></span>
                </a>
                <span class="hidden sm:inline">${pill(v)}</span>
                ${isCur ? `<span class="hidden rounded-full bg-brand-600 px-2 py-0.5 text-xs font-bold text-white sm:inline dark:bg-brand-400 dark:text-slate-950">Now</span>` : ''}
                ${icon('chevR', 'size-5 shrink-0 text-slate-400')}
              </li>`;
            }).join('')}
          </ol>
        </div>
      </section>`;
    }).join('')}
    <p class="text-xs text-slate-500 dark:text-slate-400">Tap a session number to change its status: Not started → In progress → Done. Session order follows common UK practice; adapt it to each pupil, and go back to any session when mock tests show a fault.</p>`;
  };

  root.addEventListener('click', (e) => {
    const c = e.target.closest('[data-cycle]');
    if (c) {
      const id = c.dataset.cycle;
      const next = { none: 'doing', doing: 'done', done: 'none' }[store.routeStatus(id)];
      store.setRouteStatus(id, next);
      const y = window.scrollY;
      draw();
      window.scrollTo(0, y);
      toast(`${sessionById[id].title}: ${ST[next].label}`);
      return;
    }
    const j = e.target.closest('[data-jump]');
    if (j) { e.preventDefault(); document.getElementById(`stage-${j.dataset.jump}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
  draw();
  const focus = params?.get('stage');
  if (focus) requestAnimationFrame(() => document.getElementById(`stage-${focus}`)?.scrollIntoView({ block: 'start' }));
}

/* ---------- One session ---------- */
export function renderSession(root, params, id) {
  const x = sessionById[id];
  if (!x) { root.innerHTML = `<p class="${card} p-6">Session not found. <a class="font-semibold text-brand-600 underline" href="#/route">Back to the route</a></p>`; return; }
  const n = SESSIONS.indexOf(x) + 1;
  const prev = SESSIONS[n - 2], next = SESSIONS[n];
  const stage = STAGES.find((s) => s.id === x.stage);
  const lessons = x.lessons.map((l) => lessonById[l]);
  const mv = x.lessons.map(manoeuvreFor).find(Boolean);
  const main = lessons[0];

  const draw = () => {
    const v = store.routeStatus(x.id);
    root.innerHTML = `
    <nav class="mb-4 flex items-center justify-between gap-3 text-sm print:hidden">
      <a href="#/route?stage=${x.stage}" class="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-brand-600 dark:text-slate-400">${icon('chevL', 'size-4')} Teaching route</a>
      <button class="${btnGhost} !py-1.5" data-print>${icon('print', 'size-4')} Print lesson plan</button>
    </nav>

    <section class="${card} mb-6 overflow-hidden">
      <div class="relative aspect-[3/1] max-h-48 w-full overflow-hidden sm:aspect-[5/1] print:hidden">${illustration(stage.art, { label: stage.title, cls: 'h-full' })}
        <div class="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-950/30 to-transparent"></div>
        <div class="absolute bottom-0 left-0 p-5"><p class="text-xs font-bold uppercase tracking-wider text-white/80">Stage ${stage.id} · ${esc(stage.title)}</p><p class="text-sm font-semibold text-white">Session ${n} of ${SESSIONS.length}</p></div>
      </div>
      <div class="p-5 sm:p-6">
        <h1 class="text-2xl font-extrabold tracking-tight sm:text-3xl">${esc(x.title)}</h1>
        <dl class="mt-4 grid gap-3 sm:grid-cols-3">
          <div class="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60"><dt class="text-xs font-bold uppercase tracking-wider text-slate-500">Where to teach</dt><dd class="mt-0.5 font-semibold">${esc(x.where)}</dd></div>
          <div class="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60"><dt class="text-xs font-bold uppercase tracking-wider text-slate-500">Typical time</dt><dd class="mt-0.5 font-semibold">${esc(x.hours)} hours</dd></div>
          <div class="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60"><dt class="text-xs font-bold uppercase tracking-wider text-slate-500">Builds on</dt><dd class="mt-0.5 font-semibold">${prev ? `<a class="hover:text-brand-600 dark:hover:text-brand-400" href="#/route/${prev.id}">${n - 1}. ${esc(prev.title)}</a>` : 'Nothing: the very first drive'}</dd></div>
        </dl>
        <div class="mt-5 flex flex-wrap items-center gap-2 print:hidden" role="radiogroup" aria-label="Session status">
          <span class="mr-1 text-sm font-semibold text-slate-500">Status for ${esc(store.active.name)}:</span>
          ${['none', 'doing', 'done'].map((k) => `<button role="radio" aria-checked="${v === k}" data-status="${k}" class="rounded-full border px-3.5 py-1.5 text-sm font-semibold ${v === k ? `${ST[k].cls} border-transparent ring-2 ring-inset` : 'border-slate-300 dark:border-slate-700'}">${ST[k].label}</button>`).join('')}
        </div>
      </div>
    </section>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div class="min-w-0 space-y-6">
        <section class="${card} border-l-4 border-l-brand-600 p-5 dark:border-l-brand-400">
          <h2 class="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">${icon('target', 'size-4')} By the end, the pupil can</h2>
          <ul class="mt-2 space-y-1.5">${x.aims.map((a) => `<li class="flex gap-2 text-lg font-semibold">${icon('check', 'size-5 mt-1 text-emerald-600')} ${esc(a)}</li>`).join('')}</ul>
        </section>

        ${main ? `<figure class="${card} overflow-hidden"><div class="bg-slate-50 dark:bg-slate-950">${diagram(main.diagram, main.caption)}</div>
          <figcaption class="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-5 py-3 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400"><span>${esc(main.caption)}</span>${mv ? `<a href="#/manoeuvres/${mv.id}" class="font-semibold text-brand-600 underline dark:text-brand-400">Animated cheat-sheet</a>` : ''}</figcaption></figure>` : ''}

        <section class="${card} p-5">
          <h2 class="flex items-center gap-2 text-lg font-extrabold tracking-tight">${icon('bulb')} What to teach</h2>
          <ol class="mt-4 space-y-3">${x.teach.map((t, i) => `<li class="flex gap-3"><span class="grid size-7 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-white dark:text-slate-900">${i + 1}</span><p class="pt-0.5 text-slate-700 dark:text-slate-300">${esc(t)}</p></li>`).join('')}</ol>
        </section>

        <section class="${card} p-5">
          <h2 class="flex items-center gap-2 text-lg font-extrabold tracking-tight">${icon('list')} Lesson plan</h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">The same client-centred shape for every session. Adjust the timings to the lesson length.</p>
          <ol class="relative mt-4 space-y-4 border-l-2 border-slate-200 pl-6 dark:border-slate-700">
            ${LESSON_SHAPE.map(([t, time, d]) => `<li class="relative"><span class="absolute -left-[33px] top-0.5 size-4 rounded-full border-4 border-white bg-brand-600 dark:border-slate-900 dark:bg-brand-400"></span><p class="font-bold">${esc(t)} <span class="ml-1 text-xs font-semibold text-slate-500">${esc(time)}</span></p><p class="text-sm text-slate-600 dark:text-slate-400">${esc(d)}</p></li>`).join('')}
          </ol>
        </section>

        <section class="${card} p-5">
          <h2 class="flex items-center gap-2 text-lg font-extrabold tracking-tight">${icon('alert')} Common pupil problems</h2>
          <ul class="mt-4 space-y-3">${x.problems.map(([p, f]) => `<li class="grid gap-1 rounded-xl border border-slate-200 p-4 sm:grid-cols-2 sm:gap-4 dark:border-slate-800"><p class="font-bold text-red-700 dark:text-red-300">${esc(p)}</p><p class="text-sm text-slate-700 dark:text-slate-300"><span class="font-semibold text-emerald-700 dark:text-emerald-400">Quick fix:</span> ${esc(f)}</p></li>`).join('')}</ul>
        </section>
      </div>

      <aside class="space-y-6 lg:sticky lg:top-20 lg:self-start">
        <section class="${card} p-5">
          <h2 class="text-lg font-extrabold tracking-tight">Ready to move on when…</h2>
          <ul class="mt-3 space-y-2">${x.ready.map((r, i) => {
            const key = `${x.id}:${i}`;
            return `<li><label class="flex cursor-pointer items-start gap-3 rounded-xl p-2 hover:bg-slate-50 dark:hover:bg-slate-800"><input type="checkbox" data-ready="${key}" ${store.isReady(key) ? 'checked' : ''} class="mt-0.5 size-5 shrink-0 rounded accent-emerald-600"><span class="text-sm font-semibold">${esc(r)}</span></label></li>`;
          }).join('')}</ul>
          <p class="mt-2 text-xs text-slate-500" data-ready-msg></p>
        </section>

        <section class="${card} p-5">
          <h2 class="font-extrabold">Study before the lesson</h2>
          <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Send the pupil these lessons to read first.</p>
          <ul class="mt-3 space-y-2">${lessons.map((l) => `<li><a href="#/lesson/${l.id}" class="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 text-sm font-semibold hover:border-brand-600 dark:border-slate-700 dark:hover:border-brand-400"><span>${esc(l.title)}</span><span class="text-xs font-bold tabular-nums text-slate-500">${lessonScore(l).pct}%</span></a></li>`).join('')}</ul>
        </section>

        <section class="${card} p-5 print:hidden">
          <label for="snotes" class="flex items-center gap-2 font-bold">${icon('edit', 'size-4')} Session notes</label>
          <textarea id="snotes" data-notes rows="4" placeholder="Route used, what went well, what to repeat…" class="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-950">${esc(store.note(`route:${x.id}`))}</textarea>
        </section>
      </aside>
    </div>

    <nav class="mt-10 grid gap-3 sm:grid-cols-2 print:hidden" aria-label="Session navigation">
      ${prev ? `<a href="#/route/${prev.id}" class="${card} flex items-center gap-3 p-4 hover:shadow-md">${icon('chevL')}<span><span class="block text-xs font-semibold text-slate-500">Session ${n - 1}</span><span class="font-bold">${esc(prev.title)}</span></span></a>` : '<span></span>'}
      ${next ? `<a href="#/route/${next.id}" class="${card} flex items-center justify-end gap-3 p-4 text-right hover:shadow-md"><span><span class="block text-xs font-semibold text-slate-500">Next: session ${n + 1}</span><span class="font-bold">${esc(next.title)}</span></span>${icon('chevR')}</a>` : ''}
    </nav>`;
    readyMsg();
  };

  const readyMsg = () => {
    const all = x.ready.every((_, i) => store.isReady(`${x.id}:${i}`));
    const el = $('[data-ready-msg]', root);
    if (el) el.innerHTML = all ? `<span class="font-semibold text-emerald-700 dark:text-emerald-400">All ticked. ${next ? `Mark this session Done and move on to session ${n + 1}.` : 'Route complete!'}</span>` : 'Tick each one when the pupil does it consistently.';
  };

  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-status]');
    if (b) { store.setRouteStatus(x.id, b.dataset.status); draw(); toast(`Session ${n}: ${ST[b.dataset.status].label}`); }
    if (e.target.closest('[data-print]')) window.print();
  });
  root.addEventListener('change', (e) => {
    const r = e.target.closest('[data-ready]');
    if (!r) return;
    store.toggleReady(r.dataset.ready);
    if (store.routeStatus(x.id) === 'none') store.setRouteStatus(x.id, 'doing');
    readyMsg();
  });
  let t;
  root.addEventListener('input', (e) => {
    if (!e.target.matches('[data-notes]')) return;
    clearTimeout(t);
    t = setTimeout(() => store.setNote(`route:${x.id}`, e.target.value), 400);
  });
  draw();
}

/* ---------- More (phone menu) ---------- */
export function renderMore(root) {
  const tiles = [
    ['#/manoeuvres', 'steer', 'Manoeuvre cheat-sheets', 'Animated steps with reference points'],
    ['#/show-me-tell-me', 'cards', 'Show me, tell me', 'Flashcards for all 21 questions'],
    ['#/curriculum', 'book', 'A to Z lessons', '30 lessons with pictures'],
    ['#/students', 'users', 'Students', 'Profiles, export and import'],
    ['#/resources', 'film', 'Resources', 'Official links and the Part 3 video'],
  ];
  root.innerHTML = `${pageHead('More', 'Tools and settings')}
    <div class="grid gap-3 sm:grid-cols-2">${tiles.map(([h, i, t, d]) => `<a href="${h}" class="${card} flex items-center gap-4 p-4 hover:shadow-md"><span class="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">${icon(i, 'size-6')}</span><span><span class="block font-bold">${t}</span><span class="block text-sm text-slate-500 dark:text-slate-400">${d}</span></span></a>`).join('')}</div>`;
}
