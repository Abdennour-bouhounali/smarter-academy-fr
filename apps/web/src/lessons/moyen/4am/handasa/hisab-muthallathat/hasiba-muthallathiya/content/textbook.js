/**
 * Le contenu du MANUEL pour le درس « استعمال الحاسبة لحساب النسب المثلثية وتعيين قياس زاوية » (unité 10) — données
 * pures (aucun JSX), au mot près ; chaque bloc cite son élément de docs/sources/4am/unit10/extraction.json :
 * أستعدّ 2–3 (p. 115, module 0), نشاط 4 (p. 117, module 1), معارف 3 (p. 120, module 2). Ce que la plateforme ajoute est
 * déclaré (`addition(…)`). Le manuel n'a PAS de طرائق pour cette leçon : les méthodes de la calculatrice sont les deux
 * exemples de معارف 3.
 *
 * Une COQUILLE corrigée en une ligne (KNOW3.correction) : l'écran de l'exemple 2 imprime « 16,69924453 » pour
 * tan⁻¹ 0,3 ; la calculatrice affiche 16,69924423 (écart au 8e chiffre, l'arrondi 17° est juste).
 * Les touches de la calculatrice (ON, 2nd, sin⁻¹…) sont du CODE LTR : dans une chaîne lue par MathText elles sont
 * isolées par LRI … PDI (`key()`), dans le JSX elles sont dessinées par components/KeySequence.jsx.
 */
import { src, addition } from '../../_unit/unitMeta.js';

const PLATFORM = addition('interaction_generation');
export const PLATFORM_SOURCE = PLATFORM;
/** Une touche ou un programme de calculatrice, isolé LTR dans une phrase arabe (ARABIC_RTL_CONTRACT, code LTR). */
export const key = (s) => `⁦${s}⁩`;

/** نشاط 4 (p. 117) — « استعمال حاسبة في حساب نسب مثلثية » : le tableau (1) et les trois angles (2). */
export const ACTIVITY = {
  source: src('act-4', 117, 'أنشطة', 4),
  title: 'استعمال حاسبة في حساب نسب مثلثية',
  situation: 'نستعمل حاسبة علمية لإكمال جدول النسب المثلثية لسبع زوايا، ثم لإيجاد زاوية علمت إحدى نسبها.',
  part1: '1) انقل وأتمم الجدول الآتي (المدوّر إلى الجزء من 100): الزاوية $10^{\\circ}$ ، $20^{\\circ}$ ، $30^{\\circ}$ ، $40^{\\circ}$ ، $45^{\\circ}$ ، $60^{\\circ}$ ، $75^{\\circ}$ — جيب تمام الزاوية ، جيب الزاوية ، ظل الزاوية.',
  part2: '2) استعمل حاسبة لإيجاد مدوّر x في كل حالة مما يلي (المدوّر إلى $\\dfrac{1}{100}$ ، إلى $\\dfrac{1}{10}$ ، المدوّر x إلى الوحدة): $\\sin x = 0{,}52$ ، $\\cos x = 0{,}25$ ، $\\tan x = 1{,}33$',
  questions: [
    '1) انقل وأتمم جدول النسب المثلثية للزوايا 10° إلى 75° (المدوّر إلى الجزء من 100).',
    '2) استعمل حاسبة لإيجاد مدوّر x إلى 1/100 وإلى 1/10 وإلى الوحدة إذا كان sin x = 0,52 أو cos x = 0,25 أو tan x = 1,33.',
  ],
  closing: 'الحاسبة المبرمجة بالدرجة تعطي قيمة مقربة لنسبة زاوية معلومة، واللمسات العكسية تعطي قيس زاوية من إحدى نسبها.',
  // les nombres du lab (متقدم) = levels.js › trig-calculator › advanced
  numbers: { angles: [10, 20, 30, 40, 45, 60, 75], inverse: { sin: 0.52, cos: 0.25, tan: 1.33 }, digits: 2 },
  // le corrigé (extraction › act-4 › answer, calculé par le builder) : lignes cos, sin, tan
  table: {
    10: ['0{,}98', '0{,}17', '0{,}18'], 20: ['0{,}94', '0{,}34', '0{,}36'], 30: ['0{,}87', '0{,}50', '0{,}58'], 40: ['0{,}77', '0{,}64', '0{,}84'],
    45: ['0{,}71', '0{,}71', '1{,}00'], 60: ['0{,}50', '0{,}87', '1{,}73'], 75: ['0{,}26', '0{,}97', '3{,}73'],
  },
  inverse: { sin: ['31{,}33', '31{,}3', '31'], cos: ['75{,}52', '75{,}5', '76'], tan: ['53{,}06', '53{,}1', '53'] },
};

