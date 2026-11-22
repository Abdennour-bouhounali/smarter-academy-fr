/**
 * القوى والجذور — puissances, règles, écriture scientifique, racines carrées.
 * Logique pure, sans React (§60, §61).
 *
 * Tout est EXACT : les puissances passent par `bigRational.js` (BigInt), les
 * racines par la factorisation. Rien ne s'affiche jamais `1e+21`, `Infinity`
 * ou `NaN` : une puissance trop grande est REFUSÉE avec sa raison, et la
 * seule valeur non exacte du module — la valeur décimale d'une racine — est
 * marquée `approximate` pour que l'écran écrive « قيمة مقرّبة ».
 *
 * Chaque fonction rend aussi le LaTeX de son raisonnement (`2^{5} = 2 \times
 * 2 \times … = 32`) : l'écran l'affiche avec MathText, isolé en LTR.
 */

import * as Q from './bigRational.js';
import { primeFactorization } from './numberTheory.js';

/** Les bornes : un exposant de collège, une base lisible, un résultat qui tient à l'écran. */
export const MAX_BASE = 1000;
export const MAX_EXPONENT = 30;
const MAX_RESULT_DIGITS = 60;
/** Au-delà, le produit développé s'abrège : `2 \times 2 \times \cdots \times 2` (n facteurs). */
export const EXPAND_LIMIT = 8;
export const MAX_ROOT = 10_000_000;
/** La grille carrée n'est dessinée que jusqu'à 20 × 20. */
export const MAX_GRID_SIDE = 20;

const baseLatex = (base) => (base < 0 ? `(${base})` : String(base));

/**
 * Lire une base ou un exposant entier.
 * @returns {{ value: number } | { error: 'notNumber'|'notInteger'|'tooLarge' }}
 */
export function readIntegerInRange(raw, max) {
  const text = String(raw ?? '').trim().replace('−', '-').replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  if (!/^[-+]?\d+([.,]\d+)?$/.test(text)) return { error: 'notNumber' };
  const value = Number(text.replace(',', '.'));
  if (!Number.isInteger(value)) return { error: 'notInteger' };
  if (Math.abs(value) > max) return { error: 'tooLarge' };

  return { value };
}

/** Le produit développé `a × a × … × a` (n facteurs), abrégé au-delà d'EXPAND_LIMIT. */
function expandedProduct(base, n) {
  const b = baseLatex(base);
  if (n <= 0) return '';
  if (n === 1) return b;
  if (n <= EXPAND_LIMIT) return Array.from({ length: n }, () => b).join(' \\times ');

  return `\\underbrace{${b} \\times ${b} \\times \\cdots \\times ${b}}_{${n}}`;
}

/**
 * `base^exp`, EXACT, avec son développement.
 *
 *     2^5    → 2^{5} = 2 \times 2 \times 2 \times 2 \times 2 = 32
 *     2^-3   → 2^{-3} = \frac{1}{2^{3}} = \frac{1}{8}
 *     7^0    → 7^{0} = 1
 *
 * @returns {{ base, exp, value: object, latex: string, text: string, decimal: {text, exact} }
 *          | { error: 'zeroPowerZero'|'divisionByZero'|'tooLarge'|'baseTooLarge'|'exponentTooLarge'|'notInteger' }}
 */
export function powerOf(base, exp) {
  if (!Number.isInteger(base) || !Number.isInteger(exp)) return { error: 'notInteger' };
  if (Math.abs(base) > MAX_BASE) return { error: 'baseTooLarge' };
  if (Math.abs(exp) > MAX_EXPONENT) return { error: 'exponentTooLarge' };
  const result = Q.pow(Q.rat(base), exp, { maxDigits: MAX_RESULT_DIGITS });
  if (result.error) return { error: result.error };
  const { value } = result;
  const head = `${baseLatex(base)}^{${exp}}`;
  const valueLatex = Q.isInteger(value) ? Q.groupDigits(value.n.toString(), '\\,') : Q.toLatex(value);
  let latex;
  if (exp === 0) latex = `${head} = 1`;
  else if (exp > 0) latex = exp === 1 ? `${head} = ${valueLatex}` : `${head} = ${expandedProduct(base, exp)} = ${valueLatex}`;
  else {
    // a^{-n} = 1 / a^n ; le signe (base négative, n impair) se range devant la barre.
    latex = `${head} = \\frac{1}{${baseLatex(base)}^{${-exp}}} = ${Q.toLatex(value)}`;
  }

  return {
    base,
    exp,
    value,
    latex,
    text: Q.toText(value),
    decimal: Q.toDecimal(value, { places: 12, group: true }),
  };
}

