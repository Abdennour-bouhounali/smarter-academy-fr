/**
 * الدرس — جداء عددين نسبيين (3AM, unité 1 « الأعداد النسبية ») — la PREMIÈRE leçon de l'unité générée, DANS son entrée du catalogue
 * (item 3am.m1.r01, partagé avec `jidaa-ida-nisbiya`), cycle moyen phase 3, « Phase 0 » (priorité du propriétaire, 2026-10-26).
 * Manuel 3AM (الجيل الثاني, منشورات الشهاب), RÉFÉRENCE des الكفاءات : نشاط 1–3 pp. 8–9, معارف p. 10 (قاعدة الإشارات, حساب جداء),
 * طرائق p. 11, exercices 1–4, 6–8, 17, 19, 29, 34 pp. 14–16, أؤكّد 1–5 p. 17, أتعمّق 37 et 43 p. 18, أستعدّ 7, 10, 11, 14, 15 p. 7.
 * Source : docs/sources/3am/unit1/extraction.json (la frontière avec les deux leçons suivantes y est écrite UNE fois). Rien n'est
 * montré tel quel : tout est réécrit (§4ter-bis). Le plan : docs/sources/3am/unit1/plan/jidaa-adadayn-nisbiyayn.md.
 * Le réseau : son lien « راجع » — 2am.m4.r05 (جمع وطرح الأعداد النسبية) — mène à une leçon NON publiée : « أستعدّ » le mesure (avec la
 * distributivité 2am.m1.r03 et la distance à zéro, en `priorKnowledge` hors réseau) ; les règles d'addition sont RAPPELÉES en معارف
 * (« تذكّر — السنة الثانية »), jamais reconstruites ; `pointPrerequisites` ne porte que des arêtes internes.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : le « شريط المصعد » (labo `elevator-reel`, thème `mallElevator`). Un ascenseur de charge passe par le rez-de-chaussée
 *   à l'instant 0 d'un film de caméra de surveillance, à vitesse constante r (signée) ; à l'instant t (SIGNÉ : t < 0 = avant son passage) il
 *   est à l'étage r × t. La main tient le TEMPS t sur une ligne du temps (et, en متقدم, aussi r) : pour t > 0 la cabine suit la somme
 *   répétée ; pour t < 0 le film est REMBOBINÉ et la cabine d'un ascenseur qui DESCEND apparaît AU-DESSUS de la rue — (−2) × (−2) = +4
 *   devient un fait du monde avant d'être une règle. Les quatre cas de signe vivent dans UN modèle honnête (vitesse × temps = déplacement).
 *   Rejetées : (a) le puits du manuel (نشاط 1) : il n'atteint que négatif × positif et demande la règle après UN cas ; il devient une
 *   APPLICATION en أتمرّن ; (b) le tableau (−7) × n du نشاط 3 : neg × neg y vient comme un motif à poursuivre, un bon ARGUMENT, mais
 *   répondu au stylo, sans rien pour la main : gardé dans معارف ; (c) une calculatrice : l'écran donne la réponse sans que la main décide.
 *   Ordre des idées : neg × pos = somme répétée (P1) → la surprise : rembobiner un ascenseur qui descend le fait monter (neg × neg) → les
 *   quatre lignes du سجلّ → la règle des signes (P2) → معارف : pourquoi il le FAUT (la distributivité, puis le tableau) (P3) → طريقة :
 *   le signe d'abord, puis le produit des distances, les décimaux, × 0 (P4) → أتمرّن (le puits et l'escalator redessinés) → trois مسائل.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 * 2026-10-29 : `jam-tarh-nisbiya` (2AM, 2am.m4.r05) est publiée — arêtes LP P1 ← 2am_jam-tarh-nisbiya_P1 et P3 ← 2am_jam-tarh-nisbiya_P2
 * (lien du réseau 2am.m4.r05 → 3am.m1.r01) ; le « تذكّر — السنة الثانية » (RECALL_ADD) devient un lien tout seul.
 */
export const LESSON_BASE_PATH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab/jidaa-adadayn-nisbiyayn';

