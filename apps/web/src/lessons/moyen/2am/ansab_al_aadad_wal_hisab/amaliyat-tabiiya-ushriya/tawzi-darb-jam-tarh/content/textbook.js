/**
 * Le contenu du درس « توزيع الضرب على الجمع والطرح » (2AM, unité 1) — données pures. Le manuel est la RÉFÉRENCE (docs/sources/2am/unit1/extraction.json : أستعدّ p. 7 items 9 et 11, نشاط 6 p. 9,
 * معارف 4 p. 12, طرائق 3 et 4 p. 13, تمارين 21–28 et 31–36, أؤكّد 7–10, أتعمّق 42) ; chaque texte montré à l'élève est RÉÉCRIT par la plateforme (guide §4ter-bis : mêmes règles et notations, autres
 * mots, autres exemples, autres nombres). La `source` de chaque bloc garde la traçabilité (`check:textbook`) ; `SourceTag` est muet pour l'élève. Les valeurs viennent de `chainOps` (via ./exercises) ;
 * ./content.test.js les recompare avec un autre code. Toute valeur montrée est ≥ 0 ; le signe × est toujours écrit sauf « 4x » (nommé au module 3).
 */
import { src, addition } from '../../_unit/unitMeta.js';
import { val, ways, tex } from './exercises.js';

/** Une valeur écrite DANS une formule : virgule décimale protégée. */
const vt = (chain) => tex(val(chain));

/** LE LABO DE L'ENTRÉE — la « ورشة الحقائب التضامنية » (`kit-packer`, thème `solidarity`) : expérience de la plateforme, tâches du preset `levels.js`. */
export const LAB = {
  source: addition('platform_designed_entry'),
  beginner: {},
  advanced: {},
  /** Le monde de معارف : un seul chargement, 5 × (6 + 4) = 5 × 6 + 5 × 4 = 50. */
  alone: { tasks: [{ id: 'm1', kind: 'fill', k: 5, a: 6, b: 4, op: '+' }] },
};

/** « تذكّر — الأقواس » : la leçon `silsila-bi-aqwas` de l'unité (PUBLIÉE). RAPPELÉE, jamais reconstruite. */
export const RECALL_AQWAS = {
  source: addition('prior_year_reminder'),
  title: 'تذكّر — الأقواس',
  text: 'القوسان يجعلان ما بينهما يُحسب أوّلًا. في $6 \\times (3 + 2)$ نحسب $3 + 2 = 5$ ثم $6 \\times 5 = 30$ ؛ هذان القوسان هما اللذان سنوزّع عليهما الضرب.',
  lesson: 'silsila-bi-aqwas',
};

/** معارف 4 (p. 12) — la propriété, ses deux exemples et le vocabulaire نشر / تحليل, réécrits avec les exemples de la plateforme. */
export const KNOWLEDGE = {
  property: {
    source: src('know-4', 12, 'معارف', 4),
    text: 'ضرب عدد في مجموع هو ضرب هذا العدد في كلّ حدّ من حدّيه ثم جمع الجداءين، وكذلك في الفرق: $k \\times (a + b) = k \\times a + k \\times b$ و $k \\times (a - b) = k \\times a - k \\times b$ حيث $a \\ge b$. نقول إنّ الضرب توزيعي على الجمع وعلى الطرح.',
  },
  exampleSum: {
    source: src('know-4', 12, 'معارف', 4),
    text: `مثال: $A = 4 \\times (9 + 6) = 4 \\times 9 + 4 \\times 6 = 36 + 24 = ${vt('4 × (9 + 6)')}$ .`,
  },
  exampleDiff: {
    source: src('know-4', 12, 'معارف', 4),
    text: `مثال: $B = 7 \\times (12 - 5) = 7 \\times 12 - 7 \\times 5 = 84 - 35 = ${vt('7 × (12 − 5)')}$ .`,
  },
  names: {
    source: src('know-4', 12, 'معارف', 4),
    text: `نشر جداء هو الانتقال من جداء إلى مجموع أو فرق: $6 \\times (8 - 3) = 6 \\times 8 - 6 \\times 3$ . وتحليل مجموع هو الانتقال من مجموع إلى جداء بإخراج العامل المشترك: $9 \\times 7 + 9 \\times 3 = 9 \\times (7 + 3) = ${vt('9 × (7 + 3)')}$ .`,
  },
  common: {
    source: src('know-4', 12, 'معارف', 4),
    text: 'العامل المشترك يظهر في الجداءين ولو كُتب في موضعين مختلفين: $12 \\times 5 + 12 \\times 3$ و $5 \\times 12 + 3 \\times 12$ كلاهما $12 \\times (5 + 3)$ .',
  },
};

