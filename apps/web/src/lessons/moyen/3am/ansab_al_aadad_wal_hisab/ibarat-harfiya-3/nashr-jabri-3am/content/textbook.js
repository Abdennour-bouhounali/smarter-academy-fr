/**
 * Le contenu du درس « نشر عبارات جبرية » (3AM, unité 4) — données pures. Le manuel (docs/sources/3am/unit4/extraction.json) est la RÉFÉRENCE des
 * الكفاءات : tout est réécrit par la plateforme (autres mots, autres nombres, autres contextes — guide §4ter-bis) ; chaque bloc cite l'élément
 * dont il est tiré (`src`) pour la traçabilité de `check:textbook`. Les tâches du labo (`LAB`) sont celles des préréglages de
 * `manipulations/levels.js › area-split` (module 1) et de `logic/areaSplit.js › ARROW_TASKS` (module 3, monde `arrows`).
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** Les réglages des labos : mêmes valeurs que `levels.js` (module 1) et `ARROW_TASKS` (module 3). */
export const LAB = {
  plot: {
    beginner: [{ id: 'p1', h: { m: 0, n: 3 }, w: { m: 1, n: 4 }, answer: '3x+12' }, { id: 'p2', h: { m: 0, n: 2 }, w: { m: 1, n: -3 }, answer: '2x-6' }],
    advanced: [{ id: 'p3', h: { m: 1, n: 3 }, w: { m: 1, n: 2 }, answer: 'x^2+5x+6' }, { id: 'p4', h: { m: 1, n: -2 }, w: { m: 1, n: -3 }, answer: 'x^2-5x+6' }],
  },
  arrows: [
    { id: 'a1', written: '5(x+2)', answer: '5x+10' },
    { id: 'a2', written: '-3(x-4)', answer: '-3x+12' },
    { id: 'a3', written: '(2x+1)(x-3)', answer: '2x^2-5x-3' },
    { id: 'a4', written: '3(2-x)-4(x-1)', answer: '-7x+10' },
  ],
};

/** Les connaissances (معارف) — les mots de la plateforme. */
export const KNOWLEDGE = {
  areaTwoWays: {
    source: addition('knowledge_formalization'),
    text: 'مساحة المستطيل تُحصى مرّتين: مرّةً بجداء بعديه، ومرّةً بمجموع مساحات أجزائه. النتيجتان متساويتان مهما كانت قيمة $x$: $3(x+4)=3x+12$.',
  },
  bite: {
    source: addition('knowledge_formalization'),
    text: 'إذا اقتُطع من الأرض ممرّ، فمساحة ما بقي هي مساحة الأرض كلها مطروحًا منها مساحة الممرّ: $2(x-3)=2x-6$.',
  },
  corner: {
    source: addition('knowledge_formalization'),
    text: 'عندما يقتطع ممرّان متقاطعان من الأرض نفسها، يُطرح ركنهما مرّتين، فنردّه مرّة واحدة: $(x-2)(x-3)=x^2-3x-2x+6$ ، فحدّ الركن $(-2)\\times(-3)=+6$ موجب.',
  },
  distribute1: {
    source: src('know-3', 58, 'معارف', 3),
    text: 'نشر جداء يعني كتابته على شكل مجموع. الضرب يتوزّع على الجمع وعلى الطرح: $k(a+b)=ka+kb$ و $k(a-b)=ka-kb$ ، مثل $5(x+2)=5x+10$.',
  },
  distribute2: {
    source: src('know-3', 58, 'معارف', 3),
    text: 'ننشر جداء مجموعين بضرب كل حدّ من القوس الأول في كل حدّ من القوس الثاني ثم نجمع الجداءات: $(a+b)(c+d)=ac+ad+bc+bd$.',
  },
  signs: {
    source: src('know-3', 58, 'معارف', 3),
    text: 'إشارة جداء حدّين: $(+)\\times(-)=-$ و $(-)\\times(-)=+$ ، مثل $(-3)\\times(x-4)=-3x+12$ ، فنكتب كل جداء مع إشارته.',
  },
  bridge: {
    source: src('know-3', 58, 'معارف', 3),
    text: 'القاعدة التي عرفتها لحذف قوسين مسبوقين بـ $-$ هي هذه الخاصية نفسها: $-(x-3)=(-1)\\times(x-3)=-x+3$ ، فتتغيّر إشارة كل حدّ.',
  },
  order: {
    source: src('method-3', 59, 'طرائق', 3),
    text: 'بعد النشر نجمع الحدود المتشابهة ونرتّب العبارة حسب قوى $x$ تنازليًا: $6x-3x^2+8-4x=-3x^2+2x+8$.',
  },
  check: {
    source: addition('knowledge_formalization'),
    text: 'نراقب النشر بقيمة لـ $x$: للعبارة وصورتها المنشورة القيمة نفسها مهما كان $x$. فإن اختلفت القيمتان عند $x$ واحد فالنشر خاطئ، وإن اتفقتا عنده فقد يكون خاطئًا مع ذلك، فنجرّب قيمة أخرى.',
  },
};

/** « تذكّر » — la leçon PUBLIÉE de l'unité (tabsit-hadhf-aqwas) : RAPPELÉE, jamais reconstruite. */
export const RECALL_SIMPLIFY = {
  source: addition('prior_year_reminder'),
  title: 'تذكّر — تبسيط عبارة جبرية',
  text: 'عرفتَ في الدرس السابق أنّ الحدود المتشابهة وحدها تُجمع: $3x+5x=8x$ أمّا $x^2$ و $x$ فلا تُجمعان، وأنّ قوسين مسبوقين بـ $-$ نغيّر إشارة كل حدّ بينهما. بعد النشر نبسّط بهذا كله.',
  lesson: 'tabsit-hadhf-aqwas',
};

