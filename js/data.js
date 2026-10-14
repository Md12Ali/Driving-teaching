// Teaching content for the Driving Teaching guide.
// Written for UK approved driving instructors (ADIs) and trainees (PDIs).
// Always check details against the current Highway Code and DVSA guidance.

export const STAGES = {
  foundation: { label: 'Foundation', hint: 'First lessons' },
  core: { label: 'Core road skills', hint: 'Junctions and traffic' },
  advanced: { label: 'Advanced', hint: 'Faster roads and test prep' },
};

export const TOPICS = [
  {
    id: 'cockpit',
    title: 'Cockpit drill',
    stage: 'foundation',
    summary: 'Set the pupil up safely before the engine starts: doors, seat, steering, seatbelt, mirrors.',
    keyPoints: [
      'Use a memorable routine such as DSSSM: Doors, Seat, Steering, Seatbelt, Mirrors.',
      'Seat: heel on the floor with the clutch fully down and a slight bend in the knee.',
      'Head restraint level with the eyes or the top of the ears, not the neck.',
      'Hands at "ten to two" or "quarter to three" with a slight bend at the elbow.',
      'Interior mirror frames the whole rear window; door mirrors show a sliver of the car body.',
      'Before starting: handbrake on and gear lever in neutral.',
    ],
    faults: [
      { fault: 'Seat too far back', cause: 'Copies a parent or a previous driver', remedy: 'Check the clutch can go fully down with a bent knee; let the pupil feel the difference.' },
      { fault: 'Mirrors adjusted with the head moved', cause: 'Leaning to see', remedy: 'Sit in the normal driving position first, then adjust.' },
    ],
    questions: [
      'Why do you think the seat position matters for an emergency stop?',
      'What could happen if the head restraint is too low?',
    ],
  },
  {
    id: 'controls',
    title: 'Controls and instruments',
    stage: 'foundation',
    summary: 'Main foot and hand controls, warning lights and the job each one does.',
    keyPoints: [
      'Foot controls from right to left: accelerator, brake, clutch (A-B-C).',
      'Clutch: down, bite point, up. Find the bite point by sound, feel and the car lifting slightly.',
      'Handbrake (parking brake): button in, firm pull, never on while moving.',
      'Gears: palm the lever, guide it, eyes stay on the road.',
      'Red warning lights mean stop safely and check; amber means get it checked soon.',
    ],
    faults: [
      { fault: 'Looks down at the gear lever', cause: 'Low confidence in the gear pattern', remedy: 'Static practice with eyes closed, then talk through on a quiet road.' },
      { fault: 'Rides the clutch', cause: 'Foot rests on the pedal', remedy: 'Explain wear and lost control; foot goes to the floor rest after each change.' },
    ],
    questions: ['How will you know you have found the bite point?', 'Which warning lights would make you stop straight away?'],
  },
  {
    id: 'moving-off',
    title: 'Moving off and stopping',
    stage: 'foundation',
    summary: 'POM to move off, MSM to pull up. The base routine every other skill builds on.',
    keyPoints: [
      'POM: Prepare (clutch down, first gear, gas, bite point), Observe (mirrors and both blind spots), Move (handbrake off, signal only if it helps someone).',
      'Check the blind spot over the right shoulder last, just before moving.',
      'Stopping: Mirrors, Signal if needed, Manoeuvre. Pick a safe, legal, convenient spot (SLC).',
      'Brake gently, clutch down just before stopping, handbrake on and neutral.',
      'Uphill: more gas and hold the bite point. Downhill: brake held, release the handbrake, ease off the brake.',
    ],
    faults: [
      { fault: 'Stalls when moving off', cause: 'Clutch lifted past the bite point too fast', remedy: 'Hold still at the bite point for two seconds, then lift slowly over a count of three.' },
      { fault: 'No blind spot check', cause: 'Relies on mirrors only', remedy: 'Ask what the mirrors cannot show; park next to a cyclist-sized gap to show it.' },
      { fault: 'Pulls up in an unsafe spot', cause: 'Does not look far enough ahead', remedy: 'Ask the pupil to choose the spot and say why it is safe, legal and convenient.' },
    ],
    questions: ['Who might be in your blind spot right now?', 'Where would be a good place to stop up ahead, and why?'],
  },
  {
    id: 'steering',
    title: 'Steering and road position',
    stage: 'foundation',
    summary: 'Pull-push steering, a steady normal position and looking where you want to go.',
    keyPoints: [
      'Pull-push: hands do not cross, one hand pulls down while the other slides up.',
      'Normal position: about 1 metre from the kerb, more on narrow roads with parked cars.',
      'Look well ahead; the car follows the eyes.',
      'Keep both hands on the wheel except when changing gear or using another control.',
    ],
    faults: [
      { fault: 'Weaves in the lane', cause: 'Looking just over the bonnet', remedy: 'Ask the pupil to name something 100 m ahead every few seconds.' },
      { fault: 'Too close to the kerb', cause: 'Unsure where the left wheels are', remedy: 'Stop next to a line and show the pupil where it appears from the seat.' },
    ],
    questions: ['Where were you looking when the car drifted?', 'What is a safe gap from the parked cars here?'],
  },
  {
    id: 'mspsl',
    title: 'MSPSL and LADA routines',
    stage: 'foundation',
    summary: 'The hazard routine used at every junction, bend and change of speed or direction.',
    keyPoints: [
      'MSPSL: Mirrors, Signal, Position, Speed, Look.',
      'Speed is the "S-L" of gears and brakes: brake first, then pick a gear to match the speed.',
      'Look uses LADA: Look, Assess, Decide, Act.',
      'Start the routine early. Late routines are the root of most junction faults.',
      'Signal only if it helps someone, and never too early so it is not misleading.',
    ],
    faults: [
      { fault: 'Signals before checking mirrors', cause: 'Steps in the wrong order', remedy: 'Talk through the routine on approach; then prompt with one word ("Mirrors?").' },
      { fault: 'Brakes and changes gear together', cause: 'Rushing', remedy: 'Separate the two: "brake... now gear". Practice on a long, quiet approach.' },
    ],
    questions: ['Which part of the routine felt rushed?', 'When should you start the routine for this junction?'],
  },
  {
    id: 'junctions-turn',
    title: 'Turning into junctions',
    stage: 'core',
    summary: 'Turning left and right from a major road into a minor road.',
    keyPoints: [
      'Left turn: keep to the left, slow down early, watch for cyclists on the inside and pedestrians crossing.',
      'Right turn: position just left of the centre line, stop at the turning point if there is oncoming traffic.',
      'Rule H2: give way to pedestrians crossing or waiting to cross the road you are turning into.',
      'Do not cut the corner on right turns; aim for the left lane of the new road.',
    ],
    faults: [
      { fault: 'Swings out before a left turn', cause: 'Thinks it gives more room', remedy: 'Show on the whiteboard how it misleads following traffic.' },
      { fault: 'Cuts right corners', cause: 'Turns the wheel too early', remedy: 'Point out the turning point: the centre line of the new road meets your path.' },
    ],
    questions: ['Who has priority if someone is waiting to cross this side road?', 'Where is your turning point for this right turn?'],
  },
  {
    id: 'junctions-emerge',
    title: 'Emerging from junctions',
    stage: 'core',
    summary: 'Leaving a minor road at give way and stop lines, open and closed junctions.',
    keyPoints: [
      'Approach with MSPSL; judge open (good view) or closed (poor view) early.',
      'Give way line: stop only if needed. Stop line: always stop.',
      'Closed junction: "peep and creep" slowly forward to get a view.',
      'Turning right: look right, left, right again; watch for motorcycles and cyclists.',
      'Only go if you would not make anyone slow down or swerve.',
    ],
    faults: [
      { fault: 'Emerges into a gap that is too small', cause: 'Misjudges speed of approaching traffic', remedy: 'Watch traffic together from the line and ask "go or wait?" before deciding.' },
      { fault: 'Stops well behind the line', cause: 'Nervous', remedy: 'Praise the caution, then show how the view improves by creeping.' },
    ],
    questions: ['Is this junction open or closed? How do you know?', 'Was that gap big enough? What would the other driver have done?'],
    scenario: 'tjunction',
  },
  {
    id: 'crossroads',
    title: 'Crossroads',
    stage: 'core',
    summary: 'Marked, unmarked and turning right when another car is opposite.',
    keyPoints: [
      'Unmarked crossroads: nobody has priority. Approach slowly and be ready to stop.',
      'Turning right with an oncoming car also turning right: offside-to-offside is the normal choice; nearside-to-nearside if markings or the layout say so.',
      'Watch the other car for clues about which way it will go.',
    ],
    faults: [
      { fault: 'Treats unmarked crossroads as a straight road', cause: 'Did not spot the junction', remedy: 'Ask the pupil to name clues: gaps in hedges, lamp posts, kerbs.' },
    ],
    questions: ['Who has priority here?', 'Which way will you pass the oncoming car turning right?'],
  },
  {
    id: 'roundabouts',
    title: 'Roundabouts',
    stage: 'core',
    summary: 'Give way to the right, choose the right lane, signal for your exit.',
    keyPoints: [
      'Read the advance sign early and plan the lane.',
      'Left (first exit): signal left on approach, left lane, keep signalling.',
      'Ahead: usually no signal on approach, left lane unless markings say otherwise, signal left after passing the exit before yours.',
      'Right: signal right on approach, right lane, keep right; signal left after passing the exit before yours.',
      'Give way to traffic from the right; watch for cyclists and long vehicles.',
      'Mini roundabouts: same rules, less room. Avoid driving over the centre if you can.',
    ],
    faults: [
      { fault: 'Stops when the way is clear', cause: 'Looks right too late', remedy: 'Start looking right as you approach, not at the line.' },
      { fault: 'Forgets to signal left to exit', cause: 'Overloaded on the roundabout', remedy: 'Count exits out loud; signal as you pass the one before yours.' },
    ],
    questions: ['Which lane do you need for the third exit?', 'When will you signal left?'],
    scenario: 'roundabout',
  },
  {
    id: 'meeting',
    title: 'Meeting traffic',
    stage: 'core',
    summary: 'Narrow roads with parked cars on both sides: plan early, hold back, choose a safe gap.',
    keyPoints: [
      'Look well ahead and spot oncoming vehicles early.',
      'If the obstruction is on your side, be ready to give way. It is not a right of way, so stay flexible.',
      'Hold back in a gap with a clear view, far enough back to drive out without reversing.',
      'Leave about a door\'s width (around 1 metre) when passing parked cars and slow down if you cannot.',
      'Thank and acknowledge others; watch for doors opening, children and pets between cars.',
    ],
    faults: [
      { fault: 'Commits too early and meets a car head-on', cause: 'Looks only at the car in front', remedy: 'Ask "what can you see at the end of the road?" before every set of parked cars.' },
      { fault: 'Stops too close to the parked car', cause: 'Wants to be ready to go', remedy: 'Show that holding back gives a view and room to move out.' },
    ],
    questions: ['Whose side is the obstruction on?', 'Where is the safest place to wait?'],
    scenario: 'meeting',
  },
  {
    id: 'crossings',
    title: 'Pedestrian crossings',
    stage: 'core',
    summary: 'Zebra, pelican, puffin, toucan and equestrian crossings.',
    keyPoints: [
      'Zebra: slow down, be ready to stop for people waiting or on the crossing.',
      'Pelican: flashing amber means give way to anyone still crossing, then go if clear.',
      'Puffin and toucan: no flashing amber; sensors hold the red until people are across.',
      'Never overtake or park on the zigzag lines.',
      'Do not wave pedestrians across; you cannot see other traffic for them.',
    ],
    faults: [
      { fault: 'Late to spot the crossing', cause: 'Planning too short', remedy: 'Ask the pupil to call out every crossing they see.' },
    ],
    questions: ['What type of crossing is ahead?', 'What does flashing amber mean here?'],
  },
  {
    id: 'bends',
    title: 'Bends and hills',
    stage: 'core',
    summary: 'Right speed before the bend, steady through it, gentle power out.',
    keyPoints: [
      'Read limit point: the furthest point you can see the road surface. If it gets closer, slow down.',
      'Brake on the straight before the bend, not in it.',
      'Keep left on right-hand bends; move slightly out on left-hand bends only if it is safe and helps the view.',
      'Uphill: plan gear changes early. Downhill: use a lower gear to hold speed.',
    ],
    faults: [
      { fault: 'Too fast and wide on a bend', cause: 'Did not judge the limit point', remedy: 'Pull up and use a diagram; then talk through the next bend.' },
    ],
    questions: ['What happened to your view as you came into the bend?', 'Where should you have finished braking?'],
  },
  {
    id: 'hazards',
    title: 'Hazard awareness and planning',
    stage: 'core',
    summary: 'Scan, predict, plan. The skill that separates passing from being safe.',
    keyPoints: [
      'Scan near, middle and far; check mirrors every few seconds.',
      'Use commentary driving: pupil says what they see and what they will do.',
      'Two-second rule in the dry, at least four in the wet; much more on ice.',
      'Plan for vulnerable road users: cyclists, horse riders, children, older pedestrians.',
    ],
    faults: [
      { fault: 'Reacts late to hazards', cause: 'Short scanning', remedy: 'Short spells of commentary driving; praise early spotting.' },
    ],
    questions: ['What hazards can you see right now?', 'What might that cyclist do next?'],
  },
  {
    id: 'emergency',
    title: 'Emergency stop',
    stage: 'core',
    summary: 'Stop quickly and under control, then move off safely.',
    keyPoints: [
      'Agree the signal first (a raised hand and "Stop"); check behind before giving it.',
      'React fast, brake firmly and progressively, clutch down just before stopping.',
      'ABS: keep pressing; steer if you need to.',
      'After: handbrake, neutral, then full all-round checks before moving off.',
    ],
    faults: [
      { fault: 'Clutch down too early', cause: 'Fear of stalling', remedy: 'Explain engine braking; a stall is fine in a real emergency.' },
      { fault: 'Moves off without both blind spots', cause: 'Thinks it is over', remedy: 'Remind that the car is now in the middle of the road; check both sides.' },
    ],
    questions: ['Why check behind before we practise this?', 'What will you check before moving off afterwards?'],
  },
  {
    id: 'manoeuvres',
    title: 'Manoeuvres',
    stage: 'advanced',
    summary: 'Parallel park, bay park forwards or in reverse, pull up on the right and reverse.',
    keyPoints: [
      'Slow control: clutch at the bite point, walking pace or slower.',
      'Observation all the way round, before and during; stop if anyone approaches.',
      'Use reference points, but teach the pupil to understand them, not just memorise.',
      'Pull up on the right: move across safely, reverse about two car lengths, rejoin with full checks.',
      'Shunts to correct are allowed; touching the kerb or a line badly is not.',
    ],
    faults: [
      { fault: 'Too fast', cause: 'Lifts the clutch above the bite point', remedy: 'Practise "clutch dance" on a flat, empty road.' },
      { fault: 'Watches only the mirror', cause: 'Focus on accuracy', remedy: 'Agree a pattern: look, move a little, look all round, move again.' },
    ],
    questions: ['What will you do if a car comes while you are reversing?', 'Which reference point will tell you to steer?'],
  },
  {
    id: 'dual',
    title: 'Dual carriageways and faster roads',
    stage: 'advanced',
    summary: 'Joining, lane discipline, overtaking and leaving at higher speed.',
    keyPoints: [
      'Use the slip road to match speed; mirror and blind spot before merging.',
      'Keep left unless overtaking; return when it is safe.',
      'Stopping distance at 70 mph is about 96 m in the dry (Highway Code).',
      'Plan your exit early: signs at one mile and half a mile.',
      'Learners may drive on motorways with an ADI in a dual-controlled car.',
    ],
    faults: [
      { fault: 'Joins too slowly', cause: 'Low confidence', remedy: 'Watch traffic from the slip road on a demo drive; then practise on a long slip road.' },
    ],
    questions: ['How will you match the speed of the traffic?', 'When will you start planning to leave?'],
  },
  {
    id: 'independent',
    title: 'Independent driving',
    stage: 'advanced',
    summary: 'Following a sat nav or road signs for around 20 minutes without step-by-step directions.',
    keyPoints: [
      'Practise with both a sat nav and traffic signs.',
      'Going the wrong way is not a fault if it is done safely.',
      'Pupil makes decisions; instructor stays quiet unless safety needs it.',
    ],
    faults: [
      { fault: 'Panics after a wrong turn', cause: 'Thinks it fails the test', remedy: 'Reassure and practise recovering a route calmly.' },
    ],
    questions: ['How will you find your way if you miss the turn?'],
  },
  {
    id: 'test',
    title: 'Test readiness',
    stage: 'advanced',
    summary: 'Mock tests, show me / tell me questions and reflecting on progress.',
    keyPoints: [
      'Run full mock tests on unfamiliar routes; mark them like an examiner.',
      'Practise show me / tell me questions until the answers are natural.',
      'Use a progress record so the pupil sees what is left to master.',
      'Book the test when the pupil is consistently independent, not when they are close.',
    ],
    faults: [
      { fault: 'Nervous on mock tests', cause: 'Fear of judgement', remedy: 'Talk about what helps them stay calm; build up to full mocks.' },
    ],
    questions: ['On a scale of 1 to 10, how ready do you feel? What would make it a 10?'],
  },
];

