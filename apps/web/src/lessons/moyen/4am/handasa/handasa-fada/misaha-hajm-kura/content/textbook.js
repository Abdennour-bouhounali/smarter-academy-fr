/**
 * Le contenu du MANUEL pour le درس « مساحة الكرة وحجم الجلة » (unité 14 « الهندسة في الفضاء ») — données pures (aucun JSX),
 * au mot près ; chaque bloc cite son élément de docs/sources/4am/unit14/extraction.json :
 *   « أستعدّ » 4, 5, 6 (p. 163, module 0) ; l'introduction d'Archimède (p. 163, doublon DÉCLARÉ de la page d'unité —
 *   extraction › destinations › intro-archimedes.duplicatedIn — l'entrée du درس, module 1 : le livre n'a pas d'activité pour
 *   ce درس) ; معارف 2 (p. 166, module 2).
 * Le scan s'arrête p. 169 : il n'y a ni طرائق pour ce درس, ni exercice, ni QCM. Ce que la plateforme écrit est DÉCLARÉ :
 *   `addition('knowledge_formalization')` — la méthode « القيمة المضبوطة ثم المدوّرة » et son inverse (module 3), la règle de
 *   l'arrondi au mm² / mm³ (module 2) ; `addition('interaction_generation')` — le contexte de l'orange, les réponses que
 *   le livre demande sans les écrire ; `addition('prerequisite_diagnostic')` — les affirmations de « أستعدّ » ajoutées.
 * Lecture honorée (extraction › discrepancies) : l'introduction écrit « حجم الكرة » ; le chapitre distingue la كرة (surface)
 * et la جلّة (solide) — la citation reste telle quelle, la leçon reformule « حجم الجلّة » et le dit en une ligne. La notation
 * « (4π)cm³ » de « أستعدّ » 6 est écrite $4\pi\,\mathrm{cm}^3$ (même sens).
 */
import { src, addition } from '../../_unit/unitMeta.js';

const PLATFORM = addition('interaction_generation');
export const PLATFORM_SOURCE = PLATFORM;
export const FORMAL_SOURCE = addition('knowledge_formalization');

/** مدخل الوحدة (p. 163) — « أرخميدس » : le texte au mot près (la figure : content/figures.js › FIG_ARCHIMEDES). */
export const ARCHIMEDES = {
  source: src('intro-archimedes', 163, 'مدخل الباب'),
  title: 'أرخميدس',
  text: 'أرخميدس (287 ق م - 212 ق م) هو عالم رياضيات و فيزياء و مخترع. أبرز اكتشافاته قانون طفو الأجسام و الذي ينص على أنّ وزن الجسم المغمور بالمياه يُساوي كميّة الماء المُزاح. و من أشهر اكتشافاته طُرق حساب المساحات و الحجوم، حيث اعتمد على استبدال الشكل الأصلي بأشكال يعلم حساب مساحتها أو حجمها و تكون مقرّبة كثيرا من الشكل الأصلي.',
  setup: 'وُضعت كُرة نصف قطرها R داخل أسطوانة ارتفاعها 2R و نصف قطر قاعدتها R (انظر الشكل). توصّل أرخميدس في هذه الوضعية إلى أنّ مساحة الكُرة تُساوي المساحة الجانبية للأسطوانة و أنّ حجم الكرة يُساوي ثُلثي حجم الأسطوانة.',
  // extraction › discrepancies (reading) : citation gardée, reformulation de la leçon
  reading: 'في هذا الدرس نقول «حجم الجلّة»: الكرة سطح لها مساحة، والجلّة مجسّم له حجم (معارف الكتاب ص 166).',
};
/** Ce que la plateforme écrit sous la figure d'Archimède (extraction › intro-archimedes › answer, calculées). */
export const ARCH_LINES = {
  source: PLATFORM,
  radius: 'نصف قطر قاعدة الأسطوانة هو R، نفس نصف قطر الكرة: الكرة تمسّ السطح الجانبي.',
  height: 'ارتفاع الأسطوانة $2R$ : الكرة تمسّ القاعدتين، فالارتفاع قطر الكرة.',
  lateral: 'المساحة الجانبية للأسطوانة: محيط القاعدة × الارتفاع $= 2\\pi R \\times 2R = 4\\pi R^2$ .',
  volume: 'حجم الأسطوانة: مساحة القاعدة × الارتفاع $= \\pi R^2 \\times 2R = 2\\pi R^3$ .',
  areaEqual: 'مساحة الكرة $4\\pi R^2$ تساوي المساحة الجانبية للأسطوانة $2\\pi R \\times 2R = 4\\pi R^2$ : أربعة أقراص كبرى مساحة كل منها $\\pi R^2$ .',
  volumeTwoThirds: 'حجم الجلّة $\\frac{2}{3} \\times 2\\pi R^3 = \\frac{4}{3}\\pi R^3$ : ثلثا حجم الأسطوانة.',
};

