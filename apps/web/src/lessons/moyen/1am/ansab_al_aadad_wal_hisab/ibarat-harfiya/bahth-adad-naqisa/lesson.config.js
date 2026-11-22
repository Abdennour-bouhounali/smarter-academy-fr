/**
 * الدرس — البحث عن أعداد ناقصة (1AM, unité 6 « الحساب الحرفي »). Le PREMIER درس de l'unité généré (ordre 24 du catalogue ; l'entrée ouvre l'unité dans l'ordre de génération), généré DANS son entrée du catalogue
 * (item 1am.m5.r10), cycle moyen phase 3, 1AM paire 2 B, 2026-10-30 ; il OUVRE le dossier `_unit/` et l'extraction `docs/sources/1am/unit6/`.
 * Manuel 1AM (الجيل الثاني) : نشاط 1 p. 79 (trois situations → trois égalités), طريقة et « دوري الآن » p. 82, section « البحث عن أعداد ناقصة » ex. 15–18 p. 84, أقوّم تعلّماتي 5 p. 85,
 * أتعمّق 1, 6 et 7 p. 86. Le manuel n'a pas de معارف pour cette leçon : le module 2 est une plateforme-addition (les noms de ce que l'élève vient de faire sur le tapis).
 * Source : docs/sources/1am/unit6/extraction.json ; brief des auteurs : docs/sources/1am/unit6/brief-authors.md.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours, et la leçon ne renvoie jamais au livre (§4ter-bis) : tout est réécrit, autres contextes, autres nombres.
 *   Entrée retenue : un atelier de conditionnement de fournitures scolaires (labo `rewind-belt`, thème `packingline`). Une machine à carte (« ⁦+ 9⁩ », « ⁦− 14⁩ », « ⁦× 6⁩ ») a reçu un nombre d'objets et a rendu 54 : la main
 *   CHOISIT la carte qui fait tourner le tapis à rebours, TIRE la caisse jusqu'au bac d'entrée (le nombre manquant □ apparaît), puis la REPOUSSE à travers la machine d'origine (la contre-épreuve : elle doit rendre 54). La carte
 *   piège « ⁦80 −⁩ » montre que dans « a − □ = b » on ne prend pas l'inverse du moins : on retranche le résultat de a. متقدم : décimaux, « ⁦12,5 −⁩ », et la division qui ne s'arrête pas (20 ÷ 7 : un quotient FRACTIONNAIRE,
 *   comme dans `hasil-qisma-kasr`), vérifié exactement. Les trois situations des œufs du manuel (54 œufs sur 9 plateaux ; 54 − □ = 9 ; □ + 9 = 54) sont REPRISES par أتمرّن 1 avec d'autres contextes : le livre est la référence, pas l'entrée.
 *   Rejetées : (a) le jeu « trois situations → trois égalités » comme ENTRÉE (la main ne tient rien : on relie des textes à des formules) — il devient une APPLICATION de ce que le tapis a montré ; (b) tout renvoi à une LETTRE (x, a, b)
 *   dans la leçon : ce sont les leçons suivantes de l'unité (`tatbiq-qaida-harfiya`, `intaj-ibara-harfiya`) ; ici le manquant est □ ; (c) la voiture à tempérament du manuel (`deep-1`) : redessinée en mensualités égales d'un club d'informatique.
 *   Ordre des idées : le tapis avec une somme (P2, P1) → une différence « □ − a » → un produit (P3) → la carte piège « a − □ » (P2) → décimaux et fraction (P2, P3) → معارف (les noms : le nombre manquant, les trois formes et leur
 *   opération inverse, la contre-épreuve) → طريقة (traduire, remonter, vérifier, répondre) → أتمرّن → trois مسائل (l'atelier de stylos, les mensualités, l'escalier : un programme à DEUX cartes remonté dans l'ordre inverse) → إختبار أولي.
 *   « أستعدّ » mesure `1am.m1.r05` (additionner, soustraire, multiplier des décimaux : items 1–3) et `1am.m5.r01` (l'écriture fractionnaire d'un nombre, d'un quotient : items 4–6) — les deux items du réseau qui précèdent r10 (`LEARNING_NET.md` §4).
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/1am/ansab_al_aadad_wal_hisab/bahth-adad-naqisa';

export const LESSON_CONFIG = {
  id: 'bahth-adad-naqisa',
  kind: 'lesson',
  unit: 'ibarat-harfiya',
  unitTitle: 'الحساب الحرفي',
  sequentialUnlock: true,
  title: 'البحث عن أعداد ناقصة',
  description: 'في ورشة تعبئة آلة ببطاقة عملية أخرجت عددًا معلومًا: نُرجع الحزام إلى الوراء بالعملية العكسية فنجد العدد الذي دخل، ثمّ نتحقّق بالتعويض. نكتشف العدد الناقص في مجموع وفي فرق وفي جداء، وحالة « a − □ » التي لا تُحلّ بعكس الإشارة.',
  level: 'moyen',
  grade: '1am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🔎',
  estimatedDurationMin: 84,
  textbookRef: { unit: 6, activity: 1, pages: '77, 79, 82, 84, 85, 86' },
  skills: [
    'ترجمة وضعية إلى مساواة فيها عدد ناقص مثل $\\square+9=54$ أو $6\\times\\square=54$',
    'إيجاد العدد الناقص في مجموع بالطرح، وفي فرق بالجمع أو بالطرح',
    'إيجاد العدد الناقص في جداء بالقسمة (ولو كان الناتج كسرًا) والتحقق من كلّ نتيجة بالتعويض',
  ],
  teachingScope: {
    include: ['المساواة التي فيها عدد ناقص □', 'العدد الناقص في مجموع وفرق وجداء', 'العملية العكسية', 'التحقق بالتعويض', 'أعداد طبيعية وعشرية وناتج قسمة كسري', 'برنامج حساب من خطوتين يُرجَع خطوة خطوة'],
    exclude: ['الحروف والعبارات الحرفية (الدرسان التاليان من الوحدة)', 'تطبيق قاعدة حرفية بتعويض أعداد (درس «تطبيق قاعدة حرفية»)', 'حلّ المعادلات بمجهول x (السنة الثانية)', 'العدد الناقص في قسمة a ÷ □ = b (السنة الثانية)'],
  },
  // « مسألة الدرس » : ورشة تعبئة الأقلام وثلاث آلات (module 5).
  lessonProblem: {
    module: 5,
    title: 'ورشة الأقلام',
    statement: 'في ورشة لتعبئة الأقلام المدرسية ثلاث آلات. آلة الإضافة بطاقتها « ⁦+ 15⁩ » وقد أخرجت 72 قلمًا. وآلة الفحص بطاقتها « ⁦− 8⁩ » تُخرج 8 أقلام معيبة، وقد بقي بعدها 59 قلمًا. وآلة التغليف بطاقتها « ⁦× 12⁩ » تضع 12 قلمًا في كلّ علبة، وقد أخرجت 156 قلمًا. للورشة 3 مخازن.',
    questions: [
      { label: '1)', text: 'اكتب المساواة التي تترجم آلة الإضافة، ثمّ جد عدد الأقلام التي دخلتها.' },
      { label: '2)', text: 'جد عدد الأقلام التي دخلت آلة الفحص، ثمّ تحقّق من نتيجتك.' },
      { label: '3)', text: 'جد عدد العلب التي دخلت آلة التغليف.' },
    ],
    illustration: { kind: 'tags', cards: [
      { title: 'آلة الإضافة', icon: 'house', lines: [{ label: 'البطاقة', value: '+ 15', unit: '' }, { label: 'خرج', value: '72', unit: 'قلمًا' }] },
      { title: 'آلة الفحص', icon: 'house', lines: [{ label: 'البطاقة', value: '− 8', unit: '' }, { label: 'بقي', value: '59', unit: 'قلمًا' }] },
      { title: 'آلة التغليف', icon: 'house', lines: [{ label: 'البطاقة', value: '× 12', unit: '' }, { label: 'خرج', value: '156', unit: 'قلمًا' }] },
    ], ariaLabel: 'ثلاث آلات: الأولى بطاقتها زائد خمسة عشر وقد أخرجت اثنين وسبعين قلمًا، والثانية بطاقتها ناقص ثمانية وقد بقي بعدها تسعة وخمسون قلمًا، والثالثة بطاقتها ضرب في اثني عشر وقد أخرجت مئة وستة وخمسين قلمًا' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : `1am.m1.r05` (additionner, soustraire, multiplier des décimaux) et `1am.m5.r01` (l'écriture fractionnaire d'un nombre).
  priorKnowledge: ['jam-tarh-darb-ashriya-1am', 'kitaba-kasriya-adad-1am'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `rewind-belt` (la main choisit la carte inverse puis tire la caisse), monde `packingline` :
    //   مبتدئ — b1 « ⁦+ 9⁩ » donne 54 · b2 « ⁦− 14⁩ » donne 54 · b3 « ⁦× 6⁩ » donne 54 · b4 la carte piège « ⁦80 −⁩ » donne 54.
    //   متقدم — a1 décimaux « ⁦+ 17,5⁩ » donne 46,2 · a2 « ⁦12,5 −⁩ » donne 4,8 · a3 « ⁦× 7⁩ » donne 20 (20 ÷ 7 ne s'arrête pas : la fraction 20/7).
    {
      kind: 'manipulation', code: 'rewind-belt-find', type: 'rewind-belt', module: 1,
      level: 'beginner',
      title: 'ورشة التعبئة: من أين دخلت الأشياء؟',
      objective: 'نُرجع حزام آلة ببطاقة عملية إلى الوراء بالبطاقة العكسية حتى يظهر العدد الذي دخل، ثمّ ندفع الصندوق إلى الأمام لنتحقّق بالتعويض',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'packingline' },
      learningPointIds: ['1am_bahth-adad-naqisa_P1', '1am_bahth-adad-naqisa_P2', '1am_bahth-adad-naqisa_P3'],
      sourceElementIds: ['act-1', 'method-1'],
    },
    {
      kind: 'manipulation', code: 'rewind-belt-decimal', type: 'rewind-belt', module: 1,
      level: 'advanced',
      title: 'ورشة التعبئة: عشريات وقسمة لا تتوقّف',
      objective: 'نُرجع حزام آلة ببطاقة عملية إلى الوراء بالبطاقة العكسية حتى يظهر العدد الذي دخل، ثمّ ندفع الصندوق إلى الأمام لنتحقّق بالتعويض',
      autonomy: 'يُرجع التلميذ آلات بأعداد عشرية وبطاقة « a − » دون أن يرى أيّ بطاقة هي الصحيحة، ويكتشف أنّ قسمة 20 على 7 لا تتوقّف فيكتب الناتج كسرًا ويتحقّق به',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'packingline' },
      learningPointIds: ['1am_bahth-adad-naqisa_P1', '1am_bahth-adad-naqisa_P2', '1am_bahth-adad-naqisa_P3'],
      sourceElementIds: ['act-1', 'method-1', 'now-82'],
    },
    // Module 3 — le MÊME instrument posé seul (`levels={false}`) : deux tâches de la méthode (un décimal à ajouter, un produit décimal).
    {
      kind: 'manipulation', code: 'rewind-belt-method', type: 'rewind-belt', module: 3,
      title: 'أجد العدد الناقص وأتحقّق',
      learningPointIds: ['1am_bahth-adad-naqisa_P2', '1am_bahth-adad-naqisa_P3'],
      sourceElementIds: ['method-1'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — ورشة الأقلام', learningPointIds: ['1am_bahth-adad-naqisa_P1', '1am_bahth-adad-naqisa_P2', '1am_bahth-adad-naqisa_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — مشتريات نادي الإعلام الآلي', learningPointIds: ['1am_bahth-adad-naqisa_P1', '1am_bahth-adad-naqisa_P2', '1am_bahth-adad-naqisa_P3'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — درج المكتبة', learningPointIds: ['1am_bahth-adad-naqisa_P1', '1am_bahth-adad-naqisa_P2', '1am_bahth-adad-naqisa_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ جمع وطرح وضرب الأعداد العشرية، والكتابة الكسرية لحاصل قسمة.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — الحزام المعاكس', desc: 'آلة في ورشة تعبئة أخرجت عددًا معلومًا: أُرجع الحزام بالبطاقة المناسبة، أجد ما دخل، وأتحقّق بدفع الصندوق إلى الأمام.',
      stage: 'trigger', teachesLearningPointIds: ['1am_bahth-adad-naqisa_P1', '1am_bahth-adad-naqisa_P2', '1am_bahth-adad-naqisa_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 1, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — العدد الناقص', desc: 'ما العدد الناقص □، وكيف نجده في مجموع وفي فرق وفي جداء بالعملية العكسية، ولماذا نتحقّق دائمًا بالتعويض.',
      stage: 'discovery', teachesLearningPointIds: ['1am_bahth-adad-naqisa_P1', '1am_bahth-adad-naqisa_P2', '1am_bahth-adad-naqisa_P3'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أجد وأتحقّق', desc: 'أترجم الوضعية بمساواة، أُرجع بالعملية العكسية، أتحقّق بالتعويض ثمّ أجيب: أربعة أفعال.',
      stage: 'formalization', teachesLearningPointIds: ['1am_bahth-adad-naqisa_P1', '1am_bahth-adad-naqisa_P2', '1am_bahth-adad-naqisa_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'ربط وضعيات بمساويات، مجاميع وفروق وجداءات ناقصة، مستطيل ناقص عرضه، التحقّق بالتعويض وجدار البلاطات.',
      stage: 'practice_lab', teachesLearningPointIds: ['1am_bahth-adad-naqisa_P1', '1am_bahth-adad-naqisa_P2', '1am_bahth-adad-naqisa_P3'],
      color: 'amber', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — ورشة الأقلام', desc: 'مسألة الدرس: ثلاث آلات: الإضافة، الفحص، التغليف.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_bahth-adad-naqisa_P1', '1am_bahth-adad-naqisa_P2', '1am_bahth-adad-naqisa_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — مشتريات نادي الإعلام الآلي', desc: 'مقدّم ثمّ دفعات متساوية: مجهول بعد مجهول.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_bahth-adad-naqisa_P1', '1am_bahth-adad-naqisa_P2', '1am_bahth-adad-naqisa_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — درج المكتبة', desc: 'قاعدة الدرج: برنامج بخطوتين يُرجَع إلى الوراء.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_bahth-adad-naqisa_P1', '1am_bahth-adad-naqisa_P2', '1am_bahth-adad-naqisa_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
