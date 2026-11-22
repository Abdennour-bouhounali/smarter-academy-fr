/**
 * Le contenu du MANUEL pour le درس « إحداثيتا منتصف قطعة مستقيم والمسافة بين نقطتين في معلم » (unité 12 « الأشعة في
 * معلم ») — données pures (aucun JSX), au mot près ; chaque bloc cite son élément de docs/sources/4am/unit12/extraction.json :
 * تحدّ (p. 139, doublon déclaré : l'entrée du درس, module 1, revu au module 3), أستعدّ 5 (p. 139, module 0), نشاط 3 et
 * نشاط 4 (p. 141, modules 1–2), معارف د و هـ (p. 144, module 3), أؤكّد تعلّماتي 2–5 (p. 148, doublon déclaré, module 5).
 * Ce que la plateforme ajoute est déclaré (`addition(…)`).
 * Les coordonnées s'écrivent TOUJOURS en îlot KaTeX `$K(5\,;\,3)$` (le point-virgule algérien, abscisse d'abord).
 */
import { src, addition } from '../../_unit/unitMeta.js';

const PLATFORM = addition('interaction_generation');
export const PLATFORM_SOURCE = PLATFORM;

/** « تحدّ » (p. 139) — la distance EXACTE entre deux points à coordonnées fractionnaires. */
export const CHALLENGE = {
  source: src('challenge', 139, 'تحدّ'),
  text: 'المستوي مزوّد بمعلم متعامد ومتجانس مبدؤه O. (الوحدة $1\\,\\mathrm{cm}$) $A\\left(\\dfrac{2}{3}\\,;\\,-2\\right)$ و $B\\left(-4\\,;\\,\\dfrac{7}{3}\\right)$ نقطتان من المستوي. احسب القيمة المضبوطة للمسافة AB.',
};
/** La solution que la plateforme écrit (le livre la demande) — calculée (extraction › challenge.answer). */
export const CHALLENGE_LINES = {
  source: PLATFORM,
  measure: 'على الرسم نقيس $AB \\approx 6{,}4\\,\\mathrm{cm}$ : قيمة تقريبية فقط، فالنقطتان ليستا على عقد الرصف وإحداثياتهما كسور.',
  components: '$x_B - x_A = -4 - \\dfrac{2}{3} = -\\dfrac{14}{3}$ و $y_B - y_A = \\dfrac{7}{3} - (-2) = \\dfrac{13}{3}$',
  square: '$AB^2 = \\left(-\\dfrac{14}{3}\\right)^2 + \\left(\\dfrac{13}{3}\\right)^2 = \\dfrac{196}{9} + \\dfrac{169}{9} = \\dfrac{365}{9}$',
  exact: '$AB = \\sqrt{\\dfrac{365}{9}} = \\dfrac{\\sqrt{365}}{3}\\,\\mathrm{cm}$ ، وهي القيمة المضبوطة ($365 = 5 \\times 73$ لا يقبل عاملا مربعا) ؛ وقيمتها المقرّبة $6{,}37\\,\\mathrm{cm}$ .',
};

