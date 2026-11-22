/**
 * الدرس 1 — التعرّف على قاسم لعدد طبيعي (4AM, item du réseau 4am.m1.r01).
 * A v2 lesson since 2026-11-18: the student plays it in the world « أرخبيل القواسم » (`lesson.pack.js`, `world/`), built
 * from scratch on the platform's own numbers; its module pages and mission player are deleted. The textbook only fixed
 * its الكفاءات (LESSON_DEVELOPMENT_GUIDE §4ter); the coverage map of the textbook stays docs/sources/4am/unit1/extraction.json.
 * Le réseau (2026-11-07) : 4am.m1.r01 REQUIERT 1am.m3.r01 (`qisma-iqlidiya-baqi`) et ÉTEND 1am.m3.r02 (`qawaid-qabiliyat-qisma`).
 *   Arêtes LP le long de ces deux liens : P1 ← 1am_qisma-iqlidiya-baqi_P1 (faire la division) + 1am_qawaid-qabiliyat-qisma_P4 (« يقبل القسمة » = reste nul),
 *   P2 ← 1am_qisma-iqlidiya-baqi_P2 (a = b × q + r), P3 ← 1am_qawaid-qabiliyat-qisma_P4. Aucune arête vers 2AM `qisma-iqlidiya-hasr` : le réseau n'a pas de lien
 *   2am.m1.r04 → 4am.m1.r01 (question au propriétaire).
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/ansab_al_aadad_wal_hisab/qasim-adad-tabii';

export const LESSON_CONFIG = {
  id: 'qasim-adad-tabii',
  kind: 'lesson',
  unit: 'aadad-tabiiya-natiqa',
  unitTitle: 'الأعداد الطبيعيّة والأعداد النّاطقة',
  sequentialUnlock: true,
  // A v2 lesson (docs/architecture/LESSON_V2.md §2, owner's order of 2026-11-18): the student's home is the game world of
  // `lesson.pack.js`. Its module PAGES, the mission player (`studentView: 'mission'`, `mission`), « مسألة الدرس »
  // (`lessonProblem`) and `?view=classic` are deleted. The `modules` below stay as DATA: their ids and numbers are how
  // progress is stored (the world marks them, `onModule`), every report reads them, and their addresses redirect home.
  title: 'التعرّف على قاسم لعدد طبيعي',
  description: 'التعرّف على قاسم لعدد طبيعي من خلال القسمة الإقليدية والمساواة a = b × q، واستعمال الصيغ المتكافئة: قاسم لـ، يقسم، يقبل القسمة على، مضاعف لـ.',
  level: 'moyen',
  grade: '4am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان أنساب الأعداد والحساب',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🔢',
  estimatedDurationMin: 45,
  skills: [
    'التعرّف على قاسم لعدد طبيعي من خلال الباقي المعدوم للقسمة الإقليدية',
    'التعبير عن «b قاسم لـ a» بالمساواة a = b × q',
    'استعمال الصيغ المتكافئة: قاسم لـ، يقسم، يقبل القسمة على، مضاعف لـ',
    'معرفة أن 1 قاسم لكل عدد طبيعي وأن كل عدد طبيعي غير معدوم قاسم لنفسه',
  ],
  teachingScope: {
    include: ['قاسم عدد طبيعي: التعريفان (الباقي المعدوم، a = b × q) والصيغ المتكافئة', 'الملاحظات: 1 قاسم لكل عدد، وكل عدد غير معدوم قاسم لنفسه'],
    exclude: ['تعيين كل قواسم عدد (الدرس 2)', 'خواص القواسم (الدرس 3)', 'القاسم المشترك الأكبر (الدرس 4)'],
  },
  // The lesson's progressive map is the world's « خريطة المعارف »: the `KNOWLEDGE_GRAPH` of the knowledge its pack declares
  // (`lesson.pack.js › knowledge`) — the only one; its home mounts no other (LESSON_V2.md §2).
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // What the lesson builds on (the earlier years); the launch kit (launchkit/families.js) checks them before the world.
  priorKnowledge: ['qisma-iqlidiya', 'qawaid-qabiliyat-al-qisma'],
  resources: [
    // DATA only (exported to the DB; `sourceElementIds` are read by scripts/check-textbook-coverage.mjs): the
    // `team-builder` labs below were the old module pages' instruments; no page of this lesson mounts them any more.
    {
      kind: 'manipulation', code: 'team-builder-15-3', type: 'team-builder', module: 1,
      level: 'beginner',
      title: 'قسمة بالتساوي — 15 لاعبًا في 3 فرق',
      objective: 'التوزيع بالتساوي: a = b × q + r، والباقي معدوم ⇔ b قاسم لـ a',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'football' },
      learningPointIds: ['4am_qasim-adad-tabii_P1'],
      sourceElementIds: ['act-1'],
    },
    {
      kind: 'manipulation', code: 'team-builder-42', type: 'team-builder', module: 1,
      level: 'advanced',
      title: 'هل هو قاسم؟ — 42 لاعبًا في 5 أو 6 فرق',
      objective: 'التوزيع بالتساوي: a = b × q + r، والباقي معدوم ⇔ b قاسم لـ a',
      autonomy: 'التلميذ يختار بنفسه عدد الفرق (4 إلى 7) لـ 42 لاعبًا، ويرى متى لا يبقى أحد خارج الفرق',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'football' },
      learningPointIds: ['4am_qasim-adad-tabii_P1', '4am_qasim-adad-tabii_P2'],
      sourceElementIds: ['act-1'],
    },
    {
      kind: 'manipulation', code: 'team-builder-48', type: 'team-builder', module: 2,
      title: 'مثال: 48 لاعبًا — 6 ثم 8 فرق',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'football' },
      learningPointIds: ['4am_qasim-adad-tabii_P2'],
      sourceElementIds: ['know-1'],
    },
    // Modules 4–6 — les « مسائل » : exercices complets de type امتحان, ajouts
    // de la plateforme (leurs pages et content/problems.js sont supprimés depuis la v2 — des données ici), sans aucune preuve de maîtrise.
    { kind: 'situation', code: 'masala-1', module: 4, title: 'مسألة الدرس — رفوف المكتبة: 756 كتابًا', learningPointIds: ['4am_qasim-adad-tabii_P1', '4am_qasim-adad-tabii_P2', '4am_qasim-adad-tabii_P3'] },
    { kind: 'situation', code: 'masala-2', module: 5, title: 'مسألة — التعاونية الفلاحية: 2028 بيضة', learningPointIds: ['4am_qasim-adad-tabii_P1', '4am_qasim-adad-tabii_P2', '4am_qasim-adad-tabii_P3'] },
    { kind: 'situation', code: 'masala-3', module: 6, title: 'مسألة — الرحلة المدرسية: كم حافلة؟', learningPointIds: ['4am_qasim-adad-tabii_P1', '4am_qasim-adad-tabii_P2'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ما يلزم قبل الدرس، تقيسه « عُدّة الانطلاق »: القسمة الإقليدية وقواعد قابلية القسمة.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 8, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'al-maktaba', path: `${LESSON_BASE_PATH}/al-maktaba`,
      title: 'قاسم عدد طبيعي: الباقي المعدوم', desc: 'متى يكون عدد قاسمًا لعدد آخر؟ حين يكون باقي القسمة معدومًا.',
      stage: 'trigger', teachesLearningPointIds: ['4am_qasim-adad-tabii_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 10, difficulty: 1, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'قاسم عدد طبيعي: الجداء وصيغه', desc: 'a = b × q، وأربع جمل لها نفس المعنى، و 1 والعدد نفسه قاسمان دائمًا.',
      stage: 'discovery', teachesLearningPointIds: ['4am_qasim-adad-tabii_P2', '4am_qasim-adad-tabii_P3', '4am_qasim-adad-tabii_P4'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أتمرّن', desc: 'تمارين على القاسم: بالباقي وبالجداء.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_qasim-adad-tabii_P1', '4am_qasim-adad-tabii_P2'],
      color: 'amber', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتدرّب' },
    { id: '04', number: 4, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة الدرس', desc: 'وضعية تُحلّ بالقاسم: الباقي المعدوم والجداء.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_qasim-adad-tabii_P1', '4am_qasim-adad-tabii_P2', '4am_qasim-adad-tabii_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '05', number: 5, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2', desc: 'وضعية أخرى تُحسب عند إتمام الدرس.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_qasim-adad-tabii_P1', '4am_qasim-adad-tabii_P2', '4am_qasim-adad-tabii_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3', desc: 'وضعية ثالثة تُحسب عند إتمام الدرس.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_qasim-adad-tabii_P1', '4am_qasim-adad-tabii_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'التقويم', desc: 'تقويم الكفاءات: أسئلة على منوال الامتحان.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 7, difficulty: 3, actionText: 'أدخل التقويم' },
  ],
};
