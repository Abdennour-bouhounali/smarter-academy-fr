/**
 * أدمج تعلّماتي — الوحدة 3 « الحساب الحرفي » (kind: synthesis)
 * Manuel 4AM, unité 3 : « أدمج تعلّماتي » (وضعية الحوض والشريط + تحليل الوضعية, p. 40),
 * le تحدّ de la page d'unité (p. 31) et les items 1–2 de « أستعدّ » (p. 31)
 * — extraction.json › destinations.
 * Ce n'est PAS un quatrième درس : c'est la synthèse de l'unité, affichée après les trois leçons.
 * Format de l'unité 1 (décision du propriétaire, 2026-10-13), et seulement lui : 0 أستعدّ · 1–6 six « الوضعية التدريبية N »
 * (`track: 'problem'`, content/problems.js) · 7 « الوضعية وتحليلها » (lire et analyser, rien n'est résolu) ·
 * 8 « أحلّ الوضعية » (le test évalué).
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/ansab_al_aadad_wal_hisab/wadiya-idmajiya-harfi';

export const LESSON_CONFIG = {
  id: 'wadiya-idmajiya-harfi',
  kind: 'synthesis',
  unit: 'hisab-harfi',
  unitTitle: 'الحساب الحرفي',
  sequentialUnlock: true,
  // Regard de l'élève : 'mission' (la synthèse de l'unité 3, 2026-11-12 — le propriétaire : « go ahead » pour les synthèses des unités 1–4, recette
  // PROVISOIRE de la synthèse, pilote `wadiya-idmajiya-talis` ; docs/reports/MISSION_ROLLOUT_PROGRESS.md › « The synthesis recipe ») ; l'enseignant
  // et le mode classe gardent la page. Champs du moteur : LESSON_DEVELOPMENT_GUIDE › « Synthesis in the mission player ».
  studentView: 'mission',
  // LA MISSION d'une synthèse : rien à gagner — les clés des leçons de l'unité sont à l'élève DÈS le premier écran ; chaque وضعية تدريبية allume
  // les clés qu'elle UTILISE. Pas de point d'étape ; « وضعية الوحدة » (module 7) puis « التحدّي 🏆 » (module 8). L'ouverture n'a aucun chiffre ni
  // la وضعية (balayage par rôle : content/forbidden.js, content/mission.test.js). La scène : la place à la fontaine (`fountain-plaza`).
  mission: {
    scene: 'fountain-plaza',
    title: 'مهمّة الوحدة',
    opening: {
      text: 'في الساحة، يحيط ممرّ منتظم بنافورة مربّعة: كيف نجد عرضه إذا عرفنا مساحته؟ مفاتيح الوحدة كلّها معك — هل تعرف متى تنشر ومتى تحلّل؟',
      cta: 'أجرّب',
    },
    toolsOwned: true,
    tools: [
      // les ids sont des connaissances des leçons de l'unité ; `usedIn` : les modules qui s'en servent
      { id: 'nashr-qawsayn', icon: '🧩', label: 'نشر جداء قوسين', usedIn: [2, 3, 4, 7] },
      { id: 'tabsit', icon: '🧹', label: 'تبسيط عبارة', usedIn: [3, 4, 6, 7] },
      { id: 'murabba-majmu', icon: '⬛', label: 'مربّع مجموع', usedIn: [4, 6, 7] },
      { id: 'hisab-mutamaan', icon: '🧮', label: 'الحساب الذهني بمتطابقة', usedIn: [1, 3, 5, 6] },
      { id: 'tahlil-mutatabiqat', icon: '🔁', label: 'التحليل بالمتطابقات الشهيرة', usedIn: [1, 5, 6] },
    ],
    checkpoints: [],
    climaxModule: 8,
    stationLabels: { 7: 'وضعية الوحدة', 8: 'التحدّي 🏆' },
    trainings: [1, 2, 3, 4, 5, 6],
    hideStars: true,
    // la somme HONNÊTE des modules (6 + 36 + 28 + 6), en deux séances ; le catalogue (`estimatedDurationMin`) n'est pas touché
    durationMin: 76,
    sittings: 2,
    resumeInside: true,
  },
  title: 'أدمج تعلّماتي — الحساب الحرفي',
  description: 'حل وضعيات مركّبة بتوظيف الحساب الحرفي (النشر، المتطابقات الشهيرة، التحليل): ست وضعيات تدريبية، ثم وضعية الوحدة وتحليلها، ثم التحدّي.',
  level: 'moyen',
  grade: '4am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان أنساب الأعداد والحساب',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🏊',
  estimatedDurationMin: 62,
  textbookRef: { unit: 3, pages: '31, 40' },
  skills: [
    'تجنيد النشر والتبسيط والتحليل والمتطابقات الشهيرة لحل وضعيات هندسية وعددية مركبة',
    'نمذجة وضعية: التعبير عن أطوال ومساحات بعبارات جبرية بدلالة x',
    'اختيار الشكل المنشور أو المحلّل لحساب قيمة عبارة أو لكتابة معادلة وحلها',
  ],
  teachingScope: {
    include: ['ست وضعيات تدريبية تجمع النشر والمتطابقات الشهيرة والتحليل', 'أدمج تعلّماتي: الوضعية وتحليلها في ثلاث مراحل', 'تحدّ الوحدة: المثلث القائم'],
    exclude: ['أي مفهوم جديد', 'حل معادلة جداء معدوم بصفة عامة (تُستعمل مساعدة الكتاب فقط، مع التحقق بالتعويض)'],
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // La carte TOUTE OUVERTE (règle des pilotes, propriétaire 2026-11-08) : elle parle EN LETTRES — aucun nombre de la وضعية ni du défi
  // (knowledgeGraph.js, content/mission.test.js).
  knowledgeMapOpen: true,
  // Ce que la situation mobilise, diagnostiqué par « أستعدّ » : la valeur d'une expression (p. 31, items 1–2),
  // le développement (درس 1), les identités (درس 2), la factorisation (درس 3), les aires, Pythagore.
  priorKnowledge: ['qimat-ibara', 'nashr-jadaa', 'mutatabiqat', 'tahlil-ibara', 'masahat-ashkal', 'khassiyat-fithaghuras'],
  resources: [
    { kind: 'situation', code: 'situation-hawd-shrit', module: 7, title: 'وضعية: الحوض والشريط', learningPointIds: ['4am_wadiya-idmajiya-harfi_P2'], sourceElementIds: ['situation'] },
    // Modules 1–6 — six وضعيات d'entraînement (content/problems.js), ajouts de la plateforme ;
    // le module 7 lit la situation du manuel, le module 8 l'évalue.
    { kind: 'situation', code: 'wadiya-1', module: 1, title: 'وضعية 1 — مكتبة المتوسطة: 51 × 49 والحديقة 98 م', learningPointIds: ['4am_wadiya-idmajiya-harfi_P1', '4am_wadiya-idmajiya-harfi_P3'] },
    { kind: 'situation', code: 'wadiya-2', module: 2, title: 'وضعية 2 — مشتلة مساحتها 60 م²: x(x + 7) = 60', learningPointIds: ['4am_wadiya-idmajiya-harfi_P2', '4am_wadiya-idmajiya-harfi_P1'] },
    { kind: 'situation', code: 'wadiya-3', module: 3, title: 'وضعية 3 — تبادل قطعتي أرض: (x + 3)(x - 3)', learningPointIds: ['4am_wadiya-idmajiya-harfi_P2', '4am_wadiya-idmajiya-harfi_P3'] },
    { kind: 'situation', code: 'wadiya-4', module: 4, title: 'وضعية 4 — سارية العلم وسلكها: فيثاغورس بدلالة x', learningPointIds: ['4am_wadiya-idmajiya-harfi_P2', '4am_wadiya-idmajiya-harfi_P1'] },
    { kind: 'situation', code: 'wadiya-5', module: 5, title: 'وضعية 5 — تصحيح الخطأ (2x - 3)² = 4x² - 9', learningPointIds: ['4am_wadiya-idmajiya-harfi_P1', '4am_wadiya-idmajiya-harfi_P3'] },
    { kind: 'situation', code: 'wadiya-6', module: 6, title: 'وضعية 6 — برنامجا حساب يعطيان النتيجة نفسها', learningPointIds: ['4am_wadiya-idmajiya-harfi_P3', '4am_wadiya-idmajiya-harfi_P1'] },
    // Module 7 — le labo de l'unité sur un terrain FRÈRE (content/rounds.js) : la نافورة de côté 7 et son ممرّ, « x+7+x » au carré. Lecteur : deux
    // manches (en aires, puis en termes) ; page : le même terrain, un seul niveau.
    {
      kind: 'manipulation', code: 'pitch-expansion-mamarr', type: 'pitch-expansion', module: 7,
      title: 'ممرّ النافورة: مربّع ضلعه x + 7 + x',
      experience: { type: 'platform_adaptation', reason: 'multiple_representations', theme: 'football' },
      learningPointIds: ['4am_wadiya-idmajiya-harfi_P2', '4am_wadiya-idmajiya-harfi_P1'],
      sourceElementIds: ['situation'],
    },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'عشر عبارات: صحيح أم خاطئ؟ النشر، المتطابقات الشهيرة والتحليل — من السهل إلى الأصعب.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    // Les وضعيات d'entraînement (track: 'problem') : practice_lab, avant la situation évaluée (module 8, toujours
    // ouvert). Elles comptent dans la complétion, jamais dans la maîtrise — docs/lessons/MASAIL_GENERATION_GUIDE.md, §14.
    { id: '01', number: 1, slug: 'wadiya-1', path: `${LESSON_BASE_PATH}/wadiya-1`,
      title: 'الوضعية التدريبية 1 — مكتبة المتوسطة', desc: '51 × 49 وحديقة مربّعة ضلعها 98 م: الحساب الذهني بالمتطابقات، ثم الفرق بين مربّعين محلَّلًا.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-harfi_P1', '4am_wadiya-idmajiya-harfi_P3'],
      color: 'sky', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '02', number: 2, slug: 'wadiya-2', path: `${LESSON_BASE_PATH}/wadiya-2`,
      title: 'الوضعية التدريبية 2 — مشتلة المتوسطة', desc: 'مشتلة مستطيلة مساحتها 60 م²: اكتب المعادلة، وظّف الشكل المحلّل، ثم احسب السياج.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-harfi_P2', '4am_wadiya-idmajiya-harfi_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '03', number: 3, slug: 'wadiya-3', path: `${LESSON_BASE_PATH}/wadiya-3`,
      title: 'الوضعية التدريبية 3 — تبادل قطعتي أرض', desc: 'مربّع ومستطيل (x + 3)(x - 3): هل المساحتان متساويتان؟ وما التعويض؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-harfi_P2', '4am_wadiya-idmajiya-harfi_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '04', number: 4, slug: 'wadiya-4', path: `${LESSON_BASE_PATH}/wadiya-4`,
      title: 'الوضعية التدريبية 4 — سارية العلم', desc: 'فيثاغورس بدلالة x: السارية والسلك، المعادلة، ثم قيمة x المقبولة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-harfi_P2', '4am_wadiya-idmajiya-harfi_P1'],
      color: 'amber', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '05', number: 5, slug: 'wadiya-5', path: `${LESSON_BASE_PATH}/wadiya-5`,
      title: 'الوضعية التدريبية 5 — تصحيح خطأ زميلتي', desc: 'اختبر المساواة (2x - 3)² = 4x² - 9، صحّحها، ثم احسب ذهنيًا بالتحليل.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-harfi_P1', '4am_wadiya-idmajiya-harfi_P3'],
      color: 'rose', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '06', number: 6, slug: 'wadiya-6', path: `${LESSON_BASE_PATH}/wadiya-6`,
      title: 'الوضعية التدريبية 6 — برنامجا الحساب', desc: 'برنامجان يزعم صاحباهما أنّ نتيجتهما واحدة: أثبت ذلك وتحقّق من أجل عدد كبير.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-harfi_P3', '4am_wadiya-idmajiya-harfi_P1'],
      color: 'violet', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '07', number: 7, slug: 'al-wadiya', path: `${LESSON_BASE_PATH}/al-wadiya`,
      title: 'الوضعية وتحليلها', desc: 'جولتان في الساحة (ممرّ النافورة بالأعداد ثم بالحرف x)، ثم وضعية الوحدة: المعطيات، مساحة الشريط، المساواة، وورقة مالك — دون حلّها بعد.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_wadiya-idmajiya-harfi_P1', '4am_wadiya-idmajiya-harfi_P2', '4am_wadiya-idmajiya-harfi_P3'],
      color: 'amber', style: 'featured', estimatedMin: 28, difficulty: 3, actionText: 'أحلّل الوضعية' },
    { id: '08', number: 8, slug: 'ahill', path: `${LESSON_BASE_PATH}/ahill`,
      title: 'أحلّ الوضعية', desc: 'خمس مراحل تُقيَّم: ضلع المربع الخارجي، مساحة الشريط، المساواة، الشكل المحلّل، ثم عرض الشريط والتحقق.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 4, actionText: 'أحلّ' },
  ],
};
