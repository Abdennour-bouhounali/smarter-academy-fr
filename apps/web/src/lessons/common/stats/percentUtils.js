/**
 * Proportions, pourcentages et évolutions — noyau partagé par les leçons
 * « Proportions et pourcentages » et « Évolutions successives et
 * réciproques » de 2nde.
 *
 * Fonctions PURES. Elles portent la distinction que les deux leçons
 * enseignent et que les élèves confondent :
 *
 *   PROPORTION  p = partie / tout            — un état, sans unité, dans [0 ; 1]
 *   ÉVOLUTION   t = (fin − début) / début    — une variation, relative au DÉBUT
 *   COEFFICIENT k = 1 + t                    — ce par quoi on MULTIPLIE
 *
 * Une proportion et un taux d'évolution s'écrivent tous deux « % » : c'est
 * la source d'erreur principale. D'où aussi `percentagePointDifference`,
 * qui nomme la différence de deux proportions en POINTS, jamais en pour cent.
 */

/** Proportion partie/tout. `null` si le tout est nul (jamais Infinity). */
export function proportion(part, whole) {
  if (!whole) return null;
  return part / whole;
}

/**
 * Proportion d'une proportion : « 60 % des élèves sont demi-pensionnaires,
 * et 25 % de ceux-là sont externes le mercredi » → 0,60 × 0,25 = 0,15 de
 * l'ensemble. Les proportions emboîtées se MULTIPLIENT ; elles ne
 * s'additionnent pas, et le résultat se rapporte à la population ENTIÈRE.
 */
export function nestedProportion(outer, inner) {
  return outer * inner;
}

/** Taux d'évolution (fin − début) / début. `null` si la valeur initiale est nulle. */
export function evolutionRate(initial, final) {
  if (!initial) return null;
  return (final - initial) / initial;
}

/** Coefficient multiplicateur associé à un taux : k = 1 + t. */
export const coefficient = (rate) => 1 + rate;

/** Taux associé à un coefficient : t = k − 1. */
export const rateFromCoefficient = (k) => k - 1;

/** Valeur finale après une évolution de taux `rate`. */
export const applyRate = (value, rate) => value * (1 + rate);

/**
 * Coefficient global d'évolutions successives : le PRODUIT des coefficients.
 * C'est le cœur de la leçon 2 — +20 % puis −20 % donne 1,2 × 0,8 = 0,96,
 * soit −4 %, et non 0 %.
 */
export const globalCoefficient = (rates) => rates.reduce((k, r) => k * (1 + r), 1);

/** Taux d'évolution global d'une suite d'évolutions successives. */
export const globalRate = (rates) => globalCoefficient(rates) - 1;

/**
 * Coefficient RÉCIPROQUE : celui qui ramène à la valeur de départ.
 * k' = 1/k — jamais −k ni 2 − k. `null` si k est nul.
 */
export function reciprocalCoefficient(k) {
  if (!k) return null;
  return 1 / k;
}

/**
 * Taux réciproque d'un taux : t' = 1/(1 + t) − 1.
 * Après +25 % il faut −20 % (et non −25 %) pour revenir au départ.
 */
export function reciprocalRate(rate) {
  const k = 1 + rate;
  if (!k) return null;
  return 1 / k - 1;
}

/** Valeur initiale retrouvée à partir de la valeur finale et du coefficient. */
export function initialValue(final, k) {
  if (!k) return null;
  return final / k;
}

/**
 * Différence de deux proportions, exprimée en POINTS de pourcentage.
 * Passer de 20 % à 25 %, c'est +5 POINTS mais +25 % (une évolution) :
 * `percentagePointDifference` donne 0,05, `evolutionRate` donne 0,25.
 */
export const percentagePointDifference = (from, to) => to - from;

/**
 * Évolution d'un état à un autre exprimée en % relatif — l'autre lecture
 * de la même paire de proportions, fournie à côté de la précédente pour
 * que les leçons puissent afficher les deux et les contraster.
 */
export const relativeChange = (from, to) => evolutionRate(from, to);
