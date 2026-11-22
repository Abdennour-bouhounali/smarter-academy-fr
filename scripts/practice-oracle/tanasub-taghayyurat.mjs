// Oracle du banc « tanasub-taghayyurat » au format BEM (unité 7 « الدالة التآلفية », leçon 3 « تعيين دالة تآلفية انطلاقًا
// من عددين وصورتيهما », banque réécrite le 2026-10-07) — chaque réponse RECALCULÉE ici en rationnels exacts (helpers.mjs)
// à partir des nombres de l'ÉNONCÉ (les deux couples (x ; f(x)), l'expression d'une fonction donnée), sans lire le contenu
// ni le code testé. Fusionné dans scripts/practice-answer-oracle.test.mjs. Généré avec le banc par le script de l'auteur
// (gen.py, scratchpad) ; ne pas éditer une entrée sans recalculer l'autre côté.
// Les étapes « علّم / أنشئ » et « بيّن أن » sans valeur (selfCheck) n'ont pas de clé ; les questions fermées (choice) en ont une.
//
// Outils :
//   A(x1, y1, x2, y2)        le coefficient a = (y2 − y1) / (x2 − x1) (تناسب التغيّرات)
//   B(x1, y1, x2, y2, use)   b = y − a·x avec le point n° use (0 : le premier, 1 : le second)
//   fn(a, b) / thru(…)       la fonction x ⟼ a·x + b, donnée ou déterminée par deux couples
//   img(L, x) / ante(L, y)   L(x) ; le x tel que L(x) = y
//   quot(L, x1, x2)          (L(x2) − L(x1)) / (x2 − x1)
//   meetXY(L1, L2)           [x, y] du point d'intersection (étapes counted:false)
//   on(L, x, y) / eq(u, v)   (x ; y) est-il sur la droite ? égalité exacte
//   yesNo(b)                 « هل … ؟ » : A = نعم, B = لا
//   cheaper(u, v)            A si u < v, B si v < u (égalité → erreur)
//   floorQ / ceilQ           parties entières exactes (nombre de chaises, de colonnes)
import { R, C, P, q, solve2 } from './helpers.mjs';

const A = (x1, y1, x2, y2) => q(y2).sub(y1).div(q(x2).sub(x1));
const B = (x1, y1, x2, y2, use = 0) => (use ? q(y2).sub(A(x1, y1, x2, y2).mul(x2)) : q(y1).sub(A(x1, y1, x2, y2).mul(x1)));
const fn = (a, b) => ({ a: q(a), b: q(b) });
const thru = (x1, y1, x2, y2) => ({ a: A(x1, y1, x2, y2), b: B(x1, y1, x2, y2) });
const img = (L, x) => L.a.mul(x).add(L.b);
const ante = (L, y) => q(y).sub(L.b).div(L.a);
const quot = (L, x1, x2) => img(L, x2).sub(img(L, x1)).div(q(x2).sub(x1));
const eq = (u, v) => q(u).sub(q(v)).isZero();
const on = (L, x, y) => eq(img(L, x), y);
const yesNo = (b) => C(b ? 'A' : 'B');
function cheaper(u, v) {
  if (eq(u, v)) throw new Error('tanasub-taghayyurat oracle : égalité des deux offres');
  return C(q(u).sub(q(v)).n < 0n ? 'A' : 'B');
}
const meetXY = (L1, L2) => {
  const x = L2.b.sub(L1.b).div(L1.a.sub(L2.a));
  return [x.toString(), img(L1, x).toString()];
};
const floorQ = (v) => {
  const w = q(v);
  let f = w.n / w.d;
  if (w.n < 0n && f * w.d !== w.n) f -= 1n;
  return q(f.toString());
};
const ceilQ = (v) => floorQ(q(v).neg()).neg();

