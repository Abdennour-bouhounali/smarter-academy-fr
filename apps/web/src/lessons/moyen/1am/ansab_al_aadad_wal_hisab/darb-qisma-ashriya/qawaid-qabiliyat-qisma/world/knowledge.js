/**
 * What « خريطة المعارف » shows for lesson `qawaid-qabiliyat-qisma` (v2): the lesson's mind map (its cards and their
 * labelled links), the memo sheet of each of its four keys, and where each card sits on the full map.
 *
 * Written with the story's own numbers (`NUMBERS` of story.js — never retyped). The memo items carry the ids of the four
 * KEYS, which is what `pack.coach` and the board's « بطاقة المعارف » name. A card is open when its key is held
 * (`requires` is always a key); a card with `notebook` shows the memo sheet of its key.
 *
 * A memo's `rule` is drawn as a formula by every screen that shows it (`$rule$`). For 11-year-olds the three reading rules
 * are written in WORDS (`words`, below): no letter standing for a digit, no set, no arrow, no bar over digits. Each row
 * is ONE Arabic sentence that begins with a letter and ends with a letter or a number — the formula box is laid left to
 * right, and a row that began or ended with a sign would be drawn out of order. `example` is one worked number, its
 * digits that are read in red.
 */
import { NUMBERS } from './story';
import { digitSum, digitsOf } from './practice';

/** What CHANGES in a rule of the memo sheet (red). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;
/** Words inside a formula; `key` words are the red ones. */
const W = (text) => `\\text{${text}}`;
const KW = (text) => R(W(text));
/** A rule written in words: one sentence per row, each row a list of pieces already wrapped by `W` / `KW`. */
const words = (...rows) => `\\begin{array}{c}${rows.map((row) => row.join('')).join('\\\\ ')}\\end{array}`;
const { units: U, sum: S, last2: L, boss: B } = NUMBERS;
const [G35, G46] = U.gaps;
const times = (n, d) => `${n} = ${d} \\times ${n / d}`;
/** A number with the digits a key reads in red: its units digit, or its last two digits. */
const readUnits = (n) => `${Math.floor(n / 10)}${R(n % 10)}`;
const readLast2 = (n) => `${Math.floor(n / 100)}${R(String(n % 100).padStart(2, '0'))}`;
const division = (a, b) => `${a} = ${b} \\times ${Math.floor(a / b)} + ${a % b}`;
/** The trap of 9: the story's 111 is a multiple of 3 and not of 9. */
const T39 = S.use;
/** The trap of 4: an even number whose last two digits are not a multiple of 4 (134: 34 = 4 × 8 + 2). */
const EVEN = L.use - 2;
/** The store's plank that does NOT fill the last gap. */
const NO = B.options.find((b) => B.gap % b !== 0);

