/**
 * Les trois « مسائل » du درس « قوة عدد نسبي » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas
 * (GuidedProblem). La مسألة 1 est le تحدّي du manuel (p. 38 : 1, 3, 9 fleurs, « 300 le dixième jour ? ») RÉÉCRIT par la plateforme
 * (une campagne de livres : 1, 3, 9 élèves informés, 3ⁿ⁻¹) — `LESSON_CONFIG.lessonProblem` ; la 2 un papier plié (×2 à chaque pli,
 * 0,1 mm, au-delà d'un mètre) ; la 3 trois nombres à écrire comme une puissance, calculer par priorités et comparer (registre des
 * اختبارات الفصل الثاني de 3AM). Chaque nombre est vérifié dans ./problems.test.js en arithmétique EXACTE (BigInt).
 */
import { src, addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — حملة الكتب',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '📚',
    tone: 'indigo',
    source: SOURCE,
    cites: [src('challenge', 38, 'تحدّي')],
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'كل من عرف بالحملة يُخبر ثلاثة زملاء جدد في اليوم الموالي', useful: true },
      { id: 'd2', text: '1 في اليوم الأول، و 3 في اليوم الثاني، و 9 في اليوم الثالث', useful: true },
      { id: 'd3', text: 'الحملة لمكتبة المتوسطة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'اليوم الرابع',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['العدد في اليوم الرابع', 'على شكل قوة للعدد 3'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['quwa-taarif'], prompt: 'عدد الذين يعرفون بالحملة لأوّل مرّة في اليوم الرابع:', expected: 27,
            explain: 'كل واحد من التسعة يُخبر ثلاثة: $9 \\times 3 = 27$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['quwa-taarif'], prompt: '$27 = 3^{\\ldots}$ : الأس هو', expected: 3,
            explain: '$27 = 3 \\times 3 \\times 3 = 3^3$ .' },
          { kind: 'solution', ask: 0, lines: [
            'في اليوم الرابع: $9 \\times 3 = 27$ تلميذًا.',
            '$27 = 3 \\times 3 \\times 3 = 3^3$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'اليوم السابع',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['على شكل قوة للعدد 3', 'العدد'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['quwa-taarif'],
            prompt: 'العدد في اليوم الأول $1 = 3^0$ ، وفي اليوم الثاني $3^1$ ، وفي الثالث $3^2$ . في اليوم السابع:',
            options: ['$3^7$', '$3^6$', '$7^3$'], correct: 1, cols: 3,
            explain: 'الأس أصغر من رقم اليوم بواحد: اليوم السابع $3^{7-1} = 3^6$ . ($7^3$ يخلط بين الأساس والأس.)' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['quwa-taarif'], prompt: '$3^6 =$', expected: 729,
            explain: '$3^6 = 3^3 \\times 3^3 = 27 \\times 27 = 729$ .' },
          { kind: 'solution', ask: 0, lines: [
            'في اليوم السابع: $3^6$ تلميذًا.',
            '$3^6 = 27 \\times 27 = 729$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'اليوم العاشر',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['العدد في اليوم العاشر', 'هل أمين على صواب؟'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jidaa-quwatayn'], prompt: 'في اليوم العاشر: $3^9 =$', expected: 19683,
            explain: '$3^9 = 3^6 \\times 3^3 = 729 \\times 27 = 19683$ .' },
          { kind: 'choice', role: 'conclude', ask: 1,
            prompt: 'هل أمين على صواب؟',
            options: ['نعم، لأنّ $3 \\times 100 = 300$', 'لا، العدد $3^9 = 19683$ أكبر بكثير من 300', 'لا، العدد هو $3 \\times 9 = 27$'], correct: 1, cols: 1,
            explain: 'العدد يُضرب في 3 كل يوم: $3^9 = 19683$ . أمّا $3 \\times 9$ فهو جمع ثلاثة تسع مرّات.' },
          { kind: 'solution', ask: 0, lines: [
            'في اليوم العاشر: $3^9 = 729 \\times 27 = 19683$ تلميذًا.',
            'أمين ليس على صواب: $19683 > 300$ .',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — الورقة المطويّة',
    context: 'كل طيّة تضاعف السُّمك',
    emoji: '📄',
    tone: 'sky',
    source: SOURCE,
    illustration: { kind: 'scene', icon: 'ticket', bg: 'blue', chips: [{ label: 'سُمك الورقة', value: '0,1', unit: 'mm', tone: 'blue' }, { label: 'الطيّات', value: 10, tone: 'amber' }, { label: 'المتر', value: 1000, unit: 'mm', tone: 'green' }], ariaLabel: 'ورقة سُمكها 0,1 mm تُطوى 10 مرّات، والمتر 1000 mm' },
    statement: 'في ورشة التغليف بالمتوسطة يطوي ياسين ورقة كبيرة سُمكها $0{,}1\\,\\mathrm{mm}$ على نصفين، ثم يطويها مرّة أخرى على نصفين، وهكذا، بإتقان حتى تبقى الحواف منطبقة. كل طيّة تضاعف عدد الطبقات.',
    data: [
      { id: 'thick', text: 'سُمك الورقة 0,1 mm', useful: true },
      { id: 'double', text: 'كل طيّة تضاعف عدد الطبقات', useful: true },
      { id: 'workshop', text: 'الورشة في المتوسطة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'ثلاث طيّات',
        question: 'كم طبقة بعد 3 طيّات؟ ما سُمك الورقة المطويّة عندئذ؟',
        asks: ['عدد الطبقات', 'السُّمك'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['quwa-taarif'], prompt: 'عدد الطبقات بعد 3 طيّات:', expected: 8,
            explain: '$2 \\times 2 \\times 2 = 2^3 = 8$ طبقات.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['awlawiya-quwa'], prompt: 'السُّمك بالميليمتر: $0{,}1 \\times 2^3 =$', expected: 0.8, display: '0,8',
            explain: 'القوة أوّلًا: $0{,}1 \\times 8 = 0{,}8\\,\\mathrm{mm}$ .' },
          { kind: 'solution', ask: 0, lines: [
            'بعد 3 طيّات: $2^3 = 8$ طبقات.',
            'السُّمك: $0{,}1 \\times 2^3 = 0{,}8\\,\\mathrm{mm}$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'عشر طيّات',
        question: 'اكتب سُمك الورقة بعد 10 طيّات على الشكل $0{,}1 \\times 2^n$ ثم احسبه.',
        asks: ['الأس', 'السُّمك'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['quwa-taarif'], prompt: 'الأس $n$ :', expected: 10,
            explain: 'كل طيّة عامل 2: عشر طيّات تعطي $2^{10}$ طبقة.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['awlawiya-quwa'], prompt: 'السُّمك بالميليمتر: $0{,}1 \\times 2^{10} =$', expected: 102.4, display: '102,4',
            explain: '$2^{10} = 1024$ ، و $0{,}1 \\times 1024 = 102{,}4\\,\\mathrm{mm}$ .' },
          { kind: 'solution', ask: 0, lines: [
            'بعد 10 طيّات: $0{,}1 \\times 2^{10}\\,\\mathrm{mm}$ .',
            '$2^{10} = 1024$ ، إذن السُّمك $102{,}4\\,\\mathrm{mm}$ ، أي أكثر من 10 cm .',
          ] },
        ],
      },
      {
        label: '3)', title: 'أكثر من متر',
        question: 'المتر $1000\\,\\mathrm{mm}$ . بعد كم طيّة يتجاوز سُمك الورقة المطويّة مترًا واحدًا؟',
        asks: ['عدد الطيّات'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['quwa-taarif'],
            prompt: 'يتجاوز السُّمك مترًا عندما $0{,}1 \\times 2^n > 1000$ ، أي:',
            options: ['$2^n > 10000$', '$2^n > 100$', '$n > 1000$'], correct: 0, cols: 3,
            explain: 'نضرب طرفي المتباينة في 10: $2^n > 10000$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['quwa-taarif'], prompt: 'أصغر عدد من الطيّات:', expected: 14,
            explain: '$2^{13} = 8192 < 10000$ و $2^{14} = 16384 > 10000$ : بعد 14 طيّة يصير السُّمك $1638{,}4\\,\\mathrm{mm}$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$2^{13} = 8192$ : السُّمك $819{,}2\\,\\mathrm{mm}$ أقلّ من متر.',
            '$2^{14} = 16384$ : السُّمك $1638{,}4\\,\\mathrm{mm}$ ، أكثر من متر — بعد 14 طيّة (نظريًا: ورقة حقيقية لا تُطوى كل هذا).',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — ثلاثة أعداد',
    context: 'قوة، أولويات، ومقارنة',
    emoji: '🧮',
    tone: 'emerald',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'العدد A', lines: [{ label: 'الأساس', value: '-2' }] }, { title: 'العدد B', lines: [{ label: 'فيه', value: '5^0' }] }, { title: 'العدد C', lines: [{ label: 'يقسم على', value: '10^4' }] }], ariaLabel: 'ثلاث بطاقات: العدد A أساسه −2، العدد B فيه 5 أس 0، والعدد C يُقسم على 10 أس 4' },
    statement: 'نعتبر الأعداد: $A = \\frac{(-2)^3 \\times (-2)^5}{(-2)^6}$ ؛ $B = 3 - 2 \\times (-1)^7 + 5^0$ ؛ $C = \\frac{(2^3 \\times 5^2)^2}{10^4}$ .',
    data: [
      { id: 'A', text: 'A حاصل قسمة قوى أساسها $-2$', useful: true },
      { id: 'B', text: 'B سلسلة عمليات فيها قوى', useful: true },
      { id: 'C', text: 'C قوة جداء مقسومة على $10^4$', useful: true },
    ],
    parts: [
      {
        label: '1)', title: 'العدد A',
        question: 'اكتب $A$ على الشكل $(-2)^n$ ثم احسبه.',
        asks: ['الأس n', 'قيمة A'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hasil-quwatayn'], prompt: 'الأس $n$ :', expected: 2,
            explain: 'البسط $(-2)^{3+5} = (-2)^8$ ، ثم $(-2)^{8-6} = (-2)^2$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['ishara-quwa'], prompt: '$A =$', expected: 4,
            explain: 'الأس زوجي: $(-2)^2 = 4$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$A = \\frac{(-2)^{3+5}}{(-2)^6} = (-2)^{8-6} = (-2)^2$ .',
            '$A = 4$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'العدد B',
        question: 'احسب $B$ .',
        asks: ['قيمة B'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['quwa-sifr'],
            prompt: '$(-1)^7$ و $5^0$ يساويان:',
            options: ['$-1$ و $1$', '$-7$ و $0$', '$1$ و $5$'], correct: 0, cols: 3,
            explain: '$(-1)^7 = -1$ (أس فردي)، و $5^0 = 1$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['awlawiya-quwa'], prompt: '$B =$', expected: 6,
            explain: '$B = 3 - 2 \\times (-1) + 1 = 3 + 2 + 1 = 6$ .' },
          { kind: 'solution', ask: 0, lines: [
            'القوى أوّلًا: $(-1)^7 = -1$ و $5^0 = 1$ .',
            'ثم الضرب ثم الجمع والطرح: $B = 3 - 2 \\times (-1) + 1 = 6$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'العدد C والمقارنة',
        question: 'احسب $C$ ، ثم قارن بين $A$ و $C$ .',
        asks: ['قيمة C', 'المقارنة'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['quwat-jidaa'], prompt: '$2^3 \\times 5^2 =$', expected: 200,
            explain: '$8 \\times 25 = 200$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['quwat-jidaa'], prompt: '$C =$', expected: 4,
            explain: '$C = \\frac{200^2}{10^4} = \\frac{40000}{10000} = 4$ .' },
          { kind: 'choice', role: 'conclude', ask: 1,
            prompt: 'المقارنة:', options: ['$A = C$', '$A < C$', '$A > C$'], correct: 0, cols: 3,
            explain: '$A = 4$ و $C = 4$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$C = \\frac{200^2}{10^4} = \\frac{40000}{10000} = 4$ .',
            '$A = C = 4$ .',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
