import { formatDec, parseDec, roundTo } from '@smarter-academy/core';

/**
 * absUtils — le modèle mathématique de la leçon « Valeur absolue et
 * distance » (2nde). Tout ce qui est affiché (barres de distance, verdicts
 * du faisceau, solutions, intervalles) DÉRIVE de ces fonctions pures.
 *
 * Convention : la distance entre a et b est |b − a| = |a − b| ; la valeur
 * absolue est la distance à 0.
 */
export { formatDec, parseDec, roundTo };

export const abs = (x) => (x < 0 ? -x : x);

/** |b − a| — l'ordre n'a pas d'importance. */
export const distance = (a, b) => roundTo(abs(b - a));

/** Le texte du calcul : « |−3| = 3 » ou « |−3| = −(−3) = 3 ». */
export function absText(x, withRule = false) {
  const f = formatDec;
  if (!withRule) return `|${f(x)}| = ${f(abs(x))}`;
  if (x < 0) return `|${f(x)}| = −(${f(x)}) = ${f(abs(x))}`;
  return `|${f(x)}| = ${f(x)}`;
}

/** Les solutions de |x − a| = r : deux, une (r = 0) ou aucune (r < 0). */
export function solveAbsEquation(a, r) {
  if (r < 0) return [];
  if (r === 0) return [a];
  return [roundTo(a - r), roundTo(a + r)];
}

/**
 * L'ensemble des x tels que |x − a| ≤ r (ou < r si strict) : un intervalle
 * { from, to, openFrom, openTo }, ou null si r < 0, ou un singleton si r = 0
 * (non strict) — {from: a, to: a}.
 */
export function absInequalitySet(a, r, strict = false) {
  if (r < 0 || (r === 0 && strict)) return null;
  return { from: roundTo(a - r), to: roundTo(a + r), openFrom: strict, openTo: strict };
}

/** Le centre et le rayon d'un intervalle borné [from ; to]. */
export function centerRadius(from, to) {
  return { a: roundTo((from + to) / 2), r: roundTo((to - from) / 2) };
}

/** « [1 ; 5] », « ]1 ; 5[ », « ∅ », « {3} ». */
export function notation(I) {
  if (!I) return '∅';
  if (I.from === I.to) return I.openFrom ? '∅' : `{${formatDec(I.from)}}`;
  return `${I.openFrom ? ']' : '['}${formatDec(I.from)} ; ${formatDec(I.to)}${I.openTo ? '[' : ']'}`;
}

/** x vérifie-t-il |x − a| ≤ r (ou < r) ? */
export function satisfies(x, a, r, strict = false) {
  const d = distance(x, a);
  return strict ? d < r : d <= r;
}
