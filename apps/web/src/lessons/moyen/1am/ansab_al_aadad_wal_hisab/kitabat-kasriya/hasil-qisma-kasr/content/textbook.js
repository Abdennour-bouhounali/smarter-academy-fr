/**
 * Le contenu du MANUEL pour le درس « حاصل القسمة والكسر » (1AM, unité 4) — données pures, au mot près, chaque bloc cite son
 * élément de docs/sources/1am/unit4/extraction.json : نشاط 1 p. 53 (posé en APPLICATION dans أتمرّن), معارف 1 p. 55 (sans son
 * dernier exemple « 0,7 = 7/10 », qui est à `ikhtizal-kitaba-kasriya`), « تمهيد » p. 51, « استحضر مكتسباتي » items 5, 6, 7.
 * La طريقة du module 3 n'est pas dans le manuel pour cette leçon : ajout DÉCLARÉ de la plateforme (`knowledge_formalization`).
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** نشاط 1 (p. 53) — تقسيم رغيف تقليدي : cinq pains pour six personnes (posé en application, module 4). */
export const ACTIVITY = {
  source: src('act-1', 53, 'اكتشف', 1),
  title: 'حاصل القسمة والكسر — تقسيم رغيف تقليدي',
  text: 'أرادت فاطمة وزميلتها مريم تقسيم خمسة أرغفة متماثلة على ستة أشخاص بالتساوي.',
  parts: [
    '① بما أن مريم تجيد القسمة العشرية، قسمت 5 على 6. ما هو حاصل القسمة الذي تجده؟ هل هذا العدد يفيدها في تقسيم الأرغفة؟',
    '② بينما قسّمت فاطمة كلّ رغيف إلى ستّ حصص متساوية، كيف تتصرّف بعد ذلك لكي يأخذ كلّ شخص نفس الكمية؟',
    '③ ما هو الكسر الذي يمثّل نصيب كلّ شخص؟',
    '④ انطلاقا من هذه الوضعية، انقل وأكمل: $\\frac{5}{6}+\\frac{5}{6}+\\frac{5}{6}+\\frac{5}{6}+\\frac{5}{6}+\\frac{5}{6}=\\ldots\\times\\frac{5}{6}=\\ldots$ — اشرح لماذا يمكن أن نكتب: $5\\div 6=\\frac{5}{6}$.',
  ],
  // Les nombres du labo (props `fair-share`, levels.js).
  numbers: { loaves: 5, people: 6 },
};

/** معارف 1 (p. 55) — حاصل القسمة والكسر. */
export const KNOWLEDGE = {
  source: src('know-1', 55, 'أوظّف تعلّماتي', 1),
  definition: 'الحرفان $a$ و $b$ يشيران إلى عددين حيث $b\\neq 0$ . الكتابة الكسرية لحاصل قسمة $a$ على $b$ هي $\\frac{a}{b}$ . نكتب: $a\\div b=\\frac{a}{b}$',
  result: 'نتيجة: $\\frac{a}{b}$ هو العدد الذي إذا ضرب في العدد $b$ يعطينا $a$ . نكتب $\\frac{a}{b}\\times b=a$',
  vocabulary: 'مفردات: إذا كان $a$ و $b$ عددين طبيعيين حيث $b\\neq 0$ فإن $\\frac{a}{b}$ يسمى كسرا، العدد $a$ يسمى البسط والعدد $b$ يسمى المقام.',
  remarks: ['يختلف مقام الكسر دائما عن الصفر.', 'لا يكون دائما الكسر عددا عشريا.'],
  example1: 'الكسر $\\frac{7}{3}$ هو العدد الذي إذا ضرب في 3 ينتج 7، أي: $\\frac{7}{3}\\times 3=7$ . الكسر $\\frac{7}{3}$ يمثّل أيضا حاصل قسمة 7 على 3.',
  example2: 'العدد $\\frac{7}{3}$ ليس عددًا عشريًا، لأن القسمة العشرية غير منتهية. $2{,}33$ هي قيمة مقربة للعدد $\\frac{7}{3}$ . $\\frac{7}{3}$ هي القيمة المضبوطة لحاصل قسمة 7 على 3.',
};

/** « تمهيد » (p. 51) — الكاشي والكسور العشرية. */
export const OPENER = {
  source: src('opener', 51, 'تمهيد'),
  text: 'لما كانت الأعداد الطبيعية غير كافية للاستجابة لكلّ حاجيات الإنسان، اكتشف الأعداد الكسرية واستعملت للتعبير عن بعض الكميات الحقيقية من الواقع مثل الأطوال، المساحات … ويعتبر العالم غياث الدين الكاشي (توفي عام 1429) أوّل رياضي مسلم عرض «نظرية الكسور العشرية».',
};

