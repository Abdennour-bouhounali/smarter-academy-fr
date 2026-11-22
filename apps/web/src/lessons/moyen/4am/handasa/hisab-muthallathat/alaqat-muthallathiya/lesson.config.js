/**
 * الدرس 3 — العلاقات بين النسب المثلثية والإنشاءات الهندسية (unité 10 « حساب المثلثات في المثلث القائم », manuel
 * pp. 117, 120, 121, 123–125). Ses éléments du manuel (extraction › destinations) : نشاط 5 (p. 117) → module 1,
 * معارف 4 (p. 120) → module 2, طرائق « استعمال العلاقات المثلثية » et « إنشاء هندسي لزاوية حادة… », دوري الآن
 * (p. 121) → module 3, تمارين 16–22 (p. 123) et 30 (p. 125) → module 4, l'item 6 du QCM (p. 124) → module 8.
 *
 * Le parcours, module par module (REAL → DISCOVER → MANIPULATE → UNDERSTAND → TOUCH → FORMALIZE → AUTOMATIZE → TRANSFER) :
 *   0 أستعدّ               diagnostic : Pythagore, carrés de fractions et de racines, racine d'un quotient, définitions
 *                          et bornes des rapports (درس 1)
 *   1 نشاط 5 (trigger)      REAL (le cerf-volant sur la plage) → MANIPULATE (angle-compass : construire l'angle d'un
 *                          rapport ; la barre des carrés remplit 1) → UNDERSTAND (le tableau de نشاط 4, la conjecture)
 *                          → la preuve par Pythagore
 *   2 معارف 4 (discovery)   FORMALIZE : l'encadré du manuel (coquille corrigée), la notation sin²x, l'exemple 60°
 *   3 طرائق (formalization) TOUCH → AUTOMATIZE : cos 0,6 → sin 0,8 → tan 4/3 ; دوري الآن 1 ; « إن أمكن » ;
 *                          la construction (sin 2/5, tan 7/3) ; دوري الآن 2 (cos 3/4) FAIT au laboratoire posé seul
 *   4 أوظّف (practice_lab)  AUTOMATIZE → TRANSFER : تمارين 16–22 و 30
 *   puis trois « مسائل » de la plateforme (modules 5–7 ; content/problems.js)
 *   8 إختبار أولي (evaluation)
 *
 * Le laboratoire est dans le module 1 (choix de l'auteur) : construire l'angle d'un rapport, c'est construire un
 * triangle rectangle — et c'est sur CE triangle que cos² + sin² = 1 se voit avant d'être prouvé ; l'activité 5 du
 * manuel n'est pas le niveau avancé du laboratoire (son avancé est la طريقة de construction p. 121), donc le
 * workspace ouvre sur مبتدئ (règle du brief §2) et aucune étape n'attend `onFinished`.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : le cerf-volant sur la plage (labo angle-compass, مبتدئ sin x = 3/5) — la main construit au compas l'angle
 *   d'un sinus ; le triangle 3-4-5 fait apparaître cos = 4/5 et 9/25 + 16/25 = 1 AVANT toute conjecture (ajout déclaré de la
 *   plateforme, `platform_designed_entry`). Rejetée : le نشاط 5 du livre comme entrée (le tableau ARRONDI de نشاط 4 à remplir,
 *   0,87² + 0,50² = 1,0069, puis « ضع تخمينا » : un calcul de tableau dont la conjecture se répond de mémoire) ; il devient
 *   l'étape 2–3 APRÈS le labo. Ordre des idées : le labo seul (plus de carte `brief`, ni titre ni lead du workspace ni titre du labo) →
 *   cos lu sur SON triangle → le tableau et la conjecture (brique après) → la preuve par Pythagore → tan = sin/cos (brique après) ;
 *   معارف : la question « qu'avez-vous prouvé ? » AVANT l'encadré du manuel et la brique `alaqatan` ; طرائق : le labo
 *   دوري الآن (2) (cos 3/4) EN TÊTE du module, ses questions d'abord, puis cos 0,6 → دوري الآن 1 → « إن أمكن » → la طريقة de
 *   construction (figures et solutions du livre) révélée APRÈS la question « pourquoi le compas ici et pas là », puis `insha-zawiya`.
 *   Aucune destination du manuel n'a bougé.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/handasa/alaqat-muthallathiya';

export const LESSON_CONFIG = {
  id: 'alaqat-muthallathiya',
  kind: 'lesson',
  unit: 'hisab-muthallathat',
  unitTitle: 'حساب المثلثات في المثلث القائم',
  sequentialUnlock: true,
  // « مسألة الدرس » : le monde du laboratoire متقدم (construire au compas l'angle d'un sinus donné), d'autres nombres ;
  // montrée dès le sommaire et rappelée à la fin du module 1, résolue au module 5 (content/problems.js).
  lessonProblem: {
    module: 5,
    title: 'طائرة يونس الورقية: زاوية جيبها 3 على 7',
    statement: 'على شاطئ تيشي ببجاية، نظّف يونس مكانه من القارورات المتروكة ثم راح يطيّر طائرته الورقية والخيط مشدود، كما في الشكل المقابل: الخيط $[YT]$ وتر مثلث قائم في $H$ ، و $[TH]$ ارتفاع الطائرة، و $[YH]$ المسافة على الرمل. يقيس جهاز صغير مثبّت في بكرة الخيط جيب الزاوية $x$ بين الخيط والرمل، فيقرأ: $\\sin x = \\dfrac{3}{7}$ . فكّ يونس من البكرة 35 m من الخيط، واشترى طائرته بـ 1200 دج. يريد يونس أن يرسم الزاوية $x$ في كرّاسه دون منقلة، ثم أن يعرف نسبها الأخرى بالضبط.',
    figure: {
      points: { Y: [0, 0], H: [6.32, 0], T: [6.32, 3] },
      segments: [{ from: 'Y', to: 'T', bold: true, tone: 'indigo' }, ['T', 'H'], ['Y', 'H']],
      rightAngles: [['Y', 'H', 'T']],
      angles: [{ at: 'Y', from: 'H', to: 'T', label: 'x' }],
      labels: { Y: 'sw', H: 'se', T: 'n' },
      ariaLabel: 'الخيط YT وتر مثلث قائم في H: T الطائرة، و TH ارتفاعها، و YH المسافة على الرمل، و x قيس الزاوية بين الخيط والرمل عند Y',
      maxWidth: 320,
    },
  },
  title: 'العلاقات بين النسب المثلثية والإنشاءات الهندسية',
  description: 'من خاصية فيثاغورس نثبت $\\cos^2 x + \\sin^2 x = 1$ و $\\tan x = \\dfrac{\\sin x}{\\cos x}$ ، فنحسب القيمة المضبوطة لنسبة من نسبة أخرى دون حساب قيس الزاوية، وننشئ بالمسطرة والمدور، دون منقلة، زاوية حادة علمت إحدى نسبها.',
  level: 'moyen',
  grade: '4am',
  chapter: 'handasa',
  chapterTitle: 'ميدان الهندسة',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🪁',
  estimatedDurationMin: 55,
  textbookRef: { unit: 10, activity: 5, pages: '117, 120, 121, 123, 125' },
  skills: [
    'إثبات العلاقتين $\\cos^2 x + \\sin^2 x = 1$ و $\\tan x = \\dfrac{\\sin x}{\\cos x}$ بخاصية فيثاغورس',
    'حساب القيمة المضبوطة لجيب زاوية أو جيب تمامها أو ظلها إذا عُلمت نسبة أخرى، والتأكّد أن النسبة ممكنة',
    'إنشاء زاوية حادة علمت إحدى نسبها، بالكوس والمسطرة والمدور دون منقلة، ثم التحقّق بالحاسبة وبالمنقلة',
  ],
  teachingScope: {
    include: [
      'نشاط 5 ص 117: التخمين من جدول النشاط 4 ثم البرهان بخاصية فيثاغورس',
      'معارف 4 ص 120: العلاقتان، الكتابة $\\sin^2 x$ ، مثال $60^{\\circ}$',
      'طرائق ص 121: من $\\cos x = 0{,}6$ إلى $\\sin x$ و $\\tan x$ ؛ إنشاء زاوية جيبها $\\dfrac{2}{5}$ وزاوية ظلها $\\dfrac{7}{3}$ ؛ دوري الآن',
      'التمارين 16 إلى 22 (ص 123) و 30 (ص 125)، والقيم المضبوطة لزوايا $30^{\\circ}$ و $45^{\\circ}$ و $60^{\\circ}$',
    ],
    exclude: [
      'تعريف النسب المثلثية (الدرس 1) واستعمال الحاسبة للتدوير (الدرس 2)، إلا تذكيرًا',
      'حساب الأطوال والزوايا في وضعيات (الدرس 4)',
      'النسب المثلثية لزاوية غير حادة',
    ],
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Les acquis que « أستعدّ » diagnostique (années précédentes et درس 1 de l'unité).
  priorKnowledge: ['fithaghuris', 'murabba-kasr', 'murabba-jadhr', 'tabsit-jadhr', 'taarif-nisab', 'hasr-nisab'],
  resources: [
    // Module 1 : مبتدئ (défaut) — la plateforme : sin x = 3/5, le triangle 3-4-5 où cos = 4/5 se LIT et 9/25 + 16/25 = 1 ;
    // متقدم — la طريقة p. 121 : sin x = 2/5 au compas, puis tan x = 7/3 à la règle (le choix de l'outil est l'enjeu).
    {
      kind: 'manipulation', code: 'angle-compass-kite-3-5', type: 'angle-compass', module: 1,
      level: 'beginner',
      title: 'على الشاطئ: زاوية جيبها 3 على 5',
      objective: 'إنشاء زاوية حادة علمت إحدى نسبها بمثلث قائم تحقّق أطواله هذه النسبة، وملاحظة أن $\\cos^2 x + \\sin^2 x = 1$ في كل مثلث قائم',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'kite' },
      learningPointIds: ['4am_alaqat-muthallathiya_P1', '4am_alaqat-muthallathiya_P3'],
      sourceElementIds: ['act-5'],
    },
    {
      kind: 'manipulation', code: 'angle-compass-2-5-7-3', type: 'angle-compass', module: 1,
      level: 'advanced',
      title: 'طرائق ص 121: جيبها 2 على 5 ، ثم ظلها 7 على 3',
      objective: 'إنشاء زاوية حادة علمت إحدى نسبها بمثلث قائم تحقّق أطواله هذه النسبة، وملاحظة أن $\\cos^2 x + \\sin^2 x = 1$ في كل مثلث قائم',
      autonomy: 'زاويتان من الكتاب دون أي اقتراح للأداة: التلميذ يقرّر بنفسه أيّ العددين وتر (المدور) وأيّهما ضلع للزاوية القائمة، ويغيّر الأداة بين الجيب والظل، ويعيّن رأس الزاوية x',
      experience: { type: 'platform_adaptation', reason: 'improved_interactivity_and_age_appropriateness', theme: 'kite' },
      learningPointIds: ['4am_alaqat-muthallathiya_P3'],
      sourceElementIds: ['method-construct'],
    },
    // Les trois « مسائل » (modules 5–7) : exercices complets de type امتحان, ajouts de la plateforme (content/problems.js),
    // sans aucune preuve de maîtrise.
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — طائرة يونس الورقية: زاوية جيبها 3 على 7', learningPointIds: ['4am_alaqat-muthallathiya_P1', '4am_alaqat-muthallathiya_P2', '4am_alaqat-muthallathiya_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — لافتة الطريق الجبلي: ميل بالنسبة المئوية', learningPointIds: ['4am_alaqat-muthallathiya_P1', '4am_alaqat-muthallathiya_P2'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — ميل اللوح الشمسي وقالب الحدّاد', learningPointIds: ['4am_alaqat-muthallathiya_P1', '4am_alaqat-muthallathiya_P2', '4am_alaqat-muthallathiya_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: خاصية فيثاغورس، مربع كسر ومربع جذر، جذر كسر، تعريف الظل، وحدود الجيب. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat-5', path: `${LESSON_BASE_PATH}/nashat-5`,
      title: 'نشاط 5 — العلاقات المثلثية', desc: 'طائرة ورقية على الشاطئ: أنشئ زاوية من جيبها بالكوس والمدور، ثم خمّن من جدول النشاط 4 وبرهن بخاصية فيثاغورس.',
      stage: 'trigger', teachesLearningPointIds: ['4am_alaqat-muthallathiya_P1', '4am_alaqat-muthallathiya_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 13, difficulty: 2, actionText: 'أطيّر الطائرة' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف 4 — العلاقات المثلثية', desc: 'العلاقتان كما يكتبهما الكتاب (مع تصحيح خطأ مطبعي)، معنى الكتابة $\\sin^2 x$ ، ومثال الزاوية $60^{\\circ}$ .',
      stage: 'discovery', teachesLearningPointIds: ['4am_alaqat-muthallathiya_P1'],
      color: 'violet', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'أكتب العلاقتين' },
    { id: '03', number: 3, slug: 'taraiq', path: `${LESSON_BASE_PATH}/taraiq`,
      title: 'طرائق — نسبة من نسبة، وزاوية بالمدور', desc: 'من $\\cos x = 0{,}6$ إلى $\\sin x$ و $\\tan x$ ، دوري الآن، « إن أمكن »، ثم إنشاء زاوية جيبها أو ظلها معلوم — ودوري الآن في المختبر.',
      stage: 'formalization', teachesLearningPointIds: ['4am_alaqat-muthallathiya_P2', '4am_alaqat-muthallathiya_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 13, difficulty: 3, actionText: 'أحسب وأنشئ' },
    { id: '04', number: 4, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'تمارين الكتاب 16 إلى 22 (العلاقات والإنشاءات) و 30 (أتعمّق).',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_alaqat-muthallathiya_P1', '4am_alaqat-muthallathiya_P2', '4am_alaqat-muthallathiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — طائرة يونس الورقية', desc: 'مسألة الدرس: ننشئ دون منقلة زاوية جيبها $\\dfrac{3}{7}$ ، ثم نحسب جيب تمامها وظلها، ونحكم على زاوية أمين.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_alaqat-muthallathiya_P1', '4am_alaqat-muthallathiya_P2', '4am_alaqat-muthallathiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — لافتة الطريق الجبلي', desc: 'من الجيب إلى جيب التمام ثم الظل: ميل الطريق بالنسبة المئوية، لافتة خاطئة، وطريق التفافي للشاحنات.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_alaqat-muthallathiya_P1', '4am_alaqat-muthallathiya_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — اللوح الشمسي', desc: 'نسب زاوية ميل لوح شمسي، تقرير مستحيل نكشفه بالعلاقة، وقالب للزاوية بالكوس والمسطرة وحدهما.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_alaqat-muthallathiya_P1', '4am_alaqat-muthallathiya_P2', '4am_alaqat-muthallathiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث: العلاقتان، نسبة من نسبة، إنشاء زاوية.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 3, actionText: 'أدخل التقويم' },
  ],
};
