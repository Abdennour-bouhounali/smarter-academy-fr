/**
 * Le contenu du MANUEL pour le درس 5 « توظيف خواص الجذور التربيعية » —
 * données pures (aucun JSX), au mot près ; chaque bloc cite son élément de
 * docs/sources/4am/unit2/extraction.json. Les modules rendent ces données ;
 * ils n'en réécrivent aucune.
 *
 * La leçon n'a PAS d'activité (نشاط) dans le manuel : elle est une page de
 * طرائق (p. 25). Son « ACTIVITY » (lu par la مذكرة du professeur) est donc le
 * تمرين 1 de ces طرائق, celui que le module 1 ouvre par le carré dallé.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** طرائق p. 25 — تمرين 1 : l'entrée de la leçon (module 1), résolu au module 2. */
export const ACTIVITY = {
  source: src('method-simplify', 25, 'طرائق'),
  title: 'توظيف خواص الجذور التربيعية',
  text: '1) أُكتب كلا من الأعداد $\\sqrt{8}$ ، $\\sqrt{18}$ و $\\sqrt{50}$ على الشكل $a\\sqrt{b}$ حيث $a$ و $b$ عددان طبيعيان و $b$ أصغر ما يمكن. 2) استنتج عبارة مبسطة للعدد A حيث $A = \\sqrt{8} - 3\\sqrt{18} + 2\\sqrt{50} - 7\\sqrt{2}$ .',
  questions: [
    '1) أُكتب كلا من الأعداد $\\sqrt{8}$ ، $\\sqrt{18}$ و $\\sqrt{50}$ على الشكل $a\\sqrt{b}$ حيث $a$ و $b$ عددان طبيعيان و $b$ أصغر ما يمكن.',
    '2) استنتج عبارة مبسطة للعدد A حيث $A = \\sqrt{8} - 3\\sqrt{18} + 2\\sqrt{50} - 7\\sqrt{2}$ .',
  ],
  // Les trois nombres du تمرين 1, et ce qu'on en tire (calculé dans les modules).
  numbers: { roots: [8, 18, 50], coefficients: [1, -3, 2, -7] },
};

/**
 * LE CARRÉ DALLÉ — une expérience de la PLATEFORME (le manuel n'a pas
 * d'activité pour cette leçon). La mathématique est la طريقة p. 25 ; les deux
 * aires sont celles de l'exercice 18 (√32 et √288). Déclarée, jamais cachée.
 */
export const TILING = {
  source: addition('interaction_generation'),
  numbers: { beginner: 32, advanced: 288 },
  // Ce que le carré de 288 montre quand k = 12 : la dalle 2 ne se pave plus.
  example: 'مربّع مساحته 32، على كل ضلع منه 4 بلاطات مساحة كل منها 2: $\\sqrt{32} = \\sqrt{4^2 \\times 2} = 4\\sqrt{2}$',
};

/** طرائق p. 25 — la solution du تمرين 1, ligne à ligne (MethodSteps). */
export const METHOD_SIMPLIFY = {
  source: src('method-simplify', 25, 'طرائق'),
  title: 'توظيف خواص الجذور التربيعية',
  exercise: ACTIVITY.text,
  solution: [
    '1) لدينا $\\sqrt{8} = \\sqrt{4 \\times 2} = \\sqrt{2^2 \\times 2} = 2\\sqrt{2}$ ، $\\sqrt{18} = \\sqrt{9 \\times 2} = \\sqrt{3^2 \\times 2} = 3\\sqrt{2}$ و $\\sqrt{50} = \\sqrt{25 \\times 2} = \\sqrt{5^2 \\times 2} = 5\\sqrt{2}$ .',
    '2) تبسيط A: نستنتج من 1) أنّ $A = 2\\sqrt{2} - 3(3\\sqrt{2}) + 2(5\\sqrt{2}) - 7\\sqrt{2}$ أي $A = 2\\sqrt{2} - 9\\sqrt{2} + 10\\sqrt{2} - 7\\sqrt{2}$ ثم نطبق الخاصية التوزيعية ونجد: $A = (2 - 9 + 10 - 7)\\sqrt{2}$ أي $A = -4 \\times \\sqrt{2}$ أي $A = -4\\sqrt{2}$ .',
  ],
};

