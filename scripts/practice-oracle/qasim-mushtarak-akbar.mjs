// Oracle du banc « qasim-mushtarak-akbar » (القاسم المشترك الأكبر لعددين طبيعيين), réécrit au format BEM le
// 2026-10-06 — chaque réponse RECALCULÉE ici à partir des nombres de l'énoncé, jamais lue dans `expectedAnswer`.
// À fusionner dans scripts/practice-answer-oracle.test.mjs (remplace les entrées en ligne de la leçon,
// bloc « // qasim-mushtarak-akbar » : l1-001 q1, l2-001 q2, l3-001 q1/q2, l4-001 q1/q2/q3).
//
// Outils (indépendants du contenu) : reste par SOUSTRACTIONS successives, diviseurs par balayage complet,
// PGCD = plus grand diviseur commun de la liste (la méthode de la leçon), recoupé par Euclide (assertion) ;
// fractions et inéquations exactes via q(...) ; prix extrêmes par balayage entier.
// Les questions « بيّن أن / تحقّق / ماذا تلاحظ » (selfCheck) n'ont pas de clé et ne figurent pas ici.
// Choix : نعم = A, لا = B ; l5-010 q4 : A = العرض 1, B = العرض 2, C = العرض 3.
import { R, C, q } from './helpers.mjs';

const ediv = (a, b) => { let qq = 0, r = a; while (r >= b) { r -= b; qq++; } return [qq, r]; };
const rem = (a, b) => ediv(a, b)[1];
const divides = (d, n) => rem(n, d) === 0;
/** n ÷ d exact — lève si d ne divise pas n */
const quo = (n, d) => { const [qq, r] = ediv(n, d); if (r !== 0) throw new Error(`${d} ne divise pas ${n}`); return qq; };
const divisors = (n) => { const out = []; for (let d = 1; d <= n; d++) if (divides(d, n)) out.push(d); return out; };
const common = (a, b) => divisors(Math.min(a, b)).filter((d) => divides(d, a) && divides(d, b));
const euclid = (a, b) => { while (b) [a, b] = [b, rem(a, b)]; return a; };
const pgcd = (a, b) => {
  const g = Math.max(...common(a, b));
  if (g !== euclid(Math.max(a, b), Math.min(a, b))) throw new Error(`pgcd(${a}, ${b}) incohérent`);
  return g;
};
const S = (arr) => ({ value: [...arr].sort((x, y) => x - y).join(', ') });
const yn = (b) => C(b ? 'A' : 'B');
const frac = (a, b) => R(q(`${a}/${b}`).toString());
/** côté s possible pour un rectangle w × l découpé en carrés sans perte */
const side = (s, w, l) => yn(divides(s, w) && divides(s, l));
/** nombre de carrés de côté maximal */
const squares = (w, l) => quo(w, pgcd(w, l)) * quo(l, pgcd(w, l));
/** mètres (écriture décimale du sujet) → centimètres, entier exact */
const cm = (m) => Number(q(m).mul(100).toString());
/** a tel que √n = a√3 (n = 3a²) — lève si n/3 n'est pas un carré */
const coef3 = (n) => { const k = quo(n, 3); let a = 0; while (a * a < k) a++; if (a * a !== k) throw new Error(`${n} ≠ 3a²`); return a; };

