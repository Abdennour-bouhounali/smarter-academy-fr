/**
 * الدرس 3 — استعمال المجدولات (Excel) لمعالجة وتلخيص معطيات إحصائية وتمثيلها بيانيًا
 * Unité 8 « الإحصاء » du manuel (4AM) : « أستعدّ » item 3 (p. 91), تمارين 7, 15, 16 (p. 99), 23, 24
 * (p. 101, أتعمّق) et la question هـ de l'exercice 1 (p. 98, doublon déclaré). Le manuel n'a pas de معارف sur
 * le tableur : elles sont ÉCRITES PAR LA PLATEFORME (`knowledge_formalization`). Source de vérité :
 * docs/sources/4am/unit8/extraction.json.
 *
 * LE PARCOURS (owner) — quel module porte quelle phase :
 *   M0 أستعدّ                          prérequis (المدى، المتوسط، الوسيط، الفئة الوسيطية، lire un مدرّج, zone d'un secteur)
 *   M1 تمرين 7 — المجدول (trigger)     REAL (une série d'un exercice, une feuille sur l'écran de la salle
 *                                       d'informatique) → MANIPULATE (sheet-lab : saisir, sélectionner, composer,
 *                                       recalculer) → UNDERSTAND (plage, fonction, recalcul ; MOYENNE bouge, MEDIANE reste)
 *   M2 التمثيلات البيانية (discovery)  TOUCH THE MATH : les angles du secteur 144°, 96°, 120° (ex-15), la الفئة
 *                                       الوسيطية et la commande Histogramme (ex-16), les أعمدة d'une série (ex-1 هـ)
 *   M3 معارف (formalization)           FORMALIZE : cellule, plage, دستور, les quatre دساتير, les noms FR/EN, quel graphique
 *   M4 أدوات أخرى (practice_lab)       AUTOMATIZE / TRANSFER : la mémoire de la calculatrice (ex-23), =ALEA() (ex-24)
 *   M5–M7 مسائل (practice_lab)         puis trois « مسائل » de la plateforme (modules 5–7)
 *   M8 إختبار أولي (evaluation)        la seule preuve
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Module 1 — entrée retenue : la feuille du club de maths (labo `sheet-lab`, niveau مبتدئ, par défaut : cinq notes déjà saisies,
 *   la main calcule le مدى et le متوسط dans la colonne C PUIS écrit les deux دساتير : le tableur confirme, et recalcule dès qu'une
 *   cellule change) — le besoin « laisser la machine compter » naît du calcul à la main. Rejetée : le تمرين 7 du manuel étalé d'abord
 *   dans une carte (la série, les questions أ ب جـ ET les quatre دساتير déjà écrits : rien à trouver) ; il reste le niveau متقدم du MÊME
 *   labo et l'APPLICATION des étapes 1–4 (série 4, 10, 8, 4, 3, 2, 4 : calcul à la main, plage A1:G1, دساتير, valeur aberrante), les
 *   consignes du livre n'apparaissant qu'APRÈS la réponse. Ordre : à la main → la plage → pourquoi MOYENNE(A1:F1) ≠ 5 (avec les دساتير
 *   de l'élève) → les quatre دساتير du livre → « la moyenne bouge, la médiane reste » (prédite d'abord).
 *   Module 3 (معارف) : la question d'abord (associer indicateur ↔ دستور, donnée ↔ graphique), les boîtes APRÈS la réponse.
 *   Module 4 (أتعمّق) : la brique de la mémoire de la calculatrice APRÈS le 1er exercice. Modules 0, 2, 5–8 : inchangés.
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/tanasubiya_duwal/majdulat-ihsaiya';

export const LESSON_CONFIG = {
  id: 'majdulat-ihsaiya',
  kind: 'lesson',
  unit: 'ihsa',
  unitTitle: 'الإحصاء',
  sequentialUnlock: true,
  title: 'استعمال المجدولات (Excel) لمعالجة وتلخيص معطيات إحصائية وتمثيلها بيانيًا',
  description: 'حجز سلسلة إحصائية في مجدول وحفظها، حساب مؤشراتها بالدساتير المدمجة: المدى \u2066=MAX()-MIN()\u2069 ، الوسيط \u2066=MEDIANE()\u2069 ، المتوسط \u2066=MOYENNE()\u2069 ، المنوال \u2066=MODE()\u2069 ، وإنشاء التمثيل البياني المناسب للمعطيات (المدرّج التكراري، المخطط الدائري، مخطط الأعمدة).',
  level: 'moyen',
  grade: '4am',
  chapter: 'tanasubiya_duwal',
  chapterTitle: 'ميدان التناسبية والدوال',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '📊',
  estimatedDurationMin: 45,
  textbookRef: { unit: 8, activity: 7, pages: '91, 98, 99, 101' },
  skills: [
    'حجز سلسلة إحصائية في خلايا مجدول وحفظها، وتسمية خلية ومجال (\u2066A1:G1\u2069)',
    'كتابة دستور يبدأ بـ « ⁦=⁩ » لحساب المدى والوسيط والمتوسط والمنوال، والتحقق به من حساب باليد',
    'معرفة أنّ المجدول يعيد الحساب عندما تتغيّر خلية، وأنّ القيمة الكبيرة جدًّا تحرّك المتوسط لا الوسيط',
    'اختيار التمثيل البياني المناسب للمعطيات (أعمدة، دائري، مدرّج) وحساب زوايا مخطط دائري',
  ],
  teachingScope: {
    include: [
      'تمرين 7 (مصحَّح): حجز السلسلة 4 ، 10 ، 8 ، 4 ، 3 ، 2 ، 4 في \u2066A1:G1\u2069 والدساتير الأربعة في B2 ← B5',
      'تمرين 15: نفايات الشاطئ، المخطط الدائري وزواياه 144° ، 96° ، 120°',
      'تمرين 16: الفئة الوسيطية والطلبية Histogramme في جيوجيبرا',
      'تمرين 1 هـ: مخطط الأعمدة لدرجات الحرارة في المجدول',
      'تمرينا 23 و 24: ذاكرة الحاسبة، والدستور \u2066=ALEA()\u2069',
    ],
    exclude: [
      'تعريف المدى والوسيط والمتوسط وطرائق حسابها — الدرس 2',
      'التكرار المجمع والتواتر — الدرس 1',
      'تنسيق الخلايا، الدوال الشرطية، الجداول المحورية',
    ],
  },
  // « مسألة الدرس » (MASAIL_GENERATION_GUIDE.md) : le monde du sheet-lab متقدم (une série dans la ligne 1,
  // quatre دساتير en B2 ← B5), d'autres nombres ; montrée au sommaire et au module 1, résolue au module 5.
  lessonProblem: {
    module: 5,
    title: 'مسابقة الرقن: تسعة مشاركين في مجدول',
    statement: 'في نادي الإعلام الآلي بالمتوسطة، وفيه 16 حاسوبًا، نُظّمت يوم الخميس مسابقة في الرقن على لوحة المفاتيح تشجيعًا على الاجتهاد وإتقان المهارة. حجز الأستاذ عدد الكلمات التي رقنها كل واحد من المشاركين التسعة في دقيقة واحدة، في السطر الأول من مجدول بدءًا من الخلية A1 ، قيمة في كل خلية: 28 ، 35 ، 22 ، 33 ، 40 ، 31 ، 35 ، 26 ، 38 . ثم حجز في الخلايا B2 ، B3 ، B4 ، B5 دساتير المدى والوسيط والمتوسط والمنوال، بالترتيب، على مجال السلسلة كاملة. يمنح النادي، تقديرًا للمجتهدين، شهادة لكل مشارك يفوق عدد كلماته متوسط السلسلة.',
    // Le support de la مسألة 1, montré aussi par la carte « مسألة الدرس » (une seule source).
    table: {
      caption: 'السطر الأول من المجدول: عدد الكلمات في دقيقة',
      sheet: true, // grille de tableur : de gauche à droite (ProblemTable)
      head: ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
      rows: [['1', '28', '35', '22', '33', '40', '31', '35', '26', '38']],
    },
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Les acquis que « أستعدّ » diagnostique : lire une représentation (item 3 du manuel), المدى, المتوسط,
  // الوسيط, الفئة الوسيطية (leçon mada-wasit-mutawassit), la zone d'un secteur circulaire (années précédentes).
  priorKnowledge: ['qiraat-tamthil', 'mada-silsila', 'mutawassit-silsila', 'wasit-silsila', 'fia-wasitiya', 'zawiya-qita'],
  resources: [
    // Le module 1 ouvre sur LE MAJDOUL (sheet-lab). مبتدئ = cinq notes d'une mini-مسابقة du club de maths, déjà
    // saisies, deux دساتير ; متقدم (ouvert par défaut) = تمرين 7 corrigé : saisir, quatre دساتير, puis les
    // graphiques (ex-15, ex-16).
    {
      kind: 'manipulation', code: 'sheet-lab-quiz-5', type: 'sheet-lab', module: 1,
      level: 'beginner',
      title: 'مجدول: نقاط خمسة أصدقاء في مسابقة القسم',
      objective: 'الدستور (=…) يحسب مؤشّرًا على مجال من الخلايا ويُعاد حسابه وحده عندما تتغيّر خلية؛ مجال ناقص أو دالة غير مناسبة يعطيان عددًا آخر',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'sheet' },
      learningPointIds: ['4am_majdulat-ihsaiya_P2'],
      sourceElementIds: ['ex-7'],
    },
    {
      kind: 'manipulation', code: 'sheet-lab-ex7', type: 'sheet-lab', module: 1,
      level: 'advanced',
      title: 'تمرين 7: السلسلة 4، 10، 8، 4، 3، 2، 4 في مجدول',
      objective: 'الدستور (=…) يحسب مؤشّرًا على مجال من الخلايا ويُعاد حسابه وحده عندما تتغيّر خلية؛ مجال ناقص أو دالة غير مناسبة يعطيان عددًا آخر',
      autonomy: 'السلسلة غير محجوزة: التلميذ يحجزها ويحفظ الملف، يكتب أربعة دساتير دون نموذج (الدالة والمجال من اختياره) بعد حسابه باليد، يرى قيمة كبيرة جدًّا تحرّك المتوسط لا الوسيط، ثم يختار بنفسه تمثيلًا بيانيًا لكل جدول من ثلاثة',
      experience: { type: 'textbook', reason: '', theme: 'sheet' },
      learningPointIds: ['4am_majdulat-ihsaiya_P1', '4am_majdulat-ihsaiya_P2', '4am_majdulat-ihsaiya_P3'],
      sourceElementIds: ['ex-7', 'ex-15', 'ex-16'],
    },
    // Les trois « مسائل » (content/problems.js), avant le test.
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — مسابقة الرقن: تسعة مشاركين في مجدول', learningPointIds: ['4am_majdulat-ihsaiya_P1', '4am_majdulat-ihsaiya_P2'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — أطوال التلاميذ في حصة التربية البدنية', learningPointIds: ['4am_majdulat-ihsaiya_P1', '4am_majdulat-ihsaiya_P2'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — محلّ الأحذية الرياضية: مبيعات ستة أشهر', learningPointIds: ['4am_majdulat-ihsaiya_P2', '4am_majdulat-ihsaiya_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ستّ عبارات: قراءة مدرّج تكراري، المدى، المتوسط، الوسيط، الفئة الوسيطية، زاوية قطاع. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'majdul', path: `${LESSON_BASE_PATH}/majdul`,
      title: 'تمرين 7 — المجدول', desc: 'احجز السلسلة في مجدول، احسب باليد ثم تأكّد بالدساتير، حدّد المجال بيدك، وغيّر قيمة لترى المجدول يعيد الحساب.',
      stage: 'trigger', teachesLearningPointIds: ['4am_majdulat-ihsaiya_P1', '4am_majdulat-ihsaiya_P2'],
      color: 'emerald', style: 'featured', estimatedMin: 13, difficulty: 2, actionText: 'أفتح المجدول' },
    { id: '02', number: 2, slug: 'tamthilat', path: `${LESSON_BASE_PATH}/tamthilat`,
      title: 'التمثيلات البيانية', desc: 'نفايات الشاطئ في مخطط دائري (144° ، 96° ، 120°)، مدرّج تكراري بجيوجيبرا، ومخطط أعمدة لدرجات الحرارة.',
      stage: 'discovery', teachesLearningPointIds: ['4am_majdulat-ihsaiya_P3'],
      color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أختار التمثيل' },
    { id: '03', number: 3, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف', desc: 'الخلية والمجال، الدستور، دساتير المؤشّرات الأربعة وأسماؤها بالفرنسية والإنجليزية، والتمثيل المناسب لكل معطيات.',
      stage: 'formalization', teachesLearningPointIds: ['4am_majdulat-ihsaiya_P1', '4am_majdulat-ihsaiya_P2', '4am_majdulat-ihsaiya_P3'],
      color: 'violet', style: 'featured', estimatedMin: 6, difficulty: 2, actionText: 'أتعلّم' },
    { id: '04', number: 4, slug: 'adawat', path: `${LESSON_BASE_PATH}/adawat`,
      title: 'أدوات أخرى — أتعمّق', desc: 'تمرين 23: متوسط بذاكرة الحاسبة؛ تمرين 24: سلسلة عشوائية من 50 عددًا بالدستور \u2066=ALEA()\u2069.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_majdulat-ihsaiya_P2'],
      color: 'amber', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — مسابقة الرقن', desc: 'مسألة الدرس: تسعة مشاركين في مجدول، أربعة دساتير، دستور زميل ناقص وصفر زائد. حلّ كامل خطوة بخطوة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_majdulat-ihsaiya_P1', '4am_majdulat-ihsaiya_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — أطوال التلاميذ', desc: 'ثلاثة عشر طولًا في عمود: دستور المتوسط، تلميذ جديد خارج المجال، والوسيط لاختيار الفريق.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_majdulat-ihsaiya_P1', '4am_majdulat-ihsaiya_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — محلّ الأحذية الرياضية', desc: 'مبيعات ستة أشهر: المتوسط والمنوال، التمثيل المناسب وزاوية قطاع، ومدخول السداسي.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_majdulat-ihsaiya_P2', '4am_majdulat-ihsaiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 5, difficulty: 3, actionText: 'أدخل التقويم' },
  ],
};
