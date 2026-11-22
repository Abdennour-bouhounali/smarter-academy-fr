/**
 * Les JUMLAT MU`ĀDALATAYN — جملة معادلتين من الدرجة الأولى بمجهولين —
 * logique pure, sans React.
 *
 *     a₁x + b₁y = c₁
 *     a₂x + b₂y = c₂          coefficients rationnels EXACTS
 *
 * Chaque équation est lue par l'analyseur UNIQUE (variables x et y) puis
 * réduite par le moteur de polynômes : `y = 2x - 1`, `2(x + y) = 3`,
 * `\frac{x}{2} + y = 1` sont acceptées ; `xy = 3` et `x^2 + y = 1` sont
 * refusées (`nonLinear`), `3 = 3` aussi (`noUnknown`).
 *
 * Trois verdicts, chacun avec SA phrase — jamais un faux nombre :
 *   unique    le déterminant a₁b₂ − a₂b₁ ≠ 0 : un seul couple (x ; y)
 *   none      droites parallèles distinctes
 *   infinite  la même droite
 *
 * Deux méthodes écrites pas à pas (التعويض, الجمع) aboutissent au MÊME
 * couple que `classifySystem` — c'est testé. La méthode graphique n'a besoin
 * que des droites et du cadre (`frameSystem`).
 */

import * as R from './rational.js';
import { splitRelation } from './equation.js';
import { parsePolynomialSource, expandWithSteps } from './simplify.js';
import { astToLatex } from './astLatex.js';
import {
  rangeCode, makePoly, subPoly, polyDegree, joinPieces, termBody, lcmInt,
} from './polynomial.js';

const SYSTEM_VARIABLES = Object.freeze(['x', 'y']);
export const DEFAULT_SYSTEM = Object.freeze({ first: 'x + y = 10', second: 'x - y = 2' });

// ── Lecture d'une équation ────────────────────────────────────────────────

/** `2x + 3y = 12` → `{ a, b, c }` (a·x + b·y = c), ou un refus motivé. */
export function parseLinearEquation(source) {
  const text = String(source ?? '').trim();
  if (!text) return { ok: false, error: { code: 'empty' } };
  const split = splitRelation(text);
  if (!split.ok) return { ok: false, error: split.error };
  if (split.relation !== '=') return { ok: false, error: { code: 'notEquation' } };

  try {
    const sides = [];
    for (const side of [split.left, split.right]) {
      const parsed = parsePolynomialSource(side, SYSTEM_VARIABLES);
      if (!parsed.ok) return { ok: false, error: parsed.error.code === 'empty' ? { code: 'emptySide' } : parsed.error };
      sides.push(makePoly(expandWithSteps(parsed.ast).terms));
    }
    const diff = subPoly(sides[0], sides[1]);
    if (polyDegree(diff) > 1) return { ok: false, error: { code: 'nonLinear' } };
    const coef = (name) => diff.find((t) => t.mono[name] === 1)?.coef ?? R.ZERO;
    const constant = diff.find((t) => Object.keys(t.mono).length === 0)?.coef ?? R.ZERO;
    const equation = { a: coef('x'), b: coef('y'), c: R.negate(constant) };
    if (R.isZero(equation.a) && R.isZero(equation.b)) return { ok: false, error: { code: 'noUnknown' } };

    return { ok: true, equation };
  } catch (error) {
    const code = rangeCode(error);
    if (code) return { ok: false, error: { code } };
    throw error;
  }
}

// ── L'écriture ────────────────────────────────────────────────────────────

/** `2x + 3y = 12`, `-x = 4`, `y = 5`. */
export function equationLatex({ a, b, c }) {
  const pieces = [];
  if (!R.isZero(a)) pieces.push({ negative: R.isNegative(a), body: termBody(a, { x: 1 }) });
  if (!R.isZero(b)) pieces.push({ negative: R.isNegative(b), body: termBody(b, { y: 1 }) });

  return `${joinPieces(pieces)} = ${R.toLatex(c)}`;
}

