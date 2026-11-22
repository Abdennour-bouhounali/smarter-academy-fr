/**
 * الدرس 3 — إحداثيتا منتصف قطعة مستقيم والمسافة بين نقطتين في معلم (الوحدة 12 « الأشعة في معلم »)
 * Manuel (4AM) : « أستعدّ » 5 (p. 139, module 0), تحدّ (p. 139, doublon déclaré : l'entrée, module 1, revu au module 3),
 * نشاط 3 et نشاط 4 (p. 141, modules 1–2), معارف د و هـ (p. 144, module 3), exercices 10, 11, 15, 16, 17, 20 (p. 147,
 * module 4), QCM 2–5 (p. 148, doublon, module 5). Source de vérité : docs/sources/4am/unit12/extraction.json.
 *
 * LE PARCOURS (REAL → DISCOVER → MANIPULATE → UNDERSTAND → TOUCH THE MATH → FORMALIZE → AUTOMATIZE → TRANSFER) :
 *   M0 أستعدّ        — المنتصف بالأشعة (الوحدة 11)، مركبتا شعاع، فيثاغورس، تبسيط جذر، مربع عدد سالب، نقطة على محور ;
 *   M1 تحدّ ونشاط 3 و 4 — REAL (deux amis partagent leur position GPS ; le تحدّ que la règle graduée ne résout pas) →
 *                      MANIPULATE (midpoint-distance : poser le rendez-vous, construire l'escalier, réclamer la distance) →
 *                      UNDERSTAND (نشاط 3 1) et نشاط 4 أ répondus sous les essais de l'élève) ;
 *   M2 الحالة العامة — TOUCH THE MATH : les deux formules DÉRIVÉES (AI = IB ⇒ x_I = (xA + xB)/2 ; Pythagore dans ABC
 *                      rectangle en C(x_B ; y_A)) ;
 *   M3 معارف د و هـ  — FORMALIZE : les deux propriétés et leurs exemples, puis le تحدّ résolu (√365 / 3) ;
 *   M4 أوظّف تعلّماتي — AUTOMATIZE (ex-10, 11, 17) et TRANSFER (ex-15, 16, 20 : valeurs exactes, cercle, preuve) ;
 *   M5–M7 مسائل      — puis trois « مسائل » de la plateforme (modules 5–7) : le rendez-vous GPS (مسألة الدرس), le point d'eau
 *                      entre deux مشتتين, deux établissements sur un plan quadrillé ;
 *   M8 إختبار أولي   — QCM 2–5 et une épreuve de la plateforme ; P1 et P2 couverts.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : le rendez-vous GPS (labo `midpoint-distance`, thème `gps-meet`, niveau مبتدئ par défaut : ريم en A(1 ; −1) et ياسين en
 *   B(4 ; 3) aux Sablettes) — la main POSE le dubbus et le refus du téléphone fait voir que seul un point où les deux déplacements sont
 *   égaux est accepté ; puis la marche dans les rues contre la ligne droite. Rejetée : le تحدّ du manuel en ouverture (« 6,4 cm est-il la
 *   valeur exacte ? » — une question de mémoire qui donne déjà la réponse « il faut calculer ») ; il devient l'APPLICATION qui ferme le
 *   module 1 (étape 3, après que l'élève a obtenu une distance exacte) et est résolu au module 3. Le niveau متقدم garde les points du
 *   manuel (نشاط 3 et 4 : K, L, M) du MÊME labo.
 *   Ordre des idées : pourquoi le téléphone n'accepte J qu'à un endroit (déplacements égaux) → ce qu'on a construit entre L et K
 *   (le triangle rectangle, KL plus court que l'escalier) → le تحدّ → module 2 : les deux formules en lettres (la brique du milieu
 *   APRÈS la réponse) → module 3 : un milieu et une distance de la plateforme, PUIS les propriétés du manuel (brique après la réponse).
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/handasa/muntasaf-masafa';

export const LESSON_CONFIG = {
  id: 'muntasaf-masafa',
  kind: 'lesson',
  unit: 'ashia-maalam',
  unitTitle: 'الأشعة في معلم',
  sequentialUnlock: true,
  title: 'إحداثيتا منتصف قطعة مستقيم والمسافة بين نقطتين في معلم',
  description: 'صديقان يتشاركان موقعيهما على خريطة GPS: أين يلتقيان في منتصف الطريق، وكم يبعد أحدهما عن الآخر في خط مستقيم؟ إحداثيتا المنتصف متوسطا إحداثيات الطرفين، والمسافة وتر مثلث قائم.',
  level: 'moyen',
  grade: '4am',
  chapter: 'handasa',
  chapterTitle: 'ميدان الهندسة',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '📏',
  estimatedDurationMin: 50,
  textbookRef: { unit: 12, activity: 3, pages: '139, 141, 144, 147, 148' },
  lessonProblem: {
    module: 5,
    title: 'موعد GPS في الحيّ: نقطة اللقاء ومسار الشوارع',
    statement: 'يستعمل صديقان، يريدان زيارة جارهما المريض معًا، تطبيق GPS يعرض الحيّ على خريطة مزوّدة بمعلم متعامد ومتجانس مبدؤه O، وحدة الطول فيه 100 m (الشكل). أنيس في النقطة $A(-3\\,;\\,-2)$ ووليد في النقطة $B(5\\,;\\,4)$ . يتّفقان على اللقاء على الساعة 17 في النقطة I منتصف القطعة [AB]. شوارع الحيّ كلّها موازية لمحوري المعلم، ويمشي أنيس بسرعة 70 m في الدقيقة.',
    figure: {
      points: { O: [0, 0], A: [-3, -2], B: [5, 4] },
      segments: [{ from: 'A', to: 'B', tone: 'indigo' }],
      labels: { O: 'sw' },
      grid: true,
      axes: true,
      ariaLabel: 'معلم متعامد ومتجانس على ورق مرصوف: النقطتان A و B والقطعة [AB]',
    },
  },
  skills: [
    'حساب إحداثيتي منتصف قطعة مستقيم بمعرفة إحداثيتي طرفيها',
    'حساب المسافة بين نقطتين في معلم متعامد ومتجانس، بقيمتها المضبوطة',
    'توظيف المنتصف والمسافة: مركز دائرة ونصف قطرها، انتماء نقطة إلى دائرة، نظيرة نقطة',
  ],
  teachingScope: {
    include: [
      'التحدّ: المسافة المضبوطة بين نقطتين إحداثياتهما كسور',
      'نشاط 3: منتصف [KL] بالأشعة، ثم إحداثيتا المنتصف في الحالة العامة',
      'نشاط 4: المثلث KLM القائم في M، ثم عبارة AB بخاصية فيثاغورس',
      'معارف د و هـ: خاصيتا المنتصف والمسافة ومثالاهما',
    ],
    exclude: [
      'قراءة مركبتي شعاع وتمثيله (الدرس 1) وحسابهما وتساوي شعاعين (الدرس 2)',
      'إثبات طبيعة مثلث أو رباعي بالحساب (الدرس 4) والوضعية الإدماجية (أدمج تعلّماتي)',
    ],
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Les acquis que « أستعدّ » diagnostique : le milieu par les vecteurs (unité 11), les composantes (درس 2), Pythagore,
  // la simplification d'une racine (unité 2), le carré d'un relatif, un point sur un axe.
  priorKnowledge: ['muntasaf-shuaa', 'murakkibat-hisab', 'fithaghuras', 'judhur-tabsit', 'murabba-nisbi', 'ihdathiyat-qiraa'],
  resources: [
    // Le module 1 ouvre sur LE RENDEZ-VOUS GPS (midpoint-distance). متقدم (ouvert par défaut : les نشاط 3 et 4) : K(5 ; 3),
    // L(−3 ; 1) puis L(1 ; −2), K(5 ; 1) sur le front de mer d'Oran ; مبتدئ : deux amis aux Sablettes, A(1 ; −1), B(4 ; 3).
    {
      kind: 'manipulation', code: 'midpoint-distance-sablettes', type: 'midpoint-distance', module: 1,
      level: 'beginner',
      title: 'موعد GPS في الصابلات: نقطة اللقاء ثم المسافة',
      objective: 'منتصف القطعة هو النقطة I التي تحقّق AI = IB، فإحداثيتاه متوسطا إحداثيات الطرفين؛ والمسافة بين نقطتين في معلم متعامد ومتجانس هي وتر المثلث القائم الذي ضلعاه فرقا الإحداثيات',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'gps-meet' },
      learningPointIds: ['4am_muntasaf-masafa_P1', '4am_muntasaf-masafa_P2'],
      sourceElementIds: ['act-3', 'act-4'],
    },
    {
      kind: 'manipulation', code: 'midpoint-distance-act3-act4', type: 'midpoint-distance', module: 1,
      level: 'advanced',
      title: 'نشاط 3 و 4: منتصف [KL] ثم المثلث KLM',
      objective: 'منتصف القطعة هو النقطة I التي تحقّق AI = IB، فإحداثيتاه متوسطا إحداثيات الطرفين؛ والمسافة بين نقطتين في معلم متعامد ومتجانس هي وتر المثلث القائم الذي ضلعاه فرقا الإحداثيات',
      autonomy: 'نقط النشاطين بإحداثيات سالبة ونقطتان مختلفتان للمنتصف وللمسافة: لا قراءة للحركتين ولا لضلعي الدرج قبل التثبيت، فيتوقّع التلميذ موضع J وزاوية الدرج M بنفسه ثم يتحقّق، ويختار المسافة بين قيم لا تعابير',
      experience: { type: 'textbook', reason: '', theme: 'gps-meet' },
      learningPointIds: ['4am_muntasaf-masafa_P1', '4am_muntasaf-masafa_P2'],
      sourceElementIds: ['act-3', 'act-4'],
    },
    // Les trois « مسائل » (modules 5–7) : ajouts de la plateforme (content/problems.js).
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — موعد GPS في الحيّ', learningPointIds: ['4am_muntasaf-masafa_P1', '4am_muntasaf-masafa_P2'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — نقطة ماء بين مشتتين', learningPointIds: ['4am_muntasaf-masafa_P1', '4am_muntasaf-masafa_P2'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — متوسطة وثانوية على مخطّط المدينة', learningPointIds: ['4am_muntasaf-masafa_P1', '4am_muntasaf-masafa_P2'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: المنتصف بالأشعة، مركبتا شعاع، خاصية فيثاغورس، تبسيط جذر، مربع عدد سالب ونقطة على محور. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'mawid-gps', path: `${LESSON_BASE_PATH}/mawid-gps`,
      title: 'تحدّ ونشاط 3 و 4 — موعد عبر GPS', desc: 'صديقان يتشاركان موقعيهما: ضع دبّوس اللقاء في منتصف الطريق، ثم ابنِ درج الشوارع لتجد المسافة بينهما في خط مستقيم، وأجب عن النشاطين.',
      stage: 'trigger', teachesLearningPointIds: ['4am_muntasaf-masafa_P1', '4am_muntasaf-masafa_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 13, difficulty: 1, actionText: 'أشارك موقعي' },
    { id: '02', number: 2, slug: 'hala-amma', path: `${LESSON_BASE_PATH}/hala-amma`,
      title: 'نشاط 3 و 4 — الحالة العامة', desc: 'من الأمثلة إلى القانونين: AI = IB يعطي إحداثيتي المنتصف، وخاصية فيثاغورس في مثلث قائم تعطي المسافة AB.',
      stage: 'discovery', teachesLearningPointIds: ['4am_muntasaf-masafa_P1', '4am_muntasaf-masafa_P2'],
      color: 'violet', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'أعمّم' },
    { id: '03', number: 3, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — المنتصف والمسافة', desc: 'خاصيتا الكتاب ومثالاه، ثم نعود إلى التحدّ لنحسب القيمة المضبوطة للمسافة AB.',
      stage: 'formalization', teachesLearningPointIds: ['4am_muntasaf-masafa_P1', '4am_muntasaf-masafa_P2'],
      color: 'emerald', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'أتعلّم الخاصيتين' },
    { id: '04', number: 4, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'تمارين الكتاب 10 و 11 و 15 و 16 و 17 و 20.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_muntasaf-masafa_P1', '4am_muntasaf-masafa_P2'],
      color: 'amber', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — موعد GPS في الحيّ', desc: 'نقطة اللقاء في منتصف الطريق، المسافة في خط مستقيم، ثم مسار الشوارع ومدّته.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_muntasaf-masafa_P1', '4am_muntasaf-masafa_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — نقطة ماء بين مشتتين', desc: 'نقطة الماء في منتصف المشتتين: طول القناة، أيّ المزرعتين يمكن ربطها، وكلفة القنوات.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_muntasaf-masafa_P1', '4am_muntasaf-masafa_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — متوسطة وثانوية على مخطّط المدينة', desc: 'المسافة المضبوطة بين مؤسستين، موضع المكتبة بنظيرة نقطة، ثم طول ممرّ الدرّاجات وكلفته.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_muntasaf-masafa_P1', '4am_muntasaf-masafa_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءتين، منها الأسئلة 2 إلى 5 من أؤكّد تعلّماتي.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
