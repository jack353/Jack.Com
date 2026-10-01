export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const rand = (min, max) => min + Math.random() * (max - min);

/** Little water droplets that burst outward from (x, y), in viewport px. */
export function splash(x, y, count = 10, spread = 70) {
  if (reducedMotion.matches) return;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const angle = rand(0, Math.PI * 2);
    const dist = rand(spread * 0.4, spread);
    const el = document.createElement('span');
    el.className = 'droplet';
    el.style.cssText = `
      --s:${rand(5, 13).toFixed(1)}px;
      --d:${rand(380, 650).toFixed(0)}ms;
      --x0:${x}px; --y0:${y}px;
      --x1:${(x + Math.cos(angle) * dist).toFixed(1)}px;
      --y1:${(y + Math.sin(angle) * dist - 20).toFixed(1)}px;`;
    el.addEventListener('animationend', () => el.remove(), { once: true });
    frag.append(el);
  }
  document.body.append(frag);
}

/** Background bubbles that rise forever via CSS. */
export function fillAmbient(container, count) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    const d = rand(9, 20);
    el.style.cssText = `
      --x:${rand(0, 100).toFixed(1)}%;
      --s:${rand(4, 16).toFixed(1)}px;
      --d:${d.toFixed(1)}s;
      --delay:${(-rand(0, d)).toFixed(1)}s;
      --sway:${rand(-40, 40).toFixed(0)}px;`;
    frag.append(el);
  }
  container.append(frag);
}

let toastTimer;
export function toast(message) {
  const el = document.querySelector('.toast');
  el.textContent = message;
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), 3200);
}
