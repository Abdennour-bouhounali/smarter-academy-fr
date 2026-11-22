/**
 * What « خريطة المعارف » shows for lesson `awwaliyan-fima-baynahuma` (v2): the lesson's mind map (its cards and their
 * labelled links), the memo sheet of each of its three keys, and where each card sits on the full map.
 *
 * Written with the story's own numbers (`NUMBERS` of math.js, never retyped) and Euclid's divisions of math.js. The memo
 * items carry the ids of the three KEYS, which is what `pack.coach` and the board's « بطاقة المعارف » name. A card is
 * open when its key is held (`requires` is always a key); a card with `notebook` shows the memo sheet of its key. Card
 * kinds: only those of `kit/text.js`. Every option of a memo quiz is computed by `journey.test.js`: a distractor is FALSE.
 */
import { NUMBERS, RULES, andAr, divTex, euclid, gcd, listAr, pgcdTex as P } from './math';

/** What CHANGES in a rule of the memo sheet (red). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;
/** « PGCD(a;b) » inside a memo formula. */
const p = (a, b) => `\\mathrm{PGCD}(${a};${b})`;
const { only: ON, common: CM, proof: PR, witness: WT, hidden: HD } = NUMBERS;
const [O1, O2] = ON.gaps;
const [C1, C2] = CM.gaps;
const [P1, P2] = PR.gaps;
const [W1, W2] = WT.gaps;
const [H1, H2] = HD.gaps;
const GC = gcd(C1, C2);
const GW = gcd(W1, W2);
const GH = gcd(H1, H2);
const PROOF = euclid(P1, P2);
const HIDE = euclid(H1, H2);

