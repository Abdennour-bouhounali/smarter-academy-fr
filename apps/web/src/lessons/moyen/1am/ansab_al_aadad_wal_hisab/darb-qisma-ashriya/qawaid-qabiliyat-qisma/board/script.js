/**
 * « الدرس على السبّورة » of this lesson — the STEPS the class goes through together (CLASS_SESSION.md §5ter).
 * The kinds of step and what the board does with each: `features/classSession/lessonScripts.js`.
 * Reached only through the lesson's pack (`lesson.pack.js › board.script`).
 *
 * The machine that divided is broken: the class must tell, from the gap's NUMBER alone, which plank fills it. Each key
 * is met the way the student's world gives it — Zero's notebook holds the gaps a plank filled and those it did not (the
 * world's facts), the class reads them and PREDICTS for a new gap, then the board builds every plank and writes its
 * equality. Only then the key gets its name (the tablet of the student's world). The last key is seen on the stone:
 * every plank that held left a remainder 0, every plank that fell left something.
 * No `forge`/`bridges` step: those are the pilot's remainder mirror; the four keys of this lesson are forged by each
 * student in his world.
 * Every number of the story is read from `world/story.js › NUMBERS` and `STONE` (one place); the notebook's numbers are
 * the board's own, and `board.test.js` computes all of them.
 */
import { NUMBERS, STONE } from '../world/story';

const { units: U, sum: S, last2: L, boss: B } = NUMBERS;
const [U5, U2] = U.planks;
const [G35, G46] = U.gaps;

/** « n = d × k », k computed. */
const times = (n, d) => `${n} = ${d} \\times ${n / d}`;
/** « n = d × q + r », q and r computed — « + 0 » kept: the remainder is what the class reads. */
const euclid = (n, d) => `${n} = ${d} \\times ${Math.floor(n / d)} + ${n % d}`;
const digitsOf = (n) => String(n).split('').map(Number);
const sumOf = (n) => digitsOf(n).reduce((t, x) => t + x, 0);
/** « 7 + 8 + 3 = 18 », computed. */
const digitSum = (n) => `${digitsOf(n).join(' + ')} = ${sumOf(n)}`;
const list = (xs) => xs.join(' و ');

/**
 * Zero's notebook — the gaps each plank filled before the storm, and those it did not: the board's own numbers (the
 * story's first gaps among them). The class reads them; the board never says what they share.
 * The gaps of the planks 9 and 3 carry DIFFERENT sums of digits (9, 18 and 27 for the plank 9; 3, 6, 12 and 21 for the
 * plank 3): a notebook whose sums were all 9, or all 3, would teach « the sum IS 9 », « the sum is 3, 6 or 9 » — the
 * false rules the student's mirror refutes (world/forges.js › sumIs9, sumIs369).
 */
export const NOTEBOOK = {
  five: [G35, 60, 85],
  two: [G46, 58, 70],
  none: 73,
  units: 470,
  nine: [18, S.gap, 387, 999],
  notNine: [19, 128],
  sumGap: 783,
  three: [12, 24, 57, 786],
  notThree: 13,
  four: [100, 200, 300, 28, 36],
  notFour: [26, 30],
};
const N = NOTEBOOK;
const STONE_HELD = STONE.read.filter((b) => STONE.gap % b === 0);
const STONE_FELL = STONE.read.filter((b) => STONE.gap % b !== 0);
const [BOSS_OK, BOSS_NO] = [B.options.find((o) => B.gap % o === 0), B.options.find((o) => B.gap % o !== 0)];
const BOSS_Q = B.gap / BOSS_OK;

