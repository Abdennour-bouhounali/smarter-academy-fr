/**
 * Le contenu du درس « وصف سلسلة حسابات » (2AM, unité 1) — données pures. Le manuel est la RÉFÉRENCE (docs/sources/2am/unit1/extraction.json : أستعدّ p. 7 items 1 et 2, نشاط 5 p. 9, معارف 3 p. 12,
 * تمارين 9, 18, 19, 20, أؤكّد 5, أتعمّق 47–49) ; chaque texte montré à l'élève est RÉÉCRIT par la plateforme (guide §4ter-bis : mêmes règles et notations, autres mots, autres exemples, autres nombres).
 * La `source` de chaque bloc garde la traçabilité (`check:textbook`) ; `SourceTag` est muet pour l'élève. Il n'y a PAS de page « طرائق » pour cette leçon : le module 3 est un ajout de la plateforme
 * (`addition('knowledge_formalization')`). Les PHRASES qui décrivent une chaîne viennent de `chainOps.describe` (via ./exercises) ; ./content.test.js les recompare à une table écrite à la main.
 * Toute chaîne montrée vaut un nombre ≥ 0 ; le signe × est toujours écrit.
 */
import { src, addition } from '../../_unit/unitMeta.js';
import { desc, val } from './exercises.js';

/** LE LABO DE L'ENTRÉE — le « مقصّ السلسلة » (`chain-cutter`, thème `corkboard`) : expérience de la plateforme, tâches du preset `levels.js`. */
export const LAB = {
  source: addition('platform_designed_entry'),
  beginner: {},
  advanced: {},
  /** Le monde de معارف : un seul ruban, (20 − 8) ÷ (1 + 2) = 4, coupé entièrement (staples visibles). */
  alone: { tasks: [{ id: 'm1', kind: 'cut', text: '(20 − 8) ÷ (1 + 2)', depth: 'full' }] },
};

/** « تذكّر — الأقواس » : la leçon précédente de l'unité (PUBLIÉE). RAPPELÉE, jamais reconstruite. */
export const RECALL_AQWAS = {
  source: addition('prior_year_reminder'),
  title: 'تذكّر — الأقواس',
  text: 'القوسان يجعلان ما بينهما يُحسب أوّلًا. في $(20 - 8) \\div (1 + 2)$ يُحسب الفرق والمجموع قبل القسمة، فالقسمة هي آخر ما يُنجز، وهي التي قطعتَ عندها الشريط.',
  lesson: 'silsila-bi-aqwas',
};

/** « تذكّر — أولوية العمليات » : la leçon d'avant (PUBLIÉE). */
export const RECALL_PRIORITE = {
  source: addition('prior_year_reminder'),
  title: 'تذكّر — أولوية العمليات',
  text: 'الضرب والقسمة قبل الجمع والطرح، ثم من اليسار نحو اليمين. هذه الأولوية تقول لنا أيّ عملية تُنجز في الأخير: في $7 + 4 \\times 5$ يُنجز الضرب أوّلًا، فالجمع هو الأخير.',
  lesson: 'silsila-bidun-aqwas',
};

