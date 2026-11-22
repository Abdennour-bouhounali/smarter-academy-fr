/**
 * Le contenu du درس « الكتابة العلمية ورتبة القدر » (3AM, unité 3) — données pures. Le manuel est la RÉFÉRENCE (docs/sources/3am/unit3/extraction.json :
 * نشاط 5 p. 41, معارف 4–5 p. 44, طرائق et دوري الآن p. 45, أوظّف p. 47–48 et 50–51, أؤكّد p. 49 — relus à 120–220 dpi le 2026-10-26) ; chaque texte montré à l'élève est RÉÉCRIT
 * par la plateforme (guide §4ter-bis : mêmes règles et notations, autres mots, autres exemples, autres nombres). La `source` de chaque bloc garde la traçabilité
 * (`check:textbook`) ; `SourceTag` est muet pour l'élève.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/**
 * LE LABO — le « سلّم الأحجام » (`size-ladder`, thème `fair-wall`) : expérience de la plateforme. Les cartes sont celles du preset `levels.js`
 * (مبتدئ : c1 la منارة 265 م · c2 1 950 000 م · c3 0,0001 م · c4 comparer 0,0006 et 0,0001 ; متقدم : c5 1 200 km · c6 0,048 × 10⁻³ م · c7 12 742 km · c8 comparer 9,8 × 10⁻⁵ et 1,2 × 10⁻⁴).
 */
export const LAB = {
  source: addition('platform_designed_entry'),
  // act-5 (p. 41) : la calculatrice (16 384 × 31 250) est REJETÉE comme entrée ; les trois écritures 150 × 10⁶ / 15 × 10⁷ / 1,5 × 10⁸ sont VÉCUES au labo (une carte 35,2 × 10⁴ refuse le barreau 4).
  evidence: src('act-5', 41, 'أنشطة'),
  // L'ouverture de l'unité (p. 38 : l'unité astronomique ≈ 150 millions de km) n'est PAS reprise : la plateforme a ses propres objets ; elle reste citée pour la traçabilité.
  opener: src('opener', 38, 'افتتاحية الوحدة'),
};

/** معارف 4–5 (p. 44) — les définitions, réécrites : mêmes énoncés, autres exemples. */
export const KNOWLEDGE = {
  sci: {
    source: src('know-4', 44, 'معارف'),
    text: 'الكتابة العلمية لعدد عشري موجب هي كتابته على الشكل $a \\times 10^n$ حيث $a$ عدد عشري فيه رقم واحد غير معدوم قبل الفاصلة، أي $1 \\le a < 10$ ، و $n$ عدد صحيح نسبي. ويكتب العدد السالب بإشارته: $-a \\times 10^n$ .',
    example: 'مثلًا: طول الساحل الجزائري حوالي $1\\,200\\ \\mathrm{km} = 1\\,200\\,000\\ \\mathrm{m} = 1{,}2 \\times 10^{6}\\ \\mathrm{m}$ ، وحبّة طلع قطرها $0{,}000025\\ \\mathrm{m} = 2{,}5 \\times 10^{-5}\\ \\mathrm{m}$ .',
  },
  bracket: {
    source: src('know-5', 44, 'معارف'),
    text: 'إذا كانت الكتابة العلمية للعدد الموجب $A$ هي $a \\times 10^n$ فإنّ $10^n \\le A < 10^{n+1}$ ؛ هذا حصر للعدد $A$ بين قوتين متتاليتين للعدد 10 .',
    example: 'مثلًا: $1\\,200\\,000 = 1{,}2 \\times 10^{6}$ ، إذن $10^{6} \\le 1\\,200\\,000 < 10^{7}$ .',
  },
  order: {
    source: src('know-5', 44, 'معارف'),
    text: 'رتبة قدر العدد الموجب $A = a \\times 10^n$ هي $a\' \\times 10^n$ حيث $a\'$ هو مدوّر $a$ إلى الوحدة. وإذا كان $a\' = 10$ كتبنا رتبة القدر $1 \\times 10^{n+1}$ .',
    example: 'مثلًا: رتبة قدر $1{,}2 \\times 10^{6}$ هي $1 \\times 10^{6}$ ، ورتبة قدر $9{,}7 \\times 10^{3}$ هي $1 \\times 10^{4}$ .',
  },
  compare: {
    source: addition('knowledge_formalization'),
    text: 'لمقارنة عددين موجبين مكتوبين كتابة علمية نقارن الأسّين أوّلًا: الأكبر هو صاحب الأسّ الأكبر. وإذا تساوى الأسّان قارنّا العددين $a$ .',
    example: 'مثلًا: $9{,}8 \\times 10^{-5} < 1{,}2 \\times 10^{-4}$ مع أنّ $9{,}8 > 1{,}2$ ، لأنّ $-5 < -4$ .',
  },
};

