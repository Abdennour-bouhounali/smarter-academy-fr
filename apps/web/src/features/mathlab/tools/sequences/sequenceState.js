/**
 * L'ÉTAT du labo des suites — logique pure, sans React (§46).
 *
 *     data = {
 *       primary:   SequenceSpec,          // la suite étudiée
 *       secondary: SequenceSpec | null,   // celle qu'on lui compare (§33)
 *       count:     number,                // combien de termes engendrés (§4)
 *       cursor:    number,                // l'indice MIS EN AVANT (§6, §7)
 *       probe:     number,                // l'indice lointain inspecté (§12)
 *       layers:    { …bascules… },        // §30-style
 *       view:      Viewport | null,       // la fenêtre du graphe (§19)
 *       cobwebView:Viewport | null,       // celle de la toile (§9)
 *       practice:  { solved, seen },      // §27 — le SCORE seulement
 *       preset:    string | null,         // §39
 *     }
 *
 * ── La frontière (§42, §48) ──────────────────────────────────────────────
 * Elle est celle de la PERSISTANCE : ce qui mérite d'être retrouvé demain est
 * ici et part au serveur ; ce qui ne vit que le temps d'un geste — l'animation
 * en cours, sa vitesse, le panneau ouvert, la question d'entraînement
 * courante, l'expérience ouverte — vit dans le composant et n'a AUCUN champ
 * ici. « Do not persist transient animation state » est donc tenu par
 * construction : l'animation n'a pas d'endroit où s'écrire.
 *
 * Une exception assumée : `cursor`. C'est l'indice mis en avant, pas une
 * étape d'animation — un élève qui a marché jusqu'à u₇ et revient demain
 * doit retrouver u₇ en avant, comme il retrouverait son angle dans le
 * labo de trigonométrie.
 *
 * SEQUENCES_SCHEMA_VERSION est la version de CE format.
 */

import { DEFAULT_LAYERS, LAYER_KEYS } from './layers.js';
import { getPreset } from './presets.js';
import { SEQUENCE_KINDS, MAX_TERMS, MAX_ITERATIONS } from './sequenceMath.js';

export { DEFAULT_LAYERS, LAYER_KEYS };

export const SEQUENCES_SCHEMA_VERSION = 1;

/** Le nombre de termes affichés. Dix suffisent à voir un comportement (§4). */
export const MIN_COUNT = 2;
export const MAX_COUNT = MAX_TERMS;
export const DEFAULT_COUNT = 10;

/** Les bornes des paramètres. Assez larges pour explorer, assez serrées pour rester lisible. */
export const MIN_PARAM = -1000;
export const MAX_PARAM = 1000;

/** Le curseur de raison de §5 et §25 : q ∈ [−2, 2], le domaine que §25 nomme. */
export const RATIO_SLIDER_MIN = -2;
export const RATIO_SLIDER_MAX = 2;

/** L'indice lointain qu'on peut inspecter (§12 : 10, 100, 1000, 10000). */
export const MAX_PROBE = MAX_ITERATIONS;

/** Les paliers que §12 propose d'un clic. */
export const PROBE_STEPS = Object.freeze([10, 100, 1000, 10000]);

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

/**
 * Un nombre borné, ou la valeur de repli — jamais NaN, jamais Infinity.
 * Accepte la virgule décimale : un élève écrit « 1,5 ».
 */
function readNumber(raw, fallback, min, max) {
  const value = typeof raw === 'string' ? Number(raw.replace(',', '.')) : raw;
  if (!Number.isFinite(value)) return fallback;

  return Math.min(max, Math.max(min, value));
}

function readInteger(raw, fallback, min, max) {
  return Math.round(readNumber(raw, fallback, min, max));
}

function readEnum(raw, allowed, fallback) {
  return allowed.includes(raw) ? raw : fallback;
}

function readBoolean(raw, fallback) {
  return typeof raw === 'boolean' ? raw : fallback;
}

