// Oracle du banc « tamthil-bayani-taalufi » au format BEM (unité 7 « الدالة التآلفية », leçon 2, banque réécrite le
// 2026-10-07) — chaque réponse RECALCULÉE ici à partir des nombres de l'énoncé (expression de f, ou deux nœuds du
// quadrillage par lesquels passe chaque droite dessinée en `statement.figure`), en rationnels exacts (helpers.mjs), sans
// lire le contenu ni le code testé. Fusionné dans scripts/practice-answer-oracle.test.mjs.
// Les étapes « أنشئ / مثّل بيانيا » et « بيّن أن » (selfCheck) n'ont pas de clé ; les questions fermées (choice) en ont une.
//
// Outils :
//   fn(a, b)                 la fonction x ⟼ a·x + b
//   thru(x1, y1, x2, y2)     la droite dessinée par deux nœuds (unités réelles) : { a, b }
//   img(L, x) / ante(L, y)   L(x) ; le x tel que L(x) = y
//   read(v, u)               une LECTURE graphique : v ÷ u (unité de l'axe) doit être un multiple de la maille, sinon erreur
//   meet(L1, L2)             le point d'intersection { x, y } de deux droites (étapes counted:false)
//   yesNo(b)                 « هل … ؟ » : A = نعم, B = لا
//   cheapest([…])            la lettre (A, B, C) du plus petit montant (égalité → erreur)
//   viaB(lines, k)           « أيّ المستقيمين يمثّل g ؟ » : la lettre de l'unique droite qui a l'ordonnée à l'origine de g
import { R, C, P, q } from './helpers.mjs';

const fn = (a, b) => ({ a: q(a), b: q(b) });
const thru = (x1, y1, x2, y2) => { const a = q(y2).sub(q(y1)).div(q(x2).sub(q(x1))); return { a, b: q(y1).sub(a.mul(q(x1))) }; };
const img = (L, x) => L.a.mul(q(x)).add(L.b);
const ante = (L, y) => q(y).sub(L.b).div(L.a);
const eq = (u, v) => q(u).sub(q(v)).isZero();
const read = (v, u = 1, step = 1) => {
  const k = q(v).div(q(u)).div(q(step));
  if (k.d !== 1n) throw new Error(`oracle tamthil-bayani-taalufi : lecture hors nœud (${v} ÷ ${u})`);
  return q(v);
};
const meet = (L1, L2) => { const x = L2.b.sub(L1.b).div(L1.a.sub(L2.a)); return { x, y: img(L1, x) }; };
const yesNo = (b) => C(b ? 'A' : 'B');
const LETTERS = 'ABCD';
function cheapest(amounts) {
  const vals = amounts.map((v) => q(v));
  let best = 0;
  vals.forEach((v, i) => { if (v.sub(vals[best]).n < 0n) best = i; });
  if (vals.some((v, i) => i !== best && eq(v, vals[best]))) throw new Error('cheapest : égalité');
  return C(LETTERS[best]);
}
const viaB = (lines, b) => {
  const hits = lines.map((L, i) => (eq(L.b, b) ? i : -1)).filter((i) => i >= 0);
  if (hits.length !== 1) throw new Error('viaB : pas unique');
  return C(LETTERS[hits[0]]);
};
const RP = (p) => P(p.x.toString(), p.y.toString());

const ID = (s) => `ex-4am-tamthil-bayani-taalufi-${s}`;

