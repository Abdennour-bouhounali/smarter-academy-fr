/**
 * Le contenu du MANUEL pour le درس « معنى الجمع والطرح » (1AM, unité 2) — données pures, au mot près, chaque bloc
 * cite son élément de docs/sources/1am/unit2/extraction.json. Les modules rendent ces données ; ils n'en réécrivent
 * aucune. Les figures « مخطط بأقواس » sont des DONNÉES ArcTape (common/components/arcTape.js), vérifiées par
 * ./tapes.test.js : chacune se ferme (les parties font le tout).
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** نشاط 1 (p. 25) — « أيّ حساب أقوم به؟ » : six textes, six bulles de calcul. */
export const ACTIVITY = {
  source: src('act-1', 25, 'اكتشف', 1),
  title: 'أيّ حساب أقوم به؟',
  instruction: 'من أجل كلّ نصّ من النصوص الآتية، حدّد الحساب الواجب إجراؤه.',
  texts: [
    { n: 1, text: 'يملك يونس مبلغا قدره $24{,}5\\,\\mathrm{DA}$ ، ينقصه $11{,}5\\,\\mathrm{DA}$ لشراء كراس 120 صفحة، ما هو ثمن الكرّاس؟', card: '24,5 + 11,5', value: '36' },
    { n: 2, text: 'ما هو فرق العددين 24,5 و 11,5؟', card: '24,5 - 11,5', value: '13' },
    { n: 3, text: 'تحصلت إيناس على علامة 17,5 في الفرض الخاص بمادة الرياضيات، وبذلك زادت علامتها عن علامة زميلها يونس بـ 1,5. ما هي العلامة التي تحصّل عليها يونس ؟', card: '17,5 - 1,5', value: '16' },
    { n: 4, text: 'ما هو الحساب الذي أقوم به مستعملا العددين 17,5 و 1,5 ليظهر على شاشة آلتي الحاسبة العدد 19 ؟', card: '17,5 + 1,5', value: '19' },
    { n: 5, text: 'ما هو مجموع العددين 31,02 و 22,60؟', card: '31,02 + 22,60', value: '53,62' },
    { n: 6, text: 'بعد الزيادات في أسعار الوقود، صار سعر اللتر الواحد من البنزين بدون رصاص $31{,}02\\,\\mathrm{DA}$ بعد أن كان سعره $22{,}60\\,\\mathrm{DA}$ . ما مقدار الزيادة في اللتر الواحد؟', card: '31,02 - 22,60', value: '8,42' },
  ],
};
export const ACT = Object.fromEntries(ACTIVITY.texts.map((t) => [t.n, t]));

/**
 * LE CONTEXTE « الفحص الطبي المدرسي » — l'expérience de la plateforme au niveau مبتدئ (lab `story-bars`, histoire
 * `checkup`), jamais le manuel. La MATHÉMATIQUE est celle de نشاط 1 et de la طريقة p. 29 (choisir + ou − selon le
 * rôle de l'inconnue) ; la SITUATION est une toise, parce que « أطول / أقصر » se VOIT sur des élèves debout. Déclarée.
 */
export const CHECKUP = {
  source: addition('interaction_generation'),
  situation: 'في يوم الفحص الطبي المدرسي، وقف التلاميذ أمام مقياس القامة بنظام واحترام للدور. قامة سارة $130\\,\\mathrm{cm}$، والممرّضة تكتب قامة كل تلميذ في بطاقته الصحية من جملة واحدة يقولها لها.',
  question: 'اسحب رأس التلميذ حتى تصدق الجملة، ثم اختر الحساب الذي يعطي قامته.',
};

/** معارف 1 (p. 26) — le sens et les mots : الجمع puis الطرح. La technique (أفقيا / عموديا) est la leçon suivante. */
export const KNOWLEDGE = {
  sum: {
    source: src('know-1a', 26, 'أوظّف تعلّماتي', 1),
    definitions: ['ناتج جمع عددين، يُسمّى مجموع هذين العددين.', 'العددان اللّذان نقوم بجمعهما، يُسمّيان حدّي المجموع.'],
    example: { equality: '$24{,}3 + 5{,}9 = 30{,}2$', text: '30,2 هو مجموع العددين 24,3 و 5,9' },
  },
  difference: {
    source: src('know-1d', 26, 'أوظّف تعلّماتي', 1),
    definitions: ['نتيجة طرح عددين، تُسمّى فرق هذين العددين.', 'العددان اللّذان نقوم بطرح أحدهما من الآخر، يُسمّيان حدّي الفرق.'],
    example: { equality: '$49{,}5 - 18{,}46 = 31{,}04$', text: '31,04 هو فرق العددين 49,5 و 18,46' },
  },
};

