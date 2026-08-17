import { parseDec } from '../numberFormat';
import { compareMathExpressions } from '../mathComparison';

/**
 * Validates a student's numeric/algebraic answer against an expected value.
 *
 * Formalizes the pattern already duplicated inline across many exercise
 * modules: try algebraic equivalence first (so "1/2" matches "0.5", or a
 * differently-ordered but equal expression matches), then fall back to a
 * tolerance-based numeric comparison for plain numeric input.
 *
 * Matches the canonical Exercise Result contract (see
 * docs/architecture/EXERCISE_CONTRACT.md) — the return value can be passed
 * straight through as a useAdaptiveExercise `validate` result.
 *
 * @param {string} studentInput - Raw student input (French or English decimal notation, or LaTeX).
 * @param {number} expectedValue - The correct numeric answer.
 * @param {{tolerance?: number, allowAlgebraic?: boolean}} [options]
 * @returns {{isCorrect: boolean}}
 */
export function validateNumericAnswer(studentInput, expectedValue, options = {}) {
  const { tolerance = 0.01, allowAlgebraic = true } = options;

  if (allowAlgebraic && compareMathExpressions(studentInput, String(expectedValue))) {
    return { isCorrect: true };
  }

  const parsed = parseDec(studentInput);
  const isCorrect = !Number.isNaN(parsed) && Math.abs(parsed - expectedValue) < tolerance;
  return { isCorrect };
}
