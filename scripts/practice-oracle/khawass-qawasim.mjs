// Oracle du banc « khawass-qawasim » (خواص قواسم عدد طبيعي), réécrit au format BEM le 2026-10-06 —
// chaque réponse RECALCULÉE ici à partir des nombres de l'énoncé, jamais lue dans `expectedAnswer`.
// À fusionner dans scripts/practice-answer-oracle.test.mjs (remplace les entrées en ligne de la leçon,
// bloc « // khawass-qawasim » : l2-001 q1/q2, l3-001 q1, l4-002 q1/q2, l5-002 q1).
//
// Outils : quotient et reste par SOUSTRACTIONS successives (indépendant de l'opérateur % du contenu),
// « k tel que x = n × k » refusé si n ne divise pas x, ensembles de diviseurs par balayage complet,
// union des diviseurs communs de f(n) et g(n) pour n = 0 … 400, fractions et inéquations exactes via q(...).
// Choix : نعم = A, لا = B ; ربح = A, خسارة = B ; l5-005 q4 : A = العرض 1, B = العرض 2.
import { R, C, q } from './helpers.mjs';

const S = (arr) => ({ value: [...arr].sort((a, b) => a - b).join(', ') });
/** division euclidienne par soustractions : [quotient, reste] */
const ediv = (a, b) => { let qq = 0, r = a; while (r >= b) { r -= b; qq++; } return [qq, r]; };
const rem = (a, b) => ediv(a, b)[1];
const divides = (d, n) => rem(n, d) === 0;
/** k tel que x = n × k — lève si n ne divise pas x */
const k = (x, n) => { const [qq, r] = ediv(x, n); if (r !== 0) throw new Error(`${n} ne divise pas ${x}`); return qq; };
const divisors = (n) => { const out = []; for (let d = 1; d <= n; d++) if (divides(d, n)) out.push(d); return out; };
const common = (a, b) => divisors(Math.min(a, b)).filter((d) => divides(d, a) && divides(d, b));
/** tous les diviseurs communs possibles de f(n) et g(n), n naturel (balayage 0 … 400) */
const commonUnion = (f, g) => {
  const out = new Set();
  for (let n = 0; n <= 400; n++) for (const d of common(f(n), g(n))) out.add(d);
  return [...out];
};
const yn = (b) => C(b ? 'A' : 'B');
const frac = (a, b) => R(q(`${a}/${b}`).toString());
/** plus grand p (exact) tel que coef·p + fixe ≤ budget */
const maxPrice = (coef, fixed, budget) => q(budget - fixed).div(coef).toString();

/* — Niveau 5 : situations recalculées — */
const tomatoBoxes = k(1764, 12) + k(1296, 12);
const tomatoLeft = tomatoBoxes * 900 - 18000;
const [houses, seedlingsLeft] = ediv(1288, 168);
const traysLeft = k(seedlingsLeft, 28);
let fertil = 0; while ((fertil + 1) * 650 <= traysLeft * 1250) fertil++;
const shelves = k(1428, 28) + k(952, 28);
const tents = k(1134, 18) + k(756, 18);
const campCost = tents * 12000 + Number(q(1500000).mul(q('20/100')).toString());
const sizes = { 1: [30, 1650], 2: [35, 1900], 3: [40, 2150] };
const okOffers = Object.keys(sizes).map(Number).filter((o) => divides(sizes[o][0], 1260) && divides(sizes[o][0], 1050));
const bagsOf = (o) => k(1260, sizes[o][0]) + k(1050, sizes[o][0]);
const costOf = (o) => bagsOf(o) * sizes[o][1];
const laps = [2700, 4050, 6750].map((m) => k(m, 450));
const [trucks, sardineLeft] = ediv(3815, 735);
const packs = k(504, 6) * 18;
const grainSacks = k(4650, 75) + k(2850, 75);
let trips = 0; while (trips * 40 < grainSacks) trips++;
const wagons = k(1980, 60) + k(1320, 60);

