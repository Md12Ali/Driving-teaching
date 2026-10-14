import { TOPICS, METHODS, STAGES, COMPETENCIES, SCORE_LABELS, STOPPING } from './data.js';
import { LANGS, MORE_LANGS, setLang, savedLang, onLang, t, topicText, labels, googleTranslateUrl, lang } from './i18n.js';
import { diagram } from './diagrams.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage off */ } },
};
const STAGE_KEY = { foundation: 'stageFoundation', core: 'stageCore', advanced: 'stageAdvanced' };

/* ---------- Mode: learner or instructor ---------- */
let mode = store.get('dt-mode', 'learner');
function setMode(m) {
  mode = m === 'instructor' ? 'instructor' : 'learner';
  store.set('dt-mode', mode);
  document.body.classList.toggle('mode-learner', mode === 'learner');
  document.body.classList.toggle('mode-instructor', mode === 'instructor');
  $$('[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
  renderHero();
}
$$('[data-mode]').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));

function renderHero() {
  const k = mode === 'learner' ? 'Learner' : 'Instructor';
  $('[data-hero=eyebrow]').textContent = t(`heroEyebrow${k}`);
  $('[data-hero=title]').textContent = t(`heroTitle${k}`);
  $('[data-hero=lede]').textContent = t(`heroLede${k}`);
}

/* ---------- Language picker ---------- */
const langSelect = $('[data-lang-select]');
langSelect.innerHTML = LANGS.map((l) => `<option value="${l.code}">${esc(l.name)}</option>`).join('') +
  `<optgroup label="${esc(t('moreLanguages'))}">${MORE_LANGS.map(([c, n]) => `<option value="gt:${c}">${esc(n)}</option>`).join('')}</optgroup>`;
langSelect.addEventListener('change', () => {
  const v = langSelect.value;
  if (v.startsWith('gt:')) {
    langSelect.value = lang();
    window.location.href = googleTranslateUrl(v.slice(3));
    return;
  }
  setLang(v);
});
$('[data-count=langs]').textContent = `${LANGS.length}+`;
$('[data-count=topics]').textContent = TOPICS.length;

/* ---------- Navigation ---------- */
const menuBtn = $('.menu-btn');
menuBtn.addEventListener('click', () => {
  const open = menuBtn.getAttribute('aria-expanded') !== 'true';
  menuBtn.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('nav-open', open);
});
$$('#nav a').forEach((a) => a.addEventListener('click', () => {
  menuBtn.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('nav-open');
}));
const navLinks = $$('#nav a');
const sectionObserver = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) navLinks.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === `#${e.target.id}`));
  }
}, { rootMargin: '-45% 0px -50% 0px' });
$$('main > section[id]').forEach((s) => sectionObserver.observe(s));

/* ---------- Lessons ---------- */
let stageFilter = 'all';
let done = new Set(store.get('dt-done', []));
const chips = $('[data-render=stage-chips]');
function renderChips() {
  chips.innerHTML = [['all', t('stageAll')], ...Object.keys(STAGES).map((k) => [k, t(STAGE_KEY[k])])]
    .map(([k, label]) => `<button class="chip" data-stage="${k}" aria-pressed="${k === stageFilter}">${esc(label)}</button>`).join('');
}
chips.addEventListener('click', (e) => {
  const b = e.target.closest('[data-stage]');
  if (!b) return;
  stageFilter = b.dataset.stage;
  renderChips();
  renderTopics();
});
const search = $('[data-topic-search]');
search.addEventListener('input', renderTopics);

function renderProgress() {
  const n = TOPICS.filter((x) => done.has(x.id)).length;
  $('[data-progress-fill]').style.width = `${(n / TOPICS.length) * 100}%`;
  $('[data-progress-text]').textContent = t('progress', { done: n, total: TOPICS.length });
}

