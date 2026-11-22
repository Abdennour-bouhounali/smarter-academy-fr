/**
 * L'ÉTAT du مختبر المثلثات — logique pure, sans React (§42).
 *
 *     data = {
 *       mode:     'circle' | 'triangle',   // le cercle, ou le triangle du programme
 *       angle:    number,                  // en DEGRÉS, non normalisé (450° reste 450°)
 *       radius:   number,                  // le rayon du cercle (§17)
 *       unit:     'deg' | 'rad',           // ce que l'élève tape et lit
 *       valueMode:'exact' | 'decimal',     // §19
 *       compare:  { enabled, angle },      // §33 : deux angles
 *       triangle: { given, angle, opposite, adjacent, hypotenuse },  // §9
 *       inverse:  { ratio, value } | null, // §24
 *       symmetry: 'negate' | … | null,     // §21
 *       highlight:'sin' | 'cos' | 'tan' | null,   // §10 SOH-CAH-TOA
 *       layers:   { …quinze bascules… },   // §30
 *       practice: { … },                   // §25, séparé du reste
 *       preset:   string | null            // §27
 *     }
 *
 * §42 demande de séparer l'état MATHÉMATIQUE de l'état d'INTERFACE. La
 * frontière retenue est celle de la PERSISTANCE (§43) : ce qui mérite d'être
 * retrouvé demain est ici et part au serveur ; ce qui ne vit que le temps
 * d'un geste — l'animation en cours, un panneau ouvert, une infobulle — vit
 * dans le composant et n'est JAMAIS sérialisé. « Do not persist unnecessary
 * transient animation state » est donc tenu par construction, pas par
 * discipline : l'animation n'a pas de champ où s'écrire.
 *
 * TRIGONOMETRY_SCHEMA_VERSION est la version de CE format.
 */

import { normalizeDegrees, SYMMETRIES } from './trigMath.js';
import { DEFAULT_LAYERS, LAYER_KEYS } from './layers.js';
import { getPreset } from './presets.js';

export { DEFAULT_LAYERS, LAYER_KEYS };

export const TRIGONOMETRY_SCHEMA_VERSION = 1;

/**
 * Les bornes de l'angle.
 *
 * §14 veut qu'on dépasse le tour — 450°, 720°, −360° — pour que la
 * périodicité se DÉCOUVRE. On laisse donc deux tours de chaque côté, et pas
 * davantage : au-delà, l'arc dessiné s'enroule en pelote illisible et
 * n'apprend plus rien.
 */
export const MIN_ANGLE = -720;
export const MAX_ANGLE = 1080;

/** Le rayon du cercle arbitraire (§17). 1 reste le défaut : c'est LE cercle. */
export const MIN_RADIUS = 0.5;
export const MAX_RADIUS = 5;

/** Les côtés d'un triangle : assez grands pour être lus, assez petits pour tenir. */
const MIN_SIDE = 0.5;
const MAX_SIDE = 100;

export const MODES = Object.freeze(['circle', 'triangle']);
export const UNITS = Object.freeze(['deg', 'rad']);
const VALUE_MODES = Object.freeze(['exact', 'decimal']);
const RATIOS = Object.freeze(['sin', 'cos', 'tan']);
export const TRIANGLE_GIVENS = Object.freeze([
  'angle-hyp', 'angle-opp', 'angle-adj', 'opp-adj', 'opp-hyp', 'adj-hyp',
]);

const isPlainObject = (v) => Boolean(v) && typeof v === 'object' && !Array.isArray(v);

/** Un nombre borné, ou la valeur de repli — jamais NaN, jamais Infinity. */
function readNumber(raw, fallback, min, max) {
  const value = typeof raw === 'string' ? Number(raw.replace(',', '.')) : raw;
  if (!Number.isFinite(value)) return fallback;

  return Math.min(max, Math.max(min, value));
}

function readEnum(raw, allowed, fallback) {
  return allowed.includes(raw) ? raw : fallback;
}

