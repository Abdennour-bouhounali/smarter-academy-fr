// Oracle du banc « inshaat-talis » au format BEM (unité 9 « خاصية طالس », leçon 3 « إنشاءات هندسية وتطبيقات خاصية طالس
// (تقسيم قطعة مستقيم) », banque réécrite le 2026-10-08) — chaque réponse non selfCheck RECALCULÉE ici en rationnels exacts
// (helpers.mjs) à partir des nombres de l'ÉNONCÉ, avec les formules de ce fichier (jamais packages/core/arithmetic/thales.js) :
//   part(k, n)        AM/AB quand M est la k-ième graduation sur n (rayon auxiliaire) : k / n ;
//   inside(p, q)      AM/AB pour M ∈ [AB] avec MA/MB = p/q : p / (p + q) (parties : le tout est la SOMME) ;
//   outside(p, q)     AN/AB pour N ∈ (AB) hors de [AB] avec NA/NB = p/q : p / |p − q| (le tout est la DIFFÉRENCE) ;
//   afterB(p, q)      N hors de [AB] est du côté de B ssi p > q (NA > NB) ;
//   fourth(a, b, c)   le x de a/b = c/x (rayons [Ox), [Oy) : OC = a, OD = b, OE = c, (CE)//(DF)) : x = b × c ÷ a ;
//   sqrtQ(v)          racine EXACTE d'un carré rationnel (Pythagore, étapes counted:false) — erreur sinon ;
//   coef(sq, r)       le a de « a√r » pour une longueur dont le carré vaut sq (a = √(sq / r), exact) — erreur sinon.
// Questions fermées (نعم / لا) : C('A') = نعم, C('B') = لا, décidé par un calcul (position d'un point, égalité de rapports).
// FIGURES : chaque figure DESSINÉE est relue dans son fichier : longueurs de l'énoncé (une seule échelle par figure, 1e-9),
// graduations ÉGALES et alignées (`steps` : X0, X1, …, Xn consécutifs, même pas, même sens), parallèles, angles droits,
// rapports réalisés (|PQ| / |RS| = r) et appartenances (« Y entre X et Z »). Le contrôle s'exécute au chargement : une
// figure fausse fait échouer l'import (donc le test). Banc généré par le script de l'auteur (Python, fractions exactes,
// scratchpad/inshaat/) ; ce calcul JS en est indépendant.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { R, C, q } from './helpers.mjs';

const part = (k, n) => q(k).div(n);
const inside = (p, qq) => q(p).div(q(p).add(qq));
const outside = (p, qq) => { const d = q(p).sub(qq); return q(p).div(d.n < 0n ? d.neg() : d); };
const afterB = (p, qq) => q(p).sub(qq).n > 0n;
const fourth = (a, b, c) => q(b).mul(c).div(a);
const sq = (a) => q(a).mul(a);
const yes = (b) => C(b ? 'A' : 'B');
function sqrtQ(v) {
  const x = q(v);
  const r = (n) => {
    if (n < 0n) throw new Error('sqrtQ: négatif');
    let s = BigInt(Math.floor(Math.sqrt(Number(n))));
    while (s * s > n) s -= 1n;
    while ((s + 1n) * (s + 1n) <= n) s += 1n;
    if (s * s !== n) throw new Error(`sqrtQ: ${n} n'est pas un carré`);
    return s;
  };
  return q(`${r(x.n)}/${r(x.d)}`);
}
const coef = (square, radicand) => sqrtQ(q(square).div(radicand));
const eq = (a, b) => q(a).sub(b).isZero();
const must = (cond, msg) => { if (!cond) throw new Error(`oracle inshaat-talis : ${msg}`); };

