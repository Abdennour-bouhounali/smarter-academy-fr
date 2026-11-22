/**
 * الدرس 2 — الخاصية العكسية لخاصية طالس وإثبات التوازي
 * Unité 9 du manuel (4AM) « خاصية طالس » : نشاط 2 (p. 105), معارف 3 (p. 108) avec la ملاحظة 1 de معارف 1 (p. 106,
 * déclarée en double), طرائق « إثبات توازي (أو عدم توازي) مستقيمين » (p. 109), exercices 7 (p. 110), 10–16
 * (p. 111), 23–25 (p. 113), QCM item 3 (p. 112). Source de vérité : docs/sources/4am/unit9/extraction.json.
 *
 * LE PARCOURS (REAL → DISCOVER → MANIPULATE → UNDERSTAND → TOUCH THE MATH → FORMALIZE → AUTOMATIZE → TRANSFER) :
 *   M0 أستعدّ          — les acquis : égalité de deux fractions (produit en croix), ordre de points alignés,
 *                        la propriété de Thalès (leçon 1), la droite des milieux, Pythagore (ex-14) ;
 *   M1 نشاط 2          — REAL (le mur du quartier, l'échelle double et la planche) → MANIPULATE (parallel-level :
 *                        poser B′ et C′, la bulle ; puis le tréteau en X de نشاط 2, rapport 1/3 imposé, les trois
 *                        figures des élèves reproduites par ses propres placements) → DISCOVER (l'ordre) ;
 *                        les questions أ، ب et 2) répondues sur ses figures ; la brique qui NOMME ;
 *   M2 معارف           — UNDERSTAND / TOUCH THE MATH : معارف 3 (propriété, deux traductions, ملاحظة, مثال) et la
 *                        ملاحظة 1 de معارف 1 (deux rapports différents suffisent) ;
 *   M3 طرائق           — FORMALIZE : la طريقة p. 109 révélée ligne à ligne, dans les deux sens (parallèles, puis
 *                        non parallèles par l'absurde) ; un exercice de la plateforme ;
 *   M4 أوظّف تعلّماتي  — AUTOMATIZE (ex-7, 10–15) et TRANSFER (ex-16 la justification, ex-14 Pythagore, ex-23
 *                        Thalès puis sa réciproque, ex-24 centres de gravité, ex-25 Thalès deux fois) ;
 *   M5–M7 مسائل        — puis trois « مسائل » de la plateforme (modules 5–7) ;
 *   M8 إختبار أولي     — l'item 3 de أؤكّد تعلّماتي et quatre épreuves de la plateforme ; P1 et P2 couverts.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : l'échelle double du mur du quartier (labo `parallel-level`, niveau مبتدئ, thème `mural` : AB = 6, AC = 9, une
 *   planche qui doit être de niveau) — la main pose B′ et C′ et la bulle dit « parallèle » ou non : la condition (deux rapports égaux)
 *   et la jambe de l'ordre se VOIENT avant de s'écrire. Rejetée : la fiche de l'activité 2 posée en carte au-dessus du labo (trois
 *   figures d'élèves à juger de tête) ; elle devient l'ouverture de l'étape 1 (situation + figure sous le labo) et le niveau متقدم
 *   (le tréteau en X, rapport 1/3) reproduit ses trois figures par les placements de l'élève.
 *   Ordre : labo (sans carte, sans titre de workspace) → les trois figures du manuel jugées sur les figures de l'élève → le texte à
 *   compléter (PredictRule, puis la brique APRÈS la réponse) → l'ordre des points (la brique de rappel seulement après la réponse).
 *   Modules 2–3 (sans labo) : chaque brique vient APRÈS la question qu'elle nomme.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/handasa/aksiya-talis';

export const LESSON_CONFIG = {
  id: 'aksiya-talis',
  kind: 'lesson',
  unit: 'khassiyat-talis',
  unitTitle: 'خاصية طالس',
  sequentialUnlock: true,
  // Regard de l'élève : 'mission' (modèle du pilote qasim-adad-tabii, VALIDÉ par le propriétaire le 2026-11-08 ; rollout leçon par leçon,
  // docs/reports/MISSION_ROLLOUT_PROGRESS.md — unité 9, leçon 2, 2026-11-10) — implique le regard « focus » ; l'enseignant et le mode classe ne voient
  // aucun changement.
  studentView: 'mission',
  // LA MISSION : l'ouverture avoue qu'on ne sait pas encore la résoudre ; les outils sont les connaissances de knowledge.jsx ; les points d'étape
  // (conseil du 2026-11-10, verdict L2.5) RAPPROCHENT de la mission sans en résoudre aucune question : ni ses nombres (80, 100, 24, 30, 36, 44–46,
  // 2400, 3600, 3680, 3/10, 9/20, 23/50), ni sa méthode (les produits en croix, le piège des côtés opposés, le trou partenaire), ni sa correction
  // (même distance, même côté) — content/mission.test.js et _unit/missionStrings.test.js. La scène : le mur du stade repeint (« paint-wall »).
  mission: {
    scene: 'paint-wall',
    title: 'لوح الدهّانين: أفقي أم مائل؟',
    opening: {
      text: 'لدهن جدار ملعب الحيّ، يقف دهّان على لوح يحمله حامل على شكل X: عارضتان متقاطعتان في $A$ ، طولاهما $AB = 80$ و $AC = 100$ ، تستمرّان فوق $A$ وفيهما ثقوب. ثُبّت طرفا اللوح على البعدين $AM = 24$ و $AN = 30$ من $A$ . هل اللوح أفقي؟ وإن رُفع طرفه الأول فوق $A$ ، في أيّ ثقب يُثبَّت طرفه الآخر؟',
      cta: 'لا أعرف بعد… هيا نجمع الأدوات',
    },
    tools: [
      { id: 'khassiya-aksiya', icon: '🪜', label: 'الخاصية العكسية لخاصية طالس' },
      { id: 'shart-tartib', icon: '↔️', label: 'شرط الترتيب' },
      { id: 'tariqa-adam-tawazi', icon: '⚖️', label: 'إثبات عدم التوازي' },
    ],
    climaxModule: 5,
    checkpoints: [
      {
        id: 'cp-nisbatan', afterModule: 1,
        prompt: "$\\dfrac{AB'}{AB} = \\dfrac{1}{4}$ و $\\dfrac{AC'}{AC} = \\dfrac{1}{2}$ ، والنقطتان B′ و C′ بين A والقدمين. هل اللوح (B′C′) أفقي؟",
        options: ['لا: النسبتان مختلفتان', 'نعم: النقط مرتبة بالترتيب نفسه', 'نعم: $\\dfrac{1}{2}$ ضعف $\\dfrac{1}{4}$'],
        correct: 0,
        explain: 'الترتيب وحده لا يكفي: اللوح أفقي عندما تتساوى النسبتان، وهنا $\\dfrac{1}{4} \\neq \\dfrac{1}{2}$ .',
      },
      {
        id: 'cp-muntasaf', afterModule: 2,
        prompt: 'ABC مثلث، I منتصف [AB] و J منتصف [AC]. لماذا (IJ)//(BC) حسب الخاصية العكسية لخاصية طالس؟',
        options: ["$\\dfrac{AI}{AB} = \\dfrac{AJ}{AC} = \\dfrac{1}{2}$ والنقط مرتبة بالترتيب نفسه", '$AI = AJ$', '$IJ$ أقصر من $BC$'],
        correct: 0,
        explain: 'المنتصف يعطي النسبة $\\dfrac{1}{2}$ على الضلعين، و I بين A و B و J بين A و C: الترتيب نفسه، فالمستقيمان متوازيان.',
      },
      {
        id: 'cp-ayy', afterModule: 3,
        prompt: 'لحساب طول مجهول نستعمل … ، ولإثبات أن مستقيمين متوازيان نستعمل …',
        options: ['خاصية طالس ؛ الخاصية العكسية لخاصية طالس', 'الخاصية العكسية لخاصية طالس ؛ خاصية طالس', 'خاصية فيثاغورس ؛ خاصية طالس'],
        correct: 0,
        explain: 'خاصية طالس تنطلق من التوازي لتحسب الأطوال، والخاصية العكسية تنطلق من تساوي النسبتين والترتيب لتثبت التوازي.',
      },
      {
        id: 'cp-nisba', afterModule: 4,
        prompt: "$AB = 9$ و $AB' = 3$ ، و B′ بين A و B. ما قيمة النسبة $\\dfrac{AB'}{AB}$ ؟",
        options: ['$\\dfrac{1}{3}$', '$\\dfrac{1}{2}$', '$3$'],
        correct: 0,
        explain: "الجزء على الطول كله: $\\dfrac{AB'}{AB} = \\dfrac{3}{9} = \\dfrac{1}{3}$ — لا الجزء على الجزء الباقي.",
      },
    ],
  },
  title: 'الخاصية العكسية لخاصية طالس وإثبات التوازي',
  description: 'تساوي نسبتين وترتيب النقط: نطبّق الخاصية العكسية لخاصية طالس للبرهنة على توازي مستقيمين، ونثبت عدم توازيهما بنسبتين غير متساويتين، بعد التحقق من استقامية النقط وترتيبها بنفس الترتيب على المستقيمين المتقاطعين.',
  level: 'moyen',
  grade: '4am',
  chapter: 'handasa',
  chapterTitle: 'ميدان الهندسة',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🪜',
  estimatedDurationMin: 56,
  textbookRef: { unit: 9, activity: 2, pages: '105, 106, 108, 109, 110, 111, 112, 113' },
  skills: [
    'تطبيق الخاصية العكسية لخاصية طالس للبرهنة على توازي مستقيمين',
    'إثبات عدم توازي مستقيمين بنسبتين غير متساويتين (الاستدلال بالخلف بخاصية طالس)',
    'التحقق من استقامية النقط وترتيبها بنفس الترتيب على المستقيمين المتقاطعين',
  ],
  teachingScope: {
    include: [
      'نشاط 2: الأشكال الثلاثة للتلاميذ بالنسبة 1/3، والنص «الخاصية العكسية لخاصية طالس» وملاحظة الترتيب',
      'معارف 3: الخاصية، وضعيتاها، ملاحظة النسبتين المتساويتين دون الترتيب نفسه، والمثال OM/OR = ON/OP',
      'ملاحظة 1 من معارف 1: يكفي عدم تساوي نسبتين للقول إن المستقيمين غير متوازيين',
      'طرائق: إثبات توازي (أو عدم توازي) مستقيمين بالجداء المتصالب',
    ],
    exclude: [
      'حساب الأطوال بخاصية طالس والتكبير والتصغير (الدرس 1، يُستعمل هنا كمكتسب)',
      'تقسيم قطعة مستقيم وإنشاء النقط (الدرس 3)',
      'الوضعية الإدماجية: المئذنة والأسطوانة داخل المخروط (أدمج تعلّماتي)',
    ],
  },
  // « مسألة الدرس » (module 5) : le monde du niveau متقدم (le tréteau en X, l'ordre des points), d'autres nombres.
  // Son support (la figure) vit ICI, en littéraux : la carte « مسألة الدرس » le dessine (une seule source).
  lessonProblem: {
    module: 5,
    title: 'حامل الدهّانين على شكل X: هل لوح العمل أفقي؟',
    statement: 'يتطوّع عمّال البلدية لدهن جدار ملعب الحيّ، ويحرصون على إتقان عملهم. طول الجدار 25 m. يقف الدهّان على لوح عمل يحمله حامل على شكل X: عارضتان مستقيمتان متقاطعتان في النقطة $A$ ، طرفاهما السفليان $B$ و $C$ على الأرض الأفقية، حيث $AB = 80$ و $AC = 100$ (الأطوال بالسنتيمتر). تستمرّ العارضتان فوق $A$ ، وفي كل عارضة ثقوب يُثبَّت فيها طرفا اللوح، ويكون اللوح أفقيًا عندما يوازي الأرض $(BC)$ . وزن الحامل 9 kg. في الشكل: طرف اللوح $M$ في ثقب من $[AB]$ حيث $AM = 24$ ، وطرفه $N$ في ثقب من $[AC]$ حيث $AN = 30$ .',
    figure: {
      points: { A: [0, 0], B: [-5.2915, -6], C: [8, -6], M: [-1.58745, -1.8], N: [2.4, -1.8] },
      lines: [{ through: ['B', 'A'], extend: [0.05, 0.6] }, { through: ['C', 'A'], extend: [0.05, 0.5] }],
      segments: [{ from: 'B', to: 'C' }, { from: 'M', to: 'N', tone: 'amber' }],
      ariaLabel: 'حامل على شكل X: عارضتان متقاطعتان في A، طرفاهما B و C على الأرض، ولوح العمل [MN] بين النقطتين M من [AB] و N من [AC]',
      maxWidth: 300,
    },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // La carte TOUTE OUVERTE (règle des pilotes, propriétaire 2026-11-08) : toutes les connaissances dès le début, sans verrou par محور.
  knowledgeMapOpen: true,
  // Les acquis que « أستعدّ » diagnostique : produit en croix, ordre de points alignés, Thalès (leçon 1), droite des
  // milieux (année précédente), Pythagore (année précédente, exercice 14).
  priorKnowledge: ['tasawi-kasrayn', 'tartib-nuqat', 'talis-mubashira', 'mustaqim-muntasafayn', 'fithaghuras'],
  resources: [
    // Le module 1 ouvre sur LE NIVEAU À BULLE (parallel-level). متقدم (ouvert par défaut : le نشاط 2) : le tréteau en X,
    // rapport 1/3 imposé ; مبتدئ : l'échelle double des graffeurs du quartier.
    {
      kind: 'manipulation', code: 'parallel-level-ladder-6-9', type: 'parallel-level', module: 1,
      level: 'beginner',
      title: 'السلّم المزدوج: لوح أفقي بين الساقين',
      objective: 'يكون (B′C′) موازيا لـ (BC) عندما تتساوى النسبتان AB′/AB و AC′/AC وتكون النقط A، B، B′ و A، C، C′ مرتبة بنفس الترتيب؛ ونسبتان مختلفتان تعنيان عدم التوازي',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'mural' },
      learningPointIds: ['4am_aksiya-talis_P1'],
      sourceElementIds: ['act-2'],
    },
    {
      kind: 'manipulation', code: 'parallel-level-act2-9-12', type: 'parallel-level', module: 1,
      level: 'advanced',
      title: 'الحامل على شكل X: النسبة 1/3 وأشكال التلاميذ الثلاثة',
      objective: 'يكون (B′C′) موازيا لـ (BC) عندما تتساوى النسبتان AB′/AB و AC′/AC وتكون النقط A، B، B′ و A، C، C′ مرتبة بنفس الترتيب؛ ونسبتان مختلفتان تعنيان عدم التوازي',
      autonomy: 'لا موضع مقترح: التلميذ يحسب ثلث AB = 9 وثلث AC = 12 بنفسه، ويضع النقطتين من جهتي A كما يشاء؛ الأستاذ يرفض كل نسبة غير 1/3، وأشكال التلاميذ الثلاثة تُنجز بوضعياته هو، والشكل 3 (نسبتان متساويتان في جهتين مختلفتين) ترفضه الفقاعة',
      experience: { type: 'textbook', reason: '', theme: 'mural' },
      learningPointIds: ['4am_aksiya-talis_P1', '4am_aksiya-talis_P2'],
      sourceElementIds: ['act-2'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — حامل الدهّانين على شكل X: هل لوح العمل أفقي؟', learningPointIds: ['4am_aksiya-talis_P1', '4am_aksiya-talis_P2'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — كتائف رفوف المحلّ: هل القضيب يوازي الدعامة؟', learningPointIds: ['4am_aksiya-talis_P1', '4am_aksiya-talis_P2'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — حبال الخيمة وأوتادها في المخيّم الصيفي', learningPointIds: ['4am_aksiya-talis_P1', '4am_aksiya-talis_P2'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'عشر عبارات من السهل إلى الأصعب: تساوي كسرين، وخاصية طالس وترتيب النقط. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'اللوح الأفقي والأشكال الثلاثة', desc: 'ضع طرفي اللوح على العارضتين وراقب ميزان الماء، ثم أنجز أشكال التلاميذ الثلاثة بالنسبة 1/3 وأجب عن أسئلة النشاط.',
      stage: 'trigger', teachesLearningPointIds: ['4am_aksiya-talis_P1', '4am_aksiya-talis_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 13, difficulty: 1, actionText: 'أجرّب الميزان' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — الخاصية العكسية لخاصية طالس', desc: 'الخاصية ووضعيتاها، النسبتان المتساويتان دون الترتيب نفسه، مثال محلول، ونسبتان مختلفتان تكفيان لعدم التوازي.',
      stage: 'discovery', teachesLearningPointIds: ['4am_aksiya-talis_P1', '4am_aksiya-talis_P2'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'taraiq', path: `${LESSON_BASE_PATH}/taraiq`,
      title: 'طرائق — إثبات التوازي أو عدمه', desc: 'تمرين محلول سطرا سطرا: (CF)//(AB) بالخاصية العكسية، و (BD) لا يوازي (EF) بالاستدلال بالخلف، ثم تمرين للتدرّب.',
      stage: 'formalization', teachesLearningPointIds: ['4am_aksiya-talis_P1', '4am_aksiya-talis_P2'],
      color: 'emerald', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'تمارين متدرّجة: نسب، ترتيب، يونس وإيناس، فيثاغورس، مراكز الثقل.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_aksiya-talis_P1', '4am_aksiya-talis_P2'],
      color: 'amber', style: 'featured', estimatedMin: 13, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — حامل الدهّانين', desc: 'مسألة الدرس: لوح عمل على حامل على شكل X. نسبتان متساويتان، ترتيب مختلف، وجداءان متقاربان: أيّ ثقب يجعل اللوح أفقيًا؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_aksiya-talis_P1', '4am_aksiya-talis_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — كتائف رفوف المحلّ', desc: 'قضيب التقوية يوازي الدعامة أم لا؟ قيمتان مقرّبتان متساويتان لا تثبتان شيئًا، ثم طول القضيب وثمن الحديد.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_aksiya-talis_P1', '4am_aksiya-talis_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — حبال الخيمة', desc: 'حبلان من عمود الخيمة إلى وتدين: متوازيان أم لا؟ وتد في الجهة الأخرى للعمود، ثم طول الحبال وعدد اللفّات.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_aksiya-talis_P1', '4am_aksiya-talis_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءتين.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