/** معارف 3 (p. 12) — la règle de la dernière opération et la phrase, réécrites avec les exemples de la plateforme. */
export const KNOWLEDGE = {
  last: {
    source: src('know-3', 12, 'معارف', 3),
    text: 'في كلّ سلسلة عمليات عملية واحدة تُنجز في الأخير، وهي التي تسمّي السلسلة: إن كانت جمعًا فالسلسلة مجموع، وإن كانت طرحًا ففرق، وإن كانت ضربًا فجداء، وإن كانت قسمة فحاصل قسمة. في $7 + 4 \\times 5$ يُنجز الضرب أوّلًا ($4 \\times 5 = 20$) ثم الجمع $7 + 20 = 27$ ، فهي مجموع.',
  },
  terms: {
    source: src('know-3', 12, 'معارف', 3),
    text: 'لكلّ سلسلة قطعتان تربط بينهما آخر عملية: في المجموع والفرق هما الحدّان (الأول ثم الثاني)، وفي الجداء هما العاملان، وفي حاصل القسمة هما المقسوم والقاسم. في $(18 + 6) \\div 3$ المقسوم هو $18 + 6$ والقاسم هو $3$ .',
  },
  sentence: {
    source: src('know-3', 12, 'معارف', 3),
    text: `نصف السلسلة بجملة تبدأ باسمها ثم تذكر قطعتيها، وكلّ قطعة ليست عددًا نصفها بالطريقة نفسها. السلسلة $6 \\times (9 - 2) + 5$ هي ${desc('6 × (9 − 2) + 5')} .`,
  },
  examples: {
    source: src('know-3', 12, 'معارف', 3),
    text: `الأعداد نفسها تعطي سلسلتين باسمين مختلفين: $A = 9 + 2 \\times 7 = ${val('9 + 2 × 7')}$ هي ${desc('9 + 2 × 7')} ، أمّا $B = (9 + 2) \\times 7 = ${val('(9 + 2) × 7')}$ فهي ${desc('(9 + 2) × 7')} .`,
  },
  order: {
    source: src('know-3', 12, 'معارف', 3),
    text: 'في الفرق وفي حاصل القسمة يهمّ الترتيب: نذكر الحدّ الأول (المقسوم) أوّلًا. حاصل قسمة 12 على 4 هو $12 \\div 4 = 3$ ، أمّا حاصل قسمة 4 على 12 فيعني $4 \\div 12$ ، وهو عدد آخر.',
  },
};

/** « طريقة » — les enchaînements du module 3 (ajout de la plateforme : pas de page « طرائق » dans le manuel). */
export const METHOD = {
  describe: {
    source: addition('knowledge_formalization'),
    exercise: 'صِف السلسلة $C = 12 \\times (15 - 9)$ بجملة ثم احسبها.',
    solution: [
      `الأقواس أوّلًا: $15 - 9 = ${val('15 − 9')}$ ثم نضرب $12$ في الناتج؛ فآخر عملية تُنجز هي الضرب.`,
      'إذن $C$ جداء: عاملاه $12$ و $15 - 9$ ، والعامل الثاني فرق العددين 15 و 9.',
      `الجملة: ${desc('12 × (15 − 9)')} ، وقيمتها $${val('12 × (15 − 9)')}$ .`,
    ],
    rule: 'لأصف: أحدّد آخر عملية، ثم أسمّي السلسلة، ثم أصف كلّ حدّ (أو عامل) ليس عددًا بالطريقة نفسها.',
  },
  write: {
    source: addition('knowledge_formalization'),
    exercise: 'اكتب السلسلة «مجموع العدد 12 وحاصل قسمة 45 على 9» ثم احسبها.',
    solution: [
      'آخر عملية هي الجمع: حدّه الأول $12$ وحدّه الثاني حاصل قسمة $45$ على $9$ ، فنكتب $12 + 45 \\div 9$ .',
      'لا حاجة إلى قوسين: القسمة تسبق الجمع بالأولوية، فتُنجز قبل آخر عملية دون أن نطلب ذلك.',
      `$45 \\div 9 = ${val('45 ÷ 9')}$ ثم $12 + 5 = ${val('12 + 45 ÷ 9')}$ .`,
    ],
    rule: 'لأكتب: أبدأ بآخر عملية، وأضع بين قوسين كلّ حدّ (أو عامل) يجب أن يُحسب قبلها ولا تفرضه الأولوية.',
  },
  bracket: {
    source: addition('knowledge_formalization'),
    exercise: 'اكتب السلسلة «حاصل قسمة مجموع العددين 27 و 9 على 6» ثم احسبها.',
    solution: [
      'آخر عملية هي القسمة: مقسومها مجموع العددين $27$ و $9$ وقاسمها $6$ .',
      'الجمع يجب أن يُنجز قبل القسمة، لكنّ الأولوية تقدّم القسمة، فنضع المجموع بين قوسين: $(27 + 9) \\div 6$ .',
      `$27 + 9 = ${val('27 + 9')}$ ثم $36 \\div 6 = ${val('(27 + 9) ÷ 6')}$ .`,
    ],
    rule: 'القوسان يرفعان الحدّ إلى ما يُنجز قبل آخر عملية؛ دونهما تتغيّر آخر عملية ويتغيّر اسم السلسلة.',
  },
};

