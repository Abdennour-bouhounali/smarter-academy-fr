/**
 * Le contenu du MANUEL pour le درس 3 « التمثيل البياني لدالة خطية وقراءته بيانيًا » — données pures
 * (aucun JSX), au mot près ; chaque bloc cite son élément de docs/sources/4am/unit6/extraction.json
 * (destinations : act-3, tech-76 → module 1 ; know-3, method-draw, method-read, now-69 → module 2 ;
 * QCM 1 et 4 → module 7, l’إختبار أولي, ex-module 4). Ce que la plateforme ajoute est déclaré (`addition(…)`).
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** نشاط 3 (p. 66) — « تمثيل دالة خطية بيانيا » : f(x) = 0,5x, le tableau 0 / 1 / 4, A, B, C, M. */
export const ACTIVITY = {
  source: src('act-3', 66, 'أنشطة', 3),
  title: 'تمثيل دالة خطية بيانيا',
  text: 'نعتبر الدالة الخطيّة $f : x \\longmapsto 0{,}5x$ . المستوي مزوّد بمعلم متعامد و متجانس مبدؤه O.',
  table: { x: ['0', '1', '4'] },
  questions: [
    '1) أ) انقل ثمّ أكمل الجدول.',
    'ب) علّم النّقطتين $A(1 ; f(1))$ ، $B(4 ; f(4))$ ، وماذا تقول حول استقامة النقط O ، A ، B؟ برّر جوابك.',
    '2) أ) عيّن على المستقيم (OA) النقطة C ذات الفاصلة $-2$ ، ثم إقرأ بيانيا ترتيبها، وقارن بين $f(-2)$ وترتيب C.',
    'ب) لتكن $M(x ; y)$ نقطة من المستقيم (OA)، عبّر عن $y$ بدلالة $x$ .',
  ],
  // « نقول أنّ … » — la phrase du manuel qui NOMME ce que l'activité vient de faire.
  closing: 'نقول أنّ التمثيل البياني للدالة الخطية $f : x \\longmapsto 0{,}5x$ هو المستقيم (OA).',
  a: '0,5',
};

/**
 * Les calculs du نشاط 3 écrits par la plateforme (le livre les demande sans les écrire) — les mêmes
 * que ceux que le lab écrit sous l'épingle.
 */
export const ACTIVITY_LINES = {
  source: addition('interaction_generation'),
  table: '$f(0) = 0{,}5 \\times 0 = 0$ ، $f(1) = 0{,}5 \\times 1 = 0{,}5$ ، $f(4) = 0{,}5 \\times 4 = 2$.',
  aligned: 'النقطة $B(4 ; 2)$ تقع على المستقيم (OA) الذي يشمل المبدأ و $A(1 ; 0{,}5)$ : ترتيب كل نقطة منه نصف فاصلتها، و $2 = 0{,}5 \\times 4$. إذن النقط O و A و B على استقامة واحدة.',
  c: 'نقرأ على المستقيم (OA): النقطة C ذات الفاصلة $-2$ ترتيبها $-1$ ، و $f(-2) = 0{,}5 \\times (-2) = -1$ : ترتيب C هو صورة فاصلتها.',
  m: 'كل نقطة $M(x ; y)$ من (OA) ترتيبها صورة فاصلتها: $y = f(x)$ أي $y = 0{,}5x$.',
};

/** Ce que la plateforme dit autour du نشاط 3 (l'accroche) — déclaré. */
export const HOOK = {
  source: addition('interaction_generation'),
  headline: 'تلفريك قسنطينة: حبل مستقيم يشدّه عمود!',
  text: 'حبل التلفريك مستقيم، مشدود من محطة الانطلاق. في هذا النشاط محطّتنا هي المبدأ O، والحبل هو تمثيل دالة خطية: كم نقطة نحتاج لنشدّه؟',
};

/**
 * أوظّف تكنولوجيات الإعلام والاتصال (p. 76), item 2 ب) — le زالق de جيوجيبرا : « كيف يتحرّك المستقيم
 * الذي يمثّل دالة خطية معاملها a عندما يتغيّر a ؟ ». La plateforme n'ouvre pas جيوجيبرا : le niveau
 * متقدم du module 1 EST ce زالق (version de la plateforme, déclarée comme telle).
 */
export const ICT = {
  source: src('tech-76', 76, 'أوظف تكنولوجيات الإعلام و الاتصال'),
  question: 'كيف يتحرك المستقيم الذي يمثّل دالة خطية معاملها $a$ ، عندما يتغير $a$ ؟ … حرّك الزالق بالفأرة، ماذا تلاحظ عندما $a > 0$ ؟ عندما $a < 0$ ؟ عندما $a = 0$ ؟',
  answer: '$a > 0$ : المستقيم يصعد ؛ $a < 0$ : ينزل ؛ $a = 0$ : ينطبق على محور الفواصل ؛ وكلما كبر $|a|$ كان أشد ميلا.',
};
export const ICT_PLATFORM = {
  source: addition('interactive_example'),
  text: 'في الكتاب يُطلب هذا النشاط بالبرمجية جيوجيبرا. على المنصّة، الزالق هو المستوى المتقدّم من المناولة أعلاه: أمسك المستقيم أو الزالق على يمين المعلم، وثبّت عدّة مستقيمات.',
};

