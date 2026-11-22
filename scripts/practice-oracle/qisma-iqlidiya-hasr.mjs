// Oracle du banc « qisma-iqlidiya-hasr » (القسمة الإقليدية وحصر حاصل القسمة, 2AM, 2026-10-14) — le PREMIER banc 2AM,
// feuilles d'examen « على منوال اختبار الفصل الأول ». Chaque réponse est RECALCULÉE ici à partir des nombres de l'énoncé
// avec la division ENTIÈRE de cet oracle (BigInt, par blocs b·10^k), jamais lue dans `expectedAnswer`. Un décimal est un
// entier mis à l'échelle (7,55 = 755 / 10²). Tout حصر est décidé par `n·b < a < (n+1)·b` (ou `n·10^k < N < (n+1)·10^k`),
// jamais par un flottant. Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Outils : `quo` / `rem` (a = b × q + r, 0 ≤ r < b) ; `need` (groupes NÉCESSAIRES : q + 1 quand r ≠ 0) ; `defU` / `excU`
// (valeurs approchées à l'unité par défaut / par excès de a/b) ; `exactQ` (a/b quand il est naturel, sinon erreur) ;
// `isEu` (a = b × x + r est-elle LA division euclidienne de a par b ?) ; `eqKey` (QCM d'égalités) ; `brKey`
// (b × k ≤ a < b × (k + 1)) ; `fbKey` (k < a/b < k + 1 strict, ou a/b = n) ; `dcKey` (a/b = n + c/d avec c/d < 1) ;
// `dbKey` / `floorD` / `ceilD` / `truncD` / `ceilDk` (un décimal DONNÉ dans l'énoncé) ; `trunc` (a/b tronqué à k
// décimales — étapes d'une autre leçon, counted: false) ; `relKey` / `rel` (« x يقسم y » ⇔ y mod x = 0, « x مضاعف لـ y »
// et « x يقبل القسمة على y » ⇔ x mod y = 0). Les QCM sont écrits dans l'ordre de la feuille ; نعم / لا : A = نعم, B = لا.
// Les questions selfCheck (« برّر ») n'ont pas de clé et ne figurent pas ici.
import { R, C, q } from './helpers.mjs';

/** Division euclidienne écrite pour l'oracle : retire b par blocs de b·10^k (la méthode de la potence). */
const euclid = (a, b) => {
  let A = BigInt(a); const B = BigInt(b);
  if (B <= 0n || A < 0n) throw new Error(`division ${a} ÷ ${b} hors du programme`);
  let Qt = 0n;
  let block = 1n;
  while (B * block * 10n <= A) block *= 10n;
  for (; block >= 1n; block /= 10n) while (A >= B * block) { A -= B * block; Qt += block; }
  return { q: Qt, r: A };
};
const quo = (a, b) => euclid(a, b).q.toString();
const rem = (a, b) => euclid(a, b).r.toString();
const need = (a, b) => { const { q: Qt, r } = euclid(a, b); return (r > 0n ? Qt + 1n : Qt).toString(); };
const defU = (a, b) => quo(a, b);
const excU = (a, b) => need(a, b);
const exactQ = (a, b) => { const { q: Qt, r } = euclid(a, b); if (r !== 0n) throw new Error(`${a}/${b} n'est pas un naturel`); return Qt.toString(); };
const toNextMult = (a, b) => { const r = euclid(a, b).r; return (r === 0n ? BigInt(b) : BigInt(b) - r).toString(); };
const maxRem = (b) => (BigInt(b) - 1n).toString();
const isEu = (a, b, x, r) => BigInt(a) === BigInt(b) * BigInt(x) + BigInt(r) && BigInt(r) >= 0n && BigInt(r) < BigInt(b);
const yn = (t) => C(t ? 'A' : 'B');
const LETTERS = 'ABCD';
const only = (hits, what) => {
  if (hits.length !== 1) throw new Error(`${what}: ${hits.length} options justes`);
  return C(LETTERS[hits[0]]);
};
const keyOf = (opts, test, what) => only(opts.map((o, i) => (test(o) ? i : -1)).filter((i) => i >= 0), what);
/** Options [[b, x, r], …] écrites « a = b × x + r » : la seule qui est la division euclidienne de a par b. */
const eqKey = (a, b, opts) => keyOf(opts, (o) => o[0] === b && isEu(a, o[0], o[1], o[2]), `eqKey ${a}÷${b}`);
/** Options [[k, k + 1], …] écrites « b × k ≤ a < b × (k + 1) » : la seule vraie. */
const brKey = (a, b, opts) => keyOf(opts, ([k, k1]) => k1 === k + 1 && b * k <= a && a < b * k1, `brKey ${a}÷${b}`);
/** Options [[n, n + 1], …] « n < a/b < n + 1 » (strict) ou ['=', n] « a/b = n » : la seule vraie, décidée en entiers. */
const fbKey = (a, b, opts) => keyOf(opts, (o) => (o[0] === '='
  ? BigInt(o[1]) * BigInt(b) === BigInt(a)
  : o[1] === o[0] + 1 && BigInt(o[0]) * BigInt(b) < BigInt(a) && BigInt(a) < BigInt(o[1]) * BigInt(b)), `fbKey ${a}÷${b}`);
