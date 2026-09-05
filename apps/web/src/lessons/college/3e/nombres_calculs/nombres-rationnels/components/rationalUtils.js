import { formatDec, parseDec, roundTo, texDec } from '@smarter-academy/core';

export { formatDec, parseDec, roundTo };

/**
 * rationalUtils — la logique pure de la leçon « Nombres rationnels ».
 *
 * MODÈLE (une seule source de vérité, playbook §4) : un rationnel est
 * l'objet `{ num, den }` avec l'INVARIANT `den > 0` — le signe est
 * toujours porté par le numérateur. C'est cet invariant qui fait de
 * −3/4, 3/(−4) et −(3/4) UN SEUL objet, donc UN SEUL point sur la droite
 * graduée : `normalize` les ramène tous les trois à `{ num: −3, den: 4 }`.
 *
 * Toutes les valeurs affichées par les modules (barre, marqueur, décimal,
 * dénominateur commun) sont DÉRIVÉES de ces objets — jamais recopiées.
 */

/** PGCD (Euclide), toujours positif. gcd(0, n) = |n|. */
export function gcd(a, b) {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

/** PPCM de deux entiers non nuls, toujours positif. */
export function lcm(a, b) {
  const g = gcd(a, b);
  if (g === 0) return 0;
  return Math.abs((a / g) * b);
}

/**
 * Ramène un couple à la forme canonique : dénominateur STRICTEMENT positif,
 * signe porté par le numérateur. Ne simplifie pas (voir `simplify`).
 * @throws {Error} si le dénominateur est nul — un rationnel n'existe pas.
 */
export function normalize(num, den) {
  const n = typeof num === 'object' && num !== null ? num.num : num;
  const d = typeof num === 'object' && num !== null ? num.den : den;
  if (d === 0) throw new Error('Dénominateur nul : ce quotient ne définit aucun nombre.');
  return d < 0 ? { num: -n, den: -d } : { num: n, den: d };
}

/** Raccourci de construction. */
export const rat = (num, den = 1) => normalize(num, den);

/** Forme irréductible : on divise num et den par leur PGCD. 0 → 0/1. */
export function simplify(r) {
  const { num, den } = normalize(r);
  if (num === 0) return { num: 0, den: 1 };
  const g = gcd(num, den);
  return { num: num / g, den: den / g };
}

/** Vrai si la fraction ne peut plus être réduite (PGCD = 1). */
export function isIrreducible(r) {
  const { num, den } = normalize(r);
  return gcd(num, den) === 1;
}

/** Deux écritures désignent-elles le même nombre ? (produit en croix) */
export function equivalent(a, b) {
  const x = normalize(a);
  const y = normalize(b);
  return x.num * y.den === y.num * x.den;
}

/** −1 si a < b, 0 si égaux, +1 si a > b. Dénominateurs > 0 → pas d'inversion. */
export function compare(a, b) {
  const x = normalize(a);
  const y = normalize(b);
  const left = x.num * y.den;
  const right = y.num * x.den;
  return left < right ? -1 : left > right ? 1 : 0;
}

export const add = (a, b) => {
  const x = normalize(a);
  const y = normalize(b);
  return simplify({ num: x.num * y.den + y.num * x.den, den: x.den * y.den });
};

export const sub = (a, b) => {
  const y = normalize(b);
  return add(a, { num: -y.num, den: y.den });
};

export const mul = (a, b) => {
  const x = normalize(a);
  const y = normalize(b);
  return simplify({ num: x.num * y.num, den: x.den * y.den });
};

/**
 * Division : multiplier par l'inverse. Diviser par 0 n'a pas de sens.
 * @throws {Error} si `b` est nul.
 */
export function div(a, b) {
  const y = normalize(b);
  if (y.num === 0) throw new Error('Division par zéro : aucun nombre ne convient.');
  return mul(a, { num: y.den, den: y.num });
}

/** L'inverse d'un rationnel non nul (le « retourné »). */
export function inverse(r) {
  const x = normalize(r);
  if (x.num === 0) throw new Error('Zéro n’a pas d’inverse.');
  return normalize(x.den, x.num);
}

/** L'opposé (même distance à 0, de l'autre côté). */
export const opposite = (r) => {
  const x = normalize(r);
  return { num: -x.num, den: x.den };
};

/** Valeur décimale, arrondie au plus près (6 décimales par défaut). */
export const toDecimal = (r, dp = 6) => {
  const x = normalize(r);
  return roundTo(x.num / x.den, dp);
};

/** Vrai si le rationnel a une écriture décimale finie (den = 2^a × 5^b). */
export function isDecimal(r) {
  let { den } = simplify(r);
  while (den % 2 === 0) den /= 2;
  while (den % 5 === 0) den /= 5;
  return den === 1;
}

/**
 * Ré-écrit `r` avec le dénominateur `d` demandé.
 * @returns {{num, den, factor}|null} null si `d` n'est pas un multiple du
 *   dénominateur (on ne peut pas re-découper la barre en `d` parts).
 */
export function expandTo(r, d) {
  const x = normalize(r);
  if (d <= 0 || d % x.den !== 0) return null;
  const factor = d / x.den;
  return { num: x.num * factor, den: d, factor };
}

/** Les diviseurs communs (> 1) de num et den — les « puces » du simplificateur. */
export function commonDivisors(r) {
  const { num, den } = normalize(r);
  const g = gcd(num, den);
  const out = [];
  for (let d = 2; d <= g; d += 1) if (g % d === 0) out.push(d);
  return out;
}

/** Le plus petit dénominateur commun à deux rationnels (PPCM des dénominateurs). */
export const commonDenominator = (a, b) => lcm(normalize(a).den, normalize(b).den);

/** Écriture LaTeX d'un rationnel : signe SORTI de la fraction. */
export function formatFrac(r) {
  const { num, den } = normalize(r);
  if (den === 1) return `${num < 0 ? '-' : ''}${Math.abs(num)}`;
  const sign = num < 0 ? '-' : '';
  return `${sign}\\frac{${Math.abs(num)}}{${den}}`;
}

/** Écriture LaTeX brute, telle qu'écrite (sert à montrer 3/(−4) AVANT normalisation). */
export function formatRaw(num, den) {
  const d = den < 0 ? `(${den})` : `${den}`;
  return `\\frac{${num}}{${d}}`;
}

/** Écriture texte plate d'un rationnel : « −3/4 » (labels, aria, e2e). */
export function plainFrac(r) {
  const { num, den } = normalize(r);
  return den === 1 ? `${num}` : `${num}/${den}`;
}

/** Écriture LaTeX de la valeur décimale (virgule française). */
export const texDecimal = (r, dp = 3) => texDec(toDecimal(r, dp));
