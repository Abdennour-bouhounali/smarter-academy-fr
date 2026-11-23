// Oracle of the bank « decomposer-en-facteurs-premiers » (3e).
// Every answer is
// RECOMPUTED here from the numbers of the statement, never read from `expectedAnswer`. QCM are left to the validator.
import { R } from './helpers.mjs';

const isPrime = (n) => {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
};
/** canonical decomposition by trial division: '2^3*3^2*5' */
const F = (n) => {
  const parts = [];
  for (let d = 2; n > 1; d++) {
    let k = 0;
    while (n % d === 0) {
      n /= d;
      k++;
    }
    if (k) parts.push(k > 1 ? `${d}^${k}` : `${d}`);
  }
  return { value: parts.join('*') };
};
const spf = (n) => {
  for (let d = 2; d <= n; d++) if (n % d === 0) return d;
  return n;
};
const quo = (n, d) => {
  if (n % d !== 0) throw new Error(`${d} ne divise pas ${n}`);
  return n / d;
};
const maxTrial = (n) => {
  let best = null;
  for (let p = 2; p * p <= n; p++) if (isPrime(p)) best = p;
  return best;
};
const vp = (n, p) => {
  let k = 0;
  while (n % p === 0) {
    n /= p;
    k++;
  }
  return k;
};
const zeros = (n) => {
  let z = 0;
  while (n % 10 === 0) {
    n /= 10;
    z++;
  }
  return z;
};
const isqrt = (n) => {
  let r = 0;
  while ((r + 1) * (r + 1) <= n) r++;
  return r;
};
const S = (arr) => ({ value: [...arr].sort((x, y) => x - y).join(', ') });
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
/** the Scratch-like loop: d from 2, +1 until N modulo d = 0 */
const firstDivisor = (n) => {
  let d = 2;
  while (n % d !== 0) d++;
  return d;
};
/** program « répéter jusqu'à ce que N = 1 » — how many « ajouter 1 à d » before `target` first enters the list */
const incrementsBefore = (n, target) => {
  let d = 2,
    c = 0;
  for (;;) {
    if (n % d === 0) {
      if (d === target) return c;
      n /= d;
    } else {
      d++;
      c++;
    }
  }
};
const fact = (k) => (k <= 1 ? 1 : k * fact(k - 1));
const smallestSquareMultiplier = (n) => {
  for (let k = 1; ; k++) {
    const r = isqrt(n * k);
    if (r * r === n * k) return k;
  }
};

