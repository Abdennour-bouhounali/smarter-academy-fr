/**
 * diceUtils — la mathématique du laboratoire du dé, sans aucun pixel.
 *
 * UN LANCER EST UNE EXPÉRIENCE ALÉATOIRE ; UNE SÉRIE DE LANCERS EST UNE SÉRIE
 * STATISTIQUE. L'état est un simple tableau de six effectifs, `counts[face−1]`.
 * Tout le reste — total, fréquences, face en tête, écart entre les faces,
 * repère théorique, géométrie des barres — en est DÉRIVÉ. Rien n'est stocké
 * deux fois, donc rien ne peut se désynchroniser.
 *
 * LE HASARD EST REJOUABLE. Aucun `Math.random` : `rollMany` reçoit un `rng`
 * (`makeRng` de @smarter-academy/core), si bien qu'un test, un script
 * Playwright ou un élève qui recharge la page revoient la même suite.
 *
 * LE DÉ TRUQUÉ N'EST QU'UN VECTEUR DE POIDS. Un dé équilibré vaut [1,1,1,1,1,1]
 * ; alourdir la face k met son poids à LOADED_WEIGHT. La probabilité d'une face
 * est son poids divisé par la somme des poids : 1/6 n'est donc qu'un cas
 * particulier — celui où toutes les faces ont le même poids. C'est exactement
 * ce que l'étape « dé truqué » doit faire comprendre.
 *
 * NE PAS ARRONDIR LA MATHÉMATIQUE : `frequencies` renvoie des quotients exacts,
 * seuls `pct` et `formatPct` arrondissent, pour l'affichage.
 *
 * SÉCURITÉ D'AFFICHAGE (§17bis) : `barGeometry` calcule la hauteur de chaque
 * barre, la position de son étiquette et du repère théorique à partir d'une
 * échelle qui contient TOUJOURS la barre la plus haute et le repère le plus
 * haut. Le test balaie des états extrêmes (0, 1, 99 999 lancers, une face
 * seule, six faces égales) et vérifie qu'aucune étiquette ne sort du cadre.
 */

import { roundTo, formatDec } from '@smarter-academy/core';

export const FACES = [1, 2, 3, 4, 5, 6];
/** Six effectifs nuls — l'état initial, jamais muté. */
export const ZERO = Object.freeze([0, 0, 0, 0, 0, 0]);
/** Au-delà, les étiquettes d'effectif dépasseraient six caractères. */
export const MAX_TOTAL = 99999;
/** Poids de la face alourdie d'un dé truqué : 3/8 = 37,5 % contre 1/8. */
export const LOADED_WEIGHT = 3;
/** Durée du roulement du dé — la valeur n'est révélée qu'après. */
export const ROLL_MS = 450;

export const fairWeights = () => [1, 1, 1, 1, 1, 1];

/** Les poids d'un dé dont la face `face` est alourdie ; équilibré si null. */
export function loadedWeights(face, k = LOADED_WEIGHT) {
  const w = fairWeights();
  if (Number.isInteger(face) && face >= 1 && face <= 6) w[face - 1] = k;
  return w;
}

/** La probabilité de chaque face : poids ÷ somme des poids. Somme exacte 1. */
export function probabilities(weights = fairWeights()) {
  const s = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => w / s);
}

/** Un lancer : une face de 1 à 6, tirée selon les poids. */
export function rollOnce(rng, weights = fairWeights()) {
  const s = weights.reduce((a, b) => a + b, 0);
  let r = rng.next() * s;
  for (let i = 0; i < 6; i += 1) {
    r -= weights[i];
    if (r < 0) return i + 1;
  }
  return 6;
}

/**
 * n lancers ajoutés aux effectifs `counts`. Renvoie de NOUVEAUX effectifs et
 * la dernière face obtenue — l'entrée n'est jamais modifiée.
 */
export function rollMany(counts, n, rng, weights = fairWeights()) {
  const next = [...counts];
  let last = null;
  for (let i = 0; i < n; i += 1) {
    last = rollOnce(rng, weights);
    next[last - 1] += 1;
  }
  return { counts: next, last };
}

/** L'effectif total : la somme des six effectifs. */
export const totalOf = (counts) => counts.reduce((a, b) => a + b, 0);

