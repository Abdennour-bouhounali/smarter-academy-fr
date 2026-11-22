import { FIRST_RUN_EXPRESSION, FUNCTION_PRESETS } from './grapherState.js';

/**
 * راسم الدوال dans les deux مخابر (labScope.js, MATH_LAB.md §2.1).
 *
 * UN grapheur. Au collège, le programme s'arrête aux fonctions LINÉAIRES et
 * AFFINES (4AM 3.7–3.9) et à leur représentation graphique : pas de
 * tangente ni de dérivée, pas de sin, ln ou exp. Le mode « المماس », les
 * exemples transcendants et les touches correspondantes du clavier virtuel
 * n'existent donc pas dans مخبر المتوسط. Au lycée : tout.
 *
 * Ce qu'un élève TAPE reste lu tel quel — le parseur est celui de la
 * plateforme ; on ne propose simplement pas ce qui dépasse son مخبر.
 */
export const GRAPHER_SCOPES = Object.freeze(['moyen', 'secondaire']);

/** Les exemples du collège : des droites — linéaire, affine, décroissante, constante. */
export const MOYEN_PRESETS = Object.freeze([
  { expression: 'x', latex: 'x' },
  { expression: '2x', latex: '2x' },
  { expression: '2x+1', latex: '2x+1' },
  { expression: '-x+3', latex: '-x+3' },
  { expression: '\\frac{1}{2}x-1', latex: '\\frac{1}{2}x-1' },
  { expression: '3', latex: '3' },
]);

export const GRAPHER_CAPABILITIES = Object.freeze({
  moyen: Object.freeze({
    descriptionKey: 'tools.functionGrapher.descriptionMoyen',
    tangent: false,
    presets: MOYEN_PRESETS,
    keyboard: 'moyen',
    firstExpression: '2x+1',
  }),
  secondaire: null,
});

/** Ce que le grapheur montre, capacités résolues (`null` = tout). */
export function grapherFeatures(capabilities) {
  return {
    tangent: capabilities?.tangent !== false,
    presets: capabilities?.presets ?? FUNCTION_PRESETS,
    keyboard: capabilities?.keyboard ?? 'full',
    firstExpression: capabilities?.firstExpression ?? FIRST_RUN_EXPRESSION,
  };
}