/** طريقة (p. 29) — « حل مشكلة بالاستعانة بتمثيل مناسب ». */
export const METHOD = {
  source: src('method-3', 29, 'أكتسب طرائق', 1),
  title: 'حل مشكلة بالاستعانة بتمثيل مناسب',
  text: 'تزيد قامة يونس عن قامة زميله أكرم بـ $3\\,\\mathrm{cm}$ ، وتقلّ قامة محمد عن قامة زميله أكرم بـ $5\\,\\mathrm{cm}$ . إذا علمت أنّ طول قامة أكرم هو $124\\,\\mathrm{cm}$ ، فاحسب طول قامة كل من يونس ومحمد.',
  intro: 'إليك النتائج التي توصّلت إليها التلميذتان إيناس وهدى، والحوار الذي دار بينهما.',
  answers: { hoda: { younes: 119, mohamed: 129 }, ines: { younes: 127, mohamed: 119 } },
  dialogue: [
    { who: 'إيناس', text: 'إجابتك غير معقولة، حسب المعطيات يونس هو صاحب أطول قامة.' },
    { who: 'هدى', text: 'كلامك صحيح، لقد اختلط عليّ الأمر ، فالمعطيات كثيرة ومتداخلة. ولكن ماهي الطريقة التي انتهجتها، يا إيناس؟' },
    { who: 'إيناس', text: 'لقد قمت برسم شكل توضيحي سهّل عليّ الوصول إلى الحل .' },
    { who: 'هدى', text: 'وهل النتائج التي توصّلت إليها صحيحة؟' },
    { who: 'إيناس', text: 'أكيد، لقد تحققت من ذلك.' },
  ],
  box: 'لتفادي الالتباسات المرتبطة على الخصوص بالعبارات « يزيد، ينقص، أكثر، أقل »، يمكن الاستعانة بتمثيل معطيات عددية بقطع مستقيمات.',
  table: [
    {
      problem: 'يزيد طول إيناس بـ $14{,}2\\,\\mathrm{cm}$ عن طول أخيها يونس. إذا علمت أن طول إيناس $1\\,\\mathrm{m}\\,35\\,\\mathrm{cm}$ ، فما هو طول يونس؟',
      representation: 'إذا رمزنا إلى طول يونس بالرمز □ يمكن أن نمثّل المشكلة السابقة بالشكل:',
      computation: ['$\\square = 1\\,\\mathrm{m}\\,35\\,\\mathrm{cm} - 14{,}2\\,\\mathrm{cm}$', '$35\\,\\mathrm{cm} - 14{,}2\\,\\mathrm{cm} = 20{,}8\\,\\mathrm{cm}$', '$\\square = 1\\,\\mathrm{m}\\,20{,}8\\,\\mathrm{cm}$', 'طول يونس هو $1\\,\\mathrm{m}\\,20{,}8\\,\\mathrm{cm}$'],
    },
    {
      problem: 'يزن يوغرطة $28{,}5\\,\\mathrm{kg}$ ، وبذلك يقل وزنه عن وزن زميله أمين بـ $2{,}5\\,\\mathrm{kg}$ ، ماهو وزن أمين ؟',
      representation: 'إذا رمزنا إلى وزن أمين بالرمز △ يمكن أن نمثّل المشكلة السابقة بالشكل:',
      computation: ['$\\triangle = 28{,}5 + 2{,}5$', '$\\triangle = 31$', 'وزن أمين هو $31\\,\\mathrm{kg}$'],
    },
  ],
};

