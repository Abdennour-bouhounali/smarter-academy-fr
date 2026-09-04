/**
 * Modèle mathématique de « Translations et vecteurs » (3e).
 *
 * ─── L'IDÉE QUE TOUT LE FICHIER SERT ───────────────────────────────────
 * Un vecteur décrit un DÉPLACEMENT, indépendamment de l'endroit où on le
 * pose. C'est exactement ce que dit `equalVectors` : deux flèches situées à
 * des endroits différents sont le MÊME vecteur dès que leurs deux
 * composantes coïncident. Toute la leçon consiste à faire vivre cela avant
 * de le nommer.
 *
 * ─── DÉCOMPOSITION D'UN DÉPLACEMENT ────────────────────────────────────
 * `attributesOf` sépare les trois attributs que l'élève doit apprendre à
 * distinguer : la DIRECTION (la droite portant le déplacement), le SENS (de
 * quel côté on la parcourt) et la LONGUEUR. Deux vecteurs opposés ont même
 * direction et même longueur, mais des sens contraires — c'est la confusion
 * la plus fréquente, et elle est ici testable, pas seulement racontée.
 *
 * ─── REPÈRE ────────────────────────────────────────────────────────────
 * Toutes les coordonnées sont celles de l'ÉLÈVE (y vers le HAUT). La
 * conversion vers le repère SVG est faite par CoordPlane, et nulle part
 * ailleurs.
 *
 * ─── PÉRIMÈTRE ─────────────────────────────────────────────────────────
 * La relation de Chasles n'est PAS enseignée (elle n'apparaît dans aucun
 * point du catalogue). L'addition de vecteurs n'apparaît que sous la forme
 * « enchaîner deux déplacements », et seulement en fin de leçon.
 */

/* ── Vecteurs ─────────────────────────────────────────────────────────── */

/** Le vecteur qui mène de a à b : ses deux composantes. */
export function vecFromPoints(a, b) {
  return { dx: b.x - a.x, dy: b.y - a.y };
}

/** Applique un déplacement à un point. */
export function translatePoint(p, v) {
  return { x: p.x + v.dx, y: p.y + v.dy };
}

/** Applique le même déplacement à tous les sommets d'une figure. */
export function translatePolygon(pts, v) {
  return pts.map((p) => translatePoint(p, v));
}

/** Le vecteur nul : le déplacement qui ne déplace rien. */
export const ZERO = { dx: 0, dy: 0 };

export function isZero(v, eps = 1e-9) {
  return Math.abs(v.dx) < eps && Math.abs(v.dy) < eps;
}

/**
 * Deux vecteurs sont ÉGAUX quand leurs composantes coïncident — peu importe
 * où on les a dessinés. C'est la définition, et c'est tout l'enjeu de la
 * leçon : l'endroit ne fait pas partie du vecteur.
 */
export function equalVectors(u, v, eps = 1e-9) {
  return Math.abs(u.dx - v.dx) < eps && Math.abs(u.dy - v.dy) < eps;
}

/** Le vecteur opposé : même direction, même longueur, sens contraire. */
export function opposite(v) {
  return { dx: -v.dx, dy: -v.dy };
}

/** Enchaîner deux déplacements revient à ajouter leurs composantes. */
export function addVectors(u, v) {
  return { dx: u.dx + v.dx, dy: u.dy + v.dy };
}

export function vectorLength(v) {
  return Math.hypot(v.dx, v.dy);
}

/* ── Direction, sens, longueur — les trois attributs ─────────────────── */

/**
 * La direction, ramenée à une forme canonique : le couple (dx, dy) réduit et
 * normalisé de signe. Deux vecteurs opposés partagent la MÊME direction, ce
 * qui est précisément la subtilité à faire comprendre.
 */
export function directionKey(v) {
  if (isZero(v)) return 'nulle';
  const g = gcd(Math.abs(v.dx), Math.abs(v.dy));
  let dx = v.dx / g;
  let dy = v.dy / g;
  // Signe canonique : le premier terme non nul est positif.
  if (dx < 0 || (dx === 0 && dy < 0)) { dx = -dx; dy = -dy; }
  return `${dx}:${dy}`;
}

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y > 1e-9) { const t = x % y; x = y; y = t; }
  return x || 1;
}

export function sameDirection(u, v) {
  return directionKey(u) === directionKey(v);
}

