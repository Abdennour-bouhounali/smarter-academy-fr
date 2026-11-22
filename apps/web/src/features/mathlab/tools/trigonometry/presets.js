/**
 * LES PRÉRÉGLAGES (§27) et LES EXPÉRIENCES (§26) du مختبر المثلثات.
 *
 * §27 est précis sur ce qu'un préréglage doit être : « Presets should
 * configure the workspace rather than open completely separate unrelated
 * pages. » Un préréglage n'est donc PAS un écran : c'est un jeu de couches
 * et un mode posés sur le document courant. L'angle de l'élève survit, son
 * rayon aussi — on ne lui reprend pas son travail pour lui montrer autre
 * chose. `apply(data)` rend un PATCH, jamais un document entier.
 *
 * Les expériences (§26) suivent la règle des أشعة : « an experiment is a
 * plane already set up, nothing more ». Elles portent une question — ce que
 * §26 demande explicitement (« What happens to tan(θ) near 90° ? ») — mais
 * AUCUNE réponse et aucune validation : on pose l'espace et on se tait.
 */

import { DEFAULT_LAYERS } from './layers.js';

/** Toutes les couches éteintes : la base sur laquelle un préréglage rallume. */
const NONE = Object.freeze(Object.fromEntries(Object.keys(DEFAULT_LAYERS).map((k) => [k, false])));

/** Le socle que tout préréglage garde : on ne retire jamais le repère. */
const FRAME = Object.freeze({ axes: true, grid: true, values: true });

const layers = (patch) => ({ ...NONE, ...FRAME, ...patch });

/**
 * @typedef {object} TrigPreset
 * @property {string} id
 * @property {string} labelKey        clé i18n, namespace `mathlab`
 * @property {string} hintKey         la phrase qui dit ce qu'on y regarde
 * @property {(data: object) => object} apply   le PATCH posé sur le document
 */

/** @type {ReadonlyArray<TrigPreset>} */
export const PRESETS = Object.freeze([
  {
    id: 'triangle',
    labelKey: 'tools.trigonometry.presets.triangle',
    hintKey: 'tools.trigonometry.presets.triangleHint',
    apply: () => ({
      mode: 'triangle',
      layers: layers({ circle: false, triangle: true, coordinates: false }),
      highlight: null,
    }),
  },
  {
    id: 'sohcahtoa',
    labelKey: 'tools.trigonometry.presets.sohcahtoa',
    hintKey: 'tools.trigonometry.presets.sohcahtoaHint',
    apply: () => ({
      mode: 'triangle',
      layers: layers({ circle: false, triangle: true }),
      // Le rapport mis en avant est choisi : c'est le sujet du préréglage (§10).
      highlight: 'sin',
    }),
  },
  {
    id: 'unitCircle',
    labelKey: 'tools.trigonometry.presets.unitCircle',
    hintKey: 'tools.trigonometry.presets.unitCircleHint',
    apply: () => ({
      mode: 'circle',
      radius: 1,
      layers: layers({
        circle: true, arc: true, radius: true, projections: true,
        coordinates: true, sinSegment: true, cosSegment: true, triangle: true,
      }),
    }),
  },
  {
    id: 'specialAngles',
    labelKey: 'tools.trigonometry.presets.specialAngles',
    hintKey: 'tools.trigonometry.presets.specialAnglesHint',
    apply: () => ({
      mode: 'circle',
      radius: 1,
      valueMode: 'exact',
      layers: layers({
        circle: true, arc: true, radius: true, projections: true,
        coordinates: true, specialMarkers: true, triangle: true,
      }),
    }),
  },
  {
    id: 'sineWave',
    labelKey: 'tools.trigonometry.presets.sineWave',
    hintKey: 'tools.trigonometry.presets.sineWaveHint',
    apply: () => ({
      mode: 'circle',
      radius: 1,
      layers: layers({
        circle: true, arc: true, radius: true, sinSegment: true,
        projections: true, sineGraph: true,
      }),
    }),
  },
  {
    id: 'cosineWave',
    labelKey: 'tools.trigonometry.presets.cosineWave',
    hintKey: 'tools.trigonometry.presets.cosineWaveHint',
    apply: () => ({
      mode: 'circle',
      radius: 1,
      layers: layers({
        circle: true, arc: true, radius: true, cosSegment: true,
        projections: true, cosineGraph: true,
      }),
    }),
  },
  {
    id: 'tangent',
    labelKey: 'tools.trigonometry.presets.tangent',
    hintKey: 'tools.trigonometry.presets.tangentHint',
    apply: () => ({
      mode: 'circle',
      radius: 1,
      layers: layers({
        circle: true, arc: true, radius: true, tangentLine: true,
        projections: true, coordinates: true,
      }),
    }),
  },
  {
    id: 'radians',
    labelKey: 'tools.trigonometry.presets.radians',
    hintKey: 'tools.trigonometry.presets.radiansHint',
    apply: () => ({
      mode: 'circle',
      unit: 'rad',
      layers: layers({ circle: true, arc: true, radius: true, coordinates: false }),
    }),
  },
  {
    id: 'periodicity',
    labelKey: 'tools.trigonometry.presets.periodicity',
    hintKey: 'tools.trigonometry.presets.periodicityHint',
    apply: () => ({
      mode: 'circle',
      layers: layers({
        circle: true, arc: true, radius: true, sineGraph: true, projections: true,
      }),
    }),
  },
  {
    id: 'identity',
    labelKey: 'tools.trigonometry.presets.identity',
    hintKey: 'tools.trigonometry.presets.identityHint',
    apply: () => ({
      mode: 'circle',
      radius: 1,
      layers: layers({
        circle: true, arc: true, radius: true, triangle: true,
        sinSegment: true, cosSegment: true, projections: true,
      }),
    }),
  },
  {
    id: 'symmetry',
    labelKey: 'tools.trigonometry.presets.symmetry',
    hintKey: 'tools.trigonometry.presets.symmetryHint',
    apply: (data) => ({
      mode: 'circle',
      radius: 1,
      // La symétrie n'a de sens qu'avec un second point : on l'allume.
      symmetry: data.symmetry ?? 'negate',
      layers: layers({
        circle: true, arc: true, radius: true, projections: true, coordinates: true,
      }),
    }),
  },
  {
    id: 'quadrants',
    labelKey: 'tools.trigonometry.presets.quadrants',
    hintKey: 'tools.trigonometry.presets.quadrantsHint',
    apply: () => ({
      mode: 'circle',
      radius: 1,
      layers: layers({
        circle: true, arc: true, radius: true, quadrant: true,
        projections: true, coordinates: true,
      }),
    }),
  },
]);

