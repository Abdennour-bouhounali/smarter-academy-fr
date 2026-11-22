/**
 * The student's road through lesson `qawasim-adad-tabii`: its four keys, bound to its practice ladder and its exam levels.
 * What a road is — when the exam space opens, a promotion, « تقدّمي », the next step — is the kit's (`kit/journey.js`).
 */
import { createJourney } from '../../../../../../common/gameworld/kit/journey';
import { ladder } from './practice';
import { LEVELS } from './sitting';
import { STORY } from './story';

/** The four rules of the lesson, in the order the story gives them. */
export const KEYS = ['jidaa-aamilayn', 'qasim-rappel', 'tariqa-qawasim', 'qawaid-qisma'];
/** The cards of the lesson's knowledge map (`knowledgeGraph.js`; a test holds the two together). */
export const KNOWLEDGE_CARDS = 11;

export const journey = createJourney({
  keys: KEYS,
  ladder,
  levels: LEVELS,
  stages: STORY.segments.length,
  cards: KNOWLEDGE_CARDS,
});
