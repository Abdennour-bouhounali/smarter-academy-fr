/**
 * Les trois « مسائل » du درس « تعليم نقطة في المستوي » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas (GuidedProblem). La مسألة 1 est le
 * terrain du quartier (un rectangle complété à partir de trois sommets) — `LESSON_CONFIG.lessonProblem` ; la 2 la carte d'un quartier dont on déplace le repère ; la 3 les
 * températures de quatre jours placées en points. Chaque مسألة porte son support dessiné (figures.js). Chaque nombre est vérifié dans ./problems.test.js en arithmétique EXACTE.
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';
import { FIGURES } from './figures.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — ملعب الحيّ',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🏟️',
    tone: 'sky',
    source: SOURCE,
    table: LESSON_CONFIG.lessonProblem.table,
    figure: LESSON_CONFIG.lessonProblem.figure,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'المعلم متعامد ومتجانس ووحدته $5\\,\\mathrm{m}$', useful: true },
      { id: 'd2', text: 'الرؤوس: $A(-4\\,;3)$ ، $B(5\\,;3)$ ، $C(5\\,;-2)$', useful: true },
      { id: 'd3', text: 'يُدهَن الملعب في عطلة الصيف', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الرأس الرابع',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['فاصلة $D$', 'ترتيب $D$'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ihdathiyan-nuqta'], prompt: 'فاصلة الرأس $D$ :', expected: -4,
            explain: '$D$ تحت $A$ مباشرةً: لها فاصلة $A$ نفسها، $-4$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['ihdathiyan-nuqta'], prompt: 'ترتيب الرأس $D$ :', expected: -2,
            explain: '$D$ على الأفقي نفسه مع $C$ : لها ترتيب $C$ نفسه، $-2$ .' },
          { kind: 'solution', ask: 0, lines: [
            'في المستطيل $ABCD$ ضلعان متقابلان متوازيان.',
            '$D$ لها فاصلة $A$ وترتيب $C$ : $D(-4\\,;-2)$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'طول الملعب وعرضه',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['الطول بالمتر', 'العرض بالمتر'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ihdathiyan-nuqta'], prompt: 'طول الملعب $AB$ بالمتر:', expected: 45,
            explain: 'نعدّ $9$ وحدات بين فاصلتين $-4$ و $5$ ، كلّ وحدة $5\\,\\mathrm{m}$ : $45\\,\\mathrm{m}$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['ihdathiyan-nuqta'], prompt: 'عرض الملعب $BC$ بالمتر:', expected: 25,
            explain: 'نعدّ $5$ وحدات بين الترتيبين $3$ و $-2$ : $5\\times 5=25\\,\\mathrm{m}$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$AB$ أفقي: من الفاصلة $-4$ إلى $5$ نعدّ $9$ وحدات، أي $9\\times 5=45\\,\\mathrm{m}$ .',
            '$BC$ عمودي: من الترتيب $3$ إلى $-2$ نعدّ $5$ وحدات، أي $5\\times 5=25\\,\\mathrm{m}$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'نقطة الجزاء',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['منطقة $P$'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['manatiq'], prompt: 'تقع $P(3{,}5\\,;0{,}5)$ :',
            options: ['فوق محور الفواصل وعلى يمين محور التراتيب', 'فوق محور الفواصل وعلى يسار محور التراتيب', 'تحت محور الفواصل وعلى يمين محور التراتيب'], correct: 0, cols: 1,
            explain: 'الفاصلة $3{,}5$ موجبة والترتيب $0{,}5$ موجب: فوق المحور الأفقي وعلى يمين العمودي.' },
          { kind: 'solution', ask: 0, lines: ['$3{,}5>0$ فهي على يمين محور التراتيب.', '$0{,}5>0$ فهي فوق محور الفواصل.'] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — خريطة الحيّ',
    context: 'خريطة في معلم',
    emoji: '🗺️',
    tone: 'teal',
    source: SOURCE,
    figure: FIGURES.map,
    statement: 'نمثّل حيّنا في معلم متعامد ومتجانس مبدؤه المتوسطة $O$ . المكتبة $L(3\\,;-2)$ ، المخبزة $B(-2\\,;4)$ ، الصيدلية $P(-3\\,;0)$ ، البريد $Q(0\\,;2{,}5)$ .',
    data: [
      { id: 'a', text: 'المبدأ $O$ هو المتوسطة', useful: true },
      { id: 'b', text: 'مواضع المكتبة والمخبزة والصيدلية والبريد', useful: true },
      { id: 'c', text: 'المخبزة تفتح قبل الفجر', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'المعالم على المحورين',
        question: 'أيّ المعلمين يقعان على أحد المحورين؟',
        asks: ['المعلمان'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['mihwarayn'], prompt: 'المعلمان اللذان يقعان على محورين:', options: ['الصيدلية والبريد', 'المكتبة والمخبزة', 'المخبزة والبريد'], correct: 0, cols: 1,
            explain: 'الصيدلية $P(-3\\,;0)$ ترتيبها $0$ فهي على محور الفواصل، والبريد $Q(0\\,;2{,}5)$ فاصلته $0$ فهو على محور التراتيب.' },
          { kind: 'solution', ask: 0, lines: ['ما كان ترتيبه $0$ فهو على محور الفواصل: الصيدلية.', 'وما كانت فاصلته $0$ فهو على محور التراتيب: البريد.'] },
        ],
      },
      {
        label: '2)', title: 'مكان مماثل',
        question: 'ما إحداثيا نظيرة المكتبة $L$ بالنسبة إلى محور الفواصل؟',
        asks: ['فاصلة النظيرة', 'ترتيب النظيرة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['nadhira-mihwar'], prompt: 'فاصلة النظيرة:', expected: 3,
            explain: 'النظيرة بالنسبة إلى محور الفواصل تحتفظ بالفاصلة: $3$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['nadhira-mihwar'], prompt: 'ترتيب النظيرة:', expected: 2,
            explain: 'ترتيبها معاكس لترتيب $L$ : معاكس $-2$ هو $2$ .' },
          { kind: 'solution', ask: 0, lines: ['نظيرة نقطة بالنسبة إلى محور الفواصل تحتفظ بفاصلتها وتعاكس ترتيبها.', '$L(3\\,;-2)$ ، نظيرتها $(3\\,;2)$ .'] },
        ],
      },
      {
        label: '3)', title: 'تغيير المبدأ',
        question: 'نقلنا الخريطة فصار المبدأ عند المخبزة $B$ والمعلم متعامد ومتجانس بالوحدة نفسها. ما إحداثيا المتوسطة $O$ في المعلم الجديد؟',
        asks: ['فاصلة $O$', 'ترتيب $O$'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ihdathiyat-mabda'], prompt: 'فاصلة المتوسطة في المعلم الجديد:', expected: 2,
            explain: 'المتوسطة على بعد $2$ يمين المخبزة: $0-(-2)=2$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['ihdathiyat-mabda'], prompt: 'ترتيب المتوسطة في المعلم الجديد:', expected: -4,
            explain: 'المتوسطة على بعد $4$ تحت المخبزة: $0-4=-4$ .' },
          { kind: 'solution', ask: 0, lines: ['إحداثيات نقطة تتعلّق بالمبدأ.', 'المتوسطة $O$ تبعد عن $B(-2\\,;4)$ بـ $2$ يمينًا و $4$ تحتًا: $O(2\\,;-4)$ .'] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — حرارة الأسبوع',
    context: 'درجات الحرارة',
    emoji: '🌡️',
    tone: 'emerald',
    source: SOURCE,
    figure: FIGURES.temps,
    table: { caption: 'درجة حرارة الصباح خلال أربعة أيام (°C)', head: ['اليوم', '1', '2', '3', '4'], rows: [['الدرجة', '-2', '1,5', '-0,5', '3']] },
    statement: 'سجّلنا درجة الحرارة الصباحية بالدرجة المئوية أربعة أيام: اليوم 1: $-2$ ، اليوم 2: $1{,}5$ ، اليوم 3: $-0{,}5$ ، اليوم 4: $3$ . نمثّل كلّ يوم بنقطة (رقم اليوم ; الدرجة) في معلم متعامد.',
    data: [
      { id: 'a', text: 'النقطة هي (رقم اليوم ; الدرجة)', useful: true },
      { id: 'b', text: 'الدرجات: $-2$ ، $1{,}5$ ، $-0{,}5$ ، $3$', useful: true },
      { id: 'c', text: 'جُمعت القياسات عند الثامنة صباحًا', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'إحداثيات النقط',
        question: 'اكتب إحداثيي نقطة اليوم 3.',
        asks: ['الترتيب'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ihdathiyan-nuqta'], prompt: 'ترتيب نقطة اليوم 3 :', expected: -0.5,
            explain: 'النقطة $(3\\,;-0{,}5)$ : فاصلتها رقم اليوم $3$ ، وترتيبها الدرجة $-0{,}5$ .' },
          { kind: 'solution', ask: 0, lines: ['فاصلة كلّ نقطة هي رقم اليوم وترتيبها درجة حرارته.', 'النقط الأربع: $(1\\,;-2)$ ، $(2\\,;1{,}5)$ ، $(3\\,;-0{,}5)$ ، $(4\\,;3)$ .'] },
        ],
      },
      {
        label: '2)', title: 'تحت محور الفواصل',
        question: 'أيّ النقط تقع تحت محور الفواصل؟',
        asks: ['الأيام'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['manatiq'], prompt: 'النقط التي تحت محور الفواصل:', options: ['اليومان 1 و 3', 'اليومان 2 و 4', 'اليوم 4 وحده'], correct: 0, cols: 1,
            explain: 'ترتيباها $-2$ و $-0{,}5$ سالبان: درجة الحرارة تحت الصفر.' },
          { kind: 'solution', ask: 0, lines: ['النقطة تحت محور الفواصل إذا كان ترتيبها سالبًا.', 'اليومان 1 و 3: درجتهما سالبة، أي تحت الصفر.'] },
        ],
      },
      {
        label: '3)', title: 'اختيار الوحدة',
        question: 'عندنا $6\\,\\mathrm{cm}$ فوق محور الفواصل. أيّ وحدة نختار على المحور العمودي لتكون أعلى نقطة داخل $6\\,\\mathrm{cm}$ ومكبَّرة ما أمكن؟',
        asks: ['الوحدة'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['maalam-mutajanis'], prompt: 'الوحدة المناسبة على المحور العمودي:',
            options: ['$1\\,\\mathrm{cm}$ لكل $0{,}25$ درجة', '$1\\,\\mathrm{cm}$ لكل $0{,}5$ درجة', '$1\\,\\mathrm{cm}$ لكل درجة'], correct: 1, cols: 1,
            explain: 'أعلى درجة $3$ : مع $0{,}5$ تبعد $3\\div 0{,}5=6\\,\\mathrm{cm}$ فهي تملأ المساحة؛ مع $0{,}25$ تبعد $12\\,\\mathrm{cm}$ فتخرج؛ ومع درجة لكل سنتيمتر تبعد $3\\,\\mathrm{cm}$ فقط، وهي أقلّ تكبيرًا.' },
          { kind: 'solution', ask: 0, lines: ['أعلى نقطة ترتيبها $3$ ويجب أن تبقى داخل $6\\,\\mathrm{cm}$ .', 'نريد أصغر عدد درجات لكل سنتيمتر يُبقي $3$ داخل $6\\,\\mathrm{cm}$ : $3\\div 6=0{,}5$ .'] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
