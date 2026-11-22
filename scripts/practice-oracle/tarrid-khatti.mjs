// Oracle du banc « tarrid-khatti » au format BEM (unité 6 « الدالة الخطية والتناسبية », leçon 5
// « حل مشكلات وترييض وضعيات بتوظيف الدالة الخطية والتناسبية », banque réécrite le 2026-10-07) — chaque
// réponse RECALCULÉE ici à partir des nombres de l'énoncé, en rationnels exacts (helpers.mjs), sans lire le
// contenu ni le code testé (packages/core/arithmetic/proportional.js, linear.js). Fusionné dans
// scripts/practice-answer-oracle.test.mjs. Les étapes « بيّن أن » / « مثّل بيانيا » (selfCheck) n'ont pas de clé.
//
// Outils :
//   coef(y, x)          le معامل d'une fonction linéaire passant par (x ; y) : y ÷ x
//   pre(a, y)           l'antécédent de y par x ↦ ax : y ÷ a
//   lin(a, x)           l'image a × x
//   aff(a, b, x)        a × x + b (le tarif à part fixe, étapes counted:false)
//   bound(a1,b1,a2,b2)  la borne de a1·x + b1 > a2·x + b2 : (b2 − b1) ÷ (a1 − a2)
//   dir(sym)            la lettre du sens dans l'ordre affiché  A « < »  B « ≤ »  C « > »  D « ≥ »
//   cheaper(u, v)       A si u < v, B si v < u (le plus petit montant ; égalité → erreur)
//   larger(u, v)        A si u > v, B si v > u
//   yes(b)              « هل … ؟ برّر » : A = نعم, B = لا
//   floorTo(v, step)    le plus grand multiple de `step` qui ne dépasse pas v
//   roundTo(v, step)    arrondi exact au pas `step` (au plus proche, la moitié vers le haut)
// Unités : 1 h = 60 min = 3600 s, 1 km = 1000 m, 1 L = 1000 mL, 1 Go = 1000 Mo (énoncé), 1 kg = 1000 g.
import { R, C, q } from './helpers.mjs';

const coef = (y, x) => q(y).div(q(x));
const pre = (a, y) => q(y).div(q(a));
const lin = (a, x) => q(a).mul(q(x));
const aff = (a, b, x) => q(a).mul(q(x)).add(q(b));
const bound = (a1, b1, a2, b2) => q(b2).sub(q(b1)).div(q(a1).sub(q(a2)));
const DIRS = ['<', '<=', '>', '>='];
const dir = (sym) => C('ABCD'[DIRS.indexOf(sym)]);
// a1·x + b1 > a2·x + b2 avec a1 − a2 > 0 garde le sens « > ».
const dirOf = (a1, a2) => (q(a1).sub(q(a2)).n > 0n ? '>' : '<');
const cmp = (u, v) => { const d = q(u).sub(q(v)); return d.n === 0n ? 0 : (d.n > 0n ? 1 : -1); };
function cheaper(u, v) { const c = cmp(u, v); if (c === 0) throw new Error('tarrid-khatti oracle: égalité'); return C(c < 0 ? 'A' : 'B'); }
function larger(u, v) { const c = cmp(u, v); if (c === 0) throw new Error('tarrid-khatti oracle: égalité'); return C(c > 0 ? 'A' : 'B'); }
const yes = (b) => C(b ? 'A' : 'B');
/** Proportionnalité d'un tableau : tous les quotients y/x égaux. */
const proportional = (pairs) => pairs.every(([x, y]) => coef(y, x).toString() === coef(pairs[0][1], pairs[0][0]).toString());
function floorTo(v, step) {
  const k = q(v).div(q(step)); const n = k.n / k.d - ((k.n < 0n && k.n % k.d !== 0n) ? 1n : 0n);
  return q(String(n)).mul(q(step));
}
function roundTo(v, step) { return floorTo(q(v).add(q(step).div(2)), step); }

// Données répétées (une seule source par exercice).
const L1_10 = { price: 25, budget: 270 };
const CYCLIST = [[0, 0], [1, 40], [2, 70], [3, 130], [4, 155]];
const L4_08 = [[0, 0], [1, 30], [1.5, 30], [3, 72]];

