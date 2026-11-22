/**
 * الدرس 2 — حل جملة معادلتين من الدرجة الأولى بمجهولين جبرياً (طريقتا التعويض والجمع)
 * Unité 5 du manuel (4AM) : « أستعدّ » items 9–10 (p. 55), نشاط 2 (p. 56), طرائق p. 59 (التمرين
 * المحلول، الطريقة، دوري الآن), exercices 5 → 13 (pp. 60–61), 22 et 23 (أتعمّق p. 63), QCM 5 et 6
 * (p. 62), puis trois « مسائل » de la plateforme (modules 4–6).
 * Source de vérité : docs/sources/4am/unit5/extraction.json.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : les deux CARTES DU KIOSQUE (labo `elimination-cards`, thème `snack`, niveau مبتدئ : x + y = 10 ; x − y = 2) —
 *   la main pose une carte sur l'autre et un prix disparaît : « faire disparaître une inconnue » se fait avant de se lire dans la
 *   copie de deux élèves. Le niveau متقدم est la jumla du نشاط 2 (2x + y = 7 ; 3x − 2y = 4,2), où l'on refait les deux gestes du livre.
 *   Rejetées : (a) les questions أ) et ب) du manuel en ouverture (« (2 ; 3) est-elle solution ? », réponse de tête, sans besoin : elles
 *   viennent APRÈS le labo, pour dire pourquoi essayer ne finit pas) ; (b) la carte « لغز الكشك » au-dessus du labo (deux départs) :
 *   son histoire devient le `lead` du labo, et l'énigme revient en transfert à l'étape 6.
 *   Ordre des idées : labo → pourquoi chaque élève du livre écrit sa ligne (preuve : ses propres essais) → brique takhallus-majhul →
 *   pourquoi on ne s'arrête pas à x (la ثنائية se retrouve dans (1) comme dans (2)) → brique hall-thunaiya → أ) une ثنائية de (1) n'est pas
 *   solution de la jumla → ب) essayer ne finit pas → جـ 2 (les deux méthodes) → l'énigme du kiosque. Module 2 (sans labo) : chaque
 *   brique et l'encadré « طريقة » APRÈS la question qui les nomme.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/ansab_al_aadad_wal_hisab/hall-jabri';

export const LESSON_CONFIG = {
  id: 'hall-jabri',
  kind: 'lesson',
  unit: 'jumal-muadalatayn',
  unitTitle: 'جمل معادلتين من الدرجة الأولى بمجهولين',
  sequentialUnlock: true,
  studentView: 'mission',
  // LA MISSION (rollout 2026-11-12, unité 5 leçon 2 ; conseil du 2026-11-11, verdict L2 + X1–X11) : l'ouverture avoue qu'on ne sait pas encore trouver
  // deux prix à la fois ; les outils sont les connaissances de knowledge.jsx ; les points d'étape RAPPROCHENT de la mission sans en résoudre aucune
  // question : ni ses nombres (115, 45, 390…), ni sa réponse, ni sa méthode (une substitution sur un coefficient négatif), ni sa correction — et aucun
  // moins devant une parenthèse (règle P). `system` : la jumla d'un point d'étape (données, lues par la signature de la leçon, jamais affichées).
  // La scène : le kiosque du quartier et ses deux cartes blanches (« kiosk-cards »).
  mission: {
    scene: 'kiosk-cards',
    title: 'كشك الحي: ثمنان على بطاقتين',
    opening: {
      text: 'غيّر عمّي الطاهر أسعار كشكه قرب المتوسطة، وكتبها لغزًا على بطاقتين: الأولى تجمع قطع كرنتيكة وقارورة قازوز، والثانية تقارن ثمن قطع الكرنتيكة بثمن قارورات القازوز. كل بطاقة وحدها تقبل أثمانًا كثيرة… فكيف نجد الثمنين معًا دون أن نجرّب كل الأعداد؟',
      cta: 'لا أعرف بعد… هيا نجمع الأدوات',
    },
    tools: [
      { id: 'takhallus-majhul', icon: '🫥', label: 'مجهول يختفي' },
      { id: 'hall-thunaiya', icon: '🔗', label: 'الحل ثنائية' },
      { id: 'tariqat-tawid', icon: '🔁', label: 'طريقة التعويض' },
      { id: 'tariqat-jam', icon: '➕', label: 'طريقة الجمع' },
      { id: 'ikhtiyar-tariqa', icon: '🧭', label: 'اختيار الطريقة' },
    ],
    climaxModule: 4,
    checkpoints: [
      {
        id: 'cp-thunaiya', afterModule: 1, system: 'x+y=7|x-y=1',
        prompt: 'أيّ ثنائية حلّ للجملة $\\begin{cases} x + y = 7 \\\\ x - y = 1 \\end{cases}$ ؟',
        options: ['$(4 ; 3)$', '$(3 ; 4)$', '$(5 ; 2)$'],
        correct: 0,
        explain: '$4 + 3 = 7$ و $4 - 3 = 1$ : المعادلتان محقّقتان. أمّا $(3 ; 4)$ فترتيبها مقلوب: $3 - 4$ لا يساوي 1 ، و $(5 ; 2)$ تحقّق المعادلة الأولى وحدها.',
      },
      {
        id: 'cp-jam', afterModule: 2, system: 'x+2y=9|3x-4y=17',
        prompt: 'لنتخلّص من $y$ في الجملة $\\begin{cases} x + 2y = 9 \\\\ 3x - 4y = 17 \\end{cases}$ نضرب طرفي المعادلة الأولى في:',
        options: ['$2$', '$-2$', '$4$'],
        correct: 0,
        explain: 'بالعدد 2: $2x + 4y = 18$ ، ومع $3x - 4y = 17$ يصير $5x = 35$ أي $x = 7$ ثم $y = 1$ . بالعدد $-2$ يصير المعاملان $-4y$ و $-4y$ : متساويين لا متعاكسين؛ وبالعدد 4 لا يختفي شيء.',
      },
      {
        id: 'cp-ikhtiyar', afterModule: 3, system: '5x+2y=11|3x-2y=13',
        prompt: 'أسرع طريقة لحل الجملة $\\begin{cases} 5x + 2y = 11 \\\\ 3x - 2y = 13 \\end{cases}$ :',
        options: ['الجمع مباشرة، لأنّ معاملي $y$ متعاكسان', 'التعويض، لأنّ معامل $x$ يساوي 1', 'الجمع بعد ضرب الأولى في $-1$'],
        correct: 0,
        explain: 'بالجمع مباشرة $8x = 24$ ، ومنه $x = 3$ ثم $y = -2$ . لا يوجد معامل يساوي 1 هنا، والضرب في $-1$ يجعل معاملي $y$ متساويين.',
      },
    ],
  },
  title: 'حل جملة معادلتين من الدرجة الأولى بمجهولين جبرياً (طريقتا التعويض والجمع)',
  description: 'حل جملة معادلتين جبريا: بطريقة التعويض (التعبير عن أحد المجهولين بدلالة الآخر ثم التعويض في المعادلة الأخرى) وبطريقة الجمع (ضرب طرفي معادلة أو كلتيهما في معامل مناسب ليصير معاملا أحد المجهولين متعاكسين ثم الجمع طرفا لطرف)، للحصول على معادلة من الدرجة الأولى بمجهول واحد، واختيار الطريقة الأنسب بحسب معاملات الجملة.',
  level: 'moyen',
  grade: '4am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان أنساب الأعداد والحساب',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🔀',
  estimatedDurationMin: 54,
  textbookRef: { unit: 5, activity: 2, pages: '55, 56, 59, 60, 61, 62, 63' },
  skills: [
    'التخلّص من أحد المجهولين للحصول على معادلة من الدرجة الأولى بمجهول واحد',
    'حل جملة بطريقة التعويض: التعبير عن أحد المجهولين بدلالة الآخر ثم التعويض في المعادلة الأخرى',
    'حل جملة بطريقة الجمع: الضرب في معامل مناسب ثم الجمع طرفًا لطرف',
    'إتمام الحل بإيجاد المجهول الآخر والتحقق من الثنائية في المعادلتين',
    'اختيار الطريقة الأنسب بحسب معاملات الجملة',
  ],
  teachingScope: {
    include: [
      'بطاقتان ومجهول يختفي: عمل إكرام (التعويض) وعمل إسحاق (الجمع) على الجملة نفسها، ثم جملة ثانية بالطريقتين',
      'جملتان محلولتان سطرًا سطرًا، كل واحدة بطريقة، وإطار «طريقة»، ثم دوري',
      'جمل بمعاملات صحيحة أو عشرية أو كسرية، وجمل تُبسَّط قبل الحل',
      'التحقق من الثنائية في المعادلتين',
      'اختيار الطريقة الأنسب بالنظر إلى المعاملات',
    ],
    exclude: [
      'مفهوم الجملة وحالاتها الخاصة (لا حل، عدد غير منته من الحلول) — الدرس 1',
      'ترييض المشكلات بجملة معادلتين — الدرس 3',
      'الحل البياني للجملة',
    ],
  },
  // « مسألة الدرس » : l'énoncé de la مسألة 1, montré dès le sommaire,
  // rappelé au module 1, résolu pas à pas au module 4 (content/problems.js).
  // Prolonge les cartes du kiosque du niveau متقدم : deux cartes du vendeur, d'autres nombres.
  lessonProblem: {
    module: 4,
    title: 'كشك الحي: بطاقتا الأسعار الجديدة',
    illustration: { kind: 'tags', cards: [{ title: 'البطاقة الأولى', icon: 'sweet', lines: [{ label: 'قطع كرنتيكة', value: '3' }, { label: 'قارورة قازوز', value: '1' }, { label: 'الثمن', value: '115', unit: 'دج' }] }, { title: 'البطاقة الثانية', icon: 'bottle', lines: [{ label: 'قطع كرنتيكة', value: '4' }, { label: 'قارورات قازوز', value: '3' }, { label: 'الفرق', value: '45', unit: 'دج' }] }], ariaLabel: 'بطاقتا أسعار الكشك: 3 قطع كرنتيكة وقارورة بـ 115 دج، و 4 قطع كرنتيكة تزيد بـ 45 دج عن 3 قارورات' },
    statement: 'بعد العطلة الصيفية غيّر عمّي الطاهر، صاحب كشك الحي قرب المتوسطة، أسعاره، وكتبها على شكل لغز في بطاقتين: «3 قطع كرنتيكة وقارورة قازوز: 115 دج» و«ثمن 4 قطع كرنتيكة يزيد بـ 45 دج عن ثمن 3 قارورات قازوز». يحرص على نظافة كشكه وأمانة ميزانه، ويفتحه على الساعة 7 صباحًا، ويبيع نحو 120 قطعة كرنتيكة في اليوم. نرمز بـ $x$ إلى ثمن قطعة الكرنتيكة وبـ $y$ إلى ثمن قارورة القازوز (بالدينار).',
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // La carte TOUTE OUVERTE (règle des pilotes, propriétaire 2026-11-08) : toutes les connaissances dès le début.
  knowledgeMapOpen: true,
  // Les acquis que « أستعدّ » diagnostique : transposer un terme (items 9 du manuel), remplacer
  // une inconnue par une valeur (item 10), multiplier les deux membres d'une égalité, résoudre
  // une équation du premier degré à une inconnue (leçon muadala-ula).
  priorKnowledge: ['naql-hudud', 'taawid-qima', 'darb-tarafayn', 'hal-muadala-ula'],
  resources: [
    // Le module 1 ouvre sur deux CARTES (elimination-cards) ; la page : مبتدئ = x + y = 10 ; x − y = 2, متقدم = la jumla de l'activité
    // x + 2y = 15 ; 3x − y = 3 (plateforme, rollout 2026-11-12 ; les codes de ressource sont gardés). Le lecteur joue les manches de content/cards.js.
    {
      kind: 'manipulation', code: 'cards-x-y-10-2', type: 'elimination-cards', module: 1,
      level: 'beginner',
      title: 'بطاقتان: x + y = 10 و x − y = 2',
      objective: 'حل جملة معادلتين بالتخلّص من أحد المجهولين — بالتعويض أو بالجمع — ثم إيجاد المجهول الآخر: الحل ثنائية (x ; y)',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'snack' },
      learningPointIds: ['4am_hall-jabri_P2', '4am_hall-jabri_P1'],
      sourceElementIds: ['act-2'],
    },
    {
      kind: 'manipulation', code: 'cards-act2-7-42', type: 'elimination-cards', module: 1,
      level: 'advanced',
      title: 'بطاقتان تحتاجان إلى قرار',
      objective: 'حل جملة معادلتين بالتخلّص من أحد المجهولين — بالتعويض أو بالجمع — ثم إيجاد المجهول الآخر: الحل ثنائية (x ; y)',
      autonomy: 'لا مجهولان متعاكسان جاهزان: على التلميذ أن يقرّر وحده أيّ مجهول يعزل ومن أيّ بطاقة، أو بأيّ عدد يضرب أيّ بطاقة — دون اقتراح للخطوات، والطريقتان مطلوبتان',
      experience: { type: 'platform_adaptation', reason: 'multiple_representations', theme: 'snack' },
      learningPointIds: ['4am_hall-jabri_P1', '4am_hall-jabri_P2', '4am_hall-jabri_P3'],
      sourceElementIds: ['act-2'],
    },
    // Modules 4–6 — les « مسائل » : exercices complets de type امتحان, ajouts
    // de la plateforme (content/problems.js), sans aucune preuve de maîtrise.
    { kind: 'situation', code: 'masala-1', module: 4, title: 'مسألة الدرس — كشك الحي: بطاقتا الأسعار الجديدة', learningPointIds: ['4am_hall-jabri_P1'] },
    { kind: 'situation', code: 'masala-2', module: 5, title: 'مسألة — مقهى الساحة: كؤوس الشاي وفناجين القهوة', learningPointIds: ['4am_hall-jabri_P2'] },
    { kind: 'situation', code: 'masala-3', module: 6, title: 'مسألة — محطة المسافرين: تذاكر عادية وتذاكر مخفّضة', learningPointIds: ['4am_hall-jabri_P1', '4am_hall-jabri_P2', '4am_hall-jabri_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'عشر عبارات: نقل حدّ وضرب الطرفين، وتعويض قيمتين في عبارة. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'بطاقتان ومجهول يختفي', desc: 'بطاقتان عن عددين مخفيّين: اجعل مجهولًا يختفي، ثم جد العددين معًا، بطريقتين.',
      stage: 'trigger', teachesLearningPointIds: ['4am_hall-jabri_P1', '4am_hall-jabri_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 16, difficulty: 2, actionText: 'أجرّب البطاقتين' },
    { id: '02', number: 2, slug: 'tarayiq', path: `${LESSON_BASE_PATH}/tarayiq`,
      title: 'طرائق — التعويض أو الجمع', desc: 'جملتان محلولتان سطرًا سطرًا، الطريقتان، كيف نختار، ثم دوري.',
      stage: 'discovery', teachesLearningPointIds: ['4am_hall-jabri_P1', '4am_hall-jabri_P2', '4am_hall-jabri_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'أتعلّم الطريقتين' },
    { id: '03', number: 3, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'جمل بالتعويض، ثم بالجمع، ثم بطريقة من اختيارك.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_hall-jabri_P1', '4am_hall-jabri_P2', '4am_hall-jabri_P3'],
      color: 'amber', style: 'featured', estimatedMin: 14, difficulty: 3, actionText: 'أتدرّب' },
    // Les « مسائل » (track: 'problem') : practice_lab, avant le test, qui
    // reste toujours ouvert. Elles comptent dans la complétion, jamais dans
    // la maîtrise — docs/architecture/LESSON_CONTRACT.md § Modules « مسائل ».
    { id: '04', number: 4, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — كشك الحي', desc: 'مسألة الدرس: بطاقتا الأسعار الجديدة. نترجم، نحلّ بالتعويض، ونتحقّق.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_hall-jabri_P1'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '05', number: 5, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — مقهى الساحة', desc: 'فاتورتان: ثمن كأس الشاي وفنجان القهوة بالجمع، وخطأ النادل في الإشارة؛ ثم لغز بطاقتي الكشك القديمتين.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_hall-jabri_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — محطة المسافرين', desc: 'ثمنان للتذكرة: نبسّط ثم نحلّ، ونختار الطريقة الأنسب لعدد التذاكر.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_hall-jabri_P1', '4am_hall-jabri_P2', '4am_hall-jabri_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 3, actionText: 'أدخل التقويم' },
  ],
};
