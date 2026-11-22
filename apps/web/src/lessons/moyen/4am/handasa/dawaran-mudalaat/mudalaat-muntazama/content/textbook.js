/**
 * Le contenu du MANUEL pour le درس « المضلعات المنتظمة وتطبيقاتها » (unité 13) — données pures (aucun JSX), au mot
 * près ; chaque bloc cite son élément de docs/sources/4am/unit13/extraction.json :
 *   تحدّ (p. 151, l'ENTRÉE, module 1 ; doublon déclaré : la page d'unité) et مدخل الباب « نجمة البحر » (p. 151, doublon
 *   déclaré, module 1) ; أستعدّ 1 (p. 151, module 0) ; نشاط 5 (p. 153, module 1) ; معارف 5 (p. 156, module 2) ;
 *   طرائق p. 157 (حساب قيس زاوية، إنشاء مضلع، حساب طول ضلع) et دوري الآن p. 157 (module 3) ; أؤكّد تعلّماتي 4 (p. 160,
 *   doublon déclaré, module 8).
 * DEUX corrections (extraction › discrepancies) : طريقة « حساب قيس زاوية » imprime « $\widehat{BAE} = 180^\circ$ » pour
 * 2 × 54° = 108° ; طريقة « إنشاء مضلع » nomme les médiatrices (D1)/(D2) dans le texte et (Δ1)/(Δ2) sur la figure — la
 * leçon garde UN nom, celui de la figure. Une lecture déclarée : le تحدّ (« رأسين متتاليين » = deux pointes consécutives).
 * Ce que la plateforme ajoute est déclaré (`addition(…)`).
 */
import { src, addition } from '../../_unit/unitMeta.js';

const PLATFORM = addition('interaction_generation');
export const PLATFORM_SOURCE = PLATFORM;
export const FORMAL_SOURCE = addition('knowledge_formalization');

/** تحدّ (p. 151) — l'étoile du drapeau. */
export const CHALLENGE = {
  source: src('challenge', 151, 'تحدّ'),
  text: 'أنشئ على ورق غير مرصوف تصميما لنجمة العلم الجزائري بحيث تكون المسافة بين كل رأسين متتاليين من هذه النجمة تساوي $10\\,\\mathrm{cm}$ .',
  // la lecture retenue (extraction › discrepancies › challenge), dite en une ligne
  reading: 'قرأت المنصّة «رأسين متتاليين» على أنهما رأسان خارجيان متتاليان من رؤوس النجمة الخمسة (أطرافها). وإذا عُدّت رؤوس محيط النجمة العشرة (رأس خارجي ورأس داخلي متجاوران) فإن نصف قطر الدائرة يصير $\\approx 13{,}76\\,\\mathrm{cm}$ .',
  idea: 'رؤوس النجمة الخمسة تقع على دائرة مركزها O وهي رؤوس خماسي منتظم: كل رأس صورة الرأس السابق بالدوران الذي مركزه O وزاويته $72^\\circ$ ($\\dfrac{360^\\circ}{5}$).',
  radius: 'ضلع الخماسي $= 2R\\sin 36^\\circ = 10$ إذن $R = \\dfrac{5}{\\sin 36^\\circ} \\approx 8{,}51\\,\\mathrm{cm}$',
  construction: [
    'نرسم دائرة مركزها O ونصف قطرها حوالي $8{,}51\\,\\mathrm{cm}$ .',
    'نعيّن عليها نقطة A ثم ننشئ بالمنقلة الزوايا المركزية $\\widehat{AOB} = \\widehat{BOC} = \\widehat{COD} = \\widehat{DOE} = 72^\\circ$ .',
    'نتحقّق بالمدور أنّ $AB = BC = CD = DE = EA = 10\\,\\mathrm{cm}$ .',
    'نرسم النجمة بوصل كل رأس بالرأس الذي يليه بعد رأس: [AC]، [CE]، [EB]، [BD]، [DA].',
  ],
  branch: 'طول كل فرع [AC] من النجمة $= 10 \\times \\dfrac{1 + \\sqrt{5}}{2} \\approx 16{,}18\\,\\mathrm{cm}$ (قطر الخماسي).',
};

/** مدخل الباب (p. 151) — « نجمة البحر », doublon déclaré dans ce درس (module 1). */
export const NATURE = {
  source: src('intro-nature', 151, 'مدخل الباب'),
  text: 'يُعتبر الخماسي المنتظم شكلا نادرا جدا، و هذا الشكل يمكن تشكيله من رؤوس نجمة بحرية.',
};

