/**
 * Le contenu de la leçon 3 « المتراجحات من الدرجة الأولى بمجهول واحد وتمثيل حلولها بيانيًا » — données pures (aucun JSX). Le manuel fixe les
 * الكفاءات (chaque bloc cite son élément de docs/sources/4am/unit4/extraction.json) ; depuis le rollout du 2026-11-11 (conseil, verdict X1) les
 * NOMBRES et les mots sont ceux de la plateforme (`part: 'بأعداد المنصّة'`) : aucun écran n'envoie l'élève au livre, aucun énoncé n'est recopié.
 *
 * Les crochets « [ » / « ] » sont écrits en îlots mathématiques ($[$, $]$) : dans une phrase arabe, un crochet nu est MIROIRÉ par l'algorithme
 * bidi et se lirait à l'envers — exactement l'information que la leçon enseigne.
 */
import { src, addition } from '../../_unit/unitMeta.js';

const PART = 'بأعداد المنصّة';
/** La source d'un élément du manuel dont la plateforme a réécrit les nombres. */
const srcP = (elementId, page, section, number) => ({ ...src(elementId, page, section, number), part: PART });

/** Activité, première partie — « المتراجحة وحلولها » : le budget de هدى (6 دج le stylo, 20 دج la boîte, 80 دج). */
export const ACTIVITY = {
  source: srcP('act-3a', 45, 'أنشطة', 3),
  title: 'المتراجحات من الدرجة الأولى بمجهول واحد',
  text: 'تملك هدى 80 دج لشراء أقلام كاملة: علبة بـ 20 دج، ثم 6 دج للقلم الواحد. تريد ألّا تتجاوز الكلفة المبلغ الذي معها.',
  questions: [
    '1) هل تستطيع هدى شراء: أ) 11 قلمًا؟ ب) 10 أقلام؟ جـ) 6 أقلام؟',
    '2) نرمز إلى عدد الأقلام بالرمز $x$ . أ) من بين المتباينات الآتية، حدّد تلك التي توافق رغبة هدى : $80x + 20 \\leq 6$ ، $6x + 80 \\leq 20$ ، $6x + 20 \\leq 80$ .',
    'ب) اقترح قيمة لـ $x$ توافق رغبة هدى، وقيمة أخرى لا توافقها.',
    'جـ) هل العدد 2 حل للمتراجحة $6x + 20 \\leq 80$ ؟ السؤال نفسه من أجل العدد 11.',
  ],
  box: [
    'كل متباينة من المتباينات الثلاث السّابقة تُسمّى متراجحة ذات المجهول $x$ .',
    'كل قيمة لـ $x$ تجعل المتراجحة متباينة صحيحة، تُسمّى حلاً لهذه المتراجحة.',
  ],
  closing: 'كل قيمة لـ $x$ تجعل المتراجحة متباينة صحيحة، تُسمّى حلاً لهذه المتراجحة.',
  // les calculs sont faits par le laboratoire et les modules
  numbers: { perMessage: '6', fixed: 20, credit: 80, asked: [11, 10, 6], candidates: ['80x+20<=6', '6x+80<=20', '6x+20<=80'], tests: [2, 11] },
  ineq: '6x+20<=80',
};

/** Activité, seconde partie — « حل متراجحة » : −2x + 7 ≤ 9 et le tableau (x < 4, x ≤ 4, puis x ≥ −6 à compléter). */
export const ACTIVITY_B = {
  source: srcP('act-3b', 45, 'أنشطة', 3),
  title: 'حل متراجحة وتمثيل حلولها على مستقيم مدرّج',
  text: 'حل متراجحة : نريد فيما يأتي حل المتراجحة $-2x + 7 \\leq 9$ وتمثيل حلولها على مستقيم مدرّج.',
  questions: [
    '1) أتمم مبرّرًا كل خطوة: $-2x + 7 \\leq 9$ ← الخطوة 1 $(-\\ldots)$ ← $-2x \\ldots 2$ ← الخطوة 2 $(\\div \\ldots)$ ← $x \\ldots -1$',
    '2) اعتمادًا على السطرين الأول والثاني من الجدول الآتي، أتمم السطر الأخير.',
  ],
  table: [
    { inequality: '$x < 4$', words: 'كل قيم $x$ الأصغر من 4', graph: 'الجزء الملوّن على يسار 4، والرمز $[$ عند 4', figure: { from: 0, to: 8, at: 4, side: 'left', closed: false } },
    { inequality: '$x \\leq 4$', words: 'كل قيم $x$ الأصغر من أو تساوي 4', graph: 'الجزء الملوّن على يسار 4، والرمز $]$ عند 4', figure: { from: 0, to: 8, at: 4, side: 'left', closed: true } },
  ],
  lastRow: '$x \\geq -6$',
  ineq: '-2x+7<=9',
  words: 'كل قيم $x$ الأكبر من أو تساوي $-6$',
  steps: ['نطرح 7 من الطرفين: $-2x \\leq 2$', 'نقسم الطرفين على $-2$ (عدد سالب، نغيّر الاتجاه): $x \\geq -1$'],
};