/** نشاط 3 (p. 141) — « إحداثيتا منتصف قطعة مستقيم ». */
export const ACTIVITY = {
  source: src('act-3', 141, 'أنشطة', 3),
  title: 'إحداثيتا منتصف قطعة مستقيم',
  situation: 'صديقان يريدان زيارة جارهما المريض معًا، يتشاركان موقعيهما على خريطة GPS ويريدان أن يلتقيا في منتصف الطريق: أين يضعان دبّوس اللقاء؟ وكم يبعد أحدهما عن الآخر في خط مستقيم؟',
  intro: 'المستوي مزود بمَعلم متعامد ومتجانس مبدؤه O.',
  part1: '1) علّم النقط $K(5\\,;\\,3)$ و $L(-3\\,;\\,1)$ و J منتصف القطعة [KL]. أوجد مركبتي كل من الشعاعين $\\overrightarrow{KJ}$ و $\\overrightarrow{JL}$ . ماذا تستنتج؟',
  part2: '2) نبحث الآن عن إحداثيتي منتصف قطعة مستقيم في الحالة العامة. نعتبر $A(x_A\\,;\\,y_A)$ ، $B(x_B\\,;\\,y_B)$ ، $I(x_I\\,;\\,y_I)$ حيث I منتصف [AB]. أ) اشرح لماذا $\\overrightarrow{AI} = \\overrightarrow{IB}$ . ب) أوجد مركبتي الشعاع $\\overrightarrow{AI}$ بدلالة إحداثيتي كل من النقطتين A و I. جـ) أوجد مركبتي الشعاع $\\overrightarrow{IB}$ بدلالة إحداثيتي كل من النقطتين B و I. عبّر عن $x_I$ بدلالة $x_A$ و $x_B$ ثم عن $y_I$ بدلالة $y_A$ و $y_B$ .',
  part3: '3) انقل وأتمم: «إذا كانت $(x_A\\,;\\,y_A)$ إحداثيتي …… و …… إحداثيتي B فإن إحداثيتي I منتصف القطعة [AB] هما $x_I = \\ldots$ و $y_I = \\ldots$ ».',
  questions: [
    'علّم النقطتين $K(5\\,;\\,3)$ و $L(-3\\,;\\,1)$ و J منتصف [KL]، ثم أوجد مركبتي $\\overrightarrow{KJ}$ و $\\overrightarrow{JL}$ . ماذا تستنتج؟',
    'لماذا $\\overrightarrow{AI} = \\overrightarrow{IB}$ إذا كانت I منتصف [AB]؟ عبّر عن $x_I$ و $y_I$ بدلالة إحداثيات A و B.',
  ],
  closing: 'إحداثيتا منتصف قطعة هما متوسطا إحداثيات طرفيها.',
};
/** Ce que la plateforme écrit des réponses du نشاط 3 — calculées (extraction › act-3.answer). */
export const ACTIVITY_LINES = {
  source: PLATFORM,
  j: 'على المعلم نقرأ منتصف [KL]: $J(1\\,;\\,2)$ .',
  kj: '$\\overrightarrow{KJ}\\begin{pmatrix} 1 - 5 \\\\ 2 - 3 \\end{pmatrix}$ أي $\\overrightarrow{KJ}\\begin{pmatrix} -4 \\\\ -1 \\end{pmatrix}$ ، و $\\overrightarrow{JL}\\begin{pmatrix} -3 - 1 \\\\ 1 - 2 \\end{pmatrix}$ أي $\\overrightarrow{JL}\\begin{pmatrix} -4 \\\\ -1 \\end{pmatrix}$ .',
  conclusion: 'للشعاعين $\\overrightarrow{KJ}$ و $\\overrightarrow{JL}$ نفس المركبتين: $\\overrightarrow{KJ} = \\overrightarrow{JL}$ ، كما يجب أن يكون لأن J منتصف [KL].',
  why: 'I منتصف [AB] يعني أن الشعاعين $\\overrightarrow{AI}$ و $\\overrightarrow{IB}$ لهما نفس المنحى ونفس الاتجاه ونفس الطول: $\\overrightarrow{AI} = \\overrightarrow{IB}$ (الوحدة 11).',
  ai: '$\\overrightarrow{AI}\\begin{pmatrix} x_I - x_A \\\\ y_I - y_A \\end{pmatrix}$ و $\\overrightarrow{IB}\\begin{pmatrix} x_B - x_I \\\\ y_B - y_I \\end{pmatrix}$',
  solve: '$x_I - x_A = x_B - x_I$ إذن $2x_I = x_A + x_B$ أي $x_I = \\dfrac{x_A + x_B}{2}$ ؛ وبنفس الطريقة $y_I = \\dfrac{y_A + y_B}{2}$ .',
  complete: '«إذا كانت $(x_A\\,;\\,y_A)$ إحداثيتي A و $(x_B\\,;\\,y_B)$ إحداثيتي B فإن إحداثيتي I منتصف القطعة [AB] هما $x_I = \\dfrac{x_A + x_B}{2}$ و $y_I = \\dfrac{y_A + y_B}{2}$ ».',
  check: 'نتحقّق مع النشاط: $x_J = \\dfrac{5 + (-3)}{2} = 1$ و $y_J = \\dfrac{3 + 1}{2} = 2$ : $J(1\\,;\\,2)$ .',
};

