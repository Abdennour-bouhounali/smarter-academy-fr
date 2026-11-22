/**
 * Le contenu du MANUEL pour le درس « مفهوم الدوران وإنشاء صور أشكال هندسية بدوران » (unité 13, entrée de l'unité) —
 * données pures (aucun JSX), au mot près ; chaque bloc cite son élément de docs/sources/4am/unit13/extraction.json :
 * أستعدّ 3 (p. 151, module 0), نشاط 1, 2, 3 (pp. 152–153, module 1), معارف 1 et 2 (p. 154, module 2), طرائق تمرين 1 et 2 et
 * دوري الآن (p. 155, module 3 ; le دوري الآن est un doublon déclaré du درس « خواص الدوران »), أؤكّد تعلّماتي 1 (p. 160, doublon,
 * CORRIGÉ « صورة B » — module 8). Ce que la plateforme ajoute est déclaré (`addition(…)`).
 */
import { src, addition } from '../../_unit/unitMeta.js';

const PLATFORM = addition('interaction_generation');
export const PLATFORM_SOURCE = PLATFORM;

/** نشاط 1 (p. 152) — « مقاربة تجريبية للدوران ». */
export const ACTIVITY = {
  source: src('act-1', 152, 'أنشطة', 1),
  title: 'مقاربة تجريبية للدوران',
  situation: 'في حديقة التسلية ببن عكنون تدور العجلة الكبيرة حول محورها: كل مقصورة ترسم دائرة، وكلها تدور بنفس الزاوية. ما هي هذه الحركة، وكيف ننشئ المكان الذي تصل إليه مقصورة؟',
  intro: 'لاحظ الأشكال (F)، $(F_1)$ ، (F′) المقابلة.',
  part1: '1) أ) كيف نحصل على الشّكل $(F_1)$ انطلاقا من الشّكل (F)؟ ب) كيف نحصل على الشّكل (F′) انطلاقا من الشّكل $(F_1)$ ؟ جـ) هل يمكن رسم الشّكل (F′) انطلاقا من الشّكل (F) بطريقة مماثلة لما وجدت في الجزأين أ) و ب)؟ اشرح.',
  part2: '2) انقل الشّكل (F) والنقطة O على ورق شفاف، ثمّ ثبّته بوضع إبرة المدور على النقطة O، ودوّر الورق الشفاف في اتجاه حركة عقارب الساعة حتى ينطبق الشّكل (F) على الشّكل (F′). على أيّ نقطة تنطبق النقطة A؟ والنقطة B؟ والنقطة C؟',
  naming: 'نقول إنّ النقطة A′ هي صورة النقطة A بالدوران الذي مركزه O وزاويته $\\widehat{AOA\'}$ .',
  part2b: 'قارن بين كل طولين: OA و OA′، OB و OB′، OC و OC′. تحقّق من أنّ $\\widehat{AOA\'} = \\widehat{BOB\'} = \\widehat{COC\'}$ . انقل ما يلي وأتمم: «نتحصّل على الشّكل (F′) انطلاقا من الشّكل (F) بـ … مركزه النقطة … وزاويته …»',
  questions: [
    'كيف نحصل على $(F_1)$ من (F)، ثم على (F′) من $(F_1)$ ؟ هل يمكن ذلك من (F) مباشرة بنفس الطريقة؟',
    'على أي نقطة تنطبق A و B و C؟ قارن OA و OA′، وتحقّق من تساوي الزوايا.',
    'أتمم: نتحصّل على (F′) انطلاقا من (F) بـ … مركزه … وزاويته …',
  ],
  closing: 'نتحصّل على الشّكل (F′) انطلاقا من الشّكل (F) بالدوران الذي مركزه النقطة O وزاويته $90^\\circ$ في اتجاه حركة عقارب الساعة.',
};
/** Ce que la plateforme écrit des réponses du نشاط 1 (le livre les demande sans les écrire) — extraction › answer, calculées. */
export const ACTIVITY_LINES = {
  source: PLATFORM,
  f1: '$(F_1)$ نظير (F) بالنسبة إلى المستقيم الشاقولي المار بـ O (تناظر محوري).',
  f2: '(F′) نظير $(F_1)$ بالنسبة إلى المستقيم المار بـ O والذي يصنع $45^\\circ$ مع الأفقي.',
  f3: 'لا يمكن بتناظر محوري واحد ولا بانسحاب: يلزم تناظران متتاليان، أو «تدوير» الشكل حول O.',
  points: 'A تنطبق على A′، و B على B′، و C على C′.',
  lengths: '$OA = OA\' = \\sqrt{10}$ ، $OB = OB\' = \\sqrt{37}$ ، $OC = OC\' = 2\\sqrt{13}$ (بضلع مربع الرصف وحدةً).',
  angles: '$\\widehat{AOA\'} = \\widehat{BOB\'} = \\widehat{COC\'} = 90^\\circ$',
};

