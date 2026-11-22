/**
 * Le contenu du درس « حساب قيمة عبارة حرفية » (3AM, unité 4) — données pures. Le manuel (docs/sources/3am/unit4/extraction.json) est la RÉFÉRENCE des
 * الكفاءات : tout est réécrit par la plateforme (autres mots, autres nombres, autres contextes — guide §4ter-bis) ; chaque bloc cite l'élément
 * dont il est tiré (`src`) pour la traçabilité de `check:textbook`. Les tâches du labo (`LAB`) sont celles des préréglages de
 * `manipulations/levels.js › marble-run` (module 1) et de `logic/marbleRun.js › TWIN_TASKS` (module 3, monde `twins`).
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** Les réglages des labos : mêmes valeurs que `levels.js` (module 1) et `TWIN_TASKS` (module 3) — recopiés ici, comparés par `content.test.js`. */
export const LAB = {
  run: {
    beginner: [
      { id: 'r1', expr: '4x+7', target: { x: '3' }, value: '19' },
      { id: 'r2', expr: '4x+7', target: { x: '-2' }, value: '-1' },
      { id: 'r3', expr: 'x²-3x', target: { x: '-2' }, value: '10' },
    ],
    advanced: [
      { id: 'r4', expr: '5-2x²', target: { x: '-3' }, value: '-13' },
      { id: 'r5', expr: '6x-1', target: { x: '-1/2' }, value: '-4' },
      { id: 'r6', expr: '3x-2y', target: { x: '-1', y: '4' }, value: '-11' },
    ],
  },
  twins: [
    { id: 'tw1', a: '(x+2)(x+3)', b: 'x²+6', equal: false },
    { id: 'tw2', a: '2x²+2', b: 'x²+x+2', equal: false },
    { id: 'tw3', a: '(x-2)(3x+3)', b: '3(x²-1)-3(x+1)', equal: true },
  ],
};

/** Les connaissances (معارف) — les mots de la plateforme. */
export const KNOWLEDGE = {
  times: {
    source: addition('knowledge_formalization'),
    text: 'عند التعويض نُظهر علامة الضرب المضمَرة: $4x$ من أجل $x=3$ تُكتب $4\\times3$ ، لا $43$.',
  },
  brackets: {
    source: addition('knowledge_formalization'),
    text: 'نضع القيمة السالبة بين قوسين: $(-2)^2=4$ أمّا $-2^2=-4$ ؛ وكذلك $5\\times(-3)$ و $4-(-3)$. والكسر الذي يُرفع إلى قوة يوضع بين قوسين أيضًا.',
  },
  same: {
    source: addition('knowledge_formalization'),
    text: 'الحرف يأخذ العدد نفسه في كل مكان يظهر فيه، ويبقى دوره كما هو: في $x^2-3x$ من أجل $x=-2$ نكتب $(-2)^2-3\\times(-2)=4+6=10$.',
  },
  letters: {
    source: addition('knowledge_formalization'),
    text: 'لحرفين مختلفين قد نعوّض عددين مختلفين: $3x-2y$ من أجل $x=2$ و $y=-1$ تعطي $3\\times2-2\\times(-1)=6+2=8$.',
  },
  definition: {
    source: src('know-4', 60, 'معارف', 4),
    text: 'لحساب قيمة عبارة حرفية من أجل قيمة للحرف، نعوّض الحرف بهذه القيمة في كل مكان منه، ونُظهر علامة الضرب، ونضع العدد السالب بين قوسين، ثم نحسب باحترام أولوية العمليات.',
  },
  example: {
    source: src('know-4', 60, 'معارف', 4),
    text: 'مثال: قيمة $4-3x^2$ من أجل $x=-2$ هي $4-3\\times(-2)^2=4-3\\times4=4-12=-8$ ؛ نحسب القوة أولًا، ثم الضرب، ثم الطرح.',
  },
  exactValue: {
    source: src('deep-37', 66, 'أتعمّق'),
    text: 'قيمة تحتوي العدد $\\pi$ تُكتب مضبوطة هكذا: $36+\\frac92\\pi$ ؛ أمّا $50{,}13$ فقيمة مقرّبة (بالنقصان إلى $0{,}01$).',
  },
  counter: {
    source: src('method-4', 61, 'طرائق', 4),
    text: 'إذا اختلفت قيمتا عبارتين من أجل قيمة واحدة للحرف، فالعبارتان غير متساويتين وتلك القيمة مثال مضاد: $(x+2)(x+3)$ و $x^2+6$ تعطيان $12$ و $7$ من أجل $x=1$.',
  },
  noProof: {
    source: src('method-4', 61, 'طرائق', 4),
    text: 'أمّا إذا تساوت قيمتا عبارتين من أجل قيمة أو قيمتين فلا يثبت ذلك تساويهما: لإثبات التساوي ننشر العبارتين ونقارن صورتيهما المنشورتين.',
  },
};

/** « تذكّر » — la première année, et les opérations sur les rationnels (leçons non publiées : sans lien tant que `getLessonPath` répond null). */
export const RECALL_1AM = {
  source: addition('prior_year_reminder'),
  title: 'تذكّر — السنة الأولى',
  text: 'في السنة الأولى عوّضنا الحرف بعدد موجب في قاعدة مثل محيط مربع $4\\times c$ : من أجل $c=5$ نجد $4\\times5=20$. هنا نعوّض أيضًا بأعداد سالبة وناطقة، ونعوّض حرفين معًا.',
  lesson: 'tatbiq-qaida-harfiya',
};
export const RECALL_OPS = {
  source: addition('prior_year_reminder'),
  title: 'تذكّر — العمليات على الأعداد الناطقة',
  text: 'عرفتَ كيف تجمع الأعداد الناطقة وتطرحها وتضربها وتقسمها وكيف تحترم أولوية العمليات. سنحتاج إليها كلّما عوّضنا حرفًا بكسر مثل $-\\frac12$.',
  lesson: 'amaliyat-natiqa',
};