/** معارف (p. 68) — التمثيل البياني لدالة خطية : la propriété, l'exemple −2x / 2x, la ملاحظة. */
export const KNOWLEDGE = {
  source: src('know-3', 68, 'معارف'),
  title: 'التمثيل البياني لدالة خطية',
  property: 'في مَعلم، التمثيل البياني لدالة خطية معاملها $a$ هو مستقيم يشمل المبدأ O. نقول إنّ $y = ax$ هي معادلة لهذا المستقيم و $a$ هو معامل توجيه له.',
  example: 'التمثيل البياني للدّالة الخطية $f : x \\longmapsto -2x$ هو مستقيم يشمل المبدأ O. لإنشائه يكفي تعيين نقطة ثانية من (D)، مثلا النقطة $A(1 ; -2)$ . (D′) هو التمثيل البياني للدالة $g : x \\longmapsto 2x$ .',
  note: 'ملاحظة : يعيّن المعامل $a$ للدالة الخطية منحى المستقيم (D). • إذا كان $a > 0$ فإن (D) «يصعد» من اليسار إلى اليمين. • إذا كان $a < 0$ فإنّ (D) «ينزل» من اليسار إلى اليمين.',
};

/** طرائق (p. 69) — تمثيل دالة خطية بيانيا : f(x) = 1,5x par A(1 ; 1,5). */
export const METHOD_DRAW = {
  source: src('method-draw', 69, 'طرائق'),
  title: 'تمثيل دالة خطية بيانيا',
  exercise: 'في معلم مبدؤه O (الوحدة : 1cm) ارسم المستقيم $(d)$ الذي يمثّل الدالة الخطية المعرّفة بـ: $f(x) = 1{,}5x$ .',
  solution: [
    '$(d)$ يشمل مبدأ الـمَعلم.',
    '$f(1) = 1{,}5$ ، إذن $(d)$ يشمل أيضا النقطة $A(1 ; 1{,}5)$ .',
    'نرسم المستقيم الذي يشمل المبدأ والنقطة $A(1 ; 1{,}5)$ .',
  ],
  rule: 'باعتبار أنّ التمثيل البياني لدالة خطية مستقيم يشمل مبدأ المعلم، فلإنشائه يكفي تعيين إحداثيي نقطة أخرى منه.',
};

/** طرائق (p. 69) — قراءة تمثيل بياني لدالة خطية : f(4) = 1,6 et l'antécédent 8,75 de 3,5. */
export const METHOD_READ = {
  source: src('method-read', 69, 'طرائق'),
  title: 'قراءة تمثيل بياني لدالة خطية',
  exercise: 'المستقيم (D) يمثل بيان دالة خطية $f$ . بقراءة بيانية عيّن: أ) صورة 4 ب) عيّن العدد الذي صورته 3,5.',
  solution: [
    'أ) صورة 4 هي 1,6. إذن $f(4) = 1{,}6$ .',
    'ب) 8,75 هو العدد الذي صورته 3,5. إذن $f(8{,}75) = 3{,}5$ .',
  ],
  rule: [
    'لتعيين صورة عدد بدالة، نقرأ ترتيب النقطة من التمثيل البياني التي فاصلتها هذا العدد.',
    'لتعيين عدد صورته معلومة $b$ بدالة، نقرأ فاصلة النقطة من التمثيل البياني التي ترتيبها $b$ .',
  ],
  // la droite de la figure du manuel : elle passe par (4 ; 1,6), donc a = 0,4 (extraction › answer.a)
  a: '0,4',
};
/**
 * La figure du manuel va de 0 à 7 en abscisses, alors que la réponse b) est 8,75 : le lab de la
 * plateforme élargit la fenêtre à 10 pour que la lecture soit FAITE, pas devinée (déclaré).
 */
export const METHOD_READ_WINDOW = {
  source: addition('interactive_example'),
  note: 'وسّعت المنصّة المعلم حتى الفاصلة 10، لتُقرأ النقطة ذات الفاصلة 8,75 على الشكل.',
};

