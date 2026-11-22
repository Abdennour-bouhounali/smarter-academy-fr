/**
 * Le contenu du MANUEL pour le درس « الكتابات الكسرية لحاصل قسمة واختزال كسر » (1AM, unité 4) — données pures, au mot
 * près, chaque bloc cite son élément de docs/sources/1am/unit4/extraction.json. La leçon est générée AVANT « حاصل القسمة
 * والكسر » (file du réseau) : elle ne reconstruit pas « الكسر حاصل قسمة » — un « تذكّر » d'une ligne (`RECALL`, ajout
 * déclaré) suffit, son labo n'a besoin que du sens « part d'un tout coupé en parts égales » (primaire).
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** نشاط 4 (p. 54) — les trois rectangles et la question du grand-père. */
export const ACTIVITY = {
  source: src('act-4', 54, 'اكتشف', 4),
  title: 'تحويل الكتابة الكسرية لحاصل قسمة',
  text: 'إليك ثلاثة مستطيلات متماثلة: الأوّل مقسّم إلى 5 أشرطة متقايسة، والثاني إلى 10 أجزاء، والثالث إلى 20 جزءا.',
  parts: [
    'أعد رسم المستطيلات على ورقة مرصوفة. لوّن بالأصفر 3/5 من سطح المستطيل 1، وبالأحمر 6/10 من سطح المستطيل 2، وبالأخضر 12/20 من سطح المستطيل 3.',
    'قارن بين مساحات السطوح الملوّنة الثلاث. ماذا يمكن أن نستنتج بالنسبة للكسور: 3/5 ، 6/10 و 12/20 ؟',
    'أُنقل وأتمم: $\\frac{3}{5}=\\frac{3\\times\\ldots}{5\\times\\ldots}=\\frac{6}{10}$ ؛ $\\frac{12}{20}=\\frac{12\\div\\ldots}{20\\div\\ldots}=\\frac{3}{5}$',
  ],
  grandfather: 'قال الجدّ لحفيدته فاطمة: "بمناسبة عيد ميلادك، أعطيك $\\frac{3}{5}$ من 3500 دج أو أعطيك $\\frac{27}{45}$ من 3500 دج". ماذا تختارين؟ أجب نيابة عنها دون إجراء الحساب.',
  // Les nombres du labo (props `fraction-knife`, brief docs/sources/1am/unit4/brief-authors.md).
  numbers: { share: [3, 5], targets: [[6, 10], [12, 20]], gift: [27, 45], amount: 3500 },
};

/** معارف 3 (p. 55) — الكتابات الكسرية لحاصل القسمة. */
export const KNOWLEDGE = {
  source: src('know-3', 55, 'أوظّف تعلّماتي', 3),
  rule: '$a$ و $b$ عددان حيث $b \\neq 0$ . لا يتغير حاصل القسمة $\\frac{a}{b}$ عندما: نضرب كلا من البسط والمقام في نفس العدد غير المعدوم، أو نقسم كلا من البسط والمقام على نفس العدد غير المعدوم.',
  example1: '$\\frac{7}{4}=\\frac{7\\times 25}{4\\times 25}=\\frac{175}{100}$ ؛ $\\frac{54}{45}=\\frac{54\\div 9}{45\\div 9}=\\frac{6}{5}$',
  example2: 'لاحظ في هذا المثال أننا أعطينا كتابة عشرية لحاصل قسمة 2,1 على 3,5 بتحويل كتاباته الكسرية دون إجراء عملية القسمة.',
  example2Math: '$2{,}1 \\div 3{,}5=\\frac{2{,}1}{3{,}5}=\\frac{2{,}1\\times 10}{3{,}5\\times 10}=\\frac{21}{35}=\\frac{21\\div 7}{35\\div 7}=\\frac{3}{5}=\\frac{6}{10}=0{,}6$',
  remark: 'عندما نكتب $\\frac{54}{45}=\\frac{6}{5}$ ، إننا نعطي كسرا مساويا لـ $\\frac{54}{45}$ ولكن ببسط أصغر و مقام أصغر. نقول: إننا اختزلنا الكسر $\\frac{54}{45}$ .',
};

