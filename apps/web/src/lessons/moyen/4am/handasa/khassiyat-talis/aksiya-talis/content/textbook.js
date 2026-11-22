/**
 * Le contenu du MANUEL pour le درس « الخاصية العكسية لخاصية طالس وإثبات التوازي » — données pures (aucun JSX),
 * au mot près ; chaque bloc cite son élément de docs/sources/4am/unit9/extraction.json (destinations :
 * نشاط 2 p. 105 → M1 ; معارف 3 p. 108 → M2, avec ملاحظة 1 de معارف 1 p. 106 déclarée en double ; طرائق « إثبات
 * توازي (أو عدم توازي) مستقيمين » p. 109 → M3 ; QCM item 3 p. 112 → M5). Ce que la plateforme ajoute est déclaré
 * (`addition(…)`) : jamais présenté comme le manuel. Aucune coquille dans ces éléments (extraction : `verified`).
 */
import { src, addition } from '../../_unit/unitMeta.js';

const PLATFORM = addition('interaction_generation');

/** نشاط 2 (p. 105) — « الخاصية العكسية لخاصية طالس ». */
export const ACTIVITY = {
  source: src('act-2', 105, 'أنشطة', 2),
  title: 'الخاصية العكسية لخاصية طالس',
  situation: 'في الشكل المقابل، (d) و (d′) مستقيمان متقاطعان في نقطة A. B نقطة من (d) و C نقطة من (d′). طلب الأستاذ من تلاميذه تعيين نقطتين B′ من (d) و C′ من (d′) بحيث $\\dfrac{AB\'}{AB} = \\dfrac{AC\'}{AC} = \\dfrac{1}{3}$ . إليك الأشكال 1 ، 2 ، 3 المُنجزة من طرف ثلاثة تلاميذ.',
  questions: [
    '1) أ) اشرح توافق الأشكال 1، 2 و 3 مع الشروط السابقة.',
    'ب) هل في كل شكل من الأشكال 1، 2 و 3، (BC) و (B′C′) متوازيان؟ (يمكنك التحقق باستعمال الأدوات الهندسية).',
    '2) انقل وأتمم «النقط A، B، B′ تقع في استقامية والنقط A، C، C′ تقع أيضا في استقامية وكذلك النقط A، B، B′ مرتبة بنفس ترتيب النقط A، C، C′. إذا كان $\\dfrac{\\ldots}{AB} = \\dfrac{\\ldots}{AC}$ فإن المستقيمين (BC) و (B′C′) …». هذا النص يسمى «الخاصية العكسية لخاصية طالس».',
  ],
  // le texte complété (la plateforme le remplit avec les réponses calculées de l'extraction : answer.statement)
  statement: 'النقط A، B، B′ تقع في استقامية والنقط A، C، C′ تقع أيضا في استقامية وكذلك النقط A، B، B′ مرتبة بنفس ترتيب النقط A، C، C′. إذا كان $\\dfrac{AB\'}{AB} = \\dfrac{AC\'}{AC}$ فإن المستقيمين (BC) و (B′C′) متوازيان.',
  remark: 'النقط A، B، B′ مرتبة بنفس ترتيب النقط A، C، C′ يعني أيضا أن موقع B′ بالنسبة إلى A و B يماثل موقع C′ بالنسبة إلى A و C. يمكن التعبير عن هذه الوضعية بتنظيم الرؤوس كما يلي:',
  tables: [['A', 'B', 'B′', 'A', 'C', 'C′'], ['B', 'B′', 'A', 'C', 'C′', 'A'], ['B', 'A', 'B′', 'C', 'A', 'C′']],
  tail: '… إلخ',
  answer: {
    a: 'في الأشكال الثلاثة: B′ من (d) و C′ من (d′) و $AB\' = \\dfrac{1}{3}AB$ و $AC\' = \\dfrac{1}{3}AC$ .',
    b: { 1: 'متوازيان', 2: 'متوازيان', 3: 'غير متوازيين — النقط ليست مرتبة بنفس الترتيب' },
  },
};

