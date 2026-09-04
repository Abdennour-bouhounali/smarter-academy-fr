/**
 * Modèle mathématique de la leçon « Triangles » (3e).
 *
 * ─── CE QUE LA LEÇON ENSEIGNE ──────────────────────────────────────────
 * Reconnaître et construire des triangles, utiliser la somme des angles et
 * les propriétés des triangles particuliers, puis JUSTIFIER — passer de
 * « je vois » à « je peux prouver ». Thalès, Pythagore et la trigonométrie
 * ont leurs propres leçons : ici on reste sur les propriétés générales et
 * les triangles particuliers.
 *
 * ─── LE PRINCIPE QUI GOUVERNE TOUT LE FICHIER ──────────────────────────
 * Le NOM d'un triangle est CALCULÉ à partir de ses sommets, jamais posé.
 * `triangleKind` lit les longueurs et les angles ; un composant ne peut donc
 * pas afficher « isocèle » sur une figure qui ne l'est pas. C'est la règle
 * qui a fait la solidité du chapitre de 6e, et elle vaut ici aussi.
 *
 * ─── TOLÉRANCES ────────────────────────────────────────────────────────
 * Les longueurs sont affichées en ENTIERS. Une tolérance purement relative
 * autoriserait donc d'appeler « égaux » deux côtés affichant 143 et 141.
 * `TOL.absMax` plafonne l'écart à 1,5 px : deux côtés déclarés égaux portent
 * forcément le même nombre à l'écran.
 *
 * ─── REPÈRE ────────────────────────────────────────────────────────────
 * Les sommets sont en coordonnées SVG (y vers le BAS). Les angles renvoyés
 * par `geometry2d.interiorAngles` sont des angles géométriques non orientés :
 * l'orientation du repère ne les change pas.
 */
import {
  dist, sideLengths, interiorAngles, circleCircleIntersections, angleAtDeg,
  midpoint, areParallel, lineThrough, polygonArea,
} from '../../../../../common/utils/geometry2d';

export const TOL = {
  lengthRatio: 0.04,
  absMax: 1.5,   // en pixels — l'affichage entier ne peut pas contredire le verdict
  angleDeg: 1.5,
};

/** Deux longueurs sont-elles égales, au sens de ce que l'écran affiche ? */
export function sameLength(a, b, max, epsRatio = TOL.lengthRatio) {
  return Math.abs(a - b) <= Math.min(epsRatio * max, TOL.absMax);
}

/** Deux angles sont-ils égaux, en degrés ? */
export function sameAngle(a, b, eps = TOL.angleDeg) {
  return Math.abs(a - b) <= eps;
}

/* ── Classification ───────────────────────────────────────────────────── */

/**
 * Les traits d'un triangle, CUMULABLES : un triangle peut être à la fois
 * isocèle et rectangle. `sommet` désigne le sommet principal (l'apex de
 * l'isocèle, le sommet de l'angle droit).
 */
export function triangleTraits(pts) {
  const [a, b, c] = sideLengths(pts); // a = [P0P1], b = [P1P2], c = [P2P0]
  const max = Math.max(a, b, c);
  const angles = interiorAngles(pts);

  // Côté i relie les sommets i et i+1 ; le sommet OPPOSÉ au côté i est i+2.
  const equalPairs = [];
  if (sameLength(a, b, max)) equalPairs.push(1); // côtés [P0P1] et [P1P2] ⇒ apex P1
  if (sameLength(b, c, max)) equalPairs.push(2);
  if (sameLength(c, a, max)) equalPairs.push(0);

  const equilateral = equalPairs.length === 3;
  const isocele = equalPairs.length >= 1;
  const rightIndex = angles.findIndex((ang) => sameAngle(ang, 90));

  return {
    equilateral,
    isocele,
    apex: equilateral ? null : (equalPairs[0] ?? null),
    rectangle: rightIndex >= 0,
    rightVertex: rightIndex >= 0 ? rightIndex : null,
    angles,
    sides: [a, b, c],
    obtus: angles.some((ang) => ang > 90 + TOL.angleDeg),
  };
}

