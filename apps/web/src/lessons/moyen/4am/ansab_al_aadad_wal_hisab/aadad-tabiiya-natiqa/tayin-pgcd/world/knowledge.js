/**
 * What « خريطة المعارف » shows for lesson `tayin-pgcd` (v2): the lesson's mind map (its cards and their labelled links),
 * the memo sheet of each of its three keys, and where each card sits on the full map.
 *
 * Written with the story's own numbers (`NUMBERS`, never retyped). The memo items carry the ids of the three KEYS, which
 * is what `pack.coach` and the board's « بطاقة المعارف » name. A card is open when its key is held (`requires` is always
 * a key); a card with `notebook` shows the memo sheet of its key. Card kinds: only those of `kit/text.js`.
 */
import { NUMBERS, commonDivisors, divisorsOf, gcd, listAr, pgcdTex as P } from './math';

/** What CHANGES in a rule of the memo sheet (red). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;
const { lists: LS, same: SM, full: FL, nest: NS, against: AG } = NUMBERS;
const [W1, W2] = LS.gaps;
const [N1, N2] = NS.gaps;
const [A1, A2] = AG.gaps;
const Z = SM.gaps[0];
const G = gcd(W1, W2);
const COMMON = commonDivisors(W1, W2);
/** The common divisor that is not the greatest (the usual mistake). */
const SMALLER = COMMON.filter((d) => d > 1 && d < G)[0];
/** A list of numbers inside a formula (Latin commas: no Arabic glyph inside KaTeX). */
const texList = (xs) => xs.join(',\\ ');
/** « PGCD(a;b) » inside a memo formula. */
const p = (a, b) => `\\mathrm{PGCD}(${a};${b})`;
/** W2 written as products, from 1 up to its square root: « 44 = 1 × 44 = 2 × 22 = 4 × 11 ». */
const PAIRS_OF_W2 = divisorsOf(W2)
  .filter((d) => d * d <= W2)
  .map((d) => `${d} \\times ${W2 / d}`)
  .join(' = ');

