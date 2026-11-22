/**
 * أدمج تعلّماتي — الوحدة 10 « حساب المثلثات في المثلث القائم » (kind: synthesis)
 * Manuel 4AM, unité 10 : « أدمج تعلّماتي » (وضعية « مقام الشهيد » + تحليل الوضعية, p. 124) — extraction.json › destinations.
 * Ce n'est PAS un cinquième درس.
 *
 * Depuis le 2026-10-13 (modèle : unité 1, `wadiya-idmajiya-aadad`, MASAIL_GENERATION_GUIDE §14) : « أستعدّ » (module 0),
 * six « وضعيات تدريبية » (modules 1 à 6, `content/problems.js`, ajouts de la plateforme de type امتحان),
 * « تحليل الوضعية النهائية للاختبار » (module 7, la وضعية du manuel lue et analysée, rien n'est résolu à la place de
 * l'élève) puis « وضعية الاختبار النهائي » (module 8, la وضعية TRANSPOSÉE). « أؤكّد تعلّماتي » (QCM) et « أتعمّق » ne font
 * plus partie de la synthèse (décision du propriétaire, 2026-10-13).
 *
 * Le parcours, phase par phase :
 *   RÉEL / DÉCOUVRIR / MANIPULER / COMPRENDRE / TOUCHER LES MATHS / FORMALISER   module 7 — أريس veut la hauteur de
 *                      مقام الشهيد (Alger) avec un poteau électrique de 2,30 m : UN workspace, le lab `clinometer` (mode
 *                      « align », monde `maqam`) réutilisé de la leçon 4 ; h ÷ 2,30 = 98,1 ÷ 2,45 ⇒ h ≈ 92,09 m ;
 *                      tan x = 2,30 ÷ 2,45 ⇒ x ≈ 43° ; les briques-rappels et les trois phases du manuel
 *   S'ENTRAÎNER        modules 1 à 6 — six situations complètes (l'ombre d'un arbre, un téléphérique, un cerf-volant, une
 *                      salle de lecture, trois sentiers, la largeur d'un oued)
 *   TRANSFÉRER         module 8 — la وضعية TRANSPOSÉE (la minaret de جامع الجزائر, un conteneur) en « إختبار أولي »
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/handasa/wadiya-idmajiya-muthallathat';

export const LESSON_CONFIG = {
  id: 'wadiya-idmajiya-muthallathat',
  kind: 'synthesis',
  unit: 'hisab-muthallathat',
  unitTitle: 'حساب المثلثات في المثلث القائم',
  sequentialUnlock: true,
  title: 'أدمج تعلّماتي — إدماج المعارف والحل المنهجي للوضعية المركبة',
  description: 'إدماج المعارف: ست وضعيات تدريبية (ظلّ شجرة، تلفريك، طائرة ورقية، قاعة مطالعة، مسارات هضبة، عرض وادٍ) ثم ارتفاع «مقام الشهيد» بعمود كهربائي وخط نظر (خاصية طالس ثم الظل)، ثم تحليل الوضعية النهائية بالمنهج (قراءة · تحليل · تنفيذ) ووضعية الاختبار النهائي: مئذنة بعمود إنارة وحاوية.',
  level: 'moyen',
  grade: '4am',
  chapter: 'handasa',
  chapterTitle: 'ميدان الهندسة',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🏛️',
  estimatedDurationMin: 69,
  textbookRef: { unit: 10, pages: '124' },
  skills: [
    'تجنيد خاصية طالس والنسب المثلثية والحاسبة لحل وضعية واقعية مركبة: ارتفاع «مقام الشهيد» وقيس زاوية خط النظر',
    'قراءة الوضعية وتحليلها: تحديد المعطيات والمطلوب، ورسم المثلث القائم أو المثلثين في وضعية طالس داخل الواقع أو داخل مجسّم',
    'اختيار المساواة المناسبة وتنفيذها: حساب الأطوال والزوايا وتدوير النتائج في آخر الحساب والتحقّق من ملاءمتها للواقع',
  ],
  teachingScope: {
    include: ['ست وضعيات تدريبية من نوع الامتحان تعبّئ النسب المثلثية وخاصيتي طالس وفيثاغورس', 'تحليل الوضعية النهائية للاختبار: وضعية «مقام الشهيد» في ثلاث مراحل', 'وضعية الاختبار النهائي: مئذنة جامع الجزائر وحاوية'],
    exclude: ['أي مفهوم جديد', 'العلاقات المثلثية في مثلث غير قائم'],
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Ce que la وضعية et le test final mobilisent, diagnostiqué par « أستعدّ » (affirmations de la
  // plateforme) : Thalès dans une ligne de visée (unité 9), les définitions des rapports (درس 1), l'inconnue au
  // dénominateur (درس 4), la touche inverse de la calculatrice (درس 2), Pythagore dans un solide, l'arrondi,
  // la relation cos² + sin² = 1 (درس 3).
  priorKnowledge: ['talis-nazar', 'nisab-tarif', 'majhul-maqam', 'hasiba-aks', 'fithaghuris-fada', 'tadwir', 'alaqa-asasiya'],
  resources: [
    { kind: 'situation', code: 'situation-maqam-echahid', module: 7, title: 'وضعية: ارتفاع «مقام الشهيد»', learningPointIds: ['4am_wadiya-idmajiya-muthallathat_P1', '4am_wadiya-idmajiya-muthallathat_P2', '4am_wadiya-idmajiya-muthallathat_P3'], sourceElementIds: ['situation'] },
    // Modules 1–6 — six وضعيات d'entraînement (content/problems.js), ajouts de la plateforme de type امتحان ;
    // le module 7 analyse la وضعية du manuel, le module 8 est la situation évaluée.
    { kind: 'situation', code: 'wadiya-1', module: 1, title: 'وضعية 1 — ظلّ شجرة طولها 8 م وأشعة الشمس', learningPointIds: ['4am_wadiya-idmajiya-muthallathat_P1', '4am_wadiya-idmajiya-muthallathat_P2', '4am_wadiya-idmajiya-muthallathat_P3'] },
    { kind: 'situation', code: 'wadiya-2', module: 2, title: 'وضعية 2 — تلفريك على مرحلتين (600 م بزاوية 28°)', learningPointIds: ['4am_wadiya-idmajiya-muthallathat_P1', '4am_wadiya-idmajiya-muthallathat_P2', '4am_wadiya-idmajiya-muthallathat_P3'] },
    { kind: 'situation', code: 'wadiya-3', module: 3, title: 'وضعية 3 — طائرة ورقية وخيط طوله 50 م', learningPointIds: ['4am_wadiya-idmajiya-muthallathat_P1', '4am_wadiya-idmajiya-muthallathat_P2', '4am_wadiya-idmajiya-muthallathat_P3'] },
    { kind: 'situation', code: 'wadiya-4', module: 4, title: 'وضعية 4 — كابل في قاعة مطالعة 4 م × 3 م × 2,4 م', learningPointIds: ['4am_wadiya-idmajiya-muthallathat_P1', '4am_wadiya-idmajiya-muthallathat_P2', '4am_wadiya-idmajiya-muthallathat_P3'] },
    { kind: 'situation', code: 'wadiya-5', module: 5, title: 'وضعية 5 — ثلاثة مسارات تصعد هضبة', learningPointIds: ['4am_wadiya-idmajiya-muthallathat_P1', '4am_wadiya-idmajiya-muthallathat_P2', '4am_wadiya-idmajiya-muthallathat_P3'] },
    { kind: 'situation', code: 'wadiya-6', module: 6, title: 'وضعية 6 — عرض وادٍ بخاصية طالس', learningPointIds: ['4am_wadiya-idmajiya-muthallathat_P1', '4am_wadiya-idmajiya-muthallathat_P2', '4am_wadiya-idmajiya-muthallathat_P3'] },
    // Module 7 — مبتدئ : un réverbère de 3 m planté à 89 m du مقام (nombres de la plateforme, alignement à 3 m : tan x = 1).
    {
      kind: 'manipulation', code: 'clinometer-maqam-mubtadi', type: 'clinometer', module: 7, level: 'beginner',
      title: 'عمود إنارة طوله 3 أمتار على بعد 89 مترا من «مقام الشهيد»',
      objective: 'ترييض خط النظر بمثلثين في وضعية طالس ثم بمثلث قائم: حساب ارتفاع لا نصل إليه وقيس زاوية النظر',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'smaller_numbers_for_first_contact', theme: 'maqam' },
      learningPointIds: ['4am_wadiya-idmajiya-muthallathat_P1', '4am_wadiya-idmajiya-muthallathat_P2'],
      sourceElementIds: ['situation'],
    },
    // Module 7 — متقدم : la وضعية du manuel (poteau 2,30 m à 95,65 m, أريس à 2,45 m du poteau).
    {
      kind: 'manipulation', code: 'clinometer-maqam-wadiya', type: 'clinometer', module: 7, level: 'advanced',
      title: 'وضعية الكتاب: عمود كهربائي طوله 2,30 مترا على بعد 95,65 مترا من «مقام الشهيد»',
      objective: 'ترييض خط النظر بمثلثين في وضعية طالس ثم بمثلث قائم: حساب ارتفاع لا نصل إليه وقيس زاوية النظر',
      autonomy: 'وضعية الكتاب: أعداد عشرية وموضع غير مقترح؛ التلميذ يبحث بنفسه عن المكان الذي يختفي فيه رأس المقام خلف رأس العمود، ثم يقرأ المثلثين ويحسب الارتفاع والزاوية ويدوّر في آخر الحساب',
      experience: { type: 'textbook', reason: '', theme: 'maqam' },
      learningPointIds: ['4am_wadiya-idmajiya-muthallathat_P1', '4am_wadiya-idmajiya-muthallathat_P2', '4am_wadiya-idmajiya-muthallathat_P3'],
      sourceElementIds: ['situation'],
    },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'سبع عبارات: صحيح أم خاطئ؟ خاصية طالس في خط النظر، تعريف النسب المثلثية، مجهول في المقام، الحاسبة، فيثاغورس في مجسّم، التدوير، والعلاقة بين الجيب وجيب التمام.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    // Les وضعيات d'entraînement (track: 'problem') : practice_lab, avant la وضعية du manuel (module 7) et la situation
    // évaluée (module 8). Elles comptent dans la complétion, jamais dans la maîtrise — MASAIL_GENERATION_GUIDE.md, §14.
    { id: '01', number: 1, slug: 'wadiya-1', path: `${LESSON_BASE_PATH}/wadiya-1`,
      title: 'الوضعية التدريبية 1 — ظلّ شجرة الزيتون', desc: 'شجرة طولها 8 م وظلّها 6 م: زاوية أشعة الشمس، ثم الظلّ بعد الظهر عند 35°.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-muthallathat_P1', '4am_wadiya-idmajiya-muthallathat_P2', '4am_wadiya-idmajiya-muthallathat_P3'],
      color: 'sky', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '02', number: 2, slug: 'wadiya-2', path: `${LESSON_BASE_PATH}/wadiya-2`,
      title: 'الوضعية التدريبية 2 — التلفريك', desc: 'كابلان متتاليان: الارتفاع والبعد الأفقي بالجيب وجيب التمام، ثم الزاوية بالظل وفيثاغورس.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-muthallathat_P1', '4am_wadiya-idmajiya-muthallathat_P2', '4am_wadiya-idmajiya-muthallathat_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '03', number: 3, slug: 'wadiya-3', path: `${LESSON_BASE_PATH}/wadiya-3`,
      title: 'الوضعية التدريبية 3 — الطائرة الورقية', desc: 'خيط 50 م وارتفاع 30 م: الجيب، جيب التمام والظل بالعلاقة الأساسية، ثم الزاوية.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-muthallathat_P1', '4am_wadiya-idmajiya-muthallathat_P2', '4am_wadiya-idmajiya-muthallathat_P3'],
      color: 'violet', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '04', number: 4, slug: 'wadiya-4', path: `${LESSON_BASE_PATH}/wadiya-4`,
      title: 'الوضعية التدريبية 4 — كابل قاعة المطالعة', desc: 'قطر متوازي مستطيلات 4 م × 3 م × 2,4 م: فيثاغورس مرتين، اختيار القطعة، وزاوية الكابل.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-muthallathat_P1', '4am_wadiya-idmajiya-muthallathat_P2', '4am_wadiya-idmajiya-muthallathat_P3'],
      color: 'amber', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '05', number: 5, slug: 'wadiya-5', path: `${LESSON_BASE_PATH}/wadiya-5`,
      title: 'الوضعية التدريبية 5 — مسارات الهضبة', desc: 'جدول لثلاثة مسارات: زاوية كل مسار، المناسب للمبتدئين، ثم مسار جديد بزاوية 18°.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-muthallathat_P1', '4am_wadiya-idmajiya-muthallathat_P2', '4am_wadiya-idmajiya-muthallathat_P3'],
      color: 'teal', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '06', number: 6, slug: 'wadiya-6', path: `${LESSON_BASE_PATH}/wadiya-6`,
      title: 'الوضعية التدريبية 6 — عرض الوادي', desc: 'طالس لحساب العرض، ثم الظل لحساب الزاوية، وفيثاغورس لطول الحبل.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-muthallathat_P1', '4am_wadiya-idmajiya-muthallathat_P2', '4am_wadiya-idmajiya-muthallathat_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 5, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '07', number: 7, slug: 'al-wadiya', path: `${LESSON_BASE_PATH}/al-wadiya`,
      title: 'تحليل الوضعية النهائية للاختبار', desc: 'ارتفاع «مقام الشهيد» بعمود كهربائي وخط نظر: قراءة الوضعية، اختيار خاصية طالس ثم الظل، حساب الارتفاع وقيس الزاوية x وتدويرهما، والتحقّق من ملاءمة النتيجة.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_wadiya-idmajiya-muthallathat_P1', '4am_wadiya-idmajiya-muthallathat_P2', '4am_wadiya-idmajiya-muthallathat_P3'],
      color: 'amber', style: 'featured', estimatedMin: 20, difficulty: 3, actionText: 'أقرأ الوضعية' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'وضعية الاختبار النهائي', desc: 'وضعية أخرى: مئذنة جامع الجزائر بعمود إنارة، وقطر حاوية.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 8, difficulty: 4, actionText: 'أحلّ' },
  ],
};
