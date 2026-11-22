/**
 * Le contenu du MANUEL pour le درس 2 de l'unité 3 — « المتطابقات الشهيرة »
 * (نشاط 2 pp. 32–33, ديكارت p. 31, معارف 2 p. 34, طرائق p. 35, « أستعدّ »
 * p. 31 items 5–6). Données pures, au mot près ; chaque bloc cite son élément
 * de docs/sources/4am/unit3/extraction.json. Les modules rendent ces données,
 * ils n'en réécrivent aucune.
 *
 * Les RÉSULTATS des questions (`answer`) ne sont pas imprimés dans le manuel :
 * ils sont calculés (extraction.json → `answer`) et ne s'affichent qu'après
 * la réponse de l'élève.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** نشاط 2 — 1) مربع مجموع (p. 32) : le carré MNPQ. */
export const ACTIVITY = {
  source: src('act-2a', 32, 'أنشطة', 2),
  title: 'المتطابقات الشهيرة',
  subtitle: 'مربع مجموع',
  text: 'مربع MNPQ طول ضلعه $a + b$ ، مقسّم إلى المربع MRLV (ضلعه $a$) والمربع LSPT (ضلعه $b$) والرباعيين RNSL و VLTQ (بعدا كل منهما $a$ و $b$).',
  questions: [
    'أ) احسب بطريقتين مختلفتين كلا مما يلي: $(8 + 2)^2$ و $(3 + 0{,}5)^2$.',
    'ب) $a$ و $b$ عددان موجبان. • عبّر عن مساحة المربع MNPQ مرة بدلالة طول ضلعه $a + b$ ومرة أخرى باستعمال مساحات الرباعيات MRLV ، LSPT ، RNSL ، VLTQ. • اكتب المساواة الناتجة عن العبارتين.',
    'جـ) من أجل كل عددين $a$ و $b$ ؛ انقل وأكمل: $(a + b)^2 = (a + b) \\times (\\ldots + \\ldots) = \\ldots + \\ldots + \\ldots + \\ldots = \\ldots + \\ldots + \\ldots$ استنتج عبارة مبسطة للعدد $(a + b)^2$.',
    'د) استعمل ما سبق لنشر كل من العبارتين $(x + 1)^2$ و $(2x + 3)^2$.',
    'هـ) احسب ذهنيا (دون وضع العملية) كلا من: $21^2$ و $53^2$.',
  ],
  closing: 'من أجل كل عددين $a$ و $b$ : $(a + b)^2 = a^2 + 2ab + b^2$',
};

/** نشاط 2 — 2) مربع فرق (p. 32) : le carré KLMN. */
export const ACTIVITY_B = {
  source: src('act-2b', 32, 'أنشطة', 2),
  subtitle: 'مربع فرق',
  text: 'مربع KLMN طول ضلعه $a$ ، فيه المربع (1) ضلعه $a - b$ ، المربع (2) ضلعه $b$ ، والمستطيلان (1) و (2).',
  questions: [
    'أ) احسب بطريقتين مختلفتين كلا مما يلي: $(9 - 3)^2$ و $(2{,}4 - 3)^2$.',
    'ب) $a$ و $b$ عددان موجبان. • عبّر عن مساحة المربع (1) مرة بدلالة طول ضلعه $a - b$ ومرّة أخرى باستعمال مساحات: المربع KLMN، المربع (2) المستطيل (1) و المستطيل (2). • اكتب المساواة الناتجة عن العبارتين.',
    'جـ) من أجل كل عددين $a$ و $b$ ؛ انقل وأكمل: $(a - b)^2 = (a - b) \\times (\\ldots - \\ldots) = \\ldots - \\ldots - \\ldots + \\ldots = \\ldots - \\ldots + \\ldots$ استنتج عبارة مبسطة للعدد $(a - b)^2$.',
    'د) استعمل ما سبق لنشر كل من العبارتين $(x - 1)^2$ و $(5 - 2x)^2$.',
    'هـ) احسب ذهنيا (دون وضع العملية) كلا من: $19^2$ و $37^2$.',
  ],
  closing: 'من أجل كل عددين $a$ و $b$ : $(a - b)^2 = a^2 - 2ab + b^2$',
};

