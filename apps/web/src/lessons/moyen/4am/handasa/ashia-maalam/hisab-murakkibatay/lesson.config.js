/**
 * الدرس 2 — حساب مركبتي شعاع وتساوي شعاعين في معلم
 * Unité 12 du manuel (4AM) « الأشعة في معلم » : أستعدّ 3, 4, 6 (p. 139), نشاط 2 (p. 140), معارف 3 ب (p. 142) et جـ
 * (p. 144), طرائق « حساب مركبتا شعاع، علمت إحداثيات مبدئه ونهايته » + دوري الآن 2 (p. 143), exercices 6, 7, 8, 9 (p. 146),
 * 12, 14 (p. 147). Source de vérité : docs/sources/4am/unit12/extraction.json.
 *
 * LE PARCOURS (REAL → DISCOVER → MANIPULATE → UNDERSTAND → TOUCH THE MATH → FORMALIZE → AUTOMATIZE → TRANSFER) :
 *   M0 أستعدّ          — les acquis : AB = DC dans un متوازي أضلاع et sa translation (الوحدة 11), lire des composantes,
 *                        soustraire des relatifs ;
 *   M1 نشاط 2          — REAL (les portails d'un jeu mobile) → MANIPULATE (component-calc : متقدم = le نشاط 2 ouvert par
 *                        défaut, مبتدئ = les portails A, B et D) → DISCOVER « fin moins début » ; les questions du نشاط 2
 *                        répondues sous ses propres codes ; la brique ;
 *   M2 معارف           — UNDERSTAND / TOUCH THE MATH : معارف 3 ب (la propriété et son exemple), la soustraction à
 *                        l'envers, معارف جـ (l'égalité par les composantes) et son exemple dessiné ;
 *   M3 طرائق           — FORMALIZE : la طريقة p. 143 (conclusion corrigée AB = DC), la méthode « نقطة مجهولة » (plateforme,
 *                        déclarée) avec le lab مبتدئ (D aux coordonnées inconnues), دوري الآن 2 ;
 *   M4 أوظّف تعلّماتي  — AUTOMATIZE (ex-6, 7) et TRANSFER (ex-8, 9, 12, 14 : points inconnus, متوازي أضلاع) ;
 *   M5–M7 مسائل        — puis trois « مسائل » de la plateforme (modules 5–7, content/problems.js) ;
 *   M8 إختبار أولي     — cinq épreuves de la plateforme ; P1, P2, P3 couverts.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : les portails A(1 ; 2) et B(4 ; 3) de la carte de jeu (labo `component-calc`, niveau مبتدئ, thème `game-map`) — la main
 *   écrit le code de la porte AB AVANT que le héros saute, puis place D pour qu'une seconde porte ait le MÊME code : « fin moins début »
 *   et « mêmes composantes ⇒ égaux » se font avant de se lire. Rejetée : le نشاط 2 du manuel tel quel (lire C et D sur une figure, CD,
 *   E, puis la règle demandée en partie ب — questions de tête sur une figure, la règle donnée après coup) ; il reste le niveau متقدم du MÊME
 *   labo (C, D, E, F à nombres négatifs) et devient application aux étapes 3–6 du module 1, « نشاط الكتاب ».
 *   Ordre des idées : la règle écrite sur A et B (« أتوقّع القاعدة », brique APRÈS) → pourquoi deux portes de places différentes ont le même
 *   code → le نشاط 2 en application → M2 معارف nomme (les rappels et les exemples du livre APRÈS la réponse) → M3 : le labo ouvre en
 *   متقدم (E se calcule, ne s'essaie pas), la solution rédigée du livre APRÈS la réponse, la méthode « نقطة مجهولة » écrite par l'élève d'abord.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/handasa/hisab-murakkibatay';

export const LESSON_CONFIG = {
  id: 'hisab-murakkibatay',
  kind: 'lesson',
  unit: 'ashia-maalam',
  unitTitle: 'الأشعة في معلم',
  sequentialUnlock: true,
  title: 'حساب مركبتي شعاع وتساوي شعاعين في معلم',
  description: 'نحسب مركبتي شعاع دون عدّ المربعات بطرح إحداثيتي مبدئه من إحداثيتي نهايته، ونترجم تساوي شعاعين بتساوي مركباتهما، فنحسب إحداثيتي نقطة مجهولة لتكوين شعاع مساو أو متوازي أضلاع.',
  level: 'moyen',
  grade: '4am',
  chapter: 'handasa',
  chapterTitle: 'ميدان الهندسة',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🧮',
  estimatedDurationMin: 50,
  textbookRef: { unit: 12, activity: 2, pages: '139, 140, 142, 143, 144, 146, 147' },
  // « مسألة الدرس » : montrée dès le sommaire et au module 1, résolue au module 5 (content/problems.js). Le même monde
  // que le lab متقدم (les portails de la carte de jeu), d'autres nombres ; sa figure vit ICI (source unique, la carte la dessine).
  lessonProblem: {
    module: 5,
    title: 'لعبة البوابات: هل البوابتان توأمان؟',
    statement: 'في مستوى جديد من لعبة البوابات على الهاتف، أتقن مصمّمها إعدادها ليتدرّب بها التلاميذ، الخريطة مزوّدة بمعلم متعامد ومتجانس مبدؤه O (الشكل المقابل). رمز كل بوابة هو مركبتا الشعاع الذي يقفز به البطل. البوابة الأولى تنقل البطل من $A(-3 ; 2)$ إلى $B(2 ; -1)$ ، والبوابة الثانية تنقله من $C(-1 ; 4)$ إلى $D(4 ; 2)$. يريد مصمّم اللعبة إضافة بوابة ثالثة تنطلق من $E(0 ; -3)$. في هذا المستوى جمع اللاعب 350 قطعة ذهبية.',
    figure: {
      points: { O: [0, 0], A: [-3, 2], B: [2, -1], C: [-1, 4], D: [4, 2], E: [0, -3] },
      vectors: [{ from: 'A', to: 'B', tone: 'indigo' }, { from: 'C', to: 'D', tone: 'rose' }],
      grid: true,
      axes: true,
      labels: { O: 'sw' },
      ariaLabel: 'خريطة اللعبة في معلم على ورقة مرصوفة: سهم البوابة الأولى من A إلى B، وسهم البوابة الثانية من C إلى D، والنقطة E على محور التراتيب تحت O',
    },
  },
  skills: [
    'حساب مركبتي الشعاع AB انطلاقا من إحداثيتي A و B',
    'تطبيق شرط تساوي شعاعين في معلم بتساوي مركباتهما',
    'حساب إحداثيتي نقطة مجهولة لتكوين شعاع مساو أو متوازي أضلاع',
  ],
  teachingScope: {
    include: [
      'نشاط 2: قراءة C و D، مركبتا CD، النقطة E من مركبتي DE، القاعدة a = xB − xA و b = yB − yA، و DE = CF',
      'معارف 3 ب: مركبتا الشعاع AB هما xB − xA و yB − yA، ومثالها',
      'معارف جـ: الشعاعان المتساويان لهما نفس المركبتين، ومثالاها',
      'طرائق: حساب مركبتي شعاعين للتحقق من تساويهما، وحساب إحداثيتي نقطة مجهولة، ودوري الآن 2',
    ],
    exclude: [
      'قراءة مركبتي شعاع على ورقة مرصوفة وتمثيل شعاع علمت مركبتاه (الدرس 1، يُستعمل هنا كمكتسب)',
      'إحداثيتا منتصف قطعة والمسافة بين نقطتين (الدرس 3)',
      'إثبات طبيعة مثلث أو رباعي بالحساب (الدرس 4)',
    ],
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Les acquis que « أستعدّ » diagnostique : le متوازي أضلاع et l'égalité de deux vecteurs, la translation (الوحدة 11),
  // la lecture des composantes (درس 1 de l'unité) et la soustraction des nombres relatifs (السنة الثانية والثالثة).
  priorKnowledge: ['mutawazi-tasawi', 'insihab-mutawazi', 'qiraat-murakkibatayn', 'tarh-nisbi'],
  resources: [
    // Le module 1 ouvre sur les portails A, B et D (مبتدئ, plateforme = l'ENTRÉE choisie) ; le نشاط 2 (متقدم, C, D, F) est le même labo, repris en application.
    {
      kind: 'manipulation', code: 'component-calc-portals-m1', type: 'component-calc', module: 1,
      level: 'beginner',
      title: 'بوابات الخريطة: رمز AB ثم البوابة D',
      objective: 'مركبتا الشعاع AB هما xB − xA و yB − yA، ويتساوى شعاعان إذا تساوت مركباتهما، ومنه نحسب إحداثيتي نقطة مجهولة',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'game-map' },
      learningPointIds: ['4am_hisab-murakkibatay_P1', '4am_hisab-murakkibatay_P3'],
      sourceElementIds: ['know-3'],
    },
    {
      kind: 'manipulation', code: 'component-calc-act2-m1', type: 'component-calc', module: 1,
      level: 'advanced',
      title: 'نشاط 2: بوابات C و D و E و F',
      objective: 'مركبتا الشعاع AB هما xB − xA و yB − yA، ويتساوى شعاعان إذا تساوت مركباتهما، ومنه نحسب إحداثيتي نقطة مجهولة',
      autonomy: 'ثلاث مهام متتالية بأعداد سالبة ودون معاينة: الرمز يُكتب قبل القفزة، وإحداثيتا E تُحسبان ولا تُجرَّبان لأن المساواتين لا تُحكمان إلا عند التثبيت؛ والتلميذ يفتح بنفسه كل مهمة',
      experience: { type: 'textbook', reason: '', theme: 'game-map' },
      learningPointIds: ['4am_hisab-murakkibatay_P1', '4am_hisab-murakkibatay_P2', '4am_hisab-murakkibatay_P3'],
      sourceElementIds: ['act-2'],
    },
    // Le module 3 (طرائق) rouvre le même workspace sur les portails A, B, D (مبتدئ : la méthode « نقطة مجهولة »).
    {
      kind: 'manipulation', code: 'component-calc-portals-m3', type: 'component-calc', module: 3,
      level: 'beginner',
      title: 'بوابات الخريطة: رمز AB ثم البوابة D',
      objective: 'مركبتا الشعاع AB هما xB − xA و yB − yA، ويتساوى شعاعان إذا تساوت مركباتهما، ومنه نحسب إحداثيتي نقطة مجهولة',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'smaller_numbers_for_first_contact', theme: 'game-map' },
      learningPointIds: ['4am_hisab-murakkibatay_P1', '4am_hisab-murakkibatay_P3'],
      sourceElementIds: ['know-3'],
    },
    {
      kind: 'manipulation', code: 'component-calc-act2-m3', type: 'component-calc', module: 3,
      level: 'advanced',
      title: 'نشاط 2: بوابات C و D و E و F',
      objective: 'مركبتا الشعاع AB هما xB − xA و yB − yA، ويتساوى شعاعان إذا تساوت مركباتهما، ومنه نحسب إحداثيتي نقطة مجهولة',
      autonomy: 'ثلاث مهام متتالية بأعداد سالبة ودون معاينة: الرمز يُكتب قبل القفزة، وإحداثيتا E تُحسبان ولا تُجرَّبان لأن المساواتين لا تُحكمان إلا عند التثبيت؛ والتلميذ يفتح بنفسه كل مهمة',
      experience: { type: 'textbook', reason: '', theme: 'game-map' },
      learningPointIds: ['4am_hisab-murakkibatay_P1', '4am_hisab-murakkibatay_P2', '4am_hisab-murakkibatay_P3'],
      sourceElementIds: ['act-2'],
    },
    // Les trois « مسائل » (modules 5–7) : situations d'examen de la plateforme (content/problems.js).
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — بوابات المستوى الجديد', learningPointIds: ['4am_hisab-murakkibatay_P1', '4am_hisab-murakkibatay_P2', '4am_hisab-murakkibatay_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — ساحة الحيّ الجديد', learningPointIds: ['4am_hisab-murakkibatay_P1', '4am_hisab-murakkibatay_P2', '4am_hisab-murakkibatay_P3'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — فارس نادي الإعلام الآلي', learningPointIds: ['4am_hisab-murakkibatay_P1', '4am_hisab-murakkibatay_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: متوازي الأضلاع وتساوي شعاعين، الانسحاب، قراءة مركبتي شعاع، وطرح الأعداد النسبية. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط 2 — بوابات الخريطة', desc: 'اكتب رمز كل بوابة قبل أن يقفز البطل، وضع البوابة E، ثم أجب عن أسئلة النشاط: مركبتا شعاع من إحداثيتي طرفيه.',
      stage: 'trigger', teachesLearningPointIds: ['4am_hisab-murakkibatay_P1', '4am_hisab-murakkibatay_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 1, actionText: 'أفتح البوابات' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — حساب المركبتين وتساوي شعاعين', desc: 'معارف 3 ب: مركبتا AB هما xB − xA و yB − yA، ومعارف جـ: شعاعان متساويان لهما نفس المركبتين.',
      stage: 'discovery', teachesLearningPointIds: ['4am_hisab-murakkibatay_P1', '4am_hisab-murakkibatay_P2'],
      color: 'violet', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'taraiq', path: `${LESSON_BASE_PATH}/taraiq`,
      title: 'طرائق — التحقق من التساوي ونقطة مجهولة', desc: 'طريقة الكتاب للتحقق من تساوي شعاعين، ثم حساب إحداثيتي نقطة مجهولة بالبوابة D، ودوري الآن.',
      stage: 'formalization', teachesLearningPointIds: ['4am_hisab-murakkibatay_P2', '4am_hisab-murakkibatay_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'تمارين الكتاب 6 و 7 و 8 و 9 و 12 و 14: مركبات، أشعة متساوية، نقط مجهولة ومتوازيات أضلاع.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_hisab-murakkibatay_P1', '4am_hisab-murakkibatay_P2', '4am_hisab-murakkibatay_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — بوابات المستوى الجديد', desc: 'مسألة الدرس: رمز بوابة من إحداثيتي طرفيها، هل البوابتان توأمان، مخرج بوابة توأم، ومتوازي أضلاع.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_hisab-murakkibatay_P1', '4am_hisab-murakkibatay_P2', '4am_hisab-murakkibatay_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — ساحة الحيّ الجديد', desc: 'ساحة على شكل متوازي أضلاع في مخطط حيّ: اقتراح المقاول، الرأس الرابع، وتكلفة قناة الماء.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_hisab-murakkibatay_P1', '4am_hisab-murakkibatay_P2', '4am_hisab-murakkibatay_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — فارس نادي الإعلام الآلي', desc: 'أوامر انزلاق فارس على شاشة بمعلم: مركبات لا إحداثيات، وأمر بالبكسل، وهل يبقى الفارس ظاهرًا؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_hisab-murakkibatay_P1', '4am_hisab-murakkibatay_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 5, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
