/**
 * Modèle mathématique de la leçon « Théorème de Pythagore » (3e).
 *
 * ─── CE QUI CHANGE PAR RAPPORT À LA VERSION PRÉ-KIT ────────────────────
 * L'ancien module 1 dessinait les trois carrés puis ÉCRIVAIT « aire = a² + b² »
 * sur le grand : l'égalité était affirmée, pas constatée. Ici les trois aires
 * sont MESURÉES sur les polygones réellement tracés (`polygonArea`), et la
 * comparaison est un calcul. Un dessin faux produirait donc un déséquilibre
 * visible — ce qui est exactement ce qu'on veut.
 *
 * ─── L'IDÉE CENTRALE ───────────────────────────────────────────────────
 * L'égalité des aires ⟺ l'angle est droit. Les deux sens sont manipulés : le
 * théorème direct (angle droit ⇒ égalité) au module 2, et sa réciproque
 * (égalité ⇒ angle droit) au module 3, en déformant le triangle jusqu'à
 * rompre l'équilibre.
 *
 * ─── REPÈRE ────────────────────────────────────────────────────────────
 * Sommets en coordonnées SVG (y vers le BAS). Les carrés sont construits VERS
 * L'EXTÉRIEUR : la normale sortante est choisie en testant de quel côté se
 * trouve le troisième sommet — jamais codée en dur, sinon un carré se
 * replierait sur la figure dès qu'on la retourne.
 */
import {
  dist, sideLengths, interiorAngles, polygonArea, centroid, midpoint,
} from '../../../../../common/utils/geometry2d';
import { computeHypotenuse, computePythagoreanLeg } from '@smarter-academy/core';

export const TOL = {
  angleDeg: 1.5,
  areaRatio: 0.02,   // 2 % de la plus grande aire
};

export const VERTEX_NAMES = ['A', 'B', 'C'];

/* ── Les trois carrés ─────────────────────────────────────────────────── */

/**
 * Le carré construit sur le segment [p, q], du côté OPPOSÉ à `away`.
 *
 * On teste le signe du produit scalaire avec la normale pour savoir de quel
 * côté se trouve le troisième sommet, puis on construit de l'autre côté.
 * C'est ce qui rend la construction correcte quelle que soit l'orientation.
 */
export function squareOnSide(p, q, away) {
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  let nx = -dy;
  let ny = dx;
  const toAway = { x: away.x - p.x, y: away.y - p.y };
  if (nx * toAway.x + ny * toAway.y > 0) { nx = -nx; ny = -ny; }
  return [
    p,
    q,
    { x: q.x + nx, y: q.y + ny },
    { x: p.x + nx, y: p.y + ny },
  ];
}

/** Les trois carrés ([AB], [BC], [CA]) et leurs aires MESURÉES. */
export function squaresOf(pts) {
  const [A, B, C] = pts;
  const squares = [
    squareOnSide(A, B, C),
    squareOnSide(B, C, A),
    squareOnSide(C, A, B),
  ];
  return { squares, areas: squares.map(polygonArea) };
}

/* ── Le triangle ──────────────────────────────────────────────────────── */

export function longestSideIndex(pts) {
  const L = sideLengths(pts);
  return L.indexOf(Math.max(...L));
}

/** Le sommet portant l'angle droit, ou null. */
export function rightVertexIndex(pts, epsDeg = TOL.angleDeg) {
  const angles = interiorAngles(pts);
  const i = angles.findIndex((a) => Math.abs(a - 90) <= epsDeg);
  return i < 0 ? null : i;
}

/**
 * L'hypoténuse : le côté OPPOSÉ à l'angle droit. Renvoie `null` si le
 * triangle n'est pas rectangle — on ne nomme pas une hypoténuse là où il n'y
 * en a pas.
 */
export function hypotenuseIndex(pts, epsDeg = TOL.angleDeg) {
  const right = rightVertexIndex(pts, epsDeg);
  if (right === null) return null;
  // Le côté i relie les sommets i et i+1 ; celui opposé au sommet r est r+1.
  return (right + 1) % 3;
}

export function isRightTriangle(pts, epsDeg = TOL.angleDeg) {
  return rightVertexIndex(pts, epsDeg) !== null;
}

/**
 * La balance des carrés : les deux petits contre le grand.
 *
 * `tilt` vaut 'petits' quand les deux petits carrés l'emportent (angle aigu)
 * et 'grand' sinon (angle obtus) — c'est cette bascule qui fait comprendre la
 * réciproque.
 */
export function balanceOf(pts) {
  const { areas } = squaresOf(pts);
  const big = Math.max(...areas);
  const bigIndex = areas.indexOf(big);
  const sumOthers = areas.reduce((s, a, i) => (i === bigIndex ? s : s + a), 0);
  const gap = Math.abs(sumOthers - big) / Math.max(big, 1);
  return {
    areas,
    bigIndex,
    big,
    sumOthers,
    gap,
    level: gap <= TOL.areaRatio,
    tilt: sumOthers > big ? 'petits' : 'grand',
  };
}