/* — Niveau 5 : situations recalculées — */
// l5-001 محافظ : 252 كراسا، 180 قلما
const g501 = pgcd(252, 180);
const left501 = 50000 - (252 * 45 + 180 * 25 + g501 * 850);
// l5-002 (سلسلة التفوق 6) : 402 → reste 12, 488 → reste 8, x > 12 — balayage direct de x
const x502 = []; for (let x = 13; x <= 488; x++) if (rem(402, x) === 12 && rem(488, x) === 8) x502.push(x);
const x502big = x502.filter((x) => x > 20);
if (x502big.length !== 1) throw new Error('l5-002 : x > 20 doit être unique');
// l5-003 حقائب : 360 تونة، 270 جبن ; g(p + 150) + 1500 ≤ 33000
const g503 = pgcd(360, 270);
let p503 = 0; while (g503 * (p503 + 1 + 150) + 1500 <= 33000) p503++;
// l5-004 مشمش : 336 مربى، 224 عصير ; تكلفة 180/120، تغليف 70، بيع 1200
const g504 = pgcd(336, 224);
const cost504 = quo(336, g504) * 180 + quo(224, g504) * 120 + 70;
// l5-005 ألبسة : 144 قميصا، 108 سراويل
const g505 = pgcd(144, 108);
// l5-006 كتب : 315 قصة، 189 كتابا ; g·p + 2400 ≤ 59100
const g506 = pgcd(315, 189);
let p506 = 0; while (g506 * (p506 + 1) + 2400 <= 59100) p506++;
// l5-007 الهلال الأحمر : 420 ماء، 294 حليب
const g507 = pgcd(420, 294);
if (!(divides(14, 420) && divides(14, 294))) throw new Error('l5-007 : 14 doit être commun');
// l5-008 فخار : 216 جرة، 162 صحنا ; g·p − (216·350 + 162·200 + 1500) ≥ 28200
const g508 = pgcd(216, 162);
const costs508 = 216 * 350 + 162 * 200 + 1500;
let p508 = 0; while (g508 * p508 - costs508 < 28200) p508++;
// l5-009 تشجير : 165 صنوبر، 110 أرز
const g509 = pgcd(165, 110);
// l5-010 حلويات : 432 مقروط، 288 غريبية ; عروض الطبع
const g510 = pgcd(432, 288);
const offers510 = [['A', g510 * 45], ['B', g510 * 30 + 2000], ['C', 8000]].sort((u, v) => u[1] - v[1]);

