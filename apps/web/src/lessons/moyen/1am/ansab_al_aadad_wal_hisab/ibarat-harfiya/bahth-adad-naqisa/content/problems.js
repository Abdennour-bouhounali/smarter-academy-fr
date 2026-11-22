/**
 * Les trois « مسائل » du درس « البحث عن أعداد ناقصة » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas (GuidedProblem). La مسألة 1 est
 * `LESSON_CONFIG.lessonProblem` (l'atelier de stylos : trois machines, trois cartes, trois nombres manquants) ; la 2 REDESSINE « شراء سيارة » du manuel (`deep-1`) avec son propre
 * contexte (un club d'informatique : un acompte puis huit versements égaux — deux nombres manquants à la suite) ; la 3 est l'escalier du manuel (`deep-6`) avec ses propres nombres et
 * le programme à DEUX cartes de `ex-18`, remonté dans l'ordre inverse (d'abord la carte « + », puis la carte « × »).
 * Chaque nombre est vérifié dans ./problems.test.js en arithmétique EXACTE.
 */
import { addition, src } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — ورشة الأقلام',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '✏️',
    tone: 'indigo',
    source: addition('exam_style_problem'),
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'آلة الإضافة: « ⁦+ 15⁩ » وأخرجت 72 قلمًا', useful: true },
      { id: 'd2', text: 'آلة الفحص: « ⁦− 8⁩ » وبقي بعدها 59 قلمًا', useful: true },
      { id: 'd3', text: 'آلة التغليف: « ⁦× 12⁩ » وأخرجت 156 قلمًا', useful: true },
      { id: 'stores', text: 'للورشة 3 مخازن', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'آلة الإضافة',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['المساواة', 'عدد الأقلام التي دخلتها'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['musawat-naqisa'],
            prompt: 'المساواة التي تترجم آلة الإضافة (□ عدد الأقلام الداخلة):',
            options: ['$\\square+15=72$', '$\\square-15=72$', '$15\\times\\square=72$'], correct: 0, cols: 1,
            explain: 'الآلة تضيف 15 إلى ما دخل فخرج 72 : $\\square+15=72$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['naqis-majmu'], prompt: 'عدد الأقلام التي دخلت آلة الإضافة:', expected: 57, display: '57',
            explain: 'نُرجع بالعملية العكسية للجمع: $72-15=57$ ، ونتحقّق: $57+15=72$ .' },
          { kind: 'solution', ask: 0, lines: [
            'نترجم الآلة بمساواة فيها □ : $\\square+15=72$ .',
            'العملية العكسية للجمع هي الطرح: $\\square=72-15=57$ ، ونتحقّق: $57+15=72$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'آلة الفحص',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['عدد الأقلام الداخلة', 'التحقّق'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['naqis-farq'], prompt: 'عدد الأقلام التي دخلت آلة الفحص ($\\square-8=59$) :', expected: 67, display: '67',
            explain: 'في $\\square-8=59$ نجمع: $59+8=67$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['tahaqquq'],
            prompt: 'التحقّق من العدد $67$ :',
            options: ['$67-8=59$ : صحيح', '$67+8=59$ : صحيح', '$59-8=67$ : صحيح'], correct: 0, cols: 1,
            explain: 'نعوّض في الآلة الأصلية: $67-8=59$ وهو الناتج المعلوم.' },
          { kind: 'solution', ask: 0, lines: [
            'الآلة تطرح 8 من الداخل: $\\square-8=59$ ، فنُرجع بالجمع: $\\square=59+8=67$ .',
            'نتحقّق بالتعويض في الآلة: $67-8=59$ ، فالعدد صحيح.',
          ] },
        ],
      },
      {
        label: '3)', title: 'آلة التغليف',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['عدد العلب'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['naqis-judaa'], prompt: 'عدد العلب التي دخلت آلة التغليف ($12\\times\\square=156$) :', expected: 13, display: '13',
            explain: 'العملية العكسية للضرب هي القسمة: $156\\div 12=13$ ، ونتحقّق: $12\\times 13=156$ .' },
          { kind: 'solution', ask: 0, lines: [
            'كلّ علبة فيها 12 قلمًا والمجموع 156 : $12\\times\\square=156$ .',
            '$\\square=156\\div 12=13$ علبة ، ونتحقّق: $12\\times 13=156$ .',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — مشتريات نادي الإعلام الآلي',
    context: 'نادي المتوسطة',
    emoji: '🖨️',
    tone: 'emerald',
    source: src('deep-1', 86, 'أتعمّق — إنتاج واستعمال عبارات حرفية', 1),
    illustration: { kind: 'tags', cards: [
      { title: 'ثمن الطابعة', icon: 'house', lines: [{ label: 'الثمن', value: '96 000', unit: 'دج' }] },
      { title: 'المقدّم', icon: 'house', lines: [{ label: 'دُفع', value: '24 000', unit: 'دج' }] },
      { title: 'الدفعات', icon: 'house', lines: [{ label: 'عددها', value: '8', unit: 'دفعات متساوية' }] },
    ], ariaLabel: 'طابعة ثمنها ستة وتسعون ألف دينار: دُفع مقدّمًا أربعة وعشرون ألف دينار والباقي على ثماني دفعات شهرية متساوية' },
    statement: 'اشترى نادي الإعلام الآلي في المتوسطة طابعة ثمنها 96 000 دج. دفع النادي 24 000 دج مقدّمًا، واتفق مع البائع على دفع الباقي بثماني دفعات شهرية متساوية. للنادي 12 عضوًا.',
    data: [
      { id: 'price', text: 'ثمن الطابعة: 96 000 دج', useful: true },
      { id: 'advance', text: 'المقدّم: 24 000 دج', useful: true },
      { id: 'times', text: 'الباقي على 8 دفعات متساوية', useful: true },
      { id: 'members', text: 'للنادي 12 عضوًا', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الباقي بعد المقدّم',
        question: 'ما المبلغ الباقي دفعه بعد المقدّم؟',
        asks: ['المبلغ الباقي'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['naqis-majmu'], prompt: 'المبلغ الباقي بالدينار ($24\\,000+\\square=96\\,000$) :', expected: 72000, display: '72 000',
            explain: 'نطرح المقدّم من الثمن: $96\\,000-24\\,000=72\\,000$ .' },
          { kind: 'solution', ask: 0, lines: [
            'المقدّم والباقي يكوّنان الثمن: $24\\,000+\\square=96\\,000$ .',
            '$\\square=96\\,000-24\\,000=72\\,000$ دج.',
          ] },
        ],
      },
      {
        label: '2)', title: 'مبلغ الدفعة',
        question: 'ما مبلغ كلّ دفعة شهرية؟',
        asks: ['مبلغ الدفعة'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['musawat-naqisa'],
            prompt: 'المساواة التي تترجم الدفعات (□ مبلغ الدفعة):',
            options: ['$8\\times\\square=72\\,000$', '$8+\\square=72\\,000$', '$\\square-8=72\\,000$'], correct: 0, cols: 1,
            explain: 'ثماني دفعات متساوية مجموعها الباقي: $8\\times\\square=72\\,000$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['naqis-judaa'], prompt: 'مبلغ الدفعة بالدينار:', expected: 9000, display: '9 000',
            explain: 'نقسم الباقي على عدد الدفعات: $72\\,000\\div 8=9\\,000$ .' },
          { kind: 'solution', ask: 0, lines: [
            'ثماني دفعات متساوية مجموعها 72 000 : $8\\times\\square=72\\,000$ .',
            '$\\square=72\\,000\\div 8=9\\,000$ دج ، ونتحقّق: $8\\times 9\\,000=72\\,000$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'التحقّق من الثمن',
        question: 'تحقّق من أنّ المقدّم والدفعات الثماني يعطيان ثمن الطابعة. ما المجموع بالدينار؟',
        asks: ['المجموع'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tahaqquq'], prompt: 'المقدّم مع الدفعات الثماني بالدينار:', expected: 96000, display: '96 000',
            explain: '$24\\,000+8\\times 9\\,000=24\\,000+72\\,000=96\\,000$ وهو ثمن الطابعة.' },
          { kind: 'solution', ask: 0, lines: [
            'الدفعات الثماني: $8\\times 9\\,000=72\\,000$ .',
            'مع المقدّم: $24\\,000+72\\,000=96\\,000$ ، وهو ثمن الطابعة، فالنتيجة صحيحة.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — درج المكتبة',
    context: 'درج مدخل المكتبة',
    emoji: '🪜',
    tone: 'amber',
    source: src('deep-6', 86, 'البحث عن أعداد ناقصة', 6),
    cites: [src('ex-18', 84, 'البحث عن أعداد ناقصة', 18)],
    illustration: { kind: 'tags', cards: [
      { title: 'قاعدة الدرج', icon: 'house', lines: [{ label: 'ضعف الارتفاع مع العرض', value: '63', unit: 'سم' }] },
      { title: 'الدرج الأوّل', icon: 'house', lines: [{ label: 'ارتفاع الدرجة', value: '15', unit: 'سم' }] },
      { title: 'الدرج الثاني', icon: 'house', lines: [{ label: 'عرض الدرجة', value: '27', unit: 'سم' }] },
    ], ariaLabel: 'قاعدة الدرج: ضعف ارتفاع الدرجة مع عرضها يساوي ثلاثة وستين سنتيمترًا ؛ الدرج الأوّل ارتفاع درجته خمسة عشر سنتيمترًا والدرج الثاني عرض درجته سبعة وعشرون سنتيمترًا' },
    statement: 'يكون الدرج مريحًا حين يكون ضعف ارتفاع الدرجة مضافًا إليه عرضها مساويًا 63 سم. في مكتبة الحيّ درجان: ارتفاع درجة الأوّل 15 سم، وعرض درجة الثاني 27 سم. عدد درجات الأوّل 12 درجة.',
    data: [
      { id: 'rule', text: 'ضعف الارتفاع مع العرض يساوي 63 سم', useful: true },
      { id: 'h', text: 'ارتفاع درجة الدرج الأوّل: 15 سم', useful: true },
      { id: 'g', text: 'عرض درجة الدرج الثاني: 27 سم', useful: true },
      { id: 'n', text: 'عدد درجات الدرج الأوّل: 12 درجة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'عرض درجة الدرج الأوّل',
        question: 'ما عرض درجة الدرج الأوّل؟',
        asks: ['عرض الدرجة'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'compute', requires: ['naqis-judaa'], prompt: 'ضعف الارتفاع (2 × 15) :', expected: 30, display: '30',
            explain: '$2\\times 15=30$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['naqis-majmu'], prompt: 'عرض درجة الدرج الأوّل ($30+\\square=63$) :', expected: 33, display: '33',
            explain: 'نطرح من المجموع: $63-30=33$ سم ، ونتحقّق: $2\\times 15+33=63$ .' },
          { kind: 'solution', ask: 0, lines: [
            'القاعدة: $2\\times 15+\\square=63$ ، أي $30+\\square=63$ .',
            '$\\square=63-30=33$ سم ، ونتحقّق: $30+33=63$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'ارتفاع درجة الدرج الثاني',
        question: 'ما ارتفاع درجة الدرج الثاني؟',
        asks: ['ارتفاع الدرجة'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['naqis-majmu'], prompt: 'ضعف الارتفاع ($\\square+27=63$) :', expected: 36, display: '36',
            explain: 'الآلة الأخيرة هي « ⁦+ 27⁩ » فنبدأ بها عند الرجوع: $63-27=36$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['naqis-judaa'], prompt: 'ارتفاع الدرجة ($2\\times\\square=36$) :', expected: 18, display: '18',
            explain: 'ثمّ نُرجع البطاقة « ⁦× 2⁩ » بالقسمة: $36\\div 2=18$ سم.' },
          { kind: 'solution', ask: 0, lines: [
            'القاعدة برنامج من بطاقتين: « ⁦× 2⁩ » ثمّ « ⁦+ 27⁩ » فخرج 63. نُرجعه بترتيب عكسي: نطرح 27 ثمّ نقسم على 2.',
            '$63-27=36$ ثمّ $36\\div 2=18$ سم ، ونتحقّق: $2\\times 18+27=63$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'التحقّق',
        question: 'تحقّق بالتعويض من الارتفاع 18 سم في القاعدة. ما الناتج بالسنتيمتر؟',
        asks: ['ناتج التعويض'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tahaqquq'], prompt: 'ضعف الارتفاع مع العرض ($2\\times 18+27$) :', expected: 63, display: '63',
            explain: '$2\\times 18=36$ و $36+27=63$ وهو الناتج المعلوم.' },
          { kind: 'solution', ask: 0, lines: [
            'نعوّض الارتفاع 18 والعرض 27 في القاعدة: $2\\times 18+27$ .',
            '$36+27=63$ ، وهو الناتج المعلوم، فالارتفاع صحيح.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