/** Options [[n, c, d], …] « a/b = n + c/d » : vraie si l'égalité est exacte ET c/d < 1. */
const dcKey = (a, b, opts) => keyOf(opts, ([n, c, d]) => (BigInt(n) * BigInt(d) + BigInt(c)) * BigInt(b) === BigInt(a) * BigInt(d) && c < d, `dcKey ${a}÷${b}`);
/** Un décimal donné « 7.55 » → [N, 10^k]. */
const scaled = (v) => { const [i, f = ''] = String(v).split('.'); return [BigInt(i + f), 10n ** BigInt(f.length)]; };
const dbKey = (v, opts) => { const [N, P] = scaled(v); return keyOf(opts, ([n, n1]) => n1 === n + 1 && BigInt(n) * P < N && N < BigInt(n1) * P, `dbKey ${v}`); };
const floorD = (v) => { const [N, P] = scaled(v); return (N / P).toString(); };
const ceilD = (v) => { const [N, P] = scaled(v); return (N % P === 0n ? N / P : N / P + 1n).toString(); };
/** v tronqué à k décimales / arrondi par excès à k décimales (v DONNÉ, a plus de k décimales). */
const fmt = (N, k) => { const s = N.toString().padStart(k + 1, '0'); return k ? `${s.slice(0, -k)}.${s.slice(-k)}`.replace(/\.?0+$/, '') : s; };
const truncD = (v, k) => { const [N, P] = scaled(v); return fmt((N * 10n ** BigInt(k)) / P, k); };
const ceilDk = (v, k) => { const [N, P] = scaled(v); const M = N * 10n ** BigInt(k); return fmt(M % P === 0n ? M / P : M / P + 1n, k); };
/** a/b tronqué à k décimales (division entière de a·10^k par b). */
const trunc = (a, b, k) => fmt(euclid(BigInt(a) * 10n ** BigInt(k), b).q, k);
/** Un décimal exact a ÷ b (b divise a·10^k pour un k ≤ 6). */
const decQ = (a, b) => { const [N, P] = scaled(a); for (let k = 0; k <= 6; k++) { const M = N * 10n ** BigInt(k); if (M % (P * BigInt(b)) === 0n) return fmt(M / (P * BigInt(b)) * 1n, k); } throw new Error(`${a}/${b} non décimal`); };
const rel = ([r, x, y]) => (r === 'yaqsim' ? BigInt(y) % BigInt(x) === 0n : BigInt(x) % BigInt(y) === 0n);
const relKey = (opts) => keyOf(opts, rel, 'relKey');
/** Options écrites « p/q » ou « p.q » : celle qui vaut exactement n/d. */
const pickQ = ([n, d], opts) => keyOf(opts, (o) => q(o).sub(q(n).div(d)).toString() === '0', 'pickQ');
/** Options [p, r] (C = p/r) : celle qui vaut exactement x/y avec p, r naturels. */
const fracEqKey = (x, y, opts) => keyOf(opts, ([p, r]) => q(p).div(r).sub(q(x).div(y)).toString() === '0', `fracEqKey ${x}/${y}`);
/** Options [p, r] : la fraction écrite exactement p/r (bon numérateur ET bon dénominateur calculés). */
const pickFrac = ([N, D], opts) => keyOf(opts, ([p, r]) => BigInt(p) === N && BigInt(r) === D, 'pickFrac');
const multKey = (b, opts) => keyOf(opts, (a) => rem(a, b) === '0', `multKey ${b}`);
const pick = (v, opts) => keyOf(opts, (o) => String(o) === String(v), `pick ${v}`);
const minS = (...xs) => xs.map(BigInt).reduce((m, x) => (x < m ? x : m)).toString();
const sumFracNat = ([a, b], [c, d]) => { const s = q(a).div(b).add(q(c).div(d)).toString(); if (s.includes('/')) throw new Error('pas un naturel'); return s; };

