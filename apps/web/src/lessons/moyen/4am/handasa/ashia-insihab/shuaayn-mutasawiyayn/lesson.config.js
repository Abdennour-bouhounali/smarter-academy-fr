/**
 * الدرس 2 — الشعاعان المتساويان ومتوازي الأضلاع ومنتصف قطعة
 * Unité 11 du manuel (4AM) « الأشعة والانسحاب » : أستعدّ 3, 4, 7 (p. 127), نشاط 2 ب (p. 129), معارف 3 (p. 132),
 * طرائق « إنشاء صورة نقطة بانسحاب عُلم شعاعه » et « إثبات تساوي شعاعين » + دوري الآن (p. 131), exercices 6, 7, 9
 * (p. 134), 12 (p. 135), 25 (p. 137), QCM item 6 (p. 136, doublon). Source de vérité : docs/sources/4am/unit11/extraction.json.
 *
 * LE PARCOURS (REAL → DISCOVER → MANIPULATE → UNDERSTAND → TOUCH THE MATH → FORMALIZE → AUTOMATIZE → TRANSFER) :
 *   M0 أستعدّ          — les acquis : symétrie centrale, milieu sur une droite, diagonales du متوازي أضلاع, l'égalité de
 *                        deux vecteurs et AB = DC ⇔ متوازي أضلاع (درس 1) ;
 *   M1 نشاط 2 ب        — REAL (les ultras du 5-Juillet, un foulard, une banderole) → MANIPULATE (parallelogram-pin :
 *                        مبتدئ I sur le foulard, متقدم la banderole) → DISCOVER ; les questions du نشاط 2 ب (O milieu de
 *                        [BC] et [AD] ⇒ AB = CD ; AC et DB opposés) répondues après ses propres essais ; la brique ;
 *   M2 معارف           — UNDERSTAND / TOUCH THE MATH : معارف 3 (I milieu ⇔ AI = IB, l'ordre des lettres) ; AB = DC ⇔
 *                        ABCD متوازي أضلاع ⇔ diagonales de même milieu (rappel du درس 1) et comment le PROUVER ;
 *   M3 طرائق           — FORMALIZE : la طريقة « صورة نقطة » révélée ligne à ligne avec la banderole (متقدم, ouvert par
 *                        défaut), la construction au compas ligne à ligne, « إثبات تساوي شعاعين », دوري الآن ;
 *   M4 أوظّف تعلّماتي  — AUTOMATIZE (ex-6, 7, 9) et TRANSFER (ex-12 les cercles, ex-25 أتعمّق) ;
 *   M5–M7 مسائل       — puis trois « مسائل » de la plateforme (modules 5–7) : la راية du tifo (مسألة الدرس), le سير ناقل
 *                        d'une conserverie, la porte coulissante d'une armoire ;
 *   M8 إختبار أولي     — l'item 6 de أؤكّد تعلّماتي et quatre épreuves de la plateforme ; P1, P2, P3 couverts.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : le foulard du tifo (labo `parallelogram-pin`, niveau مبتدئ, ouvert par défaut) — la main déplace le capo I sur le
 *   foulard [AB] coupé en 8 parts et compare AI et IB : le milieu se VOIT (même منحى et اتجاه partout, seule la longueur change). Rejetée :
 *   le نشاط 2 ب du livre tel quel (O milieu de [BC] et de [AD] sur une droite (d), « vérifie… » — des lettres sur une figure, répondues de
 *   mémoire) ; il devient l'application des étapes 2–4 après les essais de l'élève. Ordre des idées : pourquoi AI = IB seulement au milieu
 *   (ses propres positions) → نشاط 2 ب (O milieu commun ⇒ AB = CD) puis la brique APRÈS la réponse → AC et DB (opposés) → module 2 : question
 *   avant brique (RT = TS, K milieu de [UV]), l'ordre des lettres, « أتوقّع القاعدة » avant mutawazi-shuaa, le cas aligné.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/handasa/shuaayn-mutasawiyayn';

export const LESSON_CONFIG = {
  id: 'shuaayn-mutasawiyayn',
  kind: 'lesson',
  unit: 'ashia-insihab',
  unitTitle: 'الأشعة والانسحاب',
  sequentialUnlock: true,
  title: 'الشعاعان المتساويان ومتوازي الأضلاع ومنتصف قطعة',
  description: 'نترجم بالأشعة ما نعرفه عن متوازي الأضلاع والمنتصف: I منتصف [AB] يعني تساوي الشعاعين AI و IB، وتساوي شعاعين يثبت أن رباعيا متوازي أضلاع، ثم ننشئ صورة نقطة بانسحاب علم شعاعه.',
  level: 'moyen',
  grade: '4am',
  chapter: 'handasa',
  chapterTitle: 'ميدان الهندسة',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '▱',
  estimatedDurationMin: 50,
  textbookRef: { unit: 11, activity: 2, pages: '127, 129, 131, 132, 134, 135, 136, 137' },
  skills: [
    'التعبير عن منتصف قطعة مستقيم باستعمال الأشعة المتساوية',
    'إثبات أن رباعيا متوازي أضلاع باستعمال تساوي شعاعين',
    'إنشاء صورة نقطة أو شكل باستعمال التساوي الشعاعي وخواص متوازي الأضلاع',
  ],
  teachingScope: {
    include: [
      'نشاط 2 ب: نقط على مستقيم ومنتصف مشترك، تساوي الشعاعين AB و CD، والشعاعان AC و DB',
      'معارف 3: I منتصف [AB] يعني تساوي الشعاعين AI و IB، والعكس',
      'تساوي الشعاعين AB و DC يعني أن ABCD متوازي أضلاع وأن قطريه متناصفان (تذكير بالدرس 1) وكيف نبرهن به',
      'طرائق: إنشاء صورة نقطة بانسحاب علم شعاعه، وإثبات تساوي شعاعين، ودوري الآن',
    ],
    exclude: [
      'تعريف الانسحاب والشعاع وعناصره (الدرس 1، يُستعمل هنا كمكتسب)',
      'مجموع شعاعين وعلاقة شال والشعاع المعدوم (الدرس 3)',
      'البراهين بمجموع أشعة (الدرس 4) والأشعة في معلم (الوحدة 12)',
    ],
  },
  // « مسألة الدرس » (module 5) : le monde du niveau متقدم du lab (la راية du tifo sur la شبكة المدرّج), d'autres nombres.
  // Son support (la figure) vit ICI, en littéral : la carte « مسألة الدرس » le dessine (content/problems.js le référence).
  lessonProblem: {
    module: 5,
    title: 'راية التيفو الجديدة: أين يقف المشجّع الرابع؟',
    statement: 'في مدرّجات ملعب 5 جويلية يتعاون المشجّعون على تحضير راية تيفو جديدة على شكل رباعي $ABDC$. يمسك ثلاثة مشجّعين الأركان $A$ و $B$ و $C$ على شبكة المدرّج (الشكل)، حيث يمثّل ضلع كل مربّع 1 m، وطول الضلع $[AB]$ هو 5 m. يجب أن يقف المشجّع الرابع في الركن $D$، صورة $C$ بالانسحاب الذي شعاعه $\\overrightarrow{AB}$، لكي تُشدّ الراية. سيخيط المشجّعون شريطًا لامعًا حول حافة الراية، ثمن المتر الواحد منه 450 دج. يتّسع الملعب لـ 64000 متفرّج.',
    figure: {
      points: { A: [0, 4], B: [4, 7], C: [0, 0] },
      segments: [{ from: 'A', to: 'C' }],
      vectors: [{ from: 'A', to: 'B', tone: 'indigo' }],
      grid: true,
      labels: { A: 'w', B: 'ne', C: 'sw' },
      ariaLabel: 'شبكة المدرّج: الأركان A و B و C من الراية، والشعاع AB من A إلى B (4 مربعات نحو اليمين و 3 نحو الأعلى)، و C تحت A بأربعة مربعات',
      maxWidth: 360,
    },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Les acquis que « أستعدّ » diagnostique : symétrie centrale, milieu sur une droite, diagonales du متوازي أضلاع (années
  // précédentes) ; l'égalité de deux vecteurs et AB = DC ⇔ متوازي أضلاع (درس 1 de l'unité).
  priorKnowledge: ['tanazur-markazi', 'muntasaf-qita', 'qutr-mutawazi', 'tasawi-shuaayn', 'shuaa-mutawazi'],
  resources: [
    // Le module 1 ouvre sur LE FOULARD (مبتدئ, plateforme : I sur [AB]) ; متقدم = la banderole de la طريقة p. 131.
    {
      kind: 'manipulation', code: 'parallelogram-pin-scarf-8', type: 'parallelogram-pin', module: 1,
      level: 'beginner',
      title: 'وشاح المدرّج: أين يقف القائد؟',
      objective: 'تساوي شعاعين يترجم المنتصف ومتوازي الأضلاع: I منتصف [AB] يعني تساوي الشعاعين AI و IB، وتساوي الشعاعين CD و AB يعني أن ABDC متوازي أضلاع قطراه متناصفان',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'tifo' },
      learningPointIds: ['4am_shuaayn-mutasawiyayn_P1'],
      sourceElementIds: ['know-3'],
    },
    {
      kind: 'manipulation', code: 'parallelogram-pin-banner-m1', type: 'parallelogram-pin', module: 1,
      level: 'advanced',
      title: 'طرائق: راية التيفو، D صورة C ثم النقطة E',
      objective: 'تساوي شعاعين يترجم المنتصف ومتوازي الأضلاع: I منتصف [AB] يعني تساوي الشعاعين AI و IB، وتساوي الشعاعين CD و AB يعني أن ABDC متوازي أضلاع قطراه متناصفان',
      autonomy: 'لا سهم جاهز ولا نقطة مقترحة: التلميذ يعدّ المربعات من A إلى B ويعيد الحركة من C بنفسه، ثم يفتح بنفسه مرحلة E؛ الراية تلتوي بترتيب الحروف الخاطئ (الشعاع DC بدل CD) والمختبر يرفض E الموضوعة على D',
      experience: { type: 'textbook', reason: '', theme: 'tifo' },
      learningPointIds: ['4am_shuaayn-mutasawiyayn_P2', '4am_shuaayn-mutasawiyayn_P3'],
      sourceElementIds: ['method-image'],
    },
    // Le module 3 (طرائق) rouvre le même workspace sur la banderole (متقدم, la طريقة du manuel), le foulard à un onglet.
    {
      kind: 'manipulation', code: 'parallelogram-pin-scarf-m3', type: 'parallelogram-pin', module: 3,
      level: 'beginner',
      title: 'وشاح المدرّج: أين يقف القائد؟',
      objective: 'تساوي شعاعين يترجم المنتصف ومتوازي الأضلاع: I منتصف [AB] يعني تساوي الشعاعين AI و IB، وتساوي الشعاعين CD و AB يعني أن ABDC متوازي أضلاع قطراه متناصفان',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'smaller_numbers_for_first_contact', theme: 'tifo' },
      learningPointIds: ['4am_shuaayn-mutasawiyayn_P1'],
      sourceElementIds: ['know-3'],
    },
    {
      kind: 'manipulation', code: 'parallelogram-pin-banner-m3', type: 'parallelogram-pin', module: 3,
      level: 'advanced',
      title: 'طرائق: راية التيفو، D صورة C ثم النقطة E',
      objective: 'تساوي شعاعين يترجم المنتصف ومتوازي الأضلاع: I منتصف [AB] يعني تساوي الشعاعين AI و IB، وتساوي الشعاعين CD و AB يعني أن ABDC متوازي أضلاع قطراه متناصفان',
      autonomy: 'لا سهم جاهز ولا نقطة مقترحة: التلميذ يعدّ المربعات من A إلى B ويعيد الحركة من C بنفسه، ثم يفتح بنفسه مرحلة E؛ الراية تلتوي بترتيب الحروف الخاطئ (الشعاع DC بدل CD) والمختبر يرفض E الموضوعة على D',
      experience: { type: 'textbook', reason: '', theme: 'tifo' },
      learningPointIds: ['4am_shuaayn-mutasawiyayn_P2', '4am_shuaayn-mutasawiyayn_P3'],
      sourceElementIds: ['method-image'],
    },
    // Les trois « مسائل » de la plateforme (content/problems.js).
    { kind: 'situation', code: 'masala-1', module: 5, title: 'راية التيفو الجديدة: أين يقف المشجّع الرابع؟',
      learningPointIds: ['4am_shuaayn-mutasawiyayn_P1', '4am_shuaayn-mutasawiyayn_P2', '4am_shuaayn-mutasawiyayn_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'السير الناقل في مصنع تعليب الطماطم',
      learningPointIds: ['4am_shuaayn-mutasawiyayn_P1', '4am_shuaayn-mutasawiyayn_P2'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'باب الخزانة المنزلق',
      learningPointIds: ['4am_shuaayn-mutasawiyayn_P3', '4am_shuaayn-mutasawiyayn_P2', '4am_shuaayn-mutasawiyayn_P1'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: التناظر المركزي، منتصف قطعة على مستقيم، قطرا متوازي الأضلاع، وتساوي شعاعين من الدرس السابق. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط 2 ب — منتصف مشترك على مستقيم', desc: 'حرّك قائد المدرّج على الوشاح وقارن الشعاعين AI و IB، ثم أجب عن أسئلة النشاط: منتصف مشترك وشعاعان متساويان.',
      stage: 'trigger', teachesLearningPointIds: ['4am_shuaayn-mutasawiyayn_P1', '4am_shuaayn-mutasawiyayn_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 1, actionText: 'أجرّب الوشاح' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — المنتصف ومتوازي الأضلاع بالأشعة', desc: 'معارف 3: المنتصف وتساوي شعاعين، ثم متوازي الأضلاع وقطراه المتناصفان، وكيف نبرهن بتساوي شعاعين.',
      stage: 'discovery', teachesLearningPointIds: ['4am_shuaayn-mutasawiyayn_P1', '4am_shuaayn-mutasawiyayn_P2'],
      color: 'violet', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'taraiq', path: `${LESSON_BASE_PATH}/taraiq`,
      title: 'طرائق — صورة نقطة بانسحاب، وإثبات تساوي شعاعين', desc: 'ضع ركن الراية D صورة C ثم النقطة E، واقرأ الطريقتين سطرا سطرا، والإنشاء بالمدور، ودوري الآن.',
      stage: 'formalization', teachesLearningPointIds: ['4am_shuaayn-mutasawiyayn_P3', '4am_shuaayn-mutasawiyayn_P2'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'تمارين الكتاب 6 و 7 و 9 و 12 و 25: صور نقط، متوازيات أضلاع، منتصفات، ودائرتان متماستان.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_shuaayn-mutasawiyayn_P1', '4am_shuaayn-mutasawiyayn_P2', '4am_shuaayn-mutasawiyayn_P3'],
      color: 'amber', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — راية التيفو', desc: 'مسألة الدرس: الركن الرابع للراية صورة نقطة بانسحاب، متوازي أضلاع، منتصف، ثم ثمن الشريط.',
      stage: 'practice_lab', track: 'problem',
      teachesLearningPointIds: ['4am_shuaayn-mutasawiyayn_P1', '4am_shuaayn-mutasawiyayn_P2', '4am_shuaayn-mutasawiyayn_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — السير الناقل', desc: 'سير ناقل في مصنع لتعليب الطماطم: المستشعر في المنتصف، صندوقان ينقلهما الانسحاب نفسه، ثم المدد.',
      stage: 'practice_lab', track: 'problem',
      teachesLearningPointIds: ['4am_shuaayn-mutasawiyayn_P1', '4am_shuaayn-mutasawiyayn_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — باب الخزانة المنزلق', desc: 'باب خزانة ينزلق: صورة ركن بانسحاب، متوازي أضلاع وشعاعان متساويان، ثم فتحة نصف الطريق.',
      stage: 'practice_lab', track: 'problem',
      teachesLearningPointIds: ['4am_shuaayn-mutasawiyayn_P3', '4am_shuaayn-mutasawiyayn_P2', '4am_shuaayn-mutasawiyayn_P1'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث، منها السؤال 6 من أؤكّد تعلّماتي.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 5, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