/** نشاط 4 (p. 141) — « المسافة بين نقطتين ». */
export const ACTIVITY_4 = {
  source: src('act-4', 141, 'أنشطة', 4),
  title: 'المسافة بين نقطتين',
  partA: 'أ) المَعلم متعامد ومتجانس (مبدؤه O) 1) اعتمادًا على الشكل المقابل اقرأ إحداثيتي كل من النقط K، L، M. 2) انقل الشكل المقابل ثم أنشئ المثلث KLM. 3) احسب الأطوال KM و LM و KL.',
  partB: 'ب) نعتبر A و B نقطتان حيث $A(x_A\\,;\\,y_A)$ و $B(x_B\\,;\\,y_B)$ و C نقطة إحداثياها $(x_C\\,;\\,y_C)$ بحيث ABC مثلث قائم في C. 1) أوجد عبارة AC بدلالة $x_A$ ، $x_B$ ، ثم عبارة BC بدلالة $y_A$ و $y_B$ . 2) استنتج عبارة $AB^2$ بدلالة $x_A$ ، $x_B$ ، $y_A$ ، $y_B$ . 3) انقل وأكمل: «إذا كانت A و B نقطتان إحداثياتهما $(x_A\\,;\\,y_A)$ و $(x_B\\,;\\,y_B)$ على الترتيب، فإن $AB = \\ldots$ ». 4) باستعمال عبارة الطول AB المحصل عليها في السؤال 3) من الجزء ب) أوجد من جديد الأطوال KM، LM ثم KL. قارن هذه النتائج بالنتائج المحصل عليها في الجزء (أ).',
  // décision de lecture de l'extraction (discrepancies › act-4) : C n'est fixé que par la figure
  reading: 'قراءة المنصّة: الكتاب يحدّد C بشكله فقط، حيث C على الشاقول المار بـ B وعلى الأفقي المار بـ A، أي $C(x_B\\,;\\,y_A)$ ؛ فالضلعان [AC] و [BC] يوازيان المحورين.',
};
export const ACTIVITY_4_LINES = {
  source: PLATFORM,
  coords: '$K(5\\,;\\,1)$ ، $L(1\\,;\\,-2)$ ، $M(5\\,;\\,-2)$',
  legs: 'K و M على نفس الشاقول: $KM = 1 - (-2) = 3$ ؛ L و M على نفس الأفقي: $LM = 5 - 1 = 4$ .',
  kl: 'المثلث KLM قائم في M: $KL^2 = KM^2 + LM^2 = 3^2 + 4^2 = 25$ إذن $KL = 5$ .',
  ac: 'في الشكل $x_A > x_B$ و $y_B > y_A$ : $AC = x_A - x_B$ و $BC = y_B - y_A$ (في الحالة العامة نأخذ القيمة الموجبة للفرق).',
  ab2: '$AB^2 = AC^2 + BC^2 = (x_B - x_A)^2 + (y_B - y_A)^2$ (مربع الفرق لا يتعلق بالترتيب).',
  ab: '$AB = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}$',
  again: '$KM = \\sqrt{(5 - 5)^2 + (-2 - 1)^2} = 3$ ، $LM = \\sqrt{(5 - 1)^2 + (-2 + 2)^2} = 4$ ، $KL = \\sqrt{(1 - 5)^2 + (-2 - 1)^2} = \\sqrt{25} = 5$ : نفس النتائج.',
  taxi: 'السير على الضلعين $LM + MK = 4 + 3 = 7$ أطول من الخط المستقيم $KL = 5$ .',
};