/** « أستعدّ » — أستعدّ p. 7, items 1 et 2 RÉÉCRITS en affirmations (l'item 1 : un mot de vocabulaire ; l'item 2 : les facteurs). */
export const PREP_ITEMS = [
  { n: 1, skill: 'mufradat', text: '$4{,}7 + 9{,}3$ عبارة عن جداء.', answer: false, why: 'هذه جمع: هي مجموع العددين $4{,}7$ و $9{,}3$ ، وقيمتها $14$ .' },
  { n: 2, skill: 'awamil', text: 'في $6 \\times 2{,}5$ يُسمّى العددان $6$ و $2{,}5$ عاملين.', answer: true, why: 'في الجداء يُسمّى كلّ من العددين المضروبين عاملًا، وجداؤهما $6 \\times 2{,}5 = 15$ .' },
].map((it) => ({ ...it, source: src('prep', 7, 'أستعدّ', it.n) }));

/** Les items de la PLATEFORME : le vocabulaire de la différence et du quotient (1AM), l'ordre des opérations (leçon 1) et les parenthèses (leçon 2). */
export const PREP_PLATFORM_ITEMS = [
  { skill: 'mufradat', text: 'في الفرق $45 - 18$ ، العدد $18$ هو الحدّ الثاني.', answer: true, why: 'الحدّ الأول هو المكتوب أوّلًا ($45$) والحدّ الثاني هو $18$ .' },
  { skill: 'maqsum', text: 'في $36 \\div 4$ ، العدد $36$ هو المقسوم.', answer: true, why: 'المقسوم هو العدد الذي نقسمه ($36$) والقاسم هو العدد الذي نقسم عليه ($4$) ، وحاصل القسمة $9$ .' },
  { skill: 'priorite', text: '$5 + 4 \\times 3 = 17$ .', answer: true, why: 'الضرب أوّلًا: $4 \\times 3 = 12$ ثم $5 + 12 = 17$ .' },
  { skill: 'aqwas', text: '$(5 + 4) \\times 3 = 17$ .', answer: false, why: 'القوسان يفرضان الجمع أوّلًا: $(5 + 4) \\times 3 = 9 \\times 3 = 27$ .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les phrases de correction partagées par les modules ET la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  cork: 'على سبّورة القسم شريط ورقي مطبوع، ونريد وصفه لصديق بجملة قصيرة: نقصّه إلى قطعتين تُحسب كلّ منهما وحدها فنجد العملية التي أُنجزت في الأخير.',
  firstop: {
    wrong: 'قصّ الشريط $7 + 4 \\times 5$ عند الضرب يعطي القطعتين $7 + 4$ و $5$ ، فنجد $11 \\times 5 = 55$ بينما قيمة الشريط $27$ .',
    why: 'الضرب $4 \\times 5$ أُنجز أوّلًا فهو مدبَّس، والعملية الحرّة هي التي أُنجزت في الأخير.',
    right: '$7 + (4 \\times 5) = 7 + 20 = 27$ : الجمع هو آخر عملية، فالشريط مجموع.',
  },
  nobracket: {
    wrong: 'كتابة «جداء العدد 4 ومجموع العددين 9 و 6» على الشكل $4 \\times 9 + 6$ تعطي $42$ وتجعل السلسلة مجموعًا.',
    why: 'جمع $9$ و $6$ يجب أن يُنجز قبل الضرب، والقوسان وحدهما يفرضان ذلك.',
    right: '$4 \\times (9 + 6) = 4 \\times 15 = 60$ .',
  },
};
