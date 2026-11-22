/**
 * Les trois « مسائل » du درس « التعليم على مستقيم مدرّج » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas (GuidedProblem). La مسألة 1 est
 * `LESSON_CONFIG.lessonProblem` (la route d'un village : quatre lieux, le plus loin de la station n'a pas la plus grande abscisse, le symétrique) ; la 2 redessine
 * « الفسيفساء الزمنية » du manuel (`deep-2` : choisir l'échelle d'une droite graduée) avec ses propres valeurs : une frise de l'histoire d'une école sur une feuille de 24 cm ;
 * la 3 un mètre de couturière dont le zéro est effacé (retrouver l'origine). Chaque nombre est vérifié dans ./problems.test.js en arithmétique EXACTE.
 */
import { addition, src } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const ROWS = (pairs) => pairs.map(([label, right, wrong, correction]) => ({ label, options: [right, ...wrong], correct: 0, correction }));

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — طريق القرية',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🚌',
    tone: 'indigo',
    source: addition('exam_style_problem'),
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'المبدأ: محطّة الحافلة O ، الاتجاه شرقًا، الوحدة 1 km', useful: true },
      { id: 'd2', text: 'المدرسة S : 3 km شرق المحطّة', useful: true },
      { id: 'd3', text: 'المسجد M : 3,5 km غرب المحطّة', useful: true },
      { id: 'd4', text: 'المخبزة B : 1,5 km غرب المحطّة', useful: true },
      { id: 'd5', text: 'المستوصف C : 2 km شرق المحطّة', useful: true },
      { id: 'flour', text: 'تشتري المخبزة 12 كيسًا من الدقيق كلّ أسبوع', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الفواصل',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['فواصل الأماكن الأربعة', 'بعد المسجد عن المحطّة'],
        steps: [
          { kind: 'sort' },
          { kind: 'batch', role: 'answer', ask: 0, requires: ['fasila-nuqta'],
            prompt: 'فاصلة كلّ مكان:',
            rows: ROWS([
              ['المدرسة $S$', '$3$', ['$-3$', '$2$'], '3 km شرق المحطّة، أي في جهة الاتجاه: فاصلة موجبة بلا إشارة، $3$ .'],
              ['المسجد $M$', '$-3{,}5$', ['$3{,}5$', '$-3$'], '3,5 km غرب المحطّة، أي في الجهة المقابلة للاتجاه: $-3{,}5$ .'],
              ['المخبزة $B$', '$-1{,}5$', ['$1{,}5$', '$-2$'], '1,5 km غرب المحطّة: $-1{,}5$ .'],
              ['المستوصف $C$', '$2$', ['$-2$', '$4$'], '2 km شرق المحطّة: $2$ .'],
            ]) },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['fasila-nuqta'], prompt: 'بعد المسجد عن المحطّة بالكيلومتر:', expected: 3.5, display: '3,5',
            explain: 'البعد هو الفاصلة دون إشارتها: $3{,}5$ km ، ولا يكون سالبًا.' },
          { kind: 'solution', ask: 0, lines: [
            'في جهة الاتجاه (شرقًا) الفاصلة موجبة، وفي الجهة المقابلة (غربًا) سالبة، والبعد يعطي العدد: $S(3)$ ؛ $M(-3{,}5)$ ؛ $B(-1{,}5)$ ؛ $C(2)$ .',
            'بعد المسجد عن المحطّة $3{,}5$ km .',
          ] },
        ],
      },
      {
        label: '2)', title: 'الأبعد عن المحطّة',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['المكان الأبعد', 'الأبعد والفاصلة الأكبر'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['fasila-nuqta'],
            prompt: 'المكان الأبعد عن المحطّة:',
            options: ['المسجد $M$', 'المدرسة $S$', 'لهما البعد نفسه'], correct: 0, cols: 3,
            explain: 'بعد المسجد $3{,}5$ km وبعد المدرسة $3$ km : المسجد أبعد.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['fasila-nuqta'],
            prompt: 'هل الأبعد عن المحطّة هو صاحب أكبر فاصلة؟',
            options: ['لا: المدرسة لها الفاصلة الأكبر لكنّ المسجد أبعد', 'نعم: الأبعد هو الأكبر فاصلة', 'لا يمكن الحكم'],
            correct: 0, cols: 1,
            explain: 'الفاصلة الأكبر هي $3$ (المدرسة)، لكنّ البعد يُقاس دون إشارة: $3{,}5>3$ ، فالمسجد أبعد.' },
          { kind: 'solution', ask: 0, lines: [
            'نقارن الأبعاد: $3{,}5>3$ ، فالمسجد $M$ أبعد عن المحطّة من المدرسة $S$ .',
            'الفاصلة الأكبر هي $3$ (المدرسة): البعد عن المبدإ يُقاس دون الإشارة، فلا يتبع ترتيب الفواصل.',
          ] },
        ],
      },
      {
        label: '3)', title: 'المخبزة ونظيرها',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['العلامتان اللتان تحصران المخبزة', 'فاصلة النظيرة'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['hasr-fasila'],
            prompt: 'المخبزة $B(-1{,}5)$ تقع بين العلامتين:',
            options: ['$-2$ و $-1$', '$-1$ و $0$', '$1$ و $2$'], correct: 0, cols: 3,
            explain: 'نعدّ من المحطّة نحو الغرب: $-2<-1{,}5<-1$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['nuqtatan-mutanazirtan'], prompt: 'فاصلة النقطة النظيرة لـ $B$ بالنسبة إلى المحطّة:', expected: 1.5, display: '1,5',
            explain: 'النظيرة على الجهة الأخرى بالبعد نفسه $1{,}5$ : فاصلتها $1{,}5$ ، عكس $-1{,}5$ .' },
          { kind: 'solution', ask: 0, lines: [
            'بعد المخبزة عن المحطّة $1{,}5$ ، وهي غرب المحطّة: $-2<-1{,}5<-1$ .',
            'النظيرة بالنسبة إلى $O$ على الجهة الأخرى بالبعد نفسه: فاصلتها $1{,}5$ ، والعددان $-1{,}5$ و $1{,}5$ متعاكسان.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — شريط الزمن',
    context: 'مدرسة الحيّ',
    emoji: '📜',
    tone: 'emerald',
    source: src('deep-2', 74, 'أتعمّق', 2),
    illustration: { kind: 'tags', cards: [
      { title: 'ورقة الشريط', icon: 'house', lines: [{ label: 'العرض', value: '24', unit: 'cm' }, { label: 'المبدأ', value: 'سنة التأسيس', unit: '' }] },
      { title: 'قبل التأسيس', icon: 'house', lines: [{ label: 'حدثان', value: '80 و 30', unit: 'سنة قبله' }] },
      { title: 'بعد التأسيس', icon: 'house', lines: [{ label: 'حدثان', value: '50 و 120', unit: 'سنة بعده' }] },
    ], ariaLabel: 'ورقة عرضها 24 سنتيمترًا، المبدأ سنة تأسيس المدرسة، حدثان قبلها بثمانين وثلاثين سنة وحدثان بعدها بخمسين ومئة وعشرين سنة' },
    statement: 'يرسم تلميذ شريطًا زمنيًّا لتاريخ مدرسة حيّه على ورقة عرضها 24 cm . المبدأ هو سنة تأسيس المدرسة، والاتجاه نحو السنوات اللاحقة؛ فما قبل التأسيس عدد سالب وما بعده عدد موجب. يريد أن يعلّم أربع سنوات: 80 سنة قبل التأسيس، و 30 سنة قبله، و 50 سنة بعده، و 120 سنة بعده، وأن يكون الرسم أكبر ما يمكن على الورقة. أحضر معه 3 أقلام ملوّنة.',
    data: [
      { id: 't1', text: 'عرض الورقة: 24 cm', useful: true },
      { id: 't2', text: 'السنوات: 80 و 30 قبل التأسيس، و 50 و 120 بعده', useful: true },
      { id: 't3', text: 'أكبر رسم ممكن على الورقة', useful: true },
      { id: 'pens', text: 'أحضر 3 أقلام ملوّنة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'اختيار الوحدة',
        question: 'اختر الوحدة التي يمثّلها 1 cm على الشريط لتتّسع السنوات الأربع على الورقة بأكبر رسم ممكن.',
        asks: ['الوحدة المناسبة', 'الجهة الغربية عندها'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tadrij-jihatayn'],
            prompt: 'كلّ 1 cm على الشريط يمثّل:',
            options: ['10 سنوات', '5 سنوات', '20 سنة'], correct: 0, cols: 3,
            explain: 'بوحدة 10 سنوات تقع $-80$ على 8 cm غرب المبدإ و $120$ على 12 cm شرقه: المجموع $20$ cm فتتّسع الورقة. وبوحدة 5 سنوات يلزم $16+24=40$ cm فلا تتّسع، وبوحدة 20 سنة يتّسع الرسم لكنّه أصغر.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['tadrij-jihatayn'], prompt: 'الجهة الغربية (السنة $-80$ ) تمتدّ على بعد كم سنتيمترًا من المبدإ؟', expected: 8, display: '8',
            explain: '$80\\div 10=8$ : ثماني وحدات، أي 8 cm غرب المبدإ.' },
          { kind: 'solution', ask: 0, lines: [
            'أبعد سنة في الغرب $80$ وأبعد سنة في الشرق $120$ : مع وحدة 10 سنوات تحتاج $8+12=20$ cm .',
            'العرض 24 cm يكفي، ووحدة 5 سنوات تحتاج $16+24=40$ cm فلا تكفي: الوحدة 10 سنوات هي الأصغر التي تتّسع، فالرسم الأكبر.',
          ] },
        ],
      },
      {
        label: '2)', title: 'المواضع',
        question: 'احسب بعد كلّ سنة عن المبدإ بالسنتيمتر.',
        asks: ['أبعاد السنوات الأربع'],
        steps: [
          { kind: 'batch', role: 'answer', ask: 0, requires: ['fasila-nuqta'],
            prompt: 'بعد السنة عن المبدإ:',
            rows: ROWS([
              ['السنة $-80$', '8 cm', ['-8 cm', '80 cm'], 'نقسم $80$ على $10$ : $8$ cm ، ولا يكون البعد سالبًا.'],
              ['السنة $-30$', '3 cm', ['30 cm', '-3 cm'], '$30\\div 10=3$ : 3 cm على يسار المبدإ.'],
              ['السنة $50$', '5 cm', ['50 cm', '15 cm'], '$50\\div 10=5$ : 5 cm على يمين المبدإ.'],
              ['السنة $120$', '12 cm', ['120 cm', '2 cm'], '$120\\div 10=12$ : 12 cm على يمين المبدإ.'],
            ]) },
          { kind: 'solution', ask: 0, lines: [
            'كلّ 10 سنوات تقابل 1 cm : نقسم الفاصلة دون إشارتها على $10$ .',
            'الأبعاد: $8$ cm ؛ $3$ cm ؛ $5$ cm ؛ $12$ cm ، وتعيّن الإشارة الجهة: الأولى والثانية على يسار المبدإ.',
          ] },
        ],
      },
      {
        label: '3)', title: 'نظير سنة',
        question: 'نقطة السنة $50$ نظيرتها $N$ بالنسبة إلى المبدإ. اكتب فاصلة $N$ .',
        asks: ['فاصلة النظيرة', 'جهتها'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['nuqtatan-mutanazirtan'], prompt: 'فاصلة النقطة $N$ :', expected: -50, display: '-50',
            explain: 'النظيرة على الجهة الأخرى بالبعد نفسه: فاصلتها $-50$ ، وهي معاكس $50$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['nuqtatan-mutanazirtan'],
            prompt: 'تقع النقطة $N$ :',
            options: ['على يسار المبدإ على بعد 5 cm', 'على يمين المبدإ على بعد 5 cm', 'على يسار المبدإ على بعد 50 cm'], correct: 0, cols: 1,
            explain: 'فاصلتها سالبة فهي على يسار المبدإ، وبعدها $50\\div 10=5$ cm .' },
          { kind: 'solution', ask: 0, lines: [
            'نظيرة النقطة بالنسبة إلى $O$ فاصلتها العدد المعاكس: $-50$ .',
            'بعدها عن المبدإ مثل بعد السنة $50$ : 5 cm ، لكن على يسار المبدإ.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — شريط الخيّاطة',
    context: 'ورشة خياطة',
    emoji: '🧵',
    tone: 'violet',
    source: addition('exam_style_problem'),
    illustration: { kind: 'tags', cards: [
      { title: 'العلامتان المكتوبتان', icon: 'house', lines: [{ label: 'الأولى', value: '-6', unit: '' }, { label: 'الثانية', value: '-2', unit: '' }] },
      { title: 'التباعدات', icon: 'house', lines: [{ label: 'بين العلامتين', value: '4', unit: 'تباعدات' }, { label: 'الدبوس', value: '3', unit: 'تباعدات بعد الصفر' }] },
    ], ariaLabel: 'شريط قياس لم يبق عليه مكتوبًا إلا العددان سالب ستّة وسالب اثنين، بينهما أربع تباعدات، ودبوس بعد الصفر بثلاثة تباعدات' },
    statement: 'في ورشة خياطة شريط قياس مدرّج بتباعدات متساوية، تآكل جزؤه الأوسط فلم تبق مكتوبة عليه إلا العلامتان $-6$ و $-2$ ، وبينهما 4 تباعدات متساوية. تضع الخيّاطة دبوسًا على علامة تبعد عن الصفر بـ 3 تباعدات في جهة الأعداد الموجبة. اشترت الورشة 5 بكرات خيط.',
    data: [
      { id: 'm1', text: 'العلامتان المكتوبتان: العدد السالب 6 والعدد السالب 2', useful: true },
      { id: 'm2', text: 'بينهما 4 تباعدات متساوية', useful: true },
      { id: 'm3', text: 'الدبوس: ثلاثة تباعدات بعد الصفر في جهة الأعداد الموجبة', useful: true },
      { id: 'thread', text: 'اشترت الورشة 5 بكرات خيط', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'قيمة التباعد',
        question: 'أوجد قيمة التباعد الواحد، ثمّ عدد التباعدات بين العلامة $-2$ والصفر.',
        asks: ['قيمة التباعد الواحد', 'التباعدات بين $-2$ والصفر'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['mustaqim-mudarraj'], prompt: 'قيمة التباعد الواحد:', expected: 1, display: '1',
            explain: 'بين $-6$ و $-2$ أربع وحدات موزّعة على أربع تباعدات: $4\\div 4=1$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['mustaqim-mudarraj'], prompt: 'عدد التباعدات بين العلامة $-2$ والصفر:', expected: 2, display: '2',
            explain: 'كلّ تباعد يمثّل $1$ ، والصفر يبعد عن $-2$ باثنين: $2\\div 1=2$ تباعدين نحو اليمين.' },
          { kind: 'solution', ask: 0, lines: [
            'أربع تباعدات تفصل $-6$ عن $-2$ والفرق بينهما $4$ : كلّ تباعد يمثّل $1$ .',
            'الصفر على بعد تباعدين على يمين $-2$ (الأعداد تكبر نحو اليمين).',
          ] },
        ],
      },
      {
        label: '2)', title: 'الدبوس',
        question: 'أوجد فاصلة العلامة التي عليها الدبوس.',
        asks: ['فاصلة الدبوس', 'جهة الدبوس'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['fasila-nuqta'], prompt: 'فاصلة علامة الدبوس:', expected: 3, display: '3',
            explain: 'ثلاثة تباعدات بعد الصفر، وكلّ تباعد $1$ ، في جهة الأعداد الموجبة: $3$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['tadrij-jihatayn'],
            prompt: 'الدبوس يقع بالنسبة إلى العلامتين المكتوبتين:',
            options: ['على يمين العلامتين معًا', 'بينهما', 'على يسارهما معًا'], correct: 0, cols: 3,
            explain: 'فاصلته $3$ أكبر من $-2$ ومن $-6$ ، فهو على يمين العلامتين معًا.' },
          { kind: 'solution', ask: 0, lines: [
            'الصفر عدّ تباعدين من $-2$ ؛ والدبوس ثلاثة تباعدات بعد الصفر في جهة الأعداد الموجبة: فاصلته $3$ .',
            'وهو أبعد نحو اليمين من العلامتين $-2$ و $-6$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'الأبعد عن الصفر',
        question: 'أيّ العلامتين المكتوبتين أبعد عن الصفر، وما فاصلة نظيرتها بالنسبة إلى الصفر؟',
        asks: ['العلامة الأبعد', 'فاصلة نظيرتها'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['fasila-nuqta'],
            prompt: 'العلامة الأبعد عن الصفر:',
            options: ['$-6$', '$-2$', 'لهما البعد نفسه'], correct: 0, cols: 3,
            explain: 'بعد $-6$ عن الصفر $6$ وبعد $-2$ عنه $2$ : الأبعد هي $-6$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['nuqtatan-mutanazirtan'], prompt: 'فاصلة نظيرة العلامة $-6$ :', expected: 6, display: '6',
            explain: 'النظيرة على الجهة الأخرى بالبعد نفسه: $6$ .' },
          { kind: 'solution', ask: 0, lines: [
            'البعد عن الصفر دون إشارة: $6>2$ ، فالعلامة $-6$ أبعد.',
            'نظيرتها على الجهة الأخرى بالبعد نفسه: فاصلتها $6$ .',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
