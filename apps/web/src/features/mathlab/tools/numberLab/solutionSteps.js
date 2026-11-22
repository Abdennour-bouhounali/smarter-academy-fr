/**
 * LES DÉRIVATIONS « FORMULE PAR FORMULE » du laboratoire des nombres — les
 * suites d'états que `LabKit › StepList` déroule avec le lecteur partagé
 * (`useStepReveal` + `StepPlayer`). Logique pure, sans React.
 *
 * Réservé aux calculs dont chaque pas est une RÉÉCRITURE entière (une
 * décomposition, une règle appliquée, une fraction mise au même
 * dénominateur) ; les opérations qu'on voit se faire élément par élément
 * vivent dans les modules `*Frames.js` (le tableau MathBoard).
 *
 * Un pas :
 *   { textKey, textParams?, latex?, operationKey?, operationParams?, operationLatex?, tone? }
 * Le DERNIER pas porte le résultat (`tone: 'result'`) : avant lui, la
 * réponse n'est écrite nulle part. `localizeSteps(t, steps)` les met au
 * format de StepList.
 */

import * as Q from './bigRational.js';
import { EXPAND_LIMIT } from './powers.js';
import {
  gcd, lcm, divisors, factorMethod, factorizationToLatex,
} from './numberTheory.js';
import {
  commonDenominator, fracToLatex, simplify, simplifyFactor, compareFrac, comparisonSign, makeFrac,
} from './fraction.js';

const K = 'tools.numberLab.steps';

/** Au format de StepList : les clés deviennent des phrases. */
export function localizeSteps(t, steps) {
  return steps.map((step) => ({
    latex: step.latex,
    text: step.textKey ? t(step.textKey, step.textParams) : step.text,
    operation: step.operationKey ? t(step.operationKey, step.operationParams) : undefined,
    operationLatex: step.operationLatex,
    tone: step.tone,
  }));
}

const pgcdOf = (a, b) => `\\mathrm{PGCD}(${a}\\ ;\\ ${b})`;
const ppcmOf = (a, b) => `\\mathrm{PPCM}(${a}\\ ;\\ ${b})`;
const setLatex = (list, cap = 40) => `\\{${list.slice(0, cap).join(',\\ ')}${list.length > cap ? ',\\ \\ldots' : ''}\\}`;

/* ── PGCD par les facteurs premiers ─────────────────────────────────── */

/**
 * 84 = 2^2 × 3 × 7 → 36 = 2^2 × 3^2 → PGCD = 2^2 × 3 (communs, plus petit exposant) → PGCD = 12.
 * @returns {null | { steps, factors }}
 */
export function factorMethodSteps(a, b) {
  const factors = factorMethod(a, b);
  if (!factors) return null;
  const common = factorizationToLatex(factors.gcd);
  const value = gcd(a, b);
  const steps = [
    { textKey: `${K}.factors.decompose`, textParams: { n: a }, latex: `${a} = ${factorizationToLatex(factors.a)}` },
    { textKey: `${K}.factors.decompose`, textParams: { n: b }, latex: `${b} = ${factorizationToLatex(factors.b)}` },
    common
      ? { textKey: `${K}.factors.common`, latex: `${pgcdOf(a, b)} = ${common}`, operationKey: `${K}.factors.commonOperation` }
      : { textKey: `${K}.factors.noCommon`, latex: `${pgcdOf(a, b)} = 1` },
    { textKey: `${K}.factors.result`, latex: `${pgcdOf(a, b)} = ${value}`, tone: 'result' },
  ];
  // Pas de facteur commun : le 3ᵉ pas a DÉJÀ dit 1 — on ne le répète pas.
  if (!common) steps.splice(2, 2, { ...steps[2], tone: 'result' });

  return { steps, factors };
}

/* ── PGCD par les listes de diviseurs ───────────────────────────────── */