function readSource(raw, fallback) {
  // Une expression est du TEXTE, borné : 200 caractères tiennent n'importe
  // quelle règle de collège et empêchent un document de gonfler.
  return typeof raw === 'string' && raw.length <= 200 ? raw : fallback;
}

/**
 * ── LA SPÉCIFICATION d'une suite, telle qu'elle est ENREGISTRÉE ────────
 *
 * C'est du JSON pur : des nombres et des chaînes. Les FONCTIONS (l'explicite
 * compilée, la règle compilée) n'y sont pas — elles sont recalculées à
 * l'ouverture par `sequenceModel.js`. Une fonction ne se sérialise pas, et
 * en stocker une serait la porte ouverte à exécuter du code venu de la base.
 *
 * Tous les champs coexistent quelle que soit la famille : changer de famille
 * ne doit pas EFFACER ce que l'élève avait réglé dans l'autre. Il revient à
 * « géométrique » et retrouve sa raison — c'est ce que §4 attend d'un espace
 * d'exploration.
 *
 * @typedef {object} SequenceSpec
 * @property {string} kind
 * @property {number} startIndex     0 ou 1 (§4)
 * @property {number} first          u(startIndex)
 * @property {number} second         u(startIndex+1), au second ordre
 * @property {number} difference     r
 * @property {number} ratio          q
 * @property {number} a @property {number} b
 * @property {string} explicitSource la règle explicite, texte
 * @property {string} ruleSource     la règle de récurrence, texte
 */
export function createSpec(patch = {}) {
  return {
    kind: readEnum(patch.kind, SEQUENCE_KINDS, 'arithmetic'),
    startIndex: patch.startIndex === 1 ? 1 : 0,
    first: readNumber(patch.first, 2, MIN_PARAM, MAX_PARAM),
    second: readNumber(patch.second, 1, MIN_PARAM, MAX_PARAM),
    difference: readNumber(patch.difference, 3, MIN_PARAM, MAX_PARAM),
    ratio: readNumber(patch.ratio, 2, MIN_PARAM, MAX_PARAM),
    a: readNumber(patch.a, 2, MIN_PARAM, MAX_PARAM),
    b: readNumber(patch.b, 1, MIN_PARAM, MAX_PARAM),
    explicitSource: readSource(patch.explicitSource, '2n + 1'),
    ruleSource: readSource(patch.ruleSource, '2u - 1'),
  };
}

/**
 * Le document d'ouverture : une suite ARITHMÉTIQUE, u₀ = 2, r = 3.
 *
 * ── Pourquoi celle-là (§5h.1 de MATH_LAB.md) ─────────────────────────────
 * Les suites ne sont pas au programme du collège ; leur seul ancrage
 * authentique y est « différences successives » (LP 2.1, la leçon du PGCD). La
 * règle de la plateforme — appliquée au produit scalaire (§5f.10) puis au
 * cercle trigonométrique (§5g.1) — veut que ce qui dépasse le programme ne
 * prenne jamais le premier écran.
 *
 * L'instrument ouvre donc sur la suite arithmétique 2, 5, 8, 11… avec ses
 * différences AFFICHÉES : l'élève de 3e y reconnaît le geste de son manuel.
 * La toile d'araignée, les points fixes, la convergence — tout le lycée —
 * existent, complets, à une bascule de là.
 *
 * Ni 0 ni 1 pour u₀ et r : avec u₀ = 0, r = 1 on obtient 0, 1, 2, 3… et on
 * ne distingue plus l'indice du terme, si bien que rien ne s'apprend. 2 et 3
 * donnent 2, 5, 8, 11 — où l'on voit tout de suite que « +3 » n'est pas « n ».
 */
export function createSequencesData(seed) {
  const base = {
    primary: createSpec({ kind: 'arithmetic', startIndex: 0, first: 2, difference: 3 }),
    secondary: null,
    count: DEFAULT_COUNT,
    cursor: 0,
    probe: 100,
    layers: { ...DEFAULT_LAYERS },
    view: null,
    cobwebView: null,
    practice: createPracticeState(),
    preset: null,
  };

  if (!isPlainObject(seed)) return base;

  return normalizeSequencesData(applySeed(base, seed));
}