export const SCRIPT = {
  title: 'قواعد قابلية القسمة',
  steps: [
    {
      id: 'situation',
      kind: 'situation',
      chapter: 'نكتشف',
      title: 'آلة القسمة معطّلة',
      text: `العاصفة عطّلت آلة القسمة لدى زيرو. الهوّة الأولى ${G35} خانة، ثمّ تطول الهوّات حتى ${B.gap} خانة.`,
      question: `هل يثبت اللوح ${U5} فوق ${G35} خانة؟ وكيف نعرف فوق ${B.gap} خانة دون آلة؟`,
      bridge: { a: G35, b: U5 },
      cue: `قبل البناء: من يتوقّع؟ وهل سنقسم ${B.gap} على كلّ لوح؟`,
    },
    {
      id: 'units',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'دفتر زيرو',
      text: `في دفتر زيرو: اللوح ${U5} ملأ ${list(N.five)}، واللوح ${U2} ملأ ${list(N.two)}، ولم يملأ أيّ منهما ${N.none}. الهوّة الجديدة: ${N.units} خانة.`,
      question: `دون أيّ قسمة: أيّ الألواح يثبت فوق ${N.units} خانة؟`,
      a: N.units,
      options: [U2, 3, U5],
      answer: [U2, U5],
      after: `$${times(N.units, U2)}$ و $${times(N.units, U5)}$. آخر رقم في ${N.units} هو ${N.units % 10}، كما في ${list(
        [...N.five, ...N.two].filter((n) => n % 10 === N.units % 10),
      )}؛ وكلّ ما ملأه اللوح ${U5} ينتهي بـ 0 أو 5.`,
      cue: 'أيّ رقم من أرقام العدد نظرتم إليه؟ ولماذا يكفي وحده؟',
    },
    {
      id: 'name-1',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: 'raqm-alahad',
      recall: ['رقم آحاده', '0 أو 5'],
      cue: 'هل يقبل 3574 القسمة على 2؟ وعلى 5؟ دون قسمة.',
    },
    {
      id: 'sum-9',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'حين لا يكفي آخر رقم',
      text: `في الدفتر: اللوح 9 ملأ ${list(N.nine)}، ولم يملأ ${N.notNine.join(' ولا ')}. الهوّة الجديدة: ${N.sumGap} خانة.`,
      question: `أيّ الألواح يثبت فوق ${N.sumGap} خانة؟ ماذا تشترك فيه أعداد اللوح 9؟`,
      a: N.sumGap,
      options: [2, 3, 5, 9],
      answer: [3, 9],
      after: `$${digitSum(N.sumGap)}$، وفي الدفتر $${digitSum(N.nine[2])}$ و $${digitSum(N.nine[3])}$، أمّا $${digitSum(
        N.notNine[1],
      )}$. واللوح 3 ثبت أيضًا: $${times(N.sumGap, 3)}$.`,
      cue: `آخر رقم في ${N.sumGap} لا يقول شيئًا عن 9: ماذا فعلنا بأرقامه؟`,
    },
    {
      id: 'sum-3',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'اللوح 3 دون اللوح 9',
      text: `في الدفتر: اللوح 3 ملأ ${list(N.three)}، ولم يملأ ${N.notThree}. الهوّة الجديدة: ${S.use} خانة، والألواح ${list(S.useMoulds)}.`,
      question: `أيّ الألواح يثبت فوق ${S.use} خانة؟`,
      a: S.use,
      options: [...S.useMoulds],
      answer: [S.usePlank],
      after: `$${digitSum(S.use)}$: $${times(S.use, 3)}$، لكن $${euclid(S.use, 9)}$. وفي الدفتر $${digitSum(N.three[2])}$ و $${digitSum(N.three[3])}$: ملأهما اللوح 3، ولا يملؤهما اللوح 9.`,
      cue: `مجموع أرقام ${S.use} هو ${sumOf(S.use)}: لماذا يكفي اللوح 3 ولا يكفي اللوح 9؟`,
    },
    {
      id: 'name-2',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: 'majmu-arqam',
      recall: ['مجموع أرقامه'],
      cue: '4005 و 4006: أيّهما يقبل القسمة على 3؟ وعلى 9؟',
    },
    {
      id: 'last2',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'المئات واللوح 4',
      text: `في الدفتر: اللوح ${L.plank} ملأ ${list(N.four)}، ولم يملأ ${N.notFour.join(' ولا ')}. الهوّة الجديدة: ${L.use} خانة.`,
      question: `أيّ الألواح يثبت فوق ${L.use} خانة؟ من يستعمل الدفتر دون قسمة؟`,
      a: L.use,
      options: [...L.useMoulds],
      answer: [L.plank],
      after: `$${L.use} = ${L.use - (L.use % 100)} + ${L.use % 100}$: اللوح ${L.plank} يملأ ${L.use - (L.use % 100)}، ويملأ ${L.use % 100}: $${times(L.use % 100, L.plank)}$. فيملأ الهوّة: $${times(L.use, L.plank)}$. أمّا ${list(N.notFour)} فزوجيّان ولا يملؤهما.`,
      cue: 'لماذا لا نحتاج إلى رقم المئات؟ ماذا يفعل اللوح 4 بالعدد 100؟',
    },
    {
      id: 'name-3',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: 'raqmayn-akhirayn',
      recall: ['المشكّل', 'آحاده وعشراته'],
      cue: 'هل يقبل 5716 القسمة على 4؟ و 5718؟ أيّ رقمين نقرأ؟',
    },
    {
      id: 'stone',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'سؤال الحجر',
      text: `حجر الجزيرة الأخيرة يسأل عن هوّة من ${STONE.gap} خانة، وخمسة ألواح: ${list(STONE.read)}. لا نقسم: نقرأ العدد.`,
      question: `أيّ الألواح يملأ ${STONE.gap} خانة تمامًا؟ ثمّ: ماذا يبقى من كلّ لوح؟`,
      a: STONE.gap,
      options: [...STONE.read],
      answer: [...STONE.answer],
      after: `ثبتت الألواح ${list(STONE_HELD)}، والباقي 0 مع كلّ منها: $${euclid(STONE.gap, STONE_HELD.at(-1))}$. وانهارت الألواح ${list(STONE_FELL)}، وبقيت خانات: $${euclid(STONE.gap, STONE_FELL.at(-1))}$.`,
      cue: 'ما الذي يشترك فيه كلّ لوح ثبت؟ وكلّ لوح انهار؟',
    },
    {
      id: 'boss',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'الجسر الأخير',
      text: `الجسر الأخير: ${B.gap} خانة. في المخزن ألواح طولها ${list(B.options)}، وثمن اللوح ${B.price} دج.`,
      question: 'أيّ النوعين يملأ الجسر تمامًا؟ ماذا يقول الباقي؟',
      a: B.gap,
      options: [...B.options],
      answer: [BOSS_OK],
      after: `$${euclid(B.gap, BOSS_OK)}$ و $${euclid(B.gap, BOSS_NO)}$. نشتري ${BOSS_Q} لوحًا بـ ${BOSS_Q * B.price} دج: $${BOSS_Q} \\times ${B.price} = ${BOSS_Q * B.price}$.`,
      cue: `ماذا يقول الباقي ${B.gap % BOSS_NO} عن الألواح ${BOSS_NO}؟ وماذا يقول الباقي 0؟`,
    },
    {
      id: 'name-4',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: 'baqi-sifr',
      recall: ['باقي القسمة الإقليدية', 'معدومًا'],
      cue: `قولوا بثلاث جمل: ${BOSS_OK} و ${B.gap}. وهل ${BOSS_NO} يقسم ${B.gap}؟`,
    },
    // the copybook is two pages of two keys: the four tablets of this lesson are too long for one screen
    {
      id: 'trace-1',
      kind: 'trace',
      chapter: 'نكتب',
      title: 'على الكرّاس: المفتاحان 1 و 2',
      tablets: ['raqm-alahad', 'majmu-arqam'],
      cue: 'بعد النقل: من يذكّرنا بالمفتاحين دون أن ينظر إلى السبّورة؟',
    },
    {
      id: 'trace-2',
      kind: 'trace',
      chapter: 'نكتب',
      title: 'على الكرّاس: المفتاحان 3 و 4',
      tablets: ['raqmayn-akhirayn', 'baqi-sifr'],
      cue: 'بعد النقل: من يذكّرنا بالمفاتيح الأربعة دون أن ينظر إلى السبّورة؟',
    },
  ],
};
