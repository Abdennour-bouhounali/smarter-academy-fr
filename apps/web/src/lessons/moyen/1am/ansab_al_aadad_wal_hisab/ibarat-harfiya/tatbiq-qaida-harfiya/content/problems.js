/**
 * Les trois « مسائل » du درس « تطبيق قاعدة حرفية » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas (GuidedProblem). La مسألة 1 est `LESSON_CONFIG.lessonProblem`
 * (la sortie scolaire : une règle de coût avec une partie fixe, deux nombres d'élèves, puis « si le nombre double, le coût double-t-il ? »), la 2 la règle de la clôture P = 2 × (a + b) pour DEUX jardins
 * (même périmètre pour des dimensions différentes) et le prix du grillage, la 3 la comparaison de deux règles de prix qui se touchent en un point (le même calcul pour 3 cahiers ne prouve rien : un
 * contre-exemple suffit — la généralisation du manuel `deep-5`). Chaque nombre est vérifié dans ./problems.test.js en arithmétique EXACTE.
 */
import { addition, src } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — رحلة إلى الحامّة',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🚌',
    tone: 'indigo',
    source: addition('exam_style_problem'),
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'fixed', text: 'كراء الحافلة: 6 000 دج ثابتة', useful: true },
      { id: 'each', text: 'عن كلّ تلميذ: 150 دج', useful: true },
      { id: 'rule', text: 'القاعدة: C = 6 000 + 150 × n', useful: true },
      { id: 'teachers', text: 'سيرافق التلاميذ 3 أساتذة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'تكلفة 24 تلميذًا',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['التكلفة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['kull-mawdi'],
            prompt: 'نضع $24$ مكان $n$ في القاعدة فنكتب:',
            options: ['$6\\,000+150\\times 24$', '$6\\,000+150\\,24$', '$6\\,000\\times 150+24$'], correct: 0, cols: 1,
            explain: 'القيمة $24$ تحلّ محلّ الحرف $n$ ، ويبقى بينها وبين $150$ إشارة الضرب : $150\\times 24$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qaida-tatbiq'], prompt: 'تكلفة رحلة 24 تلميذًا بالدينار:', expected: 9600, display: '9 600',
            explain: 'نحسب الضرب أوّلًا : $150\\times 24=3\\,600$ ثمّ نجمع : $6\\,000+3\\,600=9\\,600$ .' },
          { kind: 'solution', ask: 0, lines: [
            'نضع $24$ مكان $n$ : $C=6\\,000+150\\times 24$ .',
            'الضرب قبل الجمع : $150\\times 24=3\\,600$ ثمّ $C=6\\,000+3\\,600=9\\,600$ دج.',
          ] },
        ],
      },
      {
        label: '2)', title: 'تكلفة 40 تلميذًا',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['التكلفة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qaida-tatbiq'], prompt: 'تكلفة رحلة 40 تلميذًا بالدينار:', expected: 12000, display: '12 000',
            explain: '$150\\times 40=6\\,000$ ثمّ $6\\,000+6\\,000=12\\,000$ .' },
          { kind: 'solution', ask: 0, lines: [
            'نضع $40$ مكان $n$ : $C=6\\,000+150\\times 40$ .',
            '$150\\times 40=6\\,000$ ثمّ $C=6\\,000+6\\,000=12\\,000$ دج.',
          ] },
        ],
      },
      {
        label: '3)', title: 'هل يتضاعف المبلغ؟',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['تكلفة 48 تلميذًا', 'الحكم على قول أحمد'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['qaida-tatbiq'], prompt: 'ضعف تكلفة 24 تلميذًا ($2\\times 9\\,600$) :', expected: 19200, display: '19 200',
            explain: '$2\\times 9\\,600=19\\,200$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qaida-tatbiq'], prompt: 'تكلفة رحلة 48 تلميذًا بالدينار:', expected: 13200, display: '13 200',
            explain: '$150\\times 48=7\\,200$ ثمّ $6\\,000+7\\,200=13\\,200$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['mithal-mudad'],
            prompt: 'قول أحمد « إذا تضاعف عدد التلاميذ تضاعفت التكلفة »:',
            options: ['خاطئ : $13\\,200$ ليس ضعف $9\\,600$', 'صحيح : لأنّ $48$ هو ضعف $24$', 'صحيح : لأنّه صحّ في مثال'], correct: 0, cols: 1,
            explain: 'من أجل $48$ تلميذًا $13\\,200\\neq 19\\,200$ : مثال مضادّ واحد يكفي، فالتكلفة لا تتضاعف لأنّ الكراء الثابت يُدفع مرّة واحدة.' },
          { kind: 'solution', ask: 0, lines: [
            'من أجل $n=48$ : $C=6\\,000+150\\times 48=6\\,000+7\\,200=13\\,200$ دج.',
            'وضعف تكلفة 24 تلميذًا هو $2\\times 9\\,600=19\\,200$ ؛ و $13\\,200\\neq 19\\,200$ فقول أحمد غير صحيح : هذا مثال مضادّ.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — حديقتان وسياج',
    context: 'حديقة الحيّ',
    emoji: '🌳',
    tone: 'emerald',
    source: addition('exam_style_problem'),
    illustration: { kind: 'tags', cards: [
      { title: 'الحديقة الأولى', icon: 'plant', lines: [{ label: 'الطول a', value: '26', unit: 'م' }, { label: 'العرض b', value: '14', unit: 'م' }] },
      { title: 'الحديقة الثانية', icon: 'plant', lines: [{ label: 'الطول a', value: '19', unit: 'م' }, { label: 'العرض b', value: '21', unit: 'م' }] },
      { title: 'ثمن الشبك', icon: 'coin', lines: [{ label: 'المتر الواحد', value: '450', unit: 'دج' }] },
    ], ariaLabel: 'حديقتان مستطيلتان: الأولى طولها ستّة وعشرون مترًا وعرضها أربعة عشر مترًا، والثانية طولها تسعة عشر مترًا وعرضها واحد وعشرون مترًا ؛ ثمن المتر الواحد من الشبك أربعمئة وخمسون دينارًا' },
    statement: 'يريد سكّان الحيّ تسييج حديقتين مستطيلتين بالشبك. يُحسب طول الشبك بالأمتار بالقاعدة ⁦P = 2 × (a + b)⁩ حيث a طول الحديقة و b عرضها. الحديقة الأولى طولها 26 م وعرضها 14 م، والثانية طولها 19 م وعرضها 21 م. ثمن المتر الواحد من الشبك 450 دج. للحيّ 5 مداخل.',
    data: [
      { id: 'rule', text: 'القاعدة: P = 2 × (a + b)', useful: true },
      { id: 'first', text: 'الحديقة الأولى: 26 م و 14 م', useful: true },
      { id: 'second', text: 'الحديقة الثانية: 19 م و 21 م', useful: true },
      { id: 'price', text: 'ثمن المتر: 450 دج', useful: true },
      { id: 'doors', text: 'للحيّ 5 مداخل', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'شبك الحديقة الأولى',
        question: 'ما طول الشبك اللازم لتسييج الحديقة الأولى؟',
        asks: ['طول الشبك'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'compute', requires: ['awlawiya-qaida'], prompt: 'ما بين القوسين ($26+14$) :', expected: 40, display: '40',
            explain: 'القوسان أوّلًا : $26+14=40$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qaida-tatbiq'], prompt: 'طول الشبك بالأمتار ($2\\times 40$) :', expected: 80, display: '80',
            explain: 'ثمّ نضرب : $2\\times 40=80$ م.' },
          { kind: 'solution', ask: 0, lines: [
            'نضع $26$ مكان $a$ و $14$ مكان $b$ : $P=2\\times(26+14)$ .',
            'ما بين القوسين أوّلًا : $26+14=40$ ثمّ $P=2\\times 40=80$ م.',
          ] },
        ],
      },
      {
        label: '2)', title: 'ثمن الشبك',
        question: 'ما ثمن الشبك اللازم للحديقة الأولى؟',
        asks: ['الثمن'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qaida-tatbiq'], prompt: 'ثمن 80 م من الشبك بالدينار ($80\\times 450$) :', expected: 36000, display: '36 000',
            explain: '$80\\times 450=36\\,000$ دج.' },
          { kind: 'solution', ask: 0, lines: [
            'المتر الواحد بـ $450$ دج والشبك $80$ م.',
            'الثمن : $80\\times 450=36\\,000$ دج.',
          ] },
        ],
      },
      {
        label: '3)', title: 'الحديقة الثانية',
        question: 'هل يكفي الشبك المشترى للحديقة الأولى لتسييج الحديقة الثانية؟',
        asks: ['طول الشبك اللازم', 'هل يكفي؟'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qaida-tatbiq'], prompt: 'طول الشبك اللازم للحديقة الثانية بالأمتار ($2\\times(19+21)$) :', expected: 80, display: '80',
            explain: '$19+21=40$ ثمّ $2\\times 40=80$ م.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['qaida-tatbiq'],
            prompt: 'الشبك المشترى هو $80$ م:',
            options: ['يكفي : الحديقتان تحتاجان $80$ م معًا', 'لا يكفي : الحديقة الثانية أضيق', 'لا يكفي : الحديقة الثانية أطول'], correct: 0, cols: 1,
            explain: 'الحديقتان مختلفتا البعدين لكنّ مجموع بعدي كلّ منهما $40$ ، فالمحيط نفسه $80$ م.' },
          { kind: 'solution', ask: 0, lines: [
            'نضع $19$ مكان $a$ و $21$ مكان $b$ : $P=2\\times(19+21)$ .',
            '$19+21=40$ ثمّ $P=2\\times 40=80$ م : مثل الحديقة الأولى، فالشبك المشترى يكفي.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — متجرا الدفاتر',
    context: 'متجرا الدفاتر',
    emoji: '📒',
    tone: 'amber',
    source: src('deep-5', 86, 'التدريب على التعميم والاستدلال', 5),
    illustration: { kind: 'tags', cards: [
      { title: 'المتجر الأوّل', icon: 'book', lines: [{ label: 'سعر الدفتر', value: '2', unit: 'دج' }, { label: 'رسم التسجيل', value: '3', unit: 'دج' }] },
      { title: 'المتجر الثاني', icon: 'book', lines: [{ label: 'سعر الدفتر', value: '3', unit: 'دج' }] },
      { title: 'جرّب أمين', icon: 'person', lines: [{ label: 'عدد الدفاتر', value: '3', unit: 'دفاتر' }, { label: 'الثمن في المتجرين', value: '9', unit: 'دج' }] },
    ], ariaLabel: 'متجران للدفاتر: الأوّل يبيع الدفتر بدينارين ويأخذ ثلاثة دنانير رسم تسجيل، والثاني يبيع الدفتر بثلاثة دنانير دون رسم ؛ جرّب أمين ثلاثة دفاتر فوجد تسعة دنانير في المتجرين' },
    statement: 'في متجرين لبيع الدفاتر: يبيع المتجر الأوّل الدفتر بـ 2 دج ويأخذ 3 دج رسم تسجيل، فثمن n دفتر هو ⁦2 × n + 3⁩ دج. ويبيع المتجر الثاني الدفتر بـ 3 دج دون رسم، فثمن n دفتر هو ⁦3 × n⁩ دج. قال أمين: « الثمنان متساويان دائمًا لأنّني جرّبت 3 دفاتر فوجدت 9 دج في المتجرين ». في قسم أمين 30 تلميذًا.',
    data: [
      { id: 'first', text: 'المتجر الأوّل: 2 × n + 3', useful: true },
      { id: 'second', text: 'المتجر الثاني: 3 × n', useful: true },
      { id: 'claim', text: 'قول أمين: الثمنان متساويان دائمًا', useful: true },
      { id: 'pupils', text: 'في قسم أمين 30 تلميذًا', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'تحقّق من تجربة أمين',
        question: 'من أجل 3 دفاتر : ما ثمن المتجر الأوّل؟ وما ثمن المتجر الثاني؟',
        asks: ['ثمن المتجر الأوّل', 'ثمن المتجر الثاني'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qaida-tatbiq'], prompt: 'ثمن 3 دفاتر في المتجر الأوّل ($2\\times 3+3$) :', expected: 9, display: '9',
            explain: '$2\\times 3=6$ ثمّ $6+3=9$ دج.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['qaida-tatbiq'], prompt: 'ثمن 3 دفاتر في المتجر الثاني ($3\\times 3$) :', expected: 9, display: '9',
            explain: '$3\\times 3=9$ دج.' },
          { kind: 'solution', ask: 0, lines: [
            'المتجر الأوّل : $2\\times 3+3=6+3=9$ دج.',
            'المتجر الثاني : $3\\times 3=9$ دج ؛ فتجربة أمين صحيحة من أجل 3 دفاتر.',
          ] },
        ],
      },
      {
        label: '2)', title: 'جرّب 5 دفاتر',
        question: 'من أجل 5 دفاتر : ما ثمن كلّ من المتجرين؟',
        asks: ['ثمن المتجر الأوّل', 'ثمن المتجر الثاني'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qaida-tatbiq'], prompt: 'ثمن 5 دفاتر في المتجر الأوّل ($2\\times 5+3$) :', expected: 13, display: '13',
            explain: '$2\\times 5=10$ ثمّ $10+3=13$ دج.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['qaida-tatbiq'], prompt: 'ثمن 5 دفاتر في المتجر الثاني ($3\\times 5$) :', expected: 15, display: '15',
            explain: '$3\\times 5=15$ دج.' },
          { kind: 'solution', ask: 0, lines: [
            'المتجر الأوّل : $2\\times 5+3=10+3=13$ دج.',
            'المتجر الثاني : $3\\times 5=15$ دج.',
          ] },
        ],
      },
      {
        label: '3)', title: 'هل يوافق أمينًا؟',
        question: 'هل قول أمين « الثمنان متساويان دائمًا » صحيح؟',
        asks: ['الحكم على قول أمين'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['mithal-mudad'],
            prompt: 'قول أمين:',
            options: ['خاطئ : من أجل 5 دفاتر الثمنان $13$ و $15$', 'صحيح : لأنّه صحّ من أجل 3 دفاتر', 'صحيح : لأنّ المتجرين سعراهما متقاربان'], correct: 0, cols: 1,
            explain: 'مثال واحد تختلف فيه الجهتان يكفي : $13\\neq 15$ ؛ أمّا تساويهما من أجل 3 دفاتر فلا يثبت التساوي دائمًا.' },
          { kind: 'solution', ask: 0, lines: [
            'من أجل 3 دفاتر الثمنان متساويان ($9$ و $9$) ، ومن أجل 5 دفاتر هما $13$ و $15$ .',
            'مثال مضادّ واحد يكفي لإسقاط القول : الثمنان ليسا متساويين دائمًا.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
