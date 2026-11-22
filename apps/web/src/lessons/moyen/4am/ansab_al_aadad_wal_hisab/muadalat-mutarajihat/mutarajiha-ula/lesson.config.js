/**
 * الدرس 3 — المتراجحات من الدرجة الأولى بمجهول واحد وتمثيل حلولها بيانيًا
 * Unité 4 du manuel (4AM) : نشاط 3 (p. 45 : « المتراجحة وحلولها » et « حل متراجحة »),
 * معارف 3 et 4 (p. 48), طرائق p. 49 (حل متراجحة, دوري الآن 1), exercices 21–29, 31,
 * 32 (p. 51), « أستعدّ » items 6–11 (p. 43), QCM 5–9 (p. 52), puis trois « مسائل » de la plateforme (modules 6–8).
 * Source de vérité : docs/sources/4am/unit4/extraction.json.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue (modules 1 et 2) : le rayon-solution (solution-ray) sur le رصيد de يونس — 2,5x + 100 ≤ 150, l'élève ÉTIRE x et la
 *   kalfa rencontre le رصيد : 20 messages atteignent 150, 21 le dépassent. Ce sont les nombres du manuel, mais le geste (une trace
 *   rouge ou grise par essai) est ce qui rend la question « quels x conviennent ? » nécessaire ; ce n'est pas une question de mémoire.
 *   Rejetées : (1) l'énoncé du نشاط 3 posé en carte au-dessus du labo (retirée) ; (2) le رصيد de رياض (600 DA, 3 DA le message) comme
 *   entrée — il exige déjà la division par un négatif, il reste la مسألة du module 6.
 *   Ordre des idées : étirer x → POURQUOI 20 suffit et pas 21 → quelle متباينة → deux valeurs de l'élève → le nom « متراجحة » APRÈS la
 *   question sur 2,5×16+100 ≤ 150 → 2 et 21 testés par substitution → le nom « حل » et l'encadré APRÈS la réponse → M2 : la chaîne
 *   −3x+5 ≤ 20, POURQUOI le sens change après ÷(−3) (à partir des points rouges de l'élève) → le tableau → M3 : les trois règles
 *   APRÈS la question keep/change.
 *   Aucune destination du manuel n'a bougé ; aucune ressource `platform_designed_entry` (le labo est l'activité du manuel).
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/ansab_al_aadad_wal_hisab/mutarajiha-ula';

export const LESSON_CONFIG = {
  id: 'mutarajiha-ula',
  kind: 'lesson',
  unit: 'muadalat-mutarajihat',
  unitTitle: 'معادلات ومتراجحات من الدرجة الأولى بمجهول واحد',
  sequentialUnlock: true,
  // Regard de l'élève : 'mission' (modèle du pilote qasim-adad-tabii, VALIDÉ par le propriétaire le 2026-11-08 ; rollout leçon par leçon,
  // docs/reports/MISSION_ROLLOUT_PROGRESS.md — unité 4, leçon 3, 2026-11-11) — implique le regard « focus » ; l'enseignant et le mode classe ne voient
  // aucun changement.
  studentView: 'mission',
  // LA MISSION : l'ouverture avoue qu'on ne sait pas encore la résoudre ; les outils sont les connaissances de knowledge.jsx ; les points d'étape
  // (conseil du 2026-11-11, verdict L3 : AUCUN ne divise par un négatif, ne traduit une situation, ne demande une solution naturelle) RAPPROCHENT de la
  // mission sans en résoudre aucune question : ni ses nombres (600, 120, 3 le message, 200, 93…), ni sa méthode — content/forbidden.js,
  // content/mission.test.js et _unit/missionStrings.test.js. La scène : un téléphone dont la jauge de crédit descend vers un plancher (« phone-credit »).
  mission: {
    scene: 'phone-credit',
    title: 'رصيد رياض: كم رسالة على الأكثر؟',
    opening: {
      text: 'شحن رياض رصيد هاتفه ليطمئنّ على جدّيه برسائل قصيرة. يُقتطع من الرصيد ثمن باقة الأنترنت، ثم ثمن كل رسالة يرسلها، ويريد أن يبقى فيه مبلغ لا ينزل تحته لمكالمات الطوارئ. كم رسالة يستطيع أن يرسل على الأكثر؟',
      cta: 'لا أعرف بعد… هيا نجمع الأدوات',
    },
    tools: [
      { id: 'mutarajiha', icon: '🧩', label: 'المتراجحة: متباينة بمجهول' },
      { id: 'hal-mutarajiha', icon: '🔴', label: 'حلّ متراجحة' },
      { id: 'qawaid-ittijah', icon: '🔄', label: 'قواعد الاتجاه' },
      { id: 'tamthil-bayani', icon: '📏', label: 'التمثيل على مستقيم مدرّج' },
      { id: 'tariqat-hal', icon: '🧭', label: 'طريقة حلّ متراجحة' },
    ],
    climaxModule: 6,
    checkpoints: [
      {
        id: 'cp-hal', afterModule: 1,
        prompt: 'أيّ عدد حلّ للمتراجحة $6x + 1 < 43$ ؟',
        options: ['$6$', '$7$', '$8$'],
        correct: 0,
        explain: '$6 \\times 6 + 1 = 37$ و $37 < 43$ صحيحة. أمّا 7 فيعطي $43 < 43$ وهي خاطئة، و 8 يعطي 49.',
      },
      {
        id: 'cp-ramz', afterModule: 2,
        prompt: 'حلول المتراجحة $x > 8$ على مستقيم مدرّج:',
        options: ['الجزء الملوّن على يمين 8، والرمز غير موجّه نحوه', 'الجزء الملوّن على يمين 8، والرمز موجّه نحوه', 'الجزء الملوّن على يسار 8، والرمز غير موجّه نحوه'],
        correct: 0,
        explain: 'الأعداد الأكبر من 8 تقع على يمينه، و 8 نفسه ليس حلًّا ($8 > 8$ خاطئة) فالرمز غير موجّه نحو الجزء الملوّن.',
      },
      {
        id: 'cp-yabqa', afterModule: 3,
        prompt: 'نطرح 9 من طرفي $x + 9 > -2$ فنحصل على:',
        options: ['$x > -11$', '$x < -11$', '$x > 7$'],
        correct: 0,
        explain: '$-2 - 9 = -11$ ، وطرح العدد نفسه من الطرفين يحافظ على الاتجاه، ولو كان الناتج سالبًا.',
      },
      {
        id: 'cp-tariqa', afterModule: 4,
        prompt: 'حلول المتراجحة $5x - 2 \\geq 33$ هي الأعداد $x$ حيث:',
        options: ['$x \\geq 7$', '$x \\leq 7$', '$x \\geq \\dfrac{31}{5}$'],
        correct: 0,
        explain: 'نضيف 2: $5x \\geq 35$ ، ثم نقسم على 5 وهو موجب: $x \\geq 7$ .',
      },
      {
        id: 'cp-nafs', afterModule: 5,
        prompt: 'أيّ متراجحة لها حلول $x \\leq 2$ نفسها؟',
        options: ['$x + 6 \\leq 8$', '$x + 6 \\geq 8$', '$x - 6 \\leq 8$'],
        correct: 0,
        explain: 'نطرح 6 من طرفي $x + 6 \\leq 8$ : $x \\leq 2$ . الثانية تعطي $x \\geq 2$ ، والثالثة $x \\leq 14$ .',
      },
    ],
  },
  title: 'المتراجحات من الدرجة الأولى بمجهول واحد وتمثيل حلولها بيانيًا',
  description: 'متى تكون متباينةٌ بمجهول صحيحة؟ نختبر قيمًا لـ x، نحلّ المتراجحة بقواعد المتباينات — ونغيّر الاتجاه عند الضرب أو القسمة على عدد سالب — ثم نمثّل حلولها على مستقيم مدرّج.',
  level: 'moyen',
  grade: '4am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان أنساب الأعداد والحساب',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '📏',
  estimatedDurationMin: 60,
  textbookRef: { unit: 4, activity: 3, pages: '43, 45, 48, 49, 51, 52' },
  skills: [
    'التمييز بين متباينة (عددية، صحيحة أو خاطئة) ومتراجحة ذات مجهول x',
    'اختبار ما إذا كان عدد معطى حلًّا لمتراجحة بتعويض x',
    'حل متراجحة من الدرجة الأولى بمجهول واحد بقواعد المتباينات: نحافظ على الاتجاه بإضافة عدد أو طرحه أو بالضرب أو القسمة على عدد موجب، ونغيّره بالضرب أو القسمة على عدد سالب',
    'تمثيل حلول متراجحة على مستقيم مدرّج: الجزء الملوّن بالأحمر، والرمز موجّه نحوه إذا كان الحدّ حلًّا وبعيدًا عنه إذا لم يكن',
  ],
  knowledgeMapOpen: true,
  teachingScope: {
    include: [
      'المتراجحة وحلولها: اختبار قيمة بالتعويض، والأعداد التي تصلح',
      'المتراجحة من الدرجة الأولى: الأشكال ax + b < cx + d ، ax + b > cx + d ، ax + b ≤ cx + d ، ax + b ≥ cx + d',
      'قواعد الحل الثلاث وطريقة حل متراجحة',
      'التمثيل البياني لحلول متراجحة على مستقيم مدرّج: الجزء الملوّن بالأحمر واتجاه الرمز',
      'تمارين توظيف التعلّمات وأسئلة التأكيد بأعداد المنصّة',
    ],
    exclude: [
      'حل المعادلات من الدرجة الأولى (الدرس 1) — يُستعمل ولا يُدرَّس هنا',
      'ترييض مشكلة بمتراجحة (الدرس 4)',
      'جمل المتراجحات وكتابة المجالات بالرموز (غير مبرمجة في المتوسط)',
    ],
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Les acquis que « أستعدّ » diagnostique : comparer / tester une متباينة pour une valeur,
  // les opérations sur les متباينات (années précédentes — items 6–11 du manuel), le
  // repérage sur un مستقيم مدرّج (années précédentes) et la résolution d'une معادلة
  // (leçon 1 de l'unité, prérequis du catalogue).
  priorKnowledge: ['muqarana-adad', 'amaliyat-mutabayinat', 'mustaqim-mudarraj', 'hal-muadala'],
  // « مسألة الدرس » (MASAIL_GENERATION_GUIDE.md) : l'énoncé de la مسألة 1, montré au sommaire et à
  // la fin du module 1 ; le monde du laboratoire solution-ray (un رصيد de téléphone), avec la
  // division par un nombre négatif de l'atelier متقدم. Résolue au module 6.
  lessonProblem: {
    module: 6,
    title: 'رصيد رياض: كم رسالة على الأكثر؟',
    statement: 'شحن رياض رصيد هاتفه النقّال بـ 600 دج ليطمئنّ على جدّيه ويتواصل معهما. اشترى هاتفه قبل سنة بـ 18500 دج، وفي قائمة أصدقائه 45 اسمًا. يقتطع المتعامل من الرصيد 120 دج مقابل باقة أنترنت أسبوعية، ثم 3 دج عن كل رسالة قصيرة يرسلها رياض. يريد رياض أن يبقى في رصيده 200 دج على الأقل لمكالمات الطوارئ. نرمز بـ $x$ إلى عدد الرسائل القصيرة التي يرسلها.',
    illustration: { kind: 'scene', icon: 'phone', bg: 'blue', chips: [{ label: 'رصيد رياض', value: 600, unit: 'دج' }, { label: 'باقة أنترنت', value: 120, unit: 'دج', tone: 'rose' }, { label: 'كل رسالة', value: 3, unit: 'دج', tone: 'amber' }, { label: 'أدنى رصيد', value: 200, unit: 'دج', tone: 'green' }], ariaLabel: 'هاتف نقّال رصيده 600 دج، تُقتطع منه 120 دج لباقة الأنترنت و 3 دج عن كل رسالة، ويجب أن يبقى فيه 200 دج على الأقل' },
  },
  resources: [
    // Module 1 : la situation du manuel (رسائل يونس) posée UNE fois, sur ses nombres —
    // 2,5x + 100 ≤ 150, x entier (un nombre de messages). Pas d'atelier à deux niveaux :
    // la question est « quels x conviennent ? », et la paire du type est au module 2.
    {
      kind: 'manipulation', code: 'solution-ray-younes', type: 'solution-ray', module: 1,
      title: 'ميزانية الأقلام: أيّ الأعداد تصلح؟',
      learningPointIds: ['4am_mutarajiha-ula_P1'],
      sourceElementIds: ['act-3a'],
    },
    // Module 2 : l'atelier à deux niveaux. مبتدئ = la première ligne du tableau du
    // نشاط 3 (x < 3 : la borne se lit, le crochet est à décider) ; متقدم = l'inéquation
    // du نشاط 3 (−3x + 5 ≤ 20), transformée carte par carte au-dessus des traces.
    {
      kind: 'manipulation', code: 'solution-ray-x-3', type: 'solution-ray', module: 2,
      level: 'beginner',
      title: 'المتراجحة x < 4 : أين الحلول، وإلى أين يتّجه الرمز؟',
      objective: 'حلول متراجحة من الدرجة الأولى نصف مستقيم يحدّه عدد: نختبر القيم، ونمثّلها بالجزء الملوّن بالأحمر والرمز موجّه نحوه إذا كان الحدّ حلًّا',
      autonomy: '',
      experience: { type: 'textbook', reason: '', theme: 'abstract' },
      learningPointIds: ['4am_mutarajiha-ula_P1', '4am_mutarajiha-ula_P3'],
      sourceElementIds: ['act-3b'],
    },
    {
      kind: 'manipulation', code: 'solution-ray-3x-5-20', type: 'solution-ray', module: 2,
      level: 'advanced',
      title: 'المتراجحة −2x + 7 ≤ 9 : حلّها خطوة خطوة فوق نقاطك',
      objective: 'حلول متراجحة من الدرجة الأولى نصف مستقيم يحدّه عدد: نختبر القيم، ونمثّلها بالجزء الملوّن بالأحمر والرمز موجّه نحوه إذا كان الحدّ حلًّا',
      autonomy: 'الحدّ لا يُقرأ في المتراجحة: التلميذ يجده بتجاربه، ثم يحوّل المتراجحة بنفسه — يختار العملية واتجاه كل سطر جديد، والمختبر يرفض كل اتجاه يناقض نقاطه الحمراء حتى يكتشف أنّ القسمة على عدد سالب تغيّر الاتجاه',
      experience: { type: 'textbook', reason: '', theme: 'abstract' },
      learningPointIds: ['4am_mutarajiha-ula_P2', '4am_mutarajiha-ula_P3'],
      sourceElementIds: ['act-3b'],
    },
    { kind: 'situation', code: 'masala-1', module: 6, title: 'مسألة الدرس — رصيد رياض: 600 دج ورسائل بـ 3 دج', learningPointIds: ['4am_mutarajiha-ula_P1', '4am_mutarajiha-ula_P2', '4am_mutarajiha-ula_P3'] },
    { kind: 'situation', code: 'masala-2', module: 7, title: 'مسألة — نادي اللياقة البدنية: بطاقة شهرية أم دفع عن كل حصة؟', learningPointIds: ['4am_mutarajiha-ula_P1', '4am_mutarajiha-ula_P2'] },
    { kind: 'situation', code: 'masala-3', module: 8, title: 'مسألة — كراء سيارة: مسافة غير محدودة أم ثمن للكيلومتر؟', learningPointIds: ['4am_mutarajiha-ula_P1', '4am_mutarajiha-ula_P2', '4am_mutarajiha-ula_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'عشر عبارات: اختبار متباينة من أجل قيمة، العمليات على المتباينات، المستقيم المدرّج وحل معادلة. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'rasail-yunus', path: `${LESSON_BASE_PATH}/rasail-yunus`,
      title: 'نشاط — أيّ الأعداد تصلح؟', desc: 'ميزانية أقلام: جرّب أعدادًا كاملة، لوّن بالأحمر ما يصلح، ثم سمِّ المتراجحة وحلولها.',
      stage: 'trigger', teachesLearningPointIds: ['4am_mutarajiha-ula_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 9, difficulty: 1, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'hal-mutarajiha', path: `${LESSON_BASE_PATH}/hal-mutarajiha`,
      title: 'نشاط — الرمز والاتجاه', desc: 'المسبار على المستقيم المدرّج يترك نقاطًا حمراء حيث المتباينة صحيحة؛ ثم تحويل متراجحتين متشابهتين خطوة خطوة: متى يتغيّر الاتجاه؟',
      stage: 'discovery', teachesLearningPointIds: ['4am_mutarajiha-ula_P2', '4am_mutarajiha-ula_P3'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — المتراجحات وتمثيل حلولها', desc: 'تعريف المتراجحة وحلولها، المتراجحة من الدرجة الأولى، القواعد الثلاث، والتمثيل البياني بالجزء الملوّن بالأحمر.',
      stage: 'formalization', teachesLearningPointIds: ['4am_mutarajiha-ula_P1', '4am_mutarajiha-ula_P2', '4am_mutarajiha-ula_P3'],
      color: 'sky', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'أتعلّم' },
    { id: '04', number: 4, slug: 'tarayiq', path: `${LESSON_BASE_PATH}/tarayiq`,
      title: 'طرائق — حل متراجحة', desc: 'حلّان مفصّلان سطرًا سطرًا، والتمثيل البياني لكل حل، ثم دوري الآن.',
      stage: 'formalization', teachesLearningPointIds: ['4am_mutarajiha-ula_P2', '4am_mutarajiha-ula_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أتعلّم الطريقة' },
    { id: '05', number: 5, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'تمارين متنوّعة بأعداد المنصّة، وسؤالان لكلٍّ منهما إجابتان صحيحتان.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_mutarajiha-ula_P1', '4am_mutarajiha-ula_P2', '4am_mutarajiha-ula_P3'],
      color: 'amber', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'أتدرّب' },
    // Les « مسائل » (track: 'problem') : practice_lab, avant le test, qui
    // reste toujours ouvert. Elles comptent dans la complétion, jamais dans
    // la maîtrise — docs/architecture/LESSON_CONTRACT.md § Modules « مسائل ».
    { id: '06', number: 6, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — رصيد رياض', desc: 'مسألة الدرس: نترجم رغبة رياض بمتراجحة، نحلّها، نمثّل حلولها، ثم نجيب.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_mutarajiha-ula_P1', '4am_mutarajiha-ula_P2', '4am_mutarajiha-ula_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — نادي اللياقة البدنية', desc: 'بطاقة شهرية أم دفع عن كل حصة؟ ابتداءً من كم حصة تصبح البطاقة أقلّ كلفة؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_mutarajiha-ula_P1', '4am_mutarajiha-ula_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — كراء سيارة', desc: 'مسافة غير محدودة أم ثمن للكيلومتر؟ نحلّ متراجحة ونمثّل حلولها، ثم نختار الصيغة لكل يوم.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_mutarajiha-ula_P1', '4am_mutarajiha-ula_P2', '4am_mutarajiha-ula_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '09', number: 9, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'ستة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 7, difficulty: 3, actionText: 'أدخل التقويم' },
  ],
};
