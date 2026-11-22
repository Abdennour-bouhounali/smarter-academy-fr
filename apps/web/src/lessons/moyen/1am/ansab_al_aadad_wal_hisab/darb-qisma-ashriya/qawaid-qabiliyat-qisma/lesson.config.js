/**
 * الدرس — قواعد قابلية القسمة (1AM, unité 3 « الحساب على الأعداد الطبيعية والأعداد العشرية: الضرب والقسمة »), item du
 * réseau 1am.m3.r02. A v2 lesson since 2026-11-18: the student plays it in the world « أرخبيل القواسم » (`lesson.pack.js`,
 * `world/`), built from scratch on the platform's own numbers; its module pages are deleted. The textbook only fixed its
 * الكفاءات (LESSON_DEVELOPMENT_GUIDE §4ter); the coverage map of the textbook stays docs/sources/1am/unit3/extraction.json.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/1am/ansab_al_aadad_wal_hisab/qawaid-qabiliyat-qisma';

export const LESSON_CONFIG = {
  id: 'qawaid-qabiliyat-qisma',
  kind: 'lesson',
  unit: 'darb-qisma-ashriya',
  unitTitle: 'الحساب على الأعداد الطبيعية والأعداد العشرية: الضرب والقسمة',
  sequentialUnlock: true,
  title: 'قواعد قابلية القسمة',
  description: 'نعرف دون أن نقسم إن كان عدد يقبل القسمة على 2 أو 5 (رقم آحاده)، على 3 أو 9 (مجموع أرقامه)، على 4 (العدد المشكّل من رقميه الأخيرين)، ونعبّر عن ذلك بباقي قسمة إقليدية معدوم.',
  level: 'moyen',
  grade: '1am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🔎',
  estimatedDurationMin: 86,
  skills: [
    'التعرّف على عدد يقبل القسمة على 2 أو على 5 من خلال رقم آحاده',
    'التعرّف على عدد يقبل القسمة على 3 أو على 9 من خلال مجموع أرقامه',
    'التعرّف على عدد يقبل القسمة على 4 من خلال العدد المشكّل من رقميه الأخيرين',
    'التعبير عن «a يقبل القسمة على b» بباقي قسمة إقليدية معدوم',
  ],
  teachingScope: {
    include: ['قواعد قابلية القسمة على 2، 3، 4، 5، 9', 'قابلية القسمة ⇔ باقي القسمة الإقليدية معدوم', 'السنة الكبيسة: قابلية القسمة على 4 (واستثناء القرون)'],
    exclude: ['القسمة العشرية والقيمة المقرّبة (درس لاحق)', 'قواسم عدد والقاسم المشترك الأكبر (السنة الرابعة)'],
  },
  // A v2 lesson (docs/architecture/LESSON_V2.md §2, owner's order of 2026-11-18): the student's home is the game world of
  // `lesson.pack.js`. Its module PAGES and « مسألة الدرس » (`lessonProblem`) are deleted. The `modules` below stay as DATA:
  // their ids and numbers are how progress is stored (the world marks them, `onModule`), every report reads them, and
  // their addresses redirect home. `resources` stay as data too (exported to the DB).
  // The lesson's progressive map is the world's « خريطة المعارف »: the `KNOWLEDGE_GRAPH` of the knowledge its pack declares
  // (`lesson.pack.js › knowledge`) — the only one; its home mounts no other (LESSON_V2.md §2).
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // What the lesson builds on: the notion of multiple and the net item `1am.m3.r01` (القسمة الإقليدية — the lesson before).
  // The launch kit (« عُدّة الانطلاق », launchkit/families.js) is what checks them before the world opens.
  priorKnowledge: ['mudaaf-ibtidai', 'qisma-iqlidiya-baqi'],
  resources: [
    // DATA only (exported to the DB; `sourceElementIds` are read by scripts/check-textbook-coverage.mjs): the two
    // `digit-cards` labs below are mounted by no page since the module pages were deleted (OLD_VERSION_TRACE §8.5, 11).
    {
      kind: 'manipulation', code: 'digit-cards-grid', type: 'digit-cards', module: 1,
      level: 'beginner',
      title: 'جدول الأعداد من 0 إلى 48',
      objective: 'قابلية القسمة تُقرأ دون إجراء القسمة: رقم الآحاد للقسمة على 2 و 5، مجموع الأرقام للقسمة على 3 و 9، الرقمان الأخيران للقسمة على 4؛ أي باقٍ معدوم',
      autonomy: '',
      experience: { type: 'textbook', reason: '' },
      learningPointIds: ['1am_qawaid-qabiliyat-qisma_P1', '1am_qawaid-qabiliyat-qisma_P2', '1am_qawaid-qabiliyat-qisma_P4'],
      sourceElementIds: ['act-4'],
    },
    {
      kind: 'manipulation', code: 'digit-cards-4593', type: 'digit-cards', module: 1,
      level: 'advanced',
      title: 'البطاقات 4 ، 5 ، 9 ، 3',
      objective: 'قابلية القسمة تُقرأ دون إجراء القسمة: رقم الآحاد للقسمة على 2 و 5، مجموع الأرقام للقسمة على 3 و 9، الرقمان الأخيران للقسمة على 4؛ أي باقٍ معدوم',
      autonomy: 'يشكّل التلميذ بنفسه الأعداد بأربع بطاقات، ويحكم على خمس قابليات قسمة قبل أن يرى الباقي، ويقرّر متى يكون المطلوب مستحيلًا (على 4 وعلى 9)',
      experience: { type: 'textbook', reason: '' },
      learningPointIds: ['1am_qawaid-qabiliyat-qisma_P1', '1am_qawaid-qabiliyat-qisma_P2', '1am_qawaid-qabiliyat-qisma_P3'],
      sourceElementIds: ['ex-26'],
    },
    { kind: 'situation', code: 'masala-1', module: 6, title: 'مسألة الدرس — الرمز السرّي لخزانة النادي', learningPointIds: ['1am_qawaid-qabiliyat-qisma_P1', '1am_qawaid-qabiliyat-qisma_P2', '1am_qawaid-qabiliyat-qisma_P3'] },
    { kind: 'situation', code: 'masala-2', module: 7, title: 'مسألة — قفّة رمضان: 2340 علبة تمر', learningPointIds: ['1am_qawaid-qabiliyat-qisma_P1', '1am_qawaid-qabiliyat-qisma_P2', '1am_qawaid-qabiliyat-qisma_P3', '1am_qawaid-qabiliyat-qisma_P4'] },
    { kind: 'situation', code: 'masala-3', module: 8, title: 'مسألة — رزنامة نادي الفلك', learningPointIds: ['1am_qawaid-qabiliyat-qisma_P3', '1am_qawaid-qabiliyat-qisma_P4'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ما يلزم قبل الدرس، تقيسه « عُدّة الانطلاق »: المضاعفات والقسمة الإقليدية.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'رقم الآحاد ومجموع الأرقام', desc: 'القسمة على 2 و 5 من رقم الآحاد، وعلى 3 و 9 من مجموع الأرقام.',
      stage: 'trigger', teachesLearningPointIds: ['1am_qawaid-qabiliyat-qisma_P1', '1am_qawaid-qabiliyat-qisma_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 1, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'يقبل القسمة: الباقي معدوم', desc: 'معنى «يقبل القسمة»، وقواعد القسمة على 2 و 5 و 3 و 9.',
      stage: 'discovery', teachesLearningPointIds: ['1am_qawaid-qabiliyat-qisma_P1', '1am_qawaid-qabiliyat-qisma_P2', '1am_qawaid-qabiliyat-qisma_P4'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'القسمة على 4: الرقمان الأخيران', desc: 'لماذا يكفي العدد المكوَّن من رقمي العشرات والآحاد؟',
      stage: 'formalization', teachesLearningPointIds: ['1am_qawaid-qabiliyat-qisma_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'على 2 و 5، على 3 و 9، على 4: نحكم ثم نتحقّق بالباقي.',
      stage: 'practice_lab', teachesLearningPointIds: ['1am_qawaid-qabiliyat-qisma_P1', '1am_qawaid-qabiliyat-qisma_P2', '1am_qawaid-qabiliyat-qisma_P3', '1am_qawaid-qabiliyat-qisma_P4'],
      color: 'amber', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'sana-kabisa', path: `${LESSON_BASE_PATH}/sana-kabisa`,
      title: 'تحدّي الوحدة', desc: 'وضعية تجمع قواعد قابلية القسمة، تُحسب عند إتمام الدرس.',
      stage: 'practice_lab', teachesLearningPointIds: ['1am_qawaid-qabiliyat-qisma_P3'],
      color: 'rose', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أرفع التحدّي' },
    { id: '06', number: 6, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة الدرس', desc: 'وضعية تُحلّ بقواعد قابلية القسمة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_qawaid-qabiliyat-qisma_P1', '1am_qawaid-qabiliyat-qisma_P2', '1am_qawaid-qabiliyat-qisma_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2', desc: 'وضعية أخرى تُحسب عند إتمام الدرس.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_qawaid-qabiliyat-qisma_P1', '1am_qawaid-qabiliyat-qisma_P2', '1am_qawaid-qabiliyat-qisma_P3', '1am_qawaid-qabiliyat-qisma_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3', desc: 'وضعية ثالثة تُحسب عند إتمام الدرس.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_qawaid-qabiliyat-qisma_P3', '1am_qawaid-qabiliyat-qisma_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '09', number: 9, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'التقويم', desc: 'تقويم الكفاءات: أسئلة على منوال الامتحان.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
