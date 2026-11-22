/**
 * الدرس — اختبار صحة مساواة أو متباينة (2AM, unité 4 « مفهوم معادلة »), la TROISIÈME leçon générée de l'unité (item du programme `2am.m4.r09`), générée DANS son entrée du catalogue (même code), cycle moyen phase 3, 2026-10-30.
 * Manuel 2AM (الجيل الثاني, منشورات الشهاب) : نشاط 3 p. 57, معارف 3 et 4 p. 60, طريقة 3 p. 61, أوظّف pp. 61–64, أؤكّد p. 65, أتعمّق pp. 66–67, ICT p. 69.
 * Source de vérité : docs/sources/2am/unit4/extraction.json ; plan : docs/sources/2am/unit4/plan/ikhtibar-musawat-mutabayina.md.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter–§4quinquies) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : « حمولة الجسر » — un camion de matériaux de construction doit passer le pont d'un oued ; une pancarte dit « la masse totale est plus petite que 5000 kg ». L'élève CHARGE x sacs de ciment (50 kg) puis passe au pèse-camion : l'écran
 *   écrit la substitution (4000 + 50 × 15 = 4750) puis la comparaison (4750 < 5000 ؟) AVANT que la barrière ne bouge. Tester une égalité ou une inégalité = substituer et calculer chaque membre. Parmi 18, 19, 20, 21 sacs, 20 donne
 *   5000 pile, qui N'est PAS « plus petit » : le signe compte. Avec des sacs de sable (40 kg) la règle a DEUX inconnues. Deux camions portent LA MÊME charge x : 3000 + 70x et 3600 + 50x ne pèsent pareil que pour x = 30. À متقدم l'élève cherche UNE
 *   charge qui réfute « A est toujours plus léger » ; « égales pour x = 10 » est réfuté en x = 0 : une valeur ne prouve rien ; et la pancarte « ≤ 7000 » laisse passer le camion de 7000 kg exactement.
 *   Rejetées : (a) l'activité 3 du manuel (une balance de Roberval, 3 cubes = 2 boules + 200 g) : le monde de la balance est celui de `equation-balance` (4AM), les valeurs sont données, la main ne fait rien → exercice du module 4 ;
 *   (b) une sonde x sur une droite (4AM `solution-ray`) qui inviterait à balayer toutes les valeurs ; (c) deux tableaux de score pour un couple (4AM `pair-scoreboard`, les systèmes).
 *   Ordre des idées : charger, peser, lire la ligne de substitution → le verdict compare deux membres calculés → parmi des charges données → le cas limite (< ou ≤) → deux inconnues → deux camions, une charge → « toujours » : un contre-exemple suffit,
 *   une valeur égale ne prouve rien → معارف → طريقة → pratique, trois مسائل, test.
 *
 * HISTOIRE DES الكفاءات (positions gardées : les identifiants sont positionnels) — brouillon → texte final :
 *   P1  « اختبار صحّة مساواة تتضمّن عددا مجهولا (أو عددين) بتعويضه بقيمة معلومة » → + « حساب كلّ من الطرفين ومقارنتهما » et « تعيين القيم التي تجعلها صحيحة من بين قيم معطاة » (ex-31 du manuel, le corpus) ;
 *   P2  « اختبار تساوي عبارتين حرفيتين : يكفي مثال مضادّ واحد » → + « تتساويان إذا أعطتا القيمة نفسه مهما كان الحرف (par une règle connue) » et « l'égalité pour quelques valeurs ne suffit pas » ;
 *   P3  « تعيين القيم التي تجعل متباينة صحيحة من بين قيم معطاة » → + le test lui-même, deux inconnues et les signes ≤ ≥ (question 12 de l'unité, corpus `2am-s3-39`).
 * Le réseau : item `2am.m4.r09` (requires `1am.m5.r08` et `2am.m4.r06`) → « تذكّر — السنة الأولى » AVEC lien depuis le 2026-10-30 (`tatbiq-qaida-harfiya` est publiée) et « تذكّر — المجموع الجبري » AVEC lien vers `majmu-jabri` (PUBLIÉE) ; « أستعدّ » mesure les deux
 *   (items 1, 2 et 3, 4). Arêtes : P1 ← 2am_majmu-jabri_P2 (le long du lien `2am.m4.r06 → r09`, écrite ici par la leçon d'arrivée) ; P1 ← 2am_ibara-harfiya-intaj_P2 (même unité, même année, sans lien du réseau : la valeur d'une expression) ; P2, P3 ← P1.
 * 2026-10-30 : `tatbiq-qaida-harfiya` (1AM, 1am.m5.r08) est publiée — arêtes LP P1 ← 1am_tatbiq-qaida-harfiya_P2 (tester une égalité = substituer dans chaque membre) et P2 ← 1am_tatbiq-qaida-harfiya_P3
 *   (un contre-exemple suffit) le long du lien du réseau 1am.m5.r08 → 2am.m4.r09 (`requires`) ; le « تذكّر — السنة الأولى » devient un lien vers la leçon.
 *   Jamais de renvoi vers `hall-mushkil-muadala` (plus tard dans le catalogue).
 * Successeurs (à connecter par le coordinateur) : 3AM `musawiyat-amaliyat` et `mutabayinat-amaliyat` (net `2am.m4.r09 → 3am.m5.r05`).
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab/ikhtibar-musawat-mutabayina';

export const LESSON_CONFIG = {
  id: 'ikhtibar-musawat-mutabayina',
  kind: 'lesson',
  unit: 'mafhum-muadala',
  unitTitle: 'مفهوم معادلة',
  sequentialUnlock: true,
  title: 'اختبار صحة مساواة أو متباينة',
  description: 'شاحنة مواد البناء أمام جسر على وادٍ: نحمّلها بأكياس الإسمنت والرمل فيعوّض الميزان عدد الأكياس في القاعدة ويحسب الطرفين ويقارنهما، فنختبر مساواة أو متباينة بقيمة معلومة ونبطل ادّعاءً بمثال مضادّ واحد.',
  level: 'moyen',
  grade: '2am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🚚',
  estimatedDurationMin: 64,
  textbookRef: { unit: 4, activity: 57, pages: '57, 60, 61, 69' },
  skills: [
    'اختبار صحّة مساواة تتضمّن عددًا مجهولًا أو عددين مجهولين بتعويضه بقيمة معلومة وحساب كلّ من الطرفين ومقارنتهما، مثل $7x+8=12x-4$ من أجل $x=6$ (خاطئة: $50\\neq68$)، وتعيين القيم التي تجعلها صحيحة من بين قيم معطاة',
    'اختبار تساوي عبارتين حرفيتين: تتساويان إذا أعطتا القيمة نفسها مهما كانت قيمة الحرف (بقاعدة معروفة كالتوزيع)، ويكفي مثال مضادّ واحد لإثبات أنّهما غير متساويتين، أمّا التساوي من أجل بعض القيم فلا يكفي',
    'اختبار صحّة متباينة (بالرموز $<$ و $>$ و $\\le$ و $\\ge$) من أجل قيم معطاة لمجهول أو لمجهولين، وتعيين القيم التي تجعلها صحيحة من بين قيم معطاة، مثل $10x-2<55-3x$',
  ],
  teachingScope: {
    include: ['اختبار صحة مساواة من أجل قيمة بتعويض الحرف وحساب كلّ طرف ومقارنتهما', 'مساواة بعددين مجهولين وترتيب القيمتين', 'اختبار متباينة بالرموز $<$ و $>$ و $\\le$ و $\\ge$ وتعيين القيم الصحيحة من بين قيم معطاة', 'تساوي عبارتين حرفيتين: مهما كان الحرف أو مثال مضادّ واحد'],
    exclude: ['المعادلة وحلّها بالعملية العكسية (الدرس: حلّ مشكل باستعمال معادلة)', 'إيجاد كلّ القيم التي تحقّق متباينة (السنة الرابعة)', 'تحويل مساواة أو متباينة (السنة الثالثة)', 'إثبات متطابقة بنشر جداء قوسين'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js).
  lessonProblem: {
    module: 5,
    title: 'مصعد العمارة',
    statement: 'يحمل مصعد عمارة $630\\,\\mathrm{kg}$ على الأكثر. يركبه $x$ شخصًا متوسّط كتلة كلّ منهم $70\\,\\mathrm{kg}$ مع صندوق كتلته $45\\,\\mathrm{kg}$ .',
    questions: [
      { label: '1)', text: 'اكتب المتباينة التي تعبّر عن أنّ الحمولة لا تتجاوز الحدّ المسموح.' },
      { label: '2)', text: 'اختبرها من أجل $x=8$ ثمّ من أجل $x=9$ .' },
      { label: '3)', text: 'استنتج أكبر عدد من الأشخاص يمكنه ركوب المصعد مع الصندوق.' },
    ],
    table: { caption: 'كتلة الحمولة بدلالة عدد الأشخاص', head: ['عدد الأشخاص', 'كتلة الأشخاص', 'مع الصندوق'], rows: [['8', '560', '605'], ['9', '630', '675']] },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : le lien « راجع » du réseau `1am.m5.r08` (قاعدة حرفية, items 1 et 2 ; leçon 1AM publiée) et `2am.m4.r06` (المجموع الجبري, items 3 et 4 ; leçon `majmu-jabri`), la comparaison de décimaux (item 5) et de relatifs (item 6).
  priorKnowledge: ['qimat-ibara-2am', 'majmu-jabri-2am', 'muqarana-ushriya', 'muqarana-nisbiya-2am', 'tawzi-2am'],
  resources: [
    // Module 1 — WORKSPACE À DEUX NIVEAUX, un seul type `bridge-load` (la main tient x et y : les NOMBRES de sacs posés sur le camion) :
    //   مبتدئ — b1 4000 + 50x < 5000 (15 ; 22 ; puis les cartes 18 19 20 21) · b2 4500 + 50x + 40y < 7000 (deux inconnues) · b3 deux camions, une charge : 3000 + 70x = 3600 + 50x.
    //   متقدم — l'écran est masqué jusqu'à ce que l'élève ait tapé les deux masses : a1 « A est toujours plus léger » · a2 « égales parce qu'égales pour x = 10 » · a3 la pancarte « ≤ 7000 ».
    {
      kind: 'manipulation', code: 'bridge-load-build', type: 'bridge-load', module: 1,
      level: 'beginner',
      title: 'حمولة الجسر: أحمّل وأزن وأقارن',
      objective: 'نكتشف أنّ اختبار مساواة أو متباينة يعني تعويض الحرف بالقيمة وحساب كلّ طرف ثمّ مقارنة العددين',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'weighbridge' },
      learningPointIds: ['2am_ikhtibar-musawat-mutabayina_P1', '2am_ikhtibar-musawat-mutabayina_P3'],
      sourceElementIds: ['act-3', 'ex-31'],
    },
    {
      kind: 'manipulation', code: 'bridge-load-claim', type: 'bridge-load', module: 1,
      level: 'advanced',
      title: 'حمولة الجسر: أبطل ادّعاءً بحمولة واحدة',
      objective: 'نكتشف أنّ اختبار مساواة أو متباينة يعني تعويض الحرف بالقيمة وحساب كلّ طرف ثمّ مقارنة العددين',
      autonomy: 'يكتب التلميذ كتلتي الشاحنتين قبل أن تظهر الشاشة، ثمّ يبحث عن حمولة واحدة تُبطل ادّعاءً، ويميّز الرمزين $<$ و $\\le$ عند الحدّ',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'weighbridge' },
      learningPointIds: ['2am_ikhtibar-musawat-mutabayina_P2', '2am_ikhtibar-musawat-mutabayina_P3'],
      sourceElementIds: ['know-3', 'now-61'],
    },
    {
      kind: 'manipulation', code: 'bridge-load-maarif', type: 'bridge-load', module: 2,
      title: 'حمولة الجسر: اختبار المساواة والمتباينة',
      objective: 'نكتشف أنّ اختبار مساواة أو متباينة يعني تعويض الحرف بالقيمة وحساب كلّ طرف ثمّ مقارنة العددين',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'weighbridge' },
      learningPointIds: ['2am_ikhtibar-musawat-mutabayina_P1', '2am_ikhtibar-musawat-mutabayina_P3'],
      sourceElementIds: ['know-3', 'know-4'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — مصعد العمارة', learningPointIds: ['2am_ikhtibar-musawat-mutabayina_P1', '2am_ikhtibar-musawat-mutabayina_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — أعلام الحيّ', learningPointIds: ['2am_ikhtibar-musawat-mutabayina_P1'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — ادّعاءان عن الأعداد المتتالية', learningPointIds: ['2am_ikhtibar-musawat-mutabayina_P2'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ قيمة عبارة حرفية، والمجموع الجبري، ومقارنة الأعداد العشرية والنسبية.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — حمولة الجسر', desc: 'حمّل شاحنة مواد البناء ثمّ مرّرها على الميزان: هل تعبر الجسر؟ وأيّ الحمولات تعبر؟ وهل تتساوى كتلتا شاحنتين؟',
      stage: 'trigger', teachesLearningPointIds: ['2am_ikhtibar-musawat-mutabayina_P1', '2am_ikhtibar-musawat-mutabayina_P2', '2am_ikhtibar-musawat-mutabayina_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 18, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — اختبار المساواة والمتباينة', desc: 'اختبار مساواة، وعبارتان متساويتان دائمًا، والمثال المضادّ، واختبار متباينة والرموز الأربعة.',
      stage: 'discovery', teachesLearningPointIds: ['2am_ikhtibar-musawat-mutabayina_P1', '2am_ikhtibar-musawat-mutabayina_P2', '2am_ikhtibar-musawat-mutabayina_P3'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أعوّض وأحسب وأقارن', desc: 'جدول الاختبار، وعددان مجهولان، وقيم معطاة، ومثال مضادّ.',
      stage: 'formalization', teachesLearningPointIds: ['2am_ikhtibar-musawat-mutabayina_P1', '2am_ikhtibar-musawat-mutabayina_P2', '2am_ikhtibar-musawat-mutabayina_P3'],
      color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'سبعة تمارين: ميزان متوازن، واختبار مساواة، وجدول قيم، والمساويات الصحيحة دائمًا، وقيمة من بين قيم، ومتباينة، وجدول طرفين.',
      stage: 'practice_lab', teachesLearningPointIds: ['2am_ikhtibar-musawat-mutabayina_P1', '2am_ikhtibar-musawat-mutabayina_P2', '2am_ikhtibar-musawat-mutabayina_P3'],
      color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — مصعد العمارة', desc: 'مسألة الدرس: متباينة تعبّر عن حدّ الحمولة، تُختبر بقيمتين، ويُستنتج أكبر عدد ممكن.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_ikhtibar-musawat-mutabayina_P1', '2am_ikhtibar-musawat-mutabayina_P3'],
      color: 'amber', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — أعلام الحيّ', desc: 'مساواة بين مبلغين تُختبر من أجل ثلاثة أثمان، فنعرف ثمن العلم.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_ikhtibar-musawat-mutabayina_P1'],
      color: 'amber', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — ادّعاءان عن الأعداد المتتالية', desc: 'ادّعاءان نختبرهما بثلاثة أعداد متتالية: مثال مضادّ يبطل أحدهما، ومثال واحد لا يكفي لإثبات الآخر.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_ikhtibar-musawat-mutabayina_P2'],
      color: 'amber', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
