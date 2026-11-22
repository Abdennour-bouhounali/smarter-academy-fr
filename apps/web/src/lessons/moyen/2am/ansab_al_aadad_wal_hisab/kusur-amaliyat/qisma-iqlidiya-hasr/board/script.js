/**
 * « الدرس على السبّورة » of this lesson — the STEPS the class goes through together (CLASS_SESSION.md §5ter).
 * The kinds of step and what the board does with each: `features/classSession/lessonScripts.js`.
 * Reached only through the lesson's pack (`lesson.pack.js › board.script`).
 *
 * The hour opens on a RECALL — one division by a plank of two digits, the first year's — then each of the three keys is
 * met by questions made for it, on the gaps of the student's world: three LONG planks (three digits) on one gap, where a
 * digit is tried, multiplied and corrected; the full planks against the planks needed; a gap where both are the same;
 * five sentences judged on one equality; the port's bridge and its price — and every answer is PROVED by the bridges the
 * board builds. Only then the key gets its name (the tablet of the student's world). No `forge`/`bridges` step: those
 * are the pilot's remainder mirror; the keys of this lesson are forged by each student in his world.
 * The drawn bridge of the opening is the world's first, short gap (84 cells): the long gaps are only drawn as one bar
 * per plank, where a plank stays wide enough to be seen.
 * Every number is read from `world/story.js › NUMBERS` (one place) and every count is written through
 * `world/counted.js`; the other numbers are the board's own (never a sheet of the exercise bank), and `board.test.js`
 * computes all of them.
 */
import { agree, cells, planks } from '../world/counted';
import { NUMBERS } from '../world/story';

const { intro: I, recall: C, long: L, bracket: H, after: F, exact: X, trips: T, boss: B } = NUMBERS;
const q = (a, b) => Math.floor(a / b);
/** « a = b × q + r », q and r computed; « a = b × q » when nothing is left. */
const euclid = (a, b) => (a % b ? `${a} = ${b} \\times ${q(a, b)} + ${a % b}` : `${a} = ${b} \\times ${a / b}`);
/** « 7 ألواح كاملة », « 21 لوحًا كاملًا », « لوحان كاملان ». */
const full = (n) => {
  const m = n % 100;
  const word = n === 1 || (n >= 100 && m <= 2) ? 'كامل' : n === 2 ? 'كاملان' : m >= 3 && m <= 10 ? 'كاملة' : 'كاملًا';
  return `${planks(n)} ${word}`;
};
const leave = (n) => agree(n, ['يترك', 'يتركان', 'تترك']);
const pass = (n) => agree(n, ['يتجاوز', 'يتجاوزان', 'تتجاوز']);
const [C1, C2] = C.moulds.filter((m) => C.gap % m);
/** 912 by the first year's technique: 24 × 30 first, then what is left. */
const EST = 30;
/** The long plank whose division is worked on the board: ten planks, a digit tried too big, then the right one. */
const TRY = L.moulds[1];
const TRY_LEFT = L.gap - TRY * 10;
const TRY_DIGIT = q(TRY_LEFT, TRY);
const L3 = L.moulds[2];
const BR = H.moulds[0];
const NEED = F.moulds[1];
const [X1] = X.moulds.filter((m) => X.gap % m);
const [BAD] = B.options.filter((m) => B.gap % m);
const COST = (B.gap / B.plank) * B.price;

