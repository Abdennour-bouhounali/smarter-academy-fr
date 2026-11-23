/**
 * The student's road through lesson `decomposer-en-facteurs-premiers`: its four keys, bound to its practice ladder and
 * its exam levels (the five levels of its exercise bank, `sitting.js`). What a road is — when the exam space opens, a
 * promotion, « Ma progression », the next step — is the kit's (`kit/journey.js`).
 */
import { createJourney } from '../../../../../../common/gameworld/kit/journey';
import { KNOWLEDGE_GRAPH } from './knowledge';
import { ladder } from './practice';
import { LEVELS } from './sitting';
import { K, STORY } from './story';

/** The four rules of the lesson, in the order the story gives them. */
export const KEYS = [K.ladder, K.powers, K.stop, K.tool];

export const journey = createJourney({
  keys: KEYS,
  ladder,
  levels: LEVELS,
  stages: STORY.segments.length,
  cards: KNOWLEDGE_GRAPH.nodes.length,
});
