/**
 * Le contenu du MANUEL pour le درس 2 « مفهوم وتعيين الدالة الخطية » — données pures (aucun JSX), au
 * mot près ; chaque bloc cite son élément de docs/sources/4am/unit6/extraction.json. Les modules
 * rendent ces données ; ils n'en réécrivent aucune. Ce que la plateforme ajoute est déclaré
 * (`addition(…)`).
 *
 * CORRECTION (politique du propriétaire) : le نشاط 1 imprime « 2% » ; ses questions f(x) = 6 et
 * f(x) = 1,4 ne donnent alors que 300/49 et 10/7. La leçon affiche « 20% » (40, 80, 120, 160 ;
 * a = 0,8 ; 7,5 et 1,75) avec UNE ligne discrète ; le texte imprimé reste dans l'extraction.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** نشاط 1 (p. 66) — « تعيين دالة خطية » : la remise de l'Aïd, CORRIGÉE (2 % → 20 %). */
export const ACTIVITY = {
  source: src('act-1', 66, 'أنشطة', 1),
  title: 'تعيين دالة خطية',
  text: 'قرر تاجر كريم تخفيض ثمن سلعه بـ 20% بمناسبة عيد الفطر، ليتمكّن الجميع من شراء كسوة العيد.',
  correctionNote: 'صحّحت المنصّة خطأً مطبعيًا في نص الكتاب: التخفيض 20% (وليس 2%)، كما تقتضيه أسئلة النشاط.',
  table: { before: ['50', '100', '150', '200'], after: ['40', '80', '120', '160'] },
  rows: ['السعر قبل التخفيض (DA)', 'السعر بعد التخفيض (DA)'],
  questions: [
    '1) انقل الجدول المقابل وأتممه: بيّن أنّ هذا الجدول هو جدول تناسبية، وعيّن معامل التناسبية.',
    '2) نسمي $x$ السعر قبل التخفيض ونرمز بـ $f(x)$ للسعر بعد التخفيض. لاحظ أنه من أجل أي قيمة نعطيها لـ $x$ يمكن حساب قيمة $f(x)$ . احسب $f(120)$ . لاحظ كذلك أنه يمكن حساب $x$ إذا عُلم $f(x)$ . احسب العدد $x$ في كل من الحالتين $f(x) = 6$ ثم $f(x) = 1{,}4$ .',
    '3) تحقّق من أنّ عبارة $f(x)$ بدلالة $x$ هي من الشكل: $f(x) = ax$ حيث $a$ عدد ثابت يطلب تعيينه.',
  ],
  // « نقول أنّنا عرّفنا دالة … » et « نسمي دالة f … دالة خطية معاملها a » : les phrases du manuel qui NOMMENT.
  naming: 'نقول أنّنا عرّفنا دالة ترفق بكل عدد $x$ العدد $f(x)$ . نرمز لهذه الدالة بـ $f : x \\longmapsto f(x)$',
  closing: 'نسمي دالة $f$ من الشكل $f(x) = ax$ حيث $a$ عدد معلوم، دالة خطية معاملها $a$ .',
  rules: '0,8x',
  targets: '6|1,4',
  answer: { a: 0.8, f120: 96, x6: 7.5, x14: 1.75 },
};

/** Les calculs du نشاط 1 écrits par la plateforme (le livre les demande sans les écrire). */
export const ACTIVITY_LINES = {
  source: addition('interaction_generation'),
  ratios: '$\\dfrac{40}{50} = \\dfrac{80}{100} = \\dfrac{120}{150} = \\dfrac{160}{200} = 0{,}8$ : جدول تناسبية معامله $0{,}8$.',
  reduce: 'تخفيض 20% من سعر $x$ يُبقي $80\\%$ منه: $x - 0{,}2x = 0{,}8x$.',
  f120: '$f(120) = 0{,}8 \\times 120 = 96$ : السعر بعد التخفيض 96DA.',
  x6: '$0{,}8 \\times x = 6$ ، إذن $x = 6 \\div 0{,}8 = 7{,}5$.',
  x14: '$0{,}8 \\times x = 1{,}4$ ، إذن $x = 1{,}4 \\div 0{,}8 = 1{,}75$.',
  formula: '$f(x) = 0{,}8x$ : من الشكل $f(x) = ax$ مع $a = 0{,}8$.',
};