/* Valeurs intermédiaires recalculées */
const L2_005_CE = sqrtQ(sq(3).add(sq(4)));                      // l'énoncé donne CE = 5 : vérifié (O droit)
must(eq(L2_005_CE, 5), 'l2-005 : CE ≠ 5');
const L3_005_BC = sqrtQ(sq(8).add(sq(6)));
const L4_005_FG = sqrtQ(sq(4).add(sq(3)));
const L4_005_EL = part(2, 3).mul(4);
const L4_005_EP = part(2, 3).mul(3);
const L4_005_LP = part(2, 3).mul(L4_005_FG);
const L4_005_A1 = q(4).mul(3).div(2);
const L4_005_A2 = L4_005_EL.mul(L4_005_EP).div(2);
must(eq(L4_005_A2, sq(part(2, 3)).mul(L4_005_A1)), 'l4-005 : A2 ≠ (2/3)² A1');
const L4_009_X = fourth(4, 6, 5);
const L4_009_Y = fourth(6, 4, 5);
const L5_001_AM = inside(4, 5).mul(9);                           // cm sur le plan
const L5_001_AMm = L5_001_AM.mul(500).div(100);                  // m réels
must(eq(q(1200000).add(1500000), 2700000), 'l5-001 : le prix total ≠ somme des apports');
const L5_003_BC = fourth(3, '4.2', 45);                          // 3 cm ↔ 45 km ; 4,2 cm ↔ BC
const L5_004_M = fourth(4, 14, 500);
const L5_004_OF = fourth(2, 7, '2.5');                        // 1 cm = 2 personnes ; 1 cm = 200 g
must(eq(L5_004_OF.mul(200), L5_004_M), 'l5-004 : OF × 200 g ≠ la masse');
const L5_006_X = fourth(15, 6, 10);
const L5_007_AC = sqrtQ(sq(60).add(sq(45)));
const L5_007_TH = part(2, 5).mul(45);
const L5_008_AM = inside(4, 3).mul(7);
const L5_009_A = coef(sq(30).add(sq(30)), 2);
const L5_010_MN = part(1, 3).mul(72);
const L5_010_PQ = part(2, 3).mul(72);

