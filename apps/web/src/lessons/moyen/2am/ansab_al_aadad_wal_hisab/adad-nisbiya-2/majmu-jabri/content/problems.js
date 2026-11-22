/**
 * Les trois « مسائل » du درس « حساب مجموع جبري » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas
 * (GuidedProblem). La مسألة 1 est le plongeon d'un plongeur (`LESSON_CONFIG.lessonProblem`) ; la 2 une journée d'hiver à Sétif ; la 3 une
 * compétition culturelle entre équipes. Chaque nombre est vérifié dans ./problems.test.js en arithmétique EXACTE (BigInt). Chaque مسألة porte son
 * tableau (son support dessiné) ; jamais d'argent, jamais de pari.
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — غطسات الغوّاص',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🤿',
    tone: 'sky',
    source: SOURCE,
    table: LESSON_CONFIG.lessonProblem.table,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'الغوّاص يبدأ عند $-3\\,\\mathrm{m}$', useful: true },
      { id: 'd2', text: 'نزل $5\\,\\mathrm{m}$ ثم صعد $2\\,\\mathrm{m}$ ثم نزل $7\\,\\mathrm{m}$ ثم صعد $9\\,\\mathrm{m}$', useful: true },
      { id: 'd3', text: 'يغوص بجوار ميناء المدينة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'المجموع الجبري',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['المجموع الجبري'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tarh-ila-jam'], prompt: 'النزول عدد سالب والصعود عدد موجب. الموضع الأخير يساوي :',
            options: ['$(-3)+(-5)+(+2)+(-7)+(+9)$', '$(-3)+(+5)+(-2)+(+7)+(-9)$', '$(-3)-(+5)+(+2)+(-7)-(+9)$'], correct: 0, cols: 1,
            explain: 'كلّ تنقّل عدد يُضاف إلى الموضع: نزول $5$ هو $(-5)$ وصعود $2$ هو $(+2)$ وهكذا.' },
          { kind: 'solution', ask: 0, lines: ['نزول $5\\,\\mathrm{m}$ هو إضافة $(-5)$ ، وصعود $2\\,\\mathrm{m}$ هو إضافة $(+2)$ .', 'المجموع الجبري : $(-3)+(-5)+(+2)+(-7)+(+9)$ .'] },
        ],
      },
      {
        label: '2)', title: 'الموضع الأخير',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['الموضع الأخير'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tajmi-hudud'], prompt: 'الموجبة $(+2)+(+9)=(+11)$ والسالبة $(-3)+(-5)+(-7)=(-15)$ ، فالمجموع :', expected: -4,
            explain: '$(+11)+(-15)=(-4)$ : المسافتان $11$ و $15$ والأبعد عن الصفر $-15$ .' },
          { kind: 'solution', ask: 0, lines: ['نجمع الحدود الموجبة معًا: $(+2)+(+9)=(+11)$ .', 'ونجمع الحدود السالبة معًا: $(-3)+(-5)+(-7)=(-15)$ .', '$(+11)+(-15)=(-4)$ : الموضع الأخير $-4\\,\\mathrm{m}$ .'] },
        ],
      },
      {
        label: '3)', title: 'أعمق موضع',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['أعمق موضع'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tajmi-hudud'], prompt: 'بعد النزول الثاني: $(-3)+(-5)+(+2)+(-7)=$', expected: -13,
            explain: '$-3-5+2-7=-13$ : بعد الصعود الأخير يرتفع إلى $-4$ ، فأعمق نقطة هي $-13$ .' },
          { kind: 'solution', ask: 0, lines: ['المواضع المتتالية: $-3$ ، $-8$ ، $-6$ ، $-13$ ، $-4$ .', 'أعمقها $-13\\,\\mathrm{m}$ بعد النزول الثاني.'] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — يوم شتوي في سطيف',
    context: 'حرارة اليوم',
    emoji: '🌡️',
    tone: 'teal',
    source: SOURCE,
    statement: 'درجة الحرارة في سطيف عند الفجر $-5\\,{}^{\\circ}\\mathrm{C}$ ، ثم تغيّرت خلال اليوم بـ: $+3$ ثم $+6$ ثم $-2$ ثم $+4$ ثم $-8$ درجات.',
    table: { caption: 'حرارة الفجر وتغيّراتها بالدرجات', head: ['الفجر', 'التغيّر 1', 'التغيّر 2', 'التغيّر 3', 'التغيّر 4', 'التغيّر 5'], rows: [['-5', '+3', '+6', '-2', '+4', '-8']] },
    data: [
      { id: 'a', text: 'حرارة الفجر $-5\\,{}^{\\circ}\\mathrm{C}$', useful: true },
      { id: 'b', text: 'خمسة تغيّرات: $+3$ ، $+6$ ، $-2$ ، $+4$ ، $-8$', useful: true },
      { id: 'c', text: 'تقع المدينة في الهضاب العليا', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الكتابة المبسّطة',
        question: 'اكتب الشكل المبسّط للمجموع الجبري الذي يعطي حرارة آخر اليوم.',
        asks: ['الكتابة المبسّطة'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['kitaba-mubassata'], prompt: 'حرارة آخر اليوم تساوي :',
            options: ['$-5+3+6-2+4-8$', '$5+3+6+2+4+8$', '$-5-3-6+2-4+8$'], correct: 0, cols: 1,
            explain: 'نحذف إشارة الجمع والأقواس ونحتفظ بإشارة كلّ عدد: $-5+3+6-2+4-8$ .' },
          { kind: 'solution', ask: 0, lines: ['حرارة الفجر $-5$ ثم تغيّرات $+3$ ، $+6$ ، $-2$ ، $+4$ ، $-8$ .', 'الكتابة المبسّطة: $-5+3+6-2+4-8$ .'] },
        ],
      },
      {
        label: '2)', title: 'حرارة آخر اليوم',
        question: 'احسب حرارة آخر اليوم.',
        asks: ['حرارة آخر اليوم'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tajmi-hudud'], prompt: 'الموجبة $3+6+4=13$ والسالبة $-(5+2+8)=-15$ ، فالحرارة :', expected: -2,
            explain: '$13+(-15)=-2$ : الحرارة في آخر اليوم $-2\\,{}^{\\circ}\\mathrm{C}$ .' },
          { kind: 'solution', ask: 0, lines: ['الحدود الموجبة: $3+6+4=13$ .', 'الحدود السالبة: $-5-2-8=-15$ .', '$13+(-15)=-2$ ، فالحرارة $-2\\,{}^{\\circ}\\mathrm{C}$ .'] },
        ],
      },
      {
        label: '3)', title: 'جمع التغيّرات أوّلًا',
        question: 'هل نحصل على النتيجة نفسها إذا جمعنا التغيّرات الخمسة أوّلًا ثم أضفنا ناتجها إلى حرارة الفجر؟',
        asks: ['الجواب'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['naql-tajmi'], prompt: 'مجموع التغيّرات $3+6-2+4-8$ يساوي $+3$ .', options: ['نعم: $-5+3=-2$ وهي النتيجة نفسها', 'لا: الترتيب يغيّر الناتج', 'نعم، لكنّ الناتج $+3$'], correct: 0, cols: 1,
            explain: 'يمكن تغيير ترتيب الحدود وتجميعها دون أن يتغيّر الناتج: $-5+3=-2$ .' },
          { kind: 'solution', ask: 0, lines: ['مجموع التغيّرات $3+6-2+4-8=+3$ .', '$-5+3=-2$ : النتيجة نفسها، فالتجميع لا يغيّر الناتج.'] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — حصيلة جولتين',
    context: 'مسابقة ثقافية',
    emoji: '🏆',
    tone: 'emerald',
    source: SOURCE,
    statement: 'في مسابقة ثقافية بين فرق المدرسة، حصيلة الفريق أ هي $A=(-6)+(-9)$ ، وحصيلة الفريق ج هي $C=(+4)-(-18)+(-7)$ ، وحصيلة الحكَم هي $S=(+20)-[(+12)-(-5)]+(-3)$ .',
    table: { caption: 'العبارات التي تعطي الحصائل', head: ['الفريق أ', 'الفريق ج', 'الحكَم'], rows: [['(-6)+(-9)', '(+4)-(-18)+(-7)', '(+20)-[(+12)-(-5)]+(-3)']] },
    data: [
      { id: 'a', text: 'حصيلة الفريق أ: $(-6)+(-9)$', useful: true },
      { id: 'b', text: 'حصيلة الفريق ج: $(+4)-(-18)+(-7)$', useful: true },
      { id: 'c', text: 'تقام المسابقة في قاعة المحاضرات', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'حصيلة الفريق أ',
        question: 'احسب حصيلة الفريق أ.',
        asks: ['الحصيلة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qaidat-majmu-jabri'], prompt: '$A=(-6)+(-9)=$', expected: -15,
            explain: 'الإشارتان متّفقتان: $6+9=15$ ونحتفظ بالإشارة $-$ .' },
          { kind: 'solution', ask: 0, lines: ['العددان سالبان: نجمع المسافتين $6+9=15$ .', '$A=(-15)$ .'] },
        ],
      },
      {
        label: '2)', title: 'حصيلة الفريق ج',
        question: 'احسب حصيلة الفريق ج.',
        asks: ['الحصيلة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tarh-ila-jam'], prompt: '$C=(+4)-(-18)+(-7)=$', expected: 15,
            explain: '$C=(+4)+(+18)+(-7)$ : الموجبة $22$ والسالبة $-7$ ، والناتج $+15$ .' },
          { kind: 'solution', ask: 0, lines: ['نحوّل الطرح إلى جمع المعاكس: $C=(+4)+(+18)+(-7)$ .', 'الموجبة $22$ والسالبة $-7$ : $C=(+15)$ .'] },
        ],
      },
      {
        label: '3)', title: 'مجموع الحصيلتين',
        question: 'بيّن أنّ $A+C=0$ .',
        asks: ['البيان'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['hadhf-mutaakisayn'], prompt: '$A=(-15)$ و $C=(+15)$ :', options: ['متعاكسان فمجموعهما $0$', 'متساويان فمجموعهما $30$', 'متعاكسان فمجموعهما $30$'], correct: 0, cols: 1,
            explain: 'لهما المسافة نفسها $15$ إلى الصفر وإشارتان مختلفتان، فمجموعهما $0$ .' },
          { kind: 'solution', ask: 0, lines: ['$A=(-15)$ و $C=(+15)$ متعاكسان.', 'إذن $A+C=(-15)+(+15)=0$ .'] },
        ],
      },
      {
        label: '4)', title: 'حصيلة الحكَم',
        question: 'احسب حصيلة الحكَم $S$ .',
        asks: ['الحصيلة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tariqat-aqwas-awwalan'], prompt: '$S=(+20)-[(+12)-(-5)]+(-3)=$', expected: 0,
            explain: 'ما بين القوسين أوّلًا: $(+12)-(-5)=(+17)$ ، ثم $20-17-3=0$ .' },
          { kind: 'solution', ask: 0, lines: ['نحسب ما بين القوسين أوّلًا: $(+12)-(-5)=(+12)+(+5)=(+17)$ .', '$S=(+20)-(+17)+(-3)=20-17-3=0$ .'] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
