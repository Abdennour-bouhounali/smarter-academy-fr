/**
 * L'ANALYSE EN FACTEURS (التحليل إلى عوامل) — logique pure, sans React.
 *
 * Un polynôme à UNE lettre, à coefficients rationnels, est factorisé comme
 * au tableau, en montrant le RAISONNEMENT et pas seulement le résultat :
 *
 *   1. عامل مشترك        6x² + 9x = 3x × 2x + 3x × 3 = 3x(2x + 3)
 *   2. فرق مربعين         4x² − 9 = (2x)² − 3² = (2x − 3)(2x + 3)
 *   3. مربع تام           x² + 6x + 9 = x² + 2 × x × 3 + 3² = (x + 3)²
 *   4. مجموع وجداء        x² + 5x + 6 : deux nombres de produit 6 et de somme 5
 *                         → les couples candidats, celui qui convient → (x + 2)(x + 3)
 *   5. تفكيك الحد الأوسط  6x² + 5x + 1 = 6x² + 2x + 3x + 1 = 2x(3x + 1) + 1(3x + 1)
 *                         = (3x + 1)(2x + 1)     (méthode « ac »)
 *
 * Les étapes s'enchaînent (`2x² − 8 = 2(x² − 4) = 2(x − 2)(x + 2)`). Le
 * discriminant n'est PAS la méthode d'ouverture : il est rendu à part
 * (`discriminant`), pour un pli « طريقة المميّز » — au-delà du programme de
 * quatrième, à un clic. Δ < 0 : « لا يمكن تحليله في ℝ » ; racines
 * irrationnelles : écrites avec radical, et « pas de coefficients rationnels ».
 *
 * TOUJOURS vérifié : la factorisation est redéveloppée par le moteur de
 * polynômes et comparée à l'expression de départ (« تحقّق: بالنشر نجد … »).
 */

import * as R from './rational.js';
import { astToLatex } from './astLatex.js';
import { parsePolynomialSource, expandWithSteps, EXPRESSION_VARIABLES } from './simplify.js';
import {
  AlgebraError, rangeCode, makePoly, polyLatex, polyVariables, toCoefficients, fromCoefficients,
  trimCoefficients, contentOf, coefficientsLatex, mulPoly, powPoly, polyEquals, constantPoly,
  exactSqrtInt, divisors, termBody,
} from './polynomial.js';
import { quadraticRoots, discriminant } from './quadratic.js';

const MAX_CANDIDATES = 16;

// ── L'écriture d'une factorisation ────────────────────────────────────────

/** Un facteur à une lettre, entre parenthèses s'il est une somme : `(2x - 3)`, `x`. */
function factorBody(coefs, variable) {
  const trimmed = trimCoefficients(coefs);
  const latex = coefficientsLatex(trimmed, variable);
  const terms = trimmed.filter((c) => !R.isZero(c)).length;

  return terms > 1 ? `\\left(${latex}\\right)` : latex;
}

/**
 * `{ constant, power, factors: [{ coefs, exp }] }` → `3x\left(2x + 3\right)`,
 * `2\left(x - 2\right)\left(x + 2\right)`, `-\left(x - 1\right)^{2}`.
 */
function factorizationLatex(result, variable) {
  const { constant, power, factors } = result;
  let head = '';
  if (R.equals(constant, R.makeRational(-1))) head = '-';
  else if (!R.equals(constant, R.ONE)) head = R.toLatex(constant);
  if (power > 0) head += power === 1 ? variable : `${variable}^{${power}}`;
  const body = factors.map((factor) => {
    const inner = factorBody(factor.coefs, variable);
    if (factor.exp === 1) return inner;

    return inner.startsWith('\\left(') ? `${inner}^{${factor.exp}}` : `\\left(${inner}\\right)^{${factor.exp}}`;
  }).join('');
  // Un seul facteur, rien devant : l'expression telle quelle, sans parenthèses.
  if (!head && factors.length === 1 && factors[0].exp === 1) return coefficientsLatex(factors[0].coefs, variable);
  const latex = `${head}${body}`;
  if (!latex || latex === '-') return `${latex}1`;

  return latex;
}

