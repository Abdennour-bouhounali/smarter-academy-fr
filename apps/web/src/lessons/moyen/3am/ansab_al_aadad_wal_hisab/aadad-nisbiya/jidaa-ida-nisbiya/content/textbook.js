/**
 * Le contenu du درس « جداء عدة أعداد نسبية » (3AM, unité 1) — données pures. Le manuel est la RÉFÉRENCE (docs/sources/3am/unit1/
 * extraction.json : معارف p. 10 (know-3 … know-6), p. 12 (know-7), طرائق p. 11 et 13 (method-1 ex. 3, method-2, method-3, method-4),
 * أستعدّ p. 7) ; chaque texte montré à l'élève est RÉÉCRIT par la plateforme (guide §4ter-bis : mêmes définitions et notations,
 * autres mots, autres exemples, autres nombres). La `source` de chaque bloc garde la traçabilité (`check:textbook`) ; `SourceTag`
 * est muet pour l'élève. Le manuel n'a AUCUNE activité pour plusieurs facteurs : l'entrée est celle de la plateforme.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/**
 * LES LABOS — le مسار الروبوت (`robot-track`, thème `roboticsClub`) : expérience de la plateforme. Les nombres sont ceux du preset
 * `levels.js` (مبتدئ : m1 … m4 ; متقدم : a1 … a3) ; le monde `square` est posé seul en معارف.
 */
export const LAB = {
  source: addition('platform_designed_entry'),
  beginner: {
    world: 'track',
    tasks: [
      { id: 'm1', flag: '-5', placed: ['5'], tray: ['-1'], need: 2, lock: true },
      { id: 'm2', flag: '5', placed: ['5', '-1'], tray: ['-1', '2', '-5'], need: 3, lock: true },
      { id: 'm3', flag: '-24', placed: ['2', '3', '4'], tray: [], need: 3, flip: true },
      { id: 'm4', flag: '24', placed: ['2', '3', '4'], tray: [], need: 3, flip: true, minNeg: 2 },
    ],
  },
  advanced: {
    world: 'track',
    tasks: [
      { id: 'a1', kind: 'predict', cards: ['-2', '3', '-1', '-4', '0,5'] },
      { id: 'a2', flag: '-2', placed: [], tray: ['-5', '4', '-0,5', '2'], need: 4, at: 2 },
      { id: 'a3', kind: 'repeat', card: '3', unit: '-1', goals: ['-3', '3'], predictN: 15 },
    ],
  },
  square: { world: 'square', tasks: [{ id: 'q1', kind: 'sqNeg' }, { id: 'q2', kind: 'sqVal', target: '2,25' }] },
};

/** Les connaissances, RÉÉCRITES : le معاكس, le signe par la parité, le carré, les rôles du signe −, le calcul, le توزيع. */
export const KNOWLEDGE = {
  opposite: {
    source: src('know-3', 10, 'معارف'),
    lines: ['جداء عدد نسبي $a$ في $-1$ هو معاكس (نظير) العدد $a$ : $(-1) \\times a = a \\times (-1) = -a$ .'],
    examples: '$(-1) \\times 8{,}4 = -8{,}4$ ، $(-1) \\times (-3) = 3$ . فالعدد $-a$ قد يكون سالبًا وقد يكون موجبًا.',
  },
  parity: {
    source: src('know-5', 10, 'معارف'),
    lines: [
      'جداء عدة أعداد نسبية غير معدومة يكون سالبًا إذا كان عدد عوامله السالبة فرديًا، وموجبًا إذا كان زوجيًا.',
      'تغيير ترتيب العوامل لا يغيّر الجداء.',
    ],
    examples: '$2 \\times (-5) \\times (-1) \\times (-3) = -30$ : ثلاثة عوامل سالبة. $(-2) \\times (-2) \\times (-5) \\times (-0{,}5) = 10$ : أربعة عوامل سالبة.',
  },
  square: {
    source: src('know-6', 10, 'معارف'),
    text: 'مربّع عدد نسبي $a$ هو $a^2 = a \\times a$ . لا يكون سالبًا أبدًا: هو موجب إذا كان $a \\neq 0$ ، و $(-a)^2 = a^2$ ؛ مثلًا $(-1{,}5)^2 = (+1{,}5)^2 = 2{,}25$ .',
  },
  roles: {
    source: src('know-4', 10, 'معارف'),
    text: 'للإشارة $-$ ثلاثة أدوار: علامة طرح في $17 - 9$ ، وإشارة عدد سالب في $-8$ ، وفي $-b$ معاكس العدد $b$ (إذا كان $b = -2$ كان $-b = 2$).',
  },
  distribute: {
    source: src('know-7', 12, 'معارف'),
    text: 'نوزّع الضرب على الجمع والطرح في الاتجاهين لتسهيل الحساب على الأعداد. إخراج عامل مشترك: $(-3{,}2) \\times 7 + (-3{,}2) \\times 3 = (-3{,}2) \\times (7 + 3) = (-3{,}2) \\times 10 = -32$ . ونشر الجداء: $(-25) \\times (4 - 0{,}4) = (-25) \\times 4 - (-25) \\times 0{,}4 = -100 + 10 = -90$ .',
  },
};

