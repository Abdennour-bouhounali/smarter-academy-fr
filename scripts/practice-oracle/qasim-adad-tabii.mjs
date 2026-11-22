// Oracle du banc « qasim-adad-tabii » (التعرّف على قاسم لعدد طبيعي), réécrit au format BEM le 2026-10-06 —
// chaque réponse RECALCULÉE ici à partir des nombres de l'énoncé, jamais lue dans `expectedAnswer`.
// À fusionner dans scripts/practice-answer-oracle.test.mjs (remplace les entrées en ligne de la leçon).
//
// Outils : division euclidienne en entiers (quotient / reste), test « b | a » par le reste nul,
// sous-ensemble des diviseurs pris dans une liste donnée, fractions exactes via q(...).
// Les « بيّن أن » (selfCheck) n'ont pas de clé et ne figurent pas ici. Pour les نعم / لا :
// A = نعم, B = لا (ordre des choix dans toutes les feuilles).
import { R, C, q } from './helpers.mjs';

const S = (arr) => ({ value: arr.join(', ') });
const quo = (a, b) => Math.floor(a / b);
const rem = (a, b) => a % b;
const divides = (b, a) => a % b === 0;
/** a = b × q exact : q, ou erreur si b ne divise pas a */
const exact = (a, b) => { if (!divides(b, a)) throw new Error(`${b} ne divise pas ${a}`); return a / b; };
/** نعم (A) si b | a, sinon لا (B) */
const yn = (b, a) => C(divides(b, a) ? 'A' : 'B');
const ynBool = (t) => C(t ? 'A' : 'B');
/** parmi la liste, ceux qui divisent n (ordre croissant) */
const amongDivisors = (n, list) => list.filter((d) => divides(d, n)).sort((x, y) => x - y);
/** plus petit k ≥ 0 à retrancher / ajouter pour obtenir un multiple de b */
const toSub = (a, b) => rem(a, b);
const toAdd = (a, b) => (b - rem(a, b)) % b;
/** forme irréductible exacte */
const red = (a, b) => q(`${a}/${b}`).toString();

/* — Niveau 5 : les coûts (étapes counted:false) recalculés en rationnels exacts — */
const qaffa = exact(1440, 16);
const rows540 = exact(540, amongDivisors(540, [24, 27, 28])[0]);
const jars378 = exact(378, 7);
const packs2750 = exact(2750, 125);
const teams156 = exact(156, 12);
const trips1650 = exact(1650, 150);
const poles1260 = exact(1260, 35) + 1; // un poteau à chaque extrémité
const offer1 = 840 * 45;
const offer2 = 840 * 30 + 10000;
const bottles1980 = exact(1980, 5);
const strips315 = exact(315, 15);