/** دوري الآن (p. 29) — les distances entre wilayas, d'est en ouest. */
export const NOW_29 = {
  source: src('now-29', 29, 'دوري الآن'),
  text: 'الجدول الآتي يتضمّن المسافات بين ولايات من الوطن.',
  table: { head: ['', 'الجزائر العاصمة', 'سطيف', 'برج بوعريريج'], rows: [['قسنطينة', '392 km', '128 km', '195 km']] },
  order: 'إذا علمت أنّ ترتيب المدن السابقة إضافة إلى مدينة البويرة ـ متجهين من الشرق إلى الغرب ـ هي كالآتي: قسنطينة، سطيف، برج بوعريريج، البويرة، الجزائر العاصمة، وأن المسافة بين الجزائر العاصمة والبويرة هي $124\\,\\mathrm{km}$، فاحسب المسافة بين سطيف وبرج بوعريريج ، والمسافة بين برج بوعريريج والبويرة.',
  answers: { setifBba: 67, bbaBouira: 73 },
};

/**
 * « أستعدّ » — استحضر مكتسباتي (p. 24), items 1, 2 et 8 (les autres items de la page vont aux leçons suivantes de
 * l'unité). Le manuel pose des QCM ; la plateforme les pose en « صحيح أم خاطئ؟ برّر » avec la justification.
 */
export const PREP_ITEMS = [
  { n: 1, skill: 'jamtarh', text: 'يملك يونس قطعة نقدية من فئة 100 دج، وأراد شراء كرّاس بـ 35 دج وقصّة بـ 75 دج. يمكنه تسديد مشترياته بهذه القطعة.', answer: false, why: 'ثمن المشتريات $35 + 75 = 110$ دج، وهو أكبر من 100 دج.' },
  { n: 2, skill: 'jamtarh', text: 'سعر لوحة رقمية عند بائع 1250 دج، وسعرها عند بائع آخر أقلّ بـ 75 دج. ثمنها عند البائع الثاني هو $1250 - 75$ أي 1175 دج.', answer: true, why: '« أقلّ بـ 75 » : نطرح 75 من 1250 ، $1250 - 75 = 1175$.' },
  { n: 8, skill: 'jamtarh', text: 'في مخطّط بأقواس، قوس ؟ وقوس 9,7 فوق الخطّ، وقوس 15,1 تحت الخطّ كلّه: نكتب $? = 15{,}1 + 9{,}7$.', answer: false, why: 'القوس 15,1 يغطّي الخطّ كلّه: ؟ و 9,7 جزءان منه، إذن $? = 15{,}1 - 9{,}7 = 5{,}4$.' },
].map((it) => ({ ...it, source: src('prep', 24, 'استحضر مكتسباتي', it.n) }));

/**
 * Les items de la PLATEFORME : le réseau des الكفاءات dit que la leçon s'appuie sur `1am.m1.r03` (ضرب وقسمة عدد عشري
 * في/على 10 ، 100 ، 1000 — leçon « الكسور العشرية والكتابة العشرية »). « أستعدّ » doit le mesurer
 * (LEARNING_NET.md §4.4).
 */