/** Le polynôme qu'une factorisation représente (pour la VÉRIFICATION). */
function expandFactorization(result, variable) {
  let poly = constantPoly(result.constant);
  if (result.power > 0) poly = mulPoly(poly, makePoly([{ coef: R.ONE, mono: { [variable]: result.power } }]));
  for (const factor of result.factors) poly = mulPoly(poly, powPoly(fromCoefficients(factor.coefs, variable), factor.exp));

  return poly;
}

// ── Les méthodes du second degré (coefficients entiers, dominant > 0) ─────

const int = (r) => r.n;

/** `(2x)^{2}` ou `x^{2}` ; `3^{2}`. */
function squareOf(coefficient, variable) {
  if (variable === null) return `${coefficient}^{2}`;

  return coefficient === 1 ? `${variable}^{2}` : `\\left(${coefficient}${variable}\\right)^{2}`;
}

function linear(a, b) { return [R.makeRational(b), R.makeRational(a)]; } // a·x + b

/** Les couples d'entiers de produit `product`, dans l'ordre du tableau. */
export function integerPairs(product) {
  const pairs = [];
  for (const d of divisors(product)) {
    const e = product / d;
    if (d > Math.abs(e)) break;
    pairs.push([d, e], [-d, -e]);
  }

  return pairs;
}

/** Les couples MONTRÉS : les premiers, et toujours celui qui convient. */
function shownCandidates(candidates) {
  const shown = candidates.slice(0, MAX_CANDIDATES);
  const found = candidates.find((candidate) => candidate.ok);
  if (found && !shown.includes(found)) shown.push(found);

  return shown;
}

/**
 * Factorise un trinôme `q2·x² + q1·x + q0` (entiers, q2 > 0, contenu 1).
 * @returns {{ factors?: Array, steps: Array, status: string, roots?: Array }}
 */
function factorQuadratic(q0, q1, q2, variable) {
  const source = coefficientsLatex([q0, q1, q2].map((n) => R.makeRational(n)), variable);
  const sa = exactSqrtInt(q2);
  const sc = exactSqrtInt(Math.abs(q0));

  // 1. فرق مربعين : a²x² − c²
  if (q1 === 0 && q0 < 0 && sa !== null && sc !== null) {
    return {
      status: 'factored',
      factors: [{ coefs: linear(sa, -sc), exp: 1 }, { coefs: linear(sa, sc), exp: 1 }],
      steps: [{
        kind: 'diffSquares',
        latex: `${source} = ${squareOf(sa, variable)} - ${squareOf(sc, null)} = \\left(${coefficientsLatex(linear(sa, -sc), variable)}\\right)\\left(${coefficientsLatex(linear(sa, sc), variable)}\\right)`,
        rules: ['diffSquares'],
      }],
    };
  }

  // 2. مربع تام : a²x² ± 2acx + c²
  if (q0 > 0 && sa !== null && sc !== null && Math.abs(q1) === 2 * sa * sc) {
    const minus = q1 < 0;
    const coefs = linear(sa, minus ? -sc : sc);
    const first = sa === 1 ? variable : `${sa}${variable}`;

    return {
      status: 'factored',
      factors: [{ coefs, exp: 2 }],
      steps: [{
        kind: 'perfectSquare',
        latex: `${source} = ${squareOf(sa, variable)} ${minus ? '-' : '+'} 2 \\times ${first} \\times ${sc} + ${squareOf(sc, null)} = \\left(${coefficientsLatex(coefs, variable)}\\right)^{2}`,
        rules: [minus ? 'perfectSquareDiff' : 'perfectSquareSum'],
      }],
    };
  }

  // 3. مجموع وجداء (q2 = 1) — ou 4. تفكيك الحد الأوسط (méthode ac)
  const product = q2 * q0;
  const pairs = integerPairs(product);
  const candidates = pairs.map(([p, q]) => ({ p, q, sum: p + q, ok: p + q === q1 }));
  const found = candidates.find((candidate) => candidate.ok);

  if (q2 === 1) {
    const step = {
      kind: 'sumProduct',
      latex: null,
      rules: ['sumProduct'],
      params: { product: q0, sum: q1 },
      candidates: shownCandidates(candidates),
    };
    if (!found) return { status: 'noPair', steps: [{ ...step, rules: ['sumProductNone'] }] };
    const [small, large] = [found.p, found.q].sort((u, v) => u - v);
    const factors = [{ coefs: linear(1, small), exp: 1 }, { coefs: linear(1, large), exp: 1 }];
    step.latex = `${source} = \\left(${coefficientsLatex(factors[0].coefs, variable)}\\right)\\left(${coefficientsLatex(factors[1].coefs, variable)}\\right)`;
    step.params = { ...step.params, p: small, q: large };

    return { status: 'factored', factors, steps: [step] };
  }

  const pairStep = {
    kind: 'acPairs',
    latex: null,
    rules: [found ? 'acMethod' : 'acMethodNone'],
    params: { a: q2, c: q0, product, sum: q1 },
    candidates: shownCandidates(candidates),
  };
  if (!found) return { status: 'noPair', steps: [pairStep] };

  // ax² + mx + nx + c = g1·x(…) + g2(…) : le même facteur apparaît deux fois.
  const { p: m, q: n } = found;
  const g1 = gcdSigned(q2, m);
  const inner = linear(q2 / g1, m / g1);
  const g2 = n !== 0 ? (n * g1) / q2 : q0 / (m / g1);
  const split = `${termBody(R.makeRational(q2), { [variable]: 2 })} ${signed(m, variable)} ${signed(n, variable)} ${signedConstant(q0)}`;
  const innerLatex = `\\left(${coefficientsLatex(inner, variable)}\\right)`;
  const other = linear(g1, g2);
  const grouped = `${g1 === 1 ? '' : (g1 === -1 ? '-' : g1)}${variable}${innerLatex} ${g2 < 0 ? '-' : '+'} ${Math.abs(g2)}${innerLatex}`;
  const factors = [{ coefs: inner, exp: 1 }, { coefs: other, exp: 1 }];

  return {
    status: 'factored',
    factors,
    steps: [
      { ...pairStep, params: { ...pairStep.params, m, n } },
      {
        kind: 'acSplit',
        latex: `${source} = ${split} = ${grouped} = ${innerLatex}\\left(${coefficientsLatex(other, variable)}\\right)`,
        rules: ['acGroup'],
        params: { m, n },
      },
    ],
  };
}

