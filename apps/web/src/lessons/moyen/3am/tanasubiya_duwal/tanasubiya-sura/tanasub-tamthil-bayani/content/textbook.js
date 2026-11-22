/**
 * Le contenu du درس « التناسبية والتمثيل البياني » (3AM, unité 6) — données pures. Le manuel est la RÉFÉRENCE (docs/sources/3am/unit6/extraction.json : نشاط 1
 * p. 88, معارف 1 p. 90, طرائق p. 91, أستعدّ p. 87) ; chaque texte montré à l'élève est RÉÉCRIT par la plateforme (guide §4ter-bis : mêmes définitions et
 * notations, autres mots, autres exemples, autres nombres). La `source` de chaque bloc garde la traçabilité (`check:textbook`) ; `SourceTag` est muet pour l'élève.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** LE LABO DE L'ENTRÉE — « سكك الدبابيس » (`pin-rails`, thème `stall`) : expérience de la plateforme, tâches du preset `levels.js`. */
export const LAB = {
  source: addition('platform_designed_entry'),
  beginner: { tasks: [
    { mode: 'plot', shop: 'one', xs: [2, 6, 12, 14], rule: { a: '5' }, frame: { xMax: 16, yMax: 80, xStep: 2, yStep: 10, unit: 5 } },
    { mode: 'given', shop: 'two', xs: [2, 6, 12, 14], rule: { a: '2.5', b: '10' }, frame: { xMax: 16, yMax: 80, xStep: 2, yStep: 10, unit: 5 } },
    { mode: 'given', shop: 'three', xs: [2, 6, 12, 14], rule: { a: '5', k: 8, a2: '2' }, frame: { xMax: 16, yMax: 80, xStep: 2, yStep: 10, unit: 5 } },
  ] },
  advanced: { tasks: [
    { mode: 'given', shop: 'bags', xs: [2, 4, 6, 8], rule: { a: '1.5' }, frame: { xMax: 12, yMax: 18, xStep: 2, yStep: 2, unit: 0.5 } },
    { mode: 'given', shop: 'crate', xs: [2, 4, 6, 8], rule: { a: '0.5', b: '4' }, frame: { xMax: 12, yMax: 18, xStep: 2, yStep: 2, unit: 0.5 } },
    { mode: 'read', shop: 'unit', xs: [2, 4, 6, 8], rule: { a: '1.5' }, ask: { x: '1' }, frame: { xMax: 12, yMax: 18, xStep: 2, yStep: 2, unit: 0.5 } },
    { mode: 'read', shop: 'seven', xs: [2, 4, 6, 8], rule: { a: '1.5' }, ask: { x: '7' }, frame: { xMax: 12, yMax: 18, xStep: 2, yStep: 2, unit: 0.5 } },
    { mode: 'read', shop: 'mass', xs: [2, 4, 6, 8], rule: { a: '1.5' }, ask: { y: '15' }, frame: { xMax: 12, yMax: 18, xStep: 2, yStep: 2, unit: 0.5 } },
  ] },
};

/** معارف 1 (p. 90) — les deux propriétés, réécrites avec les exemples de la plateforme. */
export const KNOWLEDGE = {
  definition: {
    source: src('know-1a', 90, 'معارف', 1),
    text: 'كلّ عمود من جدول معطيات يُمثَّل بنقطة في معلم: العدد الأول فاصلتها (على المحور الأفقي) والعدد الثاني ترتيبها (على المحور العمودي). مثلًا العمود $6 \\to 30$ هو النقطة $(6\\ ;\\ 30)$ .',
  },
  property1: {
    source: src('know-1a', 90, 'معارف', 1),
    text: 'خاصية 1: تُمثَّل كلّ وضعية تناسبية في معلم بنقط على استقامة واحدة مع مبدأ المعلم $O$ ، أي بنقط من مستقيم يمرّ بـ $O$ . مثلًا جدول التناسبية $2, 5, 8 \\to 3, 7{,}5, 12$ (معامله $1{,}5$ ) يُمثَّل بالنقط $(2\\ ;\\ 3)$ و $(5\\ ;\\ 7{,}5)$ و $(8\\ ;\\ 12)$ على مستقيم واحد يمرّ بـ $O$ .',
  },
  property2: {
    source: src('know-1b', 90, 'معارف', 1),
    text: 'خاصية 2: كلّ تمثيل بياني نقطه على استقامة واحدة مع مبدأ المعلم $O$ يُمثّل وضعية تناسبية.',
  },
  refuse: {
    source: src('know-1b', 90, 'معارف', 1),
    text: 'وإذا كانت النقط ليست على استقامة (السعر يتغيّر)، أو كانت على مستقيم لا يمرّ بـ $O$ (مبلغ ثابت يُضاف)، فالتمثيل لا يُمثّل وضعية تناسبية.',
  },
  coefficient: {
    source: src('method-1b', 91, 'طرائق'),
    text: 'إذا كانت النقطة $M(x\\ ;\\ y)$ من نقط مستقيم يمرّ بـ $O$ فإنّ $y = a \\times x$ . والعدد $a$ هو معامل التناسبية، وهو ترتيب النقطة التي فاصلتها $1$ .',
  },
};