/** Noms des sommets, dans l'ordre du contour. */
export const VERTEX_NAMES = ['A', 'B', 'C'];

/**
 * Le NOM complet du triangle, calculé. Jamais une étiquette posée.
 * Exemples : « triangle rectangle en A », « triangle isocèle en B »,
 * « triangle rectangle isocèle en C », « triangle équilatéral ».
 */
export function triangleKind(pts) {
  const t = triangleTraits(pts);
  if (t.equilateral) return { id: 'equilateral', label: 'triangle équilatéral' };
  if (t.rectangle && t.isocele) {
    return {
      id: 'rectangle-isocele',
      label: `triangle rectangle isocèle en ${VERTEX_NAMES[t.rightVertex]}`,
    };
  }
  if (t.rectangle) {
    return { id: 'rectangle', label: `triangle rectangle en ${VERTEX_NAMES[t.rightVertex]}` };
  }
  if (t.isocele) {
    return { id: 'isocele', label: `triangle isocèle en ${VERTEX_NAMES[t.apex]}` };
  }
  return { id: 'quelconque', label: 'triangle quelconque' };
}

/* ── Inégalité triangulaire et construction ───────────────────────────── */

/**
 * Trois longueurs forment-elles un triangle ?
 *
 * Renvoie `{ ok, degenerate, raison }`. Le cas « plat » (somme exactement
 * égale) est distingué : les deux arcs du compas se touchent en un point,
 * mais le triangle est aplati — c'est le cas limite qu'il faut savoir nommer.
 */
export function triangleInequality(a, b, c) {
  const sides = [a, b, c];
  if (sides.some((s) => s <= 0)) return { ok: false, degenerate: false, raison: 'longueur-nulle' };
  const max = Math.max(...sides);
  const sumOthers = sides.reduce((s, v) => s + v, 0) - max;
  if (max > sumOthers) return { ok: false, degenerate: false, raison: 'trop-court' };
  if (max === sumOthers) return { ok: false, degenerate: true, raison: 'plat' };
  return { ok: true, degenerate: false, raison: null };
}

/**
 * Le troisième sommet d'un triangle de côtés donnés, construit au COMPAS :
 * on croise le cercle de centre A et de rayon b avec celui de centre B et de
 * rayon a. Renvoie `null` quand les arcs ne se rencontrent pas — et c'est
 * exactement le cas où l'inégalité triangulaire échoue.
 */
export function thirdVertex(A, B, distFromA, distFromB, above = true) {
  const pts = circleCircleIntersections(A, distFromA, B, distFromB);
  if (pts.length === 0) return null;
  if (pts.length === 1) return pts[0];
  // « above » = le point de plus petit y (vers le haut à l'écran).
  const [p, q] = pts;
  return above ? (p.y <= q.y ? p : q) : (p.y > q.y ? p : q);
}

/* ── Angles ───────────────────────────────────────────────────────────── */

/** Le troisième angle, quand deux sont connus. */
export function thirdAngle(a1, a2) {
  return 180 - a1 - a2;
}

/**
 * Les angles à la base d'un isocèle dont l'angle au sommet vaut `apexDeg`.
 * Les deux angles à la base sont égaux — c'est la propriété enseignée.
 */
export function baseAngles(apexDeg) {
  return (180 - apexDeg) / 2;
}

/** L'angle au sommet, quand on connaît un angle à la base. */
export function apexAngle(baseDeg) {
  return 180 - 2 * baseDeg;
}

/** Somme des angles, pour vérifier numériquement l'invariant. */
export function angleSum(pts) {
  return interiorAngles(pts).reduce((s, a) => s + a, 0);
}

/* ── Droite des milieux ───────────────────────────────────────────────── */

/**
 * Le segment joignant les milieux de deux côtés est parallèle au troisième
 * et vaut sa moitié. Renvoie les deux milieux, le rapport observé, et le
 * verdict de parallélisme — tous CALCULÉS, jamais affirmés.
 */
