import { ANALYSIS_KINDS } from './vectorState.js';
import { EXPERIMENTS } from './experiments.js';

/**
 * Le labo des vecteurs dans les deux labos — `moyen` (collège) et `secondaire` (lycée) (labScope.js, MATH_LAB.md §2.1).
 *
 * Au collège : le repère, les coordonnées d'un point et d'un
 * vecteur, la distance entre deux points, la somme de deux vecteurs (bout à bout,
 * parallélogramme), le vecteur opposé et la translation. Le produit d'un vecteur par un
 * réel (k·u), la colinéarité qui s'écrit v = k·u, l'alignement de trois
 * points par les vecteurs et le produit scalaire sont du lycée. Au lycée : tout.
 */
export const VECTORS_SCOPES = Object.freeze(['moyen', 'secondaire']);

export const VECTORS_CAPABILITIES = Object.freeze({
  moyen: Object.freeze({
    descriptionKey: 'tools.vectors.descriptionMoyen',
    scale: false,
    factor: false,
    analysis: Object.freeze(['none']),
    experiments: Object.freeze(['addition', 'parallelogram', 'subtraction', 'translation', 'shape', 'midpoint']),
  }),
  secondaire: null,
});

/** Ce que le laboratoire montre, capacités résolues (`null` = tout). */
export function vectorsFeatures(capabilities) {
  const experimentIds = capabilities?.experiments ?? null;

  return {
    scale: capabilities?.scale !== false,
    factor: capabilities?.factor !== false,
    analysis: capabilities?.analysis ?? ANALYSIS_KINDS,
    experiments: experimentIds ? EXPERIMENTS.filter((entry) => experimentIds.includes(entry.id)) : EXPERIMENTS,
  };
}

/** Une analyse que le labo ne propose pas revient à « Aucune » ; le reste est gardé. */
export function clampToFeatures(data, features) {
  if (features.analysis.includes(data.settings?.analysis)) return data;

  return { ...data, settings: { ...data.settings, analysis: 'none' } };
}
