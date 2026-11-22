/**
 * الدرس — مقارنة كسرين (2AM, unité 2 « الكسور والعمليات عليها ») — la CINQUIÈME leçon de l'unité (2am.m1.r08), générée DANS son entrée du catalogue (même code, même item), cycle moyen phase 3,
 * 2026-10-29. Manuel 2AM (الجيل الثاني, منشورات الشهاب) : نشاط 6 p. 25, معارف 3 p. 28, طريقة 5 p. 29, أوظّف pp. 31–32, أؤكّد p. 33, أتعمّق p. 34.
 * Source de vérité : docs/sources/2am/unit2/extraction.json ; plan : docs/sources/2am/unit2/plan/muqarana-kasrayn.md.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter–§4quinquies) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : « ليزر المستوى » — à la معصرة التعاونية deux réservoirs identiques portent chacun un tube de verre gradué DIFFÉREMMENT (quarts à gauche, douzièmes à droite) ; la main glisse un niveau laser
 *   rouge qui traverse les deux tubes : la MÊME hauteur est lue dans les deux graduations (3/4 = 9/12 est VU, pas calculé). Mêmes crans → on compare les crans remplis ; même nombre de crans remplis →
 *   les crans les plus petits sont plus bas ; un réservoir au-dessus du trait « 1 » est trop plein. Les modèles faux (comparer les seuls numérateurs, croire que plus de crans = plus d'huile) sont réfutés par le monde.
 *   Rejetées : (a) l'activité 6 du manuel (deux pains dessinés : le dessin fait la comparaison, l'élève le lit) → application de أتمرّن (deux plateaux de بغرير) ; (b) la droite graduée (placer = leçon PRÉVUE de 1AM
 *   et `number-line-pegs` en 3AM) ; (c) le mélange de couleurs (`shade-match`, 3AM).
 *   Ordre des idées : mêmes crans → un multiple (réécrire) → mêmes crans remplis mais crans différents → le trait « 1 » → معارف → طريقة (réécrire, ranger, passer par 1, numérateurs décimaux) → pratique, trois مسائل, test.
 *
 * HISTOIRE DES الكفاءات (positions gardées : les identifiants sont positionnels) — brouillon → texte final :
 *   P1  « مقارنة كسرين لهما نفس المقام » → + « ولو كان البسطان عشريين » (manuel : 16 > 11,3 ; 7,1/6 et 7/6) ;
 *   P2  inchangée ;   P3  inchangée ;
 *   P4  « مقارنة كسر بالعدد 1 » → + « واستعمال 1 وسيطًا لمقارنة كسرين » (manuel : 7/11 < 1 < 4/3). 3AM `tasawi-muqaranat-kasrayn` P3 PROLONGE avec « un intermédiaire FRACTION » et le choix de la méthode.
 * Le réseau : 2am.m1.r08 a pour base 1am.m5.r01 et 1am.m5.r02 (leçons PUBLIÉES, « تذكّر » avec lien) ; `jam-tarh-kusur` (même mise sur même dénominateur) est rappelée avec son lien.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab/muqarana-kasrayn';

export const LESSON_CONFIG = {
  id: 'muqarana-kasrayn',
  kind: 'lesson',
  unit: 'kusur-amaliyat',
  unitTitle: 'الكسور والعمليات عليها',
  sequentialUnlock: true,
  title: 'مقارنة كسرين',
  description: 'نحرّك ليزر المستوى على خزّانين مدرّجين بشكلين مختلفين فنقرأ الارتفاع نفسه في الأنبوبين، ونقارن كسرين لهما نفس المقام أو نفس البسط أو مقام أحدهما مضاعف للآخر، ونقارن كسرًا بالعدد 1 ونرتّب كسورًا.',
  level: 'moyen',
  grade: '2am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🫒',
  estimatedDurationMin: 69,
  textbookRef: { unit: 2, activity: 6, pages: '25, 28, 29' },
  skills: [
    'مقارنة كسرين لهما نفس المقام، ولو كان البسطان عشريين: أكبرهما هو الذي له أكبر بسط، مثل $\\frac{4}{11}<\\frac{9}{11}$',
    'مقارنة كسرين لهما نفس البسط: أكبرهما هو الذي له أصغر مقام، مثل $\\frac{7}{9}>\\frac{7}{12}$',
    'مقارنة كسرين مقام أحدهما مضاعف لمقام الآخر بعد توحيد المقامين، وترتيب كسور تصاعديًا أو تنازليًا، مثل $\\frac{3}{5}=\\frac{12}{20}>\\frac{11}{20}$',
    'مقارنة كسر بالعدد $1$ بمقارنة بسطه بمقامه، واستعمال $1$ وسيطًا لمقارنة كسرين، مثل $\\frac{7}{11}<1<\\frac{9}{7}$',
  ],
  teachingScope: {
    include: ['مقارنة كسرين لهما نفس المقام (ولو كان البسطان عشريين)', 'مقارنة كسرين لهما نفس البسط', 'مقارنة كسرين مقام أحدهما مضاعف لمقام الآخر', 'ترتيب كسور تصاعديًا وتنازليًا', 'مقارنة كسر بالعدد 1 واستعماله وسيطًا'],
    exclude: ['الجداء المتقاطع وأيّ مضاعف مشترك كيفي (السنة الثالثة)', 'وسيط كسري غير 1 واختيار الطريقة (السنة الثالثة)', 'الكسور السالبة', 'المقارنة بالآلة الحاسبة'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js).
  lessonProblem: {
    module: 5,
    title: 'تبرّعات الأقسام',
    statement: 'جمعت ثلاثة أقسام تبرّعات لمكتبة المدرسة: القسم الأوّل $\\frac{5}{12}$ من المبلغ، والثاني $\\frac{1}{3}$ منه، والثالث الباقي.',
    questions: [
      { label: '1)', text: 'ما حصّة القسم الثالث من المبلغ؟' },
      { label: '2)', text: 'رتّب حصص الأقسام الثلاثة تنازليًا.' },
      { label: '3)', text: 'هل ساهم القسم الأوّل بأكثر من النصف؟' },
    ],
    illustration: { kind: 'tags', cards: [{ title: 'القسم الأوّل', icon: 'book', lines: [{ label: 'ساهم بـ', value: '5/12', unit: 'المبلغ' }] }, { title: 'القسم الثاني', icon: 'book', lines: [{ label: 'ساهم بـ', value: '1/3', unit: 'المبلغ' }] }], ariaLabel: 'بطاقتان: القسم الأوّل ساهم بخمسة أجزاء من اثني عشر والقسم الثاني بثلث المبلغ' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : `1am.m5.r01` (items 1 et 2), `1am.m5.r02` (items 3 et 4), la mise sur même dénominateur (item 5, `jam-tarh-kusur` publiée) et un repérage sur une droite graduée (item 6).
  priorKnowledge: ['hasil-qisma-kasr-1am', 'ikhtizal-kitaba-kasriya-1am', 'jam-tarh-kusur-2am', 'mustaqim-mudarraj'],
  resources: [
    // Module 1 — WORKSPACE À DEUX NIVEAUX, un seul type `level-laser` (la main tient la HAUTEUR du laser, lue dans deux graduations) :
    //   مبتدئ — l1 5/8 | 7/8 · l2 3/4 | 7/12 · l3 3/5 | 3/8 · l4 9/8 | 5/6.
    //   متقدم — tubes VOILÉS (on écrit avant de voir) : a1 5/6 | 11/18 · a2 2/3 | 5/9 | 7/9 · a3 2,5/4 | 5,5/8 · a4 7/5 | 11/10.
    {
      kind: 'manipulation', code: 'level-laser-beginner', type: 'level-laser', module: 1,
      level: 'beginner',
      title: 'ليزر المستوى: أقرأ الارتفاع نفسه في أنبوبين',
      objective: 'نكتشف كيف نقارن كسرين: الارتفاع الواحد يُقرأ في الأنبوبين بعلاماتهما، فنقارن العلامات المملوءة حين تتساوى العلامات',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'oilpress' },
      learningPointIds: ['2am_muqarana-kasrayn_P1', '2am_muqarana-kasrayn_P2', '2am_muqarana-kasrayn_P3', '2am_muqarana-kasrayn_P4'],
      sourceElementIds: ['act-6'],
    },
    {
      kind: 'manipulation', code: 'level-laser-predict', type: 'level-laser', module: 1,
      level: 'advanced',
      title: 'ليزر المستوى: أتوقّع قبل أن أرى',
      objective: 'نكتشف كيف نقارن كسرين: الارتفاع الواحد يُقرأ في الأنبوبين بعلاماتهما، فنقارن العلامات المملوءة حين تتساوى العلامات',
      autonomy: 'تُغطّى الأنابيب: يقول التلميذ أيّ الخزّانين فيه زيت أكثر ويكتب المستوى بعلامات الأنبوب الآخر، ثم تُرفع الأغطية ويتحقّق بالليزر',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'oilpress' },
      learningPointIds: ['2am_muqarana-kasrayn_P1', '2am_muqarana-kasrayn_P2', '2am_muqarana-kasrayn_P3', '2am_muqarana-kasrayn_P4'],
      sourceElementIds: ['method-5'],
    },
    {
      kind: 'manipulation', code: 'level-laser-maarif', type: 'level-laser', module: 2,
      title: 'ليزر المستوى: ثلثان وخمسة أسداس',
      objective: 'نكتشف كيف نقارن كسرين: الارتفاع الواحد يُقرأ في الأنبوبين بعلاماتهما، فنقارن العلامات المملوءة حين تتساوى العلامات',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'oilpress' },
      learningPointIds: ['2am_muqarana-kasrayn_P3'],
      sourceElementIds: ['know-3c'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — تبرّعات الأقسام', learningPointIds: ['2am_muqarana-kasrayn_P1', '2am_muqarana-kasrayn_P3', '2am_muqarana-kasrayn_P4'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — من قرأ أكثر؟', learningPointIds: ['2am_muqarana-kasrayn_P2', '2am_muqarana-kasrayn_P3', '2am_muqarana-kasrayn_P4'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — أرض العائلة', learningPointIds: ['2am_muqarana-kasrayn_P3', '2am_muqarana-kasrayn_P4'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ كتابات كسرية متساوية، واختزال، وجمع كسرين، وقراءة مستقيم مدرّج.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — ليزر المستوى', desc: 'خزّانان بأنبوبين مدرّجين بشكلين مختلفين: حرّك الليزر واقرأ الارتفاع نفسه فيهما، ثم قل أيّهما فيه زيت أكثر.',
      stage: 'trigger', teachesLearningPointIds: ['2am_muqarana-kasrayn_P1', '2am_muqarana-kasrayn_P2', '2am_muqarana-kasrayn_P3', '2am_muqarana-kasrayn_P4'],
      color: 'indigo', style: 'featured', estimatedMin: 23, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — قواعد المقارنة', desc: 'تسمية القواعد: نفس المقام، نفس البسط، مقام مضاعف للآخر، والمقارنة بالعدد 1.',
      stage: 'discovery', teachesLearningPointIds: ['2am_muqarana-kasrayn_P1', '2am_muqarana-kasrayn_P2', '2am_muqarana-kasrayn_P3', '2am_muqarana-kasrayn_P4'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أقارن وأرتّب', desc: 'أختار الطريقة المناسبة: توحيد المقامات، ترتيب كسور، المرور بالعدد 1، وبسط عشري.',
      stage: 'formalization', teachesLearningPointIds: ['2am_muqarana-kasrayn_P1', '2am_muqarana-kasrayn_P3', '2am_muqarana-kasrayn_P4'],
      color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'ستة تمارين: صينيتا البغرير، وأصغر من 1 وأكبر منه، وضع < أو >، وكسر بين كسرين، وترتيب، ومقارنات مختلفة.',
      stage: 'practice_lab', teachesLearningPointIds: ['2am_muqarana-kasrayn_P1', '2am_muqarana-kasrayn_P2', '2am_muqarana-kasrayn_P3', '2am_muqarana-kasrayn_P4'],
      color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — تبرّعات الأقسام', desc: 'مسألة الدرس: حصص ثلاثة أقسام، والباقي، والترتيب.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_muqarana-kasrayn_P1', '2am_muqarana-kasrayn_P3', '2am_muqarana-kasrayn_P4'],
      color: 'amber', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — من قرأ أكثر؟', desc: 'ثلاثة قرّاء لرواية واحدة: من قرأ أكثر؟ ومن تجاوز النصف؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_muqarana-kasrayn_P2', '2am_muqarana-kasrayn_P3', '2am_muqarana-kasrayn_P4'],
      color: 'amber', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — أرض العائلة', desc: 'قمح وشعير وعدس: ترتيب الأجزاء، والجزء غير المزروع، ومقارنة المزروع بالكلّ.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_muqarana-kasrayn_P3', '2am_muqarana-kasrayn_P4'],
      color: 'amber', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