/** طريقة p. 59 (« نشر عبارة حرفية وتبسيطها (1) و (2) ») — réécrites, autres nombres. */
export const METHOD_EXPAND = {
  source: src('method-2', 59, 'طرائق', 2),
  title: 'أنشر وأبسّط عبارة حرفية',
  exercise: 'انشر وبسّط العبارة $A=3(2-5x)-4(x-1)+x(7-2x)$.',
  solution: [
    '1. ننشر كل جداء بتوزيع العامل على كل حدّ مع إشارته: $A=3\\times2+3\\times(-5x)-4\\times x-4\\times(-1)+x\\times7+x\\times(-2x)$.',
    '2. نحسب كل جداء: $A=6-15x-4x+4+7x-2x^2$.',
    '3. نجمع الحدود المتشابهة: $A=-2x^2+(-15-4+7)x+(6+4)$.',
    '4. نرتّب تنازليًا: $A=-2x^2-12x+10$.',
    '5. نراقب عند $x=2$: العبارة الأصلية $-24-4+6=-22$ والمنشورة $-8-24+10=-22$.',
  ],
  rule: 'ننشر كل جداء، ثم نجمع الحدود المتشابهة، ثم نرتّب حسب قوى x تنازليًا.',
};
export const METHOD_DOUBLE = {
  source: src('method-3', 59, 'طرائق', 3),
  title: 'أنشر جداء مجموعين وأبسّط',
  exercise: 'انشر وبسّط العبارة $B=(2x+3)(5-x)$.',
  solution: [
    '1. كل حدّ من القوس الأول يضرب كل حدّ من الثاني: $B=2x\\times5+2x\\times(-x)+3\\times5+3\\times(-x)$.',
    '2. نحسب الجداءات: $B=10x-2x^2+15-3x$.',
    '3. نجمع الحدّين المتشابهين ونرتّب: $B=-2x^2+7x+15$.',
    '4. نراقب عند $x=1$: $(2+3)(5-1)=20$ و $-2+7+15=20$.',
  ],
  rule: 'أربعة جداءات لأربعة أسهم، ثم نجمع المتشابهة ونرتّب.',
};

/** « أستعدّ » — six affirmations : le produit de deux rationnels (1–2, `jidaa-adadayn-nisbiyayn`), la simplification (3–4, `tabsit-hadhf-aqwas`), l'aire et le périmètre écrits (5–6, أستعدّ 11 et 10). */
export const PREP_ITEMS = [
  { skill: 'jidaa', text: '$(-4)\\times(-6)=24$.', answer: true, why: 'جداء عددين سالبين موجب: $4\\times6=24$.', source: addition('prerequisite_diagnostic') },
  { skill: 'jidaa', text: '$(-5)\\times3=15$.', answer: false, why: 'جداء عدد سالب وعدد موجب سالب: $(-5)\\times3=-15$.', source: addition('prerequisite_diagnostic') },
  { skill: 'tabsit', text: '$5x+2-3x=2x+2$.', answer: true, why: 'نجمع الحدّين المتشابهين: $5x-3x=2x$ ويبقى $2$.', source: addition('prerequisite_diagnostic') },
  { skill: 'tabsit', text: '$9-(x-4)=9-x-4$.', answer: false, why: 'القوسان مسبوقان بـ $-$ فتتغيّر إشارة كل حدّ: $9-x+4=13-x$.', source: addition('prerequisite_diagnostic') },
  { skill: 'maseha', text: 'مساحة مستطيل بعداه $7$ و $(x+5)$ هي $7(x+5)$.', answer: true, why: 'مساحة المستطيل جداء بعديه.', source: src('prep', 55, 'أستعدّ', 11) },
  { skill: 'maseha', text: 'محيط مستطيل بعداه $6$ و $(x+10)$ هو $6(x+10)$.', answer: false, why: '$6(x+10)$ هي مساحته. المحيط مجموع أضلاعه: $2(x+10)+2\\times6$.', source: src('prep', 55, 'أستعدّ', 10) },
];

/** Les erreurs courantes, mot pour mot (knowledgeGraph.js les cite). */
export const GUIDE = {
  firstOnly: {
    wrong: '$3(x+4)=3x+4$ : ضربنا العدد 3 في الحدّ الأول وحده.',
    why: 'العدد 3 يضرب القوس كله. عند $x=5$ قيمة $3(x+4)$ تساوي 27 أمّا $3x+4$ فتساوي 19.',
    right: '$3(x+4)=3x+12$ : العامل يضرب كل حدّ في القوس.',
  },
  corner: {
    wrong: '$(x-2)(x-3)=x^2-5x-6$ : كتبنا جداء $-2$ و $-3$ سالبًا.',
    why: 'ركن الممرّين طُرح مرّتين فيُردّ مرّة. عند $x=10$ قيمة $(x-2)(x-3)$ تساوي 56 أمّا $x^2-5x-6$ فتساوي 44.',
    right: '$(x-2)(x-3)=x^2-5x+6$ : جداء عددين سالبين موجب.',
  },
  twoOnly: {
    wrong: '$(x+3)(x+2)=x^2+6$ : ضربنا الحدّين الأوّلين والحدّين الأخيرين فقط.',
    why: 'ينقص الجداءان $3x$ و $2x$. عند $x=1$ قيمة $(x+3)(x+2)$ تساوي 12 أمّا $x^2+6$ فتساوي 7.',
    right: '$(x+3)(x+2)=x^2+2x+3x+6=x^2+5x+6$ : أربعة جداءات.',
  },
};
