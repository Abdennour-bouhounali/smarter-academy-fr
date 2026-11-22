/**
 * Le contenu du درس « العدد الناطق » (3AM, unité 2) — données pures. Le manuel est la RÉFÉRENCE (docs/sources/3am/unit2/extraction.json : نشاط 5 p. 25, معارف 5 p. 28, طريقة 10 p. 29,
 * أستعدّ 8 et 12 p. 23) ; chaque texte montré à l'élève est RÉÉCRIT par la plateforme (guide §4ter-bis : mêmes définitions et notations, autres mots, autres exemples, autres nombres).
 * La `source` de chaque bloc garde la traçabilité (`check:textbook`) ; `SourceTag` est muet pour l'élève. Le signe d'un quotient est RAPPELÉ (leçon 3AM `qismat-nisbiyayn`, publiée) ;
 * « décimal ou non, valeur approchée » est RAPPELÉ (1AM `hasil-qisma-kasr`, publiée) ; π et les ensembles ℕ ℤ 𝔻 ℚ ne sont PAS posés (4AM / lycée).
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** LE LABO DE L'ENTRÉE — le حبل الأعداد (`number-line-pegs`, thème `clothesline`) : expérience de la plateforme, tâches du preset `levels.js`. */
export const LAB = {
  source: addition('platform_designed_entry'),
  beginner: {},
  advanced: {},
  /** Le monde `writings` de معارف : cinq écritures, quatre sur −3/4 et une sur 3/4. */
  writings: { world: 'writings', tasks: [{ id: 'k1', cards: ['15/-20', '-6/8', '3/-4', '-12/16', '3/4'], range: [-2, 2] }] },
};

/** « تذكّر — حاصل قسمة عددين نسبيين » (leçon 3AM `qismat-nisbiyayn`, PUBLIÉE : avec un lien). RAPPELÉ, jamais reconstruit. */
export const RECALL_UNIT1 = {
  source: addition('prior_year_reminder'),
  title: 'تذكّر — حاصل قسمة عددين نسبيين',
  text: 'في درس « حاصل قسمة عددين نسبيين » رأينا أنّ $\\frac{-a}{b}=\\frac{a}{-b}=-\\frac{a}{b}$ ، وأنّ $\\frac{-a}{-b}=\\frac{a}{b}$ : حاصل قسمة عددين لهما الإشارة نفسها موجب، وحاصل قسمة عددين مختلفي الإشارة سالب.',
  lesson: 'qismat-nisbiyayn',
};

/** « تذكّر — السنة الأولى » (leçon 1AM `hasil-qisma-kasr`, PUBLIÉE : avec un lien) : décimal ou non. */
export const RECALL_1AM = {
  source: addition('prior_year_reminder'),
  title: 'تذكّر — السنة الأولى',
  text: 'في السنة الأولى عرفنا أنّ $\\frac{a}{b}$ هو حاصل قسمة $a$ على $b$ ، وأنّ بعض الحواصل عشرية ($\\frac{9}{4}=2{,}25$) وبعضها لا تنتهي كتابته العشرية ($\\frac{11}{7}\\approx1{,}57$ قيمة مقرّبة).',
  lesson: 'hasil-qisma-kasr',
};

/** معارف 5 (p. 28) — réécrits, avec les exemples de la plateforme. */
export const KNOWLEDGE = {
  definition: {
    source: src('know-5', 28, 'معارف', 5),
    text: 'العدد الناطق هو حاصل قسمة عدد نسبي على عدد نسبي غير معدوم: $\\frac{a}{b}$ حيث $a$ و $b$ عددان نسبيان و $b\\neq0$ . وللعدد الناطق الواحد كتابات كثيرة، ومكانه على المستقيم المدرّج واحد.',
  },
  inclusions: {
    source: src('know-5', 28, 'معارف', 5),
    text: 'كل عدد طبيعي وكل عدد صحيح نسبي وكل عدد عشري نسبي عدد ناطق: $-3=\\frac{-3}{1}$ ، $-1{,}8=-\\frac{18}{10}=-\\frac{9}{5}$ . أمّا $\\frac{7}{3}$ فهو ناطق وليس عشريًّا.',
  },
  standard: {
    source: src('know-5', 28, 'معارف', 5),
    text: 'كل عدد ناطق يُكتب $\\frac{a}{b}$ أو $-\\frac{a}{b}$ بمقام موجب، حيث $a$ و $b$ عددان طبيعيان و $b\\neq0$ ، ونختزل الكسر لنحصل على الكتابة المعيارية: $\\frac{14}{-21}=-\\frac{2}{3}$ .',
  },
  examples: {
    source: src('know-5', 28, 'معارف', 5),
    text: '$\\frac{-28}{15}=-\\frac{28}{15}$ ؛ $\\frac{14}{-21}=-\\frac{2}{3}$ ؛ $\\frac{-24}{-32}=\\frac{24}{32}=\\frac{3}{4}$ . وتُقرأ هذه الأعداد كلّها: عدد ناطق.',
  },
};

