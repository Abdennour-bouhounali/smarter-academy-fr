import { makeRng } from '@smarter-academy/core';

/**
 * cardUtils — la mathématique du « duel des cartes-chiffres » (Module 1) et du
 * « chiffre qui se déplace » (Module 4), sans aucun pixel.
 *
 * UNE SEULE VÉRITÉ : un arrangement est un tableau de cases `slots`, de la
 * position la plus grande (gauche) à la plus petite (droite) ; une case vaut
 * un chiffre (0–9) ou `null` quand elle est vide. Le nombre, le matériel
 * base 10, la longueur de la barre et le meilleur / pire arrangement en sont
 * DÉRIVÉS à chaque rendu — rien n'est stocké deux fois.
 *
 * INVARIANT QUE L'ÉLÈVE DOIT REMARQUER : la carte de gauche pèse le plus.
 * Avec une carte de plus, le plus petit nombre possible (12 345) dépasse le
 * plus grand nombre possible avec une carte de moins (9 321) — c'est
 * `minValue(5 cartes) > maxValue(4 cartes)` dès que les cartes ne sont pas 0,
 * et le test le balaie sur toutes les mains.
 */

/** Valeur d'une case selon son rang depuis la droite : 1, 10, 100, 1 000… */
export function placeOf(index, size) {
  return 10 ** (size - 1 - index);
}

/** Le nombre formé par les cases (une case vide compte 0 — la barre grandit à mesure qu'on pose). */
export function valueOf(slots) {
  return slots.reduce((acc, d) => acc * 10 + (d ?? 0), 0);
}

/** Toutes les cases sont-elles remplies ? */
export function isComplete(slots) {
  return slots.every((d) => d !== null && d !== undefined);
}

/** Le plus grand nombre que ces cartes peuvent écrire (cartes triées de la plus forte à la plus faible). */
export function bestArrangement(cards) {
  return [...cards].sort((a, b) => b - a);
}

/**
 * Le plus petit nombre que ces cartes peuvent écrire. Un 0 ne peut pas
 * ouvrir le nombre (« 0 239 » s'écrit 239) : le plus petit chiffre non nul
 * passe devant, les zéros suivent.
 */
export function worstArrangement(cards) {
  const asc = [...cards].sort((a, b) => a - b);
  const firstNonZero = asc.findIndex((d) => d !== 0);
  if (firstNonZero > 0) {
    const [lead] = asc.splice(firstNonZero, 1);
    asc.unshift(lead);
  }
  return asc;
}

export const maxValue = (cards) => valueOf(bestArrangement(cards));
export const minValue = (cards) => valueOf(worstArrangement(cards));

/**
 * Le matériel base 10 d'un arrangement de 4 cases au plus : `Base10Blocks`
 * ne connaît que milliers / centaines / dizaines / unités, et une carte vaut
 * au plus 9 — chaque sorte de bloc reste donc ≤ 9, le rendu ne déborde pas.
 */
export function blockCounts(slots) {
  const keys = ['UM', 'C', 'D', 'U'];
  const counts = { UM: 0, C: 0, D: 0, U: 0 };
  const offset = keys.length - slots.length;
  slots.forEach((d, i) => {
    const key = keys[offset + i];
    if (key && d) counts[key] = d;
  });
  return counts;
}

/** Longueur de barre en %, bornée : `scale` contient toujours la plus grande valeur (§17bis). */
export function barPct(value, scale) {
  if (!Number.isFinite(value) || !Number.isFinite(scale) || scale <= 0) return 0;
  return Math.max(0, Math.min(100, (value / scale) * 100));
}

/** L'échelle commune d'un duel : la plus grande des deux valeurs (jamais 0). */
export function duelScale(a, b) {
  return Math.max(a, b, 1);
}

/** Échange les cases i et j (copie — l'entrée n'est jamais modifiée). */
export function swap(slots, i, j) {
  const out = [...slots];
  [out[i], out[j]] = [out[j], out[i]];
  return out;
}

/** Pose le chiffre `digit` dans la première case vide ; renvoie l'entrée telle quelle s'il n'y en a pas. */
export function placeNext(slots, digit) {
  const i = slots.findIndex((d) => d === null || d === undefined);
  if (i === -1) return slots;
  const out = [...slots];
  out[i] = digit;
  return out;
}

/**
 * Les cartes encore en main : la main moins les cartes posées (une carte à
 * la fois — deux cartes de même chiffre sont deux cartes différentes).
 */
export function remainingCards(cards, slots) {
  const pool = [...cards];
  slots.forEach((d) => {
    if (d === null || d === undefined) return;
    const k = pool.indexOf(d);
    if (k !== -1) pool.splice(k, 1);
  });
  return pool;
}

/** Une nouvelle main de `size` chiffres distincts de 1 à 9, tirée avec un rng injecté. */
export function newHand(rng, size = 4) {
  return rng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, size);
}

/**
 * La graine d'une session : un élève qui rejoue voit une autre main, un
 * test qui fixe `window.__SMARTER_RNG_SEED` revoit la même. Copié (non
 * importé) de probabilites-3e/probaUtils.js — une leçon n'importe jamais
 * dans une autre.
 */
export function sessionSeed(base) {
  if (typeof window !== 'undefined' && Number.isFinite(window.__SMARTER_RNG_SEED)) {
    return base + window.__SMARTER_RNG_SEED;
  }
  return (base + (Date.now() % 2147483647)) % 2147483647 || base;
}

export { makeRng };

/* ── Découpage en classes (Module 3) ─────────────────────────────────── */

/**
 * Les coupures canoniques d'une écriture de `len` chiffres : l'indice de
 * chaque chiffre qui ouvre une nouvelle classe, en comptant par 3 depuis la
 * DROITE. « 2350700 » (7 chiffres) → [1, 4] : 2 | 350 | 700.
 */
export function canonicalCuts(len) {
  const cuts = [];
  for (let i = 1; i < len; i += 1) if ((len - i) % 3 === 0) cuts.push(i);
  return cuts;
}

/** Les groupes que dessinent des coupures quelconques : readGroups('2350700', [2, 5]) → ['23', '507', '00']. */
export function readGroups(str, cuts) {
  const sorted = [...cuts].filter((c) => c > 0 && c < str.length).sort((a, b) => a - b);
  const out = [];
  let start = 0;
  sorted.forEach((c) => {
    out.push(str.slice(start, c));
    start = c;
  });
  out.push(str.slice(start));
  return out;
}

/** Le découpage est-il celui des classes ? */
export function cutsAreCanonical(len, cuts) {
  const want = canonicalCuts(len);
  const have = [...cuts].sort((a, b) => a - b);
  return want.length === have.length && want.every((c, i) => c === have[i]);
}
