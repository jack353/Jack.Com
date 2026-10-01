import { reducedMotion } from './effects.js';

const REFORM_MS = 2600;
// Long enough to see the splat, short enough that browsers still treat
// the new tab as a response to the click (and don't block it).
const NAVIGATE_DELAY_MS = 300;

export const bubbles = [...document.querySelectorAll('.bubble')];

export function orbCenter(bubble) {
  const r = bubble.querySelector('.bubble__orb').getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r.width / 2 };
}

export function isPopped(bubble) {
  return bubble.classList.contains('is-popped');
}

export function pop(bubble) {
  if (isPopped(bubble)) return;
  bubble.classList.remove('is-reforming');
  bubble.classList.add('is-popped');

  clearTimeout(bubble._reform);
  bubble._reform = setTimeout(() => {
    bubble.classList.remove('is-popped');
    bubble.classList.add('is-reforming');
    bubble.addEventListener('animationend', () => bubble.classList.remove('is-reforming'), { once: true });
  }, REFORM_MS);
}

function openAfterPop(bubble) {
  if (bubble._opening) return; // a double-click shouldn't open two tabs
  bubble._opening = true;
  const url = bubble.href;
  setTimeout(() => {
    bubble._opening = false;
    const tab = window.open(url, '_blank');
    if (tab) tab.opener = null;
    else window.location.href = url; // popup blocked: open here instead
  }, NAVIGATE_DELAY_MS);
}

export function initBubbles({ onSay }) {
  for (const bubble of bubbles) {
    bubble.addEventListener('click', (e) => {
      // Ctrl/Cmd/Shift/middle clicks keep the browser's normal behaviour
      const modified = e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0;
      if (bubble.href && !modified && !reducedMotion.matches) {
        e.preventDefault();
        openAfterPop(bubble);
      }
      pop(bubble);
      if (bubble.dataset.say) onSay(bubble.dataset.say);
    });
  }
}
