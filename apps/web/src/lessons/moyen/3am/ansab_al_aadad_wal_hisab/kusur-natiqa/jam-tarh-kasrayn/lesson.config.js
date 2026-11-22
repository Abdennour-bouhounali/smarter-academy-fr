/**
 * الدرس — جمع وطرح كسرين (3AM, unité 2 « العمليات على الكسور والأعداد الناطقة », leçon 3 sur 5 + synthèse) — générée DANS son entrée du catalogue (item 3am.m1.r06),
 * cycle moyen phase 3, « priorité propriétaire » (2026-10-26), à partir de son PLAN (docs/sources/3am/unit2/plan/jam-tarh-kasrayn.md). Manuel 3AM (الجيل الثاني,
 * منشورات الشهاب), RÉFÉRENCE des الكفاءات : نشاط 4 p. 24, معارف 4 p. 26, طرائق 5–6 et « دورك الآن » 2 p. 27, تمارين 11, 18–21 p. 30–31, أؤكّد تعلّماتي 2–3 p. 33, أتعمّق 62, 65, 74, 80 p. 34–35,
 * أستعدّ 6–7 p. 23. Source : docs/sources/3am/unit2/extraction.json. Rien n'est montré tel quel : tout est réécrit (§4ter-bis).
 * Le réseau : `3am.m1.r06` EXTENDS `2am.m1.r09` (additionner ou soustraire deux fractions de même dénominateur ou dont un dénominateur est multiple de l'autre ; leçon 2AM
 * `jam-tarh-kusur` NON publiée) : « أستعدّ » mesure cette base avec des affirmations de la plateforme, معارف ouvre sur un « تذكّر — السنة الثانية » sans lien, et la leçon ne construit
 * que la valeur ajoutée « deux fractions QUELCONQUES sur un dénominateur commun ». La leçon recalle aussi `tasawi-muqaranat-kasrayn` (publiée : le même dénominateur commun, avec un lien).
 * `pointPrerequisites` : arêtes internes seulement (P2 ← P1, P3 ← P1) ; AUCUNE arête vers `tasawi` : le réseau n'a pas de lien 3am.m1.r05 → 3am.m1.r06 (plan README, question 1).
 * 2026-10-29 : la leçon 2AM `jam-tarh-kusur` (2am.m1.r09) est publiée — le catalogue porte P1 ← `2am_jam-tarh-kusur_P2` et P2 ← `2am_jam-tarh-kusur_P1`, `_P3`
 * (le long du lien `2am.m1.r09 → 3am.m1.r06`), et le « تذكّر — السنة الثانية » de معارف porte son lien.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : « مشط الشتلات » (labo `seed-rake`, thème `seedbed`). Un حوض de 1 m : 1/4 pour les tomates, 1/6 pour les piments, côte à côte. « 1/4 + 1/6 = 2/10 » est impossible (2/10 m est
 *   plus court que les tomates seules) : on ne compte que des morceaux de MÊME taille. La MAIN étire un râteau, l'espacement 1/N m ; chaque culture doit contenir un nombre ENTIER de plants.
 *   Avec N = 10 un plant tombe sur la frontière (2,5 cases) ; avec N = 12 les zones tiennent 3 et 2 plants (5 × 1/12 m) ; N = 24 convient aussi (10 plants, la MÊME longueur 5/12) car 12 et 24 sont des
 *   multiples communs de 4 et 6. Le jardinier veut le PLUS LARGE espacement (de la place pour les plants) : le plus petit multiple commun, trouvé vite en montant les multiples du plus grand dénominateur.
 *   La soustraction suit le même chemin (3/4 planté, 1/6 récolté : 9 − 2 = 7 plants de 1/12 m).
 *   Rejetées : (a) le نشاط 4 du manuel (des disques déjà découpés) — la pièce commune est DONNÉE, l'élève ne la choisit jamais et la règle est demandée de mémoire : il devient l'APPLICATION
 *   d'أتمرّن (nombres de la plateforme) ; (b) une horloge (1/4 h + 1/6 h = 15 + 10 min) — l'unité commune 60 est imposée, le « plus petit » n'apparaît jamais : gardée pour la مسألة 3 ;
 *   (c) mesurer avec une cuillère unique — honnête, mais le geste de `scoop-scale` (unité 5) et le monde de la cuisine de `fraction-reduction` y reviennent.
 *   Ordre des idées : un espacement commun, les deux zones entières, la somme lue en plants (P1) → d'autres espacements donnent la même longueur (P1, P2) → le plus large = le plus petit multiple commun (P3)
 *   → la soustraction → معارف : « تذكّر » (2AM, puis `tasawi`), la règle, deux exemples → طريقة : les multiples du plus grand dénominateur, une somme avec un naturel et trois termes → أتمرّن → trois مسائل → إختبار أولي.
 *   Ni signes ni résultat négatif (`amaliyat-natiqa`), ni « fraction du reste » qui demande un produit (la synthèse), ni pourcentage (3AM unité 6 : `deep-74` est redessinée sans « نسبة مئوية »).
 *
 * HISTOIRE DES الكفاءات (le plan, §2 ; décisions notées pour le propriétaire) :
 *   P1 « جمع وطرح كسرين لهما نفس المقام » : SENS CHANGÉ — « même dénominateur » est la P1 de 2AM `jam-tarh-kusur` (lien `extends`, règle de non-duplication) : ce cas est RAPPELÉ (« تذكّر » + « أستعدّ »).
 *   P1 devient « إدراك أنّنا لا نجمع إلا أجزاءً من النوع نفسه : كتابة كسرين مقاماهما كيفيان بمقام مشترك هو مضاعف مشترك للمقامين » : POURQUOI un dénominateur commun et COMMENT réécrire les deux fractions.
 *   P2 « … ومنها عدد طبيعي يُكتب كسرًا، ثم اختزال الناتج » : ajoute le naturel (3 + 1/4 − 3/8) et la réduction du résultat. P3 « اختيار أصغر مضاعف مشترك … » : « adapté » devient PRÉCIS (la méthode du livre).
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab/jam-tarh-kasrayn';

export const LESSON_CONFIG = {
  id: 'jam-tarh-kasrayn',
  kind: 'lesson',
  unit: 'kusur-natiqa',
  unitTitle: 'العمليات على الكسور والأعداد الناطقة',
  sequentialUnlock: true,
  title: 'جمع وطرح كسرين',
  description: 'مشط الشتلات: لماذا نوحّد المقامين قبل أن نجمع كسرين أو نطرحهما؟ فنختار مسافة تملأ كلّ جزء بشتلات كاملة، ونكتشف المضاعف المشترك وأصغر مضاعف مشترك، ثم نحسب مجموعًا أو فرقًا ونختزل.',
  level: 'moyen',
  grade: '3am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🌱',
  estimatedDurationMin: 87,
  textbookRef: { unit: 2, activity: 4, pages: '23, 24, 26, 27, 30, 31, 33, 34, 35' },
  skills: [
    'إدراك أنّنا لا نجمع (أو نطرح) إلا أجزاءً من النوع نفسه: كتابة كسرين مقاماهما كيفيان بمقام مشترك هو مضاعف مشترك للمقامين',
    'جمع وطرح كسرين (أو أكثر) مقاماهما مختلفان بتوحيد المقامات، ومنها عدد طبيعي يُكتب كسرًا، ثم اختزال الناتج',
    'اختيار أصغر مضاعف مشترك للمقامين (أوّل مضاعف للمقام الأكبر يقبل القسمة على المقام الآخر) لتبسيط الحساب',
  ],
  teachingScope: {
    include: ['جمع كسرين أو طرحهما (موجبين) مقاماهما كيفيان بتوحيد المقامين، وأكثر من كسرين وعدد طبيعي', 'أصغر مضاعف مشترك للمقامين بكتابة مضاعفات المقام الأكبر، واختزال الناتج', 'الجزء الباقي «١ − مجموع الأجزاء» وحدّ مجهول يُوجد بالطرح'],
    exclude: ['جمع كسرين لهما نفس المقام أو مقام أحدهما مضاعف لمقام الآخر (السنة الثانية، تُستذكر)', 'الفروق السالبة والكسور بإشارات (درس العمليات على الأعداد الناطقة)', 'كسر الباقي الذي يحتاج جداءً (وضعية الإدماج) والنسبة المئوية (وحدة لاحقة)'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js).
  lessonProblem: {
    module: 5,
    title: 'تنظيف الساحة',
    statement: 'نظّف الفوج الأول $\\frac14$ من ساحة المدرسة، ونظّف الفوج الثاني $\\frac25$ منها.',
    questions: [
      { label: '1)', text: 'ما الجزء المنظّف؟' },
      { label: '2)', text: 'ما الجزء الباقي؟' },
      { label: '3)', text: 'يستطيع الفوج الثالث تنظيف $\\frac13$ من الساحة: هل يكفي لإنهائها؟' },
    ],
    illustration: { kind: 'tags', cards: [{ title: 'الفوج الأول', lines: [{ label: 'نظّف', value: '1/4' }] }, { title: 'الفوج الثاني', lines: [{ label: 'نظّف', value: '2/5' }] }, { title: 'الفوج الثالث', lines: [{ label: 'يستطيع', value: '1/3' }] }], ariaLabel: 'ثلاث بطاقات: الفوج الأول نظّف 1 على 4 من الساحة، الفوج الثاني 2 على 5، والفوج الثالث يستطيع 1 على 3' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : le lien « راجع » du réseau (2am.m1.r09), le dénominateur commun de `tasawi` (publiée) et les multiples (1AM).
  priorKnowledge: ['jam-tarh-kusur-2am', 'tawhid-maqamat-3am', 'mudaaf-1am'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `seed-rake` (la main étire le râteau), thème `seedbed`.
    {
      kind: 'manipulation', code: 'seed-rake-simple', type: 'seed-rake', module: 1,
      level: 'beginner',
      title: 'مشط الشتلات: املأ كلّ جزء بشتلات كاملة',
      objective: 'لا نجمع كسرين إلا بعد كتابتهما بمقام مشترك: تمتلئ الأجزاء بشتلات كاملة حين تكون المسافة $\\frac{1}{N}$ و $N$ مضاعف مشترك للمقامين، والطول المزروع هو نفسه لكلّ مسافة تنجح؛ وأوسع مسافة تنجح هي أصغر مضاعف مشترك',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'seedbed' },
      learningPointIds: ['3am_jam-tarh-kasrayn_P1', '3am_jam-tarh-kasrayn_P2', '3am_jam-tarh-kasrayn_P3'],
      sourceElementIds: ['act-4'],
    },
    {
      kind: 'manipulation', code: 'seed-rake-veil', type: 'seed-rake', module: 1,
      level: 'advanced',
      title: 'مشط الشتلات: المشط مقفل وتوقّع',
      objective: 'لا نجمع كسرين إلا بعد كتابتهما بمقام مشترك: تمتلئ الأجزاء بشتلات كاملة حين تكون المسافة $\\frac{1}{N}$ و $N$ مضاعف مشترك للمقامين، والطول المزروع هو نفسه لكلّ مسافة تنجح؛ وأوسع مسافة تنجح هي أصغر مضاعف مشترك',
      autonomy: 'المشط مقفل: يكتب التلميذ المسافة وطول الجزء المزروع قبل أن يزرع، فيحكم الحوض على ما كتب بالشتلات',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'seedbed' },
      learningPointIds: ['3am_jam-tarh-kasrayn_P1', '3am_jam-tarh-kasrayn_P2', '3am_jam-tarh-kasrayn_P3'],
      sourceElementIds: ['method-6'],
    },
    // Module 2 — le MÊME type, monde `fewest`, posé seul (`levels={false}`) : déclaré SANS niveau.
    {
      kind: 'manipulation', code: 'seed-rake-fewest', type: 'seed-rake', module: 2,
      title: 'أوسع مسافة تملأ الجزأين',
      learningPointIds: ['3am_jam-tarh-kasrayn_P3'],
      sourceElementIds: ['know-4'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — تنظيف الساحة', learningPointIds: ['3am_jam-tarh-kasrayn_P1', '3am_jam-tarh-kasrayn_P2'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — درّاجة زكرياء', learningPointIds: ['3am_jam-tarh-kasrayn_P2'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — وقت المراجعة', learningPointIds: ['3am_jam-tarh-kasrayn_P2', '3am_jam-tarh-kasrayn_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'سبع عبارات: صحيح أم خاطئ؟ جمع كسرين وطرحهما في الحالات البسيطة وتوحيد المقامين.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — مشط الشتلات', desc: 'لماذا لا نجمع ربعًا وسدسًا كما هما؟ ما المسافة التي تملأ الجزأين بشتلات كاملة؟ وأيّها أوسع؟',
      stage: 'trigger', teachesLearningPointIds: ['3am_jam-tarh-kasrayn_P1', '3am_jam-tarh-kasrayn_P2', '3am_jam-tarh-kasrayn_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — قاعدة الجمع والطرح', desc: 'نسمّي ما فعلناه: المقام المشترك، وقاعدة جمع كسرين وطرحهما ومثالان.',
      stage: 'discovery', teachesLearningPointIds: ['3am_jam-tarh-kasrayn_P1', '3am_jam-tarh-kasrayn_P2'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أصغر مضاعف مشترك', desc: 'مضاعفات المقام الأكبر، ثمّ مجموع فيه عدد طبيعي وثلاثة حدود.',
      stage: 'formalization', teachesLearningPointIds: ['3am_jam-tarh-kasrayn_P2', '3am_jam-tarh-kasrayn_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'مجموع وفرق كسرين، حدود متعدّدة وعدد طبيعي، أصغر مضاعف مشترك، حساب ذهني، اختزال، وحدّ مجهول.',
      stage: 'practice_lab', teachesLearningPointIds: ['3am_jam-tarh-kasrayn_P1', '3am_jam-tarh-kasrayn_P2', '3am_jam-tarh-kasrayn_P3'],
      color: 'amber', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — تنظيف الساحة', desc: 'مسألة الدرس: الجزء المنظّف، والجزء الباقي، وهل يكفي الفوج الثالث؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_jam-tarh-kasrayn_P1', '3am_jam-tarh-kasrayn_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — درّاجة زكرياء', desc: 'ما دفعه الجدّ والأب، وما دفعته العائلة كلّها، وما بقي على زكرياء.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_jam-tarh-kasrayn_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — وقت المراجعة', desc: 'مجموع ساعتين من الوقت، وتحويل الساعات إلى دقائق، وما يزيد بين المدّتين.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_jam-tarh-kasrayn_P2', '3am_jam-tarh-kasrayn_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
