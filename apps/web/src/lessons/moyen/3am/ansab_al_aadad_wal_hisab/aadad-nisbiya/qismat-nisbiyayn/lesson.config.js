/**
 * الدرس — حاصل قسمة عددين نسبيين (3AM, unité 1 « الأعداد النسبية ») — la TROISIÈME leçon de l'unité générée, DANS son entrée du catalogue (item 3am.m1.r02),
 * cycle moyen phase 3, « Phase 0 » (priorité du propriétaire, 2026-10-26). Manuel 3AM (الجيل الثاني, منشورات الشهاب), RÉFÉRENCE des الكفاءات :
 * النشاط 4 p. 9, معارف p. 12 (know-8 … know-10), طرائق p. 13 (method-5, method-6), دوري الآن ① ② p. 13, exercices 15, 16, 21–28, 30–33 pp. 15–16, أؤكّد 8–11 p. 17,
 * أتعمّق 36, 40, 41, 45, 47, 48, 50, 52 pp. 18–19, أستعدّ 12 et 13 p. 7, la page ICT p. 21.
 * Source : docs/sources/3am/unit1/extraction.json. Rien n'est montré tel quel : tout est réécrit (§4ter-bis). Le plan : docs/sources/3am/unit1/plan/qismat-nisbiyayn.md.
 * Le réseau : son lien « راجع » — 3am.m1.r01 (جداء عددين نسبيين) — mène aux DEUX leçons publiées de l'unité (rappelées en معارف par une « تذكّر » liée) ; « أستعدّ » mesure aussi les
 * priorités (2am.m1.r01) et la somme algébrique (2am.m4.r06), hors réseau (`priorKnowledge`). `pointPrerequisites` : arêtes internes ET arêtes vers les leçons précédentes de l'unité.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : les « خزائن الأمانات » (labo `code-lockers`, thème `libraryLockers`). Chaque casier de la bibliothèque municipale porte une règle « (−6) × ? = 48 » et ne
 *   s'ouvre qu'avec le code qui la rend vraie ; la main ROULE les molettes du code (une molette de SIGNE, des molettes de chiffres) et tire la poignée ; l'écran multiplie en direct.
 *   Le code qui ouvre est le quotient 48 ÷ (−6) ; son signe est ce qu'il faut pour ouvrir « du premier coup ».
 *   Rejetées : (a) les quatre trous « 7 × … = −28 » de l'activité 4 : on les remplit de mémoire, rien ne résiste (devient E1) ; (b) partager une dette entre des enfants :
 *   un diviseur POSITIF seulement — « partager entre −4 enfants » n'a pas de sens, et c'est pour cela qu'il faut la définition par le produit.
 *   Ordre des idées : le facteur manquant est le quotient (P1) → le signe du code d'après les signes des deux nombres (P2) → des quotients décimaux (P3) → معارف : quand aucun
 *   décimal ne convient, les trois écritures d'une même fraction (P3), et diviser par 0 est impossible → طريقة : calculer, le signe d'un quotient de produits, une série de
 *   calculs avec les priorités (P4) → أتمرّن → trois مسائل (une station météo, un programme « خمّن نتيجتي », une calculatrice sans parenthèses) → test.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab/qismat-nisbiyayn';

export const LESSON_CONFIG = {
  id: 'qismat-nisbiyayn',
  kind: 'lesson',
  unit: 'aadad-nisbiya',
  unitTitle: 'الأعداد النسبية',
  sequentialUnlock: true,
  title: 'حاصل قسمة عددين نسبيين',
  description: 'نفتح خزائن المكتبة بالرمز الذي يجعل العملية المكتوبة على بابها صحيحة، فنكتشف أنّ حاصل القسمة عامل مجهول في جداء، ونعرف إشارته وكتاباته، ثم ننظّم سلسلة حسابات على الأعداد النسبية.',
  level: 'moyen',
  grade: '3am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🔐',
  estimatedDurationMin: 88,
  textbookRef: { unit: 1, activity: [9, 9], method: [13, 13], pages: '7, 9, 12, 13, 15, 16, 17, 18, 19, 21' },
  skills: [
    'ربط القسمة بالضرب: $a \\div b = q$ معناه $b \\times q = a$ مع $b \\neq 0$ ، وإيجاد عامل مجهول في جداء، مثل $(-6) \\times q = 48$ يعطي $q = 48 \\div (-6) = -8$',
    'تعيين إشارة حاصل قسمة عددين نسبيين بقاعدة الإشارات (موجب إذا كان لهما الإشارة نفسها، وسالب إذا اختلفت إشارتاهما)، وإشارة حاصل قسمة جداءين بعدّ العوامل السالبة',
    'حساب حاصل قسمة عددين نسبيين (عشريًا أو على شكل كسر حين لا يكون عشريًا)، ومعرفة أنّ $\\frac{-a}{b} = \\frac{a}{-b} = -\\frac{a}{b}$ و $\\frac{-a}{-b} = \\frac{a}{b}$',
    'تنظيم سلسلة حسابات على الأعداد النسبية وتبسيطها باحترام أولوية العمليات: الأقواس أوّلًا، ثم الضرب والقسمة، ثم الجمع والطرح',
  ],
  teachingScope: {
    include: ['حاصل القسمة كعامل مجهول في جداء ($b \\neq 0$)', 'إشارة حاصل القسمة وحسابه، عشريًا أو على شكل كسر', 'كتابات $\\frac{-a}{b}$ و $\\frac{a}{-b}$ و $-\\frac{a}{b}$ و $\\frac{-a}{-b}$', 'سلسلة حسابات: الأقواس ثم الضرب والقسمة ثم الجمع والطرح'],
    exclude: ['تسمية العدد الناطق والمقلوب وقسمة كسرين (دروس «الكسور والأعداد الناطقة»)', 'اختزال كسر وعمليات الجمع والضرب على الكسور', 'جداء عددين أو عدة أعداد نسبية (درسا «جداء…» السابقان)', 'النشر والتبسيط بالرموز الحرفية (درس «النشر»)'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js).
  lessonProblem: {
    module: 5,
    title: 'محطة الأرصاد بالجلفة',
    statement: 'سجّلت محطة الأرصاد بالجلفة أدنى درجات الحرارة (بالدرجة المئوية) في خمسة أيام متتالية: $-3$ ، $-5$ ، $2$ ، $-4$ ، $-5$ .',
    questions: [
      { label: '1)', text: 'احسب مجموع هذه الدرجات.' },
      { label: '2)', text: 'احسب متوسّط الدرجات الخمس.' },
      { label: '3)', text: 'في اليوم السادس سُجّلت $-9$ درجات. ما المتوسّط الجديد للأيام الستة؟' },
      { label: '4)', text: 'هل انخفض المتوسّط أم ارتفع؟' },
    ],
    table: { head: ['اليوم 1', 'اليوم 2', 'اليوم 3', 'اليوم 4', 'اليوم 5'], rows: [['−3', '−5', '2', '−4', '−5']] },
    illustration: { kind: 'scene', icon: 'book', bg: 'blue', chips: [{ label: 'عدد الأيام', value: 5, tone: 'blue' }, { label: 'أدنى درجة', value: '−5', unit: '°C', tone: 'rose' }, { label: 'اليوم السادس', value: '−9', unit: '°C', tone: 'amber' }], ariaLabel: 'محطة أرصاد بالجلفة سجّلت أدنى درجات الحرارة في خمسة أيام ثم يومًا سادسًا بدرجة سالب تسع' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : le lien « راجع » du réseau (3am.m1.r01, le produit) et trois prérequis hors réseau (le produit de plusieurs facteurs, les priorités, la somme algébrique).
  priorKnowledge: ['jidaa-nisbi', 'jidaa-ida', 'awlawiya-amaliyat', 'majmu-jabri'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `code-lockers` (la main tient le CODE manquant : une molette de signe et des molettes de chiffres), thème `libraryLockers` :
    //   مبتدئ — m1 (−6) × ? = 48, m2 9 × ? = −54, m3 ? × (−7) = −63 (l'inconnue d'abord), m4 (−12) × ? = −60 (l'écran multiplie en direct) ;
    //   متقدم — le SIGNE est posé et « ثبّت » pressé avant les chiffres : a1 (−8) × ? = −2, a2 2,5 × ? = −7,5, a3 (−0,4) × ? = 1,2, a4 ? × (−5) = 0.
    {
      kind: 'manipulation', code: 'code-lockers-open', type: 'code-lockers', module: 1,
      level: 'beginner',
      title: 'خزائن الأمانات: افتح الخزانة',
      objective: 'الرمز الذي يفتح القفل هو العدد الذي إذا ضُرب في العدد المكتوب على الباب أعطى النتيجة المطلوبة، أي حاصل قسمة النتيجة على ذلك العدد، وإشارته تتبع إشارتي العددين',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'libraryLockers' },
      learningPointIds: ['3am_qismat-nisbiyayn_P1', '3am_qismat-nisbiyayn_P2'],
      sourceElementIds: ['act-4', 'know-8'],
    },
    {
      kind: 'manipulation', code: 'code-lockers-sign', type: 'code-lockers', module: 1,
      level: 'advanced',
      title: 'خزائن الأمانات: الإشارة أوّلًا',
      objective: 'الرمز الذي يفتح القفل هو العدد الذي إذا ضُرب في العدد المكتوب على الباب أعطى النتيجة المطلوبة، أي حاصل قسمة النتيجة على ذلك العدد، وإشارته تتبع إشارتي العددين',
      autonomy: 'يثبّت التلميذ إشارة الرمز قبل أن يدير الأرقام، فتُرفض الإشارة الخاطئة بحسابها ثم يجد الرمز العشري الذي يفتح القفل، بما فيه الرمز 0',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'libraryLockers' },
      learningPointIds: ['3am_qismat-nisbiyayn_P2'],
      sourceElementIds: ['know-8', 'method-5'],
    },
    // Module 2 — le MÊME type, monde `fraction`, posé seul (`levels={false}`) : déclaré SANS niveau.
    {
      kind: 'manipulation', code: 'code-lockers-fraction', type: 'code-lockers', module: 2,
      title: 'خزائن الأمانات: كتابات الكسر',
      learningPointIds: ['3am_qismat-nisbiyayn_P3'],
      sourceElementIds: ['know-9', 'method-5'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — محطة الأرصاد بالجلفة', learningPointIds: ['3am_qismat-nisbiyayn_P3', '3am_qismat-nisbiyayn_P4'], sourceElementIds: [] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — خمّن نتيجتي', learningPointIds: ['3am_qismat-nisbiyayn_P4'], sourceElementIds: ['deep-52'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — آلة نسرين الحاسبة', learningPointIds: ['3am_qismat-nisbiyayn_P4'], sourceElementIds: ['ict'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'سبع عبارات: صحيح أم خاطئ؟ جداء الأعداد النسبية، وأولوية العمليات، والجمع الجبري.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — خزائن الأمانات', desc: 'نفتح خزائن المكتبة بعجلات الرمز: ما العدد الذي يفتح قفلًا مكتوبًا عليه $(-6) \\times ? = 48$ ؟ ومتى يكون موجبًا؟',
      stage: 'trigger', teachesLearningPointIds: ['3am_qismat-nisbiyayn_P1', '3am_qismat-nisbiyayn_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — حين لا يكون الحاصل عشريًا', desc: 'خزانة لا يفتحها أي رمز عشري، وكتابات الكسر التي تفتحها، ثم لماذا لا نقسم على الصفر.',
      stage: 'discovery', teachesLearningPointIds: ['3am_qismat-nisbiyayn_P3'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أحسب حاصل قسمة وأنظّم سلسلة حسابات', desc: 'الإشارة أوّلًا ثم المسافتان، إشارة حاصل قسمة جداءين، ثم سلسلة حسابات بأقواس.',
      stage: 'formalization', teachesLearningPointIds: ['3am_qismat-nisbiyayn_P2', '3am_qismat-nisbiyayn_P3', '3am_qismat-nisbiyayn_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'أعداد ناقصة في جداءات، إشارات حواصل، حواصل عشرية وكسرية، سلاسل حسابات وأقواس ناقصة.',
      stage: 'practice_lab', teachesLearningPointIds: ['3am_qismat-nisbiyayn_P1', '3am_qismat-nisbiyayn_P2', '3am_qismat-nisbiyayn_P3', '3am_qismat-nisbiyayn_P4'],
      color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — محطة الأرصاد بالجلفة', desc: 'مسألة الدرس: متوسّط درجات حرارة سالبة وموجبة، ثم متوسّط جديد.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_qismat-nisbiyayn_P3', '3am_qismat-nisbiyayn_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — خمّن نتيجتي', desc: 'برنامج حساب على أعداد نسبية: نجرّب ثلاثة أعداد ونصوغ تخمينًا.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_qismat-nisbiyayn_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — آلة نسرين الحاسبة', desc: 'متى تكون الأقواس ضرورية في حساب حاصل قسمة على الحاسبة؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_qismat-nisbiyayn_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الأربع.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 8, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
