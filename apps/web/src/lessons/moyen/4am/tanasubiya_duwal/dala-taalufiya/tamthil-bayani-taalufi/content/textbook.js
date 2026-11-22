/**
 * Le contenu du MANUEL pour le درس 2 « التمثيل البياني لدالة تآلفية وقراءته بيانيًا » — données pures (aucun
 * JSX), au mot près ; chaque bloc cite son élément de docs/sources/4am/unit7/extraction.json (destinations :
 * prep items 6–7 → module 0 ; act-3 → module 1). Le manuel fourni (pp. 77–79) n'a NI معارف NI طرائق NI
 * exercices : tout ce qui formalise, toute méthode et tout exercice sont écrits par la plateforme et déclarés
 * (`addition(…)`), dans le vocabulaire du manuel (« الترتيب عند المبدأ », « معامل التوجيه »).
 */
import { src, addition } from '../../_unit/unitMeta.js';

/**
 * نشاط 3 (p. 78) — « تمثيل دالة تآلفية ». La question 2-أ imprime « (1 ; 0) » (couple inversé à l'impression :
 * f(1) = 5/2 ≠ 0) : la leçon affiche (0 ; 1), avec UNE ligne discrète (extraction › act-3 › correction).
 */
export const ACTIVITY = {
  source: src('act-3', 78, 'أنشطة', 3),
  title: 'تمثيل دالة تآلفية',
  text: 'الشكل المقابل هو تمثيل الدّالة الخطية $g$ حيث $g(x) = \\dfrac{3}{2}x$ . أعد إنشاء المستقيم $(d)$ في معلم متعامد ومتجانس مبدؤه O حيث الوحدة هي 1cm.',
  questions: [
    '1) $f$ هي الدّالة التآلفية حيث $f(x) = \\dfrac{3}{2}x + 1$ و $(d\')$ تمثيلها البياني. أ) ما هو ترتيب النقطة من $(d)$ التي فاصلتها 2؟ استنتج دون حساب ترتيب النقطة من $(d\')$ التي فاصلتها 2.',
    'ب) بشكل عام، كيف نجد ترتيب نقطة من $(d\')$ انطلاقا من نقطة من $(d)$ التي لها نفس الفاصلة؟',
    '2) أ) برهن أنّ النقطة التي إحداثياها $(0 ; 1)$ تنتمي إلى المستقيم $(d\')$ .',
    'ب) بشكل عام، برهن أنّ النقطة التي إحداثياها $(0 ; b)$ تنتمي إلى المستقيم الممثل للدالة $f$ حيث $f(x) = ax + b$ .',
  ],
  // « نسمّي … » — la phrase du manuel qui NOMME b.
  naming: 'نسمّي العدد $b$ في عبارة الدالة $f$ حيث $f(x) = ax + b$ الترتيب عند المبدأ.',
  correction: 'صحّحت المنصّة خطأً مطبعيًا: في الكتاب «$(1 ; 0)$»، والمقصود $(0 ; 1)$ — لأنّ $f(1) = \\dfrac{5}{2} \\neq 0$ ، والسؤال ب) يكتب $(0 ; b)$ .',
  a: '3/2',
  b: '1',
};

/** Les calculs du نشاط 3 écrits par la plateforme (le livre les demande sans les écrire). */
export const ACTIVITY_LINES = {
  source: addition('interaction_generation'),
  g2: '$g(2) = \\dfrac{3}{2} \\times 2 = 3$ : النقطة من $(d)$ التي فاصلتها 2 ترتيبها $3$ .',
  f2: '$f(2) = g(2) + 1 = 3 + 1 = 4$ : النقطة من $(d\')$ التي فاصلتها 2 ترتيبها $4$ ، دون حساب جديد.',
  rule: 'لكل عدد $x$ : $f(x) = \\dfrac{3}{2}x + 1 = g(x) + 1$ . نجد ترتيب نقطة من $(d\')$ بإضافة $1$ إلى ترتيب نقطة $(d)$ التي لها نفس الفاصلة.',
  p01: '$f(0) = \\dfrac{3}{2} \\times 0 + 1 = 1$ : ترتيب النقطة ذات الفاصلة $0$ من $(d\')$ هو $1$ ، إذن النقطة $(0 ; 1)$ تنتمي إلى $(d\')$ .',
  general: '$f(0) = a \\times 0 + b = b$ : النقطة $(0 ; b)$ تنتمي إلى المستقيم الممثّل للدالة $f$ .',
};

