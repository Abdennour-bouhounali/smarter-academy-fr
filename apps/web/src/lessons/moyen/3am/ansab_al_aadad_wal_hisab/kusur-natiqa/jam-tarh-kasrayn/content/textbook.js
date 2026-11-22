/**
 * Le contenu du درس « جمع وطرح كسرين » (3AM, unité 2) — données pures. Le manuel est la RÉFÉRENCE (docs/sources/3am/unit2/extraction.json : نشاط 4 p. 24, معارف 4 p. 26,
 * طرائق 5–6 et « دورك الآن » 2 p. 27, أستعدّ 6–7 p. 23) ; chaque texte montré à l'élève est RÉÉCRIT par la plateforme (guide §4ter-bis : mêmes définitions et notations, autres mots,
 * autres exemples, autres nombres). La `source` de chaque bloc garde la traçabilité (`check:textbook`) ; `SourceTag` est muet pour l'élève.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** LE LABO DE L'ENTRÉE — le مشط الشتلات (`seed-rake`, thème `seedbed`) : expérience de la plateforme, tâches du preset `levels.js`. */
export const LAB = {
  source: addition('platform_designed_entry'),
  beginner: {},
  advanced: {},
  /** Le monde `fewest` de معارف : 3/4 et 5/6, « أوسع مسافة » (12 : 9 + 10 = 19 plants de 1/12 m, 19/12 m, le second حوض s'ouvre). */
  fewest: { world: 'fewest', tasks: [{ id: 'f1', terms: [{ p: '3/4' }, { p: '5/6' }], widest: true }] },
};

/** « تذكّر — السنة الثانية » : additionner ou soustraire deux fractions de même dénominateur, ou dont un dénominateur est multiple de l'autre (leçon 2AM `jam-tarh-kusur`, PUBLIÉE 2026-10-29 : avec un lien). RAPPELÉ, jamais reconstruit. */
export const RECALL = {
  source: src('method-5', 27, 'طرائق', 5),
  title: 'تذكّر — السنة الثانية',
  text: 'في السنة الثانية جمعنا كسرين لهما نفس المقام بجمع البسطين وإبقاء المقام: $\\frac{5}{9}+\\frac{2}{9}=\\frac{7}{9}$ ؛ وإذا كان مقام أحدهما مضاعفًا لمقام الآخر كتبنا الثاني بمقام الأول: $\\frac{7}{12}-\\frac{1}{4}=\\frac{7}{12}-\\frac{3}{12}=\\frac{1}{3}$ . وفي هذا الدرس نتعلّم ما بقي: كسران مقاماهما أيّ عددين.',
  lesson: 'jam-tarh-kusur',
};

/** « تذكّر » du درس `tasawi-muqaranat-kasrayn` (PUBLIÉE : avec un lien) : le même dénominateur commun, ici pour calculer. */
export const RECALL_TASAWI = {
  source: addition('prior_year_reminder'),
  title: 'تذكّر — تساوي كسرين ومقارنتهما',
  text: 'كتبنا في ذلك الدرس كسرين بمقام مشترك لنقارنهما: $\\frac{3}{4}=\\frac{15}{20}$ و $\\frac{7}{10}=\\frac{14}{20}$ ، بضرب البسط والمقام في العدد نفسه. اليوم نكتب كسرين بمقام مشترك لنجمعهما أو نطرحهما.',
  lesson: 'tasawi-muqaranat-kasrayn',
};