function readBoolean(raw, fallback) {
  return typeof raw === 'boolean' ? raw : fallback;
}

/**
 * L'angle d'ouverture : 30°.
 *
 * Pas 0° — à 0° le point est SUR l'axe, le triangle est plat, sin vaut 0 et
 * l'écran ne montre rien de ce qu'il sait faire. 30° est le premier angle du
 * manuel, il a une forme exacte (1/2), et le triangle est déjà lisible : en
 * une seconde l'élève voit un cercle, un point, un angle et trois valeurs
 * (§46).
 */
export const DEFAULT_ANGLE = 30;

export function createTrigonometryData(seed) {
  const base = {
    mode: 'triangle',
    angle: DEFAULT_ANGLE,
    radius: 1,
    unit: 'deg',
    valueMode: 'exact',
    compare: { enabled: false, angle: 150 },
    triangle: { given: 'angle-hyp', angle: 30, opposite: 5, adjacent: 8, hypotenuse: 10 },
    inverse: null,
    symmetry: null,
    highlight: null,
    layers: { ...DEFAULT_LAYERS, triangle: true },
    practice: createPracticeState(),
    preset: null,
  };

  if (!isPlainObject(seed)) return base;

  return normalizeTrigonometryData(applySeed(base, seed));
}

/**
 * L'amorce qu'une leçon transmet (openMathLab.js). Le contrat est publié par
 * LESSON_DEVELOPMENT_GUIDE.md ; une amorce illisible ne casse rien — on
 * retombe sur le document par défaut, comme pour les أشعة.
 */
function applySeed(base, seed) {
  const next = { ...base };

  if (MODES.includes(seed.mode)) next.mode = seed.mode;
  if (Number.isFinite(seed.angle)) next.angle = seed.angle;
  if (Number.isFinite(seed.radius)) next.radius = seed.radius;
  if (UNITS.includes(seed.unit)) next.unit = seed.unit;
  if (VALUE_MODES.includes(seed.valueMode)) next.valueMode = seed.valueMode;
  if (RATIOS.includes(seed.highlight)) next.highlight = seed.highlight;
  if (isPlainObject(seed.triangle)) next.triangle = { ...next.triangle, ...seed.triangle };
  if (isPlainObject(seed.layers)) next.layers = { ...next.layers, ...seed.layers };

  // Une amorce peut nommer un préréglage : il pose les couches et le mode.
  if (typeof seed.preset === 'string') {
    const preset = getPreset(seed.preset);
    if (preset) {
      Object.assign(next, preset.apply(next));
      next.preset = preset.id;
    }
  }

  return next;
}

/** L'état de l'entraînement (§25), à part du reste (§42). */
export function createPracticeState() {
  return {
    active: false,
    challenge: null,
    phase: 'predict',
    answer: '',
    attempts: 0,
    hintsUsed: 0,
    solved: 0,
    seen: 0,
  };
}

/**
 * La relecture d'un document — la frontière avec le JSON stocké.
 *
 * Tout ce qui vient du serveur est SUSPECT : un document écrit par une
 * version antérieure, tronqué, ou bricolé à la main. Rien n'est cru sur
 * parole ; chaque champ est borné ou remplacé. Un `data` entièrement vide
 * rend un document neuf plutôt qu'un écran cassé.
 */