/** معارف 3 (p. 108) — la propriété, ses deux traductions, la ملاحظة, l'مثال. */
export const KNOWLEDGE3 = {
  source: src('know-3', 108, 'معارف', 3),
  title: 'الخاصية العكسية لخاصية طالس',
  property: [
    '(d) و (d′) مستقيمان متقاطعان في النقطة A.',
    'B و B′ نقطتان من (d) تختلفان عن A.',
    'C و C′ نقطتان من (d′) تختلفان عن A.',
    'إذا كان $\\dfrac{AB\'}{AB} = \\dfrac{AC\'}{AC}$ وكانت النقط A، B، B′ و النقط A، C، C′ مرتبة بنفس الترتيب فإن المستقيمين (BC) و (B′C′) متوازيان.',
  ],
  figuresText: 'يمكن ترجمة هذه الخاصية بإحدى الوضعيتين التاليتين:',
  remark: 'في الشكل المقابل، لدينا $\\dfrac{AB\'}{AB} = \\dfrac{AC\'}{AC} = \\dfrac{1}{2}$ . النقط A، B، B′ تقع على استقامة واحدة والنقط A، C، C′ تقع أيضا على استقامة واحدة. هذه النقط ليست مرتبة بنفس الترتيب. ينتج أن المستقيمين (BC) و (B′C′) غير متوازيين.',
  example: [
    'في الشكل المقابل لدينا $\\dfrac{OM}{OR} = \\dfrac{3}{2{,}4} = 1{,}25$ و $\\dfrac{ON}{OP} = \\dfrac{5}{4} = 1{,}25$ إذن $\\dfrac{OM}{OR} = \\dfrac{ON}{OP}$ .',
    'و بما أن النقط N، P، O و النقط M، R، O مرتبة بنفس الترتيب فإن (MN)//(PR).',
  ],
};

/** معارف 1, ملاحظة 1 (p. 106) — déclarée en double (destinations › know-1 › duplicatedIn). */
export const KNOW1_REMARK1 = {
  source: src('know-1', 106, 'معارف', 1),
  text: '(BM) و (CN) مستقيمان متقاطعان في النقطة A. يكفي عدم تساوي نسبتين من النسب $\\dfrac{AM}{AB}$ ، $\\dfrac{AN}{AC}$ و $\\dfrac{MN}{BC}$ للقول أنّ المستقيمين (MN) و (BC) غير متوازيين.',
  answer: '$\\dfrac{AM}{AB} = \\dfrac{2}{3}$ و $\\dfrac{AN}{AC} = \\dfrac{1}{2}$ : النسبتان مختلفتان، (MN) و (BC) غير متوازيين.',
  // la raison, telle que la طريقة p. 109 l'écrit (« لو كان … لكان … حسب خاصية طالس »)
  why: 'لو كان المستقيمان متوازيين لكانت النسب متساوية حسب خاصية طالس.',
};

/** طرائق (p. 109) — « إثبات توازي (أو عدم توازي) مستقيمين » : deux parties révélées ligne à ligne. */
export const METHOD = {
  source: src('method-parallel', 109, 'طرائق'),
  title: 'إثبات توازي (أو عدم توازي) مستقيمين',
  exercise: 'في الشكل المقابل نُعطى: AB = 3,2cm ، AD = 3,5cm ، DC = 1,8cm ، DF = 1,5cm ، AE = 4,6cm ، BD = 4,2cm. 1) بيّن أنّ المستقيمين (AB) و (CF) متوازيان؟ 2) هل المستقيمان (BD) و (EF) متوازيان؟',
  part1: [
    '1) • النقاط A، D، F والنقاط B، D، C في استقامية وبنفس الترتيب.',
    '• $\\dfrac{DA}{DF} = \\dfrac{3{,}5}{1{,}5}$ و $\\dfrac{DB}{DC} = \\dfrac{4{,}2}{1{,}8}$ ولدينا $3{,}5 \\times 1{,}8 = 6{,}3$ و $1{,}5 \\times 4{,}2 = 6{,}3$ إذن $\\dfrac{DA}{DF} = \\dfrac{DB}{DC}$ .',
    '• على المستقيمين (CB) و (FA) المتقاطعين في النقطة D، النقاط A، D، F من جهة والنقاط B، D، C من جهة أخرى في استقامية وبنفس الترتيب و $\\dfrac{DA}{DF} = \\dfrac{DB}{DC}$ فحسب الخاصية العكسية لطالس نستنتج أنّ (CF)//(AB).',
  ],
  part2: [
    '2) • النقاط E، B، A والنقاط F، D، A في استقامية وبنفس الترتيب.',
    '• $\\dfrac{AB}{AE} = \\dfrac{3{,}2}{4{,}6}$ و $\\dfrac{AD}{AF} = \\dfrac{3{,}5}{3{,}5 + 1{,}5} = \\dfrac{3{,}5}{5}$ ولدينا $3{,}2 \\times 5 = 16$ و $4{,}6 \\times 3{,}5 = 16{,}1$ إذن $\\dfrac{AB}{AE} \\neq \\dfrac{AD}{AF}$ .',
    '• لو كان المستقيمان (BD) و (EF) متوازيين لكان $\\dfrac{AB}{AE} = \\dfrac{AD}{AF}$ حسب خاصية طالس، لكن المساواة خاطئة، إذن المستقيمان (BD) و (EF) غير متوازيين.',
  ],
  // la marche à suivre, écrite par la plateforme à partir des lignes du manuel (déclarée)
  ruleSource: addition('knowledge_formalization'),
  ruleParallel: [
    'لإثبات أن مستقيمين متوازيان: نتحقق أن النقط في استقامية وبنفس الترتيب، ثم نحسب النسبتين ونقارنهما (بالجداء المتصالب)، ثم نطبّق الخاصية العكسية لخاصية طالس.',
  ],
  ruleNotParallel: [
    'لإثبات أن مستقيمين غير متوازيين: نجد نسبتين غير متساويتين، ثم نستدل بالخلف: لو كانا متوازيين لتساوت النسبتان حسب خاصية طالس.',
  ],
};

