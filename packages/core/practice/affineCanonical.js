/**
 * Forme canonique d'une fonction affine : le couple exact (a, b) de f(x) = ax + b.
 *
 * C'est ce qui dissout le « problème du CAS » pour cette leçon. `2(x + 3)` et
 * `2x + 6` sont le même objet non pas parce qu'un moteur de calcul formel le
 * démontre, mais parce que les deux se réduisent au même couple (2 ; 6). Une
 * réponse de 2de sur les fonctions affines n'est jamais de l'algèbre libre :
 * c'est un couple de rationnels.
 *
 * Le lecteur LaTeX ci-dessous accepte une grammaire VOLONTAIREMENT restreinte —
 * une somme de termes, chacun constant ou en x. Il REFUSE `2(x+3)` au lieu de
 * le développer : le format de réponse annoncé à l'élève est « ax + b », donc
 * une écriture parenthésée est hors contrat. Refuser est honnête ; analyser de
 * travers ne l'est pas. Un refus devient `syntax_error`, pas `incorrect`.
 */
import { Rational, normalizeNumeric } from './rational.js';

/** @typedef {{a: Rational, b: Rational}} CanonicalAffine */

/**
 * @param {{a: string|number, b: string|number}} pair
 * @returns {CanonicalAffine|null}
 */
export function affineFromPair(pair) {
  if (!pair || typeof pair !== 'object') return null;
  const a = Rational.parse(pair.a);
  const b = Rational.parse(pair.b);
  return a && b ? { a, b } : null;
}

/**
 * Lit « 2x - 3 », « -3 + 2x », « f(x) = 2x - 3 », « y=-x+1 », « 5 », « x ».
 * Renvoie null sur toute écriture hors grammaire (puissance, quotient en x,
 * parenthèses, produit de x par x).
 *
 * @param {string} raw
 * @returns {CanonicalAffine|null}
 */
export function affineFromLatex(raw) {
  if (typeof raw !== 'string') return null;

  let s = normalizeNumeric(raw)
    .replace(/^[a-z]\([a-z]\)=/i, '')   // f(x)=
    .replace(/^y=/i, '')
    .replace(/\\cdot|\\times|\*/g, '');

  if (s === '') return null;
  // Tout ce qui sort de la grammaire « somme de termes en x ou constants ».
  if (/[()^]|x\s*x|\/\s*x|\\frac\{[^}]*x/.test(s)) return null;

  // Découpe en termes signés : « -3+2x » → ['-3', '+2x'].
  const terms = s.match(/[+-]?[^+-]+/g);
  if (!terms) return null;

  let a = Rational.of(0);
  let b = Rational.of(0);

  for (const term of terms) {
    if (term === '+' || term === '-') return null;
    if (term.includes('x')) {
      const coeffText = term.slice(0, term.indexOf('x'));
      if (term.slice(term.indexOf('x') + 1) !== '') return null; // « 2xy », « 2x3 »
      let coeff;
      if (coeffText === '' || coeffText === '+') coeff = Rational.of(1);
      else if (coeffText === '-') coeff = Rational.of(-1);
      else coeff = Rational.parse(coeffText);
      if (!coeff) return null;
      a = a.add(coeff);
    } else {
      const constant = Rational.parse(term);
      if (!constant) return null;
      b = b.add(constant);
    }
  }

  return a && b ? { a, b } : null;
}

/**
 * Analyse une réponse quelle que soit sa forme de saisie : le couple structuré
 * {a, b} (deux champs, le mode par défaut) ou une expression LaTeX.
 * @returns {CanonicalAffine|null}
 */
export function parseAffineAnswer(answer) {
  if (answer && typeof answer === 'object' && !Array.isArray(answer)) {
    if (typeof answer.latex === 'string') return affineFromLatex(answer.latex);
    return affineFromPair(answer);
  }
  if (typeof answer === 'string') return affineFromLatex(answer);
  return null;
}

/**
 * Compare deux fonctions affines, coefficient par coefficient.
 *
 * `matchedA` / `matchedB` séparés est ce qui rend possible l'issue
 * `partially_correct` — et avec elle le meilleur retour de tout le lot :
 * « ton coefficient directeur est bon, regarde la valeur en x = 0 ».
 *
 * @returns {{equal: boolean, matchedA: boolean, matchedB: boolean}}
 */
export function affineEquals(given, expected) {
  if (!given || !expected) return { equal: false, matchedA: false, matchedB: false };
  const matchedA = given.a.equals(expected.a);
  const matchedB = given.b.equals(expected.b);
  return { equal: matchedA && matchedB, matchedA, matchedB };
}

/** Forme canonique stable pour l'audit : « a=2;b=-3 ». */
export const affineToString = (f) => (f ? `a=${f.a.toString()};b=${f.b.toString()}` : '');
