// Oracle du banc « qisma-iqlidiya-baqi » (القسمة الإقليدية, 1AM, 2026-10-14) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل الثاني », une feuille sur 1am-s1-101 « … الأول »). Chaque réponse est RECALCULÉE ici à
// partir des nombres de l'énoncé avec la division ENTIÈRE de cet oracle (BigInt, par soustractions de blocs), jamais
// lue dans `expectedAnswer`. Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Outils : `quo` / `rem` (la division euclidienne a = b × q + r, 0 ≤ r < b), `need` (groupes NÉCESSAIRES :
// q + 1 quand r ≠ 0), `isEu` (une égalité a = b × q + r est-elle une division euclidienne de a par b ?),
// `eqKey` / `brKey` (la clé d'un QCM d'égalités ou de حصر : l'unique option qui est LA division de a par b),
// `day` (le jour de la semaine n jours plus tard), `dec` (écriture décimale exacte, étapes d'autres leçons).
// Les QCM sont écrits dans l'ordre de la feuille ; pour les نعم / لا : A = نعم, B = لا (toutes les feuilles).
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
/** Le nombre de groupes NÉCESSAIRES pour tout ranger : q, plus un groupe incomplet s'il reste quelque chose. */
const need = (a, b) => { const { q: Qt, r } = euclid(a, b); return (r > 0n ? Qt + 1n : Qt).toString(); };
/** a = b × x + r est-elle LA division euclidienne de a par b ? (égalité vraie ET 0 ≤ r < b) */
const isEu = (a, b, x, r) => BigInt(a) === BigInt(b) * BigInt(x) + BigInt(r) && BigInt(r) >= 0n && BigInt(r) < BigInt(b);
const yn = (t) => C(t ? 'A' : 'B');
const LETTERS = 'ABCD';
const only = (hits, what) => {
  if (hits.length !== 1) throw new Error(`${what}: ${hits.length} options justes`);
  return C(LETTERS[hits[0]]);
};
/** Options [[b, x, r], …] écrites « a = b × x + r » : la seule qui est la division euclidienne de a par b. */
const eqKey = (a, b, opts) => only(opts.map((o, i) => (o[0] === b && isEu(a, o[0], o[1], o[2]) ? i : -1)).filter((i) => i >= 0), `eqKey ${a}÷${b}`);
/** Options [[k, k + 1], …] écrites « b × k ≤ a < b × (k + 1) » : la seule vraie. */
const brKey = (a, b, opts) => only(opts.map(([k, k1], i) => (b * k <= a && a < b * k1 && k1 === k + 1 ? i : -1)).filter((i) => i >= 0), `brKey ${a}÷${b}`);
/** Options numériques : la seule égale à v. */
const pick = (v, opts) => only(opts.map((o, i) => (String(o) === String(v) ? i : -1)).filter((i) => i >= 0), `pick ${v}`);
/** Options [n, d, r] « باقي قسمة n على d هو r » : la seule vraie. */
const remKey = (opts) => only(opts.map(([n, d, r], i) => (rem(n, d) === String(r) ? i : -1)).filter((i) => i >= 0), 'remKey');
/** Options [[b, x, r], …] (égalités vraies « a = b × x + r ») : la seule qui n'est une division euclidienne ni par b ni par x. */
const notEuKey = (a, opts) => only(opts.map(([b, x, r], i) => (!isEu(a, b, x, r) && !isEu(a, x, b, r) ? i : -1)).filter((i) => i >= 0), `notEuKey ${a}`);
/** Options [dividende, diviseur] d'une histoire (null = l'histoire n'est pas une division) : celle de a ÷ b. */
const pairKey = (a, b, opts) => only(opts.map((o, i) => (o && o[0] === a && o[1] === b ? i : -1)).filter((i) => i >= 0), `pairKey ${a}÷${b}`);
const DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
/** Le jour n jours après `start` : seul le reste de n par 7 compte. */
const day = (start, n) => DAYS[(DAYS.indexOf(start) + Number(rem(n, 7))) % 7];
const pickDay = (start, n, opts) => pick(day(start, n), opts);