export const ORACLE = {
  // ── Niveau 1 ──
  'ex-4am-tarrid-khatti-l1-001:q1': yes(proportional([['0.5', 25], ['1.5', 75], ['2.5', 125], [3, 150], ['3.5', 175]])),
  'ex-4am-tarrid-khatti-l1-001:q2': R(coef(150, 3)),
  'ex-4am-tarrid-khatti-l1-002:q1': yes(proportional([[2, 70], [5, 175], [8, 280]])),
  'ex-4am-tarrid-khatti-l1-002:q2': R(coef(70, 2)),
  'ex-4am-tarrid-khatti-l1-003:q1': R(40),
  'ex-4am-tarrid-khatti-l1-003:q2': R(lin(40, 12)),
  'ex-4am-tarrid-khatti-l1-004:q1': R(q(1).add(1).add(1)) /* x + x + x */,
  'ex-4am-tarrid-khatti-l1-004:q2': yes(aff(1, 13, 0).isZero()) /* A(0) = 13 ≠ 0 : pas linéaire */,
  'ex-4am-tarrid-khatti-l1-005:q1': R(coef(5, 2)) /* A(2 ; 5) lu sur la grille */,
  'ex-4am-tarrid-khatti-l1-005:q2': R(lin(coef(5, 2), 6)),
  'ex-4am-tarrid-khatti-l1-006:q1': R(coef(10, '2.5')),
  'ex-4am-tarrid-khatti-l1-006:q2': R(pre(coef(10, '2.5'), 6)),
  'ex-4am-tarrid-khatti-l1-007:q1': R(coef('0.6', 2)),
  'ex-4am-tarrid-khatti-l1-007:q2': R(lin(coef('0.6', 2), 10)),
  'ex-4am-tarrid-khatti-l1-008:q1': R(lin(80, '2.5')),
  'ex-4am-tarrid-khatti-l1-009:q1': R(coef(250, 2)),
  'ex-4am-tarrid-khatti-l1-009:q2': R(lin(coef(250, 2), 7)),
  'ex-4am-tarrid-khatti-l1-010:q1': R(pre(L1_10.price, L1_10.budget)),
  'ex-4am-tarrid-khatti-l1-010:q2': R(floorTo(pre(L1_10.price, L1_10.budget), 1)),
  'ex-4am-tarrid-khatti-l1-010:q3': R(q(L1_10.budget).sub(lin(L1_10.price, floorTo(pre(L1_10.price, L1_10.budget), 1)))),

  // ── Niveau 2 ──
  'ex-4am-tarrid-khatti-l2-001:q1': R(lin('0.3', 4)),
  'ex-4am-tarrid-khatti-l2-001:q2': R(pre('0.3', '2.1')),
  'ex-4am-tarrid-khatti-l2-001:q3': R(pre('0.3', '4.5')),
  'ex-4am-tarrid-khatti-l2-002:q1': R(lin(3, 50)) /* M : 3 carreaux × 50 km */,
  'ex-4am-tarrid-khatti-l2-002:q2': R(coef(lin(3, 50), 2)),
  'ex-4am-tarrid-khatti-l2-002:q3': R(lin(coef(lin(3, 50), 2), '3.5')),
  'ex-4am-tarrid-khatti-l2-003:q1': yes(proportional(CYCLIST.slice(1))),
  'ex-4am-tarrid-khatti-l2-003:q2': R(coef(CYCLIST[1][1], CYCLIST[1][0])),
  'ex-4am-tarrid-khatti-l2-004:q1': R(18),
  'ex-4am-tarrid-khatti-l2-004:q2': R(lin(18, 24)),
  'ex-4am-tarrid-khatti-l2-004:q3': R(pre(18, 540)),
  'ex-4am-tarrid-khatti-l2-005:q1': R(lin('0.8', 3)),
  'ex-4am-tarrid-khatti-l2-005:q2': R('0.8'),
  'ex-4am-tarrid-khatti-l2-005:q3': R(pre('0.8', 6)),
  'ex-4am-tarrid-khatti-l2-006:q1': R(lin(60, 5)),
  'ex-4am-tarrid-khatti-l2-006:q2': R(pre(60, 540)),
  'ex-4am-tarrid-khatti-l2-006:q3': R(lin(60, 12)),
  'ex-4am-tarrid-khatti-l2-006:q4': R(60),
  'ex-4am-tarrid-khatti-l2-007:q1': R(coef(250, 4)),
  'ex-4am-tarrid-khatti-l2-007:q2': R(lin(coef(250, 4), 10)),
  'ex-4am-tarrid-khatti-l2-007:q3': R(pre(coef(250, 4), 1000)),
  'ex-4am-tarrid-khatti-l2-008:q1': R(pre('0.25', 8)),
  'ex-4am-tarrid-khatti-l2-008:q2': yes(pre('0.25', -3).n >= 0n) /* une masse n'est jamais négative */,
  'ex-4am-tarrid-khatti-l2-009:q1': R(coef(6, 100)),
  'ex-4am-tarrid-khatti-l2-009:q2': R(lin(coef(6, 100), 350)),
  'ex-4am-tarrid-khatti-l2-009:q3': R(pre(coef(6, 100), 30)),
  'ex-4am-tarrid-khatti-l2-010:q1': R(q(1).sub(q(15).div(100))),
  'ex-4am-tarrid-khatti-l2-010:q2': R(lin(q(1).sub(q(15).div(100)), 3200)),
  'ex-4am-tarrid-khatti-l2-010:q3': R(pre(q(1).sub(q(15).div(100)), 2550)),

  // ── Niveau 3 ──
  'ex-4am-tarrid-khatti-l3-001:q1': R(20),
  'ex-4am-tarrid-khatti-l3-001:q2': R(pre(20, 4000)),
  'ex-4am-tarrid-khatti-l3-001:q3': cheaper(lin(20, 500), 4000),
  'ex-4am-tarrid-khatti-l3-002:q1': R(q(CYCLIST[3][1]).sub(CYCLIST[2][1]).div(q(CYCLIST[3][0]).sub(CYCLIST[2][0]))),
  'ex-4am-tarrid-khatti-l3-002:q2': R(q(CYCLIST[2][0]).add(q(100).sub(CYCLIST[2][1]).div(q(CYCLIST[3][1]).sub(CYCLIST[2][1])))),
  'ex-4am-tarrid-khatti-l3-002:q3': R(q(CYCLIST[4][1]).sub(CYCLIST[3][1]).mul('0.5')),
  'ex-4am-tarrid-khatti-l3-003:q1': R(q('1.1').mul('0.92')),
  'ex-4am-tarrid-khatti-l3-003:q2': R(lin(q('1.1').mul('0.92'), 20000000)),
  'ex-4am-tarrid-khatti-l3-003:q3': R(q('1.1').mul('0.92').sub(1).mul(100)),
  'ex-4am-tarrid-khatti-l3-004:q1': R(q(60).div(100)),
  'ex-4am-tarrid-khatti-l3-004:q2': R(lin(q(60).div(100), 20).add(lin(q(70).div(100), 10))),
  'ex-4am-tarrid-khatti-l3-004:q3': R(roundTo(lin(q(60).div(100), 20).add(lin(q(70).div(100), 10)).div(30).mul(100), '0.01')),
  'ex-4am-tarrid-khatti-l3-005:q1': R(5),
  'ex-4am-tarrid-khatti-l3-005:q2': R(pre(5, q('2.4').mul(1000)).div(60)),
  'ex-4am-tarrid-khatti-l3-005:q3': R(lin(5, q('3.5').mul(60))),
  'ex-4am-tarrid-khatti-l3-006:q1': R(180),
  'ex-4am-tarrid-khatti-l3-006:q2': R(coef(850, 5)),
  'ex-4am-tarrid-khatti-l3-006:q3': cheaper(lin(180, 3), lin(coef(850, 5), 3)),
  'ex-4am-tarrid-khatti-l3-006:q4': R(lin(180, 3).sub(lin(coef(850, 5), 3))),
  'ex-4am-tarrid-khatti-l3-007:q1': R(q(12).div(2)) /* aire ABM = AB × x / 2 */,
  'ex-4am-tarrid-khatti-l3-007:q2': R(pre(q(12).div(2), 27)),
  'ex-4am-tarrid-khatti-l3-007:q3': R(pre(q(12).div(2), q(12).mul(7).div(4))),
  'ex-4am-tarrid-khatti-l3-008:q1': R(coef(45, 9).mul(6)),
  'ex-4am-tarrid-khatti-l3-008:q2': R(coef(9, 45)),
  'ex-4am-tarrid-khatti-l3-008:q3': R(lin(coef(9, 45), 60)),
  'ex-4am-tarrid-khatti-l3-009:q1': R(lin(900, 2)),
  'ex-4am-tarrid-khatti-l3-009:q2': R(pre(900, 4500)),
  'ex-4am-tarrid-khatti-l3-009:q3': R(pre(600, q(6300).sub(1500))),
  'ex-4am-tarrid-khatti-l3-009:q4': R(900),
  'ex-4am-tarrid-khatti-l3-009:q5': R(bound(900, 0, 600, 1500)),
  'ex-4am-tarrid-khatti-l3-009:q6': dir(dirOf(900, 600)),
  'ex-4am-tarrid-khatti-l3-009:q7': cheaper(lin(900, 7), aff(600, 1500, 7)),
  'ex-4am-tarrid-khatti-l3-010:q1': R(q(48000 + 2400).sub(floorTo(q(48000 + 2400).div(1000), 1).mul(10))),
  'ex-4am-tarrid-khatti-l3-010:q2': yes(coef(10, 1999).toString() === coef(10, 1000).toString()),

  // ── Niveau 4 ──
  'ex-4am-tarrid-khatti-l4-001:q2': R(q(1).add(q(10).div(100)).mul(q(1).sub(q(10).div(100)))),
  'ex-4am-tarrid-khatti-l4-001:q3': R(lin(q(1).add(q(10).div(100)).mul(q(1).sub(q(10).div(100))), 5000)),
  'ex-4am-tarrid-khatti-l4-001:q4': yes(q(1).sub(q(10).mul(10).div(10000)).toString() === '1') /* t ≠ 0 : 1 − t²/10000 < 1 */,
  'ex-4am-tarrid-khatti-l4-002:q1': yes(proportional([['0.5', 55], [1, 115]])),
  'ex-4am-tarrid-khatti-l4-002:q2': R(q('1.5').sub(1)) /* 115 km de t = 1 à t = 1,5 */,
  'ex-4am-tarrid-khatti-l4-002:q3': R(roundTo(coef(300, '4.5'), '0.01')),
  'ex-4am-tarrid-khatti-l4-002:q4': R(coef(300, 4)),
  'ex-4am-tarrid-khatti-l4-002:q5': larger(180, lin(coef(300, 4), 2)),
  'ex-4am-tarrid-khatti-l4-003:q1': R(14),
  'ex-4am-tarrid-khatti-l4-003:q2': R(pre(14, 350)),
  'ex-4am-tarrid-khatti-l4-003:q3': R(floorTo(pre(14, 525), 1)),
  'ex-4am-tarrid-khatti-l4-003:q4': R(pre(14, 525).sub(floorTo(pre(14, 525), 1)).mul(60)),
  'ex-4am-tarrid-khatti-l4-004:q1': R(q(4).mul('2.5').mul(2)),
  'ex-4am-tarrid-khatti-l4-004:q2': R(lin(4, 3)),
  'ex-4am-tarrid-khatti-l4-004:q3': R(q(4).mul('2.5').mul(2).sub(lin(4, 3))),
  'ex-4am-tarrid-khatti-l4-004:q4': R(4),
  'ex-4am-tarrid-khatti-l4-004:q5': R(q(20).div(4 + 4)) /* 20 − 4x = 4x */,
  'ex-4am-tarrid-khatti-l4-004:q7': R(pre(4, q(4).mul('2.5').mul(2))),
  'ex-4am-tarrid-khatti-l4-005:q1': R('1.8'),
  'ex-4am-tarrid-khatti-l4-005:q2': R(lin('1.8', 4)),
  'ex-4am-tarrid-khatti-l4-005:q3': R(pre('1.8', 9)),
  'ex-4am-tarrid-khatti-l4-005:q4': R(lin(5, '1.8')),
  'ex-4am-tarrid-khatti-l4-005:q5': R(pre(lin(5, '1.8'), 117)),
  'ex-4am-tarrid-khatti-l4-006:q1': R(lin(50, 5)),
  'ex-4am-tarrid-khatti-l4-006:q2': R(pre(50, 450)),
  'ex-4am-tarrid-khatti-l4-006:q3': R(pre(25, q(550).sub(250))),
  'ex-4am-tarrid-khatti-l4-006:q4': R(50),
  'ex-4am-tarrid-khatti-l4-006:q5': R(pre(50, 300)) /* lecture : 3 unités × 100 DA → 3 unités × 2 livres */,
  'ex-4am-tarrid-khatti-l4-006:q6': R(bound(50, 0, 25, 250)),
  'ex-4am-tarrid-khatti-l4-006:q7': cheaper(lin(50, 14), aff(25, 250, 14)),
  'ex-4am-tarrid-khatti-l4-007:q1': yes(proportional([[1, 160], [2, 270], [3, 380]])),
  'ex-4am-tarrid-khatti-l4-007:q2': R(130),
  'ex-4am-tarrid-khatti-l4-007:q3': cheaper(380, lin(130, 3)),
  'ex-4am-tarrid-khatti-l4-007:q4': R(lin(130, 3).sub(380)),
  'ex-4am-tarrid-khatti-l4-008:q1': R(coef(L4_08[1][1], L4_08[1][0])),
  'ex-4am-tarrid-khatti-l4-008:q2': R(q(String(L4_08[2][0])).sub(L4_08[1][0]).mul(60)),
  'ex-4am-tarrid-khatti-l4-008:q3': R(q(L4_08[3][1]).sub(L4_08[2][1]).div(q(L4_08[3][0]).sub(String(L4_08[2][0])))),
  'ex-4am-tarrid-khatti-l4-008:q4': R(coef(L4_08[3][1], L4_08[3][0])),
  'ex-4am-tarrid-khatti-l4-009:q1': R(lin(24, 15)),
  'ex-4am-tarrid-khatti-l4-009:q2': R(q(15).div(2)) /* aire ADE = AD × x / 2 */,
  'ex-4am-tarrid-khatti-l4-009:q3': R(pre(q(15).div(2), lin(24, 15).div(4))),
  'ex-4am-tarrid-khatti-l4-009:q4': R(lin(24, 15).sub(lin(24, 15).div(4)).mul(1200)),
  'ex-4am-tarrid-khatti-l4-010:q1': R(coef(lin(3, 25), lin(1, '0.5'))) /* A : 1 unité × 0,5 Go ; 3 unités × 25 DA */,
  'ex-4am-tarrid-khatti-l4-010:q3': R(floorTo(pre(coef(75, '0.5'), 1000), '0.5')),

  // ── Niveau 5 (الوضعية الإدماجية) ──
  'ex-4am-tarrid-khatti-l5-001:q1': R(lin(80, 20)),
  'ex-4am-tarrid-khatti-l5-001:q2': R(pre(80, 2400)),
  'ex-4am-tarrid-khatti-l5-001:q3': R(pre(30, q(2700).sub(1200))),
  'ex-4am-tarrid-khatti-l5-001:q4': R(80),
  'ex-4am-tarrid-khatti-l5-001:q5': R(bound(80, 0, 30, 1200)),
  'ex-4am-tarrid-khatti-l5-001:q6': dir(dirOf(80, 30)),
  'ex-4am-tarrid-khatti-l5-001:q7': larger(lin(80, 28), aff(30, 1200, 28)) /* l'ouvrier veut le salaire le plus grand */,
  'ex-4am-tarrid-khatti-l5-002:q1': R(lin(120, 2)),
  'ex-4am-tarrid-khatti-l5-002:q2': R(pre(120, 720)),
  'ex-4am-tarrid-khatti-l5-002:q3': R(pre(40, q(400).sub(200))),
  'ex-4am-tarrid-khatti-l5-002:q4': R(120),
  'ex-4am-tarrid-khatti-l5-002:q6': R(bound(120, 0, 40, 200)),
  'ex-4am-tarrid-khatti-l5-002:q7': cheaper(lin(120, '4.5'), aff(40, 200, '4.5')),
  'ex-4am-tarrid-khatti-l5-003:q1': R(lin(60, 3)),
  'ex-4am-tarrid-khatti-l5-003:q2': R(pre(60, 600)),
  'ex-4am-tarrid-khatti-l5-003:q3': R(pre(30, q(600).sub(240))),
  'ex-4am-tarrid-khatti-l5-003:q4': R(60),
  'ex-4am-tarrid-khatti-l5-003:q5': R(pre(60, 360)),
  'ex-4am-tarrid-khatti-l5-003:q6': R(bound(60, 0, 30, 240)),
  'ex-4am-tarrid-khatti-l5-003:q7': cheaper(lin(60, 11), aff(30, 240, 11)),
  'ex-4am-tarrid-khatti-l5-004:q1': R(lin(25, 20)),
  'ex-4am-tarrid-khatti-l5-004:q2': R(pre(25, 1250)),
  'ex-4am-tarrid-khatti-l5-004:q3': R(pre(15, q(1100).sub(500))),
  'ex-4am-tarrid-khatti-l5-004:q4': R(25),
  'ex-4am-tarrid-khatti-l5-004:q5': R(pre(25, 750)),
  'ex-4am-tarrid-khatti-l5-004:q6': R(bound(25, 0, 15, 500)),
  'ex-4am-tarrid-khatti-l5-004:q7': R(coef(15, 100)),
  'ex-4am-tarrid-khatti-l5-004:q8': R(lin(coef(15, 100), 400)),
  'ex-4am-tarrid-khatti-l5-004:q9': cheaper(lin(25, lin(coef(15, 100), 400)), aff(15, 500, lin(coef(15, 100), 400))),
  'ex-4am-tarrid-khatti-l5-005:q1': R(q('0.5').mul(1000)),
  'ex-4am-tarrid-khatti-l5-005:q2': R(lin('2.5', 60)),
  'ex-4am-tarrid-khatti-l5-005:q3': R(q(500).sub(lin('2.5', 60))),
  'ex-4am-tarrid-khatti-l5-005:q4': R('2.5'),
  'ex-4am-tarrid-khatti-l5-005:q5': R(pre('2.5', q(500).sub(50))),
  'ex-4am-tarrid-khatti-l5-005:q6': R(q(500).div(q('2.5').mul(2))),
  'ex-4am-tarrid-khatti-l5-006:q1': R(q('1.8').mul(1000)),
  'ex-4am-tarrid-khatti-l5-006:q2': R(lin(12, 60)),
  'ex-4am-tarrid-khatti-l5-006:q3': R(q('1.8').mul(1000).sub(lin(12, 60))),
  'ex-4am-tarrid-khatti-l5-006:q4': R(12),
  'ex-4am-tarrid-khatti-l5-006:q5': R(pre(12, q('1.8').mul(1000))),
  'ex-4am-tarrid-khatti-l5-006:q6': R(pre(12, q('1.8').mul(1000)).div(60)),
  'ex-4am-tarrid-khatti-l5-006:q7': R(q('1.8').mul(1000).div(24)),
  'ex-4am-tarrid-khatti-l5-007:q1': R(lin(36, 20)),
  'ex-4am-tarrid-khatti-l5-007:q2': R(q(20).div(2)),
  'ex-4am-tarrid-khatti-l5-007:q4': R(pre(q(20).div(2), lin(36, 20).div(5))),
  'ex-4am-tarrid-khatti-l5-007:q5': R(lin(900, q(20).div(2))),
  'ex-4am-tarrid-khatti-l5-007:q6': R(pre(lin(900, q(20).div(2)), 108000)),
  'ex-4am-tarrid-khatti-l5-008:q1': R(6) /* 6 × 6 = 36, côté positif */,
  'ex-4am-tarrid-khatti-l5-008:q2': R(q(6).div(2)),
  'ex-4am-tarrid-khatti-l5-008:q5': R(pre(q(6).div(2), 12)),
  'ex-4am-tarrid-khatti-l5-008:q6': R(lin(450, q(6).div(2))),
  'ex-4am-tarrid-khatti-l5-008:q7': R(lin(lin(450, q(6).div(2)), pre(q(6).div(2), 12))),
  'ex-4am-tarrid-khatti-l5-009:q1': R('1.8') /* 1,8² + 2,4² = 3,24 + 5,76 = 9 = 3² (vérifié ci-dessous) */,
  'ex-4am-tarrid-khatti-l5-009:q2': R(q('2.4').add('1.8')),
  'ex-4am-tarrid-khatti-l5-009:q3': R(coef(6, '1.5')),
  'ex-4am-tarrid-khatti-l5-009:q4': R(pre(coef(6, '1.5'), q('2.4').add('1.8')).mul(60)),
  'ex-4am-tarrid-khatti-l5-009:q5': R(pre(coef(6, '1.5'), q('2.4').add('1.8')).sub(pre(coef(6, '1.5'), 3)).mul(60)),
  'ex-4am-tarrid-khatti-l5-010:q1': R(100) /* 100² = 80² + 60² (vérifié ci-dessous) */,
  'ex-4am-tarrid-khatti-l5-010:q2': R(80 + 60),
  'ex-4am-tarrid-khatti-l5-010:q3': R(q(1).div('0.8')),
  'ex-4am-tarrid-khatti-l5-010:q4': R(lin(q(1).div('0.8'), 140)),
  'ex-4am-tarrid-khatti-l5-010:q5': R(pre(coef(140, 35), 100)),
};

// Les deux côtés de Pythagore écrits en dur ci-dessus, contrôlés en exact.
if (q('1.8').mul('1.8').add(q('2.4').mul('2.4')).toString() !== '9') throw new Error('tarrid-khatti oracle: BC ≠ 1,8');
if (80 * 80 + 60 * 60 !== 100 * 100) throw new Error('tarrid-khatti oracle: AC ≠ 100');
if (6 * 6 !== 36) throw new Error('tarrid-khatti oracle: côté ≠ 6');