/** « طريقة » — طرائق 3 et 4 (p. 13) réécrites : le calcul mental par facteur commun, par différence, par un nombre rond, puis la lettre. */
export const METHOD = {
  common: {
    source: src('method-3', 13, 'طرائق', 3),
    exercise: 'احسب ذهنيًا $A = 25 \\times 4{,}3 + 25 \\times 5{,}7$ .',
    solution: [
      'العامل المشترك في الجداءين هو $25$ .',
      `نخرجه: $A = 25 \\times (4{,}3 + 5{,}7)$ ، وبين القوسين $4{,}3 + 5{,}7 = ${vt('4,3 + 5,7')}$ .`,
      `إذن $A = 25 \\times 10 = ${vt('25 × 10')}$ .`,
    ],
    rule: 'لحساب مجموع جداءين ذهنيًا: أبحث عن العامل المشترك فأخرجه، وأجمع الحدّين الباقيين إن كان مجموعهما سهلًا.',
  },
  diff: {
    source: src('method-3', 13, 'طرائق', 3),
    exercise: 'احسب ذهنيًا $B = 14{,}6 \\times 12 - 4{,}6 \\times 12$ .',
    solution: [
      'العامل المشترك هو $12$ ، وهو مكتوب في موضع واحد في الجداءين.',
      `$B = (14{,}6 - 4{,}6) \\times 12 = ${vt('14,6 − 4,6')} \\times 12 = ${vt('(14,6 − 4,6) × 12')}$ .`,
    ],
    rule: 'في الفرق كما في المجموع: أخرج العامل المشترك ثم اطرح الحدّين.',
  },
  near: {
    source: src('method-3', 13, 'طرائق', 3),
    exercise: 'احسب ذهنيًا $C = 3{,}5 \\times 101$ و $D = 19 \\times 6$ .',
    solution: [
      `$101 = 100 + 1$ ، فـ $C = 3{,}5 \\times (100 + 1) = 3{,}5 \\times 100 + 3{,}5 \\times 1 = 350 + 3{,}5 = ${vt('3,5 × 101')}$ .`,
      `$19 = 20 - 1$ ، فـ $D = (20 - 1) \\times 6 = 20 \\times 6 - 1 \\times 6 = 120 - 6 = ${vt('19 × 6')}$ .`,
    ],
    rule: 'لأحسب ذهنيًا: أكتب أحد العددين على شكل عدد مدوّر زائد أو ناقص عدد صغير، ثم أوزّع الضرب على الحدّين.',
  },
  letter: {
    source: src('method-4', 13, 'طرائق', 4),
    exercise: 'انشر $E = 4 \\times (x - 3)$ ثم احسب $E$ من أجل $x = 5$ بطريقتين.',
    solution: [
      '$E = 4 \\times (x - 3) = 4 \\times x - 4 \\times 3$ ، والجداء $4 \\times x$ يُكتب $4x$ ، فـ $E = 4x - 12$ .',
      `بالصيغة الأولى: $E = 4 \\times (5 - 3) = 4 \\times 2 = ${vt('4 × (5 − 3)')}$ .`,
      `بالصيغة المنشورة: $E = 4 \\times 5 - 12 = 20 - 12 = ${vt('4 × 5 − 12')}$ ؛ النتيجتان متساويتان.`,
    ],
    rule: 'أنشر عبارة فيها حرف كما أنشر عددًا: العدد يضرب الحرف وكلّ حدّ آخر، و $4 \\times x$ تُكتب $4x$ ؛ وأتحقّق بتعويض الحرف بعدد.',
  },
};

