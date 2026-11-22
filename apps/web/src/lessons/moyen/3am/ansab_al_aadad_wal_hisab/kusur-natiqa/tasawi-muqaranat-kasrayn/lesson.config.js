/**
 * الدرس — تساوي كسرين ومقارنتهما (3AM, unité 2 « العمليات على الكسور والأعداد الناطقة », leçon 2 sur 5 + synthèse) — générée DANS son entrée du catalogue (item 3am.m1.r05),
 * cycle moyen phase 3, « priorité propriétaire » (2026-10-26), à partir de son PLAN (docs/sources/3am/unit2/plan/tasawi-muqaranat-kasrayn.md). Manuel 3AM (الجيل الثاني,
 * منشورات الشهاب), RÉFÉRENCE des الكفاءات : أنشطة 2 et 3 p. 24, معارف 3 p. 26, طرائق et « دورك الآن » p. 27, تمارين 8, 9, 10, 12–17 p. 30, أتعمّق 55 p. 34, أستعدّ 3–5 p. 23.
 * Source : docs/sources/3am/unit2/extraction.json. Rien n'est montré tel quel : tout est réécrit (§4ter-bis).
 * Le réseau : `3am.m1.r05` EXTENDS `2am.m1.r08` (comparer deux fractions de même dénominateur ou dont un dénominateur est multiple de l'autre ; leçon 2AM `muqarana-kasrayn` NON
 * publiée) : « أستعدّ » mesure cette base avec des affirmations de la plateforme, معارف ouvre sur un « تذكّر — السنة الثانية » sans lien, et la leçon ne construit que la valeur ajoutée
 * « comparer deux fractions QUELCONQUES en unifiant les dénominateurs » ; `pointPrerequisites` : arêtes internes seulement (P3 ← P1, P3 ← P2).
 * 2026-10-29 : `muqarana-kasrayn` (2AM) publiée — P2 ← `2am_muqarana-kasrayn_P3`, P3 ← aussi `_P2`, `_P4` (le long de `2am.m1.r08 → r05`),
 * et le « تذكّر — السنة الثانية » de معارف porte désormais son lien (`getLessonPath`).
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : « آلة مزج الألوان » (labo `shade-match`, thème `paintshop`). La MAIN verse des mesures de bleu dans un seau de blanc jusqu'à ce que la couleur du seau
 *   B soit celle du seau de référence A (3 bleu pour 4 blanc) : l'égalité est NÉCESSAIRE (la peinture doit raccorder le mur). Avec 8 blancs il faut 6 bleus, car 6 × 4 = 24 = 3 × 8 ;
 *   « 4 blancs de plus, donc 4 bleus de plus » (7 bleus) est réfuté par l'aiguille (plus foncé). Avec 10 blancs AUCUN entier ne convient (7 est plus clair, 8 plus foncé) :
 *   l'impossible FORCE la comparaison — les produits en croix donnent aussi l'ordre. L'œil ne sépare pas 3/4 de 7/10 (deux teintes presque égales) ; l'aiguille, calculée exactement, tranche.
 *   Même verdict en écrivant les deux fractions sur le même dénominateur (3/4 = 15/20 et 7/10 = 14/20) : tout multiple commun des deux dénominateurs convient, le produit toujours.
 *   Rejetées : (a) le نشاط 2 du manuel (vérifier ad = bc puis le prouver dans les deux sens) — une PREUVE demandée avant tout besoin, une vérification pas une découverte : son raisonnement
 *   (le dénominateur commun b × d) devient la justification de معارف, avec d'autres nombres (6/8 et 9/12 sur 96) ; (b) le نشاط 3 (quatre paires à comparer « par la méthode qui convient ») —
 *   il suppose les méthodes avant qu'elles existent : il devient l'APPLICATION d'أتمرّن ; (c) des rangées de recettes alignées sur le même nombre de blancs — bonne image du dénominateur
 *   commun, mais un geste d'étirement proche de `unit-ladder` (unité 3), moins direct pour les produits en croix.
 *   Ordre des idées : une teinte qui raccorde, c × b = a × d (P1) → aucun entier : plus clair / plus foncé, les produits en croix COMPARENT → le même verdict au même dénominateur, un multiple
 *   commun (P2) → معارف : « تذكّر » (2AM), la propriété dans les deux sens (preuve par b × d), la règle du dénominateur commun → طريقة : choisir la méthode (P3) → أتمرّن → trois مسائل → إختبار أولي.
 *   Ni signes ni droite graduée (`adad-natiq`), ni somme (`jam-tarh-kasrayn` : « ont-ils fini le couloir ? » demande une somme et n'est PAS posée ici), ni signe d'une différence (3AM unité 4).
 *
 * HISTOIRE DES الكفاءات (le plan, §2 ; décisions notées pour le propriétaire) :
 *   P1 « التعرّف على تساوي كسرين بالجداءين المتصالبين … » + « ، وإيجاد حدّ مجهول في تساوي كسرين » : ajoute le terme manquant (x/16 = 5/8), emploi du manuel lui-même (ex-16) et outil de Thalès en 4AM.
 *   P2 « مقارنة كسرين مقاماهما مختلفان (ليس أحدهما مضاعفًا للآخر) بكتابتهما بنفس المقام … » : SENS CHANGÉ — « même dénominateur / même numérateur » est la P1–P2 de 2AM `muqarana-kasrayn` (lien `extends`,
 *   règle de non-duplication) : ces cas sont RAPPELÉS (« تذكّر » + « أستعدّ »), la leçon bâtit « deux fractions quelconques sur un dénominateur commun ».
 *   P3 « اختيار طريقة مناسبة لمقارنة كسرين … » : SENS PRÉCISÉ — le brouillon répétait P2 + P1 ; le manuel dit « يمكن استعمال عدة طرق » : CHOISIR la méthode est ce qui reste à apprendre.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab/tasawi-muqaranat-kasrayn';

export const LESSON_CONFIG = {
  id: 'tasawi-muqaranat-kasrayn',
  kind: 'lesson',
  unit: 'kusur-natiqa',
  unitTitle: 'العمليات على الكسور والأعداد الناطقة',
  sequentialUnlock: true,
  title: 'تساوي كسرين ومقارنتهما',
  description: 'آلة تمزج الألوان: متى يطابق لون دلو لونَ المرجع؟ فنكتشف الجداءين المتصالبين لتساوي كسرين ولمقارنتهما، ونقارن بتوحيد المقامين، ونختار الطريقة المناسبة.',
  level: 'moyen',
  grade: '3am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🎨',
  estimatedDurationMin: 87,
  textbookRef: { unit: 2, activity: 2, pages: '23, 24, 26, 27, 30, 34' },
  skills: [
    'التعرّف على تساوي كسرين بالجداءين المتصالبين: $\\frac{a}{b}=\\frac{c}{d}$ يكافئ $a\\times d=b\\times c$ ، وإيجاد حدّ مجهول في تساوي كسرين',
    'مقارنة كسرين مقاماهما مختلفان (ليس أحدهما مضاعفًا للآخر) بكتابتهما بنفس المقام، باستعمال مضاعف مشترك للمقامين',
    'اختيار طريقة مناسبة لمقارنة كسرين: الجداءان المتصالبان، أو المقارنة بالعدد $1$ أو بكسر وسيط، أو نفس البسط',
  ],
  teachingScope: {
    include: ['تساوي كسرين بالجداءين المتصالبين في الاتجاهين، وحدّ مجهول في تساوي كسرين', 'مقارنة كسرين موجبين مقاماهما أيّ عددين بتوحيد المقامين أو بالجداءين المتصالبين', 'المقارنة بالعدد $1$ أو بكسر وسيط أو بنفس البسط، وترتيب ثلاثة كسور إلى ستة'],
    exclude: ['مقارنة كسرين لهما نفس المقام أو نفس البسط أو مقام أحدهما مضاعف للآخر (السنة الثانية، تُستذكر)', 'الكسور بإشارات والمستقيم المدرّج (درس العدد الناطق)', 'جمع الكسور وطرحها وإشارة الفرق (دروس لاحقة)'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js).
  lessonProblem: {
    module: 5,
    title: 'مسابقة الرمي',
    statement: 'في يوم الرياضة أصاب أمين $7$ رميات من $9$ ، وأصابت ياسمين $10$ من $13$ ، وأصاب رياض $11$ من $14$ .',
    questions: [
      { label: '1)', text: 'من الأدقّ رميًا؟' },
      { label: '2)', text: 'رتّب الثلاثة من الأقلّ دقّة إلى الأكثر دقّة.' },
    ],
    illustration: { kind: 'tags', cards: [{ title: 'أمين', lines: [{ label: 'أصاب', value: '7/9' }] }, { title: 'ياسمين', lines: [{ label: 'أصابت', value: '10/13' }] }, { title: 'رياض', lines: [{ label: 'أصاب', value: '11/14' }] }], ariaLabel: 'ثلاث بطاقات: أمين أصاب 7 من 9، ياسمين أصابت 10 من 13، رياض أصاب 11 من 14' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : les liens « راجع » du réseau (2am.m1.r08) et l'égalité 1AM de fractions (×k).
  priorKnowledge: ['muqarana-kasrayn-2am', 'kasr-mutasawi-1am'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `shade-match` (la main verse le bleu), thème `paintshop`.
    {
      kind: 'manipulation', code: 'shade-match-simple', type: 'shade-match', module: 1,
      level: 'beginner',
      title: 'آلة مزج الألوان: طابِق لون المرجع',
      objective: 'يطابق لونُ دلو لونَ المرجع $\\frac{a}{b}$ حين يكون عدد الأزرق $c$ مع $d$ من الأبيض جداءاه المتصالبان متساويين: $c\\times b=a\\times d$ ؛ وحين يختلفان فالجداء الأصغر هو الأفتح، فتُقارَن الكسور بالجداءين المتصالبين',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'paintshop' },
      learningPointIds: ['3am_tasawi-muqaranat-kasrayn_P1', '3am_tasawi-muqaranat-kasrayn_P2'],
      sourceElementIds: ['act-2'],
    },
    {
      kind: 'manipulation', code: 'shade-match-veil', type: 'shade-match', module: 1,
      level: 'advanced',
      title: 'آلة مزج الألوان: مقياس مغطّى وتوقّع',
      objective: 'يطابق لونُ دلو لونَ المرجع $\\frac{a}{b}$ حين يكون عدد الأزرق $c$ مع $d$ من الأبيض جداءاه المتصالبان متساويين: $c\\times b=a\\times d$ ؛ وحين يختلفان فالجداء الأصغر هو الأفتح، فتُقارَن الكسور بالجداءين المتصالبين',
      autonomy: 'المقياس مغطّى حتى يُثبَّت العدد، ولا يوجد أحيانًا عدد صحيح فيُكتب أقرب عددين، ثم يُقارَن دلوان جاهزان بالتوقّع',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'paintshop' },
      learningPointIds: ['3am_tasawi-muqaranat-kasrayn_P1', '3am_tasawi-muqaranat-kasrayn_P2', '3am_tasawi-muqaranat-kasrayn_P3'],
      sourceElementIds: ['act-3'],
    },
    // Module 2 — le MÊME type, monde `equal`, posé seul (`levels={false}`) : déclaré SANS niveau.
    {
      kind: 'manipulation', code: 'shade-match-equal', type: 'shade-match', module: 2,
      title: 'أيّ الدلاء يطابق؟',
      learningPointIds: ['3am_tasawi-muqaranat-kasrayn_P1'],
      sourceElementIds: ['know-3'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — مسابقة الرمي', learningPointIds: ['3am_tasawi-muqaranat-kasrayn_P2', '3am_tasawi-muqaranat-kasrayn_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — لون الجدارية', learningPointIds: ['3am_tasawi-muqaranat-kasrayn_P1', '3am_tasawi-muqaranat-kasrayn_P2'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — تبليط الممرّ', learningPointIds: ['3am_tasawi-muqaranat-kasrayn_P2', '3am_tasawi-muqaranat-kasrayn_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'سبع عبارات: صحيح أم خاطئ؟ مقارنة كسرين بنفس المقام أو بنفس البسط أو مقام أحدهما مضاعف للآخر.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — آلة مزج الألوان', desc: 'متى يطابق لون دلو لون المرجع؟ ماذا لو لم ينجح أيّ عدد صحيح؟ وهل نكتب الكسرين بنفس المقام؟',
      stage: 'trigger', teachesLearningPointIds: ['3am_tasawi-muqaranat-kasrayn_P1', '3am_tasawi-muqaranat-kasrayn_P2', '3am_tasawi-muqaranat-kasrayn_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — الجداءان المتصالبان', desc: 'نسمّي ما فعلناه: تساوي كسرين في الاتجاهين، ولماذا يصحّ، وقاعدة توحيد المقامين.',
      stage: 'discovery', teachesLearningPointIds: ['3am_tasawi-muqaranat-kasrayn_P1', '3am_tasawi-muqaranat-kasrayn_P2'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — اختيار الطريقة', desc: 'خمس طرائق لمقارنة كسرين، ولكلّ زوج طريقته: متى أختار ماذا؟',
      stage: 'formalization', teachesLearningPointIds: ['3am_tasawi-muqaranat-kasrayn_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'مقارنة بالطريقة المناسبة، هل الكسران متساويان؟، جمع الكسور المتساوية، ترتيب كسور، حدّ مجهول، وحاسبة تخدع.',
      stage: 'practice_lab', teachesLearningPointIds: ['3am_tasawi-muqaranat-kasrayn_P1', '3am_tasawi-muqaranat-kasrayn_P2', '3am_tasawi-muqaranat-kasrayn_P3'],
      color: 'amber', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — مسابقة الرمي', desc: 'مسألة الدرس: من الأدقّ رميًا، ثم ترتيب ثلاثة تلاميذ.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_tasawi-muqaranat-kasrayn_P2', '3am_tasawi-muqaranat-kasrayn_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — لون الجدارية', desc: 'هل اللونان متماثلان؟ ومن الأغمق؟ وكم طلقة تلزم لتطابقه؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_tasawi-muqaranat-kasrayn_P1', '3am_tasawi-muqaranat-kasrayn_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — تبليط الممرّ', desc: 'ثلاثة كسور بمقام مشترك: أيّ يوم بلّطوا فيه أكبر جزء؟ وترتيب الأيام.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_tasawi-muqaranat-kasrayn_P2', '3am_tasawi-muqaranat-kasrayn_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
