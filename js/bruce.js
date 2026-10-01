import { reducedMotion, splash } from './effects.js';
import { bubbles, orbCenter, pop, isPopped } from './bubbles.js';

const FRAMES = {
  closed: 'assets/img/bruce.webp',
  chomp: 'assets/img/bruce-chomp.webp',
};

// Where his mouth sits in the (left-facing) frame, as a fraction of size.
const MOUTH = { x: 0.15, y: 0.44 };

const CURSOR_IDLE_MS = 3000;
const FRENZY_TIMEOUT_MS = 9000;

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const rand = (min, max) => min + Math.random() * (max - min);
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
// Frame-rate independent smoothing toward a target value
const approach = (cur, target, rate, dt) => cur + (target - cur) * (1 - Math.exp(-rate * dt));

export function initBruce() {
  const el = document.getElementById('bruce');
  const img = el.querySelector('.bruce__img');
  const hint = document.querySelector('.hint');
  new Image().src = FRAMES.chomp; // warm the cache so the first bite doesn't flicker

  let w, h, vw, vh;
  const pos = { x: 0, y: 0 };
  const vel = { x: 0, y: 0 };
  let flip = 1; // 1 = facing left (native art), -1 = facing right; eases through 0 when turning
  let tilt = 0;
  let punch = 0; // extra scale that decays after a bite
  let frame = 'closed';

  // Behaviour
  let mode = 'wander'; // wander | chase | retreat | frenzy
  let modeUntil = 0;
  let wanderTarget = null;
  let wanderUntil = 0;
  let food = null; // touch-tap target on phones
  let frenzyQueue = [];
  let cooldownUntil = 0;

  const pointer = { x: 0, y: 0, t: -Infinity, overLink: false };

  function measure() {
    vw = document.documentElement.clientWidth;
    vh = window.innerHeight;
    w = el.offsetWidth;
    h = el.offsetHeight;
  }

  function setFrame(name) {
    if (frame === name) return;
    frame = name;
    img.src = FRAMES[name];
  }

  const facingSign = () => (flip >= 0 ? 1 : -1);

  function mouth() {
    return {
      x: pos.x - flip * (0.5 - MOUTH.x) * w,
      y: pos.y + (MOUTH.y - 0.5) * h,
    };
  }

  /** Steer so his *mouth* arrives at (tx, ty). */
  function seek(tx, ty, maxSpeed, accel, dt, arrive = w) {
    const m = mouth();
    const dx = tx - m.x;
    const dy = ty - m.y;
    const d = Math.hypot(dx, dy) || 1;
    const speed = maxSpeed * Math.min(1, d / arrive);
    let sx = (dx / d) * speed - vel.x;
    let sy = (dy / d) * speed - vel.y;
    const s = Math.hypot(sx, sy);
    const maxStep = accel * dt;
    if (s > maxStep) {
      sx = (sx / s) * maxStep;
      sy = (sy / s) * maxStep;
    }
    vel.x += sx;
    vel.y += sy;
    return d;
  }

  function pickWanderTarget(now) {
    const top = Math.min(vh * 0.35, vh - h);
    wanderTarget = {
      x: rand(w * 0.6, Math.max(w * 0.6, vw - w * 0.6)),
      y: rand(top, Math.max(top, vh - h * 0.55)),
    };
    wanderUntil = now + rand(3500, 7000);
  }

  function bite(now, x, y) {
    setFrame('closed');
    punch = 0.14;
    splash(x, y, 9, w * 0.3);
    cooldownUntil = now + 1400;
    mode = 'retreat';
    modeUntil = now + 1100;
  }

  function startFrenzy(now) {
    if (mode === 'frenzy') return;
    hint?.classList.add('is-hidden');
    mode = 'frenzy';
    el.classList.add('is-frenzy');
    modeUntil = now + FRENZY_TIMEOUT_MS;
    food = null;
    setFrame('chomp');

    // Visit the bubbles nearest-first so he doesn't zig-zag across the screen
    const remaining = bubbles.filter((b) => !isPopped(b));
    frenzyQueue = [];
    let from = mouth();
    while (remaining.length) {
      remaining.sort((a, b) => {
        const ca = orbCenter(a), cb = orbCenter(b);
        return dist(from.x, from.y, ca.x, ca.y) - dist(from.x, from.y, cb.x, cb.y);
      });
      const next = remaining.shift();
      frenzyQueue.push(next);
      from = orbCenter(next);
    }
  }

  function endFrenzy(now) {
    el.classList.remove('is-frenzy');
    setFrame('closed');
    mode = 'wander';
    pickWanderTarget(now);
    cooldownUntil = now + 1500;
  }

  // ---------- Input ----------
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.t = performance.now();
    pointer.overLink = !!e.target.closest?.('.bubble');
  }, { passive: true });

  document.documentElement.addEventListener('mouseleave', () => {
    pointer.t = -Infinity;
  });

  // On touch screens a tap on open water drops "food" for him to chase
  window.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch') return;
    if (e.target.closest('.bubble, .bruce')) return;
    if (mode === 'frenzy') return;
    food = { x: e.clientX, y: e.clientY, until: performance.now() + 4000 };
  }, { passive: true });

  el.addEventListener('click', () => {
    if (reducedMotion.matches) return calmFrenzy();
    startFrenzy(performance.now());
  });

  // ---------- Reduced motion: he stays put, but the joke still lands ----------
  function placeStatic() {
    measure();
    pos.x = vw - w * 0.6;
    pos.y = vh - h * 0.55;
    flip = 1;
    render(0);
  }

  function calmFrenzy() {
    hint?.classList.add('is-hidden');
    setFrame('chomp');
    bubbles.forEach((b, i) => setTimeout(() => pop(b), i * 150));
    setTimeout(() => setFrame('closed'), 900);
  }

  // ---------- Loop ----------
  function update(now, dt) {
    const sizeK = w / 250; // speeds scale with how big he's drawn
    const m = mouth();
    const cursorActive = now - pointer.t < CURSOR_IDLE_MS;

    if (food && now > food.until) food = null;

    if (mode === 'retreat' && now > modeUntil) mode = 'wander';
    if (mode === 'frenzy' && now > modeUntil) endFrenzy(now);
    if (mode === 'wander' || mode === 'chase') {
      mode = (cursorActive || food) && now > cooldownUntil ? 'chase' : 'wander';
    }

    let wantMouthOpen = false;

    switch (mode) {
      case 'wander': {
        if (!wanderTarget || now > wanderUntil || dist(m.x, m.y, wanderTarget.x, wanderTarget.y) < w * 0.3) {
          pickWanderTarget(now);
        }
        seek(wanderTarget.x, wanderTarget.y, 120 * sizeK, 140 * sizeK, dt, w * 1.2);
        break;
      }

      case 'chase': {
        const target = food ?? pointer;
        if (!food && pointer.overLink) {
          // Polite: hover near links instead of eating the thing you're clicking
          const cx = pos.x - pointer.x;
          const cy = pos.y - pointer.y;
          const d = Math.hypot(cx, cy) || 1;
          seek(pointer.x + (cx / d) * w, pointer.y + (cy / d) * w * 0.6, 260 * sizeK, 500 * sizeK, dt, w * 0.6);
          break;
        }
        const d = seek(target.x, target.y, 380 * sizeK, 700 * sizeK, dt, w * 0.35);
        wantMouthOpen = d < w * 0.8;
        if (d < w * 0.14) {
          bite(now, target.x, target.y);
          food = null;
        }
        break;
      }

      case 'retreat': {
        // Dart away from where he just bit, then calm down
        const away = Math.sign(pos.x - pointer.x) || -facingSign();
        seek(clamp(pos.x + away * w * 2, w * 0.5, vw - w * 0.5), pos.y + rand(-20, 20), 300 * sizeK, 900 * sizeK, dt, w);
        break;
      }

      case 'frenzy': {
        wantMouthOpen = true;
        while (frenzyQueue.length && isPopped(frenzyQueue[0])) frenzyQueue.shift();
        const next = frenzyQueue[0];
        if (!next) {
          endFrenzy(now);
          break;
        }
        const c = orbCenter(next);
        const d = seek(c.x, c.y, 900 * sizeK, 2600 * sizeK, dt, w * 0.25);
        if (d < c.r * 0.6) {
          pop(next);
          punch = 0.1;
          frenzyQueue.shift();
        }
        break;
      }
    }

    if (mode !== 'frenzy') setFrame(wantMouthOpen ? 'chomp' : 'closed');

    // Integrate
    pos.x += vel.x * dt;
    pos.y += vel.y * dt;

    // Keep at least part of him on screen
    pos.x = clamp(pos.x, -w * 0.3, vw + w * 0.3);
    pos.y = clamp(pos.y, h * 0.2, vh + h * 0.1);

    // Turn to face where he's swimming (with hysteresis so he doesn't flicker)
    const turnSpeed = 18 * sizeK;
    let facing = facingSign();
    if (vel.x > turnSpeed) facing = -1;
    else if (vel.x < -turnSpeed) facing = 1;
    flip = approach(flip, facing, 9, dt);

    // Nose follows vertical motion
    const pitch = -Math.atan2(vel.y, Math.abs(vel.x) + 40 * sizeK) * (180 / Math.PI);
    tilt = approach(tilt, clamp(pitch * 0.55, -28, 28), 6, dt);

    punch = approach(punch, 0, 7, dt);
  }

  function render(now) {
    const bob = reducedMotion.matches ? 0 : Math.sin(now / 380) * h * 0.02;
    const t = tilt * Math.sign(flip || 1);
    el.style.transform =
      `translate3d(${(pos.x - w / 2).toFixed(1)}px, ${(pos.y - h / 2 + bob).toFixed(1)}px, 0) ` +
      `rotate(${t.toFixed(2)}deg) scale(${(1 + punch).toFixed(3)})`;
    img.style.transform = `scaleX(${flip.toFixed(3)})`;
  }

  let last = performance.now();
  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000); // clamp after tab switches
    last = now;
    if (!reducedMotion.matches) {
      update(now, dt);
      render(now);
    }
    requestAnimationFrame(tick);
  }

  // ---------- Start ----------
  measure();
  window.addEventListener('resize', () => {
    measure();
    if (reducedMotion.matches) placeStatic();
    wanderTarget = null;
  });
  reducedMotion.addEventListener('change', () => (reducedMotion.matches ? placeStatic() : null));

  if (reducedMotion.matches) {
    placeStatic();
  } else {
    // Swim in from off-screen right
    pos.x = vw + w * 0.3;
    pos.y = vh * 0.7;
    vel.x = -200 * (w / 250);
    render(last);
  }
  el.classList.add('is-ready');
  requestAnimationFrame(tick);
}
