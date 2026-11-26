// Oracle of the bank « multiples-et-diviseurs-communs » (3e). Every answer is RECOMPUTED here from the numbers of the
// statement, never read from `expectedAnswer`, and by another path than the bank's: the smallest common multiple is
// SEARCHED upward (the first non-zero multiple of the largest number that every other number divides), a PPCM in
// factors is built from the maximum exponent of each prime, a PGCD by a search downward, a count by walking the
// multiples. QCM are left to the validator.
import { R } from './helpers.mjs';

/** the smallest non-zero common multiple, by a search over the multiples of the largest number */
const ppcm = (...xs) => {
  const big = Math.max(...xs);
  for (let m = big; ; m += big) if (xs.every((x) => m % x === 0)) return m;
};
/** the largest common divisor, by a search downward */
const pgcd = (a, b) => {
  for (let d = Math.min(a, b); d >= 1; d--) if (a % d === 0 && b % d === 0) return d;
  return 1;
};
/** the common multiples in ]0 ; max], increasing */
const commons = (a, b, max) => Array.from({ length: max }, (_, i) => i + 1).filter((m) => m % a === 0 && m % b === 0);
const multiples = (n, max) => Array.from({ length: Math.floor(max / n) }, (_, i) => n * (i + 1));
/** how many non-zero multiples of m are ≤ max */
const countUpTo = (m, max) => {
  let k = 0;
  for (let v = m; v <= max; v += m) k++;
  return k;
};
const S = (arr) => ({ value: [...arr].sort((x, y) => x - y).join(', ') });
const vp = (n, p) => {
  let k = 0;
  while (n % p === 0) {
    n /= p;
    k++;
  }
  return k;
};
/** the prime factors of a list of integers, increasing */
const primesIn = (...xs) => {
  const out = new Set();
  for (const x of xs) for (let d = 2; d <= x; d++) if (x % d === 0 && Array.from({ length: d - 2 }, (_, i) => i + 2).every((q) => d % q !== 0)) out.add(d);
  return [...out].sort((a, b) => a - b);
};
/** the smallest common multiple in factors: every prime seen in any number, with its LARGEST exponent */
const FL = (...xs) => ({
  value: primesIn(...xs)
    .map((p) => [p, Math.max(...xs.map((x) => vp(x, p)))])
    .map(([p, k]) => (k > 1 ? `${p}^${k}` : `${p}`))
    .join('*'),
});
/** the PGCD in factors: primes of both, smaller exponent */
const FG = (a, b) => ({
  value: primesIn(a, b)
    .filter((p) => a % p === 0 && b % p === 0)
    .map((p) => [p, Math.min(vp(a, p), vp(b, p))])
    .map(([p, k]) => (k > 1 ? `${p}^${k}` : `${p}`))
    .join('*'),
});
const pw = (p, k) => p ** k;
/** the next day when a team that works 1 day then rests r days works again */
const nextWork = (r) => 1 + (r + 1);
/** the first day after day 1 when every team works, teams resting r1, r2… days */
const meetDay = (...rests) => 1 + ppcm(...rests.map((r) => r + 1));

