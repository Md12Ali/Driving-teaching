# Driving Teaching

An A to Z guide for UK driving instructors (ADIs) and trainee instructors (PDIs): how to teach, what to teach, and interactive 3D scenarios to use in briefings.

## What's in it

- **Teaching toolkit**: client-centred learning, GROW, levels of instruction, sharing risk, identify–analyse–remedy, feedback and reflection.
- **A to Z topics**: 18 lessons from cockpit drill to test readiness, each with key points, common faults (cause and remedy) and open questions.
- **3D scenario lab** (Three.js): emerging right at a T-junction, turning right at a roundabout, and meeting traffic with parked cars. Play, pause, scrub, half speed, overview or driver's view. Cars drive on the left with working indicators and brake lights.
- **Stopping distances**: Highway Code figures, dry and wet.
- **Lesson planner**: builds a timed, client-centred lesson plan from a topic, confidence score, level of help, length and weather. Copy or print.
- **Part 3 / standards check self-assessment**: score all 17 competencies 0–3 with live total, grade bands and the risk management rule. Saved in the browser.

## Run locally

No build step. Serve the folder with any static server:

```bash
npx serve .
# or
python3 -m http.server 8000
```

Three.js loads from the jsDelivr CDN through an import map.

## Deploy on Render

`render.yaml` sets this up as a static site publishing the repo root. In Render: New → Blueprint → pick this repo, or New → Static Site with publish directory `.` and no build command.

## Structure

```
index.html        page layout
css/style.css     styles (light and dark)
js/main.js        UI: topics, planner, Part 3 scorer, stopping chart
js/data.js        all teaching content
js/world.js       shared 3D pieces: cars, roads, houses, trees
js/hero.js        hero scene
js/lab.js         scenario player
js/scenarios.js   scenario layouts, car paths and timed steps
```

To add a scenario, add an entry to `SCENARIOS` in `js/scenarios.js` and a tab button in `index.html`.

## Note

A teaching aid, not official guidance, and not affiliated with DVSA. Check the Highway Code and DVSA publications for the current rules.
