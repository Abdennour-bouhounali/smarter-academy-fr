/**
 * « مذكّرة الدرس » WRITTEN for this lesson (CLASS_SESSION.md §2quater) — the model and its parts:
 * `features/classSession/lessonMemos.js`. Every number is checked by a test (`board.test.js`). Own wording: nothing is
 * quoted from the textbook, no line of the exercise bank. Reached only through the lesson's pack (`lesson.pack.js ›
 * board.memo`). The board's courts are read from `script.js › BOARD` (one place). Fields drawn as plain text by
 * `BoardMemo.jsx` (goal, idea, trap, can, stands, the openings, the phases, the sequence, next) hold no formula; the
 * others may. The openings are drawn by the memo figure `court` (`MemoFigures.jsx`): a court and two rods tried on it —
 * a fraction drawn with its bar. ONE NUMBER A LINE where a line is data (`OPENINGS`); a sentence is built from them.
 */
import { BOARD } from './script';

const { opening: O, unreduced: U, chase: C, marks: M, oral: R } = BOARD;
const fr = (p, q) => `${p}/${q}`;
const F = (p, q) => `\\dfrac{${p}}{${q}}`;
const T = (x) => String(x).replace(',', '{,}');

/** The numbers of the two openings the board does not play: a court smaller than one tile, a court no rod rides. */
const SMALL = {
  a: '0,1369',
  b: '0,3',
  alt: '0,37',
};
const NEVER = {
  a: '15',
  b: '3,8',
  top: '31',
  bottom: '8',
};

/** The opening situations a teacher may choose from: a court of area `a` (text), two rods `b` and `alt` tried on it. */
const OPENINGS = [
  {
    id: 'court',
    kind: 'court',
    a: fr(O.top, O.bottom),
    b: O.whole,
    alt: fr(O.sideTop, O.sideBottom),
    board: true,
    title: 'ساحة على بابها كسر',
    story: `في سطح من القصر ساحة مربّعة، على بابها مساحتها كسرًا: ${O.top} على ${O.bottom} بلاطة. كلّ مقياس نجرّبه يبني منصّة مربّعة تنزل في الساحة.`,
    ask: 'أيّ مقياس تركب منصّته المصعد؟ هل يكون عددًا طبيعيًّا؟',
    why: 'هي وضعية «الدرس على السبّورة»: الضلع كسر، والعالم نفسه يحكم.',
    expect: `يجرّب بعضهم ${O.whole} فيبقى شريط، ويأخذ آخرون ضلع البسط وحده؛ ثمّ يقترح أحدهم ${O.sideTop} على ${O.sideBottom} فتركب.`,
  },
  {
    id: 'small',
    kind: 'court',
    a: SMALL.a,
    b: SMALL.b,
    alt: SMALL.alt,
    board: false,
    title: 'ساحة أصغر من بلاطة',
    story: `ركن صغير في ساحة البلدية مربّع، مساحته ${SMALL.a} بلاطة: أصغر من بلاطة واحدة.`,
    ask: 'هل يُكتب طول ضلعه؟ بأيّ عدد؟',
    why: 'تبيّن أنّ المساحة العشرية قد تكون مربّع عدد عشريّ: ضلعها يُكتب.',
    expect: `يظنّ بعضهم أنّ ضلع ساحة أصغر من بلاطة لا يُكتب؛ ثمّ يجرّبون ${SMALL.b} فيبقى شريط، و ${SMALL.alt} فتركب.`,
  },
  {
    id: 'never',
    kind: 'court',
    a: NEVER.a,
    b: NEVER.b,
    alt: fr(NEVER.top, NEVER.bottom),
    board: false,
    title: 'ساحة لا يركبها كسر',
    story: `في ساحة المدرسة مربّع مرسوم مساحته ${NEVER.a} بلاطة، ونبحث عن طول ضلعه بعدد عشريّ أو بكسر.`,
    ask: 'هل نجد عددًا عشريًّا أو كسرًا تركب منصّته؟',
    why: 'تفتح المفتاح الثاني: كلّ مقياس يقترب، ولا مقياس يركب.',
    expect: `يجرّبون ${NEVER.b} فيبقى شريط، ثمّ ${NEVER.top} على ${NEVER.bottom} فتعلق بفرق صغير جدًّا؛ ويسأل بعضهم: ألا يوجد بينهما كسر يركب؟`,
  },
];

