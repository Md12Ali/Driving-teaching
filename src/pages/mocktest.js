import { REPORT, ROWS, FAULT_TYPES, MANOEUVRE_OPTIONS, PASS_MAX_DRIVING } from '../data/testreport.js';
import { TELL_ME, SHOW_ME } from '../data/showme.js';
import { store, mockResult } from '../store.js';
import { esc, icon, card, btnGhost, btnPrimary, btnDanger, pageHead, fmtDate, toast, $, $$ } from '../ui.js';

const today = () => new Date().toISOString().slice(0, 10);

/* ---------- List of saved mock tests ---------- */
export function renderList(root) {
  const mocks = store.mocks;
  root.innerHTML = `
  ${pageHead('Mock test assessment', 'Mock tests', `Record driving faults, serious and dangerous faults on a practice test sheet laid out like the examiner's report. Saved for <b>${esc(store.active.name)}</b>.`, `<a href="#/mock-test/new" class="${btnPrimary}">${icon('plus', 'size-4')} New mock test</a>`)}
  <div class="mb-6 grid gap-3 sm:grid-cols-3">
    ${FAULT_TYPES.map((f) => `<div class="${card} p-4"><p class="flex items-center gap-2 font-extrabold"><span class="grid size-7 place-items-center rounded-lg text-sm font-black ${f.key === 'd' ? 'bg-amber-400 text-amber-950' : f.key === 's' ? 'bg-orange-500 text-white' : 'bg-red-600 text-white'}">${f.short}</span>${esc(f.label)}</p><p class="mt-1 text-sm text-slate-600 dark:text-slate-400">${esc(f.desc)}</p></div>`).join('')}
  </div>
  ${mocks.length ? `<ul class="space-y-3">${mocks.map((m) => {
    const r = mockResult(m);
    return `<li><a href="#/mock-test/${m.id}" class="${card} flex flex-wrap items-center gap-4 p-4 hover:shadow-md">
      <span class="grid size-12 place-items-center rounded-xl text-sm font-black ${r.pass ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300'}">${r.pass ? 'PASS' : 'FAIL'}</span>
      <span class="min-w-0 flex-1"><span class="block font-bold">${fmtDate(m.date)}${m.area ? ` · ${esc(m.area)}` : ''}</span><span class="block text-sm text-slate-600 dark:text-slate-400">${esc(m.manoeuvre || 'No manoeuvre recorded')}</span></span>
      <span class="flex gap-2 text-sm font-bold tabular-nums"><span class="rounded-lg bg-amber-100 px-2 py-1 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200">${r.d} D</span><span class="rounded-lg bg-orange-100 px-2 py-1 text-orange-900 dark:bg-orange-500/15 dark:text-orange-200">${r.s} S</span><span class="rounded-lg bg-red-100 px-2 py-1 text-red-900 dark:bg-red-500/15 dark:text-red-200">${r.x} X</span></span>
      ${icon('chevR', 'size-5 text-slate-400')}</a></li>`;
  }).join('')}</ul>` : `<div class="${card} p-8 text-center"><p class="text-lg font-bold">No mock tests yet</p><p class="mt-1 text-slate-600 dark:text-slate-400">Run a mock on unfamiliar roads with no prompts, and mark it as you go.</p><a href="#/mock-test/new" class="${btnPrimary} mt-4">${icon('plus', 'size-4')} Start the first one</a></div>`}`;
}

/* ---------- Test sheet editor ---------- */
export function renderSheet(root, params, id) {
  const existing = id !== 'new' ? store.mock(id) : null;
  if (id !== 'new' && !existing) { root.innerHTML = `<p class="${card} p-6">That mock test was not found for this student. <a class="font-semibold text-brand-600 underline" href="#/mock-test">Back to mock tests</a></p>`; return; }
  const m = existing ? structuredClone(existing) : { date: today(), examiner: '', area: '', manoeuvre: '', tell: '', show: '', eyesight: 'pass', indep: 'Sat nav', marks: {}, notes: '' };
  let saved = !!existing;

  const counter = (key, type) => {
    const v = (m.marks[key] || {})[type] || 0;
    const colour = type === 'd' ? 'bg-amber-400 text-amber-950' : type === 's' ? 'bg-orange-500 text-white' : 'bg-red-600 text-white';
    if (type === 'd') {
      return `<div class="flex items-center gap-1">
        <button data-dec="${key}" aria-label="Remove driving fault" class="grid size-8 place-items-center rounded-lg border border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300">${icon('minus', 'size-4')}</button>
        <span data-out="${key}.d" class="grid h-8 min-w-9 place-items-center rounded-lg px-1 text-sm font-black tabular-nums ${v ? colour : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}">${v}</span>
        <button data-inc="${key}" aria-label="Add driving fault" class="grid size-8 place-items-center rounded-lg border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-200">${icon('plus', 'size-4')}</button></div>`;
    }
    return `<button data-tog="${key}.${type}" aria-pressed="${!!v}" aria-label="${type === 's' ? 'Serious' : 'Dangerous'} fault" class="grid size-8 place-items-center rounded-lg border border-slate-300 text-sm font-black text-slate-400 dark:border-slate-700 aria-pressed:border-transparent ${type === 's' ? 'aria-pressed:bg-orange-500' : 'aria-pressed:bg-red-600'} aria-pressed:text-white">${type === 's' ? 'S' : 'X'}</button>`;
  };

  const field = (label, html) => `<label class="block"><span class="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">${label}</span>${html}</label>`;
  const input = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950';
  const opts = (list, val) => `<option value="">Choose…</option>${list.map((o) => `<option ${o === val ? 'selected' : ''}>${esc(o)}</option>`).join('')}`;

  root.innerHTML = `
  <nav class="mb-4 text-sm print:hidden"><a href="#/mock-test" class="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-brand-600 dark:text-slate-400">${icon('chevL', 'size-4')} Mock tests</a></nav>
  ${pageHead('Mock test sheet', `${esc(store.active.name)} · mock test`, 'Tap + for each driving fault, S for serious, X for dangerous. It saves automatically.', `<button class="${btnGhost} print:hidden" data-print>${icon('print', 'size-4')} Print</button>${existing ? `<button class="${btnDanger} print:hidden" data-del>${icon('trash', 'size-4')} Delete</button>` : ''}`)}

  <div class="sticky top-14 z-20 -mx-4 mb-5 border-b border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur print:static dark:border-slate-800 dark:bg-slate-950/95" data-summary></div>

  <section class="${card} mb-5 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
    ${field('Date', `<input type="date" data-f="date" value="${esc(m.date)}" class="${input}">`)}
    ${field('Marked by', `<input data-f="examiner" value="${esc(m.examiner)}" placeholder="Instructor name" class="${input}">`)}
    ${field('Area / route', `<input data-f="area" value="${esc(m.area)}" placeholder="e.g. Goodmayes test route" class="${input}">`)}
    ${field('Eyesight check', `<select data-f="eyesight" class="${input}"><option value="pass" ${m.eyesight === 'pass' ? 'selected' : ''}>Passed</option><option value="fail" ${m.eyesight === 'fail' ? 'selected' : ''}>Failed (test ends)</option></select>`)}
    ${field('Reversing exercise', `<select data-f="manoeuvre" class="${input}">${opts(MANOEUVRE_OPTIONS, m.manoeuvre)}</select>`)}
    ${field('Independent driving', `<select data-f="indep" class="${input}">${opts(['Sat nav', 'Traffic signs', 'Sat nav and signs', 'Not done'], m.indep)}</select>`)}
    ${field('Tell me question', `<select data-f="tell" class="${input}">${opts(TELL_ME.map((q, k) => `T${k + 1}: ${q.q.slice(0, 60)}…`), m.tell)}</select>`)}
    ${field('Show me question', `<select data-f="show" class="${input}">${opts(SHOW_ME.map((q, k) => `S${k + 1}: ${q.q.replace('When it\'s safe to do so, can you show me how ', '').slice(0, 50)}…`), m.show)}</select>`)}
  </section>

  <section class="${card} overflow-hidden">
    <div class="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-3 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950">
      <span>Category</span><span class="w-[7.5rem] text-center">Driving</span><span class="w-8 text-center">S</span><span class="w-8 text-center">X</span>
    </div>
    ${REPORT.map((g) => `
      <div class="border-b border-slate-100 last:border-0 dark:border-slate-800">
        ${g.subs ? `<p class="bg-slate-50/60 px-4 pt-3 text-sm font-extrabold dark:bg-transparent">${esc(g.label)}</p>` : ''}
        ${(g.subs || ['']).map((s, k) => {
          const key = g.subs ? `${g.id}.${k}` : g.id;
          return `<div class="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-3 px-4 py-2 ${g.subs ? 'pl-7' : ''}" data-row="${key}">
            <span class="text-sm ${g.subs ? 'text-slate-700 dark:text-slate-300' : 'font-extrabold'}">${esc(s || g.label)}</span>
            ${counter(key, 'd')}${counter(key, 's')}${counter(key, 'x')}
          </div>`;
        }).join('')}
      </div>`).join('')}
  </section>

  <section class="${card} mt-5 p-5">
    <label for="mnotes" class="font-bold">Debrief notes</label>
    <textarea id="mnotes" data-f="notes" rows="4" class="${input} mt-2" placeholder="What happened, why, and what to work on next lesson…">${esc(m.notes)}</textarea>
  </section>
  <p class="mt-4 text-xs text-slate-500">A practice sheet laid out like the DVSA driving test report. It is not an official form. Eco-safe driving is not included because it does not affect the result.</p>`;

  const summary = () => {
    const r = mockResult(m);
    const eyeFail = m.eyesight === 'fail';
    const pass = r.pass && !eyeFail;
    const why = eyeFail ? 'Eyesight check failed' : r.x ? 'Dangerous fault recorded' : r.s ? 'Serious fault recorded' : r.d > PASS_MAX_DRIVING ? `More than ${PASS_MAX_DRIVING} driving faults` : `${PASS_MAX_DRIVING - r.d} driving fault${PASS_MAX_DRIVING - r.d === 1 ? '' : 's'} left before a fail`;
    $('[data-summary]', root).innerHTML = `<div class="flex flex-wrap items-center gap-3">
      <span class="rounded-xl px-3 py-1.5 text-lg font-black ${pass ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}">${pass ? 'PASS' : 'FAIL'}</span>
      <span class="text-sm font-semibold text-slate-600 dark:text-slate-300">${why}</span>
      <span class="ml-auto flex gap-2 text-sm font-bold tabular-nums">
        <span class="rounded-lg bg-amber-400 px-2.5 py-1 text-amber-950">${r.d} driving</span>
        <span class="rounded-lg bg-orange-500 px-2.5 py-1 text-white">${r.s} serious</span>
        <span class="rounded-lg bg-red-600 px-2.5 py-1 text-white">${r.x} dangerous</span>
      </span></div>`;
  };

  const save = () => {
    const out = store.saveMock(m);
    if (!saved) { saved = true; m.id = out.id; history.replaceState(null, '', `#/mock-test/${out.id}`); }
  };

  const setMark = (key, type, v) => {
    const cur = m.marks[key] || {};
    cur[type] = Math.max(0, v);
    if (!cur.d && !cur.s && !cur.x) delete m.marks[key]; else m.marks[key] = cur;
    if (type === 'd') {
      const out = $(`[data-out="${key}.d"]`, root);
      out.textContent = cur.d || 0;
      out.className = `grid h-8 min-w-9 place-items-center rounded-lg px-1 text-sm font-black tabular-nums ${cur.d ? 'bg-amber-400 text-amber-950' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`;
      if (cur.d === 3) toast('Repeating the same driving fault can turn it into a serious fault');
    }
    summary();
    save();
  };

  root.addEventListener('click', (e) => {
    const inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]'), tog = e.target.closest('[data-tog]');
    if (inc) setMark(inc.dataset.inc, 'd', ((m.marks[inc.dataset.inc] || {}).d || 0) + 1);
    if (dec) setMark(dec.dataset.dec, 'd', ((m.marks[dec.dataset.dec] || {}).d || 0) - 1);
    if (tog) {
      const [g, k, type] = tog.dataset.tog.split('.');
      const key = type ? `${g}.${k}` : g;
      const t = type || k;
      const on = !((m.marks[key] || {})[t]);
      tog.setAttribute('aria-pressed', String(on));
      setMark(key, t, on ? 1 : 0);
    }
    if (e.target.closest('[data-print]')) window.print();
    if (e.target.closest('[data-del]') && confirm('Delete this mock test?')) { store.deleteMock(m.id); location.hash = '#/mock-test'; }
  });
  let tm;
  root.addEventListener('input', (e) => {
    const f = e.target.dataset.f;
    if (!f) return;
    m[f] = e.target.value;
    if (f === 'eyesight') summary();
    clearTimeout(tm);
    tm = setTimeout(save, 400);
  });
  root.addEventListener('change', (e) => { if (e.target.dataset.f) { m[e.target.dataset.f] = e.target.value; summary(); save(); } });
  summary();
}
