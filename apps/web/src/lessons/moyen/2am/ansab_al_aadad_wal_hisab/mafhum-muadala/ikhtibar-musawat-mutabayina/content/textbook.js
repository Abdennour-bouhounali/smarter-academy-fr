/**
 * Le contenu du درس « اختبار صحة مساواة أو متباينة » (2AM, unité 4) — données pures. Le manuel (docs/sources/2am/unit4/extraction.json) est la RÉFÉRENCE des الكفاءات, pas le script : les nombres, les contextes et
 * les mots sont ceux de la plateforme ; chaque bloc cite l'élément dont il reprend l'IDÉE (`src(<id>)`), et ce qui n'en vient pas est un ajout DÉCLARÉ (`addition(<raison>)`). Les modules rendent ces données ; ils n'en réécrivent aucune.
 * Le mot « معادلة » et le mot « حلّ » n'apparaissent PAS ici : ils appartiennent à `hall-mushkil-muadala` (plan de l'unité, « renvois »).
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** Le labo `bridge-load` : l'entrée de la plateforme (l'idée de l'activité 3 du manuel — tester une égalité à deux inconnues par des valeurs données — est reprise par le camion à deux sortes de sacs et par un exercice). */
export const LAB = {
  source: addition('platform_designed_entry'),
  /** Le labo de « معارف » : la tâche k1 posée SEULE (4000 + 50 × 12 = 4600 < 5000). */
  maarif: { x: 12, mass: 4600, limit: 5000 },
  tasks: {
    b1: { rule: '4000+50x<5000', pass: [15, 18, 19], fail: [20, 21, 22], masses: { 15: 4750, 22: 5100, 20: 5000 } },
    b2: { rule: '4500+50x+40y<7000', pairs: [[20, 30, 6700], [30, 25, 7000], [25, 35, 7150]] },
    b3: { a: '3000+70x', b: '3600+50x', equalAt: 30, mass: 5100 },
    a1: { counter: 31, a: 5170, b: 5150 },
    a2: { counter: 0, a: 2000, b: 2400 },
    a3: { cards: [[10, 40, 6600], [30, 25, 7000], [40, 15, 7100], [25, 30, 6950]], pass: [0, 1, 3] },
  },
};

/** « تذكّر » : la 1AM `tatbiq-qaida-harfiya` est PUBLIÉE depuis le 2026-10-30 (AVEC lien, `lesson`) ; `majmu-jabri` et `tawzi-darb-jam-tarh` sont PUBLIÉES (avec lien). */
export const RECALLS = {
  year1: {
    source: addition('prior_year_reminder'), lesson: 'tatbiq-qaida-harfiya', title: 'تذكّر — السنة الأولى متوسط',
    text: 'في السنة الأولى طبّقنا قاعدة حرفية: محيط مربّع ضلعه $c$ هو $P=4\\times c$ ، ومن أجل $c=2{,}5$ نجد $P=10$ . نعوّض الحرف بقيمته ثمّ نحسب.',
  },
  jabri: {
    source: addition('prior_year_reminder'), lesson: 'majmu-jabri', title: 'تذكّر — المجموع الجبري',
    text: 'تعلّمنا حساب مجموع جبري بتحويل كلّ طرح إلى جمع للمعاكس: $-7+4-(-8)=-7+4+8=5$ . سنحتاجه حين نعوّض بأعداد سالبة.',
  },
  tawzi: {
    source: addition('prior_year_reminder'), lesson: 'tawzi-darb-jam-tarh', title: 'تذكّر — خاصية التوزيع',
    text: 'تعلّمنا أنّ $2(x+3)=2x+6$ مهما كان العدد $x$ ، لأنّ التوزيع قاعدة صحيحة دائمًا.',
  },
};