/** طرائق p. 91 — lire un graphique et juger un graphique, RÉÉCRITS avec d'autres nombres. */
export const METHOD = {
  read: {
    source: src('method-1a', 91, 'طرائق'),
    exercise: 'يمثّل البيان كتلة سلك نحاسي $m$ بالكيلوغرام بدلالة طوله $L$ بالمتر: نقطه $(4\\ ;\\ 3)$ و $(8\\ ;\\ 6)$ و $(12\\ ;\\ 9)$ على مستقيم يمرّ بـ $O$ . ما كتلة $10\\ \\mathrm{m}$ من هذا السلك؟ وما طول سلك كتلته $4{,}5\\ \\mathrm{kg}$ ؟',
    solution: [
      'نقط البيان على استقامة واحدة مع $O$ ، فالكتلة متناسبة مع الطول، ومعامل التناسبية ترتيب النقطة التي فاصلتها $1$ : $\\frac{3}{4} = 0{,}75$ .',
      'إذن $m = 0{,}75 \\times L$ .',
      'كتلة $10\\ \\mathrm{m}$ : $m = 0{,}75 \\times 10 = 7{,}5\\ \\mathrm{kg}$ .',
      'طول سلك كتلته $4{,}5\\ \\mathrm{kg}$ : $4{,}5 = 0{,}75 \\times L$ ومنه $L = \\frac{4{,}5}{0{,}75} = 6\\ \\mathrm{m}$ .',
    ],
    rule: 'على بيان تناسبية: المعامل $a = \\frac{y}{x}$ (ترتيب النقطة التي فاصلتها 1)، ثم $y = a \\times x$ لإيجاد ترتيب نقطة فاصلتها معلومة، و $x = \\frac{y}{a}$ لإيجاد فاصلة نقطة ترتيبها معلوم.',
    numbers: { a: '0,75', y10: '7,5', x45: '6' },
  },
  judge: {
    source: src('know-1b', 90, 'معارف', 1),
    exercise: 'رُسمت النقط $(1\\ ;\\ 3)$ و $(2\\ ;\\ 5)$ و $(4\\ ;\\ 9)$ . هل تُمثّل وضعية تناسبية؟',
    solution: [
      'النقط على استقامة واحدة: كلّما زادت الفاصلة بـ $1$ زاد الترتيب بـ $2$ .',
      'لكنّ المستقيم لا يمرّ بـ $O$ : لو كان الترتيب متناسبًا مع الفاصلة لكانت النقطة التي فاصلتها $1$ ترتيبها $\\frac{5}{2} = 2{,}5$ لا $3$ .',
      'إذن التمثيل لا يُمثّل وضعية تناسبية.',
    ],
    rule: 'للحكم: (1) هل النقط على استقامة واحدة؟ (2) هل المستقيم يمرّ بـ $O$ ؟ نعم ونعم ⟸ تناسبية؛ وإذا كان أحد الجوابين لا فليست تناسبية.',
    numbers: { ratio1: '3', ratio2: '2,5' },
  },
};

