import { ANALYSIS_KINDS } from './vectorState.js';
import { EXPERIMENTS } from './experiments.js';

/**
 * Le labo des vecteurs — l’atelier du LYCÉE seulement (labScope.js, MATH_LAB.md §2.1).
 *
 * En France, le programme du collège en vigueur (cycle 4, 2020) ne définit pas
 * le vecteur : la translation y est une transformation (`4e.m4.r07`,
 * `4e.m3.r06`), et les repères de 4e disent qu'elle « pourra être nommée
 * “translation de vecteur AB” mais aucune connaissance n’est attendue sur
 * l’objet “vecteur” ». Décision du propriétaire
 * (2026-11-23) : l'instrument est du lycée, caché tant que le côté lycée l'est
 * (labConfig.js). Il garde toutes ses capacités.
 *
 * La restriction qu'il avait au collège en Algérie (pas de k·u, pas de
 * facteur v = k·u, pas d'analyse) est retirée avec ce collège ; le mécanisme
 * (`vectorsFeatures`, `clampToFeatures`) reste, testé sur une restriction
 * écrite dans le test. Le programme de 2026 fait entrer vecteurs, somme et
 * relation de Chasles en 3e à la rentrée 2028 (`net/horizon_2028.json`).
 */
export const VECTORS_SCOPES = Object.freeze(['secondaire']);

export const VECTORS_CAPABILITIES = Object.freeze({ secondaire: null });

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
