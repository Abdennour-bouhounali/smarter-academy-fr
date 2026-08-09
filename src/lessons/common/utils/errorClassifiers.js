/**
 * errorClassifiers.js
 * Utilities for detecting common mathematical errors.
 * These return an object { message: '...' } if the error is detected, or null otherwise.
 */

// Example: Student forgot the square root (e.g. 100 instead of 10)
export function isMissingSquareRoot(studentVal, expectedVal) {
  const s = parseFloat(studentVal?.toString().replace(',', '.'));
  const e = parseFloat(expectedVal?.toString().replace(',', '.'));
  
  if (!isNaN(s) && !isNaN(e)) {
    // Check if student value is roughly the square of the expected value
    if (Math.abs(s - (e * e)) < 0.01) {
      return { message: `Tu as calculé le carré (${s}), mais n'oublie pas d'utiliser la racine carrée pour trouver la longueur finale !` };
    }
  }
  return null;
}

// Example: Student has a sign error (e.g. -5 instead of 5)
export function isSignError(studentVal, expectedVal) {
  const s = parseFloat(studentVal?.toString().replace(',', '.'));
  const e = parseFloat(expectedVal?.toString().replace(',', '.'));
  
  if (!isNaN(s) && !isNaN(e) && e !== 0) {
    if (Math.abs(s + e) < 0.01) {
      return { message: "Attention au signe : as-tu bien appliqué la règle des signes lors du changement de côté ou de la multiplication ?" };
    }
  }
  return null;
}

// Example: Student calculated a + b instead of a^2 + b^2 or a * b
export function isAdditionInsteadOfMultiplication(studentVal, expectedVal) {
    // This requires context of a and b, which can be passed as an options object if needed.
    return null;
}
