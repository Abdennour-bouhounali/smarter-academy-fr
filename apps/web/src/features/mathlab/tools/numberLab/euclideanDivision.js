/**
 * القسمة الإقليدية — a = b × q + r, 0 ≤ r < b. Logique pure, sans React.
 *
 * Le calcul lui-même est une ligne (`divmod` du core, celui des leçons) ; ce
 * module porte ce que le laboratoire DESSINE, et la règle qui le rend
 * honnête : **le dessin compte exactement a unités**. Les q paquets de b et
 * les r unités du reste sont des intervalles contigus de [0, a] — aucun
 * arrondi de pixels ne peut ajouter ou perdre une unité, et le test le vérifie.
 *
 *   a ≤ BLOCK_LIMIT   → des CUBES : a cases, groupées par b, le reste en orange
 *   a >  BLOCK_LIMIT  → des BARRES : un ruban de longueur a, coupé tous les b
 *   q >  SEGMENT_LIMIT → le ruban ne peut plus montrer chaque paquet : on
 *                       dessine le bloc `q × b` d'un seul tenant, et on le DIT
 */

import { divmod } from '@smarter-academy/core/arithmetic/divisibility.js';

const BLOCK_LIMIT = 120;
const SEGMENT_LIMIT = 200;
export const DIVISION_MAX = 10_000_000;

/**
 * Lire le dividende ou le diviseur tapé.
 *
 * @param {'dividend'|'divisor'} role
 * @returns {{ value: number } | { error: string }}
 *   erreurs : `empty`, `notNumber`, `notInteger`, `negative`, `zeroDivisor`, `tooLarge`
 */
export function readDivisionOperand(raw, role) {
  const text = String(raw ?? '').trim()
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[\s  ]/g, '');
  if (!text) return { error: 'empty' };
  if (!/^[-−+]?\d+([.,]\d+)?$/.test(text)) return { error: 'notNumber' };
  const value = Number(text.replace('−', '-').replace(',', '.'));
  if (!Number.isFinite(value)) return { error: 'notNumber' };
  if (!Number.isInteger(value)) return { error: 'notInteger' };
  if (value < 0) return { error: 'negative' };
  if (role === 'divisor' && value === 0) return { error: 'zeroDivisor' };
  if (value > DIVISION_MAX) return { error: 'tooLarge' };

  return { value };
}

/**
 * La division euclidienne, et ce qui la CARACTÉRISE : l'égalité ET la
 * condition `r < b`. Sans la condition, 47 = 6 × 6 + 11 serait aussi « juste ».
 *
 * @returns {null | { a, b, q, r, exact: boolean, check: { product: number, sum: number, holds: boolean, rLessThanB: boolean } }}
 */
export function euclideanDivision(a, b) {
  const result = divmod(a, b);
  if (!result) return null;
  const { q, r } = result;
  const product = b * q;

  return {
    a,
    b,
    q,
    r,
    exact: r === 0,
    check: { product, sum: product + r, holds: product + r === a, rLessThanB: r < b },
  };
}

/**
 * La DISPOSITION du dessin.
 *
 * @returns {null | {
 *   kind: 'blocks' | 'bars',
 *   total: number,                         // = a, toujours
 *   groups: Array<{ index: number, start: number, size: number }>,  // q paquets de b
 *   remainder: { start: number, size: number },                     // r unités
 *   compressed: boolean,                   // les paquets ne sont plus dessinés un par un
 * }}
 */
export function divisionLayout(a, b, { blockLimit = BLOCK_LIMIT, segmentLimit = SEGMENT_LIMIT } = {}) {
  const division = euclideanDivision(a, b);
  if (!division) return null;
  const { q, r } = division;
  const kind = a <= blockLimit ? 'blocks' : 'bars';
  const compressed = kind === 'bars' && q > segmentLimit;
  const groups = compressed
    ? [{ index: 0, start: 0, size: q * b, count: q }]
    : Array.from({ length: q }, (_, index) => ({ index, start: index * b, size: b, count: 1 }));

  return {
    kind,
    total: a,
    groups,
    remainder: { start: q * b, size: r },
    compressed,
  };
}

/** Combien d'unités le dessin représente — doit valoir a (test d'honnêteté). */
export function layoutUnitCount(layout) {
  if (!layout) return 0;

  return layout.groups.reduce((sum, group) => sum + group.size, 0) + layout.remainder.size;
}

/**
 * Les deux LECTURES de la même écriture (§39) :
 *   - partage     : b parts égales — combien dans chacune ? (q, et il reste r)
 *   - groupement  : des paquets de b — combien de paquets ? (q, et il reste r)
 * Rendues comme données : le composant les met en phrase.
 */
export function divisionReadings(division) {
  if (!division) return null;

  return {
    sharing: { parts: division.b, each: division.q, left: division.r },
    grouping: { size: division.b, packs: division.q, left: division.r },
  };
}

export const DIVISION_EXAMPLES = Object.freeze([
  { id: 'q-17-5', level: 'beginner', a: 17, b: 5 },
  { id: 'q-24-6', level: 'beginner', a: 24, b: 6 },
  { id: 'q-38-7', level: 'beginner', a: 38, b: 7 },
  { id: 'q-100-12', level: 'intermediate', a: 100, b: 12 },
  { id: 'q-5-8', level: 'intermediate', a: 5, b: 8 },
  { id: 'q-0-4', level: 'intermediate', a: 0, b: 4 },
  { id: 'q-1938-836', level: 'advanced', a: 1938, b: 836 },
  { id: 'q-2026-17', level: 'advanced', a: 2026, b: 17 },
  { id: 'q-10000-3', level: 'advanced', a: 10000, b: 3 },
]);

/** Un exemple aléatoire : a entre 10 et 99, b entre 2 et 12, un reste NON nul le plus souvent. */
export function randomDivision(random = Math.random) {
  const b = 2 + Math.floor(random() * 11);
  const a = 10 + Math.floor(random() * 90);

  return { a, b };
}
