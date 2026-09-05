/**
 * lineUtils — le modèle mathématique de la leçon « Équations de droites » (2nde).
 *
 * ÉTAT CANONIQUE : une droite est `{ A, u }` — un point A et un vecteur
 * directeur u ≠ 0, en coordonnées d'élève (y vers le haut). Tout le reste est
 * DÉRIVÉ de cet état : pente, équation cartésienne, équation réduite, points
 * de la droite, test d'appartenance. Aucune représentation n'entretient son
 * propre état (playbook §4).
 *
 * Conventions :
 *  - pente m = u_y / u_x, `null` pour une droite verticale (u_x = 0) — jamais
 *    Infinity, jamais « une très grande pente ».
 *  - équation cartésienne a·x + b·y + c = 0 avec (a ; b) = (u_y ; −u_x) : le
 *    vecteur (−b ; a) redonne un vecteur directeur. Quand les entrées sont
 *    décimales à ≤ 3 décimales, les coefficients sont ramenés à des entiers
 *    premiers entre eux, premier coefficient non nul positif : l'écriture
 *    affichée est canonique, deux droites égales s'écrivent pareil.
 *  - équation réduite y = m·x + p si b ≠ 0, sinon `{ vertical: true, x0 }`
 *    (x = x0). Une droite verticale n'a PAS d'équation réduite : la leçon le
 *    fait constater, le modèle ne l'invente pas.
 *  - déterminant det(u, v) = u_x·v_y − u_y·v_x (produit vectoriel 2D).
 */
import { formatDec, roundTo } from '@smarter-academy/core';
import { clipToBox, cross } from '../../../../../common/utils/geometry2d';

const EPS = 1e-6;

/* ── Vecteurs & points ─────────────────────────────────────────────────── */

export const vecAB = (A, B) => ({ x: B.x - A.x, y: B.y - A.y });
export const addVec = (P, v) => ({ x: P.x + v.x, y: P.y + v.y });
export const scaleVec = (v, k) => ({ x: v.x * k, y: v.y * k });
export const isZeroVec = (v, eps = EPS) => Math.abs(v.x) < eps && Math.abs(v.y) < eps;

/** det(u, v) = u_x·v_y − u_y·v_x. Nul ⟺ u et v colinéaires. */
export const det = (u, v) => roundTo(cross(u, v), 9);

/** Le point A + t·u : tous les points de la droite, un par réel t. */
export const pointAt = (A, u, t) => ({ x: roundTo(A.x + t * u.x, 9), y: roundTo(A.y + t * u.y, 9) });

/** Pente : u_y / u_x, ou null si la droite est verticale. */
export function slopeOf(u) {
  if (Math.abs(u.x) < EPS) return null;
  return roundTo(u.y / u.x, 9);
}

export const slopeFromPoints = (P, Q) => slopeOf(vecAB(P, Q));

/* ── Constructions ─────────────────────────────────────────────────────── */

/** Droite passant par P et Q ; null si P = Q (aucune droite définie). */
export function lineFromPoints(P, Q) {
  const u = vecAB(P, Q);
  if (isZeroVec(u)) return null;
  return { A: { x: P.x, y: P.y }, u };
}

/** Droite passant par A de pente m : vecteur directeur (1 ; m). */
export const lineFromSlope = (A, m) => ({ A: { x: A.x, y: A.y }, u: { x: 1, y: m } });

/** Droite d'équation réduite y = m·x + p : passe par (0 ; p), direction (1 ; m). */
export const lineFromReduced = (m, p) => ({ A: { x: 0, y: p }, u: { x: 1, y: m } });

/** Un vecteur directeur de la droite a·x + b·y + c = 0 : (−b ; a). */
export const directionOfCartesian = ({ a, b }) => ({ x: -b, y: a });

/** Droite d'équation cartésienne a·x + b·y + c = 0 ; null si a = b = 0. */
export function lineFromCartesian({ a, b, c }) {
  if (Math.abs(a) < EPS && Math.abs(b) < EPS) return null;
  const A = Math.abs(b) >= EPS ? { x: 0, y: roundTo(-c / b, 9) } : { x: roundTo(-c / a, 9), y: 0 };
  return { A, u: directionOfCartesian({ a, b }) };
}

/* ── Équations dérivées ────────────────────────────────────────────────── */

const gcd = (x, y) => (y === 0 ? Math.abs(x) : gcd(y, x % y));
const isInt = (v) => Math.abs(v - Math.round(v)) < 1e-7;

/**
 * Ramène (a, b, c) à des entiers premiers entre eux quand c'est possible
 * (≤ 3 décimales), premier coefficient non nul positif. Sinon renvoie les
 * valeurs arrondies telles quelles, signe normalisé.
 */
export function canonicalCoeffs({ a, b, c }) {
  let k = null;
  for (const cand of [1, 2, 4, 5, 8, 10, 20, 25, 40, 50, 100, 125, 200, 250, 500, 1000]) {
    if (isInt(a * cand) && isInt(b * cand) && isInt(c * cand)) { k = cand; break; }
  }
  let A = a; let B = b; let C = c;
  if (k !== null) {
    A = Math.round(a * k); B = Math.round(b * k); C = Math.round(c * k);
    const g = gcd(gcd(A, B), C);
    if (g > 1) { A /= g; B /= g; C /= g; }
  } else {
    A = roundTo(a, 6); B = roundTo(b, 6); C = roundTo(c, 6);
  }
  const lead = Math.abs(A) >= EPS ? A : B;
  if (lead < 0) { A = -A; B = -B; C = -C; }
  // −0 → 0
  return { a: A === 0 ? 0 : A, b: B === 0 ? 0 : B, c: C === 0 ? 0 : C };
}

