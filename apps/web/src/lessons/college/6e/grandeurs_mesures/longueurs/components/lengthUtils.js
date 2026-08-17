// Primitives de formatage mutualisées — on ne les reproduit pas ici.
import { formatDec, parseDec, roundTo } from '@smarter-academy/core';

export { formatDec, parseDec, roundTo };

/**
 * lengthUtils — outils de conversion et de mesure des longueurs (6e).
 *
 * Périmètre strict : km, m, cm, mm (le dm n'est pas une unité exigée par le
 * programme et n'est utilisé nulle part ici). Conversions, choix d'unité,
 * ordre de grandeur, périmètre de polygones. Pas d'aire, pas de calcul
 * avec π au-delà d'une première approche (exclu du périmètre de cette
 * leçon comme du programme officiel).
 */

/** Unités du programme, de la plus grande à la plus petite. */
export const UNITS = ['km', 'm', 'cm', 'mm'];

/** Combien d'unités « mm » vaut une unité donnée (échelle commune). */
const TO_MM = { km: 1_000_000, m: 1000, cm: 10, mm: 1 };

/** Convertit une longueur d'une unité vers une autre. */
export function convert(value, fromUnit, toUnit) {
  const mm = value * TO_MM[fromUnit];
  return roundTo(mm / TO_MM[toUnit], 6);
}

/** Facteur multiplicatif entre deux unités adjacentes ou non (ex. m→cm = 100). */
export function factorBetween(fromUnit, toUnit) {
  return TO_MM[fromUnit] / TO_MM[toUnit];
}

/** Formate une longueur avec son unité, en notation française : "2,5 m". */
export function formatLength(value, unit) {
  return `${formatDec(value)} ${unit}`;
}

/**
 * Unité la plus adaptée pour une longueur donnée en mm (heuristique
 * d'ordre de grandeur, utilisée pour construire des distracteurs
 * plausibles — jamais pour « donner » la réponse à l'élève).
 */
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
