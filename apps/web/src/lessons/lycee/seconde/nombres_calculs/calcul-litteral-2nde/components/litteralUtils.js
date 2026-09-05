import { formatDec, parseDec, roundTo } from '@smarter-academy/core';

/**
 * litteralUtils — le modèle mathématique de la leçon « Calcul littéral »
 * (2nde). Un POLYNÔME est un tableau de coefficients par degré :
 * [c0, c1, c2, …] pour c0 + c1x + c2x². Tout ce qui est affiché (chaîne du
 * tour de magie, cartes de termes, aires du carré, facteur commun, tableau
 * de valeurs) DÉRIVE de ces fonctions pures.
 */
export { formatDec, parseDec, roundTo };

const trim = (p) => { const q = [...p]; while (q.length > 1 && q[q.length - 1] === 0) q.pop(); return q; };
export const poly = (...coeffs) => trim(coeffs.map((c) => roundTo(c, 9)));
export const X = poly(0, 1);
export const constant = (k) => poly(k);
export const degree = (p) => trim(p).length - 1;

export function add(p, q) {
  const n = Math.max(p.length, q.length);
  return poly(...Array.from({ length: n }, (_, i) => (p[i] ?? 0) + (q[i] ?? 0)));
}
export const sub = (p, q) => add(p, q.map((c) => -c));
export function mul(p, q) {
  const out = Array(p.length + q.length - 1).fill(0);
  p.forEach((a, i) => q.forEach((b, j) => { out[i + j] += a * b; }));
  return poly(...out);
}
export const scale = (p, k) => poly(...p.map((c) => c * k));
export const evaluate = (p, x) => roundTo(p.reduce((s, c, i) => s + c * x ** i, 0), 9);
export const samePoly = (p, q) => { const a = trim(p); const b = trim(q); return a.length === b.length && a.every((c, i) => Math.abs(c - b[i]) < 1e-9); };

/** « 2x² − 5x + 7 », « −x », « 3 », « 0 ». */
export function formatPoly(p, v = 'x') {
  const t = trim(p);
  const parts = [];
  for (let i = t.length - 1; i >= 0; i -= 1) {
    const c = t[i];
    if (c === 0) continue;
    const abs = Math.abs(c);
    const coef = i === 0 ? formatDec(abs) : abs === 1 ? '' : formatDec(abs);
    const mono = i === 0 ? '' : i === 1 ? v : `${v}${i === 2 ? '²' : i === 3 ? '³' : `^${i}`}`;
    const sign = c < 0 ? '−' : '+';
    parts.push(parts.length === 0 ? `${c < 0 ? '−' : ''}${coef}${mono}` : ` ${sign} ${coef}${mono}`);
  }
  return parts.length ? parts.join('') : '0';
}
export const texPoly = (p, v = 'x') => formatPoly(p, v).replace(/−/g, '-').replace(/,/g, '{,}').replace(/²/g, '^{2}').replace(/³/g, '^{3}');

/** Les termes d'un polynôme, un par degré non nul : { degree, coef }. */
export const termsOf = (p) => trim(p).map((coef, deg) => ({ degree: deg, coef })).filter((t) => t.coef !== 0);
export const monomial = (coef, deg) => poly(...Array(deg).fill(0), coef);
export const formatTerm = (t, v = 'x') => formatPoly(monomial(t.coef, t.degree), v);

/* ── Programmes de calcul (tour de magie) ─────────────────────────────── */
/** Un pas : { op: 'add' | 'sub' | 'mul' | 'div' | 'square' | 'subx' | 'subsquarex', k? }. */
export function applyStep(p, step) {
  switch (step.op) {
    case 'add': return add(p, constant(step.k));
    case 'sub': return sub(p, constant(step.k));
    case 'mul': return scale(p, step.k);
    case 'div': return scale(p, 1 / step.k);
    case 'square': return mul(p, p);
    case 'subx': return sub(p, X);
    case 'subsquarex': return sub(p, mul(X, X));
    default: return p;
  }
}
/** La chaîne symbolique : le polynôme après chaque pas (index 0 = x). */
export function symbolicChain(steps) {
  const out = [X];
  for (const s of steps) out.push(applyStep(out[out.length - 1], s));
  return out;
}
/** La chaîne numérique pour une valeur de départ. */
export const numericChain = (steps, x) => symbolicChain(steps).map((p) => evaluate(p, x));
export function stepLabel(step) {
  switch (step.op) {
    case 'add': return `+ ${formatDec(step.k)}`;
    case 'sub': return `− ${formatDec(step.k)}`;
    case 'mul': return `× ${formatDec(step.k)}`;
    case 'div': return `÷ ${formatDec(step.k)}`;
    case 'square': return '( )²';
    case 'subx': return '− le nombre';
    case 'subsquarex': return '− le carré du nombre';
    default: return '';
  }
}

/* ── Identités ─────────────────────────────────────────────────────────── */
export const squarePieces = (a, b) => ({ a2: a * a, ab: a * b, b2: b * b, total: (a + b) ** 2 });

/* ── Factoriser ────────────────────────────────────────────────────────── */
export function gcd(a, b) { let x = Math.abs(a); let y = Math.abs(b); while (y) [x, y] = [y, x % y]; return x; }
/** Divise p par le monôme k·x^d si possible (renvoie null sinon). */
export function divideByMonomial(p, k, d) {
  const t = trim(p);
  if (t.length - 1 < d || k === 0) return null;
  for (let i = 0; i < d; i += 1) if (t[i] !== 0) return null;
  const q = t.slice(d).map((c) => c / k);
  if (q.some((c) => !Number.isInteger(roundTo(c, 9)))) return null;
  return poly(...q);
}
/** Le plus grand monôme commun k·x^d des termes (k = pgcd des coefficients entiers). */
export function commonMonomial(p) {
  const ts = termsOf(p);
  if (!ts.length) return { k: 0, d: 0 };
  const g = ts.reduce((acc, t) => gcd(acc, Math.round(Math.abs(t.coef))), 0);
  const d = Math.min(...ts.map((t) => t.degree));
  return { k: g, d };
}
/** a² − b² reconnu : renvoie { a, b } pour p = a²x² − b² (a, b entiers > 0), sinon null. */
export function asDifferenceOfSquares(p) {
  const t = trim(p);
  if (t.length !== 3 || t[1] !== 0 || t[2] <= 0 || t[0] >= 0) return null;
  const a = Math.sqrt(t[2]); const b = Math.sqrt(-t[0]);
  return Number.isInteger(a) && Number.isInteger(b) ? { a, b } : null;
}
/** (ax + b)² reconnu : renvoie { a, b } (b peut être négatif), sinon null. */
export function asPerfectSquare(p) {
  const t = trim(p);
  if (t.length !== 3 || t[2] <= 0 || t[0] < 0) return null;
  const a = Math.sqrt(t[2]); const b = Math.sqrt(t[0]) * (t[1] < 0 ? -1 : 1);
  if (!Number.isInteger(a) || !Number.isInteger(Math.abs(b))) return null;
  return roundTo(2 * a * b, 9) === t[1] ? { a, b } : null;
}
