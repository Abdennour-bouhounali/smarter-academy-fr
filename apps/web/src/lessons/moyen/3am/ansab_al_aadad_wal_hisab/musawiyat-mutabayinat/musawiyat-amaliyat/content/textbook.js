/**
 * Le contenu du درس « المساويات والعمليات » (3AM, unité 5) — données pures. Le manuel est la RÉFÉRENCE (docs/sources/3am/unit5/
 * extraction.json : نشاط 1 p. 72, معارف 1 p. 74, طرائق p. 75, أستعدّ p. 71) ; chaque texte montré à l'élève est RÉÉCRIT par la
 * plateforme (guide §4ter-bis : mêmes propriétés et notations, autres mots, autres exemples, autres nombres). La `source` de chaque bloc
 * garde la traçabilité (`check:textbook`) ; `SourceTag` est muet pour l'élève.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** LE LABO DE L'ENTRÉE — le مضمار (`equality-lanes`, thème `stadium`) : expérience de la plateforme, nombres du preset `levels.js`. */
export const LAB = {
  source: addition('platform_designed_entry'),
  beginner: { left: '10', right: '4x-2', x: '3', tasks: [[['add', -2]], [['add', 2]], [['mul', 3]], [['div', 2]]] },
  advanced: { left: '5', right: '-3x+1', x: '-4/3', tasks: [[['mul', -2]], [['mul', 2], ['add', -3]], [['add', -1], ['div', -3]]] },
};

/** معارف 1 (p. 74) — les deux propriétés, RÉÉCRITES avec les exemples de la plateforme. */
export const KNOWLEDGE = {
  add: {
    source: src('know-1a', 74, 'معارف'),
    text: 'من أجل أعداد ناطقة $a$ و $b$ و $c$ : إذا كان $a = b$ فإنّ $a + c = b + c$ و $a - c = b - c$ . أي أنّنا نحصل على مساواة صحيحة عندما نضيف العدد نفسه إلى الطرفين، أو نطرحه منهما.',
    example: 'مثلًا: إذا كان $y = 5$ فإنّ $y + 12 = 17$ و $y - 9 = -4$ .',
  },
  times: {
    source: src('know-1b', 74, 'معارف'),
    text: 'إذا كان $a = b$ فإنّ $a \\times c = b \\times c$ ؛ وإذا كان $a = b$ و $c \\neq 0$ فإنّ $\\frac{a}{c} = \\frac{b}{c}$ . أي أنّنا نحصل على مساواة صحيحة عندما نضرب الطرفين في العدد نفسه، أو نقسمهما على العدد نفسه غير المعدوم.',
    example: 'مثلًا: إذا كان $t = \\frac{2}{3}$ فإنّ $6t = 4$ و $\\frac{t}{-2} = -\\frac{1}{3}$ .',
  },
  both: {
    source: addition('knowledge_formalization'),
    text: 'العملية تُجرى على الطرفين معًا: إذا أُجريت على طرف واحد فلا تبقى المساواة صحيحة.',
  },
  zero: {
    source: addition('knowledge_formalization'),
    text: 'لا يمكن القسمة على $0$ . والضرب في $0$ يعطي $0 = 0$ : مساواة صحيحة لكنها لا تفيدنا بشيء، فلا نستطيع الرجوع منها إلى المساواة الأولى.',
  },
};

/** طرائق p. 75 — « توظيف خواص المساويات والعمليات », RÉÉCRITE avec d'autres nombres. */
/** « تذكّر — السنة الثانية » : اختبار صحة مساواة بقيمة (2am.m4.r09), JAMAIS reconstruit ici ; renvoie à sa leçon. */
export const RECALL = {
  year2: {
    lesson: 'ikhtibar-musawat-mutabayina',
    title: 'تذكّر — السنة الثانية',
    text: 'في السنة الثانية اختبرنا صحّة مساواة بتعويض الحرف بقيمة وحساب الطرفين: $3x-5=7$ صحيحة من أجل $x=4$ لأنّ $3\\times4-5=7$ .',
    source: addition('prior_year_reminder'),
  },
};

export const METHOD = {
  transform: {
    source: src('method-1a', 75, 'طرائق'),
    exercise: 'نفترض أنّ $x$ عدد ناطق حيث $5 = 3x - 1$ . هل المساواتان $4 = 3x - 2$ و $3x + 2 = 5$ صحيحتان؟',
    solution: [
      'لدينا $5 = 3x - 1$ .',
      'نطرح $1$ من الطرفين: $5 - 1 = 3x - 1 - 1$ أي $4 = 3x - 2$ : المساواة صحيحة.',
      'نضيف $3$ إلى الطرفين: $5 + 3 = 3x - 1 + 3$ أي $8 = 3x + 2$ ؛ إذن $3x + 2 = 5$ غير صحيحة لأنّ $3x + 2 = 8$ .',
    ],
    rule: 'للتحقق من صحة مساواة نحوّل المساواة المعطاة بعملية واحدة أو أكثر على الطرفين؛ فإذا وصلنا إلى المساواة المطلوبة فهي صحيحة، وإذا وصلنا إلى مساواة تناقضها فهي خاطئة.',
    numbers: { x: 2 },
  },
  scale: {
    source: src('method-1b', 75, 'طرائق'),
    exercise: 'نفترض أنّ $x$ عدد ناطق حيث $2x + 3 = 7$ . هل المساواتان $-4x - 6 = -14$ و $4x + 3 = 14$ صحيحتان؟',
    solution: [
      'نضرب طرفي $2x + 3 = 7$ في $-2$ : $-2 \\times (2x + 3) = -2 \\times 7$ أي $-4x - 6 = -14$ : صحيحة.',
      'نضرب الطرفين في $2$ : $4x + 6 = 14$ ؛ إذن $4x + 3 = 14$ غير صحيحة، لأنّنا نضرب كل حدود الطرف.',
    ],
    rule: 'الضرب أو القسمة يشملان كل حدود الطرف؛ ويكفي مضروب واحد غير مضروب ليفسد النتيجة.',
    numbers: { x: 2 },
  },
};

