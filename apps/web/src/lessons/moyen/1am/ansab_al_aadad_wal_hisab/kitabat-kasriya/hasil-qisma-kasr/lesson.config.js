/**
 * الدرس — حاصل القسمة والكسر (1AM, unité 4 « الكتابات الكسرية »).
 * Manuel 1AM (الجيل الثاني) : نشاط 1 p. 53 « تقسيم رغيف تقليدي » (cinq pains pour six personnes), معارف 1 p. 55 (sans son dernier
 * exemple « 0,7 = 7/10 », à `ikhtizal-kitaba-kasriya`), « تمهيد » p. 51, استحضر مكتسباتي items 5–7 p. 52, exercices 1–5 p. 57, أقوّم 1, 2,
 * 3, 9 p. 59, أتعمّق 2 p. 60. Généré DANS son entrée du catalogue (item 1am.m5.r01), cycle moyen phase 3, batch 3, 2026-10-15 — APRÈS
 * `ikhtizal-kitaba-kasriya` (ordre de la file du réseau), qui n'en rappelait que le sens quotient.
 * Source : docs/sources/1am/unit4/extraction.json ; brief : docs/sources/1am/unit4/brief-authors.md.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : un PARTAGE de pains où la main tient la PART d'UN enfant (labo `fair-share`) : le total b × x est jugé contre les a
 *   pains, la règle décimale tombe juste pour 3 pains / 4 enfants (0,75) mais jamais pour 2 / 3 (0,66 laisse toujours 0,02), la règle des
 *   morceaux (chaque pain coupé en b) tombe juste pour tout a et b ≠ 0 — c'est là que le nombre « qui multiplié par b donne a » devient
 *   NÉCESSAIRE à la main. Rejetée : le نشاط 1 du manuel comme entrée (cinq pains, la division décimale de Mariam et la coupe en six
 *   posées avant tout geste, questions auxquelles on répond de mémoire) ; il reste le niveau متقدم (5 pains pour 6 personnes, puis 7 pour 3)
 *   et ses quatre questions sont posées en APPLICATION dans أتمرّن. Ordre des idées : la part qui vide la table (b × x = a) → la règle
 *   décimale qui échoue → la règle des morceaux → a/b écrit (brique APRÈS la réponse) → معارف : a ÷ b = a/b, a/b × b = a, décimal ou non
 *   (7/3, 2,33) → طريقة du facteur manquant (ajout déclaré) → أتمرّن.
 *   « أستعدّ » mesure `1am.m1.r02` (deux énoncés de la plateforme) et les items 5–7 du manuel (division décimale de 2 ÷ 3, fraction
 *   d'une figure à parts égales).
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/1am/ansab_al_aadad_wal_hisab/hasil-qisma-kasr';

export const LESSON_CONFIG = {
  id: 'hasil-qisma-kasr',
  kind: 'lesson',
  unit: 'kitabat-kasriya',
  unitTitle: 'الكتابات الكسرية',
  sequentialUnlock: true,
  title: 'حاصل القسمة والكسر',
  description: 'نوزّع كعكات على أطفال بالتساوي فنكتشف أنّ العدد الذي إذا ضُرب في b أعطى a يُكتب a/b: الكسر هو حاصل قسمة a على b، وليس عددًا عشريًا دائمًا.',
  level: 'moyen',
  grade: '1am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🥖',
  estimatedDurationMin: 85,
  textbookRef: { unit: 4, activity: 1, pages: '51, 52, 53, 55, 57, 59, 60' },
  skills: [
    'التعرّف على الكسر $\\frac{a}{b}$ كحاصل قسمة $a$ على $b$ ($b\\neq0$)، وكتابة حاصل قسمة عددين طبيعيين على شكل كسر',
    'توظيف النتيجة $\\frac{a}{b}\\times b=a$ لإيجاد عدد ناقص في مساواة من الشكل $b\\times\\ldots=a$',
    'التمييز بين حاصل قسمة عدد عشري وحاصل قسمة غير عشري (مثل $\\frac{7}{3}$) وإعطاء قيمة مقرّبة له',
  ],
  teachingScope: {
    include: ['الكسر حاصل قسمة', 'a/b × b = a والعدد الناقص', 'حاصل قسمة عشري وغير عشري وقيمة مقرّبة'],
    exclude: ['كتابات كسرية متساوية والاختزال (درس «الكتابات الكسرية لحاصل قسمة واختزال كسر»)', 'تعليم حاصل قسمة على نصف مستقيم مدرّج (درس لاحق)', 'أخذ كسر من عدد (درس لاحق)', 'القسمة العشرية والتدوير (درس لاحق من وحدة القسمة)'],
  },
  // « مسألة الدرس » : un quotient non décimal (7 ÷ 3), le facteur manquant, la valeur approchée — module 5.
  lessonProblem: {
    module: 5,
    title: 'عصير نهاية السنة',
    statement: 'بمناسبة نهاية السنة، تعاون تلاميذ القسم فجمعوا 7 لترات من عصير التفاح وصبّوها بالتساوي في 3 قارورات متماثلة، دون أن يضيع منها شيء. يبدأ الحفل على الساعة 10.',
    questions: [
      { label: '1)', text: 'عبّر على شكل كسر عن كمية العصير في قارورة واحدة.' },
      { label: '2)', text: 'أكمل $3\\times\\ldots=7$ ، ثم احسب $\\frac{7}{3}\\times 3$.' },
      { label: '3)', text: 'هل $\\frac{7}{3}$ عدد عشري؟ أعط قيمة مقرّبة له بالنقصان إلى 0,01.' },
    ],
    illustration: { kind: 'tags', cards: [{ title: 'العصير', icon: 'bottle', lines: [{ label: 'اللترات', value: 7 }, { label: 'القارورات', value: 3 }] }], ariaLabel: 'بطاقة العصير: 7 لترات تُصبّ بالتساوي في 3 قارورات' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : la fraction d'une figure à parts égales (manuel p. 52 items 6–7), la division décimale
  // (item 5), l'item du réseau `1am.m1.r02` (écriture décimale ↔ fraction décimale) et la division réciproque de la multiplication.
  priorKnowledge: ['kasr-juz-ibtidai', 'kitaba-ashriya-kasriya', 'qisma-ashriya-ibtidai'],
  resources: [
    // Module 1 — WORKSPACE À DEUX NIVEAUX, un seul type `fair-share` (la main tient la PART d'un enfant) :
    //   مبتدئ — la cantine de l'école : 3 pains pour 4 enfants (décimal juste : 0,75) puis 2 pains pour 3 (jamais juste en décimal).
    //   متقدم — نشاط 1 du manuel : 5 pains pour 6 personnes puis 7 pains pour 3 (la part dépasse un pain).
    {
      kind: 'manipulation', code: 'fair-share-canteen', type: 'fair-share', module: 1,
      level: 'beginner',
      title: 'استراحة المدرسة: الكعكات والأطفال',
      objective: 'العدد الذي إذا ضُرب في b أعطى a موجود دائمًا ويُكتب a/b: حاصل قسمة a على b ليس عشريًا دائمًا',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'bakery' },
      learningPointIds: ['1am_hasil-qisma-kasr_P1', '1am_hasil-qisma-kasr_P3'],
      sourceElementIds: ['act-1'],
    },
    {
      kind: 'manipulation', code: 'fair-share-family', type: 'fair-share', module: 1,
      level: 'advanced',
      title: 'نشاط 1: خمس كعكات لستة أشخاص',
      objective: 'العدد الذي إذا ضُرب في b أعطى a موجود دائمًا ويُكتب a/b: حاصل قسمة a على b ليس عشريًا دائمًا',
      autonomy: 'لا يوجد أيّ طلب تنتهي كعكاته بالتقسيم إلى عشر قطع: يجرّب التلميذ بنفسه عدد القطع في الكعكة وعدد ما يأخذه كل واحد، ويصل إلى حصّة تتجاوز كعكة واحدة',
      experience: { type: 'textbook', reason: '' },
      learningPointIds: ['1am_hasil-qisma-kasr_P1', '1am_hasil-qisma-kasr_P2', '1am_hasil-qisma-kasr_P3'],
      sourceElementIds: ['act-1'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — عصير نهاية السنة', learningPointIds: ['1am_hasil-qisma-kasr_P1', '1am_hasil-qisma-kasr_P2', '1am_hasil-qisma-kasr_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — تحقّق من نتيجة', learningPointIds: ['1am_hasil-qisma-kasr_P2'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — شريط الإهداء', learningPointIds: ['1am_hasil-qisma-kasr_P1', '1am_hasil-qisma-kasr_P2', '1am_hasil-qisma-kasr_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ الكسور، الكتابة العشرية، القسمة.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 8, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — نقتسم الكعكات', desc: 'نختار حصّة كل واحد حتى تنتهي الكعكات تمامًا: كيف نقسّم الكعكات حتى تنتهي كلها؟',
      stage: 'trigger', teachesLearningPointIds: ['1am_hasil-qisma-kasr_P1', '1am_hasil-qisma-kasr_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 16, difficulty: 1, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — حاصل القسمة والكسر', desc: 'a ÷ b = a/b ، a/b × b = a ، وحاصل قسمة غير عشري مثل 7/3.',
      stage: 'discovery', teachesLearningPointIds: ['1am_hasil-qisma-kasr_P1', '1am_hasil-qisma-kasr_P2', '1am_hasil-qisma-kasr_P3'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — إيجاد العدد الناقص', desc: 'العدد الناقص في 8 × … = 13 هو حاصل قسمة 13 على 8.',
      stage: 'formalization', teachesLearningPointIds: ['1am_hasil-qisma-kasr_P2'],
      color: 'emerald', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'قسمة كعكات، كسر من شكل، عدد ناقص.',
      stage: 'practice_lab', teachesLearningPointIds: ['1am_hasil-qisma-kasr_P1', '1am_hasil-qisma-kasr_P2'],
      color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — عصير نهاية السنة', desc: 'مسألة الدرس: حاصل قسمة لا تنتهي.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_hasil-qisma-kasr_P1', '1am_hasil-qisma-kasr_P2', '1am_hasil-qisma-kasr_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — تحقّق من نتيجة', desc: 'الضرب يعكس القسمة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_hasil-qisma-kasr_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — شريط الإهداء', desc: 'حاصل قسمة عشري وعدد ناقص.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_hasil-qisma-kasr_P1', '1am_hasil-qisma-kasr_P2', '1am_hasil-qisma-kasr_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
