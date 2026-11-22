/**
 * Le contenu du درس « التكبير والتصغير وأثره على المقادير الفضائية » (unité 14, manuel pp. 163–165) — données pures (aucun
 * JSX), au mot près pour le manuel ; chaque bloc cite son élément de docs/sources/4am/unit14/extraction.json :
 *   أستعدّ 3, 7, 8 (p. 163, module 0 — extraction › destinations › prep › items) ;
 *   نشاط 6 « التكبير - التصغير » (p. 165, module 1 — le pavé 5 × 4 × 3 réduit de 3/5) ;
 *   نشاط 5 « مقطع هرم بمستو » (p. 165, DOUBLON déclaré — destinations › act-5 › duplicatedIn : EFGH est la réduction de
 *   rapport 3/4 de ABCD ; module 2, avec la complétion de l'extraction : F, G, H définis).
 * LE SCAN S'ARRÊTE p. 169 : la معرفة « التكبير والتصغير » et ses طرائق manquent (extraction › discrepancies › act-6
 * missing_page). Tout ce qui les remplace est un AJOUT de la plateforme, déclaré : `addition('knowledge_formalization')`
 * (« معارف من المنصّة » : la définition, la propriété k / k² / k³, la section d'une pyramide ou d'un cône, les méthodes),
 * `addition('interaction_generation')` (les exemples et les questions de la plateforme), `addition('prerequisite_diagnostic')`
 * (les affirmations de « أستعدّ » qui ne sont pas du manuel). Aucune phrase de la plateforme ne porte `src()`.
 */
import { src, addition } from '../../_unit/unitMeta.js';

const KF = addition('knowledge_formalization');
const PLATFORM = addition('interaction_generation');
export const PLATFORM_SOURCE = PLATFORM;
export const KNOWLEDGE_SOURCE = KF;

/** نشاط 6 (p. 165) — « التكبير - التصغير », au mot près (extraction › act-6 › parts). */
export const ACT6 = {
  source: src('act-6', 165, 'أنشطة', 6),
  title: 'التكبير - التصغير',
  part1: '1) ABCDEFGH متوازي مستطيلات. حيث AB = 5cm ؛ BC = 4cm ؛ AE = 3cm. حجمه $\\mathcal{V}$ و $\\mathcal{A}$ المساحة الكلّية لأوجهه. أحسب $\\mathcal{V}$ و $\\mathcal{A}$ .',
  part2a: '2) أ) احسب أبعاد المُجسّم A′B′C′D′E′F′G′H′ الناتج عن تصغير متوازي المستطيلات ABCDEFGH بنسبة $\\dfrac{3}{5}$ ثُمّ مثّله باستعمال وسائل هندسية مناسبة.',
  part2b: 'ب) احسب حجمه $\\mathcal{V}\'$ و $\\mathcal{A}\'$ المساحة الكلّية لأوجهه. تحقّق أنّ: $\\mathcal{V}\' = \\left(\\dfrac{3}{5}\\right)^3\\mathcal{V}$ و $\\mathcal{A}\' = \\left(\\dfrac{3}{5}\\right)^2\\mathcal{A}$ .',
  // extraction › act-6 › answer (calculées, assertées par le builder)
  numbers: { a: 5, b: 4, c: 3, V: 60, A: 94, k: '3/5', a2: 3, b2: '2,4', c2: '1,8', V2: '12,96', A2: '33,84' },
};
/** Les réponses du نشاط 6 (extraction › act-6 › answer), écrites par la plateforme sous les questions. */
export const ACT6_LINES = {
  source: PLATFORM,
  v: '$\\mathcal{V} = 5 \\times 4 \\times 3 = 60\\,\\mathrm{cm}^3$',
  a: '$\\mathcal{A} = 2(5 \\times 4 + 4 \\times 3 + 5 \\times 3) = 2 \\times 47 = 94\\,\\mathrm{cm}^2$',
  dims: '$A\'B\' = \\dfrac{3}{5} \\times 5 = 3\\,\\mathrm{cm}$ ، $B\'C\' = \\dfrac{3}{5} \\times 4 = 2{,}4\\,\\mathrm{cm}$ ، $A\'E\' = \\dfrac{3}{5} \\times 3 = 1{,}8\\,\\mathrm{cm}$',
  v2: '$\\mathcal{V}\' = 3 \\times 2{,}4 \\times 1{,}8 = 12{,}96\\,\\mathrm{cm}^3$',
  a2: '$\\mathcal{A}\' = 2(7{,}2 + 4{,}32 + 5{,}4) = 2 \\times 16{,}92 = 33{,}84\\,\\mathrm{cm}^2$',
  checkV: '$\\left(\\dfrac{3}{5}\\right)^3 \\times 60 = \\dfrac{27}{125} \\times 60 = 12{,}96 = \\mathcal{V}\'$',
  checkA: '$\\left(\\dfrac{3}{5}\\right)^2 \\times 94 = \\dfrac{9}{25} \\times 94 = 33{,}84 = \\mathcal{A}\'$',
};