/** « تذكّر » — رتبة المقدار de la 1AM (`1am.m1.r06`, leçon `rutbat-miqdar-jam`, non publiée : pas de lien) : RAPPELÉE, jamais reconstruite (noRebuild, `extends`). */
export const RECALL_RUTBA = {
  source: addition('prior_year_reminder'),
  title: 'تذكّر — السنة الأولى',
  text: 'في السنة الأولى كانت رتبة المقدار قيمة قريبة سهلة الحساب نتحقّق بها من نتيجة: $4\\,987 + 3\\,012$ قريب من $5\\,000 + 3\\,000 = 8\\,000$ . هنا نعطي رتبة قدر عدد بكتابته العلمية.',
  lesson: 'rutbat-miqdar-jam',
};

/** طرائق p. 45 (A, B, C) et دوري الآن p. 45 ① — réécrits, autres nombres ; la méthode D (calculer puis écrire) est le patron des devoirs de fin de trimestre. */
export const METHOD = {
  decimal: {
    source: src('method-45a', 45, 'طرائق'),
    exercise: 'اكتب كتابة علمية: $A = 47\\,300\\,000$ ؛ $B = 0{,}000608$ .',
    solution: [
      '$A$ : نزيح الفاصلة نحو اليسار حتى يبقى رقم واحد غير معدوم قبلها: سبع رتب، فنضرب في $10^{7}$ : $A = 4{,}73 \\times 10^{7}$ .',
      '$B$ : نزيح الفاصلة نحو اليمين حتى يصير رقم غير معدوم قبلها: أربع رتب، فنضرب في $10^{-4}$ : $B = 6{,}08 \\times 10^{-4}$ .',
    ],
    rule: 'نُزيح الفاصلة حتى يبقى رقم واحد غير معدوم قبلها: عدد الرتب هو القيمة المطلقة للأسّ، وهو موجب إذا أزحنا نحو اليسار وسالب إذا أزحنا نحو اليمين.',
    numbers: { A: { a: '4,73', n: 7 }, B: { a: '6,08', n: -4 } },
  },
  times: {
    source: src('now-45', 45, 'دوري الآن', 1),
    exercise: 'اكتب كتابة علمية: $C = 528 \\times 10^{-6}$ ؛ $D = 0{,}039 \\times 10^{9}$ .',
    solution: [
      '$C$ : $528 = 5{,}28 \\times 10^{2}$ ، إذن $C = 5{,}28 \\times 10^{2} \\times 10^{-6} = 5{,}28 \\times 10^{-4}$ .',
      '$D$ : $0{,}039 = 3{,}9 \\times 10^{-2}$ ، إذن $D = 3{,}9 \\times 10^{-2} \\times 10^{9} = 3{,}9 \\times 10^{7}$ .',
    ],
    rule: 'نكتب العدد $k$ كتابة علمية أوّلًا، ثم نطبّق قاعدة جداء قوتين للعدد 10 : نجمع الأسّين.',
    numbers: { C: { a: '5,28', n: -4 }, D: { a: '3,9', n: 7 } },
  },
  bracket: {
    source: src('method-45b', 45, 'طرائق'),
    exercise: 'أعط حصرًا ورتبة قدر لكل من $A = 4{,}73 \\times 10^{7}$ و $B = 6{,}08 \\times 10^{-4}$ .',
    solution: [
      '$A$ : الأسّ 7 ، إذن $10^{7} \\le A < 10^{8}$ ؛ ومدوّر $4{,}73$ إلى الوحدة هو 5 ، فرتبة القدر $5 \\times 10^{7}$ .',
      '$B$ : الأسّ $-4$ ، إذن $10^{-4} \\le B < 10^{-3}$ ؛ ومدوّر $6{,}08$ إلى الوحدة هو 6 ، فرتبة القدر $6 \\times 10^{-4}$ .',
    ],
    rule: 'الحصر يُقرأ من الأسّ: $10^{n} \\le A < 10^{n+1}$ ؛ ورتبة القدر بتدوير $a$ إلى الوحدة وإبقاء الأسّ $n$ .',
    numbers: { A: { n: 7, a1: 5, n1: 7 }, B: { n: -4, a1: 6, n1: -4 } },
  },
  compute: {
    source: addition('knowledge_formalization'),
    alsoCites: src('method-45b', 45, 'طرائق'),
    exercise: 'احسب ثم اكتب النتيجة كتابة علمية: $E = \\frac{6 \\times 10^{5} \\times 1{,}5 \\times 10^{-2}}{4{,}5 \\times 10^{-3}}$ .',
    solution: [
      'نجمع الأعداد معًا وقوى العدد 10 معًا: $E = \\frac{6 \\times 1{,}5}{4{,}5} \\times 10^{5 + (-2) - (-3)}$ .',
      '$\\frac{9}{4{,}5} = 2$ و $5 - 2 + 3 = 6$ ، إذن $E = 2 \\times 10^{6}$ .',
      'والعدد $2$ من 1 إلى أقل من 10 ، فهذه هي الكتابة العلمية.',
    ],
    rule: 'نحسب بالقواعد الثلاث أوّلًا، ثم ننظر هل العدد الأوّل من 1 إلى أقل من 10 ؛ وإن لم يكن كذلك نعدّله ونعدّل الأسّ.',
    numbers: { E: { a: '2', n: 6 } },
  },
};

