// Oracle du banc « qawaid-qabiliyat-qisma » (قواعد قابلية القسمة, 1AM, 2026-10-14) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل الثاني », les feuilles calquées sur 1am-s2-62 « … الثالث » : sujet mal rangé, il compte pour
// son EN-TÊTE). Chaque clé est DÉCIDÉE ICI par le reste `n % d` (BigInt), jamais par une règle de chiffres, et jamais lue
// dans `expectedAnswer`. Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Outils : `dv` (d divise n : n % d = 0), `yn` (A = نعم / B = لا, ou A = صحيح / B = خطأ), `setOf` (ensemble — answerType
// integerSet — des nombres d'une liste divisibles par tous les d), `setKey` (QCM dont les options sont des listes),
// `digitSet` / `digitMin` / `digitMax` (les chiffres qui, mis à la place de □, rendent le nombre divisible), `maxPerm`
// (le plus grand nombre formé de cartes, divisible), `nonePerm` (aucun arrangement ne l'est), `rem` (le reste
// euclidien), `zeroKey` / `notZeroKey` (l'égalité a = b × q + r qui montre que b divise / ne divise pas a), `claimKey`
// (l'unique affirmation vraie « a يقبل القسمة على … ولا يقبل … »), `ruleKey` (la règle dont le prédicat coïncide avec la
// divisibilité sur 0..9999), `sweep` (une affirmation générale vérifiée sur 0..9999), `leap` (année bissextile), `sum`
// (somme des chiffres — une donnée de l'énoncé, jamais un critère de clé).
// Les questions selfCheck (« برّر ») n'ont pas de clé et ne figurent pas ici.
import { R, C } from './helpers.mjs';

