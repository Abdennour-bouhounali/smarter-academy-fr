/**
 * « حلّ المثلث خطوة بخطوة » — le RAISONNEMENT qui mène des deux données au
 * triangle entier, en pas successifs. Logique PURE : aucune chaîne arabe,
 * aucun React — des clés i18n, des paramètres et du LaTeX.
 *
 * Le dessin (TriangleStage) reste VIVANT : il se résout à chaque frappe et à
 * chaque glissement, parce qu'on lit en manipulant. Ce qui se DÉROULE ici,
 * c'est l'écriture du manuel de 4AM :
 *
 *     choisir la nisba qui relie le connu à l'inconnu → écrire l'égalité
 *     → substituer → isoler → calculer        (puis l'autre inconnue)
 *     → l'autre angle aigu (90° − θ) → le triangle résolu (DERNIER pas)
 *
 * Notation : a = الضلع المقابل, b = الضلع المجاور, c = الوتر, θ la zone aiguë.
 * Le dernier pas reprend les valeurs de `solveRightTriangle` — le moteur reste
 * la seule source de vérité, arrondies EXACTEMENT comme sur le dessin
 * (`formatLength`, `formatDegrees(…, 1)`).
 */

import { solveRightTriangle, sinOf, cosOf, tanOf } from './trigMath.js';
import { exactValue, CURRICULUM_ANGLES } from './exactValues.js';
import { exactToLatex } from './trigFormat.js';
import { formatValue } from '../functionGrapher/grapherFormat.js';

/** Les deux champs que chaque configuration donne (le reste de `triangle` est périmé). */
export const GIVEN_FIELDS = Object.freeze({
  'angle-hyp': ['angle', 'hypotenuse'],
  'angle-opp': ['angle', 'opposite'],
  'angle-adj': ['angle', 'adjacent'],
  'opp-adj': ['opposite', 'adjacent'],
  'opp-hyp': ['opposite', 'hypotenuse'],
  'adj-hyp': ['adjacent', 'hypotenuse'],
});

const SYMBOL = Object.freeze({ opposite: 'a', adjacent: 'b', hypotenuse: 'c', angle: '\\theta' });
const LENGTH_DECIMALS = 2;
const ANGLE_DECIMALS = 1;
const RATIO_DECIMALS = 4;

/** Un nombre en LaTeX, avec les MÊMES chiffres que l'affichage (virgule, arrondi). */
export function latexNumber(value, decimals = LENGTH_DECIMALS) {
  return formatValue(value, decimals).replace('−', '-').replace(',', '{,}');
}

const isRounded = (value, decimals) => Math.abs(value - Number(value.toFixed(decimals))) < 1e-9;
const relation = (value, decimals) => (isRounded(value, decimals) ? '=' : '\\approx');
const deg = (value) => `${latexNumber(value, ANGLE_DECIMALS)}^\\circ`;
const math = (latex) => `$${latex}$`;

/** Les rapports : quels côtés, et dans quel ordre (numérateur / dénominateur). */
const RATIOS = Object.freeze({
  sin: { num: 'opposite', den: 'hypotenuse', of: sinOf },
  cos: { num: 'adjacent', den: 'hypotenuse', of: cosOf },
  tan: { num: 'opposite', den: 'adjacent', of: tanOf },
});

/** Le rapport qui relie deux côtés (dans n'importe quel ordre). */
function ratioLinking(first, second) {
  return Object.keys(RATIOS).find((key) => {
    const { num, den } = RATIOS[key];

    return (num === first && den === second) || (num === second && den === first);
  });
}

/**
 * Une INCONNUE côté, avec θ et un côté connus : 4 pas.
 * `known` / `wanted` : 'opposite' | 'adjacent' | 'hypotenuse'.
 */