/** Les six fréquences exactes (effectif ÷ total) ; six zéros sans lancer. */
export function frequencies(counts) {
  const t = totalOf(counts);
  return counts.map((c) => (t === 0 ? 0 : c / t));
}

/** Une fréquence en pourcentage, arrondie pour l'AFFICHAGE seulement. */
export const pct = (freq, dp = 1) => roundTo(freq * 100, dp);

/** « 17,0 % » — ou « — » tant qu'aucun lancer n'a eu lieu. */
export function formatPct(freq, total, dp = 1) {
  if (!total) return '—';
  return `${formatDec(pct(freq, dp), { minDecimals: dp, maxDecimals: dp })} %`;
}

/** Les faces en tête (toutes, en cas d'égalité) ; vide sans lancer. */
export function leaders(counts) {
  if (totalOf(counts) === 0) return [];
  const m = Math.max(...counts);
  return FACES.filter((f) => counts[f - 1] === m);
}

/** Les faces les moins sorties (toutes, en cas d'égalité) ; vide sans lancer. */
export function laggards(counts) {
  if (totalOf(counts) === 0) return [];
  const m = Math.min(...counts);
  return FACES.filter((f) => counts[f - 1] === m);
}

/** L'écart, en points de pourcentage, entre la face la plus et la moins fréquente. */
export function spreadPoints(counts, dp = 1) {
  const t = totalOf(counts);
  if (t === 0) return null;
  return roundTo(((Math.max(...counts) - Math.min(...counts)) / t) * 100, dp);
}

/** « 3 », « 3 et 5 », « 2, 3 et 5 » — pour une phrase de correction. */
export function faceList(faces) {
  if (faces.length === 0) return '';
  if (faces.length === 1) return String(faces[0]);
  return `${faces.slice(0, -1).join(', ')} et ${faces[faces.length - 1]}`;
}

/* ── Géométrie du graphique en barres ─────────────────────────────── */

export const CHART = Object.freeze({
  W: 600, H: 238,
  TOP: 30,          // au-dessus : la zone réservée aux étiquettes d'effectif
  BASE: 196,        // la ligne de base des barres
  COL: 100,         // une colonne par face
  BAR_W: 56,
  LABEL_GAP: 6,     // entre le sommet d'une barre et son étiquette
  FACE_Y: 206,      // le haut de la mini-face sous la ligne de base
  FACE_SIZE: 24,
});

const GLYPH = { ' ': 3, ' ': 3, ',': 3 };
/** Largeur estimée d'une étiquette, caractère par caractère. */
export const textWidth = (s, size = 12) =>
  [...String(s)].reduce((n, c) => n + (GLYPH[c] ?? size * 0.6), 0);

/**
 * L'échelle verticale : le plus grand des effectifs, du repère théorique le
 * plus haut, et d'un tiers du total — ce plancher garde les barres d'un dé
 * équilibré à mi-hauteur, au lieu de coller la face en tête au plafond.
 */
export function scaleMax(counts, theory = null) {
  const t = totalOf(counts);
  const maxCount = Math.max(0, ...counts);
  const theoryMax = theory ? Math.max(0, ...theory.map((p) => p * t)) : 0;
  return Math.max(1, maxCount, Math.ceil(theoryMax), Math.ceil(t / 3));
}

/**
 * La géométrie des six barres. Invariants (testés) : y ≥ TOP, h ≥ 0, le
 * repère théorique est dans le cadre, l'étiquette tient dans sa colonne.
 */
export function barGeometry(counts, theory = null, g = CHART) {
  const t = totalOf(counts);
  const sm = scaleMax(counts, theory);
  const plotH = g.BASE - g.TOP;
  const bars = counts.map((c, i) => {
    const h = (c / sm) * plotH;
    const cx = g.COL * i + g.COL / 2;
    const y = g.BASE - h;
    const tick = theory && t > 0 ? g.BASE - ((theory[i] * t) / sm) * plotH : null;
    return {
      face: i + 1, cx, x: cx - g.BAR_W / 2, y, h,
      label: formatDec(c), labelY: y - g.LABEL_GAP, tick,
    };
  });
  return { bars, scaleMax: sm, total: t, plotH };
}
