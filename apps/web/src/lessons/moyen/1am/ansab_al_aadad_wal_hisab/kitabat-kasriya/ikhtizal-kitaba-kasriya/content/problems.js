/**
 * Les trois « مسائل » du درس « الكتابات الكسرية لحاصل قسمة واختزال كسر » (modules 6, 7, 8) — exercices COMPLETS de type
 * اختبار الفصل, résolus pas à pas (GuidedProblem). La مسألة 1 (`LESSON_CONFIG.lessonProblem`, ajout de la plateforme,
 * « على منوال » 1am-s2-72 ex 5 : deux parts d'un même montant) prolonge le grand-père du نشاط 4 ; la 2 est أتعمّق 1 (p. 60,
 * les deux triangles dans un carré 4 × 4) ; la 3 est أتعمّق 8 (p. 60, A = 5Δ2□) prolongée par une réduction. Chaque nombre
 * est vérifié dans ./problems.test.js (fractions exactes).
 */
import { src, addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — هديّة الجدّ',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🎁',
    tone: 'indigo',
    source: addition('exam_style_problem'),
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'amine', text: 'يأخذ أمين 18/30 من المبلغ', useful: true },
      { id: 'rim', text: 'تأخذ ريم 9/15 من نفس المبلغ', useful: true },
      { id: 'amount', text: 'المبلغ 4500 دج', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'اختزال الكسرين',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['أبسط شكل للكسرين'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['tariqat-ikhtizal'],
            prompt: 'قاسم مشترك لـ 18 و 30:',
            options: ['6 (و أيضًا 2 و 3)', '5', '9'],
            correct: 0,
            explain: '$18=6\\times 3$ و $30=6\\times 5$ ؛ 30 لا يقبل القسمة على 9 ، و 18 لا يقبلها على 5.' },
          { kind: 'batch', role: 'answer', ask: 0, requires: ['tariqat-ikhtizal'],
            prompt: 'أبسط شكل ممكن:',
            rows: [
              { label: '$\\frac{18}{30}$', options: ['$\\frac{9}{15}$', '$\\frac{3}{5}$', '$\\frac{6}{10}$'], correct: 1, correction: '$\\frac{18\\div 6}{30\\div 6}=\\frac{3}{5}$ ؛ $\\frac{9}{15}$ و $\\frac{6}{10}$ مساويان لكن يمكن اختزالهما.' },
              { label: '$\\frac{9}{15}$', options: ['$\\frac{3}{5}$', '$\\frac{3}{15}$', '$\\frac{9}{5}$'], correct: 0, correction: '$\\frac{9\\div 3}{15\\div 3}=\\frac{3}{5}$.' },
            ] },
          { kind: 'solution', ask: 0, lines: [
            '$\\frac{18}{30}=\\frac{18\\div 6}{30\\div 6}=\\frac{3}{5}$ (أو ÷2 ثم ÷3).',
            '$\\frac{9}{15}=\\frac{9\\div 3}{15\\div 3}=\\frac{3}{5}$.',
          ] },
        ],
      },
      {
        label: '2)', title: 'هل ريم على حق؟',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['هل الحصّتان متساويتان؟'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['kitabat-mutasawiya'],
            prompt: 'الحصّتان:',
            options: ['متساويتان: الكسران يساويان $\\frac{3}{5}$ من نفس المبلغ', 'حصّة أمين أكبر لأنّ 18 أكبر من 9', 'حصّة ريم أكبر لأنّ 15 أصغر من 30'],
            correct: 0,
            explain: 'كسران متساويان من نفس المبلغ يعطيان نفس الحصّة، دون حساب.' },
          { kind: 'solution', ask: 0, lines: [
            'الكسران $\\frac{18}{30}$ و $\\frac{9}{15}$ يساويان $\\frac{3}{5}$ ، وهما من نفس المبلغ.',
            'إذن الحصّتان متساويتان: ريم على حق.',
          ] },
        ],
      },
      {
        label: '3)', title: 'كسر عشري',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['الكسر العشري والكتابة العشرية'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['kasr-ashri'],
            prompt: '$\\frac{9}{15}=\\frac{3}{5}=\\frac{\\ldots}{10}$',
            options: ['6', '8', '13'],
            correct: 0,
            explain: '$\\frac{3\\times 2}{5\\times 2}=\\frac{6}{10}$.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['kasr-ashri'], prompt: 'الكتابة العشرية:', expected: 0.6, display: '0,6',
            explain: '$\\frac{6}{10}=0{,}6$ : ستة أعشار.' },
          { kind: 'solution', ask: 0, lines: [
            '$\\frac{9}{15}=\\frac{3}{5}=\\frac{3\\times 2}{5\\times 2}=\\frac{6}{10}$ : كسر عشري مقامه 10.',
            'كتابته العشرية $\\frac{6}{10}=0{,}6$.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — مثلثان في مربع',
    context: 'تحدّي — الكتاب ص 60',
    emoji: '📐',
    tone: 'emerald',
    source: src('deep-1', 60, 'أتعمّق', 1),
    statement: 'في الشكل مربعان، طول ضلع كل منهما 4 وحدات على ورقة مرصوفة، وفي كل منهما مثلث ملوّن رؤوسه على عقد الشبكة. نريد أن نعبّر بكسر عن الجزء الملوّن من كل مربع.',
    figure: {
      points: {
        A: [6, 0], B: [10, 0], C: [10, 4], D: [6, 4], P: [7, 4], Q: [6, 1], R: [9, 0],
        E: [0, 0], F: [4, 0], G: [4, 4], H: [0, 4], U: [2, 4], V: [0, 0], W: [4, 2],
      },
      hidden: ['A', 'B', 'C', 'D', 'P', 'Q', 'R', 'E', 'F', 'G', 'H', 'U', 'V', 'W'],
      polygons: [
        { points: ['A', 'B', 'C', 'D'], tone: 'slate' },
        { points: ['P', 'Q', 'R'], tone: 'emerald' },
        { points: ['E', 'F', 'G', 'H'], tone: 'slate' },
        { points: ['U', 'V', 'W'], tone: 'emerald' },
      ],
      grid: true,
      ariaLabel: 'مربعان طول ضلع كل منهما 4 خانات على ورقة مرصوفة: في الأوّل (على اليمين) مثلث رؤوسه على الضلع العلوي والضلع الأيسر والضلع السفلي، وفي الثاني (على اليسار) مثلث رؤوسه على الضلع العلوي وفي الركن السفلي الأيسر وعلى الضلع الأيمن',
    },
    data: [
      { id: 'side', text: 'طول ضلع كل مربع 4 وحدات', useful: true },
      { id: 'grid', text: 'رؤوس المثلثين على عقد الشبكة', useful: true },
      { id: 'paper', text: 'الرسم على ورقة مرصوفة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'مساحة المربع',
        question: 'احسب مساحة المربع بالخانات.',
        asks: ['مساحة المربع'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, prompt: 'مساحة المربع (خانة):', expected: 16, explain: '$4\\times 4=16$ خانة.' },
          { kind: 'solution', ask: 0, lines: ['طول ضلع المربع 4 وحدات، أي 4 خانات.', 'مساحة المربع $4\\times 4=16$ خانة.'] },
        ],
      },
      {
        label: '2)', title: 'المثلث الثاني',
        question: 'احسب مساحة المثلث الملوّن في المربع الثاني (اطرح من المربع الأجزاء غير الملوّنة)، ثم عبّر بكسر عن الجزء الملوّن واختزله.',
        asks: ['مساحة المثلث', 'الكسر المختزل'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['kasr-juz-ibtidai'], prompt: 'مساحة الأجزاء الثلاثة غير الملوّنة (خانة):', expected: 10,
            explain: 'ثلاثة مثلثات قائمة: $\\frac{4\\times 2}{2}+\\frac{2\\times 2}{2}+\\frac{4\\times 2}{2}=4+2+4=10$.' },
          { kind: 'numeric', role: 'answer', ask: 0, prompt: 'مساحة المثلث الملوّن (خانة):', expected: 6, explain: '$16-10=6$.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['tariqat-ikhtizal'],
            prompt: 'الجزء الملوّن من المربع الثاني:',
            options: ['$\\frac{6}{16}=\\frac{3}{8}$', '$\\frac{6}{16}=\\frac{1}{3}$', '$\\frac{6}{10}=\\frac{3}{5}$'],
            correct: 0,
            explain: '$\\frac{6\\div 2}{16\\div 2}=\\frac{3}{8}$ ؛ 10 مساحة الجزء غير الملوّن، لا مساحة المربع.' },
          { kind: 'solution', ask: 0, lines: [
            'مساحة المثلث $16-(4+2+4)=6$ خانات.',
            'الجزء الملوّن $\\frac{6}{16}=\\frac{6\\div 2}{16\\div 2}=\\frac{3}{8}$ من المربع.',
          ] },
        ],
      },
      {
        label: '3)', title: 'المثلث الأوّل',
        question: 'مساحة المثلث الملوّن في المربع الأوّل 5 خانات. عبّر بكسر عن الجزء الملوّن. هل يمكن اختزاله؟',
        asks: ['الكسر', 'هل يمكن اختزاله؟'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['kasr-juz-ibtidai'],
            prompt: 'الجزء الملوّن من المربع الأوّل:',
            options: ['$\\frac{5}{16}$', '$\\frac{5}{11}$', '$\\frac{16}{5}$'],
            correct: 0,
            explain: '5 خانات من 16 خانة.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['tariqat-ikhtizal'],
            prompt: 'هل يمكن اختزال $\\frac{5}{16}$؟',
            options: ['لا: 5 و 16 ليس لهما قاسم مشترك غير 1', 'نعم: نقسم على 2', 'نعم: نقسم على 5'],
            correct: 0,
            explain: '5 لا يقبل القسمة على 2، و 16 لا يقبلها على 5: $\\frac{5}{16}$ في أبسط شكل.' },
          { kind: 'solution', ask: 0, lines: [
            'الجزء الملوّن $\\frac{5}{16}$ من المربع الأوّل.',
            'قواسم 5 هي 1 و 5، و 16 لا يقبل القسمة على 5: لا يمكن اختزاله.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — الرمز 5Δ2□',
    context: 'أفكّر وأشكّل — الكتاب ص 60',
    emoji: '🔢',
    tone: 'violet',
    source: src('deep-8', 60, 'أتعمّق', 8),
    illustration: { kind: 'tags', cards: [{ title: 'العدد A', icon: 'ticket', lines: [{ label: 'رقم الآلاف', value: 5 }, { label: 'رقم العشرات', value: 2 }, { label: 'رقما المئات والآحاد', value: 'Δ ، □' }] }], ariaLabel: 'بطاقة العدد A = 5Δ2□ : رقم الآلاف 5 ورقم العشرات 2، ورقما المئات والآحاد مجهولان' },
    statement: 'نعتبر العدد $A=5\\Delta 2\\square$ حيث لا نعرف رقم آحاده □ ولا رقم مئاته Δ (رقم الآلاف 5 ورقم العشرات 2).',
    data: [
      { id: 'digits', text: 'رقم الآلاف 5 ورقم العشرات 2', useful: true },
      { id: 'unknown', text: 'رقما المئات والآحاد مجهولان', useful: true },
      { id: 'four', text: 'A مكتوب بأربعة أرقام', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'على 2 و 5 معا',
        question: 'ما رقم آحاد A إذا كان يقبل القسمة على 2 و 5 معا؟ هل يهمّ رقم المئات؟',
        asks: ['رقم الآحاد', 'هل يهمّ رقم المئات؟'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qawaid-qabiliyat-qisma'],
            prompt: 'رقم الآحاد □ هو:',
            options: ['0', '5', '2'],
            correct: 0,
            explain: 'على 2: رقم آحاد زوجي؛ على 5: 0 أو 5. معًا: 0.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['qawaid-qabiliyat-qisma'],
            prompt: 'رقم المئات Δ:',
            options: ['يمكن أن يكون أيّ رقم من 0 إلى 9', 'يجب أن يكون 0', 'يجب أن يكون زوجيًا'],
            correct: 0,
            explain: 'القسمة على 2 وعلى 5 يقرّرها رقم الآحاد وحده: 5020 ، 5120 ، … ، 5920.' },
          { kind: 'solution', ask: 0, lines: ['يقبل A القسمة على 2 وعلى 5 معًا إذا كان رقم آحاده 0: □ = 0.', 'رقم المئات Δ لا يؤثّر: الأعداد من 5020 إلى 5920.'] },
        ],
      },
      {
        label: '2)', title: 'على 5 و 9 معا',
        question: 'عيّن كل الأعداد A التي تقبل القسمة على 5 و 9 معا.',
        asks: ['كل الأعداد A'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['qawaid-qabiliyat-qisma'],
            prompt: 'إذا كان □ = 0 ، فإنّ $5+\\Delta+2+0$ يقبل القسمة على 9 عندما:',
            options: ['Δ = 2', 'Δ = 0', 'Δ = 9'],
            correct: 0,
            explain: '$5+2+2+0=9$.' },
          { kind: 'batch', role: 'answer', ask: 0, requires: ['qawaid-qabiliyat-qisma'],
            prompt: 'الأعداد A:',
            rows: [
              { label: 'إذا كان □ = 0', options: ['5220', '5020', '5920'], correct: 0, correction: '$5+2+2+0=9$.' },
              { label: 'إذا كان □ = 5', options: ['5025', '5625', '5225'], correct: 1, correction: '$5+6+2+5=18$.' },
            ] },
          { kind: 'solution', ask: 0, lines: [
            'على 5: □ = 0 أو □ = 5.',
            '□ = 0: $5+\\Delta+2=9$ إذن Δ = 2 والعدد 5220 ؛ □ = 5: $12+\\Delta=18$ إذن Δ = 6 والعدد 5625.',
          ] },
        ],
      },
      {
        label: '3)', title: 'اختزال',
        question: 'اختزل الكسر $\\frac{5220}{5625}$ إلى أبسط شكل ممكن.',
        asks: ['أبسط شكل ممكن'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['tariqat-ikhtizal'],
            prompt: 'من السؤال 2، قاسم مشترك للبسط والمقام:',
            options: ['45 (لأنهما يقبلان القسمة على 5 وعلى 9)', '2', '25'],
            correct: 0,
            explain: '5625 فردي فلا يقبل القسمة على 2 ، و 20 لا يقبل القسمة على 25 فـ 5220 لا يقبلها.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tariqat-ikhtizal'],
            prompt: '$\\frac{5220}{5625}=$',
            options: ['$\\frac{116}{125}$', '$\\frac{580}{625}$', '$\\frac{125}{116}$'],
            correct: 0,
            explain: '÷9 تعطي $\\frac{580}{625}$ ، ثم ÷5 تعطي $\\frac{116}{125}$ ؛ و 116 و 125 ليس لهما قاسم مشترك غير 1.' },
          { kind: 'solution', ask: 0, lines: [
            '$\\frac{5220}{5625}=\\frac{5220\\div 9}{5625\\div 9}=\\frac{580}{625}=\\frac{580\\div 5}{625\\div 5}=\\frac{116}{125}$.',
            '$116=4\\times 29$ و $125=5\\times 5\\times 5$ : لا قاسم مشترك غير 1.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