/** طرائق p. 25 — les deux paragraphes « طريقة » : les deux premières connaissances. */
export const KNOWLEDGE = {
  source: src('method-simplify', 25, 'طرائق'),
  simplest: 'لكتابة الجذر التربيعي لعدد طبيعي n على الشكل $a\\sqrt{b}$، حيث $a$ و $b$ عددان طبيعيان و $b$ أصغر ما يمكن. نبحث عن أكبر مربع $a^2$ يقسم $n$، $n = a^2 \\times b$.',
  distributive: 'لتبسيط العبارة $x\\sqrt{b} + y\\sqrt{b} + z\\sqrt{b}$ نطبق الخاصية التوزيعية: $x\\sqrt{b} + y\\sqrt{b} + z\\sqrt{b} = (x + y + z)\\sqrt{b}$ .',
};

/** طرائق p. 25 — تمرين 2. */
export const METHOD_PRODUCT = {
  source: src('method-product', 25, 'طرائق'),
  exercise: 'احسب $A = \\sqrt{\\dfrac{50}{3}} \\times \\sqrt{2} \\times \\sqrt{12}$',
  solution: [
    'لدينا $A = \\dfrac{\\sqrt{50}}{\\sqrt{3}} \\times \\sqrt{2} \\times \\sqrt{12} = \\dfrac{\\sqrt{50} \\times \\sqrt{2} \\times \\sqrt{12}}{\\sqrt{3}}$',
    'وبما أنّ $\\sqrt{50} \\times \\sqrt{2} = \\sqrt{50 \\times 2} = \\sqrt{100} = 10$ و $\\sqrt{12} = \\sqrt{4 \\times 3} = 2\\sqrt{3}$ فإنّ $A = \\dfrac{10 \\times 2 \\times \\sqrt{3}}{\\sqrt{3}} = 20$',
  ],
};

/**
 * طرائق p. 25 — « نسبة مقامها عدد غير ناطق ». Le manuel écrit sa solution en
 * UNE ligne pour les deux nombres ; elle est présentée en deux lignes (une par
 * nombre, coupée au « و »), sans changer un mot.
 */
export const METHOD_RATIONALIZE = {
  source: src('method-rationalize', 25, 'طرائق'),
  title: 'نسبة مقامها عدد غير ناطق',
  exercise: 'اكتب على شكل نسبة مقامها عدد ناطق كلا من $\\dfrac{2}{\\sqrt{11}}$ و $\\dfrac{\\sqrt{7}}{2\\sqrt{5}}$ .',
  solution: [
    'لدينا $\\dfrac{2}{\\sqrt{11}} = \\dfrac{2 \\times \\sqrt{11}}{\\sqrt{11} \\times \\sqrt{11}} = \\dfrac{2\\sqrt{11}}{11}$',
    'و $\\dfrac{\\sqrt{7}}{2\\sqrt{5}} = \\dfrac{\\sqrt{7} \\times \\sqrt{5}}{2\\sqrt{5} \\times \\sqrt{5}} = \\dfrac{\\sqrt{35}}{2 \\times 5} = \\dfrac{\\sqrt{35}}{10}$ .',
  ],
  method: 'لتحويل نسبة $\\dfrac{a}{\\sqrt{b}}$ مقامها عدد غير ناطق إلى نسبة تساويها مقامها عدد ناطق، نضرب كلا من البسط والمقام في نفس العدد $\\sqrt{b}$.',
};