function sideFromAngle(theta, known, knownValue, wanted, wantedValue) {
  const ratio = ratioLinking(known, wanted);
  const { num, den } = RATIOS[ratio];
  const w = SYMBOL[wanted];
  const k = latexNumber(knownValue);
  const fraction = (n, d) => `\\dfrac{${n}}{${d}}`;
  const general = fraction(SYMBOL[num], SYMBOL[den]);
  const substituted = wanted === num ? fraction(w, k) : fraction(k, w);
  const ratioAt = `\\${ratio} ${deg(theta)}`;
  // L'inconnue au numérateur : on MULTIPLIE ; au dénominateur : on DIVISE.
  const multiply = wanted === num;
  const isolated = multiply ? `${w} = ${k} \\times ${ratioAt}` : `${w} = \\dfrac{${k}}{${ratioAt}}`;

  const exact = CURRICULUM_ANGLES.includes(Math.round(theta * 1e6) / 1e6) ? exactValue(theta, ratio) : null;
  const exactLatex = exact ? exactToLatex(exact) : null;
  const value = latexNumber(wantedValue);
  const rel = relation(wantedValue, LENGTH_DECIMALS);
  const computed = exactLatex
    ? `${w} = ${multiply ? `${k} \\times ${exactLatex}` : `\\dfrac{${k}}{${exactLatex}}`} ${rel} ${value}`
    : `${w} = ${multiply ? `${k} \\times ${ratioAt}` : `\\dfrac{${k}}{${ratioAt}}`} ${rel} ${value}`;

  return [
    {
      kind: 'chooseRatio',
      textKey: 'tools.trigonometry.solve.steps.chooseRatio',
      params: { wantedSide: wanted, knownSide: known, ratioName: ratio },
      latex: `\\${ratio}\\theta = ${general}`,
    },
    {
      kind: 'substitute',
      textKey: 'tools.trigonometry.solve.steps.substitute',
      params: {},
      latex: `${ratioAt} = ${substituted}`,
    },
    {
      kind: 'isolate',
      textKey: multiply ? 'tools.trigonometry.solve.steps.isolateMultiply' : 'tools.trigonometry.solve.steps.isolateDivide',
      params: { factor: math(k), ratio: math(ratioAt), unknown: math(w) },
      latex: isolated,
    },
    {
      kind: 'compute',
      textKey: exactLatex ? 'tools.trigonometry.solve.steps.computeExact' : 'tools.trigonometry.solve.steps.computeCalculator',
      params: { ratio: math(ratioAt), unknown: math(w) },
      latex: computed,
    },
  ];
}

/** Une inconnue côté par PYTHAGORE, les deux autres côtés connus : 3 pas. */
function sideByPythagoras(values, wanted, wantedValue) {
  const w = SYMBOL[wanted];
  const hyp = wanted === 'hypotenuse';
  const others = ['opposite', 'adjacent', 'hypotenuse'].filter((side) => side !== wanted);
  const [first, second] = hyp ? others : ['hypotenuse', others.find((side) => side !== 'hypotenuse')];
  const f = values[first];
  const s = values[second];
  const square = hyp ? f * f + s * s : f * f - s * s;
  const sq = (v) => `${latexNumber(v)}^2`;
  const squareText = latexNumber(square, 4);

  return [
    {
      kind: 'pythagoras',
      textKey: hyp ? 'tools.trigonometry.solve.steps.pythagorasHyp' : 'tools.trigonometry.solve.steps.pythagorasLeg',
      params: { wantedSide: wanted },
      latex: hyp
        ? `c^2 = a^2 + b^2`
        : `${w}^2 = c^2 - ${SYMBOL[second]}^2`,
    },
    {
      kind: 'substitute',
      textKey: 'tools.trigonometry.solve.steps.substituteSquares',
      params: {},
      latex: `${w}^2 = ${sq(f)} ${hyp ? '+' : '-'} ${sq(s)} ${relation(square, 4)} ${squareText}`,
    },
    {
      kind: 'compute',
      textKey: 'tools.trigonometry.solve.steps.squareRoot',
      params: { unknown: math(w) },
      latex: `${w} = \\sqrt{${squareText}} ${relation(wantedValue, LENGTH_DECIMALS)} ${latexNumber(wantedValue)}`,
    },
  ];
}

