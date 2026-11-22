/**
 * Le contenu du درس « العمليات على الأعداد الناطقة » (3AM, unité 2) — données pures. Le manuel est la RÉFÉRENCE (docs/sources/3am/unit2/extraction.json : نشاط 6 p. 25, معارف 6 p. 28,
 * طرائق 7, 8, 9 p. 29, دورك الآن 3 p. 29, أستعدّ 9–11 p. 23) ; chaque texte montré à l'élève est RÉÉCRIT par la plateforme (guide §4ter-bis : mêmes règles et notations, autres mots,
 * autres exemples, autres nombres). La `source` de chaque bloc garde la traçabilité (`check:textbook`) ; `SourceTag` est muet pour l'élève. Les erreurs d'impression du manuel
 * (`method-9` : 23/33 au lieu de 15/11 ; la « solution brève » de l'intégration : 59/7 au lieu de 57/7) ne sont JAMAIS montrées : la leçon n'écrit que les valeurs justes.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** LE LABO DE L'ENTRÉE — la لوحة الدمج (`merge-board`, thème `arcade`) : expérience de la plateforme, tâches du preset `levels.js`. */
export const LAB = {
  source: addition('platform_designed_entry'),
  beginner: {},
  advanced: {},
  /** Le monde `signs` de معارف : six fusions où seul le SIGNE est demandé. */
  signs: { world: 'signs', tasks: [
    { id: 's1', chain: '-2/3 + 1/4', signOnly: true },
    { id: 's2', chain: '3/5 × -10/9', signOnly: true },
    { id: 's3', chain: '-4/7 ÷ -2/21', signOnly: true },
    { id: 's4', chain: '-1/2 - 1/3', signOnly: true },
    { id: 's5', chain: '5/6 - 7/8', signOnly: true },
    { id: 's6', chain: '-6 × -5/12', signOnly: true },
  ] },
};

const recall = (title, text, lesson) => ({ source: addition('prior_year_reminder'), title, text, lesson });
/** Les quatre « تذكّر » (leçons PUBLIÉES : avec un lien). RAPPELÉS, jamais reconstruits. */
export const RECALL = {
  sign: recall('تذكّر — جداء عددين نسبيين', 'في درس « جداء عددين نسبيين » رأينا أنّ جداء عددين لهما الإشارة نفسها موجب، وجداء عددين مختلفي الإشارة سالب: نعيّن الإشارة أوّلًا ثمّ نضرب المسافتين إلى الصفر.', 'jidaa-adadayn-nisbiyayn'),
  div: recall('تذكّر — قسمة كسرين', 'في درس « المقلوب وقسمة كسرين » رأينا أنّ القسمة على عدد غير معدوم هي الضرب في مقلوبه: $\\frac{a}{b}\\div\\frac{c}{d}=\\frac{a}{b}\\times\\frac{d}{c}$ .', 'maqlub-qismat-kasrayn'),
  sum: recall('تذكّر — جمع وطرح كسرين', 'في درس « جمع وطرح كسرين » رأينا أنّنا لا نجمع إلا أجزاء من النوع نفسه: نكتب الكسرين بمقام مشترك، ويُفضَّل أصغر مضاعف مشترك للمقامين.', 'jam-tarh-kasrayn'),
  rational: recall('تذكّر — العدد الناطق', 'في درس « العدد الناطق » رأينا أنّ للعدد الناطق كتابات كثيرة ومكانًا واحدًا، وأنّ كتابته المعيارية بمقام موجب.', 'adad-natiq'),
};

