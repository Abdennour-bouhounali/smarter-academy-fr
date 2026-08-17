/**
 * Pure geometric calculations used across lesson exercises. Extracted from
 * duplicated inline `Math.sqrt(a*a + b*b)` calculations in the
 * pythagore-3e module family (Module01Decouverte.jsx, Module02CalculHypotenuse.jsx,
 * Module03CalculCote.jsx).
 */

/** Hypotenuse length from two legs, via a^2 + b^2 = c^2. */
export function computeHypotenuse(legA, legB) {
  return Math.sqrt(legA * legA + legB * legB);
}

/** The unknown leg length from the hypotenuse and the other known leg. */
export function computePythagoreanLeg(hypotenuse, knownLeg) {
  return Math.sqrt(hypotenuse * hypotenuse - knownLeg * knownLeg);
}