/** Un exercice de la plateforme pour s'exercer à la طريقة (déclaré). */
export const METHOD_PRACTICE = {
  source: PLATFORM,
  text: '(d) و (d′) مستقيمان متقاطعان في O. النقط E و O و G على استقامة (O بين E و G)، والنقط F و O و H على استقامة (O بين F و H). OE = 2,4 ، OG = 3,6 ، OF = 2 ، OH = 3.',
  // 2,4 × 3 = 7,2 = 3,6 × 2 : OE/OG = OF/OH = 2/3 et le même ordre ⇒ (EF)//(GH)
  second: 'نغيّر طولا واحدا: OH = 3,2 (والباقي كما هو).',
};

/**
 * « أستعدّ » — cinq affirmations de la PLATEFORME (les items 1–5 du manuel vont à la leçon 1) : l'égalité de deux
 * fractions par le produit en croix (1, 2), l'ordre de points alignés (3), la propriété de Thalès directe de la
 * leçon 1 (4), la droite des milieux (5), le théorème de Pythagore (6, pour l'exercice 14). Les deux réponses
 * existent ; aucun nombre de نشاط 2.
 */
const PREP = addition('prerequisite_diagnostic');
export const PREP_ITEMS = [
  {
    source: PREP, skill: 'kasr', answer: true,
    text: 'لدينا $\\dfrac{4}{6} = \\dfrac{10}{15}$ .',
    why: '$4 \\times 15 = 60$ و $6 \\times 10 = 60$ : الجداءان المتصالبان متساويان، فالكسران متساويان.',
  },
  {
    source: PREP, skill: 'kasr', answer: false,
    text: 'لدينا $\\dfrac{3{,}2}{4} = \\dfrac{4}{5{,}5}$ .',
    why: '$3{,}2 \\times 5{,}5 = 17{,}6$ و $4 \\times 4 = 16$ : الجداءان المتصالبان مختلفان، فالكسران غير متساويين.',
  },
  {
    source: PREP, skill: 'tartib', answer: false,
    text: 'النقط M، O، N على استقامة واحدة و O بين M و N. إذن M و N في الجهة نفسها من O.',
    why: 'O بين M و N يعني أن M و N في جهتين مختلفتين من O.',
  },
  {
    source: PREP, skill: 'talis', answer: true,
    text: 'ABC مثلث، M من [AB] و N من [AC] و (MN)//(BC). إذا كان AM = 2 و AB = 5 و AC = 10 فإن AN = 4.',
    why: 'حسب خاصية طالس $\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$ أي $\\dfrac{2}{5} = \\dfrac{AN}{10}$ ومنه $AN = 4$ .',
  },
  {
    source: PREP, skill: 'muntasaf', answer: false,
    text: 'ABC مثلث، I منتصف [AB] و J منتصف [AC]. ينتج أن المستقيمين (IJ) و (BC) متقاطعان.',
    why: 'المستقيم الذي يشمل منتصفي ضلعين في مثلث يوازي حامل الضلع الثالث: (IJ)//(BC).',
  },
  {
    source: PREP, skill: 'fithaghuras', answer: true,
    text: 'ABC مثلث قائم في A حيث AB = 6 و AC = 8. إذن BC = 10.',
    why: 'حسب خاصية فيثاغورس $BC^2 = 6^2 + 8^2 = 36 + 64 = 100$ ومنه $BC = 10$ .',
  },
];

/** أؤكّد تعلّماتي, item 3 (p. 112) — dans l'إختبار أولي (destinations › qcm › duplicatedIn › items [3]). */
export const QCM3 = {
  source: src('qcm', 112, 'أؤكّد تعلّماتي', 3),
  text: 'في الشكل الآتي، ينتج ………',
  options: ['(EF) لا يوازي (BC)', '$(BC) \\parallel (EF)$', '$BC = \\dfrac{1}{2}EF$'],
  correct: 0,
  explain: '$\\dfrac{AB}{AE} = \\dfrac{11}{33} = \\dfrac{1}{3}$ و $\\dfrac{AC}{AF} = \\dfrac{15}{60} = \\dfrac{1}{4}$ : النسبتان مختلفتان، فالمستقيمان غير متوازيين (ولو كانا متوازيين لكان $BC = \\dfrac{1}{3}EF$ لا $\\dfrac{1}{2}EF$).',
};

/** Les props du laboratoire du module 1 (les deux niveaux de levels.js). */
export const LAB = {
  beginner: { AB: 6, AC: 9, mode: 'ladder' },
  advanced: { AB: 9, AC: 12, ratio: '1/3', mode: 'crossing' },
};