/** Écriture décimale exacte d'un rationnel dont le dénominateur divise une puissance de 10. */
const dec = (v) => {
  const x = q(v);
  const [nn, d] = x.toString().includes('/') ? x.toString().split('/').map(BigInt) : [BigInt(x.toString()), 1n];
  for (let k = 0n; k <= 8n; k++) {
    const p = 10n ** k;
    if (p % d === 0n) {
      const N = nn * (p / d);
      const s = N.toString().padStart(Number(k) + 1, '0');
      const int = s.slice(0, s.length - Number(k)); const frac = s.slice(s.length - Number(k)).replace(/0+$/, '');
      return `${int}${frac ? `.${frac}` : ''}`;
    }
  }
  throw new Error(`${x} n'est pas décimal`);
};
const mul = (x, y) => q(x).mul(y);
const div = (x, y) => q(x).div(y);
/** Troncature au dixième (valeur approchée par défaut à 0,1 près). */
const floorTenth = (x, y) => dec(div(quo(BigInt(x) * 10n, y), 10));

const L = 'ex-1am-qisma-iqlidiya-baqi';
const K = (lvl, n, qid) => `${L}-l${lvl}-${String(n).padStart(3, '0')}:${qid}`;

export const ORACLE = {
  /* ── Niveau 1 ── */
  // l1-001 — الحصر بين مضاعفين متتاليين (textbook ex-15)
  [K(1, 1, 'q1')]: brKey(58, 9, [[6, 7], [5, 6], [7, 8]]),
  [K(1, 1, 'q2')]: brKey(97, 13, [[6, 7], [8, 9], [7, 8]]),
  [K(1, 1, 'q3')]: R(quo(97, 13)),
  [K(1, 1, 'q4')]: R(rem(97, 13)),
  // l1-002 — أتمم القسمات (textbook ex-17)
  [K(1, 2, 'q1')]: R(quo(652, 7)),
  [K(1, 2, 'q2')]: R(rem(652, 7)),
  [K(1, 2, 'q3')]: R(quo(836, 4)),
  [K(1, 2, 'q4')]: R(rem(836, 4)),
  // l1-003 — على منوال اختبار الفصل الثاني — أسماء حدود القسمة (platform_addition)
  [K(1, 3, 'q1')]: pick(quo(87, 6), [14, 3, 87, 6]),
  [K(1, 3, 'q2')]: pick(rem(87, 6), [87, 14, 3, 6]),
  // l1-004 — على منوال اختبار الفصل الثاني — قسمة على عدد من رقمين (platform_addition)
  [K(1, 4, 'q1')]: R(quo(315, 24)),
  [K(1, 4, 'q2')]: R(rem(315, 24)),
  // l1-005 — أيّ باقٍ صحيح؟ (textbook self-7)
  [K(1, 5, 'q1')]: yn(172 === 16 * 10 + 12),
  [K(1, 5, 'q2')]: remKey([[172, 16, 12], [172, 12, 10], [172, 10, 12]]),
  // l1-006 — على منوال اختبار الفصل الثاني — مساواة وقسمتان (platform_addition)
  [K(1, 6, 'q1')]: yn(isEu(200, 23, 8, 16)),
  [K(1, 6, 'q2')]: yn(isEu(200, 8, 23, 16)),
  [K(1, 6, 'q3')]: R(rem(200, 8)),
  // l1-007 — على منوال اختبار الفصل الثاني — المساواة المناسبة (platform_addition)
  [K(1, 7, 'q1')]: eqKey(507, 32, [[32, 14, 59], [32, 27, 15], [32, 16, 27], [32, 15, 27]]),
  [K(1, 7, 'q2')]: R(quo(507, 32)),
  // l1-008 — باقات لزيارة المرضى (textbook prep)
  [K(1, 8, 'q1')]: R(quo(1350, 8)),
  [K(1, 8, 'q2')]: R(rem(1350, 8)),
  // l1-009 — بالآلة الحاسبة (textbook ict)
  [K(1, 9, 'q1')]: R(quo(412, 15)),
  [K(1, 9, 'q2')]: R(rem(412, 15)),
  // l1-010 — على منوال اختبار الفصل الثاني — الحصر والباقي (platform_addition)
  [K(1, 10, 'q1')]: brKey(683, 25, [[27, 28], [26, 27], [28, 29]]),
  [K(1, 10, 'q2')]: R(rem(683, 25)),
  /* ── Niveau 2 ── */
  // l2-001 — باقات حفل التكريم (textbook act-3)
  [K(2, 1, 'q1')]: yn(15 * 20 <= 316),
  [K(2, 1, 'q2')]: yn(15 * 30 <= 316),
  [K(2, 1, 'q3')]: R(quo(316, 15)),
  [K(2, 1, 'q4')]: R(rem(316, 15)),
  // l2-002 — مساواة لا تعبّر عن قسمة إقليدية (textbook ex-16)
  [K(2, 2, 'q1')]: notEuKey(1500, [[35, 42, 30], [28, 50, 100], [37, 40, 20]]),
  [K(2, 2, 'q2')]: R(quo(1500, 28)),
  [K(2, 2, 'q3')]: R(rem(1500, 28)),
  // l2-003 — أين الخطأ؟ (textbook ex-19)
  [K(2, 3, 'q1')]: yn(quo(824, 4) === '26' && rem(824, 4) === '0'),
  [K(2, 3, 'q2')]: R(quo(824, 4)),
  // l2-004 — يوم عيد الميلاد (textbook ex-21)
  [K(2, 4, 'q1')]: R(rem(365, 7)),
  [K(2, 4, 'q2')]: pickDay('الخميس', 365, ["الأحد", "الجمعة", "الخميس", "السبت"]),
  [K(2, 4, 'q3')]: pickDay('الخميس', 366, ["السبت", "الخميس", "الأحد", "الجمعة"]),
  // l2-005 — على منوال اختبار الفصل الثاني — صحيح أم خطأ (term_exam 1am-s2-72 ex. 1)
  [K(2, 5, 'q1')]: yn(rem(218, 6) === '4'),
  [K(2, 5, 'q2')]: R(rem(218, 6)),
  [K(2, 5, 'q3')]: yn(quo(218, 6) === '36'),
  [K(2, 5, 'q4')]: yn(Array.from({ length: 60 }, (_, k) => rem(k, 6)).includes('6')),
  // l2-006 — على منوال اختبار الفصل الثاني — هل يمكن أن يكون الحاصل 24؟ (platform_addition)
  [K(2, 6, 'q1')]: brKey(400, 17, [[23, 24], [22, 23], [24, 25]]),
  [K(2, 6, 'q2')]: R(rem(400, 17)),
  [K(2, 6, 'q3')]: yn(17 * 24 <= 400),
  // l2-007 — أطباق البيض (textbook ex-20)
  [K(2, 7, 'q1')]: R(quo(250, 30)),
  [K(2, 7, 'q2')]: R(rem(250, 30)),
  [K(2, 7, 'q3')]: R(need(250, 30)),
  // l2-008 — على منوال اختبار الفصل الثاني — ما كتبه يوسف (platform_addition)
  [K(2, 8, 'q1')]: yn(94 === 8 * 10 + 14),
  [K(2, 8, 'q2')]: yn(isEu(94, 8, 10, 14)),
  [K(2, 8, 'q3')]: R(quo(94, 8)),
  [K(2, 8, 'q4')]: R(rem(94, 8)),
  // l2-009 — على منوال اختبار الفصل الثاني — حافلات الرحلة (platform_addition)
  [K(2, 9, 'q1')]: R(quo(287, 45)),
  [K(2, 9, 'q2')]: R(need(287, 45)),
  // l2-010 — على منوال اختبار الفصل الثاني — أنجز ثم أتمم المساواة (term_exam 1am-s2-77 ex. 1)
  [K(2, 10, 'q1')]: R(quo(83, 6)),
  [K(2, 10, 'q2')]: eqKey(83, 6, [[6, 5, 13], [6, 14, 5], [6, 13, 5], [6, 12, 11]]),
  [K(2, 10, 'q3')]: yn(isEu(83, 6, 12, 11)),
  /* ── Niveau 3 ── */
  // l3-001 — على منوال اختبار الفصل الثاني — أساور المعرض الخيري (term_exam 1am-s2-70 ex. 1)
  [K(3, 1, 'q1')]: R(quo(347, 16)),
  [K(3, 1, 'q2')]: eqKey(347, 16, [[16, 22, 11], [16, 21, 11], [16, 20, 27], [16, 11, 21]]),
  [K(3, 1, 'q3')]: R(rem(347, 16)),
  [K(3, 1, 'q4')]: R(String(16 - Number(rem(347, 16)))),
  // l3-002 — على منوال اختبار الفصل الثاني — القسمة على 42 (term_exam 1am-s2-80 ex. 1)
  [K(3, 2, 'q1')]: brKey(937, 42, [[22, 23], [21, 22], [23, 24]]),
  [K(3, 2, 'q2')]: R(quo(937, 42)),
  [K(3, 2, 'q3')]: R(rem(937, 42)),
  [K(3, 2, 'q4')]: eqKey(937, 42, [[42, 21, 55], [42, 13, 22], [42, 23, 13], [42, 22, 13]]),
  // l3-003 — على منوال اختبار الفصل الثاني — صحيح أم خطأ؟ (term_exam 1am-s2-72 ex. 1)
  [K(3, 3, 'q1')]: yn(rem(251, 8) === '3'),
  [K(3, 3, 'q2')]: yn(quo(251, 8) === '30'),
  [K(3, 3, 'q3')]: yn(isEu(251, 8, 30, 11)),
  [K(3, 3, 'q4')]: yn(isEu(251, 30, 8, 11)),
  // l3-004 — على منوال اختبار الفصل الثاني — المقسوم المجهول (platform_addition)
  [K(3, 4, 'q1')]: R((() => { for (let a = 0; a < 2000; a++) if (quo(a, 12) === '25' && rem(a, 12) === '9') return String(a); return 'none'; })()),
  [K(3, 4, 'q2')]: yn(Array.from({ length: 400 }, (_, k) => rem(k, 12)).includes('14')),
  [K(3, 4, 'q3')]: R(String(Math.max(...Array.from({ length: 400 }, (_, k) => Number(rem(k, 12)))))),
  [K(3, 4, 'q4')]: R((() => { let x = -1; for (let a = 0; a < 2000; a++) if (quo(a, 12) === '25') x = a; return String(x); })()),
  // l3-005 — قفزات على مستقيم مدرّج (textbook know-2)
  [K(3, 5, 'q1')]: pick(String(19 * Number(quo(412, 19))), [418, 380, 399]),
  [K(3, 5, 'q2')]: R(quo(412, 19)),
  [K(3, 5, 'q3')]: R(rem(412, 19)),
  [K(3, 5, 'q4')]: eqKey(412, 19, [[19, 22, 13], [19, 21, 13], [19, 20, 32], [19, 13, 21]]),
  // l3-006 — على منوال اختبار الفصل الثاني — موعد المسابقة (platform_addition)
  [K(3, 6, 'q1')]: R(quo(100, 7)),
  [K(3, 6, 'q2')]: R(rem(100, 7)),
  [K(3, 6, 'q3')]: pickDay('الثلاثاء', 100, ["الخميس", "الثلاثاء", "الجمعة", "الأربعاء"]),
  // l3-007 — على منوال اختبار الفصل الثاني — ورود العم سليمان (term_exam 1am-s2-73 ex. 5)
  [K(3, 7, 'q1')]: R(quo(1246, 15)),
  [K(3, 7, 'q2')]: R(rem(1246, 15)),
  [K(3, 7, 'q3')]: eqKey(1246, 15, [[15, 82, 16], [15, 1, 83], [15, 84, 1], [15, 83, 1]]),
  [K(3, 7, 'q4')]: R(quo(1246, 13)),
  // l3-008 — على منوال اختبار الفصل الثاني — كتب للمدارس الريفية (platform_addition)
  [K(3, 8, 'q1')]: R(quo(1000, 35)),
  [K(3, 8, 'q2')]: R(need(1000, 35)),
  [K(3, 8, 'q3')]: R(rem(1000, 35)),
  [K(3, 8, 'q4')]: R(String(35 - Number(rem(1000, 35)))),
  // l3-009 — قسمات عملية (textbook ex-18)
  [K(3, 9, 'q1')]: R(quo(2045, 37)),
  [K(3, 9, 'q2')]: R(rem(2045, 37)),
  [K(3, 9, 'q3')]: R(quo(7213, 6)),
  [K(3, 9, 'q4')]: R(rem(7213, 6)),
  // l3-010 — على منوال اختبار الفصل الثاني — رفوف مكتبة القسم (platform_addition)
  [K(3, 10, 'q1')]: brKey(538, 24, [[22, 23], [21, 22], [23, 24]]),
  [K(3, 10, 'q2')]: R(quo(538, 24)),
  [K(3, 10, 'q3')]: R(rem(538, 24)),
  [K(3, 10, 'q4')]: R(need(538, 24)),
  /* ── Niveau 4 ── */
  // l4-001 — على منوال اختبار الفصل الثاني — قابلية القسمة والقسمتان (term_exam 1am-s2-78 ex. 1)
  [K(4, 1, 'q1')]: yn(rem(3015, 5) === '0'),
  [K(4, 1, 'q2')]: yn(rem(3015, 9) === '0'),
  [K(4, 1, 'q3')]: R(quo(58, 7)),
  [K(4, 1, 'q4')]: eqKey(58, 7, [[7, 9, 2], [7, 8, 2], [7, 7, 9], [7, 2, 8]]),
  [K(4, 1, 'q5')]: R(dec(div('50.4', 12))),
  [K(4, 1, 'q6')]: R(String(Math.round(Number(dec(div('50.4', 12)))))),
  // l4-002 — على منوال اختبار الفصل الثاني — قسمة إقليدية وقسمة عشرية (term_exam 1am-s2-77 ex. 1)
  [K(4, 2, 'q1')]: R(quo(79, 6)),
  [K(4, 2, 'q2')]: eqKey(79, 6, [[6, 13, 1], [6, 12, 7], [6, 1, 13], [6, 14, 1]]),
  [K(4, 2, 'q3')]: R(dec(div(5115, 12))),
  [K(4, 2, 'q4')]: R(String(Math.round(Number(dec(div(5115, 12)))))),
  // l4-003 — على منوال اختبار الفصل الأول — تبليط المرآب (term_exam 1am-s1-101 ex. 5)
  [K(4, 3, 'q1')]: R(quo(245, 12)),
  [K(4, 3, 'q2')]: R(need(245, 12)),
  [K(4, 3, 'q3')]: R(dec(mul(need(245, 12), '875.5'))),
  [K(4, 3, 'q4')]: R(String(Number(need(245, 12)) * 12 - 245)),
  // l4-004 — على منوال اختبار الفصل الثاني — هدية المعلّمة (platform_addition)
  [K(4, 4, 'q1')]: R(quo(1350, 4)),
  [K(4, 4, 'q2')]: R(rem(1350, 4)),
  [K(4, 4, 'q3')]: R(String(1350 - 4 * Number(quo(1350, 4)))),
  [K(4, 4, 'q4')]: R(dec(div(1350, 4))),
  // l4-005 — من المساواة إلى المشكلة (textbook self-8)
  [K(4, 5, 'q1')]: yn(isEu(263, 6, 43, 5)),
  [K(4, 5, 'q2')]: pairKey(263, 6, [[263, 6], [6, 263], null]),
  [K(4, 5, 'q3')]: R(dec(div('263.4', 6))),
  // l4-006 — على منوال اختبار الفصل الثاني — أفواج اليوم الرياضي (platform_addition)
  [K(4, 6, 'q1')]: yn(rem(156, 4) === '0'),
  [K(4, 6, 'q2')]: R(quo(156, 7)),
  [K(4, 6, 'q3')]: R(rem(156, 7)),
  [K(4, 6, 'q4')]: R(need(156, 7)),
  // l4-007 — على منوال اختبار الفصل الثاني — برتقال الفلاح (platform_addition)
  [K(4, 7, 'q1')]: R(String(36 * 24)),
  [K(4, 7, 'q2')]: R(quo(864, 50)),
  [K(4, 7, 'q3')]: R(rem(864, 50)),
  [K(4, 7, 'q4')]: R(String(Number(quo(36 * 24, 50)) * 180)),
  // l4-008 — على منوال اختبار الفصل الثاني — تدريبات ياسين (platform_addition)
  [K(4, 8, 'q1')]: R(String(3 * 7 * 45)),
  [K(4, 8, 'q2')]: R(quo(945, 60)),
  [K(4, 8, 'q3')]: R(rem(945, 60)),
  [K(4, 8, 'q4')]: eqKey(945, 60, [[60, 45, 15], [60, 16, 45], [60, 15, 45], [60, 14, 105]]),
  // l4-009 — على منوال اختبار الفصل الثاني — عجين المخبزة (platform_addition)
  [K(4, 9, 'q1')]: R(quo(1000, 24)),
  [K(4, 9, 'q2')]: R(rem(1000, 24)),
  [K(4, 9, 'q3')]: eqKey(1000, 24, [[24, 42, 16], [24, 41, 16], [24, 40, 40], [24, 16, 41]]),
  [K(4, 9, 'q4')]: R(floorTenth(1000, 24)),
  // l4-010 — على منوال اختبار الفصل الثاني — أرض الورود (term_exam 1am-s2-73 ex. 5)
  [K(4, 10, 'q1')]: R(String(32 * 18)),
  [K(4, 10, 'q2')]: R(quo(32 * 18, 5)),
  [K(4, 10, 'q3')]: R(quo(1730, 12)),
  [K(4, 10, 'q4')]: R(rem(1730, 12)),
  /* ── Niveau 5 ── */
  // l5-001 — على منوال اختبار الفصل الثاني — أرض العم خالد (term_exam 1am-s2-73 ex. 5)
  [K(5, 1, 'q1')]: R(String(15 * 15 + 34 * 12)),
  [K(5, 1, 'q2')]: R(quo(1297, 14)),
  [K(5, 1, 'q3')]: R(rem(1297, 14)),
  [K(5, 1, 'q4')]: eqKey(1297, 14, [[14, 92, 9], [14, 91, 23], [14, 9, 92], [14, 93, 9]]),
  [K(5, 1, 'q5')]: R(String(Number(quo(1297, 14)) * 350)),
  [K(5, 1, 'q6')]: yn(Number(quo(1297, 14)) * 350 >= 32000),
  // l5-002 — على منوال اختبار الفصل الثاني — قرنفل الطلبية (term_exam 1am-s2-73 ex. 5)
  [K(5, 2, 'q1')]: R(String(2 * (45 + 28))),
  [K(5, 2, 'q2')]: R(String(2 * (45 + 28) - 3)),
  [K(5, 2, 'q3')]: R(quo(2350, 18)),
  [K(5, 2, 'q4')]: R(rem(2350, 18)),
  [K(5, 2, 'q5')]: yn(Number(quo(2350, 18)) >= 135),
  [K(5, 2, 'q6')]: R(String(135 * 18 - 2350)),
  // l5-003 — على منوال اختبار الفصل الأول — أيّ محلّ أرخص؟ (term_exam 1am-s1-101 ex. 5)
  [K(5, 3, 'q1')]: R(need(230, 12)),
  [K(5, 3, 'q2')]: R(dec(mul(need(230, 12), '965.5'))),
  [K(5, 3, 'q3')]: R(need(230, 15)),
  [K(5, 3, 'q4')]: R(dec(mul(need(230, 15), 1180))),
  [K(5, 3, 'q5')]: C(q(need(230, 12)).mul('965.5').sub(q(need(230, 15)).mul(1180)).toString().startsWith('-') ? 'A' : 'B'),
  [K(5, 3, 'q6')]: R(String(Number(need(230, 15)) * 15 - 230)),
  // l5-004 — على منوال اختبار الفصل الأول — جدار مطعم المدرسة (term_exam 1am-s1-101 ex. 5)
  [K(5, 4, 'q1')]: R(quo(318, 25)),
  [K(5, 4, 'q2')]: R(need(318, 25)),
  [K(5, 4, 'q3')]: R(String(Number(need(318, 25)) * 1450)),
  [K(5, 4, 'q4')]: yn(Number(need(318, 25)) * 1450 <= 20000),
  [K(5, 4, 'q5')]: R(String(20000 - Number(need(318, 25)) * 1450)),
  [K(5, 4, 'q6')]: R(String(Number(need(318, 25)) * 25 - 318)),
  // l5-005 — على منوال اختبار الفصل الثاني — عقود السيّدة نوال (term_exam 1am-s2-70 ex. 1)
  [K(5, 5, 'q1')]: R(quo(543, 26)),
  [K(5, 5, 'q2')]: eqKey(543, 26, [[26, 19, 49], [26, 23, 20], [26, 21, 23], [26, 20, 23]]),
  [K(5, 5, 'q3')]: R(rem(543, 26)),
  [K(5, 5, 'q4')]: R(String(26 - Number(rem(543, 26)))),
  [K(5, 5, 'q5')]: R(String(Number(quo(543, 26)) * 1250)),
  [K(5, 5, 'q6')]: yn(Number(quo(543, 26)) * 1250 >= 26000),
  [K(5, 5, 'q7')]: yn((Number(quo(543, 26)) + 1) * 1250 >= 26000),
  // l5-006 — على منوال اختبار الفصل الثاني — رحلة إلى حديقة التجارب (platform_addition)
  [K(5, 6, 'q1')]: R(String(412 + 23)),
  [K(5, 6, 'q2')]: R(quo(435, 50)),
  [K(5, 6, 'q3')]: R(need(435, 50)),
  [K(5, 6, 'q4')]: R(String(Number(need(435, 50)) * 12500)),
  [K(5, 6, 'q5')]: R(need(435, 30)),
  [K(5, 6, 'q6')]: C(Number(need(435, 50)) * 12500 < Number(need(435, 30)) * 8000 ? 'A' : 'B'),
  // l5-007 — على منوال اختبار الفصل الثاني — قفف التضامن (platform_addition)
  [K(5, 7, 'q1')]: R(quo(1236, 8)),
  [K(5, 7, 'q2')]: R(quo(1500, 9)),
  [K(5, 7, 'q3')]: pick(String(Math.min(Number(quo(1236, 8)), Number(quo(1500, 9)))), [320, 154, 166]),
  [K(5, 7, 'q4')]: yn(Math.min(Number(quo(1236, 8)), Number(quo(1500, 9))) >= 160),
  [K(5, 7, 'q5')]: R(String(160 * 8 - 1236)),
  [K(5, 7, 'q6')]: yn(160 * 9 <= 1500),
  // l5-008 — على منوال اختبار الفصل الثاني — مشروع غرس الأشجار (platform_addition)
  [K(5, 8, 'q1')]: R(quo(200, 7)),
  [K(5, 8, 'q2')]: R(rem(200, 7)),
  [K(5, 8, 'q3')]: pickDay('الأحد', 200, ["الأربعاء", "الخميس", "الأحد", "الجمعة"]),
  [K(5, 8, 'q4')]: R(String(Number(quo(200, 7)) * 25)),
  [K(5, 8, 'q5')]: yn(Number(quo(200, 7)) * 25 >= 680),
  [K(5, 8, 'q6')]: R(need(700, 16)),
  // l5-009 — على منوال اختبار الفصل الثاني — رفوف مكتبة البلدية (platform_addition)
  [K(5, 9, 'q1')]: R(quo(2475, 48)),
  [K(5, 9, 'q2')]: eqKey(2475, 48, [[48, 51, 27], [48, 50, 75], [48, 27, 51], [48, 52, 27]]),
  [K(5, 9, 'q3')]: R(need(2475, 48)),
  [K(5, 9, 'q4')]: yn(Number(need(2475, 48)) <= 50),
  [K(5, 9, 'q5')]: R(String(2475 - 50 * 48)),
  [K(5, 9, 'q6')]: yn(Number(need(2475, 50)) <= 50),
  // l5-010 — على منوال اختبار الفصل الثاني — دورة الأحياء (platform_addition)
  [K(5, 10, 'q1')]: R(quo(247, 11)),
  [K(5, 10, 'q2')]: R(rem(247, 11)),
  [K(5, 10, 'q3')]: R(String(11 - Number(rem(247, 11)))),
  [K(5, 10, 'q4')]: R(String(Number(quo(247, 11)) * 13)),
  [K(5, 10, 'q5')]: R(need(286, 20)),
  [K(5, 10, 'q6')]: yn(Number(need((Number(quo(247, 11)) + 1) * 13, 20)) <= 16),
};