export const METHODS = [
  {
    id: 'ccl',
    title: 'Client-centred learning',
    body: 'The pupil helps set the goal, says what they want to work on and rates how confident they feel. You guide; they own the learning. Ask, listen, then adapt.',
    try: 'Start the lesson with: "What would you like to get out of today?"',
  },
  {
    id: 'grow',
    title: 'GROW coaching model',
    body: 'Goal (what do we want?), Reality (where are we now?), Options (what could we try?), Way forward (what will we do?). A simple frame for any briefing or pull-up.',
    try: 'After a fault: "What did you want to happen? What actually happened? What could you do differently?"',
  },
  {
    id: 'levels',
    title: 'Levels of instruction',
    body: 'Instructor-led (full talk-through), prompted (cue words like "mirrors?"), then pupil-led (independent). Agree the level before you start and step back as skill grows.',
    try: 'Say: "I\'ll talk you through the first two, then you lead and I\'ll only prompt if needed."',
  },
  {
    id: 'risk',
    title: 'Sharing responsibility for risk',
    body: 'Tell the pupil how risk is shared on this lesson: what you will control, what they control, and when and how you will step in. Revisit it when the level of help changes.',
    try: 'Say: "You\'re in charge of the car. I\'ll use the dual brake only if we need it, and I\'ll tell you why afterwards."',
  },
  {
    id: 'iar',
    title: 'Identify, analyse, remedy',
    body: 'Name the fault, find the cause (often earlier than the fault), agree a fix. Let the pupil try to analyse first; fill gaps only where needed.',
    try: '"What happened there? Why do you think that was? What will you do next time?"',
  },
  {
    id: 'feedback',
    title: 'Feedback and reflection',
    body: 'Timely, specific and balanced feedback. Safety-critical issues get discussed straight away; small ones can wait. End every lesson with the pupil reflecting on progress.',
    try: '"What went well today? What would you like to work on next time?"',
  },
];