/** Le PGCD de a et m, du signe de a (pour que le facteur restant commence comme ax). */
function gcdSigned(a, m) {
  let x = Math.abs(a);
  let y = Math.abs(m);
  while (y) [x, y] = [y, x % y];

  return a < 0 ? -x : x;
}

function signed(coefficient, variable) {
  const body = termBody(R.makeRational(coefficient), { [variable]: 1 });

  return `${coefficient < 0 ? '-' : '+'} ${body}`;
}

function signedConstant(value) {
  return `${value < 0 ? '-' : '+'} ${Math.abs(value)}`;
}

// ── La factorisation complète ─────────────────────────────────────────────

/**
 * @param {string} source
 * @returns {{ok: false, error: {code: string}} | {
 *   ok: true, variable: string, original: string, expanded: string,
 *   steps: Array, status: string, result: object|null, resultLatex: string|null,
 *   verification: {latex: string, holds: boolean}|null, discriminant: object|null
 * }}
 */
export function factorExpression(source) {
  const parsed = parsePolynomialSource(source, EXPRESSION_VARIABLES);
  if (!parsed.ok) return parsed;

  try {
    const original = astToLatex(parsed.ast);
    const expansion = expandWithSteps(parsed.ast);
    const poly = makePoly(expansion.terms);
    const variables = polyVariables(poly);
    if (variables.length === 0) return { ok: false, error: { code: 'constant' } };
    if (variables.length > 1) return { ok: false, error: { code: 'multivariate' } };
    const [variable] = variables;
    const coefs = toCoefficients(poly, variable);
    const expanded = polyLatex(poly);
    const steps = [];
    if (expanded !== original) steps.push({ kind: 'expand', latex: `${original} = ${expanded}`, rules: ['expandFirst'] });

    if (poly.length === 1) {
      return base({ original, expanded, variable, steps, status: 'monomial' });
    }

    // 1. Le facteur commun : le contenu (PGCD des coefficients) et la plus petite puissance.
    const content = contentOf(coefs);
    const power = coefs.findIndex((c) => !R.isZero(c));
    const reduced = coefs.slice(power).map((c) => R.divide(c, content));
    const result = { constant: content, power, factors: [] };

    if (!R.equals(content, R.ONE) || power > 0) {
      const factorLatex = factorizationLatex({ constant: content, power, factors: [] }, variable);
      const rest = coefficientsLatex(reduced, variable);
      if (R.equals(content, R.makeRational(-1)) && power === 0) {
        steps.push({ kind: 'commonFactor', latex: `${expanded} = -\\left(${rest}\\right)`, rules: ['factorMinus'], params: { factor: '-1' } });
      } else {
        const pieces = poly.map((t) => {
          const quotient = { coef: R.divide(t.coef, content), mono: { ...t.mono } };
          const exponent = (quotient.mono[variable] ?? 0) - power;
          if (exponent === 0) delete quotient.mono[variable];
          else quotient.mono[variable] = exponent;
          const body = termBody(quotient.coef, quotient.mono);
          const factorBodyLatex = R.isNegative(quotient.coef) ? `\\left(-${body}\\right)` : body;

          return `${factorLatex} \\times ${factorBodyLatex}`;
        });
        steps.push({
          kind: 'commonFactor',
          latex: `${expanded} = ${pieces.join(' + ')} = ${factorLatex}\\left(${rest}\\right)`,
          rules: ['commonFactor'],
          params: { factor: factorLatex, gcd: R.toLatex(R.isNegative(content) ? R.negate(content) : content), power },
        });
      }
    }

    const degree = reduced.length - 1;
    let status = 'factored';
    let quadraticInfo = null;

    if (degree === 1) {
      result.factors.push({ coefs: reduced, exp: 1 });
      if (steps.every((step) => step.kind === 'expand')) status = 'linear';
    } else if (degree === 2) {
      const [q0, q1, q2] = reduced.map(int);
      quadraticInfo = { a: reduced[2], b: reduced[1], c: reduced[0] };
      const outcome = factorQuadratic(q0, q1, q2, variable);
      steps.push(...outcome.steps);
      if (outcome.status === 'factored') {
        result.factors.push(...outcome.factors);
      } else {
        result.factors.push({ coefs: reduced, exp: 1 });
        const roots = quadraticRoots(reduced[2], reduced[1], reduced[0]);
        status = roots.kind === 'none' ? 'irreducibleReal' : 'irreducibleRational';
        steps.push({
          kind: status,
          latex: status === 'irreducibleReal'
            ? `\\Delta = ${R.toLatex(roots.delta)} < 0`
            : roots.roots.map((root, index) => `${variable}_{${index + 1}} = ${root.latex}`).join(' \\;;\\; '),
          rules: [status],
        });
      }
    } else if (degree > 2) {
      const outcome = factorHigher(reduced, variable);
      steps.push(...outcome.steps);
      result.factors.push(...outcome.factors);
      status = outcome.status;
    }

    if (steps.every((step) => step.kind === 'expand') && status === 'factored') status = 'nothing';

    const resultLatex = factorizationLatex(result, variable);
    const check = expandFactorization(result, variable);
    const verification = { latex: `${resultLatex} = ${polyLatex(check)}`, holds: polyEquals(check, poly) };
    if (!verification.holds) throw new AlgebraError('internal');
    if (status === 'factored') steps.push({ kind: 'result', latex: `${expanded} = ${resultLatex}`, rules: ['factorResult'] });

    return {
      ok: true,
      variable,
      original,
      expanded,
      steps,
      status,
      result,
      resultLatex,
      verification,
      discriminant: quadraticInfo ? discriminantSteps(quadraticInfo, content, power, variable) : null,
    };
  } catch (error) {
    const code = rangeCode(error);
    if (code) return { ok: false, error: { code, symbol: error.detail } };
    throw error;
  }
}

