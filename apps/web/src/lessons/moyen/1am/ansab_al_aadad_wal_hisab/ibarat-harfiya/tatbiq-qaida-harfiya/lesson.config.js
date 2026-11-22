/**
 * الدرس — تطبيق قاعدة حرفية (1AM, unité 6 « الحساب الحرفي »). Le DEUXIÈME درس de l'unité généré (ordre 25 du catalogue), généré DANS son entrée du catalogue (item 1am.m5.r08),
 * cycle moyen phase 3, 1AM paire 3 B, 2026-10-30. Manuel 1AM (الجيل الثاني) : نشاط 2 p. 79 (اختبار روفيي), نشاط 4 p. 80 (المثال المضاد), أحوصل تعلّماتي 1 et 2 p. 81, تطبيق قاعدة حرفية ex. 4–6 p. 83,
 * أتعمّق 5 p. 86, استعمل تكنولوجيات الإعلام والاتصال p. 88. Le manuel n'a pas de طريقة pour cette leçon : le module 3 est une plateforme-addition. Source : docs/sources/1am/unit6/extraction.json.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours, et la leçon ne renvoie jamais au livre (§4ter-bis) : tout est réécrit, autres contextes, autres nombres.
 *   Entrée retenue : une papeterie-photocopie (labo `letter-dial`, thème `copyshop`). La règle du prix « الثمن = 5 × n + 20 » est imprimée avec sa lettre ; la main TOURNE le cadran de n et LA VALEUR TOMBE dans CHAQUE fente de la lettre,
 *   la carte calcule (5 × 12 + 20 = 60 + 20 = 80, jamais « 512 »). مبتدئ : b1 douze feuilles ; b2 le client qui a payé 95 (n = 15) ; b3 la règle de la semaine « 5 × n + 20 − n » où n est écrit DEUX fois (10 donne 60).
 *   متقدم : a1 la clôture « P = 2 × (a + b) » avec DEUX cadrans (15 et 8 donnent 46) ; a2 les valeurs échangées (8 et 15) donnent le même périmètre ; a3 la prétendue règle « a + b = a × b » qui tient pour (2 ; 2) (4 = 4) :
 *   les cadrans cherchent UN contre-exemple (3 ; 4 donnent 7 ≠ 12). Le périmètre et l'aire d'un rectangle (`1am.m2.r08`, enseignés plus tard par la géométrie) n'apparaissent que dans une carte « تذكّر » et comme règle PRÉSENTÉE : rien n'est construit.
 *   Rejetées : (a) le test de Ruffier du manuel (`act-2`, une règle médicale à trois lettres) comme ENTRÉE : la main ne tient rien, on remplit un tableau ; il devient une APPLICATION (les points d'un classement) ;
 *   (b) la règle « F + 2 = S » du manuel sur les faces et les sommets (`act-4`) : le contre-exemple est le cœur du labo (a3) avec des NOMBRES, et l'objet d'une application sur « ضعف أيّ عدد أكبر منه » ;
 *   (c) le chiffre collé (« 2x = 23 ») n'est jamais montré comme juste : il est la réfutation d'un distracteur.
 *   Ordre des idées : une valeur dans une fente (P2) → une valeur à trouver (P2) → la lettre écrite deux fois (P2) → deux lettres et les parenthèses (P2) → une prétendue règle réfutée par un contre-exemple (P3) → معارف (les noms : la lettre,
 *   le signe × omis, la règle littérale, l'application en tout endroit, le contre-exemple ; P1) → طريقة (écrire, placer les valeurs, calculer par priorités, répondre) → أتمرّن → trois مسائل → إختبار أولي.
 *   « أستعدّ » mesure `1am.m2.r08` (le périmètre et l'aire d'un rectangle, acquis du primaire : items 5–6, le SEUL item que le réseau place avant r08), `1am.m1.r05` (additionner, soustraire, multiplier des décimaux : items 1–2, ajout de la carte :
 *   les valeurs substituées sont décimales) et l'ordre des opérations (items 3–4, `prerequisites` du catalogue). Aucune arête LP : `1am.m2.r08` n'est pas publié.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/1am/ansab_al_aadad_wal_hisab/tatbiq-qaida-harfiya';

export const LESSON_CONFIG = {
  id: 'tatbiq-qaida-harfiya',
  kind: 'lesson',
  unit: 'ibarat-harfiya',
  unitTitle: 'الحساب الحرفي',
  sequentialUnlock: true,
  title: 'تطبيق قاعدة حرفية',
  description: 'في مكتبة تصوير تحمل لائحة الأسعار قاعدة حرفية: ندير قرصًا فتنزل قيمته في كلّ موضع فيه الحرف وتحسب البطاقة. نطبّق قاعدة الثمن وقاعدة سياج بحرفين، ونختبر قاعدة تدّعي أنّها صحيحة دائمًا فيكفي مثال مضادّ واحد لإسقاطها.',
  level: 'moyen',
  grade: '1am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🎛️',
  estimatedDurationMin: 84,
  textbookRef: { unit: 6, activity: 2, pages: '79, 80, 81, 83, 86, 88' },
  skills: [
    'قراءة عبارة حرفية واصطلاح حذف رمز الضرب مثل $2\\times x=2x$ دون الخلط مع $2\\times 3=6$ لا $23$',
    'تطبيق قاعدة حرفية بتعويض كلّ حرف بقيمته في كلّ موضع ثمّ الحساب بالأولويات',
    'إبراز خطإ قاعدة عامة بمثال مضادّ واحد، وإدراك أنّ الأمثلة التي تصحّ فيها لا تثبت صحّتها',
  ],
  teachingScope: {
    include: ['العبارة الحرفية والقاعدة الحرفية', 'اصطلاح حذف إشارة الضرب (2x ، ab ، 3(x+2))', 'تعويض حرف أو حرفين بقيم عددية طبيعية وعشرية', 'الحرف المكتوب في أكثر من موضع', 'أولوية العمليات والأقواس', 'المثال المضادّ'],
    exclude: ['إنتاج عبارة حرفية من وضعية أو من برنامج حساب (الدرس التالي من الوحدة)', 'كتابة طول بدلالة x (الدرس التالي من الوحدة)', 'حساب محيط مستطيل ومساحته كدرس (درس الهندسة)', 'تبسيط العبارة الحرفية واختزال الحدود المتشابهة (السنة الثالثة)', 'قيم نسبية للحروف (السنة الثالثة)'],
  },
  // « مسألة الدرس » : رحلة إلى الحامّة (module 5).
  lessonProblem: {
    module: 5,
    title: 'رحلة إلى الحامّة',
    statement: 'تنظّم متوسطة الحيّ رحلة إلى حديقة التجارب بالحامّة. تُحسب تكلفة الرحلة بالدينار بالقاعدة ⁦C = 6 000 + 150 × n⁩ حيث n عدد التلاميذ: 6 000 دج كراء الحافلة ثابتة و 150 دج عن كلّ تلميذ. سيرافق التلاميذ 3 أساتذة.',
    questions: [
      { label: '1)', text: 'احسب تكلفة رحلة 24 تلميذًا.' },
      { label: '2)', text: 'احسب تكلفة رحلة 40 تلميذًا.' },
      { label: '3)', text: 'قال أحمد: « إذا تضاعف عدد التلاميذ تضاعفت التكلفة ». اختبر قوله من أجل 24 ثمّ 48 تلميذًا.' },
    ],
    illustration: { kind: 'tags', cards: [
      { title: 'كراء الحافلة', icon: 'bus', lines: [{ label: 'جزء ثابت', value: '6 000', unit: 'دج' }] },
      { title: 'عن كلّ تلميذ', icon: 'person', lines: [{ label: 'يُدفع عنه', value: '150', unit: 'دج' }] },
      { title: 'قول أحمد', icon: 'ticket', lines: [{ label: 'تلاميذ 24 ثمّ', value: '48', unit: 'تلميذًا' }] },
    ], ariaLabel: 'رحلة مدرسية: كراء الحافلة ستّة آلاف دينار ثابتة ومئة وخمسون دينارًا عن كلّ تلميذ ؛ قال أحمد إنّ التكلفة تتضاعف إذا تضاعف عدد التلاميذ من أربعة وعشرين إلى ثمانية وأربعين' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : `1am.m1.r05` (calcul décimal), l'ordre des opérations, et `1am.m2.r08` (périmètre et aire d'un rectangle : acquis du primaire).
  priorKnowledge: ['jam-tarh-darb-ashriya-1am', 'awlawiyat-amaliyat-1am', 'muhit-masaha-mustatil-1am'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `letter-dial` (la main tourne un cadran par lettre), monde `copyshop` :
    //   مبتدئ — b1 « 5 × n + 20 » avec n = 12 (80) · b2 le client qui a payé 95 (n = 15) · b3 « 5 × n + 20 − n » avec n = 10 (60 : n est écrit deux fois).
    //   متقدم — a1 « P = 2 × (a + b) » avec 15 et 8 (46) · a2 les valeurs échangées (46) · a3 la prétendue règle « a + b = a × b » : (2 ; 2) tient (4 = 4), un seul contre-exemple la réfute.
    {
      kind: 'manipulation', code: 'letter-dial-apply', type: 'letter-dial', module: 1,
      level: 'beginner',
      title: 'مكتبة التصوير: قرص الحروف',
      objective: 'ندير قرصًا لكلّ حرف في قاعدة فتنزل قيمته في كلّ موضع فيه الحرف وتحسب البطاقة، ثمّ نختبر قاعدة تدّعي أنّها صحيحة دائمًا',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'copyshop' },
      learningPointIds: ['1am_tatbiq-qaida-harfiya_P1', '1am_tatbiq-qaida-harfiya_P2', '1am_tatbiq-qaida-harfiya_P3'],
      sourceElementIds: ['act-2', 'act-4'],
    },
    {
      kind: 'manipulation', code: 'letter-dial-counter', type: 'letter-dial', module: 1,
      level: 'advanced',
      title: 'مكتبة التصوير: حرفان ومثال مضادّ',
      objective: 'ندير قرصًا لكلّ حرف في قاعدة فتنزل قيمته في كلّ موضع فيه الحرف وتحسب البطاقة، ثمّ نختبر قاعدة تدّعي أنّها صحيحة دائمًا',
      autonomy: 'يطبّق التلميذ قاعدة سياج بحرفين دون أن تُسمّى له الأولويات، ثمّ يبحث بنفسه عن قيمتين تُسقطان قاعدة « a + b = a × b » التي صحّت من أجل 2 و 2',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'copyshop' },
      learningPointIds: ['1am_tatbiq-qaida-harfiya_P1', '1am_tatbiq-qaida-harfiya_P2', '1am_tatbiq-qaida-harfiya_P3'],
      sourceElementIds: ['act-4', 'know-2'],
    },
    // Module 3 — le MÊME instrument posé seul (`levels={false}`) : deux tâches de la méthode (4 × n + 15 avec n = 9 ; « 2a = a + 2 » à réfuter).
    {
      kind: 'manipulation', code: 'letter-dial-method', type: 'letter-dial', module: 3,
      title: 'أطبّق قاعدة وأتحقّق',
      learningPointIds: ['1am_tatbiq-qaida-harfiya_P2', '1am_tatbiq-qaida-harfiya_P3'],
      sourceElementIds: ['know-2'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — رحلة إلى الحامّة', learningPointIds: ['1am_tatbiq-qaida-harfiya_P2', '1am_tatbiq-qaida-harfiya_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — حديقتان وسياج', learningPointIds: ['1am_tatbiq-qaida-harfiya_P2'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — متجرا الدفاتر', learningPointIds: ['1am_tatbiq-qaida-harfiya_P2', '1am_tatbiq-qaida-harfiya_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ حساب عشري وأولوية العمليات ومحيط مستطيل ومساحته.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — قرص الحروف', desc: 'قاعدة سعر في مكتبة تصوير: أدير القرص فتنزل قيمته في كلّ موضع فيه الحرف، وأختبر قاعدة تدّعي أنّها صحيحة دائمًا.',
      stage: 'trigger', teachesLearningPointIds: ['1am_tatbiq-qaida-harfiya_P1', '1am_tatbiq-qaida-harfiya_P2', '1am_tatbiq-qaida-harfiya_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 1, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — العبارة والقاعدة الحرفية', desc: 'ما العبارة الحرفية، وكيف نحذف إشارة الضرب، وما القاعدة الحرفية، وكيف نطبّقها، ولماذا يكفي مثال مضادّ واحد.',
      stage: 'discovery', teachesLearningPointIds: ['1am_tatbiq-qaida-harfiya_P1', '1am_tatbiq-qaida-harfiya_P2', '1am_tatbiq-qaida-harfiya_P3'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أطبّق قاعدة', desc: 'أكتب العبارة، أضع القيم في كلّ موضع، أحسب بالأولويات ثمّ أجيب: أربعة أفعال.',
      stage: 'formalization', teachesLearningPointIds: ['1am_tatbiq-qaida-harfiya_P2', '1am_tatbiq-qaida-harfiya_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'نقاط فريق، عبارات بحرف أو حرفين، سرعة، اصطلاحات الكتابة، مجدول، ومثال مضادّ.',
      stage: 'practice_lab', teachesLearningPointIds: ['1am_tatbiq-qaida-harfiya_P1', '1am_tatbiq-qaida-harfiya_P2', '1am_tatbiq-qaida-harfiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — رحلة إلى الحامّة', desc: 'مسألة الدرس: قاعدة تكلفة بجزء ثابت، ثمّ هل تتضاعف التكلفة؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_tatbiq-qaida-harfiya_P2', '1am_tatbiq-qaida-harfiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — حديقتان وسياج', desc: 'قاعدة السياج لحديقتين مختلفتي البعدين وثمن الشبك.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_tatbiq-qaida-harfiya_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — متجرا الدفاتر', desc: 'قاعدتا سعر تتساويان في مثال: هل تتساويان دائمًا؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_tatbiq-qaida-harfiya_P2', '1am_tatbiq-qaida-harfiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
