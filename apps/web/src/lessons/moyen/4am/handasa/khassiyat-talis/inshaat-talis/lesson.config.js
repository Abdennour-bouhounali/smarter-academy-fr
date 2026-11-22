/**
 * الدرس 3 — إنشاءات هندسية وتطبيقات خاصية طالس (تقسيم قطعة مستقيم) (unité 9 « خاصية طالس », manuel pp. 103–113).
 * La leçon n'a PAS d'activité du manuel : son entrée est le laboratoire `segment-divider` (déclaré
 * `platform_adaptation`, comme `tarrid-mushkila` de l'unité 4) ; ses éléments du manuel sont des طرائق
 * (pp. 107, 109), un دوري الآن (p. 109), quatre exercices (17, 18, 19 p. 111 ; 21 p. 113) et l'item 4 du QCM
 * (p. 112) — extraction › destinations.
 *
 * Le parcours, module par module (REAL → DISCOVER → MANIPULATE → UNDERSTAND → TOUCH → FORMALIZE → AUTOMATIZE → TRANSFER) :
 *   0 أستعدّ               diagnostic : parallèle à l'équerre, report au compas, proportion, Thalès (L1),
 *                          réciproque (L2), droite des milieux, Pythagore
 *   1 اللافتة (trigger)     REAL (le tifo du derby : 10 ÷ 3 ne se mesure pas) → MANIPULATE (règle, compas, équerre)
 *                          → UNDERSTAND (combien de marques, pourquoi Thalès, l'ouverture n'importe pas) →
 *                          la méthode du manuel (طرائق ص 107) révélée ligne à ligne
 *   2 طرائق (discovery)    TOUCH → FORMALIZE : le point de rapport 3/2 (ص 109) et le second point K/N, دوري الآن 2/5 au
 *                          laboratoire, la longueur 14/3 (ص 107), puis 2√13/3 (plateforme, déclaré)
 *   3 أوظّف (practice_lab)  AUTOMATIZE → TRANSFER : تمارين 17, 18, 19, 21
 *   puis trois « مسائل » de la plateforme (modules 4–6)
 *   7 إختبار أولي (evaluation)
 *
 * Le module 2 porte le stage `discovery` (comme les طرائق de `tawzif-khawass-judhur`) : la leçon a sa carte
 * des connaissances, qui formalise en continu — aucun module `formalization` n'est requis (validate-lessons).
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Module 1 — entrée retenue : le tifo du derby (labo `segment-divider`, niveau مبتدئ : 10 cm ÷ 3 ne se mesure pas, la main
 *   règle, compas et équerre) — c'est déjà une situation de la plateforme (le manuel n'a pas d'activité) ; elle passe de la carte
 *   au `lead` du labo, qui ouvre le module. Rejetée : la طريقة p. 107 du manuel comme entrée (une solution à lire) — elle reste
 *   à l'étape 4, après que l'élève a construit lui-même. Étape 1 : POURQUOI 3 marques (sur sa dernière construction).
 *   Module 2 — le labo « دوري الآن » (CA/CB = 2/5, les deux points) passe EN TÊTE : l'élève cherche les deux points avant que les
 *   طرائق (3 : 2, la longueur 14/3) ne nomment la construction ; l'étape 3 interroge ses deux points. Les briques restent
 *   après leur question.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/handasa/inshaat-talis';

export const LESSON_CONFIG = {
  id: 'inshaat-talis',
  kind: 'lesson',
  unit: 'khassiyat-talis',
  unitTitle: 'خاصية طالس',
  sequentialUnlock: true,
  // Regard de l'élève : 'mission' (modèle du pilote qasim-adad-tabii, VALIDÉ par le propriétaire le 2026-11-08 ; rollout leçon par leçon,
  // docs/reports/MISSION_ROLLOUT_PROGRESS.md — unité 9, leçon 3, 2026-11-10) — implique le regard « focus » ; l'enseignant et le mode classe ne voient
  // aucun changement.
  studentView: 'mission',
  // LA MISSION : l'ouverture avoue qu'on ne sait pas encore la résoudre ; les outils sont les connaissances de knowledge.jsx ; les points d'étape
  // (conseil du 2026-11-10, verdict L3) RAPPROCHENT de la mission sans en résoudre aucune question : ni ses nombres (10 cm, 4/3, 3/4, 4/7, 3/7,
  // 40/7, 30/7, 40, 30, 35, 20, 15, 650, 600…), ni sa méthode (deux parallèles graduées, côtés opposés / même côté), ni sa correction (passer de
  // MA/MB à AM/AB) — content/mission.test.js et _unit/missionStrings.test.js. La scène : la banderole du derby au sol (« tifo-banner »).
  mission: {
    scene: 'tifo-banner',
    title: 'لافتة الدربي: أين نفصل الشريطين؟',
    opening: {
      text: 'يخيط أنصار فريق الحيّ لافتة «تيفو» للدربي من شريطين: أخضر ثم أحمر. على ورقة التصميم اللافتة $[AB]$ طولها 10 cm، والنقطة $M$ التي تفصل الشريطين يجب أن تحقّق $\\dfrac{MA}{MB} = \\dfrac{4}{3}$ . الطول $AM$ لا يُقاس بالضبط بمسطرة مدرّجة. كيف تنشئ $M$ بالمسطرة غير المدرّجة والمدور فقط؟ وكم مترًا من كل قماش يلزم للافتة الحقيقية؟',
      cta: 'لا أعرف بعد… هيا نجمع الأدوات',
    },
    tools: [
      { id: 'taqsim-qitaa', icon: '✂️', label: 'تقسيم قطعة إلى قطع متقايسة' },
      { id: 'nuqta-nisba', icon: '🎯', label: 'نقطة تقسم قطعة بنسبة معلومة' },
      { id: 'nuqtatan', icon: '↔️', label: 'نقطتان من المستقيم نفسه' },
    ],
    climaxModule: 4,
    checkpoints: [
      {
        id: 'cp-alama', afterModule: 1,
        prompt: 'نريد تقسيم قطعة [AB] إلى 6 قطع متقايسة. بعد تعيين العلامات المتقايسة على نصف المستقيم، أيّ علامة نصلها بالنقطة B؟',
        options: ['العلامة السادسة', 'العلامة الخامسة', 'العلامة السابعة'],
        correct: 0,
        explain: 'عدد القطع هو رتبة العلامة الموصولة بالنقطة B: لست قطع نصل العلامة السادسة.',
      },
      {
        id: 'cp-juz-kull', afterModule: 2,
        prompt: 'قُسمت [AB] إلى 8 قطع متقايسة، و M هي نقطة التقسيم الثالثة ابتداءً من A. أيّ كتابة تقارن الجزء AM بالقطعة كلها AB؟',
        options: ['$\\dfrac{AM}{AB} = \\dfrac{3}{8}$', '$\\dfrac{AM}{AB} = \\dfrac{3}{5}$', '$\\dfrac{AM}{AB} = \\dfrac{8}{3}$'],
        correct: 0,
        explain: 'AM ثلاث قطع من ثماني: $\\dfrac{AM}{AB} = \\dfrac{3}{8}$ . أما $\\dfrac{3}{5}$ فتقارن AM بالجزء الباقي MB (خمس قطع)، لا بالكل.',
      },
      {
        id: 'cp-sharit', afterModule: 3,
        prompt: 'شريط [AB] طوله 12 cm قُسم إلى 4 قطع متقايسة، و $M_3$ هي نقطة التقسيم الثالثة ابتداءً من A. ما الطول $AM_3$ ؟',
        options: ['9 cm', '3 cm', '8 cm'],
        correct: 0,
        explain: 'طول القطعة الواحدة $12 \\div 4 = 3$ cm، و $AM_3$ ثلاث قطع: $3 \\times 3 = 9$ cm.',
      },
    ],
  },
  title: 'إنشاءات هندسية وتطبيقات خاصية طالس (تقسيم قطعة مستقيم)',
  description: 'بالمسطرة غير المدرجة والمدور فقط: نقسم قطعة مستقيم إلى قطع متقايسة أو بنسبة معطاة، وننشئ قطعة طولها معلوم بكسر مثل $\\dfrac{14}{3}$ ، ونبرّر كل إنشاء بخاصية طالس.',
  level: 'moyen',
  grade: '4am',
  chapter: 'handasa',
  chapterTitle: 'ميدان الهندسة',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🧭',
  estimatedDurationMin: 45,
  textbookRef: { unit: 9, activity: 0, pages: '107, 109, 111, 113' },
  skills: [
    'تقسيم قطعة مستقيم إلى قطع متقايسة بنصف مستقيم مساعد وموازيات، دون قياس',
    'تبرير التقسيم بخاصية طالس: نقطة التقسيم رقم k تحقّق $\\dfrac{AM_k}{AB} = \\dfrac{k}{n}$',
    'إنشاء النقطة التي تقسم قطعة بنسبة معلومة، داخل القطعة وخارجها',
    'إنشاء قطعة طولها معلوم بكسر (الرابع المتناسب) أو بعدد غير ناطق مثل $\\dfrac{2\\sqrt{13}}{3}$',
  ],
  teachingScope: {
    include: [
      'المسطرة غير المدرّجة والمدور والكوس: نقل الأطوال ورسم الموازيات',
      'طرائق ص 107: تقسيم قطعة مستقيمة، إنشاء قطعة طولها $\\dfrac{14}{3}$',
      'طرائق ص 109: النقطة M حيث $\\dfrac{MA}{MB} = \\dfrac{3}{2}$ ، والنقطة الثانية خارج [AB]، ودوري الآن',
      'التمارين 17 و 18 و 19 (ص 111) و 21 (ص 113)',
      'طول غير ناطق: وتر مثلث قائم ثم ثلثاه (مثال من المنصّة)',
    ],
    exclude: [
      'اكتشاف خاصية طالس وحساب الأطوال (الدرس 1)',
      'الخاصية العكسية وإثبات التوازي (الدرس 2)، إلا تذكيرًا في التمرين 21',
      'قياس الأطوال بالمسطرة المدرّجة',
    ],
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // La carte TOUTE OUVERTE (règle des pilotes, propriétaire 2026-11-08) : toutes les connaissances dès le début, sans verrou par محور.
  knowledgeMapOpen: true,
  // Les acquis que « أستعدّ » diagnostique (années précédentes et leçons 1–2 de l'unité).
  priorKnowledge: ['insha-muwazi', 'qitaa-mutaqayisa', 'kitabat-tanasub', 'talis-nisab', 'talis-aksiya', 'mustaqim-muntasafayn', 'fithaghuris'],
  // « مسألة الدرس » (MASAIL_GENERATION_GUIDE.md) : la banderole du laboratoire متقدم (deux parallèles graduées, rapport
  // MA/MB), d'autres nombres (4/3 sur 10 cm). Montrée au sommaire et au module 1, résolue au module 4. Sa figure est ICI
  // (littéraux ; content/problems.js la référence) : la carte de la leçon la dessine.
  lessonProblem: {
    module: 4,
    title: 'لافتة الدربي: شريطان بنسبة 4 إلى 3',
    statement: 'يحضّر أنصار فريق الحيّ لافتة «تيفو» جديدة للدربي تُخاط من شريطين: أخضر ثم أحمر، ويتعاونون على خياطتها بروح رياضية. على ورقة التصميم رسموا اللافتة $[AB]$ بطول 10 cm، ويريدون النقطة $M$ من $[AB]$ التي تفصل الشريطين بحيث $\\dfrac{MA}{MB} = \\dfrac{4}{3}$ . الطول $AM$ لا يُقاس بالضبط بمسطرة مدرّجة، فأنشؤوا $M$ بالمسطرة غير المدرّجة والمدور كما في الشكل: $(d_1)$ و $(d_2)$ مستقيمان متوازيان يشملان $A$ و $B$ ومدرّجان بنفس الوحدة. سيحضر الدربي نحو 3000 مناصر. اللافتة الحقيقية طولها 35 m، والقماش الأخضر بـ 650 دج للمتر والقماش الأحمر بـ 600 دج للمتر.',
    // u = (0,6 ; 0,8) : AF = 4 et BE = 3 graduations de part et d'autre de (AB) ; M = A + 40/7 (problems.test.js le recalcule).
    figure: {
      points: {
        A: [3, 4], B: [13, 4], F: [0.6, 0.8], E: [14.8, 6.4], M: [8.714285714285714, 4],
        f1: [2.4, 3.2], f2: [1.8, 2.4], f3: [1.2, 1.6], e1: [13.6, 4.8], e2: [14.2, 5.6],
      },
      lines: [
        { through: ['F', 'A'], extend: [0.25, 0.9], tone: 'indigo', name: '(d₁)' },
        { through: ['B', 'E'], extend: [1.4, 0.35], tone: 'indigo', name: '(d₂)' },
      ],
      segments: [
        { from: 'A', to: 'B', bold: true },
        { from: 'A', to: 'f1', ticks: 1 }, { from: 'f1', to: 'f2', ticks: 1 }, { from: 'f2', to: 'f3', ticks: 1 }, { from: 'f3', to: 'F', ticks: 1 },
        { from: 'B', to: 'e1', ticks: 1 }, { from: 'e1', to: 'e2', ticks: 1 }, { from: 'e2', to: 'E', ticks: 1 },
        { from: 'F', to: 'E', tone: 'rose' },
      ],
      hidden: ['f1', 'f2', 'f3', 'e1', 'e2'],
      labels: { A: 'nw', B: 'se', F: 'w', E: 'e', M: 'n' },
      ariaLabel: 'اللافتة [AB] ومستقيمان متوازيان (d1) و (d2) يشملان A و B ومدرّجان بنفس الوحدة، F على (d1) تحت A بأربع تدريجات و E على (d2) فوق B بثلاث تدريجات، والمستقيم (EF) يقطع [AB] في M',
      maxWidth: 360,
    },
  },
  resources: [
    // Module 1 : l'entrée (pas d'activité du manuel). مبتدئ (défaut) : la banderole du tifo en 3 parts — la
    // méthode générale du rayon auxiliaire ; متقدم : le point M de rapport 3/2 de la طريقة p. 109 (et le second point).
    {
      kind: 'manipulation', code: 'segment-divider-tifo-3', type: 'segment-divider', module: 1,
      level: 'beginner',
      title: 'لافتة التيفو: ثلاث قطع متقايسة',
      objective: 'تقسيم قطعة مستقيم بالمسطرة غير المدرّجة والمدور: قطع متقايسة على مستقيم مساعد وموازيات، وخاصية طالس تبرّر التقسيم',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'tifo' },
      learningPointIds: ['4am_inshaat-talis_P1'],
      sourceElementIds: ['method-divide'],
    },
    {
      kind: 'manipulation', code: 'segment-divider-ratio-3-2', type: 'segment-divider', module: 1,
      level: 'advanced',
      title: 'نقطة تقسم اللافتة بنسبة 3 إلى 2',
      objective: 'تقسيم قطعة مستقيم بالمسطرة غير المدرّجة والمدور: قطع متقايسة على مستقيم مساعد وموازيات، وخاصية طالس تبرّر التقسيم',
      autonomy: 'مستقيمان متوازيان يدرّجهما التلميذ بنفسه من الجهتين: يختار عدد العلامات على كل مستقيم وجهتها دون أي اقتراح، ويبحث عن نقطتين من (AB) تحقّقان النسبة — داخل [AB] وخارجها',
      experience: { type: 'platform_adaptation', reason: 'improved_interactivity_and_age_appropriateness', theme: 'tifo' },
      learningPointIds: ['4am_inshaat-talis_P1', '4am_inshaat-talis_P2'],
      sourceElementIds: ['method-ratio-point'],
    },
    // Les trois « مسائل » (modules 4–6) : des ajouts de la plateforme, de type امتحان.
    { kind: 'situation', code: 'masala-1', module: 4, title: 'مسألة الدرس — لافتة الدربي: شريطان بنسبة 4 إلى 3', learningPointIds: ['4am_inshaat-talis_P1'] },
    { kind: 'situation', code: 'masala-2', module: 5, title: 'مسألة — ورشة النجارة: واجهة خزانة بثلاثة أدراج', learningPointIds: ['4am_inshaat-talis_P1'] },
    { kind: 'situation', code: 'masala-3', module: 6, title: 'مسألة — مخطّط ممرّ الحديقة وأحواض الزهور', learningPointIds: ['4am_inshaat-talis_P1', '4am_inshaat-talis_P2'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'عشر عبارات من السهل إلى الأصعب: خاصية طالس، والتناسب والرابع المتناسب. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'lafita', path: `${LESSON_BASE_PATH}/lafita`,
      title: 'لافتة التيفو — قطع متقايسة دون قياس', desc: 'نصف مستقيم، مدور، كوس: قسّم اللافتة إلى أشرطة متساوية، ثم برّر بخاصية طالس واكتشف طريقة ثانية.',
      stage: 'trigger', teachesLearningPointIds: ['4am_inshaat-talis_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 13, difficulty: 2, actionText: 'أقسم اللافتة' },
    { id: '02', number: 2, slug: 'taraiq', path: `${LESSON_BASE_PATH}/taraiq`,
      title: 'طرائق — نسبة معلومة وطول معلوم', desc: 'النقطة M حيث MA على MB يساوي 3 على 2 ونقطة ثانية خارج [AB]، ثم قطعة طولها $\\dfrac{14}{3}$ ، ثم طول غير ناطق.',
      stage: 'discovery', teachesLearningPointIds: ['4am_inshaat-talis_P1', '4am_inshaat-talis_P2'],
      color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'أنشئ وأبرّر' },
    { id: '03', number: 3, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'تمارين متدرّجة: وضع نقط على مستقيم بنسبة معطاة، ثم تمرين للتعمّق.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_inshaat-talis_P1', '4am_inshaat-talis_P2'],
      color: 'amber', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'أتدرّب' },
    { id: '04', number: 4, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — لافتة الدربي', desc: 'مسألة الدرس: نقطة تقسم اللافتة بنسبة 4 إلى 3، نقطة ثانية خارجها، وثمن القماش.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_inshaat-talis_P1'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '05', number: 5, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — ورشة النجارة', desc: 'واجهة خزانة تُقسم إلى أدراج دون قياس: متساوية، ثم بنسبة، ثم ثمن الشريط النحاسي.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_inshaat-talis_P1'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — ممرّ الحديقة', desc: 'طول الممرّ على المخطّط بالرابع المتناسب، مواضع أحواض الزهور، وتكلفة التجهيز.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_inshaat-talis_P1', '4am_inshaat-talis_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءتين: التقسيم بنسبة معطاة، وإنشاء طول معلوم.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 3, actionText: 'أدخل التقويم' },
  ],
};
