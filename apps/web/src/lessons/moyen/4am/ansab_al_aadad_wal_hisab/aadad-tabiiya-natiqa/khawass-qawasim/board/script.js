/**
 * « الدرس على السبّورة » of this lesson — the STEPS the class goes through together (CLASS_SESSION.md §5ter).
 * The kinds of step and what the board does with each: `features/classSession/lessonScripts.js`.
 * Reached only through the lesson's pack (`lesson.pack.js › board.script`).
 *
 * Each of the four keys is met by questions made for it, in the order the student's world gives them — one plank and
 * two gaps glued or cut, a bridge repeated a hundred times, what a division leaves, the same calculation with other
 * numbers — and every answer is PROVED by the bridges the board builds. Only then the key gets its name (the tablet of
 * the student's world). No `forge`/`bridges` step: those are the pilot's remainder mirror; the four keys of this lesson
 * are forged by each student in his world.
 * Every number of the story is read from `world/story.js › NUMBERS` (one place); the other numbers are the board's own,
 * and `board.test.js` computes all of them.
 * ONE DIRECTION ONLY: each key goes from the parts to what is made of them. No sentence here may lean on the converse
 * the lesson refutes (a plank that fills what is made need not fill the parts: 25 fills 175 and not 280; 25 fills
 * 1800 and not 18) — so a plank the key does not speak of is left to the bridges, never judged by the key.
 * A `cue` is at most 70 characters (its footer cuts a longer one at 1024 px) and a tablet's `math` at most two short
 * equalities (CLASS_SESSION.md §5ter) — both tested.
 */
import { NUMBERS } from '../world/story';

const { join: J, stack: K, peel: P, boss: B } = NUMBERS;
const [G1, G2] = J.gaps;
const [F1, F2] = J.foil;
const GLUED = G1 + G2;
const CUT = G2 - G1;
const FOIL = F1 + F2;
const COPIES = K.bridge * K.copies;
const PEEL_Q = Math.floor(P.long / P.short);
const REST = P.long % P.short;
const HARBOUR = B.long + B.short;
/** The board's own pair for « other numbers »: a = d × p, b = d × q. */
const OTHER = { d: 13, p: 20, q: 21 };
const OA = OTHER.d * OTHER.p;
const OB = OTHER.d * OTHER.q;

/** « n = d × k », k computed. */
const times = (n, d) => `${n} = ${d} \\times ${n / d}`;
/** « n = d × q + r », q and r computed. */
const euclid = (n, d) => `${n} = ${d} \\times ${Math.floor(n / d)} + ${n % d}`;
/** The planks of the store that fill both long bridges — and those that fill what is left. */
const COMMON = P.planks.filter((o) => P.long % o === 0 && P.short % o === 0);

