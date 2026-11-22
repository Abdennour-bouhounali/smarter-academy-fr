/**
 * الدرس 4 — التكبير والتصغير وأثره على المقادير الفضائية (unité 14 « الهندسة في الفضاء », manuel pp. 163–165)
 * Manuel (4AM) : « أستعدّ » 3, 7, 8 (p. 163, module 0), نشاط 6 (p. 165, module 1), نشاط 5 (p. 165, doublon déclaré, module 2).
 * Le scan s'arrête p. 169 : la معرفة « التكبير والتصغير », ses طرائق et tous les exercices manquent — ils sont écrits par la
 * plateforme et DÉCLARÉS (`knowledge_formalization`, `interaction_generation`). Source de vérité :
 * docs/sources/4am/unit14/extraction.json.
 *
 * LE PARCOURS (REAL → DISCOVER → MANIPULATE → UNDERSTAND → TOUCH THE MATH → FORMALIZE → AUTOMATIZE → TRANSFER) :
 *   M0 أستعدّ        — Thalès (item 3), le cône (7), la pyramide (8), l'aire totale d'un pavé, le rapport d'un triangle agrandi,
 *                      la section d'une pyramide ;
 *   M1 نشاط 6        — REAL (un jeu de construction sur téléphone) → MANIPULATE (scale-blocks : k tenu au doigt, le volume
 *                      PRÉDIT puis compté ; متقدم = le pavé 5 × 4 × 3 du نشاط 6 réduit de 3/5 puis agrandi de 2, et le contraste
 *                      « + 1 cm ») → UNDERSTAND (les questions du نشاط 6 sous les bâtis de l'élève) ;
 *   M2 معارف          — FORMALIZE (معارف من المنصّة) : la définition (k > 1 / 0 < k < 1), la propriété k / k² / k³, la section
 *                      d'une pyramide ou d'un cône (le نشاط 5 en doublon : EFGH réduction de rapport 3/4) ;
 *   M3 طرائق          — TOUCH THE MATH : k depuis deux longueurs, depuis un rapport d'aires (√) ou de volumes (∛), les mesures
 *                      de l'image sans recalculer ;
 *   M4 أوظّف تعلّماتي  — AUTOMATIZE / TRANSFER : cinq exercices de la plateforme ;
 *   M5–M7 مسائل       — puis trois « مسائل » de la plateforme (modules 5–7) : le صندوق du jeu de construction (مسألة الدرس),
 *                      la maquette d'un نصب تذكاري, l'aquarium agrandi (content/problems.js) ;
 *   M8 إختبار أولي    — cinq épreuves ; P1 et P2 couverts.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : le jeu de construction (labo `scale-blocks`, thème `voxel-blocks`, niveau مبتدئ : un cube d'arête 1 que la main
 *   agrandit de k = 2 puis 3, le volume PRÉDIT puis compté) — « × k³ » se voit en cubes avant de s'écrire, et la première étape
 *   interroge le POURQUOI (8 cubes et non 2) sur les bâtis de l'élève. Rejetée : l'ouverture directe sur le نشاط 6 (calculer V et
 *   A du pavé 5 × 4 × 3, puis ses dimensions et V′, A′ réduits de 3/5, puis « vérifier » la règle que l'énoncé donne déjà) : des
 *   calculs dont la réponse est la règle ; il reste le niveau متقدم du MÊME labo et les étapes 2–4, en application sur les bâtis du pavé.
 *   Ordre des idées : pourquoi 8 cubes (k dans les trois directions) → نشاط 6 : V, A du pavé → dimensions réduites → V′, A′ sous
 *   « أتوقّع القاعدة », brique APRÈS la réponse → k = 2 sans recalcul → module 2 : questions d'abord, briques et exemple de la balle ensuite.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/handasa/takbir-tasghir';

export const LESSON_CONFIG = {
  id: 'takbir-tasghir',
  kind: 'lesson',
  unit: 'handasa-fada',
  unitTitle: 'الهندسة في الفضاء',
  sequentialUnlock: true,
  title: 'التكبير والتصغير وأثره على المقادير الفضائية',
  description: 'مجسّم مبني من مكعبات في لعبة بناء: نكبّره أو نصغّره بنسبة k، فتُضرب أحرفه في k ومساحات أوجهه في k² وحجمه في k³. نحسب أبعاد ومساحة وحجم المجسّم الناتج، ونجد k من طولين أو من نسبة مساحتين أو حجمين.',
  level: 'moyen',
  grade: '4am',
  chapter: 'handasa',
  chapterTitle: 'ميدان الهندسة',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🧊',
  estimatedDurationMin: 50,
  textbookRef: { unit: 14, activity: 6, pages: '163, 165' },
  lessonProblem: {
    module: 5,
    title: 'صندوق الكنز في لعبة البناء: نصغّره ثم نطبعه',
    statement: 'في لعبة البناء على الهاتف، بنى أنس صندوق كنز على شكل متوازي مستطيلات $ABCDEFGH$ من مكعبات حرف كل منها $1\\,\\mathrm{cm}$ ، حيث $AB = 8\\,\\mathrm{cm}$ و $BC = 6\\,\\mathrm{cm}$ و $AE = 4\\,\\mathrm{cm}$ ، كما في الشكل المقابل؛ استغرق بناؤه 12 دقيقة، وفي اللعبة 250 مستوى. تسمح اللعبة بتكبير المجسّم أو تصغيره بنسبة $k$ ، فصغّر أنس الصندوق بالنسبة $k = \\dfrac{3}{4}$ ، ثم أراد طبع المجسّم المصغّر مملوءا بالطابعة ثلاثية الأبعاد لنادي المتوسطة هدية لأخيه الصغير: ثمن الراتنج 12 دج لكل $1\\,\\mathrm{cm}^3$ ، وثمن دهن الأوجه 5 دج لكل $1\\,\\mathrm{cm}^2$ . يملك أنس 1500 دج.',
    figure: {
      kind: 'space',
      view: { azimuth: -58, elevation: 22 },
      points: { A: [0, 0, 4], B: [8, 0, 4], C: [8, 6, 4], D: [0, 6, 4], E: [0, 0, 0], F: [8, 0, 0], G: [8, 6, 0], H: [0, 6, 0] },
      solids: [{ type: 'polyhedron', faces: [['A', 'B', 'C', 'D'], ['E', 'F', 'G', 'H'], ['A', 'B', 'F', 'E'], ['B', 'C', 'G', 'F'], ['C', 'D', 'H', 'G'], ['D', 'A', 'E', 'H']], tone: 'amber' }],
      segments: [{ from: 'E', to: 'F', label: '8 cm', tone: 'amber' }, { from: 'F', to: 'G', label: '6 cm', tone: 'amber' }, { from: 'B', to: 'F', label: '4 cm', tone: 'amber' }],
      labels: { A: 'nw', B: 'n', C: 'ne', D: 'n', E: 'sw', F: 's', G: 'se', H: 'nw' },
      ariaLabel: 'صندوق الكنز: متوازي مستطيلات ABCDEFGH، الوجه ABCD في الأعلى والوجه EFGH في الأسفل، AB = 8 و BC = 6 و AE = 4 بالسنتيمتر',
      maxWidth: 480,
    },
  },
  skills: [
    'معرفة أثر نسبة التكبير أو التصغير k على الأطوال (× k) والمساحات (× k²) والحجوم (× k³)',
    'حساب أبعاد ومساحة وحجم مجسّم ناتج عن تكبير أو تصغير مجسّم معطى',
    'إيجاد نسبة التكبير أو التصغير من طولين أو من نسبة مساحتين أو حجمين',
  ],
  teachingScope: {
    include: [
      'نشاط 6: متوازي مستطيلات أبعاده 5 و 4 و 3 وتصغيره بالنسبة ثلاثة أخماس',
      'نشاط 5 (مكرّر): مقطع هرم بمستو يوازي قاعدته تصغير لها',
      'معارف من المنصّة: التكبير والتصغير، الأطوال والمساحات والحجوم',
      'طرائق من المنصّة: إيجاد النسبة k وحساب مقادير المجسّم الناتج',
    ],
    exclude: [
      'حجم المخروط المبتور بالفرق بين مخروطين (أدمج تعلّماتي)',
      'التشابه في المستوي بصفة عامة خارج المجسّمات المألوفة',
    ],
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Les acquis que « أستعدّ » diagnostique (prérequis du propriétaire : Thalès et la proportionnalité des longueurs ; les aires
  // et volumes des solides usuels) : Thalès (item 3), le cône (7), la pyramide (8), l'aire totale d'un pavé, le rapport
  // d'agrandissement d'un triangle (درس « خاصية طالس »), la section d'une pyramide (درس « المقاطع المستوية »).
  priorKnowledge: ['talis-nisab', 'hajm-makhrut', 'hajm-haram', 'masaha-kulliya', 'nisbat-takbir-mustawi', 'maqta-haram'],
  resources: [
    // Le module 1 ouvre sur LES BLOCS (scale-blocks). متقدم (ouvert par défaut : le نشاط 6) ; مبتدئ : le cube d'arête 1.
    {
      kind: 'manipulation', code: 'scale-blocks-cube', type: 'scale-blocks', module: 1,
      level: 'beginner',
      title: 'مكعّب في لعبة البناء: كبّره مرّتين ثم ثلاث مرّات',
      objective: 'في تكبير أو تصغير نسبته k تُضرب الأطوال في k والمساحات في k² والحجوم في k³',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'voxel-blocks' },
      learningPointIds: ['4am_takbir-tasghir_P1'],
      sourceElementIds: ['act-6'],
    },
    {
      kind: 'manipulation', code: 'scale-blocks-act6', type: 'scale-blocks', module: 1,
      level: 'advanced',
      title: 'نشاط 6: صغّر متوازي المستطيلات بالنسبة ثلاثة أخماس ثم كبّره مرّتين',
      objective: 'في تكبير أو تصغير نسبته k تُضرب الأطوال في k والمساحات في k² والحجوم في k³',
      autonomy: 'لا عدّ لمكعبات الوحدة في التصغير: كل مكعب يصير مكعبا حرفه 0,6 والتلميذ يتوقّع حجما عشريا قبل البناء، ثم يحكم بنفسه على «إضافة 1 cm لكل حرف» من النسب الثلاث',
      experience: { type: 'textbook', reason: '', theme: 'voxel-blocks' },
      learningPointIds: ['4am_takbir-tasghir_P1', '4am_takbir-tasghir_P2'],
      sourceElementIds: ['act-6'],
    },
    // Les trois « مسائل » (modules 5–7) : des exercices COMPLETS de type امتحان, ajouts DÉCLARÉS de la plateforme
    // (content/problems.js), sans aucune preuve de maîtrise.
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — صندوق الكنز في لعبة البناء', learningPointIds: ['4am_takbir-tasghir_P1', '4am_takbir-tasghir_P2'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — مجسّم النصب التذكاري', learningPointIds: ['4am_takbir-tasghir_P1', '4am_takbir-tasghir_P2'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — حوض الأسماك المكبَّر', learningPointIds: ['4am_takbir-tasghir_P1', '4am_takbir-tasghir_P2'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: خاصية طالس، حجم المخروط والهرم، المساحة الكلية لمتوازي مستطيلات، نسبة التكبير، مقطع الهرم. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط 6 — مكعبات البناء', desc: 'اسحب النسبة k، توقّع حجم المجسّم الناتج ثم ابنِه مكعّبا مكعّبا، وأجب عن أسئلة النشاط 6 بنتائج بناءاتك.',
      stage: 'trigger', teachesLearningPointIds: ['4am_takbir-tasghir_P1', '4am_takbir-tasghir_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 15, difficulty: 1, actionText: 'أبني' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — التكبير والتصغير', desc: 'تعريف التكبير والتصغير بالنسبة k، أثرهما على الأطوال والمساحات والحجوم، ومقطع الهرم والمخروط (نشاط 5).',
      stage: 'discovery', teachesLearningPointIds: ['4am_takbir-tasghir_P1'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'taraiq', path: `${LESSON_BASE_PATH}/taraiq`,
      title: 'طرائق — إيجاد k وحساب المقادير', desc: 'نسبة التكبير من طولين، ومن نسبة مساحتين أو حجمين، ثم مقادير المجسّم الناتج دون إعادة الحساب.',
      stage: 'formalization', teachesLearningPointIds: ['4am_takbir-tasghir_P1', '4am_takbir-tasghir_P2'],
      color: 'emerald', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'خمسة تمارين: كرة الفريق الوطني، لعبة البناء، هرم مقطوع، مخطّط شقة، ميدالية مطبوعة.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_takbir-tasghir_P1', '4am_takbir-tasghir_P2'],
      color: 'amber', style: 'featured', estimatedMin: 7, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — صندوق الكنز في لعبة البناء', desc: 'مسألة الدرس: حجم الصندوق المصغّر ومساحته، اقتراح «ننقص 2 cm من كل حرف»، ثم ثمن طبعه.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_takbir-tasghir_P1', '4am_takbir-tasghir_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — مجسّم النصب التذكاري', desc: 'نسبة التصغير من ارتفاعين، مساحة الأوجه الجانبية للمجسّم، ثم أكياس الجبس اللازمة لصبّه.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_takbir-tasghir_P1', '4am_takbir-tasghir_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — حوض الأسماك المكبَّر', desc: 'سعة الحوض المكبَّر وزجاجه دون حساب أبعاده، ثم عدد الأسماك وثمنها.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_takbir-tasghir_P1', '4am_takbir-tasghir_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءتين.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 5, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
