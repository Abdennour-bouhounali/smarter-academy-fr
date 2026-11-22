import { AREAS, IMPLICATION_FORMS, MAX_PRACTICE_LEVEL } from './logicState.js';
import { CHALLENGE_KINDS, kindsForLevel } from './practice.js';

/**
 * مختبر المنطق والبرهان dans les deux مخابر (labScope.js, MATH_LAB.md §2.1).
 *
 * Au collège : une عبارة vraie, fausse ou qui dépend de x ; la propriété et
 * sa RÉCIPROQUE (« الخاصية العكسية » — Pythagore et Thalès, 4AM 4.1) ; le
 * contre-exemple ; les erreurs de raisonnement. Les connecteurs et leurs
 * tables, l'équivalence, nécessaire/suffisant, les quantificateurs et leur
 * négation, la contraposée et l'inverse, l'implication comme inclusion
 * d'ensembles, la construction de preuves (contraposée, absurde, cas) et la
 * récurrence sont du lycée. Au lycée : tout.
 */
export const LOGIC_SCOPES = Object.freeze(['moyen', 'secondaire']);

export const LOGIC_CAPABILITIES = Object.freeze({
  moyen: Object.freeze({
    descriptionKey: 'tools.logic.descriptionMoyen',
    areas: Object.freeze(['statements', 'implication', 'counterexample', 'fallacy']),
    implicationForms: Object.freeze(['direct', 'converse']),
    implicationSets: false,
    implicationTable: false,
    practiceKinds: Object.freeze(['trueOrFalse', 'counterexample', 'implicationVerdict', 'converse', 'fallacy']),
    practiceLevels: 3,
  }),
  secondaire: null,
});

/** Ce que le laboratoire montre, capacités résolues (`null` = tout). */
export function logicFeatures(capabilities) {
  const practiceKinds = capabilities?.practiceKinds ?? CHALLENGE_KINDS;

  return {
    areas: capabilities?.areas ? AREAS.filter((area) => capabilities.areas.includes(area)) : AREAS,
    implicationForms: capabilities?.implicationForms ?? IMPLICATION_FORMS,
    implicationSets: capabilities?.implicationSets !== false,
    implicationTable: capabilities?.implicationTable !== false,
    practiceKinds,
    practiceLevels: Math.min(MAX_PRACTICE_LEVEL, capabilities?.practiceLevels ?? MAX_PRACTICE_LEVEL),
  };
}

/**
 * Les familles d'exercices d'un niveau, dans ce مخبر. Un niveau dont aucune
 * famille n'est du مخبر retombe sur toutes celles du مخبر : jamais de liste
 * vide, jamais une question du lycée au collège.
 */
export function practiceKindsFor(level, features) {
  const kinds = kindsForLevel(level).filter((kind) => features.practiceKinds.includes(kind));

  return kinds.length ? kinds : features.practiceKinds;
}

/** Un état ramené à ce que le مخبر montre : l'aire, la forme, le niveau. Le reste est gardé. */
export function clampToFeatures(data, features) {
  let next = data;
  if (!features.areas.includes(next.area)) next = { ...next, area: features.areas.includes('counterexample') ? 'counterexample' : features.areas[0] };
  if (!features.implicationForms.includes(next.implication?.form)) {
    next = { ...next, implication: { ...next.implication, form: features.implicationForms[0] } };
  }
  if (next.practice?.level > features.practiceLevels) next = { ...next, practice: { ...next.practice, level: features.practiceLevels } };

  return next;
}
