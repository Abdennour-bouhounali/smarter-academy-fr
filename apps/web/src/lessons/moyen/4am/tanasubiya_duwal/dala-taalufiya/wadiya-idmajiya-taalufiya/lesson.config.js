/**
 * أدمج تعلّماتي — الوحدة 7 « الدالة التآلفية » (kind: synthesis)
 * Le manuel fourni (pp. 77–79) n'a ni « أدمج تعلّماتي », ni « أؤكّد تعلّماتي », ni « أتعمّق » pour cette
 * unité : la situation (رحلة إلى شاطئ تيبازة) et le test sont des AJOUTS DÉCLARÉS de la plateforme
 * (`addition('synthesis_generation')`, content/*.js). Ce n'est PAS un sixième درس : c'est la synthèse
 * de l'unité, qui mobilise les cinq دروس (chaque partie renvoie au sien).
 * Format de l'unité 1 (`wadiya-idmajiya-aadad`), depuis le 2026-10-13 : six « الوضعية التدريبية »
 * (modules 1 à 6, `track: 'problem'`, content/problems.js), la situation de la plateforme (module 7,
 * رحلة إلى شاطئ تيبازة, juste avant le test) puis le test « إختبار أولي » (module 8). Ni « أؤكّد تعلّماتي »
 * ni « أتعمّق » (décision du propriétaire).
 *
 * Rétrofit 2026-10-15 (§4quater, synthèse : format fixe, retouches minimales) : module 7 sans titre / `lead` de workspace (le contexte
 * de chaque niveau est le `lead` du labo) et la boîte « تحليل الوضعية » de l'étape 2 passée APRÈS la réponse. La carte de la situation
 * reste au-dessus du labo (c'est l'énoncé des étapes 1–8, le labo ne sert qu'à l'étape 7) ; modules 0–6 et 8 inchangés (pas de labo).
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/tanasubiya_duwal/wadiya-idmajiya-taalufiya';

export const LESSON_CONFIG = {
  id: 'wadiya-idmajiya-taalufiya',
  kind: 'synthesis',
  unit: 'dala-taalufiya',
  unitTitle: 'الدالة التآلفية',
  sequentialUnlock: true,
  title: 'أدمج تعلّماتي — الدالة التآلفية',
  description: 'ست وضعيات تدريبية تمهّد لإدماج موارد الوحدة في وضعية مركبة: رحلة القسم إلى شاطئ تيبازة (عدد المشاركين بجملة معادلتين تُقرأ بيانيا، ثمن الحافلة دالة تآلفية، عرض ناقل ثانٍ من عددين وصورتيهما، المقارنة بنقطة تقاطع المستقيمين، ثم اختيار صيغة كراء القوارب بين ثلاث صيغ)، ثم اختبار نهائي في رحلة أخرى.',
  level: 'moyen',
  grade: '4am',
  chapter: 'tanasubiya_duwal',
  chapterTitle: 'ميدان التناسبية والدوال',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🏖️',
  estimatedDurationMin: 70,
  textbookRef: { unit: 7, pages: '77, 78, 79' },
  skills: [
    'تجنيد موارد الوحدة (الدالة التآلفية، الدالة الخطية، التفسير البياني لجملة معادلتين، والمفاضلة بين الصيغ) لحل وضعية مركبة',
    'تحليل وضعية واقعية مركبة ونمذجة معطياتها: عدد المشاركين، ثمن الحافلة، وصيغ كراء القوارب',
    'اختيار استراتيجية جبرية أو بيانية لكل جزء، ثم تفسير النتائج في سياق الوضعية (عدد طبيعي، بالدينار، في حدود المبلغ المتاح)',
  ],
  teachingScope: {
    include: ['ست وضعيات تدريبية: مكتبة الحيّ، سيارة الأجرة، فاتورة الماء، تعاونية المدرسة، عرضا الهاتف، الشمعتان', 'أدمج تعلّماتي: وضعية رحلة إلى شاطئ تيبازة وتحليلها في ثلاث مراحل', 'وضعية الاختبار النهائي: رحلة أخرى إلى شاطئ الصابلات'],
    exclude: ['أي مفهوم جديد', 'الحل الجبري للمتراجحات خارج سياق المفاضلة'],
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Ce que la situation et le test mobilisent, diagnostiqué par « أستعدّ »
  // (affirmations de la plateforme), une ressource par درس : image et antécédent, famille تآلفية /
  // خطية / ثابتة (درس 1) ; ترتيب عند المبدأ et معامل التوجيه lus sur la droite (درس 2) ; تناسب
  // التغيّرات (درس 3) ; la solution d'une جملة = le point d'intersection (درس 4) ; comparer deux tarifs (درس 5).
  priorKnowledge: ['sura-taalufiya', 'adad-sura', 'naw-dala', 'tartib-mabda', 'muamil-tawjih', 'tanasub-taghayyurat', 'taqatu-jumla', 'mufadala'],
  resources: [
    // Modules 1–6 — six وضعيات d'entraînement (content/problems.js), ajouts de la plateforme
    // (`addition('exam_style_problem')`) : elles précèdent la situation du module 7 et le test du module 8.
    { kind: 'situation', code: 'wadiya-1', module: 1, title: 'وضعية 1 — مكتبة الحيّ: بطاقة اشتراك 300 دج و 25 دج عن كل كتاب', learningPointIds: ['4am_wadiya-idmajiya-taalufiya_P1', '4am_wadiya-idmajiya-taalufiya_P2'] },
    { kind: 'situation', code: 'wadiya-2', module: 2, title: 'وضعية 2 — سيارة الأجرة: مستقيمان (A) و (B) ونقطة تقاطعهما', learningPointIds: ['4am_wadiya-idmajiya-taalufiya_P1', '4am_wadiya-idmajiya-taalufiya_P2'] },
    { kind: 'situation', code: 'wadiya-3', module: 3, title: 'وضعية 3 — فاتورة الماء من قراءتين: رسم ثابت وثمن المتر المكعب', learningPointIds: ['4am_wadiya-idmajiya-taalufiya_P1'] },
    { kind: 'situation', code: 'wadiya-4', module: 4, title: 'وضعية 4 — تعاونية المدرسة: جملة معادلتين تُقرأ بيانيا', learningPointIds: ['4am_wadiya-idmajiya-taalufiya_P1', '4am_wadiya-idmajiya-taalufiya_P2'] },
    { kind: 'situation', code: 'wadiya-5', module: 5, title: 'وضعية 5 — عرضا الهاتف: عرض مجهول الدستور وميزانية 1300 دج', learningPointIds: ['4am_wadiya-idmajiya-taalufiya_P1', '4am_wadiya-idmajiya-taalufiya_P2'] },
    { kind: 'situation', code: 'wadiya-6', module: 6, title: 'وضعية 6 — الشمعتان: دالتان تآلفيتان متناقصتان', learningPointIds: ['4am_wadiya-idmajiya-taalufiya_P1', '4am_wadiya-idmajiya-taalufiya_P2'] },
    { kind: 'situation', code: 'situation-rihla-tipaza', module: 7, title: 'وضعية: رحلة إلى شاطئ تيبازة', learningPointIds: ['4am_wadiya-idmajiya-taalufiya_P1', '4am_wadiya-idmajiya-taalufiya_P2'] },
    // Module 7 — les tarifs comparés (plan-compare, RÉUTILISÉ de « حل مشكلات وترييض وضعيات بتوظيف الدالة
    // التآلفية », monde `rental`) : la mathématique est l'objectif 8 de l'unité (p. 77) « إنجاز تمثيل
    // بياني لوضعية يتدخل فيها مقداران أحدهما معطى بدلالة الآخر، قراءته وتفسيره ».
    {
      kind: 'manipulation', code: 'plan-compare-darrajat', type: 'plan-compare', module: 7, level: 'beginner',
      title: 'كراء دراجة: رسم ثابت 200 DA و 50 DA للساعة، أو 100 DA للساعة',
      objective: 'المفاضلة بين صيغ تآلفية بدلالة عدد الساعات: نقطة تقاطع المستقيمين حيث تتساوى التكلفتان، والصيغة الأرخص قبلها وبعدها',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'smaller_numbers_for_first_contact', theme: 'rental' },
      learningPointIds: ['4am_wadiya-idmajiya-taalufiya_P1'],
      sourceElementIds: ['objectives'],
    },
    {
      kind: 'manipulation', code: 'plan-compare-kayak', type: 'plan-compare', module: 7, level: 'advanced',
      title: 'كراء قارب كاياك: ثلاث صيغ 150x و 50x + 300 و 600',
      objective: 'المفاضلة بين صيغ تآلفية بدلالة عدد الساعات: نقطة تقاطع المستقيمين حيث تتساوى التكلفتان، والصيغة الأرخص قبلها وبعدها',
      autonomy: 'ثلاث صيغ بدل اثنتين ودون مرحلة النمذجة الموجّهة: التلميذ يجد بنفسه نقطتي التقاطع المفيدتين (3 و 6 ساعات) ويقسّم عدد الساعات إلى ثلاثة مجالات، ثم يقرّر الصيغة الأنسب لـ 5 ساعات',
      experience: { type: 'platform_context', reason: 'larger_numbers_for_autonomy', theme: 'rental' },
      learningPointIds: ['4am_wadiya-idmajiya-taalufiya_P1', '4am_wadiya-idmajiya-taalufiya_P2'],
      sourceElementIds: ['objectives'],
    },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ثماني عبارات: صحيح أم خاطئ؟ الصورة والعدد الذي صورته، الترتيب عند المبدأ ومعامل التوجيه، تناسب التغيّرات، الجملة بيانيا، والمقارنة بين صيغتين.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    // Les وضعيات d'entraînement (track: 'problem') : practice_lab, avant la situation du module 7 et le test
    // (module 8). Elles comptent dans la complétion, jamais dans la maîtrise —
    // docs/lessons/MASAIL_GENERATION_GUIDE.md, §14 (synthèses).
    { id: '01', number: 1, slug: 'wadiya-1', path: `${LESSON_BASE_PATH}/wadiya-1`,
      title: 'الوضعية التدريبية 1 — مكتبة الحيّ', desc: 'بطاقة اشتراك سنوية أم دفع عن كل كتاب؟ دستور المبلغ، صورة عدد وعدد صورته، ثم المقارنة بين الصيغتين.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-taalufiya_P1', '4am_wadiya-idmajiya-taalufiya_P2'],
      color: 'sky', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '02', number: 2, slug: 'wadiya-2', path: `${LESSON_BASE_PATH}/wadiya-2`,
      title: 'الوضعية التدريبية 2 — سيارة الأجرة', desc: 'مستقيمان مرسومان لتسعيرتين: المبلغ عند الركوب، ثمن الكيلومتر، ونقطة التقاطع.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-taalufiya_P1', '4am_wadiya-idmajiya-taalufiya_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '03', number: 3, slug: 'wadiya-3', path: `${LESSON_BASE_PATH}/wadiya-3`,
      title: 'الوضعية التدريبية 3 — فاتورة الماء', desc: 'فاتورتان مقروءتان في جدول: ثمن المتر المكعب، الرسم الثابت، ثم فاتورة وكمية.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-taalufiya_P1'],
      color: 'emerald', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '04', number: 4, slug: 'wadiya-4', path: `${LESSON_BASE_PATH}/wadiya-4`,
      title: 'الوضعية التدريبية 4 — تعاونية المدرسة', desc: 'فطائر وكؤوس عصير: جملة معادلتين، مستقيمان، وحلّ يُقرأ من نقطة التقاطع.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-taalufiya_P1', '4am_wadiya-idmajiya-taalufiya_P2'],
      color: 'amber', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '05', number: 5, slug: 'wadiya-5', path: `${LESSON_BASE_PATH}/wadiya-5`,
      title: 'الوضعية التدريبية 5 — عرضا الهاتف', desc: 'عرض معلوم وعرض نعيّنه من فاتورتين: متى يتساويان؟ وأيّهما يسمح بأطول مكالمة بمبلغ محدّد؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-taalufiya_P1', '4am_wadiya-idmajiya-taalufiya_P2'],
      color: 'teal', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '06', number: 6, slug: 'wadiya-6', path: `${LESSON_BASE_PATH}/wadiya-6`,
      title: 'الوضعية التدريبية 6 — الشمعتان', desc: 'طولان يتناقصان مع الزمن: متى تنطفئ كل شمعة؟ ومتى يتساوى الطولان؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-taalufiya_P1', '4am_wadiya-idmajiya-taalufiya_P2'],
      color: 'violet', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '07', number: 7, slug: 'al-wadiya', path: `${LESSON_BASE_PATH}/al-wadiya`,
      title: 'الوضعية وتحليلها', desc: 'رحلة إلى شاطئ تيبازة: عدد المشاركين بيانيا، ثمن ناقلين نقارنهما بنقطة التقاطع، ثم ثلاث صيغ لكراء قارب كاياك على المخبر — وهل يكفي المبلغ المتبقّي؟',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_wadiya-idmajiya-taalufiya_P1', '4am_wadiya-idmajiya-taalufiya_P2'],
      color: 'amber', style: 'featured', estimatedMin: 18, difficulty: 3, actionText: 'أقرأ الوضعية' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'رحلة أخرى إلى شاطئ الصابلات: عدد المشاركين، دستور ثمن ناقل، المقارنة، صيغة الكراء، وأكبر عدد من التلاميذ في حدود المبلغ.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 7, difficulty: 4, actionText: 'أحلّ' },
  ],
};