/** معارف 3 — « المتراجحات من الدرجة الأولى بمجهول واحد » (أمثلة المنصّة). */
export const KNOWLEDGE_3 = {
  source: srcP('know-3', 48, 'معارف', 3),
  title: 'المتراجحات من الدرجة الأولى بمجهول واحد',
  definition: [
    'المتراجحة بمجهول $x$ هي متباينة قد تكون صحيحة وقد تكون خاطئة وهذا حسب قيم $x$ .',
    'قيم $x$ التي من أجلها تكون المتباينة صحيحة هي حلول المتراجحة.',
    'حل متراجحة هو إيجاد كل حلولها.',
  ],
  firstDegree: 'يُقال عن متراجحة أنّها من الدرجة الأولى لمجهول $x$ ، إذا أمكن كتابتها على أحد الأشكال الآتية : $ax + b < cx + d$ أو $ax + b > cx + d$ ، $ax + b \\leq cx + d$ أو $ax + b \\geq cx + d$ .',
  rulesIntro: 'لحل متراجحة من الدرجة الأولى بمجهول واحد، نستعمل القواعد الآتية:',
  rules: [
    'نُحافظ على اتجاه المتراجحة عندما نُضيف إلى (أو نطرح من) طرفيها نفس العدد.',
    'نُحافظ على نفس اتجاه المتراجحة عندما نضرب طرفيها في (أو نقسم طرفيها على) نفس العدد الموجب تماما.',
    'نُغيّر اتجاه المتراجحة عندما نضرب طرفيها في (أو نقسم طرفيها على) العدد السالب تماما نفسه.',
  ],
  example1: 'مثال 1: المتباينة $5x > -4$ هي متراجحة ذات المجهول $x$ . من أجل $x = -1$ نكتب $5 \\times (-1) > -4$ فنحصل على متباينة خاطئة $-5 > -4$ إذن العدد $(-1)$ ليس حلا للمتراجحة $5x > -4$ .',
  example2a: 'مثال 2: 1) حل المتراجحة $7x - 4 \\leq 2x + 6$ . نطرح $2x$ من الطرفين فنحصل على $5x - 4 \\leq 6$ . نضيف 4 للطرفين، نحصل على $5x \\leq 10$ . نقسم على 5 إذن $x \\leq 2$ (لاحظ أنّ اتجاه المتراجحة لم يتغيّر). حلول المتراجحة $7x - 4 \\leq 2x + 6$ هي كل الأعداد $x$ الأصغر من أو تساوي 2 .',
  example2b: '2) حل المتراجحة $-4x + 6 > 34$ . نطرح 6 من الطرفين، فنحصل على $-4x > 28$ . نقسم الطرفين على العدد السالب $-4$ ، نحصل على $x < -7$ (لاحظ أنّ اتجاه المتراجحة قد تغيّر). حلول المتراجحة $-4x + 6 > 34$ هي كل الأعداد $x$ الأصغر من $-7$ .',
};

