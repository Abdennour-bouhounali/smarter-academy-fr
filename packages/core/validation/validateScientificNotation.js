/**
 * Validates a scientific-notation answer (coefficient × 10^exponent) given
 * as separate coefficient/exponent input strings, and classifies WHY it's
 * wrong so the caller can show exercise-specific feedback text — this
 * function only decides correctness and a reason code, never a message,
 * since the message is exercise content, not domain logic.
 *
 * Extracted from a near-identical pattern hand-duplicated in
 * Module04EcritureScientifique.jsx and Module06Bilan.jsx (puissances-3e).
 *
 * @param {string} coefficientInput - student's coefficient, e.g. "4,5"
 * @param {string} exponentInput - student's exponent, e.g. "4"
 * @param {{coefficient: number, exponent: number}} expected
 * @returns {{isCorrect: boolean, fields: {coef: boolean, exp: boolean}, reason: string|null}}
 *   reason: null | 'coef_not_numeric' | 'coef_too_large' | 'coef_too_small'
 *         | 'coef_wrong' | 'exp_not_numeric' | 'exp_wrong'
 */
export function validateScientificNotation(coefficientInput, exponentInput, expected) {
  const coefStr = String(coefficientInput ?? '').replace(',', '.').trim();
  const coefNum = Number(coefStr);

  if (coefStr === '' || Number.isNaN(coefNum)) {
    return { isCorrect: false, fields: { coef: false, exp: true }, reason: 'coef_not_numeric' };
  }
  if (coefNum >= 10) {
    return { isCorrect: false, fields: { coef: false, exp: true }, reason: 'coef_too_large' };
  }
  if (coefNum < 1) {
    return { isCorrect: false, fields: { coef: false, exp: true }, reason: 'coef_too_small' };
  }
  if (coefNum !== expected.coefficient) {
    return { isCorrect: false, fields: { coef: false, exp: true }, reason: 'coef_wrong' };
  }

  const expStr = String(exponentInput ?? '').trim();
  const expNum = Number(expStr);

  if (expStr === '' || Number.isNaN(expNum)) {
    return { isCorrect: false, fields: { coef: true, exp: false }, reason: 'exp_not_numeric' };
  }
  if (expNum !== expected.exponent) {
    return { isCorrect: false, fields: { coef: true, exp: false }, reason: 'exp_wrong' };
  }

  return { isCorrect: true, fields: { coef: true, exp: true }, reason: null };
}