/** نشاط 5 (p. 153) — « المضلعات المنتظمة » (seule la partie « المثلث المتقايس الأضلاع » existe dans le manuel). */
export const ACTIVITY = {
  source: src('act-5', 153, 'أنشطة', 5),
  title: 'المضلعات المنتظمة',
  situation: 'نجمة العلم الجزائري في تيفو المدرجات: خمسة رؤوس تبدو متساوية البعد عن المركز. قبل نجمة العلم، يبدأ الكتاب بأبسط مضلع منتظم: المثلث المتقايس الأضلاع في دائرته.',
  intro: 'المثلث المتقايس الأضلاع: انقل المثلث متقايس الأضلاع MPN والدائرة المحيطة به.',
  a: 'أ) ارسم الزاوية المركزية التي تحصر مع الزاوية $\\widehat{NMP}$ نفس القوس، وعيّن قيسها.',
  b: 'ب) أعد نفس العمل مع كل من الزاويتين $\\widehat{MNP}$ و $\\widehat{MPN}$ .',
  c: 'جـ) حدّد مركز وزاوية الدوران الذي يحول P الى M، وعيّن صورة كل من النقطتين M و N بهذا الدوران.',
  questions: [
    'ارسم الزاوية المركزية التي تحصر مع الزاوية NMP نفس القوس، وعيّن قيسها.',
    'أعد نفس العمل مع الزاويتين MNP و MPN.',
    'حدّد مركز وزاوية الدوران الذي يحوّل P إلى M، وعيّن صورتي M و N.',
  ],
  closing: 'الزوايا المركزية الثلاث متقايسة ومجموعها $360^\\circ$ ، والدوران الذي مركزه O وزاويته $120^\\circ$ في الاتجاه المباشر يحوّل P إلى M، و M إلى N، و N إلى P : المثلث صورة نفسه.',
};

/** Ce que la plateforme écrit des réponses du نشاط 5 (le livre les demande sans les écrire) — calculées (extraction › answer). */
export const ACTIVITY_LINES = {
  source: PLATFORM,
  a: '$\\widehat{NOP} = 120^\\circ$ : الزاوية المركزية ضعف الزاوية المحيطية التي تحصر معها نفس القوس، و $\\widehat{NMP} = 60^\\circ$ (زاوية مثلث متقايس الأضلاع).',
  b: '$\\widehat{MON} = \\widehat{POM} = 120^\\circ$ : الزوايا المركزية الثلاث متقايسة ومجموعها $3 \\times 120^\\circ = 360^\\circ$ .',
  c: 'OP = OM و $\\widehat{POM} = 120^\\circ$ في الاتجاه المباشر: الدوران الذي مركزه O وزاويته $120^\\circ$ يحوّل P إلى M، ويحوّل M إلى N و N إلى P.',
};

/** Le geste du lab, écrit par la plateforme (la brique du module 1) — la généralisation du نشاط 5 et du تحدّ. */
export const FORGE_LINE = {
  source: PLATFORM,
  text: 'في الورشة: رؤوس المضلع المنتظم ذي n ضلعا صور متتالية لرأس واحد بالدوران الذي مركزه مركز المضلع وزاويته $\\alpha$ . الحلقة تنغلق على الرأس الأول إذا وفقط إذا كان $n \\times \\alpha = 360^\\circ$ ، أي $\\alpha = \\dfrac{360^\\circ}{n}$ .',
  open: 'إذا لم يكن $360 \\div \\alpha$ عددا صحيحا (مثلا $360 \\div 50 = 7{,}2$) فإن الصور تتجاوز الرأس الأول ولا تنغلق الحلقة مضلعا.',
};

