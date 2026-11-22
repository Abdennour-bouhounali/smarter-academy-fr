/**
 * « مذكّرة الدرس » WRITTEN for this lesson (CLASS_SESSION.md §2quater) — the model and its parts:
 * `features/classSession/lessonMemos.js`. Every number is checked by a test (`board.test.js`). Own wording: nothing is
 * quoted from the textbook, and no number is a sheet of the exercise bank. Reached only through the lesson's pack
 * (`lesson.pack.js › board.memo`).
 * The numbers of the story are read from `world/story.js › NUMBERS` and `STONE`. Fields drawn as plain text by
 * `BoardMemo.jsx` (goal, idea, trap, can, stands, the openings, the phases, the sequence, next) hold no formula; the
 * others may.
 * Words: b is « المقسوم عليه »; « قاسم » is kept for « b يقسم a ». Every rule written here holds on the edges (r = 0,
 * a < b, a = b): the bracket is stated with 0 < r < b.
 */
import { cells, planks } from '../world/counted';
import { NUMBERS, STONE } from '../world/story';

const { intro: I, recall: C, long: L, bracket: H, exact: X, trips: T } = NUMBERS;
const q = (a, b) => Math.floor(a / b);
/** The long plank whose division is worked with a correction: ten planks, 9 tried (too big), then 8. */
const TRY = L.moulds[1];
const TRY_LEFT = L.gap - TRY * 10;
const TRY_DIGIT = q(TRY_LEFT, TRY);
/** The long plank that the usual slips are shown on. */
const L3 = L.moulds[2];
const LQ = q(L.gap, L3);
const NEAR = Math.round(L3 / 100) * 100;
const BR = H.moulds[0];
const HQ = q(H.gap, BR);
const NEXT = H.moulds[1];

/** The opening situations a teacher may choose from. `kind` selects the drawing (`MemoFigures.jsx`); a, b = the numbers. */
const OPENINGS = [
  {
    id: 'bridge',
    kind: 'bridge',
    a: I.gap,
    b: I.plank,
    board: true,
    title: `هوّة من ${cells(I.gap, 'gen')}`,
    story: `الجسور مقطوعة بين الجزر. أمامنا هوّة من ${cells(I.gap, 'gen')}، وألواح طولها ${I.plank}.`,
    ask: 'هل يثبت الجسر؟ وكم لوحًا يلزمه؟ من يجيب قبل البناء؟',
    why: 'هي وضعية «الدرس على السبّورة»: هوّة قصيرة يُرسم كلّ لوح فيها، قبل الهوّات الطويلة والألواح الطويلة.',
    expect: `بعضهم يعدّ ${I.plank} ثمّ ${2 * I.plank} ثمّ ${3 * I.plank}… حتّى ${I.gap}؛ آخرون يتذكّرون جدول ${I.plank}: ${planks(I.gap / I.plank)}.`,
  },
  {
    id: 'teams',
    kind: 'teams',
    a: 38,
    b: 5,
    board: false,
    title: 'فِرق الدورة الرياضية',
    story: 'في دورة رياضية بالمتوسّطة 38 لاعبًا، نوزّعهم على 5 فِرق متساوية.',
    ask: 'كم لاعبًا في كلّ فريق؟ كم لاعبًا يبقى خارج الفِرق؟ هل يمكن أن يبقى 5؟',
    why: 'قريبة من يوم التلميذ: من يبقون خارج الفِرق لا يكفون ليأخذ كلّ فريق لاعبًا آخر.',
    expect: 'يقول بعضهم 7 في كلّ فريق ويبقى 3؛ قد يقترح آخرون 6 في كلّ فريق ويبقى 8، فنسألهم: وهؤلاء الثمانية؟',
  },
  {
    id: 'shelves',
    kind: 'shelves',
    a: 150,
    b: 12,
    alt: 10,
    board: false,
    title: 'رفوف المكتبة',
    story: 'وصلت مكتبة المتوسّطة 150 كتابًا. في المخزن رفوف تسع 12 كتابًا ورفوف تسع 10 كتب.',
    ask: 'مع رفوف 12: كم رفًّا يمتلئ تمامًا؟ وكم رفًّا يلزم لكلّ الكتب؟ وأيّ النوعين لا يترك كتابًا؟',
    why: 'تحمل حصر حاصل القسمة: الرفوف المملوءة والرفوف اللازمة عددان متتاليان ما دام كتاب باقيًا.',
    expect: 'يجيب بعضهم 12 رفًّا وينسى الكتب الستّة الباقية: الرفّ الثالث عشر يأخذها.',
  },
  {
    id: 'tiles',
    kind: 'tiles',
    a: 90,
    b: 20,
    alt: 15,
    board: false,
    title: 'بلاطات الجدار',
    story:
      'شريط من الجدار طوله 90 cm نغطّيه ببلاطات مربّعة دون قطع أيّ بلاطة. في المخزن بلاطات ضلعها 20 cm وبلاطات ضلعها 15 cm.',
    ask: 'أيّ البلاطات تغطّي الشريط تمامًا؟ وماذا نقول عن العددين 90 و 15 عندئذ؟',
    why: 'تحمل انعدام الباقي: البلاطات الكاملة هي نفسها البلاطات اللازمة.',
    expect: 'مع 20 يبقى فراغ 10 cm؛ مع 15 تكفي 6 بلاطات، فيقول بعضهم: 15 يقسم 90.',
  },
];