/** دوري الآن (p. 69) — A(−2/3 ; −3/2), a = 9/4, B(√32 ; √162). */
export const NOW = {
  source: src('now-69', 69, 'دوري الآن'),
  text: 'جد العبارة الجبرية للدّالة الخطية التي تمثيلها البياني (D) يشمل النقطة $A\\left(-\\dfrac{2}{3} ; -\\dfrac{3}{2}\\right)$ . ومثّلها بيانيا. هل النقطة $B(\\sqrt{32} ; \\sqrt{162})$ تنتمي إلى (D)؟ لماذا؟',
  a: '9/4',
  lines: {
    a: '$f\\left(-\\dfrac{2}{3}\\right) = -\\dfrac{3}{2}$ ، أي $a \\times \\left(-\\dfrac{2}{3}\\right) = -\\dfrac{3}{2}$ ، ومنه $a = -\\dfrac{3}{2} \\div \\left(-\\dfrac{2}{3}\\right) = \\dfrac{9}{4}$ : $f(x) = \\dfrac{9}{4}x$.',
    b: '$\\dfrac{9}{4} \\times \\sqrt{32} = \\dfrac{9}{4} \\times 4\\sqrt{2} = 9\\sqrt{2} = \\sqrt{162}$ : ترتيب B صورة فاصلتها، إذن B تنتمي إلى (D).',
  },
};

/**
 * « أؤكّد تعلّماتي » (p. 74) — les items 1 et 4 (extraction.json → destinations › qcm › duplicatedIn ›
 * tamthil-bayani-khatti, module 4 de l’extraction = module 7 depuis les مسائل) : l'إختبار أولي. L'item 4 a sa figure (components/GraphFigure).
 */
const QCM_SRC = (n) => src('qcm', 74, 'أؤكّد تعلّماتي', n);
export const QCM = {
  1: { n: 1, source: QCM_SRC(1), text: 'معامل الدّالة الخطية التي تمثيلها البياني يشمل النقطة $A(2 ; 7)$ هو:', options: ['2', '3,5', '7'], correct: 1,
    explain: '$f(2) = 7$ ، أي $a \\times 2 = 7$ ، ومنه $a = \\dfrac{7}{2} = 3{,}5$.' },
  4: { n: 4, source: QCM_SRC(4), text: 'المستقيم (D) أدناه هو التمثيل البياني للدّالة:', options: ['$f : x \\longmapsto x + 0{,}25$', '$g : x \\longmapsto 0{,}75x$', '$h : x \\longmapsto 0{,}25x$'], correct: 2,
    explain: '(D) يشمل المبدأ والنقطة $(1 ; 0{,}25)$ : الدالة خطية وصورة 1 هي $0{,}25$ ، أي $a = 0{,}25$. أما $x + 0{,}25$ فتمثيلها لا يشمل O، و $0{,}75x$ تعطي $0{,}75$ صورةً لـ 1.' },
};

/**
 * « أستعدّ » — le manuel n'a pas d'item pour cette leçon (prep 1–9 → leçons 1, 2, 4) : quatre acquis,
 * diagnostiqués par des affirmations de la plateforme dans la forme du livre : تعليم نقطة / قراءة
 * إحداثياتها (talim), la صورة d'un nombre par x ⟼ ax (sura), les règles des signes (ishara), et
 * déterminer a depuis un couple (muamil, leçon 2). Les deux réponses existent ; aucun item n'utilise
 * les nombres du نشاط 3 (0,5 ; 1 ; 4 ; −2).
 */
const PREP = addition('prerequisite_diagnostic');
export const PREP_ITEMS = [
  { skill: 'talim', text: 'النقطة $A(3 ; -2)$ فاصلتها $-2$ وترتيبها $3$ .', answer: false, why: 'في $A(3 ; -2)$ العدد الأول هو الفاصلة: فاصلتها $3$ وترتيبها $-2$.', source: PREP },
  { skill: 'talim', text: 'النقطة $B(0 ; 5)$ تقع على محور التراتيب.', answer: true, why: 'فاصلتها $0$ : كل نقطة فاصلتها معدومة تقع على محور التراتيب.', source: PREP },
  { skill: 'sura', text: 'إذا كانت $f(x) = 1{,}2x$ فإنّ $f(5) = 6$ .', answer: true, why: '$f(5) = 1{,}2 \\times 5 = 6$', source: PREP },
  { skill: 'ishara', text: 'صورة العدد $-3$ بالدالة $g : x \\longmapsto -1{,}5x$ هي $-4{,}5$ .', answer: false, why: '$-1{,}5 \\times (-3) = 4{,}5$ : جداء عددين سالبين موجب.', source: PREP },
  { skill: 'muamil', text: 'إذا كانت $h$ دالة خطية و $h(-2) = 7$ فإنّ معاملها $-3{,}5$ .', answer: true, why: '$a = \\dfrac{7}{-2} = -3{,}5$ : حاصل قسمة عددين مختلفي الإشارة سالب.', source: PREP },
  { skill: 'ishara', text: '$\\dfrac{-6}{-0{,}5} = -12$', answer: false, why: '$\\dfrac{-6}{-0{,}5} = 12$ : حاصل قسمة عددين سالبين موجب.', source: PREP },
];
