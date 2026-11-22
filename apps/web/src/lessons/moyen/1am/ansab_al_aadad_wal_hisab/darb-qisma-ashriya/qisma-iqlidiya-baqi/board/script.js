/**
 * « الدرس على السبّورة » of this lesson — the STEPS the class goes through together (CLASS_SESSION.md §5ter).
 * The kinds of step and what the board does with each: `features/classSession/lessonScripts.js`.
 * Reached only through the lesson's pack (`lesson.pack.js › board.script`).
 *
 * Each of the five keys is met by a question made for it, in the order the student's world gives them — how many full
 * planks before no other fits, what a plank leaves when the gap grows by one cell, a gap rebuilt from its planks and its
 * leftover, a quotient whose tens are guessed before any division, a station where the leftover decides how many cabins
 * are needed — and only then the key gets its name (the tablet of the student's world).
 *
 * THE RIGHT ANSWER OF AN « ask » IS ALWAYS A PLANK THAT FILLS ITS GAP: the board draws every choice as a bridge and
 * colours it by « it holds / it falls » (`LessonBoard.jsx › Ask`), so a right answer drawn as a fallen bridge would read
 * as a mistake. Each question is asked so that what the key finds is the bridge that HOLDS; the planks that fall are
 * what the class explains (`after`, `cue`). `board.test.js` checks it for every step.
 * No `forge`/`bridges` step: those are the pilot's remainder mirror; the keys of this lesson are forged by each student
 * in his world.
 * Every number of the story is read from `world/story.js › NUMBERS` and `SPYGLASS` (one place); the other numbers are
 * the board's own, and `board.test.js` computes all of them. The drawn bars stay readable: no bar holds more than a few
 * dozen planks.
 */
import { cabinsOf, cellsOf, emptyCellsOf, fullPlanksOf, planksOf, travellersOf } from '../world/counted';
import { NUMBERS, SPYGLASS, divide, upTo } from '../world/story';

const { count: C, groups: GR, rebuild: RB, cable: CB } = NUMBERS;

/** « n = d × k », k computed. */
const times = (n, d) => `${n} = ${d} \\times ${n / d}`;
/** « n = d × q + r », q and r computed. */
const euclid = (n, d) => {
  const { q, r } = divide(n, d);
  return `${n} = ${d} \\times ${q} + ${r}`;
};

/** The opening: the gap of island C and its first mould. */
const SIT = { a: GR.a, b: GR.probe };
/** Key 1: in the gap of island B, which plank goes in exactly COUNT times and leaves nothing? */
const COUNT = 5;
const COUNT_OPTIONS = [4, 6, 7, 8];
const COUNT_PLANK = COUNT_OPTIONS.find((o) => o * COUNT === C.a);
const OTHER = divide(C.a, C.probe);
/** Key 2: the gap where a plank of 8 leaves its longest leftover — and the gap one cell longer. */
const TOP = GR.a - (GR.a % GR.probe) + GR.probe - 1;
const GROW_OPTIONS = [5, 7, 8, 9];
/** Key 3: the gap of island E, lost; only its planks and its leftover are known. */
const RBD = divide(RB.a, RB.probe);
/** … and Reem stops one plank too early: a true equality whose leftover is too long (the oral question of the name). */
const EARLY_Q = RBD.q - 1;
const EARLY_R = RB.a - RB.probe * EARLY_Q;
/** Key 4: an old bridge the spyglass plank fills — the tens of its quotient first (the board's own gap). */
const { b: SB, tens: TENS } = SPYGLASS;
const UP = upTo(TENS);
const OLD = SB * (TENS + 5);
const OLD_OPTIONS = [18, SB, 35, 70];
/** Key 5: the cable-car station — which cabin size leaves nobody, and what the story's size leaves. */
const CABLE_OPTIONS = [CB.b, 9, 12, 13];
const [CABLE_FIT] = CABLE_OPTIONS.filter((o) => CB.a % o === 0);
const CABLE = divide(CB.a, CB.b);