/** معارف د) (p. 144) — « إحداثيتا منتصف قطعة مستقيم ». */
export const KNOW_MID = {
  source: src('know-mid', 144, 'معارف', 3),
  title: 'إحداثيتا منتصف قطعة مستقيم',
  property: 'خاصية: $A(x_A\\,;\\,y_A)$ و $B(x_B\\,;\\,y_B)$ نقطتان من المستوي. و I منتصف القطعة [AB]. إذا كانت $(x_I\\,;\\,y_I)$ إحداثيتا I فإن $x_I = \\dfrac{x_A + x_B}{2}$ و $y_I = \\dfrac{y_A + y_B}{2}$ .',
  example: 'مثال: $A(3\\,;\\,-4)$ ، $B(-4\\,;\\,3)$ نقطتان من المستوي. I منتصف القطعة [AB]. لدينا $(x_I\\,;\\,y_I)$ إحداثيتا النقطة I : $x_I = \\dfrac{3 + (-4)}{2} = -\\dfrac{1}{2}$ و $y_I = \\dfrac{-4 + 3}{2} = -\\dfrac{1}{2}$ . إذن إحداثيتا I هما $\\left(-\\dfrac{1}{2}\\,;\\,-\\dfrac{1}{2}\\right)$ أي $I\\left(-\\dfrac{1}{2}\\,;\\,-\\dfrac{1}{2}\\right)$ .',
};
/** معارف هـ) (p. 144) — « المسافة بين نقطتين ». */
export const KNOW_DIST = {
  source: src('know-dist', 144, 'معارف', 3),
  title: 'المسافة بين نقطتين',
  intro: 'المستوي مزود بمعلم متعامد ومتجانس، مبدؤه النقطة O.',
  property: 'خاصية: إذا كانت $A(x_A\\,;\\,y_A)$ و $B(x_B\\,;\\,y_B)$ فإن المسافة بين النقطتين A و B هي $AB = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}$ .',
  example: 'مثال: $A(2\\,;\\,5)$ ، $B(-1\\,;\\,1)$ نقطتان من مستوٍ مزود بمعلم متعامد ومتجانس. (الوحدة $1\\,\\mathrm{cm}$) لدينا $x_B - x_A = -1 - 2 = -3$ و $y_B - y_A = 1 - 5 = -4$ إذن $(x_B - x_A)^2 + (y_B - y_A)^2 = (-3)^2 + (-4)^2$ أي $(x_B - x_A)^2 + (y_B - y_A)^2 = 9 + 16 = 25$ . ينتج أن $AB = \\sqrt{25}$ أي $AB = 5\\,\\mathrm{cm}$ .',
};
/** Ce que la plateforme ajoute aux معارف (les pièges que le lab a refusés, « القيمة المضبوطة »). */
export const KNOW_LINES = {
  source: PLATFORM,
  midTrap: 'لا ننسى القسمة على 2، ونجمع الإحداثيتين (لا نطرحهما): $\\dfrac{x_B - x_A}{2}$ هي نصف مركبة الشعاع $\\overrightarrow{AB}$ لا فاصلة المنتصف.',
  distTrap: 'المسافة ليست مجموع الفرقين: $|x_B - x_A| + |y_B - y_A|$ هي مسافة السير على الشارعين، وهي أطول من الخط المستقيم.',
  exact: 'القيمة المضبوطة للمسافة تُكتب بجذر مبسّط ($\\sqrt{72} = 6\\sqrt{2}$) أو بكسر ($\\dfrac{\\sqrt{365}}{3}$) ، والقيمة المقرّبة تُذكر بعدها إن طُلبت.',
  squareFirst: 'لنعرف هل تنتمي نقطة M إلى دائرة مركزها O ونصف قطرها r، نقارن $OM^2$ بـ $r^2$ : لا حاجة إلى الجذر.',
};

