/**
 * Le contenu du درس « حلّ مشكل باستعمال معادلة » (2AM, unité 4) — données pures. Le manuel (docs/sources/2am/unit4/extraction.json) est la RÉFÉRENCE des الكفاءات, pas le script : les nombres, les contextes et
 * les mots sont ceux de la plateforme ; chaque bloc cite l'élément dont il reprend l'IDÉE (`src(<id>)`), et ce qui n'en vient pas est un ajout DÉCLARÉ (`addition(<raison>)`). Les modules rendent ces données ; ils n'en réécrivent aucune.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** Le labo `juice-line` : l'entrée de la plateforme (l'idée de l'activité 4 du manuel — une situation, plusieurs équations justes — est reprise par les cartes d'équations du labo et par un exercice de « أتمرّن »). */
export const LAB = {
  source: addition('platform_designed_entry'),
  /** Le labo de « معارف » : la tâche t1 posée SEULE (18 L, 12 bouteilles → 1,5 L). */
  maarif: { total: '18', bottles: 12, x: '1,5' },
  tasks: { t1: { total: '18', bottles: 12, x: '1,5' }, t2: { total: '30', bottles: 40, x: '0,75' }, t3: { total: '9', bottles: 36, x: '0,25' }, a1: { bottles: 24, size: '0,25', total: '6' }, a2: { bottles: 15, size: '1,5', total: '22,5' }, a3: { bottles: 40, size: '0,25', carry: '4', total: '10', press: '6' } },
};

/** « تذكّر — السنة الأولى » (la leçon 1AM `bahth-adad-naqisa` est PUBLIÉE depuis le 2026-10-30 : AVEC lien, `lesson`) et le lien vers `ibara-harfiya-intaj` (leçon PUBLIÉE de l'unité : avec lien). */
export const RECALLS = {
  year1: {
    source: addition('prior_year_reminder'), lesson: 'bahth-adad-naqisa', title: 'تذكّر — السنة الأولى متوسط',
    text: 'في السنة الأولى أتممنا مساويات ناقصة: $7+\\ldots=12{,}5$ فالعدد الناقص $5{,}5$ ، و $6\\times\\ldots=15$ فالعدد الناقص $2{,}5$ . نجد العدد الناقص بالعملية العكسية.',
  },
  expression: {
    source: addition('prior_year_reminder'), lesson: 'ibara-harfiya-intaj', title: 'تذكّر — العبارة الحرفية',
    text: 'تعلّمنا أن نكتب بالحرف $x$ ما نجهله: $2x+240$ هو ضعف $x$ مضافًا إليه $240$ ، وقيمته تتغيّر مع $x$ . ومساواة تحتوي حرفًا هي ما سنسمّيه الآن معادلة.',
  },
};

/** معارف (idée de know-5) — les mots « معادلة » و « حلّ », les trois formes, la vérification, les deux opérations. */
export const KNOWLEDGE = {
  definition: {
    source: src('know-5', 60, 'معارف', 5),
    text: 'المعادلة مساواة فيها عدد مجهول نرمز إليه بحرف. حلّ المعادلة هو القيمة التي تجعل المساواة صحيحة، ونتحقّق منه بإنجاز العملية.',
    example: 'العدد $3$ حلّ للمعادلة $\\frac{12}{x}=4$ لأنّ $12\\div3=4$ .',
  },
  forms: {
    source: src('know-5', 60, 'معارف', 5),
    text: 'نجد العدد الناقص بالعملية العكسية: إذا كان $a\\times x=b$ فإنّ $x=b\\div a$ ؛ وإذا كان $\\frac{x}{a}=b$ فإنّ $x=a\\times b$ ؛ وإذا كان $\\frac{a}{x}=b$ فإنّ $x=a\\div b$ .',
    example: '$2{,}5\\times x=10$ فإنّ $x=4$ ؛ و $\\frac{x}{0{,}4}=15$ فإنّ $x=6$ ؛ و $\\frac{56}{x}=7$ فإنّ $x=8$ .',
  },
  twoSteps: {
    source: addition('knowledge_formalization'),
    text: 'في معادلة فيها عمليتان نُلغي آخر عملية أوّلًا ثمّ التي قبلها: $2x+240=300$ فإنّ $2x=60$ ومنه $x=30$ .',
    example: '$\\frac{4+x}{0{,}25}=40$ فإنّ $4+x=10$ ومنه $x=6$ .',
  },
};