/** نشاط 2 (p. 152) — « إنشاء صورة نقطة بدوران » : le شريط de quatre vignettes. */
export const ACTIVITY_2 = {
  source: src('act-2', 152, 'أنشطة', 2),
  title: 'إنشاء صورة نقطة بدوران',
  intro: 'يعرض الشريط التالي مراحل إنشاء صورة نقطة A بالدوران مركزه O وزاويته $70^\\circ$ في اتجاه السّهم.',
  part1: '1) صِفْ مراحل الإنشاء التي يعرضها الشريط أعلاه. 2) نفذ البرنامج الذي وصَفته في السؤال 1).',
  part3: '3) عيّن نقطة أخرى B تختلف عن O و A وأنشئ صورتها بهذا الدوران.',
  steps: [
    'نرسم الدائرة (𝒞) التي مركزها O ونصف قطرها OA (المدور).',
    'نضع مركز المنقلة على O وصفرها على [OA) ونعلّم $70^\\circ$ في اتجاه السهم (الاتجاه المباشر).',
    'نرسم نصف المستقيم الذي مبدؤه O ويمرّ بالعلامة: يقطع (𝒞) في A′.',
    'A′ تحقّق OA′ = OA و $\\widehat{AOA\'} = 70^\\circ$ .',
  ],
  answer3: 'نفس البرنامج مع الدائرة التي مركزها O وتشمل B: OB′ = OB و $\\widehat{BOB\'} = 70^\\circ$ في نفس الاتجاه.',
};

/** نشاط 3 (pp. 152–153) — « صور بعض الأشكال الهندسية بدوران » (72° dans le sens direct). */
export const ACTIVITY_3 = {
  source: src('act-3', 152, 'أنشطة', 3),
  title: 'صور بعض الأشكال الهندسية بدوران',
  intro: 'في كل ما يلي، O مركز الدوران الذي زاويته $72^\\circ$ في الاتجاه المباشر. ننشئ صورة كل شكل من الأشكال الآتية :',
  segment: 'أ) قطعة مستقيم: [AB] قطعة مستقيم. أنشئ A′ و B′ صورتي A و B بهذا الدوران. ماهي صورة القطعة [AB] بهذا الدوران؟',
  line1: 'ب) مستقيم: (d) مستقيم و A نقطة من (d). الحالة الأولى: O تنتمي إلى (d). A تختلف عن O. أنشئ O′ و A′ صورتي O و A بهذا الدوران. استنتج صورة (d).',
  line2: 'الحالة الثانية: O لا تنتمي إلى (d). قالت غنيمة: «لإنشاء صورة (d)، يكفي إنشاء صورة نقطتين مختلفتين من (d) بهذا الدوران». هل توافقها؟ اشرح. A و B نقطتان مختلفتان من (d). A′ و B′ صورتا A و B بهذا الدوران على الترتيب. أنشئ A′ و B′ ثم صورة (d) بنفس الدوران.',
  ray: 'جـ) نصف مستقيم: [Ax) نصف مستقيم، أنشئ A′ و B′ صورتا A و B بنفس الدوران ثم استنتج صورة نصف مستقيم [Ax).',
  circle: 'د) دائرة: (𝒞) هي دائرة مركزها W و A نقطة من (𝒞). أنشئ W′ و A′ صورتي W و A بنفس الدوران. استنتج (𝒞′) صورة (𝒞) بهذا الدوران.',
  // l'écart « reading » de l'extraction : les figures de la droite ont été rattachées à leur cas
  reattached: 'في الكتاب وُضع شكل الحالة الثانية (O خارج (d)) مقابل الحالة الأولى؛ ربطت المنصّة كل شكل بحالته.',
};
/** Les conclusions du نشاط 3 (extraction › answer, calculées) — ce que la plateforme écrit sous les constructions. */
export const ACTIVITY_3_LINES = {
  source: PLATFORM,
  segment: 'صورة القطعة [AB] هي القطعة [A′B′]، و A′B′ = AB = 4.',
  line1: 'O′ = O (المركز صورة نفسه)، فصورة (d) هي المستقيم (OA′): يمرّ بـ O ويصنع زاوية $72^\\circ$ مع (d).',
  line2: 'نعم: صورة مستقيم بدوران مستقيم، ويكفي إنشاء صورتي نقطتين مختلفتين منه؛ صورة (d) هي المستقيم (A′B′)، و (d) و (A′B′) يصنعان زاوية $72^\\circ$ .',
  ray: 'صورة [Ax) هي نصف المستقيم [A′B′) الذي مبدؤه A′ صورة المبدأ A.',
  circle: '(𝒞′) هي الدائرة التي مركزها W′ ونصف قطرها W′A′ = WA (نفس نصف القطر).',
};