/** معارف 1 (p. 55), son dernier exemple seulement (élément `know-1`, item « 0,7=7/10 » destiné à cette leçon). */
export const DECIMAL_FRACTION = {
  source: src('know-1', 55, 'أوظّف تعلّماتي', 1),
  text: 'العدد العشري يمكن دائما كتابته على شكل كسر عشري: $0{,}7=\\frac{7}{10}$',
};

/** « تذكّر » — la fraction quotient, enseignée par « حاصل القسمة والكسر » (non reconstruite ici). */
export const RECALL = {
  source: addition('recall_previous_lesson'),
  text: 'تذكّر: الكسر $\\frac{a}{b}$ ($b \\neq 0$) هو أيضًا حاصل قسمة $a$ على $b$: $a \\div b=\\frac{a}{b}$ — درس «حاصل القسمة والكسر».',
};

/** طريقة (p. 56) — اختزال كتابة كسرية : 45/567. */
export const METHOD = {
  source: src('method-2', 56, 'أكتسب طرائق'),
  title: 'اختزال كتابة كسرية',
  exercise: 'مثال: اختزل الكسر $\\frac{45}{567}$',
  solution: [
    '1. نبحث عن قاسم مشترك للبسط والمقام. نلاحظ أن $45=5\\times 9$ إذًا 45 يقبل القسمة على 9 (استخدم جداول الضرب).',
    'ونلاحظ $5+6+7=18=2\\times 9$ إذًا 567 يقبل القسمة على 9 (استخدم قواعد قابلية القسمة). نجري قسمة 567 على 9 فنجد 63 أي $567=9\\times 63$ .',
    '2. نقسم كلا من البسط والمقام على هذا القاسم: $\\frac{45}{567}=\\frac{45\\div 9}{567\\div 9}=\\frac{5}{63}$ . 9 هو قاسم لكل من 567 و 45 : نقول إننا اختزلنا كلا من البسط والمقام على 9.',
  ],
};

/** دوري الآن (p. 56), items ② et ③ (l'item ① — les jauges — est à « أخذ كسر من عدد »). */
export const NOW_56 = {
  source: src('now-56', 56, 'دوري الآن'),
  complete: [{ n: 24, d: 56, k: 8, to: [3, 7] }, { n: 25, d: 45, k: 5, to: [5, 9] }],
  reduce: [[32, 56], [44, 33], [14, 21], [8, 10], [21, 14]],
};

/** Le تحدّ de l'unité (p. 51, déclaré `duplicatedIn` cette leçon). */
export const CHALLENGE = {
  source: src('challenge', 51, 'تحدّ'),
  text: 'أين أضع الفاصلة؟ $\\frac{235017}{1000}$',
};

/** استعمل تكنولوجيات الإعلام والاتصال (p. 62) — la calculatrice. */
export const ICT = {
  source: src('ict', 62, 'استعمل تكنولوجيات الإعلام والاتصال'),
  example1: 'نريد اختزال الكسر $\\frac{52}{65}$ ثم نعطي له كتابة عشرية. نلمس بالترتيب 52 ثم a b/c ثم 65 ثم = فتُظهر الشاشة $4 \\lrcorner 5$ أي $\\frac{52}{65}=\\frac{4}{5}$ ، ثم نلمس من جديد على a b/c فتظهر 0,8 الكتابة العشرية للكسر.',
  example2: 'نريد اختزال الكسر $\\frac{1921}{791}$ ثم نعطي له كتابة عشرية. تُظهر الشاشة $17 \\lrcorner 7$ أي $\\frac{1921}{791}=\\frac{17}{7}$ ، ثم 2,428571429 قيمة تقريبية للكسر: الكسر $\\frac{1921}{791}$ ليس كسرًا عشريًا.',
  now: 'دوْرك الآن: من أجل كل كسر من الكسور الآتية $\\frac{285}{684}$ ، $\\frac{250}{1250}$ ، $\\frac{9592}{11336}$ ، $\\frac{35922}{5987}$ اختزل الكسر ثم أعط الكتابة العشرية للعدد أو قيمته المقربة إلى 0,01 بالنقصان.',
};

