/**
 * Les EXPÉRIENCES aléatoires du laboratoire — la théorie, en fonctions
 * pures : ce que chaque expérience peut produire, avec quelle probabilité,
 * et comment on tire un résultat. Ni React, ni DOM, ni état.
 *
 * Une expérience se décrit par son UNIVERS (les issues possibles, dans
 * l'ordre de lecture) et sa LOI (la probabilité de chacune). Le simulateur
 * (simulationEngine.js) ne connaît que cette interface : ajouter une
 * expérience, c'est ajouter une entrée ici, et rien d'autre ne bouge.
 *
 * La probabilité théorique n'est JAMAIS une constante recopiée : 1/6 est
 * calculé comme 1/|univers|, et la loi de la somme de deux dés est comptée
 * sur les 36 couples équiprobables. Une valeur en dur serait un mensonge le
 * jour où l'on changerait un paramètre — et l'élève doit pouvoir changer
 * les paramètres.
 */

import { randomInt } from '../../../../lessons/common/stats/randomUtils.js';

/** Les bornes du générateur d'entiers — larges pour explorer, assez serrées pour que l'axe reste lisible. */
export const RANDOM_MIN_BOUND = -1000;
export const RANDOM_MAX_BOUND = 1000;
/** Au-delà, l'histogramme deviendrait une forêt de barres d'un pixel. */
export const RANDOM_MAX_SPAN = 100;

/** Les tailles d'échantillon proposées, de « une fois, pour voir » à « la loi des grands nombres ». */
export const SAMPLE_SIZES = Object.freeze([1, 10, 100, 1000, 10000, 100000]);
export const MAX_DRAWS = 100000;
export const DEFAULT_DRAWS = 100;

/**
 * L'univers d'une expérience : la liste ordonnée de ses issues.
 * Une issue est `{ key, value }` — `key` identifie (et sert de clé i18n ou
 * d'étiquette), `value` est le nombre qu'on porte sur l'axe quand il y en a un.
 */

/** Pile ou face : deux issues équiprobables. */
function coinOutcomes() {
  return [{ key: 'tails', value: 0 }, { key: 'heads', value: 1 }];
}

/** Le dé à six faces : les faces 1 à 6. */
function dieOutcomes() {
  return [1, 2, 3, 4, 5, 6].map((n) => ({ key: String(n), value: n }));
}

/** Deux dés : les sommes 2 à 12 — c'est la SOMME qu'on observe, pas le couple. */
function twoDiceOutcomes() {
  const outcomes = [];
  for (let s = 2; s <= 12; s += 1) outcomes.push({ key: String(s), value: s });

  return outcomes;
}

/** Les entiers de min à max, bornes comprises. */
function randomOutcomes({ min, max }) {
  const outcomes = [];
  for (let n = min; n <= max; n += 1) outcomes.push({ key: String(n), value: n });

  return outcomes;
}

/**
 * La loi de la somme de deux dés, COMPTÉE sur les 36 couples équiprobables
 * — jamais la table 1,2,3,4,5,6,5,4,3,2,1 recopiée. C'est la démonstration
 * que l'élève doit pouvoir refaire, et c'est elle qui donne P(7) = 6/36.
 */
function twoDiceProbabilities() {
  const counts = new Array(13).fill(0);
  for (let a = 1; a <= 6; a += 1) {
    for (let b = 1; b <= 6; b += 1) counts[a + b] += 1;
  }

  return counts.slice(2).map((c) => c / 36);
}

/** Une loi uniforme sur k issues : chacune 1/k. */
const uniform = (k) => new Array(k).fill(1 / k);

/**
 * Le CATALOGUE des expériences. Chacune sait :
 *   - `outcomes(params)`  son univers, ordonné ;
 *   - `probabilities(params)` la loi théorique, même ordre, de somme 1 ;
 *   - `draw(rng, params)` un tirage → l'INDEX de l'issue dans l'univers.
 *
 * `draw` rend un index et non une valeur : le simulateur n'accumule que des
 * effectifs dans un tableau indexé, ce qui lui permet de tirer cent mille
 * fois sans jamais garder cent mille résultats (§ performance).
 *
 * `drawParts` fait le MÊME tirage (mêmes appels au générateur, dans le même
 * ordre) mais rend aussi ses composantes physiques — les deux dés d'une
 * somme — pour que l'objet animé montre exactement ce qui a été tiré.
 * `parts` est ce que l'élève verrait sur la table : la face de chaque dé,
 * le côté de la pièce (0 = ظهر, 1 = وجه), le nombre tiré.
 */