/** معارف 1 (p. 154) — « الدوران ». */
export const KNOW1 = {
  source: src('know-1', 154, 'معارف', 1),
  title: 'الدوران',
  definition: 'تعريف: تحويل شكل بدوران هو تدويره بزاوية معيّنة حول نقطة ثابتة وفي اتجاه معيّن.',
  remark: 'ملاحظة: يتميّز الدوران بزاوية واتجاه ومركز هو النقطة التي دوّرنا حولها.',
  convention: 'اصطلاح: يُسمّى الاتجاه المعاكس لاتجاه عقارب الساعة الاتجاه المباشر أو الاتجاه الموجب. كما يُسمّى الاتجاه الآخر الاتجاه غير المباشر أو الاتجاه السالب.',
  example: 'مثال: الشّكل (F′) هو صورة الشّكل (F) بالدوران الذي مركزه O وزاويته $90^\\circ$ ، في اتجاه حركة عقارب الساعة.',
};

/** معارف 2 (p. 154) — « صورة نقطة بدوران علم مركزه وقيس زاويته ». */
export const KNOW2 = {
  source: src('know-2', 154, 'معارف', 2),
  title: 'صورة نقطة بدوران علم مركزه وقيس زاويته',
  definition: 'تعريف: O نقطة معلومة و $\\alpha$ زاوية. صورة نقطة M تختلف عن O بالدوران الذي مركزه O وزاويته $\\alpha$ في اتجاه معيّن هي النقطة M′ حيث OM′ = OM و $\\widehat{MOM\'} = \\alpha$ .',
  remark: 'ملاحظة: صورة نقطة O بالدّوران الذي مركزه O هي النقطة O نفسها.',
  special: 'حالة خاصة: الدّوران الذي مركزه O وزاويته $180^\\circ$ هو التناظر بالنسبة إلى النقطة O.',
  example1: 'مثال: على الشّكل المقابل A′ صورة A بالدّوران الذي مركزه O وزاويته $35^\\circ$ في الاتجاه المباشر. M′ هي صورة M بنفس الدّوران حيث OM′ = OM و $\\widehat{MOM\'} = 35^\\circ$ .',
  example2: 'مثال: النقطة M′ هي صورة النقطة M بالدوران الذي مركزه O وزاويته $180^\\circ$ ، وبالتناظر الذي مركزه O.',
  // le manuel réutilise la lettre α dans le premier exemple ; ici α = 35°
  alphaNote: 'في هذا المثال $\\alpha = 35^\\circ$ .',
};

