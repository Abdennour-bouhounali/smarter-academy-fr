/**
 * LE DÉROULÉ D'UNE RÉSOLUTION (équation / inéquation) — logique pure, sans React.
 *
 * « Résoudre pas à pas » ne montre jamais la réponse d'un bloc : à partir de
 * l'équation COURANTE (celle où l'élève en est sur la balance), on applique la
 * première opération que proposerait un professeur (`suggestOperations`, dans
 * l'ordre du tableau : x d'un seul côté, puis la constante, puis le
 * coefficient) avec LE moteur (`applyOperation`), jusqu'à la forme résolue.
 *
 *     2x + 3 < 9   −3 →  2x < 6   ÷2 →  x < 3   → S = ]−∞ ; 3[
 *     −2x < 6      ÷(−2) → x > −3   (flipped : le sens s'inverse)
 *     2x + 3 = 2x + 5   −2x → 3 = 5   → « Pas de solution »
 *
 * Chaque pas : `{ before, equation, operation, flipped, intermediateLatex,
 * resultLatex, explanationKey }`. Le résultat est un pas À PART (`final`) :
 * `solved` (la forme `x REL s`, l'ensemble S pour une inéquation), `none`,
 * `infinite` — jamais un faux nombre.
 */

import * as R from './rational.js';
import { applyOperation, classify, solve, isSolvedForm, equationToLatex, isInequality } from './equation.js';
import { suggestOperations } from './operationHints.js';
import { operationLatex, solutionSet } from './equationDisplay.js';

const MAX_WALKTHROUGH_STEPS = 8;

/** Plus d'inconnue écrite : `3 = 5`, `0 < 2`. */
export function hasNoUnknown(equation) {
  return R.isZero(equation.left.a) && R.isZero(equation.right.a);
}

/** La clé de la phrase d'une opération : `subtract`, `subtractX`, `divide`, `divideNegative`… */
function explanationKey(operation, flipped) {
  if (operation.term === 'x') return `${operation.kind}X`;
  if (flipped) return `${operation.kind}Negative`;

  return operation.kind;
}

/**
 * @param {object} start  l'équation de départ (equation.js)
 * @param {{maxSteps?: number, variable?: string}} [options]
 * @returns {{ steps: object[], final: object }}
 */
export function buildWalkthrough(start, { maxSteps = MAX_WALKTHROUGH_STEPS, variable = 'x' } = {}) {
  const steps = [];
  let equation = start;

  while (steps.length < maxSteps && !isSolvedForm(equation) && !hasNoUnknown(equation)) {
    const [operation] = suggestOperations(equation);
    if (!operation) break;
    const op = { kind: operation.kind, value: operation.value, ...(operation.term ? { term: operation.term } : {}) };
    const result = applyOperation(equation, op);
    if (!result.ok) break;
    steps.push({
      before: equation,
      equation: result.equation,
      operation: op,
      flipped: result.flipped,
      intermediateLatex: operationLatex(equation, op, result.flipped),
      resultLatex: equationToLatex(result.equation, variable),
      explanationKey: explanationKey(op, result.flipped),
    });
    equation = result.equation;
  }

  return { steps, final: finalOf(equation, variable) };
}

/** Le dernier pas : ce que l'état final SIGNIFIE. */
function finalOf(equation, variable) {
  const verdict = classify(equation);
  const inequality = isInequality(equation.relation);
  if (verdict.kind === 'none' || verdict.kind === 'infinite') {
    return {
      kind: verdict.kind,
      inequality,
      equation,
      latex: equationToLatex(equation, variable),
      set: solutionSet(verdict),
    };
  }
  const solved = solve(equation);

  return {
    kind: 'solved',
    inequality,
    equation: solved.equation,
    solution: solved.solution,
    relation: solved.relation,
    latex: equationToLatex(solved.equation, variable),
    set: inequality ? solutionSet(solved) : null,
  };
}
