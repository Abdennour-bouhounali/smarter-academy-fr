// Oracle du banc « wadiya-idmajiya-talis » au format BEM (unité 9 « خاصية طالس », leçon de SYNTHÈSE « أدمج تعلّماتي »,
// banque réécrite le 2026-10-08) — chaque réponse non selfCheck RECALCULÉE ici en rationnels exacts (helpers.mjs) à partir
// des nombres de l'ÉNONCÉ, avec les formules de ce fichier (jamais packages/core/arithmetic/thales.js) :
//   ratio(a, b)          le rapport a / b (longueurs mesurées depuis le sommet commun) ;
//   num(a, b, d)         le x de  a/b = d/x … écrit x = a × d ÷ b  (Thalès direct, quatrième proportionnelle) ;
//   par(p1, P1, p2, P2)  la RÉCIPROQUE sur deux droites sécantes en O : abscisses SIGNÉES p1, P1 (droite 1) et p2, P2
//                        (droite 2) ; parallèles ssi p1/P1 = p2/P2 en valeur signée (rapports égaux ET même ordre) ;
//   partFromSum(s, a, b) x tel que x / (x + s) = a / b  (la distance OB quand on connaît BD = s et AB / CD = a / b) ;
//   cylR / cylH / cylEq  le cylindre inscrit dans un cône (hauteur H, rayon R) : r = R(H − h)/H, h = H(1 − r/R), et
//                        h = k·r  ⇒  r = R·H / (H + k·R) — Thalès dans la demi-coupe axiale ;
//   sqrtQ(v)             racine EXACTE d'un carré rationnel (Pythagore, étapes counted:false) — erreur sinon ;
//   round(x, n), degRound(rad), ceilQ(v)  arrondis (π, trigonométrie : étapes counted:false) et partie entière par excès.
// Questions fermées : C('A' | 'B' | 'C') décidé par un calcul (A = « نعم », B = « لا » dans les questions نعم / لا).
// FIGURES : chaque figure DESSINÉE est relue dans son fichier et doit respecter les longueurs de l'énoncé (toutes à la même
// échelle, à 1e-9 près), ses rapports, ses angles droits, ses parallèles, ses NON-parallèles et l'ordre des points
// (« Y entre X et Z »). Le contrôle s'exécute au chargement : une figure fausse fait échouer l'import (donc le test).
// Banc généré par le script de l'auteur (Python, fractions exactes) ; ce calcul JS en est indépendant.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { R, C, q } from './helpers.mjs';

const ratio = (a, b) => q(a).div(b);
const num = (a, b, d) => q(a).mul(q(d)).div(q(b));
const add = (a, b) => q(a).add(b);
const sub = (a, b) => q(a).sub(b);
const mul = (a, b) => q(a).mul(b);
const par = (p1, P1, p2, P2) => q(p1).div(P1).sub(q(p2).div(P2)).isZero();
const yes = (b) => C(b ? 'A' : 'B');
const gt = (a, b) => q(a).sub(b).n > 0n;
/** x / (x + s) = a / b  ⇒  x·b = a·x + a·s  ⇒  x = a·s / (b − a) */
const partFromSum = (s, a, b) => q(a).mul(s).div(sub(b, a));
const cylR = (H, Rr, h) => q(Rr).mul(sub(H, h)).div(H);
const cylH = (H, Rr, r) => q(H).mul(sub(1, q(r).div(Rr)));
const cylEq = (H, Rr, k) => q(Rr).mul(H).div(add(H, q(k).mul(Rr)));
const volK = (r, h) => q(r).mul(r).mul(h);
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
const toNum = (x) => Number(x.n) / Number(x.d);
const round = (x, n) => (Math.round(x * 10 ** n) / 10 ** n).toFixed(n);
const degRound = (rad) => String(Math.round((rad * 180) / Math.PI));
const ceilQ = (v) => { const x = q(v); const f = x.n / x.d; return String(f * x.d === x.n ? f : f + 1n); };