export const ORACLE = {
  /* ── Niveau 1 ── */
  // adapted — معارف 3 : 12 و 18
  'ex-4am-qasim-mushtarak-akbar-l1-001:q1': S(common(12, 18)),
  'ex-4am-qasim-mushtarak-akbar-l1-001:q2': R(pgcd(12, 18)),
  // adapted — دوري الآن ص 11 : 65 و 78
  'ex-4am-qasim-mushtarak-akbar-l1-002:q1': S(common(65, 78)),
  'ex-4am-qasim-mushtarak-akbar-l1-002:q2': R(pgcd(65, 78)),
  // على منوال BEM 2021 — 45 و 75
  'ex-4am-qasim-mushtarak-akbar-l1-003:q1': R(pgcd(45, 75)),
  // على منوال BEM 2025 — 36 و 48
  'ex-4am-qasim-mushtarak-akbar-l1-004:q1': R(pgcd(36, 48)),
  'ex-4am-qasim-mushtarak-akbar-l1-004:q2': S(common(36, 48)),
  // على منوال BEM 2008 — 40 و 64
  'ex-4am-qasim-mushtarak-akbar-l1-005:q1': R(pgcd(40, 64)),
  'ex-4am-qasim-mushtarak-akbar-l1-005:q2': frac(40, 64),
  // على منوال BEM 2024 — قماش 48cm × 80cm, 6cm ؟ 8cm ؟
  'ex-4am-qasim-mushtarak-akbar-l1-006:q1': side(6, 48, 80),
  'ex-4am-qasim-mushtarak-akbar-l1-006:q2': side(8, 48, 80),
  // على منوال BEM 2015 — 42 و 70
  'ex-4am-qasim-mushtarak-akbar-l1-007:q1': R(pgcd(42, 70)),
  // على منوال BEM 2016 — 63 و 81
  'ex-4am-qasim-mushtarak-akbar-l1-008:q1': R(pgcd(63, 81)),
  'ex-4am-qasim-mushtarak-akbar-l1-008:q2': frac(63, 81),
  // على منوال BEM 2023 — A = 50/75
  'ex-4am-qasim-mushtarak-akbar-l1-009:q1': R(pgcd(50, 75)),
  'ex-4am-qasim-mushtarak-akbar-l1-009:q2': frac(50, 75),
  // على منوال BEM 2009 — 56 و 84
  'ex-4am-qasim-mushtarak-akbar-l1-010:q1': R(pgcd(56, 84)),

  /* ── Niveau 2 ── */
  // adapted — نشاط 4 : 90 حمراء و 54 بيضاء, 9 باقات ؟
  'ex-4am-qasim-mushtarak-akbar-l2-001:q1': yn(divides(9, 90) && divides(9, 54)),
  'ex-4am-qasim-mushtarak-akbar-l2-001:q2': R(pgcd(90, 54)),
  'ex-4am-qasim-mushtarak-akbar-l2-001:q3': R(quo(90, pgcd(90, 54))),
  'ex-4am-qasim-mushtarak-akbar-l2-001:q4': R(quo(54, pgcd(90, 54))),
  // adapted — سلسلة التفوق 2 : 105 و 60
  'ex-4am-qasim-mushtarak-akbar-l2-002:q1': S(divisors(105)),
  'ex-4am-qasim-mushtarak-akbar-l2-002:q2': S(divisors(60)),
  'ex-4am-qasim-mushtarak-akbar-l2-002:q3': R(pgcd(105, 60)),
  'ex-4am-qasim-mushtarak-akbar-l2-002:q4': R(Math.min(...common(105, 60))),
  // على منوال BEM 2008 — 56 و 96
  'ex-4am-qasim-mushtarak-akbar-l2-003:q1': R(pgcd(56, 96)),
  'ex-4am-qasim-mushtarak-akbar-l2-003:q2': frac(56, 96),
  // على منوال BEM 2010 — 150 و 120 ; لوح 1,5m × 1,2m
  'ex-4am-qasim-mushtarak-akbar-l2-004:q1': R(pgcd(150, 120)),
  'ex-4am-qasim-mushtarak-akbar-l2-004:q2': R(pgcd(cm('1,5'), cm('1,2'))),
  'ex-4am-qasim-mushtarak-akbar-l2-004:q3': R(squares(cm('1,5'), cm('1,2'))),
  // على منوال BEM 2024 — ورقة 66cm × 88cm, 11cm ؟ 4cm ؟
  'ex-4am-qasim-mushtarak-akbar-l2-005:q1': side(11, 66, 88),
  'ex-4am-qasim-mushtarak-akbar-l2-005:q2': side(4, 66, 88),
  'ex-4am-qasim-mushtarak-akbar-l2-005:q3': R(squares(66, 88)),
  // على منوال BEM 2015 — 84 و 126
  'ex-4am-qasim-mushtarak-akbar-l2-006:q1': R(pgcd(84, 126)),
  'ex-4am-qasim-mushtarak-akbar-l2-006:q2': frac(84, 126),
  // على منوال BEM 2016 — 98 و 126
  'ex-4am-qasim-mushtarak-akbar-l2-007:q1': R(pgcd(98, 126)),
  'ex-4am-qasim-mushtarak-akbar-l2-007:q2': frac(126, 98),
  // على منوال BEM 2021 — 64 و 96
  'ex-4am-qasim-mushtarak-akbar-l2-008:q1': R(pgcd(64, 96)),
  'ex-4am-qasim-mushtarak-akbar-l2-008:q2': S(common(64, 96)),
  // على منوال BEM 2023 — A = 135/225
  'ex-4am-qasim-mushtarak-akbar-l2-009:q1': R(pgcd(135, 225)),
  'ex-4am-qasim-mushtarak-akbar-l2-009:q2': frac(135, 225),
  // على منوال BEM 2025 — 52 و 78
  'ex-4am-qasim-mushtarak-akbar-l2-010:q1': R(pgcd(52, 78)),
  'ex-4am-qasim-mushtarak-akbar-l2-010:q2': S(common(52, 78)),

  /* ── Niveau 3 ── */
  // adapted — معارف 4 : 28 و 42 (q3 selfCheck)
  'ex-4am-qasim-mushtarak-akbar-l3-001:q1': S(common(28, 42)),
  'ex-4am-qasim-mushtarak-akbar-l3-001:q2': R(pgcd(28, 42)),
  // adapted — ملاحظة معارف 4 : PGCD(a ; b) = 14 (q3 selfCheck)
  'ex-4am-qasim-mushtarak-akbar-l3-002:q1': S(divisors(14)),
  'ex-4am-qasim-mushtarak-akbar-l3-002:q2': yn(divides(4, 14)),
  // على منوال BEM 2008 — 104 و 156
  'ex-4am-qasim-mushtarak-akbar-l3-003:q1': R(pgcd(104, 156)),
  'ex-4am-qasim-mushtarak-akbar-l3-003:q2': frac(104, 156),
  // على منوال BEM 2010 — 240 و 180 ; صفيحة 2,40m × 1,80m
  'ex-4am-qasim-mushtarak-akbar-l3-004:q1': R(pgcd(240, 180)),
  'ex-4am-qasim-mushtarak-akbar-l3-004:q2': R(pgcd(cm('2,40'), cm('1,80'))),
  'ex-4am-qasim-mushtarak-akbar-l3-004:q3': R(squares(cm('2,40'), cm('1,80'))),
  // على منوال BEM 2015 — 126 و 168 ; P = 126/168 + 5/4 × 2/5
  'ex-4am-qasim-mushtarak-akbar-l3-005:q1': R(pgcd(126, 168)),
  'ex-4am-qasim-mushtarak-akbar-l3-005:q2': frac(126, 168),
  'ex-4am-qasim-mushtarak-akbar-l3-005:q3': R(q('126/168').add(q('5/4').mul(q('2/5'))).toString()),
  // على منوال BEM 2016 — 165 و 225
  'ex-4am-qasim-mushtarak-akbar-l3-006:q1': R(pgcd(165, 225)),
  'ex-4am-qasim-mushtarak-akbar-l3-006:q2': frac(165, 225),
  'ex-4am-qasim-mushtarak-akbar-l3-006:q3': S(common(165, 225)),
  // على منوال BEM 2021 — 119 و 85 ; قاسم مشترك بين 2 و 16 ؟
  'ex-4am-qasim-mushtarak-akbar-l3-007:q1': R(pgcd(119, 85)),
  'ex-4am-qasim-mushtarak-akbar-l3-007:q2': S(common(119, 85)),
  'ex-4am-qasim-mushtarak-akbar-l3-007:q3': yn(common(119, 85).some((d) => d > 2 && d < 16)),
  // على منوال BEM 2023 — A = 210/294
  'ex-4am-qasim-mushtarak-akbar-l3-008:q1': R(pgcd(210, 294)),
  'ex-4am-qasim-mushtarak-akbar-l3-008:q2': frac(210, 294),
  'ex-4am-qasim-mushtarak-akbar-l3-008:q3': R(common(210, 294).length),
  // على منوال BEM 2024 — لوح 132cm × 156cm, 6cm ؟ 8cm ؟
  'ex-4am-qasim-mushtarak-akbar-l3-009:q1': side(6, 132, 156),
  'ex-4am-qasim-mushtarak-akbar-l3-009:q2': side(8, 132, 156),
  'ex-4am-qasim-mushtarak-akbar-l3-009:q3': R(squares(132, 156)),
  // على منوال BEM 2025 — 195 و 130 ; 15 ؟
  'ex-4am-qasim-mushtarak-akbar-l3-010:q1': R(pgcd(195, 130)),
  'ex-4am-qasim-mushtarak-akbar-l3-010:q2': S(common(195, 130)),
  'ex-4am-qasim-mushtarak-akbar-l3-010:q3': yn(divides(15, 195) && divides(15, 130)),

  /* ── Niveau 4 ── */
  // adapted — تمرين 10 : 155 و 141
  'ex-4am-qasim-mushtarak-akbar-l4-001:q1': S(divisors(155)),
  'ex-4am-qasim-mushtarak-akbar-l4-001:q2': S(divisors(141)),
  'ex-4am-qasim-mushtarak-akbar-l4-001:q3': R(pgcd(155, 141)),
  'ex-4am-qasim-mushtarak-akbar-l4-001:q4': R(Math.min(divisors(155)[0], divisors(141)[0])),
  // على منوال BEM 2010 — 264 و 216 ; زجاج 2,64m × 2,16m ; أطوال > 5cm
  'ex-4am-qasim-mushtarak-akbar-l4-002:q1': R(pgcd(264, 216)),
  'ex-4am-qasim-mushtarak-akbar-l4-002:q2': R(pgcd(cm('2,64'), cm('2,16'))),
  'ex-4am-qasim-mushtarak-akbar-l4-002:q3': R(squares(cm('2,64'), cm('2,16'))),
  'ex-4am-qasim-mushtarak-akbar-l4-002:q4': S(common(264, 216).filter((d) => d > 5)),
  // على منوال BEM 2015 — 182 و 156 ; P = 156/182 − 2/7 × 3/2
  'ex-4am-qasim-mushtarak-akbar-l4-003:q1': R(pgcd(182, 156)),
  'ex-4am-qasim-mushtarak-akbar-l4-003:q2': frac(156, 182),
  'ex-4am-qasim-mushtarak-akbar-l4-003:q3': R(q('156/182').sub(q('2/7').mul(q('3/2'))).toString()),
  // على منوال BEM 2016 — 75 و 108 ; √108 + √75 = a√3
  'ex-4am-qasim-mushtarak-akbar-l4-004:q1': R(pgcd(75, 108)),
  'ex-4am-qasim-mushtarak-akbar-l4-004:q2': frac(108, 75),
  'ex-4am-qasim-mushtarak-akbar-l4-004:q3': R(coef3(108) + coef3(75)),
  // على منوال BEM 2021 — 231 و 165 ; x > 5 قاسم مشترك
  'ex-4am-qasim-mushtarak-akbar-l4-005:q1': R(pgcd(231, 165)),
  'ex-4am-qasim-mushtarak-akbar-l4-005:q2': S(common(231, 165)),
  'ex-4am-qasim-mushtarak-akbar-l4-005:q3': S(common(231, 165).filter((d) => d > 5)),
  // على منوال BEM 2023 — A = 330/462 ; B = A + 2/7
  'ex-4am-qasim-mushtarak-akbar-l4-006:q1': R(pgcd(330, 462)),
  'ex-4am-qasim-mushtarak-akbar-l4-006:q2': frac(330, 462),
  'ex-4am-qasim-mushtarak-akbar-l4-006:q3': R(q('330/462').add(q('2/7')).toString()),
  // على منوال BEM 2024 — جلد 156cm × 180cm, 6cm ؟ 9cm ؟ ; كل الأطوال
  'ex-4am-qasim-mushtarak-akbar-l4-007:q1': side(6, 156, 180),
  'ex-4am-qasim-mushtarak-akbar-l4-007:q2': side(9, 156, 180),
  'ex-4am-qasim-mushtarak-akbar-l4-007:q3': R(squares(156, 180)),
  'ex-4am-qasim-mushtarak-akbar-l4-007:q4': S(common(156, 180)),
  // على منوال BEM 2008 — 117 و 195 (q2 : Euclide, counted:false)
  'ex-4am-qasim-mushtarak-akbar-l4-008:q1': R(pgcd(117, 195)),
  'ex-4am-qasim-mushtarak-akbar-l4-008:q2': R(euclid(195, 117)),
  'ex-4am-qasim-mushtarak-akbar-l4-008:q3': frac(117, 195),
  // على منوال BEM 2025 — 306 و 238 ; 6 ؟
  'ex-4am-qasim-mushtarak-akbar-l4-009:q1': R(pgcd(306, 238)),
  'ex-4am-qasim-mushtarak-akbar-l4-009:q2': S(common(306, 238)),
  'ex-4am-qasim-mushtarak-akbar-l4-009:q3': yn(divides(6, 306) && divides(6, 238)),
  // على منوال BEM 2009 — 450 صابون و 270 عطر ; 20 علبة ؟ ; 72000DA
  'ex-4am-qasim-mushtarak-akbar-l4-010:q1': R(pgcd(450, 270)),
  'ex-4am-qasim-mushtarak-akbar-l4-010:q2': yn(divides(20, 450) && divides(20, 270)),
  'ex-4am-qasim-mushtarak-akbar-l4-010:q3': R(pgcd(450, 270)),
  'ex-4am-qasim-mushtarak-akbar-l4-010:q4': R(quo(450, pgcd(450, 270))),
  'ex-4am-qasim-mushtarak-akbar-l4-010:q5': R(quo(72000, pgcd(450, 270))),

  /* ── Niveau 5 — الوضعيات الإدماجية ── */
  // على منوال BEM 2022 II — محافظ مدرسية بالمدية
  'ex-4am-qasim-mushtarak-akbar-l5-001:q1': R(g501),
  'ex-4am-qasim-mushtarak-akbar-l5-001:q2': R(quo(252, g501)),
  'ex-4am-qasim-mushtarak-akbar-l5-001:q3': R(quo(180, g501)),
  'ex-4am-qasim-mushtarak-akbar-l5-001:q4': yn(divides(12, 252) && divides(12, 180)),
  'ex-4am-qasim-mushtarak-akbar-l5-001:q5': R(left501),
  // adapted — سلسلة التفوق 6 : 402 و 488 (q1 selfCheck)
  'ex-4am-qasim-mushtarak-akbar-l5-002:q2': R(pgcd(402 - 12, 488 - 8)),
  'ex-4am-qasim-mushtarak-akbar-l5-002:q3': S(x502),
  'ex-4am-qasim-mushtarak-akbar-l5-002:q4': R(quo(402 - 12, x502big[0])),
  // على منوال BEM 2020 II — حقائب فوج كشفي
  'ex-4am-qasim-mushtarak-akbar-l5-003:q1': R(g503),
  'ex-4am-qasim-mushtarak-akbar-l5-003:q2': R(quo(360, g503)),
  'ex-4am-qasim-mushtarak-akbar-l5-003:q3': R(quo(270, g503)),
  'ex-4am-qasim-mushtarak-akbar-l5-003:q4': R(p503),
  // على منوال BEM 2022 II — سلال المشمش من نقاوس
  'ex-4am-qasim-mushtarak-akbar-l5-004:q1': R(g504),
  'ex-4am-qasim-mushtarak-akbar-l5-004:q2': R(quo(336, g504)),
  'ex-4am-qasim-mushtarak-akbar-l5-004:q3': R(quo(224, g504)),
  'ex-4am-qasim-mushtarak-akbar-l5-004:q4': R(cost504),
  'ex-4am-qasim-mushtarak-akbar-l5-004:q5': R(g504 * (1200 - cost504)),
  // على منوال BEM 2022 II — ألبسة رياضية بعنابة
  'ex-4am-qasim-mushtarak-akbar-l5-005:q1': R(g505),
  'ex-4am-qasim-mushtarak-akbar-l5-005:q2': R(quo(144, g505)),
  'ex-4am-qasim-mushtarak-akbar-l5-005:q3': R(quo(108, g505)),
  'ex-4am-qasim-mushtarak-akbar-l5-005:q4': yn(divides(24, 144) && divides(24, 108)),
  'ex-4am-qasim-mushtarak-akbar-l5-005:q5': S(common(144, 108).filter((d) => d >= 10 && d <= 20)),
  // على منوال BEM 2020 II — مكتبات المدارس الابتدائية
  'ex-4am-qasim-mushtarak-akbar-l5-006:q1': R(g506),
  'ex-4am-qasim-mushtarak-akbar-l5-006:q2': R(quo(315, g506)),
  'ex-4am-qasim-mushtarak-akbar-l5-006:q3': R(p506),
  // على منوال BEM 2022 II — الهلال الأحمر بالوادي
  'ex-4am-qasim-mushtarak-akbar-l5-007:q1': R(g507),
  'ex-4am-qasim-mushtarak-akbar-l5-007:q2': R(quo(420, g507)),
  'ex-4am-qasim-mushtarak-akbar-l5-007:q3': R(quo(294, g507)),
  'ex-4am-qasim-mushtarak-akbar-l5-007:q4': S(common(420, 294).filter((d) => d >= 5 && d <= 25)),
  'ex-4am-qasim-mushtarak-akbar-l5-007:q5': R(quo(420, 14)),
  // على منوال BEM 2020 II — أطقم الفخار من معاتقة
  'ex-4am-qasim-mushtarak-akbar-l5-008:q1': R(g508),
  'ex-4am-qasim-mushtarak-akbar-l5-008:q2': R(quo(216, g508)),
  'ex-4am-qasim-mushtarak-akbar-l5-008:q3': R(quo(162, g508)),
  'ex-4am-qasim-mushtarak-akbar-l5-008:q4': R(p508),
  // على منوال BEM 2022 II — حملة تشجير بالشريعة
  'ex-4am-qasim-mushtarak-akbar-l5-009:q1': R(g509),
  'ex-4am-qasim-mushtarak-akbar-l5-009:q2': R(quo(165, g509)),
  'ex-4am-qasim-mushtarak-akbar-l5-009:q3': R(quo(110, g509)),
  'ex-4am-qasim-mushtarak-akbar-l5-009:q4': R(g509 * 4),
  'ex-4am-qasim-mushtarak-akbar-l5-009:q5': R(165 * 450 + 110 * 600),
  // على منوال BEM 2024 II — علب حلويات العيد بسوق أهراس
  'ex-4am-qasim-mushtarak-akbar-l5-010:q1': R(g510),
  'ex-4am-qasim-mushtarak-akbar-l5-010:q2': R(quo(432, g510)),
  'ex-4am-qasim-mushtarak-akbar-l5-010:q3': R(quo(288, g510)),
  'ex-4am-qasim-mushtarak-akbar-l5-010:q4': C(offers510[0][0]),
};
