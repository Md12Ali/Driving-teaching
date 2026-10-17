// Car (category B) driving test report categories, in the order they appear on the
// examiner's report. Based on the DVSA guidance for driving examiners (DT1), October 2026.
// Use for mock tests. This is a practice sheet, not an official form.

export const REPORT = [
  { id: 'eyesight', label: 'Eyesight' },
  { id: 'rev-right', label: 'Reverse right (pull up on the right)', subs: ['Control', 'Observation'] },
  { id: 'rev-park', label: 'Reverse park', subs: ['Control (road)', 'Observation (road)', 'Control (car park)', 'Observation (car park)'] },
  { id: 'fwd-park', label: 'Forward park', subs: ['Control', 'Observation'] },
  { id: 'vehicle-checks', label: 'Vehicle checks (show me, tell me)' },
  { id: 'controlled-stop', label: 'Controlled stop', subs: ['Promptness', 'Control'] },
  { id: 'control', label: 'Control', subs: ['Accelerator', 'Clutch', 'Gears', 'Footbrake', 'Parking brake', 'Steering'] },
  { id: 'precautions', label: 'Precautions' },
  { id: 'ancillary', label: 'Ancillary controls' },
  { id: 'move-off', label: 'Move off', subs: ['Safety', 'Control'] },
  { id: 'mirrors', label: 'Use of mirrors', subs: ['Signalling', 'Change direction', 'Change speed'] },
  { id: 'signals', label: 'Signals', subs: ['Necessary', 'Correctly', 'Timed'] },
  { id: 'clearance', label: 'Clearance to obstructions' },
  { id: 'response', label: 'Response to signs and signals', subs: ['Traffic signs', 'Road markings', 'Traffic lights', 'Traffic controllers', 'Other road users'] },
  { id: 'speed', label: 'Use of speed' },
  { id: 'following', label: 'Following distance' },
  { id: 'progress', label: 'Progress', subs: ['Appropriate speed', 'Undue hesitation'] },
  { id: 'junctions', label: 'Junctions', subs: ['Approach speed', 'Observation', 'Turning right', 'Turning left', 'Cutting corners'] },
  { id: 'judgement', label: 'Judgement', subs: ['Overtaking', 'Meeting', 'Crossing'] },
  { id: 'positioning', label: 'Positioning', subs: ['Normal driving', 'Lane discipline'] },
  { id: 'crossings', label: 'Pedestrian crossings' },
  { id: 'stops', label: 'Position / normal stops' },
  { id: 'awareness', label: 'Awareness and planning' },
];

// Flat list of markable rows: { key, group, label }
export const ROWS = REPORT.flatMap((g) => (g.subs
  ? g.subs.map((s, i) => ({ key: `${g.id}.${i}`, group: g.label, label: s }))
  : [{ key: g.id, group: g.label, label: '' }]));

export const PASS_MAX_DRIVING = 15;

export const FAULT_TYPES = [
  { key: 'd', label: 'Driving fault', short: 'D', desc: 'Not potentially dangerous, but repeating it could make it serious. Also called a minor.' },
  { key: 's', label: 'Serious fault', short: 'S', desc: 'Something potentially dangerous. One means a fail.' },
  { key: 'x', label: 'Dangerous fault', short: 'X', desc: 'Actual danger to you, the examiner, the public or property. One means a fail.' },
];

export const MANOEUVRE_OPTIONS = ['Parallel park', 'Reverse bay park', 'Forward bay park', 'Pull up on the right', 'Not done'];
