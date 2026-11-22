/**
 * الدرس — جمع وطرح كسرين (2AM, unité 2 « الكسور والعمليات عليها ») — la TROISIÈME leçon de l'unité (2am.m1.r09), générée DANS son entrée du catalogue (même code, même item), cycle moyen phase 3,
 * 2026-10-29. Manuel 2AM (الجيل الثاني, منشورات الشهاب) : نشاط 4 pp. 24–25, معارف 2 p. 28, طريقة 3 p. 29, أوظّف pp. 30–32, أؤكّد pp. 33, أتعمّق pp. 34–35, تكنولوجيات p. 37, أستعدّ p. 23.
 * Source de vérité : docs/sources/2am/unit2/extraction.json ; plan : docs/sources/2am/unit2/plan/jam-tarh-kusur.md.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter–§4quinquies) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : « عدّاد المسلك » — le groupe de scouts marche sur le sentier de la forêt de cèdres, du portail à la source ; des poteaux BLANCS tous les 1/12 et, quand le sentier en a, des poteaux ROUGES
 *   tous les quarts. La main tient la DISTANCE marchée (en poteaux blancs) : la mesure d'une étape écrite en rouge se LIT en blancs pendant qu'on marche, l'élève écrit où est le groupe, et les fausses
 *   écritures (6/16, 6/12) sont plantées devant lui par un drapeau en pointillé. Au niveau متقدم il écrit sa PRÉDICTION (arrivée et reste) avant de marcher, puis un circuit (1 + 5/6).
 *   Rejetées : (a) l'activité 4 ① du manuel (un quadrillage déjà découpé en 24 carrés égaux : l'unité commune est DONNÉE, rien à découvrir) → application de أتمرّن ; (b) l'activité 4 ② (un voyage en train
 *   en dix-huitièmes et neuvièmes, lu sur un énoncé) : l'idée « étapes d'un même trajet, le reste » est gardée comme MONDE du labo, avec d'autres nombres et un trajet que la main marche ; (c) des verseuses
 *   (3AM `scoop-scale`) et la cuisine (4AM) : le geste de verser n'est pas celui d'une distance.
 *   Ordre des idées : mêmes poteaux (même dénominateur) → deux sortes de poteaux (un dénominateur multiple de l'autre) → ce qui reste jusqu'à la source (1 − …) → le retour (la différence) → un tour
 *   complet + une part (n + a/b) → معارف (rappel 1AM, les règles, les exemples) → طريقة (trois termes) → pratique, trois مسائل, test.
 *
 * HISTOIRE DES الكفاءات (positions gardées : les identifiants sont positionnels) — brouillon → texte final :
 *   P1  « جمع (أو طرح) كسرين لهما نفس المقام » → « … أيًّا كان المقام ولو كان البسطان عشريين » (la valeur ajoutée sur les fractions décimales de 1AM, lien `extends`) ;
 *   P2  « توحيد مقامي كسرين مقام أحدهما مضاعف للآخر » → le COMMENT explicite (multiplier les deux termes de l'autre fraction par le même nombre) + « اختزال الناتج » (1AM `ikhtizal` P3, rappelé et utilisé) ;
 *       l'exemple du manuel (5/12 + 1/4, coquille imprimée) est remplacé par 7/15 + 2/5 ;
 *   P3  « حساب الجزء الباقي من كلّ بطرح كسر من 1 » → + « (ou d'une somme de deux fractions) » et « un entier écrit en fraction pour l'additionner à une fraction ou l'en retrancher » (prep 8, ex-14, deep-47).
 * Le réseau : 2am.m1.r09 PROLONGE 1am.m5.r03 (`kusur-ashriya-kitaba`, publiée) ; il REQUIERT 2am.m1.r08 (comparaison), leçon SUIVANTE de l'unité : une seule phrase « تذكّر » sans lien (renvoi en
 * avant), jamais de comparaison construite ici. 2026-10-29 : `muqarana-kasrayn` publiée — P2 ← `2am_muqarana-kasrayn_P3` et le « تذكّر » de معارف porte son lien.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab/jam-tarh-kusur';

export const LESSON_CONFIG = {
  id: 'jam-tarh-kusur',
  kind: 'lesson',
  unit: 'kusur-amaliyat',
  unitTitle: 'الكسور والعمليات عليها',
  sequentialUnlock: true,
  title: 'جمع وطرح كسرين',
  description: 'نمشي بفوج كشفي على مسلك أعمدته بيضاء وحمراء فنجمع ونطرح كسرين لهما نفس المقام أو مقام أحدهما مضاعف لمقام الآخر، ونحسب ما بقي من الكلّ، ونكتب عددًا طبيعيًا كسرًا لنجمعه مع كسر.',
  level: 'moyen',
  grade: '2am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🥾',
  estimatedDurationMin: 66,
  textbookRef: { unit: 2, activity: 4, pages: '24, 28, 29' },
  skills: [
    'جمع (أو طرح) كسرين لهما نفس المقام، أيًّا كان المقام ولو كان البسطان عشريين: نجمع (أو نطرح) البسطين ونحافظ على المقام المشترك',
    'توحيد مقامي كسرين مقام أحدهما مضاعف لمقام الآخر بضرب حدّي الكسر الآخر في نفس العدد، ثمّ جمعهما أو طرحهما واختزال الناتج، مثل $\\frac{7}{15}+\\frac{2}{5}=\\frac{7}{15}+\\frac{6}{15}=\\frac{13}{15}$',
    'حساب الجزء الباقي من كلّ بطرح كسر (أو مجموع كسرين) من 1، وكتابة عدد طبيعي على شكل كسر لجمعه مع كسر أو طرحه منه، مثل $1-\\frac{7}{12}=\\frac{5}{12}$ و $2+\\frac{5}{6}=\\frac{17}{6}$',
  ],
  teachingScope: {
    include: ['جمع وطرح كسرين لهما نفس المقام (ولو كان البسطان عشريين)', 'مقام أحد الكسرين مضاعف لمقام الآخر، وعدة حدود مقام أكبرها مضاعف لكلّ الباقي', '1 − كسر، وعدد طبيعي ± كسر', 'اختزال الناتج'],
    exclude: ['كسران لا يقسم أيٌّ من مقاميهما الآخر (السنة الثالثة)', 'مقارنة كسرين غير المقام نفسه (درس مقارنة كسرين)', 'جداء كسرين و«كسر من الباقي» (درس جداء كسرين)', 'النتائج السالبة'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js).
  lessonProblem: {
    module: 5,
    title: 'مكتبة القسم',
    statement: 'في مكتبة القسم، التي تشجّع التلاميذ على القراءة: $\\frac{2}{5}$ من الكتب قصص و $\\frac{3}{10}$ كتب علمية، والباقي كتب تاريخ.',
    questions: [
      { label: '1)', text: 'ما الجزء من الكتب الذي تمثّله القصص والكتب العلمية معًا؟' },
      { label: '2)', text: 'ما الجزء الذي تمثّله كتب التاريخ؟' },
      { label: '3)', text: 'اكتب الكسرين $\\frac{7}{10}$ و $\\frac{3}{10}$ بالمقام $20$ .' },
    ],
    illustration: { kind: 'tags', cards: [{ title: 'القصص', icon: 'book', lines: [{ label: 'الجزء', value: '2/5', unit: 'الكتب' }] }, { title: 'الكتب العلمية', icon: 'book', lines: [{ label: 'الجزء', value: '3/10', unit: 'الكتب' }] }], ariaLabel: 'بطاقتان: القصص خمسان من الكتب والكتب العلمية ثلاثة أعشار' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : `1am.m5.r03` (la somme et la différence de fractions décimales — items 2 et 3), les écritures égales (item 4, 1AM `ikhtizal`), et `2am.m1.r08` (la comparaison, leçon SUIVANTE — items 5 et 6).
  priorKnowledge: ['kasr-mutasawi-1am', 'kusur-ashriya-jam-1am', 'mudaaf-1am', 'muqarana-nafs-maqam'],
  resources: [
    // Module 1 — WORKSPACE À DEUX NIVEAUX, un seul type `trail-odometer` (la main tient la DISTANCE marchée, en poteaux blancs) :
    //   مبتدئ — g1 5/12 puis 4/12 (même dénominateur) · g2 5/12 puis 1/4 (poteaux rouges) · g3 départ 3/4, retour de 5/12.
    //   متقدم — la prédiction (arrivée et reste) est ÉCRITE avant de marcher : 5/16 + 3/8 · 13/20 − 2/5 · 1/6 + 7/12 · un circuit, 1 + 5/6.
    {
      kind: 'manipulation', code: 'trail-odometer-walk', type: 'trail-odometer', module: 1,
      level: 'beginner',
      title: 'عدّاد المسلك: أمشي بالفوج ثم أكتب أين وصل',
      objective: 'نجمع أجزاءً من الحجم نفسه: نحوّل الأجزاء الكبيرة إلى صغيرة بضرب الحدّين في العدد نفسه، ونجمع أو نطرح البسطين مع الاحتفاظ بالمقام، ونحسب الباقي من الكلّ',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'mountaintrail' },
      learningPointIds: ['2am_jam-tarh-kusur_P1', '2am_jam-tarh-kusur_P2', '2am_jam-tarh-kusur_P3'],
      sourceElementIds: ['act-4'],
    },
    {
      kind: 'manipulation', code: 'trail-odometer-predict', type: 'trail-odometer', module: 1,
      level: 'advanced',
      title: 'عدّاد المسلك: أتوقّع ثم أتأكّد',
      objective: 'نجمع أجزاءً من الحجم نفسه: نحوّل الأجزاء الكبيرة إلى صغيرة بضرب الحدّين في العدد نفسه، ونجمع أو نطرح البسطين مع الاحتفاظ بالمقام، ونحسب الباقي من الكلّ',
      autonomy: 'يكتب التلميذ الكسر الذي سيصل إليه الفوج وما بقي إلى العين قبل أن يتحرّك الفوج، ثم يمشي ليتأكّد، ويجرّب دورة كاملة وجزءًا من دورة ثانية',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'mountaintrail' },
      learningPointIds: ['2am_jam-tarh-kusur_P2', '2am_jam-tarh-kusur_P3'],
      sourceElementIds: ['method-3'],
    },
    {
      kind: 'manipulation', code: 'trail-odometer-maarif', type: 'trail-odometer', module: 2,
      title: 'عدّاد المسلك: ثلاثة أثمان وربع',
      objective: 'نجمع أجزاءً من الحجم نفسه: نحوّل الأجزاء الكبيرة إلى صغيرة بضرب الحدّين في العدد نفسه، ونجمع أو نطرح البسطين مع الاحتفاظ بالمقام، ونحسب الباقي من الكلّ',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'mountaintrail' },
      learningPointIds: ['2am_jam-tarh-kusur_P1', '2am_jam-tarh-kusur_P2'],
      sourceElementIds: ['know-2a', 'know-2b'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — مكتبة القسم', learningPointIds: ['2am_jam-tarh-kusur_P2', '2am_jam-tarh-kusur_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — جني الزيتون', learningPointIds: ['2am_jam-tarh-kusur_P2', '2am_jam-tarh-kusur_P3'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — خزّان المدرسة', learningPointIds: ['2am_jam-tarh-kusur_P2', '2am_jam-tarh-kusur_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ جمع الكسور العشرية، والكتابات المتساوية، وكسران لهما نفس المقام.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — عدّاد المسلك', desc: 'امشِ بالفوج على المسلك: أعمدة بيضاء وأعمدة حمراء. أين وصل؟ وكم بقي إلى العين؟',
      stage: 'trigger', teachesLearningPointIds: ['2am_jam-tarh-kusur_P1', '2am_jam-tarh-kusur_P2', '2am_jam-tarh-kusur_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 20, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — جمع الكسور وطرحها', desc: 'قاعدة المقام نفسه، وقاعدة المقام المضاعف، والباقي من الكلّ.',
      stage: 'discovery', teachesLearningPointIds: ['2am_jam-tarh-kusur_P1', '2am_jam-tarh-kusur_P2', '2am_jam-tarh-kusur_P3'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أوحّد ثم أجمع ثم أختزل', desc: 'من كسرين إلى ثلاثة كسور: أختار المقام الأكبر وأحوّل الباقي إليه.',
      stage: 'formalization', teachesLearningPointIds: ['2am_jam-tarh-kusur_P2', '2am_jam-tarh-kusur_P3'],
      color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'ستة تمارين: الجمع والطرح، والباقي، وعدد طبيعي مع كسر.',
      stage: 'practice_lab', teachesLearningPointIds: ['2am_jam-tarh-kusur_P1', '2am_jam-tarh-kusur_P2', '2am_jam-tarh-kusur_P3'],
      color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — مكتبة القسم', desc: 'مسألة الدرس: قصص وكتب علمية، والباقي كتب تاريخ.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_jam-tarh-kusur_P2', '2am_jam-tarh-kusur_P3'],
      color: 'amber', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — جني الزيتون', desc: 'جزء من اليوم الأوّل وجزء من اليوم الثاني: كم جُني وكم بقي؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_jam-tarh-kusur_P2', '2am_jam-tarh-kusur_P3'],
      color: 'amber', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — خزّان المدرسة', desc: 'ماء استُهلك وماء أُضيف: كم بقي في الخزّان؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_jam-tarh-kusur_P2', '2am_jam-tarh-kusur_P3'],
      color: 'amber', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
