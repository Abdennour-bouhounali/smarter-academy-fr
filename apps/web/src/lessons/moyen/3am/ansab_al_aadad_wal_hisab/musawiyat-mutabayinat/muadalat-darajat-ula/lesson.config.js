/**
 * الدرس — المعادلات من الدرجة الأولى بمجهول واحد (3AM, unité 5 « المساويات – المتباينات – المعادلات ») — générée DANS son entrée du catalogue
 * (item 3am.m5.r06), cycle moyen phase 3, Phase A de la file (2026-10-21, entrée #6) : les درس 4AM « جداء معدوم » et « ترييض مشكلة » (et l'unité des
 * systèmes) s'appuient sur elle. Elle REMPLACE dans la file le درس 2AM `hall-mushkil-muadala`, dont l'item `2am.m4.r08` (« a ÷ … = b ») elle PROLONGE :
 * elle s'ouvre sur un « تذكّر — السنة الثانية » (le درس de base n'est pas publié : pas de lien) et ne le reconstruit pas. Manuel 3AM (الجيل الثاني,
 * الشهاب), RÉFÉRENCE des الكفاءات : نشاط 4 p. 73, معارف 4–5 p. 76, طرائق pp. 77, exercices 29–49 pp. 79–80, أتعمّق 50–65 pp. 82–83, أؤكّد 6–13 p. 81,
 * ICT p. 85, أستعدّ 2, 5, 6, 10 p. 71. Source : docs/sources/3am/unit5/extraction.json. Rien n'est montré tel quel : tout est réécrit (§4ter-bis).
 * Le réseau : ses liens « راجع » — 2am.m4.r08 (`hall-mushkil-muadala`, 2AM), 3am.m5.r01 (`tabsit-hadhf-aqwas`, même livre, une autre leçon) et
 * 3am.m5.r05 (`musawiyat-amaliyat`, PUBLIÉE = leçon #5) : « أستعدّ » les mesure toutes les trois. `pointPrerequisites` : P3 ← les deux الكفاءات P1, P2 de
 * `musawiyat-amaliyat` (lien du réseau r05 → r06, vers une leçon PUBLIÉE).
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : la « عبّارة الحدود » (labo `term-ferry`, thème `river`). L'équation est un fleuve entre deux rives (les deux membres) ; chaque terme
 *   est une CAISSE ; la solution est CACHÉE (le calcul la connaît, pas l'élève). La MAIN porte une caisse d'une rive à l'autre et CHOISIT son signe à
 *   l'arrivée (deux quais : « كما هو » / « بعكس إشارته ») — c'est là que « نقل حدّ بتغيير إشارته » devient nécessaire sous la main : garder le signe casse
 *   l'équation (le refus est le calcul des deux membres au x caché, écrit avec ses valeurs), le changer revient à ajouter l'opposé aux DEUX membres
 *   (la leçon précédente) ; les termes semblables fusionnent d'eux-mêmes (leur règle est celle de `tabsit-hadhf-aqwas`, rappelée, non reconstruite).
 *   Quand x reste seul d'un côté (a·x = n), la main règle le diviseur ; « عوّض » écrit la vérification. مبتدئ : 3x + 2 = x + 8 puis 4x − 3 = 2x + 7 ;
 *   متقدم : 9x + 1 = 5x − 7 (le manuel, x = −2), −2x + 5 = 3x − 10 (un coefficient NÉGATIF : on divise par −5), 7x − 190 = 6x + 110 (x = 300).
 *   Rejetées : (a) le نشاط 4 du manuel comme entrée (« سمير وليلى choisissent le même nombre … ») — il demande déjà de poser une équation, c'est une
 *   APPLICATION en أتمرّن ; (b) la balance de Roberval : c'est le labo `equation-balance` du 4AM « معادلات ومتراجحات » (on ne le repeint pas ; la main y tient le
 *   CONTENU d'un plateau, ici le SIGNE d'un terme) ; (c) la règle de `solution-ray` (une sonde x sur une demi-droite : le 4AM) ; (d) un solveur qui donne x.
 *   Ordre des idées : un terme traverse en changeant de signe (P3) → x seul, on divise, on vérifie (P3, P2) → معارف : nommer l'équation, sa solution, la
 *   vérification par substitution (P1, P2) avec le « تذكّر — السنة الثانية » → طريقة : les étapes d'une résolution, puis la MISE EN ÉQUATION d'une
 *   situation (P3, P4) → أتمرّن (le نشاط 4 et les exercices réécrits) → trois مسائل → إختبار أولي.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 * 2026-10-29 : `hall-mushkil-muadala` (2AM, 2am.m4.r08) est publiée — arêtes LP P1 ← 2am_hall-mushkil-muadala_P2 et P4 ← 2am_hall-mushkil-muadala_P1
 * (lien du réseau 2am.m4.r08 → 3am.m5.r06, `extends`) ; le « تذكّر — السنة الثانية » (RECALL) devient un lien tout seul.
 */
