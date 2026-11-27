/**
 * The student's road through lesson `triangles-semblables`: its two keys, bound to its practice ladder and its exam
 * levels (the five levels of its exercise bank, `sitting.js`). What a road is — when the exam space opens, a
 * promotion, « Ma progression », the next step — is the kit's (`kit/journey.js`).
 */
import { createJourney } from '../../../../../../common/gameworld/kit/journey';
import { KNOWLEDGE_GRAPH } from './knowledge';
import { ladder } from './practice';
import { LEVELS } from './sitting';
import { STORY } from './story';

/**
 * The two rules of the lesson, in the order of the docks (design). The ONE list: the status script reads this line
 * (single-quoted literals); `math.js › K` holds the same ids and `forges.js` quotes each one (journey.test.js).
 */
export const KEYS = ['cotes-proportionnels', 'angles-egaux'];

export const journey = createJourney({
  keys: KEYS,
  ladder,
  levels: LEVELS,
  stages: STORY.stages.length,
  cards: KNOWLEDGE_GRAPH.nodes.length,
});
