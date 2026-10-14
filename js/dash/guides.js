// Step-by-step guides for the in-car dashboard drawer.
// Each guide can set up the 3D view: env, camera, overlays and which ideal path to show.

export const GUIDES = [
  {
    id: 'cockpit', title: 'Cockpit drill (DSSSM)', topic: 'cockpit',
    setup: { env: 'parallel', camera: 'driver', overlays: { mirrors: true } },
  },
  {
    id: 'pom', title: 'Moving off & stopping (POM + 6-point check)', topic: 'moving-off',
    setup: { env: 'parallel', camera: 'overhead', overlays: { mirrors: true, blind: true } },
    extra: ['6-point check before moving off: left blind spot, left mirror, interior mirror, ahead, right mirror, right blind spot.', 'Signal only if it would help someone. Last look over the right shoulder just before moving.'],
  },
  {
    id: 'mspsl', title: 'MSPSL routine', topic: 'mspsl',
    setup: { env: 'tjunction', camera: 'rear', overlays: { mirrors: true, path: 'left' } },
  },
  {
    id: 'parallel', title: 'Parallel park', topic: 'manoeuvres',
    setup: { env: 'parallel', camera: 'overhead', overlays: { ref: true, path: 'park', mirrors: true } },
    steps: [
      'Pull up alongside the parked car, about 1 metre away, with your rear bumper level with or slightly behind theirs.',
      'Full all-round observation: both blind spots and all mirrors. Reverse slowly in a straight line.',
      'When the rear axle line (yellow) reaches the target car\'s rear bumper, steer one full turn left while creeping back.',
      'When the car is at about 45° to the kerb (target car\'s far headlight appears in your right door mirror), straighten the wheel.',
      'When your left door mirror covers the kerb, steer right to bring the front in. Keep checking all around.',
      'Straighten up, finish within about two car lengths, close to and parallel with the kerb.',
    ],
  },
  {
    id: 'bay', title: 'Reverse bay park', topic: 'manoeuvres',
    setup: { env: 'bay', camera: 'overhead', overlays: { ref: true, path: 'reverse', mirrors: true } },
    steps: [
      'Drive slowly past the target bay, about 1.5 to 2 car lengths away from the bay ends.',
      'Stop at your reference point. A common one: the line of the bay just past your target bay sits level with the yellow B-pillar marker.',
      'All-round observation. Reverse slowly and apply full left lock.',
      'Watch both door mirrors: when the bay lines look parallel to the car, straighten the wheel.',
      'Reverse straight in and stop with the front of the car inside the bay.',
    ],
  },
  {
    id: 'forward-bay', title: 'Forward bay park', topic: 'manoeuvres',
    setup: { env: 'bay', camera: 'rear', overlays: { ref: true } },
    steps: [
      'Approach slowly with space on the side of the target bay.',
      'Signal if it helps, check mirrors and blind spot on the side you are turning towards.',
      'When the bay line appears level with your door mirror, steer firmly towards the bay.',
      'Straighten when the car is parallel to the lines; stop inside the bay.',
      'To leave, reverse out with full observation, giving way to anyone passing.',
    ],
  },
  {
    id: 'pull-right', title: 'Pull up on the right & reverse', topic: 'manoeuvres',
    setup: { env: 'parallel', camera: 'overhead', overlays: { mirrors: true, blind: true } },
    steps: [
      'Check mirrors, signal right if it helps, and cross to the right side when safe.',
      'Stop close and parallel to the kerb on the right.',
      'Full observation. Reverse straight back about two car lengths, looking mainly over your left shoulder and checking the right door mirror.',
      'To rejoin: full 6-point check, signal if needed, and move off back to the left when safe.',
    ],
  },
  {
    id: 'crossings', title: 'Pedestrian crossings', topic: 'crossings',
    setup: { env: 'crossroads', camera: 'driver', overlays: {} },
  },
  {
    id: 'junctions', title: 'Junctions: emerging', topic: 'junctions-emerge',
    setup: { env: 'tjunction', camera: 'driver', overlays: { path: 'right', blind: true } },
  },
  {
    id: 'turning', title: 'Junctions: turning in', topic: 'junctions-turn',
    setup: { env: 'crossroads', camera: 'overhead', overlays: { path: 'right' } },
  },
  {
    id: 'roundabouts', title: 'Roundabouts', topic: 'roundabouts',
    setup: { env: 'roundabout', camera: 'overhead', overlays: { path: 'right' } },
  },
  {
    id: 'lights', title: 'Traffic lights', topic: 'hazards',
    setup: { env: 'crossroads', camera: 'rear', overlays: { path: 'ahead' } },
    extra: ['Red: stop at the line. Red and amber: stop, get ready. Green: go if the way is clear. Amber: stop unless you have crossed the line or stopping would cause a crash.'],
  },
  {
    id: 'speed', title: 'Speed awareness', topic: 'hazards',
    setup: { env: 'tjunction', camera: 'rear', overlays: {} },
    extra: ['Speed limits are a maximum, not a target. In built-up areas with street lights the limit is usually 30 mph, and many London roads are 20 mph.', 'Match speed to what you can see: you must be able to stop in the distance you can see to be clear.', 'Use the dashboard speed readout while driving the learner car to talk about safe speeds for each scene.'],
  },
];
