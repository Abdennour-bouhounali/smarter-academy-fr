/**
 * Le contenu du درس « النسبة المئوية » (3AM, unité 6) — données pures. Le manuel est la RÉFÉRENCE (docs/sources/3am/unit6/extraction.json : نشاط 2 p. 88,
 * معارف 2 p. 90, طرائق p. 91, أستعدّ p. 87) ; chaque texte montré à l'élève est RÉÉCRIT par la plateforme (guide §4ter-bis : mêmes définitions et notations,
 * autres mots, autres exemples, autres nombres). La `source` de chaque bloc garde la traçabilité (`check:textbook`) ; `SourceTag` est muet pour l'élève.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** LE LABO DE L'ENTRÉE — la صينية (`hundred-grid`, thème `pantry`) : expérience de la plateforme, tâches du preset `levels.js`. */
export const LAB = {
  source: addition('platform_designed_entry'),
  beginner: { tasks: [
    { kind: 'of', x: '240', t: 15 }, { kind: 'rate', x: '150', part: '60' },
    { kind: 'change', x: '200', dir: 'up', t: 15 }, { kind: 'change', x: '250', dir: 'down', t: 20 },
  ] },
  advanced: { tasks: [
    { kind: 'rate', x: '75', part: '52.5' }, { kind: 'rate', x: '32', part: '8' }, { kind: 'whole', part: '84', t: 60 },
    { kind: 'change', x: '200', dir: 'up', t: 20 }, { kind: 'change', carry: true, dir: 'down', t: 20 },
  ] },
};

/** « تذكّر » — la leçon 2AM `nisba-miawiya` (حساب نسبة مئوية وتوظيفها, non publiée : pas de lien) : RAPPELÉE, jamais reconstruite. */
export const RECALL = {
  source: addition('prior_year_reminder'),
  title: 'تذكّر — السنة الثانية',
  text: 'في السنة الثانية عرفنا أنّ $25\\%$ تعني $25$ من كلّ $100$ ، وحسبنا نسبة جزء من كلّ، وحسبنا نسبة مئوية من عدد. الآن نعامل النسبة المئوية على أنّها وضعية تناسبية بمعامل معلوم، ونحسب بها زيادة أو تخفيضًا.',
  lesson: 'nisba-miawiya',
};

/** معارف 2 (p. 90) — la propriété, le tableau et ses deux exemples, réécrits avec les exemples de la plateforme. */
export const KNOWLEDGE = {
  definition: {
    source: src('know-2a', 90, 'معارف', 2),
    text: 'النسبة المئوية $t\\%$ هي الكسر $\\frac{t}{100}$ . تقسم كمّية إلى مئة جزء متساوٍ، فيكون $t\\%$ منها هو $t$ جزءًا من هذه الأجزاء. مثلًا $35\\%$ هي $\\frac{35}{100}$ .',
  },
  property: {
    source: src('know-2a', 90, 'معارف', 2),
    text: 'لحساب $t\\%$ من عدد $x$ نضرب هذا العدد في $\\frac{t}{100}$ ، أي $x \\times \\frac{t}{100}$ . والعدد $\\frac{t}{100}$ هو معامل التناسبية بين الكلّ وجزئه. مثلًا: $35\\%$ من $80$ هي $80 \\times \\frac{35}{100} = 28$ .',
  },
  table: {
    source: src('know-2b', 90, 'معارف', 2),
    text: 'لحساب نسبة مئوية نكتب جدول تناسبية: الكلّ $b$ يقابله $100$ ، والجزء $a$ يقابله $t$ ، فنجد $\\frac{a}{b} = \\frac{t}{100}$ . مثلًا: $12$ تلميذًا من $30$ : $\\frac{12}{30} = 0{,}4 = \\frac{40}{100}$ ، فالنسبة $40\\%$ .',
    rows: [['الكلّ', '30', '100'], ['الجزء', '12', 't']],
  },
  example: {
    source: src('know-2b', 90, 'معارف', 2),
    text: 'قارورة عصير فيها $60\\ \\mathrm{cL}$ ، منها $45\\%$ ماء. المعامل $\\frac{45}{100}$ ينقل من الكلّ إلى الجزء: الماء $60 \\times \\frac{45}{100} = 27\\ \\mathrm{cL}$ .',
    table: { head: ['الكلّ (cL)', '100', '60'], rows: [['الجزء (cL)', '45', '27']], coef: '\\frac{45}{100}' },
  },
  change: {
    source: src('method-2', 91, 'طرائق'),
    text: 'لحساب ناتج زيادة عدد $x$ بـ $t\\%$ نحسب $x + x \\times \\frac{t}{100}$ أي $\\left(1 + \\frac{t}{100}\\right) x$ . ولحساب ناتج تخفيضه بـ $t\\%$ نحسب $x - x \\times \\frac{t}{100}$ أي $\\left(1 - \\frac{t}{100}\\right) x$ .',
  },
  base: {
    source: addition('knowledge_formalization'),
    text: 'النسبة المئوية تُحسب دائمًا من الكمّية التي نبدأ بها. لذلك فزيادة بـ $20\\%$ ثم تخفيض بـ $20\\%$ لا يعيدان الكمّية إلى أصلها: نضرب في $1{,}2 \\times 0{,}8 = 0{,}96$ لا في $1$ .',
  },
};

