/**
 * What « خريطة المعارف » shows for lesson `qasim-mushtarak-akbar` (v2): the lesson's mind map (its cards and their
 * labelled links), the memo sheet of each of its four keys, and where each card sits on the full map.
 *
 * Written for the v2 lesson FROM SCRATCH, with the story's own numbers (`NUMBERS` of story.js — never retyped). The memo
 * items carry the ids of the four KEYS, which is what `pack.coach` and the board's « بطاقة المعارف » name.
 * A card is open when its key is held (`requires` is always a key); a card with `notebook` shows the memo sheet of its key.
 */
import { BOUQUETS, LILIES, ROSES, commonDivisors, counted, divisorsOf, gcd, listAr } from './math';
import { NUMBERS } from './story';

/** What CHANGES in a rule of the memo sheet (red). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;
const { twin: W, second: S, bouquets: F, baskets: K } = NUMBERS;
const [W1, W2] = W.gaps;
const [S1, S2] = S.gaps;
const TWIN = gcd(W1, W2);
const SECOND = gcd(S1, S2);
const FLOWERS = gcd(F.roses, F.lilies);
const BASKETS = gcd(K.dates, K.figs);
const pgcd = (a, b) => `\\mathrm{PGCD}(${a} ; ${b})`;
/** A list of numbers inside a formula (Latin commas: no Arabic glyph inside KaTeX). */
const texList = (xs) => xs.join(',\\ ');
/** The wrong PGCD of the common mistake: a common divisor of the second pair that is not the greatest. */
const SMALLER = commonDivisors(S1, S2).filter((n) => n > 1 && n < SECOND)[0];

