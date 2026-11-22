/**
 * الدرس 5 — تعيين القاسم المشترك الأكبر لعددين طبيعيين (4AM, learning net item 4am.m1.r03).
 * A v2 lesson since 2026-11-19: the student plays it in the world « أرخبيل القواسم » (`lesson.pack.js`, `world/`), built
 * from scratch on the platform's own numbers; its module pages and mission player are deleted. The textbook only fixed
 * its الكفاءات (LESSON_DEVELOPMENT_GUIDE §4ter); the coverage map of the textbook stays docs/sources/4am/unit1/extraction.json.
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/ansab_al_aadad_wal_hisab/tayin-pgcd';

export const LESSON_CONFIG = {
  id: 'tayin-pgcd',
  kind: 'lesson',
  unit: 'aadad-tabiiya-natiqa',
  unitTitle: 'الأعداد الطبيعيّة والأعداد النّاطقة',
  sequentialUnlock: true,
  // A v2 lesson (docs/architecture/LESSON_V2.md §2): the student's home is the game world of `lesson.pack.js`. Its module
  // PAGES, the mission player (`studentView: 'mission'`, `mission`) and « مسألة الدرس » (`lessonProblem`) are deleted. The
  // `modules` below stay as DATA: their ids and numbers are how progress is stored (the world marks them, `onModule`),
  // every report reads them, and their addresses redirect home.
  title: 'تعيين القاسم المشترك الأكبر لعددين طبيعيين',
  description: 'تعيين القاسم المشترك الأكبر لعددين بحصر قواسم كل عدد ثم القواسم المشتركة ثم أكبرها، والنتائج المباشرة: PGCD(a ; a) = a، PGCD(a ; 0) = a، PGCD(a ; b) = PGCD(b ; a).',
  level: 'moyen',
  grade: '4am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان أنساب الأعداد والحساب',
  passingScore: 3,
  masteryThreshold: 0.8,
  emoji: '🎯',
  estimatedDurationMin: 40,
  skills: [
    'تعيين PGCD (a ; b) بحصر قواسم كل عدد ثم القواسم المشتركة ثم أكبرها',
    'استعمال النتائج المباشرة: PGCD(a ; a) = a، PGCD(a ; 0) = a، PGCD(a ; b) = PGCD(b ; a)',
    'معرفة أن PGCD (a ; b) = b عندما يكون b قاسما للعدد a',
  ],
  teachingScope: { include: ['تعيين PGCD بحصر قواسم كل عدد ثم القواسم المشتركة', 'النتائج المباشرة: PGCD(a ; a)، PGCD(a ; 0)، التبديل، وحالة b يقسم a'], exclude: ['الفروق المتتابعة وخوارزمية إقليدس (الدرس 6)'] },
  // The lesson's progressive map is the world's « خريطة المعارف »: the `KNOWLEDGE_GRAPH` of the knowledge its pack declares
  // (`lesson.pack.js › knowledge`) — the only one; its home mounts no other (LESSON_V2.md §2).
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // lesson 4's key « al-akbar » (its world's knowledge — the old id `pgcd-taarif` went with its deleted knowledge.jsx)
  priorKnowledge: ['al-akbar', 'tariqa-qawasim'],
  resources: [
    // DATA only (exported to the DB; `sourceElementIds` are read by scripts/check-textbook-coverage.mjs): the
    // `common-divisors` labs below were the old module pages' instruments; no page of this lesson mounts them any more.
    { kind: 'manipulation', code: 'common-divisors-8-12', type: 'common-divisors', module: 1,
      level: 'beginner',
      title: 'حقائب متماثلة: 8 أقلام و 12 كراسًا، حتى أكبر عدد من الحقائب',
      objective: 'تعيين PGCD بحصر القواسم ثم القواسم المشتركة ثم أكبرها',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'school' },
      learningPointIds: ['4am_tayin-pgcd_P1'], sourceElementIds: ['act-5'] },
    { kind: 'manipulation', code: 'common-divisors-42-60', type: 'common-divisors', module: 1,
      level: 'advanced',
      title: 'قائمتا قواسم عددين: من القائمتين إلى PGCD',
      objective: 'تعيين PGCD بحصر القواسم ثم القواسم المشتركة ثم أكبرها',
      autonomy: 'قائمتان طويلتان: لا يمكن النجاح بالمصادفة، يلزم ترتيب',
      experience: { type: 'textbook', reason: '', theme: 'school' },
      learningPointIds: ['4am_tayin-pgcd_P1'], sourceElementIds: ['act-5'] },
    { kind: 'method', code: 'method-hasr', module: 1, title: 'طريقة: حصر القواسم ثم القواسم المشتركة ثم أكبرها', learningPointIds: ['4am_tayin-pgcd_P1'], sourceElementIds: ['act-5'] },
    // Modules 4–6 — the « مسائل »: whole exam-style exercises, platform additions (their pages and content/problems.js are
    // deleted since the v2 — data here), never evidence of mastery.
    { kind: 'situation', code: 'masala-1', module: 4, title: 'مسألة — حقائب التضامن: 90 قلمًا و 126 كرّاسًا', learningPointIds: ['4am_tayin-pgcd_P1'] },
    { kind: 'situation', code: 'masala-2', module: 5, title: 'مسألة — قفة رمضان: 60 قارورة زيت و 84 علبة طماطم', learningPointIds: ['4am_tayin-pgcd_P1', '4am_tayin-pgcd_P2', '4am_tayin-pgcd_P3'] },
    { kind: 'situation', code: 'masala-3', module: 6, title: 'مسألة — تربّص نادي كرة القدم: كم فوجًا؟', learningPointIds: ['4am_tayin-pgcd_P1'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ما يلزم قبل الدرس، تقيسه « عُدّة الانطلاق »: قواسم عدد والقاسم المشترك الأكبر.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: '42-wa-60', path: `${LESSON_BASE_PATH}/42-wa-60`,
      title: 'تعيين PGCD بحصر القواسم', desc: 'قواسم كل عدد، ثم القواسم المشتركة، ثم أكبرها.',
      stage: 'trigger', teachesLearningPointIds: ['4am_tayin-pgcd_P1'], color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 1, actionText: 'أعيّن' },
    { id: '02', number: 2, slug: 'nataij-mubashira', path: `${LESSON_BASE_PATH}/nataij-mubashira`,
      title: 'نتائج مباشرة، وعدد يقسم الآخر', desc: 'عددان متساويان، عدد والصفر، التبديل، وعدد يقسم الآخر.',
      stage: 'discovery', teachesLearningPointIds: ['4am_tayin-pgcd_P2', '4am_tayin-pgcd_P3'], color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أتمرّن', desc: 'تمارين متدرّجة على تعيين القاسم المشترك الأكبر.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_tayin-pgcd_P1', '4am_tayin-pgcd_P3'], color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتدرّب' },
    // The « مسائل » (track: 'problem'): they count in completion, never in mastery. Module 4 is the lesson's problem — the
    // store of the world's last bridge (world/story.js › PROBLEM_MODULE); 5 and 6 are completed by the story's end.
    { id: '04', number: 4, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة الدرس', desc: 'رصيفا الميناء: أطول لوح يملأ الرصيفين معًا تمامًا.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_tayin-pgcd_P1'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '05', number: 5, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2', desc: 'وضعية أخرى تُحسب عند إتمام الدرس.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_tayin-pgcd_P1', '4am_tayin-pgcd_P2', '4am_tayin-pgcd_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3', desc: 'وضعية ثالثة تُحسب عند إتمام الدرس.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_tayin-pgcd_P1'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'التقويم', desc: 'تقويم الكفاءات: أسئلة على منوال الامتحان.', stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 3, actionText: 'أدخل التقويم' },
  ],
};
