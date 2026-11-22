/**
 * الدرس — الأعداد النسبية وسياقات استعمالها (1AM, unité 5 « الأعداد النسبية »). Le PREMIER درس de l'unité (ordre 20 du catalogue), généré DANS son entrée
 * du catalogue (item 1am.m5.r05), cycle moyen phase 3, 1AM paire 1 B, 2026-10-30 ; il OUVRE l'unité (dossier `_unit/`, extraction `docs/sources/1am/unit5/`).
 * Manuel 1AM (الجيل الثاني) : ouverture p. 63, نشاط 1 p. 65, معارف 1–2 pp. 67 (le paragraphe « المسافة إلى الصفر - العددان المتعاكسان »), exercices 1–9 p. 71,
 * أقوّم تعلّماتي 1 et 4 p. 73, أتعمّق 1 p. 74. Pas de طريقة dans le manuel pour cette leçon : le module 3 est un ajout de la plateforme.
 * Source : docs/sources/1am/unit5/extraction.json ; brief des auteurs : docs/sources/1am/unit5/brief-authors.md.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours, et la leçon ne renvoie jamais au livre (§4ter-bis) : tout est réécrit,
 * autres contextes, autres nombres.
 *   Entrée retenue : une semaine de janvier à Djelfa (labo `frost-gauge`, thème `winterdjelfa`). Chaque matin Salma lit le thermomètre de la cour et note la lecture EN MOTS
 *   (« 3 درجات تحت الصفر ») ; la main fait monter ou descendre le liquide jusqu'à cette lecture : l'échelle ne montre que le zéro, et un signe n'apparaît devant la
 *   lecture qu'une fois le liquide SOUS le 0. Puis la jauge d'altitude (le point le plus bas du pays, sous le niveau de la mer), puis un miroir posé sur le 0 : la main
 *   tient un niveau et son ombre le suit de l'autre côté à la même distance (les nombres opposés). متقدم : deux lectures à la même distance du zéro (6 et −6), les étages
 *   d'un immeuble (la cabine est le niveau), qui est le plus loin de la mer.
 *   Rejetées : (a) la carte des températures de l'activité 1 du manuel (une lecture de carte à reconnaître : la main ne tient rien) — la température devient l'ENTRÉE par
 *   le labo ; (b) graduer une droite des deux côtés de l'origine et lire une abscisse (c'est la leçon `talim-mustaqim-mudarraj`, labo `stride-stamp`) : ici tout se lit sur
 *   une jauge VERTICALE déjà graduée ; (c) le repère du plan (leçon `talim-fi-mustawi`) ; (d) la somme de relatifs (2AM).
 *   Ordre des idées : la lecture donnée en mots et le niveau qui descend sous 0 (P1, P2) → altitude et profondeur (P1) → le miroir, les opposés (P3) → l'étage, la distance
 *   (P1, P2) → معارف (les noms : nombre positif / négatif, signe, distance à zéro, opposés ; 0 est à la fois positif et négatif) → طريقة (lire une situation, écrire
 *   le nombre, sa distance et son opposé) → أتمرّن → trois مسائل → إختبار أولي.
 *   « أستعدّ » mesure `1am.m5.r04` (une abscisse décimale sur une demi-droite graduée) et `1am.m1.r04` (comparer des décimaux) : ce sont les deux acquis de l'année les plus proches
 *   (l'item n'a aucun prérequis dans le réseau, `LEARNING_NET.md` §4).
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/1am/ansab_al_aadad_wal_hisab/adad-nisbiya-siyaqat';

export const LESSON_CONFIG = {
  id: 'adad-nisbiya-siyaqat',
  kind: 'lesson',
  unit: 'adad-nisbiya',
  unitTitle: 'الأعداد النسبية',
  sequentialUnlock: true,
  title: 'الأعداد النسبية وسياقات استعمالها',
  description: 'في أسبوع شتوي بالجلفة نرفع سائل المحرار وننزله حتى القراءة المطلوبة، ثمّ نقرأ الارتفاعات والأعماق والطوابق، فنعرف العدد النسبي الموجب والسالب، ونميّز إشارته من مسافته إلى الصفر، ونكتشف العددين المتعاكسين.',
  level: 'moyen',
  grade: '1am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🌡️',
  estimatedDurationMin: 84,
  textbookRef: { unit: 5, activity: 1, pages: '63, 65, 67, 71, 73, 74' },
  skills: [
    'إدراج الأعداد السالبة في وضعيات متنوعة (درجات الحرارة، التواريخ قبل الميلاد وبعده، الارتفاعات والأعماق، طوابق العمارة)',
    'التعرّف على العدد النسبي الموجب والعدد النسبي السالب وتمييز الإشارة من المسافة إلى الصفر',
    'التعرّف على عددين متعاكسين مثل $3$ و $-3$',
  ],
  teachingScope: {
    include: ['الأعداد السالبة في الحرارة والارتفاع والعمق والطوابق والتواريخ', 'العدد النسبي الموجب والعدد النسبي السالب والصفر', 'الإشارة والمسافة إلى الصفر', 'العددان المتعاكسان', 'الأعداد الصحيحة النسبية'],
    exclude: ['تدريج مستقيم من جهتي المبدإ وتعليم نقطة بفاصلتها (درس «التعليم على مستقيم مدرّج»)', 'المعلم المتعامد وإحداثيا نقطة (درس «التعليم في المستوي»)', 'مقارنة الأعداد النسبية وجمعها (السنة الثانية)', 'تدريج نصف مستقيم بالأعداد العشرية (درس سابق ورد في «أستعدّ»)'],
  },
  // « مسألة الدرس » : أسبوع من قراءات مرصد الجلفة، ثمّ الأبرد، ثمّ المعاكس، في القصّة نفسها (module 5).
  lessonProblem: {
    module: 5,
    title: 'مرصد الجلفة',
    statement: 'سجّل مرصد الجلفة درجة الحرارة عند السابعة صباحًا في أيّام الدراسة الخمسة: الأحد 3 درجات فوق الصفر، الاثنين درجتان تحت الصفر، الثلاثاء 6 درجات تحت الصفر، الأربعاء الصفر، الخميس درجتان فوق الصفر. اشترى المرصد 3 محارير جديدة.',
    questions: [
      { label: '1)', text: 'اكتب كلّ قراءة بعدد نسبي، ثمّ عيّن المسافة إلى الصفر لقراءة الثلاثاء.' },
      { label: '2)', text: 'أيّ يوم كان الأبرد؟ وهل هو اليوم الذي له أكبر عدد؟' },
      { label: '3)', text: 'اكتب معاكس قراءة الاثنين، ثمّ عيّن اليوم الذي سُجّلت فيه هذه القراءة.' },
    ],
    illustration: { kind: 'tags', cards: [
      { title: 'الأحد', icon: 'house', lines: [{ label: 'القراءة', value: '3', unit: 'درجات فوق الصفر' }] },
      { title: 'الاثنين والثلاثاء', icon: 'house', lines: [{ label: 'الاثنين', value: 'درجتان', unit: 'تحت الصفر' }, { label: 'الثلاثاء', value: '6', unit: 'درجات تحت الصفر' }] },
      { title: 'الأربعاء والخميس', icon: 'house', lines: [{ label: 'الأربعاء', value: 'الصفر', unit: '' }, { label: 'الخميس', value: 'درجتان', unit: 'فوق الصفر' }] },
    ], ariaLabel: 'قراءات خمسة أيّام: ثلاث درجات فوق الصفر ثمّ درجتان تحت الصفر ثمّ ست درجات تحت الصفر ثمّ الصفر ثمّ درجتان فوق الصفر' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : `1am.m5.r04` (lire une abscisse décimale sur une demi-droite graduée) et `1am.m1.r04` (comparer des décimaux).
  priorKnowledge: ['muqarana-ashriya-1am', 'faasila-nisf-mustaqim-1am'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `frost-gauge` (la main tient le NIVEAU de la jauge ; l'ombre dans un miroir ; la paire à même distance), monde `winterdjelfa` :
    //   مبتدئ — b1 5 · −2 · −3 · 0 · 2 (une semaine à Djelfa) ; b2 −40 · 30 · 0 m (l'altitude) ; b3 le niveau −4, l'ombre de 3, le zéro (le miroir).
    //   متقدم — a1 deux lectures à 6 du zéro (pas 2) ; a2 les étages −2 · 5 · 0 ; a3 −30 · 20 m (qui est le plus loin de la mer).
    {
      kind: 'manipulation', code: 'frost-gauge-week', type: 'frost-gauge', module: 1,
      level: 'beginner',
      title: 'أسبوع في الجلفة: قراءات المحرار',
      objective: 'نرفع مستوى جهاز قياس عمودي وننزله حتى القراءة المطلوبة، فنكتشف العدد السالب وإشارته ومسافته إلى الصفر، والعددين المتعاكسين',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'winterdjelfa' },
      learningPointIds: ['1am_adad-nisbiya-siyaqat_P1', '1am_adad-nisbiya-siyaqat_P2', '1am_adad-nisbiya-siyaqat_P3'],
      sourceElementIds: ['act-1-temp', 'opener-lift'],
    },
    {
      kind: 'manipulation', code: 'frost-gauge-distance', type: 'frost-gauge', module: 1,
      level: 'advanced',
      title: 'أسبوع في الجلفة: المسافة والإشارة',
      objective: 'نرفع مستوى جهاز قياس عمودي وننزله حتى القراءة المطلوبة، فنكتشف العدد السالب وإشارته ومسافته إلى الصفر، والعددين المتعاكسين',
      autonomy: 'يسجّل التلميذ قراءتين مختلفتين لهما المسافة نفسها إلى الصفر، ثمّ يقرأ طوابق عمارة ويقارن أبعد موضعين عن سطح البحر دون أن يرى إشارة قبل أن يقرّر',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'winterdjelfa' },
      learningPointIds: ['1am_adad-nisbiya-siyaqat_P1', '1am_adad-nisbiya-siyaqat_P2', '1am_adad-nisbiya-siyaqat_P3'],
      sourceElementIds: ['act-1-temp', 'opener-lift', 'know-2'],
    },
    // Module 3 — le MÊME instrument posé seul (`levels={false}`) : une tâche à trois lectures, avec les trois gestes de la méthode.
    {
      kind: 'manipulation', code: 'frost-gauge-method', type: 'frost-gauge', module: 3,
      title: 'أقرأ المحرار وأكتب العدد',
      learningPointIds: ['1am_adad-nisbiya-siyaqat_P2', '1am_adad-nisbiya-siyaqat_P3'],
      sourceElementIds: ['know-2'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — مرصد الجلفة', learningPointIds: ['1am_adad-nisbiya-siyaqat_P1', '1am_adad-nisbiya-siyaqat_P2', '1am_adad-nisbiya-siyaqat_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — حرارة السنوات', learningPointIds: ['1am_adad-nisbiya-siyaqat_P1', '1am_adad-nisbiya-siyaqat_P2'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — بعثة الكشّافة', learningPointIds: ['1am_adad-nisbiya-siyaqat_P1', '1am_adad-nisbiya-siyaqat_P2', '1am_adad-nisbiya-siyaqat_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ مقارنة أعداد عشرية وقراءة فاصلة على نصف مستقيم مدرّج.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — أسبوع في الجلفة', desc: 'جهاز قياس لا يُظهر إلا الصفر: أرفع المستوى وأنزله إلى كلّ قراءة، وأقرأ الارتفاعات والأعماق والطوابق.',
      stage: 'trigger', teachesLearningPointIds: ['1am_adad-nisbiya-siyaqat_P1', '1am_adad-nisbiya-siyaqat_P2', '1am_adad-nisbiya-siyaqat_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 1, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — الأعداد النسبية', desc: 'لماذا نحتاج الأعداد السالبة، العدد الموجب والسالب والصفر، الإشارة والمسافة إلى الصفر، والعددان المتعاكسان.',
      stage: 'discovery', teachesLearningPointIds: ['1am_adad-nisbiya-siyaqat_P1', '1am_adad-nisbiya-siyaqat_P2', '1am_adad-nisbiya-siyaqat_P3'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أقرأ وأكتب', desc: 'أحوّل وضعية إلى عدد نسبي، وأعيّن مسافته إلى الصفر ومعاكسه: ثلاثة أفعال.',
      stage: 'formalization', teachesLearningPointIds: ['1am_adad-nisbiya-siyaqat_P2', '1am_adad-nisbiya-siyaqat_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'قراءات محرار، طوابق عمارة، تواريخ قبل الميلاد وبعده، صحيح أم خاطئ، المسافة إلى الصفر والمعاكس.',
      stage: 'practice_lab', teachesLearningPointIds: ['1am_adad-nisbiya-siyaqat_P1', '1am_adad-nisbiya-siyaqat_P2', '1am_adad-nisbiya-siyaqat_P3'],
      color: 'amber', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — مرصد الجلفة', desc: 'مسألة الدرس: القراءات، الأبرد، والمعاكس.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_adad-nisbiya-siyaqat_P1', '1am_adad-nisbiya-siyaqat_P2', '1am_adad-nisbiya-siyaqat_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — حرارة السنوات', desc: 'سنوات أبرد وأدفأ من المتوسط: إشارة الانحراف ومسافته.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_adad-nisbiya-siyaqat_P1', '1am_adad-nisbiya-siyaqat_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — بعثة الكشّافة', desc: 'ارتفاعات وأعماق على جهاز واحد: الأخفض، الأبعد، والمعاكس.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_adad-nisbiya-siyaqat_P1', '1am_adad-nisbiya-siyaqat_P2', '1am_adad-nisbiya-siyaqat_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
