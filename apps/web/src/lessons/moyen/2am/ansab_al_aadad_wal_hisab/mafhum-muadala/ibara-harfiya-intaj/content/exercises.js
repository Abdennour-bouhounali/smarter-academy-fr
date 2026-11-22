/**
 * Les exercices du درس « إنتاج عبارة حرفية واستعمالها » (module 4 أتمرّن) : six exercices de la plateforme, chacun reprend l'IDÉE d'un élément du manuel (`src`) avec d'AUTRES nombres et d'autres
 * contextes. Les erreurs sont corrigées, jamais comptées ; chaque clé est recalculée dans ./content.test.js (arithmétique indépendante, BigInt). Toutes les valeurs sont positives (ordre de génération de l'unité).
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '2am_ibara-harfiya-intaj_P1',
  P2: '2am_ibara-harfiya-intaj_P2',
  P3: '2am_ibara-harfiya-intaj_P3',
};

export const EXERCISES = [
  {
    id: 'ex-1', source: src('act-1', 56, 'أنشطة', 1), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'تُصفّ طاولات مطعم المدرسة المستطيلة متلاصقة في صفّ واحد من طرف إلى طرف: $3$ كراسٍ على كلّ جانب طويل وكرسيّ واحد على كلّ طرف حرّ.',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'عدد الكراسي حول طاولة واحدة', options: ['$8$', '$6$', '$7$'], correct: 0, correction: 'ثلاثة كراسٍ على كلّ جانب طويل أي $6$ ، وكرسيّان على الطرفين: $8$ كراسٍ.' },
        { label: 'عدد الكراسي حول $2$ طاولتين متلاصقتين', options: ['$14$', '$16$', '$12$'], correct: 0, correction: 'الجانبان الطويلان يحملان $6\\times 2=12$ ، والطرفان $2$ : $14$ كرسيًا.' },
        { label: 'عدد الكراسي حول $10$ طاولات', options: ['$62$', '$80$', '$60$'], correct: 0, correction: '$6\\times 10+2=62$ كرسيًا.' },
        { label: 'عدد الكراسي حول $51$ طاولة', options: ['$308$', '$306$', '$408$'], correct: 0, correction: '$6\\times 51+2=306+2=308$ كرسيًا.' },
        { label: 'العبارة التي تعطي عدد الكراسي لـ $n$ طاولة', options: ['$6n+2$', '$8n$', '$6n+8$'], correct: 0, correction: 'ستّة كراسٍ لكلّ طاولة وكرسيّان على الطرفين وحدهما: $6\\times n+2=6n+2$ . ($8n$ يكرّر الكرسيّين مع كلّ طاولة.)' },
      ],
      explain: 'الكرسيّان على الطرفين يُحسبان مرّة واحدة، وكلّ طاولة تضيف $6$ كراسٍ: لذلك $6n+2$ .',
    },
    commonError: 'عدّ كرسيّي الطرفين مع كلّ طاولة فنكتب $8n$ .',
  },
  {
    id: 'ex-2', source: src('ex-1', 62, 'إنتاج عبارات حرفية', 1), alsoSource: [src('ex-5', 62, 'إنتاج عبارات حرفية', 5), src('ex-6', 62, 'إنتاج عبارات حرفية', 6), src('ex-7', 62, 'إنتاج عبارات حرفية', 7)], learningPointId: LP.P1, difficulty: 'facile',
    statement: '$n$ عدد طبيعي. عبّر بدلالة $n$ عن كلّ ممّا يلي، ثم عن الطول $AB$ في الشكل: قطعة طولها $8$ ثم يُضاف إليها جزء طوله $x$ .',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'نصف $n$', options: ['$\\frac{n}{2}$', '$2n$', '$n-2$'], correct: 0, correction: 'نصف العدد هو $n\\div 2=\\frac{n}{2}$ .' },
        { label: 'العدد الطبيعي الذي يلي $n$', options: ['$n+1$', '$n-1$', '$2n$'], correct: 0, correction: 'التالي مباشرة هو $n+1$ .' },
        { label: 'العدد الطبيعي الذي يسبق $n$ (حيث $n\\geq 1$)', options: ['$n-1$', '$n+1$', '$1-n$'], correct: 0, correction: 'السابق مباشرة هو $n-1$ .' },
        { label: 'ضعف $n$ ثم مربّع $n$', options: ['$2n$ و $n^2$', '$n^2$ و $2n$', '$2n$ و $2n$'], correct: 0, correction: 'الضعف $2\\times n=2n$ ؛ والمربّع $n\\times n=n^2$ .' },
        { label: 'الطول $AB$ حين نضيف $x$ إلى $8$', options: ['$8+x$', '$8x$', '$8-x$'], correct: 0, correction: '$AB=8+x$ : الجمع، لأنّ الجزءين متتاليان على المستقيم نفسه.' },
      ],
      explain: 'ننقل الكلمات إلى عمليات على الحرف: «نصف» قسمة على $2$ ، «يلي» زائد $1$ ، «يسبق» ناقص $1$ ، «ضعف» ضرب في $2$ .',
    },
    commonError: 'الخلط بين «ضعف $n$» و «مربّع $n$».',
  },
  {
    id: 'ex-3', source: src('ex-2', 62, 'إنتاج عبارات حرفية', 2), alsoSource: [src('ex-3', 62, 'إنتاج عبارات حرفية', 3), src('ex-4', 62, 'إنتاج عبارات حرفية', 4), src('ex-13', 63, 'إنتاج عبارات حرفية', 13), src('self-1', 65, 'أؤكّد تعلّماتي', 1), src('self-2', 65, 'أؤكّد تعلّماتي', 2)], learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'نريد تعليمة واحدة تغني عن كتابة قائمة الحسابات كلّها.',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'القائمة: $7\\times 4+3$ ، $7\\times 5+3$ ، … ، $7\\times 10+3$', options: ['$7\\times n+3$', '$7+n\\times 3$', '$(7+n)\\times 3$'], correct: 0, correction: 'العدد الذي يتغيّر هو العامل الثاني في الجداء: $7\\times n+3$ حيث $n$ من $4$ إلى $10$ .' },
        { label: 'القائمة: $(5+2)\\times 3$ ، $(5+3)\\times 3$ ، … ، $(5+9)\\times 3$', options: ['$(5+n)\\times 3$', '$5+n\\times 3$', '$5\\times n+3$'], correct: 0, correction: 'القوس يبقى كما هو: $(5+n)\\times 3$ .' },
        { label: 'برنامج: «اختر عددًا، اضربه في $4$ ، أضف $6$ ثم خذ نصف النتيجة»', options: ['$\\frac{4x+6}{2}$', '$4x+\\frac{6}{2}$', '$\\frac{4x}{2}+6$'], correct: 0, correction: 'النصف يؤخذ في النهاية من النتيجة كلّها: $(4x+6)\\div 2$ . ($4x+\\frac{6}{2}$ يأخذ نصف الـ $6$ وحده.)' },
      ],
      explain: 'نبحث عمّا يتغيّر من سطر إلى سطر فنسمّيه بحرف، ونترك الباقي كما هو بأقواسه.',
    },
    commonError: 'نسيان القوس عند أخذ نصف النتيجة كلّها.',
  },
  {
    id: 'ex-4', source: src('prep', 55, 'أستعدّ', 10), alsoSource: [src('ex-8', 62, 'إنتاج عبارات حرفية', 8), src('ex-9', 63, 'إنتاج عبارات حرفية', 9), src('now-59', 59, 'دوري الآن', 1), src('self-10', 65, 'أؤكّد تعلّماتي', 10)], learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'مثلّث متساوي الساقين، طول كلّ ساق $x$ cm وطول قاعدته $7$ cm .',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'محيط المثلّث بدلالة $x$', options: ['$2x+7$', '$x+7$', '$x^2+7$'], correct: 0, correction: 'نجمع الأضلاع الثلاثة: $x+x+7=2x+7$ .' },
        { label: 'محيطه من أجل $x=6{,}5$ cm', options: ['$20$', '$13{,}7$', '$26{,}5$'], correct: 0, correction: '$2\\times 6{,}5+7=13+7=20$ cm .' },
        { label: 'طول $AB$ على قطعة مقسّمة إلى جزء $x$ ثم جزء $y$ ثم جزء $2$', options: ['$x+y+2$', '$xy2$', '$x+2y$'], correct: 0, correction: 'نجمع الأجزاء الثلاثة المتتالية: $x+y+2$ .' },
        { label: 'مساحة مستطيل عرضه $9$ cm وطوله $x$ cm', options: ['$9x$', '$9+x$', '$2x(9+x)$'], correct: 0, correction: 'المساحة هي الطول × العرض: $9\\times x=9x$ . ($2x(9+x)$ ضرب في $2$ كأنّه المحيط.)' },
      ],
      explain: 'المحيط هو مجموع الأضلاع؛ ثم نعوّض الحرف بقيمته ونحترم أولوية العمليات: الضرب قبل الجمع.',
    },
    commonError: 'كتابة $x+7$ كأنّ في المثلّث ضلعين فقط.',
  },
  {
    id: 'ex-5', source: src('ex-14', 63, 'أستعمل عبارات حرفية', 14), alsoSource: [src('ex-17', 63, 'أستعمل عبارات حرفية', 17), src('ex-24', 63, 'اختبار تساوي عبارتين حرفيتين', 24), src('ex-25', 63, 'اختبار تساوي عبارتين حرفيتين', 25), src('ex-26', 63, 'اختبار تساوي عبارتين حرفيتين', 26), src('self-4', 65, 'أؤكّد تعلّماتي', 4), src('self-5', 65, 'أؤكّد تعلّماتي', 5)], learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'نعتبر العبارتين $A=4x+3$ و $B=3x+2y$ .',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'قيمة $A$ من أجل $x=0$', options: ['$3$', '$0$', '$4$'], correct: 0, correction: '$4\\times 0+3=0+3=3$ .' },
        { label: 'قيمة $A$ من أجل $x=2$', options: ['$11$', '$10$', '$43$'], correct: 0, correction: '$4\\times 2+3=8+3=11$ . ($43$ يلصق الرقمين: $4$ و $3$ .)' },
        { label: 'قيمة $A$ من أجل $x=2{,}5$', options: ['$13$', '$12{,}5$', '$14{,}5$'], correct: 0, correction: '$4\\times 2{,}5+3=10+3=13$ .' },
        { label: 'قيمة $B$ من أجل $x=4$ و $y=5$', options: ['$22$', '$45$', '$17$'], correct: 0, correction: '$3\\times 4+2\\times 5=12+10=22$ . ($45$ يلصق $4$ و $5$ .)' },
      ],
      explain: 'نعوّض كلّ حرف بقيمته ونكتب العلامة $\\times$ المخفيّة ثم نحسب: الضرب قبل الجمع.',
    },
    commonError: 'لصق الأرقام: قراءة $4x$ من أجل $x=2$ على أنّها $42$ .',
  },
  {
    id: 'ex-6', source: src('ex-19', 63, 'تبسيط حساب حرفي', 19), alsoSource: [src('ex-21', 63, 'تبسيط حساب حرفي', 21), src('ex-22', 63, 'تبسيط حساب حرفي', 22), src('ex-23', 63, 'تبسيط حساب حرفي', 23), src('self-6', 65, 'أؤكّد تعلّماتي', 6)], learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'بسّط كتابة كلّ عبارة بحذف إشارة $\\times$ وبجمع الحدود المتشابهة.',
    interaction: 'batch',
    question: {
      rows: [
        { label: '$3\\times a\\times b$', options: ['$3ab$', '$3a+b$', '$a^3b$'], correct: 0, correction: 'نحذف إشارات $\\times$ أمام الحروف: $3ab$ .' },
        { label: '$1\\times x+0\\times y$', options: ['$x$', '$x+y$', '$0$'], correct: 0, correction: '$1\\times x=x$ و $0\\times y=0$ ، فالمجموع $x+0=x$ .' },
        { label: '$2a+3a+a$', options: ['$6a$', '$5a$', '$6a^3$'], correct: 0, correction: '$2a+3a+1a=(2+3+1)a=6a$ . (لا ننسى أنّ $a=1\\times a$ .)' },
        { label: '$a\\times a\\times 5$', options: ['$5a^2$', '$5a$', '$a^5$'], correct: 0, correction: '$a\\times a=a^2$ ثم $5a^2$ : المعامل أمام الحرف.' },
        { label: 'أعد كتابة $2x+y$ بإظهار إشارات $\\times$ المخفيّة', options: ['$2\\times x+y$', '$2\\times x\\times y$', '$2+x\\times y$'], correct: 0, correction: '$2x$ تعني $2\\times x$ ، و $y$ يبقى مجموعًا: $2\\times x+y$ .' },
        { label: 'الكتابة المبسّطة للعبارة $3\\times(5\\times x+4)$', options: ['$3(5x+4)$', '$3+(5x+4)$', '$35x+4$'], correct: 0, correction: 'نحذف $\\times$ أمام القوس وبين $5$ و $x$ : $3(5x+4)$ .' },
      ],
      explain: 'نحذف $\\times$ أمام حرف، و $1\\times a=a$ ، و $0\\times a=0$ ، و $a\\times a=a^2$ ، ونجمع $k\\times a+m\\times a=(k+m)a$ .',
    },
    commonError: 'كتابة $2a+3a=5a^2$ أو $6a^3$ بدل جمع المعاملين فقط.',
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
