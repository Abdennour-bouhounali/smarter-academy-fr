/**
 * Le contenu du درس « حاصل قسمة عددين نسبيين » (3AM, unité 1) — données pures. Le manuel est la RÉFÉRENCE (docs/sources/3am/unit1/
 * extraction.json : معارف p. 12 (know-8, know-9, know-10), طرائق p. 13 (method-5, method-6), دوري الآن p. 13 (now-13), النشاط 4 p. 9, أستعدّ p. 7 items 12 et 13) ;
 * chaque texte montré à l'élève est RÉÉCRIT par la plateforme (guide §4ter-bis : mêmes définitions et notations, autres mots, autres exemples, autres nombres).
 * La `source` de chaque bloc garde la traçabilité (`check:textbook`) ; `SourceTag` est muet pour l'élève. L'activité 4 du manuel (quatre trous « 7 × … = −28 »)
 * est une APPLICATION (أتمرّن E1) : l'entrée est celle de la plateforme, les خزائن الأمانات.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/**
 * LES LABOS — les خزائن الأمانات (`code-lockers`, thème `libraryLockers`) : expérience de la plateforme. Les nombres sont ceux du preset `levels.js`
 * (مبتدئ : m1 … m4 ; متقدم : a1 … a4) ; le monde `fraction` est posé seul en معارف (`levels={false}`).
 */
export const LAB = {
  source: addition('platform_designed_entry'),
  beginner: {
    world: 'lockers',
    tasks: [
      { id: 'm1', b: '-6', a: '48' },
      { id: 'm2', b: '9', a: '-54' },
      { id: 'm3', b: '-7', a: '-63', qFirst: true },
      { id: 'm4', b: '-12', a: '-60' },
    ],
  },
  advanced: {
    world: 'lockers',
    tasks: [
      { id: 'a1', b: '-8', a: '-2', layout: 'dec', commit: true },
      { id: 'a2', b: '2,5', a: '-7,5', layout: 'dec', commit: true },
      { id: 'a3', b: '-0,4', a: '1,2', layout: 'dec', commit: true },
      { id: 'a4', b: '-5', a: '0', qFirst: true, layout: 'dec', commit: true },
    ],
  },
  fraction: {
    world: 'fraction',
    tasks: [
      { id: 'f1', b: '-6', a: '4', layout: 'dec', live: true, switch: true, writings: 2 },
      { id: 'f2', b: '-9', a: '-6', layout: 'frac', live: true, writings: 2 },
    ],
  },
};

/** Les connaissances, RÉÉCRITES : la définition (b × q = a), la règle des signes, les trois écritures, le zéro, les priorités. */
export const KNOWLEDGE = {
  definition: {
    source: src('know-9', 12, 'معارف'),
    lines: ['حاصل قسمة عدد نسبي $a$ على عدد نسبي $b$ غير معدوم هو العدد $q$ الذي إذا ضُرب في $b$ أعطى $a$ : $a \\div b = q$ معناه $b \\times q = a$ ، حيث $b \\neq 0$ .'],
    examples: '$30 \\div (-5) = -6$ لأنّ $(-5) \\times (-6) = 30$ ؛ و $(-28) \\div 4 = -7$ لأنّ $4 \\times (-7) = -28$ .',
  },
  signs: {
    source: src('know-8', 12, 'معارف'),
    lines: [
      'حاصل قسمة عددين نسبيين لهما الإشارة نفسها عدد موجب، وحاصل قسمة عددين مختلفي الإشارة عدد سالب.',
      'مسافة حاصل القسمة إلى الصفر هي حاصل قسمة مسافتي العددين إلى الصفر.',
    ],
    examples: '$(-35) \\div (-5) = 7$ ، $42 \\div (-6) = -7$ ، $(-1{,}2) \\div 4 = -0{,}3$ .',
    remark: 'انتبه: قسمة عدد سالب على عدد سالب تعطي عددًا موجبًا.',
  },
  fraction: {
    source: src('know-9', 12, 'معارف'),
    lines: [
      'إذا لم يوجد عدد عشري يحقّق $b \\times q = a$ كتبنا حاصل القسمة على شكل كسر: $q = \\frac{a}{b}$ .',
      'ويمكن وضع إشارة السالب في المقام أو في البسط أو أمام الكسر، والمعنى واحد: $\\frac{-a}{b} = \\frac{a}{-b} = -\\frac{a}{b}$ ، أمّا إذا كان العددان سالبين فـ $\\frac{-a}{-b} = \\frac{a}{b}$ .',
    ],
    examples: '$\\frac{-3}{5} = \\frac{3}{-5} = -\\frac{3}{5}$ ، و $\\frac{-3}{-5} = \\frac{3}{5}$ .',
  },
  zero: {
    source: src('know-9', 12, 'معارف'),
    text: 'لا نقسم على العدد $0$ : لا يوجد عدد $q$ يحقّق $0 \\times q = 5$ ، لأنّ $0 \\times q = 0$ مهما كان $q$ .',
  },
  priorities: {
    source: src('know-10', 12, 'معارف'),
    lines: [
      'لإنجاز سلسلة حسابات على الأعداد النسبية نحسب بهذا الترتيب: ما بين الأقواس أوّلًا (وفي داخلها نحترم الأولوية نفسها)، ثم الضرب والقسمة من اليسار إلى اليمين، ثم الجمع والطرح من اليسار إلى اليمين.',
    ],
    examples: '$A = 5 - (3 \\times (-4) + 7) = 5 - (-12 + 7) = 5 - (-5) = 10$ .',
  },
};

