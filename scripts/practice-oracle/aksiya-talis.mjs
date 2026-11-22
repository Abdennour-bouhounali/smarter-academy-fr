// Oracle du banc « aksiya-talis » au format BEM (unité 9 « خاصية طالس », leçon 2 « الخاصية العكسية لخاصية طالس وإثبات
// التوازي », banque réécrite le 2026-10-08) — chaque réponse non selfCheck RECALCULÉE ici en rationnels exacts (helpers.mjs)
// à partir des nombres de l'ÉNONCÉ, avec les formules de ce fichier (jamais packages/core/arithmetic/thales.js) :
//   ratio(a, b)        le rapport a / b (longueurs mesurées depuis le sommet commun) ;
//   num(a, b, d)       le x de  a/b = x/d   (x = a × d ÷ b) — Thalès direct, une longueur de l'image ;
//   par(p1, P1, p2, P2) la RÉCIPROQUE : sur deux droites sécantes en O, les points d'abscisses SIGNÉES p1, P1 (droite 1) et
//                      p2, P2 (droite 2) donnent deux droites parallèles ssi p1/P1 = p2/P2 en valeur SIGNÉE — c'est-à-dire
//                      rapports égaux ET même ordre (le piège de l'ordre est un rapport égal de signe contraire) ;
//   sameOrder(...)     même ordre des points (signes des abscisses relatives) ;
//   sqrtQ(v)           racine EXACTE d'un carré rationnel (Pythagore, étapes counted:false) — erreur sinon ;
//   degRound(r)        angle arrondi au degré (trigonométrie, étapes counted:false des sujets).
// Questions fermées : C('A' | 'B' | 'C') décidé par un calcul (A = « نعم », B = « لا » dans les questions نعم / لا).
// FIGURES : chaque figure DESSINÉE est relue dans son fichier et doit respecter les longueurs de l'énoncé (toutes à la même
// échelle, à 1e-9 près), ses angles droits, ses parallèles, ses NON-parallèles (une figure « غير متوازيين » ne doit pas
// l'être, même de peu) et l'ordre des points (« Y entre X et Z ») — le piège de l'ordre est dessiné fidèlement.
// Le contrôle s'exécute au chargement : une figure fausse fait échouer l'import (donc le test).
// Banc généré par le script de l'auteur (Python, fractions exactes) ; ce calcul JS en est indépendant.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { R, C, P, q, solve2 } from './helpers.mjs';

const ratio = (a, b) => q(a).div(b);
const num = (a, b, d) => q(a).mul(q(d)).div(q(b));
const add = (a, b) => q(a).add(b);
const sub = (a, b) => q(a).sub(b);
const par = (p1, P1, p2, P2) => q(p1).div(P1).sub(q(p2).div(P2)).isZero();
const sgn = (x) => (x.n > 0n ? 1 : -1);
const sameOrder = (p1, P1, p2, P2) => sgn(q(p1).div(P1)) === sgn(q(p2).div(P2));
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
const sq = (a) => q(a).mul(a);
const degRound = (rad) => String(Math.round((rad * 180) / Math.PI));

/* Valeurs intermédiaires recalculées */
const L3_009 = solve2(1, 1, 75, 1, '-1.5', 0);                         // OA + OB = 75 ; OA − 1,5 OB = 0
const L4_005_AC = sqrtQ(sub(sq('7.5'), sq('4.5')));                  // Pythagore
const L4_006_LK = num(30, add(30, 20), 30);                           // AK/AB = LK/BC, BC = AK
const L4_006_LC = sub(q(20).mul(add(30, 20)).div(30), 20);            // AC = AL·AB/AK, LC = AC − AL
const L4_007_OD = sqrtQ(sub(sq(5), sq(4)));
const L4_007_OA = sqrtQ(sub(sq('2.5'), sq('1.5')));
const L4_008_RT = q(6).div('0.6');                                     // sin T = RS / RT
const L5_001_MN = num(16, 40, 25);
const L5_002_MN = num('2.4', 6, '7.5');
const L5_004_OD = q(20).mul(36).div(24);                               // OB/OD = OA/OC
const L5_005_MN = num('2.4', 6, '4.5');
const L5_006_OD = q(4).mul(9).div(6);
const L5_008_MN = num(3, '7.5', 9);
const L5_008_KM = L5_008_MN.mul(100000).div(100000);                   // cm sur le plan → cm réels → km
const L5_009_MN = num(48, 60, 40);
const L5_010_MN = num('1.2', '1.6', '1.2');
/** l4-003 : sur les 4 placements (B′, C′ chacun d'un côté de A), combien donnent (B′C′) // (BC) ? */
function placements() { let n = 0; for (const sb of [1, -1]) for (const sc of [1, -1]) if (par(2 * sb, 6, 3 * sc, 9)) n += 1; return n; }
/** l3-004 : qui compare des valeurs EXACTES ? */
const younesExact = ratio(5, 3).sub('1.7').isZero() && ratio(9, '5.4').sub('1.7').isZero();
const inesExact = ratio(3, 5).sub('0.6').isZero() && ratio('5.4', 9).sub('0.6').isZero();

