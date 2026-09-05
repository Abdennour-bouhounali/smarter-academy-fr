import { formatDec, parseDec, roundTo } from '@smarter-academy/core';

/**
 * logicUtils — le modèle mathématique de la leçon « Logique et raisonnement »
 * (2nde). Une PROPRIÉTÉ est un objet { id, text, test: (n) => boolean } ;
 * un connecteur en construit une autre ; une implication se teste sur un
 * domaine fini en cherchant le cas interdit (P vraie, Q fausse). Tout ce qui
 * est affiché (voyants, tableau des cas, contre-exemples, flèches) DÉRIVE de
 * ces fonctions pures — la vérité n'est jamais écrite à la main.
 */
export { formatDec, parseDec, roundTo };

export function isPrime(n) {
  if (!Number.isInteger(n) || n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) if (n % d === 0) return false;
  return true;
}
/** Une factorisation « a × b » non triviale (la plus petite), ou null si premier. */
export function smallestFactorization(n) {
  if (!Number.isInteger(n) || n < 4) return null;
  for (let d = 2; d * d <= n; d += 1) if (n % d === 0) return { a: d, b: n / d };
  return null;
}
/** Le polynôme d'Euler : premier pour n = 0…39, composé pour n = 40 (41²) et 41. */
export const euler = (n) => n * n + n + 41;

/* ── Propriétés et connecteurs ─────────────────────────────────────────── */
export const prop = (id, text, test) => ({ id, text, test });
export const and = (P, Q) => prop(`${P.id}&${Q.id}`, `(${P.text}) ET (${Q.text})`, (n) => P.test(n) && Q.test(n));
export const or = (P, Q) => prop(`${P.id}|${Q.id}`, `(${P.text}) OU (${Q.text})`, (n) => P.test(n) || Q.test(n));
export const not = (P) => prop(`!${P.id}`, `NON (${P.text})`, (n) => !P.test(n));

/** Le cas d'un n pour l'implication P ⇒ Q : 'TT' | 'TF' | 'FT' | 'FF' (P puis Q). */
export const caseOf = (P, Q, n) => `${P.test(n) ? 'T' : 'F'}${Q.test(n) ? 'T' : 'F'}`;
/** P ⇒ Q sur un domaine : le premier contre-exemple (P vraie, Q fausse), ou null si l'implication tient. */
export function counterexample(P, Q, domain) {
  for (const n of domain) if (P.test(n) && !Q.test(n)) return n;
  return null;
}
export const implies = (P, Q, domain) => counterexample(P, Q, domain) === null;
/** Les deux sens : { forward: ce | null, backward: ce | null, equivalent }. */
export function equivalence(P, Q, domain) {
  const forward = counterexample(P, Q, domain);
  const backward = counterexample(Q, P, domain);
  return { forward, backward, equivalent: forward === null && backward === null };
}
/** Une affirmation universelle « pour tout n du domaine, P(n) » : le premier contre-exemple ou null. */
export function universalCounterexample(P, domain) {
  for (const n of domain) if (!P.test(n)) return n;
  return null;
}
export const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

/* ── Principe des tiroirs ──────────────────────────────────────────────── */
/**
 * Place `count` élèves dans `boxes` mois en évitant les partages tant que
 * c'est possible : renvoie la répartition et le premier partage forcé.
 */
export function pigeonhole(count, boxes = 12) {
  const fill = Array(boxes).fill(0);
  let firstShare = null;
  for (let i = 0; i < count; i += 1) {
    const idx = i % boxes;
    fill[idx] += 1;
    if (fill[idx] === 2 && firstShare === null) firstShare = i + 1;
  }
  return { fill, firstShare, forced: count > boxes };
}
/** n(n + 1) est toujours pair : l'un des deux facteurs est pair. */
export const consecutiveProduct = (n) => ({ product: n * (n + 1), even: (n * (n + 1)) % 2 === 0, evenFactor: n % 2 === 0 ? n : n + 1 });
