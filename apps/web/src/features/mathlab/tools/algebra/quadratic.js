/**
 * Le SECOND DEGRÉ exact — logique pure, sans React.
 *
 * Partagé par « التحليل إلى عوامل » (la méthode du مميّز, un clic plus loin)
 * et « الدوال » (racines, sommet) : `ax² + bx + c` à coefficients rationnels,
 * racines EXACTES — rationnelles quand Δ est un carré, sinon écrites avec un
 * radical simplifié (`\frac{-5 - \sqrt{13}}{2}`), jamais `−4,302775637…`
 * présenté comme la valeur. La valeur approchée n'existe que pour DESSINER.
 */

import * as R from './rational.js';
import { exactSqrtRational, simplifySqrt, gcdInt, lcmInt } from './polynomial.js';

/** Δ = b² − 4ac, exact. */
export function discriminant(a, b, c) {
  return R.subtract(R.multiply(b, b), R.multiply(R.makeRational(4), R.multiply(a, c)));
}

/**
 * `(P ± Q√m) / D` écrit comme le manuel. `sign` vaut −1 ou +1.
 * P, Q, D entiers, D > 0, Q > 0.
 */
function radicalLatex(P, Q, D, m, sign) {
  const radical = `${Q === 1 ? '' : Q}\\sqrt{${m}}`;
  if (P === 0) {
    const body = D === 1 ? radical : `\\frac{${radical}}{${D}}`;

    return sign < 0 ? `-${body}` : body;
  }
  const numerator = `${P} ${sign < 0 ? '-' : '+'} ${radical}`;

  return D === 1 ? numerator : `\\frac{${numerator}}{${D}}`;
}

/**
 * Les racines de `ax² + bx + c` (a ≠ 0).
 *
 * @returns {{
 *   delta: object, kind: 'two'|'double'|'none', rational: boolean,
 *   roots: Array<{ value: object|null, approx: number, latex: string }>
 * }}  racines dans l'ordre croissant
 */
export function quadraticRoots(a, b, c) {
  if (R.isZero(a)) throw new RangeError('notQuadratic');
  const delta = discriminant(a, b, c);
  const twoA = R.multiply(R.makeRational(2), a);
  const p = R.divide(R.negate(b), twoA);

  if (R.isNegative(delta)) return { delta, kind: 'none', rational: false, roots: [] };
  if (R.isZero(delta)) {
    return { delta, kind: 'double', rational: true, roots: [{ value: p, approx: R.toNumber(p), latex: R.toLatex(p) }] };
  }

  const exact = exactSqrtRational(delta);
  if (exact) {
    const shift = R.divide(exact, twoA);
    const roots = [R.subtract(p, shift), R.add(p, shift)]
      .sort((u, v) => R.toNumber(u) - R.toNumber(v))
      .map((value) => ({ value, approx: R.toNumber(value), latex: R.toLatex(value) }));

    return { delta, kind: 'two', rational: true, roots };
  }

  // √Δ = k√m ; racine = p ± q√m avec q = |k / 2a|.
  const { k, m } = simplifySqrt(delta);
  const qRaw = R.divide(k, twoA);
  const q = R.isNegative(qRaw) ? R.negate(qRaw) : qRaw;
  const D = lcmInt(p.d, q.d);
  let P = (p.n * D) / p.d;
  let Q = (q.n * D) / q.d;
  let Dn = D;
  const g = gcdInt(gcdInt(P, Q), Dn) || 1;
  P /= g;
  Q /= g;
  Dn /= g;
  const root = Math.sqrt(m) * R.toNumber(q);
  const roots = [
    { value: null, approx: R.toNumber(p) - root, latex: radicalLatex(P, Q, Dn, m, -1) },
    { value: null, approx: R.toNumber(p) + root, latex: radicalLatex(P, Q, Dn, m, +1) },
  ];

  return { delta, kind: 'two', rational: false, roots };
}

/** Le sommet de la parabole : `(−b/2a ; f(−b/2a))`. */
export function vertexOf(a, b, c) {
  const x = R.divide(R.negate(b), R.multiply(R.makeRational(2), a));
  const y = R.add(R.add(R.multiply(a, R.multiply(x, x)), R.multiply(b, x)), c);

  return { x, y };
}