export const KNOWLEDGE_GRAPH = {
  root: 'fikra',
  nodes: [
    {
      id: 'fikra',
      kind: 'concept',
      lane: 'center',
      requires: 'qawasim-mushtaraka',
      title: 'لوح يملأ هوّتين',
      subtitle: `هوّتان: $${W1}$ و $${W2}$`,
      context: { text: `اللوح ${W.first} يملأ ${W1} ولا يملأ ${W2}. أيّ الألواح تملأ الهوّتين معًا؟` },
      reveals: ['mushtaraka'],
    },
    {
      id: 'mushtaraka',
      kind: 'relationship',
      lane: 'center',
      requires: 'qawasim-mushtaraka',
      notebook: true,
      title: 'القواسم المشتركة',
      subtitle: '$d$ يقسم $a$ و $b$ معًا',
      reveals: ['tadhkir', 'khata-wahid', 'akbar'],
    },
    {
      id: 'tadhkir',
      kind: 'prerequisite',
      lane: 'start',
      requires: 'qawasim-mushtaraka',
      title: 'قواسم عدد',
      subtitle: `قواسم $${TWIN}$`,
      context: {
        text: `قواسم عدد هي كلّ الأعداد التي تقسمه. قواسم ${TWIN}: ${listAr(divisorsOf(TWIN))}.`,
      },
      reveals: [],
    },
    {
      id: 'khata-wahid',
      kind: 'common_mistake',
      lane: 'end',
      requires: 'qawasim-mushtaraka',
      title: 'قاسم لأحدهما فقط',
      subtitle: `$${W.first}$ يقسم $${W1}$`,
      context: {
        parts: [
          { role: 'wrong', text: `${W.first} يقسم ${W1}، إذن ${W.first} قاسم مشترك للعددين ${W1} و ${W2}.` },
          {
            role: 'why',
            text: `$${W2} = ${W.first} \\times ${Math.floor(W2 / W.first)} + ${W2 % W.first}$: ${W.first} لا يقسم ${W2}.`,
          },
          { role: 'right', text: 'القاسم المشترك يقسم العددين معًا: نتحقّق في القائمتين.' },
        ],
      },
      reveals: [],
    },
    {
      id: 'akbar',
      kind: 'relationship',
      lane: 'center',
      requires: 'al-akbar',
      notebook: true,
      title: 'القاسم المشترك الأكبر',
      subtitle: '$\\mathrm{PGCD}(a ; b)$',
      reveals: ['mithal-akbar', 'khata-asghar', 'baqat', 'nest'],
    },
    {
      id: 'mithal-akbar',
      kind: 'example',
      lane: 'start',
      requires: 'al-akbar',
      title: `${W1} و ${W2}`,
      subtitle: `$${pgcd(W1, W2)} = ${TWIN}$`,
      context: {
        formula: `$${pgcd(W1, W2)} = ${TWIN}$`,
        list: [
          `القواسم المشتركة: ${listAr(commonDivisors(W1, W2))}`,
          `$${W1} = ${TWIN} \\times ${W1 / TWIN}$`,
          `$${W2} = ${TWIN} \\times ${W2 / TWIN}$`,
        ],
      },
      reveals: [],
    },
    {
      id: 'khata-asghar',
      kind: 'common_mistake',
      lane: 'end',
      requires: 'al-akbar',
      title: 'قاسم مشترك ليس الأكبر',
      subtitle: `$${pgcd(S1, S2)} \\neq ${SMALLER}$`,
      context: {
        parts: [
          { role: 'wrong', text: `${SMALLER} يقسم ${S1} و ${S2}، إذن $${pgcd(S1, S2)} = ${SMALLER}$.` },
          { role: 'why', text: `${SECOND} يقسم ${S1} و ${S2} أيضًا، وهو أكبر من ${SMALLER}.` },
          { role: 'right', text: `$${pgcd(S1, S2)} = ${SECOND}$: نأخذ أكبر القواسم المشتركة، لا أوّل قاسم نجده.` },
        ],
      },
      reveals: [],
    },
    {
      id: 'baqat',
      kind: 'relationship',
      lane: 'center',
      requires: 'baqat-mutamathila',
      notebook: true,
      title: 'الباقات المتماثلة',
      subtitle: 'أكبر عدد من الباقات: $\\mathrm{PGCD}(a ; b)$',
      reveals: ['mithal-baqat', 'kulluha'],
    },
    {
      id: 'mithal-baqat',
      kind: 'example',
      lane: 'end',
      requires: 'baqat-mutamathila',
      title: `${F.roses} وردة و ${F.lilies} زنبقة`,
      subtitle: `$${pgcd(F.roses, F.lilies)} = ${FLOWERS}$`,
      context: {
        formula: `$${F.roses} = ${FLOWERS} \\times ${F.roses / FLOWERS}$ و $${F.lilies} = ${FLOWERS} \\times ${F.lilies / FLOWERS}$`,
        text: `${counted(FLOWERS, BOUQUETS)} على الأكثر، في كلّ واحدة ${counted(F.roses / FLOWERS, ROSES)} و ${counted(F.lilies / FLOWERS, LILIES)}.`,
      },
      reveals: [],
    },
    {
      id: 'kulluha',
      kind: 'tip',
      lane: 'start',
      requires: 'baqat-mutamathila',
      title: '«كلّها» و«متماثلة»',
      subtitle: 'عدد الباقات يقسم العددين',
      context: {
        text: 'إذا وُزّعت كمّيتان كاملتين في باقات متماثلة، فعدد الباقات قاسم مشترك لهما. وأكبر عدد ممكن هو قاسمهما المشترك الأكبر.',
      },
      reveals: [],
    },
    {
      id: 'nest',
      kind: 'relationship',
      lane: 'center',
      requires: 'qawasim-al-pgcd',
      notebook: true,
      title: 'قواسم القاسم المشترك الأكبر',
      subtitle: 'القواسم المشتركة = قواسم PGCD',
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa',
      kind: 'takeaway',
      lane: 'center',
      requires: 'qawasim-al-pgcd',
      title: 'القاسم المشترك الأكبر',
      subtitle: 'قاسم مشترك · الأكبر · باقات · قواسمه',
      context: {
        text: 'القواسم المشتركة للعددين $a$ و $b$ هي قواسم $\\mathrm{PGCD}(a ; b)$، وهو أكبرها.',
        note: 'وفي توزيع كمّيتين كلّهما في باقات متماثلة، أكبر عدد من الباقات هو $\\mathrm{PGCD}(a ; b)$.',
      },
      reveals: [],
    },
  ],
  edges: [
    { from: 'fikra', to: 'mushtaraka', label: 'يملأ الاثنين' },
    { from: 'mushtaraka', to: 'tadhkir', label: 'تذكّر' },
    { from: 'mushtaraka', to: 'khata-wahid', label: 'خطأ شائع' },
    { from: 'mushtaraka', to: 'akbar', label: 'أكبرها' },
    { from: 'akbar', to: 'mithal-akbar', label: 'مثال' },
    { from: 'akbar', to: 'khata-asghar', label: 'خطأ شائع' },
    { from: 'akbar', to: 'baqat', label: 'نستعمله' },
    { from: 'akbar', to: 'nest', label: 'قواسمه' },
    { from: 'baqat', to: 'mithal-baqat', label: 'مثال' },
    { from: 'baqat', to: 'kulluha', label: 'نقرأ النصّ' },
    { from: 'nest', to: 'khulasa', label: 'نستخلص' },
  ],
};