/** `k·u + m` : l'expression d'une inconnue isolée. */
export function affineLatex(k, u, m) {
  const pieces = [];
  if (!R.isZero(k)) pieces.push({ negative: R.isNegative(k), body: termBody(k, { [u]: 1 }) });
  if (!R.isZero(m) || pieces.length === 0) pieces.push({ negative: R.isNegative(m), body: R.toLatex(R.isNegative(m) ? R.negate(m) : m) });

  return joinPieces(pieces);
}

function wrap(r) {
  return R.isNegative(r) ? `\\left(${R.toLatex(r)}\\right)` : R.toLatex(r);
}

/** `a × (v)` écrit pour une substitution : `2 \times 3`, `-\left(-1\right)`, `\left(4\right)`. */
export function timesValue(coefficient, value) {
  if (R.equals(coefficient, R.ONE)) return wrap(value);
  if (R.equals(coefficient, R.makeRational(-1))) return `-${wrap(value)}`;

  return `${R.toLatex(coefficient)} \\times ${wrap(value)}`;
}

function sumLatex(parts) {
  // parts : chaînes déjà signées (« -2 \times 3 ») ; on les enchaîne proprement.
  return parts.filter(Boolean).reduce((acc, part, index) => {
    if (index === 0) return part;

    return part.startsWith('-') ? `${acc} - ${part.slice(1)}` : `${acc} + ${part}`;
  }, '');
}

export function pairLatex(x, y) {
  return `\\left(${R.toLatex(x)}\\,;\\,${R.toLatex(y)}\\right)`;
}

// ── Classification ────────────────────────────────────────────────────────

/**
 * @returns {{kind: 'unique', x: object, y: object} | {kind: 'none'|'infinite'}}
 */
export function classifySystem(e1, e2) {
  const det = R.subtract(R.multiply(e1.a, e2.b), R.multiply(e2.a, e1.b));
  if (!R.isZero(det)) {
    const x = R.divide(R.subtract(R.multiply(e1.c, e2.b), R.multiply(e2.c, e1.b)), det);
    const y = R.divide(R.subtract(R.multiply(e1.a, e2.c), R.multiply(e2.a, e1.c)), det);

    return { kind: 'unique', x, y, det };
  }
  // Déterminant nul : mêmes directions. Même droite si les trois coefficients sont proportionnels.
  const same = R.isZero(R.subtract(R.multiply(e1.a, e2.c), R.multiply(e2.a, e1.c)))
    && R.isZero(R.subtract(R.multiply(e1.b, e2.c), R.multiply(e2.b, e1.c)));

  return { kind: same ? 'infinite' : 'none', det };
}

/** Le couple vérifie-t-il l'équation ? Rend aussi les lignes de calcul. */
export function verifyInEquation(eq, x, y) {
  const value = R.add(R.multiply(eq.a, x), R.multiply(eq.b, y));
  const parts = [];
  if (!R.isZero(eq.a)) parts.push(timesValue(eq.a, x));
  if (!R.isZero(eq.b)) parts.push(timesValue(eq.b, y));

  return {
    holds: R.equals(value, eq.c),
    substituted: `${sumLatex(parts)} = ${R.toLatex(eq.c)}`,
    evaluated: `${R.toLatex(value)} = ${R.toLatex(eq.c)}`,
  };
}

// ── La méthode par substitution (التعويض) ─────────────────────────────────

const coefOf = (eq, v) => (v === 'x' ? eq.a : eq.b);
const other = (v) => (v === 'x' ? 'y' : 'x');

/** L'inconnue la plus commode à isoler : un coefficient ±1 d'abord, puis le plus petit entier. */
export function chooseIsolation(e1, e2) {
  const candidates = [[0, 'y'], [0, 'x'], [1, 'y'], [1, 'x']];
  let best = null;
  for (const [index, v] of candidates) {
    const k = coefOf(index === 0 ? e1 : e2, v);
    if (R.isZero(k)) continue;
    const abs = Math.abs(R.toNumber(k));
    const score = (abs === 1 ? 0 : 1) + (R.isInteger(k) ? 0 : 2) + abs / 1000;
    if (!best || score < best.score) best = { index, v, score };
  }

  return best;
}