/** معارف 5 (p. 156) — « المضلعات المنتظمة ». */
export const KNOW5 = {
  source: src('know-5', 156, 'معارف', 5),
  title: 'المضلعات المنتظمة',
  definition: 'تعريف: نسمّي مضلعا منتظما كل مضلّع أضلاعه كلّها لها نفس الطول وزواياه كلّها متقايسة.',
  p1: 'خاصية 1: توجد دائرة تشمل كل رؤوس مضلع منتظم، تُسمّى الدائرة المحيطة بهذا المضلع ويُسمى مركزها مركز المضلع المنتظم.',
  p2: 'خاصية 2: الزوايا المركزية التي كل منها تحصر ضلعا في مضلع منتظم متقايسة، وكل منها تساوي $\\left(\\dfrac{360^\\circ}{n}\\right)$ حيث $n$ عدد أضلاع المضلّع.',
  p3: 'خاصية 3: إذا كان [AB] ضلعا في مضلع منتظم مركزه O، فإن صورة هذا المضلع بالدّوران الذي مركزه O وزاويته $\\widehat{AOB}$ هو المضلع نفسه.',
  examples: [
    { name: 'مثلث متقايس الأضلاع', formula: '$\\widehat{AOB} = \\left(\\dfrac{360^\\circ}{3}\\right) = 120^\\circ$', figure: 'tri' },
    { name: 'مربع', formula: '$\\widehat{AOB} = \\left(\\dfrac{360^\\circ}{4}\\right) = 90^\\circ$', figure: 'sq' },
    { name: 'سداسي منتظم', formula: '$\\widehat{AOB} = \\left(\\dfrac{360^\\circ}{6}\\right) = 60^\\circ$', figure: 'hex' },
  ],
};

/** طرائق (p. 157) — « حساب قيس زاوية مضلع منتظم » (dernière ligne corrigée : 108° et non 180°). */
export const METHOD_ANGLE = {
  source: src('method-angle', 157, 'طرائق'),
  title: 'حساب قيس زاوية مضلع منتظم',
  exercise: 'تمرين: ABCDE خماسي منتظم مركزه O. ما هو قيس الزاوية $\\widehat{BAE}$ .',
  solution: [
    'حل: عدد أضلاع ABCDE هو 5 إذن قيس الزاوية المركزية $\\widehat{AOE}$ هو $\\dfrac{360^\\circ}{5}$ أي $72^\\circ$ .',
    'المثلث AOE متساوي الساقين رأسه الأساسي هو O إذن $\\widehat{OAE} = \\widehat{OEA} = \\dfrac{180^\\circ - 72^\\circ}{2} = 54^\\circ$',
    'نستنتج عندئذ أن $\\widehat{BAE} = 2 \\times \\widehat{OAE} = 2 \\times 54^\\circ$ أي $\\widehat{BAE} = 108^\\circ$',
  ],
  correction: 'صحّحت المنصّة خطأً مطبعيًا: الكتاب يكتب في السطر الأخير «$\\widehat{BAE} = 180^\\circ$» ، والصحيح $2 \\times 54^\\circ = 108^\\circ$ (وهي القيمة التي تستعملها الطريقة التالية).',
  // la généralisation (extraction › answer.general), déclarée : la formule n'est pas imprimée dans les معارف
  general: 'زاوية مضلع منتظم ذي n ضلعا: $\\dfrac{(n-2) \\times 180^\\circ}{n}$ ، أي $180^\\circ - \\dfrac{360^\\circ}{n}$ (للخماسي $\\dfrac{3 \\times 180^\\circ}{5} = 108^\\circ$).',
  bisector: 'نستعمل أن (OA) منصّف للزاوية $\\widehat{BAE}$ : المثلثان OAB و OAE متقايسان (OA مشترك، OB = OE، AB = AE).',
};

/** طرائق (p. 157) — « إنشاء مضلع منتظم عُلم طول ضلعه » (les médiatrices nommées (Δ1), (Δ2) comme sur la figure). */
export const METHOD_CONSTRUCT = {
  source: src('method-construct', 157, 'طرائق'),
  title: 'إنشاء مضلع منتظم عُلم طول ضلعه',
  exercise: 'تمرين: أنشئ خماسيًّا منتظما ABCDE حيث AB = 3cm.',
  solution: [
    'حل: لدينا AB = AE و $\\widehat{BAE} = 108^\\circ$ (التمرين السابق)',
    'إذن يمكن إنشاء النقطة E صورة B بالدّوران الذي مركزه A و زاويته $108^\\circ$ .',
    'ننشئ المستقيم $(\\Delta_1)$ محور [AB] و المستقيم $(\\Delta_2)$ محور [AE].',
    '$(\\Delta_1)$ و $(\\Delta_2)$ متقاطعان في نقطة O و OA = OB = OE.',
    'O هي مركز الدّائرة المحيطة بالمثلث ABE و هي مركز ABCDE.',
    'ثم ننشئ الرأسين C و D بالمدور بحيث BC = CD = AB.',
  ],
  naming: 'سمّى الكتاب المحورين $(D_1)$ و $(D_2)$ في النص و $(\\Delta_1)$ و $(\\Delta_2)$ على الشكل: نستعمل اسما واحدا، اسم الشكل.',
};

