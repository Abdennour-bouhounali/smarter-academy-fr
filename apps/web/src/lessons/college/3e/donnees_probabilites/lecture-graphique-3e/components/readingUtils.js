/**
 * readingUtils — lire une courbe, et rien que la lire.
 *
 * Une COURBE est une polyligne `[{x, y}]` triée par x. Il n'y a aucune règle,
 * aucune expression : c'est le propos de la leçon. Ces fonctions enveloppent
 * `common/utils/cartesian.js` et ajoutent ce que la lecture demande.
 *
 * LA DISSYMÉTRIE EST ENCODÉE DANS LES TYPES :
 *   `image(curve, x)`       → UN nombre (ou null hors domaine)
 *   `antecedents(curve, y)` → UNE LISTE, éventuellement vide ou à trois éléments
 * Ne jamais faire renvoyer un seul antécédent : la leçon existe pour montrer
 * qu'il peut y en avoir plusieurs.
 *
 * LES DONNÉES SONT CONÇUES POUR ÊTRE LISIBLES, et c'est vérifié par un test :
 * à chaque graduation d'ordonnée atteignable, deux antécédents consécutifs sont
 * distants d'au moins une heure — sinon leurs marqueurs se superposeraient sur
 * le repère et la lecture serait impossible (règle d'affichage §17bis).
 */

import { roundTo, formatDec } from '@smarter-academy/core';
import {
  imageAt, antecedentsOf, extremum, variationIntervals,
  curveIntersections, readWithTolerance, niceRange,
} from '../../../../../common/utils/cartesian';

/** L'image de x sur la courbe — un nombre, ou null hors du domaine. */
export const image = imageAt;

/** TOUS les antécédents de y — toujours une liste, triée. */
export const antecedents = antecedentsOf;

/** Le point le plus haut / le plus bas de la courbe. */
export const maxOf = (curve) => extremum(curve, 'max');
export const minOf = (curve) => extremum(curve, 'min');

/** Les intervalles de monotonie : [{from, to, direction}]. */
export const variations = variationIntervals;

/** Les points où deux courbes se croisent. */
export const crossings = curveIntersections;

/** Une lecture graphique est juste « à la tolérance près ». */
export const isReadingOk = readWithTolerance;

/** Une étendue arrondie contenant toute la courbe. */
export function rangeForCurve(curve, xStep = 1, yStep = 100) {
  const xs = curve.map((p) => p.x);
  const ys = curve.map((p) => p.y);
  const rx = niceRange(xs, xStep);
  const ry = niceRange(ys, yStep);
  return { xMin: rx.min, xMax: rx.max, yMin: ry.min, yMax: ry.max };
}

/**
 * Regroupe les abscisses trop proches — POUR L'AFFICHAGE seulement.
 * La mathématique garde la liste complète ; c'est le dessin qui simplifie.
 */
export function mergeClose(xs, minGap = 0.5) {
  const out = [];
  for (const x of [...xs].sort((a, b) => a - b)) {
    if (out.length === 0 || Math.abs(x - out[out.length - 1]) >= minGap) out.push(x);
  }
  return out;
}

/** « elle monte de 0 h à 3 h, puis descend jusqu'à 6 h » */
export function describeVariation(intervals, { unit = '' } = {}) {
  const words = { croissante: 'monte', decroissante: 'descend', constante: 'reste stable' };
  return intervals
    .map((iv) => `${words[iv.direction]} de ${formatDec(iv.from)}${unit} à ${formatDec(iv.to)}${unit}`)
    .join(', puis ');
}

/**
 * Résoudre graphiquement f(x) = y : ce sont exactement les antécédents.
 * Nommer l'opération autrement aiderait à la confondre ; ici on la relie.
 */
export function solveGraphically(curve, y) {
  return antecedentsOf(curve, y);
}

/** Les intervalles où la courbe est au-dessus d'un seuil (lecture de problème). */
export function aboveThreshold(curve, threshold) {
  const out = [];
  let start = null;
  for (let i = 0; i < curve.length; i += 1) {
    const above = curve[i].y >= threshold;
    if (above && start === null) start = curve[i].x;
    if (!above && start !== null) {
      out.push({ from: roundTo(start, 6), to: roundTo(curve[i].x, 6) });
      start = null;
    }
  }
  if (start !== null) out.push({ from: roundTo(start, 6), to: roundTo(curve[curve.length - 1].x, 6) });
  return out;
}
