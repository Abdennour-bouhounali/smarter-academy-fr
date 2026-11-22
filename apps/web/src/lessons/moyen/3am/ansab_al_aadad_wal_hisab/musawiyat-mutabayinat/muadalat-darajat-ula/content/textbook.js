/**
 * Le contenu du درس « المعادلات من الدرجة الأولى بمجهول واحد » (3AM, unité 5) — données pures. Le manuel est la RÉFÉRENCE (docs/sources/3am/unit5/
 * extraction.json : نشاط 4 p. 73, معارف 4–5 p. 76, طرائق p. 77, أستعدّ p. 71) ; chaque texte montré à l'élève est RÉÉCRIT par la plateforme (guide §4ter-bis :
 * mêmes définitions et notations, autres mots, autres exemples, autres nombres). La `source` de chaque bloc garde la traçabilité (`check:textbook`) ;
 * `SourceTag` est muet pour l'élève.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** LE LABO DE L'ENTRÉE — la عبّارة (`term-ferry`, thème `river`) : expérience de la plateforme, équations du preset `levels.js`. */
export const LAB = {
  source: addition('platform_designed_entry'),
  beginner: { tasks: [{ left: '3x+2', right: 'x+8' }, { left: '4x-3', right: '2x+7' }] },
  advanced: { tasks: [{ left: '9x+1', right: '5x-7' }, { left: '-2x+5', right: '3x-10' }, { left: '7x-190', right: '6x+110' }] },
};

/** « تذكّر » — l'équation « a ÷ … = b » de la 2AM (leçon `hall-mushkil-muadala`, non publiée : pas de lien) : RAPPELÉE, jamais reconstruite. */
export const RECALL = {
  source: addition('prior_year_reminder'),
  title: 'تذكّر — السنة الثانية',
  text: 'في السنة الثانية بحثنا عن العدد المجهول في معادلات بسيطة مثل $12 \\div x = 4$ ( $x = 3$ ) . الآن المجهول يظهر في الطرفين: $3x + 2 = x + 8$ .',
  lesson: 'hall-mushkil-muadala',
};

/** معارف 4–5 (p. 76) — la définition, l'exemple, la solution et sa vérification, réécrits avec les exemples de la plateforme. */
export const KNOWLEDGE = {
  definition: {
    source: src('know-4', 76, 'معارف', 4),
    text: 'المعادلة مساواة فيها عدد مجهول نرمز إليه بحرف، مثل $x$ . ندعو $3x + 2$ الطرف الأيسر و $x + 8$ الطرف الأيمن للمعادلة $3x + 2 = x + 8$ . وكل معادلة من الشكل $ax + b = cx + d$ حيث $a$ و $b$ و $c$ و $d$ أعداد معلومة تسمّى معادلة من الدرجة الأولى بمجهول واحد.',
  },
  solution: {
    source: src('know-4', 76, 'معارف', 4),
    text: 'حلّ معادلة معناه إيجاد قيمة المجهول التي تجعل الطرفين متساويين. مثلًا: $3$ حلّ للمعادلة $3x + 2 = x + 8$ لأنّ الطرفين يساويان $11$ ؛ أمّا $2$ فليس حلًّا لأنّ الطرفين يساويان $8$ و $10$ .',
  },
  check: {
    source: addition('knowledge_formalization'),
    text: 'للتحقق من أنّ عددًا حلّ لمعادلة نعوّضه في الطرفين ونحسب كلًّا منهما: إذا ساوى الطرفان العدد نفسه فهو حلّ.',
  },
  sign: {
    source: addition('knowledge_formalization'),
    text: 'عندما ينتقل حدّ إلى الطرف الآخر تتغيّر إشارته، لأنّنا أضفنا معاكسه إلى الطرفين.',
  },
  divide: {
    source: addition('knowledge_formalization'),
    text: 'عندما يبقى $ax = n$ ($a \\neq 0$) نقسم الطرفين على $a$ فنجد $x = \\frac{n}{a}$ .',
  },
  model: {
    source: src('know-5', 76, 'معارف', 5),
    text: 'لترييض مشكلة وحلّها نمرّ بالمراحل: نختار المجهول ونكتب وحدته؛ نترجم المعطيات بدلالته؛ نكتب معادلة تعبّر عن المشكلة؛ نحلّها؛ نصرّح بالحلّ؛ ونتحقق منه في نص المشكلة.',
    example: 'مثلًا: مع هبة $700$ دج من قطع $50$ دج وقطع $100$ دج ، وعندها $3$ قطع من فئة $100$ دج . عدد قطع $50$ دج هو $x$ : $50x + 300 = 700$ ، وحلّها $8$ .',
  },
};

