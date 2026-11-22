/**
 * الدرس — التعليم على مستقيم مدرّج (2AM, unité 3 « الأعداد النسبية ») — DANS son entrée du catalogue (item 2am.m4.r01), cycle moyen phase 3,
 * 2AM مقطع 2am.m4, paire 1 (2026-10-29). Manuel 2AM (الجيل الثاني, منشورات الشهاب, scan), RÉFÉRENCE des الكفاءات : نشاط 1 (a-b) p. 40, معارف 1 (a) p. 42,
 * أستعدّ p. 39, exercices 1–11 p. 46, أؤكّد 4 p. 49. Il n'y a PAS de طريقة dans le manuel pour cette compétence : la plateforme écrit la sienne.
 * Source : docs/sources/2am/unit3/extraction.json. Rien n'est montré tel quel : tout est réécrit (§4ter-bis).
 * Le réseau : `2am.m4.r01` CONSOLIDE `1am.m5.r06` (« نفس الكفاءة على مستقيم مدرّج »), leçon 1AM NON publiée : « أستعدّ » mesure la base, M2 s'ouvre sur
 * « تذكّر — السنة الأولى » SANS lien (`addition('prior_year_reminder')`), et la leçon va droit à l'ancrage (graduations autres que 1, CHOIX de l'origine et de la
 * graduation, l'opposé). `noRebuildForLesson` vide ; `pointPrerequisites` : arêtes internes seulement (P2 ← P1, P3 ← P1, P3 ← P2).
 * 2026-10-30 : `talim-mustaqim-mudarraj` (1AM, 1am.m5.r06) est publiée — arête LP P1 ← 1am_talim-mustaqim-mudarraj_P3 (lien du réseau 1am.m5.r06 → 2am.m4.r01,
 * `consolidates`) ; le « تذكّر — السنة الأولى » devient un lien tout seul.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : la « مسطرة الكورنيش » (labo `corniche-ruler`, monde `corniche`). Une planche graduée est fixée sous des repères du front de mer ; la main tient
 *   l'ORIGINE (le drapeau « 0 ») à مبتدئ et la VALEUR D'UNE GRADUATION (un levier à crans) à متقدم ; l'abscisse d'un repère est une SORTIE : elle change quand le
 *   drapeau bouge alors que le repère n'a pas bougé, deux repères à la même distance de part et d'autre ne sont opposés que pour UNE origine, un arrêt de bus tombe
 *   entre deux graduations (case hachurée). À متقدم la graduation décide si les points restent sur la planche (trop petite : « خارج اللوحة ») et sur des graduations (trop grande : entre deux).
 *   Rejetées : (a) le نشاط 1 du manuel comme entrée (une frise de monuments dont l'ordre des dates se répond de mémoire, graduation dessinée par le livre) — il devient une APPLICATION
 *   en أتمرّن avec une frise à origine 2000 ; (b) un thermomètre (échelle verticale, `zero-probe` dans cette unité) ; (c) les étages d'un ascenseur (graduation toujours 1, `elevator-reel` en 3AM).
 *   Ordre des idées : lire l'abscisse d'un repère (graduation 10) → déplacer l'origine, le même repère change de nombre → deux repères d'abscisses opposées (même distance au
 *   zéro) → un repère entre deux graduations → معارف (abscisse, A(−3), distance au zéro, opposés) → choisir la graduation → طريقة → أتمرّن → trois مسائل → إختبار أولي.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab/talim-mustaqim-mudarraj-2';
export const LESSON_CONFIG = {
  id: 'talim-mustaqim-mudarraj-2',
  kind: 'lesson',
  unit: 'adad-nisbiya-2',
  unitTitle: 'الأعداد النسبية',
  sequentialUnlock: true,
  title: 'التعليم على مستقيم مدرّج',
  description: 'لوحة مدرّجة تحت درابزين الكورنيش: بنقل دبّوس الصفر وبتغيير قيمة التدريجة نكتشف كيف نقرأ فاصلة نقطة ونعلّم نقطًا ذات فواصل معلومة، ونتعرّف على العددين المتعاكسين.',
  level: 'moyen',
  grade: '2am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '📏',
  estimatedDurationMin: 84,
  textbookRef: { unit: 3, activity: 1, pages: '38, 39, 40, 42, 46, 49' },
  skills: [
    'التعرّف على العدد النسبي بإشارته ومسافته إلى الصفر، وعلى العددين المتعاكسين مثل $(+3)$ و $(-3)$',
    'قراءة فاصلة نقطة على مستقيم مدرّج وكتابتها مثل $A(-3)$ ، بعدّ التدريجات وبمراعاة قيمة التدريجة الواحدة',
    'وضع نقط ذات فواصل معلومة على مستقيم مدرّج مع اختيار مبدأ ووحدة تدريج مناسبين',
  ],
  teachingScope: {
    include: ['فاصلة نقطة على مستقيم مدرّج: عدّ التدريجات من المبدأ وقيمة التدريجة الواحدة (1، 2، 5، 10، 25، 100، 0,5، 0,1، 0,25)', 'المسافة إلى الصفر والعددان المتعاكسان', 'اختيار المبدأ وقيمة التدريجة لوضع نقط ذات فواصل معلومة، وتغيّر الفاصلة بتغيّر المبدأ'],
    exclude: ['مقارنة عددين نسبيين وترتيبهما (درس لاحق: نذكر فقط أنّ اليسار أصغر)', 'المسافة بين نقطتين ومنتصف قطعة (درس لاحق)', 'جمع وطرح الأعداد النسبية (دروس لاحقة)', 'الكسور كفواصل (السنة الثالثة)'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js) — la frise de la متوسطة.
  lessonProblem: {
    module: 5,
    title: 'خطّ زمن متوسطتنا',
    statement: 'نتّخذ سنة افتتاح المتوسطة $2000$ مبدأً لخطّ زمن، وعليه الأحداث الآتية: $1985$ ، $1990$ ، $2010$ ، $2015$ ، $2024$ .',
    table: { caption: 'أحداث خطّ الزمن (المبدأ سنة $2000$)', head: ['الحدث', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس'], rows: [['السنة', '1985', '1990', '2010', '2015', '2024']] },
    questions: [
      { label: '1)', text: 'اكتب فاصلة كل حدث.' },
      { label: '2)', text: 'أيّ حدثين فاصلتاهما متعاكستان؟' },
      { label: '3)', text: 'لو اتّخذنا سنة $1990$ مبدأً، فما فاصلة سنة $2024$ ؟ وأيّ تدريجة تناسب الأحداث؟' },
    ],
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : les liens « راجع » du réseau (1am.m5.r04, r05, r06), en quatre idées de vocabulaire.
  priorKnowledge: ['faasila-nuqta', 'adad-nisbiya-siyaq-1am', 'nisf-mustaqim-1am', 'adad-mutaakis'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `corniche-ruler` (la main tient l'ORIGINE, puis la GRADUATION), monde `corniche` :
    //   مبتدئ — b1 lire, b2 amener le 0 sous le banc, b3 deux repères opposés, b4 un repère entre deux graduations ; متقدم — a1–a3 choisir la graduation puis toucher.
    {
      kind: 'manipulation', code: 'corniche-ruler-beginner', type: 'corniche-ruler', module: 1,
      level: 'beginner',
      title: 'مسطرة الكورنيش: دبّوس الصفر',
      objective: 'فاصلة نقطة هي عدد التدريجات من المبدأ مضروبًا في قيمة التدريجة وإشارتها حسب الجهة وتتغيّر بتغيّر المبدأ',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'corniche' },
      learningPointIds: ['2am_talim-mustaqim-mudarraj-2_P1', '2am_talim-mustaqim-mudarraj-2_P2'],
      sourceElementIds: ['act-1', 'know-1a'],
    },
    {
      kind: 'manipulation', code: 'corniche-ruler-advanced', type: 'corniche-ruler', module: 1,
      level: 'advanced',
      title: 'مسطرة الكورنيش: قيمة التدريجة',
      objective: 'فاصلة نقطة هي عدد التدريجات من المبدأ مضروبًا في قيمة التدريجة وإشارتها حسب الجهة وتتغيّر بتغيّر المبدأ',
      autonomy: 'الأعداد عشرية والتدريجة تُختار من عشرة اختيارات: يقرّر التلميذ قيمتها قبل أن تظهر أعداد اللوحة',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'corniche' },
      learningPointIds: ['2am_talim-mustaqim-mudarraj-2_P2', '2am_talim-mustaqim-mudarraj-2_P3'],
      sourceElementIds: ['act-1'],
    },
    // Module 2 — le MÊME labo, posé seul (`levels={false}`) : graduation 5, le drapeau sous le banc.
    {
      kind: 'manipulation', code: 'corniche-ruler-maarif', type: 'corniche-ruler', module: 2,
      title: 'مسطرة الكورنيش بتدريجة مختلفة',
      learningPointIds: ['2am_talim-mustaqim-mudarraj-2_P1', '2am_talim-mustaqim-mudarraj-2_P2'],
      sourceElementIds: ['know-1a'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — خطّ زمن متوسطتنا', learningPointIds: ['2am_talim-mustaqim-mudarraj-2_P1', '2am_talim-mustaqim-mudarraj-2_P2', '2am_talim-mustaqim-mudarraj-2_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — منسوب السدّ', learningPointIds: ['2am_talim-mustaqim-mudarraj-2_P1', '2am_talim-mustaqim-mudarraj-2_P3'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — أزرار المصعد', learningPointIds: ['2am_talim-mustaqim-mudarraj-2_P1', '2am_talim-mustaqim-mudarraj-2_P2', '2am_talim-mustaqim-mudarraj-2_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ العدد السالب، فاصلة نقطة، والعددان المتعاكسان.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — مسطرة الكورنيش', desc: 'لوحة مدرّجة تحت الدرابزين: ماذا يحدث لفاصلة معلم إذا نقلنا دبّوس الصفر؟ وكيف نختار قيمة التدريجة؟',
      stage: 'trigger', teachesLearningPointIds: ['2am_talim-mustaqim-mudarraj-2_P1', '2am_talim-mustaqim-mudarraj-2_P2', '2am_talim-mustaqim-mudarraj-2_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — الفاصلة والعددان المتعاكسان', desc: 'نقرأ فواصل بتدريجة مختلفة، ثم نسمّي الفاصلة والمسافة إلى الصفر والعددين المتعاكسين.',
      stage: 'discovery', teachesLearningPointIds: ['2am_talim-mustaqim-mudarraj-2_P1', '2am_talim-mustaqim-mudarraj-2_P2'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أختار تدريجة مناسبة', desc: 'أضع أربع نقط على مستقيم، وأقرأ نقطة على تدريج دقيق.',
      stage: 'formalization', teachesLearningPointIds: ['2am_talim-mustaqim-mudarraj-2_P2', '2am_talim-mustaqim-mudarraj-2_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'خطّ زمن، قراءة فواصل بتدريجات مختلفة، وضع نقط، معاكس عدد، وتدريجة تناسب درجات مهمّة.',
      stage: 'practice_lab', teachesLearningPointIds: ['2am_talim-mustaqim-mudarraj-2_P1', '2am_talim-mustaqim-mudarraj-2_P2', '2am_talim-mustaqim-mudarraj-2_P3'],
      color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — خطّ زمن متوسطتنا', desc: 'مسألة الدرس: فواصل الأحداث، فاصلتان متعاكستان، وتغيير المبدأ.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_talim-mustaqim-mudarraj-2_P1', '2am_talim-mustaqim-mudarraj-2_P2', '2am_talim-mustaqim-mudarraj-2_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — منسوب السدّ', desc: 'تدريجة عشرية تناسب مناسيب السدّ، والمنسوب المعاكس، والمسافة إلى الصفر.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_talim-mustaqim-mudarraj-2_P1', '2am_talim-mustaqim-mudarraj-2_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — أزرار المصعد', desc: 'طوابق عمارة على مستقيم عمودي: الفاصلة، الطابق المعاكس، وتغيير المبدأ.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_talim-mustaqim-mudarraj-2_P1', '2am_talim-mustaqim-mudarraj-2_P2', '2am_talim-mustaqim-mudarraj-2_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
