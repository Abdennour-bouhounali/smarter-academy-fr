/**
 * « الدرس على السبّورة » of this lesson — the STEPS the class goes through together (CLASS_SESSION.md §5ter).
 * The kinds of step and what the board does with each: `features/classSession/lessonScripts.js`.
 * Reached only through the lesson's pack (`lesson.pack.js › board.script`).
 *
 * The lesson before it found the PGCD by writing two lists; here the streams are too long for lists. The hour opens on
 * the carpenter of the board (his own numbers: two streams of 245 and 175 cells, planks of ONE length, the longest —
 * never the student's story): he tries a plank of 49. Then the five keys, in the order of the student's world, each met
 * by ONE question made for it and PROVED by the bridges the board builds before its name:
 *   ➖ the planks of 175 that fill the piece 245 − 175 = 70 are those that fill 245 (`farq`);
 *   🪜 the ladder of differences of 245 and 175: which of its numbers fills 245 — only the last one before 0 (`tarh`);
 *   🧮 405 − 75 − 75 − 75 − 75 − 75 = 30 is ONE division; the planks of 75 that fill 30 are those that fill 405 (`baqi`);
 *   🔁 the ladder of divisions of 1325 and 477: which of its numbers fills 1325 — only the last remainder before 0
 *      (`iqlidis`); the plank 477 over 1325 draws the first division itself;
 *   ⏱️ 1064 and 42: two divisions where the differences take 28 subtractions; the PGCD proved by the planks of 42, the
 *      count of steps written beside the counts of the two earlier pairs (`sibaq`).
 * No `forge`/`bridges` step: the five keys are forged by each student in his world. Every question is about planks over
 * a stream: the board's own words (« لوح », « يثبت / ينهار ») are right, no `ask` needs its own `words`.
 * MISSING ON THE BOARD (reported, not bent): a station that runs a LADDER row by row (the class says each row, the board
 * writes it) and one that RACES two ladders and counts their rows. The nearest honest version is used: the rows are
 * written in the station's text and its `after`, the class continues them with the pen (the cue asks it), and the
 * `ask` proves what the ladder ends on. ⏱️ is proved on the PGCD; the counts of steps are written, computed, not asked.
 * The numbers are the board's own (`BOARD`), never the story's nor a pair of the lesson's exercise bank;
 * `board.test.js` computes every one of them. A `cue` is at most 70 characters; nothing the class reads before a name
 * holds that name.
 */
import { cellsOf } from '../../../../../../../features/classSession/lessonScripts';

/** The five keys of the lesson (the tablets of the student's world, `world/story.js › TABLETS`), in order. */
export const KEYS = ['farq-yabqi', 'khawarizmiyat-al-tarh', 'baqi-yabqi', 'iqlidis', 'aqall-khutuwat'];

/** The board's numbers — ONE place: the script, the memo and the tests read them from here. */
export const BOARD = {
  /** The carpenter: his two streams and the plank he tries first (it fills the first, not the second). */
  streams: [245, 175],
  first: 49,
  /** ➖ the planks of the shorter stream tried on the piece left when it is cut off the longer. */
  farq: [5, 7, 25, 35],
  /** 🧮 a long stream and a short one: the short one taken away again and again; its planks tried on what is left. */
  baqi: { a: 405, b: 75, planks: [3, 5, 15, 25] },
  /** 🔁 two long streams: the ladder of divisions. */
  euclid: [1325, 477],
  /** ⏱️ a long stream and a very short one; the planks of the short one tried on the long one. */
  race: { a: 1064, b: 42, planks: [2, 3, 6, 7, 14, 21] },
};
const {
  streams: [A, B],
  first: F,
  baqi: P,
  euclid: [E1, E2],
  race: R,
} = BOARD;

const gcd = (x, y) => (y ? gcd(y, x % y) : x);
/** Formulas one after the other: a no-break space BEFORE each comma, so a line never starts with « ، ». */
const rows = (fs) => fs.map((f) => `$${f}$`).join(' ، ');
const pgcd = (a, b) => `\\mathrm{PGCD}(${a} ; ${b})`;
/** « n = d1 × k1 = d2 × k2 = … », every factor computed. */
const chain = (n, ds) => `${n} = ${ds.map((d) => `${d} \\times ${n / d}`).join(' = ')}`;
/** « n = d1 × q1 + r1 = d2 × q2 + r2 … », every quotient and remainder computed. */
const rests = (n, ds) =>
  `${n} = ${ds.map((d) => `${d} \\times ${Math.floor(n / d)}${n % d ? ` + ${n % d}` : ''}`).join(' = ')}`;