export const LESSON_BASE_PATH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab/muadalat-darajat-ula';

export const LESSON_CONFIG = {
  id: 'muadalat-darajat-ula',
  kind: 'lesson',
  unit: 'musawiyat-mutabayinat',
  unitTitle: 'المساويات – المتباينات – المعادلات',
  sequentialUnlock: true,
  title: 'المعادلات من الدرجة الأولى بمجهول واحد',
  description: 'عبّارة تنقل صناديق (حدود معادلة) من ضفّة إلى أخرى: نكتشف أنّ الحدّ يغيّر إشارته حين يعبر، وأنّنا نقسم على معامل x، ونتحقق بالتعويض، ثم نرييض مشكلة بمعادلة ونحلّها.',
  level: 'moyen',
  grade: '3am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '⛵',
  estimatedDurationMin: 86,
  textbookRef: { unit: 5, activity: 4, pages: '71, 73, 76, 77, 79, 80, 81, 82, 83, 85' },
  skills: [
    'التعرّف على معادلة من الدرجة الأولى بمجهول واحد (من الشكل $ax + b = cx + d$) ومعنى حلّها: قيمة المجهول التي تجعل الطرفين متساويين',
    'التحقق بالتعويض من أنّ عددًا حلّ لمعادلة (حساب الطرفين وإثبات تساويهما أو عدم تساويهما)',
    'حلّ معادلة من الشكل $ax + b = cx + d$ بإضافة معاكس الحدود إلى الطرفين (نقل حدّ بتغيير إشارته) ثم القسمة على معامل المجهول، والتحقق من الحلّ',
    'ترييض مشكلة: اختيار المجهول وترجمة المعطيات بمعادلة وحلّها والتصريح بالحلّ والتحقق منه ضمن السياق',
  ],
  teachingScope: {
    include: ['معادلة من الشكل $ax + b = cx + d$ ، طرفاها ومجهولها وحلّها', 'التحقق بالتعويض', 'الحلّ بالعمليات على الطرفين ثم القسمة على المعامل (معامل موجب أو سالب)', 'ترييض مشكلة بمعادلة بمجهول واحد والتحقق من الحلّ في السياق'],
    exclude: ['المعادلة $a \\div \\ldots = b$ (السنة الثانية: نتذكّرها فقط)', 'خواص المساويات والعمليات (درس سابق: نستعملها فقط)', 'تبسيط عبارة جبرية (درس سابق: نستعمله فقط)', 'جمل معادلتين ومتراجحات المعادلات'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js).
  lessonProblem: {
    module: 5,
    title: 'كتب للمكتبة المدرسية',
    statement: 'يتعاون تلميذان على شراء كتب للمكتبة المدرسية، وثمن الكتاب الواحد $x$ دينارًا. إذا اشترى التلميذان 8 كتب فينقصهما 160 دج، وإذا اشتريا 6 كتب فيبقى معهما 120 دج.',
    questions: [
      { label: '1)', text: 'اكتب المعادلة التي تترجم أنّ المبلغ الذي معهما هو نفسه في الحالتين.' },
      { label: '2)', text: 'حلّ المعادلة. ما ثمن الكتاب الواحد؟' },
      { label: '3)', text: 'تحقّق من النتيجة: كم دينارًا معهما؟' },
    ],
    illustration: { kind: 'tags', cards: [{ title: 'اشتريا 8 كتب', lines: [{ label: 'ينقصهما دج', value: '160' }] }, { title: 'اشتريا 6 كتب', lines: [{ label: 'يبقى معهما دج', value: '120' }] }, { title: 'المطلوب', lines: [{ label: 'ثمن كتاب', value: 'x' }] }], ariaLabel: 'ثلاث بطاقات: ثمانية كتب ينقصهما 160 دينارًا، وستة كتب يبقى معهما 120 دينارًا، والمطلوب ثمن الكتاب x' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : les trois liens « راجع » du réseau (2am.m4.r08, 3am.m5.r01, 3am.m5.r05).
  priorKnowledge: ['hall-qisma', 'tabsit-ibara', 'khawass-musawiyat'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `term-ferry` (la main tient le SIGNE du terme, puis le diviseur), thème `river`.
    {
      kind: 'manipulation', code: 'term-ferry-simple', type: 'term-ferry', module: 1,
      level: 'beginner',
      title: 'عبّارة الحدود: 3x + 2 = x + 8',
      objective: 'حدّ يعبر إلى الطرف الآخر بإشارة معاكسة يُبقي المعادلة بالحلّ نفسه (نضيف معاكسه إلى الطرفين)، وحين يبقى ax = n نقسم الطرفين على a فنجد x ثم نتحقق بالتعويض',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'river' },
      learningPointIds: ['3am_muadalat-darajat-ula_P2', '3am_muadalat-darajat-ula_P3'],
      sourceElementIds: ['method-4'],
    },
    {
      kind: 'manipulation', code: 'term-ferry-negative', type: 'term-ferry', module: 1,
      level: 'advanced',
      title: 'عبّارة الحدود: 9x + 1 = 5x − 7',
      objective: 'حدّ يعبر إلى الطرف الآخر بإشارة معاكسة يُبقي المعادلة بالحلّ نفسه (نضيف معاكسه إلى الطرفين)، وحين يبقى ax = n نقسم الطرفين على a فنجد x ثم نتحقق بالتعويض',
      autonomy: 'ثلاث معادلات منها معامل سالب وعدد كبير، دون تعليمة: يختار التلميذ أيّ الصناديق يعبر أوّلًا وإشارتها والمقسوم عليه',
      experience: { type: 'textbook', reason: '', theme: 'river' },
      learningPointIds: ['3am_muadalat-darajat-ula_P2', '3am_muadalat-darajat-ula_P3'],
      sourceElementIds: ['method-4'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — كتب للمكتبة المدرسية', learningPointIds: ['3am_muadalat-darajat-ula_P3', '3am_muadalat-darajat-ula_P4'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — الرحلة المدرسية', learningPointIds: ['3am_muadalat-darajat-ula_P3', '3am_muadalat-darajat-ula_P4'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — أرقام القمصان', learningPointIds: ['3am_muadalat-darajat-ula_P2', '3am_muadalat-darajat-ula_P3', '3am_muadalat-darajat-ula_P4'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ثماني عبارات: صحيح أم خاطئ؟ المجهول في قسمة، تبسيط عبارة، وخواص المساويات.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — عبّارة الحدود', desc: 'صناديق تعبر من ضفّة إلى أخرى: ماذا يحدث لإشارة الحدّ؟ وماذا نفعل حين يبقى x مضروبًا في عدد؟',
      stage: 'trigger', teachesLearningPointIds: ['3am_muadalat-darajat-ula_P2', '3am_muadalat-darajat-ula_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — المعادلة وحلّها', desc: 'نسمّي المعادلة وحلّها ونتحقق بالتعويض، ونتذكّر ما عرفناه في السنة الثانية.',
      stage: 'discovery', teachesLearningPointIds: ['3am_muadalat-darajat-ula_P1', '3am_muadalat-darajat-ula_P2'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أحلّ وأرييض', desc: 'مراحل حلّ معادلة، ثم ترييض مشكلة: المجهول والمعادلة والحلّ والتحقق.',
      stage: 'formalization', teachesLearningPointIds: ['3am_muadalat-darajat-ula_P3', '3am_muadalat-darajat-ula_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'عدد مشترك، معادلة أم لا، حلّ بالتعويض، حلّ معادلات، وترييض مشكلات.',
      stage: 'practice_lab', teachesLearningPointIds: ['3am_muadalat-darajat-ula_P1', '3am_muadalat-darajat-ula_P2', '3am_muadalat-darajat-ula_P3', '3am_muadalat-darajat-ula_P4'],
      color: 'amber', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — كتب للمكتبة المدرسية', desc: 'مسألة الدرس: ثمانية كتب ينقصها مبلغ وستة كتب يبقى منها مبلغ.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_muadalat-darajat-ula_P3', '3am_muadalat-darajat-ula_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — الرحلة المدرسية', desc: 'مساهمتان مختلفتان للتلميذ الواحد: كم تلميذًا يشارك؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_muadalat-darajat-ula_P3', '3am_muadalat-darajat-ula_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — أرقام القمصان', desc: 'ثلاثة أعداد متتابعة مجموعها 63: نختار المجهول ونكتب معادلة ونتحقق.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_muadalat-darajat-ula_P2', '3am_muadalat-darajat-ula_P3', '3am_muadalat-darajat-ula_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الأربع.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