/**
 * Équation cartésienne a·x + b·y + c = 0 de la droite { A, u } :
 *   det(AM, u) = 0  ⟺  u_y·(x − x_A) − u_x·(y − y_A) = 0.
 * Donc a = u_y, b = −u_x, c = −(a·x_A + b·y_A).
 */
export function cartesianOf(line) {
  const a = line.u.y;
  const b = -line.u.x;
  const c = -(a * line.A.x + b * line.A.y);
  return canonicalCoeffs({ a, b, c });
}

/** Équation réduite : { m, p } si la droite n'est pas verticale, sinon { vertical: true, x0 }. */
export function reducedOf(line) {
  const m = slopeOf(line.u);
  if (m === null) return { vertical: true, x0: roundTo(line.A.x, 9) };
  const p = roundTo(line.A.y - m * line.A.x, 9);
  return { vertical: false, m, p };
}

/* ── Appartenance & alignement ─────────────────────────────────────────── */

/** a·x_M + b·y_M + c — le nombre qui vaut 0 exactement quand M est sur la droite. */
export function residual(line, M) {
  const { a, b, c } = cartesianOf(line);
  return roundTo(a * M.x + b * M.y + c, 9);
}

export const isOnLine = (line, M, eps = EPS) => Math.abs(residual(line, M)) < eps;

/** det(AM, u) — le test « géométrique » : nul ⟺ M ∈ (A ; u). */
export const detTest = (line, M) => det(vecAB(line.A, M), line.u);

/** P, Q, R alignés ⟺ det(PQ, PR) = 0 (Q ou R peut être confondu avec P). */
export const areAligned = (P, Q, R, eps = EPS) => Math.abs(det(vecAB(P, Q), vecAB(P, R))) < eps;

/** Même droite ⟺ directions colinéaires ET le point de l'une est sur l'autre. */
export function sameLine(l1, l2, eps = EPS) {
  return Math.abs(det(l1.u, l2.u)) < eps && isOnLine(l1, l2.A, eps);
}

/* ── Dessin : ce qu'il faut tracer dans le cadre ───────────────────────── */

/** Les deux extrémités de la corde de la droite dans `range`, ou null. */
export function clipLine(line, range) {
  const seg = clipToBox({ kind: 'droite', a: line.A, b: addVec(line.A, line.u) }, range);
  return seg ? [seg.from, seg.to] : null;
}

/* ── Écritures françaises ──────────────────────────────────────────────── */

const fd = (v) => formatDec(v, { maxDecimals: 3 });

/** (2 ; −3,5) */
export const formatPoint = (P) => `(${fd(P.x)} ; ${fd(P.y)})`;
export const formatVec = formatPoint;

/** Un terme « k·x » : 1 → x, −1 → −x, 0 → '' (géré par l'appelant). */
function term(k, sym) {
  if (Math.abs(k - 1) < EPS) return sym;
  if (Math.abs(k + 1) < EPS) return `−${sym}`;
  return `${fd(k)}${sym}`;
}

/** Enchaîne des termes signés : « 2x − y + 1 ». */
function joinTerms(parts) {
  const kept = parts.filter((p) => Math.abs(p.k) >= EPS);
  if (kept.length === 0) return '0';
  return kept.map((p, i) => {
    const body = p.sym ? term(Math.abs(p.k), p.sym) : fd(Math.abs(p.k));
    if (i === 0) return p.k < 0 ? `−${body}` : body;
    return `${p.k < 0 ? ' − ' : ' + '}${body}`;
  }).join('');
}

/** « 2x − y + 1 = 0 » à partir de {a, b, c}. */
export function formatCartesian({ a, b, c }) {
  return `${joinTerms([{ k: a, sym: 'x' }, { k: b, sym: 'y' }, { k: c, sym: '' }])} = 0`;
}

/** « y = 2x + 1 », « y = −x », « y = 3 », ou « x = −2 » pour une verticale. */
export function formatReduced(red) {
  if (red.vertical) return `x = ${fd(red.x0)}`;
  return `y = ${joinTerms([{ k: red.m, sym: 'x' }, { k: red.p, sym: '' }])}`;
}

/** Pente lisible : exacte à ≤ 3 décimales, sinon « ≈ 0,33 ». */
export function formatSlope(m) {
  if (m === null) return 'aucune (verticale)';
  const r3 = roundTo(m, 3);
  if (Math.abs(r3 - m) < 1e-9) return fd(m);
  return `≈ ${formatDec(m, { maxDecimals: 2 })}`;
}

/** « 3/2 » — la pente comme quotient u_y / u_x (pour la lire sur l'escalier). */
export const formatSlopeQuotient = (u) => (Math.abs(u.x) < EPS ? '—' : `${fd(u.y)} / ${fd(u.x)}`);

/* ── Plan et figures partagées entre modules (constantes littérales) ───── */

export const RANGE = { xMin: -6, xMax: 6, yMin: -6, yMax: 6 };

/** Borne un point au cadre. */
export const clampToRange = (P, range = RANGE) => ({
  x: Math.max(range.xMin, Math.min(range.xMax, P.x)),
  y: Math.max(range.yMin, Math.min(range.yMax, P.y)),
});
export const inRange = (P, range = RANGE) =>
  P.x >= range.xMin - EPS && P.x <= range.xMax + EPS && P.y >= range.yMin - EPS && P.y <= range.yMax + EPS;

/** La droite fil rouge de la leçon : A(1 ; 3), u(1 ; 2) — 2x − y + 1 = 0, y = 2x + 1. */
export const FIGURES = {
  fil: { A: { x: 1, y: 3 }, u: { x: 1, y: 2 } },
  /** M5 : y = 0,5x + 1 — des pièges à 0,1 près, invisibles à l'œil. */
  membership: { A: { x: 0, y: 1 }, u: { x: 2, y: 1 } },
};
