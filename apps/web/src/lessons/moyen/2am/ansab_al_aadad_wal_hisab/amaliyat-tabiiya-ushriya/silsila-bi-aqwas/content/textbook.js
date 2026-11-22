/**
 * Le contenu du درس « سلسلة عمليات تتضمّن أقواسا » (2AM, unité 1) — données pures. Le manuel est la RÉFÉRENCE (docs/sources/2am/unit1/extraction.json : أستعدّ p. 7 items 8 et 10,
 * نشاط 3 et 4 pp. 8–9, معارف 2 p. 10, طريقة 1 et 2 p. 11, دوري الآن p. 11, ict p. 21) ; chaque texte montré à l'élève est RÉÉCRIT par la plateforme (guide §4ter-bis : mêmes règles et
 * notations, autres mots, autres exemples, autres nombres). La `source` de chaque bloc garde la traçabilité (`check:textbook`) ; `SourceTag` est muet pour l'élève.
 * Ici les PARENTHÈSES, les CROCHETS et la BARRE DE FRACTION sont le sujet ; aucun résultat intermédiaire négatif dans une chaîne montrée (le négatif imprimé par la calculatrice
 * à `a1` n'est jamais calculé ni enseigné), le signe × est toujours écrit (jamais « 3(4 + 5) », qui est de `tawzi-darb-jam-tarh`).
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** LE LABO DE L'ENTRÉE — la calculatrice de la coopérative (`coop-calculator`, thème `coopshop`) : expérience de la plateforme, tâches du preset `levels.js`. */
export const LAB = {
  source: addition('platform_designed_entry'),
  beginner: {},
  advanced: {},
  /** Le monde de معارف : un seul exercice, 5 × 20 − 3 (la réponse est 5 × (20 − 3) = 85). */
  alone: { tasks: [{
    id: 'm1', kind: 'insert', pre: '5 × 20 − 3', truthLine: '5 × (20 − 3)', traps: [{ line: '(5 × 20) − 3', key: 'bulk' }],
    facts: { boxes: 5, each: 20, out: 3 }, world: { items: [{ glyph: 'ballBox', n: 5, label: '20' }], share: { groups: 5, each: 17, glyph: 'ball', unit: '' } },
  }] },
};

/** « تذكّر — أولوية العمليات » : le lien vers la leçon précédente de l'unité (PUBLIÉE). RAPPELÉ, jamais reconstruit. */
export const RECALL = {
  source: addition('prior_year_reminder'),
  title: 'تذكّر — أولوية العمليات',
  text: 'في الدرس السابق اتّفقنا على قراءة السلسلة: الضرب والقسمة قبل الجمع والطرح، ثم من اليسار نحو اليمين. هذا ما كانت الآلة تفعله حين طبعت $48{,}75$ : قسمت 15 وحده أوّلًا. الأقواس تغيّر هذا الترتيب حين نريد ذلك.',
  lesson: 'silsila-bidun-aqwas',
};

/** معارف 2 (p. 10) — la règle des parenthèses, réécrite avec les exemples de la plateforme. */
export const KNOWLEDGE = {
  brackets: {
    source: src('know-2', 10, 'معارف', 2),
    text: 'القوسان يجعلان الآلة (والقارئ) يحسبان ما بينهما أوّلًا، ثم يكمل الحساب حسب أولوية العمليات. مثلًا $E = 6 \\times (15 - 9) = 6 \\times 6 = 36$ ، و $F = (7 + 5) \\times (20 - 4) = 12 \\times 16 = 192$ ، و $G = (12{,}6 + 5{,}4) \\div 4 = 18 \\div 4 = 4{,}5$ .',
  },
  nested: {
    source: src('method-1', 11, 'طرائق', 1),
    text: 'إذا جاءت أقواس داخل أقواس بدأنا بالداخلية، ونكتب الأقواس الخارجية معقوفين [ ] لتسهل القراءة. مثلًا $H = 3 \\times [20 - (4 + 6)] = 3 \\times [20 - 10] = 3 \\times 10 = 30$ .',
  },
  useless: {
    source: src('act-3', 8, 'أنشطة', 3),
    text: 'قد لا يغيّر القوسان شيئًا: $9 + (2 \\times 5) = 9 + 10 = 19$ ، وهو ما نجده دونهما $9 + 2 \\times 5$ ، لأنّ الضرب يُحسب أوّلًا في كلّ الأحوال. قوسان لا يغيّران ترتيب الحساب غير ضروريين، أمّا في $(9 + 2) \\times 5 = 55$ فهما ضروريان.',
  },
  bar: {
    source: src('method-2', 11, 'طرائق', 2),
    text: 'خطّ الكسر يجمع البسط ويجمع المقام، فهو قوسان صامتان: $\\frac{36 + 12}{20 - 8} = (36 + 12) \\div (20 - 8) = 48 \\div 12 = 4$ . نكتب القوسين قبل أن نحذف الخطّ، ونقرأ الكتابة الأخيرة كسرًا بالعكس.',
  },
  calculator: {
    source: src('ict', 21, 'ict'),
    text: 'الآلة الحاسبة لا تعرف خطّ الكسر ولا ما نقصده: نكتب لها كلّ قوس نحتاجه. لحساب $\\frac{60}{4 + 8}$ نضغط $60 \\div (4 + 8) =$ فتظهر $5$ ؛ أمّا $60 \\div 4 + 8 =$ فتعطي $23$ ، وهو حساب آخر.',
  },
};

