/**
 * Le contenu du درس « مقلوب عدد وقسمة كسرين » (3AM, unité 2) — données pures. Le manuel est la RÉFÉRENCE (docs/sources/3am/unit2/extraction.json : نشاط 1 p. 24,
 * معارف 1 et 2 p. 26, أستعدّ p. 23) ; chaque texte montré à l'élève est RÉÉCRIT par la plateforme (guide §4ter-bis : mêmes définitions et notations, autres
 * mots, autres exemples, autres nombres). La `source` de chaque bloc garde la traçabilité (`check:textbook`) ; `SourceTag` est muet pour l'élève.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** LE LABO DE L'ENTRÉE — la دوّاسة (`gear-crank`, thème `bikestand`) : expérience de la plateforme, tâches du preset `levels.js`. */
export const LAB = {
  source: addition('platform_designed_entry'),
  beginner: {},
  advanced: {},
  /** Le monde `reverse` de معارف : la chaîne déplacée, UNE دورة de la roue (3/5 puis 5/3 دورة de pédale). */
  reverse: { world: 'reverse', tasks: [{ id: 'r1', F: 40, R: 24, target: '1' }, { id: 'r2', F: 24, R: 40, target: '1' }] },
};

/** « تذكّر — السنة الثانية » : جداء كسرين (leçon 2AM `jida-kasrayn`, PUBLIÉE 2026-10-29 : avec un lien). RAPPELÉ, jamais reconstruit. */
export const RECALL = {
  source: addition('prior_year_reminder'),
  title: 'تذكّر — السنة الثانية',
  text: 'في السنة الثانية عرفنا ضرب كسرين: نضرب البسطين ونضرب المقامين، فـ $\\frac{2}{3} \\times \\frac{4}{5} = \\frac{8}{15}$ . وفي هذا الدرس نستعمل هذا الضرب دائمًا ولا نعيد بناءه.',
  lesson: 'jida-kasrayn',
};

/** « تذكّر — قوى عدد نسبي » : $a^{-1} = \frac{1}{a}$ (leçon 3AM `quwat-adad-nisbi`, PUBLIÉE : lien). */
export const RECALL_POW = {
  source: addition('prior_year_reminder'),
  title: 'تذكّر — قوى عدد نسبي',
  text: 'في درس «قوة عدد نسبي» كتبنا $a^{-1} = \\frac{1}{a}$ . ما نسمّيه هنا مقلوبًا هو العدد نفسه: $\\left(\\frac{7}{5}\\right)^{-1} = \\frac{5}{7}$ .',
  lesson: 'quwat-adad-nisbi',
};

/** معارف 1 et 2 (p. 26) — réécrits, avec les exemples de la plateforme. */
export const KNOWLEDGE = {
  definition: {
    source: src('know-1', 26, 'معارف', 1),
    text: 'مقلوب عدد غير معدوم $x$ هو العدد الذي جداؤه مع $x$ يساوي $1$ . مقلوب العدد $a$ هو $\\frac{1}{a}$ ، ومقلوب الكسر $\\frac{a}{b}$ هو الكسر $\\frac{b}{a}$ . مثلًا مقلوب $8$ هو $\\frac{1}{8}$ ، ومقلوب $\\frac{7}{5}$ هو $\\frac{5}{7}$ ، ومقلوب $0{,}4$ هو $\\frac{1}{0{,}4} = \\frac{10}{4} = \\frac{5}{2}$ .',
  },
  zero: {
    source: addition('knowledge_formalization'),
    text: 'العدد $0$ ليس له مقلوب: كلّ عدد مضروب في $0$ يعطي $0$ ولا يعطي $1$ أبدًا. وكلّ عدد غير معدوم له مقلوب.',
  },
  notation: {
    source: src('know-1', 26, 'معارف', 1),
    text: 'نكتب أيضًا $\\left(\\frac{7}{5}\\right)^{-1} = \\frac{5}{7}$ .',
  },
  property: {
    source: src('know-2', 26, 'معارف', 2),
    text: 'القسمة على عدد غير معدوم هي الضرب في مقلوبه: $a \\div b = a \\times \\frac{1}{b}$ ، و $\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\times \\frac{d}{c}$ حيث $b$ و $c$ و $d$ غير معدومة.',
  },
  examples: {
    source: src('know-2', 26, 'معارف', 2),
    text: '$9 \\div 0{,}75 = 9 \\times \\frac{4}{3} = 12$ ؛ $\\frac{5}{4} \\div 10 = \\frac{5}{4} \\times \\frac{1}{10} = \\frac{1}{8}$ ؛ $\\frac{8}{9} \\div \\frac{2}{3} = \\frac{8}{9} \\times \\frac{3}{2} = \\frac{4}{3}$ .',
  },
};

