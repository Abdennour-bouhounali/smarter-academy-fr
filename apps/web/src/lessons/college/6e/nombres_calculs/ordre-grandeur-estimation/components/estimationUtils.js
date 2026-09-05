// Primitives de formatage mutualisées — on ne les reproduit pas ici.
import { formatFr } from '@smarter-academy/core';

export { formatFr };

/**
 * estimationUtils — outils du contrôle de résultat par ordre de grandeur (6e).
 *
 * Périmètre strict : estimer un résultat, ordre de grandeur d'une somme,
 * d'une différence, d'un produit. Aucune inéquation, aucune notation
 * scientifique, aucun chiffre significatif.
 *
 * Validateurs PURS (aucun React) : la séparation interaction / validation
 * mathématique passe par ce fichier.
 */

/**
 * Les deux « nombres amis » qui encadrent n pour un pas donné.
 * friendlyNeighbours(197, 10) → { lower: 190, upper: 200, nearest: 200 }
 *
 * Cas « pile au milieu » (750 au pas de 100) : convention scolaire, on
 * arrondit AU-DESSUS → nearest = upper. Le contenu du Module 3 enseigne
 * exactement cette convention — garder les deux cohérents.
 */
export function friendlyNeighbours(n, step) {
  const lower = Math.floor(n / step) * step;
  const upper = lower + step;
  const nearest = n - lower < upper - n ? lower : upper;
  return { lower, upper, nearest };
}

/**
 * Classe un résultat proposé par rapport à une estimation :
 *   'plausible'  → proche de l'estimation (dans la marge tolérée)
 *   'suspect'    → dans le bon ordre de grandeur mais assez loin
 *   'impossible' → ordre de grandeur complètement différent
 *
 * La marge est relative à l'estimation elle-même (15 % = plausible,
 * 50 % = suspect, au-delà = impossible), pas une valeur absolue fixe.
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