/* ── Valeurs intermédiaires recalculées ─────────────────────────────────── */
const L1_001_AC = q(3).div(sub(1, ratio(3, add(3, 2))));              // JC = AC·(1 − AI/AB)
const L2_001_SO = sub('11.6', 10);
const L2_004_OB = partFromSum(12, '2.4', 6);
const L2_006_TS = q(6).div('0.6');                                     // sin RTS = RS / TS
const L2_006_TR = sqrtQ(sub(sq(L2_006_TS), sq(6)));
const L3_001_R = cylEq(18, 6, 1);
const L3_002_OB = partFromSum(6, 2, 5);
const L3_003_R = cylEq(10, 5, 1);
const L3_004_SH = add(q(214).div(2), 61);
const L3_005_AF = num(5, 4, 10);
const L3_006_R = cylEq(15, 5, 3);
const L3_008_H = num('1.8', 2, add(4, 2));
const L3_009_AC = sqrtQ(add(sq(20), sq(15)));
const L3_010_R = cylEq(9, 3, 1);
const L3_010_R2 = cylEq(18, 6, 1);
const L4_002_R = cylEq(12, 4, 1);
const L4_003_OB = partFromSum(10, '1.5', 4);
const L4_004_R = cylEq(20, 5, 2);
/** l4-005 : r/6 = (18 − (r + 20))/18  ⇒  18r = 6(−2 − r)  ⇒  24r = −12 */
const L4_005_R = q(6).mul(-2).div(add(18, 6));
const L4_006_AC = sqrtQ(sub(sq(10), sq(6)));
const L4_008 = [3, 6, 9].map((h) => ({ h, v: volK(cylR(18, 6, h), h) }));
const L4_008_BEST = L4_008.reduce((a, b) => (gt(b.v, a.v) ? b : a));
const L4_009_BM = q(6).div(q(3).div(4));                               // tan BME = BE / BM
const L4_009_ME = sqrtQ(add(sq(6), sq(L4_009_BM)));
const L4_010_SH = add(q(150).div(2), 39);
// l5-001 (BEM 2016 II)
const L5_001_MC = sub(50, 20);
const L5_001_NC = q(40).mul(L5_001_MC).div(20);                        // MD/MC = AD/NC
const L5_001_CE = L5_001_MC;                                           // rotation de centre C : CE = CM
const L5_001_AREA = q(L5_001_MC).mul(L5_001_CE).div(2);
const L5_001_TOTAL = q('5.4').mul(1000000).div(sub(1, '0.2'));
const L5_001_PRICE = L5_001_TOTAL.div(L5_001_AREA);
// l5-002 : AB = 16, CD = 9, BD = 12, BC = 15
const L5_002_AD = sqrtQ(add(sq(16), sq(12)));
const L5_002_OD = q(L5_002_AD).mul(9).div(add(9, 16));                 // OD/OA = CD/AB
const L5_002_OB = q(15).mul(16).div(add(9, 16));
const L5_002_OH = num(L5_002_OD, L5_002_AD, 16);                       // DO/DA = OH/AB
// l5-003
const L5_003_EF = q(6).mul(2).div(3);
const L5_003_AREA = add(L5_003_EF, 6).mul(1).div(2);
// l5-004
const L5_004_SH = sqrtQ(sub(sq(5), sq(q(6).div(2))));
const L5_004_SF = num(3, 5, 5);                                        // SF/SB = SE/SA
const L5_004_MN = num(2, 5, 6);
const L5_004_EF = num(3, 5, 6);
// l5-005 : OB = 4, AB = 3, OA = 5, OD = 16
const L5_005_DC = num(3, 4, 16);                                       // OB/OD = BA/DC
// l5-006
const L5_006_QR = q('1.5').mul(10).div(25);
const L5_006_D = sub('1.3', 1).mul(25).div('1.5');
const L5_006_V = add(1, '2.5').mul(25).div(2).mul(10);
// l5-007 : OA = 9 cm, AB = 3,6 cm, OE = 360 cm
const L5_007_EF = num(360, 9, '3.6');
const L5_007_OE = q(9).mul(180).div('3.6').div(100);                   // en m
// l5-008
const L5_008_MN = num('1.2', '3.2', '2.4');
const L5_008_PQ = ratio('1.5', 4).mul('3.2');
const L5_008_COST = add(L5_008_MN, L5_008_PQ).mul(6).mul(900);
// l5-009 : rayons 6 et 15, hauteur 24
const L5_009_SI = partFromSum(24, 6, 15);
const L5_009_SK = q(9).mul(add(L5_009_SI, 24)).div(15);
// l5-010
const L5_010_MN = ratio(10, 25).mul('7.2');

