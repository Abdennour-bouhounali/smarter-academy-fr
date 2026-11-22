/**
 * LES RELATIONS entre objets (§21, §22, §23, §24) — logique pure.
 *
 * Le cahier des charges insiste : « Do not present this merely as a text
 * answer. Show the geometric relationship. » Ce module ne rend donc pas une
 * phrase mais un CONSTAT : ce qui est vrai, avec de quoi le DESSINER (le
 * facteur k, la droite portante, le sommet de l'angle droit).
 *
 * Le produit scalaire est HORS PROGRAMME de 4AM (§23 : « Do not make dot
 * product the dominant V1 feature »). Il n'est donc jamais calculé d'office :
 * l'analyse est un choix explicite de l'élève (`settings.analysis`).
 */

import * as V from './vectorMath.js';

/**
 * Deux أشعة → ce qu'on peut en dire.
 *
 * @returns {{
 *   parallel: boolean, factor: number|null, perpendicular: boolean,
 *   dot: number, equal: boolean, opposite: boolean,
 * } | null}
 */
export function compareVectors(u, v) {
  if (!V.isVector(u) || !V.isVector(v)) return null;
  const factor = V.collinearFactor(u, v);

  return {
    parallel: V.areParallel(u, v),
    factor,
    perpendicular: V.arePerpendicular(u, v),
    dot: V.dot(u, v),
    equal: V.sameVector(u, v),
    opposite: V.sameVector(u, V.negate(v)),
  };
}

/**
 * Trois points → l'alignement, et le شعاع porteur pour le tracer.
 *
 * @returns {{collinear: boolean, degenerate: boolean, through: {x,y}|null} | null}
 */
export function analyseCollinearity(a, b, c) {
  if (![a, b, c].every(V.isVector)) return null;
  const verdict = V.areCollinear(a, b, c);

  return { ...verdict, through: V.fromPoints(a, b) };
}

/**
 * Deux points → tout ce que §18–§20 demande : distance, milieu, pente.
 */
export function analysePointPair(a, b) {
  if (!V.isVector(a) || !V.isVector(b)) return null;

  return {
    vector: V.fromPoints(a, b),
    distance: V.distance(a, b),
    exactDistance: V.exactNorm(V.fromPoints(a, b)),
    midpoint: V.midpoint(a, b),
    slope: V.slope(a, b),
  };
}