/** « تذكّر » — درس « جداء عددين نسبيين » (publié) : la règle des signes de deux facteurs, jamais reconstruite. */
export const RECALL_LESSON1 = {
  source: addition('prior_year_reminder'),
  title: 'تذكّر — جداء عددين نسبيين',
  text: 'جداء عددين لهما الإشارة نفسها موجب، وجداء عددين مختلفي الإشارة سالب، ومسافته إلى الصفر هي جداء المسافتين: $(-4) \\times (-2{,}5) = 10$ و $(-4) \\times 2{,}5 = -10$ . وجداء أيّ عدد في $0$ يساوي $0$ .',
  lesson: 'jidaa-adadayn-nisbiyayn',
};

/** طرائق p. 11 et 13, réécrites (autres nombres). */
export const METHOD = {
  steps: {
    source: src('method-2', 11, 'طرائق'),
    exercise: 'احسب $A = 2 \\times (-5) \\times (-1{,}5) \\times (-4)$ ثم $B = 11 \\times (-2) \\times (-1) \\times (-3) \\times (-5)$ .',
    solution: [
      '$A$ : ثلاثة عوامل سالبة (عدد فردي) فالجداء سالب. نضرب المسافات إلى الصفر: $2 \\times 5 \\times 1{,}5 \\times 4 = 60$ ، إذن $A = -60$ .',
      '$B$ : أربعة عوامل سالبة (عدد زوجي) فالجداء موجب. $11 \\times 2 \\times 1 \\times 3 \\times 5 = 330$ ، إذن $B = 330$ .',
    ],
    rule: 'نعدّ العوامل السالبة: إذا كان عددها فرديًا كان الجداء سالبًا، وإذا كان زوجيًا كان موجبًا؛ ثم نضرب المسافات إلى الصفر.',
    numbers: { A: -60, B: 330 },
  },
  count: {
    source: src('method-1', 11, 'طرائق', 3),
    text: 'إذا كان في الجداء ثلاثة عوامل سالبة من خمسة عوامل فإشارته سالبة، ونضرب بعد ذلك المسافات إلى الصفر: $(-2) \\times 0{,}5 \\times (-8) \\times 3 \\times (-1) = -(2 \\times 0{,}5 \\times 8 \\times 3 \\times 1) = -24$ .',
  },
  reorder: {
    source: src('method-4', 13, 'طرائق'),
    text: 'لتسهيل الحساب نغيّر ترتيب العوامل دون أن يتغيّر الجداء، فنجمع العوامل التي جداؤها عدد مستدير: $4 \\times 25 = 100$ .',
  },
  special: {
    source: src('method-3', 11, 'طرائق'),
    text: 'إذا كان أحد العوامل معدومًا كان الجداء معدومًا مهما كانت الإشارات: $(-1) \\times (-1) \\times 5 \\times (-2) \\times 0 = 0$ ، فنعدّ العوامل السالبة فقط حين لا يوجد عامل معدوم.',
  },
};

