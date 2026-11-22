/**
 * الدرس — العمليات على الأعداد الناطقة (3AM, unité 2 « العمليات على الكسور والأعداد الناطقة », leçon 5 sur 5 + synthèse) — générée DANS son entrée du catalogue (item 3am.m1.r08),
 * cycle moyen phase 3, « priorité propriétaire » (2026-10-26), à partir de son PLAN (docs/sources/3am/unit2/plan/amaliyat-natiqa.md). Manuel 3AM (الجيل الثاني, منشورات الشهاب), RÉFÉRENCE
 * des الكفاءات : نشاط 6 p. 25, معارف 6 p. 28, طرائق 7–9 et دورك الآن 3 p. 29, تمارين 34–54 p. 31–32, أؤكّد تعلّماتي 5–6 p. 33, أتعمّق 57–79 p. 34–35, أستعدّ 9–11 p. 23.
 * Source : docs/sources/3am/unit2/extraction.json. Rien n'est montré tel quel : tout est réécrit (§4ter-bis). Les deux erreurs d'impression du manuel (`method-9` 23/33 pour 15/11 ; 59/7 pour 57/7
 * dans la « solution brève » de l'intégration) ne sont jamais montrées.
 * Le réseau : `3am.m1.r08` suit `3am.m1.r01` (le produit de deux relatifs ; leçon `jidaa-adadayn-nisbiyayn` PUBLIÉE), `3am.m1.r04` (`maqlub-qismat-kasrayn`), `3am.m1.r06` (`jam-tarh-kasrayn`) et `3am.m1.r07`
 * (`adad-natiq`), toutes PUBLIÉES : « أستعدّ » les mesure avec des affirmations de la plateforme, معارف ouvre sur quatre « تذكّر » avec lien ; `priorKnowledge` ajoute les sommes de relatifs de 2AM
 * (`jam-tarh-nisbiya`, leçon non publiée : sans lien). `pointPrerequisites` : P1 ← `3am_jam-tarh-kasrayn_P2` et `3am_adad-natiq_P2`, P2 ← `3am_jidaa-adadayn-nisbiyayn_P4` (« le signe d'abord, puis le produit
 * des distances »), P3 ← `3am_maqlub-qismat-kasrayn_P3`, puis P4 ← P1, P2, P3 dans la leçon.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : « لوحة الدمج » (labo `merge-board`, thème `arcade`). Les nombres d'une chaîne sont des TUILES ; deux voisines se FUSIONNENT. La MAIN PRÉDIT le signe du résultat avant chaque fusion (une
 *   prédiction fausse est refusée, les barres signées montrent pourquoi), RETOURNE le diviseur d'une division (son signe gardé) et choisit l'ORDRE des fusions (des aimants tiennent × et ÷ : la priorité devient tangible).
 *   Rejetées : (a) le نشاط 6 du manuel (listes de produits, de sommes et de quotients à imiter) — il ne demande jamais de décider le signe avant de calculer ; il devient les applications d'أتمرّن ;
 *   (b) un monde de mouvement signé (un ascenseur, un plongeur) — il donne un sens aux sommes mais rend produits et quotients artificiels, et il rejoint `elevator-reel` (unité 1). Ordre des idées : une somme
 *   (le signe par les barres, puis le dénominateur commun, P1) → un produit (la couleur change à chaque facteur rouge, P2) → un quotient (retourner le diviseur, le signe gardé, P3) → une chaîne
 *   (aimants et bulles, P4) → معارف (les quatre règles, le مقلوب d'un négatif) → طريقة (numérateurs décimaux, plus petit multiple commun, une chaîne) → أتمرّن → trois مسائل → إختبار أولي.
 *   Ni la logique de la substitution (`qimat-ibara-harfiya`), ni la comparaison par le signe d'une différence (`muqaranat-natiqayn`), ni la résolution d'équations par les règles de transformation (unité 5).
 *
 * HISTOIRE DES الكفاءات (le plan, §2 ; décisions notées pour le propriétaire) :
 *   P1 ajoute le SIGNE du résultat (le nouveau par rapport à `jam-tarh-kasrayn`) et les numérateurs décimaux ; P2 pose « le signe d'abord » ; P3 ajoute le مقلوب d'un NÉGATIF (le manuel le met ici :
 *   `maqlub-qismat-kasrayn` s'est limitée aux nombres positifs) ; P4 ajoute les parenthèses et les fractions composées. L'ordre est gardé.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab/amaliyat-natiqa';

export const LESSON_CONFIG = {
  id: 'amaliyat-natiqa',
  kind: 'lesson',
  unit: 'kusur-natiqa',
  unitTitle: 'العمليات على الكسور والأعداد الناطقة',
  sequentialUnlock: true,
  title: 'العمليات على الأعداد الناطقة',
  description: 'لوحة الدمج: ندمج بلاطات أعداد ناطقة بعد أن نتوقّع إشارة كلّ ناتج، فنكتشف كيف نجمع ونطرح ونضرب ونقسم بالضرب في المقلوب، وكيف ننظّم سلسلة حسابات تحترم الأولوية.',
  level: 'moyen',
  grade: '3am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🕹️',
  estimatedDurationMin: 90,
  textbookRef: { unit: 2, activity: 6, pages: '23, 25, 28, 29, 31, 32, 33, 34, 35' },
  skills: [
    'حساب مجموع وفرق عددين ناطقين بتوحيد المقامات مع تعيين إشارة الناتج (منها ناطق بسطه عشري)',
    'حساب جداء عددين ناطقين: $\\frac{a}{b}\\times\\frac{c}{d}=\\frac{a\\times c}{b\\times d}$ مع تعيين الإشارة أوّلًا',
    'تعيين مقلوب عدد ناطق غير معدوم (مقلوب $-3$ هو $-\\frac{1}{3}$) وحساب حاصل قسمة عددين ناطقين بالضرب في مقلوب القاسم',
    'تنظيم سلسلة حسابات على الأعداد الناطقة باحترام أولوية العمليات والأقواس، ومنها الكتابات الكسرية المركّبة',
  ],
  teachingScope: {
    include: ['مجموع وفرق وجداء وحاصل قسمة عددين ناطقين، وتعيين الإشارة أوّلًا، ومنها الناطق ذو البسط العشري', 'مقلوب عدد ناطق غير معدوم بما فيه السالب، والقسمة بالضرب في المقلوب', 'سلاسل الحساب بالأقواس والأولوية والكتابات الكسرية المركّبة، وحساب عبارة عند قيم ناطقة لحروفها حسابًا فقط، وإثبات أنّ عددًا ناطقًا طبيعي أو صحيح'],
    exclude: ['منطق التعويض والأمثلة المضادة (درس قيمة عبارة حرفية)', 'المقارنة بإشارة الفرق (وحدة لاحقة)', 'حلّ المعادلات بقواعد التحويل (وحدة المعادلات): المجهول يُوجد بعملية عكسية واحدة', 'القوى (وحدة القوى)'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js).
  lessonProblem: {
    module: 5,
    title: 'برنامج حساب في مسابقة القسم',
    statement: 'في مسابقة القسم برنامج حساب: اختر عددًا، اضربه في $-\\frac{2}{3}$ ، ثمّ أضف $\\frac{5}{6}$ إلى النتيجة.',
    questions: [
      { label: '1)', text: 'ما النتيجة إذا اخترت $\\frac{3}{4}$ ؟' },
      { label: '2)', text: 'وما النتيجة إذا اخترت $-\\frac{5}{4}$ ؟' },
      { label: '3)', text: 'أيّ عدد نختار لتكون النتيجة $0$ ؟' },
    ],
    illustration: { kind: 'tags', cards: [{ title: 'الأولى', lines: [{ label: 'نختار', value: 'عددًا' }] }, { title: 'الثانية', lines: [{ label: 'نضرب في', value: '-2/3' }] }, { title: 'الثالثة', lines: [{ label: 'نضيف', value: '5/6' }] }], ariaLabel: 'ثلاث بطاقات: نختار عددًا، ثم نضربه في سالب ثلثين، ثم نضيف خمسة أسداس' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : les quatre liens « راجع » du réseau (3am.m1.r01, r04, r06, r07, leçons PUBLIÉES) et les sommes de relatifs (2AM, non publiée).
  priorKnowledge: ['jidaa-adadayn-nisbiyayn-3am', 'maqlub-qismat-kasrayn-3am', 'jam-tarh-kasrayn-3am', 'adad-natiq-3am', 'jam-tarh-nisbiya-2am'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `merge-board` (la main prédit le signe, retourne le diviseur, ordonne les fusions), thème `arcade`.
    {
      kind: 'manipulation', code: 'merge-board-simple', type: 'merge-board', module: 1,
      level: 'beginner',
      title: 'لوحة الدمج: توقّع الإشارة ثم ادمج',
      objective: 'عند جمع عددين ناطقين تتحدّد إشارة الناتج بالعدد الأبعد عن الصفر، وعند ضربهما أو قسمتهما تكون الإشارة موجبة إذا تشابهت الإشارتان وسالبة إذا اختلفتا، ونقسم بالضرب في مقلوب القاسم الذي يحتفظ بإشارته؛ وفي سلسلة تُدمج العمليات بحسب الأولوية',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'arcade' },
      learningPointIds: ['3am_amaliyat-natiqa_P1', '3am_amaliyat-natiqa_P2', '3am_amaliyat-natiqa_P3', '3am_amaliyat-natiqa_P4'],
      sourceElementIds: ['act-6'],
    },
    {
      kind: 'manipulation', code: 'merge-board-priority', type: 'merge-board', module: 1,
      level: 'advanced',
      title: 'لوحة الدمج: أشرطة مخفيّة وسلاسل بأقواس',
      objective: 'عند جمع عددين ناطقين تتحدّد إشارة الناتج بالعدد الأبعد عن الصفر، وعند ضربهما أو قسمتهما تكون الإشارة موجبة إذا تشابهت الإشارتان وسالبة إذا اختلفتا، ونقسم بالضرب في مقلوب القاسم الذي يحتفظ بإشارته؛ وفي سلسلة تُدمج العمليات بحسب الأولوية',
      autonomy: 'الأشرطة مخفيّة حتى تتمّ الدمجة الأولى: يتوقّع التلميذ الإشارة من الأعداد وحدها، وفي السلاسل أقواس وكسر مركّب وعمليات بأولوية مختلفة',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'arcade' },
      learningPointIds: ['3am_amaliyat-natiqa_P1', '3am_amaliyat-natiqa_P2', '3am_amaliyat-natiqa_P3', '3am_amaliyat-natiqa_P4'],
      sourceElementIds: ['method-9'],
    },
    // Module 2 — le MÊME type, monde `signs`, posé seul (`levels={false}`) : déclaré SANS niveau.
    {
      kind: 'manipulation', code: 'merge-board-signs', type: 'merge-board', module: 2,
      title: 'ست إشارات متتالية',
      learningPointIds: ['3am_amaliyat-natiqa_P1', '3am_amaliyat-natiqa_P2'],
      sourceElementIds: ['know-6'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — برنامج حساب في مسابقة القسم', learningPointIds: ['3am_amaliyat-natiqa_P1', '3am_amaliyat-natiqa_P2', '3am_amaliyat-natiqa_P3'], sourceElementIds: ['deep-79'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — قيم العبارات', learningPointIds: ['3am_amaliyat-natiqa_P1', '3am_amaliyat-natiqa_P3', '3am_amaliyat-natiqa_P4'], sourceElementIds: ['deep-58', 'deep-76'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — عدد صحيح؟', learningPointIds: ['3am_amaliyat-natiqa_P1', '3am_amaliyat-natiqa_P3', '3am_amaliyat-natiqa_P4'], sourceElementIds: ['deep-73', 'deep-77', 'ict', 'ex-39', 'ex-45'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ثماني عبارات: صحيح أم خاطئ؟ جداء عددين نسبيين، وقسمة كسرين، وجمع كسرين، والعدد الناطق، وجمع الأعداد النسبية.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — لوحة الدمج', desc: 'كيف نعرف إشارة الناتج قبل أن نحسب؟ وكيف نقسم على عدد سالب؟ وبأيّ ترتيب ندمج سلسلة حسابات؟',
      stage: 'trigger', teachesLearningPointIds: ['3am_amaliyat-natiqa_P1', '3am_amaliyat-natiqa_P2', '3am_amaliyat-natiqa_P3', '3am_amaliyat-natiqa_P4'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — العمليات الأربع', desc: 'نسمّي قواعد الجمع والطرح والضرب والقسمة، ومقلوب عدد ناطق بما فيه السالب.',
      stage: 'discovery', teachesLearningPointIds: ['3am_amaliyat-natiqa_P1', '3am_amaliyat-natiqa_P2', '3am_amaliyat-natiqa_P3'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — بسط عشري وسلسلة حسابات', desc: 'نجمع ونطرح ناطقين بسطهما عشري بأصغر مضاعف مشترك، وننظّم سلسلة حسابات.',
      stage: 'formalization', teachesLearningPointIds: ['3am_amaliyat-natiqa_P1', '3am_amaliyat-natiqa_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'جداءات ومجاميع وقسمات، وتجميع الحدود، وكسور مركّبة، وعددان ناطقان، وعددان من قائمة، وترتيب ومقلوبات، وحدّ مجهول.',
      stage: 'practice_lab', teachesLearningPointIds: ['3am_amaliyat-natiqa_P1', '3am_amaliyat-natiqa_P2', '3am_amaliyat-natiqa_P3', '3am_amaliyat-natiqa_P4'],
      color: 'amber', style: 'featured', estimatedMin: 16, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — برنامج حساب', desc: 'مسألة الدرس: برنامج حساب في مسابقة القسم، ونتيجته عند عددين، والعدد الذي يعطي $0$ .',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_amaliyat-natiqa_P1', '3am_amaliyat-natiqa_P2', '3am_amaliyat-natiqa_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — قيم العبارات', desc: 'حساب ثلاث عبارات عند قيم ناطقة للحروف $x$ و $y$ و $z$ .',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_amaliyat-natiqa_P1', '3am_amaliyat-natiqa_P3', '3am_amaliyat-natiqa_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — عدد صحيح؟', desc: 'نبيّن بالحساب أنّ عددًا ناطقًا صحيح أو طبيعي، ونتحقّق بالحاسبة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_amaliyat-natiqa_P1', '3am_amaliyat-natiqa_P3', '3am_amaliyat-natiqa_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الأربع.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
