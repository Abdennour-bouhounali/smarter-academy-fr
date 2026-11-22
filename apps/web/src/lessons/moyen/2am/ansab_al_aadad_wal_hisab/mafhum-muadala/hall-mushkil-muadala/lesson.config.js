/**
 * الدرس — حلّ مشكل باستعمال معادلة (2AM, unité 4 « مفهوم معادلة »), la DEUXIÈME leçon générée de l'unité (item du programme `2am.m4.r08`), générée DANS son entrée du catalogue (même code), cycle moyen phase 3, 2026-10-29.
 * Manuel 2AM (الجيل الثاني, منشورات الشهاب) : نشاط 4 p. 57, معارف 5 p. 60, طرائق 4 et 5 p. 61, أوظّف pp. 61–64, أؤكّد p. 65, أتعمّق p. 67.
 * Source de vérité : docs/sources/2am/unit4/extraction.json ; plan : docs/sources/2am/unit4/plan/hall-mushkil-muadala.md.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter–§4quinquies) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : « خطّ العصير » — à la coopérative d'oranges, un réservoir de 18 L doit remplir exactement 12 bouteilles. La capacité du MOULE est l'INCONNUE x : la main l'étire (deux essais seulement : un essai raté gâche des bouteilles), le remplissage dit
 *   combien de bouteilles sont pleines, la bouteille partielle et le jus resté — c'est l'équation lue dans le monde : 12 bouteilles de x litres font 18 litres, 12 × x = 18, ou 18 ÷ x = 12 (les deux cartes sont justes). Puis l'opération inverse :
 *   x = 18 ÷ 12 = 1,5 ; le remplissage de contrôle est exact, c'est « حلّ ». متقدم : le RÉSERVOIR est sous la main (le dividende manquant : x ÷ 24 = 0,25 → x = 24 × 0,25) et enfin deux opérations : (4 + x) ÷ 0,25 = 40, on défait la DERNIÈRE d'abord.
 *   Rejetées : (a) l'activité 4 du manuel (des œufs en plateaux, trois équations à associer) : une lecture, et le monde des œufs est `egg-trays` (2AM unité 2) → ses équations multiples vivent dans les cartes du labo et dans un exercice ; (b) une balance (4AM
 *   `equation-balance`) et (c) une sonde sur une droite (4AM `solution-ray`) : l'essai sans raison de calculer.
 *   Ordre des idées : un essai avec une capacité → ce que dit le remplissage → l'équation (deux écritures) → l'opération inverse → le remplissage de contrôle = « حلّ » → l'inconnue dans le réservoir (ضرب) → deux étapes → معارف (équation, solution, les trois
 *   formes) → طريقة (traduire, a ÷ x = b, x ÷ a = b, a × x = b, deux étapes) → pratique, trois مسائل, test.
 *
 * HISTOIRE DES الكفاءات (positions gardées : les identifiants sont positionnels) — brouillon → texte final :
 *   P1  « ترجمة وضعية بمعادلة بعد تسمية المجهول بحرف » → + l'exemple « 60 قارورة متماثلة سعتها الكلّية 45 لترًا : 60 × x = 45 » ;
 *   P2  « التعرّف على حلّ معادلة كقيمة تجعل المساواة صحيحة » → + « et la vérifier en faisant l'UNE opération » (jamais le test d'une égalité à deux membres : c'est `ikhtibar-musawat-mutabayina`) ;
 *   P3  « حلّ معادلات من الشكل a × x = b و x/a = b و a/x = b ... » → + l'opération inverse nommée par forme et, par décision, la معادلة à deux opérations (2x + 240 = 300) en défaisant la dernière opération d'abord (question 2 du plan de l'unité).
 * Le réseau : item `2am.m4.r08` (extends `1am.m5.r10`, valeur ajoutée « إتمام مساواة بالقسمة a ÷ … = b بأعداد عشرية ») → « تذكّر — السنة الأولى » avec lien depuis le 2026-10-30 (`bahth-adad-naqisa` est publiée) ; « أستعدّ » mesure `1am.m5.r10` (items 1, 2).
 * 2026-10-30 : `bahth-adad-naqisa` (1AM, 1am.m5.r10) est publiée — arêtes LP P2 ← 1am_bahth-adad-naqisa_P3 (la vérification par substitution) et P3 ← 1am_bahth-adad-naqisa_P2 et _P3 (l'opération inverse ;
 *   l'équation à deux opérations défait d'abord la dernière) le long du lien du réseau 1am.m5.r10 → 2am.m4.r08 (`extends`) ; le « تذكّر — السنة الأولى » devient un lien vers la leçon.
 * Entre leçons de la MÊME année, sans lien du réseau : P1 ← 2am_ibara-harfiya-intaj_P1 (écrire une expression de l'inconnue avant l'équation). Arêtes 1AM : voir la ligne du 2026-10-30 ci-dessus.
 * Successeur (à connecter par le coordinateur) : 3AM `muadalat-darajat-ula` (net `2am.m4.r08 → 3am.m5.r06`).
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab/hall-mushkil-muadala';

export const LESSON_CONFIG = {
  id: 'hall-mushkil-muadala',
  kind: 'lesson',
  unit: 'mafhum-muadala',
  unitTitle: 'مفهوم معادلة',
  sequentialUnlock: true,
  title: 'حلّ مشكل باستعمال معادلة',
  description: 'نملأ قوارير العصير من خزّان في معصرة تعاونية ونكتب المعادلة التي تعطي سعة القارورة، ثم نحلّ المعادلات من الأشكال الثلاثة ونتحقّق من الحلّ.',
  level: 'moyen',
  grade: '2am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🧃',
  estimatedDurationMin: 66,
  textbookRef: { unit: 4, activity: 57, pages: '57, 60, 61' },
  skills: [
    'ترجمة وضعية بمعادلة بعد تسمية المجهول بحرف، مثل «$60$ قارورة متماثلة سعتها الكلّية $45$ لترًا»: $60\\times x=45$',
    'التعرّف على حلّ معادلة: القيمة التي تجعل المساواة صحيحة، والتحقّق منها بإنجاز العملية، مثل $3$ حلّ للمعادلة $\\frac{12}{x}=4$ لأنّ $12\\div3=4$',
    'حلّ معادلات من الشكل $a\\times x=b$ و $\\frac xa=b$ و $\\frac ax=b$ بالعملية العكسية، مثل $\\frac{489}{x}=163$ ومنه $x=3$ ، ثمّ معادلة من خطوتين مثل $2x+240=300$ بإلغاء آخر عملية أوّلًا',
  ],
  teachingScope: {
    include: ['ترجمة وضعية بمعادلة بعد تسمية المجهول بحرف', 'حلّ معادلة وكون الحلّ قيمة تجعل المساواة صحيحة، والتحقّق بإنجاز العملية', 'حلّ $a\\times x=b$ و $\\frac xa=b$ و $\\frac ax=b$ بأعداد عشرية بالعملية العكسية', 'معادلة من خطوتين مثل $2x+240=300$ بإلغاء آخر عملية أوّلًا'],
    exclude: ['اختبار مساواة بعضوين أو متباينة (الدرس: اختبار صحة مساواة أو متباينة)', 'معادلة فيها المجهول في الطرفين (السنة الثالثة)', 'نقل الحدود وإجراء العملية نفسها على الطرفين (السنة الثالثة)', 'الحلول السالبة والأعداد السالبة'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js).
  lessonProblem: {
    module: 5,
    title: 'خطوات الروبوت',
    statement: 'طول خطوة ياسين $0{,}6\\,\\mathrm{m}$ ، وطول خطوة روبوته ثلاثة أضعافها. ينطلقان معًا ويخطوان العدد نفسه من الخطوات $x$ .',
    questions: [
      { label: '1)', text: 'احسب طول خطوة الروبوت.' },
      { label: '2)', text: 'بكم يتقدّم الروبوت على ياسين بعد خطوة واحدة؟' },
      { label: '3)', text: 'اكتب المعادلة التي تعطي عدد الخطوات $x$ التي يتقدّم بعدها الروبوت على ياسين بـ $18\\,\\mathrm{m}$ .' },
      { label: '4)', text: 'احسب $x$ .' },
      { label: '5)', text: 'تحقّق من النتيجة.' },
    ],
    illustration: { kind: 'tags', cards: [{ title: 'ياسين', icon: 'leaf', lines: [{ label: 'طول الخطوة', value: '0,6', unit: 'm' }] }, { title: 'الروبوت', icon: 'leaf', lines: [{ label: 'طول الخطوة', value: 'ثلاثة أضعاف', unit: '' }] }], ariaLabel: 'بطاقتان: خطوة ياسين ستة أعشار المتر وخطوة الروبوت ثلاثة أضعافها' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : le lien « راجع » du réseau `1am.m5.r10` (العدد الناقص, items 1 et 2 ; leçon 1AM publiée), la division par un décimal (`kasr-hasil-qisma`, item 3), × et ÷ (item 4), une longueur en x (item 5) et la valeur d'une expression (item 6).
  priorKnowledge: ['bahth-adad-naqisa-1am', 'qisma-ala-ushri-2am', 'darb-qisma-ilaqa', 'ibara-harfiya-2am'],
  resources: [
    // Module 1 — WORKSPACE À DEUX NIVEAUX, un seul type `juice-line` (la main tient l'INCONNUE x : la capacité du moule, puis le contenu du réservoir) :
    //   مبتدئ — t1 18 L → 12 bouteilles (1,5) · t2 30 L → 40 (0,75) · t3 9 L → 36 (0,25), deux essais, puis l'opération et les cartes d'équations.
    //   متقدم — l'ardoise d'abord : a1 24 bouteilles de 0,25 L (6 L) · a2 15 de 1,5 L (22,5 L) · a3 4 L déjà dans le réservoir (4 + x = 10, x = 6).
    {
      kind: 'manipulation', code: 'juice-line-build', type: 'juice-line', module: 1,
      level: 'beginner',
      title: 'خطّ العصير: سعة القارورة المجهولة',
      objective: 'نكتشف كيف نجد عددًا مجهولًا دون تجريب أعمى: ما يقوله الملء يُكتب معادلة، والعدد الناقص نجده بالعملية العكسية',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'juicery' },
      learningPointIds: ['2am_hall-mushkil-muadala_P1', '2am_hall-mushkil-muadala_P3'],
      sourceElementIds: ['act-4', 'ex-34'],
    },
    {
      kind: 'manipulation', code: 'juice-line-predict', type: 'juice-line', module: 1,
      level: 'advanced',
      title: 'خطّ العصير: أكتب العملية ثم أتحقّق',
      objective: 'نكتشف كيف نجد عددًا مجهولًا دون تجريب أعمى: ما يقوله الملء يُكتب معادلة، والعدد الناقص نجده بالعملية العكسية',
      autonomy: 'يكتب التلميذ العملية التي تعطي كمية الخزّان قبل أن يضبطه، ثم يتحقّق بملء حقيقي، ويحلّ معادلة من خطوتين بإلغاء آخر عملية أوّلًا',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'juicery' },
      learningPointIds: ['2am_hall-mushkil-muadala_P1', '2am_hall-mushkil-muadala_P3'],
      sourceElementIds: ['method-5', 'ex-35'],
    },
    {
      kind: 'manipulation', code: 'juice-line-maarif', type: 'juice-line', module: 2,
      title: 'خطّ العصير: المعادلة وحلّها',
      objective: 'نكتشف كيف نجد عددًا مجهولًا دون تجريب أعمى: ما يقوله الملء يُكتب معادلة، والعدد الناقص نجده بالعملية العكسية',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'juicery' },
      learningPointIds: ['2am_hall-mushkil-muadala_P2', '2am_hall-mushkil-muadala_P3'],
      sourceElementIds: ['know-5'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — خطوات الروبوت', learningPointIds: ['2am_hall-mushkil-muadala_P1', '2am_hall-mushkil-muadala_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — سياج قطعة الأرض', learningPointIds: ['2am_hall-mushkil-muadala_P1', '2am_hall-mushkil-muadala_P3'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — قوارير زيت الزيتون', learningPointIds: ['2am_hall-mushkil-muadala_P1', '2am_hall-mushkil-muadala_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ العدد الناقص في مساواة، والقسمة على عدد عشري، والضرب والقسمة، وطول بدلالة x.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — خطّ العصير', desc: 'املأ القوارير من خزّان معصرة تعاونية ثم اكتب العملية التي تعطي سعة القارورة المجهولة.',
      stage: 'trigger', teachesLearningPointIds: ['2am_hall-mushkil-muadala_P1', '2am_hall-mushkil-muadala_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 18, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — المعادلة وحلّها', desc: 'معنى المعادلة وحلّها، والتحقّق بإنجاز العملية، والأشكال الثلاثة.',
      stage: 'discovery', teachesLearningPointIds: ['2am_hall-mushkil-muadala_P2', '2am_hall-mushkil-muadala_P3'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أترجم وأحلّ وأتحقّق', desc: 'من الكلمات إلى المعادلة، وحلّها بالعملية العكسية، والتحقّق، ومعادلة من خطوتين.',
      stage: 'formalization', teachesLearningPointIds: ['2am_hall-mushkil-muadala_P1', '2am_hall-mushkil-muadala_P2', '2am_hall-mushkil-muadala_P3'],
      color: 'sky', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'ستة تمارين: علب التمر، والأشكال الثلاثة، وقاسم مجهول، والعدد الناقص، وهل هو حلّ؟، ومستطيل.',
      stage: 'practice_lab', teachesLearningPointIds: ['2am_hall-mushkil-muadala_P1', '2am_hall-mushkil-muadala_P2', '2am_hall-mushkil-muadala_P3'],
      color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — خطوات الروبوت', desc: 'مسألة الدرس: فرق يتكرّر مع كلّ خطوة يؤول إلى معادلة جداء.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_hall-mushkil-muadala_P1', '2am_hall-mushkil-muadala_P3'],
      color: 'amber', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — سياج قطعة الأرض', desc: 'بُعد مجهول من محيط معلوم بمعادلة من خطوتين، ثم ثمن السياج.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_hall-mushkil-muadala_P1', '2am_hall-mushkil-muadala_P3'],
      color: 'amber', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — قوارير زيت الزيتون', desc: 'قاسم مجهول بأعداد عشرية: سعة القارورة ثم عدد القوارير لسعات أخرى.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_hall-mushkil-muadala_P1', '2am_hall-mushkil-muadala_P3'],
      color: 'amber', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