export const SCRIPT = {
  title: 'خواص قواسم عدد طبيعي',
  steps: [
    {
      id: 'situation',
      kind: 'situation',
      chapter: 'نكتشف',
      title: 'هوّتان تصيران هوّة واحدة',
      text: `اللوح ${J.plank} يملأ هوّة من ${G1} خانة وهوّة من ${G2} خانة: $${times(G1, J.plank)}$ و $${times(G2, J.plank)}$. نلصق الهوّتين: هوّة واحدة من ${GLUED} خانة.`,
      question: `هل يثبت الجسر باللوح ${J.plank} فوق ${GLUED} خانة؟`,
      bridge: { a: GLUED, b: J.plank },
      cue: `قبل البناء: من يتوقّع؟ ومن يبرّر دون أن يقسم ${GLUED}؟ كم لوحًا في كلّ هوّة؟`,
    },
    {
      id: 'cut',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'نقصّ بدل أن نلصق',
      text: `من الهوّة ${G2} نقصّ ${G1} خانة: تبقى هوّة من ${CUT} خانة.`,
      question: 'دون أيّ قسمة: أيّ لوح يثبت بالتأكيد؟',
      a: CUT,
      options: [4, 5, 6, J.plank],
      answer: [J.plank],
      after: `${G2 / J.plank} ألواح تملأ الهوّة ${G2}، و ${G1 / J.plank} ألواح تملأ الهوّة ${G1}: نزيل هذه من تلك فيبقى لوحان. $${G2} - ${G1} = ${times(CUT, J.plank)}$.`,
      cue: 'وإذا لصقنا الهوّتين: كم لوحًا؟ وإذا قصصنا: كم لوحًا؟',
    },
    {
      id: 'foil',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'وفي الاتّجاه الآخر؟',
      text: `اللوح ${J.plank} لا يملأ ${F1} خانة ولا ${F2} خانة: $${euclid(F1, J.plank)}$ و $${euclid(F2, J.plank)}$. نلصق الهوّتين: ${FOIL} خانة.`,
      question: `أيّ الألواح يثبت فوق ${FOIL} خانة؟`,
      a: FOIL,
      options: [4, 5, J.plank, 8],
      answer: [J.plank],
      after: `$${times(FOIL, J.plank)}$: الخانات الباقية $${F1 % J.plank} + ${F2 % J.plank} = ${J.plank}$ صنعت لوحًا كاملًا. ثبت الجسر فوق المجموع، ولم يثبت فوق أيّ من الهوّتين.`,
      cue: 'لوح يملأ المجموع: هل يملأ كلًّا من الهوّتين؟ وإذا ملأهما معًا؟',
    },
    {
      id: 'name-1',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: 'jam-wal-farq',
      recall: ['مجموعهما', 'فرقهما'],
      cue: 'اللوح 15 يملأ 30 خانة و 45 خانة: أيّ هوّتين أخريين يملأ بالتأكيد؟',
    },
    {
      id: 'stack',
      kind: 'ask',
      chapter: 'نكتشف',
      title: `جسر يتكرّر ${K.copies} مرّة`,
      text: `الألواح ${K.plank} تملأ جسرًا من ${K.bridge} خانة: $${times(K.bridge, K.plank)}$. نكرّر هذا الجسر ${K.copies} مرّة: $${K.bridge} \\times ${K.copies} = ${COPIES}$ خانة، جسر لا نرسمه.`,
      question: 'أيّ لوحين نعرف دون قسمة أنّهما يثبتان؟',
      a: COPIES,
      options: [3, K.plank, 7, 11],
      answer: [3, K.plank],
      after: `في كلّ نسخة ${K.bridge / K.plank} ألواح، وفي ${K.copies} نسخة: $${COPIES} = ${K.plank} \\times (${K.bridge / K.plank} \\times ${K.copies}) = ${K.plank} \\times ${COPIES / K.plank}$. واللوح 3 كذلك: $${times(K.bridge, 3)}$. أمّا 7 و 11 فالبناء وحده يحكم.`,
      cue: `هل قسمنا ${COPIES} على ${K.plank}؟ كم لوحًا في كلّ نسخة، وكم نسخة؟`,
    },
    {
      id: 'name-2',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: 'madaaf',
      recall: ['مضاعف', 'مهما كان'],
      cue: 'اللوح 4 يملأ 12: هل يملأ 1200؟ وهل يملأ 1201؟ لماذا؟',
    },
    {
      id: 'peel',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'ما يبقى من القسمة',
      text: `هوّة من ${P.long} خانة، وجسر جاهز من ${P.short} خانة: $${euclid(P.long, P.short)}$. تبقى ${REST} خانة دون جسر.`,
      question: `قبل البناء: أيّ الألواح تملأ الهوّة والجسر معًا؟ ثمّ: أيّها يملأ الباقي ${REST}؟`,
      a: REST,
      options: [...P.planks],
      answer: P.planks.filter((o) => REST % o === 0),
      after: `الألواح ${COMMON.join(' و ')} تملأ ${P.long} و ${P.short} معًا، فتملأ الباقي: $${REST} = ${P.long} - ${P.short} \\times ${PEEL_Q}$.`,
      cue: `اللوح 10 يملأ ${P.short}: لماذا لا يملأ الباقي ${REST}؟`,
    },
    {
      id: 'name-3',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: 'baqi-qisma',
      recall: ['باقي القسمة', 'فرق عددين'],
      cue: 'اللوح 3 يملأ 45 و 12. ما باقي قسمة 45 على 12؟ وهل يملؤه اللوح 3؟',
    },
    {
      id: 'harbour',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'جسر المرفأ',
      text: `جسر المرفأ هو الجسران معًا: $${B.long} + ${B.short} = ${HARBOUR}$. ونعرف: $${times(B.long, B.plank)}$ و $${times(B.short, B.plank)}$.`,
      question: `أيّ الألواح يثبت فوق ${HARBOUR} خانة؟ ومن يكتب ${HARBOUR} جداءً عامله ${B.plank} دون أن يقسم؟`,
      a: HARBOUR,
      options: [25, ...B.options, 40],
      answer: [B.plank],
      after: `$${HARBOUR} = ${B.plank} \\times ${B.long / B.plank} + ${B.plank} \\times ${B.short / B.plank} = ${B.plank} \\times (${B.long / B.plank} + ${B.short / B.plank})$: ${HARBOUR / B.plank} لوحًا، دون أيّ قسمة.`,
      cue: 'ما العامل المشترك في الجداءين؟ ماذا فعلنا به؟',
    },
    {
      id: 'other',
      kind: 'ask',
      chapter: 'نكتشف',
      title: 'أعداد أخرى، الحساب نفسه',
      text: `العالم يختار عددين آخرين: $${times(OA, OTHER.d)}$ و $${times(OB, OTHER.d)}$. نلصقهما: ${OA + OB} خانة.`,
      question: `أيّ الألواح يثبت فوق ${OA + OB} خانة؟ اكتبوا الحساب كما في جسر المرفأ.`,
      a: OA + OB,
      options: [7, 11, OTHER.d, 17],
      answer: [OTHER.d],
      after: `$${OA} + ${OB} = ${OTHER.d} \\times ${OTHER.p} + ${OTHER.d} \\times ${OTHER.q} = ${OTHER.d} \\times (${OTHER.p} + ${OTHER.q}) = ${OTHER.d} \\times ${OTHER.p + OTHER.q}$: الخطوات نفسها، والأعداد غيرها.`,
      cue: 'تتغيّر الأعداد في كلّ مرّة: ما الذي يبقى؟ اكتبوه بالحروف.',
    },
    {
      id: 'name-4',
      kind: 'name',
      chapter: 'نسمّي',
      tablet: 'burhan',
      recall: ['عدد طبيعي', 'بحروف'],
      cue: 'برهنوا بالحروف أنّ القاسم المشترك يقسم الفرق.',
    },
    // the copybook is two pages of two keys: the four tablets of this lesson are too long for one screen
    {
      id: 'trace-1',
      kind: 'trace',
      chapter: 'نكتب',
      title: 'على الكرّاس: المفتاحان 1 و 2',
      tablets: ['jam-wal-farq', 'madaaf'],
      cue: 'بعد النقل: من يذكّرنا بالمفتاحين دون أن ينظر إلى السبّورة؟',
    },
    {
      id: 'trace-2',
      kind: 'trace',
      chapter: 'نكتب',
      title: 'على الكرّاس: المفتاحان 3 و 4',
      tablets: ['baqi-qisma', 'burhan'],
      cue: 'بعد النقل: من يذكّرنا بالمفاتيح الأربعة دون أن ينظر إلى السبّورة؟',
    },
  ],
};
