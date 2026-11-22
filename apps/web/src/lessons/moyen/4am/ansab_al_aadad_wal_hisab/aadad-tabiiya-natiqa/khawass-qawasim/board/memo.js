/**
 * « مذكّرة الدرس » WRITTEN for this lesson (CLASS_SESSION.md §2quater) — the model and its parts:
 * `features/classSession/lessonMemos.js`. Every number is checked by a test (`board.test.js`). Own wording: nothing is
 * quoted from the textbook. Reached only through the lesson's pack (`lesson.pack.js › board.memo`).
 * The numbers of the story are read from `world/story.js › NUMBERS`. Fields drawn as plain text by `BoardMemo.jsx`
 * (goal, idea, trap, can, stands, the openings, the phases, the sequence, next) hold no formula; the others may.
 */
import { NUMBERS } from '../world/story';

const { join: J, stack: K, peel: P, boss: B } = NUMBERS;
const [G1, G2] = J.gaps;
const [F1, F2] = J.foil;
const GLUED = G1 + G2;
const CUT = G2 - G1;
const COPIES = K.bridge * K.copies;
const PEEL_Q = Math.floor(P.long / P.short);
const REST = P.long % P.short;
const HARBOUR = B.long + B.short;
const times = (n, d) => `${n} = ${d} \\times ${n / d}`;

/** The opening situations a teacher may choose from. `kind` selects the drawing (`MemoFigures.jsx`); a, b = the numbers. */
const OPENINGS = [
  {
    id: 'bridge',
    kind: 'bridge',
    a: GLUED,
    b: J.plank,
    board: true,
    title: `هوّة من ${GLUED} خانة`,
    story: `اللوح ${J.plank} يملأ هوّة من ${G1} خانة وهوّة من ${G2} خانة. نلصق الهوّتين فتصيران هوّة واحدة من ${GLUED} خانة.`,
    ask: `هل يثبت الجسر باللوح ${J.plank}؟ من يجيب دون أن يقسم؟`,
    why: 'هي وضعية «الدرس على السبّورة»: الجواب يأتي من الألواح التي نعرفها، قبل أيّ قسمة.',
    expect: `بعضهم يقسم ${GLUED} على ${J.plank} فورًا؛ آخرون يعدّون الألواح: ${G1 / J.plank} في الأولى و ${G2 / J.plank} في الثانية.`,
  },
  {
    id: 'teams',
    kind: 'teams',
    a: 35,
    b: 5,
    board: false,
    title: 'فوجان في الملعب',
    story:
      'فوج من 15 لاعبًا وفوج من 20 لاعبًا، وكلّ فوج يتوزّع على 5 فِرق متساوية. يجتمع الفوجان في الملعب: 35 لاعبًا.',
    ask: 'هل يتوزّع اللاعبون كلّهم على 5 فِرق متساوية دون أن يبقى أحد خارجها؟',
    why: 'قريبة من يوم التلميذ: فِرق الفوج الأوّل وفِرق الفوج الثاني تجتمع فِرقًا أكبر.',
    expect: 'يرى بعضهم أنّ كلّ فريق يأخذ 3 لاعبين من الفوج الأوّل و 4 من الثاني: 7 في كلّ فريق.',
  },
  {
    id: 'shelves',
    kind: 'shelves',
    a: 132,
    b: 10,
    alt: 12,
    board: false,
    title: 'ما بقي في المكتبة',
    story:
      'وصل إلى المكتبة 180 كتابًا، رُتّبت كلّها في رفوف يسع الواحد منها 12 كتابًا. أُعير منها 48 كتابًا، أي أربعة رفوف كاملة، فبقي 132 كتابًا. في المخزن رفوف تسع 10 كتب ورفوف تسع 12 كتابًا.',
    ask: 'أيّ نوع من الرفوف يُملأ تمامًا بالكتب الباقية؟',
    why: 'هي خاصية الفرق في حياة المؤسّسة: ما نزيله برفوف كاملة يترك رفوفًا كاملة.',
    expect: 'بعضهم يختار 10 لأنّ الحساب به أسهل؛ الرفوف تحكم: يبقى كتابان دون رفّ.',
  },
  {
    id: 'tiles',
    kind: 'tiles',
    a: 72,
    b: 10,
    alt: 8,
    board: false,
    title: 'شريط أطول ثلاث مرّات',
    story:
      'شريط من الجدار طوله 24 cm تغطّيه بلاطات مربّعة ضلعها 8 cm تمامًا. نريد شريطًا أطول ثلاث مرّات: 72 cm، دون قطع أيّ بلاطة.',
    ask: 'هل تصلح بلاطات ضلعها 10 cm؟ وبلاطات ضلعها 8 cm؟ أيّهما نعرفه دون قسمة؟',
    why: 'تحمل خاصية المضاعفات: ثلاثة أشرطة من البلاطات نفسها.',
    expect: 'مع 10 يبقى فراغ أصغر من بلاطة؛ مع 8 يكفي أن نكرّر الشريط الأوّل ثلاث مرّات.',
  },
];