export const ORACLE = {
  /* ── Niveau 1 ── */
  // adapted — أستعدّ p. 7 : 137 = 5 × 25 + 12 n'est pas une division euclidienne (12 ≥ 5)
  'ex-4am-qasim-adad-tabii-l1-001:q1': ynBool(12 < 5),
  'ex-4am-qasim-adad-tabii-l1-001:q2': R(quo(137, 5)),
  'ex-4am-qasim-adad-tabii-l1-001:q3': R(rem(137, 5)),
  // adapted — نشاط 1 p. 8 : 420 livres, 26 ou 28 (A = 26, B = 28)
  'ex-4am-qasim-adad-tabii-l1-002:q1': R(rem(420, 26)),
  'ex-4am-qasim-adad-tabii-l1-002:q2': R(rem(420, 28)),
  'ex-4am-qasim-adad-tabii-l1-002:q3': C(divides(28, 420) && !divides(26, 420) ? 'B' : 'A'),
  // على منوال BEM 2009 — 875 = 125 × q
  'ex-4am-qasim-adad-tabii-l1-003:q1': R(exact(875, 125)),
  'ex-4am-qasim-adad-tabii-l1-003:q2': yn(125, 875),
  // على منوال BEM 2025 — 943 et 23
  'ex-4am-qasim-adad-tabii-l1-004:q1': R(rem(943, 23)),
  'ex-4am-qasim-adad-tabii-l1-004:q2': yn(23, 943),
  // على منوال BEM 2008 — 1458 et 27
  'ex-4am-qasim-adad-tabii-l1-005:q1': R(quo(1458, 27)),
  'ex-4am-qasim-adad-tabii-l1-005:q2': R(rem(1458, 27)),
  'ex-4am-qasim-adad-tabii-l1-005:q3': R(red(1458, 27)),
  // على منوال BEM 2024 — 360 bouteilles, 24 ? 28 ?
  'ex-4am-qasim-adad-tabii-l1-006:q1': yn(24, 360),
  'ex-4am-qasim-adad-tabii-l1-006:q2': yn(28, 360),
  // على منوال BEM 2015 — 1891 et 31
  'ex-4am-qasim-adad-tabii-l1-007:q1': R(quo(1891, 31)),
  'ex-4am-qasim-adad-tabii-l1-007:q2': R(rem(1891, 31)),
  'ex-4am-qasim-adad-tabii-l1-007:q3': yn(31, 1891),
  // على منوال BEM 2016 — 1001
  'ex-4am-qasim-adad-tabii-l1-008:q1': R(rem(1001, 7)),
  'ex-4am-qasim-adad-tabii-l1-008:q2': R(rem(1001, 9)),
  'ex-4am-qasim-adad-tabii-l1-008:q3': yn(9, 1001),
  // على منوال BEM 2021 — 612 = 17 × q
  'ex-4am-qasim-adad-tabii-l1-009:q1': R(exact(612, 17)),
  'ex-4am-qasim-adad-tabii-l1-009:q2': yn(36, 612),
  // على منوال BEM 2023 — A = 646/19
  'ex-4am-qasim-adad-tabii-l1-010:q1': R(q('646/19').toString()),
  'ex-4am-qasim-adad-tabii-l1-010:q2': yn(34, 646),

  /* ── Niveau 2 ── */
  // adapted — تمرين 2 p. 14
  'ex-4am-qasim-adad-tabii-l2-001:q1': S([80, 120, 295, 132].filter((n) => divides(6, n)).sort((a, b) => a - b)),
  'ex-4am-qasim-adad-tabii-l2-001:q2': R(exact(132, 6)),
  // adapted — تمرين 1 p. 14 : 1512 et 21
  'ex-4am-qasim-adad-tabii-l2-002:q1': R(quo(1512, 21)),
  'ex-4am-qasim-adad-tabii-l2-002:q2': R(rem(1512, 21)),
  'ex-4am-qasim-adad-tabii-l2-002:q3': yn(21, 1512),
  'ex-4am-qasim-adad-tabii-l2-002:q4': yn(72, 1512),
  // على منوال BEM 2008 — 1176 et 24
  'ex-4am-qasim-adad-tabii-l2-003:q1': R(quo(1176, 24)),
  'ex-4am-qasim-adad-tabii-l2-003:q2': R(rem(1176, 24)),
  'ex-4am-qasim-adad-tabii-l2-003:q3': yn(49, 1176),
  // على منوال BEM 2010 — fil de 1260cm en morceaux de 35cm
  'ex-4am-qasim-adad-tabii-l2-004:q1': R(rem(1260, 35)),
  'ex-4am-qasim-adad-tabii-l2-004:q2': yn(35, 1260),
  'ex-4am-qasim-adad-tabii-l2-004:q3': R(exact(1260, 35)),
  // على منوال BEM 2024 — 588 gâteaux, 12 ? 16 ?
  'ex-4am-qasim-adad-tabii-l2-005:q1': yn(12, 588),
  'ex-4am-qasim-adad-tabii-l2-005:q2': yn(16, 588),
  'ex-4am-qasim-adad-tabii-l2-005:q3': R(exact(588, 12)),
  // على منوال BEM 2015 — 2346 et 46
  'ex-4am-qasim-adad-tabii-l2-006:q1': R(quo(2346, 46)),
  'ex-4am-qasim-adad-tabii-l2-006:q2': R(rem(2346, 46)),
  'ex-4am-qasim-adad-tabii-l2-006:q3': yn(51, 2346),
  // على منوال BEM 2016 — 1987 et 15
  'ex-4am-qasim-adad-tabii-l2-007:q1': R(rem(1987, 15)),
  'ex-4am-qasim-adad-tabii-l2-007:q2': R(toSub(1987, 15)),
  'ex-4am-qasim-adad-tabii-l2-007:q3': R(toAdd(1987, 15)),
  // على منوال BEM 2021 — 1081 = 23 × q ; quotients par 1 et par 1081
  'ex-4am-qasim-adad-tabii-l2-008:q1': R(exact(1081, 23)),
  'ex-4am-qasim-adad-tabii-l2-008:q2': R(quo(1081, 1)),
  'ex-4am-qasim-adad-tabii-l2-008:q3': R(quo(1081, 1081)),
  // على منوال BEM 2023 — 1564/68 et 1564/36
  'ex-4am-qasim-adad-tabii-l2-009:q1': R(q('1564/68').toString()),
  'ex-4am-qasim-adad-tabii-l2-009:q2': yn(36, 1564),
  // على منوال BEM 2025 — 999 et 37, puis 1000 mod 37
  'ex-4am-qasim-adad-tabii-l2-010:q1': R(quo(999, 37)),
  'ex-4am-qasim-adad-tabii-l2-010:q2': R(rem(999, 37)),
  'ex-4am-qasim-adad-tabii-l2-010:q3': R(rem(1000, 37)),

  /* ── Niveau 3 ── */
  // adapted — معارف 1 p. 10 : 120 = 6 × 20
  'ex-4am-qasim-adad-tabii-l3-001:q1': yn(6, 120),
  'ex-4am-qasim-adad-tabii-l3-001:q2': yn(20, 120),
  'ex-4am-qasim-adad-tabii-l3-001:q3': ynBool(divides(120, 6)),     // « 6 مضاعف لـ 120 » ⇔ 120 | 6
  'ex-4am-qasim-adad-tabii-l3-001:q4': R(exact(120, 12)),
  // على منوال BEM 2015 — 4508 et 23 ; P = 4508/23 − 7 × 25
  'ex-4am-qasim-adad-tabii-l3-002:q1': R(quo(4508, 23)),
  'ex-4am-qasim-adad-tabii-l3-002:q2': R(rem(4508, 23)),
  'ex-4am-qasim-adad-tabii-l3-002:q3': yn(196, 4508),
  'ex-4am-qasim-adad-tabii-l3-002:q4': R(q('4508/23').sub(7 * 25).toString()),
  // على منوال BEM 2024 — 1080 cahiers
  'ex-4am-qasim-adad-tabii-l3-003:q1': yn(24, 1080),
  'ex-4am-qasim-adad-tabii-l3-003:q2': yn(25, 1080),
  'ex-4am-qasim-adad-tabii-l3-003:q3': R(exact(1080, 18)),
  // على منوال BEM 2010 — plaque 1258mm × 925mm, carrés de 37mm
  'ex-4am-qasim-adad-tabii-l3-004:q1': R(rem(1258, 37)),
  'ex-4am-qasim-adad-tabii-l3-004:q2': R(rem(925, 37)),
  'ex-4am-qasim-adad-tabii-l3-004:q3': R(exact(1258, 37)),
  'ex-4am-qasim-adad-tabii-l3-004:q4': R(exact(1258, 37) * exact(925, 37)),
  // على منوال BEM 2016 — N = 2³ × 3² × 5
  'ex-4am-qasim-adad-tabii-l3-005:q1': R(2 ** 3 * 3 ** 2 * 5),
  'ex-4am-qasim-adad-tabii-l3-005:q2': R(exact(2 ** 3 * 3 ** 2 * 5, 15)),
  'ex-4am-qasim-adad-tabii-l3-005:q3': yn(7, 2 ** 3 * 3 ** 2 * 5),
  // على منوال BEM 2021 — 1225 = 35 × q ; A = 1225/35 − (35/7) × 2
  'ex-4am-qasim-adad-tabii-l3-006:q1': R(exact(1225, 35)),
  'ex-4am-qasim-adad-tabii-l3-006:q3': R(q('1225/35').sub(q('35/7').mul(2)).toString()),
  // على منوال BEM 2008 — 2431 et 17 ; 2431/2448 irréductible
  'ex-4am-qasim-adad-tabii-l3-007:q1': R(quo(2431, 17)),
  'ex-4am-qasim-adad-tabii-l3-007:q2': R(rem(2431, 17)),
  'ex-4am-qasim-adad-tabii-l3-007:q3': R(red(2431, 2448)),
  // على منوال BEM 2023 — A = 1734/34 ; B = (1734 + 34)/34
  'ex-4am-qasim-adad-tabii-l3-008:q1': R(q('1734/34').toString()),
  'ex-4am-qasim-adad-tabii-l3-008:q2': yn(51, 1734),
  'ex-4am-qasim-adad-tabii-l3-008:q3': R(q(`${1734 + 34}/34`).toString()),
  // على منوال BEM 2025 — 5040 et 48 ; plus petit ajout NON NUL vers un multiple de 48
  'ex-4am-qasim-adad-tabii-l3-009:q1': R(rem(5040, 48)),
  'ex-4am-qasim-adad-tabii-l3-009:q2': yn(105, 5040),
  'ex-4am-qasim-adad-tabii-l3-009:q3': R(toAdd(5040, 48) || 48),
  // على منوال BEM 2009 — 4200g d'épices, boîtes de 125g / 150g, à 450DA
  'ex-4am-qasim-adad-tabii-l3-010:q1': yn(125, 4200),
  'ex-4am-qasim-adad-tabii-l3-010:q2': yn(150, 4200),
  'ex-4am-qasim-adad-tabii-l3-010:q3': R(exact(4200, 150)),
  'ex-4am-qasim-adad-tabii-l3-010:q4': R(exact(4200, 150) * 450),

  /* ── Niveau 4 ── */
  // adapted — تمرين 5 p. 14
  'ex-4am-qasim-adad-tabii-l4-001:q1': yn(8, 4),
  'ex-4am-qasim-adad-tabii-l4-001:q2': R(exact(360, 180)),
  // N = 2 × 3^10 × 5 × 7 en BigInt (3^10 = 59049)
  'ex-4am-qasim-adad-tabii-l4-001:q3': ynBool((2n * 3n ** 10n * 5n * 7n) % 9n === 0n),
  'ex-4am-qasim-adad-tabii-l4-001:q4': ynBool((2n * 3n ** 10n * 5n * 7n) % 10n === 0n),
  // على منوال BEM 2010 — 2023 = 7 × 289 = 7 × 17²
  'ex-4am-qasim-adad-tabii-l4-002:q1': R(rem(2023, 7)),
  'ex-4am-qasim-adad-tabii-l4-002:q2': R(exact(2023, 7)),
  'ex-4am-qasim-adad-tabii-l4-002:q3': yn(17, 289),
  'ex-4am-qasim-adad-tabii-l4-002:q4': R(exact(2023, 17)),
  // على منوال BEM 2024 — 432 plants, 16 ? 30 ? ; rangs de 24 ; 15DA le plant
  'ex-4am-qasim-adad-tabii-l4-003:q1': yn(16, 432),
  'ex-4am-qasim-adad-tabii-l4-003:q2': yn(30, 432),
  'ex-4am-qasim-adad-tabii-l4-003:q3': R(exact(432, 24)),
  'ex-4am-qasim-adad-tabii-l4-003:q4': R(432 * 15),
  // على منوال BEM 2015 — 3125 et 26
  'ex-4am-qasim-adad-tabii-l4-004:q1': R(quo(3125, 26)),
  'ex-4am-qasim-adad-tabii-l4-004:q2': R(rem(3125, 26)),
  'ex-4am-qasim-adad-tabii-l4-004:q3': yn(26, 3125),
  'ex-4am-qasim-adad-tabii-l4-004:q4': R(toSub(3125, 26)),
  'ex-4am-qasim-adad-tabii-l4-004:q5': R(toAdd(3125, 26)),
  // على منوال BEM 2016 — A = 6n + 15 : A(4), et A n'est jamais pair (balayage n = 0…1000)
  'ex-4am-qasim-adad-tabii-l4-005:q1': R(6 * 4 + 15),
  'ex-4am-qasim-adad-tabii-l4-005:q3': ynBool(Array.from({ length: 1001 }, (_, n) => 6 * n + 15).some((A) => divides(2, A))),
  // على منوال BEM 2021 — a = 2⁴ × 3³ × 5
  'ex-4am-qasim-adad-tabii-l4-006:q1': R(2 ** 4 * 3 ** 3 * 5),
  'ex-4am-qasim-adad-tabii-l4-006:q2': R(exact(2 ** 4 * 3 ** 3 * 5, 45)),
  'ex-4am-qasim-adad-tabii-l4-006:q3': yn(32, 2 ** 4 * 3 ** 3 * 5),
  'ex-4am-qasim-adad-tabii-l4-006:q4': yn(54, 2 ** 4 * 3 ** 3 * 5),
  // على منوال BEM 2023 — 2964/57, 2964/52, 2964/3135
  'ex-4am-qasim-adad-tabii-l4-007:q1': R(q('2964/57').toString()),
  'ex-4am-qasim-adad-tabii-l4-007:q2': R(q('2964/52').toString()),
  'ex-4am-qasim-adad-tabii-l4-007:q3': R(red(2964, 3135)),
  // على منوال BEM 2025 — 7777
  'ex-4am-qasim-adad-tabii-l4-008:q1': R(quo(7777, 7)),
  'ex-4am-qasim-adad-tabii-l4-008:q2': R(rem(7777, 7)),
  'ex-4am-qasim-adad-tabii-l4-008:q3': R(exact(7777, 11)),
  'ex-4am-qasim-adad-tabii-l4-008:q4': yn(77, 7777),
  // على منوال BEM 2008 — 1000 et 7 ; multiples de 7 encadrant 1000 (balayage)
  'ex-4am-qasim-adad-tabii-l4-009:q1': R(quo(1000, 7)),
  'ex-4am-qasim-adad-tabii-l4-009:q2': R(rem(1000, 7)),
  'ex-4am-qasim-adad-tabii-l4-009:q3': R(Array.from({ length: 1000 }, (_, i) => i).filter((n) => divides(7, n)).at(-1)),
  'ex-4am-qasim-adad-tabii-l4-009:q4': R(Array.from({ length: 20 }, (_, i) => 1001 + i).find((n) => divides(7, n))),
  // على منوال BEM 2010 — 3599 = 59 × 61 ; albums de 59 ? de 60 ?
  'ex-4am-qasim-adad-tabii-l4-010:q2': R(exact(3599, 59)),
  'ex-4am-qasim-adad-tabii-l4-010:q3': yn(59, 3599),
  'ex-4am-qasim-adad-tabii-l4-010:q4': yn(60, 3599),

  /* ── Niveau 5 — الوضعيات الإدماجية ── */
  // على منوال BEM 2022 II — قفف رمضان : 1440kg, 25 ? 16 ? ; huile 3 × 270 + sucre 2 × 110 ; 95000DA
  'ex-4am-qasim-adad-tabii-l5-001:q1': yn(25, 1440),
  'ex-4am-qasim-adad-tabii-l5-001:q2': yn(16, 1440),
  'ex-4am-qasim-adad-tabii-l5-001:q3': R(qaffa),
  'ex-4am-qasim-adad-tabii-l5-001:q4': R(95000 - qaffa * (3 * 270 + 2 * 110)),
  // على منوال BEM 2020 II — 540 chaises, 24/27/28 ; lampe p : rows × p + 1000 ≤ 9600
  'ex-4am-qasim-adad-tabii-l5-002:q1': S(amongDivisors(540, [24, 27, 28])),
  'ex-4am-qasim-adad-tabii-l5-002:q2': R(rows540),
  'ex-4am-qasim-adad-tabii-l5-002:q3': R(q(9600 - 1000).div(rows540).toString()),
  // على منوال BEM 2022 II — miel 378kg : seaux de 8 (q, r, manque), seaux de 7, bénéfice
  'ex-4am-qasim-adad-tabii-l5-003:q1': R(quo(378, 8)),
  'ex-4am-qasim-adad-tabii-l5-003:q2': R(rem(378, 8)),
  'ex-4am-qasim-adad-tabii-l5-003:q3': R(toAdd(378, 8)),
  'ex-4am-qasim-adad-tabii-l5-003:q4': R(jars378),
  'ex-4am-qasim-adad-tabii-l5-003:q5': R(jars378 * (23000 - 250)),
  // على منوال BEM 2021 II — 2750 cartes, 100 ? 125 ? ; 60000 − (2750 × 18 + paquets × 150)
  'ex-4am-qasim-adad-tabii-l5-004:q1': yn(100, 2750),
  'ex-4am-qasim-adad-tabii-l5-004:q2': yn(125, 2750),
  'ex-4am-qasim-adad-tabii-l5-004:q3': R(packs2750),
  'ex-4am-qasim-adad-tabii-l5-004:q4': R(60000 - (2750 * 18 + packs2750 * 150)),
  // على منوال BEM 2022 II — 156 élèves, 7 ? 12 ? ; manque pour 7 ; 225000 − (156 × 1200 + équipes × 2500)
  'ex-4am-qasim-adad-tabii-l5-005:q1': yn(7, 156),
  'ex-4am-qasim-adad-tabii-l5-005:q2': yn(12, 156),
  'ex-4am-qasim-adad-tabii-l5-005:q3': R(toAdd(156, 7)),
  'ex-4am-qasim-adad-tabii-l5-005:q4': R(teams156),
  'ex-4am-qasim-adad-tabii-l5-005:q5': R(225000 - (156 * 1200 + teams156 * 2500)),
  // على منوال BEM 2022 II — 1650 bottes, 120 ? 150 ? ; vente 350DA, voyage 4500DA
  'ex-4am-qasim-adad-tabii-l5-006:q1': yn(120, 1650),
  'ex-4am-qasim-adad-tabii-l5-006:q2': yn(150, 1650),
  'ex-4am-qasim-adad-tabii-l5-006:q3': R(trips1650),
  'ex-4am-qasim-adad-tabii-l5-006:q4': R(1650 * 350),
  'ex-4am-qasim-adad-tabii-l5-006:q5': R(1650 * 350 - trips1650 * 4500),
  // على منوال BEM 2020 II — rue de 1260m, 35 ? 40 ? ; poteaux = intervalles + 1 ; 800000 − n × (18500 + 2000)
  'ex-4am-qasim-adad-tabii-l5-007:q1': yn(35, 1260),
  'ex-4am-qasim-adad-tabii-l5-007:q2': yn(40, 1260),
  'ex-4am-qasim-adad-tabii-l5-007:q3': R(poles1260),
  'ex-4am-qasim-adad-tabii-l5-007:q4': R(800000 - poles1260 * (18500 + 2000)),
  // على منوال BEM 2024 II — 840 exemplaires, 24 ? 25 ? ; deux offres (A = الأول, B = الثاني)
  'ex-4am-qasim-adad-tabii-l5-008:q1': yn(24, 840),
  'ex-4am-qasim-adad-tabii-l5-008:q2': yn(25, 840),
  'ex-4am-qasim-adad-tabii-l5-008:q3': R(exact(840, 24)),
  'ex-4am-qasim-adad-tabii-l5-008:q4': R(offer1),
  'ex-4am-qasim-adad-tabii-l5-008:q5': R(offer2),
  'ex-4am-qasim-adad-tabii-l5-008:q6': C(offer1 < offer2 ? 'A' : 'B'),
  // على منوال BEM 2022 II — 1980 L d'huile, 8 ? 5 ? ; 12 commerçants ; (4200 − 60) × bouteilles
  'ex-4am-qasim-adad-tabii-l5-009:q1': yn(8, 1980),
  'ex-4am-qasim-adad-tabii-l5-009:q2': yn(5, 1980),
  'ex-4am-qasim-adad-tabii-l5-009:q3': R(bottles1980),
  'ex-4am-qasim-adad-tabii-l5-009:q4': yn(12, bottles1980),
  'ex-4am-qasim-adad-tabii-l5-009:q5': R(bottles1980 * (4200 - 60)),
  // على منوال BEM 2020 II — tapis de 315cm, 14 ? 15 ? ; laine 120g par bande à 1800DA le kg
  'ex-4am-qasim-adad-tabii-l5-010:q1': yn(14, 315),
  'ex-4am-qasim-adad-tabii-l5-010:q2': yn(15, 315),
  'ex-4am-qasim-adad-tabii-l5-010:q3': R(strips315),
  'ex-4am-qasim-adad-tabii-l5-010:q4': R(q(25000).sub(q(strips315 * 120).div(1000).mul(1800)).toString()),
};
