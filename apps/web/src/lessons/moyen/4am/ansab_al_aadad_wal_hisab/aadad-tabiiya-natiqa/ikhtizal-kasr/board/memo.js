/**
 * « مذكّرة الدرس » WRITTEN for this lesson (CLASS_SESSION.md §2quater) — the model and its parts:
 * `features/classSession/lessonMemos.js`. Every number is checked by a test (`board.test.js`). Own wording: nothing is
 * quoted from the textbook, no pair of the exercise bank is used. Reached only through the lesson's pack
 * (`lesson.pack.js › board.memo`).
 * The numbers of the board are read from `script.js › BOARD` (one place); the openings and the exit ticket have their own.
 * Fields drawn as plain text by `BoardMemo.jsx` (goal, idea, trap, can, stands, the openings, the phases, the sequence,
 * next, and what a teacher asks back) hold no formula and no equality; the others may.
 */
import { BOARD, LADDERS, divRow, divisions, frac, pgcd } from './script';

const { bridge: BR, locked: LK, euclid: EU, result: RE } = BOARD;
const SEP = ' ، ';
/** Formulas one after the other: a no-break space BEFORE each comma. */
const rows = (fs) => fs.map((f) => `$${f}$`).join(SEP);
const ST = LADDERS.stages;
const G = LADDERS.g;
const RN = RE.x[0] * RE.y[0];
const RD = RE.x[1] * RE.y[1];
/** The exit ticket's fraction reduced by its PGCD. */
const X = [187, 253];

/** The opening situations a teacher may choose from. `kind` selects the drawing (`MemoFigures.jsx`); a, b = the numbers. */
const OPENINGS = [
  {
    id: 'bridge',
    kind: 'bridge',
    a: BR.lit,
    b: BR.first,
    board: true,
    title: 'جسر ولافتة',
    story: `جسر من ${BR.whole} خانة أُضيء منها ${BR.lit} خانة، وعلى لافتته الكسر ${BR.lit} على ${BR.whole}. يريد النجّار أن يكتب اللافتة بألواح من طول واحد، أطول من خانة. يجرّب لوحًا طوله ${BR.first}.`,
    ask: `هل يملأ اللوح ${BR.first} الجسر؟ والجزء المضاء؟ وأيّ لوح يملأ الاثنين معًا؟`,
    why: `هي وضعية «الدرس على السبّورة»: اللوح ${BR.first} يملأ الجسر ولا يملأ الجزء المضاء، أمّا الألواح 2 و 3 و 4 و 6 فتملأ الاثنين وتكتب اللافتة من جديد.`,
    expect: `يرى أغلبهم أنّ ${BR.first} يملأ الجسر، ويفاجئهم أنّ الضوء ينتهي بين لوحين: ${Math.floor(BR.lit / BR.first)} ألواح وتبقى ${BR.lit % BR.first} خانات مضاءة.`,
  },
  {
    id: 'teams',
    kind: 'teams',
    a: 50,
    b: 5,
    board: false,
    title: 'الصغار في النادي',
    story:
      'في نادٍ 50 لاعبًا، منهم 20 من الصغار. نوزّعهم على فِرق متماثلة: في كلّ فريق العدد نفسه من اللاعبين والعدد نفسه من الصغار.',
    ask: 'في 5 فِرق، كم صغيرًا في كلّ فريق من 10؟ وفي 10 فِرق؟',
    why: 'في 5 فِرق: 4 صغار من 10 في كلّ فريق، وفي 10 فِرق: صغيران من 5. الكسر 20 من 50 يُكتب 4 من 10 ثمّ 2 من 5، ولا فريق أصغر يحفظ التوزيع.',
    expect: 'يوزّع بعضهم الصغار وحدهم دون الكبار، فلا تتماثل الفِرق.',
  },
  {
    id: 'shelves',
    kind: 'shelves',
    a: 144,
    b: 10,
    alt: 12,
    board: false,
    title: 'رفوف القصص',
    story:
      'في مكتبة المؤسّسة 144 كتابًا، منها 84 قصّة، نرتّبها في رفوف تسع العدد نفسه من الكتب، كلّ رفّ من نوع واحد، ولا يبقى كتاب خارج الرفوف.',
    ask: 'رفوف تسع 10 كتب أم 12 كتابًا؟ وكم رفًّا للقصص من كلّ الرفوف؟',
    why: 'رفوف من 12 كتابًا: 12 رفًّا، منها 7 للقصص. الكسر 84 من 144 يُكتب 7 من 12، والعدد 12 أكبر عدد يقسم 84 و 144.',
    expect: 'يختار بعضهم رفوفًا تسع 10 كتب لأنّها عدد «مستدير»؛ يبقى 4 كتب خارج الرفوف.',
  },
  {
    id: 'tiles',
    kind: 'tiles',
    a: 90,
    b: 12,
    alt: 15,
    board: false,
    title: 'شريط مطليّ',
    story: 'شريط طوله 90 cm، طُلي منه 75 cm. نقسمه إلى قطع متماثلة لا تقطع حدّ الطلاء.',
    ask: 'قطع من 12 cm أم من 15 cm؟ وكم قطعة مطليّة من كلّ القطع؟',
    why: 'قطع من 15 cm: 6 قطع، منها 5 مطليّة. الكسر 75 من 90 يُكتب 5 من 6 بقسمة واحدة على 15.',
    expect: 'يختار بعضهم قطعًا من 12 cm؛ يبقى من الشريط 6 cm، ولا يقف حدّ الطلاء عند نهاية قطعة.',
  },
];