/** Le monde مبتدئ du lab (plateforme) : trois angles remarquables, au centième — levels.js › trig-calculator › beginner. */
export const DRONE = { source: PLATFORM, numbers: { angles: [30, 45, 60], digits: 2 } };

/** معارف 3 (p. 120) — « استعمال حاسبة في حساب نسب مثلثية » : la programmation en degrés et les deux exemples. */
export const KNOW3 = {
  source: src('know-3', 120, 'معارف', 3),
  title: 'استعمال حاسبة في حساب نسب مثلثية',
  intro: 'قبل استعمال الحاسبة، يجب برمجتها بالوحدة الدرجة (d°).',
  example1: {
    text: 'مثال 1: حساب المدوّر إلى $\\dfrac{1}{100}$ لكل من النسب $\\sin 54^{\\circ}$ ، $\\cos 54^{\\circ}$ ، $\\tan 54^{\\circ}$ .',
    steps: [
      { label: 'نحسب $\\sin 54^{\\circ}$ باتباع المراحل الآتية (من اليسار إلى اليمين):', keys: ['ON', 'sin', '54', '='], screen: '0{,}8090169944', result: 'المدوّر إلى $\\dfrac{1}{100}$ لـ $\\sin 54^{\\circ}$ هو $0{,}81$' },
      { label: 'نحسب $\\cos 54^{\\circ}$ باتباع المراحل الآتية (من اليسار إلى اليمين):', keys: ['ON', 'cos', '54', '='], screen: '0{,}5877852523', result: 'المدوّر إلى $\\dfrac{1}{100}$ لـ $\\cos 54^{\\circ}$ هو $0{,}59$' },
      { label: 'نحسب $\\tan 54^{\\circ}$ باتباع المراحل الآتية (من اليسار إلى اليمين):', keys: ['ON', 'tan', '54', '='], screen: '1{,}37638192', result: 'المدوّر إلى $\\dfrac{1}{100}$ لـ $\\tan 54^{\\circ}$ هو $1{,}38$' },
    ],
  },
  example2: {
    text: 'مثال 2: حساب قيس كل من الزاويتين $\\widehat{A}$ و $\\widehat{B}$ بالتدوير إلى الوحدة علما أن $\\sin\\widehat{A} = 0{,}4$ و $\\tan\\widehat{B} = 0{,}3$ .',
    steps: [
      { label: 'نحسب $\\widehat{A}$ حيث $\\sin\\widehat{A} = 0{,}4$ باتباع المراحل الآتية (من اليسار إلى اليمين):', keys: ['ON', '2nd', 'sin⁻¹', '0,4', '='], screen: '23{,}57817848', result: 'إذن $\\widehat{A} \\approx 24^{\\circ}$' },
      { label: 'نحسب $\\widehat{B}$ حيث $\\tan\\widehat{B} = 0{,}3$ باتباع المراحل الآتية (من اليسار إلى اليمين):', keys: ['ON', '2nd', 'tan⁻¹', '0,3', '='], screen: '16{,}69924423', result: 'إذن $\\widehat{B} \\approx 17^{\\circ}$' },
    ],
  },
  correction: 'صحّحت المنصّة خطأً مطبعيًا: الكتاب يطبع على الشاشة $16{,}69924453$ ، والحاسبة تعرض $16{,}69924423$ (الفرق في الرقم الثامن بعد الفاصلة، والمدوّر $17^{\\circ}$ صحيح).',
};

/**
 * Ce que la plateforme FORMALISE (déclaré `knowledge_formalization`) : la règle d'arrondi que les exemples de
 * معارف 3 appliquent sans l'énoncer, et la distinction arrondi / troncature (أستعدّ 3).
 */
export const ROUNDING_RULE = {
  source: addition('knowledge_formalization'),
  title: 'تدوير نتيجة الحاسبة',
  lines: [
    'نحدّد الرقم الأخير الذي نحتفظ به حسب الدقة المطلوبة: رقم الوحدات (المدوّر إلى الوحدة)، رقم الأجزاء من 10، أو رقم الأجزاء من 100.',
    'ننظر إلى الرقم الموالي له: إذا كان 5 أو أكبر نضيف 1 إلى آخر رقم نحتفظ به، وإذا كان أصغر من 5 نحتفظ بالرقم كما هو.',
    'الاحتفاظ بالأرقام دون النظر إلى الرقم الموالي يعطي قيمة مقربة بالنقصان (بترا)، وهي ليست دائما المدوّر.',
    'ندوّر النتيجة النهائية فقط: نحتفظ بأرقام الشاشة كلها أثناء الحساب.',
  ],
};

