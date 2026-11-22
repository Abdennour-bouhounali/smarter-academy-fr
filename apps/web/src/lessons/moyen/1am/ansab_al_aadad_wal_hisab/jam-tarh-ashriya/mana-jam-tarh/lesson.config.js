/**
 * الدرس — معنى الجمع والطرح (1AM, unité 2 « الحساب على الأعداد الطبيعية والأعداد العشرية: الجمع والطرح »).
 * Manuel 1AM (الجيل الثاني) : نشاط 1 p. 25, معارف 1 p. 26 (le sens et les mots ; la technique est la leçon suivante),
 * طريقة p. 29 et son دوري الآن, exercices 1, 16, 17 p. 30, أتعمّق 8 p. 32 ; أقوّم تعلّماتي 6, 7, 8 p. 31 au إختبار أولي.
 * Première leçon 1AM générée (cycle moyen, phase 3, 2026-10-14) DANS son entrée du catalogue
 * (lessons_1am_2026_2027.json : même code, mêmes items 1am.m1.r01 et 1am.m1.r05).
 * Source de vérité : docs/sources/1am/unit2/extraction.json.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-14) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : la toise de la visite médicale (plateforme) — l'élève TIRE la taille inconnue jusqu'à ce que la phrase
 *   soit vraie (« تزيد » et pourtant 130 − 9), puis choisit le calcul : le piège du mot devient nécessaire sous sa main.
 *   Rejetée : le نشاط 1 du manuel comme entrée (six textes jugés sur le papier, la réponse se devine à la mémoire) ; il reste
 *   le niveau متقدم du même labo, posé après la toise. Ordre des idées : toise (le mot ne décide pas) → POURQUOI pour les
 *   textes ③ et ① (le tout) → la règle (brique APRÈS la classification) → les noms (معارف) → la méthode p. 29 (labo en tête,
 *   la brique de la méthode après le choix de la place de □) → exercices.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : la toise de la visite médicale (plateforme) — l'élève TIRE la taille inconnue jusqu'à ce que la phrase
 *   soit vraie (« تزيد » et pourtant 130 − 9), puis choisit le calcul : le piège du mot devient nécessaire sous sa main.
 *   Rejetée : le نشاط 1 du manuel comme entrée (six textes jugés sur le papier, la réponse se devine de mémoire) ; il reste
 *   le niveau متقدم du même labo, posé après la toise. Ordre des idées : toise (le mot ne décide pas) → POURQUOI pour les
 *   textes ③ et ① (le tout) → classification puis la règle (brique APRÈS la réponse) → les noms (معارف) → la méthode p. 29
 *   (labo en tête, la brique de la méthode après le choix de la place de □) → exercices.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/1am/ansab_al_aadad_wal_hisab/mana-jam-tarh';

export const LESSON_CONFIG = {
  id: 'mana-jam-tarh',
  kind: 'lesson',
  unit: 'jam-tarh-ashriya',
  unitTitle: 'الحساب على الأعداد الطبيعية والأعداد العشرية: الجمع والطرح',
  sequentialUnlock: true,
  title: 'معنى الجمع والطرح',
  description: 'نختار الجمع أو الطرح من بنية الوضعية لا من الكلمات: المجهول هو الكلّ فنجمع، أو جزء فنطرح. نسمّي المجموع والفرق وحدودهما، ونمثّل « يزيد، ينقص، أكثر، أقل » بمخطط بأقواس قبل الحساب.',
  level: 'moyen',
  grade: '1am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '➕',
  estimatedDurationMin: 80,
  textbookRef: { unit: 2, activity: 1, pages: '24, 25, 26, 29, 30, 31' },
  skills: [
    'اختيار العملية المناسبة (جمع أو طرح) لحلّ مشكلة من الحياة اليومية بأعداد طبيعية أو عشرية',
    'استعمال المفردات: مجموع، فرق، حدّا المجموع، حدّا الفرق، حدود، في وصف عملية',
    'ترجمة عبارات « يزيد، ينقص، أكثر، أقل » بمخطط بأقواس قبل الحساب',
  ],
  teachingScope: {
    include: ['معنى الجمع والطرح: الكلّ والأجزاء في وضعية', 'مفردات المجموع والفرق وحدودهما', 'التمثيل بقطع مستقيمات (مخطط بأقواس) قبل الحساب'],
    exclude: ['تقنية الجمع والطرح أفقيا وعموديا والحساب على المدد (الدرس التالي)', 'رتبة مقدار مجموع أو فرق (الدرس الثالث)'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, rappelée au module 1, résolue pas à pas au module 5 (content/problems.js).
  // Elle prolonge le niveau متقدم (les textes du نشاط 1 : un budget où « ينقص » appelle une addition).
  lessonProblem: {
    module: 5,
    title: 'مكتبة القسم: 2450 دج',
    statement: 'تعاون تلاميذ قسم السنة الأولى متوسط فجمعوا 2450 دج لإثراء مكتبة القسم وتشجيع المطالعة. اشتروا قاموسًا ثمنه 1275 دج وقصصًا، فبقي معهم 380 دج. وأرادوا بعد ذلك شراء لعبة شطرنج للقسم، فوجدوا أنّ المبلغ الباقي ينقصه 140 دج لشرائها. المكتبة مفتوحة 3 أيام في الأسبوع.',
    questions: [
      { label: '1)', text: 'ما المبلغ الذي صرفه التلاميذ؟ مثّل الوضعية بمخطط بأقواس قبل الحساب.' },
      { label: '2)', text: 'احسب ثمن القصص. بكم يزيد ثمن القاموس عن ثمن القصص؟' },
      { label: '3)', text: 'ما ثمن لعبة الشطرنج؟ علّل اختيارك للعملية.' },
    ],
    illustration: { kind: 'tags', cards: [{ title: 'ما جمعه التلاميذ', icon: 'coin', lines: [{ label: 'المبلغ', value: 2450, unit: 'دج' }] }, { title: 'القاموس', icon: 'book', lines: [{ label: 'الثمن', value: 1275, unit: 'دج' }] }, { title: 'الباقي', icon: 'coin', lines: [{ label: 'المبلغ', value: 380, unit: 'دج' }, { label: 'ينقصه للشطرنج', value: 140, unit: 'دج' }] }], ariaLabel: 'ثلاث بطاقات: ما جمعه التلاميذ 2450 دج، ثمن القاموس 1275 دج، والباقي 380 دج الذي ينقصه 140 دج لشراء لعبة الشطرنج' },
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : le sens du جمع/طرح du primaire (manuel p. 24, items 1, 2, 8) et l'item du réseau
  // `1am.m1.r03` (×/÷ par 10, 100, 1000 — leçon « الكسور العشرية والكتابة العشرية »).
  priorKnowledge: ['jam-tarh-tabii', 'darb-qisma-ashara'],
  resources: [
    // Module 1 — WORKSPACE À DEUX NIVEAUX (MANIPULATION_CONTRACT §7bis-levels), un seul type `story-bars` :
    //   مبتدئ — la toise du FAHS TIBBI (plateforme) : l'élève TIRE la taille inconnue jusqu'à ce que la phrase soit vraie,
    //           puis choisit le calcul ; nزيم (« تزيد » mais −) et ياسين (« تنقص » mais +) sont les pièges.
    //   متقدم — les six textes et les six bulles du نشاط 1 (p. 25) : sans toise ni lecture, l'élève décide l'opération,
    //           la bande la juge.
    {
      kind: 'manipulation', code: 'story-bars-checkup', type: 'story-bars', module: 1,
      level: 'beginner',
      title: 'الفحص الطبي: من الأطول؟',
      objective: 'المجهول هو الكلّ ⇐ نجمع الجزأين؛ المجهول جزء ⇐ نطرح الجزء الآخر من الكلّ، مهما كانت الكلمة (يزيد، ينقص)',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'checkup' },
      learningPointIds: ['1am_mana-jam-tarh_P1', '1am_mana-jam-tarh_P3'],
      sourceElementIds: ['act-1'],
    },
    {
      kind: 'manipulation', code: 'story-bars-act1', type: 'story-bars', module: 1,
      level: 'advanced',
      title: 'نشاط 1: ستة نصوص وست عمليات',
      objective: 'المجهول هو الكلّ ⇐ نجمع الجزأين؛ المجهول جزء ⇐ نطرح الجزء الآخر من الكلّ، مهما كانت الكلمة (يزيد، ينقص)',
      autonomy: 'لا مقياس ولا قراءة: يقرّر التلميذ العملية لكل نصّ من نصوص الكتاب الستة بأعداد عشرية قبل أن يرى المخطط، والمخطط يحكم فقط',
      experience: { type: 'textbook', reason: '' },
      learningPointIds: ['1am_mana-jam-tarh_P1'],
      sourceElementIds: ['act-1'],
    },
    // Module 3 — la طريقة p. 29 dans le MÊME instrument, posé seul (`levels={false}`) : les tailles de يونس et محمد.
    {
      kind: 'manipulation', code: 'story-bars-method29', type: 'story-bars', module: 3,
      title: 'طريقة الكتاب: قامات أكرم ويونس ومحمد',
      learningPointIds: ['1am_mana-jam-tarh_P3'],
      sourceElementIds: ['method-3'],
    },
    // Modules 5–7 — les « مسائل » : exercices complets de type امتحان, ajouts de la plateforme (content/problems.js).
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — مكتبة القسم', learningPointIds: ['1am_mana-jam-tarh_P1', '1am_mana-jam-tarh_P2', '1am_mana-jam-tarh_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — حافلة الرحلة المدرسية', learningPointIds: ['1am_mana-jam-tarh_P1', '1am_mana-jam-tarh_P3'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — حملة جمع الملابس', learningPointIds: ['1am_mana-jam-tarh_P1', '1am_mana-jam-tarh_P2', '1am_mana-jam-tarh_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'خمس عبارات: صحيح أم خاطئ؟ معنى الجمع والطرح، والضرب والقسمة على 10 و 100.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط 1 — أيّ حساب أقوم به؟', desc: 'من الأطول؟ اسحب القامة حتى تصدق الجملة، ثم اختر الحساب. «يزيد» هل تعني دائمًا أن نجمع؟',
      stage: 'trigger', teachesLearningPointIds: ['1am_mana-jam-tarh_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 1, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — المجموع والفرق', desc: 'ماذا نسمّي نتيجة الجمع؟ والطرح؟ وماذا نسمّي العددين؟',
      stage: 'discovery', teachesLearningPointIds: ['1am_mana-jam-tarh_P2'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 1, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — حلّ مشكلة بتمثيل مناسب', desc: 'هدى أم إيناس؟ نرسم القطع قبل أن نحسب.',
      stage: 'formalization', teachesLearningPointIds: ['1am_mana-jam-tarh_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أتمرّن', desc: 'تمارين الكتاب 1، 16 و 17، وتمرين من أتعمّق.',
      stage: 'practice_lab', teachesLearningPointIds: ['1am_mana-jam-tarh_P1', '1am_mana-jam-tarh_P2', '1am_mana-jam-tarh_P3'],
      color: 'amber', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — مكتبة القسم', desc: 'مسألة الدرس: 2450 دج، قاموس وقصص، وما ينقص للشطرنج.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_mana-jam-tarh_P1', '1am_mana-jam-tarh_P2', '1am_mana-jam-tarh_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — حافلة الرحلة المدرسية', desc: 'المسافة المتبقية، الفرق بين المسافتين، وطريق العودة الأقصر.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_mana-jam-tarh_P1', '1am_mana-jam-tarh_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — حملة جمع الملابس', desc: 'أكثر بـ… أقل بـ…: كتلة كل قسم، ثم المجموع.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_mana-jam-tarh_P1', '1am_mana-jam-tarh_P2', '1am_mana-jam-tarh_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
