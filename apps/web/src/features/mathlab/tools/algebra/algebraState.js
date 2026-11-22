/**
 * L'ÉTAT du مختبر الجبر — logique pure, sans React.
 *
 * V2 (2026-09-30) : le laboratoire a six SECTIONS (المعادلات، المتراجحات،
 * الأنظمة، تبسيط التعابير، التحليل إلى عوامل، الدوال). Le niveau SUPÉRIEUR du
 * document reste exactement le format V1 ci-dessous — c'est la section
 * « المعادلات » — pour qu'un document enregistré avant V2 se rouvre tel quel.
 * Chaque nouvelle section a son sous-objet (`inequalities`, `systems`,
 * `simplify`, `factor`, `functions`) et `section` dit laquelle est affichée.
 *
 *     data = {
 *       source:  '2x + 3 = 11',     // la saisie d'origine, telle qu'écrite
 *       steps:   [ { equation, operation | null, flipped } , … ],
 *       cursor:  number,            // le pas AFFICHÉ — d'où viennent تراجع / إعادة
 *       showSolution: boolean,
 *       parameters:   { a, b, c } | null,   // le panneau ax + b = c, s'il est ouvert
 *       numberLine:   { center, span }      // la droite graduée d'une inégalité
 *     }
 *
 * `steps[0]` est l'équation de départ (operation: null) ; chaque opération
 * empile un pas. Le document ne garde donc pas un état courant mais un
 * CHEMIN — l'historique de §21 et l'annulation de §22 sont le même objet, et
 * « تراجع » n'est qu'un curseur qui recule. Refaire une opération après un
 * retour en arrière coupe la branche abandonnée, comme partout ailleurs.
 *
 * Un rationnel est stocké `{n, d}` : du JSON pur, relisible sans code.
 * Les bornes (MAX_STEPS, la portée de la droite) tiennent le document sous
 * le plafond d'octets du serveur (MathLabTools.php).
 *
 * ALGEBRA_SCHEMA_VERSION est la version de CE format.
 */

import * as R from './rational.js';
import { parseEquation, isRelation, sameEquation, equationToText } from './equation.js';
import { DEFAULT_SYSTEM } from './systems.js';
import { FUNCTION_FAMILIES, DEFAULT_FUNCTION, normalizeCoefficient } from './functions.js';

export const ALGEBRA_SCHEMA_VERSION = 2;

export const ALGEBRA_SECTIONS = Object.freeze(['equations', 'inequalities', 'systems', 'simplify', 'factor', 'functions']);
export const SYSTEM_METHODS = Object.freeze(['substitution', 'elimination', 'graphical']);

/** La متراجحة d'ouverture de sa section : un coefficient négatif, pour que le sens se retourne. */
export const DEFAULT_INEQUALITY_SOURCE = '-2x + 3 < 9';
const DEFAULT_SIMPLIFY_SOURCE = '(x + 2)(x - 3)';
const DEFAULT_FACTOR_SOURCE = 'x^2 + 5x + 6';
/** La factorisation d'ouverture de مخبر المتوسط (scope.js). */
const MOYEN_FACTOR_SOURCE = 'x^2 + 6x + 9';

/** Le chemin des متراجحات est plus court : deux chemins doivent tenir ensemble sous le plafond. */
export const MAX_INEQUALITY_STEPS = 30;

/** Le document sérialisé reste SOUS ce budget (le serveur refuse au-delà de 20 000 octets). */
export const SIZE_BUDGET = 18_000;

const MAX_TEXT = 200;

/** Un exercice de quatrième tient en quelques pas ; au-delà, on oublie les plus anciens. */
export const MAX_STEPS = 60;

const DEFAULT_SOURCE = '2x + 3 = 11';

const OPERATION_KINDS = Object.freeze(['add', 'subtract', 'multiply', 'divide']);

