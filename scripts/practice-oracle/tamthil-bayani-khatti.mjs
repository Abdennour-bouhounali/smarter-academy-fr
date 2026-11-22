// Oracle du banc « tamthil-bayani-khatti » (unité 6 « الدالة الخطية والتناسبية », leçon 3), banque BEM du 2026-10-07 :
// chaque réponse RECALCULÉE ici à partir des nombres de l'énoncé (et des deux points qui définissent chaque droite
// de `statement.figure`), sans lire le contenu ni le code testé. Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Arithmétique : les rationnels exacts de helpers.mjs (`q`). Les QCM sont rejoués par le calcul :
//   coef(m, n)                 le coefficient de la droite par O et (m ; n) : n / m
//   at(P, Q, x) / pre(P, Q, y)  lecture graphique sur la droite (PQ) : ordonnée du point d'abscisse x / abscisse du point d'ordonnée y
//   meet(P1, Q1, P2, Q2)       le point d'intersection de deux droites → P(x, y)
//   dir(a)                     options [يصعد, ينزل] → A si a > 0, B si a < 0
//   yn(b)                      options [نعم / تنتمي, لا / لا تنتمي] → A si vrai
//   onLine(a, x, y)            (x ; y) est-il sur y = a·x ?
//   viaO(P, Q)                 la droite (PQ) passe-t-elle par l'origine ?
//   only(flags)                la lettre de l'unique option vraie (erreur s'il y en a zéro ou plusieurs)
//   cheaper(a, b)              options [la première, la seconde] → la moins chère (erreur si égalité)
//   viaOrigin(f0, g0)          options [تمثيل f, تمثيل g, كلاهما] → celui dont l'image de 0 est nulle
import { R, C, P, q } from './helpers.mjs';

const LETTERS = 'ABCD';
const only = (flags, what = 'only') => {
  const hits = flags.map((f, i) => (f ? i : -1)).filter((i) => i >= 0);
  if (hits.length !== 1) throw new Error(`oracle tamthil-bayani-khatti : ${what} — ${hits.length} options justes`);
  return C(LETTERS[hits[0]]);
};
const sign = (v) => { const s = q(v).toString(); return s === '0' ? 0 : s.startsWith('-') ? -1 : 1; };
const coef = (m, n) => q(n).div(q(m));
const onLine = (a, x, y) => q(a).mul(q(x)).sub(q(y)).isZero();
const slope = ([x1, y1], [x2, y2]) => q(y2).sub(q(y1)).div(q(x2).sub(q(x1)));
const at = (A, B, x) => slope(A, B).mul(q(x).sub(q(A[0]))).add(q(A[1]));
const pre = (A, B, y) => q(y).sub(q(A[1])).div(slope(A, B)).add(q(A[0]));
const viaO = (A, B) => at(A, B, 0).isZero();
const meet = (A1, B1, A2, B2) => {
  const m1 = slope(A1, B1); const m2 = slope(A2, B2);
  const p1 = at(A1, B1, 0); const p2 = at(A2, B2, 0);
  const x = p2.sub(p1).div(m1.sub(m2));
  return P(x.toString(), m1.mul(x).add(p1).toString());
};
const dir = (a) => { const s = sign(a); if (s === 0) throw new Error('dir : a = 0'); return C(s > 0 ? 'A' : 'B'); };
const yn = (b) => C(b ? 'A' : 'B');
const cheaper = (a, b) => { const d = q(a).sub(q(b)); if (d.isZero()) throw new Error('cheaper : égalité'); return C(sign(d) < 0 ? 'A' : 'B'); };
const O = [0, 0];
/** options [تمثيل f, تمثيل g, كلاهما] : lequel passe par l'origine ? (f0, g0 = images de 0). */
const viaOrigin = (f0, g0) => { const a = q(f0).isZero(); const b = q(g0).isZero(); return only([a && !b, b && !a, a && b], 'viaOrigin'); };

