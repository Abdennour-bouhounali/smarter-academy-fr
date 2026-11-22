/**
 * Les trois « مسائل » du درس « الكتابة العلمية ورتبة القدر » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas (GuidedProblem).
 * La مسألة 1 « ألكوم سات 1 » est la مسألة du درس (`LESSON_CONFIG.lessonProblem`) : l'altitude du satellite algérien, son écriture scientifique, son encadrement, le temps que met le signal
 * pour descendre et le rang de grandeur de ce temps ; la 2 « تحت المجهر » le grain de pollen, la bactérie et le virus ; la 3 le devoir de fin de trimestre (A et B : écriture scientifique,
 * encadrement, rangs de grandeur, rang de grandeur du produit). Chaque nombre est vérifié dans ./problems.test.js en arithmétique EXACTE (BigInt). Les grandeurs réelles sont introduites
 * par « حوالي ». Les cartes « illustration » sont des étiquettes (`tags`) : le manuel de la plateforme n'a pas d'icône de satellite.
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — ألكوم سات 1',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🛰️',
    tone: 'indigo',
    source: SOURCE,
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'الارتفاع حوالي 36 000 كم', useful: true },
      { id: 'd2', text: 'السرعة حوالي 3 × 10⁸ م في الثانية', useful: true },
      { id: 'd3', text: 'القمر فوق خط الاستواء', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الارتفاع بالمتر',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['العدد $a$', 'الأسّ $n$'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['kitaba-ilmiya'], prompt: '$36\\,000\\ \\mathrm{km} = 36\\,000\\,000\\ \\mathrm{m} = a \\times 10^{n}\\ \\mathrm{m}$ : $a =$', expected: 3.6, display: '3,6',
            explain: 'العدد $a$ من 1 إلى أقل من 10 : نُزيح الفاصلة حتى يبقى رقم واحد قبلها فنجد $3{,}6$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['kitaba-ilmiya'], prompt: 'والأسّ $n =$', expected: 7,
            explain: 'أزحنا الفاصلة سبع رتب نحو اليسار، فالأسّ $7$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$1\\ \\mathrm{km} = 1\\,000\\ \\mathrm{m}$ ، إذن الارتفاع $36\\,000\\ \\mathrm{km} = 36\\,000\\,000\\ \\mathrm{m}$ .',
            '$36\\,000\\,000 = 3{,}6 \\times 10^{7}$ : العدد $3{,}6$ من 1 إلى أقل من 10 ، فهذه هي الكتابة العلمية.',
          ] },
        ],
      },
      {
        label: '2)', title: 'الحصر',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['الأسّ $n$'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hasr-quwatayn'], prompt: '$10^{n} \\le 36\\,000\\,000 < 10^{n+1}$ : $n =$', expected: 7,
            explain: 'الحصر يُقرأ من الأسّ في الكتابة العلمية $3{,}6 \\times 10^{7}$ : $n = 7$ .' },
          { kind: 'solution', ask: 0, lines: [
            'الكتابة العلمية للارتفاع هي $3{,}6 \\times 10^{7}\\ \\mathrm{m}$ .',
            'إذن $10^{7} \\le 36\\,000\\,000 < 10^{8}$ : الارتفاع بين $10^{7}\\ \\mathrm{m}$ و $10^{8}\\ \\mathrm{m}$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'زمن الإشارة',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['الزمن بالثانية'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['kitaba-ilmiya'], prompt: '$\\frac{3{,}6 \\times 10^{7}}{3 \\times 10^{8}} =$', expected: 0.12, display: '0,12',
            explain: '$\\frac{3{,}6}{3} = 1{,}2$ و $\\frac{10^{7}}{10^{8}} = 10^{-1}$ ، إذن $1{,}2 \\times 10^{-1} = 0{,}12$ ثانية.' },
          { kind: 'solution', ask: 0, lines: [
            'الزمن $= \\frac{\\text{المسافة}}{\\text{السرعة}} = \\frac{3{,}6 \\times 10^{7}}{3 \\times 10^{8}}$ .',
            '$\\frac{3{,}6}{3} = 1{,}2$ و $10^{7 - 8} = 10^{-1}$ ، إذن الزمن $1{,}2 \\times 10^{-1} = 0{,}12$ ثانية.',
          ] },
        ],
      },
      {
        label: '4)', title: 'رتبة القدر',
        question: LESSON_CONFIG.lessonProblem.questions[3].text,
        asks: ['العدد $a\'$'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['rutbat-qadr'], prompt: 'رتبة قدر $1{,}2 \\times 10^{-1}$ هي $a\' \\times 10^{-1}$ : $a\' =$', expected: 1,
            explain: 'مدوّر $1{,}2$ إلى الوحدة هو $1$ .' },
          { kind: 'solution', ask: 0, lines: [
            'الزمن $1{,}2 \\times 10^{-1}$ ثانية، و $1{,}2$ أقرب إلى $1$ منه إلى $2$ .',
            'رتبة قدر هذا الزمن $1 \\times 10^{-1}$ ثانية، أي عُشر ثانية تقريبًا.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — تحت المجهر',
    context: 'مخبر المتوسطة',
    emoji: '🔬',
    tone: 'sky',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'حبّة طلع', lines: [{ label: 'قطرها', value: '0,000025 م' }] }, { title: 'بكتيريا', lines: [{ label: 'طولها', value: '0,000002 م' }] }, { title: 'فيروس', lines: [{ label: 'قطره', value: '0,00000012 م' }] }], ariaLabel: 'ثلاث بطاقات: حبّة طلع قطرها 0,000025 متر، وبكتيريا طولها 0,000002 متر، وفيروس قطره 0,00000012 متر' },
    statement: 'في مخبر المتوسطة نرى تحت المجهر حبّة طلع قطرها حوالي $0{,}000025\\ \\mathrm{m}$ ، وبكتيريا طولها حوالي $0{,}000002\\ \\mathrm{m}$ ، وفيروسًا قطره حوالي $0{,}00000012\\ \\mathrm{m}$ .',
    data: [
      { id: 'pollen', text: 'حبّة الطلع: 0,000025 م', useful: true },
      { id: 'bact', text: 'البكتيريا: 0,000002 م', useful: true },
      { id: 'virus', text: 'الفيروس: 0,00000012 م', useful: true },
      { id: 'lab', text: 'المجهر في مخبر المتوسطة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الكتابة العلمية',
        question: 'اكتب كلًّا من الأطوال الثلاثة كتابة علمية: عيّن الأسّ في كل كتابة.',
        asks: ['أسّ حبّة الطلع', 'أسّ البكتيريا', 'أسّ الفيروس'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['kitaba-ilmiya'], prompt: '$0{,}000025 = 2{,}5 \\times 10^{n}$ : $n =$', expected: -5,
            explain: 'نُزيح الفاصلة خمس رتب نحو اليمين: $n = -5$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['kitaba-ilmiya'], prompt: '$0{,}000002 = 2 \\times 10^{n}$ : $n =$', expected: -6,
            explain: 'ست رتب نحو اليمين: $n = -6$ .' },
          { kind: 'numeric', role: 'answer', ask: 2, requires: ['kitaba-ilmiya'], prompt: '$0{,}00000012 = 1{,}2 \\times 10^{n}$ : $n =$', expected: -7,
            explain: 'سبع رتب نحو اليمين: $n = -7$ .' },
          { kind: 'solution', ask: 0, lines: [
            'حبّة الطلع: $0{,}000025\\ \\mathrm{m} = 2{,}5 \\times 10^{-5}\\ \\mathrm{m}$ .',
            'البكتيريا: $2 \\times 10^{-6}\\ \\mathrm{m}$ ؛ والفيروس: $1{,}2 \\times 10^{-7}\\ \\mathrm{m}$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'الترتيب',
        question: 'رتّب هذه الأجسام من الأصغر إلى الأكبر.',
        asks: ['الترتيب'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['muqarana-ilmiya'],
            prompt: 'الترتيب التصاعدي هو:',
            options: ['الفيروس ثم البكتيريا ثم حبّة الطلع', 'حبّة الطلع ثم البكتيريا ثم الفيروس', 'البكتيريا ثم الفيروس ثم حبّة الطلع'], correct: 0, cols: 1,
            explain: 'الأسّان $-7 < -6 < -5$ : نقارن الأسّين أوّلًا فنجد الفيروس أصغرها ثم البكتيريا ثم حبّة الطلع.' },
          { kind: 'solution', ask: 0, lines: [
            'الأسّان: $-7$ للفيروس و $-6$ للبكتيريا و $-5$ لحبّة الطلع، والأصغر أسّه الأصغر.',
            'الترتيب التصاعدي: الفيروس < البكتيريا < حبّة الطلع.',
          ] },
        ],
      },
      {
        label: '3)', title: 'عدد البكتيريا',
        question: 'كم بكتيريا، وضعت جنبًا إلى جنب، تغطي قطر حبّة الطلع؟ أعط رتبة قدر النتيجة.',
        asks: ['عدد البكتيريا', 'الأسّ في رتبة القدر'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tariqa-ilmiya'], prompt: '$\\frac{2{,}5 \\times 10^{-5}}{2 \\times 10^{-6}} =$', expected: 12.5, display: '12,5',
            explain: '$\\frac{2{,}5}{2} = 1{,}25$ و $\\frac{10^{-5}}{10^{-6}} = 10$ ، إذن $12{,}5$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['rutbat-qadr'], prompt: '$12{,}5 = 1{,}25 \\times 10^{1}$ ، ورتبة قدره $1 \\times 10^{n}$ : $n =$', expected: 1,
            explain: 'مدوّر $1{,}25$ إلى الوحدة هو $1$ ، والأسّ يبقى $1$ .' },
          { kind: 'solution', ask: 0, lines: [
            'عدد البكتيريا $= \\frac{2{,}5 \\times 10^{-5}}{2 \\times 10^{-6}} = 1{,}25 \\times 10^{-5-(-6)} = 12{,}5$ .',
            '$12{,}5 = 1{,}25 \\times 10^{1}$ ، ورتبة قدره $1 \\times 10^{1} = 10$ : حوالي عشر بكتيريات.',
          ] },
        ],
      },
      {
        label: '4)', title: 'حصر الفيروس',
        question: 'أعط حصرًا لقطر الفيروس بين قوتين متتاليتين للعدد 10 .',
        asks: ['الأسّ $n$'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hasr-quwatayn'], prompt: '$10^{n} \\le 0{,}00000012 < 10^{n+1}$ : $n =$', expected: -7,
            explain: 'الكتابة العلمية $1{,}2 \\times 10^{-7}$ ، فالأسّ $n = -7$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$0{,}00000012 = 1{,}2 \\times 10^{-7}$ .',
            'إذن $10^{-7} \\le 0{,}00000012 < 10^{-6}$ : القطر بين $10^{-7}\\ \\mathrm{m}$ و $10^{-6}\\ \\mathrm{m}$ .',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — على منوال اختبار الفصل',
    context: 'تمرين من اختبار الفصل',
    emoji: '📝',
    tone: 'emerald',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'العدد A', lines: [{ label: 'تعريفه', value: '(2,4 × 10⁻³ × 5 × 10⁸) ÷ (3 × 10²)' }] }, { title: 'العدد B', lines: [{ label: 'تعريفه', value: '0,000325 × 10⁹' }] }], ariaLabel: 'بطاقتان: العدد A حاصل قسمة 2,4 × 10 أس سالب 3 في 5 × 10 أس 8 على 3 × 10 أس 2 ، والعدد B جداء 0,000325 في 10 أس 9' },
    statement: 'إليك العددين $A = \\frac{2{,}4 \\times 10^{-3} \\times 5 \\times 10^{8}}{3 \\times 10^{2}}$ و $B = 0{,}000325 \\times 10^{9}$ .',
    data: [
      { id: 'a', text: 'A = (2,4 × 10⁻³ × 5 × 10⁸) ÷ (3 × 10²)', useful: true },
      { id: 'b', text: 'B = 0,000325 × 10⁹', useful: true },
      { id: 'c', text: 'التمرين من اختبار الفصل', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الكتابة العلمية',
        question: 'اكتب كلًّا من $A$ و $B$ كتابة علمية: عيّن الأسّ في كل منهما.',
        asks: ['أسّ $A$', 'أسّ $B$'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hisab-ilmiya'], prompt: '$A = 4 \\times 10^{n}$ : $n =$', expected: 3,
            explain: '$\\frac{2{,}4 \\times 5}{3} = 4$ و $-3 + 8 - 2 = 3$ ، إذن $A = 4 \\times 10^{3}$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['tariqa-ilmiya'], prompt: '$B = 3{,}25 \\times 10^{n}$ : $n =$', expected: 5,
            explain: '$0{,}000325 = 3{,}25 \\times 10^{-4}$ ، ثم $10^{-4} \\times 10^{9} = 10^{5}$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$A = \\frac{2{,}4 \\times 5}{3} \\times 10^{-3+8-2} = 4 \\times 10^{3}$ ، والعدد 4 من 1 إلى أقل من 10 .',
            '$B = 3{,}25 \\times 10^{-4} \\times 10^{9} = 3{,}25 \\times 10^{5}$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'حصر B',
        question: 'أعط حصرًا للعدد $B$ بين قوتين متتاليتين للعدد 10 .',
        asks: ['الأسّ $n$'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hasr-quwatayn'], prompt: '$10^{n} \\le B < 10^{n+1}$ : $n =$', expected: 5,
            explain: 'الأسّ في الكتابة العلمية $3{,}25 \\times 10^{5}$ هو $5$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$B = 3{,}25 \\times 10^{5}$ .',
            'إذن $10^{5} \\le B < 10^{6}$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'رتبتا القدر',
        question: 'أعط رتبة قدر كل من $A$ و $B$ .',
        asks: ['رتبة قدر $B$', 'رتبة قدر $A$'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['rutbat-qadr'], prompt: 'رتبة قدر $B = 3{,}25 \\times 10^{5}$ هي $a\' \\times 10^{5}$ : $a\' =$', expected: 3,
            explain: 'مدوّر $3{,}25$ إلى الوحدة هو $3$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['rutbat-qadr'], prompt: 'رتبة قدر $A = 4 \\times 10^{3}$ هي $a\' \\times 10^{3}$ : $a\' =$', expected: 4,
            explain: 'العدد $4$ عدد صحيح فمدوّره $4$ نفسه.' },
          { kind: 'solution', ask: 0, lines: [
            'رتبة قدر $B$ هي $3 \\times 10^{5}$ لأنّ مدوّر $3{,}25$ إلى الوحدة هو $3$ .',
            'ورتبة قدر $A$ هي $4 \\times 10^{3}$ لأنّ $A = 4 \\times 10^{3}$ .',
          ] },
        ],
      },
      {
        label: '4)', title: 'رتبة قدر الجداء',
        question: 'أعط رتبة قدر الجداء $A \\times B$ .',
        asks: ['الأسّ في رتبة القدر'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['rutbat-qadr'], prompt: '$A \\times B = 13 \\times 10^{8} = 1{,}3 \\times 10^{9}$ ، ورتبة قدره $1 \\times 10^{n}$ : $n =$', expected: 9,
            explain: '$4 \\times 3{,}25 = 13$ و $10^{3} \\times 10^{5} = 10^{8}$ ، ثم $13 \\times 10^{8} = 1{,}3 \\times 10^{9}$ ؛ ومدوّر $1{,}3$ هو $1$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$A \\times B = 4 \\times 3{,}25 \\times 10^{3+5} = 13 \\times 10^{8}$ ، وهي ليست كتابة علمية لأنّ $13 \\ge 10$ .',
            '$13 \\times 10^{8} = 1{,}3 \\times 10^{9}$ ، ورتبة القدر $1 \\times 10^{9}$ .',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