/** نشاط 2 — 3) جداء مجموع حدين وفرقهما (p. 33). */
export const ACTIVITY_C = {
  source: src('act-2c', 33, 'أنشطة', 2),
  subtitle: 'جداء مجموع حدين وفرقهما',
  text: 'مربع KLMN طول ضلعه $a + b$ مقسّم إلى المستطيل (1) بعداه $a + b$ و $a - b$ ، والمستطيل (2) بعداه $a + b$ و $2b$.',
  questions: [
    'أ) $a$ و $b$ عددان موجبان. • عبّر عن مساحة المستطيل (1)، مرة بدلالة بعديه $a + b$ و $a - b$ ومرة أخرى باستعمال مساحتي المربع KLMN، والمستطيل (2). • اكتب المساواة الناتجة عن العبارتين مع تبسيط العبارة الثانية.',
    'ب) لبرهان صحة المساواة التي وجدتها في الجزء (أ) من أجل كل عددين $a$ و $b$ : انقل وأكمل: من أجل كل عددين $a$ و $b$ : $(a + b)(a - b) = \\ldots - \\ldots + \\ldots - \\ldots = \\ldots - \\ldots$',
    'جـ) استعمل ما سبق لنشر كل من العبارتين $(x - 3)(x + 3)$ و $(2x - 5)(2x + 5)$.',
    'د) احسب ذهنيا (دون وضع العملية) كلا من: $105 \\times 95$ و $97^2 - 3^2$.',
  ],
  closing: 'من أجل كل عددين $a$ و $b$ : $(a + b)(a - b) = a^2 - b^2$',
};

/**
 * ديكارت (p. 31, page de l'unité) — déclaré `duplicatedIn` vers le module 1
 * de cette leçon : son tableau de (2x + 1)² EST le tableau de Descartes que
 * le laboratoire dessine sous le terrain.
 */
export const DESCARTES = {
  source: src('history-descartes', 31, 'ديكارت'),
  caption: 'روني ديكارت',
  text: 'يعتبر الفيلسوف الفرنسي ديكارت (Descartes) أن الرياضيات هي أداة لتفسير معظم الظواهر. في إحدى الوثائق التي ألّفها في 06 جوان من سنة 1635 تحت عنوان «حوار الطريقة» اقترح إمكانيات وضع أسس تربط بين العمليات الحسابية والجبر من جهة، والجبر والهندسة من جهة أخرى. فهو يذكر أنه لحساب مربع عدد معطى بدلالة عدد مجهول، يمكن الاستعانة بمفهوم مساحة مربع. مثلا، لحساب العدد $(2x + 1)^2$ نظم العمل في الجدول المقابل: يجمع الأعداد المسجلة في الخانات ونتحصل على $(2x + 1)^2 = 4x^2 + 4x + 1$',
  // Le tableau 3 × 3 du manuel : la ligne et la colonne d'en-tête x ، x ، 1.
  head: ['$x$', '$x$', '$1$'],
  cells: [
    ['$x^2$', '$x^2$', '$x$'],
    ['$x^2$', '$x^2$', '$x$'],
    ['$x$', '$x$', '$1$'],
  ],
  result: '$(2x + 1)^2 = 4x^2 + 4x + 1$',
};

