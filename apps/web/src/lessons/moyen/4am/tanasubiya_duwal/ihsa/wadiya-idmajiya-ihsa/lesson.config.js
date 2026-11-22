/**
 * أدمج تعلّماتي — الوحدة 8 « الإحصاء » (kind: synthesis)
 * Manuel 4AM, unité 8 : « أدمج تعلّماتي » (وضعية الميداليات الذهبية الأولمبية + تحليل الوضعية, p. 100) —
 * extraction.json › destinations. Ce n'est PAS un cinquième درس : c'est la synthèse de l'unité.
 *
 * Format de l'unité 1 (`wadiya-idmajiya-aadad`), décision du propriétaire du 2026-10-13 : « أؤكّد تعلّماتي » n'entre
 * jamais dans « أدمج تعلّماتي ». Neuf modules, et seulement ceux-là :
 *   0      أستعدّ                                  (diagnostic)
 *   1–6    « الوضعية التدريبية N » — six situations BEM guidées pas à pas (`track: 'problem'`, content/problems.js) :
 *          tableau, bâtons, secteurs, valeur cachée, effectif caché, histogramme — mêmes outils, autres contextes
 *   7      « الوضعية وتحليلها » (slug `al-wadiya`) — la situation du manuel (médailles d'or) lue en trois phases
 *          (قراءة · تحليل · تنفيذ) : tableau, `stat-balance` mode hidden (la main pose les jetons cachés jusqu'à ce que
 *          le rideau du وسيط tombe sur 3 et que la poutre s'équilibre sur 7), 176 + 2 × 3 + y = 210, puis 0,69 × T = 30
 *   8      « إختبار أولي » (slug `itqan`) — la situation TRANSPOSÉE (autres nombres), évaluée
 *
 * RÉTROFIT 2026-10-15 (§4ter, minimal — format fixe) : seul le module 7 a un labo. Entrée gardée : la balance des valeurs (stat-balance,
 * مبتدئ par défaut puis la situation du manuel en متقدم) ; rejetée : lire d'abord l'énoncé du manuel sous forme de carte au-dessus du labo.
 * L'énoncé passe en tête de l'étape 1 (lecture) ; le labo ouvre le module, sans titre ni `lead` d'atelier. Les rappels de briques
 * étaient déjà APRÈS la réponse. Modules 0–6 et 8 : inchangés (GuidedProblem, diagnostic, test).
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/tanasubiya_duwal/wadiya-idmajiya-ihsa';

export const LESSON_CONFIG = {
  id: 'wadiya-idmajiya-ihsa',
  kind: 'synthesis',
  unit: 'ihsa',
  unitTitle: 'الإحصاء',
  sequentialUnlock: true,
  title: 'أدمج تعلّماتي — إدماج المعارف والتحليل المنهجي للوضعية الإحصائية',
  description: 'إدماج المعارف: ست وضعيات تدريبية على نمط امتحان BEM (جدول، أعمدة، قطاعات، قيمة مخفية، تكرار مخفي، مدرّج) ثم تجنيد موارد الوحدة (التكرارات المجمعة، المدى، الوسيط، المتوسط الحسابي، والنسب المئوية) في الوضعية الإحصائية للميداليات الأولمبية بتحليلها المنهجي (قراءة · تحليل · تنفيذ)، ويتلوها اختبار على وضعية أخرى بأعداد أخرى.',
  level: 'moyen',
  grade: '4am',
  chapter: 'tanasubiya_duwal',
  chapterTitle: 'ميدان التناسبية والدوال',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🏅',
  estimatedDurationMin: 50,
  textbookRef: { unit: 8, pages: '100' },
  skills: [
    'تجنيد موارد الوحدة (التكرارات المجمعة، المدى، الوسيط، المتوسط الحسابي، والنسب المئوية) لحل وضعية إحصائية مركبة',
    'تحليل الوضعية الإحصائية: قراءة النص والجدول، تحديد المطلوب وترتيب المعطيات',
    'اختيار استراتيجية الحل وتنفيذها (الوسيط، الوسط الحسابي وحل معادلة، أخذ نسبة من عدد) وتحرير النتائج بجمل واضحة',
    'حل ست وضعيات من نمط امتحان BEM (قراءة جدول أو مخطط، تكرارات مجمعة، مدى، وسيط، متوسط، نسب مئوية، قيمة أو تكرار مخفيان)',
  ],
  teachingScope: {
    include: ['ست وضعيات تدريبية على نمط BEM تجنّد موارد الوحدة', 'أدمج تعلّماتي: وضعية الميداليات الذهبية الأولمبية وتحليلها في ثلاث مراحل'],
    exclude: ['أي مفهوم جديد', 'المجدولات (درس 3) خارج ما تحتاجه الوضعية'],
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Ce que la situation des médailles mobilise, diagnostiqué par « أستعدّ »
  // (affirmations de la plateforme) : l'effectif total et les effectifs cumulés (درس 1), l'étendue, le
  // rang de la médiane, la moyenne pondérée (درس 2), le tout à partir d'un pourcentage et une équation.
  priorKnowledge: ['takrar-kulli', 'takrar-mujamma', 'mada', 'wasit-rutba', 'mutawassit-murajjah', 'nisba-min-adad', 'muadala-ula'],
  resources: [
    { kind: 'situation', code: 'situation-midaliyat', module: 7, title: 'وضعية: الميداليات الذهبية الأولمبية', learningPointIds: ['4am_wadiya-idmajiya-ihsa_P2', '4am_wadiya-idmajiya-ihsa_P3'], sourceElementIds: ['situation'] },
    // Modules 1–6 — six وضعيات d'entraînement (content/problems.js), ajouts de la plateforme ;
    // le module 7 est la situation du manuel, le module 8 la situation évaluée.
    { kind: 'situation', code: 'wadiya-1', module: 1, title: 'وضعية 1 — كتب المكتبة المدرسية: جدول تكرارات من 20 تلميذًا', learningPointIds: ['4am_wadiya-idmajiya-ihsa_P1', '4am_wadiya-idmajiya-ihsa_P2'] },
    { kind: 'situation', code: 'wadiya-2', module: 2, title: 'وضعية 2 — تأخّر الحافلة المدرسية: مخطط بالأعمدة', learningPointIds: ['4am_wadiya-idmajiya-ihsa_P1', '4am_wadiya-idmajiya-ihsa_P2'] },
    { kind: 'situation', code: 'wadiya-3', module: 3, title: 'وضعية 3 — حملة الكراريس: مخطط دائري ونسب مئوية', learningPointIds: ['4am_wadiya-idmajiya-ihsa_P3'] },
    { kind: 'situation', code: 'wadiya-4', module: 4, title: 'وضعية 4 — نادي البيئة: قيمة مجهولة يكشفها المتوسط', learningPointIds: ['4am_wadiya-idmajiya-ihsa_P2', '4am_wadiya-idmajiya-ihsa_P3'] },
    { kind: 'situation', code: 'wadiya-5', module: 5, title: 'وضعية 5 — ورشة النجارة: تكرار ضائع', learningPointIds: ['4am_wadiya-idmajiya-ihsa_P1', '4am_wadiya-idmajiya-ihsa_P3'] },
    { kind: 'situation', code: 'wadiya-6', module: 6, title: 'وضعية 6 — ساعات برّ الوالدين: مدرّج تكراري بفئات', learningPointIds: ['4am_wadiya-idmajiya-ihsa_P1', '4am_wadiya-idmajiya-ihsa_P2'] },
    // Module 7 — la balance des valeurs (stat-balance, RÉUTILISÉ de « مدى ووسيط ومتوسط سلسلة إحصائية »,
    // mode `hidden`, monde `medals`) : la main pose chaque jeton caché entre ses voisins du tableau jusqu'à
    // ce que le rideau du وسيط et l'équilibre du متوسط tombent sur les valeurs données.
    {
      kind: 'manipulation', code: 'stat-balance-alaab-madrasiya', type: 'stat-balance', module: 7, level: 'beginner',
      title: 'الألعاب المدرسية: عشر متوسطات وقيمة مخفية واحدة',
      objective: 'إيجاد قيم مخفية في جدول إحصائي: الوسيط يكشف القيمة التي تقع فيها رتبتاه، والمتوسط يعطي معادلة في القيمة الباقية',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'smaller_numbers_for_first_contact', theme: 'medals' },
      learningPointIds: ['4am_wadiya-idmajiya-ihsa_P3'],
      sourceElementIds: ['situation'],
    },
    {
      kind: 'manipulation', code: 'stat-balance-midaliyat', type: 'stat-balance', module: 7, level: 'advanced',
      title: 'الميداليات الأولمبية: ثلاثون دولة وقيمتان مخفيتان',
      objective: 'إيجاد قيم مخفية في جدول إحصائي: الوسيط يكشف القيمة التي تقع فيها رتبتاه، والمتوسط يعطي معادلة في القيمة الباقية',
      autonomy: 'جدول الكتاب: قيمتان مخفيتان بدل واحدة، ثلاثون دولة على الميزان منها إحدى عشرة مكدّسة عند 1؛ التلميذ يقرّر بنفسه أيّ قيمة يحرّك أولا (الوسيط قبل المتوسط) لأنّ الثانية لا تُعرف إلا بعد الأولى',
      experience: { type: 'textbook', reason: '', theme: 'medals' },
      learningPointIds: ['4am_wadiya-idmajiya-ihsa_P3', '4am_wadiya-idmajiya-ihsa_P2'],
      sourceElementIds: ['situation'],
    },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ثماني عبارات: صحيح أم خاطئ؟ التكرار الكلي والتكرار المجمع، المدى، رتبة الوسيط، المتوسط المتوازن، النسبة المئوية ومعادلة.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    // Les وضعيات d'entraînement (track: 'problem') : practice_lab, avant la situation du manuel (module 7). Elles comptent dans la
    // complétion, jamais dans la maîtrise — docs/lessons/MASAIL_GENERATION_GUIDE.md, §14 (synthèses).
    { id: '01', number: 1, slug: 'wadiya-1', path: `${LESSON_BASE_PATH}/wadiya-1`,
      title: 'الوضعية التدريبية 1 — كتب المكتبة المدرسية', desc: 'جدول من 20 تلميذًا: كتابان على الأكثر، المتوسط والوسيط، و 3 كتب على الأقل.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-ihsa_P1', '4am_wadiya-idmajiya-ihsa_P2', '4am_wadiya-idmajiya-ihsa_P3'],
      color: 'sky', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '02', number: 2, slug: 'wadiya-2', path: `${LESSON_BASE_PATH}/wadiya-2`,
      title: 'الوضعية التدريبية 2 — تأخّر الحافلة المدرسية', desc: 'مخطط بالأعمدة: عدد الأيام، المدى، المتوسط، الوسيط، و 15 دقيقة فأكثر.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-ihsa_P1', '4am_wadiya-idmajiya-ihsa_P2', '4am_wadiya-idmajiya-ihsa_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '03', number: 3, slug: 'wadiya-3', path: `${LESSON_BASE_PATH}/wadiya-3`,
      title: 'الوضعية التدريبية 3 — حملة الكراريس', desc: 'مخطط دائري: نسبة من عدد، الكل من جزئه، وزاوية القطاع.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-ihsa_P1', '4am_wadiya-idmajiya-ihsa_P2', '4am_wadiya-idmajiya-ihsa_P3'],
      color: 'amber', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '04', number: 4, slug: 'wadiya-4', path: `${LESSON_BASE_PATH}/wadiya-4`,
      title: 'الوضعية التدريبية 4 — نادي البيئة وتدوير الورق', desc: 'قيمة مجهولة بالمتوسط، المدى والوسيط، ثمن الورق و 40%.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-ihsa_P1', '4am_wadiya-idmajiya-ihsa_P2', '4am_wadiya-idmajiya-ihsa_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '05', number: 5, slug: 'wadiya-5', path: `${LESSON_BASE_PATH}/wadiya-5`,
      title: 'الوضعية التدريبية 5 — ورشة النجارة', desc: 'تكرار ضائع بالتكرار الكلي، المتوسط والوسيط، و 5 كراسٍ على الأقل.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-ihsa_P1', '4am_wadiya-idmajiya-ihsa_P2', '4am_wadiya-idmajiya-ihsa_P3'],
      color: 'teal', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '06', number: 6, slug: 'wadiya-6', path: `${LESSON_BASE_PATH}/wadiya-6`,
      title: 'الوضعية التدريبية 6 — ساعات برّ الوالدين', desc: 'مدرّج بفئات: أقلّ من 4 ساعات، المتوسط التقريبي، الفئة الوسيطية.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-ihsa_P1', '4am_wadiya-idmajiya-ihsa_P2', '4am_wadiya-idmajiya-ihsa_P3'],
      color: 'violet', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '07', number: 7, slug: 'al-wadiya', path: `${LESSON_BASE_PATH}/al-wadiya`,
      title: 'الوضعية وتحليلها', desc: 'الميداليات الذهبية الأولمبية: قيمتان مخفيتان نجدهما باليد على ميزان القيم (الوسيط ثم المتوسط)، ثم عدد الدول التي لم تفز بالذهب بأخذ نسبة من عدد.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_wadiya-idmajiya-ihsa_P2', '4am_wadiya-idmajiya-ihsa_P3'],
      color: 'amber', style: 'featured', estimatedMin: 18, difficulty: 3, actionText: 'أقرأ الوضعية' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'وضعية أخرى: البطولة الإفريقية لألعاب القوى — قيمتان مخفيتان، ثم عدد الدول دون ميدالية ذهبية.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 7, difficulty: 4, actionText: 'أحلّ' },
  ],
};
