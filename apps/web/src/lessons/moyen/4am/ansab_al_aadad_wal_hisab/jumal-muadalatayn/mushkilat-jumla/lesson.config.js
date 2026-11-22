/**
 * الدرس 3 — حل مشكلات بتوظيف جمل معادلتين من الدرجة الأولى بمجهولين (unité 5, 4AM). Le manuel fixe les الكفاءات (نشاط 3, le تحدّ, أبو كامل,
 * exercices 14–21 et 24–28, item 7 de « أؤكّد تعلّماتي ») ; le parcours, les histoires et les nombres sont ceux de la PLATEFORME.
 *
 * LECTEUR DE MISSION (rollout 2026-11-12 ; conseil du 2026-11-11, verdict L3.1–L3.16, X1–X11) : la مسألة « متحف الولاية » (module 4) est le
 * seul endroit où des PERSONNES entrent à deux prix ; avant elle, le labo `story-modeller` compte des OBJETS (content/stories.js) et aucun écran ne
 * montre sa signature (content/forbidden.js, _unit/signatures/mushkilat-jumla.js). Module 1 : « نادي الرسم » à la main (la ligne tapée), « مكتبة
 * الحيّ » argent + argent avec un nombre muet, le défi ⭐ ; module 2 : « دفتر التعاونية », la jumla a une solution que l'histoire REFUSE ; puis la
 * حصّالة grandie, un problème « على طريقة أبي كامل » et « ورقة وئام ».
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/ansab_al_aadad_wal_hisab/mushkilat-jumla';

export const LESSON_CONFIG = {
  id: 'mushkilat-jumla',
  kind: 'lesson',
  unit: 'jumal-muadalatayn',
  unitTitle: 'جمل معادلتين من الدرجة الأولى بمجهولين',
  studentView: 'mission',
  knowledgeMapOpen: true,
  mission: {
    scene: 'museum-desk',
    title: 'شبّاك متحف الولاية: كم بالغًا وكم صغيرًا؟',
    opening: {
      text: 'يعرف مدير المتحف كم زائرًا دخل اليوم وكم دينارًا جمع الشبّاك، لكنه لا يعرف كم بالغًا وكم صغيرًا بينهم. كيف نجد العددين من معلومتين فقط؟',
      cta: 'لا أعرف بعد… هيا نجمع الأدوات',
    },
    tools: [
      { id: 'jumla-tarjama', icon: '🧩', label: 'من القصة إلى الجملة' },
      { id: 'khutuwat-hall', icon: '🪜', label: 'خمس مراحل للحل' },
      { id: 'tahaqquq-nas', icon: '✅', label: 'القصة تقبل الجواب أو ترفضه' },
    ],
    climaxModule: 4,
    checkpoints: [
      {
        id: 'cp-ajal', afterModule: 1,
        prompt: 'في موقف الدرّاجات درّاجات بعجلتين ودرّاجات بثلاث عجلات. نسمّي $x$ عدد الدرّاجات بعجلتين و $y$ عدد الدرّاجات بثلاث عجلات. المعلومة «عدد العجلات 54» تُكتب:',
        options: ['$2x + 3y = 54$', '$x + y = 54$', '$x + 3y = 54$'],
        correct: 0,
        explain: 'كل درّاجة تُحسب بعدد عجلاتها: $2x + 3y = 54$ . مثلًا 12 درّاجة بعجلتين و 10 بثلاث عجلات: $24 + 30 = 54$ عجلة. أمّا $x + y$ فيعدّ الدرّاجات لا العجلات.',
      },
      {
        id: 'cp-jawab', afterModule: 2,
        prompt: 'كم حافلة صغيرة وكم حافلة كبيرة استأجرت المدرسة؟ نسمّي $x$ عدد الحافلات الصغيرة و $y$ عدد الكبيرة، ووجدنا $x = 6$ و $y = 9$ . أيّ جملة تجيب عن سؤال القصة؟',
        options: ['استأجرت المدرسة 6 حافلات صغيرة و 9 حافلات كبيرة.', '$(6 ; 9)$', 'استأجرت المدرسة 15 حافلة.'],
        correct: 0,
        explain: 'الجواب جملة تذكر العددين، كلّ بما يمثّله. الثنائية وحدها لا تقول أيّ عدد للصغيرة، و 15 حافلة لا تجيب عن «كم من كل نوع».',
      },
      {
        id: 'cp-muhit', afterModule: 3,
        prompt: 'مستطيل محيطه 46 سم، نسمّي $x$ طوله و $y$ عرضه. معلومة المحيط تُكتب:',
        options: ['$2(x + y) = 46$', '$x + y = 46$', '$xy = 46$'],
        correct: 0,
        explain: 'المحيط مجموع الأضلاع الأربعة: $2(x + y) = 46$ ، أي $x + y = 23$ نصف المحيط. أمّا $xy$ فهي المساحة.',
      },
    ],
  },
  sequentialUnlock: true,
  title: 'حل مشكلات بتوظيف جمل معادلتين من الدرجة الأولى بمجهولين',
  description: 'ترييض وضعيات من الحياة اليومية ومسائل هندسية وعددية بجملة معادلتين: اختيار المجهولين المناسبين x و y، ترجمة معطيات النص إلى جملة معادلتين، حلها بطريقة جبرية مناسبة، ثم التحقق من النتائج وتفسيرها والإجابة عن سؤال المشكلة.',
  level: 'moyen',
  grade: '4am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان أنساب الأعداد والحساب',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🏟️',
  estimatedDurationMin: 57,
  textbookRef: { unit: 5, activity: 3, pages: '55, 57, 61, 62, 63' },
  skills: [
    'اختيار المجهولين المناسبين x و y: ما يسأل عنه السؤال',
    'ترجمة معطيات نص (أعداد، أثمان، أعمار، محيطات ومساحات، زوايا) إلى جملة معادلتين من الدرجة الأولى بمجهولين',
    'حل الجملة باختيار طريقة جبرية مناسبة (التعويض أو الجمع)',
    'التحقق من النتيجة في نص المشكلة نفسه وتفسيرها، ثم الإجابة عن السؤال بجملة',
  ],
  teachingScope: {
    include: [
      'من القصة إلى الجملة: مراحل الحل الخمس على قصص تعدّ أشياء أو تجمع أثمانًا',
      'حصّالة القسم ومسألة على طريقة أبي كامل بالمراحل الخمس',
      'التحقق في نص المشكلة: ما يُعدّ يكون عددًا طبيعيًا، وقصة قد ترفض حلّ الجملة',
      'عشرة تمارين من المنصّة: أعداد ونسب، محيطات ومساحات، زوايا وطالس، ومن الحياة اليومية',
    ],
    exclude: [
      'تقنيات طريقتي التعويض والجمع (الدرس 2)',
      'مفهوم الجملة والتحقق من ثنائية وحالات الحلول (الدرس 1)',
      'الحل البياني لجملة معادلتين',
    ],
  },
  lessonProblem: {
    module: 4,
    title: 'متحف الولاية: 180 زائرًا و 33000 دج',
    statement: 'يقترح متحف الولاية، الذي يعرّف التلاميذ بتراث الوطن، تذكرتين يوم الأحد: 250 دج للبالغين و 100 دج للصغار. يوم الأحد الماضي استقبل المتحف 180 زائرًا، وبلغت مداخيله 33000 دج. يضمّ المتحف 12 قاعة عرض، ويُفتح على الساعة 9 صباحًا. يريد المدير أن يعرف عدد البالغين وعدد الصغار الذين زاروا المتحف ذلك اليوم.',
    illustration: { kind: 'tags', cards: [{ title: 'تذكرة البالغ', icon: 'ticket', lines: [{ label: 'الثمن', value: 250, unit: 'دج' }] }, { title: 'تذكرة الصغير', icon: 'ticket', lines: [{ label: 'الثمن', value: 100, unit: 'دج' }] }, { title: 'يوم الأحد', icon: 'person', lines: [{ label: 'الزوّار', value: 180 }, { label: 'المداخيل', value: 33000, unit: 'دج' }] }], ariaLabel: 'بطاقات متحف الولاية: تذكرة البالغ 250 دج وتذكرة الصغير 100 دج، و 180 زائرًا ومداخيل 33000 دج' },
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Les acquis que « أستعدّ » diagnostique : traduire une phrase en expression ou en équation
  // (unité 4, ترييض مشكلة), périmètres et aires, pourcentages, vérifier une ثنائية (leçon 1),
  // résoudre une jumla (leçon 2).
  priorKnowledge: ['tarjama-ibara', 'muhit-misaha', 'nisba-mia', 'tahaqquq-thunaiya', 'hall-jumla'],
  resources: [
    // Module 1 : la page (enseignant, mode classe) — مبتدئ « نادي الرسم », متقدم « معرض الكتب » (histoires de la plateforme, verdict L3.10).
    // Les codes sont gardés (preuves déjà enregistrées), les titres sont ceux de la plateforme.
    {
      kind: 'manipulation', code: 'story-modeller-derby-20', type: 'story-modeller', module: 1,
      level: 'beginner',
      title: 'نادي الرسم: 12 قلمًا و 440 دج',
      objective: 'حل مشكلة بجملة معادلتين: نختار المجهولين، نترجم كل معلومة بمعادلة، نحل الجملة، نتحقق في القصة نفسها، ثم نجيب',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'museum' },
      learningPointIds: ['4am_mushkilat-jumla_P1', '4am_mushkilat-jumla_P2'],
      sourceElementIds: ['act-3'],
    },
    {
      kind: 'manipulation', code: 'story-modeller-museum-140', type: 'story-modeller', module: 1,
      level: 'advanced',
      title: 'معرض الكتب: 26 كتابًا و 2820 دج',
      objective: 'حل مشكلة بجملة معادلتين: نختار المجهولين، نترجم كل معلومة بمعادلة، نحل الجملة، نتحقق في القصة نفسها، ثم نجيب',
      autonomy: 'التلميذ يختار المجهولين بنفسه بين ما تذكره القصة (الأعداد المعطاة ترفض الحرف)، ويقرّر وحده أيّ عدد يذهب إلى أيّ خانة في كل معادلة، ثم يختار طريقة الحل ويعيد القصة بالعددين',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'museum' },
      learningPointIds: ['4am_mushkilat-jumla_P1', '4am_mushkilat-jumla_P2'],
      sourceElementIds: ['act-3'],
    },
    // Les trois « مسائل » (MASAIL_GENERATION_GUIDE.md) : la 1 prolonge le musée du niveau متقدم.
    { kind: 'situation', code: 'masala-1', module: 4, title: 'مسألة الدرس — متحف الولاية: 180 زائرًا', learningPointIds: ['4am_mushkilat-jumla_P1', '4am_mushkilat-jumla_P2'] },
    { kind: 'situation', code: 'masala-2', module: 5, title: 'مسألة — تعاونية المتوسطة: الحلوى والعصير', learningPointIds: ['4am_mushkilat-jumla_P1', '4am_mushkilat-jumla_P2'] },
    { kind: 'situation', code: 'masala-3', module: 6, title: 'مسألة — خليط التمور: دقلة نور والغرس', learningPointIds: ['4am_mushkilat-jumla_P1', '4am_mushkilat-jumla_P2'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'عشر عبارات: التحقق من ثنائية وحل جملة، وترجمة جملة إلى عبارة أو معادلة. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'mathaf', path: `${LESSON_BASE_PATH}/mathaf`,
      title: 'من القصة إلى الجملة', desc: 'من القصة إلى الجملة بيدك: اختر المجهولين، احمل أعداد القصة إلى المعادلتين، حلّ، ثم أعد القصة بالعددين.',
      stage: 'trigger', teachesLearningPointIds: ['4am_mushkilat-jumla_P1', '4am_mushkilat-jumla_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أترجم القصة' },
    { id: '02', number: 2, slug: 'marahil', path: `${LESSON_BASE_PATH}/marahil`,
      title: 'المراحل الخمس — دفتر وحصّالة', desc: 'دفتر تقبل جملته حلًّا وترفضه القصة، ثم حصّالة القسم ومسألة على طريقة أبي كامل بالمراحل الخمس.',
      stage: 'discovery', teachesLearningPointIds: ['4am_mushkilat-jumla_P1', '4am_mushkilat-jumla_P2'],
      color: 'violet', style: 'featured', estimatedMin: 13, difficulty: 3, actionText: 'أطبّق المراحل' },
    { id: '03', number: 3, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'عشرة تمارين: أعداد ونسب، حقول ومستطيلات، زوايا وطالس، مزرعة وأعمار وأوزان وعلامات.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_mushkilat-jumla_P1', '4am_mushkilat-jumla_P2'],
      color: 'amber', style: 'featured', estimatedMin: 18, difficulty: 3, actionText: 'أتدرّب' },
    { id: '04', number: 4, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — زوار المتحف', desc: 'مسألة الدرس: 180 زائرًا و 33000 دج. نختار، نترجم، نحلّ، نتحقق ونجيب — ثم تسجيل مستحيل ودخول مجاني للصغار.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_mushkilat-jumla_P1', '4am_mushkilat-jumla_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '05', number: 5, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — تعاونية المتوسطة', desc: 'يوم الأبواب المفتوحة: ثمن قطعة الحلوى وثمن قارورة العصير، ما بيع وما بقي، ثم الربح.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_mushkilat-jumla_P1', '4am_mushkilat-jumla_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — خليط التمور', desc: 'دقلة نور والغرس: كم كيلوغرامًا من كل نوع؟ طلب لا يلبّيه المخزن، ثم الربح.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_mushkilat-jumla_P1', '4am_mushkilat-jumla_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءتين: الترجمة بجملة، ثم المراحل حتى الإجابة.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 3, actionText: 'أدخل التقويم' },
  ],
};