/** معارف 2 (p. 34) — la définition, les trois identités et les trois exemples, au mot près. */
export const KNOWLEDGE = {
  source: src('know-2', 34, 'معارف', 2),
  title: 'المتطابقات الشهيرة',
  identity: 'المتطابقة هي مساواة صحيحة من أجل كل القيم المعطاة للحروف الواردة في المساواة.',
  remarkable: 'تُسمى المتطابقات الآتية المتطابقات الشهيرة. $a$ و $b$ عددان.',
  squareSum: { title: '1) مربع مجموع', text: '$(a + b)^2 = a^2 + 2ab + b^2$' },
  squareDiff: { title: '2) مربع فرق', text: '$(a - b)^2 = a^2 - 2ab + b^2$' },
  sumDiff: { title: '3) جداء مجموع حدين وفرقهما', text: '$(a + b)(a - b) = a^2 - b^2$' },
  examples: [
    '$(3x + 2)^2 = (3x)^2 + 2 \\times 3x(2) + 2^2 = 9x^2 + 12x + 4$',
    '$(4 - 2x)^2 = 4^2 - 2 \\times 4(2x) + (2x)^2 = 16 - 16x + 4x^2$',
    '$(5x - 1)(5x + 1) = (5x)^2 - 1^2 = 25x^2 - 1$',
  ],
};

/** طرائق (p. 35) — « نشر عبارة باستعمال المتطابقات الشهيرة », pour MethodSteps. */
export const METHOD = {
  source: src('method-expand-identities', 35, 'طرائق'),
  title: 'نشر عبارة باستعمال المتطابقات الشهيرة',
  exercise: 'انشر ثم بسط كل من العبارات التالية: أ) $(2x + 1)^2$ ، ب) $(\\sqrt{3} - 4x)^2$ ، جـ) $(2x - \\sqrt{5})(2x + \\sqrt{5})$ .',
  solution: [
    'أ) $(2x + 1)^2 = (2x)^2 + 2(2x) \\times 1 + 1^2 = 4x^2 + 4x + 1$ .',
    'ب) $(\\sqrt{3} - 4x)^2 = (\\sqrt{3})^2 - 2 \\times \\sqrt{3} \\times 4x + (4x)^2 = 3 - 8\\sqrt{3}x + 16x^2$ .',
    'جـ) $(2x - \\sqrt{5})(2x + \\sqrt{5}) = (2x)^2 - (\\sqrt{5})^2 = 4x^2 - 5$ .',
  ],
  rule: 'لنشر عبارة باستعمال المتطابقات الشهيرة، نتعرّف على نوع المتطابقة: مربع مجموع أو مربع فرق أو جداء مجموع حدين وفرقهما ونعيّن الحدين ثم نستعمل نشرها.',
};

/**
 * « أستعدّ » — les items 5 et 6 du manuel (p. 31, destinés à cette leçon :
 * la double distributivité de la leçon 1), puis six affirmations de la
 * PLATEFORME, dans la même forme (« أصحيح أم خاطئ؟ برّر إجابتك »), pour les
 * autres acquis que la leçon suppose : réduire des termes semblables (leçon 1),
 * le carré d'un nombre relatif, décimal ou d'un produit, les puissances de 10.
 * Aucune n'utilise les nombres de l'activité 2 (8, 2, 3, 0,5, 9, 2,4, 21, 53,
 * 19, 37, 105, 95, 97).
 */
