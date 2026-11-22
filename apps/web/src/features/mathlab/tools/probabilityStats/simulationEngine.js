/**
 * Le MOTEUR de simulation — logique pure, sans React ni minuterie.
 *
 * Une simulation n'est PAS une animation préenregistrée : chaque tirage est
 * réellement calculé. Mais elle ne garde jamais les tirages : elle garde
 * leurs EFFECTIFS, un entier par issue. Cent mille lancers de dé, c'est six
 * nombres en mémoire, pas cent mille — c'est ce qui permet d'atteindre la
 * loi des grands nombres sans étouffer le navigateur (MATH_LAB.md § 5d).
 *
 *     runBatch(state, n) → un nouvel état, n tirages plus tard
 *
 * L'état est immuable vers l'extérieur (chaque lot rend un nouvel objet),
 * mais les effectifs sont un tableau typé recopié : la comparaison de
 * références de React suffit, sans copie profonde à chaque lot.
 *
 * Le générateur est `makeRng` (mulberry32, lessons/common/stats) : déterministe
 * à graine égale, donc une expérience rechargée depuis un document est la
 * MÊME expérience — la reproductibilité demandée, sans exposer la graine.
 */

import { makeRng } from '../../../../lessons/common/stats/randomUtils.js';
import { getExperiment } from './experiments.js';

/**
 * La taille d'un lot animé. 500 tirages par image : assez pour que
 * 10 000 lancers s'accumulent en une vingtaine d'images (sous la seconde),
 * assez peu pour que la barre bouge sous les yeux plutôt que de sauter.
 */
export const ANIMATION_BATCH = 500;
/** En deçà, on anime tirage par tirage : à 10 lancers, l'élève doit les voir arriver. */
export const ANIMATION_SLOW_THRESHOLD = 20;

/** Une graine neuve : ce qui distingue deux expériences lancées à la suite. */
export function freshSeed() {
  return (Math.floor(Math.random() * 0xffffffff) >>> 0) || 1;
}

/**
 * L'état vierge d'une simulation : aucun tirage, des effectifs nuls, une
 * graine, et la trajectoire de la fréquence suivie (vide).
 *
 * @param {string} experimentId
 * @param {object} params        les paramètres de l'expérience (bornes du générateur)
 * @param {number} [seed]
 */
export function createSimulation(experimentId, params = {}, seed = freshSeed()) {
  const experiment = getExperiment(experimentId);
  const size = experiment.outcomes(params).length;

  return {
    experimentId: experiment.id,
    seed,
    total: 0,
    counts: new Array(size).fill(0),
    /** Les points (n, fréquence de l'issue suivie) — la loi des grands nombres se LIT ici. */
    trajectory: [],
    /** L'état interne du générateur, pour que deux lots consécutifs forment UNE série. */
    drawn: 0,
    /** Le DERNIER tirage, avec ses composantes physiques — ce que l'objet animé montre. */
    last: null,
  };
}

/**
 * Le générateur d'une simulation, positionné là où le dernier lot l'a
 * laissé. mulberry32 n'a pas de « saut » : on le rejoue depuis la graine,
 * ce qui coûte un tirage vide par tirage déjà fait. C'est linéaire et
 * négligeable (100 000 tirages ≈ 1 ms) et cela garde l'état SÉRIALISABLE :
 * un document ne stocke qu'une graine et un compteur, jamais l'état interne
 * d'un générateur.
 */
function rngAt(simulation, params) {
  const experiment = getExperiment(simulation.experimentId);
  const rng = makeRng(simulation.seed);
  for (let i = 0; i < simulation.drawn; i += 1) experiment.draw(rng, params);

  return rng;
}

/**
 * Le nombre de points de trajectoire qu'on garde. La trajectoire sert à
 * VOIR la fréquence se stabiliser ; 60 points suffisent à dessiner
 * l'entonnoir, et bornent ce qu'un document enregistre.
 */
const TRAJECTORY_POINTS = 60;

/**
 * Faut-il relever un point de trajectoire à ce rang ? On relève densément
 * au début (où la fréquence danse) et de plus en plus rarement ensuite —
 * l'espacement logarithmique de FrequencyChart, qui est le seul à montrer
 * 10 et 10 000 sur le même dessin.
 */
function shouldRecord(n, total) {
  if (n <= 10) return true;
  const step = Math.max(1, Math.floor(total / TRAJECTORY_POINTS));

  return n % step === 0 || n === total;
}

/**
 * Un LOT de `n` tirages de plus. Rend un nouvel état ; l'ancien n'est pas
 * modifié. C'est la seule fonction qui tire.
 *
 * @param {ReturnType<createSimulation>} simulation
 * @param {number} n        combien de tirages de plus
 * @param {object} params
 * @param {number} [target] le total visé, pour espacer la trajectoire (défaut : le total atteint)
 */
export function runBatch(simulation, n, params = {}, target = 0) {
  const draws = Math.max(0, Math.floor(n));
  if (draws === 0) return simulation;
  const experiment = getExperiment(simulation.experimentId);
  const rng = rngAt(simulation, params);
  const counts = simulation.counts.slice();
  const tracked = experiment.trackedIndex(params);
  const trajectory = simulation.trajectory.slice();
  const horizon = Math.max(target, simulation.total + draws);
  let total = simulation.total;
  let trackedCount = counts[tracked] ?? 0;
  let last = simulation.last;

  for (let i = 0; i < draws; i += 1) {
    // Le tirage détaillé consomme exactement les mêmes nombres aléatoires que
    // `draw` : la série reste la même, on sait seulement en plus ce qui est
    // tombé sur la table.
    const drawn = experiment.drawParts(rng, params);
    counts[drawn.index] += 1;
    total += 1;
    if (drawn.index === tracked) trackedCount += 1;
    if (shouldRecord(total, horizon)) trajectory.push({ n: total, frequency: trackedCount / total });
    last = drawn;
  }

  return {
    ...simulation,
    total,
    counts,
    trajectory: trimTrajectory(trajectory),
    drawn: simulation.drawn + draws,
    last,
  };
}

