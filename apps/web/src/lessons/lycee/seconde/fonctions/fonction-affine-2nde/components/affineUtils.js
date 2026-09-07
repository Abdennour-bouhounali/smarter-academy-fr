/**
 * affineUtils — le modèle mathématique de « Fonction affine » (2nde).
 *
 * UNE FONCTION AFFINE est `{ a, b }` : f(x) = ax + b. Tout est dérivé :
 * l'image, le taux d'accroissement entre deux points (toujours égal à a),
 * le zéro −b/a, le sens de variation (signe de a), le tableau de signes, la
 * fonction définie par deux points, la résolution de f(x) = k et f(x) > k.
 *
 * Situation portée : LE RÉSERVOIR — volume V(t) = a·t + b (litres) après t
 * minutes, a = débit du robinet (L/min, négatif si on vide), b = volume au
 * départ. Rien n'est écrit à la main dans un module : `formatAffine` (core)
 * écrit les expressions, les nombres restent exacts.
 */
import { roundTo, formatDec, formatAffine as coreFormatAffine, slopeBetween, affineFromTwoPoints } from '@smarter-academy/core';

export { formatDec, parseDec, roundTo } from '@smarter-academy/core';

export const affine = (a, b) => ({ a, b });
export const imageOf = (f, x) => roundTo(f.a * x + f.b, 9);
/** Taux d'accroissement entre x₁ et x₂ (x₁ ≠ x₂) : (f(x₂) − f(x₁)) / (x₂ − x₁) — vaut toujours a. */
export function rate(f, x1, x2) {
  if (x1 === x2) return null;
  return roundTo((imageOf(f, x2) - imageOf(f, x1)) / (x2 - x1), 9);
}
export const rateBetween = (p, q) => (p.x === q.x ? null : roundTo(slopeBetween(p, q), 9));
/** La fonction affine passant par deux points d'abscisses distinctes, ou null. */
export function fromTwoPoints(p, q) {
  if (p.x === q.x) return null;
  const r = affineFromTwoPoints(p, q);
  return affine(roundTo(r.a, 9), roundTo(r.b, 9));
}
/** Une table x → y est-elle affine ? (accroissements proportionnels) */
export function isAffineTable(rows) {
  if (rows.length < 2) return true;
  const r0 = rateBetween(rows[0], rows[1]);
  return rows.every((p, i) => i === 0 || Math.abs(rateBetween(rows[0], p) - r0) < 1e-9);
}
export const zeroOf = (f) => (f.a === 0 ? null : roundTo(-f.b / f.a, 9));
export const variationOf = (f) => (f.a > 0 ? 'croissante' : f.a < 0 ? 'decroissante' : 'constante');
/** Signe de f(x) : '+' | '−' | '0'. */
export function signAt(f, x) { const y = imageOf(f, x); return Math.abs(y) < 1e-12 ? '0' : y > 0 ? '+' : '−'; }
/** Tableau de signes : { zero, before, after } (before/after = signes avant/après le zéro). */
export function signTable(f) {
  const z = zeroOf(f);
  if (z === null) return { zero: null, before: signAt(f, 0), after: signAt(f, 0) };
  const sa = f.a > 0 ? '+' : '−';
  return { zero: z, before: sa === '+' ? '−' : '+', after: sa };
}
/** Solution de f(x) = k. */
export const solveEq = (f, k) => (f.a === 0 ? (f.b === k ? 'tous' : null) : roundTo((k - f.b) / f.a, 9));
/**
 * Solutions de f(x) > k (rel '>' | '<' | '>=' | '<=') : { a, b, openA, openB } (null = infini).
 * a > 0 : f(x) > k ⟺ x > x₀ ; a < 0 : f(x) > k ⟺ x < x₀.
 */
export function solveIneq(f, k, rel) {
  const x0 = solveEq(f, k);
  if (x0 === null || x0 === 'tous') return null;
  const strict = rel === '>' || rel === '<';
  const wantsAbove = rel === '>' || rel === '>=';
  const right = (f.a > 0) === wantsAbove;
  return right ? { a: x0, b: null, openA: strict, openB: true } : { a: null, b: x0, openA: true, openB: strict };
}
export function intervalText(I) {
  const lo = I.a === null ? ']−∞' : `${I.openA ? ']' : '['}${formatDec(I.a)}`;
  const hi = I.b === null ? '+∞[' : `${formatDec(I.b)}${I.openB ? '[' : ']'}`;
  return `${lo} ; ${hi}`;
}

/* ── Écritures ───────────────────────────────────────────────────────── */
/** « f(x) = 2x + 1 », en LaTeX, via le formateur partagé (jamais « 0x » ni « 0.5 »). */
export const affineTex = (f, { name = 'f', variable = 'x' } = {}) => coreFormatAffine(f.a, f.b, { name, variable });
/** « 2x + 1 » en texte DOM (moins typographique, virgule). */
export function affineText(f, variable = 'x') {
  const fd = (v) => formatDec(v);
  const ax = f.a === 0 ? '' : f.a === 1 ? variable : f.a === -1 ? `−${variable}` : `${fd(f.a)}${variable}`;
  if (!ax) return fd(f.b);
  if (f.b === 0) return ax;
  return `${ax} ${f.b < 0 ? '−' : '+'} ${fd(Math.abs(f.b))}`;
}
export const coupleText = (x, y) => `(${formatDec(x)} ; ${formatDec(y)})`;

/* ── Le réservoir et les autres constantes ─────────────────────────────── */
export const TANK = { capacity: 40, tMax: 10, aMin: -4, aMax: 4, aStep: 0.5, bMin: 0, bMax: 30, bStep: 1 };
export const TANK_RANGE = { xMin: 0, xMax: 10, yMin: -10, yMax: 40 };
/** M2 — la table non affine (une parabole) contre une table affine. */
export const TABLE_AFFINE = [{ x: 0, y: 3 }, { x: 1, y: 5 }, { x: 2, y: 7 }, { x: 4, y: 11 }];
export const TABLE_NON_AFFINE = [{ x: 0, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 5 }, { x: 4, y: 17 }];
/** M4 — deux points pour retrouver la fonction. */
export const POINTS4 = [{ x: 1, y: 5 }, { x: 4, y: 11 }];       // a = 2, b = 3
export const G5 = affine(-3, 6);                                 // M5 : g(x) = −3x + 6
export const F5 = affine(2, -4);                                 // M5 : f(x) = 2x − 4
