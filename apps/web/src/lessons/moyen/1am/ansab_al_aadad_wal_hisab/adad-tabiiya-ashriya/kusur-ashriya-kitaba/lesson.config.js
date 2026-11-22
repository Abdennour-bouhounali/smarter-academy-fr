/**
 * الدرس — الكسور العشرية والكتابة العشرية (1AM, unité 1 « الأعداد الطبيعية والأعداد العشرية »). Le DEUXIÈME درس de l'unité,
 * généré DANS son entrée du catalogue (items 1am.m1.r02, 1am.m5.x1, 1am.m1.r03, 1am.m5.r03), cycle moyen phase 3, batch 4,
 * 2026-10-15 — APRÈS `kitabat-adad-tabii` (même item 1am.m1.r02, frontière dans l'en-tête de
 * docs/sources/1am/unit1/build-extraction.py : les entiers et les rangs là-bas, ici le كسر عشري, l'écriture à virgule, le مفكوك d'un
 * décimal, « عدد الأعشار » et × ÷ 10, 100, 1000). Manuel 1AM (الجيل الثاني) : نشاط 2 et 3 pp. 9–10, معارف 2, 3 et 4 (b) pp. 11–13,
 * طريقة 1 et 2 pp. 12 et 14 avec « دوري الآن », exercices 4–14 p. 17 et 26–28 p. 18, أقوّم 2–6 et 13 p. 19, استحضر مكتسباتي items 7–9 p. 8.
 * Source : docs/sources/1am/unit1/extraction.json ; brief des auteurs : docs/sources/1am/unit1/brief-authors.md (« Lesson 2 »).
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours, et la leçon ne renvoie jamais au livre
 * (§4ter-bis) : tout est réécrit, autres contextes, autres nombres.
 *   Entrée retenue : l'atelier de zellige (labo `decimal-comma`, monde `mosaic`). Le bon de commande n'a que des CHIFFRES (2 3 5) ; la
 *   main tient la VIRGULE ; la table du client montre 2 panneaux, 3 bandes et 5 carreaux. Les mêmes chiffres font 235 panneaux, 23,5,
 *   2,35 ou 0,235 selon la virgule : c'est là que le كسر عشري (un nombre de pièces égales de plus en plus petites), l'écriture à
 *   virgule et le nombre de chiffres = nombre de zéros deviennent NÉCESSAIRES sous la main. Le monde `machine` (×10 … ÷1000) est le
 *   même geste : glisser la virgule.
 *   Rejetées : (a) le نشاط 2 du manuel comme entrée (trois rectangles coloriés et « هل توافقه؟ » posés avant tout geste, questions
 *   auxquelles on répond de mémoire) — il devient une APPLICATION en أتمرّن ; (b) une règle graduée qu'on zoome (c'est le terrain de la
 *   leçon suivante de l'unité, la demi-droite graduée) ; (c) les dinars et les centimes (déjà dans « معنى الجمع والطرح », et ils
 *   s'arrêtent aux centièmes).
 *   Ordre des idées : la virgule déplace la quantité (235 / 23,5 / 2,35 / 0,235) → les pièces : 3 bandes = 30 carreaux (P1) → le
 *   nombre de carreaux dans 2,35 : 235/100 (P2) → le zéro de 0,05 qui garde la place → معارف : les noms, le مفكوك 2 + 3/10 + 5/100
 *   (P3), le zéro final inutile → طريقة : 31,25 ↔ 3125/100 → la virgule glisse : × ÷ 10, 100, 1000 (P4, labo `machine`) → أتمرّن
 *   (les activités du manuel posées en application) → trois مسائل → إختبار أولي.
 *   « أستعدّ » mesure `1am.m5.r01` (une figure à parts égales, un kasr plus grand que 1) et `1am.m1.r05` (additionner et soustraire des
 *   décimaux), puis les rangs et « عدد العشرات » du primaire (kitabat-adad-tabii).
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/1am/ansab_al_aadad_wal_hisab/kusur-ashriya-kitaba';

export const LESSON_CONFIG = {
  id: 'kusur-ashriya-kitaba',
  kind: 'lesson',
  unit: 'adad-tabiiya-ashriya',
  unitTitle: 'الأعداد الطبيعية والأعداد العشرية',
  sequentialUnlock: true,
  title: 'الكسور العشرية والكتابة العشرية',
  description: 'في ورشة الزليج نحرّك الفاصلة فنكتشف أنّ الأرقام نفسها تصنع مقادير مختلفة: الكسر العشري عدّ لقطع متساوية أصغر فأصغر، وعدد الأرقام بعد الفاصلة هو عدد أصفار مقامه، وإزاحة الفاصلة تضرب في 10 أو تقسم عليه.',
  level: 'moyen',
  grade: '1am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🧩',
  estimatedDurationMin: 85,
  textbookRef: { unit: 1, activity: 2, pages: '8, 9, 10, 11, 12, 13, 14, 17, 18, 19' },
  skills: [
    'التعرّف على الكسر العشري والتعبير عن جزء من الوحدة، أو عن كمية أكبر منها، بالأجزاء من عشرة، من مائة، من ألف، وكتابته بكتابات متساوية مثل $\\frac{3}{10}=\\frac{30}{100}$',
    'الانتقال من الكتابة العشرية لعدد عشري إلى كتابته على شكل كسر عشري، والعكس، مثل $31{,}25=\\frac{3125}{100}$ (عدد الأرقام بعد الفاصلة هو عدد أصفار المقام)، وحذف الأصفار غير الضرورية',
    'كتابة عدد عشري على شكل مجموع عدد طبيعي وكسور عشرية (مفكوكه النموذجي) مثل $2{,}35=2+\\frac{3}{10}+\\frac{5}{100}$ ، وإعطاء الكتابة العشرية لمجموع كهذا ولو كانت حدوده غير مرتّبة، وتعيين عدد الأعشار أو الأجزاء من مائة في عدد عشري',
    'ضرب عدد عشري في 10 أو 100 أو 1000 (أو في 0,1 أو 0,01 أو 0,001) أو قسمته عليها بإزاحة الفاصلة، مع كتابة الأصفار عند اللزوم',
  ],
  teachingScope: {
    include: ['الكسر العشري: الأجزاء من عشرة، من مائة، من ألف', 'الانتقال بين الكتابة العشرية والكسر العشري', 'المفكوك النموذجي لعدد عشري وعدد الأعشار', 'الأصفار غير الضرورية', 'الضرب في 10 و100 و1000 والقسمة عليها'],
    exclude: ['قراءة وكتابة الأعداد الطبيعية ورقم المرتبة وعدد وحداتها (درس «كتابة الأعداد الطبيعية ودلالة الأرقام»)', 'مقارنة الأعداد العشرية وترتيبها (الدرس الموالي)', 'تمثيل الأعداد العشرية على مستقيم مدرّج (درس لاحق)', 'اختزال الكسور (درس «الكتابات الكسرية لحاصل قسمة واختزال كسر»)', 'القسمة العشرية والقيمة المقرّبة (درس لاحق من وحدة القسمة)'],
  },
  // « مسألة الدرس » : le sens du كسر عشري, le مفكوك et × 10, dans la même histoire (module 6).
  lessonProblem: {
    module: 6,
    title: 'حبل ساحة المدرسة',
    statement: 'اشترى نادي الرياضة حبلاً ملوّنًا طوله 4,075 مترًا لتزيين ساحة المدرسة في يوم الجري، وتبرّع به صاحب مكتبة الحيّ. طلب الحرفيّ ثمن الحبل 480 دج بعدما خفّض السعر لأنّ الغاية تربوية.',
    questions: [
      { label: '1)', text: 'اكتب طول الحبل على شكل كسر عشري.' },
      { label: '2)', text: 'اكتب طوله على شكل مجموع عدد طبيعي وكسور عشرية.' },
      { label: '3)', text: 'يحتاج النادي إلى 10 حبال مثله. ما الطول الكلي؟' },
    ],
    illustration: { kind: 'tags', cards: [{ title: 'الحبل', icon: 'tile', lines: [{ label: 'الطول', value: '4,075', unit: 'م' }] }], ariaLabel: 'بطاقة الحبل: طوله 4,075 مترا' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : la fraction d'une figure à parts égales et une fraction plus grande que 1 (item du réseau
  // `1am.m5.r01`), l'addition / la soustraction de décimaux (`1am.m1.r05`), les rangs et « عدد العشرات » (primaire, kitabat-adad-tabii).
  priorKnowledge: ['kasr-juz-ibtidai', 'jam-tarh-ashriya', 'maratib-ibtidai'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `decimal-comma` (la main tient la VIRGULE), monde `mosaic` :
    //   مبتدئ — l'atelier de zellige (plateforme) : les chiffres 2 3 5 / 3 7 / 0 5 et la table du client.
    //   متقدم — le bon est un كسر عشري (3125/1000, 605/100), puis le zéro final de 2,50 = 2,5.
    {
      kind: 'manipulation', code: 'decimal-comma-mosaic', type: 'decimal-comma', module: 1,
      level: 'beginner',
      title: 'ورشة الزليج: أين نضع الفاصلة؟',
      objective: 'الأرقام نفسها تصنع مقادير مختلفة حسب موضع الفاصلة، وكل رقم يعدّ قطعًا أصغر بعشر مرّات من الرقم الذي على يساره، وعدد الأرقام بعد الفاصلة هو عدد أصفار مقام الكسر العشري',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'mosaic' },
      learningPointIds: ['1am_kusur-ashriya-kitaba_P1', '1am_kusur-ashriya-kitaba_P2'],
      sourceElementIds: ['act-2', 'act-3'],
    },
    {
      kind: 'manipulation', code: 'decimal-comma-fraction', type: 'decimal-comma', module: 1,
      level: 'advanced',
      title: 'ورشة الزليج: من الكسر العشري إلى الفاصلة',
      objective: 'الأرقام نفسها تصنع مقادير مختلفة حسب موضع الفاصلة، وكل رقم يعدّ قطعًا أصغر بعشر مرّات من الرقم الذي على يساره، وعدد الأرقام بعد الفاصلة هو عدد أصفار مقام الكسر العشري',
      autonomy: 'يحرّك التلميذ الفاصلة بنفسه حتى يطابق مقدارُ الوصل كسرًا عشريًا معطى، ويتحقّق من عدد الأرقام بعد الفاصلة وعدد أصفار المقام',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'mosaic' },
      learningPointIds: ['1am_kusur-ashriya-kitaba_P2', '1am_kusur-ashriya-kitaba_P3'],
      sourceElementIds: ['act-3'],
    },
    // Module 4 — le MÊME instrument, monde `machine` : la virgule glisse sous les chiffres (× ÷ 10, 100, 1000, 0,1 …).
    {
      kind: 'manipulation', code: 'decimal-comma-machine-beginner', type: 'decimal-comma', module: 4,
      level: 'beginner',
      title: 'آلة العشرة: ×10 و×100 و÷10 و÷100',
      objective: 'الضرب في 10 أو 100 أو 1000 يزيح الفاصلة نحو اليمين، والقسمة عليها تزيحها نحو اليسار، مع أصفار تملأ المراتب الجديدة، والضرب في 0,1 أو 0,01 يقسم على 10 أو 100',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'mosaic' },
      learningPointIds: ['1am_kusur-ashriya-kitaba_P4'],
      sourceElementIds: ['method-2'],
    },
    {
      kind: 'manipulation', code: 'decimal-comma-machine-advanced', type: 'decimal-comma', module: 4,
      level: 'advanced',
      title: 'آلة العشرة: ×1000 و÷1000 و×0,1 و×0,01',
      objective: 'الضرب في 10 أو 100 أو 1000 يزيح الفاصلة نحو اليمين، والقسمة عليها تزيحها نحو اليسار، مع أصفار تملأ المراتب الجديدة، والضرب في 0,1 أو 0,01 يقسم على 10 أو 100',
      autonomy: 'يختار التلميذ بنفسه موضع الفاصلة والأصفار المضافة لكل آلة، من 3 مراتب إلى 3 مراتب',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'mosaic' },
      learningPointIds: ['1am_kusur-ashriya-kitaba_P4'],
      sourceElementIds: ['method-2', 'now-14'],
    },
    { kind: 'situation', code: 'masala-1', module: 6, title: 'مسألة الدرس — حبل ساحة المدرسة', learningPointIds: ['1am_kusur-ashriya-kitaba_P1', '1am_kusur-ashriya-kitaba_P3', '1am_kusur-ashriya-kitaba_P4'] },
    { kind: 'situation', code: 'masala-2', module: 7, title: 'مسألة — أنابيب المخبر', learningPointIds: ['1am_kusur-ashriya-kitaba_P2', '1am_kusur-ashriya-kitaba_P3', '1am_kusur-ashriya-kitaba_P4'] },
    { kind: 'situation', code: 'masala-3', module: 8, title: 'مسألة — دفاتر التعاونية', learningPointIds: ['1am_kusur-ashriya-kitaba_P2', '1am_kusur-ashriya-kitaba_P4'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ الكسور، جمع العشريين، المراتب.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — ورشة الزليج', desc: 'الأرقام نفسها، فاصلة تتحرّك: ماذا يصنع الحرفيّ؟',
      stage: 'trigger', teachesLearningPointIds: ['1am_kusur-ashriya-kitaba_P1', '1am_kusur-ashriya-kitaba_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 13, difficulty: 1, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — الكسر العشري والكتابة العشرية', desc: 'الأعشار والأجزاء من مائة وألف، المفكوك النموذجي، والأصفار غير الضرورية.',
      stage: 'discovery', teachesLearningPointIds: ['1am_kusur-ashriya-kitaba_P1', '1am_kusur-ashriya-kitaba_P2', '1am_kusur-ashriya-kitaba_P3'],
      color: 'violet', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — من الكتابة العشرية إلى الكسر العشري وبالعكس', desc: '31,25 و 9345/1000: نعدّ الأرقام ونعدّ الأصفار.',
      stage: 'formalization', teachesLearningPointIds: ['1am_kusur-ashriya-kitaba_P2'],
      color: 'emerald', style: 'featured', estimatedMin: 7, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'tariqa-ashara', path: `${LESSON_BASE_PATH}/tariqa-ashara`,
      title: 'طريقة — الضرب في 10 و100 و1000 والقسمة عليها', desc: 'آلة العشرة: الفاصلة تنزلق والأرقام تبقى.',
      stage: 'formalization', teachesLearningPointIds: ['1am_kusur-ashriya-kitaba_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '05', number: 5, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'أجزاء ملوّنة، من الكسر إلى الفاصلة، مفكوك عدد، الضرب والقسمة على 10 و100 و1000.',
      stage: 'practice_lab', teachesLearningPointIds: ['1am_kusur-ashriya-kitaba_P1', '1am_kusur-ashriya-kitaba_P2', '1am_kusur-ashriya-kitaba_P3', '1am_kusur-ashriya-kitaba_P4'],
      color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتدرّب' },
    { id: '06', number: 6, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — حبل ساحة المدرسة', desc: 'مسألة الدرس: كسر عشري، مفكوك، وعشرة حبال.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_kusur-ashriya-kitaba_P1', '1am_kusur-ashriya-kitaba_P3', '1am_kusur-ashriya-kitaba_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — أنابيب المخبر', desc: 'حجوم بالأعشار وأجزاء المائة والألف.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_kusur-ashriya-kitaba_P2', '1am_kusur-ashriya-kitaba_P3', '1am_kusur-ashriya-kitaba_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — دفاتر التعاونية', desc: 'كتل وأسعار: الضرب والقسمة على 100 و1000.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_kusur-ashriya-kitaba_P2', '1am_kusur-ashriya-kitaba_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '09', number: 9, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الأربع.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
