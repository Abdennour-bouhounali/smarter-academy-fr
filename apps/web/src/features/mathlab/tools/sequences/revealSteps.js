/**
 * LA RÉVÉLATION PAS À PAS d'un défi de l'entraînement (§27, §29).
 *
 * Exigence de la propriétaire (2026-09-30) : quand l'élève DEMANDE la
 * réponse (« اكشف »), la solution ne tombe pas d'un bloc. On calcule ici la
 * suite des états réels — u₀ = 4, puis u₁ = u₀ + r = 4 + 3 = 7, puis … — et
 * l'interface les découvre un à un (`useStepReveal`). Le DERNIER pas est
 * toujours la réponse du défi, identique à `challenge.expected`.
 *
 * Un pas :
 *
 *     { kind, latex, textKey, params?, n?, value?, target?, far?, tone? }
 *       kind     'given' | 'term' | 'formula' | 'difference' | 'ratio' |
 *                'compare' | 'settle' | 'fixedPoint' | 'answer'
 *       latex    l'état mathématique (KaTeX, rendu dans un îlot LTR)
 *       textKey  la phrase arabe, relative à `tools.sequences.practice.steps`
 *       n/value  le terme que ce pas établit (la pastille « u₅ = 17 »)
 *       target   ce terme est celui que la question demandait
 *
 * Les VALEURS viennent du moteur (`buildDefinition` + `generate`/`termAt`),
 * jamais d'un calcul refait ici : la révélation ne peut pas contredire le
 * graphe. Ce module ne fait qu'écrire ces valeurs dans leur substitution.
 */

import { termAt } from './sequenceMath.js';
import { buildDefinition } from './sequenceModel.js';

/** Au-delà de ce rang, on montre les premiers termes puis la formule du terme lointain. */
export const DIRECT_TERMS_LIMIT = 5;
const LEADING_TERMS = 3;

/** Un nombre en LaTeX : virgule décimale, séparateur fin, parenthèses si négatif et demandé. */
export function texNumber(value, { paren = false, decimals = 4 } = {}) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '\\text{—}';
  const factor = 10 ** decimals;
  let rounded = Math.round(value * factor) / factor;
  if (Object.is(rounded, -0)) rounded = 0;
  const negative = rounded < 0;
  const [whole, fraction] = String(Math.abs(rounded)).split('.');
  const grouped = whole.length > 4 ? whole.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : whole;
  const body = fraction ? `${grouped}{,}${fraction}` : grouped;
  const text = negative ? `-${body}` : body;

  return negative && paren ? `(${text})` : text;
}

/** `=` quand l'écriture est exacte, `\approx` quand elle arrondit. */
function relation(value, decimals = 4) {
  const factor = 10 ** decimals;

  return Math.abs(Math.round(value * factor) / factor - value) > 1e-12 ? '\\approx' : '=';
}

const u = (n) => `u_{${n}}`;

/** `a·uₙ + b` en LaTeX, avec le rang donné : `2u_{0} - 1`, `-u_{n} + 3`, `0{,}5u_{n} + 2`. */
function affineTex(a, b, index) {
  const coefficient = a === 1 ? '' : a === -1 ? '-' : `${texNumber(a)}\\,`;
  const constant = b === 0 ? '' : ` ${b < 0 ? '-' : '+'} ${texNumber(Math.abs(b))}`;

  return `${coefficient}${u(index)}${constant}`;
}

/** Les termes réels de la suite d'un défi, par le moteur. */
function engineOf(challenge) {
  const built = buildDefinition({
    kind: 'arithmetic', startIndex: 0, first: 0, second: 0, difference: 0,
    ratio: 0, a: 0, b: 0, explicitSource: '0', ruleSource: '0',
    ...challenge.spec,
  });
  if (!built.ok) return null;
  const definition = built.definition;
  const cache = new Map();

  return (n) => {
    if (!cache.has(n)) {
      const at = termAt(definition, n);
      cache.set(n, at.ok ? at.value : NaN);
    }

    return cache.get(n);
  };
}

function termStep(extra) {
  return { kind: 'term', ...extra };
}