/** L'accroche (le monde du lab) — déclarée. */
export const HOOK = {
  source: addition('interaction_generation'),
  headline: 'منحدر حديقة التزلّج: من أين يبدأ؟',
  text: 'في حديقة التزلّج، منحدر يبدأ من الأرض ويصعد بانتظام، ومنحدر آخر مثله تمامًا لكنه مبنيّ على قاعدة ارتفاعها 1. في هذا النشاط الأرض هي المبدأ O، والمنحدران هما $(d)$ و $(d\')$ .',
};

/**
 * La seconde rampe du niveau متقدم (levels.js : find = '-1/2:3') — une droite dont la formule est cachée,
 * que l'élève lit dans le second laboratoire. Plateforme.
 */
export const RAMP2 = {
  source: addition('interactive_example'),
  a: '-1/2',
  b: '3',
  text: 'في المختبر الثاني (المستوى المتقدّم) منحدر ثانٍ $(D)$ عبارته مخفية: اجعل مستقيمك ينطبق عليه.',
};

/**
 * معارف — ÉCRITES PAR LA PLATEFORME (le manuel fourni n'en contient pas) : la propriété, les noms des deux
 * nombres, la marche et le sens, le cas b = 0, et l'exemple 2x − 3.
 */
export const KNOWLEDGE = {
  source: addition('knowledge_formalization'),
  title: 'التمثيل البياني لدالة تآلفية',
  property: 'في معلم، التمثيل البياني للدالة التآلفية $f : x \\longmapsto ax + b$ مستقيم يقطع محور التراتيب في النقطة $(0 ; b)$ ، ويوازي التمثيل البياني للدالة الخطية $x \\longmapsto ax$ . نقول إنّ $y = ax + b$ معادلة لهذا المستقيم.',
  names: 'العدد $a$ هو معامل التوجيه للمستقيم، والعدد $b$ هو الترتيب عند المبدأ.',
  slope: 'عندما نتقدّم على المستقيم وحدة واحدة إلى اليمين يتغيّر الترتيب بـ $a$ : إذا كان $a > 0$ فالمستقيم «يصعد» من اليسار إلى اليمين، وإذا كان $a < 0$ فهو «ينزل»، وإذا كان $a = 0$ فهو يوازي محور الفواصل (دالة ثابتة).',
  special: 'إذا كان $b = 0$ فالدالة خطية وتمثيلها يشمل المبدأ O ؛ وإذا كان $b \\neq 0$ فالمستقيم لا يشمل المبدأ.',
  example: 'مثال: تمثيل الدالة $f : x \\longmapsto 2x - 3$ مستقيم يقطع محور التراتيب في $(0 ; -3)$ ، ويصعد $2$ كلما تقدّمنا وحدة إلى اليمين: يشمل $(1 ; -1)$ و $(2 ; 1)$ .',
};