const L = 'ex-2am-qisma-iqlidiya-hasr';
const K = (lvl, n, qid) => `${L}-l${lvl}-${String(n).padStart(3, '0')}:${qid}`;

export const ORACLE = {
  // l1-001 — أقلام لتلاميذ القسم (textbook know-1a)
  [K(1, 1, 'q1')]: R(quo(180, 8)),
  [K(1, 1, 'q2')]: R(rem(180, 8)),
  [K(1, 1, 'q3')]: eqKey(180, 8, [[8,21,12],[8,4,22],[8,22,4],[8,23,4]]),
  // l1-002 — حاصل القسمة كسرًا (textbook prep)
  [K(1, 2, 'q1')]: pickQ([11, 7], ['11/7', '11.7', '7/11']),
  [K(1, 2, 'q2')]: dcKey(19, 5, [[4,3,5],[3,4,5],[3,4,19],[4,4,5]]),
  [K(1, 2, 'q3')]: fbKey(19, 5, [[3,4],[2,3],[4,5]]),
  // l1-003 — تفكيك كسر أكبر من 1 (textbook ex-33)
  [K(1, 3, 'q1')]: dcKey(129, 11, [[11,8,11],[8,11,11],[11,8,129],[12,8,11]]),
  [K(1, 3, 'q2')]: R(quo(81, 7)),
  [K(1, 3, 'q3')]: R(rem(81, 7)),
  // l1-004 — على منوال اختبار الفصل الأول — قسمة على عدد من رقمين
  [K(1, 4, 'q1')]: R(quo(4567, 38)),
  [K(1, 4, 'q2')]: R(rem(4567, 38)),
  // l1-005 — على منوال اختبار الفصل الأول — قسمة باقيها معدوم
  [K(1, 5, 'q1')]: R(quo(1375, 125)),
  [K(1, 5, 'q2')]: yn(rem(1375, 125) === '0'),
  [K(1, 5, 'q3')]: relKey([["yaqsim",1375,125],["yaqbal",125,1375],["mudaaf",1375,125]]),
  // l1-006 — على منوال اختبار الفصل الأول — حصر حواصل
  [K(1, 6, 'q1')]: fbKey(250, 7, [[34,35],[5,6],[35,36]]),
  [K(1, 6, 'q2')]: fbKey(396, 12, [[33,34],["=",33],[32,33]]),
  [K(1, 6, 'q3')]: fbKey(1000, 45, [[22,23],[21,22],[10,11]]),
  // l1-007 — على منوال اختبار الفصل الأول — أيّ المساواة قسمة إقليدية؟
  [K(1, 7, 'q1')]: yn(isEu(500, 23, 20, 40)),
  [K(1, 7, 'q2')]: yn(isEu(500, 23, 21, 17)),
  [K(1, 7, 'q3')]: yn(isEu(500, 23, 22, 6)),
  // l1-008 — على منوال اختبار الفصل الأول — القيمتان المقرّبتان إلى الوحدة
  [K(1, 8, 'q1')]: R(defU(538, 24)),
  [K(1, 8, 'q2')]: R(excU(538, 24)),
  // l1-009 — على منوال اختبار الفصل الأول — قسمة على عدد من ثلاثة أرقام
  [K(1, 9, 'q1')]: R(quo(7385, 215)),
  [K(1, 9, 'q2')]: R(rem(7385, 215)),
  [K(1, 9, 'q3')]: eqKey(7385, 215, [[215,34,75],[215,33,290],[215,75,34],[215,35,75]]),
  // l1-010 — على منوال اختبار الفصل الأول — مضاعف للعدد 17
  [K(1, 10, 'q1')]: multKey(17, [401, 391, 375]),
  [K(1, 10, 'q2')]: R(exactQ(391, 17)),
  [K(1, 10, 'q3')]: relKey([["mudaaf",17,391],["yaqsim",17,391],["yaqbal",17,391]]),
  // l2-001 — بيض المزرعة في صفائح (textbook act-1)
  [K(2, 1, 'q1')]: brKey(2145, 30, [[70,71],[71,72],[72,73]]),
  [K(2, 1, 'q2')]: R(quo(2145, 30)),
  [K(2, 1, 'q3')]: R(rem(2145, 30)),
  [K(2, 1, 'q4')]: yn(isEu(2145, 30, 70, 45)),
  [K(2, 1, 'q5')]: R(need(2145, 30)),
  // l2-002 — حصر حاصل القسمة (textbook know-1b)
  [K(2, 2, 'q1')]: R(defU(180, 8)),
  [K(2, 2, 'q2')]: R(excU(180, 8)),
  [K(2, 2, 'q3')]: fbKey(180, 8, [[21,22],[4,5],[22,23]]),
  // l2-003 — على منوال اختبار الفصل الأول — حساب أمين البائع
  [K(2, 3, 'q1')]: yn(36 * 39 + 46 === 1450),
  [K(2, 3, 'q2')]: yn(isEu(1450, 36, 39, 46)),
  [K(2, 3, 'q3')]: R(quo(1450, 36)),
  [K(2, 3, 'q4')]: R(rem(1450, 36)),
  // l2-004 — على منوال اختبار الفصل الأول — مساواة واحدة وقسمتان
  [K(2, 4, 'q1')]: yn(isEu(300, 26, 11, 14)),
  [K(2, 4, 'q2')]: yn(isEu(300, 11, 26, 14)),
  [K(2, 4, 'q3')]: R(quo(300, 11)),
  [K(2, 4, 'q4')]: R(rem(300, 11)),
  // l2-005 — على منوال اختبار الفصل الأول — حافلات الرحلة في موعدها
  [K(2, 5, 'q1')]: R(quo(457, 52)),
  [K(2, 5, 'q2')]: R(rem(457, 52)),
  [K(2, 5, 'q3')]: R(need(457, 52)),
  [K(2, 5, 'q4')]: yn(52 * 8 >= 457),
  // l2-006 — على منوال اختبار الفصل الأول — كتب المكتبات المدرسية
  [K(2, 6, 'q1')]: R(quo(1296, 48)),
  [K(2, 6, 'q2')]: R(rem(1296, 48)),
  [K(2, 6, 'q3')]: fbKey(1296, 48, [["=",27],[27,28],[26,27]]),
  [K(2, 6, 'q4')]: relKey([["yaqsim",1296,48],["yaqbal",1296,48],["mudaaf",48,1296]]),
  // l2-007 — على منوال اختبار الفصل الأول — ما قاله رامي
  [K(2, 7, 'q1')]: yn(rel(["yaqsim", 945, 15])),
  [K(2, 7, 'q2')]: relKey([["mudaaf",15,945],["yaqbal",15,945],["yaqsim",15,945]]),
  [K(2, 7, 'q3')]: R(exactQ(945, 15)),
  // l2-008 — على منوال اختبار الفصل الأول — من الحصر إلى القيمتين المقرّبتين
  [K(2, 8, 'q1')]: brKey(2000, 64, [[30,31],[32,33],[31,32]]),
  [K(2, 8, 'q2')]: fbKey(2000, 64, [[30,31],[31,32],[16,17]]),
  [K(2, 8, 'q3')]: R(defU(2000, 64)),
  [K(2, 8, 'q4')]: R(excU(2000, 64)),
  // l2-009 — على منوال اختبار الفصل الأول — حاصل مضبوط أم محصور؟
  [K(2, 9, 'q1')]: R(rem(3500, 125)),
  [K(2, 9, 'q2')]: yn(rem(3500, 125) !== '0'),
  [K(2, 9, 'q3')]: R(exactQ(3500, 125)),
  [K(2, 9, 'q4')]: R(defU(3550, 125)),
  // l2-010 — على منوال اختبار الفصل الأول — قسمة عدد كبير على 6
  [K(2, 10, 'q1')]: R(quo(5000, 6)),
  [K(2, 10, 'q2')]: R(rem(5000, 6)),
  [K(2, 10, 'q3')]: fbKey(5000, 6, [[833,834],[832,833],[2,3]]),
  // l3-001 — على منوال اختبار الفصل الأول — حاصل القسمة وحصره (term_exam 2am-s1-79 ex. 1)
  [K(3, 1, 'q1')]: R(quo(317, 14)),
  [K(3, 1, 'q2')]: R(rem(317, 14)),
  [K(3, 1, 'q3')]: eqKey(317, 14, [[14,21,23],[14,9,22],[14,23,9],[14,22,9]]),
  [K(3, 1, 'q4')]: fbKey(317, 14, [[21,22],[9,10],[22,23]]),
  // l3-002 — على منوال اختبار الفصل الأول — عبارة القسمة الإقليدية والحصر إلى الوحدة (term_exam 2am-s1-87 ex. 3)
  [K(3, 2, 'q1')]: eqKey(251, 17, [[17,13,30],[17,14,13],[17,13,14],[17,15,13]]),
  [K(3, 2, 'q2')]: R(defU(251, 17)),
  [K(3, 2, 'q3')]: R(excU(251, 17)),
  [K(3, 2, 'q4')]: fbKey(251, 17, [[14,15],[13,14],[15,16]]),
  // l3-003 — على منوال اختبار الفصل الأول — أنجز ثم أكمل (term_exam 2am-s1-74 ex. 2)
  [K(3, 3, 'q1')]: R(quo(389, 12)),
  [K(3, 3, 'q2')]: R(rem(389, 12)),
  [K(3, 3, 'q3')]: yn(isEu(389, 12, 31, 17)),
  [K(3, 3, 'q4')]: fbKey(389, 12, [[31,32],[32,33],[5,6]]),
  // l3-004 — على منوال اختبار الفصل الأول — من الكسر إلى القسمة الإقليدية (term_exam 2am-s1-70 ex. 2)
  [K(3, 4, 'q1')]: fracEqKey('8', '0.7', [[8, 7], [80, 7], [800, 7]]),
  [K(3, 4, 'q2')]: R(quo(80, 7)),
  [K(3, 4, 'q3')]: R(rem(80, 7)),
  [K(3, 4, 'q4')]: fbKey(80, 7, [[10,11],[3,4],[11,12]]),
  // l3-005 — على منوال اختبار الفصل الأول — شاحنات القمح (term_exam 2am-s1-77 ex. 2)
  [K(3, 5, 'q1')]: dbKey('7.55', [[7,8],[6,7],[8,9]]),
  [K(3, 5, 'q2')]: R(floorD('7.55')),
  [K(3, 5, 'q3')]: R(ceilD('7.55')),
  [K(3, 5, 'q4')]: R(ceilD('7.55')),
  // l3-006 — على منوال اختبار الفصل الأول — حصر عددين (term_exam 2am-s1-68 ex. 1)
  [K(3, 6, 'q1')]: R(decQ('23.4', 6)),
  [K(3, 6, 'q2')]: dbKey('3.9', [[2,3],[4,5],[3,4]]),
  [K(3, 6, 'q3')]: yn(rem(4752, 36) === '0'),
  [K(3, 6, 'q4')]: fbKey(4752, 36, [["=",132],[132,133],[131,132]]),
  // l3-007 — على منوال اختبار الفصل الأول — بيض في صناديق كبيرة
  [K(3, 7, 'q1')]: R(quo(5000, 360)),
  [K(3, 7, 'q2')]: R(rem(5000, 360)),
  [K(3, 7, 'q3')]: R(need(5000, 360)),
  [K(3, 7, 'q4')]: yn(rem(4680, 360) === '0'),
  // l3-008 — على منوال اختبار الفصل الأول — أكمل الجدول
  [K(3, 8, 'q1')]: R(quo(1234, 56)),
  [K(3, 8, 'q2')]: R(rem(1234, 56)),
  [K(3, 8, 'q3')]: fbKey(2016, 42, [[48,49],[47,48],["=",48]]),
  [K(3, 8, 'q4')]: fbKey(999, 100, [[8,9],[9,10],[99,100]]),
  // l3-009 — على منوال اختبار الفصل الأول — قفف التضامن
  [K(3, 9, 'q1')]: R(quo(2350, 25)),
  [K(3, 9, 'q2')]: yn(rem(2350, 25) === '0'),
  [K(3, 9, 'q3')]: relKey([["mudaaf",2350,25],["yaqsim",2350,25],["yaqbal",25,2350]]),
  [K(3, 9, 'q4')]: R(need(2350, 40)),
  // l3-010 — على منوال اختبار الفصل الأول — المقسوم المجهول
  [K(3, 10, 'q1')]: R(String(45n * 18n + 37n)),
  [K(3, 10, 'q2')]: fbKey(847, 45, [[18,19],[17,18],[37,38]]),
  [K(3, 10, 'q3')]: R(maxRem(45)),
  [K(3, 10, 'q4')]: R(toNextMult(847, 45)),
  // l4-001 — على منوال اختبار الفصل الأول — القسمة الإقليدية وقيمة مقرّبة (term_exam 2am-s1-79 ex. 1)
  [K(4, 1, 'q1')]: R(quo(341, 15)),
  [K(4, 1, 'q2')]: R(rem(341, 15)),
  [K(4, 1, 'q3')]: fbKey(341, 15, [[21,22],[22,23],[11,12]]),
  [K(4, 1, 'q4')]: R(trunc(341, 15, 1)),
  // l4-002 — على منوال اختبار الفصل الأول — قسمة إقليدية وقسمة عشرية (term_exam 2am-s1-87 ex. 3)
  [K(4, 2, 'q1')]: eqKey(157, 23, [[23,5,42],[23,19,6],[23,6,19],[23,7,19]]),
  [K(4, 2, 'q2')]: R(trunc(157, 23, 3)),
  [K(4, 2, 'q3')]: dbKey('6.826', [[6,7],[5,6],[7,8]]),
  [K(4, 2, 'q4')]: R(excU(157, 23)),
  // l4-003 — على منوال اختبار الفصل الأول — خط الكسر والقسمة الإقليدية (term_exam 2am-s1-74 ex. 2)
  [K(4, 3, 'q1')]: pickFrac([125n + 98n, 3n * 5n], [[223, 8], [223, 15], [125, 113]]),
  [K(4, 3, 'q2')]: eqKey(223, 15, [[15,14,13],[15,13,28],[15,13,14],[15,15,13]]),
  [K(4, 3, 'q3')]: fbKey(223, 15, [[13,14],[15,16],[14,15]]),
  [K(4, 3, 'q4')]: R(trunc(223, 15, 3)),
  // l4-004 — على منوال اختبار الفصل الأول — نقل الإسمنت (term_exam 2am-s1-77 ex. 2)
  [K(4, 4, 'q1')]: R(truncD('7.155', 2)),
  [K(4, 4, 'q2')]: R(ceilDk('7.155', 2)),
  [K(4, 4, 'q3')]: R(floorD('7.155')),
  [K(4, 4, 'q4')]: R(ceilD('7.155')),
  [K(4, 4, 'q5')]: R(ceilD('7.155')),
  // l4-005 — على منوال اختبار الفصل الأول — كسر مقامه عشري (term_exam 2am-s1-70 ex. 2)
  [K(4, 5, 'q1')]: fracEqKey('9', '0.4', [[90, 4], [9, 4], [90, 40]]),
  [K(4, 5, 'q2')]: R(quo(90, 4)),
  [K(4, 5, 'q3')]: R(rem(90, 4)),
  [K(4, 5, 'q4')]: fbKey(90, 4, [[21,22],[22,23],[2,3]]),
  // l4-006 — على منوال اختبار الفصل الأول — سلسلة عمليات ثم قسمة
  [K(4, 6, 'q1')]: R(String(25n * 48n + 17n)),
  [K(4, 6, 'q2')]: R(quo(1217, 25)),
  [K(4, 6, 'q3')]: R(rem(1217, 25)),
  [K(4, 6, 'q4')]: yn(isEu(1217, 48, 25, 17)),
  // l4-007 — على منوال اختبار الفصل الأول — كسر وعدد طبيعي
  [K(4, 7, 'q1')]: dcKey(47, 6, [[5,7,6],[7,5,47],[8,5,6],[7,5,6]]),
  [K(4, 7, 'q2')]: fbKey(47, 6, [[7,8],[6,7],[8,9]]),
  [K(4, 7, 'q3')]: R(sumFracNat([47, 6], [1, 6])),
  [K(4, 7, 'q4')]: relKey([["yaqsim",48,6],["mudaaf",6,48],["yaqbal",48,6]]),
  // l4-008 — على منوال اختبار الفصل الأول — دقائق التطوّع
  [K(4, 8, 'q1')]: R(quo(1000, 60)),
  [K(4, 8, 'q2')]: R(rem(1000, 60)),
  [K(4, 8, 'q3')]: fbKey(1000, 60, [[15,16],[40,41],[16,17]]),
  [K(4, 8, 'q4')]: R(trunc(1000, 60, 1)),
  // l4-009 — على منوال اختبار الفصل الأول — عبارة وقابلية القسمة
  [K(4, 9, 'q1')]: R(String(3n * (125n + 87n) - 36n)),
  [K(4, 9, 'q2')]: yn(rem(600, 24) === '0'),
  [K(4, 9, 'q3')]: R(exactQ(600, 24)),
  [K(4, 9, 'q4')]: fbKey(600, 36, [[15,16],[16,17],[24,25]]),
  // l4-010 — على منوال اختبار الفصل الأول — ادّخار ياسمين
  [K(4, 10, 'q1')]: R(exactQ(4200, 350)),
  [K(4, 10, 'q2')]: R(quo(7500, 350)),
  [K(4, 10, 'q3')]: R(need(7500, 350)),
  [K(4, 10, 'q4')]: R(String(BigInt(need(7500, 350)) * 350n - 7500n)),
  // l5-001 — على منوال اختبار الفصل الأول — نقل محصول البطاطا (term_exam 2am-s1-77 ex. 2)
  [K(5, 1, 'q1')]: dbKey('12.75', [[11,12],[13,14],[12,13]]),
  [K(5, 1, 'q2')]: R(ceilD('12.75')),
  [K(5, 1, 'q3')]: R(String(BigInt(ceilD('12.75')) * 4500n)),
  [K(5, 1, 'q4')]: R(ceilD('7.96875')),
  [K(5, 1, 'q5')]: R(String(BigInt(ceilD('7.96875')) * 7000n)),
  [K(5, 1, 'q6')]: C(BigInt(ceilD('7.96875')) * 7000n < BigInt(ceilD('12.75')) * 4500n ? 'B' : 'A'),
  // l5-002 — على منوال اختبار الفصل الأول — رفوف مكتبة الحيّ (term_exam 2am-s1-87 ex. 3)
  [K(5, 2, 'q1')]: eqKey(1347, 28, [[28,47,31],[28,48,3],[28,3,48],[28,49,3]]),
  [K(5, 2, 'q2')]: fbKey(1347, 28, [[47,48],[3,4],[48,49]]),
  [K(5, 2, 'q3')]: R(need(1347, 28)),
  [K(5, 2, 'q4')]: yn(Number(need(1347, 28)) <= 50),
  [K(5, 2, 'q5')]: R(quo(1432, 28)),
  [K(5, 2, 'q6')]: yn(Number(need(1432, 28)) <= 50),
  // l5-003 — على منوال اختبار الفصل الأول — فرق الدورة الرياضية (term_exam 2am-s1-79 ex. 1)
  [K(5, 3, 'q1')]: R(quo(437, 13)),
  [K(5, 3, 'q2')]: R(rem(437, 13)),
  [K(5, 3, 'q3')]: fbKey(437, 13, [[33,34],[32,33],[8,9]]),
  [K(5, 3, 'q4')]: R(need(437, 13)),
  [K(5, 3, 'q5')]: R(toNextMult(437, 13)),
  [K(5, 3, 'q6')]: yn(rem(442, 13) === '0'),
  // l5-004 — على منوال اختبار الفصل الأول — مياه المنبع (term_exam 2am-s1-74 ex. 2)
  [K(5, 4, 'q1')]: R(quo(2589, 11)),
  [K(5, 4, 'q2')]: R(rem(2589, 11)),
  [K(5, 4, 'q3')]: fbKey(2589, 11, [[234,235],[235,236],[4,5]]),
  [K(5, 4, 'q4')]: R(need(2589, 11)),
  [K(5, 4, 'q5')]: R(String(BigInt(need(2589, 11)) * 120n)),
  [K(5, 4, 'q6')]: yn(BigInt(need(2589, 11)) * 120n <= 28000n),
  // l5-005 — على منوال اختبار الفصل الأول — حافلات الرحلة المدرسية
  [K(5, 5, 'q1')]: R(String(538n + 22n)),
  [K(5, 5, 'q2')]: eqKey(560, 54, [[54,10,20],[54,9,74],[54,20,10],[54,11,20]]),
  [K(5, 5, 'q3')]: R(need(560, 54)),
  [K(5, 5, 'q4')]: R(need(560, 30)),
  [K(5, 5, 'q5')]: C(BigInt(need(560, 54)) * 12000n < BigInt(need(560, 30)) * 7000n ? 'A' : 'B'),
  // l5-006 — على منوال اختبار الفصل الأول — دقيق المخبزة
  [K(5, 6, 'q1')]: R(quo(1250, 35)),
  [K(5, 6, 'q2')]: R(rem(1250, 35)),
  [K(5, 6, 'q3')]: fbKey(1250, 35, [[34,35],[25,26],[35,36]]),
  [K(5, 6, 'q4')]: R(toNextMult(1250, 35)),
  [K(5, 6, 'q5')]: R(exactQ(1260, 35)),
  [K(5, 6, 'q6')]: relKey([["yaqsim",35,1260],["mudaaf",35,1260],["yaqbal",35,1260]]),
  // l5-007 — على منوال اختبار الفصل الأول — قفف التضامن
  [K(5, 7, 'q1')]: R(exactQ(2016, 12)),
  [K(5, 7, 'q2')]: yn(rem(1512, 9) === '0'),
  [K(5, 7, 'q3')]: R(quo(1000, 6)),
  [K(5, 7, 'q4')]: R(rem(1000, 6)),
  [K(5, 7, 'q5')]: pick(minS(quo(2016, 12), quo(1512, 9), quo(1000, 6)), ['168', '166', '167']),
  [K(5, 7, 'q6')]: R(String(168n * 6n - 1000n)),
  // l5-008 — على منوال اختبار الفصل الأول — غرس الأشجار
  [K(5, 8, 'q1')]: R(exactQ(1155, 35)),
  [K(5, 8, 'q2')]: relKey([["yaqsim",1155,35],["mudaaf",1155,35],["yaqbal",35,1155]]),
  [K(5, 8, 'q3')]: R(quo(1155, 40)),
  [K(5, 8, 'q4')]: R(rem(1155, 40)),
  [K(5, 8, 'q5')]: fbKey(1155, 40, [[28,29],[27,28],[35,36]]),
  [K(5, 8, 'q6')]: C(rem(1155, 35) === '0' && rem(1155, 40) !== '0' ? 'B' : 'A'),
  // l5-009 — على منوال اختبار الفصل الأول — كتاب قبل نهاية العطلة
  [K(5, 9, 'q1')]: R(quo(487, 15)),
  [K(5, 9, 'q2')]: R(rem(487, 15)),
  [K(5, 9, 'q3')]: R(need(487, 15)),
  [K(5, 9, 'q4')]: yn(Number(need(487, 15)) <= 30),
  [K(5, 9, 'q5')]: fbKey(487, 30, [[15,16],[16,17],[7,8]]),
  [K(5, 9, 'q6')]: R(excU(487, 30)),
  // l5-010 — على منوال اختبار الفصل الأول — كرات جمعية الحيّ
  [K(5, 10, 'q1')]: R(quo(13650, 1250)),
  [K(5, 10, 'q2')]: R(rem(13650, 1250)),
  [K(5, 10, 'q3')]: fbKey(13650, 1250, [[9,10],[1150,1151],[10,11]]),
  [K(5, 10, 'q4')]: R(toNextMult(13650, 1250)),
  [K(5, 10, 'q5')]: yn(rem(13750, 1250) === '0'),
};