export const ORACLE = {
  // ── المستوى 1 ──
  'ex-4am-aksiya-talis-l1-001:q1': R(ratio(9, 27)),
  'ex-4am-aksiya-talis-l1-001:q2': R(ratio(12, 36)),
  'ex-4am-aksiya-talis-l1-001:q3': yes(par(9, 27, -12, 36)),
  'ex-4am-aksiya-talis-l1-002:q1': R(ratio(2, 3)),
  'ex-4am-aksiya-talis-l1-002:q2': R(ratio(4, 6)),
  'ex-4am-aksiya-talis-l1-002:q3': yes(par(2, -3, 4, -6)),
  'ex-4am-aksiya-talis-l1-003:q1': R(ratio(2, 8)),
  'ex-4am-aksiya-talis-l1-003:q2': R(ratio(3, 12)),
  'ex-4am-aksiya-talis-l1-003:q3': yes(par(2, 8, 3, 12)),
  'ex-4am-aksiya-talis-l1-004:q1': R(ratio(24, 40)),
  'ex-4am-aksiya-talis-l1-004:q2': R(ratio(18, 30)),
  'ex-4am-aksiya-talis-l1-005:q1': C(sameOrder(9, 27, 12, 36) ? 'A' : 'B'),
  'ex-4am-aksiya-talis-l1-005:q2': yes(par(9, 27, 12, 36)),
  'ex-4am-aksiya-talis-l1-006:q1': R(ratio('1.2', '1.8')),
  'ex-4am-aksiya-talis-l1-006:q2': R(ratio('3.2', '4.8')),
  'ex-4am-aksiya-talis-l1-006:q3': yes(par('1.2', '-1.8', '3.2', '-4.8')),
  'ex-4am-aksiya-talis-l1-007:q1': R(ratio(4, add(4, 2))),
  'ex-4am-aksiya-talis-l1-007:q2': R(ratio(5, add(5, 3))),
  'ex-4am-aksiya-talis-l1-007:q3': yes(par(4, add(4, 2), 5, add(5, 3))),
  'ex-4am-aksiya-talis-l1-008:q1': R(ratio(3, '2.4')),
  'ex-4am-aksiya-talis-l1-008:q2': R(ratio(5, 4)),
  'ex-4am-aksiya-talis-l1-008:q3': yes(par(3, '-2.4', 5, -4)),
  'ex-4am-aksiya-talis-l1-009:q1': R(ratio(3, 10)),
  'ex-4am-aksiya-talis-l1-009:q2': R(ratio(2, 6)),
  'ex-4am-aksiya-talis-l1-009:q3': yes(par(3, 10, 2, 6)),
  'ex-4am-aksiya-talis-l1-010:q1': R(ratio(3, 7)),
  'ex-4am-aksiya-talis-l1-010:q2': R(ratio(4, 9)),
  'ex-4am-aksiya-talis-l1-010:q3': yes(par(3, 7, 4, 9)),
  // ── المستوى 2 ──
  'ex-4am-aksiya-talis-l2-001:q1': R(sub(36, 20)),
  'ex-4am-aksiya-talis-l2-001:q2': R(ratio(sub(36, 20), 36)),
  'ex-4am-aksiya-talis-l2-001:q3': R(ratio(20, 45)),
  'ex-4am-aksiya-talis-l2-001:q4': yes(par(sub(36, 20), 36, 20, 45)),
  'ex-4am-aksiya-talis-l2-002:q1': R(ratio(2, 10)),
  'ex-4am-aksiya-talis-l2-002:q2': R(ratio(3, 15)),
  'ex-4am-aksiya-talis-l2-002:q3': yes(par(2, 10, 3, 15)),
  'ex-4am-aksiya-talis-l2-003:q1': R(ratio(21, 27)),
  'ex-4am-aksiya-talis-l2-003:q2': R(ratio(28, 36)),
  'ex-4am-aksiya-talis-l2-003:q4': R(degRound(Math.atan(27 / 36))),
  'ex-4am-aksiya-talis-l2-004:q1': R(ratio(5, 12)),
  'ex-4am-aksiya-talis-l2-004:q2': R(ratio(4, 9)),
  'ex-4am-aksiya-talis-l2-004:q3': yes(par(5, 12, 4, 9)),
  'ex-4am-aksiya-talis-l2-005:q1': R(ratio(6, 9)),
  'ex-4am-aksiya-talis-l2-005:q2': R(ratio(4, 6)),
  'ex-4am-aksiya-talis-l2-005:q3': yes(par(6, -9, 4, -6)),
  'ex-4am-aksiya-talis-l2-006:q1': R(ratio(9, 27)),
  'ex-4am-aksiya-talis-l2-006:q2': R(ratio(12, 36)),
  'ex-4am-aksiya-talis-l2-006:q3': C(sameOrder(-9, 27, -12, 36) ? 'A' : 'B'),
  'ex-4am-aksiya-talis-l2-006:q4': yes(par(-9, 27, -12, 36)),
  'ex-4am-aksiya-talis-l2-007:q1': R(sqrtQ(add(sq(6), sq(8)))),
  'ex-4am-aksiya-talis-l2-007:q2': R(ratio('4.5', 6)),
  'ex-4am-aksiya-talis-l2-007:q3': R(ratio('7.5', sqrtQ(add(sq(6), sq(8))))),
  'ex-4am-aksiya-talis-l2-008:q1': R(ratio(2, add(2, 3))),
  'ex-4am-aksiya-talis-l2-008:q2': R(ratio('2.4', 6)),
  'ex-4am-aksiya-talis-l2-008:q4': R(num(2, add(2, 3), 7)),
  'ex-4am-aksiya-talis-l2-009:q1': R(sub(8, '2.4')),
  'ex-4am-aksiya-talis-l2-009:q2': R(ratio(sub(8, '2.4'), 8)),
  'ex-4am-aksiya-talis-l2-009:q3': R(ratio('1.2', 6)),
  'ex-4am-aksiya-talis-l2-009:q4': yes(par(sub(8, '2.4'), 8, '1.2', 6)),
  'ex-4am-aksiya-talis-l2-010:q1': R(ratio(3, 6)),
  'ex-4am-aksiya-talis-l2-010:q2': R(ratio(2, 4)),
  'ex-4am-aksiya-talis-l2-010:q3': yes(par(3, -6, 2, 4)),
  // ── المستوى 3 ──
  'ex-4am-aksiya-talis-l3-001:q1': R(ratio('1.5', '3.5')),
  'ex-4am-aksiya-talis-l3-001:q2': R(ratio('1.8', '4.2')),
  'ex-4am-aksiya-talis-l3-001:q4': R(add('3.5', '1.5')),
  'ex-4am-aksiya-talis-l3-001:q5': R(ratio('3.2', '4.6')),
  'ex-4am-aksiya-talis-l3-001:q6': R(ratio('3.5', add('3.5', '1.5'))),
  'ex-4am-aksiya-talis-l3-001:q7': yes(par('3.2', '4.6', '3.5', add('3.5', '1.5'))),
  'ex-4am-aksiya-talis-l3-002:q1': R(ratio(4, 6)),
  'ex-4am-aksiya-talis-l3-002:q2': R(ratio(5, 8)),
  'ex-4am-aksiya-talis-l3-002:q3': yes(par(4, -6, 5, -8)),
  'ex-4am-aksiya-talis-l3-002:q4': R(sqrtQ(add(sq(6), sq(8)))),
  'ex-4am-aksiya-talis-l3-003:q1': R(sub(4, 1)),
  'ex-4am-aksiya-talis-l3-003:q2': R(sub(5, 1)),
  'ex-4am-aksiya-talis-l3-003:q3': R(ratio(sub(4, 1), 4)),
  'ex-4am-aksiya-talis-l3-003:q4': R(ratio(sub(5, 1), 5)),
  'ex-4am-aksiya-talis-l3-003:q5': yes(par(sub(4, 1), 4, sub(5, 1), 5)),
  'ex-4am-aksiya-talis-l3-004:q1': R(ratio(3, 5)),
  'ex-4am-aksiya-talis-l3-004:q2': R(ratio('5.4', 9)),
  'ex-4am-aksiya-talis-l3-004:q3': C(younesExact && inesExact ? 'C' : inesExact ? 'B' : 'A'),
  'ex-4am-aksiya-talis-l3-005:q1': R(ratio(18, '7.5')),
  'ex-4am-aksiya-talis-l3-005:q2': R(ratio(12, 5)),
  'ex-4am-aksiya-talis-l3-005:q4': R(add(sq(12), sq(18))),
  'ex-4am-aksiya-talis-l3-006:q1': R(sqrtQ(add(sq(6), sq(8)))),
  'ex-4am-aksiya-talis-l3-006:q2': R(ratio('1.5', 6)),
  'ex-4am-aksiya-talis-l3-006:q3': R(ratio(2, 8)),
  'ex-4am-aksiya-talis-l3-006:q5': R(degRound(Math.atan(1.5 / 2))),
  'ex-4am-aksiya-talis-l3-007:q1': R(ratio(7, 9)),
  'ex-4am-aksiya-talis-l3-007:q2': R(ratio(10, 13)),
  'ex-4am-aksiya-talis-l3-007:q3': yes(par(7, 9, 10, 13)),
  'ex-4am-aksiya-talis-l3-008:q1': R(sqrtQ(add(sq(9), sq(12)))),
  'ex-4am-aksiya-talis-l3-008:q2': R(ratio(4, 12)),
  'ex-4am-aksiya-talis-l3-008:q3': R(ratio(3, 9)),
  'ex-4am-aksiya-talis-l3-008:q5': R(num(4, 12, sqrtQ(add(sq(9), sq(12))))),
  'ex-4am-aksiya-talis-l3-009:q1': P(L3_009[0], L3_009[1]),
  'ex-4am-aksiya-talis-l3-009:q2': R(L3_009[0]),
  'ex-4am-aksiya-talis-l3-009:q3': R(L3_009[1]),
  'ex-4am-aksiya-talis-l3-009:q4': R(ratio(L3_009[0], L3_009[1])),
  'ex-4am-aksiya-talis-l3-009:q5': R(ratio(54, 36)),
  'ex-4am-aksiya-talis-l3-009:q6': yes(par(L3_009[0], q(L3_009[1]).neg(), 54, -36)),
  'ex-4am-aksiya-talis-l3-010:q1': R(ratio(2, 5)),
  'ex-4am-aksiya-talis-l3-010:q2': R(ratio(3, '7.5')),
  'ex-4am-aksiya-talis-l3-010:q3': C(sameOrder(-2, 5, 3, '7.5') ? 'A' : 'B'),
  'ex-4am-aksiya-talis-l3-010:q4': yes(par(-2, 5, 3, '7.5')),
  // ── المستوى 4 ──
  'ex-4am-aksiya-talis-l4-001:q1': R(add(11, 22)),
  'ex-4am-aksiya-talis-l4-001:q2': R(add(15, 45)),
  'ex-4am-aksiya-talis-l4-001:q3': R(ratio(11, add(11, 22))),
  'ex-4am-aksiya-talis-l4-001:q4': R(ratio(15, add(15, 45))),
  'ex-4am-aksiya-talis-l4-001:q5': yes(par(11, add(11, 22), 15, add(15, 45))),
  'ex-4am-aksiya-talis-l4-002:q1': R(sub(1, ratio(2, 3))),
  'ex-4am-aksiya-talis-l4-002:q2': R(sub(1, ratio(2, 3))),
  'ex-4am-aksiya-talis-l4-003:q1': R(ratio(2, 6)),
  'ex-4am-aksiya-talis-l4-003:q2': R(ratio(3, 9)),
  'ex-4am-aksiya-talis-l4-003:q3': yes(par(-2, 6, -3, 9)),
  'ex-4am-aksiya-talis-l4-003:q4': R(placements()),
  'ex-4am-aksiya-talis-l4-004:q1': R(num(3, 7, 14)),
  'ex-4am-aksiya-talis-l4-004:q2': yes(par(-3, 7, 6, 14)),
  'ex-4am-aksiya-talis-l4-004:q3': R(num(3, 7, '10.5')),
  'ex-4am-aksiya-talis-l4-005:q2': R(L4_005_AC),
  'ex-4am-aksiya-talis-l4-005:q4': R(ratio(q('4.5').div(3), '4.5')),
  'ex-4am-aksiya-talis-l4-005:q5': R(ratio(sub(L4_005_AC, L4_005_AC.mul(2).div(3)), L4_005_AC)),
  'ex-4am-aksiya-talis-l4-005:q7': R(num(q('4.5').div(3), '4.5', '7.5')),
  'ex-4am-aksiya-talis-l4-006:q1': R(L4_006_LK),
  'ex-4am-aksiya-talis-l4-006:q2': R(L4_006_LC),
  'ex-4am-aksiya-talis-l4-006:q3': R(ratio(20, L4_006_LC)),
  'ex-4am-aksiya-talis-l4-006:q4': R(ratio('13.5', L4_006_LK)),
  'ex-4am-aksiya-talis-l4-006:q5': yes(par(20, L4_006_LC.neg(), '13.5', L4_006_LK.neg())),
  'ex-4am-aksiya-talis-l4-007:q1': R(L4_007_OD),
  'ex-4am-aksiya-talis-l4-007:q2': R(L4_007_OA),
  'ex-4am-aksiya-talis-l4-007:q3': R(ratio(L4_007_OA, 4)),
  'ex-4am-aksiya-talis-l4-007:q4': R(ratio('1.5', L4_007_OD)),
  'ex-4am-aksiya-talis-l4-007:q5': yes(par(L4_007_OA.neg(), 4, '-1.5', L4_007_OD)),
  'ex-4am-aksiya-talis-l4-008:q1': R(L4_008_RT),
  'ex-4am-aksiya-talis-l4-008:q2': R(sqrtQ(sub(sq(L4_008_RT), sq(6)))),
  'ex-4am-aksiya-talis-l4-008:q3': R(ratio('2.5', L4_008_RT)),
  'ex-4am-aksiya-talis-l4-008:q4': R(ratio('1.8', 6)),
  'ex-4am-aksiya-talis-l4-008:q5': yes(par('2.5', L4_008_RT, '1.8', 6)),
  'ex-4am-aksiya-talis-l4-009:q1': R(num('2.4', 6, q(10).div(2))),
  'ex-4am-aksiya-talis-l4-009:q2': R(num('2.4', 6, q(10).div(2))),
  'ex-4am-aksiya-talis-l4-010:q1': R(ratio(2, 4)),
  'ex-4am-aksiya-talis-l4-010:q2': R(ratio(q(6).div(2), 6)),
  'ex-4am-aksiya-talis-l4-010:q3': C(sameOrder(-2, 4, 3, 6) ? 'A' : 'B'),
  'ex-4am-aksiya-talis-l4-010:q4': yes(par(-2, 4, 3, 6)),
  'ex-4am-aksiya-talis-l4-010:q5': C(par(2, 4, 3, 6) && ratio(2, 4).sub('1/2').isZero() ? 'A' : par(-2, 4, 3, 6) ? 'B' : 'C'),
  // ── المستوى 5 ──
  'ex-4am-aksiya-talis-l5-001:q1': R(ratio(16, 40)),
  'ex-4am-aksiya-talis-l5-001:q2': R(ratio(10, 25)),
  'ex-4am-aksiya-talis-l5-001:q3': yes(par(16, 40, 10, 25)),
  'ex-4am-aksiya-talis-l5-001:q4': R(L5_001_MN),
  'ex-4am-aksiya-talis-l5-001:q5': R(L5_001_MN.mul(4500).add(12000)),
  'ex-4am-aksiya-talis-l5-002:q1': R(ratio('2.4', 6)),
  'ex-4am-aksiya-talis-l5-002:q2': R(ratio('1.9', '4.5')),
  'ex-4am-aksiya-talis-l5-002:q3': yes(par('2.4', 6, '1.9', '4.5')),
  'ex-4am-aksiya-talis-l5-002:q4': R(num('2.4', 6, '4.5')),
  'ex-4am-aksiya-talis-l5-002:q5': R(L5_002_MN),
  'ex-4am-aksiya-talis-l5-002:q6': R(add(L5_002_MN, '0.2').mul(1200)),
  'ex-4am-aksiya-talis-l5-003:q1': R(ratio(10, 25)),
  'ex-4am-aksiya-talis-l5-003:q2': R(ratio('10.4', 26)),
  'ex-4am-aksiya-talis-l5-003:q3': yes(par(10, -25, '10.4', -26)),
  'ex-4am-aksiya-talis-l5-003:q4': R(num(10, 25, 17)),
  'ex-4am-aksiya-talis-l5-003:q5': R(ratio(12, 25)),
  'ex-4am-aksiya-talis-l5-003:q6': R(ratio('12.6', 26)),
  'ex-4am-aksiya-talis-l5-003:q7': yes(par(12, -25, '12.6', -26)),
  'ex-4am-aksiya-talis-l5-004:q1': R(ratio(24, 36)),
  'ex-4am-aksiya-talis-l5-004:q2': R(ratio(20, 32)),
  'ex-4am-aksiya-talis-l5-004:q3': yes(par(24, -36, 20, -32)),
  'ex-4am-aksiya-talis-l5-004:q4': R(L5_004_OD),
  'ex-4am-aksiya-talis-l5-004:q5': R(add(24, 36).add(add(20, L5_004_OD)).mul(600)),
  'ex-4am-aksiya-talis-l5-005:q1': R(ratio('2.4', 6)),
  'ex-4am-aksiya-talis-l5-005:q2': R(ratio(3, '7.5')),
  'ex-4am-aksiya-talis-l5-005:q4': R(L5_005_MN),
  'ex-4am-aksiya-talis-l5-005:q5': R(L5_005_MN.mul(3).mul(350)),
  'ex-4am-aksiya-talis-l5-006:q1': R(ratio(6, 9)),
  'ex-4am-aksiya-talis-l5-006:q2': R(ratio(4, 6)),
  'ex-4am-aksiya-talis-l5-006:q3': C(sameOrder(6, -9, 4, 6) ? 'A' : 'B'),
  'ex-4am-aksiya-talis-l5-006:q4': yes(par(6, -9, 4, 6)),
  'ex-4am-aksiya-talis-l5-006:q5': R(L5_006_OD),
  'ex-4am-aksiya-talis-l5-006:q6': R(add(4, L5_006_OD)),
  'ex-4am-aksiya-talis-l5-007:q1': R(ratio('2.4', '3.6')),
  'ex-4am-aksiya-talis-l5-007:q2': R(ratio('2.8', '4.2')),
  'ex-4am-aksiya-talis-l5-007:q3': yes(par('2.4', '-3.6', '2.8', '-4.2')),
  'ex-4am-aksiya-talis-l5-007:q4': R(q(3).mul('3.6').div('2.4')),
  'ex-4am-aksiya-talis-l5-007:q5': R(ratio(2, 3)),
  'ex-4am-aksiya-talis-l5-007:q6': R(ratio('2.5', '3.6')),
  'ex-4am-aksiya-talis-l5-007:q7': yes(par(2, -3, '2.5', '-3.6')),
  'ex-4am-aksiya-talis-l5-008:q1': R(ratio(3, '7.5')),
  'ex-4am-aksiya-talis-l5-008:q2': R(ratio('4.2', 10)),
  'ex-4am-aksiya-talis-l5-008:q3': yes(par(3, '7.5', '4.2', 10)),
  'ex-4am-aksiya-talis-l5-008:q4': R(num(3, '7.5', 10)),
  'ex-4am-aksiya-talis-l5-008:q5': R(L5_008_MN),
  'ex-4am-aksiya-talis-l5-008:q6': R(L5_008_KM),
  'ex-4am-aksiya-talis-l5-008:q7': R(L5_008_KM.mul(2500000)),
  'ex-4am-aksiya-talis-l5-009:q1': R(ratio(48, 60)),
  'ex-4am-aksiya-talis-l5-009:q2': R(ratio(60, 75)),
  'ex-4am-aksiya-talis-l5-009:q3': yes(par(48, 60, 60, 75)),
  'ex-4am-aksiya-talis-l5-009:q4': R(L5_009_MN),
  'ex-4am-aksiya-talis-l5-009:q5': R(q(60).add(75).add(40).add(L5_009_MN).div(100).mul(25).mul(80)),
  'ex-4am-aksiya-talis-l5-010:q1': R(ratio('1.2', '1.6')),
  'ex-4am-aksiya-talis-l5-010:q2': R(ratio('1.5', 2)),
  'ex-4am-aksiya-talis-l5-010:q4': R(L5_010_MN),
  'ex-4am-aksiya-talis-l5-010:q5': R(L5_010_MN.mul(8).mul(650)),
};