const X = 'ex-3e-decomposer-en-facteurs-premiers-';
const E = {
  'l1-003:q1': F(30),
  'l1-003:q2': F(42),
  'l1-004:q1': R(2 * 5 * 11),
  'l1-004:q2': R(3 * 3 * 7),
  'l1-005:q2': F(90),
  'l1-007:q1': R(spf(77)),
  'l1-007:q2': R(spf(65)),
  'l1-007:q3': R(spf(51)),
  'l1-008:q1': F(40),
  'l1-008:q2': F(18),
  'l1-009:q1': S(range(21, 39).filter(isPrime)),
  'l1-010:q1': R(2 * 2 * 2 * 3),
  'l2-001:q1': F(100),
  'l2-001:q2': F(98),
  'l2-002:q1': R(quo(150, 2)),
  'l2-002:q2': F(150),
  'l2-004:q2': F(180),
  'l2-005:q2': R(3 ** 3 * 5 ** 2),
  'l2-006:q1': F(66),
  'l2-006:q2': F(70),
  'l2-007:q2': R(3 ** 2 * 11),
  'l2-008:q1': F(225),
  'l2-008:q3': R(isqrt(225)),
  'l2-009:q2': F(132),
  'l2-010:q1': F(625),
  'l2-010:q2': F(250),
  'l2-010:q3': R(vp(625, 5)),
  'l3-001:q1': F(68),
  'l3-001:q3': F(119),
  'l3-002:q1': R(spf(133)),
  'l3-002:q2': F(133),
  'l3-003:q1': R(maxTrial(127)),
  'l3-004:q2': F(209),
  'l3-005:q1': F(1000),
  'l3-005:q2': F(432),
  'l3-006:q1': F(2 * 2 * 2 * 2 * 3 * 3 * 11),
  'l3-006:q2': R(2 * 2 * 2 * 2 * 3 * 3 * 11),
  'l3-007:q1': R(2 ** 3 * 3 * 5 ** 2),
  'l3-007:q2': R(quo(2 ** 3 * 3 * 5 ** 2, 15)),
  'l3-008:q1': R(2 ** 4 * 3 ** 2 * 7),
  'l3-008:q2': R(quo(2 ** 4 * 3 ** 2 * 7, 63)),
  'l3-009:q2': F(161),
  'l3-010:q1': F(2964),
  'l3-010:q2': R(quo(2964, 57)),
  'l3-010:q3': R(quo(2964, 52)),
  'l4-001:q1': R(spf(2717)),
  'l4-001:q2': R(quo(2717, 11)),
  'l4-001:q3': F(2717),
  'l4-002:q1': R(firstDivisor(35)),
  'l4-002:q3': R(quo(3599, firstDivisor(3599))),
  'l4-002:q4': F(3599),
  'l4-003:q1': R(quo(1386, 2)),
  'l4-003:q2': F(1386),
  'l4-004:q3': F(200),
  'l4-005:q1': R(quo(1394, 17)),
  'l4-005:q2': R(quo(323, 17)),
  'l4-005:q3': F(1394),
  'l4-005:q4': F(323),
  'l4-006:q2': F(1457),
  'l4-007:q1': R(quo(7429, 17)),
  'l4-007:q3': F(7429),
  'l4-008:q1': R(quo(5311, firstDivisor(5311))),
  'l4-008:q3': F(5311),
  'l4-009:q1': R(quo(12597, spf(12597))),
  'l4-009:q2': R(quo(4199, spf(4199))),
  'l4-009:q3': F(12597),
  'l4-010:q1': R(incrementsBefore(1700, 5)),
  'l4-010:q2': F(1700),
  'l5-001:q1': F(1764),
  'l5-001:q3': R(isqrt(1764)),
  'l5-002:q1': undefined,
  'l5-003:q1': F(2310),
  'l5-003:q3': R(quo(2310, 14)),
  'l5-005:q1': R(
    range(101, 199).filter(
      (n) =>
        n % 27 === 0 &&
        n % 4 !== 0 &&
        F(n)
          .value.split('*')
          .every((f) => ['2', '3'].includes(f.split('^')[0])),
    )[0],
  ),
  'l5-005:q2': F(162),
  'l5-006:q1': F(fact(7)),
  'l5-006:q2': R(vp(fact(10), 2)),
  'l5-006:q3': R(zeros(fact(10))),
  'l5-007:q1': R(range(2, 100).filter((p) => isPrime(p) && 3 * 7 * 11 * p >= 3000 && 3 * 7 * 11 * p <= 3500)[0]),
  'l5-007:q2': R(3 * 7 * 11 * 13),
  'l5-008:q1': R(zeros(2 ** 10 * 5 ** 3)),
  'l5-008:q2': R(2 ** 10 * 5 ** 3),
  'l5-008:q3': R(zeros(2 ** 4 * 3 * 5 ** 6)),
  'l5-009:q1': F(595),
  'l5-009:q2': R(Math.max(...range(2, 595).filter((p) => isPrime(p) && 595 % p === 0))),
  'l5-010:q1': F(1512),
  'l5-010:q3': R(smallestSquareMultiplier(1512)),
};
delete E['l5-002:q1'];

export const ORACLE = Object.fromEntries(Object.entries(E).map(([k, v]) => [X + k, v]));
