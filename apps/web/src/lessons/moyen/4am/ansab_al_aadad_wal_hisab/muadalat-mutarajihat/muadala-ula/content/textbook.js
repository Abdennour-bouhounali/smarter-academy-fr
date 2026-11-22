/**
 * Le contenu de la leçon 1 « حل معادلة من الدرجة الأولى بمجهول واحد » — données pures (aucun JSX). Depuis le rollout mission (2026-11-11, verdict X1/X2
 * du conseil du 2026-11-11) la plateforme écrit TOUT avec ses propres nombres et ses propres mots : le programme de calcul, l'aparté sur الخوارزمي,
 * la propriété, l'exemple, les deux solutions de la méthode. Chaque bloc garde `source: src(<id>)` (la traçabilité de `check:textbook`) et
 * `part: 'بأعداد المنصّة'` (précédent de l'unité 3) ; aucun texte du manuel n'est montré à l'élève. Les modules rendent ces données.
 */
import { src, addition } from '../../_unit/unitMeta.js';

const REWRITE = 'بأعداد المنصّة';
const PART = { part: REWRITE };

/** Le programme de calcul (de la plateforme) : (2x + 5) × 2 − 7 = 4x + 3. */
export const ACTIVITY = {
  source: { ...src('act-1', 44, 'أنشطة', 1), ...PART },
  title: 'من أين تأتي المعادلة؟',
  text: 'إليك برنامج الحساب التالي :',
  program: ['اختر عددًا.', 'اضربه في 2 ثمّ أضف 5.', 'اضرب الناتج في 2.', 'اطرح 7.', 'أعلن النتيجة.'],
  // Les nombres de la plateforme (les calculs sont faits dans le module et vérifiés dans content/mission.test.js).
  numbers: { start: 8, end: 35, khadija: -9, khadijaChoice: -3, naseem: '6x' },
};

/**
 * L'ACCROCHE — une expérience de la PLATEFORME : la balance du vestiaire de l'équipe. La balance est le geste même de la leçon (« المقابلة »).
 * Déclarée, jamais cachée.
 */
export const HOOK = {
  source: addition('interaction_generation'),
  headline: 'ميزان غرفة الملابس!',
  text: 'في غرفة ملابس الفريق، التي يحافظ لاعبوه على نظافتها وترتيبها، ميزان بكفّتين، وأكياس مغلقة في كل منها العدد نفسه من الكرات. لا نستطيع فتح الكيس… لكن الميزان لا يكذب: ما الذي يمكن أن نفعله بالكفّتين ليبقى متوازنًا، حتى نعرف ما في كيس واحد؟',
};

/** الخوارزمي — l'aparté, dit avec les mots de la plateforme. */
export const HISTORY = {
  source: { ...src('history-khwarizmi', 43, 'الخوارزمي'), ...PART },
  caption: 'الخوارزمي',
  text: 'محمد بن موسى الخوارزمي عالم رياضيات وفلك عاش في بغداد قبل نحو اثني عشر قرنًا. سمّى هذا العلم «الجبر» في كتابه «الجبر والمقابلة».',
};
/** Une ligne de la plateforme sur le mot « المقابلة ». */
export const HISTORY_NOTE = {
  source: addition('interaction_generation'),
  text: 'في «المقابلة» يُحذف من طرفي المعادلة ما هو مشترك بينهما، فيبقى الطرفان متقابلين متساويين: هو ما فعلته بالميزان.',
};

/**
 * Ce que la balance du module 1 vient de faire, posé en brique (muadala-tarafayn). L'exemple de la carte des معارف n'est PAS une manche
 * (la carte est ouverte dès le début) : $2x + 9 = 1$.
 */
export const BALANCE_LINES = {
  source: addition('interaction_generation'),
  rule: 'نحصل على معادلة لها الحل نفسه إذا أجرينا العملية نفسها على طرفيها: نضيف العدد نفسه إلى الطرفين أو نطرحه منهما، أو نقسم الطرفين على العدد نفسه غير المعدوم.',
  example: '$2x + 9 = 1$ ، نطرح 9 من كل طرف: $2x = -8$ ، نقسم كل طرف على 2: $x = -4$ .',
  verify: 'نتحقّق بالتعويض: $2 \\times (-4) + 9 = -8 + 9 = 1$.',
};

