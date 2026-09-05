import { formatDec, parseDec, roundTo, texDec } from '@smarter-academy/core';

export { formatDec, parseDec, roundTo };

/**
 * powerUtils — la logique pure de la leçon « Puissances » (3e).
 *
 * MODÈLE (une seule source de vérité, playbook §4) :
 *  - une TOUR est `{ base, n }` : `n` blocs « ×base » empilés, donc base^n.
 *    `n` peut être nul (tour vide → 1) ou négatif (tour « en dessous du
 *    sol » → 1/base^|n|). Aucun module ne recopie une valeur à la main :
 *    tout affichage vient de `pow`, `expand` ou `formatPower`.
 *  - une écriture scientifique est `{ a, n }` avec 1 ≤ |a| < 10.
 *
 * Les trois règles de la leçon (produit, quotient, puissance de puissance)
 * ne sont PAS des formules recopiées : ce sont `mergeTowers`,
 * `splitTowers` et `repeatTower`, qui comptent des blocs.
 */

/* ───────────────────────── Puissances ───────────────────────── */

/**
 * base^n, exact pour les entiers, et fraction 1/base^|n| pour n < 0.
 * Renvoie un nombre (arrondi à 12 décimales pour tuer les artefacts).
 */
export function pow(base, n) {
  if (n === 0) return 1;
  if (n > 0) {
    let out = 1;
    for (let i = 0; i < n; i += 1) out *= base;
    return out;
  }
  let d = 1;
  for (let i = 0; i < -n; i += 1) d *= base;
  return roundTo(1 / d, 12);
}

/**
 * La liste des facteurs d'une puissance à exposant POSITIF :
 * expand(3, 4) → [3, 3, 3, 3]. Pour n ≤ 0, la liste est vide (il n'y a
 * rien à empiler — c'est justement ce qui donne a^0 = 1).
 */
export function expand(base, n) {
  return n > 0 ? Array.from({ length: n }, () => base) : [];
}

/** Une tour : `n` blocs « ×base ». */
export const tower = (base, n) => ({ base, n });

/** La valeur d'une tour. */
export const towerValue = (t) => pow(t.base, t.n);

/* ───────── Les trois règles, LUES sur le compte de blocs ───────── */

/**
 * Empiler deux tours de même base : a^m × a^n → a^(m+n).
 * Bases différentes → null (la règle ne s'applique pas, et le module doit
 * pouvoir le dire).
 */
export function mergeTowers(t1, t2) {
  if (t1.base !== t2.base) return null;
  return tower(t1.base, t1.n + t2.n);
}

/** Retirer une tour d'une autre : a^m ÷ a^n → a^(m−n). */
export function splitTowers(t1, t2) {
  if (t1.base !== t2.base) return null;
  return tower(t1.base, t1.n - t2.n);
}

/** Répéter une tour k fois : (a^m)^k → a^(m×k). */
export function repeatTower(t, k) {
  return tower(t.base, t.n * k);
}

/* ─────────────────── Puissances de 10 ─────────────────── */

/**
 * mantisse × 10^n, sans passer par la notation exponentielle de JS.
 * shiftDecimal(3.45, 4) → 34500 ; shiftDecimal(3.45, -3) → 0.00345.
 * Renvoie un NOMBRE ; le format français s'obtient avec `formatShift`.
 */
export function shiftDecimal(mantissa, n) {
  if (n === 0) return roundTo(mantissa, 12);
  // On travaille sur la chaîne pour éviter 3.45 * 1e-4 = 0.000345000000004.
  const neg = mantissa < 0;
  const s = Math.abs(mantissa).toString();
  const [ipRaw, dpRaw = ''] = s.split('.');
  const digits = ipRaw + dpRaw;
  // Position de la virgule dans `digits`, comptée depuis la gauche.
  let dot = ipRaw.length + n;
  let out;
  if (dot <= 0) {
    out = `0.${'0'.repeat(-dot)}${digits}`;
  } else if (dot >= digits.length) {
    out = digits + '0'.repeat(dot - digits.length);
  } else {
    out = `${digits.slice(0, dot)}.${digits.slice(dot)}`;
  }
  const val = Number(out);
  return roundTo(neg ? -val : val, 12);
}

