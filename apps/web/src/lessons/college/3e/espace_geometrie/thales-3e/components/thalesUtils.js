/**
 * Modèle mathématique de la leçon « Théorème de Thalès » (3e).
 *
 * ─── CE QUI MANQUAIT À LA VERSION PRÉ-KIT ──────────────────────────────
 * `InteractiveThales` construisait bien M et N à partir d'un rapport k, si
 * bien que (MN) ∥ (BC) était vrai par construction. Mais LES RAPPORTS
 * N'ÉTAIENT JAMAIS AFFICHÉS NI COMPARÉS : l'élève voyait une figure bouger et
 * lisait ensuite que « les rapports sont égaux ». L'invariant central de la
 * leçon n'était donc jamais constaté. Ici, `ratiosOf` les calcule et le module
 * signature les fait TAMPONNER, forme après forme.
 *
 * ─── L'ÉQUIVALENCE ENSEIGNÉE ───────────────────────────────────────────
 * Les rapports coïncident ⟺ (MN) est parallèle à (BC). Les deux sens sont
 * manipulés : le direct (parallèle ⇒ rapports égaux) au module 3, la
 * réciproque et la contraposée (rapports ⇒ parallélisme ou non) au module 5.
 * `ratiosAgree` et `areParallel` sont testés ensemble, avec le même eps, pour
 * que l'équivalence soit vérifiable plutôt qu'affirmée.
 *
 * ─── REPÈRE ────────────────────────────────────────────────────────────
 * Sommets en coordonnées SVG (y vers le BAS). Aucune longueur affichée à
 * l'élève n'est un pixel : les modules utilisent les échelles de leurs propres
 * énoncés (cm), les pixels ne servent qu'au dessin.
 *
 * ─── PÉRIMÈTRE ─────────────────────────────────────────────────────────
 * Configuration « triangle » et configuration « papillon ». Les homothéties
 * formelles sont hors programme.
 */
import {
  dist, lineThrough, intersect, parallelThrough, areParallel, areCollinear,
  pointOnSegmentAt, lengthRatio, midpoint,
} from '../../../../../common/utils/geometry2d';

export const TOL = {
  ratio: 0.02,   // 2 % d'écart entre deux rapports
  eps: 1e-6,     // le MÊME eps pour intersect / areParallel / ratiosAgree
};

/* ── La configuration ─────────────────────────────────────────────────── */

/**
 * Le point M sur la droite (AB), au paramètre k :
 *   k ∈ ]0 ; 1[  → M entre A et B  (configuration « triangle »)
 *   k < 0        → M de l'autre côté de A (configuration « papillon »)
 * C'est ce seul signe qui fait basculer d'une configuration à l'autre — et
 * c'est pourquoi le module 3 laisse l'élève traverser k = 0.
 */
export function thalesPoint(A, B, k) {
  return pointOnSegmentAt(A, B, k);
}

/**
 * N, CONSTRUIT comme l'intersection de la parallèle à (BC) passant par M avec
 * la droite (AC). Le parallélisme est donc vrai par construction : le dessin
 * ne peut pas mentir sur ce point.
 */
export function constructN(A, B, C, M) {
  try {
    const bc = lineThrough(B, C);
    const ac = lineThrough(A, C);
    return intersect(parallelThrough(bc, M), ac, TOL.eps);
  } catch {
    return null;
  }
}

/** N libre, au paramètre k' sur (AC) — pour la configuration NON parallèle. */
export function freeN(A, C, k) {
  return pointOnSegmentAt(A, C, k);
}

/* ── Les rapports ─────────────────────────────────────────────────────── */

/**
 * Les trois rapports de la configuration :
 *   AM/AB, AN/AC, MN/BC.
 * Renvoie `null` pour un rapport dont le dénominateur s'annule — jamais
 * l'infini, qui n'aurait aucun sens géométrique à afficher.
 */
export function ratiosOf(A, B, C, M, N) {
  if (!M || !N) return { am: null, an: null, mn: null };
  return {
    am: lengthRatio(dist(A, M), dist(A, B)),
    an: lengthRatio(dist(A, N), dist(A, C)),
    mn: lengthRatio(dist(M, N), dist(B, C)),
  };
}

/** Les trois rapports coïncident-ils ? */
export function ratiosAgree(r, tol = TOL.ratio) {
  const vals = [r.am, r.an, r.mn].filter((v) => v !== null);
  if (vals.length < 2) return false;
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  return max - min <= tol * Math.max(max, 1e-9);
}

/** Deux rapports seulement (les seuls calculables dans un énoncé chiffré). */
export function twoRatiosAgree(a, b, tol = TOL.ratio) {
  if (a === null || b === null) return false;
  return Math.abs(a - b) <= tol * Math.max(Math.abs(a), Math.abs(b), 1e-9);
}

/**
 * INVARIANT ENSEIGNÉ : les rapports coïncident ⟺ (MN) ∥ (BC).
 * Vérifié par les tests sur des configurations variées, avec le même eps.
 */
export function parallelMatchesRatios(A, B, C, M, N) {
  const r = ratiosOf(A, B, C, M, N);
  let parallel = false;
  try {
    parallel = areParallel(lineThrough(M, N), lineThrough(B, C), TOL.eps);
  } catch {
    parallel = false;
  }
  return ratiosAgree(r) === parallel;
}

/** (MN) est-elle parallèle à (BC) ? Seul juge, avec le même eps partout. */
export function isParallelMNBC(B, C, M, N) {
  try {
    return areParallel(lineThrough(M, N), lineThrough(B, C), TOL.eps);
  } catch {
    return false;
  }
}

