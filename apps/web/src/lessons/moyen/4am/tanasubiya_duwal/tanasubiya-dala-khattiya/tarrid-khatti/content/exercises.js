/**
 * Les exercices du MANUEL rattachés au درس 5 « حل مشكلات وترييض وضعيات بتوظيف الدالة الخطية
 * والتناسبية » (couverture : extraction.json → destinations) : la طريقة du ressort et le تحدّ
 * (module 2), أتعمّق 28, 29, 31, 34, 35, 36 (module 3). Chaque énoncé est celui du livre ; chaque
 * réponse est recalculée en commentaire.
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_tarrid-khatti_P1',
  P2: '4am_tarrid-khatti_P2',
  P3: '4am_tarrid-khatti_P3',
};

const E = (n, part) => ({ ...src(`ex-${n}`, 75, 'أتعمّق', n), ...(part ? { part } : {}) });
/** Une réponse décimale arrondie au centième (66,67 pour 200/3) : on accepte l'arrondi ou la troncature. */
const near = (v) => (n) => Number.isFinite(n) && Math.abs(n - v) <= 0.01;

/* ── Module 2 — la طريقة du ressort (p. 71) et le تحدّ (p. 65) ─────────────────────────────── */
export const EXERCISES_1 = [
  {
    // 0,6 / 2 = 0,3 ; 0,9 / 0,3 = 3 ; 0,3 × 4 = 1,2 ; 1,5 / 0,3 = 5
    id: 'spring-table', source: src('method-spring', 71, 'طرائق'), learningPointId: LP.P2, difficulty: 'facile',
    statement: '1) انقل وأتمم الجدول المقابل: $x$ (غرام): 2 ، … ، 4 ، … ؛ $y$ (سنتيمتر): 0,6 ، 0,9 ، … ، 1,5 .',
    interaction: 'batch',
    question: {
      prompt: 'الجدول جدول تناسبية: معامله $\\dfrac{0{,}6}{2} = 0{,}3$ .',
      rows: [
        { label: 'الكتلة التي استطالتها 0,9cm', options: ['$3$', '$2{,}5$', '$2{,}7$'], correct: 0, correction: '$0{,}9 \\div 0{,}3 = 3$ : الكتلة 3g.' },
        { label: 'استطالة الكتلة 4g', options: ['$1{,}0$', '$1{,}2$', '$0{,}8$'], correct: 1, correction: '$0{,}3 \\times 4 = 1{,}2$ : الاستطالة 1,2cm.' },
        { label: 'الكتلة التي استطالتها 1,5cm', options: ['$4{,}5$', '$6$', '$5$'], correct: 2, correction: '$1{,}5 \\div 0{,}3 = 5$ : الكتلة 5g.' },
      ],
    },
    commonError: 'إضافة 0,3 بدل الضرب فيه (0,6 ثم 0,9 ثم 1,2 تبدو «تزيد بـ 0,3»، لكنها تزيد لأن الكتلة تزيد بـ 1).',
  },
  {
    // B : 300 km en 4 h, droite par O → 75 km/h ; A : courbe brisée, palier entre 1 h et 1,5 h
    id: 'challenge', source: src('challenge', 65, 'تحدّ'), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'تنقل مركبتان A و B مساعدات تضامنية إلى قرية معزولة، وسُجلت في التمثيل البياني المقابل المسافات التي قطعتها كل نصف ساعة من لحظة انطلاقهما. احسب السرعة المتوسطة لكل مركبة خلال السفر. ثم صف حركة كل منهما. اشرح.',
    interaction: 'batch',
    question: {
      prompt: 'اقرأ التمثيلين البيانيين.',
      rows: [
        { label: 'المسافة متناسبة مع المدة', options: ['للمركبة B فقط', 'للمركبة A فقط', 'للمركبتين معا'], correct: 0, correction: 'تمثيل B مستقيم يشمل المبدأ؛ تمثيل A خط منكسر.' },
        { label: 'ماذا تفعل المركبة A بين 1h و 1,5h؟', options: ['تسرع', 'تتوقّف', 'ترجع إلى الوراء'], correct: 1, correction: 'المسافة تبقى 115km: المركبة A متوقّفة نصف ساعة.' },
      ],
    },
    commonError: 'الاكتفاء بأن النقط «تصعد» للحكم بالتناسبية: يجب أن تكون على مستقيم يشمل المبدأ.',
  },
  {
    // 300 / 4 = 75 = 150 / 2 = 75 / 1
    id: 'challenge-2', source: { ...src('challenge', 65, 'تحدّ'), part: 2 }, learningPointId: LP.P2, difficulty: 'facile',
    statement: 'احسب السرعة المتوسطة للمركبة B (بالكيلومتر في الساعة).',
    interaction: 'numeric',
    question: {
      expected: 75, display: '75',
      explain: 'المركبة B تقطع 300km في 4h: $\\dfrac{300}{4} = 75$ ، أي 75km/h ، وهو معامل التناسبية: $d = 75t$ .',
    },
  },
  {
    // 300 / 4,5 = 200/3 ≈ 66,67
    id: 'challenge-3', source: { ...src('challenge', 65, 'تحدّ'), part: 3 }, learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'احسب السرعة المتوسطة للمركبة A خلال السفر كله (مدوّرة إلى 0,01).',
    interaction: 'numeric',
    question: {
      expected: near(200 / 3), display: '66,67',
      explain: 'المركبة A تقطع 300km في 4,5h: $\\dfrac{300}{4{,}5} \\approx 66{,}67$ ، أي حوالي 66,67km/h. سرعتها تتغيّر وتتوقّف، فهذه سرعة متوسطة فقط: وضعيتها ليست تناسبية.',
    },
    commonError: 'قسمة 300 على 4 لأن المركبة B تصل في 4h: المركبة A تصل في 4,5h.',
  },
];

