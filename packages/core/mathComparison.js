import { ComputeEngine } from '@cortex-js/compute-engine';

const ce = new ComputeEngine();

/**
 * Compare two LaTeX mathematical expressions.
 * Returns true if they are algebraically equivalent.
 * Example: "x^2 + 5x - 6" and "x^2+5*x-6" will return true.
 */
export function compareMathExpressions(expr1, expr2) {
  if (!expr1 && !expr2) return true;
  if (!expr1 || !expr2) return false;
  
  try {
    // Parse the LaTeX strings into MathJSON expressions
    const e1 = ce.parse(expr1);
    const e2 = ce.parse(expr2);
    
    // 1. Check exact structural equality (fastest)
    if (e1.isEqual(e2)) return true;
    
    // 2. Check if they are algebraically the same
    if (e1.isSame(e2)) return true;
    
    // 3. Fallback string comparison after stripping spaces (just in case ComputeEngine misses something)
    const str1 = expr1.replace(/\s+/g, '').toLowerCase();
    const str2 = expr2.replace(/\s+/g, '').toLowerCase();
    return str1 === str2;
    
  } catch (error) {
    console.error("[MathComparison] Error comparing expressions:", error);
    // Fallback to basic string comparison if parsing fails
    const str1 = expr1.replace(/\s+/g, '').toLowerCase();
    const str2 = expr2.replace(/\s+/g, '').toLowerCase();
    return str1 === str2;
  }
}

/**
 * Normalize a LaTeX mathematical expression.
 */
export function normalizeMathAnswer(expr) {
  if (!expr) return "";
  try {
    const e = ce.parse(expr);
    return e.latex; // Returns canonical latex
  } catch (err) {
    return expr;
  }
}
