/**
 * Les exercices du درس « تطبيق قاعدة حرفية » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres contextes, autres nombres, la même compétence). Chaque exercice porte en `source`
 * l'élément du manuel dont il est tiré ; jamais montré à l'élève (`SourceTag` est muet). Toutes les clés sont recalculées en arithmétique rationnelle EXACTE dans ./content.test.js
 * (BigInt, un évaluateur d'expressions PROPRE au test), et chaque distracteur y est vérifié FAUX.
 * Destinations (docs/sources/1am/unit6/extraction.json) : act-2 → ex-1 ; ex-4 → ex-2 ; ex-5 → ex-3 ; ex-6 → ex-4 ; know-1 → ex-5 ; ict / ict-ex → ex-6 ; act-4 → ex-7 (et le labo, tâche a3) ;
 deep-5 → la مسألة 3. Les épreuves du إختبار أولي sont des ajouts de la plateforme.
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '1am_tatbiq-qaida-harfiya_P1',
  P2: '1am_tatbiq-qaida-harfiya_P2',
  P3: '1am_tatbiq-qaida-harfiya_P3',
};

const T = (s) => `$${s}$`;
/** Une ligne : `right` est la bonne option (placée en tête, `correct: 0`) ; les autres sont des erreurs réelles. */
const row = (label, right, wrong, correction) => ({ label, options: [right, ...wrong], correct: 0, correction });

