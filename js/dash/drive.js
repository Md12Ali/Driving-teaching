// Simple car physics (bicycle model) plus joystick and keyboard input.
// Heading h: the car faces (sin h, cos h). Positive steer turns left (towards +x when facing +z).

export const WHEELBASE = 2.6;
export const MAX_STEER = 0.6; // about 34 degrees at the road wheels

export class Vehicle {
  constructor({ x = 0, z = 0, h = 0 } = {}) { this.reset({ x, z, h }); }

  reset({ x, z, h }) {
    Object.assign(this, { x, z, h, v: 0, steer: 0 });
  }

  // input: { throttle: -1..1 (forward/back), steer: -1..1 (left/right) }
  update(dt, input) {
    const target = input.throttle >= 0 ? input.throttle * 7 : input.throttle * 3;
    const braking = Math.sign(target) !== Math.sign(this.v) && Math.abs(this.v) > 0.05;
    const rate = braking || Math.abs(target) < Math.abs(this.v) ? 7 : 3;
    const dv = target - this.v;
    this.v += Math.sign(dv) * Math.min(Math.abs(dv), rate * dt);
    const wantSteer = -input.steer * MAX_STEER; // joystick right = steer right
    const ds = wantSteer - this.steer;
    this.steer += Math.sign(ds) * Math.min(Math.abs(ds), 1.6 * dt);
    this.h += (this.v / WHEELBASE) * Math.tan(this.steer) * dt;
    this.x += Math.sin(this.h) * this.v * dt;
    this.z += Math.cos(this.h) * this.v * dt;
    this.braking = braking || (Math.abs(this.v) < 0.05 && input.throttle === 0);
  }

  get mph() { return Math.abs(this.v) * 2.237; }
}

// On-screen joystick. Returns a live { x, y } in -1..1 (y up = forward).
export function joystick(el) {
  const knob = el.querySelector('.joy-knob');
  const state = { x: 0, y: 0, active: false };
  let id = null, cx = 0, cy = 0, r = 1;
  const move = (e) => {
    let dx = e.clientX - cx, dy = e.clientY - cy;
    const d = Math.hypot(dx, dy);
    if (d > r) { dx *= r / d; dy *= r / d; }
    state.x = dx / r;
    state.y = -dy / r;
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  el.addEventListener('pointerdown', (e) => {
    if (id !== null) return;
    id = e.pointerId;
    el.setPointerCapture(id);
    const b = el.getBoundingClientRect();
    cx = b.left + b.width / 2; cy = b.top + b.height / 2; r = b.width / 2 - 18;
    state.active = true;
    el.classList.add('is-active');
    move(e);
    e.preventDefault();
  });
  el.addEventListener('pointermove', (e) => { if (e.pointerId === id) move(e); });
  const end = (e) => {
    if (e.pointerId !== id) return;
    id = null;
    state.x = state.y = 0;
    state.active = false;
    el.classList.remove('is-active');
    knob.style.transform = '';
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
  return state;
}

// Keyboard: arrows or WASD.
export function keyboard() {
  const keys = new Set();
  const map = { ArrowUp: 'u', KeyW: 'u', ArrowDown: 'd', KeyS: 'd', ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r' };
  addEventListener('keydown', (e) => {
    if (e.target.closest?.('input, select, textarea')) return;
    if (map[e.code]) { keys.add(map[e.code]); e.preventDefault(); }
  });
  addEventListener('keyup', (e) => { if (map[e.code]) keys.delete(map[e.code]); });
  addEventListener('blur', () => keys.clear());
  return {
    get throttle() { return (keys.has('u') ? 1 : 0) - (keys.has('d') ? 1 : 0); },
    get steer() { return (keys.has('r') ? 1 : 0) - (keys.has('l') ? 1 : 0); },
    get any() { return keys.size > 0; },
  };
}
