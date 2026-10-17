// Car "show me, tell me" vehicle safety questions.
// Questions and "tell me" answers are from GOV.UK (October 2026).
// GOV.UK does not publish answers for "show me" questions: those below are typical demonstrations,
// and the exact switch depends on the car, so practise in your test car.

export const TELL_ME = [
  { id: 't1', q: 'Tell me how you\'d check that the brakes are working before starting a journey.', a: 'Brakes should not feel spongy or slack. Brakes should be tested as you set off. Vehicle should not pull to one side.' },
  { id: 't2', q: 'Tell me where you\'d find the information for the recommended tyre pressures for this car and how tyre pressures should be checked.', a: 'Manufacturer\'s guide, use a reliable pressure gauge, check and adjust pressures when tyres are cold, don\'t forget spare tyre, remember to refit valve caps.' },
  { id: 't3', q: 'Tell me how you make sure your head restraint is correctly adjusted so it provides the best protection in the event of a crash.', a: 'The head restraint should be adjusted so the rigid part of the head restraint is at least as high as the eye or top of the ears, and as close to the back of the head as is comfortable. Note: some restraints might not be adjustable.' },
  { id: 't4', q: 'Tell me how you\'d check the tyres to ensure that they have sufficient tread depth and that their general condition is safe to use on the road.', a: 'No cuts and bulges, 1.6mm of tread depth across the central three-quarters of the breadth of the tyre, and around the entire outer circumference of the tyre.' },
  { id: 't5', q: 'Tell me how you\'d check that the headlights and tail lights are working. You don\'t need to exit the vehicle.', a: 'Explain you\'d operate the switch (turn on ignition if necessary), then walk round vehicle (as this is a "tell me" question, you don\'t need to physically check the lights).' },
  { id: 't6', q: 'Tell me how you\'d know if there was a problem with your anti-lock braking system.', a: 'Warning light should illuminate if there is a fault with the anti-lock braking system.' },
  { id: 't7', q: 'Tell me how you\'d check the direction indicators are working. You don\'t need to exit the vehicle.', a: 'Explain you\'d operate the switch (turn on ignition if necessary), and then walk round vehicle (as this is a "tell me" question, you don\'t need to physically check the lights).' },
  { id: 't8', q: 'Tell me how you\'d check the brake lights are working on this car.', a: 'Explain you\'d operate the brake pedal, make use of reflections in windows or doors, or ask someone to help.' },
  { id: 't9', q: 'Tell me how you\'d check the power-assisted steering is working before starting a journey.', a: 'If the steering becomes heavy, the system may not be working properly. Before starting a journey, 2 simple checks can be made. Gentle pressure on the steering wheel, maintained while the engine is started, should result in a slight but noticeable movement as the system begins to operate. Alternatively turning the steering wheel just after moving off will give an immediate indication that the power assistance is functioning.' },
  { id: 't10', q: 'Tell me how you\'d switch on the rear fog light(s) and explain when you\'d use it/them. You don\'t need to exit the vehicle.', a: 'Operate switch (turn on dipped headlights and ignition if necessary). Check warning light is on. Explain use.', note: 'Explain use: only when visibility is seriously reduced, generally less than 100 metres, and switch off when it improves.' },
  { id: 't11', q: 'Tell me how you switch your headlight from dipped to main beam and explain how you\'d know the main beam is on.', a: 'Operate switch (with ignition or engine on if necessary), check with main beam warning light.' },
  { id: 't12', q: 'Open the bonnet and tell me how you\'d check that the engine has sufficient oil.', a: 'Identify dipstick/oil level indicator, describe check of oil level against the minimum and maximum markers.', bonnet: true },
  { id: 't13', q: 'Open the bonnet and tell me how you\'d check that the engine has sufficient engine coolant.', a: 'Identify high and low level markings on header tank where fitted or radiator filler cap, and describe how to top up to correct level.', bonnet: true },
  { id: 't14', q: 'Open the bonnet and tell me how you\'d check that you have a safe level of hydraulic brake fluid.', a: 'Identify reservoir, check level against high and low markings.', bonnet: true },
];

export const SHOW_ME = [
  { id: 's1', q: 'When it\'s safe to do so, can you show me how you wash and clean the rear windscreen?', a: 'On a safe, straight section: operate the rear washer and wiper control briefly (often pushing the wiper stalk forward or a button on its end), then switch it off. Keep eyes on the road and the other hand on the wheel.' },
  { id: 's2', q: 'When it\'s safe to do so, can you show me how you wash and clean the front windscreen?', a: 'Pull the wiper stalk towards you to spray the washer and wipe the front screen, then release it. Keep looking ahead.' },
  { id: 's3', q: 'When it\'s safe to do so, can you show me how you\'d switch on your dipped headlights?', a: 'Turn the light switch (on the stalk or dashboard) to the dipped headlight position and check the green headlight warning light. Then switch back if they are not needed.' },
  { id: 's4', q: 'When it\'s safe to do so, can you show me how you\'d set the rear demister?', a: 'Press the rear demister button (rectangle with wavy arrows) and check its warning light comes on. Switch it off again.' },
  { id: 's5', q: 'When it\'s safe to do so, can you show me how you\'d operate the horn?', a: 'Press the horn briefly, only when safe and not in a built-up area between 11:30pm and 7am, or while stationary unless a moving vehicle poses a danger.' },
  { id: 's6', q: 'When it\'s safe to do so, can you show me how you\'d demist the front windscreen?', a: 'Set the fan to the windscreen setting and turn the fan up (air conditioning helps), or press the front demist button. Switch off or reset afterwards.' },
  { id: 's7', q: 'When it\'s safe to do so, can you show me how you\'d open and close the side window?', a: 'Use the window switch to open the window a little, then close it, with brief glances only. Keep control of the steering.' },
];

export const SHOW_TELL_INFO = [
  'You\'ll be asked 1 "tell me" question at the start of the test, before you start driving, and 1 "show me" question while you\'re driving.',
  'You\'ll get 1 driving fault if you get either question wrong.',
  'You\'ll fail if your driving is dangerous or potentially dangerous while you answer a "show me" question.',
];