/** « أستعدّ » — sept affirmations de la plateforme (`1am.m1.r06`, le مدوّر, `3am.m3.r03`, `3am.m3.r02`) ; le manuel n'a pas d'item pour cette leçon. */
export const PREP_PLATFORM_ITEMS = [
  { skill: 'rutba', text: 'قيمة قريبة سهلة الحساب لـ $4\\,987 + 3\\,012$ هي $8\\,000$ .', answer: true, why: '$4\\,987$ قريب من $5\\,000$ و $3\\,012$ قريب من $3\\,000$ ، ومجموعهما $8\\,000$ .' },
  { skill: 'mudawwar', text: 'مدوّر $6{,}48$ إلى الوحدة هو $6$ .', answer: true, why: 'الرقم بعد الفاصلة هو 4 وهو أقل من 5 ، فنبقي الوحدات كما هي: $6$ .' },
  { skill: 'mudawwar', text: 'مدوّر $3{,}5$ إلى الوحدة هو $3$ .', answer: false, why: 'الرقم بعد الفاصلة هو 5 ، فنزيد الوحدات واحدًا: مدوّر $3{,}5$ هو $4$ .' },
  { skill: 'quwa', text: '$52\\,000 = 52 \\times 10^{3}$ .', answer: true, why: '$52 \\times 1\\,000 = 52\\,000$ ، والعدد 1 000 هو $10^{3}$ .' },
  { skill: 'quwa', text: '$0{,}007 = 7 \\times 10^{-2}$ .', answer: false, why: '$0{,}007 = 7 \\times 0{,}001 = 7 \\times 10^{-3}$ : الرقم 7 في الرتبة الثالثة بعد الفاصلة.' },
  { skill: 'quwa', text: '$10^{-4} < 10^{-3}$ .', answer: true, why: '$10^{-4} = 0{,}0001$ و $10^{-3} = 0{,}001$ ، والأول أصغر.' },
  { skill: 'qawaid', text: '$10^{2} \\times 10^{-6} = 10^{-4}$ .', answer: true, why: 'في الجداء نجمع الأسّين: $2 + (-6) = -4$ .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));
export const PREP_ITEMS = [];

/** Les phrases de correction partagées par les modules ET la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  rung: 'بطاقة المنارة طولها $265\\ \\mathrm{m}$ : $100 \\le 265 < 1\\,000$ ، فهي على الدرجة $10^{2}$ ، وفي الخانة $2$ من هذه الدرجة: $265 = 2{,}65 \\times 10^{2}$ .',
  digits: {
    wrong: '$265 = 2{,}65 \\times 10^{3}$ لأنّ في 265 ثلاثة أرقام.',
    why: 'الأسّ لا يعدّ أرقام العدد: هو رقم الدرجة التي تقف عليها البطاقة. بطاقة 265 م لا تبلغ $10^{3}$ ، فدرجتها $10^{2}$ .',
    right: '$265 = 2{,}65 \\times 10^{2}$ .',
  },
  trunc: {
    wrong: 'رتبة قدر $2{,}65 \\times 10^{2}$ هي $2 \\times 10^{2}$ لأنّنا نحذف ما بعد الفاصلة.',
    why: 'رتبة القدر تُدوِّر $a$ إلى الوحدة، فهي أقرب تدريجة كاملة: $2{,}65$ أقرب إلى 3 منه إلى 2 .',
    right: 'رتبة قدر $2{,}65 \\times 10^{2}$ هي $3 \\times 10^{2}$ .',
  },
  compare: {
    wrong: '$9{,}8 \\times 10^{-5} > 1{,}2 \\times 10^{-4}$ لأنّ $9{,}8 > 1{,}2$ .',
    why: 'نقارن الأسّين قبل العددين $a$ : الأسّ $-4$ أكبر من $-5$ ، فالبطاقة الثانية على درجة أعلى.',
    right: '$9{,}8 \\times 10^{-5} < 1{,}2 \\times 10^{-4}$ .',
  },
  form: {
    wrong: '$35{,}2 \\times 10^{4}$ هي الكتابة العلمية لهذا العدد لأنّها تساويه.',
    why: 'المساواة لا تكفي: $35{,}2$ ليس من 1 إلى أقل من 10 ، و $35{,}2 \\times 10^{4} = 352\\,000$ تقف بطاقته على الدرجة $10^{5}$ .',
    right: '$35{,}2 \\times 10^{4} = 3{,}52 \\times 10^{5}$ .',
  },
};
