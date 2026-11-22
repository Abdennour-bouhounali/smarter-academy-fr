import { MODES } from './probabilityState.js';
import { CHART_TYPES } from './descriptiveStats.js';

/**
 * الاحتمالات والإحصاء — مخبر الثانوي seulement (décision du propriétaire,
 * 2026-09-30 ; labScope.js, MATH_LAB.md §2.1), avec toutes ses sections.
 *
 * La mécanique ci-dessous reste en place : le laboratoire sait filtrer ses
 * sections, ses graphiques, ses indicateurs et ses plis
 * (`probabilityFeatures`), et ramener un état hors de portée
 * (`clampToFeatures`). Aucun مخبر ne la restreint aujourd'hui ; le jour où
 * l'instrument rejoint un autre مخبر avec moins de capacités, il suffit de
 * les déclarer ici.
 */
export const PROBABILITY_SCOPES = Object.freeze(['secondaire']);

export const PROBABILITY_CAPABILITIES = Object.freeze({ secondaire: null });

/** Tous les indicateurs de la grille, et tous les plis « كيف تُحسب ؟ ». */
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
 * Un état enregistré ramené à ce que le مخبر montre : une section absente
 * rouvre sur la première, un graphique absent revient au choix automatique
 * (barres ou histogramme, toujours permis). Le reste de l'état est GARDÉ —
 * rien n'est effacé, seulement pas montré.
 */
export function clampToFeatures(data, features) {
  const mode = features.sections.includes(data.mode) ? data.mode : features.sections[0];
  const chart = data.chart === null || features.charts.includes(data.chart) ? data.chart : null;

  return mode === data.mode && chart === data.chart ? data : { ...data, mode, chart };
}
