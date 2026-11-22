/**
 * Le contenu du درس « البحث عن أعداد ناقصة » (1AM, unité 6) — données pures. Le manuel (docs/sources/1am/unit6/extraction.json) est la RÉFÉRENCE des الكفاءات : ici tout est
 * réécrit par la plateforme (autres mots, autres nombres, autres contextes — guide §4ter-bis), chaque bloc citant seulement l'élément dont il est tiré (`src`) pour la traçabilité de `check:textbook`.
 * Les nombres du labo (`LAB`) sont ceux des préréglages de `manipulations/levels.js › rewind-belt` et des deux tâches posées seules au module 3.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** Les nombres des labos (mêmes valeurs que `levels.js` pour les deux niveaux ; `method` est passé par le module 3). */
export const LAB = {
  beginner: [
    { id: 'b1', kind: 'add', a: '9', out: '54', rack: ['add', 'sub', 'mul', 'div'] },
    { id: 'b2', kind: 'sub', a: '14', out: '54', rack: ['add', 'sub', 'mul', 'div'] },
    { id: 'b3', kind: 'mul', a: '6', out: '54', rack: ['add', 'sub', 'mul', 'div'] },
    { id: 'b4', kind: 'rsub', a: '80', out: '54', rack: ['add', 'sub', 'rsub'] },
  ],
  advanced: [
    { id: 'a1', kind: 'add', a: '17,5', out: '46,2', rack: ['add', 'sub', 'mul', 'div'] },
    { id: 'a2', kind: 'rsub', a: '12,5', out: '4,8', rack: ['add', 'sub', 'rsub'] },
    { id: 'a3', kind: 'mul', a: '7', out: '20', rack: ['add', 'sub', 'mul', 'div'] },
  ],
  method: [
    { id: 'm1', kind: 'add', a: '18,6', out: '45,1', rack: ['add', 'sub', 'mul', 'div'] },
    { id: 'm2', kind: 'mul', a: '13', out: '41,6', rack: ['add', 'sub', 'mul', 'div'] },
  ],
};

/** Les connaissances (معارف) — les mots de la plateforme. */
export const KNOWLEDGE = {
  hole: {
    source: src('act-1', 79, 'اكتشف', 1),
    definition: 'العدد الناقص في مساواة هو العدد المجهول الذي نرمز إليه بمربع $\\square$ : هو العدد الذي إذا وضعناه مكان المربع صارت المساواة صحيحة. مثال : $\\square+9=54$ ، والعدد الناقص هو $45$ .',
  },
  sum: {
    source: src('method-1', 82, 'أكتسب طرائق'),
    text: 'في مجموع $\\square+a=b$ ، العدد الناقص $\\square$ هو الفرق $b-a$ : نطرح العدد المعلوم من الناتج. الطرح هو العملية العكسية للجمع.',
  },
  diff: {
    source: src('ex-15', 84, 'البحث عن أعداد ناقصة', 15),
    first: 'في فرق $\\square-a=b$ ، العدد الناقص هو $b+a$ : نجمع، لأنّ الجمع هو العملية العكسية للطرح.',
    second: 'وفي فرق $a-\\square=b$ ، العدد الناقص هو الفرق $a-b$ : نطرح الناتج من العدد الذي بدأنا منه، ولا نعكس الإشارة.',
  },
  product: {
    source: src('ex-16', 84, 'البحث عن أعداد ناقصة', 16),
    text: 'في جداء $a\\times\\square=b$ ، العدد الناقص $\\square$ هو حاصل القسمة $b\\div a$ : نقسم الناتج على العدد المعلوم. القسمة هي العملية العكسية للضرب، وإذا لم تتوقّف كتبنا الناتج كسرًا $\\frac{b}{a}$ .',
  },
  check: {
    source: src('method-1', 82, 'أكتسب طرائق'),
    text: 'نتحقّق دائمًا بالتعويض : نضع العدد الذي وجدناه مكان $\\square$ ونحسب ؛ إن وجدنا الناتج المعلوم فالعدد صحيح. مثال : $45+9=54$ .',
  },
  history: {
    source: src('opener-khwarizmi', 77, 'تمهيد'),
    text: 'عاش الخوارزمي في بغداد نحو سنة 780 إلى 850 للميلاد، وألّف كتاب « الجبر والمقابلة » الذي وضع فيه طرقًا لحلّ المعادلات. ومن اسم كتابه جاءت كلمة « الجبر » : فكرة إرجاع الجانب إلى ما كان عليه هي روح هذا الدرس.',
  },
};

