/**
 * Le contenu du MANUEL pour le درس 3 « تحليل عبارة جبرية » — données pures
 * (aucun JSX), au mot près ; chaque bloc cite son élément de
 * docs/sources/4am/unit3/extraction.json. Les modules rendent ces données ;
 * ils n'en réécrivent aucune.
 *
 * Trois éléments portent une `correction` (politique du propriétaire,
 * 2026-10-01) : la propriété de معارف 3 (ka − kb = k(a − b)), l'énoncé du
 * تمرين 1 p. 36 (C = (4x − 1)² − (x − 4)²) et la solution du تمرين 2 p. 36
 * (−4x). La leçon affiche la version CORRIGÉE et une seule ligne discrète.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** نشاط 3 (p. 33) — « تحليل عبارة جبرية ». */
export const ACTIVITY = {
  source: src('act-3', 33, 'أنشطة', 3),
  title: 'تحليل عبارة جبرية',
  text: 'لاحظ كيف تحسب إيمان المجموع الآتي: $3{,}5 \\times 1{,}7 + 3{,}5 \\times 0{,}3$.',
  figure: 'كراس إيمان: $3{,}5 \\times 1{,}7 + 3{,}5 \\times 0{,}3 = 3{,}5 \\times (1{,}7 + 0{,}3) = 3{,}5 \\times 2 = 7$',
  questions: [
    '1) لاحظ كيف تحسب إيمان المجموع الآتي: $3{,}5 \\times 1{,}7 + 3{,}5 \\times 0{,}3$. أ) اشرح ما فعلته إيمان.',
    'ب) احسب باستعمال الطريقة نفسها كلا مما يأتي: $2{,}9 \\times 13 + 2{,}9 \\times 87$ ، $2{,}35 \\times 176 - 2{,}35 \\times 76$.',
    '2) اكتب على شكل جداء كل عبارة مما يلي: $9x + 3$ ، $(x - 2)(x + 4) - 3(x - 2)$ و $(x - 1) + (x - 1)^2$. اذكر في كل حالة الخاصية التي اعتمدت عليها.',
    '3) لتكن العبارات الآتية: $x^2 + 6x + 9$ ، $x^2 - 4x + 4$ ، $x^2 - 16$.',
    '• تقول إيمان: «لتحليل كل من هذه العبارات يمكن استغلال المساوايات». هل توافقها؟ اشرح.',
    '• حلّل كل عبارة واذكر المتطابقة التي اعتمدت عليها.',
  ],
  closing: 'عندما نكتب عبارة مجموع على شكل جداء نقول أننا حللنا هذه العبارة.',
  aside: [
    '$(a + b)^2 = a^2 + 2ab + b^2$',
    '$(a - b)^2 = a^2 - 2ab + b^2$',
    '$(a + b)(a - b) = a^2 - b^2$',
  ],
  // Les nombres du livre (les calculs sont faits dans le module).
  numbers: {
    imane: { k: '3,5', a: '1,7', b: '0,3' },
    q1b: [{ k: '2,9', a: 13, b: 87, op: '+' }, { k: '2,35', a: 176, b: 76, op: '-' }],
  },
};

/**
 * L'ACCROCHE — une expérience de la PLATEFORME : le monde de l'unité est le
 * terrain de football. Les plaques de gazon sont les termes de la somme
 * 9x + 3 (السؤال 2 du نشاط 3) ; les poser en rangées identiques, c'est
 * chercher un facteur commun. Déclarée, jamais cachée.
 */
export const HOOK = {
  source: addition('interaction_generation'),
  headline: 'ملعب الحيّ ينتظر عشبه!',
  text: 'وصلت إلى ملعب الحيّ، هديّةً من أهل الخير، قطع عشب: شرائط طول كل منها $x$ مترًا وعرضها مترٌ واحد، ومربّعات صغيرة ضلعها متر واحد. يريد العمّال فرشها كلها في ملعب واحد مستطيل، صفوفًا متماثلة. كم صفًّا يمكن أن يكون؟ وما بُعدا الملعب؟',
};