/** La droite graduée : une fenêtre centrée, jamais dégénérée. */
export const NUMBER_LINE_MIN_SPAN = 2;
export const NUMBER_LINE_MAX_SPAN = 200;

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/** Un `{n, d}` stocké → un rationnel sûr, ou null. */
function normalizeRational(raw) {
  if (!isPlainObject(raw)) return null;
  const { n, d } = raw;
  if (!Number.isInteger(n) || !Number.isInteger(d) || d === 0) return null;
  if (Math.abs(n) > 1e12 || Math.abs(d) > 1e12) return null;
  try {
    return R.makeRational(n, d);
  } catch {
    return null;
  }
}

function normalizeForm(raw) {
  if (!isPlainObject(raw)) return null;
  const a = normalizeRational(raw.a);
  const b = normalizeRational(raw.b);
  if (!a || !b) return null;

  return { a, b };
}

/** Une équation stockée → sûre, ou null. */
function normalizeEquation(raw) {
  if (!isPlainObject(raw)) return null;
  const left = normalizeForm(raw.left);
  const right = normalizeForm(raw.right);
  if (!left || !right || !isRelation(raw.relation)) return null;

  return { left, right, relation: raw.relation };
}

function normalizeOperation(raw) {
  if (!isPlainObject(raw)) return null;
  if (!OPERATION_KINDS.includes(raw.kind)) return null;
  const value = normalizeRational(raw.value);
  if (!value) return null;
  if ((raw.kind === 'multiply' || raw.kind === 'divide') && R.isZero(value)) return null;

  const term = raw.term === 'x' && (raw.kind === 'add' || raw.kind === 'subtract') ? { term: 'x' } : {};

  return { kind: raw.kind, value, ...term };
}

function normalizeNumberLine(raw) {
  const source = isPlainObject(raw) ? raw : {};
  const center = Number.isFinite(source.center) ? source.center : 0;
  const span = Number.isFinite(source.span) ? source.span : 10;

  return {
    center: Math.max(-1e6, Math.min(1e6, Math.round(center * 1000) / 1000)),
    span: Math.max(NUMBER_LINE_MIN_SPAN, Math.min(NUMBER_LINE_MAX_SPAN, Math.round(span * 1000) / 1000)),
  };
}

/**
 * Le panneau de paramètres (`a·x + b = c`) : trois entiers de manuel, ou
 * null quand le panneau est fermé. `a = 0` effacerait l'inconnue — refusé.
 */
function normalizeParameters(raw) {
  if (!isPlainObject(raw)) return null;
  const read = (value, fallback) => (Number.isInteger(value) && Math.abs(value) <= 99 ? value : fallback);
  const a = read(raw.a, 2) || 2;

  return { a, b: read(raw.b, 3), c: read(raw.c, 11) };
}

/**
 * Un CHEMIN (saisie, pas, curseur…) stocké → sûr. Un pas illisible
 * interrompt la relecture : on garde le chemin jusqu'à lui, jamais un
 * historique troué qui ne raconterait plus rien.
 */
function normalizePath(raw, { defaultSource = DEFAULT_SOURCE, maxSteps = MAX_STEPS } = {}) {
  const source = isPlainObject(raw) ? raw : {};
  const steps = [];

  if (Array.isArray(source.steps)) {
    for (const rawStep of source.steps.slice(0, maxSteps)) {
      const equation = normalizeEquation(rawStep?.equation);
      if (!equation) break;
      const operation = steps.length === 0 ? null : normalizeOperation(rawStep?.operation);
      if (steps.length > 0 && !operation) break;
      steps.push({ equation, operation, flipped: rawStep?.flipped === true });
    }
  }

  const typed = typeof source.source === 'string' && source.source.trim() ? source.source : null;
  const fromDefault = steps.length === 0 && !typed;
  if (steps.length === 0) {
    const parsed = parseEquation(typed ?? defaultSource);
    const fallback = parsed.ok ? parsed.equation : parseEquation(defaultSource).equation;
    steps.push({ equation: fallback, operation: null, flipped: false });
  }

  const cursor = Number.isInteger(source.cursor) ? Math.max(0, Math.min(steps.length - 1, source.cursor)) : steps.length - 1;

  return {
    source: typed ? typed.slice(0, MAX_TEXT) : (fromDefault ? defaultSource : equationToText(steps[0].equation)),
    steps,
    cursor,
    showSolution: source.showSolution === true,
    numberLine: normalizeNumberLine(source.numberLine),
  };
}

