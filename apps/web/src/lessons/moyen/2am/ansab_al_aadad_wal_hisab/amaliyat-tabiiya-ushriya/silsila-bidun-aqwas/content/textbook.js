/**
 * Le contenu du درس « سلسلة عمليات دون أقواس وأولوية العمليات » (2AM, unité 1) — données pures. Le manuel est la RÉFÉRENCE (docs/sources/2am/unit1/extraction.json :
 * تحدّ p. 6, أستعدّ p. 7, نشاط 1 et 2 p. 8, معارف 1 p. 10) ; chaque texte montré à l'élève est RÉÉCRIT par la plateforme (guide §4ter-bis : mêmes règles et notations, autres
 * mots, autres exemples, autres nombres). La `source` de chaque bloc garde la traçabilité (`check:textbook`) ; `SourceTag` est muet pour l'élève.
 * AUCUNE parenthèse, crochet ni barre de fraction dans une chaîne montrée (c'est le périmètre de `silsila-bi-aqwas`) ; aucun résultat intermédiaire négatif.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** LE LABO DE L'ENTRÉE — le tramway (`tram-route`, thème `tramline`) : expérience de la plateforme, tâches du preset `levels.js`. */
export const LAB = {
  source: addition('platform_designed_entry'),
  beginner: {},
  advanced: {},
  /** Le monde `mixed` de معارف : une seule tâche qui réunit groupes, descente et partage (50 − 4 × 6 + 30 ÷ 5 = 32). */
  alone: { world: 'mixed', tasks: [{ id: 'm1', chain: '50 − 4 × 6 + 30 ÷ 5', stops: ['market', 'stadium'] }] },
};

/** « تذكّر — السنة الأولى » : choisir + ou − selon le sens de l'histoire (leçon 1AM `mana-jam-tarh`, PUBLIÉE : lien). RAPPELÉ, jamais reconstruit. */
export const RECALL = {
  source: addition('prior_year_reminder'),
  title: 'تذكّر — السنة الأولى',
  text: 'في السنة الأولى تعلّمنا اختيار العملية المناسبة لوضعية: «نزل» و«دفع» و«بقي» تعني الطرح، و«صعد» و«زاد» تعني الجمع، وثمن عدة أشياء متماثلة يعني الضرب. في هذا الدرس نربط عدّة عمليات في سلسلة واحدة، فنختار العمليات ولا نعيد بناءها: $26 - 9$ ثم $+ 4$ .',
  lesson: 'mana-jam-tarh',
};

/** معارف 1 (p. 10) — les trois règles, réécrites avec les exemples de la plateforme. */
export const KNOWLEDGE = {
  addSub: {
    source: src('know-1', 10, 'معارف', 1),
    text: 'في سلسلة عمليات ليس فيها إلا الجمع والطرح، ولا أقواس، نحسب من اليسار نحو اليمين، عمليةً بعد عملية. مثلًا $42 + 15 - 9 = 57 - 9 = 48$ .',
  },
  mulDiv: {
    source: src('know-1', 10, 'معارف', 1),
    text: 'وفي سلسلة ليس فيها إلا الضرب والقسمة، ولا أقواس، نحسب أيضًا من اليسار نحو اليمين. مثلًا $56 \\div 7 \\times 3 = 8 \\times 3 = 24$ .',
  },
  priority: {
    source: src('know-1', 10, 'معارف', 1),
    text: 'وإذا اجتمعت في السلسلة عمليات الضرب والقسمة مع الجمع والطرح، فعمليات الضرب والقسمة تُحسب قبل الجمع والطرح، ثم نكمل من اليسار نحو اليمين: $18 + 6 \\times 5 - 40 \\div 8 = 18 + 30 - 5 = 43$ .',
  },
  agreement: {
    source: addition('knowledge_formalization'),
    text: 'هذه القواعد اتّفاق: لو لم نتّفق على قراءة واحدة لسلسلة مثل $26 - 9 + 4$ لحسب كلّ منّا عددًا مختلفًا. والآلة الحاسبة العلمية تتبع الاتّفاق نفسه: إذا كتبت عليها $15 + 3 \\times 4$ ثم ضغطت «=» ظهر $27$ لأنّها تحسب $3 \\times 4$ قبل الجمع.',
  },
};

/** « طريقة » (declared `addition('knowledge_formalization')` : la page 11 du manuel est celle des parenthèses, leçon suivante) — les enchaînements du module 3. */
export const METHOD = {
  priority: {
    source: addition('knowledge_formalization'),
    exercise: 'احسب $D = 4{,}5 + 2 \\times 8 - 27 \\div 9$ .',
    solution: [
      'نحيط عمليات الضرب والقسمة أوّلًا: $2 \\times 8$ و $27 \\div 9$ .',
      'نحسبها: $D = 4{,}5 + 16 - 3$ .',
      'ثم نحسب الجمع والطرح من اليسار: $4{,}5 + 16 = 20{,}5$ ثم $20{,}5 - 3 = 17{,}5$ .',
    ],
    rule: 'نحسب أوّلًا كلّ الضرب والقسمة، ثم الجمع والطرح، وفي الحالتين من اليسار نحو اليمين.',
  },
  mulDivOnly: {
    source: addition('knowledge_formalization'),
    exercise: 'احسب $E = 100 - 36 \\div 4 \\times 3$ .',
    solution: [
      'الضرب والقسمة أوّلًا، ومن اليسار: $36 \\div 4 = 9$ ثم $9 \\times 3 = 27$ .',
      'يبقى $E = 100 - 27 = 73$ .',
    ],
    rule: 'حين تتتابع القسمة والضرب نبدأ بالتي على اليسار، ثم نطرح من الباقي ما حصلنا عليه.',
  },
  translate: {
    source: addition('knowledge_formalization'),
    exercise: 'اشترى سمير 3 كراريس بـ $45$ DA للكرّاس وقلمًا بـ $25$ DA ، ودفع $200$ DA . اكتب سلسلة تعطي ما بقي معه ثم احسبها.',
    solution: [
      'نكتب عمليات الشراء بترتيب روايتها: ما دفعه سمير يُطرح من $200$ : $200 - 3 \\times 45 - 25$ .',
      'ثمن الكراريس أوّلًا: $3 \\times 45 = 135$ ، فيصير $200 - 135 - 25$ .',
      'ثم من اليسار: $200 - 135 = 65$ ثم $65 - 25 = 40$ . بقي مع سمير $40$ DA .',
    ],
    rule: 'نترجم الوضعية بسلسلة تُقرأ بترتيب الحدوث ثم نحسبها بالقواعد.',
  },
};

