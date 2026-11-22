/**
 * Les FONCTIONS — linéaires, affines et du second degré — logique pure.
 *
 *     linéaire    f(x) = a·x
 *     affine      f(x) = a·x + b
 *     second degré f(x) = a·x² + b·x + c
 *
 * Les coefficients viennent de curseurs au pas de 0,5 : ce sont des nombres
 * DÉCIMAUX exacts, lus en rationnels (2,5 = 5/2). Tout ce que l'écran
 * affiche — ordonnée à l'origine, racines, sommet, axe, tableau de valeurs —
 * est calculé exactement ; le flottant ne sert qu'à dessiner.
 */

import * as R from './rational.js';
import { fromCoefficients, polyLatex } from './polynomial.js';
import { quadraticRoots, vertexOf } from './quadratic.js';

export const FUNCTION_FAMILIES = Object.freeze(['linear', 'affine', 'quadratic']);
export const COEFFICIENT_STEP = 0.5;
export const COEFFICIENT_RANGE = Object.freeze({ a: [-5, 5], b: [-10, 10], c: [-10, 10] });
export const DEFAULT_FUNCTION = Object.freeze({ family: 'affine', a: 2, b: 1, c: 0 });
export const TABLE_SIZE = 7;

/** Un coefficient stocké → un multiple de 0,5 dans sa plage. */
export function normalizeCoefficient(value, key, fallback) {
  const [min, max] = COEFFICIENT_RANGE[key];
  if (!Number.isFinite(value)) return fallback;
  const snapped = Math.round(value / COEFFICIENT_STEP) * COEFFICIENT_STEP;

  return Math.max(min, Math.min(max, snapped));
}

/**
 * La fonction exacte d'une famille et de ses coefficients (nombres).
 * Linéaire : b = c = 0 ; affine : c = 0 ; second degré : a ≠ 0 (sinon ce
 * n'est plus une parabole — a = 0 est remplacé par 1).
 */
export function makeFunction(family, { a, b, c }) {
  const kind = FUNCTION_FAMILIES.includes(family) ? family : 'affine';
  const A = R.fromNumber(kind === 'quadratic' && a === 0 ? 1 : a);
  const B = R.fromNumber(kind === 'linear' ? 0 : b);
  const C = R.fromNumber(kind === 'quadratic' ? c : 0);
  // coefs[i] : coefficient de x^i
  const coefs = kind === 'quadratic' ? [C, B, A] : [B, A];

  return { family: kind, a: A, b: B, c: C, coefs };
}

export function functionLatex(fn) {
  return `f(x) = ${polyLatex(fromCoefficients(fn.coefs, 'x'))}`;
}

function evaluate(fn, x) {
  let acc = R.ZERO;
  for (let i = fn.coefs.length - 1; i >= 0; i -= 1) acc = R.add(R.multiply(acc, x), fn.coefs[i]);

  return acc;
}

export function evaluateNumber(fn, x) {
  let acc = 0;
  for (let i = fn.coefs.length - 1; i >= 0; i -= 1) acc = acc * x + R.toNumber(fn.coefs[i]);

  return acc;
}

/**
 * Ce qu'on LIT sur la courbe.
 * @returns {{
 *   yIntercept: {x: object, y: object},
 *   roots: Array<{value: object|null, approx: number, latex: string}>, rootsKind: string,
 *   vertex?: {x: object, y: object}, opening?: 'up'|'down',
 *   slope?: object, monotony: 'increasing'|'decreasing'|'constant'|'decreasingThenIncreasing'|'increasingThenDecreasing',
 *   delta?: object
 * }}
 */
export function analyseFunction(fn) {
  const yIntercept = { x: R.ZERO, y: evaluate(fn, R.ZERO) };

  if (fn.family === 'quadratic') {
    const roots = quadraticRoots(fn.a, fn.b, fn.c);
    const up = !R.isNegative(fn.a);

    return {
      yIntercept,
      roots: roots.roots,
      rootsKind: roots.kind,
      delta: roots.delta,
      vertex: vertexOf(fn.a, fn.b, fn.c),
      opening: up ? 'up' : 'down',
      monotony: up ? 'decreasingThenIncreasing' : 'increasingThenDecreasing',
    };
  }

  const { a, b } = fn;
  let roots = [];
  let rootsKind = 'one';
  if (R.isZero(a)) rootsKind = R.isZero(b) ? 'all' : 'none';
  else {
    const value = R.divide(R.negate(b), a);
    roots = [{ value, approx: R.toNumber(value), latex: R.toLatex(value) }];
  }

  return {
    yIntercept,
    roots,
    rootsKind,
    slope: a,
    monotony: R.sign(a) > 0 ? 'increasing' : (R.sign(a) < 0 ? 'decreasing' : 'constant'),
  };
}

/** Le tableau de valeurs : `count` abscisses à partir de `start`, au pas `step`. */
export function valueTable(fn, start, step, count = TABLE_SIZE) {
  const s = R.fromNumber(Number.isFinite(start) ? start : -3);
  const h = R.fromNumber(Number.isFinite(step) && step !== 0 ? step : 1);
  const rows = [];
  for (let i = 0; i < count; i += 1) {
    const x = R.add(s, R.multiply(h, R.makeRational(i)));
    rows.push({ x, y: evaluate(fn, x) });
  }

  return rows;
}

/** Un cadre qui montre les points qui comptent : ordonnée à l'origine, racines, sommet, triangle de pente. */
export function frameFunction(fn) {
  const info = analyseFunction(fn);
  const xs = [0, 1];
  const ys = [0, R.toNumber(info.yIntercept.y)];
  for (const root of info.roots) xs.push(root.approx);
  if (info.vertex) {
    const vx = R.toNumber(info.vertex.x);
    xs.push(vx - 2.5, vx + 2.5);
    ys.push(R.toNumber(info.vertex.y), evaluateNumber(fn, vx + 2.5));
  } else {
    ys.push(evaluateNumber(fn, 1));
  }
  const finite = (list) => list.filter((value) => Number.isFinite(value)).map((value) => Math.max(-60, Math.min(60, value)));
  let xMin = Math.min(...finite(xs)) - 2;
  let xMax = Math.max(...finite(xs)) + 2;
  let yMin = Math.min(...finite(ys)) - 2;
  let yMax = Math.max(...finite(ys)) + 2;
  if (xMax - xMin < 8) { const m = (xMin + xMax) / 2; xMin = m - 4; xMax = m + 4; }
  if (yMax - yMin < 8) { const m = (yMin + yMax) / 2; yMin = m - 4; yMax = m + 4; }

  return { xMin, xMax, yMin, yMax };
}
