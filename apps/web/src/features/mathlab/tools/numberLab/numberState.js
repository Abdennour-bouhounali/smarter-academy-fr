/**
 * L'ÉTAT du مختبر الأعداد — logique pure, sans React.
 *
 *     data = {
 *       mode:    'explorer' | 'place' | 'line' | 'fractions' | 'decimals' |
 *                'percent' | 'proportion' | 'divisibility' | 'primes' |
 *                'factors' | 'gcdLcm' | 'rounding' | 'operations' |
 *                'division' | 'powers' | 'order',
 *       explorer:     { value },
 *       place:        { value, decimals },
 *       line:         { view, points, denominator, snap },
 *       fractions:    { left, right, operation, model },
 *       decimals:     { value, direction },
 *       percent:      { quantity, percent, from, to, tab },
 *       proportion:   { rows },
 *       divisibility: { value },
 *       primes:       { limit, cursor, factorTree },
 *       factors:      { value, pairIndex },
 *       gcdLcm:       { a, b, method },   // method : 'differences' (défaut des NOUVEAUX documents) | 'euclid' | 'factors' | 'lists'
 *       rounding:     { value, power },
 *       operations:   { a, b, operation },
 *       division:     { a, b },                       // القسمة الإقليدية (2026-09-30)
 *       powers:       { tab, base, exponent, rule, ruleBase, m, n, scientific, root },
 *       order:        { expression },                 // أولويات العمليات — le TEXTE tapé, jamais ses pas
 *       practice:     { level, solved, attempts, hintsUsed },
 *       notes:        string[]      // ce que l'élève a gardé (§55)
 *     }
 *
 * ── Pourquoi treize sous-états et non un seul ────────────────────────────
 * §3 demande que les modes soient « modes inside one coherent laboratory »,
 * pas des outils séparés. Un seul `value` partagé serait la lecture naïve de
 * cette phrase — et elle serait fausse : l'élève qui règle 84 et 36 dans le
 * PGCD, passe au crible, puis revient, doit retrouver SES nombres. Chaque
 * mode garde donc les siens, et ce qui circule entre eux est ce que l'élève
 * ENVOIE explicitement (`sendTo`) — le geste de §46, jamais un effet de bord.
 *
 * Les fractions sont stockées `{n, d}` brutes (jamais réduites : §9), les
 * nombres en JSON pur. Rien de ce qui est transitoire — l'animation du
 * crible, la question courante, le panneau ouvert — n'a de champ ici : §43.
 *
 * NUMBER_LAB_SCHEMA_VERSION est la version de CE format.
 */

import { makeFrac, simplify, MAX_DENOMINATOR } from './fraction.js';
import { MAX_EXPLORABLE, MAX_GRID, roundTo } from './numberTheory.js';
import { frameValues } from './numberValue.js';
import { DIVISION_MAX } from './euclideanDivision.js';
import { MAX_BASE, MAX_EXPONENT as MAX_POWER_EXPONENT, MAX_ROOT, POWER_RULES } from './powers.js';
import { MAX_EXPRESSION_LENGTH } from './orderOfOperations.js';

export const NUMBER_LAB_SCHEMA_VERSION = 1;

/**
 * Les seize modes. Les treize de §3, puis les trois du 2026-09-30 (القسمة
 * الإقليدية، القوى والجذور، أولويات العمليات). L'ORDRE D'AFFICHAGE et les
 * groupes de la barre vivent dans `modeCatalog.js` ; cette liste n'est que
 * l'ensemble des modes valides.
 */
export const MODES = Object.freeze([
  'explorer', 'place', 'line', 'fractions', 'decimals', 'percent', 'proportion',
  'divisibility', 'primes', 'factors', 'gcdLcm', 'rounding', 'operations',
  'division', 'powers', 'order',
]);

const FRACTION_OPERATIONS = Object.freeze(['add', 'subtract', 'multiply', 'divide', 'compare']);
const FRACTION_MODELS = Object.freeze(['bar', 'circle', 'line']);
const ARITHMETIC_OPERATIONS = Object.freeze(['add', 'subtract', 'multiply', 'divide']);
/**
 * `differences` en TÊTE : c'est la méthode par défaut d'un NOUVEAU document
 * (demande du propriétaire, 2026-09-30). Un document existant garde la
 * méthode qu'il a enregistrée — `euclid` rouvre `euclid`.
 */