function readText(value, fallback, max = MAX_TEXT) {
  return typeof value === 'string' && value.trim() ? value.slice(0, max) : fallback;
}

function normalizeSystems(raw) {
  const source = isPlainObject(raw) ? raw : {};

  return {
    first: readText(source.first, DEFAULT_SYSTEM.first, 120),
    second: readText(source.second, DEFAULT_SYSTEM.second, 120),
    method: SYSTEM_METHODS.includes(source.method) ? source.method : 'substitution',
  };
}

function normalizeFunctions(raw) {
  const source = isPlainObject(raw) ? raw : {};
  const family = FUNCTION_FAMILIES.includes(source.family) ? source.family : DEFAULT_FUNCTION.family;
  let a = normalizeCoefficient(source.a, 'a', DEFAULT_FUNCTION.a);
  if (family === 'quadratic' && a === 0) a = 1;
  const tableStart = Number.isFinite(source.tableStart) ? Math.max(-50, Math.min(50, Math.round(source.tableStart * 2) / 2)) : -3;
  const rawStep = Number.isFinite(source.tableStep) ? Math.round(source.tableStep * 2) / 2 : 1;
  const tableStep = rawStep === 0 ? 1 : Math.max(-10, Math.min(10, rawStep));

  return {
    family,
    a,
    b: normalizeCoefficient(source.b, 'b', DEFAULT_FUNCTION.b),
    c: normalizeCoefficient(source.c, 'c', DEFAULT_FUNCTION.c),
    tableStart,
    tableStep,
  };
}

/**
 * N'importe quel `data` → l'état V2 complet et sûr. Un document V1 (sans
 * `section`) s'ouvre sur « المعادلات », son chemin intact ; les autres
 * sections prennent leurs valeurs d'ouverture. Ne jette jamais.
 */
export function normalizeAlgebraData(raw) {
  const source = isPlainObject(raw) ? raw : {};
  const path = normalizePath(source);

  return {
    ...path,
    parameters: normalizeParameters(source.parameters),
    section: ALGEBRA_SECTIONS.includes(source.section) ? source.section : 'equations',
    inequalities: normalizePath(source.inequalities, { defaultSource: DEFAULT_INEQUALITY_SOURCE, maxSteps: MAX_INEQUALITY_STEPS }),
    systems: normalizeSystems(source.systems),
    simplify: { source: readText(source.simplify?.source, DEFAULT_SIMPLIFY_SOURCE) },
    factor: { source: readText(source.factor?.source, DEFAULT_FACTOR_SOURCE) },
    functions: normalizeFunctions(source.functions),
  };
}

/**
 * L'état d'un document neuf. Une leçon (openMathLab.js) peut l'amorcer avec
 * `{ equation: '3x - 5 = 16' }` ; une saisie illisible retombe sur
 * l'équation par défaut plutôt que d'ouvrir un document vide.
 */
export function createAlgebraData(seed = undefined, context = {}) {
  const wanted = isPlainObject(seed) && typeof seed.equation === 'string' ? seed.equation : DEFAULT_SOURCE;
  const parsed = parseEquation(wanted);
  const source = parsed.ok ? wanted : DEFAULT_SOURCE;

  return normalizeAlgebraData({
    source,
    showSolution: false,
    parameters: isPlainObject(seed) && seed.parameters === true ? { a: 2, b: 3, c: 11 } : null,
    section: isPlainObject(seed) && ALGEBRA_SECTIONS.includes(seed.section) ? seed.section : 'equations',
    // Le مخبر choisit la factorisation d'ouverture : une identité remarquable
    // au collège, pas un trinôme à « مجموع وجداء » (scope.js).
    factor: { source: context?.capabilities?.factor?.methods === 'moyen' ? MOYEN_FACTOR_SOURCE : DEFAULT_FACTOR_SOURCE },
  });
}