/** معارف 6 (p. 28) — réécrits, avec les exemples de la plateforme. */
export const KNOWLEDGE = {
  sum: {
    source: src('know-6', 28, 'معارف', 6),
    text: 'لجمع عددين ناطقين أو طرحهما نحدّد أوّلًا إشارة الناتج (على يمين الصفر أم على يساره؟)، ثمّ نكتبهما بالمقام نفسه ونجمع (أو نطرح) البسطين: $\\frac{a}{c}+\\frac{b}{c}=\\frac{a+b}{c}$ .',
    examples: '$\\frac{-2{,}4}{5}+\\frac{6{,}9}{5}=\\frac{4{,}5}{5}=\\frac{9}{10}$ ؛ $-\\frac{5}{8}-\\left(-\\frac{13}{8}\\right)=\\frac{8}{8}=1$ ؛ $\\frac{5}{6}+\\left(-\\frac{7}{4}\\right)=\\frac{10}{12}-\\frac{21}{12}=-\\frac{11}{12}$ .',
  },
  prod: {
    source: src('know-6', 28, 'معارف', 6),
    text: 'جداء عددين ناطقين: نعيّن الإشارة أوّلًا (موجبة إذا تشابهت الإشارتان وسالبة إذا اختلفتا)، ثمّ نضرب البسطين ونضرب المقامين: $\\frac{a}{b}\\times\\frac{c}{d}=\\frac{a\\times c}{b\\times d}$ .',
    examples: '$\\frac{9}{4}\\times\\frac{-1{,}6}{3}=\\frac{9\\times(-1{,}6)}{4\\times3}=-\\frac{14{,}4}{12}=-\\frac{6}{5}$ ؛ $6\\times\\left(-\\frac{5}{9}\\right)=-\\frac{30}{9}=-\\frac{10}{3}$ .',
  },
  recip: {
    source: src('know-6', 28, 'معارف', 6),
    text: 'مقلوب عدد ناطق غير معدوم $\\frac{a}{b}$ هو $\\frac{b}{a}$ ، وله إشارة العدد نفسه لأنّ جداءهما $1$ موجب: مقلوب $-5$ هو $-\\frac{1}{5}$ ، ومقلوب $-\\frac{8}{11}$ هو $-\\frac{11}{8}$ . أمّا $0$ فلا مقلوب له.',
  },
  quot: {
    source: src('know-6', 28, 'معارف', 6),
    text: 'القسمة على عدد ناطق غير معدوم هي الضرب في مقلوبه: $\\frac{a}{b}\\div\\frac{c}{d}=\\frac{a}{b}\\times\\frac{d}{c}$ ، والإشارة تُحدَّد أوّلًا.',
    examples: '$-\\frac{6}{7}\\div(-3)=-\\frac{6}{7}\\times\\left(-\\frac{1}{3}\\right)=\\frac{2}{7}$ ؛ $\\frac{5}{9}\\div\\left(-\\frac{10}{3}\\right)=\\frac{5}{9}\\times\\left(-\\frac{3}{10}\\right)=-\\frac{1}{6}$ .',
  },
};

/** « طريقة » (p. 29, method-7, 8, 9) : chaque طريقة a ICI son exemple, aux nombres de la plateforme. */
export const METHOD = {
  sumDec: {
    source: src('method-7', 29, 'طرائق', 7),
    exercise: 'احسب $-\\frac{4}{9}+\\frac{1{,}5}{6}$ .',
    solution: [
      'المقامان $9$ و $6$ : أصغر مضاعف مشترك غير معدوم هو $18$ .',
      '$-\\frac{4}{9}=-\\frac{8}{18}$ و $\\frac{1{,}5}{6}=\\frac{4{,}5}{18}$ .',
      '$-\\frac{8}{18}+\\frac{4{,}5}{18}=\\frac{-3{,}5}{18}=-\\frac{35}{180}=-\\frac{7}{36}$ .',
    ],
    rule: 'البسط العشري يبقى في مكانه: نوحّد المقامين ثمّ نجمع البسطين ونحذف الفاصلة في النهاية.',
  },
  diffDec: {
    source: src('method-8', 29, 'طرائق', 8),
    exercise: 'احسب $-\\frac{2{,}5}{14}-\\frac{3{,}1}{21}$ .',
    solution: [
      'مضاعفات $21$ : $21$ ، $42$ . و $42$ من مضاعفات $14$ : المقام المشترك الأصغر هو $42$ (لا حاجة إلى $14\\times21=294$ ).',
      '$-\\frac{2{,}5}{14}=-\\frac{7{,}5}{42}$ و $\\frac{3{,}1}{21}=\\frac{6{,}2}{42}$ .',
      '$-\\frac{7{,}5}{42}-\\frac{6{,}2}{42}=-\\frac{13{,}7}{42}=-\\frac{137}{420}$ .',
    ],
    rule: 'نختار أصغر مضاعف مشترك للمقامين: نكتب مضاعفات المقام الأكبر حتى نصل إلى مضاعف للآخر.',
  },
  chain: {
    source: src('method-9', 29, 'طرائق', 9),
    exercise: 'احسب $E=\\frac{5}{2}-\\frac{9}{14}\\div\\frac{3}{7}$ .',
    solution: [
      'القسمة تُنجز قبل الطرح: $\\frac{9}{14}\\div\\frac{3}{7}=\\frac{9}{14}\\times\\frac{7}{3}=\\frac{63}{42}=\\frac{3}{2}$ .',
      '$E=\\frac{5}{2}-\\frac{3}{2}=\\frac{2}{2}=1$ .',
    ],
    rule: 'في سلسلة حسابات: الأقواس أوّلًا، ثمّ الضرب والقسمة، ثمّ الجمع والطرح من اليسار إلى اليمين.',
  },
  choose: {
    source: addition('knowledge_formalization'),
    rule: 'في كل عملية بين عددين ناطقين نحدّد الإشارة أوّلًا ثمّ نحسب الكسر؛ وفي سلسلة نحترم الأولوية: الأقواس ثمّ الضرب والقسمة ثمّ الجمع والطرح.',
  },
};