export const MEMO = {
  title: 'خواص قواسم عدد طبيعي',
  // ── the one page for the desk ──
  glance: {
    goal: 'في نهاية الحصّة يستعمل التلميذ قاسمًا مشتركًا لعددين ليحكم دون قسمة على مجموعهما وفرقهما ومضاعفاتهما وباقي قسمة أحدهما على الآخر، ويبرهن ذلك بالحروف.',
    idea: 'لوح يملأ عددين يملأ كلّ ما نصنعه منهما: باللصق، أو بالقصّ، أو بالتكرار، أو ما يبقى من القسمة. والحروف تقول لماذا، مهما كانت الأعداد.',
    trap: 'أن يقلب التلميذ الخاصية فيظنّ أنّ قاسم المجموع يقسم كلّ جزء، أو أن يظنّ أنّ بضعة أمثلة تكفي برهانًا.',
    minutes: [
      { moment: 'start', label: 'اختبار البداية', min: 7 },
      { moment: 'revise', label: 'مراجعة القواعد', min: 5 },
      { moment: 'lesson', label: 'الدرس على السبّورة', min: 25 },
      { moment: 'end', label: 'اختبار النهاية', min: 8 },
    ],
    three: [
      `في $${GLUED} = ${G1} + ${G2}$: لماذا يملأ اللوح ${J.plank} الهوّة دون أيّ قسمة؟`,
      `اللوح ${K.plank} يملأ ${K.bridge}: هل يملأ ${COPIES}؟ كيف نعرف دون قسمة؟`,
      `$${P.long} = ${P.short} \\times ${PEEL_Q} + ${REST}$: لماذا يملأ اللوح ${P.plank} الباقي ${REST}؟`,
    ],
  },
  // ── goal and success criteria: what can be SEEN or HEARD ──
  criteria: [
    {
      can: 'يستنتج أنّ قاسمًا مشتركًا لعددين يقسم مجموعهما وفرقهما، دون أن يقسم.',
      see: `من $${times(G1, J.plank)}$ و $${times(G2, J.plank)}$ يقول: ${J.plank} يقسم ${GLUED} و ${CUT}.`,
      check: { a: GLUED, b: J.plank, q: GLUED / J.plank, r: 0 },
    },
    {
      can: 'يرفض عكس الخاصية بمثال مضادّ.',
      see: `يقول: ${J.plank} يقسم ${F1 + F2} ولا يقسم ${F1} ولا ${F2}، فـ $${F1} = ${J.plank} \\times ${Math.floor(F1 / J.plank)} + ${F1 % J.plank}$.`,
      check: { a: F1, b: J.plank, q: Math.floor(F1 / J.plank), r: F1 % J.plank },
    },
    {
      can: 'يعرف أنّ قاسم عدد يقسم كلّ مضاعف له، وأنّ قاسمًا مشتركًا لعددين يقسم باقي قسمة أحدهما على الآخر.',
      see: `يقول إنّ ${K.plank} يقسم ${COPIES} لأنّه مضاعف للعدد ${K.bridge}، وإنّ ${P.plank} يقسم الباقي ${REST}.`,
      check: { a: COPIES, b: K.plank, q: COPIES / K.plank, r: 0 },
    },
    {
      can: 'يبرهن خاصية «إذا … فإنّ …» بالحروف، ولا يقبل الأمثلة برهانًا.',
      see: "يكتب $a + b = d \\times k + d \\times k' = d \\times (k + k')$ ويقول: $k + k'$ عدد طبيعي.",
      check: { a: HARBOUR, b: B.plank, q: HARBOUR / B.plank, r: 0 },
    },
  ],
  stands:
    'معنى «قاسم عدد» (الجداء بعدد طبيعي)، والقسمة الإقليدية وباقيها الأصغر من المقسوم عليه، من الدرسين السابقين؛ وتوزيع الضرب على الجمع من السنوات الماضية.',
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
      watch: 'القسمة الإقليدية والباقي: إن تعثّر نصف القسم فيهما، أطل المراجعة.',
    },
    {
      moment: 'revise',
      name: 'مراجعة القواعد',
      min: 5,
      aim: 'نستحضر ما سنحتاجه.',
      teacher: 'يختار قارئًا أو يقرأ هو؛ يطلب مثالًا قبل أن يُظهر المثال.',
      class: 'يقرؤون القاعدة ويعطون مثالًا من عندهم.',
      watch: 'العدد جداءُ قاسمه في عدد طبيعي، والباقي أصغر من المقسوم عليه.',
    },
    {
      moment: 'lesson',
      name: 'الدرس على السبّورة',
      min: 25,
      aim: 'القسم يتوقّع، يرى الجسور تحكم، ثمّ يسمّي كلّ مفتاح.',
      teacher: 'يسأل قبل كلّ بناء: «من يتوقّع؟ ولماذا؟»؛ لا يعطي الخاصية؛ يطلب عدّ الألواح بدل القسمة.',
      class: 'يجيبون عن كلّ سؤال، ثمّ يرون الجسور تُبنى؛ وبعد ذلك فقط يأخذ المفتاح اسمه.',
      watch: 'من يجيب بالقسمة: اسأله كيف يعرف دون أن يقسم.',
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
      says: `«${J.plank} يقسم ${GLUED} لأنّ $${GLUED} = ${G1} + ${G2}$، و ${J.plank} يقسم كلًّا منهما».`,
      assess: `وهل يقسم ${J.plank} الفرق ${CUT}؟ كم لوحًا يبقى؟`,
      advance: 'هل يكفي أن يملأ لوحٌ المجموعَ ليملأ كلّ جزء منه؟',
    },
    {
      kind: 'right',
      says: `«$${HARBOUR} = ${B.plank} \\times (${B.long / B.plank} + ${B.short / B.plank})$، إذن ${B.plank} يقسم ${HARBOUR}».`,
      assess: `من أين جاء ${B.long / B.plank} و ${B.short / B.plank}؟ وما العامل المشترك؟`,
      advance: 'اكتب الحساب نفسه بالحروف لعددين يقسمهما $d$.',
    },
    {
      kind: 'miss',
      says: `«${J.plank} يقسم ${F1 + F2}، إذن يقسم ${F1} و ${F2}».`,
      assess: `ابنِ الجسر ${J.plank} فوق ${F1}: هل يثبت؟`,
      advance: 'أيّ اتّجاه صحيح: من الجزأين إلى المجموع، أم من المجموع إلى الجزأين؟',
    },
    {
      kind: 'miss',
      says: '«تحقّقنا في ثلاثة أمثلة، إذن الخاصية صحيحة».',
      assess: 'هل جرّبنا كلّ الأعداد؟ هل نستطيع ذلك؟',
      advance: 'ما الذي لا يتغيّر من مثال إلى آخر؟ اكتبه بالحروف.',
    },
    {
      kind: 'miss',
      says: `«10 يقسم ${P.short}، إذن يقسم الباقي ${REST}».`,
      assess: `هل يقسم 10 العدد ${P.long} أيضًا؟`,
      advance: 'ماذا تشترط الخاصية: أن يقسم العدد عددًا واحدًا، أم العددين معًا؟',
    },
    {
      kind: 'miss',
      says: `«لنعرف هل ${K.plank} يقسم ${COPIES} يجب أن نقسم».`,
      assess: `كم مرّة نكرّر ${K.bridge} لنصل إلى ${COPIES}؟`,
      advance: `ولو كرّرنا ${K.bridge} ألف مرّة: هل نحتاج قسمة؟`,
    },
  ],
  // ── which answers go on the board, in what order, and the link between them ──
  sequence: [
    `أوّلًا هوّتان تُلصقان: اللوح ${J.plank} يملأ ${G1} و ${G2}، فيثبت فوق ${GLUED} دون قياس.`,
    `ثمّ القصّ: يبقى ${CUT}، ويملؤه اللوح نفسه.`,
    `ثمّ الاتّجاه المقلوب: ${J.plank} يملأ ${F1 + F2} ولا يملأ ${F1} ولا ${F2}.`,
    `ثمّ التكرار: ${K.copies} نسخة من الجسر ${K.bridge}.`,
    `ثمّ ما يبقى من القسمة: الباقي ${REST} يملؤه ما يملأ ${P.long} و ${P.short} معًا.`,
    'أخيرًا جسر المرفأ، ثمّ أعداد أخرى: الحساب نفسه، فنكتبه بالحروف.',
  ],
  connect:
    "الخواص الثلاث برهان واحد: إذا كان $a = d \\times k$ و $b = d \\times k'$، فكلّ عدد نصنعه منهما بالجمع أو بالطرح أو بالضرب في عدد طبيعي يُكتب $d \\times (\\ldots)$؛ والباقي $a - b \\times q$ واحد منها.",
  // ── what is written, the short check, support and extension ──
  written: [
    'إذا قسم $d$ العددين $a$ و $b$، فإنّه يقسم $a + b$ و $a - b$ (حيث $a \\geq b$). العكس لا يصحّ.',
    'إذا قسم $d$ العدد $a$، فإنّه يقسم $a \\times n$ مهما كان العدد الطبيعي $n$.',
    'إذا قسم $d$ العددين $a$ و $b$، فإنّه يقسم باقي القسمة الإقليدية للعدد $a$ على $b$.',
    "البرهان: من $a = d \\times k$ و $b = d \\times k'$ نكتب $a + b = d \\times (k + k')$، و $k + k'$ عدد طبيعي.",
  ],
  exit: [
    {
      q: 'العدد 9 يقسم 54 و 81. هل يقسم 135؟ وهل يقسم 27؟ برّر دون قسمة.',
      a: 'نعم للعددين: $135 = 54 + 81$ و $27 = 81 - 54$، و 9 يقسم 54 و 81.',
      check: { a: 135, b: 9, q: 15, r: 0 },
    },
    {
      q: 'العدد 6 يقسم 60. هل يقسم 64؟ برّر.',
      a: 'لا: لو قسم 6 العددين 64 و 60 لقسم فرقهما 4؛ $64 = 6 \\times 10 + 4$.',
      check: { a: 64, b: 6, q: 10, r: 4 },
    },
    {
      q: 'برهن: إذا كان $d$ يقسم $a$، فإنّه يقسم $3 \\times a$.',
      a: '$a = d \\times k$، إذن $3 \\times a = d \\times (3 \\times k)$، و $3 \\times k$ عدد طبيعي.',
    },
  ],
  support: [
    'أعداد صغيرة أوّلًا: اللوح 3 يملأ 6 و 9، فيملأ 15 و 3.',
    'ارسم الجسرين ألواحًا، ثمّ عدّ الألواح بعد اللصق وبعد القصّ.',
    'اكتب كلّ عدد جداءً بالقاسم المشترك قبل أن تجمع: $d \\times \\ldots + d \\times \\ldots$.',
  ],
  extend: [
    'برهن بالحروف أنّ $d$ يقسم $a - b$ إذا قسم $a$ و $b$ (حيث $a \\geq b$).',
    'العدد 12 يقسم $a$ و $b$. هل يقسم $5 \\times a + 2 \\times b$؟ برهن.',
    'العدد 21 يقسم 840 و 189. ما باقي قسمة 840 على 189؟ هل يقسمه 21؟',
  ],
  extendCheck: { d: 21, a: 840, b: 189 },
  next: 'الحصّة القادمة: «القاسم المشترك الأكبر لعددين طبيعيين» — من بين القواسم المشتركة لعددين: أيّها الأكبر؟ وباقي القسمة يقودنا إليه.',
};
