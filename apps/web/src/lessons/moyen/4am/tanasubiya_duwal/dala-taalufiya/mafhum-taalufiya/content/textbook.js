/**
 * Le contenu du MANUEL pour le درس 1 « مفهوم وتعيين دالة تآلفية » — données pures (aucun JSX), au mot
 * près ; chaque bloc cite son élément de docs/sources/4am/unit7/extraction.json (pp. 77–78). Les modules
 * rendent ces données ; ils n'en réécrivent aucune. Ce que la plateforme ajoute est déclaré (`addition(…)`).
 *
 * Le manuel fourni (3 pages) n'a ni معارف ni طرائق : la définition, la صورة, le تعيين de l'antécédent et
 * les deux cas particuliers sont ÉCRITS PAR LA PLATEFORME (`knowledge_formalization`), dans le vocabulaire
 * du manuel (« دالة تآلفية »، « الترميز »، « صورة العدد »، « العدد الذي صورته »), jamais présentés comme le
 * texte du livre.
 *
 * CORRECTION (politique du propriétaire) : le نشاط 1, 4-ب imprime « أضيف » ; la leçon affiche « أضف »
 * (l'impératif, comme « اضرب ») avec UNE ligne discrète ; le texte imprimé reste dans l'extraction.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** نشاط 1 (p. 78) — « تعيين دالة تآلفية » : la paie (35000DA + 185DA par heure supplémentaire). */
export const ACTIVITY = {
  source: src('act-1', 78, 'أنشطة', 1),
  title: 'تعيين دالة تآلفية',
  text: 'توظف مؤسسة اقتصادية جزائرية عمالا تكافئ إتقانهم لعملهم، و تقترح على كل واحد منهم أجرة يتم حسابها بالصيغة التالية: أجرة قاعدية شهرية قدرها 35000DA، يضاف إليها 185DA لكل ساعة إضافية منجزة في نفس الشهر.',
  questions: [
    '1) إذا أنجز عامل 10 ساعات إضافية، تحقق من أنّ أجرته لهذا الشهر تساوي 36850DA.',
    '2) أ) انقل الجدول التالي وأتممه. ب) هل الجدول المقابل جدول تناسبية؟ اشرح.',
    '3) نسمّي $x$ عدد الساعات الإضافية التي أنجزها عامل، عبّر عن أجرته $S(x)$ بدلالة $x$ .',
    '4) كل دالة من الشكل: $x \\longmapsto ax + b$ حيث $a$ و $b$ عددان معلومان تسمى دالة تآلفية. أ) هل الوضعية المقترحة تعرّف دالة تآلفية؟ ب) صف الدالة $S$ ببرنامج حساب من الشكل: «اضرب $x$ في …، أضف …»',
  ],
  // La phrase du manuel qui NOMME (س 4).
  naming: 'كل دالة من الشكل: $x \\longmapsto ax + b$ حيث $a$ و $b$ عددان معلومان تسمى دالة تآلفية.',
  correctionNote: 'صحّحت المنصّة خطأً مطبعيًا في نص الكتاب: «أضف» (بصيغة الأمر مثل «اضرب») وليس «أضيف».',
  rows: ['عدد الساعات الإضافية', 'الأجرة الشهرية (بالدينار)'],
  table: { x: ['5', '8', '10', '12', '15'], y: ['…', '…', '36850', '…', '…'] },
  answer: { q1: 36850, row: [35925, 36480, 36850, 37220, 37775], a: 185, b: 35000 },
  // Le lab (متقدم) : la paie, ses cinq colonnes et la cible 37775 (colonne 15) — lue à l'envers.
  lab: { rule: '185x+35000', mode: 'image|antecedent|classify', target: '37775', marks: '5|8|10|12|15' },
};

/** Les calculs du نشاط 1 écrits par la plateforme (le livre les demande sans les écrire). */
export const ACTIVITY_LINES = {
  source: addition('interaction_generation'),
  q1: '$35000 + 185 \\times 10 = 35000 + 1850 = 36850$ : الأجرة 36850DA.',
  row: '$185 \\times 5 + 35000 = 35925$ ، $185 \\times 8 + 35000 = 36480$ ، $185 \\times 12 + 35000 = 37220$ ، $185 \\times 15 + 35000 = 37775$.',
  prop: '$\\dfrac{35925}{5} = 7185$ و $\\dfrac{36480}{8} = 4560$ : حاصلا القسمة مختلفان، فالجدول ليس جدول تناسبية — الأجرة القاعدية 35000 تُدفع ولو كان $x = 0$.',
  formula: '$S(x) = 185x + 35000$ : نضرب عدد الساعات في 185 ثم نضيف الأجرة القاعدية.',
  affine: 'نعم: $S(x) = 185x + 35000$ من الشكل $ax + b$ مع $a = 185$ و $b = 35000$ ، فالدالة $S$ دالة تآلفية.',
  program: '«اضرب $x$ في 185، أضف 35000».',
  antecedent: '$185x + 35000 = 38330$ ، إذن $185x = 38330 - 35000 = 3330$ ، ومنه $x = 3330 \\div 185 = 18$ : 18 ساعة إضافية.',
};

