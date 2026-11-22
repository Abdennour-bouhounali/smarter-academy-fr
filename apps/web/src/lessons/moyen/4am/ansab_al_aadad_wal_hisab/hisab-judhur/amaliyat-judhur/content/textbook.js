/**
 * Le contenu du MANUEL pour le درس 4 de l'unité 2 — « العمليات على الجذور
 * التربيعية » (نشاط 4 p. 21, معارف 4 p. 24, « أستعدّ » p. 19 items 5–6).
 * Données pures, au mot près ; chaque bloc cite son élément de
 * docs/sources/4am/unit2/extraction.json. Les modules rendent ces données,
 * ils n'en réécrivent aucune.
 *
 * Les RÉSULTATS des tableaux (`answer`) ne sont pas imprimés dans le manuel :
 * ils sont calculés (extraction.json → `answer`) et ne s'affichent qu'après
 * la réponse de l'élève.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** نشاط 4 — جداء جذرين تربيعيين (p. 21). */
export const ACTIVITY = {
  source: src('act-4a', 21, 'أنشطة', 4),
  title: 'العمليات على الجذور التربيعية',
  subtitle: 'جداء جذرين تربيعيين',
  text: 'انقل وأكمل الجدول الآتي.',
  columns: ['$a$', '$b$', '$\\sqrt{a}$', '$\\sqrt{b}$', '$\\sqrt{a} \\times \\sqrt{b}$', '$a \\times b$', '$\\sqrt{a \\times b}$'],
  // Les lignes du manuel, puis les cellules calculées (√a, √b, √a × √b, a × b, √(a × b)).
  rows: [
    { a: '4', b: '36', answer: ['2', '6', '12', '144', '12'] },
    { a: '9', b: '25', answer: ['3', '5', '15', '225', '15'] },
    { a: '0{,}16', b: '49', answer: ['0{,}4', '7', '2{,}8', '7{,}84', '2{,}8'] },
  ],
  questions: [
    '1) انقل وأكمل الجدول الآتي.',
    '2) ضع تخمينا حول العلاقة بين $\\sqrt{a} \\times \\sqrt{b}$ و $\\sqrt{a \\times b}$.',
    '3) لإثبات صحة التخمين الذي وجدناه في السؤال (2) من أجل كل عددين موجبين $a$ و $b$:',
    'أ) برّر أنّ كلا من العددين $\\sqrt{a} \\times \\sqrt{b}$ و $\\sqrt{a \\times b}$ موجب.',
    'ب) انقل وأتمم ما يلي: $(\\sqrt{a \\times b})^2 = \\ldots$ و $(\\sqrt{a} \\times \\sqrt{b})^2 = (\\ldots)^2 \\times (\\ldots)^2 = \\ldots \\times \\ldots$ .',
    'جـ) استنتج العلاقة بين $\\sqrt{a} \\times \\sqrt{b}$ و $\\sqrt{a \\times b}$.',
  ],
  // Le premier rang du tableau, 4 × 36 = 144, est le carré du laboratoire (niveau متقدم).
  numbers: { n: 144, a: 4, b: 36 },
  closing: 'من أجل كل عددين موجبين $a$ و $b$ . $\\sqrt{a} \\times \\sqrt{b} = \\sqrt{a \\times b}$ .',
};

/** نشاط 4 — حاصل قسمة جذرين تربيعيين (p. 21). */
export const ACTIVITY_B = {
  source: src('act-4b', 21, 'أنشطة', 4),
  subtitle: 'حاصل قسمة جذرين تربيعيين',
  text: 'انقل وأكمل الجدول الآتي.',
  columns: ['$a$', '$b$', '$\\sqrt{a}$', '$\\sqrt{b}$', '$\\dfrac{\\sqrt{a}}{\\sqrt{b}}$', '$\\dfrac{a}{b}$', '$\\sqrt{\\dfrac{a}{b}}$'],
  // « لا معنى له » : la racine d'un nombre négatif n'existe pas.
  rows: [
    { a: '36', b: '4', answer: ['6', '2', '3', '9', '3'] },
    { a: '25', b: '100', answer: ['5', '10', '0{,}5', '0{,}25', '0{,}5'] },
    { a: '0{,}09', b: '0{,}81', answer: ['0{,}3', '0{,}9', '\\dfrac{1}{3}', '\\dfrac{1}{9}', '\\dfrac{1}{3}'] },
    { a: '-25', b: '-100', answer: [null, null, null, '0{,}25', '0{,}5'] },
  ],
  noMeaning: 'لا معنى له',
  questions: [
    '1) انقل وأكمل الجدول الآتي.',
    '2) ضع تخمينا حول العلاقة بين $\\dfrac{\\sqrt{a}}{\\sqrt{b}}$ و $\\sqrt{\\dfrac{a}{b}}$.',
    '3) لإثبات صحة التخمين الذي وجدناه في السؤال (2) من أجل كل عددين موجبين $a$ و $b$ و $b \\neq 0$:',
    'أ) برّر أنّ كلا من العددين $\\dfrac{\\sqrt{a}}{\\sqrt{b}}$ و $\\sqrt{\\dfrac{a}{b}}$ موجب.',
    'ب) انقل وأتمم ما يلي: $\\left(\\sqrt{\\dfrac{a}{b}}\\right)^2 = \\ldots$ و $\\left(\\dfrac{\\sqrt{a}}{\\sqrt{b}}\\right)^2 = \\dfrac{(\\ldots)^2}{(\\ldots)^2} = \\ldots$ .',
    'جـ) استنتج العلاقة بين $\\dfrac{\\sqrt{a}}{\\sqrt{b}}$ و $\\sqrt{\\dfrac{a}{b}}$.',
  ],
};

