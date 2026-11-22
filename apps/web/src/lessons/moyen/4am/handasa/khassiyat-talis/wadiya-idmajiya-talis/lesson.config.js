/**
 * أدمج تعلّماتي — الوحدة 9 « خاصية طالس » (kind: synthesis)
 * Manuel 4AM, unité 9 : « أدمج تعلّماتي » (وضعية الأسطوانة داخل المخروط + تحليل الوضعية, p. 112) et — doublon DÉCLARÉ de
 * la page d'unité — le تحدّ (la minaret, p. 103) et l'encadré « طالس » (extraction.json › destinations). Ce n'est PAS un
 * quatrième درس.
 *
 * Format de l'unité 1 (`wadiya-idmajiya-aadad`), décision du propriétaire du 2026-10-13, et RIEN d'autre : 0 أستعدّ ·
 * 1–6 « الوضعية التدريبية N » (`track: 'problem'`, content/problems.js, ajouts de la plateforme `exam_style_problem`) ·
 * 7 « تحليل الوضعية النهائية للاختبار » (lire et analyser, `al-wadiya`) · 8 « وضعية الاختبار النهائي » (`itqan`, le test).
 * Aucun autre module (remap : out/wadiya-idmajiya-talis-remap2.json).
 *
 * Le parcours du module 7 (l'ancien module 1) :
 *   RÉEL               la minaret du quartier (le تحدّ) puis le cornet et son pot (la وضعية)
 *   DÉCOUVRIR          étapes 1, 3, 4 : la méthode de l'ombre, ce que demande la وضعية, quelle figure plane
 *   MANIPULER          UN workspace, deux labs : مبتدئ `shadow-world` (« ساحة الحيّ » : l'élève tient le soleil,
 *                      mesure, parie, ÉCRIT sa loi que le monde réfute puis confirme, et trouve la minaret) ; متقدم `cone-cylinder` (h et r tenus
 *                      par la main, le cône refuse le cylindre qui le perce)
 *   COMPRENDRE         étapes 2 et 5 : deux triangles de sommet O, côtés parallèles
 *   TOUCHER LES MATHS  étapes 6 à 8 : r ÷ 6 = (18 − h) ÷ 18, 24r = 108, V = 91,125π
 *   FORMALISER         les briques et les trois phases du manuel (قراءة · تحليل · تنفيذ), la vérification
 *   TRANSFÉRER         module 8 — la وضعية et le تحدّ TRANSPOSÉS (autres nombres) : le test final
 *
 * Rétrofit du 2026-10-15 (synthèse : format fixe, retouches minimales) : le module 7 s'ouvre sur le labo (plus de carte au-dessus, plus de
 * titre / lead de workspace) ; l'énoncé du manuel (ex-carte) ouvre l'étape 3 « قراءة الوضعية » ; toutes les briques étaient déjà
 * APRÈS leur réponse.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/handasa/wadiya-idmajiya-talis';

export const LESSON_CONFIG = {
  id: 'wadiya-idmajiya-talis',
  kind: 'synthesis',
  unit: 'khassiyat-talis',
  unitTitle: 'خاصية طالس',
  sequentialUnlock: true,
  // Regard de l'élève : 'mission' (la PREMIÈRE synthèse convertie, pilote du recette « synthèse », 2026-11-10 — décisions S et verdict C,
  // docs/reports/MISSION_ROLLOUT_PROGRESS.md › « Unit 9, synthesis ») ; l'enseignant et le mode classe gardent la page (le module 7 garde son
  // workspace). Les champs du moteur (`toolsOwned`, `usedIn`, `stationLabels`, `trainings`, `hideStars`, `durationMin`, `sittings`,
  // `resumeInside`) : LESSON_DEVELOPMENT_GUIDE › « Synthesis in the mission player ».
  studentView: 'mission',
  // LA MISSION d'une synthèse : rien à gagner — les cinq clés de l'unité sont à l'élève DÈS le premier écran ; chaque وضعية تدريبية allume les clés
  // qu'elle UTILISE. Pas de point d'étape ; « وضعية الوحدة » (module 7) puis « التحدّي 🏆 » (module 8, jamais retouché). L'ouverture n'a aucun
  // chiffre (balayage par rôle : content/forbidden.js, content/mission.test.js). La scène : la place à l'heure de l'ombre (`shadow-square`).
  mission: {
    scene: 'shadow-square',
    title: 'مهمّة الوحدة',
    opening: {
      text: 'كيف نعرف ارتفاع مئذنة دون أن نصعدها؟ وكيف نحسب حجم أسطوانة داخل مخروط حين يتساوى ارتفاعها ونصف قطرها؟ عندك كلّ المفاتيح — هل تعرف متى تستعمل كلًّا منها؟',
      cta: 'أجرّب',
    },
    toolsOwned: true,
    tools: [
      { id: 'hisab-atwal', icon: '📏', label: 'حساب طول بخاصية طالس', usedIn: [1, 2, 4, 5, 6, 7] },
      { id: 'muamil-tanasub', icon: '🔍', label: 'معامل التناسبية', usedIn: [6] },
      { id: 'khassiya-aksiya', icon: '🪜', label: 'الخاصية العكسية: إثبات التوازي', usedIn: [5] },
      { id: 'tariqa-adam-tawazi', icon: '⚖️', label: 'إثبات عدم التوازي', usedIn: [2] },
      { id: 'taqsim-qitaa', icon: '✂️', label: 'تقسيم قطعة إلى قطع متقايسة', usedIn: [3] },
    ],
    checkpoints: [],
    climaxModule: 8,
    stationLabels: { 7: 'وضعية الوحدة', 8: 'التحدّي 🏆' },
    trainings: [1, 2, 3, 4, 5, 6],
    hideStars: true,
    // la somme HONNÊTE des modules (6 + 39 + 30 + 7), en deux séances ; le catalogue (`estimatedDurationMin`) n'est pas touché
    durationMin: 82,
    sittings: 2,
    resumeInside: true,
  },
  title: 'أدمج تعلّماتي — ترييض وضعيات هندسية مركبة بتوظيف خاصية طالس',
  description: 'إدماج المعارف: ست وضعيات تدريبية (سارية العلم بظلّ عصا، عارضة رفّ والتوازي، قسمة ممرّ إلى حصص متساوية، شمعة داخل علبة مخروطية، عرض بحيرة، زربية مصغّرة) ثم تجنيد خاصية طالس وعكسيتها في وضعيات مركبة — ارتفاع مئذنة بطريقة الظل، أسطوانة داخل مخروط (مقطع محوري، معادلة، حجم)، عرض نهر — بتحليلها المنهجي (قراءة · تحليل · تنفيذ)، ثم وضعية الاختبار النهائي.',
  level: 'moyen',
  grade: '4am',
  chapter: 'handasa',
  chapterTitle: 'ميدان الهندسة',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🕌',
  estimatedDurationMin: 31,
  textbookRef: { unit: 9, pages: '103, 112' },
  skills: [
    'تجنيد خاصية طالس وعكسيتها لحل وضعيات واقعية مركبة: ارتفاع مئذنة بطريقة الظل، عرض نهر',
    'ربط المجسّمات (المخروط والأسطوانة) بمقطعها المحوري، وصياغة معادلة لحساب بُعد ثم حجم',
    'اختيار استراتيجية الحل وتنفيذها والتحقّق من ملاءمة النتيجة للواقع',
  ],
  teachingScope: {
    include: ['ست وضعيات تدريبية تجنّد دروس الوحدة الثلاثة (خاصية طالس، عكسيتها، الإنشاءات)', 'تحدّ الوحدة: ارتفاع المئذنة بطريقة الظل', 'تحليل الوضعية النهائية للاختبار: الأسطوانة داخل المخروط في ثلاث مراحل', 'وضعية الاختبار النهائي: وضعية أخرى بأعداد أخرى'],
    exclude: ['أي مفهوم جديد', 'حجم المخروط وحساب القيمة العظمى لحجم الأسطوانة'],
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // La carte TOUTE OUVERTE (règle des pilotes, propriétaire 2026-11-08) : ses cartes et ses exemples n'ont AUCUN nombre de la وضعية de l'unité ni du
  // défi (content/textbook.js › CARD, content/mission.test.js).
  knowledgeMapOpen: true,
  // Ce que le تحدّ, la وضعية et le test final mobilisent, diagnostiqué par « أستعدّ » (affirmations
  // de la plateforme) : Thalès (درس 1) et sa réciproque (درس 2), le quatrième proportionnel, la coupe axiale d'un
  // cône, le volume d'un cylindre, une équation du premier degré, les médianes d'un triangle.
  // (2026-11-10 : « أستعدّ » diagnostique désormais les trois leçons de l'unité ; les médianes, qu'aucune étape n'emploie, sont retirées)
  priorKnowledge: ['talis-mubashira', 'talis-aksiya', 'rabi-mutanasib', 'maqta-mihwari', 'hajm-ustuwana', 'muadala-ula'],
  resources: [
    { kind: 'situation', code: 'situation-ustuwana-makhrut', module: 7, title: 'وضعية: أسطوانة داخل مخروط', learningPointIds: ['4am_wadiya-idmajiya-talis_P2', '4am_wadiya-idmajiya-talis_P3'], sourceElementIds: ['situation'] },
    // Module 7 — مبتدئ : le تحدّ de la page d'unité (doublon déclaré), sur `shadow-world` (monde `minaret`, 2026-10-13).
    {
      kind: 'manipulation', code: 'shadow-world-midhana', type: 'shadow-world', module: 7, level: 'beginner',
      title: 'تحدّ الوحدة في ساحة الحيّ: الشمس والظلال وارتفاع المئذنة',
      objective: 'ترييض وضعية بمثلثين في وضعية طالس وحل معادلة لإيجاد طول غير مباشر',
      autonomy: 'عالم كامل بدل سكّة واحدة: التلميذ يحرّك الشمس الحقيقية (الجزائر، 13 أكتوبر)، يقيس الظلال، يتوقّع ظلّ ما تنصبه البلدية، ويكتب قاعدته بنفسه فيختبرها العالم على كل الأشياء ويُسقطها حين تتحرّك الشمس؛ مقران يسأل ولا يُجيب. طريقة الظلّين اللذين ينتهيان معًا تظهر حين يغرس العصا على حافة ظلّ المئذنة',
      experience: { type: 'textbook', reason: '', theme: 'minaret' },
      learningPointIds: ['4am_wadiya-idmajiya-talis_P1'],
      sourceElementIds: ['challenge'],
    },
    // Module 7 — متقدم : la وضعية du manuel sur `cone-cylinder` (monde `cornet`, décor seulement).
    {
      kind: 'manipulation', code: 'cone-cylinder-wadiya', type: 'cone-cylinder', module: 7, level: 'advanced',
      title: 'الوضعية: أسطوانة داخل مخروط ارتفاعه 18 ونصف قطر قاعدته 6',
      objective: 'ترييض وضعية بمثلثين في وضعية طالس وحل معادلة لإيجاد طول غير مباشر',
      autonomy: 'بعدان تمسكهما اليد بدل بُعد واحد (طول الأسطوانة ونصف قطرها)، والمخروط يرفض كل أسطوانة تخرقه؛ لا مكان مقترح: التلميذ يبحث بنفسه عن الأسطوانات المحاطة، ثم عن الأسطوانة التي يتساوى فيها h و r، ويقرأ حجمها',
      experience: { type: 'textbook', reason: '', theme: 'cornet' },
      learningPointIds: ['4am_wadiya-idmajiya-talis_P2', '4am_wadiya-idmajiya-talis_P3'],
      sourceElementIds: ['situation'],
    },
    // Modules 1–6 — six وضعيات d'entraînement (content/problems.js), ajouts de la plateforme ; chacune mobilise les
    // leçons de l'unité (ombre, réciproque, partage d'un segment, cylindre dans un cône, papillon, coefficient k).
    { kind: 'situation', code: 'wadiya-1', module: 1, title: 'وضعية 1 — ارتفاع سارية العلم بظلّ عصا طولها 1,2 م', learningPointIds: ['4am_wadiya-idmajiya-talis_P1'] },
    { kind: 'situation', code: 'wadiya-2', module: 2, title: 'وضعية 2 — عارضة رفّ: هل هي موازية للأرض؟', learningPointIds: ['4am_wadiya-idmajiya-talis_P1'] },
    { kind: 'situation', code: 'wadiya-3', module: 3, title: 'وضعية 3 — قسمة ممرّ طوله 11 م إلى خمس حصص متساوية', learningPointIds: ['4am_wadiya-idmajiya-talis_P1'] },
    { kind: 'situation', code: 'wadiya-4', module: 4, title: 'وضعية 4 — شمعة أسطوانية داخل علبة مخروطية', learningPointIds: ['4am_wadiya-idmajiya-talis_P2', '4am_wadiya-idmajiya-talis_P3'] },
    { kind: 'situation', code: 'wadiya-5', module: 5, title: 'وضعية 5 — عرض بحيرة: التوازي ثم المسافة AB', learningPointIds: ['4am_wadiya-idmajiya-talis_P1'] },
    { kind: 'situation', code: 'wadiya-6', module: 6, title: 'وضعية 6 — زربية مصغّرة ومعامل التصغير k', learningPointIds: ['4am_wadiya-idmajiya-talis_P1'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'عشر عبارات: صحيح أم خاطئ؟ خاصية طالس وعكسيتها وتقسيم قطعة، من السهل إلى الأصعب.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    // Les وضعيات d'entraînement (track: 'problem') : practice_lab, avant « تحليل الوضعية النهائية للاختبار » (module 7) et le test
    // (module 8, toujours ouvert). Elles comptent dans la complétion, jamais dans la maîtrise —
    // docs/lessons/MASAIL_GENERATION_GUIDE.md, §14 (synthèses).
    { id: '01', number: 1, slug: 'wadiya-1', path: `${LESSON_BASE_PATH}/wadiya-1`,
      title: 'الوضعية التدريبية 1 — سارية العلم', desc: 'عصا طولها 1,2 م وظلّان ينتهيان معًا: ارتفاع السارية، ثمن الأضواء، وظلّ تلميذ.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-talis_P1'],
      color: 'sky', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '02', number: 2, slug: 'wadiya-2', path: `${LESSON_BASE_PATH}/wadiya-2`,
      title: 'الوضعية التدريبية 2 — عارضة الرفّ', desc: 'هل العارضة موازية للأرض؟ النسبتان والخاصية العكسية، ثم طول العارضة وثمنها.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-talis_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '03', number: 3, slug: 'wadiya-3', path: `${LESSON_BASE_PATH}/wadiya-3`,
      title: 'الوضعية التدريبية 3 — توزيع الممرّ', desc: 'ممرّ طوله 11 م تتقاسمه خمس عائلات بحصص متساوية: لماذا تتساوى الحصص، وأين النقطة M؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-talis_P1'],
      color: 'emerald', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '04', number: 4, slug: 'wadiya-4', path: `${LESSON_BASE_PATH}/wadiya-4`,
      title: 'الوضعية التدريبية 4 — هدية عيد الأمّ', desc: 'شمعة أسطوانية داخل علبة مخروطية: ارتفاعها، حجمها، وهل تتّسع علبة لشمعة أكبر؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-talis_P2', '4am_wadiya-idmajiya-talis_P3'],
      color: 'amber', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '05', number: 5, slug: 'wadiya-5', path: `${LESSON_BASE_PATH}/wadiya-5`,
      title: 'الوضعية التدريبية 5 — عرض البحيرة', desc: 'التوازي بالخاصية العكسية ثم المسافة AB بخاصية طالس، وطول الحبل اللازم.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-talis_P1'],
      color: 'rose', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '06', number: 6, slug: 'wadiya-6', path: `${LESSON_BASE_PATH}/wadiya-6`,
      title: 'الوضعية التدريبية 6 — زربية ركن القراءة', desc: 'تصغير مثلث: معامل k، الأضلاع المجهولة، المحيط وثمن الشرابات.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-talis_P1'],
      color: 'violet', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '07', number: 7, slug: 'al-wadiya', path: `${LESSON_BASE_PATH}/al-wadiya`,
      title: 'تحليل الوضعية النهائية للاختبار', desc: 'تحدّ الوحدة (ارتفاع المئذنة بعصا وظلّين) ثم الوضعية: أسطوانة داخل مخروط، مقطعها المحوري، معادلة في r وحجمها، والتحقّق من ملاءمة النتيجة.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_wadiya-idmajiya-talis_P1', '4am_wadiya-idmajiya-talis_P2', '4am_wadiya-idmajiya-talis_P3'],
      color: 'amber', style: 'featured', estimatedMin: 30, difficulty: 3, actionText: 'أقرأ الوضعية' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'وضعية الاختبار النهائي', desc: 'وضعية أخرى: أسطوانة داخل مخروط آخر، ومنارة أخرى بطريقة الظل.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 7, difficulty: 4, actionText: 'أحلّ' },
  ],
};