/** u₁ = u₀ + r, u₂ = u₁ + r, … puis, si la cible est loin, la formule du terme général. */
function arithmeticSteps(challenge, value) {
  const { first, difference } = challenge.spec;
  const target = challenge.targetIndex;
  const steps = [{
    kind: 'given', textKey: 'givenArithmetic',
    latex: `${u(0)} = ${texNumber(first)},\\quad r = ${texNumber(difference)}`,
  }];
  const direct = target <= DIRECT_TERMS_LIMIT;
  const last = direct ? target : LEADING_TERMS;
  for (let n = 1; n <= last; n += 1) {
    steps.push(termStep({
      textKey: 'addDifference', n, value: value(n), target: n === target,
      latex: `${u(n)} = ${u(n - 1)} + r = ${texNumber(value(n - 1))} + ${texNumber(difference, { paren: true })} = ${texNumber(value(n))}`,
    }));
  }
  if (!direct) {
    steps.push({
      kind: 'formula', textKey: 'arithmeticJump', params: { target }, n: target, value: value(target), target: true, far: true,
      latex: `${u(target)} = ${u(0)} + ${target} \\times r = ${texNumber(first)} + ${target} \\times ${texNumber(difference, { paren: true })} = ${texNumber(value(target))}`,
    });
  }

  return steps;
}

/** u₁ = u₀ × q, … puis uₙ = u₀ × qⁿ si la cible est loin. */
function geometricSteps(challenge, value) {
  const { first, ratio } = challenge.spec;
  const target = challenge.targetIndex;
  const steps = [{
    kind: 'given', textKey: 'givenGeometric',
    latex: `${u(0)} = ${texNumber(first)},\\quad q = ${texNumber(ratio)}`,
  }];
  const direct = target <= DIRECT_TERMS_LIMIT;
  const last = direct ? target : LEADING_TERMS;
  for (let n = 1; n <= last; n += 1) {
    steps.push(termStep({
      textKey: 'multiplyRatio', n, value: value(n), target: n === target,
      latex: `${u(n)} = ${u(n - 1)} \\times q = ${texNumber(value(n - 1), { paren: true })} \\times ${texNumber(ratio, { paren: true })} ${relation(value(n))} ${texNumber(value(n))}`,
    }));
  }
  if (!direct) {
    steps.push({
      kind: 'formula', textKey: 'geometricJump', params: { target }, n: target, value: value(target), target: true, far: true,
      latex: `${u(target)} = ${u(0)} \\times q^{${target}} = ${texNumber(first, { paren: true })} \\times ${texNumber(ratio, { paren: true })}^{${target}} ${relation(value(target))} ${texNumber(value(target))}`,
    });
  }

  return steps;
}

/** Une étape de récurrence affine : uₙ₊₁ = a·uₙ + b, avec uₙ remplacé par sa valeur. */
function affineTermStep(a, b, n, value, extra = {}) {
  const substituted = `${texNumber(a, { paren: a < 0 })} \\times ${texNumber(value(n - 1), { paren: true })} ${b < 0 ? '-' : '+'} ${texNumber(Math.abs(b))}`;

  return termStep({
    textKey: 'substitute', n, value: value(n),
    latex: `${u(n)} = ${affineTex(a, b, n - 1)} = ${substituted} ${relation(value(n))} ${texNumber(value(n))}`,
    ...extra,
  });
}

function givenAffine(challenge) {
  const { first, a, b } = challenge.spec;

  return {
    kind: 'given', textKey: 'givenRecurrence',
    latex: `${u(0)} = ${texNumber(first)},\\quad u_{n+1} = ${affineTex(a, b, 'n')}`,
  };
}

function recurrenceSteps(challenge, value) {
  const { a, b } = challenge.spec;
  const target = challenge.targetIndex;
  const steps = [givenAffine(challenge)];
  for (let n = 1; n <= target; n += 1) steps.push(affineTermStep(a, b, n, value, { target: n === target }));

  return steps;
}

/** Les termes qui se rapprochent, le terme lointain, puis l'équation ℓ = aℓ + b. */
function limitSteps(challenge, value) {
  const { a, b } = challenge.spec;
  const far = challenge.targetIndex;
  const steps = [givenAffine(challenge)];
  for (let n = 1; n <= LEADING_TERMS; n += 1) steps.push(affineTermStep(a, b, n, value));
  const middle = Math.max(LEADING_TERMS + 1, Math.round(far / 2));
  steps.push({
    kind: 'settle', textKey: 'termsSettle', n: far, value: value(far), target: true, far: true,
    latex: `${u(middle)} ${relation(value(middle))} ${texNumber(value(middle))},\\quad ${u(far)} ${relation(value(far))} ${texNumber(value(far))}`,
  });
  steps.push({
    kind: 'fixedPoint', textKey: 'fixedPoint',
    latex: `\\ell = ${a === 1 ? '' : `${texNumber(a)}\\,`}\\ell ${b < 0 ? '-' : '+'} ${texNumber(Math.abs(b))} \\;\\Longrightarrow\\; \\ell = \\dfrac{${texNumber(b)}}{1 - ${texNumber(a, { paren: true })}} = ${texNumber(challenge.expected)}`,
  });

  return steps;
}