/** معارف (idées de know-3 et know-4 ; nombres de la plateforme) — tester une égalité, deux expressions égales, le contre-exemple, tester une inégalité, les quatre signes. */
export const KNOWLEDGE = {
  test: {
    source: src('know-3', 60, 'معارف', 3),
    text: 'لاختبار صحّة مساواة من أجل قيمة نعوّض الحرف بالقيمة في الطرفين وننجز الحساب في كلّ طرف، فإن أعطى الطرفان العدد نفسه فالمساواة صحيحة، وإلّا فهي خاطئة.',
    example: '$3x+2=2x+9$ صحيحة من أجل $x=7$ لأنّ $3\\times7+2=23$ و $2\\times7+9=23$ ؛ وخاطئة من أجل $x=5$ لأنّ $17\\neq19$ .',
  },
  equal: {
    source: src('know-3', 60, 'معارف', 3),
    text: 'تكون عبارتان حرفيتان متساويتين إذا أعطتا القيمة نفسها مهما كانت قيمة الحرف، ونعرف ذلك بقاعدة معروفة مثل التوزيع: $2(x+3)$ و $2x+6$ متساويتان دائمًا.',
    example: 'التساوي من أجل بعض القيم لا يكفي: $x^2+4$ و $5x$ يعطيان $5$ من أجل $1$ و $20$ من أجل $4$ ، لكنّهما غير متساويتين لأنّ $x=0$ يعطي $4\\neq0$ .',
  },
  counter: {
    source: src('know-3', 60, 'معارف', 3),
    text: 'لإثبات أنّ عبارتين غير متساويتين يكفي مثال مضادّ واحد: قيمة واحدة للحرف تعطي عندها عددين مختلفين. أمّا إثبات التساوي فلا يكفي فيه أيّ عدد من الأمثلة.',
    example: 'مثال مضادّ: $3x+x$ و $3x^2$ من أجل $x=1$ : $4\\neq3$ .',
  },
  inequality: {
    source: src('know-4', 60, 'معارف', 4),
    text: 'لاختبار متباينة من أجل قيمة نعوّض ونحسب الطرفين ثمّ نقارن العددين بالرمز المطلوب: $<$ أصغر تمامًا، $>$ أكبر تمامًا، $\\le$ أصغر أو يساوي، $\\ge$ أكبر أو يساوي.',
    example: '$3+5x<20$ صحيحة من أجل $x=3$ لأنّ $18<20$ ، وخاطئة من أجل $x=4$ لأنّ $23<20$ خاطئة.',
  },
};

/** طريقة (idée de method-3 ; nombres de la plateforme) — le tableau « النتيجة », deux inconnues, des valeurs données, un contre-exemple. */
export const METHOD = {
  source: src('method-3', 61, 'طرائق', 3),
  exercise: 'اختبر المساواة $2x+9=5x-3$ من أجل $x=4$ ثمّ $x=2$ ؛ والمساواة $3x+2y=24$ من أجل $(x;y)=(4;6)$ ثمّ $(6;4)$ ؛ وعيّن من بين $3$ و $4$ و $5$ و $6$ القيم التي تجعل $4x-3\\le2x+7$ صحيحة ؛ وهل $3x+x$ و $3x^2$ متساويتان؟',
  solution: [
    '$x=4$ : الطرف الأوّل $2\\times4+9=17$ والثاني $5\\times4-3=17$ ، فالمساواة صحيحة. $x=2$ : $2\\times2+9=13$ و $5\\times2-3=7$ ، و $13\\neq7$ : خاطئة.',
    'عددان مجهولان: $(4;6)$ يعطي $3\\times4+2\\times6=12+12=24$ ، صحيحة. $(6;4)$ يعطي $3\\times6+2\\times4=18+8=26\\neq24$ ، خاطئة: ترتيب القيمتين مهمّ.',
    '$x=3$ : $9\\le13$ صحيحة ؛ $x=4$ : $13\\le15$ صحيحة ؛ $x=5$ : $17\\le17$ صحيحة (الرمز $\\le$ يقبل التساوي) ؛ $x=6$ : $21\\le19$ خاطئة. القيم هي $3$ و $4$ و $5$ .',
    'من أجل $x=1$ : $3\\times1+1=4$ و $3\\times1^2=3$ ، و $4\\neq3$ ، فمثال واحد يكفي لنقول إنّهما غير متساويتين. (أمّا $3x+x=4x$ فصحيحة دائمًا.)',
  ],
  rule: 'لاختبار مساواة أو متباينة من أجل قيمة: نعوّض الحرف بالقيمة في الطرفين، ننجز الحساب في كلّ طرف، ثمّ نقارن النتيجتين.',
  numbers: { s1: { x: 4, l: 17, r: 17 }, s1b: { x: 2, l: 13, r: 7 }, s2: { pair: [4, 6], v: 24 }, s2b: { pair: [6, 4], v: 26 }, s3: [[3, 9, 13], [4, 13, 15], [5, 17, 17], [6, 21, 19]], s4: { x: 1, l: 4, r: 3 } },
};

