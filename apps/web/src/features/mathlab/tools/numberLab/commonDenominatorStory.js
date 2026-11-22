/**
 * « توحيد المقامات » — pourquoi le PPCM des dénominateurs, en une image.
 *
 * On cherche un nombre de parts qui convienne AUX DEUX découpages : un nombre
 * que les deux dénominateurs divisent — un multiple commun — et on prend le
 * plus petit. Ce module pur prépare ce que la figure montre : les multiples de
 * chaque dénominateur jusqu'au PPCM (le premier commun, entouré), et combien
 * de parts fines donne chaque part de chaque fraction.
 */

import { lcm } from './numberTheory.js';

/** Au-delà, la liste est abrégée : les premiers, « … », puis le PPCM. */
const MAX_LISTED = 10;

/**
 * @returns {null | {
 *   denominator: number,
 *   left:  { d, factor, multiples: Array<number|'…'> },
 *   right: { d, factor, multiples: Array<number|'…'> },
 * }}
 */
export function commonDenominatorStory(dLeft, dRight) {
  if (!Number.isInteger(dLeft) || !Number.isInteger(dRight) || dLeft < 1 || dRight < 1) return null;
  const denominator = lcm(dLeft, dRight);
  if (!denominator) return null;
  const side = (d) => ({ d, factor: denominator / d, multiples: multiplesUpTo(d, denominator) });

  return { denominator, left: side(dLeft), right: side(dRight) };
}

/** Les multiples de `d` jusqu'à `limit` inclus, abrégés au-delà de MAX_LISTED. */
export function multiplesUpTo(d, limit) {
  const all = [];
  for (let m = d; m <= limit; m += d) all.push(m);
  if (all.length <= MAX_LISTED) return all;

  return [...all.slice(0, MAX_LISTED - 2), '…', all[all.length - 1]];
}