/** « طريقة » (p. 29, method-10) : chaque طريقة a ICI son exemple, aux nombres de la plateforme. */
export const METHOD = {
  standard: {
    source: src('method-10', 29, 'طرائق', 10),
    exercise: 'اكتب $\\frac{14}{-21}$ بمقام موجب وعلى أبسط شكل.',
    solution: [
      'نقل الإشارة إلى البسط: $\\frac{14}{-21}=\\frac{-14}{21}=-\\frac{14}{21}$ .',
      'نختزل بالقسمة على $7$ : $-\\frac{14}{21}=-\\frac{2}{3}$ .',
    ],
    rule: 'نكتب المقام موجبًا (بنقل الإشارة) ثمّ نختزل.',
  },
  decimal: {
    source: src('method-10', 29, 'طرائق', 10),
    exercise: 'اكتب $\\frac{-3{,}6}{-8}$ على الشكل $\\frac{a}{b}$ حيث $a$ و $b$ طبيعيان.',
    solution: [
      'إشارتان سالبتان: $\\frac{-3{,}6}{-8}=\\frac{3{,}6}{8}$ .',
      'نحذف الفاصلة بالضرب في $10$ في البسط والمقام: $\\frac{3{,}6}{8}=\\frac{36}{80}=\\frac{9}{20}$ .',
    ],
    rule: 'نحذف الإشارتين السالبتين معًا ونحذف الفاصلة بضرب البسط والمقام في العدد نفسه.',
  },
  compare: {
    source: src('method-10', 29, 'طرائق', 10),
    exercise: 'قارن $\\frac{-4{,}9}{6}$ و $\\frac{-3{,}5}{4}$ .',
    solution: [
      'نكتب العددين بمقام موجب مشترك: $12$ مضاعف مشترك للعددين $6$ و $4$ .',
      '$\\frac{-4{,}9}{6}=\\frac{-9{,}8}{12}$ و $\\frac{-3{,}5}{4}=\\frac{-10{,}5}{12}$ .',
      '$-10{,}5<-9{,}8$ ، فـ $\\frac{-3{,}5}{4}<\\frac{-4{,}9}{6}$ .',
    ],
    rule: 'لمقارنة عددين ناطقين: نكتبهما بمقام موجب مشترك، ثمّ نقارن البسطين حسب قواعد مقارنة الأعداد النسبية.',
  },
  place: {
    source: src('method-10', 29, 'طرائق', 10),
    exercise: 'رتّب تصاعديًا $-\\frac{5}{6}$ ، $-\\frac{3}{2}$ ، $\\frac{2}{3}$ ، $\\frac{7}{6}$ ثمّ مثّلها على مستقيم مدرّج بالأسداس.',
    solution: [
      'نكتبها بالمقام $6$ : $-\\frac{5}{6}$ ، $-\\frac{9}{6}$ ، $\\frac{4}{6}$ ، $\\frac{7}{6}$ .',
      'نقارن البسوط: $-9<-5<4<7$ ، فالترتيب $-\\frac{3}{2}<-\\frac{5}{6}<\\frac{2}{3}<\\frac{7}{6}$ .',
      'على اليسار من الصفر: العدد الأبعد عن الصفر هو الأصغر.',
    ],
    rule: 'على يسار الصفر، العدد الأبعد عن الصفر هو الأصغر.',
  },
  integer: {
    source: src('ex-26', 31, 'أوظّف تعلّماتي', 26),
    exercise: 'اكتب $\\frac{17}{5}$ و $\\frac{41}{9}$ على شكل مجموع عدد طبيعي وكسر أصغر من $1$ .',
    solution: [
      '$17=3\\times5+2$ ، فـ $\\frac{17}{5}=3+\\frac{2}{5}$ .',
      '$41=4\\times9+5$ ، فـ $\\frac{41}{9}=4+\\frac{5}{9}$ ، وأكبر عدد طبيعي أصغر من $\\frac{41}{9}$ هو $4$ .',
    ],
    rule: 'نقسم البسط على المقام: الحاصل هو العدد الطبيعي والباقي هو بسط الكسر.',
  },
  choose: {
    source: addition('knowledge_formalization'),
    rule: 'لمقارنة عددين ناطقين أو ترتيبهما أو تمثيلهما: نكتبهما بمقام موجب مشترك ثمّ نقارن البسطين حسب قواعد مقارنة الأعداد النسبية.',
  },
};