export const KNOWLEDGE_GRAPH = {
  root: 'zawj',
  nodes: [
    {
      id: 'zawj',
      kind: 'concept',
      lane: 'center',
      requires: 'awwaliyan',
      title: 'هوّتان ولوح واحد',
      subtitle: 'أيّ لوح يبني الجسرين؟',
      context: {
        text: `لوح يبني هوّتين قاسم مشترك لطوليهما. للهوّتين ${O1} و ${O2} لوح واحد فقط هو 1، وللهوّتين ${C1} و ${C2} اللوح ${GC} أيضًا.`,
      },
      reveals: ['rappel', 'awwaliyan', 'mithal-25'],
    },
    {
      id: 'rappel',
      kind: 'prerequisite',
      lane: 'start',
      requires: 'awwaliyan',
      title: 'القاسم المشترك الأكبر',
      subtitle: 'آخر باقٍ غير معدوم',
      context: {
        text: 'بخوارزمية إقليدس: نقسم الأكبر على الأصغر، ثمّ القاسم على الباقي، حتّى الباقي 0؛ آخر باقٍ غير معدوم هو القاسم المشترك الأكبر.',
      },
      reveals: [],
    },
    {
      id: 'awwaliyan',
      kind: 'relationship',
      lane: 'center',
      requires: 'awwaliyan',
      notebook: true,
      title: 'عددان أوّليّان فيما بينهما',
      subtitle: '$\\mathrm{PGCD}(a ; b) = 1$',
      reveals: ['khata-awwali', 'ithbat', 'mithal-39'],
    },
    {
      id: 'mithal-25',
      kind: 'example',
      lane: 'end',
      requires: 'awwaliyan',
      title: `${O1} و ${O2}`,
      subtitle: `$${P(O1, O2)} = 1$`,
      context: {
        formula: listAr([`$${O1} = 5 \\times 5$`, `$${O2} = 3 \\times 9$`]),
        text: `اللوح 5 يملأ ${O1} وحدها، واللوحان 3 و 9 يملآن ${O2} وحدها: اللوح 1 وحده بنى الجسرين.`,
      },
      reveals: [],
    },
    {
      id: 'khata-awwali',
      kind: 'common_mistake',
      lane: 'start',
      requires: 'awwaliyan',
      title: 'لكلّ عددين لوح أطول من 1؟',
      subtitle: `$${P(O1, O2)} = 1$`,
      context: {
        parts: [
          { role: 'wrong', text: `$${O1}$ و $${O2}$ لهما قواسم كثيرة، إذن لهما قاسم مشترك أكبر من 1.` },
          { role: 'why', text: `قواسم ${O1} هي 1 و 5 و 25، وقواسم ${O2} هي 1 و 3 و 9 و 27: لا يشتركان إلّا في 1.` },
          { role: 'right', text: `$${P(O1, O2)} = 1$: العددان ${O1} و ${O2} أوّليّان فيما بينهما.` },
        ],
      },
      reveals: [],
    },
    {
      id: 'ithbat',
      kind: 'method',
      lane: 'center',
      requires: 'ithbat-awwaliyan',
      notebook: true,
      title: 'نثبت أنّهما أوّليّان فيما بينهما',
      subtitle: 'آخر باقٍ غير معدوم هو 1',
      reveals: ['mithal-35', 'shahid', 'khata-baqi'],
    },
    {
      id: 'mithal-39',
      kind: 'example',
      lane: 'end',
      requires: 'awwaliyan',
      title: `${C1} و ${C2}`,
      subtitle: `$${P(C1, C2)} = ${GC}$`,
      context: {
        formula: listAr([`$${C1} = ${GC} \\times ${C1 / GC}$`, `$${C2} = ${GC} \\times ${C2 / GC}$`]),
        text: `اللوح ${GC} بنى الجسرين: العددان ${C1} و ${C2} ليسا أوّليّين فيما بينهما.`,
      },
      reveals: [],
    },
    {
      id: 'mithal-35',
      kind: 'example',
      lane: 'start',
      requires: 'ithbat-awwaliyan',
      title: `${P1} و ${P2}`,
      subtitle: `$${P(P1, P2)} = 1$`,
      context: { list: PROOF.map((s) => `$${divTex(s)}$`) },
      reveals: [],
    },
    {
      id: 'khata-baqi',
      kind: 'common_mistake',
      lane: 'end',
      requires: 'ithbat-awwaliyan',
      title: 'آخر باقٍ هو 0',
      subtitle: 'فهل القاسم المشترك الأكبر 0؟',
      context: {
        parts: [
          { role: 'wrong', text: `آخر قسمة $${divTex(PROOF.at(-1))}$، إذن $${P(P1, P2)} = 0$.` },
          { role: 'why', text: '0 ليس قاسمًا لأيّ عدد: الباقي 0 يقول إنّ الخوارزمية انتهت.' },
          { role: 'right', text: `آخر باقٍ غير معدوم هو 1: $${P(P1, P2)} = 1$.` },
        ],
      },
      reveals: [],
    },
    {
      id: 'shahid',
      kind: 'method',
      lane: 'center',
      requires: 'shahid-wahid',
      notebook: true,
      title: 'قاسم مشترك واحد غير 1 يكفي',
      subtitle: 'ليسا أوّليّين فيما بينهما',
      reveals: ['mithal-645', 'khata-shahid', 'khulasa'],
    },
    {
      id: 'mithal-645',
      kind: 'example',
      lane: 'start',
      requires: 'shahid-wahid',
      title: `${W1} و ${W2}`,
      subtitle: `$${P(W1, W2)} \\neq 1$`,
      context: {
        formula: listAr([`$${W1} = ${GW} \\times ${W1 / GW}$`, `$${W2} = ${GW} \\times ${W2 / GW}$`]),
        text: `اللوح ${GW} وحده يكفي: العددان ${W1} و ${W2} ليسا أوّليّين فيما بينهما، دون حساب قاسمهما المشترك الأكبر.`,
      },
      reveals: [],
    },
    {
      id: 'khata-shahid',
      kind: 'common_mistake',
      lane: 'center',
      requires: 'shahid-wahid',
      title: 'لا قاسم من القواعد يقسمهما',
      subtitle: 'فهل هما أوّليّان فيما بينهما؟',
      context: {
        parts: [
          {
            role: 'wrong',
            text: `لا يقسم أيّ من ${andAr(RULES)} العددين ${H1} و ${H2} معًا، إذن هما أوّليّان فيما بينهما.`,
          },
          { role: 'why', text: `$${divTex(HIDE[0])}$ و $${divTex(HIDE[1])}$ و $${divTex(HIDE[2])}$.` },
          { role: 'right', text: `$${P(H1, H2)} = ${GH}$: العددان ليسا أوّليّين فيما بينهما.` },
        ],
      },
      reveals: [],
    },
    {
      id: 'khulasa',
      kind: 'takeaway',
      lane: 'end',
      requires: 'shahid-wahid',
      title: 'كيف أحكم؟',
      subtitle: 'قاسم مشترك · إقليدس · الحكم',
      context: {
        text: 'نبحث أوّلًا عن قاسم مشترك يختلف عن 1 بقواعد قابلية القسمة: إن وجدناه فالعددان ليسا أوّليّين فيما بينهما.',
        note: 'وإن لم نجده نحسب القاسم المشترك الأكبر بخوارزمية إقليدس: إذا كان 1 فهما أوّليّان فيما بينهما.',
      },
      reveals: [],
    },
  ],
  edges: [
    { from: 'zawj', to: 'rappel', label: 'تذكّر' },
    { from: 'zawj', to: 'awwaliyan', label: 'نسمّي' },
    { from: 'zawj', to: 'mithal-25', label: 'مثال' },
    { from: 'awwaliyan', to: 'khata-awwali', label: 'خطأ شائع' },
    { from: 'awwaliyan', to: 'ithbat', label: 'نثبت' },
    { from: 'awwaliyan', to: 'mithal-39', label: 'مثال مضادّ' },
    { from: 'ithbat', to: 'mithal-35', label: 'مثال' },
    { from: 'ithbat', to: 'shahid', label: 'والعكس' },
    { from: 'ithbat', to: 'khata-baqi', label: 'خطأ شائع' },
    { from: 'shahid', to: 'mithal-645', label: 'مثال' },
    { from: 'shahid', to: 'khata-shahid', label: 'خطأ شائع' },
    { from: 'shahid', to: 'khulasa', label: 'نستخلص' },
  ],
};