/**
 * L'amorce qu'une leçon transmet (openMathLab.js). Le contrat est publié par
 * LESSON_DEVELOPMENT_GUIDE.md ; une amorce illisible ne casse rien — on
 * retombe sur le document par défaut, comme pour les vecteurs et les trigonométrie.
 */
function applySeed(base, seed) {
  const next = { ...base };

  if (isPlainObject(seed.primary)) next.primary = createSpec({ ...base.primary, ...seed.primary });
  if (isPlainObject(seed.secondary)) next.secondary = createSpec(seed.secondary);
  if (Number.isFinite(seed.count)) next.count = seed.count;
  if (Number.isFinite(seed.cursor)) next.cursor = seed.cursor;
  if (isPlainObject(seed.layers)) next.layers = { ...next.layers, ...seed.layers };

  // Une amorce peut nommer un préréglage : il pose les couches et la famille.
  if (typeof seed.preset === 'string') {
    const preset = getPreset(seed.preset);
    if (preset) {
      Object.assign(next, preset.apply(next));
      next.preset = preset.id;
    }
  }

  return next;
}

/** L'état de l'entraînement (§27), à part du reste (§42). */
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
    // La révélation : 'answer' (après une réponse juste, entière) ou
    // 'request' (« Voir la solution », pas à pas) ; `revealPending` demande de poser la
    // suite dans l'espace, `revealPosed` dit qu'elle l'a été.
    revealMode: null,
    revealPending: false,
    revealPosed: false,
  };
}

/** Une fenêtre enregistrée, ou `null`. La validation fine est dans viewport.js. */
function readView(raw) {
  if (!isPlainObject(raw)) return null;
  const { xMin, xMax, yMin, yMax } = raw;
  const ok = [xMin, xMax, yMin, yMax].every(Number.isFinite) && xMax > xMin && yMax > yMin;

  return ok ? { xMin, xMax, yMin, yMax } : null;
}

/**
 * La relecture d'un document — la frontière avec le JSON stocké.
 *
 * Tout ce qui vient du serveur est SUSPECT : un document écrit par une
 * version antérieure, tronqué, ou bricolé à la main. Rien n'est cru sur
 * parole ; chaque champ est borné ou remplacé. Un `data` vide rend un
 * document neuf plutôt qu'un écran cassé.
 */
export function normalizeSequencesData(raw) {
  if (!isPlainObject(raw)) return createSequencesData();

  const layers = {};
  for (const key of LAYER_KEYS) {
    layers[key] = readBoolean(raw.layers?.[key], DEFAULT_LAYERS[key]);
  }

  const primary = createSpec(isPlainObject(raw.primary) ? raw.primary : {});
  const count = readInteger(raw.count, DEFAULT_COUNT, MIN_COUNT, MAX_COUNT);
  const practiceRaw = isPlainObject(raw.practice) ? raw.practice : {};

  return {
    primary,
    secondary: isPlainObject(raw.secondary) ? createSpec(raw.secondary) : null,
    count,
    // Le curseur vit DANS les termes engendrés : un curseur au-delà n'a pas
    // de terme à montrer, et l'interface afficherait « — » sans raison.
    cursor: readInteger(raw.cursor, primary.startIndex, primary.startIndex, primary.startIndex + count - 1),
    probe: readInteger(raw.probe, 100, 0, MAX_PROBE),
    layers,
    view: readView(raw.view),
    cobwebView: readView(raw.cobwebView),
    practice: {
      ...createPracticeState(),
      // On ne garde que le SCORE : une question à moitié répondue hier n'a
      // aucun sens aujourd'hui, et la relancer serait une intrusion (§27).
      solved: readInteger(practiceRaw.solved, 0, 0, 100000),
      seen: readInteger(practiceRaw.seen, 0, 0, 100000),
    },
    preset: typeof raw.preset === 'string' && getPreset(raw.preset) ? raw.preset : null,
  };
}

