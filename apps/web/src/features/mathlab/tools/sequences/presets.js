/**
 * LES PRÉRÉGLAGES (§39), LES MODÈLES DU RÉEL (§38) et LES EXPÉRIENCES (§26)
 * du مختبر المتتاليات.
 *
 * §39 est catégorique : « The presets should populate the existing workspace
 * rather than open unrelated pages. » Un préréglage n'est donc PAS un écran :
 * c'est un PATCH posé sur le document courant. `apply(data)` rend un patch,
 * jamais un document entier — la règle déjà tenue par `trigonometry/presets.js`.
 *
 * Les expériences (§26) portent une QUESTION et aucune réponse : « Predict →
 * manipulate → observe → explain ». On pose l'espace, on demande ce que
 * l'élève pense, et on se taît. Aucune validation, aucun verrou : rien dans
 * ce module ne sait dire « faux ».
 *
 * ── Pourquoi les nombres sont si simples ─────────────────────────────────
 * §30 : « Generate mathematically clean examples. Avoid ugly floating-point
 * exercises. » Un préréglage qui ouvre sur u₀ = 2 et r = 3 laisse l'élève
 * calculer de tête et VÉRIFIER l'écran ; un préréglage sur u₀ = 1,7 et
 * r = 0,31 ne lui laisse que croire l'écran. La confiance se construit sur
 * des nombres qu'il peut contrôler.
 */

import { DEFAULT_LAYERS } from './layers.js';

/** Toutes les couches éteintes : la base sur laquelle un préréglage rallume. */
const NONE = Object.freeze(Object.fromEntries(Object.keys(DEFAULT_LAYERS).map((key) => [key, false])));

/** Le socle que tout préréglage garde : on ne retire jamais le repère ni les points. */
const FRAME = Object.freeze({ points: true, stems: true, grid: true, labels: true, table: true });

const layers = (patch) => ({ ...NONE, ...FRAME, ...patch });

/**
 * @typedef {object} SequencePreset
 * @property {string} id
 * @property {string} labelKey    clé i18n, namespace `mathlab`
 * @property {string} hintKey     la phrase qui dit ce qu'on y regarde
 * @property {'basics'|'analysis'|'world'} group
 * @property {(data: object) => object} apply   le PATCH posé sur le document
 */