/**
 * Les figures DESSINÉES, relues dans leur fichier : `lengths` [P, Q, longueur de l'énoncé] (une seule échelle par figure),
 * `ratios` [P, Q, R, S, r] (|PQ| / |RS| = r), `parallel` / `notParallel` [A, B, C, D] ((AB) et (CD)), `perp`, et `between`
 * [X, Y, Z] (Y strictement entre X et Z, alignés).
 */
export const FIGURES = {
  'ex-4am-aksiya-talis-l1-001': { lengths: [['A', 'B', 27], ['A', 'B′', 9], ['A', 'C', 36], ['A', 'C′', 12]], between: [['A', 'B′', 'B'], ['C', 'A', 'C′']], notParallel: [['B', 'C', 'B′', 'C′']] },
  'ex-4am-aksiya-talis-l1-002': { lengths: [['C', 'A', 2], ['C', 'E', 3], ['C', 'B', 4], ['C', 'F', 6]], between: [['A', 'C', 'E'], ['B', 'C', 'F']], parallel: [['A', 'B', 'E', 'F']] },
  'ex-4am-aksiya-talis-l1-003': { lengths: [['A', 'B', 8], ['A', 'B′', 2], ['A', 'C', 12], ['A', 'C′', 3]], between: [['A', 'B′', 'B'], ['A', 'C′', 'C']], parallel: [['B′', 'C′', 'B', 'C']] },
  'ex-4am-aksiya-talis-l1-004': { lengths: [['K', 'E', 24], ['K', 'G', 40], ['K', 'F', 18], ['K', 'H', 30]], between: [['E', 'K', 'G'], ['F', 'K', 'H']], parallel: [['E', 'F', 'G', 'H']], perp: [['E', 'G', 'F', 'H']] },
  'ex-4am-aksiya-talis-l1-005': { ratios: [['A', 'B′', 'A', 'B', '1/3'], ['A', 'C′', 'A', 'C', '1/3']], between: [['A', 'B′', 'B'], ['A', 'C′', 'C']], parallel: [['B′', 'C′', 'B', 'C']] },
  'ex-4am-aksiya-talis-l1-006': { lengths: [['E', 'A', 1.2], ['E', 'C', 1.8], ['E', 'D', 3.2], ['E', 'B', 4.8]], between: [['A', 'E', 'C'], ['D', 'E', 'B']], parallel: [['A', 'D', 'B', 'C']] },
  'ex-4am-aksiya-talis-l1-007': { lengths: [['A', 'M', 4], ['M', 'B', 2], ['A', 'N', 5], ['N', 'C', 3]], between: [['A', 'M', 'B'], ['A', 'N', 'C']], notParallel: [['M', 'N', 'B', 'C']] },
  'ex-4am-aksiya-talis-l1-008': { lengths: [['O', 'M', 3], ['O', 'R', 2.4], ['O', 'N', 5], ['O', 'P', 4]], between: [['M', 'O', 'R'], ['N', 'O', 'P']], parallel: [['M', 'N', 'P', 'R']] },
  'ex-4am-aksiya-talis-l1-010': { lengths: [['A', 'M', 3], ['A', 'B', 7], ['A', 'N', 4], ['A', 'C', 9]], between: [['A', 'M', 'B'], ['A', 'N', 'C']], notParallel: [['M', 'N', 'B', 'C']] },
  'ex-4am-aksiya-talis-l2-001': { lengths: [['A', 'B', 36], ['M', 'B', 20], ['A', 'N', 20], ['A', 'C', 45]], between: [['A', 'M', 'B'], ['A', 'N', 'C']], parallel: [['M', 'N', 'B', 'C']] },
  'ex-4am-aksiya-talis-l2-002': { lengths: [['D', 'C', 10], ['B', 'C', 15], ['A', 'M', 2], ['A', 'N', 3], ['A', 'B', 10], ['A', 'D', 15]], perp: [['A', 'B', 'A', 'D'], ['B', 'C', 'C', 'D']], between: [['A', 'M', 'B'], ['A', 'N', 'D']], parallel: [['M', 'N', 'B', 'D']] },
  'ex-4am-aksiya-talis-l2-003': { lengths: [['M', 'A', 27], ['M', 'I', 36], ['M', 'O', 21], ['M', 'U', 28]], between: [['U', 'M', 'I'], ['O', 'M', 'A']], perp: [['U', 'I', 'O', 'A']], parallel: [['A', 'I', 'O', 'U']] },
  'ex-4am-aksiya-talis-l2-004': { lengths: [['A', 'B', 12], ['A', 'M', 5], ['A', 'C', 9], ['A', 'N', 4]], between: [['A', 'M', 'B'], ['A', 'N', 'C']], notParallel: [['M', 'N', 'B', 'C']] },
  'ex-4am-aksiya-talis-l2-005': { lengths: [['O', 'A', 6], ['O', 'C', 9], ['O', 'B', 4], ['O', 'D', 6]], between: [['A', 'O', 'C'], ['B', 'O', 'D']], parallel: [['A', 'B', 'C', 'D']] },
  'ex-4am-aksiya-talis-l2-006': { lengths: [['A', 'B', 27], ['A', 'B′', 9], ['A', 'C', 36], ['A', 'C′', 12]], between: [['B', 'A', 'B′'], ['C', 'A', 'C′']], parallel: [['B', 'C', 'B′', 'C′']] },
  'ex-4am-aksiya-talis-l2-008': { lengths: [['A', 'E', 2], ['E', 'B', 3], ['A', 'F', 2.4], ['A', 'C', 6], ['B', 'C', 7]], between: [['A', 'E', 'B'], ['A', 'F', 'C']], parallel: [['E', 'F', 'B', 'C']] },
  'ex-4am-aksiya-talis-l2-009': { lengths: [['A', 'B', 8], ['E', 'B', 2.4], ['A', 'D', 6], ['A', 'F', 1.2]], perp: [['A', 'B', 'A', 'D']], between: [['A', 'E', 'B'], ['A', 'F', 'D']], notParallel: [['E', 'F', 'B', 'D']] },
  'ex-4am-aksiya-talis-l2-010': { lengths: [['O', 'A', 3], ['O', 'C', 6], ['O', 'B', 2], ['O', 'D', 4]], between: [['A', 'O', 'C'], ['O', 'B', 'D']], notParallel: [['A', 'B', 'C', 'D']] },
  'ex-4am-aksiya-talis-l3-001': { lengths: [['A', 'D', 3.5], ['D', 'F', 1.5], ['B', 'D', 4.2], ['D', 'C', 1.8], ['A', 'B', 3.2], ['A', 'E', 4.6]], between: [['A', 'D', 'F'], ['B', 'D', 'C'], ['A', 'B', 'E']], parallel: [['C', 'F', 'A', 'B']], notParallel: [['B', 'D', 'E', 'F']] },
  'ex-4am-aksiya-talis-l3-002': { lengths: [['O', 'A', 6], ['O', 'B', 8], ['O', 'C', 4], ['O', 'D', 5]], perp: [['A', 'C', 'B', 'D']], between: [['A', 'O', 'C'], ['B', 'O', 'D']], notParallel: [['A', 'B', 'C', 'D']] },
  'ex-4am-aksiya-talis-l3-003': { lengths: [['A', 'B', 4], ['A', 'C', 5], ['B', 'C', 6], ['B', 'I', 1], ['C', 'J', 1]], between: [['A', 'I', 'B'], ['A', 'J', 'C']], notParallel: [['I', 'J', 'B', 'C']] },
  'ex-4am-aksiya-talis-l3-004': { lengths: [['O', 'M', 9], ['O', 'N', 5], ['O', 'P', 3], ['O', 'A', 5.4]], between: [['M', 'O', 'A'], ['N', 'O', 'P']], parallel: [['M', 'N', 'A', 'P']] },
  'ex-4am-aksiya-talis-l3-005': { lengths: [['O', 'A', 12], ['O', 'B', 18], ['O', 'C', 5], ['O', 'D', 7.5]], perp: [['A', 'C', 'B', 'D']], between: [['A', 'O', 'C'], ['B', 'O', 'D']], parallel: [['A', 'B', 'C', 'D']] },
  'ex-4am-aksiya-talis-l3-006': { lengths: [['A', 'D', 6], ['D', 'C', 8], ['B', 'F', 1.5], ['B', 'E', 2], ['A', 'B', 8], ['B', 'C', 6]], perp: [['A', 'B', 'B', 'C'], ['A', 'D', 'D', 'C']], between: [['A', 'E', 'B'], ['B', 'F', 'C']], parallel: [['A', 'C', 'E', 'F']] },
  'ex-4am-aksiya-talis-l3-007': { lengths: [['A', 'M', 7], ['A', 'B', 9], ['A', 'N', 10], ['A', 'C', 13]], between: [['A', 'M', 'B'], ['A', 'N', 'C']], notParallel: [['M', 'N', 'B', 'C']] },
  'ex-4am-aksiya-talis-l3-008': { lengths: [['A', 'D', 9], ['D', 'C', 12], ['B', 'E', 4], ['B', 'F', 3], ['A', 'B', 12], ['B', 'C', 9]], perp: [['A', 'B', 'B', 'C'], ['A', 'D', 'D', 'C']], between: [['A', 'E', 'B'], ['B', 'F', 'C']], parallel: [['E', 'F', 'A', 'C']] },
  'ex-4am-aksiya-talis-l3-009': { lengths: [['O', 'A', 45], ['O', 'B', 30], ['O', 'C', 54], ['O', 'D', 36]], between: [['A', 'O', 'B'], ['C', 'O', 'D']], parallel: [['A', 'C', 'B', 'D']] },
  'ex-4am-aksiya-talis-l3-010': { lengths: [['A', 'B', 5], ['A', 'B′', 2], ['A', 'C', 7.5], ['A', 'C′', 3]], between: [['B', 'A', 'B′'], ['A', 'C′', 'C']], notParallel: [['B', 'C', 'B′', 'C′']] },
  'ex-4am-aksiya-talis-l4-001': { lengths: [['A', 'B', 11], ['B', 'E', 22], ['A', 'C', 15], ['C', 'F', 45]], between: [['A', 'B', 'E'], ['A', 'C', 'F']], notParallel: [['B', 'C', 'E', 'F']] },
  'ex-4am-aksiya-talis-l4-002': { ratios: [['O', 'J', 'O', 'A', '1/3'], ['O', 'K', 'O', 'D', '1/3'], ['O', 'B', 'O', 'C', '1']], between: [['B', 'O', 'C'], ['O', 'J', 'A'], ['O', 'K', 'D']], parallel: [['J', 'K', 'A', 'D']] },
  'ex-4am-aksiya-talis-l4-003': { lengths: [['A', 'B', 6], ['A', 'B′', 2], ['A', 'C', 9], ['A', 'C′', 3]], between: [['B', 'A', 'B′'], ['C', 'A', 'C′']], parallel: [['B', 'C', 'B′', 'C′']] },
  'ex-4am-aksiya-talis-l4-004': { lengths: [['A', 'B', 7], ['A', 'B′', 3], ['A', 'C', 14]], between: [['B', 'A', 'B′']] },
  'ex-4am-aksiya-talis-l4-006': { lengths: [['A', 'K', 30], ['K', 'B', 20], ['L', 'D', 13.5], ['A', 'L', 20], ['C', 'B', 30]], between: [['A', 'K', 'B'], ['A', 'L', 'C'], ['D', 'L', 'K']], parallel: [['C', 'B', 'L', 'K']], notParallel: [['C', 'K', 'D', 'A']] },
  'ex-4am-aksiya-talis-l4-007': { lengths: [['O', 'C', 4], ['D', 'C', 5], ['O', 'B', 1.5], ['A', 'B', 2.5]], perp: [['A', 'C', 'B', 'D']], between: [['A', 'O', 'C'], ['B', 'O', 'D']], parallel: [['A', 'B', 'C', 'D']] },
  'ex-4am-aksiya-talis-l4-009': { lengths: [['B', 'C', 10], ['A', 'D', 6], ['D', 'M', 2.4]], ratios: [['D', 'B', 'D', 'C', '1']], between: [['B', 'D', 'C'], ['D', 'M', 'A'], ['D', 'E', 'C'], ['B', 'F', 'D']], parallel: [['M', 'E', 'A', 'C'], ['M', 'F', 'A', 'B']] },
  'ex-4am-aksiya-talis-l4-010': { lengths: [['A', 'B', 4], ['A', 'B′', 2], ['A', 'C', 6], ['A', 'C′', 3]], between: [['B', 'A', 'B′'], ['A', 'C′', 'C']], notParallel: [['B', 'C', 'B′', 'C′']] },
  'ex-4am-aksiya-talis-l5-001': { lengths: [['S', 'A', 40], ['S', 'B', 25], ['A', 'B', 25], ['S', 'M', 16], ['S', 'N', 10]], between: [['H', 'B', 'A'], ['S', 'M', 'A'], ['S', 'N', 'B']], perp: [['S', 'H', 'H', 'A']], parallel: [['M', 'N', 'A', 'B']] },
  'ex-4am-aksiya-talis-l5-002': { lengths: [['S', 'A', 6], ['S', 'B', 4.5], ['A', 'B', 7.5], ['S', 'M', 2.4], ['S', 'N', 1.9]], between: [['S', 'M', 'A'], ['S', 'N', 'B']], notParallel: [['M', 'N', 'A', 'B']] },
  'ex-4am-aksiya-talis-l5-003': { lengths: [['O', 'A', 25], ['O', 'B', 26], ['O', 'A′', 10], ['O', 'B′', 10.4], ['A', 'B', 17]], between: [['A', 'O', 'A′'], ['B', 'O', 'B′']], parallel: [['A', 'B', 'A′', 'B′']] },
  'ex-4am-aksiya-talis-l5-004': { lengths: [['O', 'A', 24], ['O', 'C', 36], ['O', 'B', 20], ['O', 'D', 32]], between: [['A', 'O', 'C'], ['B', 'O', 'D']], notParallel: [['A', 'B', 'C', 'D']] },
  'ex-4am-aksiya-talis-l5-005': { lengths: [['A', 'B', 6], ['B', 'C', 4.5], ['A', 'C', 7.5], ['A', 'M', 2.4], ['A', 'N', 3]], perp: [['A', 'B', 'B', 'C']], between: [['A', 'M', 'B'], ['A', 'N', 'C']], parallel: [['M', 'N', 'B', 'C']] },
  'ex-4am-aksiya-talis-l5-006': { lengths: [['O', 'A', 6], ['O', 'C', 9], ['O', 'B', 4], ['O', 'D', 6]], between: [['A', 'O', 'C'], ['O', 'B', 'D']], notParallel: [['A', 'B', 'C', 'D']] },
  'ex-4am-aksiya-talis-l5-007': { lengths: [['O', 'A', 2.4], ['O', 'C', 3.6], ['O', 'B', 2.8], ['O', 'D', 4.2], ['A', 'B', 3]], between: [['A', 'O', 'C'], ['B', 'O', 'D']], parallel: [['A', 'B', 'C', 'D']] },
  'ex-4am-aksiya-talis-l5-008': { lengths: [['A', 'B', 7.5], ['A', 'C', 10], ['B', 'C', 9], ['A', 'M', 3], ['A', 'N', 4.2]], between: [['A', 'M', 'B'], ['A', 'N', 'C']], notParallel: [['M', 'N', 'B', 'C']] },
  'ex-4am-aksiya-talis-l5-009': { lengths: [['A', 'B', 60], ['A', 'C', 75], ['B', 'C', 40], ['A', 'M', 48], ['A', 'N', 60]], between: [['A', 'M', 'B'], ['A', 'N', 'C']], parallel: [['M', 'N', 'B', 'C']] },
  'ex-4am-aksiya-talis-l5-010': { lengths: [['A', 'B', 1.6], ['B', 'C', 1.2], ['A', 'C', 2], ['A', 'M', 1.2], ['A', 'N', 1.5]], perp: [['A', 'B', 'B', 'C']], between: [['A', 'M', 'B'], ['A', 'N', 'C']], parallel: [['M', 'N', 'B', 'C']] },
};

