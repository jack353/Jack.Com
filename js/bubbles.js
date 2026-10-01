const REFORM_MS = 2600;

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

export function initBubbles({ onSay }) {
  for (const bubble of bubbles) {
    // Links navigate natively (new tab); we just add the pop on top.
    bubble.addEventListener('click', () => {
      pop(bubble);
      if (bubble.dataset.say) onSay(bubble.dataset.say);
    });
  }
}