export const ORACLE = {
  // ── المستوى 1 ──
  'ex-4am-inshaat-talis-l1-001:q1': R(part(2, 3)),                               // BD = 2 BC, BE = 3 BC
  'ex-4am-inshaat-talis-l1-001:q2': R(part(2, 3).mul('7.5')),
  'ex-4am-inshaat-talis-l1-002:q2': R(part(2, 3).mul(5)),
  'ex-4am-inshaat-talis-l1-003:q2': R(part(3, 5).mul(8)),
  'ex-4am-inshaat-talis-l1-003:q3': R(q(8).sub(part(3, 5).mul(8))),
  'ex-4am-inshaat-talis-l1-004:q1': R(part(4, 6)),
  'ex-4am-inshaat-talis-l1-004:q2': R(part(4, 6).mul(9)),
  'ex-4am-inshaat-talis-l1-005:q1': R(5 - 1),
  'ex-4am-inshaat-talis-l1-005:q2': R(part(1, 5).mul(12)),
  'ex-4am-inshaat-talis-l1-006:q1': yes(eq(part(2, 2 * 3), part(3, 3 * 3))),      // AP1/AP3 avec 2 cm et 3 cm
  'ex-4am-inshaat-talis-l1-006:q2': R(part(2 * 2, 3 * 2)),
  'ex-4am-inshaat-talis-l1-007:q2': R(fourth(3, 7, 5)),
  'ex-4am-inshaat-talis-l1-008:q1': R(fourth(2, 5, 3)),
  'ex-4am-inshaat-talis-l1-009:q1': R(inside(2, 3)),
  'ex-4am-inshaat-talis-l1-009:q2': R(inside(2, 3).mul(7)),
  'ex-4am-inshaat-talis-l1-010:q1': R(sq(1).add(sq(1))),
  'ex-4am-inshaat-talis-l1-010:q2': R(part(2, 3).mul(coef(sq(1).add(sq(1)), 2))),
  // ── المستوى 2 ──
  'ex-4am-inshaat-talis-l2-001:q1': R(part(3, 7).d),                              // le dénominateur : 7 parts
  'ex-4am-inshaat-talis-l2-001:q2': R(part(3, 7).n),
  'ex-4am-inshaat-talis-l2-001:q4': R(part(3, 7).mul('8.4')),
  'ex-4am-inshaat-talis-l2-002:q1': R(part(5, 8)),
  'ex-4am-inshaat-talis-l2-002:q2': R(q(5).div(8 - 5)),
  'ex-4am-inshaat-talis-l2-002:q3': R(part(5, 8).mul(12)),
  'ex-4am-inshaat-talis-l2-002:q4': R(q(12).sub(part(5, 8).mul(12))),
  'ex-4am-inshaat-talis-l2-003:q2': R(inside(3, 2)),
  'ex-4am-inshaat-talis-l2-003:q3': R(q(1).sub(inside(3, 2)).mul(10)),
  'ex-4am-inshaat-talis-l2-004:q1': R(q(3).div(2)),                               // MA/MB = AF/BE (papillon)
  'ex-4am-inshaat-talis-l2-004:q2': R(inside(3, 2).mul(6)),
  'ex-4am-inshaat-talis-l2-005:q1': R(fourth(3, '7.5', 4)),
  'ex-4am-inshaat-talis-l2-005:q2': R(fourth(3, '7.5', L2_005_CE)),
  'ex-4am-inshaat-talis-l2-006:q1': R(q(3).div(7)),
  'ex-4am-inshaat-talis-l2-007:q1': R(q(7).mul(q(10).div(7)).div(2)),            // AD = AC × AB ÷ AE
  'ex-4am-inshaat-talis-l2-007:q3': R(fourth(7, 5, 3)),
  'ex-4am-inshaat-talis-l2-008:q1': R(sq(2).add(sq(3))),
  'ex-4am-inshaat-talis-l2-008:q3': R(part(2, 3).mul(coef(sq(2).add(sq(3)), 13))),
  'ex-4am-inshaat-talis-l2-008:q4': R(part(2, 3).mul(3)),
  'ex-4am-inshaat-talis-l2-009:q2': R(part(1, 4).mul(9)),
  'ex-4am-inshaat-talis-l2-009:q3': R(part(3, 4).mul(9)),
  'ex-4am-inshaat-talis-l2-010:q1': R(part(3, 5)),
  'ex-4am-inshaat-talis-l2-010:q2': R(part(3, 5).mul(10)),
  'ex-4am-inshaat-talis-l2-010:q3': R(q(8).sub(part(3, 5).mul(8))),
  // ── المستوى 3 ──
  'ex-4am-inshaat-talis-l3-001:q1': yes(part(4, 9).sub(1).n > 0n),               // après B ⇔ AM > AB
  'ex-4am-inshaat-talis-l3-001:q3': R(part(4, 9).add(1)),                         // A entre M et B
  'ex-4am-inshaat-talis-l3-002:q2': R(inside(11, 7)),
  'ex-4am-inshaat-talis-l3-002:q3': R(inside(11, 7).mul(9)),
  'ex-4am-inshaat-talis-l3-003:q1': R(part(1, 3)),
  'ex-4am-inshaat-talis-l3-003:q2': R(part(2, 3)),
  'ex-4am-inshaat-talis-l3-003:q4': R(part(2, 3).mul('7.5')),
  'ex-4am-inshaat-talis-l3-004:q1': R(q(3).div(2)),                               // NA/NB = AK/BE
  'ex-4am-inshaat-talis-l3-004:q2': R(outside(3, 2)),
  'ex-4am-inshaat-talis-l3-004:q3': R(outside(3, 2).mul(5)),
  'ex-4am-inshaat-talis-l3-004:q4': R(outside(3, 2).mul(5).sub(inside(3, 2).mul(5))),
  'ex-4am-inshaat-talis-l3-005:q1': R(L3_005_BC),
  'ex-4am-inshaat-talis-l3-005:q3': R(part(2, 5).mul(8)),
  'ex-4am-inshaat-talis-l3-005:q4': R(part(2, 5).mul(L3_005_BC)),
  'ex-4am-inshaat-talis-l3-006:q1': R(sq(1).add(sq(3))),
  'ex-4am-inshaat-talis-l3-006:q3': R(part(3, 5).mul(coef(sq(1).add(sq(3)), 10))),
  'ex-4am-inshaat-talis-l3-006:q4': R(sq(part(3, 5)).mul(sq(1).add(sq(3)))),
  'ex-4am-inshaat-talis-l3-007:q1': R(part(2, 5)),
  'ex-4am-inshaat-talis-l3-007:q2': R(q(2).div(5 - 2)),
  'ex-4am-inshaat-talis-l3-007:q3': R(part(5 - 2, 5).mul('6.5')),
  'ex-4am-inshaat-talis-l3-008:q1': R(q(3).div(2)),                               // 3 graduations côté A, 2 côté B
  'ex-4am-inshaat-talis-l3-008:q2': yes(eq(q(3).div(2), q(2).div(3))),
  'ex-4am-inshaat-talis-l3-008:q4': R(inside(3, 2).sub(inside(2, 3)).mul(10)),
  'ex-4am-inshaat-talis-l3-009:q2': R(inside(2, 5).mul(7)),
  'ex-4am-inshaat-talis-l3-009:q3': R(inside(5, 2).mul(7)),
  'ex-4am-inshaat-talis-l3-009:q4': R(inside(5, 2).mul(7).sub(inside(2, 5).mul(7))),
  'ex-4am-inshaat-talis-l3-010:q2': R(part(2, 3).mul(4)),
  'ex-4am-inshaat-talis-l3-010:q3': R(part(2, 3).mul(3)),
  'ex-4am-inshaat-talis-l3-010:q4': R(q(4).add(part(2, 3).mul(4))),
  // ── المستوى 4 ──
  'ex-4am-inshaat-talis-l4-001:q1': yes(afterB(11, 7)),                           // « بعد N » : N joue le rôle de B
  'ex-4am-inshaat-talis-l4-001:q3': R(outside(11, 7)),
  'ex-4am-inshaat-talis-l4-001:q4': R(outside(11, 7).mul(8).sub(8)),
  'ex-4am-inshaat-talis-l4-002:q2': R(inside(2, 5)),
  'ex-4am-inshaat-talis-l4-002:q3': yes(!afterB(2, 5)),                           // avant A ⇔ p < q
  'ex-4am-inshaat-talis-l4-002:q4': R(outside(2, 5)),
  'ex-4am-inshaat-talis-l4-002:q5': R(inside(2, 5).add(outside(2, 5)).mul(7)),
  'ex-4am-inshaat-talis-l4-003:q1': yes(afterB(3, 5)),
  'ex-4am-inshaat-talis-l4-003:q2': R(outside(3, 5)),
  'ex-4am-inshaat-talis-l4-003:q4': R(outside(3, 5).mul(8).add(8)),
  'ex-4am-inshaat-talis-l4-004:q2': R(outside(4, 1)),
  'ex-4am-inshaat-talis-l4-004:q3': R(outside(4, 1).sub(1)),
  'ex-4am-inshaat-talis-l4-004:q4': R(outside(4, 1).mul(6)),
  'ex-4am-inshaat-talis-l4-005:q1': R(L4_005_A1),
  'ex-4am-inshaat-talis-l4-005:q3': R(L4_005_FG),
  'ex-4am-inshaat-talis-l4-005:q4': R(L4_005_LP),
  'ex-4am-inshaat-talis-l4-005:q5': R(L4_005_EL.mul(L4_005_EP).div(L4_005_LP)),
  'ex-4am-inshaat-talis-l4-005:q6': R(L4_005_A2),
  'ex-4am-inshaat-talis-l4-006:q1': R(2 + 3 + 4),
  'ex-4am-inshaat-talis-l4-006:q3': R(part(2, 9).mul(12)),
  'ex-4am-inshaat-talis-l4-006:q4': R(part(2 + 3, 9).mul(12)),
  'ex-4am-inshaat-talis-l4-006:q5': R(part(3, 9).mul(12)),
  'ex-4am-inshaat-talis-l4-007:q1': R(sq(1).add(sq(2))),
  'ex-4am-inshaat-talis-l4-007:q3': R(q(1).sub(part(3, 4)).mul(coef(sq(1).add(sq(2)), 5))),
  'ex-4am-inshaat-talis-l4-007:q4': R(part(3, 4).mul(2)),
  'ex-4am-inshaat-talis-l4-007:q5': R(part(3, 4).mul(1)),
  'ex-4am-inshaat-talis-l4-008:q1': R(q(2).mul(3).add(3)),
  'ex-4am-inshaat-talis-l4-008:q2': R(q(2).div(q(2).mul(3).add(3)).mul(18)),
  'ex-4am-inshaat-talis-l4-008:q3': R(q(18).sub(q(6).div(q(2).mul(3).add(3)).mul(18))),
  'ex-4am-inshaat-talis-l4-009:q2': R(L4_009_X),
  'ex-4am-inshaat-talis-l4-009:q3': R(L4_009_Y),
  'ex-4am-inshaat-talis-l4-009:q4': R(L4_009_X.mul(L4_009_Y)),
  'ex-4am-inshaat-talis-l4-010:q2': R(inside(3, 4).mul(8 - 1)),
  'ex-4am-inshaat-talis-l4-010:q3': R(q(1).add(inside(3, 4).mul(8 - 1))),
  'ex-4am-inshaat-talis-l4-010:q4': yes(afterB(3, 4)),
  'ex-4am-inshaat-talis-l4-010:q5': R(q(1).sub(outside(3, 4).mul(8 - 1))),        // N avant A : abscisse décroissante
  // ── المستوى 5 ──
  'ex-4am-inshaat-talis-l5-001:q1': R(q(1200000).div(1500000)),
  'ex-4am-inshaat-talis-l5-001:q3': R(inside(4, 5)),
  'ex-4am-inshaat-talis-l5-001:q4': R(L5_001_AM),
  'ex-4am-inshaat-talis-l5-001:q5': R(L5_001_AMm),
  'ex-4am-inshaat-talis-l5-001:q6': R(L5_001_AMm.mul(20).mul(q(2700000).div(45 * 20))),
  'ex-4am-inshaat-talis-l5-002:q1': R(9 - 1),
  'ex-4am-inshaat-talis-l5-002:q3': R(q(38).div(9 - 1)),
  'ex-4am-inshaat-talis-l5-002:q4': R(q(9).mul(18500).add(q(38).mul(350))),
  'ex-4am-inshaat-talis-l5-003:q1': R(L5_003_BC),
  'ex-4am-inshaat-talis-l5-003:q2': R(fourth(45, 75, 3)),
  'ex-4am-inshaat-talis-l5-003:q4': R(q(45).add(L5_003_BC).mul(7).div(100).mul(45)),
  'ex-4am-inshaat-talis-l5-004:q1': R(L5_004_M),
  'ex-4am-inshaat-talis-l5-004:q3': R(L5_004_OF),
  'ex-4am-inshaat-talis-l5-004:q4': R(Math.ceil(Number(L5_004_M.n) / Number(L5_004_M.d) / 1000) * 120),
  'ex-4am-inshaat-talis-l5-005:q2': R(part(1, 5).mul(13)),
  'ex-4am-inshaat-talis-l5-005:q3': R(1 + 2 + 3),
  'ex-4am-inshaat-talis-l5-005:q4': R(part(3, 1 + 2 + 3).mul(15)),
  'ex-4am-inshaat-talis-l5-006:q1': R(L5_006_X),
  'ex-4am-inshaat-talis-l5-006:q2': R(q(6).div(15).mul(10)),
  'ex-4am-inshaat-talis-l5-006:q4': R(q(6).mul(L5_006_X).mul('0.5').mul(300)),
  'ex-4am-inshaat-talis-l5-007:q1': R(L5_007_AC),
  'ex-4am-inshaat-talis-l5-007:q3': R(L5_007_AC.div(6 - 1)),
  'ex-4am-inshaat-talis-l5-007:q4': R(part(2, 5).mul(60)),
  'ex-4am-inshaat-talis-l5-007:q5': R(L5_007_TH),
  'ex-4am-inshaat-talis-l5-007:q6': R(L5_007_TH.mul(120)),
  'ex-4am-inshaat-talis-l5-008:q1': R(q(8000).div(6000)),
  'ex-4am-inshaat-talis-l5-008:q3': R(L5_008_AM),
  'ex-4am-inshaat-talis-l5-008:q4': R(L5_008_AM.mul(200000).div(100000)),
  'ex-4am-inshaat-talis-l5-008:q5': R(q('2.5').mul(1200000)),
  'ex-4am-inshaat-talis-l5-009:q1': R(L5_009_A),
  'ex-4am-inshaat-talis-l5-009:q3': R(part(2, 3).mul(L5_009_A)),
  'ex-4am-inshaat-talis-l5-009:q4': R(q(30).sub(part(2, 3).mul(30))),
  'ex-4am-inshaat-talis-l5-009:q5': R(part(2, 3).mul(L5_009_A).mul('1.41').mul(9).mul(40)),
  'ex-4am-inshaat-talis-l5-010:q2': R(L5_010_MN),
  'ex-4am-inshaat-talis-l5-010:q3': R(L5_010_PQ),
  'ex-4am-inshaat-talis-l5-010:q4': R(L5_010_MN.mul(100).div(1000)),
  'ex-4am-inshaat-talis-l5-010:q5': R(L5_010_MN.add(L5_010_PQ).mul(650)),
};