/**
 * س 1 : la ligne complétée. Les trois autres lignes sont FAUSSES chacune pour une raison qu'on peut
 * dire : enlever 2DA (le « 2 » imprimé lu comme un montant), enlever 20DA à chaque prix
 * (MISC-TANASUB-FARQ-THABIT), prendre 20% au lieu d'enlever 20% (MISC-NISBA-AKHDH-BADAL-ZIYADA).
 */
export const ACT_ROW_OPTIONS = [
  '$40$ ، $80$ ، $120$ ، $160$',
  '$48$ ، $98$ ، $148$ ، $198$',
  '$30$ ، $80$ ، $130$ ، $180$',
  '$10$ ، $20$ ، $30$ ، $40$',
];

/** نشاط 2 (p. 66) — « تمييز دوال خطية » : trois tableaux, trois expressions. */
export const ACTIVITY2 = {
  source: src('act-2', 66, 'أنشطة', 2),
  title: 'تمييز دوال خطية',
  questions: [
    '1) أرفق بكلّ جدول العبارة الموافقة من بين: أ) $x \\longmapsto x^2$ ؛ ب) $x \\longmapsto 2x$ ؛ جـ) $x \\longmapsto 2x - 1$ .',
    '2) تحقّق من أنّ الجداول التي تمثّل وضعيات تناسبية فقط تكون مرتبطة بدوال خطية.',
    '3) عيّن الدوال الخطية من بين الدوال: أ) $x \\longmapsto x^2$ ؛ ب) $x \\longmapsto 2x$ ؛ جـ) $x \\longmapsto 2x - 1$ .',
  ],
  tables: [
    { n: 1, x: ['-2', '1{,}5', '3', '4{,}5'], y: ['-5', '2', '5', '8'] },
    { n: 2, x: ['-2', '0{,}5', '2{,}5', '3'], y: ['-4', '1', '5', '6'] },
    { n: 3, x: ['-3', '0', '1', '3'], y: ['9', '0', '1', '9'] },
  ],
  expressions: ['أ) $x \\longmapsto x^2$', 'ب) $x \\longmapsto 2x$', 'جـ) $x \\longmapsto 2x - 1$'],
  answer: { matching: { 1: 2, 2: 1, 3: 0 }, proportional: [2], linear: [1] },
  rules: 'x^2|2x|2x-1',
};

/** Les vérifications du نشاط 2 écrites par la plateforme. */
export const ACTIVITY2_LINES = {
  source: addition('interaction_generation'),
  t1: 'الجدول 1: $2 \\times (-2) - 1 = -5$ ، $2 \\times 3 - 1 = 5$ — العبارة جـ) $2x - 1$.',
  t2: 'الجدول 2: $2 \\times (-2) = -4$ ، $2 \\times 2{,}5 = 5$ — العبارة ب) $2x$.',
  t3: 'الجدول 3: $(-3)^2 = 9$ ، $1^2 = 1$ — العبارة أ) $x^2$.',
  prop: 'في الجدول 2: $\\dfrac{-4}{-2} = \\dfrac{1}{0{,}5} = \\dfrac{5}{2{,}5} = \\dfrac{6}{3} = 2$. أما الجدول 1: $\\dfrac{-5}{-2} = 2{,}5$ و $\\dfrac{5}{3} \\neq 2{,}5$ ، والجدول 3: $\\dfrac{9}{-3} = -3$ و $\\dfrac{1}{1} = 1$.',
  linear: 'الدالة ب) $x \\longmapsto 2x$ وحدها من الشكل $x \\longmapsto ax$ ($a = 2$). أما $2x - 1$ ففيها $-1$ : صورة 0 هي $-1$ وليست 0 ؛ و $x^2$ جداء $x$ في نفسه وليس في عدد ثابت.',
};

