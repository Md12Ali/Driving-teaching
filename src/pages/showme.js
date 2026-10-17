import { TELL_ME, SHOW_ME, SHOW_TELL_INFO } from '../data/showme.js';
import { store } from '../store.js';
import { esc, icon, card, btnGhost, btnPrimary, pageHead, bar, $, $$ } from '../ui.js';

const ALL = [...TELL_ME.map((q) => ({ ...q, type: 'tell' })), ...SHOW_ME.map((q) => ({ ...q, type: 'show' }))];
const MODES = [['all', 'All 21'], ['tell', 'Tell me (14)'], ['show', 'Show me (7)'], ['practise', 'Need practice']];

export function render(root) {
  let mode = 'all', order = ALL.map((q) => q.id), i = 0, flipped = false;

  root.innerHTML = `
  ${pageHead('Vehicle safety questions', 'Show me, tell me trainer', 'Flip each card, check the answer, then mark it. Questions are the official DVSA list.', `<button class="${btnGhost}" data-shuffle>${icon('shuffle', 'size-4')} Shuffle</button><button class="${btnGhost}" data-reset>${icon('flip', 'size-4')} Reset marks</button>`)}
  <div class="mb-5 flex flex-wrap gap-2" role="group" aria-label="Question set">
    ${MODES.map(([k, l]) => `<button data-mode="${k}" aria-pressed="${k === mode}" class="rounded-full border border-slate-300 px-3.5 py-1.5 text-sm font-semibold aria-pressed:border-slate-900 aria-pressed:bg-slate-900 aria-pressed:text-white dark:border-slate-700 dark:aria-pressed:border-white dark:aria-pressed:bg-white dark:aria-pressed:text-slate-900">${l}</button>`).join('')}
  </div>

  <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
    <div class="min-w-0">
      <div class="mb-3 flex items-center justify-between text-sm font-semibold text-slate-500 dark:text-slate-400"><span data-pos></span><span data-score></span></div>
      <div class="flip" data-flip>
        <div class="flip-inner min-h-[300px] sm:min-h-[320px]">
          <button class="flip-face ${card} flex w-full flex-col p-6 text-left sm:p-8" data-front aria-label="Show answer"></button>
          <button class="flip-face flip-back ${card} flex w-full flex-col p-6 text-left sm:p-8" data-back aria-label="Show question"></button>
        </div>
      </div>
      <div class="mt-4 grid grid-cols-[auto_1fr_1fr_auto] gap-2">
        <button class="${btnGhost}" data-prev aria-label="Previous card">${icon('chevL', 'size-4')}</button>
        <button class="${btn('amber')}" data-mark="practise">${icon('flag', 'size-4')} Need practice</button>
        <button class="${btn('emerald')}" data-mark="known">${icon('check', 'size-4')} Got it</button>
        <button class="${btnGhost}" data-next aria-label="Next card">${icon('chevR', 'size-4')}</button>
      </div>
      <p class="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">Tap the card or press Space to flip · arrow keys to move</p>
    </div>
    <aside class="space-y-4">
      <section class="${card} p-5">
        <h2 class="font-extrabold">Progress</h2>
        <div class="mt-3" data-bar></div>
        <div class="mt-3 grid grid-cols-3 gap-2 text-center text-sm" data-counts></div>
      </section>
      <section class="${card} p-5">
        <h2 class="flex items-center gap-2 font-extrabold">${icon('info', 'size-4')} On the test</h2>
        <ul class="mt-2 list-disc space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300">${SHOW_TELL_INFO.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        <a class="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 underline dark:text-brand-400" href="https://www.gov.uk/government/publications/car-show-me-tell-me-vehicle-safety-questions" target="_blank" rel="noopener">Official list on GOV.UK ${icon('arrowR', 'size-3.5')}</a>
      </section>
    </aside>
  </div>`;

  function btn(c) {
    return c === 'amber'
      ? 'inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-500/15 dark:text-amber-200'
      : 'inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950';
  }

  const list = () => order.map((id) => ALL.find((q) => q.id === id)).filter((q) => mode === 'all' || q.type === mode || (mode === 'practise' && store.showme(q.id) === 'practise'));

  const draw = () => {
    const qs = list();
    const flip = $('[data-flip]', root);
    flip.classList.toggle('is-flipped', flipped);
    if (!qs.length) {
      $('[data-front]', root).innerHTML = `<p class="m-auto text-center text-slate-600 dark:text-slate-400">No cards here yet. Mark cards as <b>Need practice</b> to build this set.</p>`;
      $('[data-back]', root).innerHTML = '';
      $('[data-pos]', root).textContent = '';
    } else {
      i = (i + qs.length) % qs.length;
      const q = qs[i];
      const mark = store.showme(q.id);
      const tag = q.type === 'tell'
        ? '<span class="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-800 dark:bg-brand-500/20 dark:text-brand-200">TELL ME · before driving</span>'
        : '<span class="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200">SHOW ME · while driving</span>';
      const markTag = mark ? `<span class="ml-auto rounded-full px-2.5 py-0.5 text-xs font-bold ${mark === 'known' ? 'bg-emerald-600 text-white' : 'bg-amber-400 text-amber-950'}">${mark === 'known' ? 'Got it' : 'Practise'}</span>` : '';
      $('[data-front]', root).innerHTML = `<div class="flex items-center gap-2">${tag}${markTag}</div>
        <p class="my-auto py-6 text-xl font-bold leading-snug sm:text-2xl">${esc(q.q)}</p>
        <span class="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">${icon('flip', 'size-4')} Tap to see the answer</span>`;
      $('[data-back]', root).innerHTML = `<div class="flex items-center gap-2">${tag}${markTag}</div>
        <p class="mt-4 text-sm font-semibold text-slate-500">${esc(q.q)}</p>
        <p class="mt-3 text-lg font-semibold leading-relaxed">${esc(q.a)}</p>
        ${q.note ? `<p class="mt-3 rounded-lg bg-slate-100 p-3 text-sm dark:bg-slate-800">${esc(q.note)}</p>` : ''}
        ${q.bonnet ? '<p class="mt-3 text-sm font-semibold text-amber-700 dark:text-amber-300">You\'ll need to open the bonnet for this one.</p>' : ''}
        ${q.type === 'show' ? '<p class="mt-auto pt-4 text-xs text-slate-500">GOV.UK lists show me questions without answers. This is a typical way to do it; practise in your test car.</p>' : '<p class="mt-auto pt-4 text-xs text-slate-500">Official answer (GOV.UK)</p>'}`;
      $('[data-pos]', root).textContent = `Card ${i + 1} of ${qs.length}`;
    }
    const known = ALL.filter((q) => store.showme(q.id) === 'known').length;
    const pr = ALL.filter((q) => store.showme(q.id) === 'practise').length;
    $('[data-score]', root).textContent = `${known} / 21 known`;
    $('[data-bar]', root).innerHTML = bar(Math.round((known / 21) * 100), 'bg-emerald-500', 'h-3');
    $('[data-counts]', root).innerHTML = [['Got it', known, 'text-emerald-600 dark:text-emerald-400'], ['Practise', pr, 'text-amber-600 dark:text-amber-400'], ['Not tried', 21 - known - pr, 'text-slate-500']]
      .map(([l, n, c]) => `<div class="rounded-xl bg-slate-50 p-2 dark:bg-slate-800"><p class="text-xl font-extrabold tabular-nums ${c}">${n}</p><p class="text-xs font-semibold text-slate-500">${l}</p></div>`).join('');
  };

  const move = (d) => { flipped = false; i += d; draw(); };
  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-front],[data-back]')) { flipped = !flipped; draw(); return; }
    const m = e.target.closest('[data-mode]');
    if (m) { mode = m.dataset.mode; i = 0; flipped = false; $$('[data-mode]', root).forEach((x) => x.setAttribute('aria-pressed', String(x === m))); draw(); return; }
    const mk = e.target.closest('[data-mark]');
    if (mk) {
      const q = list()[i];
      if (!q) return;
      store.setShowme(q.id, store.showme(q.id) === mk.dataset.mark ? null : mk.dataset.mark);
      if (mode === 'practise' && mk.dataset.mark === 'known') { flipped = false; draw(); } else move(1);
      return;
    }
    if (e.target.closest('[data-next]')) move(1);
    if (e.target.closest('[data-prev]')) move(-1);
    if (e.target.closest('[data-shuffle]')) { order = [...order].sort(() => Math.random() - 0.5); i = 0; flipped = false; draw(); }
    if (e.target.closest('[data-reset]') && confirm('Clear all Got it / Need practice marks for this student?')) { store.clearShowme(); draw(); }
  });
  const onKey = (e) => {
    if (e.target.closest('input, textarea, select')) return;
    if (e.key === ' ' && !e.target.closest('button')) { e.preventDefault(); flipped = !flipped; draw(); }
    if (e.key === 'ArrowRight') move(1);
    if (e.key === 'ArrowLeft') move(-1);
  };
  document.addEventListener('keydown', onKey);
  draw();
  return () => document.removeEventListener('keydown', onKey);
}