export const SCRIPT = {
  title: 'القسمة الإقليدية',
  steps: [
    {
      id: 'situation',
      kind: 'situation',
      chapter: 'نكتشف',
      title: `هوّة من ${SIT.a} خانة`,
      text: `بين جزيرتين هوّة من ${SIT.a} خانة، والألواح طولها ${SIT.b}. نضع الألواح من الضفّة، لوحًا كاملًا بعد لوح.`,
      question: `كم لوحًا كاملًا طوله ${SIT.b} يدخل؟ وكم خانة تبقى فارغة؟`,
      bridge: { a: SIT.a, b: SIT.b },
      cue: 'قبل البناء: من يتوقّع عدد الألواح؟ ومتى نتوقّف؟',
    },
    {
      id: 'count',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'كم لوحًا كاملًا؟',
      text: `هوّة أخرى من ${C.a} خانة. نضع الألواح الكاملة واحدًا بعد الآخر، حتّى لا يدخل لوح آخر.`,
      question: `مع أيّ لوح ندخل ${fullPlanksOf(COUNT, { acc: true })} بالضبط، ولا تبقى أيّ خانة؟`,
      a: C.a,
      options: COUNT_OPTIONS,
      answer: [COUNT_PLANK],
      after: `$${times(C.a, COUNT_PLANK)}$: ${planksOf(COUNT)} ولا خانة فارغة. ومع اللوح ${C.probe}: $${euclid(C.a, C.probe)}$، واللوح رقم ${OTHER.q + 1} يحتاج $${C.probe} \\times ${OTHER.q + 1} = ${C.probe * (OTHER.q + 1)}$ خانة.`,
      cue: `مع اللوح ${C.probe}: لماذا نتوقّف عند ${planksOf(OTHER.q, { gen: true })}؟`,
    },
    {
      id: 'name-1',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: 'majmuaat-kamila',
      recall: ['أكبر عدد ممكن', 'حاصل القسمة'],
      cue: 'في 50 خانة وألواح طولها 6: كم لوحًا كاملًا؟ ومتى نتوقّف؟',
    },
    {
      id: 'grow',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'خانة واحدة أكثر',
      text: `ألواح طولها ${GR.probe}: هوّة من ${TOP} خانة تترك ${emptyCellsOf(GR.probe - 1, { acc: true })}، $${euclid(TOP, GR.probe)}$. نزيد الهوّة خانة واحدة.`,
      question: `أيّ الألواح يملأ الهوّة الجديدة، ${TOP + 1} خانة، تمامًا؟`,
      a: TOP + 1,
      options: GROW_OPTIONS,
      answer: GROW_OPTIONS.filter((o) => (TOP + 1) % o === 0),
      after: `$${euclid(TOP + 1, GR.probe)}$: ${cellsOf(GR.probe)} فارغة أخذت لوحًا آخر. ومع اللوح 7: $${euclid(TOP + 1, 7)}$، ومع اللوح 9: $${euclid(TOP + 1, 9)}$.`,
      cue: `هل تبقى ${cellsOf(GR.probe)} فارغة مع اللوح ${GR.probe}؟ وما أكثر ما يتركه؟`,
    },
    {
      id: 'name-2',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: 'baqi-asghar',
      recall: ['أصغر دائمًا', 'أكبر باقٍ ممكن'],
      cue: 'ألواح طولها 5: ما البواقي الممكنة؟ ولماذا لا يكون الباقي 5؟',
    },
    {
      id: 'rebuild',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'هوّة ضاعت من الخريطة',
      text: `ألواح طولها ${RB.probe}: دخل منها ${fullPlanksOf(RBD.q)}، وبقيت ${emptyCellsOf(RBD.r)}. لا نعرف طول الهوّة.`,
      question: 'كم خانة طول الهوّة؟ وأيّ الألواح يملؤها تمامًا؟',
      a: RB.a,
      options: [6, 7, 8, 9],
      answer: [6, 7, 8, 9].filter((o) => RB.a % o === 0),
      after: `$${RB.probe} \\times ${RBD.q} + ${RBD.r} = ${RB.a}$: الألواح والخانات الفارغة معًا. ثمّ $${times(RB.a, 7)}$ و $${times(RB.a, 9)}$.`,
      cue: 'كيف نعرف طول الهوّة دون أن نعدّ خاناتها؟',
    },
    {
      id: 'name-3',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: 'musawat-qisma',
      recall: ['المقسوم عليه', 'الحاصل', 'الباقي'],
      // Reem stops one plank too early: her equality is true, her leftover is longer than a plank
      cue: `ريم: «في ${RB.a} خانة ${planksOf(EARLY_Q)} طولها ${RB.probe}، وتبقى ${EARLY_R}». أين الخطأ؟`,
    },
    {
      id: 'scope',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'منظار الجزيرة',
      text: `منظار الجزيرة يرى جسرًا قديمًا من ${OLD} خانة. عدّ ألواحه واحدًا واحدًا يطول كثيرًا.`,
      question: `قبل أيّ قسمة: أيّ لوح يملؤه بعدد من الألواح بين ${TENS} و ${UP}؟`,
      a: OLD,
      options: OLD_OPTIONS,
      answer: OLD_OPTIONS.filter((o) => OLD % o === 0),
      after: `$${SB} \\times ${TENS} = ${SB * TENS}$ و $${SB} \\times ${UP} = ${SB * UP}$: بين ${TENS} و ${UP} لوحًا. ثمّ $${euclid(OLD, SB)}$. ومع اللوح 35: $35 \\times ${TENS} = ${35 * TENS}$، أطول من ${OLD}.`,
      cue: `كم خانة تغطّي 10 ألواح طولها ${SB}؟ و ${TENS} لوحًا؟ و ${UP}؟`,
    },
    {
      id: 'name-4',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: 'taqdir-hasil',
      recall: ['عشرات الحاصل', 'آحاده'],
      cue: 'قدّروا عشرات حاصل قسمة 500 على 23 قبل أن تقسموا.',
    },
    {
      id: 'cable',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'محطّة التليفريك',
      text: `في محطّة التليفريك ${travellersOf(CB.a)}، وكلّ العربات بالحمولة نفسها. على السبّورة: كلّ مسافر خانة، وكلّ عربة ممتلئة لوح.`,
      question: 'مع أيّ حمولة تمتلئ كلّ العربات، ولا يبقى أحد في المحطّة؟',
      a: CB.a,
      options: CABLE_OPTIONS,
      answer: [CABLE_FIT],
      after: `$${times(CB.a, CABLE_FIT)}$: تمتلئ ${cabinsOf(CB.a / CABLE_FIT)} ولا يبقى أحد، فتلزم ${CB.a / CABLE_FIT}. ومع حمولة ${CB.b}: $${euclid(CB.a, CB.b)}$: تمتلئ ${CABLE.q} ويبقى ${travellersOf(CABLE.r)}، فتلزم ${CABLE.q + 1}.`,
      cue: `مع حمولة ${CB.b}: كم عربة تلزم ليعبر الجميع؟ ولماذا ليست ${CABLE.q}؟`,
    },
    {
      id: 'name-5',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: 'baqi-fi-masala',
      recall: ['المجموعات الكاملة', 'ما يبقى خارجها'],
      cue: '50 تلميذًا وطاولات من 6: كم طاولة تمتلئ؟ وكم طاولة تلزم؟',
    },
    // the copybook is three pages: the five tablets of this lesson do not fit one screen
    {
      id: 'trace-1',
      kind: 'trace',
      chapter: 'نكتب',
      title: 'على الكرّاس: المفتاحان 1 و 2',
      tablets: ['majmuaat-kamila', 'baqi-asghar'],
      cue: 'بعد النقل: من يذكّرنا بالمفتاحين دون أن ينظر إلى السبّورة؟',
    },
    {
      id: 'trace-2',
      kind: 'trace',
      chapter: 'نكتب',
      title: 'على الكرّاس: المفتاحان 3 و 4',
      tablets: ['musawat-qisma', 'taqdir-hasil'],
      cue: 'بعد النقل: من يكتب مساواة القسمة ويسمّي حدودها؟',
    },
    {
      id: 'trace-3',
      kind: 'trace',
      chapter: 'نكتب',
      title: 'على الكرّاس: المفتاح 5',
      tablets: ['baqi-fi-masala'],
      cue: 'بعد النقل: من يذكّرنا بالمفاتيح الخمسة دون أن ينظر إلى السبّورة؟',
    },
  ],
};