export const ORACLE = {
  // ── المستوى 1 ──
  'ex-4am-wadiya-idmajiya-talis-l1-001:q1': R(num(3, add(3, 2), 10)),
  'ex-4am-wadiya-idmajiya-talis-l1-001:q2': R(sub(L1_001_AC, 3)),
  'ex-4am-wadiya-idmajiya-talis-l1-002:q1': R(num(2, 2, 4)),          // AL/AB = LM/BC
  'ex-4am-wadiya-idmajiya-talis-l1-002:q2': R(num(3, 2, 4)),          // AM/AC = LM/BC
  'ex-4am-wadiya-idmajiya-talis-l1-003:q1': R(ratio(11, add(11, 22))),
  'ex-4am-wadiya-idmajiya-talis-l1-003:q2': R(ratio(15, add(15, 45))),
  'ex-4am-wadiya-idmajiya-talis-l1-003:q3': yes(par(11, add(11, 22), 15, add(15, 45))),
  'ex-4am-wadiya-idmajiya-talis-l1-004:q1': R(ratio(3, 5)),
  'ex-4am-wadiya-idmajiya-talis-l1-004:q2': R(ratio(3, 5).mul('7.5')),
  'ex-4am-wadiya-idmajiya-talis-l1-005:q1': R(sqrtQ(add(sq(12), sq(5)))),
  'ex-4am-wadiya-idmajiya-talis-l1-005:q2': R(num('9.6', 12, 5)),
  'ex-4am-wadiya-idmajiya-talis-l1-006:q1': R(cylR(10, 5, 4)),
  'ex-4am-wadiya-idmajiya-talis-l1-006:q2': R(volK(cylR(10, 5, 4), 4)),
  'ex-4am-wadiya-idmajiya-talis-l1-007:q1': R(num(1, 2, 9)),
  'ex-4am-wadiya-idmajiya-talis-l1-008:q1': yes(!gt(7, 4)),           // r < R pour un cylindre inscrit
  'ex-4am-wadiya-idmajiya-talis-l1-008:q2': R(cylR(12, 4, 3)),
  'ex-4am-wadiya-idmajiya-talis-l1-009:q2': R(num(2, 8, 6)),
  'ex-4am-wadiya-idmajiya-talis-l1-010:q1': R(ratio(2, 5)),
  'ex-4am-wadiya-idmajiya-talis-l1-010:q2': R(ratio(4, 10)),
  'ex-4am-wadiya-idmajiya-talis-l1-010:q3': yes(par(2, 5, -4, 10)),
  // ── المستوى 2 ──
  'ex-4am-wadiya-idmajiya-talis-l2-001:q1': R(L2_001_SO),
  'ex-4am-wadiya-idmajiya-talis-l2-001:q2': R(num(1, L2_001_SO, '11.6')),
  'ex-4am-wadiya-idmajiya-talis-l2-002:q1': R(cylR(12, 4, 9)),
  'ex-4am-wadiya-idmajiya-talis-l2-002:q2': R(volK(cylR(12, 4, 9), 9)),
  'ex-4am-wadiya-idmajiya-talis-l2-003:q1': R(cylH(12, 4, 3)),
  'ex-4am-wadiya-idmajiya-talis-l2-003:q2': R(volK(3, cylH(12, 4, 3))),
  'ex-4am-wadiya-idmajiya-talis-l2-004:q1': R(L2_004_OB),
  'ex-4am-wadiya-idmajiya-talis-l2-004:q2': R(add(L2_004_OB, 12)),
  'ex-4am-wadiya-idmajiya-talis-l2-005:q1': R(num('1.5', 2, 24)),
  'ex-4am-wadiya-idmajiya-talis-l2-005:q2': R(num(2, '1.5', '1.8')),
  'ex-4am-wadiya-idmajiya-talis-l2-006:q1': R(L2_006_TS),
  'ex-4am-wadiya-idmajiya-talis-l2-006:q2': R(L2_006_TR),
  'ex-4am-wadiya-idmajiya-talis-l2-006:q3': R(num(2, L2_006_TR, 6)),
  'ex-4am-wadiya-idmajiya-talis-l2-006:q4': R(num(2, L2_006_TR, L2_006_TS)),
  'ex-4am-wadiya-idmajiya-talis-l2-007:q1': R(cylH(12, 3, '1.5')),
  'ex-4am-wadiya-idmajiya-talis-l2-007:q2': R(volK('1.5', cylH(12, 3, '1.5'))),
  'ex-4am-wadiya-idmajiya-talis-l2-008:q1': yes(gt(1, '0.8') ? gt('4.8', 6) : true),   // stick taller than its shadow ⇒ pole taller than 6 m
  'ex-4am-wadiya-idmajiya-talis-l2-008:q2': R(num(1, '0.8', 6)),
  'ex-4am-wadiya-idmajiya-talis-l2-009:q1': R(ratio('1.2', 2)),
  'ex-4am-wadiya-idmajiya-talis-l2-009:q2': R(ratio('1.3', 2)),
  'ex-4am-wadiya-idmajiya-talis-l2-009:q3': yes(par('1.2', 2, '1.3', 2)),
  'ex-4am-wadiya-idmajiya-talis-l2-010:q1': R(cylR(18, 6, 12)),
  'ex-4am-wadiya-idmajiya-talis-l2-010:q2': R(cylH(18, 6, 3)),
  // ── المستوى 3 ──
  'ex-4am-wadiya-idmajiya-talis-l3-001:q1': R(L3_001_R),
  'ex-4am-wadiya-idmajiya-talis-l3-001:q2': R(volK(L3_001_R, L3_001_R)),
  'ex-4am-wadiya-idmajiya-talis-l3-001:q3': R(round(toNum(volK(L3_001_R, L3_001_R)) * Math.PI, 2)),
  'ex-4am-wadiya-idmajiya-talis-l3-002:q1': R(L3_002_OB),
  'ex-4am-wadiya-idmajiya-talis-l3-002:q2': R(add(L3_002_OB, 6)),
  'ex-4am-wadiya-idmajiya-talis-l3-002:q3': R(partFromSum('4.5', 2, 5)),
  'ex-4am-wadiya-idmajiya-talis-l3-003:q1': R(L3_003_R),
  'ex-4am-wadiya-idmajiya-talis-l3-003:q2': R(volK(L3_003_R, L3_003_R)),
  'ex-4am-wadiya-idmajiya-talis-l3-003:q3': yes(!gt(L3_003_R, 3)),     // h = r doit être ≤ 3
  'ex-4am-wadiya-idmajiya-talis-l3-004:q1': R(L3_004_SH),
  'ex-4am-wadiya-idmajiya-talis-l3-004:q2': R(num(1, '1.2', L3_004_SH)),
  'ex-4am-wadiya-idmajiya-talis-l3-005:q1': R(num(10, 4, '3.2')),
  'ex-4am-wadiya-idmajiya-talis-l3-005:q2': R(add(L3_005_AF, 5)),    // A entre C et F
  'ex-4am-wadiya-idmajiya-talis-l3-006:q1': R(L3_006_R),
  'ex-4am-wadiya-idmajiya-talis-l3-006:q2': R(mul(L3_006_R, 3)),
  'ex-4am-wadiya-idmajiya-talis-l3-006:q3': R(volK(L3_006_R, mul(L3_006_R, 3))),
  'ex-4am-wadiya-idmajiya-talis-l3-007:q1': R(cylR(15, 5, 6)),
  'ex-4am-wadiya-idmajiya-talis-l3-007:q2': R(volK(cylR(15, 5, 6), 6)),
  'ex-4am-wadiya-idmajiya-talis-l3-007:q3': R(round(toNum(volK(cylR(15, 5, 6), 6)) * Math.PI, 1)),
  'ex-4am-wadiya-idmajiya-talis-l3-008:q1': R(L3_008_H),
  'ex-4am-wadiya-idmajiya-talis-l3-008:q2': R(sub(num(3, '1.8', L3_008_H), 3)),
  'ex-4am-wadiya-idmajiya-talis-l3-009:q1': R(L3_009_AC),
  'ex-4am-wadiya-idmajiya-talis-l3-009:q2': R(ratio(8, 20)),
  'ex-4am-wadiya-idmajiya-talis-l3-009:q3': R(ratio(6, 15)),
  'ex-4am-wadiya-idmajiya-talis-l3-009:q4': yes(par(8, 20, 6, 15)),
  'ex-4am-wadiya-idmajiya-talis-l3-009:q5': R(num(8, 20, L3_009_AC)),
  'ex-4am-wadiya-idmajiya-talis-l3-010:q1': R(L3_010_R),
  // A = « ×2 », B = « +3 », C = « ×4 »
  'ex-4am-wadiya-idmajiya-talis-l3-010:q2': C(L3_010_R2.sub(L3_010_R.mul(2)).isZero() ? 'A' : L3_010_R2.sub(add(L3_010_R, 3)).isZero() ? 'B' : 'C'),
  // ── المستوى 4 ──
  'ex-4am-wadiya-idmajiya-talis-l4-001:q1': R(ratio(1, 2)),           // GE/GC = EF/CB, EF = BC/2
  'ex-4am-wadiya-idmajiya-talis-l4-001:q2': R(ratio(1, 2)),           // AF/AC = EF/BC
  'ex-4am-wadiya-idmajiya-talis-l4-002:q1': R(L4_002_R),
  'ex-4am-wadiya-idmajiya-talis-l4-002:q2': R(volK(L4_002_R, L4_002_R)),
  'ex-4am-wadiya-idmajiya-talis-l4-002:q3': yes(toNum(volK(L4_002_R, L4_002_R)) * Math.PI >= 80),
  'ex-4am-wadiya-idmajiya-talis-l4-003:q1': R(L4_003_OB),
  'ex-4am-wadiya-idmajiya-talis-l4-003:q2': R(add(L4_003_OB, 10)),
  'ex-4am-wadiya-idmajiya-talis-l4-003:q3': yes(!gt(L4_003_OB, 5)),
  'ex-4am-wadiya-idmajiya-talis-l4-004:q1': R(L4_004_R),
  'ex-4am-wadiya-idmajiya-talis-l4-004:q2': R(mul(L4_004_R, 2)),
  'ex-4am-wadiya-idmajiya-talis-l4-004:q3': R(volK(L4_004_R, mul(L4_004_R, 2))),
  'ex-4am-wadiya-idmajiya-talis-l4-005:q1': R(L4_005_R),
  'ex-4am-wadiya-idmajiya-talis-l4-005:q2': yes(gt(L4_005_R, 0) && !gt(add(L4_005_R, 20), 18)),
  'ex-4am-wadiya-idmajiya-talis-l4-006:q2': R(L4_006_AC),
  'ex-4am-wadiya-idmajiya-talis-l4-006:q3': R(num(2, L4_006_AC, 10)),
  'ex-4am-wadiya-idmajiya-talis-l4-006:q4': R(num(2, L4_006_AC, 6)),
  'ex-4am-wadiya-idmajiya-talis-l4-007:q1': R(ratio(4, 7)),
  'ex-4am-wadiya-idmajiya-talis-l4-007:q2': R(ratio(5, 9)),
  'ex-4am-wadiya-idmajiya-talis-l4-007:q3': yes(par(4, 7, 5, 9)),
  'ex-4am-wadiya-idmajiya-talis-l4-007:q4': R(num(5, 4, 7)),          // AC/AF = AB/AE
  'ex-4am-wadiya-idmajiya-talis-l4-008:q1': R(cylR(18, 6, 6)),
  'ex-4am-wadiya-idmajiya-talis-l4-008:q2': R(volK(cylR(18, 6, 6), 6)),
  // A = h 3, B = h 6, C = h 9
  'ex-4am-wadiya-idmajiya-talis-l4-008:q3': C({ 3: 'A', 6: 'B', 9: 'C' }[L4_008_BEST.h]),
  'ex-4am-wadiya-idmajiya-talis-l4-009:q1': R(L4_009_BM),
  'ex-4am-wadiya-idmajiya-talis-l4-009:q2': R(L4_009_ME),
  'ex-4am-wadiya-idmajiya-talis-l4-009:q3': R(ratio('2.4', 6)),
  'ex-4am-wadiya-idmajiya-talis-l4-009:q4': R(ratio(4, L4_009_ME)),
  'ex-4am-wadiya-idmajiya-talis-l4-009:q5': yes(par('2.4', 6, 4, L4_009_ME)),
  'ex-4am-wadiya-idmajiya-talis-l4-009:q6': R(num('2.4', 6, L4_009_BM)),
  'ex-4am-wadiya-idmajiya-talis-l4-010:q1': R(L4_010_SH),
  'ex-4am-wadiya-idmajiya-talis-l4-010:q2': R(num(1, '0.8', L4_010_SH)),
  // ── المستوى 5 ──
  'ex-4am-wadiya-idmajiya-talis-l5-001:q1': R(ratio(20, L5_001_MC)),
  'ex-4am-wadiya-idmajiya-talis-l5-001:q3': R(add(40, L5_001_NC)),    // BN = BC + CN
  'ex-4am-wadiya-idmajiya-talis-l5-001:q4': R(degRound(Math.atan(20 / 40))),
  'ex-4am-wadiya-idmajiya-talis-l5-001:q5': R(L5_001_CE),
  'ex-4am-wadiya-idmajiya-talis-l5-001:q6': R(L5_001_AREA),
  'ex-4am-wadiya-idmajiya-talis-l5-001:q7': R(sub(L5_001_NC, L5_001_CE).mul(L5_001_MC).div(2)),
  'ex-4am-wadiya-idmajiya-talis-l5-001:q8': R(L5_001_PRICE),
  'ex-4am-wadiya-idmajiya-talis-l5-001:q9': R(L5_001_PRICE.div(10000)),
  'ex-4am-wadiya-idmajiya-talis-l5-001:q10': R(String(L5_001_PRICE.toString().length - 1)),
  'ex-4am-wadiya-idmajiya-talis-l5-002:q1': R(L5_002_AD),
  'ex-4am-wadiya-idmajiya-talis-l5-002:q2': R(L5_002_OD),
  'ex-4am-wadiya-idmajiya-talis-l5-002:q3': R(L5_002_OB),
  'ex-4am-wadiya-idmajiya-talis-l5-002:q4': R(L5_002_OH),
  'ex-4am-wadiya-idmajiya-talis-l5-002:q5': R(add(add(L5_002_AD, 1), add(15, 1)).mul(350)),
  'ex-4am-wadiya-idmajiya-talis-l5-003:q2': R(q(6).mul(1).div(3)),
  'ex-4am-wadiya-idmajiya-talis-l5-003:q3': R(L5_003_EF),
  'ex-4am-wadiya-idmajiya-talis-l5-003:q4': R(L5_003_AREA),
  'ex-4am-wadiya-idmajiya-talis-l5-003:q5': R(mul(L5_003_AREA, 650)),
  'ex-4am-wadiya-idmajiya-talis-l5-004:q1': R(L5_004_SH),
  'ex-4am-wadiya-idmajiya-talis-l5-004:q2': R(L5_004_MN),
  'ex-4am-wadiya-idmajiya-talis-l5-004:q3': R(ratio(3, 5)),
  'ex-4am-wadiya-idmajiya-talis-l5-004:q4': R(ratio('3.2', 5)),
  'ex-4am-wadiya-idmajiya-talis-l5-004:q5': yes(par(3, 5, '3.2', 5)),
  'ex-4am-wadiya-idmajiya-talis-l5-004:q6': R(L5_004_SF),
  'ex-4am-wadiya-idmajiya-talis-l5-004:q7': R(L5_004_EF),
  'ex-4am-wadiya-idmajiya-talis-l5-004:q8': R(mul(L5_004_MN, 450).add(mul(L5_004_EF, 80))),
  'ex-4am-wadiya-idmajiya-talis-l5-005:q1': yes(sq(5).sub(add(sq(4), sq(3))).isZero()),
  'ex-4am-wadiya-idmajiya-talis-l5-005:q2': R(L5_005_DC),
  'ex-4am-wadiya-idmajiya-talis-l5-005:q3': yes(gt(L5_005_DC, 10)),
  'ex-4am-wadiya-idmajiya-talis-l5-005:q4': R(add(1500, mul(L5_005_DC, 350))),
  'ex-4am-wadiya-idmajiya-talis-l5-006:q1': R(add(1, L5_006_QR)),
  'ex-4am-wadiya-idmajiya-talis-l5-006:q2': R(L5_006_D),
  'ex-4am-wadiya-idmajiya-talis-l5-006:q3': R(L5_006_V),
  'ex-4am-wadiya-idmajiya-talis-l5-006:q4': R(L5_006_V.div(35)),
  'ex-4am-wadiya-idmajiya-talis-l5-007:q1': R(L5_007_EF),
  'ex-4am-wadiya-idmajiya-talis-l5-007:q2': yes(!gt(L5_007_EF, 150)),
  'ex-4am-wadiya-idmajiya-talis-l5-007:q3': R(L5_007_OE),
  'ex-4am-wadiya-idmajiya-talis-l5-007:q4': R(ratio(9, 360)),
  'ex-4am-wadiya-idmajiya-talis-l5-007:q5': R(ratio('9.25', 375)),
  'ex-4am-wadiya-idmajiya-talis-l5-007:q6': yes(par(9, 360, '9.25', 375)),
  'ex-4am-wadiya-idmajiya-talis-l5-008:q1': R(sqrtQ(add(sq('2.4'), sq('3.2')))),
  'ex-4am-wadiya-idmajiya-talis-l5-008:q2': R(L5_008_MN),
  'ex-4am-wadiya-idmajiya-talis-l5-008:q3': R(ratio('1.5', sqrtQ(add(sq('2.4'), sq('3.2'))))),
  'ex-4am-wadiya-idmajiya-talis-l5-008:q4': R(ratio('0.9', '2.4')),
  'ex-4am-wadiya-idmajiya-talis-l5-008:q5': yes(par('1.5', 4, '0.9', '2.4')),
  'ex-4am-wadiya-idmajiya-talis-l5-008:q6': R(L5_008_PQ),
  'ex-4am-wadiya-idmajiya-talis-l5-008:q7': R(L5_008_COST),
  'ex-4am-wadiya-idmajiya-talis-l5-008:q8': R(mul(L5_008_COST, '1.2')),
  'ex-4am-wadiya-idmajiya-talis-l5-009:q1': R(L5_009_SI),
  'ex-4am-wadiya-idmajiya-talis-l5-009:q2': R(sub(L5_009_SK, L5_009_SI)),
  'ex-4am-wadiya-idmajiya-talis-l5-009:q3': R(round(Math.PI * (12 + 30), 1)),
  'ex-4am-wadiya-idmajiya-talis-l5-009:q4': R(mul(Math.ceil((Math.PI * 42) / 100), 120)),
  'ex-4am-wadiya-idmajiya-talis-l5-010:q1': R(ratio(10, 25)),
  'ex-4am-wadiya-idmajiya-talis-l5-010:q2': R(ratio('10.4', 26)),
  'ex-4am-wadiya-idmajiya-talis-l5-010:q3': yes(par(10, 25, '10.4', 26)),
  'ex-4am-wadiya-idmajiya-talis-l5-010:q4': R(L5_010_MN),
  'ex-4am-wadiya-idmajiya-talis-l5-010:q5': R(ceilQ(L5_010_MN.div('0.45'))),
};

