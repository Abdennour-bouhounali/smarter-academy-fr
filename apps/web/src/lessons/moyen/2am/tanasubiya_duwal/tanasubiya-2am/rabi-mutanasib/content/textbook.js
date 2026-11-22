/**
 * Le contenu du درس « حساب الرابع المتناسب » (2AM, unité 5) — données pures. Le manuel est la RÉFÉRENCE (docs/sources/2am/unit5/
 * extraction.json : act-2, know-1b p. 74, method-1 p. 75, now-75 ②, أستعدّ p. 71) ; chaque texte montré à l'élève est RÉÉCRIT par la
 * plateforme (guide §4ter-bis : mêmes propriétés et notations, autres mots, autres exemples, autres nombres). La `source` de chaque bloc
 * garde la traçabilité (`check:textbook`) ; `SourceTag` est muet pour l'élève.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/**
 * LE LABO DE L'ENTRÉE — « موازين الرابع المتناسب » (`fourth-gauges`, monde `market`, thème `souk`) : expérience de la plateforme. Les
 * tâches de مبتدئ / متقدم sont celles du preset `levels.js` ; معارف pose le MÊME labo seul (`levels={false}`) avec ses tâches (balances
 * voilées) : un prix par le chemin additif puis une QUANTITÉ par le chemin multiplicatif.
 */
export const LAB = {
  source: addition('platform_designed_entry'),
  insert: {
    tasks: [
      { hole: 'd', a: '5', b: '650', c: '7', rows: ['البرتقال (kg)', 'الثمن (DA)'], step: '10', max: '1500', covered: true },
      { hole: 'c', a: '4', b: '300', d: '900', rows: ['الكتلة (kg)', 'الثمن (DA)'], step: '1', max: '30', covered: true },
    ],
  },
};

/** معارف 1 (p. 74) — le mot et la propriété, RÉÉCRITS avec les mots de la plateforme. */
export const KNOWLEDGE = {
  fourth: {
    source: src('know-1b', 74, 'معارف'),
    text: 'في جدول تناسبية، إذا عرفنا ثلاثة أعداد منه ولم نعرف الرابع، فالعدد الناقص هو الرابع المتناسب، ولا يوجد إلاّ عدد واحد يجعل الجدول تناسبيًا. مثلًا: $4$ kg بـ $520$ DA و $6$ kg بـ ؟ ، الرابع المتناسب هو $780$ .',
  },
  routes: {
    source: src('know-1b', 74, 'معارف'),
    text: 'نحسب الرابع المتناسب بعدّة طرق تعطي العدد نفسه: بالمرور بالوحدة أو بمعامل التناسبية ($520 \\div 4 = 130$ ثم $130 \\times 6 = 780$) ؛ بالخاصية الجمعية ($6 = 4 + 2$ ، فنجمع ثمني $4$ kg و $2$ kg) ؛ بالخاصية الضربية ($c = 1{,}5 \\times a$ ، فنضرب الثمن في $1{,}5$) .',
  },
  cross: {
    source: src('know-1b', 74, 'معارف'),
    text: 'في جدول تناسبية $\\begin{array}{|c|c|}\\hline a & c \\\\\\hline b & d \\\\\\hline\\end{array}$ ، الجداءان المتصالبان متساويان: $a \\times d = b \\times c$ . وبهذا نحسب أحد الأعداد الأربعة إذا علمنا ثلاثة منها. مثلًا $4 \\times x = 520 \\times 6$ ، إذن $x = 3120 \\div 4 = 780$ .',
  },
  remark: {
    source: src('know-1b', 74, 'معارف'),
    text: 'هذه المساواة صحيحة لأيّ عمودين من جدول تناسبية: نضرب العدد الأعلى من أحد العمودين في العدد الأسفل من الآخر، ونقارن بجداء القطر الثاني.',
  },
  trap: {
    source: addition('knowledge_formalization'),
    text: 'إضافة الفرق نفسه إلى العددين لا تحافظ على التناسبية: من $4$ kg إلى $6$ kg نزيد $2$ ، لكن ثمنها لا يزيد $2$ DA. الذي يبقى ثابتًا هو الثمن الواحد (أو معامل التناسبية)، لا الفرق.',
  },
};

/** طريقة (p. 75, réécrite) : choisir le chemin selon les nombres — autres nombres (une électricienne payée à l'heure). */
export const METHOD = {
  choose: {
    source: src('method-1', 75, 'طرائق'),
    exercise: 'تتقاضى كهربائية $1260$ DA عن $6$ ساعات عمل، وأجرتها تتناسب مع عدد الساعات. ① ما أجرة $3$ ساعات؟ ② ما أجرة $9$ ساعات؟ ③ ما أجرة $7$ ساعات؟ ④ كم ساعة تعمل لتتقاضى $6300$ DA؟',
    solution: [
      '① $3 = 6 \\div 2$ : الخاصية الضربية، الأجرة $1260 \\div 2 = 630$ DA.',
      '② $9 = 6 + 3$ : الخاصية الجمعية، الأجرة $1260 + 630 = 1890$ DA.',
      '③ نمرّ بالوحدة: أجرة ساعة $1260 \\div 6 = 210$ ، إذن أجرة $7$ ساعات $210 \\times 7 = 1470$ DA.',
      '④ $6300 = 1260 \\times 5$ : الخاصية الضربية، عدد الساعات $6 \\times 5 = 30$ ساعة (أو الجداءان: $1260 \\times x = 6 \\times 6300$).',
    ],
    rule: [
      'لحساب الرابع المتناسب أبدأ بالنظر إلى الأعداد ثم أختار:',
      'إذا كان أحد العددين مضاعفًا أو نصفًا أو جزءًا بسيطًا للآخر: الخاصية الضربية.',
      'إذا كان أحدهما مجموع عددين معلومين: الخاصية الجمعية.',
      'إذا كانت قسمة العددين على الوحدة تعطي عددًا منتهيًا: المرور بالوحدة أو معامل التناسبية.',
      'وإلاّ أكتب الجداءين المتصالبين وأقسم في النهاية مرّة واحدة.',
    ],
    numbers: { wage3: '630', wage9: '1890', wage7: '1470', hours: '30' },
  },
  // دوري الآن ② (p. 75) réécrit : compléter un tableau où une case manque (kg de blé → kg de farine)
  now: {
    source: src('now-75', 75, 'دوري الآن', 2),
    values: { wheat: ['20', '35', '14'], flour: ['16', '28', '11,2'] },
  },
};

