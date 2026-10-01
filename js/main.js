import { initBubbles } from './bubbles.js';
import { initBruce } from './bruce.js';

const bruce = initBruce();
initBubbles({ onSay: bruce.say });
