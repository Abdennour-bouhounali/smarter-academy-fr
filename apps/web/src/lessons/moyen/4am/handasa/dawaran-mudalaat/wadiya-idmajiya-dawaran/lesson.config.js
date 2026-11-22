/**
 * أدمج تعلّماتي — الوحدة 13 « الدوران - الزوايا - المضلّعات المنتظمة » (kind: synthesis)
 * Manuel 4AM, unité 13 : « أدمج تعلّماتي » (وضعية « الحديقة العمومية » + تحليل الوضعية, p. 160) — extraction.json › destinations.
 * Ce n'est PAS un cinquième درس.
 *
 * Depuis le 2026-10-13 (décision du propriétaire, modèle EXACT de la synthèse de l'unité 1) : SIX « وضعيات تدريبية » (modules 1 à 6,
 * `track: 'problem'`, content/problems.js — ajouts de la plateforme) PRÉCÈDENT l'analyse de la وضعية du manuel (module 7) et la
 * وضعية de l'épreuve finale (module 8). « أؤكّد تعلّماتي » et « أتعمّق » n'entrent PAS dans « أدمج تعلّماتي » : les anciens modules
 * 8 et 9 sont supprimés (remap depuis la disposition d'origine {1→7, 2→0, 3→0, 4→8}).
 *
 * Le parcours, phase par phase :
 *   S'ENTRAÎNER        modules 1–6 — six situations d'examen guidées (turbine d'Adrar, théâtre de Timgad, bassin décagonal, robot en
 *                      معلم, cour circulaire + طالس, cadran) : rotation, angle inscrit / au centre, polygone régulier, sinus
 *   ANALYSER           module 7 — « تحليل الوضعية النهائية للاختبار » : la commune entoure un massif de fleurs de 3 m de six
 *                      lampadaires également espacés ; le lab `lamp-ring` (le دوران pose chaque poteau comme image du précédent, le
 *                      tour ne se referme que si n·α = 360°, puis la distance se calcule dans le triangle) ; les briques et les
 *                      trois phases du manuel (قراءة · تحليل · تنفيذ), le plan au compas
 *   ÉVALUER            module 8 — « وضعية الاختبار النهائي » : la وضعية TRANSPOSÉE (8 lampadaires autour d'un rond-point d'Oran)
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/handasa/wadiya-idmajiya-dawaran';

export const LESSON_CONFIG = {
  id: 'wadiya-idmajiya-dawaran',
  kind: 'synthesis',
  unit: 'dawaran-mudalaat',
  unitTitle: 'الدوران - الزوايا - المضلّعات المنتظمة',
  sequentialUnlock: true,
  title: 'أدمج تعلّماتي — ترييض وضعيات هندسية مركبة بتوظيف الدوران والمضلعات المنتظمة',
  description: 'إدماج المعارف: ستة أعمدة إنارة متباعدة بنفس المسافة حول حيّز دائري لغرس الأزهار (الدوران، الزاوية المركزية، المضلع المنتظم، والنسب المثلثية في المثلث القائم) — بالتحليل المنهجي (قراءة · تحليل · تنفيذ)، تسبقها ست وضعيات تدريبية، ثم تحليل الوضعية النهائية ووضعية الاختبار النهائي.',
  level: 'moyen',
  grade: '4am',
  chapter: 'handasa',
  chapterTitle: 'ميدان الهندسة',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🌸',
  estimatedDurationMin: 35,
  textbookRef: { unit: 13, pages: '160' },
  skills: [
    'تجنيد الدوران وخواصه والزاوية المركزية والمضلعات المنتظمة لحل وضعية مركبة: توزيع أعمدة إنارة بانتظام حول حيّز دائري',
    'قراءة الوضعية وتحليلها: نمذجة الأعمدة برؤوس مضلع منتظم محاط بدائرة، وتحديد عدد الأعمدة ونصف القطر وزاوية الدوران',
    'اختيار استراتيجية الحل وتنفيذها: إنشاء المضلع المنتظم بمقياس مناسب، وحساب المسافة بين عمودين في المثلث القائم بالنسب المثلثية وتفسير النتيجة',
  ],
  teachingScope: {
    include: ['ست وضعيات تدريبية: دوران وزاوية محيطية ومضلع منتظم وجيب', 'وضعية الاختبار النهائي: أعمدة الإنارة حول دوّار وتحليلها في ثلاث مراحل'],
    exclude: ['أي مفهوم جديد', 'التحويلات المركبة (تركيب دورانين)', 'طول القوس كمفهوم مستقل عن محيط الدائرة'],
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Ce que la وضعية mobilise, diagnostiqué par « أستعدّ » (affirmations de la plateforme) :
  // l'image par un دوران et ses propriétés, l'angle inscrit et l'angle au centre, l'angle au centre 360°/n et la définition d'un
  // polygone régulier — les dourous 1 à 4 —, les angles et la hauteur d'un triangle isocèle, le sinus (unité 10), le cercle.
  priorKnowledge: ['sura-dawaran', 'khawas-dawaran-atwal', 'zawiya-muhitiya-markaziya', 'zawiya-markaziya-muntazam', 'mudalla-muntazam', 'zawaya-mutasawi-saqayn', 'irtifa-mutasawi-saqayn', 'jaib-zawiya', 'muhit-daira'],
  resources: [
    { kind: 'situation', code: 'situation-hadiqa-umumiya', module: 7, title: 'وضعية: أعمدة الإنارة حول حوض الأزهار في الحديقة العمومية', learningPointIds: ['4am_wadiya-idmajiya-dawaran_P1', '4am_wadiya-idmajiya-dawaran_P2', '4am_wadiya-idmajiya-dawaran_P3'], sourceElementIds: ['situation'] },
    // Modules 1–6 — six وضعيات d'entraînement (content/problems.js), ajouts de la plateforme (`exam_style_problem`).
    { kind: 'situation', code: 'wadiya-1', module: 1, title: 'وضعية 1 — عنفة الرياح بأدرار: ثلاث شفرات بدوران زاويته 120°', learningPointIds: ['4am_wadiya-idmajiya-dawaran_P1', '4am_wadiya-idmajiya-dawaran_P3'] },
    { kind: 'situation', code: 'wadiya-2', module: 2, title: 'وضعية 2 — مسرح تيمقاد: زاوية محيطية 35° ووتر الخشبة', learningPointIds: ['4am_wadiya-idmajiya-dawaran_P1', '4am_wadiya-idmajiya-dawaran_P3'] },
    { kind: 'situation', code: 'wadiya-3', module: 3, title: 'وضعية 3 — نافورة حديقة الحامة: حوض عشري منتظم', learningPointIds: ['4am_wadiya-idmajiya-dawaran_P2', '4am_wadiya-idmajiya-dawaran_P3'] },
    { kind: 'situation', code: 'wadiya-4', module: 4, title: 'وضعية 4 — روبوت المكتبة: ربع دورة في معلم', learningPointIds: ['4am_wadiya-idmajiya-dawaran_P1', '4am_wadiya-idmajiya-dawaran_P2'] },
    { kind: 'situation', code: 'wadiya-5', module: 5, title: 'وضعية 5 — حديقة الجدّ: قطر ودائرة وخاصية طالس', learningPointIds: ['4am_wadiya-idmajiya-dawaran_P1', '4am_wadiya-idmajiya-dawaran_P3'] },
    { kind: 'situation', code: 'wadiya-6', module: 6, title: 'وضعية 6 — ساعة قاعة المطالعة: اثنا عشر تدريجًا على دائرة', learningPointIds: ['4am_wadiya-idmajiya-dawaran_P2', '4am_wadiya-idmajiya-dawaran_P3'] },
    // Module 7 — مبتدئ : un petit massif (2 m) et 4 lampadaires (nombres de la plateforme : un carré, 2√2 m).
    {
      kind: 'manipulation', code: 'lamp-ring-4', type: 'lamp-ring', module: 7, level: 'beginner',
      title: 'حوض صغير وأربعة أعمدة (مثال من المنصّة)',
      objective: 'توزيع n عمودا بانتظام على دائرة: كل عمود صورة السابق بالدوران الذي زاويته 360°/n، والمسافة بين عمودين متتاليين تُحسب في المثلث القائم',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'smaller_numbers_for_first_contact', theme: 'flower-bed' },
      learningPointIds: ['4am_wadiya-idmajiya-dawaran_P2', '4am_wadiya-idmajiya-dawaran_P3'],
      sourceElementIds: ['situation'],
    },
    // Module 7 — متقدم : la وضعية du manuel (6 lampadaires, 3 m), puis 12 en extra.
    {
      kind: 'manipulation', code: 'lamp-ring-6', type: 'lamp-ring', module: 7, level: 'advanced',
      title: 'وضعية الكتاب: ستة أعمدة حول حيّز نصف قطره 3m',
      objective: 'توزيع n عمودا بانتظام على دائرة: كل عمود صورة السابق بالدوران الذي زاويته 360°/n، والمسافة بين عمودين متتاليين تُحسب في المثلث القائم',
      autonomy: 'وضعية الكتاب: ستة أعمدة تُوضع باليد دون اقتراح (يُرفض كل توزيع غير متساوي المسافات)، ثم عمود ثان واحد يحدّد زاوية الدوران دون قيمة مقترحة (تبقى الحلقة مفتوحة إن لم تكن 6 × α = 360°)، ثم يختار التلميذ طريقة حساب المسافة بنفسه بين أربع طرائق، ثم يغيّر عدد الأعمدة',
      experience: { type: 'textbook', reason: '', theme: 'flower-bed' },
      learningPointIds: ['4am_wadiya-idmajiya-dawaran_P1', '4am_wadiya-idmajiya-dawaran_P2', '4am_wadiya-idmajiya-dawaran_P3'],
      sourceElementIds: ['situation'],
    },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'تسع عبارات: صحيح أم خاطئ؟ صورة نقطة بدوران، الدوران يحافظ على الأطوال، الزاوية المحيطية والمركزية، الزاوية المركزية لمضلع منتظم وتعريفه، زوايا المثلث المتساوي الساقين وارتفاعه، الجيب، ومحيط الدائرة.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    // Les وضعيات d'entraînement (track: 'problem') : practice_lab, avant la وضعية du manuel (module 7). Elles comptent dans la complétion,
    // jamais dans la maîtrise — docs/lessons/MASAIL_GENERATION_GUIDE.md, §14 (synthèses).
    { id: '01', number: 1, slug: 'wadiya-1', path: `${LESSON_BASE_PATH}/wadiya-1`,
      title: 'الوضعية التدريبية 1 — عنفة الرياح بأدرار', desc: 'ثلاث شفرات صور بعضها بدوران: زاوية الدوران، طبيعة المثلث، وطول الكابل بين الأطراف.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-dawaran_P1', '4am_wadiya-idmajiya-dawaran_P2', '4am_wadiya-idmajiya-dawaran_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '02', number: 2, slug: 'wadiya-2', path: `${LESSON_BASE_PATH}/wadiya-2`,
      title: 'الوضعية التدريبية 2 — مسرح تيمقاد', desc: 'زاوية محيطية 35°: الزاوية المركزية، وطول الخشبة، وثمن الحبل.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-dawaran_P1', '4am_wadiya-idmajiya-dawaran_P2', '4am_wadiya-idmajiya-dawaran_P3'],
      color: 'sky', style: 'featured', estimatedMin: 5, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '03', number: 3, slug: 'wadiya-3', path: `${LESSON_BASE_PATH}/wadiya-3`,
      title: 'الوضعية التدريبية 3 — نافورة حديقة الحامة', desc: 'حوض عشري منتظم: الزاوية المركزية وزاوية الحوض، الضلع، وشريط الحافة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-dawaran_P1', '4am_wadiya-idmajiya-dawaran_P2', '4am_wadiya-idmajiya-dawaran_P3'],
      color: 'amber', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '04', number: 4, slug: 'wadiya-4', path: `${LESSON_BASE_PATH}/wadiya-4`,
      title: 'الوضعية التدريبية 4 — روبوت المكتبة', desc: 'ربع دورة حول المحطة في معلم: إحداثيتا الصورة، المسافات المحفوظة، والمربع.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-dawaran_P1', '4am_wadiya-idmajiya-dawaran_P2', '4am_wadiya-idmajiya-dawaran_P3'],
      color: 'rose', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '05', number: 5, slug: 'wadiya-5', path: `${LESSON_BASE_PATH}/wadiya-5`,
      title: 'الوضعية التدريبية 5 — حديقة الجدّ', desc: 'قطر ودائرة: مثلث قائم، قيس زاوية بالجيب، الزاوية المركزية، وخاصية طالس.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-dawaran_P1', '4am_wadiya-idmajiya-dawaran_P2', '4am_wadiya-idmajiya-dawaran_P3'],
      color: 'violet', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '06', number: 6, slug: 'wadiya-6', path: `${LESSON_BASE_PATH}/wadiya-6`,
      title: 'الوضعية التدريبية 6 — ساعة قاعة المطالعة', desc: 'اثنا عشر تدريجًا رؤوس مضلع منتظم: الزاوية، اتجاه الدوران، الأوتار، وخيط الإضاءة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-dawaran_P1', '4am_wadiya-idmajiya-dawaran_P2', '4am_wadiya-idmajiya-dawaran_P3'],
      color: 'teal', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '07', number: 7, slug: 'al-wadiya', path: `${LESSON_BASE_PATH}/al-wadiya`,
      title: 'تحليل الوضعية النهائية للاختبار', desc: 'أعمدة الإنارة حول حوض الأزهار: قراءة الوضعية، السداسي المنتظم والدوران الذي زاويته 60°، المسافة بين عمودين في المثلث المتقايس الأضلاع ثم في المثلث القائم، والمخطط بمقياس.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_wadiya-idmajiya-dawaran_P1', '4am_wadiya-idmajiya-dawaran_P2', '4am_wadiya-idmajiya-dawaran_P3'],
      color: 'amber', style: 'featured', estimatedMin: 22, difficulty: 3, actionText: 'أقرأ الوضعية' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'وضعية الاختبار النهائي', desc: 'وضعية أخرى: أعمدة الإنارة حول دوّار بوهران.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 7, difficulty: 4, actionText: 'أحلّ' },
  ],
};
