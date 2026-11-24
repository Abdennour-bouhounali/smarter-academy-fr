// Oracle of the bank « thales-configuration-papillon » (3e). Every answer is RECOMPUTED here from the numbers of the
// statement, never read from `expectedAnswer`, and by another path than the bank's cross product: the SCALE FACTOR of the
// two triangles (k = a length of one over its partner of the same line through the vertex), then each unknown = its
// partner × k; a length across the vertex (or a whole side) is the sum of its two pieces; Pythagoras by an exact square
// root. QCM are left to the validator (their right choice is a reading of the figure, not a computation).
import { R, q } from './helpers.mjs';

/** the scale factor from one triangle to the other: `to / from`, exactly */
const k = (to, from) => q(to).div(from);
/** a length of the second triangle: its partner × k */
const times = (len, factor) => q(len).mul(factor);
const sum = (...xs) => xs.reduce((s, x) => s.add(x), q(0));
const diff = (a, b) => q(a).sub(b);
/** the exact square root of a decimal square (the bank's Pythagoras has exact roots) */
const root = (v) => {
  const x = q(
    Math.sqrt(Number(q(v).n) / Number(q(v).d))
      .toFixed(6)
      .replace(/\.?0+$/, ''),
  );
  if (x.mul(x).sub(v).isZero()) return x;
  throw new Error(`root: ${v} is not a decimal square`);
};
const V = (x) => R(q(x).toString());

const X = 'ex-3e-thales-configuration-papillon-';
const E = {};
const put = (id, answers) => Object.entries(answers).forEach(([qid, v]) => (E[`${id}:${qid}`] = V(v)));