/** « أستعدّ » — أستعدّ p. 7, items 9 et 11 RÉÉCRITS en affirmations (l'aire d'un rectangle composé ; le produit d'un nombre et d'une lettre). */
export const PREP_ITEMS = [
  { n: 9, skill: 'masaha', text: 'مستطيل عرضه $3$ cm وطوله مكوّن من قطعتين $4$ cm و $2{,}5$ cm ، فمساحته $3 \\times 4 + 3 \\times 2{,}5$ cm² .', answer: true, why: 'مساحة المستطيل الكبير مجموع مساحتي القطعتين: $12 + 7{,}5 = 19{,}5$ cm² .' },
  { n: 11, skill: 'harf', text: 'الجداء $x \\times 5$ يُكتب $5x$ .', answer: true, why: 'يمكن عكس عاملي الجداء، وبين عدد وحرف نحذف علامة الضرب ونكتب العدد أوّلًا: $x \\times 5 = 5 \\times x = 5x$ .' },
].map((it) => ({ ...it, source: src('prep', 7, 'أستعدّ', it.n) }));

/** Les items de la PLATEFORME : les parenthèses (`silsila-bi-aqwas`, PUBLIÉE — item du réseau 2am.m1.r02) et la mesure d'un rectangle. */
export const PREP_PLATFORM_ITEMS = [
  { skill: 'aqwas', text: '$6 \\times (10 + 2) = 72$ .', answer: true, why: 'القوسان يفرضان الجمع أوّلًا: $10 + 2 = 12$ ثم $6 \\times 12 = 72$ .' },
  { skill: 'aqwas', text: '$6 \\times 10 + 2 = 72$ .', answer: false, why: 'دون قوسين الضرب أوّلًا: $6 \\times 10 = 60$ ثم $60 + 2 = 62$ .' },
  { skill: 'aqwas', text: '$(7 - 3) \\times 5 = 20$ .', answer: true, why: 'القوسان يفرضان الطرح أوّلًا: $7 - 3 = 4$ ثم $4 \\times 5 = 20$ .' },
  { skill: 'masaha', text: 'مساحة مستطيل بعداه $6$ cm و $4{,}5$ cm هي $21$ cm² .', answer: false, why: 'المساحة جداء البعدين: $6 \\times 4{,}5 = 27$ cm² .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les phrases de correction partagées par les modules ET la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  workshop: 'في ورشة نادي التضامن حقائب مدرسية متماثلة تُملأ بطريقتين: حقيبة بحقيبة، أو صنفًا بصنف بموزّعين يوزّع حزامهما ما يخرج منهما على الحقائب بالتساوي.',
  firstOnly: {
    wrong: 'إخراج 3 كراريس و 2 أقلام فقط لست حقائب (كتابة $6 \\times 3 + 2$ ) يخدم ثلاث حقائب فقط ويترك الباقي دون أقلام.',
    why: 'العدد 6 يضرب كلّ حدّ من حدّي المجموع، لا الحدّ الأول وحده.',
    right: `${ways(6, 3, 2, '+')} .`,
  },
  signChange: {
    wrong: 'جمع الجداءين $7 \\times 10$ و $7 \\times 2$ بدل طرحهما يضيف الكراريس التالفة إلى الصالحة فنجد $84$ بدل $56$.',
    why: 'التالف يُرمى: الإشارة بين الجداءين هي إشارة ما بين القوسين.',
    right: `${ways(7, 10, 2, '−')} .`,
  },
  notation: {
    wrong: 'كتابة $4x - 3$ بدل $4x - 12$ تضرب الحرف وحده في 4.',
    why: 'العدد 4 يضرب $x$ و 3 معًا.',
    right: '$4 \\times (x - 3) = 4x - 12$ .',
  },
};
