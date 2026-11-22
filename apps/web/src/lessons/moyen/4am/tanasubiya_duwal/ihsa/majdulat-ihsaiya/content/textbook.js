/**
 * Le contenu du MANUEL pour le درس 3 « استعمال المجدولات (Excel) لمعالجة وتلخيص معطيات إحصائية وتمثيلها
 * بيانيًا » (unité 8 « الإحصاء », pp. 91–101) — données pures, au mot près, chaque bloc citant son élément
 * de docs/sources/4am/unit8/extraction.json : « أستعدّ » item 3 (p. 91), تمارين 7, 15, 16 (p. 99), 23, 24
 * (p. 101) et la question هـ de l'exercice 1 (p. 98, `duplicatedIn` majdulat-ihsaiya · 2).
 *
 * Le manuel n'a PAS de معارف sur le tableur : la feuille, les cellules, la plage, le دستور et le choix du
 * graphique sont ÉCRITS PAR LA PLATEFORME (`knowledge_formalization`) avec les mots des exercices
 * (« احجز في الخلية B2 الدستور … ثم انقر على ENTER », « حدّد الخلايا »).
 *
 * RÈGLE RTL DES دساتير (établie ici) : un دستور est du code latin LTR. Dans une chaîne (énoncé, explication,
 * option), il est isolé par `xl()` (LRI … PDI, invisible) — jamais en `$…$` (KaTeX) ; dans du JSX, le
 * composant `components/Dustur.jsx` le rend en `<code dir="ltr">`.
 *
 * UNE coquille du manuel est CORRIGÉE (décision du propriétaire), avec UNE ligne discrète : تمرين 7 (la
 * capture d'écran porte 5, 10, 10, 8, 4, 3, 2 et les quatre دساتير vont dans la même cellule B2).
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** Un دستور dans une phrase arabe : isolé de gauche à droite (LRI … PDI). */
export const xl = (f) => `⁦${f}⁩`;

/* ── Le laboratoire du module 1 (sheet-lab) : les nombres de chaque niveau ───────────────────── */
export const LAB = {
  // plateforme : la mini-مسابقة du club de maths — les notes (sur 10) de cinq amis, déjà saisies
  beginner: { cells: '5|8|6|9|7', ask: 'MAX-MIN|MOYENNE', theme: 'sheet', seriesLabel: 'نقاط خمسة أصدقاء في مسابقة القسم (من 10)', fileName: 'مسابقة.xlsx' },
  // تمرين 7 corrigé : la série à saisir, les quatre دساتير, puis le graphique (ex-7, ex-15, ex-16)
  advanced: {
    cells: '4|10|8|4|3|2|4', ask: 'MAX-MIN|MEDIANE|MOYENNE|MODE', chart: 'bars|pie|histogram', entry: 'type',
    pie: 'البلاستيك:60|الزجاج:40|الورق:50', classes: '7-8:6|8-9:1|9-10:4', theme: 'sheet',
    seriesLabel: 'سلسلة التمرين 7', fileName: 'تمرين7.xlsx',
  },
};

