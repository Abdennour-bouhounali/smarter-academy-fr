/**
 * Le contenu du MANUEL pour le درس 3 de l'unité 2 — « حل المعادلة من الشكل x² = a ».
 * Données pures, au mot près ; chaque bloc cite son élément de
 * docs/sources/4am/unit2/extraction.json (نشاط 3 p. 20, معارف 3 p. 22,
 * طرائق p. 23, أستعدّ p. 19 item 3). Les modules rendent ces données ; ils
 * n'en réécrivent aucune. Seule adaptation d'écriture : la virgule décimale
 * dans une formule KaTeX s'écrit `0{,}04` (sinon KaTeX l'espace comme une
 * virgule de liste).
 */
import { src, addition } from '../../_unit/unitMeta.js';

export const ACTIVITY = {
  source: src('act-3', 20, 'أنشطة', 3),
  title: 'المعادلات من الشكل $x^2 = a$',
  // Le débat de مراد et عمر (question 2 أ) : l'accroche de la leçon.
  situation: 'لحل المعادلة $x^2 = 9$، قال مراد: «إنّ حل المعادلة $x^2 = 9$ هو 3، لأنّ $3^2 = 9$». وقال عمر: «لقد نسي مراد حلا آخر». هل توافقه؟ اشرح.',
  questions: [
    '1) أ) أنقل وأتمم الجدول الآتي: $x$ : $-\\dfrac{3}{2}$ ، $-1$ ، $0$ ، $1$ ، $\\dfrac{3}{2}$ ، $2$ ؛ $x^2$ : … .',
    'ب) ضع تخمينا حول مربعي عددين متعاكسين.',
    'جـ) أثبت صحة التخمين الذي وضعته من أجل كل عددين $b$ و $-b$.',
    '2) أ) لحل المعادلة $x^2 = 9$، قال مراد: «إنّ حل المعادلة $x^2 = 9$ هو 3، لأنّ $3^2 = 9$». وقال عمر: «لقد نسي مراد حلا آخر». هل توافقه؟ اشرح.',
    'ب) حل، إن أمكن، كلا من المعادلات الآتية: $x^2 = 25$ ، $x^2 = 3$ ، $x^2 = 0$ ، $x^2 = 0{,}04$ ، $x^2 = -9$ .',
    '3) أكتب معادلة من الشكل $x^2 = a$ في كل حالة مما يلي: أ) حلاّها هما: 7 و $-7$. ب) حلاّها هما: $\\dfrac{2}{3}$ و $-\\dfrac{2}{3}$. جـ) حلاّها هما: 0,5 و $-0{,}5$. ماذا تستنتج؟',
  ],
  // Les nombres du manuel, lus par les modules et la carte (jamais retapés).
  numbers: {
    table: [-1.5, -1, 0, 1, 1.5, 2],
    murad: 9,
    equations: [25, 3, 0, 0.04, -9],
  },
};

export const KNOWLEDGE = {
  source: src('know-3', 22, 'معارف', 3),
  title: 'المعادلات من الشكل $x^2 = a$',
  prop1: {
    title: 'خاصية 1',
    text: '$a$ عدد موجب. يوجد عددان متعاكسان هما $\\sqrt{a}$ و $-\\sqrt{a}$ مربع كل منهما يساوي $a$.',
    note: 'مربع أي عدد هو دائما عدد موجب.',
    aside: [
      '$\\sqrt{a} \\times \\sqrt{a} = (\\sqrt{a})^2 = a$',
      '$(-\\sqrt{a}) \\times (-\\sqrt{a}) = (-\\sqrt{a})^2 = a$',
      'العدد $-\\sqrt{a}$ هو معاكس العدد الموجب $\\sqrt{a}$',
    ],
    examples: [
      '$5^2 = 5 \\times 5 = 25$',
      '$\\left(-\\dfrac{2}{3}\\right)^2 = \\left(-\\dfrac{2}{3}\\right) \\times \\left(-\\dfrac{2}{3}\\right) = \\dfrac{4}{9}$',
    ],
  },
  prop2: {
    title: 'خاصية 2',
    text: '$a$ عدد كيفي.',
    cases: [
      'إذا كان $a > 0$ فإنّ المعادلة $x^2 = a$ تقبل حلين متعاكسين هما $\\sqrt{a}$ و $-\\sqrt{a}$.',
      'إذا كان $a = 0$ فإنّ المعادلة $x^2 = a$ تقبل حلا واحدا وهو العدد 0.',
      'إذا كان $a < 0$ فإنّ المعادلة $x^2 = a$ لا تقبل أي حل.',
    ],
    examples: [
      'المعادلة $x^2 = 9$ تقبل حلين هما $-3$ و 3.',
      'المعادلة $x^2 = 5$ تقبل حلين هما $\\sqrt{5}$ و $-\\sqrt{5}$.',
      'المعادلة $x^2 = -1$ لا تقبل أي حل.',
    ],
    // Les équations des exemples, pour l'exemple travaillé du module 2.
    targets: [9, 5, -1],
  },
};