/** « أستعدّ » — p. 71 : items 1, 3, 4 RÉÉCRITS en affirmations (les autres vont aux leçons voisines). */
export const PREP_ITEMS = [
  { n: 1, skill: 'wahda', text: 'إذا كانت $5$ علب متماثلة تزن $4$ kg ، فكتلة علبة واحدة هي $0{,}8$ kg .', answer: true, why: '$4 \\div 5 = 0{,}8$ : نقسم الكتلة الكلية على عدد العلب.' },
  { n: 3, skill: 'maadala', text: 'العدد الذي يحقّق $3 \\times \\square = 5$ هو $1{,}66$ .', answer: false, why: '$\\square = 5 \\div 3$ ، وهو لا يُكتب كتابة عشرية منتهية؛ $3 \\times 1{,}66 = 4{,}98 \\neq 5$ .' },
  { n: 4, skill: 'muamil', text: 'في الجدول $\\begin{array}{|c|c|}\\hline 4 & 8 \\\\\\hline 12 & 24 \\\\\\hline\\end{array}$ ، معامل التناسبية هو $3$ .', answer: true, why: '$12 \\div 4 = 3$ و $24 \\div 8 = 3$ .' },
].map((it) => ({ ...it, source: src('prep', 71, 'أستعدّ', it.n) }));

/**
 * Les items de la PLATEFORME : le réseau dit que la leçon CONSOLIDE `1am.m6.r04` (إتمام جدول تناسبية بطرائق مختلفة, leçon
 * `itmam-jadwal-tanasubiya`, non publiée) — « أستعدّ » doit le mesurer (LEARNING_NET.md §4.4) : le chemin multiplicatif, le chemin
 * additif, le piège de la différence ; et la reconnaissance d'un tableau (leçon sœur `wadiya-tanasubiya-jadwal`, non publiée).
 */
export const PREP_PLATFORM_ITEMS = [
  { skill: 'jadwal', text: 'الجدول $\\begin{array}{|c|c|c|}\\hline 2 & 4 & 6 \\\\\\hline 3 & 6 & 10 \\\\\\hline\\end{array}$ هو جدول تناسبية.', answer: false, why: '$6 \\div 4 = 1{,}5$ لكنّ $10 \\div 6 = 1{,}67$ تقريبًا: النسب ليست متساوية.' },
  { skill: 'itmam', text: 'إذا كان ثمن $3$ kg هو $360$ DA فثمن $6$ kg هو $720$ DA ، لأنّ $6$ ضعف $3$ .', answer: true, why: 'إذا ضاعفنا الكتلة ضاعفنا الثمن: الخاصية الضربية.' },
  { skill: 'itmam', text: 'إذا كان ثمن $2$ kg هو $50$ DA وثمن $3$ kg هو $75$ DA ، فثمن $5$ kg هو $125$ DA .', answer: true, why: '$5 = 2 + 3$ فنجمع الثمنين: $50 + 75 = 125$ : الخاصية الجمعية.' },
  { skill: 'itmam', text: 'إذا كان ثمن $4$ kg هو $100$ DA فثمن $6$ kg هو $104$ DA ، لأنّ $6 = 4 + 2$ .', answer: false, why: 'لا نضيف الفرق نفسه إلى الثمن: ثمن كيلوغرام واحد $25$ DA ، إذن ثمن $6$ kg هو $150$ DA .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les phrases de correction partagées par les modules ET la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  addDiff: {
    wrong: '$625$ DA لـ $5$ kg ، إذن $626$ DA لـ $6$ kg .',
    why: 'نحافظ على الفرق بين الكتلتين لكنّ التناسبية تحافظ على ثمن الكيلوغرام الواحد: $625 \\div 5 = 125$ بينما $626 \\div 6$ ليس $125$ .',
    right: 'ثمن $6$ kg هو $6 \\times 125 = 750$ DA .',
  },
  crossWrong: {
    wrong: '$5 \\times 6 = x \\times 625$ ',
    why: 'جداءا القطر الواحد يضمّان عددين من عمودين مختلفين وسطرين مختلفين: $5 \\times x$ و $625 \\times 6$ .',
    right: '$5 \\times x = 625 \\times 6$ .',
  },
  unique: 'لا يوجد إلاّ عدد واحد يجعل الجدول تناسبيًا: كل الطرق تؤدّي إليه.',
};
