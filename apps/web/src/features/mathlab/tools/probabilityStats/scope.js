import { MODES } from './probabilityState.js';
import { CHART_TYPES } from './descriptiveStats.js';

/**
 * Probabilités et statistiques dans les deux ateliers (labScope.js, MATH_LAB.md §2.1).
 *
 * En France, les probabilités et les statistiques sont du COLLÈGE (programme du
 * cycle 4, 2020, et ses repères annuels ; ids du réseau `4e.m2.r01`–`r05`,
 * `3e.m2.r01`–`r06`) :
 *
 *   expériences  pièce, dé, deux dés, nombre au hasard ; la fréquence qui se
 *                stabilise vers la probabilité (`3e.m2.r06`) ;
 *   série        effectifs et fréquences, diagrammes en barres, circulaire,
 *                histogramme (`4e.m2.r01`, `3e.m2.r02`), moyenne (5e), médiane
 *                (`4e.m2.r02`), étendue (`3e.m2.r01`).
 *
 * Ne sont PAS du collège, et restent au lycée : l'arbre de probabilités (les
 * repères de 3e : « la notion d'arbre ne figurant pas au programme » — les
 * expériences à deux épreuves se dénombrent sur un tableau à double entrée),
 * la loi normale, les quartiles, l'écart interquartile, la boîte à moustaches,
 * les effectifs cumulés, la variance et l'écart-type, et le mode (que les
 * textes du collège ne nomment pas). Le programme de 2026 fait entrer quartiles,
 * boîtes à moustaches et effectifs cumulés en 3e à la rentrée 2028
 * (`net/horizon_2028.json`) : ce jour-là, il suffira de les ajouter ici.
 */
export const PROBABILITY_SCOPES = Object.freeze(['moyen', 'secondaire']);

export const PROBABILITY_CAPABILITIES = Object.freeze({
  moyen: Object.freeze({
    descriptionKey: 'tools.probabilityStats.descriptionMoyen',
    sections: Object.freeze(['experiment', 'dataset']),
    charts: Object.freeze(['bars', 'histogram', 'pie']),
    stats: Object.freeze(['count', 'min', 'max', 'range', 'mean', 'median']),
    explanations: Object.freeze(['mean', 'median', 'range']),
  }),
  secondaire: null,
});

/** Tous les indicateurs de la grille, et tous les plis « Comment calcule-t-on les indicateurs ? ». */
const ALL_STATS = Object.freeze(['count', 'min', 'max', 'range', 'mean', 'median', 'mode', 'q1', 'q3', 'iqr', 'variance', 'sd']);
const ALL_EXPLANATIONS = Object.freeze(['mean', 'median', 'mode', 'quartiles', 'range', 'variance', 'sd']);

/** Ce que le laboratoire montre, capacités résolues (`null` = tout). */
export function probabilityFeatures(capabilities) {
  return {
    sections: capabilities?.sections ?? MODES,
    charts: capabilities?.charts ?? CHART_TYPES,
    stats: capabilities?.stats ?? ALL_STATS,
    explanations: capabilities?.explanations ?? ALL_EXPLANATIONS,
  };
}

/**
 * Un état enregistré ramené à ce que le labo montre : une section absente
 * rouvre sur la première, un graphique absent revient au choix automatique
 * (barres ou histogramme, toujours permis). Le reste de l'état est GARDÉ —
 * rien n'est effacé, seulement pas montré.
 */
export function clampToFeatures(data, features) {
  const mode = features.sections.includes(data.mode) ? data.mode : features.sections[0];
  const chart = data.chart === null || features.charts.includes(data.chart) ? data.chart : null;

  return mode === data.mode && chart === data.chart ? data : { ...data, mode, chart };
}
