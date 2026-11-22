/**
 * What « خريطة المعارف » shows for lesson `ikhtizal-kasr` (v2): the lesson's mind map (its cards and their labelled
 * links), the memo sheet of each of its four keys, and where each card sits on the full map.
 *
 * Written with the story's own numbers (`NUMBERS` of math.js, never retyped). The memo items carry the ids of the four
 * KEYS, which is what `pack.coach` and the board's « بطاقة المعارف » name. A card is open when its key is held
 * (`requires` is always a key); a card with `notebook` shows the memo sheet of its key. Card kinds: only those of
 * `kit/text.js`. Every option of a memo quiz is computed by `journey.test.js`: a distractor is FALSE.
 */
import { COINS, NUMBERS, counted, fracTex as F, gcd, pgcdTex as P } from './math';

/** What CHANGES in a rule of the memo sheet (red). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;
/** « PGCD(a;b) » inside a memo formula. */
const p = (a, b) => `\\mathrm{PGCD}(${a};${b})`;
const { marahil: MA, ghayr: GH, thuluth: TH, tusu: TS, natija: NA } = NUMBERS;
const NA_MARK = NA.strokes[0] + NA.strokes[1];
const G_TH = gcd(TH.mark, TH.gap);
const G_TS = gcd(TS.mark, TS.gap);
const G_NA = gcd(NA_MARK, NA.gap);
/** 189/243 divided by 9 only: 21/27 — still reducible (by 3). */
const EARLY = 9;

