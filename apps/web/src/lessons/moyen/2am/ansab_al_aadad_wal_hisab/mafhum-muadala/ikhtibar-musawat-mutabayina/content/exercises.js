/**
 * Les exercices du درس « اختبار صحة مساواة أو متباينة » (module 4 أتمرّن) : sept exercices de la plateforme, chacun reprend l'IDÉE d'un élément du manuel (`src`) avec d'AUTRES nombres et d'autres contextes
 * (une balance en équilibre, des tableaux de valeurs, des valeurs données). Les erreurs sont corrigées, jamais comptées ; chaque clé est recalculée dans ./content.test.js (arithmétique indépendante).
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '2am_ikhtibar-musawat-mutabayina_P1',
  P2: '2am_ikhtibar-musawat-mutabayina_P2',
  P3: '2am_ikhtibar-musawat-mutabayina_P3',
};

export const EXERCISES = [
  {
    id: 'ex-1', source: src('act-3', 57, 'أنشطة', 3), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'على كفّتي ميزان متوازن: $4$ علب كتلة كلّ منها $c$ بالغرام، وعلى الكفّة الأخرى $3$ كرات كتلة كلّ منها $b$ مع قطعة كتلتها $250\\,\\mathrm{g}$ ، أي $4c=3b+250$ .',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'من أجل $(b;c)=(50;100)$ : المساواة', options: ['خاطئة', 'صحيحة'], correct: 1, correction: '$4\\times100=400$ و $3\\times50+250=150+250=400$ : الطرفان متساويان.' },
        { label: 'من أجل $(b;c)=(70;110)$ : المساواة', options: ['صحيحة', 'خاطئة'], correct: 1, correction: '$4\\times110=440$ و $3\\times70+250=210+250=460$ ، و $440\\neq460$ .' },
        { label: 'من أجل $(b;c)=(100;110)$ : المساواة', options: ['خاطئة', 'صحيحة'], correct: 0, correction: '$4\\times110=440$ و $3\\times100+250=550$ ، و $440\\neq550$ .' },
      ],
      explain: 'بقيمتين نعوّض الحرفين معًا في الطرفين ونحسب كلّ طرف: الميزان يتوازن إذا تساوى الطرفان.',
    },
    commonError: 'حساب طرف واحد ومقارنته بعدد.',
  },
  {
    id: 'ex-2', source: src('ex-27', 64, 'المعادلات', 27), alsoSource: [src('act-3', 57, 'أنشطة', 3), src('ex-29', 64, 'اختبار تساوي عبارتين حرفيتين', 29), src('deep-57', 67, 'أتعمّق', 57)], learningPointId: LP.P1, difficulty: 'facile',
    statement: 'اختبر المساواة $15+3x=7x-1$ من أجل كلّ قيمة.',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'من أجل $x=4$ : الطرفان', options: ['$27$ و $27$ : صحيحة', '$27$ و $26$ : خاطئة', '$12$ و $27$ : خاطئة'], correct: 0, correction: '$15+3\\times4=27$ و $7\\times4-1=27$ ، فالمساواة صحيحة.' },
        { label: 'من أجل $x=5$ : الطرفان', options: ['$30$ و $34$ : خاطئة', '$30$ و $30$ : صحيحة', '$20$ و $34$ : خاطئة'], correct: 0, correction: '$15+3\\times5=30$ و $7\\times5-1=34$ ، و $30\\neq34$ .' },
      ],
      explain: 'نحسب كلّ طرف على حدة بعد التعويض ثمّ نقارن.',
    },
    commonError: 'نسيان تعويض الحرف في أحد الطرفين.',
  },
  {
    id: 'ex-3', source: src('ex-28', 64, 'المعادلات', 28), alsoSource: [src('deep-49', 66, 'أتعمّق', 49), src('ex-32', 64, 'المعادلات', 32), src('ex-33', 64, 'المعادلات', 33)], learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'نريد أن نعرف أيّ المساويتين $1+x=2x-0{,}5$ و $3+3x=3(x+1)$ صحيحة من أجل كلّ قيمة، فنحسب طرفيهما من أجل $x=1{,}5$ ثمّ $3$ ثمّ $0{,}5$ .',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'المساواة $1+x=2x-0{,}5$ من أجل $x=1{,}5$', options: ['خاطئة', 'صحيحة'], correct: 1, correction: '$1+1{,}5=2{,}5$ و $2\\times1{,}5-0{,}5=2{,}5$ .' },
        { label: 'المساواة $1+x=2x-0{,}5$ من أجل $x=3$', options: ['صحيحة', 'خاطئة'], correct: 1, correction: '$1+3=4$ و $2\\times3-0{,}5=5{,}5$ ، و $4\\neq5{,}5$ .' },
        { label: 'المساواة $3+3x=3(x+1)$ تبقى صحيحة', options: ['من أجل $1{,}5$ فقط', 'مهما كانت قيمة $x$', 'لا من أجل أيّ قيمة'], correct: 1, correction: '$3(x+1)=3x+3$ بالتوزيع، وهو يساوي $3+3x$ دائمًا.' },
      ],
      explain: 'مساواة تصحّ من أجل قيمة واحدة ليست صحيحة دائمًا؛ أمّا إذا برّرتها قاعدة التوزيع فهي صحيحة دائمًا.',
    },
    commonError: 'الظنّ أنّ الصحّة من أجل قيمة تعني الصحّة دائمًا.',
  },
  {
    id: 'ex-4', source: src('now-61', 61, 'دوري الآن', 1), alsoSource: [src('ex-30', 64, 'المعادلات', 30), src('deep-55', 67, 'أتعمّق', 55), src('ex-20', 63, 'تبسيط حساب حرفي', 20), src('self-9', 65, 'أؤكّد', 9)], learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'أيّ المساويات الآتية صحيحة مهما كان العدد $x$ ؟',
    interaction: 'batch',
    question: {
      rows: [
        { label: '$x+x=2x$', options: ['صحيحة دائمًا', 'مثال مضادّ موجود'], correct: 0, correction: '$x+x=2x$ ، قاعدة جمع حدّين متشابهين.' },
        { label: '$x+x=x^2$', options: ['صحيحة دائمًا', 'مثال مضادّ موجود'], correct: 1, correction: 'من أجل $x=3$ : $3+3=6$ و $3^2=9$ ، و $6\\neq9$ .' },
        { label: '$2+3x=5x$', options: ['صحيحة دائمًا', 'مثال مضادّ موجود'], correct: 1, correction: 'من أجل $x=0$ : $2+0=2$ و $5\\times0=0$ ، و $2\\neq0$ .' },
        { label: '$4(x+2)=4x+8$', options: ['مثال مضادّ موجود', 'صحيحة دائمًا'], correct: 1, correction: 'توزيع الضرب على الجمع: $4(x+2)=4x+8$ .' },
        { label: '$n+n=n\\times n$ ، وهي صحيحة من أجل $n=0$', options: ['فهي صحيحة دائمًا', 'لكنّها ليست صحيحة دائمًا ($n=1$ : $2\\neq1$)'], correct: 1, correction: 'من أجل $n=1$ : $1+1=2$ و $1\\times1=1$ ، فمثال واحد يكفي لنفي الصحّة دائمًا.' },
      ],
      explain: 'نبحث عن مثال مضادّ؛ إن لم نجده نبرّر بقاعدة معروفة كالتوزيع، فلا نكتفي بتجربة قيمتين.',
    },
    commonError: 'اعتبار مساواة صحيحة دائمًا لأنّها صحيحة من أجل قيمة جرّبناها.',
  },
  {
    id: 'ex-5', source: src('ex-31', 64, 'المعادلات', 31), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'من بين القيم $1{,}5$ و $2$ و $2{,}5$ و $3$ ، ما القيمة التي تجعل المساواة $4x+3=13$ صحيحة؟',
    interaction: 'numeric',
    question: { prompt: '$x=$', expected: 2.5, display: '2,5', explain: '$4\\times2{,}5+3=10+3=13$ ؛ أمّا $2$ فتعطي $11$ و $3$ تعطي $15$ و $1{,}5$ تعطي $9$ .' },
    commonError: 'الاكتفاء بحساب $4x$ دون إضافة $3$ .',
  },
  {
    id: 'ex-6', source: src('act-3', 57, 'أنشطة', 3), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'من بين القيم $3$ و $4$ و $5$ و $6$ ، ما القيم التي تجعل المتباينة $8x-5<40-x$ صحيحة؟',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'من أجل $x=3$', options: ['$19<37$ : صحيحة', '$19<37$ : خاطئة'], correct: 0, correction: '$8\\times3-5=19$ و $40-3=37$ ، و $19<37$ صحيحة.' },
        { label: 'من أجل $x=5$', options: ['$35<35$ : صحيحة', '$35<35$ : خاطئة'], correct: 1, correction: '$8\\times5-5=35$ و $40-5=35$ ، والعدد $35$ ليس أقلّ تمامًا من $35$ .' },
        { label: 'من أجل $x=6$', options: ['$43<34$ : خاطئة', '$43<34$ : صحيحة'], correct: 0, correction: '$8\\times6-5=43$ و $40-6=34$ ، و $43$ أكبر من $34$ .' },
        { label: 'القيم التي تحقّقها', options: ['$3$ و $4$', '$3$ و $4$ و $5$', '$5$ و $6$'], correct: 0, correction: '$x=4$ يعطي $27<36$ صحيحة؛ و $x=5$ يعطي التساوي لا الأصغر تمامًا.' },
      ],
      explain: 'نختبر كلّ قيمة على حدة؛ وعند التساوي يخطئ الرمز $<$ ويصحّ الرمز $\\le$ .',
    },
    commonError: 'اعتبار $35<35$ صحيحة.',
  },
  {
    id: 'ex-7', source: src('ict', 69, 'دوري الآن', 1), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'نملأ جدول قيم $3x+2$ و $5x-6$ من أجل $x=0$ ثمّ $1$ ثمّ ... إلى $8$ : عند $x=2$ نجد $8$ و $4$ ، وعند $x=3$ نجد $11$ و $9$ ، وعند $x=5$ نجد $17$ و $19$ .',
    interaction: 'numeric',
    question: { prompt: 'تتساوى العبارتان من أجل $x=$', expected: 4, display: '4', explain: 'من أجل $x=4$ : $3\\times4+2=14$ و $5\\times4-6=14$ . قبله الأولى أكبر وبعده الثانية أكبر.' },
    commonError: 'التوقّف عند أوّل قيمتين دون إكمال الجدول.',
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