export const ORACLE = {
  // ex-4am-tanasub-taghayyurat-l1-001 — نشاط 4 — اشتراك المناصرين: حاصلا قسمة
  'ex-4am-tanasub-taghayyurat-l1-001:q1': R(quot(fn(200, 2000), 1, 4)),
  'ex-4am-tanasub-taghayyurat-l1-001:q2': R(quot(fn(200, 2000), 4, 6)),
  // ex-4am-tanasub-taghayyurat-l1-002 — نشاط 4 — من حاصل القسمة إلى فرق صورتين
  'ex-4am-tanasub-taghayyurat-l1-002:q1': R(quot(fn(200, 2000), 0, 1)),
  'ex-4am-tanasub-taghayyurat-l1-002:q2': R(fn(200, 2000).a.mul(10 - 7)),
  // ex-4am-tanasub-taghayyurat-l1-003 — حاصل قسمة لدالة تآلفية معلومة
  'ex-4am-tanasub-taghayyurat-l1-003:q1': R(quot(fn(3, 1), 2, 5)),
  // ex-4am-tanasub-taghayyurat-l1-004 — المعامل من عددين وصورتيهما
  'ex-4am-tanasub-taghayyurat-l1-004:q1': R(A(1, 4, 3, 10)),
  // ex-4am-tanasub-taghayyurat-l1-005 — حساب العدد b
  'ex-4am-tanasub-taghayyurat-l1-005:q1': R(q(11).sub(q(2).mul(3))),
  // ex-4am-tanasub-taghayyurat-l1-006 — العبارة الجبرية من صورتين
  'ex-4am-tanasub-taghayyurat-l1-006:q1': R(A(0, 5, 2, 9)),
  'ex-4am-tanasub-taghayyurat-l1-006:q2': R(B(0, 5, 2, 9)),
  // ex-4am-tanasub-taghayyurat-l1-007 — المعامل من جدول
  'ex-4am-tanasub-taghayyurat-l1-007:q1': R(A(2, 5, 6, 13)),
  // ex-4am-tanasub-taghayyurat-l1-008 — خاصية تناسب التغيّرات
  'ex-4am-tanasub-taghayyurat-l1-008:q2': R(quot(fn(-4, 7), 2, 9)),
  // ex-4am-tanasub-taghayyurat-l1-009 — العدد b من صورة عدد
  'ex-4am-tanasub-taghayyurat-l1-009:q1': R(q(7).sub(q(4).mul(1))),
  // ex-4am-tanasub-taghayyurat-l1-010 — المعاملان a و b
  'ex-4am-tanasub-taghayyurat-l1-010:q1': R(A(2, 10, 4, 16)),
  'ex-4am-tanasub-taghayyurat-l1-010:q2': R(B(2, 10, 4, 16)),
  // ex-4am-tanasub-taghayyurat-l2-001 — تحدّ — من السلسيوس إلى الفهرنهايت
  'ex-4am-tanasub-taghayyurat-l2-001:q1': R(A(10, 50, 30, 86)),
  'ex-4am-tanasub-taghayyurat-l2-001:q2': R(A(10, 50, 30, 86).mul(25 - 15)),
  // ex-4am-tanasub-taghayyurat-l2-002 — عدد سالب وصورته
  'ex-4am-tanasub-taghayyurat-l2-002:q1': R(A(-1, 2, 3, 10)),
  'ex-4am-tanasub-taghayyurat-l2-002:q2': R(B(-1, 2, 3, 10)),
  // ex-4am-tanasub-taghayyurat-l2-003 — BEM 2016 — التمرين الثالث
  'ex-4am-tanasub-taghayyurat-l2-003:q1': R(A(2, 5, -1, -4)),
  'ex-4am-tanasub-taghayyurat-l2-003:q2': R(B(2, 5, -1, -4)),
  'ex-4am-tanasub-taghayyurat-l2-003:q3': yesNo(on(thru(2, 5, -1, -4), 4, 11)),
  'ex-4am-tanasub-taghayyurat-l2-003:q4': R(ante(thru(2, 5, -1, -4), 29)),
  // ex-4am-tanasub-taghayyurat-l2-004 — جدول وعبارة
  'ex-4am-tanasub-taghayyurat-l2-004:q1': R(A(0, -3, 4, 5)),
  'ex-4am-tanasub-taghayyurat-l2-004:q2': R(B(0, -3, 4, 5)),
  'ex-4am-tanasub-taghayyurat-l2-004:q3': R(img(thru(0, -3, 4, 5), 10)),
  // ex-4am-tanasub-taghayyurat-l2-005 — معامل كسري
  'ex-4am-tanasub-taghayyurat-l2-005:q1': R(A(2, 1, 6, 3)),
  'ex-4am-tanasub-taghayyurat-l2-005:q2': R(B(2, 1, 6, 3)),
  'ex-4am-tanasub-taghayyurat-l2-005:q3': C('A') /* b = B(2, 1, 6, 3) = 0 */,
  // ex-4am-tanasub-taghayyurat-l2-006 — باقة إنترنت شهرية
  'ex-4am-tanasub-taghayyurat-l2-006:q1': R(A(2, 700, 5, 1300)),
  'ex-4am-tanasub-taghayyurat-l2-006:q2': R(B(2, 700, 5, 1300)),
  'ex-4am-tanasub-taghayyurat-l2-006:q3': R(img(thru(2, 700, 5, 1300), 8)),
  // ex-4am-tanasub-taghayyurat-l2-007 — على منوال BEM 2016 — مستقيم يشمل نقطتين
  'ex-4am-tanasub-taghayyurat-l2-007:q1': R(A(1, -1, 3, 7)),
  'ex-4am-tanasub-taghayyurat-l2-007:q2': R(B(1, -1, 3, 7)),
  'ex-4am-tanasub-taghayyurat-l2-007:q3': yesNo(on(thru(1, -1, 3, 7), -1, -9)),
  'ex-4am-tanasub-taghayyurat-l2-007:q4': R(ante(thru(1, -1, 3, 7), 23)),
  // ex-4am-tanasub-taghayyurat-l2-008 — ترتيب الطرح في حاصل القسمة
  'ex-4am-tanasub-taghayyurat-l2-008:q1': yesNo(eq(q(13).sub(4).div(q(2).sub(5)), A(2, 4, 5, 13))),
  'ex-4am-tanasub-taghayyurat-l2-008:q2': R(A(2, 4, 5, 13)),
  'ex-4am-tanasub-taghayyurat-l2-008:q3': R(B(2, 4, 5, 13)),
  // ex-4am-tanasub-taghayyurat-l2-009 — على منوال BEM 2025 — عبارة دالة ونقطة تقاطع
  'ex-4am-tanasub-taghayyurat-l2-009:q1': R(A(1, 3, 4, -3)),
  'ex-4am-tanasub-taghayyurat-l2-009:q2': R(B(1, 3, 4, -3)),
  'ex-4am-tanasub-taghayyurat-l2-009:q3': R(img(fn(1, -4), -2)),
  'ex-4am-tanasub-taghayyurat-l2-009:q4': P(...meetXY(thru(1, 3, 4, -3), fn(1, -4))),
  // ex-4am-tanasub-taghayyurat-l2-010 — مستقيم يقطع المحورين
  'ex-4am-tanasub-taghayyurat-l2-010:q1': R(A(0, 6, 3, 0)),
  'ex-4am-tanasub-taghayyurat-l2-010:q2': R(B(0, 6, 3, 0)),
  // ex-4am-tanasub-taghayyurat-l3-001 — تحدّ — العبارة والتحويلات
  'ex-4am-tanasub-taghayyurat-l3-001:q1': R(A(10, 50, 30, 86)),
  'ex-4am-tanasub-taghayyurat-l3-001:q2': R(B(10, 50, 30, 86)),
  'ex-4am-tanasub-taghayyurat-l3-001:q3': R(img(thru(10, 50, 30, 86), 100)),
  'ex-4am-tanasub-taghayyurat-l3-001:q4': R(q(0).sub(B(10, 50, 30, 86)).div(A(10, 50, 30, 86).sub(1))),
  // ex-4am-tanasub-taghayyurat-l3-002 — معامل كسري وفرق صورتين
  'ex-4am-tanasub-taghayyurat-l3-002:q1': R(A(1, 2, 4, 4)),
  'ex-4am-tanasub-taghayyurat-l3-002:q2': R(B(1, 2, 4, 4)),
  'ex-4am-tanasub-taghayyurat-l3-002:q3': R(A(1, 2, 4, 4).mul(7 - 1)),
  // ex-4am-tanasub-taghayyurat-l3-003 — أعداد عشرية
  'ex-4am-tanasub-taghayyurat-l3-003:q1': R(A(2, '3.5', 6, '5.5')),
  'ex-4am-tanasub-taghayyurat-l3-003:q2': R(B(2, '3.5', 6, '5.5')),
  'ex-4am-tanasub-taghayyurat-l3-003:q3': R(img(thru(2, '3.5', 6, '5.5'), 10)),
  // ex-4am-tanasub-taghayyurat-l3-004 — تعيين دالة تآلفية بجملة معادلتين
  'ex-4am-tanasub-taghayyurat-l3-004:q2': P(...solve2(3, 1, 11, 5, 1, 17)),
  'ex-4am-tanasub-taghayyurat-l3-004:q3': R(img(thru(3, 11, 5, 17), -2)),
  // ex-4am-tanasub-taghayyurat-l3-005 — BEM 2008 — التمرين الرابع
  'ex-4am-tanasub-taghayyurat-l3-005:q2': R(A(1, 0, 0, 4)),
  'ex-4am-tanasub-taghayyurat-l3-005:q3': R(B(1, 0, 0, 4)),
  'ex-4am-tanasub-taghayyurat-l3-005:q5': P(...meetXY(thru(0, 4, 1, 0), fn('2/3', 2))),
  // ex-4am-tanasub-taghayyurat-l3-006 — كسور وإشارات
  'ex-4am-tanasub-taghayyurat-l3-006:q1': R(A(-3, 5, 1, 3)),
  'ex-4am-tanasub-taghayyurat-l3-006:q2': R(B(-3, 5, 1, 3, 1)),
  'ex-4am-tanasub-taghayyurat-l3-006:q3': R(ante(thru(-3, 5, 1, 3), 0)),
  // ex-4am-tanasub-taghayyurat-l3-007 — على منوال BEM 2008 — المستقيم $(AB)$ ونقطة التقاطع
  'ex-4am-tanasub-taghayyurat-l3-007:q2': R(A(0, -3, 2, 0)),
  'ex-4am-tanasub-taghayyurat-l3-007:q3': R(B(0, -3, 2, 0)),
  'ex-4am-tanasub-taghayyurat-l3-007:q5': P(...meetXY(thru(0, -3, 2, 0), fn('1/2', 1))),
  // ex-4am-tanasub-taghayyurat-l3-008 — على منوال BEM 2025 — دالتان ونقطة تقاطعهما
  'ex-4am-tanasub-taghayyurat-l3-008:q1': R(A(-1, 8, 2, -1)),
  'ex-4am-tanasub-taghayyurat-l3-008:q2': R(B(-1, 8, 2, -1)),
  'ex-4am-tanasub-taghayyurat-l3-008:q3': R(img(fn(2, -10), 1)),
  'ex-4am-tanasub-taghayyurat-l3-008:q4': P(...meetXY(thru(-1, 8, 2, -1), fn(2, -10))),
  // ex-4am-tanasub-taghayyurat-l3-009 — المعاملان ثم العدد الذي صورته معدومة
  'ex-4am-tanasub-taghayyurat-l3-009:q1': R(A(4, 13, 8, 21)),
  'ex-4am-tanasub-taghayyurat-l3-009:q2': R(B(4, 13, 8, 21)),
  'ex-4am-tanasub-taghayyurat-l3-009:q3': R(ante(thru(4, 13, 8, 21), 0)),
  // ex-4am-tanasub-taghayyurat-l3-010 — على منوال BEM 2016 — نقط ليست في استقامية
  'ex-4am-tanasub-taghayyurat-l3-010:q1': R(A(-2, -7, 3, 3)),
  'ex-4am-tanasub-taghayyurat-l3-010:q2': R(B(-2, -7, 3, 3, 1)),
  'ex-4am-tanasub-taghayyurat-l3-010:q3': yesNo(on(thru(-2, -7, 3, 3), 5, 8)),
  'ex-4am-tanasub-taghayyurat-l3-010:q4': R(ante(thru(-2, -7, 3, 3), 12)),
  // ex-4am-tanasub-taghayyurat-l4-001 — محرار بتدريجتين
  'ex-4am-tanasub-taghayyurat-l4-001:q1': R(A(20, 68, 35, 95)),
  'ex-4am-tanasub-taghayyurat-l4-001:q2': R(B(20, 68, 35, 95)),
  'ex-4am-tanasub-taghayyurat-l4-001:q3': R(img(thru(20, 68, 35, 95), 40)),
  'ex-4am-tanasub-taghayyurat-l4-001:q4': R(A(20, 68, 35, 95).mul(15)),
  // ex-4am-tanasub-taghayyurat-l4-002 — شمعة تحترق بانتظام
  'ex-4am-tanasub-taghayyurat-l4-002:q1': R(A(2, 17, 5, 11)),
  'ex-4am-tanasub-taghayyurat-l4-002:q2': R(B(2, 17, 5, 11)),
  'ex-4am-tanasub-taghayyurat-l4-002:q3': R(ante(thru(2, 17, 5, 11), 0)),
  'ex-4am-tanasub-taghayyurat-l4-002:q4': R(A(2, 17, 5, 11).mul('0.75').neg()),
  // ex-4am-tanasub-taghayyurat-l4-003 — اشتراك قاعة رياضة
  'ex-4am-tanasub-taghayyurat-l4-003:q1': R(A(2, 3500, 6, 7500)),
  'ex-4am-tanasub-taghayyurat-l4-003:q2': R(B(2, 3500, 6, 7500)),
  'ex-4am-tanasub-taghayyurat-l4-003:q3': R(ante(thru(2, 3500, 6, 7500), 12500)),
  'ex-4am-tanasub-taghayyurat-l4-003:q4': cheaper(img(thru(2, 3500, 6, 7500), 8), q(1250).mul(8)),
  // ex-4am-tanasub-taghayyurat-l4-004 — ملء خزان
  'ex-4am-tanasub-taghayyurat-l4-004:q1': R(A(3, 95, 8, 220)),
  'ex-4am-tanasub-taghayyurat-l4-004:q2': R(B(3, 95, 8, 220)),
  'ex-4am-tanasub-taghayyurat-l4-004:q3': R(ante(thru(3, 95, 8, 220), 520)),
  'ex-4am-tanasub-taghayyurat-l4-004:q4': R(A(3, 95, 8, 220).mul(14 - 8)),
  // ex-4am-tanasub-taghayyurat-l4-005 — BEM 2025 — التمرين الرابع
  'ex-4am-tanasub-taghayyurat-l4-005:q1': R(A(2, 5, 3, 8)),
  'ex-4am-tanasub-taghayyurat-l4-005:q2': R(B(2, 5, 3, 8)),
  'ex-4am-tanasub-taghayyurat-l4-005:q3': R(img(fn(5, -7), 1)),
  'ex-4am-tanasub-taghayyurat-l4-005:q4': P(...meetXY(thru(2, 5, 3, 8), fn(5, -7))),
  // ex-4am-tanasub-taghayyurat-l4-006 — تطبيق لحجز سيارات الأجرة
  'ex-4am-tanasub-taghayyurat-l4-006:q1': R(A(3, 220, 7, 380)),
  'ex-4am-tanasub-taghayyurat-l4-006:q2': R(B(3, 220, 7, 380)),
  'ex-4am-tanasub-taghayyurat-l4-006:q3': R(ante(thru(3, 220, 7, 380), 500)),
  'ex-4am-tanasub-taghayyurat-l4-006:q4': R(A(3, 220, 7, 380).mul('2.5')),
  // ex-4am-tanasub-taghayyurat-l4-007 — مستقيم يشمل نقطتين
  'ex-4am-tanasub-taghayyurat-l4-007:q1': R(A(-4, 1, 6, 6)),
  'ex-4am-tanasub-taghayyurat-l4-007:q2': R(B(-4, 1, 6, 6)),
  'ex-4am-tanasub-taghayyurat-l4-007:q3': R(img(thru(-4, 1, 6, 6), 10)),
  'ex-4am-tanasub-taghayyurat-l4-007:q4': R(ante(thru(-4, 1, 6, 6), 0)),
  // ex-4am-tanasub-taghayyurat-l4-008 — على منوال BEM 2008 — مستقيمان ونقطتا تقاطع
  'ex-4am-tanasub-taghayyurat-l4-008:q2': R(A(0, -4, 2, 2)),
  'ex-4am-tanasub-taghayyurat-l4-008:q3': R(B(0, -4, 2, 2)),
  'ex-4am-tanasub-taghayyurat-l4-008:q5': P(...meetXY(thru(0, -4, 2, 2), fn(-2, 1))),
  'ex-4am-tanasub-taghayyurat-l4-008:q6': P(ante(fn(-2, 1), 0), 0),
  // ex-4am-tanasub-taghayyurat-l4-009 — أيّ الدوال تآلفية؟
  'ex-4am-tanasub-taghayyurat-l4-009:q1': yesNo(eq(A(1, 5, 2, 7), A(2, 7, 4, 11))),
  'ex-4am-tanasub-taghayyurat-l4-009:q2': yesNo(eq(A(1, 5, 2, 7), A(2, 7, 4, 13))),
  'ex-4am-tanasub-taghayyurat-l4-009:q3': yesNo(eq(A(1, 3, 2, 6), A(2, 6, 4, 10))),
  'ex-4am-tanasub-taghayyurat-l4-009:q4': R(A(1, 5, 2, 7)),
  'ex-4am-tanasub-taghayyurat-l4-009:q5': R(B(1, 5, 2, 7)),
  // ex-4am-tanasub-taghayyurat-l4-010 — على منوال BEM 2025 — عبارة واستقامية وتقاطع
  'ex-4am-tanasub-taghayyurat-l4-010:q1': R(A(-2, -7, 1, 5)),
  'ex-4am-tanasub-taghayyurat-l4-010:q2': R(B(-2, -7, 1, 5, 1)),
  'ex-4am-tanasub-taghayyurat-l4-010:q3': R(img(fn(-2, 13), 3)),
  'ex-4am-tanasub-taghayyurat-l4-010:q4': P(...meetXY(thru(-2, -7, 1, 5), fn(-2, 13))),
  'ex-4am-tanasub-taghayyurat-l4-010:q5': yesNo(on(thru(-2, -7, 1, 5), -1, -3)),
  // ex-4am-tanasub-taghayyurat-l5-001 — على منوال BEM 2019 — درجة الحرارة على طريق تيكجدة
  'ex-4am-tanasub-taghayyurat-l5-001:q1': R(A(500, 17, 1500, 11)),
  'ex-4am-tanasub-taghayyurat-l5-001:q2': R(B(500, 17, 1500, 11)),
  'ex-4am-tanasub-taghayyurat-l5-001:q3': C('A') /* b = T(0) */,
  'ex-4am-tanasub-taghayyurat-l5-001:q4': R(A(500, 17, 1500, 11).mul(250).neg()),
  'ex-4am-tanasub-taghayyurat-l5-001:q5': R(img(thru(500, 17, 1500, 11), 2300)),
  'ex-4am-tanasub-taghayyurat-l5-001:q6': R(ante(thru(500, 17, 1500, 11), 8)),
  // ex-4am-tanasub-taghayyurat-l5-002 — على منوال BEM 2012 — نابض في مخبر متوسطة بقسنطينة
  'ex-4am-tanasub-taghayyurat-l5-002:q1': R(A(200, 14, 500, 20)),
  'ex-4am-tanasub-taghayyurat-l5-002:q2': R(B(200, 14, 500, 20)),
  'ex-4am-tanasub-taghayyurat-l5-002:q3': C('A') /* b = L(0) */,
  'ex-4am-tanasub-taghayyurat-l5-002:q4': R(img(thru(200, 14, 500, 20), 350)),
  'ex-4am-tanasub-taghayyurat-l5-002:q5': R(ante(thru(200, 14, 500, 20), 18)),
  'ex-4am-tanasub-taghayyurat-l5-002:q6': R(A(200, 14, 500, 20).mul(50)),
  'ex-4am-tanasub-taghayyurat-l5-002:q7': R(ante(thru(200, 14, 500, 20), 25)),
  // ex-4am-tanasub-taghayyurat-l5-003 — على منوال BEM 2014 — مقاس الحذاء وطول القدم بالعلمة
  'ex-4am-tanasub-taghayyurat-l5-003:q1': R(A(24, 38, 28, 44)),
  'ex-4am-tanasub-taghayyurat-l5-003:q2': R(B(24, 38, 28, 44)),
  'ex-4am-tanasub-taghayyurat-l5-003:q3': R(img(thru(24, 38, 28, 44), 26)),
  'ex-4am-tanasub-taghayyurat-l5-003:q4': R(ante(thru(24, 38, 28, 44), 47)),
  'ex-4am-tanasub-taghayyurat-l5-003:q5': R(A(24, 38, 28, 44).mul(2)),
  'ex-4am-tanasub-taghayyurat-l5-003:q6': yesNo(on(thru(24, 38, 28, 44), 22, 35)),
  // ex-4am-tanasub-taghayyurat-l5-004 — على منوال BEM 2009 — إفراغ المسبح البلدي بمستغانم
  'ex-4am-tanasub-taghayyurat-l5-004:q1': R(A(2, 360, 5, 300)),
  'ex-4am-tanasub-taghayyurat-l5-004:q2': R(B(2, 360, 5, 300)),
  'ex-4am-tanasub-taghayyurat-l5-004:q3': R(A(2, 360, 5, 300).mul(7 - 3).neg()),
  'ex-4am-tanasub-taghayyurat-l5-004:q4': R(ante(thru(2, 360, 5, 300), 0)),
  'ex-4am-tanasub-taghayyurat-l5-004:q5': R(q(6).add(ante(thru(2, 360, 5, 300), 0)).add(6).add(B(2, 360, 5, 300).div(40)).sub(24)),
  // ex-4am-tanasub-taghayyurat-l5-005 — على منوال BEM 2018 — ولائم الأعراس عند ممون حفلات بباتنة
  'ex-4am-tanasub-taghayyurat-l5-005:q1': R(A(150, 285000, 220, 390000)),
  'ex-4am-tanasub-taghayyurat-l5-005:q2': R(B(150, 285000, 220, 390000)),
  'ex-4am-tanasub-taghayyurat-l5-005:q3': R(A(150, 285000, 220, 390000).mul(30)),
  'ex-4am-tanasub-taghayyurat-l5-005:q4': R(img(fn(1800, 0), 150)),
  'ex-4am-tanasub-taghayyurat-l5-005:q5': R(B(150, 285000, 220, 390000).div(q(1800).sub(A(150, 285000, 220, 390000)))),
  'ex-4am-tanasub-taghayyurat-l5-005:q6': cheaper(img(thru(150, 285000, 220, 390000), 250), img(fn(1800, 0), 250)),
  // ex-4am-tanasub-taghayyurat-l5-006 — على منوال BEM 2013 — قيمة سيارة نفعية لتاجر بالمسيلة
  'ex-4am-tanasub-taghayyurat-l5-006:q1': R(A(2, 1750000, 5, 1375000)),
  'ex-4am-tanasub-taghayyurat-l5-006:q2': R(B(2, 1750000, 5, 1375000)),
  'ex-4am-tanasub-taghayyurat-l5-006:q3': C('A') /* b = V(0) */,
  'ex-4am-tanasub-taghayyurat-l5-006:q4': R(A(2, 1750000, 5, 1375000).mul(10 - 4).neg()),
  'ex-4am-tanasub-taghayyurat-l5-006:q5': R(img(thru(2, 1750000, 5, 1375000), 7)),
  'ex-4am-tanasub-taghayyurat-l5-006:q6': R(ante(thru(2, 1750000, 5, 1375000), B(2, 1750000, 5, 1375000).div(2))),
  // ex-4am-tanasub-taghayyurat-l5-007 — على منوال BEM 2011 — سخان شمسي للماء ببسكرة
  'ex-4am-tanasub-taghayyurat-l5-007:q1': R(A(1, 24, 4, 51)),
  'ex-4am-tanasub-taghayyurat-l5-007:q2': R(B(1, 24, 4, 51)),
  'ex-4am-tanasub-taghayyurat-l5-007:q3': R(img(thru(1, 24, 4, 51), 6)),
  'ex-4am-tanasub-taghayyurat-l5-007:q4': R(ante(thru(1, 24, 4, 51), 60).add(8)),
  'ex-4am-tanasub-taghayyurat-l5-007:q5': R(A(1, 24, 4, 51).mul('0.5')),
  'ex-4am-tanasub-taghayyurat-l5-007:q6': yesNo(eq(img(thru(1, 24, 4, 51), 3).sub(img(thru(1, 24, 4, 51), 1)), img(thru(1, 24, 4, 51), 5).sub(img(thru(1, 24, 4, 51), 3)))),
  // ex-4am-tanasub-taghayyurat-l5-008 — على منوال BEM 2017 — امتلاء سد بولاية ميلة
  'ex-4am-tanasub-taghayyurat-l5-008:q1': R(A(3, 41, 10, 62)),
  'ex-4am-tanasub-taghayyurat-l5-008:q2': R(B(3, 41, 10, 62)),
  'ex-4am-tanasub-taghayyurat-l5-008:q3': C('A') /* a = V(x + 1) − V(x) */,
  'ex-4am-tanasub-taghayyurat-l5-008:q4': R(A(3, 41, 10, 62).mul(5)),
  'ex-4am-tanasub-taghayyurat-l5-008:q5': R(ante(thru(3, 41, 10, 62), 80)),
  'ex-4am-tanasub-taghayyurat-l5-008:q6': R(ante(thru(3, 41, 10, 62), q(100).mul('0.95'))),
  // ex-4am-tanasub-taghayyurat-l5-009 — على منوال BEM 2007 — مازوت مدفأة متوسطة بالجلفة
  'ex-4am-tanasub-taghayyurat-l5-009:q1': R(A(3, 1680, 8, 1280)),
  'ex-4am-tanasub-taghayyurat-l5-009:q2': R(B(3, 1680, 8, 1280)),
  'ex-4am-tanasub-taghayyurat-l5-009:q3': C('A') /* b = Q(0) */,
  'ex-4am-tanasub-taghayyurat-l5-009:q4': R(img(thru(3, 1680, 8, 1280), 12)),
  'ex-4am-tanasub-taghayyurat-l5-009:q5': R(ante(thru(3, 1680, 8, 1280), 400)),
  'ex-4am-tanasub-taghayyurat-l5-009:q6': R(A(3, 1680, 8, 1280).mul(7).neg()),
  'ex-4am-tanasub-taghayyurat-l5-009:q7': R(B(3, 1680, 8, 1280).mul(29)),
  // ex-4am-tanasub-taghayyurat-l5-010 — على منوال BEM 2024 — أعمدة الكراسي في قاعة الحفلات بتيسمسيلت
  'ex-4am-tanasub-taghayyurat-l5-010:q1': R(A(3, 102, 8, 162)),
  'ex-4am-tanasub-taghayyurat-l5-010:q2': R(B(3, 102, 8, 162)),
  'ex-4am-tanasub-taghayyurat-l5-010:q3': C('A') /* h(x + 1) − h(x) = a ≠ h(1) */,
  'ex-4am-tanasub-taghayyurat-l5-010:q4': R(img(thru(3, 102, 8, 162), 1)),
  'ex-4am-tanasub-taghayyurat-l5-010:q5': R(floorQ(q(240).sub(B(3, 102, 8, 162)).div(A(3, 102, 8, 162)))),
  'ex-4am-tanasub-taghayyurat-l5-010:q6': R(ceilQ(q(300).div(floorQ(q(240).sub(B(3, 102, 8, 162)).div(A(3, 102, 8, 162)))))),
};