/** طريقة (ajout de la plateforme) — إيجاد العدد الناقص في $b\times\ldots=a$. */
export const METHOD = {
  source: addition('knowledge_formalization'),
  title: 'إيجاد العدد الناقص',
  exercise: 'مثال: $8\\times\\ldots=13$',
  solution: [
    '1. نقرأ المساواة: نبحث عن العدد الذي إذا ضُرب في 8 أعطى 13.',
    '2. هذا العدد هو حاصل قسمة 13 على 8، أي الكسر $\\frac{13}{8}$ : $8\\times\\frac{13}{8}=13$.',
    '3. إذا كان العدد المضروب كسرا فالأمر نفسه: $\\ldots\\times 11=11$ يعطي $\\frac{11}{11}=1$.',
  ],
};

/** Le bandeau qui regroupe les nombres du labo à l'entrée de معارف (platform_designed_entry). */
export const WORKSHOP = { canteen: [3, 4, 2, 3], family: [5, 6, 7, 3] };

/** « أستعدّ » — استحضر مكتسباتي (p. 52), items 5, 6, 7, posés en affirmations vrai/faux. */
export const PREP_ITEMS = [
  { n: 5, skill: 'qisma', text: 'حاصل قسمة العدد 2 على 3 هو عدد عشري.', answer: false, why: '$2\\div 3=0{,}666\\ldots$ : القسمة العشرية لا تنتهي.' },
  { n: 6, skill: 'juz', text: 'قرص مقسّم إلى 8 أجزاء متقايسة، لُوّنت 3 منها: السطح الملوّن يمثّله الكسر $\\frac{3}{8}$.', answer: true, why: '3 أجزاء من 8 أجزاء متقايسة.' },
  { n: 7, skill: 'juz', text: 'قرص مقسّم إلى نصفين، والنصف السفلي مقسّم إلى ربعين، ولُوّن ربع واحد: السطح الملوّن يمثّله الكسر $\\frac{1}{3}$.', answer: false, why: 'الأجزاء ليست متقايسة: الجزء الملوّن ربع القرص، أي $\\frac{1}{4}$.' },
].map((it) => ({ ...it, source: src('prep', 52, 'استحضر مكتسباتي', it.n) }));

/** Les items de la PLATEFORME : `1am.m1.r02` (عشري ↔ كسري) et la division, réciproque de la multiplication. */
export const PREP_PLATFORM_ITEMS = [
  { skill: 'ashri', text: 'العدد 0,25 يساوي الكسر العشري $\\frac{25}{100}$.', answer: true, why: 'رقمان بعد الفاصلة: أجزاء من المئة، $0{,}25=\\frac{25}{100}$.' },
  { skill: 'ashri', text: 'العدد 4,5 يساوي الكسر العشري $\\frac{45}{100}$.', answer: false, why: 'رقم واحد بعد الفاصلة: أعشار، $4{,}5=\\frac{45}{10}$.' },
  { skill: 'qisma', text: 'بما أنّ $4\\times 6=24$ فإنّ $24\\div 4=6$.', answer: true, why: 'القسمة على 4 تعيد ما فعله الضرب في 4.' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les phrases de correction partagées par les modules et la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  decimalOnly: {
    wrong: 'القسمة العشرية تعطينا دائمًا حصّة الواحد بالضبط: $2\\div 3=0{,}66$.',
    why: 'ثلاثة أطفال يأخذون $3\\times 0{,}66=1{,}98$ فقط، ويبقى $0{,}02$ على الطاولة؛ وكلما أضفنا رقمًا بقي شيء.',
    right: 'الحصّة هي العدد الذي إذا ضُرب في 3 أعطى 2: الكسر $\\frac{2}{3}$.',
  },
  upsideDown: {
    wrong: 'نكتب الكسر مقلوبًا: $5\\div 6=\\frac{6}{5}$.',
    why: 'ستة أشخاص يأخذون $6\\times\\frac{6}{5}=\\frac{36}{5}$ ، أي أكثر من 7 أرغفة، والموجود 5.',
    right: 'البسط هو المقسوم والمقام هو المقسوم عليه: $5\\div 6=\\frac{5}{6}$.',
  },
  notAlwaysDecimal: 'نتحقّق: $\\frac{a}{b}$ عدد عشري عندما تنتهي القسمة العشرية؛ وإلا فالكسر هو القيمة المضبوطة وكتابته العشرية قيمة مقرّبة.',
};