/** طريقة p. 61 (« توظيف قيمة عبارة حرفية والحساب الحرفي ») — réécrite, autres nombres. */
export const METHOD_VALUES = {
  source: src('method-4', 61, 'طرائق', 4),
  title: 'بالقيم نبطل التساوي وبالنشر نثبته',
  exercise: 'لتكن $A=3x^2-6$ و $B=(x-2)(3x+6)$ و $C=3(x^2-x)+3(x-4)$. هل $A=B$ ؟ وهل $B=C$ ؟',
  solution: [
    '1. نحسب كل عبارة من أجل $x=1$ : $A=3\\times1^2-6=-3$ ، و $B=(1-2)(3\\times1+6)=(-1)\\times9=-9$ ، و $C=3(1-1)+3(1-4)=0-9=-9$.',
    '2. قيمتا $A$ و $B$ مختلفتان، فهما غير متساويتين: $x=1$ مثال مضاد.',
    '3. قيمتا $B$ و $C$ متساويتان، وهذا لا يثبت شيئًا بعد: قد تختلفان من أجل قيمة أخرى.',
    '4. ننشر لنثبت: $B=3x^2+6x-6x-12=3x^2-12$ و $C=3x^2-3x+3x-12=3x^2-12$.',
    '5. الصورتان المنشورتان واحدة، فالعبارتان $B$ و $C$ متساويتان من أجل كل قيمة لـ $x$.',
  ],
  remark: 'تساوي القيم لا يكفي: $x^2+5$ و $x^2-4x+5$ لهما القيمة $5$ من أجل $x=0$ ، لكنّهما مختلفتان من أجل $x=1$ (القيمتان $6$ و $2$).',
  rule: 'قيمة واحدة تختلف عندها العبارتان تكفي لإثبات أنهما غير متساويتين ؛ ولإثبات التساوي ننشر ونقارن.',
};

/** « أستعدّ » — six affirmations : deux de la plateforme sur les rationnels (`amaliyat-natiqa`), une sur la règle littérale (1AM), une sur la puissance d'un négatif (`quwat-adad-nisbi`), puis `prep` 1 et 4 réécrits (2 et 3 citées par l'item 5). */
export const PREP_ITEMS = [
  { skill: 'natiq', text: '$-\\frac34+\\frac12=-\\frac14$.', answer: true, why: 'نوحّد المقامين: $-\\frac34+\\frac24=-\\frac14$.', source: addition('prerequisite_diagnostic') },
  { skill: 'natiq', text: '$\\left(-\\frac23\\right)\\times6=4$.', answer: false, why: 'جداء عدد سالب وعدد موجب سالب: $-\\frac23\\times6=-4$.', source: addition('prerequisite_diagnostic') },
  { skill: 'qaida', text: 'محيط مربع طول ضلعه $c$ هو $4\\times c$ ؛ من أجل $c=7{,}5$ نجد $30$.', answer: true, why: '$4\\times7{,}5=30$.', source: addition('prerequisite_diagnostic') },
  { skill: 'quwa', text: '$(-3)^2=-9$.', answer: false, why: 'القوس يحفظ الإشارة داخل التربيع: $(-3)\\times(-3)=9$.', source: addition('prerequisite_diagnostic') },
  {
    skill: 'awlawiya', text: '$9-4\\times2=10$.', answer: false, why: 'الضرب قبل الطرح: $9-4\\times2=9-8=1$. حساب $9-4$ أولًا يعطي $10$ خطأً.',
    source: src('prep', 55, 'أستعدّ', 1), cites: [src('prep', 55, 'أستعدّ', 2), src('prep', 55, 'أستعدّ', 3)],
  },
  { skill: 'awlawiya', text: '$a\\times a\\times a=a^3$.', answer: true, why: 'ثلاثة عوامل كلّها $a$ : $a\\times a\\times a=a^3$ ، وهي أيضًا $a\\times a^2$.', source: src('prep', 55, 'أستعدّ', 4) },
];

/** Les erreurs courantes (knowledgeGraph.js les cite). */
export const GUIDE = {
  negPower: {
    wrong: 'تحويل $x^2$ إلى $-3^2$ من أجل $x=-3$ فنجد $-9$.',
    why: 'القوس يحفظ الإشارة داخل التربيع: $(-3)^2=(-3)\\times(-3)=9$ ، أمّا $-3^2$ فهي معاكس $3^2$ أي $-9$.',
    right: 'نكتب $(-3)^2=9$ بقوسين.',
  },
  fused: {
    wrong: 'كتابة $4x$ من أجل $x=3$ هكذا: $43$.',
    why: 'الجداء يحتاج علامته: $43$ عدد واحد، أمّا $4\\times3=12$.',
    right: 'نكتب $4\\times3=12$ بعلامة الضرب.',
  },
  oneValue: {
    wrong: 'القيمتان متساويتان من أجل $x=0$ فالعبارتان متساويتان.',
    why: 'القيمة الواحدة لا تثبت التساوي: $x^2+5$ و $x^2-4x+5$ لهما القيمة $5$ من أجل $x=0$ ، و $6$ و $2$ من أجل $x=1$.',
    right: 'قيمة تختلف عندها العبارتان تثبت أنهما غير متساويتين ؛ وللتساوي ننشر.',
  },
};