/* ── تمرين 7 (p. 99) — « استعمال مجدول لحساب مؤشرات سلسلة » (corrigé) ──────────────────────────── */
const EX7_SRC = src('ex-7', 99, 'أوظّف تعلّماتي', 7);
export const EX7 = {
  source: EX7_SRC,
  group: 'استعمال مجدول لحساب مؤشرات سلسلة',
  intro: 'تعطى السلسلة الإحصائية التالية:',
  series: [4, 10, 8, 4, 3, 2, 4],
  questions: [
    'أ) عيّن مدى، وسيط و متوسط هذه السلسلة.',
    'ب) عيّن منوال هذه السلسلة (هي قيمة ذات أكبر تكرار).',
    'جـ) تأكد من نتائج السؤالين السابقين باستعمال مجدول إكسال كما يلي:',
  ],
  // Les consignes de جـ, CORRIGÉES : un دستور par ligne (extraction › ex-7 › correction › corrected).
  steps: [
    'احجز السلسلة الواردة في السطر الأول من المجدول (من الخلية A1 إلى الخلية G1).',
    `احجز في الخلية B2 الدستور ${xl('=MAX(A1:G1)-MIN(A1:G1)')} ثم انقر على ENTER`,
    `احجز في الخلية B3 الدستور ${xl('=MEDIANE(A1:G1)')} ثم انقر على ENTER`,
    `احجز في الخلية B4 الدستور ${xl('=MOYENNE(A1:G1)')} ثم انقر على ENTER`,
    `احجز في الخلية B5 الدستور ${xl('=MODE(A1:G1)')} ثم انقر على ENTER`,
  ],
  correctionNote: 'صحّحت المنصّة خطأً مطبعيًا: لقطة الشاشة في الكتاب تحمل 5 ، 10 ، 10 ، 8 ، 4 ، 3 ، 2 لا سلسلة التمرين، والدساتير الأربعة مكتوبة كلها في الخلية B2 ؛ نحجز سلسلة التمرين في A1:G1 ونكتب كل دستور في سطره: B2 ، B3 ، B4 ، B5 .',
  answers: {
    sorted: 'نرتّب السلسلة تصاعديًا: 2 ، 3 ، 4 ، 4 ، 4 ، 8 ، 10 (سبع قيم).',
    range: 'المدى: $10 - 2 = 8$ .',
    median: 'الوسيط: عدد القيم 7 فرديّ، والوسيط القيمة ذات الرتبة $\\dfrac{7 + 1}{2} = 4$ في السلسلة المرتبة، أي 4.',
    mean: 'المتوسط: $\\dfrac{4 + 10 + 8 + 4 + 3 + 2 + 4}{7} = \\dfrac{35}{7} = 5$ .',
    mode: 'المنوال: القيمة 4 تكرّرت 3 مرات، وهو أكبر تكرار؛ المنوال 4.',
    sheet: `يُظهر المجدول: B2 = 8 ، B3 = 4 ، B4 = 5 ، B5 = 4 ، وهي نتائج الحساب باليد.`,
  },
};

/** La contradiction d'une plage qui oublie G1 (calculée : 31 ÷ 6). */
export const EX7_RANGE_TRAP = {
  wrong: `الدستور ${xl('=MOYENNE(A1:F1)')} يعطي $\\dfrac{31}{6} \\approx 5{,}17$ بدل 5.`,
  why: `المجال A1:F1 لا يشمل الخلية G1 (القيمة 4): يحسب المجدول متوسط ست قيم فقط.`,
  right: `المجال الصحيح يشمل كل قيم السلسلة: ${xl('=MOYENNE(A1:G1)')} يعطي 5 .`,
};
/** =MAX seul n'est pas l'étendue. */
export const EX7_MAX_TRAP = {
  wrong: `كتابة ${xl('=MAX(A1:G1)')} لحساب المدى: يعطي 10.`,
  why: 'MAX تعطي أكبر قيمة فقط، والمدى فرق: أكبر قيمة ناقص أصغر قيمة.',
  right: `${xl('=MAX(A1:G1)-MIN(A1:G1)')} يعطي $10 - 2 = 8$ .`,
};
/** Le contraste : 10 devient 40 dans B1. */
export const EX7_OUTLIER = {
  text: 'عوّضنا القيمة 10 في الخلية B1 بـ 40 دون أن نلمس الدساتير.',
  mean: 'المتوسط صار $\\dfrac{65}{7} \\approx 9{,}29$ : القيمة الكبيرة جدًّا جذبته.',
  median: 'الوسيط بقي 4: السلسلة المرتبة 2 ، 3 ، 4 ، 4 ، 4 ، 8 ، 40 ، والقيمة الرابعة لم تتغيّر.',
  hand: 'أمّا العدد 5 الذي كُتب باليد في C4 فلم يتغيّر: عدد مكتوب لا يُعاد حسابه.',
};