/**
 * L'entrée du درس (export `ACTIVITY`, lu par la مذكرة) : Archimède, rendu touchable par l'orange de Boufarik (la plateforme
 * habille la boule du manuel — `experience` déclarée dans lesson.config.js).
 */
export const ACTIVITY = {
  source: ARCHIMEDES.source,
  title: 'اكتشاف أرخميدس: كرة داخل أسطوانة ارتفاعها 2R',
  situation: 'في مطبخ البيت تقشّر برتقالة من بوفاريك دون إسراف، وتفرد قشرتها في أقراص على الطاولة، ثم تعصرها في كأس أسطوانية على مقاسها تماما. كم قرصا تغطي القشرة؟ وإلى أين يصل العصير في الكأس؟',
  situationSource: PLATFORM,
  text: `${ARCHIMEDES.text} ${ARCHIMEDES.setup}`,
  questions: [
    'ما نصف قطر قاعدة الأسطوانة وما ارتفاعها؟ ما حجمها وما مساحتها الجانبية؟',
    'كم قرصا نصف قطره R تغطي قشرة الكرة؟ ما مساحة الكرة؟',
    'إلى أي ارتفاع يصل عصير الجلّة في الأسطوانة؟ ما حجم الجلّة؟',
  ],
  closing: 'مساحة الكرة تساوي المساحة الجانبية للأسطوانة: $4\\pi R^2$ ، وحجم الجلّة يساوي ثلثي حجم الأسطوانة: $\\frac{4}{3}\\pi R^3$ .',
};

/** معارف 2 (p. 166) — « مساحة الكرة و حجم الجلّة » (تعريف + مثال), au mot près (unités écrites dans l'îlot). */
export const KNOW2 = {
  source: src('know-2', 166, 'معارف', 2),
  title: 'مساحة الكرة و حجم الجلّة',
  area: 'تعريف: مساحة الكرة التي مركزها O و نصف قطرها R هي $\\mathcal{A}$ حيث $\\mathcal{A} = 4\\pi R^2$ .',
  volume: 'تعريف: حجم الجلة التي مركزها O و نصف قطرها R هو $\\mathcal{V}$ حيث $\\mathcal{V} = \\dfrac{4}{3}\\pi R^3$ .',
  exampleArea: 'مثال: مساحة كرة نصف قطرها $1{,}4\\,\\mathrm{cm}$ هي $\\mathcal{A}$ حيث $\\mathcal{A} = 4\\pi R^2 = 4\\pi(1{,}4)^2$ أي $\\mathcal{A} = 24{,}63\\,\\mathrm{cm}^2$ بالتدوير إلى $1\\,\\mathrm{mm}^2$ .',
  exampleVolume: 'حجم جلة نصف قطرها $1{,}4\\,\\mathrm{cm}$ هو $\\mathcal{V}$ حيث $\\mathcal{V} = \\dfrac{4}{3}\\pi R^3 = \\dfrac{4}{3}\\pi(1{,}4)^3$ أي $\\mathcal{V} = 11{,}494\\,\\mathrm{cm}^3$ بالتدوير إلى $1\\,\\mathrm{mm}^3$ .',
};
/** Ce que la plateforme écrit de l'exemple (extraction › know-2 › example.answer, calculées et vérifiées par le builder). */
export const KNOW2_LINES = {
  source: PLATFORM,
  areaExact: '$\\mathcal{A} = 4\\pi \\times 1{,}96 = 7{,}84\\pi\\,\\mathrm{cm}^2$ (القيمة المضبوطة) $\\approx 24{,}630086\\,\\mathrm{cm}^2$',
  volumeExact: '$\\mathcal{V} = \\dfrac{4}{3}\\pi \\times 2{,}744 = \\dfrac{1372}{375}\\pi\\,\\mathrm{cm}^3$ (القيمة المضبوطة) $\\approx 11{,}494040\\,\\mathrm{cm}^3$',
};