export const KNOWLEDGE_GRAPH = {
  root: 'qabiliya',
  nodes: [
    {
      id: 'qabiliya',
      kind: 'concept',
      lane: 'center',
      requires: 'raqm-alahad',
      title: 'نعرف دون أن نقسم',
      subtitle: `$${times(U.use, 5)}$`,
      context: { text: `آلة القسمة تعطّلت، والهوّة ${U.use} خانة. ماذا يكفي أن ننظر إليه في العدد؟` },
      reveals: ['ahad', 'majmu', 'akhirayn'],
    },
    {
      id: 'ahad',
      kind: 'relationship',
      lane: 'start',
      requires: 'raqm-alahad',
      notebook: true,
      title: 'رقم الآحاد',
      subtitle: 'القسمة على 2 و 5',
      reveals: ['khata-sifr', 'baqi'],
    },
    {
      id: 'khata-sifr',
      kind: 'common_mistake',
      lane: 'start',
      requires: 'raqm-alahad',
      title: 'و 0؟',
      subtitle: `$${times(G35 * 10, 5)}$`,
      context: {
        parts: [
          { role: 'wrong', text: 'يقبل العدد القسمة على 5 فقط إذا كان رقم آحاده 5.' },
          { role: 'why', text: `$${times(G35 * 10, 5)}$: رقم آحاده 0، ويقبل القسمة على 5.` },
          { role: 'right', text: 'رقم الآحاد 0 أو 5. ورقم الآحاد 0 يعني القسمة على 2 وعلى 5 معًا.' },
        ],
      },
      reveals: [],
    },
    {
      id: 'majmu',
      kind: 'relationship',
      lane: 'center',
      requires: 'majmu-arqam',
      notebook: true,
      title: 'مجموع الأرقام',
      subtitle: 'القسمة على 3 و 9',
      reveals: ['mithal-majmu', 'khata-3-9', 'baqi'],
    },
    {
      id: 'mithal-majmu',
      kind: 'example',
      lane: 'center',
      requires: 'majmu-arqam',
      title: `الهوّة ${S.gap}`,
      subtitle: `$${digitsOf(S.gap).join(' + ')} = ${digitSum(S.gap)}$`,
      context: {
        formula: `$${times(S.gap, S.plank)}$`,
        text: `مجموع أرقام ${S.gap} هو ${digitSum(S.gap)}: يقبل القسمة على 9، فاللوح ${S.plank} يملأ الهوّة.`,
      },
      reveals: [],
    },
    {
      id: 'khata-3-9',
      kind: 'common_mistake',
      lane: 'center',
      requires: 'majmu-arqam',
      title: '3 أم 9؟',
      subtitle: `$${digitsOf(T39).join(' + ')} = ${digitSum(T39)}$`,
      context: {
        parts: [
          { role: 'wrong', text: `${T39} يقبل القسمة على 3، إذن ${T39} يقبل القسمة على 9.` },
          { role: 'why', text: `مجموع أرقامه ${digitSum(T39)}، و $${division(T39, 9)}$.` },
          {
            role: 'right',
            text: 'كلّ عدد يقبل القسمة على 9 يقبل القسمة على 3، والعكس لا يصحّ دائمًا.',
          },
        ],
      },
      reveals: [],
    },
    {
      id: 'akhirayn',
      kind: 'relationship',
      lane: 'end',
      requires: 'raqmayn-akhirayn',
      notebook: true,
      title: 'الرقمان الأخيران',
      subtitle: 'القسمة على 4',
      reveals: ['limatha-100', 'khata-zawji', 'baqi'],
    },
    {
      id: 'limatha-100',
      kind: 'tip',
      lane: 'end',
      requires: 'raqmayn-akhirayn',
      title: 'لماذا يكفي رقمان؟',
      subtitle: '$100 = 4 \\times 25$',
      context: {
        formula: `$${L.use} = 100 + ${L.use % 100}$`,
        text: `كلّ مئة تقبل القسمة على 4، فلا يبقى إلا ما يكتبه الرقمان الأخيران: ${L.use % 100}.`,
      },
      reveals: [],
    },
    {
      id: 'khata-zawji',
      kind: 'common_mistake',
      lane: 'end',
      requires: 'raqmayn-akhirayn',
      title: 'كلّ زوجي؟',
      subtitle: `$${division(EVEN % 100, 4)}$`,
      context: {
        parts: [
          { role: 'wrong', text: `${EVEN} عدد زوجي، إذن ${EVEN} يقبل القسمة على 4.` },
          { role: 'why', text: `الرقمان الأخيران ${EVEN % 100}، و $${division(EVEN % 100, 4)}$.` },
          { role: 'right', text: 'كلّ عدد يقبل القسمة على 4 زوجي، وليس كلّ عدد زوجي يقبل القسمة على 4.' },
        ],
      },
      reveals: [],
    },
    {
      id: 'baqi',
      kind: 'relationship',
      lane: 'center',
      requires: 'baqi-sifr',
      notebook: true,
      title: 'الباقي معدوم',
      subtitle: '$a = b \\times q + 0$',
      reveals: ['siyagh', 'khulasa'],
    },
    {
      id: 'siyagh',
      kind: 'example',
      lane: 'start',
      requires: 'baqi-sifr',
      title: 'ثلاث جمل، معنى واحد',
      subtitle: `$${B.gap} = ${B.plank} \\times ${B.gap / B.plank} + 0$`,
      context: {
        list: [`${B.gap} يقبل القسمة على ${B.plank}`, `${B.gap} مضاعف للعدد ${B.plank}`, `${B.plank} يقسم ${B.gap}`],
      },
      reveals: [],
    },
    {
      id: 'khulasa',
      kind: 'takeaway',
      lane: 'center',
      requires: 'baqi-sifr',
      title: 'أقرأ قبل أن أقسم',
      subtitle: 'الآحاد · مجموع الأرقام · الرقمان الأخيران',
      context: {
        text: 'على 2 و 5: رقم الآحاد. على 3 و 9: مجموع الأرقام. على 4: العدد المشكّل من رقمَي الآحاد والعشرات.',
        note: 'ولأيّ قاسم آخر: نُجري القسمة الإقليدية، والعدد يقبل القسمة عندما يكون الباقي 0.',
      },
      reveals: [],
    },
  ],
  edges: [
    { from: 'qabiliya', to: 'ahad', label: 'رقم واحد' },
    { from: 'qabiliya', to: 'majmu', label: 'كلّ الأرقام' },
    { from: 'qabiliya', to: 'akhirayn', label: 'رقمان' },
    { from: 'ahad', to: 'khata-sifr', label: 'خطأ شائع' },
    { from: 'majmu', to: 'mithal-majmu', label: 'مثال' },
    { from: 'majmu', to: 'khata-3-9', label: 'خطأ شائع' },
    { from: 'akhirayn', to: 'limatha-100', label: 'لماذا؟' },
    { from: 'akhirayn', to: 'khata-zawji', label: 'خطأ شائع' },
    { from: 'ahad', to: 'baqi', label: 'الباقي 0' },
    { from: 'majmu', to: 'baqi', label: 'الباقي 0' },
    { from: 'akhirayn', to: 'baqi', label: 'الباقي 0' },
    { from: 'baqi', to: 'siyagh', label: 'نقولها' },
    { from: 'baqi', to: 'khulasa', label: 'نستخلص' },
  ],
};