/**
 * Ce qui part au serveur.
 *
 * L'animation, la question courante, l'expérience ouverte, le panneau n'y
 * sont pas : §48 est tenu ici, et surtout dans le fait qu'ils n'ont pas de
 * champ. Le document mesuré pèse ~700 octets — d'où les 8 Ko accordés côté
 * serveur (MathLabTools.php), vérifiés par `sequenceState.test.js`.
 */
export function serializeSequencesData(data) {
  return {
    primary: serializeSpec(data.primary),
    secondary: data.secondary ? serializeSpec(data.secondary) : null,
    count: data.count,
    cursor: data.cursor,
    probe: data.probe,
    layers: { ...data.layers },
    view: data.view ? roundView(data.view) : null,
    cobwebView: data.cobwebView ? roundView(data.cobwebView) : null,
    practice: { solved: data.practice.solved, seen: data.practice.seen },
    preset: data.preset,
  };
}

function serializeSpec(spec) {
  return {
    kind: spec.kind,
    startIndex: spec.startIndex,
    first: round(spec.first, 6),
    second: round(spec.second, 6),
    difference: round(spec.difference, 6),
    ratio: round(spec.ratio, 6),
    a: round(spec.a, 6),
    b: round(spec.b, 6),
    explicitSource: spec.explicitSource,
    ruleSource: spec.ruleSource,
  };
}

function roundView(view) {
  return {
    xMin: round(view.xMin, 4), xMax: round(view.xMax, 4),
    yMin: round(view.yMin, 4), yMax: round(view.yMax, 4),
  };
}

function round(value, decimals) {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** decimals;

  return Math.round(value * factor) / factor;
}

// ── Les transitions (pures : un état entre, un état sort) ─────────────────
//
// Chacune rend le MÊME objet quand rien ne change : §48 veut que le rendu ne
// reparte pas pour rien, et l'égalité référentielle est ce qui le garantit.

/** Un paramètre de la suite étudiée (ou de la comparée). */
export function setParameter(data, key, value, target = 'primary') {
  const spec = target === 'secondary' ? data.secondary : data.primary;
  if (!spec) return data;

  let next;
  switch (key) {
    case 'kind':
      if (!SEQUENCE_KINDS.includes(value) || spec.kind === value) return data;
      next = { ...spec, kind: value };
      break;
    case 'startIndex': {
      const startIndex = value === 1 ? 1 : 0;
      if (startIndex === spec.startIndex) return data;
      next = { ...spec, startIndex };
      break;
    }
    case 'explicitSource':
    case 'ruleSource': {
      const source = readSource(value, spec[key]);
      if (source === spec[key]) return data;
      next = { ...spec, [key]: source };
      break;
    }
    case 'first': case 'second': case 'difference': case 'ratio': case 'a': case 'b': {
      const bounded = readNumber(value, spec[key], MIN_PARAM, MAX_PARAM);
      if (bounded === spec[key]) return data;
      next = { ...spec, [key]: bounded };
      break;
    }
    default:
      return data;
  }

  // Changer un paramètre, c'est reprendre la main : le préréglage tombe.
  const patch = target === 'secondary' ? { secondary: next } : { primary: next, preset: null };
  const merged = { ...data, ...patch };

  // Le curseur doit rester dans les termes : changer l'indice de départ le
  // déplace, sinon il pointerait un terme qui n'existe plus.
  return clampCursor(merged);
}

/** Le nombre de termes engendrés (§4). */
export function setCount(data, count) {
  const next = readInteger(count, data.count, MIN_COUNT, MAX_COUNT);
  if (next === data.count) return data;

  return clampCursor({ ...data, count: next });
}

/** L'indice mis en avant (§6, §7). */
export function setCursor(data, index) {
  const last = data.primary.startIndex + data.count - 1;
  const next = readInteger(index, data.cursor, data.primary.startIndex, last);
  if (next === data.cursor) return data;

  return { ...data, cursor: next };
}

