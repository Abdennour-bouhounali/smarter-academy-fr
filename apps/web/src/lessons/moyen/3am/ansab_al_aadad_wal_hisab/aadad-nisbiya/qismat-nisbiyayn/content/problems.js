/**
 * Les trois « مسائل » du درس « حاصل قسمة عددين نسبيين » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas
 * (GuidedProblem). La 1 est « مسألة الدرس » (`LESSON_CONFIG.lessonProblem`) : la moyenne de températures minimales d'une station météo de الجلفة (somme
 * de relatifs puis quotient) ; la 2 un programme de calcul « خمّن نتيجتي » (deep-52 redessiné : on conjecture que le résultat est le double du nombre choisi,
 * la preuve avec une lettre est `nashr-jabri-3am`) ; la 3 la calculatrice de نسرين (ict redessiné : parenthèses du numérateur et du dénominateur).
 * Chaque nombre est vérifié dans ./problems.test.js en arithmétique EXACTE (BigInt).
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — محطة الأرصاد بالجلفة',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🌡️',
    tone: 'indigo',
    source: SOURCE,
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    table: LESSON_CONFIG.lessonProblem.table,
    data: [
      { id: 'temps', text: 'درجات الحرارة الدنيا لخمسة أيام: −3 ، −5 ، 2 ، −4 ، −5 (°C)', useful: true },
      { id: 'sixth', text: 'في اليوم السادس سُجّلت −9 °C', useful: true },
      { id: 'town', text: 'المحطة في مدينة الجلفة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'مجموع الدرجات',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['المجموع'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['majmu-jabri'], prompt: '$(-3) + (-5) + 2 + (-4) + (-5) =$', expected: -15, display: '−15',
            explain: 'نجمع الدرجات السالبة: $-3 - 5 - 4 - 5 = -17$ ثم نضيف $2$ : $-15$ .' },
          { kind: 'solution', ask: 0, lines: ['الدرجات السالبة: $-3 - 5 - 4 - 5 = -17$ .', 'مع $2$ يصبح المجموع $-17 + 2 = -15$ .'] },
        ],
      },
      {
        label: '2)', title: 'متوسّط الدرجات',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['المتوسّط'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qisma-aamil'], prompt: 'المتوسّط هو المجموع مقسومًا على عدد الأيام: $(-15) \\div 5 =$', expected: -3, display: '−3',
            explain: 'العددان $-15$ و $5$ مختلفا الإشارة فالحاصل سالب، و $15 \\div 5 = 3$ . ونتحقّق: $5 \\times (-3) = -15$ .' },
          { kind: 'solution', ask: 0, lines: ['المتوسّط $= (-15) \\div 5$ .', 'إذن المتوسّط $-3\\,^\\circ\\mathrm{C}$ .'] },
        ],
      },
      {
        label: '3)', title: 'اليوم السادس',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['المتوسّط الجديد'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['majmu-jabri'], prompt: 'المجموع الجديد للأيام الستة: $-15 + (-9) =$', expected: -24, display: '−24',
            explain: 'جمع عددين سالبين: $-15 - 9 = -24$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ishara-qisma'], prompt: 'المتوسّط الجديد $(-24) \\div 6 =$', expected: -4, display: '−4',
            explain: 'مختلفا الإشارة: سالب، و $24 \\div 6 = 4$ . ونتحقّق: $6 \\times (-4) = -24$ .' },
          { kind: 'solution', ask: 0, lines: ['المجموع الجديد $-15 + (-9) = -24$ .', 'المتوسّط الجديد $(-24) \\div 6 = -4\\,^\\circ\\mathrm{C}$ .'] },
        ],
      },
      {
        label: '4)', title: 'هل انخفض المتوسّط؟',
        question: LESSON_CONFIG.lessonProblem.questions[3].text,
        asks: ['الحكم'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['ishara-qisma'],
            prompt: 'بين المتوسّطين $-3$ و $-4$ :',
            options: ['انخفض المتوسّط لأنّ $-4 < -3$', 'ارتفع المتوسّط لأنّ $4 > 3$', 'لم يتغيّر المتوسّط', 'لا يمكن المقارنة بين متوسّطين سالبين'], correct: 0, cols: 1,
            explain: 'الدرجة $-4$ أبرد من $-3$ : اليوم السادس بارد جدًّا (−9) فجرّ المتوسّط إلى الأسفل.' },
          { kind: 'solution', ask: 0, lines: ['المتوسّط الأوّل $-3$ والجديد $-4$ .', 'بما أنّ $-4 < -3$ فقد انخفض المتوسّط.'] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — خمّن نتيجتي',
    context: 'لعبة في القسم',
    emoji: '🎩',
    tone: 'sky',
    source: SOURCE,
    illustration: { kind: 'scene', icon: 'book', bg: 'blue', chips: [{ label: 'نضيف', value: 3, tone: 'blue' }, { label: 'نضرب في', value: '−4', tone: 'rose' }, { label: 'ثم نضيف 12 ونقسم على', value: '−2', tone: 'amber' }], ariaLabel: 'برنامج حساب: نختار عددًا، نضيف إليه 3، نضرب الناتج في سالب 4، نضيف 12 ثم نقسم على سالب 2' },
    statement: 'يقترح مدرّس لعبة على تلاميذ القسم: « اختر عددًا، أضف إليه $3$ ، اضرب الناتج في $(-4)$ ، أضف $12$ ، ثم اقسم على $(-2)$ . أستطيع أن أخمّن نتيجتك دون أن تقولها! »',
    data: [
      { id: 'prog', text: 'البرنامج: +3 ثم ×(−4) ثم +12 ثم ÷(−2)', useful: true },
      { id: 'guess', text: 'المدرّس يخمّن النتيجة دون أن يعرفها', useful: true },
      { id: 'who', text: 'اللعبة في حصة نهاية الأسبوع', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'العدد 5',
        question: 'ما نتيجة البرنامج إذا اختار تلميذ العدد $5$ ؟',
        asks: ['النتيجة'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tariqat-awlawiya'], prompt: '$((5 + 3) \\times (-4) + 12) \\div (-2) =$', expected: 10, display: '10',
            explain: '$5 + 3 = 8$ ثم $8 \\times (-4) = -32$ ثم $-32 + 12 = -20$ ثم $(-20) \\div (-2) = 10$ .' },
          { kind: 'solution', ask: 0, lines: ['$5 + 3 = 8$ ثم $8 \\times (-4) = -32$ .', '$-32 + 12 = -20$ ثم $(-20) \\div (-2) = 10$ .'] },
        ],
      },
      {
        label: '2)', title: 'العدد −3,5',
        question: 'وإذا اختار التلميذ $-3{,}5$ ؟',
        asks: ['النتيجة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tariqat-awlawiya'], prompt: '$((-3{,}5 + 3) \\times (-4) + 12) \\div (-2) =$', expected: -7, display: '−7',
            explain: '$-3{,}5 + 3 = -0{,}5$ ثم $(-0{,}5) \\times (-4) = 2$ ثم $2 + 12 = 14$ ثم $14 \\div (-2) = -7$ .' },
          { kind: 'solution', ask: 0, lines: ['$-3{,}5 + 3 = -0{,}5$ ثم $(-0{,}5) \\times (-4) = 2$ .', '$2 + 12 = 14$ ثم $14 \\div (-2) = -7$ .'] },
        ],
      },
      {
        label: '3)', title: 'العدد −20',
        question: 'وإذا اختار التلميذ $-20$ ؟',
        asks: ['النتيجة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tariqat-awlawiya'], prompt: '$((-20 + 3) \\times (-4) + 12) \\div (-2) =$', expected: -40, display: '−40',
            explain: '$-20 + 3 = -17$ ثم $(-17) \\times (-4) = 68$ ثم $68 + 12 = 80$ ثم $80 \\div (-2) = -40$ .' },
          { kind: 'solution', ask: 0, lines: ['$-20 + 3 = -17$ ثم $(-17) \\times (-4) = 68$ .', '$68 + 12 = 80$ ثم $80 \\div (-2) = -40$ .'] },
        ],
      },
      {
        label: '4)', title: 'ماذا تلاحظ؟',
        question: 'ماذا تلاحظ على النتائج $10$ و $-7$ و $-40$ بالنسبة إلى الأعداد المختارة $5$ و $-3{,}5$ و $-20$ ؟',
        asks: ['الملاحظة'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tariqat-awlawiya'],
            prompt: 'النتيجة في كل حالة:',
            options: ['ضعف العدد المختار', 'نصف العدد المختار', 'معاكس العدد المختار', 'العدد المختار نفسه'], correct: 0, cols: 1,
            explain: '$10 = 2 \\times 5$ و $-7 = 2 \\times (-3{,}5)$ و $-40 = 2 \\times (-20)$ : هذا تخمين من ثلاث تجارب، وإثباته لكل الأعداد يتطلّب الحساب الحرفي.' },
          { kind: 'solution', ask: 0, lines: ['$10 = 2 \\times 5$ و $-7 = 2 \\times (-3{,}5)$ و $-40 = 2 \\times (-20)$ .', 'نخمّن أنّ نتيجة البرنامج هي ضعف العدد المختار.'] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — آلة نسرين الحاسبة',
    context: 'الأقواس على الحاسبة',
    emoji: '🧮',
    tone: 'emerald',
    source: SOURCE,
    illustration: { kind: 'scene', icon: 'coin', bg: 'green', chips: [{ label: 'البسط', value: '9 + 3 × (−5)', tone: 'blue' }, { label: 'المقام', value: '1 + 2 × (−2)', tone: 'rose' }, { label: 'ما كتبته نسرين', value: 'بلا أقواس', tone: 'amber' }], ariaLabel: 'نسرين تحسب حاصل قسمة عبارتين على الحاسبة دون أن تضع أقواسًا حول البسط والمقام' },
    statement: 'أرادت نسرين حساب العدد $\\frac{9 + 3 \\times (-5)}{1 + 2 \\times (-2)}$ فكتبت على الحاسبة بالترتيب: $9 + 3 \\times (-5) \\div 1 + 2 \\times (-2)$ ثم ضغطت على « = ».',
    data: [
      { id: 'expr', text: 'العدد المطلوب: (9 + 3 × (−5)) ÷ (1 + 2 × (−2))', useful: true },
      { id: 'typed', text: 'نسرين لم تضع أقواسًا حول البسط ولا حول المقام', useful: true },
      { id: 'brand', text: 'الحاسبة هدية من خالتها', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'النتيجة الصحيحة',
        question: 'ما قيمة العدد $\\frac{9 + 3 \\times (-5)}{1 + 2 \\times (-2)}$ ؟',
        asks: ['القيمة'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'compute', requires: ['tariqat-awlawiya'], prompt: 'البسط $9 + 3 \\times (-5) = 9 - 15 =$', expected: -6, display: '−6',
            explain: 'الضرب أوّلًا: $3 \\times (-5) = -15$ ثم $9 - 15 = -6$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ishara-qisma'], prompt: '$\\frac{-6}{1 + 2 \\times (-2)} = \\frac{-6}{-3} =$', expected: 2, display: '2',
            explain: 'المقام $1 + 2 \\times (-2) = 1 - 4 = -3$ ، والبسط والمقام سالبان فالحاصل موجب: $6 \\div 3 = 2$ .' },
          { kind: 'solution', ask: 0, lines: ['البسط $9 + 3 \\times (-5) = -6$ والمقام $1 + 2 \\times (-2) = -3$ .', 'إذن القيمة $(-6) \\div (-3) = 2$ .'] },
        ],
      },
      {
        label: '2)', title: 'ما حسبته الآلة',
        question: 'الآلة تحترم الأولويات في ما كتبته نسرين. ما النتيجة التي ظهرت على شاشتها؟',
        asks: ['نتيجة الآلة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tariqat-awlawiya'], prompt: '$9 + 3 \\times (-5) \\div 1 + 2 \\times (-2) = 9 + (-15) + (-4) =$', expected: -10, display: '−10',
            explain: 'الضرب والقسمة أوّلًا من اليسار إلى اليمين: $3 \\times (-5) = -15$ ثم $(-15) \\div 1 = -15$ ، و $2 \\times (-2) = -4$ . ثم $9 - 15 - 4 = -10$ .' },
          { kind: 'solution', ask: 0, lines: ['الآلة تقسم $-15$ على $1$ فقط (المقسوم عليه هو العدد الذي يلي علامة القسمة مباشرة).', '$9 - 15 - 4 = -10$ ، وهي نتيجة تختلف عن $2$ .'] },
        ],
      },
      {
        label: '3)', title: 'أين الأقواس؟',
        question: 'أين كان ينبغي أن تضع نسرين الأقواس؟',
        asks: ['موضع الأقواس'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tariqat-awlawiya'],
            prompt: 'الأقواس الضرورية:',
            options: ['حول البسط كله وحول المقام كله', 'حول العدد $-5$ وحده', 'حول القسمة $\\div$ وحدها', 'لا حاجة إلى أقواس'], correct: 0, cols: 1,
            explain: 'القسمة تعمل على العدد الذي يلي علامتها فقط. لنقسم البسط كله على المقام كله نضعهما بين قوسين: $(9 + 3 \\times (-5)) \\div (1 + 2 \\times (-2))$ .' },
          { kind: 'solution', ask: 0, lines: ['نكتب $(9 + 3 \\times (-5)) \\div (1 + 2 \\times (-2))$ .', 'قوس للبسط كله وقوس للمقام كله.'] },
        ],
      },
      {
        label: '4)', title: 'متى لا نحتاج إلى أقواس؟',
        question: 'احسب $(-16) \\times (-25) + (-14) \\times 15$ ثم $(16 + (-25)) \\times (14 + 15)$ . في أيّ الحسابين تغيّر الأقواس الترتيب الذي تحسب به الآلة؟',
        asks: ['الحساب الأوّل', 'الحساب الثاني', 'الحكم'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tariqat-awlawiya'], prompt: '$(-16) \\times (-25) + (-14) \\times 15 = 400 + (-210) =$', expected: 190, display: '190',
            explain: 'الضرب قبل الجمع: $(-16) \\times (-25) = 400$ و $(-14) \\times 15 = -210$ ، فالمجموع $190$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['tariqat-awlawiya'], prompt: '$(16 + (-25)) \\times (14 + 15) = (-9) \\times 29 =$', expected: -261, display: '−261',
            explain: 'القوسان أوّلًا: $16 - 25 = -9$ و $14 + 15 = 29$ ، ثم $(-9) \\times 29 = -261$ .' },
          { kind: 'choice', role: 'conclude', ask: 2, requires: ['tariqat-awlawiya'],
            prompt: 'الأقواس التي تغيّر ترتيب الحساب في:',
            options: ['الحساب الثاني فقط', 'الحساب الأوّل فقط', 'الحسابين معًا', 'لا في هذا ولا في ذاك'], correct: 0, cols: 1,
            explain: 'في الحساب الأوّل الأقواس تحمل الإشارة فقط، والضرب سابق على الجمع على كل حال. في الثاني تُلزم الجمع بأن يسبق الضرب.' },
          { kind: 'solution', ask: 2, lines: ['الحساب الأوّل $= 400 - 210 = 190$ دون الحاجة إلى تغيير الأولوية.', 'الحساب الثاني $= (-9) \\times 29 = -261$ : القوسان يُلزمان الجمع أن يكون قبل الضرب.'] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