/** س 2-أ : le second rang. Chaque distracteur est faux pour une raison qu'on peut dire. */
export const ROW_OPTIONS = [
  '$35925$ ، $36480$ ، $37220$ ، $37775$',
  // la seule partie variable 185x (MISC-TAALUFI-NISYAN-B)
  '$925$ ، $1480$ ، $2220$ ، $2775$',
  // la proportionnalité supposée à partir de la colonne 10 (MISC-TAALUFI-KHATTIYA-KHALT)
  '$18425$ ، $29480$ ، $44220$ ، $55275$',
  // 35000 + 185 compté à chaque heure (MISC-TARRID-JUZ-THABIT)
  '$175925$ ، $281480$ ، $422220$ ، $527775$',
];

/** نشاط 2 (p. 78) — « التعرّف على دوال تآلفية » : six règles. */
export const ACTIVITY2 = {
  source: src('act-2', 78, 'أنشطة', 2),
  title: 'التعرّف على دوال تآلفية',
  questions: [
    '1) نقترح الدوال الآتية: أ) $x \\longmapsto 3x^2 + 1$ ؛ ب) $x \\longmapsto -2x + 1$ ؛ ج) $x \\longmapsto 5x$ ؛ د) $x \\longmapsto \\dfrac{x}{2} - 1$ ؛ هـ) $x \\longmapsto 2 + 3x$ ؛ و) $x \\longmapsto \\dfrac{1}{x} - 3$ . ما هي الدوال التي تعتبر دوال تآلفية؟ عيّن عندئذ المعاملين $a$ و $b$ لكلّ دالة تآلفية.',
    '2) ما رأيك في التصريح: «الدالة الخطيّة هي أيضا دالة تآلفية»؟',
  ],
  statement: '«الدالة الخطيّة هي أيضا دالة تآلفية»',
  // `correct` : l'indice dans `options` ; chaque distracteur est FAUX (a et b inversés, un signe perdu,
  // une règle qui n'est pas du premier degré déclarée affine).
  rows: [
    { id: 'a', label: 'أ) $x \\longmapsto 3x^2 + 1$', options: ['تآلفية: $a = 3$ ، $b = 1$', 'تآلفية: $a = 9$ ، $b = 1$', 'ليست تآلفية'], correct: 2,
      correction: '$3x^2 = 3x \\times x$ : $x$ مضروب في نفسه، فالعبارة ليست من الشكل $ax + b$ ($1 \\longmapsto 4$ ، $2 \\longmapsto 13$ ، $3 \\longmapsto 28$ : الزيادات غير متساوية).' },
    { id: 'b', label: 'ب) $x \\longmapsto -2x + 1$', options: ['تآلفية: $a = -2$ ، $b = 1$', 'تآلفية: $a = 2$ ، $b = 1$', 'تآلفية: $a = 1$ ، $b = -2$'], correct: 0,
      correction: '$-2x + 1 = (-2) \\times x + 1$ : $a = -2$ (بإشارته) و $b = 1$.' },
    { id: 'j', label: 'ج) $x \\longmapsto 5x$', options: ['تآلفية: $a = 5$ ، $b = 0$', 'ليست تآلفية لأنّه لا يوجد $b$', 'تآلفية: $a = 0$ ، $b = 5$'], correct: 0,
      correction: '$5x = 5x + 0$ : $a = 5$ و $b = 0$ ؛ إنها دالة خطية، وهي أيضا تآلفية.' },
    { id: 'd', label: 'د) $x \\longmapsto \\dfrac{x}{2} - 1$', options: ['تآلفية: $a = \\dfrac{1}{2}$ ، $b = -1$', 'تآلفية: $a = 2$ ، $b = -1$', 'ليست تآلفية لأنّ فيها قسمة'], correct: 0,
      correction: '$\\dfrac{x}{2} = \\dfrac{1}{2} \\times x$ : $a = \\dfrac{1}{2}$ و $b = -1$ (القسمة على 2 ضرب في $\\dfrac{1}{2}$).' },
    { id: 'h', label: 'هـ) $x \\longmapsto 2 + 3x$', options: ['تآلفية: $a = 3$ ، $b = 2$', 'تآلفية: $a = 2$ ، $b = 3$', 'ليست تآلفية لأنّ $b$ مكتوب أولا'], correct: 0,
      correction: '$2 + 3x = 3x + 2$ : $a$ هو العدد المضروب في $x$ و $b$ الحد الثابت، أينما كُتبا: $a = 3$ و $b = 2$.' },
    { id: 'w', label: 'و) $x \\longmapsto \\dfrac{1}{x} - 3$', options: ['تآلفية: $a = 1$ ، $b = -3$', 'تآلفية: $a = -3$ ، $b = 1$', 'ليست تآلفية'], correct: 2,
      correction: '$\\dfrac{1}{x}$ ليس جداء $x$ في عدد ثابت ($1 \\longmapsto -2$ ، $2 \\longmapsto -2{,}5$ ، $4 \\longmapsto -2{,}75$) ، وصورة 0 غير معرّفة: ليست تآلفية.' },
  ],
  answer: { affine: ['b', 'j', 'd', 'h'], q2: true },
  q2: 'صحيح: الدالة الخطية $x \\longmapsto ax$ هي الدالة التآلفية $x \\longmapsto ax + b$ في الحالة $b = 0$ .',
};