/** طرائق (p. 155) — « إنشاء صور أشكال هندسية » : تمرين 1 (un point) et تمرين 2 (une قطعة). */
export const METHOD_POINT = {
  source: src('method-point', 155, 'طرائق', 1),
  exercise: 'تمرين 1: O، A نقطتان متمايزتان. أنشئ A′ صورة النقطة A بالدّوران الذي مركزه O و زاويته $50^\\circ$ في الاتجاه المباشر.',
  solution: [
    'حل: رسم نصف المستقيم [OA).',
    'نستعمل منقلة ومسطرة ونرسم [Ox) حيث $\\widehat{AOx} = 50^\\circ$ في الاتجاه المباشر.',
    'نستعمل المدور لتعيين النقطة A′ على نصف المستقيم [Ox) حيث OA = OA′.',
  ],
};
export const METHOD_SEGMENT = {
  source: src('method-segment', 155, 'طرائق', 2),
  exercise: 'تمرين 2: انقل الشّكل المعطى، وأنشئ صورة القطعة [AB] بالدّوران الذي مركزه O وزاويته $40^\\circ$ في الاتجاه غير المباشر.',
  solution: [
    'حل: ننشئ A′ صورة A و B′ صورة B بالدّوران الذي مركزه O وزاويته $40^\\circ$ في الاتجاه السالب.',
    'نرسم القطعة [A′B′].',
    'القطعة [A′B′] هي صورة [AB] بالدّوران المعطى.',
  ],
  rule: 'طريقة: لإنشاء صورة قطعة مستقيم بدوران، يكفي إنشاء صورتي طرفيها ورسم قطعة المستقيم المحدّدة بالصورتين.',
};
/** دوري الآن (p. 155) — doublon déclaré (le درس « خواص الدوران » en est l'hôte) : la construction point par point. */
export const NOW_155 = {
  source: src('now-155', 155, 'دوري الآن', 1),
  text: '$\\widehat{AOB}$ زاوية قيسها $45^\\circ$ . أنشئ صورة هذه الزاوية بالدوران الذي مركزه K و زاويته $60^\\circ$ في الاتجاه المباشر.',
  answer: 'ننشئ O′ و A′ و B′ صور O و A و B بالدوران الذي مركزه K، ثم نصفي المستقيمين [O′A′) و [O′B′): صورة الزاوية $\\widehat{AOB}$ هي الزاوية $\\widehat{A\'O\'B\'}$ .',
  later: 'قيس الزاوية الصورة سنبرهنه في الدرس الموالي «خواص الدوران».',
};

/** « أؤكّد تعلّماتي » (p. 160) — item 1 (doublon dans le إختبار أولي), avec la coquille CORRIGÉE (extraction › discrepancies). */
export const QCM1 = {
  source: src('qcm', 160, 'أؤكّد تعلّماتي', 1),
  text: 'في الشكل: بالدوران الذي مركزه O و زاويته $60^\\circ$ في الاتجاه المباشر',
  correction: 'صحّحت المنصّة خطأً مطبعيًا: الكتاب يسأل «صورة A هي»، وصورة A لا تقع على أي رأس من رؤوس المستطيل؛ السؤال الصحيح «صورة B هي».',
};

/** Les erreurs que la leçon corrige (le لماذا vient des معارف) — citées par la carte (knowledgeGraph.js). */
export const MISTAKES = {
  sense: {
    wrong: 'الدوران بزاوية $60^\\circ$ في الاتجاه المباشر والدوران بزاوية $60^\\circ$ في الاتجاه غير المباشر يعطيان نفس الصورة.',
    right: 'في العجلة: بزاوية $60^\\circ$ في الاتجاه المباشر تصل المقصورة A إلى مكان B، وفي الاتجاه غير المباشر إلى مكان F — صورتان مختلفتان.',
  },
  radius: {
    wrong: 'تكفي الزاوية: كل نقطة M′ تحقّق $\\widehat{MOM\'} = \\alpha$ هي صورة M.',
    right: 'على المصباح الداخلي للعجلة الزاوية صحيحة لكن البعد عن O تغيّر: يلزم أيضا OM′ = OM.',
  },
};

