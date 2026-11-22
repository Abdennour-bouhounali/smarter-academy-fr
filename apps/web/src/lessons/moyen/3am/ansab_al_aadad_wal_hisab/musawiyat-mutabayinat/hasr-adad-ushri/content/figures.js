/**
 * La figure de معارف « المدوّر وحصره » : une droite graduée sur trois repères — r − ½u, r, r + ½u — où l'on peint le mot des nombres de mudawwar r. Les
 * nombres sont des DONNÉES (calculées ici avec `decimals.js`, importé PAR CHEMIN) ; `figures.test.js` les recompte avec un autre code. Le dessin est dans
 * ./RoundingLine.jsx (SVG, texte arabe vivant).
 */
import * as D from '@smarter-academy/core/arithmetic/decimals.js';

/** { lo, r, hi, loIncluded, hiIncluded, rank } pour le mot des nombres dont le mudawwar à `rank` décimales est `r` (texte à virgule). */
export function roundingLine(rText, rank) {
  const r = D.parse(rText);
  if (!r || r.k !== rank) throw new Error(`roundingLine: « ${rText} » doit avoir ${rank} décimale(s)`);
  const iv = D.roundingInterval(r, rank);
  return {
    rank, r: D.formatTrim(r), lo: D.formatTrim(iv.lo), hi: D.formatTrim(iv.hi), loIncluded: iv.loIncluded, hiIncluded: iv.hiIncluded,
  };
}

/** La figure de l'exemple de معارف : le mudawwar à l'unité est 9 → 8,5 ≤ x < 9,5. */
export const ROUNDING_FIGURE = roundingLine('9', 0);
