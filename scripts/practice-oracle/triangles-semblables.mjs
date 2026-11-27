// Oracle of the bank « triangles-semblables » (3e). Every answer is RECOMPUTED here from the DATA of the statement
// (sides, angles, k, the asked side), never read from `expectedAnswer`, in exact fractions: a quotient of two homologous
// sides, the scale factor k = (side of the image) / (its homologous side), an unknown side = k × its homologous side
// (or / k going back), an angle = 180° − the two others, a perimeter = the sum of the three sides, a price = length × rate.
// Homologous sides are the sides OF THE SAME RANK (shortest with shortest…) — the only pairing the figures draw.
// QCM (homologous vertex / side, « semblables ? ») are left to the validator: they read the figure, they do not compute.
// Not recorded on purpose: l1-009:q1 (the angle B of ABC is not determined by the statement: see the report).
import { R, q } from './helpers.mjs';

const ratio = (to, from) => q(to).div(from);
const times = (len, k) => q(len).mul(k);
const sum = (...xs) => xs.reduce((s, x) => s.add(x), q(0));
/** the third angle of a triangle */
const third = (a, b) => q(180).sub(a).sub(b);
/** the exact square root of a decimal square (right-angle shadow triangles) */
const root = (v) => {
  const x = q(Math.sqrt(Number(q(v).n) / Number(q(v).d)).toFixed(6).replace(/\.?0+$/, ''));
  if (x.mul(x).sub(v).isZero()) return x;
  throw new Error(`root: ${v} is not a decimal square`);
};
const hyp = (a, b) => root(sum(q(a).mul(a), q(b).mul(b)));

const X = 'ex-3e-triangles-semblables-';
const E = {};
const put = (id, answers) => Object.entries(answers).forEach(([qid, v]) => (E[`${X}${id}:${qid}`] = R(q(v).toString())));

