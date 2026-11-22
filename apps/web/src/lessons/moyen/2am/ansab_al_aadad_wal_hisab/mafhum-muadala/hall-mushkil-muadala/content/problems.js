/**
 * Les trois « مسائل » du درس « حلّ مشكل باستعمال معادلة » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل الثاني, résolus pas à pas (GuidedProblem). AJOUTS DE LA PLATEFORME
 * (`addition('exam_style_problem')`), contextes de la plateforme (les pas d'un robot, la clôture d'un terrain, des bouteilles d'huile d'olive). Périmètre : traduire par une équation, résoudre une équation à une opération
 * (facteur ou diviseur manquant) ou à deux opérations, vérifier ; jamais x des deux côtés ni valeur négative. La مسألة 1 est « مسألة الدرس » (`LESSON_CONFIG.lessonProblem`) ; chaque nombre est vérifié dans ./problems.test.js.
 */
import { addition, src } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — خطوات الروبوت',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🤖',
    tone: 'sky',
    source: SOURCE,
    cites: [src('ex-40', 64, 'المعادلات', 40)],
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'human', text: 'خطوة ياسين: ⁦0,6 m⁩', useful: true },
      { id: 'robot', text: 'خطوة الروبوت: ثلاثة أضعاف خطوة ياسين', useful: true },
      { id: 'x', text: 'عدد الخطوات: x لكلّ منهما', useful: true },
      { id: 'color', text: 'لون الروبوت أزرق', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'خطوة الروبوت',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['الخطوة'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qasim-naqis'], prompt: 'خطوة الروبوت: $3\\times0{,}6=$', expected: 1.8, suffix: 'm',
            explain: '$3\\times0{,}6=1{,}8$ .' },
          { kind: 'solution', ask: 0, lines: ['ثلاثة أضعاف $0{,}6$ هو $3\\times0{,}6=1{,}8$ .', 'خطوة الروبوت $1{,}8$ m .'] },
        ],
      },
      {
        label: '2)', title: 'ما يربحه الروبوت في كلّ خطوة',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['الفرق'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qasim-naqis'], prompt: 'بعد خطوة واحدة: $1{,}8-0{,}6=$', expected: 1.2, suffix: 'm',
            explain: 'الروبوت يقطع $1{,}8$ وياسين $0{,}6$ ، فالفرق $1{,}2$ .' },
          { kind: 'solution', ask: 0, lines: ['بعد خطوة: $1{,}8-0{,}6=1{,}2$ m .', 'يزداد التقدّم بـ $1{,}2$ m مع كلّ خطوة.'] },
        ],
      },
      {
        label: '3)', title: 'المعادلة',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['المعادلة'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['muadala-kitabatan'],
            prompt: 'بعد $x$ خطوة يتقدّم الروبوت على ياسين بـ $18$ m ، فالمعادلة:',
            options: ['$1{,}2\\times x=18$', '$1{,}2+x=18$', '$\\frac{x}{1{,}2}=18$'], correct: 0, cols: 1,
            explain: 'كلّ خطوة تضيف $1{,}2$ ، فبعد $x$ خطوة نجد $1{,}2\\times x$ . ($1{,}2+x$ يضيف $1{,}2$ مرّة واحدة.)' },
          { kind: 'solution', ask: 0, lines: ['التقدّم بعد $x$ خطوة: $1{,}2\\times x$ .', 'المعادلة: $1{,}2\\times x=18$ .'] },
        ],
      },
      {
        label: '4)', title: 'عدد الخطوات',
        question: LESSON_CONFIG.lessonProblem.questions[3].text,
        asks: ['x'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qasim-naqis'], prompt: 'العامل الناقص: $x=18\\div1{,}2=$', expected: 15, suffix: 'خطوة',
            explain: '$1{,}2\\times15=18$ ، فالعامل الناقص $18\\div1{,}2=15$ .' },
          { kind: 'solution', ask: 0, lines: ['$x=18\\div1{,}2=15$ .', 'يتقدّم الروبوت على ياسين بـ $18$ m بعد $15$ خطوة.'] },
        ],
      },
      {
        label: '5)', title: 'التحقّق',
        question: LESSON_CONFIG.lessonProblem.questions[4].text,
        asks: ['الفرق'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qasim-naqis'], prompt: '$1{,}8\\times15-0{,}6\\times15=27-9=$', expected: 18, suffix: 'm',
            explain: 'الروبوت قطع $27$ m وياسين $9$ m ، والفرق $18$ m .' },
          { kind: 'solution', ask: 0, lines: ['الروبوت $27$ m وياسين $9$ m .', 'الفرق $27-9=18$ m : العدد $15$ حلّ للمعادلة.'] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — سياج قطعة الأرض',
    context: 'قطعة أرض عائلية',
    emoji: '🏡',
    tone: 'emerald',
    source: SOURCE,
    cites: [src('deep-59', 67, 'أتعمّق', 59)],
    illustration: { kind: 'tags', cards: [{ title: 'القطعة', icon: 'plant', lines: [{ label: 'الطول', value: '85', unit: 'm' }, { label: 'المحيط', value: '250', unit: 'm' }] }, { title: 'السياج', icon: 'coin', lines: [{ label: 'ثمن المتر', value: '120', unit: 'DA' }] }], ariaLabel: 'بطاقتان: قطعة أرض طولها خمسة وثمانون مترًا ومحيطها مئتان وخمسون مترًا، وثمن متر السياج مئة وعشرون دينارًا' },
    statement: 'قطعة أرض مستطيلة طولها $85\\,\\mathrm{m}$ وعرضها $x$ ، ومحيطها $250\\,\\mathrm{m}$ . يُسيَّج المتر الواحد بـ $120$ دينارًا.',
    data: [
      { id: 'length', text: 'الطول: ⁦85 m⁩', useful: true },
      { id: 'perimeter', text: 'المحيط: ⁦250 m⁩', useful: true },
      { id: 'price', text: 'ثمن متر السياج: ⁦120 DA⁩', useful: true },
      { id: 'owner', text: 'الأرض ملك للعائلة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'المحيط بدلالة x',
        question: 'عبّر بدلالة $x$ عن محيط القطعة.',
        asks: ['المحيط'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['muadala-kitabatan'],
            prompt: 'محيط المستطيل ضعف مجموع طوله وعرضه:',
            options: ['$2x+170$', '$x+170$', '$85x+2$'], correct: 0, cols: 1,
            explain: '$2\\times(85+x)=2x+170$ . ($x+170$ يحسب ضلعين فقط من الأضلاع الأربعة.)' },
          { kind: 'solution', ask: 0, lines: ['المحيط $2\\times(85+x)=2\\times85+2x$ .', 'أي $2x+170$ .'] },
        ],
      },
      {
        label: '2)', title: 'المعادلة',
        question: 'اكتب المعادلة التي يحقّقها $x$ .',
        asks: ['المعادلة'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['muadala-kitabatan'],
            prompt: 'المحيط يساوي $250$ ، فالمعادلة:',
            options: ['$2x+170=250$', '$2x+85=250$', '$x+170=250$'], correct: 0, cols: 1,
            explain: 'نساوي عبارة المحيط $2x+170$ بقيمته $250$ . ($2x+85$ لا يضاعف الطول.)' },
          { kind: 'solution', ask: 0, lines: ['عبارة المحيط $2x+170$ والمحيط $250$ .', 'المعادلة $2x+170=250$ .'] },
        ],
      },
      {
        label: '3)', title: 'حلّ المعادلة',
        question: 'أوجد العرض $x$ بإلغاء آخر عملية أوّلًا.',
        asks: ['2x', 'x'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['akhir-amaliya'], prompt: 'آخر عملية $+170$ ، نلغيها: $2x=250-170=$', expected: 80,
            explain: 'نطرح $170$ من الطرفين المعلومين: $250-170=80$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['akhir-amaliya'], prompt: 'ثمّ نلغي الضرب في $2$ : $x=80\\div2=$', expected: 40, suffix: 'm',
            explain: '$80\\div2=40$ . نتحقّق: $2\\times40+170=250$ .' },
          { kind: 'solution', ask: 0, lines: ['$2x=250-170=80$ ثمّ $x=80\\div2=40$ .', 'عرض القطعة $40$ m .'] },
        ],
      },
      {
        label: '4)', title: 'ثمن السياج',
        question: 'احسب ثمن سياج القطعة كلّها.',
        asks: ['الثمن'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qasim-naqis'], prompt: 'ثمن السياج: $250\\times120=$', expected: 30000, suffix: 'DA',
            explain: '$250\\times120=30000$ .' },
          { kind: 'solution', ask: 0, lines: ['المحيط $250$ m والمتر بـ $120$ دينارًا.', 'الثمن $250\\times120=30000$ DA .'] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — قوارير زيت الزيتون',
    context: 'تعاونية الزيتون',
    emoji: '🫒',
    tone: 'violet',
    source: SOURCE,
    cites: [src('ex-39', 64, 'المعادلات', 39)],
    illustration: { kind: 'tags', cards: [{ title: 'الزيت', icon: 'leaf', lines: [{ label: 'الكمية', value: '157,5', unit: 'L' }] }, { title: 'القوارير', icon: 'leaf', lines: [{ label: 'العدد', value: '210', unit: '' }] }], ariaLabel: 'بطاقتان: مئة وسبعة وخمسون لترًا ونصف من الزيت، ومئتان وعشر قوارير' },
    statement: 'عصرت تعاونية $157{,}5\\,\\mathrm{L}$ من زيت الزيتون ووزّعتها في قوارير متماثلة، فملأت $210$ قارورة تمامًا.',
    data: [
      { id: 'oil', text: 'الزيت: ⁦157,5 L⁩', useful: true },
      { id: 'bottles', text: 'عدد القوارير: 210', useful: true },
      { id: 'x', text: 'سعة القارورة: x', useful: true },
      { id: 'village', text: 'التعاونية في ريف الجزائر', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'المعادلة',
        question: 'نسمّي $x$ سعة القارورة باللتر. اكتب معادلة تترجم الوضعية.',
        asks: ['المعادلة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['muadala-kitabatan'],
            prompt: 'توزيع الزيت على القوارير المتماثلة يعطي:',
            options: ['$\\frac{157{,}5}{x}=210$', '$157{,}5\\times x=210$', '$\\frac{x}{157{,}5}=210$'], correct: 0, cols: 1,
            explain: 'الكمية الكلّية موزّعة على القوارير: $157{,}5\\div x=210$ . (والمعادلة نفسها: $210\\times x=157{,}5$ .)' },
          { kind: 'solution', ask: 0, lines: ['الكمية الكلّية $157{,}5$ موزّعة على قوارير سعة كلّ منها $x$ .', 'عدد القوارير $210$ : $\\frac{157{,}5}{x}=210$ .'] },
        ],
      },
      {
        label: '2)', title: 'سعة القارورة',
        question: 'احسب سعة القارورة.',
        asks: ['السعة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qasim-naqis'], prompt: 'القاسم الناقص: $x=157{,}5\\div210=$', expected: 0.75, suffix: 'L',
            explain: '$210\\times0{,}75=157{,}5$ ، فالقاسم الناقص $157{,}5\\div210=0{,}75$ .' },
          { kind: 'solution', ask: 0, lines: ['$x=157{,}5\\div210=0{,}75$ .', 'سعة القارورة $0{,}75$ L . نتحقّق: $157{,}5\\div0{,}75=210$ .'] },
        ],
      },
      {
        label: '3)', title: 'قوارير أكبر',
        question: 'لو كانت سعة القارورة $1{,}5\\,\\mathrm{L}$ ، فكم قارورة تملأ التعاونية؟',
        asks: ['العدد'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qasim-naqis'], prompt: 'عدد القوارير: $157{,}5\\div1{,}5=$', expected: 105, suffix: 'قارورة',
            explain: '$1{,}5\\times105=157{,}5$ .' },
          { kind: 'solution', ask: 0, lines: ['$157{,}5\\div1{,}5=105$ .', 'القارورة الأكبر بالضعف تحتاج نصف العدد: $105$ .'] },
        ],
      },
      {
        label: '4)', title: 'قوارير أصغر',
        question: 'وبسعة $0{,}25\\,\\mathrm{L}$ ، كم قارورة؟',
        asks: ['العدد'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qasim-naqis'], prompt: 'عدد القوارير: $157{,}5\\div0{,}25=$', expected: 630, suffix: 'قارورة',
            explain: '$0{,}25\\times630=157{,}5$ .' },
          { kind: 'solution', ask: 0, lines: ['$157{,}5\\div0{,}25=630$ .', 'كلّما صغرت القارورة زاد عددها.'] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