/** « أؤكّد تعلّماتي » (p. 148) — items 2 à 5 (extraction › destinations › qcm : duplicatedIn ce درس, module 5). */
const QCM_SRC = (n) => src('qcm', 148, 'أؤكّد تعلّماتي', n);
export const QCM = {
  2: { source: QCM_SRC(2), text: '$A(-2\\,;\\,-1)$ ، $B(-1\\,;\\,1)$ نقطتان من المستوي المزود بمعلم. إحداثيتا I منتصف [AB] هما…' },
  3: { source: QCM_SRC(3), text: '$A(4\\,;\\,3)$ نقطة من المستوي المزوّد بمعلم متعامد ومتجانس مبدؤه O. الطول OA هو…' },
  4: { source: QCM_SRC(4), text: 'على الشكل المقابل، المسافة AB تساوي…' },
  5: { source: QCM_SRC(5), text: '$A(2\\,;\\,3)$ ، $B(4\\,;\\,1)$ نقطتان من المستوي المزوّد بمعلم متعامد ومتجانس مبدؤه O. الطول AB يساوي…' },
};

/**
 * « أستعدّ » — l'item 5 du manuel (p. 139 ; 1–2 sont au درس « قراءة مركبتي شعاع », 3, 4, 6 au درس « حساب مركبتي
 * شعاع ») et cinq affirmations de la plateforme : les composantes d'un vecteur (درس précédent), Pythagore (3AM), la
 * simplification d'une racine (unité 2), le carré d'un relatif, la lecture d'un point sur un axe. Une affirmation par
 * question, une compétence par affirmation ; aucune n'utilise les points des نشاط 3 et 4.
 */
const PREP_ADD = addition('prerequisite_diagnostic');
export const PREP_ITEMS = [
  { n: '5', skill: 'muntasaf', text: 'M و N نقطتان. J منتصف [MN]، إذن $\\overrightarrow{MJ} = \\overrightarrow{JN}$ .', answer: true, why: 'J منتصف [MN]: للشعاعين $\\overrightarrow{MJ}$ و $\\overrightarrow{JN}$ نفس المنحى ونفس الاتجاه ونفس الطول (الوحدة 11).', source: src('prep', 139, 'أستعدّ', 5) },
  { n: 'p1', skill: 'murakkibat', text: '$E(2\\,;\\,-1)$ و $F(-3\\,;\\,4)$ نقطتان، إذن $\\overrightarrow{EF}\\begin{pmatrix} -5 \\\\ 5 \\end{pmatrix}$ .', answer: true, why: '$x_F - x_E = -3 - 2 = -5$ و $y_F - y_E = 4 - (-1) = 5$ : النهاية ناقص المبدأ.', source: PREP_ADD },
  { n: 'p2', skill: 'fithaghuras', text: 'RST مثلث قائم في S حيث $RS = 6$ و $ST = 8$ ، إذن $RT = 14$ .', answer: false, why: 'خاصية فيثاغورس: $RT^2 = 6^2 + 8^2 = 100$ إذن $RT = 10$ ، لا $6 + 8$ .', source: PREP_ADD },
  { n: 'p3', skill: 'judhur', text: '$\\sqrt{50} = 5\\sqrt{2}$ .', answer: true, why: '$\\sqrt{50} = \\sqrt{25 \\times 2} = \\sqrt{25} \\times \\sqrt{2} = 5\\sqrt{2}$ .', source: PREP_ADD },
  { n: 'p4', skill: 'nisbiya', text: '$(-5)^2 = -25$ .', answer: false, why: '$(-5)^2 = (-5) \\times (-5) = 25$ : مربع عدد سالب موجب.', source: PREP_ADD },
  { n: 'p5', skill: 'ihdathiyat', text: 'النقطة $P(0\\,;\\,-2)$ تقع على محور الفواصل.', answer: false, why: 'فاصلة P معدومة: P على محور التراتيب، تحت المبدأ O بوحدتين.', source: PREP_ADD },
];

/** Les deux mondes du lab (levels.js) : مبتدئ = les Sablettes (plateforme) ; متقدم = les نشاط 3 et 4 du manuel (Oran). */
export const LAB = {
  beginner: { source: PLATFORM, numbers: { A: [1, -1], B: [4, 3] } },
  advanced: { source: ACTIVITY.source, numbers: { A: [5, 3], B: [-3, 1], names: ['K', 'L', 'J'], dist: { A: [1, -2], B: [5, 1], names: ['L', 'K', 'M'] } } },
};
