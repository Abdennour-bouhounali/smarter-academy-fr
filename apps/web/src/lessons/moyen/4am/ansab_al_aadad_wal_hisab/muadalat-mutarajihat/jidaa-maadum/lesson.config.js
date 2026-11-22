/**
 * الدرس 2 — معادلات جداء معدوم
 * Unité 4 (4AM) : الجداء المعدوم، معارف، طرائق (حل معادلة من الشكل (ax + b)(cx + d) = 0), sept exercices, deux items de « أؤكّد تعلّماتي »
 * (déclarés `duplicatedIn`), le تحدّ et l'encadré الخوارزمي de la page d'ouverture, puis trois « مسائل » de la plateforme (modules 5–7).
 * Source de vérité : docs/sources/4am/unit4/extraction.json. Les nombres et les mots sont ceux de la plateforme (rollout 2026-11-11).
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les كفاءات, pas le parcours.
 *   Entrée retenue (module 1) : le terrain d'entraînement dont les deux côtés sont les deux facteurs (vanishing-pitch) — d'abord 2(x − 3) (un côté
 *   constant qui ne s'écrase jamais, un seul zéro), puis (x − 1)(x + 4) (deux zéros), puis 2x(x + 2) (le zéro 0 vient du facteur 2x). L'élève ÉPINGLE
 *   les valeurs où le terrain disparaît et c'est sur SES épingles que la règle est posée. Module 2 : la règle en demis COUVERTE (le terrain ne se voit
 *   qu'après un pin, donc on SOLVE au lieu de lire), puis le carré. Modules 3–8 : méthode, exercices, مسائل, test.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/ansab_al_aadad_wal_hisab/jidaa-maadum';

export const LESSON_CONFIG = {
  id: 'jidaa-maadum',
  kind: 'lesson',
  unit: 'muadalat-mutarajihat',
  unitTitle: 'معادلات ومتراجحات من الدرجة الأولى بمجهول واحد',
  sequentialUnlock: true,
  // Regard de l'élève : 'mission' (modèle du pilote qasim-adad-tabii, VALIDÉ le 2026-11-08 ; rollout leçon par leçon — unité 4, leçon 2, 2026-11-11) —
  // implique le regard « focus » ; l'enseignant et le mode classe ne voient aucun changement.
  studentView: 'mission',
  // LA MISSION : l'ouverture avoue qu'on ne sait pas encore la résoudre ; les outils sont les connaissances de knowledge.jsx ; les points d'étape
  // RAPPROCHENT de la mission sans en résoudre aucune question : ni ses nombres (côtés, 792, 40 دج…), ni ses solutions, ni sa correction — content/forbidden.js,
  // content/mission.test.js et _unit/missionStrings.test.js. La scène : le tableau du mentor sur le terrain du quartier (« pitch-planner »).
  mission: {
    scene: 'pitch-planner',
    title: 'مسطرة المدرّب: متى يختفي الملعب؟',
    opening: {
      text: 'يرسم مدرّب نادي الحيّ ملعب تدريب على لوحته: يحرّك عددًا على مسطرة فيتغيّر ضلعا الملعب معًا. عند بعض القيم يختفي الملعب تمامًا! عند أيّ القيم؟ وأيّ قيمة تعطي المدرّب الملعب الذي يريده، وكم يكلّف طلاء خطوطه؟',
      cta: 'لا أعرف بعد… هيا نجمع الأدوات',
    },
    tools: [
      { id: 'khassiya-jidaa-maadum', icon: '🎯', label: 'خاصية الجداء المعدوم' },
      { id: 'taarif-muadala-jidaa', icon: '🧾', label: 'معادلة جداء معدوم' },
      { id: 'hulul-muadala-jidaa', icon: '✌️', label: 'حلول المعادلة: معادلتان' },
      { id: 'tariqat-jidaa-maadum', icon: '🧩', label: 'طريقة: نحلّل ثم نحلّ' },
    ],
    climaxModule: 5,
    checkpoints: [
      {
        id: 'cp-ahad', afterModule: 1,
        prompt: '$(-8) \\times b = 0$ . ماذا نعرف عن العدد $b$ ؟',
        options: ['$b = 0$', '$b = 8$', '$b = -\\dfrac{1}{8}$'],
        correct: 0,
        explain: '$(-8) \\times 0 = 0$ . أمّا $(-8) \\times 8 = -64$ و $(-8) \\times \\left(-\\dfrac{1}{8}\\right) = 1$ : لا ينعدم الجداء إلا إذا انعدم العامل الآخر.',
      },
      {
        id: 'cp-shakl', afterModule: 2,
        prompt: 'أيّ معادلة ليست معادلة جداء معدوم؟',
        options: ['$(x - 9)(x + 2) = 7$', '$5x(x - 1) = 0$', '$(x + 2)^2 = 0$'],
        correct: 0,
        explain: 'طرفها الثاني $7$ وليس $0$ : خاصية الجداء المعدوم لا تُطبَّق. أمّا $5x(x - 1) = 0$ و $(x + 2)^2 = 0$ فجداءان يساويان $0$ .',
      },
      {
        id: 'cp-farq', afterModule: 3,
        prompt: 'حلول المعادلة $x^2 - 49 = 0$ :',
        options: ['$7$ أو $-7$', '$7$ فقط', '$49$ أو $-49$'],
        correct: 0,
        explain: '$x^2 - 49 = (x - 7)(x + 7)$ ، إذن $x - 7 = 0$ أو $x + 7 = 0$ ، أي $x = 7$ أو $x = -7$ .',
      },
      {
        id: 'cp-sifr', afterModule: 4,
        prompt: 'حلول المعادلة $7x(x - 2) = 0$ :',
        options: ['$0$ أو $2$', '$2$ فقط', '$7$ أو $2$'],
        correct: 0,
        explain: '$7x = 0$ يعني $x = 0$ ، و $x - 2 = 0$ يعني $x = 2$ . أمّا $7$ فعامل ثابت غير معدوم.',
      },
    ],
  },
  title: 'معادلات جداء معدوم',
  description: 'التعرف على معادلة جداء معدوم من الشكل (ax + b)(cx + d) = 0 وحلها بخاصية الجداء المعدوم: ينعدم جداء عاملين إذا وفقط إذا انعدم أحدهما، ثم حل معادلات تؤول إليها بالتحليل.',
  level: 'moyen',
  grade: '4am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان أنساب الأعداد والحساب',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🎯',
  estimatedDurationMin: 50,
  textbookRef: { unit: 4, activity: 2, pages: '43, 44, 46, 47, 50, 51, 52' },
  skills: [
    'التعرّف على معادلة جداء معدوم من الشكل (ax + b)(cx + d) = 0',
    'تطبيق خاصية الجداء المعدوم: A × B = 0 يعني A = 0 أو B = 0',
    'حل معادلة جداء معدوم بحل معادلتين من الدرجة الأولى',
    'حل معادلة تؤول إلى معادلة جداء معدوم بعد التحليل (عامل مشترك أو متطابقة شهيرة)',
  ],
  teachingScope: {
    include: [
      'خاصية الجداء المعدوم: إذا كان جداء عاملين معدومًا فإن أحد هذين العاملين على الأقل معدوم',
      'تعريف معادلة جداء معدوم وحلولها: حلول المعادلتين ax + b = 0 و cx + d = 0',
      'عامل ثابت غير معدوم لا ينعدم: 2(x − 3) = 0 يعني x − 3 = 0',
      'حل معادلة تؤول إلى جداء معدوم بالتحليل: العامل المشترك والمتطابقات الشهيرة، مع سبعة تمارين',
      'المربّع المكمَّل في مسألة الوحدة (x² + 10x = 39) ومعادلة الخوارزمي x² + 21 = 10x',
    ],
    exclude: [
      'حل معادلة من الدرجة الأولى بمجهول واحد وخواص المساواة (الدرس 1)',
      'المتراجحات من الدرجة الأولى (الدرس 3)',
      'المعادلات من الدرجة الثانية بالمميّز (غير مبرمجة في المتوسط)',
    ],
  },
  // « مسألة الدرس » — l'énoncé de la مسألة 1 (content/problems.js), montré au sommaire
  // et à la fin du module 1 : un ملعب dont les deux côtés varient avec x.
  lessonProblem: {
    module: 5,
    title: 'ملعب التدريب: ضلعان يتغيّران معًا',
    statement: 'في تطبيق لتخطيط الملاعب، يرسم مدرّب نادي الحيّ، وهو يؤطّر أطفال الحيّ تطوّعًا، ملعب تدريب مستطيلًا طولا ضلعيه بالمتر $3x - 12$ و $x + 6$ ، حيث $x$ عدد يحرّكه المدرّب على مسطرة، فتكون مساحة الملعب $(3x - 12)(x + 6)$. يضمّ النادي 45 لاعبًا، وتدوم حصة التدريب 90 دقيقة. يريد المدرّب في النهاية ملعبًا مساحته $792\\,m^2$ ، ويطلي خطوط حدوده الأربعة بطلاء ثمنه 40 دج للمتر الواحد.',
    illustration: { kind: 'plan', shape: 'rect', fill: 'court', w: '3x - 12', h: 'x + 6', unit: 'm', area: 792, areaUnit: 'm²', ariaLabel: 'ملعب تدريب مستطيل طولا ضلعيه 3x - 12 و x + 6 بالمتر، ومساحته المطلوبة 792 متر مربّع' },
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // La carte TOUTE OUVERTE (règle des pilotes, propriétaire 2026-11-08) : toutes les connaissances dès le début.
  knowledgeMapOpen: true,
  // Les acquis que « أستعدّ » diagnostique : le نشر (unité 3), l'analyse par
  // facteur commun et par identité remarquable (unité 3), la résolution d'une
  // équation du premier degré (leçon 1 de l'unité), le produit de relatifs.
  priorKnowledge: ['nashr-jidaa', 'tahlil-amil', 'tahlil-huwiya', 'hal-muadala-ula', 'darb-nisbiya'],
  resources: [
    // Le module 1 ouvre sur le TERRAIN dont les deux côtés sont les deux FACTEURS (vanishing-pitch). مبتدئ = 2(x − 3) : un côté constant
    // qui ne s'écrase jamais ; متقدم = (x − 1)(x + 4). Même objectif aux deux niveaux (la page ; le lecteur joue des manches).
    {
      kind: 'manipulation', code: 'pitch-3-x-5', type: 'vanishing-pitch', module: 1,
      level: 'beginner',
      title: 'ملعب ضلعاه 2 و x − 3: متى يختفي؟',
      objective: 'خاصية الجداء المعدوم: A × B = 0 يعني A = 0 أو B = 0 — مساحة الملعب تنعدم فقط عندما ينعدم أحد ضلعيه',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'football' },
      learningPointIds: ['4am_jidaa-maadum_P2'],
      sourceElementIds: ['act-2b'],
    },
    {
      kind: 'manipulation', code: 'pitch-x-2-x-5', type: 'vanishing-pitch', module: 1,
      level: 'advanced',
      title: 'ملعب ضلعاه x − 1 و x + 4: كل القيم التي يختفي عندها',
      objective: 'خاصية الجداء المعدوم: A × B = 0 يعني A = 0 أو B = 0 — مساحة الملعب تنعدم فقط عندما ينعدم أحد ضلعيه',
      autonomy: 'الضلعان يتغيّران معًا وأحدهما ينقلب سالبًا بين −4 و 1: على التلميذ أن يجد وحده كل قيم x التي يختفي عندها الملعب ثم أن يحكم «لا حلول أخرى» بعد مسح المسطرة، ونشر حاتم لا يعطي معادلة من الدرجة الأولى',
      experience: { type: 'platform_adaptation', reason: 'multiple_representations', theme: 'football' },
      learningPointIds: ['4am_jidaa-maadum_P2', '4am_jidaa-maadum_P1'],
      sourceElementIds: ['act-2b'],
    },
    // معارف 2 : (2x − 3)(x + 1) = 0 — la règle graduée en demis (zéros 3/2 et −1).
    {
      kind: 'manipulation', code: 'pitch-3x-4-2x-1', type: 'vanishing-pitch', module: 2,
      title: 'ملعب ضلعاه 2x − 3 و x + 1: القيمتان بالأنصاف',
      learningPointIds: ['4am_jidaa-maadum_P2'],
      sourceElementIds: ['know-2'],
    },
    // Un terrain CARRÉ (x + 1)² = 0 : les deux côtés s'annulent ensemble.
    {
      kind: 'manipulation', code: 'pitch-square-2x-1', type: 'vanishing-pitch', module: 3,
      title: 'ملعب مربّع ضلعه x + 1: كم حلًّا؟',
      learningPointIds: ['4am_jidaa-maadum_P2'],
      sourceElementIds: ['now-47-2'],
    },
    // Modules 5–7 — les « مسائل » : exercices complets de type امتحان, ajouts
    // de la plateforme (content/problems.js), sans aucune preuve de maîtrise.
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — ملعب التدريب: متى يختفي؟', learningPointIds: ['4am_jidaa-maadum_P1', '4am_jidaa-maadum_P2', '4am_jidaa-maadum_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — نافورة الساحة: قوس الماء', learningPointIds: ['4am_jidaa-maadum_P2', '4am_jidaa-maadum_P3'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — شريط الورود: عرض الحديقة', learningPointIds: ['4am_jidaa-maadum_P2', '4am_jidaa-maadum_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'عشر عبارات من السهل إلى الأصعب: حل معادلة من الدرجة الأولى وتحليل عبارة. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'أكتشف — خاصية الجداء المعدوم', desc: 'حرّك x فيتغيّر ضلعا الملعب: متى يختفي؟ ثم كرّاسا حاتم وبسّام والمعادلة (x − 1)(x + 4) = 0.',
      stage: 'trigger', teachesLearningPointIds: ['4am_jidaa-maadum_P1', '4am_jidaa-maadum_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 13, difficulty: 2, actionText: 'أحرّك x' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — معادلات جداء معدوم', desc: 'التعريف، خاصية الجداء المعدوم وحلول المعادلة، مثال محلول، ثم المعادلة (E) وورقة زميل.',
      stage: 'discovery', teachesLearningPointIds: ['4am_jidaa-maadum_P1', '4am_jidaa-maadum_P2', '4am_jidaa-maadum_P3'],
      color: 'violet', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tarayiq', path: `${LESSON_BASE_PATH}/tarayiq`,
      title: 'طرائق — نحلّل ثم نحلّ', desc: 'حلّ مفصّل سطرًا سطرًا، تمارين سريعة، ثم مربّع الخوارزمي ومعادلته.',
      stage: 'formalization', teachesLearningPointIds: ['4am_jidaa-maadum_P2', '4am_jidaa-maadum_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'سبعة تمارين: معادلات جداء معدوم ومعادلات تؤول إليها.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_jidaa-maadum_P1', '4am_jidaa-maadum_P2', '4am_jidaa-maadum_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أتدرّب' },
    // Les « مسائل » (track: 'problem') : practice_lab, avant le test, qui
    // reste toujours ouvert. Elles comptent dans la complétion, jamais dans
    // la maîtrise — docs/architecture/LESSON_CONTRACT.md § Modules « مسائل ».
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — ملعب التدريب', desc: 'مسألة الدرس: متى يختفي الملعب؟ أيّ الحلّين مقبول؟ ثم ملعب مساحته 792 مترًا مربّعًا.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_jidaa-maadum_P1', '4am_jidaa-maadum_P2', '4am_jidaa-maadum_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — نافورة الساحة', desc: 'أين يسقط الماء؟ أين تُعلَّق الحلقتان؟ وكم تكلّف حافة الحوض؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_jidaa-maadum_P2', '4am_jidaa-maadum_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — شريط الورود', desc: 'عشب ثلاثة أضعاف الورود: ما عرض الحديقة؟ وكم شتلة نشتري؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_jidaa-maadum_P2', '4am_jidaa-maadum_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 3, actionText: 'أدخل التقويم' },
  ],
};