/**
 * INVARIANT ENSEIGNÉ : la balance est à l'équilibre ⟺ le triangle est
 * rectangle. Testé, donc vérifiable plutôt qu'affirmé.
 */
export function balanceMatchesRightAngle(pts) {
  return balanceOf(pts).level === isRightTriangle(pts);
}

/** La nature du triangle, lue sur ses trois côtés. */
export function kindFromSides(a, b, c) {
  const [x, y, z] = [a, b, c].slice().sort((m, n) => m - n);
  const left = x * x + y * y;
  const right = z * z;
  const eps = 1e-9 * Math.max(right, 1);
  if (Math.abs(left - right) <= eps) return 'rectangle';
  return left > right ? 'acutangle' : 'obtusangle';
}

/** L'écart à l'égalité de Pythagore : positif si aigu, négatif si obtus. */
export function pythagoreanGap(a, b, c) {
  const [x, y, z] = [a, b, c].slice().sort((m, n) => m - n);
  return x * x + y * y - z * z;
}

/* ── Calculs ──────────────────────────────────────────────────────────── */

export { computeHypotenuse, computePythagoreanLeg };

/** Arrondi au dixième, comme le demandent les énoncés. */
export function roundTenth(v) {
  return Math.round(v * 10) / 10;
}

/** Un côté de l'angle droit est toujours plus court que l'hypoténuse. */
export function isCoherentLeg(leg, hyp) {
  return leg > 0 && leg < hyp;
}

/* ── Rédaction d'une démonstration ────────────────────────────────────── */

export const PROOF_STEPS = {
  reciproque: {
    enonce: 'RST a pour côtés RS = 6 cm, ST = 8 cm et RT = 10 cm. Ce triangle est-il rectangle ?',
    correct: ['d-cote-long', 'c-calc-grand', 'c-calc-somme', 'c-conclusion'],
    steps: [
      { id: 'd-cote-long', role: 'donnee', text: 'Le plus grand côté est [RT], qui mesure 10 cm.' },
      { id: 'c-calc-grand', role: 'calcul', text: 'D’une part : RT² = 10² = 100.' },
      { id: 'c-calc-somme', role: 'calcul', text: 'D’autre part : RS² + ST² = 6² + 8² = 36 + 64 = 100.' },
      { id: 'c-conclusion', role: 'conclusion', text: 'Les deux résultats sont égaux : d’après la réciproque du théorème de Pythagore, RST est rectangle en S.' },
      { id: 'piege-direct', role: 'piege', text: 'D’après le théorème de Pythagore, RT² = RS² + ST².' },
      { id: 'piege-somme', role: 'piege', text: 'RS + ST = 6 + 8 = 14, ce qui est différent de 10.' },
      { id: 'piege-rect-r', role: 'piege', text: 'Donc RST est rectangle en R.' },
    ],
  },
};

export function checkProof(chosen, key = 'reciproque') {
  const { correct } = PROOF_STEPS[key];
  const ok = chosen.length === correct.length && chosen.every((id, i) => id === correct[i]);
  const firstWrong = chosen.findIndex((id, i) => id !== correct[i]);
  return { ok, firstWrong: ok ? -1 : firstWrong };
}

/* ── Les figures de la leçon (constantes littérales) ─────────────────── */

export const BOX = { xMin: 0, yMin: 0, xMax: 360, yMax: 320 };

export const FIGURES = {
  /** Un 3-4-5 à l'échelle 26 px, angle droit en A. */
  rect345: [{ x: 120, y: 210 }, { x: 198, y: 210 }, { x: 120, y: 106 }],
  /** Déformé : angle aigu en A. */
  aigu: [{ x: 120, y: 210 }, { x: 198, y: 210 }, { x: 160, y: 130 }],
  /** Déformé : angle obtus en A. */
  obtus: [{ x: 120, y: 210 }, { x: 198, y: 210 }, { x: 80, y: 150 }],
};

/**
 * Les orientations « pièges » du module 1 : de VRAIS triangles rectangles,
 * mais posés de travers, de sorte que l'hypoténuse ne soit jamais le côté
 * horizontal. Les sommets sont obtenus en faisant tourner un 3-4-5 autour de
 * son angle droit, puis en arrondissant à l'entier — d'où des angles à 89,8°
 * ou 90,3°, bien dans la tolérance. Des coordonnées choisies « à l'œil »
 * donnaient des triangles qui n'étaient pas rectangles du tout.
 * L'angle droit est toujours au sommet A, l'hypoténuse est donc [BC].
 */
export const ORIENTATIONS = [
  { id: 'o1', label: 'Triangle 1', pts: [{ x: 95, y: 150 }, { x: 155, y: 178 }, { x: 58, y: 230 }] },
  { id: 'o2', label: 'Triangle 2', pts: [{ x: 150, y: 120 }, { x: 125, y: 66 }, { x: 223, y: 86 }] },
  { id: 'o3', label: 'Triangle 3', pts: [{ x: 200, y: 190 }, { x: 141, y: 212 }, { x: 171, y: 111 }] },
];

export { dist, sideLengths, interiorAngles, polygonArea, centroid, midpoint };