/** « أستعدّ » — أستعدّ p. 23, items 9, 10 et 11, RÉÉCRITS en affirmations (sommes et différences de relatifs, 2AM). */
export const PREP_ITEMS = [
  { n: 9, skill: 'nisbi', text: '$(-9)+(-6)=-15$ .', answer: true, why: 'عددان سالبان: نجمع المسافتين $9+6=15$ والإشارة سالبة.' },
  { n: 10, skill: 'nisbi', text: '$13+(-20)=-7$ .', answer: true, why: '$20$ أبعد عن الصفر من $13$ والفرق $7$ ، فالناتج سالب: $-7$ .' },
  { n: 11, skill: 'nisbi', text: '$(-15)-(-9)=-6$ .', answer: true, why: 'طرح $-9$ هو جمع $9$ : $-15+9=-6$ .' },
].map((it) => ({ ...it, source: src('prep', 23, 'أستعدّ', it.n) }));

/**
 * Les items de la PLATEFORME : le réseau dit que la leçon suit `3am.m1.r01` (le produit de deux relatifs), `3am.m1.r04` (la division de deux fractions), `3am.m1.r06` (somme et différence de deux
 * fractions) et `3am.m1.r07` (le nombre ناطق) — « أستعدّ » doit les mesurer (LEARNING_NET.md §4.4).
 */
export const PREP_PLATFORM_ITEMS = [
  { skill: 'jida', text: '$(-3)\\times(-7)=21$ .', answer: true, why: 'عددان سالبان: الجداء موجب، $3\\times7=21$ .' },
  { skill: 'jida', text: '$(-2)\\times5\\times(-1)\\times(-3)=-30$ .', answer: true, why: 'ثلاثة عوامل سالبة: الجداء سالب، و $2\\times5\\times1\\times3=30$ .' },
  { skill: 'qisma', text: '$\\frac{5}{6}\\div\\frac{2}{3}=\\frac{5}{4}$ .', answer: true, why: '$\\frac{5}{6}\\times\\frac{3}{2}=\\frac{15}{12}=\\frac{5}{4}$ .' },
  { skill: 'jam', text: '$\\frac{3}{4}+\\frac{1}{6}=\\frac{4}{10}$ .', answer: false, why: 'لا نجمع المقامين: بالمقام $12$ ، $\\frac{9}{12}+\\frac{2}{12}=\\frac{11}{12}$ .' },
  { skill: 'natiq', text: '$\\frac{6}{-8}=-\\frac{3}{4}$ .', answer: true, why: 'نقل الإشارة إلى البسط ثمّ الاختزال: $\\frac{6}{-8}=-\\frac{6}{8}=-\\frac{3}{4}$ .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les phrases de correction partagées par les modules ET la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  sumsign: {
    wrong: 'قلنا إنّ مجموع عددين يأخذ إشارة العدد الأوّل، أو إنّه سالب متى وُجدت إشارة سالبة.',
    why: 'حين يتقابل شريطان من لونين مختلفين يبقى الأطول، أي العدد الأبعد عن الصفر: قد يكون العدد الأوّل سالبًا والمجموع موجبًا.',
    right: '$-\\frac{5}{4}+\\frac{11}{6}=-\\frac{15}{12}+\\frac{22}{12}=\\frac{7}{12}$ ، وهو موجب.',
  },
  recipsign: {
    wrong: 'قلنا إنّ مقلوب $-\\frac{3}{4}$ هو $\\frac{4}{3}$ .',
    why: 'جداء عدد ومقلوبه يساوي $1$ ، وهو موجب: لا يصير الجداء موجبًا إلا إذا كان للعددين الإشارة نفسها.',
    right: '$\\left(-\\frac{3}{4}\\right)\\times\\left(-\\frac{4}{3}\\right)=1$ ، فمقلوب $-\\frac{3}{4}$ هو $-\\frac{4}{3}$ .',
  },
  priority: {
    wrong: 'حسبنا السلسلة من اليسار إلى اليمين دون النظر إلى الأولوية.',
    why: 'الضرب والقسمة يسبقان الجمع والطرح، والأقواس تسبق الجميع.',
    right: '$\\frac{7}{3}-\\frac{8}{15}\\div\\frac{11}{20}=\\frac{7}{3}-\\frac{32}{33}=\\frac{15}{11}$ .',
  },
  arcade: 'على لوحة إلياس: $-\\frac{5}{4}+\\frac{11}{6}$ أعطت $\\frac{7}{12}$ مع أنّ العدد الأوّل سالب؛ و $-\\frac{9}{8}\\div\\left(-\\frac{3}{4}\\right)$ أعطت $\\frac{3}{2}$ بعد قلب القاسم.',
};