/** Ce que la مذكرة du professeur lit comme « وضعية الانطلاق ». */
export const ACTIVITY = {
  source: ACT6.source,
  title: 'نشاط 6 — التكبير - التصغير',
  situation: 'في لعبة بناء على الهاتف، متوازي مستطيلات مبني من مكعبات حرف كل منها 1 cm. نكبّره أو نصغّره بنسبة k: ماذا يحدث لأحرفه، ولمساحة أوجهه، ولحجمه؟',
  text: `${ACT6.part1} ${ACT6.part2a} ${ACT6.part2b}`,
  questions: [
    'احسب الحجم $\\mathcal{V}$ والمساحة الكلية $\\mathcal{A}$ لمتوازي المستطيلات الذي أبعاده 5 cm و 4 cm و 3 cm.',
    'احسب أبعاد المجسم الناتج عن تصغيره بنسبة $\\dfrac{3}{5}$ .',
    'احسب $\\mathcal{V}\'$ و $\\mathcal{A}\'$ وتحقّق أنّ $\\mathcal{V}\' = \\left(\\dfrac{3}{5}\\right)^3\\mathcal{V}$ و $\\mathcal{A}\' = \\left(\\dfrac{3}{5}\\right)^2\\mathcal{A}$ .',
  ],
  closing: 'في تصغير بنسبة $\\dfrac{3}{5}$ ضُربت الأحرف في $\\dfrac{3}{5}$ ، والمساحة الكلية في $\\left(\\dfrac{3}{5}\\right)^2$ ، والحجم في $\\left(\\dfrac{3}{5}\\right)^3$ .',
};

/** نشاط 5 (p. 165) — « مقطع هرم بمستو », DOUBLON déclaré (l'activité d'entrée est celle du درس « المقاطع المستوية »). */
export const ACT5 = {
  source: src('act-5', 165, 'أنشطة', 5),
  title: 'مقطع هرم بمستو',
  intro: 'SABCD هرم منتظم قاعدته المربع ABCD حيث AB = 4cm. E نقطة من الحرف [SA] حيث $SE = \\dfrac{3}{4}SA$ . (P) هو المستوي الموازي للقاعدة و الذي يشمل النقطة E. نقبل أنّ (AD) // (EH) و (BC) // (FG) و (DC) // (HG) و (AB) // (EF) و (EG) // (AC).',
  part1: '1) احسب EH ؛ HG ؛ FG ؛ EF.',
  // extraction › discrepancies › act-5 (completion) : F, G, H ne sont définis que sur la figure du manuel
  completion: 'أكملت المنصّة نصّ الكتاب: F و G و H هي نقط تقاطع المستوي (P) مع الأحرف [SB] و [SC] و [SD] على الترتيب.',
  answer1: 'في المثلث SAB: E ∈ [SA] و F ∈ [SB] و (EF) // (AB)، فحسب خاصية طالس $\\dfrac{EF}{AB} = \\dfrac{SE}{SA} = \\dfrac{3}{4}$ ، أي $EF = 3\\,\\mathrm{cm}$ ؛ وبنفس الطريقة $EH = FG = HG = 3\\,\\mathrm{cm}$ .',
  reduction: 'المقطع EFGH تصغير للقاعدة ABCD بنسبة $\\dfrac{3}{4}$ ؛ مساحته $9 = \\left(\\dfrac{3}{4}\\right)^2 \\times 16$ بالسنتيمتر المربع.',
};