function base({ original, expanded, variable, steps, status }) {
  return {
    ok: true, variable, original, expanded, steps, status, result: null, resultLatex: null, verification: null, discriminant: null,
  };
}

/**
 * Degré > 2 après le facteur commun : seule la DIFFÉRENCE DE DEUX CARRÉS `A·x^{2m} − B`
 * (A, B carrés) est traité, puis chaque facteur du second degré à son tour.
 * Au-delà, un refus motivé : le programme s'arrête au second degré.
 */
function factorHigher(coefs, variable) {
  const degree = coefs.length - 1;
  const inner = coefs.slice(1, -1);
  const a = int(coefs[degree]);
  const b = -int(coefs[0]);
  const sa = exactSqrtInt(a);
  const sb = exactSqrtInt(b);
  if (degree % 2 === 0 && inner.every((c) => R.isZero(c)) && b > 0 && sa !== null && sb !== null) {
    const half = degree / 2;
    const make = (sign) => {
      const out = Array.from({ length: half + 1 }, () => R.ZERO);
      out[0] = R.makeRational(sign * sb);
      out[half] = R.makeRational(sa);

      return out;
    };
    const minus = make(-1);
    const plus = make(1);
    const power = `${sa === 1 ? '' : sa}${variable}^{${half}}`;
    const steps = [{
      kind: 'diffSquares',
      latex: `${coefficientsLatex(coefs, variable)} = \\left(${power}\\right)^{2} - ${sb}^{2} = \\left(${coefficientsLatex(minus, variable)}\\right)\\left(${coefficientsLatex(plus, variable)}\\right)`,
      rules: ['diffSquares'],
    }];
    const factors = [];
    for (const piece of [minus, plus]) {
      if (piece.length - 1 === 2) {
        const [q0, q1, q2] = piece.map(int);
        const outcome = factorQuadratic(q0, q1, q2, variable);
        if (outcome.status === 'factored') {
          steps.push(...outcome.steps);
          factors.push(...outcome.factors);
          continue;
        }
      }
      factors.push({ coefs: piece, exp: 1 });
    }

    return { status: 'factored', factors, steps };
  }

  return {
    status: 'degreeTooHigh',
    factors: [{ coefs, exp: 1 }],
    steps: [{ kind: 'degreeTooHigh', latex: null, rules: ['degreeTooHigh'], params: { degree } }],
  };
}

