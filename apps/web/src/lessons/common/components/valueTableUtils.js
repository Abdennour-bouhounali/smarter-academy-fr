import { roundTo } from '@smarter-academy/core';

/**
 * valueTableUtils — la logique pure derrière ValueTable.
 *
 * Une colonne est { id, label, fn: (x) => number }. Une ligne est le
 * résultat de toutes les colonnes pour une même valeur de x, avec le verdict
 * « toutes égales ? » — c'est ce verdict qui porte l'idée d'équivalence
 * (deux écritures sont la même expression si elles coïncident pour TOUTE
 * valeur, une seule valeur commune ne prouve rien).
 */
export function evaluateRow(columns, x, dp = 6) {
  const values = columns.map((c) => roundTo(c.fn(x), dp));
  const allEqual = values.every((v) => v === values[0]);
  return { x, values, allEqual };
}

export function buildRows(columns, xs, dp = 6) {
  return xs.map((x) => evaluateRow(columns, x, dp));
}

/** Les valeurs de x où toutes les colonnes coïncident (utile pour un « probe »). */
export function agreeingXs(columns, xs, dp = 6) {
  return buildRows(columns, xs, dp).filter((r) => r.allEqual).map((r) => r.x);
}

/** Vrai si les colonnes coïncident sur toutes les valeurs testées. */
export function allAgree(columns, xs, dp = 6) {
  return buildRows(columns, xs, dp).every((r) => r.allEqual);
}