/**
 * Un pas en avant (§7 « Next term »).
 *
 * Si le curseur est au bout des termes engendrés, avancer ENGENDRE un terme
 * de plus : c'est ce que §7 demande (« each click calculates exactly one
 * additional term »), et non un curseur qui bute contre une limite.
 */
export function stepForward(data) {
  const last = data.primary.startIndex + data.count - 1;
  if (data.cursor < last) return { ...data, cursor: data.cursor + 1 };
  if (data.count >= MAX_COUNT) return data;

  return { ...data, count: data.count + 1, cursor: data.cursor + 1 };
}

/** Un pas en arrière. Ne retire jamais de terme : on ne défait pas un calcul. */
export function stepBackward(data) {
  if (data.cursor <= data.primary.startIndex) return data;

  return { ...data, cursor: data.cursor - 1 };
}

/** Revenir au premier terme (§6 « reset »). */
export function resetCursor(data) {
  return data.cursor === data.primary.startIndex ? data : { ...data, cursor: data.primary.startIndex };
}

/** L'indice lointain inspecté (§12). */
export function setProbe(data, index) {
  const next = readInteger(index, data.probe, 0, MAX_PROBE);

  return next === data.probe ? data : { ...data, probe: next };
}

export function toggleLayer(data, key) {
  if (!LAYER_KEYS.includes(key)) return data;

  return { ...data, layers: { ...data.layers, [key]: !data.layers[key] } };
}

export function setView(data, view) {
  const next = readView(view);
  if (!next) return data;

  return { ...data, view: next };
}

export function setCobwebView(data, view) {
  const next = readView(view);
  if (!next) return data;

  return { ...data, cobwebView: next };
}

/**
 * La comparaison (§33) : on l'ouvre sur une COPIE de la suite étudiée,
 * dont on change un paramètre.
 *
 * Ouvrir sur une suite identique serait inutile (la différence serait nulle
 * partout) ; ouvrir sur une suite sans rapport perdrait l'élève. On décale
 * donc d'un cran ce qui caractérise la famille — la raison, la différence —
 * pour que la comparaison montre tout de suite quelque chose.
 */
export function toggleCompare(data) {
  if (data.secondary) {
    return { ...data, secondary: null, layers: { ...data.layers, compare: false } };
  }
  const spec = data.primary;
  const shifted = spec.kind === 'geometric'
    ? { ...spec, ratio: round(spec.ratio === 0 ? 0.5 : spec.ratio / 2, 6) }
    : spec.kind === 'arithmetic'
      ? { ...spec, difference: round(-spec.difference, 6) }
      : { ...spec, first: round(spec.first + 1, 6) };

  return { ...data, secondary: createSpec(shifted), layers: { ...data.layers, compare: true } };
}

/** Appliquer un préréglage (§39) : il CONFIGURE l'espace, il ne remplace pas le document. */
export function applyPreset(data, id) {
  const preset = getPreset(id);
  if (!preset) return data;
  const patch = preset.apply(data);
  const merged = { ...data, ...patch, primary: createSpec(patch.primary ?? data.primary), preset: id };

  return clampCursor({ ...merged, cursor: merged.primary.startIndex });
}

/** Appliquer une expérience (§26) : même mécanique, mais sans marquer de préréglage. */
export function applyExperimentPatch(data, experiment) {
  if (!experiment) return data;
  const patch = experiment.apply(data);
  const merged = { ...data, ...patch, primary: createSpec(patch.primary ?? data.primary), preset: null };

  return clampCursor({ ...merged, cursor: merged.primary.startIndex });
}

/** Le curseur reste toujours dans les termes engendrés. */
function clampCursor(data) {
  const start = data.primary.startIndex;
  const last = start + data.count - 1;
  const cursor = Math.min(last, Math.max(start, data.cursor));

  return cursor === data.cursor ? data : { ...data, cursor };
}