export const EXPERIMENTS = Object.freeze({
  coin: Object.freeze({
    id: 'coin',
    /** Un lancer de pièce est binaire : le second résultat (face) vaut 1. */
    outcomes: coinOutcomes,
    probabilities: () => uniform(2),
    draw: (rng) => randomInt(rng, 0, 1),
    drawParts: (rng) => { const index = randomInt(rng, 0, 1); return { index, parts: [index] }; },
    /** L'issue dont on suit la fréquence dans l'exploration de la loi des grands nombres. */
    trackedIndex: () => 1,
    numeric: false,
    /** L'objet physique qui réalise l'expérience, et combien. */
    physical: Object.freeze({ kind: 'coin', count: 1 }),
  }),
  die: Object.freeze({
    id: 'die',
    outcomes: dieOutcomes,
    probabilities: () => uniform(6),
    draw: (rng) => randomInt(rng, 0, 5),
    drawParts: (rng) => { const index = randomInt(rng, 0, 5); return { index, parts: [index + 1] }; },
    trackedIndex: () => 0,
    numeric: true,
    physical: Object.freeze({ kind: 'die', count: 1 }),
  }),
  twoDice: Object.freeze({
    id: 'twoDice',
    outcomes: twoDiceOutcomes,
    probabilities: twoDiceProbabilities,
    // Deux dés RÉELLEMENT lancés, puis additionnés : tirer directement dans
    // la loi de la somme donnerait les mêmes fréquences, mais l'expérience
    // simulée ne serait plus celle que l'élève croit faire.
    draw: (rng) => randomInt(rng, 1, 6) + randomInt(rng, 1, 6) - 2,
    drawParts: (rng) => {
      const a = randomInt(rng, 1, 6);
      const b = randomInt(rng, 1, 6);

      return { index: a + b - 2, parts: [a, b] };
    },
    // La somme 7, la plus probable — c'est elle qu'on compare à 6/36.
    trackedIndex: () => 5,
    numeric: true,
    physical: Object.freeze({ kind: 'die', count: 2 }),
  }),
  random: Object.freeze({
    id: 'random',
    outcomes: randomOutcomes,
    probabilities: ({ min, max }) => uniform(max - min + 1),
    draw: (rng, { min, max }) => randomInt(rng, 0, max - min),
    drawParts: (rng, { min, max }) => { const index = randomInt(rng, 0, max - min); return { index, parts: [min + index] }; },
    trackedIndex: () => 0,
    numeric: true,
    physical: null,
  }),
});

export const EXPERIMENT_IDS = Object.freeze(Object.keys(EXPERIMENTS));
export const DEFAULT_EXPERIMENT = 'coin';

export function isExperimentId(id) {
  return Object.prototype.hasOwnProperty.call(EXPERIMENTS, id);
}

/** @returns {typeof EXPERIMENTS[keyof typeof EXPERIMENTS]} */
export function getExperiment(id) {
  return isExperimentId(id) ? EXPERIMENTS[id] : EXPERIMENTS[DEFAULT_EXPERIMENT];
}

/**
 * Les bornes du générateur d'entiers, rendues sûres : entières, ordonnées,
 * dans les bornes du laboratoire, et d'étendue bornée. Une saisie
 * incohérente (min > max) est REDRESSÉE plutôt que refusée — l'élève voulait
 * visiblement l'intervalle entre les deux.
 */
export function normalizeRange(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const clamp = (value, fallback) => {
    const n = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : fallback;

    return Math.min(RANDOM_MAX_BOUND, Math.max(RANDOM_MIN_BOUND, n));
  };
  let min = clamp(source.min, 1);
  let max = clamp(source.max, 20);
  if (min > max) [min, max] = [max, min];
  if (max - min + 1 > RANDOM_MAX_SPAN) max = min + RANDOM_MAX_SPAN - 1;

  return { min, max };
}

/**
 * La distribution théorique d'une expérience, prête à être affichée :
 * pour chaque issue, sa clé, sa valeur numérique et sa probabilité.
 */
export function theoreticalDistribution(experimentId, params = {}) {
  const experiment = getExperiment(experimentId);
  const outcomes = experiment.outcomes(params);
  const probabilities = experiment.probabilities(params);

  return outcomes.map((outcome, index) => ({ ...outcome, probability: probabilities[index] ?? 0 }));
}

/**
 * La probabilité théorique sous forme de FRACTION exacte quand elle en a
 * une simple — « 1/6 », « 6/36 » — parce qu'un élève de collège lit une
 * probabilité en fraction avant de la lire en pourcentage. `null` quand
 * l'expérience n'en a pas de canonique (générateur d'entiers quelconque).
 */
export function theoreticalFraction(experimentId, index, params = {}) {
  const experiment = getExperiment(experimentId);
  if (experiment.id === 'coin') return { numerator: 1, denominator: 2 };
  if (experiment.id === 'die') return { numerator: 1, denominator: 6 };
  if (experiment.id === 'twoDice') {
    const counts = twoDiceProbabilities().map((p) => Math.round(p * 36));

    return { numerator: counts[index] ?? 0, denominator: 36 };
  }
  const outcomes = experiment.outcomes(params);

  return { numerator: 1, denominator: outcomes.length };
}