export const GCD_METHODS = Object.freeze(['differences', 'euclid', 'factors', 'lists']);
export const POWER_TABS = Object.freeze(['power', 'rules', 'scientific', 'roots']);
const MAX_SCIENTIFIC_TEXT = 32;
const PERCENT_TABS = Object.freeze(['of', 'change', 'reverse']);
const DECIMAL_DIRECTIONS = Object.freeze(['toFraction', 'toDecimal']);

/** Les bornes du laboratoire. Ce sont des limites de DESSIN, dites franchement. */
const MAX_VALUE = MAX_EXPLORABLE;
const MIN_VALUE = -MAX_EXPLORABLE;
export const MAX_PLACE_VALUE = 99_999;
const MAX_PRACTICE_LEVEL = 5;
export const MAX_NOTES = 30;
export const MAX_ROWS = 8;

/** L'ouverture : 360. Il a neuf diviseurs, trois facteurs premiers, et se
 *  divise par 2, 3, 4, 5, 6, 8, 9 et 10 — un nombre qui a quelque chose à
 *  montrer dans CHAQUE mode. C'est celui de §4, §20 et §23. */
const DEFAULT_VALUE = 360;

const isPlainObject = (v) => Boolean(v) && typeof v === 'object' && !Array.isArray(v);

/** Un nombre borné, jamais NaN ni Infinity. */
function readNumber(raw, fallback, min = MIN_VALUE, max = MAX_VALUE) {
  const value = typeof raw === 'string' ? Number(raw.replace(',', '.')) : raw;
  if (!Number.isFinite(value)) return fallback;

  return Math.min(max, Math.max(min, value));
}

/** Un ENTIER borné — la plupart des modes n'acceptent que des entiers. */
function readInteger(raw, fallback, min = MIN_VALUE, max = MAX_VALUE) {
  const value = readNumber(raw, fallback, min, max);

  return Math.trunc(value);
}

function readEnum(raw, allowed, fallback) {
  return allowed.includes(raw) ? raw : fallback;
}

function readBoolean(raw, fallback) {
  return typeof raw === 'boolean' ? raw : fallback;
}

/** Une fraction stockée → une fraction sûre, ou le repli. Non réduite (§9). */
function readFrac(raw, fallback) {
  if (!isPlainObject(raw)) return fallback;
  const frac = makeFrac(Math.trunc(raw.n), Math.trunc(raw.d));
  if (!frac || frac.d > MAX_DENOMINATOR * 100) return fallback;

  return frac;
}

/** Une fenêtre de droite graduée, jamais dégénérée. */
function readView(raw, fallback) {
  if (!isPlainObject(raw)) return fallback;
  const center = readNumber(raw.center, fallback.center, -1e9, 1e9);
  const span = readNumber(raw.span, fallback.span, MIN_SPAN, MAX_SPAN);

  return { center: roundTo(center, 8), span: roundTo(span, 8) };
}

const MIN_SPAN = 0.001;
const MAX_SPAN = 1e6;
const DEFAULT_VIEW = Object.freeze({ center: 0.5, span: 2 });

/* ── L'état de départ de chaque mode ───────────────────────────────────── */

const DEFAULTS = Object.freeze({
  explorer: { value: DEFAULT_VALUE },
  place: { value: 4582, decimals: false },
  line: {
    view: { ...DEFAULT_VIEW },
    // Deux points : §43 veut pouvoir comparer et mesurer une distance.
    points: [{ n: 1, d: 4 }, { n: 3, d: 4 }],
    denominator: 4,
    snap: true,
  },
  fractions: { left: { n: 1, d: 3 }, right: { n: 1, d: 4 }, operation: 'add', model: 'bar' },
  decimals: { value: 0.75, direction: 'toFraction' },
  percent: { quantity: 200, percent: 35, from: 200, to: 230, tab: 'of' },
  proportion: {
    rows: [{ x: 2, y: 3 }, { x: 4, y: 6 }, { x: 6, y: 9 }, { x: 8, y: 12 }],
  },
  divisibility: { value: DEFAULT_VALUE },
  primes: { limit: 100, cursor: 0, factorTree: null },
  factors: { value: 24, pairIndex: 0 },
  gcdLcm: { a: 84, b: 36, method: 'differences' },
  rounding: { value: 7.846, power: -1 },
  operations: { a: 24, b: 6, operation: 'divide' },
  division: { a: 38, b: 7 },
  powers: {
    tab: 'power', base: 2, exponent: 5, rule: 'product', ruleBase: 2, m: 3, n: 2, scientific: '0,00045', root: 72,
  },
  order: { expression: '2 × (3 + 4)^2 − 10' },
  practice: { level: 1, solved: 0, attempts: 0, hintsUsed: 0 },
});