/** The memo sheets of the four keys, by the module that teaches them (module n: key n). */
export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'qawasim-mushtaraka',
        type: 'regles',
        title: 'القواسم المشتركة',
        summary: 'القاسم المشترك لعددين يقسم كلًّا منهما.',
        memo: {
          rule: `d\\mid a\\ ,\\ ${R('d\\mid b')}`,
          hook: 'يملأ الهوّتين معًا',
          example: `${W1}\\ ,\\ ${W2}\\ :\\ ${R(texList(commonDivisors(W1, W2)))}`,
          trap: `قاسم لأحد العددين فقط: ${W.first} يقسم ${W1} ولا يقسم ${W2}`,
          exam: 'أكتب قواسم كلّ عدد، ثمّ أحيط بالقواسم الموجودة في القائمتين',
          chip: `d\\mid a\\ ,\\ d\\mid b`,
          quiz: [
            {
              q: `أيّ هذه الأعداد قاسم مشترك للعددين $${W1}$ و $${W2}$؟`,
              options: [`$${W.first}$`, `$${W.second}$`, `$${W.plank}$`],
              correct: 2,
            },
            {
              q: 'العدد الذي يقسم كلّ عددين طبيعيين غير معدومين هو:',
              options: ['$0$', '$1$', '$2$'],
              correct: 1,
            },
          ],
        },
      },
    ],
    2: [
      {
        id: 'al-akbar',
        type: 'regles',
        title: 'القاسم المشترك الأكبر',
        summary: 'أكبر القواسم المشتركة لعددين، ونرمز له بـ PGCD(a ; b).',
        memo: {
          rule: `\\mathrm{PGCD}(a ; b) = ${R('\\max')}\\{d : d\\mid a,\\ d\\mid b\\}`,
          hook: 'أطول لوح يملأ الهوّتين',
          example: `${pgcd(W1, W2)} = ${R(TWIN)}`,
          trap: `أخذ قاسم مشترك ليس الأكبر: ${SMALLER} بدل ${SECOND}`,
          exam: 'أكتب a = g × p و b = g × q حيث لا يشترك p و q إلّا في 1',
          chip: `\\mathrm{PGCD}(a ; b)`,
          quiz: [
            {
              q: `القواسم المشتركة للعددين $${S1}$ و $${S2}$ هي ${listAr(commonDivisors(S1, S2))}. إذن $${pgcd(S1, S2)} =$`,
              options: ['$1$', `$${SMALLER}$`, `$${SECOND}$`],
              correct: 2,
            },
            {
              q: `$${pgcd(W1, W2)} =$`,
              options: [`$${TWIN / 2}$`, `$${TWIN}$`, `$${2 * TWIN}$`],
              correct: 1,
            },
          ],
        },
      },
    ],
    3: [
      {
        id: 'baqat-mutamathila',
        type: 'methodes',
        title: 'الباقات المتماثلة',
        summary: 'توزيع كمّيتين كلّهما في باقات متماثلة: أكبر عدد من الباقات هو PGCD.',
        memo: {
          rule: `n_{\\max} = ${R('\\mathrm{PGCD}(a ; b)')}`,
          hook: 'عدد الباقات يقسم الكمّيتين',
          example: `${pgcd(F.roses, F.lilies)} = ${R(FLOWERS)}`,
          trap: 'الخلط بين عدد الباقات وعدد الزهور في كلّ باقة',
          exam: 'أحسب PGCD، ثمّ أقسم كلّ كمّية عليه لأجد محتوى الباقة',
          chip: `n = ${R('\\mathrm{PGCD}')}`,
          quiz: [
            {
              q: `$${F.roses}$ وردة و $${F.lilies}$ زنبقة كلّها في باقات متماثلة. أكبر عدد من الباقات:`,
              options: [`$${FLOWERS / 2}$`, `$${FLOWERS}$`, `$${F.roses / FLOWERS}$`],
              correct: 1,
            },
            {
              q: `في كلّ باقة من الباقات الـ $${FLOWERS}$ نجد:`,
              options: [
                `$${F.roses / FLOWERS}$ ورود و $${F.lilies / FLOWERS}$ زنبقات`,
                `$${FLOWERS}$ ورود و $${FLOWERS}$ زنبقات`,
                `$${F.lilies / FLOWERS}$ ورود و $${F.roses / FLOWERS}$ زنبقات`,
              ],
              correct: 0,
            },
          ],
        },
      },
    ],
    4: [
      {
        id: 'qawasim-al-pgcd',
        type: 'regles',
        title: 'قواسم القاسم المشترك الأكبر',
        summary: 'القواسم المشتركة لعددين هي قواسم قاسمهما المشترك الأكبر.',
        memo: {
          rule: `d\\mid a\\ ,\\ d\\mid b\\ \\Leftrightarrow\\ d\\mid ${R('\\mathrm{PGCD}(a ; b)')}`,
          hook: 'كلّ الألواح المشتركة تملأ أطولها',
          example: `${pgcd(K.dates, K.figs)} = ${BASKETS}\\ :\\ ${R(texList(divisorsOf(BASKETS)))}`,
          trap: 'كتابة قواسم كلّ عدد من جديد بعد معرفة PGCD',
          exam: 'أحسب PGCD ثمّ أكتب قواسمه: هي القواسم المشتركة',
          chip: `d\\mid ${R('\\mathrm{PGCD}')}`,
          quiz: [
            {
              q: `$\\mathrm{PGCD}(a ; b) = ${BASKETS}$. أيّ عدد قاسم مشترك للعددين $a$ و $b$؟`,
              options: ['$8$', '$6$', `$${2 * BASKETS}$`],
              correct: 1,
            },
            {
              q: `$\\mathrm{PGCD}(a ; b) = ${BASKETS}$. عدد القواسم المشتركة للعددين $a$ و $b$:`,
              options: [`$${divisorsOf(BASKETS).length - 1}$`, `$${divisorsOf(BASKETS).length}$`, `$${BASKETS}$`],
              correct: 1,
            },
          ],
        },
      },
    ],
  },
};

