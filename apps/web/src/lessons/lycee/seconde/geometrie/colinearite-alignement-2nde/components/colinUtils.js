import { formatDec, parseDec, roundTo } from '@smarter-academy/core';

/**
 * colinUtils — le modèle mathématique de la leçon « Colinéarité et
 * alignement » (2nde). Tout ce qui est affiché (rail, voyants, tableau de
 * proportionnalité, déterminant, parallélogramme, verdicts) DÉRIVE de ces
 * fonctions pures — jamais d'une valeur écrite à la main dans un module.
 *
 * ─── L'IDÉE QUE TOUT LE FICHIER SERT ───────────────────────────────────
 * « Même direction » est une propriété VISIBLE (deux flèches sur le même
 * rail, quelle que soit leur longueur et leur sens). Elle est détectée
 * EXACTEMENT par un nombre calculé sur les coordonnées :
 *      det(u, v) = x·y' − y·x'
 * nul si et seulement si le parallélogramme construit sur u et v est plat.
 * Alignement de trois points et parallélisme de deux droites sont la même
 * propriété, lue sur AB/AC et sur AB/CD.
 *
 * ─── CONVENTIONS ───────────────────────────────────────────────────────
 * - Un vecteur est { x, y } (coordonnées de Seconde, pas dx/dy).
 * - Coordonnées de l'ÉLÈVE, y vers le HAUT : CoordPlane fait la conversion
 *   SVG, et nulle part ailleurs.
 * - Les coordonnées manipulées sont entières ou demi-entières : les tests de
 *   nullité sont exacts à `eps` près, jamais des `===` sur des flottants.
 * - Le vecteur nul n'a pas de direction : `compareDirections` le signale
 *   (direction: null) au lieu de trancher ; il est colinéaire à tout vecteur
 *   (det = 0), ce que la leçon dit explicitement en M3.
 */
export { formatDec, parseDec, roundTo };

const EPS = 1e-9;

/* ── Écriture ─────────────────────────────────────────────────────────── */

/** Un nombre à la française, avec le moins typographique : −2,5. */
export const fr = (n) => formatDec(n).replace('-', '−');

/** Un facteur dans un produit : les négatifs sont parenthésés, (−3). */
export const factor = (n) => (n < 0 ? `(${fr(n)})` : fr(n));

/** Écriture d'un couple : (3 ; −2). */
export const formatVec = (v) => `(${fr(v.x)} ; ${fr(v.y)})`;

/** Lit une saisie d'élève, en acceptant le moins typographique et la virgule. */
export function parseSigned(str) {
  return parseDec(String(str ?? '').replace('−', '-'));
}

/* ── Vecteurs ─────────────────────────────────────────────────────────── */

export const vecFromPoints = (A, B) => ({ x: B.x - A.x, y: B.y - A.y });
export const addVec = (u, v) => ({ x: u.x + v.x, y: u.y + v.y });
export const scaleVec = (u, k) => ({ x: roundTo(k * u.x), y: roundTo(k * u.y) });
export const isZeroVec = (u, eps = EPS) => Math.abs(u.x) < eps && Math.abs(u.y) < eps;
export const norm = (u) => Math.hypot(u.x, u.y);
export const dot = (u, v) => u.x * v.x + u.y * v.y;

/** LE nombre de la leçon : det(u, v) = x·y' − y·x'. */
export const det = (u, v) => roundTo(u.x * v.y - u.y * v.x);

/** Colinéaires ⟺ det = 0 (le vecteur nul est colinéaire à tout vecteur). */
export const areCollinear = (u, v, eps = EPS) => Math.abs(det(u, v)) < eps;

/**
 * Le réel k tel que v = k·u, ou null s'il n'existe pas (non colinéaires, ou
 * u nul avec v non nul). Pour u nul et v nul, k = 0 par convention.
 */
export function collinearityRatio(u, v, eps = EPS) {
  if (isZeroVec(u)) return isZeroVec(v) ? 0 : null;
  if (!areCollinear(u, v, eps)) return null;
  return roundTo(Math.abs(u.x) > Math.abs(u.y) ? v.x / u.x : v.y / u.y);
}

/** Même sens : colinéaires, non nuls, produit scalaire positif. */
export function sameSense(u, v) {
  if (isZeroVec(u) || isZeroVec(v) || !areCollinear(u, v)) return false;
  return dot(u, v) > 0;
}

/**
 * Les trois attributs comparés séparément — c'est la distinction que la
 * leçon fait vivre : même direction sans même sens, même direction sans
 * même longueur.
 *   direction : true / false, ou null si l'un des vecteurs est nul.
 *   sens      : 'meme' / 'contraire', ou null si pas la même direction.
 *   longueur  : true si les normes coïncident.
 */