/** معارف 3 (p. 34) — « التحليل ». La propriété est affichée CORRIGÉE. */
export const KNOWLEDGE = {
  source: src('know-3', 34, 'معارف', 3),
  title: 'التحليل',
  definition: 'تحليل عبارة مجموع هو كتابتها على شكل جداء.',
  distributive: '$a$ ، $b$ و $k$ أعداد. • الخاصية التوزيعية: $ka + kb = k(a + b)$ ، $ka - kb = k(a - b)$',
  correctionNote: 'في التحليل تُقرأ الخاصية من المجموع إلى الجداء: $ka - kb = k(a - b)$ .',
  identities: '• المتطابقات الشهيرة: $a^2 + 2ab + b^2 = (a + b)^2$ ، $a^2 - 2ab + b^2 = (a - b)^2$ ، $a^2 - b^2 = (a + b)(a - b)$',
  examples: [
    '$6x^2 + 4x = 2x \\times 3x + 2x \\times 2 = 2x(3x + 2)$',
    '$5(x + 1) + 3x(x + 1) = (x + 1)(5 + 3x)$',
    '$9x^2 + 6x + 1 = (3x)^2 + 2(3x) \\times 1 + 1^2 = (3x + 1)^2$',
    '$4 - 4x + x^2 = 2^2 - 2 \\times 2 \\times x + x^2 = (2 - x)^2$',
    '$64 - 16x^2 = 8^2 - (4x)^2 = (8 - 4x)(8 + 4x)$',
  ],
};

/** طرائق p. 35 — « تحليل عبارة باستخراج عامل مشترك ». */
export const METHOD_COMMON_FACTOR = {
  source: src('method-common-factor', 35, 'طرائق'),
  title: 'تحليل عبارة باستخراج عامل مشترك',
  exercise: 'حلّل كل عبارة مما يلي: أ) $A = 4x \\times (x + 1) - 12x^2$ ، ب) $B = (x - 5)(x + 1) + 2(x - 5)$ ، جـ) $C = 3(\\sqrt{2}x + 1) - (\\sqrt{2}x + 1)(x + \\sqrt{2})$ .',
  solution: [
    'أ) بملاحظة أنّ $4x$ هو عامل مشترك بين $4x \\times (x + 1)$ و $12x^2$ نكتب $A = 4x \\times (x + 1) - 12x^2 = 4x \\times (x + 1) - 4x \\times 3x = 4x \\times (x + 1 - 3x) = 4x \\times (1 - 2x)$',
    'ب) بملاحظة أنّ $(x - 5)$ هو عامل مشترك بين $(x - 5)(x + 1)$ و $2(x - 5)$ نكتب $B = (x - 5)(x + 1) + 2(x - 5) = (x - 5)(x + 1 + 2) = (x - 5)(x + 3)$',
    'جـ) بملاحظة أنّ $(\\sqrt{2}x + 1)$ هو عامل مشترك بين $3(\\sqrt{2}x + 1)$ و $(\\sqrt{2}x + 1)(x + \\sqrt{2})$ نكتب $C = (\\sqrt{2}x + 1)[3 - (x + \\sqrt{2})] = (\\sqrt{2}x + 1)(3 - x - \\sqrt{2}) = (\\sqrt{2}x + 1)(3 - \\sqrt{2} - x)$',
  ],
  rule: 'لتحليل عبارة باستخراج عامل مشترك، نحدّد العامل المشترك $k$ بين الحدين (أو الحدود) ثم نطبق الخاصة التوزيعية $k \\times a + k \\times b = k \\times (a + b)$ .',
};

/**
 * طرائق p. 36 — تمرين 1 « تحليل عبارة باستعمال المتطابقات الشهيرة ». L'énoncé
 * affiché est la version CORRIGÉE (extraction.json → method-factor-identities.correction) :
 * le livre imprime (x + 4)² alors que sa solution, complète et juste, prend b = x − 4.
 */
export const METHOD_IDENTITIES = {
  source: src('method-factor-identities', 36, 'طرائق'),
  title: 'تحليل عبارة باستعمال المتطابقات الشهيرة',
  exercise: 'حلّل كل عبارة مما يلي: أ) $A = 25 + 10x + x^2$ ، ب) $B = 49x^2 - 14x + 1$ ، جـ) $C = (4x - 1)^2 - (x - 4)^2$ .',
  correctionNote: 'انتبه: في العبارة $C = (4x - 1)^2 - (x - 4)^2$ يُطرح مربّع $(x - 4)$ .',
  solution: [
    'أ) لدينا $A = 25 + 10x + x^2 = 5^2 + 2 \\times 5 \\times x + x^2$ أي العبارة A من الشكل $a^2 + 2ab + b^2$ حيث $a = 5$ و $b = x$. ومنه $A = (5 + x)^2$ .',
    'ب) لدينا $B = 49x^2 - 14x + 1 = (7x)^2 - 2 \\times (7x) + 1^2$ أي العبارة B من الشكل $a^2 - 2ab + b^2$ حيث $a = 7x$ و $b = 1$. ومنه $B = (7x - 1)^2$ .',
    'جـ) العبارة C من الشكل $a^2 - b^2$ حيث $a = 4x - 1$ و $b = x - 4$. ومنه $C = (4x - 1)^2 - (x - 4)^2 = [(4x - 1) + (x - 4)][(4x - 1) - (x - 4)] = (5x - 5)(3x + 3) = 5(x - 1) \\times 3(x + 1)$ . $C = 15(x - 1)(x + 1)$ .',
  ],
  rule: 'لتحليل عبارة باستعمال المتطابقات الشهيرة، نتعرّف على نوع المتطابقة: مربع مجموع أو مربع فرق أو جداء مجموع حدين وفرقهما ونعيّن الحدين ثم نستعمل تحليلها.',
};

