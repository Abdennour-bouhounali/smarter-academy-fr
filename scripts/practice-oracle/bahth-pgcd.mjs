// Oracle du banc « bahth-pgcd » (réécrit le 2026-10-06, prototype BEM) — chaque réponse RECALCULÉE ici
// à partir des nombres de l'énoncé, jamais lue dans `expectedAnswer`.
// Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Outils : pgcd par Euclide, nombre de divisions d'Euclide, fractions exactes via q(...).
// Les questions « بيّن أن » (selfCheck) n'ont pas de clé et ne figurent pas ici.
import { R, C, q } from './helpers.mjs';

const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
const gcd3 = (a, b, c) => gcd(gcd(a, b), c);
/** nombre de divisions euclidiennes jusqu'au reste nul */
const euclidSteps = (a, b) => { let n = 0; while (b) { [a, b] = [b, a % b]; n++; } return n; };
/** fraction a/b réduite, en chaîne exacte */
const red = (a, b) => q(`${a}/${b}`).toString();
/** « oui » (A) si le côté s divise les deux dimensions, sinon « non » (B) */
const yesNo = (s, w, l) => C(w % s === 0 && l % s === 0 ? 'A' : 'B');
/** rectangle w × l découpé en carrés de côté maximal : nombre de carrés */
const squares = (w, l) => (w / gcd(w, l)) * (l / gcd(w, l));
/**
 * Clôture d'un rectangle w × l (arbre à chaque coin, écart = PGCD) : n = périmètre / PGCD arbres.
 * Chaque arbre coûte p + (taux) p ; budget ≥ n (1 + taux) p + transport ⇒ p ≤ (budget − transport) / (n (1 + taux)).
 */
const maxTreePrice = (w, l, ratePct, transport, budget) => {
  const n = (2 * (w + l)) / gcd(w, l);
  return q(budget - transport).div(q(n).mul(q(100 + ratePct).div(100))).toString();
};

