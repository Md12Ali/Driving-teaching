import { TOPICS, METHODS, STAGES, COMPETENCIES, SCORE_LABELS, STOPPING } from './data.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage off */ } },
};

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

$('[data-count=topics]').textContent = TOPICS.length;

/* ---------- Toolkit ---------- */
$('[data-render=methods]').innerHTML = METHODS.map((m, i) => `
  <article class="method">
    <span class="method-n">${String(i + 1).padStart(2, '0')}</span>
    <h3>${esc(m.title)}</h3>
    <p>${esc(m.body)}</p>
    <p class="try"><span>Try</span>${esc(m.try)}</p>
  </article>`).join('');

/* ---------- Topics ---------- */
let stageFilter = 'all';
const chips = $('[data-render=stage-chips]');
chips.innerHTML = [['all', 'All'], ...Object.entries(STAGES).map(([k, v]) => [k, v.label])]
  .map(([k, label]) => `<button class="chip" data-stage="${k}" aria-pressed="${k === 'all'}">${esc(label)}</button>`).join('');
chips.addEventListener('click', (e) => {
  const b = e.target.closest('[data-stage]');
  if (!b) return;
  stageFilter = b.dataset.stage;
  $$('[data-stage]', chips).forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
  renderTopics();
});
const search = $('[data-topic-search]');
search.addEventListener('input', renderTopics);

function renderTopics() {
  const q = search.value.trim().toLowerCase();
  const list = TOPICS.filter((t) => (stageFilter === 'all' || t.stage === stageFilter) &&
    (!q || [t.title, t.summary, ...t.keyPoints].join(' ').toLowerCase().includes(q)));
  $('[data-render=topics]').innerHTML = list.map((t) => `
    <li>
      <button class="topic" data-topic="${t.id}">
        <span class="topic-n">${String(TOPICS.indexOf(t) + 1).padStart(2, '0')}</span>
        <span class="topic-stage stage-${t.stage}">${esc(STAGES[t.stage].label)}</span>
        <span class="topic-title">${esc(t.title)}</span>
        <span class="topic-sum">${esc(t.summary)}</span>
        ${t.scenario ? '<span class="topic-3d">3D scenario</span>' : ''}
      </button>
    </li>`).join('');
  $('[data-topic-empty]').hidden = list.length > 0;
}
renderTopics();

const dialog = $('[data-topic-dialog]');
$('[data-render=topics]').addEventListener('click', (e) => {
  const b = e.target.closest('[data-topic]');
  if (b) openTopic(b.dataset.topic);
});
function openTopic(id) {
  const t = TOPICS.find((x) => x.id === id);
  $('[data-topic-body]').innerHTML = `
    <header class="dlg-head">
      <div>
        <p class="kicker">${esc(STAGES[t.stage].label)}</p>
        <h2 id="dlg-title">${esc(t.title)}</h2>
        <p>${esc(t.summary)}</p>
      </div>
      <button class="dlg-close" data-close aria-label="Close">×</button>
    </header>
    <h3>Key teaching points</h3>
    <ul class="ticks">${t.keyPoints.map((k) => `<li>${esc(k)}</li>`).join('')}</ul>
    <h3>Common faults</h3>
    <div class="faults">${t.faults.map((f) => `
      <div class="fault">
        <p><span class="tag tag-fault">Fault</span>${esc(f.fault)}</p>
        <p><span class="tag tag-cause">Likely cause</span>${esc(f.cause)}</p>
        <p><span class="tag tag-fix">Remedy</span>${esc(f.remedy)}</p>
      </div>`).join('')}</div>
    <h3>Questions to ask</h3>
    <ul class="quotes">${t.questions.map((q) => `<li>${esc(q)}</li>`).join('')}</ul>
    <div class="dlg-actions">
      ${t.scenario ? `<button class="btn btn-small btn-primary" data-go-lab="${t.scenario}">Watch it in 3D</button>` : ''}
      <button class="btn btn-small" data-go-plan="${t.id}">Plan a lesson on this</button>
    </div>`;
  dialog.showModal();
}
dialog.addEventListener('click', (e) => {
  if (e.target === dialog || e.target.closest('[data-close]')) dialog.close();
  const lab = e.target.closest('[data-go-lab]');
  if (lab) {
    dialog.close();
    $(`[data-scenario="${lab.dataset.goLab}"]`).click();
    $('#lab').scrollIntoView({ behavior: 'smooth' });
  }
  const plan = e.target.closest('[data-go-plan]');
  if (plan) {
    dialog.close();
    form.topic.value = plan.dataset.goPlan;
    renderPlan();
    $('#planner').scrollIntoView({ behavior: 'smooth' });
  }
});

