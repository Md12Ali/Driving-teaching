// Progress store. Everything is saved in this browser (localStorage), per student profile.
// Instructors can keep several students on one device and move data with Export / Import.
import { LESSONS, itemId } from './data/curriculum.js';
import { SESSIONS } from './data/route.js';

const KEY = 'dt-data-v2';
const listeners = new Set();

const newId = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

function blankStudent(name = 'My progress') {
  return { id: newId(), name, created: now(), updated: now(), levels: {}, studied: {}, notes: {}, showme: {}, mocks: [], route: {}, ready: {} };
}

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    if (raw && raw.students && Object.keys(raw.students).length) return raw;
  } catch { /* storage unavailable or corrupt */ }
  const s = blankStudent();
  return { version: 2, activeId: s.id, students: { [s.id]: s } };
}

let state = load();
// Older profiles: add the route fields.
for (const st of Object.values(state.students)) { st.route ||= {}; st.ready ||= {}; }

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode: keep in memory */ }
  listeners.forEach((fn) => fn());
}

function touch(st) { st.updated = now(); }

export const store = {
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  get students() { return Object.values(state.students).sort((a, b) => a.name.localeCompare(b.name)); },
  get active() { return state.students[state.activeId] || Object.values(state.students)[0]; },

  setActive(id) { if (state.students[id]) { state.activeId = id; persist(); } },
  addStudent(name) { const s = blankStudent(name.trim() || 'New student'); state.students[s.id] = s; state.activeId = s.id; persist(); return s; },
  renameStudent(id, name) { const s = state.students[id]; if (s && name.trim()) { s.name = name.trim(); touch(s); persist(); } },
  deleteStudent(id) {
    delete state.students[id];
    if (!Object.keys(state.students).length) { const s = blankStudent(); state.students[s.id] = s; }
    if (!state.students[state.activeId]) state.activeId = Object.keys(state.students)[0];
    persist();
  },
  resetStudent(id) { const s = state.students[id]; Object.assign(s, { levels: {}, studied: {}, notes: {}, showme: {}, mocks: [], route: {}, ready: {} }); touch(s); persist(); },

  level(key) { return this.active.levels[key] ?? 0; },
  setLevel(key, v) { const s = this.active; if (v) s.levels[key] = v; else delete s.levels[key]; touch(s); persist(); },
  isStudied(lessonId) { return !!this.active.studied[lessonId]; },
  toggleStudied(lessonId) { const s = this.active; if (s.studied[lessonId]) delete s.studied[lessonId]; else s.studied[lessonId] = now(); touch(s); persist(); },
  note(lessonId) { return this.active.notes[lessonId] || ''; },
  setNote(lessonId, text) { const s = this.active; if (text.trim()) s.notes[lessonId] = text; else delete s.notes[lessonId]; touch(s); persist(); },

  showme(qid) { return this.active.showme[qid] || null; },
  setShowme(qid, v) { const s = this.active; if (v) s.showme[qid] = v; else delete s.showme[qid]; touch(s); persist(); },
  clearShowme() { this.active.showme = {}; touch(this.active); persist(); },

  get mocks() { return [...this.active.mocks].sort((a, b) => (b.date || '').localeCompare(a.date || '')); },
  mock(id) { return this.active.mocks.find((m) => m.id === id); },
  saveMock(m) {
    const s = this.active;
    if (!m.id) { m.id = newId(); m.created = now(); s.mocks.push(m); } else { const i = s.mocks.findIndex((x) => x.id === m.id); if (i >= 0) s.mocks[i] = m; else s.mocks.push(m); }
    touch(s); persist(); return m;
  },
  deleteMock(id) { const s = this.active; s.mocks = s.mocks.filter((m) => m.id !== id); touch(s); persist(); },

  // Teaching route: session status 'doing' | 'done', and "ready to move on" ticks.
  routeStatus(sid) { return this.active.route[sid] || 'none'; },
  setRouteStatus(sid, v) { const s = this.active; if (v === 'none') delete s.route[sid]; else s.route[sid] = v; touch(s); persist(); },
  isReady(key) { return !!this.active.ready[key]; },
  toggleReady(key) { const s = this.active; if (s.ready[key]) delete s.ready[key]; else s.ready[key] = 1; touch(s); persist(); },

  exportStudent(id = state.activeId) {
    const s = state.students[id];
    return JSON.stringify({ app: 'driving-teaching', version: 2, exported: now(), student: s }, null, 2);
  },
  importStudent(text) {
    const data = JSON.parse(text);
    const s = data.student;
    if (data.app !== 'driving-teaching' || !s || typeof s !== 'object' || !s.levels) throw new Error('This file is not a Driving Teaching backup.');
    const clean = { ...blankStudent(String(s.name || 'Imported student').slice(0, 60)), levels: s.levels || {}, studied: s.studied || {}, notes: s.notes || {}, showme: s.showme || {}, mocks: Array.isArray(s.mocks) ? s.mocks : [], route: s.route || {}, ready: s.ready || {} };
    // If a profile with the same original id exists, replace it; otherwise add a new one.
    if (s.id && state.students[s.id]) { clean.id = s.id; }
    state.students[clean.id] = clean;
    state.activeId = clean.id;
    persist();
    return clean;
  },
};

