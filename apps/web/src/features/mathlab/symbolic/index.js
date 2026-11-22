/**
 * Le MOTEUR SYMBOLIQUE de la plateforme — point d'entrée unique.
 *
 * Tout ce qui a besoin de calcul formel importe d'ICI, jamais `nerdamer`
 * directement. Le laboratoire d'analyse s'en sert aujourd'hui pour les
 * LIMITES ; les dérivées, la simplification, la factorisation, la résolution
 * d'équations et l'équivalence algébrique sont déjà exposées et attendent
 * leurs appelants.
 *
 * Voir `symbolicEngine.js` pour les trois raisons qui imposent une façade
 * (le moteur peut ne pas rendre la main, il répond parfois par la question,
 * et ses conventions ne sont pas celles du programme algérien).
 */

export {
  ensureEngine,
  isEngineReady,
  resetQuarantine,
  limitOf,
  verifiedLimitAtInfinity,
  derivativeOf,
  simplifyExpression,
  factorExpression,
  expandExpression,
  solveEquation,
  areEquivalent,
  antiderivativeOf,
} from './symbolicEngine.js';