/* ── Module 3 — أتعمّق (p. 75) ─────────────────────────────────────────────────────────── */
export const EXERCISES = [
  {
    // points (1 ; 40), (2 ; 70), (3 ; 130), (4 ; 155) — dernier point : 155 km
    id: 'ex-28-a', source: E(28, 'a'), learningPointId: LP.P2, difficulty: 'facile',
    statement: 'إليك التمثيل البياني للمسافة المقطوعة لدرّاج يتدرّب لسباق وطني بدلالة المدّة الزمنية المستغرقة. بقراءة بيانية أجب عن الأسئلة التالية: أ) ما هي المسافة الكلية المقطوعة (بالكيلومتر)؟',
    interaction: 'numeric',
    question: { expected: 155, display: '155', explain: 'آخر نقطة $(4 ; 155)$ : قطع الدرّاج 155km في 4h.' },
  },
  {
    // entre (2 ; 70) et (3 ; 130) : 60 km/h → 100 = 70 + 30 → 2 + 0,5 = 2,5 h
    id: 'ex-28-b', source: E(28, 'b'), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'ب) ما هي المدة الزمنية (بالساعة) التي يستغرقها الدراج لقطع 100 كيلومتر الأولى؟',
    interaction: 'numeric',
    question: { expected: 2.5, display: '2,5', explain: 'بين $(2 ; 70)$ و $(3 ; 130)$ يقطع 60km في ساعة: 30km الباقية في نصف ساعة. المدة 2,5h ، أي ساعتان ونصف.' },
    commonError: 'قراءة المسافة على محور الأزمنة: نبحث عن النقطة التي ترتيبها 100 ونقرأ فاصلتها.',
  },
  {
    // (3,5 ; 142,5) → 155 − 142,5 = 12,5
    id: 'ex-28-c', source: E(28, 'c'), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'جـ) ما هي المسافة المقطوعة (بالكيلومتر) خلال نصف الساعة الأخيرة؟',
    interaction: 'numeric',
    question: { expected: 12.5, display: '12,5', explain: 'بين $(3 ; 130)$ و $(4 ; 155)$ يقطع 25km في ساعة؛ عند 3,5h يكون عند 142,5km: $155 - 142{,}5 = 12{,}5$ .' },
  },
  {
    // (1 ; 40) depuis O : 40 km/h
    id: 'ex-28-d', source: E(28, 'd'), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'د) عيّن سرعة الدّراج (بالكيلومتر في الساعة) في المرحلة الأولى.',
    interaction: 'numeric',
    question: { expected: 40, display: '40', explain: 'في المرحلة الأولى المستقيم يشمل المبدأ و $(1 ; 40)$ : المسافة متناسبة مع المدة، $d = 40t$ ، والسرعة 40km/h.' },
  },
  {
    // (1 + t/100)(1 − t/100) = 1 − t²/10000
    id: 'ex-29', source: E(29), learningPointId: LP.P1, difficulty: 'difficile',
    statement: 'كان سعر منتوج $x$ دينار. بعد زيادة بـ $t\\%$ متبوعة بتخفيض قدره هو نسبة هذه الزيادة، أصبح السعر الجديد $y$ . عبّر عن السعر الجديد $y$ بدلالة $x$ و $t$ .',
    interaction: 'choice',
    question: {
      options: [
        '$y = x$',
        '$y = \\left(1 - \\dfrac{t^2}{10000}\\right)x$',
        '$y = \\left(1 - \\dfrac{t}{100}\\right)^2 x$',
        '$y = \\left(1 + \\dfrac{2t}{100}\\right)x$',
      ],
      correct: 1, cols: 1,
      explain: 'نضرب في $1 + \\dfrac{t}{100}$ ثم في $1 - \\dfrac{t}{100}$ : $y = \\left(1 + \\dfrac{t}{100}\\right)\\left(1 - \\dfrac{t}{100}\\right)x = \\left(1 - \\dfrac{t^2}{10000}\\right)x$ . السعر الجديد أصغر من السعر الأصلي (إلا إذا كان $t = 0$ ): $x \\longmapsto y$ دالة خطية معاملها أصغر من 1.',
    },
    commonError: 'الظنّ أن الزيادة والتخفيض بالنسبة نفسها يلغي أحدهما الآخر ($y = x$).',
  },
  {
    // tarif 1 : 20x ; tarif 2 : 4000 ; 20x = 4000 ⇔ x = 200 ; 500 km : 10 000 DA contre 4000 DA
    id: 'ex-31', source: E(31), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'تقترح شركة سيارات أجرة تسعيرتين للمسافة 500km. التسعيرة الأولى: 20DA للكيلومتر الواحد. التسعيرة الثانية: مبلغ ثابت قدره 4000DA. استعمل تمثيلا بيانيا لتحديد أفضل التسعيرتين.',
    interaction: 'batch',
    question: {
      prompt: 'نسمّي $x$ المسافة بالكيلومتر.',
      rows: [
        { label: 'ثمن الرحلة بالتسعيرة الأولى', options: ['$20 + x$', '$20x$', '$4000x$'], correct: 1, correction: '20DA لكل كيلومتر: الثمن متناسب مع المسافة، $x \\longmapsto 20x$ ، مستقيم يشمل المبدأ.' },
        { label: 'تمثيل التسعيرة الثانية', options: ['مستقيم يشمل المبدأ', 'مستقيم يوازي محور الفواصل', 'منحنى'], correct: 1, correction: 'المبلغ 4000DA مهما كانت المسافة: ليست وضعية تناسبية.' },
        { label: 'تتساوى التسعيرتان من أجل', options: ['$x = 200$', '$x = 500$', '$x = 4000$'], correct: 0, correction: '$20x = 4000$ أي $x = 200$ : نقطة تقاطع التمثيلين $(200 ; 4000)$ .' },
        { label: 'لمسافة 500km التسعيرة الأفضل', options: ['الأولى', 'الثانية'], correct: 1, correction: 'الأولى $20 \\times 500 = 10000$ DA والثانية 4000DA: الثانية أفضل. الأولى أفضل فقط لمسافة أقل من 200km.' },
      ],
    },
    commonError: 'اختيار التسعيرة الأولى لأن «20DA» أصغر من «4000DA»: نقارن ثمن الرحلة كلها، لا العددين.',
  },
  {
    // 48 000 + 2400 = 50 400 ; 50 tranches complètes → 500 DA ; 49 900
    id: 'ex-34', source: E(34), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'قدم تاجر العرض الترويجي التالي: من 1 أفريل 2018 إلى 5 أفريل 2018 خفّض 10DA لكل شراء قدره 1000DA. اشترى سليمان جهاز كمبيوتر لمراجعة دروسه بـ 48 000DA وقرص فلاش بـ 2400DA. ما هو المبلغ (بالدينار) الذي دفعه؟',
    interaction: 'numeric',
    question: { expected: 49900, display: '49 900', explain: 'المشتريات $48000 + 2400 = 50400$ ، فيها 50 مرة 1000DA كاملة: التخفيض $50 \\times 10 = 500$ ، والمبلغ المدفوع $50400 - 500 = 49900$ DA.' },
    commonError: 'حساب التخفيض على كل جهاز وحده، أو أخذ 1% من 50 400 (504DA) مع أن التخفيض يُحسب على كل 1000DA كاملة.',
  },
  {
    // 20 000 000 × 1,1 × 0,92 = 20 240 000
    id: 'ex-35', source: E(35), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'بلغ حجم المياه بأحد السدود $20\\,000\\,000m^3$ ، ويحرص الناس على ترشيد استعمال الماء. في سنة 2016 ارتفع مخزون المياه بنسبة قدرها 10%. في سنة 2017 انخفض المخزون بنسبة 8%. ما هو حجم المياه المخزنة (بالمتر المكعب) في السنة 2017؟',
    interaction: 'numeric',
    question: { expected: 20240000, display: '20 240 000', explain: '$20000000 \\times 1{,}1 \\times 0{,}92 = 20240000$ : أي $20\\,240\\,000m^3$ . الدالة المرفقة بالتغيّرين $x \\longmapsto 1{,}012x$ .' },
    commonError: 'طرح النسبتين ($10\\% - 8\\% = 2\\%$): التخفيض يُحسب على المخزون بعد الزيادة.',
  },
  {
    // 0,6 × 20 + 0,7 × 10 = 12 + 7 = 19
    id: 'ex-36-a', source: E(36, 'a'), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'في قسم متكوّن من 30 تلميذا، 20 منهم يدرسون اللغة الإنجليزية و10 يدرسون اللغة الألمانية. 60% من التلاميذ الذين يدرسون الإنجليزية يمارسون رياضة كرة القدم و 70% من الذين يدرسون الألمانية يمارسون أيضا هذه الرياضة. كم تلميذا في القسم يمارس كرة القدم؟',
    interaction: 'numeric',
    question: { expected: 19, display: '19', explain: '$0{,}6 \\times 20 + 0{,}7 \\times 10 = 12 + 7 = 19$ تلميذا.' },
  },
  {
    // 19 / 30 = 190/3 % ≈ 63,33 %
    id: 'ex-36-b', source: E(36, 'b'), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'ما هي النسبة المئوية لتلاميذ هذا القسم الذين يمارسون كرة القدم (مدوّرة إلى 0,01)؟',
    interaction: 'numeric',
    question: { expected: near(190 / 3), display: '63,33', explain: '$\\dfrac{19}{30} \\times 100 \\approx 63{,}33$ : حوالي 63,33% ، وهي ليست $\\dfrac{60 + 70}{2} = 65$ لأن الفوجين غير متساويين.' },
    commonError: 'حساب متوسط النسبتين (65%): الفوج الأول ضعف الفوج الثاني.',
  },
];

export const EX = Object.fromEntries([...EXERCISES_1, ...EXERCISES].map((e) => [e.id, e]));