/** @type {ReadonlyArray<SequencePreset>} */
export const PRESETS = Object.freeze([
  // ── Les familles du cours (§13, §14, §15) ───────────────────────────────
  {
    id: 'arithmetic',
    labelKey: 'tools.sequences.presets.arithmetic',
    hintKey: 'tools.sequences.presets.arithmeticHint',
    group: 'basics',
    apply: () => ({
      primary: { kind: 'arithmetic', startIndex: 0, first: 2, second: 1, difference: 3, ratio: 2, a: 2, b: 1, explicitSource: '2n + 1', ruleSource: 'u + 3' },
      count: 10,
      // La différence constante, c'est LE geste de 4AM (§13).
      layers: layers({ differences: true }),
    }),
  },
  {
    id: 'geometric',
    labelKey: 'tools.sequences.presets.geometric',
    hintKey: 'tools.sequences.presets.geometricHint',
    group: 'basics',
    apply: (data) => ({
      primary: { ...data.primary, kind: 'geometric', startIndex: 0, first: 2, ratio: 1.5 },
      count: 10,
      layers: layers({ ratios: true }),
    }),
  },
  {
    id: 'affine',
    labelKey: 'tools.sequences.presets.affine',
    hintKey: 'tools.sequences.presets.affineHint',
    group: 'basics',
    apply: (data) => ({
      primary: { ...data.primary, kind: 'affine', startIndex: 0, first: 0, a: 0.5, b: 2 },
      count: 14,
      // Le point fixe 4 est le sujet du préréglage (§15) : on l'allume.
      layers: layers({ differences: true, fixedPoints: true }),
    }),
  },
  {
    id: 'explicit',
    labelKey: 'tools.sequences.presets.explicit',
    hintKey: 'tools.sequences.presets.explicitHint',
    group: 'basics',
    apply: (data) => ({
      primary: { ...data.primary, kind: 'explicit', startIndex: 0, explicitSource: '2n + 1' },
      count: 10,
      // La fonction continue derrière la suite : §18 veut qu'on voie que la
      // suite n'existe QU'aux entiers.
      layers: layers({ differences: true, continuous: true }),
    }),
  },
  {
    id: 'fibonacci',
    labelKey: 'tools.sequences.presets.fibonacci',
    hintKey: 'tools.sequences.presets.fibonacciHint',
    group: 'basics',
    apply: (data) => ({
      primary: { ...data.primary, kind: 'secondOrder', startIndex: 0, first: 0, second: 1, a: 1, b: 1 },
      count: 14,
      // §40 : « Show terms, graph, growth, ratio u(n+1)/u(n). » Le rapport
      // est la seule chose à regarder ici — il tend vers φ, mais §40 dit de
      // ne pas en faire une leçon sur le nombre d'or : on montre, on se taît.
      layers: layers({ ratios: true }),
    }),
  },

  // ── Les comportements (§11, §20, §24) ───────────────────────────────────
  {
    id: 'convergent',
    labelKey: 'tools.sequences.presets.convergent',
    hintKey: 'tools.sequences.presets.convergentHint',
    group: 'analysis',
    apply: (data) => ({
      primary: { ...data.primary, kind: 'geometric', startIndex: 0, first: 8, ratio: 0.5 },
      count: 16,
      layers: layers({ ratios: true, bounds: true }),
    }),
  },
  {
    id: 'divergent',
    labelKey: 'tools.sequences.presets.divergent',
    hintKey: 'tools.sequences.presets.divergentHint',
    group: 'analysis',
    apply: (data) => ({
      primary: { ...data.primary, kind: 'geometric', startIndex: 0, first: 1, ratio: 2 },
      count: 12,
      layers: layers({ ratios: true }),
    }),
  },
  {
    id: 'alternating',
    labelKey: 'tools.sequences.presets.alternating',
    hintKey: 'tools.sequences.presets.alternatingHint',
    group: 'analysis',
    apply: (data) => ({
      primary: { ...data.primary, kind: 'geometric', startIndex: 0, first: 3, ratio: -1 },
      count: 12,
      // §20 : le changement de signe doit SAUTER aux yeux — les sous-suites
      // paires/impaires le rendent lisible d'un coup.
      layers: layers({ evenOdd: true }),
    }),
  },
  {
    id: 'dampedAlternating',
    labelKey: 'tools.sequences.presets.dampedAlternating',
    hintKey: 'tools.sequences.presets.dampedAlternatingHint',
    group: 'analysis',
    apply: (data) => ({
      // §24 exactement : le signe alterne ET l'amplitude décroît. C'est ce
      // qui sépare « oscille » de « converge en oscillant ».
      primary: { ...data.primary, kind: 'geometric', startIndex: 0, first: 4, ratio: -0.6 },
      count: 16,
      layers: layers({ evenOdd: true, bounds: true }),
    }),
  },
  {
    id: 'fixedPoint',
    labelKey: 'tools.sequences.presets.fixedPoint',
    hintKey: 'tools.sequences.presets.fixedPointHint',
    group: 'analysis',
    apply: (data) => ({
      primary: { ...data.primary, kind: 'affine', startIndex: 0, first: 10, a: 0.5, b: 2 },
      count: 14,
      // LE préréglage de la toile d'araignée (§9, §10) : c'est là qu'on la montre.
      layers: layers({ cobweb: true, fixedPoints: true, table: false }),
    }),
  },
  {
    id: 'squares',
    labelKey: 'tools.sequences.presets.squares',
    hintKey: 'tools.sequences.presets.squaresHint',
    group: 'analysis',
    apply: (data) => ({
      // §41 : 1, 4, 9, 16, 25 — les différences secondes sont constantes.
      primary: { ...data.primary, kind: 'explicit', startIndex: 1, explicitSource: 'n^2' },
      count: 8,
      layers: layers({ differences: true, secondDifferences: true }),
    }),
  },
  {
    id: 'sums',
    labelKey: 'tools.sequences.presets.sums',
    hintKey: 'tools.sequences.presets.sumsHint',
    group: 'analysis',
    apply: (data) => ({
      primary: { ...data.primary, kind: 'geometric', startIndex: 0, first: 1, ratio: 0.5 },
      count: 12,
      // §36, §37 : la somme s'accumule et semble se poser sur 2.
      layers: layers({ sums: true }),
    }),
  },

  // ── Les modèles du réel (§38) ───────────────────────────────────────────
  {
    id: 'population',
    labelKey: 'tools.sequences.presets.population',
    hintKey: 'tools.sequences.presets.populationHint',
    group: 'world',
    apply: (data) => ({
      // 5 % par an : u(n+1) = 1,05·u(n)
      primary: { ...data.primary, kind: 'geometric', startIndex: 0, first: 1000, ratio: 1.05 },
      count: 15,
      layers: layers({ ratios: true }),
    }),
  },
  {
    id: 'depreciation',
    labelKey: 'tools.sequences.presets.depreciation',
    hintKey: 'tools.sequences.presets.depreciationHint',
    group: 'world',
    apply: (data) => ({
      primary: { ...data.primary, kind: 'geometric', startIndex: 0, first: 20000, ratio: 0.8 },
      count: 12,
      layers: layers({ ratios: true }),
    }),
  },
  {
    id: 'savings',
    labelKey: 'tools.sequences.presets.savings',
    hintKey: 'tools.sequences.presets.savingsHint',
    group: 'world',
    apply: (data) => ({
      primary: { ...data.primary, kind: 'arithmetic', startIndex: 0, first: 500, difference: 500 },
      count: 12,
      layers: layers({ differences: true, sums: false }),
    }),
  },
  {
    id: 'cooling',
    labelKey: 'tools.sequences.presets.cooling',
    hintKey: 'tools.sequences.presets.coolingHint',
    group: 'world',
    apply: (data) => ({
      // Une tasse à 90° dans une pièce à 20° : u(n+1) = 0,8·u(n) + 4.
      // Le point fixe est 20 — la température de la pièce. C'est le plus
      // bel exemple de §15 : la limite a un SENS physique.
      primary: { ...data.primary, kind: 'affine', startIndex: 0, first: 90, a: 0.8, b: 4 },
      count: 20,
      layers: layers({ fixedPoints: true, differences: true }),
    }),
  },
]);

