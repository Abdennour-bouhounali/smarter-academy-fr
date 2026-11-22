/**
 * Le contenu du درس « التعليم على مستقيم مدرّج » (1AM, unité 5) — données pures. Le manuel (docs/sources/1am/unit5/extraction.json) est la RÉFÉRENCE des الكفاءات : ici tout est
 * réécrit par la plateforme (autres mots, autres nombres, autres contextes — guide §4ter-bis), chaque bloc citant seulement l'élément dont il est tiré (`src`) pour la traçabilité de
 * `check:textbook`. Les nombres du labo (`LAB`) sont ceux des préréglages de `manipulations/levels.js › stride-stamp` et de la tâche posée seule au module 3.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** Les nombres des labos (mêmes valeurs que `levels.js` pour les deux niveaux ; `method` est passé par le module 3). */
export const LAB = {
  beginner: [
    { id: 'b1', kind: 'stamp', stride: 2, reads: [{ at: 3 }, { at: -3 }] },
    { id: 'b2', kind: 'twin', reads: [{ of: -30 }, { of: 20 }] },
    { id: 'b3', kind: 'place', reads: [{ x: -30 }, { x: 27 }, { x: -15 }] },
  ],
  advanced: [
    { id: 'a1', kind: 'origin', n: 10, u: 1, marks: [{ i: 2, v: -3 }, { i: 8, v: 3 }] },
    { id: 'a2', kind: 'origin', n: 10, u: 2, marks: [{ i: 2, v: -8 }, { i: 5, v: -2 }] },
    { id: 'a3', kind: 'bound', reads: [{ x: -15 }, { x: 27 }, { x: -4 }] },
  ],
  method: [{ id: 'm1', kind: 'place', reads: [{ x: -40 }, { x: 16 }] }],
};

/** Les connaissances (معارف) — les mots de la plateforme. */
export const KNOWLEDGE = {
  line: {
    source: src('know-2', 67, 'أحوصل تعلّماتي', 2),
    definition: 'المستقيم المدرّج هو مستقيم نختار عليه نقطة تسمّى المبدأ، واتجاهًا، ووحدة لقياس الأطوال. ننقل الوحدة نفسها من جهتي المبدإ فتظهر العلامات.',
  },
  bothSides: {
    source: src('act-1-line', 65, 'اكتشف', 1),
    text: 'في جهة الاتجاه المختار تظهر أعداد موجبة تُكتب بلا إشارة، وفي الجهة الأخرى أعداد سالبة تسبقها الإشارة − : العلامة $-2$ تبعد عن المبدإ وحدتين مثلما تبعد العلامة $2$ ، لكنّها في الجهة المقابلة.',
  },
  abscissa: {
    source: src('know-2', 67, 'أحوصل تعلّماتي', 2),
    definition: 'لكلّ نقطة من المستقيم المدرّج عدد نسبي يسمّى فاصلتها: هو بعدها عن المبدإ مسبوقًا بإشارة جهتها. فاصلة النقطة $M$ هي $-3{,}5$ ونكتب $M(-3{,}5)$ .',
  },
  symmetric: {
    source: src('know-2', 67, 'أحوصل تعلّماتي', 2),
    text: 'إذا كانت نقطتان متناظرتين بالنسبة إلى المبدإ (المبدأ منتصف القطعة بينهما) فلهما المسافة نفسها إلى المبدإ وفاصلتاهما متعاكستان: $A(-3)$ و $A\'(3)$ .',
  },
  bounds: {
    source: src('method-1', 68, 'أكتسب طرائق'),
    text: 'قد لا تقع النقطة على علامة. نقرأ فاصلتها بحصرها بين علامتين متتاليتين: النقطة التي فاصلتها $-1{,}5$ تقع بين العلامتين $-2$ و $-1$ لأنّ $-2<-1{,}5<-1$ .',
  },
  origin: {
    source: src('act-2', 66, 'اكتشف', 2),
    text: 'إذا لم يُكتب المبدأ على المستقيم وجدناه من علامتين مكتوبتين: نقسم كلّ فاصلة على قيمة التدريجة الواحدة فنعرف عدد التدريجات التي تفصل العلامة عن الصفر.',
  },
};