/** Fin commune des deux méthodes : le verdict quand l'inconnue a disparu. */
function degenerateStep(constantLeft, right) {
  const holds = R.equals(constantLeft, right);

  return {
    step: { kind: holds ? 'infinite' : 'none', latex: `${R.toLatex(constantLeft)} = ${R.toLatex(right)}`, rules: [holds ? 'alwaysTrue' : 'impossible'] },
    kind: holds ? 'infinite' : 'none',
  };
}

export function substitutionSteps(e1, e2) {
  try {
    const equations = [e1, e2];
    const choice = chooseIsolation(e1, e2);
    const i = choice.index;
    const j = 1 - i;
    const v = choice.v;
    const u = other(v);
    const source = equations[i];
    const target = equations[j];
    const steps = [];

    // 1. Isoler v dans l'équation i : v = k·u + m.
    const kv = coefOf(source, v);
    const k = R.divide(R.negate(coefOf(source, u)), kv);
    const m = R.divide(source.c, kv);
    const isolated = affineLatex(k, u, m);
    const written = equationLatex(source);
    const isolatedLatex = `${v} = ${isolated}`;
    steps.push({
      kind: 'isolate', latex: written === isolatedLatex ? written : `${written} \\;\\Rightarrow\\; ${isolatedLatex}`, rules: ['isolate'], params: { eq: i + 1, variable: v },
      data: { index: i, v, u, equation: source, k, m, isolated },
    });

    // 2. Remplacer v dans l'équation j.
    const tu = coefOf(target, u);
    const tv = coefOf(target, v);
    const pieces = [];
    if (!R.isZero(tu)) pieces.push({ negative: R.isNegative(tu), body: termBody(tu, { [u]: 1 }) });
    if (!R.isZero(tv)) {
      const abs = R.isNegative(tv) ? R.negate(tv) : tv;
      pieces.push({ negative: R.isNegative(tv), body: `${R.equals(abs, R.ONE) ? '' : R.toLatex(abs)}\\left(${isolated}\\right)` });
    }
    steps.push({
      kind: 'substitute', latex: `${joinPieces(pieces)} = ${R.toLatex(target.c)}`, rules: ['substitute'], params: { eq: j + 1, variable: v },
      data: { index: j, v, u, equation: target, isolated },
    });

    // 3. Développer : A·u + B = c.
    const A = R.add(tu, R.multiply(tv, k));
    const B = R.multiply(tv, m);
    steps.push({ kind: 'expand', latex: `${affineLatex(A, u, B)} = ${R.toLatex(target.c)}`, rules: ['expandSimplify'], data: { u, A, B, c: target.c } });

    if (R.isZero(A)) {
      const end = degenerateStep(B, target.c);
      steps.push(end.step);

      return { kind: end.kind, steps };
    }

    // 4. Résoudre en u.
    const rhs = R.subtract(target.c, B);
    const uValue = R.divide(rhs, A);
    const solveLatex = R.equals(A, R.ONE)
      ? `${u} = ${R.toLatex(uValue)}`
      : `${termBody(A, { [u]: 1 }).replace(/^/, R.isNegative(A) ? '-' : '')} = ${R.toLatex(rhs)} \\;\\Rightarrow\\; ${u} = ${R.toLatex(uValue)}`;
    steps.push({ kind: 'solveOne', latex: solveLatex, rules: ['solveOne'], params: { variable: u }, data: { u, A, B, c: target.c, value: uValue } });

    // 5. Revenir à v.
    const vValue = R.add(R.multiply(k, uValue), m);
    const back = sumLatex([R.isZero(k) ? null : timesValue(k, uValue), R.isZero(m) ? null : R.toLatex(m)]) || '0';
    const valueLatex = R.toLatex(vValue);
    steps.push({
      kind: 'backSubstitute', latex: back === valueLatex ? `${v} = ${valueLatex}` : `${v} = ${back} = ${valueLatex}`, rules: ['backSubstitute'], params: { variable: v },
      data: { v, u, isolated, uValue, back, value: vValue },
    });

    const x = u === 'x' ? uValue : vValue;
    const y = u === 'y' ? uValue : vValue;
    steps.push({ kind: 'solution', latex: `\\left(x\\,;\\,y\\right) = ${pairLatex(x, y)}`, rules: ['solution'] });

    return { kind: 'unique', x, y, steps };
  } catch (error) {
    const code = rangeCode(error);
    if (code) return { kind: 'error', error: { code }, steps: [] };
    throw error;
  }
}

