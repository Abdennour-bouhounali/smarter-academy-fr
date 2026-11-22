/**
 * The student's road through lesson `qasim-adad-tabii`: its four keys, bound to its practice ladder and its exam levels.
 * What a road is — when the exam space opens, a promotion, « تقدّمي », the next step — is the kit's (`kit/journey.js`).
 */
import { createJourney } from '../../../../../../common/gameworld/kit/journey';
import { SEGMENTS } from '../../../../../../common/gameworld/divisorIsles/logic';
import { ladder } from './practice';
import { LEVELS } from './sitting';

/** The four rules of the lesson, in the order the story gives them. */
export const KEYS = ['qasim-baqi', 'qasim-jidaa', 'siyagh-mutakafia', 'wahid-wa-nafsuh'];
/** The cards of the lesson's knowledge map (`knowledgeGraph.js`; a test holds the two together). */
export const KNOWLEDGE_CARDS = 13;

export const journey = createJourney({
  keys: KEYS,
  ladder,
  levels: LEVELS,
  stages: SEGMENTS.length,
  cards: KNOWLEDGE_CARDS,
});