/** معارف (DÉCLARÉES : la page du manuel manque) — la définition, la propriété, la section d'une pyramide / d'un cône. */
export const KNOW = {
  source: KF,
  title: 'التكبير والتصغير',
  definition: 'تعريف: k عدد موجب تماما. نقول إنّ مجسّما $(S\')$ تكبير أو تصغير لمجسّم $(S)$ بالنسبة $k$ إذا حصلنا على كل طول من أطوال $(S\')$ بضرب الطول الموافق له في $(S)$ في نفس العدد $k$ . إذا كان $k > 1$ فهو تكبير، وإذا كان $0 < k < 1$ فهو تصغير.',
  // la fraction de MOTS (WordFraction, jamais \text arabe dans KaTeX)
  ratioNum: 'طول في المجسّم الناتج',
  ratioDen: 'الطول الموافق له في المجسّم الأصلي',
  ratioWords: 'النسبة k هي حاصل قسمة طول في المجسّم الناتج على الطول الموافق له في المجسّم الأصلي.',
  property: 'خاصية: في تكبير أو تصغير بالنسبة $k$ : تُضرب الأطوال في $k$ ، وتُضرب المساحات في $k^2$ ، وتُضرب الحجوم في $k^3$ .',
  formulas: '$a\' = k \\times a$ ؛ $\\mathcal{A}\' = k^2 \\times \\mathcal{A}$ ؛ $\\mathcal{V}\' = k^3 \\times \\mathcal{V}$',
  shape: 'ملاحظة: التكبير والتصغير يحافظان على شكل المجسّم (الزوايا، التوازي، التعامد): مكعب يعطي مكعبا، وكرة تعطي كرة.',
  section: 'مقطع هرم أو مخروط دوران بمستوٍ يوازي قاعدته هو تصغير لقاعدته؛ والهرم (أو المخروط) الصغير الذي رأسه S تصغير للهرم (أو المخروط) الأصلي، نسبته $k = \\dfrac{SE}{SA}$ (أو نسبة الارتفاعين).',
};

/** Un exemple de la plateforme (la boule du درس « مساحة الكرة وحجم الجلة » : un rappel de P2 de ce درس-là). */
export const EXAMPLE_BALL = {
  source: PLATFORM,
  text: 'مثال: كرة يد نصف قطرها $9\\,\\mathrm{cm}$ ، نكبّرها بالنسبة $k = 2$ فيصير نصف قطرها $18\\,\\mathrm{cm}$ .',
  lines: [
    'المساحة: $\\mathcal{A} = 4\\pi \\times 9^2 = 324\\pi$ ، و $\\mathcal{A}\' = 2^2 \\times 324\\pi = 1296\\pi = 4\\pi \\times 18^2$ .',
    'الحجم: $\\mathcal{V} = \\dfrac{4}{3}\\pi \\times 9^3 = 972\\pi$ ، و $\\mathcal{V}\' = 2^3 \\times 972\\pi = 7776\\pi = \\dfrac{4}{3}\\pi \\times 18^3$ .',
  ],
};

