import { store, readiness } from '../store.js';
import { esc, icon, card, btnGhost, btnPrimary, btnDanger, pageHead, bar, fmtDate, toast, download, $ } from '../ui.js';

export function render(root) {
  const draw = () => {
    const active = store.active;
    root.innerHTML = `
    ${pageHead('Profiles & data', 'Students', 'Keep a separate progress record for each student. Everything is saved in this browser on this device only.', `<button class="${btnGhost}" data-import>${icon('upload', 'size-4')} Import</button>`)}
    <form class="${card} mb-6 flex flex-col gap-3 p-5 sm:flex-row sm:items-end" data-add>
      <label class="flex-1"><span class="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Add a student</span>
        <input name="name" required maxlength="60" placeholder="Student's name" class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"></label>
      <button class="${btnPrimary}">${icon('plus', 'size-4')} Add student</button>
    </form>
    <ul class="grid gap-4 md:grid-cols-2">
      ${store.students.map((s) => {
        const r = readiness(s);
        const on = s.id === active.id;
        return `<li class="${card} p-5 ${on ? 'ring-2 ring-brand-600 dark:ring-brand-400' : ''}">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0"><p class="truncate text-lg font-extrabold">${esc(s.name)}</p><p class="text-xs text-slate-500">Updated ${fmtDate(s.updated)} · ${s.mocks.length} mock test${s.mocks.length === 1 ? '' : 's'}</p></div>
            ${on ? '<span class="rounded-full bg-brand-600 px-2.5 py-0.5 text-xs font-bold text-white dark:bg-brand-400 dark:text-slate-950">Active</span>' : `<button class="${btnPrimary} !py-1.5" data-use="${s.id}">Switch to</button>`}
          </div>
          <div class="mt-4 flex items-center gap-3"><div class="flex-1">${bar(r.pct)}</div><span class="text-sm font-bold tabular-nums">${r.pct}% ready</span></div>
          <p class="mt-2 text-xs text-slate-500">${r.mastered} mastered · ${r.practising} practising · ${r.studied} studied</p>
          <div class="mt-4 flex flex-wrap gap-2">
            <button class="${btnGhost} !px-3 !py-1.5" data-rename="${s.id}">${icon('edit', 'size-4')} Rename</button>
            <button class="${btnGhost} !px-3 !py-1.5" data-export="${s.id}">${icon('download', 'size-4')} Export</button>
            <button class="${btnGhost} !px-3 !py-1.5" data-reset="${s.id}">${icon('flip', 'size-4')} Reset</button>
            <button class="${btnDanger} !px-3 !py-1.5" data-delete="${s.id}">${icon('trash', 'size-4')} Delete</button>
          </div>
        </li>`;
      }).join('')}
    </ul>
    <section class="mt-8 rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sm text-sky-950 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100">
      <h2 class="flex items-center gap-2 font-extrabold">${icon('info', 'size-4')} Sharing progress between instructor and student</h2>
      <ol class="mt-2 list-decimal space-y-1 pl-5">
        <li>On the device with the latest progress, tap <b>Export</b> to save a small backup file.</li>
        <li>Send it by WhatsApp, email or AirDrop.</li>
        <li>On the other device, open this page and tap <b>Import</b>. Importing a file for the same student updates that profile.</li>
      </ol>
      <p class="mt-2">Export regularly as a backup: clearing the browser's data deletes saved progress.</p>
    </section>
    <input type="file" accept="application/json,.json" class="hidden" data-file>`;
  };

  root.addEventListener('submit', (e) => {
    if (!e.target.matches('[data-add]')) return;
    e.preventDefault();
    const s = store.addStudent(new FormData(e.target).get('name'));
    toast(`${s.name} added and selected`);
    draw();
  });
  root.addEventListener('click', (e) => {
    const g = (k) => e.target.closest(`[data-${k}]`)?.dataset[k];
    let id;
    if ((id = g('use'))) { store.setActive(id); toast(`Now showing ${store.active.name}`); draw(); }
    if ((id = g('rename'))) { const s = store.students.find((x) => x.id === id); const n = prompt('New name', s.name); if (n) { store.renameStudent(id, n); draw(); } }
    if ((id = g('export'))) { const s = store.students.find((x) => x.id === id); download(`driving-progress-${s.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`, store.exportStudent(id)); }
    if ((id = g('reset'))) { const s = store.students.find((x) => x.id === id); if (confirm(`Clear all progress, notes and mock tests for ${s.name}?`)) { store.resetStudent(id); draw(); } }
    if ((id = g('delete'))) { const s = store.students.find((x) => x.id === id); if (confirm(`Delete ${s.name} and all their progress? Export first if you want a backup.`)) { store.deleteStudent(id); draw(); } }
    if (e.target.closest('[data-import]')) $('[data-file]', root).click();
  });
  root.addEventListener('change', async (e) => {
    if (!e.target.matches('[data-file]')) return;
    const f = e.target.files[0];
    if (!f) return;
    try { const s = store.importStudent(await f.text()); toast(`Imported ${s.name}`); draw(); } catch (err) { alert(err.message || 'Could not read that file.'); }
    e.target.value = '';
  });
  draw();
}