/**
 * دوري الآن p. 30 — la version CORRIGÉE décidée par le propriétaire
 * (extraction.json → now-30.correction) : l'énoncé imprimé (2a − 4 et
 * √(4a − 1)) n'avait pas de sens pour 2 ≤ a < 2 + √3. Corrigé, c'est un
 * exercice complet : les deux nombres sont ÉGAUX pour tout a ≥ 2. L'élève
 * essaie d'abord a = 2, 5, 10 (le rôle du tableur), puis choisit la
 * comparaison ET sa justification.
 */
export const NOW_30 = {
  source: src('now-30', 30, 'دوري الآن'),
  text: 'استعمل المجدول إكسال أو المجدول جيوجبرا لتقارن بين العددين: $2\\sqrt{a - 1}$ و $\\sqrt{a + \\sqrt{4a - 4}} + \\sqrt{a - \\sqrt{4a - 4}}$ إذا علمت أنّ $a \\geq 2$ .',
  correctionNote: 'صيغ هذا التمرين بحيث يكون للعددين معنى من أجل كل عدد a أكبر من 2 أو يساويه.',
  // Ce que le tableur affiche : une ligne par valeur de a (calculs exacts).
  trials: [
    { a: 2, label: 'من أجل $a = 2$ : $\\sqrt{2 + \\sqrt{4}} + \\sqrt{2 - \\sqrt{4}} = $', options: ['$2$', '$\\sqrt{4}+\\sqrt{2}$', '$4$'], correct: 0, correction: '$\\sqrt{4} + \\sqrt{0} = 2 + 0 = 2$ ، و $2\\sqrt{2 - 1} = 2$' },
    { a: 5, label: 'من أجل $a = 5$ : $\\sqrt{5 + \\sqrt{16}} + \\sqrt{5 - \\sqrt{16}} = $', options: ['$\\sqrt{10}$', '$4$', '$2\\sqrt{5}$'], correct: 1, correction: '$\\sqrt{9} + \\sqrt{1} = 3 + 1 = 4$ ، و $2\\sqrt{5 - 1} = 2 \\times 2 = 4$' },
    { a: 10, label: 'من أجل $a = 10$ : $\\sqrt{10 + \\sqrt{36}} + \\sqrt{10 - \\sqrt{36}} = $', options: ['$2\\sqrt{5}$', '$4$', '$6$'], correct: 2, correction: '$\\sqrt{16} + \\sqrt{4} = 4 + 2 = 6$ ، و $2\\sqrt{10 - 1} = 2 \\times 3 = 6$' },
  ],
  comparison: {
    prompt: 'قارن بين العددين من أجل كل عدد $a \\geq 2$ ، مع التعليل:',
    options: [
      'العددان متساويان من أجل $a = 2$ و $a = 5$ و $a = 10$ فقط، و $2\\sqrt{a - 1}$ أصغر من أجل القيم الأخرى',
      'العددان متساويان لأنّ $\\sqrt{a + \\sqrt{4a - 4}} + \\sqrt{a - \\sqrt{4a - 4}} = \\sqrt{2a}$',
      'العددان متساويان لأنّ $a + \\sqrt{4a - 4} = (\\sqrt{a - 1} + 1)^2$ و $a - \\sqrt{4a - 4} = (\\sqrt{a - 1} - 1)^2$ مع $\\sqrt{a - 1} - 1 \\geq 0$',
    ],
    correct: 2,
  },
  // La réponse de la correction (extraction.json → now-30.correction.answer).
  answer: 'العددان متساويان: $(\\sqrt{a - 1} + 1)^2 = a + 2\\sqrt{a - 1} = a + \\sqrt{4a - 4}$ و $(\\sqrt{a - 1} - 1)^2 = a - \\sqrt{4a - 4}$ مع $\\sqrt{a - 1} - 1 \\geq 0$ لما $a \\geq 2$، إذن المجموع يساوي $(\\sqrt{a - 1} + 1) + (\\sqrt{a - 1} - 1) = 2\\sqrt{a - 1}$.',
};

