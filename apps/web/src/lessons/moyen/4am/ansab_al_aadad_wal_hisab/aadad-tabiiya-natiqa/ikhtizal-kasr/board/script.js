/**
 * « الدرس على السبّورة » of this lesson — the STEPS the class goes through together (CLASS_SESSION.md §5ter).
 * The kinds of step and what the board does with each: `features/classSession/lessonScripts.js`.
 * Reached only through the lesson's pack (`lesson.pack.js › board.script`).
 *
 * The idea of the student's world, on the board's own numbers: a bridge whose stretch is LIT; its sign is the fraction
 * « lit cells over all the cells ». A plank of one length rewrites the sign only when it fills BOTH the lit stretch and
 * the whole bridge (a joint falls where the light ends). The hour opens on the carpenter of the board (a bridge of 96
 * cells, 60 of them lit — never the student's story): his plank of 8 fills the bridge, not the lit stretch. Then the four
 * keys, in the order of the student's world, each met by ONE question made for it and PROVED by the bridges the board
 * builds before its name:
 *   🪜 the planks of the lit stretch 60 tried on the bridge 96: 2, 3, 4 and 6 fill both — the sign is rewritten again and
 *      again, 60/96 = 30/48 = 15/24 = 5/8 (`ikhtizal-marahil`);
 *   🔒 63 lit of 80: of the planks of the lit stretch only 1 fills the bridge — the sign cannot be rewritten
 *      (`ghayr-qabil`);
 *   🎯 304 lit of 368: the divisions of Euclid, then the planks of the lit stretch tried on the bridge — 4, 8 and 16; the
 *      longest is the last remainder before 0, and ONE division by it writes 19/23 (`ikhtizal-pgcd`, 94 of the bank's 149
 *      questions: the richest station — the ladder in two parts, six cards, the model line « a/b = (a ÷ g)/(b ÷ g) »);
 *   🧾 a product computed, 11/20 × 15/22 = 165/440: the planks 5, 11 and 55 fill both, and the result is given 3/8
 *      (`natija-mukhtazala`).
 * No `forge`/`bridges` step: the keys are forged by each student in his world. Every question is about planks over a
 * bridge: the board's own words (« لوح », « يثبت / ينهار ») are right, no `ask` needs its own `words`.
 * What the board cannot draw (no station has it): a bridge with its LIT stretch, and a fraction with its bar under a
 * bridge. The nearest honest version, lesson 7's: the options are planks OF THE LIT STRETCH (written with their
 * equalities in the text), tried on the WHOLE bridge (`a`); the fractions are formulas of the text and of `after`.
 * The numbers are the board's own (`BOARD`), never the story's nor a pair of the lesson's exercise bank;
 * `board.test.js` computes every one of them. A `cue` is at most 70 characters, holds no Latin and no formula; nothing
 * the class reads before a name holds that name.
 */
import { cellsOf } from '../../../../../../../features/classSession/lessonScripts';

/** The four keys of the lesson (the tablets of the student's world, `world/story.js › TABLETS`), in order. */
export const KEYS = ['ikhtizal-marahil', 'ghayr-qabil', 'ikhtizal-pgcd', 'natija-mukhtazala'];

/** The board's numbers — ONE place: the script, the memo and the tests read them from here. */
export const BOARD = {
  /** The carpenter: a bridge of 96 cells, 60 lit; his plank of 8 fills the bridge, not the lit stretch. */
  bridge: { lit: 60, whole: 96, first: 8 },
  /** 🪜 the planks of the lit stretch shown, and the divisors of each stage (2, then 2, then 3). */
  stages: { tried: [2, 3, 4, 5, 6, 10], by: [2, 2, 3] },
  /** 🔒 63 lit of 80: neither number is prime, and only the plank 1 fills both. */
  locked: { lit: 63, whole: 80 },
  /** 🎯 304 lit of 368: the divisions of Euclid, then six planks of the lit stretch tried on the bridge. */
  euclid: { lit: 304, whole: 368, tried: [4, 8, 16, 19, 38, 76] },
  /** 🧾 the product 11/20 × 15/22 = 165/440: six planks of the lit stretch tried on the bridge. */
  result: { x: [11, 20], y: [15, 22], tried: [3, 5, 11, 15, 33, 55] },
};
const { bridge: BR, stages: ST, locked: LK, euclid: EU, result: RE } = BOARD;

/** Formulas one after the other: a no-break space BEFORE each comma, so a line never starts with « ، ». */
const SEP = ' ، ';
const rows = (fs) => fs.map((f) => `$${f}$`).join(SEP);
export const pgcd = (a, b) => `\\mathrm{PGCD}(${a} ; ${b})`;
export const frac = (n, d) => `\\frac{${n}}{${d}}`;
/** « n = d1 × k1 = d2 × k2 = … », every factor computed. */
export const chain = (n, ds) => `${n} = ${ds.map((d) => `${d} \\times ${n / d}`).join(' = ')}`;
/** All the divisors of n, smallest first. */
export const divisorsOf = (n) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);
const fills = (a, list) => list.filter((o) => a % o === 0);
export const gcd = (x, y) => (y ? gcd(y, x % y) : x);

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

