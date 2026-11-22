// Oracle du banc « wadiya-idmajiya-aadad » (أدمج تعلّماتي — الأعداد الطبيعيّة والأعداد النّاطقة), réécrit au
// format BEM le 2026-10-07 — chaque réponse RECALCULÉE ici à partir des nombres de l'énoncé, jamais lue dans
// `expectedAnswer`.
// À fusionner dans scripts/practice-answer-oracle.test.mjs : remplace les entrées en ligne de la leçon
// (bloc « ex-4am-wadiya-idmajiya-aadad-… »). ATTENTION : plusieurs ids gardent leur numéro mais pas leurs
// questions (l2-002 gagne q2, l3-001 gagne q4, l3-002 q2–q4, l4-001 q1–q4, l4-002 nombres changés,
// l5-001 et l5-002 nouvelles histoires) — les anciennes entrées en ligne de ces ids sont FAUSSES pour la
// nouvelle banque.
//
// Outils (indépendants du contenu) : reste par SOUSTRACTIONS successives ; PGCD = plus grand diviseur commun
// par balayage complet, recoupé par Euclide ; diviseurs par balayage ; forme irréductible = division par ce
// PGCD puis vérification que numérateur et dénominateur sont premiers entre eux ; calculs exacts via q(...).
// Les questions « بيّن أن … » en selfCheck (l2-008 q1, l4-004 q3) n'ont pas de clé.
// Choix : نعم = A, لا = B.
import { R, C, q } from './helpers.mjs';

const ediv = (a, b) => { let qq = 0, r = a; while (r >= b) { r -= b; qq++; } return [qq, r]; };
const rem = (a, b) => ediv(a, b)[1];
const quo = (a, b) => { const [qq, r] = ediv(a, b); if (r !== 0) throw new Error(`${a} ÷ ${b} pas exact`); return qq; };
const divides = (d, n) => rem(n, d) === 0;
const euclid = (a, b) => { while (b) [a, b] = [b, a % b]; return a; };
/** PGCD par balayage des diviseurs communs, recoupé par Euclide */
const pgcd = (a, b) => {
  let g = 1;
  for (let d = 1; d <= Math.min(a, b); d++) if (divides(d, a) && divides(d, b)) g = d;
  if (g !== euclid(Math.max(a, b), Math.min(a, b))) throw new Error(`pgcd(${a}, ${b}) incohérent`);
  return g;
};
const pgcdN = (...xs) => xs.reduce((g, x) => pgcd(g, x));
const divisors = (n) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => divides(d, n));
const commonDivisors = (a, b) => divisors(Math.min(a, b)).filter((d) => divides(d, a) && divides(d, b));
/** n/d sous forme irréductible, en divisant par le PGCD — chaîne 'p/q' (ou 'p' si q = 1) */
const irr = (n, d) => {
  const g = pgcd(n, d);
  const p = quo(n, g), qd = quo(d, g);
  if (pgcd(p, qd) !== 1) throw new Error(`${p}/${qd} pas irréductible`);
  return `${p}${qd === 1 ? '' : `/${qd}`}`;
};
const G = (a, b) => R(pgcd(a, b));
const F = (n, d) => R(irr(n, d));
const V = (x) => R(x.toString());
const S = (arr) => ({ value: [...arr].sort((a, b) => a - b).join(', ') });
const yn = (b) => C(b ? 'A' : 'B');
/** plus petit entier k ≥ 0 tel que k·b ≥ a (nombre de boîtes / rouleaux) */
const ceilDiv = (a, b) => { const [qq, r] = ediv(a, b); return r === 0 ? qq : qq + 1; };
/** côté maximal → nombre de carrés d'un rectangle L × l */
const squares = (L, l) => { const g = pgcd(L, l); return quo(L, g) * quo(l, g); };
/** plus grand prix entier p ≤ 5000 tel que cout(p) ≤ budget (balayage, exact) */
const maxPrice = (cout, budget) => {
  let best = null;
  for (let p = 0; p <= 5000; p++) if (!q(budget).sub(cout(p)).toString().startsWith('-')) best = p;
  return best;
};
const lt = (a, b) => q(a).sub(b).toString().startsWith('-');