// Droites dessinées (deux nœuds de la figure, en unités réelles) et fonctions données par leur expression.
const L1_007 = thru(-2, -3, 2, 5);
const L1_008 = thru(-1, 5, 5, -1);
const L1_009 = thru(-2, -1, 5, 6);
const L1_010 = thru(-2, -2, 3, 8);
const L2_003 = thru(-1, -4, 2, 5);
const L2_004 = thru(-4, 1, 4, 5);
const L2_005 = thru(-1, -5, 4, 5);
const L2_006 = thru(-3, -4, 2, 6);
const L2_007 = thru(-1, 7, 4, -3);
const L2_009 = thru(0, 200, 6, 800);
const L2_010 = thru(-1, -5, 4, 5);
const L3_003 = thru(-2, 2, 6, -2);
const L3_004 = thru(-4, -5, 8, 4);
const L3_005 = thru(-2, -5, 3, 5);
const L3_006 = thru(-4, -3, 2, 6);
const L3_007 = thru(-2, 6, 4, -3);
const L3_008D = thru(0, 0, 16, 4000);
const L3_008T = thru(0, 1500, 16, 3500);
const L3_009 = thru(-2, -4, 4, 5);
const L3_010a = thru(-4, -2, 3, 5);
const L3_010b = thru(-2, -3, 5, 4);
const L4_001 = thru(-2, 5, 4, -4);
const L4_004 = thru(-5, 0, 5, 5);
const L4_007 = thru(0, 10, 8, 50);
const L4_008 = thru(-1, -7, 3, 5);
const L4_009 = thru(-2, -7, 4, 2);
const L4_010 = thru(-3, 3, 6, -3);
const L5_002D = thru(0, 60, 30, 0);
const L5_002T = thru(0, 0, 20, 60);
const L5_004 = [thru(0, 0, 9, 13500), thru(0, 3000, 10, 10500), thru(0, 7500, 10, 7500)];
const L5_006D = thru(0, 0, 25, 10000);
const L5_006T = thru(0, 3000, 30, 9000);
const L5_007D = thru(0, 0, 16, 80);
const L5_007T = thru(0, 80, 16, 0);
const L5_010 = [thru(0, 0, 9, 18000), thru(0, 4000, 10, 16000), thru(0, 14000, 10, 14000)];

