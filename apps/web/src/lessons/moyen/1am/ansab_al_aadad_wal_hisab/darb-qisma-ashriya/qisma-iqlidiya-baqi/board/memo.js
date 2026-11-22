/**
 * « مذكّرة الدرس » WRITTEN for this lesson (CLASS_SESSION.md §2quater) — the model and its parts:
 * `features/classSession/lessonMemos.js`. Every number is checked by a test (`board.test.js`). Own wording: nothing is
 * quoted from the textbook. Reached only through the lesson's pack (`lesson.pack.js › board.memo`).
 * The numbers of the story are read from `world/story.js › NUMBERS` and `SPYGLASS`. Fields drawn as plain text by
 * `BoardMemo.jsx` (goal, idea, trap, can, stands, the openings, the phases, the sequence, next) hold no formula; the
 * others may. The drawings of the openings (`MemoFigures.jsx`) write fixed word forms: « N ألواح », « تبقى N خانات »,
 * « N رفًّا », « N بلاطات » — the numbers below stay where those words agree (tested).
 */
import { cabinsOf, travellersOf } from '../world/counted';
import { NUMBERS, SPYGLASS, divide, upTo } from '../world/story';

const { count: C, groups: GR, rests: RS, rebuild: RB, cable: CB } = NUMBERS;
const { a: SA, b: SB, tens: TENS } = SPYGLASS;
const UP = upTo(TENS);
const euclid = (n, d) => {
  const { q, r } = divide(n, d);
  return `${n} = ${d} \\times ${q} + ${r}`;
};
const SIT = divide(GR.a, GR.moulds[0]);
const RBD = divide(RB.a, RB.probe);
const SCOPE = divide(SA, SB);
const CABLE = divide(CB.a, CB.b);
/** The gap where a plank of 8 leaves its longest leftover: the board's second question grows it by one cell. */
const TOP = GR.a - (GR.a % GR.probe) + GR.probe - 1;

/** The opening situations a teacher may choose from. `kind` selects the drawing (`MemoFigures.jsx`); a, b = the numbers. */
const OPENINGS = [
  {
    id: 'bridge',
    kind: 'bridge',
    a: GR.a,
    b: GR.moulds[0],
    board: true,
    title: `هوّة من ${GR.a} خانة`,
    story: `بين جزيرتين هوّة من ${GR.a} خانة، والألواح طولها ${GR.moulds[0]}. نضع الألواح الكاملة من الضفّة واحدًا بعد الآخر.`,
    ask: 'كم لوحًا كاملًا يدخل؟ وكم خانة تبقى فارغة؟',
    why: 'هي وضعية «الدرس على السبّورة»: الألواح تُعدّ قبل أيّ كلمة عن القسمة.',
    expect: `بعضهم يعدّ ${GR.moulds[0]} ثمّ ${GR.moulds[0] * 2} ثمّ ${GR.moulds[0] * 3}… ويتوقّف عند ${GR.moulds[0] * SIT.q}؛ آخرون يقولون ${SIT.q + 1} ألواح وينسون أنّ اللوح الأخير لا يجد مكانًا.`,
  },
  {
    id: 'teams',
    kind: 'teams',
    a: 31,
    b: 4,
    board: false,
    title: 'فِرق حصّة الرياضة',
    story: 'في حصّة الرياضة 31 لاعبًا، والأستاذ يريد 4 فِرق متساوية تمامًا.',
    ask: 'كم لاعبًا في كلّ فريق؟ وكم لاعبًا يبقى ليصفّر أو يحسب النقاط؟',
    why: 'قريبة من يوم التلميذ: من يبقى خارج الفِرق هو الباقي، والفِرق لا تقبل لاعبًا زائدًا.',
    expect: 'بعضهم يقول 8 في كلّ فريق؛ العدّ يحكم: 4 فِرق من 8 تحتاج 32 لاعبًا.',
  },
  {
    id: 'shelves',
    kind: 'shelves',
    a: 150,
    b: 12,
    alt: 10,
    board: false,
    title: 'كتب المكتبة',
    story:
      'وصلت المكتبة 150 كتابًا. في المخزن رفوف تسع 12 كتابًا ورفوف تسع 10 كتب، وكلّ رفّ يُملأ تمامًا قبل الذي بعده.',
    ask: 'كم رفًّا مملوءًا مع كلّ نوع؟ وكم كتابًا يبقى دون رفّ؟',
    why: 'نوعان من الرفوف للكتب نفسها: حاصلان وباقيان، ونرى أنّ الباقي يتغيّر مع حجم الرفّ.',
    expect: 'مع رفوف 12 يبقى 6 كتب؛ بعضهم يضعها في رفّ ثالث عشر غير مملوء ويعدّه رفًّا.',
  },
  {
    id: 'tiles',
    kind: 'tiles',
    a: 70,
    b: 8,
    alt: 7,
    board: false,
    title: 'شريط الجدار',
    story: 'شريط من الجدار طوله 70 cm، وبلاطات مربّعة ضلعها 8 cm أو 7 cm. لا نقطع أيّ بلاطة.',
    ask: 'كم بلاطة كاملة ندخل مع كلّ نوع؟ وما طول الفراغ الذي يبقى؟',
    why: 'الطول يجعل الباقي مرئيًّا: فراغ أقصر من بلاطة.',
    expect: 'مع 8 cm يبقى فراغ 6 cm؛ بعضهم يقترح بلاطة أخرى، والشريط يحكم: لا مكان لها.',
  },
];

