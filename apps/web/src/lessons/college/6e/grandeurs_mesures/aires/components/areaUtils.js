// Primitives de formatage mutualisées — on ne les reproduit pas ici.
import { formatDec, parseDec, roundTo } from '@smarter-academy/core';

export { formatDec, parseDec, roundTo };

/**
 * areaUtils — outils de mesure des aires (6e).
 *
 * Périmètre strict du programme : aire par pavage/comptage, aires du carré
 * et du rectangle, unités usuelles d'aire. La marche entre deux unités
 * d'aire voisines vaut ×100 (car 10 × 10) — c'est LE contraste avec les
 * longueurs (×10) que la leçon met en scène. dam² et hm² figurent dans la
 * table pour que factorBetween reste juste sur n'importe quelle paire,
 * mais are/hectare (autre système de noms) restent hors leçon.
 */

/** Unités d'aire, de la plus grande à la plus petite. exp = puissance de 10 par rapport au m². */
export const UNITS = ['km²', 'hm²', 'dam²', 'm²', 'dm²', 'cm²', 'mm²'];

const EXP = { 'km²': 6, 'hm²': 4, 'dam²': 2, 'm²': 0, 'dm²': -2, 'cm²': -4, 'mm²': -6 };

/** Facteur multiplicatif entre deux unités d'aire (ex. m²→cm² = 10 000). */
export function factorBetween(fromUnit, toUnit) {
  return 10 ** (EXP[fromUnit] - EXP[toUnit]);
}

/** Convertit une aire d'une unité vers une autre. */
export function convert(value, fromUnit, toUnit) {
  return roundTo(value * factorBetween(fromUnit, toUnit), 6);
}

/** Formate une aire avec son unité, en notation française : "12,5 cm²". */
export function formatArea(value, unit) {
  return `${formatDec(value)} ${unit}`;
}

/** Unité la plus adaptée pour une aire donnée en m² (distracteurs). */
export function bestUnitFor(m2) {
  if (m2 >= 1_000_000) return 'km²';
  if (m2 >= 1) return 'm²';
  if (m2 >= 0.0001) return 'cm²';
  return 'mm²';
}

/** Aire du rectangle : A = L × l. */
export function rectangleArea(L, l) {
  return roundTo(L * l, 6);
}

/** Aire du carré : A = c × c. */
export function squareArea(c) {
  return roundTo(c * c, 6);
}
