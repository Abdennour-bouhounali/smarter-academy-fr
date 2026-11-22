// Oracle du banc « mafhum-taalufiya » au format BEM (unité 7 « الدالة التآلفية », banque réécrite le 2026-10-07) —
// chaque réponse RECALCULÉE ici à partir des nombres de l'énoncé, en rationnels exacts (helpers.mjs), sans lire le
// contenu ni le code testé. Fusionné dans scripts/practice-answer-oracle.test.mjs.
// Les étapes « مثّل بيانيا » / « بيّن أن » (selfCheck) n'ont pas de clé ; les questions fermées (choice) en ont une, calculée.
//
// Outils :
//   img(a, b, x)       l'image a·x + b
//   pre(a, b, m)       le nombre dont l'image est m : (m − b) ÷ a (le programme inverse)
//   lin(a, x)          l'image par la fonction linéaire x ↦ a·x
//   meet(a1, b1, a2, b2)  l'abscisse où a1·x + b1 = a2·x + b2 (étapes counted:false)
//   ceilInt(v)         le plus petit entier ≥ v (« أقل عدد … » : inéquation, counted:false)
//   isAffine(fn)       vrai si les taux d'accroissement de fn entre 1, 2, 4 et 5 sont égaux (test indépendant de l'écriture)
//   yes(b)             « هل … ؟ » : A = نعم, B = لا
//   kindOf(a, b)       « ما نوع الدالة ؟ » : A = خطية (b = 0, a ≠ 0), B = ثابتة (a = 0), C = تآلفية ليست خطية ولا ثابتة
//   cheapest([…])      la lettre (A, B, C…) du plus petit montant (égalité → erreur)
//   onGrid(v, u)       une lecture graphique : v ÷ u doit être un entier (nœud du quadrillage), sinon erreur
import { R, C, q } from './helpers.mjs';

const img = (a, b, x) => q(a).mul(q(x)).add(q(b));
const pre = (a, b, m) => q(m).sub(q(b)).div(q(a));
const lin = (a, x) => q(a).mul(q(x));
const meet = (a1, b1, a2, b2) => q(b2).sub(q(b1)).div(q(a1).sub(q(a2)));
const ceilInt = (v) => { const x = q(v); const n = x.n / x.d; return String(x.n % x.d === 0n ? n : (x.n > 0n ? n + 1n : n)); };
const cmp = (u, v) => { const d = q(u).sub(q(v)); return d.n === 0n ? 0 : (d.n > 0n ? 1 : -1); };
const LETTERS = 'ABCDE';
const yes = (b) => C(b ? 'A' : 'B');
const kindOf = (a, b) => {
  if (q(a).n === 0n) return C('B');
  return C(q(b).n === 0n ? 'A' : 'C');
};
function cheapest(amounts) {
  let best = 0;
  amounts.forEach((v, i) => { if (cmp(v, amounts[best]) < 0) best = i; });
  if (amounts.some((v, i) => i !== best && cmp(v, amounts[best]) === 0)) throw new Error('cheapest: égalité');
  return C(LETTERS[best]);
}
function isAffine(fn) {
  const xs = [1, 2, 4, 5].map((x) => q(x));
  const rate = (u, v) => fn(v).sub(fn(u)).div(v.sub(u));
  const r0 = rate(xs[0], xs[1]);
  return [rate(xs[1], xs[2]), rate(xs[2], xs[3])].every((r) => cmp(r, r0) === 0);
}
const onGrid = (v, u) => { const k = q(v).div(q(u)); if (k.d !== 1n) throw new Error(`lecture hors nœud : ${v}`); return q(v); };
const affineSet = (fns) => ({ value: fns.map((fn, i) => (isAffine(fn) ? i + 1 : null)).filter((n) => n !== null).join(', ') });