/* ── Les règles, vérifiées par le calcul ───────────────────────────────── */

export const POWER_RULES = Object.freeze(['product', 'quotient', 'power']);

/**
 * Une règle APPLIQUÉE à des exposants que l'élève choisit, et VÉRIFIÉE :
 * les deux membres sont calculés séparément (BigInt) et comparés. La règle
 * n'est pas affirmée — elle est constatée, comme `PGCD × PPCM = a × b`.
 *
 *   product  : a^m × a^n = a^{m+n}
 *   quotient : a^m ÷ a^n = a^{m−n}      (a ≠ 0)
 *   power    : (a^m)^n   = a^{m×n}
 *
 * @returns {{ rule, a, m, n, resultExp, latexRule, latexApplied, latexExpanded: string|null, left, right, holds }
 *          | { error }}
 */
export function applyPowerRule(rule, a, m, n) {
  if (!POWER_RULES.includes(rule)) return { error: 'unknownRule' };
  if (![a, m, n].every(Number.isInteger)) return { error: 'notInteger' };
  if (Math.abs(a) > 20) return { error: 'baseTooLarge' };
  if (Math.abs(m) > 12 || Math.abs(n) > 12) return { error: 'exponentTooLarge' };
  if (a === 0) return { error: 'zeroBase' };

  const A = Q.rat(a);
  const pm = Q.pow(A, m);
  const pn = Q.pow(A, n);
  if (pm.error || pn.error) return { error: pm.error ?? pn.error };
  const b = baseLatex(a);

  let resultExp;
  let left;
  let latexRule;
  let latexApplied;
  let latexExpanded = null;
  // Les morceaux de la dérivation (solutionSteps.powerRuleSteps) : départ, exposants combinés, exposant calculé.
  let latexStart;
  let latexCombined;
  let exponentLatex;
  switch (rule) {
    case 'product':
      resultExp = m + n;
      left = Q.mul(pm.value, pn.value);
      latexRule = 'a^{m} \\times a^{n} = a^{m+n}';
      latexStart = `${b}^{${m}} \\times ${b}^{${n}}`;
      latexCombined = `${b}^{${m} + ${paren(n)}}`;
      exponentLatex = `${m} + ${paren(n)} = ${resultExp}`;
      latexApplied = `${latexStart} = ${latexCombined} = ${b}^{${resultExp}}`;
      if (m > 0 && n > 0 && m + n <= 10) {
        latexExpanded = `(${expandedProduct(a, m)}) \\times (${expandedProduct(a, n)}) = ${expandedProduct(a, m + n)}`;
      }
      break;
    case 'quotient':
      resultExp = m - n;
      left = Q.div(pm.value, pn.value);
      latexRule = '\\frac{a^{m}}{a^{n}} = a^{m-n}';
      latexStart = `\\frac{${b}^{${m}}}{${b}^{${n}}}`;
      latexCombined = `${b}^{${m} - ${paren(n)}}`;
      exponentLatex = `${m} - ${paren(n)} = ${resultExp}`;
      latexApplied = `${latexStart} = ${latexCombined} = ${b}^{${resultExp}}`;
      if (m > 0 && n > 0 && m <= 8 && n <= 8) {
        latexExpanded = `\\frac{${expandedProduct(a, m)}}{${expandedProduct(a, n)}} = ${resultExp === 0 ? '1' : resultExp > 0 ? expandedProduct(a, resultExp) : `\\frac{1}{${expandedProduct(a, -resultExp)}}`}`;
      }
      break;
    default:
      resultExp = m * n;
      left = Q.pow(pm.value, n).value ?? null;
      latexRule = '\\left(a^{m}\\right)^{n} = a^{m \\times n}';
      latexStart = `\\left(${b}^{${m}}\\right)^{${n}}`;
      latexCombined = `${b}^{${m} \\times ${paren(n)}}`;
      exponentLatex = `${m} \\times ${paren(n)} = ${resultExp}`;
      latexApplied = `${latexStart} = ${latexCombined} = ${b}^{${resultExp}}`;
      if (m > 0 && n > 0 && n <= 5 && m * n <= 12) {
        latexExpanded = `${Array.from({ length: n }, () => `${b}^{${m}}`).join(' \\times ')} = ${b}^{${Array.from({ length: n }, () => m).join(' + ')}}`;
      }
      break;
  }
  const right = Q.pow(A, resultExp, { maxDigits: 200 });
  if (!left || right.error) return { error: right.error ?? 'tooLarge' };

  return {
    rule,
    a,
    m,
    n,
    resultExp,
    latexRule,
    latexApplied,
    latexExpanded,
    latexStart,
    latexCombined,
    latexResult: `${b}^{${resultExp}}`,
    exponentLatex,
    left: Q.toLatex(left),
    right: Q.toLatex(right.value),
    holds: Q.equals(left, right.value),
  };
}