/* ---------- Stopping distances ---------- */
let surface = 'dry';
function renderStopping() {
  const k = surface === 'wet' ? 2 : 1;
  const max = (21 + 75) * 2;
  $('[data-render=stopping]').innerHTML = STOPPING.map((s) => {
    const think = s.think, brake = s.brake * k, total = think + brake;
    return `<div class="stop-row">
      <span class="stop-mph">${s.mph} mph</span>
      <span class="stop-bar" role="img" aria-label="${s.mph} mph: thinking ${think} metres, braking ${brake} metres, total ${total} metres">
        <span class="b-think" style="width:${(think / max) * 100}%"></span><span class="b-brake" style="width:${(brake / max) * 100}%"></span>
        <span class="stop-total">${total} m</span>
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
renderStopping();

/* ---------- Lesson planner ---------- */
const form = $('[data-planner]');
form.topic.innerHTML = Object.entries(STAGES).map(([k, v]) => `
  <optgroup label="${esc(v.label)}">${TOPICS.filter((t) => t.stage === k).map((t) => `<option value="${t.id}">${esc(t.title)}</option>`).join('')}</optgroup>`).join('');
form.topic.value = 'meeting';
const saved = store.get('dt-planner', null);
if (saved) for (const [k, v] of Object.entries(saved)) {
  const el = form.elements[k];
  if (!el) continue;
  if (el instanceof RadioNodeList) el.value = v; else el.value = v;
}

const HELP = {
  led: { label: 'instructor-led', text: 'I\'ll talk you through the first few, then we\'ll see how you feel about taking over.' },
  prompted: { label: 'prompted', text: 'You lead, and I\'ll prompt with a word or two if you need it.' },
  independent: { label: 'pupil-led', text: 'You\'re in charge. I\'ll stay quiet unless safety needs me to step in.' },
};

function renderPlan() {
  const f = Object.fromEntries(new FormData(form));
  store.set('dt-planner', f);
  form.confOut.value = f.confidence;
  const t = TOPICS.find((x) => x.id === f.topic);
  const name = f.pupil.trim() || 'your pupil';
  const L = parseInt(f.length, 10);
  const m = (p) => Math.max(5, Math.round((L * p) / 5) * 5);
  const blocks = [
    ['Recap and goal setting', m(0.1)],
    ['Briefing', m(0.1)],
    ['Practice: guided', m(0.25)],
    ['Practice: pupil-led', 0],
    ['Reflection and next steps', m(0.1)],
  ];
  blocks[3][1] = L - blocks.reduce((a, b) => a + b[1], 0);
  let clock = 0;
  const times = blocks.map(([, mins]) => { const s = clock; clock += mins; return `${s}–${clock}`; });
  const help = HELP[f.help];
  const target = Math.min(10, parseInt(f.confidence, 10) + 3);
  const plan = `
    <header class="plan-head">
      <p class="kicker">${L} minute lesson · ${esc(f.weather === 'wet' ? 'wet roads' : 'dry roads')}</p>
      <h3>${esc(t.title)} with ${esc(name)}</h3>
    </header>
    <ol class="plan-steps">
      <li><span class="pt">${times[0]} min</span><div><strong>${blocks[0][0]}</strong>
        <p>Ask how the last lesson felt and what ${esc(name)} wants from today. Agree the goal together: <em>${esc(t.summary)}</em></p>
        <p>Confidence check: ${esc(name)} says ${f.confidence}/10. Aim for about ${target}/10 by the end.</p></div></li>
      <li><span class="pt">${times[1]} min</span><div><strong>${blocks[1][0]}</strong>
        <p>Use a diagram or the 3D lab. Draw out what ${esc(name)} already knows with questions, then fill the gaps:</p>
        <ul>${t.keyPoints.slice(0, 4).map((k) => `<li>${esc(k)}</li>`).join('')}</ul>
        <p><strong>Risk talk:</strong> "You're driving and making the decisions. ${esc(help.text)} If I need to use the dual brake or take the wheel, I'll explain why when we stop."</p>
        ${f.weather === 'wet' ? '<p><strong>Wet roads:</strong> stopping distances at least double, so leave a four-second gap and brake earlier.</p>' : ''}</div></li>
      <li><span class="pt">${times[2]} min</span><div><strong>${blocks[2][0]}</strong>
        <p>Start ${esc(help.label)} on a quiet route. Reduce help as soon as ${esc(name)} gets it right twice in a row.</p>
        <p>Watch for: ${t.faults.map((x) => esc(x.fault.toLowerCase())).join('; ')}.</p></div></li>
      <li><span class="pt">${times[3]} min</span><div><strong>${blocks[3][0]}</strong>
        <p>Move to a busier route. ${esc(name)} leads. Pull up for anything safety-critical and use identify, analyse, remedy:</p>
        <ul>${t.faults.map((x) => `<li>${esc(x.fault)} → ${esc(x.remedy)}</li>`).join('')}</ul></div></li>
      <li><span class="pt">${times[4]} min</span><div><strong>${blocks[4][0]}</strong>
        <p>Ask before you tell:</p>
        <ul>${t.questions.map((q) => `<li>${esc(q)}</li>`).join('')}<li>What went well, and what would you like to work on next time?</li></ul>
        <p>New confidence score, then agree the next lesson.</p></div></li>
    </ol>`;
  $('[data-plan]').innerHTML = plan;
}
form.addEventListener('input', renderPlan);
form.addEventListener('submit', (e) => e.preventDefault());
renderPlan();

const toast = $('[data-toast]');
const say = (msg) => { toast.textContent = msg; clearTimeout(say.t); say.t = setTimeout(() => (toast.textContent = ''), 2500); };
$('[data-plan-copy]').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText($('[data-plan]').innerText);
    say('Plan copied');
  } catch {
    say('Copy is blocked here. Select the text instead.');
  }
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
renderP3();

/* ---------- 3D (loaded last so the page works without WebGL) ---------- */
function webglOK() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}
if (webglOK()) {
  import('./hero.js').then(({ startHero }) => startHero($('.hero-canvas'))).catch((err) => console.error('Hero failed', err));
  import('./lab.js').then(({ Lab }) => new Lab($('[data-lab-root]'))).catch((err) => {
    console.error('Lab failed', err);
    $('[data-lab-fallback]').hidden = false;
  });
} else {
  document.body.classList.add('no-webgl');
  $('[data-lab-fallback]').hidden = false;
}
