/**
 * الدرس 4 — ترييض وقراءة وضعيات إحصائية وتفسير المؤشرات (unité 8 « الإحصاء », manuel pp. 91–101).
 * La leçon n'a PAS d'activité du manuel : son entrée est le تحدّ de la page d'unité (doublon déclaré,
 * extraction › destinations › challenge), son contexte réel l'encart « تلوث البيئة » (doublon déclaré),
 * ses exercices ex-14 (p. 99), ex-19 et ex-22 (p. 101). Son savoir formel est une FORMULATION de la
 * plateforme (`addition('knowledge_formalization')`) dans le vocabulaire du manuel.
 *
 * Le parcours du propriétaire, module par module :
 *   0 أستعدّ                  diagnostic des acquis des leçons 1–2 (متوسط، وسيط، مدى، تواتر، قراءة مخطط)
 *   1 تحدّ (trigger)          REAL → DISCOVER → MANIPULATE → UNDERSTAND : les réservoirs `group-tanks`
 *                             (pari, vanne, effectifs) ; deux classes au MÊME niveau 384/33
 *   2 أقرأ وأترجم (discovery)  TOUCH THE MATH : lire un مخطط بالأعمدة (les voitures du club vert, après
 *                             « تلوث البيئة »), puis le casse-tête d'ex-19 (deux barres qui réunissent deux chaînes)
 *   3 أقارن وأقرّر (formalization) FORMALIZE : ex-14 (deux villes, position ET dispersion), ex-22 (retirer des
 *                             valeurs → N = 31), la méthode « أقرأ · أحسب المؤشرات · أقارن · أقرّر »
 *   4 أوظّف (practice_lab)     AUTOMATIZE → TRANSFER : temps d'écran, derby, plage (plateforme)
 *   puis trois « مسائل » de la plateforme (modules 5–7), avant
 *   8 إختبار أولي (evaluation)
 * Les exercices sont rangés aux modules 2–3 (et non tous au module 2 comme le plan l'esquissait) : la
 * lecture (P1) précède la comparaison (P2) et la modélisation (P3).
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : les réservoirs `group-tanks`, niveau مبتدئ par défaut (4 amis à 12 et 6 à 7 : la main PARIE 9,5, l'eau s'arrête
 *   à 9) puis le تحدّ du manuel au niveau متقدم — le pari est NÉCESSAIRE avant le calcul, et la fausse moyenne des moyennes se voit.
 *   Rejetée : le tableau du manuel lu en tête (« أيّ القسمين أفضل ? » répondu de mémoire, avant tout geste) : il reste la question
 *   de l'étape 3, APRÈS que l'élève a parié et ouvert les vannes. Aucun changement de destination.
 *   Ordre des idées : pari → somme d'eau du القسم (أ) (brique APRÈS) → piège 11,5 → question du manuel + brique → effectifs égaux
 *   (rappel APRÈS la réponse). Modules 2–3 : briques « qiraat-mukhattat », « tarjama-jadwal », « hadhf-qiyam » APRÈS la réponse.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/tanasubiya_duwal/qiraat-wadiyat-ihsaiya';

export const LESSON_CONFIG = {
  id: 'qiraat-wadiyat-ihsaiya',
  kind: 'lesson',
  unit: 'ihsa',
  unitTitle: 'الإحصاء',
  sequentialUnlock: true,
  title: 'ترييض وقراءة وضعيات إحصائية وتفسير المؤشرات',
  description: 'قراءة جداول ومخططات إحصائية من الحياة اليومية والمواضيع البيئية والاجتماعية، مقارنة سلسلتين بمؤشرات الموقع والتشتت (المتوسط، الوسيط، المدى) واتخاذ القرار، ونمذجة وضعيات واقعية تنطلق من «تحدّ» القسمين.',
  level: 'moyen',
  grade: '4am',
  chapter: 'tanasubiya_duwal',
  chapterTitle: 'ميدان التناسبية والدوال',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🔎',
  estimatedDurationMin: 50,
  textbookRef: { unit: 8, activity: 0, pages: '91, 99, 101' },
  skills: [
    'قراءة مخطط بالأعمدة (عنوان المحور، خطوة التدريج) وترجمته إلى جدول تكرارات وتواترات',
    'حساب متوسط سلسلة مكوّنة من مجموعات: المتوسط المتوازن وليس متوسط المتوسطات',
    'مقارنة سلسلتين بمؤشر موقع (المتوسط، الوسيط) ومؤشر تشتت (المدى)',
    'تفسير أثر قيمة متطرفة أو حذف قيم على المتوسط والوسيط',
    'اتخاذ قرار في وضعية واقعية وتبريره بالمؤشرات',
  ],
  teachingScope: {
    include: [
      'تحدّ ص 91: قسمان، ذكور وإناث، المعدّل نفسه 384/33',
      'نص «تلوث البيئة» ص 91 سياقًا لقراءة معطيات',
      'التمارين 14 (ص 99) و 19 و 22 (ص 101)',
      'طريقة: أقرأ، أحسب المؤشرات، أقارن، أقرّر (من المنصّة)',
      'وضعيات من حياة التلميذ: مدّة استعمال الهاتف، الدربي، تنظيف الشاطئ',
    ],
    exclude: [
      'تعريف التكرار المجمع والتواتر المجمع وحسابهما (الدرس 1)',
      'تعريفات المدى والوسيط والمتوسط وطرائق حسابها (الدرس 2)',
      'المجدولات (الدرس 3)',
    ],
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Les acquis des leçons 1 et 2 que « أستعدّ » diagnostique : المتوسط، المتوسط المتوازن (par les effectifs),
  // الوسيط، المدى، التواتر، la lecture d'un مخطط بالأعمدة.
  priorKnowledge: ['mutawassit-silsila', 'mutawassit-mutawazin', 'wasit-silsila', 'mada-silsila', 'tawatur', 'qiraat-mukhattat-aamida'],
  // « مسألة الدرس » (MASAIL_GENERATION_GUIDE.md) : l'énoncé de la مسألة 1, montré au sommaire et à la fin du
  // module 1 ; elle prolonge le تحدّ du niveau متقدم (deux classes, deux groupes chacune, autres nombres).
  lessonProblem: {
    module: 5,
    title: 'قسمان: مجموعات أفضل وقسم أضعف؟',
    statement: 'في فرض الرياضيات لقسمين من السنة الرابعة متوسط، تعاون تلاميذهما في المراجعة قبله، في كل قسم 30 تلميذًا. في القسم (أ): 10 ذكور معدّلهم 8 و 20 أنثى معدّلهنّ $12{,}5$. في القسم (ب): 20 ذكرًا معدّلهم 9 و 10 إناث معدّلهنّ $13{,}5$. دام الفرض 90 دقيقة، وأُجري يوم الأحد. يقول تلميذ من القسم (ب): «ذكورنا أفضل من ذكوركم، وإناثنا أفضل من إناثكم، إذن قسمنا هو الأفضل».',
    // Le support de la مسألة 1, montré aussi par la carte « مسألة الدرس » (une seule source).
    table: {
      head: ['', 'ذكور — العدد', 'ذكور — المعدّل', 'إناث — العدد', 'إناث — المعدّل'],
      rows: [
        ['القسم (أ)', '10', '8', '20', '12,5'],
        ['القسم (ب)', '20', '9', '10', '13,5'],
      ],
    },
  },
  resources: [
    // Module 1 : le تحدّ (p. 91). مبتدئ : مسابقة القسم, deux équipes d'amis (plateforme, plus petits nombres) ;
    // متقدم (défaut) : les deux classes du manuel.
    {
      kind: 'manipulation', code: 'group-tanks-quiz-4-6', type: 'group-tanks', module: 1,
      level: 'beginner',
      title: 'مسابقة القسم: فريقان من الأصدقاء',
      objective: 'متوسط مجموعات مجتمعة هو المتوسط المتوازن: مجموع (التكرار × المتوسط) مقسوم على التكرار الكلي، وليس متوسط المتوسطات',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'smaller_numbers_for_first_contact', theme: 'quiz' },
      learningPointIds: ['4am_qiraat-wadiyat-ihsaiya_P3'],
      sourceElementIds: ['challenge'],
    },
    {
      kind: 'manipulation', code: 'group-tanks-tahaddi-384-33', type: 'group-tanks', module: 1,
      level: 'advanced',
      title: 'تحدّ: القسمان (أ) و (ب)',
      objective: 'متوسط مجموعات مجتمعة هو المتوسط المتوازن: مجموع (التكرار × المتوسط) مقسوم على التكرار الكلي، وليس متوسط المتوسطات',
      autonomy: 'أربع مجموعات في قسمين وأعداد الكتاب: التلميذ يراهن وحده على مستوى كل قسم بدقّة عُشر، دون اقتراح، ثم يحكم على القسمين وقد تعاكست المقارنتان (الذكور ثم الإناث)',
      experience: { type: 'textbook', reason: '', theme: 'school' },
      learningPointIds: ['4am_qiraat-wadiyat-ihsaiya_P2', '4am_qiraat-wadiyat-ihsaiya_P3'],
      sourceElementIds: ['challenge'],
    },
    // Les trois « مسائل » (modules 5–7) — ajouts de la plateforme, content/problems.js.
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — قسمان: مجموعات أفضل وقسم أضعف؟', learningPointIds: ['4am_qiraat-wadiyat-ihsaiya_P1', '4am_qiraat-wadiyat-ihsaiya_P2', '4am_qiraat-wadiyat-ihsaiya_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — أمطار تيزي وزو: المتوسط أم الوسيط؟', learningPointIds: ['4am_qiraat-wadiyat-ihsaiya_P1', '4am_qiraat-wadiyat-ihsaiya_P2', '4am_qiraat-wadiyat-ihsaiya_P3'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — معرض الكتاب: متوسط واحد ومعرضان مختلفان', learningPointIds: ['4am_qiraat-wadiyat-ihsaiya_P1', '4am_qiraat-wadiyat-ihsaiya_P2'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: المتوسط، المتوسط بالتكرارات، الوسيط، المدى، التواتر، قراءة مخطط بالأعمدة. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'tahaddi', path: `${LESSON_BASE_PATH}/tahaddi`,
      title: 'تحدّ — قسمان ومعدّل واحد', desc: 'خزان لكل مجموعة: راهن على مستوى الماء، افتح الصمام، ثم قارن القسمين (أ) و (ب). الكتاب ص 91.',
      stage: 'trigger', teachesLearningPointIds: ['4am_qiraat-wadiyat-ihsaiya_P2', '4am_qiraat-wadiyat-ihsaiya_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 13, difficulty: 3, actionText: 'أراهن وأفتح الصمام' },
    { id: '02', number: 2, slug: 'aqra', path: `${LESSON_BASE_PATH}/aqra`,
      title: 'أقرأ مخططًا وأترجمه', desc: 'سيارات أمام المدرسة بعد نص «تلوث البيئة»، ثم مخطط القنوات التلفزيونية وعموداه اللذان يجمعان قناتين (التمرين 19).',
      stage: 'discovery', teachesLearningPointIds: ['4am_qiraat-wadiyat-ihsaiya_P1'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'أقرأ' },
    { id: '03', number: 3, slug: 'uqarin', path: `${LESSON_BASE_PATH}/uqarin`,
      title: 'أقارن وأقرّر', desc: 'مدينتان على مدار سنة (التمرين 14)، علامات قسم بعد حذف قيم (التمرين 22)، ثم طريقة: أقرأ، أحسب المؤشرات، أقارن، أقرّر.',
      stage: 'formalization', teachesLearningPointIds: ['4am_qiraat-wadiyat-ihsaiya_P2', '4am_qiraat-wadiyat-ihsaiya_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 4, actionText: 'أقارن' },
    { id: '04', number: 4, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'مدّة استعمال الهاتف، تذاكر الدربي، حملة تنظيف الشاطئ: أحسب، أقارن وأقرّر.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_qiraat-wadiyat-ihsaiya_P2', '4am_qiraat-wadiyat-ihsaiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — فرض الرياضيات في قسمين', desc: 'مسألة الدرس: كل مجموعة من القسم (ب) أفضل، فأيّ القسمين أفضل؟ حلّ كامل خطوة بخطوة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_qiraat-wadiyat-ihsaiya_P1', '4am_qiraat-wadiyat-ihsaiya_P2', '4am_qiraat-wadiyat-ihsaiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — أمطار تيزي وزو', desc: 'عاصفة نوفمبر: أيّ المؤشرين يصف الشهر العادي؟ وماذا يتغيّر إذا حذفناها؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_qiraat-wadiyat-ihsaiya_P1', '4am_qiraat-wadiyat-ihsaiya_P2', '4am_qiraat-wadiyat-ihsaiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — معرض الكتاب', desc: 'معرضان بالمتوسط نفسه: المدى والوسيط يقرّران أين يشارك الناشر.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_qiraat-wadiyat-ihsaiya_P1', '4am_qiraat-wadiyat-ihsaiya_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث: القراءة والترجمة، المقارنة، النمذجة.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 5, difficulty: 3, actionText: 'أدخل التقويم' },
  ],
};