export const EXERCISES = [
  {
    id: 'ex-1', source: src('act-2', 79, 'أطبّق قاعدة حرفية'), learningPointId: LP.P2, difficulty: 'facile',
    statement: 'في بطولة الحيّ لكرة القدم يحسب كلّ فريق نقاطه بالقاعدة $P=3\\times w+d$ ، حيث $w$ عدد انتصاراته و $d$ عدد تعادلاته. احسب نقاط كلّ فريق:',
    interaction: 'batch',
    question: {
      rows: [
        row('الفريق الأخضر : $w=5$ و $d=2$', T('17'), [T('21'), T('10')], '$3\\times 5+2=15+2=17$ ؛ أمّا $21$ فيأتي من $3\\times(5+2)$ و $10$ من $3+5+2$ .'),
        row('الفريق الأزرق : $w=3$ و $d=6$', T('15'), [T('27'), T('12')], '$3\\times 3+6=9+6=15$ ؛ أمّا $27$ فيأتي من $3\\times(3+6)$ و $12$ من $3+3+6$ .'),
        row('الفريق الأحمر : $w=7$ و $d=0$', T('21'), [T('10'), T('0')], '$3\\times 7+0=21$ ؛ أمّا $10$ فيأتي من $3+7+0$ و $0$ من ضرب كلّ شيء في $0$ .'),
        row('أيّ فريق أحرز أكثر النقاط ؟', 'الأحمر', ['الأخضر', 'الأزرق'], 'الأحمر $21$ ثمّ الأخضر $17$ ثمّ الأزرق $15$ .'),
      ],
      explain: 'نضع قيمة كلّ حرف في موضعه ثمّ نحسب : الضرب قبل الجمع.',
    },
    commonError: 'جمع كلّ الأعداد دون ضرب، أو ضرب المجموع كلّه في 3.',
  },
  {
    id: 'ex-2', source: src('ex-4', 83, 'تطبيق قاعدة حرفية', 4), learningPointId: LP.P2, difficulty: 'facile',
    statement: 'نعتبر العبارة $B=2\\times x+9-x\\div 2$ . احسب قيمة $B$ في كلّ حالة:',
    interaction: 'batch',
    question: {
      rows: [
        row('من أجل $x=4$', T('15'), [T('19'), T('13')], '$2\\times 4+9-4\\div 2=8+9-2=15$ ؛ أمّا $19$ فيأتي من جمع $2$ بدل طرحه و $13$ من نسيان القسمة على $2$ .'),
        row('من أجل $x=0{,}5$', T('9{,}75'), [T('10{,}25'), T('9{,}5')], '$2\\times 0{,}5+9-0{,}5\\div 2=1+9-0{,}25=9{,}75$ ؛ أمّا $10{,}25$ فيأتي من جمع $0{,}25$ و $9{,}5$ من طرح $0{,}5$ دون قسمته.'),
        row('من أجل $x=0$', T('9'), [T('0'), T('18')], '$2\\times 0+9-0\\div 2=0+9-0=9$ ؛ الحرف $x$ مكتوب في موضعين فنضع $0$ فيهما.'),
      ],
      explain: 'نضع القيمة في كلّ موضع يظهر فيه الحرف ثمّ نحسب : القسمة والضرب قبل الجمع والطرح.',
    },
    commonError: 'وضع القيمة في موضع واحد من موضعي الحرف، أو الخلط في ترتيب الجمع والطرح.',
  },
  {
    id: 'ex-3', source: src('ex-5', 83, 'تطبيق قاعدة حرفية', 5), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'نعتبر العبارة $C=(5\\times x)-(3\\times y)+4$ ذات الحرفين $x$ و $y$ . احسب قيمة $C$ في كلّ حالة:',
    interaction: 'batch',
    question: {
      rows: [
        row('من أجل $x=3$ و $y=2$', T('13'), [T('5'), T('25')], '$5\\times 3-3\\times 2+4=15-6+4=13$ ؛ أمّا $5$ فيأتي من طرح $6+4$ و $25$ من جمع $6$ بدل طرحه.'),
        row('من أجل $x=4$ و $y=2$', T('18'), [T('10'), T('30')], '$5\\times 4-3\\times 2+4=20-6+4=18$ .'),
        row('من أجل $x=2$ و $y=3$', T('5'), [T('23'), T('1')], '$5\\times 2-3\\times 3+4=10-9+4=5$ ؛ أمّا $1$ فيأتي من نسيان $+4$ .'),
      ],
      explain: 'لكلّ حرف قيمته في موضعه، ثمّ نحسب الجداءين قبل الطرح والجمع.',
    },
    commonError: 'وضع قيمة x مكان y أو العكس، أو طرح مجموع ما بعد إشارة الطرح.',
  },
  {
    id: 'ex-4', source: src('ex-6', 83, 'تطبيق قاعدة حرفية', 6), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'السرعة المتوسّطة لسيّارة تُعطى بالقاعدة $V=d\\div t$ ، حيث $d$ المسافة بالكيلومتر و $t$ الزمن بالساعة و $V$ السرعة بالكيلومتر في الساعة. أكمل الجدول:',
    interaction: 'batch',
    question: {
      rows: [
        row('$d=120$ و $t=2$ : $V$ تساوي', T('60'), [T('240'), T('118')], '$120\\div 2=60$ ؛ أمّا $240$ فهو جداؤهما و $118$ هو فرقهما.'),
        row('$d=90$ و $t=1{,}5$ : $V$ تساوي', T('60'), [T('135'), T('88{,}5')], '$90\\div 1{,}5=60$ ، ونتحقّق : $60\\times 1{,}5=90$ ؛ أمّا $135$ فهو جداؤهما.'),
        row('$d=45$ و $t=0{,}5$ : $V$ تساوي', T('90'), [T('22{,}5'), T('44{,}5')], '$45\\div 0{,}5=90$ ، ونتحقّق : $90\\times 0{,}5=45$ ؛ أمّا $22{,}5$ فهو جداؤهما.'),
      ],
      explain: 'نقسم المسافة على الزمن ؛ وقسمة عدد على 0,5 تضاعفه.',
    },
    commonError: 'ضرب المسافة في الزمن أو طرح أحدهما من الآخر بدل القسمة.',
  },
  {
    id: 'ex-5', source: src('know-1', 81, 'أحوصل تعلّماتي', 1), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'اصطلاحات كتابة العبارة الحرفية : اختر الجواب الصحيح في كلّ حالة:',
    interaction: 'batch',
    question: {
      rows: [
        row('نحذف إشارة الضرب في $3\\times a$ فنكتب', T('3a'), [T('a3'), T('3+a')], 'نكتب العدد قبل الحرف : $3\\times a=3a$ .'),
        row('نحذف إشارة الضرب في $a\\times b$ فنكتب', T('ab'), [T('a+b'), T('a-b')], '$a\\times b=ab$ : حذف الإشارة بين حرفين لا يعني جمعًا ولا طرحًا.'),
        row('قيمة $2x$ من أجل $x=3$', T('6'), [T('23'), T('5')], '$2x=2\\times x$ ، فمن أجل $x=3$ نجد $2\\times 3=6$ ؛ أمّا $23$ فيأتي من وضع العددين متجاورين و $5$ من جمعهما.'),
        row('هل نحذف إشارة الضرب في $2\\times 3$ ؟', 'لا : بين عددين تبقى الإشارة، ولو حذفناها لقرأنا 23', ['نعم : نكتب 23', 'نعم : نكتب 5'], 'الإشارة بين عددين لا تُحذف : $2\\times 3=6$ لا $23$ .'),
      ],
      explain: 'نحذف الإشارة بين عدد وحرف أو بين حرفين، لا بين عددين ؛ وعند التعويض تعود الإشارة.',
    },
    commonError: 'قراءة العدد والحرف المتجاورين بعد التعويض عددًا واحدًا (2x من أجل x = 3 تصير 23).',
  },
  {
    id: 'ex-6', source: src('ict', 88, 'استعمل تكنولوجيات الإعلام والاتصال'), cites: [src('ict-ex', 88, 'تمرين')], learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'في مجدول نحسب قيم العبارة $6x-4$ ، وقيم $x$ مكتوبة في العمود A انطلاقًا من الخانة A2 حيث $x=2$ :',
    interaction: 'batch',
    question: {
      rows: [
        row('الصيغة المناسبة في الخانة B2', T('=6*A2-4'), [T('=6A2-4'), T('=6*A2+4')], 'في المجدول نكتب إشارة الضرب دائمًا : $=6*A2-4$ ؛ و $6A2$ لا يفهمها المجدول.'),
        row('القيمة التي تظهر في B2', T('8'), [T('12'), T('58')], '$6\\times 2-4=12-4=8$ ؛ أمّا $58$ فيأتي من قراءة $62-4$ .'),
        row('القيمة التي تظهر من أجل $x=5$', T('26'), [T('30'), T('34')], '$6\\times 5-4=30-4=26$ .'),
        row('القيمة التي تظهر من أجل $x=10$', T('56'), [T('60'), T('64')], '$6\\times 10-4=60-4=56$ .'),
      ],
      explain: 'المجدول يطبّق القاعدة نفسها على كلّ قيمة : نضرب ثمّ نطرح.',
    },
    commonError: 'كتابة 6A2 دون إشارة الضرب، أو نسيان الطرح.',
  },
  {
    id: 'ex-7', source: src('act-4', 80, 'أبرّر بالمثال المضاد'), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'قال ياسين : « ضعف أيّ عدد طبيعي أكبر من العدد نفسه »، أي $2\\times n>n$ دائمًا. نختبر قوله:',
    interaction: 'batch',
    question: {
      rows: [
        row('من أجل $n=5$', 'القاعدة صحيحة : $10$ أكبر من $5$', ['القاعدة خاطئة : $10$ أصغر من $5$', 'القاعدة خاطئة : $10$ يساوي $5$'], '$2\\times 5=10$ وهو أكبر من $5$ ، فالقاعدة تصحّ في هذا المثال.'),
        row('من أجل $n=0$', 'القاعدة خاطئة : $2\\times 0=0$ وهو ليس أكبر من $0$', ['القاعدة صحيحة : $2\\times 0$ أكبر من $0$', 'القاعدة خاطئة : $2\\times 0$ أصغر من $0$'], '$2\\times 0=0$ و $0$ ليس أكبر من $0$ : هذا مثال مضادّ.'),
        row('هل مثال واحد مثل $n=0$ يكفي لنقول إنّ قوله غير صحيح دائمًا ؟', 'نعم : مثال مضادّ واحد يكفي', ['لا : يلزم مثال آخر', 'لا : لأنّ قوله صحّ من أجل 5'], 'مثال واحد تخطئ فيه القاعدة يكفي ؛ والأمثلة التي تصحّ فيها لا تنقذها.'),
      ],
      explain: 'نبحث عن قيمة واحدة تختلف عندها الجهتان : هذا مثال مضادّ.',
    },
    commonError: 'الاكتفاء بأمثلة تصحّ فيها القاعدة للحكم بصحّتها.',
  },
];

