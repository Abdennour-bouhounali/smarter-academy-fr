// Oracle du banc « dala-khattiya » au format BEM (unité 6 « الدالة الخطية والتناسبية », leçon 2
// « مفهوم وتعيين الدالة الخطية », banque réécrite le 2026-10-07) — chaque réponse RECALCULÉE ici à partir des
// nombres de l'énoncé, sans lire le contenu ni le code testé. Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Outils (rationnels exacts de helpers.mjs, jamais de flottants) :
//   img(a, m)              l'image f(m) = a·m par la dimension linéaire de coefficient a
//   coefOf(m, n)           le coefficient a tel que a·m = n (m ≠ 0) : « عيّن الدالة الخطية »
//   ante(a, n)             le nombre x tel que a·x = n : « العدد الذي صورته n »
//   aff(a, b, x)           a·x + b : un tarif « prix unitaire + montant fixe » (étapes hors leçon, counted:false)
//   solveAff(a, b, y)      x tel que a·x + b = y ; meet(a1, b1, a2, b2) : x tel que a1·x + b1 = a2·x + b2
//   pct(t)                 t/100 ; isLinear({a, b, sq})  la fonction x ⟼ a·x + b (+ sq·x²) est-elle linéaire ?
//   yes(b)                 « هل … ؟ » : A = نعم, B = لا ; pickFirst(flags) / cheapest(montants) : l'option unique A, B, C…
//   gtLetter(a)            sens de a·x > c parmi A: x < k, B: ≤, C: x > k, D: ≥ (a > 0 → C)
import { R, C, q } from './helpers.mjs';

const LETTERS = 'ABCDEF';
const s = (v) => q(v).toString();
const img = (a, m) => q(a).mul(q(m)).toString();
const coefOf = (m, n) => { if (q(m).isZero()) throw new Error('oracle dala-khattiya : m = 0'); return q(n).div(q(m)).toString(); };
const ante = (a, n) => q(n).div(q(a)).toString();
const aff = (a, b, x) => q(a).mul(q(x)).add(q(b)).toString();
const solveAff = (a, b, y) => q(y).sub(q(b)).div(q(a)).toString();
const meet = (a1, b1, a2, b2) => q(b2).sub(q(b1)).div(q(a1).sub(q(a2))).toString();
const pct = (t) => q(t).div(100);
const isLinear = ({ a = 0, b = 0, sq = 0 }) => q(b).isZero() && q(sq).isZero() && !q(a).isZero();
const yes = (b) => C(b ? 'A' : 'B');
function pickFirst(flags) {
  const hits = flags.map((f, i) => (f ? i : -1)).filter((i) => i >= 0);
  if (hits.length !== 1) throw new Error(`oracle dala-khattiya : ${hits.length} options vraies`);
  return LETTERS[hits[0]];
}
const lt = (x, y) => q(x).sub(q(y)).n < 0n;
const eqQ = (x, y) => q(x).sub(q(y)).isZero();
function cheapest(amounts) {
  const best = amounts.reduce((m, x) => (lt(x, m) ? x : m), amounts[0]);
  return pickFirst(amounts.map((x) => eqQ(x, best)));
}
const gtLetter = (a) => (q(a).n > 0n ? 'C' : 'A');

const K = (k) => `ex-4am-dala-khattiya-${k}`;

// Les fonctions des énoncés (a·x + b + sq·x² ; π et √2 remplacés par des stand-ins non nuls : seule la forme compte).
const PI = '355/113';
const L1001 = [{ a: img(3, PI) }, { a: 3, b: '1414/1000' }, { sq: 1 }];
const L1002 = [{ a: 80 }, { a: 4, b: -3 }, { sq: 1 }];
const L1005 = [{ a: 1, b: 6 }, { a: 6 }, { sq: 6 }, { a: 6, b: -1 }];
const L3010 = [{ a: 1, b: '-0.5' }, { sq: 1, b: 1 }, { a: '-0.5' }];

