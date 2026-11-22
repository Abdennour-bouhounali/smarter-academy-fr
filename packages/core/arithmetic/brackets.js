/**
 * Expressions avec parenthèses — le calcul exact de la leçon 3AM « تبسيط عبارة جبرية وحذف الأقواس » (unité 4 « الحساب الحرفي »,
 * 2026-10-20), écrit SUR `polynomials.js` (un terme est { c, p } : coefficient entier, puissance de la lettre). Importé PAR CHEMIN
 * (`packages/core/arithmetic/brackets.js`), jamais par le barrel du core (BUNDLE_BOUNDARIES §4, règle 9).
 *
 * Une EXPRESSION est une liste d'ÉLÉMENTS, dans l'ordre d'écriture :
 *   - un terme nu  { c, p }                       « + 3x », « − 5 »
 *   - un groupe    { sign: 1 | -1, terms: [...] }  « + (2x − 3) », « − (4x − 5) » — des parenthèses NON suivies de × ou ÷
 * Supprimer les parenthèses (`removeBrackets`) : un groupe précédé de + rend ses termes tels quels, un groupe précédé de − rend
 * chaque terme OPPOSÉ. La valeur (`valueAt`) est celle de l'expression écrite : elle ne change pas quand on supprime les
 * parenthèses correctement ni quand on réduit (`simplify`).
 *
 * Rien ici n'arrondit : des entiers, comparés exactement.
 */
import { reduce, evaluate, samePolynomial, termsTex, termTex } from './polynomials.js';

export const isGroup = (item) => Array.isArray(item?.terms);
export const group = (sign, terms) => ({ sign: sign < 0 ? -1 : 1, terms });
export const opposite = (t) => ({ c: -t.c, p: t.p });

/** Le terme qui sort d'un groupe de signe `sign` : tel quel si +, opposé si −. */
export const exitTerm = (sign, t) => (sign < 0 ? opposite(t) : { ...t });

/** La sortie choisie par la main (`flipped` = « signe changé ») est-elle la bonne pour ce groupe ? */
export const isRightExit = (sign, flipped) => (sign < 0) === !!flipped;

/** Les termes de l'expression SANS parenthèses, dans l'ordre d'écriture (non réduits). */
export function removeBrackets(expr) {
  return expr.flatMap((item) => (isGroup(item) ? item.terms.map((t) => exitTerm(item.sign, t)) : [{ ...item }]));
}

/** La forme réduite (semblables regroupés, puissances décroissantes). */
export const simplify = (expr) => reduce(removeBrackets(expr));

/** La valeur EXACTE de l'expression écrite pour une valeur entière de x. */
export function valueAt(expr, x) {
  return expr.reduce((s, item) => s + (isGroup(item) ? item.sign * evaluate(item.terms, x) : evaluate([item], x)), 0);
}

/** Deux expressions (ou listes de termes) sont-elles égales pour TOUTE valeur de x ? */
export const sameExpression = (a, b) => samePolynomial(removeBrackets(a), removeBrackets(b));

/**
 * Un TÉMOIN : une valeur de x (dans `range`) où les deux expressions ont des valeurs différentes — `prefer` d'abord (la valeur
 * que la main a réglée), sinon la plus petite qui marche. `null` si elles sont égales pour tout x.
 */
export function witness(a, b, { prefer = null, range = [1, 9] } = {}) {
  if (sameExpression(a, b)) return null;
  const differs = (x) => valueAt(a, x) !== valueAt(b, x);
  if (prefer != null && differs(prefer)) return prefer;
  for (let x = range[0]; x <= range[1]; x++) if (differs(x)) return x;
  for (let x = -20; x <= 20; x++) if (differs(x)) return x; // un polynôme non nul de degré ≤ 2 a au plus deux racines
  return null;
}

/** Deux termes SEMBLABLES ont la même partie littérale (la même puissance de x). */
const areLikeTerms = (s, t) => s.p === t.p;

/** Le témoin qui sépare deux termes NON semblables : une valeur de x où ils ne valent pas la même chose, s'ils ont le même coefficient. */
export function kindWitness(s, t, { prefer = null, range = [1, 9] } = {}) {
  if (areLikeTerms(s, t)) return null;
  const a = { c: 1, p: s.p }; const b = { c: 1, p: t.p };
  return witness([a], [b], { prefer, range });
}

/** L'expression en LaTeX, parenthèses comprises : « 9 - (4x - 5) + x ». */
export function expressionTex(expr, { letter = 'x' } = {}) {
  if (!expr.length) return '0';
  return expr.map((item, k) => {
    if (isGroup(item)) {
      const inner = termsTex(item.terms, { letter });
      const prefix = k === 0 ? (item.sign < 0 ? '-' : '') : (item.sign < 0 ? '- ' : '+ ');
      return `${prefix}(${inner})`;
    }
    return termTex(item, { letter, lead: k === 0 });
  }).join(' ');
}

/** La forme réduite en LaTeX : « 2x^2 + 4x - 2 », « 0 » si tout s'annule. */
export const simplifiedTex = (expr, opts) => termsTex(simplify(expr), opts);

/** Les termes sans parenthèses en LaTeX, dans l'ordre d'écriture : « 9 - 4x + 5 ». */
export const openedTex = (expr, opts) => termsTex(removeBrackets(expr), opts);

/**
 * La nature d'une expression écrite comme arbre { op: '+' | '×', args } : SOMME si la dernière opération est une addition
 * (ou une soustraction), PRODUIT si c'est une multiplication. Un terme seul (3x) est un produit de facteurs (3 × x).
 */
export function lastOperation(tree) {
  if (tree && typeof tree === 'object' && (tree.op === '+' || tree.op === '-')) return 'sum';
  if (tree && typeof tree === 'object' && (tree.op === '×' || tree.op === '*')) return 'product';
  return 'term';
}

/** Le produit de deux monômes : 3x × 5x = 15x² (coefficients multipliés, puissances additionnées). */
export const multiplyMonomials = (...ms) => ms.reduce((acc, m) => ({ c: acc.c * m.c, p: acc.p + m.p }), { c: 1, p: 0 });