export const KNOWLEDGE_GRAPH = {
  root: 'pgcd-maana',
  nodes: [
    {
      id: 'pgcd-maana',
      kind: 'concept',
      lane: 'center',
      requires: 'hasr-wa-taqatu',
      title: 'لوح لهوّتين',
      subtitle: `هوّتان: $${W1}$ و $${W2}$`,
      context: {
        text: `في الكيس ${LS.purse} قطعة فقط: الألواح ${G} وحدها بنت الهوّتين ${W1} و ${W2} بهذه القطع، لأنّها أطول لوح يملؤهما.`,
      },
      reveals: ['hasr'],
    },
    {
      id: 'hasr',
      kind: 'method',
      lane: 'center',
      requires: 'hasr-wa-taqatu',
      notebook: true,
      title: 'احصر ثم قاطع',
      subtitle: 'قواسم $a$ · قواسم $b$ · المشتركة · أكبرها',
      reveals: ['mithal-32-44', 'nataij', 'rappel-qawasim'],
    },
    {
      id: 'rappel-qawasim',
      kind: 'prerequisite',
      lane: 'start',
      requires: 'hasr-wa-taqatu',
      title: 'قواسم عدد',
      subtitle: 'زوجًا زوجًا',
      context: {
        text: `نكتب ${W2} جداءً بكلّ الطرق: $${W2} = ${PAIRS_OF_W2}$. نتوقّف حين يتجاوز مربّع العامل العدد.`,
      },
      reveals: [],
    },
    {
      id: 'mithal-32-44',
      kind: 'example',
      lane: 'end',
      requires: 'hasr-wa-taqatu',
      title: `${W1} و ${W2}`,
      subtitle: `$${P(W1, W2)} = ${G}$`,
      context: {
        list: [
          `قواسم ${W1}: ${listAr(divisorsOf(W1))}`,
          `قواسم ${W2}: ${listAr(divisorsOf(W2))}`,
          `المشتركة: ${listAr(COMMON)}`,
        ],
        formula: `$${P(W1, W2)} = ${G}$`,
      },
      reveals: ['khata-laysa-akbar'],
    },
    {
      id: 'khata-laysa-akbar',
      kind: 'common_mistake',
      lane: 'end',
      requires: 'hasr-wa-taqatu',
      title: 'مشترك… لكن الأكبر؟',
      subtitle: `$${P(W1, W2)} \\neq ${SMALLER}$`,
      context: {
        parts: [
          { role: 'wrong', text: `${SMALLER} يقسم ${W1} و ${W2}، إذن $${P(W1, W2)} = ${SMALLER}$.` },
          { role: 'why', text: `${SMALLER} قاسم مشترك فعلًا، لكنّ ${G} يقسمهما أيضًا وهو أكبر.` },
          { role: 'right', text: 'نكتب القائمتين كاملتين، ثمّ نأخذ أكبر عدد يظهر في الاثنتين.' },
        ],
      },
      reveals: [],
    },
    {
      id: 'nataij',
      kind: 'relationship',
      lane: 'center',
      requires: 'nataij-mubashira',
      notebook: true,
      title: 'نتائج مباشرة',
      subtitle: '$a$ و $a$ · $a$ و $0$ · $a$ و $1$',
      reveals: ['tabaduli', 'khata-sifr', 'yaqsim'],
    },
    {
      id: 'tabaduli',
      kind: 'tip',
      lane: 'start',
      requires: 'nataij-mubashira',
      title: 'الترتيب لا يهمّ',
      subtitle: `$${P(W2, W1)} = ${P(W1, W2)}$`,
      context: {
        text: `القواسم المشتركة للعددين ${W1} و ${W2} هي نفسها مهما كتبنا العددين: $${P('a', 'b')} = ${P('b', 'a')}$.`,
      },
      reveals: [],
    },
    {
      id: 'khata-sifr',
      kind: 'common_mistake',
      lane: 'end',
      requires: 'nataij-mubashira',
      title: 'والصفر؟',
      subtitle: `$${P(Z, 0)} = ${gcd(Z, 0)}$`,
      context: {
        parts: [
          { role: 'wrong', text: `$${P(Z, 0)} = 0$.` },
          { role: 'why', text: `0 ليس قاسمًا لأيّ عدد. وكلّ عدد يقسم 0: $0 = ${Z} \\times 0$.` },
          { role: 'right', text: `كلّ قواسم ${Z} تقسم 0، وأكبرها ${Z}: $${P(Z, 0)} = ${gcd(Z, 0)}$.` },
        ],
      },
      reveals: [],
    },
    {
      id: 'yaqsim',
      kind: 'relationship',
      lane: 'center',
      requires: 'b-yaqsim-a',
      notebook: true,
      title: 'الأصغر يقسم الأكبر',
      subtitle: '$b$ يقسم $a$: $\\mathrm{PGCD}(a ; b) = b$',
      reveals: ['mithal-76-19', 'tahaqquq-awwalan', 'khulasa'],
    },
    {
      id: 'mithal-76-19',
      kind: 'example',
      lane: 'start',
      requires: 'b-yaqsim-a',
      title: `${N2} و ${N1}`,
      subtitle: `$${P(N2, N1)} = ${gcd(N2, N1)}$`,
      context: {
        formula: `$${N2} = ${N1} \\times ${N2 / N1}$`,
        text: `${N1} يقسم ${N2}، وكلّ قاسم للعدد ${N1} يقسم ${N2}: أكبرها ${N1}.`,
      },
      reveals: [],
    },
    {
      id: 'tahaqquq-awwalan',
      kind: 'tip',
      lane: 'center',
      requires: 'b-yaqsim-a',
      title: 'تحقّق أوّلًا',
      subtitle: 'هل يقسم الأصغر الأكبر؟',
      context: {
        text: `قسمة واحدة قبل حصر القواسم: $${A1} = ${A2} \\times ${Math.floor(A1 / A2)} + ${A1 % A2}$، إذن ${A2} لا يقسم ${A1}، فنحصر القواسم: $${P(A1, A2)} = ${gcd(A1, A2)}$.`,
      },
      reveals: [],
    },
    {
      id: 'khulasa',
      kind: 'takeaway',
      lane: 'center',
      requires: 'b-yaqsim-a',
      title: 'كيف أعيّنه؟',
      subtitle: 'مباشرة · يقسمه · أحصر',
      context: {
        text: 'أنظر أوّلًا: عددان متساويان، أو أحدهما 0 أو 1؟ النتيجة مباشرة. ثمّ: هل يقسم الأصغر الأكبر؟ القاسم المشترك الأكبر هو الأصغر.',
        note: 'وإلّا أحصر قواسم كلّ عدد، وآخذ أكبر قاسم مشترك.',
      },
      reveals: [],
    },
  ],
  edges: [
    { from: 'pgcd-maana', to: 'hasr', label: 'كيف نجده؟' },
    { from: 'hasr', to: 'mithal-32-44', label: 'مثال' },
    { from: 'hasr', to: 'nataij', label: 'حالات خاصّة' },
    { from: 'hasr', to: 'rappel-qawasim', label: 'تذكّر' },
    { from: 'mithal-32-44', to: 'khata-laysa-akbar', label: 'خطأ شائع' },
    { from: 'nataij', to: 'tabaduli', label: 'نستعملها' },
    { from: 'nataij', to: 'khata-sifr', label: 'خطأ شائع' },
    { from: 'nataij', to: 'yaqsim', label: 'حالة أخرى' },
    { from: 'yaqsim', to: 'mithal-76-19', label: 'مثال' },
    { from: 'yaqsim', to: 'tahaqquq-awwalan', label: 'نستعملها' },
    { from: 'yaqsim', to: 'khulasa', label: 'نستخلص' },
  ],
};

