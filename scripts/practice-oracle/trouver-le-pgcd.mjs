// Oracle of the bank « trouver-le-pgcd » (3e). Every answer is RECOMPUTED here from the numbers of the statement, never
// read from `expectedAnswer`, and by another path than the bank's: the PGCD as the LARGEST number that divides both (a
// search downward), a PGCD in factors as the minimum of the prime exponents, Euclid's rows counted by its own loop.
// QCM are left to the validator, except the ones whose right choice is a computation (C).
import { R, C } from './helpers.mjs';

/** the PGCD by its definition: the largest d that divides a and b */
const pgcd = (a, b) => {
  for (let d = Math.min(a, b); d >= 1; d--) if (a % d === 0 && b % d === 0) return d;
  return 1;
};
/** every common divisor, in increasing order */
const commons = (a, b) =>
  Array.from({ length: Math.min(a, b) }, (_, i) => i + 1).filter((d) => a % d === 0 && b % d === 0);
const divs = (n) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);
const S = (arr) => ({ value: [...arr].sort((x, y) => x - y).join(', ') });
/** the exponent of p in n */
const vp = (n, p) => {
  let k = 0;
  while (n % p === 0) {
    n /= p;
    k++;
  }
  return k;
};
const primesOf = (n) => {
  const out = [];
  for (let d = 2; d <= n; d++) if (n % d === 0 && vp(n, d) > 0 && out.every((p) => d % p !== 0)) out.push(d);
  return out;
};
/** canonical decomposition: '2^3*3^2*5' */
const F = (n) => ({
  value: primesOf(n)
    .map((p) => (vp(n, p) > 1 ? `${p}^${vp(n, p)}` : `${p}`))
    .join('*'),
});
/** the PGCD in factors: each prime of both, with the smaller exponent */
const FG = (a, b) => ({
  value: primesOf(a)
    .filter((p) => b % p === 0)
    .map((p) => [p, Math.min(vp(a, p), vp(b, p))])
    .map(([p, k]) => (k > 1 ? `${p}^${k}` : `${p}`))
    .join('*'),
});
/** Euclid's rows, counted: how many divisions until the remainder 0 */
const rowsOf = (a, b) => {
  let [x, y] = a > b ? [a, b] : [b, a];
  let n = 0;
  for (;;) {
    n++;
    const r = x - y * Math.floor(x / y);
    if (r === 0) return n;
    [x, y] = [y, r];
  }
};
const rem = (a, b) => (a > b ? a - b * Math.floor(a / b) : b - a * Math.floor(b / a));
/** the second remainder of Euclid's rows */
const rem2 = (a, b) => {
  const [x, y] = a > b ? [a, b] : [b, a];
  const r = x % y;
  return y % r;
};

