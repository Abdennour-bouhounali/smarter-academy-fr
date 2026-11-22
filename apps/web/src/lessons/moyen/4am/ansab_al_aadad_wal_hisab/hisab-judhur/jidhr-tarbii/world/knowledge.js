/**
 * What « خريطة المعارف » shows for lesson `jidhr-tarbii` (v2): the lesson's mind map (its cards and their labelled
 * links), the memo sheet of each of its three keys, and where each card sits on the full map.
 *
 * Written FROM SCRATCH with the world's own numbers (`story.js › COURTS`, `CALCULATOR`): the court of 36 ridden by 6,
 * the court of 16 where « four times the rod » rode by chance, the court of 30 that no number rides, the walk of nine
 * steps to the left. The map comes AFTER the forges: it may say « الجذر التربيعي » and draw the sign √. A card opens when
 * its key is held (`requires` is always a key); a card with `notebook` shows the memo sheet of its key. Only the kinds of
 * `kit/text.js` (`knowledgeKinds.test.js`). The memo's `hook`, `trap` and `exam` are PLAIN text (no `$`): an equality in
 * them is isolated left to right (`ltr`, defects.md B16); `rule`, `example`, `chip` are formulas with no Arabic.
 */
import { CALCULATOR, COURTS } from './story';
import { K1, K2, K3, ltr, rootOf, sq, steps, tex, wholeBelow } from './math';

/** What CHANGES in a rule of the memo sheet (red). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;
const PALM = COURTS.palm; // 36, ridden by 6
const P = rootOf(PALM);
const SMALL = COURTS.small; // 16: four times the rod rode it by chance
const FIRST = COURTS.first; // 30: no number rides it
const W = wholeBelow(FIRST); // 5
const C = tex(CALCULATOR);
/** The side of the court of 30 cut to 0,01 below and above (5,47 and 5,48), and their squares, computed. */
const [W1, W2] = [
  `${W},${CALCULATOR.split(',')[1].slice(0, 2)}`,
  `${W},${Number(CALCULATOR.split(',')[1].slice(0, 2)) + 1}`,
];
const WALK = 9; // the walk of the tablet 🔁: nine steps to the left