/** طريقة (idées de method-4 et method-5 ; nombres de la plateforme) — traduire, un diviseur manquant, un dividende et un facteur manquants, deux opérations. */
export const METHOD = {
  source: src('method-4', 61, 'طرائق', 4),
  solve: src('method-5', 61, 'طرائق', 5),
  exercise: 'اشترت سلمى كتابًا ثمنه $x$ دينارًا ومجلّة بـ $150$ دينارًا، واشترى أنس كتابين من النوع نفسه وقلمًا بـ $60$ دينارًا، فصرفا المبلغ نفسه. اكتب المعادلة، ثمّ حلّ: $\\frac{63}{x}=4{,}5$ ، و $\\frac{x}{2{,}5}=6$ ، و $1{,}2\\times x=9$ ، و $2x+240=300$ .',
  solution: [
    'نسمّي ثمن الكتاب $x$ : سلمى صرفت $x+150$ وأنس صرف $2x+60$ ، فالمعادلة $x+150=2x+60$ . (سنعرف لاحقًا كيف نجد $x$ .)',
    '$\\frac{63}{x}=4{,}5$ : نبحث عن $x$ حيث $4{,}5\\times x=63$ ، فـ $x=63\\div4{,}5=14$ . نتحقّق: $63\\div14=4{,}5$ .',
    '$\\frac{x}{2{,}5}=6$ فـ $x=2{,}5\\times6=15$ ؛ و $1{,}2\\times x=9$ فـ $x=9\\div1{,}2=7{,}5$ .',
    '$2x+240=300$ : آخر عملية هي «$+240$» فنلغيها أوّلًا: $2x=300-240=60$ ثمّ $x=60\\div2=30$ . نتحقّق: $2\\times30+240=300$ .',
  ],
  rule: 'نسمّي المجهول بحرف، ونكتب المعادلة، ونجد العدد الناقص بالعملية العكسية (ونُلغي آخر عملية أوّلًا)، ثمّ نتحقّق.',
  numbers: { salma: 'x+150', anis: '2x+60', divisor: { a: '63', b: '4,5', x: 14 }, dividend: { a: '2,5', b: 6, x: 15 }, factor: { a: '1,2', b: 9, x: '7,5' }, two: { k: 2, c: 240, d: 300, x: 30 } },
};

/** « أستعدّ » — six affirmations : « العدد الناقص » (1AM `bahth-adad-naqisa`, PUBLIÉE : items 1 et 2 — le lien « راجع » du réseau `1am.m5.r10`), le quotient d'un décimal, × et ÷, une longueur en x (prep 6–9). */
export const PREP_ITEMS = [
  { skill: 'longueur', text: 'قطعة $[AB]$ طولها $12$ ، والنقطة $M$ منها حيث $AM=x$ . إذن $MB=12-x$ .', answer: true, why: 'الجزء الباقي هو $12$ ناقص الجزء $x$ : $MB=12-x$ .', n: 7 },
].map((it) => ({ ...it, source: src('prep', 55, 'أستعدّ', it.n) }));

export const PREP_PLATFORM_ITEMS = [
  { skill: 'naqis', text: 'العدد الناقص في $7+\\ldots=12{,}5$ هو $5{,}5$ .', answer: true, why: 'نجده بالعملية العكسية: $12{,}5-7=5{,}5$ .' },
  { skill: 'naqis', text: 'العدد الناقص في $6\\times\\ldots=15$ هو $9$ .', answer: false, why: 'العدد الناقص هو $15\\div6=2{,}5$ ؛ أمّا $9$ فهو $15-6$ .' },
  { skill: 'qisma', text: '$4{,}5\\div0{,}9=5$ .', answer: true, why: '$0{,}9\\times5=4{,}5$ .' },
  { skill: 'qisma', text: 'إذا كان $8\\times7=56$ فإنّ $56\\div7=8$ .', answer: true, why: 'الضرب والقسمة عمليتان عكسيتان.' },
  { skill: 'ibara', text: 'من أجل $x=1{,}5$ قيمة $4x$ هي $5{,}5$ .', answer: false, why: '$4x=4\\times1{,}5=6$ ، لا $4+1{,}5$ .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les phrases de correction partagées par les modules ET la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  fill: 'خزّان فيه $18$ لترًا يملأ $12$ قارورة تمامًا: $12$ قارورة سعة كلّ منها $x$ لترًا تحوي $12\\times x$ لترًا، فالمعادلة $12\\times x=18$ ، وهي نفسها $\\frac{18}{x}=12$ .',
  divisor: 'العدد الناقص $x$ في $12\\times x=18$ نجده بالقسمة: $x=18\\div12=1{,}5$ لتر. نتحقّق بقارورة سعتها $1{,}5$ : تمتلئ $12$ قارورة ولا يبقى شيء.',
  rule: 'القاسم الناقص يساوي المقسوم مقسومًا على حاصل القسمة: $\\frac{30}{x}=40$ فإنّ $x=30\\div40=0{,}75$ .',
  dividend: 'المقسوم الناقص يساوي المقسوم عليه مضروبًا في حاصل القسمة: $\\frac{x}{24}=0{,}25$ فإنّ $x=24\\times0{,}25=6$ لترات.',
  twoSteps: 'في $\\frac{4+x}{0{,}25}=40$ آخر عملية هي القسمة على $0{,}25$ فنلغيها أوّلًا: $4+x=40\\times0{,}25=10$ ثمّ $x=10-4=6$ .',
  check: 'نتحقّق بإنجاز العملية: $\\frac{63}{14}=4{,}5$ ، فالعدد $14$ حلّ للمعادلة $\\frac{63}{x}=4{,}5$ .',
};

/** مسألة 1 — خطوات الروبوت (module 5 ; ex-40 : une différence qui se répète à chaque pas). */
export const ROBOT = { human: '0,6', robot: '1,8', gap: '1,2', distance: 18, steps: 15, check: [27, 9, 18] };
/** مسألة 2 — سياج قطعة الأرض (module 6 ; deep-59 : un périmètre donne une dimension). */
export const FENCE = { length: 85, perimeter: 250, expr: '2x+170', width: 40, price: 120, cost: 30000 };
/** مسألة 3 — قوارير زيت الزيتون (module 7 ; ex-39 : un diviseur décimal). */
export const OIL = { total: '157,5', bottles: 210, size: '0,75', at15: 105, at025: 630 };
