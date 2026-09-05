/**
 * modelUtils — la mathématique de la modélisation (3e), sans aucun pixel.
 *
 * UN MODÈLE EST UN OBJET, PAS UNE LISTE DE VALEURS :
 *
 *   Model =
 *     | { kind: 'proportional', k }            y = k · x
 *     | { kind: 'affine', a, b }               y = a · x + b
 *     | { kind: 'square', c }                  y = c · x²
 *     | { kind: 'custom', fn, label }          autre dépendance
 *     | { kind: 'none' }                       « aucun modèle simple »
 *
 * Tableau, courbe, expression, prévision et écart aux données sont tous
 * DÉRIVÉS du même modèle par `evaluate` : la vue « tableau » et la vue
 * « graphique » ne peuvent pas se contredire.
 *
 * UN MODÈLE DOIT ÊTRE D'ACCORD AVEC TOUTES LES DONNÉES : `residual` mesure
 * l'écart total entre un modèle et des points ; `agreesWithAll` ne tolère
 * qu'un arrondi ; `bestModel` choisit le candidat d'écart minimal (et
 * renvoie `none` s'il reste un écart notable).
 *
 * UN MODÈLE A DES LIMITES : `capped` applique un plafond, `inDomain`
 * vérifie le domaine de validité, `interpretResult` traduit une valeur
 * calculée en réponse contextuelle (entier attendu, borne, rejet).
 *
 * NE PAS ARRONDIR LA MATHÉMATIQUE : 9 décimales dans les calculs, `formatDec`
 * pour l'affichage.
 */
import { formatDec, parseDec, roundTo, formatAffine, intersectionOfAffine, affineFromTwoPoints } from '@smarter-academy/core';

export { formatDec, parseDec, roundTo, formatAffine, intersectionOfAffine, affineFromTwoPoints };

const r9 = (v) => roundTo(v, 9);

export const proportional = (k) => ({ kind: 'proportional', k });
export const affine = (a, b) => ({ kind: 'affine', a, b });
export const square = (c = 1) => ({ kind: 'square', c });
export const custom = (fn, label) => ({ kind: 'custom', fn, label });
export const none = () => ({ kind: 'none' });

/** Évalue le modèle en x. Le point de passage unique. */
export function evaluate(model, x) {
  switch (model.kind) {
    case 'proportional': return r9(model.k * x);
    case 'affine': return r9(model.a * x + model.b);
    case 'square': return r9(model.c * x * x);
    case 'custom': return r9(model.fn(x));
    case 'none': return null;
    default: throw new Error(`evaluate: modèle inconnu « ${model.kind} »`);
  }
}

/** Le tableau de valeurs d'un modèle. */
export const tableOf = (model, xs) => xs.map((x) => ({ x, y: evaluate(model, x) }));

/** L'écart total |modèle − donnée| sur des points ; Infinity pour `none`. */
export function residual(model, points) {
  if (model.kind === 'none') return Infinity;
  return r9(points.reduce((s, p) => s + Math.abs(evaluate(model, p.x) - p.y), 0));
}

/** Les verdicts point par point : { x, y, model, ok }. */
export function verdicts(model, points, tol = 0.005) {
  return points.map((p) => {
    const m = model.kind === 'none' ? null : evaluate(model, p.x);
    return { x: p.x, y: p.y, model: m, ok: m !== null && Math.abs(m - p.y) <= tol };
  });
}

/** Le modèle est-il d'accord avec TOUS les points (à l'arrondi près) ? */
export const agreesWithAll = (model, points, tol = 0.005) => verdicts(model, points, tol).every((v) => v.ok);

/**
 * Le meilleur candidat : écart minimal. Si même le meilleur reste au-dessus
 * de `tol` par point, la réponse est « aucun modèle simple » — c'est une
 * conclusion légitime, pas un échec.
 */
export function bestModel(candidates, points, tol = 0.005) {
  let best = null;
  for (const c of candidates) {
    const r = residual(c, points);
    if (best === null || r < best.residual) best = { model: c, residual: r };
  }
  if (!best || best.residual > tol * points.length) return { model: none(), residual: best ? best.residual : Infinity };
  return best;
}

/** Le modèle affine (ou proportionnel) passant par deux points. */
export function fitAffine(p, q) {
  const f = affineFromTwoPoints(p, q);
  if (!f) return null;
  return Math.abs(f.b) < 1e-9 ? proportional(r9(f.a)) : affine(r9(f.a), r9(f.b));
}

/** Écriture littérale d'un modèle : « 0,15 × t + 1 », « 3 × n », « c² ». */
export function formatModel(model, { variable = 'x', name = null } = {}) {
  const lhs = name ? `${name}(${variable}) = ` : '';
  switch (model.kind) {
    case 'proportional': return `${lhs}${formatAffine(model.k, 0, { variable })}`.replace(/^.*?= /, lhs);
    case 'affine': return `${lhs}${formatAffine(model.a, model.b, { variable })}`.replace(/^.*?= /, lhs);
    case 'square': return `${lhs}${model.c === 1 ? '' : `${formatDec(model.c).replace(',', '{,}')} \\times `}${variable}^2`;
    case 'custom': return `${lhs}${model.label ?? '?'}`;
    default: return 'aucun modèle simple';
  }
}

/* ── Limites et interprétation ─────────────────────────────────────── */

/** Un modèle plafonné : y = min(modèle, cap). */
export const capped = (model, cap) => custom((x) => Math.min(evaluate(model, x), cap), `min(…, ${formatDec(cap)})`);

