import { fillAmbient, reducedMotion } from './effects.js';
import { initBubbles } from './bubbles.js';
import { initBruce } from './bruce.js';

if (!reducedMotion.matches) {
  // Fewer background bubbles on small screens
  fillAmbient(document.querySelector('.ambient'), window.innerWidth < 768 ? 10 : 18);
}

initBubbles();
initBruce();