/**
 * طرائق p. 36 — تمرين 2 « نشر عبارة ثم تحليلها ». La première ligne de la
 * solution est la version CORRIGÉE (extraction.json → method-expand-factor.correction) :
 * −6x + 2x = −4x, la forme réduite est x² − 4x + 3.
 */
export const METHOD_EXPAND_FACTOR = {
  source: src('method-expand-factor', 36, 'طرائق'),
  title: 'نشر عبارة ثم تحليلها',
  exercise: 'لتكن العبارة الجبرية A حيث: $A = (x - 3)^2 + 2(x - 3)$ . أ) انشر A وبسّطها ثم حللها إلى جداء عاملين من الدرجة الأولى. ب) احسب A من أجل $x = 1$ .',
  correctionNote: 'انتبه عند التبسيط: $-6x + 2x = -4x$ .',
  solution: [
    'أ) • نشر A وتبسيطها: $(x - 3)^2 = (x)^2 - 2(x) \\times 3 + 3^2 = x^2 - 6x + 9$ و $2(x - 3) = 2x - 6$ إذن $A = x^2 - 6x + 9 + 2x - 6 = x^2 - 4x + 3$ .',
    '• تحليل A: نلاحظ أن $(x - 3)$ عامل مشترك بين $(x - 3)^2$ و $2(x - 3)$ . $A = (x - 3)[x - 3 + 2] = (x - 3)(x - 1)$',
    'ب) من أجل $x = 1$ ، $x - 1 = 0$ . بالتالي $A = 0$ .',
  ],
};

/** Exercice 25 (G) : l'énoncé affiché est la version corrigée (extraction.json → ex-25.correction). */
export const EX25_NOTE = {
  source: addition('interaction_generation'),
  text: 'العامل $(3{,}7 + x)$ مشترك بين الحدود الثلاثة للعبارة G.',
};

/**
 * « أؤكّد تعلّماتي » (p. 40) — les items 4, 5, 6, 9, 10, 11, 12 (extraction.json →
 * destinations › qcm › duplicatedIn › tahlil-ibara). L'item 5 a DEUX options
 * justes dans le manuel : il est posé en lignes « يساويه / لا يساويه » au
 * module 4 (avec l'item 9) ; les autres sont l'إختبار أولي.
 */
const QCM_SRC = (n) => src('qcm', 40, 'أؤكّد تعلّماتي', n);
export const QCM = {
  4: { n: 4, source: QCM_SRC(4), text: 'تحليل العبارة $ab + b$ هو ........', options: ['$ab^2$', '$(a + 1)b$', '$2ab$'], correct: 1,
    explain: '$b$ عامل مشترك بين $ab$ و $b = b \\times 1$ : $ab + b = (a + 1)b$.' },
  5: { n: 5, source: QCM_SRC(5), text: 'تحليل العبارة $\\sqrt{2}x + 2$ هو ........', options: ['$\\sqrt{2}(x + \\sqrt{2})$', '$2\\sqrt{2}x$', '$2\\left(\\dfrac{\\sqrt{2}}{2}x + 1\\right)$'],
    correctSet: [0, 2],
    rowCorrections: [
      '$\\sqrt{2}(x + \\sqrt{2}) = \\sqrt{2}x + \\sqrt{2} \\times \\sqrt{2} = \\sqrt{2}x + 2$ : العامل المشترك $\\sqrt{2}$ لأنّ $2 = \\sqrt{2} \\times \\sqrt{2}$.',
      '$\\sqrt{2}x$ و $2$ حدّان غير متشابهين: لا يُجمعان، و $2\\sqrt{2}x$ يساوي $\\sqrt{2}x + \\sqrt{2}x$.',
      '$2\\left(\\dfrac{\\sqrt{2}}{2}x + 1\\right) = \\sqrt{2}x + 2$ : العامل المشترك هنا 2.',
    ] },
  6: { n: 6, source: QCM_SRC(6), text: 'تحليل العبارة $a - ab$ هو ........', options: ['$a(1 - b)$', '$b(a - 1)$', '$-a^2b$'], correct: 0,
    explain: '$a$ عامل مشترك بين $a = a \\times 1$ و $ab$ : $a - ab = a(1 - b)$.' },
  9: { n: 9, source: QCM_SRC(9), text: 'العبارة $x^2 + 25$ تحلل على الشكل', options: ['$(x + 5)^2$', '$x^2 + 5^2$', 'لا تقبل تحليلا'], correct: 2,
    explain: '$(x + 5)^2 = x^2 + 10x + 25$ ، و $x^2 + 5^2$ مجموع لا جداء: مجموع مربّعين لا يُحلَّل بالمتطابقات الشهيرة.' },
  10: { n: 10, source: QCM_SRC(10), text: 'العبارة $x^2 + 10x + 25$ تحلل على الشكل', options: ['$(x + 5)^2$', '$x^2 + 5^2$', 'لا تقبل تحليلا'], correct: 0,
    explain: '$x^2 + 10x + 25 = x^2 + 2 \\times x \\times 5 + 5^2 = (x + 5)^2$' },
  11: { n: 11, source: QCM_SRC(11), text: 'العبارة $x^2 - 25$ تحلل على الشكل', options: ['$(x - 5)^2$', '$(x - 5)(x + 5)$', 'لا تقبل تحليلا'], correct: 1,
    explain: '$x^2 - 25 = x^2 - 5^2 = (x - 5)(x + 5)$ ، أما $(x - 5)^2 = x^2 - 10x + 25$.' },
  12: { n: 12, source: QCM_SRC(12), text: 'العبارة $x^2 - 10x + 25$ تحلل على الشكل', options: ['$(x - 5)(x + 5)$', '$(x - 5)^2$', 'لا تقبل تحليلا'], correct: 1,
    explain: '$x^2 - 10x + 25 = x^2 - 2 \\times x \\times 5 + 5^2 = (x - 5)^2$' },
};