// l4-004 — التسعيرتان (120x ؛ 90x + 600)
const P1 = 120, P2 = [90, 600];
// l4-009 — الصهريج 6000L ، 40L/min
const FLOW = 40, CAP = 6000;
// l5-001 — الصيغ (أ) 350x ، (ب) 250x + 1000 ، (ج) 150x + 2500
const SA = [350, 0], SB = [250, 1000], SC = [150, 2500];
// l5-002 — رسم 19% ثم تخفيض 10%
const TVA = q(1).add(pct(19));
const DISC = q(1).sub(pct(10));
// l5-003 — 36km في 2h ، رياض : 24t − 24
const SPEED = coefOf(2, 36);
// l5-004 — 80x ، 40x + 1200 ، 3000
const O1 = 80, O2 = [40, 1200], O3 = 3000;
// l5-005 — 600000DA ، طاولة 7500DA ، مصاريف 20%
const BUDGET = 600000, TABLE = 7500;
const EXP = q(BUDGET).mul(pct(20)).toString();
// l5-006 — 90x ، 70x + 1000
const M1 = 90, M2 = [70, 1000];
// l5-007 — 2500x ، 1800x + 3500 ، 12000
const V1 = 2500, V2 = [1800, 3500], V3 = 12000;
// l5-008 — 25x ، 15x + 300
const B1 = 25, B2 = [15, 300];
// l5-009 — مستطيل 30m × 20m ، f(x) = 20x/2
const fArea = (x) => q(x).mul(20).div(2).toString();
const RECT = 30 * 20;
// l5-010 — 60x ، 45x + 2400
const T1 = 60, T2 = [45, 2400];

