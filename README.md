# Driving Teaching

A web app for UK driving instructors and their students, from first lesson to passing the test.

**Live:** https://driving-teaching.onrender.com

## What it does

- **Dashboard**: overall test-readiness percentage, progress for each of the 4 phases, the next lesson to work on, the latest mock test and Show me / Tell me score.
- **A to Z curriculum**: 30 lessons in 4 phases:
  1. Fundamentals
  2. Junctions & Traffic
  3. Manoeuvres & High Speed
  4. Test Readiness
- **Lesson pages**: each one has a core objective, a teaching picture, a step-by-step procedure (POM, MSM, MSPSL…), a real example, common test faults (with the test report category and how to avoid them), and a self-assessment checklist rated *Not started → Introduced → Prompted → Independent*. Students can mark a lesson as studied before the car, and instructors can add notes.
- **Status badges**: green = Mastered (every skill Independent), amber = Practising, grey = Not started.
- **Manoeuvre cheat-sheets**: animated step-by-step parallel park, reverse bay park, forward bay park and pull up on the right. Each step shows the steering position, the reference point and the observations to make.
- **Show me, tell me trainer**: flashcards with all 14 *tell me* and 7 *show me* questions (the official GOV.UK list), marked "Got it" or "Need practice".
- **Mock test sheet**: digital marking laid out like the examiner's report, with driving faults (minors), serious (S) and dangerous (X) faults, a live pass/fail result, auto-save, history and print.
- **Students**: separate progress profiles per student, with export/import of a backup file to share progress between devices.
- **Resources**: official GOV.UK links and the ADI Part 3 model lesson video and revision audio.
- Responsive for phones, tablets and desktop, with light, dark and system themes.

Everything is saved in the browser (`localStorage`) on the device. There is no server or login. Use Export on the Students page to back up or share.

## Directory structure

```
index.html                 App shell: sidebar, top bar, bottom tab bar
assets/
  css/input.css            Tailwind v4 source: theme, components, picture styles
  css/app.css              Compiled CSS (committed, so no build step on Render)
  icons/favicon.svg
media/                     ADI Part 3 model lesson video, poster and audio
scripts/
  build-css.mjs            Compiles app.css with Tailwind v4 (scans index.html and src/)
src/
  app.js                   Hash router, navigation, theme and profile switch
  store.js                 Student profiles, progress, mock tests, export/import, readiness maths
  ui.js                    Icons, badges, progress bars and ring, buttons, helpers
  data/
    curriculum.js          Phases and the 30 lessons (objective, steps, example, faults, checklist)
    manoeuvres.js          Manoeuvre steps: car positions, steering, reference points, observations
    showme.js              Show me / Tell me questions and answers
    testreport.js          Driving test report categories for the mock test sheet
  diagrams/
    kit.js                 SVG drawing kit: cars, roads, labels, arrows (UK left-hand traffic)
    index.js               One teaching picture per lesson
  pages/
    dashboard.js  curriculum.js  lesson.js  manoeuvres.js
    showme.js     mocktest.js    students.js  resources.js
render.yaml                Render static site settings
package.json
```

## Run locally

```bash
python3 -m http.server 8000      # or: npx serve .
```

Open http://localhost:8000.

## Change styles or classes

Tailwind classes are written straight into the HTML and JS. After adding new classes, rebuild the CSS and commit `assets/css/app.css`:

```bash
npm install          # installs tailwindcss v4
npm run build:css
```

## Edit the content

- Lessons: `src/data/curriculum.js`. Checklist ratings are stored per lesson id and item position, so add new checklist items at the end of a list.
- Pictures: `src/diagrams/index.js` (640×360 canvas; on a north–south road, northbound traffic uses the left half).
- Manoeuvre steps and reference points: `src/data/manoeuvres.js`.

## Deploy

Render serves the repo root as a static site with no build command. Pushing to `main` updates the site; if a push doesn't deploy, trigger a manual deploy in Render.

## Note

A teaching aid, not official guidance, and not affiliated with DVSA. Show me / Tell me questions, fault definitions and test facts were checked against GOV.UK in October 2026. Always check the Highway Code and GOV.UK for current rules.