const paren = (n) => (n < 0 ? `(${n})` : String(n));

/* ── Puissances de 10 et écriture scientifique ─────────────────────────── */

/** `10^{n}` écrit en toutes lettres : `10^{3} = 1000`, `10^{-3} = 0,001`. */
export function powerOfTen(n) {
  if (!Number.isInteger(n) || Math.abs(n) > 20) return null;
  const value = Q.pow(Q.rat(10), n).value;
  const decimal = Q.toDecimal(value, { group: false }).text;

  return { n, text: decimal, latex: `10^{${n}} = ${decimal.replace(',', '{,}')}` };
}

/**
 * L'ÉCRITURE SCIENTIFIQUE d'un nombre décimal TAPÉ, lue depuis ses chiffres
 * (jamais via un flottant) : `0,00045` → `4,5 × 10^{-4}` ; `123000` →
 * `1,23 × 10^{5}` ; `-7` → `-7 × 10^{0}`.
 *
 * Rend aussi le DÉPLACEMENT de la virgule (combien de rangs, dans quel sens),
 * ce qui est l'explication du manuel.
 *
 * @returns {{ sign: 1|-1, mantissa: string, exponent: number, shift: number,
 *            direction: 'left'|'right'|'none', latex: string, original: string }
 *          | { error: 'empty'|'notNumber'|'zero'|'tooLong' }}
 */
export function scientificNotation(raw) {
  const text = String(raw ?? '').trim()
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[\s  ]/g, '')
    .replace('−', '-')
    .replace('٫', ',');
  if (!text) return { error: 'empty' };
  const match = /^([-+]?)(\d*)(?:[.,](\d*))?$/.exec(text);
  if (!match || (!match[2] && !match[3])) return { error: 'notNumber' };
  const [, signText, wholeRaw = '', fracRaw = ''] = match;
  if (wholeRaw.length + fracRaw.length > 30) return { error: 'tooLong' };
  const digits = `${wholeRaw}${fracRaw}`;
  const firstNonZero = digits.search(/[1-9]/);
  if (firstNonZero < 0) return { error: 'zero' };

  // Position de la virgule dans `digits` : après wholeRaw.length chiffres.
  const exponent = wholeRaw.length - firstNonZero - 1;
  const significant = digits.slice(firstNonZero).replace(/0+$/, '') || digits[firstNonZero];
  const mantissa = significant.length > 1 ? `${significant[0]},${significant.slice(1)}` : significant;
  const sign = signText === '-' ? -1 : 1;
  const original = `${sign < 0 ? '-' : ''}${(wholeRaw.replace(/^0+(?=\d)/, '') || '0')}${fracRaw.replace(/0+$/, '') ? `,${fracRaw.replace(/0+$/, '')}` : ''}`;
  const latexMantissa = `${sign < 0 ? '-' : ''}${mantissa.replace(',', '{,}')}`;

  return {
    sign,
    mantissa,
    exponent,
    shift: Math.abs(exponent),
    direction: exponent > 0 ? 'left' : exponent < 0 ? 'right' : 'none',
    original,
    latex: `${original.replace(',', '{,}')} = ${latexMantissa} \\times 10^{${exponent}}`,
  };
}

/* ── Racines carrées ──────────────────────────────────────────────────── */

/**
 * √n SIMPLIFIÉE par la factorisation : √72 = √(36 × 2) = √36 × √2 = 6√2.
 *
 * Le calcul est entier : on sort de la racine chaque facteur premier à
 * l'exposant pair. La valeur décimale est la SEULE approximation du module,
 * et elle est marquée comme telle.
 *
 * @returns {{ n, outer, inner, perfect: boolean, simplified: boolean, steps: string[],
 *             latex: string, approx: string, bounds: { low, high } | null }
 *          | { error: 'negative'|'notInteger'|'tooLarge' }}
 */
