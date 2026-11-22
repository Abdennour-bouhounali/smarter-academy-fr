/**
 * Le NOMBRE RELATIF SUR UNE JAUGE VERTICALE sous le « ميزان الصقيع » (1AM, unité 5 « الأعداد النسبية », درس « الأعداد النسبية وسياقات
 * استعمالها », 2026-10-30) — arithmétique ENTIÈRE exacte, sans virgule flottante.
 *
 * Une jauge est `{ step, min, max }` : une graduation vaut `step` (1 degré, 10 m, 1 étage…), la jauge va de `min` à `max` (multiples de `step`).
 * Un nombre relatif est un entier en unités de la jauge (−3 = trois graduations sous le zéro, 40 m sous le niveau de la mer = −40 avec `step` 10).
 * La main tient le NIVEAU ; le nombre relatif est une SORTIE : son signe (au-dessus / au-dessous du zéro) et sa distance au zéro (le nombre de
 * graduations jusqu'au zéro, fois `step`) sont deux lectures DIFFÉRENTES du même niveau — c'est l'idée du labo.
 *
 * Écriture : `text` donne « -3 » (signe ASCII ; l'écran le met en « − » dans un îlot LTR) ; un positif n'a jamais de signe ; 0 n'a ni l'un ni l'autre.
 * Importé PAR CHEMIN (`@smarter-academy/core/arithmetic/signedGauge.js`), jamais par le barrel du cœur (BUNDLE_BOUNDARIES §4).
 */

/** « au-dessus » (+), « au-dessous » (−) ou « sur » le zéro. */
export const sideOf = (v) => (v > 0 ? 'above' : v < 0 ? 'below' : 'zero');
/** La distance au zéro : toujours ≥ 0. */
export const distance = (v) => Math.abs(v);
/** Le nombre opposé : même distance au zéro, côté contraire (0 est son propre opposé). */
export const opposite = (v) => (v === 0 ? 0 : -v);
/** Deux nombres sont opposés quand leur somme est nulle (0 et 0 le sont). */
export const areOpposite = (a, b) => a + b === 0;
/** « -3 », « 3 », « 0 ». */
export const text = (v) => String(v === 0 ? 0 : v);
/** Le nombre relatif d'un niveau à `d` du zéro, côté `side` ('above' | 'below'). */
export function fromSideDistance(side, d) {
  if (d < 0) throw new Error('distance négative');
  if (side !== 'above' && side !== 'below') throw new Error(`côté inconnu : ${side}`);
  return side === 'below' && d > 0 ? -d : d;
}

/** Une jauge normalisée ; lève si mal formée. */
export function gauge({ step, min, max }) {
  if (!Number.isInteger(step) || step <= 0) throw new Error('pas de jauge invalide');
  if (min % step !== 0 || max % step !== 0 || !(min < 0 && max > 0)) throw new Error('bornes de jauge invalides');
  return Object.freeze({ step, min, max, gmin: min / step, gmax: max / step });
}
/** Le nombre de graduations d'une valeur (entier) ; lève si la valeur n'est pas sur une graduation. */
export function gradOf(g, v) {
  if (v % g.step !== 0) throw new Error(`${v} n'est pas sur une graduation de pas ${g.step}`);
  return v / g.step;
}
export const valueOf = (g, grad) => grad * g.step;
/** Une graduation ramenée dans la jauge. */
export const clampGrad = (g, grad) => Math.max(g.gmin, Math.min(g.gmax, Math.round(grad)));

/** Le plus petit (le plus « froid ») d'une liste de relatifs et son rang. */
export function lowest(values) {
  let at = 0;
  values.forEach((v, i) => { if (v < values[at]) at = i; });
  return { at, value: values[at] };
}
/** Le plus éloigné du zéro (distance maximale), son rang : en cas d'égalité, le premier. */
export function farthest(values) {
  let at = 0;
  values.forEach((v, i) => { if (distance(v) > distance(values[at])) at = i; });
  return { at, value: values[at] };
}
/** Tous les nombres de la jauge à la distance `d` du zéro : [−d, d] (un seul, 0, si d = 0). */
export const atDistance = (d) => (d === 0 ? [0] : [-d, d]);
/** Le classement d'une liste : positifs, négatifs (0 appartient aux deux, comme le dit la définition), paires opposées. */
export function classify(values) {
  const positives = values.filter((v) => v >= 0);
  const negatives = values.filter((v) => v <= 0);
  const pairs = [];
  values.forEach((a, i) => values.forEach((b, j) => { if (i < j && a === -b && a !== 0) pairs.push([a, b]); }));
  return { positives, negatives, pairs };
}