/** « أستعدّ » — أستعدّ p. 87, items 1, 4, 5 et 6, RÉÉCRITS en affirmations. */
export const PREP_ITEMS = [
  { n: 1, skill: 'jadwal', text: 'الجدول $4, 6, 12 \\to 6, 9, 18$ جدول تناسبية.', answer: true, why: '$\\frac{6}{4} = \\frac{9}{6} = \\frac{18}{12} = 1{,}5$ : المعامل نفسه في الأعمدة الثلاثة.' },
  { n: 1, skill: 'jadwal', text: 'الجدول $0, 6, 7 \\to 8, 48, 56$ جدول تناسبية.', answer: false, why: 'في جدول التناسبية يقابل $0$ العددُ $0$ ، وهنا $0 \\to 8$ ؛ فليس جدول تناسبية (مع أنّ $\\frac{48}{6} = \\frac{56}{7} = 8$ ).' },
  { n: 4, skill: 'jadwal', text: 'يربط جدول $7\\ \\mathrm{kg}$ بـ $600$ دج و $14\\ \\mathrm{kg}$ بـ $1200$ دج، فمعامل التناسبية من الكتلة إلى الثمن هو $\\frac{600}{7}$ .', answer: true, why: 'ننتقل من $7$ إلى $600$ بالضرب في $\\frac{600}{7}$ ، ومن $14$ إلى $1200$ بالضرب فيه كذلك.' },
  { n: 5, skill: 'jadwal', text: 'في جدول التناسبية $2{,}8 \\to 0{,}4$ و $7{,}6 \\to x$ ، يكون $x = \\frac{2{,}8 \\times 7{,}6}{0{,}4}$ .', answer: false, why: 'المجهول $x = \\frac{0{,}4 \\times 7{,}6}{2{,}8}$ : ضرب القطر ثم القسمة على العدد الباقي من القطر الآخر.' },
  { n: 6, skill: 'nuqta', text: 'إحداثيا النقطة $A$ التي فاصلتها $2$ وترتيبها $3$ هما $(3\\ ;\\ 2)$ .', answer: false, why: 'الفاصلة أولًا ثم الترتيب: $A(2\\ ;\\ 3)$ .' },
].map((it) => ({ ...it, source: src('prep', 87, 'أستعدّ', it.n) }));

/**
 * Les items de la PLATEFORME : le réseau dit que la leçon s'appuie sur `2am.m6.r01` (التعرّف على وضعية تناسبية من جدول — leçon 2AM
 * `wadiya-tanasubiya-jadwal`) et `2am.m4.r04` (إحداثيا نقطة — leçon 2AM `talim-nuqta-mustawi`) ; « أستعدّ » doit les mesurer (LEARNING_NET.md §4.4).
 */
export const PREP_PLATFORM_ITEMS = [
  { skill: 'jadwal', text: 'الجدول $1, 2, 3 \\to 4, 8, 11$ جدول تناسبية.', answer: false, why: '$\\frac{4}{1} = 4$ و $\\frac{8}{2} = 4$ لكنّ $\\frac{11}{3}$ ليس $4$ .' },
  { skill: 'jadwal', text: 'في جدول التناسبية، ناتج قسمة العدد الثاني على الأول هو نفسه في كلّ عمود.', answer: true, why: 'هذا الناتج هو معامل التناسبية.' },
  { skill: 'nuqta', text: 'النقطة $B(5\\ ;\\ 0)$ تقع على المحور الأفقي.', answer: true, why: 'ترتيبها $0$ ، فهي على محور الفواصل.' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les phrases de correction partagées par les modules ET la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  lineAny: {
    wrong: 'النقط $(1\\ ;\\ 3)$ و $(2\\ ;\\ 5)$ و $(4\\ ;\\ 9)$ على استقامة واحدة، إذن الوضعية تناسبية.',
    why: 'الاستقامة وحدها لا تكفي: المستقيم يجب أن يمرّ أيضًا بمبدأ المعلم $O$ .',
    right: 'لو كانت تناسبية لكان ترتيب النقطة التي فاصلتها $1$ هو $2{,}5$ لا $3$ ؛ فالمستقيم يقطع المحور العمودي عند $1$ لا عند $0$ .',
  },
  swap: {
    wrong: 'العمود $6 \\to 30$ هو النقطة $(30\\ ;\\ 6)$ .',
    why: 'العدد الأول يوضع على المحور الأفقي (الفاصلة) والثاني على المحور العمودي (الترتيب).',
    right: 'النقطة $(6\\ ;\\ 30)$ .',
  },
  onePin: 'كلّ عمود من الجدول يعطي نقطة، وفاصلتها العدد الأول وترتيبها العدد الثاني.',
  onO: 'نقط التناسبية تقع كلّها على مستقيم واحد يمرّ بـ $O$ ؛ ومعامل التناسبية هو ترتيب النقطة التي فاصلتها $1$ .',
};