/** La règle de l'arrondi au mm² / mm³ que l'exemple applique sans l'écrire (déclarée : `knowledge_formalization`). */
export const QIMA = {
  source: FORMAL_SOURCE,
  exact: 'القيمة المضبوطة لمساحة كرة أو لحجم جلة تُكتب بدلالة $\\pi$ (مثل $7{,}84\\pi\\,\\mathrm{cm}^2$)، ولا ندوّر إلا في آخر الحساب.',
  rounding: 'التدوير إلى $1\\,\\mathrm{mm}^2 = 0{,}01\\,\\mathrm{cm}^2$ يعني رقمين بعد الفاصلة، وإلى $1\\,\\mathrm{mm}^3 = 0{,}001\\,\\mathrm{cm}^3$ ثلاثة أرقام؛ وإلى الجزء من عشرة رقما واحدا، وإلى الجزء من مائة رقمين.',
};

/** طرائق (déclarée : le scan n'a pas de طرائق pour ce درس) — de la valeur exacte à la valeur arrondie, depuis le diamètre. */
export const METHOD = {
  source: FORMAL_SOURCE,
  title: 'حساب مساحة كرة أو حجم جلة: القيمة المضبوطة ثم المدوّرة',
  exercise: 'كرة قطرها $8\\,\\mathrm{cm}$ . احسب مساحتها وحجم الجلة التي تحدّها: القيمة المضبوطة بدلالة $\\pi$ ، ثم القيمة المدوّرة إلى الجزء من عشرة.',
  solution: [
    '1) نصف القطر: $R = 8 \\div 2 = 4\\,\\mathrm{cm}$ ، لأن القانونين يستعملان نصف القطر لا القطر.',
    '2) المساحة، القيمة المضبوطة: $\\mathcal{A} = 4\\pi R^2 = 4\\pi \\times 4^2 = 64\\pi\\,\\mathrm{cm}^2$ .',
    '3) المساحة، القيمة المدوّرة: $64\\pi = 201{,}0619\\ldots$ ؛ الرقم الذي يلي رقم الأجزاء من عشرة هو 6، فـ $\\mathcal{A} \\approx 201{,}1\\,\\mathrm{cm}^2$ .',
    '4) الحجم، القيمة المضبوطة: $\\mathcal{V} = \\frac{4}{3}\\pi R^3 = \\frac{4}{3}\\pi \\times 4^3 = \\frac{256}{3}\\pi\\,\\mathrm{cm}^3$ .',
    '5) الحجم، القيمة المدوّرة: $\\frac{256}{3}\\pi = 268{,}0825\\ldots$ فـ $\\mathcal{V} \\approx 268{,}1\\,\\mathrm{cm}^3$ ؛ ندوّر في آخر الحساب فقط.',
  ],
  rule: 'طريقة: لحساب مساحة كرة أو حجم جلة نحسب نصف القطر $R$ (نقسم القطر على 2)، ثم نعوّض في $\\mathcal{A} = 4\\pi R^2$ أو $\\mathcal{V} = \\frac{4}{3}\\pi R^3$ ونكتب القيمة المضبوطة بدلالة $\\pi$ ؛ وإذا طُلبت قيمة مقرّبة نضرب في $\\pi$ في آخر الحساب وندوّر إلى الرتبة المطلوبة.',
  numbers: { D: 8, R: 4, area: '64π', areaRounded: '201,1', volume: '256π/3', volumeRounded: '268,1' },
};
/** طرائق (déclarée) — le chemin inverse : de l'aire au rayon. */
export const METHOD_INVERSE = {
  source: FORMAL_SOURCE,
  title: 'من مساحة الكرة إلى نصف قطرها',
  exercise: 'مساحة كرة $100\\pi\\,\\mathrm{cm}^2$ . احسب نصف قطرها، ثم حجم الجلة التي تحدّها: القيمة المضبوطة، ثم المدوّرة إلى الجزء من عشرة.',
  solution: [
    '1) نكتب المساواة: $4\\pi R^2 = 100\\pi$ ، أي $R^2 = 100 \\div 4 = 25$ .',
    '2) نصف القطر طول موجب: $R = \\sqrt{25} = 5\\,\\mathrm{cm}$ .',
    '3) الحجم: $\\mathcal{V} = \\frac{4}{3}\\pi \\times 5^3 = \\frac{500}{3}\\pi\\,\\mathrm{cm}^3$ .',
    '4) $\\frac{500}{3}\\pi = 523{,}5987\\ldots$ فـ $\\mathcal{V} \\approx 523{,}6\\,\\mathrm{cm}^3$ .',
  ],
  rule: 'طريقة: إذا عُلمت مساحة كرة $\\mathcal{A} = k\\pi$ نحلّ $4\\pi R^2 = k\\pi$ أي $R^2 = \\frac{k}{4}$ ، ثم نأخذ الجذر التربيعي الموجب: $R = \\sqrt{\\frac{k}{4}}$ .',
  numbers: { k: 100, R: 5, volume: '500π/3', volumeRounded: '523,6' },
};