/** D(84), D(36), les communs, le plus grand. */
export function listsSteps(a, b) {
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 1 || b < 1) return null;
  const da = divisors(a);
  const db = divisors(b);
  const setB = new Set(db);
  const common = da.filter((d) => setB.has(d));
  const value = common[common.length - 1];

  return {
    steps: [
      { textKey: `${K}.lists.divisorsOf`, textParams: { n: a, count: da.length }, latex: `D_{${a}} = ${setLatex(da)}` },
      { textKey: `${K}.lists.divisorsOf`, textParams: { n: b, count: db.length }, latex: `D_{${b}} = ${setLatex(db)}` },
      { textKey: `${K}.lists.common`, latex: setLatex(common), operationKey: `${K}.lists.commonOperation` },
      { textKey: `${K}.lists.result`, latex: `${pgcdOf(a, b)} = ${value}`, tone: 'result' },
    ],
    common,
    gcd: value,
  };
}

/* ── PPCM par la relation avec le PGCD ──────────────────────────────── */

/** PPCM = a × b / PGCD → on remplace → on calcule le produit → on divise. */
export function ppcmSteps(a, b) {
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 1 || b < 1) return null;
  const g = gcd(a, b);
  const product = a * b;

  return [
    { textKey: `${K}.ppcm.rule`, latex: '\\mathrm{PPCM}(a\\ ;\\ b) = \\dfrac{a \\times b}{\\mathrm{PGCD}(a\\ ;\\ b)}' },
    { textKey: `${K}.ppcm.substitute`, latex: `${ppcmOf(a, b)} = \\dfrac{${a} \\times ${b}}{${g}}`, operationLatex: `${pgcdOf(a, b)} = ${g}` },
    { textKey: `${K}.ppcm.product`, latex: `${ppcmOf(a, b)} = \\dfrac{${product}}{${g}}`, operationLatex: `${a} \\times ${b} = ${product}` },
    { textKey: `${K}.ppcm.result`, latex: `${ppcmOf(a, b)} = ${lcm(a, b)}`, operationLatex: `${product} \\div ${g} = ${lcm(a, b)}`, tone: 'result' },
  ];
}

/* ── Une puissance, facteur par facteur ─────────────────────────────── */

const baseLatex = (base) => (base < 0 ? `(${base})` : String(base));
const valueLatex = (v) => (Q.isInteger(v) ? Q.groupDigits(v.n.toString(), '\\,') : Q.toLatex(v));
const repeat = (base, count) => Array.from({ length: count }, () => baseLatex(base)).join(' \\times ');

/**
 * 2^5 = 2 × 2 × 2 × 2 × 2 → = 4 × 2 × 2 × 2 → = 8 × 2 × 2 → = 16 × 2 → 2^5 = 32.
 * Au-delà de EXPAND_LIMIT facteurs : le produit abrégé, puis la valeur.
 * a^0 = 1 et a^1 = a : un seul pas. a^{-n} : 1 / a^n, puis la valeur.
 */
export function powerSteps(base, exp) {
  if (!Number.isInteger(base) || !Number.isInteger(exp)) return [];
  const head = `${baseLatex(base)}^{${exp}}`;
  const full = Q.pow(Q.rat(base), exp, { maxDigits: 60 });
  if (full.error) return [];
  if (exp === 0) return [{ textKey: `${K}.power.zero`, latex: `${head} = 1`, tone: 'result' }];
  if (exp === 1) return [{ textKey: `${K}.power.one`, latex: `${head} = ${valueLatex(full.value)}`, tone: 'result' }];

  if (exp < 0) {
    const n = -exp;
    const steps = [{ textKey: `${K}.power.negative`, textParams: { n }, latex: `${head} = \\dfrac{1}{${baseLatex(base)}^{${n}}}` }];
    if (n >= 2 && n <= EXPAND_LIMIT) steps.push({ textKey: `${K}.power.expandDenominator`, textParams: { count: n }, latex: `= \\dfrac{1}{${repeat(base, n)}}` });
    steps.push({ textKey: `${K}.power.result`, latex: `${head} = ${Q.toLatex(full.value)}`, tone: 'result' });

    return steps;
  }

  if (exp > EXPAND_LIMIT) {
    return [
      { textKey: `${K}.power.expand`, textParams: { count: exp }, latex: `${head} = \\underbrace{${baseLatex(base)} \\times \\cdots \\times ${baseLatex(base)}}_{${exp}}` },
      { textKey: `${K}.power.result`, latex: `${head} = ${valueLatex(full.value)}`, tone: 'result' },
    ];
  }

  const steps = [{ textKey: `${K}.power.expand`, textParams: { count: exp }, latex: `${head} = ${repeat(base, exp)}` }];
  let partial = Q.rat(base);
  for (let k = 2; k < exp; k += 1) {
    const previous = partial;
    partial = Q.mul(partial, Q.rat(base));
    steps.push({
      textKey: `${K}.power.multiply`,
      latex: `= ${valueLatex(partial)} \\times ${repeat(base, exp - k)}`,
      operationLatex: `${k === 2 ? baseLatex(base) : valueLatex(previous)} \\times ${baseLatex(base)} = ${valueLatex(partial)}`,
    });
  }
  steps.push({
    textKey: `${K}.power.result`,
    latex: `${head} = ${valueLatex(full.value)}`,
    operationLatex: `${exp === 2 ? baseLatex(base) : valueLatex(partial)} \\times ${baseLatex(base)} = ${valueLatex(full.value)}`,
    tone: 'result',
  });

  return steps;
}