/** طرائق (p. 23) : « حل معادلة من الشكل x² = a حيث a عدد معطى » — pour MethodSteps. */
export const METHOD = {
  source: src('method-equation', 23, 'طرائق'),
  title: 'حل معادلة من الشكل $x^2 = a$ حيث $a$ عدد معطى',
  exercise: 'حل كل معادلة من المعادلات الآتية: أ) $x^2 = 5$ . ب) $x^2 = \\dfrac{1}{4}$ . جـ) $x^2 = -9$ .',
  solution: [
    'أ) حل المعادلة $x^2 = 5$ : $x^2 = 5$ يعني $x^2 = (\\sqrt{5})^2$ بالتالي $x = \\sqrt{5}$ أو $x = -\\sqrt{5}$ .',
    'ب) حل المعادلة $x^2 = \\dfrac{1}{4}$ : $x^2 = \\dfrac{1}{4}$ يعني $x^2 = \\left(\\dfrac{1}{2}\\right)^2$ بالتالي $x = \\dfrac{1}{2}$ أو $x = -\\dfrac{1}{2}$ .',
    'جـ) حل المعادلة $x^2 = -9$ : من أجل كل عدد $x$، $x^2 \\geq 0$ و $-9 < 0$ بالتالي لا يوجد أي عدد $x$ يحقق $x^2 = -9$ . إذن المعادلة $x^2 = -9$ لا تقبل أي حل.',
  ],
  rule: 'لحل معادلة من الشكل $x^2 = a$ حيث $a$ عدد معطى، نحدد إشارة العدد $a$. إذا كان $a > 0$، نكتب المعادلة $x^2 = a$ على الشكل $x^2 = (\\sqrt{a})^2$ ثم نعيّن حلّي المعادلة $x^2 = a$.',
};

/**
 * « أستعدّ » — l'item 3 du manuel (p. 19), le seul que l'extraction attribue
 * à cette leçon, puis des affirmations de la PLATEFORME dans la même forme
 * (« أصحيح أم خاطئ؟ برّر إجابتك »), déclarées comme telles. Elles mesurent
 * les trois `priorKnowledge` : carré d'un nombre (et son opposé), racine
 * carrée (leçon 1), équations du premier degré. Aucune n'utilise les nombres
 * de l'activité 3 (9, 25, 3, 0,04, 49…).
 */
const PLATFORM = addition('prerequisite_diagnostic');
export const PREP_ITEMS = [
  { n: 3, skill: 'murabba', text: 'العدد 36 هو مربع العدد الوحيد 6.', answer: false, why: '$6^2 = 36$ و $(-6)^2 = 36$', source: src('prep', 19, 'أستعدّ', 3) },
  { skill: 'murabba', text: 'مربع العدد $-8$ هو 64.', answer: true, why: '$(-8)^2 = (-8) \\times (-8) = 64$', source: PLATFORM },
  { skill: 'murabba', text: 'معاكس العدد $-\\dfrac{4}{5}$ هو $\\dfrac{5}{4}$.', answer: false, why: 'معاكس العدد $-\\dfrac{4}{5}$ هو $\\dfrac{4}{5}$، لأنّ $-\\dfrac{4}{5} + \\dfrac{4}{5} = 0$. أما $\\dfrac{5}{4}$ فهو مقلوب $\\dfrac{4}{5}$.', source: PLATFORM },
  { skill: 'jidhr', text: '$\\sqrt{121} = 11$ لأنّ 11 عدد موجب و $11^2 = 121$.', answer: true, why: 'الجذر التربيعي للعدد 121 هو العدد الموجب الذي مربعه 121، وهو 11.', source: PLATFORM },
  { skill: 'muadala', text: 'حل المعادلة $4x + 8 = 0$ هو $x = 2$.', answer: false, why: '$4x + 8 = 0$ يعني $4x = -8$ أي $x = -2$. نتحقق: $4 \\times (-2) + 8 = 0$.', source: PLATFORM },
  { skill: 'muadala', text: 'المعادلة $5x - 1 = 3x + 7$ تؤول إلى $2x = 8$، ومنه حلها هو $x = 4$.', answer: true, why: '$5x - 3x = 7 + 1$ أي $2x = 8$، إذن $x = 4$.', source: PLATFORM },
];