/** طرائق (DÉCLARÉES) — chaque méthode : l'exercice, la solution ligne à ligne, la règle (MethodSteps). */
export const METHOD_K = {
  source: KF,
  exercise: 'تمرين 1: ارتفاع مقام الشهيد في الحقيقة $92\\,\\mathrm{m}$ ، وارتفاع مجسّم له طبعه نادي الثانوية بطابعة ثلاثية الأبعاد $46\\,\\mathrm{cm}$ . ما نسبة التصغير؟ وما ارتفاع المجسّم لو طُبع بالنسبة $\\dfrac{1}{100}$ ؟',
  solution: [
    'نكتب الطولين بنفس الوحدة: $92\\,\\mathrm{m} = 9200\\,\\mathrm{cm}$ .',
    '$k = \\dfrac{46}{9200} = \\dfrac{1}{200}$ ، و $k < 1$ : تصغير.',
    'بالنسبة $\\dfrac{1}{100}$ : الارتفاع $\\dfrac{1}{100} \\times 9200 = 92\\,\\mathrm{cm}$ .',
  ],
  rule: 'طريقة: لإيجاد نسبة التكبير أو التصغير نقسم طولا من المجسّم الناتج على الطول الموافق له في المجسّم الأصلي، بنفس الوحدة.',
};
export const METHOD_ROOTS = {
  source: KF,
  exercise: 'تمرين 2: (1) مكعّب مساحته الكلية $150\\,\\mathrm{cm}^2$ ، وتصغيره مساحته الكلية $54\\,\\mathrm{cm}^2$ . (2) جلّة حجمها $250\\,\\mathrm{cm}^3$ ، وتصغيرها حجمه $16\\,\\mathrm{cm}^3$ . أوجد نسبة التصغير في كل حالة.',
  solution: [
    '(1) المساحات تُضرب في $k^2$ : $k^2 = \\dfrac{54}{150} = \\dfrac{9}{25}$ ، إذن $k = \\sqrt{\\dfrac{9}{25}} = \\dfrac{3}{5}$ .',
    '(2) الحجوم تُضرب في $k^3$ : $k^3 = \\dfrac{16}{250} = \\dfrac{8}{125}$ ، و $\\dfrac{2}{5} \\times \\dfrac{2}{5} \\times \\dfrac{2}{5} = \\dfrac{8}{125}$ ، إذن $k = \\dfrac{2}{5}$ .',
    'تحقّق: $\\left(\\dfrac{3}{5}\\right)^2 \\times 150 = 54$ و $\\left(\\dfrac{2}{5}\\right)^3 \\times 250 = 16$ .',
  ],
  rule: 'طريقة: من نسبة مساحتين نأخذ الجذر التربيعي ($k^2 = q$ يعطي $k = \\sqrt{q}$)، ومن نسبة حجمين نبحث عن العدد الذي مكعّبه هذه النسبة ($k^3 = q$)؛ لا نقسم نسبة المساحات أو الحجوم على 2 أو على 3.',
};
export const METHOD_IMAGE = {
  source: KF,
  exercise: 'تمرين 3: خزّان مائي على شكل متوازي مستطيلات سعته $12\\,\\mathrm{m}^3$ ومساحة أوجهه الكلية $32\\,\\mathrm{m}^2$ . نبني خزّانا آخر هو تكبير له بالنسبة $\\dfrac{3}{2}$ . احسب سعة الخزّان الجديد ومساحة أوجهه.',
  solution: [
    'لا نحتاج إلى الأبعاد: الحجوم تُضرب في $k^3 = \\left(\\dfrac{3}{2}\\right)^3 = \\dfrac{27}{8}$ .',
    '$\\mathcal{V}\' = \\dfrac{27}{8} \\times 12 = 40{,}5\\,\\mathrm{m}^3$ .',
    'المساحات تُضرب في $k^2 = \\dfrac{9}{4}$ : $\\mathcal{A}\' = \\dfrac{9}{4} \\times 32 = 72\\,\\mathrm{m}^2$ .',
  ],
  rule: 'طريقة: لحساب مقادير المجسّم الناتج نضرب الأطوال في $k$ والمساحات في $k^2$ والحجوم في $k^3$ ، ولا نعيد حساب كل شيء من البداية.',
};

/** Les erreurs que la leçon corrige (le « لماذا » vient de la معرفة) — citées par la carte (knowledgeGraph.js). */
export const MISTAKES = {
  volumeK: {
    wrong: 'في تكبير بالنسبة 2 يتضاعف الحجم: مكعّب حرفه $1\\,\\mathrm{cm}$ يصير حجمه $2\\,\\mathrm{cm}^3$ .',
    right: 'المكعّب الذي حرفه $2\\,\\mathrm{cm}$ مبني من $2 \\times 2 \\times 2 = 8$ مكعبات حرف كل منها $1\\,\\mathrm{cm}$ : الحجم يُضرب في $2^3 = 8$ .',
  },
  plusOne: {
    wrong: 'إضافة $1\\,\\mathrm{cm}$ إلى كل حرف من متوازي المستطيلات (5 و 4 و 3) تكبير له.',
    right: 'الأبعاد 6 و 5 و 4 تعطي النسب $\\dfrac{6}{5}$ و $\\dfrac{5}{4}$ و $\\dfrac{4}{3}$ ، وهي مختلفة: ليس تكبيرا، شكل المجسّم تغيّر.',
  },
  rootHalf: {
    wrong: 'إذا ضُربت المساحة في $\\dfrac{9}{25}$ فإن النسبة $k = \\dfrac{9}{25}$ .',
    right: '$k^2 = \\dfrac{9}{25}$ ، إذن $k = \\dfrac{3}{5}$ : نأخذ الجذر التربيعي لنسبة المساحتين.',
  },
};