/** « أستعدّ » — أستعدّ p. 7, items 3 à 6, RÉÉCRITS en affirmations (item 7 est cité par l'item 3 des affirmations ci-dessous). */
export const PREP_ITEMS = [
  { n: 4, skill: 'jam', text: '$46{,}3 + 128{,}4 + 53{,}7 = 228{,}4$ ، ويمكن حسابه ذهنيًا بجمع $46{,}3$ و $53{,}7$ أوّلًا.', answer: true, why: '$46{,}3 + 53{,}7 = 100$ ثم $100 + 128{,}4 = 228{,}4$ .' },
  { n: 5, skill: 'tarh', text: '$512{,}6 - 307{,}48 = 205{,}12$ .', answer: true, why: 'نكتب $512{,}60$ تحت $307{,}48$ ونطرح: $205{,}12$ .' },
  { n: 6, skill: 'tarjama', text: 'النقطة $B$ بين $A$ و $C$ ، و $AB = 6{,}5\\ \\mathrm{cm}$ و $BC = 12\\ \\mathrm{cm}$ ، فطول $AC$ هو $12 - 6{,}5$ .', answer: false, why: 'طول القطعة كلّها مجموع قطعتيها: $AC = 6{,}5 + 12 = 18{,}5\\ \\mathrm{cm}$ .', cites: [src('prep', 7, 'أستعدّ', 7)] },
  { n: 3, skill: 'jam', text: '$18 + 35 + 12 = 18 + 12 + 35$ .', answer: true, why: 'الجمع لا يتغيّر بتبديل ترتيب الحدود: الطرفان يساويان $65$ .' },
].map((it) => ({ ...it, source: src('prep', 7, 'أستعدّ', it.n) }));

/**
 * Les items de la PLATEFORME : le réseau dit que la leçon s'appuie sur `1am.m1.r05` (جمع، طرح وضرب أعداد عشرية في وضعية) — « أستعدّ » doit le mesurer (LEARNING_NET.md §4.4) :
 * la multiplication (leçon 1AM `darb-adad-ashriya`) et le sens de la soustraction (`mana-jam-tarh`), puis la curiosité qui ouvre la leçon.
 */
export const PREP_PLATFORM_ITEMS = [
  { skill: 'darb', text: 'ثمن 4 كراريس، الواحد بـ $37{,}5$ DA ، هو $4 \\times 37{,}5 = 150$ DA .', answer: true, why: '$4 \\times 37{,}5 = 4 \\times 37 + 4 \\times 0{,}5 = 148 + 2 = 150$ .' },
  { skill: 'mana', text: 'في حافلة 25 راكبًا ونزل منهم 7، فبقي في الحافلة $25 + 7 = 32$ راكبًا.', answer: false, why: '«نزل» يعني الطرح: $25 - 7 = 18$ راكبًا.' },
  { skill: 'jadid', text: '$20 - 6 + 4 = 10$ .', answer: false, why: 'نحسب من اليسار: $20 - 6 = 14$ ثم $14 + 4 = 18$ . (سنكتشف في هذا الدرس لماذا.)' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les phrases de correction partagées par les modules ET la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  addfirst: {
    wrong: 'في $26 - 9 + 4$ أجمع $9 + 4 = 13$ أوّلًا ثم أطرح $26 - 13$ فأجد $13$ .',
    why: 'هذا يعني أنّ 13 تلميذًا نزلوا في المحطة الأولى، وإنّما نزل 9 فقط: نبدأ من اليسار.',
    right: '$26 - 9 = 17$ ثم $17 + 4 = 21$ .',
  },
  nopriority: {
    wrong: 'في $15 + 3 \\times 4$ أجمع $15 + 3 = 18$ أوّلًا ثم أضرب $18 \\times 4$ فأجد $72$ .',
    why: 'جمعنا $15 + 3$ قبل الضرب، فجعلنا الـ 15 تلميذًا الجالسين أفواجًا. الضرب يسبق الجمع.',
    right: '$15 + 3 \\times 4 = 15 + 12 = 27$ .',
  },
  mulfirst: {
    wrong: 'في $150 \\div 6 \\times 4$ أضرب $6 \\times 4 = 24$ أوّلًا ثم أقسم $150 \\div 24$ فأجد $6{,}25$ .',
    why: 'ثمن 4 تذاكر لا يمكن أن يكون أقلّ من ثمن تذكرة واحدة (25 DA): في الضرب والقسمة وحدهما نبدأ من اليسار.',
    right: '$150 \\div 6 = 25$ ثم $25 \\times 4 = 100$ DA .',
  },
  tram: 'في رحلة بالترامواي تقع المحطات بالترتيب نفسه الذي نكتبها به، ولهذا نحسب الجمع والطرح من اليسار نحو اليمين.',
};
