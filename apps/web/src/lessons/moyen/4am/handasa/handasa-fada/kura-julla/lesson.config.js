/**
 * الدرس 1 — الكرة والجلة (مفهوم والتمثيل الهندسي) (مدخل الوحدة 14 « الهندسة في الفضاء »)
 * Manuel (4AM) : « أستعدّ » 1 et 2 (p. 163, module 0), نشاط 1 (p. 164, module 1), معارف 1 (p. 166, module 2), طرائق « تمثيل كرة »,
 * « تمثيل نقطة من كرة أو من جلّة » et دوري الآن (p. 167, module 3). Le scan s'arrête p. 169 : أوظّف et le إختبار sont des ajouts
 * DÉCLARÉS de la plateforme. Source de vérité : docs/sources/4am/unit14/extraction.json.
 *
 * LE PARCOURS (REAL → DISCOVER → MANIPULATE → UNDERSTAND → TOUCH THE MATH → FORMALIZE → AUTOMATIZE → TRANSFER) :
 *   M0 أستعدّ        — le périmètre du cercle et l'aire du disque (items 1–2), le diamètre, cercle ou disque, la perspective,
 *                      Pythagore (les prérequis du propriétaire) ;
 *   M1 نشاط 1        — REAL (le ballon de handball creux, la boule de pétanque pleine) → MANIPULATE (sphere-probe : la sonde M
 *                      autour d'une vraie sphère 3D ; متقدم = le نشاط 1, M P Q, le قطر, les دوائر) → DISCOVER (cercle / disque
 *                      → كرة / جلّة) → UNDERSTAND (les phrases du نشاط 1 complétées ; la brique) ;
 *   M2 معارف 1       — FORMALIZE : تعريف الكرة والجلة, l'exemple M P Q, أقطار, la دائرة qui tourne, دوائر كبرى / صغرى ;
 *   M3 طرائق         — TOUCH THE MATH : représenter une كرة, un point ; OM² dans un repère de l'espace (déclarée) ; دوري الآن ;
 *   M4 أوظّف تعلّماتي — AUTOMATIZE / TRANSFER : cinq exercices de la plateforme (le planétarium, le globe, la ورشة) ;
 *   M5–M7 مسائل      — puis trois « مسائل » de la plateforme (modules 5–7) : la جلّة du club dans le repère (مسألة الدرس), le
 *                      خزّان d'eau sphérique, le ballon de football coupé ;
 *   M8 إختبار أولي   — cinq épreuves ; P1–P4 couverts.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : la lampe-globe de verre (labo `sphere-probe`, niveau مبتدئ, R = 3, trois sondes A, B, C) — la main POSE la sonde
 *   sur une vraie sphère 3D et la plateforme refuse « داخل الجلة » pour une sonde à OM = √3 : le besoin d'un second mot (جلّة à côté
 *   de كرة) naît du refus, avant tout vocabulaire. Rejetée : le نشاط 1 tel quel (« cercle ou disque ? », « كرة ou جلّة pour ces objets »,
 *   puis deux phrases à compléter — des réponses de mémoire, qui livrent la définition avant le geste) ; il reste le niveau متقدم du MÊME
 *   labo (M, P, Q, le قطر, les دوائر) et ses trois questions viennent APRÈS la première réponse.
 *   Ordre des idées : le labo seul en tête (aucune carte du manuel, ni titre ni `lead` de workspace ; `onTrial` aux deux niveaux) →
 *   POURQUOI la جلّة accepte ce que la كرة refuse → le même fait dans le plan (cercle / disque) → les objets du quotidien (كرة ou جلّة)
 *   → les deux phrases du manuel (« أتوقّع القاعدة », brique APRÈS la réponse) → module 2 : les mots du manuel viennent après la
 *   question (M, P, Q ; قطر = 2R ; cercle qui tourne ; rayon d'un cercle de centre O₁ AVANT le nom دائرة صغرى) → module 3 : les trois
 *   briques de méthode après la question de l'étape.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/handasa/kura-julla';

export const LESSON_CONFIG = {
  id: 'kura-julla',
  kind: 'lesson',
  unit: 'handasa-fada',
  unitTitle: 'الهندسة في الفضاء',
  sequentialUnlock: true,
  title: 'الكرة والجلة (مفهوم والتمثيل الهندسي)',
  description: 'مدخل الوحدة: كرة اليد الجوفاء والكرية الحديدية المملوءة تقودان إلى الكرة (النقط M حيث OM = R) والجلة (النقط M حيث OM ≤ R)، وإلى عناصرهما (المركز، نصف القطر، القطر، الدوائر الكبرى والصغرى)، ثم إلى تمثيل كرة وتمثيل نقطة منها أو من جلتها.',
  level: 'moyen',
  grade: '4am',
  chapter: 'handasa',
  chapterTitle: 'ميدان الهندسة',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🔮',
  estimatedDurationMin: 55,
  textbookRef: { unit: 14, activity: 1, pages: '163, 164, 166, 167' },
  // « مسألة الدرس » (module 5) : le monde du lab متقدم (la sonde autour d'une جلّة dans un repère de l'espace), autres nombres.
  // Montrée dès le sommaire et rappelée à la fin du module 1 ; sa figure est ICI (littéraux), problems.js la référence.
  lessonProblem: {
    module: 5,
    title: 'جلّة النادي في المعلم: أين تقع النقط؟',
    statement: 'في نادي ألعاب القوى ببلديتنا 8 جلل حديدية مملوءة لرمي الجلة، كتلة كل واحدة $7{,}26\\,\\mathrm{kg}$ . كل جلة نموذج للجلة $(\\beta)$ التي مركزها $O$ ونصف قطرها $6\\,\\mathrm{cm}$ ، وتحدّها الكرة $(\\delta)$ . يمثّل مدرّب النادي، حرصا على إتقان كل قياس، جلة ببرنامج ثلاثي الأبعاد في معلم متعامد ومتجانس للفضاء مبدؤه $O$ (الوحدة: $1\\,\\mathrm{cm}$)، كما في الشكل المقابل، ويضع فيه النقط $A(2\\,;\\,4\\,;\\,4)$ و $B(5\\,;\\,1\\,;\\,3)$ و $C(4\\,;\\,4\\,;\\,3)$ . لتوضيب الجلل يقترح متجر نوعين من العلب المكعّبة: علبة حرفها الداخلي $11\\,\\mathrm{cm}$ بـ 350 دج، وعلبة حرفها الداخلي $13\\,\\mathrm{cm}$ بـ 420 دج.',
    figure: {
      kind: 'space',
      view: { azimuth: -62, elevation: 18 },
      points: { O: [0, 0, 0], X1: [6, 0, 0], x: [9.5, 0, 0], Y1: [0, 6, 0], y: [0, 9.5, 0], Z1: [0, 0, 6], z: [0, 0, 9.5] },
      solids: [{ type: 'sphere', center: 'O', radius: 6, tone: 'slate' }],
      segments: [
        { from: 'O', to: 'X1', dashed: true }, { from: 'X1', to: 'x' },
        { from: 'O', to: 'Y1', dashed: true }, { from: 'Y1', to: 'y' },
        { from: 'O', to: 'Z1', dashed: true, label: '6 cm', tone: 'rose' }, { from: 'Z1', to: 'z' },
      ],
      hidden: ['X1', 'Y1', 'Z1'],
      labels: { O: 'sw', x: 's', y: 'e', z: 'n' },
      ariaLabel: 'جلة رمي الجلة: كرة مركزها O ونصف قطرها 6 cm، ومحاور المعلم الثلاثة x و y و z تنطلق من المركز O وتخرج من الكرة',
      maxWidth: 380,
    },
  },
  skills: [
    'التمييز بين الكرة (سطح أجوف، OM = R) والجلة (مجسم مملوء، OM ≤ R)',
    'التعرّف على عناصر الكرة: المركز، نصف القطر، القطر، الدوائر الكبرى والصغرى',
    'تمثيل كرة في المستوي بدائرة كبرى وشكل بيضوي، وتمثيل نقطة منها أو من جلتها',
  ],
  teachingScope: {
    include: [
      'نشاط 1: نقاط الدائرة ونقاط القرص، كرة اليد والكرية الحديدية، تعريف الكرة والجلة بالإتمام',
      'معارف 1: تعريفا الكرة والجلة، المثال (δ) و (β) والنقط M و P و Q، الأقطار وطولها 2R، تدوير دائرة حول قطرها، الدوائر الكبرى والصغرى',
      'طرائق: تمثيل كرة نصف قطرها 2,5 cm، تمثيل نقطة من كرة أو من جلة، دوري الآن (الزاوية AOB والبعد OI)',
      'موقع نقطة بالنسبة إلى كرة في معلم متعامد ومتجانس للفضاء (فيثاغورس مرتين) — إضافة من المنصّة',
    ],
    exclude: [
      'مساحة الكرة وحجم الجلة (الدرس 2)',
      'المقاطع المستوية وحساب نصف قطر مقطع كرة بمستو (الدرس 3)',
      'التكبير والتصغير (الدرس 4)',
    ],
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Les acquis que « أستعدّ » diagnostique (prérequis du propriétaire) : le périmètre du cercle et l'aire du disque (items 1–2
  // du manuel), le diamètre, cercle ou disque, la perspective (المنظور متساوي القياس), la خاصية فيثاغورس.
  priorKnowledge: ['muhit-daira', 'misahat-qurs', 'qutr-daira', 'daira-qurs', 'manzur', 'fithaghuras'],
  resources: [
    // Le module 1 ouvre sur LA SONDE (sphere-probe). متقدم (ouvert par défaut : le نشاط 1 et l'exemple de معارف 1) : placer M,
    // P, Q puis le قطر et les دوائر ; مبتدئ : la lampe-globe de rayon 3 et trois sondes à classer.
    {
      kind: 'manipulation', code: 'sphere-probe-globe', type: 'sphere-probe', module: 1,
      level: 'beginner',
      title: 'الكرة الزجاجية المضيئة: أين تقع النقط A و B و C؟',
      objective: 'الكرة التي مركزها O ونصف قطرها R هي مجموعة النقط M من الفضاء حيث OM = R، والجلة هي مجموعة النقط M حيث OM ≤ R: نحكم على موقع نقطة بمقارنة OM بـ R',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'smaller_numbers_for_first_contact', theme: 'glass-globe' },
      learningPointIds: ['4am_kura-julla_P1', '4am_kura-julla_P4'],
      sourceElementIds: ['act-1'],
    },
    {
      kind: 'manipulation', code: 'sphere-probe-act1', type: 'sphere-probe', module: 1,
      level: 'advanced',
      title: 'نشاط 1: الكرة والجلة (نصف القطر 4)',
      objective: 'الكرة التي مركزها O ونصف قطرها R هي مجموعة النقط M من الفضاء حيث OM = R، والجلة هي مجموعة النقط M حيث OM ≤ R: نحكم على موقع نقطة بمقارنة OM بـ R',
      autonomy: 'لا يُكتب البعد أثناء التحريك: التلميذ يحسب OM² بنفسه ويضع بنفسه M على الكرة و P في الجلة دون الكرة و Q خارجها، ثم يفتح الأقطار والدوائر الكبرى والصغرى',
      experience: { type: 'textbook', reason: '', theme: 'shot-put' },
      learningPointIds: ['4am_kura-julla_P1', '4am_kura-julla_P2', '4am_kura-julla_P4'],
      sourceElementIds: ['act-1', 'know-1'],
    },
    // Les trois « مسائل » (modules 5–7) : des exercices COMPLETS de type امتحان, ajouts DÉCLARÉS de la plateforme
    // (content/problems.js), sans aucune preuve de maîtrise.
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — جلّة النادي في المعلم', learningPointIds: ['4am_kura-julla_P1', '4am_kura-julla_P2', '4am_kura-julla_P4'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — خزّان الماء الكروي', learningPointIds: ['4am_kura-julla_P1', '4am_kura-julla_P2'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — كرة القدم المقصوصة', learningPointIds: ['4am_kura-julla_P1', '4am_kura-julla_P2'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: محيط الدائرة ومساحة القرص، القطر، الدائرة والقرص، التمثيل بالمنظور، خاصية فيثاغورس. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط 1 — الكرة والجلة', desc: 'حرّك نقطة في الفضاء حول كرة حقيقية: متى تكون عليها، ومتى داخل الجلة، ومتى خارجها؟ ثم أتمم تعريفي الكتاب.',
      stage: 'trigger', teachesLearningPointIds: ['4am_kura-julla_P1', '4am_kura-julla_P2', '4am_kura-julla_P4'],
      color: 'indigo', style: 'featured', estimatedMin: 18, difficulty: 1, actionText: 'أحرّك المسبار' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — الكرة والجلة', desc: 'تعريفا الكرة والجلة، مثال النقط M و P و Q، الأقطار، الدائرة التي تدور حول قطرها، الدوائر الكبرى والصغرى.',
      stage: 'discovery', teachesLearningPointIds: ['4am_kura-julla_P1', '4am_kura-julla_P2'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'taraiq', path: `${LESSON_BASE_PATH}/taraiq`,
      title: 'طرائق — تمثيل كرة ونقطة', desc: 'تمثيل كرة بدائرة وشكل بيضوي، تمثيل نقطة من كرة أو من جلة، موقع نقطة في معلم للفضاء، ودوري الآن.',
      stage: 'formalization', teachesLearningPointIds: ['4am_kura-julla_P3', '4am_kura-julla_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'خمسة تمارين من المنصّة: القبة السماوية، كرة اليد، مجسّم الكرة الأرضية، تمثيل نقطة، قرص يدور.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_kura-julla_P2', '4am_kura-julla_P3', '4am_kura-julla_P4'],
      color: 'amber', style: 'featured', estimatedMin: 7, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — جلّة النادي في المعلم', desc: 'مسألة الدرس: موقع ثلاث نقط بالنسبة إلى كرة وجلة، دائرة كبرى وقطر، ثم العلبة المناسبة وثمنها.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_kura-julla_P1', '4am_kura-julla_P2', '4am_kura-julla_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — خزّان الماء الكروي', desc: 'قطر الخزان ودائرته الكبرى، قضيب داخله ومنتصفه، ثم تكلفة طلاء خطّ على جداره.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_kura-julla_P1', '4am_kura-julla_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — كرة القدم المقصوصة', desc: 'كرة جوفاء ومستشعر في مركزها، دائرتا قصّ: كبرى أم صغرى؟ ثم كم كرة على الرفّ.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_kura-julla_P1', '4am_kura-julla_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الأربع.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 5, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