/**
 * La méthode du مميّز, pour le pli secondaire : Δ, les racines, et
 * `a(x − x₁)(x − x₂)` quand elles sont rationnelles.
 */
function discriminantSteps({ a, b, c }, content, power, variable) {
  const delta = discriminant(a, b, c);
  const roots = quadraticRoots(a, b, c);
  const wrap = (r) => (R.isNegative(r) ? `\\left(${R.toLatex(r)}\\right)` : R.toLatex(r));
  const lines = [
    `\\Delta = b^{2} - 4ac = ${wrap(b)}^{2} - 4 \\times ${wrap(a)} \\times ${wrap(c)} = ${R.toLatex(delta)}`,
  ];
  if (roots.kind === 'double') lines.push(`${variable}_{0} = -\\frac{b}{2a} = ${roots.roots[0].latex}`);
  if (roots.kind === 'two') {
    lines.push(`${variable}_{1} = \\frac{-b - \\sqrt{\\Delta}}{2a} = ${roots.roots[0].latex} \\;;\\; ${variable}_{2} = \\frac{-b + \\sqrt{\\Delta}}{2a} = ${roots.roots[1].latex}`);
  }
  let factored = null;
  if (roots.rational && roots.kind !== 'none') {
    const outerRaw = factorizationLatex({ constant: R.multiply(content, a), power, factors: [] }, variable);
    const outer = outerRaw === '-1' ? '-' : outerRaw;
    const factorOf = (root) => `\\left(${coefficientsLatex([R.negate(root.value), R.ONE], variable)}\\right)`;
    factored = roots.kind === 'double'
      ? `${outer === '1' ? '' : outer}${factorOf(roots.roots[0])}^{2}`
      : `${outer === '1' ? '' : outer}${roots.roots.map(factorOf).join('')}`;
  }

  return {
    trinomial: coefficientsLatex([c, b, a], variable),
    sign: R.sign(delta),
    deltaLatex: R.toLatex(delta),
    lines,
    kind: roots.kind,
    rational: roots.rational,
    factored,
  };
}
