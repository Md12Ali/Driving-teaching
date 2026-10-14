# Driving Teaching

A website to teach people to drive safely, from first lesson to test day. Built for learners and for UK driving instructors (ADIs and PDIs).

Live: https://driving-teaching.onrender.com

## Pages

- **index.html** – the main site
  - **Learner mode** (default): 18 lessons A–Z, each with a clear picture, simple step-by-step text and one thing to remember. Learners tick lessons off as they gain confidence.
  - **Instructor mode**: adds key teaching points, common faults (cause and remedy), questions to ask, the teaching toolkit, a lesson planner and a Part 3 / standards check self-assessment.
  - **3D practice**: T-junction, roundabout and meeting traffic scenes you can play, pause, scrub and watch from the driver's seat.
  - **Stopping distances** chart (dry and wet).
- **dashboard.html** – in-car 3D teaching dashboard for a tablet or phone: five scenes (T-junction, two-lane roundabout, parallel park, reverse bay, crossroads with switchable traffic lights), joystick/keyboard driving, drag to place the car, camera presets (overhead, driver, rear quarter, orbit), mirror views, blind spots, reference lines, ideal paths and an A–Z guides drawer.
- **cockpit.html** – driver's-seat simulator for a right-hand-drive car: working interior and door mirrors, the 6-point check step by step, hazards you can switch on and off, and a test mode that hides random hazards for the student to spot.

## Languages

Everything a learner sees is translated into English, বাংলা (Bengali), اردو (Urdu), हिन्दी (Hindi), Polski, Română and العربية (Arabic), with right-to-left layout for Urdu and Arabic. A "More languages" option opens the page through Google Translate. Instructor-only tools are in English.

Translation files live in `js/i18n/<code>.js`. To add a language, copy `en.js`, translate the values and add the code to `LANGS` in `js/i18n.js`.

## Works on more devices

- Three.js r162 is bundled in `vendor/` (no CDN or import map), so it also runs on older iPads and phones that only have WebGL1.
- If 3D cannot start at all, the 3D practice section shows the steps with a picture instead.

## Run locally

No build step:

```bash
python3 -m http.server 8000
# or
npx serve .
```

## Deploy

`render.yaml` sets this up as a Render static site publishing the repo root. Pushes to `main` deploy automatically.

## Structure

```
index.html, dashboard.html, cockpit.html
css/style.css        main site
css/diagrams.css     teaching pictures (shared)
css/dash.css         dashboard and cockpit
css/cockpit.css      cockpit extras
js/main.js           main site UI
js/data.js           instructor content
js/i18n.js           language loading and helpers
js/i18n/*.js         translations (learner content, 3D steps, picture labels)
js/diagrams.js       the 18 SVG teaching pictures
js/world.js          shared 3D pieces: cars, roads, people, traffic lights
js/hero.js           hero scene
js/lab.js            3D practice player
js/scenarios.js      3D practice scenes
js/scenarios-text.js no-3D fallback
js/dash/*            dashboard: environments, driving, overlays, guides
js/cockpit.js        cockpit simulator
vendor/              Three.js r162 and OrbitControls
```

## Note

A teaching aid, not official guidance, and not affiliated with DVSA. Check the Highway Code and DVSA publications for the current rules.
