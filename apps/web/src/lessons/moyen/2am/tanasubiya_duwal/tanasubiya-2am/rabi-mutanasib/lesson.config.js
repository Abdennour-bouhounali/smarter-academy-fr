/**
 * الدرس — حساب الرابع المتناسب (2AM, unité 5 « التناسبية ») — la PREMIÈRE leçon générée de l'unité, DANS son entrée du catalogue (items
 * 2am.m6.r02 et 2am.m6.r03), cycle moyen phase 3, Phase A de la file (2026-10-21, #8) : elle sert la leçon 4AM « التناسبية ومعامل
 * التناسبية » (`tanasub-muamil`). Manuel 2AM (الجيل الثاني, منشورات الشهاب, scan), RÉFÉRENCE des الكفاءات : نشاط 2 p. 72, معارف 1 p. 74
 * (le mot « الرابع المتناسب », les quatre chemins, la propriété et les deux remarques), طرائق p. 75, دوري الآن ② p. 75, exercices 12–18
 * p. 79, أؤكّد 2–3 p. 81, أستعدّ 1–4 p. 71, ouverture p. 70. Source : docs/sources/2am/unit5/extraction.json. Rien n'est montré tel
 * quel : tout est réécrit (§4ter-bis).
 * Le réseau : son seul lien « راجع » — 1am.m6.r04 (إتمام جدول تناسبية بطرائق مختلفة), leçon 1AM `itmam-jadwal-tanasubiya` NON publiée, relation
 * `consolidates` — est mesuré par « أستعدّ » (chemin multiplicatif, chemin additif, le piège de la différence), jamais reconstruit : la
 * leçon CONSOLIDE (elle rappelle les chemins par le coefficient, l'unité et les propriétés puis va à l'ancrage : trois nombres connus,
 * le trou n'importe où, le choix du chemin) et apporte une chose NOUVELLE, l'égalité des produits en croix. La leçon sœur de l'unité
 * `wadiya-tanasubiya-jadwal` (reconnaître un tableau) n'est pas publiée : « أستعدّ » la mesure aussi. `pointPrerequisites` : arêtes
 * internes seulement (les الكفاءات 1AM sont des brouillons, LEARNING_NET §4.8).
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : la « لوحة الأسعار » (labo `fourth-gauges`, monde `market`, thème `souk`). Un tableau de prix de marchand a trois cases
 *   connues et UNE qui manque ; la main tient le nombre qui manque (une carte tirée sur une règle) et trois balances d'égalité —
 *   « في الكيلو » (le prix d'un kilo est le même dans les deux colonnes), « بين العمودين » (la quantité a grandi autant que le prix),
 *   « الجداءان » (les deux produits en croix) — penchent sous le doigt et ne s'équilibrent TOUTES ensemble que pour un seul nombre. Pourquoi
 *   le quatrième proportionnel devient NÉCESSAIRE sous la main : une carte qui ne rend aucune balance juste est un prix injuste, et le
 *   seul nombre qui les rend justes toutes à la fois est ce que la leçon appelle le quatrième proportionnel ; la 3e tâche ajoute une
 *   balance « الفرق » qui s'équilibre au MAUVAIS prix (404 au lieu de 600) — l'erreur « j'ajoute la même différence » est réfutée avec les
 *   propres essais de l'élève. مبتدئ : balances ouvertes (4 kg → 520 DA / 6 kg ? ; une QUANTITÉ à trouver ; la balance « الفرق » qui ment) ;
 *   متقدم : balances VOILÉES (le nombre se calcule avant de lâcher) avec des décimaux et le trou en b, a, d.
 *   Rejetées : (a) le نشاط 2 du manuel comme entrée (l'éprouvette graduée : la question 1 donne déjà l'égalité 20/6 = x/15 à justifier,
 *   donc aucun besoin) — il devient une APPLICATION en أتمرّن (un réservoir, autres nombres) ; (b) verser dans une éprouvette jusqu'à un
 *   repère (la main tiendrait l'ENTRÉE d'une règle de proportionnalité : c'est `linear-machine` / `ratio-ride`, NO-REBUILD) ; (c) un
 *   clavier qui calcule x (aucune variable sous la main).
 *   Ordre des idées : les balances et le quatrième proportionnel unique (P1), la balance « الفرق » qui ment (P1/P2) et les produits en croix
 *   (P2) → معارف : le même labo seul, voilé — un prix par la propriété additive, puis une QUANTITÉ par la propriété multiplicative, les
 *   chemins nommés, la propriété a × d = b × c et son usage pour calculer (P1, P2) → طريقة : CHOISIR le chemin selon les nombres (P3), y
 *   compris celui qui évite un quotient non décimal → أتمرّن (act-2, ex-12 … ex-18, l'ouverture p. 70 réécrits) → trois مسائل → إختبار أولي.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/2am/tanasubiya_duwal/rabi-mutanasib';

export const LESSON_CONFIG = {
  id: 'rabi-mutanasib',
  kind: 'lesson',
  unit: 'tanasubiya-2am',
  unitTitle: 'التناسبية',
  sequentialUnlock: true,
  title: 'حساب الرابع المتناسب',
  description: 'في سوق الخضر تنقص بطاقة واحدة من لوحة الأسعار: بتحريكها حتى تتوازن موازين العدالة نكتشف الرابع المتناسب وطرق حسابه، ثم نستعمل مساواة الجداءين المتصالبين ونختار الطريق الأنسب.',
  level: 'moyen',
  grade: '2am',
  chapter: 'tanasubiya_duwal',
  chapterTitle: 'ميدان الدوال وتنظيم المعطيات',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '⚖️',
  estimatedDurationMin: 84,
  textbookRef: { unit: 5, activity: 2, pages: '70, 71, 72, 74, 75, 79, 81' },
  skills: [
    'حساب الرابع المتناسب في جدول ينقصه عدد واحد (في أيّ خانة) بالمرور بالوحدة أو بمعامل التناسبية أو بالخاصية الجمعية أو الضربية',
    'توظيف مساواة الجداءين المتصالبين $a \\times d = b \\times c$ لحساب قيمة مجهولة في جدول تناسبية',
    'اختيار الطريقة الأنسب لحساب الرابع المتناسب حسب الأعداد المعطاة',
  ],
  teachingScope: {
    include: ['الرابع المتناسب في جدول تناسبية ينقصه عدد واحد (في أيّ خانة)', 'طرق الحساب: الوحدة ومعامل التناسبية والخاصيتان الجمعية والضربية ومساواة الجداءين المتصالبين', 'اختيار الطريق الأنسب حسب الأعداد'],
    exclude: ['التعرّف على جدول تناسبية بحواصل القسمة (درس سابق في الباب: نتذكّره فقط)', 'النسبة المئوية (درس لاحق)', 'مقياس خريطة وتحويل وحدات الطول (درس لاحق)', 'التمثيل البياني للتناسبية (السنة الثالثة)'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js) — l'achat de tissu de l'atelier de couture.
  lessonProblem: {
    module: 5,
    title: 'قماش لورشة الخياطة',
    statement: 'تشتري ورشة الخياطة بالمتوسطة قماشًا بالمتر، وثمنه يتناسب مع طوله. يلخّص الجدول عمليتي شراء سابقتين.',
    questions: [
      { label: '1)', text: 'احسب ثمن $8$ m من هذا القماش.' },
      { label: '2)', text: 'كم مترًا نشتري بـ $9100$ DA ؟' },
      { label: '3)', text: 'هل تكفي $20000$ DA لشراء $28$ m ؟' },
    ],
    table: {
      caption: 'عمليتا الشراء',
      head: ['الطول (m)', '3', '5'],
      rows: [['الثمن (DA)', '2100', '3500']],
    },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : le lien « راجع » du réseau (1am.m6.r04) et la reconnaissance d'un tableau (leçon sœur).
  priorKnowledge: ['qisma-wahda', 'jadwal-tanasubiya', 'itmam-jadwal'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `fourth-gauges` (la main tient le nombre qui MANQUE), monde `market`, thème `souk` :
    //   مبتدئ — balances ouvertes, la balance « الفرق » qui ment ; متقدم — balances voilées, décimaux, le trou en b, a, d.
    {
      kind: 'manipulation', code: 'fourth-gauges-beginner', type: 'fourth-gauges', module: 1,
      level: 'beginner',
      title: 'موازين الرابع المتناسب: بطاقة ناقصة في لوحة الأسعار',
      objective: 'في جدول تناسبية ينقصه عدد واحد لا يوجد إلاّ عدد واحد تتوازن عنده كل موازين العدالة وهو الرابع المتناسب، وإضافة الفرق نفسه لا تحافظ على التناسبية',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'souk' },
      learningPointIds: ['2am_rabi-mutanasib_P1', '2am_rabi-mutanasib_P2'],
      sourceElementIds: ['know-1b'],
    },
    {
      kind: 'manipulation', code: 'fourth-gauges-advanced', type: 'fourth-gauges', module: 1,
      level: 'advanced',
      title: 'موازين الرابع المتناسب: موازين مغطّاة وأعداد عشرية',
      objective: 'في جدول تناسبية ينقصه عدد واحد لا يوجد إلاّ عدد واحد تتوازن عنده كل موازين العدالة وهو الرابع المتناسب، وإضافة الفرق نفسه لا تحافظ على التناسبية',
      autonomy: 'الموازين مغطّاة: يحسب التلميذ الرابع المتناسب قبل أن يضع البطاقة، والخانة الناقصة قد تكون في أيّ موضع من الجدول',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'souk' },
      learningPointIds: ['2am_rabi-mutanasib_P1', '2am_rabi-mutanasib_P2', '2am_rabi-mutanasib_P3'],
      sourceElementIds: ['method-1'],
    },
    // Module 2 — le MÊME labo, posé seul (`levels={false}`) : un prix par le chemin additif, puis une QUANTITÉ par le chemin multiplicatif.
    {
      kind: 'manipulation', code: 'fourth-gauges-routes', type: 'fourth-gauges', module: 2,
      title: 'موازين الرابع المتناسب: الطرق',
      learningPointIds: ['2am_rabi-mutanasib_P1', '2am_rabi-mutanasib_P2'],
      sourceElementIds: ['know-1b'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — قماش لورشة الخياطة', learningPointIds: ['2am_rabi-mutanasib_P1', '2am_rabi-mutanasib_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — الكسكسي لحفل المدرسة', learningPointIds: ['2am_rabi-mutanasib_P2', '2am_rabi-mutanasib_P3'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — الصنبور والحوض', learningPointIds: ['2am_rabi-mutanasib_P1', '2am_rabi-mutanasib_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'سبع عبارات: صحيح أم خاطئ؟ الكتلة الواحدة، معامل التناسبية، جدول تناسبية، وطريقا الضرب والجمع.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — لوحة الأسعار', desc: 'بطاقة ناقصة في لوحة أسعار: متى تتوازن الموازين الثلاثة؟ ولماذا يكذب ميزان الفرق؟',
      stage: 'trigger', teachesLearningPointIds: ['2am_rabi-mutanasib_P1', '2am_rabi-mutanasib_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — طرق الرابع المتناسب', desc: 'نحسب سعرًا بالخاصية الجمعية وكمية بالخاصية الضربية، ثم نكتب الجداءين المتصالبين.',
      stage: 'discovery', teachesLearningPointIds: ['2am_rabi-mutanasib_P1', '2am_rabi-mutanasib_P2'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أختار الطريق', desc: 'أجرة ساعات عمل: أيّ طريق أقصر لكل سؤال؟ وأيّ طريق يتفادى الأعداد غير المنتهية؟',
      stage: 'formalization', teachesLearningPointIds: ['2am_rabi-mutanasib_P2', '2am_rabi-mutanasib_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'خزّان مدرّج، حساب ذهني، دهان، جداول بخانة ناقصة في أيّ موضع، تصحيح تلميذ، أنبوب يتسرّب، ومحيط الأرض.',
      stage: 'practice_lab', teachesLearningPointIds: ['2am_rabi-mutanasib_P1', '2am_rabi-mutanasib_P2', '2am_rabi-mutanasib_P3'],
      color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — قماش لورشة الخياطة', desc: 'مسألة الدرس: ثمن $8$ m ، الطول المشترى بـ $9100$ DA ، وهل تكفي $20000$ DA لـ $28$ m ؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_rabi-mutanasib_P1', '2am_rabi-mutanasib_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — الكسكسي لحفل المدرسة', desc: 'السميد واللحم لخمسة عشر شخصًا، وأكبر عدد من الأشخاص تكفيه المقادير المتوفّرة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_rabi-mutanasib_P2', '2am_rabi-mutanasib_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — الصنبور والحوض', desc: 'الكمية خلال $36$ min ، المدّة اللازمة لـ $450$ L ، وتصحيح خطأ أحمد.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_rabi-mutanasib_P1', '2am_rabi-mutanasib_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
