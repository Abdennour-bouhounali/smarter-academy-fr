/**
 * Le contenu du درس « إنتاج عبارة حرفية واستعمالها » (2AM, unité 4) — données pures. Le manuel (docs/sources/2am/unit4/extraction.json) est la RÉFÉRENCE des الكفاءات, pas le script : les nombres,
 * les contextes et les mots sont ceux de la plateforme ; chaque bloc cite l'élément dont il reprend l'IDÉE (`src(<id>)`), et ce qui n'en vient pas est un ajout DÉCLARÉ
 * (`addition(<raison>)`). Les modules rendent ces données ; ils n'en réécrivent aucune.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** Le labo `wax-cells` : l'entrée de la plateforme (l'idée du تحدّي du manuel : compter un motif croissant pour TOUT n). */
export const LAB = {
  source: src('challenge', 54, 'تحدّي'),
  /** Le labo de « معارف » : un seul rang, la règle, puis le rang de 6 cellules (31 tiges). */
  maarif: { rule: '5n+1', n: 6, rods: 31 },
  far: { n: 40, rods: 201 },
  strip: { rule: '8n+3', counts: [11, 19, 27] },
  two: { n: 6, m: 4, rods: 66 },
};

/** « تذكّر » — le rappel de la 1re année (leçon PRÉVUE : jamais de lien) et celui de la distributivité (leçon PUBLIÉE de l'unité 1 : avec lien). */
export const RECALLS = {
  year1: {
    source: addition('prior_year_reminder'), title: 'تذكّر — السنة الأولى متوسط',
    text: 'في السنة الأولى كتبنا عبارات بسيطة بالحروف: مجموع العددين $a$ و $b$ هو $a+b$ ، وأربعة أضعاف العدد $c$ هو $4\\times c$ . سنكتب الآن عبارات أطول ونبسّط كتابتها.',
  },
  distributive: {
    source: addition('prior_year_reminder'), lesson: 'tawzi-darb-jam-tarh', title: 'تذكّر — الخاصية التوزيعية',
    text: 'تعلّمنا أنّ $3\\times(x-5)=3x-15$ : نضرب العدد في كلّ حدّ من القوس. وهي تعمل أيضًا في الاتجاه المعاكس: $5a+2a=(5+2)a=7a$ .',
  },
};

/** معارف — la définition, les conventions (idée de know-1, know-2 ; mots et exemples de la plateforme), le mot d'al-Khwarizmi (opener). */
export const KNOWLEDGE = {
  definition: {
    source: src('know-1', 58, 'معارف', 1),
    text: 'العبارة الحرفية عبارة تكون فيها بعض الأعداد ممثَّلة بحروف. الحرف يمثّل عددًا مجهولًا أو عددًا يتغيّر من حالة إلى أخرى.',
    example: 'محيط مربّع ضلعه $x$ هو $4\\times x$ ، وعدد أعواد صفّ من $n$ خلية هو $5\\times n+1$ .',
  },
  conventions: {
    source: src('know-2', 58, 'معارف', 2),
    text: 'نستغني عن إشارة $\\times$ أمام حرف أو قوس: $5\\times n=5n$ ، $3\\times(n+2)=3(n+2)$ ؛ وبما أنّ $1\\times a=a$ و $0\\times a=0$ و $a\\times b=b\\times a$ نكتب بأبسط شكل.',
    example: '$1\\times a+0\\times b+1\\times b=a+0+b=a+b$ .',
  },
  powers: {
    source: src('know-2', 58, 'معارف', 2),
    text: 'نكتب $a\\times a$ على الشكل $a^2$ ونقرأ «$a$ مربّع»، ونكتب $a\\times a\\times a$ على الشكل $a^3$ ونقرأ «$a$ مكعّب».',
    example: '$3\\times 3=3^2=9$ ، و $10\\times 10\\times 10=10^3=1000$ .',
  },
  like: {
    source: src('know-2', 58, 'معارف', 2),
    text: 'نجمع حدودًا فيها الحرف نفسه بالخاصية التوزيعية قراءةً من اليمين: $k\\times a+m\\times a=(k+m)\\times a$ .',
    example: '$2a+5a-3a=(2+5-3)\\times a=4a$ .',
  },
  history: {
    source: src('opener', 54, 'تمهيد'),
    text: 'استعمل الخوارزمي (781 م – 847 م) كلمة «شيء» للعدد المجهول، ومن هذه الكلمة العربية جاء الحرف $x$ الذي نكتبه اليوم.',
  },
};