export const KNOWLEDGE_GRAPH = {
  root: 'saha',
  nodes: [
    {
      id: 'saha',
      kind: 'concept',
      lane: 'center',
      requires: K1,
      title: 'ساحة مربّعة',
      subtitle: `مساحتها $${PALM}$ وضلعها $${P}$`,
      context: {
        text: `منصّة المقياس $${P}$ تركب الساحة $${PALM}$: $${P} \\times ${P} = ${PALM}$. ضلع ساحة هو العدد الموجب الذي مربّعه مساحتها.`,
      },
      reveals: ['murabba', 'jidhr', 'khata-rub'],
    },
    {
      id: 'murabba',
      kind: 'prerequisite',
      lane: 'end',
      requires: K1,
      title: 'مربّع عدد',
      subtitle: '$a^2 = a \\times a$',
      context: {
        text: 'مربّع العدد $a$ هو جداؤه في نفسه، ويُكتب $a^2$: $7 \\times 7 = 49$ ، $0{,}4 \\times 0{,}4 = 0{,}16$.',
      },
      reveals: [],
    },
    {
      id: 'jidhr',
      kind: 'definition',
      lane: 'center',
      requires: K1,
      notebook: true,
      title: 'الجذر التربيعي',
      subtitle: `$\\sqrt{${PALM}} = ${P}$`,
      reveals: ['madbuta', 'dhahab'],
    },
    {
      id: 'khata-rub',
      kind: 'common_mistake',
      lane: 'start',
      requires: K1,
      title: 'ربع المساحة؟',
      subtitle: `الساحة $${PALM}$`,
      context: {
        parts: [
          { role: 'wrong', text: `ضلع الساحة $${PALM}$ هو ربع مساحتها: $${Number(PALM) / 4}$.` },
          {
            role: 'why',
            text: `$${Number(PALM) / 4} \\times ${Number(PALM) / 4} = ${sq(Number(PALM) / 4)}$: منصّة المقياس $${Number(PALM) / 4}$ تعلق في الساحة $${PALM}$. وفي الساحة $${SMALL}$ ركب الربع صدفةً: $${rootOf(SMALL)} \\times ${rootOf(SMALL)} = ${SMALL}$.`,
          },
          {
            role: 'right',
            text: `الضلع هو العدد الموجب الذي مربّعه المساحة: $${P} \\times ${P} = ${PALM}$، إذن $\\sqrt{${PALM}} = ${P}$.`,
          },
        ],
      },
      reveals: [],
    },
    {
      id: 'madbuta',
      kind: 'relationship',
      lane: 'end',
      requires: K2,
      notebook: true,
      title: 'القيمة المضبوطة',
      subtitle: `$\\sqrt{${FIRST}}$`,
      reveals: ['hasr', 'khata-hasiba'],
    },
    {
      id: 'hasr',
      kind: 'method',
      lane: 'end',
      requires: K2,
      title: 'حصر الجذر',
      subtitle: `$${W} < \\sqrt{${FIRST}} < ${W + 1}$`,
      context: {
        text: `$${W} \\times ${W} = ${W * W}$ و $${W + 1} \\times ${W + 1} = ${(W + 1) ** 2}$، و $${W * W} < ${FIRST} < ${(W + 1) ** 2}$: منصّة المقياس $${W}$ تترك شريطًا، ومنصّة المقياس $${W + 1}$ تعلق.`,
      },
      reveals: ['muqarraba'],
    },
    {
      id: 'muqarraba',
      kind: 'example',
      lane: 'end',
      requires: K2,
      title: 'قيمتان مقرّبتان',
      subtitle: `$${tex(W1)} < \\sqrt{${FIRST}} < ${tex(W2)}$`,
      context: {
        list: [`$${tex(W1)} \\times ${tex(W1)} = ${tex(sq(W1))}$`, `$${tex(W2)} \\times ${tex(W2)} = ${tex(sq(W2))}$`],
        note: `$${tex(W1)}$ قيمة مقرّبة إلى $0{,}01$ بالنقصان، و $${tex(W2)}$ قيمة مقرّبة إلى $0{,}01$ بالزيادة.`,
      },
      reveals: ['khulasa'],
    },
    {
      id: 'khata-hasiba',
      kind: 'common_mistake',
      lane: 'center',
      requires: K2,
      title: 'ما تعرضه الحاسبة',
      subtitle: `$\\sqrt{${FIRST}} \\approx ${C}$`,
      context: {
        parts: [
          { role: 'wrong', text: `$\\sqrt{${FIRST}} = ${C}$` },
          {
            role: 'why',
            text: `منصّة المقياس $${C}$ تترك في الساحة $${FIRST}$ شريطًا رقيقًا جدًّا: مربّعها أصغر من $${FIRST}$. لا عدد عشريّ مربّعه $${FIRST}$.`,
          },
          {
            role: 'right',
            text: `نكتب $\\sqrt{${FIRST}} \\approx ${C}$: قيمة مقرّبة. القيمة المضبوطة هي $\\sqrt{${FIRST}}$ نفسها.`,
          },
        ],
      },
      reveals: [],
    },
    {
      id: 'dhahab',
      kind: 'relationship',
      lane: 'start',
      requires: K3,
      notebook: true,
      title: 'ذهاب وإياب',
      subtitle: '$(\\sqrt{a})^2 = a$',
      reveals: ['salib'],
    },
    {
      id: 'salib',
      kind: 'warning',
      lane: 'start',
      requires: K3,
      title: 'الطول لا إشارة له',
      subtitle: `$\\sqrt{(-${WALK})^2} = ${WALK}$`,
      context: {
        text: `مشيُ ${steps(WALK)} إلى اليسار يبني ساحة مساحتها $(-${WALK})^2 = ${WALK * WALK}$، وضلعها $${WALK}$ لا $-${WALK}$: الجذر التربيعي عدد موجب.`,
      },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa',
      kind: 'takeaway',
      lane: 'center',
      requires: K3,
      title: 'خلاصة الدرس',
      subtitle: 'الجذر التربيعي لعدد موجب',
      context: {
        text: 'لكلّ عدد موجب $a$: $\\sqrt{a}$ هو العدد الموجب الذي مربّعه $a$، و $(\\sqrt{a})^2 = a$ و $\\sqrt{a^2} = a$.',
        note: 'حين لا يكون $a$ مربّع عدد عشريّ، فالكتابة $\\sqrt{a}$ هي قيمته المضبوطة، وما تعرضه الحاسبة قيمة مقرّبة.',
      },
      reveals: [],
    },
  ],
  edges: [
    { from: 'saha', to: 'murabba', label: 'تذكّر' },
    { from: 'saha', to: 'jidhr', label: 'ضلعها' },
    { from: 'saha', to: 'khata-rub', label: 'خطأ شائع' },
    { from: 'jidhr', to: 'madbuta', label: 'ساحة بلا عدد' },
    { from: 'jidhr', to: 'dhahab', label: 'نبني ونأخذ' },
    { from: 'madbuta', to: 'hasr', label: 'نحصره' },
    { from: 'madbuta', to: 'khata-hasiba', label: 'خطأ شائع' },
    { from: 'hasr', to: 'muqarraba', label: 'أدقّ' },
    { from: 'dhahab', to: 'salib', label: 'انتبه' },
    { from: 'muqarraba', to: 'khulasa', label: 'نستخلص' },
    { from: 'salib', to: 'khulasa', label: 'نستخلص' },
  ],
};

