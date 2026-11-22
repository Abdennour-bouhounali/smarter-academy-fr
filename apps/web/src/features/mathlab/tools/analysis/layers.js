/**
 * Les BASCULES du مختبر التحليل — un module FEUILLE, sans import.
 *
 * Chaque couche est une chose qu'on peut allumer sur le graphe. Elles vivent
 * ici, à part de l'état, pour la même raison que dans le مختبر المثلثات : le
 * composant, l'état, le résumé et les tests ont tous besoin de la LISTE, et
 * aucun ne doit dépendre des autres pour l'obtenir.
 *
 * La valeur par défaut est celle du PREMIER écran (§53) : on allume ce qui
 * fait comprendre la sécante en une seconde, et rien de plus. Un écran qui
 * s'ouvre avec quinze couches allumées n'enseigne rien — c'est le « wall of
 * configuration » que §53 interdit.
 */

/** @type {Readonly<Record<string, boolean>>} */
export const DEFAULT_LAYERS = Object.freeze({
  // Le premier écran : la courbe, les deux points, la sécante, sa pente.
  curve: true,
  pointA: true,
  pointB: true,
  secant: true,
  slopeReadout: true,
  riseRun: true,        // le triangle Δx / Δy — ce qui REND la pente visible

  // La tangente et la dérivée : allumées quand on entre dans leur laboratoire.
  tangent: false,
  derivativeCurve: false,
  secondDerivative: false,
  criticalPoints: false,

  // L'étude de la fonction (§16) : chacune s'allume depuis sa ligne.
  roots: false,
  extrema: false,
  increasing: false,
  decreasing: false,
  signStrip: false,
  asymptotes: false,
  discontinuities: false,

  // Les limites (§11 – §14).
  approach: false,
  limitLines: false,

  // L'intégrale (§19 – §23).
  area: false,
  riemann: false,
  antiderivative: false,
  betweenCurves: false,

  // Les transformations (§25) et les intersections (§26).
  original: false,
  intersections: false,

  // Le repère.
  grid: true,
});

export const LAYER_KEYS = Object.freeze(Object.keys(DEFAULT_LAYERS));

/**
 * Les couches qu'un laboratoire allume en y entrant.
 *
 * Changer de laboratoire n'est pas changer d'écran : c'est changer ce qu'on
 * REGARDE sur le même graphe. La courbe et le repère ne bougent jamais ; ce
 * qui s'allume et s'éteint, ce sont les objets de l'expérience en cours.
 * C'est ce qui tient la promesse de §4 : « They should form one coherent
 * mathematical environment », et non sept pages séparées.
 */
const LAB_LAYERS = Object.freeze({
  secant: ['curve', 'pointA', 'pointB', 'secant', 'slopeReadout', 'riseRun'],
  tangent: ['curve', 'pointA', 'tangent', 'slopeReadout'],
  derivative: ['curve', 'pointA', 'tangent', 'derivativeCurve', 'criticalPoints'],
  limit: ['curve', 'approach', 'limitLines', 'discontinuities', 'asymptotes'],
  integral: ['curve', 'area', 'riemann'],
  study: ['curve', 'roots', 'extrema', 'signStrip', 'asymptotes'],
  transform: ['curve', 'original'],
});

/**
 * Les couches d'un laboratoire, les autres éteintes — en gardant la grille,
 * qui appartient au repère et non à l'expérience.
 */
export function layersForLab(lab, current = DEFAULT_LAYERS) {
  const wanted = new Set(LAB_LAYERS[lab] ?? LAB_LAYERS.secant);
  const next = {};
  for (const key of LAYER_KEYS) {
    next[key] = key === 'grid' ? current.grid !== false : wanted.has(key);
  }

  return next;
}