const dv = (n, d) => BigInt(n) % BigInt(d) === 0n;
const all = (n, ds) => [].concat(ds).every((d) => dv(n, d));
const rem = (a, b) => (BigInt(a) % BigInt(b)).toString();
const yn = (t) => C(t ? 'A' : 'B');
const LETTERS = 'ABCD';
const only = (hits, what) => {
  if (hits.length !== 1) throw new Error(`${what}: ${hits.length} options justes`);
  return C(LETTERS[hits[0]]);
};
const sorted = (xs) => [...xs].map(Number).sort((a, b) => a - b);
const same = (xs, ys) => JSON.stringify(sorted(xs)) === JSON.stringify(sorted(ys));
/** Les nombres de la liste divisibles par TOUS les d (integerSet). */
const setOf = (nums, ds) => {
  const s = sorted(nums.filter((n) => all(n, ds)));
  if (!s.length) throw new Error(`setOf ${nums} ÷ ${ds}: vide`);
  return R(s.join(', '));
};
/** Les chiffres x (0..9) tels que le nombre écrit `tpl` avec x à la place de □ soit divisible par tous les d. */
const digits = (tpl, ds) => {
  const out = [];
  for (let x = 0; x <= 9; x++) {
    const s = tpl.replace('□', String(x));
    if (s.length > 1 && s[0] === '0') continue;
    if (all(s, ds)) out.push(x);
  }
  return out;
};
const digitSet = (tpl, ds) => { const s = digits(tpl, ds); if (!s.length) throw new Error(`digitSet ${tpl}`); return R(s.join(', ')); };
const digitMin = (tpl, ds) => R(Math.min(...digits(tpl, ds)));
const digitMax = (tpl, ds) => R(Math.max(...digits(tpl, ds)));
/** Tous les nombres formés avec toutes les cartes, sans répétition, sans zéro en tête. */
const perms = (cards) => {
  if (cards.length <= 1) return [cards.join('')];
  const out = [];
  cards.forEach((c, i) => { for (const p of perms(cards.filter((_, j) => j !== i))) out.push(String(c) + p); });
  return out.filter((s) => s[0] !== '0');
};
const maxPerm = (cards, ds) => {
  const ok = perms(cards).filter((s) => all(s, ds)).map(Number);
  if (!ok.length) throw new Error(`maxPerm ${cards} ÷ ${ds}: aucun`);
  return R(Math.max(...ok));
};
const nonePerm = (cards, ds) => perms(cards).every((s) => !all(s, ds));
const isEu = (a, b, x, r) => BigInt(a) === BigInt(b) * BigInt(x) + BigInt(r) && BigInt(r) >= 0n && BigInt(r) < BigInt(b);
/** Options [[b, q, r], …] « a = b × q + r » : la seule division euclidienne de a par b de reste nul. */
const zeroKey = (a, b, opts) => only(opts.map(([bb, x, r], i) => (bb === b && isEu(a, bb, x, r) && r === 0 ? i : -1)).filter((i) => i >= 0), `zeroKey ${a}÷${b}`);
/** … la seule division euclidienne de a par b, de reste NON nul (preuve que b ne divise pas a). */
const notZeroKey = (a, b, opts) => only(opts.map(([bb, x, r], i) => (bb === b && isEu(a, bb, x, r) && r > 0 ? i : -1)).filter((i) => i >= 0), `notZeroKey ${a}÷${b}`);
/** Options [a, [d…] divise, [d…] ne divise pas] : la seule affirmation vraie. */
const claim = ([a, yes, no]) => yes.every((d) => dv(a, d)) && no.every((d) => !dv(a, d));
const claimKey = (opts) => only(opts.map((o, i) => (claim(o) ? i : -1)).filter((i) => i >= 0), 'claimKey');
/** Une affirmation générale, vérifiée sur 0..9999. */
const sweep = (pred) => { for (let n = 0; n <= 9999; n++) if (!pred(n)) return false; return true; };
/** Prédicats de chiffres que proposent les options d'une question « comment reconnaître… ». */
const u = (n) => n % 10;
const sum = (n) => String(n).split('').reduce((s, c) => s + Number(c), 0);
const PRED = {
  u0: (n) => u(n) === 0,
  u5: (n) => u(n) === 5,
  u05: (n) => u(n) === 0 || u(n) === 5,
  uEven: (n) => u(n) % 2 === 0,
  firstEven: (n) => Number(String(n)[0]) % 2 === 0,
  u3: (n) => u(n) % 3 === 0,
  sum3: (n) => sum(n) % 3 === 0,
  sum9: (n) => sum(n) % 9 === 0,
  sum4: (n) => sum(n) % 4 === 0,
  last2by4: (n) => (n % 100) % 4 === 0,
  u4: (n) => u(n) % 4 === 0,
};
/** La seule règle (nom de PRED) qui coïncide avec « divisible par tous les d » sur 0..9999. */
const ruleKey = (ds, opts) => only(opts.map((name, i) => (sweep((n) => PRED[name](n) === all(n, ds)) ? i : -1)).filter((i) => i >= 0), `ruleKey ${ds}`);
/** Année bissextile (deep-8) : divisible par 4, sauf les siècles non divisibles par 400. */
const leap = (y) => dv(y, 4) && (!dv(y, 100) || dv(y, 400));
const pick = (v, opts) => only(opts.map((o, i) => (String(o) === String(v) ? i : -1)).filter((i) => i >= 0), `pick ${v}`);
/** Parmi des nombres, le seul divisible par tous les `yes` et par aucun des `no`. */
const pickNum = (yes, no, opts) => only(opts.map((n, i) => (yes.every((d) => dv(n, d)) && no.every((d) => !dv(n, d)) ? i : -1)).filter((i) => i >= 0), `pickNum ${yes}/${no}`);
const quo = (a, b) => (BigInt(a) / BigInt(b)).toString();

