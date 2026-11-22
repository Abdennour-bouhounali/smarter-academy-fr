/**
 * الدرس — التعليم في المستوي (1AM, unité 5 « الأعداد النسبية »). Le TROISIÈME درس de l'unité (ordre 22 du catalogue), généré DANS son entrée du catalogue (item 1am.m5.r07),
 * cycle moyen phase 3, 1AM paire 3 A, 2026-10-30. Il suit `talim-mustaqim-mudarraj` (la droite graduée des deux côtés de l'origine, l'abscisse) : le معلم est fait de deux droites graduées perpendiculaires.
 * Manuel 1AM (الجيل الثاني) : نشاط 3 (la carte de l'Algérie et les trois élèves, p. 66), معارف 3 (p. 69), طريقة 2 et « دوري الآن » (p. 70), exercices 16–21 (p. 72), أقوّم تعلّماتي 7–10 (p. 73),
 * أتعمّق 5–8 (p. 74), استعمل تكنولوجيات (p. 76). Source : docs/sources/1am/unit5/extraction.json ; brief des auteurs : docs/sources/1am/unit5/brief-authors.md.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours, et la leçon ne renvoie jamais au livre (§4ter-bis) : tout est réécrit, autres contextes, autres nombres.
 *   Entrée retenue : le plan d'une cour d'école vu d'en haut (labo `courtyard-drone`, thème `schoolcourt`). Le mât du drapeau est l'origine O, deux lignes peintes en jaune sont les axes ; la main
 *   conduit un DRONE D'ABORD sur la ligne horizontale (elle fixe sa position), puis sur la verticale, puis « prend la photo » : il REFUSE la diagonale. Le lieu est dit par ses DEUX nombres (« النافورة عند (3 ; −2) »)
 *   ou dessiné et lu (« البوابة »). L'échange de l'ordre des deux nombres mène à un AUTRE lieu (−2 ; 3) : c'est le NŒUD du manuel (les trois élèves de la carte), posé par une main et non par une carte.
 *   Rejetées : (a) la carte de l'Algérie du manuel (une carte à lire ; ici, une cour que la main parcourt) ; (b) les pièces de la droite (leçon précédente : `stride-stamp`, la FOULÉE sur UNE droite) ;
 *   (c) tracer avec la règle et l'équerre (non faisable dans un labo à une main) ; (d) la distance entre deux points et le périmètre (2AM).
 *   Ordre des idées : l'ordre des deux nombres (P2) → les points d'un axe, un nombre nul (P2) → lire (x ; y) d'un objet (P2) → متقدم : les demi-cases puis le papier sans carreaux avec les deux parallèles (P3, P2)
 *   → معارف (le nom : معلم متعامد, محور الفواصل / التراتيب, إحداثيا, فاصلة puis ترتيب) → طريقة (marquer trois points, papier quadrillé puis non quadrillé) → أتمرّن → trois مسائل → إختبار أولي.
 *   « أستعدّ » mesure `1am.m5.r06` (lire une abscisse, placer un nombre relatif sur une droite graduée) : c'est l'unique prérequis de l'item dans le réseau (`1am.m5.r06 → 1am.m5.r07`).
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/1am/ansab_al_aadad_wal_hisab/talim-fi-mustawi';

export const LESSON_CONFIG = {
  id: 'talim-fi-mustawi',
  kind: 'lesson',
  unit: 'adad-nisbiya',
  unitTitle: 'الأعداد النسبية',
  sequentialUnlock: true,
  title: 'التعليم في المستوي',
  description: 'مسيّرة تصوّر ساحة المدرسة من الأعلى ولا تسير مائلة: على الخط الأفقي ثمّ على الشاقولي. نكتشف أنّ نقطة المستوي يعيّنها عددان نكتبهما بالترتيب، وأنّ تبديلهما يعطي مكانًا آخر، ثمّ نسمّي المعلم المتعامد.',
  level: 'moyen',
  grade: '1am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '📍',
  estimatedDurationMin: 84,
  textbookRef: { unit: 5, activity: 3, pages: '66, 69, 70, 72, 73, 74, 76' },
  skills: [
    'التعرّف على معلم متعامد للمستوي: المبدأ، محور الفواصل، محور التراتيب',
    'قراءة إحداثيي نقطة معلومة وكتابتهما بالترتيب $M(x\\,;\\,y)$ (الفاصلة ثم الترتيب)',
    'تعليم نقطة ذات إحداثيين نسبيين معلومين على ورق مرصوف أو غير مرصوف',
  ],
  teachingScope: {
    include: ['المعلم المتعامد: المبدأ ومحورا الفواصل والتراتيب', 'إحداثيا نقطة: الفاصلة ثمّ الترتيب', 'أهمية ترتيب العددين', 'نقط محور الفواصل ومحور التراتيب (إحداثي معدوم)', 'تعليم نقطة على ورق مرصوف وعلى ورق غير مرصوف', 'التدريج المناسب (قيمة السنتيمتر الواحد)'],
    exclude: ['التعليم على مستقيم مدرّج وفاصلة نقطة (الدرس السابق ورد في «أستعدّ»)', 'الأعداد النسبية وسياقاتها ومعاكس العدد (درس سابق)', 'المسافة بين نقطتين وطول قطعة (السنة الثانية)', 'المعلم المتعامد والمتجانس والرباعيات ونقطة التقاطع (السنة الثانية)'],
  },
  // « مسألة الدرس » : ساحة المدرسة — إحداثيا أربعة أماكن، المكانان اللذان على محور، رحلة المسيّرة بلا قطر، وتبديل العددين (module 5).
  lessonProblem: {
    module: 5,
    title: 'ساحة المدرسة',
    statement: 'رُسمت خريطة ساحة مدرسة بمعلم متعامد مبدؤه سارية العلم $O$ ووحدة الطول فيه 1 m . تصوّر مسيّرة المدرسة أربعة أماكن مبيّنة في الشكل: المقصف $K$ والبوابة $G$ والمكتبة $L$ والشجرة $T$ . المسيّرة لا تسير مائلة: تسير على المحور الأفقي ثمّ على المحور الشاقولي. تشتري المدرسة 6 علب طلاء كلّ سنة.',
    questions: [
      { label: '1)', text: 'اقرأ إحداثيي كلّ مكان من الأماكن الأربعة، ثمّ عيّن المكانين اللذين يقعان على أحد المحورين.' },
      { label: '2)', text: 'تنطلق المسيّرة من سارية العلم إلى المقصف $K$ : كم مترًا تقطع على الخط الأفقي؟ وعلى الخط الشاقولي؟ وكم مترًا في المجموع؟' },
      { label: '3)', text: 'ماذا يحدث لو بدّلنا العددين في إحداثيي المقصف $K$ ؟' },
    ],
    figure: {
      points: { K: [4, 2], G: [-3, 0], L: [-1, -3], T: [0, 3], c1: [-5, -4], c2: [5, 4] },
      grid: true,
      axes: true,
      hidden: ['c1', 'c2'],
      maxWidth: 400,
      ariaLabel: 'خريطة ساحة مدرسة بمعلم متعامد مبدؤه سارية العلم O: المقصف K والبوابة G والمكتبة L والشجرة T',
    },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : `1am.m5.r06` (lire une abscisse et placer un nombre relatif sur une droite graduée), l'unique prérequis de l'item dans le réseau.
  priorKnowledge: ['abscissa-mustaqim-1am'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `courtyard-drone` (la main conduit un drone sur UN axe à la fois, photographie un lieu dit par ses deux nombres ou lit les nombres d'un objet), monde `schoolcourt` :
    //   مبتدئ — b1 la fontaine (3 ; −2) puis la porte de la bibliothèque (−4 ; 1) (l'échange mène à (−2 ; 3)) ; b2 (4 ; 0) puis (0 ; −3) ; b3 lire la porte et le kiosque : (−3 ; 2) puis (2 ; −4).
    //   متقدم — a1 lire en demi-cases (1,5 ; −3) puis (−2,5 ; 1,5) ; a2 lire sans carreaux (−4 ; 3) puis (3,5 ; −2) ; a3 photographier sans carreaux (2,5 ; −1,5) puis (−1 ; 0,5).
    {
      kind: 'manipulation', code: 'courtyard-drone-court', type: 'courtyard-drone', module: 1,
      level: 'beginner',
      title: 'ساحة المدرسة: مسيّرة على خطّ واحد',
      objective: 'نقود مسيّرة على الخط الأفقي ثمّ على الشاقولي فنقرأ عددين نكتبهما بالترتيب لكلّ مكان من الساحة',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'schoolcourt' },
      learningPointIds: ['1am_talim-fi-mustawi_P1', '1am_talim-fi-mustawi_P2', '1am_talim-fi-mustawi_P3'],
      sourceElementIds: ['act-3', 'ict'],
    },
    {
      kind: 'manipulation', code: 'courtyard-drone-plain', type: 'courtyard-drone', module: 1,
      level: 'advanced',
      title: 'ساحة المدرسة: نصف المربّعات وخريطة بلا مربّعات',
      objective: 'نقود مسيّرة على الخط الأفقي ثمّ على الشاقولي فنقرأ عددين نكتبهما بالترتيب لكلّ مكان من الساحة',
      autonomy: 'يقرأ التلميذ إحداثيي مكان بين خطّين من المربّعات، ثمّ على خريطة بلا مربّعات بالموازيين اللذين ترسمهما المسيّرة، ثمّ يصوّر مكانًا معلوم الإحداثيين',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'schoolcourt' },
      learningPointIds: ['1am_talim-fi-mustawi_P1', '1am_talim-fi-mustawi_P2', '1am_talim-fi-mustawi_P3'],
      sourceElementIds: ['act-3', 'self-10', 'method-2'],
    },
    // Module 3 — le MÊME instrument posé seul (`levels={false}`) : une tâche à deux lieux sur la carte sans carreaux (A(−4 ; 3) puis C(0 ; −4)), avec les gestes de la méthode.
    {
      kind: 'manipulation', code: 'courtyard-drone-method', type: 'courtyard-drone', module: 3,
      title: 'أعلّم نقطتين في المستوي',
      learningPointIds: ['1am_talim-fi-mustawi_P2', '1am_talim-fi-mustawi_P3'],
      sourceElementIds: ['method-2'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — ساحة المدرسة', learningPointIds: ['1am_talim-fi-mustawi_P1', '1am_talim-fi-mustawi_P2', '1am_talim-fi-mustawi_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — رمي الأكياس', learningPointIds: ['1am_talim-fi-mustawi_P1', '1am_talim-fi-mustawi_P2', '1am_talim-fi-mustawi_P3'], sourceElementIds: ['deep-6'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — حديقة المدرسة', learningPointIds: ['1am_talim-fi-mustawi_P1', '1am_talim-fi-mustawi_P2', '1am_talim-fi-mustawi_P3'], sourceElementIds: ['deep-8', 'ict-ex'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ قراءة فاصلة نقطة على مستقيم مدرّج، ونظيرتها، وتعليمها.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — مسيّرة الساحة', desc: 'مسيّرة فوق ساحة المدرسة لا تسير مائلة: أقودها على الخط الأفقي ثمّ على الشاقولي، وأقرأ عددين لكلّ مكان.',
      stage: 'trigger', teachesLearningPointIds: ['1am_talim-fi-mustawi_P1', '1am_talim-fi-mustawi_P2', '1am_talim-fi-mustawi_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 1, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — المعلم المتعامد', desc: 'المبدأ ومحورا الفواصل والتراتيب، إحداثيا نقطة، الفاصلة ثمّ الترتيب، ونقط المحورين.',
      stage: 'discovery', teachesLearningPointIds: ['1am_talim-fi-mustawi_P1', '1am_talim-fi-mustawi_P2', '1am_talim-fi-mustawi_P3'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أعلّم نقطًا', desc: 'أبدأ بالفاصلة ثمّ بالترتيب، على ورق مرصوف وعلى ورق غير مرصوف، ولنقطة على أحد المحورين.',
      stage: 'formalization', teachesLearningPointIds: ['1am_talim-fi-mustawi_P2', '1am_talim-fi-mustawi_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'قراءة إحداثيي نقط، نقط المحورين، الكلمات، صحيح أم خاطئ، المعلم المخفي، نقط على خطّ واحد، وصف المواضع، والتدريج.',
      stage: 'practice_lab', teachesLearningPointIds: ['1am_talim-fi-mustawi_P1', '1am_talim-fi-mustawi_P2', '1am_talim-fi-mustawi_P3'],
      color: 'amber', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — ساحة المدرسة', desc: 'مسألة الدرس: إحداثيا أربعة أماكن، رحلة المسيّرة، وتبديل العددين.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_talim-fi-mustawi_P1', '1am_talim-fi-mustawi_P2', '1am_talim-fi-mustawi_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — رمي الأكياس', desc: 'نقاط رمية بحسب أبعد الإحداثيين، ثمّ الفائز، ثمّ رمية تكسب 5 نقاط.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_talim-fi-mustawi_P1', '1am_talim-fi-mustawi_P2', '1am_talim-fi-mustawi_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — حديقة المدرسة', desc: 'نظيرتان بالنسبة إلى المحورين، ثمّ الربع نفسه.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_talim-fi-mustawi_P1', '1am_talim-fi-mustawi_P2', '1am_talim-fi-mustawi_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
