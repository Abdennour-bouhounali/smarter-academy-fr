/**
 * What « خريطة المعارف » shows for lesson `natiqa-ghayr-natiqa` (v2): the lesson's mind map (its cards and their labelled
 * links), the memo sheet of each of its three keys, and where each card sits on the full map.
 *
 * Written FROM SCRATCH with the world's own numbers (`story.js › COURTS`): the court of 5,76 ridden by 2,4, the court of
 * 1,6 no mark rides, the court of two tiles whose side no fraction writes, the courts of 19 and 66 and their middle
 * marks. The map comes AFTER the forges: it may say « ناطق », « غير ناطق », « المدوَّر ». A card opens when its key is held
 * (`requires` is always a key); a card with `notebook` shows the memo sheet of its key. Only the kinds of `kit/text.js`.
 * The memo's `hook`, `trap` and `exam` are PLAIN text (no `$`): an equality in them is isolated left to right (`ltr`);
 * `rule`, `example`, `chip` are formulas with no Arabic. Every number a card states is computed here, and checked again
 * in `knowledge.test.js`.
 */
import { COURTS } from './story';
import { above, calculator, cut, K1, K2, K3, ltr, middle, read, rootOf, rounded, sq, tex } from './math';

/** What CHANGES in a rule of the memo sheet (red). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;
const frac = (x) => {
  const r = read(x);
  return `\\dfrac{${r.n}}{${r.d}}`;
};
const C = COURTS.sortC; // ridden by its root
const B = COURTS.sortB; // no mark rides it
/** The slip of the comma on B: the number whose square has B's digits two places further (0,4 for 1,6). */
const SLIP = '0,4';
const TWO = COURTS.two;
const T = COURTS.marksA; // the middle mark of a tenth leaves a band
const H = COURTS.marksB; // the middle mark of a hundredth jams
/** A fraction of the map's own: shown unreduced, its two terms squares once reduced. */
const REDUCE = { n: 32, d: 50 };
/** The fraction whose calculator display is a long row of digits, though a fraction writes its root. */
const LONG = '4/81';
/** The fractions of the chase, each one tile away from the court of two (p² − 2q² = ±1). */
const CHASE = [
  [17, 12],
  [41, 29],
];