/** The stages: the fraction after each division, the first one included — [[60, 96], [30, 48], [15, 24], [5, 8]]. */
export function stagesOf(n, d, by) {
  const out = [[n, d]];
  for (const k of by) {
    const [x, y] = out.at(-1);
    out.push([x / k, y / k]);
  }
  return out;
}
const STAGES = stagesOf(BR.lit, BR.whole, ST.by);
const LAST = STAGES.at(-1);
const LK_PLANKS = divisorsOf(LK.lit);
const EU_LADDER = divisions(EU.lit, EU.whole);
const EU_G = gcd(EU.lit, EU.whole);
const RE_N = RE.x[0] * RE.y[0];
const RE_D = RE.x[1] * RE.y[1];
const RE_LADDER = divisions(RE_N, RE_D);
const RE_G = gcd(RE_N, RE_D);

export const SCRIPT = {
  title: 'اختزال كسر',
  steps: [
    {
      id: 'situation',
      kind: 'situation',
      chapter: 'نكتشف',
      title: 'جسر ولافتة',
      text: `جسر من ${cellsOf(BR.whole)}، أُضيء منها ${cellsOf(BR.lit)}: على لافتته الكسر $${frac(BR.lit, BR.whole)}$. يريد النجّار أن يكتب اللافتة بألواح أطول من خانة، كلّها بطول واحد. اللوح ${BR.first} يملأ الجسر كلّه: $${chain(BR.whole, [BR.first])}$.`,
      question: `هل يملأ اللوح ${BR.first} الجزء المضاء؟`,
      bridge: { a: BR.lit, b: BR.first },
      cue: 'أين ينتهي الضوء؟ وأيّ لوح يملأ الجزء المضاء والجسر معًا؟',
    },
    // 🪜 the planks of the lit stretch tried on the bridge: several fill both — the sign is rewritten stage by stage
    {
      id: 'marahil',
      kind: 'ask',
      chapter: 'نكتشف',
      title: `ألواح ${BR.lit} على ${BR.whole}`,
      text: `اللوح ${BR.first} لا يملأ الجزء المضاء: $${divRow([BR.lit, BR.first, Math.floor(BR.lit / BR.first), BR.lit % BR.first])}$. هذه الألواح تملأ الجزء المضاء: ${rows([chain(BR.lit, ST.tried.slice(0, 3)), chain(BR.lit, ST.tried.slice(3, 5))])}.`,
      question: `أيّ هذه الألواح يملأ الجسر كلّه، ${cellsOf(BR.whole)}؟`,
      a: BR.whole,
      options: ST.tried,
      answer: fills(BR.whole, ST.tried),
      after: `نقسم البسط والمقام على ${ST.by[0]}، ثمّ على ${ST.by[1]}، ثمّ على ${ST.by[2]}: $${STAGES.map(([n, d]) => frac(n, d)).join(' = ')}$.`,
      cue: `هل يوجد لوح غير 1 يملأ ${cellsOf(LAST[0])} و ${cellsOf(LAST[1])} معًا؟`,
    },
    {
      id: 'name-1',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: KEYS[0],
      recall: ['قاسم مشترك', 'ما دام'],
      cue: 'الكسر 64 على 88: على أيّ عدد نقسم أوّلًا؟ ثمّ على أيّ عدد؟',
    },
    // 🔒 only the plank 1 fills both: the sign cannot be rewritten
    {
      id: 'ghayr',
      kind: 'ask',
      chapter: 'نكتشف',
      title: `جسر: ${LK.lit} من ${LK.whole}`,
      text: `جسر من ${cellsOf(LK.whole)}، أُضيء منها ${cellsOf(LK.lit)}: $${frac(LK.lit, LK.whole)}$. ألواح الجزء المضاء: $${chain(
        LK.lit,
        LK_PLANKS.filter((d) => d * d <= LK.lit),
      )}$.`,
      question: `أيّ ألواح الجزء المضاء يملأ الجسر كلّه، ${cellsOf(LK.whole)}؟`,
      a: LK.whole,
      options: LK_PLANKS,
      answer: fills(LK.whole, LK_PLANKS),
      after: `اللوح 1 وحده: $${pgcd(LK.whole, LK.lit)} = 1$. لا لوح أطول يكتب اللافتة من جديد، مع أنّ ${LK.lit} و ${LK.whole} ليسا عددين أوّليّين: $${LK.lit} = 7 \\times 9$ و $${LK.whole} = 8 \\times 10$.`,
      cue: `والكسر ${LAST[0]} على ${LAST[1]} في المحطّة السابقة: هل كان يمكن أن نواصل؟`,
    },
    {
      id: 'name-2',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: KEYS[1],
      recall: ['أوّليّين فيما بينهما', 'الوحيد'],
      cue: 'الكسر 46 على 75: هل يمكن اختزاله؟ أيّ لوح يملأ 46 و 75 معًا؟',
    },
    // 🎯 the divisions of Euclid, then the planks of the lit stretch tried on the bridge: the longest is the PGCD
    {
      id: 'pgcd',
      kind: 'ask',
      chapter: 'نكتشف',
      title: `جسر: ${EU.lit} من ${EU.whole}`,
      text: `جسر من ${cellsOf(EU.whole)}، أُضيء منها ${cellsOf(EU.lit)}: $${frac(EU.lit, EU.whole)}$. نقسم كما في خوارزمية إقليدس: ${rows(EU_LADDER.slice(0, 2).map(divRow))}، ونستمرّ حتّى يصير الباقي 0. ألواح الجزء المضاء: $${chain(EU.lit, EU.tried.slice(0, 3))}$.`,
      question: `أيّ هذه الألواح يملأ الجسر كلّه، ${cellsOf(EU.whole)}؟`,
      a: EU.whole,
      options: EU.tried,
      answer: fills(EU.whole, EU.tried),
      after: `${rows(EU_LADDER.slice(2).map(divRow))}: $${pgcd(EU.whole, EU.lit)} = ${EU_G}$، أطول لوح يملأ الاثنين. نقسم على ${EU_G} مرّة واحدة: $${frac(EU.lit, EU.whole)} = \\frac{${EU.lit} \\div ${EU_G}}{${EU.whole} \\div ${EU_G}} = ${frac(EU.lit / EU_G, EU.whole / EU_G)}$.`,
      cue: `لو قسمنا على ${EU.tried[1]} بدل ${EU_G}، فماذا يبقى علينا أن نفعل؟`,
    },
    {
      id: 'name-3',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: KEYS[2],
      recall: ['قاسمهما المشترك الأكبر', 'مباشرةً'],
      cue: 'الكسر 155 على 186: على أيّ عدد نقسم لنصل إلى النهاية في خطوة؟',
    },
    // 🧾 a product computed: its result is rewritten until only the plank 1 is left
    {
      id: 'natija',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'نتيجة جداء',
      text: `يحسب تلميذ: $${frac(...RE.x)} \\times ${frac(...RE.y)} = ${frac(RE_N, RE_D)}$. جسر من ${cellsOf(RE_D)}، أُضيء منها ${cellsOf(RE_N)}. ألواح الجزء المضاء: $${chain(RE_N, RE.tried.slice(0, 3))}$.`,
      question: `أيّ هذه الألواح يملأ الجسر كلّه، ${cellsOf(RE_D)}؟`,
      a: RE_D,
      options: RE.tried,
      answer: fills(RE_D, RE.tried),
      after: `${rows(RE_LADDER.map(divRow))}: $${pgcd(RE_D, RE_N)} = ${RE_G}$، فالنتيجة تُكتب $${frac(...RE.x)} \\times ${frac(...RE.y)} = ${frac(RE_N / RE_G, RE_D / RE_G)}$.`,
      cue: `هل الجواب ${RE_N} على ${RE_D} خاطئ؟ وماذا ينقصه؟`,
    },
    {
      id: 'name-4',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: KEYS[3],
      recall: ['أوّلًا', 'الشكل غير القابل للاختزال'],
      cue: 'احسب 23 على 84 زائد 49 على 84، وأعطِ النتيجة كما يجب.',
    },
    // the copybook is two pages: reducing by stages and the fraction that stays, then the PGCD and the result
    {
      id: 'trace-1',
      kind: 'trace',
      chapter: 'نكتب',
      title: 'على الكرّاس: المفتاحان 1 و 2',
      tablets: [KEYS[0], KEYS[1]],
      cue: `بعد النقل: من يكتب مراحل الكسر ${BR.lit} على ${BR.whole} دون أن ينظر؟`,
    },
    {
      id: 'trace-2',
      kind: 'trace',
      chapter: 'نكتب',
      title: 'على الكرّاس: المفتاحان 3 و 4',
      tablets: [KEYS[2], KEYS[3]],
      cue: `من يكتب سطر الكسر ${EU.lit} على ${EU.whole} بقسمة واحدة؟`,
    },
  ],
};

/** For the memo and the tests: the stages, the two ladders the board writes, and the two PGCDs. */
export const LADDERS = { stages: STAGES, euclid: EU_LADDER, result: RE_LADDER, g: { euclid: EU_G, result: RE_G } };
