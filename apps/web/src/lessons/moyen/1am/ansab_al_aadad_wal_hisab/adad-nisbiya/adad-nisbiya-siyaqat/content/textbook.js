/**
 * Le contenu du درس « الأعداد النسبية وسياقات استعمالها » (1AM, unité 5) — données pures. Le manuel (docs/sources/1am/unit5/extraction.json) est la RÉFÉRENCE
 * des الكفاءات : ici tout est réécrit par la plateforme (autres mots, autres nombres, autres contextes — guide §4ter-bis), chaque bloc citant seulement
 * l'élément dont il est tiré (`src`) pour la traçabilité de `check:textbook`.
 * Les nombres du labo (`LAB`) sont ceux des préréglages de `manipulations/levels.js › frost-gauge` et de la tâche posée seule au module 3.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** Les nombres des labos (mêmes valeurs que `levels.js` pour les deux niveaux ; `method` est passé par le module 3). */
export const LAB = {
  beginner: [
    { id: 'b1', scene: 'frost', kind: 'set', step: 1, min: -6, max: 6, reads: [5, -2, -3, 0, 2] },
    { id: 'b2', scene: 'altitude', kind: 'set', step: 10, min: -50, max: 50, reads: [-40, 30, 0] },
    { id: 'b3', scene: 'frost', kind: 'mirror', step: 1, min: -6, max: 6, reads: [{ self: -4 }, { mirror: 3 }, { self: 0 }] },
  ],
  advanced: [
    { id: 'a1', scene: 'frost', kind: 'pair', step: 2, min: -10, max: 10, reads: [{ dist: 6 }, { dist: 6 }] },
    { id: 'a2', scene: 'floors', kind: 'set', step: 1, min: -3, max: 6, reads: [-2, 5, 0] },
    { id: 'a3', scene: 'altitude', kind: 'set', step: 10, min: -50, max: 50, reads: [-30, 20] },
  ],
  method: [{ id: 'm1', scene: 'frost', kind: 'set', step: 1, min: -6, max: 6, reads: [-3, 4, -1] }],
};

/** Les connaissances (معارف) — les mots de la plateforme. */
export const KNOWLEDGE = {
  need: {
    source: src('act-1-need', 65, 'اكتشف', 1),
    text: 'الأعداد الطبيعية لا تكفي: لا يوجد عدد طبيعي يحقّق $6+\\ldots=4$ ، لأنّ الجواب هو $-2$ ، أي عدد يقع تحت الصفر.',
  },
  contexts: {
    source: src('act-1-temp', 65, 'اكتشف', 1),
    text: 'نستعمل الأعداد السالبة حين يكون للقياس صفر مرجعيّ نقيس على جهتيه: الحرارة فوق صفر الانجماد وتحته، والارتفاع فوق سطح البحر وتحته، والطابق فوق الأرضي وتحته، والتاريخ بعد الميلاد وقبله.',
  },
  relative: {
    source: src('know-1', 67, 'أحوصل تعلّماتي', 1),
    definition: 'الأعداد النسبية أعداد موجبة وأعداد سالبة. العدد السالب مسبوق دائمًا بإشارة − ويقع تحت الصفر، فهو أصغر من الصفر. والعدد الموجب يقع فوق الصفر فهو أكبر من الصفر، وقد يُكتب بإشارة + أو بدونها.',
  },
  zero: {
    source: src('know-1', 67, 'أحوصل تعلّماتي', 1),
    text: 'العدد $0$ هو العدد الوحيد الذي يُعدّ موجبًا وسالبًا في آن واحد: لا يقع فوق الصفر ولا تحته.',
  },
  relInt: {
    source: src('know-1', 67, 'أحوصل تعلّماتي', 1),
    text: 'الأعداد النسبية التي لا جزء عشريًّا فيها، مثل $-4$ و $0$ و $12$ ، تسمّى الأعداد الصحيحة النسبية.',
  },
  signDistance: {
    source: src('know-2', 67, 'أحوصل تعلّماتي', 2),
    text: 'للعدد النسبي إشارة تقول على أيّ جهة من الصفر يقع (فوقه أو تحته)، ومسافة إلى الصفر تقول كم يبعد عنه، وهي عدد موجب دائمًا: للعددين $-3$ و $3$ المسافة نفسها إلى الصفر وهي $3$ .',
  },
  opposites: {
    source: src('know-2', 67, 'أحوصل تعلّماتي', 2),
    definition: 'يكون عددان نسبيان متعاكسين عندما يكون لهما المسافة نفسها إلى الصفر وإشارتان متعاكستان: $3$ و $-3$ متعاكسان. ومعاكس $0$ هو $0$ .',
  },
  rods: {
    source: src('opener-rods', 63, 'تمهيد'),
    text: 'عدّ الصينيون القدامى بعيدان خشبية، وميّزوا العدد الموجب بلون العيدان الأحمر والعدد السالب بلونها الأسود.',
  },
};