/**
 * Where each node sits on the MAP (percent of the map box, drawn left-to-right). SIX rows, at most three cards a row, on
 * three columns (17 %, 50 %, 83 %): a card is at most 15rem wide (8.6rem below 1101 px), so even at its widest it stays
 * inside the box and clear of its neighbour (1366 × 768: a 780 px map, 13 px to the edge, 17 px between cards; 1024 ×
 * 768: 574 px, 29 px and 51 px; 1840 × 900: 902 px, 33 px and 58 px). Every link joins two rows ≥ 18.5 % apart (or two
 * rows apart): its label, at the link's middle, sits between the rows, never under a card — a card of two lines is about
 * 75 px high above 1100 px, a label 26 px, a row 580–600 px / 100 (2026-11-19: « 40 وردة و 56 زنبقة » was cut by the left
 * edge and three labels hid under the wide cards beside them).
 */
const POSITIONS = {
  fikra: [50, 5],
  mushtaraka: [50, 20.5],
  'khata-wahid': [17, 39],
  akbar: [50, 39],
  tadhkir: [83, 39],
  'khata-asghar': [17, 58],
  'mithal-akbar': [83, 58],
  baqat: [30, 74.5],
  nest: [70, 74.5],
  'mithal-baqat': [17, 93],
  kulluha: [50, 93],
  khulasa: [83, 93],
};

export const KNOWLEDGE = { graph: KNOWLEDGE_GRAPH, modules: LESSON_KNOWLEDGE.modules, positions: POSITIONS };
