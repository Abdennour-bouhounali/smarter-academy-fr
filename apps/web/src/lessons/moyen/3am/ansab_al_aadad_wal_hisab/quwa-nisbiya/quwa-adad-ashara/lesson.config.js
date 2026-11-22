/**
 * الدرس — قوى العدد 10 (3AM, unité 3 « القوى ذات أسس نسبية صحيحة ») — généré DANS son entrée du catalogue (items 3am.m3.r01, r03), cycle moyen
 * phase 3, Phase 0 « owner priority » (2026-10-26), après la leçon déjà publiée `quwat-adad-nisbi` (qui sert d'« unité d'amorce » : _unit/ existe).
 * Manuel 3AM (الجيل الثاني, منشورات الشهاب), RÉFÉRENCE des الكفاءات : نشاط 1–3 p. 40, معارف 1–2 p. 42, طرائق p. 43, exercices 1–12 p. 46, أؤكّد 1–3 et 11
 * p. 49, أستعدّ p. 39. Source : docs/sources/3am/unit3/extraction.json (relue à 220–500 dpi le 2026-10-26). Rien n'est montré tel quel (§4ter-bis).
 * Le réseau : son seul lien « راجع » est `1am.m1.r03` (ضرب وقسمة عدد عشري على 10، 100 …, leçon 1AM `kusur-ashriya-kitaba`, publiée) ; le lien
 * `3am.m3.r02 → r03` a été remplacé par `3am.m3.r01 → r03` (les règles de la leçon suivante ne sont pas un prérequis de celle-ci). `pointPrerequisites`
 * porte une arête entre années : le décalage de la virgule de 1AM (P4) nourrit P3.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : la « عدسة القوى » (labo `ten-zoom`, thème `science-lens`). Le club de sciences a une lentille dont la bague multiplie par 10 ou
 *   divise par 10 le côté d'un cadre carré, parti du dessus d'une table (1 m). La main tient n, le nombre de crans : pour faire égaler le côté à une
 *   carte (« 1 000 000 م », « 0,001 م », « مليار متر ») il faut COMPTER les crans — et on le lit sur la plaque comme des zéros ou comme le rang du 1.
 *   0 cran = la table (10⁰ = 1) ; un cran de réduction ne rend jamais le côté négatif (10⁻ⁿ est un petit nombre positif). مبتدئ : 1 000 ; 1 000 000 avec une
 *   prédiction (6 / 7 / 1 000 000 crans) ; 0,001 ; retour à 1 m, la tally « 1 × 10 × 10 » sous la plaque. متقدم : مليار متر ; ميكرومتر ; 0,0000001 m avec une
 *   prédiction (6 / 7 / 8) ; 10 كم, sans tally.
 *   Rejetées : (a) l'نشاط 1 du manuel (une cellule qui se divise en 10 chaque heure) — c'est exactement le train de `quwat-adad-nisbi` avec la base 10 (un produit
 *   bâti facteur par facteur) : son carré et son cube deviennent des lignes d'أتمرّن (m², L) ; (b) le tableau de l'نشاط 2 comme entrée — il donne la réponse
 *   (les exposants descendent d'un cran) sans que la main décide quoi que ce soit : il devient l'encadré de معارف ; (c) compter des zéros sur du papier — rien
 *   n'oblige à compter, le compte n'est pas nécessaire.
 *   Ordre des idées : 1 000 m = 3 crans = 3 zéros → 10ⁿ = n facteurs 10 (P1) → pas un cran : 10⁰ = 1 (P2) → crans de réduction : 10⁻ⁿ = 1/10ⁿ, le 1 au rang n
 *   (P2, P3) → معارف : les noms et les préfixes sur la MÊME lentille (monde `prefixes`) (P1–P3) → طريقة : de l'écriture décimale à la puissance (P3), le مفكوك et
 *   k × 10ⁿ (P4) → أتمرّن → trois مسائل → إختبار أولي.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab/quwa-adad-ashara';

export const LESSON_CONFIG = {
  id: 'quwa-adad-ashara',
  kind: 'lesson',
  unit: 'quwa-nisbiya',
  unitTitle: 'القوى ذات أسس نسبية صحيحة',
  sequentialUnlock: true,
  title: 'قوى العدد 10',
  description: 'عدسة نادي العلوم تضرب ضلع إطار مربّع في 10 أو تقسمه على 10 مع كل نقرة: نكتشف $10^n$ والكتابة العشرية لقوى العدد 10 ($10^0 = 1$ و $10^{-n} = \\frac{1}{10^n}$) وأسماءها وبادئات الوحدات، ثم نكتب عددًا عشريًا بقوى العدد 10.',
  level: 'moyen',
  grade: '3am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🔭',
  estimatedDurationMin: 86,
  textbookRef: { unit: 3, activity: 3, pages: '39, 40, 42, 43, 46, 49' },
  skills: [
    'تعريف $10^n$ ، من أجل $n$ عدد طبيعي غير معدوم، جداءً لـ $n$ عاملًا كلّها تساوي 10 وقراءته « 10 أس $n$ »، مع $10^1 = 10$',
    'معرفة أنّ $10^0 = 1$ وأنّ $10^{-n} = \\frac{1}{10^n}$ هو مقلوب $10^n$',
    'الانتقال بين الكتابة العشرية لقوة للعدد 10 وكتابتها $10^n$ (الرقم 1 متبوع بـ $n$ صفرًا، أو الرقم 1 في الرتبة $n$ بعد الفاصلة)، وقراءتها بالأسماء (ألف، مليون، مليار، جزء من ألف …) والبادئات (كيلو، ميلي، ميكرو، نانو …)',
    'كتابة عدد عشري باستعمال قوى 10 : مفكوكه مثل $3985 = 3 \\times 10^3 + 9 \\times 10^2 + 8 \\times 10^1 + 5 \\times 10^0$ ، وكتابات مثل $45\\,000 = 45 \\times 10^3$ و $0{,}07 = 7 \\times 10^{-2}$',
  ],
  teachingScope: {
    include: ['$10^n$ جداء $n$ عاملًا يساوي 10 ، و $10^1 = 10$ و $10^0 = 1$ و $10^{-n} = \\frac{1}{10^n}$', 'الكتابة العشرية لقوة للعدد 10 (الأصفار، رتبة الرقم 1) وأسماؤها وبادئات الوحدات', 'مفكوك عدد عشري وكتابات $k \\times 10^n$ ، ومقارنة قوتين للعدد 10 بأسّيهما'],
    exclude: ['جداء قوتين وحاصل قسمتهما وقوة قوة (درس «قواعد الحساب على قوى العدد 10»)', 'الكتابة العلمية ورتبة القدر (درس لاحق)', 'قوة عدد غير 10 (درس «قوة عدد نسبي»)'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js).
  lessonProblem: {
    module: 5,
    title: 'تحت المجهر',
    statement: 'في حصّة العلوم الطبيعية شاهد تلاميذ القسم تحت المجهر شعرة سُمكها حوالي $0{,}0001$ م، وكرية دم حمراء قطرها حوالي $0{,}00001$ م، وفيروسًا قطره حوالي $0{,}0000001$ م.',
    questions: [
      { label: '1)', text: 'اكتب سُمك الشعرة على شكل قوة للعدد 10.' },
      { label: '2)', text: 'اكتب قطر الكرية الحمراء وقطر الفيروس على شكل قوة للعدد 10.' },
      { label: '3)', text: 'كم صفرًا قبل الرقم 1 في كتابة قطر الفيروس، مع صفر الوحدات؟' },
      { label: '4)', text: 'قالت سارة: «الفيروس أصغر الأجسام الثلاثة لأنّ أسّه $-7$ أصغر من $-5$ ومن $-4$». هل هي على صواب؟' },
    ],
    illustration: { kind: 'tags', cards: [{ title: 'شعرة', lines: [{ label: 'سُمكها', value: '0,0001 م' }] }, { title: 'كرية دم حمراء', lines: [{ label: 'قطرها', value: '0,00001 م' }] }, { title: 'فيروس', lines: [{ label: 'قطره', value: '0,0000001 م' }] }], ariaLabel: 'ثلاث بطاقات: شعرة سُمكها 0,0001 م، وكرية دم حمراء قطرها 0,00001 م، وفيروس قطره 0,0000001 م' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : le lien « راجع » du réseau (1am.m1.r03 → darb-ashara), le مقلوب et les unités (ajouts de la plateforme).
  priorKnowledge: ['darb-ashara', 'maqlub', 'wahdat'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `ten-zoom` (la main tient n, le nombre de crans), monde `zoom`, thème `science-lens` :
    //   مبتدئ — 1 000 ; 1 000 000 (prédiction) ; 0,001 ; retour à 1 m, tally visible ;
    //   متقدم — مليار ; ميكرومتر ; 0,0000001 (prédiction) ; 10 كم, aucune tally.
    {
      kind: 'manipulation', code: 'ten-zoom-count', type: 'ten-zoom', module: 1,
      level: 'beginner',
      title: 'عدسة القوى: نحسب النقرات',
      objective: 'إطار مربّع يضرب كل تكبير ضلعه في 10 ويقسمه كل تصغير على 10: عدد النقرات يساوي عدد الأصفار بعد الرقم 1 ، وبلا نقرة يبقى الضلع 1 م ، وبعد n نقرة تصغير يكون الرقم 1 في الرتبة n بعد الفاصلة',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'science-lens' },
      learningPointIds: ['3am_quwa-adad-ashara_P1', '3am_quwa-adad-ashara_P2'],
      sourceElementIds: ['act-3'],
    },
    {
      kind: 'manipulation', code: 'ten-zoom-names', type: 'ten-zoom', module: 1,
      level: 'advanced',
      title: 'عدسة القوى: أسماء وأطوال صغيرة جدًا',
      objective: 'إطار مربّع يضرب كل تكبير ضلعه في 10 ويقسمه كل تصغير على 10: عدد النقرات يساوي عدد الأصفار بعد الرقم 1 ، وبلا نقرة يبقى الضلع 1 م ، وبعد n نقرة تصغير يكون الرقم 1 في الرتبة n بعد الفاصلة',
      autonomy: 'البطاقة اسم أو وحدة أخرى (مليار متر، ميكرومتر، 10 كم) أو طول صغير جدًا، ولا شيء مكتوب تحت اللوحة: يتوقّع التلميذ عدد النقرات قبل أن يديرها',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'science-lens' },
      learningPointIds: ['3am_quwa-adad-ashara_P1', '3am_quwa-adad-ashara_P2'],
      sourceElementIds: ['act-3'],
    },
    // Module 2 — le MÊME labo, monde `prefixes`, posé seul (`levels={false}`) : la carte est une unité (كيلومتر … نانومتر).
    {
      kind: 'manipulation', code: 'ten-zoom-prefixes', type: 'ten-zoom', module: 2,
      title: 'عدسة القوى: أسماء الوحدات',
      learningPointIds: ['3am_quwa-adad-ashara_P3'],
      sourceElementIds: ['know-1', 'know-2'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — تحت المجهر', learningPointIds: ['3am_quwa-adad-ashara_P2', '3am_quwa-adad-ashara_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — مسافات كبيرة', learningPointIds: ['3am_quwa-adad-ashara_P3', '3am_quwa-adad-ashara_P4'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — عدّاد الماء', learningPointIds: ['3am_quwa-adad-ashara_P4'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'سبع عبارات: صحيح أم خاطئ؟ الضرب والقسمة على 10 و100 و1000، المقلوب والوحدات.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — عدسة القوى', desc: 'عدسة تكبّر الإطار عشر مرّات أو تصغّره عشر مرّات مع كل نقرة: كم نقرة يلزم لضلع طوله مليون متر؟ وماذا عن 0,001 م؟',
      stage: 'trigger', teachesLearningPointIds: ['3am_quwa-adad-ashara_P1', '3am_quwa-adad-ashara_P2', '3am_quwa-adad-ashara_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — الأسماء والبادئات', desc: 'على العدسة نفسها: كيف نكتب $10^n$ ونقرؤه؟ وما $10^{-n}$ ؟ وما أسماء القوى وبادئات الوحدات؟',
      stage: 'discovery', teachesLearningPointIds: ['3am_quwa-adad-ashara_P1', '3am_quwa-adad-ashara_P2', '3am_quwa-adad-ashara_P3'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — من الكتابة العشرية إلى القوى', desc: 'نعدّ الأصفار أو رتبة الرقم 1 ، ونكتب مفكوك عدد عشري وكتابات من الشكل k × 10ⁿ.',
      stage: 'formalization', teachesLearningPointIds: ['3am_quwa-adad-ashara_P3', '3am_quwa-adad-ashara_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'الكتابة العشرية، على شكل قوة، الأسماء، الوحدات، صحيح أم خاطئ، عدّ الأصفار والرتب، و k × 10ⁿ.',
      stage: 'practice_lab', teachesLearningPointIds: ['3am_quwa-adad-ashara_P1', '3am_quwa-adad-ashara_P2', '3am_quwa-adad-ashara_P3', '3am_quwa-adad-ashara_P4'],
      color: 'amber', style: 'featured', estimatedMin: 13, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — تحت المجهر', desc: 'مسألة الدرس: شعرة وكرية دم وفيروس بأقطار صغيرة جدًا نكتبها على شكل قوة للعدد 10.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_quwa-adad-ashara_P2', '3am_quwa-adad-ashara_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — مسافات كبيرة', desc: 'من الكيلومتر إلى المتر: حافلة ومحيط الأرض، ومفكوك المسافة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_quwa-adad-ashara_P3', '3am_quwa-adad-ashara_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — عدّاد الماء', desc: 'مفكوك قراءة العدّاد، ومن المتر المكعّب إلى اللتر.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_quwa-adad-ashara_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الأربع.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