/** The memo sheets of the three keys, by the module that teaches them first (1: 🤝, 2: ✅, 3: ❌). */
export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'awwaliyan',
        type: 'regles',
        title: 'عددان أوّليّان فيما بينهما',
        summary: 'العددان a و b أوّليّان فيما بينهما إذا كان قاسمهما المشترك الوحيد هو 1.',
        memo: {
          rule: `${p('a', 'b')}=${R('1')}`,
          hook: 'لا لوح يبني الجسرين إلّا اللوح 1',
          example: `${p(O1, O2)}=${R('1')}`,
          trap: `الظنّ أنّ لكلّ عددين قاسمًا مشتركًا أكبر من 1: ${O1} و ${O2} لا يشتركان إلّا في 1`,
          exam: 'أحسب القاسم المشترك الأكبر وأقارنه بالعدد 1',
          chip: `${p('a', 'b')}=${R('1')}`,
          quiz: [
            {
              q: `$${P(O1, O2)} = \\ldots$`,
              options: ['$5$', '$1$', '$3$'],
              correct: 1,
            },
            {
              q: 'أيّ عددين أوّليّان فيما بينهما؟',
              options: [`$${C1}$ و $${C2}$`, `$${O1}$ و $${O2}$`, `$${W1}$ و $${W2}$`],
              correct: 1,
            },
          ],
        },
      },
    ],
    2: [
      {
        id: 'ithbat-awwaliyan',
        type: 'methodes',
        title: 'نثبت أنّهما أوّليّان فيما بينهما',
        summary:
          'نحسب القاسم المشترك الأكبر بخوارزمية إقليدس: إذا كان آخر باقٍ غير معدوم هو 1 فالعددان أوّليّان فيما بينهما.',
        memo: {
          rule: `r_k=${R('1')}\\ ,\\ r_{k+1}=0\\ \\Rightarrow\\ ${p('a', 'b')}=${R('1')}`,
          hook: 'خوارزمية إقليدس تنتهي بالباقي 1 قبل الصفر',
          example: `${PROOF.at(-2).a}=${PROOF.at(-2).b}\\times${PROOF.at(-2).q}+${R(PROOF.at(-2).r)}\\ ,\\ ${divTex(PROOF.at(-1))}`,
          trap: 'التوقّف قبل آخر قسمة، أو أخذ الباقي 0 قاسمًا مشتركًا أكبر',
          exam: 'أكتب القسمات حتّى الباقي 0، ثمّ أستنتج: القاسم المشترك الأكبر 1، إذن العددان أوّليّان فيما بينهما',
          chip: `r_k=${R('1')}`,
          quiz: [
            {
              q: `$${divTex(PROOF.at(-2))}$ و $${divTex(PROOF.at(-1))}$. إذن $${P(P1, P2)} =$`,
              options: [`$${PROOF.at(-1).q}$`, '$1$', '$0$'],
              correct: 1,
            },
            {
              q: 'نثبت أنّ العددين $a$ و $b$ أوّليّان فيما بينهما إذا وجدنا:',
              options: ['$\\mathrm{PGCD}(a ; b) = 0$', '$\\mathrm{PGCD}(a ; b) = 1$', '$\\mathrm{PGCD}(a ; b) = b$'],
              correct: 1,
            },
          ],
        },
      },
    ],
    3: [
      {
        id: 'shahid-wahid',
        type: 'regles',
        title: 'قاسم مشترك واحد غير 1 يكفي',
        summary:
          'يكفي قاسم مشترك واحد يختلف عن 1 لنثبت أنّ عددين ليسا أوّليّين فيما بينهما؛ وإن لم نره بالقواعد نحسب القاسم المشترك الأكبر.',
        memo: {
          rule: `${R('d')}\\neq1\\ ,\\ d\\mid a\\ ,\\ d\\mid b\\ \\Rightarrow\\ ${p('a', 'b')}\\neq1`,
          hook: 'قاسم مشترك واحد غير 1 يكفي',
          example: `${W1}=${R(GW)}\\times${W1 / GW}\\ ,\\ ${W2}=${R(GW)}\\times${W2 / GW}`,
          trap: `الحكم بأنّهما أوّليّان فيما بينهما لأنّ ${andAr(RULES)} لا تقسمهما معًا: ${H1} و ${H2} يقبلان القسمة على ${GH}`,
          exam: 'أعطي قاسمًا مشتركًا يختلف عن 1 وأكتب القسمتين',
          chip: `${R('d')}\\neq 1`,
          quiz: [
            {
              q: `قاسم مشترك للعددين $${W1}$ و $${W2}$ يختلف عن 1:`,
              options: ['$3$', `$${GW}$`, '$9$'],
              correct: 1,
            },
            {
              q: `لا يقسم أيّ من $2$ و $3$ و $5$ العددين $${H1}$ و $${H2}$ معًا. إذن:`,
              options: ['هما أوّليّان فيما بينهما', `ليسا أوّليّين فيما بينهما: $${GH}$ يقسمهما`, 'لا قاسم مشترك لهما'],
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
 * map, which the walks measured (`bahth-pgcd/world/knowledge.js`): rows 5, 23, 41, 59, 76 (the sixth, 93, is not
 * needed: 13 cards), three cards a row at most, on the columns 17 %, 50 %, 83 % (a card is at most 15rem wide: at 17 % /
 * 83 % it stays inside the box — 1366 × 768: 13 px to the edge, as measured on lesson 5). Every link joins two NEIGHBOUR
 * rows, so its label sits at 8.5 % or more from both rows, never under a card.
 */
const POSITIONS = {
  zawj: [50, 5],
  rappel: [17, 23],
  awwaliyan: [50, 23],
  'mithal-25': [83, 23],
  'khata-awwali': [17, 41],
  ithbat: [50, 41],
  'mithal-39': [83, 41],
  'mithal-35': [17, 59],
  shahid: [50, 59],
  'khata-baqi': [83, 59],
  'mithal-645': [17, 76],
  'khata-shahid': [50, 76],
  khulasa: [83, 76],
};

export const KNOWLEDGE = { graph: KNOWLEDGE_GRAPH, modules: LESSON_KNOWLEDGE.modules, positions: POSITIONS };
