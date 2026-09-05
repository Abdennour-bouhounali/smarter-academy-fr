/**
 * probaUtils — la mathématique du laboratoire du hasard, sans aucun pixel.
 *
 * UNE SEULE VÉRITÉ PAR EXPÉRIENCE : six effectifs pour un dé (`counts[face−1]`),
 * onze effectifs pour la somme de deux dés (`counts[somme−2]`), trois
 * effectifs pour un sac ou une roue (par couleur). Total, fréquences, face en
 * tête, écart, repère théorique, géométrie des barres en sont DÉRIVÉS à
 * chaque rendu — rien n'est stocké deux fois, donc rien ne peut diverger.
 *
 * LE HASARD EST REJOUABLE. Aucun `Math.random` : chaque simulation reçoit un
 * `rng` (`makeRng` de @smarter-academy/core). Un test, un script Playwright ou
 * un élève qui recharge la page revoient la même suite.
 *
 * LA PROBABILITÉ VIENT DU MODÈLE, LA FRÉQUENCE DE L'EXPÉRIENCE. `probabilities`
 * calcule sur des poids (le dé équilibré n'est que le cas [1,1,1,1,1,1]) ;
 * `frequencies` calcule sur des effectifs. Les deux ne se touchent jamais.
 *
 * NE PAS ARRONDIR LA MATHÉMATIQUE : `frequencies`, `probabilities`,
 * `eventProbability`, `bagProbability` renvoient des quotients exacts ; seuls
 * `pct` / `formatPct` arrondissent, pour l'affichage.
 *
 * SÉCURITÉ D'AFFICHAGE (§17bis) : `barsGeometry` calcule hauteur, étiquette et
 * repère de chaque barre sur une échelle qui contient TOUJOURS la barre la
 * plus haute et le repère le plus haut ; une étiquette par colonne. Le test
 * balaie des états extrêmes (0, 1, 99 999 lancers ; une face seule ; onze
 * sommes ; dé truqué).
 *
 * Adapté (copié, non importé — playbook §14 ADAPT) de
 * statistiques-3e/components/diceUtils.js, puis étendu : expérience « après
 * une série », événements, fractions, sac, deux dés, roue.
 */

import { roundTo, formatDec } from '@smarter-academy/core';

export { roundTo, formatDec };

export const FACES = [1, 2, 3, 4, 5, 6];
/** Six effectifs nuls — l'état initial, jamais muté. */
export const ZERO = Object.freeze([0, 0, 0, 0, 0, 0]);
/** Les onze sommes de deux dés, dans l'ordre. */
export const SUMS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
export const ZERO_SUMS = Object.freeze(SUMS.map(() => 0));
/** Au-delà, les étiquettes d'effectif dépasseraient six caractères. */
export const MAX_TOTAL = 99999;
/** Poids de la face alourdie d'un dé truqué : 3/8 = 37,5 % contre 1/8. */
export const LOADED_WEIGHT = 3;
/** Durée du roulement du dé — la valeur n'est révélée qu'après. */
export const ROLL_MS = 450;

export const fairWeights = () => [1, 1, 1, 1, 1, 1];

/** Nombre de derniers résultats conservés pour la bande « derniers lancers ». */
export const TAIL = 12;

/**
 * La graine d'une session. Un élève qui ouvre le module doit voir un dé qui
 * ne donne PAS toujours la même première face — la graine mêle donc un
 * littéral à l'horloge. Un test ou un script Playwright qui a besoin d'une
 * suite rejouable fixe `window.__SMARTER_RNG_SEED` avant le chargement : la
 * graine redevient alors purement déterministe. Aucun `Math.random` :
 * l'aléa reste injecté par `makeRng`.
 */
export function sessionSeed(base) {
  if (typeof window !== 'undefined' && Number.isFinite(window.__SMARTER_RNG_SEED)) {
    return base + window.__SMARTER_RNG_SEED;
  }
  return (base + (Date.now() % 2147483647)) % 2147483647 || base;
}