/** معارف 4 — « التمثيل البياني لحلول متراجحة » (أمثلة المنصّة). */
export const KNOWLEDGE_4 = {
  source: srcP('know-4', 48, 'معارف', 4),
  title: 'التمثيل البياني لحلول متراجحة',
  definition: 'تُمثل حلول متراجحة على مستقيم عددي مُدرّج.',
  example1: 'مثال 1: حل المتراجحة $4x \\leq 6$ . نضرب الطرفين في العدد $\\dfrac{1}{4}$ ، نجد $x \\leq \\dfrac{3}{2}$ . حلول المتراجحة هي كل الأعداد $x$ الأصغر من أو تساوي $\\dfrac{3}{2}$ . تُمثل حلول المتراجحة على المستقيم المُدرّج بالجزء المُلوّن بالأحمر.',
  note1: 'ملاحظة: الرمز $]$ موجه نحو الجزء الملوّن بالأحمر للتعبير عن أن العدد $\\dfrac{3}{2}$ هو أيضا حل للمتراجحة المعطاة.',
  figure1: { from: 0, to: 3, at: 1.5, boundTex: '\\dfrac{3}{2}', side: 'left', closed: true },
  example2: 'مثال 2: حل المتراجحة $-\\dfrac{1}{4}x + 1 < -1$ . نطرح العدد 1 من الطرفين، نجد $-\\dfrac{1}{4}x < -2$ . نضرب الطرفين في العدد $(-4)$ ، نجد $x > 8$ (لاحظ أنّ اتجاه المتراجحة قد تغيّر). حلول المتراجحة هي كل الأعداد $x$ الأكبر من 8. تمثل حلول المتراجحة على المستقيم المُدرّج بالجزء الملون بالأحمر.',
  note2: 'ملاحظة: الرمز $]$ غير موجه في إتجاه الجزء الملون وذلك للتعبير على أن العدد 8 ليس حل للمتراجحة المعطاة.',
  figure2: { from: 6, to: 10, at: 8, side: 'right', closed: false },
};

/** طرائق — « حل متراجحة من الدرجة الأولى بمجهول واحد » (أمثلة المنصّة). */
export const METHOD = {
  source: srcP('method-inequality', 49, 'طرائق'),
  title: 'حل متراجحة من الدرجة الأولى بمجهول واحد',
  exercise: 'حل كل متراجحة مما يلي ثم مثّل بيانيا حلولها. أ) $-5x + 2 < x - 10$ ؛ ب) $\\dfrac{x + 2}{4} \\geq \\dfrac{x - 1}{2}$ .',
  solutionA: [
    'أ) نطرح العدد 2 من طرفي المتراجحة $-5x + 2 < x - 10$ فنحصل على $-5x < x - 12$ .',
    'نطرح العدد $x$ من طرفي المتراجحة الأخيرة، فنحصل على $-6x < -12$ .',
    'نقسم طرفي المتراجحة $-6x < -12$ على العدد $-6$ ، فنحصل على $x > 2$ (اتجاه المتراجحة تغيّر).',
    'ينتج أن حلول المتراجحة $-5x + 2 < x - 10$ هي كل الأعداد $x$ الأكبر من 2 . الجزء الملوّن بالأحمر هو التمثيل البياني لحلولها.',
  ],
  figureA: { from: 0, to: 4, at: 2, side: 'right', closed: false },
  solutionB: [
    'ب) نضرب طرفي المتراجحة في العدد 4 (مقام النسبة الأولى). فنحصل على المتراجحة $x + 2 \\geq 2x - 2$ .',
    'نطرح $2x$ ثم 2 من الطرفين، فنحصل على المتراجحة $-x \\geq -4$ ، وبضرب الطرفين في العدد $-1$ نحصل على $x \\leq 4$ (اتجاه المتراجحة تغيّر).',
    'ينتج أن حلول المتراجحة $\\dfrac{x + 2}{4} \\geq \\dfrac{x - 1}{2}$ هي كل الأعداد $x$ الأصغر من أو تساوي 4 . الجزء الملوّن بالأحمر هو التمثيل البياني لحلولها.',
  ],
  figureB: { from: 2, to: 6, at: 4, side: 'left', closed: true },
  // La règle que les deux solutions appliquent — reformulée par la plateforme.
  rule: 'لحل متراجحة من الدرجة الأولى: ننقل حدود $x$ إلى طرف والأعداد إلى الطرف الآخر بإضافة أو طرح نفس العدد (الاتجاه لا يتغيّر)، ثم نقسم على معامل $x$ (نغيّر الاتجاه إذا كان سالبًا)، ونلوّن الحلول بالأحمر على المستقيم المدرّج. ونختبر عددًا من الحلول المقترحة.',
  ruleSource: addition('interaction_generation'),
};