export const KNOWLEDGE_GRAPH = {
  root: 'kasr-jisr',
  nodes: [
    {
      id: 'kasr-jisr',
      kind: 'concept',
      lane: 'center',
      requires: 'ikhtizal-marahil',
      title: 'جسر وجزء مضاء',
      subtitle: 'الجزء المضاء من الجسر كلّه كسر',
      context: {
        text: `جسر من ${MA.gap} خانة، أوّل ${MA.mark} منها مضاءة: لافتته تكتب $${F(MA.mark, MA.gap)}$. وكلّ لوح يثبت يكتب الجزء نفسه بعددين أصغر.`,
      },
      reveals: ['rappel', 'marahil', 'mithal-78'],
    },
    {
      id: 'rappel',
      kind: 'prerequisite',
      lane: 'start',
      requires: 'ikhtizal-marahil',
      title: 'كسران متساويان',
      subtitle: 'نضرب أو نقسم البسط والمقام على العدد نفسه',
      context: {
        text: `إذا قسمنا بسط كسر ومقامه على العدد نفسه (غير 0) حصلنا على كسر يساويه: $${F(MA.mark, MA.gap)} = ${F(MA.mark / 2, MA.gap / 2)}$.`,
      },
      reveals: [],
    },
    {
      id: 'marahil',
      kind: 'method',
      lane: 'center',
      requires: 'ikhtizal-marahil',
      notebook: true,
      title: 'نختزل كسرًا على مراحل',
      subtitle: 'قاسم مشترك بعد قاسم مشترك',
      reveals: ['khata-marahil', 'ghayr'],
    },
    {
      id: 'mithal-78',
      kind: 'example',
      lane: 'end',
      requires: 'ikhtizal-marahil',
      title: `${MA.mark} من ${MA.gap}`,
      subtitle: 'باللوح 2 ثمّ باللوح 6',
      context: {
        formula: `$${F(MA.mark, MA.gap)} = ${F(MA.mark / 2, MA.gap / 2)} = ${F(MA.mark / 6, MA.gap / 6)}$`,
        text: `اللوح 2 كتب الجزء المضاء ${MA.mark / 2} لوحًا من ${MA.gap / 2}، واللوح 6 كتبه ${MA.mark / 6} من ${MA.gap / 6}.`,
      },
      reveals: [],
    },
    {
      id: 'khata-marahil',
      kind: 'common_mistake',
      lane: 'start',
      requires: 'ikhtizal-marahil',
      title: 'قسمة البسط وحده',
      subtitle: 'هل يبقى الكسر نفسه؟',
      context: {
        parts: [
          { role: 'wrong', text: `$${F(MA.mark, MA.gap)} = ${F(MA.mark / 2, MA.gap)}$` },
          { role: 'why', text: 'قسمنا البسط على 2 والمقام لم يُقسم: الجزء المضاء صار نصف ما كان.' },
          { role: 'right', text: `$${F(MA.mark, MA.gap)} = ${F(MA.mark / 2, MA.gap / 2)}$: البسط والمقام على 2 معًا.` },
        ],
      },
      reveals: [],
    },
    {
      id: 'ghayr',
      kind: 'relationship',
      lane: 'center',
      requires: 'ghayr-qabil',
      notebook: true,
      title: 'كسر غير قابل للاختزال',
      subtitle: 'بسطه ومقامه أوّليّان فيما بينهما',
      reveals: ['mithal-48', 'pgcd', 'khata-ghayr'],
    },
    {
      id: 'mithal-48',
      kind: 'example',
      lane: 'start',
      requires: 'ghayr-qabil',
      title: `${GH.mark} من ${GH.gap}`,
      subtitle: `$${P(GH.mark, GH.gap)} = 1$`,
      context: {
        formula: `$${GH.mark} = 3 \\times ${Math.floor(GH.mark / 3)} + ${GH.mark % 3}$`,
        text: `اللوح 3 ملأ ${GH.gap} خانة ولم يقع على العمود، و5 و7 لم يملآ الجسر: اللوح 1 ثبّته، واللافتة بقيت $${F(GH.mark, GH.gap)}$.`,
      },
      reveals: [],
    },
    {
      id: 'khata-ghayr',
      kind: 'common_mistake',
      lane: 'end',
      requires: 'ghayr-qabil',
      title: 'البسط والمقام ليسا أوّليّين',
      subtitle: 'فهل يُختزل الكسر؟',
      context: {
        parts: [
          { role: 'wrong', text: `${GH.mark} و ${GH.gap} ليسا عددين أوّليّين، إذن $${F(GH.mark, GH.gap)}$ يُختزل.` },
          { role: 'why', text: `قواسم ${GH.mark} هي 1 و 5 و 7 و 35، ولا يقسم أيّ منها ${GH.gap} إلّا 1.` },
          { role: 'right', text: `$${P(GH.mark, GH.gap)} = 1$: الكسر غير قابل للاختزال.` },
        ],
      },
      reveals: [],
    },
    {
      id: 'pgcd',
      kind: 'method',
      lane: 'center',
      requires: 'ikhtizal-pgcd',
      notebook: true,
      title: 'نختزل بالقاسم المشترك الأكبر',
      subtitle: 'قسمة واحدة حتّى الشكل غير القابل للاختزال',
      reveals: ['mithal-99', 'natija', 'khata-pgcd'],
    },
    {
      id: 'mithal-99',
      kind: 'example',
      lane: 'start',
      requires: 'ikhtizal-pgcd',
      title: `${TH.mark} من ${TH.gap}`,
      subtitle: `$${P(TH.mark, TH.gap)} = ${G_TH}$`,
      context: {
        formula: `$${F(TH.mark, TH.gap)} = ${F(TH.mark / G_TH, TH.gap / G_TH)}$`,
        text: `في الكيس ${counted(TH.purse, COINS)} فقط: اللوح ${G_TH} وحده دُفع ثمنه، فكتبت اللافتة الشكل غير القابل للاختزال مرّة واحدة.`,
      },
      reveals: [],
    },
    {
      id: 'khata-pgcd',
      kind: 'common_mistake',
      lane: 'end',
      requires: 'ikhtizal-pgcd',
      title: 'التوقّف قبل النهاية',
      subtitle: `$${F(TS.mark / EARLY, TS.gap / EARLY)}$ هل انتهى؟`,
      context: {
        parts: [
          {
            role: 'wrong',
            text: `$${F(TS.mark, TS.gap)} = ${F(TS.mark / EARLY, TS.gap / EARLY)}$، وهذا هو الشكل غير القابل للاختزال.`,
          },
          {
            role: 'why',
            text: `$${P(TS.mark / EARLY, TS.gap / EARLY)} = ${gcd(TS.mark / EARLY, TS.gap / EARLY)}$: الكسر يُختزل بعد.`,
          },
          {
            role: 'right',
            text: `$${P(TS.mark, TS.gap)} = ${G_TS}$، إذن $${F(TS.mark, TS.gap)} = ${F(TS.mark / G_TS, TS.gap / G_TS)}$.`,
          },
        ],
      },
      reveals: [],
    },
    {
      id: 'natija',
      kind: 'method',
      lane: 'center',
      requires: 'natija-mukhtazala',
      notebook: true,
      title: 'نختزل نتيجة الحساب',
      subtitle: 'نحسب، ثمّ نختزل',
      reveals: ['mithal-39', 'khata-natija', 'khulasa'],
    },
    {
      id: 'mithal-39',
      kind: 'example',
      lane: 'start',
      requires: 'natija-mukhtazala',
      title: `${NA.strokes[0]} ثمّ ${NA.strokes[1]} من ${NA.gap}`,
      subtitle: `$= ${F(NA_MARK / G_NA, NA.gap / G_NA)}$`,
      context: {
        formula: `$${F(NA.strokes[0], NA.gap)} + ${F(NA.strokes[1], NA.gap)} = ${F(NA_MARK, NA.gap)} = ${F(NA_MARK / G_NA, NA.gap / G_NA)}$`,
        text: `الضربتان أضاءتا ${NA_MARK} خانة من ${NA.gap}، واللوح ${G_NA} كتب النتيجة على الشكل غير القابل للاختزال.`,
      },
      reveals: [],
    },
    {
      id: 'khata-natija',
      kind: 'common_mistake',
      lane: 'center',
      requires: 'natija-mukhtazala',
      title: 'جمع المقامين',
      subtitle: 'هل يطول الجسر؟',
      context: {
        parts: [
          {
            role: 'wrong',
            text: `$${F(NA.strokes[0], NA.gap)} + ${F(NA.strokes[1], NA.gap)} = ${F(NA_MARK, 2 * NA.gap)}$`,
          },
          { role: 'why', text: `الجسر لم يطل: ما زال ${NA.gap} خانة. نجمع البسطين فقط، والمقام يبقى ${NA.gap}.` },
          {
            role: 'right',
            text: `$${F(NA.strokes[0], NA.gap)} + ${F(NA.strokes[1], NA.gap)} = ${F(NA_MARK, NA.gap)} = ${F(NA_MARK / G_NA, NA.gap / G_NA)}$`,
          },
        ],
      },
      reveals: [],
    },
    {
      id: 'khulasa',
      kind: 'takeaway',
      lane: 'end',
      requires: 'natija-mukhtazala',
      title: 'كيف أختزل؟',
      subtitle: 'أحسب · PGCD · أقسم',
      context: {
        text: 'أُجري الحساب أوّلًا، ثمّ أحسب القاسم المشترك الأكبر للبسط والمقام، وأقسمهما عليه.',
        note: 'وإذا كان القاسم المشترك الأكبر 1 فالكسر غير قابل للاختزال: انتهيت.',
      },
      reveals: [],
    },
  ],
  edges: [
    { from: 'kasr-jisr', to: 'rappel', label: 'تذكّر' },
    { from: 'kasr-jisr', to: 'marahil', label: 'نختزل' },
    { from: 'kasr-jisr', to: 'mithal-78', label: 'مثال' },
    { from: 'marahil', to: 'khata-marahil', label: 'خطأ شائع' },
    { from: 'marahil', to: 'ghayr', label: 'حتّى' },
    { from: 'ghayr', to: 'mithal-48', label: 'مثال' },
    { from: 'ghayr', to: 'pgcd', label: 'أسرع' },
    { from: 'ghayr', to: 'khata-ghayr', label: 'خطأ شائع' },
    { from: 'pgcd', to: 'mithal-99', label: 'مثال' },
    { from: 'pgcd', to: 'natija', label: 'والحساب' },
    { from: 'pgcd', to: 'khata-pgcd', label: 'خطأ شائع' },
    { from: 'natija', to: 'mithal-39', label: 'مثال' },
    { from: 'natija', to: 'khata-natija', label: 'خطأ شائع' },
    { from: 'natija', to: 'khulasa', label: 'نستخلص' },
  ],
};