/* ── Une règle des puissances, appliquée ────────────────────────────── */

/** @param {object} applied  la sortie de `applyPowerRule` (sans erreur) */
export function powerRuleSteps(applied) {
  if (!applied || applied.error) return [];
  const steps = [{ textKey: `${K}.rules.rule`, latex: applied.latexRule }];
  if (applied.latexExpanded) steps.push({ textKey: `${K}.rules.expanded`, latex: applied.latexExpanded });
  steps.push({ textKey: `${K}.rules.apply.${applied.rule}`, latex: `${applied.latexStart} = ${applied.latexCombined}` });
  steps.push({ textKey: `${K}.rules.result`, latex: `${applied.latexStart} = ${applied.latexResult}`, operationLatex: applied.exponentLatex, tone: 'result' });

  return steps;
}

/* ── L'écriture scientifique ────────────────────────────────────────── */

/** @param {object} result  la sortie de `scientificNotation` (sans erreur) */
export function scientificSteps(result) {
  if (!result || result.error) return [];
  const mantissa = `${result.sign < 0 ? '-' : ''}${result.mantissa.replace(',', '{,}')}`;
  const abs = result.mantissa.replace(',', '{,}');
  const original = result.original.replace(',', '{,}');

  return [
    { textKey: `${K}.scientific.mantissa`, latex: `1 \\le ${abs} < 10` },
    {
      textKey: result.direction === 'none' ? `${K}.scientific.shiftNone` : `${K}.scientific.shift.${result.direction}`,
      textParams: { count: result.shift },
      latex: `n = ${result.exponent}`,
    },
    { textKey: `${K}.scientific.result`, latex: `${original} = ${mantissa} \\times 10^{${result.exponent}}`, tone: 'result' },
  ];
}

/* ── Les opérations sur les fractions ───────────────────────────────── */

const F = fracToLatex;
const numLatex = (n, first = false) => (n < 0 && !first ? `(${n})` : String(n));

/** Le pas final : l'égalité complète, réduite si on a pu réduire. */
function simplifyTail(steps, head, raw) {
  const reduced = simplify(raw);
  const factor = simplifyFactor(raw);
  if (factor > 1) {
    steps.push({ textKey: `${K}.fractions.raw`, latex: `= ${F(raw)}` });
    steps.push({ textKey: `${K}.fractions.simplify`, textParams: { factor }, latex: `${head} = ${F(reduced)}`, operationLatex: `\\div ${factor}`, tone: 'result' });
  } else {
    steps.push({ textKey: `${K}.fractions.irreducible`, latex: `${head} = ${F(raw)}`, tone: 'result' });
  }

  return steps;
}

/**
 * La dérivation d'une opération sur deux fractions.
 *
 *   add / subtract : (PPCM des dénominateurs) → (les deux fractions au même
 *                    dénominateur) → numérateurs combinés → résultat (réduit)
 *   multiply       : a×c / b×d → résultat (réduit)
 *   divide         : × l'inverse → a×d / b×c → résultat (réduit)
 *   compare        : produits croisés → leur comparaison → le signe
 *
 * @returns {{ steps, commonIndex: number }}  `commonIndex` : le pas où les
 *   deux barres se subdivisent au même dénominateur (-1 si aucun)
 */
