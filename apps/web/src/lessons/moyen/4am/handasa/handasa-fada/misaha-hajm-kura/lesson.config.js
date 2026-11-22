/**
 * الدرس 2 — مساحة الكرة وحجم الجلة (الوحدة 14 « الهندسة في الفضاء »)
 * Manuel (4AM) : « أستعدّ » 4, 5, 6 (p. 163, module 0), l'introduction d'Archimède (p. 163, doublon DÉCLARÉ de la page
 * d'unité, module 1 — le livre n'a pas d'activité pour ce درس), معارف 2 (p. 166, module 2). Le scan s'arrête p. 169 : la
 * طريقة (module 3), les exercices (module 4) et le إختبار (module 5) sont des ajouts DÉCLARÉS de la plateforme.
 * Source de vérité : docs/sources/4am/unit14/extraction.json.
 *
 * LE PARCOURS (REAL → DISCOVER → MANIPULATE → UNDERSTAND → TOUCH THE MATH → FORMALIZE → AUTOMATIZE → TRANSFER) :
 *   M0 أستعدّ        — volumes du cube, du pavé, du cylindre (items 4–6), l'aire latérale, les puissances, l'arrondi, π ;
 *   M1 أرخميدس       — REAL (une orange de Boufarik sur la table de la cuisine) → DISCOVER (le texte d'Archimède, la boule
 *                      dans le cylindre de hauteur 2R) → MANIPULATE (orange-peel : la peau dans des disques, le jus dans le
 *                      verre) → UNDERSTAND (les questions sous les essais de l'élève, les briques « 4 disques » et « 2/3 ») ;
 *   M2 معارف 2        — FORMALIZE : 𝒜 = 4πR², 𝒱 = 4/3·πR³, l'exemple R = 1,4 (24,63 cm² au mm², 11,494 cm³ au mm³) ;
 *   M3 طرائق          — TOUCH THE MATH : la méthode déclarée « القيمة المضبوطة ثم المدوّرة » (depuis le diamètre), puis l'inverse
 *                      (de l'aire au rayon), révélées ligne à ligne ;
 *   M4 أوظّف تعلّماتي  — AUTOMATIZE et TRANSFER : ballon, coupole, château d'eau, bille, balle de ping-pong (ajouts déclarés) ;
 *   M5–M7 مسائل      — puis trois « مسائل » de la plateforme (modules 5–7) : l'orange dans son verre (مسألة الدرس), la sphère
 *                      de propane d'Arzew, la coupole de la mosquée à repeindre (content/problems.js) ;
 *   M8 إختبار أولي    — cinq épreuves de la plateforme ; P1, P2, P3 couverts.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : l'orange de Boufarik (labo `orange-peel`) — la main éplucha la peau, la répartit en disques de rayon R, puis presse
 *   le jus dans le verre sur mesure et MARQUE où il s'arrête : « quatre disques » et « deux tiers » se voient avant de se lire. Rejetée :
 *   le texte d'Archimède + la figure + 4 questions sur le cylindre en ouverture (de la lecture et du rappel, la découverte déjà donnée
 *   par le texte) ; il devient l'étape 3, APRÈS les deux découvertes, pour les nommer (boîte du texte après la réponse).
 *   Ordre des idées : la peau (pourquoi 4 disques quel que soit R) → brique 𝒜 → le jus (pourquoi la même marque, le tiers vide = la
 *   moitié de la boule) → brique 𝒱 → Archimède et son cylindre → module 2 : les questions d'abord, les boîtes et briques ensuite.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/handasa/misaha-hajm-kura';

export const LESSON_CONFIG = {
  id: 'misaha-hajm-kura',
  kind: 'lesson',
  unit: 'handasa-fada',
  unitTitle: 'الهندسة في الفضاء',
  sequentialUnlock: true,
  title: 'مساحة الكرة وحجم الجلة',
  description: 'اكتشاف أرخميدس بيدك: قشرة برتقالة من بوفاريك تغطي أربعة أقراص كبرى، وعصيرها يملأ ثلثي الكأس الأسطوانية التي على مقاسها؛ ثم حساب مساحة الكرة وحجم الجلة بقيمة مضبوطة بدلالة π أو مدوّرة.',
  level: 'moyen',
  grade: '4am',
  chapter: 'handasa',
  chapterTitle: 'ميدان الهندسة',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🍊',
  estimatedDurationMin: 50,
  lessonProblem: {
    module: 5,
    title: 'برتقالة في كأسها: القشرة والعصير',
    statement: 'في محلّ عصائر بالبليدة يعرض البائع، حرصا على النظافة والجودة، برتقالة كروية قطرها $7\\,\\mathrm{cm}$ وكتلتها $180\\,\\mathrm{g}$ ، موضوعة في كأس أسطوانية على مقاسها تماما: نصف قطر قاعدة الكأس يساوي نصف قطر البرتقالة، وارتفاعها يساوي قطرها، كما في الشكل المقابل. نعتبر البرتقالة جلة، وكل برتقالة من هذا المقاس تعطي عصيرا حجمه نصف حجمها تقريبا. يطلب زبون إبريقا من العصير سعته $1\\,\\mathrm{L}$ ، والبائع يحسب البرتقالة الواحدة بـ 30 دج. فتح المحلّ أبوابه منذ 15 سنة.',
    figure: {
      kind: 'space',
      view: { azimuth: -62, elevation: 16 },
      points: { O: [0, 0, 0], N: [0, 0, 3.5], S: [0, 0, -3.5], A: [-3.5, 0, 0], B: [3.5, 0, 0] },
      hidden: ['O', 'N', 'S', 'A', 'B'],
      solids: [
        { type: 'cylinder', base: 'S', top: 'N', radius: 3.5, tone: 'sky' },
        { type: 'sphere', center: 'O', radius: 3.5, tone: 'amber' },
      ],
      segments: [{ from: 'A', to: 'B', dashed: true, label: '7 cm' }],
      ariaLabel: 'برتقالة كروية قطرها 7 cm داخل كأس أسطوانية على مقاسها: البرتقالة تمسّ قاع الكأس وأعلاها وجدارها، وقطرها الأفقي منقّط',
      maxWidth: 300,
    },
  },
  textbookRef: { unit: 14, activity: 0, pages: '163, 166' },
  skills: [
    'حساب مساحة كرة علم نصف قطرها أو قطرها: 4πR²',
    'حساب حجم جلة علم نصف قطرها أو قطرها: 4/3·πR³',
    'كتابة القيمة المضبوطة بدلالة π ثم التدوير إلى الجزء من عشرة أو من مائة أو إلى المليمتر المربع والمكعب',
  ],
  teachingScope: {
    include: [
      'مدخل الوحدة: كرة نصف قطرها R داخل أسطوانة ارتفاعها 2R (أرخميدس): المساحة الجانبية وثلثا الحجم',
      'معارف 2: تعريف مساحة الكرة وحجم الجلة، ومثال الكتاب R = 1,4 cm',
      'طريقة من المنصّة: القيمة المضبوطة ثم المدوّرة، ومن المساحة إلى نصف القطر',
    ],
    exclude: [
      'تعريف الكرة والجلة وتمثيلهما (الدرس 1)',
      'المقاطع المستوية للمجسّمات (الدرس 3)',
      'أثر التكبير والتصغير على المساحات والحجوم (الدرس 4)',
      'برهان قانوني المساحة والحجم (يُقبلان في التعليم المتوسط، كما يقدّمهما الكتاب «تعريفا»)',
    ],
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Les acquis que « أستعدّ » diagnostique (prérequis du propriétaire) : les volumes du cube, du pavé et du cylindre (items 4–6
  // du manuel), l'aire latérale du cylindre (le pont d'Archimède), les puissances, l'arrondi, la valeur exacte avec π.
  priorKnowledge: ['hajm-mukaab', 'hajm-mutawazi-mustatilat', 'hajm-ustuwana', 'misaha-janibiya', 'quwa', 'tadwir', 'qima-madbuta'],
  resources: [
    // Le module 1 ouvre sur L'ORANGE DE BOUFARIK (orange-peel). متقدم (ouvert par défaut : Archimède, la ressource du manuel
    // qui ouvre ce درس) : R libre au dixième, verre sans graduation, puis l'exemple de معارف 2 ; مبتدئ : R entier, défaut 3.
    {
      kind: 'manipulation', code: 'orange-peel-r3', type: 'orange-peel', module: 1,
      level: 'beginner',
      title: 'برتقالة نصف قطرها 3 cm: كم قرصا تغطي قشرتها، وأين يتوقّف عصيرها؟',
      objective: 'مساحة الكرة التي نصف قطرها R تساوي أربعة أقراص كبرى (المساحة الجانبية للأسطوانة التي تحيط بها)، أي 4πR²، وحجم الجلة يساوي ثلثي حجم هذه الأسطوانة، أي 4/3·πR³',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'boufarik-orange' },
      learningPointIds: ['4am_misaha-hajm-kura_P1', '4am_misaha-hajm-kura_P2'],
      sourceElementIds: ['intro-archimedes'],
    },
    {
      kind: 'manipulation', code: 'orange-peel-archimedes', type: 'orange-peel', module: 1,
      level: 'advanced',
      title: 'أرخميدس: نصف القطر من 1 إلى 6 cm، ثم مثال الكتاب R = 1,4 cm',
      objective: 'مساحة الكرة التي نصف قطرها R تساوي أربعة أقراص كبرى (المساحة الجانبية للأسطوانة التي تحيط بها)، أي 4πR²، وحجم الجلة يساوي ثلثي حجم هذه الأسطوانة، أي 4/3·πR³',
      autonomy: 'نصف قطر عشري يختاره التلميذ بين 1 و 6 والكأس دون تدريج، والعلامة إلى جزء من اثني عشر من الارتفاع؛ ثم مثال الكتاب R = 1,4 cm حيث يختار بنفسه عدد الأرقام بعد الفاصلة للتدوير إلى 1 mm² وإلى 1 mm³',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'boufarik-orange' },
      learningPointIds: ['4am_misaha-hajm-kura_P1', '4am_misaha-hajm-kura_P2', '4am_misaha-hajm-kura_P3'],
      sourceElementIds: ['intro-archimedes', 'know-2'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — برتقالة في كأسها', learningPointIds: ['4am_misaha-hajm-kura_P1', '4am_misaha-hajm-kura_P2', '4am_misaha-hajm-kura_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — خزّان غاز البروبان الكروي', learningPointIds: ['4am_misaha-hajm-kura_P2', '4am_misaha-hajm-kura_P3'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — طلاء قبّة المسجد', learningPointIds: ['4am_misaha-hajm-kura_P1', '4am_misaha-hajm-kura_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'سبع عبارات: حجم المكعب ومتوازي المستطيلات والأسطوانة، المساحة الجانبية، القوى، التدوير، القيمة المضبوطة. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'arkhimidis', path: `${LESSON_BASE_PATH}/arkhimidis`,
      title: 'أرخميدس والبرتقالة — كرة داخل أسطوانة', desc: 'قشّر برتقالة من بوفاريك وافرد قشرتها في أقراص، ثم اعصرها في كأس على مقاسها: كم قرصا؟ وإلى أين يصل العصير؟',
      stage: 'trigger', teachesLearningPointIds: ['4am_misaha-hajm-kura_P1', '4am_misaha-hajm-kura_P2'],
      color: 'amber', style: 'featured', estimatedMin: 14, difficulty: 1, actionText: 'أقشّر البرتقالة' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — مساحة الكرة وحجم الجلة', desc: 'القانونان، ومثال الكتاب R = 1,4 cm: القيمة المضبوطة ثم المدوّرة إلى المليمتر المربع والمكعب.',
      stage: 'discovery', teachesLearningPointIds: ['4am_misaha-hajm-kura_P1', '4am_misaha-hajm-kura_P2', '4am_misaha-hajm-kura_P3'],
      color: 'violet', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'taraiq', path: `${LESSON_BASE_PATH}/taraiq`,
      title: 'طرائق — القيمة المضبوطة ثم المدوّرة', desc: 'من القطر إلى نصف القطر، ثم المساحة والحجم بدلالة π ثم مدوّرين؛ ومن المساحة إلى نصف القطر.',
      stage: 'formalization', teachesLearningPointIds: ['4am_misaha-hajm-kura_P1', '4am_misaha-hajm-kura_P2', '4am_misaha-hajm-kura_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'كرة المنتخب، قبّة المسجد، خزان البلدية، كرية زجاجية، وكرة طاولة في علبتها.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_misaha-hajm-kura_P1', '4am_misaha-hajm-kura_P2', '4am_misaha-hajm-kura_P3'],
      color: 'rose', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — برتقالة في كأسها', desc: 'مسألة الدرس: مساحة القشرة، حجم البرتقالة وحجم كأسها، ثم عدد البرتقالات لملء إبريق لتر وثمنها.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_misaha-hajm-kura_P1', '4am_misaha-hajm-kura_P2', '4am_misaha-hajm-kura_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — خزّان غاز البروبان', desc: 'حجم خزّان كروي، الحدّ المسموح بالمتر المكعب وباللتر، ثم عدد رحلات الشاحنات وتكلفتها.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_misaha-hajm-kura_P2', '4am_misaha-hajm-kura_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — طلاء قبّة المسجد', desc: 'مساحة قبّة على شكل نصف كرة، كمية الطلاء لطبقتين وعدد الدلاء، ثم هل يكفي المبلغ المجموع.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_misaha-hajm-kura_P1', '4am_misaha-hajm-kura_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 5, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
