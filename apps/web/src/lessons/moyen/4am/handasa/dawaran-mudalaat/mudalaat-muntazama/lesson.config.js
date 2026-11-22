/**
 * الدرس 4 — المضلعات المنتظمة وتطبيقاتها (الوحدة 13 « الدوران - الزوايا - المضلّعات المنتظمة »)
 * Manuel (4AM) : أستعدّ 1 (p. 151, module 0), le تحدّ « نجمة العلم » (p. 151, l'ENTRÉE) et مدخل الباب « نجمة البحر »
 * (doublon déclaré), نشاط 5 (p. 153) — module 1 ; معارف 5 (p. 156, module 2) ; طرائق et دوري الآن (p. 157, module 3) ;
 * تمارين 9, 13, 14 (p. 159), 19 et 15 (p. 161, doublon déclaré) — module 4 ; أؤكّد تعلّماتي 4 (p. 160, doublon déclaré,
 * module 8). Source de vérité : docs/sources/4am/unit13/extraction.json.
 *
 * LE PARCOURS (REAL → DISCOVER → MANIPULATE → UNDERSTAND → TOUCH THE MATH → FORMALIZE → AUTOMATIZE → TRANSFER) :
 *   M0 أستعدّ        — le triangle équilatéral par ses angles (manuel), le triangle isocèle, l'image d'un point par une
 *                      rotation, inscrit = moitié du central, le sinus (plateforme) ;
 *   M1 تحدّ ونشاط 5  — REAL (le tifo de l'étoile du drapeau ; la نجمة البحر) → DISCOVER / MANIPULATE (polygon-forge :
 *                      tourner α, appliquer la rotation, la figure ne se ferme qu'à 360°/n ; مبتدئ l'alvéole de ruche,
 *                      متقدم l'étoile : 72°, R, les branches) → UNDERSTAND (le نشاط 5 : 120°, P ↦ M) → le تحدّ résolu ;
 *   M2 معارف 5       — FORMALIZE : définition, cercle circonscrit et centre, 360°/n, la rotation qui laisse le polygone ;
 *   M3 طرائق         — TOUCH THE MATH / FORMALIZE : l'angle 108° (coquille corrigée), la construction par une rotation de
 *                      108° autour de A, le côté à partir de R = √3, دوري الآن (l'heptagone) ;
 *   M4 أوظّف تعلّماتي — AUTOMATIZE (ex-13, ex-19) et TRANSFER (ex-9, ex-14, ex-15 corrigé) ;
 *   M5–M7 مسائل      — puis trois « مسائل » de la plateforme (modules 5–7) : l'étoile du tifo (مسألة الدرس), le kiosque
 *                      hexagonal, les panneaux « قف » octogonaux (content/problems.js) ;
 *   M8 إختبار أولي   — l'item 4 de أؤكّد تعلّماتي et quatre épreuves de la plateforme ; P1, P2, P3 couverts.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : l'ALVÉOLE DE RUCHE (polygon-forge, niveau مبتدئ, ouvert par défaut) — la main choisit l'angle α et tourne le
 *   sommet jusqu'à ce que la boucle se referme : la figure ne se ferme que si n × α = 360° ; c'est la situation où « le polygone
 *   régulier est une suite d'images par une même rotation » devient NÉCESSAIRE pour la main. Rejetée : le تحدّ de l'étoile comme
 *   entrée unique (il est posé dans une carte au-dessus du labo avec ses trois phases lues d'avance, et sa fin se répond par
 *   cœur) ; il reste le niveau متقدم, et le texte du تحدّ, la نجمة البحر et le tifo viennent à l'étape 4, après les essais.
 *   Le نشاط 5 (MPN) reste une APPLICATION aux étapes 2–3 (destination inchangée). Ordre des idées : quand la boucle se ferme (brique
 *   `ruus-bidawaran` APRÈS la question 40° → 9 sommets) → le نشاط 5 (120°) → le تحدّ ; معارف : POURQUOI deux conditions (cellule),
 *   l'octogone de la fontaine avant le cercle circonscrit et 360°/n, l'image C ↦ D avant la brique `surat-mudalla`.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/handasa/mudalaat-muntazama';

export const LESSON_CONFIG = {
  id: 'mudalaat-muntazama',
  kind: 'lesson',
  unit: 'dawaran-mudalaat',
  unitTitle: 'الدوران - الزوايا - المضلّعات المنتظمة',
  sequentialUnlock: true,
  title: 'المضلعات المنتظمة وتطبيقاتها',
  description: 'نجمة العلم في تيفو المدرجات وخلية النحل: رؤوس المضلع المنتظم صور متتالية لرأس واحد بالدوران الذي زاويته 360° على n، ومنها زواياه وطول ضلعه وإنشاؤه بالمدور أو بالدوران.',
  level: 'moyen',
  grade: '4am',
  chapter: 'handasa',
  chapterTitle: 'ميدان الهندسة',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '⬡',
  estimatedDurationMin: 55,
  textbookRef: { unit: 13, activity: 5, pages: '151, 153, 156, 157, 159, 160, 161' },
  skills: [
    'التعرّف على المضلع المنتظم والدائرة المحيطة به ومركزه',
    'حساب قيس الزاوية المركزية لمضلع منتظم وقيس زاويته',
    'إنشاء المثلث المتقايس الأضلاع والمربع والسداسي والخماسي المنتظم بالمدور أو بالدوران، وحساب طول ضلعه',
  ],
  teachingScope: {
    include: [
      'التحدّي: نجمة العلم الجزائري، المسافة بين رأسين متتاليين 10 cm',
      'نشاط 5: المثلث المتقايس الأضلاع في دائرته، الزوايا المركزية، الدوران الذي زاويته 120°',
      'معارف 5: التعريف، الدائرة المحيطة ومركز المضلع، الزاوية المركزية 360° على n، صورة المضلع بالدوران',
      'طرائق: زاوية الخماسي المنتظم 108°، إنشاء خماسي منتظم بالدوران، طول ضلع مضلع منتظم من نصف القطر، السباعي المنتظم',
    ],
    exclude: [
      'مفهوم الدوران وإنشاء الصور (الدرس 1) وخواصه (الدرس 2)',
      'برهان العلاقة بين الزاوية المحيطية والزاوية المركزية (الدرس 3)',
      'الوضعية الإدماجية: أعمدة الإنارة حول حوض الأزهار (أدمج تعلّماتي)',
    ],
  },
  // « مسألة الدرس » (module 5) : le monde du lab متقدم (l'étoile du drapeau en tifo), d'autres nombres ; montrée au sommaire
  // et à la fin du module 1. Sa figure (sommets = rotation.regularVertices(O, 5, 5, 90°) au millième) vit ICI (une source).
  lessonProblem: {
    module: 5,
    title: 'تيفو المدرجات: نجمة العلم على دائرة نصف قطرها 5 m',
    statement: 'يحضّر مشجّعو فريق المدينة تيفو لنجمة العلم الجزائري يُفرش على مدرجات الملعب. رسموا على القماش دائرة مركزها $O$ ونصف قطرها $5\\,\\mathrm{m}$، ثم عيّنوا عليها رؤوس النجمة الخمسة $A$ و $B$ و $C$ و $D$ و $E$، كل رأس صورة الذي قبله بالدوران الذي مركزه $O$ بنفس الزاوية، فهي رؤوس خماسي منتظم $ABCDE$ (الشكل المقابل). سيُلصقون شريطًا أحمر على فروع النجمة الخمسة $[AC]$ و $[CE]$ و $[EB]$ و $[BD]$ و $[DA]$. يُباع الشريط في لفّات طول كل منها $10\\,\\mathrm{m}$، ثمن اللفّة 450 دج. عدد أعضاء مجموعة المشجّعين 36 مشجّعًا، يتعاونون على العمل. نعطي: $\\sin 36^\\circ \\approx 0{,}59$ و $\\sin 72^\\circ \\approx 0{,}95$.',
    figure: {
      points: { O: [0, 0], A: [0, 5], B: [-4.755, 1.545], C: [-2.939, -4.045], D: [2.939, -4.045], E: [4.755, 1.545] },
      circles: [{ center: 'O', radius: 5 }],
      segments: [
        ['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'E'], ['E', 'A'],
        { from: 'A', to: 'C', tone: 'rose' }, { from: 'C', to: 'E', tone: 'rose' }, { from: 'E', to: 'B', tone: 'rose' },
        { from: 'B', to: 'D', tone: 'rose' }, { from: 'D', to: 'A', tone: 'rose' },
        { from: 'O', to: 'A', dashed: true, label: '5 m' },
      ],
      ariaLabel: 'دائرة مركزها O ونصف قطرها 5 m، عليها رؤوس خماسي منتظم ABCDE (A في الأعلى ثم B و C و D و E في الاتجاه المباشر)، وفروع النجمة الخمسة [AC] و [CE] و [EB] و [BD] و [DA] بالأحمر',
      maxWidth: 360,
    },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Les acquis que « أستعدّ » diagnostique : les angles d'un triangle (équilatéral), le triangle isocèle, l'image d'un
  // point par une rotation (درس 1), l'angle inscrit et l'angle au centre (درس 3), le sinus (unité 10).
  priorKnowledge: ['majmu-zawaya-muthallath', 'mutasawi-saqayn', 'surat-nuqta-dawaran', 'muhitiya-markaziya', 'nisab-muthallathiya'],
  resources: [
    // Le module 1 ouvre sur LA FORGE DE POLYGONES (polygon-forge). متقدم (ouvert par défaut : le تحدّ de l'unité) : l'étoile
    // du drapeau en tifo ; مبتدئ : l'alvéole d'une ruche de Kabylie.
    {
      kind: 'manipulation', code: 'polygon-forge-cell', type: 'polygon-forge', module: 1,
      level: 'beginner',
      title: 'خلية النحل: سداسي منتظم بالدوران',
      objective: 'رؤوس المضلع المنتظم ذي n ضلعا صور متتالية لرأس واحد بالدوران الذي مركزه مركز المضلع: الحلقة تنغلق مضلعا منتظما فقط إذا كان n × α = 360°، ومنها الزاوية المركزية وزاوية المضلع وطول ضلعه',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'honeycomb' },
      learningPointIds: ['4am_mudalaat-muntazama_P2', '4am_mudalaat-muntazama_P3'],
      sourceElementIds: ['challenge', 'act-5'],
    },
    {
      kind: 'manipulation', code: 'polygon-forge-flag-star', type: 'polygon-forge', module: 1,
      level: 'advanced',
      title: 'التحدّي: نجمة العلم، رأسان متتاليان على بعد 10 cm',
      objective: 'رؤوس المضلع المنتظم ذي n ضلعا صور متتالية لرأس واحد بالدوران الذي مركزه مركز المضلع: الحلقة تنغلق مضلعا منتظما فقط إذا كان n × α = 360°، ومنها الزاوية المركزية وزاوية المضلع وطول ضلعه',
      autonomy: 'ثلاث مراحل يفتحها التلميذ بنفسه دون زاوية مقترحة: يجد زاوية الرؤوس الخمسة، ثم نصف القطر الذي يجعل المسافة بين رأسين متتاليين 10 cm بالضبط إلى 0,01 (بالسحب أو بحساب جيب 36° في المثلث القائم)، ثم يرسم الفروع رأسا بعد رأس — ضلع الخماسي مرفوض فرعا',
      experience: { type: 'textbook', reason: '', theme: 'flag-star' },
      learningPointIds: ['4am_mudalaat-muntazama_P3'],
      sourceElementIds: ['challenge'],
    },
    // Les trois « مسائل » (modules 5–7) : exercices complets de type امتحان, ajouts de la plateforme (content/problems.js).
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — تيفو نجمة العلم: الزوايا والضلع والفروع', learningPointIds: ['4am_mudalaat-muntazama_P2', '4am_mudalaat-muntazama_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — كشك ساحة البلدية: أرضية سداسية منتظمة', learningPointIds: ['4am_mudalaat-muntazama_P1', '4am_mudalaat-muntazama_P2', '4am_mudalaat-muntazama_P3'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — لافتات «قف»: ثماني منتظم', learningPointIds: ['4am_mudalaat-muntazama_P2', '4am_mudalaat-muntazama_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'خمس عبارات: زوايا المثلث، المثلث المتساوي الساقين، صورة نقطة بدوران، الزاوية المحيطية والمركزية، والجيب. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'tahaddi', path: `${LESSON_BASE_PATH}/tahaddi`,
      title: 'التحدّي ونشاط 5 — نجمة العلم وخلية النحل', desc: 'دوّر رأسا حول المركز حتى تنغلق الحلقة: خلية نحل سداسية، ثم رؤوس نجمة العلم وفروعها. ثم المثلث المتقايس الأضلاع في دائرته (نشاط 5) وحلّ التحدّي.',
      stage: 'trigger', teachesLearningPointIds: ['4am_mudalaat-muntazama_P1', '4am_mudalaat-muntazama_P2', '4am_mudalaat-muntazama_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 16, difficulty: 2, actionText: 'أبدأ التحدّي' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — المضلعات المنتظمة', desc: 'التعريف، الدائرة المحيطة ومركز المضلع، الزاوية المركزية 360° على n، والدوران الذي يحوّل المضلع إلى نفسه.',
      stage: 'discovery', teachesLearningPointIds: ['4am_mudalaat-muntazama_P1', '4am_mudalaat-muntazama_P2'],
      color: 'violet', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'taraiq', path: `${LESSON_BASE_PATH}/taraiq`,
      title: 'طرائق — زاوية المضلع وإنشاؤه وطول ضلعه', desc: 'زاوية الخماسي المنتظم، إنشاء خماسي منتظم بالدوران، طول ضلع المثلث من نصف قطر دائرته، والسباعي المنتظم.',
      stage: 'formalization', teachesLearningPointIds: ['4am_mudalaat-muntazama_P2', '4am_mudalaat-muntazama_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'أتعلّم الطرائق' },
    { id: '04', number: 4, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'تمارين الكتاب 13 و 19 و 9 و 14 و 15.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_mudalaat-muntazama_P1', '4am_mudalaat-muntazama_P2', '4am_mudalaat-muntazama_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — تيفو نجمة العلم', desc: 'مسألة الدرس: زاوية الدوران وزاوية الخماسي، المسافة بين رأسين متتاليين، وطول الشريط على فروع النجمة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_mudalaat-muntazama_P2', '4am_mudalaat-muntazama_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — كشك ساحة البلدية', desc: 'أرضية سداسية منتظمة: الزاوية المركزية، المثلث المتقايس الأضلاع، زاوية السداسي، وثمن السياج.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_mudalaat-muntazama_P1', '4am_mudalaat-muntazama_P2', '4am_mudalaat-muntazama_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — لافتات «قف»', desc: 'ثماني منتظم: زاوية دوران الآلة وزاوية اللافتة، طول الضلع، والشريط العاكس.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_mudalaat-muntazama_P2', '4am_mudalaat-muntazama_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث، منها السؤال 4 من أؤكّد تعلّماتي.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 5, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