/** Les poids d'un dé dont la face `face` est alourdie ; équilibré si null. */
export function loadedWeights(face, k = LOADED_WEIGHT) {
  const w = fairWeights();
  if (Number.isInteger(face) && face >= 1 && face <= 6) w[face - 1] = k;
  return w;
}

/** La probabilité de chaque issue : poids ÷ somme des poids. Somme exacte 1. */
export function probabilities(weights = fairWeights()) {
  const s = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => w / s);
}

/** Une issue parmi n, tirée selon les poids (index 0…n−1). */
export function drawIndex(rng, weights) {
  const s = weights.reduce((a, b) => a + b, 0);
  let r = rng.next() * s;
  for (let i = 0; i < weights.length; i += 1) {
    r -= weights[i];
    if (r < 0) return i;
  }
  return weights.length - 1;
}

/** Un lancer : une face de 1 à 6, tirée selon les poids. */
export const rollOnce = (rng, weights = fairWeights()) => drawIndex(rng, weights) + 1;

/**
 * n lancers ajoutés aux effectifs `counts`. Renvoie de NOUVEAUX effectifs et
 * la dernière face obtenue — l'entrée n'est jamais modifiée.
 */
export function rollMany(counts, n, rng, weights = fairWeights()) {
  const next = [...counts];
  let last = null;
  const tail = [];
  for (let i = 0; i < n; i += 1) {
    last = rollOnce(rng, weights);
    next[last - 1] += 1;
    tail.push(last);
    if (tail.length > TAIL) tail.shift();
  }
  return { counts: next, last, tail };
}

/** Les derniers résultats d'une bande, prolongée par ceux d'un nouveau lot. */
export const appendTail = (recent, tail) => [...recent, ...tail].slice(-TAIL);

/**
 * L'expérience « le dé a-t-il une mémoire ? » : `trials` fois de suite, on
 * lance jusqu'à obtenir `len` fois la face `face` consécutivement, puis on
 * NOTE LE LANCER SUIVANT. Renvoie les six effectifs de ce lancer suivant et le
 * nombre total de lancers qu'il a fallu. Sur un dé équilibré, le lancer
 * suivant se répartit comme n'importe quel lancer : ≈ 1/6 par face.
 */
export function afterStreak(rng, face = 6, len = 3, trials = 300, weights = fairWeights()) {
  const next = [0, 0, 0, 0, 0, 0];
  let rolls = 0;
  for (let t = 0; t < trials; t += 1) {
    let streak = 0;
    while (streak < len) {
      rolls += 1;
      if (rollOnce(rng, weights) === face) streak += 1;
      else streak = 0;
    }
    rolls += 1;
    next[rollOnce(rng, weights) - 1] += 1;
  }
  return { counts: next, rolls };
}

/** L'effectif total : la somme des effectifs. */
export const totalOf = (counts) => counts.reduce((a, b) => a + b, 0);

/** Les fréquences exactes (effectif ÷ total) ; des zéros sans essai. */
export function frequencies(counts) {
  const t = totalOf(counts);
  return counts.map((c) => (t === 0 ? 0 : c / t));
}

/** Une fréquence en pourcentage, arrondie pour l'AFFICHAGE seulement. */
export const pct = (freq, dp = 1) => roundTo(freq * 100, dp);

/** « 17,0 % » — ou « — » tant qu'aucun essai n'a eu lieu. */
export function formatPct(freq, total, dp = 1) {
  if (!total) return '—';
  return `${formatDec(pct(freq, dp), { minDecimals: dp, maxDecimals: dp })} %`;
}

/** Les faces en tête (toutes, en cas d'égalité) ; vide sans lancer. */
export function leaders(counts, labels = FACES) {
  if (totalOf(counts) === 0) return [];
  const m = Math.max(...counts);
  return labels.filter((_, i) => counts[i] === m);
}