/** Même sens : même direction ET produit scalaire positif. */
export function sameSense(u, v) {
  if (!sameDirection(u, v)) return false;
  return u.dx * v.dx + u.dy * v.dy > 0;
}

export function sameLength(u, v, eps = 1e-9) {
  return Math.abs(vectorLength(u) - vectorLength(v)) < eps;
}

/** Les trois attributs d'un coup, pour un diagnostic précis. */
export function attributesOf(u, v) {
  return {
    direction: sameDirection(u, v),
    sens: sameSense(u, v),
    longueur: sameLength(u, v),
    egaux: equalVectors(u, v),
  };
}

/**
 * Pourquoi ces deux déplacements ne sont-ils pas le même ? Renvoie la raison
 * la plus parlante — jamais un « faux » sec.
 */
export function diagnose(u, v) {
  if (equalVectors(u, v)) return null;
  const a = attributesOf(u, v);
  if (!a.direction) return 'direction';
  if (!a.sens) return 'sens';
  if (!a.longueur) return 'longueur';
  return 'autre';
}

export const DIAGNOSIS_TEXT = {
  direction: 'La direction n’est pas la même : les deux flèches ne sont pas portées par des droites parallèles.',
  sens: 'La direction est bonne et la longueur aussi, mais le sens est inversé : la flèche part dans l’autre sens.',
  longueur: 'La direction et le sens sont bons, mais la longueur diffère.',
  autre: 'Les deux déplacements ne coïncident pas.',
};

/* ── Parallélogrammes ─────────────────────────────────────────────────── */

/**
 * ABDC est un parallélogramme ⟺ vecteur AB = vecteur CD.
 *
 * Attention à l'ordre des sommets : c'est la source d'erreur classique. Ici
 * la fonction prend explicitement les quatre points dans l'ordre du contour
 * A → B → D → C, celui qui correspond à « AB et CD sont deux côtés
 * opposés ».
 */
export function isParallelogram(A, B, C, D, eps = 1e-9) {
  return equalVectors(vecFromPoints(A, B), vecFromPoints(C, D), eps);
}

/** Le quatrième point D tel que ABDC soit un parallélogramme (AB = CD). */
export function fourthPoint(A, B, C) {
  return translatePoint(C, vecFromPoints(A, B));
}

/* ── Écriture ─────────────────────────────────────────────────────────── */

/** Le moins typographique français. */
function fr(n) {
  return String(n).replace('-', '−');
}

/** Les composantes d'un vecteur, à la française : (3 ; −2). */
export function formatVec(v) {
  return `(${fr(v.dx)} ; ${fr(v.dy)})`;
}

/** Description en toutes lettres d'un déplacement. */
export function describeVec(v) {
  if (isZero(v)) return 'aucun déplacement';
  const parts = [];
  if (v.dx !== 0) parts.push(`${Math.abs(v.dx)} vers la ${v.dx > 0 ? 'droite' : 'gauche'}`);
  if (v.dy !== 0) parts.push(`${Math.abs(v.dy)} vers le ${v.dy > 0 ? 'haut' : 'bas'}`);
  return parts.join(' et ');
}

/* ── Les scènes de la leçon (constantes littérales) ──────────────────── */

export const RANGE = { xMin: -7, xMax: 7, yMin: -6, yMax: 6 };

/** La chorégraphie des drones : un même mouvement, exécuté partout. */
export const DRONES = {
  /** Le déplacement de référence de la leçon. */
  mouvement: { dx: 4, dy: 2 },
  depart: { x: -5, y: -3 },
  /** Quatre drones qui doivent tous effectuer le même mouvement. */
  positions: [
    { id: 'd1', x: -5, y: -3 },
    { id: 'd2', x: -1, y: 3 },
    { id: 'd3', x: 1, y: -4 },
    { id: 'd4', x: -6, y: 1 },
  ],
};

export const FIGURES = {
  /** Un triangle-drone, assez petit pour rester dans le cadre après translation. */
  drone: [{ x: -5, y: -3 }, { x: -3, y: -3 }, { x: -4, y: -1 }],
  /** Un quadrilatère pour la frise du module 7. */
  motif: [{ x: -6, y: -1 }, { x: -4, y: -1 }, { x: -4, y: 1 }, { x: -6, y: 1 }],
};