/** The memo sheets of the three keys, one module each, in the order of the keys. */
export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: K1,
        type: 'regles',
        title: 'الجذر التربيعي',
        summary: 'الجذر التربيعي لعدد موجب a هو العدد الموجب الذي مربّعه a.',
        memo: {
          rule: `\\sqrt{a}=${R('b')}\\ \\Longleftrightarrow\\ ${R('b')}\\geq0\\ ,\\ ${R('b')}\\times${R('b')}=a`,
          hook: 'ضلع الساحة: العدد الموجب الذي مربّعه مساحتها',
          example: `${P}\\times${P}=${PALM}\\ ,\\ ${P}\\geq0\\ \\Rightarrow\\ \\sqrt{${PALM}}=${R(P)}`,
          trap: `الجذر ليس نصف العدد ولا ربعه: ${ltr(`${P} × ${P} = ${PALM}`)}، إذن الجذر التربيعي للعدد ${PALM} هو ${P}، لا ${Number(PALM) / 2} ولا ${Number(PALM) / 4}.`,
          exam: 'أبحث عن العدد الموجب الذي مربّعه العدد المعطى، ثمّ أتحقّق بالضرب.',
          chip: `\\sqrt{${PALM}}=${R(P)}`,
          quiz: [
            {
              q: `الجذر التربيعي للعدد $${COURTS.last}$ هو:`,
              options: [`$${rootOf(COURTS.last)}$`, `$-${rootOf(COURTS.last)}$`, `$${Number(COURTS.last) / 2}$`],
              correct: 0,
            },
            {
              q: 'العدد الذي جذره التربيعي $15$ هو:',
              options: ['$30$', '$225$', '$7{,}5$'],
              correct: 1,
            },
          ],
        },
      },
    ],
    2: [
      {
        id: K2,
        type: 'regles',
        title: 'القيمة المضبوطة والقيمة المقرّبة',
        summary: 'حين لا يكون للجذر كتابة عشريّة، فقيمته المضبوطة هي الكتابة بالرمز √، وما تعرضه الحاسبة قيمة مقرّبة.',
        memo: {
          rule: `n\\times n<a<(n+1)\\times(n+1)\\ \\Rightarrow\\ ${R('n')}<\\sqrt{a}<${R('n+1')}`,
          hook: 'ما تعرضه الحاسبة يقترب من الطول ولا يبلغه',
          example: `${W * W}<${FIRST}<${(W + 1) ** 2}\\ \\Rightarrow\\ ${W}<\\sqrt{${FIRST}}<${W + 1}\\ ,\\ \\sqrt{${FIRST}}\\approx${R(tex(W1))}`,
          trap: 'أن تكتب ما تعرضه الحاسبة بعلامة المساواة: هو قيمة مقرّبة، لا القيمة المضبوطة.',
          exam: 'أحصر العدد تحت الجذر بين مربّعين متتاليين، ثمّ أكتب القيمة المقرّبة المطلوبة: بالنقصان أو بالزيادة.',
          chip: `\\sqrt{${FIRST}}\\approx${R(tex(W1))}`,
          quiz: [
            {
              q: 'بين أيّ عددين طبيعيين متتاليين يقع $\\sqrt{40}$؟',
              options: ['$6$ و $7$', '$20$ و $21$', '$4$ و $5$'],
              correct: 0,
            },
            {
              q: `القيمة المضبوطة لضلع ساحة مساحتها $${FIRST}$ هي:`,
              options: [`$${C}$`, `$\\sqrt{${FIRST}}$`, `$${tex(W2)}$`],
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
        title: 'ذهاب وإياب',
        summary: 'لكلّ عدد موجب a: (√a)² = a و √(a²) = a.',
        memo: {
          rule: `a\\geq0:\\ (\\sqrt{a})^2=${R('a')}\\ ,\\ \\sqrt{a^2}=${R('a')}`,
          hook: 'ابنِ ثمّ خذ، أو خذ ثمّ ابنِ: تعود إلى ما بدأتَ به',
          example: `(\\sqrt{51})^2=${R('51')}\\ ,\\ \\sqrt{(-${WALK})^2}=${R(WALK)}`,
          trap: `الجذر التربيعي موجب دائمًا: ${ltr(`(−${WALK})² = ${WALK * WALK}`)}، وجذره التربيعي ${WALK}، لا ${ltr(`−${WALK}`)}.`,
          exam: 'أتحقّق أنّ العدد تحت الجذر موجب، ثمّ أطبّق الخاصيّتين دون حاسبة.',
          chip: `(\\sqrt{a})^2=${R('a')}`,
          quiz: [
            {
              q: '$(\\sqrt{51})^2 =$',
              options: ['$51$', '$102$', '$2601$'],
              correct: 0,
            },
            {
              q: '$\\sqrt{(-15)^2} =$',
              options: ['$-15$', '$15$', '$225$'],
              correct: 1,
            },
          ],
        },
      },
    ],
  },
};

/**
 * Where each card sits on the MAP (percent of the map box, drawn left to right; the « start » lane is on the RIGHT).
 * Laid out for 1366×768 with the card panel open: the page zooms to 1.07, the map is about 780 × 600 of its units
 * (1.75 of 2.75 of the page; while « تدرّب » is open, 1.15 of 2.15 zoomed 0.84 — the same 780 units). A card is at most
 * 12.5rem = 200 units wide (±12.8 %) and about 50 high (±4.2 %): columns at 17 / 50 / 83 leave 4 % at each side; rows
 * at 5 … 93, 17–18 apart, put every link label (at the middle of its link) 8.5–9 % from the rows above and below — a
 * clear 3 % (about 20 units) under and over the cards. The legend's corner (top, left) holds no card above 15 %.
 */
const POSITIONS = {
  saha: [50, 5],
  murabba: [17, 23],
  jidhr: [50, 23],
  'khata-rub': [83, 23],
  madbuta: [17, 41],
  dhahab: [83, 41],
  hasr: [17, 59],
  'khata-hasiba': [50, 59],
  salib: [83, 59],
  muqarraba: [17, 76],
  khulasa: [50, 93],
};

export const KNOWLEDGE = { graph: KNOWLEDGE_GRAPH, modules: LESSON_KNOWLEDGE.modules, positions: POSITIONS };