// ── La méthode par combinaison (الجمع) ────────────────────────────────────

/** Le plus petit multiple commun des dénominateurs : l'équation sans fractions. */
function clearFractions(eq) {
  const factor = [eq.a, eq.b, eq.c].reduce((l, r) => lcmInt(l, r.d), 1);
  const k = R.makeRational(factor);

  return { factor, equation: { a: R.multiply(eq.a, k), b: R.multiply(eq.b, k), c: R.multiply(eq.c, k) } };
}

function scaleEquation(eq, k) {
  return { a: R.multiply(eq.a, k), b: R.multiply(eq.b, k), c: R.multiply(eq.c, k) };
}

export function eliminationSteps(e1, e2) {
  try {
    const steps = [];
    const cleared = [e1, e2].map((eq, index) => {
      const out = clearFractions(eq);
      if (out.factor !== 1) {
        steps.push({
          kind: 'clearFractions',
          latex: `${equationLatex(out.equation)}`,
          rules: ['clearFractions'],
          params: { eq: index + 1, factor: out.factor },
          data: { index, before: eq, after: out.equation, factor: out.factor },
        });
      }

      return out.equation;
    });
    const [f1, f2] = cleared;

    // La variable à éliminer : présente dans les deux, au plus petit multiple commun.
    let best = null;
    for (const v of ['y', 'x']) {
      const p = coefOf(f1, v);
      const q = coefOf(f2, v);
      if (R.isZero(p) || R.isZero(q)) continue;
      const L = lcmInt(p.n, q.n);
      if (!best || L < best.L) best = { v, p: p.n, q: q.n, L };
    }

    const verdict = classifySystem(e1, e2);
    if (!best) {
      // Une équation ne contient déjà qu'une inconnue : rien à éliminer.
      if (verdict.kind !== 'unique') {
        steps.push({ kind: verdict.kind, latex: null, rules: [verdict.kind === 'none' ? 'parallelVerdict' : 'sameLineVerdict'] });

        return { kind: verdict.kind, steps };
      }
      steps.push({ kind: 'direct', latex: `${equationLatex(f1)} \\;;\\; ${equationLatex(f2)}`, rules: ['direct'], data: { equations: [f1, f2] } });
      steps.push({ kind: 'solution', latex: `\\left(x\\,;\\,y\\right) = ${pairLatex(verdict.x, verdict.y)}`, rules: ['solution'] });

      return { kind: 'unique', x: verdict.x, y: verdict.y, steps };
    }

    const { v, p, q, L } = best;
    const u = other(v);
    const m1 = L / Math.abs(p);
    const m2 = L / Math.abs(q);
    const subtract = Math.sign(p) === Math.sign(q);
    const g1 = scaleEquation(f1, R.makeRational(m1));
    const g2 = scaleEquation(f2, R.makeRational(m2));
    steps.push({
      kind: 'multiply',
      latex: `${equationLatex(g1)} \\qquad ${equationLatex(g2)}`,
      rules: [m1 === 1 && m2 === 1 ? 'sameCoefficients' : 'multiplyEquations'],
      params: { m1, m2, variable: v },
      data: { v, u, factors: [m1, m2], before: [f1, f2], after: [g1, g2] },
    });

    const combine = (a, b) => (subtract ? R.subtract(a, b) : R.add(a, b));
    const A = combine(coefOf(g1, u), coefOf(g2, u));
    const C = combine(g1.c, g2.c);
    steps.push({
      kind: 'combine',
      latex: `${R.isZero(A) ? '0' : termBody(A, { [u]: 1 }).replace(/^/, R.isNegative(A) ? '-' : '')} = ${R.toLatex(C)}`,
      rules: [subtract ? 'subtractEquations' : 'addEquations'],
      params: { variable: v },
      data: { v, u, subtract, equations: [g1, g2], A, C },
    });

    if (R.isZero(A)) {
      const end = degenerateStep(R.ZERO, C);
      steps.push(end.step);

      return { kind: end.kind, steps };
    }

    const uValue = R.divide(C, A);
    steps.push({ kind: 'solveOne', latex: `${u} = ${R.toLatex(uValue)}`, rules: ['solveOne'], params: { variable: u }, data: { u, A, B: R.ZERO, c: C, value: uValue } });

    // Revenir à v dans l'équation (1) telle qu'écrite.
    const kv = coefOf(e1, v);
    const known = R.multiply(coefOf(e1, u), uValue);
    const rhs = R.subtract(e1.c, known);
    const vValue = R.divide(rhs, kv);
    const left = sumLatex([R.isZero(coefOf(e1, u)) ? null : timesValue(coefOf(e1, u), uValue), termBody(kv, { [v]: 1 }).replace(/^/, R.isNegative(kv) ? '-' : '')]);
    steps.push({
      kind: 'backSubstitute',
      latex: `${left} = ${R.toLatex(e1.c)} \\;\\Rightarrow\\; ${v} = ${R.toLatex(vValue)}`,
      rules: ['backSubstituteEq'],
      params: { variable: v, eq: 1 },
      data: { v, u, equation: e1, uValue, known, kv, value: vValue },
    });

    const x = u === 'x' ? uValue : vValue;
    const y = u === 'y' ? uValue : vValue;
    steps.push({ kind: 'solution', latex: `\\left(x\\,;\\,y\\right) = ${pairLatex(x, y)}`, rules: ['solution'] });

    return { kind: 'unique', x, y, steps };
  } catch (error) {
    const code = rangeCode(error);
    if (code) return { kind: 'error', error: { code }, steps: [] };
    throw error;
  }
}

