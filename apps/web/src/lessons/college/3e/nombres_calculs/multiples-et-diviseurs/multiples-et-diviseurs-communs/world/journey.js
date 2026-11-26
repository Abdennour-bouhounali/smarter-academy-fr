/**
 * The student's road through lesson `multiples-et-diviseurs-communs`: its four keys, bound to its practice ladder and its
 * exam levels (the five levels of its exercise bank, `sitting.js`). What a road is — when the exam space opens, a
 * promotion, « Ma progression », the next step — is the kit's (`kit/journey.js`).
 */
import { createJourney } from '../../../../../../common/gameworld/kit/journey';
import { KNOWLEDGE_GRAPH } from './knowledge';
import { ladder } from './practice';
import { LEVELS } from './sitting';
import { K, STORY } from './story';

/** The four rules of the lesson, in the order the story gives them. */
export const KEYS = [K.pilier, K.facteurs, K.rendezvous, K.equipes];

export const journey = createJourney({
  keys: KEYS,
  ladder,
  levels: LEVELS,
  stages: STORY.segments.length,
  cards: KNOWLEDGE_GRAPH.nodes.length,
});