/** طرائق p. 91 — les trois cas du pourcentage et la variation en pourcentage, RÉÉCRITS avec d'autres nombres. */
export const METHOD = {
  cases: {
    source: src('know-2b', 90, 'معارف', 2),
    exercise: 'في مخزن جمعيّة $160$ كيسًا من التمر. أحسب: (أ) $35\\%$ منها ، (ب) نسبة $24$ كيسًا منها ، (جـ) المخزون الذي $45$ كيسًا منه هي $30\\%$ .',
    solution: [
      '(أ) الجزء: $160 \\times \\frac{35}{100} = 56$ كيسًا.',
      '(ب) النسبة: الكلّ $160$ يقابله $100$ والجزء $24$ يقابله $t$ ، فـ $t = \\frac{24 \\times 100}{160} = 15$ ، أي $15\\%$ .',
      '(جـ) الكلّ: الكلّ $b$ يقابله $100$ والجزء $45$ يقابله $30$ ، فـ $b = \\frac{45 \\times 100}{30} = 150$ كيسًا.',
    ],
    rule: 'ثلاث حالات في جدول تناسبية واحد: الكلّ ↔ 100 ، الجزء ↔ t . المجهول هو الجزء أو النسبة أو الكلّ، ونحسبه بضرب أو قسمة بمعامل التناسبية.',
    numbers: { part: 56, rate: 15, whole: 150 },
  },
  change: {
    source: src('method-2', 91, 'طرائق'),
    exercise: 'ثمن قميص $1500$ دج ارتفع بـ $20\\%$ ثم انخفض بـ $20\\%$ . ما ثمنه الجديد؟',
    solution: [
      'الارتفاع بـ $20\\%$ : $1500 \\times 1{,}2 = 1800$ دج.',
      'الانخفاض بـ $20\\%$ من الثمن الجديد $1800$ : $1800 \\times 0{,}8 = 1440$ دج.',
      'الثمن الجديد $1440$ دج، لا $1500$ : فـ $20\\%$ الثانية حُسبت من $1800$ لا من $1500$ .',
    ],
    rule: 'للزيادة بـ $t\\%$ نضرب في $1 + \\frac{t}{100}$ ، وللتخفيض بـ $t\\%$ نضرب في $1 - \\frac{t}{100}$ ؛ وعند تغيّرين متتاليين نضرب المعاملين.',
    numbers: { first: 1800, second: 1440 },
  },
};

/** « أستعدّ » — أستعدّ p. 87, items 7, 8 et 9, RÉÉCRITS en affirmations. */
export const PREP_ITEMS = [
  { n: 7, skill: 'nisba', text: 'في قسم فيه $30$ تلميذًا منهم $12$ بنتًا، تكون نسبة البنات $40\\%$ .', answer: true, why: '$\\frac{12}{30} = 0{,}4 = \\frac{40}{100}$ .' },
  { n: 8, skill: 'hisab', text: 'لحساب $75\\%$ من $200$ نحسب $200 - 75$ .', answer: false, why: '$75\\%$ من $200$ هي $200 \\times \\frac{75}{100} = 150$ ، لا $200 - 75 = 125$ .' },
  { n: 9, skill: 'qisma', text: 'إذا كان $2 = \\frac{3}{x}$ فإنّ $x = 1{,}5$ .', answer: true, why: '$2 \\times 1{,}5 = 3$ ، فالعدد المجهول $1{,}5$ .' },
].map((it) => ({ ...it, source: src('prep', 87, 'أستعدّ', it.n) }));