/* — contrôles de cohérence des énoncés — */
// l1-001 : x unique « أكبر » parmi les diviseurs communs ; l5-001 : seul diviseur commun > 2 de 135 et 39
if (commonDivisors(135, 39).filter((d) => d > 2).length !== 1) throw new Error('l5-001 distance non unique');
// l5-002 : la ساحة est un triangle réel (inégalité triangulaire)
if (!(32 + 60 > 68)) throw new Error('l5-002 triangle');
// l4-007 : 19 et 14 premiers entre eux, donc n multiple de 14
// l5-009 : effectif d'un فوج pair (tables de 2)
if (!divides(2, quo(462, pgcd(462, 546)) + quo(546, pgcd(462, 546)))) throw new Error('l5-009 tables');

const ID = 'ex-4am-wadiya-idmajiya-aadad';
const k = (s) => `${ID}-${s}`;

// Calculs partagés
const L1_001 = pgcd(24, 18);
const L1_002 = pgcd(240, 105);
const L2_001 = pgcd(165, 88);
const L2_002 = pgcdN(30, 45, 60);
const L3_001 = pgcd(1392, 812);
const L3_002 = pgcd(114, 84);
const L3_003P = q(irr(1274, 1078)).sub(q('2/11').mul('11/4'));
const L3_007B = q(irr(1683, 1309)).mul('14/3').sub(5);
const L3_010P = q(irr(1147, 1517)).add('10/41');
const L4_001 = pgcd(460, 300);
const L4_001n = quo(460, L4_001) * quo(300, L4_001);
const L4_003P = q(irr(3150, 1820)).sub(q('7/13').mul('5/2'));
const L4_007n = (() => { for (let n = 1; n <= 10000; n++) if (q(n).mul(q('1938/1428')).toString().indexOf('/') === -1) return n; throw new Error('l4-007'); })();
const L4_009Q = q(irr(1394, 2214)).mul('27/34');
const L4_010 = pgcdN(120, 72, 48);
const L5_001d = commonDivisors(135, 39).find((d) => d > 2);
const L5_001poles = quo(2 * (135 + 39), L5_001d);
const L5_001rolls = ceilDiv(4 * 2 * (135 + 39), 100);
const L5_001cost = L5_001poles * 650 + L5_001rolls * 3200;
const L5_002d = pgcdN(32, 60, 68);
const L5_002n = quo(32 + 60 + 68, L5_002d);
const L5_003 = pgcd(1265, 1035);
const L5_004d = pgcd(132, 84);
const L5_004n = quo(2 * (132 + 84), L5_004d);
const L5_005 = pgcd(1950, 1050);
const L5_006d = pgcdN(84, 126, 147, 105);
const L5_006n = quo(84 + 126 + 147 + 105, L5_006d);
const L5_007 = pgcd(780, 540);
const L5_007n = quo(780, L5_007) * quo(540, L5_007);
const L5_007cost = q(ceilDiv(L5_007n, 4) * 2600).add(q('7.8').mul('5.4').mul(450));
const L5_008 = pgcd(1813, 1078);
const L5_009 = pgcd(462, 546);
const L5_010 = pgcd(1125, 675);