export const PREP_PLATFORM_ITEMS = [
  { skill: 'ashri', text: '$4{,}32 \\times 100 = 432$', answer: true, why: 'نضرب في 100 : تنتقل الفاصلة رتبتين نحو اليمين، $4{,}32 \\times 100 = 432$.' },
  { skill: 'ashri', text: '$36 \\div 100 = 3{,}6$', answer: false, why: 'نقسم على 100 : تنتقل الفاصلة رتبتين نحو اليسار، $36 \\div 100 = 0{,}36$.' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/**
 * LES FIGURES « مخطط بأقواس » de la leçon (ArcTape, `kind: 'tape'`). Chaque bande se FERME : les parties font le tout
 * (./tapes.test.js). L'inconnue porte le symbole du manuel (□, △, ؟).
 */
const tape = (parts, whole, ariaLabel) => ({ kind: 'tape', parts, whole, ariaLabel });
export const TAPES = {
  // معارف 1 (p. 26) : 24,3 + 5,9 = 30,2 ; 49,5 − 18,46 = 31,04.
  sum: tape([{ label: '24,3', value: '24,3' }, { label: '5,9', value: '5,9' }], { label: '30,2', value: '30,2' },
    'مخطط بأقواس: حدّا المجموع 24,3 و 5,9 فوق الخطّ، والمجموع 30,2 تحته'),
  difference: tape([{ label: '18,46', value: '18,46' }, { label: '31,04', value: '31,04' }], { label: '49,5', value: '49,5' },
    'مخطط بأقواس: 18,46 و 31,04 فوق الخطّ، و 49,5 تحته'),
  differenceUnknown: tape([{ label: '18,46', value: '18,46' }, { label: '□', unknown: true }], { label: '49,5', value: '49,5' },
    'مخطط بأقواس: 18,46 والمجهول فوق الخطّ، و 49,5 تحته'),
  // طريقة (p. 29) : إيناس = يونس + 14,2 ؛ أمين = يوغرطة + 2,5.
  method1: tape([{ label: '□', unknown: true }, { label: '14,2 cm', value: '14,2' }], { label: '1 m 35 cm', value: '135' },
    'مخطط بأقواس: طول يونس المجهول و 14,2 cm فوق الخطّ، وطول إيناس 135 cm تحته'),
  method2: tape([{ label: '28,5 kg', value: '28,5' }, { label: '2,5 kg', value: '2,5' }], { label: '△', unknown: true },
    'مخطط بأقواس: وزن يوغرطة 28,5 kg و 2,5 kg فوق الخطّ، ووزن أمين المجهول تحته'),
  method2Wrong: tape([{ label: '△', unknown: true }, { label: '2,5 kg', value: '2,5' }], { label: '28,5 kg', value: '28,5' },
    'مخطط بأقواس: وزن أمين المجهول و 2,5 kg فوق الخطّ، و 28,5 kg تحته'),
  // دوري الآن (p. 29) : قسنطينة → الجزائر 392 = 195 + ? + 124 ; قسنطينة → برج بوعريريج 195 = 128 + ?.
  routeBouira: tape([{ label: '195 km', value: '195' }, { label: '؟', unknown: true }, { label: '124 km', value: '124' }], { label: '392 km', value: '392' },
    'مخطط بأقواس: قسنطينة - برج بوعريريج 195 km ، برج بوعريريج - البويرة مجهولة ، البويرة - الجزائر 124 km فوق الخطّ، وقسنطينة - الجزائر 392 km تحته'),
  // تمرين 17 (p. 30) : le tout = la شاحنة + la عربة (18,30 m) ; la حافلة et 2,70 m en sont les parties.
  ex17: tape([{ label: 'طول الحافلة □', unknown: true }, { label: '2,70 m', value: '2,70' }], { label: '10,50 m + 7,80 m', value: '18,30' },
    'مخطط بأقواس: طول الحافلة المجهول و 2,70 m فوق الخطّ، ومجموع طولي الشاحنة والعربة تحته'),
  routeSetif: tape([{ label: '128 km', value: '128' }, { label: '؟', unknown: true }], { label: '195 km', value: '195' },
    'مخطط بأقواس: قسنطينة - سطيف 128 km وسطيف - برج بوعريريج مجهولة فوق الخطّ، وقسنطينة - برج بوعريريج 195 km تحته'),
};

/**
 * Les phrases de correction partagées par les modules ET par la carte (knowledgeGraph.js les cite mot pour mot) :
 * le piège du mot (نشاط 1, texte ③) et le piège inverse (texte ①).
 */
export const GUIDE = {
  keyword: {
    wrong: '«زادت علامتها عن علامة زميلها يونس بـ 1,5» إذن نجمع: $17{,}5 + 1{,}5 = 19$.',
    why: 'علامة إيناس هي الأكبر: هي الكلّ، وعلامة يونس جزء منه. كلمة «زادت» تصف علامة إيناس، لا العملية.',
    right: 'علامة يونس: $17{,}5 - 1{,}5 = 16$.',
  },
  lacking: {
    why: 'ثمن الكرّاس هو الكلّ: ما يملكه يونس جزء منه، وما ينقصه هو الجزء الآخر. كلمة «ينقصه» لا تعني أن نطرح.',
    right: 'ثمن الكرّاس: $24{,}5 + 11{,}5 = 36$ ، أي 36 دينارًا.',
  },
};