/** The divisors of n that are at most its square root: one per pair. */
const smalls = (n) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0 && d * d <= n);
const fills = (a, list) => list.filter((o) => a % o === 0);
const misses = (a, list) => list.filter((o) => a % o !== 0);

/** The ladder of differences: [bigger, smaller, difference] rows, the smaller and the difference going on, down to 0. */
export function differences(a, b) {
  const out = [];
  let [x, y] = [Math.max(a, b), Math.min(a, b)];
  while (y > 0) {
    out.push([x, y, x - y]);
    [x, y] = [Math.max(y, x - y), Math.min(y, x - y)];
  }
  return out;
}
/** The ladder of divisions: [dividend, divisor, quotient, remainder] rows, down to the remainder 0. */
export function divisions(a, b) {
  const out = [];
  let [x, y] = [Math.max(a, b), Math.min(a, b)];
  while (y > 0) {
    out.push([x, y, Math.floor(x / y), x % y]);
    [x, y] = [y, x % y];
  }
  return out;
}
const subRow = ([x, y, d]) => `${x} - ${y} = ${d}`;
const divRow = ([x, y, q, r]) => `${x} = ${y} \\times ${q} + ${r}`;
/** « عملية طرح واحدة », « عمليتا طرح », « 5 عمليات طرح », « 28 عملية طرح ». */
export const subtractionsOf = (n) =>
  n === 1 ? 'عملية طرح واحدة' : n === 2 ? 'عمليتا طرح' : n <= 10 ? `${n} عمليات طرح` : `${n} عملية طرح`;
/** « قسمة واحدة », « قسمتان », « 3 قسمات », « 11 قسمة ». */
export const divisionsOf = (n) => (n === 1 ? 'قسمة واحدة' : n === 2 ? 'قسمتان' : n <= 10 ? `${n} قسمات` : `${n} قسمة`);

const DIFF = A - B;
const LADDER = differences(A, B);
const G = gcd(A, B);
/** The numbers the ladder of differences writes, in order, each once (the 0 left out). */
const LADDER_NUMS = [...new Set(LADDER.map((r) => r[2]).filter((d) => d > 0))];
const PQ = Math.floor(P.a / P.b);
const PR = P.a % P.b;
const PEEL = `${P.a} - ${Array(PQ).fill(P.b).join(' - ')} = ${PR}`;
const EU = divisions(E1, E2);
const EG = gcd(E1, E2);
/** The numbers the ladder of divisions writes: the divisor, then every remainder before 0. */
const EU_NUMS = [E2, ...EU.map((r) => r[3]).filter((r) => r > 0)];
const RACE = divisions(R.a, R.b);
const RG = gcd(R.a, R.b);
const steps = (a, b) => ({
  sub: differences(a, b).length,
  div: divisions(a, b).length,
});
const S0 = steps(A, B);
const S1 = steps(E1, E2);
const S2 = steps(R.a, R.b);