/** طريقة (plateforme) — رسم تمثيل دالة تآلفية بنقطتين. */
export const METHOD_DRAW = {
  source: addition('knowledge_formalization'),
  title: 'تمثيل دالة تآلفية بيانيا',
  exercise: 'في معلم متعامد ومتجانس ارسم المستقيم $(\\Delta)$ الذي يمثّل الدالة التآلفية $h$ حيث $h(x) = -2x + 4$ .',
  solution: [
    '$h(0) = 4$ : $(\\Delta)$ يشمل النقطة $A(0 ; 4)$ .',
    '$h(3) = -2 \\times 3 + 4 = -2$ : $(\\Delta)$ يشمل النقطة $B(3 ; -2)$ .',
    'نرسم المستقيم $(AB)$ ، ونتحقّق: من $A$ نتقدّم وحدة إلى اليمين فينزل المستقيم $2$ ، لأنّ $a = -2$ .',
  ],
  rule: 'التمثيل البياني لدالة تآلفية مستقيم، فلإنشائه يكفي تعيين نقطتين منه: نحسب صورتي عددين نختارهما (العدد $0$ يعطي مباشرة النقطة $(0 ; b)$).',
};

/** طريقة (plateforme) — قراءة a و b على التمثيل. La figure : (D) par (0 ; 2) et (2 ; −1). */
export const METHOD_AB = {
  source: addition('knowledge_formalization'),
  title: 'قراءة عبارة دالة تآلفية على تمثيلها',
  exercise: 'المستقيم $(D)$ أدناه هو التمثيل البياني لدالة تآلفية $f$ . بقراءة بيانية عيّن $b$ ثم $a$ ، واكتب $f(x)$ .',
  solution: [
    '$(D)$ يقطع محور التراتيب في النقطة $(0 ; 2)$ : الترتيب عند المبدأ $b = 2$ .',
    'من $(0 ; 2)$ نتقدّم وحدتين إلى اليمين فنصل إلى $(2 ; -1)$ : نزل المستقيم $3$ ، أي $-\\dfrac{3}{2}$ لكل وحدة، إذن $a = -\\dfrac{3}{2}$ .',
    '$f(x) = -\\dfrac{3}{2}x + 2$ .',
  ],
  rule: [
    'لقراءة $b$ : نقرأ ترتيب النقطة التي يقطع فيها المستقيم محور التراتيب.',
    'لقراءة $a$ : ننطلق من نقطة من المستقيم ونتقدّم وحدة واحدة إلى اليمين، فنقرأ كم يصعد المستقيم ($a > 0$) أو ينزل ($a < 0$)؛ وإذا تقدّمنا عدّة وحدات قسمنا التغيّر في الترتيب على عددها.',
  ],
  a: '-3/2',
  b: '2',
};

/** طريقة (plateforme) — القراءة البيانية لصورة عدد وللعدد الذي علمت صورته (la rampe −1/2 x + 3). */
export const METHOD_READ = {
  source: addition('knowledge_formalization'),
  rule: [
    'لتعيين صورة عدد، نقرأ ترتيب النقطة من التمثيل البياني التي فاصلتها هذا العدد.',
    'لتعيين العدد الذي صورته معلومة، نقرأ فاصلة النقطة من التمثيل البياني التي ترتيبها هذه الصورة.',
  ],
  a: '-1/2',
  b: '3',
  reads: 'x:4|y:4',
};

/**
 * « أستعدّ » — les items 6, 7 أ et 7 ب du manuel (p. 77 ; 1–5 vont à mafhum-taalufiya) et trois affirmations
 * de la plateforme. Quatre acquis : تمثيل دالة خطية (khatti : 6), قراءة دالة خطية على تمثيلها (qiraa : 7 أ, 7 ب),
 * إحداثيات نقطة (talim), صورة عدد بدالة تآلفية (sura, leçon 1). Aucune n'utilise les nombres du نشاط 3.
 * L'item 7 a sa figure : (d) par O et (1 ; 1), (d′) par O et (1 ; −1) (components/AffineFigure).
 */