/** Exercice 27 : l'énoncé affiché est la version corrigée (extraction.json → ex-27.correction). */
export const EX27_NOTE = {
  source: addition('interaction_generation'),
  text: 'انتبه: في هذا التمرين $a$ عدد صحيح و $b$ عدد طبيعي.',
};

/**
 * « أستعدّ » — items 7, 8, 9 du manuel (p. 19 : المتطابقات الشهيرة), puis des
 * affirmations de la PLATEFORME, dans la même forme (« أصحيح أم خاطئ؟ برّر
 * إجابتك »), pour les autres acquis que la leçon suppose (leçons 1 et 4 de
 * l'unité, la خاصية التوزيعية). Aucune n'utilise les nombres du module 1
 * (8, 18, 32, 50, 288).
 */
export const PREP_ITEMS = [
  { n: 7, skill: 'huwiyat', text: '$a$ و $b$ عددان. العدد $(a + b)(a + b)$ يُنشر على الشكل $a^2 + b^2$.', answer: false, why: '$(a + b)(a + b) = a^2 + 2ab + b^2$', source: src('prep', 19, 'أستعدّ', 7) },
  { n: 8, skill: 'huwiyat', text: '$a$ و $b$ عددان. العدد $(a - b)(a - b)$ ينشر على الشكل $a^2 - 2ab + b^2$.', answer: true, why: '$(a - b)(a - b) = a^2 - ab - ab + b^2 = a^2 - 2ab + b^2$', source: src('prep', 19, 'أستعدّ', 8) },
  { n: 9, skill: 'huwiyat', text: '$a$ و $b$ عددان. العدد $(a + b)(a - b)$ ينشر على الشكل $a^2 - b^2$.', answer: true, why: '$(a + b)(a - b) = a^2 - ab + ab - b^2 = a^2 - b^2$', source: src('prep', 19, 'أستعدّ', 9) },
  { skill: 'huwiyat', text: '$a$ عدد. العبارة $4a + 3a - a$ تُبسَّط على الشكل $7a$.', answer: false, why: 'بالخاصية التوزيعية: $4a + 3a - a = (4 + 3 - 1)a = 6a$', source: addition('prerequisite_diagnostic') },
  { skill: 'jidaa', text: '$\\sqrt{5} \\times \\sqrt{20} = 10$.', answer: true, why: '$\\sqrt{5} \\times \\sqrt{20} = \\sqrt{5 \\times 20} = \\sqrt{100} = 10$', source: addition('prerequisite_diagnostic') },
  { skill: 'jidaa', text: '$\\sqrt{2} \\times \\sqrt{3} = \\sqrt{5}$.', answer: false, why: '$\\sqrt{2} \\times \\sqrt{3} = \\sqrt{2 \\times 3} = \\sqrt{6}$', source: addition('prerequisite_diagnostic') },
  { skill: 'jidaa', text: '$\\dfrac{\\sqrt{45}}{\\sqrt{5}} = 3$.', answer: true, why: '$\\dfrac{\\sqrt{45}}{\\sqrt{5}} = \\sqrt{\\dfrac{45}{5}} = \\sqrt{9} = 3$', source: addition('prerequisite_diagnostic') },
  { skill: 'jidhr', text: '$\\sqrt{4 \\times 7} = 4\\sqrt{7}$.', answer: false, why: 'من أجل كل عددين موجبين $a$ و $b$ : $\\sqrt{a^2 b} = \\sqrt{a^2} \\times \\sqrt{b} = a\\sqrt{b}$ ، إذن $\\sqrt{4 \\times 7} = \\sqrt{2^2 \\times 7} = 2\\sqrt{7}$', source: addition('prerequisite_diagnostic') },
  { skill: 'jidhr', text: 'العدد $\\sqrt{-9}$ يساوي $-3$.', answer: false, why: 'الجذر التربيعي معرّف لعدد موجب فقط: $\\sqrt{-9}$ لا معنى له، لأن مربع أي عدد هو عدد موجب.', source: addition('prerequisite_diagnostic') },
];
