// Les primitives décimales (formatage à virgule) sont mutualisées dans
// @smarter-academy/core — on ne les reproduit pas ici, on les réexporte.
import { formatDec, texDec } from '@smarter-academy/core';

export { formatDec, texDec };

/**
 * fractionUtils — outils du sens de la fraction (6e).
 *
 * Périmètre strict du programme : fractions simples (demi, tiers, quart,
 * dixième), fraction-partage, fraction-quotient dans des cas très simples,
 * repérage sur une demi-droite graduée, lien avec les fractions décimales
 * déjà étudiées.
 *
 * HORS PÉRIMÈTRE : addition/soustraction/multiplication/division de
 * fractions, dénominateur commun, algorithme de simplification, fractions à
 * dénominateur quelconque. Aucun outil ici ne les produit — les fractions
 * équivalentes utilisées dans la leçon sont des cas visuels choisis à la
 * main (1/2 = 2/4, 1/2 = 5/10), jamais un simplificateur générique.
 */

/** Code LaTeX d'une fraction, pour <MathText>. */
export function texFrac(n, d) {
  return `\\frac{${n}}{${d}}`;
}

/** Valeur numérique d'une fraction. */
export function fracValue(n, d) {
  return n / d;
}

/** Partie entière + reste d'une fraction : 5/4 → { whole: 1, remNum: 1, den: 4 }. */
export function wholeAndRemainder(n, d) {
  const whole = Math.floor(n / d);
  const remNum = n - whole * d;
  return { whole, remNum, den: d };
}

/** Noms des fractions unitaires usuelles du programme de 6e. */
export const PART_NAME = {
  2: { s: 'demi', p: 'demis', article: 'un demi' },
  3: { s: 'tiers', p: 'tiers', article: 'un tiers' },
  4: { s: 'quart', p: 'quarts', article: 'un quart' },
  5: { s: 'cinquième', p: 'cinquièmes', article: 'un cinquième' },
  6: { s: 'sixième', p: 'sixièmes', article: 'un sixième' },
  8: { s: 'huitième', p: 'huitièmes', article: 'un huitième' },
  10: { s: 'dixième', p: 'dixièmes', article: 'un dixième' },
  100: { s: 'centième', p: 'centièmes', article: 'un centième' },
};

/** « 3 quarts », « 1 demi », etc. */
export function partName(n, d) {
  const meta = PART_NAME[d];
  if (!meta) return `${n}/${d}`;
  return n === 1 ? meta.article : `${n} ${meta.p}`;
}

/** Position d'une fraction n/d en toutes lettres pour les aria-labels. */
export function fracAriaLabel(n, d) {
  return `${n} ${d === 1 ? 'unité' : 'sur ' + d}`;
}

/**
 * Formateur de graduation pour <NumberLine format={...}> : affiche les
 * entiers (0, 1, 2…) en toutes lettres et les valeurs intermédiaires en
 * fraction « n/d ». Texte brut (pas de KaTeX) : c'est un usage d'étiquette
 * d'axe, comme formatFr/formatDec ailleurs dans l'application.
 */
export function fracLineFormat(den) {
  return (v) => {
    const n = Math.round(v * den);
    return n % den === 0 ? String(n / den) : `${n}/${den}`;
  };
}