// ── La méthode graphique : le cadre ───────────────────────────────────────

/** Deux points (flottants) d'une droite a·x + b·y = c. */
export function linePoints({ a, b, c }) {
  const A = R.toNumber(a);
  const B = R.toNumber(b);
  const C = R.toNumber(c);
  if (B !== 0) return [[0, C / B], [1, (C - A) / B]];

  return [[C / A, 0], [C / A, 1]];
}

/** Les points qui comptent (intersection, points sur les axes), pour cadrer la vue. */
export function frameSystem(equations, verdict) {
  const xs = [0];
  const ys = [0];
  if (verdict?.kind === 'unique') {
    xs.push(R.toNumber(verdict.x));
    ys.push(R.toNumber(verdict.y));
  } else {
    for (const { a, b, c } of equations) {
      if (!R.isZero(b)) ys.push(R.toNumber(R.divide(c, b)));
      if (!R.isZero(a)) xs.push(R.toNumber(R.divide(c, a)));
    }
  }
  const finite = (list) => list.filter((value) => Number.isFinite(value) && Math.abs(value) < 1e4);
  const fx = finite(xs);
  const fy = finite(ys);
  let xMin = Math.min(...fx) - 3;
  let xMax = Math.max(...fx) + 3;
  let yMin = Math.min(...fy) - 3;
  let yMax = Math.max(...fy) + 3;
  const grow = (min, max) => {
    const span = max - min;
    if (span >= 8) return [min, max];
    const mid = (min + max) / 2;

    return [mid - 4, mid + 4];
  };
  [xMin, xMax] = grow(xMin, xMax);
  [yMin, yMax] = grow(yMin, yMax);

  return { xMin, xMax, yMin, yMax };
}

/** La saisie telle qu'écrite, en LaTeX (`y = 2x - 1` reste `y = 2x - 1`), ou null. */
export function sourceLatex(source) {
  const split = splitRelation(String(source ?? ''));
  if (!split.ok) return null;
  const sides = [split.left, split.right].map((side) => parsePolynomialSource(side, SYSTEM_VARIABLES));
  if (!sides.every((side) => side.ok)) return null;

  return `${astToLatex(sides[0].ast)} = ${astToLatex(sides[1].ast)}`;
}