export const SCRIPT = {
  title: 'البحث عن القاسم المشترك الأكبر لعددين طبيعيين',
  steps: [
    {
      id: 'situation',
      kind: 'situation',
      chapter: 'نكتشف',
      title: 'ساقيتان طويلتان',
      text: `يبني النجّار جسرين فوق ساقيتين: الأولى ${cellsOf(A)} والثانية ${cellsOf(B)}، بألواح كلّها بطول واحد، أطول ما يمكن ودون قطع. قائمتا القواسم طويلتان، فيجرّب لوحًا طوله ${F}.`,
      question: `هل يملأ اللوح ${F} الساقية الأولى؟`,
      bridge: { a: A, b: F },
      cue: `والساقية ${B}: هل يملؤها اللوح ${F}؟ هل من طريق دون قائمتين؟`,
    },
    // ➖ the piece left when the shorter stream is cut off the longer
    {
      id: 'farq',
      kind: 'ask',
      chapter: 'نكتشف',
      title: `ما يبقى من ${A} بعد ${B}`,
      text: `نقصّ من الساقية الأولى طول الثانية: $${A} - ${B} = ${DIFF}$، فتبقى قطعة من ${cellsOf(DIFF)}. ألواح الساقية ${B}: $${chain(B, smalls(B))}$.`,
      question: `أيّ ألواح الساقية ${B} يملأ القطعة ${DIFF}؟`,
      a: DIFF,
      options: BOARD.farq,
      answer: fills(DIFF, BOARD.farq),
      after: `${rows([chain(A, fills(A, BOARD.farq)), rests(A, misses(A, BOARD.farq))])}: الألواح التي تملأ ${B} و ${DIFF} معًا هي التي تملأ ${B} و ${A} معًا، $${pgcd(A, B)} = ${pgcd(B, DIFF)}$.`,
      cue: `لماذا يملأ كلّ لوح يملأ ${A} و ${B} القطعةَ ${DIFF} أيضًا؟`,
    },
    {
      id: 'name-1',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: KEYS[0],
      recall: ['فرقهما'],
      // (not 96 and 66: 96 is lesson 2's number of books — defects.md A9, caught by this lesson's board walk)
      cue: 'بأيّ عدد نعوّض 102 في الزوج 102 و 72 دون أن يتغيّر الجواب؟',
    },
    // 🪜 the same cut, again and again: the ladder of differences of the carpenter's streams
    {
      id: 'tarh',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'نقصّ من جديد',
      text: `نعيد مع الساقية الأقصر والقطعة، ثمّ من جديد: ${rows(LADDER.slice(0, 3).map(subRow))}، ونستمرّ حتّى لا يبقى شيء.`,
      question: `أيّ هذه الأعداد يملأ الساقية ${A}؟`,
      a: A,
      options: LADDER_NUMS,
      answer: fills(A, LADDER_NUMS),
      after: `${rows(LADDER.slice(3).map(subRow))}. و $${chain(A, [G])}$ و $${chain(B, [G])}$: اللوح ${G} يملأ الساقيتين، وكلّ سطر يحفظ الألواح المشتركة: $${pgcd(A, B)} = ${pgcd(G, G)} = ${G}$.`,
      cue: 'من يكمل الأسطر على السبّورة بالقلم؟ ومتى نتوقّف؟',
    },
    {
      id: 'name-2',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: KEYS[1],
      recall: ['الأصغر من الأكبر', 'آخر فرق غير معدوم'],
      cue: 'بالفروق: ما القاسم المشترك الأكبر للعددين 45 و 27؟',
    },
    // 🧮 the same plank taken away several times: one division
    {
      id: 'baqi',
      kind: 'ask',
      chapter: 'نكتشف',
      title: `${P.a} و ${P.b}`,
      text: `ساقيتان: ${cellsOf(P.a)} و ${cellsOf(P.b)}. نقصّ من الأولى ${P.b} مرّة بعد مرّة: $${PEEL}$، أي $${divRow([P.a, P.b, PQ, PR])}$. ألواح ${P.b}: $${chain(P.b, smalls(P.b))}$.`,
      question: `أيّ ألواح الساقية ${P.b} يملأ القطعة ${PR}؟`,
      a: PR,
      options: P.planks,
      answer: fills(PR, P.planks),
      after: `${rows([chain(P.a, fills(P.a, P.planks)), rests(P.a, misses(P.a, P.planks))])}: الألواح نفسها تملأ ${P.a}، $${pgcd(P.a, P.b)} = ${pgcd(P.b, PR)} = ${gcd(P.a, P.b)}$.`,
      cue: `كم مرّة قصصنا ${P.b}؟ وأين نجد هذا العدد في القسمة؟`,
    },
    {
      id: 'name-3',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: KEYS[2],
      recall: ['باقي القسمة الإقليدية', 'سطر واحد'],
      cue: 'ما باقي قسمة 244 على 52؟ وبأيّ زوج نعوّض الزوج 244 و 52؟',
    },
    // 🔁 a division again and again: the ladder of divisions
    {
      id: 'iqlidis',
      kind: 'ask',
      chapter: 'نكتشف',
      title: `ساقيتان: ${E1} و ${E2}`,
      text: `ساقيتان: ${cellsOf(E1)} و ${cellsOf(E2)}. نقسم بدل أن نطرح: $${divRow(EU[0])}$، ثمّ نقسم ${E2} على الباقي: $${divRow(EU[1])}$، ونستمرّ حتّى يصير الباقي 0.`,
      question: `أيّ هذه الأعداد يملأ الساقية ${E1}؟`,
      a: E1,
      options: EU_NUMS,
      answer: fills(E1, EU_NUMS),
      after: `${rows(EU.slice(2).map(divRow))}. و $${chain(E1, [EG])}$ و $${chain(E2, [EG])}$: $${pgcd(E1, E2)} = ${EG}$.`,
      cue: `ما باقي قسمة ${EU[2][0]} على ${EU[2][1]}؟ ثمّ ماذا نقسم على ماذا؟`,
    },
    {
      id: 'name-4',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: KEYS[3],
      recall: ['على الباقي', 'آخر باقٍ غير معدوم'],
      cue: 'بإقليدس: كم قسمة للعددين 132 و 54؟ وما آخر باقٍ غير معدوم؟',
    },
    // ⏱️ a long stream and a very short one: two divisions, many subtractions
    {
      id: 'sibaq',
      kind: 'ask',
      chapter: 'نكتشف',
      title: `${R.a} و ${R.b}: كم خطوة؟`,
      text: `ساقيتان: ${cellsOf(R.a)} و ${cellsOf(R.b)}. قسمة واحدة: $${divRow(RACE[0])}$، مكان ${subtractionsOf(RACE[0][2])} للعدد ${R.b}. ألواح ${R.b}: $${chain(R.b, smalls(R.b))}$.`,
      question: `أيّ ألواح الساقية ${R.b} يملأ الساقية ${R.a}؟`,
      a: R.a,
      options: R.planks,
      answer: fills(R.a, R.planks),
      after: `$${divRow(RACE[1])}$: $${pgcd(R.a, R.b)} = ${RG}$؛ بالقسمة ${divisionsOf(S2.div)}، وبالفروق ${subtractionsOf(S2.sub)}. ومع ${A} و ${B}: ${divisionsOf(S0.div)} و ${subtractionsOf(S0.sub)}؛ ومع ${E1} و ${E2}: ${divisionsOf(S1.div)} و ${subtractionsOf(S1.sub)}.`,
      cue: `بالفروق: كم مرّة نطرح ${R.b} من ${R.a} قبل أن يبقى ${RACE[0][3]}؟`,
    },
    {
      id: 'name-5',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: KEYS[4],
      recall: ['حاصلها', 'تختصر'],
      cue: 'للعددين 410 و 12: كم عملية طرح؟ وكم قسمة؟',
    },
    // the copybook is three pages: the differences, the divisions, the choice
    {
      id: 'trace-1',
      kind: 'trace',
      chapter: 'نكتب',
      title: 'على الكرّاس: المفتاحان 1 و 2',
      tablets: [KEYS[0], KEYS[1]],
      cue: `بعد النقل: من يكتب أسطر الفروق للعددين ${A} و ${B} دون أن ينظر؟`,
    },
    {
      id: 'trace-2',
      kind: 'trace',
      chapter: 'نكتب',
      title: 'على الكرّاس: المفتاحان 3 و 4',
      tablets: [KEYS[2], KEYS[3]],
      cue: 'بعد النقل: بماذا يختلف سطر القسمة عن سطر الطرح؟',
    },
    {
      id: 'trace-3',
      kind: 'trace',
      chapter: 'نكتب',
      title: 'على الكرّاس: المفتاح 5',
      tablets: [KEYS[4]],
      cue: 'بعد النقل: متى تربح القسمة خطوات كثيرة؟',
    },
  ],
};

/** For the memo and the tests: the ladders and the counts of steps the board writes. */
export const LADDERS = { differences: LADDER, euclid: EU, race: RACE, steps: { carpenter: S0, euclid: S1, race: S2 } };
