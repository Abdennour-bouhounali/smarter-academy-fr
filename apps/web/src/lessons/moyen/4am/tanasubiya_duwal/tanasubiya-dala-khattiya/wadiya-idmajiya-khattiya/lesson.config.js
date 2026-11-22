/**
 * أدمج تعلّماتي — الوحدة 6 « الدالة الخطية والتناسبية » (kind: synthesis)
 * Synthèse de l'unité 6 (ce n'est PAS un sixième درس). Depuis le 2026-10-13 (schéma de l'unité 1,
 * MASAIL_GENERATION_GUIDE §14) : six « الوضعية التدريبية N » (modules 1 à 6, content/problems.js),
 * « تحليل الوضعية النهائية للاختبار » (module 7, juste avant le test) puis « وضعية الاختبار النهائي »
 * (module 8) — la situation du téléphérique, manuel p. 74. « أؤكّد تعلّماتي » (QCM, p. 74) et « أتعمّق »
 * (p. 75) ne font plus partie de la synthèse (décision du propriétaire) ; anciens modules
 * (moduleLayoutMigrations : v2 {1→7, 2→8, 3→9, 4→10}, puis le retrait de ces deux modules : 2→0, 3→0, 4→8).
 *
 * RETROFIT « méthode » (2026-10-15) — synthèse : format fixe conservé. Seul le module 7 (le seul avec un labo, origin-line) change :
 * plus de titre d'atelier, et l'encadré « تحليل الوضعية » de l'étape 2 vient APRÈS la réponse. Son brief reste l'ÉNONCÉ de
 * la situation finale (objet de l'analyse, pas une entrée). Modules 0–6 et 8 inchangés.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/tanasubiya_duwal/wadiya-idmajiya-khattiya';

export const LESSON_CONFIG = {
  id: 'wadiya-idmajiya-khattiya',
  kind: 'synthesis',
  unit: 'tanasubiya-dala-khattiya',
  unitTitle: 'الدالة الخطية والتناسبية',
  sequentialUnlock: true,
  title: 'أدمج تعلّماتي — الدالة الخطية والتناسبية',
  description: 'إدماج موارد الوحدة في وضعية مركبة: المصعد الهوائي (مبرهنة فيثاغورس لطول الحبل، السرعة المتوسطة لمدة الصعود، ثم تكلفة رحلة العائلة كدالة خطية لسعر التذكرة مع تخفيض 40% للأطفال، وقراءة بيانية لحد الميزانية)، تسبقها ست وضعيات تدريبية (جدول التناسبية، تخفيضان، مستقيم يشمل المبدأ، حبل وفيثاغورس، تركيز، تعرفة).',
  level: 'moyen',
  grade: '4am',
  chapter: 'tanasubiya_duwal',
  chapterTitle: 'ميدان التناسبية والدوال',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🚡',
  estimatedDurationMin: 68,
  textbookRef: { unit: 6, pages: '74' },
  skills: [
    'تجنيد موارد الوحدة (التناسبية، الدالة الخطية، التمثيل البياني، النسب المئوية والمقادير المركبة) لحل وضعية مركبة',
    'تحليل وضعية واقعية: طول حبل مصعد هوائي، مدة الصعود، وتكلفة رحلة عائلة مع تخفيض للأطفال كدالة خطية لسعر التذكرة',
    'اختيار استراتيجية تجمع مبرهنة فيثاغورس والتمثيل البياني والدالة الخطية، ثم تفسير النتيجة في سياق الوضعية',
  ],
  teachingScope: {
    include: ['ست وضعيات تدريبية تجنّد موارد الوحدة', 'وضعية الاختبار النهائي: المصعد الهوائي وتحليلها في ثلاث مراحل'],
    exclude: ['أي مفهوم جديد', 'الدالة التآلفية (غير واردة في الوحدة)'],
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Ce que la situation et les six entraînements mobilisent, diagnostiqué par « أستعدّ »
  // (affirmations de la plateforme) : Pythagore (années précédentes), les grandeurs composées
  // (درس 4 : vitesse, masse volumique, conversions), la réduction en % (درس 4), la lecture
  // graphique (درس 3), l'image et le coefficient (درس 2), la forme ax (درس 2), un % d'un tout.
  priorKnowledge: ['fithaghuras', 'maqadir-murakkaba', 'nisba-takhfid', 'qiraa-bayaniya', 'sura-adad', 'tayin-muamil', 'shakl-khatti', 'nisba-mia'],
  resources: [
    { kind: 'situation', code: 'situation-misad-hawai', module: 7, title: 'وضعية: المصعد الهوائي', learningPointIds: ['4am_wadiya-idmajiya-khattiya_P2', '4am_wadiya-idmajiya-khattiya_P3'], sourceElementIds: ['situation'] },
    // Module 7 — la droite de coût (origin-line, réutilisé de « التمثيل البياني لدالة خطية »,
    // mode `read`, monde `budget`) : la droite y = a·x par O est donnée, la ligne du budget
    // y = cap aussi ; l'élève glisse la sonde jusqu'au point où le coût atteint le budget et
    // lit le plus grand prix d'une tranche de billet.
    {
      kind: 'manipulation', code: 'origin-line-aila-ukhra', type: 'origin-line', module: 7, level: 'beginner',
      title: 'عائلة أخرى: تكلفة 3x وميزانية 1500 DA',
      objective: 'قراءة بيانية لحد الميزانية: تكلفة رحلة العائلة دالة خطية لسعر تذكرة البالغ، وأكبر سعر مسموح هو فاصلة نقطة تقاطع مستقيم التكلفة مع خط الميزانية',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'smaller_numbers_for_first_contact', theme: 'cablecar' },
      learningPointIds: ['4am_wadiya-idmajiya-khattiya_P3'],
      sourceElementIds: ['situation'],
    },
    {
      kind: 'manipulation', code: 'origin-line-misad-hawai', type: 'origin-line', module: 7, level: 'advanced',
      title: 'عائلة الكتاب: تكلفة 3,8x وميزانية 2000 DA',
      objective: 'قراءة بيانية لحد الميزانية: تكلفة رحلة العائلة دالة خطية لسعر تذكرة البالغ، وأكبر سعر مسموح هو فاصلة نقطة تقاطع مستقيم التكلفة مع خط الميزانية',
      autonomy: 'أعداد الكتاب: المعامل 3,8 عشري ونقطة التقاطع لا تقع على عقدة من الشبكة؛ التلميذ يقرأ قيمة تقريبية ثم يقرّر بنفسه كيف يدوّر حتى لا تتجاوز التكلفة الميزانية',
      experience: { type: 'textbook', reason: '', theme: 'cablecar' },
      learningPointIds: ['4am_wadiya-idmajiya-khattiya_P3', '4am_wadiya-idmajiya-khattiya_P2'],
      sourceElementIds: ['situation'],
    },
    // Modules 1–6 — six وضعيات d'entraînement (content/problems.js), ajouts de la plateforme ;
    // le module 7 analyse la situation du téléphérique, évaluée au module 8.
    { kind: 'situation', code: 'wadiya-1', module: 1, title: 'وضعية 1 — جدول ثمن الحقائب: تناسبية ودالة خطية', learningPointIds: ['4am_wadiya-idmajiya-khattiya_P1', '4am_wadiya-idmajiya-khattiya_P2'] },
    { kind: 'situation', code: 'wadiya-2', module: 2, title: 'وضعية 2 — معرض الكتاب: تخفيض بنسبة أو بمبلغ', learningPointIds: ['4am_wadiya-idmajiya-khattiya_P2'] },
    { kind: 'situation', code: 'wadiya-3', module: 3, title: 'وضعية 3 — طريق سعد: مستقيم يشمل المبدأ والسرعة', learningPointIds: ['4am_wadiya-idmajiya-khattiya_P1'] },
    { kind: 'situation', code: 'wadiya-4', module: 4, title: 'وضعية 4 — حبل الصاري: فيثاغورس وثمن المتر والميزانية', learningPointIds: ['4am_wadiya-idmajiya-khattiya_P3'] },
    { kind: 'situation', code: 'wadiya-5', module: 5, title: 'وضعية 5 — ماء بئر الحيّ: التركيز والنسبة المئوية', learningPointIds: ['4am_wadiya-idmajiya-khattiya_P1'] },
    { kind: 'situation', code: 'wadiya-6', module: 6, title: 'وضعية 6 — تعرفة سيارة الأجرة: جدول ليس تناسبية', learningPointIds: ['4am_wadiya-idmajiya-khattiya_P2'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'تسع عبارات: صحيح أم خاطئ؟ فيثاغورس، السرعة والوحدات، التخفيض بنسبة مئوية، القراءة البيانية، الصورة والمعامل.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    // Les وضعيات d'entraînement (track: 'problem') : practice_lab, avant la situation du téléphérique (module 7,
    // l'analyse ; évaluation au module 8). Elles comptent dans la complétion, jamais dans la maîtrise —
    // docs/lessons/MASAIL_GENERATION_GUIDE.md, §14 (synthèses).
    { id: '01', number: 1, slug: 'wadiya-1', path: `${LESSON_BASE_PATH}/wadiya-1`,
      title: 'الوضعية التدريبية 1 — حقائب للمحتاجين', desc: 'جدول ثمن الحقائب: هل هو تناسبية؟ المعامل، صورة وسابقة، ومبلغ ثابت يكسر الخطية.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-khattiya_P1', '4am_wadiya-idmajiya-khattiya_P2'],
      color: 'sky', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '02', number: 2, slug: 'wadiya-2', path: `${LESSON_BASE_PATH}/wadiya-2`,
      title: 'الوضعية التدريبية 2 — معرض الكتاب', desc: 'تخفيض بنسبة 15% وتخفيض بمبلغ 150 دج: العبارتان، الدالة الخطية، وأيّ مكتبة أنفع؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-khattiya_P2'],
      color: 'emerald', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '03', number: 3, slug: 'wadiya-3', path: `${LESSON_BASE_PATH}/wadiya-3`,
      title: 'الوضعية التدريبية 3 — طريق سعد إلى المتوسطة', desc: 'مستقيم يشمل المبدأ: المعامل سرعة، ثم المسافة والمدة، وهل يصل في الوقت؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-khattiya_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '04', number: 4, slug: 'wadiya-4', path: `${LESSON_BASE_PATH}/wadiya-4`,
      title: 'الوضعية التدريبية 4 — حبل الصاري', desc: 'فيثاغورس لطول الحبل، ثمن المتر دالة خطية، وحدّ الميزانية بعدد طبيعي من الأمتار.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-khattiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '05', number: 5, slug: 'wadiya-5', path: `${LESSON_BASE_PATH}/wadiya-5`,
      title: 'الوضعية التدريبية 5 — ماء بئر الحيّ', desc: 'تركيز النترات بالمليغرام في اللتر، دالة خطية للحجم، ثم نسبة مئوية من الكتلة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-khattiya_P1'],
      color: 'teal', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '06', number: 6, slug: 'wadiya-6', path: `${LESSON_BASE_PATH}/wadiya-6`,
      title: 'الوضعية التدريبية 6 — تعرفة سيارة الأجرة', desc: 'جدول ليس جدول تناسبية، تعرفة خطية ونقطة من تمثيلها، ومقارنة بين شركتين.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-khattiya_P2'],
      color: 'violet', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '07', number: 7, slug: 'al-wadiya', path: `${LESSON_BASE_PATH}/al-wadiya`,
      title: 'تحليل الوضعية النهائية للاختبار', desc: 'المصعد الهوائي: طول الحبل بفيثاغورس، مدة الصعود، تكلفة العائلة كدالة خطية، ثم أكبر سعر على خط الميزانية — نتدرّب على مصعد آخر وعائلة أخرى.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_wadiya-idmajiya-khattiya_P2', '4am_wadiya-idmajiya-khattiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 16, difficulty: 3, actionText: 'أقرأ الوضعية' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'وضعية الاختبار النهائي', desc: 'وضعية الكتاب كاملة: طول الحبل، مدة الصعود، تكلفة العائلة، تمثيلها البياني، وأكبر سعر للتذكرة.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 7, difficulty: 4, actionText: 'أحلّ' },
  ],
};