/**
 * Les items de la PLATEFORME : le réseau dit que la leçon s'appuie sur `2am.m6.r04` (حساب نسبة مئوية وتوظيفها, leçon 2AM `nisba-miawiya`) —
 * « أستعدّ » doit le mesurer (LEARNING_NET.md §4.4).
 */
export const PREP_PLATFORM_ITEMS = [
  { skill: 'hisab', text: '$50\\%$ من عدد هي نصفه.', answer: true, why: '$50\\% = \\frac{50}{100} = \\frac{1}{2}$ .' },
  { skill: 'hisab', text: '$25\\%$ من $60$ تساوي $25$ .', answer: false, why: '$25\\%$ من $60$ هي $60 \\times \\frac{25}{100} = 15$ .' },
  { skill: 'nisba', text: '$3$ من $4$ تساوي $34\\%$ .', answer: false, why: '$\\frac{3}{4} = 0{,}75 = 75\\%$ .' },
  { skill: 'nisba', text: 'الكسر $\\frac{7}{10}$ يساوي $70\\%$ .', answer: true, why: '$\\frac{7}{10} = \\frac{70}{100}$ .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les phrases de correction partagées par les modules ET la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  addT: {
    wrong: 'ثمن $400$ دج ارتفع بـ $15\\%$ ، فأكتب $400 + 15 = 415$ .',
    why: '$15\\%$ هي $\\frac{15}{100}$ من الثمن لا $15$ دج: الزيادة $400 \\times 0{,}15 = 60$ .',
    right: '$400 + 60 = 460$ دج ، أي $400 \\times 1{,}15 = 460$ .',
  },
  whole: {
    wrong: 'ارتفع ثمن إلى $2300$ بـ $15\\%$ ، فأحسب $15\\%$ من $2300$ وأطرحها.',
    why: '$15\\%$ تُحسب من الثمن القديم لا من الجديد: $2300$ هو $115\\%$ من الأصل.',
    right: '$2300 \\div 1{,}15 = 2000$ دج.',
  },
  undo: {
    wrong: 'زاد ثمن بـ $20\\%$ ثم نقص بـ $20\\%$ ، فعاد إلى الثمن الأصلي.',
    why: 'التخفيض حُسب من ثمن أكبر، فهو أكبر من الزيادة.',
    right: '$200 \\times 1{,}2 \\times 0{,}8 = 192$ لا $200$ .',
  },
  swap: {
    wrong: '$12$ تلميذًا من $30$ : نسبتهم $\\frac{30}{12} = 250\\%$ .',
    why: 'الجزء في البسط والكلّ في المقام: النسبة $\\frac{12}{30}$ .',
    right: '$\\frac{12}{30} = 0{,}4 = 40\\%$ .',
  },
  oneCell: 'كلّ خانة من المئة تساوي المخزون مقسومًا على $100$ ، و $t$ خانة تساوي $t$ مرّة الخانة الواحدة.',
  moved: 'الزيادة بـ $t\\%$ تضيف $t$ خانة إلى المئة، والتخفيض بـ $t\\%$ يرفع $t$ خانة منها.',
};

/** دورك الآن p. 91 — l'ordre des deux variations, RÉÉCRIT avec d'autres nombres (même résultat dans les deux ordres). */
export const NOW = {
  source: src('now-91', 91, 'دوري الآن'),
  exercise: 'ثمن قميص $1500$ دج انخفض بـ $20\\%$ ثم ارتفع بـ $20\\%$ . ما ثمنه الجديد؟ وماذا تستنتج بمقارنته بمسألة الارتفاع ثم الانخفاض؟',
  solution: [
    'الانخفاض بـ $20\\%$ : $1500 \\times 0{,}8 = 1200$ دج.',
    'الارتفاع بـ $20\\%$ من الثمن الجديد: $1200 \\times 1{,}2 = 1440$ دج.',
    'النتيجة هي نفسها $1440$ دج في الترتيبين، لأنّ $1{,}2 \\times 0{,}8 = 0{,}8 \\times 1{,}2$ ؛ وهي لا تساوي $1500$ .',
  ],
  numbers: { first: 1200, second: 1440 },
};