/** L'état d'un document NEUF. `seed` vient d'une leçon (openMathLab.js). */
export function createNumberLabData(seed = null) {
  const data = {
    mode: 'explorer',
    explorer: { ...DEFAULTS.explorer },
    place: { ...DEFAULTS.place },
    line: { ...DEFAULTS.line, view: { ...DEFAULTS.line.view }, points: DEFAULTS.line.points.map((p) => ({ ...p })) },
    fractions: { ...DEFAULTS.fractions, left: { ...DEFAULTS.fractions.left }, right: { ...DEFAULTS.fractions.right } },
    decimals: { ...DEFAULTS.decimals },
    percent: { ...DEFAULTS.percent },
    proportion: { rows: DEFAULTS.proportion.rows.map((r) => ({ ...r })) },
    divisibility: { ...DEFAULTS.divisibility },
    primes: { ...DEFAULTS.primes },
    factors: { ...DEFAULTS.factors },
    gcdLcm: { ...DEFAULTS.gcdLcm },
    rounding: { ...DEFAULTS.rounding },
    operations: { ...DEFAULTS.operations },
    division: { ...DEFAULTS.division },
    powers: { ...DEFAULTS.powers },
    order: { ...DEFAULTS.order },
    practice: { ...DEFAULTS.practice },
    notes: [],
  };

  return applySeed(data, seed);
}

/**
 * L'amorce qu'une leçon transmet : un mode, un nombre, deux nombres, une
 * fraction. Tout est FACULTATIF et tout est relu par les mêmes gardes que le
 * reste — une leçon ne peut pas fabriquer un document que l'outil ne saurait
 * rouvrir.
 */
function applySeed(data, seed) {
  if (!isPlainObject(seed)) return data;
  const next = { ...data };
  if (MODES.includes(seed.mode)) next.mode = seed.mode;

  if (Number.isFinite(seed.value)) {
    const value = readNumber(seed.value, DEFAULT_VALUE);
    const integer = Math.trunc(value);
    next.explorer = { value: integer };
    next.divisibility = { value: integer };
    next.factors = { ...next.factors, value: Math.max(1, Math.abs(integer)) };
    next.rounding = { ...next.rounding, value };
    if (Math.abs(integer) <= MAX_PLACE_VALUE) next.place = { ...next.place, value: integer };
  }
  if (Number.isFinite(seed.a) && Number.isFinite(seed.b)) {
    next.gcdLcm = { ...next.gcdLcm, a: Math.abs(readInteger(seed.a, 84)) || 84, b: Math.abs(readInteger(seed.b, 36)) || 36 };
    next.operations = { ...next.operations, a: readNumber(seed.a, 24), b: readNumber(seed.b, 6) };
    next.division = {
      a: Math.abs(readInteger(seed.a, 38, -DIVISION_MAX, DIVISION_MAX)),
      b: Math.abs(readInteger(seed.b, 7, -DIVISION_MAX, DIVISION_MAX)) || 7,
    };
  }
  const expression = readExpression(seed.expression, null);
  if (expression) next.order = { expression };
  const left = readFrac(seed.fraction ?? seed.left, null);
  if (left) next.fractions = { ...next.fractions, left };
  const right = readFrac(seed.right, null);
  if (right) next.fractions = { ...next.fractions, right };
  if (Number.isFinite(seed.percent)) next.percent = { ...next.percent, percent: readNumber(seed.percent, 35, -1e6, 1e6) };
  if (Number.isFinite(seed.quantity)) next.percent = { ...next.percent, quantity: readNumber(seed.quantity, 200) };

  return next;
}

