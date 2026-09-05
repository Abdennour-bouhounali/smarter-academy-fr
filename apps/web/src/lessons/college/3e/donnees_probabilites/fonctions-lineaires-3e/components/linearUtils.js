/**
 * linearUtils — la mathématique des fonctions linéaires, sans aucun pixel.
 *
 * UNE FONCTION LINÉAIRE est ici réduite à son seul paramètre : le coefficient
 * `a`, avec f(x) = ax. Il n'y a pas d'objet « règle » à deux champs, parce que
 * b n'existe pas — et c'est précisément ce que la leçon doit faire sentir.
 *
 * LE LIEN AVEC LA PROPORTIONNALITÉ EST LE CŒUR DE LA LEÇON, pas une remarque :
 * `coefficientFromPair` est exactement le calcul du coefficient de
 * proportionnalité (y ÷ x), et `isProportionalTable` teste ce que l'élève
 * testait déjà en 6e. Une fonction linéaire n'est pas une notion neuve : c'est
 * un nom pour une situation de proportionnalité.
 *
 * PIÈGE ENCODÉ : `coefficientFromPair(0, 0)` renvoie null. Le couple (0 ; 0)
 * appartient à TOUTES les fonctions linéaires et ne permet donc d'en
 * déterminer aucune — c'est l'erreur classique « je prends l'origine ».
 */

import { roundTo, formatDec, texDec } from '@smarter-academy/core';

/** f(x) = ax. */
export function image(a, x) {
  if (!Number.isFinite(a) || !Number.isFinite(x)) return null;
  return roundTo(a * x, 6);
}

/**
 * L'antécédent de y : l'unique x tel que ax = y.
 * null quand a = 0 et y ≠ 0 (aucun), Infinity quand a = 0 et y = 0 (tous).
 */
export function antecedent(a, y) {
  if (!Number.isFinite(a) || !Number.isFinite(y)) return null;
  if (roundTo(a, 9) === 0) return roundTo(y, 9) === 0 ? Infinity : null;
  return roundTo(y / a, 6);
}

/**
 * Le coefficient déduit d'un couple (x ; y) — c'est le coefficient de
 * proportionnalité, y ÷ x.
 * null si x = 0 : le point (0 ; 0) est sur toutes les droites linéaires et
 * n'en détermine aucune.
 */
export function coefficientFromPair(x, y) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  if (roundTo(x, 9) === 0) return null;
  return roundTo(y / x, 6);
}

/** Tableau de valeurs : [{x, y}]. */
export function tableOf(a, xs) {
  return xs.map((x) => ({ x: roundTo(x, 6), y: image(a, x) }));
}

/**
 * Les rapports y/x d'un tableau — le geste de la 6e, réutilisé tel quel.
 * Les colonnes en x = 0 sont ignorées (division impossible).
 */
export function ratios(rows) {
  return rows
    .filter((r) => Number.isFinite(r.x) && roundTo(r.x, 9) !== 0 && Number.isFinite(r.y))
    .map((r) => roundTo(r.y / r.x, 6));
}

/**
 * Le tableau est-il proportionnel ? Tous les rapports doivent coïncider.
 * Un tableau qui contient (0 ; k) avec k ≠ 0 ne l'est pas : une situation
 * proportionnelle donne toujours 0 pour 0.
 */
export function isProportionalTable(rows) {
  const zeroRow = rows.find((r) => roundTo(r.x, 9) === 0);
  if (zeroRow && roundTo(zeroRow.y, 9) !== 0) return false;
  const rs = ratios(rows);
  if (rs.length === 0) return false;
  return rs.every((r) => Math.abs(r - rs[0]) < 1e-6);
}

/** Le coefficient d'un tableau proportionnel, sinon null. */
export function coefficientFromTable(rows) {
  if (!isProportionalTable(rows)) return null;
  const rs = ratios(rows);
  return rs.length ? rs[0] : null;
}

/**
 * Doubler x double-t-il f(x) ? Vrai pour toute fonction linéaire, et c'est le
 * test que l'élève peut faire de tête.
 */
export function doublingHolds(a, x) {
  return roundTo(image(a, 2 * x) ?? NaN, 6) === roundTo(2 * (image(a, x) ?? NaN), 6);
}

/** La droite passe-t-elle par l'origine ? Toujours vrai — mais on le VÉRIFIE. */
export function passesThroughOrigin(a) {
  return roundTo(image(a, 0) ?? NaN, 9) === 0;
}

/**
 * Le pourcentage d'évolution correspondant au coefficient.
 *   1,2 → +20 %   ·   0,75 → −25 %   ·   1 → 0 %
 * Utilisé au labo : « augmenter de 20 % » EST une fonction linéaire.
 */
export function percentChange(a) {
  return roundTo((a - 1) * 100, 6);
}

/** Le coefficient correspondant à une évolution en pourcentage. */
export function coefficientFromPercent(p) {
  return roundTo(1 + p / 100, 6);
}

/** Écriture LaTeX de f(x) = ax, simplifiée (1x → x, −1x → −x, 0x → 0). */
export function formatLinear(a, opts = {}) {
  const { variable = 'x', name = 'f', withName = true } = opts;
  const ra = roundTo(a, 6);
  const head = withName ? `${name}(${variable}) = ` : '';
  if (ra === 0) return `${head}0`;
  if (ra === 1) return `${head}${variable}`;
  if (ra === -1) return `${head}−${variable}`;
  return `${head}${texDec(ra)}${variable}`;
}

/** « le prix est 2,50 € par kilo », pour une correction ou un aria-label. */
export function describeCoefficient(a, { per = 'unité', unit = '' } = {}) {
  return `${formatDec(a)}${unit} par ${per}`;
}

/**
 * Le prix AVEC une part fixe : ax + fixed. C'est le contre-exemple du module 1
 * (la barquette à 1 €) : dès que `fixed` ≠ 0, l'image de 0 n'est plus 0 et le
 * tableau cesse d'être proportionnel — `isProportionalTable` le détecte.
 */
export function priceWithFixed(a, x, fixed = 0) {
  if (![a, x, fixed].every(Number.isFinite)) return null;
  return roundTo(a * x + fixed, 6);
}