/**
 * « أستعدّ » — l'item 3 du manuel (p. 151 ; 1–2 sont au درس « المضلعات المنتظمة », 4–5 au درس « الزاوية المحيطية ») et
 * cinq affirmations de la plateforme sur les prérequis du propriétaire : les symétries et la translation (les
 * « التحويلات النقطية السابقة »), le compas et la منقلة. Une affirmation par compétence. Aucune n'utilise 70°, 72° ou 90°
 * (les nombres des activités).
 */
const PREP_ADD = addition('prerequisite_diagnostic');
export const PREP_ITEMS = [
  { n: '3', skill: 'zawaya', figure: 'prep3', text: 'في الشكل المقابل، قيس الزاوية $\\widehat{zOy}$ هو $55^\\circ$ .', answer: false, why: 'x، O، z في استقامية: $\\widehat{zOy} = 180^\\circ - 145^\\circ = 35^\\circ$ (الزاويتان متكاملتان) لا $55^\\circ$ .', source: src('prep', 151, 'أستعدّ', 3) },
  { n: 'p1', skill: 'mihwari', text: 'صورة النقطة M بالتناظر بالنسبة إلى المستقيم (d) هي النقطة M′ حيث (d) محور القطعة [MM′].', answer: true, why: 'هذا تعريف التناظر المحوري: (d) يعامد [MM′] في منتصفها.', source: PREP_ADD },
  { n: 'p2', skill: 'markazi', text: 'صورة النقطة M بالتناظر بالنسبة إلى النقطة O هي النقطة M′ حيث M منتصف القطعة [OM′].', answer: false, why: 'في التناظر المركزي O هي منتصف [MM′]، لا M.', source: PREP_ADD },
  { n: 'p3', skill: 'insihab', text: 'الانسحاب الذي يحوّل E إلى F يحوّل كل نقطة M إلى النقطة M′ حيث $\\overrightarrow{MM\'} = \\overrightarrow{EF}$ .', answer: true, why: 'كل النقط تتحرّك بنفس الشعاع $\\overrightarrow{EF}$ (الدرس السابق).', source: PREP_ADD },
  { n: 'p4', skill: 'mudawwar', text: 'كل النقط التي تبعد عن النقطة K بـ $4\\,\\mathrm{cm}$ تقع على الدائرة التي مركزها K ونصف قطرها $4\\,\\mathrm{cm}$ .', answer: true, why: 'الدائرة هي مجموعة النقط التي تبعد عن مركزها نفس البعد: نرسمها بالمدور بفتحة $4\\,\\mathrm{cm}$ .', source: PREP_ADD },
  { n: 'p5', skill: 'minqala', text: 'لقيس الزاوية $\\widehat{xSy}$ بالمنقلة نضع مركز المنقلة على النقطة x.', answer: false, why: 'نضع مركز المنقلة على رأس الزاوية S، وصفرها على أحد ضلعيها.', source: PREP_ADD },
];

/** Les deux mondes du lab (levels.js) : مبتدئ = la grande roue (plateforme) ; متقدم = les نشاطان 2 et 3 du manuel. */
export const LAB = {
  beginner: { source: PLATFORM, numbers: { scene: 'wheel', r: 3, inner: 1.8, gondolas: 6, step: 60, tasks: [['A', 1, 'direct'], ['A', 1, 'indirect'], ['C', 2, 'direct'], ['C', 2, 'indirect']] } },
  advanced: {
    source: ACTIVITY_2.source,
    numbers: {
      scene: 'plane',
      missions: [
        { id: 'point', alpha: 70, direction: 'direct', points: { A: [3, 1], B: [-1, 2.5] } },
        { id: 'segment', alpha: 72, direction: 'direct', points: { A: [-3, 2], B: [1, 2] } },
        { id: 'circle', alpha: 72, direction: 'direct', points: { W: [-2.5, 2], A: [-2.5, 3.5] } },
      ],
    },
  },
};
