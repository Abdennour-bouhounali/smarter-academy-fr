// Primitives de formatage mutualisées — on ne les reproduit pas ici.
import { formatDec, parseDec, roundTo } from '@smarter-academy/core';

export { formatDec, parseDec, roundTo };

/**
 * massUtils — outils de conversion et de mesure des masses (6e).
 *
 * Périmètre strict : mg, g, kg, t. Conversions, choix d'unité, ordre de
 * grandeur, problèmes concrets. Pas de force, pas de newton, pas de densité,
 * pas de relation masse-volume (hors programme 6e).
 */

/** Unités du programme, de la plus grande à la plus petite. */
export const UNITS = ['t', 'kg', 'g', 'mg'];

/** Combien d'unités « mg » vaut une unité donnée (échelle commune). */
const TO_MG = { t: 1_000_000_000, kg: 1_000_000, g: 1000, mg: 1 };

/** Convertit une masse d'une unité vers une autre. */
export function convert(value, fromUnit, toUnit) {
  const mg = value * TO_MG[fromUnit];
  return roundTo(mg / TO_MG[toUnit], 6);
}

/** Facteur multiplicatif entre deux unités (ex. kg→g = 1000). */
export function factorBetween(fromUnit, toUnit) {
  return TO_MG[fromUnit] / TO_MG[toUnit];
}

/** Formate une masse avec son unité, en notation française : "2,5 kg". */
export function formatMass(value, unit) {
  return `${formatDec(value)} ${unit}`;
}

/**
 * Unité la plus adaptée pour une masse donnée en mg (heuristique d'ordre de
 * grandeur, utilisée pour construire des distracteurs plausibles — jamais
 * pour « donner » la réponse à l'élève).
 */
export function bestUnitFor(mg) {
  if (mg >= 1_000_000_000) return 't';
  if (mg >= 1_000_000) return 'kg';
  if (mg >= 1000) return 'g';
  return 'mg';
}
