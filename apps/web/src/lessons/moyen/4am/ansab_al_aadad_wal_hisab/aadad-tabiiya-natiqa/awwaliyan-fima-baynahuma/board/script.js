/**
 * « الدرس على السبّورة » of this lesson — the STEPS the class goes through together (CLASS_SESSION.md §5ter).
 * The kinds of step and what the board does with each: `features/classSession/lessonScripts.js`.
 * Reached only through the lesson's pack (`lesson.pack.js › board.script`).
 *
 * The lesson before it found the PGCD by Euclid; here the PGCD is 1. The hour opens on the carpenter of the board (his
 * own numbers: two streams of 64 and 55 cells, planks of ONE length, the longest — never the student's story): his plank
 * of 8 fills the first, not the second. Then the three keys, in the order of the student's world, each met by ONE
 * question made for it and PROVED by the bridges the board builds before its name:
 *   🤝 the planks of 55 tried on 64: only the plank 1 fills both — PGCD(64 ; 55) = 1, and neither number is prime
 *      (`awwaliyan`);
 *   ✅ the ladder of divisions of 799 and 366 (neither prime): which of its numbers fills 799 — only the last remainder
 *      before 0, which is 1; the `after` writes the sentence of the proof « PGCD(799 ; 366) = 1 إذن … »
 *      (`ithbat-awwaliyan`, 113 of the bank's 180 questions: the richest station — five rows, five cards, the sentence);
 *   ❌ 847 and 413: the planks 2, 3 and 5 fill neither — had the class stopped there it would have « seen none »; the
 *      plank 7 fills both, and ONE common plank other than 1 is enough, no PGCD computed (`shahid-wahid`).
 * No `forge`/`bridges` step: the three keys are forged by each student in his world. Every question is about planks
 * over a stream: the board's own words (« لوح », « يثبت / ينهار ») are right, no `ask` needs its own `words`.
 * A question about TWO streams is asked over ONE gap (lesson 4's way, CLASS_SESSION.md §5ter): the options are planks of
 * the other stream, written with their equalities in the text, so the planks that fill the gap ARE the answer.
 * The numbers are the board's own (`BOARD`), never the story's nor a pair of the lesson's exercise bank;
 * `board.test.js` computes every one of them. A `cue` is at most 70 characters, holds no Latin and no formula; nothing
 * the class reads before a name holds that name.
 */
import { cellsOf } from '../../../../../../../features/classSession/lessonScripts';

/** The three keys of the lesson (the tablets of the student's world, `world/story.js › TABLETS`), in order. */
export const KEYS = ['awwaliyan', 'ithbat-awwaliyan', 'shahid-wahid'];

/** The board's numbers — ONE place: the script, the memo and the tests read them from here. */
export const BOARD = {
  /** The carpenter: his two streams and the plank he tries first (it fills the first, not the second). */
  streams: [64, 55],
  first: 8,
  /** ✅ two long streams, neither a prime number: the ladder of divisions ends on the remainder 1. */
  euclid: [799, 366],
  /** ❌ two streams: planks the divisibility rules try (2, 3, 5) fill neither; the plank 7 fills both. */
  witness: { a: 847, b: 413, tried: [2, 3, 5], plank: 7 },
};
const {
  streams: [A, B],
  first: F,
  euclid: [E1, E2],
  witness: W,
} = BOARD;

/** Formulas one after the other: a no-break space BEFORE each comma, so a line never starts with « ، ». */
const rows = (fs) => fs.map((f) => `$${f}$`).join(' ، ');
export const pgcd = (a, b) => `\\mathrm{PGCD}(${a} ; ${b})`;
/** « n = d1 × k1 = d2 × k2 = … », every factor computed. */
const chain = (n, ds) => `${n} = ${ds.map((d) => `${d} \\times ${n / d}`).join(' = ')}`;
/** The divisors of n that are at most its square root: one per pair. */
const smalls = (n) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0 && d * d <= n);
/** All the divisors of n, smallest first. */
export const divisorsOf = (n) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);
const fills = (a, list) => list.filter((o) => a % o === 0);

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
export const divRow = ([x, y, q, r]) => `${x} = ${y} \\times ${q} + ${r}`;

const AWW = divisorsOf(B);
const EU = divisions(E1, E2);
/** The numbers the ladder of divisions writes: the divisor, then every remainder before 0. */
const EU_NUMS = [E2, ...EU.map((r) => r[3]).filter((r) => r > 0)];
const WO = [...W.tried, W.plank];