/**
 * Les figures DESSINÉES, relues dans leur fichier : `lengths` [P, Q, longueur de l'énoncé] (une seule échelle par figure),
 * `ratios` [P, Q, R, S, r] (|PQ| / |RS| = r), `parallel` / `notParallel` [A, B, C, D] ((AB) et (CD)), `perp`, et `between`
 * [X, Y, Z] (Y strictement entre X et Z, alignés).
 */
export const FIGURES = {
  'ex-4am-wadiya-idmajiya-talis-l1-001': { lengths: [['A', 'I', 3], ['I', 'B', 2], ['J', 'C', 3], ['B', 'C', 10]], between: [['A', 'I', 'B'], ['A', 'J', 'C']], parallel: [['I', 'J', 'B', 'C']] },
  'ex-4am-wadiya-idmajiya-talis-l1-002': { lengths: [['B', 'C', 4], ['A', 'M', 3], ['M', 'L', 2], ['A', 'L', 2]], between: [['B', 'A', 'L'], ['C', 'A', 'M']], parallel: [['L', 'M', 'B', 'C']] },
  'ex-4am-wadiya-idmajiya-talis-l1-003': { lengths: [['A', 'B', 11], ['B', 'E', 22], ['A', 'C', 15], ['C', 'F', 45]], between: [['A', 'B', 'E'], ['A', 'C', 'F']], notParallel: [['B', 'C', 'E', 'F']] },
  'ex-4am-wadiya-idmajiya-talis-l1-004': { lengths: [['B', 'C', 7.5]], ratios: [['A', 'M', 'A', 'B', '3/5']], between: [['A', 'M', 'B'], ['A', 'N', 'C']], parallel: [['M', 'N', 'B', 'C']] },
  'ex-4am-wadiya-idmajiya-talis-l1-005': { lengths: [['S', 'H', 9.6], ['S', 'O', 12], ['O', 'K', 5]], between: [['S', 'H', 'O'], ['S', 'L', 'K']], perp: [['S', 'O', 'O', 'K']], parallel: [['H', 'L', 'O', 'K']] },
  'ex-4am-wadiya-idmajiya-talis-l1-009': { lengths: [['A', 'M', 2], ['A', 'B', 8], ['B', 'C', 6]], between: [['A', 'M', 'B'], ['A', 'N', 'C']], perp: [['A', 'B', 'B', 'C'], ['A', 'M', 'M', 'N']] },
  'ex-4am-wadiya-idmajiya-talis-l1-010': { lengths: [['A', 'M', 2], ['A', 'B', 5], ['A', 'N', 4], ['A', 'C', 10]], between: [['A', 'M', 'B'], ['N', 'A', 'C']], notParallel: [['M', 'N', 'B', 'C']] },
  'ex-4am-wadiya-idmajiya-talis-l2-001': { lengths: [['P', 'S', 10], ['S', 'R', 1], ['P', 'O', 11.6], ['P', 'T', 7.25]], between: [['P', 'S', 'O'], ['T', 'R', 'O']], perp: [['T', 'P', 'P', 'S'], ['R', 'S', 'S', 'O']] },
  'ex-4am-wadiya-idmajiya-talis-l2-004': { lengths: [['A', 'B', 2.4], ['C', 'D', 6], ['B', 'D', 12], ['O', 'B', 8]], between: [['O', 'B', 'D'], ['O', 'A', 'C']], parallel: [['A', 'B', 'C', 'D']] },
  'ex-4am-wadiya-idmajiya-talis-l2-006': { lengths: [['R', 'S', 6], ['M', 'T', 2], ['R', 'T', 8], ['T', 'S', 10]], between: [['T', 'M', 'R'], ['T', 'N', 'S']], perp: [['S', 'R', 'R', 'T']], parallel: [['M', 'N', 'R', 'S']] },
  'ex-4am-wadiya-idmajiya-talis-l2-009': { lengths: [['A', 'B', 2], ['A', 'C', 2], ['A', 'M', 1.2], ['A', 'N', 1.3]], between: [['A', 'M', 'B'], ['A', 'N', 'C']], notParallel: [['M', 'N', 'B', 'C']] },
  'ex-4am-wadiya-idmajiya-talis-l3-002': { lengths: [['A', 'B', 2], ['C', 'D', 5], ['B', 'D', 6], ['A', 'C', 4.5], ['O', 'B', 4], ['O', 'A', 3]], between: [['O', 'B', 'D'], ['O', 'A', 'C']], parallel: [['A', 'B', 'C', 'D']] },
  'ex-4am-wadiya-idmajiya-talis-l3-005': { lengths: [['A', 'B', 4], ['A', 'E', 10], ['A', 'C', 5], ['B', 'C', 3.2]], between: [['B', 'A', 'E'], ['C', 'A', 'F']], parallel: [['B', 'C', 'E', 'F']] },
  'ex-4am-wadiya-idmajiya-talis-l3-009': { lengths: [['D', 'C', 20], ['A', 'D', 15], ['B', 'E', 8], ['B', 'F', 6]], between: [['B', 'E', 'A'], ['B', 'F', 'C']], perp: [['A', 'B', 'B', 'C'], ['A', 'D', 'D', 'C']], parallel: [['E', 'F', 'A', 'C'], ['A', 'B', 'D', 'C']] },
  'ex-4am-wadiya-idmajiya-talis-l4-001': { ratios: [['E', 'F', 'B', 'C', '1/2']], between: [['A', 'E', 'B'], ['A', 'F', 'C'], ['E', 'G', 'C'], ['F', 'G', 'B'], ['B', 'L', 'C'], ['A', 'G', 'L']], parallel: [['E', 'F', 'B', 'C']] },
  'ex-4am-wadiya-idmajiya-talis-l4-003': { lengths: [['A', 'B', 1.5], ['C', 'D', 4], ['B', 'D', 10]], between: [['O', 'B', 'D'], ['O', 'A', 'C']], parallel: [['A', 'B', 'C', 'D']] },
  'ex-4am-wadiya-idmajiya-talis-l4-006': { lengths: [['A', 'B', 10], ['C', 'B', 6], ['A', 'D', 2], ['O', 'A', 5], ['O', 'C', 5]], between: [['A', 'D', 'C'], ['A', 'F', 'B'], ['A', 'O', 'B']], perp: [['A', 'C', 'C', 'B']], parallel: [['D', 'F', 'C', 'B']] },
  'ex-4am-wadiya-idmajiya-talis-l4-007': { lengths: [['A', 'B', 4], ['A', 'E', 7], ['A', 'C', 5], ['A', 'F', 9]], between: [['A', 'B', 'E'], ['A', 'C', 'F']], notParallel: [['B', 'C', 'E', 'F']] },
  'ex-4am-wadiya-idmajiya-talis-l4-009': { lengths: [['E', 'K', 2.4], ['E', 'L', 4], ['B', 'E', 6], ['B', 'M', 8]], between: [['E', 'K', 'B'], ['E', 'L', 'M']], perp: [['E', 'B', 'B', 'M']], parallel: [['K', 'L', 'B', 'M']] },
  'ex-4am-wadiya-idmajiya-talis-l5-001': { lengths: [['A', 'B', 50], ['A', 'D', 40], ['D', 'M', 20]], between: [['D', 'M', 'C'], ['A', 'M', 'N'], ['B', 'C', 'N']], perp: [['A', 'B', 'B', 'C'], ['A', 'D', 'D', 'C']], parallel: [['A', 'D', 'C', 'N'], ['A', 'B', 'D', 'C']] },
  'ex-4am-wadiya-idmajiya-talis-l5-002': { lengths: [['A', 'B', 16], ['C', 'D', 9], ['B', 'D', 12], ['B', 'C', 15]], between: [['A', 'O', 'D'], ['B', 'O', 'C'], ['B', 'H', 'D']], perp: [['A', 'B', 'B', 'D'], ['C', 'D', 'D', 'B'], ['O', 'H', 'B', 'D']] },
  'ex-4am-wadiya-idmajiya-talis-l5-003': { lengths: [['B', 'H', 3], ['H', 'C', 3], ['A', 'H', 3]], ratios: [['A', 'I', 'A', 'H', '1/3'], ['A', 'J', 'A', 'H', '2/3']], between: [['A', 'M', 'B'], ['A', 'E', 'B'], ['A', 'N', 'C'], ['A', 'F', 'C'], ['A', 'I', 'H'], ['A', 'J', 'H'], ['M', 'I', 'N'], ['E', 'J', 'F'], ['B', 'H', 'C']], perp: [['A', 'H', 'B', 'C']], parallel: [['M', 'N', 'B', 'C'], ['E', 'F', 'B', 'C']] },
  'ex-4am-wadiya-idmajiya-talis-l5-004': { lengths: [['S', 'A', 5], ['S', 'B', 5], ['A', 'B', 6], ['S', 'M', 2], ['S', 'E', 3], ['S', 'F', 3.2]], between: [['S', 'M', 'A'], ['S', 'E', 'A'], ['S', 'N', 'B'], ['S', 'F', 'B'], ['A', 'H', 'B']], perp: [['S', 'H', 'A', 'B']], parallel: [['M', 'N', 'A', 'B']], notParallel: [['E', 'F', 'A', 'B']] },
  'ex-4am-wadiya-idmajiya-talis-l5-005': { lengths: [['O', 'B', 4], ['A', 'B', 3], ['O', 'A', 5], ['O', 'D', 16]], between: [['O', 'B', 'D'], ['O', 'A', 'C']], perp: [['A', 'B', 'O', 'D'], ['C', 'D', 'O', 'D']] },
  'ex-4am-wadiya-idmajiya-talis-l5-008': { lengths: [['A', 'H', 2.4], ['H', 'B', 3.2], ['N', 'B', 1.2], ['A', 'P', 1.5], ['A', 'Q', 0.9]], between: [['H', 'N', 'B'], ['A', 'P', 'B'], ['A', 'M', 'B'], ['A', 'Q', 'H']], perp: [['A', 'H', 'H', 'B'], ['M', 'N', 'H', 'B']], parallel: [['P', 'Q', 'H', 'B']] },
  'ex-4am-wadiya-idmajiya-talis-l5-009': { lengths: [['I', 'A', 6], ['B', 'I', 6], ['J', 'C', 15], ['D', 'J', 15], ['I', 'J', 24]], between: [['S', 'A', 'C'], ['S', 'B', 'D'], ['S', 'I', 'J'], ['B', 'I', 'A'], ['D', 'J', 'C']], perp: [['I', 'A', 'I', 'J'], ['J', 'C', 'I', 'J']] },
  'ex-4am-wadiya-idmajiya-talis-l5-010': { lengths: [['O', 'A', 25], ['O', 'B', 26], ['A', 'B', 7.2], ['O', 'M', 10], ['O', 'N', 10.4]], between: [['O', 'M', 'A'], ['O', 'N', 'B']], parallel: [['M', 'N', 'A', 'B']] },
};

