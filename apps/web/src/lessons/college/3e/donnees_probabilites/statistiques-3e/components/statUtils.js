/**
 * statUtils — la mathématique des indicateurs, sans aucun pixel.
 *
 * UNE SÉRIE est une simple liste de nombres. Les effectifs en sont DÉRIVÉS
 * (`effectifs`), jamais saisis à part : une série et son tableau d'effectifs
 * sont deux vues du même objet, et rien ne peut les faire diverger.
 *
 * LA MOYENNE EST UN POINT D'ÉQUILIBRE. `balanceGap(xs, pivot)` mesure la somme
 * des écarts au pivot : elle s'annule exactement à la moyenne, et son signe dit
 * de quel côté pencher. C'est cette fonction qui pilote la manipulation — la
 * division somme ÷ effectif n'arrive qu'ensuite, comme moyen de calcul.
 *
 * L'INFLUENCE EST CALCULABLE, PAS SEULEMENT OBSERVABLE. `influenceOf` donne
 * l'effet exact d'un déplacement sur les trois indicateurs : déplacer une
 * valeur de Δ décale la moyenne de Δ/n — toujours — alors que la médiane peut
 * ne pas bouger du tout. C'est le cœur de la leçon, et c'est testé.
 *
 * MISE EN PAGE — `layoutFor` décide de la taille des pastilles et du besoin
 * d'un badge « ×N » quand trop de valeurs se superposent. La mathématique
 * d'affichage vit ici, testée, plutôt que dans le composant (§17bis).
 */

import { roundTo, formatDec } from '@smarter-academy/core';

/** Copie triée par ordre croissant — l'entrée n'est jamais modifiée. */
export function sortSeries(xs) {
  return [...xs].sort((a, b) => a - b);
}

/** L'effectif total. */
export const total = (xs) => xs.length;

/** Le tableau des effectifs : [{value, count}], trié par valeur. */
export function effectifs(xs) {
  const map = new Map();
  for (const x of xs) map.set(x, (map.get(x) ?? 0) + 1);
  return [...map.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value - b.value);
}

/** Les fréquences : [{value, freq}], de somme 1. */
export function frequencies(xs) {
  const n = xs.length;
  if (n === 0) return [];
  return effectifs(xs).map(({ value, count }) => ({ value, freq: count / n }));
}

/** La somme des valeurs. */
export const sum = (xs) => xs.reduce((a, b) => a + b, 0);

/** La moyenne — null pour une série vide. */
export function mean(xs) {
  if (xs.length === 0) return null;
  // PAS d'arrondi ici : la moyenne sert de pivot à `balanceGap`, qui doit
  // s'annuler EXACTEMENT. Arrondir au millionième suffisait à laisser un
  // résidu et à faire mentir la propriété d'équilibre. L'affichage arrondit,
  // la mathématique non.
  return sum(xs) / xs.length;
}

/** La moyenne d'un tableau d'effectifs : [{value, count}]. */
export function weightedMean(pairs) {
  const n = pairs.reduce((a, p) => a + p.count, 0);
  if (n === 0) return null;
  const s = pairs.reduce((a, p) => a + p.value * p.count, 0);
  return s / n;
}

/**
 * La médiane. Pour un effectif PAIR, c'est le milieu des deux valeurs
 * centrales — une valeur qui n'appartient pas forcément à la série.
 */
export function median(xs) {
  if (xs.length === 0) return null;
  const s = sortSeries(xs);
  const n = s.length;
  const mid = Math.floor(n / 2);
  return n % 2 === 1 ? roundTo(s[mid], 6) : roundTo((s[mid - 1] + s[mid]) / 2, 6);
}

/** L'étendue : l'écart entre les extrêmes, toujours positive ou nulle. */
export function range(xs) {
  if (xs.length === 0) return null;
  return roundTo(Math.max(...xs) - Math.min(...xs), 6);
}

/**
 * La somme des écarts au pivot. Nulle EXACTEMENT à la moyenne ; positive si
 * le pivot est trop à gauche, négative s'il est trop à droite.
 */
export function balanceGap(xs, pivot) {
  if (xs.length === 0) return null;
  const g = xs.reduce((a, x) => a + (x - pivot), 0);
  // Un résidu de l'ordre de 1e-13 vient de l'addition de flottants, pas d'un
  // déséquilibre réel : on le ramène à zéro pour que la propriété tienne.
  return Math.abs(g) < 1e-9 ? 0 : roundTo(g, 6);
}

/**
 * L'effet exact du remplacement de la i-ème valeur par v, sur les trois
 * indicateurs. dMean vaut toujours (v − ancienne) / n.
 */
export function influenceOf(xs, i, v) {
  if (i < 0 || i >= xs.length) return null;
  const next = [...xs];
  next[i] = v;
  const near = (v) => (Math.abs(v) < 1e-9 ? 0 : v);
  return {
    dMean: near((mean(next) ?? 0) - (mean(xs) ?? 0)),
    dMedian: near((median(next) ?? 0) - (median(xs) ?? 0)),
    dRange: near((range(next) ?? 0) - (range(xs) ?? 0)),
    after: next,
  };
}

/**
 * La valeur à AJOUTER à la série pour que la moyenne atteigne `target`.
 * (n + 1) · target − somme actuelle.
 */
export function missingForMean(xs, target) {
  return roundTo((xs.length + 1) * target - sum(xs), 6);
}

/** Ce qui rapproche et ce qui sépare deux séries. */
export function compareSeries(a, b) {
  return {
    sameMean: roundTo(mean(a) ?? NaN, 6) === roundTo(mean(b) ?? NaN, 6),
    sameMedian: roundTo(median(a) ?? NaN, 6) === roundTo(median(b) ?? NaN, 6),
    widerRange: (range(a) ?? 0) > (range(b) ?? 0) ? 'a' : (range(b) ?? 0) > (range(a) ?? 0) ? 'b' : 'egales',
  };
}

/**
 * La mise en page des pastilles : combien s'empilent sur chaque valeur, quel
 * rayon leur donner, et à partir de quand remplacer la pile par un badge.
 * Au-delà de `maxStack` pastilles, on en dessine `maxStack` et on annonce
 * « ×N » — jamais une colonne qui déborde du cadre.
 */
export function layoutFor(xs, { plotHeight = 96, maxStack = 6, maxRadius = 7 } = {}) {
  const stacks = effectifs(xs);
  const tallest = stacks.reduce((m, s) => Math.max(m, s.count), 0);
  const shown = Math.min(tallest, maxStack);
  const radius = tallest === 0
    ? maxRadius
    : Math.max(3, Math.min(maxRadius, (plotHeight - 8) / (2 * Math.max(1, shown))));
  return {
    stacks: stacks.map((s) => ({
      ...s,
      drawn: Math.min(s.count, maxStack),
      badge: s.count > maxStack ? s.count : null,
    })),
    radius: roundTo(radius, 2),
    tallest,
  };
}

/** « 12 min » — pour une correction ou un aria-label. */
export const fmt = (v, unit = '') => `${formatDec(v)}${unit}`;
