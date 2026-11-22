/**
 * أدمج تعلّماتي — الوحدة 4 « معادلات ومتراجحات من الدرجة الأولى بمجهول واحد » (kind: synthesis)
 * Manuel 4AM, unité 4 : « أدمج تعلّماتي » (وضعية المسبح البلدي + تحليل الوضعية, p. 52).
 * Ce n'est PAS un cinquième درس : c'est la synthèse de l'unité, affichée après les quatre leçons.
 * Depuis le 2026-10-13 (schéma de l'unité 1, `wadiya-idmajiya-aadad`) : six وضعيات d'entraînement
 * (modules 1 à 6, content/problems.js, ajouts de la plateforme), « تحليل الوضعية النهائية للاختبار »
 * (module 7, la situation du مسبح lue et analysée, rien n'est résolu) puis « وضعية الاختبار النهائي »
 * (module 8, le test). Le QCM de fin d'unité (p. 52) et les exercices d'approfondissement (p. 53) ne font plus partie de la
 * synthèse (décision du propriétaire) ; les anciens modules 1 à 4 sont devenus 7, 0, 0 et 8
 * (remap {1→7, 2→0, 3→0, 4→8}).
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/ansab_al_aadad_wal_hisab/wadiya-idmajiya-muadalat';

export const LESSON_CONFIG = {
  id: 'wadiya-idmajiya-muadalat',
  kind: 'synthesis',
  unit: 'muadalat-mutarajihat',
  unitTitle: 'معادلات ومتراجحات من الدرجة الأولى بمجهول واحد',
  sequentialUnlock: true,
  // Regard de l'élève : 'mission' (la synthèse de l'unité 4, 2026-11-12 — le propriétaire : « go ahead » pour les synthèses des unités 1–4, recette
  // PROVISOIRE de la synthèse, pilote `wadiya-idmajiya-talis` ; docs/reports/MISSION_ROLLOUT_PROGRESS.md › « The synthesis recipe ») ; l'enseignant
  // et le mode classe gardent la page. Champs du moteur : LESSON_DEVELOPMENT_GUIDE › « Synthesis in the mission player ».
  studentView: 'mission',
  // LA MISSION d'une synthèse : rien à gagner — les clés des leçons de l'unité sont à l'élève DÈS le premier écran ; chaque وضعية تدريبية allume
  // les clés qu'elle UTILISE. Pas de point d'étape ; « وضعية الوحدة » (module 7) puis « التحدّي 🏆 » (module 8). L'ouverture n'a aucun chiffre ni
  // la وضعية (balayage par rôle : content/forbidden.js, content/mission.test.js). La scène : le guichet du club (`club-counter`).
  mission: {
    scene: 'club-counter',
    title: 'مهمّة الوحدة',
    opening: {
      text: 'عند باب النادي لوحتان: ثمن لكل حصّة، أو اشتراك يُدفع مرّة واحدة ثم ثمن أصغر لكل حصّة. أيّهما أفضل لك؟ مفاتيح الوحدة كلّها معك.',
      cta: 'أجرّب',
    },
    toolsOwned: true,
    tools: [
      // les ids sont des connaissances des leçons de l'unité ; `usedIn` : les modules qui s'en servent
      { id: 'hal-ax-b', icon: '✂️', label: 'حلّ معادلة من الدرجة الأولى', usedIn: [3, 4] },
      { id: 'khassiya-jidaa-maadum', icon: '🎯', label: 'خاصية الجداء المعدوم', usedIn: [2] },
      { id: 'qawaid-ittijah', icon: '🔄', label: 'قواعد اتجاه المتراجحة', usedIn: [1, 2, 4, 5, 6, 7] },
      { id: 'tarrid-mutarajiha', icon: '📏', label: 'مشكلة تترجمها متراجحة', usedIn: [1, 3, 7] },
      { id: 'tahaqquq-waqi', icon: '✅', label: 'حلّ يلائم الواقع', usedIn: [1, 5, 7] },
    ],
    checkpoints: [],
    climaxModule: 8,
    stationLabels: { 7: 'وضعية الوحدة', 8: 'التحدّي 🏆' },
    trainings: [1, 2, 3, 4, 5, 6],
    hideStars: true,
    // la somme HONNÊTE des modules (6 + 38 + 28 + 6), en deux séances ; le catalogue (`estimatedDurationMin`) n'est pas touché
    durationMin: 78,
    sittings: 2,
    resumeInside: true,
  },
  title: 'أدمج تعلّماتي — المعادلات والمتراجحات',
  description: 'ست وضعيات تدريبية (مكتبة، ورقة نادي الرياضيات، حصّالتان، حديقة، رحلة، سجّادتان) تعبّئ المعادلات والجداء المعدوم والمتراجحات وتمثيل حلولها وترييض النص، ثم وضعية الوحدة وتحليلها، ثم التحدّي.',
  level: 'moyen',
  grade: '4am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان أنساب الأعداد والحساب',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🏊',
  estimatedDurationMin: 90,
  textbookRef: { unit: 4, pages: '52' },
  skills: [
    'حل ست وضعيات تدريبية من نوع الامتحان بتجنيد المعادلات والجداء المعدوم والمتراجحات وتمثيل حلولها',
    'تجنيد مكتسبات الوحدة (المعادلات، الجداء المعدوم، المتراجحات وتمثيل حلولها) لحل وضعيات مركبة وتنافسية',
    'ترجمة صيغ تسعير أو اشتراك بعبارات حرفية بدلالة عدد الحصص',
    'كتابة متراجحة للمفاضلة بين خيارين، حلها، وتفسير النتيجة للوصول إلى الخيار الأفضل',
  ],
  teachingScope: {
    include: ['ست وضعيات تدريبية حول المعادلات والمتراجحات', 'وضعية الاختبار النهائي: المسبح البلدي وتحليلها في ثلاث مراحل'],
    exclude: ['أي مفهوم جديد', 'المتراجحات من الدرجة الثانية (الحدود $x^2$ تختفي من الطرفين في كل تمارين الكتاب)'],
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // La carte TOUTE OUVERTE (règle des pilotes, propriétaire 2026-11-08) : elle parle EN LETTRES — aucun nombre de la وضعية ni du défi
  // (knowledgeGraph.js, content/mission.test.js).
  knowledgeMapOpen: true,
  // Ce que la situation mobilise, diagnostiqué par « أستعدّ » (affirmations de la
  // plateforme : les items du manuel sont ceux des leçons 1–3) : résoudre une équation (درس 1), le produit
  // nul (درس 2), résoudre une inéquation (درس 3) et la représenter (درس 3), traduire un texte (درس 4),
  // développer / factoriser (الوحدة 3).
  priorKnowledge: ['hall-muadala', 'jidaa-maadum-khassiya', 'hall-mutarajiha', 'tamthil-hulul', 'tarrid-tarjama', 'nashr-tahlil'],
  resources: [
    // Modules 1–6 — six وضعيات d'entraînement (content/problems.js), ajouts de la plateforme de type امتحان ;
    // le module 7 analyse la situation évaluée au module 8.
    { kind: 'situation', code: 'wadiya-1', module: 1, title: 'وضعية 1 — بطاقة المكتبة: 450x أم 3000 + 300x', learningPointIds: ['4am_wadiya-idmajiya-muadalat_P2', '4am_wadiya-idmajiya-muadalat_P1'] },
    { kind: 'situation', code: 'wadiya-2', module: 2, title: 'وضعية 2 — ورقة نادي الرياضيات: النشر والتحليل والمقارنة', learningPointIds: ['4am_wadiya-idmajiya-muadalat_P1'] },
    { kind: 'situation', code: 'wadiya-3', module: 3, title: 'وضعية 3 — حصّالتا سمير وياسين: 1200 + 150x و 800 + 250x', learningPointIds: ['4am_wadiya-idmajiya-muadalat_P2', '4am_wadiya-idmajiya-muadalat_P1'] },
    { kind: 'situation', code: 'wadiya-4', module: 4, title: 'وضعية 4 — حديقة يوم الشجرة: محيط 4x + 16', learningPointIds: ['4am_wadiya-idmajiya-muadalat_P2', '4am_wadiya-idmajiya-muadalat_P1'] },
    { kind: 'situation', code: 'wadiya-5', module: 5, title: 'وضعية 5 — رحلة النادي: شرطان على عدد المشاركين', learningPointIds: ['4am_wadiya-idmajiya-muadalat_P2', '4am_wadiya-idmajiya-muadalat_P1'] },
    { kind: 'situation', code: 'wadiya-6', module: 6, title: 'وضعية 6 — سجّادتا المصلّى: (x + 2)² و x(x + 6)', learningPointIds: ['4am_wadiya-idmajiya-muadalat_P1'] },
    { kind: 'situation', code: 'situation-masbah-baladi', module: 7, title: 'وضعية: المسبح البلدي', learningPointIds: ['4am_wadiya-idmajiya-muadalat_P2', '4am_wadiya-idmajiya-muadalat_P1'], sourceElementIds: ['situation'] },
    // Module 7 — le labo de l'unité (growth-race) sur deux tarifs FRÈRES (content/rounds.js) : l'élève CONSTRUIT chaque formule en portant « × x »
    // sur ce qui se paie à chaque séance, puis ÉTIRE x. Lecteur : deux manches ; page : les deux mêmes tarifs, deux niveaux.
    {
      kind: 'manipulation', code: 'growth-race-qaat-riyada', type: 'growth-race', module: 7, level: 'beginner',
      title: 'قاعة الرياضة: 60x أم 300 + 10x؟',
      objective: 'المفاضلة بين صيغتين: نترجم كل صيغة بعبارة حرفية بدلالة عدد الحصص x، ونبحث عن أصغر عدد x تجعل فيه الثانية أقلّ تكلفة',
      autonomy: '',
      experience: { type: 'platform_adaptation', reason: 'smaller_numbers_for_first_contact', theme: 'pool' },
      learningPointIds: ['4am_wadiya-idmajiya-muadalat_P2'],
      sourceElementIds: ['situation'],
    },
    {
      kind: 'manipulation', code: 'growth-race-nadi-rimaya', type: 'growth-race', module: 7, level: 'advanced',
      title: 'نادي الرماية: 45x أم 150 + 15x؟',
      objective: 'المفاضلة بين صيغتين: نترجم كل صيغة بعبارة حرفية بدلالة عدد الحصص x، ونبحث عن أصغر عدد x تجعل فيه الثانية أقلّ تكلفة',
      autonomy: 'ما توفّره الصيغة الثانية في كل حصّة يسترجع الاشتراك عند لحظة التساوي: يبني التلميذ هذه المساواة بالأعداد، ثم يقرّر أيّ عدد هو الجواب',
      experience: { type: 'platform_adaptation', reason: 'multiple_representations', theme: 'pool' },
      learningPointIds: ['4am_wadiya-idmajiya-muadalat_P2', '4am_wadiya-idmajiya-muadalat_P1'],
      sourceElementIds: ['situation'],
    },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'عشر عبارات: صحيح أم خاطئ؟ المعادلة، الجداء المعدوم، المتراجحة والترييض — من السهل إلى الأصعب.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    // Les وضعيات d'entraînement (track: 'problem') : practice_lab, avant la situation du مسبح (module 7)
    // et le test (module 8, toujours ouvert). Elles comptent dans la complétion, jamais dans la maîtrise —
    // docs/lessons/MASAIL_GENERATION_GUIDE.md, §14 (synthèses).
    { id: '01', number: 1, slug: 'wadiya-1', path: `${LESSON_BASE_PATH}/wadiya-1`,
      title: 'الوضعية التدريبية 1 — بطاقة المكتبة', desc: 'صيغتان لشراء الكتب (450x أو 3000 + 300x): تكلفة 12 كتابًا، ثم ابتداءً من أي عدد تكون الصيغة (ب) أفضل؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-muadalat_P1', '4am_wadiya-idmajiya-muadalat_P2'],
      color: 'sky', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '02', number: 2, slug: 'wadiya-2', path: `${LESSON_BASE_PATH}/wadiya-2`,
      title: 'الوضعية التدريبية 2 — ورقة نادي الرياضيات', desc: 'نشر عبارة وتحليلها، المعادلة E = 0، ثم المتراجحة E < B وتمثيل حلولها.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-muadalat_P1', '4am_wadiya-idmajiya-muadalat_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '03', number: 3, slug: 'wadiya-3', path: `${LESSON_BASE_PATH}/wadiya-3`,
      title: 'الوضعية التدريبية 3 — حصّالتا سمير وياسين', desc: 'متى يتساوى المبلغان؟ ومتى يتفوّق ياسين؟ وبعد كم أسبوعًا يكفي المجموع لشراء الكسوة؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-muadalat_P1', '4am_wadiya-idmajiya-muadalat_P2'],
      color: 'amber', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '04', number: 4, slug: 'wadiya-4', path: `${LESSON_BASE_PATH}/wadiya-4`,
      title: 'الوضعية التدريبية 4 — حديقة يوم الشجرة', desc: 'محيط حديقة مستطيلة بدلالة x: معادلة (72 م من الشبك) ثم متراجحة (100 م على الأكثر).',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-muadalat_P1', '4am_wadiya-idmajiya-muadalat_P2'],
      color: 'emerald', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '05', number: 5, slug: 'wadiya-5', path: `${LESSON_BASE_PATH}/wadiya-5`,
      title: 'الوضعية التدريبية 5 — رحلة النادي', desc: 'تكلفة رحلة ومبلغ محصَّل: متراجحتان معًا تعيّنان عدد التلاميذ المشاركين.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-muadalat_P1', '4am_wadiya-idmajiya-muadalat_P2'],
      color: 'teal', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '06', number: 6, slug: 'wadiya-6', path: `${LESSON_BASE_PATH}/wadiya-6`,
      title: 'الوضعية التدريبية 6 — سجّادتا المصلّى', desc: 'مساحة مربّع ومستطيل: نشر، الفرق B − A، ثم المتراجحة B > A.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-muadalat_P1', '4am_wadiya-idmajiya-muadalat_P2'],
      color: 'rose', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '07', number: 7, slug: 'al-wadiya', path: `${LESSON_BASE_PATH}/al-wadiya`,
      title: 'الوضعية وتحليلها', desc: 'جولتان (قاعة الرياضة ثم نادي الرماية)، ثم وضعية الوحدة: المعطيات، المطلوب، المتراجحة، وورقة زكريا — دون حلّها بعد.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_wadiya-idmajiya-muadalat_P2', '4am_wadiya-idmajiya-muadalat_P1'],
      color: 'amber', style: 'featured', estimatedMin: 28, difficulty: 3, actionText: 'أحلّل الوضعية' },
    { id: '08', number: 8, slug: 'ahill', path: `${LESSON_BASE_PATH}/ahill`,
      title: 'وضعية الاختبار النهائي', desc: 'خمس مراحل تُقيَّم: عبارتا الصيغتين، المتراجحة، حلها، لحظة التساوي، ثم الصيغة الأفضل.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 4, actionText: 'أحلّ' },
  ],
};