export function simplifySqrt(n) {
  if (!Number.isInteger(n)) return { error: 'notInteger' };
  if (n < 0) return { error: 'negative' };
  if (n > MAX_ROOT) return { error: 'tooLarge' };
  if (n === 0 || n === 1) {
    return {
      n, outer: n, inner: 1, perfect: true, simplified: false,
      steps: [`\\sqrt{${n}} = ${n}`], latex: `\\sqrt{${n}} = ${n}`, approx: String(n), bounds: null,
    };
  }
  const factors = primeFactorization(n) ?? [];
  let outer = 1;
  let inner = 1;
  for (const { p, e } of factors) {
    outer *= p ** Math.floor(e / 2);
    inner *= p ** (e % 2);
  }
  const square = outer * outer;
  const perfect = inner === 1;
  const steps = [];
  if (perfect) {
    steps.push(`\\sqrt{${n}} = \\sqrt{${outer}^{2}} = ${outer}`);
  } else if (outer === 1) {
    steps.push(`\\sqrt{${n}}`);
  } else {
    steps.push(`\\sqrt{${n}} = \\sqrt{${square} \\times ${inner}}`);
    steps.push(`= \\sqrt{${square}} \\times \\sqrt{${inner}}`);
    steps.push(`= ${outer}\\sqrt{${inner}}`);
  }
  const low = Math.floor(Math.sqrt(n));

  return {
    n,
    outer,
    inner,
    perfect,
    simplified: !perfect && outer > 1,
    steps,
    latex: perfect ? `\\sqrt{${n}} = ${outer}` : outer > 1 ? `\\sqrt{${n}} = ${outer}\\sqrt{${inner}}` : `\\sqrt{${n}}`,
    approx: perfect ? String(outer) : approxSqrt(n, 3),
    // L'encadrement par deux carrés parfaits : 64 < 72 < 81 → 8 < √72 < 9.
    bounds: perfect ? null : { low, high: low + 1, lowSquare: low * low, highSquare: (low + 1) * (low + 1) },
  };
}

/**
 * La valeur décimale de √n à `places` décimales, TRONQUÉE exactement par
 * BigInt (isqrt de n × 10^{2k}) — jamais un flottant arrondi en douce.
 */
export function approxSqrt(n, places = 3) {
  const scaled = BigInt(n) * 10n ** BigInt(2 * places);
  const root = isqrtBig(scaled);
  const s = root.toString().padStart(places + 1, '0');

  return `${s.slice(0, -places)},${s.slice(-places)}`;
}

function isqrtBig(value) {
  if (value < 2n) return value;
  let x = BigInt(Math.floor(Math.sqrt(Number(value))));
  while (x * x > value) x -= 1n;
  while ((x + 1n) * (x + 1n) <= value) x += 1n;

  return x;
}

export const POWER_EXAMPLES = Object.freeze([
  { id: 'p-2-5', level: 'beginner', base: 2, exp: 5 },
  { id: 'p-10-3', level: 'beginner', base: 10, exp: 3 },
  { id: 'p-5-0', level: 'beginner', base: 5, exp: 0 },
  { id: 'p-m2-3', level: 'intermediate', base: -2, exp: 3 },
  { id: 'p-m3-4', level: 'intermediate', base: -3, exp: 4 },
  { id: 'p-2-m3', level: 'intermediate', base: 2, exp: -3 },
  { id: 'p-10-m4', level: 'advanced', base: 10, exp: -4 },
  { id: 'p-2-30', level: 'advanced', base: 2, exp: 30 },
  { id: 'p-m5-m2', level: 'advanced', base: -5, exp: -2 },
]);

export const ROOT_EXAMPLES = Object.freeze([
  { id: 'r-49', level: 'beginner', n: 49 },
  { id: 'r-81', level: 'beginner', n: 81 },
  { id: 'r-72', level: 'intermediate', n: 72 },
  { id: 'r-50', level: 'intermediate', n: 50 },
  { id: 'r-12', level: 'intermediate', n: 12 },
  { id: 'r-7', level: 'advanced', n: 7 },
  { id: 'r-1000', level: 'advanced', n: 1000 },
]);

export const SCIENTIFIC_EXAMPLES = Object.freeze([
  { id: 's-123000', level: 'beginner', text: '123000' },
  { id: 's-0.00045', level: 'intermediate', text: '0,00045' },
  { id: 's-384400000', level: 'advanced', text: '384400000' },
  { id: 's-0.0000012', level: 'advanced', text: '0,0000012' },
]);
