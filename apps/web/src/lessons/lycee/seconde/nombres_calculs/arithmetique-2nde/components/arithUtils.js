import { formatDec, parseDec, roundTo } from '@smarter-academy/core';

/**
 * arithUtils — le modèle mathématique de la leçon « Arithmétique » (2nde).
 * Tout ce qui est affiché (paquets et restes, multiples sur la droite,
 * parité, découpage en chiffres, listes de multiples, PGCD/PPCM) DÉRIVE de
 * ces fonctions pures. Les entiers sont des entiers JavaScript ; les
 * fonctions refusent les non-entiers.
 */
export { formatDec, parseDec, roundTo };

const assertInt = (n, name = 'n') => { if (!Number.isInteger(n)) throw new TypeError(`${name} doit être un entier (reçu ${n})`); };

/** Division euclidienne de n ≥ 0 par p > 0 : n = p × q + r, 0 ≤ r < p. */
export function divmod(n, p) {
  assertInt(n); assertInt(p, 'p');
  if (p <= 0) throw new RangeError('p > 0');
  const r = ((n % p) + p) % p;
  return { q: (n - r) / p, r };
}
export const isMultiple = (n, p) => Number.isInteger(n) && Number.isInteger(p) && p !== 0 && n % p === 0;
export const isDivisor = (d, n) => isMultiple(n, d);
export const isEven = (n) => Number.isInteger(n) && n % 2 === 0;
export const isOdd = (n) => Number.isInteger(n) && n % 2 !== 0;
/** « 23 = 7 × 3 + 2 ». */
export const euclidText = (n, p) => { const { q, r } = divmod(n, p); return `${n} = ${p} × ${q} + ${r}`; };

/** Paquets de p : q paquets pleins et r unités seules. */
export const packs = (n, p) => { const { q, r } = divmod(n, p); return { packs: q, singles: r }; };
/** Ce que deviennent les restes en additionnant : ra + rb, et le paquet supplémentaire éventuel. */
export function addPacks(a, b, p) {
  const A = packs(a, p); const B = packs(b, p);
  const singles = A.singles + B.singles;
  const extra = Math.floor(singles / p);
  return { packsA: A.packs, singlesA: A.singles, packsB: B.packs, singlesB: B.singles, singles, extraPack: extra, remainder: singles % p, total: a + b, totalPacks: A.packs + B.packs + extra, isMultiple: (a + b) % p === 0 };
}

/** Multiples de p entre lo et hi (inclus), croissants. */
export function multiplesBetween(p, lo, hi) {
  const out = [];
  for (let n = Math.ceil(lo / p) * p; n <= hi; n += p) out.push(n);
  return out;
}
export function divisors(n) { assertInt(n); const out = []; for (let d = 1; d <= Math.abs(n); d += 1) if (n % d === 0) out.push(d); return out; }
export function gcd(a, b) { let x = Math.abs(a); let y = Math.abs(b); while (y) [x, y] = [y, x % y]; return x; }
export const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);
export function commonMultiples(a, b, hi) { return multiplesBetween(lcm(a, b), 1, hi); }

/** n = 2k (pair) ou 2k + 1 (impair) : renvoie { k, odd }. */
export function parityForm(n) { assertInt(n); const odd = n % 2 !== 0; return { k: odd ? (n - 1) / 2 : n / 2, odd }; }
/** (2k + 1)² = 4k² + 4k + 1 = 2(2k² + 2k) + 1 — la clé de « impair² est impair ». */
export const oddSquareForm = (k) => ({ n: 2 * k + 1, square: (2 * k + 1) ** 2, m: 2 * k * k + 2 * k });

/** Chiffres d'un entier positif, poids fort en premier. */
export const digitsOf = (n) => String(Math.abs(n)).split('').map(Number);
export const digitSum = (n) => digitsOf(n).reduce((s, d) => s + d, 0);
/**
 * n = (999a + 99b + 9c) + (a + b + c + d) : la partie multiple de 9 et la somme
 * des chiffres. C'est la PREUVE du critère par 9 (et par 3).
 */
export function nineSplit(n) {
  const ds = digitSum(n);
  return { nineTimes: (n - ds) / 9, ninePart: n - ds, digitSum: ds, parts: digitsOf(n).map((d, i, arr) => ({ digit: d, place: 10 ** (arr.length - 1 - i), nines: 10 ** (arr.length - 1 - i) - 1 })) };
}
/** Les deux derniers chiffres et la partie multiple de 100 : critère par 4 (et 25). */
export function hundredSplit(n) { const last = n % 100; return { hundreds: (n - last) / 100, last }; }
/** Critères : par 2, 3, 4, 5, 9, 10, avec la raison. */
export function divisibleBy(n, d) {
  const ok = n % d === 0;
  const last = n % 10;
  const reasons = {
    2: `dernier chiffre ${last} : ${last % 2 === 0 ? 'pair' : 'impair'}`,
    5: `dernier chiffre ${last} : ${last === 0 || last === 5 ? '0 ou 5' : 'ni 0 ni 5'}`,
    10: `dernier chiffre ${last} : ${last === 0 ? '0' : 'pas 0'}`,
    3: `somme des chiffres ${digitSum(n)} : ${digitSum(n) % 3 === 0 ? 'multiple de 3' : 'pas multiple de 3'}`,
    9: `somme des chiffres ${digitSum(n)} : ${digitSum(n) % 9 === 0 ? 'multiple de 9' : 'pas multiple de 9'}`,
    4: `deux derniers chiffres ${String(n % 100).padStart(2, '0')} : ${n % 100 % 4 === 0 ? 'multiple de 4' : 'pas multiple de 4'}`,
  };
  return { ok, reason: reasons[d] ?? '' };
}
