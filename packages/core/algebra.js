/**
 * Pure algebraic evaluation helpers. Extracted from repeated inline
 * `f(x) = a*x + b` definitions across the fonctions-lineaires-affines
 * module family (e.g. Module03TableauValeurs.jsx).
 */

/** Evaluates an affine function f(x) = a*x + b (linear when b === 0). */
export function evaluateAffineFunction(a, b, x) {
  return a * x + b;
}