/** La configuration est-elle « papillon » (M et N de l'autre côté de A) ? */
export function isPapillon(A, B, M) {
  const t = dist(A, M);
  if (t < 1e-9) return false;
  // M est du côté opposé à B par rapport à A ⟺ produit scalaire négatif.
  const u = { x: M.x - A.x, y: M.y - A.y };
  const v = { x: B.x - A.x, y: B.y - A.y };
  return u.x * v.x + u.y * v.y < 0;
}

/* ── Calculs sur un énoncé chiffré ────────────────────────────────────── */

/**
 * La quatrième proportionnelle : si a/b = c/d, l'inconnue se déduit par
 * produit en croix. `unknown` dit laquelle des quatre valeurs manque.
 */
export function fourthProportional({ a, b, c, d }) {
  if (a === null || a === undefined) return (b * c) / d;
  if (b === null || b === undefined) return (a * d) / c;
  if (c === null || c === undefined) return (a * d) / b;
  return (b * c) / a;
}

/** Arrondi au dixième, comme les énoncés le demandent. */
export function roundTenth(v) {
  return Math.round(v * 10) / 10;
}

/**
 * Une longueur calculée par Thalès est-elle cohérente ?
 * Dans une RÉDUCTION (k < 1), la longueur image est plus courte ; dans un
 * AGRANDISSEMENT, plus longue. C'est le contrôle qu'on apprend à faire.
 */
export function coherenceCheck(k, source, image) {
  if (k < 1) return image < source;
  if (k > 1) return image > source;
  return Math.abs(image - source) < 1e-9;
}

/* ── Rédaction ────────────────────────────────────────────────────────── */

export const PROOF_TEMPLATES = {
  direct: {
    id: 'direct',
    titre: 'Théorème de Thalès (calculer une longueur)',
    enonce: 'Les droites (MN) et (BC) sont parallèles. On connaît AM = 3 cm, AB = 9 cm et BC = 12 cm. Combien mesure MN ?',
    correct: ['d-config', 'd-paralleles', 'p-thales', 'c-calcul'],
    steps: [
      { id: 'd-config', role: 'donnee', text: 'Les points A, M, B sont alignés, ainsi que A, N, C.' },
      { id: 'd-paralleles', role: 'donnee', text: 'Les droites (MN) et (BC) sont parallèles.' },
      { id: 'p-thales', role: 'propriete', text: 'D’après le théorème de Thalès : AM/AB = AN/AC = MN/BC.' },
      { id: 'c-calcul', role: 'conclusion', text: 'Donc MN = (AM × BC) / AB = (3 × 12) / 9 = 4 cm.' },
      { id: 'piege-reciproque', role: 'piege', text: 'D’après la réciproque du théorème de Thalès, (MN) et (BC) sont parallèles.' },
      { id: 'piege-somme', role: 'piege', text: 'Donc MN = BC − AM = 12 − 3 = 9 cm.' },
      { id: 'piege-inverse', role: 'piege', text: 'Donc MN = (AB × BC) / AM = (9 × 12) / 3 = 36 cm.' },
    ],
  },
  reciproque: {
    id: 'reciproque',
    titre: 'Réciproque (démontrer un parallélisme)',
    enonce: 'A, M, B sont alignés et A, N, C aussi, dans le même ordre. AM = 4, AB = 10, AN = 6, AC = 15. Les droites (MN) et (BC) sont-elles parallèles ?',
    correct: ['r-align', 'r-calc1', 'r-calc2', 'r-conclusion'],
    steps: [
      { id: 'r-align', role: 'donnee', text: 'Les points A, M, B d’une part et A, N, C d’autre part sont alignés dans le même ordre.' },
      { id: 'r-calc1', role: 'calcul', text: 'D’une part : AM/AB = 4/10 = 0,4.' },
      { id: 'r-calc2', role: 'calcul', text: 'D’autre part : AN/AC = 6/15 = 0,4.' },
      { id: 'r-conclusion', role: 'conclusion', text: 'Les deux rapports sont égaux : d’après la réciproque du théorème de Thalès, (MN) et (BC) sont parallèles.' },
      { id: 'piege-direct2', role: 'piege', text: 'D’après le théorème de Thalès, AM/AB = AN/AC.' },
      { id: 'piege-diff', role: 'piege', text: 'AB − AM = 6 et AC − AN = 9, donc les droites sont parallèles.' },
    ],
  },
};

export function checkProof(chosen, key) {
  const { correct } = PROOF_TEMPLATES[key];
  const ok = chosen.length === correct.length && chosen.every((id, i) => id === correct[i]);
  const firstWrong = chosen.findIndex((id, i) => id !== correct[i]);
  return { ok, firstWrong: ok ? -1 : firstWrong };
}

/* ── Les figures de la leçon (constantes littérales) ─────────────────── */

export const BOX = { xMin: 0, yMin: 0, xMax: 360, yMax: 280 };

export const FIGURES = {
  /** La configuration de référence : A en haut, [BC] en bas. */
  triangle: { A: { x: 175, y: 40 }, B: { x: 60, y: 225 }, C: { x: 305, y: 225 } },
  /** Une configuration plus penchée, pour montrer que la forme n'importe pas. */
  penche: { A: { x: 90, y: 55 }, B: { x: 50, y: 235 }, C: { x: 310, y: 190 } },
};

/** Les cinq figures du module 2 : lesquelles sont des configurations de Thalès ? */
export const RECONNAISSANCE = [
  { id: 'r1', label: 'Figure 1', kind: 'triangle', valide: true },
  { id: 'r2', label: 'Figure 2', kind: 'papillon', valide: true },
  { id: 'r3', label: 'Figure 3', kind: 'non-parallele', valide: false },
  { id: 'r4', label: 'Figure 4', kind: 'non-alignes', valide: false },
];

export { dist, areCollinear, midpoint, lengthRatio };