export const SCRIPT = {
  title: 'القسمة الإقليدية وحصر حاصل القسمة',
  steps: [
    {
      id: 'situation',
      kind: 'situation',
      chapter: 'نكتشف',
      title: 'أوّل جسر في الأرخبيل',
      text: `الجسور مقطوعة بين الجزر. أمامنا هوّة من ${cells(I.gap, 'gen')}، وفي أيدينا ألواح طولها ${I.plank}.`,
      question: `هل يثبت الجسر؟ وكم لوحًا طوله ${I.plank} يلزمه؟`,
      bridge: { a: I.gap, b: I.plank },
      cue: 'قبل البناء: من يتوقّع عدد الألواح؟ وكيف عرف؟',
    },
    {
      id: 'recall',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'قسمة نعرفها: لوح من رقمين',
      text: `هوّة من ${cells(C.gap, 'gen')}، والقوالب ${C.moulds.join(' و ')}. لا نعدّ الألواح واحدًا واحدًا.`,
      question: 'أيّ القوالب يملأ الهوّة؟ كيف نعرف قبل البناء؟',
      a: C.gap,
      options: [...C.moulds],
      answer: [C.plank],
      after: `$${C.gap} = ${C.plank} \\times ${EST} + ${C.gap - C.plank * EST}$ ثمّ $${euclid(C.gap - C.plank * EST, C.plank)}$: إذن $${euclid(C.gap, C.plank)}$. ومع ${C1} و ${C2}: $${euclid(C.gap, C1)}$ و $${euclid(C.gap, C2)}$.`,
      cue: `من بدأ بـ ${C.plank} في 10؟ ثمّ في ${EST}؟ ماذا بقي بعدها؟`,
    },
    {
      id: 'long',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'ألواح طويلة: ثلاثة أرقام',
      text: `هوّة من ${cells(L.gap, 'gen')}، والقوالب ${L.moulds.join(' و ')}: مضاعفاتها ليست في جداولنا.`,
      question: 'أيّ القوالب يملأ الهوّة؟ وكم خانة يترك كلّ قالب آخر؟',
      a: L.gap,
      options: [...L.moulds],
      answer: [L.plank],
      after: `مع ${TRY}: $${TRY} \\times 10 = ${TRY * 10}$، يبقى ${TRY_LEFT}. نجرّب ${TRY_DIGIT + 1}: $${TRY} \\times ${TRY_DIGIT + 1} = ${TRY * (TRY_DIGIT + 1)}$ يتجاوز ${TRY_LEFT}؛ إذن ${TRY_DIGIT}: $${euclid(L.gap, TRY)}$. ومع ${L3}: $${euclid(L.gap, L3)}$. ومع ${L.plank}: $${euclid(L.gap, L.plank)}$.`,
      cue: `في ${TRY_LEFT} مع اللوح ${TRY}: أيّ رقم نجرّب أوّلًا؟ وكيف نحكم عليه؟`,
    },
    {
      id: 'name-1',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: 'qisma-ay-adad',
      recall: ['أيّ عدد', 'نقدّر'],
      cue: `${L.gap - L3 * 10} مع اللوح ${L3}: أيّ رقم تجرّب؟ وبِمَ تضربه لتحكم عليه؟`,
    },
    {
      id: 'bracket',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'لوح ناقص، لوح زائد',
      text: `هوّة من ${cells(H.gap, 'gen')}، والقوالب ${H.moulds.join(' و ')}. مع ${BR}: $${euclid(H.gap, BR)}$.`,
      question: `أيّ القوالب يملأ الهوّة تمامًا؟ ومع ${BR}: كم لوحًا يغطّي الهوّة كلّها؟`,
      a: H.gap,
      options: [...H.moulds],
      answer: [H.plank],
      after: `$${euclid(H.gap, H.plank)}$. ومع ${BR}: ${planks(q(H.gap, BR))} ${leave(q(H.gap, BR))} ${cells(H.gap % BR, 'acc')}، و ${planks(q(H.gap, BR) + 1)} ${pass(q(H.gap, BR) + 1)} الهوّة: $${BR} \\times ${q(H.gap, BR)} = ${BR * q(H.gap, BR)}$ و $${BR} \\times ${q(H.gap, BR) + 1} = ${BR * (q(H.gap, BR) + 1)}$.`,
      cue: `${H.gap} مقسومًا على ${BR}: بين أيّ عددين طبيعيين متتاليين يقع؟`,
    },
    {
      id: 'need',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'الألواح الكاملة والألواح اللازمة',
      text: `هوّة من ${cells(F.gap, 'gen')}، والقوالب ${F.moulds.join(' و ')}.`,
      question: `أيّ القوالب يملأ الهوّة؟ ومع ${NEED}: كم لوحًا كاملًا، وكم لوحًا يلزم؟`,
      a: F.gap,
      options: [...F.moulds],
      answer: [F.plank],
      after: `$${euclid(F.gap, F.plank)}$. ومع ${NEED}: $${euclid(F.gap, NEED)}$، ${full(q(F.gap, NEED))}، ويلزم ${planks(q(F.gap, NEED) + 1)} لتغطية الهوّة كلّها.`,
      cue: `اللوح ${F.moulds[2]}: كم لوحًا كاملًا، وكم يلزم؟ وأين يقع ${F.gap} مقسومًا عليه؟`,
    },
    {
      id: 'name-2',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: 'hasr-hasil',
      recall: ['بالنقصان', 'بالزيادة'],
      cue: `${T.boxes} صندوقًا وقارب يحمل ${T.boat}: كم رحلة مملوءة؟ وكم رحلة تلزم؟`,
    },
    {
      id: 'exact',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'الكاملة هي اللازمة',
      text: `هوّة من ${cells(X.gap, 'gen')}، والقوالب ${X.moulds.join(' و ')}.`,
      question: 'مع أيّ القوالب تكون الألواح الكاملة هي نفسها الألواح اللازمة؟',
      a: X.gap,
      options: [...X.moulds],
      answer: [X.plank],
      after: `$${euclid(X.gap, X.plank)}$: ${full(X.gap / X.plank)}، ولا لوح يتجاوز الهوّة. ومع ${X1}: $${euclid(X.gap, X1)}$، ${full(q(X.gap, X1))} ويلزم ${planks(q(X.gap, X1) + 1)}.`,
      cue: `${X.gap} مقسومًا على ${X.plank}: بين عددين متتاليين، أم عدد طبيعي بالضبط؟`,
    },
    {
      id: 'sentences',
      kind: 'statements',
      chapter: 'نكتشف',
      title: 'خمس جمل ومساواة واحدة',
      text: `نعلم أنّ $${X.gap} = ${X.plank} \\times ${X.gap / X.plank}$.`,
      question: 'صحيح أم خطأ؟',
      a: X.gap,
      b: X.plank,
      items: [
        { form: 'b_divides_a', text: `${X.plank} يقسم ${X.gap}` },
        { form: 'a_divides_b', text: `${X.gap} يقسم ${X.plank}` },
        { form: 'a_multiple_of_b', text: `${X.gap} مضاعف للعدد ${X.plank}` },
        { form: 'b_multiple_of_a', text: `${X.plank} مضاعف للعدد ${X.gap}` },
        { form: 'a_divisible_by_b', text: `${X.gap} يقبل القسمة على ${X.plank}` },
      ],
      cue: 'الجمل الصحيحة: هل تقول أشياء مختلفة، أم الشيء نفسه؟',
    },
    {
      id: 'port',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'جسر الميناء',
      text: `جسر الميناء: ${cells(B.gap)}. في المخزن ألواح ${B.options.join(' وألواح ')}، وثمن اللوح ${B.price} دج.`,
      question: 'أيّ النوعين يملأ الجسر دون أن يبقى شيء؟ وكم ندفع للمخزن؟',
      a: B.gap,
      options: [...B.options],
      answer: [B.plank],
      after: `$${euclid(B.gap, B.plank)}$ و $${B.gap / B.plank} \\times ${B.price} = ${COST}$: ندفع ${COST} دج. ومع ${BAD}: $${euclid(B.gap, BAD)}$.`,
      cue: `لماذا لا نشتري ألواح ${BAD}؟ كم لوحًا يلزم منها؟`,
    },
    {
      id: 'name-3',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: 'inidam-baqi',
      recall: ['عدد طبيعي', 'يقبل القسمة', 'مضاعف'],
      cue: 'باقي قسمة 72 على 8 معدوم: قل ذلك بثلاث جمل أخرى.',
    },
    // the copybook is two pages: the three tablets of this lesson are too long for one screen
    {
      id: 'trace-1',
      kind: 'trace',
      chapter: 'نكتب',
      title: 'على الكرّاس: المفتاحان 1 و 2',
      tablets: ['qisma-ay-adad', 'hasr-hasil'],
      cue: 'بعد النقل: من يذكّرنا بالمفتاحين دون أن ينظر إلى السبّورة؟',
    },
    {
      id: 'trace-2',
      kind: 'trace',
      chapter: 'نكتب',
      title: 'على الكرّاس: المفتاح 3',
      tablets: ['inidam-baqi'],
      cue: 'بعد النقل: من يذكّرنا بالمفاتيح الثلاثة دون أن ينظر إلى السبّورة؟',
    },
  ],
};