export const PREP_ITEMS = [
  { n: 5, skill: 'nashr', text: 'نشر العبارة $(1 + x)(1 + y)$ هو $1 + xy$.', answer: false, why: '$(1 + x)(1 + y) = 1 + y + x + xy$', source: src('prep', 31, 'أستعدّ', 5) },
  { n: 6, skill: 'nashr', text: 'نشر العبارة $(1 - x)(1 - y)$ هو $1 - x - y - xy$.', answer: false, why: '$(1 - x)(1 - y) = 1 - y - x + xy$', source: src('prep', 31, 'أستعدّ', 6) },
  { skill: 'tabsit', text: 'العبارة $ab + ba$ تساوي $2ab$.', answer: true, why: '$ba = ab$ (الضرب تبديلي)، إذن $ab + ba = ab + ab = 2ab$ : حدّان متشابهان.', source: addition('prerequisite_diagnostic') },
  { skill: 'tabsit', text: 'العبارة $x^2 + 4x$ تساوي $5x^2$.', answer: false, why: '$x^2$ و $4x$ حدّان غير متشابهين: لا يُجمعان في حدّ واحد.', source: addition('prerequisite_diagnostic') },
  { skill: 'murabba', text: 'العدد $(-7)^2$ يساوي $-49$.', answer: false, why: '$(-7)^2 = (-7) \\times (-7) = 49$ : مربع عدد غير معدوم موجب دائمًا.', source: addition('prerequisite_diagnostic') },
  { skill: 'murabba', text: 'العبارة $(4x)^2$ تساوي $16x^2$.', answer: true, why: '$(4x)^2 = 4x \\times 4x = 4^2 \\times x^2 = 16x^2$ : المعامل يُربَّع أيضًا.', source: addition('prerequisite_diagnostic') },
  { skill: 'quwa', text: 'العدد $(0{,}6)^2$ يساوي $0{,}36$.', answer: true, why: '$0{,}6 \\times 0{,}6 = 0{,}36$', source: addition('prerequisite_diagnostic') },
  { skill: 'quwa', text: 'العدد $1000^2$ يساوي $100\\,000$.', answer: false, why: '$1000^2 = (10^3)^2 = 10^6 = 1\\,000\\,000$', source: addition('prerequisite_diagnostic') },
];

/**
 * L'ACCROCHE (la plateforme, déclarée) : le ملعب جواري que la commune agrandit.
 * La mathématique est celle de l'activité 2 : (a + b)² et (a + b)(a − b).
 */
export const HOOK = {
  source: addition('interaction_generation'),
  square: { side: 20, extra: 2, workersClaim: 404 },
  rectangle: { side: 20, change: 5 },
};

/** Les niveaux des laboratoires — expériences de la plateforme, déclarées (lesson.config › resources). */
export const LABS = {
  source: addition('interaction_generation'),
  squareSum: 'x+3',
  squareDiff: 'x-2',
  sumDiffBeginner: 'x+3|x-3',
  sumDiffAdvanced: '2x+5|2x-5',
};

/**
 * LA PAGE (enseignant, mode classe) — les lignes de trace des étapes qui relisent les labos de la page (LABS), écrites ICI à partir de leurs
 * nombres : la prose des modules ne contient aucun de ces terrains (rollout 2026-11-11, conseil X3 : le lecteur de l'élève lit ses MANCHES,
 * content/squares.js ; la page garde ses labos pour l'enseignant — verdict « Edit classes »).
 */
const sq = (b) => (b < 0 ? `(x - ${-b})^2` : `(x + ${b})^2`);
const SUM_B = 3; const DIFF_B = 2; const SD_B = 3;
export const PAGE_LABS = {
  squareSum: sq(SUM_B),
  squareDiff: sq(-DIFF_B),
  sumDiff: `(x + ${SD_B})(x - ${SD_B})`,
  sumDiffAdvanced: '(2x + 5)(2x - 5)',
  strip: `${SUM_B}x`,
  diffStrip: `${DIFF_B}x`,
  corner: `${DIFF_B * DIFF_B}`,
  sumLine: (x) => `$x = ${x}$ : $${sq(SUM_B)} = ${(x + SUM_B) ** 2}$ و $${x * x} + ${SUM_B * x} + ${SUM_B * x} + ${SUM_B * SUM_B} = ${(x + SUM_B) ** 2}$`,
  twoSquares: (x) => `$${x * x} + ${SUM_B * SUM_B} = ${x * x + SUM_B * SUM_B}$`,
  diffLine: (x) => `$x = ${x}$ : $${sq(-DIFF_B)} = ${(x - DIFF_B) ** 2}$ و $${x * x} - ${DIFF_B * x} - ${DIFF_B * x} + ${DIFF_B * DIFF_B} = ${(x - DIFF_B) ** 2}$`,
  sdLine: (x) => `$x = ${x}$ : $(x + ${SD_B})(x - ${SD_B}) = ${(x + SD_B) * (x - SD_B)}$ و $${x * x} - ${SD_B * x} + ${SD_B * x} - ${SD_B * SD_B} = ${x * x - SD_B * SD_B}$`,
  sdAdvancedLine: (x) => `$x = ${x}$ : $(2x + 5)(2x - 5) = ${(2 * x + 5) * (2 * x - 5)}$ و $${4 * x * x} - ${10 * x} + ${10 * x} - 25 = ${4 * x * x - 25}$`,
};