function renderTopics() {
  const q = search.value.trim().toLowerCase();
  const L = labels();
  const list = TOPICS.filter((x) => {
    if (stageFilter !== 'all' && x.stage !== stageFilter) return false;
    if (!q) return true;
    const s = topicText(x.id);
    return [s.title, s.simple, ...(s.steps || []), x.title, x.summary].join(' ').toLowerCase().includes(q);
  });
  $('[data-render=topics]').innerHTML = list.map((x) => {
    const s = topicText(x.id);
    return `<li>
      <button class="topic${done.has(x.id) ? ' is-done' : ''}" data-topic="${x.id}">
        <span class="topic-pic">${diagram(x.id, L)}</span>
        <span class="topic-body">
          <span class="topic-meta"><span class="topic-n">${String(TOPICS.indexOf(x) + 1).padStart(2, '0')}</span>
            <span class="topic-stage stage-${x.stage}">${esc(t(STAGE_KEY[x.stage]))}</span>
            ${done.has(x.id) ? '<span class="topic-done" aria-label="done">✓</span>' : ''}</span>
          <span class="topic-title">${esc(s.title)}</span>
          <span class="topic-sum">${esc(s.simple)}</span>
          ${x.scenario ? `<span class="topic-3d">${esc(t('watch3d'))}</span>` : ''}
        </span>
      </button>
    </li>`;
  }).join('');
  $('[data-topic-empty]').hidden = list.length > 0;
  renderProgress();
}

const dialog = $('[data-topic-dialog]');
const openDialog = () => (dialog.showModal ? dialog.showModal() : dialog.setAttribute('open', ''));
const closeDialog = () => (dialog.close ? dialog.close() : dialog.removeAttribute('open'));
let openTopicId = null;

$('[data-render=topics]').addEventListener('click', (e) => {
  const b = e.target.closest('[data-topic]');
  if (b) openTopic(b.dataset.topic);
});

function openTopic(id) {
  openTopicId = id;
  const x = TOPICS.find((k) => k.id === id);
  const s = topicText(id);
  const isDone = done.has(id);
  const instructor = mode === 'instructor' ? `
    <details class="inst-notes" open lang="en" dir="ltr">
      <summary>${esc(t('instructorNotes'))}</summary>
      <h3>Key teaching points</h3>
      <ul class="ticks">${x.keyPoints.map((k) => `<li>${esc(k)}</li>`).join('')}</ul>
      <h3>Common faults</h3>
      <div class="faults">${x.faults.map((f) => `
        <div class="fault">
          <p><span class="tag tag-fault">Fault</span>${esc(f.fault)}</p>
          <p><span class="tag tag-cause">Likely cause</span>${esc(f.cause)}</p>
          <p><span class="tag tag-fix">Remedy</span>${esc(f.remedy)}</p>
        </div>`).join('')}</div>
      <h3>Questions to ask</h3>
      <ul class="quotes">${x.questions.map((q) => `<li>${esc(q)}</li>`).join('')}</ul>
      <button class="btn btn-small" data-go-plan="${x.id}">Plan a lesson on this</button>
    </details>` : '';
  $('[data-topic-body]').innerHTML = `
    <header class="dlg-head">
      <div>
        <p class="kicker">${esc(t(STAGE_KEY[x.stage]))}</p>
        <h2 id="dlg-title">${esc(s.title)}</h2>
      </div>
      <button class="dlg-close" data-close aria-label="${esc(t('close'))}">×</button>
    </header>
    <figure class="dlg-pic">${diagram(id, labels())}</figure>
    <section class="simple"><h3>${esc(t('lessonSimple'))}</h3><p>${esc(s.simple)}</p></section>
    <h3>${esc(t('lessonSteps'))}</h3>
    <ol class="steps-big">${(s.steps || []).map((k) => `<li>${esc(k)}</li>`).join('')}</ol>
    ${s.tip ? `<p class="remember"><strong>${esc(t('lessonRemember'))}</strong> ${esc(s.tip)}</p>` : ''}
    <div class="dlg-actions">
      <button class="btn btn-small ${isDone ? 'btn-done' : ''}" data-toggle-done aria-pressed="${isDone}">${isDone ? '✓ ' + esc(t('lessonDoneYes')) : esc(t('lessonDone'))}</button>
      ${x.scenario ? `<button class="btn btn-small btn-primary" data-go-lab="${x.scenario}">${esc(t('watch3d'))}</button>` : ''}
    </div>
    ${instructor}`;
  if (!dialog.open) openDialog();
}