/**
 * « أؤكّد تعلّماتي » — items 5 à 9, RÉÉCRITS par la plateforme (conseil du 2026-11-11, verdict X1) : mêmes `id`, mêmes compétences, mêmes structures
 * (5 et 7 : DEUX options justes, posées en lignes « يحقّق / لا يحقّق » au module 5 ; 6, 8, 9 : l'إختبار أولي, 6 et 9 des droites graduées DESSINÉES).
 */
const QCM_SRC = (n) => srcP('qcm', 52, 'أؤكّد تعلّماتي', n);
export const QCM = {
  5: { n: 5, source: QCM_SRC(5), text: 'إذا كان $x \\geq 2$ فإن ...', options: ['$3x \\geq 6$', '$x + 4 \\geq 6$', '$-x \\geq -2$'], correctSet: [0, 1],
    rowCorrections: [
      'نضرب طرفي $x \\geq 2$ في 3 (عدد موجب): $3x \\geq 6$ — صحيحة.',
      'نضيف 4 إلى الطرفين: $x + 4 \\geq 6$ — صحيحة.',
      'من أجل $x = 5$ : $5 \\geq 2$ لكنّ $-5 \\geq -2$ خاطئة — الضرب في $-1$ يغيّر الاتجاه، فالصحيح $-x \\leq -2$ .',
    ] },
  6: { n: 6, source: QCM_SRC(6), text: 'التمثيل على مستقيم مدرّج للأعداد $x$ حيث $x \\geq -5$ هو ...',
    options: ['الجزء الملوّن على يسار $-5$ والرمز $]$ عند $-5$', 'الجزء الملوّن على يمين $-5$ والرمز $[$ عند $-5$', 'الجزء الملوّن على يمين $-5$ والرمز $]$ عند $-5$'],
    figures: [
      { from: -8, to: -2, at: -5, side: 'left', closed: true },
      { from: -8, to: -2, at: -5, side: 'right', closed: true },
      { from: -8, to: -2, at: -5, side: 'right', closed: false },
    ],
    correct: 1,
    explain: '$x \\geq -5$ : الحلول هي الأعداد الأكبر من $-5$ أو تساويه، أي على يمينه، و $-5$ حلّ ($-5 \\geq -5$ صحيحة) فالرمز موجّه نحو الجزء الملوّن.' },
  7: { n: 7, source: QCM_SRC(7), text: '$-2$ هو حل للمتراجحة ...', options: ['$3x < -4$', '$x + 1 > 0$', '$-2x > 3$'], correctSet: [0, 2],
    rowCorrections: [
      '$3 \\times (-2) = -6$ و $-6 < -4$ صحيحة: $-2$ حلّ لها.',
      '$-2 + 1 = -1$ و $-1 > 0$ خاطئة: $-2$ لا يحقّقها.',
      '$-2 \\times (-2) = 4$ و $4 > 3$ صحيحة: $-2$ حلّ لها.',
    ] },
  8: { n: 8, source: QCM_SRC(8), text: 'حلول المتراجحة $-\\dfrac{1}{5}x < 2$ هي الأعداد $x$ حيث ...', options: ['$x < -10$', '$x > -10$', '$x > 10$'], correct: 1,
    explain: 'نضرب الطرفين في $-5$ (عدد سالب) فنغيّر الاتجاه: $x > -10$ ، والعدد $-10$ هو الحدّ وليس حلًّا.' },
  9: { n: 9, source: QCM_SRC(9), text: 'التمثيل البياني لحلول المتراجحة $x - 2 < -4$ هو ...',
    options: ['الجزء الملوّن على يسار $-2$ والرمز $[$ عند $-2$', 'الجزء الملوّن على يسار $-2$ والرمز $]$ عند $-2$', 'الجزء الملوّن على يمين $-2$ والرمز $]$ عند $-2$'],
    figures: [
      { from: -5, to: 1, at: -2, side: 'left', closed: false },
      { from: -5, to: 1, at: -2, side: 'left', closed: true },
      { from: -5, to: 1, at: -2, side: 'right', closed: false },
    ],
    correct: 0,
    explain: 'نضيف 2 إلى الطرفين: $x < -2$ ؛ الحلول على يسار $-2$ ، و $-2$ ليس حلًّا فالرمز غير موجّه نحو الجزء الملوّن.' },
};