/**
 * « أستعدّ » — les items 3, 7, 8 du manuel (p. 163 ; extraction › destinations › prep › items) et trois affirmations de la
 * plateforme sur les prérequis du propriétaire : l'aire totale d'un pavé (p1), le rapport d'agrandissement d'un triangle
 * (p2, درس « خاصية طالس »), la section d'une pyramide (p3, درس « المقاطع المستوية »). Une affirmation par compétence ; aucune
 * n'utilise les nombres du نشاط 6 (5, 4, 3, 3/5). Les deux réponses existent.
 */
const PREP_ADD = addition('prerequisite_diagnostic');
export const PREP_ITEMS = [
  { n: '3', skill: 'talis', figure: 'prep3', text: 'في الشكل المقابل، المثلثان ABC و ADE في وضعية طالس. إذن $\\dfrac{DE}{6} = \\dfrac{3}{5}$ .', answer: true, why: '(DE) و (BC) عموديان على (AB) فهما متوازيان، و D ∈ [AB] و E ∈ [AC]: $\\dfrac{AD}{AB} = \\dfrac{DE}{BC}$ أي $\\dfrac{3}{5} = \\dfrac{DE}{6}$ .', source: src('prep', 163, 'أستعدّ', 3) },
  { n: '7', skill: 'makhrut', text: 'حجم مخروط دوران نصف قطر قاعدته $2\\,\\mathrm{cm}$ و ارتفاعه $2\\,\\mathrm{cm}$ هو $4\\pi\\,\\mathrm{cm}^3$ .', answer: false, why: '$V = \\dfrac{1}{3}\\pi r^2 h = \\dfrac{1}{3}\\pi \\times 4 \\times 2 = \\dfrac{8}{3}\\pi\\,\\mathrm{cm}^3$ لا $4\\pi\\,\\mathrm{cm}^3$ .', source: src('prep', 163, 'أستعدّ', 7) },
  { n: '8', skill: 'haram', text: 'حجم هرم قاعدته مربع طول ضلعه $3\\,\\mathrm{cm}$ و ارتفاعه $3\\,\\mathrm{cm}$ هو $9\\,\\mathrm{cm}^3$ .', answer: true, why: '$V = \\dfrac{1}{3} \\times 3^2 \\times 3 = 9\\,\\mathrm{cm}^3$ .', source: src('prep', 163, 'أستعدّ', 8) },
  { n: 'p1', skill: 'masaha', text: 'المساحة الكلية لأوجه متوازي مستطيلات أبعاده $2\\,\\mathrm{cm}$ و $3\\,\\mathrm{cm}$ و $6\\,\\mathrm{cm}$ هي $36\\,\\mathrm{cm}^2$ .', answer: false, why: 'للمتوازي ستة أوجه، كل وجهين متقابلين متقايسان: $2(2 \\times 3 + 3 \\times 6 + 2 \\times 6) = 2 \\times 36 = 72\\,\\mathrm{cm}^2$ لا $36\\,\\mathrm{cm}^2$ (نُسي العدد 2).', source: PREP_ADD },
  { n: 'p2', skill: 'nisba', text: 'المثلث الذي أطوال أضلاعه $6$ و $8$ و $10$ تكبير للمثلث الذي أطوال أضلاعه $3$ و $4$ و $5$ بالنسبة $2$ .', answer: true, why: 'كل ضلع ضُرب في نفس العدد: $\\dfrac{6}{3} = \\dfrac{8}{4} = \\dfrac{10}{5} = 2$ ، و $2 > 1$ : تكبير.', source: PREP_ADD },
  { n: 'p3', skill: 'maqta', text: 'مقطع هرم قاعدته مربع ضلعه $8\\,\\mathrm{cm}$ بمستو يوازي قاعدته ويمرّ بمنتصف ارتفاعه مربع ضلعه $8\\,\\mathrm{cm}$ .', answer: false, why: 'المقطع الموازي للقاعدة تصغير لها: في منتصف الارتفاع النسبة $\\dfrac{1}{2}$ ، فالمقطع مربع ضلعه $4\\,\\mathrm{cm}$ .', source: PREP_ADD },
];

/** Les deux niveaux du lab (levels.js) : مبتدئ = le cube d'arête 1 (plateforme) ; متقدم = le نشاط 6. */
export const LAB = {
  beginner: { source: PLATFORM, numbers: { dims: [1, 1, 1], ks: [2, 3] } },
  advanced: { source: ACT6.source, numbers: { dims: [5, 4, 3], ks: ['3/5', 2] } },
};
