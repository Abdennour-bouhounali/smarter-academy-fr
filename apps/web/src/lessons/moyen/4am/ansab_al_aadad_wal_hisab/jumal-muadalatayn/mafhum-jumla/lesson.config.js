/**
 * الدرس 1 — مفهوم جملة معادلتين من الدرجة الأولى بمجهولين
 * Unité 5 (4AM). Depuis le rollout mission (2026-11-12, conseil du 2026-11-11, verdict « L1 » et X1–X11) la plateforme écrit TOUT avec ses propres
 * nombres et ses propres mots : plus aucun nombre, énoncé ni renvoi du manuel n'est montré à l'élève ; les `id`, `skill`, `learningPointIds` et
 * `src(...)` (traçabilité) sont gardés. Source de l'extraction : docs/sources/4am/unit5/extraction.json.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue (module 1) : le TABLEAU DES DEUX CONDITIONS (pair-scoreboard) — la main fixe deux nombres et DEUX jauges se prononcent au
 *   relâchement : la carte de saison (x + y = 7 ∣ 3x + y = 17), la cagnotte de la classe (x + y = 9 ∣ 50x + 20y = 300 : plusieurs ثنائيات donnent
 *   9 pièces, une seule les deux conditions, et sa renversée est refusée), la jauge (2) COUVERTE (x + y = 13 ∣ 3x + y = 29 : il faut substituer
 *   avant que la jauge ne juge). Module 2 (معارف, sans labo) : la définition, la vérification d'une ثنائية, l'ordre, les cas particuliers, puis
 *   « ورقة صهيب ». Module 3 : les exercices de la plateforme et le pont « من جملة إلى معادلة » (verdict L1.12).
 *   « مسألة الدرس » : le monde « après un départ » (42 agents), résolu au module 4 — sa structure n'est rencontrée nulle part avant (L1.1).
 *   La page (enseignant) garde ses deux niveaux sur des nombres de la plateforme : la saison x + y = 7 ∣ 3x + y = 17 et le service
 *   x + y = 29 ∣ 2(x − 3) = y − 2 (11 hommes et 18 femmes ; après : 8 et 16).
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/ansab_al_aadad_wal_hisab/mafhum-jumla';

export const LESSON_CONFIG = {
  id: 'mafhum-jumla',
  kind: 'lesson',
  unit: 'jumal-muadalatayn',
  unitTitle: 'جمل معادلتين من الدرجة الأولى بمجهولين',
  sequentialUnlock: true,
  // Regard de l'élève : 'mission' (modèle du pilote qasim-adad-tabii, VALIDÉ le 2026-11-08 ; unité 5, leçon 1, 2026-11-12) — implique le regard
  // « focus » ; l'enseignant et le mode classe ne voient aucun changement.
  studentView: 'mission',
  knowledgeMapOpen: true,
  // LA MISSION : l'ouverture avoue qu'on ne sait pas encore la résoudre (verdict L1.11) ; les outils sont les connaissances de knowledge.jsx ; les
  // points d'étape RAPPROCHENT de la mission sans en résoudre aucune question : ni ses nombres (42, (30 ; 12)…), ni sa structure « après un départ »,
  // ni ses corrections (l'ordre, les parenthèses, le facteur du mauvais côté, le total « après »), ni le format « trois propositions » —
  // content/mission.test.js et _unit/missionStrings.test.js. La scène : le guichet de la mairie et ses bureaux vides (« civil-registry »).
  mission: {
    scene: 'civil-registry',
    title: 'شبّاك الحالة المدنية: عددان وشرطان',
    opening: {
      text: 'في مصلحة الحالة المدنية رجال ونساء. نعرف عددهم كلّهم، ونعرف شرطًا ثانيًا بعد أن تقاعد بعضهم. كم رجلًا وكم امرأة يعملون فيها؟ ثلاثة مواطنين اقترحوا ثلاث إجابات… أيّها الصحيح؟',
      cta: 'لا أعرف بعد… هيا نجمع الأدوات',
    },
    tools: [
      { id: 'jumla-tarif', icon: '🧩', label: 'جملة معادلتين: شرطان معًا' },
      { id: 'hall-jumla', icon: '✌️', label: 'الحلّ: ثنائية تحقّق المعادلتين في آن واحد' },
      { id: 'ikhtibar-thunaiya', icon: '🔍', label: 'نختبر ثنائية بالتعويض في المعادلتين' },
      { id: 'tartib-thunaiya', icon: '↔️', label: 'الترتيب في الثنائية مهمّ' },
    ],
    climaxModule: 4,
    checkpoints: [
      {
        id: 'cp-kathira', afterModule: 1,
        prompt: 'أيّ ثنائية تحقّق المعادلة $4x + y = 13$ ؟',
        options: ['$(1 ; 9)$ و $(3 ; 1)$ معًا', '$(1 ; 9)$ فقط', '$(3 ; 1)$ فقط'],
        correct: 0,
        explain: '$4 \\times 1 + 9 = 13$ و $4 \\times 3 + 1 = 13$ : المعادلة الواحدة بمجهولين تقبل ثنائيات كثيرة.',
      },
      {
        id: 'cp-halat', afterModule: 2,
        prompt: 'الجملة $\\begin{cases} x - 2y = 1 \\\\ 3x - 6y = 3 \\end{cases}$ …',
        options: ['لها عدد غير منته من الحلول', 'لها حلّ وحيد', 'ليس لها حلول'],
        correct: 0,
        explain: 'نقسم طرفي $3x - 6y = 3$ على 3 فنجد $x - 2y = 1$ ، المعادلة الأولى نفسها: كل ثنائية تحقّقها حلّ للجملة، مثل $(1 ; 0)$ و $(3 ; 1)$ .',
      },
      {
        id: 'cp-dhihni', afterModule: 3,
        prompt: 'حلّ الجملة $\\begin{cases} x = 2 \\\\ x + y = 7 \\end{cases}$ هو الثنائية',
        options: ['$(2 ; 5)$', '$(2 ; 9)$', '$(2 ; 7)$'],
        correct: 0,
        explain: '$x = 2$ ، ثم $2 + y = 7$ أي $y = 5$ . أمّا $(2 ; 9)$ فتعطي $2 + 9 = 11$ ، و $(2 ; 7)$ تعطي $2 + 7 = 9$ .',
      },
    ],
  },
  title: 'مفهوم جملة معادلتين من الدرجة الأولى بمجهولين',
  description: 'التعرف على جملة معادلتين من الدرجة الأولى بمجهولين x و y من الشكل { ax + by = c ; a\'x + b\'y = c\' }، وإدراك أن حلها ثنائية (x ; y) تحقق المعادلتين في آن واحد: اختبار ثنائية معطاة بالتعويض، والتمييز بين جملة تقبل حلا وحيدا وجملة ليس لها حل وجملة لها عدد غير منته من الحلول.',
  level: 'moyen',
  grade: '4am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان أنساب الأعداد والحساب',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '⚽',
  estimatedDurationMin: 52,
  textbookRef: { unit: 5, activity: 1, pages: '55, 56, 58, 60, 62' },
  skills: [
    'التعرف على جملة معادلتين من الدرجة الأولى بمجهولين ومعاملاتها',
    'إدراك أن حل الجملة ثنائية (x ; y) تحقق المعادلتين في آن واحد، وأن الترتيب في الثنائية مهم',
    'اختبار ثنائية معطاة بالتعويض في معادلتي الجملة',
    'التمييز بين جملة لها حل وحيد وجملة ليس لها حلول وجملة لها عدد غير منته من الحلول',
  ],
  teachingScope: {
    include: [
      'لوحة الشرطين: بطاقة موسم، وحصّالة القسم، ولوحة مغطّاة — ثنائية تقبلها اللوحتان معًا',
      'تعريف جملة معادلتين من الدرجة الأولى بمجهولين ومعاملاتها',
      'تعريف حل الجملة: ثنائية تحقق المعادلتين في آن واحد، والترتيب في الثنائية',
      'اختبار ثنائية بالتعويض في معادلة وفي جملة',
      'الحالات الخاصة: معادلتان تؤولان إلى معادلة واحدة، ومعادلتان متناقضتان',
      'ترجمة جملة بسيطة من نصّ إلى معادلة بمجهولين',
    ],
    exclude: [
      'طريقتا التعويض والجمع لحل جملة جبريا (الدرس 2)',
      'ترييض مشكلة بجملة معادلتين وخطواتها الخمس (الدرس 3)',
      'الحل البياني لجملة معادلتين',
    ],
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Les acquis que « أستعدّ » diagnostique (l'échelle de la plateforme, content/prep.js) : résoudre une équation du premier degré à une
  // inconnue, et remplacer DEUX lettres pour tester une égalité — le geste des jauges du module 1.
  priorKnowledge: ['hal-muadala-ula', 'taawid-qima', 'taawid-majhulayn'],
  // « مسألة الدرس » (MASAIL_GENERATION_GUIDE.md) : les agents d'une مصلحة avant et après le تقاعد, deux conditions à la fois — résolue au module 4.
  lessonProblem: {
    module: 4,
    title: 'مصلحة الحالة المدنية: 42 عاملًا وشرطان',
    statement: 'تشغّل مصلحة الحالة المدنية بإحدى البلديات 42 عاملًا، رجالًا ونساءً، وتخدم المواطنين بإخلاص، وتستقبلهم في موعدها ابتداءً من الساعة 8 صباحًا. أُحيل 6 رجال و 4 نساء على التقاعد ولم يُعوَّضوا، فأصبح عدد الرجال بالمصلحة ثلاثة أضعاف عدد النساء. بعد ذلك قرّرت البلدية توظيف 10 عمّال جدد، بحيث يصبح عدد الرجال بالمصلحة ضعف عدد النساء.',
    illustration: { kind: 'timeline', icon: 'person', title: 'مصلحة الحالة المدنية', marks: [{ label: 'العمّال', value: 42 }, { label: 'تقاعد رجال', value: 6 }, { label: 'تقاعد نساء', value: 4 }, { label: 'توظيف جدد', value: 10 }], ariaLabel: 'محور زمني لمصلحة الحالة المدنية: 42 عاملًا، ثم تقاعد 6 رجال و 4 نساء، ثم توظيف 10 عمّال جدد' },
  },
  resources: [
    // Le module 1 ouvre sur le TABLEAU DES DEUX CONDITIONS (pair-scoreboard). Page : مبتدئ = la carte de saison (x + y = 7 ∣ 3x + y = 17),
    // متقدم = le service « après » sur les nombres de la plateforme (29 agents) ; lecteur : les manches (content/pairs.js). Codes gardés.
    {
      kind: 'manipulation', code: 'pair-scoreboard-season-10-22', type: 'pair-scoreboard', module: 1,
      level: 'beginner',
      title: 'بطاقة الموسم: 7 مباريات و 17 نقطة',
      objective: 'حل جملة معادلتين ثنائية (x ; y) تحقق المعادلتين في آن واحد، والترتيب في الثنائية مهم',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'football' },
      learningPointIds: ['4am_mafhum-jumla_P2', '4am_mafhum-jumla_P3'],
      sourceElementIds: ['act-1'],
    },
    {
      kind: 'manipulation', code: 'pair-scoreboard-staff-32', type: 'pair-scoreboard', module: 1,
      level: 'advanced',
      title: 'مصلحة إدارية: 29 عاملًا وشرطان',
      objective: 'حل جملة معادلتين ثنائية (x ; y) تحقق المعادلتين في آن واحد، والترتيب في الثنائية مهم',
      autonomy: 'الشرط الثاني لا يُقرأ مباشرة على العدد: يقارن ما بقي بعد خروج 3 رجال وامرأتين (2(x − 3) = y − 2)، والأعداد كبيرة لا تُعدّ بنظرة، ولا يُقترح على التلميذ أي ثنائية',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'staff' },
      learningPointIds: ['4am_mafhum-jumla_P2', '4am_mafhum-jumla_P3'],
      sourceElementIds: ['act-1'],
    },
    // Le transfert, posé seul en fin de module 1 (page) : même instrument, monde de la cagnotte de la classe (9 pièces, 300 دج).
    {
      kind: 'manipulation', code: 'pair-scoreboard-coins-37-610', type: 'pair-scoreboard', module: 1,
      title: 'حصّالة القسم: 9 قطع و 300 دج',
      learningPointIds: ['4am_mafhum-jumla_P2', '4am_mafhum-jumla_P3'],
      sourceElementIds: ['challenge'],
    },
    { kind: 'situation', code: 'masala-1', module: 4, title: 'مسألة الدرس — مصلحة الحالة المدنية: 42 عاملًا', learningPointIds: ['4am_mafhum-jumla_P1', '4am_mafhum-jumla_P2', '4am_mafhum-jumla_P3'] },
    { kind: 'situation', code: 'masala-2', module: 5, title: 'مسألة — مكتبة الحيّ: كراريس كبيرة وصغيرة', learningPointIds: ['4am_mafhum-jumla_P1', '4am_mafhum-jumla_P2', '4am_mafhum-jumla_P3', '4am_mafhum-jumla_P4'] },
    { kind: 'situation', code: 'masala-3', module: 6, title: 'مسألة — مزرعة الدجاج والأرانب: رؤوس وأرجل', learningPointIds: ['4am_mafhum-jumla_P1', '4am_mafhum-jumla_P2', '4am_mafhum-jumla_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'عشر عبارات من السهل إلى الأصعب: قيمة عبارة بحرفين، وحل معادلة بمجهول واحد. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'لوحة الشرطين', desc: 'حرّك عددين حتى تقبلهما اللوحتان معًا: بطاقة موسم، وحصّالة القسم، ثم لوحة مغطّاة.',
      stage: 'trigger', teachesLearningPointIds: ['4am_mafhum-jumla_P2', '4am_mafhum-jumla_P3', '4am_mafhum-jumla_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 17, difficulty: 2, actionText: 'أجرّب الثنائيات' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — الجملة وحلّها', desc: 'تعريف جملة معادلتين ومعاملاتها، حل الجملة والترتيب في الثنائية، والحالتان الخاصتان.',
      stage: 'discovery', teachesLearningPointIds: ['4am_mafhum-jumla_P1', '4am_mafhum-jumla_P2', '4am_mafhum-jumla_P3', '4am_mafhum-jumla_P4'],
      color: 'violet', style: 'featured', estimatedMin: 16, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'ثنائيات تحقق معادلة، حلول كثيرة لمعادلة واحدة، ثنائية تحقق جملة، ومن نصّ إلى معادلة.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_mafhum-jumla_P3', '4am_mafhum-jumla_P2'],
      color: 'amber', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتدرّب' },
    { id: '04', number: 4, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — مصلحة الحالة المدنية', desc: 'مسألة الدرس: 42 عاملًا قبل التقاعد وبعده، ثم توظيف 10 عمّال. حلّ كامل خطوة بخطوة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_mafhum-jumla_P1', '4am_mafhum-jumla_P2', '4am_mafhum-jumla_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '05', number: 5, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — مكتبة الحيّ في الدخول المدرسي', desc: 'كراريس كبيرة وصغيرة: أيّ تسجيل صحيح؟ وتصريح بمدخول مستحيل.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_mafhum-jumla_P1', '4am_mafhum-jumla_P2', '4am_mafhum-jumla_P3', '4am_mafhum-jumla_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — مزرعة الدجاج والأرانب', desc: '50 رأسًا و 140 رِجلًا: قول خاطئ، تجريب، ثم ثمن البيع.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_mafhum-jumla_P1', '4am_mafhum-jumla_P2', '4am_mafhum-jumla_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'ستة أسئلة تُقيّم الكفاءات الأربع.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 7, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
