/**
 * Moteur d'exercices — logique pure, partagée, sans React ni DOM.
 *
 * Exporté en espace de noms (`practice.Rational`) plutôt qu'à plat : le dépôt
 * a déjà `parseDec` / `parseFr` (numberFormat.js) et `compareMathExpressions`
 * (mathComparison.js). Trois façons de lire un nombre à plat dans le même
 * barillet inviterait à prendre la mauvaise ; ici l'espace de noms dit
 * laquelle appartient au moteur d'exercices.
 */
export { Rational, rationalEquals, normalizeNumeric } from './rational.js';
export { affineFromPair, affineFromLatex, parseAffineAnswer, affineEquals, affineToString } from './affineCanonical.js';
export { parseInterval, intervalEquals, intervalToString, isEmptyInterval } from './intervalCompare.js';
export {
  evaluateAnswer, feedbackFor, OUTCOMES, isSuccessOutcome, isInertOutcome, SUPPORTED_ANSWER_TYPES,
} from './answerEvaluator.js';