export function normalizeTrigonometryData(raw) {
  if (!isPlainObject(raw)) return createTrigonometryData();

  const layers = {};
  for (const key of LAYER_KEYS) {
    layers[key] = readBoolean(raw.layers?.[key], DEFAULT_LAYERS[key]);
  }

  const triangleRaw = isPlainObject(raw.triangle) ? raw.triangle : {};
  const triangle = {
    given: readEnum(triangleRaw.given, TRIANGLE_GIVENS, 'angle-hyp'),
    // L'angle d'un triangle rectangle est AIGU : on le borne ici, pas plus loin.
    angle: readNumber(triangleRaw.angle, 30, 1, 89),
    opposite: readNumber(triangleRaw.opposite, 5, MIN_SIDE, MAX_SIDE),
    adjacent: readNumber(triangleRaw.adjacent, 8, MIN_SIDE, MAX_SIDE),
    hypotenuse: readNumber(triangleRaw.hypotenuse, 10, MIN_SIDE, MAX_SIDE),
  };

  const compareRaw = isPlainObject(raw.compare) ? raw.compare : {};
  const inverseRaw = isPlainObject(raw.inverse) ? raw.inverse : null;
  const practiceRaw = isPlainObject(raw.practice) ? raw.practice : {};

  return {
    mode: readEnum(raw.mode, MODES, 'triangle'),
    angle: readNumber(raw.angle, DEFAULT_ANGLE, MIN_ANGLE, MAX_ANGLE),
    radius: readNumber(raw.radius, 1, MIN_RADIUS, MAX_RADIUS),
    unit: readEnum(raw.unit, UNITS, 'deg'),
    valueMode: readEnum(raw.valueMode, VALUE_MODES, 'exact'),
    compare: {
      enabled: readBoolean(compareRaw.enabled, false),
      angle: readNumber(compareRaw.angle, 150, MIN_ANGLE, MAX_ANGLE),
    },
    triangle,
    inverse: inverseRaw && RATIOS.includes(inverseRaw.ratio)
      // arctan accepte tout ℝ ; arcsin et arccos vivent dans [−1, 1] (§24).
      ? {
        ratio: inverseRaw.ratio,
        value: readNumber(inverseRaw.value, 0.5, inverseRaw.ratio === 'tan' ? -20 : -1, inverseRaw.ratio === 'tan' ? 20 : 1),
      }
      : null,
    symmetry: SYMMETRIES.includes(raw.symmetry) ? raw.symmetry : null,
    highlight: RATIOS.includes(raw.highlight) ? raw.highlight : null,
    layers,
    practice: {
      ...createPracticeState(),
      // On ne garde que le SCORE : une question à moitié répondue hier
      // n'a aucun sens aujourd'hui, et la relancer serait une intrusion (§25).
      solved: readNumber(practiceRaw.solved, 0, 0, 100000),
      seen: readNumber(practiceRaw.seen, 0, 0, 100000),
    },
    preset: typeof raw.preset === 'string' && getPreset(raw.preset) ? raw.preset : null,
  };
}

/**
 * Ce qui part au serveur.
 *
 * L'animation, la question courante, le panneau ouvert n'y sont pas : §43
 * (« Do not persist unnecessary transient animation state ») est tenu ici.
 * Le document pèse ~700 octets — d'où les 8 Ko accordés côté serveur.
 */
export function serializeTrigonometryData(data) {
  return {
    mode: data.mode,
    angle: round(data.angle, 4),
    radius: round(data.radius, 3),
    unit: data.unit,
    valueMode: data.valueMode,
    compare: { enabled: data.compare.enabled, angle: round(data.compare.angle, 4) },
    triangle: {
      given: data.triangle.given,
      angle: round(data.triangle.angle, 3),
      opposite: round(data.triangle.opposite, 3),
      adjacent: round(data.triangle.adjacent, 3),
      hypotenuse: round(data.triangle.hypotenuse, 3),
    },
    inverse: data.inverse ? { ratio: data.inverse.ratio, value: round(data.inverse.value, 4) } : null,
    symmetry: data.symmetry,
    highlight: data.highlight,
    layers: { ...data.layers },
    practice: { solved: data.practice.solved, seen: data.practice.seen },
    preset: data.preset,
  };
}

function round(value, decimals) {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** decimals;

  return Math.round(value * factor) / factor;
}

// ── Les transitions (pures : un état entre, un état sort) ─────────────────