/**
 * RELIRE un document venu du serveur. Toute valeur absente, hors bornes ou
 * d'un autre type retombe sur son défaut : un document abîmé s'ouvre quand
 * même, sur quelque chose de sensé.
 */
export function normalizeNumberLabData(raw) {
  const source = isPlainObject(raw) ? raw : {};
  const base = createNumberLabData();

  const line = isPlainObject(source.line) ? source.line : {};
  const points = Array.isArray(line.points)
    ? line.points.map((p) => readFrac(p, null)).filter(Boolean).slice(0, 2)
    : [];

  const proportion = isPlainObject(source.proportion) ? source.proportion : {};
  const rows = Array.isArray(proportion.rows)
    ? proportion.rows
      .filter(isPlainObject)
      .slice(0, MAX_ROWS)
      .map((r) => ({ x: readNumber(r.x, 0, -1e9, 1e9), y: readNumber(r.y, 0, -1e9, 1e9) }))
    : base.proportion.rows;

  const primes = isPlainObject(source.primes) ? source.primes : {};
  const practice = isPlainObject(source.practice) ? source.practice : {};

  return {
    mode: readEnum(source.mode, MODES, base.mode),
    explorer: {
      value: readInteger(source.explorer?.value, base.explorer.value, MIN_VALUE, MAX_VALUE),
    },
    place: {
      value: readInteger(source.place?.value, base.place.value, -MAX_PLACE_VALUE, MAX_PLACE_VALUE),
      decimals: readBoolean(source.place?.decimals, base.place.decimals),
    },
    line: {
      view: readView(line.view, base.line.view),
      points: points.length === 2 ? points : base.line.points,
      denominator: readInteger(line.denominator, base.line.denominator, 1, 100),
      snap: readBoolean(line.snap, base.line.snap),
    },
    fractions: {
      left: readFrac(source.fractions?.left, base.fractions.left),
      right: readFrac(source.fractions?.right, base.fractions.right),
      operation: readEnum(source.fractions?.operation, FRACTION_OPERATIONS, base.fractions.operation),
      model: readEnum(source.fractions?.model, FRACTION_MODELS, base.fractions.model),
    },
    decimals: {
      value: readNumber(source.decimals?.value, base.decimals.value, -1e9, 1e9),
      direction: readEnum(source.decimals?.direction, DECIMAL_DIRECTIONS, base.decimals.direction),
    },
    percent: {
      quantity: readNumber(source.percent?.quantity, base.percent.quantity, -1e9, 1e9),
      percent: readNumber(source.percent?.percent, base.percent.percent, -1e6, 1e6),
      from: readNumber(source.percent?.from, base.percent.from, -1e9, 1e9),
      to: readNumber(source.percent?.to, base.percent.to, -1e9, 1e9),
      tab: readEnum(source.percent?.tab, PERCENT_TABS, base.percent.tab),
    },
    proportion: { rows: rows.length ? rows : base.proportion.rows },
    divisibility: {
      value: readInteger(source.divisibility?.value, base.divisibility.value, MIN_VALUE, MAX_VALUE),
    },
    primes: {
      limit: readInteger(primes.limit, base.primes.limit, 10, MAX_GRID),
      cursor: readInteger(primes.cursor, base.primes.cursor, 0, 5000),
      factorTree: normalizeTree(primes.factorTree),
    },
    factors: {
      value: readInteger(source.factors?.value, base.factors.value, 1, MAX_VALUE),
      pairIndex: readInteger(source.factors?.pairIndex, base.factors.pairIndex, 0, 5000),
    },
    gcdLcm: {
      a: readInteger(source.gcdLcm?.a, base.gcdLcm.a, 1, MAX_VALUE),
      b: readInteger(source.gcdLcm?.b, base.gcdLcm.b, 1, MAX_VALUE),
      method: readEnum(source.gcdLcm?.method, GCD_METHODS, base.gcdLcm.method),
    },
    rounding: {
      value: readNumber(source.rounding?.value, base.rounding.value, -1e9, 1e9),
      power: readInteger(source.rounding?.power, base.rounding.power, -6, 6),
    },
    operations: {
      a: readNumber(source.operations?.a, base.operations.a, -1e6, 1e6),
      b: readNumber(source.operations?.b, base.operations.b, -1e6, 1e6),
      operation: readEnum(source.operations?.operation, ARITHMETIC_OPERATIONS, base.operations.operation),
    },
    division: {
      a: readInteger(source.division?.a, base.division.a, 0, DIVISION_MAX),
      b: readInteger(source.division?.b, base.division.b, 1, DIVISION_MAX),
    },
    powers: normalizePowers(source.powers, base.powers),
    order: { expression: readExpression(source.order?.expression, base.order.expression) },
    practice: {
      level: readInteger(practice.level, base.practice.level, 1, MAX_PRACTICE_LEVEL),
      solved: readInteger(practice.solved, 0, 0, 1e6),
      attempts: readInteger(practice.attempts, 0, 0, 1e6),
      hintsUsed: readInteger(practice.hintsUsed, 0, 0, 1e6),
    },
    notes: Array.isArray(source.notes)
      ? source.notes.filter((n) => typeof n === 'string' && n.trim()).slice(0, MAX_NOTES).map((n) => n.slice(0, 200))
      : [],
  };
}