/** « أستعدّ » — أستعدّ p. 23, items 8 et 12, RÉÉCRITS en affirmations. */
export const PREP_ITEMS = [
  { n: 12, skill: 'qisma', text: '$(-9)\\div(-2)=4{,}5$ .', answer: true, why: 'قسمة عددين سالبين: الحاصل موجب، و $9\\div2=4{,}5$ .' },
  { n: 8, skill: 'tartib', text: '$-11<-8$ .', answer: true, why: 'على يسار الصفر، العدد الأبعد عن الصفر هو الأصغر، و $11$ أبعد من $8$ .' },
].map((it) => ({ ...it, source: src('prep', 23, 'أستعدّ', it.n) }));

/**
 * Les items de la PLATEFORME : le réseau dit que la leçon étend `1am.m5.r01` (les écritures fractionnaires d'un quotient) et suit `3am.m1.r02` (le quotient de deux relatifs) —
 * « أستعدّ » doit les mesurer (LEARNING_NET.md §4.4).
 */
export const PREP_PLATFORM_ITEMS = [
  { skill: 'kasr', text: '$\\frac{3}{4}=0{,}75$ .', answer: true, why: '$3\\div4=0{,}75$ .' },
  { skill: 'kasr', text: '$\\frac{7}{3}=2{,}33$ .', answer: false, why: '$2{,}33$ قيمة مقرّبة فقط: $7\\div3=2{,}333\\ldots$ لا تنتهي كتابته العشرية.' },
  { skill: 'kasr', text: '$15\\div4=\\frac{15}{4}$ .', answer: true, why: '$\\frac{a}{b}$ هو حاصل قسمة $a$ على $b$ .' },
  { skill: 'qisma', text: '$(-18)\\div3=-6$ .', answer: true, why: 'عددان مختلفا الإشارة: الحاصل سالب، و $18\\div3=6$ .' },
  { skill: 'qisma', text: '$12\\div(-4)=3$ .', answer: false, why: 'عددان مختلفا الإشارة: الحاصل سالب، $12\\div(-4)=-3$ .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les phrases de correction partagées par les modules ET la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  twoneg: {
    wrong: 'قلنا إنّ العدد المكتوب بإشارتين سالبتين، في البسط وفي المقام، سالب.',
    why: 'حاصل قسمة عددين لهما الإشارة نفسها موجب: الإشارتان السالبتان تلغي إحداهما الأخرى.',
    right: '$\\frac{-9}{-12}=\\frac{9}{12}=\\frac{3}{4}$ ، وهو موجب.',
  },
  negorder: {
    wrong: 'رتّبنا عددين سالبين فاعتبرنا الأبعد عن الصفر أكبر.',
    why: 'على يسار الصفر، كلّما ابتعد العدد عن الصفر صار أصغر.',
    right: '$-\\frac{5}{6}=-\\frac{10}{12}<-\\frac{9}{12}=-\\frac{3}{4}$ .',
  },
  rope: 'علّقنا البطاقات $\\frac{6}{-8}$ و $\\frac{-3}{4}$ و $\\frac{-9}{-12}$ على الحبل: الأولى والثانية استقرّتا على الملقط نفسه عند $-\\frac{3}{4}$ ، والثالثة على الجهة الموجبة عند $\\frac{3}{4}$ .',
};