/** Les erreurs que la leçon corrige (le لماذا vient des طرائق) — citées par la carte (knowledgeGraph.js). */
export const MISTAKES = {
  qutr: {
    wrong: 'كرة قطرها $8\\,\\mathrm{cm}$ : نعوّض بالقطر فنكتب $\\mathcal{A} = 4\\pi \\times 8^2 = 256\\pi\\,\\mathrm{cm}^2$ .',
    right: 'نقسم القطر على 2 أولا: $R = 4\\,\\mathrm{cm}$ و $\\mathcal{A} = 4\\pi \\times 4^2 = 64\\pi\\,\\mathrm{cm}^2$ .',
  },
  qurs: {
    wrong: 'مساحة الكرة هي مساحة دائرتها الكبرى $\\pi R^2$ .',
    right: 'القشرة ملأت أربعة أقراص كبرى: مساحة الكرة $4\\pi R^2$ ، أربعة أضعاف $\\pi R^2$ .',
  },
};

/**
 * « أستعدّ » — les items 4, 5, 6 du manuel (p. 163 ; 1–2 sont au درس « الكرة والجلة », 3, 7, 8 au درس « التكبير والتصغير »)
 * et quatre affirmations de la plateforme sur les prérequis du propriétaire : l'aire latérale d'un cylindre (le pont
 * d'Archimède), les puissances, l'arrondi, la valeur exacte. Une affirmation par compétence ; aucune n'utilise les nombres
 * du lab (R = 3 et 5, 36π, 1,4).
 */