export function fractionSteps(left, right, operation) {
  if (!left || !right) return { steps: [], commonIndex: -1 };
  const symbol = { add: '+', subtract: '-', multiply: '\\times', divide: '\\div' }[operation];
  const head = `${F(left)} ${symbol ?? ''} ${F(right)}`;

  if (operation === 'add' || operation === 'subtract') {
    const common = commonDenominator(left, right);
    if (!common) return { steps: [], commonIndex: -1 };
    const steps = [];
    let commonIndex = -1;
    if (left.d !== right.d) {
      steps.push({ textKey: `${K}.fractions.commonDenominator`, latex: `\\mathrm{PPCM}(${left.d}\\ ;\\ ${right.d}) = ${common.denominator}` });
      commonIndex = steps.length;
      steps.push({
        textKey: `${K}.fractions.convert`,
        latex: `${head} = ${F(common.left)} ${symbol} ${F(common.right)}`,
        operationLatex: `\\times ${common.leftFactor} \\quad ; \\quad \\times ${common.rightFactor}`,
      });
    } else {
      steps.push({ textKey: `${K}.fractions.sameDenominator`, textParams: { d: left.d }, latex: head });
    }
    steps.push({
      textKey: `${K}.fractions.numerators.${operation}`,
      latex: `= \\dfrac{${numLatex(common.left.n, true)} ${symbol} ${numLatex(common.right.n)}}{${common.denominator}}`,
    });
    const raw = makeFrac(operation === 'add' ? common.left.n + common.right.n : common.left.n - common.right.n, common.denominator);

    return { steps: simplifyTail(steps, head, raw), commonIndex };
  }

  if (operation === 'multiply') {
    const raw = makeFrac(left.n * right.n, left.d * right.d);
    if (!raw) return { steps: [], commonIndex: -1 };
    const steps = [{
      textKey: `${K}.fractions.multiply`,
      latex: `${head} = \\dfrac{${numLatex(left.n, true)} \\times ${numLatex(right.n)}}{${left.d} \\times ${right.d}}`,
    }];

    return { steps: simplifyTail(steps, head, raw), commonIndex: -1 };
  }

  if (operation === 'divide') {
    if (right.n === 0) return { steps: [], commonIndex: -1 };
    const reciprocal = makeFrac(right.d, right.n);
    const raw = makeFrac(left.n * reciprocal.n, left.d * reciprocal.d);
    if (!raw) return { steps: [], commonIndex: -1 };
    const steps = [
      { textKey: `${K}.fractions.reciprocal`, latex: `${head} = ${F(left)} \\times ${F(reciprocal)}`, operationLatex: `\\div ${F(right)} \\;\\to\\; \\times ${F(reciprocal)}` },
      { textKey: `${K}.fractions.multiply`, latex: `= \\dfrac{${numLatex(left.n, true)} \\times ${numLatex(reciprocal.n)}}{${left.d} \\times ${reciprocal.d}}` },
    ];

    return { steps: simplifyTail(steps, head, raw), commonIndex: -1 };
  }

  if (operation === 'compare') {
    const order = compareFrac(left, right);
    const crossLeft = left.n * right.d;
    const crossRight = right.n * left.d;
    const sign = comparisonSign(order);

    return {
      steps: [
        { textKey: `${K}.fractions.cross`, latex: `${numLatex(left.n, true)} \\times ${right.d} = ${crossLeft} \\qquad ${numLatex(right.n, true)} \\times ${left.d} = ${crossRight}` },
        { textKey: `${K}.fractions.crossCompare`, latex: `${crossLeft} ${sign} ${crossRight}` },
        { textKey: `${K}.fractions.compareResult`, latex: `${F(left)} ${sign} ${F(right)}`, tone: 'result' },
      ],
      commonIndex: -1,
    };
  }

  return { steps: [], commonIndex: -1 };
}