export const ORACLE = {
  // ── Niveau 1 ──
  [k('l1-001:q1')]: R(L1_001),
  [k('l1-001:q2')]: R(quo(24, L1_001)),
  [k('l1-001:q3')]: R(quo(18, L1_001)),
  [k('l1-002:q1')]: R(L1_002),
  [k('l1-002:q2')]: R(quo(240, L1_002)),
  [k('l1-002:q3')]: R(quo(105, L1_002)),
  [k('l1-003:q1')]: G(462, 1078),
  [k('l1-003:q2')]: F(462, 1078),
  [k('l1-004:q1')]: G(875, 175),
  [k('l1-004:q2')]: F(175, 875),
  [k('l1-005:q1')]: G(391, 323),
  [k('l1-005:q2')]: yn(pgcd(391, 323) === 1),
  [k('l1-006:q1')]: G(630, 1155),
  [k('l1-006:q2')]: F(630, 1155),
  [k('l1-007:q1')]: G(1001, 455),
  [k('l1-007:q2')]: S(commonDivisors(1001, 455)),
  [k('l1-008:q1')]: G(156, 96),
  [k('l1-008:q2')]: G(156, 96),
  [k('l1-009:q1')]: G(2093, 1495),
  [k('l1-009:q2')]: F(2093, 1495),
  [k('l1-010:q1')]: yn(divides(13, 182) && divides(13, 234)),
  [k('l1-010:q2')]: yn(divides(39, 182) && divides(39, 234)),
  // ── Niveau 2 ──
  [k('l2-001:q1')]: R(L2_001),
  [k('l2-001:q2')]: R(quo(165, L2_001) * quo(88, L2_001)),
  [k('l2-002:q1')]: R(L2_002),
  [k('l2-002:q2')]: R(quo(30, L2_002) * quo(45, L2_002) * quo(60, L2_002)),
  [k('l2-003:q1')]: G(1235, 1045),
  [k('l2-003:q2')]: F(1235, 1045),
  [k('l2-004:q1')]: G(448, 64),
  [k('l2-004:q2')]: S(commonDivisors(448, 64)),
  [k('l2-005:q1')]: R(rem(1147, 1073)),
  [k('l2-005:q2')]: G(1147, 1073),
  [k('l2-006:q1')]: G(195, 105),
  [k('l2-006:q2')]: G(195, 105),
  [k('l2-006:q3')]: R(squares(195, 105)),
  [k('l2-007:q1')]: yn(divides(12, 216) && divides(12, 360)),
  [k('l2-007:q2')]: yn(divides(15, 216) && divides(15, 360)),
  [k('l2-007:q3')]: R(squares(216, 360)),
  [k('l2-008:q2')]: F(1092, 1365),
  [k('l2-009:q1')]: G(1584, 1188),
  [k('l2-009:q2')]: F(1188, 1584),
  [k('l2-010:q1')]: G(1426, 1081),
  [k('l2-010:q2')]: F(1426, 1081),
  // ── Niveau 3 ──
  [k('l3-001:q1')]: R(L3_001),
  [k('l3-001:q2')]: R(quo(1392, L3_001)),
  [k('l3-001:q3')]: R(quo(812, L3_001)),
  [k('l3-001:q4')]: F(812, 1392),
  [k('l3-002:q1')]: R(L3_002),
  [k('l3-002:q2')]: R(quo(114, L3_002)),
  [k('l3-002:q3')]: R(quo(84, L3_002)),
  [k('l3-002:q4')]: V(q(quo(114, L3_002)).mul(3).add(q(quo(84, L3_002)).mul('2.5'))),
  [k('l3-003:q1')]: G(1274, 1078),
  [k('l3-003:q2')]: F(1274, 1078),
  [k('l3-003:q3')]: V(L3_003P),
  [k('l3-004:q1')]: G(2236, 1548),
  [k('l3-004:q2')]: F(1548, 2236),
  [k('l3-004:q3')]: S(commonDivisors(2236, 1548)),
  [k('l3-005:q1')]: G(364, 208),
  [k('l3-005:q2')]: G(364, 208),
  [k('l3-005:q3')]: R(squares(364, 208)),
  [k('l3-006:q1')]: yn(divides(24, 336) && divides(24, 432)),
  [k('l3-006:q2')]: yn(divides(32, 336) && divides(32, 432)),
  [k('l3-006:q3')]: R(squares(336, 432)),
  [k('l3-007:q1')]: G(1683, 1309),
  [k('l3-007:q2')]: F(1683, 1309),
  [k('l3-007:q3')]: V(L3_007B),
  [k('l3-008:q1')]: G(1593, 1357),
  [k('l3-008:q2')]: yn(pgcd(1593, 1357) === 1),
  [k('l3-008:q3')]: F(1357, 1593),
  [k('l3-009:q1')]: G(1500, 250),
  [k('l3-009:q2')]: G(1500, 250),
  [k('l3-009:q3')]: R(quo(1500, pgcd(1500, 250)) + quo(250, pgcd(1500, 250))),
  [k('l3-010:q1')]: G(1517, 1147),
  [k('l3-010:q2')]: F(1147, 1517),
  [k('l3-010:q3')]: V(L3_010P),
  // ── Niveau 4 ──
  [k('l4-001:q1')]: R(L4_001),
  [k('l4-001:q2')]: R(L4_001),
  [k('l4-001:q3')]: R(L4_001n),
  [k('l4-001:q4')]: R(ceilDiv(L4_001n, 12) * 1450),
  [k('l4-002:q1')]: G(264, 165),
  [k('l4-002:q2')]: G(264, 165),
  [k('l4-002:q3')]: R(squares(264, 165)),
  [k('l4-002:q4')]: F(165, 264),
  [k('l4-003:q1')]: G(3150, 1820),
  [k('l4-003:q2')]: F(3150, 1820),
  [k('l4-003:q3')]: V(L4_003P),
  [k('l4-004:q1')]: G(2584, 1615),
  [k('l4-004:q2')]: F(2584, 1615),
  [k('l4-005:q1')]: G(270, 198),
  [k('l4-005:q2')]: G(270, 198),
  [k('l4-005:q3')]: R(squares(270, 198)),
  [k('l4-005:q4')]: yn(divides(12, 270) && divides(12, 198)),
  [k('l4-006:q1')]: yn(divides(9, 189) && divides(9, 297)),
  [k('l4-006:q2')]: yn(divides(21, 189) && divides(21, 297)),
  [k('l4-006:q3')]: R(squares(189, 297)),
  [k('l4-006:q4')]: F(189, 297),
  [k('l4-007:q1')]: G(1938, 1428),
  [k('l4-007:q2')]: F(1938, 1428),
  [k('l4-007:q3')]: R(L4_007n),
  [k('l4-008:q1')]: R(rem(1716, 1287)),
  [k('l4-008:q2')]: G(1716, 1287),
  [k('l4-008:q3')]: F(1287, 1716),
  [k('l4-009:q1')]: G(2214, 1394),
  [k('l4-009:q2')]: F(1394, 2214),
  [k('l4-009:q3')]: V(L4_009Q),
  [k('l4-010:q1')]: yn([120, 72, 48].every((n) => divides(8, n))),
  [k('l4-010:q2')]: yn([120, 72, 48].every((n) => divides(9, n))),
  [k('l4-010:q3')]: R(L4_010),
  [k('l4-010:q4')]: R(quo(120, L4_010) * quo(72, L4_010) * quo(48, L4_010)),
  // ── Niveau 5 ──
  [k('l5-001:q1')]: S(commonDivisors(135, 39)),
  [k('l5-001:q2')]: R(L5_001d),
  [k('l5-001:q3')]: R(L5_001poles),
  [k('l5-001:q4')]: R(L5_001rolls),
  [k('l5-001:q5')]: yn(!lt(150000, L5_001cost)),
  [k('l5-002:q1')]: R(L5_002d),
  [k('l5-002:q2')]: R(L5_002n),
  [k('l5-002:q3')]: R(maxPrice((p) => q(L5_002n).mul(q(p).mul('1.4')).add(2400), 38800)),
  [k('l5-003:q1')]: R(L5_003),
  [k('l5-003:q2')]: R(quo(1265, L5_003)),
  [k('l5-003:q3')]: R(quo(1035, L5_003)),
  [k('l5-003:q4')]: yn(divides(23, 1265) && divides(23, 1035)),
  [k('l5-003:q5')]: R(quo(1265, L5_003) * 350 + quo(1035, L5_003) * 300),
  [k('l5-004:q1')]: R(L5_004d),
  [k('l5-004:q2')]: R(L5_004n),
  [k('l5-004:q3')]: R(maxPrice((p) => q(L5_004n).mul(q(p).mul('1.8')).add(1200), 33600)),
  [k('l5-005:q1')]: R(L5_005),
  [k('l5-005:q2')]: R(quo(1950, L5_005)),
  [k('l5-005:q3')]: R(quo(1050, L5_005)),
  [k('l5-005:q4')]: F(1050, 1950),
  [k('l5-005:q5')]: V(q('3/5').mul(L5_005).mul(1680)),
  [k('l5-006:q1')]: R(L5_006d),
  [k('l5-006:q2')]: R(L5_006n),
  [k('l5-006:q3')]: R(maxPrice((p) => q(L5_006n).mul(p + 500), 44000)),
  [k('l5-007:q1')]: R(L5_007),
  [k('l5-007:q2')]: R(L5_007n),
  [k('l5-007:q3')]: V(L5_007cost),
  [k('l5-008:q1')]: R(L5_008),
  [k('l5-008:q2')]: R(quo(1813, L5_008)),
  [k('l5-008:q3')]: R(quo(1078, L5_008)),
  [k('l5-008:q4')]: F(1078, 1813),
  [k('l5-008:q5')]: R(quo(1813, L5_008) * 600 + quo(1078, L5_008) * 450),
  [k('l5-009:q1')]: F(462, 546),
  [k('l5-009:q2')]: R(L5_009),
  [k('l5-009:q3')]: R(quo(462, L5_009)),
  [k('l5-009:q4')]: R(quo(546, L5_009)),
  [k('l5-009:q5')]: R(L5_009 * quo(quo(462, L5_009) + quo(546, L5_009), 2) * 4500),
  [k('l5-010:q1')]: R(L5_010),
  [k('l5-010:q2')]: R(quo(1125, L5_010)),
  [k('l5-010:q3')]: R(quo(675, L5_010)),
  [k('l5-010:q4')]: yn(divides(50, 1125) && divides(50, 675)),
  [k('l5-010:q5')]: R(quo(1125, L5_010) * 380 + quo(675, L5_010) * 450 + 250),
};
