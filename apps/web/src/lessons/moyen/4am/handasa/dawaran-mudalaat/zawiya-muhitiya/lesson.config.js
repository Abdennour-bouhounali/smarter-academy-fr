/**
 * الدرس 3 — الزاوية المحيطية والزاوية المركزية والعلاقة بينهما (الوحدة 13 « الدوران - الزوايا - المضلّعات المنتظمة »)
 * Manuel (4AM) : « أستعدّ » 4 et 5 (p. 151, module 0), نشاط 4 (p. 153, module 1), معارف 4 (p. 156, module 2), une طريقة
 * de la plateforme (déclarée, module 3 — le manuel n'a pas de page طرائق pour ce درس), exercices 10, 11, 12 (p. 159), 16 et
 * 20 question 1 (p. 161, ex-20 doublon déclaré de la synthèse) au module 4, QCM 2–3 (p. 160, doublon déclaré, module 5).
 * Source de vérité : docs/sources/4am/unit13/extraction.json.
 *
 * LE PARCOURS (REAL → DISCOVER → MANIPULATE → UNDERSTAND → TOUCH THE MATH → FORMALIZE → AUTOMATIZE → TRANSFER) :
 *   M0 أستعدّ        — le cercle circonscrit (أستعدّ 4–5 du manuel), les éléments du cercle, la somme des angles, le triangle
 *                      isocèle, le triangle inscrit dans un demi-cercle (le نشاط 4 s'en sert) ;
 *   M1 نشاط 4        — REAL (l'angle de tir dans la surface de réparation du 5-Juillet) → DISCOVER → MANIPULATE
 *                      (inscribed-angle : مبتدئ = le tireur, un PARI puis le même angle sur tout l'arc ; متقدم = le نشاط 4 en
 *                      trois étapes : مزيان, هوارية, le D intérieur de l'exercice 12) ; les questions du نشاط 4 répondues sous les
 *                      essais de l'élève ; les briques « تسمية » et « المركزية ضعف المحيطية » ;
 *   M2 معارف 4       — UNDERSTAND / FORMALIZE : les définitions, خاصية 1 et 2, les trois exemples (مثال 3 corrigé) ;
 *   M3 طريقة         — FORMALIZE / TOUCH THE MATH : « من القوس إلى الزاوية » (plateforme, déclarée) et le cas du diamètre ;
 *   M4 أوظّف تعلّماتي — AUTOMATIZE (ex-10, 11) et TRANSFER (ex-12 : l'angle qui n'est pas inscrit, ex-16, ex-20 BEM) ;
 *   M5–M7 مسائل      — puis trois « مسائل » de la plateforme (modules 5–7) : l'entraînement de tir (مسألة الدرس), le théâtre en plein air, le rond-point ;
 *   M8 إختبار أولي   — QCM 2–3 et trois épreuves de la plateforme ; P1, P2, P3 couverts.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : le TIREUR sur le cercle (inscribed-angle, niveau مبتدئ, ouvert par défaut) — la main déplace le tireur, parie sur
 *   l'angle de tir à partir du seul angle au centre, puis voit le même angle depuis tout le grand arc (refusé dedans / dehors) :
 *   c'est la situation où « l'angle inscrit vaut la moitié de l'angle au centre » devient nécessaire pour la main. Rejetée : le
 *   نشاط 4 (قول مزيان / قول هوارية) comme entrée — l'énoncé et la carte de contexte sont lus avant tout geste et les deux
 *   égalités se répondent par le texte ; il reste le niveau متقدم (et les étapes 2–3, en application sous les essais de l'élève).
 *   Ordre des idées : qui sont O et D (brique `tasmiya` APRÈS) → قول مزيان → قول هوارية (brique `alaqa-nashat` APRÈS « هل هوارية
 *   على صواب ؟ ») ; معارف : chaque propriété est posée en question AVANT sa brique (`tarif`, `khassiya-nisf`, `khassiya-tasawi`) ;
 *   طريقة : le calcul de la roue avant la brique `tariqa-qaws`, le diamètre avant `qutr-qaima`.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/handasa/zawiya-muhitiya';

export const LESSON_CONFIG = {
  id: 'zawiya-muhitiya',
  kind: 'lesson',
  unit: 'dawaran-mudalaat',
  unitTitle: 'الدوران - الزوايا - المضلّعات المنتظمة',
  sequentialUnlock: true,
  title: 'الزاوية المحيطية والزاوية المركزية والعلاقة بينهما',
  description: 'زاوية التسديد في منطقة الجزاء: من كل موضع على الدائرة المرسومة يرى الرامي المرمى بنفس الزاوية، نصف الزاوية المركزية. الزاوية المركزية والزاوية المحيطية، والخاصيتان، وطريقة إيجاد زاوية من القوس الذي تحصره.',
  level: 'moyen',
  grade: '4am',
  chapter: 'handasa',
  chapterTitle: 'ميدان الهندسة',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '⚽',
  estimatedDurationMin: 55,
  textbookRef: { unit: 13, activity: 4, pages: '151, 153, 156, 159, 160, 161' },
  skills: [
    'التمييز بين الزاوية المركزية والزاوية المحيطية في دائرة',
    'حساب قيس زاوية محيطية من قيس الزاوية المركزية التي تحصر معها نفس القوس، والعكس',
    'توظيف تقايس الزاويتين المحيطيتين اللتين تحصران نفس القوس',
  ],
  teachingScope: {
    include: [
      'نشاط 4: الزاوية المركزية AOB والزاوية المحيطية ADB، قول مزيان (القطر) وقول هوارية (وتران كيفيان)',
      'معارف 4: التعريفان، الخاصية 1 (المحيطية نصف المركزية) والخاصية 2 (محيطيتان تحصران نفس القوس متقايستان)، الأمثلة الثلاثة',
      'طريقة من المنصّة: إيجاد قيس زاوية انطلاقا من القوس الذي تحصره، وحالة القطر (زاوية مستقيمة $180^\\circ$ وزاوية محيطية $90^\\circ$)',
      'زاوية رأسها داخل الدائرة ليست محيطية (تمرين 12)',
    ],
    exclude: [
      'الدوران وصور الأشكال وخواصه (الدرسان 1 و 2)',
      'المضلعات المنتظمة وزاويتها المركزية (الدرس 4)',
      'الزاوية المركزية المنعكسة (أكبر من $180^\\circ$) وزاوية المماس والوتر',
    ],
  },
  // « مسألة الدرس » (module 5), annoncée dès le sommaire et rappelée au module 1 : le monde du lab متقدم (le نشاط 4 :
  // A et B sur (𝒞), un point sur le grand arc, puis une extrémité de diamètre) avec d'autres nombres. Sa figure vit ICI
  // (littéraux, une seule source : la carte « مسألة الدرس » la dessine) : A 128°, B 52°, S 215°, Y 308° sur le cercle de rayon 3.
  lessonProblem: {
    module: 5,
    title: 'حصّة التسديد: الدائرة المرسومة أمام المرمى',
    statement: 'في حصّة تدريب على التسديد، رسم مدرّب فريق الأشبال على العشب دائرة (𝒞) مركزها O ونصف قطرها 11 مترًا، تمرّ بالقائمين A و B للمرمى، بحيث $\\widehat{AOB} = 76^\\circ$ كما في الشكل. يقف سمير في النقطة S من (𝒞) خارج القوس الصغير $\\overset{\\frown}{AB}$ ، ويقف يونس في النقطة Y من (𝒞) بحيث [AY] قطر للدائرة. في الحصّة 14 لاعبًا يتعاونون ويتبادلون النصائح. يرى المدرّب أنّ المبتدئين يحتاجون زاوية تسديد قيسها $42^\\circ$ على الأقل.',
    figure: {
      points: { O: [0, 0], A: [-1.847, 2.364], B: [1.847, 2.364], S: [-2.4575, -1.7207], Y: [1.847, -2.364] },
      circles: [{ center: 'O', radius: 3 }],
      arcs: [{ center: 'O', from: 'B', to: 'A', sweep: 'ccw', tone: 'rose', bold: true }],
      segments: [{ from: 'O', to: 'A', tone: 'indigo' }, { from: 'O', to: 'B', tone: 'indigo' }, { from: 'S', to: 'A', tone: 'amber' }, { from: 'S', to: 'B', tone: 'amber' }, { from: 'A', to: 'Y', tone: 'emerald' }, { from: 'Y', to: 'B', tone: 'emerald' }],
      angles: [{ at: 'O', from: 'B', to: 'A', tone: 'indigo', label: '76°' }, { at: 'S', from: 'B', to: 'A', tone: 'amber', radius: 26 }],
      ariaLabel: 'دائرة (𝒞) مركزها O، القائمان A و B عليها والقوس الصغير AB ملوّن، الزاوية المركزية AOB قيسها 76 درجة، النقطة S على القوس الكبير، و [AY] قطر',
      caption: 'شكل من المنصّة',
      maxWidth: 400,
    },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Les acquis que « أستعدّ » diagnostique : le cercle circonscrit (أستعدّ 4–5), les éléments du cercle (corde, diamètre), la
  // somme des angles d'un triangle, le triangle isocèle et le triangle inscrit dans un demi-cercle (tous trois au نشاط 4).
  priorKnowledge: ['daira-muhita', 'anasir-daira', 'majmu-zawaya', 'mutasawi-saqayn', 'qaim-nisf-daira'],
  resources: [
    // Le module 1 ouvre sur L'ANGLE DE TIR (inscribed-angle). متقدم (ouvert par défaut : le نشاط 4) : D glisse sur le grand arc,
    // les trois étapes مزيان · هوارية · le D intérieur ; مبتدئ : le tireur, un pari puis le même angle sur tout l'arc.
    {
      kind: 'manipulation', code: 'inscribed-angle-striker', type: 'inscribed-angle', module: 1,
      level: 'beginner',
      title: 'زاوية التسديد: الرامي على الدائرة المرسومة',
      objective: 'الزاوية المحيطية التي تحصر القوس AB قيسها نصف قيس الزاوية المركزية AOB، ولا يتغير قيسها حين يتحرك رأسها على الدائرة؛ وزاوية رأسها خارج الدائرة أو داخلها ليست محيطية',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'football' },
      learningPointIds: ['4am_zawiya-muhitiya_P1', '4am_zawiya-muhitiya_P2', '4am_zawiya-muhitiya_P3'],
      sourceElementIds: ['act-4'],
    },
    {
      kind: 'manipulation', code: 'inscribed-angle-act4', type: 'inscribed-angle', module: 1,
      level: 'advanced',
      title: 'نشاط 4: قول مزيان وقول هوارية',
      objective: 'الزاوية المحيطية التي تحصر القوس AB قيسها نصف قيس الزاوية المركزية AOB، ولا يتغير قيسها حين يتحرك رأسها على الدائرة؛ وزاوية رأسها خارج الدائرة أو داخلها ليست محيطية',
      autonomy: 'لا رهان ولا قيس معطى للعلاقة: التلميذ يضع D بنفسه طرفا للقطر (الموضع الخاطئ يُرفض بقيس AOD)، يختار العلاقة بين AOB و ADB من أعداده، ثم يختبر قول هوارية في ثلاثة مواضع (O داخل الزاوية وخارجها) ويدفع D داخل الدائرة (التمرين 12)',
      experience: { type: 'textbook', reason: '', theme: 'football' },
      learningPointIds: ['4am_zawiya-muhitiya_P1', '4am_zawiya-muhitiya_P2'],
      sourceElementIds: ['act-4'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — حصّة التسديد: الدائرة المرسومة أمام المرمى', learningPointIds: ['4am_zawiya-muhitiya_P1', '4am_zawiya-muhitiya_P2', '4am_zawiya-muhitiya_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — مسرح الهواء الطلق: زاوية رؤية الخشبة', learningPointIds: ['4am_zawiya-muhitiya_P1', '4am_zawiya-muhitiya_P2', '4am_zawiya-muhitiya_P3'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — أعمدة إنارة الدوّار وحوض العشب', learningPointIds: ['4am_zawiya-muhitiya_P2', '4am_zawiya-muhitiya_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ثماني عبارات: الدائرة المحيطة بمثلث، عناصر الدائرة، مجموع زوايا المثلث، المثلث المتساوي الساقين والمثلث المرسوم في نصف دائرة. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط 4 — زاوية التسديد', desc: 'حرّك الرامي على الدائرة المرسومة في منطقة الجزاء وراهن على زاوية التسديد، ثم اختبر قول مزيان وقول هوارية بالنقطة D.',
      stage: 'trigger', teachesLearningPointIds: ['4am_zawiya-muhitiya_P1', '4am_zawiya-muhitiya_P2'],
      color: 'emerald', style: 'featured', estimatedMin: 17, difficulty: 1, actionText: 'أسدّد' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — الزاوية المحيطية والزاوية المركزية', desc: 'التعريفان، الخاصية 1 (المحيطية نصف المركزية) والخاصية 2 (محيطيتان تحصران نفس القوس متقايستان) وأمثلة الكتاب.',
      stage: 'discovery', teachesLearningPointIds: ['4am_zawiya-muhitiya_P1', '4am_zawiya-muhitiya_P2', '4am_zawiya-muhitiya_P3'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — من القوس إلى الزاوية', desc: 'أحدّد الرأس ثم القوس ثم الزاوية المعلومة التي تحصر نفس القوس، وحالة القطر.',
      stage: 'formalization', teachesLearningPointIds: ['4am_zawiya-muhitiya_P2', '4am_zawiya-muhitiya_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 7, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'تمارين الكتاب 10 و 11 و 12 و 16 والسؤال الأول من التمرين 20 (شهادة التعليم المتوسط).',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_zawiya-muhitiya_P1', '4am_zawiya-muhitiya_P2', '4am_zawiya-muhitiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — حصّة التسديد', desc: 'مسألة الدرس: زاوية تسديد سمير ويونس، وأيّ دائرة تناسب المبتدئين. حلّ كامل خطوة بخطوة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_zawiya-muhitiya_P1', '4am_zawiya-muhitiya_P2', '4am_zawiya-muhitiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — مسرح الهواء الطلق', desc: 'زاوية رؤية الخشبة من كل كرسي، والمصوّر داخل الدائرة، ومصابيح برج الإضاءة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_zawiya-muhitiya_P1', '4am_zawiya-muhitiya_P2', '4am_zawiya-muhitiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — أعمدة إنارة الدوّار', desc: 'من عمود الإنارة إلى الزاوية المركزية، القطر والمثلث القائم، وثمن عشب الحوض.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_zawiya-muhitiya_P2', '4am_zawiya-muhitiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث، منها السؤالان 2 و 3 من أؤكّد تعلّماتي.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 5, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
