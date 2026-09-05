import { formatDec, parseDec, roundTo } from '@smarter-academy/core';

/**
 * divisibilityUtils — le modèle mathématique de la leçon « Multiples et
 * diviseurs » (3e). Tout ce qui est affiché (rectangles, carte des
 * diviseurs, crible, arbres, PGCD/PPCM, fraction simplifiée, horaire de
 * bus) DÉRIVE de ces fonctions pures : aucun module ne recalcule à la main.
 *
 * État canonique par interaction : un entier n (1 ≤ n ≤ 999) et la commande
 * de l'élève (`rows`, un ensemble de cases, un arbre, une sélection de
 * facteurs). Le reste est dérivé.
 *
 * Conventions :
 *  - les paires de diviseurs sont toujours rangées `[a, b]` avec a ≤ b ;
 *  - une factorisation est `[{ p, e }]` triée par p croissant ;
 *  - `gcd`/`lcm` sont calculés À PARTIR des factorisations (pas Euclide)
 *    pour que le nombre affiché et les jetons de PrimeVenn coïncident.
 */
export { formatDec, parseDec, roundTo };

const assertInt = (n, name = 'n') => {
  if (!Number.isInteger(n)) throw new TypeError(`${name} doit être un entier (reçu ${n})`);
};

/* ── Rectangles ─────────────────────────────────────────────────────── */

/** n carreaux rangés sur `rows` rangées égales : perRow × rows + remainder = n. */
export function layoutRows(n, rows) {
  assertInt(n); assertInt(rows, 'rows');
  if (rows < 1) throw new RangeError('rows ≥ 1');
  const perRow = Math.floor(n / rows);
  const remainder = n - perRow * rows;
  return { perRow, remainder, isRectangle: remainder === 0 && perRow > 0 };
}

export const isDivisor = (d, n) => Number.isInteger(d) && Number.isInteger(n) && d > 0 && n % d === 0;
export const isMultiple = (m, n) => isDivisor(n, m);

/** Diviseurs de n, croissants. */
export function divisors(n) {
  assertInt(n);
  const out = [];
  for (let d = 1; d * d <= n; d += 1) {
    if (n % d === 0) {
      out.push(d);
      if (d !== n / d) out.push(n / d);
    }
  }
  return out.sort((a, b) => a - b);
}

/** Paires [a, b] avec a ≤ b et a × b = n, croissantes en a. */
export function divisorPairs(n) {
  assertInt(n);
  const out = [];
  for (let a = 1; a * a <= n; a += 1) if (n % a === 0) out.push([a, n / a]);
  return out;
}

/** Plus petit nombre de rangées r tel que r ≥ n / r : au-delà, les paires se répètent. */
export function mirrorThreshold(n) {
  assertInt(n);
  let r = 1;
  while (r * r < n) r += 1;
  return r;
}

/** Normalise une paire en [min, max] et dit si elle est déjà dans la liste. */
export const normalizePair = ([a, b]) => (a <= b ? [a, b] : [b, a]);
export const hasPair = (pairs, pair) => {
  const [a, b] = normalizePair(pair);
  return pairs.some(([x, y]) => x === a && y === b);
};

/** Diviseurs déduits d'une liste de paires tamponnées (carte d'identité). */
export function divisorsFromPairs(pairs) {
  const set = new Set();
  pairs.forEach(([a, b]) => { set.add(a); set.add(b); });
  return [...set].sort((a, b) => a - b);
}

/* ── Nombres premiers ───────────────────────────────────────────────── */

export function isPrime(n) {
  if (!Number.isInteger(n) || n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) if (n % d === 0) return false;
  return true;
}

export function primesUpTo(limit) {
  const out = [];
  for (let k = 2; k <= limit; k += 1) if (isPrime(k)) out.push(k);
  return out;
}

/** Multiples de p barrés par le crible : à partir de p² (les plus petits sont déjà barrés). */
export function sieveStrikes(limit, p) {
  const out = [];
  for (let k = p * p; k <= limit; k += p) out.push(k);
  return out;
}

/** Les nombres premiers dont il faut barrer les multiples pour cribler jusqu'à `limit`. */
export const sievePrimes = (limit) => primesUpTo(Math.floor(Math.sqrt(limit)));

/* ── Décomposition ──────────────────────────────────────────────────── */

/** Facteurs premiers avec répétition, croissants : 60 → [2, 2, 3, 5]. */
export function primeFactors(n) {
  assertInt(n);
  if (n < 2) return [];
  const out = [];
  let m = n;
  for (let p = 2; p * p <= m; p += 1) {
    while (m % p === 0) { out.push(p); m /= p; }
  }
  if (m > 1) out.push(m);
  return out;
}

/** [{ p, e }] dérivé de primeFactors uniquement. */
export function factorization(n) {
  const fz = [];
  primeFactors(n).forEach((p) => {
    const last = fz[fz.length - 1];
    if (last && last.p === p) last.e += 1;
    else fz.push({ p, e: 1 });
  });
  return fz;
}

export const productOf = (fz) => fz.reduce((acc, { p, e }) => acc * p ** e, 1);

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = (e) => String(e).split('').map((c) => SUP[Number(c)]).join('');