export const KNOWLEDGE_GRAPH = {
  root: 'natiq',
  nodes: [
    {
      id: 'natiq',
      kind: 'concept',
      lane: 'center',
      requires: K1,
      title: 'العدد الناطق',
      subtitle: '$\\dfrac{p}{q}$',
      context: {
        text: `عدد يُكتب كسرًا حدّاه عددان طبيعيان: $${tex(B)} = ${frac(B)}$ و $${tex(COURTS.sortD)} = ${frac(COURTS.sortD)}$ عددان ناطقان، وكلّ عدد عشريّ عدد ناطق.`,
      },
      reveals: ['murabba-kasr', 'jidhr-natiq', 'ikhtizal'],
    },
    {
      id: 'murabba-kasr',
      kind: 'prerequisite',
      lane: 'end',
      requires: K1,
      title: 'مربّع كسر',
      subtitle: '$\\left(\\dfrac{a}{b}\\right)^2 = \\dfrac{a^2}{b^2}$',
      context: {
        text: `مربّع الكسر هو مربّع بسطه على مربّع مقامه: $\\dfrac{3}{7} \\times \\dfrac{3}{7} = \\dfrac{9}{49}$ ، $${tex(rootOf(COURTS.small))} \\times ${tex(rootOf(COURTS.small))} = ${tex(COURTS.small)}$.`,
      },
      reveals: [],
    },
    {
      id: 'jidhr-natiq',
      kind: 'definition',
      lane: 'center',
      requires: K1,
      notebook: true,
      title: 'جذر مربّع عدد ناطق',
      subtitle: `$\\sqrt{${tex(C)}} = ${tex(rootOf(C))}$`,
      reveals: ['ghayr-natiq', 'mudawwar'],
    },
    {
      id: 'ikhtizal',
      kind: 'method',
      lane: 'start',
      requires: K1,
      title: 'اختزل أوّلًا',
      subtitle: `$\\sqrt{\\dfrac{${REDUCE.n}}{${REDUCE.d}}}$`,
      context: {
        text: `$\\dfrac{${REDUCE.n}}{${REDUCE.d}} = ${tex(`${REDUCE.n}/${REDUCE.d}`)}$، وحدّاه مربّعان: $\\sqrt{\\dfrac{${REDUCE.n}}{${REDUCE.d}}} = ${tex(rootOf(`${REDUCE.n}/${REDUCE.d}`))}$.`,
      },
      reveals: [],
    },
    {
      id: 'ghayr-natiq',
      kind: 'definition',
      lane: 'end',
      requires: K2,
      notebook: true,
      title: 'العدد غير الناطق',
      subtitle: `$\\sqrt{${TWO}}$`,
      reveals: ['tard', 'hasiba'],
    },
    {
      id: 'tard',
      kind: 'example',
      lane: 'end',
      requires: K2,
      title: 'كسور تقترب',
      subtitle: `$\\dfrac{${CHASE[0][0]}}{${CHASE[0][1]}}$`,
      context: {
        list: CHASE.map(
          ([p, q]) => `$${p} \\times ${p} = ${p * p}$ و $${TWO} \\times ${q} \\times ${q} = ${Number(TWO) * q * q}$`,
        ),
        note: 'بلاطة واحدة بين مربّع البسط وضعف مربّع المقام، مهما كبر الكسر: الفرق لا يصير صفرًا.',
      },
      reveals: ['khata-fasila'],
    },
    {
      id: 'hasiba',
      kind: 'common_mistake',
      lane: 'center',
      requires: K2,
      title: 'أرقام كثيرة',
      subtitle: `$\\sqrt{${tex(LONG)}}$`,
      context: {
        parts: [
          {
            role: 'wrong',
            text: `الحاسبة تعرض للعدد $\\sqrt{${tex(LONG)}}$ القيمة $${tex(calculator(LONG))}$: أرقام كثيرة، إذن هو غير ناطق.`,
          },
          {
            role: 'why',
            text: `$${tex(rootOf(LONG))} \\times ${tex(rootOf(LONG))} = ${tex(LONG)}$: كسر يكتب الجذر، والحاسبة لا تعرض إلّا عشرة أرقام.`,
          },
          { role: 'right', text: `$\\sqrt{${tex(LONG)}} = ${tex(rootOf(LONG))}$ عدد ناطق.` },
        ],
      },
      reveals: [],
    },
    {
      id: 'khata-fasila',
      kind: 'common_mistake',
      lane: 'end',
      requires: K2,
      title: 'الفاصلة تخدع',
      subtitle: `$\\sqrt{${tex(B)}}$`,
      context: {
        parts: [
          { role: 'wrong', text: `$\\sqrt{${tex(B)}} = ${tex(SLIP)}$` },
          {
            role: 'why',
            text: `$${tex(SLIP)} \\times ${tex(SLIP)} = ${tex(sq(SLIP))}$، وليس $${tex(B)}$. و $${tex(B)} = ${frac(B)}$، و $${read(B).n}$ ليس مربّعًا.`,
          },
          {
            role: 'right',
            text: `$\\sqrt{${tex(B)}}$ عدد غير ناطق: $${tex(cut(B, 2))} < \\sqrt{${tex(B)}} < ${tex(above(B, 2))}$.`,
          },
        ],
      },
      reveals: ['khulasa'],
    },
    {
      id: 'mudawwar',
      kind: 'definition',
      lane: 'start',
      requires: K3,
      notebook: true,
      title: 'المدوَّر',
      subtitle: `$\\sqrt{${T}} \\approx ${tex(rounded(T, 1))}$`,
      reveals: ['wusta'],
    },
    {
      id: 'wusta',
      kind: 'method',
      lane: 'start',
      requires: K3,
      title: 'العلامة الوسطى',
      subtitle: `$${tex(middle(T, 1))}^2 = ${tex(sq(middle(T, 1)))}$`,
      context: {
        text: `بين $${tex(cut(T, 1))}$ و $${tex(above(T, 1))}$ العلامة الوسطى $${tex(middle(T, 1))}$: مربّعها أصغر من $${T}$، فالضلع بعدها، والمدوَّر إلى $0{,}1$ هو $${tex(rounded(T, 1))}$.`,
      },
      reveals: ['naqs-ziyada'],
    },
    {
      id: 'naqs-ziyada',
      kind: 'example',
      lane: 'start',
      requires: K3,
      title: 'ثلاث قيم',
      subtitle: `$${tex(cut(H, 2))} < \\sqrt{${H}} < ${tex(above(H, 2))}$`,
      context: {
        list: [`بالنقصان: $${tex(cut(H, 2))}$`, `بالزيادة: $${tex(above(H, 2))}$`, `المدوَّر: $${tex(rounded(H, 2))}$`],
        note: `$${tex(middle(H, 2))}^2 = ${tex(sq(middle(H, 2)))}$، أكبر من $${H}$: الضلع قبل المنتصف.`,
      },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa',
      kind: 'takeaway',
      lane: 'center',
      requires: K3,
      title: 'خلاصة الدرس',
      subtitle: 'ناطق أم غير ناطق؟',
      context: {
        text: '$\\sqrt{a}$ عدد ناطق حين يكون $a$ مربّع عدد ناطق، وإلّا فهو عدد غير ناطق: نحصره بين قيمتين مقرّبتين، ونعطي مدوَّره.',
      },
      reveals: [],
    },
  ],
  edges: [
    { from: 'natiq', to: 'murabba-kasr', label: 'تذكّر' },
    { from: 'natiq', to: 'jidhr-natiq', label: 'ضلع الساحة' },
    { from: 'natiq', to: 'ikhtizal', label: 'كسر' },
    { from: 'jidhr-natiq', to: 'ghayr-natiq', label: 'بلا كسر' },
    { from: 'jidhr-natiq', to: 'mudawwar', label: 'أقرب علامة' },
    { from: 'ghayr-natiq', to: 'tard', label: 'نطارده' },
    { from: 'ghayr-natiq', to: 'hasiba', label: 'خطأ شائع' },
    { from: 'tard', to: 'khata-fasila', label: 'خطأ شائع' },
    { from: 'mudawwar', to: 'wusta', label: 'كيف؟' },
    { from: 'wusta', to: 'naqs-ziyada', label: 'أدقّ' },
    { from: 'khata-fasila', to: 'khulasa', label: 'نستخلص' },
    { from: 'naqs-ziyada', to: 'khulasa', label: 'نستخلص' },
  ],
};