/** Les faces les moins sorties (toutes, en cas d'égalité) ; vide sans lancer. */
export function laggards(counts, labels = FACES) {
  if (totalOf(counts) === 0) return [];
  const m = Math.min(...counts);
  return labels.filter((_, i) => counts[i] === m);
}

/** L'écart, en points de pourcentage, entre l'issue la plus et la moins fréquente. */
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

/* ── Fractions ─────────────────────────────────────────────────────── */

export function gcd(a, b) {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) [x, y] = [y, x % y];
  return x || 1;
}

/** { num, den } irréductible ; den > 0. 0/n → 0/1. */
export function simplify(num, den) {
  if (den === 0) throw new Error('simplify: dénominateur nul');
  if (num === 0) return { num: 0, den: 1 };
  const g = gcd(num, den);
  const s = den < 0 ? -1 : 1;
  return { num: (s * num) / g, den: (s * den) / g };
}

/** Deux fractions sont-elles le même nombre ? */
export const equalFractions = (a, b) => a.num * b.den === b.num * a.den;

/** « \frac{1}{6} » ou « 0 » / « 1 » pour KaTeX. */
export function fracLatex(num, den) {
  const f = simplify(num, den);
  if (f.den === 1) return String(f.num);
  return `\\frac{${f.num}}{${f.den}}`;
}

/** « 1/6 » en texte simple, réduit. */
export function fracText(num, den) {
  const f = simplify(num, den);
  return f.den === 1 ? String(f.num) : `${f.num}/${f.den}`;
}

/* ── Événements sur un dé ──────────────────────────────────────────── */

/**
 * La probabilité d'un événement (ensemble de faces) sur un dé de poids
 * donnés : somme des probabilités de ses issues. Exacte.
 */
export function eventProbability(faces, weights = fairWeights()) {
  // Somme des poids favorables ÷ somme des poids : UNE division, pour que
  // P(toutes les faces) vaille exactement 1 et P(pair) exactement 1/2.
  const total = weights.reduce((a, b) => a + b, 0);
  const fav = [...new Set(faces)].reduce((s, f) => s + (weights[f - 1] ?? 0), 0);
  return fav / total;
}

/** La fréquence observée d'un événement dans une série : effectifs cumulés ÷ total. */
export function eventFrequency(counts, faces) {
  const t = totalOf(counts);
  if (t === 0) return 0;
  return [...faces].reduce((s, f) => s + (counts[f - 1] ?? 0), 0) / t;
}

/** L'effectif cumulé d'un événement dans une série. */
export const eventCount = (counts, faces) => [...faces].reduce((s, f) => s + (counts[f - 1] ?? 0), 0);

/** Deux ensembles de faces sont-ils égaux ? */
export function sameSet(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  return A.size === B.size && [...A].every((x) => B.has(x));
}

/** Les faces de l'événement contraire. */
export const complementFaces = (faces) => FACES.filter((f) => !new Set(faces).has(f));

/* ── Le sac de billes (et la roue : même modèle, des couleurs pondérées) ── */

export const COLOURS = ['rouge', 'bleu', 'vert'];

/** Nombre total de billes. */
export const bagTotal = (bag) => COLOURS.reduce((s, c) => s + (bag[c] ?? 0), 0);

/** P(couleur) = nb de billes de la couleur ÷ total ; null si le sac est vide. */
export function bagProbability(bag, colour) {
  const t = bagTotal(bag);
  if (t === 0) return null;
  return (bag[colour] ?? 0) / t;
}

/** Le sac multiplié par k (chaque couleur) — la part de chacune ne change pas. */
export const scaleBag = (bag, k) => Object.fromEntries(COLOURS.map((c) => [c, (bag[c] ?? 0) * k]));

/** n tirages AVEC remise dans le sac ; renvoie les effectifs par couleur. */
export function drawMany(bag, n, rng) {
  const weights = COLOURS.map((c) => bag[c] ?? 0);
  const counts = { rouge: 0, bleu: 0, vert: 0 };
  if (weights.every((w) => w === 0)) return { counts, last: null };
  let last = null;
  for (let i = 0; i < n; i += 1) {
    last = COLOURS[drawIndex(rng, weights)];
    counts[last] += 1;
  }
  return { counts, last };
}