export const ORACLE = {
  // Manuel p. 12, معارف 4 — 21 و 14
  'ex-4am-bahth-pgcd-l1-001:q2': R(gcd(21, 14)),
  // سلسلة التفوق، وضعية 7 — الدنّان 24 L و 18 L
  'ex-4am-bahth-pgcd-l1-002:q1': R(gcd(24, 18)),
  'ex-4am-bahth-pgcd-l1-002:q2': R(24 / gcd(24, 18)),
  'ex-4am-bahth-pgcd-l1-002:q3': R(18 / gcd(24, 18)),
  // سلسلة التفوق، وضعية 2 — الحماية المدنية 240 و 105
  'ex-4am-bahth-pgcd-l1-003:q1': R(gcd(240, 105)),
  'ex-4am-bahth-pgcd-l1-003:q2': R(240 / gcd(240, 105)),
  'ex-4am-bahth-pgcd-l1-003:q3': R(105 / gcd(240, 105)),
  // Manuel p. 9, نشاط 8 — 84 و 48
  'ex-4am-bahth-pgcd-l1-004:q1': R(gcd(84, 48)),
  'ex-4am-bahth-pgcd-l1-004:q2': R(red(84, 48)),
  // Manuel p. 13, طرائق — 595 و 560
  'ex-4am-bahth-pgcd-l1-005:q1': R(gcd(595, 560)),
  'ex-4am-bahth-pgcd-l1-005:q2': R(red(595, 560)),
  // على منوال BEM 2021 — التمرين الأول
  'ex-4am-bahth-pgcd-l1-006:q1': R(gcd(156, 120)),
  // على منوال BEM 2025 — التمرين الثاني
  'ex-4am-bahth-pgcd-l1-007:q1': R(gcd(203, 87)),
  // على منوال BEM 2009 — التمرين الرابع
  'ex-4am-bahth-pgcd-l1-008:q1': R(gcd(98, 70)),
  // على منوال BEM 2016 — التمرين الأول
  'ex-4am-bahth-pgcd-l1-009:q1': R(gcd(135, 99)),
  // على منوال BEM 2015 — التمرين الأول
  'ex-4am-bahth-pgcd-l1-010:q1': R(gcd(247, 190)),

  // Manuel p. 9, نشاط 6a — 252 و 140
  'ex-4am-bahth-pgcd-l2-001:q1': R(252 - 140),
  'ex-4am-bahth-pgcd-l2-001:q2': R(gcd(252, 140)),
  // Manuel p. 13, طرائق (الفروق) — 117 و 91
  'ex-4am-bahth-pgcd-l2-002:q1': R(117 - 91),
  'ex-4am-bahth-pgcd-l2-002:q2': R(gcd(117, 91)),
  'ex-4am-bahth-pgcd-l2-002:q4': R(red(117, 91)),
  // BEM 2021 — التمرين الأول
  'ex-4am-bahth-pgcd-l2-003:q1': R(gcd(567, 448)),
  // BEM 2025 — التمرين الثاني
  'ex-4am-bahth-pgcd-l2-004:q1': R(gcd(1352, 507)),
  // سلسلة التفوق، وضعية 6 — البيوت البلاستيكية 165m × 88m
  'ex-4am-bahth-pgcd-l2-005:q1': R(gcd(165, 88)),
  'ex-4am-bahth-pgcd-l2-005:q2': R(squares(165, 88)),            // عدد البيوت (d = PGCD)
  // سلسلة التفوق، وضعية 5 — صندوق صهيب 30 × 45 × 60
  'ex-4am-bahth-pgcd-l2-006:q1': R(gcd3(30, 45, 60)),
  'ex-4am-bahth-pgcd-l2-006:q2': R((30 / gcd3(30, 45, 60)) * (45 / gcd3(30, 45, 60)) * (60 / gcd3(30, 45, 60))),
  // Manuel p. 15, تمرين 34 — 1005 و 315
  'ex-4am-bahth-pgcd-l2-007:q1': R(gcd(1005, 315)),
  'ex-4am-bahth-pgcd-l2-007:q2': R(red(1005, 315)),
  // سلسلة التفوق، تمرين 15 — 210/301 ; A = 17/86 − 210/301
  'ex-4am-bahth-pgcd-l2-008:q1': R(gcd(301, 210)),
  'ex-4am-bahth-pgcd-l2-008:q2': R(red(210, 301)),
  'ex-4am-bahth-pgcd-l2-008:q3': R(q('17/86').sub(q('210/301'))),
  // على منوال BEM 2023 — التمرين الأول : A = 1078/392
  'ex-4am-bahth-pgcd-l2-009:q1': R(gcd(1078, 392)),
  'ex-4am-bahth-pgcd-l2-009:q2': R(red(1078, 392)),
  // على منوال BEM 2016 — التمرين الأول
  'ex-4am-bahth-pgcd-l2-010:q1': R(gcd(935, 714)),
  'ex-4am-bahth-pgcd-l2-010:q2': R(red(935, 714)),

  // Manuel p. 9, نشاط 6b — 765 و 135
  'ex-4am-bahth-pgcd-l3-001:q1': R(765 % 135),
  'ex-4am-bahth-pgcd-l3-001:q2': R(gcd(765, 135)),
  'ex-4am-bahth-pgcd-l3-001:q3': R(euclidSteps(765, 135)),
  // Manuel p. 13, طرائق (إقليدس) — 1938 و 836
  'ex-4am-bahth-pgcd-l3-002:q1': R(1938 % 836),
  'ex-4am-bahth-pgcd-l3-002:q2': R(gcd(1938, 836)),
  'ex-4am-bahth-pgcd-l3-002:q4': R(red(836, 1938)),
  // سلسلة التفوق، تمرين 3 — الفروق المتتابعة, trois cas
  'ex-4am-bahth-pgcd-l3-003:q1': R(gcd(88, 40)),
  'ex-4am-bahth-pgcd-l3-003:q2': R(gcd(837, 341)),
  'ex-4am-bahth-pgcd-l3-003:q3': R(gcd(3465, 1575)),
  // BEM 2008 — التمرين الأول
  'ex-4am-bahth-pgcd-l3-004:q1': R(gcd(945, 1215)),
  'ex-4am-bahth-pgcd-l3-004:q2': R(red(945, 1215)),
  // BEM 2016 — التمرين الأول
  'ex-4am-bahth-pgcd-l3-005:q1': R(gcd(1053, 832)),
  'ex-4am-bahth-pgcd-l3-005:q2': R(red(1053, 832)),
  // BEM 2015 — التمرين الأول : P = 696/406 − 3/7 × 5/2
  'ex-4am-bahth-pgcd-l3-006:q1': R(gcd(696, 406)),
  'ex-4am-bahth-pgcd-l3-006:q2': R(red(696, 406)),
  'ex-4am-bahth-pgcd-l3-006:q3': R(q('696/406').sub(q('3/7').mul(q('5/2')))),
  // سلسلة التفوق، وضعية 1 — الكراريس 1392 والكتب 812
  'ex-4am-bahth-pgcd-l3-007:q1': R(gcd(1392, 812)),
  'ex-4am-bahth-pgcd-l3-007:q2': R(1392 / gcd(1392, 812)),
  'ex-4am-bahth-pgcd-l3-007:q3': R(812 / gcd(1392, 812)),
  // سلسلة التفوق، وضعية 8 — رفوف المصاحف 114 (ورش, 3 cm) و 84 (حفص, 2,5 cm)
  'ex-4am-bahth-pgcd-l3-008:q1': R(gcd(114, 84)),
  'ex-4am-bahth-pgcd-l3-008:q2': R(114 / gcd(114, 84)),
  'ex-4am-bahth-pgcd-l3-008:q3': R(84 / gcd(114, 84)),
  'ex-4am-bahth-pgcd-l3-008:q4': R(q(114 / gcd(114, 84)).mul(3).add(q(84 / gcd(114, 84)).mul('2.5'))),
  // سلسلة التفوق، تمرين 13 — 1631 و 932 ; A = 1631/932 − 1/2 × 3/2
  'ex-4am-bahth-pgcd-l3-009:q1': R(gcd(1631, 932)),
  'ex-4am-bahth-pgcd-l3-009:q2': R(red(1631, 932)),
  'ex-4am-bahth-pgcd-l3-009:q3': R(q('1631/932').sub(q('1/2').mul(q('3/2')))),
  // على منوال BEM 2015 — التمرين الأول : P = 1001/637 − 4/7 × 3/2
  'ex-4am-bahth-pgcd-l3-010:q1': R(gcd(1001, 637)),
  'ex-4am-bahth-pgcd-l3-010:q2': R(red(1001, 637)),
  'ex-4am-bahth-pgcd-l3-010:q3': R(q('1001/637').sub(q('4/7').mul(q('3/2')))),

  // Manuel p. 14, تمرين 19 — 1035/437, 943/861, 1111/111111
  'ex-4am-bahth-pgcd-l4-001:q1': R(gcd(1035, 437)),
  'ex-4am-bahth-pgcd-l4-001:q2': R(gcd(943, 861)),
  'ex-4am-bahth-pgcd-l4-001:q3': R(gcd(1111, 111111)),
  // Manuel p. 14, تمرين 20 — 5858 و 6767
  'ex-4am-bahth-pgcd-l4-002:q1': R(gcd(5858, 6767)),
  'ex-4am-bahth-pgcd-l4-002:q2': R(red(5858, 6767)),
  // سلسلة التفوق، تمرين 4 — إقليدس, trois cas
  'ex-4am-bahth-pgcd-l4-003:q1': R(gcd(845, 693)),
  'ex-4am-bahth-pgcd-l4-003:q2': R(gcd(725, 348)),
  'ex-4am-bahth-pgcd-l4-003:q3': R(gcd(2736, 1216)),
  'ex-4am-bahth-pgcd-l4-003:q4': R(red(2736, 1216)),
  // BEM 2010 — التمرين الثاني : 2,20 m × 1,4 m = 220 cm × 140 cm
  'ex-4am-bahth-pgcd-l4-004:q1': R(gcd(140, 220)),
  'ex-4am-bahth-pgcd-l4-004:q2': R(gcd(220, 140)),             // côté en cm
  'ex-4am-bahth-pgcd-l4-004:q3': R(squares(220, 140)),
  // BEM 2024 — التمرين الثاني : 270 cm × 378 cm
  'ex-4am-bahth-pgcd-l4-005:q1': yesNo(10, 270, 378),             // 378 % 10 = 8 ≠ 0 → لا
  'ex-4am-bahth-pgcd-l4-005:q2': yesNo(18, 270, 378),             // 270 = 18 × 15, 378 = 18 × 21 → نعم
  'ex-4am-bahth-pgcd-l4-005:q3': R(squares(270, 378)),
  // سلسلة التفوق، وضعية 3 — بلاط الغرفة 4,6 m × 3 m = 460 cm × 300 cm
  'ex-4am-bahth-pgcd-l4-006:q1': R(gcd(460, 300)),
  'ex-4am-bahth-pgcd-l4-006:q2': R(squares(460, 300)),
  // سلسلة التفوق، تمرين 9 — 63, 110 et 441/770 = 315/(315 + n)
  'ex-4am-bahth-pgcd-l4-007:q1': R(gcd(110, 63)),
  'ex-4am-bahth-pgcd-l4-007:q2': R(gcd(770, 441)),
  'ex-4am-bahth-pgcd-l4-007:q4': R(q(315).div(q('441/770')).sub(315)),
  // Manuel p. 15, تمرين 40 — 22816 و 19251
  'ex-4am-bahth-pgcd-l4-008:q1': R(gcd(22816, 19251)),
  'ex-4am-bahth-pgcd-l4-008:q2': R(red(22816, 19251)),
  // على منوال BEM 2010 — التمرين الثاني : 2,85 m × 1,95 m = 285 cm × 195 cm
  'ex-4am-bahth-pgcd-l4-009:q1': R(gcd(285, 195)),
  'ex-4am-bahth-pgcd-l4-009:q2': R(gcd(285, 195)),
  'ex-4am-bahth-pgcd-l4-009:q3': R(squares(285, 195)),
  // على منوال BEM 2024 — التمرين الثاني : 336 cm × 480 cm
  'ex-4am-bahth-pgcd-l4-010:q1': yesNo(20, 336, 480),             // 336 % 20 = 16 ≠ 0 → لا
  'ex-4am-bahth-pgcd-l4-010:q2': yesNo(24, 336, 480),             // 336 = 24 × 14, 480 = 24 × 20 → نعم
  'ex-4am-bahth-pgcd-l4-010:q3': R(squares(336, 480)),

  // Manuel p. 14, تمرين 21 — وضعية إدماجية : مصبّرات قالمة 21957 طماطم و 43351 هريسة ;
  // 120 DA / 85 DA la boîte ; remise 8 % au-delà de 10000 DA
  'ex-4am-bahth-pgcd-l5-001:q1': R(gcd(21957, 43351)),
  'ex-4am-bahth-pgcd-l5-001:q2': R(21957 / gcd(21957, 43351)),
  'ex-4am-bahth-pgcd-l5-001:q3': R(43351 / gcd(21957, 43351)),
  'ex-4am-bahth-pgcd-l5-001:q4': R((21957 / gcd(21957, 43351)) * 120 + (43351 / gcd(21957, 43351)) * 85),
  'ex-4am-bahth-pgcd-l5-001:q5': R((() => {
    const bill = (21957 / gcd(21957, 43351)) * 120 + (43351 / gcd(21957, 43351)) * 85;
    return bill > 10000 ? q(bill).sub(q(bill).mul(q('8/100'))).toString() : String(bill);
  })()),
  // Manuel p. 7, تحدّ — وضعية إدماجية : مآزر 936 (وردية, 650 DA) و 845 (زرقاء, 700 DA) ;
  // budget 1250000 DA, reste → قواميس à 1200 DA partagés également entre les PGCD écoles
  'ex-4am-bahth-pgcd-l5-002:q1': R(gcd(936, 845)),
  'ex-4am-bahth-pgcd-l5-002:q2': R(936 / gcd(936, 845)),
  'ex-4am-bahth-pgcd-l5-002:q3': R(845 / gcd(936, 845)),
  'ex-4am-bahth-pgcd-l5-002:q4': R(936 * 650 + 845 * 700),
  'ex-4am-bahth-pgcd-l5-002:q5': R(Math.floor((1250000 - (936 * 650 + 845 * 700)) / (1200 * gcd(936, 845)))),
  // BEM 2022 — الوضعية الإدماجية : 1188 بطاطا, 528 جزر
  'ex-4am-bahth-pgcd-l5-003:q1': R(gcd(1188, 528)),
  'ex-4am-bahth-pgcd-l5-003:q2': R(1188 / gcd(1188, 528)),
  'ex-4am-bahth-pgcd-l5-003:q3': R(528 / gcd(1188, 528)),
  // BEM 2020 — الوضعية الإدماجية : 60 m × 42 m, غرس 125 %, نقل 1400DA, 32000DA
  'ex-4am-bahth-pgcd-l5-004:q1': R(maxTreePrice(60, 42, 125, 1400, 32000)),
  // سلسلة التفوق، وضعية 4 — حقل النخيل 135 m × 39 m, écart > 2 m, 1250DA l'unité
  'ex-4am-bahth-pgcd-l5-005:q1': R(gcd(135, 39)),
  'ex-4am-bahth-pgcd-l5-005:q2': R((2 * (135 + 39)) / gcd(135, 39)),
  'ex-4am-bahth-pgcd-l5-005:q3': R(((2 * (135 + 39)) / gcd(135, 39)) * 1250),
  // سلسلة التفوق، وضعية 9 — حديقة مثلثة 32, 60, 68 m ; 650 + 150 DA par arbre
  'ex-4am-bahth-pgcd-l5-006:q1': R(gcd3(32, 60, 68)),
  'ex-4am-bahth-pgcd-l5-006:q2': R((32 + 60 + 68) / gcd3(32, 60, 68)),
  'ex-4am-bahth-pgcd-l5-006:q3': R(((32 + 60 + 68) / gcd3(32, 60, 68)) * (650 + 150)),
  // على منوال BEM 2020 — الوضعية الإدماجية : 84 m × 60 m, 125 %, 1800DA, 28800DA
  'ex-4am-bahth-pgcd-l5-007:q1': R(maxTreePrice(84, 60, 125, 1800, 28800)),
  // على منوال BEM 2020 — الوضعية الإدماجية : 78 m × 54 m, 150 %, 2000DA, 68000DA
  'ex-4am-bahth-pgcd-l5-008:q1': R(maxTreePrice(78, 54, 150, 2000, 68000)),
  // على منوال BEM 2022 — الوضعية الإدماجية : 966 بطاطا, 690 جزر
  'ex-4am-bahth-pgcd-l5-009:q1': R(gcd(966, 690)),
  'ex-4am-bahth-pgcd-l5-009:q2': R(966 / gcd(966, 690)),
  'ex-4am-bahth-pgcd-l5-009:q3': R(690 / gcd(966, 690)),
  // على منوال BEM 2022 — الوضعية الإدماجية : 1386 تفاح, 945 إجاص
  'ex-4am-bahth-pgcd-l5-010:q1': R(gcd(1386, 945)),
  'ex-4am-bahth-pgcd-l5-010:q2': R(1386 / gcd(1386, 945)),
  'ex-4am-bahth-pgcd-l5-010:q3': R(945 / gcd(1386, 945)),
};