export const ORACLE = {
  // ── Niveau 1 ──
  [`${ID('l1-001')}:q1`]: R(img(fn('3/2', 0), 2)),
  [`${ID('l1-001')}:q2`]: R(img(fn('3/2', 1), 2)),
  [`${ID('l1-002')}:q1`]: P(0, img(fn('3/2', 1), 0).toString()),
  [`${ID('l1-002')}:q2`]: yesNo(eq(img(fn('3/2', 1), 4), 7)),
  [`${ID('l1-003')}:q1`]: R(img(fn('1/2', 3), 2)),
  [`${ID('l1-003')}:q2`]: P(0, img(fn('1/2', 3), 0).toString()),
  [`${ID('l1-004')}:q1`]: R(read(thru(-3, -3, 3, 3).a)),
  [`${ID('l1-004')}:q2`]: R(read(thru(-3, 3, 3, -3).a)),
  [`${ID('l1-005')}:q1`]: P(0, img(fn(1, 2), 0).toString()),
  [`${ID('l1-005')}:q2`]: R(img(fn(1, 2), 3)),
  [`${ID('l1-006')}:q1`]: R(img(fn(2, 1), 1)),
  [`${ID('l1-006')}:q2`]: yesNo(eq(img(fn(2, 1), 2), 5)),
  [`${ID('l1-007')}:q1`]: R(read(L1_007.b)),
  [`${ID('l1-007')}:q2`]: R(L1_007.a),
  [`${ID('l1-008')}:q1`]: R(L1_008.a),
  [`${ID('l1-008')}:q2`]: R(read(L1_008.b)),
  [`${ID('l1-009')}:q1`]: R(read(img(L1_009, 4))),
  [`${ID('l1-009')}:q2`]: R(read(ante(L1_009, 2))),
  [`${ID('l1-010')}:q1`]: R(read(ante(L1_010, 6))),
  [`${ID('l1-010')}:q2`]: R(read(img(L1_010, -1))),
  // ── Niveau 2 ──
  [`${ID('l2-001')}:q1`]: P(0, img(fn(3, -2), 0).toString()),
  [`${ID('l2-001')}:q2`]: yesNo(eq(img(fn(3, -2), 1), 1)),
  [`${ID('l2-002')}:q1`]: R(ante(fn(2, -5), 3)), // counted:false (leçon 1)
  [`${ID('l2-002')}:q2`]: R(img(fn(2, -5), -1)), // counted:false (leçon 1)
  [`${ID('l2-002')}:q3`]: P(0, img(fn(2, -5), 0).toString()),
  [`${ID('l2-003')}:q1`]: R(read(L2_003.b)),
  [`${ID('l2-003')}:q2`]: R(L2_003.a),
  [`${ID('l2-004')}:q1`]: R(L2_004.a),
  [`${ID('l2-004')}:q2`]: R(read(L2_004.b)),
  [`${ID('l2-005')}:q1`]: R(read(L2_005.b)),
  [`${ID('l2-005')}:q2`]: R(L2_005.a),
  [`${ID('l2-006')}:q1`]: R(read(L2_006.b)),
  [`${ID('l2-006')}:q2`]: R(read(img(L2_006, 1))),
  [`${ID('l2-007')}:q1`]: R(read(img(L2_007, 2))),
  [`${ID('l2-007')}:q2`]: R(read(ante(L2_007, 3))),
  [`${ID('l2-008')}:q1`]: R(img(fn(-1, 0), 3)),
  [`${ID('l2-008')}:q2`]: R(img(fn(-1, 4), 3)),
  [`${ID('l2-009')}:q1`]: R(read(img(L2_009, 3), 100)),
  [`${ID('l2-009')}:q2`]: R(read(ante(L2_009, 700), 1)),
  [`${ID('l2-010')}:q1`]: R(read(ante(L2_010, 1))),
  [`${ID('l2-010')}:q2`]: R(read(img(L2_010, 3))),
  // ── Niveau 3 ──
  // BEM 2023 I-4 (officiel) : f(x) = −2x + 3 ; 01 counted:false (leçon 1), 02 et 03 selfCheck.
  [`${ID('l3-001')}:q1`]: R(ante(fn(-2, 3), 1)),
  [`${ID('l3-001')}:q2`]: R(img(fn(-2, 3), 2)),
  [`${ID('l3-002')}:q1`]: R(ante(fn(-4, 1), -7)),
  [`${ID('l3-002')}:q2`]: R(img(fn(-4, 1), -2)),
  [`${ID('l3-002')}:q4`]: P(0, img(fn(-4, 1), 0).toString()),
  [`${ID('l3-003')}:q1`]: R(L3_003.a),
  [`${ID('l3-003')}:q2`]: R(read(L3_003.b)),
  [`${ID('l3-003')}:q3`]: R(read(img(L3_003, 4))),
  [`${ID('l3-004')}:q1`]: R(read(L3_004.b)),
  [`${ID('l3-004')}:q2`]: R(L3_004.a),
  [`${ID('l3-004')}:q3`]: R(read(ante(L3_004, 4))),
  [`${ID('l3-005')}:q1`]: R(read(L3_005.b)),
  [`${ID('l3-005')}:q2`]: R(L3_005.a),
  [`${ID('l3-005')}:q3`]: P(0, img(fn(-1, 2), 0).toString()),
  [`${ID('l3-005')}:q5`]: RP(meet(L3_005, fn(-1, 2))), // counted:false (tafsir-bayani-jumla)
  [`${ID('l3-006')}:q1`]: R(read(L3_006.b)),
  [`${ID('l3-006')}:q2`]: R(L3_006.a),
  [`${ID('l3-006')}:q3`]: R(read(img(L3_006, 2))),
  [`${ID('l3-007')}:q1`]: R(read(ante(L3_007, 6))),
  [`${ID('l3-007')}:q2`]: R(read(img(L3_007, 4))),
  [`${ID('l3-007')}:q3`]: R(L3_007.a),
  [`${ID('l3-008')}:q1`]: R(read(L3_008T.b, 500)),
  [`${ID('l3-008')}:q2`]: R(read(img(L3_008T, read(8, 2)), 500)),
  [`${ID('l3-008')}:q3`]: R(read(ante(L3_008D, read(2000, 500)), 2)),
  [`${ID('l3-008')}:q4`]: R(read(meet(L3_008D, L3_008T).x, 2)), // counted:false
  [`${ID('l3-009')}:q1`]: R(read(ante(L3_009, 5))),
  [`${ID('l3-009')}:q2`]: R(read(img(L3_009, -2))),
  [`${ID('l3-009')}:q3`]: R(read(L3_009.b)),
  [`${ID('l3-010')}:q1`]: R(read(L3_010a.b)),
  [`${ID('l3-010')}:q2`]: R(L3_010a.a),
  [`${ID('l3-010')}:q3`]: R(read(L3_010b.b)),
  // ── Niveau 4 ──
  [`${ID('l4-001')}:q1`]: R(read(L4_001.b)),
  [`${ID('l4-001')}:q2`]: R(L4_001.a),
  [`${ID('l4-001')}:q3`]: R(read(img(L4_001, 4))),
  [`${ID('l4-001')}:q4`]: R(img(L4_001, 10)), // counted:false (calcul, leçon 1)
  [`${ID('l4-002')}:q1`]: R(ante(fn('1/2', -2), 1)),
  [`${ID('l4-002')}:q2`]: R(img(fn('1/2', -2), -2)),
  [`${ID('l4-002')}:q4`]: P(0, img(fn('1/2', -2), 0).toString()),
  [`${ID('l4-002')}:q6`]: yesNo(eq(img(fn('1/2', -2), 10), 3)),
  [`${ID('l4-003')}:q1`]: P(0, img(fn('-1,5', '1,5'), 0).toString()),
  [`${ID('l4-003')}:q2`]: R(img(fn('-1,5', '1,5'), 1)),
  [`${ID('l4-003')}:q3`]: yesNo(eq(img(fn('-1,5', '1,5'), -1), 3)),
  [`${ID('l4-004')}:q1`]: R(read(L4_004.b, 1, '1/2')),
  [`${ID('l4-004')}:q2`]: R(L4_004.a),
  [`${ID('l4-004')}:q3`]: R(read(ante(L4_004, 4), 1, '1/2')),
  [`${ID('l4-004')}:q4`]: R(read(img(L4_004, -1), 1, '1/2')),
  [`${ID('l4-005')}:q1`]: P(0, img(fn(50, 1000), 0).toString()),
  [`${ID('l4-005')}:q2`]: R(img(fn(50, 1000), 40)),
  [`${ID('l4-005')}:q3`]: R(img(fn(25, 1500), 40)),
  [`${ID('l4-005')}:q5`]: RP(meet(fn(50, 1000), fn(25, 1500))), // counted:false (unité 5)
  // l4-006 : (d) par O et (2 ; 5), (d′) parallèle par (0 ; −3).
  [`${ID('l4-006')}:q1`]: R(img(fn(thru(0, 0, 2, 5).a, -3), 2)),
  [`${ID('l4-006')}:q2`]: R(thru(0, 0, 2, 5).a),
  [`${ID('l4-006')}:q3`]: R(q(-3)),
  [`${ID('l4-006')}:q4`]: R(ante(fn(thru(0, 0, 2, 5).a, -3), 0)), // counted:false (équation)
  [`${ID('l4-007')}:q1`]: R(read(L4_007.b, 10)),
  [`${ID('l4-007')}:q2`]: R(L4_007.a),
  [`${ID('l4-007')}:q3`]: R(read(ante(L4_007, read(30, 10)), 2)),
  [`${ID('l4-007')}:q4`]: R(img(L4_007, 7)), // counted:false (calcul)
  [`${ID('l4-008')}:q1`]: R(read(L4_008.b)),
  [`${ID('l4-008')}:q2`]: R(L4_008.a),
  [`${ID('l4-008')}:q3`]: P(0, img(fn(1, 2), 0).toString()),
  [`${ID('l4-008')}:q5`]: RP(meet(L4_008, fn(1, 2))), // counted:false
  [`${ID('l4-009')}:q1`]: R(read(ante(L4_009, 2))),
  [`${ID('l4-009')}:q2`]: R(read(img(L4_009, -2))),
  [`${ID('l4-009')}:q3`]: R(read(L4_009.b)),
  [`${ID('l4-009')}:q4`]: R(L4_009.a),
  [`${ID('l4-010')}:q1`]: P(read(ante(L4_010, -3)).toString(), -3),
  [`${ID('l4-010')}:q2`]: R(read(L4_010.b)),
  [`${ID('l4-010')}:q3`]: R(L4_010.a),
  [`${ID('l4-010')}:q4`]: R(img(L4_010, 12)), // counted:false
  // ── Niveau 5 ──
  // BEM 2012 II (officiel) : f(x) = 10x, g(x) = 8x + 500.
  [`${ID('l5-001')}:q1`]: R(img(fn(10, 0), 50)),
  [`${ID('l5-001')}:q2`]: R(img(fn(8, 500), 50)),
  [`${ID('l5-001')}:q3`]: R(ante(fn(10, 0), 1000)),
  [`${ID('l5-001')}:q4`]: R(img(fn(8, 500), ante(fn(10, 0), 1000))),
  [`${ID('l5-001')}:q5`]: R(ante(fn(8, 500), 3300)),
  [`${ID('l5-001')}:q6`]: R(img(fn(10, 0), ante(fn(8, 500), 3300))),
  [`${ID('l5-001')}:q7`]: R(q(10)),
  [`${ID('l5-001')}:q8`]: R(q(8)),
  [`${ID('l5-001')}:q9`]: R(q(500)),
  [`${ID('l5-001')}:q11`]: R(meet(fn(10, 0), fn(8, 500)).x),
  [`${ID('l5-001')}:q12`]: cheapest([img(fn(10, 0), 150), img(fn(8, 500), 150)]),
  [`${ID('l5-001')}:q13`]: cheapest([img(fn(10, 0), 270), img(fn(8, 500), 270)]),
  // l5-002 : unités 6 s et 12 m.
  [`${ID('l5-002')}:q1`]: R(read(L5_002D.b, 12)),
  [`${ID('l5-002')}:q2`]: R(L5_002D.a),
  [`${ID('l5-002')}:q3`]: R(read(img(L5_002D, read(18, 6)), 12)),
  [`${ID('l5-002')}:q4`]: R(read(ante(L5_002D, 0), 6)),
  [`${ID('l5-002')}:q5`]: RP(meet(L5_002D, L5_002T)),
  [`${ID('l5-002')}:q6`]: R(meet(fn(-2, 60), fn(3, 0)).x),
  // l5-003 : f(x) = 4000x, g(x) = 2500x + 9000.
  [`${ID('l5-003')}:q1`]: R(img(fn(4000, 0), 2)),
  [`${ID('l5-003')}:q2`]: R(img(fn(2500, 9000), 2)),
  [`${ID('l5-003')}:q3`]: R(img(fn(4000, 0), 10)),
  [`${ID('l5-003')}:q4`]: R(img(fn(2500, 9000), 10)),
  [`${ID('l5-003')}:q5`]: P(0, img(fn(2500, 9000), 0).toString()),
  [`${ID('l5-003')}:q6`]: R(img(fn(2500, 9000), 4)),
  [`${ID('l5-003')}:q8`]: R(meet(fn(4000, 0), fn(2500, 9000)).x),
  [`${ID('l5-003')}:q9`]: cheapest([img(fn(4000, 0), 8), img(fn(2500, 9000), 8)]),
  // l5-004 : unité 1500DA ; (D1), (D2), (D3).
  [`${ID('l5-004')}:q1`]: R(read(L5_004[1].b, 1500)),
  [`${ID('l5-004')}:q2`]: R(L5_004[1].a),
  [`${ID('l5-004')}:q3`]: R(read(img(L5_004[1], 8), 1500)),
  [`${ID('l5-004')}:q4`]: R(read(ante(L5_004[0], read(4500, 1500)), 1)),
  [`${ID('l5-004')}:q5`]: R(read(ante(L5_004[1], L5_004[2].b), 1)),
  [`${ID('l5-004')}:q6`]: cheapest(L5_004.map((L) => img(L, 7))),
  // l5-005 : f(x) = 1500x, g(x) = 1000x + 2000, h(x) = 600x + 4000.
  [`${ID('l5-005')}:q1`]: R(img(fn(1500, 0), 3)),
  [`${ID('l5-005')}:q2`]: R(img(fn(1000, 2000), 3)),
  [`${ID('l5-005')}:q3`]: R(img(fn(600, 4000), 3)),
  [`${ID('l5-005')}:q4`]: P(0, img(fn(600, 4000), 0).toString()),
  [`${ID('l5-005')}:q5`]: R(img(fn(1000, 2000), 6)),
  [`${ID('l5-005')}:q7`]: R(meet(fn(1000, 2000), fn(600, 4000)).x),
  // l5-006 : f(x) = 400x, g(x) = 200x + 3000 ; unités 5 enfants et 1000DA.
  [`${ID('l5-006')}:q1`]: R(img(fn(400, 0), 20)),
  [`${ID('l5-006')}:q2`]: R(img(fn(200, 3000), 20)),
  [`${ID('l5-006')}:q3`]: viaB([L5_006D, L5_006T], fn(200, 3000).b),
  [`${ID('l5-006')}:q4`]: R(read(img(L5_006T, read(25, 5)), 1000)),
  [`${ID('l5-006')}:q5`]: R(read(ante(L5_006D, read(4000, 1000)), 5)),
  [`${ID('l5-006')}:q6`]: R(read(meet(L5_006D, L5_006T).x, 5)),
  [`${ID('l5-006')}:q7`]: cheapest([img(fn(400, 0), 12), img(fn(200, 3000), 12)]),
  // l5-007 : ABCD rectangle 16m × 10m, AM = x : f(x) = AM·AD/2, g(x) = (16 − x)·10/2 ; unités 2m et 10m².
  [`${ID('l5-007')}:q1`]: R(q(10).div(2)), // counted:false (géométrie)
  [`${ID('l5-007')}:q3`]: viaB([L5_007D, L5_007T], img(fn(-5, 80), 0)),
  [`${ID('l5-007')}:q4`]: R(read(ante(L5_007T, read(60, 10)), 2)),
  [`${ID('l5-007')}:q5`]: R(read(img(L5_007D, read(10, 2)), 10)),
  [`${ID('l5-007')}:q6`]: R(read(meet(L5_007D, L5_007T).x, 2)),
  // l5-008 : f(x) = 500x + 30000, g(x) = 1000x + 20000.
  [`${ID('l5-008')}:q1`]: R(img(fn(500, 30000), 12)),
  [`${ID('l5-008')}:q2`]: R(img(fn(1000, 20000), 12)),
  [`${ID('l5-008')}:q3`]: P(0, img(fn(1000, 20000), 0).toString()),
  [`${ID('l5-008')}:q4`]: R(img(fn(500, 30000), 40)),
  [`${ID('l5-008')}:q6`]: RP(meet(fn(500, 30000), fn(1000, 20000))),
  // l5-009 : f(x) = 300x, g(x) = 200x + 1000 ; 4200DA.
  [`${ID('l5-009')}:q1`]: R(ante(fn(300, 0), 4200)),
  [`${ID('l5-009')}:q2`]: R(ante(fn(200, 1000), 4200)),
  [`${ID('l5-009')}:q3`]: P(0, img(fn(200, 1000), 0).toString()),
  [`${ID('l5-009')}:q4`]: R(img(fn(200, 1000), 5)),
  // l5-010 : unité 2000DA ; (D1), (D2), (D3).
  [`${ID('l5-010')}:q1`]: R(img(fn(2000, 0), 3)),
  [`${ID('l5-010')}:q2`]: R(read(L5_010[1].b, 2000)),
  [`${ID('l5-010')}:q3`]: R(L5_010[1].a),
  [`${ID('l5-010')}:q4`]: R(read(ante(L5_010[0], read(14000, 2000)), 1)),
  [`${ID('l5-010')}:q5`]: cheapest(L5_010.map((L) => img(L, 6))),
};