/**
 * Les figures DESSINÉES : `lengths` [P, Q, longueur] (une échelle), `ratios` [P, Q, R, S, r], `parallel` [A, B, C, D],
 * `perp` [A, B, C, D], `between` [X, Y, Z] (Y strictement entre X et Z, alignés), `steps` [X0, X1, …, Xn] (graduations :
 * pas égaux, alignées, même sens).
 */
const P = (k) => `P${'₀₁₂₃₄₅₆₇₈₉'[k]}`;
const ray = (n) => ['A', ...Array.from({ length: n }, (_, i) => P(i + 1))];
export const FIGURES = {
  'ex-4am-inshaat-talis-l1-001': { steps: [['B', 'C', 'D', 'E']], ratios: [['B', 'M', 'B', 'A', '1/3'], ['B', 'N', 'B', 'A', '2/3']], between: [['B', 'M', 'A'], ['B', 'N', 'A']], parallel: [['C', 'M', 'A', 'E'], ['D', 'N', 'A', 'E']] },
  'ex-4am-inshaat-talis-l1-004': { steps: [ray(6)], between: [['A', 'M', 'B']], parallel: [[P(4), 'M', P(6), 'B']], ratios: [['A', 'M', 'A', 'B', '2/3']] },
  'ex-4am-inshaat-talis-l1-008': { lengths: [['A', 'C', 2], ['A', 'D', 5], ['A', 'E', 3], ['A', 'B', 7.5]], between: [['A', 'C', 'D'], ['A', 'E', 'B']], parallel: [['C', 'E', 'D', 'B']] },
  'ex-4am-inshaat-talis-l2-002': { steps: [ray(8)], lengths: [['A', 'B', 12], ['A', 'M', 7.5]], between: [['A', 'M', 'B']], parallel: [[P(5), 'M', P(8), 'B']] },
  'ex-4am-inshaat-talis-l2-004': { steps: [['A', 'f1', 'f2', 'F'], ['B', 'e1', 'E']], lengths: [['A', 'F', 3], ['B', 'E', 2]], parallel: [['A', 'F', 'B', 'E']], between: [['A', 'M', 'B'], ['F', 'M', 'E']], ratios: [['M', 'A', 'M', 'B', '3/2']] },
  'ex-4am-inshaat-talis-l2-005': { lengths: [['O', 'C', 3], ['O', 'D', 7.5], ['O', 'E', 4], ['C', 'E', 5], ['O', 'F', 10], ['D', 'F', 12.5]], perp: [['O', 'C', 'O', 'E']], between: [['O', 'C', 'D'], ['O', 'E', 'F']], parallel: [['C', 'E', 'D', 'F']] },
  'ex-4am-inshaat-talis-l2-006': { lengths: [['A', 'C', 3], ['A', 'D', 7], ['A', 'E', 2], ['A', 'B', '14/3']], between: [['A', 'C', 'D'], ['A', 'E', 'B']], parallel: [['C', 'E', 'D', 'B']] },
  'ex-4am-inshaat-talis-l2-010': { lengths: [['B', 'C', 10], ['A', 'C', 8]], steps: [['A', 'g1', 'g2', 'M', 'g4', 'B']], between: [['A', 'N', 'C'], ['A', 'h1', 'h2'], ['h2', 'N', 'h4'], ['N', 'h4', 'C']], parallel: [['M', 'N', 'B', 'C'], ['g1', 'h1', 'B', 'C'], ['g2', 'h2', 'B', 'C'], ['g4', 'h4', 'B', 'C']], ratios: [['A', 'N', 'A', 'C', '3/5']] },
  'ex-4am-inshaat-talis-l3-004': { steps: [['A', 'f1', 'f2', 'F'], ['A', 'k1', 'k2', 'K'], ['B', 'e1', 'E']], lengths: [['A', 'F', 3], ['A', 'K', 3], ['B', 'E', 2]], between: [['F', 'A', 'K'], ['A', 'M', 'B'], ['F', 'M', 'E'], ['A', 'B', 'N'], ['K', 'E', 'N']], parallel: [['F', 'K', 'B', 'E']], ratios: [['M', 'A', 'M', 'B', '3/2'], ['N', 'A', 'N', 'B', '3/2'], ['A', 'N', 'A', 'B', '3']] },
  'ex-4am-inshaat-talis-l3-007': { steps: [ray(5)], lengths: [['A', 'B', 6.5], ['M', 'B', 3.9]], between: [['A', 'M', 'B']], parallel: [[P(2), 'M', P(5), 'B']] },
  'ex-4am-inshaat-talis-l5-005': { lengths: [['A', 'B', 13]], steps: [['O0', 'O1', 'O2', 'O3', 'O4', 'O5'], ['A', 'M₁', 'M₂', 'M₃', 'M₄', 'B']], parallel: [1, 2, 3, 4, 5].map((k) => ['O0', 'R0', `O${k}`, `R${k}`]), between: [1, 2, 3, 4].map((k) => [`O${k}`, `M${'₀₁₂₃₄'[k]}`, `R${k}`]).concat([['O0', 'A', 'R0'], ['O5', 'B', 'R5']]) },
  'ex-4am-inshaat-talis-l5-007': { lengths: [['A', 'B', 60], ['B', 'C', 45], ['A', 'C', 75], ['A', 'H', 24], ['T', 'H', 18]], perp: [['A', 'B', 'B', 'C'], ['A', 'B', 'T', 'H'], ['A', 'D', 'D', 'C']], between: [['A', 'T', 'C'], ['A', 'H', 'B']], ratios: [['A', 'T', 'A', 'C', '2/5']] },
  'ex-4am-inshaat-talis-l5-010': { lengths: [['A', 'B', 90], ['B', 'C', 72], ['M', 'N', 24], ['P', 'Q', 48]], steps: [['A', 'M', 'P', 'B']], between: [['A', 'N', 'C'], ['A', 'Q', 'C'], ['N', 'Q', 'C']], parallel: [['M', 'N', 'B', 'C'], ['P', 'Q', 'B', 'C']] },
};