/* ── Vérification des figures au chargement ─────────────────────────────── */
const here = dirname(fileURLToPath(import.meta.url));
const bank = join(here, '../../content/practice/4am/wadiya-idmajiya-talis');
const d = (Pt, a, b) => Math.hypot(Pt[a][0] - Pt[b][0], Pt[a][1] - Pt[b][1]);
const vec = (Pt, a, b) => [Pt[b][0] - Pt[a][0], Pt[b][1] - Pt[a][1]];
const close = (x, y) => Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(y));
const cross = (u, v) => u[0] * v[1] - u[1] * v[0];
const problems = [];
for (let level = 1; level <= 5; level += 1) {
  for (let i = 1; i <= 10; i += 1) {
    const id = `ex-4am-wadiya-idmajiya-talis-l${level}-${String(i).padStart(3, '0')}`;
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
    for (const c of fig.circles ?? []) {
      // le cercle dessiné passe par les points de l'énoncé qui lui appartiennent (rayon = distance au centre)
      for (const n of ['A', 'B', 'C']) if (Pt[n] && !close(d(Pt, c.center, n), Number(c.radius))) problems.push(`${id}: ${n} n'est pas sur le cercle`);
    }
  }
}
if (problems.length) throw new Error(`oracle wadiya-idmajiya-talis — figures inexactes :\n${problems.join('\n')}`);
