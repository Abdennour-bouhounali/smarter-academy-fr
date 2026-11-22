/**
 * Les trois « مسائل » du درس « تساوي كسرين ومقارنتهما » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas (GuidedProblem). La مسألة 1
 * (`LESSON_CONFIG.lessonProblem`) : le concours de tir de la journée du sport (7/9, 10/13, 11/14 : le plus précis, puis l'ordre) ; la 2 la fresque de l'école (5 bleu pour 8 blanc et 8 pour 13 :
 * pas la même teinte, qui est la plus foncée, aucun entier pour 13 blancs, 10 pour 16) ; la 3 le carrelage du couloir par des parents bénévoles (2/5, 3/8, 9/40 sur le dénominateur 40).
 * Chaque nombre est vérifié dans ./problems.test.js en arithmétique EXACTE (BigInt). La question « ont-ils fini le couloir ? » demande une SOMME (leçon suivante) : elle n'est PAS posée.
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — مسابقة الرمي',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🎯',
    tone: 'indigo',
    source: SOURCE,
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'أمين: 7 رميات من 9', useful: true },
      { id: 'd2', text: 'ياسمين: 10 رميات من 13', useful: true },
      { id: 'd3', text: 'رياض: 11 رمية من 14', useful: true },
      { id: 'd4', text: 'تقام المسابقة في ساحة المدرسة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الأدقّ رميًا',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['الأدقّ رميًا'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['muqarana-mutasalib'],
            prompt: 'الدقّة هي الكسر: عدد الرميات المصيبة على عدد الرميات. كيف نعرف الأدقّ بين $\\frac{7}{9}$ و $\\frac{10}{13}$ و $\\frac{11}{14}$ ؟',
            options: ['نقارن الكسور الثلاثة بتوحيد المقامات أو بالجداءين المتصالبين', 'نقارن عدد الرميات المصيبة فقط', 'نقارن عدد الرميات المنفَّذة فقط'], correct: 0, cols: 1,
            explain: 'الدقّة نسبة: المصيبة إلى المنفَّذة، فلا يكفي أحد العددين وحده.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['muqarana-mutasalib'],
            prompt: 'الأدقّ رميًا:',
            options: ['رياض', 'أمين', 'ياسمين'], correct: 0, cols: 3,
            explain: '$\\frac{11}{14}$ هو الأكبر: $11\\times9=99>98=7\\times14$ فهو أكبر من $\\frac{7}{9}$ ، و $11\\times13=143>140=10\\times14$ فهو أكبر من $\\frac{10}{13}$ .' },
          { kind: 'solution', ask: 0, lines: [
            'الدقّة هي النسبة $\\frac{\\text{المصيبة}}{\\text{المنفَّذة}}$ : $\\frac{7}{9}$ و $\\frac{10}{13}$ و $\\frac{11}{14}$ .',
            'نقارن رياضًا بكلّ من الآخرين بالجداءين المتصالبين: $11\\times9=99>98=7\\times14$ و $11\\times13=143>140=10\\times14$ .',
            'فرياض هو الأدقّ.',
          ] },
        ],
      },
      {
        label: '2)', title: 'ترتيب الثلاثة',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['ترتيب التلاميذ'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['muqarana-mutasalib'],
            prompt: 'من الأقلّ دقّة إلى الأكثر دقّة:',
            options: ['ياسمين ثمّ أمين ثمّ رياض', 'أمين ثمّ ياسمين ثمّ رياض', 'رياض ثمّ أمين ثمّ ياسمين'], correct: 0, cols: 1,
            explain: '$\\frac{10}{13}<\\frac{7}{9}$ لأنّ $10\\times9=90<91=7\\times13$ ؛ و $\\frac{7}{9}<\\frac{11}{14}$ لأنّ $7\\times14=98<99=11\\times9$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$10\\times9=90$ و $7\\times13=91$ ، و $90<91$ ، إذن $\\frac{10}{13}<\\frac{7}{9}$ .',
            '$7\\times14=98$ و $11\\times9=99$ ، و $98<99$ ، إذن $\\frac{7}{9}<\\frac{11}{14}$ .',
            'الترتيب: ياسمين ثمّ أمين ثمّ رياض: $\\frac{10}{13}<\\frac{7}{9}<\\frac{11}{14}$ .',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — لون الجدارية',
    context: 'تزيين جدار المدرسة',
    emoji: '🎨',
    tone: 'sky',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'سلمى', lines: [{ label: 'أزرق', value: '5' }, { label: 'أبيض', value: '8' }] }, { title: 'يونس', lines: [{ label: 'أزرق', value: '8' }, { label: 'أبيض', value: '13' }] }], ariaLabel: 'بطاقتان: سلمى خلطت 5 طلقات أزرق مع 8 علب أبيض، ويونس خلط 8 طلقات مع 13 علبة أبيض' },
    statement: 'خلطت سلمى $5$ طلقات أزرق مع $8$ علب أبيض، وخلط يونس $8$ طلقات أزرق مع $13$ علبة أبيض.',
    data: [
      { id: 'a', text: 'سلمى: 5 طلقات أزرق مع 8 علب أبيض', useful: true },
      { id: 'b', text: 'يونس: 8 طلقات أزرق مع 13 علبة أبيض', useful: true },
      { id: 'c', text: 'ستُطلى الجدارية يوم السبت', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'هل اللونان متماثلان؟',
        question: 'هل اللونان متماثلان؟ ومن صاحب اللون الأغمق؟',
        asks: ['هل اللونان متماثلان؟', 'صاحب اللون الأغمق'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jidaa-mutasalib'],
            prompt: 'هل اللونان متماثلان؟',
            options: ['لا: $5\\times13=65$ و $8\\times8=64$ مختلفان', 'نعم لأنّ الفرق بين العددين في المزجين متساوٍ', 'نعم لأنّ اللونين متقاربان'], correct: 0, cols: 1,
            explain: 'الكسران $\\frac{5}{8}$ و $\\frac{8}{13}$ غير متساويين لأنّ جداءيهما المتصالبين مختلفان.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['muqarana-mutasalib'],
            prompt: 'اللون الأغمق هو لون:',
            options: ['سلمى', 'يونس'], correct: 0, cols: 2,
            explain: '$5\\times13=65>64=8\\times8$ ، فنسبة الأزرق عند سلمى $\\frac{5}{8}$ أكبر من $\\frac{8}{13}$ ، فلونها أغمق.' },
          { kind: 'solution', ask: 0, lines: [
            'نقارن $\\frac{5}{8}$ و $\\frac{8}{13}$ بالجداءين المتصالبين: $5\\times13=65$ و $8\\times8=64$ .',
            'الجداءان مختلفان، فاللونان غير متماثلين.',
            '$65>64$ ، إذن $\\frac{5}{8}>\\frac{8}{13}$ : لون سلمى أغمق.',
          ] },
        ],
      },
      {
        label: '2)', title: 'ليطابق يونس لون سلمى',
        question: 'كم طلقة أزرق يضع يونس مع $13$ علبة أبيض ليطابق لون سلمى؟',
        asks: ['عدد الطلقات'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jidaa-mutasalib'],
            prompt: 'عدد الطلقات:',
            options: ['$8$ طلقات', '$9$ طلقات', 'لا يوجد عدد صحيح من الطلقات'], correct: 2, cols: 1,
            explain: 'نبحث عن $c$ حيث $\\frac{c}{13}=\\frac{5}{8}$ ، أي $c\\times8=5\\times13=65$ . $65$ لا تقبل القسمة على $8$ ($c=8{,}125$) : لا يوجد عدد صحيح.' },
          { kind: 'solution', ask: 0, lines: [
            'نريد $\\frac{c}{13}=\\frac{5}{8}$ ، أي $c\\times8=5\\times13=65$ .',
            '$65\\div8=8{,}125$ ليس عددًا صحيحًا: لا توجد طلقات كاملة تعطي اللون نفسه.',
            'مع $8$ طلقات اللون أفتح ($8\\times8=64<65$) ، ومع $9$ طلقات أغمق ($9\\times8=72>65$).',
          ] },
        ],
      },
      {
        label: '3)', title: 'ومع 16 علبة؟',
        question: 'وكم طلقة يضع يونس مع $16$ علبة أبيض ليطابق لون سلمى؟',
        asks: ['عدد الطلقات'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jidaa-mutasalib'], prompt: 'عدد الطلقات:', expected: 10,
            explain: '$c\\times8=5\\times16=80$ ، فـ $c=10$ . ($\\frac{10}{16}=\\frac{5}{8}$ )' },
          { kind: 'solution', ask: 0, lines: [
            'نريد $\\frac{c}{16}=\\frac{5}{8}$ ، أي $c\\times8=5\\times16=80$ .',
            '$80\\div8=10$ ، فيضع يونس $10$ طلقات، و $\\frac{10}{16}=\\frac{5}{8}$ لأنّ $16$ هو ضعف $8$ .',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — تبليط الممرّ',
    context: 'العناية بمدرستنا',
    emoji: '🧱',
    tone: 'emerald',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'اليوم الأول', lines: [{ label: 'من الممرّ', value: '2/5' }] }, { title: 'اليوم الثاني', lines: [{ label: 'من الممرّ', value: '3/8' }] }, { title: 'اليوم الثالث', lines: [{ label: 'من الممرّ', value: '9/40' }] }], ariaLabel: 'ثلاث بطاقات: اليوم الأول 2 على 5 من الممرّ، اليوم الثاني 3 على 8، اليوم الثالث 9 على 40' },
    statement: 'بلّط أولياء متطوّعون ممرّ المدرسة: $\\frac{2}{5}$ منه في اليوم الأول، و $\\frac{3}{8}$ في اليوم الثاني، و $\\frac{9}{40}$ في اليوم الثالث.',
    data: [
      { id: 'a', text: 'اليوم الأول: 2/5 من الممرّ', useful: true },
      { id: 'b', text: 'اليوم الثاني: 3/8 من الممرّ', useful: true },
      { id: 'c', text: 'اليوم الثالث: 9/40 من الممرّ', useful: true },
      { id: 'd', text: 'الأولياء يتطوّعون بعد انتهاء عملهم', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'بالمقام 40',
        question: 'اكتب الكسور الثلاثة بالمقام $40$ .',
        asks: ['الكسور بالمقام 40'],
        steps: [
          { kind: 'sort' },
          { kind: 'batch', role: 'answer', ask: 0, requires: ['tawhid-maqamat'], prompt: 'اختر الكتابة الصحيحة بالمقام $40$ :',
            rows: [
              { label: '$\\frac{2}{5}$', options: ['$\\frac{16}{40}$', '$\\frac{10}{40}$', '$\\frac{7}{40}$'], correct: 0, correction: '$40\\div5=8$ و $2\\times8=16$ .' },
              { label: '$\\frac{3}{8}$', options: ['$\\frac{15}{40}$', '$\\frac{24}{40}$', '$\\frac{35}{40}$'], correct: 0, correction: '$40\\div8=5$ و $3\\times5=15$ .' },
              { label: '$\\frac{9}{40}$', options: ['$\\frac{9}{40}$', '$\\frac{45}{40}$', '$\\frac{360}{40}$'], correct: 0, correction: 'مقامه $40$ فهو على حاله.' },
            ] },
          { kind: 'solution', ask: 0, lines: [
            '$40$ مضاعف مشترك للمقامات $5$ و $8$ و $40$ .',
            '$\\frac{2}{5}=\\frac{2\\times8}{5\\times8}=\\frac{16}{40}$ و $\\frac{3}{8}=\\frac{3\\times5}{8\\times5}=\\frac{15}{40}$ ، و $\\frac{9}{40}$ على حاله.',
          ] },
        ],
      },
      {
        label: '2)', title: 'أكبر جزء',
        question: 'في أيّ يوم بلّطوا أكبر جزء من الممرّ؟',
        asks: ['اليوم الأكبر'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qaida-tawhid'],
            prompt: 'اليوم الذي بلّطوا فيه أكبر جزء:',
            options: ['اليوم الأول', 'اليوم الثاني', 'اليوم الثالث'], correct: 0, cols: 3,
            explain: 'بالمقام $40$ : $16$ و $15$ و $9$ ، وأكبرها $16$ أي $\\frac{2}{5}$ في اليوم الأول.' },
          { kind: 'solution', ask: 0, lines: [
            'بالمقام نفسه $40$ نقارن البسطين: $16$ و $15$ و $9$ .',
            '$16$ أكبرها، فأكبر جزء بلّطوه في اليوم الأول.',
          ] },
        ],
      },
      {
        label: '3)', title: 'ترتيب الأيام',
        question: 'رتّب الأيام من الأصغر جزءًا إلى الأكبر جزءًا.',
        asks: ['ترتيب الأيام'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qaida-tawhid'],
            prompt: 'الترتيب التصاعدي للأجزاء المبلَّطة:',
            options: ['اليوم الثالث ثمّ الثاني ثمّ الأول', 'اليوم الأول ثمّ الثاني ثمّ الثالث', 'اليوم الثاني ثمّ الثالث ثمّ الأول'], correct: 0, cols: 1,
            explain: '$\\frac{9}{40}<\\frac{15}{40}<\\frac{16}{40}$ ، أي اليوم الثالث ثمّ الثاني ثمّ الأول.' },
          { kind: 'solution', ask: 0, lines: [
            'البسطان بالمقام $40$ : اليوم الأول $16$ ، الثاني $15$ ، الثالث $9$ .',
            '$9<15<16$ ، فالترتيب: اليوم الثالث ثمّ اليوم الثاني ثمّ اليوم الأول.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
