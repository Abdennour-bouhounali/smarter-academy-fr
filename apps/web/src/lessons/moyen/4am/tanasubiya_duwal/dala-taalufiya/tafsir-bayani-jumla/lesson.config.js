/**
 * الدرس 4 — التفسير البياني لحل جملة معادلتين من الدرجة الأولى بمجهولين
 * Unité 7 du manuel (4AM) : نشاط 5 (p. 79) « التفسير البياني لحل جملة معادلتين ». Le manuel fourni (pp. 77–79)
 * n'a ni معارف, ni طرائق, ni exercices : la formalisation, les exercices et la « أستعدّ » sont des ajouts
 * DÉCLARÉS de la plateforme (`addition(...)`), puis trois « مسائل » de la plateforme (modules 4–6). Source de vérité : docs/sources/4am/unit7/extraction.json.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue (module 1) : deux faisceaux laser dans le lab line-crossing (2x − y = 1 et x + y = 5) — l'élève promène P,
 *   une lampe par équation : il lui faut UN point sur les deux droites, et il le trouve de la main. La caisse de la classe
 *   (43 pièces, 5000DA) reste le niveau متقدم du MÊME lab.
 *   Rejetée : le texte de la caisse posé en carte au-dessus du lab puis « traduis en système » avant tout geste (une traduction
 *   répondue de mémoire) ; elle devient l'APPLICATION de l'étape 3, après la découverte.
 *   Ordre des idées : une seule lampe (POURQUOI) → un point qui allume les deux, ses coordonnées, la brique APRÈS la réponse →
 *   le livre : traduire la caisse en système → f et g sont affines → quelle droite pour quelle fonction → le sens dans la caisse.
 *   Aucune destination du manuel n'a bougé (act-5 reste au module 1). Le module 2 (معارف) s'ouvre sur sa première question.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/tanasubiya_duwal/tafsir-bayani-jumla';

export const LESSON_CONFIG = {
  id: 'tafsir-bayani-jumla',
  kind: 'lesson',
  unit: 'dala-taalufiya',
  unitTitle: 'الدالة التآلفية',
  sequentialUnlock: true,
  title: 'التفسير البياني لحل جملة معادلتين من الدرجة الأولى بمجهولين',
  description: 'كتابة كل معادلة من الجملة على الشكل $y = ax + b$ وتمثيلها بمستقيم، إدراك أن الثنائية حلّ الجملة هي إحداثيتا نقطة تقاطع المستقيمين، وتفسير الحالات الثلاث بيانيا: متقاطعان (حل وحيد)، متوازيان (لا حل)، منطبقان (عدد غير منته من الحلول).',
  level: 'moyen',
  grade: '4am',
  chapter: 'tanasubiya_duwal',
  chapterTitle: 'ميدان التناسبية والدوال',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🔀',
  estimatedDurationMin: 50,
  textbookRef: { unit: 7, activity: 5, pages: '79' },
  // « مسألة الدرس » : l'énoncé de la مسألة 1 (content/problems.js), montré au sommaire et à la fin du module 1,
  // prolongement du lab متقدم « صندوق القسم » (des pièces de deux valeurs, d'autres nombres) ; résolue au module 4.
  lessonProblem: {
    module: 4,
    title: 'صندوق نادي البيئة: 40 قطعة و 1250 دج',
    statement: 'جمع نادي البيئة في المتوسطة تبرّعات لشراء حاويات لفرز النفايات. في صندوق النادي 40 قطعة نقدية من فئتي 20 دج و 50 دج، مبلغها 1250 دج. في النادي 18 عضوًا، ويجتمع كل يوم ثلاثاء. نرمز بـ $x$ إلى عدد قطع 20 دج وبـ $y$ إلى عدد قطع 50 دج.',
    // Le support de la مسألة 1, montré aussi par la carte « مسألة الدرس » (une seule source).
    visual: {
      range: { xMin: 0, xMax: 50, yMin: 0, yMax: 45 },
      unit: 9,
      functions: [
        { id: 'd1', a: -1, b: 40, label: '(d₁)', tone: 'indigo' },
        { id: 'd2', a: -0.4, b: 25, label: '(d₂)', tone: 'amber' },
      ],
      xStep: 5,
      yStep: 5,
      frozen: true,
      ariaLabel: 'التمثيل البياني المرفق: المستقيم (d₁) يقطع محور التراتيب في 40، والمستقيم (d₂) يقطعه في 25',
      caption: false,
    },
  },
  skills: [
    'كتابة كل معادلة من جملة معادلتين على الشكل $y = ax + b$ وتمثيلها بيانيًا بمستقيم',
    'إدراك أنّ الثنائية حلّ الجملة هي إحداثيتا نقطة تقاطع المستقيمين',
    'حلّ جملة بيانيًا ثم التحقّق من الحل بالحساب، ومعرفة أنّ القراءة البيانية قد تكون تقريبية',
    'التفسير البياني لحالات الجملة: متقاطعان (حل وحيد)، متوازيان (لا حل)، منطبقان (عدد لا نهائي من الحلول)',
  ],
  teachingScope: {
    include: [
      'نشاط 5: صندوق القسم (43 قطعة من فئتي 100DA و 200DA، المبلغ 5000DA)، الدالتان $f : x \\longmapsto 43 - x$ و $g : x \\longmapsto 25 - \\dfrac{1}{2}x$ ، المستقيمان ونقطة تقاطعهما $(36 ; 7)$',
      'معارف (من المنصّة): المعادلة والمستقيم، الحل ونقطة التقاطع، طريقة الحل البياني والتحقّق، القراءة التقريبية، الحالات الثلاث',
      'أوظّف (من المنصّة): حل بياني ثم تحقّق، تقاطع لا يقع على عقدة من الشبكة، عدد الحلول دون رسم، تطبيقا سيارة أجرة',
    ],
    exclude: [
      'طريقتا التعويض والجمع (الدرس hall-jabri من وحدة الجمل) — تُستعمل هنا للتحقّق فقط',
      'تمثيل دالة تآلفية وقراءة معاملي توجيهها وترتيبها عند المبدأ (الدرس tamthil-bayani-taalufi)',
      'المفاضلة بين صيغتين (تسعيرتين) في وضعيات (الدرس tarrid-taalufi)',
      'معادلة لا يظهر فيها $y$ (مستقيم موازٍ لمحور التراتيب): خارج البرنامج هنا',
    ],
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Les acquis que « أستعدّ » diagnostique : tester une ثنائية dans une جملة (mafhum-jumla), traduire une
  // situation en équations (mushkilat-jumla), isoler y (hall-jabri), une fonction affine et son image
  // (mafhum-taalufiya), le graphe d'une fonction affine (tamthil-bayani-taalufi), lire / placer un point,
  // résoudre une جملة par le calcul (hall-jabri).
  priorKnowledge: ['thunaiya-hall', 'tarjama-jumla', 'azl-y', 'dala-taalufiya', 'tamthil-taalufi', 'qiraa-ihdathiyat', 'hall-jabri'],
  resources: [
    // Le module 1 ouvre sur DEUX DROITES, UN POINT (line-crossing). متقدم = le نشاط 5 (ouvert par défaut :
    // c'est l'activité du module) ; مبتدئ = deux faisceaux laser (plateforme), petits nombres.
    {
      kind: 'manipulation', code: 'line-crossing-laser-2-3', type: 'line-crossing', module: 1,
      level: 'beginner',
      title: 'شعاعا ليزر: جملة بأعداد صغيرة',
      objective: 'كل معادلة من الجملة تُكتب $y = ax + b$ ويمثّلها مستقيم، وحلّ الجملة إحداثيتا نقطة تقاطع المستقيمين',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'laser' },
      learningPointIds: ['4am_tafsir-bayani-jumla_P1', '4am_tafsir-bayani-jumla_P2'],
      sourceElementIds: ['act-5'],
    },
    {
      kind: 'manipulation', code: 'line-crossing-coins-43-5000', type: 'line-crossing', module: 1,
      level: 'advanced',
      title: 'نشاط 5: 43 قطعة و 5000DA',
      objective: 'كل معادلة من الجملة تُكتب $y = ax + b$ ويمثّلها مستقيم، وحلّ الجملة إحداثيتا نقطة تقاطع المستقيمين',
      autonomy: 'المعادلة $100x + 200y = 5000$ لا تُقرأ على الشكل $y = ax + b$ : على التلميذ أن ينقل ويقسم على 200 بنفسه (الكتابات الخاطئة تُرفض بشاهد)، والأعداد كبيرة (حتى 50) لا تُعدّ بنظرة، ولا يُقترح أي نقطة؛ ثم يمسك المستقيم الثاني ويصنع بنفسه مستقيمين متوازيين ومستقيمين منطبقين',
      experience: { type: 'textbook', reason: '', theme: 'coins' },
      learningPointIds: ['4am_tafsir-bayani-jumla_P1', '4am_tafsir-bayani-jumla_P2', '4am_tafsir-bayani-jumla_P3'],
      sourceElementIds: ['act-5'],
    },
    // Les trois « مسائل » (modules 4–6) : exercices complets de type امتحان, ajouts de la plateforme.
    { kind: 'situation', code: 'masala-1', module: 4, title: 'مسألة الدرس — صندوق نادي البيئة: 40 قطعة و 1250 دج', learningPointIds: ['4am_tafsir-bayani-jumla_P1', '4am_tafsir-bayani-jumla_P2'] },
    { kind: 'situation', code: 'masala-2', module: 5, title: 'مسألة — توصيل الطرود: خدمتان وتسعيرتان', learningPointIds: ['4am_tafsir-bayani-jumla_P1', '4am_tafsir-bayani-jumla_P2'] },
    { kind: 'situation', code: 'masala-3', module: 6, title: 'مسألة — بطاقات دعوة العرس: ثلاث مطابع', learningPointIds: ['4am_tafsir-bayani-jumla_P1', '4am_tafsir-bayani-jumla_P2', '4am_tafsir-bayani-jumla_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ثماني عبارات من المنصّة: ثنائية حلّ لجملة، ترجمة وضعية، عزل $y$ ، صورة عدد بدالة تآلفية، تمثيلها البياني، وحل جملة بالحساب. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط 5 — صندوق القسم', desc: 'اكتب كل شرط على الشكل $y = ax + b$ ليُرسم مستقيمه، ثم حرّك نقطة حتى يُضيء المصباحان معًا: 43 قطعة و 5000DA.',
      stage: 'trigger', teachesLearningPointIds: ['4am_tafsir-bayani-jumla_P1', '4am_tafsir-bayani-jumla_P2', '4am_tafsir-bayani-jumla_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 16, difficulty: 2, actionText: 'أبحث عن النقطة' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — مستقيمان ونقطة', desc: 'المعادلة والمستقيم، الحل ونقطة التقاطع، طريقة الحل البياني والتحقّق بالحساب، والحالات الثلاث بمستقيم تمسكه بيدك.',
      stage: 'discovery', teachesLearningPointIds: ['4am_tafsir-bayani-jumla_P1', '4am_tafsir-bayani-jumla_P2', '4am_tafsir-bayani-jumla_P3'],
      color: 'violet', style: 'featured', estimatedMin: 13, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'أربعة تمارين من المنصّة: حل بياني ثم تحقّق، نقطة تقاطع لا تُقرأ بدقة، عدد الحلول دون رسم، وتطبيقا سيارة أجرة.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_tafsir-bayani-jumla_P2', '4am_tafsir-bayani-jumla_P1', '4am_tafsir-bayani-jumla_P3'],
      color: 'amber', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'أتدرّب' },
    { id: '04', number: 4, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — صندوق نادي البيئة', desc: 'مسألة الدرس: 40 قطعة و 1250 دج. نكتب كل شرط على الشكل $y = ax + b$ ، نقرأ نقطة التقاطع، ونتحقّق بالحساب.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_tafsir-bayani-jumla_P1', '4am_tafsir-bayani-jumla_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '05', number: 5, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — توصيل الطرود', desc: 'خدمتان للتوصيل: متى يتساوى الثمنان؟ وأيّ الخدمتين أرخص قبل نقطة التقاطع وبعدها؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_tafsir-bayani-jumla_P1', '4am_tafsir-bayani-jumla_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — بطاقات دعوة العرس', desc: 'مطبعتان ونقطة تقاطع، ثم مطبعة ثالثة مستقيمها موازٍ: أيّ مطبعة تختار العائلة؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_tafsir-bayani-jumla_P1', '4am_tafsir-bayani-jumla_P2', '4am_tafsir-bayani-jumla_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'ستة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
