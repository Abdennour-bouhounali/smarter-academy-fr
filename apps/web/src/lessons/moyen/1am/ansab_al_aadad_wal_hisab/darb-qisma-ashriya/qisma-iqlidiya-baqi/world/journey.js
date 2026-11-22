/**
 * The student's road through lesson `qisma-iqlidiya-baqi`: its five keys, bound to its practice ladder and its exam
 * levels. What a road is — when the exam space opens, a promotion, « تقدّمي », the next step — is the kit's
 * (`kit/journey.js`).
 */
import { createJourney } from '../../../../../../common/gameworld/kit/journey';
import { KNOWLEDGE_GRAPH } from './knowledge';
import { ladder } from './practice';
import { LEVELS } from './sitting';
import { STORY } from './story';

/** The five rules of the lesson, in the order the story gives them (BINDING: the forges and the board name them). */
export const KEYS = ['majmuaat-kamila', 'baqi-asghar', 'musawat-qisma', 'taqdir-hasil', 'baqi-fi-masala'];

export const journey = createJourney({
  keys: KEYS,
  ladder,
  levels: LEVELS,
  stages: STORY.segments.length,
  cards: KNOWLEDGE_GRAPH.nodes.length,
});
