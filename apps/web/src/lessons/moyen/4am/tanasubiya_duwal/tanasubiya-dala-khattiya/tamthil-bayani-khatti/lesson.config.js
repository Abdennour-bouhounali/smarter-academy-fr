/**
 * الدرس 3 — التمثيل البياني لدالة خطية وقراءته بيانيًا
 * Unité 6 du manuel (4AM) : نشاط 3 (p. 66), معارف (p. 68), طرائق et دوري الآن (p. 69),
 * exercices 2, 10 → 15 (p. 72–73), 30 et 33 (أتعمّق, p. 75), QCM 1 et 4 (p. 74), le زالق de
 * جيوجيبرا (p. 76), puis trois « مسائل » de la plateforme (modules 4–6).
 * Source de vérité : docs/sources/4am/unit6/extraction.json.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : la droite épinglée en O (labo `origin-line`, thème `cablecar`) posée seule en tête du module 1 — le câble du
 *   téléphérique de Constantine tendu depuis la station O ; l'élève POSE des points, le repère refuse (avec l'écart) ceux qui ne sont
 *   pas sur la droite de f(x) = 0,5x et O résiste. Le contexte (câble, station, f) est le `lead` du labo ; plus de carte du livre
 *   au-dessus. Rejetée : le tableau f(0), f(1), f(4) à « compléter » en premier (le labo vient de faire calculer f(1) et f(4) : la
 *   question répétait le labo) — l'étape 1 demande POURQUOI un point est refusé, l'étape 2 POURQUOI B tombe sur (OA).
 *   Ordre des idées : points posés / refusés → B sur (OA) → lecture de C (−2) → y = 0,5x et la brique `tamthil-nashat` (après la réponse)
 *   → le curseur (niveau متقدم) : monte / descend → module 2 : la propriété prédite puis appliquée AVANT sa brique, l'exemple −2x / 2x
 *   et la figure après la 1re réponse, la brique du sens après le classement, la méthode de tracé puis sa brique, la lecture graphique
 *   (labo en tête de l'étape) puis sa brique, دوري الآن.
 *   Le labo est le niveau du livre (نشاط 3) : `experience.reason` reste vide (pas `platform_designed_entry`). Modules 0, 3–7 inchangés.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/tanasubiya_duwal/tamthil-bayani-khatti';

export const LESSON_CONFIG = {
  id: 'tamthil-bayani-khatti',
  kind: 'lesson',
  unit: 'tanasubiya-dala-khattiya',
  unitTitle: 'الدالة الخطية والتناسبية',
  sequentialUnlock: true,
  title: 'التمثيل البياني لدالة خطية وقراءته بيانيًا',
  description: 'إنشاء التمثيل البياني لدالة خطية في معلم متعامد ومتجانس (مستقيم يشمل المبدأ O تكفي لرسمه نقطة ثانية)، القراءة البيانية لصورة عدد وللعدد الذي علمت صورته، وربط منحى المستقيم بإشارة المعامل $a$ .',
  level: 'moyen',
  grade: '4am',
  chapter: 'tanasubiya_duwal',
  chapterTitle: 'ميدان التناسبية والدوال',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '📈',
  estimatedDurationMin: 50,
  textbookRef: { unit: 6, activity: 3, pages: '66, 68, 69, 72, 73, 74, 75, 76' },
  skills: [
    'إنشاء التمثيل البياني لدالة خطية: مستقيم يشمل المبدأ O تكفي لرسمه نقطة ثانية',
    'معرفة أنّ $y = ax$ معادلة هذا المستقيم وأنّ $a$ معامل توجيهه',
    'القراءة البيانية لصورة عدد وللعدد الذي علمت صورته',
    'ربط منحى المستقيم (يصعد / ينزل) بإشارة المعامل $a$',
  ],
  teachingScope: {
    include: [
      'نشاط 3: الدالة $x \\longmapsto 0{,}5x$ ، جدولها، النقط O و A و B على استقامة، النقطة C ذات الفاصلة $-2$ ، والمعادلة $y = 0{,}5x$',
      'الزالق (أوظّف تكنولوجيات الإعلام والاتصال ص 76) في صيغة المنصّة: منحى المستقيم وإشارة $a$',
      'معارف: التمثيل البياني لدالة خطية، معادلته ومعامل توجيهه، ومثال $-2x$ و $2x$',
      'طرائق: تمثيل دالة خطية بيانيا ($1{,}5x$) وقراءة تمثيل بياني ($f(4) = 1{,}6$ والعدد الذي صورته 3,5)',
      'دوري الآن: الدالة التي يشمل تمثيلها $A\\left(-\\dfrac{2}{3} ; -\\dfrac{3}{2}\\right)$ ، وانتماء نقطة إلى التمثيل',
      'تمارين الكتاب 2، 10 ← 15، 30 و 33',
    ],
    exclude: [
      'تعريف الدالة الخطية وحساب الصور وتعيين المعامل من ثنائية (الدرس 2)',
      'تطبيقات التناسبية: النسب المئوية والمقادير المركّبة (الدرس 4)',
      'الدالة التآلفية وتمثيلها (ليس في هذه الوحدة)',
    ],
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Les acquis que « أستعدّ » diagnostique : تعليم نقطة وقراءة إحداثياتها (السنوات السابقة), la صورة
  // d'un nombre par x ⟼ ax et le معامل depuis un couple (الدرس 2 dala-khattiya), les règles des signes.
  priorKnowledge: ['talim-nuqta', 'notation-fx', 'qawaid-ishara', 'tayin-muamil'],
  // « مسألة الدرس » : l'énoncé de la مسألة 1 (module 4), montré au sommaire et à la fin du module 1 —
  // le monde du niveau متقدم (le زالق du téléphérique : des droites épinglées à O, qui montent ou
  // descendent), avec deux câbles et d'autres nombres. Résolue pas à pas au module 4 (content/problems.js).
  lessonProblem: {
    module: 4,
    title: 'تلفريك الوادي: حبلان من المحطّة الوسطى',
    statement: 'يربط تلفريك بين تلّتين يفصل بينهما واد، فيوصل تلاميذ القرية إلى مدرستهم كل صباح، وفي قاع الوادي محطّة وسطى $O$ ينطلق منها حبلان مستقيمان: حبل شرقي وحبل غربي. نأخذ المحطّة $O$ مبدأ معلم: الفاصلة $x$ هي المسافة الأفقية بالمتر (موجبة نحو الشرق وسالبة نحو الغرب)، والترتيب $y$ هو الارتفاع بالمتر بالنسبة إلى المحطّة $O$. الحبل الشرقي جزء من المستقيم $(D_1)$ والحبل الغربي جزء من المستقيم $(D_2)$، وهما في الشكل التمثيلان البيانيان لدالتين خطيتين $f$ و $g$. المحطّة $O$ على ارتفاع 380 m عن سطح البحر، والمحطّة الشرقية على بعد أفقي 1000 m شرق $O$، والمحطّة الغربية على بعد أفقي 800 m غرب $O$. تتّسع كل عربة لـ 6 ركّاب.',
    // Le support de la مسألة 1, montré aussi par la carte « مسألة الدرس » (une seule source).
    visual: {
      range: { xMin: -400, xMax: 400, yMin: -200, yMax: 200 },
      unit: 0.5,
      unitY: 0.5,
      functions: [
        { id: 'd1', a: 0.5, b: 0, label: '(D₁)', tone: 'indigo' },
        { id: 'd2', a: -0.25, b: 0, label: '(D₂)', tone: 'rose' },
      ],
      points: [],
      xStep: 100,
      yStep: 50,
      frozen: true,
      ariaLabel: 'معلم مبدؤه المحطّة الوسطى O: المستقيم (D₁) يصعد من اليسار إلى اليمين والمستقيم (D₂) ينزل، وكلاهما يشمل O',
      caption: false,
    },
  },
  resources: [
    // Le module 1 ouvre sur LA DROITE ÉPINGLÉE À O (origin-line). مبتدئ = le نشاط 3 (f = 0,5x, ouvert
    // par défaut : c'est l'activité du module) ; متقدم = le زالق de جيوجيبرا (p. 76) dans sa version
    // plateforme : aucune fonction donnée, l'élève fait pivoter la droite et décide du lien entre le
    // signe de a et le sens.
    {
      kind: 'manipulation', code: 'origin-line-draw-0-5', type: 'origin-line', module: 1,
      level: 'beginner',
      title: 'نشاط 3: تمثيل الدالة $x \\longmapsto 0{,}5x$',
      objective: 'التمثيل البياني لدالة خطية $x \\longmapsto ax$ مستقيم يشمل المبدأ O معادلته $y = ax$ ، ومنحاه تعيّنه إشارة $a$',
      autonomy: '',
      experience: { type: 'textbook', reason: '', theme: 'cablecar' },
      learningPointIds: ['4am_tamthil-bayani-khatti_P1', '4am_tamthil-bayani-khatti_P2'],
      sourceElementIds: ['act-3'],
    },
    {
      kind: 'manipulation', code: 'origin-line-pivot', type: 'origin-line', module: 1,
      level: 'advanced',
      title: 'الزالق: كيف يتحرّك المستقيم عندما يتغيّر $a$ ؟',
      objective: 'التمثيل البياني لدالة خطية $x \\longmapsto ax$ مستقيم يشمل المبدأ O معادلته $y = ax$ ، ومنحاه تعيّنه إشارة $a$',
      autonomy: 'لا دالة معطاة ولا نقطة مقترحة: التلميذ يدير المستقيم حول O بنفسه، يثبّت مستقيمات يختارها، ويحكم بنفسه على العلاقة بين إشارة $a$ ومنحى المستقيم — الاكتشاف لا يُفتح إلا بمستقيم يصعد ومستقيم ينزل',
      experience: { type: 'platform_adaptation', reason: 'improved_interactivity_and_age_appropriateness', theme: 'cablecar' },
      learningPointIds: ['4am_tamthil-bayani-khatti_P3', '4am_tamthil-bayani-khatti_P1'],
      sourceElementIds: ['tech-76'],
    },
    // طرائق ص 69 (قراءة تمثيل بياني) : le lab en lecture, posé seul (un exemple travaillé, un niveau).
    {
      kind: 'manipulation', code: 'origin-line-read-0-4', type: 'origin-line', module: 2,
      title: 'طرائق: صورة 4، والعدد الذي صورته 3,5',
      learningPointIds: ['4am_tamthil-bayani-khatti_P2'],
      sourceElementIds: ['method-read'],
    },
    // دوري الآن ص 69 : représenter x ⟼ 9/4 x (la droite par A(−2/3 ; −3/2)), posé seul.
    {
      kind: 'manipulation', code: 'origin-line-draw-9-4', type: 'origin-line', module: 2,
      title: 'دوري الآن: تمثيل الدالة $x \\longmapsto \\dfrac{9}{4}x$',
      learningPointIds: ['4am_tamthil-bayani-khatti_P1'],
      sourceElementIds: ['now-69'],
    },
    // Les trois « مسائل » (content/problems.js) — ajouts de la plateforme, de type امتحان.
    { kind: 'situation', code: 'masala-1', module: 4, title: 'مسألة الدرس — تلفريك الوادي: حبلان من المحطّة الوسطى', learningPointIds: ['4am_tamthil-bayani-khatti_P2', '4am_tamthil-bayani-khatti_P1', '4am_tamthil-bayani-khatti_P3'] },
    { kind: 'situation', code: 'masala-2', module: 5, title: 'مسألة — مكتب الصرف: من الأورو إلى الدينار', learningPointIds: ['4am_tamthil-bayani-khatti_P2', '4am_tamthil-bayani-khatti_P1'] },
    { kind: 'situation', code: 'masala-3', module: 6, title: 'مسألة — الدرّاج: المسافة والمدّة', learningPointIds: ['4am_tamthil-bayani-khatti_P2', '4am_tamthil-bayani-khatti_P1'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات من المنصّة: إحداثيات نقطة، صورة عدد بدالة خطية، قواعد الإشارات، ومعامل دالة من ثنائية. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط 3 — حبل يشدّه المبدأ', desc: 'ضع نقطًا من تمثيل الدالة $x \\longmapsto 0{,}5x$ في معلم ثُبّت مبدؤه، ثم أدر المستقيم بالزالق: متى يصعد ومتى ينزل؟',
      stage: 'trigger', teachesLearningPointIds: ['4am_tamthil-bayani-khatti_P1', '4am_tamthil-bayani-khatti_P2', '4am_tamthil-bayani-khatti_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أرسم المستقيم' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف وطرائق — المستقيم وقراءته', desc: 'التمثيل البياني لدالة خطية ومعامل توجيهه، منحى المستقيم، رسمه بنقطة ثانية، وقراءة صورة عدد وعدد صورته معلومة.',
      stage: 'discovery', teachesLearningPointIds: ['4am_tamthil-bayani-khatti_P1', '4am_tamthil-bayani-khatti_P3', '4am_tamthil-bayani-khatti_P2'],
      color: 'violet', style: 'featured', estimatedMin: 13, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'تمارين الكتاب 2، 10 ← 15، 30 و 33: نرسم، نقرأ على الشكل، ونحذر من إشارة المعامل.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_tamthil-bayani-khatti_P2', '4am_tamthil-bayani-khatti_P1', '4am_tamthil-bayani-khatti_P3'],
      color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'أتدرّب' },
    // Les « مسائل » (track: 'problem') : practice_lab, avant le test, qui reste toujours ouvert.
    // Elles comptent dans la complétion, jamais dans la maîtrise — LESSON_CONTRACT.md § Modules « مسائل ».
    { id: '04', number: 4, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — حبلا التلفريك', desc: 'مسألة الدرس: حبل يصعد وحبل «ينزل» من المحطّة الوسطى. نقرأ على الشكل، نعيّن المعادلتين، ونحسب ارتفاع المحطّتين.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_tamthil-bayani-khatti_P2', '4am_tamthil-bayani-khatti_P1', '4am_tamthil-bayani-khatti_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '05', number: 5, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — مكتب الصرف', desc: 'من الأورو إلى الدينار على مستقيم: كم دينارًا؟ كم أورو؟ وهل يكفي المبلغ؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_tamthil-bayani-khatti_P2', '4am_tamthil-bayani-khatti_P1'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — الدرّاج', desc: 'المسافة بدلالة المدّة: نقرأ، نحسب السرعة، ونتوقّع ساعة الوصول إلى نهاية السباق.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_tamthil-bayani-khatti_P2', '4am_tamthil-bayani-khatti_P1'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث، منها اثنان من أؤكّد تعلّماتي.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