/** The memo sheets of the three keys, by the module that teaches them (1: the first key, 2: the two others). */
export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'hasr-wa-taqatu',
        type: 'methodes',
        title: 'احصر القواسم ثم قاطعها',
        summary: 'قواسم كلّ عدد، ثمّ القواسم المشتركة، ثمّ أكبرها.',
        memo: {
          rule: `d\\mid a\\ ,\\ d\\mid b\\ \\Rightarrow\\ d\\leq ${R(p('a', 'b'))}`,
          hook: 'قائمتان، ثمّ المشترك، ثمّ الأكبر',
          example: `${W1}\\ ,\\ ${W2}\\ :\\ ${texList(COMMON)}\\ \\Rightarrow\\ ${p(W1, W2)}=${R(G)}`,
          trap: `أخذ قاسم مشترك ليس الأكبر: ${SMALLER} يقسم ${W1} و ${W2}، لكنّ ${G} أكبر`,
          exam: 'أكتب القائمتين كاملتين، أسطّر المشترك، ثمّ آخذ أكبره',
          chip: `${R(p('a', 'b'))}`,
          quiz: [
            {
              q: `القواسم المشتركة للعددين $${W1}$ و $${W2}$ هي ${listAr(COMMON)}. إذن $${P(W1, W2)} =$`,
              options: ['$1$', `$${G}$`, `$${W1}$`],
              correct: 1,
            },
            {
              q: 'لتعيين القاسم المشترك الأكبر للعددين $a$ و $b$ بالحصر نكتب:',
              options: ['قواسم $a$ فقط', 'قواسم $a$ وقواسم $b$ ثمّ المشتركة', 'مضاعفات $a$ و $b$'],
              correct: 1,
            },
          ],
        },
      },
    ],
    2: [
      {
        id: 'nataij-mubashira',
        type: 'regles',
        title: 'نتائج مباشرة',
        summary: 'عدد مع نفسه، مع 0، مع 1، أو بترتيب آخر: النتيجة دون حساب.',
        memo: {
          rule: `${p('a', 'a')}=${R('a')}\\ ,\\ ${p('a', '0')}=${R('a')}\\ ,\\ ${p('a', '1')}=${R('1')}`,
          hook: 'نفسه ← هو · مع الصفر ← هو · مع الواحد ← واحد',
          example: `${p(Z, Z)}=${R(gcd(Z, Z))}\\ ,\\ ${p(FL.gaps[0], FL.gaps[1])}=${R(gcd(...FL.gaps))}`,
          trap: `كتابة 0 قاسمًا مشتركًا أكبر للعددين ${Z} و 0: كلّ عدد يقسم 0`,
          exam: 'أنظر إلى العددين قبل أيّ حساب',
          chip: `${p('a', 'b')}=${R(p('b', 'a'))}`,
          quiz: [
            {
              q: `$${P(N1, 0)} =$`,
              options: ['$0$', '$1$', `$${N1}$`],
              correct: 2,
            },
            {
              q: `$${P(N2, 1)} =$`,
              options: ['$1$', `$${N2}$`, '$0$'],
              correct: 0,
            },
          ],
        },
      },
      {
        id: 'b-yaqsim-a',
        type: 'regles',
        title: 'عندما يقسم الأصغر الأكبر',
        summary: 'إذا كان b قاسمًا للعدد a فإنّ القاسم المشترك الأكبر لهما هو b.',
        memo: {
          rule: `b\\mid a\\ \\Rightarrow\\ ${p('a', 'b')}=${R('b')}`,
          hook: 'الأصغر يقسم الأكبر ← هو القاسم المشترك الأكبر',
          example: `${N2}=${N1}\\times${N2 / N1}\\Rightarrow ${p(N2, N1)}=${R(N1)}`,
          trap: 'أخذ العدد الأصغر دون التحقّق أنّه يقسم الأكبر',
          exam: 'أكتب a = b × k، ثمّ أستنتج أنّ القاسم المشترك الأكبر هو b',
          chip: `b\\mid a\\Rightarrow ${R('b')}`,
          quiz: [
            {
              q: `$${N2} = ${N1} \\times ${N2 / N1}$. إذن $${P(N2, N1)} =$`,
              options: [`$${N2 / N1}$`, `$${N1}$`, `$${N2}$`],
              correct: 1,
            },
            {
              q: `هل $${P(A1, A2)} = ${A2}$؟`,
              options: [`نعم، لأنّ ${A2} أصغر العددين`, `لا: ${A2} لا يقسم ${A1}`, 'نعم، دائمًا'],
              correct: 1,
            },
          ],
        },
      },
    ],
  },
};