/** طريقة (le manuel la donne p. 82 : traduire par un schéma de calcul, opération inverse, vérifier, répondre) — avec les nombres de la plateforme. */
export const METHOD_FIND = {
  source: src('method-1', 82, 'أكتسب طرائق'),
  title: 'أجد العدد الناقص وأتحقّق',
  exercise: 'في صندوق عدد من الكيلوغرامات من الورق المقوّى ؛ بعد أن أضفنا إليه 18,6 كغ صار وزنه 45,1 كغ. ما الوزن الأوّل ؟',
  solution: [
    '1. نترجم الوضعية بمساواة فيها عدد ناقص : $\\square+18{,}6=45{,}1$ ، أي دخول $\\to +18{,}6 \\to 45{,}1$ .',
    '2. نُرجع الحزام إلى الوراء بالعملية العكسية للجمع، أي بالطرح : $\\square=45{,}1-18{,}6=26{,}5$ .',
    '3. نتحقّق بالتعويض : $26{,}5+18{,}6=45{,}1$ ، فالعدد صحيح.',
    '4. نجيب : الوزن الأوّل $26{,}5$ كغ.',
  ],
  rule: 'أترجم الوضعية بمساواة فيها □ ، أُرجع بالعملية العكسية (الطرح للجمع، والجمع للطرح، والقسمة للضرب)، أتحقّق بالتعويض ثمّ أجيب.',
};

/** « أستعدّ » — six affirmations : le calcul décimal (items 1–3, lien 1am.m1.r05) et l'écriture fractionnaire d'un quotient (items 4–6, 1am.m5.r01). */
export const PREP_ITEMS = [
  { skill: 'jam', text: '$2{,}4+5{,}8=8{,}2$ .', answer: true, why: '4 أعشار و 8 أعشار تعطي 12 عشرًا أي وحدة واحدة و 2 من العشر : $2{,}4+5{,}8=8{,}2$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'jam', text: '$10-3{,}6=7{,}6$ .', answer: false, why: '$10-3{,}6=6{,}4$ ، ونتحقّق : $6{,}4+3{,}6=10$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'jam', text: 'ثمن دفتر $1{,}5$ دج ، فثمن 4 دفاتر $6$ دج.', answer: true, why: '$1{,}5\\times 4=6$ : أربع مرّات واحد ونصف.', source: addition('prerequisite_diagnostic') },
  { skill: 'kasr', text: 'حاصل قسمة $20$ على $7$ يُكتب أيضًا $\\frac{20}{7}$ .', answer: true, why: 'حاصل قسمة عدد على آخر يُكتب كسرًا بسطه المقسوم ومقامه المقسوم عليه : $20\\div 7=\\frac{20}{7}$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'kasr', text: 'حاصل قسمة $3$ على $4$ يُكتب $\\frac{4}{3}$ .', answer: false, why: 'البسط هو المقسوم : $3\\div 4=\\frac{3}{4}$ لا $\\frac{4}{3}$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'kasr', text: '$\\frac{9}{2}=4{,}5$ .', answer: true, why: '$\\frac{9}{2}=9\\div 2=4{,}5$ .', source: addition('prerequisite_diagnostic') },
];

/** Les erreurs courantes, mot pour mot (knowledgeGraph.js les cite). */
export const GUIDE = {
  same: {
    wrong: 'في $\\square+9=54$ أجد $54+9=63$ : أُضيف 9 مرّة أخرى.',
    why: 'لو وضعنا 63 في الآلة لخرج $63+9=72$ لا 54 : أبعدنا الصندوق ولم نُعده.',
    right: '$\\square=54-9=45$ .',
  },
  trap: {
    wrong: 'في $80-\\square=54$ أجد $\\square=54+80=134$ لأنّ الجمع عكس الطرح.',
    why: 'المطروح هو المجهول هنا : لا نأخذ 134 من 80. نجد العدد المأخوذ بالفرق بين ما كان وما بقي.',
    right: '$\\square=80-54=26$ .',
  },
  divRev: {
    wrong: 'في $6\\times\\square=54$ أجد $\\square=54\\times 6=324$ ، أو $6\\div 54$ .',
    why: 'الضرب مرّة أخرى يكبّر ولا يُعيد، ونقسم الناتج على العدد المعلوم لا العكس.',
    right: '$\\square=54\\div 6=9$ .',
  },
  approx: {
    wrong: 'أقرّب $20\\div 7$ إلى $2{,}86$ وأقول إنّه العدد الناقص.',
    why: '$2{,}86\\times 7=20{,}02$ لا $20$ : القيمة التقريبية لا تحقّق المساواة بالضبط.',
    right: '$\\square=\\frac{20}{7}$ ، و $\\frac{20}{7}\\times 7=20$ .',
  },
};
