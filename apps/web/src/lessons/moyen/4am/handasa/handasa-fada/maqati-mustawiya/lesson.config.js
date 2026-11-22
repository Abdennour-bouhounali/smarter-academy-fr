/**
 * الدرس 3 — المقاطع المستوية للمجسمات المألوفة (الكرة، البلاطة القائمة، أسطوانة الدوران، والهرم) — الوحدة 14 « الهندسة في الفضاء »
 * Manuel (4AM) : نشاط 2, 3, 4, 5 (pp. 164–165, module 1 ; le نشاط 5 est doublé dans « التكبير والتصغير »), معارف 3 (p. 168,
 * module 2, « ب) » rétabli), طرائق « حساب نصف قطر مقطع كرة بمستو » et دوري الآن (p. 169, module 3). Le scan s'arrête p. 169 :
 * la معرفة des sections de pyramide / cône, les exercices, le « أستعدّ » de cette leçon sont des AJOUTS DÉCLARÉS de la
 * plateforme. Source de vérité : docs/sources/4am/unit14/extraction.json.
 *
 * LE PARCOURS (REAL → DISCOVER → MANIPULATE → UNDERSTAND → TOUCH THE MATH → FORMALIZE → AUTOMATIZE → TRANSFER) :
 *   M0 أستعدّ        — Pythagore, le pavé, le cylindre, la diagonale d'un carré, la sphère (OM = R), Thalès ;
 *   M1 أنشطة 2–5     — REAL (l'imprimante 3D du fablab : chaque couche est une section) → MANIPULATE (section-slicer :
 *                      مبتدئ la sphère R = 5 ; متقدم le نشاط 2 puis la بلاطة, la أسطوانة, le هرم) → UNDERSTAND (les questions
 *                      des نشاطات sous les couches imprimées par l'élève) ;
 *   M2 معارف 3       — FORMALIZE : la sphère (le tableau des cas h), la بلاطة, la أسطوانة ; la pyramide et le cône (ajout) ;
 *   M3 طرائق         — TOUCH THE MATH : le rayon d'une section (R = 2,5 ; OO′ = 1,5) révélé ligne à ligne, دوري الآن (6√3) ;
 *   M4 أوظّف تعلّماتي — AUTOMATIZE / TRANSFER (ajouts) : la pastèque, le silo, le gâteau, la couche de l'imprimante ;
 *   M5–M7 مسائل      — puis trois « مسائل » de la plateforme (modules 5–7) : l'abat-jour sphérique imprimé (« مسألة الدرس »),
 *                      le bloc de fromage tranché, la verrière pyramidale et ses deux cadres ;
 *   M8 إختبار أولي   — cinq épreuves de la plateforme, P1–P4 couverts.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : l'imprimante 3D du fablab (labo `section-slicer`, niveau مبتدئ, sphère de rayon 5, une couche par centimètre) —
 *   la main DÉPLACE le plan de coupe et prédit chaque couche avant que la machine l'imprime : le rétrécissement de la couche est ce
 *   que l'élève voit venir (il écrit ses couches, `onTrial` aux deux niveaux), la formule vient ensuite. Rejetée : le نشاط 2 du manuel
 *   en premier (« exprimer IM² en fonction de x » avant d'avoir vu une seule couche : calcul de mémoire) ; il reste le niveau متقدم du
 *   MÊME labo (sphère R = 3 et cinq x, puis بلاطة, أسطوانة, هرم) et ses questions viennent APRÈS la première réponse.
 *   Ordre des idées : le labo seul en tête (aucune carte du manuel, ni titre ni `lead` de workspace) → POURQUOI la couche rétrécit
 *   quand le plan s'éloigne (OM constant, triangle OIM) → IM² du manuel → quatre plans → le plan au pôle (brique après la réponse) →
 *   نشاط 3, 4, 5 sur les couches du niveau متقدم → module 2 : chaque question avant la brique qui la nomme → module 3 : la brique de
 *   la méthode après le calcul de 13 et 5.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/handasa/maqati-mustawiya';

export const LESSON_CONFIG = {
  id: 'maqati-mustawiya',
  kind: 'lesson',
  unit: 'handasa-fada',
  unitTitle: 'الهندسة في الفضاء',
  sequentialUnlock: true,
  title: 'المقاطع المستوية للمجسمات المألوفة (الكرة، البلاطة القائمة، أسطوانة الدوران، والهرم)',
  description: 'طابعة ثلاثية الأبعاد تبني المجسم طبقة بعد طبقة: كل طبقة مقطع مستو. مقطع الكرة دائرة نصف قطرها $r = \\sqrt{R^2 - h^2}$ أو نقطة أو لا شيء، مقطع البلاطة القائمة مستطيل، مقطع أسطوانة الدوران دائرة أو مستطيل، ومقطع الهرم أو المخروط بمستو موازٍ للقاعدة تصغير لها.',
  level: 'moyen',
  grade: '4am',
  chapter: 'handasa',
  chapterTitle: 'ميدان الهندسة',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🔪',
  estimatedDurationMin: 55,
  textbookRef: { unit: 14, activity: 2, pages: '164, 165, 168, 169' },
  skills: [
    'تعيين طبيعة مقطع كرة بمستو وحساب نصف قطره بخاصية فيثاغورس',
    'تعيين مقطع بلاطة قائمة بمستو موازٍ لوجه أو لحرف وحساب بعديه',
    'تعيين مقطع أسطوانة دوران بمستو موازٍ لقاعدتها أو لمحورها',
    'التعرّف على مقطع هرم أو مخروط دوران بمستو موازٍ للقاعدة كتصغير لها',
  ],
  teachingScope: {
    include: [
      'نشاط 2: مقطع كرة بمستو عمودي على قطر، $IM^2 = 9 - x^2$ ، والحالات x = 0 و 1,25 و 2 و 2,8 و 3',
      'نشاط 3: مقطع بلاطة قائمة 25 × 20 × 6 بمستو موازٍ للوجه CBFG ثم للحرف [CG]',
      'نشاط 4: مقطع أسطوانة دوران نصف قطرها 1,7 وارتفاعها 6 بمستو موازٍ للمحور ثم للقاعدة',
      'نشاط 5: مقطع الهرم المنتظم SABCD بمستو موازٍ للقاعدة، المربع EFGH',
      'معارف 3 وطرائق ص 169: المقاطع المستوية، نصف قطر مقطع كرة بخاصية فيثاغورس',
    ],
    exclude: [
      'مساحة الكرة وحجم الجلة (الدرس 2)',
      'أثر التكبير والتصغير على المساحات والحجوم (الدرس 4)',
      'مقاطع مائلة لا توازي وجها ولا حرفا ولا قاعدة',
    ],
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Les acquis que « أستعدّ » diagnostique (les المكتسبات القبلية du propriétaire et la leçon « الكرة والجلة ») :
  // Pythagore, le pavé droit, le cylindre de révolution, la diagonale d'un carré, la sphère (OM = R), Thalès.
  lessonProblem: {
    module: 5,
    title: 'غطاء مصباح من الطابعة: كرة مقطوعة بمستويين',
    statement: 'في نادي العلوم بمتوسطتنا يتعاون التلاميذ على صنع هدية لمكتبة الحيّ: تطبع الطابعة ثلاثية الأبعاد غطاء مصباح على شكل كرة مركزها $O$ ونصف قطرها $6{,}5\\,\\mathrm{cm}$ ، طبقةً بعد طبقة من الأسفل إلى الأعلى. لكي يستقرّ الغطاء على صفيحة الطابعة تُقطع الكرة من الأسفل بمستو أفقي $(P)$ يبعد عن $O$ بـ $6\\,\\mathrm{cm}$ ، وتُفتح من الأعلى بمستو أفقي $(Q)$ فوق $O$ تُركَّب على حافته حلقة المصباح، كما في الشكل المقابل. نسمّي $A$ و $B$ المسقطين العموديين لـ $O$ على $(P)$ و $(Q)$ . قطر حلقة المصباح $7{,}8\\,\\mathrm{cm}$ ، وسُمك كل طبقة $0{,}2\\,\\mathrm{mm}$ ، وتدوم طباعة الطبقة الواحدة 15 ثانية. طول خيط البلاستيك في البكرة $330\\,\\mathrm{m}$ ، ولون الغطاء أبيض.',
    figure: {
      kind: 'space',
      view: { azimuth: -62, elevation: 18 },
      points: {
        O: [0, 0, 0], A: [0, 0, -6], B: [0, 0, 5.2], M: [2.5, 0, -6], E: [-3.9, 0, 5.2],
        P1: [-5, -5, -6], P2: [5, -5, -6], P3: [5, 5, -6], P4: [-5, 5, -6],
        Q1: [-5, -5, 5.2], Q2: [5, -5, 5.2], Q3: [5, 5, 5.2], Q4: [-5, 5, 5.2],
      },
      solids: [{ type: 'sphere', center: 'O', radius: 6.5, tone: 'slate', equator: false }],
      circles: [
        { center: 'A', radius: 2.5, normal: 'z', on: 0, tone: 'rose', bold: true },
        { center: 'B', radius: 3.9, normal: 'z', on: 0, tone: 'rose', bold: true },
      ],
      planes: [{ points: ['P1', 'P2', 'P3', 'P4'], tone: 'sky', label: '(P)' }, { points: ['Q1', 'Q2', 'Q3', 'Q4'], tone: 'sky', label: '(Q)' }],
      segments: [
        { from: 'O', to: 'A', label: '6 cm', tone: 'indigo' },
        { from: 'O', to: 'M', label: '6,5 cm', labelSide: 'in' },
        { from: 'A', to: 'M', tone: 'rose' },
        { from: 'O', to: 'B', dashed: true },
        { from: 'B', to: 'E', tone: 'rose' },
      ],
      rightAngles: [['O', 'A', 'M'], ['O', 'B', 'E']],
      labels: { O: 'w', A: 'sw', B: 'ne', M: 'se', E: 'w' },
      hidden: ['P1', 'P2', 'P3', 'P4', 'Q1', 'Q2', 'Q3', 'Q4'],
      ariaLabel: 'غطاء المصباح: كرة مركزها O ونصف قطرها 6,5 cm، يقطعها من الأسفل المستوي الأفقي (P) على بعد OA = 6 cm وفق دائرة عليها M، ومن الأعلى المستوي الأفقي (Q) وفق دائرة مركزها B عليها E؛ المثلثان OAM و OBE قائمان في A و B',
      maxWidth: 380,
    },
  },
  priorKnowledge: ['fithaghuras', 'balata-qaima', 'ustuwana-dawaran', 'qutr-murabba', 'kura-markaz', 'talis-nisab'],
  resources: [
    // Le module 1 ouvre sur L'IMPRIMANTE 3D (section-slicer). متقدم (ouvert par défaut : le نشاط 2 — puis la بلاطة, la أسطوانة,
    // le هرم des نشاطات 3–5, ouverts par l'élève) ; مبتدئ : une sphère de rayon 5 aux couches entières.
    {
      kind: 'manipulation', code: 'section-slicer-sphere-5', type: 'section-slicer', module: 1,
      level: 'beginner',
      title: 'الطابعة ثلاثية الأبعاد: طبقات كرة نصف قطرها 5',
      objective: 'مقطع مجسم مألوف بمستو: طبيعته وأبعاده، ومقطع الكرة بمستو يبعد عن مركزها بـ h دائرة نصف قطرها √(R² − h²) أو نقطة أو لا شيء',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'smaller_numbers_for_first_contact', theme: '3d-printer' },
      learningPointIds: ['4am_maqati-mustawiya_P1'],
      sourceElementIds: ['act-2'],
    },
    {
      kind: 'manipulation', code: 'section-slicer-act2-act5', type: 'section-slicer', module: 1,
      level: 'advanced',
      title: 'نشاط 2: كرة نصف قطرها 3، ثم البلاطة والأسطوانة والهرم',
      objective: 'مقطع مجسم مألوف بمستو: طبيعته وأبعاده، ومقطع الكرة بمستو يبعد عن مركزها بـ h دائرة نصف قطرها √(R² − h²) أو نقطة أو لا شيء',
      autonomy: 'قيم x الخمس للكتاب تعطي أنصاف أقطار جذرية (√119/4، √5، √29/5) لا تُخمَّن بالنظر، والمستوي يُحرَّك دون علامات مساعدة في البلاطة والأسطوانة والهرم: التلميذ يتوقّع كل مقطع ثم تحكم الطابعة، ويفتح المجسمات الأخرى بنفسه',
      experience: { type: 'textbook', reason: '', theme: '3d-printer' },
      learningPointIds: ['4am_maqati-mustawiya_P1', '4am_maqati-mustawiya_P2', '4am_maqati-mustawiya_P3', '4am_maqati-mustawiya_P4'],
      sourceElementIds: ['act-2', 'act-3', 'act-4', 'act-5'],
    },
    // Les trois « مسائل » (modules 5–7) : des exercices COMPLETS de type امتحان, ajouts DÉCLARÉS de la plateforme
    // (content/problems.js), sans aucune preuve de maîtrise.
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — غطاء مصباح من الطابعة', learningPointIds: ['4am_maqati-mustawiya_P1'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — قالب الجبن في محل الألبان', learningPointIds: ['4am_maqati-mustawiya_P2'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — المنور الهرمي وإطاراه', learningPointIds: ['4am_maqati-mustawiya_P4'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: خاصية فيثاغورس، البلاطة القائمة، أسطوانة الدوران، قطر المربع، الكرة، خاصية طالس. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'anshita', path: `${LESSON_BASE_PATH}/anshita`,
      title: 'أنشطة 2 و 3 و 4 و 5 — الطابعة ثلاثية الأبعاد', desc: 'حرّك مستوي القطع في الكرة والبلاطة والأسطوانة والهرم، توقّع كل طبقة ثم اطبعها، وأجب عن أسئلة الكتاب بطبقاتك.',
      stage: 'trigger', teachesLearningPointIds: ['4am_maqati-mustawiya_P1', '4am_maqati-mustawiya_P2', '4am_maqati-mustawiya_P3', '4am_maqati-mustawiya_P4'],
      color: 'indigo', style: 'featured', estimatedMin: 20, difficulty: 2, actionText: 'أشغّل الطابعة' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — المقاطع المستوية لمجسمات مألوفة', desc: 'مقطع الكرة بمستو وحالاته الأربع، مقطع البلاطة القائمة، مقطعا أسطوانة الدوران، ومقطع الهرم والمخروط بمستو موازٍ للقاعدة.',
      stage: 'discovery', teachesLearningPointIds: ['4am_maqati-mustawiya_P1', '4am_maqati-mustawiya_P2', '4am_maqati-mustawiya_P3', '4am_maqati-mustawiya_P4'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'taraiq', path: `${LESSON_BASE_PATH}/taraiq`,
      title: 'طرائق — نصف قطر مقطع كرة بمستو', desc: 'خاصية فيثاغورس لحساب نصف قطر مقطع كرة سطرا بسطر، ثم دوري الآن: مقطع أسطوانة بمستو موازٍ لمحورها.',
      stage: 'formalization', teachesLearningPointIds: ['4am_maqati-mustawiya_P1', '4am_maqati-mustawiya_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'تمارين من المنصّة: شريحة دلّاع، صومعة الحبوب، كعكة العيد، وطبقة الطابعة في هرم ومخروط.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_maqati-mustawiya_P1', '4am_maqati-mustawiya_P2', '4am_maqati-mustawiya_P3', '4am_maqati-mustawiya_P4'],
      color: 'amber', style: 'featured', estimatedMin: 7, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — غطاء مصباح من الطابعة', desc: 'مسألة الدرس: قاعدة الغطاء مقطع كرة بمستو، موضع مستوي الفتحة، ثم عدد الطبقات ومدة الطباعة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_maqati-mustawiya_P1'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — قالب الجبن في محل الألبان', desc: 'مقطع بلاطة قائمة بمستو موازٍ لوجه ثم لحرف، ثم عدد الشرائح وثمن الشريحة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_maqati-mustawiya_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — المنور الهرمي وإطاراه', desc: 'مقطعا هرم منتظم بمستويين موازيين للقاعدة: نسبة التصغير من الرأس، ثم طول قضبان الإطارين وتكلفتها.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_maqati-mustawiya_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الأربع.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 5, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