export const ORACLE = {
  // ── niveau 1 ──
  'ex-4am-tamthil-bayani-khatti-l1-001:q1': R(q('0,5').mul(2)),
  'ex-4am-tamthil-bayani-khatti-l1-002:q1': R(q(3).mul(0)),
  'ex-4am-tamthil-bayani-khatti-l1-002:q2': R(q(3).mul(-2)),
  'ex-4am-tamthil-bayani-khatti-l1-003:q1': R(q(-2).mul(1)),
  'ex-4am-tamthil-bayani-khatti-l1-003:q2': dir(-2),
  'ex-4am-tamthil-bayani-khatti-l1-004:q1': dir(4),
  'ex-4am-tamthil-bayani-khatti-l1-004:q2': dir('-0,5'),
  'ex-4am-tamthil-bayani-khatti-l1-005:q1': R(at([-5, -2], [5, 2], 5)),
  'ex-4am-tamthil-bayani-khatti-l1-005:q2': R(pre([-5, -2], [5, 2], -2)),
  'ex-4am-tamthil-bayani-khatti-l1-006:q1': R(at([-2, -4], [3, 6], 3)),
  'ex-4am-tamthil-bayani-khatti-l1-006:q2': R(coef(3, at([-2, -4], [3, 6], 3))),
  'ex-4am-tamthil-bayani-khatti-l1-007:q1': yn(onLine(2, 3, 6)),
  'ex-4am-tamthil-bayani-khatti-l1-007:q2': yn(onLine(2, 6, 3)),
  'ex-4am-tamthil-bayani-khatti-l1-008:q1': R(q('1,5').mul(2)),
  'ex-4am-tamthil-bayani-khatti-l1-009:q1': R(q(-3)),
  'ex-4am-tamthil-bayani-khatti-l1-009:q2': R(q(-3).mul(-2)),
  'ex-4am-tamthil-bayani-khatti-l1-010:q1': dir('0,2'),
  'ex-4am-tamthil-bayani-khatti-l1-010:q2': R(q(-7).mul(-1)),
  // ── niveau 2 ──
  'ex-4am-tamthil-bayani-khatti-l2-001:q1': R(q('2,5').mul(2)),
  'ex-4am-tamthil-bayani-khatti-l2-001:q2': R(q('2,5').mul(-2)),
  'ex-4am-tamthil-bayani-khatti-l2-002:q1': R(q('0,5').mul(-2)),
  'ex-4am-tamthil-bayani-khatti-l2-002:q2': R(coef(1, '0,5')),
  'ex-4am-tamthil-bayani-khatti-l2-003:q1': R(at([-4, -5], [4, 5], 4)),
  'ex-4am-tamthil-bayani-khatti-l2-003:q2': R(pre([-4, -5], [4, 5], -5)),
  'ex-4am-tamthil-bayani-khatti-l2-003:q3': R(slope([-4, -5], [4, 5])),
  'ex-4am-tamthil-bayani-khatti-l2-004:q1': R(at([-2, 3], [4, -6], -2)),
  'ex-4am-tamthil-bayani-khatti-l2-004:q2': R(slope([-2, 3], [4, -6])),
  'ex-4am-tamthil-bayani-khatti-l2-004:q3': yn(onLine(slope([-2, 3], [4, -6]), -10, 15)),
  'ex-4am-tamthil-bayani-khatti-l2-005:q1': R(coef(4, 10)),
  'ex-4am-tamthil-bayani-khatti-l2-005:q2': dir(coef(4, 10)),
  'ex-4am-tamthil-bayani-khatti-l2-006:q1': R(q(30).mul(12)),
  'ex-4am-tamthil-bayani-khatti-l2-006:q3': yn(onLine(30, 20, 650)),
  'ex-4am-tamthil-bayani-khatti-l2-007:q1': C(onLine('-1,5', 2, 3) ? 'A' : 'B'),
  'ex-4am-tamthil-bayani-khatti-l2-007:q2': C(onLine('-1,5', 2, -3) ? 'A' : 'B'),
  'ex-4am-tamthil-bayani-khatti-l2-007:q3': dir('-1,5'),
  'ex-4am-tamthil-bayani-khatti-l2-008:q1': only(['-0,5', 3, -1].map((a) => sign(a) > 0), 'l2-008 q1'),
  'ex-4am-tamthil-bayani-khatti-l2-008:q2': R(q(-1).mul(4)),
  'ex-4am-tamthil-bayani-khatti-l2-009:q1': R(at(O, [8, 6], 4)),
  'ex-4am-tamthil-bayani-khatti-l2-009:q2': R(pre(O, [8, 6], 6)),
  'ex-4am-tamthil-bayani-khatti-l2-009:q3': R(coef(8, 6)),
  'ex-4am-tamthil-bayani-khatti-l2-010:q1': R(q('-0,8').mul(5)),
  'ex-4am-tamthil-bayani-khatti-l2-010:q3': dir('-0,8'),
  // ── niveau 3 ──
  'ex-4am-tamthil-bayani-khatti-l3-001:q1': R(coef('-2,5', 4)),
  'ex-4am-tamthil-bayani-khatti-l3-001:q2': R(q('2,5').div(coef('-2,5', 4))),
  'ex-4am-tamthil-bayani-khatti-l3-001:q3': dir(coef('-2,5', 4)),
  'ex-4am-tamthil-bayani-khatti-l3-002:q1': R(q('-3/2').mul(2)),
  'ex-4am-tamthil-bayani-khatti-l3-002:q3': R(q(6).div('-3/2')),
  'ex-4am-tamthil-bayani-khatti-l3-003:q1': R(coef('2/7', '-1/3')),
  'ex-4am-tamthil-bayani-khatti-l3-003:q2': R(q(-3).div(coef('2/7', '-1/3'))),
  'ex-4am-tamthil-bayani-khatti-l3-003:q3': dir(coef('2/7', '-1/3')),
  'ex-4am-tamthil-bayani-khatti-l3-004:q1': only([viaO(O, [9, 6]), viaO([0, 8], [9, 2])], 'l3-004 q1'),
  'ex-4am-tamthil-bayani-khatti-l3-004:q2': R(at(O, [9, 6], 3)),
  'ex-4am-tamthil-bayani-khatti-l3-004:q3': R(coef(3, at(O, [9, 6], 3))),
  'ex-4am-tamthil-bayani-khatti-l3-004:q4': meet(O, [9, 6], [0, 8], [9, 2]),
  'ex-4am-tamthil-bayani-khatti-l3-005:q1': yn(onLine('-3,2', 5, 16)),
  'ex-4am-tamthil-bayani-khatti-l3-005:q2': R(onLine(coef(5, 16), 10, 32) ? coef(5, 16) : 'incohérent'),
  'ex-4am-tamthil-bayani-khatti-l3-005:q3': dir(coef(5, 16)),
  'ex-4am-tamthil-bayani-khatti-l3-006:q1': R(at([-4, -2], [4, 2], 4)),
  'ex-4am-tamthil-bayani-khatti-l3-006:q2': R(pre([-2, 4], [2, -4], 4)),
  'ex-4am-tamthil-bayani-khatti-l3-006:q3': only([slope([-4, -2], [4, 2]), slope([-2, 4], [2, -4])].map((a) => sign(a) < 0), 'l3-006 q3'),
  'ex-4am-tamthil-bayani-khatti-l3-006:q4': R(slope([-4, -2], [4, 2])),
  'ex-4am-tamthil-bayani-khatti-l3-006:q5': R(slope([-2, 4], [2, -4])),
  'ex-4am-tamthil-bayani-khatti-l3-007:q1': R(coef('-3/4', '-2/3')),
  'ex-4am-tamthil-bayani-khatti-l3-007:q2': R(coef('-3/4', '-2/3').mul('9/4')),
  'ex-4am-tamthil-bayani-khatti-l3-007:q3': dir(coef('-3/4', '-2/3')),
  // figure : y en centaines de litres, x en minutes
  'ex-4am-tamthil-bayani-khatti-l3-008:q1': R(at(O, [9, 6], 6).mul(100)),
  'ex-4am-tamthil-bayani-khatti-l3-008:q2': R(pre(O, [9, 6], q(600).div(100))),
  'ex-4am-tamthil-bayani-khatti-l3-008:q3': R(coef(9, 6)),
  'ex-4am-tamthil-bayani-khatti-l3-008:q4': R(q(1500).div(100).div(coef(9, 6))),
  // figure : y en centaines de DA
  'ex-4am-tamthil-bayani-khatti-l3-009:q1': R(at(O, [5, 4], '2,5').mul(100)),
  'ex-4am-tamthil-bayani-khatti-l3-009:q2': R(pre(O, [5, 4], q(400).div(100))),
  'ex-4am-tamthil-bayani-khatti-l3-009:q3': yn(viaO(O, [5, 4])),
  'ex-4am-tamthil-bayani-khatti-l3-010:q1': R(coef(400, 80)),
  'ex-4am-tamthil-bayani-khatti-l3-010:q2': R(coef(400, 80).mul(1954)),
  'ex-4am-tamthil-bayani-khatti-l3-010:q3': R(q(10085).div(coef(400, 80))),
  // ── niveau 4 ──
  // figure : unité des ordonnées 100DA ; (D) par O et (8 ; 8), (Δ) par (0 ; 3) et (8 ; 7)
  'ex-4am-tamthil-bayani-khatti-l4-001:q1': only([viaO(O, [8, 8]), viaO([0, 3], [8, 7])], 'l4-001 q1'),
  'ex-4am-tamthil-bayani-khatti-l4-001:q2': R(at(O, [8, 8], 4).mul(100)),
  'ex-4am-tamthil-bayani-khatti-l4-001:q3': R(pre(O, [8, 8], q(700).div(100))),
  'ex-4am-tamthil-bayani-khatti-l4-001:q4': R(q(100)),
  'ex-4am-tamthil-bayani-khatti-l4-001:q5': R(q(meet(O, [8, 8], [0, 3], [8, 7]).x)),
  'ex-4am-tamthil-bayani-khatti-l4-001:q6': cheaper(q(100).mul(10), q(50).mul(10).add(300)),
  'ex-4am-tamthil-bayani-khatti-l4-002:q1': R(coef(2, 5)),
  'ex-4am-tamthil-bayani-khatti-l4-002:q2': yn([[1, 3], [2, 5], [3, 7]].every(([x, y]) => onLine(coef(1, 3), x, y))),
  'ex-4am-tamthil-bayani-khatti-l4-002:q4': R(coef(2, 5).mul(-4)),
  'ex-4am-tamthil-bayani-khatti-l4-003:q1': R(coef('-2/3', '-3/2')),
  // B(√32 ; √162) sur y = a·x (a > 0) ⇔ a²·32 = 162
  'ex-4am-tamthil-bayani-khatti-l4-003:q2': yn(sign(coef('-2/3', '-3/2')) > 0 && coef('-2/3', '-3/2').mul(coef('-2/3', '-3/2')).mul(32).sub(162).isZero()),
  'ex-4am-tamthil-bayani-khatti-l4-003:q3': dir(coef('-2/3', '-3/2')),
  // a = √3 − √2 : f(√3 + √2) = (√3)² − (√2)² ; A′ : (√3 − √2)² = 5 − 2√6, irrationnel, ≠ √3 + √2 (comparaison flottante sûre)
  'ex-4am-tamthil-bayani-khatti-l4-004:q2': R(q(3).sub(2)),
  'ex-4am-tamthil-bayani-khatti-l4-004:q3': yn(Math.abs((Math.sqrt(3) - Math.sqrt(2)) ** 2 - (Math.sqrt(3) + Math.sqrt(2))) < 1e-9),
  'ex-4am-tamthil-bayani-khatti-l4-004:q4': dir(Math.sqrt(3) > Math.sqrt(2) ? 1 : -1),
  // a·2√2 = 4 ⇒ a = √2 ; f(√2) = a·√2 = 2
  'ex-4am-tamthil-bayani-khatti-l4-005:q2': R(q(4).div(2)),
  'ex-4am-tamthil-bayani-khatti-l4-005:q3': dir(1),
  'ex-4am-tamthil-bayani-khatti-l4-006:q2': R(q(4).div('-5/2')),
  'ex-4am-tamthil-bayani-khatti-l4-006:q3': R(q(3).div('-5/2')),
  // −5/2 · x ≤ 3, division par un négatif : x ≥ borne ; options [≤, ≥, >]
  'ex-4am-tamthil-bayani-khatti-l4-006:q4': only(['<=', '>=', '>'].map((rel) => rel === (sign('-5/2') < 0 ? '>=' : '<=')), 'l4-006 q4'),
  'ex-4am-tamthil-bayani-khatti-l4-006:q5': R(q(5).div('-5/2')),
  // (D₁) par O et (4,5 ; 9) ; (D₂) par (0 ; 9) et (8 ; 1)
  'ex-4am-tamthil-bayani-khatti-l4-007:q1': only([viaO(O, ['4,5', 9]), viaO([0, 9], [8, 1])], 'l4-007 q1'),
  'ex-4am-tamthil-bayani-khatti-l4-007:q2': R(at(O, ['4,5', 9], 1)),
  'ex-4am-tamthil-bayani-khatti-l4-007:q3': R(pre(O, ['4,5', 9], 8)),
  'ex-4am-tamthil-bayani-khatti-l4-007:q4': R(slope(O, ['4,5', 9])),
  'ex-4am-tamthil-bayani-khatti-l4-007:q5': meet(O, ['4,5', 9], [0, 9], [8, 1]),
  'ex-4am-tamthil-bayani-khatti-l4-008:q1': C(sign(slope([-3, -2], [3, 2])) > 0 ? 'A' : 'B'),
  'ex-4am-tamthil-bayani-khatti-l4-008:q2': C(sign(slope([-2, 3], [2, -3])) > 0 ? 'A' : 'B'),
  'ex-4am-tamthil-bayani-khatti-l4-008:q3': R(at([-3, -2], [3, 2], 3)),
  'ex-4am-tamthil-bayani-khatti-l4-008:q4': R(pre([-2, 3], [2, -3], 3)),
  'ex-4am-tamthil-bayani-khatti-l4-008:q5': R(slope([-3, -2], [3, 2])),
  'ex-4am-tamthil-bayani-khatti-l4-008:q6': R(slope([-2, 3], [2, -3])),
  'ex-4am-tamthil-bayani-khatti-l4-009:q1': R(q(1500).mul(30)),
  'ex-4am-tamthil-bayani-khatti-l4-009:q2': R(q(60000).div(1500)),
  'ex-4am-tamthil-bayani-khatti-l4-009:q3': viaOrigin(q(1500).mul(0), q(1000).mul(0).add(20000)),
  'ex-4am-tamthil-bayani-khatti-l4-009:q4': yn(onLine(1500, 24, 36000)),
  'ex-4am-tamthil-bayani-khatti-l4-009:q6': cheaper(q(1500).mul(50), q(1000).mul(50).add(20000)),
  'ex-4am-tamthil-bayani-khatti-l4-010:q1': C(onLine(-2, -1, -2) ? 'A' : 'B'),
  'ex-4am-tamthil-bayani-khatti-l4-010:q2': C(onLine(2, -1, -2) ? 'A' : 'B'),
  'ex-4am-tamthil-bayani-khatti-l4-010:q3': only([-2, 2].map((a) => sign(a) > 0), 'l4-010 q3'),
  // ── niveau 5 ──
  // 001 : (D) par O et (8 ; 12), (Δ) par (0 ; 4) et (8 ; 8) ; ordonnées en centaines de DA
  'ex-4am-tamthil-bayani-khatti-l5-001:q1': R(q(150).mul(6)),
  'ex-4am-tamthil-bayani-khatti-l5-001:q2': R(q(50).mul(6).add(400)),
  'ex-4am-tamthil-bayani-khatti-l5-001:q3': R(q(150)),
  'ex-4am-tamthil-bayani-khatti-l5-001:q4': only([viaO(O, [8, 12]), viaO([0, 4], [8, 8])], 'l5-001 q4'),
  'ex-4am-tamthil-bayani-khatti-l5-001:q5': R(pre(O, [8, 12], q(1200).div(100))),
  'ex-4am-tamthil-bayani-khatti-l5-001:q6': R(q(meet(O, [8, 12], [0, 4], [8, 8]).x)),
  'ex-4am-tamthil-bayani-khatti-l5-001:q7': cheaper(q(150).mul(10), q(50).mul(10).add(400)),
  // 002 : g(x) = 1,5x ; f(x) = 12 − 1,5x ; (D) par O et (8 ; 12), (Δ) par (0 ; 12) et (8 ; 0)
  'ex-4am-tamthil-bayani-khatti-l5-002:q1': R(q('1,5').mul(2)),
  'ex-4am-tamthil-bayani-khatti-l5-002:q2': R(q(12).sub(q('1,5').mul(2))),
  'ex-4am-tamthil-bayani-khatti-l5-002:q3': R(q('1,5')),
  'ex-4am-tamthil-bayani-khatti-l5-002:q4': only([viaO(O, [8, 12]), viaO([0, 12], [8, 0])], 'l5-002 q4'),
  'ex-4am-tamthil-bayani-khatti-l5-002:q5': R(pre(O, [8, 12], 9)),
  'ex-4am-tamthil-bayani-khatti-l5-002:q6': R(q(12).div(q('1,5').add('1,5'))),
  // 003 : (D) par O et (5 ; 10), ordonnées en centaines de DA
  'ex-4am-tamthil-bayani-khatti-l5-003:q1': R(q(200).mul(4)),
  'ex-4am-tamthil-bayani-khatti-l5-003:q2': R(q(50).mul(4).add(300)),
  'ex-4am-tamthil-bayani-khatti-l5-003:q3': R(at(O, [5, 10], 3).mul(100)),
  'ex-4am-tamthil-bayani-khatti-l5-003:q4': R(pre(O, [5, 10], q(1000).div(100))),
  'ex-4am-tamthil-bayani-khatti-l5-003:q5': R(coef(5, 10)),
  'ex-4am-tamthil-bayani-khatti-l5-003:q7': R(q(3).div(q(2).sub('0,5'))),
  'ex-4am-tamthil-bayani-khatti-l5-003:q8': cheaper(q(200).mul(7), q(50).mul(7).add(300)),
  // 004 : f(x) = AB·x/2 avec AB = 8 ; g(x) = 24 − 4x (aire totale 8·6/2 = 24)
  'ex-4am-tamthil-bayani-khatti-l5-004:q1': R(q(8).mul(2).div(2)),
  'ex-4am-tamthil-bayani-khatti-l5-004:q4': yn(onLine(q(8).div(2), '4,5', 18)),
  'ex-4am-tamthil-bayani-khatti-l5-004:q5': dir(q(8).div(2)),
  // 4x = 2(24 − 4x) ⇔ 12x = 48
  'ex-4am-tamthil-bayani-khatti-l5-004:q6': R(q(2).mul(q(8).mul(6).div(2)).div(q(4).add(8))),
  // 005 : (D) par O et (10 ; −6), x en centaines de mètres
  'ex-4am-tamthil-bayani-khatti-l5-005:q1': R(at(O, [10, -6], q(500).div(100))),
  'ex-4am-tamthil-bayani-khatti-l5-005:q2': R(pre(O, [10, -6], -6).mul(100)),
  'ex-4am-tamthil-bayani-khatti-l5-005:q3': R(coef(10, -6)),
  'ex-4am-tamthil-bayani-khatti-l5-005:q5': R(coef(10, -6).mul(q(1300).div(100))),
  'ex-4am-tamthil-bayani-khatti-l5-005:q6': R(q(15).add(coef(10, -6).mul(13))),
  // 006 : (D) par O et (12 ; −6), (Δ) par (0 ; −8) et (12 ; −2)
  'ex-4am-tamthil-bayani-khatti-l5-006:q1': only([viaO(O, [12, -6]), viaO([0, -8], [12, -2])], 'l5-006 q1'),
  'ex-4am-tamthil-bayani-khatti-l5-006:q2': R(at(O, [12, -6], 6)),
  'ex-4am-tamthil-bayani-khatti-l5-006:q3': R(pre(O, [12, -6], -5)),
  'ex-4am-tamthil-bayani-khatti-l5-006:q4': R(coef(12, -6)),
  'ex-4am-tamthil-bayani-khatti-l5-006:q6': meet(O, [12, -6], [0, -8], [12, -2]),
  'ex-4am-tamthil-bayani-khatti-l5-006:q7': R(pre([0, -8], [12, -2], 0)),
  // 007 : (D₁) par O et (10 ; 5), (D₂) par (0 ; 2) et (12 ; 5)
  'ex-4am-tamthil-bayani-khatti-l5-007:q1': only([viaO(O, [10, 5]), viaO([0, 2], [12, 5])], 'l5-007 q1'),
  'ex-4am-tamthil-bayani-khatti-l5-007:q2': R(at(O, [10, 5], 6)),
  'ex-4am-tamthil-bayani-khatti-l5-007:q3': R(pre(O, [10, 5], 2)),
  'ex-4am-tamthil-bayani-khatti-l5-007:q4': R(coef(10, 5)),
  'ex-4am-tamthil-bayani-khatti-l5-007:q5': meet(O, [10, 5], [0, 2], [12, 5]),
  'ex-4am-tamthil-bayani-khatti-l5-007:q6': R(coef(10, 5).mul(60)),
  // 008 : (D) par O et (8 ; 6), ordonnées en dizaines de m³
  'ex-4am-tamthil-bayani-khatti-l5-008:q1': R(at(O, [8, 6], 4).mul(10)),
  'ex-4am-tamthil-bayani-khatti-l5-008:q2': R(pre(O, [8, 6], q(60).div(10))),
  'ex-4am-tamthil-bayani-khatti-l5-008:q3': R(coef(8, 6)),
  'ex-4am-tamthil-bayani-khatti-l5-008:q4': R(q('12,5').div(10)),
  'ex-4am-tamthil-bayani-khatti-l5-008:q6': R(q(90).div(10).div(coef(8, 6).add(q('12,5').div(10)))),
  // 009 : (D) par O et (10 ; 6), (Δ) par (0 ; 1) et (10 ; 5) ; ordonnées en milliers de DA
  'ex-4am-tamthil-bayani-khatti-l5-009:q1': R(q(600).mul(15)),
  'ex-4am-tamthil-bayani-khatti-l5-009:q2': R(q(400).mul(15).add(1000)),
  'ex-4am-tamthil-bayani-khatti-l5-009:q3': only([viaO(O, [10, 6]), viaO([0, 1], [10, 5])], 'l5-009 q3'),
  'ex-4am-tamthil-bayani-khatti-l5-009:q4': R(pre(O, [10, 6], q(6000).div(1000))),
  'ex-4am-tamthil-bayani-khatti-l5-009:q5': R(coef(10, 6)),
  'ex-4am-tamthil-bayani-khatti-l5-009:q6': R(q(meet(O, [10, 6], [0, 1], [10, 5]).x)),
  'ex-4am-tamthil-bayani-khatti-l5-009:q7': cheaper(q(600).mul(25), q(400).mul(25).add(1000)),
  // 010 : f(x) = 250x ; g(x) = 150x + 400
  'ex-4am-tamthil-bayani-khatti-l5-010:q1': R(q(250).mul(6)),
  'ex-4am-tamthil-bayani-khatti-l5-010:q2': R(q(150).mul(6).add(400)),
  'ex-4am-tamthil-bayani-khatti-l5-010:q3': R(q(250)),
  'ex-4am-tamthil-bayani-khatti-l5-010:q5': yn(onLine(250, 12, 3000)),
  'ex-4am-tamthil-bayani-khatti-l5-010:q6': viaOrigin(q(250).mul(0), q(150).mul(0).add(400)),
  'ex-4am-tamthil-bayani-khatti-l5-010:q7': cheaper(q(250).mul(3), q(150).mul(3).add(400)),
};