/** Les touches de la calculatrice que le lab et معارف 3 nomment (pour le module 2 et la carte). */
export const KEYS_RULE = {
  source: addition('knowledge_formalization'),
  direct: 'لحساب نسبة زاوية معلومة: نضغط الدالة ( ' + key('sin') + ' أو ' + key('cos') + ' أو ' + key('tan') + ' ) ثم قيس الزاوية ثم ' + key('=') + '.',
  inverse: 'لتعيين قيس زاوية حادة علمت إحدى نسبها: نضغط ' + key('2nd') + ' ثم ' + key('sin⁻¹') + ' (أو ' + key('cos⁻¹') + ' أو ' + key('tan⁻¹') + ') ثم النسبة ثم ' + key('=') + '.',
  radTrap: 'في وضع الراديان ( ' + key('R') + ' ) تعطي الحاسبة $\\sin 30 \\approx -0{,}988$ بدل $\\sin 30^{\\circ} = 0{,}5$ : نتأكد من الحرف ' + key('D') + ' في أعلى الشاشة قبل كل حساب.',
};

/**
 * « أستعدّ » — les items 2 et 3 du manuel (p. 115) et quatre affirmations de la plateforme. Trois acquis : l'arrondi
 * d'un décimal (tadwir-adad), l'arrondi et la valeur approchée par défaut (qima-muqarraba), les rapports
 * trigonométriques de la leçon 1 (nisba-muthallathiya). Aucune n'utilise les nombres du نشاط 4.
 */
const PREP_ADD = addition('prerequisite_diagnostic');
const PREP_SRC = (n) => src('prep', 115, 'أستعدّ', n);
export const PREP_ITEMS = [
  { n: 2, skill: 'tadwir', text: 'مدوّر العدد $1{,}267103$ إلى الوحدة هو $1$ .', answer: true, why: 'رقم الأجزاء من 10 هو 2، وهو أصغر من 5: نحتفظ برقم الوحدات 1.', source: PREP_SRC(2) },
  { n: 3, skill: 'tadwir', text: 'مدوّر العدد $1{,}267103$ إلى الجزء من 10 هو $1{,}2$ .', answer: false, why: 'رقم الأجزاء من 100 هو 6، وهو أكبر من 5، فالمدوّر إلى الجزء من 10 هو $1{,}3$ ؛ و $1{,}2$ هي القيمة المقربة بالنقصان.', source: PREP_SRC(3) },
  { skill: 'tadwir', text: 'مدوّر العدد $3{,}7264$ إلى الجزء من 100 هو $3{,}73$ .', answer: true, why: 'نحتفظ برقمين بعد الفاصلة (3,72)، والرقم الموالي 6 أكبر من 5: نضيف 1 فنجد $3{,}73$ .', source: PREP_ADD },
  { skill: 'muqarraba', text: 'القيمة المقربة بالنقصان إلى الجزء من 10 للعدد $2{,}58$ هي $2{,}6$ .', answer: false, why: 'القيمة المقربة بالنقصان تبتر الأرقام: $2{,}5$ . أما $2{,}6$ فهو المدوّر إلى الجزء من 10.', source: PREP_ADD },
  { skill: 'nisba', text: 'ABC مثلث قائم في A حيث $AB = 3$ ، $AC = 4$ و $BC = 5$ . ينتج $\\sin\\widehat{B} = \\dfrac{4}{5}$ .', answer: true, why: 'المقابل للزاوية B هو [AC] والوتر هو [BC]: $\\sin\\widehat{B} = \\dfrac{AC}{BC} = \\dfrac{4}{5}$ .', source: PREP_ADD },
  { skill: 'nisba', text: 'في مثلث قائم، ظل زاوية حادة يساوي طول الوتر مقسوما على طول الضلع المجاور لها.', answer: false, why: 'ظل زاوية حادة يساوي طول الضلع المقابل مقسوما على طول الضلع المجاور؛ الوتر لا يدخل في الظل.', source: PREP_ADD },
];
