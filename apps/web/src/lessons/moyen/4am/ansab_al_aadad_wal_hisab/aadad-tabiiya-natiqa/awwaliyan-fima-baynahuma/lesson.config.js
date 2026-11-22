/**
 * الدرس 7 — العددان الأوّليّان فيما بينهما (4AM, learning net item of unit 1).
 * A v2 lesson since 2026-11-20: the student plays it in the world « أرخبيل القواسم » (`lesson.pack.js`, `world/`), built
 * from scratch on the platform's own numbers; its module pages and mission player are deleted. The textbook only fixed
 * its الكفاءات (LESSON_DEVELOPMENT_GUIDE §4ter); the coverage map of the textbook stays docs/sources/4am/unit1/extraction.json.
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/ansab_al_aadad_wal_hisab/awwaliyan-fima-baynahuma';

export const LESSON_CONFIG = {
  id: 'awwaliyan-fima-baynahuma',
  kind: 'lesson',
  unit: 'aadad-tabiiya-natiqa',
  unitTitle: 'الأعداد الطبيعيّة والأعداد النّاطقة',
  sequentialUnlock: true,
  // A v2 lesson (docs/architecture/LESSON_V2.md §2): the student's home is the game world of `lesson.pack.js`. Its module
  // PAGES, the mission player (`studentView: 'mission'`, `mission`) and « مسألة الدرس » (`lessonProblem`) are deleted. The
  // `modules` below stay as DATA: their ids and numbers are how progress is stored (the world marks them, `onModule`),
  // every report reads them, and their addresses redirect home.
  title: 'العددان الأوّليّان فيما بينهما',
  description: 'العددان الأوليان فيما بينهما: قاسمهما المشترك الأكبر يساوي 1؛ إثبات ذلك بحساب PGCD، ونفيه بإظهار قاسم مشترك يختلف عن 1.',
  level: 'moyen',
  grade: '4am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان أنساب الأعداد والحساب',
  passingScore: 3,
  masteryThreshold: 0.8,
  emoji: '1️⃣',
  estimatedDurationMin: 40,
  skills: [
    'التعرّف على عددين أوليين فيما بينهما (PGCD (a ; b) = 1)',
    'إثبات أن عددين أوليان فيما بينهما بحساب قاسمهما المشترك الأكبر',
    'إثبات أن عددين ليسا أوليين فيما بينهما بإظهار قاسم مشترك يختلف عن 1',
  ],
  teachingScope: { include: ['التعريف: القاسم المشترك الأكبر يساوي 1', 'الإثبات بحساب القاسم المشترك الأكبر', 'النفي بإظهار قاسم مشترك يختلف عن 1'], exclude: ['الأعداد الأولية (موضوع رسمي آخر)', 'الكسور غير القابلة للاختزال (الدرس 8)'] },
  // The lesson's progressive map is the world's « خريطة المعارف »: the `KNOWLEDGE_GRAPH` of the knowledge its pack declares
  // (`lesson.pack.js › knowledge`) — the only one; its home mounts no other (LESSON_V2.md §2).
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // the keys of the lessons before it (their worlds' knowledge): the old ids `pgcd-taarif` (qasim-mushtarak-akbar) and
  // `khwarizmiyat-iqlidus` (bahth-pgcd) went with their deleted knowledge.jsx — re-pointed to those worlds' keys `al-akbar`
  // and `iqlidis`; `qawaid-qisma` is qawasim-adad-tabii's key
  priorKnowledge: ['al-akbar', 'iqlidis', 'qawaid-qisma'],
  resources: [
    // DATA only (exported to the DB; `sourceElementIds` are read by scripts/check-textbook-coverage.mjs): the
    // `coprime-explorer` labs below were the old module pages' instruments; no page of this lesson mounts them any more.
    { kind: 'manipulation', code: 'coprime-17-18', type: 'coprime-explorer', module: 1,
      level: 'beginner',
      title: 'عددان متتاليان: كم حقيبة متماثلة؟',
      objective: 'عددان أوليان فيما بينهما ⇔ قاسمهما المشترك الوحيد هو 1',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'school' },
      learningPointIds: ['4am_awwaliyan-fima-baynahuma_P1'], sourceElementIds: ['act-7'] },
    { kind: 'manipulation', code: 'coprime-22-35', type: 'coprime-explorer', module: 1,
      level: 'advanced',
      title: 'عددان: أثبت بنفسك دون توجيه',
      objective: 'عددان أوليان فيما بينهما ⇔ قاسمهما المشترك الوحيد هو 1',
      autonomy: 'لا مجموعات ولا توجيه: التلميذ يواجه قواسم العدد الأصغر بالعدد الآخر واحدًا واحدًا، ولا يُقبل حكمه إلا بعد أن يكتمل الدليل',
      experience: { type: 'platform_adaptation', reason: 'multiple_representations', theme: 'abstract' },
      learningPointIds: ['4am_awwaliyan-fima-baynahuma_P1', '4am_awwaliyan-fima-baynahuma_P3'], sourceElementIds: ['act-7'] },
    // Modules 4–6 — the « مسائل »: platform additions (their pages and content/problems.js are deleted since the v2 —
    // data here), never evidence of mastery.
    { kind: 'situation', code: 'masala-1', module: 4, title: 'مسألة الدرس — جسر المرفأ', learningPointIds: ['4am_awwaliyan-fima-baynahuma_P1', '4am_awwaliyan-fima-baynahuma_P2', '4am_awwaliyan-fima-baynahuma_P3'] },
    { kind: 'situation', code: 'masala-2', module: 5, title: 'مسألة 1', learningPointIds: ['4am_awwaliyan-fima-baynahuma_P1', '4am_awwaliyan-fima-baynahuma_P2', '4am_awwaliyan-fima-baynahuma_P3'] },
    { kind: 'situation', code: 'masala-3', module: 6, title: 'مسألة 2', learningPointIds: ['4am_awwaliyan-fima-baynahuma_P2', '4am_awwaliyan-fima-baynahuma_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ما يلزم قبل الدرس، تقيسه « عُدّة الانطلاق »: القاسم المشترك الأكبر وخوارزمية إقليدس.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: '17-wa-18', path: `${LESSON_BASE_PATH}/17-wa-18`,
      title: 'قاسم مشترك وحيد، أو أكثر', desc: 'عددان لا يشتركان إلّا في 1، وعددان يشتركان في غيره.',
      stage: 'trigger', teachesLearningPointIds: ['4am_awwaliyan-fima-baynahuma_P1', '4am_awwaliyan-fima-baynahuma_P3'], color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 1, actionText: 'أتوقّع وأكشف' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'الإثبات بالحساب', desc: 'كيف نتأكّد أنّ عددين لا يشتركان إلّا في 1؟',
      stage: 'discovery', teachesLearningPointIds: ['4am_awwaliyan-fima-baynahuma_P1', '4am_awwaliyan-fima-baynahuma_P2'], color: 'violet', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أتمرّن', desc: 'تمارين متدرّجة: نثبت أو ننفي.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_awwaliyan-fima-baynahuma_P2', '4am_awwaliyan-fima-baynahuma_P3'], color: 'amber', style: 'featured', estimatedMin: 13, difficulty: 2, actionText: 'أتدرّب' },
    // The « مسائل » (track: 'problem'): they count in completion, never in mastery. Module 4 is the lesson's problem — the
    // store of the world's last bridge (world/story.js › PROBLEM_MODULE); 5 and 6 are completed by the story's end.
    { id: '04', number: 4, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة الدرس', desc: 'جسر المرفأ: أطول لوح يملأ الممرّين كلًّا منهما تمامًا.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_awwaliyan-fima-baynahuma_P1', '4am_awwaliyan-fima-baynahuma_P2', '4am_awwaliyan-fima-baynahuma_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '05', number: 5, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 1', desc: 'وضعية تُحسب عند إتمام الدرس.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_awwaliyan-fima-baynahuma_P1', '4am_awwaliyan-fima-baynahuma_P2', '4am_awwaliyan-fima-baynahuma_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 2', desc: 'وضعية أخرى تُحسب عند إتمام الدرس.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_awwaliyan-fima-baynahuma_P2', '4am_awwaliyan-fima-baynahuma_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'التقويم', desc: 'تقويم الكفاءات: أسئلة على منوال الامتحان.', stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 7, difficulty: 3, actionText: 'أدخل التقويم' },
  ],
};
