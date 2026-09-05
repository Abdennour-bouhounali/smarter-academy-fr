// Primitives de formatage mutualisées — on ne les reproduit pas ici.
import { formatDec, parseDec, roundTo } from '@smarter-academy/core';

export { formatDec, parseDec, roundTo };

/**
 * perimUtils — outils de calcul des périmètres (6e).
 *
 * Périmètre strict du programme : somme des côtés d'un polygone, formules
 * du rectangle 2 × (L + l) et du carré 4 × c, et première approche de la
 * longueur du cercle P ≈ π × D avec π ≈ 3,14 (toujours ≈, jamais =, et on
 * ne « remonte » jamais de P vers D — hors programme 6e).
 */

/** Unités de longueur du programme, de la plus grande à la plus petite. */
export const UNITS = ['km', 'm', 'dm', 'cm', 'mm'];

/** Combien de mm vaut une unité donnée (échelle commune). */
const TO_MM = { km: 1_000_000, m: 1000, dm: 100, cm: 10, mm: 1 };

/** Convertit une longueur d'une unité vers une autre. */
export function convert(value, fromUnit, toUnit) {
  const mm = value * TO_MM[fromUnit];
  return roundTo(mm / TO_MM[toUnit], 6);
}

/** Facteur multiplicatif entre deux unités (ex. m→cm = 100). */
export function factorBetween(fromUnit, toUnit) {
  return TO_MM[fromUnit] / TO_MM[toUnit];
}

/** Formate une longueur avec son unité, en notation française : "29,8 m". */
export function formatLength(value, unit) {
  return `${formatDec(value)} ${unit}`;
}

/** Unité la plus adaptée pour une longueur donnée en mm (distracteurs). */
export function bestUnitFor(mm) {
  if (mm >= 1_000_000) return 'km';
  if (mm >= 1000) return 'm';
  if (mm >= 10) return 'cm';
  return 'mm';
}

/** Périmètre d'un polygone = somme de ses côtés. */
export function perimeter(sides) {
  return roundTo(sides.reduce((s, v) => s + v, 0), 6);
}

/** Périmètre du rectangle : P = 2 × (L + l). */
export function rectanglePerimeter(L, l) {
  return roundTo(2 * (L + l), 6);
}

/** Périmètre du carré : P = 4 × c. */
export function squarePerimeter(c) {
  return roundTo(4 * c, 6);
}

/**
 * Longueur du cercle : P ≈ π × D. En 6e, π vaut 3,14 et le résultat est
 * TOUJOURS approché (à afficher avec ≈).
 */
export function circleCircumference(d, pi = 3.14) {
  return roundTo(pi * d, 6);
}
