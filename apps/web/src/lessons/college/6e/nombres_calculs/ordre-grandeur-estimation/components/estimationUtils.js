// Primitives de formatage mutualisées — on ne les reproduit pas ici.
import { formatFr, formatDec, roundTo } from '@smarter-academy/core';

export { formatFr, formatDec };

/**
 * estimationUtils — outils du contrôle de résultat par ordre de grandeur (6e).
 *
 * Périmètre strict : estimer un résultat, ordre de grandeur d'une somme,
 * d'une différence, d'un produit. Aucune inéquation, aucune notation
 * scientifique, aucun chiffre significatif.
 */

/** Arrondit n au multiple de `step` le plus proche (ex. roundToStep(197, 10) → 200). */
export function roundToStep(n, step) {
  return Math.round(n / step) * step;
}

/**
 * Les deux « nombres amis » qui encadrent n pour un pas donné.
 * roundToStep(197, 10) → { lower: 190, upper: 200, nearest: 200 }
 */
export function friendlyNeighbours(n, step) {
  const lower = Math.floor(n / step) * step;
  const upper = lower + step;
  const nearest = n - lower <= upper - n ? lower : upper;
  return { lower, upper, nearest };
}

/**
 * Pas d'arrondi « raisonnable » suggéré pour un nombre, afin d'obtenir un
 * nombre facile à calculer mentalement (dizaine pour un nombre à 2-3
 * chiffres, centaine au-delà). Sert de suggestion, pas de règle imposée :
 * plusieurs pas restent acceptables pour une même estimation.
 */
export function suggestedStep(n) {
  const abs = Math.abs(n);
  if (abs < 100) return 10;
  if (abs < 1000) return 100;
  return 1000;
}

/** Résultat exact d'une opération simple. */
export function exactResult(a, b, op) {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '×') return a * b;
  return NaN;
}

/**
 * Classe un résultat proposé par rapport à une estimation :
 *   'plausible'  → proche de l'estimation (dans la marge tolérée)
 *   'suspect'    → dans le bon ordre de grandeur mais assez loin
 *   'impossible' → ordre de grandeur complètement différent
 *
 * La marge est relative à l'estimation elle-même (10 % = plausible,
 * 40 % = suspect, au-delà = impossible), pas une valeur absolue fixe.
 */
export function classifyPlausibility(estimate, proposed) {
  if (estimate === 0) return proposed === 0 ? 'plausible' : 'impossible';
  const ratio = Math.abs(proposed - estimate) / Math.abs(estimate);
  if (ratio <= 0.15) return 'plausible';
  if (ratio <= 0.5) return 'suspect';
  return 'impossible';
}

/** Formatte un calcul « a op b » en texte lisible, ex. "198 + 302". */
export function calcText(a, b, op) {
  return `${formatFr(a)} ${op} ${formatFr(b)}`;
}
