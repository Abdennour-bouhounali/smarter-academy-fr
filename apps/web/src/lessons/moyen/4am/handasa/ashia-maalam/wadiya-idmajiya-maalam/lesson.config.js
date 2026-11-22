/**
 * أدمج تعلّماتي — الوحدة 12 « الأشعة في معلم » (kind: synthesis)
 * Manuel 4AM, unité 12 : « أدمج تعلّماتي » (وضعية « عدّاءان » + تحليل الوضعية, p. 148) — extraction.json › destinations.
 * Ce n'est PAS un cinquième درس. Les deux autres rubriques de la fin d'unité du manuel n'y entrent pas (décision du propriétaire, 2026-10-13).
 *
 * Format de l'unité 1 (`wadiya-idmajiya-aadad`), et seulement celui-là — 9 modules (0 à 8) :
 *   0  أستعدّ
 *   1–6  six « وضعيات تدريبية » (`track: 'problem'`, content/problems.js, ajouts de la plateforme `exam_style_problem`) :
 *        متوازي أضلاع, milieu et distance, demi-cercle contre ligne brisée, rectangle, phare, losange — une figure chacune
 *   7  « الوضعية وتحليلها » : la وضعية du manuel (deux coureurs, deux parcours dessinés dans un معلم) lue et analysée en
 *      trois phases (قراءة · تحليل · تنفيذ) avec le lab `route-compare` (le centre de chaque demi-cercle, la balise suivante
 *      de la ligne brisée, deux montres) ; les briques de la démarche y sont posées en « rappel »
 *   8  « إختبار أولي » : la وضعية TRANSPOSÉE évaluée (deux pistes de VTT à Constantine)
 * Layout v2 : {1→7, 2→0, 3→0, 4→8} (moduleLayoutMigrations.js, côté lead) ; les deux anciens modules supprimés comptent pour 0.
 *
 * Rétrofit 2026-10-15 (§4quater, synthèse = format fixe, retouches minimales) : le module 7 s'ouvre sur le labo `route-compare` (ni carte, ni
 * titre / `lead` de workspace) ; la وضعية du manuel (énoncé + figure) passe en tête de l'étape 1 « قراءة الوضعية » ; les briques restent des
 * « rappel » APRÈS la réponse. Les autres modules (وضعيات, إختبار) ne changent pas.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/handasa/wadiya-idmajiya-maalam';

export const LESSON_CONFIG = {
  id: 'wadiya-idmajiya-maalam',
  kind: 'synthesis',
  unit: 'ashia-maalam',
  unitTitle: 'الأشعة في معلم',
  sequentialUnlock: true,
  title: 'أدمج تعلّماتي — ترييض وضعيات هندسية وحساب مسارات في معلم',
  description: 'إدماج المعارف: ست وضعيات تدريبية في معلم (متوازي أضلاع، منتصف ومسافة، نصف دائرة وخط منكسر، مستطيل، فنار، معيّن)، ثم تحليل وضعية الكتاب: مقارنة طولي مسارين لعدّاءين (أنصاف دوائر مراكزها منتصفات، وقطع أطوالها مسافات بين نقطتين) بالمنهجية (قراءة · تحليل · تنفيذ)، وأخيرًا وضعية الاختبار النهائي المنقولة.',
  level: 'moyen',
  grade: '4am',
  chapter: 'handasa',
  chapterTitle: 'ميدان الهندسة',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🏃',
  estimatedDurationMin: 35,
  textbookRef: { unit: 12, pages: '148' },
  skills: [
    'تجنيد موارد الوحدة (قراءة الإحداثيات والمركبات، إحداثيتا المنتصف، المسافة بين نقطتين، إثبات الخواص) لمقارنة طولي مسارين في معلم',
    'قراءة الوضعية وتحليلها: تفسير التمثيلين البيانيين، ترتيب المعطيات، وتعيين نقاط المسار على محور الفواصل',
    'تنفيذ الاستراتيجية: حساب مراكز أنصاف الدوائر وأطوالها وأطوال القطع، ثم المقارنة بالقيم المضبوطة والمقرّبة وتفسير النتيجة',
  ],
  teachingScope: {
    include: ['ست وضعيات تدريبية في معلم (نوع الامتحان): مركبتا شعاع وتساوي شعاعين، المنتصف والمسافة، طول نصف دائرة، طبيعة مثلث ورباعي بالحساب', 'أدمج تعلّماتي: وضعية «عدّاءان» وتحليلها في ثلاث مراحل', 'وضعية الاختبار النهائي: مسلكان للدراجات الجبلية في معلم'],
    exclude: ['أي مفهوم جديد', 'الجداء السلمي', 'معادلة دائرة أو مستقيم'],
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Ce que les وضعيات, leur analyse et l'épreuve finale mobilisent, diagnostiqué par « أستعدّ » (affirmations de la plateforme) :
  // lire un point (درس 1), les composantes (درس 2), le milieu et la distance (درس 3), la nature par le calcul (درس 4), la longueur
  // d'un demi-cercle et la valeur approchée d'une racine (années précédentes), l'ordre des sommets (الوحدة 11).
  priorKnowledge: ['ihdathiyat-nuqta', 'hisab-murakkibat', 'muntasaf-qita', 'masafa-nuqtatayn', 'tul-nisf-daira', 'aks-fithaghuris', 'qima-muqarraba', 'mutawazi-tartib'],
  resources: [
    // Modules 1–6 — six وضعيات d'entraînement (content/problems.js), ajouts de la plateforme ; le module 7 est la وضعية du manuel.
    { kind: 'situation', code: 'wadiya-1', module: 1, title: 'وضعية 1 — المكتبة المتنقلة: المحطة الرابعة لمتوازي أضلاع', learningPointIds: ['4am_wadiya-idmajiya-maalam_P1', '4am_wadiya-idmajiya-maalam_P2'] },
    { kind: 'situation', code: 'wadiya-2', module: 2, title: 'وضعية 2 — البئر المشتركة: منتصف ومسافة ومثلث قائم', learningPointIds: ['4am_wadiya-idmajiya-maalam_P2', '4am_wadiya-idmajiya-maalam_P3'] },
    { kind: 'situation', code: 'wadiya-3', module: 3, title: 'وضعية 3 — ممرّ ساحة المدرسة: نصف دائرة أم خط منكسر', learningPointIds: ['4am_wadiya-idmajiya-maalam_P2', '4am_wadiya-idmajiya-maalam_P3'] },
    { kind: 'situation', code: 'wadiya-4', module: 4, title: 'وضعية 4 — الجدارية: إثبات أنّ الرباعي مستطيل', learningPointIds: ['4am_wadiya-idmajiya-maalam_P1', '4am_wadiya-idmajiya-maalam_P3'] },
    { kind: 'situation', code: 'wadiya-5', module: 5, title: 'وضعية 5 — فنار الشاطئ: مسافة وانتماء إلى المدى', learningPointIds: ['4am_wadiya-idmajiya-maalam_P1', '4am_wadiya-idmajiya-maalam_P3'] },
    { kind: 'situation', code: 'wadiya-6', module: 6, title: 'وضعية 6 — حقل الزيتون: إثبات أنّ الرباعي معيّن ومساحته', learningPointIds: ['4am_wadiya-idmajiya-maalam_P2', '4am_wadiya-idmajiya-maalam_P3'] },
    { kind: 'situation', code: 'situation-addaan', module: 7, title: 'وضعية: عدّاءان ومساران', learningPointIds: ['4am_wadiya-idmajiya-maalam_P1', '4am_wadiya-idmajiya-maalam_P2', '4am_wadiya-idmajiya-maalam_P3'], sourceElementIds: ['situation'] },
    // Module 7 — مبتدئ : un rallye au Sahara (nombres de la plateforme : deux morceaux par parcours, A et B communs).
    {
      kind: 'manipulation', code: 'route-compare-rally', type: 'route-compare', module: 7, level: 'beginner',
      title: 'رالي في الصحراء: مساران بين المخيّم والواحة (مثال من المنصّة)',
      objective: 'نقارن طولي مسارين في معلم: طول القطعة هو المسافة بين طرفيها، ونصف الدائرة مركزه منتصف قطرها وطوله πr، ثم نجمع ونقارن',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'smaller_numbers_for_first_contact', theme: 'rally' },
      learningPointIds: ['4am_wadiya-idmajiya-maalam_P2', '4am_wadiya-idmajiya-maalam_P3'],
      sourceElementIds: ['situation'],
    },
    // Module 7 — متقدم : la وضعية du manuel (p. 148) — trois demi-cercles contre une ligne brisée.
    {
      kind: 'manipulation', code: 'route-compare-addaan', type: 'route-compare', module: 7, level: 'advanced',
      title: 'وضعية الكتاب: عدّاءان ومساران في معلم',
      objective: 'نقارن طولي مسارين في معلم: طول القطعة هو المسافة بين طرفيها، ونصف الدائرة مركزه منتصف قطرها وطوله πr، ثم نجمع ونقارن',
      autonomy: 'وضعية الكتاب: ثلاثة أنصاف دوائر بلا علامة عند نقاط الالتقاء وثلاث قطع، ومساران لا يبدآن من نفس النقطة؛ التلميذ يجد بنفسه كل مركز (منتصف القطر، بخطوة نصف مربع) وكل طرف قطعة، ثم يقارن طولين متقاربين (حوالي 9,42 و 9,96) لا تفصل بينهما العين',
      experience: { type: 'textbook', reason: '', theme: 'cross' },
      learningPointIds: ['4am_wadiya-idmajiya-maalam_P1', '4am_wadiya-idmajiya-maalam_P2', '4am_wadiya-idmajiya-maalam_P3'],
      sourceElementIds: ['situation'],
    },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ثماني عبارات: صحيح أم خاطئ؟ قراءة نقطة، مركبتا شعاع، المنتصف، المسافة، طول نصف دائرة، عكس فيثاغورس، القيمة المقرّبة، وترتيب رؤوس متوازي الأضلاع.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    // Les وضعيات d'entraînement (track: 'problem') : practice_lab, avant l'analyse de la وضعية du manuel (module 7) et le
    // إختبار أولي (module 8, toujours ouvert). Elles comptent dans la complétion, jamais dans la maîtrise —
    // docs/lessons/MASAIL_GENERATION_GUIDE.md, §14 (synthèses).
    { id: '01', number: 1, slug: 'wadiya-1', path: `${LESSON_BASE_PATH}/wadiya-1`,
      title: 'الوضعية التدريبية 1 — المكتبة المتنقلة', desc: 'محطات في معلم: مركبتا شعاع، النقطة الرابعة لمتوازي أضلاع، وطول جولة بالجذور.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-maalam_P1', '4am_wadiya-idmajiya-maalam_P2'],
      color: 'sky', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '02', number: 2, slug: 'wadiya-2', path: `${LESSON_BASE_PATH}/wadiya-2`,
      title: 'الوضعية التدريبية 2 — البئر المشتركة', desc: 'بئر في منتصف قطعة بين قريتين: المنتصف، المسافة بالجذر، وموقع مدرسة تجعل المثلث قائمًا ومتساوي الساقين.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-maalam_P2', '4am_wadiya-idmajiya-maalam_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '03', number: 3, slug: 'wadiya-3', path: `${LESSON_BASE_PATH}/wadiya-3`,
      title: 'الوضعية التدريبية 3 — ممرّ ساحة المدرسة', desc: 'نصف دائرة قطرها [AB] أم الخط المنكسر ACB: أيّ الممرّين أقصر، وبكم؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-maalam_P2', '4am_wadiya-idmajiya-maalam_P3'],
      color: 'amber', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '04', number: 4, slug: 'wadiya-4', path: `${LESSON_BASE_PATH}/wadiya-4`,
      title: 'الوضعية التدريبية 4 — الجدارية', desc: 'شعاعان متساويان ثم عكس فيثاغورس: إثبات أنّ الرباعي مستطيل، ثم المساحة وتكلفة الطلاء.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-maalam_P1', '4am_wadiya-idmajiya-maalam_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '05', number: 5, slug: 'wadiya-5', path: `${LESSON_BASE_PATH}/wadiya-5`,
      title: 'الوضعية التدريبية 5 — فنار الشاطئ', desc: 'مسافة قاربين عن فنار مداه 5 km، ثم موقع قارب بعد ساعة بمركبتي شعاع.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-maalam_P1', '4am_wadiya-idmajiya-maalam_P3'],
      color: 'teal', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '06', number: 6, slug: 'wadiya-6', path: `${LESSON_BASE_PATH}/wadiya-6`,
      title: 'الوضعية التدريبية 6 — حقل الزيتون', desc: 'منتصفا القطرين ثم ضلعان متتاليان متقايسان: الرباعي معيّن، ومساحة الحقل.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-maalam_P2', '4am_wadiya-idmajiya-maalam_P3'],
      color: 'violet', style: 'featured', estimatedMin: 5, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '07', number: 7, slug: 'al-wadiya', path: `${LESSON_BASE_PATH}/al-wadiya`,
      title: 'الوضعية وتحليلها', desc: 'عدّاءان ومساران في معلم: قراءة الوضعية، تفسير التمثيلين البيانيين، ثم حساب طول المسار (1) بأنصاف الدوائر وطول المسار (2) بالمسافات، والمقارنة.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_wadiya-idmajiya-maalam_P1', '4am_wadiya-idmajiya-maalam_P2', '4am_wadiya-idmajiya-maalam_P3'],
      color: 'amber', style: 'featured', estimatedMin: 22, difficulty: 3, actionText: 'أقرأ الوضعية' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'وضعية أخرى: مسلكان للدراجات الجبلية في غابة جبل الوحش بقسنطينة.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 7, difficulty: 4, actionText: 'أحلّ' },
  ],
};