const L = 'ex-1am-qawaid-qabiliyat-qisma';
const K = (lvl, n, qid) => `${L}-l${lvl}-${String(n).padStart(3, '0')}:${qid}`;
/** Décision : la seule option d (nombre) qui divise n. */
const divKey = (n, opts) => only(opts.map((d, i) => (dv(n, d) ? i : -1)).filter((i) => i >= 0), `divKey ${n}`);
/** Décision : la PLUS GRANDE option d qui divise n (le moins de groupes, sans reste). */
const bestKey = (n, opts) => {
  const ok = opts.filter((d) => dv(n, d));
  if (!ok.length) throw new Error(`bestKey ${n}: aucune`);
  return pick(Math.max(...ok), opts);
};
/** Les chiffres des unités des multiples de d (décidés par %) entre a et b : la seule option égale à cet ensemble. */
const unitsKey = (d, a, b, opts) => {
  const s = new Set();
  for (let n = a; n <= b; n++) if (dv(n, d)) s.add(n % 10);
  return only(opts.map((o, i) => (same(o, [...s]) ? i : -1)).filter((i) => i >= 0), `unitsKey ${d}`);
};
/** Les nombres de 1 à 99 divisibles par tous les d et de reste r dans la division par m : l'unique. */
const under100 = (ds, m, r) => {
  const s = [];
  for (let n = 1; n < 100; n++) if (all(n, ds) && rem(n, m) === String(r)) s.push(n);
  if (s.length !== 1) throw new Error(`under100: ${s}`);
  return R(s[0]);
};
const range1 = (b) => Array.from({ length: b }, (_, i) => i + 1);
const minPerm = (cards, ds) => {
  const ok = perms(cards).filter((s) => all(s, ds)).map(Number);
  if (!ok.length) throw new Error(`minPerm ${cards} ÷ ${ds}: aucun`);
  return R(Math.min(...ok));
};