/** معارف 4 (p. 26) — réécrits, avec les exemples de la plateforme. */
export const KNOWLEDGE = {
  same: {
    source: src('know-4', 26, 'معارف', 4),
    text: 'لا نجمع (ولا نطرح) إلا أجزاءً من النوع نفسه: $\\frac{a}{b}+\\frac{c}{b}=\\frac{a+c}{b}$ و $\\frac{a}{b}-\\frac{c}{b}=\\frac{a-c}{b}$ . فنوحّد مقامي الكسرين قبل أن نجمعهما.',
  },
  rule: {
    source: src('know-4', 26, 'معارف', 4),
    text: 'لجمع كسرين مقاماهما مختلفان أو طرحهما نكتبهما بمقام مشترك، وهو مضاعف مشترك للمقامين (حاصل ضربهما يصلح دائمًا، وأصغر مضاعف مشترك أقصر)، ثمّ نجمع البسطين أو نطرحهما ونُبقي المقام، ثمّ نختزل الناتج.',
  },
  examples: {
    source: src('know-4', 26, 'معارف', 4),
    text: '$\\frac{2}{9}+\\frac{5}{6}=\\frac{4}{18}+\\frac{15}{18}=\\frac{19}{18}$ ، لأنّ $18$ أصغر مضاعف مشترك للعددين $9$ و $6$ . $\\frac{11}{12}-\\frac{5}{8}=\\frac{22}{24}-\\frac{15}{24}=\\frac{7}{24}$ ، لأنّ $24$ أصغر مضاعف مشترك للعددين $12$ و $8$ .',
  },
};

/** « طريقة » : le manuel cherche un multiple commun (p. 27) ; chaque طريقة a ici SON exemple, aux nombres de la plateforme. */
export const METHOD = {
  smallest: {
    source: src('method-6', 27, 'طرائق', 6),
    exercise: 'احسب $\\frac{7}{18}+\\frac{5}{12}$ .',
    solution: [
      'نكتب مضاعفات المقام الأكبر $18$ : $18$ ثمّ $36$ .',
      '$36=12\\times3$ ، فهو أوّل مضاعف لـ $18$ يقبل القسمة على $12$ ، أي أصغر مضاعف مشترك.',
      '$\\frac{7}{18}=\\frac{14}{36}$ و $\\frac{5}{12}=\\frac{15}{36}$ .',
      '$\\frac{14}{36}+\\frac{15}{36}=\\frac{29}{36}$ ، وهو غير قابل للاختزال.',
    ],
    rule: 'نكتب مضاعفات المقام الأكبر حتى نجد أوّل مضاعف يقبل القسمة على المقام الآخر: هذا أصغر مضاعف مشترك.',
  },
  difference: {
    source: src('method-6', 27, 'طرائق', 6),
    exercise: 'احسب $\\frac{13}{20}-\\frac{4}{15}$ .',
    solution: [
      'مضاعفات $20$ : $20$ ، $40$ ، $60$ ، ويقبل $60$ القسمة على $15$ .',
      '$\\frac{13}{20}=\\frac{39}{60}$ و $\\frac{4}{15}=\\frac{16}{60}$ .',
      '$\\frac{39}{60}-\\frac{16}{60}=\\frac{23}{60}$ .',
    ],
    rule: 'الطرح كالجمع: نوحّد المقامين ثمّ نطرح البسطين.',
  },
  natural: {
    source: src('now-2', 27, 'دورك الآن', 2),
    exercise: 'احسب $2+\\frac{1}{6}-\\frac{3}{4}$ .',
    solution: [
      'نكتب العدد $2$ كسرًا: أصغر مضاعف مشترك للمقامين $6$ و $4$ هو $12$ ، و $2=\\frac{24}{12}$ .',
      '$\\frac{1}{6}=\\frac{2}{12}$ و $\\frac{3}{4}=\\frac{9}{12}$ .',
      '$\\frac{24}{12}+\\frac{2}{12}-\\frac{9}{12}=\\frac{17}{12}$ .',
    ],
    rule: 'العدد الطبيعي يُكتب كسرًا بمقام الحساب، ثمّ نجمع ونطرح بالترتيب.',
  },
  choose: {
    source: addition('knowledge_formalization'),
    rule: 'لجمع كسرين أو طرحهما: نكتب مضاعفات المقام الأكبر حتى نجد أوّل مضاعف يقبل القسمة على المقام الآخر، ثمّ نوحّد ونحسب ونختزل.',
  },
};