/* ---------- Progress maths ---------- */
export function lessonScore(lesson, st = store.active) {
  const n = lesson.checklist.length;
  let sum = 0, mastered = 0, touched = 0;
  lesson.checklist.forEach((_, i) => {
    const v = st.levels[itemId(lesson, i)] || 0;
    sum += v;
    if (v === 3) mastered += 1;
    if (v > 0) touched += 1;
  });
  const pct = n ? Math.round((sum / (n * 3)) * 100) : 0;
  const status = mastered === n ? 'mastered' : touched ? 'practising' : 'none';
  return { pct, status, mastered, touched, n };
}

export function phaseScore(phaseId, st = store.active) {
  const ls = LESSONS.filter((l) => l.phase === phaseId);
  const scores = ls.map((l) => lessonScore(l, st));
  const items = scores.reduce((a, s) => a + s.n, 0);
  const pts = ls.reduce((a, l) => a + l.checklist.reduce((b, _, i) => b + (st.levels[itemId(l, i)] || 0), 0), 0);
  return {
    pct: items ? Math.round((pts / (items * 3)) * 100) : 0,
    mastered: scores.filter((s) => s.status === 'mastered').length,
    practising: scores.filter((s) => s.status === 'practising').length,
    total: ls.length,
  };
}

export function readiness(st = store.active) {
  let pts = 0, max = 0;
  for (const l of LESSONS) l.checklist.forEach((_, i) => { pts += st.levels[itemId(l, i)] || 0; max += 3; });
  const scores = LESSONS.map((l) => lessonScore(l, st));
  return {
    pct: max ? Math.round((pts / max) * 100) : 0,
    mastered: scores.filter((s) => s.status === 'mastered').length,
    practising: scores.filter((s) => s.status === 'practising').length,
    none: scores.filter((s) => s.status === 'none').length,
    studied: LESSONS.filter((l) => st.studied[l.id]).length,
    total: LESSONS.length,
  };
}

export function nextLesson(st = store.active) {
  return LESSONS.find((l) => lessonScore(l, st).status !== 'mastered') || null;
}

export function mockResult(m) {
  let d = 0, s = 0, x = 0;
  for (const v of Object.values(m.marks || {})) { d += v.d || 0; s += v.s || 0; x += v.x || 0; }
  return { d, s, x, pass: d <= 15 && !s && !x };
}

export function routeProgress(st = store.active) {
  const done = SESSIONS.filter((x) => st.route?.[x.id] === 'done').length;
  const current = SESSIONS.find((x) => st.route?.[x.id] === 'doing') || SESSIONS.find((x) => st.route?.[x.id] !== 'done') || null;
  return { done, total: SESSIONS.length, pct: Math.round((done / SESSIONS.length) * 100), current };
}

/* ---------- Theme ---------- */
export const theme = {
  get() { try { return JSON.parse(localStorage.getItem('dt-theme')) || 'system'; } catch { return 'system'; } },
  set(v) { try { localStorage.setItem('dt-theme', JSON.stringify(v)); } catch { /* ignore */ } theme.apply(); },
  apply() {
    const v = theme.get();
    const dark = v === 'dark' || (v === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
  },
};
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => theme.apply());