/** x est-il dans le domaine de validité [min, max] ? */
export const inDomain = (x, { min = -Infinity, max = Infinity } = {}) => x >= min && x <= max;

/**
 * Traduit une valeur calculée en réponse de situation.
 *   { kind: 'exact' }            la valeur convient telle quelle
 *   { kind: 'ceil' | 'floor' }   un entier est attendu (« dès la 7e séance »)
 *   { kind: 'reject', reason }   valeur impossible (négative, hors domaine)
 */
export function interpretResult(value, { integer = false, min = -Infinity, max = Infinity, roundUp = true, unit = '' } = {}) {
  if (!Number.isFinite(value)) return { kind: 'reject', reason: 'valeur non définie' };
  if (value < min) return { kind: 'reject', value, reason: `${formatDec(value)}${unit} est en dessous de ${formatDec(min)}${unit} : impossible dans la situation` };
  if (value > max) return { kind: 'reject', value, reason: `${formatDec(value)}${unit} dépasse ${formatDec(max)}${unit} : hors du domaine du modèle` };
  if (integer && !Number.isInteger(value)) {
    const v = roundUp ? Math.ceil(value) : Math.floor(value);
    return { kind: roundUp ? 'ceil' : 'floor', value: v, raw: value };
  }
  return { kind: 'exact', value };
}

/** Le seuil où deux modèles affines se rejoignent (x de l'intersection), ou null. */
export function breakEven(m1, m2) {
  const f = toAffine(m1);
  const g = toAffine(m2);
  if (!f || !g) return null;
  const p = intersectionOfAffine(f, g);
  return p ? r9(p.x) : null;
}

const toAffine = (m) => (m.kind === 'affine' ? { a: m.a, b: m.b } : m.kind === 'proportional' ? { a: m.k, b: 0 } : null);

/** Le moins cher parmi des modèles en x — TOUS en cas d'égalité. */
export function cheapest(models, x) {
  const vals = models.map((m) => evaluate(m, x));
  const min = Math.min(...vals);
  return models.filter((_, i) => Math.abs(vals[i] - min) < 1e-9);
}

/** Un résultat est-il d'un ordre de grandeur raisonnable ? */
export function magnitudeOk(value, expected, factor = 3) {
  if (expected === 0) return Math.abs(value) < 1e-9;
  const q = value / expected;
  return q > 0 && q <= factor && q >= 1 / factor;
}

/* ── Expressions assemblées par cartes ─────────────────────────────── */

/**
 * Transforme une suite de cartes (« 1 », « + », « 0,15 », « × », « t ») en
 * fonction de la variable, avec la priorité de × sur + et −. Renvoie null si
 * la suite est mal formée (deux opérateurs de suite, opérateur en bout…).
 * Deux écritures équivalentes (« 1 + 0,15 × t » et « 0,15 × t + 1 ») donnent
 * la même fonction : c'est `sameFunction` qui compare, sur plusieurs valeurs.
 */
export function parseTokens(tokens, variable = 'x') {
  if (!tokens.length) return null;
  const isOp = (t) => t === '+' || t === '−' || t === '-' || t === '×';
  const value = (t) => (t === variable ? (x) => x : Number.isFinite(parseDec(t)) ? () => parseDec(t) : null);
  // terme = facteur (× facteur)* ; expression = terme ((+|−) terme)*
  const terms = [];
  let sign = 1;
  let cur = null;
  let expectOperand = true;
  for (const t of tokens) {
    if (expectOperand) {
      const v = value(t);
      if (!v) return null;
      cur = cur ? ((f, g) => (x) => f(x) * g(x))(cur, v) : v;
      expectOperand = false;
    } else {
      if (!isOp(t)) return null;
      if (t === '×') { expectOperand = true; continue; }
      terms.push({ sign, fn: cur });
      sign = t === '+' ? 1 : -1;
      cur = null;
      expectOperand = true;
    }
  }
  if (expectOperand) return null;
  terms.push({ sign, fn: cur });
  return (x) => r9(terms.reduce((s, term) => s + term.sign * term.fn(x), 0));
}

/** Deux fonctions coïncident-elles sur un jeu de valeurs ? */
export function sameFunction(f, g, xs = [0, 1, 2, 5, 10], tol = 1e-6) {
  if (!f || !g) return false;
  return xs.every((x) => Math.abs(f(x) - g(x)) <= tol);
}

/* ── Données ───────────────────────────────────────────────────────── */

/** Trie les cartes d'information : utiles / inutiles, d'après leur drapeau. */
export const sortData = (items) => ({ useful: items.filter((i) => i.useful), useless: items.filter((i) => !i.useful) });

/** Étendue « ronde » et pas pour un repère qui contient des points et 0. */
const NICE = [0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
export function niceStep(span, maxTicks = 10) {
  for (const s of NICE) if (span / s <= maxTicks) return s;
  return NICE[NICE.length - 1];
}
export function planeFor(points, { maxTicks = 8, width = 320, height = 220 } = {}) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const xHi = Math.max(0, ...xs);
  const yHi = Math.max(0, ...ys);
  const xStep = niceStep(Math.max(xHi, 1), maxTicks);
  const yStep = niceStep(Math.max(yHi, 1), maxTicks);
  const xMax = (Math.floor(xHi / xStep) + 1) * xStep;
  const yMax = (Math.floor(yHi / yStep) + 1) * yStep;
  return { range: { xMin: 0, xMax, yMin: 0, yMax }, xStep, yStep, unit: r9(width / xMax), unitY: r9(height / yMax) };
}