export const LESSON_CONFIG = {
  id: 'jidaa-adadayn-nisbiyayn',
  kind: 'lesson',
  unit: 'aadad-nisbiya',
  unitTitle: 'الأعداد النسبية',
  sequentialUnlock: true,
  title: 'جداء عددين نسبيين',
  description: 'نعيد تشغيل تسجيل كاميرا مصعد إلى الأمام وإلى الخلف: نكتشف قاعدة إشارة جداء عددين نسبيين، ونبرّر أنّ جداء عددين سالبين موجب بالخاصية التوزيعية، ثم نحسب الجداء بتعيين إشارته وضرب المسافتين إلى الصفر.',
  level: 'moyen',
  grade: '3am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🛗',
  estimatedDurationMin: 90,
  textbookRef: { unit: 1, activity: 3, pages: '7, 8, 9, 10, 11, 14, 15, 16, 17, 18' },
  skills: [
    'حساب جداء عدد سالب في عدد موجب بالرجوع إلى معنى الضرب كجمع متكرر، مثل $(-2) \\times 3 = (-2) + (-2) + (-2) = -6$',
    'تعيين إشارة جداء عددين نسبيين بقاعدة الإشارات: يكون موجبًا إذا كان للعددين الإشارة نفسها، وسالبًا إذا اختلفت إشارتاهما',
    'تبرير إشارة جداء عددين سالبين بالخاصية التوزيعية، مثل $(-3) \\times 4 + (-3) \\times (-4) = (-3) \\times 0 = 0$ إذن $(-3) \\times (-4) = 12$',
    'حساب جداء عددين نسبيين (صحيحين أو عشريين) بتعيين إشارته ثم ضرب المسافتين إلى الصفر، ومعرفة أنّ $a \\times 0 = 0$',
  ],
  teachingScope: {
    include: ['جداء عددين نسبيين (صحيحين أو عشريين): الجمع المتكرر، قاعدة الإشارات، تبريرها بالخاصية التوزيعية، ثم الحساب بجداء المسافتين إلى الصفر', '$a \\times 0 = 0$'],
    exclude: ['جداء ثلاثة أعداد فأكثر والضرب في $-1$ والمربع (درس «جداء عدة أعداد نسبية»)', 'القسمة وإيجاد العامل الناقص (درس «حاصل قسمة عددين نسبيين»)', 'الكسور (الوحدة 2)', 'القوة $a^n$ (درس «قوة عدد نسبي»)'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js) — la nuit d'hiver à Sétif.
  lessonProblem: {
    module: 5,
    title: 'ليلة شتوية في سطيف',
    statement: 'في ليلة شتاء بسطيف تنخفض درجة الحرارة بانتظام 2 درجة مئوية في كل ساعة، وكانت 0 درجة مئوية عند منتصف الليل. نعتبر الساعات بعد منتصف الليل أعدادًا موجبة والساعات قبله أعدادًا سالبة، وتُكتب الحرارة عددًا نسبيًا: الحرارة = $(-2) \\times$ الزمن.',
    questions: [
      { label: '1)', text: 'ما درجة الحرارة عند الساعة 04:00 فجرًا؟' },
      { label: '2)', text: 'ما درجة الحرارة عند الساعة 21:00 مساءً، أي قبل منتصف الليل بثلاث ساعات؟' },
      { label: '3)', text: 'في أيّ ساعة كانت الحرارة 5 درجات مئوية؟' },
    ],
    illustration: { kind: 'scene', icon: 'candle', bg: 'blue', chips: [{ label: 'الانخفاض في الساعة', value: '−2', unit: '°C', tone: 'rose' }, { label: 'عند منتصف الليل', value: 0, unit: '°C', tone: 'slate' }, { label: 'قبل منتصف الليل', value: 'زمن سالب', tone: 'amber' }], ariaLabel: 'ليلة شتوية: الحرارة تنخفض درجتين في كل ساعة وتساوي 0 عند منتصف الليل، والزمن قبل منتصف الليل عدد سالب' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : le lien « راجع » du réseau (2am.m4.r05) et deux prérequis hors réseau (2am.m1.r03, distance à zéro).
  priorKnowledge: ['jam-tarh-nisbi', 'tawzi-darb', 'masafa-sifr'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `elevator-reel` (la main tient le TEMPS t), thème `mallElevator` :
    //   مبتدئ — r imposée : l'étage −6 (3 minutes après), l'étage 4 (REMBOBINÉ : t = −2), puis la vitesse +3 vers 6 et −9 ;
    //   متقدم — la main tient aussi r : prédire l'étage de (−3 ; −2), l'étage −6 en montant PUIS en descendant, t = −1,5 et t = −2,5 (demi-minutes).
    {
      kind: 'manipulation', code: 'elevator-reel-record', type: 'elevator-reel', module: 1,
      level: 'beginner',
      title: 'شريط المصعد: السرعة معلومة',
      objective: 'المصعد الذي يمرّ بالطابق 0 عند الزمن 0 بسرعة ثابتة r يكون عند الزمن t في الطابق $r \\times t$ : سالبًا إذا اختلفت إشارتا r و t وموجبًا إذا اتفقتا، وبُعده عن الشارع جداء المسافتين',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'mallElevator' },
      learningPointIds: ['3am_jidaa-adadayn-nisbiyayn_P1', '3am_jidaa-adadayn-nisbiyayn_P2'],
      sourceElementIds: ['know-1'],
    },
    {
      kind: 'manipulation', code: 'elevator-reel-both', type: 'elevator-reel', module: 1,
      level: 'advanced',
      title: 'شريط المصعد: توقّع واختر الاتجاه',
      objective: 'المصعد الذي يمرّ بالطابق 0 عند الزمن 0 بسرعة ثابتة r يكون عند الزمن t في الطابق $r \\times t$ : سالبًا إذا اختلفت إشارتا r و t وموجبًا إذا اتفقتا، وبُعده عن الشارع جداء المسافتين',
      autonomy: 'يتوقّع التلميذ الطابق قبل أن يرى التسجيل، ويختار اتجاه المصعد وسرعته بيده ليبلغ الطابق نفسه صاعدًا ثم نازلًا، ويبحث عن لحظات بنصف دقيقة',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'mallElevator' },
      learningPointIds: ['3am_jidaa-adadayn-nisbiyayn_P1', '3am_jidaa-adadayn-nisbiyayn_P2'],
      sourceElementIds: ['know-1'],
    },
    // Module 2 — « آلة الجداءات » (`sign-machine`, thème `mathClubMachine`, 2026-10-27) : la main fait descendre le SECOND facteur, chaque produit
    //   s'allume en colonne ; مبتدئ — a = −3, allumer 4 … 0, prédire (−3) × (−1) (côté négatif verrouillé avant), trouver 12 ;
    //   متقدم — a = −4, prédire (−4) × (−2), le produit 8 avec a > 0 puis a < 0 (le tableau se renverse), a = 2 → −6.
    {
      kind: 'manipulation', code: 'sign-machine-table', type: 'sign-machine', module: 2,
      level: 'beginner',
      title: 'آلة الجداءات: ماذا بعد الصفر؟',
      objective: 'كلّما نقص العامل الثاني بـ 1 تغيّر الجداء بالمقدار نفسه، قبل الصفر وبعده: لذلك جداء عددين سالبين موجب، وقلب إشارة أحد العاملين ينقل الجداء إلى الجهة الأخرى من الصفر',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'improved_interactivity_and_age_appropriateness', theme: 'mathClubMachine' },
      learningPointIds: ['3am_jidaa-adadayn-nisbiyayn_P2', '3am_jidaa-adadayn-nisbiyayn_P3'],
      sourceElementIds: ['act-3'],
    },
    {
      kind: 'manipulation', code: 'sign-machine-flip', type: 'sign-machine', module: 2,
      level: 'advanced',
      title: 'آلة الجداءات: اقلب العامل الأول',
      objective: 'كلّما نقص العامل الثاني بـ 1 تغيّر الجداء بالمقدار نفسه، قبل الصفر وبعده: لذلك جداء عددين سالبين موجب، وقلب إشارة أحد العاملين ينقل الجداء إلى الجهة الأخرى من الصفر',
      autonomy: 'يتوقّع التلميذ جداءً قبل أن تُضيئه الآلة، ويختار بيده إشارة العامل الأول ليحصل على الجداء نفسه بطريقتين',
      experience: { type: 'platform_context', reason: 'improved_interactivity_and_age_appropriateness', theme: 'mathClubMachine' },
      learningPointIds: ['3am_jidaa-adadayn-nisbiyayn_P2', '3am_jidaa-adadayn-nisbiyayn_P3'],
      sourceElementIds: ['act-3'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — ليلة شتوية في سطيف', learningPointIds: ['3am_jidaa-adadayn-nisbiyayn_P1', '3am_jidaa-adadayn-nisbiyayn_P2', '3am_jidaa-adadayn-nisbiyayn_P4'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — مسابقة الأسئلة', learningPointIds: ['3am_jidaa-adadayn-nisbiyayn_P2', '3am_jidaa-adadayn-nisbiyayn_P4'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — اشتراك تعاونية المدرسة', learningPointIds: ['3am_jidaa-adadayn-nisbiyayn_P1', '3am_jidaa-adadayn-nisbiyayn_P2', '3am_jidaa-adadayn-nisbiyayn_P4'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'سبع عبارات: صحيح أم خاطئ؟ جمع الأعداد النسبية وطرحها، وخاصية التوزيع، والمسافة إلى الصفر.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — شريط المصعد', desc: 'نعيد تشغيل تسجيل مصعد إلى الأمام وإلى الخلف: أين تكون الكابينة قبل مرورها بالطابق الأرضي؟',
      stage: 'trigger', teachesLearningPointIds: ['3am_jidaa-adadayn-nisbiyayn_P1', '3am_jidaa-adadayn-nisbiyayn_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — لماذا جداء سالبين موجب؟', desc: 'نُنزل العامل الثاني في آلة الجداءات ونرى ما يحدث بعد الصفر، ثم نبرّر بالخاصية التوزيعية وبجدول.',
      stage: 'discovery', teachesLearningPointIds: ['3am_jidaa-adadayn-nisbiyayn_P2', '3am_jidaa-adadayn-nisbiyayn_P3'],
      color: 'violet', style: 'featured', estimatedMin: 16, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أحسب جداء عددين نسبيين', desc: 'الإشارة أوّلًا، ثم جداء المسافتين إلى الصفر، مع العشريات والعدد 0.',
      stage: 'formalization', teachesLearningPointIds: ['3am_jidaa-adadayn-nisbiyayn_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'حسابات، جداءات متساوية، إشارة ناقصة، درج نفق، حفرة، عبارات صحيحة أم خاطئة، وأعداد مطلوبة.',
      stage: 'practice_lab', teachesLearningPointIds: ['3am_jidaa-adadayn-nisbiyayn_P1', '3am_jidaa-adadayn-nisbiyayn_P2', '3am_jidaa-adadayn-nisbiyayn_P4'],
      color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — ليلة شتوية في سطيف', desc: 'مسألة الدرس: الحرارة تنخفض درجتين كل ساعة، فماذا كانت قبل منتصف الليل؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_jidaa-adadayn-nisbiyayn_P1', '3am_jidaa-adadayn-nisbiyayn_P2', '3am_jidaa-adadayn-nisbiyayn_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — مسابقة الأسئلة', desc: 'نقاط موجبة وسالبة، ثم إلغاء إجابتين خاطئتين.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_jidaa-adadayn-nisbiyayn_P2', '3am_jidaa-adadayn-nisbiyayn_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — اشتراك تعاونية المدرسة', desc: 'جداء يعبّر عن تغيّر الرصيد في المستقبل وفي الماضي.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_jidaa-adadayn-nisbiyayn_P1', '3am_jidaa-adadayn-nisbiyayn_P2', '3am_jidaa-adadayn-nisbiyayn_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الأربع.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 8, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