/**
 * LE CONTENU DE LA PLATEFORME qui remplace, pour l'élève, les figures, les questions et les exemples du manuel (indépendance du manuel —
 * LESSON_DEVELOPMENT_GUIDE §4ter-bis ; rollout 2026-11-11, SHARED-deliberate : la page de l'enseignant y gagne aussi). Nombres de la plateforme.
 */
export const PLATFORM = {
  source: addition('interaction_generation'),
  figureSum: 'مربّع ضلعه $a + b$ يُقسَم إلى أربع مناطق: مربّع ضلعه $a$ ، ومربّع ضلعه $b$ ، ومستطيلان بُعدا كل منهما $a$ و $b$ .',
  figureDiff: 'مربّع ضلعه $a$ ، يُقتطع منه شريطان عرض كل منهما $b$ ، فيبقى مربّع ضلعه $a - b$ ، وفي الركن مربّع صغير ضلعه $b$ .',
  figureSumDiff: 'مربّع ضلعه $a + b$ يُقسَم إلى مستطيلين: الأول بُعداه $a + b$ و $a - b$ ، والثاني بُعداه $a + b$ و $2b$ .',
  twoWays: 'احسب كل عدد بطريقتين: مرّة بحساب ما بين القوسين أوّلًا، ومرّة بنشر الجداء.',
  areaTwoWays: 'عبّر عن مساحة المربّع الصغير ذي الضلع $a - b$ بطريقتين: بدلالة ضلعه، ثم بطرح الشريطين والركن من المربّع الكبير. أيّ مساواة صحيحة؟',
  rectTwoWays: 'عبّر عن مساحة المستطيل الأول بطريقتين: بدلالة بُعديه، ثم بطرح المستطيل الثاني من المربّع. أيّ مساواة صحيحة؟',
  chain: 'من أجل كل عددين $a$ و $b$ ، أكمل السلسلة ثم اكتب النتيجة مبسّطة:',
  expand: 'انشر كل عبارة مستعملًا ما سبق:',
  mental: 'احسب ذهنيًا، دون وضع العملية:',
  // le tableau de Descartes, sur un exemple de la plateforme : (2x + 2)², côté x + x + 2
  descartes: {
    head: ['$x$', '$x$', '$2$'],
    cells: [['$x^2$', '$x^2$', '$2x$'], ['$x^2$', '$x^2$', '$2x$'], ['$2x$', '$2x$', '$4$']],
    result: '$(2x + 2)^2 = 4x^2 + 8x + 4$',
    text: 'لاحظ الفيلسوف روني ديكارت أنّ مربّع عبارة فيها مجهول يُقرأ على مساحة مربّع: نكتب حدود الضلع في رأس الجدول، وفي كل خانة مساحة منطقة، ثم نجمع الخانات.',
  },
  examples: [
    '$(3x + 4)^2 = (3x)^2 + 2 \\times 3x \\times 4 + 4^2 = 9x^2 + 24x + 16$',
    '$(5 - 2x)^2 = 5^2 - 2 \\times 5 \\times 2x + (2x)^2 = 25 - 20x + 4x^2$',
    '$(4x - 1)(4x + 1) = (4x)^2 - 1^2 = 16x^2 - 1$',
  ],
};
