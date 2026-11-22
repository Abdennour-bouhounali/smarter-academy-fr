/**
 * The student's road through lesson `bahth-pgcd`: its five keys, bound to its practice ladder and its exam levels (the
 * five levels of its exercise bank, `sitting.js`). What a road is — when the exam space opens, a promotion, « تقدّمي »,
 * the next step — is the kit's (`kit/journey.js`).
 */
import { createJourney } from '../../../../../../common/gameworld/kit/journey';
import { KNOWLEDGE_GRAPH } from './knowledge';
import { ladder } from './practice';
import { LEVELS } from './sitting';
import { STORY } from './story';

/** The five rules of the lesson, in the order the story gives them. */
export const KEYS = ['farq-yabqi', 'khawarizmiyat-al-tarh', 'baqi-yabqi', 'iqlidis', 'aqall-khutuwat'];

export const journey = createJourney({
  keys: KEYS,
  ladder,
  levels: LEVELS,
  stages: STORY.segments.length,
  cards: KNOWLEDGE_GRAPH.nodes.length,
});
