import { PHASES, LESSONS, LEVELS, lessonById, itemId } from '../data/curriculum.js';
import { store, lessonScore } from '../store.js';
import { diagram } from '../diagrams/index.js';
import { esc, icon, badge, bar, card, btnGhost, phaseChip, LEVEL_STYLE, $, $$, toast } from '../ui.js';

export function render(root, params, id) {
  const l = lessonById[id];
  if (!l) { root.innerHTML = `<p class="${card} p-6">Lesson not found. <a class="font-semibold text-brand-600 underline" href="#/curriculum">Back to the curriculum</a></p>`; return; }
  const idx = LESSONS.indexOf(l);
  const prev = LESSONS[idx - 1], next = LESSONS[idx + 1];
  const phase = PHASES.find((p) => p.id === l.phase);

  root.innerHTML = `
  <nav class="mb-4 text-sm"><a href="#/curriculum?phase=${l.phase}" class="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-brand-600 dark:text-slate-400">${icon('chevL', 'size-4')} Curriculum</a></nav>
  <header class="mb-6">
    <div class="flex flex-wrap items-center gap-2">${phaseChip(l.phase, phase.title)}<span class="text-xs font-semibold text-slate-500">Lesson ${idx + 1} of ${LESSONS.length}${l.time && l.time !== '—' ? ` · about ${esc(l.time)}` : ''}</span><span data-status></span></div>
    <h1 class="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">${esc(l.title)}</h1>
    ${l.routine ? `<p class="mt-1 font-semibold text-slate-600 dark:text-slate-400">Routine: <span class="rounded-md bg-amber-100 px-1.5 py-0.5 font-extrabold text-amber-900 dark:bg-amber-500/20 dark:text-amber-200">${esc(l.routine)}</span></p>` : ''}
  </header>

  <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
    <div class="min-w-0 space-y-6">
      <section class="${card} border-l-4 border-l-brand-600 p-5 dark:border-l-brand-400">
        <h2 class="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">${icon('target', 'size-4')} Core objective</h2>
        <p class="mt-2 text-lg font-semibold leading-relaxed">${esc(l.objective)}</p>
      </section>

      <figure class="${card} overflow-hidden">
        <div class="bg-slate-50 dark:bg-slate-950">${diagram(l.diagram, l.caption)}</div>
        <figcaption class="flex items-start gap-2 border-t border-slate-100 px-5 py-3 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">${icon('info', 'size-4 mt-0.5')} ${esc(l.caption)}</figcaption>
      </figure>
      ${(l.tools || []).map(([label, href]) => `<a href="${href}" class="${btnGhost} w-full justify-between sm:w-auto">${icon('steer', 'size-4')} ${esc(label)} ${icon('arrowR', 'size-4')}</a>`).join('')}

      <section class="${card} p-5">
        <h2 class="flex items-center gap-2 text-lg font-extrabold tracking-tight">${icon('list')} Step-by-step procedure</h2>
        <ol class="mt-4 space-y-3">
          ${l.steps.map(([title, text], i) => `<li class="flex gap-3">
            <span class="grid size-8 shrink-0 place-items-center rounded-full bg-slate-900 text-sm font-bold text-white dark:bg-white dark:text-slate-900">${i + 1}</span>
            <div><p class="font-bold">${esc(title)}</p><p class="text-slate-600 dark:text-slate-400">${esc(text)}</p></div></li>`).join('')}
        </ol>
      </section>

      <section class="rounded-2xl border border-sky-200 bg-sky-50 p-5 dark:border-sky-500/30 dark:bg-sky-500/10">
        <h2 class="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">${icon('car', 'size-4')} Real example</h2>
        <p class="mt-2 leading-relaxed text-sky-950 dark:text-sky-100">${esc(l.example.text)}</p>
      </section>

      <section class="${card} p-5">
        <h2 class="flex items-center gap-2 text-lg font-extrabold tracking-tight">${icon('alert')} Common test faults</h2>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">What examiners mark, and where it goes on the test report.</p>
        <ul class="mt-4 space-y-3">
          ${l.faults.map(([f, cat, fix]) => `<li class="rounded-xl border border-red-200 bg-red-50/60 p-4 dark:border-red-500/25 dark:bg-red-500/5">
            <div class="flex flex-wrap items-start justify-between gap-2"><p class="font-bold text-red-800 dark:text-red-300">${esc(f)}</p><span class="rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700">${esc(cat)}</span></div>
            <p class="mt-1 text-sm text-slate-700 dark:text-slate-300"><span class="font-semibold text-emerald-700 dark:text-emerald-400">Avoid it:</span> ${esc(fix)}</p></li>`).join('')}
        </ul>
      </section>

      <p class="flex items-start gap-3 rounded-2xl bg-amber-100 p-5 font-semibold text-amber-950 dark:bg-amber-500/15 dark:text-amber-100">${icon('bulb', 'size-6')} ${esc(l.tip)}</p>
    </div>

    <aside class="space-y-6 lg:sticky lg:top-20 lg:self-start">
      <section class="${card} p-5">
        <div class="flex items-center justify-between gap-2"><h2 class="text-lg font-extrabold tracking-tight">Self-assessment</h2><span class="text-sm font-bold tabular-nums" data-pct></span></div>
        <div class="mt-2" data-bar></div>
        <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">Rate each skill with your instructor. <b>Independent</b> on every skill = Mastered.</p>
        <ul class="mt-4 space-y-4">
          ${l.checklist.map((c, i) => {
            const key = itemId(l, i);
            const v = store.level(key);
            return `<li><p class="mb-1.5 text-sm font-semibold">${esc(c)}</p>
              <div class="grid grid-cols-4 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800" role="radiogroup" aria-label="${esc(c)}">
                ${LEVELS.map((lv) => `<button role="radio" data-key="${key}" data-v="${lv.v}" aria-checked="${v === lv.v}" aria-pressed="${v === lv.v}" class="rounded-lg px-1 py-2 text-[11px] font-bold leading-tight text-slate-600 transition hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700 ${LEVEL_STYLE[lv.v]}">${lv.short}</button>`).join('')}
              </div></li>`;
          }).join('')}
        </ul>
      </section>

      <section class="${card} p-5">
        <label class="flex cursor-pointer items-center gap-3">
          <input type="checkbox" data-studied ${store.isStudied(l.id) ? 'checked' : ''} class="size-5 rounded accent-brand-600">
          <span><span class="font-bold">I've studied this lesson</span><span class="block text-xs text-slate-500 dark:text-slate-400">Read it before your lesson in the car</span></span>
        </label>
      </section>

      <section class="${card} p-5">
        <label for="notes" class="flex items-center gap-2 font-bold">${icon('edit', 'size-4')} Lesson notes</label>
        <textarea id="notes" data-notes rows="4" placeholder="Reference points, roads to practise, what to work on next time…" class="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-950">${esc(store.note(l.id))}</textarea>
        <p class="mt-1 text-xs text-slate-500" data-saved>Saved on this device.</p>
      </section>
    </aside>
  </div>

  <nav class="mt-10 grid gap-3 sm:grid-cols-2" aria-label="Lesson navigation">
    ${prev ? `<a href="#/lesson/${prev.id}" class="${card} flex items-center gap-3 p-4 hover:shadow-md">${icon('chevL')}<span><span class="block text-xs font-semibold text-slate-500">Previous</span><span class="font-bold">${esc(prev.title)}</span></span></a>` : '<span></span>'}
    ${next ? `<a href="#/lesson/${next.id}" class="${card} flex items-center justify-end gap-3 p-4 text-right hover:shadow-md"><span><span class="block text-xs font-semibold text-slate-500">Next</span><span class="font-bold">${esc(next.title)}</span></span>${icon('chevR')}</a>` : ''}
  </nav>`;

  const drawScore = () => {
    const s = lessonScore(l);
    $('[data-status]', root).innerHTML = badge(s.status);
    $('[data-pct]', root).textContent = `${s.pct}%`;
    $('[data-bar]', root).innerHTML = bar(s.pct, 'bg-emerald-500');
  };
  drawScore();

  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-key]');
    if (!b) return;
    const before = lessonScore(l).status;
    store.setLevel(b.dataset.key, Number(b.dataset.v));
    $$(`[data-key="${b.dataset.key}"]`, root).forEach((x) => { const on = x === b; x.setAttribute('aria-pressed', String(on)); x.setAttribute('aria-checked', String(on)); });
    drawScore();
    if (before !== 'mastered' && lessonScore(l).status === 'mastered') toast(`${l.title}: mastered!`);
  });
  $('[data-studied]', root).addEventListener('change', () => { store.toggleStudied(l.id); toast(store.isStudied(l.id) ? 'Marked as studied' : 'Unmarked'); });
  let t;
  $('[data-notes]', root).addEventListener('input', (e) => {
    clearTimeout(t);
    $('[data-saved]', root).textContent = 'Saving…';
    t = setTimeout(() => { store.setNote(l.id, e.target.value); $('[data-saved]', root).textContent = 'Saved on this device.'; }, 400);
  });
}