/**
 * « أستعدّ » — items 9 et 10 du manuel (p. 31), puis des affirmations de la
 * PLATEFORME, dans la même forme (« أصحيح أم خاطئ؟ برّر إجابتك »), pour les
 * autres acquis que la leçon suppose : le نشر et la réduction (leçon 1), les
 * متطابقات (leçon 2), les diviseurs communs (unité 1). Aucune n'utilise les
 * nombres du module 1 (9x + 3, 6x² + 4x, x² + 6x + 9, x² − 4x + 4, x² − 16).
 */
export const PREP_ITEMS = [
  { n: 9, skill: 'nashr', text: 'العبارة $x^2 + 3x$ تساوي $x(x + 3)$.', answer: true, why: '$x(x + 3) = x \\times x + x \\times 3 = x^2 + 3x$', source: src('prep', 31, 'أستعدّ', 9) },
  { n: 10, skill: 'tabsit', text: 'العبارة $\\sqrt{2}x + 2\\sqrt{2}$ تساوي $3\\sqrt{2}x$.', answer: false, why: '$\\sqrt{2}x + 2\\sqrt{2} = \\sqrt{2}(x + 2)$ : الحدان غير متشابهين', source: src('prep', 31, 'أستعدّ', 10) },
  { skill: 'nashr', text: 'نشر العبارة $-5(2x - 3)$ هو $-10x - 15$.', answer: false, why: '$-5 \\times 2x - 5 \\times (-3) = -10x + 15$', source: addition('prerequisite_diagnostic') },
  { skill: 'tabsit', text: 'العبارة $4x^2 + 3x - x^2 + 2x$ تُبسَّط على الشكل $3x^2 + 5x$.', answer: true, why: 'نجمع الحدود المتشابهة: $4x^2 - x^2 = 3x^2$ و $3x + 2x = 5x$', source: addition('prerequisite_diagnostic') },
  { skill: 'huwiyat', text: 'نشر العبارة $(2x - 3)^2$ هو $4x^2 - 12x + 9$.', answer: true, why: '$(2x - 3)^2 = (2x)^2 - 2 \\times 2x \\times 3 + 3^2 = 4x^2 - 12x + 9$', source: addition('prerequisite_diagnostic') },
  { skill: 'huwiyat', text: 'نشر العبارة $(a + 3)(a - 3)$ هو $a^2 - 6$.', answer: false, why: '$(a + 3)(a - 3) = a^2 - 3^2 = a^2 - 9$', source: addition('prerequisite_diagnostic') },
  { skill: 'qasim', text: 'PGCD$(12 ; 18) = 6$.', answer: true, why: 'قواسم 12 هي 1، 2، 3، 4، 6، 12 وقواسم 18 هي 1، 2، 3، 6، 9، 18: أكبر قاسم مشترك هو 6.', source: addition('prerequisite_diagnostic') },
  { skill: 'qasim', text: 'العدد 6 قاسم مشترك للعددين 15 و 24.', answer: false, why: '6 لا يقسم 15 لأنّ $15 = 6 \\times 2 + 3$ : القاسمان المشتركان للعددين 15 و 24 هما 1 و 3 فقط.', source: addition('prerequisite_diagnostic') },
];