const PREP_ADD = addition('prerequisite_diagnostic');
export const PREP_ITEMS = [
  { n: '4', skill: 'mukaab', text: 'حجم مكعب طول حرفه $2\\,\\mathrm{cm}$ هو $6\\,\\mathrm{cm}^3$ .', answer: false, why: '$V = 2^3 = 2 \\times 2 \\times 2 = 8\\,\\mathrm{cm}^3$ لا $6\\,\\mathrm{cm}^3$ (الخطأ: $2 \\times 3$ بدل $2^3$).', source: src('prep', 163, 'أستعدّ', 4) },
  { n: '5', skill: 'mutawazi', text: 'حجم متوازي مستطيلات أبعاده $2\\,\\mathrm{cm}$ ، $3\\,\\mathrm{cm}$ و $4\\,\\mathrm{cm}$ هو $24\\,\\mathrm{cm}^3$ .', answer: true, why: '$V = 2 \\times 3 \\times 4 = 24\\,\\mathrm{cm}^3$ .', source: src('prep', 163, 'أستعدّ', 5) },
  { n: '6', skill: 'ustuwana', text: 'حجم أسطوانة دوران نصف قطر قاعدتها $2\\,\\mathrm{cm}$ و ارتفاعها $2\\,\\mathrm{cm}$ هو $4\\pi\\,\\mathrm{cm}^3$ .', answer: false, why: '$V = \\pi r^2 h = \\pi \\times 2^2 \\times 2 = 8\\pi\\,\\mathrm{cm}^3$ لا $4\\pi\\,\\mathrm{cm}^3$ ($4\\pi\\,\\mathrm{cm}^2$ هي مساحة القاعدة وحدها).', source: src('prep', 163, 'أستعدّ', 6) },
  { n: 'p1', skill: 'janibiya', text: 'المساحة الجانبية لأسطوانة دوران نصف قطر قاعدتها $2\\,\\mathrm{cm}$ وارتفاعها $5\\,\\mathrm{cm}$ هي $20\\pi\\,\\mathrm{cm}^2$ .', answer: true, why: 'نفرد السطح الجانبي فنحصل على مستطيل بعداه محيط القاعدة $2\\pi \\times 2 = 4\\pi$ والارتفاع $5$ : $4\\pi \\times 5 = 20\\pi\\,\\mathrm{cm}^2$ .', source: PREP_ADD },
  { n: 'p2', skill: 'quwa', text: '$(0{,}5)^2 = 0{,}25$', answer: true, why: '$(0{,}5)^2 = 0{,}5 \\times 0{,}5 = 0{,}25$ ؛ والخطأ الشائع $0{,}5 \\times 2 = 1$ .', source: PREP_ADD },
  { n: 'p3', skill: 'tadwir', text: 'المدوّر إلى الجزء من مائة للعدد $8{,}047$ هو $8{,}04$ .', answer: false, why: 'الرقم الذي يلي رقم الأجزاء من مائة هو 7، و 7 أكبر من 5 أو يساويه، فنزيد 1: $8{,}047 \\approx 8{,}05$ . العدد $8{,}04$ قيمة مقرّبة بالنقصان (بتر).', source: PREP_ADD },
  { n: 'p4', skill: 'madbuta', text: 'العدد $3{,}14$ هو القيمة المضبوطة للعدد $\\pi$ .', answer: false, why: '$\\pi = 3{,}14159\\ldots$ لا يُكتب بعدد محدود من الأرقام؛ $3{,}14$ قيمة مقرّبة له إلى الجزء من مائة. القيمة المضبوطة تُكتب بالرمز $\\pi$ .', source: PREP_ADD },
];

/** Les deux niveaux du lab (levels.js) : مبتدئ = l'orange de 3 cm (plateforme) ; متقدم = Archimède, R libre, puis l'exemple 1,4. */
export const LAB = {
  beginner: { source: PLATFORM, numbers: { R: 3 } },
  advanced: { source: ARCHIMEDES.source, numbers: { R: 5, example: '1,4', rounding: [2, 3] } },
};