/** طريقة (ajout de la plateforme : le manuel n'en a pas pour cette leçon) — écrire une situation en nombre relatif, sa distance, son opposé. */
export const METHOD_READ = {
  source: addition('knowledge_formalization'),
  title: 'أكتب القراءة عددًا نسبيًّا وأجد معاكسه',
  exercise: 'قرأت سلمى صباحًا 3 درجات فوق الصفر، وقرأت ليلًا 4 درجات تحت الصفر. اكتب كلّ قراءة بعدد نسبي، وعيّن مسافة كلّ منهما إلى الصفر، ثمّ اكتب معاكس قراءة الليل.',
  solution: [
    '1. نبحث عن الصفر: كلّ قراءة تُقاس منه، وفوقه الموجب وتحته السالب.',
    '2. صباحًا: 3 درجات فوق الصفر، فالعدد موجب ويُكتب $3$ دون إشارة، ومسافته إلى الصفر $3$ .',
    '3. ليلًا: 4 درجات تحت الصفر، فالعدد سالب تسبقه الإشارة − : $-4$ ، ومسافته إلى الصفر $4$ لا $-4$ .',
    '4. معاكس $-4$ له المسافة نفسها إلى الصفر على الجهة الأخرى منه: $4$ .',
  ],
  rule: 'أبدأ بالصفر: فوقه عدد موجب بلا إشارة، وتحته عدد سالب تسبقه الإشارة − ؛ المسافة إلى الصفر هي عدد الدرجات دون إشارة؛ ومعاكسه له المسافة نفسها على الجهة الأخرى.',
};

/** « أستعدّ » — six affirmations : comparer des décimaux (items 1–2, lien 1am.m1.r04) et lire une abscisse décimale sur une demi-droite graduée (items 3–6, 1am.m5.r04). */
export const PREP_ITEMS = [
  { skill: 'muqarana', text: '$4{,}7>4{,}07$ .', answer: true, why: 'الجزء الصحيح واحد، و $4{,}7=4{,}70$ أكبر من $4{,}07$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'muqarana', text: '$3{,}2<3{,}18$ لأنّ 2 أقلّ من 18 .', answer: false, why: '$3{,}2=3{,}20$ ، و 20 جزءًا من مائة أكثر من 18 : $3{,}2>3{,}18$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'khat', text: 'على نصف مستقيم مدرّج وحدته مقسّمة إلى 10 أجزاء متساوية، نقطة تبعد عن المبدإ بوحدتين وثلاث تدريجات صغيرة فاصلتها $2{,}3$ .', answer: true, why: 'الوحدات الكاملة قبل الفاصلة والتدريجات بعدها: $2+\\frac{3}{10}=2{,}3$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'khat', text: 'نقطة تبعد عن المبدإ بثلاث وحدات وتدريجتين صغيرتين فاصلتها $2{,}3$ .', answer: false, why: 'ثلاث وحدات ثمّ تدريجتان: $3+\\frac{2}{10}=3{,}2$ ، لا $2{,}3$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'khat', text: 'من نقطتين على نصف مستقيم مدرّج، الأبعد عن المبدإ هي التي لها الفاصلة الأصغر.', answer: false, why: 'الفاصلة هي البعد عن المبدإ: الأبعد هي ذات الفاصلة الأكبر.', source: addition('prerequisite_diagnostic') },
  { skill: 'khat', text: 'النقطة التي فاصلتها $6{,}5$ تقع بين العلامتين $6$ و $7$ .', answer: true, why: '$6<6{,}5<7$ : وحدات كاملة ستّ ثمّ خمس تدريجات صغيرة.', source: addition('prerequisite_diagnostic') },
];

/** Les erreurs courantes, mot pour mot (knowledgeGraph.js les cite). */
export const GUIDE = {
  biggestColdest: {
    wrong: 'أبرد صباح هو الذي قراءته أكبر عدد: صباح $5$ أبرد من صباح $-3$ .',
    why: 'الأبرد هو أدنى مستوى للسائل: العدد السالب أصغر من الصفر ومن أيّ عدد موجب، فصباح $-3$ أبرد من صباح $5$ .',
    right: '$-3<0<5$ ، فأبرد صباح هو $-3$ .',
  },
  negDistance: {
    wrong: 'المسافة بين $-3$ والصفر هي $-3$ .',
    why: 'المسافة هي عدد التدريجات بين المستوى والصفر فلا تكون سالبة؛ والإشارة تقول الجهة فقط.',
    right: 'المسافة إلى الصفر للعدد $-3$ هي $3$ .',
  },
  oppSame: {
    wrong: 'معاكس $-4$ هو $-4$ نفسه، أو هو $-5$ الذي يليه.',
    why: 'المعاكس يقع على الجهة الأخرى من الصفر وبالمسافة نفسها: ليس العدد نفسه ولا العدد الذي يليه.',
    right: 'معاكس $-4$ هو $4$ .',
  },
  zeroNone: {
    wrong: 'الصفر لا معاكس له وليس موجبًا ولا سالبًا.',
    why: 'الصفر معاكس نفسه، ويُعدّ موجبًا وسالبًا في آن واحد.',
    right: 'معاكس $0$ هو $0$ .',
  },
};