const PREP = (n) => src('prep', 77, 'أستعدّ', n);
const PREP_ADD = addition('prerequisite_diagnostic');
export const PREP_ITEMS = [
  { n: 6, skill: 'khatti', text: 'التمثيل البياني للدّالة $x \\longmapsto \\dfrac{1}{2}x$ هو مستقيم يشمل مبدأ المعلم و النقطة $A(2 ; 1)$ .', answer: true, why: 'دالة خطية: تمثيلها مستقيم يشمل المبدأ، و $\\dfrac{1}{2} \\times 2 = 1$ .', source: PREP(6) },
  { n: 7, skill: 'qiraa', text: 'لاحظ التمثيل أدناه. أ) الدّالة الخطية التي تمثيلها البياني هو $(d)$ هي الدّالة $f$ حيث $f(x) = -x$ .', answer: false, why: '$(d)$ يشمل المبدأ والنقطة $(1 ; 1)$ : $f(1) = 1$ ، إذن $f(x) = x$ .', source: PREP(7) },
  { n: 7, skill: 'qiraa', text: 'لاحظ التمثيل أدناه. ب) الدّالة الخطية التي تمثيلها البياني هو $(d\')$ هي الدّالة $g$ حيث $g(x) = -x$ .', answer: true, why: '$(d\')$ يشمل المبدأ والنقطة $(1 ; -1)$ : $g(1) = -1$ ، إذن $g(x) = -x$ .', source: PREP(7) },
  { skill: 'talim', text: 'النقطة $(0 ; -2)$ تقع على محور الفواصل.', answer: false, why: 'فاصلتها $0$ : تقع على محور التراتيب، في النقطة التي ترتيبها $-2$ .', source: PREP_ADD },
  { skill: 'sura', text: 'إذا كانت $f(x) = 2x - 5$ فإنّ $f(4) = 3$ .', answer: true, why: '$f(4) = 2 \\times 4 - 5 = 8 - 5 = 3$ .', source: PREP_ADD },
  { skill: 'sura', text: 'صورة العدد $-2$ بالدالة التآلفية $x \\longmapsto -x + 4$ هي $2$ .', answer: false, why: '$-(-2) + 4 = 2 + 4 = 6$ : معاكس $-2$ هو $2$ .', source: PREP_ADD },
];

/** La figure de l'item 7 (unité = 2 carreaux dans le livre). */
export const PREP_FIGURE = {
  win: { xMin: -2, xMax: 2, yMin: -2, yMax: 2 },
  lines: [{ a: 1, b: 0, label: '(d)', color: '#0F172A' }, { a: -1, b: 0, label: "(d')", color: '#E11D48' }],
  caption: 'الشكل: المستقيم $(d)$ يشمل المبدأ والنقطة $(1 ; 1)$ ، والمستقيم $(d\')$ يشمل المبدأ والنقطة $(-1 ; 1)$ .',
};

/**
 * Deux erreurs que la leçon EXPLIQUE (distracteurs de ses questions, avec leur « pourquoi ») — reprises
 * telles quelles par la carte (knowledgeGraph.js, خطأ شائع). Plateforme.
 */
export const COMMON_ERRORS = {
  source: addition('interaction_generation'),
  mabda: {
    wrong: 'O و $(1 ; 3)$ : التمثيل يشمل المبدأ دائمًا.',
    why: 'التمثيل يشمل المبدأ فقط إذا كانت صورة $0$ هي $0$ ؛ هنا $f(0) = 3 \\times 0 - 1 = -1 \\neq 0$ .',
    right: '$(0 ; -1)$ و $(1 ; 2)$ : $f(0) = -1$ و $f(1) = 3 \\times 1 - 1 = 2$ .',
  },
  bFasila: {
    wrong: '$b = 4$ : المستقيم يقطع محور الفواصل عند $4$ .',
    why: 'الترتيب عند المبدأ يُقرأ على محور التراتيب: هو ترتيب النقطة التي فاصلتها $0$ ، لأنّ $f(0) = b$ .',
    right: '$b = -2$ : المستقيم يقطع محور التراتيب في $(0 ; -2)$ .',
  },
};
