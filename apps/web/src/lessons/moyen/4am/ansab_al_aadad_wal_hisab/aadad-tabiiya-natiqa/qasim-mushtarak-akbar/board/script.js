/**
 * « الدرس على السبّورة » of this lesson — the STEPS the class goes through together (CLASS_SESSION.md §5ter).
 * The kinds of step and what the board does with each: `features/classSession/lessonScripts.js`.
 * Reached only through the lesson's pack (`lesson.pack.js › board.script`).
 *
 * The hour opens on the florist of the board (her own flowers: 36 roses and 60 lilies, never the student's story): can she
 * make 9 identical bouquets with ALL her flowers? A bouquet count is read on the board's bridges: the gap has one cell per
 * flower, and a plank of length k is one round of the sharing — one flower for each of k bouquets. Then the four keys, in
 * the order of the student's world, each met by questions made for it and PROVED by the bridges the board builds before
 * its name: the planks that fill both gaps (🤝), the longest of them (👑), the bouquets read with them (💐), the planks of
 * the longest one (🧩). No `forge`/`bridges` step: the four keys are forged by each student in his world.
 * The bouquet station (`deal`) is an `ask` whose choices are bouquet counts: its own `words` label its cards and verdicts.
 * An `ask` builds every plank over ONE gap: each question is chosen so that the planks that fill that gap are exactly the
 * answer — the other gap is settled in the text, with its equalities (`board.test.js` computes both).
 * The numbers are the board's own (`BOARD`), never the story's: the class does not replay the world; `board.test.js`
 * computes every one of them. A `cue` is at most 70 characters and nothing the class reads before a name holds it.
 */
import { commonDivisors, counted, divisorsOf, gcd, listAr, BOUQUETS, LILIES, ROSES } from '../world/math';

/** The board's numbers — ONE place: the script, the memo and the tests read them from here. */
export const BOARD = {
  /** The florist: her roses and lilies, and the number of bouquets the hour opens on. */
  roses: 36,
  lilies: 60,
  first: 9,
  /** The planks tried on the lilies' gap after the 9 (🤝), and the divisors of 36 tried on it (🤝). */
  twin: [5, 6, 8, 9],
  both: [4, 6, 9, 12, 18, 36],
  /** The bouquet counts the florist tries (💐): divisors of 36. */
  deal: [3, 9, 12, 18],
  /** The planks tried on the gap of the PGCD (🧩). */
  nest: [2, 3, 4, 5, 6, 8],
  /** Other numbers for the last key: their PGCD, and the planks tried on the longer gap. */
  other: { a: 48, b: 80, planks: [3, 4, 6, 8, 12, 16] },
};
const { roses: R, lilies: L, first: F, other: O } = BOARD;
const G = gcd(R, L);
const OG = gcd(O.a, O.b);
const COMMON = commonDivisors(R, L);

/** « n = d × k », k computed. */
const times = (n, d) => `${n} = ${d} \\times ${n / d}`;
/** « n = d × q + r », q and r computed. */
const euclid = (n, d) => `${n} = ${d} \\times ${Math.floor(n / d)} + ${n % d}`;
/** « n = d1 × k1 = d2 × k2 = … », every factor computed. */
const chain = (n, ds) => `${n} = ${ds.map((d) => `${d} \\times ${n / d}`).join(' = ')}`;
const pgcd = (a, b) => `\\mathrm{PGCD}(${a} ; ${b})`;
/** The planks of `n` from `from` up (a divisor list, computed). */
const from = (n, lo) => divisorsOf(n).filter((d) => d >= lo);
/** The divisors of n that are at most its square root: one per pair. */
const smalls = (n) => divisorsOf(n).filter((d) => d * d <= n);
const fills = (a, list) => list.filter((o) => a % o === 0);
/** « 4 و 6 و 12 ». */
const and = (xs) => xs.join(' و ');

/** The words of the bouquet station's cards (an `ask` step's `words`): a label with no number agreement, two verdicts. */
const DEAL_WORDS = { card: 'عدد الباقات', held: 'توزَّع كلّها', fell: 'تبقى زنابق' };