/* ── Vérification des figures au chargement ─────────────────────────────── */
const here = dirname(fileURLToPath(import.meta.url));
const bank = join(here, '../../content/practice/4am/inshaat-talis');
const num = (v) => { const x = q(v); return Number(x.n) / Number(x.d); };
const d = (Pt, a, b) => Math.hypot(Pt[a][0] - Pt[b][0], Pt[a][1] - Pt[b][1]);
const vec = (Pt, a, b) => [Pt[b][0] - Pt[a][0], Pt[b][1] - Pt[a][1]];
const close = (x, y) => Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(y));
const cross = (u, v) => u[0] * v[1] - u[1] * v[0];
const dot = (u, v) => u[0] * v[0] + u[1] * v[1];
const problems = [];
for (let level = 1; level <= 5; level += 1) {
  for (let i = 1; i <= 10; i += 1) {
    const id = `ex-4am-inshaat-talis-l${level}-${String(i).padStart(3, '0')}`;
    const ex = JSON.parse(readFileSync(join(bank, `level-${level}`, `${id}.json`), 'utf8'));
    const fig = ex.statement?.figure;
    if (!fig) { if (FIGURES[id]) problems.push(`${id}: contrôle déclaré mais aucune figure`); continue; }
    const spec = FIGURES[id];
    if (!spec) { problems.push(`${id}: figure dessinée sans contrôle dans FIGURES`); continue; }
    const Pt = fig.points;
    const known = (...ns) => ns.every((n) => { if (!Pt[n]) problems.push(`${id}: point ${n} absent`); return !!Pt[n]; });
    const scales = (spec.lengths ?? []).filter(([a, b]) => known(a, b)).map(([a, b, v]) => d(Pt, a, b) / num(v));
    if (scales.some((s) => !close(s, scales[0]))) problems.push(`${id}: longueurs non proportionnelles à l'énoncé`);
    for (const [a, b, c, e, r] of spec.ratios ?? []) {
      if (!known(a, b, c, e)) continue;
      const got = d(Pt, a, b) / d(Pt, c, e);
      if (!close(got, num(r))) problems.push(`${id}: |${a}${b}|/|${c}${e}| = ${got} ≠ ${r}`);
    }
    for (const [a, b, c, e] of spec.parallel ?? []) {
      if (!known(a, b, c, e)) continue;
      if (Math.abs(cross(vec(Pt, a, b), vec(Pt, c, e))) > 1e-9 * d(Pt, a, b) * d(Pt, c, e)) problems.push(`${id}: (${a}${b}) non parallèle à (${c}${e})`);
    }
    for (const [a, b, c, e] of spec.perp ?? []) {
      if (!known(a, b, c, e)) continue;
      if (Math.abs(dot(vec(Pt, a, b), vec(Pt, c, e))) > 1e-9 * d(Pt, a, b) * d(Pt, c, e)) problems.push(`${id}: (${a}${b}) non perpendiculaire à (${c}${e})`);
    }
    for (const [x, y, z] of spec.between ?? []) {
      if (!known(x, y, z)) continue;
      const u = vec(Pt, x, y); const v = vec(Pt, y, z);
      if (Math.abs(cross(u, v)) > 1e-9 * d(Pt, x, y) * d(Pt, y, z) || dot(u, v) <= 0) problems.push(`${id}: ${y} n'est pas entre ${x} et ${z}`);
    }
    for (const chain of spec.steps ?? []) {
      if (!known(...chain)) continue;
      const step = d(Pt, chain[0], chain[1]);
      for (let k = 1; k < chain.length - 1; k += 1) {
        const [x, y, z] = chain.slice(k - 1, k + 2);
        const u = vec(Pt, x, y); const v = vec(Pt, y, z);
        if (!close(d(Pt, y, z), step)) problems.push(`${id}: graduation ${y}${z} ≠ ${chain[0]}${chain[1]}`);
        if (Math.abs(cross(u, v)) > 1e-9 * step * step || dot(u, v) <= 0) problems.push(`${id}: graduations ${x}, ${y}, ${z} non alignées dans le même sens`);
      }
    }
    for (const [a, v0, b] of fig.rightAngles ?? []) {
      const u = vec(Pt, v0, a); const w = vec(Pt, v0, b);
      if (Math.abs(dot(u, w)) > 1e-9 * Math.hypot(...u) * Math.hypot(...w)) problems.push(`${id}: angle droit ${a}${v0}${b} faux`);
    }
  }
}
if (problems.length) throw new Error(`oracle inshaat-talis — figures inexactes :\n${problems.join('\n')}`);
