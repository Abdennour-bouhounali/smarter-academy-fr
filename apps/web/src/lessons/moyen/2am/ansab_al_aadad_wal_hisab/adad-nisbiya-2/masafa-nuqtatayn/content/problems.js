/**
 * Les trois « مسائل » du درس « المسافة بين نقطتين على مستقيم مدرّج » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas (GuidedProblem). La مسألة 1 est
 * l'écart de température de trois villes — `LESSON_CONFIG.lessonProblem` ; la 2 les arrêts d'une ligne de bus (distances et milieu) ; la 3 les hauteurs d'une tour. Chaque مسألة porte son
 * support (un tableau). Chaque nombre est vérifié dans ./problems.test.js en arithmétique EXACTE.
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — فارق الحرارة في ثلاث مدن',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🌡️',
    tone: 'sky',
    source: SOURCE,
    table: LESSON_CONFIG.lessonProblem.table,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'الصغرى والكبرى لكلّ مدينة بالدرجة المئوية', useful: true },
      { id: 'd2', text: 'فارق المدينة هو المسافة بين صغراها وكبراها', useful: true },
      { id: 'd3', text: 'سجّل نادي الأرصاد القياسات في الفجر وعند الظهر', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'فارق كلّ مدينة',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['فارق الجلفة', 'فارق تمنراست', 'فارق قسنطينة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qaidat-masafa'], prompt: 'فارق الجلفة بالدرجة:', expected: 13,
            explain: '$(+8)-(-5)=(+8)+(+5)=13$ : الصغرى والكبرى على جانبي الصفر.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['qaidat-masafa'], prompt: 'فارق تمنراست بالدرجة:', expected: 18,
            explain: '$(+22)-(+4)=18$ .' },
          { kind: 'numeric', role: 'answer', ask: 2, requires: ['qaidat-masafa'], prompt: 'فارق قسنطينة بالدرجة:', expected: 13,
            explain: '$(+12)-(-1)=(+12)+(+1)=13$ .' },
          { kind: 'solution', ask: 0, lines: [
            'فارق المدينة هو الكبرى ناقص الصغرى.',
            'الجلفة: $8-(-5)=13$ ؛ تمنراست: $22-4=18$ ؛ قسنطينة: $12-(-1)=13$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'أكبر فارق',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['المدينة'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qaidat-masafa'], prompt: 'المدينة صاحبة أكبر فارق:', options: ['تمنراست', 'الجلفة', 'قسنطينة'], correct: 0, cols: 3,
            explain: 'فارق تمنراست $18$ وهو أكبر من $13$ و $13$ .' },
          { kind: 'solution', ask: 0, lines: ['نقارن الفوارق: $13$ و $18$ و $13$ .', 'أكبرها $18$ : تمنراست.'] },
        ],
      },
      {
        label: '3)', title: 'مدينة رابعة',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['صغرى المدينة الرابعة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['nuqtatan'], prompt: 'صغرى المدينة الرابعة (موجبة) بالدرجة:', expected: 1,
            explain: 'الدرجتان اللتان تبعدان $6$ عن $-5$ هما $-5+6=+1$ و $-5-6=-11$ ؛ الموجبة منهما $+1$ .' },
          { kind: 'solution', ask: 0, lines: ['نقطتان تبعدان $6$ عن $-5$ : $-5+6=+1$ و $-5-6=-11$ .', 'الصغرى موجبة، فهي $+1$ ، والأخرى $-11$ سالبة فلا تصلح.'] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — محطّات الحافلة',
    context: 'طريق مستقيم',
    emoji: '🚌',
    tone: 'teal',
    source: SOURCE,
    table: { caption: 'فواصل ثلاث محطّات بالكيلومتر، مبدؤها المحطة الرئيسية', head: ['المحطة', 'A', 'B', 'C'], rows: [['الفاصلة', '-3,5', '2,5', '6']] },
    statement: 'طريق مستقيم مدرّج بالكيلومتر، مبدؤه المحطة الرئيسية. المحطّات $A(-3{,}5)$ ، $B(+2{,}5)$ ، $C(+6)$ .',
    data: [
      { id: 'a', text: 'فواصل المحطات بالكيلومتر من المحطة الرئيسية', useful: true },
      { id: 'b', text: 'المسافة بين محطتين هي الفاصلة الكبرى ناقص الصغرى', useful: true },
      { id: 'c', text: 'تنطلق الحافلة الأولى عند السادسة صباحًا', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'المسافات',
        question: 'احسب المسافات $AB$ و $AC$ و $BC$ بالكيلومتر.',
        asks: ['AB', 'AC', 'BC'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qaidat-masafa'], prompt: 'المسافة $AB$ بالكيلومتر:', expected: 6,
            explain: '$(+2{,}5)-(-3{,}5)=(+2{,}5)+(+3{,}5)=6$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['qaidat-masafa'], prompt: 'المسافة $AC$ بالكيلومتر:', expected: 9.5,
            explain: '$(+6)-(-3{,}5)=9{,}5$ .' },
          { kind: 'numeric', role: 'answer', ask: 2, requires: ['qaidat-masafa'], prompt: 'المسافة $BC$ بالكيلومتر:', expected: 3.5,
            explain: '$(+6)-(+2{,}5)=3{,}5$ .' },
          { kind: 'solution', ask: 0, lines: ['$AB=2{,}5-(-3{,}5)=6$ ؛ $AC=6-(-3{,}5)=9{,}5$ ؛ $BC=6-2{,}5=3{,}5$ .', 'تحقّق: $6+3{,}5=9{,}5$ لأنّ $B$ بين $A$ و $C$ .'] },
        ],
      },
      {
        label: '2)', title: 'كشك في المنتصف',
        question: 'يُبنى كشك في منتصف $[AC]$ . ما فاصلته؟',
        asks: ['فاصلة الكشك'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qaidat-masafa'], prompt: 'فاصلة الكشك بالكيلومتر:', expected: 1.25,
            explain: 'نصف $AC$ هو $9{,}5\\div 2=4{,}75$ ، فاصلة الكشك $-3{,}5+4{,}75=1{,}25$ .' },
          { kind: 'solution', ask: 0, lines: ['الكشك يبعد عن كلّ طرف نصف المسافة $AC$ أي $4{,}75$ .', 'فاصلته الصغرى زائد النصف: $-3{,}5+4{,}75=1{,}25$ .'] },
        ],
      },
      {
        label: '3)', title: 'أقرب محطة',
        question: 'أيّ المحطّات أقرب إلى الكشك؟',
        asks: ['المحطة'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qaidat-masafa'], prompt: 'المحطة الأقرب إلى الكشك:', options: ['$B$', '$A$', '$C$'], correct: 0, cols: 3,
            explain: '$B$ تبعد $1{,}25$ ، بينما $A$ و $C$ تبعدان $4{,}75$ .' },
          { kind: 'solution', ask: 0, lines: ['$1{,}25-(-3{,}5)=4{,}75$ للمحطة $A$ ؛ $6-1{,}25=4{,}75$ للمحطة $C$ ؛ $2{,}5-1{,}25=1{,}25$ للمحطة $B$ .', 'أصغر مسافة: $B$ .'] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — ارتفاعات البرج',
    context: 'أدوار برج',
    emoji: '🏢',
    tone: 'emerald',
    source: SOURCE,
    table: { caption: 'ارتفاع كلّ مستوى بالمتر بالنسبة إلى الطابق الأرضي', head: ['المستوى', 'المرأب', 'الأرضي', 'الثالث', 'السطح'], rows: [['الارتفاع', '-7,5', '0', '9', '24']] },
    statement: 'في برج: المرأب تحت الأرض على الارتفاع $-7{,}5\\,\\mathrm{m}$ ، والطابق الأرضي $0$ ، والطابق الثالث $+9\\,\\mathrm{m}$ ، والسطح $+24\\,\\mathrm{m}$ .',
    data: [
      { id: 'a', text: 'الارتفاعات بالنسبة إلى الطابق الأرضي', useful: true },
      { id: 'b', text: 'المسافة بين مستويين هي الارتفاع الأكبر ناقص الأصغر', useful: true },
      { id: 'c', text: 'بُني البرج قبل عشر سنوات', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'من المرأب إلى السطح',
        question: 'ما المسافة العمودية من المرأب إلى السطح بالمتر؟',
        asks: ['المسافة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qaidat-masafa'], prompt: 'المسافة من المرأب إلى السطح بالمتر:', expected: 31.5,
            explain: '$24-(-7{,}5)=24+7{,}5=31{,}5$ .' },
          { kind: 'solution', ask: 0, lines: ['السطح أعلى من المرأب: الأكبر $24$ والأصغر $-7{,}5$ .', '$24-(-7{,}5)=31{,}5$ متر.'] },
        ],
      },
      {
        label: '2)', title: 'من الطابق الثالث إلى المرأب',
        question: 'ما المسافة العمودية من الطابق الثالث إلى المرأب بالمتر؟',
        asks: ['المسافة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qaidat-masafa'], prompt: 'المسافة من الطابق الثالث إلى المرأب بالمتر:', expected: 16.5,
            explain: '$9-(-7{,}5)=9+7{,}5=16{,}5$ .' },
          { kind: 'solution', ask: 0, lines: ['الأكبر $9$ والأصغر $-7{,}5$ .', '$9-(-7{,}5)=16{,}5$ متر.'] },
        ],
      },
      {
        label: '3)', title: 'الذهاب والإياب',
        question: 'هل المسافة من السطح إلى المرأب هي نفسها من المرأب إلى السطح؟',
        asks: ['الحكم'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['masafa-mujaba'], prompt: 'المسافتان:', options: ['متساويتان', 'متعاكستان', 'الأولى أكبر'], correct: 0, cols: 3,
            explain: 'المسافة بين نقطتين لا تتغيّر بتبديل النقطتين: $AB=BA$ .' },
          { kind: 'solution', ask: 0, lines: ['من السطح إلى المرأب نقطع $31{,}5\\,\\mathrm{m}$ ومن المرأب إلى السطح $31{,}5\\,\\mathrm{m}$ .', 'المسافة موجبة ولا تتعلّق بجهة الذهاب.'] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
