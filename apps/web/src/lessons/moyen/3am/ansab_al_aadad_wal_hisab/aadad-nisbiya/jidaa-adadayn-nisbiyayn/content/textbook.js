/**
 * Le contenu du درس « جداء عددين نسبيين » (3AM, unité 1) — données pures. Le manuel est la RÉFÉRENCE (docs/sources/3am/unit1/
 * extraction.json : نشاط 3 p. 9, معارف p. 10, طرائق p. 11, أستعدّ p. 7) ; chaque texte montré à l'élève est RÉÉCRIT par la
 * plateforme (guide §4ter-bis : mêmes définitions et notations, autres mots, autres exemples, autres nombres). La `source` de
 * chaque bloc garde la traçabilité (`check:textbook`) ; `SourceTag` est muet pour l'élève.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/**
 * LE LABO DE L'ENTRÉE — le شريط المصعد (`elevator-reel`, thème `mallElevator`) : expérience de la plateforme. Les nombres sont ceux
 * du preset `levels.js` (مبتدئ : r = −2 → étage −6, prédire (−2 ; −1), −2 → 4, 3 → 6, 3 → −9 ; متقدم : prédiction (−3 ; −2), l'étage −6 deux fois,
 * (−2 → 3), (2 → −5)).
 */
export const LAB = {
  source: addition('platform_designed_entry'),
  beginner: {
    step: '1',
    tasks: [
      { id: 'm1', r: '-2', floor: '-6' },
      { id: 'p1', kind: 'predict', r: '-2', t: '-1', options: ['2', '-2', '-3', '-1'], key: '2', misc: { '-2': 'MISC-JIDAA-NEGNEG', '-3': 'MISC-JIDAA-ADD', '-1': 'MISC-JIDAA-SUB' } },
      { id: 'm2', r: '-2', floor: '4' }, { id: 'm3', r: '3', floor: '6' }, { id: 'm4', r: '3', floor: '-9' },
    ],
  },
  advanced: {
    step: '0,5',
    tasks: [
      { id: 'a1', kind: 'predict', r: '-3', t: '-2', options: ['6', '-6', '-5', '1'], key: '6' },
      { id: 'a2', kind: 'both', floor: '-6' }, { id: 'a3', r: '-2', floor: '3' }, { id: 'a4', r: '2', floor: '-5' },
    ],
  },
};

/**
 * LE LABO DU MODULE 2 (معارف) — « آلة الجداءات » (`sign-machine`, thème `mathClubMachine`, 2026-10-27) : le tableau du نشاط 3 (un facteur
 * fixe, le second qui baisse de 1) devient une machine dont la main fait descendre le second facteur ; chaque produit s'allume en colonne.
 * Les nombres sont ceux du preset `levels.js` (مبتدئ : a = −3, allumer 4 … 0, prédire (−3) × (−1), trouver le produit 12 ; متقدم : a = −4,
 * prédire (−4) × (−2), le produit 8 avec a > 0 puis a < 0, a = 2 → −6). Le tableau (−4) × n de l'étape 5 reste un TRANSFERT hors machine.
 */
export const LAB_SIGNS = {
  source: src('act-3', 9, 'أنشطة'),
  beginner: {
    a: -3,
    tasks: [
      { id: 'm1', kind: 'fill', from: 4, to: 0 },
      { id: 'p1', kind: 'predict', b: -1, options: [3, -3, -4, -2], key: 3, misc: { '-3': 'MISC-JIDAA-NEGNEG', '-4': 'MISC-JIDAA-ADD', '-2': 'MISC-JIDAA-SUB' } },
      { id: 'm2', kind: 'reach', product: 12 },
    ],
  },
  advanced: {
    a: -4,
    tasks: [
      { id: 'a1', kind: 'predict', b: -2, options: [8, -8, -6, -2], key: 8, misc: { '-8': 'MISC-JIDAA-NEGNEG', '-6': 'MISC-JIDAA-ADD', '-2': 'MISC-JIDAA-SUB' } },
      { id: 'a2', kind: 'both', product: 8 },
      { id: 'a3', kind: 'reach', a: 2, product: -6 },
    ],
  },
};