const X = 'ex-3e-trouver-le-pgcd-';
const E = {
  // level 1
  'l1-001:q1': S(commons(12, 18)),
  'l1-001:q2': R(pgcd(12, 18)),
  'l1-002:q1': S(commons(42, 70)),
  'l1-002:q2': R(pgcd(42, 70)),
  'l1-003:q1': S(divs(49)),
  'l1-003:q2': R(pgcd(63, 49)),
  'l1-004:q1': R(pgcd(77, 121)),
  'l1-004:q2': C(commons(77, 121).length > 2 ? 'A' : 'B'),
  'l1-005:q1': FG(2 ** 2 * 3 ** 2 * 11, 2 ** 3 * 3 * 13),
  'l1-005:q2': R(pgcd(2 ** 2 * 3 ** 2 * 11, 2 ** 3 * 3 * 13)),
  'l1-006:q2': R(pgcd(3 * 5 ** 2 * 7, 3 ** 2 * 5 * 13)),
  'l1-007:q1': FG(5 * 13 ** 2, 5 ** 2 * 13),
  'l1-007:q2': R(pgcd(5 * 13 ** 2, 5 ** 2 * 13)),
  'l1-008:q2': R(pgcd(203, 87)),
  'l1-009:q1': R(rowsOf(247, 190)),
  'l1-009:q2': R(pgcd(247, 190)),
  'l1-010:q1': C(78 % 13 === 0 && 117 % 13 === 0 ? 'A' : 'B'),
  'l1-010:q2': C(78 % 6 === 0 && 117 % 6 === 0 ? 'A' : 'B'),
  'l1-010:q3': R((78 / pgcd(78, 117)) * (117 / pgcd(78, 117))),
  // level 2
  'l2-001:q1': S(divs(39)),
  'l2-001:q2': R(pgcd(39, 65)),
  'l2-002:q1': S(commons(85, 51)),
  'l2-002:q2': R(pgcd(85, 51)),
  'l2-003:q1': F(364),
  'l2-003:q2': F(546),
  'l2-003:q3': R(pgcd(364, 546)),
  'l2-004:q1': F(350),
  'l2-004:q2': F(560),
  'l2-004:q3': R(pgcd(350, 560)),
  'l2-005:q1': F(528),
  'l2-005:q2': F(594),
  'l2-005:q3': FG(528, 594),
  'l2-006:q1': R(rem(1005, 315)),
  'l2-006:q2': R(pgcd(1005, 315)),
  'l2-007:q1': R(rowsOf(1122, 408)),
  'l2-007:q2': R(pgcd(1122, 408)),
  'l2-008:q1': R(rem2(935, 714)),
  'l2-008:q2': R(pgcd(935, 714)),
  'l2-009:q1': R(pgcd(150, 120)),
  'l2-009:q2': R(pgcd(150, 120)),
  'l2-009:q3': R((150 / pgcd(150, 120)) * (120 / pgcd(150, 120))),
  'l2-010:q1': C(132 % 6 === 0 && 156 % 6 === 0 ? 'A' : 'B'),
  'l2-010:q2': C(132 % 8 === 0 && 156 % 8 === 0 ? 'A' : 'B'),
  'l2-010:q3': R((132 / pgcd(132, 156)) * (156 / pgcd(132, 156))),
  // level 3
  'l3-001:q1': S(commons(104, 156)),
  'l3-001:q2': R(pgcd(104, 156)),
  'l3-002:q1': R(pgcd(330, 462)),
  'l3-002:q2': S(commons(330, 462).filter((d) => d > 20)),
  'l3-003:q1': C((2 ** 2 * 3 ** 3 * 7) % (2 ** 3 * 3 ** 3) === 0 ? 'A' : 'B'),
  'l3-003:q2': FG(2 ** 3 * 3 * 5 ** 2, 2 ** 2 * 3 ** 3 * 7),
  'l3-004:q1': C((2 ** 4 * 3 * 5 ** 2) % (2 ** 4 * 3 ** 2 * 5 ** 2) === 0 ? 'A' : 'B'),
  'l3-004:q2': FG(2 ** 4 * 3 * 5 ** 2, 2 ** 3 * 3 ** 2 * 5 * 7),
  'l3-004:q3': R(pgcd(2 ** 4 * 3 * 5 ** 2, 2 ** 3 * 3 ** 2 * 5 * 7)),
  'l3-005:q1': R(rem(945, 1215)),
  'l3-005:q2': R(pgcd(945, 1215)),
  'l3-006:q2': R(pgcd(1631, 932)),
  'l3-007:q1': R(rowsOf(1001, 637)),
  'l3-007:q2': R(pgcd(1001, 637)),
  'l3-008:q1': R(pgcd(240, 180)),
  'l3-008:q2': R(pgcd(240, 180)),
  'l3-008:q3': R((240 / pgcd(240, 180)) * (180 / pgcd(240, 180))),
  'l3-009:q1': C(156 % 6 === 0 && 180 % 6 === 0 ? 'A' : 'B'),
  'l3-009:q2': C(156 % 9 === 0 && 180 % 9 === 0 ? 'A' : 'B'),
  'l3-009:q3': R((156 / pgcd(156, 180)) * (180 / pgcd(156, 180))),
  'l3-009:q4': S(commons(156, 180)),
  'l3-010:q1': R(pgcd(276, 207)),
  'l3-010:q2': R(276 / pgcd(276, 207)),
  'l3-010:q3': R(207 / pgcd(276, 207)),
  'l3-010:q4': C(276 % 24 === 0 && 207 % 24 === 0 ? 'A' : 'B'),
  // level 4
  'l4-001:q1': R(pgcd(234, 156)),
  'l4-001:q2': S(commons(234, 156).filter((d) => d > 10)),
  'l4-002:q1': R(pgcd(275, 165)),
  'l4-002:q2': S(commons(275, 165)),
  'l4-003:q1': FG(2520, 1188),
  'l4-003:q2': R(pgcd(2520, 1188)),
  'l4-003:q3': R(2520 / pgcd(2520, 1188)),
  'l4-004:q2': R(pgcd(1650, 2475)),
  'l4-004:q3': R((1650 + 2475) / pgcd(1650, 2475)),
  'l4-005:q1': R(rowsOf(5858, 6767)),
  'l4-005:q2': R(pgcd(5858, 6767)),
  'l4-006:q1': R(rem(22816, 19251)),
  'l4-006:q2': R(pgcd(22816, 19251)),
  'l4-007:q2': R(rowsOf(19982, 29973)),
  'l4-007:q3': R(pgcd(19982, 29973)),
  'l4-008:q1': R(pgcd(252, 180)),
  'l4-008:q2': R(252 / pgcd(252, 180)),
  'l4-008:q3': R(180 / pgcd(252, 180)),
  'l4-008:q4': C(252 % 12 === 0 && 180 % 12 === 0 ? 'A' : 'B'),
  'l4-008:q5': R(950 - (252 * 2 + 180 * 1 + pgcd(252, 180) * 6)),
  'l4-009:q1': R(pgcd(336, 224)),
  'l4-009:q2': R(336 / pgcd(336, 224)),
  'l4-009:q3': R((336 / pgcd(336, 224)) * 3 + (224 / pgcd(336, 224)) * 2 + 1),
  'l4-009:q4': R(pgcd(336, 224) * 20 - (336 * 3 + 224 * 2 + pgcd(336, 224) * 1)),
  'l4-010:q1': R(pgcd(420, 294)),
  'l4-010:q2': R(420 / pgcd(420, 294)),
  'l4-010:q3': S(commons(420, 294).filter((d) => d >= 5 && d <= 25)),
  'l4-010:q4': R(420 / 14),
  // level 5
  'l5-001:q1': R(pgcd(156, 104)),
  'l5-001:q2': R(156 / pgcd(156, 104)),
  'l5-001:q3': R(104 / pgcd(156, 104)),
  'l5-001:q4': R(Math.ceil(pgcd(156, 104) / 20) * 45),
  'l5-002:q1': F(1080),
  'l5-002:q2': F(840),
  'l5-002:q3': R(pgcd(1080, 840)),
  'l5-002:q4': R(1080 / pgcd(1080, 840)),
  'l5-002:q5': R((pgcd(1080, 840) * 350) / 100),
  'l5-003:q1': F(2288),
  'l5-003:q2': F(1716),
  'l5-003:q3': FG(2288, 1716),
  'l5-003:q4': R(pgcd(2288, 1716)),
  'l5-003:q5': R(pgcd(2288, 1716) * 2),
  'l5-004:q1': R(rowsOf(1352, 507)),
  'l5-004:q2': R(pgcd(1352, 507)),
  'l5-005:q1': R(rem(3131, 2323)),
  'l5-005:q2': R(pgcd(3131, 2323)),
  'l5-005:q3': R(3131 / pgcd(3131, 2323)),
  'l5-006:q2': R(pgcd(402 - 12, 488 - 8)),
  'l5-006:q3': S(commons(402 - 12, 488 - 8).filter((d) => d > 12)),
  'l5-006:q4': R((402 - 12) / Math.max(...commons(390, 480).filter((d) => d > 20))),
  'l5-007:q1': R(pgcd(360, 270)),
  'l5-007:q2': R(360 / pgcd(360, 270)),
  'l5-007:q3': R(270 / pgcd(360, 270)),
  'l5-007:q4': R(Math.floor((570 - 30) / pgcd(360, 270)) - 2),
  'l5-008:q1': R(pgcd(315, 189)),
  'l5-008:q2': R(315 / pgcd(315, 189)),
  'l5-008:q3': R(Math.floor((3270 - 120) / pgcd(315, 189))),
  'l5-009:q1': R(pgcd(216, 162)),
  'l5-009:q2': R(216 / pgcd(216, 162)),
  'l5-009:q3': R(Math.ceil((216 * 7 + 162 * 4 + 30 + 564) / pgcd(216, 162))),
  'l5-010:q1': R(pgcd(432, 288)),
  'l5-010:q2': R(432 / pgcd(432, 288)),
  // the cheapest offer, in cents: 1 = 45 a box, 2 = 30 a box + 2 000, 3 = 8 000
  'l5-010:q3': (() => {
    const n = pgcd(432, 288);
    const cost = [45 * n, 30 * n + 2000, 8000];
    return C('ABC'[cost.indexOf(Math.min(...cost))]);
  })(),
};

export const ORACLE = Object.fromEntries(Object.entries(E).map(([k, v]) => [X + k, v]));