dialog.addEventListener('click', (e) => {
  if (e.target === dialog || e.target.closest('[data-close]')) closeDialog();
  if (e.target.closest('[data-toggle-done]')) {
    if (done.has(openTopicId)) done.delete(openTopicId); else done.add(openTopicId);
    store.set('dt-done', [...done]);
    openTopic(openTopicId);
    renderTopics();
  }
  const labBtn = e.target.closest('[data-go-lab]');
  if (labBtn) {
    closeDialog();
    $(`[data-scenario="${labBtn.dataset.goLab}"]`).click();
    $('#lab').scrollIntoView({ behavior: 'smooth' });
  }
  const plan = e.target.closest('[data-go-plan]');
  if (plan) {
    closeDialog();
    form.topic.value = plan.dataset.goPlan;
    renderPlan();
    $('#planner').scrollIntoView({ behavior: 'smooth' });
  }
});
dialog.addEventListener('close', () => { openTopicId = null; });

/* ---------- Stopping distances ---------- */
let surface = 'dry';
function renderStopping() {
  const k = surface === 'wet' ? 2 : 1;
  const max = (21 + 75) * 2;
  $('[data-render=stopping]').innerHTML = STOPPING.map((s) => {
    const think = s.think, brake = s.brake * k, total = think + brake;
    const cars = Math.round(total / 4);
    return `<div class="stop-row">
      <span class="stop-mph">${s.mph} ${esc(t('mph'))}</span>
      <span class="stop-bar" role="img" aria-label="${s.mph} ${esc(t('mph'))}: ${esc(t('thinking'))} ${think} ${esc(t('metres'))}, ${esc(t('braking'))} ${brake} ${esc(t('metres'))}">
        <span class="b-think" style="width:${(think / max) * 100}%"></span><span class="b-brake" style="width:${(brake / max) * 100}%"></span>
        <span class="stop-total">${total} ${esc(t('metres'))} <small>· ${esc(t('carLengths', { n: cars }))}</small></span>
      </span>
    </div>`;
  }).join('');
}
$('.stop-toggle').addEventListener('click', (e) => {
  const b = e.target.closest('[data-surface]');
  if (!b) return;
  surface = b.dataset.surface;
  $$('[data-surface]').forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
  renderStopping();
});

/* ---------- Instructor toolkit ---------- */
$('[data-render=methods]').innerHTML = METHODS.map((m, i) => `
  <article class="method">
    <span class="method-n">${String(i + 1).padStart(2, '0')}</span>
    <h3>${esc(m.title)}</h3>
    <p>${esc(m.body)}</p>
    <p class="try"><span>Try</span>${esc(m.try)}</p>
  </article>`).join('');

/* ---------- Lesson planner ---------- */
const form = $('[data-planner]');
form.topic.innerHTML = Object.entries(STAGES).map(([k, v]) => `
  <optgroup label="${esc(v.label)}">${TOPICS.filter((x) => x.stage === k).map((x) => `<option value="${x.id}">${esc(x.title)}</option>`).join('')}</optgroup>`).join('');
form.topic.value = 'meeting';
const saved = store.get('dt-planner', null);
if (saved) for (const [k, v] of Object.entries(saved)) { const el = form.elements[k]; if (el) el.value = v; }

const HELP = {
  led: { label: 'instructor-led', text: 'I\'ll talk you through the first few, then we\'ll see how you feel about taking over.' },
  prompted: { label: 'prompted', text: 'You lead, and I\'ll prompt with a word or two if you need it.' },
  independent: { label: 'pupil-led', text: 'You\'re in charge. I\'ll stay quiet unless safety needs me to step in.' },
};

