// Primitives de formatage mutualisées — on ne les reproduit pas ici.
import { formatDec, parseDec, roundTo } from '@smarter-academy/core';

export { formatDec, parseDec, roundTo };

/**
 * capacityUtils — outils de conversion et de mesure des contenances (6e).
 *
 * Périmètre strict : L, dL, cL, mL. Conversions, choix d'unité, ordre de
 * grandeur, problèmes concrets, lien 1 L = 1 dm³. Pas de calcul de volume
 * de solides quelconques, pas de densité, pas de relation masse-volume
 * (hors programme 6e).
 */

/** Unités du programme, de la plus grande à la plus petite. */
export const UNITS = ['L', 'dL', 'cL', 'mL'];

/** Combien d'unités « mL » vaut une unité donnée (échelle commune). */
const TO_ML = { L: 1000, dL: 100, cL: 10, mL: 1 };

/** Convertit une contenance d'une unité vers une autre. */
export function convert(value, fromUnit, toUnit) {
  const ml = value * TO_ML[fromUnit];
  return roundTo(ml / TO_ML[toUnit], 6);
}

/** Facteur multiplicatif entre deux unités (ex. L→cL = 100). */
export function factorBetween(fromUnit, toUnit) {
  return TO_ML[fromUnit] / TO_ML[toUnit];
}

/** Formate une contenance avec son unité, en notation française : "1,5 L". */
export function formatCapacity(value, unit) {
  return `${formatDec(value)} ${unit}`;
}

/**
 * Unité la plus adaptée pour une contenance donnée en mL (heuristique
 * d'ordre de grandeur, utilisée pour construire des distracteurs
 * plausibles — jamais pour « donner » la réponse à l'élève).
 */
export function bestUnitFor(ml) {
  if (ml >= 1000) return 'L';
  if (ml >= 100) return 'dL';
  if (ml >= 10) return 'cL';
  return 'mL';
}