/**
 * La trajectoire, ramenée à TRAJECTORY_POINTS points au plus en gardant les
 * premiers (où tout se joue), le dernier (l'état courant) et un échantillon
 * régulier entre les deux. Sans cela, mille lots d'animation en feraient
 * mille points.
 */
function trimTrajectory(points) {
  if (points.length <= TRAJECTORY_POINTS) return points;
  const kept = [];
  const stride = points.length / (TRAJECTORY_POINTS - 1);
  for (let i = 0; i < TRAJECTORY_POINTS - 1; i += 1) kept.push(points[Math.floor(i * stride)]);
  kept.push(points[points.length - 1]);

  return kept;
}

/**
 * Les fréquences expérimentales : effectif / total, dans l'ordre des issues.
 * Un total nul rend des fréquences nulles (jamais NaN, jamais une division
 * par zéro qui traverserait jusqu'au SVG).
 */
export function experimentalFrequencies(simulation) {
  if (!simulation || simulation.total === 0) return simulation ? simulation.counts.map(() => 0) : [];

  return simulation.counts.map((c) => c / simulation.total);
}

/**
 * Le tableau de comparaison théorique / expérimental, prêt à afficher :
 * une ligne par issue, avec son effectif, sa fréquence et sa probabilité.
 */
export function comparisonRows(simulation, params = {}) {
  const experiment = getExperiment(simulation.experimentId);
  const outcomes = experiment.outcomes(params);
  const probabilities = experiment.probabilities(params);
  const frequencies = experimentalFrequencies(simulation);

  return outcomes.map((outcome, index) => ({
    ...outcome,
    index,
    count: simulation.counts[index] ?? 0,
    frequency: frequencies[index] ?? 0,
    probability: probabilities[index] ?? 0,
  }));
}

/**
 * Une simulation est-elle encore celle de cette expérience et de ces
 * paramètres ? Changer d'expérience, ou les bornes du générateur, change
 * l'univers : les effectifs accumulés ne veulent plus rien dire et la
 * simulation repart de zéro.
 */
export function matchesExperiment(simulation, experimentId, params = {}) {
  if (!simulation || simulation.experimentId !== experimentId) return false;

  return simulation.counts.length === getExperiment(experimentId).outcomes(params).length;
}

/** L'état sérialisable d'une simulation : une graine, un compteur, des effectifs, une trajectoire. */
export function toStoredSimulation(simulation) {
  if (!simulation || simulation.total === 0) return null;

  return {
    experimentId: simulation.experimentId,
    seed: simulation.seed,
    total: simulation.total,
    counts: [...simulation.counts],
    drawn: simulation.drawn,
    trajectory: simulation.trajectory.map((p) => ({ n: p.n, frequency: Math.round(p.frequency * 1e6) / 1e6 })),
    // Le dernier tirage : quelques entiers, pour que le dé rouvre sur la face où il s'est arrêté.
    last: simulation.last ? { index: simulation.last.index, parts: [...simulation.last.parts] } : null,
  };
}

/** Un dernier tirage stocké → sûr, ou null : un index de l'univers, des composantes entières. */
function normalizeLast(raw, size) {
  if (!raw || typeof raw !== 'object') return null;
  if (!Number.isInteger(raw.index) || raw.index < 0 || raw.index >= size) return null;
  if (!Array.isArray(raw.parts) || raw.parts.length === 0 || raw.parts.length > 2 || !raw.parts.every(Number.isInteger)) return null;

  return { index: raw.index, parts: [...raw.parts] };
}

/**
 * Une simulation stockée → un état sûr, ou `null`. Tout ce qui ne tient pas
 * debout (effectifs qui ne somment pas au total, univers de la mauvaise
 * taille, expérience inconnue) est écarté : mieux vaut un laboratoire vide
 * qu'un graphique qui ment.
 */
export function fromStoredSimulation(raw, experimentId, params = {}) {
  if (!raw || typeof raw !== 'object') return null;
  if (raw.experimentId !== experimentId) return null;
  const size = getExperiment(experimentId).outcomes(params).length;
  if (!Array.isArray(raw.counts) || raw.counts.length !== size) return null;
  const counts = raw.counts.map((c) => (Number.isInteger(c) && c >= 0 ? c : -1));
  if (counts.some((c) => c < 0)) return null;
  const total = counts.reduce((a, b) => a + b, 0);
  if (total === 0 || total !== raw.total) return null;
  const seed = Number.isInteger(raw.seed) && raw.seed > 0 ? raw.seed : freshSeed();
  const trajectory = Array.isArray(raw.trajectory)
    ? raw.trajectory
      .filter((p) => p && Number.isFinite(p.n) && Number.isFinite(p.frequency) && p.n >= 1 && p.frequency >= 0 && p.frequency <= 1)
      .slice(0, TRAJECTORY_POINTS)
    : [];

  return {
    experimentId,
    seed,
    total,
    counts,
    trajectory,
    drawn: Number.isInteger(raw.drawn) && raw.drawn >= total ? raw.drawn : total,
    last: normalizeLast(raw.last, size),
  };
}
