/**
 * « الدرس على السبّورة » of this lesson — the STEPS the class goes through together (CLASS_SESSION.md §5ter).
 * The kinds of step and what the board does with each: `features/classSession/lessonScripts.js`.
 * Reached only through the lesson's pack (`lesson.pack.js › board.script`).
 *
 * The lesson before it says WHAT the PGCD is; this one teaches how to FIND it. The hour opens on the carpenter of the
 * board (his own numbers: two streams of 40 and 56 cells, planks of ONE length, the longest — never the student's
 * story): he tries a plank of 10. Then the three keys, in the order of the student's world, each met by questions made
 * for it and PROVED by the bridges the board builds before its name:
 *   📋 the two lists written by pairs, then the planks in both, then the longest (`list-a`, `list-b`, `cross`);
 *   ⚡ the direct results: two streams of the same length, a stream filled in (0 cells), the order of the two numbers
 *      (`same`, `zero`);
 *   🎯 the shorter stream fills the longer one (`nest`), against a pair where it does not (`against`).
 * No `forge`/`bridges` step: the three keys are forged by each student in his world. Every question is about planks
 * over a stream: the board's own words (« لوح », « يثبت / ينهار ») are right, no `ask` needs its own `words`.
 * An `ask` builds every plank over ONE gap: each question is chosen so that the planks that fill that gap are exactly
 * the answer — the other stream is settled in the text, with its equalities (`board.test.js` computes both).
 * The numbers are the board's own (`BOARD`), never the story's nor a pair of the lesson's exercise bank;
 * `board.test.js` computes every one of them. A `cue` is at most 70 characters; nothing the class reads before a name
 * holds that name.
 */
import { cellsOf } from '../../../../../../../features/classSession/lessonScripts';

/** The three keys of the lesson (the tablets of the student's world, `world/story.js › TABLETS`), in order. */
export const KEYS = ['hasr-wa-taqatu', 'nataij-mubashira', 'b-yaqsim-a'];

/** The board's numbers — ONE place: the script, the memo and the tests read them from here. */
export const BOARD = {
  /** The carpenter: his two streams and the plank he tries first. */
  streams: [40, 56],
  first: 10,
  /** The planks tried after 1 and 2 on each stream (📋), then the planks of 40 from 4 up tried on 56. */
  tryA: [3, 4, 5, 6],
  tryB: [3, 4, 5, 6, 7],
  cross: [4, 5, 8, 10, 20, 40],
  /** ⚡ two streams of the same length; a stream and a stream filled in (0 cells). */
  same: { gap: 35, planks: [5, 7, 10, 15, 35] },
  zero: { gap: 26, planks: [2, 4, 13, 26, 52] },
  /** 🎯 the shorter stream fills the longer; then a pair where it does not. */
  nest: { small: 14, big: 70, planks: [2, 5, 7, 10, 14, 35] },
  against: { small: 24, big: 60, planks: [3, 4, 6, 8, 12, 24] },
};
const {
  streams: [A, B],
  first: F,
  same: S,
  zero: Z,
  nest: N,
  against: V,
} = BOARD;

const gcd = (x, y) => (y ? gcd(y, x % y) : x);
const divisorsOf = (n) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);
const commonOf = (a, b) => divisorsOf(a).filter((d) => b % d === 0);
/** A list as the board prints it: a no-break space BEFORE each comma, so a line never starts with « ، ». */
const listAr = (xs) => xs.join(' ، ');
/** « 4 و 6 و 12 ». */
const and = (xs) => xs.join(' و ');
const pgcd = (a, b) => `\\mathrm{PGCD}(${a} ; ${b})`;
/** « n = d1 × k1 = d2 × k2 = … », every factor computed. */
const chain = (n, ds) => `${n} = ${ds.map((d) => `${d} \\times ${n / d}`).join(' = ')}`;
/** « n = d1 × q1 + r1 = d2 × q2 + r2 … », every quotient and remainder computed. */
const rests = (n, ds) =>
  `${n} = ${ds.map((d) => `${d} \\times ${Math.floor(n / d)}${n % d ? ` + ${n % d}` : ''}`).join(' = ')}`;
/** The divisors of n that are at most its square root: one per pair. */
const smalls = (n) => divisorsOf(n).filter((d) => d * d <= n);
/** The first number not tried: its square passes n. */
const stopOf = (n) => Math.floor(Math.sqrt(n)) + 1;
const fills = (a, list) => list.filter((o) => a % o === 0);
const misses = (a, list) => list.filter((o) => a % o !== 0);