/** طرائق (p. 157) — « حساب طول ضلع مضلع منتظم عُلم نصف قطر الدّائرة المحيطة به ». */
export const METHOD_SIDE = {
  source: src('method-side', 157, 'طرائق'),
  title: 'حساب طول ضلع مضلع منتظم عُلم نصف قطر الدّائرة المحيطة به',
  exercise: 'تمرين: ABC مثلث متقايس الأضلاع و (E) الدّائرة المحيطة به، مركزها O و نصف قطرها $\\sqrt{3}$ . الوحدة هي السنتيمتر. احسب القيمة المضبوطة لطول ضلع هذا المثلث.',
  solution: [
    'حل: في المثلث ABC، الارتفاع (OH) هو أيضا منصّف الزاوية $\\widehat{AOB}$ و محور القطعة [AB]. لدينا $\\widehat{ACB} = 60^\\circ$ إذن $\\widehat{AOB} = 120^\\circ$ و منه $\\widehat{HOA} = 60^\\circ$ .',
    'في المثلث OAH القائم في H، لدينا $\\widehat{OAH} = 90^\\circ - 60^\\circ = 30^\\circ$ .',
    'لدينا $\\cos\\widehat{OAH} = \\dfrac{AH}{OA} = \\dfrac{AH}{\\sqrt{3}}$ أي $\\cos 30^\\circ = \\dfrac{AH}{\\sqrt{3}}$ أي $AH = \\sqrt{3} \\times \\cos 30^\\circ$',
    'و نستنتج أن $AH = \\sqrt{3} \\times \\dfrac{\\sqrt{3}}{2}$ لدينا $AB = 2 \\times AH = 3$ إذن AB = 3cm.',
  ],
  general: 'ضلع المثلث المتقايس الأضلاع المحاط بدائرة نصف قطرها r هو $r\\sqrt{3}$ ؛ ضلع المربع $r\\sqrt{2}$ ؛ ضلع السداسي المنتظم $r$ ؛ وفي الحالة العامة $2r\\sin\\dfrac{180^\\circ}{n}$ (المثلث القائم ونصف الزاوية المركزية).',
};

/** دوري الآن (p. 157) — l'heptagone (pas de figure dans le manuel : figure de la plateforme). */
export const NOW157 = {
  source: src('now-157', 157, 'دوري الآن', 1),
  text: 'ABCDEFG سباعي منتظم مركزه O. احسب القيمة المضبوطة للزاوية $\\widehat{AOB}$ ثم للزاوية $\\widehat{ABC}$ . عيّن المدوّر إلى الوحدة لكل منهما.',
  answer: '$\\widehat{AOB} = \\dfrac{360^\\circ}{7} \\approx 51^\\circ$ و $\\widehat{ABC} = 180^\\circ - \\dfrac{360^\\circ}{7} = \\dfrac{900^\\circ}{7} \\approx 129^\\circ$ .',
};

/** أؤكّد تعلّماتي (p. 160) — l'item 4 (doublon déclaré dans ce درس, module 8). */
export const QCM4 = {
  source: src('qcm', 160, 'أؤكّد تعلّماتي', 4),
  text: 'المضلع الآتي',
  why: 'الأضلاع متقايسة لكن الزوايا لا: $\\widehat{A} = \\widehat{E} = 90^\\circ$ ، $\\widehat{B} = \\widehat{D} = 150^\\circ$ ، $\\widehat{C} = 60^\\circ$ (زاوية الخماسي المنتظم $108^\\circ$).',
};

/**
 * Les AIDES de la carte (knowledgeGraph.js) : les erreurs et la mise en garde que la leçon corrige — écrites ici une
 * fois, montrées par les modules (explications, corrections) et citées par la carte mot pour mot.
 */