/** L'angle θ à partir de deux côtés : 3 pas (le rapport, sa valeur, la touche inverse). */
function angleFromSides(values, first, second, theta) {
  const ratio = ratioLinking(first, second);
  const { num, den, of } = RATIOS[ratio];
  const quotient = values[num] / values[den];

  return [
    {
      kind: 'chooseRatio',
      textKey: 'tools.trigonometry.solve.steps.chooseRatioAngle',
      params: { firstSide: num, secondSide: den, ratioName: ratio },
      latex: `\\${ratio}\\theta = \\dfrac{${SYMBOL[num]}}{${SYMBOL[den]}}`,
    },
    {
      kind: 'substitute',
      textKey: 'tools.trigonometry.solve.steps.substituteRatio',
      params: {},
      latex: `\\${ratio}\\theta = \\dfrac{${latexNumber(values[num])}}{${latexNumber(values[den])}} ${relation(quotient, RATIO_DECIMALS)} ${latexNumber(quotient, RATIO_DECIMALS)}`,
    },
    {
      kind: 'inverse',
      textKey: 'tools.trigonometry.solve.steps.inverseKey',
      params: { key: math(`\\${ratio}^{-1}`), ratio: math(`\\${ratio}\\theta`) },
      // La vérification de cohérence est dans les tests : of(theta) ≈ quotient.
      latex: `\\theta ${relation(theta, ANGLE_DECIMALS)} ${deg(theta)}`,
      check: of(theta),
    },
  ];
}

/**
 * Le déroulé complet pour une configuration.
 *
 * @param {string} given  une clé de GIVEN_FIELDS
 * @param {object} triangle  `{angle, opposite, adjacent, hypotenuse}` (seuls les deux champs donnés comptent)
 * @returns {{ok: true, steps: object[], solved: object, key: string} | {ok: false, reason: string}}
 */
export function buildTriangleSolveSteps(given, triangle) {
  const fields = GIVEN_FIELDS[given];
  if (!fields) return { ok: false, reason: 'given' };
  const solved = solveRightTriangle(given, triangle);
  if (!solved.ok) return solved;

  const known = Object.fromEntries(fields.map((field) => [field, triangle[field]]));
  const all = {
    angle: solved.angle, opposite: solved.opposite, adjacent: solved.adjacent, hypotenuse: solved.hypotenuse,
  };
  const wanted = ['opposite', 'adjacent', 'hypotenuse', 'angle'].filter((field) => !fields.includes(field));

  const steps = [{
    kind: 'data',
    textKey: fields.includes('angle') ? 'tools.trigonometry.solve.steps.dataAngle' : 'tools.trigonometry.solve.steps.dataSides',
    params: {
      firstField: fields[0],
      secondField: fields[1],
      wantedFirst: wanted[0],
      wantedSecond: wanted[1],
      notation: math('a'), notationB: math('b'), notationC: math('c'),
    },
    latex: fields.map((field) => `${SYMBOL[field]} = ${field === 'angle' ? deg(known[field]) : latexNumber(known[field])}`).join(' \\qquad '),
  }];

  if (fields.includes('angle')) {
    const knownSide = fields.find((field) => field !== 'angle');
    for (const side of wanted) {
      steps.push(...sideFromAngle(solved.angle, knownSide, known[knownSide], side, all[side]));
    }
  } else {
    // Deux côtés : l'angle par le rapport qui les relie, le troisième côté par Pythagore.
    steps.push(...angleFromSides(all, fields[0], fields[1], solved.angle));
    const side = wanted.find((field) => field !== 'angle');
    steps.push(...sideByPythagoras(all, side, all[side]));
  }

  steps.push({
    kind: 'otherAngle',
    textKey: 'tools.trigonometry.solve.steps.otherAngle',
    params: { right: math('90^\\circ') },
    latex: `90^\\circ - ${deg(solved.angle)} ${relation(solved.otherAngle, ANGLE_DECIMALS)} ${deg(solved.otherAngle)}`,
  });

  const r = (value, decimals) => relation(value, decimals);
  steps.push({
    kind: 'result',
    tone: 'result',
    textKey: 'tools.trigonometry.solve.steps.result',
    params: {},
    latex: [
      `a ${r(solved.opposite, LENGTH_DECIMALS)} ${latexNumber(solved.opposite)}`,
      `b ${r(solved.adjacent, LENGTH_DECIMALS)} ${latexNumber(solved.adjacent)}`,
      `c ${r(solved.hypotenuse, LENGTH_DECIMALS)} ${latexNumber(solved.hypotenuse)}`,
      `\\theta ${r(solved.angle, ANGLE_DECIMALS)} ${deg(solved.angle)}`,
    ].join(' \\quad '),
  });

  return { ok: true, steps, solved, key: solveKey(given, triangle) };
}

/** Ce qui définit la question : la configuration et SES deux données (la clé de remise à zéro). */
export function solveKey(given, triangle) {
  const fields = GIVEN_FIELDS[given] ?? [];

  return [given, ...fields.map((field) => triangle?.[field])].join('|');
}