export const MEMO = {
  title: 'القسمة الإقليدية',
  // ── the one page for the desk ──
  glance: {
    goal: 'في نهاية الحصّة يجد التلميذ حاصل القسمة الإقليدية وباقيها، ويعرف أنّ الباقي أصغر من المقسوم عليه، ويكتب المساواة، ويقدّر عشرات الحاصل حين يكون المقسوم عليه من رقمين، ويقرأ الحاصل والباقي في مسألة توزيع.',
    idea: 'نضع أكبر عدد من الألواح الكاملة حتّى لا يدخل لوح آخر: عددها الحاصل، وما يبقى الباقي، وهو أقصر من لوح. والألواح مع ما بقي تعيد الهوّة كاملة. وفي مسألة، السؤال هو الذي يقول أيّ العددين نقرأ.',
    trap: 'أن يتوقّف التلميذ مبكّرًا فيكتب مساواة صحيحة باقيها أكبر من المقسوم عليه، أو أن يخطئ في مرتبة الحاصل حين يكون المقسوم عليه من رقمين، أو أن يجيب بالحاصل وحده في مسألة بقي فيها شيء.',
    minutes: [
      { moment: 'start', label: 'اختبار البداية', min: 7 },
      { moment: 'revise', label: 'مراجعة القواعد', min: 5 },
      { moment: 'lesson', label: 'الدرس على السبّورة', min: 25 },
      { moment: 'end', label: 'اختبار النهاية', min: 8 },
    ],
    three: [
      `$${euclid(GR.a, GR.moulds[0])}$: لماذا نتوقّف عند ${SIT.q} ألواح؟`,
      'هل يمكن أن تبقى 7 خانات مع ألواح طولها 6؟ لماذا؟',
      `$${SB} \\times ${TENS} = ${SB * TENS}$: كم لوحًا من ${SB} يدخل في ${SA} خانة تقريبًا؟`,
    ],
  },
  // ── goal and success criteria: what can be SEEN or HEARD ──
  criteria: [
    {
      can: 'يجد عدد الألواح الكاملة ويعرف متى يتوقّف.',
      see: `في ${C.a} خانة وألواح 7 يقول: 4 ألواح، لأنّ $7 \\times 4 = 28$ و $7 \\times 5 = 35$.`,
      check: { a: C.a, b: 7, q: 4, r: 2 },
    },
    {
      can: 'يعرف أنّ الباقي أصغر من المقسوم عليه، ويرفض باقيًا لا يمكن أن يبقى.',
      see: `يقول: مع ألواح طولها 6 لا تبقى 7 خانات أبدًا، فـ $${euclid(RS.a, 6)}$.`,
      check: { a: RS.a, b: 6, ...divide(RS.a, 6) },
    },
    {
      can: 'يكتب مساواة القسمة الإقليدية ويتحقّق من شرط الباقي.',
      see: `يعيد الهوّة من ألواحها: $${euclid(RB.a, RB.probe)}$، ويرفض $${RB.a} = ${RB.probe} \\times ${RBD.q - 1} + ${RBD.r + RB.probe}$ لأنّ الباقي أكبر من ${RB.probe}.`,
      check: { a: RB.a, b: RB.probe, q: RBD.q, r: RBD.r },
    },
    {
      can: 'يقدّر عشرات الحاصل قبل القسمة على عدد من رقمين.',
      see: `يقول: $${SB} \\times ${TENS} = ${SB * TENS}$ و $${SB} \\times ${UP} = ${SB * UP}$، فالحاصل بين ${TENS} و ${UP}.`,
      check: { a: SA, b: SB, q: SCOPE.q, r: SCOPE.r },
    },
    {
      can: 'يقرأ الحاصل والباقي في مسألة توزيع: الممتلئة، اللازمة، ومن يبقى.',
      see: `يقول: $${euclid(CB.a, CB.b)}$، تمتلئ ${cabinsOf(CABLE.q)} ويبقى ${travellersOf(CABLE.r)}، فتلزم ${cabinsOf(CABLE.q + 1)}.`,
      check: { a: CB.a, b: CB.b, q: CABLE.q, r: CABLE.r },
    },
  ],
  stands: 'جدول الضرب، والطرح، ومقارنة عددين، ومعنى «كم مرّة يدخل عدد في عدد» من السنوات الماضية.',
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
      watch: 'جدول الضرب والطرح: إن تعثّر نصف القسم فيهما، أطل المراجعة.',
    },
    {
      moment: 'revise',
      name: 'مراجعة القواعد',
      min: 5,
      aim: 'نستحضر ما سنحتاجه.',
      teacher: 'يختار قارئًا أو يقرأ هو؛ يطلب مثالًا قبل أن يُظهر المثال.',
      class: 'يقرؤون القاعدة ويعطون مثالًا من عندهم.',
      watch: 'ضرب عدد في 10 وفي 20 وفي 30: سنحتاجه لتقدير الحاصل.',
    },
    {
      moment: 'lesson',
      name: 'الدرس على السبّورة',
      min: 25,
      aim: 'القسم يعدّ الألواح، يرى الجسور تحكم، ثمّ يسمّي كلّ مفتاح.',
      teacher:
        'يسأل قبل كلّ بناء: «من يتوقّع؟ ولماذا؟»؛ لا يعطي القاعدة؛ يطلب الجداء بدل العدّ واحدًا واحدًا. خمس محطّات: نحو أربع دقائق لكلّ مفتاح، والكرّاس في الآخر.',
      class: 'يجيبون عن كلّ سؤال، ثمّ يرون الجسور تُبنى؛ وبعد ذلك فقط يأخذ المفتاح اسمه.',
      watch: 'من يتوقّف مبكّرًا: اسأله هل يدخل لوح آخر فيما بقي. ومن يجيب بالحاصل في مسألة: اسأله أين يذهب من بقي.',
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
      says: `«$${euclid(GR.a, GR.moulds[0])}$: ${SIT.q} ألواح، وتبقى ${SIT.r} خانات».`,
      assess: `هل يدخل لوح آخر؟ كم خانة يحتاج اللوح رقم ${SIT.q + 1}؟`,
      advance: `هل يمكن أن تبقى ${GR.moulds[0]} خانات؟`,
    },
    {
      kind: 'right',
      says: `«$${SB} \\times ${TENS} = ${SB * TENS}$، إذن الحاصل ${TENS} أو أكثر».`,
      assess: `وهل يصل إلى ${UP}؟ كم خانة تغطّي ${UP} لوحًا؟`,
      advance: 'كيف نجد الآحاد بعد العشرات؟',
    },
    {
      kind: 'miss',
      says: `«$${RB.a} = ${RB.probe} \\times ${RBD.q - 1} + ${RBD.r + RB.probe}$، إذن الحاصل ${RBD.q - 1} والباقي ${RBD.r + RB.probe}».`,
      assess: `هل يدخل لوح آخر طوله ${RB.probe} في ${RBD.r + RB.probe} خانة؟`,
      advance: 'ما الشرط الذي ينقص هذه المساواة؟',
    },
    {
      kind: 'miss',
      says: '«ألواح طولها 6 تركت 7 خانات فارغة».',
      assess: 'ضع لوحًا آخر في الخانات السبع: هل يدخل؟',
      advance: 'ما أكبر باقٍ ممكن مع ألواح طولها 6؟',
    },
    {
      kind: 'miss',
      says: `«الحاصل 2: العدد ${SB} يدخل مرّتين في ${Math.floor(SA / 10)}».`,
      assess: `كم خانة يغطّي لوحان طولهما ${SB}؟ وكم يبقى من ${SA}؟`,
      advance: `المرّتان في ${Math.floor(SA / 10)}: عشرات أم آحاد؟`,
    },
    {
      kind: 'miss',
      says: `«$${euclid(CB.a, CB.b)}$، إذن ${cabinsOf(CABLE.q)} تكفي».`,
      assess: `كم مسافرًا تحمل ${cabinsOf(CABLE.q)} ممتلئة؟ وأين يذهب الباقون؟`,
      advance: 'ومتى يكون الحاصل نفسه هو عدد العربات اللازمة؟',
    },
    {
      kind: 'miss',
      says: '«الباقي 0 دائمًا، وإلّا فالقسمة خاطئة».',
      assess: `$${euclid(GR.a, GR.moulds[0])}$: هل فيها خطأ؟`,
      advance: 'متى يكون الباقي 0؟ وماذا يعني ذلك للجسر؟',
    },
  ],
  // ── which answers go on the board, in what order, and the link between them ──
  sequence: [
    `أوّلًا هوّة من ${GR.a} خانة وألواح ${GR.moulds[0]}: ${SIT.q} ألواح كاملة، ثمّ نتوقّف.`,
    `ثمّ كم لوحًا كاملًا: في ${C.a} خانة يدخل اللوح ${C.plank} خمس مرّات بالضبط، واللوح ${C.probe} سبع مرّات ولا يدخل الثامن.`,
    `ثمّ خانة واحدة أكثر: ${TOP} خانة تترك مع اللوح ${GR.probe} سبع خانات، و ${TOP + 1} خانة لا تترك شيئًا.`,
    `ثمّ هوّة نعيدها من ألواحها وخاناتها الفارغة: ${RB.a} خانة، وسؤال ريم التي توقّفت مبكّرًا.`,
    `ثمّ منظار الجزيرة: نقدّر العشرات أوّلًا، ثمّ الآحاد.`,
    `أخيرًا محطّة التليفريك: القسمة نفسها تقول كم عربة تمتلئ، وكم مسافرًا يبقى، وكم عربة تلزم.`,
  ],
  connect:
    'المفاتيح الخمسة قسمة واحدة: نعدّ الألواح الكاملة (الحاصل $q$)، وما يبقى أقصر من لوح ($r < b$)، والهوّة تُعاد منهما ($a = b \\times q + r$)؛ وحين يكبر $a$ نقدّر عشرات $q$ أوّلًا؛ وفي مسألة نقرأ $q$ أو $r$ أو $q + 1$ بحسب السؤال.',
  // ── what is written, the short check, support and extension ──
  written: [
    'حاصل القسمة الإقليدية للعدد $a$ على $b$ هو أكبر عدد من المرّات يدخل فيها $b$ في $a$.',
    'الباقي $r$ أصغر من المقسوم عليه: $r < b$.',
    '$a = b \\times q + r$ حيث $r < b$: $a$ المقسوم، $b$ المقسوم عليه، $q$ الحاصل، $r$ الباقي.',
    'للقسمة على عدد من رقمين نقدّر عشرات الحاصل أوّلًا: $b \\times 10$، $b \\times 20$…',
    'في مسألة توزيع: $q$ عدد المجموعات الكاملة، و $r$ ما يبقى خارجها؛ ليُؤخذ الكلّ تلزم $q$ مجموعة إذا كان $r = 0$، و $q + 1$ إذا بقي شيء.',
  ],
  exit: [
    {
      q: 'ألواح طولها 9 في هوّة من 75 خانة: كم لوحًا كاملًا؟ وكم خانة تبقى؟',
      a: '$75 = 9 \\times 8 + 3$: 8 ألواح، وتبقى 3 خانات.',
      check: { a: 75, b: 9, q: 8, r: 3 },
    },
    {
      q: 'هل $50 = 7 \\times 6 + 8$ قسمة إقليدية للعدد 50 على 7؟ برّر.',
      a: 'لا: الباقي 8 أكبر من 7. القسمة الإقليدية: $50 = 7 \\times 7 + 1$.',
      check: { a: 50, b: 7, q: 7, r: 1 },
    },
    {
      q: 'قدّر عشرات حاصل قسمة 815 على 32، ثمّ أكمل القسمة.',
      a: '$32 \\times 20 = 640$ و $32 \\times 30 = 960$: الحاصل بين 20 و 30؛ $815 = 32 \\times 25 + 15$.',
      check: { a: 815, b: 32, q: 25, r: 15 },
    },
    {
      q: '110 تلاميذ في رحلة، وفي كلّ حافلة 25 مقعدًا: كم حافلة تلزم؟ وكم مقعدًا يبقى شاغرًا؟',
      a: '$110 = 25 \\times 4 + 10$: 4 حافلات ممتلئة ويبقى 10 تلاميذ، فتلزم 5 حافلات، ويبقى 15 مقعدًا شاغرًا.',
      check: { a: 110, b: 25, q: 4, r: 10 },
    },
  ],
  support: [
    'أعداد صغيرة أوّلًا: ألواح طولها 3 في 14 خانة، ونعدّ 3، 6، 9، 12… ونتوقّف.',
    'ارسم الألواح على شريط من المربّعات، ولوّن الخانات الباقية.',
    'لتقدير الحاصل: اكتب المقسوم عليه مضروبًا في 10 و 20 و 30 قبل أن تبدأ.',
  ],
  extend: [
    'ما أكبر باقٍ ممكن في القسمة على 27؟ أعطِ عددًا يتركه.',
    'قسمة عدد على 9 أعطت الحاصل 12 وأكبر باقٍ ممكن. ما هذا العدد؟',
    'أوجد كلّ الأعداد التي حاصل قسمتها على 6 هو 4.',
  ],
  extendCheck: { biggest: { b: 27, a: 53 }, number: { b: 9, q: 12, a: 116 }, all: { b: 6, q: 4, from: 24, to: 29 } },
  next: 'الحصّة القادمة: «قواعد قابلية القسمة» — متى يكون الباقي 0؟ ونعرف ذلك من أرقام العدد، دون أن نقسم.',
};
