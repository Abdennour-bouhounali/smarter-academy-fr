/**
 * Les exercices du MANUEL rattachés au درس 1 « التكرار المجمع والتواتر المجمع » (extraction.json →
 * destinations : ex-1 … ex-6 p. 98 « حساب تكرارات مجمعة و تواترات مجمعة », ex-21 p. 101 « أتعمّق »).
 * Énoncés au mot près ; un exercice à plusieurs parties est découpé en une entrée par partie (la première
 * porte l'énoncé). Les tableaux et figures sont des DONNÉES (`table`, `figure`) que le module dessine.
 * ex-1 هـ (le مخطط بالأعمدة au tableur) est fait dans la leçon 3 « المجدولات » (duplicatedIn) : ici, un renvoi.
 * Tous les distracteurs sont faux (calculés ; la confusion qu'ils portent est dite en commentaire).
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_takrar-mujamma_P1',
  P2: '4am_takrar-mujamma_P2',
  P3: '4am_takrar-mujamma_P3',
};

const E = (n, part) => ({ ...src(`ex-${n}`, n === 21 ? 101 : 98, n === 21 ? 'أتعمّق' : 'أوظّف تعلّماتي', n), ...(part ? { part } : {}) });

export const EX1_SERIES = ['33', '33', '32', '30', '32', '34', '34', '30', '30', '35', '36', '30', '32', '34', '33', '32', '32', '33', '35', '32', '34', '30', '30', '32', '34', '32', '30', '34', '32', '30'];
export const EX1_POINTER = 'هـ) مثّل هذه السلسلة بمخطط الأعمدة باستعمال مجدول الإكسال — سنحقّقه بالمجدول في الدرس 3 «استعمال المجدولات».';
export const EX2_SERIES = ['8', '10', '12', '19', '10', '13', '12', '9', '10', '13', '19', '8', '10', '12', '16', '10', '9', '12', '13', '13', '13', '10', '16', '10', '12', '9', '10', '13', '12', '10'];

export const EXERCISES = [
  // تمرين 1 — درجات الحرارة في جوان (30 يوما)
  {
    id: 'ex-1-a', source: E(1, 'أ'), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'إليك درجات الحرارة المسجلة بإحدى المدن خلال شهر جوان (الوحدة: °C).',
    items: [EX1_SERIES.join(' ، ')],
    interaction: 'numeric',
    question: {
      prompt: 'أ) ما هو عدد الأيام التي سجلت فيها درجات حرارة تفوق 34 درجة مئوية؟',
      expected: 3, display: '3',
      explain: '«تفوق 34» لا تشمل 34: الدرجتان 35 (يومان) و 36 (يوم واحد): $2 + 1 = 3$.',
    },
    method: 'نرتّب القيم في جدول تكراري (30: 8 ، 32: 9 ، 33: 4 ، 34: 6 ، 35: 2 ، 36: 1) ثم نجمع تكرارات القيم التي تحقّق الشرط.',
    commonError: 'حساب الأيام التي «تفوق 34» كأنها «34 على الأقل» ($6 + 2 + 1 = 9$): «تفوق» لا تشمل 34.',
  },
  {
    id: 'ex-1-b', source: E(1, 'ب'), learningPointId: LP.P1, difficulty: 'facile',
    interaction: 'numeric',
    question: {
      prompt: 'ب) ما هو عدد الأيام التي سجّل فيها أقل من 34 درجة مئوية؟',
      expected: 21, display: '21',
      explain: '«أقل من 34» لا تشمل 34: $8 + 9 + 4 = 21$ (الدرجات 30 و 32 و 33).',
    },
  },
  {
    id: 'ex-1-c', source: E(1, 'جـ'), learningPointId: LP.P1, difficulty: 'facile',
    interaction: 'numeric',
    question: {
      prompt: 'جـ) ما هو عدد الأيام التي سجّل فيها 32 درجة مئوية على الأقل؟',
      expected: 22, display: '22',
      explain: '«على الأقل» تشمل 32: $9 + 4 + 6 + 2 + 1 = 22$ — التكرار المجمع النازل للقيمة 32.',
    },
  },
  {
    id: 'ex-1-d', source: E(1, 'د'), learningPointId: LP.P1, difficulty: 'facile',
    interaction: 'numeric',
    question: {
      prompt: 'د) ما هو عدد الأيام التي سجّل فيها 32 درجة مئوية على الأكثر؟',
      expected: 17, display: '17',
      explain: '«على الأكثر» تشمل 32: $8 + 9 = 17$ — التكرار المجمع الصاعد للقيمة 32. (وتحقّق: $17 + 22 = 30 + 9$.)',
    },
  },
  // تمرين 2 — علامات قسم (30 تلميذا)
  {
    id: 'ex-2-a', source: E(2, 'التكرار'), learningPointId: LP.P3, difficulty: 'facile',
    statement: 'تحصّل تلاميذ قسم على العلامات التالية: انقل ثم أتمم الجدول التالي:',
    items: [EX2_SERIES.join(' ، ')],
    table: { head: 'العلامة', values: ['8', '9', '10', '12', '13', '16', '19'], rows: [{ label: 'التكرار', cells: ['…', '…', '…', '…', '…', '…', '…'] }, { label: 'التكرار المجمع الصاعد', cells: ['…', '…', '…', '…', '…', '…', '…'] }] },
    interaction: 'batch',
    question: {
      prompt: 'سطر التكرار (عُدّ كل علامة في السلسلة):',
      rows: [
        { label: 'تكرار العلامة 10', options: ['$9$', '$8$', '$10$'], correct: 0, correction: 'العلامة 10 تظهر 9 مرات.' },
        { label: 'تكرار العلامة 12', options: ['$5$', '$6$', '$7$'], correct: 1, correction: 'العلامة 12 تظهر 6 مرات.' },
        { label: 'تكرار العلامة 13', options: ['$6$', '$5$', '$7$'], correct: 0, correction: 'العلامة 13 تظهر 6 مرات (والعلامات 8 ، 16 ، 19 مرتين لكل منها، و 9 ثلاث مرات).' },
      ],
      explain: 'المجموع $2 + 3 + 9 + 6 + 6 + 2 + 2 = 30$ : لم ننس أي علامة.',
    },
    commonError: 'ترك علامة دون عدّ: نتحقّق دائما أن مجموع التكرارات يساوي عدد التلاميذ 30.',
  },
  {
    id: 'ex-2-b', source: E(2, 'الصاعد'), learningPointId: LP.P1, difficulty: 'moyen',
    interaction: 'batch',
    question: {
      prompt: 'سطر التكرار المجمع الصاعد (التكرارات: 2 ، 3 ، 9 ، 6 ، 6 ، 2 ، 2):',
      rows: [
        // 3 = تكرار 9 وحده ; 14 = الصاعد للعلامة 10
        { label: 'العلامة 9', options: ['$5$', '$3$', '$14$'], correct: 0, correction: '$2 + 3 = 5$' },
        { label: 'العلامة 10', options: ['$9$', '$14$', '$11$'], correct: 1, correction: '$5 + 9 = 14$' },
        // 26 = الصاعد للعلامة 13 ; 16 = النازل للعلامة 12
        { label: 'العلامة 12', options: ['$20$', '$26$', '$16$'], correct: 0, correction: '$14 + 6 = 20$' },
        { label: 'العلامة 19', options: ['$2$', '$28$', '$30$'], correct: 2, correction: 'آخر تكرار مجمع صاعد هو التكرار الكلي: $28 + 2 = 30$' },
      ],
      explain: 'السطر كاملا: 2 ، 5 ، 14 ، 20 ، 26 ، 28 ، 30.',
    },
  },
  // تمرين 3 — أسباب حوادث المرور 2016 (نسب مئوية)
  {
    id: 'ex-3', source: E(3), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'الجدول التالي يقدم أسبابًا لحوادث الطرقات المسجلة سنة 2016 في المناطق الحضرية بالجزائر. انقل ثم أتمم الجدول أعلاه.',
    table: { head: 'السبب', values: ['العنصر البشري', 'المركبة', 'الطريق والمحيط'], rows: [{ label: 'النسبة المئوية', cells: ['$97{,}97\\%$', '$0{,}95\\%$', '$1{,}08\\%$'] }, { label: 'التواتر المجمع الصاعد', cells: ['…', '…', '…'] }, { label: 'التواتر المجمع النازل', cells: ['…', '…', '…'] }] },
    interaction: 'batch',
    question: {
      prompt: 'الأسباب ليست أعدادا: نجمع النسب في ترتيب أعمدة الجدول.',
      rows: [
        // 2,03 % = النازل ; 0,95 % = النسبة وحدها
        { label: 'الصاعد — المركبة', options: ['$98{,}92\\%$', '$2{,}03\\%$', '$0{,}95\\%$'], correct: 0, correction: '$97{,}97\\% + 0{,}95\\% = 98{,}92\\%$' },
        { label: 'الصاعد — الطريق والمحيط', options: ['$1{,}08\\%$', '$98{,}92\\%$', '$100\\%$'], correct: 2, correction: '$98{,}92\\% + 1{,}08\\% = 100\\%$' },
        { label: 'النازل — المركبة', options: ['$2{,}03\\%$', '$98{,}92\\%$', '$0{,}95\\%$'], correct: 0, correction: '$0{,}95\\% + 1{,}08\\% = 2{,}03\\%$' },
        { label: 'النازل — العنصر البشري', options: ['$97{,}97\\%$', '$100\\%$', '$2{,}03\\%$'], correct: 1, correction: 'النازل لأول عمود يشمل الأعمدة كلها: $100\\%$' },
      ],
      explain: 'الصاعد: $97{,}97\\%$ ، $98{,}92\\%$ ، $100\\%$ ؛ النازل: $100\\%$ ، $2{,}03\\%$ ، $1{,}08\\%$ .',
    },
    commonError: 'قسمة النسب على عدد الحوادث: النسب المئوية تواترات جاهزة، نجمعها مباشرة.',
  },
  // تمرين 4 — مخطط دائري للقامات
  {
    id: 'ex-4-a', source: E(4, 'المخطط'), learningPointId: LP.P2, difficulty: 'facile',
    statement: 'يمثل المخطط الدّائري التالي أطوال قامات تلاميذ قسم إحدى المتوسطات. أتمم هذا المخطط ثم أتمم الجدول التالي.',
    figure: 'pie-ex4',
    interaction: 'numeric',
    question: {
      prompt: 'النسبة المئوية الناقصة (قطاع 144cm) هي (بالمئة):',
      expected: 15, display: '15',
      explain: '$100\\% - (20\\% + 40\\% + 25\\%) = 15\\%$.',
    },
  },
  {
    id: 'ex-4-b', source: E(4, 'الجدول'), learningPointId: LP.P2, difficulty: 'moyen',
    table: { head: 'القامة', values: ['144', '152', '155', '160'], rows: [{ label: 'التواتر المجمع الصاعد', cells: ['…', '…', '…', '…'] }, { label: 'التواتر المجمع النازل', cells: ['…', '…', '…', '…'] }] },
    interaction: 'batch',
    question: {
      prompt: 'التواترات: 144: 15% ، 152: 20% ، 155: 40% ، 160: 25%.',
      rows: [
        { label: 'الصاعد — 152', options: ['$35\\%$', '$20\\%$', '$85\\%$'], correct: 0, correction: '$15\\% + 20\\% = 35\\%$' },
        { label: 'الصاعد — 155', options: ['$40\\%$', '$75\\%$', '$65\\%$'], correct: 1, correction: '$35\\% + 40\\% = 75\\%$' },
        { label: 'النازل — 155', options: ['$65\\%$', '$75\\%$', '$25\\%$'], correct: 0, correction: '$40\\% + 25\\% = 65\\%$' },
        { label: 'النازل — 144', options: ['$15\\%$', '$85\\%$', '$100\\%$'], correct: 2, correction: '144 أصغر قيمة: النازل لها يشمل الجميع $100\\%$' },
      ],
      explain: 'الصاعد: 15% ، 35% ، 75% ، 100% ؛ النازل: 100% ، 85% ، 65% ، 25%.',
    },
  },
  // تمرين 5 — مدة التنقل (فئات)
  {
    id: 'ex-5', source: E(5), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'قامت إدارة متوسطة، حرصًا على راحة تلاميذها، بسبر الآراء لمعرفة المدّة التي يقضيها كل تلميذ لقطع المسافة الفاصلة بين منزله والمتوسطة فتحصّلت على النتائج المقدّمة في الجدول الآتي: عيّن التكرار المجمع الصاعد و التكرار المجمع النازل لكل فئة.',
    table: { head: 'المدة t بالدقيقة', values: ['$5 \\le t < 10$', '$10 \\le t < 15$', '$15 \\le t < 20$', '$20 \\le t \\le 25$'], rows: [{ label: 'عدد التلاميذ', cells: ['180', '150', '50', '20'] }] },
    interaction: 'batch',
    question: {
      prompt: 'لكل فئة:',
      rows: [
        { label: 'الصاعد — $10 \\le t < 15$', options: ['$330$', '$150$', '$220$'], correct: 0, correction: '$180 + 150 = 330$' },
        { label: 'الصاعد — $15 \\le t < 20$', options: ['$70$', '$380$', '$400$'], correct: 1, correction: '$330 + 50 = 380$' },
        { label: 'النازل — $10 \\le t < 15$', options: ['$220$', '$330$', '$170$'], correct: 0, correction: '$150 + 50 + 20 = 220$' },
        { label: 'النازل — $20 \\le t \\le 25$', options: ['$400$', '$20$', '$70$'], correct: 1, correction: 'آخر فئة: لا فئة تليها، النازل هو تكرارها $20$' },
      ],
      explain: 'الصاعد: 180 ، 330 ، 380 ، 400 ؛ النازل: 400 ، 220 ، 70 ، 20.',
    },
    commonError: 'جمع حدود الفئات بدل تكراراتها: نجمع أعداد التلاميذ لا الدقائق.',
  },
  // تمرين 6 — استهلاك الكهرباء (مدرج تكراري)
  {
    id: 'ex-6', source: E(6), learningPointId: LP.P2, difficulty: 'difficile',
    statement: 'يبيّن المدرّج التكراري التّالي الاستهلاك السنوي للكهرباء بمجمع سكني يضم 200 عائلة مقاسا بالميغاوات ساعي ($\\mathrm{MWh}$). عيّن التواتر المجمع الصاعد و التواتر المجمع النازل لكل فئة.',
    figure: 'hist-ex6',
    interaction: 'batch',
    question: {
      prompt: 'نقرأ التكرارات على المدرّج (10 ، 50 ، 60 ، 50 ، 20 ، 10)، ونقسم على 200:',
      rows: [
        { label: 'تواتر الفئة $1 \\le c < 1{,}5$', options: ['$0{,}3$', '$60$', '$0{,}6$'], correct: 0, correction: '$\\dfrac{60}{200} = 0{,}3$' },
        { label: 'الصاعد — $1 \\le c < 1{,}5$', options: ['$0{,}3$', '$0{,}6$', '$0{,}7$'], correct: 1, correction: '$0{,}05 + 0{,}25 + 0{,}3 = 0{,}6$' },
        { label: 'الصاعد — $2{,}5 \\le c \\le 3$', options: ['$0{,}05$', '$0{,}95$', '$1$'], correct: 2, correction: 'آخر فئة: $\\dfrac{200}{200} = 1$' },
        { label: 'النازل — $1 \\le c < 1{,}5$', options: ['$0{,}7$', '$0{,}6$', '$0{,}4$'], correct: 0, correction: '$0{,}3 + 0{,}25 + 0{,}1 + 0{,}05 = 0{,}7$' },
        { label: 'النازل — $2 \\le c < 2{,}5$', options: ['$0{,}1$', '$0{,}15$', '$0{,}95$'], correct: 1, correction: '$0{,}1 + 0{,}05 = 0{,}15$' },
      ],
      explain: 'الصاعد: 0,05 ، 0,3 ، 0,6 ، 0,85 ، 0,95 ، 1 ؛ النازل: 1 ، 0,95 ، 0,7 ، 0,4 ، 0,15 ، 0,05.',
    },
    commonError: 'نسيان القسمة على 200: التواتر المجمع لا يتجاوز 1.',
  },
  // تمرين 21 — من الصاعد إلى التكرارات ثم التواترات
  {
    id: 'ex-21', source: E(21), learningPointId: LP.P2, difficulty: 'difficile',
    statement: 'الجدول التالي متعلق بالعلامات التي تحصّل عليها تلاميذ قسم في اختبار الرياضيات. عيّن التواتر المجمع الصاعد و التواتر المجمع النازل لكل علامة من هذه العلامات.',
    table: { head: 'العلامة', values: ['8,5', '10', '12,5', '14', '16,5'], rows: [{ label: 'التكرار المجمع الصاعد', cells: ['3', '13', '22', '29', '30'] }] },
    interaction: 'batch',
    question: {
      prompt: 'التكرار الكلي 30 (آخر صاعد). التكرارات بالطرح: 3 ، 10 ، 9 ، 7 ، 1.',
      rows: [
        { label: 'تكرار العلامة 12,5', options: ['$9$', '$22$', '$12$'], correct: 0, correction: '$22 - 13 = 9$' },
        { label: 'الصاعد — 10', options: ['$\\dfrac{13}{30}$', '$\\dfrac{10}{30}$', '$13$'], correct: 0, correction: '$\\dfrac{13}{30}$' },
        { label: 'الصاعد — 12,5', options: ['$\\dfrac{9}{30}$', '$\\dfrac{11}{15}$', '$\\dfrac{22}{29}$'], correct: 1, correction: '$\\dfrac{22}{30} = \\dfrac{11}{15}$' },
        { label: 'النازل — 12,5', options: ['$\\dfrac{17}{30}$', '$\\dfrac{8}{30}$', '$\\dfrac{9}{30}$'], correct: 0, correction: '$\\dfrac{9 + 7 + 1}{30} = \\dfrac{17}{30}$' },
        { label: 'النازل — 14', options: ['$\\dfrac{29}{30}$', '$\\dfrac{4}{15}$', '$\\dfrac{7}{30}$'], correct: 1, correction: '$\\dfrac{7 + 1}{30} = \\dfrac{8}{30} = \\dfrac{4}{15}$' },
      ],
      explain: 'الصاعد: $0{,}1$ ، $\\dfrac{13}{30}$ ، $\\dfrac{11}{15}$ ، $\\dfrac{29}{30}$ ، $1$ ؛ النازل: $1$ ، $0{,}9$ ، $\\dfrac{17}{30}$ ، $\\dfrac{4}{15}$ ، $\\dfrac{1}{30}$ .',
    },
    commonError: 'قسمة التكرار المجمع على العلامة بدل التكرار الكلي 30.',
  },
];

export const partsOf = (n) => EXERCISES.filter((ex) => ex.id === `ex-${n}` || ex.id.startsWith(`ex-${n}-`));
export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
