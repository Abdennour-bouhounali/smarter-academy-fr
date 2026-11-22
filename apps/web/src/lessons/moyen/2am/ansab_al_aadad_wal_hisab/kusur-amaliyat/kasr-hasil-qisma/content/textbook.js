/**
 * Le contenu du درس « الكسر: نسبة وحاصل قسمة وقيم مقرّبة » (2AM, unité 2) — données pures. Le manuel (docs/sources/2am/unit2/extraction.json) est la RÉFÉRENCE des الكفاءات, pas le
 * script : les nombres, les contextes et les mots sont ceux de la plateforme ; chaque bloc cite l'élément dont il reprend l'IDÉE (`src(<id>)`), et ce qui n'en vient pas est un ajout
 * DÉCLARÉ (`addition(<raison>)`). Les modules rendent ces données ; ils n'en réécrivent aucune.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** Le labo `mooring-lines` : l'entrée de la plateforme (corde de 8 m en 3, puis 9 m en 4, 9,5 m en 3 ; متقدم : cordes de 0,7 m dans 4,6 m …). */
export const LAB = {
  source: addition('interaction_generation'),
  share: { a: '8', b: '3', lo: '2,66', hi: '2,67', exact: { a: '9', b: '4', q: '2,25' } },
  count: { a: '4,6', b: '0,7', a10: '46', b10: '7', lo: '6,57', hi: '6,58' },
  /** Le labo de « معارف » : 10 m en 7, rangs 0,1 puis 0,01. */
  maarif: { a: '10', b: '7', lo1: '1,4', hi1: '1,5', lo: '1,42', hi: '1,43', prodLo: '9,94', prodHi: '10,01' },
};

/** « تذكّر » — trois rappels, chacun avec le lien de sa leçon PUBLIÉE (jamais reconstruits ici). */
export const RECALLS = {
  quotient: {
    source: addition('prior_year_reminder'), lesson: 'hasil-qisma-kasr', title: 'تذكّر — السنة الأولى متوسط',
    text: 'حاصل قسمة $a$ على $b$ ($b \\ne 0$) هو العدد الذي إذا ضربناه في $b$ وجدنا $a$ ، ونكتبه $a \\div b = \\frac{a}{b}$ . وقد لا يكون هذا العدد عشريًا: $\\frac{7}{3}$ ليس عشريًا، و $2{,}33$ قيمة مقرّبة منه.',
  },
  equal: {
    source: addition('prior_year_reminder'), lesson: 'ikhtizal-kitaba-kasriya', title: 'تذكّر — كتابات كسرية متساوية',
    text: 'لا يتغيّر الكسر إذا ضربنا بسطه ومقامه في العدد نفسه غير المعدوم: $\\frac{a}{b} = \\frac{a \\times k}{b \\times k}$ ، فمثلًا $\\frac{2{,}1}{3{,}5} = \\frac{21}{35}$ .',
  },
  unit: {
    source: addition('prior_year_reminder'), lesson: 'qisma-iqlidiya-hasr', title: 'تذكّر — الحصر إلى الوحدة',
    text: 'في هذا الباب حصرنا حاصل القسمة بين عددين طبيعيين متتاليين: $22 < \\frac{180}{8} < 23$ ، و $22$ و $23$ قيمتان مقرّبتان إلى الوحدة بالنقصان وبالزيادة.',
  },
};