/** « أستعدّ » — أستعدّ p. 71, items 1, 3, 4 et 9, RÉÉCRITS en affirmations. */
export const PREP_ITEMS = [
  { n: 1, skill: 'majhul', text: 'إذا كان $x + 5 = 0$ فإنّ العدد المجهول هو $-5$ .', answer: true, why: 'نبحث عن عدد نضيف إليه 5 فنجد 0 : هو $-5$ .' },
  { n: 3, skill: 'majhul', text: 'إذا كان $7 \\times x = 1$ فإنّ العدد المجهول هو $7$ .', answer: false, why: '$7 \\times 7 = 49$ . العدد الذي يعطي 1 مع 7 هو $\\frac{1}{7}$ .' },
  { n: 4, skill: 'majhul', text: 'إذا كان $-8x = 8$ فإنّ العدد المجهول هو $-1$ .', answer: true, why: '$-8 \\times (-1) = 8$ .' },
  { n: 9, skill: 'qima', text: 'قيمة العبارة $7 + 3x$ من أجل $x = 0$ هي $10$ .', answer: false, why: 'من أجل $x = 0$ : $7 + 3 \\times 0 = 7$ .' },
].map((it) => ({ ...it, source: src('prep', 71, 'أستعدّ', it.n) }));

/**
 * Les items de la PLATEFORME : le réseau dit que la leçon s'appuie sur `2am.m4.r09` (اختبار صحة مساواة بقيمة معلومة, leçon 2AM
 * `ikhtibar-musawat-mutabayina`) et `3am.m1.r01` (جداء عددين نسبيين, `jidaa-adadayn-nisbiyayn`) — « أستعدّ » doit les mesurer
 * (LEARNING_NET.md §4.4).
 */
export const PREP_PLATFORM_ITEMS = [
  { skill: 'ikhtibar', text: 'العدد $4$ حلّ للمساواة $3x - 5 = 7$ .', answer: true, why: 'من أجل $x = 4$ : $3 \\times 4 - 5 = 7$ ، فالمساواة محققة.' },
  { skill: 'ikhtibar', text: 'العدد $3$ حلّ للمساواة $2x + 1 = 4x - 3$ .', answer: false, why: 'من أجل $x = 3$ : الطرف الأيسر $7$ والأيمن $9$ ، فهما غير متساويين.' },
  { skill: 'jidaa', text: '$(-4) \\times (-6) = -24$ .', answer: false, why: 'جداء عددين سالبين موجب: $(-4) \\times (-6) = 24$ .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les phrases de correction partagées par les modules ET la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  oneSide: {
    wrong: 'في $10 = 4x - 2$ أضفتُ $2$ إلى الطرف الأيمن فقط وكتبتُ $10 = 4x$ .',
    why: 'العدد نفسه يجب أن يُضاف إلى الطرفين: إضافته إلى طرف واحد تغيّر قيمته وحده.',
    right: '$10 + 2 = 4x - 2 + 2$ أي $12 = 4x$ .',
  },
  allTerms: {
    wrong: 'أضرب $2x - 5 = 2$ في $-3$ فأكتب $-6x - 5 = -6$ .',
    why: 'الضرب يشمل كل حدود الطرف الأيسر، ومنها $-5$ .',
    right: '$-3 \\times (2x - 5) = -6x + 15$ ، فالمساواة هي $-6x + 15 = -6$ .',
  },
  divZero: {
    wrong: 'أقسم طرفي $0 \\times x = 0 \\times 5$ على $0$ فأجد $x = 5$ .',
    why: 'القسمة على $0$ مستحيلة، والضرب في $0$ يمحو معلومة العدد المجهول.',
    right: 'لا قسمة على $0$ ؛ و $0 = 0$ لا تدلّنا على قيمة $x$ .',
  },
  notFollow: {
    wrong: 'من $10 = 4x - 2$ أستنتج $4x = 5$ لأنّني أضفتُ عددًا إلى الطرفين.',
    why: 'العدد المضاف إلى الطرفين يغيّرهما بالمقدار نفسه، فلا نحصل إلا على المساواة التي توصل إليها العملية فعلًا.',
    right: 'بإضافة $2$ نجد $12 = 4x$ ؛ إذن $4x = 5$ خاطئة (لأنّ $4x = 12$).',
  },
  together: 'العملية نفسها بالعدد نفسه على الطرفين تُبقي المساواة صحيحة: $a = b$ تعطي $a + c = b + c$ .',
  scale: 'الضرب في عدد غير معدوم (موجب أو سالب) يُبقي المساواة صحيحة: $a = b$ تعطي $a \\times c = b \\times c$ .',
};
