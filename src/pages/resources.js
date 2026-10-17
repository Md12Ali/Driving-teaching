import { esc, icon, card, pageHead } from '../ui.js';

const CHAPTERS = [
  [14, 'Arriving at the test centre'], [68, "Today's route"], [104, 'Goal and risk'], [301, 'Kildowan Road'], [359, 'Green Lane'],
  [413, 'Trenance Gardens · the bend'], [516, 'Gyllyngdune Gardens'], [633, 'High Road'], [657, 'Cameron Road roundabout'],
  [714, 'Pupil on their own'], [778, 'Pupil reflects'], [848, "The examiner's result"], [874, 'Quick revision'], [913, 'The 17 competencies'],
];
const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const LINKS = [
  ['The Highway Code', 'https://www.gov.uk/guidance/the-highway-code', 'The rules every lesson is based on.'],
  ['What happens during the driving test', 'https://www.gov.uk/driving-test/what-happens-during-test', 'Eyesight check, independent driving, manoeuvres.'],
  ['Show me, tell me questions', 'https://www.gov.uk/government/publications/car-show-me-tell-me-vehicle-safety-questions', 'The official list with answers and videos.'],
  ['Driving test faults and your result', 'https://www.gov.uk/driving-test/driving-test-faults-result', 'Driving, serious and dangerous faults explained.'],
  ['Book a driving test', 'https://www.gov.uk/book-driving-test', 'Official booking service.'],
  ['ADI part 3 test', 'https://www.gov.uk/adi-part-3-test', 'For instructors: the test of instructional ability.'],
];

export function render(root) {
  root.innerHTML = `
  ${pageHead('Resources', 'Official links & instructor media', 'Trusted sources for students, and training material for instructors.')}
  <section class="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    ${LINKS.map(([t, u, d]) => `<a href="${u}" target="_blank" rel="noopener" class="${card} block p-4 hover:shadow-md"><p class="flex items-center justify-between gap-2 font-bold">${esc(t)} ${icon('arrowR', 'size-4 text-slate-400')}</p><p class="mt-1 text-sm text-slate-600 dark:text-slate-400">${esc(d)}</p><p class="mt-2 text-xs font-semibold text-brand-600 dark:text-brand-400">GOV.UK</p></a>`).join('')}
  </section>

  <section class="${card} overflow-hidden">
    <div class="p-5"><p class="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">For instructors · ADI Part 3</p>
      <h2 class="mt-1 text-xl font-extrabold tracking-tight">Model lesson: meeting oncoming traffic on narrow roads</h2>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">A full model lesson from goal setting and risk agreement to the pupil's reflection, about 16 minutes. Practice route around Goodmayes, Ilford; not an official test route.</p></div>
    <div class="grid gap-0 lg:grid-cols-[minmax(0,1fr)_280px]">
      <video controls preload="metadata" playsinline poster="media/adi-part3-poster.jpg" class="aspect-video w-full bg-black" data-video><source src="media/adi-part3-model-lesson.mp4" type="video/mp4"></video>
      <ol class="max-h-80 overflow-auto border-t border-slate-100 p-2 lg:max-h-none lg:border-l lg:border-t-0 dark:border-slate-800">
        ${CHAPTERS.map(([s, t]) => `<li><button data-seek="${s}" class="flex w-full gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"><span class="font-bold tabular-nums text-brand-600 dark:text-brand-400">${mmss(s)}</span>${esc(t)}</button></li>`).join('')}
      </ol>
    </div>
    <div class="flex flex-wrap items-center gap-3 border-t border-slate-100 p-5 dark:border-slate-800">
      <p class="w-full text-sm font-semibold">Revision audio (MP3): the same lesson plus study chapters.</p>
      <audio controls preload="none" src="media/adi-part3-revision-audio.mp3" class="w-full max-w-md"></audio>
      <a href="media/adi-part3-revision-audio.mp3" download class="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 underline dark:text-brand-400">${icon('download', 'size-4')} Download MP3</a>
    </div>
  </section>`;

  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-seek]');
    if (!b) return;
    const v = root.querySelector('[data-video]');
    v.currentTime = Number(b.dataset.seek);
    v.play().catch(() => {});
  });
}
