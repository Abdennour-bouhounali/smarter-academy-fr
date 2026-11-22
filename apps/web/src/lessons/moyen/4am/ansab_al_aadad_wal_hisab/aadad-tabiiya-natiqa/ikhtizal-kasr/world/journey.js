/**
 * The student's road through lesson `ikhtizal-kasr`: its four keys, bound to its practice ladder and its exam levels
 * (the five levels of its exercise bank, `sitting.js`). What a road is — when the exam space opens, a promotion,
 * « تقدّمي », the next step — is the kit's (`kit/journey.js`).
 */
import { createJourney } from '../../../../../../common/gameworld/kit/journey';
import { KNOWLEDGE_GRAPH } from './knowledge';
import { ladder } from './practice';
import { LEVELS } from './sitting';
import { STORY } from './story';

/**
 * The four rules of the lesson, in the order the story gives them: 🪜 🔒 🎯 🧾 — written as literals: the status script
 * (`scripts/lesson-v2-status.mjs`, S2) reads them from this line; `journey.test.js` checks them against `story.js › K`.
 */
export const KEYS = ['ikhtizal-marahil', 'ghayr-qabil', 'ikhtizal-pgcd', 'natija-mukhtazala'];

export const journey = createJourney({
  keys: KEYS,
  ladder,
  levels: LEVELS,
  stages: STORY.segments.length,
  cards: KNOWLEDGE_GRAPH.nodes.length,
});
