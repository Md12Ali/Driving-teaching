import { MANOEUVRES, manoeuvreById, MV_CAR } from '../data/manoeuvres.js';
import { lessonById } from '../data/curriculum.js';
import { store, lessonScore } from '../store.js';
import { svg, car } from '../diagrams/kit.js';
import { esc, icon, badge, card, btnGhost, btnPrimary, pageHead, $, $$ } from '../ui.js';

const WHEEL = { '-1': 'Full left lock', 0: 'Wheel straight', 1: 'Full right lock' };

export function render(root, params, id) {
  const m = manoeuvreById[id] || MANOEUVRES[0];
  let step = 0, timer = null;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.innerHTML = `
  ${pageHead('Manoeuvre cheat-sheets', m.title, esc(m.summary), `<a href="#/lesson/${m.lesson}" class="${btnGhost}">${icon('book', 'size-4')} Full lesson</a>`)}
  <div class="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist" aria-label="Manoeuvres">
    ${MANOEUVRES.map((x) => `<a role="tab" href="#/manoeuvres/${x.id}" aria-selected="${x.id === m.id}" class="flex shrink-0 items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold aria-selected:border-brand-600 aria-selected:bg-brand-600 aria-selected:text-white dark:border-slate-700 dark:aria-selected:border-brand-400 dark:aria-selected:bg-brand-400 dark:aria-selected:text-slate-950">${esc(x.title)}</a>`).join('')}
  </div>

  <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
    <div class="min-w-0 space-y-4">
      <figure class="${card} overflow-hidden">
        <div class="relative bg-slate-50 dark:bg-slate-950" data-stage></div>
        <div class="flex flex-wrap items-center gap-2 border-t border-slate-100 p-3 dark:border-slate-800">
          <button class="${btnGhost}" data-prev aria-label="Previous step">${icon('chevL', 'size-4')}</button>
          <button class="${btnPrimary} min-w-28" data-play>${icon('play', 'size-4')} Play</button>
          <button class="${btnGhost}" data-next aria-label="Next step">${icon('chevR', 'size-4')}</button>
          <div class="ml-auto flex items-center gap-1.5" data-dots></div>
        </div>
      </figure>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="${card} flex items-center gap-4 p-4">
          <svg viewBox="0 0 64 64" class="size-16 shrink-0 text-slate-800 transition-transform duration-500 dark:text-slate-100" data-wheel aria-hidden="true"><circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" stroke-width="6"/><circle cx="32" cy="32" r="6" fill="currentColor"/><path d="M6 32h20M38 32h20M32 38v20" stroke="currentColor" stroke-width="5"/><rect x="29" y="3" width="6" height="8" rx="1.5" fill="#f59e0b"/></svg>
          <div><p class="text-xs font-bold uppercase tracking-wider text-slate-500">Steering</p><p class="text-lg font-extrabold" data-wheel-label></p></div>
        </div>
        <div class="${card} flex items-start gap-3 p-4">
          <span class="grid size-10 shrink-0 place-items-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">${icon('eye')}</span>
          <div><p class="text-xs font-bold uppercase tracking-wider text-slate-500">Observation</p><p class="font-semibold" data-look></p></div>
        </div>
      </div>
    </div>

    <aside class="space-y-4">
      <section class="${card} p-5">
        <div class="flex items-center justify-between"><p class="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400" data-count></p><span data-status></span></div>
        <h2 class="mt-1 text-xl font-extrabold tracking-tight" data-title></h2>
        <p class="mt-2 leading-relaxed text-slate-700 dark:text-slate-300" data-text></p>
        <p class="mt-3 hidden items-start gap-2 rounded-xl bg-yellow-100 p-3 text-sm font-semibold text-yellow-950 dark:bg-yellow-400/15 dark:text-yellow-100" data-ref>${icon('target', 'size-4 mt-0.5')}<span></span></p>
      </section>
      <section class="${card} p-5">
        <h3 class="font-extrabold">All steps</h3>
        <ol class="mt-3 space-y-1" data-steps>
          ${m.steps.map((s, i) => `<li><button data-step="${i}" class="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm font-semibold text-slate-600 hover:bg-slate-100 aria-current:bg-brand-50 aria-current:text-brand-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:aria-current:bg-brand-500/15 dark:aria-current:text-brand-200"><span class="grid size-6 shrink-0 place-items-center rounded-full bg-slate-200 text-xs font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-100">${i + 1}</span>${esc(s.title)}</button></li>`).join('')}
        </ol>
      </section>
      <section class="${card} p-5">
        <h3 class="flex items-center gap-2 font-extrabold">${icon('alert', 'size-4')} Test faults to avoid</h3>
        <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">${m.faults.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
        <p class="mt-3 text-xs text-slate-500">Reference points vary with the car and the driver's seat position. Use these as a starting point and adjust them with your instructor.</p>
      </section>
    </aside>
  </div>`;

  const stage = $('[data-stage]', root);
  const lesson = lessonById[m.lesson];
  $('[data-status]', root).innerHTML = badge(lessonScore(lesson).status);
  $('[data-dots]', root).innerHTML = m.steps.map((_, i) => `<button data-step="${i}" aria-label="Step ${i + 1}" class="size-2.5 rounded-full bg-slate-300 aria-current:w-6 aria-current:bg-brand-600 dark:bg-slate-600 dark:aria-current:bg-brand-400 transition-all"></button>`).join('');

  // Static scene + overlay layers. The learner car is moved with a CSS transform so it animates.
  const p0 = m.steps[0].pose;
  stage.innerHTML = svg(`${m.scene()}<g data-trail></g><g data-refmark></g>
    <g class="mv-car" data-car style="transform: translate(${p0.x}px, ${p0.y}px) rotate(${p0.a}deg)">${car(0, 0, 0, 'learner', MV_CAR)}
      <g data-ind-l class="mv-blink" style="display:none"><circle cx="-12" cy="-23" r="4" fill="#f59e0b"/><circle cx="-12" cy="23" r="4" fill="#f59e0b"/></g>
      <g data-ind-r class="mv-blink" style="display:none"><circle cx="12" cy="-23" r="4" fill="#f59e0b"/><circle cx="12" cy="23" r="4" fill="#f59e0b"/></g>
    </g>`, { label: `${m.title} animation`, vb: m.vb });

  const show = (i) => {
    step = Math.max(0, Math.min(m.steps.length - 1, i));
    const s = m.steps[step];
    const p = s.pose;
    $('[data-car]', stage).style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.a}deg)`;
    $('[data-trail]', stage).innerHTML = m.steps.slice(0, step).map((x) => car(x.pose.x, x.pose.y, x.pose.a, 'learner', { ...MV_CAR, cls: 'ghost' })).join('')
      + (step ? `<path d="${m.steps.slice(0, step + 1).map((x, k) => `${k ? 'L' : 'M'}${x.pose.x},${x.pose.y}`).join(' ')}" class="p p-go dash" style="stroke-width:3"/>` : '');
    $('[data-refmark]', stage).innerHTML = s.ref ? `<circle cx="${s.ref.x}" cy="${s.ref.y}" r="9" class="ref mv-pulse"/><circle cx="${s.ref.x}" cy="${s.ref.y}" r="4" fill="#0f172a"/>` : '';
    const sig = m.id === 'pull-up-right' ? (step === 1 ? 'r' : step === 4 ? 'l' : '') : (m.id === 'forward-bay' && step <= 2 && step >= 1 ? 'l' : '');
    $('[data-ind-l]', stage).style.display = sig === 'l' ? '' : 'none';
    $('[data-ind-r]', stage).style.display = sig === 'r' ? '' : 'none';
    $('[data-count]', root).textContent = `Step ${step + 1} of ${m.steps.length}`;
    $('[data-title]', root).textContent = s.title;
    $('[data-text]', root).textContent = s.text;
    const ref = $('[data-ref]', root);
    ref.classList.toggle('hidden', !s.ref); ref.classList.toggle('flex', !!s.ref);
    if (s.ref) $('span', ref).textContent = `Reference point: ${s.ref.label}`;
    $('[data-look]', root).textContent = s.look;
    $('[data-wheel]', root).style.transform = `rotate(${s.wheel * 150}deg)`;
    $('[data-wheel-label]', root).textContent = WHEEL[s.wheel];
    $$('[data-step]', root).forEach((b) => (Number(b.dataset.step) === step ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current')));
    $('[data-prev]', root).disabled = step === 0;
    $('[data-next]', root).disabled = step === m.steps.length - 1;
  };

  const stop = () => { clearInterval(timer); timer = null; $('[data-play]', root).innerHTML = `${icon('play', 'size-4')} Play`; };
  $('[data-play]', root).addEventListener('click', () => {
    if (timer) { stop(); return; }
    if (step === m.steps.length - 1) show(0);
    $('[data-play]', root).innerHTML = `${icon('pause', 'size-4')} Pause`;
    timer = setInterval(() => { if (step >= m.steps.length - 1) stop(); else show(step + 1); }, reduce ? 3500 : 2600);
  });
  $('[data-prev]', root).addEventListener('click', () => { stop(); show(step - 1); });
  $('[data-next]', root).addEventListener('click', () => { stop(); show(step + 1); });
  root.addEventListener('click', (ev) => { const b = ev.target.closest('[data-step]'); if (b) { stop(); show(Number(b.dataset.step)); } });
  root.tabIndex = -1;
  root.addEventListener('keydown', (ev) => { if (ev.key === 'ArrowRight') { stop(); show(step + 1); } if (ev.key === 'ArrowLeft') { stop(); show(step - 1); } });
  show(0);
  return () => stop();
}
