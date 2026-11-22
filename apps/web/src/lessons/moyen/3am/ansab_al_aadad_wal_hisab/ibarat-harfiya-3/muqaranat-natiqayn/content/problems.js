/**
 * Les trois « مسائل » du درس « مقارنة عددين ناطقين » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas (GuidedProblem). Ajouts de la plateforme
 * (`exam_style_problem`) : autres contextes et autres nombres que le manuel. La مسألة 1 (`LESSON_CONFIG.lessonProblem` : la مسابقة du collège, deux classes) calcule la différence de deux
 * fractions et décide (le jugement juste : une différence minuscule reste une différence) ; la 2 compare deux tarifs de bus en x (A − B = 300 − x, qui se lit) ; la 3 compare deux prix au litre
 * et décide si l'écart vaut le choix. Chaque nombre est vérifié dans ./problems.test.js par une arithmétique indépendante.
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — مسابقة القسمين',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🏅',
    tone: 'indigo',
    source: addition('exam_style_problem'),
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'القسم الأول: 25 إجابة صحيحة من 31 تلميذًا', useful: true },
      { id: 'd2', text: 'القسم الثاني: 29 إجابة صحيحة من 36 تلميذًا', useful: true },
      { id: 'd3', text: 'المسابقة في الرياضيات وسؤالها الأخير', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'النسبتان',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['نسبة كل قسم'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['maana-farq'], prompt: 'نسبة الإجابات الصحيحة في القسمين هي:',
            options: ['$\\frac{25}{31}$ و $\\frac{29}{36}$', '$\\frac{31}{25}$ و $\\frac{36}{29}$', '$\\frac{25}{29}$ و $\\frac{31}{36}$'], correct: 0,
            explain: 'النسبة هي عدد الإجابات الصحيحة على عدد التلاميذ: $\\frac{25}{31}$ للأول و $\\frac{29}{36}$ للثاني.' },
          { kind: 'solution', ask: 0, lines: [
            'نسبة القسم الأول: $\\frac{25}{31}$ ، ونسبة القسم الثاني: $\\frac{29}{36}$.',
            'نريد معرفة أيّ النسبتين أكبر.',
          ] },
        ],
      },
      {
        label: '2)', title: 'الفرق بين النسبتين',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['الفرق بين النسبتين'],
        steps: [
          { kind: 'numeric', role: 'compute', prompt: 'احسب البسط: $25\\times36$ :', expected: 900, explain: '$25\\times36=900$.' },
          { kind: 'numeric', role: 'compute', prompt: 'واحسب $29\\times31$ :', expected: 899, explain: '$29\\times31=899$.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['hisab-farq'], prompt: 'الفرق $\\frac{25}{31}-\\frac{29}{36}$ يساوي:',
            options: ['$\\frac1{1116}$', '$-\\frac1{1116}$', '$\\frac45$'], correct: 0,
            explain: '$\\frac{25\\times36-29\\times31}{31\\times36}=\\frac{900-899}{1116}=\\frac1{1116}$ ؛ أمّا $\\frac45$ فنجدها بطرح البسطين وطرح المقامين وهذا خطأ.' },
          { kind: 'solution', ask: 0, lines: [
            'نوحّد المقامين: المقام المشترك $31\\times36=1116$.',
            '$\\frac{25}{31}-\\frac{29}{36}=\\frac{900-899}{1116}=\\frac1{1116}$.',
          ] },
        ],
      },
      {
        label: '3)', title: 'أيّ القسمين أحسن نتيجة؟',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['القسم الأحسن'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['maana-farq'], prompt: 'القسم الأحسن نتيجة هو:',
            options: ['القسم الأول لأنّ الفرق $\\frac{25}{31}-\\frac{29}{36}$ موجب', 'القسم الثاني لأنّ عدد تلاميذه أكبر', 'القسمان متساويان لأنّ الفرق صغير جدًّا'], correct: 0,
            explain: 'الفرق $\\frac1{1116}$ موجب، إذن $\\frac{25}{31}>\\frac{29}{36}$ والقسم الأول أحسن.' },
          { kind: 'solution', ask: 0, lines: [
            'بما أنّ $\\frac{25}{31}-\\frac{29}{36}=\\frac1{1116}>0$ فإنّ $\\frac{25}{31}>\\frac{29}{36}$.',
            'القسم الأول هو الأحسن نتيجة، وإن كان الفرق صغيرًا.',
          ] },
        ],
      },
      {
        label: '4)', title: 'هل يكفي النظر؟',
        question: LESSON_CONFIG.lessonProblem.questions[3].text,
        asks: ['الحكم على النظر إلى الكسرين'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['farq-wahdahu'], prompt: 'ما ردّك على المعلّمة؟',
            options: ['لا: النسبتان $0{,}806\\ldots$ و $0{,}805\\ldots$ لا تتميّزان بالنظر، والفرق وحده يحسم', 'نعم: يكفي أن ننظر إلى الكسرين', 'نعم: النسبة الأكبر هي ذات البسط الأكبر'], correct: 0,
            explain: 'النسبتان تتطابقان في رقمين عشريين، فلا يظهر الفرق بالنظر؛ أمّا إشارة الفرق فتحسمه.' },
          { kind: 'solution', ask: 0, lines: [
            'النسبتان قريبتان جدًّا: $\\frac{25}{31}\\approx0{,}8065$ و $\\frac{29}{36}\\approx0{,}8056$.',
            'لا يكفي النظر ولا بسط الكسر؛ نحسب الفرق ونقرأ إشارته.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — حافلة الرحلة',
    context: 'رحلة مدرسية',
    emoji: '🚌',
    tone: 'emerald',
    source: addition('exam_style_problem'),
    illustration: { kind: 'tags', cards: [
      { title: 'الحافلة A', lines: [{ label: 'ثمن ثابت بالدينار', value: '1500' }, { label: 'ثمن الكيلومتر', value: '41' }] },
      { title: 'الحافلة B', lines: [{ label: 'ثمن ثابت بالدينار', value: '1200' }, { label: 'ثمن الكيلومتر', value: '42' }] },
    ], ariaLabel: 'حافلتان: الأولى 1500 دينار ثابتة و41 للكيلومتر، والثانية 1200 دينار ثابتة و42 للكيلومتر' },
    statement: 'تريد جمعية المتوسطة كراء حافلة لرحلة طولها $x$ كيلومتر. الحافلة A تطلب 1500 دج ثابتة و 41 دج لكل كيلومتر، والحافلة B تطلب 1200 دج ثابتة و 42 دج لكل كيلومتر.',
    data: [
      { id: 'b1', text: 'الحافلة A: 1500 دج ثابتة و 41 دج لكل كيلومتر', useful: true },
      { id: 'b2', text: 'الحافلة B: 1200 دج ثابتة و 42 دج لكل كيلومتر', useful: true },
      { id: 'b3', text: 'الرحلة مدرسية تنظّمها الجمعية', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'ثمن كل حافلة',
        question: 'عبّر بدلالة $x$ عن ثمن كل حافلة.',
        asks: ['ثمن كل حافلة بدلالة x'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['maana-farq'], prompt: 'ثمن الحافلتين بدلالة $x$ هو:',
            options: ['$A=1500+41x$ و $B=1200+42x$', '$A=41+1500x$ و $B=42+1200x$', '$A=1541x$ و $B=1242x$'], correct: 0,
            explain: 'ثمن = الثابت + (ثمن الكيلومتر × عدد الكيلومترات).' },
          { kind: 'solution', ask: 0, lines: [
            'الحافلة A: $A=1500+41x$.',
            'الحافلة B: $B=1200+42x$.',
          ] },
        ],
      },
      {
        label: '2)', title: 'الفرق بين الثمنين',
        question: 'بسّط $A-B$.',
        asks: ['العبارة A − B مبسّطة'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['farq-ibaratayn'], prompt: 'بعد التبسيط $A-B=$',
            options: ['$300-x$', '$2700+83x$', '$300+x$'], correct: 0,
            explain: '$1500+41x-(1200+42x)=1500+41x-1200-42x=300-x$ ؛ نغيّر إشارة كل حدّ داخل القوسين.' },
          { kind: 'solution', ask: 0, lines: [
            '$A-B=1500+41x-(1200+42x)$.',
            'نحذف القوسين مع تغيير الإشارات: $1500+41x-1200-42x=300-x$.',
          ] },
        ],
      },
      {
        label: '3)', title: 'رحلة طولها 220 كلم',
        question: 'احسب ثمن كل حافلة لرحلة طولها $220$ كلم.',
        asks: ['ثمن A', 'ثمن B'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hisab-farq'], prompt: 'ثمن الحافلة A بالدينار من أجل $x=220$ :', expected: 10520,
            explain: '$1500+41\\times220=1500+9020=10520$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hisab-farq'], prompt: 'ثمن الحافلة B من أجل $x=220$ :', expected: 10440,
            explain: '$1200+42\\times220=1200+9240=10440$.' },
          { kind: 'numeric', role: 'compute', prompt: 'كم دينارًا توفّر الحافلة الأرخص؟', expected: 80, explain: '$10520-10440=80$ ، وهو $300-220$ أيضًا.' },
          { kind: 'solution', ask: 0, lines: [
            'A: $1500+41\\times220=10520$ دج ؛ B: $1200+42\\times220=10440$ دج.',
            'الحافلة B أرخص بـ $80$ دج ، وهو ما تعطيه $A-B=300-220=80$.',
          ] },
        ],
      },
      {
        label: '4)', title: 'متى تصبح A أرخص؟',
        question: 'ابتداءً من أيّ مسافة تكون الحافلة A أرخص من الحافلة B ؟',
        asks: ['المسافة التي تصبح عندها A أرخص'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['farq-ibaratayn'], prompt: 'تكون A أرخص عندما:',
            options: ['$x>300$ ، فإشارة $A-B=300-x$ سالبة', '$x<300$ ، فإشارة $A-B$ سالبة', 'من أجل كل مسافة'], correct: 0,
            explain: '$A<B$ معناه $A-B<0$ أي $300-x<0$ ، وهو ما يحدث عندما $x>300$ ؛ ومن أجل $x=300$ يتساوى الثمنان ($13800$ دج).' },
          { kind: 'solution', ask: 0, lines: [
            'نقرأ إشارة $A-B=300-x$ : هي موجبة عندما $x<300$ ومعدومة عندما $x=300$ وسالبة عندما $x>300$.',
            'تكون A أرخص عندما $x>300$ كلم ؛ وعند $300$ كلم يدفعان $13800$ دج معًا.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — قنّينتا العصير',
    context: 'شراء بعناية',
    emoji: '🧃',
    tone: 'amber',
    source: addition('exam_style_problem'),
    illustration: { kind: 'tags', cards: [
      { title: 'القنّينة الصغرى', lines: [{ label: 'السعة باللتر', value: '1,5' }, { label: 'الثمن بالدينار', value: '97,50' }] },
      { title: 'القنّينة الكبرى', lines: [{ label: 'السعة باللتر', value: '2,25' }, { label: 'الثمن بالدينار', value: '146,40' }] },
    ], ariaLabel: 'قنينتا عصير: 1,5 لتر بـ 97,50 دينارًا و 2,25 لتر بـ 146,40 دينارًا' },
    statement: 'في المقصف قنّينتا عصير: قنّينة سعتها 1,5 لتر بـ 97,50 دج ، وقنّينة سعتها 2,25 لتر بـ 146,40 دج. يريد سليم أن يشتري بعناية.',
    data: [
      { id: 'c1', text: 'قنّينة 1,5 لتر بـ 97,50 دج', useful: true },
      { id: 'c2', text: 'قنّينة 2,25 لتر بـ 146,40 دج', useful: true },
      { id: 'c3', text: 'يشتري سليم من المقصف', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'ثمن اللتر',
        question: 'احسب ثمن اللتر الواحد في كل قنّينة.',
        asks: ['ثمن اللتر في الصغرى', 'ثمن اللتر في الكبرى'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['maana-farq'], prompt: 'ثمن اللتر في القنّينة الصغرى بالدينار:', expected: 65, explain: '$97{,}50\\div1{,}5=65$.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['maana-farq'], prompt: 'ثمن اللتر في القنّينة الكبرى هو:',
            options: ['$\\frac{976}{15}$ دج أي $65{,}0666\\ldots$ دج', '$64{,}9$ دج', '$65$ دج'], correct: 0,
            explain: '$146{,}40\\div2{,}25=\\frac{14640}{225}=\\frac{976}{15}=65{,}0666\\ldots$ ؛ لا يظهر الفرق إلّا في الرقم الثاني بعد الفاصلة.' },
          { kind: 'solution', ask: 0, lines: [
            'القنّينة الصغرى: $97{,}50\\div1{,}5=65$ دج للتر.',
            'القنّينة الكبرى: $146{,}40\\div2{,}25=\\frac{976}{15}\\approx65{,}07$ دج للتر.',
          ] },
        ],
      },
      {
        label: '2)', title: 'الفرق بين السعرين',
        question: 'احسب الفرق بين ثمني اللتر (الصغرى ناقص الكبرى).',
        asks: ['الفرق بين ثمني اللتر'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['hisab-farq'], prompt: 'الفرق $65-\\frac{976}{15}$ يساوي:',
            options: ['$-\\frac1{15}$', '$\\frac1{15}$', '$-\\frac{1}{150}$'], correct: 0,
            explain: '$65=\\frac{975}{15}$ ، فالفرق $\\frac{975-976}{15}=-\\frac1{15}$.' },
          { kind: 'solution', ask: 0, lines: [
            'نكتب $65=\\frac{975}{15}$ فنوحّد المقامين.',
            '$65-\\frac{976}{15}=\\frac{975-976}{15}=-\\frac1{15}$ دج للتر.',
          ] },
        ],
      },
      {
        label: '3)', title: 'أيّ القنّينتين أرخص للتر؟',
        question: 'أيّ القنّينتين أرخص للتر؟',
        asks: ['القنّينة الأرخص'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['maana-farq'], prompt: 'القنّينة الأرخص للتر هي:',
            options: ['الصغرى، لأنّ الفرق (الصغرى ناقص الكبرى) سالب', 'الكبرى، لأنّ سعتها أكبر', 'متساويتان'], correct: 0,
            explain: 'الفرق $-\\frac1{15}<0$ ، فثمن اللتر في الصغرى أصغر.' },
          { kind: 'solution', ask: 0, lines: [
            'بما أنّ $65-\\frac{976}{15}=-\\frac1{15}<0$ فإنّ $65<\\frac{976}{15}$.',
            'ثمن اللتر في القنّينة الصغرى أصغر، فهي الأرخص للتر.',
          ] },
        ],
      },
      {
        label: '4)', title: 'هل يستحقّ الفرق؟',
        question: 'كم يوفّر سليم عند شراء $9$ لترات من الأرخص؟ وهل يستحقّ ذلك عناء الاختيار؟',
        asks: ['ما يوفّره عند شراء 9 لترات', 'الحكم على الاختيار'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hisab-farq'], prompt: 'ما يوفّره بالدينار عند شراء $9$ لترات:', expected: 0.6, display: '0,6',
            explain: '$9\\times\\frac1{15}=\\frac{9}{15}=0{,}6$ دج.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['farq-wahdahu'], prompt: 'القرار المعقول:',
            options: ['التوفير $0{,}6$ دج فقط: نختار القنّينة التي تناسب حاجتنا', 'نختار الكبرى دائمًا لأنّها أكبر', 'الفرق سالب فلا يهمّ'], correct: 0,
            explain: 'الفرق موجود لكنّه ضئيل (أقلّ من دينار لتسعة لترات)، فالحجم المناسب يغلب.' },
          { kind: 'solution', ask: 0, lines: [
            'عند شراء $9$ لترات: $9\\times\\frac1{15}=0{,}6$ دج توفير.',
            'الفرق حقيقي (إشارته تحسم الأرخص) لكنّه صغير؛ يمكن أن نفضّل الحجم المناسب لحاجتنا.',
          ] },
        ],
      },
    ],
  },
];
export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