/** معارف — les noms (idée de know-1c, know-1d, know-1e ; mots de la plateforme). */
export const KNOWLEDGE = {
  madbuta: {
    source: src('know-1c', 26, 'معارف', 1),
    text: 'إذا لم تنتهِ القسمة فلا عدد عشري يساوي حاصلها. حاصل قسمة $a$ على $b$ هو دائمًا العدد $\\frac{a}{b}$ نفسه، وهو القيمة المضبوطة؛ أمّا القيمتان المقرّبتان بالنقصان وبالزيادة إلى رتبة معيّنة فتحصرانه فقط.',
    muqarraba: 'القيمة المقرّبة بالنقصان إلى $10^{-k}$ هي أكبر عدد عشري بـ $k$ رقمًا بعد الفاصلة أصغر من الحاصل أو يساويه؛ والقيمة بالزيادة هي أصغر عدد عشري بـ $k$ رقمًا بعد الفاصلة أكبر منه أو يساويه، ونكتب مثلًا $1{,}66 < \\frac{5}{3} < 1{,}67$ .',
  },
  nisba: {
    source: src('know-1d', 26, 'معارف', 1),
    text: 'نقرأ $\\frac{a}{b}$ « نسبة $a$ إلى $b$ » ($b \\ne 0$) وهي كتابة حاصل القسمة $a \\div b$ . إذا كان $a$ و $b$ عددين طبيعيين سمّيناها كسرًا؛ وإذا كان أحدهما أو كلاهما عشريًا سمّيناها كتابة كسرية.',
    example: 'من بين $28$ تلميذًا في القسم يشترك $12$ في نادي المطالعة: نسبتهم إلى القسم هي $\\frac{12}{28} = \\frac{3}{7}$ .',
    fractional: 'الكتابة الكسرية $\\frac{4{,}2}{0{,}35}$ حدّاها عشريان: ليست كسرًا، لكنّها قيمة مضبوطة لحاصل قسمة $4{,}2$ على $0{,}35$ .',
  },
  clear: {
    source: src('know-1e', 26, 'معارف', 1),
    text: 'لقسمة عدد على عدد عشري غير طبيعي نضرب الحدّين في $10$ أو $100$ أو $1000$ ، بحسب عدد الأرقام بعد الفاصلة في القاسم، فنقسم على عدد طبيعي: $\\frac{4{,}2}{0{,}35} = \\frac{420}{35} = 12$ .',
  },
};

/** طريقة — لحصر حاصل قسمة (idée de method-1, method-2). */
export const METHOD = {
  source: src('method-2', 27, 'طرائق', 2),
  exercise: 'احصر حاصل القسمة $12{,}5 \\div 0{,}35$ إلى $0{,}1$ ثم إلى $0{,}01$ .',
  solution: [
    'القاسم $0{,}35$ فيه رقمان بعد الفاصلة: نضرب الحدّين في $100$ : $\\frac{12{,}5}{0{,}35} = \\frac{1250}{35}$ .',
    'نقسم $1250$ على $35$ ثم نواصل بعد الفاصلة: $1250 \\div 35 = 35{,}714\\ldots$',
    'نتوقّف عند الرتبة المطلوبة: $35{,}7 < \\frac{1250}{35} < 35{,}8$ .',
    'ثم عند رتبة $0{,}01$ : $35{,}71 < \\frac{1250}{35} < 35{,}72$ .',
  ],
  rule: 'لحصر حاصل قسمة إلى $0{,}1$ أو $0{,}01$ نجعل القاسم طبيعيًا بضرب الحدّين معًا في $10$ أو $100$ ، ننجز القسمة ونواصلها بعد الفاصلة حتى الرتبة المطلوبة؛ الرقم الذي نتوقّف عنده يعطي القيمة بالنقصان، ونضيف وحدة من تلك الرتبة لنجد القيمة بالزيادة.',
  numbers: { a: '12,5', b: '0,35', factor: 100, a10: 1250, b10: 35, lo1: '35,7', hi1: '35,8', lo2: '35,71', hi2: '35,72' },
  decimalOrNot: { yes: { a: 7, b: 8, value: '0,875' }, no: { a: 5, b: 6, lo: '0,83', hi: '0,84' } },
  ratio: { part: 18, whole: 45, reduced: '2/5', value: '0,4' },
};

