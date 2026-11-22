import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_qawasim-adad-tabii_P1',
  P2: '4am_qawasim-adad-tabii_P2',
  P3: '4am_qawasim-adad-tabii_P3',
  P4: '4am_qawasim-adad-tabii_P4',
};
const S = (n) => src(`ex-${n}`, 14, 'أوظّف تعلّماتي', n);

export const EXERCISES = [
  {
    id: 'ex-3',
    source: S(3),
    learningPointId: LP.P2,
    difficulty: 'facile',
    statement: 'عيّن كل قواسم العدد 84.',
    interaction: 'integerSet',
    question: {
      prompt: 'اكتب كل قواسم العدد 84.',
      expected: [1, 2, 3, 4, 6, 7, 12, 14, 21, 28, 42, 84],
      explain:
        '$84 = 1 \\times 84 = 2 \\times 42 = 3 \\times 28 = 4 \\times 21 = 6 \\times 14 = 7 \\times 12$: ستّ جداءات، اثنا عشر قاسمًا.',
    },
    method: 'نختبر الأعداد من 1 إلى 9 (لأن 9² = 81 ≤ 84 < 100)؛ كل باقٍ معدوم يعطي قاسمين.',
    commonError: 'نسيان 1 والعدد نفسه، أو التوقف قبل استنتاج «الشريك» في كل جداء.',
  },
  {
    id: 'ex-4a',
    source: { ...S(4), part: 'أ' },
    learningPointId: LP.P2,
    difficulty: 'moyen',
    statement: 'عيّن جميع قواسم كل من الأعداد التالية: 910 ، 1000 و $5 \\times 11$.',
    interaction: 'integerSet',
    question: {
      prompt: 'قواسم العدد 910',
      expected: [1, 2, 5, 7, 10, 13, 14, 26, 35, 65, 70, 91, 130, 182, 455, 910],
      explain:
        '$910 = 1 \\times 910 = 2 \\times 455 = 5 \\times 182 = 7 \\times 130 = 10 \\times 91 = 13 \\times 70 = 14 \\times 65 = 26 \\times 35$.',
    },
  },
  {
    id: 'ex-4b',
    source: { ...S(4), part: 'ب' },
    learningPointId: LP.P4,
    difficulty: 'moyen',
    statement: 'قواسم العدد 1000.',
    interaction: 'integerSet',
    question: {
      prompt: 'قواسم العدد 1000',
      expected: [1, 2, 4, 5, 8, 10, 20, 25, 40, 50, 100, 125, 200, 250, 500, 1000],
      explain: 'نختبر الأعداد من 1 إلى 31 (31² = 961 ≤ 1000 < 32²)؛ قواعد قابلية القسمة على 2 و 4 و 5 تُسرّع الاختبار.',
    },
  },
  {
    id: 'ex-4c',
    source: { ...S(4), part: 'جـ' },
    learningPointId: LP.P1,
    difficulty: 'facile',
    statement: 'قواسم العدد $5 \\times 11$.',
    interaction: 'integerSet',
    question: {
      prompt: 'قواسم العدد $5 \\times 11 = 55$',
      expected: [1, 5, 11, 55],
      explain: 'الكتابة $55 = 5 \\times 11$ تعطي مباشرة القاسمين 5 و 11، ومعهما 1 و 55.',
    },
  },
  {
    id: 'ex-6',
    source: S(6),
    learningPointId: LP.P4,
    difficulty: 'difficile',
    statement:
      'عيّن رقم الوحدات $u$ ورقم العشرات $d$ في العدد $\\overline{1956du}$ كي يصبح قابلا للقسمة على 5 و 9 في آن واحد. (اذكر كل الحالات الممكنة)',
    interaction: 'choice',
    question: {
      prompt: 'ما هي الحالات الممكنة؟',
      options: [
        '$u = 0$ و $d = 6$ ، أو $u = 5$ و $d = 1$',
        '$u = 0$ و $d = 6$ فقط',
        '$u = 5$ و $d = 1$ فقط',
        '$u = 5$ و $d$ كيفي',
      ],
      correct: 0,
      cols: 1,
      explain:
        'القسمة على 5: $u = 0$ أو $u = 5$. القسمة على 9: $1 + 9 + 5 + 6 + d + u = 21 + d + u$ مضاعف لـ 9، أي $d + u = 6$ أو $15$؛ و $15$ مستحيل لأن $d \\leq 9$ و $u \\leq 5$. إذن $d + u = 6$: فنجد 195660 و 195615.',
    },
    commonError: 'الاكتفاء بحالة واحدة، أو نسيان أن مجموع الأرقام يجب أن يكون مضاعفًا لـ 9 (وليس مساويًا لـ 9).',
  },
  {
    id: 'ex-7',
    source: S(7),
    learningPointId: LP.P1,
    difficulty: 'moyen',
    statement:
      'بنى أهل الخير للحيّ خزان ماء صدقةً جارية، شكله متوازي مستطيلات ارتفاعه 1m وحجمه $30\\,m^3$ (الوحدة 1m). جد كل الحالات الممكنة لبُعدي قاعدة هذا الخزان مع العلم أنهما عددان طبيعيان.',
    interaction: 'choice',
    question: {
      prompt: 'مساحة القاعدة $30\\,m^2$. ما هي الحالات الممكنة لبُعديها؟',
      options: [
        '1 و 30 ؛ 2 و 15 ؛ 3 و 10 ؛ 5 و 6',
        '1 و 30 ؛ 2 و 15 ؛ 3 و 10',
        '5 و 6 فقط',
        '2 و 15 ؛ 4 و 7.5 ؛ 5 و 6',
      ],
      correct: 0,
      cols: 1,
      explain:
        'الحجم = مساحة القاعدة × الارتفاع، فمساحة القاعدة 30؛ بُعداها عددان طبيعيان جداؤهما 30: هي كتابات 30 على شكل جداء عاملين.',
    },
  },
  {
    id: 'ex-8',
    source: S(8),
    learningPointId: LP.P2,
    difficulty: 'moyen',
    statement: 'ما هي قيم العدد الطبيعي $a$ التي من أجلها يكون $\\dfrac{18}{a}$ عددا طبيعيا؟',
    interaction: 'integerSet',
    question: {
      prompt: 'قيم $a$ الممكنة',
      expected: [1, 2, 3, 6, 9, 18],
      explain: '$\\dfrac{18}{a}$ عدد طبيعي يعني أن $a$ قاسم للعدد 18.',
    },
  },
  {
    id: 'ex-9',
    source: S(9),
    learningPointId: LP.P2,
    difficulty: 'difficile',
    statement: 'ما هي قيم العدد الطبيعي $a$ التي من أجلها يكون $\\dfrac{24}{a + 7}$ عددا طبيعيا؟',
    interaction: 'integerSet',
    question: {
      prompt: 'قيم $a$ الممكنة',
      expected: [1, 5, 17],
      explain:
        '$a + 7$ قاسم للعدد 24 وأكبر من 7 أو يساويه: $a + 7 \\in \\{8 ; 12 ; 24\\}$، أي $a \\in \\{1 ; 5 ; 17\\}$.',
    },
    commonError: 'إعطاء قواسم 24 نفسها بدل قيم a، أو نسيان الشرط a + 7 ≥ 7.',
  },
  {
    id: 'ex-11',
    source: S(11),
    learningPointId: LP.P4,
    difficulty: 'difficile',
    statement:
      'عيّن كل الأعداد الطبيعية التي تتكون من ثلاثة أرقام وتقبل القسمة على 3 وعلى 5 في آن واحد علما أن رقم العشرات فيها يساوي 7.',
    interaction: 'integerSet',
    question: {
      prompt: 'اكتب كل هذه الأعداد.',
      expected: [270, 375, 570, 675, 870, 975],
      explain:
        'رقم الوحدات 0 أو 5 (القسمة على 5)، ومجموع الأرقام مضاعف لـ 3: مع 0 نجد 270 و 570 و 870؛ مع 5 نجد 375 و 675 و 975.',
    },
  },
];
export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