/**
 * Les erreurs que la leçon EXPLIQUE (pour la carte : خطأ شائع wrong / why / right) — prises des
 * corrections des modules 2 et 3 (هـ du نشاط 2 ; la صورة sans b).
 */
export const MISTAKES = {
  ab: {
    wrong: 'في $x \\longmapsto 2 + 3x$ نقول $a = 2$ و $b = 3$ لأنّ 2 مكتوب أولا.',
    why: ACTIVITY2.rows[4].correction,
    right: '$a$ هو العدد المضروب في $x$ ، و $b$ هو الحدّ الثابت.',
  },
  b: {
    wrong: 'صورة 4 بالدالة $f(x) = 2x + 7$ هي $2 \\times 4 = 8$ .',
    why: 'نسينا الحدّ الثابت $b = 7$ : الصورة هي $ax + b$ وليست $ax$ وحدها.',
    right: '$f(4) = 2 \\times 4 + 7 = 15$ .',
  },
};

/**
 * معارف — ÉCRITES PAR LA PLATEFORME (le manuel fourni n'a pas de معارف pour cette unité), dans les mots du
 * manuel : définition et notation, صورة عدد, العدد الذي صورته معلومة, les deux cas particuliers.
 */
const FORMAL = addition('knowledge_formalization');
export const KNOWLEDGE = {
  definition: {
    source: FORMAL,
    title: 'الدالة التآلفية',
    lines: [
      '$a$ و $b$ عددان معلومان. عندما نرفق بكل عدد $x$ العدد $ax + b$ نقول إننا عرّفنا دالة تآلفية $f$ معاملاها $a$ و $b$ .',
      '• العدد $ax + b$ يسمّى صورة $x$ بالدالة $f$ ، ونكتب $f(x) = ax + b$ .',
      '• نرمز لهذه الدالة بـ $f : x \\longmapsto ax + b$ .',
    ],
    examples: [
      'الأجرة $S : x \\longmapsto 185x + 35000$ دالة تآلفية: $a = 185$ و $b = 35000$ .',
      '$x \\longmapsto 2 + 3x$ دالة تآلفية: $a = 3$ و $b = 2$ ؛ أما $x \\longmapsto 3x^2 + 1$ و $x \\longmapsto \\dfrac{1}{x} - 3$ فليستا تآلفيتين.',
    ],
  },
  special: {
    source: FORMAL,
    title: 'حالتان خاصتان',
    linear: '• إذا كان $b = 0$ : $f(x) = ax$ ، الدالة خطية. الدالة الخطية هي أيضا دالة تآلفية.',
    constant: '• إذا كان $a = 0$ : $f(x) = b$ ، صورة كل عدد هي $b$ ، ونقول إنّ الدالة ثابتة. الدالة الثابتة هي أيضا دالة تآلفية.',
  },
};

