/**
 * الدرس 1 — مفهوم وتعيين دالة تآلفية
 * Unité 7 du manuel (4AM) : « أستعدّ » items 1–5 (p. 77), نشاط 1 (corrigé « أضيف » → « أضف ») et نشاط 2
 * (p. 78). Le manuel fourni n'a ni معارف, ni طرائق, ni exercices : la formalisation (module 3) et
 * « أوظّف » (module 4) sont des ajouts DÉCLARÉS de la plateforme. Source de vérité :
 * docs/sources/4am/unit7/extraction.json.
 *
 * Parcours (owner) : REAL → DISCOVER → MANIPULATE (module 1 : la paie, le compteur à partie fixe) →
 * UNDERSTAND / TOUCH THE MATH (module 2 : les six règles, a et b, les cas particuliers) → FORMALIZE
 * (module 3) → AUTOMATIZE / TRANSFER (module 4), puis trois « مسائل » de la plateforme (modules 5–7) →
 * évaluation (module 8).
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue (module 1) : la course en taxi-application (100DA à la montée, 40DA le km) sur le compteur à partie fixe —
 *   l'élève essaie 0 km et voit que le compteur ne part pas de 0 : la partie fixe devient nécessaire à sa main. La paie du
 *   نشاط 1 (35000DA + 185DA l'heure, la cible 37775, les boutons a et b) reste le niveau متقدم du MÊME lab.
 *   Rejetée : le texte du نشاط 1 posé en carte au-dessus du lab, puis « vérifie 36850 » et « complète le tableau » avant tout
 *   geste (une vérification, répondue sans le compteur) ; le tableau 5/8/12/15 est déjà fait par les repères du lab.
 *   Ordre des idées : 0 km et la partie fixe (POURQUOI) → x double, la lecture non (le « جدول تناسبية » du livre) → le livre
 *   en APPLICATION (10 heures, S(x)) → type de fonction, programme, brique dala-ujra APRÈS la réponse → l'antécédent 38330.
 *   Module 2 : la question d'abord (plus de rappel ni de carte au-dessus). Module 3 : chaque étape s'ouvre sur sa question, les
 *   encadrés et les briques viennent après. Aucune destination du manuel n'a bougé (act-1 et act-2 restent aux modules 1 et 2).
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/tanasubiya_duwal/mafhum-taalufiya';

export const LESSON_CONFIG = {
  id: 'mafhum-taalufiya',
  kind: 'lesson',
  unit: 'dala-taalufiya',
  unitTitle: 'الدالة التآلفية',
  sequentialUnlock: true,
  title: 'مفهوم وتعيين دالة تآلفية',
  description: 'أجرة بجزء ثابت وجزء متغير تقود إلى الدالة التآلفية: الترميز x ⟼ ax + b والدستور f(x) = ax + b، حساب صورة عدد، تعيين العدد الذي صورته معلومة بحل المعادلة ax + b = m، والتمييز بين الدالة التآلفية والدالة الخطية (b = 0) والدالة الثابتة (a = 0).',
  level: 'moyen',
  grade: '4am',
  chapter: 'tanasubiya_duwal',
  chapterTitle: 'ميدان التناسبية والدوال',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🛵',
  estimatedDurationMin: 45,
  textbookRef: { unit: 7, activity: 1, pages: '77, 78' },
  skills: [
    'التعرف على الدالة التآلفية والترميز x ⟼ ax + b والدستور f(x) = ax + b',
    'تعيين المعاملين a و b لدالة تآلفية مهما كان ترتيب كتابة حدّيها',
    'حساب صورة عدد بدالة تآلفية معلومة',
    'تعيين العدد الذي صورته معلومة بحل المعادلة ax + b = m',
    'التمييز بين الدالة التآلفية والدالة الخطية (b = 0) والدالة الثابتة (a = 0)',
  ],
  teachingScope: {
    include: [
      'نشاط 1: أجرة قاعدية 35000DA يضاف إليها 185DA لكل ساعة إضافية — الجدول، ليس جدول تناسبية، S(x) = 185x + 35000، برنامج الحساب «اضرب x في 185، أضف 35000»',
      'نشاط 2: ست دوال — أيّها تآلفية، معاملاها a و b، و«الدالة الخطية هي أيضا دالة تآلفية»',
      'تعريف الدالة التآلفية والترميز وصورة عدد (إضافة من المنصّة: الكتاب المتوفّر بلا معارف)',
      'تعيين العدد الذي صورته معلومة: حل المعادلة ax + b = m (البرنامج العكسي)',
      'الحالتان الخاصتان: b = 0 (دالة خطية) و a = 0 (دالة ثابتة)',
    ],
    exclude: [
      'التمثيل البياني لدالة تآلفية والترتيب عند المبدأ (الدرس 2)',
      'تعيين دالة تآلفية من عددين وصورتيهما وتناسب التغيّرات (الدرس 3)',
      'التفسير البياني لحل جملة معادلتين (الدرس 4)',
    ],
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Les acquis que « أستعدّ » diagnostique : remplacer x par un nombre (item 1), l'image et l'antécédent
  // par une fonction linéaire (items 2, 3, 5 — leçon dala-khattiya), reconnaître une fonction linéaire
  // (item 4), résoudre ax + b = c (item 6 de la plateforme — leçon muadala-ula).
  priorKnowledge: ['taawid-qima', 'sura-khattiya', 'mafhum-khattiya', 'hal-muadala-ula'],
  // « مسألة الدرس » (MASAIL_GENERATION_GUIDE.md) : l'énoncé de la مسألة 1, montré au sommaire et à la fin du
  // module 1, prolongement de la paie du niveau متقدم (autres nombres), résolu au module 5.
  lessonProblem: {
    module: 5,
    title: 'مصنع النسيج: أجرة قاعدية وساعات إضافية',
    statement: 'يقترح مصنع للنسيج في تلمسان، يشتهر عمّاله بإتقان صنعتهم، على كل عامل أجرة شهرية تُحسب كما يلي: أجرة قاعدية قدرها 38000 دج، يضاف إليها 240 دج عن كل ساعة إضافية منجزة في الشهر. يشغّل المصنع 120 عاملًا، ولا يسمح نظامه الداخلي بأكثر من 20 ساعة إضافية في الشهر للعامل الواحد. نسمّي $x$ عدد الساعات الإضافية التي ينجزها عامل في شهر، و $S(x)$ أجرته الشهرية بالدينار.',
    illustration: { kind: 'scene', icon: 'shirt', bg: 'violet', chips: [{ label: 'أجرة قاعدية', value: 38000, unit: 'دج' }, { label: 'ساعة إضافية', value: 240, unit: 'دج', tone: 'rose' }, { label: 'عدد العمّال', value: 120, unit: 'عامل', tone: 'green' }, { label: 'أقصى ساعات', value: 20, unit: 'ساعة', tone: 'amber' }], ariaLabel: 'مصنع للنسيج: أجرة قاعدية 38000 دج وزيادة 240 دج عن كل ساعة إضافية، و 120 عاملًا، وحدّ أقصى 20 ساعة إضافية في الشهر' },
  },
  resources: [
    // Le module 1 ouvre sur LE COMPTEUR À PARTIE FIXE (affine-meter). مبتدئ : une course en
    // taxi-application (plateforme, petits nombres) ; متقدم (ouvert par défaut : c'est le نشاط 1) : la
    // paie, ses colonnes, la cible 37775 lue à l'envers, puis les boutons a et b.
    {
      kind: 'manipulation', code: 'affine-meter-ride', type: 'affine-meter', module: 1,
      level: 'beginner',
      title: 'عدّاد سيارة الأجرة: 100DA عند الركوب و 40DA للكيلومتر',
      objective: 'الدالة التآلفية x ⟼ ax + b: جزء ثابت b يُدفع مرة واحدة وجزء a عن كل وحدة؛ العدد الذي صورته m حل ax + b = m؛ b = 0 دالة خطية و a = 0 دالة ثابتة',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'ride' },
      learningPointIds: ['4am_mafhum-taalufiya_P1', '4am_mafhum-taalufiya_P2'],
      sourceElementIds: ['act-1'],
    },
    {
      kind: 'manipulation', code: 'affine-meter-payroll', type: 'affine-meter', module: 1,
      level: 'advanced',
      title: 'نشاط 1: أجرة قاعدية 35000DA يضاف إليها 185DA لكل ساعة إضافية',
      objective: 'الدالة التآلفية x ⟼ ax + b: جزء ثابت b يُدفع مرة واحدة وجزء a عن كل وحدة؛ العدد الذي صورته m حل ax + b = m؛ b = 0 دالة خطية و a = 0 دالة ثابتة',
      autonomy: 'ثلاث مراحل يفتحها التلميذ بنفسه: يتمّ أعمدة جدول الكتاب على مسطرة الساعات (5 و 10 تكشفان أنّ الأجرة لا تتضاعف)، ثم يبحث وحده عن عدد الساعات الذي يعطي 37775DA دون أن يُكتب له (البرنامج العكسي يظهر بعد بلوغه فقط)، ثم يضبط المعاملين a و b حتى يجعل الأجرة دالة خطية ثم دالة ثابتة؛ «تتناسب الأجرة مع الساعات» و«نقسم ثم نطرح» تُرفضان بأعداده',
      experience: { type: 'textbook', reason: '', theme: 'payroll' },
      learningPointIds: ['4am_mafhum-taalufiya_P1', '4am_mafhum-taalufiya_P2', '4am_mafhum-taalufiya_P3', '4am_mafhum-taalufiya_P4'],
      sourceElementIds: ['act-1'],
    },
    // Les trois « مسائل » (modules 5–7) : ajouts de la plateforme (content/problems.js).
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — مصنع النسيج: الأجرة والساعات الإضافية', learningPointIds: ['4am_mafhum-taalufiya_P1', '4am_mafhum-taalufiya_P2', '4am_mafhum-taalufiya_P3', '4am_mafhum-taalufiya_P4'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — فاتورة الماء: جزء ثابت وثمن للمتر المكعّب', learningPointIds: ['4am_mafhum-taalufiya_P1', '4am_mafhum-taalufiya_P2', '4am_mafhum-taalufiya_P3'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — حظيرة السيارات: ثلاث صيغ للدفع', learningPointIds: ['4am_mafhum-taalufiya_P1', '4am_mafhum-taalufiya_P2', '4am_mafhum-taalufiya_P3', '4am_mafhum-taalufiya_P4'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: تعويض x بعدد، صورة عدد بدالة خطية والعدد الذي صورته معلومة، تمييز الدالة الخطية، وحل معادلة. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط 1 — أجرة العامل', desc: 'أجرة قاعدية 35000DA يضاف إليها 185DA لكل ساعة إضافية: أدفع بطاقة الدوام وأقرأ العدّاد، أتمّ الجدول، أعبّر عن S(x) بدلالة x وأصف S ببرنامج حساب.',
      stage: 'trigger', teachesLearningPointIds: ['4am_mafhum-taalufiya_P1', '4am_mafhum-taalufiya_P2', '4am_mafhum-taalufiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أشغّل العدّاد' },
    { id: '02', number: 2, slug: 'tamyiz', path: `${LESSON_BASE_PATH}/tamyiz`,
      title: 'نشاط 2 — التعرّف على دوال تآلفية', desc: 'ست دوال من الكتاب: أيّها تآلفية؟ ما معاملاها a و b؟ الدالة الخطية والدالة الثابتة حالتان خاصتان.',
      stage: 'discovery', teachesLearningPointIds: ['4am_mafhum-taalufiya_P1', '4am_mafhum-taalufiya_P4'],
      color: 'violet', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'أميّز' },
    { id: '03', number: 3, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — الدالة التآلفية', desc: 'التعريف والترميز، صورة عدد، العدد الذي صورته معلومة (البرنامج العكسي)، والحالتان الخاصتان.',
      stage: 'formalization', teachesLearningPointIds: ['4am_mafhum-taalufiya_P1', '4am_mafhum-taalufiya_P2', '4am_mafhum-taalufiya_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'أصوغ' },
    { id: '04', number: 4, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'صيغة هاتف نقال، صور بإشارات وكسور، عدد صورته معلومة، وتصنيف دوال: خطية، ثابتة أو تآلفية.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_mafhum-taalufiya_P2', '4am_mafhum-taalufiya_P3', '4am_mafhum-taalufiya_P4', '4am_mafhum-taalufiya_P1'],
      color: 'emerald', style: 'featured', estimatedMin: 6, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — مصنع النسيج', desc: 'مسألة الدرس: أجرة قاعدية 38000 دج يضاف إليها 240 دج عن كل ساعة إضافية. حلّ كامل خطوة بخطوة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_mafhum-taalufiya_P1', '4am_mafhum-taalufiya_P2', '4am_mafhum-taalufiya_P3', '4am_mafhum-taalufiya_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — فاتورة الماء', desc: 'جزء ثابت وثمن للمتر المكعّب: أتمّ الجدول، ثم كم كلّف التسرّب؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_mafhum-taalufiya_P1', '4am_mafhum-taalufiya_P2', '4am_mafhum-taalufiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — حظيرة السيارات', desc: 'ثلاث صيغ للدفع: تآلفية، خطية وثابتة. أيّها أقل تكلفة؟ وكم ساعة توقّف الزائر؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_mafhum-taalufiya_P1', '4am_mafhum-taalufiya_P2', '4am_mafhum-taalufiya_P3', '4am_mafhum-taalufiya_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الأربع.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
