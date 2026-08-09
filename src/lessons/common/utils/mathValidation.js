import { ComputeEngine } from '@cortex-js/compute-engine';

const ce = new ComputeEngine();

/**
 * Normalisation basique du texte LaTeX pour les comparaisons textuelles simples.
 * Supprime les espaces, normalise les symboles de multiplication, etc.
 */
export function normalizeLatexString(latex) {
  if (!latex) return '';
  return latex
    .toLowerCase()
    .replace(/\\times/g, '*')
    .replace(/\\cdot/g, '*')
    .replace(/x/g, '*') // Attention si 'x' est utilisé comme variable algébrique. Cette fonction basique n'est pas pour l'algèbre.
    .replace(/\\frac{([^}]*)}{([^}]*)}/g, '($1)/($2)')
    .replace(/\\left\(/g, '(')
    .replace(/\\right\)/g, ')')
    .replace(/\s+/g, '');
}

/**
 * Normalisation stricte pour l'algèbre où 'x' est une variable.
 */
export function normalizeAlgebraicLatex(latex) {
  if (!latex) return '';
  return latex
    .toLowerCase()
    .replace(/\\times/g, '*')
    .replace(/\\cdot/g, '*')
    // On ne remplace pas 'x' ici car c'est une variable.
    .replace(/\\frac{([^}]*)}{([^}]*)}/g, '($1)/($2)')
    .replace(/\\left\(/g, '(')
    .replace(/\\right\)/g, ')')
    .replace(/\s+/g, '');
}

/**
 * Compare mathématiquement deux expressions LaTeX en utilisant ComputeEngine.
 * Utile pour l'algèbre et les équations complexes (e.g. "x+x" vs "2x").
 */
export function isMathEqual(latex1, latex2) {
  try {
    const expr1 = ce.parse(latex1);
    const expr2 = ce.parse(latex2);
    // Compare les formes canoniques des deux expressions
    return expr1.isSame(expr2) || expr1.isEqual(expr2);
  } catch (error) {
    console.error("Math validation error:", error);
    return false;
  }
}