/**
 * Where each node sits on the MAP (percent of the map box, drawn left-to-right) — the rows and columns of lesson 4's
 * map, which the walks measured (`qasim-mushtarak-akbar/world/knowledge.js`): SIX rows (5, 20.5, 39, 58, 74.5, 93), at
 * most three cards a row, on three columns (17 %, 50 %, 83 %) or two (30 %, 70 %). A card is at most 15rem wide (8.6rem
 * below 1101 px): at 17 % / 83 % it stays inside the box (1366 × 768: 13 px to the edge; 1024 × 768: 29 px; 1840 × 900:
 * 33 px). Every link label sits at the middle of its link, between two rows, never under a card: hasr → its three cards
 * (labels at 29.75 %), the example → its mistake (17 %, 48.5 %), nataij → tabaduli (66.5 %, 48.5 %) and → the row
 * 74.5 (labels at 40 % and 60 %, 56.75 %: clear of the cards at 17 % and 83 %, whose inner edge is at 32 % / 68 %),
 * yaqsim → the last row (labels at 43.5 %, 60 %, 76.5 % on 83.75 %, between the rows 74.5 and 93).
 */
const POSITIONS = {
  'pgcd-maana': [50, 5],
  hasr: [50, 20.5],
  'mithal-32-44': [17, 39],
  nataij: [50, 39],
  'rappel-qawasim': [83, 39],
  'khata-laysa-akbar': [17, 58],
  tabaduli: [83, 58],
  'khata-sifr': [30, 74.5],
  yaqsim: [70, 74.5],
  'mithal-76-19': [17, 93],
  'tahaqquq-awwalan': [50, 93],
  khulasa: [83, 93],
};

export const KNOWLEDGE = { graph: KNOWLEDGE_GRAPH, modules: LESSON_KNOWLEDGE.modules, positions: POSITIONS };