export const MEMO = {
  title: 'الأعداد الناطقة والأعداد غير الناطقة',
  // ── the one page for the desk ──
  glance: {
    goal: 'في نهاية الحصّة يعرف التلميذ أنّ ضلع ساحة مساحتها مربّع عدد ناطق يُكتب عددًا ناطقًا ويكتبه، وأنّ ضلع غيرها عدد غير ناطق لا يكتبه كسر ولا عدد عشريّ ولا ما تعرضه الحاسبة، ويعطي مدوَّر جذر بحسم العلامة الوسطى.',
    idea: 'ضلع الساحة كسر حين يكون بسط المساحة ومقامها مربّعين بعد الاختزال. وإلّا فكلّ كسر نجرّبه يترك شريطًا أو يعلق، مهما اقترب. وبين علامتين متجاورتين، منصّة العلامة الوسطى تقول أيّهما أقرب إلى الجدار.',
    trap: 'أن يأخذ التلميذ ضلع البسط وحده، أو يحكم على كسر لم يُختزل، أو يظنّ أنّ كثرة الأرقام في الحاسبة تعني أنّ الضلع لا يُكتب، أو يخلط المدوَّر بالقيمة المقرّبة بالنقصان.',
    minutes: [
      { moment: 'start', label: 'اختبار البداية', min: 7 },
      { moment: 'revise', label: 'مراجعة القواعد', min: 5 },
      { moment: 'lesson', label: 'الدرس على السبّورة', min: 25 },
      { moment: 'end', label: 'اختبار النهاية', min: 8 },
    ],
    three: [
      `لماذا يركب المقياس $${F(O.sideTop, O.sideBottom)}$ الساحة $${F(O.top, O.bottom)}$، ولا يركبها $${F(O.sideTop, O.bottom)}$؟`,
      `لماذا لا يركب أيّ كسر الساحة ${C.area}، وإن اقترب منها إلى قطعة واحدة؟`,
      `لماذا مدوَّر $\\sqrt{${M.area}}$ إلى $0{,}1$ هو $${T(M.lo)}$، وإلى $0{,}01$ هو $${T(M.hi2)}$؟`,
    ],
  },
  // ── goal and success criteria: what can be SEEN or HEARD ──
  criteria: [
    {
      can: 'يتعرّف على المساحة التي هي مربّع عدد ناطق، طبيعيًّا أو عشريًّا أو كسرًا مختزلًا أو غير مختزل، ويكتب ضلعها.',
      see: `يكتب $\\sqrt{${F(U.top, U.bottom)}} = \\sqrt{${F('361', '49')}} = ${F(U.sideTop, U.sideBottom)}$ و $\\sqrt{${T(R.decimal)}} = 3{,}7$.`,
    },
    {
      can: 'يعرف أنّ جذر عدد ليس مربّع عدد ناطق عدد غير ناطق، وأنّ الحاسبة لا تعرض له إلّا قيمة مقرّبة.',
      see: `يقول: $\\sqrt{${C.area}}$ عدد غير ناطق، و $${T(C.calculator)}$ قيمة مقرّبة له فقط.`,
    },
    {
      can: 'يحصر جذرًا بين قيمتين مقرّبتين بالنقصان وبالزيادة، ويعطي مدوَّره بالعلامة الوسطى.',
      see: `يكتب $${T(M.lo)} < \\sqrt{${M.area}} < ${T(M.hi)}$، ثمّ $${T(M.mid)} \\times ${T(M.mid)} = 69{,}7225$، إذن المدوَّر $${T(M.lo)}$.`,
    },
    {
      can: 'يصنّف جذورًا تربيعية: جذر ناطق أو جذر غير ناطق، ويبرّر بالكتابة الكسرية للمساحة.',
      see: `يكتب $\\sqrt{${F('12', '75')}} = \\sqrt{${F('4', '25')}} = ${F('2', '5')}$: عدد ناطق.`,
    },
  ],
  stands:
    'الجذر التربيعي والرمز √ وحصر جذر بين قيمتين مقرّبتين من الدرس السابق، واختزال كسر، وحساب قوة عدد نسبي ومربّع كسر.',
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
      watch: 'مربّع كسر ومربّع عدد عشريّ: إن تعثّر نصف القسم فيهما، أطل المراجعة.',
    },
    {
      moment: 'revise',
      name: 'مراجعة القواعد',
      min: 5,
      aim: 'نستحضر ما سنحتاجه.',
      teacher: 'يختار قارئًا أو يقرأ هو؛ يطلب مثالًا قبل أن يُظهر المثال.',
      class: 'يقرؤون القاعدة ويعطون مثالًا من عندهم.',
      watch: 'مربّع الكسر هو مربّع البسط على مربّع المقام، لا البسط في 2.',
    },
    {
      moment: 'lesson',
      name: 'الدرس على السبّورة',
      min: 25,
      aim: 'القسم يقترح مقياسًا، كسرًا أو عددًا عشريًّا، يرى المنصّة تركب أو تترك شريطًا أو تعلق، ثمّ يسمّي كلّ مفتاح.',
      teacher: 'يسأل قبل كلّ منصّة: «من يتوقّع؟ ولماذا؟»؛ لا يعطي التعريف؛ يترك العالم يحكم.',
      class: 'يقترحون المقاييس ويتوقّعون، ثمّ يرون ما تفعله المنصّة؛ وبعد ذلك فقط يأخذ المفتاح اسمه.',
      watch: 'من يقول «لا كسر يركب لأنّ البسط ليس مربّعًا»: اطلب منه أن يختزل الكسر أوّلًا.',
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
      says: `«$${F(O.sideTop, O.sideBottom)} \\times ${F(O.sideTop, O.sideBottom)} = ${F(O.top, O.bottom)}$، إذن الضلع كسر».`,
      assess: 'وهل كلّ ساحة على بابها كسر لها ضلع يُكتب كسرًا؟',
      advance: `وساحة مساحتها ${U.top} على ${U.bottom}: لا حدّ منهما مربّع، فهل يركبها كسر؟`,
    },
    {
      kind: 'right',
      says: `«$${T(M.mid)} \\times ${T(M.mid)} = 69{,}7225$، والمنصّة علقت: الجدار قبل العلامة الوسطى، فالمدوَّر $${T(M.lo)}$».`,
      assess: 'كيف عرفت أنّ الجدار قبل العلامة الوسطى؟',
      advance: 'وإلى جزء من مئة: أيّ علامة وسطى ننزل؟',
    },
    {
      kind: 'miss',
      says: `«ضلع الساحة $${F(O.top, O.bottom)}$ هو $${F(O.sideTop, O.bottom)}$».`,
      assess: 'أنزل المنصّة المبنيّة على هذا المقياس: هل غطّت الساحة؟',
      advance: 'مربّع الكسر: ماذا نفعل ببسطه، وماذا نفعل بمقامه؟',
    },
    {
      kind: 'miss',
      says: `«$${U.top}$ ليس مربّعًا، إذن لا كسر يركب الساحة $${F(U.top, U.bottom)}$».`,
      assess: 'هل كتبنا هذا الكسر بأصغر حدّين؟',
      advance: 'اختزل الكسر أوّلًا: ماذا يصير البسط والمقام؟',
    },
    {
      kind: 'miss',
      says: `«الحاسبة تعرض $${T(C.calculator)}$، إذن $\\sqrt{${C.area}} = ${T(C.calculator)}$».`,
      assess: 'أنزل منصّة الحاسبة: هل ركبت؟ ماذا بقي أو زاد؟',
      advance: 'ما الكتابة الوحيدة الصحيحة تمامًا لطول الجدار؟',
    },
    {
      kind: 'miss',
      says: `«المدوَّر إلى $0{,}01$ هو $${T(M.lo)}$، لأنّ الضلع بين $${T(M.lo)}$ و $${T(M.hi2)}$».`,
      assess: 'هذه القيمة المقرّبة بالنقصان: أيّ العلامتين أقرب إلى الجدار؟',
      advance: 'ماذا قالت منصّة العلامة الوسطى؟',
    },
  ],
  // ── which answers go on the board, in what order, and the link between them ──
  sequence: [
    `أوّلًا ساحة على بابها كسر: المقياس ${O.sideTop} على ${O.sideBottom} يركب، وضلع البسط وحده يترك شريطًا.`,
    `ثمّ كسر لم يُختزل، ${U.top} على ${U.bottom}: بعد الاختزال يظهر مربّعان، فيركب كسر.`,
    'نسمّي: العدد الناطق.',
    `ثمّ الساحة ${C.area}: كسور تقترب أكثر فأكثر، وما تعرضه الحاسبة، ولا مقياس يركب.`,
    'نسمّي: العدد غير الناطق، والقيمة المقرّبة.',
    `أخيرًا الساحة ${M.area}: العلامة الوسطى تحكم إلى جزء من عشرة، ثمّ إلى جزء من مئة — ونسمّي المدوَّر.`,
  ],
  connect: `الجذر التربيعي لعدد موجب $a$ يُكتب كسرًا حين يكون $a$ مربّع كسر: $\\sqrt{${F('4', '25')}} = ${F('2', '5')}$. وإلّا فهو عدد غير ناطق، والحاسبة تعرض له قيمة مقرّبة فقط. ومدوَّره هو أقرب العلامتين المتجاورتين إليه: $${T(M.lo)} < \\sqrt{${M.area}} < ${T(M.hi)}$ و $${T(M.mid)} \\times ${T(M.mid)} > ${M.area}$.`,
  // ── what is written, the short check, support and extension ──
  written: [
    `العدد الناطق عدد يُكتب كسرًا: $${F(O.sideTop, O.sideBottom)}$ و $3{,}7$ و $${O.whole}$ أعداد ناطقة. $\\sqrt{${F(O.top, O.bottom)}} = ${F(O.sideTop, O.sideBottom)}$.`,
    `$\\sqrt{${C.area}}$ عدد غير ناطق: لا كسر مربّعه ${C.area}، والحاسبة تعرض له قيمة مقرّبة: $\\sqrt{${C.area}} \\approx ${T(C.calculator)}$.`,
    `$${T(M.lo)} < \\sqrt{${M.area}} < ${T(M.hi)}$ ومدوَّره إلى $0{,}1$ هو $${T(M.lo)}$؛ و $${T(M.lo)} < \\sqrt{${M.area}} < ${T(M.hi2)}$ ومدوَّره إلى $0{,}01$ هو $${T(M.hi2)}$.`,
  ],
  exit: [
    {
      q: `اكتب على شكل كسر: $\\sqrt{${F('48', '75')}}$.`,
      a: `$${F('48', '75')} = ${F('16', '25')}$، إذن $\\sqrt{${F('48', '75')}} = ${F('4', '5')}$، لأنّ $${F('4', '5')} \\times ${F('4', '5')} = ${F('16', '25')}$.`,
    },
    {
      q: `هل $\\sqrt{${F('9', '40')}}$ عدد ناطق؟ برّر.`,
      a: `لا: $${F('9', '40')}$ مختزل، و $40$ ليس مربّعًا، فلا كسر مربّعه $${F('9', '40')}$.`,
    },
    {
      q: 'ما مدوَّر $\\sqrt{62}$ إلى $0{,}1$؟',
      a: '$7{,}8 < \\sqrt{62} < 7{,}9$ و $7{,}85 \\times 7{,}85 = 61{,}6225$: منصّة العلامة الوسطى تترك شريطًا، فالمدوَّر $7{,}9$.',
    },
  ],
  support: [
    'اكتب جدول مربّعات الأعداد من 1 إلى 30 قبل أن تختزل.',
    'اختزل كسر المساحة أوّلًا، ثمّ انظر: هل البسط مربّع، وهل المقام مربّع؟',
    'لتجد المدوَّر: احسب مربّع العلامة الوسطى، وقارنه بالمساحة.',
  ],
  extend: [
    `لماذا لا يساوي $${F(C.t3, C.b3)} \\times ${F(C.t3, C.b3)}$ العدد ${C.area}، مع أنّ الفرق قطعتان صغيرتان فقط؟`,
    'جد عددًا طبيعيًّا n بين 1 و 30 يكون فيه $\\sqrt{3n}$ عددًا ناطقًا.',
    `رتّب دون حاسبة: $\\sqrt{${M.area}}$ ، $${T(M.hi2)}$ ، $${T(M.lo)}$.`,
  ],
  extendCheck: { times: '3', upTo: 30 },
  next: 'الحصّة القادمة: «حلّ المعادلة من الشكل x² = a» — الساحة التي ضلعها مجهول، ومساحتها معلومة.',
};