function renderPlan() {
  const f = Object.fromEntries(new FormData(form));
  store.set('dt-planner', f);
  form.confOut.value = f.confidence;
  const x = TOPICS.find((k) => k.id === f.topic);
  const name = f.pupil.trim() || 'your pupil';
  const L = parseInt(f.length, 10);
  const m = (p) => Math.max(5, Math.round((L * p) / 5) * 5);
  const blocks = [['Recap and goal setting', m(0.1)], ['Briefing', m(0.1)], ['Practice: guided', m(0.25)], ['Practice: pupil-led', 0], ['Reflection and next steps', m(0.1)]];
  blocks[3][1] = L - blocks.reduce((a, b) => a + b[1], 0);
  let clock = 0;
  const times = blocks.map(([, mins]) => { const s = clock; clock += mins; return `${s}–${clock}`; });
  const help = HELP[f.help];
  const target = Math.min(10, parseInt(f.confidence, 10) + 3);
  $('[data-plan]').innerHTML = `
    <header class="plan-head">
      <p class="kicker">${L} minute lesson · ${f.weather === 'wet' ? 'wet roads' : 'dry roads'}</p>
      <h3>${esc(x.title)} with ${esc(name)}</h3>
    </header>
    <figure class="plan-pic">${diagram(x.id, labels())}</figure>
    <ol class="plan-steps">
      <li><span class="pt">${times[0]} min</span><div><strong>${blocks[0][0]}</strong>
        <p>Ask how the last lesson felt and what ${esc(name)} wants from today. Agree the goal together: <em>${esc(x.summary)}</em></p>
        <p>Confidence check: ${esc(name)} says ${f.confidence}/10. Aim for about ${target}/10 by the end.</p></div></li>
      <li><span class="pt">${times[1]} min</span><div><strong>${blocks[1][0]}</strong>
        <p>Use the picture above or the 3D practice. Draw out what ${esc(name)} already knows with questions, then fill the gaps:</p>
        <ul>${x.keyPoints.slice(0, 4).map((k) => `<li>${esc(k)}</li>`).join('')}</ul>
        <p><strong>Risk talk:</strong> "You're driving and making the decisions. ${esc(help.text)} If I need to use the dual brake or take the wheel, I'll explain why when we stop."</p>
        ${f.weather === 'wet' ? '<p><strong>Wet roads:</strong> stopping distances at least double, so leave a four-second gap and brake earlier.</p>' : ''}</div></li>
      <li><span class="pt">${times[2]} min</span><div><strong>${blocks[2][0]}</strong>
        <p>Start ${esc(help.label)} on a quiet route. Reduce help as soon as ${esc(name)} gets it right twice in a row.</p>
        <p>Watch for: ${x.faults.map((k) => esc(k.fault.toLowerCase())).join('; ')}.</p></div></li>
      <li><span class="pt">${times[3]} min</span><div><strong>${blocks[3][0]}</strong>
        <p>Move to a busier route. ${esc(name)} leads. Pull up for anything safety-critical and use identify, analyse, remedy:</p>
        <ul>${x.faults.map((k) => `<li>${esc(k.fault)} → ${esc(k.remedy)}</li>`).join('')}</ul></div></li>
      <li><span class="pt">${times[4]} min</span><div><strong>${blocks[4][0]}</strong>
        <p>Ask before you tell:</p>
        <ul>${x.questions.map((q) => `<li>${esc(q)}</li>`).join('')}<li>What went well, and what would you like to work on next time?</li></ul>
        <p>New confidence score, then agree the next lesson.</p></div></li>
    </ol>`;
}
form.addEventListener('input', renderPlan);
form.addEventListener('submit', (e) => e.preventDefault());

const toast = $('[data-toast]');
const say = (msg) => { toast.textContent = msg; clearTimeout(say.t); say.t = setTimeout(() => (toast.textContent = ''), 2500); };
$('[data-plan-copy]').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('[data-plan]').innerText); say('Plan copied'); } catch { say('Copy is blocked here. Select the text instead.'); }
});
$('[data-plan-print]').addEventListener('click', () => {
  document.body.classList.add('print-plan');
  window.print();
  setTimeout(() => document.body.classList.remove('print-plan'), 500);
});

