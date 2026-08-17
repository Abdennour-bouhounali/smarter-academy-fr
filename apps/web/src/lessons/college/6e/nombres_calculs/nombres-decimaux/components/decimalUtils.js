import {
  formatDec,
  texDec,
  parseDec,
  roundTo,
  decEquals,
  decimalPlaces,
} from '@smarter-academy/core';

// Primitives de formatage mutualisées (@smarter-academy/core), réexportées
// pour que les modules de la leçon n'aient qu'un seul point d'import.
export { formatDec, texDec, parseDec, roundTo, decEquals, decimalPlaces };

/**
 * decimalUtils — outils de numération décimale (6e).
 *
 * Périmètre strict du programme :
 * fractions décimales (dénominateurs 10, 100, 1000), écriture à virgule,
 * valeur de position, comparaison, rangement, droite graduée, ordre de grandeur.
 *
 * HORS PÉRIMÈTRE (5e et au-delà) : fractions non décimales comme 1/3, 2/5, 7/8,
 * fraction irréductible, fraction-quotient. Aucun outil ici ne les produit.
 */

/** Colonnes du tableau de numération décimal, de la plus grande à la plus petite. */
export const DEC_PLACES = [
  { key: 'D',  label: 'Dizaines',  shortLabel: 'D', value: 10,    side: 'int', singular: 'dizaine',  plural: 'dizaines' },
  { key: 'U',  label: 'Unités',    shortLabel: 'U', value: 1,     side: 'int', singular: 'unité',    plural: 'unités' },
  { key: 'd1', label: 'Dixièmes',  shortLabel: 'd', value: 0.1,   side: 'dec', den: 10,   singular: 'dixième',  plural: 'dixièmes' },
  { key: 'd2', label: 'Centièmes', shortLabel: 'c', value: 0.01,  side: 'dec', den: 100,  singular: 'centième', plural: 'centièmes' },
  { key: 'd3', label: 'Millièmes', shortLabel: 'm', value: 0.001, side: 'dec', den: 1000, singular: 'millième', plural: 'millièmes' },
];

export const PLACE_BY_KEY = Object.fromEntries(DEC_PLACES.map((p) => [p.key, p]));

/**
 * Découpe un décimal en cellules du tableau de numération.
 * Le calcul passe par une chaîne (toFixed) : jamais d'arithmétique flottante
 * sur les chiffres, donc pas de 0,30000000000000004.
 *
 * @param {number} n
 * @param {{intPlaces?: number, decPlaces?: number}} [opts]
 * @returns {{key,label,side,digit,contributed}[]}
 */
export function decCells(n, opts = {}) {
  const { intPlaces = 2, decPlaces = 3 } = opts;
  const fixed = Math.abs(n).toFixed(decPlaces);
  const [ipRaw, dpRaw = ''] = fixed.split('.');
  const ip = ipRaw.padStart(intPlaces, '0');
  const dp = dpRaw.padEnd(decPlaces, '0');

  const intCells = DEC_PLACES.filter((p) => p.side === 'int').slice(-intPlaces);
  const decCellsList = DEC_PLACES.filter((p) => p.side === 'dec').slice(0, decPlaces);

  return [
    ...intCells.map((p, i) => ({
      ...p,
      digit: Number(ip[ip.length - intCells.length + i]),
      contributed: roundTo(Number(ip[ip.length - intCells.length + i]) * p.value),
    })),
    ...decCellsList.map((p, i) => ({
      ...p,
      digit: Number(dp[i]),
      contributed: roundTo(Number(dp[i]) * p.value),
    })),
  ];
}

/**
 * Fraction décimale associée : 3,7 → 37/10 ; 3,25 → 325/100 ; 4 → 4/1.
 * Le dénominateur est toujours une puissance de 10 (périmètre 6e).
 */
export function toDecimalFraction(n) {
  const dp = decimalPlaces(n);
  const den = 10 ** dp;
  return { num: Math.round(n * den), den, dp };
}

/**
 * Décomposition en unités + fractions décimales.
 * 3,75 → { whole: 3, parts: [{digit:7, den:10}, {digit:5, den:100}] }
 */
export function decDecompose(n) {
  const whole = Math.floor(Math.abs(n));
  const dp = decimalPlaces(n);
  const fixed = Math.abs(n).toFixed(Math.max(dp, 0));
  const [, dec = ''] = fixed.split('.');
  const parts = [];
  for (let i = 0; i < dec.length; i += 1) {
    const digit = Number(dec[i]);
    if (digit !== 0) parts.push({ digit, den: 10 ** (i + 1) });
  }
  return { whole, parts };
}

/** Nom de l'ordre décimal d'un rang : 1 → dixièmes, 2 → centièmes, 3 → millièmes. */
export function orderName(rank, plural = true) {
  const p = DEC_PLACES.find((x) => x.den === 10 ** rank);
  if (!p) return '';
  return plural ? p.plural : p.singular;
}

/**
 * Convertit un décimal en un nombre entier de sous-unités.
 * asUnitsOf(3.7, 10) → 37 (« 37 dixièmes »)
 * asUnitsOf(0.37, 100) → 37 (« 37 centièmes »)
 */
export function asUnitsOf(n, den) {
  return Math.round(n * den);
}

/**
 * Aligne deux décimaux sur le même nombre de décimales, en complétant par des
 * zéros : [2.37, 2.4] → { a:'2,37', b:'2,40', dp:2 }.
 * C'est le geste clé pour comparer 2,37 et 2,4 sans se tromper.
 */
export function alignDecimals(a, b) {
  const dp = Math.max(decimalPlaces(a), decimalPlaces(b));
  return {
    dp,
    aText: formatDec(a, { minDecimals: dp, maxDecimals: dp }),
    bText: formatDec(b, { minDecimals: dp, maxDecimals: dp }),
    aUnits: asUnitsOf(a, 10 ** dp),
    bUnits: asUnitsOf(b, 10 ** dp),
  };
}

/**
 * Encadrement de n par les multiples de `unit` : frameDec(4.37, 0.1) → [4.3, 4.4].
 */
export function frameDec(n, unit) {
  const low = roundTo(Math.floor(roundTo(n / unit, 9)) * unit);
  return [low, roundTo(low + unit)];
}

/** Arrondi à l'entier le plus proche + le repère le plus proche (ordre de grandeur). */
export function nearestWhole(n) {
  return Math.round(n);
}

/**
 * Compare deux décimaux position par position et renvoie l'indice de la
 * première colonne qui diffère (sur des cellules alignées), ou -1 si égaux.
 */
export function firstDifferingCell(a, b, opts) {
  const ca = decCells(a, opts);
  const cb = decCells(b, opts);
  for (let i = 0; i < ca.length; i += 1) {
    if (ca[i].digit !== cb[i].digit) return i;
  }
  return -1;
}