const X = 'ex-3e-multiples-et-diviseurs-communs-';
const E = {
  // level 1
  'l1-001:q1': S(multiples(6, 48)),
  'l1-001:q2': S(multiples(8, 48)),
  'l1-001:q3': R(ppcm(6, 8)),
  'l1-002:q2': R(18 / 6),
  'l1-003:q2': R(ppcm(10, 15)),
  'l1-004:q1': R(ppcm(6, 8)),
  'l1-004:q2': R(ppcm(6, 8) / 6),
  'l1-005:q2': R(ppcm(4, 7) / 7),
  'l1-006:q1': S(commons(9, 15, 99)),
  'l1-006:q2': R(Math.min(...commons(9, 15, 99))),
  'l1-007:q2': R(ppcm(6, 14)),
  'l1-008:q1': R(ppcm(5, 15)),
  'l1-009:q1': FL(2 * 3, 2 * 5),
  'l1-009:q2': R(2 * 3 * 5),
  'l1-010:q1': FL(pw(3, 2) * 5, 3 * pw(5, 2)),
  'l1-010:q2': R(ppcm(pw(3, 2) * 5, 3 * pw(5, 2))),
  // level 2
  'l2-001:q1': R(ppcm(8, 14)),
  'l2-002:q1': FL(pw(2, 2) * pw(3, 2) * 7, 2 * pw(3, 3) * 5),
  'l2-003:q1': FL(pw(2, 2) * 7, 2 * pw(7, 2)),
  'l2-003:q2': R(ppcm(pw(2, 2) * 7, 2 * pw(7, 2))),
  'l2-005:q1': FL(18, 30),
  'l2-005:q2': R(ppcm(18, 30)),
  'l2-006:q1': R(ppcm(10, 25)),
  'l2-006:q2': R(countUpTo(ppcm(10, 25), 3 * 60)),
  'l2-007:q1': R(ppcm(6, 10)),
  'l2-007:q2': R(ppcm(6, 10) / 6),
  'l2-007:q3': R(ppcm(6, 10) / 10),
  'l2-008:q1': R(ppcm(6, 15)),
  'l2-008:q2': R(15 + ppcm(6, 15)),
  'l2-009:q1': FL(pw(3, 2), 2 * 5),
  'l2-010:q1': S(commons(6, 7, 100)),
  // level 3
  'l3-001:q1': FL(pw(2, 2) * pw(5, 2) * 7, pw(2, 3) * 5 * 11),
  'l3-002:q1': R(ppcm(18, 27)),
  'l3-002:q2': R(ppcm(18, 27) / 18),
  'l3-002:q3': R(ppcm(18, 27) / 27),
  'l3-003:q2': R(pgcd(30, 45)),
  'l3-004:q1': FL(6, 8, 10),
  'l3-004:q2': R(ppcm(6, 8, 10)),
  'l3-005:q1': R(nextWork(7)),
  'l3-005:q2': R(9 + 1),
  'l3-005:q3': R(meetDay(7, 9)),
  'l3-006:q1': FG(pw(2, 2) * 3 * 7, 2 * pw(3, 2) * 5),
  'l3-006:q2': FL(pw(2, 2) * 3 * 7, 2 * pw(3, 2) * 5),
  'l3-007:q1': R(ppcm(15, 18)),
  'l3-007:q2': R(ppcm(15, 18) % 60),
  'l3-008:q1': R(ppcm(24, 28)),
  'l3-008:q2': R(countUpTo(ppcm(24, 28), (13 - 6) * 60)),
  'l3-009:q1': R(ppcm(28, 42)),
  'l3-009:q2': R(ppcm(28, 42) / 28),
  'l3-009:q3': R(ppcm(28, 42) / 42),
  'l3-010:q2': R(pgcd(150, 180)),
  'l3-010:q3': R(ppcm(150, 180)),
  'l3-010:q4': R(ppcm(150, 180) / 60),
  // level 4
  'l4-001:q1': R(ppcm(40, 56)),
  'l4-001:q2': R(ppcm(40, 56) / 40),
  'l4-001:q3': R(ppcm(40, 56) / 56),
  'l4-001:q4': R(70 / (ppcm(40, 56) / 40)),
  'l4-002:q1': R(ppcm(7, 9, 10)),
  'l4-002:q2': R((6 * 60 + ppcm(7, 9, 10)) % 60),
  'l4-002:q3': R(countUpTo(ppcm(7, 9, 10), 15 * 60)),
  'l4-003:q1': R(ppcm(9, 10, 15)),
  'l4-003:q2': R(countUpTo(ppcm(9, 10, 15), 300)),
  'l4-003:q3': R(3 * ppcm(9, 10, 15)),
  'l4-004:q2': R(pgcd(585, 390)),
  'l4-004:q3': R((585 / pgcd(585, 390)) * (390 / pgcd(585, 390))),
  'l4-005:q1': R(8 + 1),
  'l4-005:q2': R(meetDay(8, 14)),
  'l4-005:q3': R(Array.from({ length: 200 }, (_, i) => i + 1).filter((d) => (d - 1) % ppcm(9, 15) === 0).length),
  'l4-006:q2': R(pgcd(232, 348)),
  'l4-006:q3': R(348 / pgcd(232, 348)),
  'l4-006:q4': R(pgcd(232, 348) * 9),
  'l4-007:q1': R(ppcm(25, 30)),
  'l4-007:q2': R(countUpTo(ppcm(25, 30), 15 * 60)),
  'l4-007:q3': R((2 * ppcm(25, 30)) / 60),
  'l4-008:q1': R(ppcm(17, 23)),
  'l4-008:q3': R(ppcm(18, 45)),
  'l4-009:q2': R(pgcd(180, 270)),
  'l4-009:q3': R(ppcm(180, 270)),
  'l4-009:q4': R(ppcm(180, 270) / 60),
  'l4-010:q1': FL(66, 90),
  'l4-010:q2': R(ppcm(66, 90)),
  'l4-010:q3': R(Math.floor((5 * 60 + 40 + ppcm(66, 90)) / 60) % 24),
  // level 5
  'l5-001:q1': R(ppcm(45, 50)),
  'l5-001:q2': R(ppcm(45, 50) / 45),
  'l5-001:q3': R(ppcm(45, 50) / 50),
  'l5-001:q4': R((ppcm(45, 50) / 45) * 3 + (ppcm(45, 50) / 50) * 4),
  'l5-001:q5': R(countUpTo(ppcm(45, 50), 1000)),
  'l5-002:q1': FL(3 * 11, 5 * 11),
  'l5-002:q2': R(ppcm(33, 55)),
  'l5-002:q3': R(ppcm(33, 55) / 33),
  'l5-002:q4': R(90 / (ppcm(33, 55) / 33)),
  'l5-003:q1': R(9 + 1),
  'l5-003:q2': R(ppcm(9, 10, 15)),
  'l5-003:q3': R(meetDay(8, 9, 14)),
  'l5-003:q4': R(meetDay(8, 14)),
  'l5-004:q2': R(pgcd(1190, 1785)),
  'l5-004:q3': R((1190 / pgcd(1190, 1785)) * (1785 / pgcd(1190, 1785))),
  'l5-004:q4': R((1190 / 85) * (1785 / 85)),
  'l5-005:q2': R(pgcd(54, 90)),
  'l5-005:q3': R(54 / pgcd(54, 90)),
  'l5-005:q4': R(ppcm(54, 90)),
  'l5-005:q5': R(Math.floor(ppcm(54, 90) / 60)),
  'l5-006:q1': R(ppcm(27, 45)),
  'l5-006:q2': R((ppcm(27, 45) / 27) * 2 + (ppcm(27, 45) / 45) * 3),
  'l5-006:q3': R(Math.floor(100 / ((ppcm(27, 45) / 27) * 2 + (ppcm(27, 45) / 45) * 3))),
  'l5-006:q4': R(Math.floor(100 / ((ppcm(27, 45) / 27) * 2 + (ppcm(27, 45) / 45) * 3)) * ppcm(27, 45)),
  'l5-007:q2': R(ppcm(88, 110)),
  'l5-007:q3': R(Math.floor(ppcm(88, 110) / 60)),
  'l5-007:q5': R(pgcd(150, 225)),
  'l5-008:q1': R(ppcm(50, 15)),
  'l5-008:q2': R(ppcm(50, 15) / 50),
  'l5-008:q3': R(ppcm(50, 15) / 15),
  'l5-008:q4': R(90 / (ppcm(50, 15) / 50)),
  'l5-009:q1': FL(4, 9, 11),
  'l5-009:q2': R(ppcm(4, 9, 11)),
  'l5-009:q3': R(Math.floor(ppcm(4, 9, 11) / 60)),
  'l5-009:q4': R(countUpTo(ppcm(4, 9, 11), 3600)),
  'l5-010:q2': R(pgcd(110, 165)),
  'l5-010:q3': R(pgcd(110, 165) * 7),
  'l5-010:q4': R(ppcm(24, 30)),
  'l5-010:q5': R(countUpTo(ppcm(24, 30), 4 * 60)),
};
export const ORACLE = Object.fromEntries(Object.entries(E).map(([k, v]) => [X + k, v]));