/** « أستعدّ » — six affirmations : la valeur d'une expression (1AM `tatbiq-qaida-harfiya`, PUBLIÉE — items 1 et 2), la somme algébrique (`majmu-jabri` : items 3 et 4), la comparaison de décimaux et de relatifs. */
export const PREP_ITEMS = [];

export const PREP_PLATFORM_ITEMS = [
  { skill: 'qima', text: 'قيمة $3x+5$ من أجل $x=4$ هي $17$ .', answer: true, why: '$3\\times4+5=12+5=17$ .' },
  { skill: 'qima', text: 'قيمة $2a+b$ من أجل $a=3$ و $b=1{,}5$ هي $9$ .', answer: false, why: '$2\\times3+1{,}5=6+1{,}5=7{,}5$ ، لا $9$ .' },
  { skill: 'jabri', text: '$-7+4-(-8)=5$ .', answer: true, why: '$-7+4+8=-3+8=5$ : طرح $(-8)$ هو جمع $8$ .' },
  { skill: 'jabri', text: '$(+5)-(+9)=4$ .', answer: false, why: '$5-9=-4$ ، لا $4$ : نطرح الأصغر من الأكبر ونأخذ إشارة الأبعد عن الصفر.' },
  { skill: 'ushri', text: '$12{,}05>12{,}5$ .', answer: false, why: '$12{,}05=12{,}05$ و $12{,}5=12{,}50$ ، و $05<50$ ، فـ $12{,}05<12{,}5$ .' },
  { skill: 'nisbi', text: '$-3<-1$ .', answer: true, why: 'على المستقيم المدرّج $-3$ يقع على يسار $-1$ ، فهو الأصغر.' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les phrases de correction partagées par les modules ET la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  line: 'يكتب الميزان ما يفعله الحساب: يعوّض عدد الأكياس في القاعدة ثمّ يحسب الطرف: $4000+50\\times15=4750$ ، ثمّ يقارن: $4750<5000$ فالمتباينة صحيحة من أجل $x=15$ .',
  edge: 'من أجل $x=20$ كتلة الشاحنة $4000+50\\times20=5000$ ، و $5000$ ليس أقلّ تمامًا من $5000$ ، فالمتباينة $5000<5000$ خاطئة ولا تعبر الشاحنة.',
  two: 'قاعدة الجسر $4500+50x+40y<7000$ فيها مجهولان: $x$ عدد أكياس الإسمنت و $y$ عدد أكياس الرمل، ونعوّض بقيمتين معًا: من أجل $(20;30)$ نحسب $4500+1000+1200=6700<7000$ .',
  equality: 'شاحنتان تحملان الحمولة نفسها $x$ : $3000+70x$ و $3600+50x$ . من أجل $x=30$ كتلتاهما $5100$ و $5100$ ، فالمساواة صحيحة من أجل $x=30$ ؛ ومن أجل $x=20$ هما $4400\\neq4600$ .',
  counter: 'ادّعى ياسين أنّ الشاحنة A أخفّ من B دائمًا: من أجل $x=31$ كتلتاهما $5170>5150$ ، فحمولة واحدة تكفي لإبطال ادّعائه.',
  oneValue: 'عبارتان تتساويان من أجل قيمة واحدة لا تكفي لتكونا متساويتين: $2000+100x$ و $2400+60x$ تتساويان من أجل $x=10$ ، لكنّهما $2000\\neq2400$ من أجل $x=0$ .',
  given: 'حين نُعطى قيمًا نختبرها واحدة واحدة: في $4x-3\\le2x+7$ نجد أنّ $3$ و $4$ و $5$ تصحّحها، و $6$ لا (لأنّ $21\\le19$ خاطئة).',
};

/** مسألة 1 — مصعد العمارة (module 5 ; deep-54-like : une inégalité testée à des valeurs données). */
export const LIFT = { limit: 630, box: 45, person: 70, ok: { x: 8, mass: 605 }, no: { x: 9, mass: 675 } };
/** مسألة 2 — أعلام الحيّ (module 6 ; une égalité testée à des prix donnés). */
export const FLAGS = { tests: [[150, 1800, 1500], [225, 2250, 2250], [300, 2700, 3000]], price: 225, paid: 2250 };
/** مسألة 3 — ادّعاءان عن الأعداد المتتالية (module 7 ; deep-54 et un jumeau faux). */
export const CLAIMS = { nums: [4, 5, 6], sum: 15, middle: 5, product: 120, cube: 125 };