/** معارف (p. 68) — 1) الدالة الخطية, 2) الدالة الخطية والتناسبية. */
export const KNOWLEDGE = {
  linear: {
    source: src('know-1', 68, 'معارف', 1),
    title: 'الدّالة الخطية',
    definition: [
      '$a$ عدد معطى. عندما نرفق كل عدد $x$ بالجداء $a \\times x$ نقول أننا عرّفنا دالة خطية $f$ معاملها $a$ .',
      '• العدد $a \\times x$ يسمى صورة $x$ بالدّالة $f$ ونرمز لهذه الصورة بالرمز $f(x)$ ونكتب $f(x) = ax$ .',
      '• نرمز لهذه الدّالة بـ $f : x \\longmapsto ax$',
    ],
    examples: [
      '$f : x \\longmapsto 80x$ هي دالة خطية معاملها $a = 80$ .',
      'كلّ من $g : x \\longmapsto 4x - 3$ ، $h : x \\longmapsto x^2$ ليست دالة خطية.',
    ],
  },
  table: {
    source: src('know-2', 68, 'معارف', 2),
    title: 'الدّالة الخطية و التناسبية',
    definition: [
      'جدول قيم دالة خطية هو جدول فيه أعداد السّطر الثاني هي صور أعداد السّطر الأول بالدالة الخطيّة.',
      'جدول قيم دالة خطية هو جدول تناسبية. معامل الدالة الخطية هو معامل تناسبية لهذا الجدول.',
    ],
    example: '$f$ هي الدّالة الخطية المعرّفة بالشّكل : $f(x) = -3x$ . جدول القيم للدالة $f$ الآتي هو جدول تناسبية. $(-3)$ هو معامل تناسبية لهذا الجدول و هو أيضا معامل الدالة الخطية.',
    x: ['-3', '-2', '-1{,}5', '-1', '0', '0{,}5'],
    y: ['9', '6', '4{,}5', '3', '0', '-1{,}5'],
    arrow: '\\times(-3)',
  },
};

/**
 * La règle « صورة عدد » dite avec les mots de معارف 1 (« العدد a × x يسمى صورة x ») sur un exemple
 * de la plateforme (déclaré) — le calcul d'une image (P2).
 */
export const IMAGE_METHOD = {
  source: addition('interaction_generation'),
  rule: 'لحساب صورة عدد $m$ بالدالة الخطية $f : x \\longmapsto ax$ نحسب الجداء $a \\times m$ : $f(m) = a \\times m$.',
  example: 'مثال: من أجل $f(x) = -3x$ لدينا $f(-1{,}5) = -3 \\times (-1{,}5) = 4{,}5$.',
};

/** طرائق (p. 69) — « تعيين دالة خطية انطلاقا من عدد وصورته ». La solution en LIGNES (MethodSteps). */
export const METHOD = {
  source: src('method-determine', 69, 'طرائق'),
  title: 'تعيين دالة خطية انطلاقا من عدد وصورته',
  exercise: 'عيّن الدّالة الخطيّة $g$ إذا علمت أن $g(-2) = 6$ .',
  solution: [
    'الدّالة $g$ من الشكل $g(x) = ax$ .',
    'إذن $g(-2) = 6$ معناه $-2a = 6$',
    'أي $a = -3$ بالتالي $g(x) = -3x$ .',
  ],
  rule: 'لتعيين دالة خطية $g$ علما أن $g(m) = n$ ، نحل المعادلة $am = n$ ذات المجهول $a$ .',
};

/** Ce que la plateforme dit du nombre 0 (la carte 0 du lab) — la condition m ≠ 0 de la طريقة. */
export const ZERO_NOTE = {
  source: addition('interaction_generation'),
  text: 'العدد $m$ في الطريقة غير معدوم: من أجل $m = 0$ تصبح المعادلة $a \\times 0 = 0$ ، وهي محقّقة مهما كان $a$ ، فلا تعيّن الدالة.',
};

/**
 * « أؤكّد تعلّماتي » (p. 74) — les items 2, 3, 5, 6 (extraction.json → destinations › qcm ›
 * duplicatedIn › dala-khattiya, module 4 — module 7 depuis les « مسائل ») : l'إختبار أولي.
 */