/** « تذكّر » — les deux leçons PUBLIÉES de l'unité, rappelées en معارف et jamais reconstruites. */
export const RECALL_LESSONS = [
  {
    source: addition('prior_year_reminder'),
    title: 'تذكّر — جداء عددين نسبيين',
    text: 'جداء عددين لهما الإشارة نفسها موجب، وجداء عددين مختلفي الإشارة سالب، ومسافته إلى الصفر هي جداء المسافتين: $(-4) \\times (-2{,}5) = 10$ و $(-4) \\times 2{,}5 = -10$ .',
    lesson: 'jidaa-adadayn-nisbiyayn',
    linkText: 'درس « جداء عددين نسبيين » — السنة الثالثة متوسط',
  },
  {
    source: addition('prior_year_reminder'),
    title: 'تذكّر — جداء عدة أعداد نسبية',
    text: 'إشارة جداء عدة أعداد غير معدومة تتبع عدد عوامله السالبة: سالبة إذا كان فرديًا، وموجبة إذا كان زوجيًا؛ ثم نضرب المسافات إلى الصفر.',
    lesson: 'jidaa-ida-nisbiya',
    linkText: 'درس « جداء عدة أعداد نسبية » — السنة الثالثة متوسط',
  },
];

/** « تذكّر — السنة الثانية » : les priorités des opérations (la leçon 2AM n'est pas publiée : pas de lien). */
export const RECALL_PRIORITY = {
  source: addition('prior_year_reminder'),
  title: 'تذكّر — السنة الثانية: أولوية العمليات',
  text: 'الضرب والقسمة قبل الجمع والطرح، والأقواس قبل كل شيء: $20 - 4 \\times 3 = 20 - 12 = 8$ ، و $5 + (12 - 2) \\div 2 = 5 + 10 \\div 2 = 10$ .',
  lesson: 'silsila-bidun-aqwas',
};

/** طرائق p. 13, réécrites (autres nombres). */
export const METHOD = {
  compute: {
    source: src('method-6', 13, 'طرائق'),
    exercise: 'احسب $A = (-56) \\div 7$ و $B = (-45) \\div (-9)$ .',
    solution: [
      '$A$ : العددان $-56$ و $7$ مختلفا الإشارة، إذن حاصل القسمة سالب. وحاصل قسمة المسافتين $56 \\div 7 = 8$ ، إذن $A = -8$ .',
      '$B$ : العددان $-45$ و $-9$ سالبان، إذن حاصل القسمة موجب. و $45 \\div 9 = 5$ ، إذن $B = 5$ .',
    ],
    rule: ['لحساب حاصل قسمة عدد نسبي على عدد نسبي غير معدوم: نعيّن إشارته بقاعدة الإشارات، ثم نقسم المسافة إلى الصفر للأوّل على المسافة إلى الصفر للثاني.'],
    numbers: { A: -8, B: 5 },
  },
  sign: {
    source: src('method-5', 13, 'طرائق'),
    text: 'في كسر مثل $\\frac{-3}{7}$ ننظر إلى إشارتي البسط والمقام: إن كانتا متشابهتين فالكسر موجب، وإلا فهو سالب. وقد لا يكون حاصل القسمة عددًا عشريًا.',
  },
  products: {
    source: src('act-4', 9, 'أنشطة', 3),
    text: 'في حاصل قسمة جداءين نعدّ العوامل السالبة في البسط وفي المقام: $\\frac{(-2) \\times 3 \\times (-1)}{4 \\times (-5)}$ ، البسط موجب (عاملان سالبان) والمقام سالب (عامل سالب واحد)، فالحاصل سالب.',
  },
  series: {
    source: src('know-10', 12, 'معارف'),
    exercise: 'احسب $C = 8 - (2 \\times (-3) + 4) \\div (-2)$ .',
    solution: [
      'نبدأ بما بين القوسين: الضرب أوّلًا $2 \\times (-3) = -6$ ، ثم الجمع $-6 + 4 = -2$ .',
      'يصبح الحساب $C = 8 - (-2) \\div (-2)$ ، والقسمة قبل الطرح: $(-2) \\div (-2) = 1$ .',
      'إذن $C = 8 - 1 = 7$ .',
    ],
    rule: ['نحترم الأولوية: الأقواس أوّلًا، ثم الضرب والقسمة من اليسار إلى اليمين، ثم الجمع والطرح؛ ولا نعمل من اليسار إلى اليمين دون نظر إلى الأولوية.'],
    numbers: { C: 7 },
  },
};