/** Poser l'angle, borné. Le préréglage courant tombe : l'élève a repris la main. */
export function setAngle(data, degrees) {
  const angle = readNumber(degrees, data.angle, MIN_ANGLE, MAX_ANGLE);
  if (angle === data.angle) return data;

  return { ...data, angle };
}

/**
 * Faire tourner de `delta` degrés (§4 : ±1°, ±5°, ±15°, ±π/12, ±π/4).
 *
 * L'angle n'est PAS normalisé : passer 360° en avançant de 15° est
 * exactement ce que §14 veut rendre visible. Il est seulement borné.
 */
export function nudgeAngle(data, delta) {
  return setAngle(data, data.angle + delta);
}

/** Ramener l'angle dans [0, 360[ — le geste de §15, explicite et réversible. */
export function normalizeAngle(data) {
  const angle = normalizeDegrees(data.angle);

  return angle === data.angle ? data : { ...data, angle };
}

export function setRadius(data, radius) {
  return { ...data, radius: readNumber(radius, data.radius, MIN_RADIUS, MAX_RADIUS) };
}

export function setMode(data, mode) {
  if (!MODES.includes(mode) || mode === data.mode) return data;

  // Le triangle a besoin de sa couche ; le cercle la rend facultative.
  const layers = mode === 'triangle' ? { ...data.layers, triangle: true } : data.layers;

  return { ...data, mode, layers };
}

export function setUnit(data, unit) {
  return UNITS.includes(unit) ? { ...data, unit } : data;
}

export function setValueMode(data, valueMode) {
  return VALUE_MODES.includes(valueMode) ? { ...data, valueMode } : data;
}

export function toggleLayer(data, key) {
  if (!LAYER_KEYS.includes(key)) return data;

  return { ...data, layers: { ...data.layers, [key]: !data.layers[key] } };
}

export function setHighlight(data, ratio) {
  const next = RATIOS.includes(ratio) && data.highlight !== ratio ? ratio : null;

  return { ...data, highlight: next };
}

export function setSymmetry(data, kind) {
  const next = SYMMETRIES.includes(kind) && data.symmetry !== kind ? kind : null;

  return { ...data, symmetry: next };
}

export function setCompare(data, patch) {
  const compare = { ...data.compare, ...patch };

  return {
    ...data,
    compare: {
      enabled: readBoolean(compare.enabled, false),
      angle: readNumber(compare.angle, data.compare.angle, MIN_ANGLE, MAX_ANGLE),
    },
  };
}

/** Le mode réciproque (§24) : on l'ouvre sur un rapport, on le referme en le rappelant. */
export function setInverse(data, ratio, value) {
  if (ratio === null) return { ...data, inverse: null };
  if (!RATIOS.includes(ratio)) return data;
  const bound = ratio === 'tan' ? 20 : 1;
  const current = data.inverse?.ratio === ratio ? data.inverse.value : (ratio === 'tan' ? 1 : 0.5);

  return { ...data, inverse: { ratio, value: readNumber(value, current, -bound, bound) } };
}

/** Une donnée du triangle (§9) : bornée selon ce qu'elle est. */
export function setTriangleValue(data, key, value) {
  if (key === 'given') {
    return TRIANGLE_GIVENS.includes(value)
      ? { ...data, triangle: { ...data.triangle, given: value } }
      : data;
  }
  if (!['angle', 'opposite', 'adjacent', 'hypotenuse'].includes(key)) return data;
  const bounded = key === 'angle'
    ? readNumber(value, data.triangle.angle, 1, 89)
    : readNumber(value, data.triangle[key], MIN_SIDE, MAX_SIDE);

  return { ...data, triangle: { ...data.triangle, [key]: bounded } };
}

/** Appliquer un préréglage (§27) : il CONFIGURE l'espace, il ne remplace pas le document. */
export function applyPreset(data, id) {
  const preset = getPreset(id);
  if (!preset) return data;

  return { ...data, ...preset.apply(data), preset: id };
}