export const ORACLE = {
  // ── niveau 1 ──
  [K('l1-001:q1')]: yes(isLinear(L1001[0])),
  [K('l1-001:q2')]: yes(isLinear(L1001[1])),
  [K('l1-001:q3')]: yes(isLinear(L1001[2])),
  [K('l1-002:q1')]: C(pickFirst(L1002.map(isLinear))),
  [K('l1-002:q2')]: R(img(80, 3)),
  [K('l1-003:q1')]: R(img(4, 7)),
  [K('l1-003:q2')]: R(img(4, -5)),
  [K('l1-004:q1')]: R(img(-3, 6)),
  [K('l1-004:q2')]: R(img(-3, -4)),
  [K('l1-005:q1')]: C(pickFirst(L1005.map(isLinear))),
  [K('l1-005:q2')]: R(img(6, '-2.5')),
  [K('l1-006:q1')]: R(coefOf(1, 9)),
  [K('l1-006:q2')]: R(img(coefOf(1, 9), 4)),
  [K('l1-007:q1')]: R(coefOf(5, 35)),
  [K('l1-007:q2')]: R(img(coefOf(5, 35), -2)),
  [K('l1-008:q1')]: R(ante(5, 40)),
  [K('l1-008:q2')]: R(img(5, '1.2')),
  [K('l1-009:q1')]: R(coefOf(2, 8)),
  [K('l1-009:q2')]: R(img(coefOf(3, 12), 7)),
  [K('l1-010:q1')]: R(img('0.5', 6400)),
  [K('l1-010:q2')]: R(ante('0.5', 2750)),
  // ── niveau 2 ──
  [K('l2-001:q1')]: R(img(-3, '-1.5')),
  [K('l2-001:q2')]: R(img(-3, '0.5')),
  [K('l2-001:q3')]: R(ante(-3, 6)),
  [K('l2-001:q4')]: R(coefOf('-1.5', img(-3, '-1.5'))),
  [K('l2-002:q1')]: R(img('2.1', 4)),
  [K('l2-002:q2')]: R(ante('2.1', '-10.5')),
  [K('l2-003:q1')]: R(img(5, 12)),
  [K('l2-003:q2')]: R(ante(5, 140)),
  [K('l2-003:q3')]: R(img(5, 45)),
  [K('l2-003:q4')]: R(coefOf(12, img(5, 12))),
  [K('l2-004:q1')]: R(coefOf(-2, 3)),
  [K('l2-004:q2')]: R(img(coefOf(4, -6), 10)),
  [K('l2-005:q1')]: R(coefOf(-4, 10)),
  [K('l2-005:q2')]: R(img(coefOf(-4, 10), 2)),
  [K('l2-006:q1')]: R(ante(-4, 18)),
  [K('l2-006:q2')]: R(img(-4, '2.5')),
  [K('l2-007:q1')]: R(s(q(1).sub(pct(30)))),
  [K('l2-007:q2')]: R(img(q(1).sub(pct(30)), 64000)),
  [K('l2-008:q1')]: R(coefOf(6, 4)),
  [K('l2-008:q2')]: R(img(coefOf(6, 4), 345)),
  [K('l2-009:q1')]: R(img('7.5', 4)),
  [K('l2-009:q2')]: R(ante('7.5', 45)),
  [K('l2-010:q1')]: R(img(6, '12.5')),
  [K('l2-010:q2')]: R(ante(6, 99)),
  // ── niveau 3 ──
  [K('l3-001:q1')]: R(coefOf(-2, 6)),
  [K('l3-001:q2')]: R(img(coefOf(-2, 6), 5)),
  [K('l3-001:q3')]: R(ante(coefOf(-2, 6), 21)),
  [K('l3-002:q1')]: R(s(q(1).sub(pct(20)))),
  [K('l3-002:q2')]: R(img(q(1).sub(pct(20)), 120)),
  [K('l3-002:q3')]: R(ante(q(1).sub(pct(20)), 6)),
  [K('l3-003:q1')]: R(img('0.8', 50)),
  [K('l3-003:q2')]: R(ante('0.8', '1.4')),
  [K('l3-003:q3')]: R(img('0.8', 2500)),
  [K('l3-003:q4')]: R(ante('0.8', 1440)),
  [K('l3-004:q1')]: R(coefOf(8, 3)),
  [K('l3-004:q2')]: yes(eqQ(img(coefOf(8, 3), 26), 10)),
  [K('l3-004:q3')]: R(ante(coefOf(8, 3), 6)),
  [K('l3-005:q1')]: R(coefOf(6, -4)),
  [K('l3-005:q2')]: R(img(coefOf(6, -4), 9)),
  [K('l3-005:q3')]: R(ante(coefOf(6, -4), 10)),
  [K('l3-006:q1')]: R(coefOf(-5, -2)),
  [K('l3-006:q2')]: R(ante(coefOf(-5, -2), 7)),
  [K('l3-006:q3')]: R(img(coefOf(-5, -2), '-12.5')),
  [K('l3-007:q1')]: R(coefOf('0.5', '0.7')),
  [K('l3-007:q2')]: R(img(coefOf(2, '2.8'), 15)),
  [K('l3-007:q3')]: R(ante(coefOf(3, '4.2'), '9.8')),
  [K('l3-008:q1')]: R(coefOf(4, 340)),
  [K('l3-008:q2')]: R(img(coefOf(4, 340), 10)),
  [K('l3-008:q3')]: R(ante(coefOf(4, 340), 1105)),
  [K('l3-009:q1')]: R(coefOf(1, q(8).mul(1).div(2))), // aire ABM = AB·BM/2, AB = 8
  [K('l3-009:q2')]: R(s(q(8).mul('2.5').div(2))),
  [K('l3-009:q3')]: R(ante(q(8).div(2), 18)),
  [K('l3-010:q1')]: C(pickFirst(L3010.map(isLinear))),
  [K('l3-010:q2')]: R(img('-0.5', -12)),
  [K('l3-010:q3')]: R(ante('-0.5', -4)),
  // ── niveau 4 ──
  [K('l4-001:q1')]: R(coefOf(2500, 2400)),
  [K('l4-001:q2')]: R(s(q(1).sub(coefOf(2500, 2400)).mul(100))),
  [K('l4-001:q3')]: R(img(coefOf(2500, 2400), 1750)),
  [K('l4-002:q1')]: R(coefOf('-2/3', '-3/5')),
  [K('l4-002:q2')]: R(img(coefOf('-2/3', '-3/5'), 5)),
  [K('l4-002:q3')]: R(ante(coefOf('-2/3', '-3/5'), '-1.8')),
  [K('l4-003:q1')]: R(img('2.1', -3)),
  [K('l4-003:q2')]: R(ante('2.1', 0)),
  [K('l4-003:q3')]: R(ante('2.1', '14.7')),
  [K('l4-003:q4')]: R(ante('2.1', '-2.1')),
  [K('l4-003:q5')]: R(s(q(img('2.1', -3)).add(q(img('2.1', 7))))),
  [K('l4-004:q1')]: R(img(P1, 5)),
  [K('l4-004:q2')]: R(aff(P2[0], P2[1], 5)),
  [K('l4-004:q3')]: R(ante(P1, 1440)),
  [K('l4-004:q4')]: R(aff(P2[0], P2[1], ante(P1, 1440))),
  [K('l4-004:q5')]: R(coefOf(5, img(P1, 5))),
  [K('l4-004:q6')]: yes(isLinear({ a: P2[0], b: P2[1] })),
  [K('l4-004:q7')]: R(meet(P1, 0, P2[0], P2[1])),
  [K('l4-004:q8')]: C(gtLetter(q(P1).sub(P2[0]))),
  [K('l4-004:q9')]: C(cheapest([img(P1, 30), aff(P2[0], P2[1], 30)])),
  [K('l4-005:q1')]: R(coefOf(8, 14)),
  [K('l4-005:q2')]: R(img(coefOf(8, 14), 12)),
  [K('l4-005:q3')]: R(ante(coefOf(8, 14), -35)),
  [K('l4-006:q1')]: R(s(q(1).add(pct(15)))),
  [K('l4-006:q2')]: R(img(q(1).add(pct(15)), 800)),
  [K('l4-006:q3')]: R(ante(q(1).add(pct(15)), 1035)),
  [K('l4-007:q1')]: R(coefOf('4/5', -2)),
  [K('l4-007:q2')]: R(ante(coefOf('4/5', -2), 10)),
  [K('l4-007:q3')]: R(img(coefOf('4/5', -2), '-1.2')),
  [K('l4-008:q1')]: R(3), // A(4 ; 3) sur la figure : f(4) = ordonnée de A
  [K('l4-008:q2')]: R(coefOf(4, 3)),
  [K('l4-008:q3')]: R(img(coefOf(4, 3), -8)),
  [K('l4-008:q4')]: R(ante(coefOf(4, 3), '4.5')),
  [K('l4-009:q1')]: R(img(FLOW, 25)),
  [K('l4-009:q2')]: R(aff(-FLOW, CAP, 25)),
  [K('l4-009:q3')]: R(coefOf(25, img(FLOW, 25))),
  [K('l4-009:q4')]: yes(isLinear({ a: -FLOW, b: CAP })),
  [K('l4-009:q5')]: R(ante(FLOW, CAP)),
  [K('l4-009:q6')]: R(meet(-FLOW, CAP, FLOW, 0)),
  [K('l4-010:q1')]: R(s(q(1).sub(pct(35)))),
  [K('l4-010:q2')]: R(img(q(1).sub(pct(35)), 4200)),
  [K('l4-010:q3')]: R(ante(q(1).sub(pct(35)), 1690)),
  // ── niveau 5 ──
  [K('l5-001:q1')]: R(aff(SA[0], SA[1], 12)),
  [K('l5-001:q2')]: R(aff(SB[0], SB[1], 12)),
  [K('l5-001:q3')]: R(aff(SC[0], SC[1], 12)),
  [K('l5-001:q4')]: R(coefOf(12, aff(SA[0], SA[1], 12))),
  [K('l5-001:q5')]: C(pickFirst([SA, SB, SC].map(([a, b]) => isLinear({ a, b })))),
  [K('l5-001:q7')]: R(meet(SA[0], SA[1], SB[0], SB[1])),
  [K('l5-001:q8')]: C(cheapest([SA, SB, SC].map(([a, b]) => aff(a, b, 8)))),
  [K('l5-002:q2')]: R(img(TVA, 18000)),
  [K('l5-002:q3')]: R(ante(TVA, 26180)),
  [K('l5-002:q4')]: R(s(TVA.mul(DISC))),
  [K('l5-002:q5')]: R(s(q(img(TVA.mul(DISC), 18000)).mul(4))),
  [K('l5-003:q1')]: R(SPEED),
  [K('l5-003:q2')]: R(img(SPEED, '3.5')),
  [K('l5-003:q3')]: R(ante(SPEED, 81)),
  [K('l5-003:q4')]: yes(isLinear({ a: 24, b: -24 })),
  [K('l5-003:q5')]: R(meet(24, -24, SPEED, 0)),
  [K('l5-003:q6')]: R(img(SPEED, meet(24, -24, SPEED, 0))),
  [K('l5-004:q1')]: R(img(O1, 10)),
  [K('l5-004:q2')]: R(aff(O2[0], O2[1], 10)),
  [K('l5-004:q3')]: R(ante(O1, 1840)),
  [K('l5-004:q4')]: R(aff(O2[0], O2[1], ante(O1, 1840))),
  [K('l5-004:q5')]: R(coefOf(10, img(O1, 10))),
  [K('l5-004:q6')]: C(pickFirst([{ a: O1 }, { a: O2[0], b: O2[1] }, { b: O3 }].map(isLinear))),
  [K('l5-004:q8')]: C(cheapest([img(O1, 26), aff(O2[0], O2[1], 26), O3])),
  [K('l5-005:q1')]: R(coefOf(1, TABLE)),
  [K('l5-005:q2')]: R(img(TABLE, 12)),
  [K('l5-005:q3')]: R(EXP),
  [K('l5-005:q4')]: R(ante(TABLE, q(BUDGET).sub(EXP))),
  [K('l5-005:q5')]: C(lt(q(img(TABLE, 60)).add(EXP), BUDGET) ? 'A' : 'B'),
  [K('l5-005:q6')]: R(s(q(BUDGET).sub(EXP).sub(img(TABLE, 60)))),
  [K('l5-006:q1')]: R(img(M1, 20)),
  [K('l5-006:q2')]: R(aff(M2[0], M2[1], 20)),
  [K('l5-006:q3')]: R(ante(M1, 3600)),
  [K('l5-006:q4')]: R(aff(M2[0], M2[1], ante(M1, 3600))),
  [K('l5-006:q5')]: R(coefOf(20, img(M1, 20))),
  [K('l5-006:q6')]: yes(isLinear({ a: M2[0], b: M2[1] })),
  [K('l5-006:q7')]: R(meet(M1, 0, M2[0], M2[1])),
  [K('l5-006:q8')]: C(cheapest([img(M1, 60), aff(M2[0], M2[1], 60)])),
  [K('l5-007:q1')]: R(img(V1, 6)),
  [K('l5-007:q2')]: R(aff(V2[0], V2[1], 6)),
  [K('l5-007:q3')]: C(cheapest([img(V1, 6), aff(V2[0], V2[1], 6), V3])),
  [K('l5-007:q4')]: R(coefOf(6, img(V1, 6))),
  [K('l5-007:q5')]: C(pickFirst([{ a: V1 }, { a: V2[0], b: V2[1] }, { b: V3 }].map(isLinear))),
  [K('l5-007:q7')]: R(meet(V1, 0, V2[0], V2[1])),
  [K('l5-008:q1')]: R(img(B1, 20)),
  [K('l5-008:q2')]: R(aff(B2[0], B2[1], 20)),
  [K('l5-008:q3')]: R(ante(B1, 1000)),
  [K('l5-008:q4')]: R(aff(B2[0], B2[1], ante(B1, 1000))),
  [K('l5-008:q5')]: R(coefOf(20, img(B1, 20))),
  [K('l5-008:q6')]: yes(isLinear({ a: B2[0], b: B2[1] })),
  [K('l5-008:q7')]: R(ante(B1, 1200)),
  [K('l5-008:q8')]: R(solveAff(B2[0], B2[1], 1200)),
  // le plus de pains pour 1200DA : l'offre qui en donne le plus
  [K('l5-008:q9')]: C(lt(ante(B1, 1200), solveAff(B2[0], B2[1], 1200)) ? 'B' : 'A'),
  [K('l5-009:q1')]: R(fArea(12)),
  [K('l5-009:q2')]: R(coefOf(12, fArea(12))),
  [K('l5-009:q3')]: yes(isLinear({ a: -10, b: RECT })),
  [K('l5-009:q4')]: R(ante(coefOf(1, fArea(1)), 150)),
  [K('l5-009:q5')]: R(meet(q(-1).mul(fArea(1)).toString(), RECT, q(2).mul(fArea(1)).toString(), 0)),
  [K('l5-010:q1')]: R(img(T1, 50)),
  [K('l5-010:q2')]: R(aff(T2[0], T2[1], 50)),
  [K('l5-010:q3')]: R(ante(T1, 6000)),
  [K('l5-010:q4')]: R(aff(T2[0], T2[1], ante(T1, 6000))),
  [K('l5-010:q5')]: R(coefOf(50, img(T1, 50))),
  [K('l5-010:q6')]: R(meet(T1, 0, T2[0], T2[1])),
  [K('l5-010:q7')]: C(gtLetter(q(T1).sub(T2[0]))),
  [K('l5-010:q8')]: C(cheapest([img(T1, 120), aff(T2[0], T2[1], 120)])),
};
