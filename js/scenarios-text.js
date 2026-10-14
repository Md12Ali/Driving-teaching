// Text-only version of the 3D lab, used when WebGL is not available.
import { scenarioText, onLang } from './i18n.js';
import { diagram } from './diagrams.js';
import { labels } from './i18n.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const PIC = { tjunction: 'junctions-emerge', roundabout: 'roundabouts', meeting: 'meeting' };

export function renderStaticSteps(root) {
  let current = 'tjunction';
  const stage = root.querySelector('.lab-stage');
  const draw = () => {
    const txt = scenarioText(current);
    root.querySelector('[data-lab=title]').textContent = txt.title;
    root.querySelector('[data-lab=blurb]').textContent = txt.blurb;
    root.querySelector('[data-lab=steps]').innerHTML = (txt.steps || []).map(([title, text], i) => `
      <li class="is-active"><span class="step-n">${i + 1}</span><span><strong>${esc(title)}</strong><span class="step-text">${esc(text)}</span></span></li>`).join('');
    stage.innerHTML = `<div class="lab-static-pic">${diagram(PIC[current], labels())}</div>`;
    root.querySelectorAll('[data-scenario]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.scenario === current)));
  };
  root.querySelectorAll('[data-scenario]').forEach((b) => b.addEventListener('click', () => { current = b.dataset.scenario; draw(); }));
  root.querySelector('.lab-controls').hidden = true;
  onLang(draw);
  draw();
}