/** نشاط 4 — مجموع جذرين تربيعيين وفرقهما (p. 21). */
export const ACTIVITY_C = {
  source: src('act-4c', 21, 'أنشطة', 4),
  subtitle: 'مجموع جذرين تربيعيين وفرقهما',
  questions: [
    'أ) احسب كلا من العددين $\\sqrt{16 + 9}$ و $\\sqrt{16} + \\sqrt{9}$ . ماذا تستنتج ؟',
    'احسب كلا من العددين $\\sqrt{100 - 36}$ و $\\sqrt{100} - \\sqrt{36}$ . ماذا تستنتج؟',
    'ب) $a$ و $b$ عددان موجبان حيث $a \\geq b$ هل يمكن أن يكون $\\sqrt{a + b} = \\sqrt{a} + \\sqrt{b}$ علّل إجابتك. نفس السؤال بالنسبة إلى العددين $\\sqrt{a - b}$ و $\\sqrt{a} - \\sqrt{b}$ ؟',
  ],
  // Les nombres du manuel : 16 + 9 et 100 − 36.
  sum: { a: 16, b: 9 },
  difference: { a: 100, b: 36 },
};

/** معارف 4 (p. 24) — les deux propriétés et la remarque 3, au mot près. */
export const KNOWLEDGE = {
  source: src('know-4', 24, 'معارف', 4),
  title: 'العمليات على الجذور التربيعية',
  product: {
    title: 'خاصية 1',
    text: 'من أجل كل عددين موجبين $a$ و $b$ . $\\sqrt{a} \\times \\sqrt{b} = \\sqrt{a \\times b}$ .',
    remarks: [
      'تسمح الخاصية 1 بالانتقال من الكتابة $\\sqrt{a \\times b}$ إلى الكتابة $\\sqrt{a} \\times \\sqrt{b}$ والعكس.',
      'من أجل كل عددين موجبين $a$ و $b$ : $\\sqrt{a^2 b} = \\sqrt{a^2} \\times \\sqrt{b} = a\\sqrt{b}$',
      'في حالة $a$ و $b$ عددين سالبين فإنّ $\\sqrt{a \\times b}$ موجود مع أنّ كلا من $\\sqrt{a}$ و $\\sqrt{b}$ لا معنى له.',
    ],
    examples: [
      '$\\sqrt{12} \\times \\sqrt{3} = \\sqrt{12 \\times 3} = \\sqrt{36} = 6$ .',
      '$\\sqrt{28} = \\sqrt{4 \\times 7} = \\sqrt{4} \\times \\sqrt{7} = 2\\sqrt{7}$ .',
      '$\\sqrt{0{,}9} \\times \\sqrt{0{,}4} = \\sqrt{0{,}9 \\times 0{,}4} = \\sqrt{0{,}36} = 0{,}6$ .',
      'لدينا $63 = 9 \\times 7 = 3^2 \\times 7$ إذن $\\sqrt{63} = \\sqrt{9 \\times 7} = \\sqrt{3^2 \\times 7} = 3\\sqrt{7}$ .',
      'لدينا $\\sqrt{(-9) \\times (-4)} = \\sqrt{36} = 6$',
    ],
  },
  quotient: {
    title: 'خاصية 2',
    text: 'من أجل كل عددين موجبين $a$ و $b$ حيث $b \\neq 0$. $\\dfrac{\\sqrt{a}}{\\sqrt{b}} = \\sqrt{\\dfrac{a}{b}}$ .',
    remark: 'في حالة $a$ و $b$ عددين سالبين فإنّ $\\sqrt{\\dfrac{a}{b}}$ موجود مع أنّ كلا من $\\sqrt{a}$ و $\\sqrt{b}$ لا معنى له.',
    examples: [
      '$\\dfrac{\\sqrt{60}}{\\sqrt{15}} = \\sqrt{\\dfrac{60}{15}} = \\sqrt{4} = 2$ .',
      '$\\sqrt{\\dfrac{25}{9}} = \\dfrac{\\sqrt{25}}{\\sqrt{9}} = \\dfrac{5}{3}$ .',
      '$\\sqrt{\\dfrac{7}{36}} = \\dfrac{\\sqrt{7}}{\\sqrt{36}} = \\dfrac{\\sqrt{7}}{6}$ .',
      'لدينا $\\sqrt{\\dfrac{-36}{-4}} = \\sqrt{9} = 3$',
    ],
  },
  sum: {
    title: 'ملاحظة 3',
    text: 'المساواة غير محقّقة في كل من الجمع والطرح على الجذور التربيعية، أي: $a$ و $b$ عددان موجبان تماما. $\\sqrt{a + b} \\neq \\sqrt{a} + \\sqrt{b}$ . $\\sqrt{a - b} \\neq \\sqrt{a} - \\sqrt{b}$ حيث $(a > b)$.',
    examples: [
      '$\\sqrt{16 + 9} \\neq \\sqrt{16} + \\sqrt{9}$ لأنّ $\\sqrt{16 + 9} = \\sqrt{25} = 5$ و $\\sqrt{16} + \\sqrt{9} = 4 + 3 = 7$',
      '$\\sqrt{100 - 36} \\neq \\sqrt{100} - \\sqrt{36}$ لأنّ $\\sqrt{100 - 36} = \\sqrt{64} = 8$ و $\\sqrt{100} - \\sqrt{36} = 10 - 6 = 4$',
    ],
  },
};