/** The memo sheets of the four keys, in the order of the keys (1: 🪜, 2: 🔒, 3: 🎯, 4: 🧾). */
export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'ikhtizal-marahil',
        type: 'methodes',
        title: 'نختزل كسرًا على مراحل',
        summary:
          'نقسم بسط الكسر ومقامه على قاسم مشترك لهما، ونعيد ما دام لهما قاسم مشترك غير 1: كلّ كسر نكتبه يساوي الأوّل.',
        memo: {
          rule: `${F('a', 'b')}=${F(`a\\div ${R('d')}`, `b\\div ${R('d')}`)}`,
          hook: 'لوح أطول، ألواح أقلّ، والجزء المضاء نفسه',
          example: `${F(MA.mark, MA.gap)}=${F(MA.mark / 2, MA.gap / 2)}=${F(MA.mark / 6, MA.gap / 6)}`,
          trap: 'قسمة البسط وحده، أو قسمة البسط والمقام على عددين مختلفين',
          exam: 'أقسم البسط والمقام على القاسم المشترك نفسه، وأكتب الكسر الناتج',
          chip: `\\div ${R('d')}`,
          quiz: [
            {
              q: `$${F(MA.mark, MA.gap)} = ${F(MA.mark / 2, '\\ldots')}$`,
              options: [`$${MA.gap}$`, `$${MA.gap / 2}$`, `$${MA.gap - MA.mark / 2}$`],
              correct: 1,
            },
            {
              q: `نقسم بسط $${F(MA.mark / 2, MA.gap / 2)}$ ومقامه على:`,
              options: ['$2$', '$3$', '$9$'],
              correct: 1,
            },
          ],
        },
      },
    ],
    2: [
      {
        id: 'ghayr-qabil',
        type: 'regles',
        title: 'كسر غير قابل للاختزال',
        summary: 'يكون الكسر غير قابل للاختزال إذا كان بسطه ومقامه أوّليّين فيما بينهما: قاسمهما المشترك الأكبر 1.',
        memo: {
          rule: `${p('a', 'b')}=${R('1')}`,
          hook: 'لا لوح يثبت الجسر إلّا 1: اللافتة لا تتغيّر',
          example: `${p(GH.mark, GH.gap)}=${R('1')}`,
          trap: 'الخلط بين عددين أوّليّين وعددين أوّليّين فيما بينهما: 35 و 48 ليسا أوّليّين، والكسر لا يُختزل',
          exam: 'أحسب القاسم المشترك الأكبر للبسط والمقام وأقارنه بالعدد 1',
          chip: `${p('a', 'b')}=${R('1')}`,
          quiz: [
            {
              q: 'أيّ كسر غير قابل للاختزال؟',
              options: [`$${F(MA.mark, MA.gap)}$`, `$${F(GH.mark, GH.gap)}$`, `$${F(MA.mark / 2, MA.gap / 2)}$`],
              correct: 1,
            },
            {
              q: `$${P(GH.mark, GH.gap)} =$`,
              options: ['$1$', '$5$', '$7$'],
              correct: 0,
            },
          ],
        },
      },
    ],
    3: [
      {
        id: 'ikhtizal-pgcd',
        type: 'methodes',
        title: 'نختزل بالقاسم المشترك الأكبر',
        summary:
          'نقسم البسط والمقام على قاسمهما المشترك الأكبر: نحصل مباشرةً على الكسر غير القابل للاختزال الذي يساويه.',
        memo: {
          rule: `${F('a', 'b')}=${F(`a\\div ${R('g')}`, `b\\div ${R('g')}`)}\\ ,\\ ${R('g')}=${p('a', 'b')}`,
          hook: 'أطول لوح يثبت: أقلّ عدد من الألواح',
          example: `${F(TS.mark, TS.gap)}=${F(TS.mark / G_TS, TS.gap / G_TS)}`,
          trap: `التوقّف قبل النهاية: ${TS.mark / EARLY} و ${TS.gap / EARLY} ما زالا يقبلان القسمة على 3`,
          exam: 'أحسب القاسم المشترك الأكبر بخوارزمية إقليدس، ثمّ أقسم عليه البسط والمقام',
          chip: `\\div ${R('g')}`,
          quiz: [
            {
              q: `$${P(TH.mark, TH.gap)} = ${G_TH}$. إذن $${F(TH.mark, TH.gap)} =$`,
              options: [
                `$${F(TH.mark / 3, TH.gap / 3)}$`,
                `$${F(TH.mark / G_TH, TH.gap / G_TH)}$`,
                `$${F(TH.mark / 11, TH.gap / 11)}$`,
              ],
              correct: 1,
            },
            {
              q: `الشكل غير القابل للاختزال للكسر $${F(TS.mark, TS.gap)}$:`,
              options: [
                `$${F(TS.mark / EARLY, TS.gap / EARLY)}$`,
                `$${F(TS.mark / 3, TS.gap / 3)}$`,
                `$${F(TS.mark / G_TS, TS.gap / G_TS)}$`,
              ],
              correct: 2,
            },
          ],
        },
      },
    ],
    4: [
      {
        id: 'natija-mukhtazala',
        type: 'methodes',
        title: 'نختزل نتيجة الحساب',
        summary:
          'نُجري الحساب أوّلًا، ثمّ نكتب الكسر الناتج على الشكل غير القابل للاختزال بالقسمة على القاسم المشترك الأكبر.',
        memo: {
          rule: `${F('a', 'n')}+${F('b', 'n')}=${F('a+b', R('n'))}`,
          hook: 'الضربتان أضاءتا جزءًا واحدًا من الجسر نفسه',
          example: `${F(NA.strokes[0], NA.gap)}+${F(NA.strokes[1], NA.gap)}=${F(NA_MARK, NA.gap)}=${F(NA_MARK / G_NA, NA.gap / G_NA)}`,
          trap: 'جمع المقامين أيضًا، أو التوقّف عند الكسر الناتج دون اختزاله',
          exam: 'أكتب الحساب، ثمّ الكسر الناتج، ثمّ شكله غير القابل للاختزال',
          chip: `${F('a+b', R('n'))}`,
          quiz: [
            {
              q: `$${F(NA.strokes[0], NA.gap)} + ${F(NA.strokes[1], NA.gap)}$ على الشكل غير القابل للاختزال:`,
              options: [
                `$${F(NA_MARK, 2 * NA.gap)}$`,
                `$${F(NA_MARK / G_NA, NA.gap / G_NA)}$`,
                `$${F(NA_MARK, NA.gap)}$`,
              ],
              correct: 1,
            },
            {
              q: `$${F(17, 30)} + ${F(11, 30)} =$`,
              options: [`$${F(28, 60)}$`, `$${F(14, 15)}$`, `$${F(7, 15)}$`],
              correct: 1,
            },
          ],
        },
      },
    ],
  },
};

