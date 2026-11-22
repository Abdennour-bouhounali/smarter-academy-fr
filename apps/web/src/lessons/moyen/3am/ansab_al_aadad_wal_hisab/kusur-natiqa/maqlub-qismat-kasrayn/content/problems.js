/**
 * Les trois « مسائل » du درس « مقلوب عدد وقسمة كسرين » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas (GuidedProblem). La مسألة 1
 * (`LESSON_CONFIG.lessonProblem`) : l'huile d'olive de la famille de سليم, 45/4 L en قوارير de 3/4 L (15), de 5/8 L (18), puis 3 petites (15/8 L) ; la 2 la
 * حديقة de l'école (35/6 m² de surface et 7/4 m de largeur : longueur 10/3 m, puis 3 bacs de 7/12 m) ; la 3 la campagne de plantation (18 élèves = 3/5 de 5/6
 * de la classe : 1/2, 36 élèves, 18 absents). Chaque nombre est vérifié dans ./problems.test.js en arithmétique EXACTE (BigInt).
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — زيت الزيتون',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🫒',
    tone: 'indigo',
    source: SOURCE,
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'الزيت: 45/4 لترًا', useful: true },
      { id: 'd2', text: 'قارورة: 3/4 لتر', useful: true },
      { id: 'd3', text: 'قارورة صغيرة: 5/8 لتر', useful: true },
      { id: 'd4', text: 'عائلة سليم تعصر الزيتون في الخريف', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'عدد القوارير',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['عدد القوارير'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['qismat-kasrayn'],
            prompt: 'كم قارورة سعتها $\\frac{3}{4}$ لتر تملأ من $\\frac{45}{4}$ لترًا؟ أيّ عملية نحسب؟',
            options: ['$\\frac{45}{4} \\div \\frac{3}{4}$', '$\\frac{45}{4} \\times \\frac{3}{4}$', '$\\frac{3}{4} \\div \\frac{45}{4}$'], correct: 0, cols: 1,
            explain: 'نسأل كم مرّة تدخل سعة القارورة في كمية الزيت، فنقسم الزيت على السعة.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qismat-kasrayn'], prompt: 'عدد القوارير:', expected: 15,
            explain: '$\\frac{45}{4} \\div \\frac{3}{4} = \\frac{45}{4} \\times \\frac{4}{3} = 15$ .' },
          { kind: 'solution', ask: 0, lines: [
            'عدد القوارير هو كم مرّة تدخل $\\frac{3}{4}$ في $\\frac{45}{4}$ : $\\frac{45}{4} \\div \\frac{3}{4}$ .',
            '$\\frac{45}{4} \\times \\frac{4}{3} = 15$ ، فتملأ العائلة $15$ قارورة.',
          ] },
        ],
      },
      {
        label: '2)', title: 'قوارير أصغر',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['عدد القوارير الصغيرة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qismat-kasrayn'], prompt: 'عدد القوارير الصغيرة:', expected: 18,
            explain: '$\\frac{45}{4} \\div \\frac{5}{8} = \\frac{45}{4} \\times \\frac{8}{5} = 18$ . (القارورة الأصغر تعطي عددًا أكبر.)' },
          { kind: 'solution', ask: 0, lines: [
            '$\\frac{45}{4} \\div \\frac{5}{8} = \\frac{45}{4} \\times \\frac{8}{5}$ ، ونختزل قبل الضرب: $\\frac{9 \\times 2}{1} = 18$ .',
            'القارورة الصغيرة أقلّ سعة، فعددها $18$ أكبر من $15$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'هدية للجيران',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['كمية الزيت المهداة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qisma-darb'], prompt: 'كمية الزيت المهداة باللتر (اكتبها عشريًا):', expected: 1.875, display: '1,875',
            explain: '$3 \\times \\frac{5}{8} = \\frac{15}{8} = 1{,}875$ لترًا.' },
          { kind: 'solution', ask: 0, lines: [
            'ثلاث قوارير سعة كلّ منها $\\frac{5}{8}$ لتر: $3 \\times \\frac{5}{8} = \\frac{15}{8}$ .',
            '$\\frac{15}{8} = 1{,}875$ ، فتهدي العائلة $1{,}875$ لتر.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — أحواض الحديقة',
    context: 'العناية بحديقة المدرسة',
    emoji: '🌱',
    tone: 'sky',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'مساحة الحديقة', lines: [{ label: 'm²', value: '35/6' }] }, { title: 'العرض', lines: [{ label: 'm', value: '7/4' }] }, { title: 'حوض واحد', lines: [{ label: 'عرضه m', value: '7/12' }] }], ariaLabel: 'ثلاث بطاقات: مساحة الحديقة 35 على 6 متر مربع، عرضها 7 على 4 متر، عرض كل حوض 7 على 12 متر' },
    statement: 'يعتني تلاميذ القسم بحديقة المدرسة وهي مستطيلة مساحتها $\\frac{35}{6}\\ \\mathrm{m^2}$ وعرضها $\\frac{7}{4}\\ \\mathrm{m}$ .',
    data: [
      { id: 'a', text: 'المساحة: 35/6 متر مربع', useful: true },
      { id: 'b', text: 'العرض: 7/4 متر', useful: true },
      { id: 'c', text: 'التلاميذ يسقون الأزهار كل صباح', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'طول الحديقة',
        question: 'ما طول الحديقة؟',
        asks: ['طول الحديقة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qismat-kasrayn'],
            prompt: 'طول الحديقة بالمتر:',
            options: ['$\\frac{10}{3}$', '$\\frac{245}{24}$', '$\\frac{3}{10}$'], correct: 0, cols: 3,
            explain: 'الطول $= \\frac{35}{6} \\div \\frac{7}{4} = \\frac{35}{6} \\times \\frac{4}{7} = \\frac{10}{3}$ . ($\\frac{245}{24}$ ضرب كسرين دون قلب؛ $\\frac{3}{10}$ قلب الناتج.)' },
          { kind: 'solution', ask: 0, lines: [
            'المساحة $=$ الطول $\\times$ العرض، فالطول $= \\frac{35}{6} \\div \\frac{7}{4}$ .',
            '$\\frac{35}{6} \\times \\frac{4}{7} = \\frac{5 \\times 2}{3 \\times 1} = \\frac{10}{3}$ ، أي $\\frac{10}{3}\\ \\mathrm{m}$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'عدد الأحواض',
        question: 'نقسم العرض إلى أحواض عرض كلّ منها $\\frac{7}{12}\\ \\mathrm{m}$ : كم حوضًا نحصل عليه؟',
        asks: ['عدد الأحواض'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qismat-kasrayn'], prompt: 'عدد الأحواض:', expected: 3,
            explain: '$\\frac{7}{4} \\div \\frac{7}{12} = \\frac{7}{4} \\times \\frac{12}{7} = 3$ .' },
          { kind: 'solution', ask: 0, lines: [
            'عدد الأحواض هو كم مرّة يدخل $\\frac{7}{12}$ في $\\frac{7}{4}$ : $\\frac{7}{4} \\div \\frac{7}{12}$ .',
            '$\\frac{7}{4} \\times \\frac{12}{7} = 3$ ، فنحصل على $3$ أحواض.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — حملة التشجير',
    context: 'غرس الأشجار والعناية بالحيّ',
    emoji: '🌳',
    tone: 'emerald',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'المشاركون', lines: [{ label: 'تلميذًا', value: '18' }] }, { title: 'الجزء الأول', lines: [{ label: 'من', value: '5/6' }] }, { title: 'الجزء الثاني', lines: [{ label: 'من ذلك', value: '3/5' }] }], ariaLabel: 'ثلاث بطاقات: 18 تلميذًا مشاركًا، وهم ثلاثة أخماس من خمسة أسداس تلاميذ القسم' },
    statement: 'شارك $18$ تلميذًا في حملة تشجير الحيّ، وهم يمثّلون $\\frac{3}{5}$ من $\\frac{5}{6}$ من تلاميذ القسم.',
    data: [
      { id: 'a', text: 'المشاركون: 18 تلميذًا', useful: true },
      { id: 'b', text: 'هم 3/5 من 5/6 من تلاميذ القسم', useful: true },
      { id: 'c', text: 'أشجار الحيّ تحتاج إلى الماء', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'كسر المشاركين',
        question: 'ما الكسر الذي يمثّله المشاركون من القسم؟',
        asks: ['كسر المشاركين'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qismat-kasrayn'],
            prompt: 'المشاركون يمثّلون $\\frac{3}{5}$ من $\\frac{5}{6}$ . كسرهم من القسم:',
            options: ['$\\frac{1}{2}$', '$\\frac{18}{25}$', '$\\frac{25}{18}$'], correct: 0, cols: 3,
            explain: '$\\frac{3}{5} \\times \\frac{5}{6} = \\frac{15}{30} = \\frac{1}{2}$ . (« من » تعني الضرب.)' },
          { kind: 'solution', ask: 0, lines: [
            'جزء من جزء يُحسب بالضرب: $\\frac{3}{5} \\times \\frac{5}{6}$ .',
            'نختزل $5$ مع $5$ و $3$ مع $6$ : $\\frac{1 \\times 1}{1 \\times 2} = \\frac{1}{2}$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'تلاميذ القسم',
        question: 'كم عدد تلاميذ القسم؟',
        asks: ['عدد تلاميذ القسم'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qismat-kasrayn'], prompt: 'عدد تلاميذ القسم:', expected: 36,
            explain: '$18$ تلميذًا هم $\\frac{1}{2}$ القسم: $18 \\div \\frac{1}{2} = 18 \\times 2 = 36$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$18$ هو $\\frac{1}{2}$ تلاميذ القسم، فالقسم كلّه $18 \\div \\frac{1}{2}$ .',
            '$18 \\times 2 = 36$ ، فعدد تلاميذ القسم $36$ تلميذًا.',
          ] },
        ],
      },
      {
        label: '3)', title: 'غير المشاركين',
        question: 'كم تلميذًا لم يشارك؟',
        asks: ['عدد غير المشاركين'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qisma-darb'], prompt: 'عدد التلاميذ الذين لم يشاركوا:', expected: 18,
            explain: '$36 - 18 = 18$ تلميذًا.' },
          { kind: 'solution', ask: 0, lines: [
            'غير المشاركين هم $36 - 18 = 18$ تلميذًا.',
            'وهم نصف القسم أيضًا، لأنّ المشاركين نصفه: $1 - \\frac{1}{2} = \\frac{1}{2}$ .',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