/**
 * « أستعدّ » — items 6 à 11 du manuel (p. 43 ; le même « أستعدّ » sert les trois leçons),
 * puis des affirmations de la PLATEFORME, dans la même forme, pour les acquis que le
 * manuel n'y diagnostique pas : le repérage sur un مستقيم مدرّج (années précédentes) et
 * la résolution d'une معادلة (leçon 1). Aucune n'utilise les nombres des activités
 * (2,5x + 100 ≤ 150, −3x + 5 ≤ 20).
 */
export const PREP_ITEMS = [
  { n: 6, skill: 'ikhtibar', text: 'إذا كان $x$ عددا حيث $25x < 0$ فإنّ $x$ يُمكن أن يُساوي 0.', answer: false, why: '$25 \\times 0 = 0$ و $0 < 0$ خاطئة', source: src('prep', 43, 'أستعدّ', 6) },
  { n: 7, skill: 'ikhtibar', text: 'إذا كان $x$ عددا حيث $2x - 1 \\leq 6$ فإنّ $x$ يُمكن أن يُساوي $\\dfrac{7}{2}$ .', answer: true, why: '$2 \\times \\dfrac{7}{2} - 1 = 6$ و $6 \\leq 6$ صحيحة', source: src('prep', 43, 'أستعدّ', 7) },
  { n: 8, skill: 'amaliyat', text: 'نطرح العدد 2 من طرفي المتباينة $4x + 2 < -1$ فنحصل على : $4x > -3$ .', answer: false, why: 'طرح عدد يحافظ على اتجاه المتباينة: $4x < -3$', source: src('prep', 43, 'أستعدّ', 8) },
  { n: 9, skill: 'amaliyat', text: 'نقسم طرفي المتباينة $5x < -1$ على العدد 5 فنحصل على: $x < \\dfrac{1}{5}$ .', answer: false, why: '$x < -\\dfrac{1}{5}$', source: src('prep', 43, 'أستعدّ', 9) },
  { n: 10, skill: 'amaliyat', text: 'نقسم طرفي المتباينة $-2x \\geq -1$ على العدد (-2) فنحصل على: $x \\geq \\dfrac{1}{2}$ .', answer: false, why: 'القسمة على عدد سالب تغيّر الاتجاه: $x \\leq \\dfrac{1}{2}$', source: src('prep', 43, 'أستعدّ', 10) },
  { n: 11, skill: 'amaliyat', text: 'إذا كان $x \\leq 3$ فإن $-3x \\geq -6$ .', answer: false, why: 'من أجل $x = 3$ : $-3x = -9$ و $-9 \\geq -6$ خاطئة ؛ الصحيح $-3x \\geq -9$', source: src('prep', 43, 'أستعدّ', 11) },
  { skill: 'mustaqim', text: 'على مستقيم مدرّج، يقع العدد $-4$ على يمين العدد $-1$ .', answer: false, why: '$-4 < -1$ : الأصغر يقع على اليسار، فالعدد $-4$ على يسار $-1$.', source: addition('prerequisite_diagnostic') },
  { skill: 'mustaqim', text: 'العدد $\\dfrac{5}{2}$ محصور بين العددين 2 و 3.', answer: true, why: '$\\dfrac{5}{2} = 2{,}5$ و $2 < 2{,}5 < 3$', source: addition('prerequisite_diagnostic') },
  { skill: 'muadala', text: 'حل المعادلة $3x - 4 = 11$ هو 5.', answer: true, why: '$3 \\times 5 - 4 = 15 - 4 = 11$', source: addition('prerequisite_diagnostic') },
  { skill: 'muadala', text: 'حل المعادلة $-2x = 8$ هو 4.', answer: false, why: '$-2 \\times 4 = -8 \\neq 8$ ؛ الحل هو $x = -4$', source: addition('prerequisite_diagnostic') },
];
