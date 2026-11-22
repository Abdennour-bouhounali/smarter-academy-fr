/**
 * Le contenu du درس « قوة عدد نسبي » (3AM, unité 3) — données pures. Le manuel est la RÉFÉRENCE (docs/sources/3am/unit3/
 * extraction.json : معارف 6–8 p. 44, طرائق p. 45, أستعدّ p. 39, نشاط 6 p. 41) ; chaque texte montré à l'élève est RÉÉCRIT par
 * la plateforme (guide §4ter-bis : mêmes définitions et notations, autres mots, autres exemples, autres nombres). La `source`
 * de chaque bloc garde la traçabilité (`check:textbook`) ; `SourceTag` est muet pour l'élève.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/**
 * LE LABO DE L'ENTRÉE — le train des puissances (`power-train`, monde `build`, thème `railway`) : expérience de la plateforme.
 * Les nombres sont ceux du preset `levels.js` (مبتدئ −2 : 16, −32, 1 ; متقدم −3 : −27, 81, 1/9, −1/27).
 */
export const LAB = {
  source: addition('platform_designed_entry'),
  beginner: { world: 'build', base: '-2', targets: ['16', '-32', '1'] },
  advanced: { world: 'build', base: '-3', targets: ['-27', '81', '1/9', '-1/27'] },
  // معارف : deux trains attelés (règles du produit et du quotient), posé seul
  couple: { world: 'couple', base: '2', tasks: [{ m: 3, target: 7, op: 'times' }, { m: 4, target: -2, op: 'times' }, { m: 5, target: 2, op: 'divide' }] },
};

/** معارف 6 (p. 44) — la définition, réécrite : aⁿ, a⁰, a⁻ⁿ. */
export const KNOWLEDGE = {
  definition: {
    source: src('know-6', 44, 'معارف'),
    text: 'ليكن $a$ عددًا نسبيًا و $n$ عددًا طبيعيًا غير معدوم. نرمز بـ $a^n$ إلى جداء $n$ عاملًا كلّ منها يساوي $a$ : $a^n = a \\times a \\times \\ldots \\times a$ ($n$ عاملًا). نقرأ $a^n$ : « $a$ أس $n$ »؛ $a$ هو الأساس و $n$ هو الأس.',
    example: 'مثلًا: $(-2)^4 = (-2) \\times (-2) \\times (-2) \\times (-2) = 16$ و $(-2)^5 = 16 \\times (-2) = -32$ .',
  },
  zero: {
    source: src('know-6', 44, 'معارف'),
    text: 'من أجل كل عدد نسبي غير معدوم $a$ : $a^1 = a$ و $a^0 = 1$ .',
  },
  inverse: {
    source: src('know-6', 44, 'معارف'),
    text: 'من أجل كل عدد نسبي غير معدوم $a$ وكل عدد طبيعي $n$ ، $a^{-n}$ هو مقلوب $a^n$ : $a^{-n} = \\frac{1}{a^n}$ . مثلًا: $(-3)^{-2} = \\frac{1}{(-3)^2} = \\frac{1}{9}$ و $10^{-3} = \\frac{1}{1000} = 0{,}001$ .',
  },
  sign: {
    source: addition('knowledge_formalization'),
    text: 'إذا كان $a$ موجبًا فإنّ $a^n$ موجب. وإذا كان $a$ سالبًا فإنّ $a^n$ موجب عندما يكون $n$ زوجيًا، وسالب عندما يكون $n$ فرديًا.',
  },
  // معارف 7 (p. 44) — les règles, réécrites, avec les exemples de la plateforme
  rules: {
    source: src('know-7', 44, 'معارف'),
    text: 'من أجل عددين نسبيين غير معدومين $a$ و $b$ وعددين صحيحين نسبيين $m$ و $n$ :',
    lines: [
      '$a^m \\times a^n = a^{m+n}$',
      '$\\frac{a^m}{a^n} = a^{m-n}$',
      '$(a^m)^n = a^{m \\times n}$',
      '$(a \\times b)^n = a^n \\times b^n$',
      '$\\left(\\frac{a}{b}\\right)^n = \\frac{a^n}{b^n}$',
    ],
  },
};

