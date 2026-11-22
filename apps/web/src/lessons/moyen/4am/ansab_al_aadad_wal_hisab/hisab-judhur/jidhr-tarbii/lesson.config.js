/**
 * الدرس 1 من الوحدة 2 — الجذر التربيعي لعدد موجب (4AM, learning net item of unit 2 « الحساب على الجذور »).
 * A v2 lesson since 2026-11-21: the student plays it in the world « قصر الساحات » (`lesson.pack.js`, `world/`), built
 * from scratch on the platform's own numbers; its module pages and mission player are deleted. The textbook only fixed
 * its الكفاءات (LESSON_DEVELOPMENT_GUIDE §4ter); the coverage map of the textbook stays docs/sources/4am/unit2/extraction.json.
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/ansab_al_aadad_wal_hisab/jidhr-tarbii';

export const LESSON_CONFIG = {
  id: 'jidhr-tarbii',
  kind: 'lesson',
  unit: 'hisab-judhur',
  unitTitle: 'الحساب على الجذور',
  sequentialUnlock: true,
  // A v2 lesson (docs/architecture/LESSON_V2.md §2): the student's home is the game world of `lesson.pack.js`. Its module
  // PAGES, the mission player (`studentView`, `mission`) and « مسألة الدرس » (`lessonProblem`) are deleted. The
  // `modules` below stay as DATA: their ids and numbers are how progress is stored (the world's end marks them all,
  // `kit/storyEnd.js`), every report reads them, and their addresses redirect home.
  title: 'الجذر التربيعي لعدد موجب',
  description: 'تعريف الجذر التربيعي لعدد موجب a بأنه العدد الموجب الذي مربعه a، واستعمال الرمز √a، وتطبيق الخاصيتين (√a)² = a و √(a²) = a.',
  level: 'moyen',
  grade: '4am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان أنساب الأعداد والحساب',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '√',
  estimatedDurationMin: 50,
  skills: [
    'التعرّف على الجذر التربيعي لعدد موجب a: العدد الموجب الذي مربعه a',
    'قراءة الرمز √a وكتابته، والتمييز بين القيمة المضبوطة وما تعرضه الحاسبة',
    'تطبيق الخاصيتين (√a)² = a و √(a²) = a حيث a عدد موجب',
  ],
  teachingScope: {
    include: ['تعريف الجذر التربيعي لعدد موجب والرمز √a وقراءته', 'القيمة المضبوطة √5 وقراءة الحاسبة', 'الخاصيتان (√a)² = a و √(a²) = a، واستعمال التعريف لإنجاز حساب'],
    exclude: ['الأعداد الناطقة وغير الناطقة والقيم المقربة بالنقصان وبالزيادة (الدرس 2)', 'حل المعادلة x² = a (الدرس 3)', 'جداء وحاصل قسمة جذرين (الدرس 4)', 'تبسيط الجذور وجعل المقام ناطقا (الدرس 5)'],
  },
  knowledgeMap: true,
  // The lesson's progressive map is the world's « خريطة المعارف »: the `KNOWLEDGE_GRAPH` of the knowledge its pack declares
  // (`lesson.pack.js › knowledge`) — the only one; its home mounts no other (LESSON_V2.md §2).
  knowledgeMapMode: 'progressive',
  // what the lesson stands on from the years before (concept ids, data): a square, Pythagoras' property, the key √
  priorKnowledge: ['murabba-adad', 'khassiyat-fithaghuras', 'alat-hasiba-jidhr'],
  resources: [
    // DATA only (exported to the DB; `sourceElementIds` are read by scripts/check-textbook-coverage.mjs): the
    // `square-root-side` labs below were the old module pages' instruments; no page of this lesson mounts them any more
    // (the lab stays in the closed registry, mounted by no lesson since lesson 2 became v2 too). The lesson's instrument in
    // « مختبري » is `court`.
    {
      kind: 'manipulation', code: 'square-root-side-36', type: 'square-root-side', module: 1,
      level: 'beginner',
      title: 'مربّع مساحته 36: كم طول ضلعه؟',
      objective: 'الجذر التربيعي لعدد موجب a هو طول ضلع المربّع الذي مساحته a: العدد الموجب الذي مربّعه a',
      autonomy: '',
      experience: { type: 'textbook', reason: '', theme: '' },
      learningPointIds: ['4am_jidhr-tarbii_P1'],
      sourceElementIds: ['act-1'],
    },
    {
      kind: 'manipulation', code: 'square-root-side-5', type: 'square-root-side', module: 1,
      level: 'advanced',
      title: 'مربّع مساحته 5: هل يقع ضلعه على تدريجة؟',
      objective: 'الجذر التربيعي لعدد موجب a هو طول ضلع المربّع الذي مساحته a: العدد الموجب الذي مربّعه a',
      autonomy: 'لا يقع الضلع على أي تدريجة: التلميذ يحصره بنفسه بين تدريجتين متجاورتين قبل كل تدقيق (1 ثم 0,1 ثم 0,01 ثم 0,001)، ثم يقارن قراءة الحاسبة 2,236067978 بمربّعها',
      experience: { type: 'textbook', reason: '', theme: '' },
      learningPointIds: ['4am_jidhr-tarbii_P1', '4am_jidhr-tarbii_P2'],
      sourceElementIds: ['act-1'],
    },
    {
      kind: 'manipulation', code: 'square-root-side-0-04', type: 'square-root-side', module: 2,
      title: 'مربّع مساحته 0,04',
      learningPointIds: ['4am_jidhr-tarbii_P1'],
      sourceElementIds: ['know-1'],
    },
    // Modules 4–6 — the « مسائل »: platform additions (their pages and content/problems.js are deleted since the v2 —
    // data here), never evidence of mastery.
    { kind: 'situation', code: 'masala-1', module: 4, title: 'مسألة 1', learningPointIds: ['4am_jidhr-tarbii_P1', '4am_jidhr-tarbii_P2', '4am_jidhr-tarbii_P3'] },
    { kind: 'situation', code: 'masala-2', module: 5, title: 'مسألة 2', learningPointIds: ['4am_jidhr-tarbii_P1', '4am_jidhr-tarbii_P2'] },
    { kind: 'situation', code: 'masala-3', module: 6, title: 'مسألة 3', learningPointIds: ['4am_jidhr-tarbii_P1', '4am_jidhr-tarbii_P2', '4am_jidhr-tarbii_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ما يلزم قبل الدرس، تقيسه « عُدّة الانطلاق »: مربّع عدد.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'ضلع الساحة', desc: 'ما طول ضلع ساحة مربّعة نعرف مساحتها؟',
      stage: 'trigger', teachesLearningPointIds: ['4am_jidhr-tarbii_P1', '4am_jidhr-tarbii_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 1, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'القيمة المضبوطة، ذهاب وإياب', desc: 'جذر لا كتابة عشريّة له، ومربّع الجذر وجذر المربّع.',
      stage: 'discovery', teachesLearningPointIds: ['4am_jidhr-tarbii_P1', '4am_jidhr-tarbii_P2', '4am_jidhr-tarbii_P3'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أتمرّن', desc: 'تمارين متدرّجة على الكفاءات الثلاث.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_jidhr-tarbii_P1', '4am_jidhr-tarbii_P2', '4am_jidhr-tarbii_P3'],
      color: 'amber', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أتدرّب' },
    // The « مسائل » (track: 'problem'): they count in completion, never in mastery; the story's end completes them.
    { id: '04', number: 4, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1', desc: 'وضعية تُحسب عند إتمام الدرس.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_jidhr-tarbii_P1', '4am_jidhr-tarbii_P2', '4am_jidhr-tarbii_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '05', number: 5, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2', desc: 'وضعية أخرى تُحسب عند إتمام الدرس.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_jidhr-tarbii_P1', '4am_jidhr-tarbii_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3', desc: 'وضعية ثالثة تُحسب عند إتمام الدرس.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_jidhr-tarbii_P1', '4am_jidhr-tarbii_P2', '4am_jidhr-tarbii_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'التقويم', desc: 'تقويم الكفاءات: أسئلة على منوال الامتحان.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 3, actionText: 'أدخل التقويم' },
  ],
};