/** Le pas affiché. */
function currentStep(data) {
  return data.steps[data.cursor] ?? data.steps[data.steps.length - 1];
}

export function currentEquation(data) {
  return currentStep(data).equation;
}

export function canUndo(data) { return data.cursor > 0; }
export function canRedo(data) { return data.cursor < data.steps.length - 1; }

export function undo(data) {
  return canUndo(data) ? { ...data, cursor: data.cursor - 1 } : data;
}

export function redo(data) {
  return canRedo(data) ? { ...data, cursor: data.cursor + 1 } : data;
}

/**
 * Empile un pas APRÈS le pas courant : ce qui suivait est abandonné (on a
 * repris la main à cet endroit). Un pas qui ne change rien — ajouter 0,
 * multiplier par 1 — n'est pas empilé : l'historique ne raconterait rien.
 */
export function pushStep(data, equation, operation, flipped = false, maxSteps = MAX_STEPS) {
  const kept = data.steps.slice(0, data.cursor + 1);
  if (sameEquation(kept[kept.length - 1]?.equation, equation)) return data;
  const steps = [...kept, { equation, operation, flipped }];
  const overflow = Math.max(0, steps.length - maxSteps);
  const trimmed = steps.slice(overflow);

  return { ...data, steps: trimmed, cursor: trimmed.length - 1 };
}

/**
 * Repart d'une NOUVELLE équation : l'historique précédent n'a plus de sens,
 * il est remplacé. C'est ce que font « استكشاف », « معادلة جديدة » et le
 * panneau de paramètres.
 */
export function resetTo(data, equation, source) {
  return {
    ...data,
    source: typeof source === 'string' ? source.slice(0, 200) : equationToText(equation),
    steps: [{ equation, operation: null, flipped: false }],
    cursor: 0,
    showSolution: false,
  };
}

// ── V2 : les sections ─────────────────────────────────────────────────────

/** Applique `updater` au chemin d'une section, sans toucher aux autres. */
export function updatePath(data, section, updater) {
  if (section === 'inequalities') {
    const next = updater(data.inequalities);

    return next === data.inequalities ? data : { ...data, inequalities: next };
  }

  return updater(data);
}

export function setSection(data, section) {
  if (!ALGEBRA_SECTIONS.includes(section) || data.section === section) return data;

  return { ...data, section };
}

/** Remplace (fusionne) le sous-objet d'une section non-chemin. */
export function updateSection(data, key, patch) {
  return { ...data, [key]: { ...data[key], ...patch } };
}

function byteLength(value) {
  const text = JSON.stringify(value);

  return typeof TextEncoder !== 'undefined' ? new TextEncoder().encode(text).length : text.length;
}

function dropOldest(path) {
  if (path.steps.length <= 1) return path;
  const steps = path.steps.slice(1);
  steps[0] = { ...steps[0], operation: null, flipped: false };

  return { ...path, steps, cursor: Math.max(0, path.cursor - 1) };
}

/**
 * Garde le document sérialisé sous SIZE_BUDGET : au besoin, oublie les pas
 * les plus anciens du chemin le plus long (comme MAX_STEPS le fait déjà). Un
 * travail n'est jamais refusé par le serveur pour sa taille.
 */
export function enforceSizeBudget(data) {
  let current = data;
  for (let guard = 0; guard < 200 && byteLength(current) > SIZE_BUDGET; guard += 1) {
    const eq = current.steps.length;
    const ineq = current.inequalities?.steps?.length ?? 0;
    if (eq <= 1 && ineq <= 1) break;
    current = eq >= ineq
      ? { ...current, ...dropOldest(current) }
      : { ...current, inequalities: dropOldest(current.inequalities) };
  }

  return current;
}

export { byteLength as serializedBytes };