/* ── تمرين 15 (p. 99) — المخطط الدائري ─────────────────────────────────────────────────────── */
export const EX15 = {
  source: src('ex-15', 99, 'أوظّف تعلّماتي', 15),
  text: 'الجدول التالي يمثل توزيع النفايات تم جمعها على شاطئ في حملة تطوعية لتنظيفه. مثّل هذا الجدول بمخطط دائري باستعمال المجدول إكسال بـ: - حجز الجدول التالي في ورقة إكسال. - تحديد الخلايا A1 ، B1 ، C1 ، A2 ، B2 ، C2 - النقر على insertion ثم على Secteurs و اختيار. فيظهر المخطط الدّائري.',
  table: { kinds: ['البلاستيك', 'الزجاج', 'الورق'], masses: [60, 40, 50] },
  answers: {
    total: 'الكتلة الكلية: $60 + 40 + 50 = 150$ ، أي $150\\,\\mathrm{kg}$ .',
    angles: 'زاوية كل قطاع: البلاستيك $\\dfrac{60}{150} \\times 360 = 144$ ، الزجاج $\\dfrac{40}{150} \\times 360 = 96$ ، الورق $\\dfrac{50}{150} \\times 360 = 120$ (بالدرجات)، ومجموعها $144 + 96 + 120 = 360$ .',
    why: 'نريد حصة كل نوع من كلّ النفايات: المخطط الدائري يوزّع الدائرة (360 درجة) على الأجزاء بالتناسب مع كتلها.',
  },
};

/* ── تمرين 16 (p. 99) — المدرّج التكراري بجيوجيبرا ──────────────────────────────────────────── */
export const EX16 = {
  source: src('ex-16', 99, 'أوظّف تعلّماتي', 16),
  intro: 'تعطى السلسلة الإحصائية:',
  table: { classes: ['$7 \\le t < 8$', '$8 \\le t < 9$', '$9 \\le t < 10$'], freqs: [6, 1, 4] },
  questions: [
    'أ) عين الفئة التي تشمل الوسيط',
    `ب) مثّل هذه السلسلة بمدرج تكراري باستعمال البرمجية جيوجيبر بحجز الطلبية ${xl('Histogramme({7,8,9,10},{6,1,4})')} ثم الضغط على Enter .`,
  ],
  answers: {
    median: 'التكرار الكلي $6 + 1 + 4 = 11$ فرديّ: الوسيط القيمة ذات الرتبة $\\dfrac{11 + 1}{2} = 6$ . التكرارات المجمعة الصاعدة 6 ، 7 ، 11 : الرتبة 6 في الفئة الأولى $7 \\le t < 8$ .',
    command: `في الطلبية ${xl('Histogramme({7,8,9,10},{6,1,4})')} القائمة الأولى حدود الفئات (أربعة أعداد لثلاث فئات متلاصقة)، والثانية تكراراتها: ثلاثة مستطيلات متلاصقة ارتفاعاتها 6 ، 1 ، 4 .`,
  },
};

/* ── تمرين 1 هـ (p. 98) — مخطط الأعمدة في المجدول (élément destiné à takrar-mujamma, doublon déclaré) ── */
export const EX1E = {
  source: src('ex-1', 98, 'أوظّف تعلّماتي', 1),
  text: 'إليك درجات الحرارة المسجلة بإحدى المدن خلال شهر جوان (الوحدة: °C). … هـ) مثّل هذه السلسلة بمخطط الأعمدة باستعمال مجدول الإكسال.',
  // le tableau des effectifs des 30 relevés (extraction › ex-1 › answer › table)
  table: { values: [30, 32, 33, 34, 35, 36], freqs: [8, 9, 4, 6, 2, 1] },
  answer: 'نحجز القيم 30 ، 32 ، 33 ، 34 ، 35 ، 36 في السطر 1 وتكراراتها 8 ، 9 ، 4 ، 6 ، 2 ، 1 في السطر 2 ، نحدّد السطرين ثم نختار مخططًا بالأعمدة: عمود لكل درجة حرارة، ارتفاعه عدد الأيام. المجموع $8 + 9 + 4 + 6 + 2 + 1 = 30$ يومًا.',
};

