/**
 * الدرس — القسمة الإقليدية (1AM, unité 3 « الحساب على الأعداد الطبيعية والأعداد العشرية: الضرب والقسمة »), item du réseau
 * 1am.m3.r01. A v2 lesson since 2026-11-18: the student plays it in the world « أرخبيل القواسم » (`lesson.pack.js`,
 * `world/`), built from scratch on the platform's own numbers; its module pages are deleted. The textbook only fixed its
 * الكفاءات (LESSON_DEVELOPMENT_GUIDE §4ter); the coverage map of the textbook stays docs/sources/1am/unit3/extraction.json.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/1am/ansab_al_aadad_wal_hisab/qisma-iqlidiya-baqi';

export const LESSON_CONFIG = {
  id: 'qisma-iqlidiya-baqi',
  kind: 'lesson',
  unit: 'darb-qisma-ashriya',
  unitTitle: 'الحساب على الأعداد الطبيعية والأعداد العشرية: الضرب والقسمة',
  sequentialUnlock: true,
  title: 'القسمة الإقليدية',
  description: 'نشكّل أكبر عدد ممكن من المجموعات الكاملة ونتوقّف عندما يصبح الباقي أصغر من المقسوم عليه: نعيّن حاصل القسمة الإقليدية وباقيها، نكتب a = b × q + r مع r < b، ونوظّفها في مشكلات توزيع وتجميع.',
  level: 'moyen',
  grade: '1am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '➗',
  estimatedDurationMin: 78,
  skills: [
    'إنجاز القسمة الإقليدية لعدد طبيعي على عدد طبيعي غير معدوم مكتوب برقم واحد أو رقمين',
    'كتابة المساواة a = b × q + r مع r < b وتسمية المقسوم والمقسوم عليه والحاصل والباقي',
    'توظيف القسمة الإقليدية لحل مشكلات توزيع وتجميع',
  ],
  teachingScope: {
    include: ['القسمة الإقليدية: أكبر عدد من المجموعات الكاملة، والباقي أصغر من المقسوم عليه', 'المساواة a = b × q + r والحصر b × q ≤ a < b × (q + 1)', 'إنجاز القسمة عموديا وبالآلة الحاسبة', 'تفسير الحاصل والباقي في مشكلة'],
    exclude: ['قواعد قابلية القسمة (الدرس التالي)', 'القسمة العشرية والقيمة المقرّبة لحاصل قسمة (درس لاحق)'],
  },
  // A v2 lesson (docs/architecture/LESSON_V2.md §2, owner's order of 2026-11-18): the student's home is the game world of
  // `lesson.pack.js`. Its module PAGES and « مسألة الدرس » (`lessonProblem`) are deleted. The `modules` below stay as DATA:
  // their ids and numbers are how progress is stored (the world marks them, `onModule`), every report reads them, and
  // their addresses redirect home. `resources` stay as data too (exported to the DB).
  // The lesson's progressive map is the world's « خريطة المعارف »: the `KNOWLEDGE_GRAPH` of the knowledge its pack declares
  // (`lesson.pack.js › knowledge`) — the only one; its home mounts no other (LESSON_V2.md §2).
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // What the lesson builds on: the division of primary school and the net item `1am.m1.r01` (جمع، طرح وضرب أعداد طبيعية).
  // The launch kit (« عُدّة الانطلاق », launchkit/families.js) is what checks them before the world opens.
  priorKnowledge: ['qisma-ibtidai', 'darb-tabii', 'tarh-tabii'],
  resources: [
    // DATA only (exported to the DB; `sourceElementIds` are read by scripts/check-textbook-coverage.mjs): the three
    // `division-jumps` labs below are mounted by no page since the module pages were deleted (OLD_VERSION_TRACE §8.5, 11).
    {
      kind: 'manipulation', code: 'division-jumps-flowers', type: 'division-jumps', module: 1,
      level: 'beginner',
      title: 'باقات العرفان: 47 زهرة',
      objective: 'الحاصل هو أكبر عدد من المجموعات الكاملة: نتوقّف عندما يصبح الباقي أصغر من المقسوم عليه، a = b × q + r مع r < b',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'garden' },
      learningPointIds: ['1am_qisma-iqlidiya-baqi_P1', '1am_qisma-iqlidiya-baqi_P2'],
      sourceElementIds: ['act-3'],
    },
    {
      kind: 'manipulation', code: 'division-jumps-279', type: 'division-jumps', module: 1,
      level: 'advanced',
      title: '279 زهرة في باقات من 14',
      objective: 'الحاصل هو أكبر عدد من المجموعات الكاملة: نتوقّف عندما يصبح الباقي أصغر من المقسوم عليه، a = b × q + r مع r < b',
      autonomy: 'أعداد كبيرة على مستقيم مدرّج بقفزات من 14 دون كتابة المضاعفات: يقدّر التلميذ بنفسه عدد القفزات (10؟ 20؟) ويحصر 279 بين مضاعفين متتاليين',
      experience: { type: 'textbook', reason: '' },
      learningPointIds: ['1am_qisma-iqlidiya-baqi_P1', '1am_qisma-iqlidiya-baqi_P2'],
      sourceElementIds: ['act-3'],
    },
    {
      kind: 'manipulation', code: 'division-jumps-253', type: 'division-jumps', module: 2,
      title: '253 لؤلؤة في عقود من 17',
      learningPointIds: ['1am_qisma-iqlidiya-baqi_P2'],
      sourceElementIds: ['know-2'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — بائع الزهور: 350 زهرة', learningPointIds: ['1am_qisma-iqlidiya-baqi_P1', '1am_qisma-iqlidiya-baqi_P2', '1am_qisma-iqlidiya-baqi_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — حافلات المخيّم الكشفي', learningPointIds: ['1am_qisma-iqlidiya-baqi_P1', '1am_qisma-iqlidiya-baqi_P3'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — حملة التشجير: 75 يومًا', learningPointIds: ['1am_qisma-iqlidiya-baqi_P1', '1am_qisma-iqlidiya-baqi_P2', '1am_qisma-iqlidiya-baqi_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ما يلزم قبل الدرس، تقيسه « عُدّة الانطلاق »: الضرب والطرح والقسمة في الابتدائي.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'المجموعات الكاملة', desc: 'كم مجموعة كاملة نشكّل؟ وكم يبقى؟',
      stage: 'trigger', teachesLearningPointIds: ['1am_qisma-iqlidiya-baqi_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 1, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'الباقي ومساواة القسمة الإقليدية', desc: 'الباقي أصغر من المقسوم عليه: a = b × q + r مع r < b.',
      stage: 'discovery', teachesLearningPointIds: ['1am_qisma-iqlidiya-baqi_P1', '1am_qisma-iqlidiya-baqi_P2'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'تقدير الحاصل', desc: 'للقسمة على عدد من رقمين نقدّر عشرات الحاصل أوّلًا، ثمّ آحاده.',
      stage: 'practice_lab', teachesLearningPointIds: ['1am_qisma-iqlidiya-baqi_P1', '1am_qisma-iqlidiya-baqi_P2'],
      color: 'amber', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتدرّب' },
    { id: '04', number: 4, slug: 'masail-kitab', path: `${LESSON_BASE_PATH}/masail-kitab`,
      title: 'الباقي في مسألة', desc: 'ماذا يعني الحاصل والباقي في وضعية توزيع أو تجميع؟',
      stage: 'practice_lab', teachesLearningPointIds: ['1am_qisma-iqlidiya-baqi_P1', '1am_qisma-iqlidiya-baqi_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة الدرس', desc: 'وضعية تُحلّ بالقسمة الإقليدية.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_qisma-iqlidiya-baqi_P1', '1am_qisma-iqlidiya-baqi_P2', '1am_qisma-iqlidiya-baqi_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2', desc: 'وضعية أخرى تُحسب عند إتمام الدرس.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_qisma-iqlidiya-baqi_P1', '1am_qisma-iqlidiya-baqi_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3', desc: 'وضعية ثالثة تُحسب عند إتمام الدرس.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_qisma-iqlidiya-baqi_P1', '1am_qisma-iqlidiya-baqi_P2', '1am_qisma-iqlidiya-baqi_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'التقويم', desc: 'تقويم الكفاءات: أسئلة على منوال الامتحان.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