/* ── Vérification des figures au chargement ─────────────────────────────── */
const here = dirname(fileURLToPath(import.meta.url));
const bank = join(here, '../../content/practice/4am/aksiya-talis');
const d = (Pt, a, b) => Math.hypot(Pt[a][0] - Pt[b][0], Pt[a][1] - Pt[b][1]);
const vec = (Pt, a, b) => [Pt[b][0] - Pt[a][0], Pt[b][1] - Pt[a][1]];
const close = (x, y) => Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(y));
const cross = (u, v) => u[0] * v[1] - u[1] * v[0];
const problems = [];
for (let level = 1; level <= 5; level += 1) {
  for (let i = 1; i <= 10; i += 1) {
    const id = `ex-4am-aksiya-talis-l${level}-${String(i).padStart(3, '0')}`;
    const ex = JSON.parse(readFileSync(join(bank, `level-${level}`, `${id}.json`), 'utf8'));
    const fig = ex.statement?.figure;
    if (!fig) continue;
    const spec = FIGURES[id];
    if (!spec) { problems.push(`${id}: figure dessinée sans contrôle dans FIGURES`); continue; }
    const Pt = fig.points;
    const scales = (spec.lengths ?? []).map(([a, b, v]) => d(Pt, a, b) / Number(v));
    if (scales.some((s) => !close(s, scales[0]))) problems.push(`${id}: longueurs non proportionnelles à l'énoncé`);
    for (const [a, b, c, e, r] of spec.ratios ?? []) {
      const want = q(r); const got = d(Pt, a, b) / d(Pt, c, e);
      if (!close(got, Number(want.n) / Number(want.d))) problems.push(`${id}: |${a}${b}|/|${c}${e}| = ${got} ≠ ${r}`);
    }
    for (const [a, b, c, e] of spec.parallel ?? []) {
      if (Math.abs(cross(vec(Pt, a, b), vec(Pt, c, e))) > 1e-9 * d(Pt, a, b) * d(Pt, c, e)) problems.push(`${id}: (${a}${b}) non parallèle à (${c}${e})`);
    }
    for (const [a, b, c, e] of spec.notParallel ?? []) {
      // un « غير متوازيين » est dessiné NON parallèle : les coordonnées exactes donnent l'écart que les nombres imposent
      // (parfois infime, comme dans la طريقة du manuel : 16/23 contre 7/10 — c'est la leçon : l'œil ne suffit pas).
      if (Math.abs(cross(vec(Pt, a, b), vec(Pt, c, e))) < 1e-6 * d(Pt, a, b) * d(Pt, c, e)) problems.push(`${id}: (${a}${b}) et (${c}${e}) dessinés parallèles`);
    }
    for (const [a, b, c, e] of spec.perp ?? []) {
      const u = vec(Pt, a, b); const v = vec(Pt, c, e);
      if (Math.abs(u[0] * v[0] + u[1] * v[1]) > 1e-9 * d(Pt, a, b) * d(Pt, c, e)) problems.push(`${id}: (${a}${b}) non perpendiculaire à (${c}${e})`);
    }
    for (const [x, y, z] of spec.between ?? []) {
      const u = vec(Pt, x, y); const v = vec(Pt, y, z);
      const aligned = Math.abs(cross(u, v)) <= 1e-9 * d(Pt, x, y) * d(Pt, y, z);
      if (!aligned || u[0] * v[0] + u[1] * v[1] <= 0) problems.push(`${id}: ${y} n'est pas entre ${x} et ${z}`);
    }
    for (const [a, v0, b] of fig.rightAngles ?? []) {
      const u = vec(Pt, v0, a); const w = vec(Pt, v0, b);
      if (Math.abs(u[0] * w[0] + u[1] * w[1]) > 1e-9 * Math.hypot(...u) * Math.hypot(...w)) problems.push(`${id}: angle droit ${a}${v0}${b} faux`);
    }
  }
}
if (problems.length) throw new Error(`oracle aksiya-talis — figures inexactes :\n${problems.join('\n')}`);
