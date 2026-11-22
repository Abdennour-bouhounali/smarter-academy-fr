/**
 * الدرس — القسمة الإقليدية وحصر حاصل القسمة (2AM, unité 2 « الكسور والعمليات عليها ») — la PREMIÈRE leçon de 2AM, items du
 * réseau 2am.m1.r04 et 2am.m1.r06. Le réseau : 2am.m1.r04 PROLONGE 1am.m3.r01 (qisma-iqlidiya-baqi) ; ce qui est ajouté :
 * tout diviseur, et le quotient a ÷ b encadré entre deux entiers consécutifs (2am.m1.r06).
 * A v2 lesson since 2026-11-18: the student plays it in the world « أرخبيل القواسم » (`lesson.pack.js`, `world/`), built
 * from scratch on the platform's own numbers; its module pages are deleted. The textbook only fixed its الكفاءات
 * (LESSON_DEVELOPMENT_GUIDE §4ter); the coverage map of the textbook stays docs/sources/2am/unit2/extraction.json.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab/qisma-iqlidiya-hasr';

export const LESSON_CONFIG = {
  id: 'qisma-iqlidiya-hasr',
  kind: 'lesson',
  unit: 'kusur-amaliyat',
  unitTitle: 'الكسور والعمليات عليها',
  sequentialUnlock: true,
  title: 'القسمة الإقليدية وحصر حاصل القسمة',
  description: 'نقسم على أيّ عدد غير معدوم، ونكتشف أنّ حاصل القسمة a ÷ b عدد يقع بين عددين طبيعيين متتاليين: الألواح الكاملة والألواح اللازمة، ويقع على عدد طبيعي بالضبط عندما يكون الباقي معدومًا.',
  level: 'moyen',
  grade: '2am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '📏',
  estimatedDurationMin: 86,
  skills: [
    'تعيين حاصل وباقي القسمة الإقليدية لعدد طبيعي على أيّ عدد طبيعي غير معدوم، وكتابة a = b × q + r مع 0 ≤ r < b',
    'حصر حاصل القسمة a ÷ b بين عددين طبيعيين متتاليين وتسمية طرفيه قيمتين مقرّبتين إلى الوحدة بالنقصان وبالزيادة',
    'التعبير عن انعدام الباقي: a يقبل القسمة على b ، a مضاعف لـ b ، b يقسم a',
  ],
  teachingScope: {
    include: ['القسمة الإقليدية على أيّ قاسم (برقم أو رقمين أو ثلاثة) وبأعداد كبيرة', 'حصر a ÷ b بين عددين طبيعيين متتاليين: q < a ÷ b < q + 1', 'القيمتان المقرّبتان إلى الوحدة بالنقصان وبالزيادة ومعناهما في مشكلة', 'الباقي المعدوم: a ÷ b عدد طبيعي، يقبل القسمة، مضاعف، يقسم'],
    // « الدرس التالي » = درس kasr-hasil-qisma (publié 2026-10-29 ; P4 ← 2am_qisma-iqlidiya-hasr_P2 — pas d'arête inverse : cycle).
    exclude: ['القسمة العشرية والقيم المقرّبة إلى 0,1 أو 0,01 (الدرس التالي)', 'إعادة بناء القسمة الإقليدية بقاسم برقم أو رقمين (السنة الأولى: نتذكّرها فقط)', 'العمليات على الكسور (دروس لاحقة من الوحدة)'],
  },
  // A v2 lesson (docs/architecture/LESSON_V2.md §2, owner's order of 2026-11-18): the student's home is the game world of
  // `lesson.pack.js`. Its module PAGES and « مسألة الدرس » (`lessonProblem`) are deleted. The `modules` below stay as DATA:
  // their ids and numbers are how progress is stored (the world marks them, `onModule`), every report reads them, and
  // their addresses redirect home. `resources` stay as data too (exported to the DB).
  // The lesson's progressive map is the world's « خريطة المعارف »: the `KNOWLEDGE_GRAPH` of the knowledge its pack declares
  // (`lesson.pack.js › knowledge`) — the only one; its home mounts no other (LESSON_V2.md §2).
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // What the lesson builds on: the net items `1am.m3.r01` (the 1AM Euclidean division) and `2am.m1.r05` (the approximate
  // value to the unit), and the fraction as a quotient. The launch kit (« عُدّة الانطلاق », launchkit/families.js) is what
  // checks them before the world opens.
  priorKnowledge: ['qisma-iqlidiya', 'kasr-hasil-qisma', 'qima-muqarraba-wahda'],
  resources: [
    // DATA only (exported to the DB; `sourceElementIds` are read by scripts/check-textbook-coverage.mjs): the two
    // `egg-trays` labs below are mounted by no page since the module pages were deleted (OLD_VERSION_TRACE §8.5, 11).
    {
      kind: 'manipulation', code: 'egg-trays-carton', type: 'egg-trays', module: 1,
      level: 'beginner',
      title: 'سلّة سلمى: علب من 12 بيضة',
      objective: 'حاصل القسمة a ÷ b يقع بين عددين طبيعيين متتاليين (المملوءة واللازمة)، ويقع على عدد طبيعي بالضبط عندما يكون الباقي معدومًا',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'farm' },
      learningPointIds: ['2am_qisma-iqlidiya-hasr_P1', '2am_qisma-iqlidiya-hasr_P2', '2am_qisma-iqlidiya-hasr_P3'],
      sourceElementIds: ['act-1'],
    },
    {
      kind: 'manipulation', code: 'egg-trays-2145', type: 'egg-trays', module: 1,
      level: 'advanced',
      title: '2145 بيضة في صفائح من 30',
      objective: 'حاصل القسمة a ÷ b يقع بين عددين طبيعيين متتاليين (المملوءة واللازمة)، ويقع على عدد طبيعي بالضبط عندما يكون الباقي معدومًا',
      autonomy: 'أعداد كبيرة دون رسم كل بيضة: يقدّر التلميذ بنفسه موضع الحاصل (30 × 70 = 2100) قبل التعبئة، ويعبّئ بالرزم والصفائح والبيض، ثم يحكم على قسمة ابن صاحب المزرعة',
      experience: { type: 'textbook', reason: '', theme: 'farm' },
      learningPointIds: ['2am_qisma-iqlidiya-hasr_P1', '2am_qisma-iqlidiya-hasr_P2', '2am_qisma-iqlidiya-hasr_P3'],
      sourceElementIds: ['act-1'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — تعاونية البيض: 4750 بيضة', learningPointIds: ['2am_qisma-iqlidiya-hasr_P1', '2am_qisma-iqlidiya-hasr_P2'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — حافلات الرحلة المدرسية', learningPointIds: ['2am_qisma-iqlidiya-hasr_P1', '2am_qisma-iqlidiya-hasr_P2'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — قفف التضامن', learningPointIds: ['2am_qisma-iqlidiya-hasr_P1', '2am_qisma-iqlidiya-hasr_P2', '2am_qisma-iqlidiya-hasr_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ما يلزم قبل الدرس، تقيسه « عُدّة الانطلاق »: القسمة الإقليدية، الكسر حاصل قسمة، والقيمة المقرّبة إلى الوحدة.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 7, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'القسمة على أيّ عدد', desc: 'أين يقع حاصل القسمة؟ بين عددين طبيعيين متتاليين.',
      stage: 'trigger', teachesLearningPointIds: ['2am_qisma-iqlidiya-hasr_P1', '2am_qisma-iqlidiya-hasr_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 15, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'القسمة الإقليدية وحصر الحاصل', desc: 'التعريف مع 0 ≤ r < b، الباقي المعدوم، والقيمتان المقرّبتان إلى الوحدة.',
      stage: 'discovery', teachesLearningPointIds: ['2am_qisma-iqlidiya-hasr_P1', '2am_qisma-iqlidiya-hasr_P2', '2am_qisma-iqlidiya-hasr_P3'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'حصر حاصل قسمة كبيرة', desc: 'بالمضاعفات 10 و 100 أقترب من الحاصل دون آلة حاسبة.',
      stage: 'formalization', teachesLearningPointIds: ['2am_qisma-iqlidiya-hasr_P1', '2am_qisma-iqlidiya-hasr_P2'],
      color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'تمارين على منوال اختبارات الفصل الأول.',
      stage: 'practice_lab', teachesLearningPointIds: ['2am_qisma-iqlidiya-hasr_P1', '2am_qisma-iqlidiya-hasr_P2', '2am_qisma-iqlidiya-hasr_P3'],
      color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة الدرس', desc: 'وضعية تُحلّ بالقسمة الإقليدية: ما يمتلئ كاملًا وما يلزم.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_qisma-iqlidiya-hasr_P1', '2am_qisma-iqlidiya-hasr_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2', desc: 'وضعية أخرى تُحسب عند إتمام الدرس.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_qisma-iqlidiya-hasr_P1', '2am_qisma-iqlidiya-hasr_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3', desc: 'وضعية ثالثة تُحسب عند إتمام الدرس.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_qisma-iqlidiya-hasr_P1', '2am_qisma-iqlidiya-hasr_P2', '2am_qisma-iqlidiya-hasr_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'التقويم', desc: 'تقويم الكفاءات: أسئلة على منوال الامتحان.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
