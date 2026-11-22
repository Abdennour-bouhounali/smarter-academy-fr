/**
 * الدرس 2 — مفهوم وتعيين الدالة الخطية
 * Unité 6 du manuel (4AM) : « أستعدّ » items 1–3 (p. 65), نشاط 1 (corrigé 2 % → 20 %) et نشاط 2
 * (p. 66), معارف 1 et 2 (p. 68), طرائق « تعيين دالة خطية انطلاقا من عدد وصورته » (p. 69),
 * exercices 1, 6, 7, 8, 9 (p. 72), QCM 2, 3, 5, 6 (p. 74),
 * puis trois « مسائل » de la plateforme (modules 4–6).
 * Source de vérité : docs/sources/4am/unit6/extraction.json.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : la machine à règle cachée `linear-machine` (thème `souk`) posée seule en tête du module 1, sur la remise de l'Aïd
 *   du نشاط 1 (20 %, corrigé) — l'élève ENTRE ses prix et la machine répond : la fonction est d'abord un appareil qu'on interroge, le mot
 *   « دالة » vient après. Le contexte du livre (le commerçant, les 20 %) est le `lead` du labo ; plus de carte du livre au-dessus.
 *   Rejetée : le tableau du livre rempli de tête (50, 100, 150, 200 → 40, 80, 120, 160 : une question de mémoire, sans besoin) ;
 *   elle reste la question 1 de l'étape 1, APRÈS les essais de l'élève (preuve `[data-activity-evidence]`).
 *   Le نشاط 2 (trois tableaux) reste le niveau متقدم du MÊME labo et l'ouverture du module 2.
 *   Ordre des idées : la machine → le tableau et son coefficient 0,8 → f(120) et les prix 6 / 1,4 → f(x) = 0,8x → la brique qui NOMME (après
 *   la réponse) → module 2 : trois tableaux, quelles fonctions sont des multiplications → classer quatre fonctions AVANT la définition →
 *   f(−4) AVANT la brique « صورة » → le tableau de valeurs → a depuis un couple (h(4) = −10) AVANT la brique tayin-dala.
 *   Le labo est le niveau du livre : `experience.reason` reste vide (pas `platform_designed_entry`). Modules 0, 3–7 inchangés.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/tanasubiya_duwal/dala-khattiya';

export const LESSON_CONFIG = {
  id: 'dala-khattiya',
  kind: 'lesson',
  unit: 'tanasubiya-dala-khattiya',
  unitTitle: 'الدالة الخطية والتناسبية',
  sequentialUnlock: true,
  title: 'مفهوم وتعيين الدالة الخطية',
  description: 'الانتقال من العلاقة التناسبية y = ax إلى مفهوم الدالة الخطية: الترميز x ⟼ ax والدستور f(x) = ax، حساب صورة عدد بدالة خطية علم معاملها، وتعيين معامل دالة خطية انطلاقا من عدد غير معدوم وصورته بحل المعادلة am = n.',
  level: 'moyen',
  grade: '4am',
  chapter: 'tanasubiya_duwal',
  chapterTitle: 'ميدان التناسبية والدوال',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🎛️',
  estimatedDurationMin: 50,
  textbookRef: { unit: 6, activity: 1, pages: '65, 66, 68, 69, 72, 74' },
  skills: [
    'الانتقال من العلاقة التناسبية y = ax إلى الدالة الخطية والترميز x ⟼ ax و f(x) = ax',
    'التعرف على دالة خطية وتمييزها من دوال ليست خطية',
    'حساب صورة عدد بدالة خطية علم معاملها',
    'تعيين معامل دالة خطية انطلاقا من عدد غير معدوم وصورته بحل المعادلة am = n',
  ],
  teachingScope: {
    include: [
      'نشاط 1: تخفيضات عيد الفطر (20%) — جدول تناسبية معامله 0,8، الدالة f(x) = 0,8x، f(120) والعدد الذي صورته 6 أو 1,4',
      'نشاط 2: ثلاثة جداول وثلاث عبارات x², 2x, 2x − 1 — الجداول التناسبية وحدها مرتبطة بدوال خطية',
      'تعريف الدالة الخطية ومعاملها، الصورة f(x) = ax والترميز x ⟼ ax (معارف 1)',
      'جدول قيم دالة خطية جدول تناسبية معامله معامل الدالة (معارف 2)',
      'تعيين دالة خطية انطلاقا من عدد غير معدوم وصورته: حل المعادلة am = n (طرائق)',
    ],
    exclude: [
      'التمثيل البياني لدالة خطية (الدرس 3)',
      'النسب المئوية والمقادير المركبة كتطبيقات للتناسبية (الدرس 4)',
      'التمثيل البياني لوضعية والترييض (الدرس 5)',
    ],
  },
  lessonProblem: {
    module: 4,
    title: 'آلات الألغاز في السوق: أيّها دالة خطية؟',
    statement: 'في ركن الألغاز بسوق المدينة، حيث ينتظر الأطفال دورهم بأدب، ثلاث آلات أعداد أ و ب و ج، لكلّ منها قاعدة مخفية لا تتغيّر: نُدخل فيها عددًا فتُخرج عددًا. ثمن المحاولة 20 دج. أدخل أمين في كل آلة الأعداد $-2$ ثم $0$ ثم $3$: فأخرجت الآلة أ الأعداد $-5$ ثم $1$ ثم $10$، وأخرجت الآلة ب الأعداد $2$ ثم $0$ ثم $4{,}5$، وأخرجت الآلة ج الأعداد $3$ ثم $0$ ثم $-4{,}5$. يربح اللاعب جائزة إذا عرف أيّ الآلات تعمل كدالة خطية، واستعملها ليُخرج العدد الذي يطلبه البائع.',
    // Le support de la مسألة 1, montré aussi par la carte « مسألة الدرس » (une seule source).
    table: {
      caption: 'ما سجّله أمين',
      head: ['العدد المُدخَل', '-2', '0', '3'],
      rows: [
        ['ما تُخرجه الآلة أ', '-5', '1', '10'],
        ['ما تُخرجه الآلة ب', '2', '0', '4,5'],
        ['ما تُخرجه الآلة ج', '3', '0', '-4,5'],
      ],
    },
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Les acquis que « أستعدّ » diagnostique : remplacer x par un nombre (item 1), résoudre une
  // équation du premier degré (items 2, 3 — leçon muadala-ula), le coefficient de proportionnalité
  // et y = a × x (deux affirmations de la plateforme — leçon tanasub-muamil).
  priorKnowledge: ['taawid-qima', 'hal-muadala-ula', 'muamil-tanasub'],
  resources: [
    // Le module 1 ouvre sur LA MACHINE À RÈGLE CACHÉE (linear-machine). مبتدئ (ouvert par défaut : ce
    // sont les nombres du نشاط 1 corrigé) : la machine de la remise de l'Aïd, x ⟼ 0,8x ;
    // متقدم : les trois machines du نشاط 2 (x², 2x, 2x − 1).
    {
      kind: 'manipulation', code: 'linear-machine-souk-0-8', type: 'linear-machine', module: 1,
      level: 'beginner',
      title: 'نشاط 1: آلة تخفيضات العيد (20%)',
      objective: 'الدالة الخطية x ⟼ ax: صورة كل عدد x هي ax، ويكفي عدد غير معدوم m وصورته n لتعيين a = n ÷ m',
      autonomy: '',
      experience: { type: 'textbook', reason: '', theme: 'souk' },
      learningPointIds: ['4am_dala-khattiya_P1', '4am_dala-khattiya_P2', '4am_dala-khattiya_P3'],
      sourceElementIds: ['act-1'],
    },
    {
      kind: 'manipulation', code: 'linear-machine-three', type: 'linear-machine', module: 1,
      level: 'advanced',
      title: 'نشاط 2: ثلاث آلات بقواعد مخفية',
      objective: 'الدالة الخطية x ⟼ ax: صورة كل عدد x هي ax، ويكفي عدد غير معدوم m وصورته n لتعيين a = n ÷ m',
      autonomy: 'ثلاث آلات بلا أي إشارة إلى أيّها خطية: التلميذ يختار مدخلاته (أعداد سالبة وعشرية والعدد 0)، ويقرّر وحده لكل آلة إن كان يطابقها a ما — وآلة x² تعطي f(0) = 0 فلا يكفي هذا الشاهد؛ و«لا يوجد a» يُرفض ما لم يجد في جدوله شاهدًا (f(0) ≠ 0 أو نسبتان f(x) ÷ x مختلفتان)',
      experience: { type: 'textbook', reason: '', theme: 'souk' },
      learningPointIds: ['4am_dala-khattiya_P1', '4am_dala-khattiya_P3'],
      sourceElementIds: ['act-2'],
    },
    // Les trois « مسائل » (modules 4–6) : la 1re prolonge les trois machines du niveau متقدم.
    { kind: 'situation', code: 'masala-1', module: 4, title: 'مسألة الدرس — آلات الألغاز: أيّها دالة خطية؟', learningPointIds: ['4am_dala-khattiya_P1', '4am_dala-khattiya_P2', '4am_dala-khattiya_P3'] },
    { kind: 'situation', code: 'masala-2', module: 5, title: 'مسألة — محطّة الوقود: سعر لتر البنزين', learningPointIds: ['4am_dala-khattiya_P1', '4am_dala-khattiya_P2', '4am_dala-khattiya_P3'] },
    { kind: 'situation', code: 'masala-3', module: 6, title: 'مسألة — محلّ الأقمشة: متر الساتان وثمن القندورة', learningPointIds: ['4am_dala-khattiya_P1', '4am_dala-khattiya_P2', '4am_dala-khattiya_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'خمس عبارات: تعويض x بعدد، حل معادلة من الدرجة الأولى، ومعامل التناسبية y = a × x. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط 1 — تخفيضات العيد', desc: 'أدخل أسعارًا في آلة التخفيض واكتشف قاعدتها المخفية، ثم أسئلة النشاط: الجدول، f(120)، والسعر الذي يعطي 6DA.',
      stage: 'trigger', teachesLearningPointIds: ['4am_dala-khattiya_P1', '4am_dala-khattiya_P2', '4am_dala-khattiya_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أشغّل الآلة' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — الدالة الخطية', desc: 'أيّ الجداول لدوال خطية؟ تعريف الدالة الخطية وصورة عدد، جدول قيمها، وتعيينها انطلاقا من عدد وصورته.',
      stage: 'discovery', teachesLearningPointIds: ['4am_dala-khattiya_P1', '4am_dala-khattiya_P2', '4am_dala-khattiya_P3'],
      color: 'violet', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'تمارين الكتاب 1، 6، 7، 8، 9: تعيين دالة خطية، تمييزها، صور الأعداد والأعداد التي صورها معلومة.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_dala-khattiya_P3', '4am_dala-khattiya_P1', '4am_dala-khattiya_P2'],
      color: 'amber', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتدرّب' },
    { id: '04', number: 4, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — آلات الألغاز', desc: 'مسألة الدرس: ثلاث آلات بقواعد مخفية، أيّها دالة خطية؟ آلة رابعة تُعيَّن من عدد وصورته، ثم الأعداد التي تربح الجائزة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_dala-khattiya_P1', '4am_dala-khattiya_P2', '4am_dala-khattiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '05', number: 5, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — محطّة الوقود', desc: 'سعر لتر البنزين معامل دالة خطية: الجدول، وصل خاطئ، ثم ملء خزّان سيارة أجرة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_dala-khattiya_P1', '4am_dala-khattiya_P2', '4am_dala-khattiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — محلّ الأقمشة', desc: 'متر الساتان من عدد وصورته، ثمن قندورة مع أجرة الخياطة ليس دالة خطية، ثم أطول قطعة تسمح بها الميزانية.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_dala-khattiya_P1', '4am_dala-khattiya_P2', '4am_dala-khattiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'ستة أسئلة تُقيّم الكفاءات الثلاث، منها أربعة من أؤكّد تعلّماتي.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 7, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