// Les six fonctions de نشاط 2 (l3-002) : f1 = 3x² + 1, f2 = −2x + 1, f3 = 5x, f4 = x/2 − 1, f5 = 2 + 3x, f6 = 1/x − 3.
const SIX = [
  (x) => q(3).mul(x).mul(x).add(1),
  (x) => img(-2, 1, x),
  (x) => lin(5, x),
  (x) => x.div(2).sub(1),
  (x) => q(2).add(q(3).mul(x)),
  (x) => q(1).div(x).sub(3),
];
const u = (x) => q(3).mul(q(x)).mul(q(x)).add(1); // l3-003
const v = (x) => q(1).div(q(x)).sub(3); // l4-002

const ID = (s) => `ex-4am-mafhum-taalufiya-${s}`;
export const ORACLE = {
  // ── Niveau 1 ──
  [`${ID('l1-001')}:q1`]: R(img(185, 35000, 10)),
  [`${ID('l1-002')}:q1`]: R(img(185, 35000, 5)),
  [`${ID('l1-002')}:q2`]: R(img(185, 35000, 8)),
  [`${ID('l1-003')}:q1`]: R(q(185)),
  [`${ID('l1-003')}:q2`]: R(q(35000)),
  [`${ID('l1-004')}:q1`]: R(q(-2)),
  [`${ID('l1-004')}:q2`]: R(q(1)),
  [`${ID('l1-005')}:q1`]: yes(true), // 5x = 5x + 0
  [`${ID('l1-006')}:q1`]: R(img(3, 2, 4)),
  [`${ID('l1-006')}:q2`]: R(img(3, 2, 0)),
  [`${ID('l1-007')}:q1`]: R(q(40)),
  [`${ID('l1-007')}:q2`]: R(q(100)),
  [`${ID('l1-007')}:q3`]: R(img(40, 100, 5)),
  [`${ID('l1-008')}:q1`]: yes(isAffine((x) => img(2, 5, x))),
  [`${ID('l1-008')}:q2`]: yes(isAffine((x) => x.mul(x).add(5))),
  [`${ID('l1-008')}:q3`]: yes(isAffine((x) => q(1).div(x).add(5))),
  [`${ID('l1-009')}:q1`]: R(pre(2, 6, 10)),
  [`${ID('l1-010')}:q1`]: kindOf(0, 9),
  [`${ID('l1-010')}:q2`]: R(img(0, 9, -4)),

  // ── Niveau 2 ──
  [`${ID('l2-001')}:q1`]: R(img(185, 35000, 12)),
  [`${ID('l2-001')}:q2`]: R(img(185, 35000, 15)),
  [`${ID('l2-001')}:q3`]: yes(cmp(img(185, 35000, 12).div(12), img(185, 35000, 15).div(15)) === 0),
  [`${ID('l2-002')}:q1`]: R(q(3)),
  [`${ID('l2-002')}:q2`]: R(q(2)),
  [`${ID('l2-002')}:q3`]: R(img(3, 2, -4)),
  [`${ID('l2-003')}:q1`]: R(q(1).div(2)),
  [`${ID('l2-003')}:q2`]: R(q(-1)),
  [`${ID('l2-003')}:q3`]: R(pre('1/2', -1, 3)),
  [`${ID('l2-004')}:q1`]: R(q('1/3').add(1)),
  [`${ID('l2-004')}:q2`]: R(q(1).add(2)),
  [`${ID('l2-004')}:q3`]: yes(q(1).add(2).n === 0n),
  [`${ID('l2-005')}:q1`]: R(img(6, -5, 2)),
  [`${ID('l2-005')}:q2`]: R(pre(6, -5, 25)),
  [`${ID('l2-006')}:q1`]: R(img(-2, 5, 3)),
  [`${ID('l2-006')}:q2`]: R(img(-2, 5, -1)),
  [`${ID('l2-006')}:q3`]: R(pre(-2, 5, 11)),
  [`${ID('l2-007')}:q1`]: R(img(3, -8, 1)),
  [`${ID('l2-007')}:q2`]: R(pre(3, -8, 10)),
  [`${ID('l2-008')}:q1`]: R(img(50, 500, 8)),
  [`${ID('l2-008')}:q2`]: R(pre(50, 500, 1000)),
  [`${ID('l2-009')}:q1`]: kindOf(-7, 0),
  [`${ID('l2-009')}:q2`]: R(lin(-7, -3)),
  [`${ID('l2-010')}:q1`]: R(pre(3, -4, 5)),
  [`${ID('l2-010')}:q2`]: R(img(3, -4, -1)),
  [`${ID('l2-010')}:q3`]: yes(cmp(img(3, -4, 2), 3) === 0),

  // ── Niveau 3 ──
  [`${ID('l3-001')}:q1`]: R(img(185, 35000, 20)),
  [`${ID('l3-001')}:q2`]: R(pre(185, 35000, 37220)),
  [`${ID('l3-002')}:q1`]: affineSet(SIX),
  [`${ID('l3-002')}:q2`]: R(q(SIX.findIndex((fn) => isAffine(fn) && fn(q(0)).n === 0n) + 1)),
  [`${ID('l3-002')}:q3`]: R(SIX[1](q(4))),
  [`${ID('l3-003')}:q1`]: R(u(1)),
  [`${ID('l3-003')}:q2`]: R(u(2)),
  [`${ID('l3-003')}:q3`]: R(u(3)),
  [`${ID('l3-003')}:q4`]: yes(isAffine((x) => u(x))),
  [`${ID('l3-004')}:q1`]: R(q(35925).div(5)),
  [`${ID('l3-004')}:q2`]: R(q(36480).div(8)),
  [`${ID('l3-004')}:q3`]: yes(cmp(q(35925).div(5), q(36480).div(8)) === 0),
  [`${ID('l3-004')}:q4`]: R(img(185, 35000, 0)),
  [`${ID('l3-005')}:q1`]: R(img('3/4', -2, 8)),
  [`${ID('l3-005')}:q2`]: R(img('3/4', -2, -4)),
  [`${ID('l3-005')}:q3`]: R(pre('3/4', -2, 7)),
  [`${ID('l3-006')}:q1`]: R(img(2, -5, -2)),
  [`${ID('l3-006')}:q2`]: yes(cmp(img(2, -5, 4), 3) === 0),
  [`${ID('l3-006')}:q3`]: R(pre(2, -5, 21)),
  [`${ID('l3-007')}:q1`]: R(img('2.5', 10, 6)),
  [`${ID('l3-007')}:q2`]: R(pre('2.5', 10, 0)),
  [`${ID('l3-007')}:q3`]: yes(q(10).n === 0n),
  [`${ID('l3-008')}:q1`]: R(img(150, 24000, 80)),
  [`${ID('l3-008')}:q2`]: R(q(150)),
  [`${ID('l3-008')}:q3`]: R(q(24000)),
  [`${ID('l3-008')}:q4`]: R(pre(150, 24000, 39000)),
  [`${ID('l3-009')}:q1`]: R(pre(-3, 2, -7)),
  [`${ID('l3-009')}:q2`]: R(img(-3, 2, -2)),
  [`${ID('l3-009')}:q3`]: yes(img(-3, 2, 0).n === 0n),
  [`${ID('l3-009')}:q4`]: R(img(-3, 2, '1/3')),
  [`${ID('l3-010')}:q1`]: R(img(2, 3, 1)),
  [`${ID('l3-010')}:q2`]: R(img(-1, 9, 1)),
  [`${ID('l3-010')}:q3`]: R(meet(2, 3, -1, 9)),
  [`${ID('l3-010')}:q4`]: R(img(2, 3, meet(2, 3, -1, 9))),

  // ── Niveau 4 ──
  [`${ID('l4-001')}:q1`]: R(img(185, 35000, 4)),
  [`${ID('l4-001')}:q2`]: R(img(185, 35000, 20)),
  [`${ID('l4-001')}:q3`]: R(pre(185, 35000, 37405)),
  [`${ID('l4-001')}:q4`]: yes(img(185, 35000, 0).n === 0n),
  [`${ID('l4-001')}:q5`]: R(ceilInt(pre(185, 35000, 38000))),
  [`${ID('l4-002')}:q1`]: R(v(1)),
  [`${ID('l4-002')}:q2`]: R(v(2)),
  [`${ID('l4-002')}:q3`]: R(v(4)),
  [`${ID('l4-002')}:q4`]: yes(isAffine((x) => v(x))),
  [`${ID('l4-002')}:q5`]: R(q(1).div(2)), // (x + 3)/2 = x/2 + 3/2
  [`${ID('l4-002')}:q6`]: R(q(3).div(2)),
  [`${ID('l4-003')}:q1`]: R(img('-1/3', 2, -6)),
  [`${ID('l4-003')}:q2`]: R(img('-1/3', 2, 9)),
  [`${ID('l4-003')}:q3`]: R(pre('-1/3', 2, 0)),
  [`${ID('l4-003')}:q4`]: R(pre('-1/3', 2, 5)),
  [`${ID('l4-004')}:q1`]: R(q(-2)),
  [`${ID('l4-004')}:q2`]: R(q(7)),
  [`${ID('l4-004')}:q3`]: R(pre(-2, 7, -5)),
  [`${ID('l4-004')}:q4`]: R(img(-2, 7, -5)),
  [`${ID('l4-005')}:q1`]: kindOf(0, 4),
  [`${ID('l4-005')}:q2`]: R(img(0, 4, -3)),
  [`${ID('l4-005')}:q3`]: yes(cmp(4, 5) === 0),
  [`${ID('l4-006')}:q1`]: R(q(120)),
  [`${ID('l4-006')}:q2`]: R(q(300)),
  [`${ID('l4-006')}:q3`]: R(img(120, 300, 4)),
  [`${ID('l4-006')}:q4`]: R(pre(120, 300, 1500)),
  // f(x) = (k − 3)x + 2k − 8 : linéaire ⇔ 2k − 8 = 0 ; constante ⇔ k − 3 = 0
  [`${ID('l4-007')}:q1`]: R(pre(2, -8, 0)),
  [`${ID('l4-007')}:q2`]: R(pre(1, -3, 0)),
  [`${ID('l4-007')}:q3`]: R(img(q(5).sub(3), q(2).mul(5).sub(8), 2)),
  [`${ID('l4-008')}:q1`]: R(q(3)),
  [`${ID('l4-008')}:q2`]: R(q(3).mul(2)),
  [`${ID('l4-008')}:q3`]: R(img(3, 6, -2)),
  [`${ID('l4-008')}:q4`]: R(pre(3, 6, 12)),
  [`${ID('l4-009')}:q1`]: R(lin(150, 10)),
  [`${ID('l4-009')}:q2`]: R(img(90, 1800, 10)),
  [`${ID('l4-009')}:q3`]: R(pre(90, 1800, 5400)),
  [`${ID('l4-009')}:q4`]: R(lin(150, pre(90, 1800, 5400))),
  [`${ID('l4-009')}:q5`]: R(q(90)),
  [`${ID('l4-009')}:q6`]: R(q(1800)),
  [`${ID('l4-009')}:q7`]: C('A'), // f(0) = 0, g(0) = 1800 ≠ 0
  [`${ID('l4-010')}:q1`]: R(img(40, 400, 15)),
  [`${ID('l4-010')}:q2`]: R(img(0, 2000, 15)),
  [`${ID('l4-010')}:q3`]: kindOf(40, 400),
  [`${ID('l4-010')}:q4`]: kindOf(0, 2000),
  [`${ID('l4-010')}:q5`]: R(pre(40, 400, 2000)),

  // ── Niveau 5 ──
  // BEM 2019 II : 100DA la séance ; 80DA + 400DA ; 2800DA
  [`${ID('l5-001')}:q1`]: R(pre(100, 0, 2800)),
  [`${ID('l5-001')}:q2`]: R(pre(80, 400, 2800)),
  [`${ID('l5-001')}:q3`]: R(q(80)),
  [`${ID('l5-001')}:q4`]: R(q(400)),
  [`${ID('l5-001')}:q6`]: R(meet(100, 0, 80, 400)),
  // حرفيّان : 900x ; 600x + 1200
  [`${ID('l5-002')}:q1`]: R(lin(900, 2)),
  [`${ID('l5-002')}:q2`]: R(img(600, 1200, 2)),
  [`${ID('l5-002')}:q3`]: R(pre(600, 1200, 6000)),
  [`${ID('l5-002')}:q4`]: R(lin(900, pre(600, 1200, 6000))),
  [`${ID('l5-002')}:q5`]: R(q(600)),
  [`${ID('l5-002')}:q6`]: R(q(1200)),
  [`${ID('l5-002')}:q7`]: kindOf(600, 1200),
  [`${ID('l5-002')}:q8`]: R(meet(900, 0, 600, 1200)),
  [`${ID('l5-002')}:q9`]: cheapest([lin(900, '3.5'), img(600, 1200, '3.5')]),
  // مربّي نحل : C(x) = 500x + 28000 ; vente 3500x ; B = vente − C
  [`${ID('l5-003')}:q1`]: R(img(500, 28000, 40)),
  [`${ID('l5-003')}:q2`]: R(lin(3500, 40).sub(img(500, 28000, 40))),
  [`${ID('l5-003')}:q3`]: R(q(500)),
  [`${ID('l5-003')}:q4`]: R(q(28000)),
  [`${ID('l5-003')}:q6`]: kindOf(q(3500).sub(500), q(-28000)),
  [`${ID('l5-003')}:q7`]: R(lin(3500, 5).sub(img(500, 28000, 5))),
  [`${ID('l5-003')}:q8`]: R(pre(q(3500).sub(500), -28000, 62000)),
  [`${ID('l5-003')}:q9`]: R(ceilInt(pre(q(3500).sub(500), -28000, 0))),
  // مطبعة : 25x ; 15x + 1200
  [`${ID('l5-004')}:q1`]: R(lin(25, 50)),
  [`${ID('l5-004')}:q2`]: R(img(15, 1200, 50)),
  [`${ID('l5-004')}:q3`]: R(pre(15, 1200, 6450)),
  [`${ID('l5-004')}:q4`]: R(lin(25, pre(15, 1200, 6450))),
  [`${ID('l5-004')}:q5`]: R(q(15)),
  [`${ID('l5-004')}:q6`]: R(q(1200)),
  [`${ID('l5-004')}:q7`]: yes(img(15, 1200, 0).n === 0n),
  [`${ID('l5-004')}:q8`]: R(meet(25, 0, 15, 1200)),
  [`${ID('l5-004')}:q9`]: cheapest([lin(25, 150), img(15, 1200, 150)]),
  // شمعتان : L1 = −1,5t + 24 ; L2 = −0,9t + 18
  [`${ID('l5-005')}:q1`]: R(img('-1.5', 24, 4)),
  [`${ID('l5-005')}:q2`]: R(img('-0.9', 18, 4)),
  [`${ID('l5-005')}:q3`]: R(q('-1.5')),
  [`${ID('l5-005')}:q4`]: R(q(24)),
  [`${ID('l5-005')}:q5`]: R(pre('-1.5', 24, 0)),
  [`${ID('l5-005')}:q6`]: R(pre('-0.9', 18, '13.5')),
  [`${ID('l5-005')}:q7`]: R(meet('-1.5', 24, '-0.9', 18)),
  // شتلتان : f = 3x + 12 ; g = 1,5x + 30
  [`${ID('l5-006')}:q1`]: R(img(3, 12, 4)),
  [`${ID('l5-006')}:q2`]: R(img(3, 12, 10)),
  [`${ID('l5-006')}:q3`]: R(img('1.5', 30, 4)),
  [`${ID('l5-006')}:q4`]: R(img('1.5', 30, 10)),
  [`${ID('l5-006')}:q5`]: R(q('1.5')),
  [`${ID('l5-006')}:q6`]: R(q(30)),
  [`${ID('l5-006')}:q7`]: R(pre(3, 12, 60)),
  [`${ID('l5-006')}:q8`]: R(meet(3, 12, '1.5', 30)),
  // سينما : 400x ; 250x + 1500 ; 6000
  [`${ID('l5-007')}:q1`]: R(lin(400, 6)),
  [`${ID('l5-007')}:q2`]: R(img(250, 1500, 6)),
  [`${ID('l5-007')}:q3`]: R(img(0, 6000, 6)),
  [`${ID('l5-007')}:q4`]: R(pre(250, 1500, 5250)),
  [`${ID('l5-007')}:q5`]: kindOf(400, 0),
  [`${ID('l5-007')}:q6`]: kindOf(250, 1500),
  [`${ID('l5-007')}:q7`]: kindOf(0, 6000),
  [`${ID('l5-007')}:q8`]: cheapest([lin(400, 20), img(250, 1500, 20), img(0, 6000, 20)]),
  // زرابي : 200x ; 120x + 1600 ; 6 + 8 m²
  [`${ID('l5-008')}:q1`]: R(img(120, 1600, q(6).add(8))),
  [`${ID('l5-008')}:q2`]: R(lin(200, q(6).add(8))),
  [`${ID('l5-008')}:q3`]: R(q(120)),
  [`${ID('l5-008')}:q4`]: R(q(1600)),
  [`${ID('l5-008')}:q5`]: C('A'), // f(0) = 0 ; g(0) = 1600 ≠ 0
  [`${ID('l5-008')}:q6`]: R(pre(120, 1600, 4720)),
  [`${ID('l5-008')}:q8`]: R(meet(200, 0, 120, 1600)),
  // مخيم : 1500x ; 1000x + 3000 ; figure : 1 unité = 1 jour / 1000DA
  [`${ID('l5-009')}:q1`]: C(img(1000, 3000, 0).n === 0n ? 'A' : 'B'), // (d₁) passe par O, (d₂) non
  [`${ID('l5-009')}:q2`]: R(onGrid(img(1000, 3000, 4), 1000)),
  [`${ID('l5-009')}:q3`]: R(q(1000)),
  [`${ID('l5-009')}:q4`]: R(q(3000)),
  [`${ID('l5-009')}:q5`]: R(img(1000, 3000, 12)),
  [`${ID('l5-009')}:q6`]: R(pre(1000, 3000, 11000)),
  [`${ID('l5-009')}:q7`]: R(meet(1500, 0, 1000, 3000)),
  [`${ID('l5-009')}:q8`]: cheapest([lin(1500, 9), img(1000, 3000, 9)]),
  // معرض : 1200x ; 800x + 6000 ; poterie 1800DA
  [`${ID('l5-010')}:q1`]: R(lin(1200, 12)),
  [`${ID('l5-010')}:q2`]: R(img(800, 6000, 12)),
  [`${ID('l5-010')}:q3`]: R(q(800)),
  [`${ID('l5-010')}:q4`]: R(q(6000)),
  [`${ID('l5-010')}:q5`]: kindOf(1200, 0),
  [`${ID('l5-010')}:q6`]: R(pre(800, 6000, 22000)),
  [`${ID('l5-010')}:q7`]: R(meet(1200, 0, 800, 6000)),
  [`${ID('l5-010')}:q8`]: R(ceilInt(img(800, 6000, 20).div(1800))),
};
