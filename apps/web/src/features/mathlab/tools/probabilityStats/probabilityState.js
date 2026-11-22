/**
 * L'ÉTAT du laboratoire des probabilités et statistiques — logique pure,
 * sans React.
 *
 *     data = {
 *       mode:       'experiment' | 'dataset' | 'tree' | 'normal',   // la section ouverte
 *       experiment: 'coin' | 'die' | 'twoDice' | 'random',
 *       range:      { min, max },          // les bornes du générateur d'entiers
 *       draws:      number,                // combien de tirages au prochain lancer
 *       simulation: { experimentId, seed, total, counts, drawn, trajectory, last } | null,
 *       dataset:    string,                // la série TELLE QUE SAISIE
 *       chart:      null | 'bars' | 'histogram' | 'pie' | 'box' | 'cumulative',  // null = automatique (V1)
 *       settings:   { compare, showMean, showMedian, watchRolls },
 *       tree:       { stages, branches, presetId, query },            // probabilityTree.js
 *       normal:     { mu, sigma, x, a, b, query, scale },              // normalDistribution.js
 *     }
 *
 * V2 (2026-09-30) n'a fait qu'AJOUTER : `mode` accepte deux sections de
 * plus, et `chart`, `tree`, `normal` prennent leur valeur par défaut quand
 * un document V1 ne les porte pas — il se rouvre donc à l'identique.
 *
 * `dataset` garde le TEXTE, pas les nombres : une saisie fautive doit se
 * retrouver telle quelle au rechargement, pour que l'élève voie ce qu'il a
 * écrit et le corrige — exactement comme le grapheur garde une expression
 * invalide (MATH_LAB.md § 5b.6).
 *
 * `simulation` ne garde que des effectifs et une graine : cent mille
 * lancers pèsent le même poids que dix.
 *
 * PROBABILITY_STATS_SCHEMA_VERSION est la version de CE format.
 */

import {
  DEFAULT_DRAWS, DEFAULT_EXPERIMENT, MAX_DRAWS, isExperimentId, normalizeRange,
} from './experiments.js';
import { fromStoredSimulation, toStoredSimulation } from './simulationEngine.js';
import { MAX_DATASET_VALUES } from './datasetStatistics.js';
import { CHART_TYPES } from './descriptiveStats.js';
import { normalizeTree, toStoredTree } from './probabilityTree.js';
import { NORMAL_VALUE_BOUND, QUERY_TYPES, SCALES } from './normalDistribution.js';

export const PROBABILITY_STATS_SCHEMA_VERSION = 2;

export const MODES = Object.freeze(['experiment', 'dataset', 'tree', 'normal']);
const DEFAULT_MODE = 'experiment';

/** Assez long pour porter MAX_DATASET_VALUES nombres, assez court pour borner le document. */
const MAX_DATASET_TEXT = MAX_DATASET_VALUES * 12;

/** La série d'exemple d'un laboratoire neuf : sept valeurs, une médiane lisible, une moyenne qui n'est pas ronde. */
export const EXAMPLE_DATASET = '12 ; 15 ; 14 ; 18 ; 10 ; 12 ; 16';

/** La loi normale d'un document neuf : la loi centrée réduite, P(X ≤ 1). */
export const DEFAULT_NORMAL = Object.freeze({ mu: 0, sigma: 1, x: 1, a: -1, b: 1, query: 'le', scale: 'x' });

function boundedNumber(value, fallback) {
  return typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= NORMAL_VALUE_BOUND ? value : fallback;
}

/** Des paramètres de loi normale sûrs : σ > 0 toujours, a ≤ b toujours (échangés sinon), requête et échelle connues. */
export function normalizeNormal(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const sigma = boundedNumber(source.sigma, DEFAULT_NORMAL.sigma);
  let a = boundedNumber(source.a, DEFAULT_NORMAL.a);
  let b = boundedNumber(source.b, DEFAULT_NORMAL.b);
  if (a > b) [a, b] = [b, a];

  return {
    mu: boundedNumber(source.mu, DEFAULT_NORMAL.mu),
    sigma: sigma > 0 ? sigma : DEFAULT_NORMAL.sigma,
    x: boundedNumber(source.x, DEFAULT_NORMAL.x),
    a,
    b,
    query: QUERY_TYPES.includes(source.query) ? source.query : DEFAULT_NORMAL.query,
    scale: SCALES.includes(source.scale) ? source.scale : DEFAULT_NORMAL.scale,
  };
}

function clampDraws(value) {
  const n = typeof value === 'number' && Number.isFinite(value) ? Math.floor(value) : DEFAULT_DRAWS;

  return Math.min(MAX_DRAWS, Math.max(1, n));
}

/** N'importe quel `data` (document, amorce, V1, V2) → l'état V2 complet et sûr. Ne lève jamais. */
export function normalizeProbabilityStatsData(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const mode = MODES.includes(source.mode) ? source.mode : DEFAULT_MODE;
  const experiment = isExperimentId(source.experiment) ? source.experiment : DEFAULT_EXPERIMENT;
  const range = normalizeRange(source.range);
  const settings = source.settings && typeof source.settings === 'object' ? source.settings : {};

  return {
    mode,
    experiment,
    range,
    draws: clampDraws(source.draws),
    // Une simulation qui ne correspond plus à son expérience est écartée :
    // des effectifs sans univers ne veulent rien dire.
    simulation: fromStoredSimulation(source.simulation, experiment, range),
    dataset: typeof source.dataset === 'string' ? source.dataset.slice(0, MAX_DATASET_TEXT) : EXAMPLE_DATASET,
    settings: {
      compare: settings.compare !== false,
      showMean: settings.showMean !== false,
      showMedian: settings.showMedian !== false,
      // Regarder chaque lancer (jusqu'à WATCH_MAX) plutôt qu'un lot : le geste par défaut.
      watchRolls: settings.watchRolls !== false,
    },
    chart: CHART_TYPES.includes(source.chart) ? source.chart : null,
    tree: normalizeTree(source.tree),
    normal: normalizeNormal(source.normal),
  };
}

/**
 * L'état d'un document neuf : la pièce, cent lancers prêts, aucune
 * simulation (rien n'est tiré avant que l'élève le demande), la série
 * d'exemple en réserve pour le mode « données ». Une amorce de leçon
 * (openMathLab.js) peut fixer le mode, l'expérience, ses paramètres et la
 * série — jamais une simulation : une expérience aléatoire se lance, elle
 * ne se reçoit pas toute faite.
 */
export function createProbabilityStatsData(seed = undefined) {
  if (seed && typeof seed === 'object') {
    return normalizeProbabilityStatsData({
      ...seed,
      simulation: null,
      dataset: typeof seed.dataset === 'string'
        ? seed.dataset
        : Array.isArray(seed.values) ? seed.values.filter((v) => Number.isFinite(v)).join(' ; ') : EXAMPLE_DATASET,
    });
  }

  return normalizeProbabilityStatsData({});
}

/** L'état → ce qu'on enregistre : la simulation y perd tout ce qui se recalcule. */
export function toStoredData(data) {
  return {
    mode: data.mode,
    experiment: data.experiment,
    range: data.range,
    draws: data.draws,
    simulation: toStoredSimulation(data.simulation),
    dataset: data.dataset,
    settings: { ...data.settings },
    chart: data.chart ?? null,
    tree: toStoredTree(data.tree),
    normal: { ...data.normal },
  };
}
