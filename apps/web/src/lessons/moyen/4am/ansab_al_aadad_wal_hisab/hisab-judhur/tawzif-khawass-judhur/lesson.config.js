/**
 * الدرس 5 — توظيف خواص الجذور التربيعية
 * Unité 2 du manuel (4AM) : طرائق p. 25 (تمرين 1, تمرين 2, نسبة مقامها عدد
 * غير ناطق, دوري الآن 1–2), exercices 18, 19, 22, 23, 24, 26, 27 (p. 27),
 * 28, 29, 30 (p. 27), 31 (2), 32, 34, 36, 37, 38 (p. 29), دوري الآن p. 30,
 * « أستعدّ » items 7–9 (p. 19), QCM item 7 (p. 28),
 * puis trois « مسائل » de la plateforme (modules 6–8).
 * Source de vérité : docs/sources/4am/unit2/extraction.json.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Cette leçon est une page de طرائق : le manuel n'a PAS d'activité, donc pas d'« entrée du livre » à copier.
 *   Entrée retenue (module 1) : le carré dallé (square-tiling, 32 puis 288 à un clic) — la main choisit le nombre de dalles sur
 *   le côté et voit qu'une dalle encore pavable n'est pas la plus petite : l'idée « le plus grand carré a² qui divise n » devient
 *   NÉCESSAIRE pour décider quand s'arrêter. Rejetées : (1) تمرين 1 du livre (√8, √18, √50 → a√2) comme première question — il
 *   se répond de mémoire, c'est un test ; il devient l'application de l'étape 2 ; (2) la solution rédigée de A en tête de leçon.
 *   Ordre des idées : paver (aucune étape n'attend le labo) → POURQUOI k√8 ne suffit pas (sur le carré que l'élève a fini) → la
 *   brique « kitaba-a-jidhr-b » APRÈS la réponse → √8, √18, √50 → M2 : la solution de A ligne à ligne, POURQUOI tout écrire avec
 *   √2, la brique « tabsit-tawzii » APRÈS cette réponse → جداء de racines → M3 : prédire le facteur qui rend le dénominateur
 *   ناطق, la solution du livre, la brique « naqt-maqam » APRÈS la lecture. M2/M3 sont des modules sans labo : leur carte reste
 *   (elle dit ce qu'est le module, sans fait). M4–M9 inchangés. Aucune destination du manuel n'a bougé.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/ansab_al_aadad_wal_hisab/tawzif-khawass-judhur';

export const LESSON_CONFIG = {
  id: 'tawzif-khawass-judhur',
  kind: 'lesson',
  unit: 'hisab-judhur',
  unitTitle: 'الحساب على الجذور',
  sequentialUnlock: true,
  // Regard de l'élève : 'mission' (modèle du pilote qasim-adad-tabii, VALIDÉ par le propriétaire le 2026-11-08 ; rollout leçon par leçon,
  // docs/reports/MISSION_ROLLOUT_PROGRESS.md — unité 2, leçon 5, 2026-11-10) — implique le regard « focus » ; l'enseignant et le mode classe ne voient
  // aucun changement.
  studentView: 'mission',
  // LA MISSION : l'ouverture avoue qu'on ne sait pas encore la résoudre ; les outils sont les connaissances de knowledge.jsx ; les points d'étape
  // (conseil du 2026-11-10) RAPPROCHENT de la mission sans en résoudre aucune question : ni ses nombres (200, √200, 10√2, 100, 50, 2√50, 5√8,
  // 100√2, 120, 12 000, 12, 10, 25 pièces) ni sa méthode (« nombre de pièces = k × k, puis le prix ») ni la مسألة de la leçon 4 (180, 6√5) —
  // content/mission.test.js. La scène : la cour de la leçon 4, repavée de dalles plus GRANDES (« courtyard-big »).
  mission: {
    scene: 'courtyard-big',
    title: 'طاولة الفسيفساء: أصغر قطعة ممكنة',
    opening: {
      text: 'في ورشة بغرداية، يغطّي حِرفيّ سطح طاولة مربّعًا مساحته $200\\,dm^2$ بقطع فسيفساء مربّعة متماثلة، مساحة كل منها عدد طبيعي. يريد الزبون أن تكون القطع أصغر ما يمكن. ما أصغر قطعة؟ وكيف نكتب طول ضلع الطاولة؟',
      cta: 'لا أعرف بعد… هيا نجمع الأدوات',
    },
    tools: [
      { id: 'kitaba-a-jidhr-b', icon: '🧱', label: 'أبسط كتابة لجذر' },
      { id: 'tabsit-tawzii', icon: '➕', label: 'جمع جذور متشابهة' },
      { id: 'naqt-maqam', icon: '➗', label: 'مقام ناطق' },
    ],
    climaxModule: 6,
    checkpoints: [
      {
        id: 'cp-abasat', afterModule: 1,
        prompt: '$\\sqrt{45} = \\; ?$',
        options: ['$3\\sqrt{5}$', '$\\sqrt{9} \\times 5$', '$5\\sqrt{3}$'],
        correct: 0,
        explain: 'أكبر مربّع يقسم 45 هو 9: $\\sqrt{45} = \\sqrt{3^2 \\times 5} = 3\\sqrt{5}$',
      },
      {
        id: 'cp-jam', afterModule: 2,
        prompt: '$2\\sqrt{3} + 5\\sqrt{3} = \\; ?$',
        options: ['$7\\sqrt{3}$', '$7\\sqrt{6}$', '$7 + \\sqrt{3}$'],
        correct: 0,
        explain: 'بالخاصية التوزيعية: $2\\sqrt{3} + 5\\sqrt{3} = (2 + 5)\\sqrt{3} = 7\\sqrt{3}$',
      },
      {
        id: 'cp-maqam', afterModule: 3,
        prompt: '$\\dfrac{6}{\\sqrt{3}} = \\; ?$',
        options: ['$2\\sqrt{3}$', '$6\\sqrt{3}$', '$\\dfrac{2\\sqrt{3}}{3}$'],
        correct: 0,
        explain: 'نضرب البسط والمقام في $\\sqrt{3}$ : $\\dfrac{6}{\\sqrt{3}} = \\dfrac{6\\sqrt{3}}{3} = 2\\sqrt{3}$',
      },
    ],
  },
  title: 'توظيف خواص الجذور التربيعية',
  description: 'كتابة جذر على الشكل a√b حيث b أصغر ما يمكن، وتبسيط مجموع جذور بالخاصية التوزيعية، وكتابة نسبة مقامها عدد غير ناطق على شكل نسبة مقامها عدد ناطق.',
  level: 'moyen',
  grade: '4am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان أنساب الأعداد والحساب',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🧱',
  estimatedDurationMin: 71,
  textbookRef: { unit: 2, activity: null, pages: '25, 27, 29, 30' },
  // « مسألة الدرس » : l'énoncé de la مسألة 1 (content/problems.js), montré au
  // sommaire de l'unité (LessonProblemCard, plus dans le module 1), résolu au module 6.
  // Elle prolonge le carré dallé du niveau متقدم : même instrument, autre aire.
  lessonProblem: {
    module: 6,
    title: 'طاولة فسيفساء مربّعة: أصغر قطعة ممكنة',
    illustration: { kind: 'plan', shape: 'square', fill: 'tile', side: '؟', unit: 'dm', area: '200', areaUnit: 'dm²', ariaLabel: 'سطح طاولة مربّع الشكل مساحته 200 دم² يُغطّى بقطع فسيفساء مربّعة متماثلة' },
    statement: 'في ورشة بغرداية، يصنع حِرفيّ بإتقان ودقّة طاولة سطحها مربّع الشكل مساحته $200\\,dm^2$، ويغطّيه كلّه بفسيفساء: قطع مربّعة متماثلة، مساحة كل منها عدد طبيعي من $dm^2$، مرصوفة صفوفًا وأعمدة. تُنجز الطاولة في 12 يومًا، وثمن القطعة الواحدة 120 دج مهما كان مقاسها. يريد الزبون أن تكون القطع أصغر ما يمكن.',
  },
  skills: [
    'كتابة الجذر التربيعي لعدد طبيعي على الشكل a√b حيث b أصغر ما يمكن',
    'تبسيط مجموع جذور متشابهة بالخاصية التوزيعية',
    'كتابة نسبة مقامها عدد غير ناطق على شكل نسبة مقامها عدد ناطق',
    'نشر وتبسيط عبارات تتضمن جذورًا تربيعية باستعمال المتطابقات الشهيرة',
  ],
  teachingScope: {
    include: [
      'طريقة الكتاب: البحث عن أكبر مربع a² يقسم n لكتابة √n على الشكل a√b',
      'تبسيط مجموع جذور بالخاصية التوزيعية',
      'نسبة مقامها عدد غير ناطق: ضرب البسط والمقام في √b',
      'نشر عبارات تتضمن جذورًا (تمارين الكتاب 28 ← 30، 36، 37)',
    ],
    exclude: [
      'تعريف الجذر التربيعي (الدرس 1)',
      'الأعداد الناطقة وغير الناطقة (الدرس 2)',
      'حل المعادلة x² = a (الدرس 3)',
      'إثبات خاصيتي الجداء والقسمة (الدرس 4)',
    ],
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // La carte TOUTE OUVERTE (règle des pilotes, propriétaire 2026-11-08) : toutes les connaissances dès le début, sans verrou par محور.
  knowledgeMapOpen: true,
  // Les acquis que « أستعدّ » diagnostique : les leçons 1 et 4 de l'unité, et
  // les متطابقات (أستعدّ p. 19, items 7–9).
  priorKnowledge: ['jidaa-jidhrayn', 'jidhr-a2b', 'qismat-jidhrayn', 'mutatabiqat', 'jidhr-taarif'],
  resources: [
    // Le module 1 n'a PAS d'activité du manuel (la leçon est une page de
    // طرائق) : le laboratoire est l'entrée de la PLATEFORME dans la طريقة
    // « نبحث عن أكبر مربع a² يقسم n », déclarée comme telle. Les deux aires
    // viennent de l'exercice 18 (√32 et √288).
    {
      kind: 'manipulation', code: 'square-tiling-32', type: 'square-tiling', module: 1,
      level: 'beginner',
      title: 'مربّع مساحته 32: أيّ تبليط يعطي أصغر بلاطة؟',
      objective: 'كتابة √n على الشكل a√b حيث b أصغر ما يمكن: a² أكبر مربّع يقسم n',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'abstract' },
      learningPointIds: ['4am_tawzif-khawass-judhur_P1'],
      sourceElementIds: ['method-simplify', 'ex-18'],
    },
    {
      kind: 'manipulation', code: 'square-tiling-288', type: 'square-tiling', module: 1,
      level: 'advanced',
      title: 'مربّع مساحته 288: ستّة تبليطات، واحد فقط أبسطها',
      objective: 'كتابة √n على الشكل a√b حيث b أصغر ما يمكن: a² أكبر مربّع يقسم n',
      autonomy: 'ستة تبليطات صالحة (1، 2، 3، 4، 6 أو 12 بلاطة على الضلع) دون أي اقتراح: التلميذ يجرّب بنفسه ويقرّر أيّها يعطي بلاطة لا يمكن تبليطها من جديد؛ ست بلاطات على الضلع تعطي بلاطة مساحتها 8 تبدو صغيرة وليست أصغر ما يمكن',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'abstract' },
      learningPointIds: ['4am_tawzif-khawass-judhur_P1'],
      sourceElementIds: ['method-simplify', 'ex-18'],
    },
    // Les « مسائل » : exercices complets de type امتحان, AJOUTS de la
    // plateforme (content/problems.js), sans aucune preuve de maîtrise.
    { kind: 'situation', code: 'masala-1', module: 6, title: 'مسألة الدرس — طاولة فسيفساء مربّعة: أصغر قطعة ممكنة', learningPointIds: ['4am_tawzif-khawass-judhur_P1'] },
    { kind: 'situation', code: 'masala-2', module: 7, title: 'مسألة — أحواض حديقة المتوسطة: هل يتّسع الممرّ؟', learningPointIds: ['4am_tawzif-khawass-judhur_P1', '4am_tawzif-khawass-judhur_P2'] },
    { kind: 'situation', code: 'masala-3', module: 8, title: 'مسألة — الطائرات الورقية: ضلع وشريط', learningPointIds: ['4am_tawzif-khawass-judhur_P2', '4am_tawzif-khawass-judhur_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'عشر عبارات: النشر والخاصية التوزيعية، وجداء جذرين وحاصل قسمتهما. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'مربّع مبلّط — أبسط كتابة لجذر', desc: 'بلّط مربّعات بكل الطرق: أيّ بلاطة أصغر ما يمكن؟ ثم اكتب جذورًا على أبسط شكل.',
      stage: 'trigger', teachesLearningPointIds: ['4am_tawzif-khawass-judhur_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أبلّط' },
    { id: '02', number: 2, slug: 'tabsit', path: `${LESSON_BASE_PATH}/tabsit`,
      title: 'طرائق — تبسيط عبارة تتضمن جذورًا', desc: 'تبسيط عبارة بالخاصية التوزيعية وحساب جداء جذور، ثم دوري الآن.',
      stage: 'discovery', teachesLearningPointIds: ['4am_tawzif-khawass-judhur_P1', '4am_tawzif-khawass-judhur_P2'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'nisba', path: `${LESSON_BASE_PATH}/nisba`,
      title: 'طرائق — نسبة مقامها عدد غير ناطق', desc: 'كيف نجعل المقام عددًا ناطقًا، ثم دوري الآن.',
      stage: 'discovery', teachesLearningPointIds: ['4am_tawzif-khawass-judhur_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أكتشف' },
    { id: '04', number: 4, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'تمارين: أبسط كتابة لجذر، مقام ناطق، وتبسيط عبارات.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_tawzif-khawass-judhur_P1', '4am_tawzif-khawass-judhur_P2', '4am_tawzif-khawass-judhur_P3'],
      color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'atamaqq', path: `${LESSON_BASE_PATH}/atamaqq`,
      title: 'أتعمّق', desc: 'نشر وتبسيط، المكعّب، المثلث القائم، ومسائل من امتحان شهادة التعليم المتوسط.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_tawzif-khawass-judhur_P2', '4am_tawzif-khawass-judhur_P3'],
      color: 'rose', style: 'featured', estimatedMin: 12, difficulty: 4, actionText: 'أتعمّق' },
    // Les « مسائل » (track: 'problem') : practice_lab, avant le test, qui
    // reste toujours ouvert. Elles comptent dans la complétion, jamais dans
    // la maîtrise — docs/architecture/LESSON_CONTRACT.md § Modules « مسائل ».
    // 6 min chacune : la leçon est déjà à 71 min (71 + 18 = 89 ≤ 90).
    { id: '06', number: 6, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — طاولة الفسيفساء', desc: 'مسألة الدرس: سطح مربّع مساحته 200 مغطّى بقطع مربّعة متماثلة. أيّ قطعة أصغر ما يمكن؟ وكم تكلّف القطع؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_tawzif-khawass-judhur_P1'],
      color: 'amber', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — أحواض حديقة المتوسطة', desc: 'أحواض مربّعة متلاصقة: ما الطول الذي تشغله؟ وهل يتّسع الممرّ لحوض آخر؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_tawzif-khawass-judhur_P1', '4am_tawzif-khawass-judhur_P2'],
      color: 'amber', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — الطائرات الورقية', desc: 'من القطر إلى الضلع بمقام ناطق، ثم كم مترًا من الشريط يشتري النادي؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_tawzif-khawass-judhur_P2', '4am_tawzif-khawass-judhur_P3'],
      color: 'amber', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '09', number: 9, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 7, difficulty: 3, actionText: 'أدخل التقويم' },
  ],
};