/** Les écarts (ou les rapports) de deux termes consécutifs, un par un. */
function findRuleSteps(challenge, value) {
  const geometric = challenge.spec.kind === 'geometric';
  const shown = [0, 1, 2, 3];
  const steps = [{
    kind: 'given', textKey: geometric ? 'givenTermsRatio' : 'givenTermsDifference',
    latex: shown.map((n) => texNumber(value(n))).join(';\\; '),
    n: 3, value: value(3), target: true,
  }];
  for (let n = 1; n < shown.length; n += 1) {
    steps.push(geometric
      ? {
        kind: 'ratio', textKey: 'divide',
        latex: `\\dfrac{${u(n)}}{${u(n - 1)}} = \\dfrac{${texNumber(value(n))}}{${texNumber(value(n - 1))}} = ${texNumber(value(n) / value(n - 1))}`,
      }
      : {
        kind: 'difference', textKey: 'subtract',
        latex: `${u(n)} - ${u(n - 1)} = ${texNumber(value(n))} - ${texNumber(value(n - 1), { paren: true })} = ${texNumber(value(n) - value(n - 1))}`,
      });
  }

  return steps;
}

/** Les premiers termes, puis la comparaison qui DÉCIDE du comportement. */
function behaviourSteps(challenge, value) {
  const { spec } = challenge;
  const shown = [0, 1, 2, 3];
  const steps = [{
    kind: 'given', textKey: 'firstTerms',
    latex: shown.map((n) => `${u(n)} = ${texNumber(value(n))}`).join(';\\; '),
    n: 3, value: value(3), target: true,
  }];
  if (spec.kind === 'arithmetic') {
    const r = spec.difference;
    steps.push({
      kind: 'compare', textKey: r > 0 ? 'compareIncreasing' : r < 0 ? 'compareDecreasing' : 'compareConstant',
      latex: `u_{n+1} - u_{n} = r = ${texNumber(r)} ${r > 0 ? '> 0' : r < 0 ? '< 0' : ''}`.trim(),
    });
  } else if (spec.kind === 'geometric') {
    const q = spec.ratio;
    let textKey = 'compareGrowing';
    let latex = `q = ${texNumber(q)} > 1`;
    if (q < 0) {
      textKey = 'compareAlternating';
      latex = `u_{n+1} = ${q === -1 ? '-' : `${texNumber(q)}\\,`}u_{n},\\quad q = ${texNumber(q)} < 0`;
    } else if (q < 1) {
      textKey = 'compareShrinking';
      latex = `u_{n+1} = ${texNumber(q)}\\,u_{n},\\quad 0 < q < 1`;
    }
    steps.push({ kind: 'compare', textKey, latex });
  }

  return steps;
}

/** Le dernier pas : la réponse, nommée, identique à `challenge.expected`. */
function answerStep(challenge) {
  const base = { kind: 'answer', textKey: 'answer', tone: 'result', expected: challenge.expected };
  switch (challenge.kind) {
    case 'arithmeticTerm':
    case 'geometricTerm':
    case 'recurrenceTerm':
      return { ...base, latex: `${u(challenge.targetIndex)} ${relation(challenge.expected)} ${texNumber(challenge.expected)}` };
    case 'limitValue':
      return { ...base, textKey: 'answerLimit', latex: `\\ell = ${texNumber(challenge.expected)}` };
    case 'findRule':
      return challenge.spec.kind === 'geometric'
        ? { ...base, textKey: 'answerRatio', latex: `q = ${texNumber(challenge.expected)}` }
        : { ...base, textKey: 'answerDifference', latex: `r = ${texNumber(challenge.expected)}` };
    case 'behaviour':
      return { ...base, textKey: 'answerChoice', latex: null, choice: challenge.expected };
    default:
      return { ...base, latex: texNumber(challenge.expected) };
  }
}

/**
 * La suite des états d'une révélation — le dernier est la réponse.
 *
 * @param {object} challenge  un défi de `generateChallenge`
 * @returns {object[]} `[]` si le défi n'a pas de suite lisible (rien à dérouler)
 */
export function buildRevealSteps(challenge) {
  if (!challenge?.spec) return [];
  const value = engineOf(challenge);
  if (!value) return [];

  let steps;
  switch (challenge.kind) {
    case 'arithmeticTerm': steps = arithmeticSteps(challenge, value); break;
    case 'geometricTerm': steps = geometricSteps(challenge, value); break;
    case 'recurrenceTerm': steps = recurrenceSteps(challenge, value); break;
    case 'limitValue': steps = limitSteps(challenge, value); break;
    case 'findRule': steps = findRuleSteps(challenge, value); break;
    case 'behaviour': steps = behaviourSteps(challenge, value); break;
    default: steps = [];
  }

  return [...steps, answerStep(challenge)];
}