/**
 * Where each node sits on the MAP (percent of the map box, drawn left-to-right) — the rows and columns of lesson 6's
 * map, which the walks measured (`bahth-pgcd/world/knowledge.js`): rows 5, 23, 41, 59, 76, 93 (15 cards, as lesson
 * 6), three cards a row at most, on the columns 17 %, 50 %, 83 % (a card is at most 15rem wide: at 17 % / 83 % it stays
 * inside the box — 1366 × 768: 13 px to the edge, as measured on lesson 5). Every link joins two NEIGHBOUR rows, so its
 * label sits at 8.5 % or more from both rows, never under a card.
 */
const POSITIONS = {
  'kasr-jisr': [50, 5],
  rappel: [17, 23],
  marahil: [50, 23],
  'mithal-78': [83, 23],
  'khata-marahil': [17, 41],
  ghayr: [50, 41],
  'mithal-48': [17, 59],
  pgcd: [50, 59],
  'khata-ghayr': [83, 59],
  'mithal-99': [17, 76],
  natija: [50, 76],
  'khata-pgcd': [83, 76],
  'mithal-39': [17, 93],
  'khata-natija': [50, 93],
  khulasa: [83, 93],
};

export const KNOWLEDGE = { graph: KNOWLEDGE_GRAPH, modules: LESSON_KNOWLEDGE.modules, positions: POSITIONS };