// The 17 Part 3 / standards check competencies (paraphrased from the DVSA report form).
export const COMPETENCIES = [
  { group: 'Lesson planning', items: [
    'Identified the pupil\'s learning goals and needs',
    'Agreed a lesson structure that suits the pupil\'s experience and ability',
    'Chose suitable practice areas',
    'Adapted the lesson plan when needed to help the pupil reach their goals',
  ] },
  { group: 'Risk management', items: [
    'Made sure the pupil understood how responsibility for risk would be shared',
    'Gave clear directions and instructions in good time',
    'Stayed aware of the surroundings and the pupil\'s actions',
    'Made verbal or physical interventions that were timely and appropriate',
    'Gave enough feedback for the pupil to understand any safety-critical incidents',
  ] },
  { group: 'Teaching and learning strategies', items: [
    'Matched teaching style to the pupil\'s learning style and current ability',
    'Encouraged the pupil to analyse problems and take responsibility for learning',
    'Used opportunities and examples to clarify learning outcomes',
    'Gave technical information that was comprehensive, accurate and appropriate',
    'Gave appropriate and timely feedback during the session',
    'Followed up and answered the pupil\'s queries',
    'Kept an appropriate, non-discriminatory manner throughout',
    'Encouraged the pupil to reflect on their own performance at the end',
  ] },
];

export const SCORE_LABELS = ['No evidence', 'Some evidence', 'Most evidence', 'Every competency demonstrated'];

// Highway Code typical stopping distances (dry road, average car).
export const STOPPING = [
  { mph: 20, think: 6, brake: 6 },
  { mph: 30, think: 9, brake: 14 },
  { mph: 40, think: 12, brake: 24 },
  { mph: 50, think: 15, brake: 38 },
  { mph: 60, think: 18, brake: 55 },
  { mph: 70, think: 21, brake: 75 },
];