const COMMON = commonOf(A, B);
const G = gcd(A, B);
const SA = stopOf(A);
const SB = stopOf(B);

export const SCRIPT = {
  title: 'تعيين القاسم المشترك الأكبر لعددين طبيعيين',
  steps: [
    {
      id: 'situation',
      kind: 'situation',
      chapter: 'نكتشف',
      title: 'ألواح النجّار',
      text: `يصنع النجّار ألواحًا كلّها بطول واحد لجسرين فوق ساقيتين: الأولى ${cellsOf(A)} والثانية ${cellsOf(B)}. يريد أطول لوح يملأ الساقيتين معًا دون أن يقطعه. يجرّب لوحًا طوله ${F}.`,
      question: `هل يملأ اللوح ${F} الساقية الأولى؟`,
      bridge: { a: A, b: F },
      cue: `والساقية ${B}: هل يملؤها اللوح ${F}؟ كيف نجد أطول لوح؟`,
    },
    {
      id: 'list-a',
      kind: 'ask',
      chapter: 'نكتشف',
      title: `ألواح الساقية ${A}، زوجًا زوجًا`,
      text: `نجرّب الألواح بالترتيب، وكلّ لوح يملأ الساقية يأتي مع شريكه: $${chain(A, [1, 2])}$.`,
      question: `أيّ هذه الألواح يملأ الساقية ${A} أيضًا؟`,
      a: A,
      options: BOARD.tryA,
      answer: fills(A, BOARD.tryA),
      after: `$${chain(A, fills(A, BOARD.tryA))}$، أمّا $${rests(A, misses(A, BOARD.tryA))}$. ولا نجرّب ${SA}: $${SA} \\times ${SA} = ${SA * SA}$ أكبر من ${A}. قواسم ${A} هي ${listAr(divisorsOf(A))}.`,
      cue: `لماذا نتوقّف قبل ${SA}؟ ومن أين جاء ${A / 5} و ${A / 4}؟`,
    },
    {
      id: 'list-b',
      kind: 'ask',
      chapter: 'نكتشف',
      title: `ألواح الساقية ${B}، زوجًا زوجًا`,
      text: `بالطريقة نفسها: $${chain(B, [1, 2])}$.`,
      question: `أيّ هذه الألواح يملأ الساقية ${B} أيضًا؟`,
      a: B,
      options: BOARD.tryB,
      answer: fills(B, BOARD.tryB),
      after: `$${chain(B, fills(B, BOARD.tryB))}$، أمّا $${rests(B, misses(B, BOARD.tryB))}$. ولا نجرّب ${SB}: $${SB} \\times ${SB} = ${SB * SB}$ أكبر من ${B}. قواسم ${B} هي ${listAr(divisorsOf(B))}.`,
      cue: `هل نسينا لوحًا؟ كم لوحًا يملأ الساقية ${B}؟`,
    },
    {
      id: 'cross',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'القائمتان جنبًا إلى جنب',
      text: `قواسم ${A} هي ${listAr(divisorsOf(A))}، وقواسم ${B} هي ${listAr(divisorsOf(B))}. اللوحان 1 و 2 في القائمتين: $${chain(B, [1, 2])}$.`,
      question: `أيّ ألواح الساقية ${A} يملأ الساقية ${B} أيضًا؟`,
      a: B,
      options: BOARD.cross,
      answer: fills(B, BOARD.cross),
      after: `$${chain(B, fills(B, BOARD.cross))}$، و ${and(misses(B, BOARD.cross))} ليست في قائمة ${B}. الألواح التي في القائمتين: ${listAr(COMMON)}، وأطولها ${G}: $${pgcd(A, B)} = ${G}$.`,
      cue: `هل في القائمتين لوح أطول من ${G}؟ كيف نتأكّد؟`,
    },
    {
      id: 'name-1',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: KEYS[0],
      recall: ['المشتركة', 'أكبرها'],
      cue: 'كيف نعيّن القاسم المشترك الأكبر للعددين 12 و 30؟',
    },
    {
      id: 'same',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'ساقيتان بالطول نفسه',
      text: `ساقيتان جديدتان، كلتاهما ${cellsOf(S.gap)}: قائمة الأولى هي قائمة الثانية.`,
      question: 'أيّ الألواح يملأ الساقيتين معًا؟',
      a: S.gap,
      options: S.planks,
      answer: fills(S.gap, S.planks),
      after: `$${chain(S.gap, smalls(S.gap))}$: قواسم ${S.gap} هي ${listAr(divisorsOf(S.gap))}، وأطول لوح يملأ الساقيتين ${S.gap} نفسه: $${pgcd(S.gap, S.gap)} = ${S.gap}$.`,
      cue: 'هل احتجنا إلى قائمتين هنا؟ وما أطول لوح؟',
    },
    {
      id: 'zero',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'ساقية مردومة',
      text: `ساقية من ${cellsOf(Z.gap)}، وساقية أخرى رُدمت فلم يبق منها شيء: طولها 0. كلّ لوح يملؤها دون أن يبقى شيء: $0 = ${misses(
        Z.gap,
        Z.planks,
      )
        .map((d) => `${d} \\times 0`)
        .join(' = ')}$.`,
      question: 'أيّ الألواح يصلح للساقيتين معًا؟',
      a: Z.gap,
      options: Z.planks,
      answer: fills(Z.gap, Z.planks),
      after: `كلّ عدد يقسم 0، فالألواح المشتركة هي ألواح ${Z.gap}: ${listAr(divisorsOf(Z.gap))}، وأطولها ${Z.gap}: $${pgcd(Z.gap, 0)} = ${Z.gap}$. وترتيب الساقيتين لا يغيّر الألواح: $${pgcd(B, A)} = ${gcd(B, A)}$ أيضًا.`,
      cue: `هل يملأ اللوح ${Z.planks.at(-1)} الساقية ${Z.gap}؟ وهل يقسم 0؟`,
    },
    {
      id: 'name-2',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: KEYS[1],
      recall: ['غير معدوم', 'ترتيب العددين'],
      cue: 'ما القاسم المشترك الأكبر للعددين 9 و 9؟ وللعددين 9 و 0؟',
    },
    {
      id: 'nest',
      kind: 'ask',
      chapter: 'نكتشف',
      title: `ساقيتان: ${N.small} و ${N.big}`,
      text: `ساقيتان: ${cellsOf(N.small)} و ${cellsOf(N.big)}، و $${N.big} = ${N.small} \\times ${N.big / N.small}$. ألواح ${N.big}: $${chain(N.big, smalls(N.big))}$.`,
      question: `أيّ ألواح الساقية ${N.big} يملأ الساقية ${N.small}؟`,
      a: N.small,
      options: N.planks,
      answer: fills(N.small, N.planks),
      after: `${and(fills(N.small, N.planks))}، ومعها 1: هي ألواح ${N.small} كلّها، $${chain(N.small, smalls(N.small))}$. وأطولها ${N.small}: $${pgcd(N.big, N.small)} = ${gcd(N.big, N.small)}$.`,
      cue: `لماذا كلّ لوح يملأ ${N.small} يملأ ${N.big} أيضًا؟`,
    },
    {
      id: 'against',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'وإن لم يملأ الأقصر الأطول؟',
      text: `ساقيتان: ${cellsOf(V.small)} و ${cellsOf(V.big)}. ألواح ${V.small}: $${chain(V.small, smalls(V.small))}$.`,
      question: `أيّ ألواح الساقية ${V.small} يملأ الساقية ${V.big}؟`,
      a: V.big,
      options: V.planks,
      answer: fills(V.big, V.planks),
      after: `$${rests(V.big, misses(V.big, V.planks).reverse())}$: اللوحان ${and(misses(V.big, V.planks).reverse())} لا يملآن ${V.big}. أطول لوح مشترك ${gcd(V.small, V.big)}، لا ${V.small}: $${pgcd(V.small, V.big)} = ${gcd(V.small, V.big)}$.`,
      cue: 'متى يكون أصغر العددين قاسمهما المشترك الأكبر؟',
    },
    {
      id: 'name-3',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: KEYS[2],
      recall: ['قاسمًا للعدد', 'نفسه'],
      cue: 'ما القاسم المشترك الأكبر للعددين 13 و 91؟',
    },
    // the copybook is two pages: the first key alone (its tablet holds the two lists), then the two short keys
    {
      id: 'trace-1',
      kind: 'trace',
      chapter: 'نكتب',
      title: 'على الكرّاس: المفتاح 1',
      tablets: [KEYS[0]],
      cue: 'بعد النقل: من يعيد المراحل الثلاث دون أن ينظر إلى السبّورة؟',
    },
    {
      id: 'trace-2',
      kind: 'trace',
      chapter: 'نكتب',
      title: 'على الكرّاس: المفتاحان 2 و 3',
      tablets: [KEYS[1], KEYS[2]],
      cue: 'بعد النقل: متى نعرف القاسم المشترك الأكبر دون قوائم؟',
    },
  ],
};
