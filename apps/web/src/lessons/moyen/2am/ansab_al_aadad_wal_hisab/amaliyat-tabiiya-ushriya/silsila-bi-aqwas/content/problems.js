/**
 * Les trois « مسائل » du درس « سلسلة عمليات تتضمّن أقواسا » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas (GuidedProblem).
 * La مسألة 1 (`LESSON_CONFIG.lessonProblem`, act-3 q4 redessinée) : les rayons de la bibliothèque, (18 + 129) ÷ 7 = 21 ; la 2 les moyennes d'un trimestre
 * ((15 + 12,5 + 2 × 14) ÷ 4 = 13,875 et (9 + 11 + 2 × 8,5) ÷ 4 = 9,25) ; la 3 la calculatrice (ict redessinée : (147 − 39) ÷ (2 + 5 × 2) = 9 et 600 ÷ (2,5 + 7,5) = 60).
 * Chaque nombre est vérifié dans ./problems.test.js en arithmétique EXACTE (BigInt). Aucun résultat négatif.
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — رفوف المكتبة',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '📚',
    tone: 'indigo',
    source: SOURCE,
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'في المكتبة 18 قاموسًا', useful: true },
      { id: 'd2', text: 'وفيها 129 قصّة', useful: true },
      { id: 'd3', text: 'في كلّ رفّ 7 كتب', useful: true },
      { id: 'd4', text: 'المكتبة في الطابق الأرضي', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'كتابة السلسلة',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['السلسلة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['aqwas-awwalan'],
            prompt: 'أيّ سلسلة تعطي عدد الرفوف اللازمة؟',
            options: ['$(18 + 129) \\div 7$', '$18 + 129 \\div 7$', '$(18 + 129) \\times 7$'], correct: 0, cols: 1,
            explain: 'الرفوف تتّسع للكتب كلّها: نجمع القواميس والقصص أوّلًا، ثم نقسم على 7 كتب في الرفّ. (الثانية قسمت القصص وحدها؛ والثالثة ضربت بدل أن تقسم.)' },
          { kind: 'solution', ask: 0, lines: [
            'عدد الكتب كلّها هو $18 + 129$ ، ويوضع في الرفّ الواحد 7 كتب.',
            'نضع المجموع بين قوسين قبل القسمة: $(18 + 129) \\div 7$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'عدد الرفوف',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['عدد الرفوف'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['aqwas-awwalan'], prompt: 'عدد الرفوف:', expected: 21, display: '21',
            explain: 'القوسان أوّلًا: $18 + 129 = 147$ ، ثم $147 \\div 7 = 21$ .' },
          { kind: 'solution', ask: 0, lines: [
            'نحسب ما بين القوسين أوّلًا: $(18 + 129) \\div 7 = 147 \\div 7$ .',
            '$147 \\div 7 = 21$ ، فتلزم $21$ رفًّا.',
          ] },
        ],
      },
      {
        label: '3)', title: 'حساب دون قوسين',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['الخطأ'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['aqwas-awwalan'],
            prompt: 'حسب زميلك $18 + 129 \\div 7$ فوجد $36{,}428\\ldots$ ما الخطأ؟',
            options: ['قسم القصص وحدها على 7 قبل أن يجمع القواميس، فالعدد ليس عدد رفوف', 'جمع قبل أن يقسم', 'أخطأ في الجمع'], correct: 0, cols: 1,
            explain: 'دون القوسين تحسب الآلة $129 \\div 7 = 18{,}428\\ldots$ أوّلًا ثم تضيف $18$ ؛ والرفوف عدد صحيح يخصّ الكتب كلّها.' },
          { kind: 'solution', ask: 0, lines: [
            'دون قوسين تُحسب القسمة أوّلًا: $129 \\div 7$ فقط.',
            'فيظهر $36{,}428\\ldots$ ، وهو ليس عددًا صحيحًا من الرفوف: لا بدّ من القوسين.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — معدّل الفصل',
    context: 'معدّلات الفصل',
    emoji: '📝',
    tone: 'sky',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'سارة', lines: [{ label: 'العلامتان', value: '15 و 12,5' }, { label: 'الاختبار (معامل 2)', value: '14' }] }, { title: 'أمين', lines: [{ label: 'العلامتان', value: '9 و 11' }, { label: 'الاختبار (معامل 2)', value: '8,5' }] }, { title: 'المعدّل', lines: [{ label: 'يُقسم المجموع على', value: '4' }] }], ariaLabel: 'بطاقة سارة: علامتان 15 و 12,5 واختبار 14 بمعامل 2؛ بطاقة أمين: علامتان 9 و 11 واختبار 8,5 بمعامل 2؛ المعدّل مجموع العلامات مقسومًا على 4' },
    statement: 'علامات سارة: $15$ و $12{,}5$ والاختبار $14$ بمعامل 2 ؛ علامات أمين: $9$ و $11$ والاختبار $8{,}5$ بمعامل 2 . المعدّل هو مجموع العلامات (الاختبار مرّتين) مقسومًا على $4$ .',
    data: [
      { id: 'a', text: 'سارة: 15 و 12,5 والاختبار 14', useful: true },
      { id: 'b', text: 'أمين: 9 و 11 والاختبار 8,5', useful: true },
      { id: 'c', text: 'الاختبار بمعامل 2 ويُقسم المجموع على 4', useful: true },
      { id: 'd', text: 'أمين يجلس في الصفّ الأخير', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'معدّل سارة',
        question: 'اكتب سلسلة معدّل سارة، ثم احسبه.',
        asks: ['معدّل سارة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['aqwas-awwalan'],
            prompt: 'أيّ سلسلة تعطي معدّل سارة؟',
            options: ['$(15 + 12{,}5 + 2 \\times 14) \\div 4$', '$15 + 12{,}5 + 2 \\times 14 \\div 4$', '$(15 + 12{,}5 + 14) \\div 4$'], correct: 0, cols: 1,
            explain: 'مجموع العلامات كلّه يُقسم على 4، والاختبار يُحتسب مرّتين. (الثانية قسمت الاختبار وحده؛ والثالثة نسيت المعامل 2.)' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['aqwas-awwalan'], prompt: 'معدّل سارة:', expected: 13.875, display: '13,875',
            explain: 'داخل القوسين الضرب أوّلًا: $2 \\times 14 = 28$ ثم $15 + 12{,}5 + 28 = 55{,}5$ ؛ ثم $55{,}5 \\div 4 = 13{,}875$ .' },
          { kind: 'solution', ask: 0, lines: [
            'المعدّل $(15 + 12{,}5 + 2 \\times 14) \\div 4$ : نحسب ما بين القوسين أوّلًا.',
            'الضرب أوّلًا فيه: $2 \\times 14 = 28$ ، ثم $15 + 12{,}5 + 28 = 55{,}5$ .',
            '$55{,}5 \\div 4 = 13{,}875$ ، فمعدّل سارة $13{,}875$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'معدّل أمين',
        question: 'احسب معدّل أمين بالطريقة نفسها.',
        asks: ['معدّل أمين'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['aqwas-awwalan'], prompt: 'معدّل أمين:', expected: 9.25, display: '9,25',
            explain: '$(9 + 11 + 2 \\times 8{,}5) \\div 4 = (9 + 11 + 17) \\div 4 = 37 \\div 4 = 9{,}25$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$(9 + 11 + 2 \\times 8{,}5) \\div 4$ : الضرب داخل القوسين أوّلًا، $2 \\times 8{,}5 = 17$ .',
            '$9 + 11 + 17 = 37$ ثم $37 \\div 4 = 9{,}25$ ، فمعدّل أمين $9{,}25$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'من يتجاوز 10 ؟',
        question: 'أيّ التلميذين معدّله أكبر من $10$ ؟',
        asks: ['الحكم'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['aqwas-awwalan'],
            prompt: 'معدّل سارة $13{,}875$ ومعدّل أمين $9{,}25$ :',
            options: ['سارة وحدها تتجاوز 10', 'أمين وحده يتجاوز 10', 'كلاهما يتجاوز 10'], correct: 0, cols: 1,
            explain: '$13{,}875 > 10$ بينما $9{,}25 < 10$ : ينقص أمين $0{,}75$ نقطة ليبلغ 10.' },
          { kind: 'solution', ask: 0, lines: [
            'نقارن كلّ معدّل بـ $10$ : $13{,}875 > 10$ و $9{,}25 < 10$ .',
            'سارة وحدها تتجاوز $10$ .',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — الآلة الحاسبة',
    context: 'حاسبة التعاونية',
    emoji: '🧮',
    tone: 'emerald',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'العبارة A', lines: [{ label: 'البسط', value: '147 − 39' }, { label: 'المقام', value: '2 + 5 × 2' }] }, { title: 'حجز ياسين', lines: [{ label: 'الأزرار', value: '600 ÷ 2,5 + 7,5 =' }, { label: 'ظهر', value: '247,5' }] }], ariaLabel: 'بطاقتان: العبارة A بسطها 147 ناقص 39 ومقامها 2 زائد 5 ضرب 2؛ وحجز ياسين 600 ÷ 2,5 + 7,5 فظهر 247,5' },
    statement: 'نريد حساب $A = \\dfrac{147 - 39}{2 + 5 \\times 2}$ بآلة حاسبة. ولحساب $\\dfrac{600}{2{,}5 + 7{,}5}$ حجز ياسين $600 \\div 2{,}5 + 7{,}5 =$ فوجد $247{,}5$ .',
    data: [
      { id: 'a', text: 'A = (147 − 39) على (2 + 5 × 2)', useful: true },
      { id: 'b', text: 'حجز ياسين: 600 ÷ 2,5 + 7,5 =', useful: true },
      { id: 'c', text: 'ظهر 247,5', useful: true },
      { id: 'd', text: 'الآلة تعمل بالبطارية', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'حساب A',
        question: 'اكتب الأزرار التي تحسب بها الآلة $A$ ، ثم قيمتها.',
        asks: ['الأزرار', 'قيمة A'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tariqa-khatt-kasr-alat'],
            prompt: 'أيّ الأزرار تعطي $A$ ؟',
            options: ['$( 147 - 39 ) \\div ( 2 + 5 \\times 2 ) =$', '$147 - 39 \\div 2 + 5 \\times 2 =$', '$( 147 - 39 ) \\div 2 + 5 \\times 2 =$'], correct: 0, cols: 1,
            explain: 'البسط كلّه بين قوسين والمقام كلّه بين قوسين. (الثانية بلا أقواس؛ والثالثة نسيت قوسي المقام.)' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['tariqa-khatt-kasr-alat'], prompt: 'قيمة A:', expected: 9, display: '9',
            explain: 'البسط $147 - 39 = 108$ ، والمقام $2 + 5 \\times 2 = 12$ ، و $108 \\div 12 = 9$ .' },
          { kind: 'solution', ask: 0, lines: [
            'نضع البسط بين قوسين والمقام بين قوسين: $( 147 - 39 ) \\div ( 2 + 5 \\times 2 )$ .',
            'البسط $108$ ، والمقام $2 + 10 = 12$ ، و $108 \\div 12 = 9$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'خطأ ياسين',
        question: 'اشرح خطأ ياسين وصحّحه.',
        asks: ['الخطأ', 'القيمة الصحيحة'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tariqa-khatt-kasr-alat'],
            prompt: 'ظهر $247{,}5$ لأنّ الآلة:',
            options: ['قسمت $600$ على $2{,}5$ ثم أضافت $7{,}5$ ، لأنّه لم يضع المقام بين قوسين', 'جمعت $2{,}5 + 7{,}5$ أوّلًا', 'ضربت بدل أن تقسم'], correct: 0, cols: 1,
            explain: '$600 \\div 2{,}5 = 240$ ثم $240 + 7{,}5 = 247{,}5$ ؛ المقام $2{,}5 + 7{,}5$ كان يجب أن يُحسب أوّلًا.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['tariqa-khatt-kasr-alat'], prompt: 'القيمة الصحيحة لـ $\\dfrac{600}{2{,}5 + 7{,}5}$ :', expected: 60, display: '60',
            explain: '$600 \\div (2{,}5 + 7{,}5) = 600 \\div 10 = 60$ .' },
          { kind: 'solution', ask: 0, lines: [
            'دون قوسين قسمت الآلة $600 \\div 2{,}5 = 240$ ثم أضافت $7{,}5$ فظهر $247{,}5$ .',
            'الصحيح $600 \\div ( 2{,}5 + 7{,}5 ) =$ ، أي $600 \\div 10 = 60$ .',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