export function midlineOf(pts) {
  const [A, B, C] = pts;
  const I = midpoint(A, B);
  const J = midpoint(A, C);
  const ratio = dist(B, C) === 0 ? null : dist(I, J) / dist(B, C);
  let parallel = false;
  try {
    parallel = areParallel(lineThrough(I, J), lineThrough(B, C), 1e-6);
  } catch {
    parallel = false;
  }
  return { I, J, ratio, parallel, ij: dist(I, J), bc: dist(B, C) };
}

/* ── Justification : les briques d'une démonstration ──────────────────── */

/**
 * Les étapes disponibles pour rédiger un raisonnement. Chaque étape porte
 * son rôle : `donnee` (ce qu'on sait), `propriete` (la règle invoquée),
 * `conclusion` (ce qu'on en tire). Un distracteur est une étape `piege`,
 * vraie en apparence mais qui ne s'applique pas ici.
 */
export const PROOF_STEPS = {
  isocele: {
    enonce: 'ABC est isocèle en A et l’angle en A mesure 40°. Combien mesure l’angle en B ?',
    correct: ['d-isocele', 'p-base-egales', 'p-somme', 'c-70'],
    steps: [
      { id: 'd-isocele', role: 'donnee', text: 'ABC est isocèle en A : AB = AC.' },
      { id: 'p-base-egales', role: 'propriete', text: 'Dans un triangle isocèle, les angles à la base sont égaux : angle B = angle C.' },
      { id: 'p-somme', role: 'propriete', text: 'La somme des angles d’un triangle vaut 180°.' },
      { id: 'c-70', role: 'conclusion', text: 'Donc 2 × angle B = 180° − 40° = 140°, soit angle B = 70°.' },
      { id: 'piege-60', role: 'piege', text: 'Donc les trois angles valent 60°.' },
      { id: 'piege-droit', role: 'piege', text: 'Dans un triangle isocèle, l’angle au sommet est droit.' },
      { id: 'piege-140', role: 'piege', text: 'Donc l’angle B vaut 140°.' },
    ],
  },
};

/** Le raisonnement proposé est-il correct, et sinon où cloche-t-il ? */
export function checkProof(chosen, key = 'isocele') {
  const { correct } = PROOF_STEPS[key];
  const ok = chosen.length === correct.length && chosen.every((id, i) => id === correct[i]);
  const firstWrong = chosen.findIndex((id, i) => id !== correct[i]);
  return { ok, firstWrong: ok ? -1 : firstWrong };
}

/* ── Les figures de la leçon (constantes littérales) ──────────────────── */

export const BOX = { xMin: 0, yMin: 0, xMax: 320, yMax: 240 };

export const FIGURES = {
  /**
   * Un triangle franchement quelconque. Les sommets ont été choisis
   * NUMÉRIQUEMENT : angles 60,6° / 46,6° / 72,9° (écart minimal 12,3°) et
   * côtés séparés d'au moins 18 px. Un premier jeu de sommets donnait deux
   * angles à 7,9° l'un de l'autre — impossible à comparer à l'œil, donc
   * inutilisable pour faire conjecturer quoi que ce soit.
   */
  quelconque: [{ x: 60, y: 205 }, { x: 265, y: 180 }, { x: 120, y: 60 }],
  /** Isocèle en C, base horizontale. */
  isocele: [{ x: 70, y: 200 }, { x: 230, y: 200 }, { x: 150, y: 70 }],
  /** Rectangle en A. */
  rectangle: [{ x: 70, y: 200 }, { x: 250, y: 200 }, { x: 70, y: 70 }],
  /** Équilatéral (côté 160, hauteur 160·√3/2 ≈ 138,6). */
  equilateral: [{ x: 80, y: 200 }, { x: 240, y: 200 }, { x: 160, y: 61.4 }],
};

/** Aire, pour les vérifications numériques des tests. */
export const areaOf = polygonArea;
export { angleAtDeg, dist };
