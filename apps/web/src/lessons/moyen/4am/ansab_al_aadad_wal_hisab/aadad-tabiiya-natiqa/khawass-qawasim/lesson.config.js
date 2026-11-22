/**
 * الدرس 3 — خواص قواسم عدد طبيعي (4AM, item du réseau 4am.m1.r02, shared with lesson 2).
 * A v2 lesson since 2026-11-18: the student plays it in the world « أرخبيل القواسم » (`lesson.pack.js`, `world/`), built
 * from scratch on the platform's own numbers; its module pages and mission player are deleted. The textbook only fixed
 * its الكفاءات (LESSON_DEVELOPMENT_GUIDE §4ter); the coverage map of the textbook stays docs/sources/4am/unit1/extraction.json.
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/ansab_al_aadad_wal_hisab/khawass-qawasim';

export const LESSON_CONFIG = {
  id: 'khawass-qawasim',
  kind: 'lesson',
  unit: 'aadad-tabiiya-natiqa',
  unitTitle: 'الأعداد الطبيعيّة والأعداد النّاطقة',
  sequentialUnlock: true,
  // A v2 lesson (docs/architecture/LESSON_V2.md §2, owner's order of 2026-11-18): the student's home is the game world of
  // `lesson.pack.js`. Its module PAGES, the mission player (`studentView: 'mission'`, `mission`), « مسألة الدرس »
  // (`lessonProblem`) and `?view=classic` are deleted. The `modules` below stay as DATA: their ids and numbers are how
  // progress is stored (the world marks them, `onModule`), every report reads them, and their addresses redirect home.
  title: 'خواص قواسم عدد طبيعي',
  description: 'خواص قواسم عدد طبيعي: القاسم المشترك لعددين يقسم مجموعهما وفرقهما وباقي القسمة الإقليدية لأحدهما على الآخر، وتعلّم البرهنة على خاصية من الشكل «إذا … فإنّ …».',
  level: 'moyen',
  grade: '4am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان أنساب الأعداد والحساب',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🧩',
  estimatedDurationMin: 55,
  skills: [
    'معرفة أن القاسم المشترك لعددين يقسم مجموعهما وفرقهما',
    'معرفة أن قاسم عدد يقسم كل مضاعف له',
    'معرفة أن القاسم المشترك لعددين يقسم باقي القسمة الإقليدية لأحدهما على الآخر',
    'البرهان على خاصية من الشكل «إذا … فإنّ …» بإيجاد عدد طبيعي k حيث m = d × k',
  ],
  teachingScope: {
    include: ['قاسم مشترك لعددين يقسم مجموعهما وفرقهما وباقي قسمة أحدهما على الآخر، وقاسم عدد يقسم مضاعفاته', 'البرهنة: المعطيات، المطلوب، البرهان'],
    exclude: ['القاسم المشترك الأكبر (الدرس 4)', 'خوارزميات البحث عن PGCD (الدرس 6) — تُبرَّر لاحقًا بهذه الخواص'],
  },
  // The lesson's progressive map is the world's « خريطة المعارف »: the `KNOWLEDGE_GRAPH` of the knowledge its pack declares
  // (`lesson.pack.js › knowledge`) — the only one; its home mounts no other (LESSON_V2.md §2).
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  priorKnowledge: ['qasim-jidaa', 'qisma-iqlidiya'],
  resources: [
    // DATA only (exported to the DB; `sourceElementIds` are read by scripts/check-textbook-coverage.mjs): the
    // `divisor-properties` labs below were the old module pages' instruments; no page of this lesson mounts them any more.
    { kind: 'manipulation', code: 'divisor-properties-18-12', type: 'divisor-properties', module: 1,
      level: 'beginner',
      title: 'الحالة 1: n = 3، a = 18، b = 12',
      objective: 'n يقسم a و b ⇒ n يقسم a + b و a − b وباقي قسمة a على b',
      autonomy: '',
      experience: { type: 'platform_adaptation', reason: 'multiple_representations', theme: 'construction' },
      learningPointIds: ['4am_khawass-qawasim_P1'], sourceElementIds: ['act-3'] },
    { kind: 'manipulation', code: 'divisor-properties-900-90', type: 'divisor-properties', module: 1,
      level: 'advanced',
      title: 'أعداد لا تُعدّ: n = 9، a = 900، b = 90',
      objective: 'n يقسم a و b ⇒ n يقسم a + b و a − b وباقي قسمة a على b',
      autonomy: 'أعداد كبيرة لا تُتحقّق بالعدّ: على التلميذ أن يتوقّع بالخاصية قبل الكشف',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'construction' },
      learningPointIds: ['4am_khawass-qawasim_P1', '4am_khawass-qawasim_P3'], sourceElementIds: ['act-3'] },
    { kind: 'method', code: 'method-proof', module: 3, title: 'أتعلّم البرهنة: «إذا … فإنّ …»',
      learningPointIds: ['4am_khawass-qawasim_P4'], sourceElementIds: ['method-proof'] },
    // Modules 5–7 — les « مسائل » : exercices complets de type امتحان, ajouts
    // de la plateforme (leurs pages et content/problems.js sont supprimés depuis la v2 — des données ici), sans aucune preuve de maîtrise.
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — ورشة البناء: جداران بطوب من 25 سم', learningPointIds: ['4am_khawass-qawasim_P1', '4am_khawass-qawasim_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — تعاونية زيت الزيتون: صفائح من 15 لترًا', learningPointIds: ['4am_khawass-qawasim_P1', '4am_khawass-qawasim_P2'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — النادي الرياضي: أفواج متساوية', learningPointIds: ['4am_khawass-qawasim_P1', '4am_khawass-qawasim_P4'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ما يلزم قبل الدرس، تقيسه « عُدّة الانطلاق »: «n يقسم a» والقسمة الإقليدية.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'thalath-halat', path: `${LESSON_BASE_PATH}/thalath-halat`,
      title: 'القاسم المشترك: المجموع والفرق', desc: 'n يقسم a و b: هل يقسم a + b و a − b؟',
      stage: 'trigger', teachesLearningPointIds: ['4am_khawass-qawasim_P1', '4am_khawass-qawasim_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 1, actionText: 'أتحقّق' },
    { id: '02', number: 2, slug: 'khassiyatan', path: `${LESSON_BASE_PATH}/khassiyatan`,
      title: 'المضاعفات وباقي القسمة', desc: 'قاسم عدد يقسم كل مضاعف له، والقاسم المشترك يقسم باقي القسمة الإقليدية لأحدهما على الآخر.',
      stage: 'discovery', teachesLearningPointIds: ['4am_khawass-qawasim_P1', '4am_khawass-qawasim_P2', '4am_khawass-qawasim_P3'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أصوغ الخاصية' },
    { id: '03', number: 3, slug: 'ataallam-al-burhana', path: `${LESSON_BASE_PATH}/ataallam-al-burhana`,
      title: 'البرهان: «إذا … فإنّ …»', desc: 'أبرهن أنّ d يقسم m بإيجاد عدد طبيعي k حيث m = d × k.',
      stage: 'discovery', teachesLearningPointIds: ['4am_khawass-qawasim_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'أبرهن' },
    { id: '04', number: 4, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أتمرّن', desc: 'تمارين متدرّجة على خواص القواسم.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_khawass-qawasim_P1', '4am_khawass-qawasim_P2', '4am_khawass-qawasim_P4'],
      // the textbook element this module is the destination of (docs/sources/4am/unit1/extraction.json; DATA for
      // scripts/check-textbook-coverage.mjs — it was cited by the deleted content/textbook.js)
      sourceElementIds: ['now-11-2'],
      color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة الدرس', desc: 'وضعية تُحلّ بخواص القواسم.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_khawass-qawasim_P1', '4am_khawass-qawasim_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2', desc: 'وضعية أخرى تُحسب عند إتمام الدرس.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_khawass-qawasim_P1', '4am_khawass-qawasim_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3', desc: 'وضعية ثالثة تُحسب عند إتمام الدرس.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_khawass-qawasim_P1', '4am_khawass-qawasim_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'التقويم', desc: 'تقويم الكفاءات: أسئلة على منوال الامتحان.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 7, difficulty: 3, actionText: 'أدخل التقويم' },
  ],
};
