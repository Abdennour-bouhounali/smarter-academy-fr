/**
 * Ce que l'on ÉCRIT d'une équation en cours de résolution — logique pure.
 *
 * 1. La ligne INTERMÉDIAIRE d'une opération, avant simplification : l'élève
 *    voit l'opération posée des deux côtés, en orange, puis le résultat.
 *
 *        2x + 4 − 4 = 16 − 4        (− 4 en orange)
 *        3 × (2x + 4) = 3 × 16      (parenthèses quand le membre est une somme)
 *        (2x + 4) / 2 = 16 / 2      (fraction)
 *
 *    La relation écrite est celle APRÈS l'opération : diviser par −2 retourne
 *    déjà le sens sur cette ligne (`\frac{-2x}{-2} > \frac{6}{-2}`), sinon la
 *    ligne serait fausse. Le symbole retourné est lui aussi en orange.
 *
 * 2. L'ensemble des solutions d'une متراجحة en notation d'INTERVALLE, à la
 *    convention franco-algérienne des crochets : `]-\infty ; -3[`.
 *
 * 3. Le « نشر وتبسيط » d'une saisie avec parenthèses ou fractions : les pas
 *    du moteur de simplification pour chaque membre, quand il y a quelque
 *    chose à montrer.
 */

import * as R from './rational.js';
import { RELATION_LATEX, flipRelation, splitRelation } from './equation.js';
import { formToLatex } from './linearForm.js';
import { simplifyExpression } from './simplify.js';

export const ACCENT = '#F36D21';

const accent = (latex) => `\\textcolor{${ACCENT}}{${latex}}`;

function wrap(value) {
  return R.isNegative(value) ? `\\left(${R.toLatex(value)}\\right)` : R.toLatex(value);
}

/** Un membre qui est une SOMME doit être mis entre parenthèses pour être multiplié. */
function isSum(latex) {
  return /\s[+-]\s/.test(latex);
}

/** Le terme ajouté ou retranché : `3`, `(−3)`, `2x`, `x`. */
function addend(operation) {
  if (operation.term !== 'x') return wrap(operation.value);
  const body = formToLatex({ a: operation.value, b: R.ZERO });

  return R.isNegative(operation.value) ? `\\left(${body}\\right)` : body;
}

/** Un membre avec l'opération posée, l'opération en orange. */
export function sideWith(side, operation) {
  const value = operation.value;
  switch (operation.kind) {
    case 'add': return `${side} ${accent(`{} + ${addend(operation)}`)}`;
    case 'subtract': return `${side} ${accent(`{} - ${addend(operation)}`)}`;
    case 'multiply': return `${accent(wrap(value))} \\times ${isSum(side) || side.startsWith('-') ? `\\left(${side}\\right)` : side}`;
    case 'divide': return `\\frac{${side}}{${accent(R.toLatex(value))}}`;
    default: return side;
  }
}

/**
 * La ligne « opération posée, pas encore simplifiée ».
 * @param {object} equation   l'équation AVANT l'opération
 * @param {{kind: string, value: object}} operation
 * @param {boolean} [flipped] le sens a-t-il été retourné (× ou ÷ par un négatif, متراجحة) ?
 */
export function operationLatex(equation, operation, flipped = false) {
  const left = formToLatex(equation.left);
  const right = formToLatex(equation.right);
  const relation = flipped ? accent(RELATION_LATEX[flipRelation(equation.relation)]) : RELATION_LATEX[equation.relation];

  return `${sideWith(left, operation)} ${relation} ${sideWith(right, operation)}`;
}

/**
 * L'ensemble des solutions d'une relation résolue.
 * @param {{kind: string, solution?: object, relation?: string}} verdict  classify()
 * @returns {{latex: string, words: string, value?: string}}  `words` : clé i18n
 */
export function solutionSet(verdict) {
  if (verdict.kind === 'none') return { latex: '\\emptyset', words: 'none' };
  if (verdict.kind === 'infinite') return { latex: '\\mathbb{R}', words: 'all' };
  const s = R.toLatex(verdict.solution);
  switch (verdict.relation) {
    case '<': return { latex: `\\left]-\\infty\\,;\\,${s}\\right[`, words: 'less', value: s };
    case '<=': return { latex: `\\left]-\\infty\\,;\\,${s}\\right]`, words: 'lessEq', value: s };
    case '>': return { latex: `\\left]${s}\\,;\\,+\\infty\\right[`, words: 'greater', value: s };
    case '>=': return { latex: `\\left[${s}\\,;\\,+\\infty\\right[`, words: 'greaterEq', value: s };
    default: return { latex: `\\left\\{${s}\\right\\}`, words: 'single', value: s };
  }
}

/** Les règles qui rendent le « نشر وتبسيط » instructif (un simple `x/3` ne l'est pas). */
const MEANINGFUL = new Set(['expand', 'compute', 'group']);

/**
 * Les pas « نشر وتبسيط كل طرف » d'une saisie, ou null s'il n'y a rien à montrer.
 * @returns {null | {left: object|null, right: object|null}}  chaque membre : `{ steps }` du moteur
 */
export function equationExpansion(source) {
  const split = splitRelation(source);
  if (!split.ok) return null;
  const sides = {};
  let any = false;
  for (const side of ['left', 'right']) {
    const result = simplifyExpression(split[side], { variables: ['x'] });
    if (result.ok && result.kind === 'polynomial' && result.steps.some((step) => MEANINGFUL.has(step.kind))) {
      sides[side] = result;
      any = true;
    } else {
      sides[side] = null;
    }
  }

  return any ? sides : null;
}