/** « أستعدّ » — أستعدّ p. 23, items 6 et 7, RÉÉCRITS en affirmations. */
export const PREP_ITEMS = [
  { n: 6, skill: 'jam', text: '$\\frac{4}{15}+\\frac{2}{5}=\\frac{2}{3}$ .', answer: true, why: '$\\frac{2}{5}=\\frac{6}{15}$ ، و $\\frac{4}{15}+\\frac{6}{15}=\\frac{10}{15}=\\frac{2}{3}$ .' },
  { n: 7, skill: 'jam', text: '$\\frac{5}{3}-\\frac{7}{12}=\\frac{13}{12}$ .', answer: true, why: '$\\frac{5}{3}=\\frac{20}{12}$ ، و $\\frac{20}{12}-\\frac{7}{12}=\\frac{13}{12}$ .' },
].map((it) => ({ ...it, source: src('prep', 23, 'أستعدّ', it.n) }));

/**
 * Les items de la PLATEFORME : le réseau dit que la leçon étend `2am.m1.r09` (additionner ou soustraire deux fractions de même dénominateur ou dont un dénominateur est
 * multiple de l'autre) — « أستعدّ » doit les mesurer (LEARNING_NET.md §4.4) ; le dernier rappelle `tasawi` (le dénominateur commun).
 */
export const PREP_PLATFORM_ITEMS = [
  { skill: 'jam', text: '$\\frac{5}{9}+\\frac{2}{9}=\\frac{7}{9}$ .', answer: true, why: 'المقامان متساويان: نجمع البسطين ونُبقي المقام.' },
  { skill: 'jam', text: '$\\frac{7}{12}-\\frac{1}{4}=\\frac{1}{3}$ .', answer: true, why: '$\\frac{1}{4}=\\frac{3}{12}$ ، و $\\frac{7}{12}-\\frac{3}{12}=\\frac{4}{12}=\\frac{1}{3}$ .' },
  { skill: 'jam', text: '$\\frac{3}{10}+\\frac{2}{5}=\\frac{5}{15}$ .', answer: false, why: 'لا نجمع المقامين: $\\frac{2}{5}=\\frac{4}{10}$ ، و $\\frac{3}{10}+\\frac{4}{10}=\\frac{7}{10}$ .' },
  { skill: 'jam', text: '$1-\\frac{5}{8}=\\frac{3}{8}$ .', answer: true, why: '$1=\\frac{8}{8}$ ، و $\\frac{8}{8}-\\frac{5}{8}=\\frac{3}{8}$ .' },
  { skill: 'tawhid', text: '$\\frac{3}{4}$ و $\\frac{5}{6}$ بالمقام نفسه $12$ هما $\\frac{9}{12}$ و $\\frac{10}{12}$ .', answer: true, why: '$12\\div4=3$ و $3\\times3=9$ ؛ $12\\div6=2$ و $5\\times2=10$ .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les phrases de correction partagées par les modules ET la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  across: {
    wrong: 'جمعنا بسطي الكسرين $\\frac{1}{4}$ و $\\frac{1}{6}$ معًا وجمعنا مقاميهما معًا، فكتبنا كسرًا مقامه $10$ .',
    why: 'هذا الكسر أصغر من $\\frac{1}{4}$ وحده، فلا يمكن أن يكون مجموعًا يضمّه: لا نجمع إلا أجزاءً من النوع نفسه.',
    right: '$\\frac{1}{4}+\\frac{1}{6}=\\frac{3}{12}+\\frac{2}{12}=\\frac{5}{12}$ .',
  },
  integer: {
    wrong: 'في طرح $\\frac{5}{8}$ من العدد $3$ طرحنا $5$ من $3$ وأبقينا المقام $8$ .',
    why: 'العدد $3$ لا يُطرح منه بسط كسر: نكتبه أوّلًا كسرًا بالمقام $8$ ، أي $\\frac{24}{8}$ .',
    right: '$3-\\frac{5}{8}=\\frac{24}{8}-\\frac{5}{8}=\\frac{19}{8}$ .',
  },
  garden: 'في حوض طوله متر خُصّص $\\frac{1}{4}$ منه للطماطم و $\\frac{1}{6}$ للفلفل: المسافة $\\frac{1}{12}$ بين الشتلات تملأ الجزأين بـ $3$ ثمّ $2$ شتلات، أي $5$ شتلات من $\\frac{1}{12}$ م ، والطول المزروع $\\frac{5}{12}$ م ؛ والمسافة $\\frac{1}{10}$ لا تصلح.',
};