const SUMMIT = from(L, G);
const OTHER_ABOVE = from(O.b, OG + 1);
const OTHER_NOT = O.planks.filter((o) => O.b % o !== 0);

export const SCRIPT = {
  title: 'القاسم المشترك الأكبر لعددين طبيعيين',
  steps: [
    {
      id: 'situation',
      kind: 'situation',
      chapter: 'نكتشف',
      title: 'باقات متماثلة بكلّ الزهور',
      text: `عند البائعة ${counted(R, ROSES)} و ${counted(L, LILIES)}، وتريد باقات متماثلة بكلّ الزهور. نوزّع الورود على ${counted(F, BOUQUETS)} جولةً بعد جولة: كلّ جولة لوح طوله ${F} فوق ${R} خانة، خانة لكلّ وردة.`,
      question: `هل تتوزّع الورود على ${counted(F, BOUQUETS)}؟`,
      bridge: { a: R, b: F },
      cue: `والزنابق: هل تتوزّع ${L} زنبقة على ${counted(F, BOUQUETS)} أيضًا؟`,
    },
    {
      id: 'twin',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'هوّتان معًا',
      text: `هوّتان: الورود ${R} خانة، والزنابق ${L} خانة. اللوح ${F} يملأ الأولى: $${times(R, F)}$.`,
      question: `أيّ الألواح يملأ هوّة الزنابق، ${L} خانة؟`,
      a: L,
      options: BOARD.twin,
      answer: fills(L, BOARD.twin),
      after: `$${euclid(L, F)}$: اللوح ${F} لا يملأ ${L}. واللوح 5 يملأ ${L} ولا يملأ ${R}: $${euclid(R, 5)}$. أمّا اللوح 6 فيملأ الهوّتين: $${times(R, 6)}$ و $${times(L, 6)}$.`,
      cue: 'لوح يملأ هوّة: هل يملأ الأخرى؟ من يجد لوحًا آخر يملأ الاثنتين؟',
    },
    {
      id: 'both',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'كلّ الألواح التي تملأ الهوّتين',
      text: `كلّ ألواح الهوّة ${R}، زوجًا زوجًا: $${chain(R, smalls(R))}$.`,
      question: `أيّها يملأ الهوّة ${L} أيضًا؟`,
      a: L,
      options: BOARD.both,
      answer: fills(L, BOARD.both),
      after: `والألواح 1 و 2 و 3 تملأ ${L} أيضًا: $${chain(L, [1, 2, 3])}$. الألواح التي تملأ الهوّتين معًا: ${listAr(COMMON)}.`,
      cue: 'هل نسينا لوحًا؟ كيف نتأكّد أنّ القائمة كاملة؟',
    },
    {
      id: 'name-1',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: 'qawasim-mushtaraka',
      recall: ['معًا', 'القائمتين'],
      cue: 'ما القواسم المشتركة للعددين 10 و 15؟',
    },
    {
      id: 'summit',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'لوح مشترك أطول؟',
      text: `الألواح المشتركة: ${listAr(COMMON)}. ألواح الهوّة ${L} من ${G} فما فوق: $${chain(L, SUMMIT)}$.`,
      question: `أيّها يملأ الهوّة ${R} أيضًا؟`,
      a: R,
      options: SUMMIT,
      answer: fills(R, SUMMIT),
      after: `اللوح ${G} وحده: $${times(R, G)}$. لا لوح أطول من ${G} يملأ الهوّتين معًا، فاللوح ${G} أطول الألواح المشتركة.`,
      cue: `لماذا يكفي أن نجرّب ألواح ${L} التي لا تقلّ عن ${G}؟`,
    },
    {
      id: 'name-2',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: 'al-akbar',
      recall: ['أكبر القواسم المشتركة', 'نرمز'],
      cue: 'ما القاسم المشترك الأكبر للعددين 10 و 15؟ كيف نكتبه؟',
    },
    {
      id: 'deal',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'نعود إلى البائعة',
      text: `${counted(R, ROSES)} و ${counted(L, LILIES)}، وباقات متماثلة بكلّ الزهور. تجرّب البائعة ${and(BOARD.deal)} باقة، وكلّها توزّع الورود: $${chain(R, BOARD.deal)}$.`,
      question: 'أيّ عدد من الباقات يوزّع الزنابق أيضًا؟',
      a: L,
      options: BOARD.deal,
      answer: fills(L, BOARD.deal),
      // the choices are bouquet counts, not planks: the card and its verdict speak of the lilies shared out
      words: DEAL_WORDS,
      after: `${and(fills(L, BOARD.deal).map((k) => counted(k, BOUQUETS)))}: عدد الباقات يقسم ${R} و ${L} معًا، وأكبره $${pgcd(R, L)} = ${G}$. في كلّ باقة من الـ${G}: ${counted(R / G, ROSES)} و ${counted(L / G, LILIES)}، $${times(R, G)}$ و $${times(L, G)}$.`,
      cue: `لماذا لا تصنع ${counted(F, BOUQUETS)}؟ وكم زهرة في كلّ باقة من الـ${G}؟`,
    },
    {
      id: 'name-3',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: 'baqat-mutamathila',
      recall: ['قاسم مشترك', 'أكبر عدد'],
      cue: '42 قلمًا و 56 كرّاسًا في علب متماثلة: كم علبة على الأكثر؟',
    },
    {
      id: 'nest',
      kind: 'ask',
      chapter: 'نكتشف',
      title: `هوّة من ${G} خانة`,
      text: `القواسم المشتركة للعددين ${R} و ${L}: ${listAr(COMMON)}، و $${pgcd(R, L)} = ${G}$. هوّة جديدة: ${G} خانة فقط.`,
      question: `أيّ الألواح يملأ الهوّة ${G}؟`,
      a: G,
      options: BOARD.nest,
      answer: fills(G, BOARD.nest),
      after: `$${chain(G, smalls(G))}$: قواسم ${G} هي ${listAr(divisorsOf(G))}، القائمة نفسها.`,
      cue: 'قارنوا القائمتين: ماذا تلاحظون؟',
    },
    {
      id: 'other',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'أعداد أخرى',
      text: `عددان آخران: $${times(O.a, OG)}$ و $${times(O.b, OG)}$، وقواسم ${O.b} الأكبر من ${OG} (${and(OTHER_ABOVE)}) لا تقسم ${O.a}: $${pgcd(O.a, O.b)} = ${OG}$.`,
      question: `دون أن نكتب قواسم ${O.a} و ${O.b}: أيّ الألواح يملأ الهوّتين معًا؟`,
      a: O.b,
      options: O.planks,
      answer: fills(O.b, O.planks),
      after: `$${chain(OG, fills(OG, O.planks))}$: ${and(fills(OG, O.planks))} تقسم ${OG}، فتقسم مضاعفيه ${O.a} و ${O.b}. أمّا ${and(OTHER_NOT)} فلا تملأ ${O.b}.`,
      cue: 'كيف نجد القواسم المشتركة دون أن نكتب قواسم العددين؟',
    },
    {
      id: 'name-4',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: 'qawasim-al-pgcd',
      recall: ['بالضبط', 'قواسم العدد'],
      // the cue is plain text (no formula): its Latin run is isolated left to right (U+2066 … U+2069), or the bidi
      // algorithm scrambles it at the start of an Arabic line (« 10 = (30 ;PGCD(20 », seen on the board 2026-11-19)
      cue: '⁦PGCD(20 ; 30) = 10⁩: ما القواسم المشتركة للعددين 20 و 30؟',
    },
    // the copybook is two pages of two keys: the four tablets of this lesson are too long for one screen
    {
      id: 'trace-1',
      kind: 'trace',
      chapter: 'نكتب',
      title: 'على الكرّاس: المفتاحان 1 و 2',
      tablets: ['qawasim-mushtaraka', 'al-akbar'],
      cue: 'بعد النقل: من يذكّرنا بالمفتاحين دون أن ينظر إلى السبّورة؟',
    },
    {
      id: 'trace-2',
      kind: 'trace',
      chapter: 'نكتب',
      title: 'على الكرّاس: المفتاحان 3 و 4',
      tablets: ['baqat-mutamathila', 'qawasim-al-pgcd'],
      cue: 'بعد النقل: من يذكّرنا بالمفاتيح الأربعة دون أن ينظر إلى السبّورة؟',
    },
  ],
};