/** Les connaissances, RÉÉCRITES : la somme répétée, la règle des signes, la justification, le calcul. */
export const KNOWLEDGE = {
  repeated: {
    source: addition('knowledge_formalization'),
    text: 'ضرب عدد في عدد طبيعي هو جمع متكرر: $(-2) \\times 3 = (-2) + (-2) + (-2) = -6$ . إذن جداء عدد سالب في عدد موجب سالب.',
  },
  signRule: {
    source: src('know-1', 10, 'معارف'),
    lines: [
      'جداء عددين نسبيين لهما الإشارة نفسها هو عدد موجب.',
      'جداء عددين نسبيين لهما إشارتان مختلفتان هو عدد سالب.',
    ],
    examples: '$(-5) \\times (-4) = 20$ ، $6 \\times 3 = 18$ ، $6 \\times (-3) = -18$ ، $(-1{,}5) \\times 4 = -6$ .',
  },
  justify: {
    source: src('act-3', 9, 'أنشطة'),
    text: 'نعلم أنّ $(-3) \\times 4 = -12$ . ونوزّع الضرب: $(-3) \\times 4 + (-3) \\times (-4)$ يساوي $(-3) \\times \\big(4 + (-4)\\big)$ ، أي $(-3) \\times 0$ ، أي $0$ . العدد الذي نضيفه إلى $-12$ ليعطي $0$ هو $12$ ، إذن $(-3) \\times (-4) = 12$ : جداء عددين سالبين موجب.',
  },
  table: {
    source: src('act-3', 9, 'أنشطة'),
    rows: ['(-4) \\times 3 = -12', '(-4) \\times 2 = -8', '(-4) \\times 1 = -4', '(-4) \\times 0 = 0'],
    text: 'كلّما نقص العامل الثاني بـ 1 زاد الجداء بـ 4 ، فنكمل: $(-4) \\times (-1) = 4$ و $(-4) \\times (-2) = 8$ .',
  },
  distance: {
    source: src('know-2', 10, 'معارف'),
    text: 'لحساب جداء عددين نسبيين نعيّن أوّلًا إشارته بقاعدة الإشارات، ثم نضرب المسافتين إلى الصفر.',
    zero: 'من أجل كل عدد نسبي $a$ : $a \\times 0 = 0$ و $0 \\times a = 0$ .',
  },
};

/** « تذكّر — السنة الثانية » : جمع الأعداد النسبية (درس 2AM `jam-tarh-nisbiya`، منشور منذ 2026-10-29 : الرابط يظهر وحده). */
export const RECALL_ADD = {
  source: addition('prior_year_reminder'),
  title: 'تذكّر — السنة الثانية',
  text: 'لجمع عددين نسبيين لهما الإشارة نفسها نجمع مسافتيهما إلى الصفر ونحتفظ بالإشارة: $(-3) + (-4) = -7$ . وإذا اختلفت إشارتاهما نطرح الأصغر من الأكبر بين المسافتين ونحتفظ بإشارة العدد الأبعد عن الصفر: $(-9) + 4 = -5$ .',
  lesson: 'jam-tarh-nisbiya',
};

/** طرائق p. 11, réécrite : la mise en page d'une solution commentée (autres nombres). */
export const METHOD = {
  steps: {
    source: src('method-1', 11, 'طرائق'),
    exercise: 'احسب $A = (-6) \\times 7$ ثم $B = (-1{,}5) \\times (-8)$ .',
    solution: [
      '$A$ : العددان مختلفان في الإشارة، فالجداء سالب. نضرب المسافتين: $6 \\times 7 = 42$ ، إذن $A = -42$ .',
      '$B$ : للعددين الإشارة نفسها، فالجداء موجب. نضرب المسافتين: $1{,}5 \\times 8 = 12$ ، إذن $B = 12$ .',
    ],
    rule: 'نعيّن إشارة الجداء أوّلًا، ثم نضرب المسافتين إلى الصفر.',
    numbers: { A: -42, B: 12 },
  },
  decimal: 'انتبه إلى الفاصلة: $0{,}3 \\times 0{,}2 = 0{,}06$ لأنّ في العاملين 2 رقمًا بعد الفاصلة، ففي الجداء 2 رقمًا بعدها.',
};