/* ── أتعمّق (p. 101) — تمرينا 23 و 24 ──────────────────────────────────────────────────────── */
export const EX23 = {
  source: src('ex-23', 101, 'أتعمّق', 23),
  text: 'استعمل اللمسات M+ ، M− ، MR ، CE/C ، = لحاسبة لتعيين متوسط السلسلة الإحصائية التالية:',
  table: { values: [97, 104, 99], freqs: [2, 3, 5] },
  keys: ['97', '×', '2', 'M+', '104', '×', '3', 'M+', '99', '×', '5', 'M+', 'MR', '÷', '10', '='],
  answers: {
    sum: 'في الذاكرة: $97 \\times 2 + 104 \\times 3 + 99 \\times 5 = 194 + 312 + 495 = 1001$ .',
    mean: 'المتوسط: $\\dfrac{1001}{10} = 100{,}1$ (التكرار الكلي $2 + 3 + 5 = 10$).',
  },
};
export const EX24 = {
  source: src('ex-24', 101, 'أتعمّق', 24),
  text: `عندما نحجز الدستور ${xl('=ALEA()')} في خلية من صفحة مجدول و ننقر على اللمسة ENTER يظهر عدد عشوائي $a$ حيث $0 \\le a < 1$ . كل نقر على اللمسة F9 يُظهر عددا عشوائيا آخر ينتمي إلى نفس المجال. أ) افتح صفحة إكسال و احجز في الخلية A1 الدستور ${xl('=ALEA()')} ثم انقر على ENTER ب) حدد A1 ثم اسحب الفأرة من A1 إلى A50 لتتحصل على سلسلة تكرارها الكلي 50. احسب مدى، وسيط و متوسط هذه السلسلة.`,
  formulas: ['=MAX(A1:A50)-MIN(A1:A50)', '=MEDIANE(A1:A50)', '=MOYENNE(A1:A50)'],
  note: 'سلسلة عشوائية: النتائج تتغيّر مع كل F9 ، لكن الدساتير هي نفسها. كل القيم بين 0 و 1 ، فالمدى أصغر من 1 ، والوسيط والمتوسط عادة قريبان من 0,5 .',
};

/* ── معارف — ÉCRITES PAR LA PLATEFORME, dans les mots du manuel (knowledge_formalization) ──────── */
const FORMAL = addition('knowledge_formalization');
export const KNOW = {
  source: FORMAL,
  title: 'المجدول: خلايا، مجال، دستور',
  cells: 'المجدول (مثل Excel) ورقة مقسّمة إلى خلايا: الأعمدة مرقّمة بالحروف A ، B ، C … والأسطر بالأعداد 1 ، 2 ، 3 … ، وتُسمّى كل خلية بحرف عمودها ثم رقم سطرها، مثل A1 أو B2 .',
  range: `المجال ${xl('A1:G1')} هو كل الخلايا من A1 إلى G1 في السطر 1 (سبع خلايا). النقطتان « ⁦:⁩ » تعنيان «من … إلى».`,
  entry: 'لحجز سلسلة إحصائية نكتب كل قيمة في خلية من سطر واحد (مثلًا من A1 إلى G1) ونضغط ENTER بعد كل قيمة، ثم نحفظ الملف لنعود إليه لاحقًا.',
  formula: `الدستور يبدأ دائمًا بالإشارة « ⁦=⁩ » : « احجز في الخلية B2 الدستور ${xl('=MOYENNE(A1:G1)')} ثم انقر على ENTER ». يكتب المجدول النتيجة في الخلية، ويعيد حسابها وحده كلما تغيّرت خلية من المجال.`,
  four: [
    `المدى: ${xl('=MAX(A1:G1)-MIN(A1:G1)')} (أكبر قيمة ناقص أصغر قيمة).`,
    `الوسيط: ${xl('=MEDIANE(A1:G1)')} .`,
    `المتوسط: ${xl('=MOYENNE(A1:G1)')} .`,
    `المنوال: ${xl('=MODE(A1:G1)')} (القيمة ذات أكبر تكرار).`,
  ],
  names: `الكتاب يستعمل أسماء الدوال في المجدول بالفرنسية: ${xl('MEDIANE')} و ${xl('MOYENNE')} . في المجدول بالإنجليزية تُكتب ${xl('MEDIAN')} و ${xl('AVERAGE')} وتحسب الشيء نفسه؛ و ${xl('MAX')} و ${xl('MIN')} و ${xl('MODE')} لا تتغيّر.`,
  charts: [
    'مخطط بالأعمدة: لسلسلة بقيم منفصلة — عمود لكل قيمة، ارتفاعه تكرارها.',
    'مخطط دائري: لتوزيع كلّ على أجزائه — زاوية كل قطاع تتناسب مع تكرار الجزء: الزاوية $= \\dfrac{n}{N} \\times 360$ درجة، حيث $n$ تكرار الجزء و $N$ التكرار الكلي.',
    'مدرّج تكراري: لسلسلة مجمّعة في فئات متلاصقة — مستطيلات متلاصقة، عرض كل منها طول الفئة وارتفاعه تكرارها.',
  ],
};

