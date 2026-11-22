/**
 * Les trois « مسائل » du درس « حاصل القسمة والكسر » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas
 * (GuidedProblem). La مسألة 1 (`LESSON_CONFIG.lessonProblem`, ajout de la plateforme « على منوال » 1am-s2-72 ex 1 ③ et ex 3 ④ : un
 * quotient non décimal, le facteur manquant) ; la 2 est أتعمّق 2 (p. 60, « تحقق من نتيجة ») ; la 3 est une مسألة de la plateforme
 * (13 mètres de ruban en 8 morceaux : 13/8 = 1,625, un quotient décimal). Chaque nombre est vérifié dans ./problems.test.js.
 */
import { src, addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — عصير نهاية السنة',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🧃',
    tone: 'indigo',
    source: addition('exam_style_problem'),
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'liters', text: '7 لترات من العصير', useful: true },
      { id: 'bottles', text: '3 قارورات متماثلة', useful: true },
      { id: 'equal', text: 'يُصبّ العصير بالتساوي', useful: true },
      { id: 'hour', text: 'يبدأ الحفل على الساعة 10', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'حصّة القارورة',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['كمية العصير في قارورة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['kasr-hasil-qisma'],
            prompt: 'كمية العصير في قارورة واحدة هي حاصل قسمة:',
            options: ['7 على 3', '3 على 7', '7 ضرب 3'],
            correct: 0,
            explain: 'نوزّع 7 لترات على 3 قارورات: $7\\div 3$.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['kasr-hasil-qisma'],
            prompt: 'نكتب هذه الكمية على شكل كسر:',
            options: ['$\\frac{7}{3}$ لتر', '$\\frac{3}{7}$ لتر', '$7{,}3$ لتر'],
            correct: 0, cols: 1,
            explain: '$7\\div 3=\\frac{7}{3}$ : البسط هو المقسوم والمقام هو المقسوم عليه.' },
          { kind: 'solution', ask: 0, lines: [
            'كمية العصير في كل قارورة هي حاصل قسمة 7 على 3.',
            '$7\\div 3=\\frac{7}{3}$ لتر.',
          ] },
        ],
      },
      {
        label: '2)', title: 'العدد الناقص',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['العدد الناقص', 'ناتج الضرب'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['natija-darb'],
            prompt: '$3\\times\\ldots=7$ ، العدد الناقص هو:',
            options: ['$\\frac{7}{3}$', '$\\frac{3}{7}$', '4'],
            correct: 0,
            explain: 'العدد الذي إذا ضُرب في 3 أعطى 7 هو $\\frac{7}{3}$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['natija-darb'], prompt: '$\\frac{7}{3}\\times 3=\\ldots$ لتر', expected: 7, suffix: 'لتر',
            explain: 'ثلاث قارورات في كل منها $\\frac{7}{3}$ لتر تحوي 7 لترات.' },
          { kind: 'solution', ask: 0, lines: [
            '$3\\times\\frac{7}{3}=7$ : العدد الناقص في $3\\times\\ldots=7$ هو $\\frac{7}{3}$.',
            'والقارورات الثلاث تحوي معا $\\frac{7}{3}\\times 3=7$ لترات.',
          ] },
        ],
      },
      {
        label: '3)', title: 'هل هو عدد عشري؟',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['هل $\\frac{7}{3}$ عدد عشري؟', 'القيمة المقرّبة'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['ashri-ghayr-ashri'],
            prompt: 'القسمة العشرية لـ 7 على 3 تعطي $2{,}333\\ldots$ فالكسر $\\frac{7}{3}$:',
            options: ['ليس عددًا عشريًا لأنّ القسمة لا تنتهي', 'عدد عشري هو 2,33', 'عدد عشري هو 2,3'],
            correct: 0, cols: 1,
            explain: 'لو كان 2,33 مضبوطا لكان $3\\times 2{,}33=7$ ، لكنّه $6{,}99$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['ashri-ghayr-ashri'], prompt: 'قيمة مقرّبة بالنقصان إلى 0,01:', expected: 2.33, display: '2,33',
            explain: '$2{,}33<\\frac{7}{3}<2{,}34$.' },
          { kind: 'solution', ask: 0, lines: [
            '$7\\div 3=2{,}333\\ldots$ لا تنتهي: $\\frac{7}{3}$ ليس عددًا عشريًا.',
            '$2{,}33$ قيمة مقرّبة بالنقصان إلى 0,01، و $\\frac{7}{3}$ هي القيمة المضبوطة.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — تحقّق من نتيجة',
    context: 'أتعمّق',
    emoji: '🔎',
    tone: 'emerald',
    source: src('deep-2', 60, 'أتعمّق', 2),
    illustration: { kind: 'tags', cards: [{ title: 'قسمة فاطمة', icon: 'pen', lines: [{ label: 'المقسوم', value: '382,00' }, { label: 'المقسوم عليه', value: 14 }, { label: 'الحاصل', value: '27,28' }] }], ariaLabel: 'بطاقة قسمة فاطمة: المقسوم 382,00 والمقسوم عليه 14 والحاصل 27,28' },
    statement: 'لحساب $38{,}2\\div 1{,}4$ أجرت فاطمة القسمة العشرية: $382{,}00$ على 14، فوجدت الحاصل $27{,}28$ والباقي المكتوب 08. ولكي تتأكد كتبت: $27{,}28\\times 14+8$.',
    data: [
      { id: 'dividend', text: 'المقسوم 382,00', useful: true },
      { id: 'divisor', text: 'المقسوم عليه 14', useful: true },
      { id: 'quotient', text: 'الحاصل 27,28 والباقي المكتوب 08', useful: true },
      { id: 'pages', text: 'الدفتر من 96 صفحة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الخاصية',
        question: 'ما هي الخاصية التي أرادت فاطمة تطبيقها؟',
        asks: ['الخاصية'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['natija-darb'],
            prompt: 'للتأكّد من قسمة نفعل:',
            options: ['المقسوم = المقسوم عليه × الحاصل + الباقي', 'المقسوم = الحاصل ÷ المقسوم عليه', 'المقسوم = الحاصل + الباقي'],
            correct: 0, cols: 1,
            explain: 'الضرب يعكس القسمة: $a=b\\times q+r$.' },
          { kind: 'solution', ask: 0, lines: ['الخاصية: المقسوم = المقسوم عليه × الحاصل + الباقي.', 'نتحقّق بحساب $14\\times 27{,}28+r$.'] },
        ],
      },
      {
        label: '2)', title: 'الحساب',
        question: 'احسب $27{,}28\\times 14+8$.',
        asks: ['الناتج'],
        steps: [
          { kind: 'numeric', role: 'compute', prompt: '$27{,}28\\times 14=\\ldots$', expected: 381.92, display: '381,92', explain: '$27{,}28\\times 14=381{,}92$.' },
          { kind: 'numeric', role: 'answer', ask: 0, prompt: '$27{,}28\\times 14+8=\\ldots$', expected: 389.92, display: '389,92', explain: '$381{,}92+8=389{,}92$.' },
          { kind: 'solution', ask: 0, lines: ['$27{,}28\\times 14=381{,}92$.', '$381{,}92+8=389{,}92$.'] },
        ],
      },
      {
        label: '3)', title: 'خيبة الأمل',
        question: 'أصابت فاطمة خيبة أمل: ماذا كانت تأمل أن تجد؟ أين الخطأ؟',
        asks: ['ما كانت تأمل أن تجد؟', 'أين الخطأ؟'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, prompt: 'كانت تأمل أن تجد المقسوم:', expected: 382, explain: 'المقسوم هو $382$.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['natija-darb'],
            prompt: 'الخطأ هو أنّ الباقي:',
            options: ['هو 0,08 وليس 8: $27{,}28\\times 14+0{,}08=382$', 'هو 80', 'هو 0,8'],
            correct: 0, cols: 1,
            explain: 'الرقم 8 في الخانة الثانية بعد الفاصلة: ثمانية أجزاء من مئة.' },
          { kind: 'solution', ask: 0, lines: ['كانت تأمل أن تجد 382، المقسوم.', 'الباقي هو 0,08 (أجزاء من مئة) لا 8: $381{,}92+0{,}08=382$.'] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — شريط الإهداء',
    context: 'لا نُبذّر',
    emoji: '🎀',
    tone: 'violet',
    source: addition('exam_style_problem'),
    illustration: { kind: 'tags', cards: [{ title: 'الشريط', icon: 'pen', lines: [{ label: 'الطول بالأمتار', value: 13 }, { label: 'عدد القطع', value: 8 }] }], ariaLabel: 'بطاقة الشريط: طوله 13 مترا يقطع إلى 8 قطع متقايسة' },
    statement: 'عند تحضير هدايا العيد، لم ترغب منال في تبذير الشريط: قطعت شريطا طوله 13 مترا إلى 8 قطع متقايسة، ولم يبقَ منه شيء. ثمن المتر الواحد من الشريط 90 دج.',
    data: [
      { id: 'len', text: 'طول الشريط 13 مترا', useful: true },
      { id: 'pieces', text: 'قطع الشريط 8 قطع متقايسة', useful: true },
      { id: 'nothing', text: 'لم يبقَ منه شيء', useful: true },
      { id: 'price', text: 'ثمن المتر الواحد 90 دج', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'طول القطعة',
        question: 'اكتب على شكل كسر طول القطعة الواحدة بالأمتار.',
        asks: ['طول القطعة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['kasr-hasil-qisma'],
            prompt: 'طول القطعة الواحدة بالأمتار:',
            options: ['$\\frac{13}{8}$', '$\\frac{8}{13}$', '$13\\times 8$'],
            correct: 0,
            explain: '$13\\div 8=\\frac{13}{8}$.' },
          { kind: 'solution', ask: 0, lines: ['طول القطعة هو حاصل قسمة 13 على 8.', '$13\\div 8=\\frac{13}{8}$ متر.'] },
        ],
      },
      {
        label: '2)', title: 'العدد الناقص',
        question: 'أكمل $\\ldots\\times 8=13$ ، ثم احسب طول القطع الثماني معا.',
        asks: ['العدد الناقص', 'طول القطع الثماني'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['natija-darb'],
            prompt: '$\\ldots\\times 8=13$ ، العدد الناقص:',
            options: ['$\\frac{13}{8}$', '$\\frac{8}{13}$', '5'],
            correct: 0,
            explain: '$\\frac{13}{8}\\times 8=13$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['natija-darb'], prompt: '$8\\times\\frac{13}{8}=\\ldots$ متر', expected: 13, suffix: 'م', explain: 'القطع الثماني هي الشريط كله: 13 مترا.' },
          { kind: 'solution', ask: 0, lines: ['$\\frac{13}{8}\\times 8=13$ : العدد الناقص $\\frac{13}{8}$.', 'ثماني قطع طول كل منها $\\frac{13}{8}$ م تعطي 13 م.'] },
        ],
      },
      {
        label: '3)', title: 'الكتابة العشرية',
        question: 'هل $\\frac{13}{8}$ عدد عشري؟ اكتب كتابته العشرية.',
        asks: ['هل هو عدد عشري؟', 'الكتابة العشرية'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['ashri-ghayr-ashri'],
            prompt: 'القسمة العشرية لـ 13 على 8:',
            options: ['تنتهي: $\\frac{13}{8}$ عدد عشري', 'لا تنتهي: ليس عددا عشريا', 'لا يمكن إجراؤها'],
            correct: 0, cols: 1,
            explain: '$13\\div 8=1{,}625$ و $8\\times 1{,}625=13$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['ashri-ghayr-ashri'], prompt: 'الكتابة العشرية:', expected: 1.625, display: '1,625', explain: '$\\frac{13}{8}=1{,}625$ متر.' },
          { kind: 'solution', ask: 0, lines: ['$13\\div 8=1{,}625$: القسمة تنتهي، فالكسر عدد عشري.', '$\\frac{13}{8}=1{,}625$ متر.'] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