export const AIDS = {
  adla: 'المعين الذي ليس مربعا أضلاعه الأربعة متقايسة لكن زواياه ليست متقايسة: ليس مضلعا منتظما. يلزم الشرطان معا.',
  rect: 'المستطيل الذي ليس مربعا زواياه الأربع قائمة لكن أضلاعه ليست متقايسة: ليس مضلعا منتظما.',
  wrong180: 'قسمة $180^\\circ$ على عدد الأضلاع بدل $360^\\circ$ .',
  why180: 'الزوايا المركزية التي تحصر الأضلاع تملأ دورة كاملة حول المركز: مجموعها $360^\\circ$ .',
  right180: 'للثماني المنتظم: $\\dfrac{360^\\circ}{8} = 45^\\circ$ ، لا $22{,}5^\\circ$ .',
  wrongDil: 'أخذ ضلع المضلع المنتظم مساويا لنصف القطر في كل الحالات.',
  whyDil: 'هذا صحيح للسداسي المنتظم فقط: مثلثاته الستة متقايسة الأضلاع لأن زاويتها المركزية $60^\\circ$ .',
  rightDil: 'ضلع المثلث المتقايس الأضلاع المحاط بدائرة نصف قطرها $\\sqrt{3}$ هو $3$ ، لا $\\sqrt{3}$ .',
  takeaway: 'المضلع المنتظم ذو n ضلعا: رؤوسه على دائرة، وكل رأس صورة الذي قبله بالدوران الذي مركزه مركز المضلع وزاويته $\\dfrac{360^\\circ}{n}$ .',
};

/**
 * « أستعدّ » — l'item 1 du manuel (p. 151 ; les items 2–5 sont aux autres دروس) et quatre affirmations de la plateforme
 * sur les acquis que la leçon mobilise : le triangle isocèle (طريقة 108°), l'image d'un point par une rotation (درس 1),
 * la relation inscrit / au centre (درس 3), le sinus dans un triangle rectangle (unité 10). Aucune n'utilise les nombres
 * du lab (50°, 60°, 72°) ni ceux du نشاط 5 (120°).
 */
const PREP_ADD = addition('prerequisite_diagnostic');
export const PREP_ITEMS = [
  { n: '1', skill: 'zawaya', text: 'المثلث ABC المقابل متقايس الأضلاع.', answer: true, figure: 'prep1',
    why: '$\\widehat{ACB} = \\widehat{ABC} = 60^\\circ$ إذن $\\widehat{BAC} = 180^\\circ - 60^\\circ - 60^\\circ = 60^\\circ$ : الزوايا الثلاث متقايسة.', source: src('prep', 151, 'أستعدّ', 1) },
  { n: 'p1', skill: 'saqayn', text: 'ABC مثلث متساوي الساقين رأسه الأساسي A حيث $\\widehat{BAC} = 40^\\circ$ . إذن $\\widehat{ABC} = 40^\\circ$ .', answer: false,
    why: 'زاويتا القاعدة متقايستان ومجموع الزوايا $180^\\circ$ : $\\widehat{ABC} = \\dfrac{180^\\circ - 40^\\circ}{2} = 70^\\circ$ .', source: PREP_ADD },
  { n: 'p2', skill: 'dawaran', text: 'M′ صورة M بالدوران الذي مركزه O وزاويته $35^\\circ$ يعني $OM\' = OM$ و $\\widehat{MOM\'} = 35^\\circ$ في اتجاه الدوران.', answer: true,
    why: 'هذا تعريف صورة نقطة بدوران (الدرس 1): نفس البعد عن المركز، والزاوية، والاتجاه.', source: PREP_ADD },
  { n: 'p3', skill: 'muhitiya', text: 'في دائرة مركزها O، إذا كانت الزاوية المحيطية $\\widehat{AMB} = 40^\\circ$ فإن الزاوية المركزية $\\widehat{AOB}$ التي تحصر معها نفس القوس قيسها $20^\\circ$ .', answer: false,
    why: 'الزاوية المحيطية نصف الزاوية المركزية التي تحصر معها نفس القوس: $\\widehat{AOB} = 2 \\times 40^\\circ = 80^\\circ$ .', source: PREP_ADD },
  { n: 'p4', skill: 'nisab', text: 'OHA مثلث قائم في H. إذن $\\sin\\widehat{AOH} = \\dfrac{AH}{OA}$ .', answer: true,
    why: 'جيب زاوية حادة = طول الضلع المقابل على طول الوتر: المقابل للزاوية في O هو [AH] والوتر [OA] (الوحدة 10).', source: PREP_ADD },
];

/** Les deux mondes du lab (levels.js) : مبتدئ = l'alvéole de ruche (plateforme) ; متقدم = le تحدّ du manuel. */
export const LAB = {
  beginner: { source: PLATFORM, numbers: { n: 6, r: 3 } },
  advanced: { source: CHALLENGE.source, numbers: { n: 5, tip: 10, star: 2 } },
};