/** « طريقة » (declared `addition('knowledge_formalization')`: le manuel n'en a pas pour la division) — les enchaînements du module 3. */
export const METHOD = {
  simplify: {
    source: addition('knowledge_formalization'),
    exercise: 'احسب $\\frac{14}{15} \\div \\frac{21}{10}$ واكتب الناتج على أبسط شكل.',
    solution: [
      'نكتب القسمة ضربًا في مقلوب الكسر الثاني: $\\frac{14}{15} \\times \\frac{10}{21}$ .',
      'ننشر الأعداد إلى عواملها قبل أن نضرب: $\\frac{2 \\times 7 \\times 2 \\times 5}{3 \\times 5 \\times 3 \\times 7}$ .',
      'نحذف $7$ من الأعلى والأسفل ونحذف $5$ منهما: $\\frac{2 \\times 2}{3 \\times 3} = \\frac{4}{9}$ .',
    ],
    rule: 'لقسمة كسر على كسر: نضرب الأول في مقلوب الثاني، ونختزل قبل أن نضرب.',
  },
  compound: {
    source: addition('knowledge_formalization'),
    exercise: 'احسب الكسر المركّب $\\dfrac{\\frac{3}{4}}{\\frac{9}{8}}$ .',
    solution: [
      'خطّ الكسر الكبير يعني قسمة: $\\frac{3}{4} \\div \\frac{9}{8}$ .',
      'نضرب في المقلوب: $\\frac{3}{4} \\times \\frac{8}{9} = \\frac{2}{3}$ بعد اختزال $3$ و $4$ .',
    ],
    rule: 'الكسر المركّب هو قسمة: نكتبه $a \\div b$ ثم نضرب في المقلوب.',
  },
  natural: {
    source: addition('knowledge_formalization'),
    exercise: 'اكتب على أبسط شكل: $\\dfrac{\\frac{5}{6}}{10}$ ثم $12 \\div \\frac{3}{4}$ .',
    solution: [
      'القسمة على العدد $10$ هي الضرب في $\\frac{1}{10}$ : $\\frac{5}{6} \\times \\frac{1}{10} = \\frac{5}{60} = \\frac{1}{12}$ .',
      'والقسمة على $\\frac{3}{4}$ ضرب في $\\frac{4}{3}$ : $12 \\times \\frac{4}{3} = 16$ ، فنختزل $12$ مع $3$ قبل الضرب.',
    ],
    rule: 'نقسم على عدد طبيعي بضرب في $\\frac{1}{\\text{العدد}}$ ، ونقسم عددًا على كسر بضربه في مقلوب الكسر.',
  },
};

/** « أستعدّ » — أستعدّ p. 23, item 2, RÉÉCRIT en affirmation (item 1, le مقلوب de 0,8, est la leçon même : il passe au registre du test). */
export const PREP_ITEMS = [
  { n: 2, skill: 'darb', text: '$\\frac{5}{6} \\times \\frac{9}{10} = \\frac{3}{4}$ .', answer: true, why: '$\\frac{5 \\times 9}{6 \\times 10} = \\frac{45}{60} = \\frac{3}{4}$ .' },
].map((it) => ({ ...it, source: src('prep', 23, 'أستعدّ', it.n) }));

/**
 * Les items de la PLATEFORME : le réseau dit que la leçon s'appuie sur `2am.m1.r07` (ضرب كسرين) et `3am.m1.r02` (حساب حاصل قسمة عددين نسبيين) —
 * « أستعدّ » doit les mesurer (LEARNING_NET.md §4.4).
 */
export const PREP_PLATFORM_ITEMS = [
  { skill: 'darb', text: '$\\frac{3}{5} \\times \\frac{10}{9} = \\frac{2}{3}$ .', answer: true, why: '$\\frac{3 \\times 10}{5 \\times 9} = \\frac{30}{45} = \\frac{2}{3}$ .' },
  { skill: 'darb', text: '$\\frac{4}{7} \\times 3 = \\frac{12}{21}$ .', answer: false, why: 'العدد $3$ يضرب البسط وحده: $\\frac{4}{7} \\times 3 = \\frac{12}{7}$ .' },
  { skill: 'qisma', text: '$35 \\div 7 = 5$ لأنّ $7 \\times 5 = 35$ .', answer: true, why: 'حاصل القسمة هو العدد الذي إذا ضُرب في المقسوم عليه أعطى المقسوم.' },
  { skill: 'qisma', text: '$(-24) \\div 6 = -4$ .', answer: true, why: '$6 \\times (-4) = -24$ .' },
  { skill: 'qisma', text: '$(-18) \\div (-3) = -6$ .', answer: false, why: '$(-3) \\times 6 = -18$ ، فالحاصل $6$ موجب لا $-6$ .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les phrases de correction partagées par les modules ET la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  noflip: {
    wrong: 'لقسمة $\\frac{5}{6}$ على $\\frac{10}{9}$ أضرب الكسرين كما هما: $\\frac{5 \\times 10}{6 \\times 9} = \\frac{25}{27}$ .',
    why: 'هذا جداء الكسرين لا حاصل قسمتهما: القسمة على عدد هي الضرب في مقلوبه.',
    right: '$\\frac{5}{6} \\times \\frac{9}{10} = \\frac{3}{4}$ .',
  },
  flipFirst: {
    wrong: '$\\frac{2}{9} \\div \\frac{3}{4} = \\frac{9}{2} \\times \\frac{3}{4}$ .',
    why: 'نقلب الكسر الذي نقسم عليه وحده، لا المقسوم.',
    right: '$\\frac{2}{9} \\times \\frac{4}{3} = \\frac{8}{27}$ .',
  },
  approx: {
    wrong: '$0{,}33$ هو مقلوب $3$ .',
    why: '$0{,}33 \\times 3 = 0{,}99$ لا $1$ : مقلوب $3$ هو $\\frac{1}{3}$ ، و $0{,}33$ قيمة مقرّبة له فقط.',
    right: '$3 \\times \\frac{1}{3} = 1$ .',
  },
  pedal: 'كلّ دورة للدوّاسة تُدير العجلة $\\frac{F}{R}$ دورة ، فعدد دورات الدوّاسة للعجلة الواحدة هو مقلوب ذلك.',
  one: 'دوّاسة بـ $24$ سنًّا وترس بـ $32$ سنًّا: دورة واحدة للدوّاسة تُدير العجلة $\\frac{3}{4}$ دورة، ودورة واحدة للعجلة تحتاج $\\frac{4}{3}$ دورة للدوّاسة، و $\\frac{3}{4} \\times \\frac{4}{3} = 1$ .',
};