/**
 * Les cinq épreuves du إختبار أولي (module 8), en DONNÉES pour que ./content.test.js recalcule chaque clé et vérifie chaque distracteur FAUX.
 * `kind` dit ce que le test recalcule : `write` (la bonne écriture sans signe ×), `value` (la valeur d'une expression pour des valeurs de lettres), `counter` (la valeur qui réfute une règle).
 */
export const FINAL = [
  { id: 'E1', skill: 'write', lp: LP.P1, source: null, kind: 'write', stem: 'نحذف إشارة الضرب في $6\\times t$ فنكتب:',
    options: ['$6t$', '$t6$', '$6+t$', '$t+6$'], correct: 0, cols: 2,
    explain: 'نحذف الإشارة بين عدد وحرف ونكتب العدد قبل الحرف : $6\\times t=6t$ .' },
  { id: 'E2', skill: 'subst', lp: LP.P2, source: null, kind: 'value', expr: '4*(a+3)', env: { a: '5' }, stem: 'قيمة العبارة $4\\times(a+3)$ من أجل $a=5$ هي:',
    options: ['$32$', '$23$', '$12$', '$20$'], correct: 0, cols: 2,
    explain: 'ما بين القوسين أوّلًا : $4\\times(5+3)=4\\times 8=32$ .' },
  { id: 'E3', skill: 'two', lp: LP.P2, source: null, kind: 'value', expr: '3*x+2*y', env: { x: '4', y: '5' }, stem: 'قيمة العبارة $3x+2y$ من أجل $x=4$ و $y=5$ هي:',
    options: ['$22$', '$14$', '$59$', '$32$'], correct: 0, cols: 2,
    explain: '$3x+2y=3\\times 4+2\\times 5=12+10=22$ ؛ أمّا $59$ فيأتي من وضع العددين متجاورين : $34+25$ .' },
  { id: 'E4', skill: 'decimal', lp: LP.P2, source: null, kind: 'value', expr: '2*(x+0,5)', env: { x: '3' }, stem: 'قيمة العبارة $2\\times(x+0{,}5)$ من أجل $x=3$ هي:',
    options: ['$7$', '$6{,}5$', '$3{,}5$', '$5$'], correct: 0, cols: 2,
    explain: '$2\\times(3+0{,}5)=2\\times 3{,}5=7$ ؛ أمّا $6{,}5$ فيأتي من ضرب $x$ وحده في $2$ .' },
  { id: 'E5', skill: 'counter', lp: LP.P3, source: src('act-4', 80, 'أبرّر بالمثال المضاد'), kind: 'counter', left: 'n*n', right: '2*n', stem: 'قال زميل : « $n\\times n=2\\times n$ دائمًا ». أيّ قيمة لـ $n$ تُثبت أنّه مخطئ؟',
    options: ['$n=3$', '$n=0$', '$n=2$', '$n=0$ أو $n=2$'], correct: 0, cols: 2,
    explain: '$3\\times 3=9$ بينما $2\\times 3=6$ : الجهتان مختلفتان ؛ أمّا من أجل $0$ و $2$ فتصحّ القاعدة ولا تثبت شيئًا.' },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