/** Les phrases de correction partagées par les modules ET la carte. */
export const GUIDE = {
  negNeg: { wrong: 'قسمة عدد سالب على عدد سالب تعطي عددًا سالبًا.', why: 'نتحقّق بالضرب: $(-12) \\times (-5) = 60$ لا $-60$ ، فالرمز $-5$ لا يفتح القفل $(-12) \\times ? = -60$ .', right: '$(-60) \\div (-12) = 5$ ، لأنّ $(-12) \\times 5 = -60$ .' },
  frac: { wrong: '$\\frac{2}{-3}$ ليس هو $-\\frac{2}{3}$ ، و $\\frac{-2}{-3}$ سالب.', why: 'كل من $\\frac{-2}{3}$ و $\\frac{2}{-3}$ و $-\\frac{2}{3}$ يحقّق $(-6) \\times q = 4$ ، أمّا $\\frac{-2}{-3}$ فيساوي $\\frac{2}{3}$ .', right: '$\\frac{-2}{3} = \\frac{2}{-3} = -\\frac{2}{3}$ ، و $\\frac{-2}{-3} = \\frac{2}{3}$ .' },
  priority: { wrong: '$(-12) \\div (1 - 4) + 2$ : نقسم $-12$ على $1$ أوّلًا.', why: 'ما بين القوسين أوّلًا: $1 - 4 = -3$ ، ثم القسمة $(-12) \\div (-3) = 4$ ، ثم $4 + 2 = 6$ .', right: '$(-12) \\div (1 - 4) + 2 = 6$ .' },
  subneg: { wrong: '$7 - (-6) = 1$ .', why: 'طرح عدد سالب هو جمع معاكسه: $7 - (-6) = 7 + 6 = 13$ .', right: '$7 - 3 \\times (-2) = 7 + 6 = 13$ .' },
  zero: 'لا يوجد قفل $0 \\times ? = 5$ يُفتح بأيّ رمز، ولا حاصل قسمة على $0$ .',
};

/** « أستعدّ » — أستعدّ p. 7, items 12 et 13, RÉÉCRITS en affirmations ; les autres items vont aux autres leçons de l'unité. */
export const PREP_ITEMS = [
  { n: 12, skill: 'jam', text: '$-7 + 10 - 5 = -2$ .', answer: true, why: 'نجمع المتشابهة: $-7 - 5 = -12$ ثم $-12 + 10 = -2$ .' },
  { n: 13, skill: 'jam', text: '$(-4) + (-6)$ يُكتب $-4 - 6$ ويساوي $-10$ .', answer: true, why: 'جمع عدد سالب هو طرح مسافته: $(-4) + (-6) = -4 - 6 = -10$ .' },
].map((it) => ({ ...it, source: src('prep', 7, 'أستعدّ', it.n) }));

/**
 * Les items de la PLATEFORME : le réseau dit que la leçon s'appuie sur `3am.m1.r01` (le produit de deux relatifs et de plusieurs : les deux leçons
 * publiées de l'unité) ; « أستعدّ » mesure aussi les priorités (`2am.m1.r01`) et la somme algébrique (`2am.m4.r06`), hors réseau.
 */
export const PREP_PLATFORM_ITEMS = [
  { skill: 'jidaa', text: '$(-8) \\times (-0{,}5) = 4$ .', answer: true, why: 'للعددين الإشارة نفسها: الجداء موجب، و $8 \\times 0{,}5 = 4$ .' },
  { skill: 'jidaaIda', text: '$(-3) \\times 4 \\times (-1) \\times (-2) = 24$ .', answer: false, why: 'ثلاثة عوامل سالبة (عدد فردي): الجداء سالب، $(-3) \\times 4 \\times (-1) \\times (-2) = -24$ .' },
  { skill: 'jidaa', text: '$7 \\times (-6) = -42$ .', answer: true, why: 'إشارتان مختلفتان: الجداء سالب، و $7 \\times 6 = 42$ .' },
  { skill: 'awlawiya', text: '$20 - 4 \\times 3 = 48$ .', answer: false, why: 'الضرب قبل الطرح: $20 - 12 = 8$ .' },
  { skill: 'awlawiya', text: '$5 + (12 - 2) \\div 2 = 10$ .', answer: true, why: 'القوسان أوّلًا: $5 + 10 \\div 2 = 5 + 5 = 10$ .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));
