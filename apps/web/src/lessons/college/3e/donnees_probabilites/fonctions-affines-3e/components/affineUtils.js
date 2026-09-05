/**
 * affineUtils — la mathématique des fonctions affines, sans aucun pixel.
 *
 * Une fonction affine est le couple `{a, b}` : f(x) = ax + b. Ce fichier reste
 * mince parce que l'essentiel vit déjà dans `@smarter-academy/core`
 * (`formatAffine`, `affineFromTwoPoints`, `slopeBetween`,
 * `intersectionOfAffine`) — on ne réécrit pas ce qui existe, on ajoute ce que
 * la leçon demande en propre.
 *
 * LE RÔLE SÉPARÉ DES DEUX PARAMÈTRES est la leçon, et il est testable :
 *   `stepDelta` ne dépend QUE de a  → b ne change pas l'inclinaison.
 *   `image(a, b, 0) === b`          → a ne change pas le point de départ.
 *
 * TARIFS ET ÉGALITÉS — `cheapest` renvoie une LISTE d'identifiants, jamais un
 * seul. Deux tarifs peuvent coûter exactement pareil : l'ancienne leçon
 * déclarait une seule bonne réponse et refusait la réponse correcte de l'élève.
 */

import { roundTo, formatDec, formatAffine, affineFromTwoPoints, slopeBetween, intersectionOfAffine } from '@smarter-academy/core';

/** f(x) = ax + b. */
export function image(a, b, x) {
  if (![a, b, x].every(Number.isFinite)) return null;
  return roundTo(a * x + b, 6);
}

/** L'antécédent de y : l'unique x tel que ax + b = y (null si a = 0). */
export function antecedent(a, b, y) {
  if (![a, b, y].every(Number.isFinite)) return null;
  if (roundTo(a, 9) === 0) return null;
  return roundTo((y - b) / a, 6);
}

/** Tableau de valeurs : [{x, y}]. */
export function tableOf(a, b, xs) {
  return xs.map((x) => ({ x: roundTo(x, 6), y: image(a, b, x) }));
}

/**
 * De combien f monte quand x avance de dx.
 * Ne dépend PAS de b — c'est la moitié de la leçon, et c'est un test.
 */
export function stepDelta(a, dx = 1) {
  if (!Number.isFinite(a) || !Number.isFinite(dx)) return null;
  return roundTo(a * dx, 6);
}

/** Fait glisser la droite verticalement : a est inchangé. */
export function shiftB(f, delta) {
  return { a: f.a, b: roundTo(f.b + delta, 6) };
}

/** Le nom précis de la famille : linéaire ⊂ affine. */
export function classifyAffine(a, b) {
  if (roundTo(a, 9) === 0) return 'constante';
  if (roundTo(b, 9) === 0) return 'lineaire';
  return 'affine';
}

/** Re-export : l'expression passant par deux points. */
export { affineFromTwoPoints, slopeBetween, formatAffine };

/** Re-export : le point où deux tarifs coûtent pareil. */
export const breakEven = intersectionOfAffine;

/**
 * Les tarifs les MOINS chers en x — une liste, car il peut y avoir égalité.
 * `plans` : [{ id, a, b }].
 */
export function cheapest(plans, x) {
  const priced = plans
    .map((p) => ({ id: p.id, price: image(p.a, p.b, x) }))
    .filter((p) => p.price !== null);
  if (priced.length === 0) return [];
  const min = Math.min(...priced.map((p) => p.price));
  return priced.filter((p) => roundTo(p.price - min, 6) === 0).map((p) => p.id);
}

/** « 0,20 € par minute, plus 6 € d'abonnement » — pour une correction. */
export function describePlan(a, b, { per = 'minute', unit = ' €' } = {}) {
  const rate = `${formatDec(a)}${unit} par ${per}`;
  if (roundTo(b, 9) === 0) return `${rate}, sans rien à payer d'avance`;
  return `${rate}, plus ${formatDec(b)}${unit} d'avance`;
}

/**
 * La facture d'une course : la part fixe, la part qui court, le total.
 * `total === fixed + variable` par construction, et `variable` ne dépend que
 * de a et x — c'est la lecture en deux lignes que le compteur affiche.
 */
export function receipt(a, b, x) {
  if (![a, b, x].every(Number.isFinite)) return null;
  const variable = roundTo(a * x, 6);
  return { fixed: roundTo(b, 6), variable, total: roundTo(b + variable, 6) };
}
