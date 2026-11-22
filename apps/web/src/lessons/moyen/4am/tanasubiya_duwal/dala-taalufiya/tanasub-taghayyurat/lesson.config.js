/**
 * الدرس 3 — تعيين دالة تآلفية انطلاقًا من عددين وصورتيهما (unité 7 « الدالة التآلفية », 4AM).
 * Le manuel fournit نشاط 4 « تناسب التغيّرات » (p. 79 : l'abonnement des supporters, 2000 DA + 200 DA par
 * match, les quotients, l'escalier de la figure) et le تحدّ de la page d'ouverture (p. 77, °C → °F,
 * doublon DÉCLARÉ : deux points lus). Il n'a ni معارف ni طرائق ni exercices : la propriété, sa preuve et
 * les deux méthodes sont une formalisation DÉCLARÉE de la plateforme (`knowledge_formalization`),
 * puis trois « مسائل » de la plateforme (modules 4–6).
 * Source de vérité : docs/sources/4am/unit7/extraction.json.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : l'abonnement des Éclaireurs / cadets de la plateforme (labo `slope-stairs`, niveau مبتدئ : 100 DA + 50 DA par match,
 *   monde `stadium`) — la main CHOISIT deux nombres de matchs et construit la marche entre eux : « le quotient ne bouge pas » se
 *   voit sur SES marches avant que le manuel ne donne trois quotients. Rejetée : le نشاط 4 comme carte d'ouverture suivie de ses
 *   questions de calcul (7 matchs → 3400, 4800 DA → 14 matchs, f(1), f(4)… : des calculs que l'élève fait de tête, SANS besoin de la
 *   marche) ; il reste le niveau متقدم du MÊME labo (200x + 2000, l'escalier du livre) et ses questions deviennent l'application
 *   après la brique `tanasub-taghayyurat` (étapes 2 à 5 du module 1).
 *   Ordre des idées : la marche de l'élève → « que remarques-tu dans tes quotients ? » (brique APRÈS) → les calculs du livre
 *   (S 1, 2) → les trois quotients du livre → l'escalier à compléter → module 2 : le labo « deux couples » ouvre (pas de carte),
 *   la preuve (pourquoi le quotient vaut a) PUIS la boîte et la brique, le تحدّ lu a PUIS b avec leurs briques APRÈS chaque réponse.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/tanasubiya_duwal/tanasub-taghayyurat';

export const LESSON_CONFIG = {
  id: 'tanasub-taghayyurat',
  kind: 'lesson',
  unit: 'dala-taalufiya',
  unitTitle: 'الدالة التآلفية',
  sequentialUnlock: true,
  title: 'تعيين دالة تآلفية انطلاقًا من عددين وصورتيهما',
  description: 'تناسب التغيّرات: النسبة $\\dfrac{f(x_1) - f(x_2)}{x_1 - x_2}$ ثابتة وتساوي المعامل $a$ مهما كان العددان المتمايزان، ثم تعيين $b$ وكتابة العبارة $f(x) = ax + b$ انطلاقا من عددين وصورتيهما — من اشتراك مناصري الفريق إلى تحويل الدرجة سلسيوس إلى الفهرنهايت.',
  level: 'moyen',
  grade: '4am',
  chapter: 'tanasubiya_duwal',
  chapterTitle: 'ميدان التناسبية والدوال',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🏟️',
  estimatedDurationMin: 45,
  // « مسألة الدرس » : montrée dès le sommaire (LessonProblemCard), rappelée au module 1 (prolongement de
  // l'abonnement des supporters du niveau متقدم, d'autres nombres), résolue pas à pas au module 4
  // (content/problems.js).
  lessonProblem: {
    module: 4,
    title: 'الموسم الجديد: اشتراك المناصرين بعبارة مجهولة',
    statement: 'في الموسم الرياضي الجديد غيّر المركّب الرياضي، الذي يدعو مناصريه إلى الروح الرياضية والتشجيع النظيف، صيغة اشتراك مناصري فريق المدينة: مبلغ سنوي ثابت يُدفع مرّة واحدة، يضاف إليه ثمن ثابت عند كل دخول للملعب. لم يُعلن المركّب عن المبلغين، لكنّ كريم تابع 6 مقابلات فدفع في الموسم 4100 دج، ووليد تابع 15 مقابلة فدفع 6800 دج. يتّسع الملعب لـ 20000 متفرّج، وتُلعب المقابلات يوم الجمعة على الساعة 16. نرمز بـ $f(x)$ إلى المبلغ (بالدينار) الذي يدفعه مناصر تابع $x$ مقابلة، فتكون $f$ دالة تآلفية عبارتها $f(x) = ax + b$ .',
    illustration: { kind: 'tags', cards: [{ title: 'كريم', icon: 'person', lines: [{ label: 'مقابلات', value: 6 }, { label: 'دفع', value: 4100, unit: 'دج' }] }, { title: 'وليد', icon: 'person', lines: [{ label: 'مقابلات', value: 15 }, { label: 'دفع', value: 6800, unit: 'دج' }] }, { title: 'الصيغة', icon: 'ticket', lines: [{ label: 'مبلغ سنوي', value: '؟' }, { label: 'كل دخول', value: '؟' }] }], ariaLabel: 'بطاقات اشتراك المناصرين: كريم تابع 6 مقابلات ودفع 4100 دج، ووليد تابع 15 مقابلة ودفع 6800 دج، والمبلغان الثابتان مجهولان' },
  },
  textbookRef: { unit: 7, activity: 4, pages: '77, 79' },
  skills: [
    'حساب المعامل a بخاصية تناسب التغيّرات من عددين متمايزين وصورتيهما',
    'تعليل ثبات حاصل القسمة: الحدّ الثابت b يختفي في فرق الصورتين',
    'تعيين b ثم كتابة عبارة الدالة التآلفية والتحقّق بالعدد الآخر',
    'تعيين دالة تآلفية بحلّ جملة معادلتين مجهولاها a و b',
  ],
  teachingScope: {
    include: [
      'نشاط 4 (ص 79): اشتراك مناصري فريق المدينة، الصور، حواصل القسمة، وإكمال سلّم الشكل',
      'سلّم التغيّرات (مخبر الدرس): عددان x1 و x2 يحرّكهما التلميذ، وحاصل قسمة ثابت',
      'التحدّي (ص 77): من الدرجة سلسيوس إلى الفهرنهايت بنقطتين مقروءتين، f(x) = 1,8x + 32',
      'خاصية تناسب التغيّرات وتعليلها، حساب a ثم b، وطريقة جملة معادلتين (صياغة من المنصّة)',
      'تمارين من المنصّة: معامل سالب، معامل كسري، جدول، مستقيم يمرّ بنقطتين، وضعية',
    ],
    exclude: [
      'مفهوم الدالة التآلفية وحساب الصورة والعدد الذي صورته معلومة (الدرس 1)',
      'إنشاء التمثيل البياني وقراءة a و b عليه (الدرس 2)',
      'التفسير البياني لحل جملة معادلتين (الدرس 4)',
    ],
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Les acquis que « أستعدّ » diagnostique : la notation f(x) et l'image par une fonction affine (L1), l'équation ax + b = m,
  // la جملة معادلتين (unité 5), le calcul sur les relatifs et les décimaux dans un quotient de différences.
  priorKnowledge: ['notation-fx', 'surat-adad-taalufiya', 'muadala-ax-b', 'hall-jumla', 'hisab-farq-nisbi'],
  resources: [
    // Module 1 : l'ESCALIER DES ACCROISSEMENTS (slope-stairs), monde `stadium`. متقدم = نشاط 4 tel quel
    // (f(x) = 200x + 2000, l'escalier 0→1→4→6→10→12→15 dont le manuel imprime les deux premières marches) ;
    // مبتدئ = un abonnement des cadets de la plateforme (100 DA + 50 DA par match, deux marches).
    {
      kind: 'manipulation', code: 'slope-stairs-50x100', type: 'slope-stairs', module: 1,
      level: 'beginner',
      title: 'اشتراك الأشبال: 100DA يضاف إليه 50DA للمقابلة',
      objective: 'تناسب التغيّرات: حاصل القسمة (f(x₁) − f(x₂)) ÷ (x₁ − x₂) ثابت يساوي المعامل a مهما كان العددان المتمايزان x₁ و x₂',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'stadium' },
      learningPointIds: ['4am_tanasub-taghayyurat_P1'],
      sourceElementIds: ['act-4'],
    },
    {
      kind: 'manipulation', code: 'slope-stairs-200x2000', type: 'slope-stairs', module: 1,
      level: 'advanced',
      title: 'نشاط 4: اشتراك سنوي 2000DA يضاف إليه 200DA للمقابلة',
      objective: 'تناسب التغيّرات: حاصل القسمة (f(x₁) − f(x₂)) ÷ (x₁ − x₂) ثابت يساوي المعامل a مهما كان العددان المتمايزان x₁ و x₂',
      autonomy: 'سلّم الكتاب بستّ درجات (درجتان مكتوبتان فقط) يكمله التلميذ بنفسه، وأعداد إلى 15 مقابلة ومبالغ بالآلاف: يختار درجاته ويقارن حواصل القسمة دون اقتراح، ثم ينزل إلى 0 ليقرأ b',
      experience: { type: 'textbook', reason: '', theme: 'stadium' },
      learningPointIds: ['4am_tanasub-taghayyurat_P1'],
      sourceElementIds: ['act-4'],
    },
    // Module 2 : le même laboratoire en mode « deux couples » (f inconnue). متقدم = le تحدّ (10 ; 50) et
    // (30 ; 86), monde `thermo` ; مبتدئ = un autre abonnement de la plateforme (4 ; 1300) et (10 ; 2500).
    {
      kind: 'manipulation', code: 'slope-stairs-two-points-club', type: 'slope-stairs', module: 2,
      level: 'beginner',
      title: 'اشتراك نادي الأحياء: 4 مقابلات بـ 1300DA و 10 مقابلات بـ 2500DA',
      objective: 'من عددين وصورتيهما: a بتناسب التغيّرات، ثم b = f(x₁) − a·x₁ ، فنكتب f(x) = ax + b',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'smaller_numbers_for_first_contact', theme: 'stadium' },
      learningPointIds: ['4am_tanasub-taghayyurat_P1', '4am_tanasub-taghayyurat_P2'],
      sourceElementIds: ['challenge'],
    },
    {
      kind: 'manipulation', code: 'slope-stairs-celsius-fahrenheit', type: 'slope-stairs', module: 2,
      level: 'advanced',
      title: 'تحدّ: من 10 و 30 درجة سلسيوس إلى الفهرنهايت',
      objective: 'من عددين وصورتيهما: a بتناسب التغيّرات، ثم b = f(x₁) − a·x₁ ، فنكتب f(x) = ax + b',
      autonomy: 'معامل عشري (1,8) لا يظهر إلا بقسمة فرق الصورتين على فرق العددين، ونقطتان بعيدتان عن 0: التلميذ يبني الدرجة وحده ثم ينزل إلى 0 ليجد b',
      experience: { type: 'textbook', reason: '', theme: 'thermo' },
      learningPointIds: ['4am_tanasub-taghayyurat_P1', '4am_tanasub-taghayyurat_P2'],
      sourceElementIds: ['challenge'],
    },
    // Modules 4–6 — les « مسائل » : exercices complets de type امتحان, ajouts
    // de la plateforme (content/problems.js), sans aucune preuve de maîtrise.
    { kind: 'situation', code: 'masala-1', module: 4, title: 'مسألة الدرس — الموسم الجديد: اشتراك المناصرين بعبارة مجهولة', learningPointIds: ['4am_tanasub-taghayyurat_P1', '4am_tanasub-taghayyurat_P2'] },
    { kind: 'situation', code: 'masala-2', module: 5, title: 'مسألة — شتلة عبّاد الشمس: طول ينمو كل أسبوع', learningPointIds: ['4am_tanasub-taghayyurat_P1', '4am_tanasub-taghayyurat_P2'] },
    { kind: 'situation', code: 'masala-3', module: 6, title: 'مسألة — شحن الهاتف: نسبة البطارية والدقائق', learningPointIds: ['4am_tanasub-taghayyurat_P1', '4am_tanasub-taghayyurat_P2'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ثماني عبارات من المنصّة: صورة عدد بدالة تآلفية، المعادلة ax + b = m ، جملة معادلتين، وحاصل قسمة فرقين. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'mudarrajat', path: `${LESSON_BASE_PATH}/mudarrajat`,
      title: 'نشاط 4 — اشتراك المناصرين: تناسب التغيّرات', desc: 'ابنِ درجات سلّم التغيّرات بين عددين تختارهما، وأكمل سلّم الكتاب: حاصل القسمة لا يتغيّر.',
      stage: 'trigger', teachesLearningPointIds: ['4am_tanasub-taghayyurat_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أبني وأجرّب' },
    { id: '02', number: 2, slug: 'tayin', path: `${LESSON_BASE_PATH}/tayin`,
      title: 'تعيين دالة تآلفية من عددين وصورتيهما', desc: 'لماذا يساوي الحاصل a ، ثم التحدّي: من 10 و 30 درجة سلسيوس إلى الفهرنهايت، بطريقتين (a ثم b ، أو جملة معادلتين).',
      stage: 'discovery', teachesLearningPointIds: ['4am_tanasub-taghayyurat_P1', '4am_tanasub-taghayyurat_P2'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'ستّة تمارين من المنصّة: جدول، معامل سالب أو كسري، مستقيم يمرّ بنقطتين، جملة معادلتين، رحلة بسيارة أجرة.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_tanasub-taghayyurat_P1', '4am_tanasub-taghayyurat_P2'],
      color: 'amber', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'أتدرّب' },
    // Les « مسائل » (track: 'problem') : practice_lab, avant le test, qui
    // reste toujours ouvert. Elles comptent dans la complétion, jamais dans
    // la maîtrise — docs/architecture/LESSON_CONTRACT.md § Modules « مسائل ».
    { id: '04', number: 4, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — اشتراك الموسم الجديد', desc: 'مسألة الدرس: من مبلغي مناصرَين، ثمن المقابلة والاشتراك، ثم وصلان نتحقّق منهما وميزانية الموسم القادم.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_tanasub-taghayyurat_P1', '4am_tanasub-taghayyurat_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '05', number: 5, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — شتلة عبّاد الشمس', desc: 'جدول قياسات: سرعة النموّ وطول الغرس، قياس خاطئ، ومتى تبلغ الشتلة الشبكة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_tanasub-taghayyurat_P1', '4am_tanasub-taghayyurat_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — شحن الهاتف', desc: 'قراءتان للشاشة: جملة معادلتين بمجهولين، قراءة ثالثة نتحقّق منها، ومتى يتوقّف الشحن السريع.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_tanasub-taghayyurat_P1', '4am_tanasub-taghayyurat_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءتين.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 5, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