/** « 2² × 3² × 5 » (unicode, pour la prose) ou `2^{2}\times 3^{2}\times 5` (KaTeX). */
export function formatFactors(fz, { latex = false } = {}) {
  if (!fz.length) return latex ? '1' : '1';
  return fz
    .map(({ p, e }) => (e === 1 ? `${p}` : latex ? `${p}^{${e}}` : `${p}${sup(e)}`))
    .join(latex ? '\\times ' : ' × ');
}

export const formatFactorization = (n, opts) => formatFactors(factorization(n), opts);

/** Paires non triviales [a, b] avec 1 < a ≤ b, a × b = n. */
export const factorPairOptions = (n) => divisorPairs(n).filter(([a]) => a > 1);

/* ── Arbre des facteurs (structure pure, l'UI ne fait que l'afficher) ── */

/** Un nœud : { value, children: [nœud, nœud] | null }. Chemin = suite d'indices ('' = racine). */
export const makeTree = (value) => ({ value, children: null });

export function treeNodeAt(tree, path) {
  let node = tree;
  for (const c of path) {
    if (!node.children) return null;
    node = node.children[Number(c)];
  }
  return node ?? null;
}

/** Nouvel arbre où la feuille `path` est coupée en a × b (a × b doit valoir sa valeur). */
export function splitNode(tree, path, [a, b]) {
  if (path === '') {
    if (tree.children || a * b !== tree.value) return tree;
    return { value: tree.value, children: [makeTree(a), makeTree(b)] };
  }
  if (!tree.children) return tree;
  const i = Number(path[0]);
  const next = tree.children.map((child, k) => (k === i ? splitNode(child, path.slice(1), [a, b]) : child));
  return { value: tree.value, children: next };
}

/** Feuilles [{ value, path }] de gauche à droite. */
export function treeLeaves(tree, path = '') {
  if (!tree.children) return [{ value: tree.value, path }];
  return tree.children.flatMap((child, i) => treeLeaves(child, path + i));
}

export const treeComplete = (tree) => treeLeaves(tree).every((l) => isPrime(l.value));

/** Arbre complet automatique (coupe par le plus petit facteur premier) — pour révéler ou figer. */
export function autoTree(n, firstPair = null) {
  if (isPrime(n) || n < 2) return makeTree(n);
  const [a, b] = firstPair ?? [primeFactors(n)[0], n / primeFactors(n)[0]];
  return { value: n, children: [autoTree(a), autoTree(b)] };
}

/* ── Critères de divisibilité ───────────────────────────────────────── */

export const digitSum = (n) => String(Math.abs(n)).split('').reduce((s, c) => s + Number(c), 0);

const CRITERIA = {
  2: { kind: 'lastDigit', digits: [0, 2, 4, 6, 8] },
  5: { kind: 'lastDigit', digits: [0, 5] },
  10: { kind: 'lastDigit', digits: [0] },
  3: { kind: 'digitSum', modulo: 3 },
  9: { kind: 'digitSum', modulo: 9 },
};

export function criterion(k) {
  const c = CRITERIA[k];
  if (!c) throw new RangeError(`Pas de critère usuel pour ${k}`);
  return c;
}

export function divisibleByCriterion(n, k) {
  const c = criterion(k);
  if (c.kind === 'lastDigit') return c.digits.includes(Math.abs(n) % 10);
  return digitSum(n) % c.modulo === 0;
}

/** Multiples de k entre 1 et limit : k, 2k, 3k… */
export function multiplesUpTo(k, limit) {
  const out = [];
  for (let m = k; m <= limit; m += k) out.push(m);
  return out;
}

/* ── PGCD / PPCM à partir des factorisations ────────────────────────── */

function mergeWith(fa, fb, pick) {
  const primes = [...new Set([...fa.map((f) => f.p), ...fb.map((f) => f.p)])].sort((a, b) => a - b);
  return primes
    .map((p) => ({ p, e: pick(fa.find((f) => f.p === p)?.e ?? 0, fb.find((f) => f.p === p)?.e ?? 0) }))
    .filter((f) => f.e > 0);
}

export const mergeMin = (fa, fb) => mergeWith(fa, fb, Math.min);
export const mergeMax = (fa, fb) => mergeWith(fa, fb, Math.max);
export const commonFactors = mergeMin;

export const gcd = (a, b) => productOf(mergeMin(factorization(a), factorization(b)));
export const lcm = (a, b) => productOf(mergeMax(factorization(a), factorization(b)));

/** Simplification maximale : 84/126 → { num: 2, den: 3, dividedBy: [2, 3, 7] }. */
export function simplifyFraction(num, den) {
  const g = gcd(num, den);
  return { num: num / g, den: den / g, dividedBy: primeFactors(g) };
}

/* ── Horaires (bus) ─────────────────────────────────────────────────── */

/** Minutes depuis minuit → « 7 h 36 » (jamais écrit à la main dans les modules). */
export function formatClock(totalMinutes) {
  assertInt(totalMinutes, 'totalMinutes');
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${h} h ${String(m).padStart(2, '0')}`;
}