/** المعادلة من الدرجة الأولى بمجهول واحد — la propriété et l'exemple travaillé (sur la balance de la manche 2 du module 2). */
export const KNOWLEDGE = {
  source: { ...src('know-1', 46, 'معارف', 1), ...PART },
  title: 'المعادلة من الدرجة الأولى بمجهول واحد',
  property: 'كل معادلة من الدرجة الأولى بمجهول واحد تؤول إلى معادلة من الشكل $ax = b$ حيث $a \\neq 0$ ، ولها حلّ وحيد هو $\\dfrac{b}{a}$ .',
  // L'exemple de la CARTE (ouverte dès le début : il n'est jamais le nombre d'une manche).
  example: 'المعادلة $5x - 2 = x + 9$ . تكتب $5x - 2 - x = x + 9 - x$ . أي $4x - 2 = 9$ ويمكن كتابة هذه المعادلة الأخيرة على الشكل $4x = 11$ . بتقسيم الطرفين على العدد 4 أي $x = \\dfrac{11}{4}$ . ينتج أنّ $\\dfrac{11}{4}$ هو الحل الوحيد للمعادلة $5x - 2 = x + 9$ .',
  // L'exemple travaillé de la PAGE (module 2) en LIGNES, pour une lecture ligne à ligne.
  exampleLines: {
    exercise: 'المعادلة $4x + 1 = x + 8$ .',
    solution: [
      'نكتب $4x + 1 - x = x + 8 - x$ . أي $3x + 1 = 8$',
      'ونطرح 1 من الطرفين: $3x = 7$ .',
      'بتقسيم الطرفين على العدد 3 أي $x = \\dfrac{7}{3}$ .',
      'ينتج أنّ $\\dfrac{7}{3}$ هو الحل الوحيد للمعادلة $4x + 1 = x + 8$ .',
    ],
  },
};

/** طرائق — « حل معادلة من الدرجة الأولى بمجهول واحد » : deux solutions, aux nombres de la plateforme. */
const METHOD_SRC = { ...src('method-equation', 47, 'طرائق'), ...PART };
export const METHOD = {
  source: METHOD_SRC,
  title: 'حل معادلة من الدرجة الأولى بمجهول واحد',
  exercise: 'حل كل معادلة من المعادلتين الآتيتين: أ) $4x - 5 = 6$ ب) $2{,}4x + 1{,}5 = 1{,}2x - 2{,}1$',
  a: {
    source: METHOD_SRC,
    exercise: 'أ) $4x - 5 = 6$',
    solution: [
      'أ) لحل المعادلة $4x - 5 = 6$ نضيف 5 إلى كل طرف فنجد $4x - 5 + 5 = 6 + 5$',
      'أي $4x = 11$ ومنه $x = \\dfrac{11}{4}$',
      'وللمعادلة $4x - 5 = 6$ حل وحيد هو $\\dfrac{11}{4}$ .',
    ],
  },
  b: {
    source: METHOD_SRC,
    exercise: 'ب) $2{,}4x + 1{,}5 = 1{,}2x - 2{,}1$',
    solution: [
      'ب) حل المعادلة $2{,}4x + 1{,}5 = 1{,}2x - 2{,}1$ . نطرح $1{,}2x$ من كل طرف فنجد $2{,}4x + 1{,}5 - 1{,}2x = 1{,}2x - 2{,}1 - 1{,}2x$',
      'أي $1{,}2x + 1{,}5 = -2{,}1$ . نطرح $1{,}5$ من كل طرف فنجد $1{,}2x + 1{,}5 - 1{,}5 = -2{,}1 - 1{,}5$',
      'أي $1{,}2x = -3{,}6$ ومنه $x = -\\dfrac{3{,}6}{1{,}2} = -3$ .',
      'وللمعادلة $2{,}4x + 1{,}5 = 1{,}2x - 2{,}1$ حل وحيد هو $-3$ .',
    ],
  },
  // Ce que les deux solutions font, dit avec les mots du point d'apprentissage P2 (catalogue).
  rule: 'لحل معادلة من الدرجة الأولى بمجهول واحد ننقل المجاهيل إلى طرف والمعاليم إلى الطرف الآخر بإجراء العملية نفسها على الطرفين، ونجمع الحدود المتشابهة حتى نصل إلى الشكل $ax = b$ ، ثم نقسم الطرفين على $a$.',
};

/** Traçabilité seule (`check:textbook`) : « أستعدّ » et « أؤكّد تعلّماتي » sont réécrits par la plateforme (content/prep.js, Module08Itqan.jsx). */
export const SOURCES_TRACE = [{ ...src('prep', 43, 'أستعدّ', 1), ...PART }, { ...src('prep', 43, 'أستعدّ', 2), ...PART }, { ...src('qcm', 52, 'أؤكّد تعلّماتي', 1), ...PART }, { ...src('qcm', 52, 'أؤكّد تعلّماتي', 2), ...PART }];

/** « أستعدّ » : l'échelle de la plateforme (content/prep.js), exposée sous le nom que lit `_unit/prepDiagnostic.test.js`. */
export { PREP_LADDER as PREP_ITEMS } from './prep.js';