const QCM_SRC = (n) => src('qcm', 74, 'أؤكّد تعلّماتي', n);
export const QCM = {
  2: { n: 2, source: QCM_SRC(2), text: '$-9$ هي صورة $-6$ بالدّالة الخطية:', options: ['$f : x \\longmapsto -\\dfrac{6}{4}x$', '$g : x \\longmapsto 1{,}5x$', '$h : x \\longmapsto -\\dfrac{4}{6}x$'], correct: 1,
    explain: '$g(-6) = 1{,}5 \\times (-6) = -9$ ؛ أما $f(-6) = -\\dfrac{6}{4} \\times (-6) = 9$ و $h(-6) = -\\dfrac{4}{6} \\times (-6) = 4$.' },
  3: { n: 3, source: QCM_SRC(3), text: '8 هو العدد الذي صورته 14 بالدّالة الخطية:', options: ['$f : x \\longmapsto 1{,}75x$', '$g : x \\longmapsto \\dfrac{8}{14}x$', '$h : x \\longmapsto \\dfrac{4}{7}x$'], correct: 0,
    explain: 'نحل $a \\times 8 = 14$ : $a = \\dfrac{14}{8} = 1{,}75$. أما $\\dfrac{8}{14} = \\dfrac{4}{7}$ فهو المعامل مقلوبًا: $\\dfrac{4}{7} \\times 8 = \\dfrac{32}{7} \\neq 14$.' },
  5: { n: 5, source: QCM_SRC(5), text: '$f$ دالة خطية حيث $f(m) = n$ و $m \\neq 0$ ، معاملها هو:', options: ['$\\dfrac{n}{m}$', '$mn$', '$n$'], correct: 0,
    explain: '$f(m) = n$ معناه $am = n$ ، ولأنّ $m \\neq 0$ : $a = \\dfrac{n}{m}$.' },
  6: { n: 6, source: QCM_SRC(6), text: 'معامل الدّالة الخطية $f$ هو:', table: { x: ['-5', '25', '10'], y: ['2', '-10', '-4'] }, options: ['$\\dfrac{52}{130}$', '$-0{,}4$', '$-\\dfrac{5}{2}$'], correct: 1,
    explain: 'جدول قيم دالة خطية جدول تناسبية: $\\dfrac{2}{-5} = \\dfrac{-10}{25} = \\dfrac{-4}{10} = -0{,}4$.' },
};

/**
 * « أستعدّ » — les items 1 à 3 du manuel (p. 65 ; 4–5 vont à tanasub-muamil, 6–9 à tatbiqat-tanasub)
 * et deux affirmations de la plateforme. Trois acquis diagnostiqués : remplacer x par un nombre
 * (taawid-qima : 1), résoudre une équation du premier degré (hal-muadala-ula : 2, 3 — leçon
 * muadala-ula), le coefficient de proportionnalité et y = a × x (muamil-tanasub : 4, 5 — leçon
 * tanasub-muamil). Aucune n'utilise les nombres du module 1 (50 … 200, 0,8, 6, 1,4).
 */
const PREP = (n) => src('prep', 65, 'أستعدّ', n);
const PREP_ADD = addition('prerequisite_diagnostic');
export const PREP_ITEMS = [
  { n: 1, skill: 'taawid', text: 'إذا كان $x = 3$ فإنّ $-3x - 1 = 10$ .', answer: false, why: '$-3 \\times 3 - 1 = -10 \\neq 10$', source: PREP(1) },
  { n: 2, skill: 'hal', text: 'إذا كان $x - 5 = -20$ فإنّ $x = -15$ .', answer: true, why: '$x = -20 + 5 = -15$', source: PREP(2) },
  { n: 3, skill: 'hal', text: 'إذا كان $-5x = 20$ فإنّ $x = 25$ .', answer: false, why: 'نقسم على $-5$ : $x = \\dfrac{20}{-5} = -4$', source: PREP(3) },
  { n: 4, skill: 'tanasub', text: 'في جدول تناسبية، السطر الأول: $4$ ، $6$ والسطر الثاني: $10$ ، $15$ . معامل التناسبية هو $2{,}5$ .', answer: true, why: '$\\dfrac{10}{4} = \\dfrac{15}{6} = 2{,}5$', source: PREP_ADD },
  { n: 5, skill: 'tanasub', text: 'في جدول تناسبية معامله $1{,}5$ نكتب $y = 1{,}5 \\times x$ . من أجل $x = 4$ يكون $y = 5{,}5$ .', answer: false, why: '$y = 1{,}5 \\times 4 = 6$ ؛ أما $5{,}5$ فهو $4 + 1{,}5$ : جمعنا بدل أن نضرب.', source: PREP_ADD },
];
