/**
 * Modèle mathématique de la leçon « Symétrie ».
 *
 * ─── ÉTAT CANONIQUE ────────────────────────────────────────────────────
 * L'axe est une droite canonique `{ p, d }` (geometry2d), la figure un
 * tableau de sommets. TOUT le reste est dérivé : l'image d'un point, l'image
 * d'une figure, le pied de la perpendiculaire, les distances.
 *
 * Conséquence : l'élève ne peut jamais voir une « image » qui ne serait pas
 * la vraie image. Le symétrique affiché est `reflectPoint(axe, p)`, calculé
 * à chaque rendu — jamais une position stockée qu'on aurait pu désynchroniser.
 *
 * ─── LES DEUX CONDITIONS ───────────────────────────────────────────────
 * Un point M′ est le symétrique de M par rapport à (d) si et seulement si :
 *   1. (MM′) est PERPENDICULAIRE à (d) ;
 *   2. M et M′ sont à ÉGALE DISTANCE de (d).
 * Aucune des deux ne suffit seule — c'est précisément ce que les modules 3
 * à 5 font découvrir, et `checkSymmetric` les teste séparément pour que
 * l'élève voie laquelle lui manque.
 */
import {
  lineThrough, reflectPoint, reflectPoints, isSymmetryAxis,
  projectOnLine, distPointLine, arePerpendicular, dist, midpoint,
  sideLengths, interiorAngles, polygonArea, perimeter,
} from '../../../../../common/utils/geometry2d';

export {
  lineThrough, reflectPoint, reflectPoints, isSymmetryAxis,
  projectOnLine, distPointLine, dist, midpoint,
  sideLengths, interiorAngles, polygonArea, perimeter,
};

/** Tolérances de la leçon — une seule source, jamais de littéral dispersé. */
export const TOL = { pos: 9, angleDeg: 3, distRatio: 0.06 };

/* ── Le cœur : vérifier une construction ─────────────────────────────── */

/**
 * L'élève a placé `candidate` comme image de `point`. On renvoie le DÉTAIL
 * des deux conditions, jamais un simple booléen : c'est ce qui permet de lui
 * dire « la perpendiculaire est bonne, mais la distance ne l'est pas ».
 */
export function checkSymmetric(axis, point, candidate) {
  const foot = projectOnLine(axis, point);
  const dPoint = distPointLine(axis, point);
  const dCand = distPointLine(axis, candidate);

  // (1) Le segment [M M′] doit être perpendiculaire à l'axe. Si les deux
  //     points sont confondus, la droite (MM′) n'existe pas.
  let perpendiculaire = false;
  if (dist(point, candidate) > 1e-6) {
    perpendiculaire = arePerpendicular(axis, lineThrough(point, candidate), 0.08);
  }

  // (2) Distances égales à l'axe, à la tolérance relative près.
  const echelle = Math.max(dPoint, 1);
  const distanceEgale = Math.abs(dPoint - dCand) <= TOL.distRatio * echelle;

  // (3) …et de l'AUTRE côté : un point qui reviendrait sur lui-même
  //     satisferait (1) et (2) sans être le symétrique.
  const côtéOppose = dist(candidate, point) > TOL.pos || dPoint < 1e-6;

  const cible = reflectPoint(axis, point);
  const proche = dist(candidate, cible) <= TOL.pos;

  return {
    perpendiculaire,
    distanceEgale,
    côtéOppose,
    ok: proche,
    cible,
    ecart: dist(candidate, cible),
    distPoint: dPoint,
    distCandidate: dCand,
    foot,
  };
}

/** Message français nommant ce qui manque — jamais un « faux » sec. */
export function symmetricHint(state) {
  if (state.ok) return 'C’est exactement le symétrique.';
  if (!state.côtéOppose) return 'Le symétrique se trouve de l’AUTRE côté de l’axe.';
  if (!state.perpendiculaire) {
    return 'Le trait qui relie le point à son image doit être perpendiculaire à l’axe.';
  }
  if (!state.distanceEgale) {
    return state.distCandidate > state.distPoint
      ? 'Ton point est trop loin de l’axe : les deux distances doivent être égales.'
      : 'Ton point est trop près de l’axe : les deux distances doivent être égales.';
  }
  return 'Approche encore : le symétrique est tout proche.';
}

/* ── Axes de symétrie d'une figure ───────────────────────────────────── */

/**
 * Les axes de symétrie d'une figure, cherchés parmi les candidats naturels :
 * médiatrices des côtés et diagonales. On ne « connaît » pas le résultat à
 * l'avance — chaque candidat est testé par isSymmetryAxis.
 */
export function symmetryAxesOf(pts, eps = 4) {
  const axes = [];
  const n = pts.length;
  const seen = new Set();

  const consider = (a, b) => {
    if (dist(a, b) < 1e-6) return;
    const axis = lineThrough(a, b);
    if (!isSymmetryAxis(axis, pts, eps)) return;
    // Dédoublonnage : deux axes confondus ne comptent qu'une fois.
    const key = `${Math.round(axis.d.x * 100)}:${Math.round(axis.d.y * 100)}:${Math.round(distPointLine(axis, { x: 0, y: 0 }))}`;
    const keyAlt = `${Math.round(-axis.d.x * 100)}:${Math.round(-axis.d.y * 100)}:${Math.round(distPointLine(axis, { x: 0, y: 0 }))}`;
    if (seen.has(key) || seen.has(keyAlt)) return;
    seen.add(key);
    axes.push(axis);
  };

  for (let i = 0; i < n; i += 1) {
    // Médiatrice du côté i : passe par son milieu, perpendiculairement.
    const a = pts[i];
    const b = pts[(i + 1) % n];
    const m = midpoint(a, b);
    const dir = { x: -(b.y - a.y), y: b.x - a.x };
    consider(m, { x: m.x + dir.x, y: m.y + dir.y });
    // Diagonale / médiane issue du sommet i.
    for (let j = i + 1; j < n; j += 1) consider(pts[i], pts[j]);
    consider(pts[i], midpoint(pts[(i + 1) % n], pts[(i + 2) % n]));
  }
  return axes;
}

export function countSymmetryAxes(pts, eps = 4) {
  return symmetryAxesOf(pts, eps).length;
}

/* ── Conservations — ce que la symétrie ne change PAS ─────────────────── */

/**
 * Compare une figure et son image : longueurs, angles, aire et périmètre
 * doivent tous être conservés. C'est le constat du module 5, calculé et non
 * affirmé.
 */
export function conservationReport(pts, axis) {
  const img = reflectPoints(axis, pts);
  const eq = (a, b, tol) => Math.abs(a - b) <= tol;
  return {
    longueurs: sideLengths(pts).every((l, i) => eq(l, sideLengths(img)[i], 0.5)),
    angles: interiorAngles(pts).every((a, i) => eq(a, interiorAngles(img)[i], 0.5)),
    aire: eq(polygonArea(pts), polygonArea(img), 1),
    perimetre: eq(perimeter(pts), perimeter(img), 0.5),
    image: img,
  };
}

/** Les propriétés conservées, pour la fiche du module 5. */
export const CONSERVEES = [
  { id: 'longueurs', label: 'Les longueurs' },
  { id: 'angles', label: 'Les angles' },
  { id: 'perimetre', label: 'Le périmètre' },
  { id: 'aire', label: 'L’aire' },
];

/** Ce que la symétrie change : la position, et le sens de lecture. */
export const NON_CONSERVEES = [
  { id: 'position', label: 'La position dans le plan' },
  { id: 'sens', label: 'Le sens de lecture (comme dans un miroir)' },
];