/** « أستعدّ » — استحضر مكتسباتي (p. 52), items 1, 2, 9, posés en affirmations vrai/faux. */
export const PREP_ITEMS = [
  { n: 1, skill: 'ashri', text: 'العدد 8,225 يساوي $\\frac{8225}{1000}$ ويساوي أيضًا $8+\\frac{2}{10}+\\frac{25}{1000}$.', answer: true, why: '$\\frac{8225}{1000}=8{,}225$ و $8+0{,}2+0{,}025=8{,}225$.' },
  { n: 2, skill: 'ashri', text: 'نتيجة الفرق $9{,}23-4{,}6$ هي $\\frac{463}{100}$.', answer: true, why: '$9{,}23-4{,}6=4{,}63=\\frac{463}{100}$.' },
  { n: 9, skill: 'juz', text: 'مربع مقسّم إلى 4 مربعات متقايسة لُوّن 3 منها: السطح الملوّن يمثّل $\\frac{1}{3}$ من المربع.', answer: false, why: '3 أجزاء من 4 أجزاء متقايسة: $\\frac{3}{4}$ ، وهو أيضًا $\\frac{1}{2}+\\frac{1}{4}$.' },
].map((it) => ({ ...it, source: src('prep', 52, 'استحضر مكتسباتي', it.n) }));

/** Les items de la PLATEFORME : les items du réseau `1am.m1.r02` (عشري ↔ كسري) et `1am.m3.r02` (قواعد قابلية القسمة). */
export const PREP_PLATFORM_ITEMS = [
  { skill: 'ashri', text: 'العدد 3,07 يساوي $\\frac{307}{10}$.', answer: false, why: '$\\frac{307}{10}=30{,}7$ ؛ أمّا $3{,}07=\\frac{307}{100}$ (رقمان بعد الفاصلة: مئات).' },
  { skill: 'qabiliya', text: 'العدد 135 يقبل القسمة على 9 لأنّ $1+3+5=9$.', answer: true, why: 'مجموع أرقامه 9 يقبل القسمة على 9: $135=9\\times 15$.' },
  { skill: 'qabiliya', text: 'العدد 74 يقبل القسمة على 4 لأنّ رقم آحاده 4.', answer: false, why: 'ننظر إلى العدد المشكّل من الرقمين الأخيرين: $74=4\\times 18+2$ ، لا يقبل القسمة على 4.' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les phrases de correction partagées par les modules et la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  addSame: {
    wrong: 'نضيف نفس العدد إلى البسط والمقام: $\\frac{3}{5}=\\frac{4}{6}$.',
    why: 'في صينية من 6 قطع، الحصّة $\\frac{3}{5}$ هي 3 قطع وجزء من قطعة، لا 4 قطع: $\\frac{4}{6}$ أكبر من الحصّة.',
    right: 'نضرب البسط والمقام في نفس العدد: $\\frac{3}{5}=\\frac{3\\times 2}{5\\times 2}=\\frac{6}{10}$.',
  },
  oneTerm: {
    wrong: 'نقسم $\\frac{27}{45}$ على 5 لأنّ 45 يقبل القسمة على 5.',
    why: '27 لا يقبل القسمة على 5: $27=5\\times 5+2$ ، فلا نحصل على كسر بسطه عدد طبيعي.',
    right: 'نبحث عن قاسم مشترك للبسط والمقام: $2+7=9$ و $4+5=9$ ، إذن $\\frac{27}{45}=\\frac{27\\div 9}{45\\div 9}=\\frac{3}{5}$.',
  },
  simplest: 'نكرّر الاختزال ما دام للبسط والمقام قاسم مشترك غير 1، فنصل إلى أبسط شكل ممكن.',
  decimal: 'نبحث عن مقام 10 أو 100 أو 1000 بضرب البسط والمقام في نفس العدد: $\\frac{7}{4}=\\frac{175}{100}=1{,}75$.',
};