/** « تذكّر » — les règles sur les puissances de 10 (درس « قواعد الحساب على قوى العدد 10 » de la même unité) : RAPPELÉES, jamais reconstruites. */
export const RECALL_TEN = {
  source: addition('prior_year_reminder'),
  title: 'تذكّر — قوى العدد 10',
  text: '$10^3 \\times 10^4 = 10^{7}$ ، $\\frac{10^6}{10^2} = 10^{4}$ ، $(10^2)^3 = 10^{6}$ : هذه القواعد التي عرفتها لقوى العدد 10 تبقى صحيحة لكل أساس غير معدوم.',
  lesson: 'qawaid-quwa-ashara',
};

/** « تذكّر — السنة الثانية » (leçon 2AM `silsila-bidun-aqwas`, PUBLIÉE : avec un lien) : l'ordre des opérations, rappelé avant la priorité des puissances. */
export const RECALL_2AM = {
  source: addition('prior_year_reminder'),
  title: 'تذكّر — السنة الثانية',
  text: 'في سلسلة عمليات دون أقواس نحسب الضرب والقسمة قبل الجمع والطرح، ومن اليسار نحو اليمين: $15 + 3 \\times 4 = 15 + 12 = 27$ .',
  lesson: 'silsila-bidun-aqwas',
};

/** « تذكّر — السنة الثانية » (leçon 2AM `silsila-bi-aqwas`, PUBLIÉE : avec un lien) : la barre de fraction groupe le numérateur et le dénominateur, rappelée avant la fraction de l'étape 4. */
export const RECALL_2AM_AQWAS = {
  source: addition('prior_year_reminder'),
  title: 'تذكّر — السنة الثانية',
  text: 'خطّ الكسر يجمع البسط ويجمع المقام كأنّ كلًّا منهما بين قوسين، فنحسب كلًّا منهما أوّلًا ثم نقسم: $\\frac{20+4}{9-3} = (20+4) \\div (9-3) = 24 \\div 6 = 4$ .',
  lesson: 'silsila-bi-aqwas',
};

/** طرائق p. 45 (« قواعد الحساب على قوى عدد نسبي ») et معارف 8 p. 44 (la priorité) — réécrits, autres nombres. */
export const METHOD = {
  simplify: {
    source: src('method-45c', 45, 'طرائق'),
    exercise: 'بسّط العبارة $A = \\frac{3^7 \\times 2^4}{2^2 \\times 3^5}$ ثم احسب قيمتها.',
    solution: [
      'نجمع قوى الأساس نفسه: $A = \\frac{3^7}{3^5} \\times \\frac{2^4}{2^2}$ .',
      'نطبّق قاعدة حاصل القسمة على كل أساس: $A = 3^{7-5} \\times 2^{4-2} = 3^2 \\times 2^2$ .',
      'نحسب: $A = 9 \\times 4 = 36$ .',
    ],
    rule: 'لتبسيط عبارة تتضمن قوى، نجمع القوى التي لها الأساس نفسه ثم نطبّق قواعد الجداء وحاصل القسمة وقوة القوة على كل أساس.',
    numbers: { value: 36 },
  },
  priority: {
    source: src('know-8', 44, 'معارف'),
    text: 'في سلسلة حسابات تتضمن قوى، نحسب أوّلًا ما بين القوسين، ثم القوى، ثم الضرب والقسمة، ثم الجمع والطرح.',
    example: '$5 - 2 \\times (-3)^2 = 5 - 2 \\times 9 = 5 - 18 = -13$',
    minus: 'انتبه: $-3^2 = -(3^2) = -9$ أمّا $(-3)^2 = 9$ : القوة لا تشمل الإشارة إلا إذا كانت داخل القوسين.',
  },
  // دوري الآن ② p. 45 — réécrit : une fraction dont le numérateur et le dénominateur demandent la priorité des puissances
  chain: { source: src('now-45', 45, 'دوري الآن', 2), tex: '\\frac{(4^2 - 2 \\times 5)^2}{11 - 3^2}', value: 18 },
};