/* ---------- Part 3 self-assessment ---------- */
let scores = store.get('dt-part3', {});
let n = 0;
$('[data-render=competencies]').innerHTML = COMPETENCIES.map((g, gi) => `
  <fieldset class="p3-group">
    <legend>${esc(g.group)}</legend>
    ${g.items.map((item) => {
      n += 1;
      const id = `c${n}`;
      return `<div class="p3-item">
        <p id="${id}-l"><span class="p3-n">${n}</span>${esc(item)}</p>
        <div class="seg" role="radiogroup" aria-labelledby="${id}-l">
          ${[0, 1, 2, 3].map((v) => `<label title="${SCORE_LABELS[v]}"><input type="radio" name="${id}" value="${v}" data-group="${gi}" ${scores[id] === v ? 'checked' : ''}><span>${v}</span></label>`).join('')}
        </div>
      </div>`;
    }).join('')}
  </fieldset>`).join('');

function renderP3() {
  const groupTotals = COMPETENCIES.map(() => 0);
  let total = 0, answered = 0;
  $$('.p3-list input:checked').forEach((i) => {
    const v = parseInt(i.value, 10);
    groupTotals[+i.dataset.group] += v;
    total += v;
    answered += 1;
  });
  const risk = groupTotals[1];
  let verdict, cls;
  if (answered < 17) { verdict = `${17 - answered} still to score`; cls = 'pending'; }
  else if (risk <= 7) { verdict = 'Fail: risk management 7 or less'; cls = 'fail'; }
  else if (total >= 43) { verdict = 'Grade A'; cls = 'pass-a'; }
  else if (total >= 31) { verdict = 'Grade B'; cls = 'pass-b'; }
  else { verdict = 'Fail: under 31'; cls = 'fail'; }
  const maxes = COMPETENCIES.map((g) => g.items.length * 3);
  $('[data-p3-result]').innerHTML = `
    <p class="p3-total"><span>${total}</span>/51</p>
    <p class="p3-verdict v-${cls}">${verdict}</p>
    <ul class="p3-groups">${COMPETENCIES.map((g, i) => `
      <li><span>${esc(g.group)}</span><span>${groupTotals[i]}/${maxes[i]}</span>
        <span class="meter"><span style="width:${(groupTotals[i] / maxes[i]) * 100}%"></span></span></li>`).join('')}</ul>
    <p class="fine">0 no evidence · 1 some · 2 most · 3 all demonstrated</p>
    <button class="btn btn-small" data-p3-reset>Clear scores</button>`;
}
$('.p3-list').addEventListener('change', (e) => {
  if (e.target.name) { scores[e.target.name] = parseInt(e.target.value, 10); store.set('dt-part3', scores); }
  renderP3();
});
$('[data-p3-result]').addEventListener('click', (e) => {
  if (!e.target.closest('[data-p3-reset]')) return;
  scores = {};
  store.set('dt-part3', scores);
  $$('.p3-list input:checked').forEach((i) => (i.checked = false));
  renderP3();
});

/* ---------- Re-render on language change ---------- */
let lab = null;
onLang(() => {
  langSelect.value = lang();
  renderHero();
  renderChips();
  renderTopics();
  renderStopping();
  renderPlan();
  if (openTopicId) openTopic(openTopicId);
  lab?.refreshText();
});

/* ---------- Start ---------- */
setMode(mode);
renderPlan();
renderP3();
setLang(savedLang()).then(() => { langSelect.value = lang(); });

/* ---------- 3D (loaded last so the page works without it) ---------- */
function webglOK() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl')); } catch { return false; }
}
function labFailed(err) {
  if (err) console.error('3D lab failed', err);
  $('[data-lab-fallback]').hidden = false;
  $('[data-lab-status]').hidden = true;
  document.body.classList.add('no-webgl-lab');
  // Still show the steps as text so the section is useful.
  import('./scenarios-text.js').then(({ renderStaticSteps }) => renderStaticSteps($('[data-lab-root]'))).catch(() => {});
}
if (webglOK()) {
  import('./hero.js').then(({ startHero }) => startHero($('.hero-canvas'))).catch((err) => {
    console.error('Hero failed', err);
    document.body.classList.add('no-webgl-hero');
  });
  import('./lab.js').then(({ Lab }) => {
    lab = new Lab($('[data-lab-root]'));
    $('[data-lab-status]').hidden = true;
  }).catch(labFailed);
} else {
  document.body.classList.add('no-webgl-hero');
  labFailed();
}