/**
 * The memo sheets of the four keys, by the module of the lesson that teaches them (its config: module 1 the units digit
 * and the sum of the digits, module 2 « يقبل القسمة » by the remainder, module 3 the last two digits).
 */
export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'raqm-alahad',
        type: 'regles',
        title: 'رقم الآحاد: القسمة على 2 و 5',
        summary: 'رقم الآحاد وحده يكفي: 0 أو 2 أو 4 أو 6 أو 8 للقسمة على 2، و 0 أو 5 للقسمة على 5.',
        memo: {
          rule: words(
            [W('رقم الآحاد '), KW('0، 2، 4، 6 أو 8'), W(': يقبل القسمة على 2')],
            [W('رقم الآحاد '), KW('0 أو 5'), W(': يقبل القسمة على 5')],
          ),
          hook: 'رقم واحد يكفي: رقم الآحاد',
          example: `${readUnits(G46)}=2\\times ${G46 / 2}\\ ,\\ ${readUnits(U.use)}=5\\times ${U.use / 5}`,
          trap: 'نسيان 0: كلّ عدد رقم آحاده 0 يقبل القسمة على 2 وعلى 5',
          exam: 'أكتب: رقم آحاد العدد هو … إذن يقبل (أو لا يقبل) القسمة على …',
          chip: `\\ldots${R('0')},\\ \\ldots${R('5')}`,
          quiz: [
            {
              q: `أيّ هذه الأعداد يقبل القسمة على 5؟`,
              options: [`$${G46}$`, `$${G35 * 10 + 4}$`, `$${G35 * 10}$`],
              correct: 2,
            },
            {
              q: 'عدد رقم آحاده 0:',
              options: ['يقبل القسمة على 2 فقط', 'يقبل القسمة على 2 وعلى 5', 'لا يقبل القسمة على 5'],
              correct: 1,
            },
          ],
        },
      },
      {
        id: 'majmu-arqam',
        type: 'regles',
        title: 'مجموع الأرقام: القسمة على 3 و 9',
        summary: 'نجمع أرقام العدد: إذا قبل المجموع القسمة على 3 (أو 9) قبلها العدد.',
        memo: {
          rule: words(
            [KW('مجموع الأرقام'), W(' يقبل القسمة على 3: العدد كذلك')],
            [KW('مجموع الأرقام'), W(' يقبل القسمة على 9: العدد كذلك')],
          ),
          hook: 'كلّ الأرقام معًا: نجمعها',
          example: `${digitsOf(S.gap).join('+')}=${R(digitSum(S.gap))}\\ ,\\ ${times(S.gap, S.plank)}`,
          trap: `الخلط بين 3 و 9: ${T39} يقبل القسمة على 3 ولا يقبل القسمة على 9`,
          exam: 'أكتب: مجموع أرقام العدد … = … ، و … يقبل (أو لا يقبل) القسمة على …',
          chip: `${digitsOf(S.gap).join('+')}=${R(digitSum(S.gap))}`,
          quiz: [
            {
              q: `مجموع أرقام $${T39}$ هو $${digitSum(T39)}$. إذن $${T39}$:`,
              options: ['يقبل القسمة على 9', 'يقبل القسمة على 3 ولا يقبل القسمة على 9', 'لا يقبل القسمة على 3'],
              correct: 1,
            },
            {
              q: 'كلّ عدد يقبل القسمة على 9:',
              options: ['يقبل القسمة على 3', 'لا يقبل القسمة على 3', 'رقم آحاده 9'],
              correct: 0,
            },
          ],
        },
      },
    ],
    2: [
      {
        id: 'baqi-sifr',
        type: 'regles',
        title: 'يقبل القسمة ⇔ الباقي معدوم',
        summary: 'يقبل العدد a القسمة على b عندما يكون باقي القسمة الإقليدية للعدد a على b معدومًا.',
        memo: {
          rule: `a=b\\times q+${R('0')}`,
          hook: 'الباقي 0: يقبل القسمة · مضاعف · يقسم',
          example: `${B.gap}=${B.plank}\\times${B.gap / B.plank}+${R('0')}`,
          trap: `قلب العددين: نقول «${B.plank} يقسم ${B.gap}» ولا نقول «${B.gap} يقسم ${B.plank}»`,
          exam: 'أكتب القسمة الإقليدية، ثمّ: الباقي معدوم إذن … يقبل القسمة على …',
          chip: `r=${R('0')}`,
          quiz: [
            {
              q: `$${division(B.gap, NO)}$. إذن:`,
              options: [
                `$${B.gap}$ يقبل القسمة على $${NO}$`,
                `$${B.gap}$ لا يقبل القسمة على $${NO}$`,
                `$${NO}$ يقسم $${B.gap}$`,
              ],
              correct: 1,
            },
            {
              q: `$${B.gap} = ${B.plank} \\times ${B.gap / B.plank} + 0$. أيّ جملة صحيحة؟`,
              options: [
                `$${B.gap}$ يقسم $${B.plank}$`,
                `$${B.gap}$ مضاعف للعدد $${B.plank}$`,
                `$${B.plank}$ يقبل القسمة على $${B.gap}$`,
              ],
              correct: 1,
            },
          ],
        },
      },
    ],
    3: [
      {
        id: 'raqmayn-akhirayn',
        type: 'regles',
        title: 'الرقمان الأخيران: القسمة على 4',
        summary: 'نقرأ العدد المشكّل من رقمَي الآحاد والعشرات: إذا قبل القسمة على 4 قبلها العدد كلّه.',
        memo: {
          rule: words([KW('العدد المشكّل من رقمَي الآحاد والعشرات')], [W('يقبل القسمة على 4: العدد كلّه كذلك')]),
          hook: 'رقمان يكفيان: المئات كلّها تقبل القسمة على 4',
          example: `${readLast2(L.use)}=${L.use - (L.use % 100)}+${R(L.use % 100)}\\ ,\\ ${R(L.use % 100)}=4\\times ${(L.use % 100) / 4}`,
          trap: `الاكتفاء بالزوجي: ${EVEN} زوجي ولا يقبل القسمة على 4`,
          exam: 'أكتب: العدد المشكّل من رقمَي الآحاد والعشرات هو … و … يقبل (أو لا يقبل) القسمة على 4',
          chip: readLast2(L.use),
          quiz: [
            {
              q: 'أيّ هذه الأعداد يقبل القسمة على 4؟',
              options: [`$${EVEN}$`, `$${L.use}$`, `$${L.use + 1}$`],
              correct: 1,
            },
            {
              q: `لماذا لا ننظر إلى المئات في $${L.use}$؟`,
              options: ['لأنّها صغيرة', 'لأنّ $100 = 4 \\times 25$', 'لأنّ رقم المئات فردي'],
              correct: 1,
            },
          ],
        },
      },
    ],
  },
};

/** Where each node sits on the MAP (percent of the map box, drawn left-to-right; the lesson's « start » lane is on the RIGHT). */
const POSITIONS = {
  qabiliya: [50, 7],
  ahad: [80, 28],
  'khata-sifr': [84, 52],
  majmu: [50, 30],
  'mithal-majmu': [62, 52],
  'khata-3-9': [38, 52],
  akhirayn: [20, 28],
  'limatha-100': [16, 52],
  'khata-zawji': [22, 72],
  baqi: [50, 72],
  siyagh: [80, 88],
  khulasa: [50, 92],
};

export const KNOWLEDGE = { graph: KNOWLEDGE_GRAPH, modules: LESSON_KNOWLEDGE.modules, positions: POSITIONS };
