/**
 * Les trois « مسائل » du درس « مقارنة وترتيب أعداد نسبية » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à
 * pas (GuidedProblem). La مسألة 1 est le registre des températures du manuel (act-2 et l'ouverture, p. 38 et 40) RÉÉCRIT en un relevé
 * d'une semaine par un club de météo — `LESSON_CONFIG.lessonProblem` ; la 2 compare des altitudes et des profondeurs par rapport au
 * niveau de la mer ; la 3 des soldes de comptes (dettes et avoir). Chaque nombre est vérifié dans ./problems.test.js en arithmétique
 * EXACTE (BigInt).
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — درجات الحرارة في أسبوع',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🌡️',
    tone: 'sky',
    source: SOURCE,
    table: LESSON_CONFIG.lessonProblem.table,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'درجات الحرارة الصباحية لسبعة أيّام مسجّلة في الجدول', useful: true },
      { id: 'd2', text: 'الدرجة السالبة تعني أنّها تحت الصفر', useful: true },
      { id: 'd3', text: 'سجّل التلاميذ القياسات بأمانة ودقّة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'أبرد يوم وأدفأ يوم',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['أبرد يوم', 'أدفأ يوم'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['salibayn'], prompt: 'أبرد يوم في الأسبوع هو:', options: ['السبت', 'الخميس', 'الثلاثاء'], correct: 0, cols: 3,
            explain: 'السالبة: $-4{,}5$ و $-3$ و $-1{,}2$ و $-0{,}8$ . أبعدها عن الصفر $-4{,}5$ ، إذن هو الأصغر: يوم السبت.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['mukhtalifayn'], prompt: 'أدفأ يوم في الأسبوع هو:', options: ['الجمعة', 'الأربعاء', 'الاثنين'], correct: 1, cols: 3,
            explain: 'الموجبان $2{,}5$ و $1{,}6$ أكبر من كل الباقي، وأبعدهما عن الصفر $2{,}5$ : الأربعاء.' },
          { kind: 'solution', ask: 0, lines: [
            'السالبة: $-4{,}5$ و $-1{,}2$ و $-0{,}8$ و $-3$ . الأبعد عن الصفر هو الأصغر: $-4{,}5$ ، أبرد يوم هو السبت.',
            'الموجبة: $2{,}5$ و $1{,}6$ ، والأكبر منهما $2{,}5$ ، أدفأ يوم هو الأربعاء.',
          ] },
        ],
      },
      {
        label: '2)', title: 'الأيّام الباردة',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['الترتيب التصاعدي'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tartib'], prompt: 'الدرجات السالبة مرتّبة تصاعديًا:',
            options: ['$-4{,}5 < -3 < -1{,}2 < -0{,}8$', '$-0{,}8 < -1{,}2 < -3 < -4{,}5$', '$-1{,}2 < -0{,}8 < -3 < -4{,}5$'], correct: 0, cols: 1,
            explain: 'من الأبعد عن الصفر إلى الأقرب: $4{,}5 > 3 > 1{,}2 > 0{,}8$ ، فنكتب $-4{,}5 < -3 < -1{,}2 < -0{,}8$ .' },
          { kind: 'solution', ask: 0, lines: [
            'السالبة: $-4{,}5$ ؛ $-1{,}2$ ؛ $-0{,}8$ ؛ $-3$ .',
            'المسافات إلى الصفر: $4{,}5$ ؛ $1{,}2$ ؛ $0{,}8$ ؛ $3$ ، والأصغر هو الأبعد.',
            '$-4{,}5 < -3 < -1{,}2 < -0{,}8$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'أصغر من $-1$',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['عدد الأيّام'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['salibayn'], prompt: 'أيّ هذه الدرجات أصغر من $-1$ ؟',
            options: ['$-0{,}8$', '$-1{,}2$', '$0$'], correct: 1, cols: 3,
            explain: '$-1{,}2$ أبعد عن الصفر من $-1$ ، فهو أصغر منه؛ أمّا $-0{,}8$ فأقرب إلى الصفر، فهو أكبر من $-1$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['salibayn'], prompt: 'عدد الأيّام التي كانت درجتها أصغر من $-1$ :', expected: 3,
            explain: '$-4{,}5$ و $-3$ و $-1{,}2$ : ثلاثة أيّام.' },
          { kind: 'solution', ask: 0, lines: [
            'الدرجة أصغر من $-1$ إذا كانت سالبة ومسافتها إلى الصفر أكبر من 1.',
            '$-4{,}5$ و $-3$ و $-1{,}2$ ، إذن ثلاثة أيّام.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — فوق البحر وتحته',
    context: 'ارتفاعات وأعماق',
    emoji: '🌊',
    tone: 'teal',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [
      { title: 'النورس', icon: 'kite', lines: [{ label: 'الارتفاع', value: '+8,5 m' }] },
      { title: 'الغوّاص', icon: 'person', lines: [{ label: 'العمق', value: '-12,5 m' }] },
      { title: 'الغواصة', icon: 'car', lines: [{ label: 'العمق', value: '-41 m' }] },
    ], ariaLabel: 'ثلاث بطاقات: نورس على ارتفاع 8,5 متر فوق سطح البحر، وغوّاص عند 12,5 متر تحته، وغواصة عند 41 متر تحته' },
    statement: 'في رحلة علمية على متن مركب البحث، تعاون التلاميذ مع الطاقم على تسجيل مواضع أربعة كائنات بالنسبة إلى سطح البحر (الصفر): نورس عند $+8{,}5\\,\\mathrm{m}$ ، وسمكة عند $-3{,}25\\,\\mathrm{m}$ ، وغوّاص عند $-12{,}5\\,\\mathrm{m}$ ، وغواصة عند $-41\\,\\mathrm{m}$ . الأعداد السالبة تعني تحت سطح البحر.',
    data: [
      { id: 'a', text: 'النورس: 8,5 م فوق سطح البحر ، السمكة: 3,25 م تحته', useful: true },
      { id: 'b', text: 'الغوّاص: 12,5 م تحت السطح ، الغواصة: 41 م تحته', useful: true },
      { id: 'c', text: 'المركب مخصّص للبحث العلمي', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الأخفض والأقرب',
        question: 'عيّن الكائن الأخفض، ثم الكائن الأقرب إلى سطح البحر.',
        asks: ['الأخفض', 'الأقرب إلى سطح البحر'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['salibayn'], prompt: 'الكائن الأخفض هو:', options: ['الغواصة', 'الغوّاص', 'السمكة'], correct: 0, cols: 3,
            explain: 'السالبة: $-41 < -12{,}5 < -3{,}25$ ؛ الأبعد عن الصفر هو الأصغر: الغواصة.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['mukhtalifayn'], prompt: 'الكائن الأقرب إلى سطح البحر هو:', options: ['النورس', 'الغوّاص', 'السمكة'], correct: 2, cols: 3,
            explain: 'الأقرب إلى الصفر هو الأصغر مسافة: $3{,}25$ للسمكة، و $8{,}5$ للنورس. الأقرب إلى الصفر ليس هو الأصغر عددًا.' },
          { kind: 'solution', ask: 0, lines: [
            'السالبة $-41$ و $-12{,}5$ و $-3{,}25$ : الأبعد عن الصفر هو الأصغر، إذن الغواصة هي الأخفض.',
            'المسافات إلى الصفر: $8{,}5$ ؛ $3{,}25$ ؛ $12{,}5$ ؛ $41$ . الأصغر $3{,}25$ ، فالسمكة هي الأقرب إلى سطح البحر.',
          ] },
        ],
      },
      {
        label: '2)', title: 'ترتيب المواضع',
        question: 'رتّب مواضع الكائنات الأربعة من الأعلى إلى الأخفض.',
        asks: ['الترتيب التنازلي'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tartib'], prompt: 'من الأعلى إلى الأخفض:',
            options: ['$8{,}5 > -3{,}25 > -12{,}5 > -41$', '$8{,}5 > -41 > -12{,}5 > -3{,}25$', '$-3{,}25 > 8{,}5 > -12{,}5 > -41$'], correct: 0, cols: 1,
            explain: 'الموجب أوّلًا، ثم السالبة من الأقرب إلى الصفر إلى الأبعد: $-3{,}25 > -12{,}5 > -41$ .' },
          { kind: 'solution', ask: 0, lines: [
            'النورس فوق الصفر فهو الأعلى: $8{,}5$ .',
            'ثم السالبة بحسب قربها من الصفر: $-3{,}25$ ثم $-12{,}5$ ثم $-41$ .',
            '$8{,}5 > -3{,}25 > -12{,}5 > -41$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'سمكة بين غوّاصين',
        question: 'تسبح سمكة صغيرة بين الغوّاص والغواصة. أيّ هذه الأعماق يمكن أن يكون عمقها؟',
        asks: ['العمق الممكن'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['hasr'], prompt: 'عمق السمكة بالمتر:', options: ['$-20$', '$-5$', '$-50$'], correct: 0, cols: 3,
            explain: '$-41 < -20 < -12{,}5$ : أبعد عن الصفر من الغوّاص وأقرب من الغواصة. $-5$ فوق الغوّاص و $-50$ تحت الغواصة.' },
          { kind: 'solution', ask: 0, lines: [
            'نبحث عن عدد $x$ يحقّق $-41 < x < -12{,}5$ ، أي مسافته إلى الصفر بين $12{,}5$ و $41$ .',
            '$x = -20$ يصلح: $-41 < -20 < -12{,}5$ .',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — حسابات الجمعية',
    context: 'ديون ورصيد',
    emoji: '🧾',
    tone: 'emerald',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [
      { title: 'كريم', icon: 'person', lines: [{ label: 'الرصيد', value: '-2 750 DA' }] },
      { title: 'ليلى', icon: 'person', lines: [{ label: 'الرصيد', value: '-2 075 DA' }] },
      { title: 'سفيان', icon: 'person', lines: [{ label: 'الرصيد', value: '-3 000 DA' }] },
    ], ariaLabel: 'ثلاث بطاقات: رصيد كريم سالب 2750 دينارًا، ورصيد ليلى سالب 2075، ورصيد سفيان سالب 3000' },
    statement: 'تسجّل جمعية الحيّ أرصدة أعضائها، وتوصي بالأمانة وسداد الديون في موعدها. الرصيد السالب دَين على صاحبه بالدينار الجزائري. أرصدة خمسة أعضاء: سلمى $+3400$ ، كريم $-2750$ ، ليلى $-2075$ ، ياسين $0$ ، سفيان $-3000$ .',
    data: [
      { id: 'a', text: 'سلمى +3400 ، ياسين 0', useful: true },
      { id: 'b', text: 'كريم −2750 ، ليلى −2075 ، سفيان −3000', useful: true },
      { id: 'c', text: 'الجمعية تجتمع كل شهر', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الأكثر مديونية',
        question: 'عيّن العضو الأقلّ رصيدًا، أي الأكثر مديونية.',
        asks: ['العضو الأقل رصيدًا'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['salibayn'], prompt: 'العضو الأكثر مديونية:', options: ['كريم', 'ليلى', 'سفيان'], correct: 2, cols: 3,
            explain: 'السالبة $-2750$ و $-2075$ و $-3000$ : الأبعد عن الصفر $-3000$ هو الأصغر، فسفيان مدين بالأكثر.' },
          { kind: 'solution', ask: 0, lines: [
            'الأرصدة السالبة: $-2750$ و $-2075$ و $-3000$ .',
            'المسافات إلى الصفر: $2750$ و $2075$ و $3000$ . الأكبر مسافة هو الأصغر: $-3000$ ، سفيان.',
          ] },
        ],
      },
      {
        label: '2)', title: 'ترتيب الأرصدة',
        question: 'رتّب الأرصدة الخمسة تصاعديًا.',
        asks: ['الترتيب التصاعدي'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tartib'], prompt: 'من الأصغر إلى الأكبر:',
            options: ['$-3000 < -2750 < -2075 < 0 < 3400$', '$-2075 < -2750 < -3000 < 0 < 3400$', '$0 < -2075 < -2750 < -3000 < 3400$'], correct: 0, cols: 1,
            explain: 'السالبة أوّلًا مرتّبة بالأبعد فالأقرب: $-3000 < -2750 < -2075$ ، ثم الصفر، ثم الرصيد الموجب.' },
          { kind: 'solution', ask: 0, lines: [
            'السالبة من الأبعد إلى الأقرب: $-3000$ ثم $-2750$ ثم $-2075$ .',
            'ثم $0$ ثم $3400$ : $-3000 < -2750 < -2075 < 0 < 3400$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'رصيد أكبر من $-2500$',
        question: 'كم عضوًا رصيده أكبر من $-2500$ ؟',
        asks: ['عدد الأعضاء'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['salibayn'], prompt: 'أيّ هذه الأرصدة أكبر من $-2500$ ؟',
            options: ['$-2075$', '$-2750$', '$-3000$'], correct: 0, cols: 3,
            explain: '$-2075$ أقرب إلى الصفر من $-2500$ فهو أكبر منه؛ أمّا $-2750$ و $-3000$ فأبعد، فهما أصغر.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['mukhtalifayn'], prompt: 'عدد الأعضاء الذين رصيدهم أكبر من $-2500$ :', expected: 3,
            explain: 'سلمى ($3400$) وياسين ($0$) وليلى ($-2075$): ثلاثة أعضاء.' },
          { kind: 'solution', ask: 0, lines: [
            'الأكبر من $-2500$ : كل رصيد موجب أو معدوم، وكل رصيد سالب مسافته إلى الصفر أقل من 2500.',
            'سلمى و ياسين و ليلى ($-2075$) ، إذن ثلاثة أعضاء.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
