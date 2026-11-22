/**
 * The student's road through lesson `jidhr-tarbii`: its three keys, bound to its practice ladder and its exam levels.
 * What a road is — when the exam space opens, a promotion, « تقدّمي », the next step — is the kit's (`kit/journey.js`).
 */
import { createJourney } from '../../../../../../common/gameworld/kit/journey';
import { KNOWLEDGE_GRAPH } from './knowledge';
import { ladder } from './practice';
import { LEVELS } from './sitting';
import { STORY } from './story';

/**
 * The three rules of the lesson, in the order the story gives them — 🔑 ✍️ 🔁. The ONE list: `tablets.js` re-exports
 * it, and the status script reads this line (single-quoted literals). `forges.js` holds the same ids as literals too
 * (the script finds each one quoted there): journey.test.js checks the two agree.
 */
export const KEYS = ['dil-as-saha', 'qima-madbuta', 'dhahab-wa-iyab'];

export const journey = createJourney({
  keys: KEYS,
  ladder,
  levels: LEVELS,
  stages: STORY.terraces.length,
  cards: KNOWLEDGE_GRAPH.nodes.length,
});