/**
 * Le TEXTE d'une expression (أولويات العمليات). On garde ce que l'élève a
 * tapé, même mal formé : l'écran lui dit où est l'erreur, il ne la corrige
 * pas en silence. Seule la longueur est bornée.
 */
function readExpression(raw, fallback) {
  if (typeof raw !== 'string') return fallback;
  const text = raw.replace(/[\r\n\t]/g, ' ').slice(0, MAX_EXPRESSION_LENGTH);

  return text.trim() ? text : fallback;
}

/** Le sous-état « القوى والجذور », relu champ par champ. */
function normalizePowers(raw, base) {
  const source = isPlainObject(raw) ? raw : {};
  const ruleBase = readInteger(source.ruleBase, base.ruleBase, -20, 20);
  const scientific = typeof source.scientific === 'string' && source.scientific.trim()
    ? source.scientific.slice(0, MAX_SCIENTIFIC_TEXT)
    : base.scientific;

  return {
    tab: readEnum(source.tab, POWER_TABS, base.tab),
    base: readInteger(source.base, base.base, -MAX_BASE, MAX_BASE),
    exponent: readInteger(source.exponent, base.exponent, -MAX_POWER_EXPONENT, MAX_POWER_EXPONENT),
    rule: readEnum(source.rule, POWER_RULES, base.rule),
    // 0 n'a pas de règle des puissances (0⁰, 0⁻¹) : on revient à 2.
    ruleBase: ruleBase === 0 ? base.ruleBase : ruleBase,
    m: readInteger(source.m, base.m, -12, 12),
    n: readInteger(source.n, base.n, -12, 12),
    scientific,
    root: readInteger(source.root, base.root, 0, MAX_ROOT),
  };
}

/**
 * L'ARBRE de factorisation de §24, relu.
 *
 *     { n, left, right }   — une feuille n'a ni left ni right
 *
 * La profondeur est bornée : un arbre venu du serveur ne peut pas faire
 * exploser la pile du composant qui le dessine.
 */
export function normalizeTree(raw, depth = 0) {
  if (!isPlainObject(raw) || depth > 24) return null;
  const n = readInteger(raw.n, 0, 1, MAX_VALUE);
  if (n < 2) return null;
  const left = normalizeTree(raw.left, depth + 1);
  const right = normalizeTree(raw.right, depth + 1);
  // Un nœud n'a de fils que s'il en a DEUX, et leur produit doit être n.
  if (left && right && left.n * right.n === n) return { n, left, right };

  return { n };
}

/** L'état SÉRIALISÉ — ce qui part au serveur. Rien de transitoire n'y entre. */
export function serializeNumberLabData(data) {
  return normalizeNumberLabData(data);
}

/* ── Les gestes ────────────────────────────────────────────────────────── */

/** Changer de mode. Rien d'autre ne bouge : chaque mode garde SES nombres. */
export function setMode(data, mode) {
  if (!MODES.includes(mode) || data.mode === mode) return data;

  return { ...data, mode };
}