/** « أستعدّ » — أستعدّ p. 39, items 16 et 17, RÉÉCRITS en affirmations (les autres items vont aux leçons des puissances de 10). */
export const PREP_ITEMS = [
  { n: 16, skill: 'jidaa', text: 'جداء خمسة عوامل كلّ منها يساوي 3 هو $15$ .', answer: false, why: 'جداء خمسة عوامل تساوي 3 : $3 \\times 3 \\times 3 \\times 3 \\times 3 = 243$ ؛ أمّا $15 = 3 \\times 5$ فهو مجموع خمسة أعداد تساوي 3 .' },
  { n: 17, skill: 'jidaa', text: '$(-5) \\times (-5) \\times (-5) = -125$ .', answer: true, why: '$(-5) \\times (-5) = 25$ ثم $25 \\times (-5) = -125$ .' },
].map((it) => ({ ...it, source: src('prep', 39, 'أستعدّ', it.n) }));

/**
 * Les items de la PLATEFORME : le réseau dit que la leçon s'appuie sur `3am.m1.r01` (جداء عددين نسبيين), `2am.m1.r01` (سلسلة
 * عمليات) et `3am.m3.r02` (قواعد قوى العدد 10, درس de la même unité, non publié) — « أستعدّ » doit les mesurer (LEARNING_NET.md §4.4).
 */
export const PREP_PLATFORM_ITEMS = [
  { skill: 'jidaa', text: '$(-4) \\times (-6) = -24$ .', answer: false, why: 'جداء عددين سالبين موجب: $(-4) \\times (-6) = 24$ .' },
  { skill: 'silsila', text: '$2 + 3 \\times 4 = 20$ .', answer: false, why: 'الضرب قبل الجمع: $2 + 12 = 14$ .' },
  { skill: 'silsila', text: '$18 - 6 \\div 2 = 15$ .', answer: true, why: 'القسمة قبل الطرح: $18 - 3 = 15$ .' },
  { skill: 'ashara', text: '$10^3 \\times 10^4 = 10^7$ .', answer: true, why: '$10^3 \\times 10^4$ جداء $3 + 4 = 7$ عوامل كلها 10 .' },
  { skill: 'ashara', text: '$\\frac{10^6}{10^2} = 10^3$ .', answer: false, why: 'نحذف عاملين من الستة: $\\frac{10^6}{10^2} = 10^{6-2} = 10^4$ .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les phrases de correction partagées par les modules ET la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  minusTrap: {
    wrong: '$-2^4 = 16$ لأنّ الأس زوجي.',
    why: 'الأس 4 يخصّ العدد 2 وحده: $-2^4 = -(2 \\times 2 \\times 2 \\times 2)$ .',
    right: '$-2^4 = -16$ أمّا $(-2)^4 = 16$ .',
  },
  negExp: {
    wrong: '$3^{-2} = -9$ لأنّ الأس سالب.',
    why: 'الأس السالب لا يجعل القوة سالبة: يعني المقلوب.',
    right: '$3^{-2} = \\frac{1}{3^2} = \\frac{1}{9}$ .',
  },
  product: {
    wrong: '$2^3 \\times 2^4 = 2^{12}$ .',
    why: 'نتابع العوامل ولا نضرب الأسس: 3 عوامل ثم 4 عوامل هي 7 عوامل.',
    right: '$2^3 \\times 2^4 = 2^{3+4} = 2^7$ .',
  },
  parity: 'قوة عدد سالب موجبة إذا كان الأس زوجيًا وسالبة إذا كان فرديًا: $(-2)^4 = 16$ و $(-2)^5 = -32$ .',
  zero: 'قطار بلا عربة يحمل 1 : $(-2)^0 = 1$ .',
};