/**
 * « أستعدّ » — les items 5 et 6 du manuel (p. 19, destinés à cette leçon),
 * puis quatre affirmations de la plateforme, dans la MÊME forme, pour
 * diagnostiquer les deux acquis de la leçon 1 (définition de √a et
 * (√a)² = a). Aucune n'utilise les nombres de l'activité 4.
 */
export const PREP_ITEMS = [
  { n: 5, skill: 'quwa', text: '$a$ و $b$ عددان. العدد $(ab)^2$ يساوي $a^2 \\times b^2$.', answer: true, why: '$(ab)^2 = ab \\times ab = a^2 \\times b^2$', source: src('prep', 19, 'أستعدّ', 5) },
  { n: 6, skill: 'quwa', text: '$a$ و $b$ عددان حيث $b \\neq 0$. العدد $\\left(\\dfrac{a}{b}\\right)^2$ يساوي $\\dfrac{a^2}{b}$.', answer: false, why: '$\\left(\\dfrac{a}{b}\\right)^2 = \\dfrac{a^2}{b^2}$', source: src('prep', 19, 'أستعدّ', 6) },
  { skill: 'jidhr', text: '$\\sqrt{81} = 9$ لأن 9 عدد موجب مربعه 81.', answer: true, why: '$9^2 = 81$ و 9 عدد موجب.', source: addition('prerequisite_diagnostic') },
  { skill: 'jidhr', text: '$\\sqrt{121} = -11$.', answer: false, why: 'الجذر التربيعي لعدد موجب هو عدد موجب: $\\sqrt{121} = 11$ لأن $11^2 = 121$.', source: addition('prerequisite_diagnostic') },
  { skill: 'murabba', text: 'العدد $(\\sqrt{7})^2$ يساوي 7.', answer: true, why: 'من أجل كل عدد موجب $a$ : $(\\sqrt{a})^2 = a$.', source: addition('prerequisite_diagnostic') },
  { skill: 'murabba', text: 'العدد $(\\sqrt{11})^2$ يساوي 121.', answer: false, why: '$(\\sqrt{11})^2 = 11$ ، أما 121 فهو $11^2$.', source: addition('prerequisite_diagnostic') },
];

/**
 * Le niveau مبتدئ du laboratoire : un carré d'aire 36 — une expérience de la
 * plateforme (petits nombres), déclarée comme telle. La mathématique est
 * celle de l'activité 4 : √(4 × 9) = √4 × √9.
 */
export const TILING_BEGINNER = {
  source: addition('interaction_generation'),
  n: 36,
};
