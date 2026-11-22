/**
 * الدرس — تعليم نقطة في المستوي (2AM, unité 3 « الأعداد النسبية ») — DANS son entrée du catalogue (item 2am.m4.r04), cycle moyen phase 3,
 * 2AM مقطع 2am.m4, paire 3 (2026-10-29). Manuel 2AM (الجيل الثاني, منشورات الشهاب, scan), RÉFÉRENCE des الكفاءات : نشاط 1 (c) p. 40, معارف 1 (c) p. 42,
 * طريقة 2 p. 43, أستعدّ 8–13 p. 39, exercices 21–24 p. 47, أؤكّد 1–3 p. 49, أعمّق 51–56 p. 51. Source : docs/sources/2am/unit3/extraction.json. Rien n'est montré tel quel (§4ter-bis).
 * Le réseau : `2am.m4.r04` CONSOLIDE `1am.m5.r07` (leçon 1AM NON publiée) : « أستعدّ » mesure la base, M2 s'ouvre sur « تذكّر — السنة الأولى » SANS lien
 * (`addition('prior_year_reminder')`), et la leçon va à l'ancrage : le repère orthonormé dit explicitement, les décimaux, les points sur les axes, les régions,
 * le symétrique par rapport à UN axe, et la tâche inverse (choisir le piquet / l'unité). `noRebuildForLesson` vide ; `pointPrerequisites` : arêtes internes seulement.
 * 2026-10-30 : `talim-fi-mustawi` (1AM, 1am.m5.r07) est publiée — arêtes LP P1 ← 1am_talim-fi-mustawi_P1, P2 ← 1am_talim-fi-mustawi_P2, P3 ← 1am_talim-fi-mustawi_P3 (lien du réseau
 * 1am.m5.r07 → 2am.m4.r04, `consolidates`), ajoutées aux arêtes internes ; le « تذكّر — السنة الأولى » devient un lien tout seul.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : la « شبكة الحفرية » (labo `dig-grid`, monde `digsite`). Une fouille est quadrillée de ficelles ; la main tient le PIQUET d'origine (un glissement 2D, deux
 *   cordes le suivent) à مبتدئ, et à متقدم un point TOUCHÉ ou ÉCRIT (piquet fixe). Les coordonnées d'une trouvaille sont une SORTIE : elles changent toutes avec le piquet,
 *   l'ordre des deux nombres devient nécessaire (un carnet aux nombres échangés n'a aucun piquet), la perle sur la corde verte a l'abscisse 0, et la place miroir d'une pièce
 *   par rapport à la corde bleue ne change que l'ordonnée.
 *   Rejetées : (a) le نشاط 1 du manuel comme entrée (lire B, C, D depuis A sur un repère DONNÉ — aucune nécessité) → application en أتمرّن ; (b) deux curseurs x puis y (la
 *   réponse est dans la main, `window-blinds`) ; (c) une livraison sur un plan de ville (`component-steps`, 4AM : composantes d'un vecteur).
 *   Ordre des idées : placer le piquet pour un relevé → un autre → deux relevés à la fois → un carnet impossible → prédire des coordonnées (une perle sur l'axe) → placer au
 *   demi-mètre → la place miroir → معارف (repère orthonormé, abscisse puis ordonnée, axes, régions) → طريقة → أتمرّن → trois مسائل → إختبار أولي.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab/talim-nuqta-mustawi';
export const LESSON_CONFIG = {
  id: 'talim-nuqta-mustawi',
  kind: 'lesson',
  unit: 'adad-nisbiya-2',
  unitTitle: 'الأعداد النسبية',
  sequentialUnlock: true,
  title: 'تعليم نقطة في المستوي',
  description: 'حفرية أثرية مربّعة بخيوط: بنقل وتد المبدأ وبكتابة الإحداثيات نكتشف كيف يحدّد عددان موضع نقطة في معلم متعامد ومتجانس، وما دور ترتيب العددين، ونعلّم نقطًا ونجد نظائرها.',
  level: 'moyen',
  grade: '2am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🏺',
  estimatedDurationMin: 88,
  textbookRef: { unit: 3, activity: 1, pages: '39, 40, 42, 43, 47, 49, 51' },
  skills: [
    'التعرّف على المعلم المتعامد والمتجانس للمستوي: المبدأ، ومحور الفواصل ومحور التراتيب متعامدان ولهما الوحدة نفسها',
    'قراءة إحداثيي نقطة في المستوي: الفاصلة على المحور الأفقي ثمّ الترتيب على المحور العمودي، مثل $A(-3\\,;2)$ ، وتمييز $(3\\,;5)$ من $(5\\,;3)$',
    'وضع نقطة ذات إحداثيين معلومين (صحيحين أو عشريين) في معلم متعامد ومتجانس، ومنها النقط الواقعة على المحورين، وتعيين إحداثيي نظيرة نقطة بالنسبة إلى أحد المحورين',
  ],
  teachingScope: {
    include: ['المعلم المتعامد والمتجانس: المبدأ، محور الفواصل، محور التراتيب، والوحدة نفسها على المحورين', 'قراءة نقطة ووضعها بإحداثيين صحيحين أو عشريين، الفاصلة أولًا', 'النقط على المحورين وإشارة الإحداثيين حسب المنطقة', 'نظيرة نقطة بالنسبة إلى أحد المحورين', 'تعيين المبدأ أو الوحدة لوضع نقط معلومة الإحداثيات'],
    exclude: ['نظيرة نقطة بالنسبة إلى المبدأ أو إلى نقطة (التناظر المركزي، وحدة لاحقة)', 'طبيعة الرباعيات وبرهنتها (يُكمل مستطيل أو مربّع من الشبكة فقط)', 'حساب طول بطرح الإحداثيات (نعدّ الوحدات فقط)', 'الأشعة (السنة الرابعة)'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js) — le terrain du quartier.
  lessonProblem: {
    module: 5,
    title: 'ملعب الحيّ',
    statement: 'رسم مهندس البلدية ملعب الحيّ في معلم متعامد ومتجانس وحدته $5\\,\\mathrm{m}$ ، فعيّن رؤوس ثلاثة منه: $A(-4\\,;3)$ ، $B(5\\,;3)$ ، $C(5\\,;-2)$ ، والملعب مستطيل $ABCD$ .',
    table: { caption: 'ثلاثة رؤوس من الملعب', head: ['الرأس', 'A', 'B', 'C'], rows: [['الفاصلة', '-4', '5', '5'], ['الترتيب', '3', '3', '-2']] },
    figure: {
      grid: true, axes: true, maxWidth: 360,
      points: { A: [-4, 3], B: [5, 3], C: [5, -2] },
      segments: [['A', 'B'], ['B', 'C']],
      labels: { A: 'nw', B: 'ne', C: 'se' },
      ariaLabel: 'معلم متعامد ومتجانس وعليه ثلاثة رؤوس A وB وC لملعب مستطيل',
    },
    questions: [
      { label: '1)', text: 'عيّن إحداثيي الرأس الرابع $D$ .' },
      { label: '2)', text: 'احسب بالمتر طول الملعب وعرضه بعدّ الوحدات.' },
      { label: '3)', text: 'علّمنا نقطة الجزاء $P(3{,}5\\,;0{,}5)$ : في أيّ منطقة من المعلم تقع؟' },
    ],
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : le lien « راجع » du réseau (1am.m5.r07) et trois idées voisines mesurées.
  priorKnowledge: ['ihdathiyat-1am', 'tanazur-mihwari-1am', 'faasila-2am'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `dig-grid` (la main tient le PIQUET, puis un POINT), monde `digsite` :
    //   مبتدئ — d1 un relevé, d2 un relevé négatif, d3 deux relevés (un seul piquet), d4 un carnet impossible ; متقدم — p1 prédire trois relevés, p2 poser deux points, p3 la place miroir.
    {
      kind: 'manipulation', code: 'dig-grid-beginner', type: 'dig-grid', module: 1,
      level: 'beginner',
      title: 'شبكة الحفرية: وتد المبدأ',
      objective: 'إحداثيا نقطة في المستوي: الفاصلة أولًا ثم الترتيب، مقيسان من المبدأ، وتتغيّر الإحداثيات بتغيّر المبدأ',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'digsite' },
      learningPointIds: ['2am_talim-nuqta-mustawi_P1', '2am_talim-nuqta-mustawi_P2'],
      sourceElementIds: ['act-1', 'know-1c'],
    },
    {
      kind: 'manipulation', code: 'dig-grid-advanced', type: 'dig-grid', module: 1,
      level: 'advanced',
      title: 'شبكة الحفرية: نقطة بإحداثيين',
      objective: 'إحداثيا نقطة في المستوي: الفاصلة أولًا ثم الترتيب، مقيسان من المبدأ، وتتغيّر الإحداثيات بتغيّر المبدأ',
      autonomy: 'الوتد ثابت وتتوقّع الإحداثيات قبل أن تظهر، وتضع نقطة بين خيطين، وتجد النقطة المقابلة عبر الحبل الأزرق',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'digsite' },
      learningPointIds: ['2am_talim-nuqta-mustawi_P2', '2am_talim-nuqta-mustawi_P3'],
      sourceElementIds: ['act-1', 'method-2'],
    },
    // Module 2 — le MÊME labo, posé seul (`levels={false}`) : le piquet en (4 ; 2).
    {
      kind: 'manipulation', code: 'dig-grid-maarif', type: 'dig-grid', module: 2,
      title: 'شبكة الحفرية بوتد جديد',
      learningPointIds: ['2am_talim-nuqta-mustawi_P1', '2am_talim-nuqta-mustawi_P2'],
      sourceElementIds: ['know-1c'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — ملعب الحيّ', learningPointIds: ['2am_talim-nuqta-mustawi_P2', '2am_talim-nuqta-mustawi_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — خريطة الحيّ', learningPointIds: ['2am_talim-nuqta-mustawi_P1', '2am_talim-nuqta-mustawi_P2', '2am_talim-nuqta-mustawi_P3'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — حرارة الأسبوع', learningPointIds: ['2am_talim-nuqta-mustawi_P2', '2am_talim-nuqta-mustawi_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ ترتيب الإحداثيين، النقطة على محور، التناظر، والتدريجة العشرية.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — شبكة الحفرية', desc: 'في حفرية أثرية نسجّل موضع كل لقية بعددين: أين نغرس الوتد حتى تصحّ سجلّات المشرف؟ وماذا يحدث إن تبدّل العددان؟',
      stage: 'trigger', teachesLearningPointIds: ['2am_talim-nuqta-mustawi_P1', '2am_talim-nuqta-mustawi_P2', '2am_talim-nuqta-mustawi_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 16, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — المعلم والإحداثيان', desc: 'نقرأ إحداثيات لقى في مكان وتد جديد، ثم نسمّي المعلم المتعامد والمتجانس والفاصلة والترتيب والمحورين والمناطق.',
      stage: 'discovery', teachesLearningPointIds: ['2am_talim-nuqta-mustawi_P1', '2am_talim-nuqta-mustawi_P2'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أضع نقطة وأجد نظيرتها', desc: 'نضع نقطة بإحداثيين عشريين، ونقرأ نقطة على محور، ونعيّن نظيرة نقطة بالنسبة إلى محور.',
      stage: 'formalization', teachesLearningPointIds: ['2am_talim-nuqta-mustawi_P2', '2am_talim-nuqta-mustawi_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'رقم من نقط، قراءة إحداثيات، المناطق والمحاور، النظيرة، مثلث قائم متقايس الضلعين، واختيار الوحدة.',
      stage: 'practice_lab', teachesLearningPointIds: ['2am_talim-nuqta-mustawi_P1', '2am_talim-nuqta-mustawi_P2', '2am_talim-nuqta-mustawi_P3'],
      color: 'amber', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — ملعب الحيّ', desc: 'مسألة الدرس: رأس رابع لمستطيل، طول وعرض بعدّ الوحدات، ومنطقة نقطة الجزاء.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_talim-nuqta-mustawi_P2', '2am_talim-nuqta-mustawi_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — خريطة الحيّ', desc: 'معالم على المحورين، نظيرة المكتبة، وتغيير المبدأ.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_talim-nuqta-mustawi_P1', '2am_talim-nuqta-mustawi_P2', '2am_talim-nuqta-mustawi_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — حرارة الأسبوع', desc: 'نمثّل درجات أربعة أيام بنقط، ونقرأ المنطقة، ونختار وحدة المحور العمودي.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_talim-nuqta-mustawi_P2', '2am_talim-nuqta-mustawi_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