export const ORACLE = {
  /* ── Niveau 1 ── */
  // adapted — نشاط 3 حالة 1 : 18, 12, 3
  'ex-4am-khawass-qawasim-l1-001:q1': R(k(18 + 12, 3)),
  'ex-4am-khawass-qawasim-l1-001:q2': R(k(18 - 12, 3)),
  // adapted — نشاط 3 حالة 3 : 56, 21, 7
  'ex-4am-khawass-qawasim-l1-002:q1': R(rem(56, 21)),
  'ex-4am-khawass-qawasim-l1-002:q2': R(k(rem(56, 21), 7)),
  // على منوال BEM 2008 — 1386, 819, 9
  'ex-4am-khawass-qawasim-l1-003:q1': R(k(1386, 9)),
  'ex-4am-khawass-qawasim-l1-003:q2': R(k(819, 9)),
  'ex-4am-khawass-qawasim-l1-003:q3': R(k(1386 + 819, 9)),
  // على منوال BEM 2009 — 1430 − 559 = 13 × k
  'ex-4am-khawass-qawasim-l1-004:q1': R(k(1430 - 559, 13)),
  // على منوال BEM 2015 — 1078 ÷ 147 ; 7
  'ex-4am-khawass-qawasim-l1-005:q1': R(rem(1078, 147)),
  'ex-4am-khawass-qawasim-l1-005:q2': R(k(rem(1078, 147), 7)),
  // على منوال BEM 2024 — 595 et 340 livres, boîtes de 17
  'ex-4am-khawass-qawasim-l1-006:q1': yn(divides(17, 595) && divides(17, 340)),
  'ex-4am-khawass-qawasim-l1-006:q2': R(k(595 + 340, 17)),
  // على منوال BEM 2016 — 19 | 133 ; 13 300 000
  'ex-4am-khawass-qawasim-l1-007:q1': R(k(133, 19)),
  'ex-4am-khawass-qawasim-l1-007:q2': R(k(13300000, 19)),
  // على منوال BEM 2021 — 23 | 690 + 46 ? 690 + 47 ?
  'ex-4am-khawass-qawasim-l1-008:q1': yn(divides(23, 690 + 46)),
  'ex-4am-khawass-qawasim-l1-008:q2': yn(divides(23, 690 + 47)),
  // على منوال BEM 2023 — A = 13 × 254 − 13 × 79 ; A + 26
  'ex-4am-khawass-qawasim-l1-009:q1': R(k(13 * 254 - 13 * 79, 13)),
  'ex-4am-khawass-qawasim-l1-009:q2': R(k(13 * 254 - 13 * 79 + 26, 13)),
  // على منوال BEM 2025 — 966 ÷ 228 ; 6
  'ex-4am-khawass-qawasim-l1-010:q1': R(rem(966, 228)),
  'ex-4am-khawass-qawasim-l1-010:q2': R(k(rem(966, 228), 6)),

  /* ── Niveau 2 ── */
  // adapted — معارف : 9 | 90 et 900
  'ex-4am-khawass-qawasim-l2-001:q1': R(900 - 90),
  'ex-4am-khawass-qawasim-l2-001:q2': R(900 + 90),
  'ex-4am-khawass-qawasim-l2-001:q3': R(k(900 - 90, 9)),
  'ex-4am-khawass-qawasim-l2-001:q4': R(k(900 + 90, 9)),
  // adapted — تمرين 12 : 471, 192, 3
  'ex-4am-khawass-qawasim-l2-002:q1': R(k(471, 3)),
  'ex-4am-khawass-qawasim-l2-002:q2': R(k(192, 3)),
  'ex-4am-khawass-qawasim-l2-002:q3': R(k(471 - 192, 3)),
  'ex-4am-khawass-qawasim-l2-002:q4': R(k(471 + 192, 3)),
  // على منوال BEM 2008 — 1394, 323, 17 ; 323/1394 (counted:false)
  'ex-4am-khawass-qawasim-l2-003:q1': R(k(1394, 17)),
  'ex-4am-khawass-qawasim-l2-003:q2': R(k(323, 17)),
  'ex-4am-khawass-qawasim-l2-003:q3': frac(323, 1394),
  // على منوال BEM 2010 — 1235 ÷ 325 ; pièces de 65 cm
  'ex-4am-khawass-qawasim-l2-004:q1': R(rem(1235, 325)),
  'ex-4am-khawass-qawasim-l2-004:q2': R(k(1235, 65)),
  'ex-4am-khawass-qawasim-l2-004:q3': R(k(rem(1235, 325), 65)),
  // على منوال BEM 2024 — 714 et 476 : 14 ? 21 ? ; contenu d'une part
  'ex-4am-khawass-qawasim-l2-005:q1': yn(divides(14, 714) && divides(14, 476)),
  'ex-4am-khawass-qawasim-l2-005:q2': yn(divides(21, 714) && divides(21, 476)),
  'ex-4am-khawass-qawasim-l2-005:q3': R(k(714 + 476, 14)),
  // على منوال BEM 2015 — 2717 ÷ 494 ; 13
  'ex-4am-khawass-qawasim-l2-006:q1': R(rem(2717, 494)),
  'ex-4am-khawass-qawasim-l2-006:q2': R(k(rem(2717, 494), 13)),
  // على منوال BEM 2016 — 37 | 111, 777, 888
  'ex-4am-khawass-qawasim-l2-007:q1': R(k(111, 37)),
  'ex-4am-khawass-qawasim-l2-007:q2': R(k(777, 37)),
  'ex-4am-khawass-qawasim-l2-007:q3': R(k(777 + 111, 37)),
  // على منوال BEM 2021 — n + 23 et n + 3
  'ex-4am-khawass-qawasim-l2-008:q1': R((7 + 23) - (7 + 3)),
  'ex-4am-khawass-qawasim-l2-008:q2': S(commonUnion((n) => n + 23, (n) => n + 3)),
  // على منوال BEM 2023 — A = 1057/434 (counted:false) ; B = 1057 − 434 = 7 × k
  'ex-4am-khawass-qawasim-l2-009:q1': frac(1057, 434),
  'ex-4am-khawass-qawasim-l2-009:q2': R(k(1057 - 434, 7)),
  // على منوال BEM 2021 — 11 | 2310 + 66 ? ; k ; 2310 + 25 ?
  'ex-4am-khawass-qawasim-l2-010:q1': yn(divides(11, 2310 + 66)),
  'ex-4am-khawass-qawasim-l2-010:q2': R(k(2310 + 66, 11)),
  'ex-4am-khawass-qawasim-l2-010:q3': yn(divides(11, 2310 + 25)),

  /* ── Niveau 3 ── */
  // adapted — معارف : 90 ÷ 25 (q2 selfCheck)
  'ex-4am-khawass-qawasim-l3-001:q1': R(rem(90, 25)),
  // adapted — تمرين 14 : 7 | 217 ; 21 700 000
  'ex-4am-khawass-qawasim-l3-002:q1': R(k(217, 7)),
  'ex-4am-khawass-qawasim-l3-002:q2': R(k(21700000, 7)),
  // adapted — أتعلّم البرهنة (q1 selfCheck) : a = 7 × 45, b = 7 × 38
  'ex-4am-khawass-qawasim-l3-003:q2': R(k(7 * 45 + 7 * 38, 7)),
  // على منوال BEM 2008 — 1729 ÷ 532 ; 19 ; 532/1729 (counted:false)
  'ex-4am-khawass-qawasim-l3-004:q1': R(rem(1729, 532)),
  'ex-4am-khawass-qawasim-l3-004:q2': R(k(rem(1729, 532), 19)),
  'ex-4am-khawass-qawasim-l3-004:q3': frac(532, 1729),
  // على منوال BEM 2010 — 1680 et 1008, 24 ; vergers
  'ex-4am-khawass-qawasim-l3-005:q1': R(k(1680, 24)),
  'ex-4am-khawass-qawasim-l3-005:q2': R(k(1008, 24)),
  'ex-4am-khawass-qawasim-l3-005:q3': R(k(1680 + 1008, 24)),
  'ex-4am-khawass-qawasim-l3-005:q4': R(k(1680, 24) - k(1008, 24)),
  // على منوال BEM 2015 — 3553 ÷ 836 ; 19 ; P = (3553 − 836)/19
  'ex-4am-khawass-qawasim-l3-006:q1': R(rem(3553, 836)),
  'ex-4am-khawass-qawasim-l3-006:q2': R(k(rem(3553, 836), 19)),
  'ex-4am-khawass-qawasim-l3-006:q3': R(q('3553').sub(836).div(19).toString()),
  // على منوال BEM 2016 — 13 | 91, 9100, 9191
  'ex-4am-khawass-qawasim-l3-007:q1': R(k(91, 13)),
  'ex-4am-khawass-qawasim-l3-007:q2': R(k(9100, 13)),
  'ex-4am-khawass-qawasim-l3-007:q3': R(k(9191, 13)),
  // على منوال BEM 2021 — a = 2n + 9, b = n + 2 (q2 selfCheck)
  'ex-4am-khawass-qawasim-l3-008:q1': R((2 * 11 + 9) - 2 * (11 + 2)),
  'ex-4am-khawass-qawasim-l3-008:q3': S(commonUnion((n) => 2 * n + 9, (n) => n + 2)),
  // على منوال BEM 2023 — A = 1197/315 (counted:false) ; B, C = 21 × k
  'ex-4am-khawass-qawasim-l3-009:q1': frac(1197, 315),
  'ex-4am-khawass-qawasim-l3-009:q2': R(k(1197 + 315, 21)),
  'ex-4am-khawass-qawasim-l3-009:q3': R(k(1197 - 315, 21)),
  // على منوال BEM 2024 — jus 1386 et 1078 : 14 ? 12 ? ; boîtes
  'ex-4am-khawass-qawasim-l3-010:q1': yn(divides(14, 1386) && divides(14, 1078)),
  'ex-4am-khawass-qawasim-l3-010:q2': yn(divides(12, 1386) && divides(12, 1078)),
  'ex-4am-khawass-qawasim-l3-010:q3': R(k(1386 + 1078, 14)),

  /* ── Niveau 4 ── */
  // adapted — تمرين 13 : 11 | 14 300 ; 14 322 ; 14 325 ?
  'ex-4am-khawass-qawasim-l4-001:q1': R(k(14300, 11)),
  'ex-4am-khawass-qawasim-l4-001:q2': R(k(14322, 11)),
  'ex-4am-khawass-qawasim-l4-001:q3': yn(divides(11, 14325)),
  // adapted — تمرين 15 : n + 19, n + 1 (q2 selfCheck)
  'ex-4am-khawass-qawasim-l4-002:q1': R((5 + 19) - (5 + 1)),
  'ex-4am-khawass-qawasim-l4-002:q3': S(commonUnion((n) => n + 19, (n) => n + 1)),
  // adapted — تمرين 16 : n + 32, n + 2 (q2 selfCheck) ; n = 13
  'ex-4am-khawass-qawasim-l4-003:q1': R((9 + 32) - (9 + 2)),
  'ex-4am-khawass-qawasim-l4-003:q3': S(commonUnion((n) => n + 2, (n) => n + 32)),
  'ex-4am-khawass-qawasim-l4-003:q4': S(common(13 + 32, 13 + 2)),
  // على منوال BEM 2009 — 125 | 3375 et 1250 ; café
  'ex-4am-khawass-qawasim-l4-004:q1': R(k(3375, 125)),
  'ex-4am-khawass-qawasim-l4-004:q2': R(k(1250, 125)),
  'ex-4am-khawass-qawasim-l4-004:q3': R(k(3375 - 1250, 125)),
  'ex-4am-khawass-qawasim-l4-004:q4': R(k(3375 + 1250, 125)),
  // على منوال BEM 2010 — 1836 ÷ 476 (q2 selfCheck) ; 68 mm
  'ex-4am-khawass-qawasim-l4-005:q1': R(rem(1836, 476)),
  'ex-4am-khawass-qawasim-l4-005:q3': R(k(rem(1836, 476), 68)),
  // على منوال BEM 2015 — 4199 ÷ 1547 ; 221 ; 1547/4199 (counted:false)
  'ex-4am-khawass-qawasim-l4-006:q1': R(rem(4199, 1547)),
  'ex-4am-khawass-qawasim-l4-006:q2': R(k(rem(4199, 1547), 221)),
  'ex-4am-khawass-qawasim-l4-006:q3': frac(1547, 4199),
  // على منوال BEM 2016 — preuves (q1, q2 selfCheck) ; 5 × 85 + 3 × 51
  'ex-4am-khawass-qawasim-l4-007:q3': R(k(5 * 85 + 3 * 51, 17)),
  // على منوال BEM 2021 — a = 4n + 15, b = 2n + 3 (q2 selfCheck)
  'ex-4am-khawass-qawasim-l4-008:q1': R((4 * 6 + 15) - 2 * (2 * 6 + 3)),
  'ex-4am-khawass-qawasim-l4-008:q3': S(commonUnion((n) => 4 * n + 15, (n) => 2 * n + 3)),
  // على منوال BEM 2023 — A = 17 × 143, B = 17 × 98, C = A + 34
  'ex-4am-khawass-qawasim-l4-009:q1': R(k(17 * 143 + 34, 17)),
  'ex-4am-khawass-qawasim-l4-009:q2': R(q(17 * 143 - 17 * 98).div(17).toString()),
  'ex-4am-khawass-qawasim-l4-009:q3': yn(divides(17, 17 * 143 + 15)),
  // على منوال BEM 2024 — rubans 252 et 196 : 28 ? 21 ? ; différence ; total
  'ex-4am-khawass-qawasim-l4-010:q1': yn(divides(28, 252) && divides(28, 196)),
  'ex-4am-khawass-qawasim-l4-010:q2': yn(divides(21, 252) && divides(21, 196)),
  'ex-4am-khawass-qawasim-l4-010:q3': R(k(252 - 196, 28)),
  'ex-4am-khawass-qawasim-l4-010:q4': R(k(252 + 196, 28)),

  /* ── Niveau 5 — الوضعية الإدماجية ── */
  // على منوال BEM 2022 II — طماطم عين الدفلى
  'ex-4am-khawass-qawasim-l5-001:q1': R(k(1764, 12)),
  'ex-4am-khawass-qawasim-l5-001:q2': R(k(1296, 12)),
  'ex-4am-khawass-qawasim-l5-001:q3': R(tomatoBoxes),
  'ex-4am-khawass-qawasim-l5-001:q4': R(k(1764 - 1296, 12)),
  'ex-4am-khawass-qawasim-l5-001:q5': R(tomatoLeft),
  // على منوال BEM 2020 II — شتلات الفلفل بتيبازة
  'ex-4am-khawass-qawasim-l5-002:q1': R(houses),
  'ex-4am-khawass-qawasim-l5-002:q2': R(seedlingsLeft),
  'ex-4am-khawass-qawasim-l5-002:q3': R(traysLeft),
  'ex-4am-khawass-qawasim-l5-002:q4': R(fertil),
  // على منوال BEM 2021 II — رفوف مكتبة تيارت
  'ex-4am-khawass-qawasim-l5-003:q1': R(k(1428, 28)),
  'ex-4am-khawass-qawasim-l5-003:q2': R(k(952, 28)),
  'ex-4am-khawass-qawasim-l5-003:q3': R(shelves),
  'ex-4am-khawass-qawasim-l5-003:q4': R(maxPrice(shelves, 6000, 125000)),
  // على منوال BEM 2023 II — مخيّم بجاية (q4 : خسارة = B)
  'ex-4am-khawass-qawasim-l5-004:q1': R(k(1134, 18)),
  'ex-4am-khawass-qawasim-l5-004:q2': R(k(756, 18)),
  'ex-4am-khawass-qawasim-l5-004:q3': R(tents),
  'ex-4am-khawass-qawasim-l5-004:q4': C(campCost <= 1500000 ? 'A' : 'B'),
  'ex-4am-khawass-qawasim-l5-004:q5': R(Math.abs(campCost - 1500000)),
  // على منوال BEM 2024 II — خبز البويرة
  'ex-4am-khawass-qawasim-l5-005:q1': S(okOffers),
  'ex-4am-khawass-qawasim-l5-005:q2': R(bagsOf(1)),
  'ex-4am-khawass-qawasim-l5-005:q3': R(bagsOf(2)),
  'ex-4am-khawass-qawasim-l5-005:q4': C(costOf(1) < costOf(2) ? 'A' : 'B'),
  // على منوال BEM 2025 II — سباق عين تموشنت
  'ex-4am-khawass-qawasim-l5-006:q1': R(laps[0]),
  'ex-4am-khawass-qawasim-l5-006:q2': R(laps[1]),
  'ex-4am-khawass-qawasim-l5-006:q3': R(laps[2]),
  'ex-4am-khawass-qawasim-l5-006:q4': R(40 * (laps[0] + laps[1] + laps[2])),
  // على منوال BEM 2022 II — سردين بني صاف
  'ex-4am-khawass-qawasim-l5-007:q1': R(k(3815, 35)),
  'ex-4am-khawass-qawasim-l5-007:q2': R(k(735, 35)),
  'ex-4am-khawass-qawasim-l5-007:q3': R(trucks),
  'ex-4am-khawass-qawasim-l5-007:q4': R(sardineLeft),
  'ex-4am-khawass-qawasim-l5-007:q5': R(k(sardineLeft, 35)),
  'ex-4am-khawass-qawasim-l5-007:q6': R(sardineLeft * 380),
  // على منوال BEM 2021 II — مياه سعيدة
  'ex-4am-khawass-qawasim-l5-008:q1': R(k(504, 6)),
  'ex-4am-khawass-qawasim-l5-008:q2': R(packs),
  'ex-4am-khawass-qawasim-l5-008:q3': R(maxPrice(packs, 21200, 248000)),
  // على منوال BEM 2023 II — حبوب قالمة (q4 : ربح = A)
  'ex-4am-khawass-qawasim-l5-009:q1': R(k(4650, 75)),
  'ex-4am-khawass-qawasim-l5-009:q2': R(k(2850, 75)),
  'ex-4am-khawass-qawasim-l5-009:q3': R(grainSacks),
  'ex-4am-khawass-qawasim-l5-009:q4': C(trips * 2800 <= 15000 ? 'A' : 'B'),
  'ex-4am-khawass-qawasim-l5-009:q5': R(Math.abs(15000 - trips * 2800)),
  // على منوال BEM 2020 II — فوسفات تبسة (q1 selfCheck)
  'ex-4am-khawass-qawasim-l5-010:q2': R(k(1980, 60)),
  'ex-4am-khawass-qawasim-l5-010:q3': R(k(1320, 60)),
  'ex-4am-khawass-qawasim-l5-010:q4': R(wagons),
  'ex-4am-khawass-qawasim-l5-010:q5': yn(wagons * 45000 <= 2500000),
};