// level 1
put('l1-001', { q2: times(4, k(3, 2.5)) });
put('l1-002', { q1: k(2, 3), q2: times(2.4, k(3, 2)) });
put('l1-003', { q1: times(2, k(4, 2)), q2: times(3, k(4, 2)) });
put('l1-004', { q1: times(8, k(3, 6)), q2: times(2.5, k(6, 3)) });
put('l1-008', { q1: diff(7, 2), q2: times(4, k(diff(7, 2), 2)) });
put('l1-009', { q1: times(4.5, k(4, 3)), q2: times(6, k(4, 3)) });
put('l1-010', { q1: times(4, k(9, 6)), q2: times(8, k(9, 6)) });
// level 2
put('l2-001', { q1: times(3.3, k(2, 3)), q2: times(2.6, k(3, 2)) });
put('l2-002', { q1: times(2, k(5, 3)), q2: times(4, k(5, 3)) });
put('l2-003', { q1: times(4.5, k(1.6, 3.2)), q2: times(3, k(1.6, 3.2)) });
put('l2-004', { q1: times(2, k(8.4, 3)), q2: times(4, k(8.4, 3)) });
put('l2-005', { q2: times(2.8, k(4.5, 3)) });
const oe208 = diff(6.3, 1.8);
put('l2-008', { q1: oe208, q2: times(1.6, k(oe208, 1.8)), q3: sum(1.6, times(1.6, k(oe208, 1.8))) });
put('l2-009', { q1: times(1.4, k(3, 1.2)), q2: times(4, k(1.2, 3)) });
put('l2-010', { q1: times(2.4, k(4.8, 3.2)), q2: times(6, k(3.2, 4.8)) });
// level 3
put('l3-001', { q1: times(4, k(1.3, 3.9)), q2: times(2, k(3.9, 1.3)) });
put('l3-003', { q2: times(1.8, k(diff(5, 2), 2)) });
put('l3-005', { q1: times(4.5, k(5.6, 3.5)), q2: times(6.4, k(3.5, 5.6)) });
put('l3-006', { q1: times(2.25, k(5.25, 3.75)), q2: times(2.5, k(5.25, 3.75)) });
const dn307 = times(5, k(diff(3, 2), 2)); // the parallelogram: AD = BC = 3, MD = AD − AM, DN = AB × MD / MA
put('l3-007', { q1: diff(3, 2), q2: dn307, q3: sum(5, dn307) });
const ac308 = root(diff(q(6).mul(6), q(3.6).mul(3.6)));
put('l3-008', { q1: ac308, q2: times(6, k(diff(3.6, 1.6), 3.6)), q3: times(ac308, k(diff(3.6, 1.6), 3.6)) });
put('l3-009', { q2: times(2.7, k(3.5, 2.1)), q3: times(4, k(2.1, 3.5)) });
const oe310 = diff(6.4, 2.4);
const of310 = times(2.1, k(oe310, 2.4));
const ef310 = times(1.5, k(oe310, 2.4));
put('l3-010', { q1: oe310, q2: of310, q3: ef310, q4: sum(oe310, of310, ef310) });
// level 4
put('l4-001', { q1: sum(3.3, 2), q5: times(4.5, k(3.3, 2)) });
const tb402 = times(8, k(31.5, 6.3));
put('l4-002', { q2: tb402, q3: sum(tb402, 4).mul(1250) });
const ob403 = times(35.7, k(32.2, 48.3));
put('l4-003', { q1: times(38, k(48.3, 32.2)), q2: ob403, q3: sum(32.2, 48.3, ob403, 35.7).mul(25).div(100) });
const me404 = root(sum(q(3.2).mul(3.2), q(2.4).mul(2.4)));
put('l4-004', { q1: me404, q2: times(3.2, k(1, me404)), q3: times(2.4, k(1, me404)) });
put('l4-005', { q3: times(3.2, k(4.2, 2.8)) });
put('l4-006', { q1: times(4, k(2, 5)), q2: times(4, k(8, 5)), q3: times(3.5, k(8, 5)) });
put('l4-007', { q1: times(13.2, k(3.5, 10.5)), q2: times(5, k(10.5, 3.5)) });
const oc408 = times(33.2, k(54.6, 36.4));
put('l4-008', { q1: times(45.6, k(36.4, 54.6)), q2: oc408, q3: sum(33.2, oc408) });
const ob409 = root(sum(q(2).mul(2), q(1.5).mul(1.5)));
put('l4-009', { q1: ob409, q2: times(ob409, k(3.2, 2)), q3: times(1.5, k(3.2, 2)) });
// the two cables: OA and OC in the ratio AB : CD, and OA + OC = AC
const oa410 = times(12, k(3.2, sum(3.2, 4.8)));
put('l4-010', { q1: k(3.2, 4.8), q2: oa410, q3: diff(12, oa410) });
// level 5
put('l5-001', { q3: times(2.2, k(6.5, 2.6)), q4: times(2.4, k(6.5, 2.6)) });
put('l5-002', { q2: times(11.4, k(21.6, 14.4)), q3: sum(14.4, 21.6) });
const oa503 = sum(1.4, 2.6);
put('l5-003', {
  q1: oa503,
  q2: times(3.2, k(1.4, oa503)),
  q3: diff(10, oa503),
  q4: times(3.2, k(diff(10, oa503), oa503)),
});
const of504 = times(0.42, k(0.54, 0.36));
put('l5-004', { q1: of504, q2: sum(0.42, of504), q3: times(0.5, k(0.54, 0.36)) });
// the projector, in centimetres, answered in metres
put('l5-005', { q1: times(3.6, k(400, 9)).div(100), q2: times(9, k(200, 3.6)).div(100) });
put('l5-006', { q1: times(46.5, k(26.4, 39.6)), q2: times(25.2, k(39.6, 26.4)), q3: sum(26.4, 39.6) });
const ob507 = times(1.4, k(0.9, 1.5));
put('l5-007', { q1: times(2.1, k(0.9, 1.5)), q2: ob507, q3: sum(ob507, 1.4) });
put('l5-008', { q1: times(0.36, k(1.35, 0.3)), q2: sum(0.3, 1.35) });
put('l5-009', { q1: times(7.9, k(25.2, 6.3)), q2: times(5.5, k(25.2, 6.3)) });
// the trestle: OD = 2,5 × OA and OA + OD = AD
const r510 = k(0.75, 0.3);
const oa510 = q(0.91).div(sum(1, r510));
put('l5-010', { q1: r510, q2: oa510, q3: diff(0.91, oa510) });

export const ORACLE = Object.fromEntries(Object.entries(E).map(([key, v]) => [X + key, v]));
