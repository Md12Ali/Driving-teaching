import en from './i18n/en.js';

export const LANGS = [
  { code: 'en', name: 'English' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'ur', name: 'اردو' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'pl', name: 'Polski' },
  { code: 'ro', name: 'Română' },
  { code: 'ar', name: 'العربية' },
];

// Extra languages through Google Translate (opens a translated copy of the page).
export const MORE_LANGS = [
  ['pa', 'ਪੰਜਾਬੀ'], ['gu', 'ગુજરાતી'], ['ta', 'தமிழ்'], ['so', 'Soomaali'], ['lt', 'Lietuvių'],
  ['pt', 'Português'], ['es', 'Español'], ['tr', 'Türkçe'], ['fa', 'فارسی'], ['ps', 'پښتو'],
  ['uk', 'Українська'], ['ru', 'Русский'], ['bg', 'Български'], ['sq', 'Shqip'], ['fr', 'Français'], ['zh-CN', '中文'],
];

let cur = en;
let code = 'en';
const listeners = new Set();

export const lang = () => code;
export const dir = () => cur.dir || 'ltr';
export const onLang = (fn) => listeners.add(fn);

export async function setLang(c) {
  if (!LANGS.some((l) => l.code === c)) c = 'en';
  try {
    cur = c === 'en' ? en : (await import(`./i18n/${c}.js`)).default;
    code = c;
  } catch (err) {
    console.error('Could not load language', c, err);
    cur = en; code = 'en';
  }
  document.documentElement.lang = code;
  document.documentElement.dir = dir();
  try { localStorage.setItem('dt-lang', code); } catch { /* storage off */ }
  applyStatic();
  listeners.forEach((fn) => fn(code));
}

export function savedLang() {
  try {
    const s = localStorage.getItem('dt-lang');
    if (s) return s;
  } catch { /* storage off */ }
  const nav = (navigator.language || 'en').slice(0, 2);
  return LANGS.some((l) => l.code === nav) ? nav : 'en';
}

export function t(key, vars) {
  let s = cur.ui?.[key] ?? en.ui[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
  return s;
}

export const topicText = (id) => ({ ...en.topics[id], ...(cur.topics?.[id] || {}) });
export const scenarioText = (id) => ({ ...en.scenarios[id], ...(cur.scenarios?.[id] || {}) });
export const labels = () => ({ ...en.labels, ...(cur.labels || {}) });

// Fill every [data-i18n] element; [data-i18n-attr="placeholder:key,aria-label:key2"] for attributes.
export function applyStatic(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    for (const pair of el.dataset.i18nAttr.split(',')) {
      const [attr, key] = pair.split(':');
      el.setAttribute(attr.trim(), t(key.trim()));
    }
  });
}

export function googleTranslateUrl(target) {
  return `https://translate.google.com/translate?sl=en&tl=${encodeURIComponent(target)}&u=${encodeURIComponent(location.href.split('#')[0])}`;
}