/** طرائق p. 77 — résolution et mise en équation, RÉÉCRITES avec d'autres nombres. */
export const METHOD = {
  solve: {
    source: src('method-4', 77, 'طرائق'),
    exercise: 'حلّ المعادلة $6x - 5 = 2x + 7$ .',
    solution: [
      'نجمع حدود $x$ في الطرف الأيسر: نضيف $-2x$ إلى الطرفين: $6x - 5 - 2x = 2x + 7 - 2x$ أي $4x - 5 = 7$ .',
      'نجمع الأعداد في الطرف الأيمن: نضيف $5$ إلى الطرفين: $4x - 5 + 5 = 7 + 5$ أي $4x = 12$ .',
      'نقسم الطرفين على $4$ : $x = 3$ .',
      'نتحقق: $6 \\times 3 - 5 = 13$ و $2 \\times 3 + 7 = 13$ ؛ الحلّ هو $3$ .',
    ],
    rule: 'لحلّ معادلة: نجمع حدود $x$ في طرف والأعداد في الطرف الآخر بإضافة المعاكسات إلى الطرفين، ثم نقسم على معامل $x$ ، ثم نتحقق بالتعويض.',
    numbers: { x: 3 },
  },
  model: {
    source: src('method-5', 77, 'طرائق'),
    exercise: 'ثمن القلم $x$ دج. دفع محسن ثمن $3$ أقلام وكرّاسة ثمنها $40$ دج ، ودفعت نور ثمن $5$ أقلام ثم استردّت $20$ دج ، فدفعا المبلغ نفسه. ما ثمن القلم؟',
    solution: [
      'نختار المجهول: ثمن القلم $x$ دينارًا.',
      'نترجم: محسن دفع $3x + 40$ ، ونور دفعت $5x - 20$ .',
      'المعادلة: $3x + 40 = 5x - 20$ .',
      'نحلّ: $3x + 40 - 3x = 5x - 20 - 3x$ أي $40 = 2x - 20$ ثم $60 = 2x$ ثم $x = 30$ .',
      'نصرّح: ثمن القلم $30$ دج. نتحقق: $3 \\times 30 + 40 = 130$ و $5 \\times 30 - 20 = 130$ ، فالمبلغان متساويان.',
    ],
    rule: 'نختار المجهول مع وحدته، نترجم المعطيات، نكتب المعادلة ونحلّها، ثم نصرّح بالحلّ ونتحقق منه في نص المشكلة.',
    numbers: { x: 30 },
  },
};

/** « أستعدّ » — أستعدّ p. 71, items 6 et 10, RÉÉCRITS en affirmations. */
export const PREP_ITEMS = [
  { n: 6, skill: 'qisma', text: 'إذا كان $x \\div 10 = 1$ فإنّ العدد المجهول هو $\\frac{1}{10}$ .', answer: false, why: '$x \\div 10 = 1$ يعني $x = 10 \\times 1 = 10$ .' },
  { n: 10, skill: 'ibara', text: 'قيمة العبارة $8y - 8$ من أجل $y = 1$ هي $0$ .', answer: true, why: '$8 \\times 1 - 8 = 0$ .' },
].map((it) => ({ ...it, source: src('prep', 71, 'أستعدّ', it.n) }));

/**
 * Les items de la PLATEFORME : le réseau dit que la leçon s'appuie sur `2am.m4.r08` (a ÷ … = b, leçon 2AM `hall-mushkil-muadala`), `3am.m5.r01`
 * (تبسيط عبارة جبرية, `tabsit-hadhf-aqwas`) et `3am.m5.r05` (خواص المساويات, `musawiyat-amaliyat`, PUBLIÉE) — « أستعدّ » doit les mesurer
 * (LEARNING_NET.md §4.4).
 */
export const PREP_PLATFORM_ITEMS = [
  { skill: 'qisma', text: 'إذا كان $12 \\div x = 4$ فإنّ العدد المجهول هو $3$ .', answer: true, why: '$12 \\div 3 = 4$ .' },
  { skill: 'qisma', text: 'إذا كان $15 \\div x = 3$ فإنّ العدد المجهول هو $45$ .', answer: false, why: '$15 \\div 5 = 3$ ، فالعدد المجهول $5$ .' },
  { skill: 'ibara', text: '$3x + 2x = 5x$ .', answer: true, why: 'الحدّان متشابهان: $3 + 2 = 5$ .' },
  { skill: 'ibara', text: '$4x - x = 4$ .', answer: false, why: '$4x - x = 3x$ : لا نحذف $x$ .' },
  { skill: 'khassa', text: 'إذا كان $a = b$ فإنّ $a - 5 = b - 5$ .', answer: true, why: 'نطرح العدد نفسه من الطرفين: تبقى المساواة.' },
  { skill: 'khassa', text: 'إذا كان $a = b$ فإنّ $a + 3 = b$ .', answer: false, why: 'نضيف $3$ إلى الطرفين معًا: $a + 3 = b + 3$ .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les phrases de correction partagées par les modules ET la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  signKept: {
    wrong: 'من $x + 3 = 7$ أنقل $3$ فأكتب $x = 7 + 3$ .',
    why: 'نقل حدّ يعني إضافة معاكسه إلى الطرفين، فتتغيّر إشارته.',
    right: '$x + 3 - 3 = 7 - 3$ أي $x = 4$ .',
  },
  divPart: {
    wrong: 'من $2x + 6 = 10$ أقسم على $2$ فأكتب $x + 6 = 5$ .',
    why: 'القسمة على $2$ تشمل كل حدود الطرف، ومنها $6$ ؛ ويحسن أن ننقل $6$ أوّلًا.',
    right: '$2x = 4$ ثم $x = 2$ .',
  },
  negCoef: {
    wrong: 'من $-3x = 12$ أجد $x = 4$ .',
    why: 'القسمة على عدد سالب تعطي ناتجًا بإشارة معاكسة: $12 \\div (-3) = -4$ .',
    right: '$x = -4$ .',
  },
  noCheck: {
    wrong: 'وجدتُ $x = 5$ فانتهيتُ.',
    why: 'قد يقع خطأ في الحساب: نعوّض الحلّ في الطرفين لنتأكّد.',
    right: 'نعوّض: نحسب الطرفين عند $x = 5$ ونقارن بينهما.',
  },
  unit: {
    wrong: 'أسمّي $x$ « العدد ».',
    why: 'نختار المجهول مع وحدته (ثمن القلم بالدينار، عدد التلاميذ)، فنفهم ما نحسب.',
    right: 'أسمّي $x$ ثمن الكتاب بالدينار.',
  },
  moved: 'عبر الصندوق بإشارة معاكسة: أضفنا معاكسه إلى الطرفين، فبقيت المعادلة بالحلّ نفسه.',
};
