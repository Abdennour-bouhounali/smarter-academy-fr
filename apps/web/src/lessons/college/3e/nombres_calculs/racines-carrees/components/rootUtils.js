import { formatDec, parseDec, roundTo, texDec } from '@smarter-academy/core';

export { formatDec, parseDec, roundTo };

/**
 * rootUtils — la logique pure de la leçon « Racine carrée » (3e).
 *
 * MODÈLE (une seule source de vérité, playbook §4) :
 *  - une racine simplifiée est `{ coef, radicand }` = coef × √radicand,
 *    avec `radicand = 1` pour un entier pur (√36 → { coef: 6, radicand: 1 }) ;
 *  - un encadrement est `[k, k + 1]`, le couple d'entiers consécutifs dont
 *    les carrés encadrent n.
 *
 * Tout ce que les modules affichent (aire du carré, côté, encadrement,
 * forme a√b, comparaison) est DÉRIVÉ de ces fonctions — jamais recopié à la
 * main, jamais un facteur magique dans un JSX.
 *
 * Note typographique : `formatDec` (comme `texDec`) émet le moins
 * typographique français U+2212 « − », pas le tiret ASCII.
 */

/* ── Carrés parfaits ──────────────────────────────────────────────── */

/** Racine carrée entière par défaut : isqrt(20) = 4, isqrt(49) = 7. */
export function isqrt(n) {
  if (!Number.isFinite(n) || n < 0) return NaN;
  let k = Math.floor(Math.sqrt(n));
  // Corrige les rares erreurs de flottant aux bornes (ex. 4503599627370496).
  while (k * k > n) k -= 1;
  while ((k + 1) * (k + 1) <= n) k += 1;
  return k;
}

/** Vrai si n est le carré d'un entier (0 et 1 compris ; jamais pour n < 0). */
export function isPerfectSquare(n) {
  if (!Number.isInteger(n) || n < 0) return false;
  const k = isqrt(n);
  return k * k === n;
}

/**
 * Encadrement de √n par deux entiers consécutifs : bracket(20) = [4, 5].
 * Pour un carré parfait, les deux bornes sont égales : bracket(49) = [7, 7]
 * — √49 vaut exactement 7, il n'y a rien à encadrer.
 */
export function bracket(n) {
  const k = isqrt(n);
  return k * k === n ? [k, k] : [k, k + 1];
}

/** Le plus grand carré parfait qui divise n (1 si n n'en a pas d'autre). */
export function largestSquareFactor(n) {
  if (!Number.isInteger(n) || n <= 0) return 1;
  let best = 1;
  for (let k = 1; k * k <= n; k += 1) {
    if (n % (k * k) === 0) best = k * k;
  }
  return best;
}

/* ── Simplification ───────────────────────────────────────────────── */

/**
 * √n → { coef, radicand } tel que √n = coef × √radicand, avec `radicand`
 * sans facteur carré.
 *   simplifyRoot(12) → { coef: 2, radicand: 3 }
 *   simplifyRoot(36) → { coef: 6, radicand: 1 }
 *   simplifyRoot(7)  → { coef: 1, radicand: 7 }
 */
export function simplifyRoot(n) {
  if (!Number.isInteger(n) || n < 0) return { coef: NaN, radicand: NaN };
  if (n === 0) return { coef: 0, radicand: 1 };
  const sq = largestSquareFactor(n);
  return { coef: isqrt(sq), radicand: n / sq };
}

/** √a × √b = √(ab) — retourne la forme simplifiée du produit. */
export function rootProduct(a, b) {
  return simplifyRoot(a * b);
}

/** √a ÷ √b = √(a/b) — forme simplifiée, ou null si le quotient n'est pas entier. */
export function rootQuotient(a, b) {
  if (!b || a % b !== 0) return null;
  return simplifyRoot(a / b);
}

/** Valeur décimale approchée de √n, arrondie à `digits` décimales. */
export function approxRoot(n, digits = 2) {
  return roundTo(Math.sqrt(n), digits);
}

/* ── Formatage LaTeX ──────────────────────────────────────────────── */

/**
 * Une racine (nombre ou forme { coef, radicand }) en LaTeX :
 *   formatRoot(12)                      → '2\\sqrt{3}'
 *   formatRoot({coef: 6, radicand: 1})  → '6'
 *   formatRoot({coef: 1, radicand: 3})  → '\\sqrt{3}'
 *   formatRoot(0)                       → '0'
 */
export function formatRoot(input) {
  const r = typeof input === 'number' ? simplifyRoot(input) : input;
  if (!r || Number.isNaN(r.coef)) return '';
  if (r.coef === 0) return '0';
  if (r.radicand === 1) return texDec(r.coef);
  const head = r.coef === 1 ? '' : texDec(r.coef);
  return `${head}\\sqrt{${texDec(r.radicand)}}`;
}

/** √n non simplifié, en LaTeX : formatSqrt(20) → '\\sqrt{20}'. */
export function formatSqrt(n) {
  return `\\sqrt{${texDec(n)}}`;
}

/** L'encadrement en LaTeX : '4 < \\sqrt{20} < 5' (ou l'égalité si carré parfait). */
export function formatBracket(n) {
  const [lo, hi] = bracket(n);
  if (lo === hi) return `${formatSqrt(n)} = ${texDec(lo)}`;
  return `${texDec(lo)} < ${formatSqrt(n)} < ${texDec(hi)}`;
}

/* ── Comparaison ──────────────────────────────────────────────────── */

/**
 * Compare √n à un nombre positif k, PAR LES CARRÉS (jamais par une
 * approximation décimale) : −1 si √n < k, 0 si égal, +1 si √n > k.
 */
export function compareRootToNumber(n, k) {
  const k2 = roundTo(k * k);
  if (n === k2) return 0;
  return n < k2 ? -1 : 1;
}

/** Le carré de a√b, c'est-à-dire a²b — l'entier sous la racine reconstituée. */
export function squareOfRoot({ coef, radicand }) {
  return coef * coef * radicand;
}

/** Compare deux formes { coef, radicand } par leurs carrés. */
export function compareRoots(r1, r2) {
  const s1 = squareOfRoot(r1);
  const s2 = squareOfRoot(r2);
  if (s1 === s2) return 0;
  return s1 < s2 ? -1 : 1;
}