/** The quizzes' own numbers (none is a court of the story nor a radicand of the bank). */
const QUIZ = { frac: '98/200', dec: '0,0441', round: '23', bound: '15' };

/** The memo sheets of the three keys, one module each, in the order of the keys. */
export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: K1,
        type: 'regles',
        title: 'العدد الناطق',
        summary:
          'إذا كُتب العدد الموجب كسرًا غير قابل للاختزال حدّاه مربّعان، فجذره التربيعي عدد ناطق: جذر البسط على جذر المقام.',
        memo: {
          rule: `\\sqrt{\\dfrac{a^2}{b^2}}=${R('\\dfrac{a}{b}')}`,
          hook: 'اكتب المساحة كسرًا مختزلًا: هل حدّاه مربّعان؟',
          example: `${tex(C)}=${frac(C)}\\ \\Rightarrow\\ \\sqrt{${tex(C)}}=${R(frac(rootOf(C)))}=${tex(rootOf(C))}`,
          trap: `جذر ${B} ليس ${SLIP}: ${ltr(`${SLIP} × ${SLIP} = ${sq(SLIP)}`)}.`,
          exam: 'أكتب العدد تحت الجذر كسرًا وأختزله، ثمّ آخذ جذر البسط وجذر المقام.',
          chip: `\\sqrt{${tex(C)}}=${R(tex(rootOf(C)))}`,
          quiz: [
            {
              q: `$\\sqrt{\\dfrac{${read(QUIZ.frac).n * 2n}}{${read(QUIZ.frac).d * 2n}}} =$`,
              options: [`$${tex(rootOf(QUIZ.frac))}$`, `$${tex(QUIZ.frac)}$`, '$\\dfrac{7}{100}$'],
              correct: 0,
            },
            {
              q: `$\\sqrt{${tex(QUIZ.dec)}} =$`,
              options: [`$${tex(rootOf(QUIZ.dec))}$`, '$0{,}021$', '$2{,}1$'],
              correct: 0,
            },
          ],
        },
      },
    ],
    2: [
      {
        id: K2,
        type: 'regles',
        title: 'العدد غير الناطق',
        summary:
          'إذا لم يكن العدد الموجب a مربّع عدد ناطق، فإنّ √a عدد غير ناطق: لا كسر يكتبه، والحاسبة تعرض له قيمة مقرّبة.',
        memo: {
          rule: `\\sqrt{${TWO}}\\neq${R('\\dfrac{p}{q}')}`,
          hook: 'مهما اقترب الكسر من الضلع، لا يركب',
          example: `${tex(cut(TWO, 2))}<\\sqrt{${TWO}}<${tex(above(TWO, 2))}\\ ,\\ \\sqrt{${TWO}}\\approx${R(tex(calculator(TWO)))}`,
          trap: `أرقام الحاسبة الكثيرة لا تحكم: تعرض لجذر الكسر ${LONG} القيمة ${calculator(LONG)}، وهو ${rootOf(LONG)}.`,
          exam: 'أبحث هل العدد تحت الجذر مربّع عدد ناطق؛ إن لم يكن، فجذره عدد غير ناطق، وأكتب له قيمة مقرّبة.',
          chip: `\\sqrt{${TWO}}\\approx${R(tex(cut(TWO, 3)))}`,
          quiz: [
            {
              q: 'أيّ هذه الأعداد غير ناطق؟',
              options: [`$\\sqrt{${tex(COURTS.sortA)}}$`, `$\\sqrt{${T}}$`, '$\\sqrt{\\dfrac{9}{49}}$'],
              correct: 1,
            },
            {
              q: `$${tex(cut(TWO, 2))}^2 =$`,
              options: [`$${TWO}$`, `$${tex(sq(cut(TWO, 2)))}$`, '$2{,}82$'],
              correct: 1,
            },
          ],
        },
      },
    ],
    3: [
      {
        id: K3,
        type: 'regles',
        title: 'المدوَّر',
        summary: 'المدوَّر هو أقرب القيمتين المقرّبتين إلى الجذر: العلامة الوسطى بينهما تحكم.',
        memo: {
          rule: `(L+0{,}05)^2<a\\ \\Rightarrow\\ \\sqrt{a}\\approx${R('L+0{,}1')}`,
          hook: 'العلامة الوسطى تحكم: شريط فالكبرى، وتعلق فالصغرى',
          example: `${tex(middle(H, 2))}^2=${tex(sq(middle(H, 2)))}>${H}\\ \\Rightarrow\\ \\sqrt{${H}}\\approx${R(tex(rounded(H, 2)))}`,
          trap: `المدوَّر ليس دائمًا القيمة بالنقصان: مدوَّر جذر ${T} إلى ${ltr('0,1')} هو ${ltr(rounded(T, 1))} لا ${ltr(cut(T, 1))}.`,
          exam: 'أحصر الجذر بين قيمتين مقرّبتين، ثمّ أحسب مربّع المنتصف وأقارنه بالعدد تحت الجذر.',
          chip: `\\sqrt{${T}}\\approx${R(tex(rounded(T, 1)))}`,
          quiz: [
            {
              q: `مدوَّر $\\sqrt{${QUIZ.round}}$ إلى $0{,}1$ هو:`,
              options: [
                `$${tex(cut(QUIZ.round, 1))}$`,
                `$${tex(rounded(QUIZ.round, 1))}$`,
                `$${tex(middle(QUIZ.round, 1))}$`,
              ],
              correct: 1,
            },
            {
              q: `تعرض الحاسبة $\\sqrt{${QUIZ.bound}} \\approx ${tex(calculator(QUIZ.bound))}$. القيمة المقرّبة إلى $0{,}01$ بالنقصان:`,
              options: [
                `$${tex(cut(QUIZ.bound, 2))}$`,
                `$${tex(above(QUIZ.bound, 2))}$`,
                `$${tex(cut(QUIZ.bound, 1))}$`,
              ],
              correct: 0,
            },
          ],
        },
      },
    ],
  },
};

/**
 * Where each card sits on the MAP (percent of the map box, drawn left to right; the « start » lane is on the RIGHT) —
 * lesson 1's grid: columns at 17 / 50 / 83, rows 17–18 apart, so that every link label (at the middle of its link)
 * stays 8.5–9 % from the rows above and below.
 */
const POSITIONS = {
  natiq: [50, 5],
  'murabba-kasr': [17, 23],
  'jidhr-natiq': [50, 23],
  ikhtizal: [83, 23],
  'ghayr-natiq': [17, 41],
  mudawwar: [83, 41],
  tard: [17, 59],
  hasiba: [50, 59],
  wusta: [83, 59],
  'khata-fasila': [17, 76],
  'naqs-ziyada': [83, 76],
  khulasa: [50, 93],
};

export const KNOWLEDGE = { graph: KNOWLEDGE_GRAPH, modules: LESSON_KNOWLEDGE.modules, positions: POSITIONS };