/** La mémoire de la calculatrice (ex-23) — écrite par la plateforme. */
export const CALC = {
  source: FORMAL,
  rule: 'في الحاسبة: M+ يضيف العدد الظاهر (أو نتيجة العملية) إلى الذاكرة، M− يطرحه منها، MR يُظهر محتوى الذاكرة، و CE/C يمحو ما على الشاشة. لحساب متوسط سلسلة نضيف كل جداء (القيمة × التكرار) إلى الذاكرة بـ M+ ، ثم نقسم MR على التكرار الكلي.',
};

/* ── « أستعدّ » — l'item 3 du manuel (p. 91), puis la plateforme ────────────────────────────── */
/**
 * L'item 3 (extraction › prep › items › 3 → majdulat-ihsaiya) : l'histogramme dont le troisième rectangle
 * monte à 10 quand le tableau dit 7 — FAUX par construction (pas une coquille). Puis des affirmations de la
 * PLATEFORME, même forme, pour les acquis de la leçon 2 (المدى، المتوسط، الوسيط، الفئة الوسيطية) et des
 * années précédentes (la zone d'un secteur). Aucune n'utilise les nombres du تمرين 7 (4, 10, 8, 4, 3, 2, 4).
 */
const PREP = (n) => src('prep', 91, 'أستعدّ', n);
const DIAG = addition('prerequisite_diagnostic');
export const PREP3_TABLE = { classes: ['$5 \\le a < 10$', '$10 \\le a < 15$', '$15 \\le a \\le 20$'], freqs: [4, 8, 7], drawn: [4, 8, 10] };
export const PREP_ITEMS = [
  { n: 3, skill: 'qiraa', text: 'المدرج التكراري المقابل يمثل الجدول أدناه.', answer: false, why: 'ارتفاع المستطيل الثالث 10 بينما تكرار الفئة $15 \\le a \\le 20$ في الجدول هو 7', source: PREP(3) },
  { skill: 'mada', text: 'مدى السلسلة 3 ، 9 ، 5 ، 12 ، 7 هو 12.', answer: false, why: 'المدى $12 - 3 = 9$ : أكبر قيمة ناقص أصغر قيمة، وليس أكبر قيمة وحدها.', source: DIAG },
  { skill: 'mutawassit', text: 'متوسط السلسلة 6 ، 8 ، 10 ، 12 هو 9.', answer: true, why: '$\\dfrac{6 + 8 + 10 + 12}{4} = \\dfrac{36}{4} = 9$', source: DIAG },
  { skill: 'wasit', text: 'وسيط السلسلة 7 ، 2 ، 9 ، 1 ، 5 هو 9.', answer: false, why: 'نرتّب أولًا: 1 ، 2 ، 5 ، 7 ، 9 ؛ القيمة الوسطى (الرتبة 3) هي 5.', source: DIAG },
  { skill: 'fia', text: 'سلسلة مجمّعة في ثلاث فئات تكراراتها 3 ، 5 ، 2 بالترتيب: الفئة التي تشمل الوسيط هي الفئة الثانية.', answer: true, why: 'التكرار الكلي 10: الرتبتان 5 و 6 ؛ التكرارات المجمعة الصاعدة 3 ، 8 ، 10 ، فالرتبتان في الفئة الثانية.', source: DIAG },
  { skill: 'qita', text: 'في مخطط دائري، القطاع الذي يمثّل ربع التكرار الكلي زاويته $45$ درجة.', answer: false, why: 'ربع الدائرة: $\\dfrac{1}{4} \\times 360 = 90$ درجة.', source: DIAG },
];