/** Les phrases de correction partagées par les modules ET la carte. */
export const GUIDE = {
  negneg: { wrong: 'جداء $(-3)$ في $(-4)$ سالب لأنّ العددين سالبان.', why: 'لو كان سالبًا لما كان $(-3) \\times 4 + (-3) \\times (-4) = 0$ .', right: '$(-3) \\times (-4) = 12$ .' },
  add: { wrong: 'جداء $(-3)$ في $(-2)$ يساوي $-5$ .', why: 'هذا جمع لا ضرب: الضرب يعطي $(-3) \\times (-2) = 6$ .', right: '$(-3) \\times (-2) = 6$ .' },
  larger: { wrong: 'جداء $(-2)$ في $3$ موجب لأنّ 3 أبعد عن الصفر من $-2$ .', why: 'في الجداء لا تتبع الإشارة العدد الأبعد (هذه قاعدة الجمع): إشارتان مختلفتان تعطيان جداءً سالبًا.', right: '$(-2) \\times 3 = -6$ .' },
  decimal: { wrong: 'جداء $(-0{,}3)$ في $(-0{,}2)$ يساوي $0{,}6$ .', why: 'نضرب $3 \\times 2 = 6$ ثم نعدّ الأرقام بعد الفاصلة في العاملين: 2 رقمًا.', right: '$(-0{,}3) \\times (-0{,}2) = 0{,}06$ .' },
  zero: 'مصعد سرعته $0$ لا يتحرك: $0 \\times t = 0$ مهما كان الزمن.',
};

/** « أستعدّ » — أستعدّ p. 7, items 7, 10, 11, 14, 15, RÉÉCRITS en affirmations (les autres items vont aux autres leçons de l'unité). */
export const PREP_ITEMS = [
  { n: 14, skill: 'jam', text: '$(-7) + (-5) = -12$ .', answer: true, why: 'للعددين الإشارة نفسها: نجمع المسافتين $7 + 5 = 12$ ونحتفظ بالإشارة السالبة.' },
  { n: 11, skill: 'jam', text: '$3 - (-8) = 11$ .', answer: true, why: 'طرح عدد هو جمع معاكسه: $3 - (-8) = 3 + 8 = 11$ .' },
  { n: 7, skill: 'jam', text: 'انتقلت درجة الحرارة من $-2^\\circ\\mathrm{C}$ إلى $-10^\\circ\\mathrm{C}$ ، فارتفعت بـ $8^\\circ\\mathrm{C}$ .', answer: false, why: '$-10$ أصغر من $-2$ : الحرارة انخفضت بـ $8^\\circ\\mathrm{C}$ .' },
  { n: 10, skill: 'jam', text: 'درجة الحرارة في المطبخ $29^\\circ\\mathrm{C}$ وفي المجمدة $-18^\\circ\\mathrm{C}$ ، والفارق بينهما $11^\\circ\\mathrm{C}$ .', answer: false, why: 'الفارق $29 - (-18) = 29 + 18 = 47^\\circ\\mathrm{C}$ .' },
].map((it) => ({ ...it, source: src('prep', 7, 'أستعدّ', it.n) }));

/**
 * Les items de la PLATEFORME : le réseau dit que la leçon s'appuie sur `2am.m4.r05` (جمع وطرح الأعداد النسبية), et « أستعدّ »
 * mesure aussi la distributivité (`2am.m1.r03`) et la distance à zéro (2AM) — extra `priorKnowledge`, mesurés sans lien du réseau.
 */
export const PREP_PLATFORM_ITEMS = [
  { skill: 'jam', text: '$(-4) + (-4) + (-4) = -12$ .', answer: true, why: 'ثلاثة حدود كلّها $-4$ : $-4 - 4 - 4 = -12$ .' },
  { skill: 'tawzi', text: '$5 \\times (2 + 3) = 5 \\times 2 + 5 \\times 3$ .', answer: true, why: 'توزيع الضرب على الجمع: $25 = 10 + 15$ .' },
  { skill: 'masafa', text: 'المسافة إلى الصفر للعدد $-3{,}5$ هي $-3{,}5$ .', answer: false, why: 'المسافة لا تكون سالبة: المسافة إلى الصفر للعدد $-3{,}5$ هي $3{,}5$ .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));