/** طريقة (le manuel donne la sienne p. 68 ; ici la plateforme écrit la sienne, avec d'autres nombres) — graduer une droite des deux côtés de O et y placer deux points. */
export const METHOD_GRAD = {
  source: src('method-1', 68, 'أكتسب طرائق'),
  title: 'أدرّج مستقيمًا وأعلّم نقطتين',
  exercise: 'درّج مستقيمًا، ثمّ علّم عليه النقطتين $M(-4)$ و $N(1{,}6)$ .',
  solution: [
    '1. أختار المبدأ $O$ والاتجاه ووحدة الطول $OI$ ، وأقسّم الوحدة إلى عشرة أجزاء متساوية.',
    '2. فاصلة $M$ سالبة: أنقل الوحدة $OI$ نفسها من $O$ إلى الجهة المقابلة لاتجاه الأعداد الموجبة أربع مرّات، وأضع $M$ عند العلامة $-4$ .',
    '3. فاصلة $N$ موجبة: أضعها في جهة الاتجاه، بعد العلامة $1$ بستّ تدريجات صغيرة، أي بين العلامتين $1$ و $2$ .',
    '4. أتحقّق: $M$ تبعد عن $O$ أربع وحدات في جهة الإشارة −، و $N$ تبعد $1{,}6$ وحدة في الجهة الأخرى.',
  ],
  rule: 'لتعليم نقطة نختار المبدأ والاتجاه والوحدة، وننقل الوحدة من جهتي المبدإ: نضع النقطة على بعد فاصلتها دون إشارة من المبدإ، في جهة الاتجاه إن كانت الإشارة موجبة وفي الجهة الأخرى إن كانت سالبة.',
};

/** « أستعدّ » — six affirmations : lire une abscisse décimale sur une demi-droite (items 1–3, lien 1am.m5.r04) et les relatifs, la distance à zéro, l'opposé (items 4–6, lien 1am.m5.r05). */
export const PREP_ITEMS = [
  { skill: 'khat', text: 'على نصف مستقيم مدرّج وحدته مقسّمة إلى 10 أجزاء متساوية، نقطة تبعد عن المبدإ بثلاث وحدات وأربع تدريجات صغيرة فاصلتها $3{,}4$ .', answer: true, why: 'الوحدات الكاملة قبل الفاصلة والتدريجات بعدها: $3+\\frac{4}{10}=3{,}4$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'khat', text: 'النقطة التي فاصلتها $5{,}2$ تقع بين العلامتين $6$ و $7$ .', answer: false, why: '$5<5{,}2<6$ : تقع بين العلامتين $5$ و $6$ ، لا بين $6$ و $7$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'khat', text: 'على نصف مستقيم مدرّج، كلّما ابتعدت نقطة عن المبدإ كبرت فاصلتها.', answer: true, why: 'الفاصلة هي البعد عن المبدإ: الأبعد هي ذات الفاصلة الأكبر.', source: addition('prerequisite_diagnostic') },
  { skill: 'nisbi', text: 'معاكس العدد $-5$ هو $5$ .', answer: true, why: 'للعددين $5$ و $-5$ المسافة نفسها إلى الصفر وإشارتان متعاكستان.', source: addition('prerequisite_diagnostic') },
  { skill: 'nisbi', text: 'المسافة إلى الصفر للعدد $-2$ هي $-2$ .', answer: false, why: 'المسافة لا تكون سالبة: مسافة $-2$ إلى الصفر هي $2$ ، والإشارة − تقول الجهة فقط.', source: addition('prerequisite_diagnostic') },
  { skill: 'nisbi', text: 'العدد $-3$ يقع تحت الصفر، فهو عدد سالب.', answer: true, why: 'العدد الذي تسبقه الإشارة − سالب وأصغر من الصفر.', source: addition('prerequisite_diagnostic') },
];

/** Les erreurs courantes, mot pour mot (knowledgeGraph.js les cite). */
export const GUIDE = {
  leftIsZero: {
    wrong: 'العلامة التي في أقصى اليسار على المستقيم هي الصفر.',
    why: 'الصفر هو المبدأ الذي نختاره، وقد توجد على يساره أعداد سالبة: قد تكون أوّل علامة مكتوبة $-3$ لا $0$ .',
    right: 'المبدأ هو التدريجة التي فاصلتها $0$ ، وعلى يساره أعداد سالبة.',
  },
  westPositive: {
    wrong: 'النقطة التي على يسار المبدإ بثلاث وحدات فاصلتها $3$ .',
    why: 'جهة اليسار هي الجهة المقابلة لاتجاه الأعداد الموجبة، فلفاصلتها الإشارة −.',
    right: 'فاصلتها $-3$ : البعد 3 والإشارة − لأنّها في الجهة المقابلة.',
  },
  truncBound: {
    wrong: 'النقطة التي فاصلتها $-1{,}5$ تقع بين $-1$ و $0$ لأنّ جزأها الصحيح $-1$ .',
    why: 'نعدّ من الصفر نحو الجهة السالبة: $-1{,}5$ أبعد عن المبدإ من $-1$ ، فهي تقع بعد العلامة $-1$ .',
    right: '$-2<-1{,}5<-1$ : بين العلامتين $-2$ و $-1$ .',
  },
  symSame: {
    wrong: 'نظيرة النقطة $A(-3)$ بالنسبة إلى المبدإ فاصلتها $-3$ أيضًا.',
    why: 'النظيرة على الجهة الأخرى من المبدإ وبالبعد نفسه: فاصلتها العدد المعاكس.',
    right: 'نظيرة $A(-3)$ هي $A\'(3)$ .',
  },
};