export function getPreset(id) {
  return PRESETS.find((preset) => preset.id === id) ?? null;
}

/**
 * ── LES EXPÉRIENCES « ET SI… ? » (§26) ───────────────────────────────────
 *
 * Chacune pose l'espace, énonce la question, et propose deux ou trois pas.
 * `apply` est un patch comme pour un préréglage ; `questionKey` est la
 * question posée AVANT de toucher (c'est le « predict » de §26) ; `steps`
 * sont les gestes à faire. Aucune réponse n'est stockée ici, et rien ne
 * vérifie : §26 demande « predict → manipulate → observe → explain », pas
 * un questionnaire.
 *
 * `focus` nomme le paramètre que l'expérience veut faire bouger : l'interface
 * met son curseur en évidence, pour que l'élève sache quoi tirer.
 */
export const EXPERIMENTS = Object.freeze([
  {
    id: 'negativeDifference',
    labelKey: 'tools.sequences.experiments.negativeDifference',
    questionKey: 'tools.sequences.experiments.negativeDifferenceQ',
    focus: 'difference',
    steps: ['tools.sequences.experiments.negativeDifferenceS1', 'tools.sequences.experiments.negativeDifferenceS2'],
    apply: (data) => ({
      primary: { ...data.primary, kind: 'arithmetic', startIndex: 0, first: 10, difference: 3 },
      count: 10,
      layers: layers({ differences: true }),
    }),
  },
  {
    id: 'ratioBetweenZeroAndOne',
    labelKey: 'tools.sequences.experiments.ratioBetweenZeroAndOne',
    questionKey: 'tools.sequences.experiments.ratioBetweenZeroAndOneQ',
    focus: 'ratio',
    steps: ['tools.sequences.experiments.ratioBetweenZeroAndOneS1', 'tools.sequences.experiments.ratioBetweenZeroAndOneS2'],
    apply: (data) => ({
      primary: { ...data.primary, kind: 'geometric', startIndex: 0, first: 8, ratio: 0.8 },
      count: 16,
      layers: layers({ ratios: true, bounds: true }),
    }),
  },
  {
    id: 'negativeRatio',
    labelKey: 'tools.sequences.experiments.negativeRatio',
    questionKey: 'tools.sequences.experiments.negativeRatioQ',
    focus: 'ratio',
    steps: ['tools.sequences.experiments.negativeRatioS1', 'tools.sequences.experiments.negativeRatioS2'],
    apply: (data) => ({
      primary: { ...data.primary, kind: 'geometric', startIndex: 0, first: 3, ratio: 1.5 },
      count: 12,
      layers: layers({ evenOdd: true }),
    }),
  },
  {
    id: 'ratioOne',
    labelKey: 'tools.sequences.experiments.ratioOne',
    questionKey: 'tools.sequences.experiments.ratioOneQ',
    focus: 'ratio',
    steps: ['tools.sequences.experiments.ratioOneS1', 'tools.sequences.experiments.ratioOneS2'],
    apply: (data) => ({
      primary: { ...data.primary, kind: 'geometric', startIndex: 0, first: 5, ratio: 1.2 },
      count: 12,
      layers: layers({ differences: true, ratios: true }),
    }),
  },
  {
    id: 'startingValue',
    labelKey: 'tools.sequences.experiments.startingValue',
    questionKey: 'tools.sequences.experiments.startingValueQ',
    focus: 'first',
    steps: ['tools.sequences.experiments.startingValueS1', 'tools.sequences.experiments.startingValueS2'],
    apply: (data) => ({
      // L'affine converge vers b/(1−a) QUEL QUE SOIT u₀ : c'est la
      // découverte de l'expérience, et la toile la rend évidente.
      primary: { ...data.primary, kind: 'affine', startIndex: 0, first: 10, a: 0.5, b: 2 },
      count: 16,
      layers: layers({ cobweb: true, fixedPoints: true }),
    }),
  },
  {
    id: 'nonlinear',
    labelKey: 'tools.sequences.experiments.nonlinear',
    questionKey: 'tools.sequences.experiments.nonlinearQ',
    focus: 'rule',
    steps: ['tools.sequences.experiments.nonlinearS1', 'tools.sequences.experiments.nonlinearS2'],
    apply: (data) => ({
      // u(n+1) = u² − 1 : selon u₀, elle se pose, cycle, ou explose. C'est
      // la non-linéarité de §26 ex. 6, avec des nombres tout simples.
      primary: { ...data.primary, kind: 'recurrence', startIndex: 0, first: 0.5, ruleSource: 'u^2 - 1' },
      count: 16,
      layers: layers({ cobweb: true, fixedPoints: true }),
    }),
  },
]);

export function getExperiment(id) {
  return EXPERIMENTS.find((experiment) => experiment.id === id) ?? null;
}