export function compareDirections(u, v) {
  if (isZeroVec(u) || isZeroVec(v)) return { direction: null, sens: null, longueur: norm(u) === norm(v), k: collinearityRatio(u, v) };
  const direction = areCollinear(u, v);
  return {
    direction,
    sens: direction ? (dot(u, v) > 0 ? 'meme' : 'contraire') : null,
    longueur: Math.abs(norm(u) - norm(v)) < 1e-9,
    k: collinearityRatio(u, v),
  };
}

/* ── Points et droites ────────────────────────────────────────────────── */

/** A, B, C alignés ⟺ AB et AC colinéaires. */
export const pointsAligned = (A, B, C) => areCollinear(vecFromPoints(A, B), vecFromPoints(A, C));

/** (AB) ∥ (CD) ⟺ AB et CD colinéaires (A ≠ B et C ≠ D). */
export function linesParallel(A, B, C, D) {
  const AB = vecFromPoints(A, B);
  const CD = vecFromPoints(C, D);
  if (isZeroVec(AB) || isZeroVec(CD)) return false;
  return areCollinear(AB, CD);
}

/**
 * L'ordonnée y telle que A, B et C(cx ; y) soient alignés — la résolution
 * de det(AB, AC) = 0. null si (AB) est verticale (aucun ou tous les y).
 */
export function yForAlignment(A, B, cx) {
  const AB = vecFromPoints(A, B);
  if (Math.abs(AB.x) < EPS) return null;
  return roundTo(A.y + (AB.y * (cx - A.x)) / AB.x);
}

/* ── Écriture du déterminant ──────────────────────────────────────────── */

/** « 2 × 3 − 1 × 6 » — les facteurs négatifs parenthésés. */
export function detExpression(u, v) {
  return `${factor(u.x)} × ${factor(v.y)} − ${factor(u.y)} × ${factor(v.x)}`;
}

/** « 2 × 3 − 1 × 6 = 6 − 6 = 0 » : les deux produits, puis le résultat. */
export function detText(u, v) {
  const p1 = roundTo(u.x * v.y);
  const p2 = roundTo(u.y * v.x);
  const mid = `${fr(p1)} − ${factor(p2)}`;
  return `${detExpression(u, v)} = ${mid} = ${fr(det(u, v))}`;
}

/* ── Géométrie du dessin ──────────────────────────────────────────────── */

/**
 * Les deux extrémités du rail (la droite passant par P, de direction d)
 * coupé au cadre `range`. null si d est nul ou si la droite évite le cadre.
 * Découpe paramétrique par bandes : aucune tangente, aucun cas particulier
 * pour les verticales et horizontales.
 */
export function railEndpoints(P, d, range) {
  if (isZeroVec(d)) return null;
  let tMin = -Infinity;
  let tMax = Infinity;
  const slab = (o, dir, lo, hi) => {
    if (Math.abs(dir) < 1e-12) { if (o < lo - EPS || o > hi + EPS) { tMin = Infinity; tMax = -Infinity; } return; }
    const t1 = (lo - o) / dir; const t2 = (hi - o) / dir;
    tMin = Math.max(tMin, Math.min(t1, t2)); tMax = Math.min(tMax, Math.max(t1, t2));
  };
  slab(P.x, d.x, range.xMin, range.xMax);
  slab(P.y, d.y, range.yMin, range.yMax);
  if (tMin > tMax) return null;
  return { from: { x: P.x + tMin * d.x, y: P.y + tMin * d.y }, to: { x: P.x + tMax * d.x, y: P.y + tMax * d.y } };
}

/**
 * Le cadre qui contient tous les points dessinés ET l'origine, avec une
 * marge d'une unité, jamais plus petit que ±min. Le repère s'adapte à la
 * figure (§17bis) : un parallélogramme dont le sommet u + v sort du cadre
 * fixe est rogné ; ici il agrandit le cadre.
 */
export function fitRange(points, { min = 4, margin = 1 } = {}) {
  let xMin = -min; let xMax = min; let yMin = -min; let yMax = min;
  for (const p of points) {
    xMin = Math.min(xMin, Math.floor(p.x) - margin);
    xMax = Math.max(xMax, Math.ceil(p.x) + margin);
    yMin = Math.min(yMin, Math.floor(p.y) - margin);
    yMax = Math.max(yMax, Math.ceil(p.y) + margin);
  }
  return { xMin, xMax, yMin, yMax };
}

/** Un point est dans le cadre (bords inclus). */
export const inRange = (p, r) => p.x >= r.xMin - EPS && p.x <= r.xMax + EPS && p.y >= r.yMin - EPS && p.y <= r.yMax + EPS;

export const samePoint = (p, q) => Math.abs(p.x - q.x) < EPS && Math.abs(p.y - q.y) < EPS;