/** « طريقة » — les enchaînements du module 3. */
export const METHOD = {
  nested: {
    source: src('method-1', 11, 'طرائق', 1),
    exercise: 'احسب $A = 4 \\times [18 - (2 + 3) \\times 3]$ .',
    solution: [
      'نبدأ بأعمق الأقواس: $(2 + 3) = 5$ ، فيصير $A = 4 \\times [18 - 5 \\times 3]$ .',
      'داخل المعقوفين الضرب أوّلًا: $5 \\times 3 = 15$ ثم $18 - 15 = 3$ ، فيصير $A = 4 \\times 3$ .',
      'وأخيرًا $A = 12$ .',
    ],
    rule: 'نبدأ بأعمق الأقواس ونتحرّك نحو الخارج، وداخل كلّ قوس نحترم أولوية العمليات.',
  },
  bar: {
    source: src('method-2', 11, 'طرائق', 2),
    exercise: 'احسب $B = \\frac{54}{4 \\times 3 - 3} + 2$ .',
    solution: [
      'نضع المقام بين قوسين ونحذف خطّ الكسر: $B = 54 \\div (4 \\times 3 - 3) + 2$ .',
      'داخل القوسين: $4 \\times 3 = 12$ ثم $12 - 3 = 9$ ، فيصير $B = 54 \\div 9 + 2$ .',
      'القسمة قبل الجمع: $54 \\div 9 = 6$ ثم $6 + 2 = 8$ .',
    ],
    rule: 'نكتب البسط والمقام بين قوسين قبل حذف خطّ الكسر، ثم نحسب القوسين، ثم ما بقي بالأولوية.',
  },
  keys: {
    source: src('ict', 21, 'ict'),
    exercise: 'اكتب الأزرار التي تحسب بها الآلة $B = \\frac{54}{4 \\times 3 - 3} + 2$ .',
    solution: [
      'المقام كلّه يُحسب قبل القسمة: نفتح قوسًا قبل $4$ ونغلقه بعد $3$ الأخير.',
      'الأزرار: $54 \\div (4 \\times 3 - 3) + 2 =$ فتظهر $8$ .',
      'ولو نسينا القوسين فكتبنا $54 \\div 4 \\times 3 - 3 + 2 =$ لظهر $39{,}5$ ، وهو حساب آخر.',
    ],
    rule: 'نكتب على الآلة كلّ قوس نحتاجه، وإلا حسبت الآلة شيئًا غير ما نقصده.',
  },
};

/** « أستعدّ » — أستعدّ p. 7, items 8 et 10 RÉÉCRITS en affirmations (l'item 8 : AB = 20 ÷ 5 ; l'item 10 : 9,2/4 = 9,2 ÷ 4 = 2,3). */
export const PREP_ITEMS = [
  { n: 8, skill: 'qisma', text: 'قُسّمت قطعة $[AE]$ طولها $18\\ \\mathrm{cm}$ إلى 4 قطع متقايسة، فطول القطعة الواحدة هو $18 \\div 4 = 4{,}5\\ \\mathrm{cm}$ .', answer: true, why: '$4 \\times 4{,}5 = 18$ : القطع الأربع تكوّن القطعة كلّها.' },
  { n: 10, skill: 'kasr', text: 'العدد $\\frac{13{,}5}{3}$ يُكتب $13{,}5 \\div 3$ ويساوي $4{,}5$ .', answer: true, why: 'الكسر قسمة بسطه على مقامه: $13{,}5 \\div 3 = 4{,}5$ .' },
].map((it) => ({ ...it, source: src('prep', 7, 'أستعدّ', it.n) }));

/** Les items de la PLATEFORME : l'ordre des opérations de la leçon précédente, la somme et le produit décimaux de 1AM, et la curiosité qui ouvre la leçon. */
export const PREP_PLATFORM_ITEMS = [
  { skill: 'priorite', text: '$36 - 4 \\times 6 = 192$ .', answer: false, why: 'الضرب أوّلًا: $4 \\times 6 = 24$ ثم $36 - 24 = 12$ .' },
  { skill: 'priorite', text: '$45 \\div 5 + 4 = 13$ .', answer: true, why: 'القسمة أوّلًا: $45 \\div 5 = 9$ ثم $9 + 4 = 13$ .' },
  { skill: 'darb', text: '$2{,}4 + 3 \\times 1{,}2 = 6$ .', answer: true, why: 'الضرب أوّلًا: $3 \\times 1{,}2 = 3{,}6$ ثم $2{,}4 + 3{,}6 = 6$ .' },
  { skill: 'jadid', text: '$(20 - 6) + 4 = 20 - (6 + 4)$ .', answer: false, why: 'الطرف الأيسر $14 + 4 = 18$ والأيمن $20 - 10 = 10$ . (سنكتشف في هذا الدرس ما تفعله الأقواس.)' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les phrases de correction partagées par les modules ET la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  ignored: {
    wrong: 'في $45 + 15 \\div 4$ تقسم الآلة $15 \\div 4$ أوّلًا فتطبع $48{,}75$ ، وهو أكثر من ثمن الكتاب كلّه.',
    why: 'القسمة تسبق الجمع، والقوسان وحدهما يأمران الآلة بالجمع أوّلًا.',
    right: '$(45 + 15) \\div 4 = 60 \\div 4 = 15$ .',
  },
  barsplit: {
    wrong: 'في $\\frac{40 + 8}{15 - 9}$ نكتب $(40 + 8) \\div 15 - 9$ ، فتقسم الآلة البسط على $15$ وحده ثم تطرح $9$ .',
    why: 'المقام عدد واحد هو $15 - 9$ : لا بدّ من قوسين حوله، وإلا ظهر عدد سالب لا معنى له في الوضعية.',
    right: '$(40 + 8) \\div (15 - 9) = 48 \\div 6 = 8$ .',
  },
  coop: 'في تعاونية المدرسة تحسب الآلة كما تعلّمنا، وما نريده نحن نكتبه لها بالأقواس.',
};