// level 1
put('l1-001', { q2: ratio(27, 9) });
put('l1-002', { q1: ratio(12, 10), q2: ratio(16.8, 14) });
put('l1-003', { q1: third(35, 75), q2: third(70, 75) });
put('l1-004', { q1: third(50, 60), q2: third(50, 65) });
{ const k = ratio(10.5, 14); put('l1-005', { q1: k, q2: times(16, k) }); }
put('l1-006', { q2: times(16, q(5).div(4)) });
{ const k = q(2.5); put('l1-007', { q1: times(4, k), q2: times(6, k), q3: times(7, k) }); }
put('l1-008', { q2: ratio(12.6, 9) });
// l1-009:q1 — the sheet now gives C = 70° too (it said only A = 40°, and « 180 − 40 = 70 »: corrected 2026-11-27)
put('l1-009', { q1: third(40, 70), q2: third(70, 70) });
put('l1-010', { q1: third(38, 90), q2: third(52, 90) });
// level 2
put('l2-001', { q1: ratio(sum(5, 4), 5), q2: ratio(sum(10, 4), 10) });
{ const k = ratio(12, 15); put('l2-003', { q1: k, q2: times(20, k) }); }
put('l2-004', { q1: third(44, 68), q2: third(68, 68) });
put('l2-005', { q1: times(36, q(1).div(4)) });
put('l2-006', { q2: ratio(21, 28) });
put('l2-007', { q1: third(64, 52), q2: third(64, 64) });
put('l2-008', { q1: third(33, 84), q2: third(33, 74) });
put('l2-009', { q1: ratio(14, 7), q2: ratio(22, 11) });
put('l2-010', { q1: third(46, 71), q2: third(71, 63) });
// level 3
{ const k = ratio(9, 15); put('l3-001', { q1: k, q2: times(22, k), q3: times(20, k) }); }
put('l3-003', { q1: third(36, 72), q2: third(72, 72) });
put('l3-005', { q1: third(58, 62), q2: third(58, 80) });
put('l3-006', { q3: ratio(12, 6) }); // sorted: 6<7<11 ↔ 12<14<22
put('l3-007', { q1: third(80, 30) });
{ const k = ratio(20, 16); put('l3-008', { q1: k, q2: ratio(25, k), q3: sum(16, ratio(25, k), 22) }); }
{ const k = q(3.5); put('l3-009', { q1: times(9, k), q2: times(sum(5, 6, 9), k), q3: ratio(times(sum(5, 6, 9), k), sum(5, 6, 9)) }); }
{ const k = ratio(24, 60); put('l3-010', { q1: k, q2: times(90, k), q3: times(sum(60, 75, 90), k) }); }
// level 4
{ const k = ratio(6, 10); put('l4-001', { q1: k, q2: times(14, k), q3: times(16, k), q4: times(sum(10, 14, 16), k) }); }
put('l4-002', { q3: ratio(15.4, 7) });
put('l4-003', { q3: ratio(21, 15) });
{ const k = ratio(33, 11); put('l4-004', { q2: k, q3: times(sum(9, 11, 14), k) }); } // [UV] is the homologue of [LM] (drawn 2.357 / 2.357)
put('l4-005', { q3: times(sum(5, 6, 8), ratio(10, 5)) }); // GH ↔ AB
{ const k = ratio(5, 0.5); put('l4-006', { q1: k, q2: times(1.2, k), q3: times(hyp(0.5, 1.2), k) }); }
{ const k = ratio(0.3, 7.5); put('l4-007', { q1: k, q2: times(10, k), q3: times(sum(7.5, 10, 12.5), k) }); }
{ const k = ratio(14, 21); put('l4-008', { q1: k, q2: times(24, k), q3: times(33, k) }); }
{ const k = ratio(14, 40); put('l4-009', { q1: k, q2: ratio(17.5, k), q3: ratio(21.7, k) }); }
{ const k = ratio(2, 0.8); const border = times(sum(0.8, 1.1, 1.3), k); put('l4-010', { q1: k, q2: border, q3: border.mul(4.6) }); }
// level 5
{ const k = ratio(11.2, 14); put('l5-001', { q3: k, q4: times(13, k) }); } // [US] ↔ [QR]; [TU] ↔ [PQ] (drawn 2.6 / 2.6)
{ const k = ratio(10.8, 9); put('l5-002', { q3: k, q4: times(10.5, k) }); } // [DE] ↔ [BC]; [EF] ↔ [CA] (drawn 3 / 3)
{ const k = ratio(11.2, 3.2); const ef = times(2.4, k); put('l5-003', { q1: k, q2: ef, q3: ef.add(1.2) }); }
{ const k = ratio(0.84, 2.1); const per = times(sum(2.1, 2.8, 3.5), k); put('l5-004', { q1: k, q2: times(2.8, k), q3: per, q4: per.mul(12) }); }
{ const k = ratio(24, 40); const per = times(sum(40, 55, 35), k); put('l5-005', { q1: k, q2: times(55, k), q3: times(35, k), q4: per, q5: per.mul(8.5) }); }
{ const k = ratio(25.2, 1.8); const fd = times(hyp(1.8, 2.4), k); put('l5-006', { q1: k, q2: times(2.4, k), q3: fd, q4: fd.mul(4.2) }); }
{ const k = ratio(16, 6.4); const fd = times(10.4, k); put('l5-007', { q1: k, q2: ratio(22, k), q3: fd, q4: sum(16, 22, fd) }); }
{ const k = ratio(0.7, 3.5); const per = times(sum(3.5, 2.5, 4), k); put('l5-008', { q1: k, q2: times(2.5, k), q3: times(2.5, ratio(0.35, 3.5)), q4: sum(per, 0.32).mul(6.5) }); }
{ const k = ratio(4.2, 0.6); put('l5-009', { q1: k, q2: times(0.8, k), q3: times(1, k), q4: times(sum(0.6, 0.8, 1), k).mul(14) }); }
{ const k = q(25); put('l5-010', { q1: times(5.4, k), q2: times(4.2, k).div(100), q3: times(sum(3.6, 5.4, 4.2), k), q4: times(sum(3.6, 5.4, 4.2), k).div(100).mul(12).mul(1.2) }); }

export const ORACLE = E;