/** L'effectif attendu d'une couleur sur n tirages : P × n (exact, non arrondi). */
export function expectedCount(p, n) {
  return p * n;
}

/* ── Deux dés : la somme ───────────────────────────────────────────── */

/** Les cases (a, b) de la grille 6 × 6 dont la somme vaut s. */
export function sumCells(s) {
  const out = [];
  for (const a of FACES) for (const b of FACES) if (a + b === s) out.push([a, b]);
  return out;
}

/** Les 11 probabilités des sommes 2…12 : k/36, exactes. Somme 1. */
export const sumProbabilities = () => SUMS.map((s) => sumCells(s).length / 36);

/** n lancers de DEUX dés ajoutés aux 11 effectifs des sommes. */
export function rollTwoMany(counts, n, rng) {
  const next = [...counts];
  let last = null;
  for (let i = 0; i < n; i += 1) {
    const a = rollOnce(rng);
    const b = rollOnce(rng);
    last = [a, b];
    next[a + b - 2] += 1;
  }
  return { counts: next, last };
}

/** Le nombre de cases d'un ensemble de cases « a-b » satisfaisant un prédicat. */
export function cellsWhere(pred) {
  const out = [];
  for (const a of FACES) for (const b of FACES) if (pred(a, b)) out.push([a, b]);
  return out;
}

export const cellKey = (a, b) => `${a}-${b}`;

/* ── Géométrie des barres (générique : 6 faces ou 11 sommes) ───────── */

export const CHART = Object.freeze({
  W: 600, H: 238,
  TOP: 30,          // au-dessus : la zone réservée aux étiquettes d'effectif
  BASE: 196,        // la ligne de base des barres
  LABEL_GAP: 6,     // entre le sommet d'une barre et son étiquette
  FACE_Y: 206,      // le haut de l'icône sous la ligne de base
  FACE_SIZE: 24,
});

const GLYPH = { ' ': 3, ' ': 3, ',': 3 };
/** Largeur estimée d'une étiquette, caractère par caractère. */
export const textWidth = (s, size = 12) =>
  [...String(s)].reduce((n, c) => n + (GLYPH[c] ?? size * 0.6), 0);

/**
 * L'échelle verticale : le plus grand des effectifs, du repère théorique le
 * plus haut, et d'une fraction du total — ce plancher garde les barres
 * d'issues équiprobables à mi-hauteur au lieu de coller la tête au plafond.
 */
export function scaleMax(counts, theory = null) {
  const t = totalOf(counts);
  const maxCount = Math.max(0, ...counts);
  const theoryMax = theory ? Math.max(0, ...theory.map((p) => p * t)) : 0;
  const floor = Math.ceil(t / (counts.length / 2));
  return Math.max(1, maxCount, Math.ceil(theoryMax), floor);
}

/**
 * La géométrie des barres. Invariants (testés) : y ≥ TOP, h ≥ 0, le repère
 * théorique est dans le cadre, l'étiquette tient dans sa colonne.
 */
export function barsGeometry(counts, theory = null, g = CHART) {
  const n = counts.length;
  const col = g.W / n;
  const barW = Math.min(56, col * 0.6);
  const t = totalOf(counts);
  const sm = scaleMax(counts, theory);
  const plotH = g.BASE - g.TOP;
  const bars = counts.map((c, i) => {
    const h = (c / sm) * plotH;
    const cx = col * i + col / 2;
    const y = g.BASE - h;
    const tick = theory && t > 0 ? g.BASE - ((theory[i] * t) / sm) * plotH : null;
    return {
      index: i, cx, x: cx - barW / 2, y, h, barW, col,
      label: formatDec(c), labelY: y - g.LABEL_GAP, tick,
    };
  });
  return { bars, scaleMax: sm, total: t, plotH, col, barW };
}
