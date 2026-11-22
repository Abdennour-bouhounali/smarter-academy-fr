/**
 * الدرس 5 — حل مشكلات وترييض وضعيات بتوظيف الدالة التآلفية
 * Unité 7 du manuel (4AM, pp. 77–79). Le manuel ne destine à cette leçon que la question 1 de نشاط 4
 * (p. 79 : l'abonnement du supporter, 2000DA + 200DA par match ; 7 matchs → 3400DA ; 4800DA → 14 matchs),
 * en doublon déclaré (extraction → destinations › act-4 › duplicatedIn). Il n'a ni معارف, ni طرائق, ni
 * exercices pour ce sujet : la comparaison de deux tarifs, la méthode et les exercices sont des AJOUTS de
 * la plateforme, déclarés (`addition(...)`). Source de vérité : docs/sources/4am/unit7/extraction.json.
 * Puis trois « مسائل » de la plateforme (modules 5–7), avant le إختبار أولي (module 8).
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : la salle de jeux (labo `plan-compare`, thème `gaming`, niveau مبتدئ : 500DA une fois + 150DA l'heure) — la
 *   main doit placer « payé une fois » et « payé à chaque heure » dans la facture, et le labo REFUSE l'abonnement payé à chaque
 *   fois : la forme ax + b devient nécessaire avant toute écriture. Rejetée : la facture du supporter du manuel (نشاط 4, 2000DA +
 *   200DA par match) comme premier contact — ses grands nombres noient le refus ; elle reste le niveau متقدم du MÊME labo ET revient,
 *   après le premier pourquoi, comme APPLICATION (étapes 2–4 : la fonction du manuel, 7 matchs, 4800DA). Aucune destination déplacée.
 *   Ordre des idées : pourquoi l'abonnement n'est pas multiplié par x (brique « namdhaja-taalufiya » APRÈS la réponse) → l'activité
 *   du manuel en application (fonction, image, antécédent) → la brique « sura-fi-wadiya » après ses deux questions → module 2 : pourquoi
 *   le labo refuse une marque à 8 matchs, la salle de sport par l'équation (brique « tasawi-taqatu » APRÈS la réponse), avant / après le
 *   croisement (« sigha-afdal » APRÈS), lecture graphique, trois formules → module 3 : la méthode (brique « khutuwat-mufadala » APRÈS
 *   l'association ligne ↔ étape, pas avant). Les modules 0, 4–8 sont inchangés (pas de labo ; les rappels y viennent après le cours).
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/tanasubiya_duwal/tarrid-taalufi';

export const LESSON_CONFIG = {
  id: 'tarrid-taalufi',
  kind: 'lesson',
  unit: 'dala-taalufiya',
  unitTitle: 'الدالة التآلفية',
  sequentialUnlock: true,
  title: 'حل مشكلات وترييض وضعيات بتوظيف الدالة التآلفية',
  description: 'نمذجة تكاليف بجزء ثابت وجزء متغير (اشتراك، تأجير، باقات) بدوال تآلفية، ثم المفاضلة بين تسعيرتين جبريا (معادلة ومتراجحة) وبيانيا (نقطة تقاطع المستقيمين) واختيار الصيغة الأفضل بحسب قيم المتغير.',
  level: 'moyen',
  grade: '4am',
  chapter: 'tanasubiya_duwal',
  chapterTitle: 'ميدان التناسبية والدوال',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🎮',
  estimatedDurationMin: 50,
  textbookRef: { unit: 7, activity: 4, pages: '79' },
  // « مسألة الدرس » : montrée au sommaire et au module 1, résolue au module 5 (content/problems.js).
  lessonProblem: {
    module: 5,
    title: 'ملعب المدينة: اشتراك 1800 دج أم تذكرة 350 دج؟',
    statement: 'لموسم كرة القدم الجديد، يعرض المركّب الرياضي للمدينة، الذي يدعو مناصريه إلى الروح الرياضية والتشجيع النظيف، على مناصري فريقها صيغتين. الصيغة A: اشتراك سنوي 1800 دج يُدفع مرّة واحدة، ثم 150 دج عند كل دخول إلى الملعب. الصيغة B: دون اشتراك، 350 دج عند كل دخول. يتّسع الملعب لـ 40000 متفرّج، وثمن قميص الفريق 2500 دج. نسمّي $x$ عدد المقابلات التي يتابعها مناصر خلال الموسم.',
    illustration: { kind: 'tags', cards: [{ title: 'الصيغة A', icon: 'ticket', lines: [{ label: 'اشتراك سنوي', value: 1800, unit: 'دج' }, { label: 'كل دخول', value: 150, unit: 'دج' }] }, { title: 'الصيغة B', icon: 'ticket', lines: [{ label: 'كل دخول', value: 350, unit: 'دج' }] }], ariaLabel: 'بطاقتان لصيغتي اشتراك الملعب: A اشتراك سنوي 1800 دج مع 150 دج عند كل دخول، و B دون اشتراك بـ 350 دج عند كل دخول' },
  },
  skills: [
    'نمذجة تكلفة بجزء ثابت يُدفع مرّة واحدة وجزء متغير بدالة تآلفية $f(x) = ax + b$',
    'حساب مبلغ لعدد معلوم (صورة عدد) وعدد الوحدات لمبلغ معلوم (العدد الذي صورته معلومة)',
    'المفاضلة بين صيغتين جبريا: المعادلة $f(x) = g(x)$ ثم المتراجحة $f(x) < g(x)$',
    'المفاضلة بيانيا: نقطة تقاطع المستقيمين، والمستقيم الذي يقع تحت الآخر',
    'اختيار الصيغة الأفضل بحسب قيم المتغير وتفسير النتيجة في سياق الوضعية',
  ],
  teachingScope: {
    include: [
      'نشاط 4 ص 79، السؤال 1: الاشتراك السنوي للمناصر، 7 مقابلات ثم 4800DA',
      'المقارنة بين صيغة الاشتراك وصيغة التذكرة وحدها (امتداد من المنصّة)',
      'خطوات ترييض وضعية بدالة تآلفية والمفاضلة بين صيغتين (من المنصّة)',
      'وضعيات من حياة التلميذ: باقات الهاتف، تطبيقات النقل، كراء الدراجات، قاعة الرياضة',
    ],
    exclude: [
      'تعريف الدالة التآلفية وحساب صورة عدد (الدرس 1)',
      'تقنيات رسم التمثيل البياني لدالة تآلفية (الدرس 2)',
      'تناسب التغيّرات وتعيين دالة تآلفية من عددين وصورتيهما (الدرس 3)',
      'الحل البياني لجملة معادلتين (الدرس 4)',
    ],
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Les acquis que « أستعدّ » diagnostique (prérequis du propriétaire) : résoudre une équation et une
  // inéquation du premier degré (unité 4), l'image et l'antécédent par une fonction affine (leçon 1),
  // lire le graphique d'une fonction affine (leçon 2) ; la notation f(x) (lexique de l'audit).
  priorKnowledge: ['hall-muadala', 'hall-mutarajiha', 'sura-taalufiya', 'notation-fx', 'qiraa-bayaniya-taalufiya'],
  resources: [
    // Module 1 : نشاط 4 ص 79, question 1 — la facture du supporter. مبتدئ : une salle de jeux (500 + 150 par
    // heure, contexte de la plateforme, plus petits nombres) ; متقدم (défaut) : l'abonnement du manuel avec les
    // deux cibles du manuel (7 matchs, 4800DA).
    {
      kind: 'manipulation', code: 'plan-compare-qaat-alab-150-500', type: 'plan-compare', module: 1,
      level: 'beginner',
      title: 'قاعة الألعاب: بطاقة شهرية وساعات لعب',
      objective: 'نمذجة تكلفة بجزء ثابت يُدفع مرّة واحدة وجزء يُدفع عن كل وحدة بدالة تآلفية f(x) = ax + b، ثم حساب مبلغ أو عدد وحدات',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'gaming' },
      learningPointIds: ['4am_tarrid-taalufi_P1'],
      sourceElementIds: ['act-4'],
    },
    {
      kind: 'manipulation', code: 'plan-compare-ishtirak-2000-200', type: 'plan-compare', module: 1,
      level: 'advanced',
      title: 'نشاط 4: اشتراك المناصر 2000DA و 200DA للمقابلة',
      objective: 'نمذجة تكلفة بجزء ثابت يُدفع مرّة واحدة وجزء يُدفع عن كل وحدة بدالة تآلفية f(x) = ax + b، ثم حساب مبلغ أو عدد وحدات',
      autonomy: 'مبالغ الكتاب الكبيرة دون مساعدة: التلميذ يقرّر بنفسه أين يضع الاشتراك وثمن الدخول، ثم يبحث وحده عن عدد المقابلات الذي يعطي 4800DA (عدد صورته معلومة) بعد المبلغ لـ 7 مقابلات',
      experience: { type: 'textbook', reason: '', theme: 'stadium' },
      learningPointIds: ['4am_tarrid-taalufi_P1'],
      sourceElementIds: ['act-4'],
    },
    // Module 2 : la comparaison (ajout de la plateforme, sur le monde de نشاط 4). مبتدئ : le stade, l'abonnement
    // contre le billet seul (400DA) — égalité à 10 matchs ; متقدم : la salle de jeux et TROIS formules.
    {
      kind: 'manipulation', code: 'plan-compare-ishtirak-tadhkira', type: 'plan-compare', module: 2,
      level: 'beginner',
      title: 'الاشتراك أم التذكرة وحدها؟',
      objective: 'المفاضلة بين صيغتين: تتساوى التكلفتان عند فاصلة نقطة تقاطع المستقيمين (حل المعادلة f(x) = g(x)) وتتغيّر الصيغة الأفضل عندها (حل المتراجحة f(x) < g(x))',
      autonomy: '',
      experience: { type: 'platform_adaptation', reason: 'multiple_representations', theme: 'stadium' },
      learningPointIds: ['4am_tarrid-taalufi_P2'],
      sourceElementIds: ['act-4'],
    },
    {
      kind: 'manipulation', code: 'plan-compare-qaat-alab-3', type: 'plan-compare', module: 2,
      level: 'advanced',
      title: 'قاعة الألعاب: ثلاث صيغ للشهر',
      objective: 'المفاضلة بين صيغتين: تتساوى التكلفتان عند فاصلة نقطة تقاطع المستقيمين (حل المعادلة f(x) = g(x)) وتتغيّر الصيغة الأفضل عندها (حل المتراجحة f(x) < g(x))',
      autonomy: 'ثلاث صيغ بدل اثنتين: التلميذ يجد بنفسه نقطتي التقاطع اللتين تتغيّر عندهما الصيغة الأرخص (ويرفض الثالثة التي تقع فوق صيغة أرخص منهما)، ثم يلوّن ثلاثة مجالات دون أي إشارة',
      experience: { type: 'platform_context', reason: 'larger_numbers_for_autonomy', theme: 'gaming' },
      learningPointIds: ['4am_tarrid-taalufi_P2'],
      sourceElementIds: ['act-4'],
    },
    // Les trois « مسائل » (modules 5–7) : ajouts de la plateforme (content/problems.js).
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — ملعب المدينة: اشتراك أم تذكرة؟', learningPointIds: ['4am_tarrid-taalufi_P1', '4am_tarrid-taalufi_P2'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — مدرسة الموسيقى: انخراط أم دفع عن كل حصة؟', learningPointIds: ['4am_tarrid-taalufi_P1', '4am_tarrid-taalufi_P2'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — خزّانا الوقود في الطريق إلى غرداية', learningPointIds: ['4am_tarrid-taalufi_P1', '4am_tarrid-taalufi_P2'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ثماني عبارات: حل معادلة ومتراجحة من الدرجة الأولى، صورة عدد والعدد الذي صورته معلومة بدالة تآلفية، قراءة تمثيلها البياني. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'ishtirak', path: `${LESSON_BASE_PATH}/ishtirak`,
      title: 'نشاط 4 — اشتراك المناصر', desc: 'ضع الاشتراك السنوي وثمن الدخول كلًّا في خانته، ثم احسب المبلغ لـ 7 مقابلات وعدد المقابلات بـ 4800DA. الكتاب ص 79.',
      stage: 'trigger', teachesLearningPointIds: ['4am_tarrid-taalufi_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أبني التكلفة' },
    { id: '02', number: 2, slug: 'mufadala', path: `${LESSON_BASE_PATH}/mufadala`,
      title: 'المفاضلة بين صيغتين', desc: 'الاشتراك أم التذكرة؟ حرّك عدد المقابلات، ضع العلامة على نقطة التقاطع، لوّن الصيغة الأرخص، ثم المعادلة والمتراجحة والقراءة البيانية.',
      stage: 'discovery', teachesLearningPointIds: ['4am_tarrid-taalufi_P2'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'أقارن' },
    { id: '03', number: 3, slug: 'tarayiq', path: `${LESSON_BASE_PATH}/tarayiq`,
      title: 'طرائق — ترييض والمفاضلة بين صيغتين', desc: 'خمس خطوات على باقتي هاتف: نختار المتغير، نعبّر عن كل تكلفة، نحلّ ونقارن، نقرأ بيانيا، ثم نجيب في سياق الوضعية.',
      stage: 'formalization', teachesLearningPointIds: ['4am_tarrid-taalufi_P1', '4am_tarrid-taalufi_P2'],
      color: 'emerald', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'تطبيقا نقل، قاعة رياضة، كراء دراجة على الشاطئ: نمذج كل صيغة ثم اختر الأفضل.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_tarrid-taalufi_P1', '4am_tarrid-taalufi_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — ملعب المدينة', desc: 'مسألة الدرس: اشتراك المناصر أم التذكرة وحدها؟ المبلغ لعدد من المقابلات، عدد المقابلات لمبلغ، ثم ميزانية الموسم.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_tarrid-taalufi_P1', '4am_tarrid-taalufi_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — مدرسة الموسيقى', desc: 'انخراط سنوي أم دفع عن كل حصة؟ معنى العددين في الدالة، قراءة نقطة التقاطع، ثم ما وفّره تلميذ.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_tarrid-taalufi_P1', '4am_tarrid-taalufi_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — خزّانا الوقود', desc: 'سيارتان في الطريق إلى غرداية: الوقود المتبقّي دالة تآلفية متناقصة، متى يتساوى الخزانان، ومتى يشتعل مصباح الاحتياط.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_tarrid-taalufi_P1', '4am_tarrid-taalufi_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءتين: النمذجة بدالة تآلفية، والمفاضلة بين صيغتين.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 5, difficulty: 3, actionText: 'أدخل التقويم' },
  ],
};
