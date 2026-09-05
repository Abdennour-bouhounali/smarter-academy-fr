/**
 * balloonData — le vol de la montgolfière, et celui de sa rivale.
 *
 * CONÇU POUR ÊTRE LISIBLE, pas tiré au hasard :
 *  - Les sommets et les creux tombent EXACTEMENT sur une graduation (multiples
 *    de 100 m) : la valeur maximale a donc UN seul antécédent, pas deux
 *    marqueurs collés de part et d'autre.
 *  - Le profil monte, plafonne, redescend, puis remonte : maximum, minimum,
 *    quatre intervalles de variation et — surtout — des altitudes atteintes
 *    TROIS fois, ce qui rend la dissymétrie image/antécédent spectaculaire.
 *  - Deux antécédents consécutifs d'une même graduation sont distants d'au
 *    moins 1 h, si bien que leurs marqueurs ne se superposent jamais sur le
 *    repère (vérifié par un test de grille, pas à l'œil).
 *
 * Échelle : 12 h en abscisse, 1 200 m en ordonnée. Le repère reçoit donc un
 * `unitY` distinct — sans quoi le cadre ferait des milliers de pixels de haut.
 */

/**
 * Le vol principal : 12 relevés horaires.
 *
 * PROFIL CHOISI POUR ÊTRE LISIBLE — l'altitude ne varie que de 200 m par heure,
 * si bien que CHAQUE graduation de 100 m est franchie à une heure ENTIÈRE.
 * Sans cette contrainte, un palier de 300 m parcouru en une heure ferait
 * traverser 400 m et 500 m à 20 et 40 minutes : deux marqueurs d'antécédents
 * se retrouveraient collés sur le repère, illisibles. Un test de grille le
 * vérifie sur toutes les graduations plutôt qu'à l'œil.
 *
 * Le profil monte, plafonne, redescend jusqu'au sol, puis remonte : maximum,
 * minimum, quatre intervalles de variation, et des altitudes atteintes QUATRE
 * fois — la dissymétrie image/antécédent est alors spectaculaire.
 */
export const BALLOON = [
  { x: 0, y: 0 },
  { x: 1, y: 200 },
  { x: 2, y: 400 },
  { x: 3, y: 600 },
  { x: 4, y: 600 },
  { x: 5, y: 400 },
  { x: 6, y: 200 },
  { x: 7, y: 0 },
  { x: 8, y: 200 },
  { x: 9, y: 400 },
  { x: 10, y: 600 },
  { x: 11, y: 400 },
  { x: 12, y: 200 },
];

/** La rivale : un profil en V, qui croise la première à des heures entières. */
export const BALLOON_2 = [
  { x: 0, y: 600 },
  { x: 1, y: 500 },
  { x: 2, y: 400 },
  { x: 3, y: 300 },
  { x: 4, y: 200 },
  { x: 5, y: 100 },
  { x: 6, y: 0 },
  { x: 7, y: 100 },
  { x: 8, y: 200 },
  { x: 9, y: 300 },
  { x: 10, y: 400 },
  { x: 11, y: 500 },
  { x: 12, y: 600 },
];

/** Le vol du module 6 : une courbe inconnue, avec un seuil à interpréter. */
export const DRONE = [
  { x: 0, y: 0 },
  { x: 1, y: 200 },
  { x: 2, y: 400 },
  { x: 3, y: 600 },
  { x: 4, y: 800 },
  { x: 5, y: 800 },
  { x: 6, y: 600 },
  { x: 7, y: 400 },
  { x: 8, y: 600 },
  { x: 9, y: 800 },
  { x: 10, y: 600 },
  { x: 11, y: 400 },
  { x: 12, y: 200 },
];

/** L'étendue commune des repères de la leçon. */
export const RANGE = { xMin: 0, xMax: 12, yMin: 0, yMax: 900 };
/** Hauteur visée du cadre, en pixels : fixe l'unité verticale. */
export const TARGET_H = 300;
export const UNIT_Y = TARGET_H / (RANGE.yMax - RANGE.yMin);