/** Le résultat du décalage, en écriture française (3,45 × 10^4 → « 34 500 »). */
export function formatShift(mantissa, n) {
  return formatDec(shiftDecimal(mantissa, n), { maxDecimals: 12 });
}

/**
 * Le nombre de rangs dont la virgule glisse, et dans quel sens.
 * → { rangs: number, sens: 'droite' | 'gauche' | 'aucun' }
 */
export function commaMove(n) {
  if (n === 0) return { rangs: 0, sens: 'aucun' };
  return { rangs: Math.abs(n), sens: n > 0 ? 'droite' : 'gauche' };
}

/* ─────────────── Écriture scientifique ─────────────── */

/**
 * L'écriture scientifique d'un nombre non nul : x = a × 10^n avec
 * 1 ≤ |a| < 10. toScientific(34500) → { a: 3.45, n: 4 }.
 * toScientific(0) → { a: 0, n: 0 } (convention : 0 n'a pas d'écriture
 * scientifique, on renvoie une valeur neutre plutôt que de lancer).
 */
export function toScientific(x) {
  if (x === 0 || !Number.isFinite(x)) return { a: 0, n: 0 };
  const neg = x < 0;
  const abs = Math.abs(x);
  let n = Math.floor(Math.log10(abs));
  let a = roundTo(abs / 10 ** n, 10);
  // Les flottants peuvent faire sortir a de [1 ; 10[ : on recadre.
  if (a >= 10) { a = roundTo(a / 10, 10); n += 1; }
  if (a < 1) { a = roundTo(a * 10, 10); n -= 1; }
  return { a: roundTo(neg ? -a : a, 10), n };
}

/** L'opération inverse : { a, n } → le nombre. */
export function fromScientific({ a, n }) {
  return shiftDecimal(a, n);
}

/** Vrai si `a` est une mantisse valide : 1 ≤ |a| < 10. */
export const isValidMantissa = (a) => Math.abs(a) >= 1 && Math.abs(a) < 10;

/**
 * L'ordre de grandeur : l'exposant de 10 de l'écriture scientifique.
 * orderOfMagnitude(34500) → 4 ; orderOfMagnitude(0.00345) → −3.
 */
export function orderOfMagnitude(x) {
  return toScientific(x).n;
}

/**
 * Le rapport de deux nombres lu sur les ordres de grandeur :
 * magnitudeRatio(1e21, 1.27e7) → 14 (« environ 10^14 fois plus grand »).
 */
export function magnitudeRatio(big, small) {
  return orderOfMagnitude(big) - orderOfMagnitude(small);
}

/* ─────────────────────── Affichage LaTeX ─────────────────────── */

/** `formatPower(3, 4)` → `3^{4}` ; `formatPower(10, -2)` → `10^{-2}`. */
export function formatPower(base, n) {
  return `${base}^{${n}}`;
}

/** Le produit développé : `formatExpanded(3, 4)` → `3 \times 3 \times 3 \times 3`. */
export function formatExpanded(base, n) {
  const fs = expand(base, n);
  return fs.length ? fs.join(' \\times ') : '1';
}

/** Une écriture scientifique en LaTeX : `3{,}45\times10^{-3}`. */
export function formatScientific({ a, n }) {
  return `${texDec(a, { maxDecimals: 10 })}\\times10^{${n}}`;
}

/** Une puissance négative écrite en fraction : `10^{-3} = \frac{1}{10^{3}}`. */
export function formatAsFraction(base, n) {
  return `\\frac{1}{${base}^{${-n}}}`;
}