/** صورة عدد (P2) — la règle et un exemple de la plateforme. */
export const IMAGE_METHOD = {
  source: FORMAL,
  title: 'صورة عدد بدالة تآلفية',
  rule: 'لحساب صورة عدد $m$ بالدالة التآلفية $f : x \\longmapsto ax + b$ نضرب $m$ في $a$ ثم نضيف $b$ : $f(m) = a \\times m + b$ .',
  example: 'مثال: من أجل $f(x) = 3x - 5$ لدينا $f(-2) = 3 \\times (-2) - 5 = -6 - 5 = -11$ .',
};

/** العدد الذي صورته معلومة (P3) — la méthode écrite par la plateforme, révélée ligne à ligne (MethodSteps). */
export const METHOD = {
  source: FORMAL,
  title: 'تعيين العدد الذي صورته معلومة',
  exercise: '$S$ هي الدالة التآلفية $S(x) = 185x + 35000$ . عيّن العدد الذي صورته 37775.',
  solution: [
    'نبحث عن العدد $x$ حيث $S(x) = 37775$ ، أي نحلّ المعادلة $185x + 35000 = 37775$ .',
    'نطرح 35000 من الطرفين: $185x = 37775 - 35000 = 2775$ .',
    'نقسم على 185: $x = 2775 \\div 185 = 15$ .',
    'العدد الذي صورته 37775 هو 15. للتحقق: $185 \\times 15 + 35000 = 37775$ .',
  ],
  rule: 'لتعيين العدد الذي صورته $m$ بالدالة التآلفية $f : x \\longmapsto ax + b$ (حيث $a \\neq 0$) نحلّ المعادلة $ax + b = m$ : نطرح $b$ ثم نقسم على $a$ .',
  program: 'البرنامج العكسي لـ «اضرب $x$ في $a$ ، أضف $b$» هو «اطرح $b$ ، ثم اقسم على $a$» — وليس «اقسم على $a$ ثم اطرح $b$».',
};

/** La condition a ≠ 0 de la méthode (le cas ثابتة) — انتبه. */
export const CONSTANT_NOTE = {
  source: FORMAL,
  text: 'إذا كان $a = 0$ فالدالة ثابتة $f(x) = b$ : لا يوجد عدد صورته $m$ إذا كان $m \\neq b$ ، وكل عدد صورته $m$ إذا كان $m = b$ .',
};

/**
 * « أستعدّ » — les items 1 à 5 du manuel (p. 77 ; 6–7 vont à la leçon tamthil-bayani-taalufi) et une
 * affirmation de la plateforme (résoudre une équation ax + b = c, la leçon muadala-ula). Aucune n'utilise
 * les nombres du module 1 (35000, 185, 40, 100). Items 3 et 4 FAUX par construction (pas des coquilles).
 */
const PREP = (n) => src('prep', 77, 'أستعدّ', n);
export const PREP_ITEMS = [
  { n: 1, skill: 'taawid', text: 'إذا كان $x = 6$ فإنّ $\\dfrac{1}{2}x = 12$ .', answer: false, why: '$\\dfrac{1}{2} \\times 6 = 3$ ، وليس 12', source: PREP(1) },
  { n: 2, skill: 'khattiya', text: 'صورة العدد 0 بالدّالة الخطية $x \\longmapsto -\\sqrt{2}x$ هي 0.', answer: true, why: '$-\\sqrt{2} \\times 0 = 0$', source: PREP(2) },
  { n: 3, skill: 'khattiya', text: 'صورة العدد $\\sqrt{2}$ بالدّالة الخطية $x \\longmapsto -\\sqrt{2}x$ هي $-1$ .', answer: false, why: '$-\\sqrt{2} \\times \\sqrt{2} = -2$ ، وليس $-1$', source: PREP(3) },
  { n: 4, skill: 'mafhum', text: 'الدّالة $x \\longmapsto \\dfrac{1}{3}x + 1 + x + 2$ هي دالة خطية.', answer: false, why: 'بعد الاختزال: $\\dfrac{4}{3}x + 3$ ، وفيها حدّ ثابت 3 فهي ليست خطية', source: PREP(4) },
  { n: 5, skill: 'khattiya', text: 'العدد الذي صورته 1 بالدّالة الخطية $x \\longmapsto 4x$ هو $\\dfrac{1}{4}$ .', answer: true, why: '$4 \\times \\dfrac{1}{4} = 1$', source: PREP(5) },
  { n: 6, skill: 'hal', text: 'إذا كان $2x + 7 = 19$ فإنّ $x = 13$ .', answer: false, why: 'نطرح 7 أولا: $2x = 12$ ، ثم نقسم على 2: $x = 6$ ؛ أما 13 فهو $(19 + 7) \\div 2$', source: addition('prerequisite_diagnostic') },
];
