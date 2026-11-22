/**
 * الدرس 2 — خواص الدوران وتوظيفها في الأشكال الهندسية (unité 13 « الدوران - الزوايا - المضلّعات المنتظمة », 50 min).
 * Manuel (4AM) : « أستعدّ » 2 (p. 151, module 0), معارف 3 (p. 154, module 2), طرائق « استعمال خواص الدوران في الإنشاءات »
 * et دوري الآن (p. 155, module 3), exercices 4, 6 (p. 158), 8 (p. 159), 17, 18 (p. 161, module 4). La leçon n'a PAS
 * d'activité du manuel : son entrée est le laboratoire `shape-turn` (DÉCLARÉ — le papier calque sur un zellige de Tlemcen),
 * dont le niveau متقدم est la طريقة p. 155 puis l'exercice 18 (extraction › notes › labAdvancedLevel). Source de vérité :
 * docs/sources/4am/unit13/extraction.json.
 *
 * LE PARCOURS (REAL → DISCOVER → MANIPULATE → UNDERSTAND → TOUCH THE MATH → FORMALIZE → AUTOMATIZE → TRANSFER) :
 *   M0 أستعدّ        — triangle rectangle isocèle (manuel), image d'un point / d'un segment, sens direct, médiatrice,
 *                      rectangle, milieu dans un repère ;
 *   M1 الورقة الشفافة — REAL (l'artisan de Tlemcen et sa feuille calque) → MANIPULATE (tourner, imprimer la rosace,
 *                      étirer la feuille) → UNDERSTAND (ce qui reste, ce qui change ; l'étirement n'est pas un دوران ;
 *                      90° ⇒ ⊥) ; la brique « ما يبقى وما يتغيّر » ;
 *   M2 معارف         — FORMALIZE : la propriété du manuel (et son exemple de 20°, redessiné), puis l'AJOUT déclaré « une
 *                      droite et son image » (90° ⇒ ⊥, 180° ⇒ ∥) ;
 *   M3 طرائق         — TOUCH THE MATH (le lab au niveau متقدم : [AC] sur [BD]) puis la طريقة ligne à ligne, دوري الآن,
 *                      et le centre d'un دوران (ajout déclaré) ;
 *   M4 أوظّف تعلّماتي — AUTOMATIZE (ex-4, 6, 8) et TRANSFER (ex-17 BEM corrigé, ex-18 figure complétée) ;
 *   M5–M7 مسائل      — puis trois « مسائل » de la plateforme (modules 5–7) : la نجمة du zellige (مسألة الدرس), le باب
 *                      دوّار, l'عنفة ريحية (content/problems.js) ;
 *   M8 إختبار أولي   — cinq épreuves de la plateforme ; P1, P2, P3 couverts.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Candidats d'entrée : (a) la طريقة p. 155 ([AC] / [BD], deux triangles rectangles isocèles) : l'élève devrait prouver avant d'avoir
 *   vu ce qu'un دوران conserve, et la preuve se répond de mémoire ; (b) la feuille calque de l'artisan de Tlemcen (labo shape-turn,
 *   rosace, مبتدئ) : la main tourne et imprime, le tableau lit ce qui reste et ce qui change, et l'étirement est REFUSÉ par le labo.
 *   Retenu : (b), entrée de la plateforme (`platform_designed_entry`) ; (a) devient le niveau متقدم, rouvert au module 3 (qui s'ouvre
 *   désormais sur ce niveau). Ordre des idées : ce qui reste / change (brique `thabat-dawaran` APRÈS la comparaison) → la feuille
 *   étirée n'est pas un دوران → 90° ⇒ ⊥ → معارف : les mêmes constats, d'abord ESSAYÉS sur l'exemple de 20° (brique `khawas-dawaran`
 *   après), puis la droite et son image (brique `zawiya-sura` et remarque APRÈS leur question) → طرائق : le labo متقدم, POURQUOI
 *   B est l'image de A, puis seulement la solution du manuel et la brique `istimal-khawas`.
 *   Module 1 / 3 : plus de `brief` ni de `title`/`lead` de workspace ; contexte = la `lead` du labo.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/handasa/khawas-dawaran';

export const LESSON_CONFIG = {
  id: 'khawas-dawaran',
  kind: 'lesson',
  unit: 'dawaran-mudalaat',
  unitTitle: 'الدوران - الزوايا - المضلّعات المنتظمة',
  sequentialUnlock: true,
  title: 'خواص الدوران وتوظيفها في الأشكال الهندسية',
  description: 'ورقة شفافة يديرها معلّم الزليج في تلمسان حول دبوس: ما يبقى (الأطوال، الاستقامية، الزوايا، المساحات) وما يتغيّر (الموضع ومنحى المستقيمات)، ثم توظيف ذلك لإثبات تقايس قطع وتعامد مستقيمين، وإنشاء صور أشكال مركّبة، وإيجاد مركز دوران.',
  level: 'moyen',
  grade: '4am',
  chapter: 'handasa',
  chapterTitle: 'ميدان الهندسة',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🔄',
  estimatedDurationMin: 50,
  textbookRef: { unit: 13, activity: 0, pages: '151, 154, 155, 158, 159, 161' },
  skills: [
    'إدراك خواص الدوران: الحفاظ على الأطوال واستقامية النقط وأقياس الزوايا والمساحات',
    'توظيف خواص الدوران لإثبات تقايس قطع وتعامد أو توازي مستقيمات وتساوي زوايا',
    'إنشاء صور أشكال هندسية مركّبة بدوران، وإيجاد مركز دوران بمحوري قطعتين',
  ],
  teachingScope: {
    include: [
      'معارف 3: خواص الدوران (الأطوال، استقامية النقط، الزوايا، المساحات) ومثالها',
      'المستقيم وصورته بدوران زاويته $\\alpha$ ، والحالتان $90^\\circ$ (تعامد) و $180^\\circ$ (توازي) — معارف من المنصّة',
      'طريقة «استعمال خواص الدوران في الإنشاءات» ودوري الآن (ص 155)',
      'إيجاد مركز دوران بتقاطع محوري قطعتين — معارف من المنصّة',
      'التمارين 4 و 6 (ص 158) و 8 (ص 159) و 17 و 18 (ص 161)',
    ],
    exclude: [
      'تعريف الدوران وإنشاء صورة نقطة وقطعة ومستقيم ودائرة (الدرس 1)، إلا توظيفا',
      'الزاوية المحيطية والزاوية المركزية (الدرس 3)',
      'المضلعات المنتظمة (الدرس 4) والوضعية الإدماجية (أدمج تعلّماتي)',
    ],
  },
  // « مسألة الدرس » (module 5) : la طريقة du niveau متقدم (deux triangles rectangles isocèles en O), autres nombres ;
  // montrée au sommaire et rappelée à la fin du module 1. Son support (la figure) vit ICI, problems.js le référence.
  lessonProblem: {
    module: 5,
    title: 'نجمة الزليج على الورقة الشفافة',
    statement: 'على ورقة شفافة يرسم معلّم زليج في تلمسان نموذج نجمة، ويتأنّى في كل خطوة إتقانًا لحرفته: المثلثان $OAB$ و $OCD$ كلّ منهما قائم في $O$ ومتساوي الساقين، حيث $OA = 6\\,\\mathrm{cm}$ و $OC = 8\\,\\mathrm{cm}$ ، والنقطة $B$ تنتمي إلى القطعة $[OC]$ ، و $B$ و $D$ في الاتجاه المباشر من $A$ و $C$ ، كما في الشكل. اشترى المعلّم الورقة الشفافة بـ 120 دج. يصل المعلّم $[AC]$ و $[BD]$ بخيطين نحاسيين، ثم يغطّي المثلث $OBD$ بطلاء ذهبي ثمنه 25 دج للسنتيمتر المربّع.',
    figure: {
      points: { O: [0, 0], A: [6, 0], B: [0, 6], C: [0, 8], D: [-8, 0] },
      polygons: [{ points: ['O', 'A', 'B'], tone: 'emerald' }, { points: ['O', 'C', 'D'], tone: 'indigo' }],
      segments: [{ from: 'O', to: 'A', label: '6 cm' }, { from: 'O', to: 'C', label: '8 cm' }, ['A', 'B'], ['O', 'D'], ['C', 'D'],
        { from: 'A', to: 'C', tone: 'amber', bold: true }, { from: 'B', to: 'D', tone: 'rose', bold: true }],
      rightAngles: [['A', 'O', 'B'], ['C', 'O', 'D']],
      labels: { O: 's' },
      ariaLabel: 'المثلثان OAB و OCD قائمان في O ومتساويا الساقين، حيث OA = 6 cm و OC = 8 cm والنقطة B على القطعة [OC]، والقطعتان [AC] و [BD]',
      maxWidth: 420,
    },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Les acquis que « أستعدّ » diagnostique : le triangle rectangle isocèle (manuel, item 2), l'image d'un point et d'un
  // segment et le sens direct (le درس précédent), la médiatrice, le rectangle par ses diagonales, le milieu (unité 12).
  priorKnowledge: ['muthallath-qaim-mutasawi', 'surat-nuqta-dawaran', 'ittijah-dawaran', 'surat-qita-dawaran', 'mihwar-qita', 'mustatil-qutran', 'muntasaf-maalam'],
  resources: [
    // Module 1 : l'ENTRÉE (pas d'activité du manuel) — le papier calque. مبتدئ (ouvert par défaut) : la rosace de zellige
    // (60° direct) ; متقدم : la طريقة p. 155 ([AC] sur [BD], AC = BD et (AC) ⊥ (BD) par cartes) puis l'exercice 18.
    {
      kind: 'manipulation', code: 'shape-turn-rosace-m1', type: 'shape-turn', module: 1,
      level: 'beginner',
      title: 'وردة الزليج: ورقة شفافة تدور حول دبوس',
      objective: 'الدوران يحافظ على الأطوال وأقياس الزوايا واستقامية النقط والمساحات، والمستقيم وصورته يصنعان زاوية الدوران: نوظّف ذلك لإثبات تقايس قطع وتعامد مستقيمين',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'zellige' },
      learningPointIds: ['4am_khawas-dawaran_P1'],
      sourceElementIds: ['know-3'],
    },
    {
      kind: 'manipulation', code: 'shape-turn-tariqa-m1', type: 'shape-turn', module: 1,
      level: 'advanced',
      title: 'طريقة الكتاب (ص 155): [AC] و [BD]',
      objective: 'الدوران يحافظ على الأطوال وأقياس الزوايا واستقامية النقط والمساحات، والمستقيم وصورته يصنعان زاوية الدوران: نوظّف ذلك لإثبات تقايس قطع وتعامد مستقيمين',
      autonomy: 'لا زاوية ولا اتجاه معطيان: التلميذ يجد بنفسه الدوران الذي يُنزل نسخة [AC] على [BD]، ثم يختار البطاقة التي تثبت كل عبارة (البطاقة التي تثبت شيئا آخر تُرفض)، ثم يفتح بنفسه التمرين 18 ويجد مركز دوران مجهول بالمحاور',
      experience: { type: 'textbook', reason: '', theme: 'zellige' },
      learningPointIds: ['4am_khawas-dawaran_P2', '4am_khawas-dawaran_P3'],
      sourceElementIds: ['method-properties', 'ex-18'],
    },
    // Module 3 (طرائق) rouvre le même workspace sur la طريقة (متقدم par défaut), la rosace à un onglet.
    {
      kind: 'manipulation', code: 'shape-turn-rosace-m3', type: 'shape-turn', module: 3,
      level: 'beginner',
      title: 'وردة الزليج: ورقة شفافة تدور حول دبوس',
      objective: 'الدوران يحافظ على الأطوال وأقياس الزوايا واستقامية النقط والمساحات، والمستقيم وصورته يصنعان زاوية الدوران: نوظّف ذلك لإثبات تقايس قطع وتعامد مستقيمين',
      autonomy: '',
      experience: { type: 'platform_adaptation', reason: 'improved_interactivity_and_age_appropriateness', theme: 'zellige' },
      learningPointIds: ['4am_khawas-dawaran_P1'],
      sourceElementIds: ['know-3'],
    },
    {
      kind: 'manipulation', code: 'shape-turn-tariqa-m3', type: 'shape-turn', module: 3,
      level: 'advanced',
      title: 'طريقة الكتاب (ص 155): [AC] و [BD]',
      objective: 'الدوران يحافظ على الأطوال وأقياس الزوايا واستقامية النقط والمساحات، والمستقيم وصورته يصنعان زاوية الدوران: نوظّف ذلك لإثبات تقايس قطع وتعامد مستقيمين',
      autonomy: 'لا زاوية ولا اتجاه معطيان: التلميذ يجد بنفسه الدوران الذي يُنزل نسخة [AC] على [BD]، ثم يختار البطاقة التي تثبت كل عبارة (البطاقة التي تثبت شيئا آخر تُرفض)، ثم يفتح بنفسه التمرين 18 ويجد مركز دوران مجهول بالمحاور',
      experience: { type: 'textbook', reason: '', theme: 'zellige' },
      learningPointIds: ['4am_khawas-dawaran_P2', '4am_khawas-dawaran_P3'],
      sourceElementIds: ['method-properties', 'ex-18'],
    },
    // Les « مسائل » (modules 5–7) : des ajouts de la plateforme (content/problems.js).
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — نجمة الزليج: [AC] و [BD]', learningPointIds: ['4am_khawas-dawaran_P1', '4am_khawas-dawaran_P2'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — الباب الدوّار: أين المحور؟', learningPointIds: ['4am_khawas-dawaran_P1', '4am_khawas-dawaran_P2', '4am_khawas-dawaran_P3'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — العنفة الريحية بكابرتن', learningPointIds: ['4am_khawas-dawaran_P1', '4am_khawas-dawaran_P2'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'سبع عبارات: المثلث القائم ومتساوي الساقين، صورة نقطة وقطعة بدوران واتجاهه، محور قطعة، المستطيل، المنتصف في معلم. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'waraqa', path: `${LESSON_BASE_PATH}/waraqa`,
      title: 'الورقة الشفافة — وردة زليج تلمسان', desc: 'أدر ورقة شفافة حول دبوس واطبع بتلات الوردة، ثم مطّط الورقة: ما الذي يبقى على حاله وما الذي يتغيّر؟',
      stage: 'trigger', teachesLearningPointIds: ['4am_khawas-dawaran_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 1, actionText: 'أدير الورقة' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — خواص الدوران', desc: 'الدوران يحافظ على الأطوال والاستقامية والزوايا والمساحات؛ والمستقيم وصورته يصنعان زاوية الدوران.',
      stage: 'discovery', teachesLearningPointIds: ['4am_khawas-dawaran_P1', '4am_khawas-dawaran_P2'],
      color: 'violet', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'taraiq', path: `${LESSON_BASE_PATH}/taraiq`,
      title: 'طرائق — نثبت بدوران', desc: 'طريقة الكتاب: [BD] صورة [AC] بدوران زاويته $90^\\circ$ ، فـ $AC = BD$ و $(BD) \\perp (AC)$ ؛ ثم صورة زاوية، ومركز دوران.',
      stage: 'formalization', teachesLearningPointIds: ['4am_khawas-dawaran_P2', '4am_khawas-dawaran_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'تمارين الكتاب 4 و 6 و 8 و 17 و 18.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_khawas-dawaran_P1', '4am_khawas-dawaran_P2', '4am_khawas-dawaran_P3'],
      color: 'amber', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتدرّب' },
    // Les « مسائل » (track: 'problem') : practice_lab, avant le test, qui reste toujours ouvert. Elles comptent dans la
    // complétion, jamais dans la maîtrise — docs/architecture/LESSON_CONTRACT.md § Modules « مسائل ».
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — نجمة الزليج', desc: 'مسألة الدرس: [BD] صورة [AC] بدوران؛ الأطوال والتعامد والمساحة. حلّ كامل خطوة بخطوة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_khawas-dawaran_P1', '4am_khawas-dawaran_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — الباب الدوّار', desc: 'أين محور الباب؟ ماذا يحدث للمقبض بعد ربع دورة ونصف دورة؟ وكم يكلّف الزجاج؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_khawas-dawaran_P1', '4am_khawas-dawaran_P2', '4am_khawas-dawaran_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — العنفة الريحية', desc: 'شفرات تدور $120^\\circ$ : أطوال وزوايا، نصف دورة للصيانة، ومساحة الطلاء.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_khawas-dawaran_P1', '4am_khawas-dawaran_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 5, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