/** Modifier un sous-état d'un mode, en le renormalisant. */
export function patchMode(data, mode, patch) {
  if (!MODES.includes(mode)) return data;
  const next = { ...data, [mode]: { ...data[mode], ...patch } };

  return normalizeNumberLabData(next);
}

/**
 * ENVOYER une valeur d'un mode à un autre (§46) — le seul pont entre les
 * modes, et il est toujours un GESTE de l'élève.
 *
 * C'est ce qui fait du laboratoire un tout : on explore 360, on l'envoie au
 * crible, puis à l'arbre de facteurs, puis au PGCD — sans jamais le retaper.
 */
export function sendTo(data, mode, value) {
  if (!MODES.includes(mode) || !Number.isFinite(value)) return data;
  const integer = Math.trunc(value);
  switch (mode) {
    case 'explorer':
      return { ...data, mode, explorer: { value: clampInt(integer) } };
    case 'divisibility':
      return { ...data, mode, divisibility: { value: clampInt(integer) } };
    case 'factors':
      return { ...data, mode, factors: { value: Math.max(1, Math.abs(clampInt(integer))), pairIndex: 0 } };
    case 'primes':
      return {
        ...data,
        mode,
        primes: { ...data.primes, factorTree: Math.abs(integer) >= 2 ? { n: Math.abs(clampInt(integer)) } : null },
      };
    case 'rounding':
      return { ...data, mode, rounding: { ...data.rounding, value: readNumber(value, data.rounding.value, -1e9, 1e9) } };
    case 'place':
      return Math.abs(integer) <= MAX_PLACE_VALUE
        ? { ...data, mode, place: { ...data.place, value: integer } }
        : { ...data, mode };
    case 'line': {
      const frac = makeFrac(Math.round(value * 1000), 1000);

      return frac
        ? {
          ...data,
          mode,
          line: { ...data.line, points: [simplify(frac), data.line.points[1]], view: frameValues([value, 0], { minSpan: 2 }) },
        }
        : { ...data, mode };
    }
    case 'operations':
      return { ...data, mode, operations: { ...data.operations, a: readNumber(value, data.operations.a, -1e6, 1e6) } };
    case 'division':
      return { ...data, mode, division: { ...data.division, a: Math.min(DIVISION_MAX, Math.abs(integer)) } };
    default:
      return { ...data, mode };
  }
}

/** Envoyer une FRACTION au mode fractions ou à la droite (§46). */
export function sendFracTo(data, mode, frac) {
  const safe = readFrac(frac, null);
  if (!safe) return data;
  if (mode === 'fractions') return { ...data, mode, fractions: { ...data.fractions, left: safe } };
  if (mode === 'line') {
    return {
      ...data,
      mode,
      line: { ...data.line, points: [safe, data.line.points[1]], denominator: Math.min(100, safe.d) },
    };
  }

  return data;
}

const clampInt = (n) => Math.min(MAX_VALUE, Math.max(MIN_VALUE, n));

/** Garder une découverte (§55). Le cahier reste la vraie mémoire ; ceci est un pense-bête local. */
export function addNote(data, text) {
  const clean = typeof text === 'string' ? text.trim().slice(0, 200) : '';
  if (!clean || data.notes.includes(clean)) return data;

  return { ...data, notes: [clean, ...data.notes].slice(0, MAX_NOTES) };
}

export function removeNote(data, index) {
  if (!Number.isInteger(index) || index < 0 || index >= data.notes.length) return data;

  return { ...data, notes: data.notes.filter((_, i) => i !== index) };
}

/** Compter une tentative d'entraînement (§51). Jamais de score au-delà (§56). */
export function recordAttempt(data, { solved = false, hint = false } = {}) {
  return {
    ...data,
    practice: {
      ...data.practice,
      attempts: data.practice.attempts + 1,
      solved: data.practice.solved + (solved ? 1 : 0),
      hintsUsed: data.practice.hintsUsed + (hint ? 1 : 0),
    },
  };
}

export function setPracticeLevel(data, level) {
  const next = readInteger(level, data.practice.level, 1, MAX_PRACTICE_LEVEL);

  return next === data.practice.level ? data : { ...data, practice: { ...data.practice, level: next } };
}
