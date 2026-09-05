/**
 * algebra — fonctions affines et linéaires, côté mathématique pur.
 *
 * Une fonction affine est ici le couple `{a, b}` signifiant f(x) = a·x + b
 * (linéaire quand b = 0). Le rendu, la couleur et le repère n'existent pas à
 * ce niveau : ce fichier ne connaît que des nombres.
 *
 * TYPOGRAPHIE : `formatAffine` produit du LaTeX destiné à <MathText>, avec la
 * virgule décimale française (via texDec) et le moins typographique U+2212.
 * Les leçons ne recomposent jamais « a x + b » à la main — c'est ainsi que
 * l'ancienne leçon affichait « f(x) = 0x » et « 0.5x » avec un point.
 */

import { texDec, roundTo } from './numberFormat.js';

/** Évalue une fonction affine f(x) = a·x + b (linéaire quand b === 0). */
export function evaluateAffineFunction(a, b, x) {
  return a * x + b;
}

/**
 * Écriture LaTeX de f(x) = ax + b, simplifiée comme au tableau.
 *
 *   formatAffine(1, 0)      → "f(x) = x"
 *   formatAffine(-1, 0)     → "f(x) = −x"
 *   formatAffine(0, 3)      → "f(x) = 3"
 *   formatAffine(0, 0)      → "f(x) = 0"
 *   formatAffine(2, -3)     → "f(x) = 2x − 3"
 *   formatAffine(0.5, 1.5)  → "f(x) = 0{,}5x + 1{,}5"
 *
 * @param {number} a
 * @param {number} b
 * @param {{variable?: string, name?: string, withName?: boolean}} [opts]
 */
export function formatAffine(a, b, opts = {}) {
  const { variable = 'x', name = 'f', withName = true } = opts;
  const ra = roundTo(a);
  const rb = roundTo(b);
  const head = withName ? `${name}(${variable}) = ` : '';

  // Terme en x : disparaît si a = 0, se réduit à ±x si |a| = 1.
  let ax = '';
  if (ra !== 0) {
    if (ra === 1) ax = variable;
    else if (ra === -1) ax = `−${variable}`;
    else ax = `${texDec(ra)}${variable}`;
  }

  if (ra === 0) return `${head}${texDec(rb)}`;
  if (rb === 0) return `${head}${ax}`;

  const sign = rb > 0 ? '+' : '−';
  return `${head}${ax} ${sign} ${texDec(Math.abs(rb))}`;
}

/** Coefficient directeur de la droite (AB) — null si A et B sont alignés verticalement. */
export function slopeBetween(p, q) {
  const dx = roundTo(q.x - p.x);
  if (dx === 0) return null;
  return roundTo((q.y - p.y) / dx);
}

/**
 * La fonction affine passant par deux points : {a, b}.
 * Renvoie null si les abscisses sont égales (aucune fonction ne convient).
 */
export function affineFromTwoPoints(p, q) {
  const a = slopeBetween(p, q);
  if (a === null) return null;
  return { a, b: roundTo(p.y - a * p.x) };
}

/**
 * Intersection de deux fonctions affines.
 *   → {x, y}            quand les droites se coupent en un point
 *   → {parallel: true}  quand elles sont strictement parallèles
 *   → {same: true}      quand c'est la même droite (une infinité de points)
 */
export function intersectionOfAffine(f, g) {
  const da = roundTo(f.a - g.a);
  if (da === 0) {
    return roundTo(f.b - g.b) === 0 ? { same: true } : { parallel: true };
  }
  const x = roundTo((g.b - f.b) / da);
  return { x, y: roundTo(f.a * x + f.b) };
}

/** Vrai si la fonction est linéaire : elle passe par l'origine. */
export function isLinearAffine(f) {
  return roundTo(f.b) === 0;
}