export function getPreset(id) {
  return PRESETS.find((preset) => preset.id === id) ?? null;
}

/**
 * LES EXPÉRIENCES GUIDÉES (§26).
 *
 * Chacune pose une question, met l'espace dans l'état où la question se
 * REGARDE, et propose un angle de départ — puis se tait. §26 : « Each
 * experiment should let the student manipulate the mathematical object and
 * observe the result. » Il n'y a ni bonne réponse enregistrée, ni score, ni
 * étape suivante imposée : l'élève peut fermer l'expérience à tout moment et
 * l'espace reste dans l'état où elle l'a mis (§29 : « The student can skip
 * the guidance and continue exploring »).
 *
 * `steps` porte les invites successives de §29 (« Move the point to 90°. » →
 * « What happened to cos(θ)? »). Elles sont des INVITES, pas des étapes
 * verrouillées : rien ne vérifie qu'on les a suivies.
 */
export const EXPERIMENTS = Object.freeze([
  {
    id: 'sinGrows',
    labelKey: 'tools.trigonometry.experiments.sinGrows',
    questionKey: 'tools.trigonometry.experiments.sinGrowsQ',
    startAngle: 0,
    preset: 'sineWave',
    steps: ['tools.trigonometry.experiments.sinGrowsS1', 'tools.trigonometry.experiments.sinGrowsS2'],
  },
  {
    id: 'cosCrosses90',
    labelKey: 'tools.trigonometry.experiments.cosCrosses90',
    questionKey: 'tools.trigonometry.experiments.cosCrosses90Q',
    startAngle: 60,
    preset: 'cosineWave',
    steps: ['tools.trigonometry.experiments.cosCrosses90S1', 'tools.trigonometry.experiments.cosCrosses90S2'],
  },
  {
    id: 'tanNear90',
    labelKey: 'tools.trigonometry.experiments.tanNear90',
    questionKey: 'tools.trigonometry.experiments.tanNear90Q',
    startAngle: 80,
    preset: 'tangent',
    steps: ['tools.trigonometry.experiments.tanNear90S1', 'tools.trigonometry.experiments.tanNear90S2'],
  },
  {
    id: 'fullTurn',
    labelKey: 'tools.trigonometry.experiments.fullTurn',
    questionKey: 'tools.trigonometry.experiments.fullTurnQ',
    startAngle: 330,
    preset: 'periodicity',
    steps: ['tools.trigonometry.experiments.fullTurnS1', 'tools.trigonometry.experiments.fullTurnS2'],
  },
  {
    id: 'radiusChanges',
    labelKey: 'tools.trigonometry.experiments.radiusChanges',
    questionKey: 'tools.trigonometry.experiments.radiusChangesQ',
    startAngle: 45,
    preset: 'unitCircle',
    steps: ['tools.trigonometry.experiments.radiusChangesS1', 'tools.trigonometry.experiments.radiusChangesS2'],
  },
  {
    id: 'negativeAngle',
    labelKey: 'tools.trigonometry.experiments.negativeAngle',
    questionKey: 'tools.trigonometry.experiments.negativeAngleQ',
    startAngle: 40,
    preset: 'symmetry',
    steps: ['tools.trigonometry.experiments.negativeAngleS1', 'tools.trigonometry.experiments.negativeAngleS2'],
  },
  {
    id: 'arcIsRadian',
    labelKey: 'tools.trigonometry.experiments.arcIsRadian',
    questionKey: 'tools.trigonometry.experiments.arcIsRadianQ',
    startAngle: 57.2958,
    preset: 'radians',
    steps: ['tools.trigonometry.experiments.arcIsRadianS1', 'tools.trigonometry.experiments.arcIsRadianS2'],
  },
  {
    id: 'identitySum',
    labelKey: 'tools.trigonometry.experiments.identitySum',
    questionKey: 'tools.trigonometry.experiments.identitySumQ',
    startAngle: 35,
    preset: 'identity',
    steps: ['tools.trigonometry.experiments.identitySumS1', 'tools.trigonometry.experiments.identitySumS2'],
  },
]);

export function getExperiment(id) {
  return EXPERIMENTS.find((experiment) => experiment.id === id) ?? null;
}