export const ORACLE = {
  /* ── Niveau 1 ── */
  // l1-001 — ثلاثة أعداد وثلاث قواعد (textbook know-3)
  [K(1, 1, 'q1')]: yn(dv(3046, 2)),
  [K(1, 1, 'q2')]: yn(dv(4235, 5)),
  [K(1, 1, 'q3')]: yn(dv(2031, 3)),
  // l1-002 — على منوال اختبار الفصل الثاني — رقم الآحاد يكفي (platform_addition)
  [K(1, 2, 'q1')]: setOf([236, 405, 1170, 3009, 58, 7215], [2]),
  [K(1, 2, 'q2')]: setOf([236, 405, 1170, 3009, 58, 7215], [5]),
  // l1-003 — القسمة على 4 (textbook now-42)
  [K(1, 3, 'q1')]: yn(dv(316, 4)),
  [K(1, 3, 'q2')]: yn(dv(2030, 4)),
  [K(1, 3, 'q3')]: yn(dv(538, 4)),
  [K(1, 3, 'q4')]: yn(dv(1724, 4)),
  // l1-004 — على منوال اختبار الفصل الثاني — مجموع الأرقام (platform_addition)
  [K(1, 4, 'q1')]: R(sum(5271)),
  [K(1, 4, 'q2')]: yn(dv(5271, 3)),
  [K(1, 4, 'q3')]: yn(dv(5271, 9)),
  // l1-005 — على منوال اختبار الفصل الثاني — الباقي يحكم (platform_addition)
  [K(1, 5, 'q1')]: R(rem(438, 6)),
  [K(1, 5, 'q2')]: yn(dv(438, 6)),
  // l1-006 — أتمم الجدول (textbook self-12)
  [K(1, 6, 'q1')]: yn(dv(612, 9)),
  [K(1, 6, 'q2')]: yn(dv(2405, 5)),
  [K(1, 6, 'q3')]: yn(dv(2405, 3)),
  [K(1, 6, 'q4')]: yn(dv(180, 4)),
  [K(1, 6, 'q5')]: yn(dv(3124, 3)),
  [K(1, 6, 'q6')]: yn(dv(3124, 4)),
  // l1-007 — على منوال اختبار الفصل الثاني — الرقم الناقص (platform_addition)
  [K(1, 7, 'q1')]: digitMin("47□", [3]),
  [K(1, 7, 'q2')]: digitSet("47□", [9]),
  // l1-008 — جداء ومضاعفات (textbook prep)
  [K(1, 8, 'q1')]: claimKey([[54, [6, 9], []], [54, [6], [9]], [6, [54], []]]),
  [K(1, 8, 'q2')]: R(rem(54, 9)),
  // l1-009 — على 2 و 5 في آن واحد (textbook ex-22)
  [K(1, 9, 'q1')]: setOf([230, 145, 1000, 72, 3015, 4060], [2, 5]),
  [K(1, 9, 'q2')]: ruleKey([2, 5], ["u05", "u5", "u0"]),
  // l1-010 — على منوال اختبار الفصل الثاني — المساواة المناسبة (platform_addition)
  [K(1, 10, 'q1')]: zeroKey(96, 8, [[8, 10, 16], [8, 12, 0], [8, 11, 8]]),
  [K(1, 10, 'q2')]: notZeroKey(100, 8, [[8, 12, 4], [8, 11, 12], [8, 10, 20]]),
  /* ── Niveau 2 ── */
  // l2-001 — جدول الأعداد من 0 إلى 48 (textbook act-4)
  [K(2, 1, 'q1')]: unitsKey(5, 0, 48, [[5], [0, 2, 4, 6, 8], [0, 5]]),
  [K(2, 1, 'q2')]: unitsKey(2, 0, 48, [[0, 5], [2, 4, 6, 8], [0, 2, 4, 6, 8]]),
  // l2-002 — من 3 إلى 9 (textbook ex-23)
  [K(2, 2, 'q1')]: setOf([286, 156, 20000, 52, 2017, 2022, 117], [3]),
  [K(2, 2, 'q2')]: setOf([286, 156, 20000, 52, 2017, 2022, 117], [9]),
  // l2-003 — من 2 إلى 4 (textbook ex-24)
  [K(2, 3, 'q1')]: setOf([245, 92, 2028, 2030, 516, 1006, 3000], [2]),
  [K(2, 3, 'q2')]: setOf([245, 92, 2028, 2030, 516, 1006, 3000], [4]),
  // l2-004 — حلوى روضة الأطفال (textbook method-2)
  [K(2, 4, 'q1')]: yn(dv(300, 4)),
  [K(2, 4, 'q2')]: yn(dv(318, 4)),
  [K(2, 4, 'q3')]: yn(dv(324, 4)),
  // l2-005 — على منوال اختبار الفصل الثاني — رقم العشرات الناقص (platform_addition)
  [K(2, 5, 'q1')]: digitSet("5□2", [3]),
  [K(2, 5, 'q2')]: digitSet("5□2", [9]),
  // l2-006 — على منوال اختبار الفصل الثاني — بالقسمة ثم بالقاعدة (platform_addition)
  [K(2, 6, 'q1')]: R(rem(1236, 4)),
  [K(2, 6, 'q2')]: yn(dv(1236, 4)),
  // l2-007 — السنوات الكبيسة (textbook deep-8)
  [K(2, 7, 'q1')]: yn(leap(2028)),
  [K(2, 7, 'q2')]: yn(leap(1800)),
  [K(2, 7, 'q3')]: yn(leap(2400)),
  [K(2, 7, 'q4')]: yn(leap(1914)),
  // l2-008 — على منوال اختبار الفصل الثاني — صحيح أم خطأ؟ (platform_addition)
  [K(2, 8, 'q1')]: yn(sweep((n) => !dv(n, 9) || dv(n, 3))),
  [K(2, 8, 'q2')]: yn(sweep((n) => !dv(n, 3) || dv(n, 9))),
  [K(2, 8, 'q3')]: pickNum([3], [9], [33, 90, 27, 81]),
  // l2-009 — على منوال اختبار الفصل الثاني — أفواج التشجير (platform_addition)
  [K(2, 9, 'q1')]: R(sum(126)),
  [K(2, 9, 'q2')]: yn(dv(126, 9)),
  [K(2, 9, 'q3')]: R(quo(126, 9)),
  // l2-010 — بطاقات الأرقام (textbook ex-26)
  [K(2, 10, 'q1')]: maxPerm([7, 2, 5, 4], [2]),
  [K(2, 10, 'q2')]: maxPerm([7, 2, 5, 4], [5]),
  [K(2, 10, 'q3')]: maxPerm([7, 2, 5, 4], [4]),
  /* ── Niveau 3 ── */
  // l3-001 — على منوال اختبار الفصل الثاني — جدول قابلية القسمة (term_exam 1am-s2-70 ex. 2)
  [K(3, 1, 'q1')]: yn(dv(585, 2)),
  [K(3, 1, 'q2')]: yn(dv(585, 3)),
  [K(3, 1, 'q3')]: yn(dv(585, 5)),
  [K(3, 1, 'q4')]: yn(dv(585, 9)),
  [K(3, 1, 'q5')]: yn(dv(3726, 2)),
  [K(3, 1, 'q6')]: yn(dv(3726, 3)),
  [K(3, 1, 'q7')]: yn(dv(3726, 5)),
  [K(3, 1, 'q8')]: yn(dv(3726, 9)),
  // l3-002 — على منوال اختبار الفصل الثاني — صحيح أو خطأ مع التصحيح (term_exam 1am-s2-72 ex. 1)
  [K(3, 2, 'q1')]: yn(sweep((n) => dv(n, 5) === (n % 10 === 5))),
  [K(3, 2, 'q2')]: yn(rem(247, 5) === '3'),
  [K(3, 2, 'q3')]: R(rem(247, 5)),
  [K(3, 2, 'q4')]: yn(sweep((n) => !dv(n, 2) || dv(n, 4))),
  [K(3, 2, 'q5')]: yn(dv(1206, 9)),
  // l3-003 — على منوال اختبار الفصل الثاني — تصنيف الأعداد (term_exam 1am-s2-80 ex. 2)
  [K(3, 3, 'q1')]: setOf([132, 75, 540, 216, 2030, 924, 3535], [2]),
  [K(3, 3, 'q2')]: setOf([132, 75, 540, 216, 2030, 924, 3535], [3]),
  [K(3, 3, 'q3')]: setOf([132, 75, 540, 216, 2030, 924, 3535], [4]),
  [K(3, 3, 'q4')]: setOf([132, 75, 540, 216, 2030, 924, 3535], [5]),
  [K(3, 3, 'q5')]: setOf([132, 75, 540, 216, 2030, 924, 3535], [2, 3, 5]),
  // l3-004 — على منوال اختبار الفصل الثالث — العدد 714 (term_exam 1am-s2-62 ex. 1)
  [K(3, 4, 'q1')]: yn(dv(714, 2)),
  [K(3, 4, 'q2')]: yn(dv(714, 3)),
  [K(3, 4, 'q3')]: yn(dv(714, 5)),
  [K(3, 4, 'q4')]: R(rem(714, 5)),
  // l3-005 — خرز الأساور (textbook ex-32)
  [K(3, 5, 'q1')]: setOf(range1(99), [2, 3, 5]),
  [K(3, 5, 'q2')]: under100([2, 3, 5], 7, 4),
  // l3-006 — على منوال اختبار الفصل الثاني — رمز خزانة الأدوات (platform_addition)
  [K(3, 6, 'q1')]: digitSet("3□4", [3]),
  [K(3, 6, 'q2')]: digitSet("3□4", [4]),
  [K(3, 6, 'q3')]: digitMax("3□4", [3, 4]),
  // l3-007 — على منوال اختبار الفصل الثاني — قراءة مساواة (term_exam 1am-s2-80 ex. 1)
  [K(3, 7, 'q1')]: yn(isEu(1350, 4, 337, 2) && 2 > 0),
  [K(3, 7, 'q2')]: yn(dv(1350, 4)),
  [K(3, 7, 'q3')]: zeroKey(1350, 9, [[9, 149, 9], [9, 148, 18], [9, 150, 0]]),
  // l3-008 — على منوال اختبار الفصل الثاني — كراريس التضامن (platform_addition)
  [K(3, 8, 'q1')]: yn(dv(2340, 4)),
  [K(3, 8, 'q2')]: yn(dv(2340, 9)),
  [K(3, 8, 'q3')]: yn(dv(2340, 5)),
  [K(3, 8, 'q4')]: R(rem(2340, 7)),
  // l3-009 — على منوال اختبار الفصل الثاني — القسمة على 4 مرّتان على 2 (platform_addition)
  [K(3, 9, 'q1')]: R(quo(216, 4)),
  [K(3, 9, 'q2')]: R(quo(1048, 4)),
  [K(3, 9, 'q3')]: yn(dv(2018, 4)),
  // l3-010 — على منوال اختبار الفصل الثاني — من 3 إلى 9 (term_exam 1am-s2-78 ex. 1)
  [K(3, 10, 'q1')]: setOf([4518, 2763, 1037, 5214], [3]),
  [K(3, 10, 'q2')]: setOf([4518, 2763, 1037, 5214], [9]),
  [K(3, 10, 'q3')]: digitSet("52□4", [9]),
  /* ── Niveau 4 ── */
  // l4-001 — على منوال اختبار الفصل الثاني — جدول وقسمة إقليدية (term_exam 1am-s2-78 ex. 1)
  [K(4, 1, 'q1')]: yn(dv(2016, 4)),
  [K(4, 1, 'q2')]: yn(dv(47826, 3)),
  [K(4, 1, 'q3')]: yn(dv(47826, 9)),
  [K(4, 1, 'q4')]: yn(dv(150, 4)),
  [K(4, 1, 'q5')]: yn(dv(6183, 9)),
  [K(4, 1, 'q6')]: yn(dv(6183, 2)),
  [K(4, 1, 'q7')]: R(quo(43, 6)),
  [K(4, 1, 'q8')]: R(rem(43, 6)),
  // l4-002 — على منوال اختبار الفصل الثاني — تصنيف وقسمة (term_exam 1am-s2-80 ex. 2)
  [K(4, 2, 'q1')]: setOf([234, 85, 720, 318, 2040, 612, 1515], [4]),
  [K(4, 2, 'q2')]: setOf([234, 85, 720, 318, 2040, 612, 1515], [5]),
  [K(4, 2, 'q3')]: setOf([234, 85, 720, 318, 2040, 612, 1515], [2, 3, 5]),
  [K(4, 2, 'q4')]: R(quo(318, 4)),
  [K(4, 2, 'q5')]: R(rem(318, 4)),
  // l4-003 — على منوال اختبار الفصل الثاني — لآلئ الصائغ (term_exam 1am-s2-70 ex. 1)
  [K(4, 3, 'q1')]: R(quo(252, 14)),
  [K(4, 3, 'q2')]: R(rem(252, 14)),
  [K(4, 3, 'q3')]: yn(dv(252, 9)),
  [K(4, 3, 'q4')]: yn(dv(252, 4)),
  // l4-004 — على منوال اختبار الفصل الثاني — علب الحليب (platform_addition)
  [K(4, 4, 'q1')]: yn(dv(1236, 3)),
  [K(4, 4, 'q2')]: R(quo(1236, 3)),
  [K(4, 4, 'q3')]: yn(dv(1236, 9)),
  [K(4, 4, 'q4')]: R(rem(1236, 9)),
  // l4-005 — على منوال اختبار الفصل الثاني — أشجار حول الحديقة (platform_addition)
  [K(4, 5, 'q1')]: R(String(2 * 84)),
  [K(4, 5, 'q2')]: yn(dv(168, 4)),
  [K(4, 5, 'q3')]: yn(dv(168, 5)),
  [K(4, 5, 'q4')]: R(quo(168, 4)),
  // l4-006 — على منوال اختبار الفصل الثاني — بطاقات فيها صفر (platform_addition)
  [K(4, 6, 'q1')]: maxPerm([3, 0, 6, 1], [5]),
  [K(4, 6, 'q2')]: maxPerm([3, 0, 6, 1], [4]),
  [K(4, 6, 'q3')]: yn(!nonePerm([3, 0, 6, 1], [9])),
  [K(4, 6, 'q4')]: R(quo(6310, 5)),
  // l4-007 — سنة كبيسة وأيام الأسبوع (textbook deep-8)
  [K(4, 7, 'q1')]: yn(leap(2032)),
  [K(4, 7, 'q2')]: yn(leap(2100)),
  [K(4, 7, 'q3')]: R(String((leap(2031) ? 366 : 365) + (leap(2032) ? 366 : 365))),
  [K(4, 7, 'q4')]: R(rem(731, 7)),
  // l4-008 — على منوال اختبار الفصل الثاني — ما ينقص ليقبل القسمة (platform_addition)
  [K(4, 8, 'q1')]: R(String(9 * 47 + 5)),
  [K(4, 8, 'q2')]: yn(dv(428, 9)),
  [K(4, 8, 'q3')]: R(rem(428, 9)),
  [K(4, 8, 'q4')]: R(String(9 - Number(rem(428, 9)))),
  // l4-009 — على منوال اختبار الفصل الثاني — صحيح أو خطأ (term_exam 1am-s2-72 ex. 1)
  [K(4, 9, 'q1')]: yn(claim([3105, [5, 9], []])),
  [K(4, 9, 'q2')]: yn(rem(2025, 4) === '1'),
  [K(4, 9, 'q3')]: yn(sweep((n) => !dv(n, 4) || dv(n, 2))),
  [K(4, 9, 'q4')]: R(quo(2025, 5)),
  // l4-010 — على منوال اختبار الفصل الثاني — خيام المخيّم الصيفي (platform_addition)
  [K(4, 10, 'q1')]: yn(dv(540, 4)),
  [K(4, 10, 'q2')]: yn(dv(540, 9)),
  [K(4, 10, 'q3')]: R(rem(540, 7)),
  [K(4, 10, 'q4')]: R(quo(540, 9)),
  /* ── Niveau 5 ── */
  // l5-001 — على منوال اختبار الفصل الثاني — أوتاد سياج الحقل (term_exam 1am-s2-70 ex. 4)
  [K(5, 1, 'q1')]: R(String(2 * 144)),
  [K(5, 1, 'q2')]: yn(dv(288, 5)),
  [K(5, 1, 'q3')]: yn(dv(288, 9)),
  [K(5, 1, 'q4')]: R(rem(288, 7)),
  [K(5, 1, 'q5')]: divKey(288, [9, 5, 7]),
  [K(5, 1, 'q6')]: R(quo(288, 9)),
  [K(5, 1, 'q7')]: R(String(32 * 120)),
  // l5-002 — على منوال اختبار الفصل الثاني — أحواض أرض ماسينيسا (term_exam 1am-s2-78 ex. 4)
  [K(5, 2, 'q1')]: R(String(45 * 32)),
  [K(5, 2, 'q2')]: yn(dv(1440, 9)),
  [K(5, 2, 'q3')]: yn(dv(1440, 4)),
  [K(5, 2, 'q4')]: R(rem(1440, 7)),
  [K(5, 2, 'q5')]: divKey(1440, [9, 7]),
  [K(5, 2, 'q6')]: R(quo(1440, 9)),
  // l5-003 — على منوال اختبار الفصل الثالث — أسلاك المنزل (term_exam 1am-s2-62 ex. 4)
  [K(5, 3, 'q1')]: R(String(2 * 123)),
  [K(5, 3, 'q2')]: yn(dv(246, 3)),
  [K(5, 3, 'q3')]: yn(dv(246, 4)),
  [K(5, 3, 'q4')]: R(rem(246, 4)),
  [K(5, 3, 'q5')]: divKey(246, [3, 4]),
  [K(5, 3, 'q6')]: R(quo(246, 3)),
  // l5-004 — على منوال اختبار الفصل الثاني — دهن محيط الملعب (term_exam 1am-s2-80 ex. 5)
  [K(5, 4, 'q1')]: R(String(2 * 175)),
  [K(5, 4, 'q2')]: yn(dv(350, 5)),
  [K(5, 4, 'q3')]: yn(dv(350, 4)),
  [K(5, 4, 'q4')]: divKey(350, [5, 4]),
  [K(5, 4, 'q5')]: R(quo(350, 5)),
  [K(5, 4, 'q6')]: R(String(70 * 450)),
  // l5-005 — على منوال اختبار الفصل الثاني — فرق اليوم الرياضي (platform_addition)
  [K(5, 5, 'q1')]: yn(dv(234, 2)),
  [K(5, 5, 'q2')]: yn(dv(234, 3)),
  [K(5, 5, 'q3')]: yn(dv(234, 9)),
  [K(5, 5, 'q4')]: yn(dv(234, 4)),
  [K(5, 5, 'q5')]: R(rem(234, 4)),
  [K(5, 5, 'q6')]: divKey(234, [4, 9]),
  // l5-006 — على منوال اختبار الفصل الثاني — رمز قفل الجمعية (platform_addition)
  [K(5, 6, 'q1')]: maxPerm([8, 1, 6, 0], [2]),
  [K(5, 6, 'q2')]: maxPerm([8, 1, 6, 0], [4]),
  [K(5, 6, 'q3')]: yn(perms([8, 1, 6, 0]).every((s) => dv(s, 3))),
  [K(5, 6, 'q4')]: minPerm([8, 1, 6, 0], [4, 5]),
  // l5-007 — رزنامة النادي (textbook deep-8)
  [K(5, 7, 'q1')]: yn(leap(2024)),
  [K(5, 7, 'q2')]: yn(leap(2100)),
  [K(5, 7, 'q3')]: yn(leap(2000)),
  [K(5, 7, 'q4')]: R(leap(2028) ? 366 : 365),
  [K(5, 7, 'q5')]: R(rem(366, 7)),
  [K(5, 7, 'q6')]: pick(['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'][Number(rem(leap(2028) ? 366 : 365, 7))], ["الثلاثاء", "الاثنين", "الأربعاء"]),
  // l5-008 — على منوال اختبار الفصل الثاني — حلويات المخبزة (platform_addition)
  [K(5, 8, 'q1')]: yn(dv(1350, 4)),
  [K(5, 8, 'q2')]: yn(dv(1350, 5)),
  [K(5, 8, 'q3')]: yn(dv(1350, 9)),
  [K(5, 8, 'q4')]: R(rem(1350, 4)),
  [K(5, 8, 'q5')]: bestKey(1350, [9, 4, 5]),
  [K(5, 8, 'q6')]: R(quo(1350, 9)),
  // l5-009 — على منوال اختبار الفصل الثاني — كراسي قاعة الحفلات (platform_addition)
  [K(5, 9, 'q1')]: yn(dv(252, 4)),
  [K(5, 9, 'q2')]: yn(dv(252, 5)),
  [K(5, 9, 'q3')]: yn(dv(252, 9)),
  [K(5, 9, 'q4')]: R(rem(252, 5)),
  [K(5, 9, 'q5')]: bestKey(252, [4, 5, 9]),
  [K(5, 9, 'q6')]: R(quo(252, 9)),
  // l5-010 — على منوال اختبار الفصل الثاني — فاتورة الرحلة (platform_addition)
  [K(5, 10, 'q1')]: digitSet("73□0", [3]),
  [K(5, 10, 'q2')]: digitSet("73□0", [4]),
  [K(5, 10, 'q3')]: digitMax("73□0", [3, 4]),
  [K(5, 10, 'q4')]: R(quo(7380, 4)),
};
