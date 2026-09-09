/**
 * exprTex — l'écriture des expressions du premier degré, en LaTeX français.
 *
 * Séparé de `exprCore` à dessein : le noyau ne connaît que des nombres, ce
 * fichier ne connaît que l'écriture. Une leçon n'assemble JAMAIS « ax + b »
 * à la main — c'est ainsi qu'on obtenait « 1x », « + −3 » et des points
 * décimaux anglais.
 *
 * Conventions respectées (les mêmes que `packages/core/algebra.js`) :
 *   - le moins est le moins typographique U+2212, jamais le trait d'union ;
 *   - la virgule décimale est française, écrite `{,}` en LaTeX pour que
 *     KaTeX n'y mette pas d'espace ;
 *   - un coefficient 1 disparaît, −1 se réduit à « −x » ;
 *   - un terme nul disparaît, et l'expression nulle s'écrit « 0 ».
 */

import { ratIsInt, ratIsDecimal, ratToNumber, ratSign, ratAbs, ratIsZero, ratEq, rat } from './exprCore';

const MINUS = '−';

/** Le décimal français d'un nombre, en LaTeX : 2,5 → "2{,}5". */
const texNumber = (v) => {
  const s = String(Math.round(v * 1e9) / 1e9).replace('.', ',');
  return s.includes(',') ? s.replace(',', '{,}') : s;
};

/**
 * Écrit un rationnel POSITIF ou nul. Un rationnel non décimal s'écrit en
 * fraction (\dfrac) : 1/3 reste 1/3, il ne devient pas 0,333.
 */
function texNonNegRat(r) {
  if (ratIsInt(r)) return String(r.n);
  if (ratIsDecimal(r)) return texNumber(ratToNumber(r));
  return `\\dfrac{${r.n}}{${r.d}}`;
}

/** Écrit un rationnel quelconque, signe compris. */
export function texRat(r) {
  if (ratSign(r) < 0) return `${MINUS}${texNonNegRat(ratAbs(r))}`;
  return texNonNegRat(r);
}

/**
 * Le terme en x, coefficient compris : "" si nul, "x" si 1, "−x" si −1,
 * sinon "3x" ou "\dfrac{2}{3}x".
 */
export function texXTerm(coef, variable = 'x') {
  if (ratIsZero(coef)) return '';
  if (ratEq(coef, rat(1))) return variable;
  if (ratEq(coef, rat(-1))) return `${MINUS}${variable}`;
  return `${texRat(coef)}${variable}`;
}

/**
 * L'expression x·(inconnue) + k, écrite comme au tableau.
 *
 *   texExpr(expr(3, -2))   → "3x − 2"
 *   texExpr(expr(1, 0))    → "x"
 *   texExpr(expr(0, 0))    → "0"
 *   texExpr(expr(-1, 5))   → "−x + 5"
 */
export function texExpr(e, variable = 'x') {
  const xPart = texXTerm(e.x, variable);
  if (ratIsZero(e.k)) return xPart || '0';
  if (!xPart) return texRat(e.k);
  const sign = ratSign(e.k) < 0 ? MINUS : '+';
  return `${xPart} ${sign} ${texNonNegRat(ratAbs(e.k))}`;
}

/**
 * Une LISTE de termes, non réduite, dans l'ordre où l'élève la lit :
 * "3x + 2 − 5x + 1". Le premier terme porte son signe collé, les suivants
 * un opérateur espacé — la ponctuation d'une somme, pas d'une suite.
 */
export function texTerms(terms, variable = 'x') {
  if (terms.length === 0) return '0';
  return terms
    .map((t, i) => {
      const neg = ratSign(t.coef) < 0;
      const body = t.isX ? texXTerm(ratAbs(t.coef), variable) : texNonNegRat(ratAbs(t.coef));
      if (i === 0) return neg ? `${MINUS}${body}` : body;
      return `${neg ? MINUS : '+'} ${body}`;
    })
    .join(' ');
}

/** Le produit c·(ax + b), parenthèses comprises : "3(2x − 5)". */
export function texProduct(c, inner, variable = 'x') {
  const f = texRat(c);
  const head = f === '1' ? '' : f === `${MINUS}1` ? MINUS : f;
  return `${head}(${texExpr(inner, variable)})`;
}

/** Le produit de deux binômes : "(2x + 1)(x − 3)". */
export function texDoubleProduct(left, right, variable = 'x') {
  return `(${texExpr(left, variable)})(${texExpr(right, variable)})`;
}

/** La forme développée réduite d'un produit double : "2x² − 5x − 3". */
export function texQuadratic(q, variable = 'x') {
  const parts = [];
  if (!ratIsZero(q.x2)) {
    const c = ratEq(q.x2, rat(1)) ? '' : ratEq(q.x2, rat(-1)) ? MINUS : texRat(q.x2);
    parts.push(`${c}${variable}^2`);
  }
  const rest = texExpr({ x: q.x, k: q.k }, variable);
  if (parts.length === 0) return rest;
  if (rest === '0') return parts[0];
  const sign = rest.startsWith(MINUS) ? MINUS : '+';
  return `${parts[0]} ${sign} ${rest.replace(new RegExp(`^${MINUS}`), '')}`;
}

/** L'équation, membre = membre : "3x + 1 = 7". */
export function texEquation(eq, variable = 'x') {
  return `${texExpr(eq.left, variable)} = ${texExpr(eq.right, variable)}`;
}

/** La solution, telle qu'on la conclut : "x = 4" / "x = \dfrac{1}{3}". */
export function texSolution(sol, variable = 'x') {
  if (sol.kind === 'none') return 'aucune solution';
  if (sol.kind === 'all') return 'tout nombre convient';
  return `${variable} = ${texRat(sol.value)}`;
}
