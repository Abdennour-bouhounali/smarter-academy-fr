/**
 * الدرس 6 — البحث عن القاسم المشترك الأكبر لعددين طبيعيين (4AM, learning net item 4am.m1.r03).
 * A v2 lesson since 2026-11-19: the student plays it in the world « أرخبيل القواسم » (`lesson.pack.js`, `world/`), built
 * from scratch on the platform's own numbers; its module pages and mission player are deleted. The textbook only fixed
 * its الكفاءات (LESSON_DEVELOPMENT_GUIDE §4ter); the coverage map of the textbook stays docs/sources/4am/unit1/extraction.json.
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/ansab_al_aadad_wal_hisab/bahth-pgcd';

export const LESSON_CONFIG = {
  id: 'bahth-pgcd',
  kind: 'lesson',
  unit: 'aadad-tabiiya-natiqa',
  unitTitle: 'الأعداد الطبيعيّة والأعداد النّاطقة',
  sequentialUnlock: true,
  // A v2 lesson (docs/architecture/LESSON_V2.md §2): the student's home is the game world of `lesson.pack.js`. Its module
  // PAGES, the mission player (`studentView: 'mission'`, `mission`) and « مسألة الدرس » (`lessonProblem`) are deleted. The
  // `modules` below stay as DATA: their ids and numbers are how progress is stored (the world marks them, `onModule`),
  // every report reads them, and their addresses redirect home.
  title: 'البحث عن القاسم المشترك الأكبر لعددين طبيعيين',
  description: 'البحث عن القاسم المشترك الأكبر لعددين بخوارزمية الفروق المتتابعة ثم بخوارزمية عمليات القسمات المتتابعة (خوارزمية إقليدس)، مع تبرير كل خطوة بالخاصيتين PGCD(a ; b) = PGCD(b ; a − b) و PGCD(a ; b) = PGCD(b ; r).',
  level: 'moyen',
  grade: '4am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان أنساب الأعداد والحساب',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🔁',
  estimatedDurationMin: 65,
  skills: [
    'تبرير المساواة PGCD(a ; b) = PGCD(b ; a − b) واستعمالها',
    'حساب القاسم المشترك الأكبر بخوارزمية الفروق المتتابعة (آخر فرق غير معدوم)',
    'تبرير المساواة PGCD(a ; b) = PGCD(b ; r) واستعمالها',
    'حساب القاسم المشترك الأكبر بخوارزمية إقليدس (آخر باقٍ غير معدوم)',
    'مقارنة الخوارزميتين من حيث عدد الخطوات واختيار الأنسب',
  ],
  teachingScope: { include: ['الخاصيتان: الفرق والباقي يحفظان القاسم المشترك الأكبر', 'خوارزمية الفروق المتتابعة وخوارزمية إقليدس', 'مقارنة عدد خطوات الخوارزميتين'], exclude: ['التحليل إلى عوامل أولية', 'المضاعف المشترك الأصغر (غير وارد في البرنامج)'] },
  // The lesson's progressive map is the world's « خريطة المعارف »: the `KNOWLEDGE_GRAPH` of the knowledge its pack declares
  // (`lesson.pack.js › knowledge`) — the only one; its home mounts no other (LESSON_V2.md §2).
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // the keys of the lessons before it (their worlds' knowledge — the old ids `khassiya-1`, `khassiya-2` of khawass-qawasim
  // and `pgcd-taarif` of qasim-mushtarak-akbar went with their deleted knowledge.jsx); `nataij-mubashira` is tayin-pgcd's
  priorKnowledge: ['jam-wal-farq', 'baqi-qisma', 'al-akbar', 'nataij-mubashira'],
  resources: [
    // DATA only (exported to the DB; `sourceElementIds` are read by scripts/check-textbook-coverage.mjs): the
    // `pgcd-differences` and `euclidean-algorithm` labs below were the old module pages' instruments; no page of this
    // lesson mounts them any more.
    { kind: 'manipulation', code: 'pgcd-differences-21-14', type: 'pgcd-differences', module: 1,
      level: 'beginner',
      title: 'شريطان: 21 سم و 14 سم (سلسلة قصيرة)',
      objective: 'PGCD(a ; b) = PGCD(b ; a − b) والقاسم المشترك الأكبر هو آخر فرق غير معدوم',
      autonomy: '',
      experience: { type: 'platform_adaptation', reason: 'smaller_numbers_for_first_contact', theme: 'workshop' },
      learningPointIds: ['4am_bahth-pgcd_P1'], sourceElementIds: ['act-6a'] },
    { kind: 'manipulation', code: 'pgcd-differences-252-140', type: 'pgcd-differences', module: 1,
      level: 'advanced',
      title: 'شريطان طويلان: الفروق المتتابعة',
      objective: 'PGCD(a ; b) = PGCD(b ; a − b) والقاسم المشترك الأكبر هو آخر فرق غير معدوم',
      autonomy: 'سلسلة طويلة: التلميذ يحافظ على الترتيب حتى الفرق المعدوم دون توجيه',
      experience: { type: 'platform_adaptation', reason: 'multiple_representations', theme: 'workshop' },
      learningPointIds: ['4am_bahth-pgcd_P1', '4am_bahth-pgcd_P2'], sourceElementIds: ['act-6a'] },
    { kind: 'method', code: 'method-differences-117-91', module: 2, title: 'طريقة: خوارزمية الفروق المتتابعة', learningPointIds: ['4am_bahth-pgcd_P2'], sourceElementIds: ['method-differences'] },
    { kind: 'manipulation', code: 'euclid-45-18', type: 'euclidean-algorithm', module: 3,
      level: 'beginner',
      title: 'خوارزمية إقليدس: شريطان 45 سم و 18 سم (قسمتان)',
      objective: 'PGCD(a ; b) = PGCD(b ; r) والقاسم المشترك الأكبر هو آخر باقٍ غير معدوم',
      autonomy: '',
      experience: { type: 'platform_adaptation', reason: 'smaller_numbers_for_first_contact', theme: 'workshop' },
      learningPointIds: ['4am_bahth-pgcd_P3'], sourceElementIds: ['act-6b'] },
    { kind: 'manipulation', code: 'euclid-765-135', type: 'euclidean-algorithm', module: 3,
      level: 'advanced',
      title: 'خوارزمية إقليدس: قسمات قليلة بدل فروق كثيرة',
      objective: 'PGCD(a ; b) = PGCD(b ; r) والقاسم المشترك الأكبر هو آخر باقٍ غير معدوم',
      autonomy: 'أعداد كبيرة مع المقارنة بالفروق: التلميذ يحكم بنفسه أيّ الطريقتين أنجع',
      experience: { type: 'platform_adaptation', reason: 'multiple_representations', theme: 'workshop' },
      learningPointIds: ['4am_bahth-pgcd_P3', '4am_bahth-pgcd_P4', '4am_bahth-pgcd_P5'], sourceElementIds: ['act-6b'] },
    { kind: 'method', code: 'method-euclid-1938-836', module: 3, title: 'طريقة: خوارزمية إقليدس', learningPointIds: ['4am_bahth-pgcd_P4'], sourceElementIds: ['method-euclid'] },
    { kind: 'situation', code: 'challenge-936-845', module: 4, title: 'تحدّ: مآزر من لونين', learningPointIds: ['4am_bahth-pgcd_P5'], sourceElementIds: ['challenge'] },
    // Modules 5–7 — the « مسائل »: whole exam-style exercises, platform additions (their pages and content/problems.js are
    // deleted since the v2 — data here), never evidence of mastery.
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة — ورشة الخياطة: شريطان من 210 سم و 150 سم', learningPointIds: ['4am_bahth-pgcd_P1', '4am_bahth-pgcd_P2'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — التعاونية الحليبية: 1170 قطعة جبن و 702 قارورة لبن', learningPointIds: ['4am_bahth-pgcd_P3', '4am_bahth-pgcd_P4'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — تبليط قاعة: 585 سم و 405 سم', learningPointIds: ['4am_bahth-pgcd_P3', '4am_bahth-pgcd_P4', '4am_bahth-pgcd_P5'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ما يلزم قبل الدرس، تقيسه « عُدّة الانطلاق »: خاصيتا القواسم والقاسم المشترك الأكبر.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'al-furuq', path: `${LESSON_BASE_PATH}/al-furuq`,
      title: 'الفرق، ثمّ الفروق المتتابعة', desc: 'عددان كبيران: نطرح الأصغر من الأكبر ونعيد حتّى يصير الفرق معدومًا.',
      stage: 'trigger', teachesLearningPointIds: ['4am_bahth-pgcd_P1', '4am_bahth-pgcd_P2'], color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أطرح وأعيد' },
    { id: '02', number: 2, slug: 'khassiyatan', path: `${LESSON_BASE_PATH}/khassiyatan`,
      title: 'الفرق والباقي', desc: 'طرح الأصغر مرّات عديدة، أو قسمة واحدة: ماذا يبقى؟',
      stage: 'discovery', teachesLearningPointIds: ['4am_bahth-pgcd_P1', '4am_bahth-pgcd_P2', '4am_bahth-pgcd_P3'], color: 'violet', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أبرّر' },
    { id: '03', number: 3, slug: 'khwarizmiyat-iqlidus', path: `${LESSON_BASE_PATH}/khwarizmiyat-iqlidus`,
      title: 'القسمات المتتابعة، وأقصر طريق', desc: 'عددان كبيران جدًّا: قسمات متتابعة، ومقارنة عدد الخطوات.',
      stage: 'manipulation', teachesLearningPointIds: ['4am_bahth-pgcd_P3', '4am_bahth-pgcd_P4', '4am_bahth-pgcd_P5'], color: 'emerald', style: 'featured', estimatedMin: 15, difficulty: 3, actionText: 'أقسم وأعيد' },
    { id: '04', number: 4, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أتمرّن', desc: 'تمارين متدرّجة على البحث عن القاسم المشترك الأكبر.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_bahth-pgcd_P2', '4am_bahth-pgcd_P4', '4am_bahth-pgcd_P5'], color: 'amber', style: 'featured', estimatedMin: 14, difficulty: 3, actionText: 'أتدرّب' },
    // The « مسائل » (track: 'problem'): they count in completion, never in mastery. Module 7 is the lesson's problem — the
    // store of the world's last bridge (world/story.js › PROBLEM_MODULE); 5 and 6 are completed by the story's end.
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1', desc: 'وضعية تُحسب عند إتمام الدرس.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_bahth-pgcd_P1', '4am_bahth-pgcd_P2'],
      color: 'amber', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2', desc: 'وضعية أخرى تُحسب عند إتمام الدرس.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_bahth-pgcd_P3', '4am_bahth-pgcd_P4'],
      color: 'amber', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة الدرس', desc: 'جسر المرسى: أطول لوح يملأ الممرّين معًا تمامًا.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_bahth-pgcd_P3', '4am_bahth-pgcd_P4', '4am_bahth-pgcd_P5'],
      color: 'amber', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'التقويم', desc: 'تقويم الكفاءات: أسئلة على منوال الامتحان.', stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 8, difficulty: 4, actionText: 'أدخل التقويم' },
  ],
};
