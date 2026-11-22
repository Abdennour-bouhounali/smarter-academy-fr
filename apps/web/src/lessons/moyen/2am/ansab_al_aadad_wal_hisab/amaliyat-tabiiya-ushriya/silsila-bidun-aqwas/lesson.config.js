/**
 * الدرس — سلسلة عمليات دون أقواس وأولوية العمليات (2AM, unité 1 « العمليات على الأعداد الطبيعية والأعداد العشرية ») — générée DANS son entrée du catalogue
 * (item 2am.m1.r01), cycle moyen phase 3 (2026-10-28) : elle SEMENCE l'unité (`_unit/`, extraction de toute l'unité, `chainOps.js`). Manuel 2AM (الجيل الثاني,
 * منشورات الشهاب), RÉFÉRENCE des الكفاءات : تحدّ p. 6, أستعدّ p. 7, نشاط 1 et 2 p. 8, معارف 1 p. 10, تمارين 1–7 p. 14, أؤكّد 1 et 6 p. 17, أتعمّق 39 p. 18.
 * Source : docs/sources/2am/unit1/extraction.json (plan : docs/sources/2am/unit1/plan/silsila-bidun-aqwas.md). Rien n'est montré tel quel : tout est réécrit (§4ter-bis).
 * Le réseau : `1am.m1.r05 → 2am.m1.r01` (requires, `mana-jam-tarh`, 1AM PUBLIÉE) : « أستعدّ » le mesure et معارف ouvre sur un « تذكّر — السنة الأولى » AVEC lien ;
 * `pointPrerequisites` : P2 ← P1, P3 ← P1 + P2 et P3 ← `1am_mana-jam-tarh_P1`, `1am_mana-jam-tarh_P3` (choisir l'opération, traduire « يزيد، ينقص » avant de calculer).
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : « خطّ الترامواي » (labo `tram-route`, thème `tramline`). La MAIN pose des tickets ① ② ③ sur les opérations d'une chaîne SANS parenthèses : c'est son plan.
 *   « انطلق » le rejoue : le plan calcule dans son ordre, le tram roule arrêt après arrêt et SON compteur dit la vérité. Dans « 26 − 9 + 4 » (26 dans la rame, 9 descendent au
 *   marché, 4 montent à l'université) deux camarades trouvent 13 et 21 : le compteur dit 21, car les arrêts se suivent dans l'ordre où ils sont écrits — « نزل 13 ؟ لم ينزل إلا 9 ».
 *   Avec « صعد » seul l'ordre ne compte pas ; avec « نزل » il compte. Au kiosque, 150 ÷ 6 × 4 = 100 DA ; multiplier d'abord donnerait « 4 تذاكر بـ 6,25 DA » (absurde). À l'arrêt du
 *   stade, 3 groupes de 4 montent : 15 + 3 × 4 — un groupe monte EN BLOC, 3 × 4 est UNE quantité calculée avant de rejoindre les 15 ; additionner d'abord (18 × 4 = 72) ferait des
 *   15 élèves assis des groupes de 4 : c'est la priorité du × ÷. Sur une chaîne NUE la lecture est un ACCORD (اتّفاق) que la calculatrice scientifique suit aussi.
 *   Rejetées : (a) le نشاط 1 du manuel (expliquer 15 et 21 pour 25 − 7 + 3 — l'élève commente les nombres d'un autre, de mémoire) : devient une APPLICATION (أتمرّن, 31 − 9 + 4) ;
 *   (b) le تحدّ des deux arbres (Younes / Inès) : montre deux lectures mais ne donne aucune raison de préférer l'une — son idée est gardée DANS le tram ; (c) un ticket de caisse
 *   (3 × 45 + 2 × 30) : rend la priorité naturelle mais pas le gauche-droite des + − — gardé pour les مسائل et le test.
 *   Ordre des idées : deux lectures de la même chaîne (t1) → « صعد » seul : l'ordre est libre, avec « نزل » de gauche à droite (t2) → × ÷ seuls de gauche à droite (t3) → les
 *   groupes : × ÷ avant + − (t4) → معارف nomme les trois règles → طريقة : encadrer × ÷, puis de gauche à droite ; traduire une histoire → أتمرّن, trois مسائل, le test.
 *   Ni parenthèse, crochet ou barre de fraction (`silsila-bi-aqwas`), ni nom d'une chaîne par sa dernière opération (`wasf-silsila-hisab`), ni distributivité, ni résultat négatif.
 *   Changements d'الكفاءات (ordre gardé) : P1 reformulée (« دون أقواس », « فيها جمع وطرح فقط »), P2 : l'exemple du manuel 13 + 7 × 4 remplacé par celui du labo
 *   15 + 3 × 4 = 27 (indépendance du manuel), P3 : « دون أقواس » ajouté (une situation qui exige des parenthèses est celle de `silsila-bi-aqwas`).
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab/silsila-bidun-aqwas';

export const LESSON_CONFIG = {
  id: 'silsila-bidun-aqwas',
  kind: 'lesson',
  unit: 'amaliyat-tabiiya-ushriya',
  unitTitle: 'العمليات على الأعداد الطبيعية والأعداد العشرية',
  sequentialUnlock: true,
  title: 'سلسلة عمليات دون أقواس وأولوية العمليات',
  description: 'رحلة بالترامواي يرقّم فيها التلميذ ترتيب العمليات ويرى العدّاد يحكم بينه وبين خطّته: فنكتشف أنّ سلسلة الجمع والطرح (أو الضرب والقسمة) تُحسب من اليسار نحو اليمين، وأنّ الضرب والقسمة يسبقان الجمع والطرح.',
  level: 'moyen',
  grade: '2am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🚋',
  estimatedDurationMin: 90,
  textbookRef: { unit: 1, activity: 1, pages: '6, 7, 8, 10, 14, 17, 18' },
  skills: [
    'إنجاز سلسلة عمليات فيها جمع وطرح فقط (أو ضرب وقسمة فقط) دون أقواس، بإجراء العمليات من اليسار نحو اليمين',
    'تطبيق أولوية الضرب والقسمة على الجمع والطرح في سلسلة عمليات دون أقواس، مثل $15 + 3 \\times 4 = 27$',
    'ترجمة وضعية من الحياة اليومية بسلسلة عمليات دون أقواس ثمّ حسابها',
  ],
  teachingScope: {
    include: ['سلسلة جمع وطرح فقط، أو ضرب وقسمة فقط، من اليسار نحو اليمين', 'أولوية الضرب والقسمة على الجمع والطرح في سلسلة دون أقواس، على أعداد طبيعية وعشرية', 'ترجمة وضعية تُروى بترتيب الحدوث بسلسلة دون أقواس ثم حسابها، والآلة الحاسبة العلمية تتبع القاعدة نفسها'],
    exclude: ['الأقواس والمعقوفات وخطّ الكسر ولوحة الآلة بالأقواس (درس سلسلة عمليات تتضمّن أقواسا)', 'تسمية سلسلة بآخر عملية فيها (درس وصف سلسلة حسابات)', 'خاصية توزيع الضرب على الجمع والطرح', 'كلّ نتيجة وسيطة سالبة (وحدة الأعداد النسبية)'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js).
  lessonProblem: {
    module: 5,
    title: 'درّاجة العمّ مراد',
    statement: 'اشترى العمّ مراد درّاجة بـ $18\\,500$ DA . دفع 4 أقساط، في كلّ قسط $3\\,200$ DA ، ثم دفع ابنه $1\\,500$ DA .',
    questions: [
      { label: '1)', text: 'اكتب سلسلة عمليات تعطي ما بقي على العمّ مراد أن يدفعه.' },
      { label: '2)', text: 'احسب هذه السلسلة.' },
      { label: '3)', text: 'حسب زميلك السلسلة بدءًا من طرح العدد 4 من $18\\,500$ : ما الخطأ؟' },
    ],
    illustration: { kind: 'tags', cards: [{ title: 'ثمن الدرّاجة', lines: [{ label: 'DA', value: '18500' }] }, { title: 'الأقساط', lines: [{ label: 'عدد الأقساط', value: '4' }, { label: 'DA للقسط', value: '3200' }] }, { title: 'دفعة الابن', lines: [{ label: 'DA', value: '1500' }] }], ariaLabel: 'ثلاث بطاقات: ثمن الدرّاجة 18500 دينار، 4 أقساط في كلّ قسط 3200 دينار، ودفعة الابن 1500 دينار' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : le lien « راجع » du réseau (1am.m1.r05) et les bases 1AM mesurées sans lien.
  priorKnowledge: ['jam-tarh-ashari-1am', 'darb-ashari-1am', 'mana-jam-tarh-1am'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `tram-route` (la main pose les tickets), thème `tramline`.
    {
      kind: 'manipulation', code: 'tram-route-simple', type: 'tram-route', module: 1,
      level: 'beginner',
      title: 'خطّ الترامواي: ترقيم العمليات',
      objective: 'أكتشف الترتيب الذي تُحسب به سلسلة عمليات دون أقواس',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'tramline' },
      learningPointIds: ['2am_silsila-bidun-aqwas_P1', '2am_silsila-bidun-aqwas_P2'],
      sourceElementIds: ['challenge', 'act-1'],
    },
    {
      kind: 'manipulation', code: 'tram-route-build', type: 'tram-route', module: 1,
      level: 'advanced',
      title: 'خطّ الترامواي: اكتب السلسلة وتوقّع',
      objective: 'أكتشف الترتيب الذي تُحسب به سلسلة عمليات دون أقواس',
      autonomy: 'تُروى الرحلة بكلمات، فيكتب التلميذ سلسلتها في الشريط، ثم يكتب توقّعه للعدّاد قبل أن ينطلق ويرقّم عملياتها',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'tramline' },
      learningPointIds: ['2am_silsila-bidun-aqwas_P2', '2am_silsila-bidun-aqwas_P3'],
      sourceElementIds: ['know-1'],
    },
    // Module 2 — le MÊME type, monde `mixed`, posé seul (`levels={false}`) : déclaré SANS niveau.
    {
      kind: 'manipulation', code: 'tram-route-mixed', type: 'tram-route', module: 2,
      title: 'رحلة تجمع كلّ شيء',
      learningPointIds: ['2am_silsila-bidun-aqwas_P1', '2am_silsila-bidun-aqwas_P2'],
      sourceElementIds: ['know-1'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — درّاجة العمّ مراد', learningPointIds: ['2am_silsila-bidun-aqwas_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — صندوق مكتبة القسم', learningPointIds: ['2am_silsila-bidun-aqwas_P3'], sourceElementIds: ['act-1'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — خرجة نادي البيئة', learningPointIds: ['2am_silsila-bidun-aqwas_P2', '2am_silsila-bidun-aqwas_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'سبع عبارات: صحيح أم خاطئ؟ جمع الأعداد العشرية وطرحها وضربها في وضعية، ومعنى الجمع والطرح.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 7, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — خطّ الترامواي', desc: 'رقّم عمليات رحلة بالترامواي وانطلق: هل يوافق حسابك عدّاد الركّاب؟ في أيّ ترتيب نحسب الجمع والطرح، والضرب والقسمة، وماذا يسبق ماذا؟',
      stage: 'trigger', teachesLearningPointIds: ['2am_silsila-bidun-aqwas_P1', '2am_silsila-bidun-aqwas_P2', '2am_silsila-bidun-aqwas_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 16, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — قواعد الحساب', desc: 'نسمّي ما فعلناه: ثلاث قواعد لحساب سلسلة دون أقواس، واتّفاق نتّبعه جميعًا وتتبعه الآلة الحاسبة العلمية.',
      stage: 'discovery', teachesLearningPointIds: ['2am_silsila-bidun-aqwas_P1', '2am_silsila-bidun-aqwas_P2'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — مرحلة بعد مرحلة', desc: 'نحسب سلسلة مرحلة بعد مرحلة: نحيط الضرب والقسمة أوّلًا، ثم نحسب من اليسار؛ ونترجم وضعية بسلسلة.',
      stage: 'formalization', teachesLearningPointIds: ['2am_silsila-bidun-aqwas_P1', '2am_silsila-bidun-aqwas_P2', '2am_silsila-bidun-aqwas_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'من على صواب؟ تحقّق بالآلة، احسب، صحّح ورقة زميل، أتمم، واكتب سلسلة بزوايا.',
      stage: 'practice_lab', teachesLearningPointIds: ['2am_silsila-bidun-aqwas_P1', '2am_silsila-bidun-aqwas_P2', '2am_silsila-bidun-aqwas_P3'],
      color: 'amber', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — درّاجة العمّ مراد', desc: 'مسألة الدرس: أقساط ودفعة، وسلسلة تعطي الباقي.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_silsila-bidun-aqwas_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — صندوق مكتبة القسم', desc: 'قصص تُشترى وتبرّع، ثم هل يكفي المال لقاموس؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_silsila-bidun-aqwas_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — خرجة نادي البيئة', desc: 'مسافات عشرية على الأقدام وبالدرّاجات وجبليّة: كم قطع الفوج؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_silsila-bidun-aqwas_P2', '2am_silsila-bidun-aqwas_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
