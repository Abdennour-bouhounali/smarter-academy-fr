/**
 * الدرس 4 — القاسم المشترك الأكبر لعددين طبيعيين (4AM, learning net item 4am.m1.r03).
 * A v2 lesson since 2026-11-19: the student plays it in the world « أرخبيل القواسم » (`lesson.pack.js`, `world/`), built
 * from scratch on the platform's own numbers; its module pages and mission player are deleted. The textbook only fixed
 * its الكفاءات (LESSON_DEVELOPMENT_GUIDE §4ter); the coverage map of the textbook stays docs/sources/4am/unit1/extraction.json.
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/ansab_al_aadad_wal_hisab/qasim-mushtarak-akbar';

export const LESSON_CONFIG = {
  id: 'qasim-mushtarak-akbar',
  kind: 'lesson',
  unit: 'aadad-tabiiya-natiqa',
  unitTitle: 'الأعداد الطبيعيّة والأعداد النّاطقة',
  sequentialUnlock: true,
  // A v2 lesson (docs/architecture/LESSON_V2.md §2): the student's home is the game world of `lesson.pack.js`. Its module
  // PAGES, the mission player (`studentView: 'mission'`, `mission`) and « مسألة الدرس » (`lessonProblem`) are deleted. The
  // `modules` below stay as DATA: their ids and numbers are how progress is stored (the world marks them, `onModule`),
  // every report reads them, and their addresses redirect home.
  title: 'القاسم المشترك الأكبر لعددين طبيعيين',
  description: 'القواسم المشتركة لعددين طبيعيين والقاسم المشترك الأكبر لهما، من وضعية تشكيل باقات متماثلة إلى التعريف والترميز PGCD (a ; b).',
  level: 'moyen',
  grade: '4am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان أنساب الأعداد والحساب',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '💐',
  estimatedDurationMin: 45,
  skills: [
    'تعيين القواسم المشتركة لعددين طبيعيين',
    'التعرّف على القاسم المشترك الأكبر لعددين والترميز له بـ PGCD (a ; b)',
    'تفسير وضعية توزيع في باقات متماثلة بلغة القواسم المشتركة والقاسم المشترك الأكبر',
    'معرفة أن القواسم المشتركة لعددين هي قواسم قاسمهما المشترك الأكبر',
  ],
  teachingScope: {
    include: ['القواسم المشتركة، القاسم المشترك الأكبر، الرمز PGCD (a ; b)', 'القواسم المشتركة لعددين هي قواسم قاسمهما المشترك الأكبر'],
    exclude: ['طرق حساب PGCD بغير حصر القواسم (الدرسان 5 و 6)'],
  },
  // The lesson's progressive map is the world's « خريطة المعارف »: the `KNOWLEDGE_GRAPH` of the knowledge its pack declares
  // (`lesson.pack.js › knowledge`) — the only one; its home mounts no other (LESSON_V2.md §2).
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  priorKnowledge: ['tariqa-qawasim'],
  resources: [
    // DATA only (exported to the DB; `sourceElementIds` are read by scripts/check-textbook-coverage.mjs): the
    // `common-divisors` labs below were the old module pages' instruments; no page of this lesson mounts them any more.
    { kind: 'manipulation', code: 'common-divisors-12-18', type: 'common-divisors', module: 1,
      level: 'beginner',
      title: 'مجموعات متماثلة: 12 و 18',
      objective: 'القواسم المشتركة لعددين، وأكبرها هو القاسم المشترك الأكبر',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'football' },
      learningPointIds: ['4am_qasim-mushtarak-akbar_P1', '4am_qasim-mushtarak-akbar_P2'], sourceElementIds: ['act-4'] },
    { kind: 'manipulation', code: 'common-divisors-90-54', type: 'common-divisors', module: 1,
      level: 'advanced',
      title: 'باقات متماثلة: 90 زهرة حمراء و 54 زهرة بيضاء',
      objective: 'القواسم المشتركة لعددين، وأكبرها هو القاسم المشترك الأكبر',
      autonomy: 'أعداد كبيرة: أكبر عدد من الباقات يُبحث عنه دون اقتراح، ثم قائمتان طويلتان يقارن بينهما التلميذ',
      experience: { type: 'textbook', reason: '', theme: 'garden' },
      learningPointIds: ['4am_qasim-mushtarak-akbar_P1', '4am_qasim-mushtarak-akbar_P2', '4am_qasim-mushtarak-akbar_P3'], sourceElementIds: ['act-4'] },
    { kind: 'manipulation', code: 'common-divisors-28-42', type: 'common-divisors', module: 2, title: 'مثال: 28 و 42',
      learningPointIds: ['4am_qasim-mushtarak-akbar_P2', '4am_qasim-mushtarak-akbar_P4'], sourceElementIds: ['know-4-def'] },
    // Modules 4–6 — the « مسائل »: whole exam-style exercises, platform additions (their pages and content/problems.js are
    // deleted since the v2 — data here), never evidence of mastery.
    { kind: 'situation', code: 'masala-1', module: 4, title: 'مسألة — باقات الورود: 120 حمراء و 84 بيضاء', learningPointIds: ['4am_qasim-mushtarak-akbar_P1', '4am_qasim-mushtarak-akbar_P2', '4am_qasim-mushtarak-akbar_P3'] },
    { kind: 'situation', code: 'masala-2', module: 5, title: 'مسألة — صناديق السمك: 96 كغ سردين و 72 كغ جمبري', learningPointIds: ['4am_qasim-mushtarak-akbar_P1', '4am_qasim-mushtarak-akbar_P2', '4am_qasim-mushtarak-akbar_P3', '4am_qasim-mushtarak-akbar_P4'] },
    { kind: 'situation', code: 'masala-3', module: 6, title: 'مسألة — تبليط قاعة المطالعة: أيّ البلاطات تصلح؟', learningPointIds: ['4am_qasim-mushtarak-akbar_P1', '4am_qasim-mushtarak-akbar_P2', '4am_qasim-mushtarak-akbar_P3', '4am_qasim-mushtarak-akbar_P4'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ما يلزم قبل الدرس، تقيسه « عُدّة الانطلاق »: قواسم عدد والقسمة الإقليدية.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'baqat', path: `${LESSON_BASE_PATH}/baqat`,
      title: 'القواسم المشتركة والباقات المتماثلة', desc: 'أيّ الأعداد تقسم العددين معًا؟ وكيف نوزّع مجموعتين كلّهما في باقات متماثلة؟',
      stage: 'trigger', teachesLearningPointIds: ['4am_qasim-mushtarak-akbar_P1', '4am_qasim-mushtarak-akbar_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 1, actionText: 'أكتشف' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'القاسم المشترك الأكبر وقواسمه', desc: 'أكبر القواسم المشتركة لعددين، الرمز PGCD (a ; b)، والقواسم المشتركة هي قواسم PGCD.',
      stage: 'discovery', teachesLearningPointIds: ['4am_qasim-mushtarak-akbar_P1', '4am_qasim-mushtarak-akbar_P2', '4am_qasim-mushtarak-akbar_P4'],
      color: 'violet', style: 'featured', estimatedMin: 15, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أتمرّن', desc: 'تمارين متدرّجة على القواسم المشتركة والقاسم المشترك الأكبر.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_qasim-mushtarak-akbar_P1', '4am_qasim-mushtarak-akbar_P2'],
      color: 'amber', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتدرّب' },
    // The « مسائل » (track: 'problem'): they count in completion, never in mastery. Module 6 is the lesson's problem — the
    // store of the world's last bridge (world/story.js › PROBLEM_MODULE).
    { id: '04', number: 4, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1', desc: 'وضعية توزيع تُحلّ بالقاسم المشترك الأكبر.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_qasim-mushtarak-akbar_P1', '4am_qasim-mushtarak-akbar_P2', '4am_qasim-mushtarak-akbar_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '05', number: 5, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2', desc: 'وضعية أخرى تُحسب عند إتمام الدرس.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_qasim-mushtarak-akbar_P1', '4am_qasim-mushtarak-akbar_P2', '4am_qasim-mushtarak-akbar_P3', '4am_qasim-mushtarak-akbar_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة الدرس', desc: 'باقات سوق الزهور: أكبر عدد من الباقات المتماثلة، وما في كل باقة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_qasim-mushtarak-akbar_P1', '4am_qasim-mushtarak-akbar_P2', '4am_qasim-mushtarak-akbar_P3', '4am_qasim-mushtarak-akbar_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'التقويم', desc: 'تقويم الكفاءات: أسئلة على منوال الامتحان.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 8, difficulty: 3, actionText: 'أدخل التقويم' },
  ],
};
