/**
 * Les trois « مسائل » du درس « جداء عددين نسبيين » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas
 * (GuidedProblem). La 1 est « مسألة الدرس » (`LESSON_CONFIG.lessonProblem`) : une nuit d'hiver à Sétif, la température baisse de
 * 2 °C par heure à partir de 0 °C à minuit — avant minuit le temps est négatif (la même idée que le film du labo, un autre monde) ;
 * la 2 un quiz scolaire (+3 / −2) où l'on annule des mauvaises réponses ; la 3 l'abonnement internet de la coopérative de l'école
 * (−350 DA par mois, le passé et le futur). Chaque nombre est vérifié dans ./problems.test.js en arithmétique EXACTE (BigInt).
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — ليلة شتوية في سطيف',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🌙',
    tone: 'indigo',
    source: SOURCE,
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'rate', text: 'تنخفض الحرارة بانتظام 2 درجة في كل ساعة', useful: true },
      { id: 'zero', text: 'الحرارة 0 درجة عند منتصف الليل', useful: true },
      { id: 'city', text: 'المدينة سطيف', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'بعد منتصف الليل',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['درجة الحرارة'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jidaa-jamaa'], prompt: 'الحرارة بالدرجات: $(-2) \\times 4 =$', expected: -8, display: '−8',
            explain: 'الانخفاض عدد سالب: $(-2) \\times 4 = (-2) + (-2) + (-2) + (-2) = -8$ .' },
          { kind: 'solution', ask: 0, lines: [
            'بعد 4 ساعات من منتصف الليل: $(-2) \\times 4 = -8$ .',
            'الحرارة عند الساعة 04:00 تساوي $-8^\\circ\\mathrm{C}$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'قبل منتصف الليل',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['درجة الحرارة'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['ishara-jidaa'],
            prompt: 'الساعة 21:00 قبل منتصف الليل بثلاث ساعات، أي الزمن $-3$ . الحرارة:',
            options: ['$(-2) \\times (-3)$', '$(-2) + (-3)$', '$(-2) \\times 3$'], correct: 0, cols: 1,
            explain: 'الحرارة = الانخفاض في الساعة × الزمن، والزمن قبل منتصف الليل سالب.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ishara-jidaa'], prompt: '$(-2) \\times (-3) =$', expected: 6,
            explain: 'للعددين الإشارة نفسها: الجداء موجب. كانت الحرارة أدفأ قبل أن تنخفض.' },
          { kind: 'solution', ask: 0, lines: [
            'عند 21:00 الزمن هو $-3$ : $(-2) \\times (-3) = 6$ .',
            'الحرارة عند الساعة 21:00 تساوي $6^\\circ\\mathrm{C}$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'متى كانت 5 درجات؟',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['الساعة'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tariqat-jidaa'],
            prompt: 'في أيّ ساعة كانت الحرارة $5^\\circ\\mathrm{C}$ ؟ (نتحقّق بحساب الجداء)',
            options: ['21:30', '02:30', '22:00', '19:00'], correct: 0, cols: 2,
            explain: 'الساعة 21:30 هي الزمن $-2{,}5$ : $(-2) \\times (-2{,}5) = 5$ . أمّا 02:30 فتعطي $(-2) \\times 2{,}5 = -5$ ، و 22:00 تعطي $4$ ، و 19:00 تعطي $10$ .' },
          { kind: 'solution', ask: 0, lines: [
            'نجرّب الزمن $-2{,}5$ (الساعة 21:30): $(-2) \\times (-2{,}5) = 5$ .',
            'الحرارة $5^\\circ\\mathrm{C}$ عند الساعة 21:30.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — مسابقة الأسئلة',
    context: 'نقاط موجبة وسالبة',
    emoji: '🏆',
    tone: 'sky',
    source: SOURCE,
    illustration: { kind: 'scene', icon: 'book', bg: 'blue', chips: [{ label: 'إجابة صحيحة', value: '+3', tone: 'green' }, { label: 'إجابة خاطئة', value: '−2', tone: 'rose' }, { label: 'سؤال ملغى', value: '؟', tone: 'amber' }], ariaLabel: 'مسابقة: ثلاث نقاط لكل إجابة صحيحة ونقطتان تُخصمان من كل إجابة خاطئة' },
    statement: 'نظّمت مكتبة المتوسطة مسابقة أسئلة في القراءة. تُمنح 3 نقاط عن كل إجابة صحيحة وتُخصم نقطتان عن كل إجابة خاطئة (نكتب الخصم عددًا سالبًا: $-2$ ).',
    data: [
      { id: 'plus', text: '+3 عن كل إجابة صحيحة', useful: true },
      { id: 'minus', text: '−2 عن كل إجابة خاطئة', useful: true },
      { id: 'lib', text: 'المسابقة في مكتبة المتوسطة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'نقاط سلمى',
        question: 'أجابت سلمى بـ 6 إجابات صحيحة و 4 إجابات خاطئة. ما مجموع نقاطها؟',
        asks: ['مجموع النقاط'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'compute', requires: ['tariqat-jidaa'], prompt: 'نقاط الإجابات الخاطئة: $4 \\times (-2) =$', expected: -8, display: '−8',
            explain: 'إشارتان مختلفتان: الجداء سالب، $4 \\times 2 = 8$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tariqat-jidaa'], prompt: 'المجموع: $6 \\times 3 + 4 \\times (-2) =$', expected: 10,
            explain: '$18 + (-8) = 10$ .' },
          { kind: 'solution', ask: 0, lines: ['$6 \\times 3 + 4 \\times (-2) = 18 - 8 = 10$ .', 'حصلت سلمى على 10 نقاط.'] },
        ],
      },
      {
        label: '2)', title: 'نقاط ياسين',
        question: 'أجاب ياسين بـ 5 إجابات صحيحة و 5 إجابات خاطئة. ما مجموع نقاطه؟',
        asks: ['مجموع النقاط'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tariqat-jidaa'], prompt: '$5 \\times 3 + 5 \\times (-2) =$', expected: 5,
            explain: '$15 + (-10) = 5$ .' },
          { kind: 'solution', ask: 0, lines: ['$5 \\times 3 + 5 \\times (-2) = 15 - 10 = 5$ .', 'حصل ياسين على 5 نقاط.'] },
        ],
      },
      {
        label: '3)', title: 'سؤالان ملغيان',
        question: 'ألغت اللجنة سؤالين أجاب عنهما ياسين خطأً. كيف تتغيّر نقطته؟ ما نقطته الجديدة؟',
        asks: ['التغيّر', 'النقطة الجديدة'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['ishara-jidaa'],
            prompt: 'إلغاء سؤالين خاطئين يعني أن نزيل الخصم مرّتين، أي نعدّ: $(-2) \\times (-2) =$',
            options: ['$4$ ، فتزيد نقطته 4', '$-4$ ، فتنقص نقطته 4', '$-2$ ، فتنقص نقطته 2'], correct: 0, cols: 1,
            explain: '$(-2) \\times (-2) = 4$ : إزالة خصمين تعطي $+4$ نقاط.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['ishara-jidaa'], prompt: 'نقطة ياسين الجديدة: $5 + 4 =$', expected: 9,
            explain: 'كان لياسين 5 نقاط، وأضفنا 4: يحصل على 9 نقاط. (تحقّق: $5 \\times 3 + 3 \\times (-2) = 15 - 6 = 9$ .)' },
          { kind: 'solution', ask: 0, lines: ['إزالة خصمين: $(-2) \\times (-2) = 4$ ، فتزيد النقطة بـ 4.', 'النقطة الجديدة: $5 + 4 = 9$ .'] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — اشتراك تعاونية المدرسة',
    context: 'الماضي والمستقبل',
    emoji: '🌐',
    tone: 'emerald',
    source: SOURCE,
    illustration: { kind: 'scene', icon: 'coin', bg: 'green', chips: [{ label: 'اشتراك الإنترنت', value: '−350', unit: 'DA', tone: 'rose' }, { label: 'كل', value: 'شهر', tone: 'blue' }, { label: 'الرصيد اليوم', value: 0, tone: 'slate' }], ariaLabel: 'تدفع التعاونية 350 دينارًا شهريًا لاشتراك الإنترنت، ورصيدها اليوم مرجع يساوي 0' },
    statement: 'تدفع تعاونية المدرسة 350 DA في كل شهر لاشتراك الإنترنت، فتسهّل على التلاميذ البحث عن دروسهم. نعتبر رصيدها اليوم مرجعًا يساوي 0 ، ونعبّر عن الدفع بعدد سالب: $-350\\,\\mathrm{DA}$ كل شهر. الأشهر بعد اليوم أعداد موجبة، والأشهر قبله أعداد سالبة.',
    data: [
      { id: 'fee', text: 'اشتراك الإنترنت −350 دينارًا كل شهر', useful: true },
      { id: 'ref', text: 'الرصيد اليوم مرجع يساوي 0', useful: true },
      { id: 'who', text: 'التعاونية مدرسية', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'بعد ثلاثة أشهر',
        question: 'ما تغيّر الرصيد بسبب الاشتراك بعد 3 أشهر؟',
        asks: ['التغيّر'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jidaa-jamaa'], prompt: '$(-350) \\times 3 =$', expected: -1050, display: '−1050',
            explain: 'جمع متكرر: $(-350) + (-350) + (-350) = -1050$ .' },
          { kind: 'solution', ask: 0, lines: ['$(-350) \\times 3 = -1050$ .', 'نقص الرصيد بـ 1050 DA.'] },
        ],
      },
      {
        label: '2)', title: 'قبل أربعة أشهر',
        question: 'كم كان رصيدها مقارنة باليوم قبل 4 أشهر؟',
        asks: ['الرصيد مقارنة باليوم'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ishara-jidaa'], prompt: 'قبل 4 أشهر الزمن هو $-4$ : $(-350) \\times (-4) =$', expected: 1400,
            explain: 'للعددين الإشارة نفسها: الجداء موجب. كان الرصيد قبل 4 أشهر أكبر بـ 1400 DA ممّا هو اليوم.' },
          { kind: 'solution', ask: 0, lines: ['$(-350) \\times (-4) = 1400$ .', 'كان رصيدها أكبر بـ 1400 DA.'] },
        ],
      },
      {
        label: '3)', title: 'متى يبلغ التغيّر −2450؟',
        question: 'بعد كم شهر يصير تغيّر الرصيد $-2450\\,\\mathrm{DA}$ ؟',
        asks: ['عدد الأشهر'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tariqat-jidaa'],
            prompt: 'عدد الأشهر الذي يعطي $(-350) \\times n = -2450$ هو (نتحقّق بحساب الجداء):',
            options: ['$7$', '$-7$', '$6$', '$8$'], correct: 0, cols: 2,
            explain: '$(-350) \\times 7 = -2450$ . أمّا $-7$ فيعطي $2450$ ، و $6$ يعطي $-2100$ ، و $8$ يعطي $-2800$ .' },
          { kind: 'solution', ask: 0, lines: ['$(-350) \\times 7 = -2450$ .', 'بعد 7 أشهر.'] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
