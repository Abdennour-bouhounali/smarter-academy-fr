/**
 * Les exercices du MANUEL rattachés au درس 3 « استعمال المجدولات » (extraction.json › destinations) :
 * تمرين 7 (module 1), تمارين 15, 16 et 1 هـ (module 2, ex-1 هـ doublon déclaré), تمرينا 23 et 24 (module 4,
 * أتعمّق). Énoncés du livre (EX7, EX15… dans textbook.js) ; un exercice à plusieurs questions est découpé en
 * une entrée par question. Chaque distracteur est FAUX et l'explication dit pourquoi. Un دستور dans une
 * chaîne passe par `xl()` (LTR isolé, jamais KaTeX).
 */
import { EX7, EX15, EX16, EX1E, EX23, EX24, xl } from './textbook.js';

export const LP = {
  P1: '4am_majdulat-ihsaiya_P1',
  P2: '4am_majdulat-ihsaiya_P2',
  P3: '4am_majdulat-ihsaiya_P3',
};

const SERIES = EX7.series.join(' ، ');

export const EXERCISES = [
  /* ── تمرين 7 أ) ب) — à la main (module 1) ─────────────────────────────────────────────────── */
  {
    id: 'ex-7-ab', source: EX7.source, learningPointId: LP.P2, difficulty: 'facile',
    statement: `${EX7.intro} ${SERIES} . ${EX7.questions[0]} ${EX7.questions[1]}`,
    interaction: 'batch',
    question: {
      prompt: 'احسب باليد قبل المجدول.',
      rows: [
        { label: 'المدى', options: ['8', '10', '2'], correct: 0, correction: EX7.answers.range },
        { label: 'الوسيط', options: ['4', '8', '3'], correct: 0, correction: `${EX7.answers.sorted} ${EX7.answers.median}` },
        { label: 'المتوسط', options: ['5', '35', '$\\dfrac{35}{6}$'], correct: 0, correction: EX7.answers.mean },
        { label: 'المنوال', options: ['4', '10', '3'], correct: 0, correction: EX7.answers.mode },
      ],
      explain: EX7.answers.sheet,
    },
    method: EX7.answers.sorted,
    commonError: 'قراءة الوسيط في السلسلة كما هي دون ترتيب، أو القسمة على 6 في المتوسط.',
  },

  /* ── تمرين 15 — المخطط الدائري (module 2) ───────────────────────────────────────────────── */
  {
    id: 'ex-15-1', source: EX15.source, learningPointId: LP.P3, difficulty: 'facile',
    statement: EX15.text,
    interaction: 'choice',
    question: {
      prompt: 'لماذا يطلب التمرين مخططًا دائريًا لهذا الجدول؟',
      options: [
        'لأنّ الأنواع الثلاثة أجزاء من كلّ النفايات (150kg)، والمطلوب حصة كل نوع من الكلّ',
        'لأنّ الكتل 60 ، 40 ، 50 فئات متلاصقة',
        'لأنّ المخطط الدائري يناسب كل جدول مهما كانت معطياته',
      ],
      correct: 0, cols: 1,
      explain: `${EX15.answers.why} البلاستيك والزجاج والورق أنواع لا فئات عددية، ولا يناسب الدائري كل جدول: لقيم منفصلة نرسم أعمدة، ولفئات مدرّجًا.`,
    },
    commonError: 'اختيار المدرّج التكراري لأنواع ليست فئات عددية.',
  },
  {
    id: 'ex-15-2', source: EX15.source, learningPointId: LP.P3, difficulty: 'moyen',
    interaction: 'batch',
    question: {
      prompt: 'زاوية كل قطاع في المخطط الدائري الذي يرسمه المجدول (بالدرجات):',
      rows: [
        { label: 'البلاستيك (60kg)', options: ['144', '60', '216'], correct: 0, correction: '$\\dfrac{60}{150} \\times 360 = 144$ . العدد 216 هو $\\dfrac{60}{100} \\times 360$ : قسمة على 100 بدل الكتلة الكلية 150.' },
        { label: 'الزجاج (40kg)', options: ['96', '40', '144'], correct: 0, correction: '$\\dfrac{40}{150} \\times 360 = 96$ .' },
        { label: 'الورق (50kg)', options: ['120', '50', '180'], correct: 0, correction: '$\\dfrac{50}{150} \\times 360 = 120$ ، و $144 + 96 + 120 = 360$ .' },
      ],
      explain: EX15.answers.angles,
    },
    commonError: 'أخذ الكتلة نفسها زاويةً (60 درجة)، أو القسمة على 100 بدل 150.',
  },

  /* ── تمرين 16 — الفئة الوسيطية والمدرّج (module 2) ──────────────────────────────────────── */
  {
    id: 'ex-16-1', source: EX16.source, learningPointId: LP.P3, difficulty: 'moyen',
    statement: `${EX16.intro} الفئات $7 \\le t < 8$ ، $8 \\le t < 9$ ، $9 \\le t < 10$ وتكراراتها 6 ، 1 ، 4 . ${EX16.questions[0]}`,
    interaction: 'choice',
    question: {
      prompt: 'الفئة التي تشمل الوسيط:',
      options: ['$7 \\le t < 8$', '$8 \\le t < 9$', '$9 \\le t < 10$'],
      correct: 0, cols: 3,
      explain: `${EX16.answers.median} الفئة $8 \\le t < 9$ هي الوسطى في سطر الجدول فقط، لا في السلسلة المرتبة.`,
    },
    commonError: 'اختيار الفئة الوسطى في الجدول ( $8 \\le t < 9$ ) دون حساب الرتبة.',
  },
  {
    id: 'ex-16-2', source: EX16.source, learningPointId: LP.P3, difficulty: 'moyen',
    statement: EX16.questions[1],
    interaction: 'choice',
    question: {
      prompt: `ما الذي ترسمه الطلبية ${xl('Histogramme({7,8,9,10},{6,1,4})')} ؟`,
      options: [
        'ثلاثة مستطيلات متلاصقة على الفئات من 7 إلى 10 ، ارتفاعاتها 6 ، 1 ، 4',
        'أربعة أعمدة منفصلة على القيم 7 ، 8 ، 9 ، 10',
        'ثلاثة مستطيلات ارتفاعاتها 7 ، 8 ، 9',
      ],
      correct: 0, cols: 1,
      explain: EX16.answers.command,
    },
  },

  /* ── تمرين 1 هـ — مخطط الأعمدة (module 2, doublon déclaré de takrar-mujamma) ───────────────── */
  {
    id: 'ex-1-e', source: EX1E.source, learningPointId: LP.P3, difficulty: 'facile',
    statement: EX1E.text,
    interaction: 'choice',
    question: {
      prompt: 'ثلاثون درجة حرارة، ستّ قيم مختلفة (30 ، 32 ، 33 ، 34 ، 35 ، 36). ماذا نحجز ونرسم في المجدول؟',
      options: [
        'القيم الستّ في السطر 1 وتكراراتها 8 ، 9 ، 4 ، 6 ، 2 ، 1 في السطر 2 ، ثم نحدّد السطرين ونختار مخططًا بالأعمدة',
        'التكرارات وحدها في السطر 1 ، ثم مخطط بالأعمدة',
        'القيم الستّ في السطر 1 وتكراراتها في السطر 2 ، ثم مدرّج تكراري',
      ],
      correct: 0, cols: 1,
      explain: `${EX1E.answer} دون سطر القيم لا يعرف المخطط أيّ درجة يمثّل كل عمود؛ والدرجات هنا قيم منفصلة لا فئات، فلا مدرّج.`,
    },
    commonError: 'رسم مدرّج تكراري لقيم منفصلة.',
  },

  /* ── تمرين 23 — ذاكرة الحاسبة (module 4) ──────────────────────────────────────────────────── */
  {
    id: 'ex-23-1', source: EX23.source, learningPointId: LP.P2, difficulty: 'moyen',
    statement: `${EX23.text} القيم 97 ، 104 ، 99 وتكراراتها 2 ، 3 ، 5 .`,
    interaction: 'choice',
    question: {
      prompt: 'أيّ تتابع للّمسات يضع في الذاكرة مجموع (القيمة × التكرار)؟',
      options: [
        '97 × 2 M+ ، 104 × 3 M+ ، 99 × 5 M+',
        '97 M+ ، 104 M+ ، 99 M+',
        '97 × 2 M+ ، 104 × 3 M− ، 99 × 5 M+',
      ],
      correct: 0, cols: 1,
      explain: `${EX23.answers.sum} الطريقة الثانية تجمع القيم دون تكراراتها، والثالثة تطرح 312 من الذاكرة بـ M− .`,
    },
    commonError: 'جمع القيم 97 ، 104 ، 99 دون ضرب كلّ منها في تكرارها.',
  },
  {
    id: 'ex-23-2', source: EX23.source, learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'numeric',
    question: { prompt: 'نضغط MR ثم ÷ 10 ثم = . متوسط السلسلة:', expected: 100.1, display: '100,1', explain: EX23.answers.mean },
    commonError: 'القسمة على 3 (عدد القيم المختلفة) بدل التكرار الكلي 10.',
  },

  /* ── تمرين 24 — =ALEA() (module 4) ─────────────────────────────────────────────────────── */
  {
    id: 'ex-24-1', source: EX24.source, learningPointId: LP.P2, difficulty: 'moyen',
    statement: EX24.text,
    interaction: 'choice',
    question: {
      prompt: 'أيّ دستور يحسب متوسط السلسلة الخمسين؟',
      options: [xl('=MOYENNE(A1:A50)'), xl('=MOYENNE(A1;A50)'), xl('=MOYENNE(A1:G1)'), xl('MOYENNE(A1:A50)')],
      correct: 0, cols: 2,
      explain: `السلسلة في العمود A من A1 إلى A50: المجال ${xl('A1:A50')} . الفاصلة المنقوطة في ${xl('A1;A50')} تعني الخليتين A1 و A50 وحدهما، و ${xl('A1:G1')} سطر آخر، ودون « ⁦=⁩ » لا يحسب المجدول شيئًا.`,
    },
    commonError: 'كتابة مجال السطر A1:G1 لسلسلة محجوزة في عمود.',
  },
  {
    id: 'ex-24-2', source: EX24.source, learningPointId: LP.P2, difficulty: 'difficile',
    interaction: 'choice',
    question: {
      prompt: 'نضغط F9 : تظهر خمسون قيمة جديدة. ماذا يحدث؟',
      options: [
        'تتغيّر نتائج الدساتير الثلاثة دون إعادة كتابتها، ويبقى المدى أصغر من 1',
        'تبقى نتائج الدساتير كما هي لأننا لم نعد كتابتها',
        'قد يتجاوز المدى 1',
      ],
      correct: 0, cols: 1,
      explain: `${EX24.note} المدى فرق بين عددين من المجال $0 \\le a < 1$ ، فهو أصغر من 1 دائمًا.`,
    },
  },
];

export const byId = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