export const SCRIPT = {
  title: 'العددان الأوّليّان فيما بينهما',
  steps: [
    {
      id: 'situation',
      kind: 'situation',
      chapter: 'نكتشف',
      title: 'ساقيتان ولوح واحد',
      text: `يبني النجّار جسرين فوق ساقيتين: الأولى ${cellsOf(A)} والثانية ${cellsOf(B)}، بألواح كلّها بطول واحد، أطول ما يمكن ودون قطع. يجرّب لوحًا طوله ${F}.`,
      question: `هل يملأ اللوح ${F} الساقية الأولى؟`,
      bridge: { a: A, b: F },
      cue: `والساقية ${B}: هل يملؤها اللوح ${F}؟ وأيّ لوح يملأ الساقيتين معًا؟`,
    },
    // 🤝 the planks of the second stream tried on the first: only 1
    {
      id: 'mushtarak',
      kind: 'ask',
      chapter: 'نكتشف',
      title: `ألواح ${B} على ${A}`,
      text: `اللوح ${F} لا يملأ الساقية ${B}: $${divRow([B, F, Math.floor(B / F), B % F])}$. ألواح الساقية ${B}: $${chain(B, smalls(B))}$.`,
      question: `أيّ ألواح الساقية ${B} يملأ الساقية ${A}؟`,
      a: A,
      options: AWW,
      answer: fills(A, AWW),
      after: `اللوح 1 وحده يملأ الساقيتين: $${pgcd(A, B)} = 1$. ومع ذلك لا ${A} ولا ${B} عدد أوّليّ: $${A} = 2 \\times ${A / 2}$ و $${B} = 5 \\times ${B / 5}$.`,
      cue: 'هل يوجد لوح يملأ كلّ ساقية مهما كان طولها؟',
    },
    {
      id: 'name-1',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: KEYS[0],
      recall: ['قاسمهما المشترك الوحيد'],
      cue: 'هل العددان 16 و 33 أوّليّان فيما بينهما؟ وما لوحهما المشترك؟',
    },
    // ✅ the ladder of divisions of two numbers that are not prime, down to the remainder 1 — then the sentence
    {
      id: 'ithbat',
      kind: 'ask',
      chapter: 'نكتشف',
      title: `ساقيتان: ${E1} و ${E2}`,
      text: `ساقيتان: ${cellsOf(E1)} و ${cellsOf(E2)}، وليس أيّ من العددين أوّليًّا. نقسم كما في خوارزمية إقليدس: ${rows(EU.slice(0, 2).map(divRow))}، ونستمرّ حتّى يصير الباقي 0.`,
      question: `أيّ هذه الأعداد يملأ الساقية ${E1}؟`,
      a: E1,
      options: EU_NUMS,
      answer: fills(E1, EU_NUMS),
      after: `${rows(EU.slice(2).map(divRow))}. آخر باقٍ غير معدوم هو 1: $${pgcd(E1, E2)} = 1$ إذن العددان ${E1} و ${E2} أوّليّان فيما بينهما.`,
      cue: `ما باقي قسمة ${EU[2][0]} على ${EU[2][1]}؟ ثمّ ماذا نقسم على ماذا؟`,
    },
    {
      id: 'name-2',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: KEYS[1],
      recall: ['آخر باقٍ غير معدوم', 'إذن'],
      cue: 'للعددين 91 و 62: اكتب القسمات، ثمّ الجملة كاملة حتّى «أوّليّان».',
    },
    // ❌ the planks of the divisibility rules fill neither stream; ONE plank other than 1 fills both
    {
      id: 'shahid',
      kind: 'ask',
      chapter: 'نكتشف',
      title: `ساقيتان: ${W.a} و ${W.b}`,
      text: `ساقيتان: ${cellsOf(W.a)} و ${cellsOf(W.b)}. الألواح ${W.tried.join(' و ')} لا تملأ الساقية ${W.a}، أمّا اللوح ${W.plank} فيملؤها: $${chain(W.a, [W.plank])}$.`,
      question: `أيّ هذه الألواح يملأ الساقية ${W.b}؟`,
      a: W.b,
      options: WO,
      answer: fills(W.b, WO),
      after: `$${chain(W.b, [W.plank])}$ و $${chain(W.a, [W.plank])}$: اللوح ${W.plank} يملأ الساقيتين، لوح مشترك غير 1، فالعددان ${W.a} و ${W.b} ليسا أوّليّين فيما بينهما — دون أن نحسب قاسمهما المشترك الأكبر.`,
      cue: `لو توقّفنا عند اللوح ${W.tried.at(-1)}، ماذا كنّا سنقول؟ وهل كنّا على حقّ؟`,
    },
    {
      id: 'name-3',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: KEYS[2],
      recall: ['يختلف عن 1', 'فلا نستنتج شيئًا'],
      cue: 'دون حساب: لماذا ليس العددان 115 و 65 أوّليّين فيما بينهما؟',
    },
    // the copybook is two pages: the notion and its proof, then the proof that they are not
    {
      id: 'trace-1',
      kind: 'trace',
      chapter: 'نكتب',
      title: 'على الكرّاس: المفتاحان 1 و 2',
      tablets: [KEYS[0], KEYS[1]],
      cue: `بعد النقل: من يكتب جملة الإثبات للعددين ${A} و ${B} دون أن ينظر؟`,
    },
    {
      id: 'trace-2',
      kind: 'trace',
      chapter: 'نكتب',
      title: 'على الكرّاس: المفتاح 3',
      tablets: [KEYS[2]],
      cue: '«جرّبت 2 و 3 و 5 فلم يملأ أيّ منها الساقيتين»: هل هذا إثبات؟',
    },
  ],
};

/** For the memo and the tests: the ladder the board writes. */
export const LADDERS = { euclid: EU };