export const MEMO = {
  title: 'القسمة الإقليدية وحصر حاصل القسمة',
  // ── the one page for the desk ──
  glance: {
    goal: 'في نهاية الحصّة يقسم التلميذ عددًا طبيعيًّا على أيّ عدد غير معدوم، ولو من ثلاثة أرقام، ويحصر حاصل القسمة بين عددين طبيعيين متتاليين، ويعبّر عن انعدام الباقي بجمل لها معنى واحد.',
    idea: 'مع أيّ لوح، ولو كان طويلًا، نجد ألواحًا كاملة وباقيًا أصغر من اللوح: كلّ رقم من عددها يُجرَّب ثمّ يحكم عليه جداؤه. الألواح الكاملة والألواح اللازمة عددان متتاليان ما دام شيء باقيًا، وعدد واحد حين لا يبقى شيء.',
    trap: 'أن يثق التلميذ برقم قدّره دون أن يضربه في المقسوم عليه نفسه، أو أن يكتب باقيًا أكبر من المقسوم عليه، أو أن يعطي عدد الألواح الكاملة حين يُسأل عن الألواح اللازمة.',
    minutes: [
      { moment: 'start', label: 'اختبار البداية', min: 7 },
      { moment: 'revise', label: 'مراجعة القواعد', min: 5 },
      { moment: 'lesson', label: 'الدرس على السبّورة', min: 25 },
      { moment: 'end', label: 'اختبار النهاية', min: 8 },
    ],
    three: [
      `$${L.gap} = ${L3} \\times ${LQ} + ${L.gap % L3}$: لماذا لا يكون الحاصل ${LQ + 1}؟ ولماذا لا يكون ${LQ - 1}؟`,
      `$${H.gap} = ${BR} \\times ${HQ} + ${H.gap % BR}$: بين أيّ عددين متتاليين يقع $${H.gap} \\div ${BR}$؟`,
      `$${X.gap} = ${X.plank} \\times ${X.gap / X.plank}$: قل ذلك بثلاث جمل أخرى.`,
    ],
  },
  // ── goal and success criteria: what can be SEEN or HEARD ──
  criteria: [
    {
      can: 'يقسم عددًا طبيعيًّا على عدد من ثلاثة أرقام: يقدّر كلّ رقم من الحاصل، يضربه في المقسوم عليه، ثمّ يصحّحه.',
      see: `في ${TRY_LEFT} مع ${TRY} يجرّب ${TRY_DIGIT + 1}، يجد $${TRY} \\times ${TRY_DIGIT + 1} = ${TRY * (TRY_DIGIT + 1)}$ فينقص إلى ${TRY_DIGIT}: $${L.gap} = ${TRY} \\times ${q(L.gap, TRY)} + ${L.gap % TRY}$.`,
      check: { a: L.gap, b: TRY, q: q(L.gap, TRY), r: L.gap % TRY },
    },
    {
      can: 'يرفض مساواة باقيها أكبر من المقسوم عليه أو يساويه.',
      see: `يقول إنّ $${L.gap} = ${L3} \\times ${LQ - 1} + ${(L.gap % L3) + L3}$ ليست القسمة الإقليدية: يدخل لوح آخر.`,
      check: { a: L.gap, b: L3, q: LQ, r: L.gap % L3 },
    },
    {
      can: 'يحصر حاصل القسمة بين عددين طبيعيين متتاليين ويسمّيهما قيمتين مقرّبتين إلى الوحدة بالنقصان وبالزيادة.',
      see: `يكتب $${HQ} < ${H.gap} \\div ${BR} < ${HQ + 1}$ ويقول: ${HQ} لوحًا كاملًا، و ${HQ + 1} لوحًا لازمًا.`,
      check: { a: H.gap, b: BR, q: HQ, r: H.gap % BR },
    },
    {
      can: 'يعبّر عن انعدام الباقي بجمل لها معنى واحد، ويعرف أنّ حاصل القسمة عندئذ عدد طبيعي بالضبط.',
      see: `يكتب $${X.gap} \\div ${X.plank} = ${X.gap / X.plank}$ ويقول: ${X.plank} يقسم ${X.gap}، و ${X.gap} مضاعف للعدد ${X.plank}.`,
      check: { a: X.gap, b: X.plank, q: X.gap / X.plank, r: 0 },
    },
  ],
  stands:
    'القسمة الإقليدية على عدد من رقم أو رقمين (عشرات الحاصل ثمّ آحاده) وكتابتها مساواةً من السنة الأولى، وجداول الضرب، والضرب في 10 وفي 100، ومعنى «مضاعف» و«قاسم».',
  // ── several opening situations, each drawn ──
  openings: OPENINGS,
  // ── the hour, as « حصّة القسم » runs it: launch → explore → summarize ──
  phases: [
    {
      moment: 'start',
      name: 'اختبار البداية',
      min: 7,
      aim: 'أين القسم قبل الدرس؟',
      teacher: 'يُعطي الفأرة للتلميذ الذي حان دوره، ولا يصحّح بعد.',
      class: 'كلّ تلميذ يجيب باسمه؛ الفِرق تجمع نقاطها.',
      watch: 'القسمة على عدد من رقمين والضرب في 10: إن تعثّر نصف القسم فيهما، أطل المراجعة.',
    },
    {
      moment: 'revise',
      name: 'مراجعة القواعد',
      min: 5,
      aim: 'نستحضر ما سنحتاجه.',
      teacher: 'يختار قارئًا أو يقرأ هو؛ يطلب مثالًا قبل أن يُظهر المثال.',
      class: 'يقرؤون القاعدة ويعطون مثالًا من عندهم.',
      watch: 'الباقي أصغر من المقسوم عليه، ومعنى «مضاعف» و«قاسم».',
    },
    {
      moment: 'lesson',
      name: 'الدرس على السبّورة',
      min: 25,
      aim: 'القسم يتوقّع، يرى الجسور تحكم، ثمّ يسمّي كلّ مفتاح.',
      teacher:
        'يسأل قبل كلّ بناء: «من يتوقّع؟ ولماذا؟»؛ لا يعطي القاعدة؛ مع اللوح الطويل يطلب رقمًا يُجرَّب ثمّ جداءه، لا جدول مضاعفات كاملًا.',
      class: 'يجيبون عن كلّ سؤال، ثمّ يرون الجسور تُبنى؛ وبعد ذلك فقط يأخذ المفتاح اسمه.',
      watch: 'من يخلط الألواح الكاملة بالألواح اللازمة: اسأله ماذا يحدث للخانات الباقية.',
    },
    {
      moment: 'end',
      name: 'اختبار النهاية',
      min: 8,
      aim: 'ماذا غيّرت الحصّة؟',
      teacher: 'يقارن «في بداية الحصّة / الآن»، ويسمّي من استدرك.',
      class: 'يجيبون عن أسئلة الدرس الجديد.',
      watch: 'الكفاءة التي بقيت ضعيفة تصير واجب الغد.',
    },
  ],
  // ── what students will likely say or do, and the question for each ──
  anticipated: [
    {
      kind: 'right',
      says: `«$${L.gap} = ${TRY} \\times ${q(L.gap, TRY)} + ${L.gap % TRY}$: جرّبت ${TRY_DIGIT + 1} فتجاوز الجداء ما بقي، فأخذت ${TRY_DIGIT}».`,
      assess: `كيف عرفت أنّ ${TRY_DIGIT + 1} زائد؟ وكيف تتأكّد أنّ ${TRY_DIGIT} ليس ناقصًا؟`,
      advance: `كيف تختار الرقم الذي تجرّبه أوّلًا مع لوح آخر، ${NEXT} في ${H.gap} مثلًا؟`,
    },
    {
      kind: 'right',
      says: `«$${HQ} < ${H.gap} \\div ${BR} < ${HQ + 1}$».`,
      assess: `ماذا يعني ${HQ} على الجسر؟ وماذا يعني ${HQ + 1}؟`,
      advance: 'ومتى يكون حاصل القسمة نفسه عددًا طبيعيًّا؟',
    },
    {
      kind: 'miss',
      says: `«${L3} قريب من ${NEAR}، و $${NEAR} \\times ${LQ - 1} = ${NEAR * (LQ - 1)}$: الحاصل ${LQ - 1}».`,
      assess: `كم يساوي ${L3} في ${LQ - 1}؟ وكم يبقى من ${L.gap}؟`,
      advance: 'بأيّ عدد نضرب لنحكم على الرقم: العدد المقرَّب أم المقسوم عليه نفسه؟',
    },
    {
      kind: 'miss',
      says: `«$${L.gap} = ${L3} \\times ${LQ - 1} + ${(L.gap % L3) + L3}$».`,
      assess: `ابنِ الجسر: هل يدخل لوح آخر طوله ${L3} في ${cells((L.gap % L3) + L3, 'gen')}؟`,
      advance: `ما أكبر باقٍ ممكن مع اللوح ${L3}؟`,
    },
    {
      kind: 'miss',
      says: `«الرحلات اللازمة ${STONE.full}، لأنّ ${T.boxes} مقسومًا على ${T.boat} يعطي ${STONE.full}».`,
      assess: 'وماذا نفعل بالصندوقين الباقيين على الرصيف؟',
      advance: 'متى يكون عدد الرحلات اللازمة هو نفسه عدد الرحلات المملوءة؟',
    },
    {
      kind: 'miss',
      says: `«${X.plank} يقسم ${X.gap}، إذن ${X.gap} يقسم ${X.plank}».`,
      assess: `هوّة من ${cells(X.plank, 'gen')} وألواح طولها ${X.gap}: هل يدخل لوح واحد؟`,
      advance: 'أيّ العددين قاسم، وأيّهما مضاعف؟',
    },
  ],
  // ── which answers go on the board, in what order, and the link between them ──
  sequence: [
    `أوّلًا هوّة قصيرة: ${cells(I.gap)} بألواح ${I.plank}، يُرسم كلّ لوح فيها.`,
    `ثمّ قسمة نعرفها: ${cells(C.gap)} بألواح من رقمين، عشرات الألواح ثمّ الألواح.`,
    `ثمّ ألواح من ثلاثة أرقام للهوّة ${L.gap}: رقم يُجرَّب، يُضرب في اللوح، ثمّ يُصحَّح.`,
    `ثمّ لوح ناقص ولوح زائد: ${planks(HQ)} و ${planks(HQ + 1)} مع الهوّة ${H.gap}.`,
    `ثمّ الهوّة ${X.gap}: الألواح الكاملة هي اللازمة، وخمس جمل نحكم عليها.`,
    'أخيرًا جسر الميناء وثمن ألواحه بالدينار.',
  ],
  connect:
    'المفاتيح الثلاثة مساواة واحدة: $a = b \\times q + r$ و $r < b$. لأنّ $0 \\leq r < b$ فإنّ $q \\leq a \\div b < q + 1$؛ وعندما $r = 0$ فإنّ $a \\div b = q$ بالضبط.',
  // ── what is written, the short check, support and extension ──
  written: [
    'لكلّ عددين طبيعيين $a$ و $b$ حيث $b \\neq 0$ عددان طبيعيان $q$ و $r$ حيث $a = b \\times q + r$ و $r < b$؛ نقدّر كلّ رقم من $q$، نضربه في $b$ ثمّ نصحّحه.',
    'إذا كان $0 < r < b$ فإنّ $q < a \\div b < q + 1$: $q$ قيمة مقرّبة إلى الوحدة بالنقصان، و $q + 1$ قيمة مقرّبة إلى الوحدة بالزيادة. حاصل القسمة يُكتب أيضًا $\\frac{a}{b}$.',
    'إذا كان $r = 0$ فإنّ $a \\div b = q$، ونقول: $a$ يقبل القسمة على $b$، $a$ مضاعف للعدد $b$، $b$ يقسم $a$.',
  ],
  exit: [
    {
      q: 'اكتب القسمة الإقليدية للعدد 6000 على 245.',
      a: '$6000 = 245 \\times 24 + 120$، و 120 أصغر من 245.',
      check: { a: 6000, b: 245, q: 24, r: 120 },
    },
    {
      q: 'حافلة تتّسع لـ 52 تلميذًا، و 300 تلميذ في رحلة مدرسية. كم حافلة مملوءة؟ وكم حافلة تلزم؟',
      a: '$300 = 52 \\times 5 + 40$: 5 حافلات مملوءة، وتلزم 6؛ $5 < 300 \\div 52 < 6$.',
      check: { a: 300, b: 52, q: 5, r: 40 },
    },
    {
      q: 'هل يقبل 1176 القسمة على 24؟ برّر بمساواة.',
      a: 'نعم: $1176 = 24 \\times 49$، الباقي معدوم، إذن 24 يقسم 1176.',
      check: { a: 1176, b: 24, q: 49, r: 0 },
    },
  ],
  support: [
    'أعداد صغيرة أوّلًا: 50 على 12، ثمّ 60 على 12.',
    'مع مقسوم عليه طويل، اكتب مضاعفاته في 1 و 2 و 5 و 10 قبل أن تجرّب رقمًا.',
    'ارسم الهوّة وألواحها، ثمّ اكتب تحتها $a = b \\times q + r$ وتحقّق أنّ $r < b$.',
  ],
  extend: [
    'أوجد كلّ الأعداد الطبيعية التي حاصل قسمتها الإقليدية على 13 هو 7.',
    'العدد $a$ طبيعي و $15 < a \\div 8 < 16$. ما القيم الممكنة للعدد $a$؟',
    'باقي قسمة عدد على 9 هو 5. ما باقي قسمة ضعفه على 9؟',
  ],
  // the answers of the extension, computed by the test
  extendCheck: { quotient: { b: 13, q: 7 }, bracket: { b: 8, q: 15 }, double: { b: 9, r: 5 } },
  next: 'الحصّة القادمة: «الكسر: نسبة وحاصل قسمة وقيم مقرّبة» — حاصل قسمة لا يقع على عدد طبيعي نكتبه كسرًا، ونقرّبه.',
};