/** طريقة — من الكلمات إلى الحرف، تعميم نمط، برنامج حساب، تبسيط (idées de method-1, method-2 ; nombres de la plateforme). */
export const METHOD = {
  source: src('method-1', 59, 'طرائق', 1),
  generalise: src('method-2', 59, 'طرائق', 2),
  exercise: 'كان مع كريم $35$ كرية وربح $x$ كرية. اشترى $6$ علب في كلّ منها $x$ قلمًا. مثلّث متساوي الساقين ساقاه $x$ وقاعدته $7$ . عبّر بدلالة $x$ عن كلّ ما سبق.',
  solution: [
    'عدد كريات كريم: $35+x$ . عدد أقلام العلب: $6\\times x=6x$ . محيط المثلّث: $x+x+7=2x+7$ .',
    'حوض من $n\\times n$ بلاطة يحيط به إطار: أربع مجموعات من $n$ بلاطة وأربع بلاطات في الأركان، أي $4n+4$ ؛ أو أربعة أشرطة متماثلة من $n+1$ بلاطة، أي $4(n+1)$ . من أجل $n=5$ : $4\\times 5+4=24$ و $4\\times 6=24$ .',
    'برنامج: «اختر عددًا، اضربه في $3$ ، ثم أضف $5$» يُكتب $3\\times x+5=3x+5$ ؛ وإذا اخترنا $4$ وجدنا $3\\times 4+5=17$ .',
    '$2\\times a+5\\times a-3\\times a=(2+5-3)\\times a=4a$ ، و $10\\times 10=10^2=100$ ، و $10\\times 10\\times 10=10^3=1000$ .',
  ],
  rule: 'لكتابة عبارة حرفية نسمّي المتغيّر بحرف، ونكتب الحساب كما لو كان الحرف عددًا، ثم نبسّط الكتابة.',
  numbers: { marbles: '35+x', pens: '6x', triangle: '2x+7', border: '4n+4', borderFactored: '4(n+1)', program: '3x+5', programAt4: 17 },
};

/** « أستعدّ » — six affirmations de la plateforme sur ce que la leçon suppose : chaînes (unité 1), dernière opération, distributivité, et « مجموع a و b » (1AM, leçon PRÉVUE : texte seul). */
export const PREP_ITEMS = [];

export const PREP_PLATFORM_ITEMS = [
  { skill: 'chain', text: '$40-12-8=20$ .', answer: true, why: 'نحسب من اليسار: $40-12=28$ ثم $28-8=20$ .' },
  { skill: 'brackets', text: '$40-(12-8)=20$ .', answer: false, why: 'نبدأ بالقوس: $12-8=4$ ثم $40-4=36$ .' },
  { skill: 'chain', text: '$15+3\\times 4=72$ .', answer: false, why: 'الضرب قبل الجمع: $3\\times 4=12$ ثم $15+12=27$ .' },
  { skill: 'last', text: 'الكتابة $5\\times(8+2)$ جداء العدد $5$ ومجموع العددين $8$ و $2$ .', answer: true, why: 'آخر عملية تُنجز هي الضرب، وأحد عامليها هو القوس $8+2$ .' },
  { skill: 'distributive', text: '$4\\times(x+3)=4x+12$ .', answer: true, why: 'نضرب الـ $4$ في كلّ حدّ من القوس: $4\\times x=4x$ و $4\\times 3=12$ .' },
  { skill: 'oneLetter', text: 'مجموع العددين $a$ و $b$ يُكتب $a\\times b$ .', answer: false, why: 'المجموع يُكتب $a+b$ ؛ أمّا $a\\times b$ فهو جداؤهما.' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les phrases de correction partagées par les modules ET la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  cells: 'الخلية الأولى تحتاج $6$ أعواد، وكلّ خلية بعدها تضيف $5$ لأنّها تشترك في عود مع جارتها: ستّة، أحد عشر، ستّة عشر…',
  rule: 'عدد الأعواد لصفّ من $n$ خلية هو $5\\times n+1=5n+1$ : $5$ لكلّ خلية وعود أوّل وحده.',
  far: 'من أجل $n=40$ : $5\\times 40+1=200+1=201$ عودًا، وهو أكثر من $50$ عودًا في الصينية.',
  perCell: 'لو كانت كلّ خلية تحتاج $6$ أعواد لقلنا $6n$ ؛ لكنّ ذلك يعدّ العود المشترك مرّتين: من أجل $n=2$ نجد $12$ والصفّ يحمل $11$ .',
  same: 'كتابة رانيا $6+5\\times(n-1)$ وكتابة ياسين $5n+1$ تعدّان الأعواد نفسها بطريقتين: الجدول نفسه في كلّ الأعمدة التي رسمناها.',
  two: 'لصفّ من $n$ خلية وشريط من $m$ عمودًا: $5n+1+8m+3$ ؛ من أجل $n=6$ و $m=4$ : $31+35=66$ .',
  border: 'حوض من $n\\times n$ بلاطة وإطار حوله: $4n+4$ أو $4(n+1)$ ؛ من أجل $n=5$ نجد $24$ في الحالتين.',
  simplify: '$2a+5a-3a=(2+5-3)a=4a$ ، و $a\\times a\\times 5=5a^2$ ، و $3\\times a\\times b=3ab$ .',
};

/** مسألة 1 — بطاقة المسبح البلدي (module 5 ; act-2 : une part fixe + une part par unité). */
export const POOL = { fee: 1500, session: 120, expr: '1500+120x', values: { 10: 2700, 25: 4500, 50: 7500 }, table: { 0: 1500, 1: 1620, 2: 1740 } };
/** مسألة 2 — حبل حديقة المدرسة (module 6 ; deep-46 : un côté à partir de l'autre). */
export const ROPE = { length: 24, half: 12, other: '12-x', area: 'x(12-x)', at: { 5: 35, 6: 36 } };
/** مسألة 3 — برنامج الساحر (module 7 ; deep-52 : un programme qui donne toujours le même nombre). */
export const MAGIC = { expr: '2(x+4)-2x', simplified: 8, at: { 3: 8, 10: 8, 0: 8 } };