/** « أستعدّ » — les items 1, 2, 3, 4, 7 (p. 23, réécrits avec leurs nombres) ; les items 6, 7, 11 sont recomposés ci-dessous (plateforme : 1am.m3.r04). */
export const PREP_ITEMS = [
  { n: 1, skill: 'kasr', text: 'في الكسر $\\frac{7}{30}$ البسط هو $7$ والمقام هو $30$ .', answer: true, why: 'في $\\frac{a}{b}$ البسط $a$ هو العدد الأعلى والمقام $b$ هو العدد الأسفل.' },
  { n: 2, skill: 'kasr', text: 'العدد $\\frac{27}{12}$ عدد عشري.', answer: true, why: '$\\frac{27}{12} = \\frac{9}{4} = 2{,}25$ : القسمة تنتهي، فهو عشري.' },
  { n: 4, skill: 'kasr', text: 'العدد الذي إذا ضربناه في $9$ وجدنا $4$ هو $\\frac{9}{4}$ .', answer: false, why: 'العدد الذي نضربه في $9$ فنجد $4$ هو $\\frac{4}{9}$ لأنّ $9 \\times \\frac{4}{9} = 4$ .' },
  { n: 7, skill: 'ikhtizal', text: '$\\frac{12}{28} = \\frac{3}{7}$ .', answer: true, why: 'نقسم البسط والمقام على $4$ : $\\frac{12 \\div 4}{28 \\div 4} = \\frac{3}{7}$ .' },
  { n: 3, skill: 'qisma', text: 'الكتابة العشرية للكسر $\\frac{5}{8}$ هي $0{,}625$ .', answer: true, why: '$5 \\div 8 = 0{,}625$ ، و $8 \\times 0{,}625 = 5$ .' },
].map((it) => ({ ...it, source: src('prep', 23, 'أستعدّ', it.n) }));

/** Les affirmations de la PLATEFORME sur `1am.m3.r04` (la valeur approchée à l'unité) et `1am.m3.r03` (la division décimale), que « أستعدّ » doit mesurer (LEARNING_NET.md §4.4). */
export const PREP_PLATFORM_ITEMS = [
  { skill: 'taqrib', text: 'القيمة المقرّبة إلى الوحدة بالنقصان لحاصل قسمة $47$ على $5$ هي $9$ .', answer: true, why: '$47 \\div 5 = 9{,}4$ و $9 < 9{,}4 < 10$ : القيمة بالنقصان هي $9$ .' },
  { skill: 'taqrib', text: 'حاصل قسمة $7{,}2$ على $4$ محصور بين $2$ و $3$ .', answer: false, why: '$7{,}2 \\div 4 = 1{,}8$ : هو محصور بين $1$ و $2$ .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les phrases de correction partagées par les modules ET la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  never: 'عند $2{,}66$ يبقى $0{,}02$ من الحبل، وعند $2{,}67$ ينقصه $0{,}01$ : كلّما دقّقنا الرتبة صغر الفرق ولم ينعدم، لأنّ $8 \\div 3 = 2{,}666\\ldots$ لا تنتهي.',
  exact: 'عند $2{,}25$ تقع آخر قطعة على طرف الحبل بالضبط: $4 \\times 2{,}25 = 9$ ، فحاصل قسمة $9$ على $4$ عدد عشري.',
  bracket: '$2{,}66$ تكفي و $2{,}67$ لا تكفي: $2{,}66 < \\frac{8}{3} < 2{,}67$ .',
  // le reste écrit après la virgule (8 ÷ 3 = 2,2 parce que 8 = 3 × 2 + 2) — la carte (knowledgeGraph.js) cite ces phrases mot pour mot.
  comma: {
    wrong: '$8 \\div 3 = 2{,}2$ لأنّ الباقي $2$ نكتبه بعد الفاصلة.',
    why: 'عند $2{,}2$ تُوضَع ثلاث قطع ويبقى من الحبل $1{,}4$ m : الحبل يكفي بكثير.',
    right: 'الحاصل بين $2{,}6$ و $2{,}7$ : نواصل القسمة بعد الفاصلة ولا نكتب الباقي.',
  },
  unit: 'ضربنا الطولين في $10$ معًا: $\\frac{4{,}6}{0{,}7} = \\frac{46}{7}$ ، فبقي عدد الحبال نفسه.',
};

/** مسألة الدرس — واجب التعاونية (module 5) ; la valeur est tissée dans le contexte (le partage équitable). */
export const OIL = { litres: 10, families: 3, lo: '3,33', hi: '3,34', bottleSmall: '3,3', bottleBig: '3,5' };
/** مسألة 2 — نادي الدرّاجات (module 6) */
export const CLUB = { km: 25, hours: '1,5', value: '50/3', lo: '16,6', hi: '16,7', target: 17 };
/** مسألة 3 — خزّان القرية (module 7) */
export const TANK = { litres: 1000, bottle: '1,5', full: 666, lo: '666,6', hi: '666,7', needed: 667 };
