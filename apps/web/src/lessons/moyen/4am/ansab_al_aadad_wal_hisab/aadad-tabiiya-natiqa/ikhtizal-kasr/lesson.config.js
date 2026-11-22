/**
 * الدرس 8 — اختزال كسر (4AM, learning net item of unit 1).
 * A v2 lesson since 2026-11-20: the student plays it in the world « أرخبيل القواسم » (`lesson.pack.js`, `world/`), built
 * from scratch on the platform's own numbers; its module pages and mission player are deleted. The textbook only fixed
 * its الكفاءات (LESSON_DEVELOPMENT_GUIDE §4ter); the coverage map of the textbook stays docs/sources/4am/unit1/extraction.json.
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/ansab_al_aadad_wal_hisab/ikhtizal-kasr';

export const LESSON_CONFIG = {
  id: 'ikhtizal-kasr',
  kind: 'lesson',
  unit: 'aadad-tabiiya-natiqa',
  unitTitle: 'الأعداد الطبيعيّة والأعداد النّاطقة',
  sequentialUnlock: true,
  // A v2 lesson (docs/architecture/LESSON_V2.md §2): the student's home is the game world of `lesson.pack.js`. Its module
  // PAGES, the mission player (`studentView: 'mission'`, `mission`) and « مسألة الدرس » (`lessonProblem`) are deleted. The
  // `modules` below stay as DATA: their ids and numbers are how progress is stored (the world marks them, `onModule`),
  // every report reads them, and their addresses redirect home.
  title: 'اختزال كسر',
  description: 'اختزال كسر بالقسمة المتتابعة على قواسم مشتركة، التعرّف على الكسر غير القابل للاختزال، وكتابة كسر على الشكل غير القابل للاختزال بالقسمة على القاسم المشترك الأكبر.',
  level: 'moyen',
  grade: '4am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان أنساب الأعداد والحساب',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '➗',
  estimatedDurationMin: 65,
  skills: [
    'اختزال كسر بالقسمة المتتابعة على قواسم مشتركة',
    'التعرّف على الكسر غير القابل للاختزال (بسطه ومقامه أوليان فيما بينهما)',
    'كتابة كسر على الشكل غير القابل للاختزال بالقسمة على القاسم المشترك الأكبر',
    'إعطاء نتيجة حساب على الأعداد الناطقة على شكل كسر غير قابل للاختزال',
  ],
  teachingScope: { include: ['اختزال خطوة بخطوة، والاختزال بـ PGCD في خطوة واحدة', 'الكسر غير القابل للاختزال ≡ بسط ومقام أوليان فيما بينهما'], exclude: ['التحليل إلى عوامل أولية', 'العمليات على الكسور كموضوع مستقل (مكتسب سابق)'] },
  knowledgeMap: true,
  // The lesson's progressive map is the world's « خريطة المعارف »: the `KNOWLEDGE_GRAPH` of the knowledge its pack declares
  // (`lesson.pack.js › knowledge`) — the only one; its home mounts no other (LESSON_V2.md §2).
  knowledgeMapMode: 'progressive',
  // the keys of the lessons before it (their worlds' knowledge): `awwaliyan` is awwaliyan-fima-baynahuma's key, `iqlidis`
  // bahth-pgcd's (the old id `khwarizmiyat-iqlidus` went with bahth-pgcd's deleted knowledge.jsx; the synthesis keeps its
  // own copy); `al-aadad-al-natiqa` is an earlier year's knowledge
  priorKnowledge: ['al-aadad-al-natiqa', 'awwaliyan', 'iqlidis'],
  resources: [
    // DATA only (exported to the DB; `sourceElementIds` are read by scripts/check-textbook-coverage.mjs): the
    // `fraction-reduction` labs below were the old module pages' instruments; no page of this lesson mounts them any more.
    { kind: 'manipulation', code: 'fraction-reduction-12-18', type: 'fraction-reduction', module: 1,
      level: 'beginner',
      title: 'وصفة نقسمها حصصًا متماثلة',
      objective: 'اختزال كسر = القسمة على قاسم مشترك؛ نتوقف عندما لا يبقى قاسم مشترك أكبر من 1',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'kitchen' },
      learningPointIds: ['4am_ikhtizal-kasr_P1'], sourceElementIds: ['act-8'] },
    { kind: 'manipulation', code: 'fraction-reduction-84-48', type: 'fraction-reduction', module: 1,
      level: 'advanced',
      title: 'كسر: أيّ الطريقين أقصر؟',
      objective: 'اختزال كسر = القسمة على قاسم مشترك؛ نتوقف عندما لا يبقى قاسم مشترك أكبر من 1',
      autonomy: 'عدّة قواسم مشتركة ممكنة في كل خطوة: التلميذ يختار طريقه ويقارن عدد الخطوات',
      experience: { type: 'platform_adaptation', reason: 'multiple_representations', theme: 'kitchen' },
      learningPointIds: ['4am_ikhtizal-kasr_P1', '4am_ikhtizal-kasr_P2', '4am_ikhtizal-kasr_P3'], sourceElementIds: ['act-8'] },
    { kind: 'method', code: 'method-reduce-595-560', module: 2, title: 'طريقة: استعمال PGCD لكتابة كسر على الشكل غير القابل للاختزال', learningPointIds: ['4am_ikhtizal-kasr_P3'], sourceElementIds: ['method-reduce'] },
    // Modules 5–7 — the « مسائل »: platform additions (their pages and content/problems.js are deleted since the v2 —
    // data here), never evidence of mastery.
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة 1', learningPointIds: ['4am_ikhtizal-kasr_P1', '4am_ikhtizal-kasr_P2', '4am_ikhtizal-kasr_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة الدرس — جسر المرفأ', learningPointIds: ['4am_ikhtizal-kasr_P3', '4am_ikhtizal-kasr_P4'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة 2', learningPointIds: ['4am_ikhtizal-kasr_P2', '4am_ikhtizal-kasr_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ما يلزم قبل الدرس، تقيسه « عُدّة الانطلاق »: الأعداد الناطقة والقاسم المشترك الأكبر.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'samir', path: `${LESSON_BASE_PATH}/samir`,
      title: 'نختزل على مراحل', desc: 'نقسم البسط والمقام على قاسم مشترك، مرّة بعد مرّة… حتى متى؟',
      stage: 'trigger', teachesLearningPointIds: ['4am_ikhtizal-kasr_P1', '4am_ikhtizal-kasr_P2'], color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 1, actionText: 'أختزل' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'قسمة واحدة', desc: 'كسر لا يُختزل، وكسر يُختزل بقسمة واحدة.',
      stage: 'discovery', teachesLearningPointIds: ['4am_ikhtizal-kasr_P2', '4am_ikhtizal-kasr_P3'], color: 'violet', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'awazzif-1', path: `${LESSON_BASE_PATH}/awazzif-1`,
      title: 'أتمرّن (1)', desc: 'تمارين متدرّجة: الشكل غير القابل للاختزال.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_ikhtizal-kasr_P3'], color: 'amber', style: 'featured', estimatedMin: 13, difficulty: 2, actionText: 'أتدرّب' },
    { id: '04', number: 4, slug: 'awazzif-2', path: `${LESSON_BASE_PATH}/awazzif-2`,
      title: 'أتمرّن (2)', desc: 'نحسب على الأعداد الناطقة ونعطي النتيجة مختزلة.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_ikhtizal-kasr_P2', '4am_ikhtizal-kasr_P4'], color: 'rose', style: 'featured', estimatedMin: 14, difficulty: 3, actionText: 'أتدرّب أكثر' },
    // The « مسائل » (track: 'problem'): they count in completion, never in mastery. Module 6 is the lesson's problem — the
    // store of the world's last bridge (world/story.js › PROBLEM_MODULE); 5 and 7 are completed by the story's end.
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1', desc: 'وضعية تُحسب عند إتمام الدرس.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_ikhtizal-kasr_P1', '4am_ikhtizal-kasr_P2', '4am_ikhtizal-kasr_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة الدرس', desc: 'جسر المرفأ: لافتة الجزء المضاء على الشكل غير القابل للاختزال.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_ikhtizal-kasr_P3', '4am_ikhtizal-kasr_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 2', desc: 'وضعية أخرى تُحسب عند إتمام الدرس.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_ikhtizal-kasr_P2', '4am_ikhtizal-kasr_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'التقويم', desc: 'تقويم الكفاءات: أسئلة على منوال الامتحان.', stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 3, actionText: 'أدخل التقويم' },
  ],
};