/** Les phrases de correction partagées par les modules ET la carte. */
export const GUIDE = {
  anyNeg: { wrong: 'يكفي عامل سالب واحد ليكون الجداء سالبًا.', why: 'لا: عاملان سالبان يعيدان الروبوت إلى الجهة الموجبة، فجداء $(-2) \\times (-3) \\times 4$ هو $24$ .', right: 'الجداء سالب إذا كان عدد عوامله السالبة فرديًا.' },
  squareNeg: { wrong: 'مربّع $-3$ سالب.', why: '$(-3)^2 = (-3) \\times (-3)$ جداء عاملين سالبين، وهو موجب.', right: '$(-3)^2 = 9$ .' },
  minusA: { wrong: 'العدد $-a$ سالب دائمًا.', why: '$-a$ هو معاكس $a$ : إذا كان $a = -6$ كان $-a = 6$ .', right: '$-a = (-1) \\times a$ قد يكون موجبًا.' },
  distSign: { wrong: '$(-25) \\times (4 - 0{,}4) = -100 - 10$ .', why: 'ننشر الطرح: $(-25) \\times 4 - (-25) \\times 0{,}4$ ، والعامل الثاني يضيف $+10$ لا $-10$ .', right: '$(-25) \\times (4 - 0{,}4) = -100 + 10 = -90$ .' },
  zero: 'عامل واحد معدوم يجعل الجداء كلّه معدومًا، حتى لو كثرت العوامل السالبة.',
};

/** « أستعدّ » — أستعدّ p. 7, items 6 et 9 (+ 5), RÉÉCRITS en affirmations ; les autres items vont aux autres leçons de l'unité. */
export const PREP_ITEMS = [
  { n: 6, skill: 'tartib', text: 'أكبر الأعداد $-4{,}5$ ; $-3$ ; $-3{,}5$ ; $-4$ ; $-3{,}2$ هو $-3$ .', answer: true, why: 'كلّها سالبة، وأقربها إلى الصفر أكبرها: $-3$ .' },
  { n: 9, skill: 'maakus', text: 'النقطتان $A(-4\\,;\\,2)$ و $B(4\\,;\\,-2)$ متناظرتان بالنسبة إلى مبدإ المعلم.', answer: true, why: 'إحداثيا كل منهما معاكسا إحداثيّي الأخرى.' },
].map((it) => ({ ...it, source: src('prep', 7, 'أستعدّ', it.n) }));

/**
 * Les items de la PLATEFORME : le réseau dit que la leçon s'appuie sur `2am.m4.r05` (جمع وطرح الأعداد النسبية) ; « أستعدّ » mesure aussi le
 * produit de deux relatifs (la leçon précédente de l'unité, publiée), le معاكس (`2am.m4.r01`) et la parité d'un entier.
 */
export const PREP_PLATFORM_ITEMS = [
  { skill: 'jidaa', text: '$(-6) \\times (-5) = 30$ .', answer: true, why: 'للعددين الإشارة نفسها: الجداء موجب، و $6 \\times 5 = 30$ .' },
  { skill: 'jidaa', text: '$(-0{,}5) \\times 8 = 4$ .', answer: false, why: 'إشارتان مختلفتان: الجداء سالب، $(-0{,}5) \\times 8 = -4$ .' },
  { skill: 'maakus', text: 'معاكس العدد $-7$ هو $7$ .', answer: true, why: 'مجموعهما $-7 + 7 = 0$ .' },
  { skill: 'zawji', text: 'العدد $17$ عدد زوجي.', answer: false, why: '$17 = 2 \\times 8 + 1$ : هو عدد فردي.' },
  { skill: 'jam', text: '$(-8) + 3 = -5$ .', answer: true, why: 'إشارتان مختلفتان: نطرح $3$ من $8$ ونحتفظ بإشارة الأبعد عن الصفر: $-5$ .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));