export const MEMO = {
  title: 'اختزال كسر',
  // ── the one page for the desk ──
  glance: {
    goal: 'في نهاية الحصّة يختزل التلميذ كسرًا على مراحل، ويتعرّف على الكسر غير القابل للاختزال، ويكتب كسرًا على الشكل غير القابل للاختزال بقسمة بسطه ومقامه على قاسمهما المشترك الأكبر، ويعطي نتيجة حساب على هذا الشكل.',
    idea: 'نكتب لافتة الجسر بألواح أطول كلّما وُجد لوح يملأ الجزء المضاء والجسر معًا: نقسم البسط والمقام على قاسم مشترك. لا لوح غير 1: الكسر لا يُختزل. وأطول لوح، القاسم المشترك الأكبر، يكتبها في خطوة واحدة.',
    trap: 'أن يتوقّف التلميذ عند مرحلة ما زال لبسطها ومقامها قاسم مشترك، أو أن يطرح العدد نفسه من البسط والمقام، أو أن يظنّ أنّ الكسر يُختزل لأنّ بسطه ليس أوّليًّا، أو أن يترك نتيجة حساب دون اختزال.',
    minutes: [
      { moment: 'start', label: 'اختبار البداية', min: 7 },
      { moment: 'revise', label: 'مراجعة القواعد', min: 4 },
      { moment: 'lesson', label: 'الدرس على السبّورة', min: 26 },
      { moment: 'end', label: 'اختبار النهاية', min: 8 },
    ],
    three: [
      `$${ST.map(([n, d]) => frac(n, d)).join(' = ')}$: متى نتوقّف؟`,
      `$${pgcd(LK.whole, LK.lit)} = 1$: لماذا يبقى $${frac(LK.lit, LK.whole)}$ كما هو؟`,
      `$${pgcd(EU.whole, EU.lit)} = ${G.euclid}$: لماذا تكفي قسمة واحدة لنصل إلى $${frac(EU.lit / G.euclid, EU.whole / G.euclid)}$؟`,
    ],
  },
  // ── goal and success criteria: what can be SEEN or HEARD — one per الكفاءة (P1–P4) ──
  criteria: [
    {
      can: 'يختزل كسرًا على مراحل: يقسم بسطه ومقامه على قاسم مشترك، ثمّ يعيد ما دام لهما قاسم مشترك غير 1.',
      see: `يكتب $${ST.map(([n, d]) => frac(n, d)).join(' = ')}$ ويقول على أيّ عدد قسم في كلّ مرحلة.`,
      check: { a: ST[0][0], b: 2, q: ST[1][0], r: 0 },
    },
    {
      can: 'يتعرّف على كسر غير قابل للاختزال: بسطه ومقامه أوّليّان فيما بينهما، ولو لم يكن أيّ منهما عددًا أوّليًّا.',
      see: `يكتب $${pgcd(LK.whole, LK.lit)} = 1$ إذن $${frac(LK.lit, LK.whole)}$ كسر غير قابل للاختزال.`,
      check: { a: LK.whole, b: LK.lit, q: 1, r: LK.whole - LK.lit },
    },
    {
      can: 'يكتب كسرًا على الشكل غير القابل للاختزال بقسمة بسطه ومقامه على قاسمهما المشترك الأكبر، يحسبه بخوارزمية إقليدس.',
      see: `يكتب ${rows(LADDERS.euclid.map(divRow))}، ثمّ $${frac(EU.lit, EU.whole)} = \\frac{${EU.lit} \\div ${G.euclid}}{${EU.whole} \\div ${G.euclid}} = ${frac(EU.lit / G.euclid, EU.whole / G.euclid)}$.`,
      check: { a: EU.lit, b: G.euclid, q: EU.lit / G.euclid, r: 0 },
    },
    {
      can: 'يعطي نتيجة حساب على كسور على شكل كسر غير قابل للاختزال.',
      see: `يكتب $${frac(...RE.x)} \\times ${frac(...RE.y)} = ${frac(RN, RD)} = ${frac(RN / G.result, RD / G.result)}$.`,
      check: { a: RN, b: G.result, q: RN / G.result, r: 0 },
    },
  ],
  stands:
    'القاسم المشترك الأكبر لعددين وحسابه بخوارزمية إقليدس، والعددان الأوّليّان فيما بينهما، من دروس الوحدة؛ والكسور المتساوية واختزال كسر بقسمة بسطه ومقامه على العدد نفسه، من السنة الأولى.',
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
      watch: 'الكسور المتساوية: إن طرح نصف القسم العدد نفسه من البسط والمقام، أطل المراجعة قبل الدرس.',
    },
    {
      moment: 'revise',
      name: 'مراجعة القواعد',
      min: 4,
      aim: 'نستحضر ما سنحتاجه.',
      teacher: 'يختار قارئًا أو يقرأ هو؛ يطلب مثالًا قبل أن يُظهر المثال.',
      class: 'يقرؤون القاعدة ويعطون مثالًا من عندهم.',
      watch: 'نقسم البسط والمقام على العدد نفسه، وآخر باقٍ غير معدوم في خوارزمية إقليدس هو القاسم المشترك الأكبر.',
    },
    {
      moment: 'lesson',
      name: 'الدرس على السبّورة',
      min: 26,
      aim: 'القسم يجرّب ألواح الجزء المضاء على الجسر كلّه، يرى الجسور تحكم، ثمّ يسمّي كلّ مفتاح.',
      teacher:
        'يسأل قبل كلّ بناء: «من يتوقّع؟ ولماذا؟»؛ يكتب مراحل الاختزال بالقلم كما يمليها القسم، ولا يكتب سطر القسمة الواحدة قبل أن يقترحه تلميذ.',
      class: 'يجيبون عن كلّ سؤال، ثمّ يرون الجسور تُبنى؛ وبعد ذلك فقط يأخذ المفتاح اسمه.',
      watch: 'من يتوقّف عند مرحلة ما زال لها لوح مشترك: اسأله عن لوح غير 1 يملأ البسط والمقام.',
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
      says: `«$${pgcd(EU.whole, EU.lit)} = ${G.euclid}$ إذن $${frac(EU.lit, EU.whole)} = ${frac(EU.lit / G.euclid, EU.whole / G.euclid)}$».`,
      assess: 'لماذا لا نقسم مرّة ثانية؟',
      advance: 'لو قسمت على عدد أصغر من القاسم المشترك الأكبر، كم مرحلة كانت ستلزمك؟',
    },
    {
      kind: 'miss',
      says: `«$${frac(...ST[0])} = ${frac(...ST[1])}$، انتهيت».`,
      assess: `هل يوجد لوح غير 1 يملأ ${ST[1][0]} و ${ST[1][1]} معًا؟`,
      advance: 'متى نعرف أنّنا انتهينا؟',
    },
    {
      kind: 'miss',
      says: `«$${frac(LK.lit, LK.whole)}$ يُختزل، لأنّ ${LK.lit} ليس عددًا أوّليًّا».`,
      assess: 'أيّ لوح غير 1 يملأ الجزء المضاء والجسر معًا؟',
      advance: 'هل يكفي أن يقبل البسط القسمة على عدد ليُختزل الكسر؟',
    },
    {
      kind: 'miss',
      says: `«$${frac(...ST[0])} = ${frac(ST[0][0] - 3, ST[0][1] - 3)}$: نزعت 3 من البسط ومن المقام».`,
      assess: 'هل نزعنا خانات من الجسر، أم كتبنا اللافتة بألواح أطول؟',
      advance: 'ماذا نفعل بالبسط والمقام ليبقى الكسر هو نفسه؟',
    },
    {
      kind: 'miss',
      says: `«النتيجة $${frac(RN, RD)}$».`,
      assess: `هل يوجد قاسم مشترك للعددين ${RN} و ${RD} غير 1؟`,
      advance: 'كيف نعطي النتيجة كاملة؟',
    },
  ],
  // ── which answers go on the board, in what order, and the link between them ──
  sequence: [
    `أوّلًا النجّار: اللوح ${BR.first} يملأ الجسر ${BR.whole} ولا يملأ الجزء المضاء ${BR.lit}.`,
    `ثمّ ألواح ${BR.lit} على ${BR.whole}: الألواح 2 و 3 و 4 و 6 تملأ الاثنين، والمراحل حتّى ${ST.at(-1)[0]} من ${ST.at(-1)[1]}.`,
    `ثمّ ${LK.lit} من ${LK.whole}: اللوح 1 وحده، ولا يُختزل الكسر.`,
    `ثمّ أسطر القسمة للعددين ${EU.whole} و ${EU.lit}، وأطول لوح ${G.euclid}، وسطر القسمة الواحدة.`,
    `أخيرًا الجداء: النتيجة ${RN} من ${RD} تُكتب ${RN / G.result} من ${RD / G.result}.`,
  ],
  connect: `المفاتيح الأربعة سؤال واحد: أيّ لوح يملأ الجزء المضاء والجسر معًا؟ ألواح كثيرة، فنعيد ($${frac(...ST[0])} = ${frac(...ST.at(-1))}$)؛ اللوح 1 وحده، فنتوقّف ($${pgcd(LK.whole, LK.lit)} = 1$)؛ أطولها القاسم المشترك الأكبر، فقسمة واحدة ($${frac(EU.lit, EU.whole)} = ${frac(EU.lit / G.euclid, EU.whole / G.euclid)}$)؛ ونتيجة كلّ حساب تُعطى كذلك ($${frac(RN, RD)} = ${frac(RN / G.result, RD / G.result)}$).`,
  // ── what is written, the short check, support and extension ──
  written: [
    'نختزل كسرًا على مراحل: نقسم بسطه ومقامه على قاسم مشترك لهما، ثمّ نعيد ما دام للبسط والمقام قاسم مشترك غير 1.',
    'نقول إنّ الكسر $\\frac{a}{b}$ غير قابل للاختزال إذا كان $a$ و $b$ أوّليّين فيما بينهما، أي $\\mathrm{PGCD}(a ; b) = 1$.',
    'نقسم البسط والمقام على قاسمهما المشترك الأكبر $g$ فنحصل مباشرة على الكسر غير القابل للاختزال: $\\frac{a}{b} = \\frac{a \\div g}{b \\div g}$.',
    'نعطي نتيجة كلّ حساب على الكسور على شكل كسر غير قابل للاختزال.',
  ],
  exit: [
    {
      q: `اكتب الكسر $${frac(...X)}$ على شكل كسر غير قابل للاختزال.`,
      a: `${rows(divisions(...X).map(divRow))}، إذن $${pgcd(X[1], X[0])} = 11$ و $${frac(...X)} = \\frac{${X[0]} \\div 11}{${X[1]} \\div 11} = ${frac(17, 23)}$.`,
      check: { a: X[0], b: 11, q: 17, r: 0 },
    },
    {
      q: 'هل الكسر $\\frac{77}{90}$ قابل للاختزال؟',
      a: 'لا: $\\mathrm{PGCD}(90 ; 77) = 1$، فالكسر $\\frac{77}{90}$ غير قابل للاختزال.',
      check: { a: 90, b: 77, q: 1, r: 13 },
    },
    {
      q: 'احسب $\\frac{3}{8} + \\frac{7}{24}$، وأعطِ النتيجة على شكل كسر غير قابل للاختزال.',
      a: '$\\frac{3}{8} + \\frac{7}{24} = \\frac{9}{24} + \\frac{7}{24} = \\frac{16}{24} = \\frac{2}{3}$.',
      check: { a: 24, b: 8, q: 3, r: 0 },
    },
  ],
  support: [
    'كسور صغيرة أوّلًا: 6 من 8، ثمّ 9 من 12 — أيّ لوح يملأ البسط والمقام معًا؟',
    'اكتب قواسم البسط وقواسم المقام في سطرين، وضع دائرة حول أكبر عدد في السطرين.',
    'جرّب قواعد قابلية القسمة على 2 و 3 و 5 على البسط والمقام معًا قبل أيّ قسمة.',
  ],
  extend: [
    'جد كسرًا بسطه ومقامه أكبر من 100، يُختزل في ثلاث مراحل على الأقلّ إذا قسمنا كلّ مرّة على عدد أوّليّ.',
    'لماذا يكون الكسر الذي بسطه ومقامه عددان متتاليان غير قابل للاختزال دائمًا؟',
    'هل يمكن أن يكون مجموع كسرين غير قابلين للاختزال كسرًا قابلًا للاختزال؟ أعطِ مثالًا.',
  ],
  extendCheck: { above: 100, stages: 3 },
  next: 'الحصّة القادمة: «أدمج تعلّماتي» — الأعداد الطبيعية والأعداد الناطقة في وضعيات.',
};
