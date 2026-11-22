/**
 * What « خريطة المعارف » shows for lesson `khawass-qawasim` (v2): the lesson's mind map (its cards and their labelled
 * links), the memo sheet of each of its four keys, and where each card sits on the full map.
 *
 * Written for the v2 lesson FROM SCRATCH, with the story's own numbers (`NUMBERS` of story.js — never retyped). It is
 * the lesson's ONLY knowledge (`lesson.pack.js › knowledge`); the memo items carry the ids of the four KEYS, which is
 * what `pack.coach` and the board's « بطاقة المعارف » name.
 * A card is open when its key is held (`requires` is always a key); a card with `notebook` shows the memo sheet of its key.
 * LETTERS (one convention for the whole lesson, `story.js`): a = d × k and b = d × k′ — the pair of the proof he
 * assembled; q is only the quotient of a Euclidean division; n is the number a is multiplied by.
 */
import { NUMBERS } from './story';

/** What CHANGES in a rule of the memo sheet (red). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;
const { join: J, stack: S, peel: P } = NUMBERS;
const [J1, J2] = J.gaps;
const [F1, F2] = J.foil;
const times = (n, d) => `${n} = ${d} \\times ${n / d}`;

export const KNOWLEDGE_GRAPH = {
  root: 'khawass',
  nodes: [
    {
      id: 'khawass',
      kind: 'concept',
      lane: 'center',
      requires: 'jam-wal-farq',
      title: 'قاسم مشترك لعددين',
      subtitle: `$${J.plank}$ يقسم $${J1}$ و $${J2}$`,
      context: { text: `لوح طوله ${J.plank} يملأ هوّتين: ${J1} خانة و ${J2} خانة. ماذا يملأ أيضًا؟` },
      reveals: ['majmu'],
    },
    {
      id: 'majmu',
      kind: 'relationship',
      lane: 'center',
      requires: 'jam-wal-farq',
      notebook: true,
      title: 'المجموع والفرق',
      subtitle: '$d$ يقسم $a + b$ و $a - b$',
      reveals: ['rappel', 'khata-aks', 'mudaaf', 'baqi'],
    },
    {
      id: 'rappel',
      kind: 'prerequisite',
      lane: 'start',
      requires: 'jam-wal-farq',
      title: 'معنى «يقسم»',
      subtitle: '$a = d \\times k$',
      context: { text: '$d$ يقسم $a$ معناه: يوجد عدد طبيعي $k$ حيث $a = d \\times k$.' },
      reveals: [],
    },
    {
      id: 'khata-aks',
      kind: 'common_mistake',
      lane: 'end',
      requires: 'jam-wal-farq',
      title: 'والعكس؟',
      subtitle: `$${F1 + F2} = ${F1} + ${F2}$`,
      context: {
        parts: [
          { role: 'wrong', text: `${J.plank} يقسم ${F1 + F2}، إذن ${J.plank} يقسم ${F1} و ${F2}.` },
          {
            role: 'why',
            text: `$${F1} = ${J.plank} \\times ${Math.floor(F1 / J.plank)} + ${F1 % J.plank}$: ${J.plank} لا يقسم ${F1}.`,
          },
          {
            role: 'right',
            text: 'الخاصية تسير في اتّجاه واحد: إذا قسم $d$ العددين قسم مجموعهما، وقد يقسم المجموع دون أن يقسم أيًّا منهما.',
          },
        ],
      },
      reveals: [],
    },
    {
      id: 'mudaaf',
      kind: 'relationship',
      lane: 'start',
      requires: 'madaaf',
      notebook: true,
      title: 'المضاعفات',
      subtitle: '$d$ يقسم $n \\times a$',
      reveals: ['mithal-1800'],
    },
    {
      id: 'mithal-1800',
      kind: 'example',
      lane: 'start',
      requires: 'madaaf',
      title: `${S.copies} جسر`,
      subtitle: `$${S.plank}$ يقسم $${S.bridge * S.copies}$`,
      context: {
        formula: `$${S.bridge * S.copies} = ${S.bridge} \\times ${S.copies} = ${S.plank} \\times ${S.bridge / S.plank} \\times ${S.copies} = ${S.plank} \\times ${(S.bridge * S.copies) / S.plank}$`,
        text: `جسر من ${S.bridge} خانة مكرّر ${S.copies} مرّة: ألواح ${S.plank} تملؤه دون أن نرسمه.`,
      },
      reveals: [],
    },
    {
      id: 'baqi',
      kind: 'relationship',
      lane: 'center',
      requires: 'baqi-qisma',
      notebook: true,
      title: 'باقي القسمة',
      subtitle: '$d$ يقسم الباقي $r$',
      reveals: ['mithal-735', 'bila-qisma', 'burhan'],
    },
    {
      id: 'mithal-735',
      kind: 'example',
      lane: 'end',
      requires: 'baqi-qisma',
      title: `${P.long} و ${P.short}`,
      subtitle: `$${times(P.long % P.short, P.plank)}$`,
      context: {
        formula: `$${P.long} = ${P.short} \\times ${Math.floor(P.long / P.short)} + ${P.long % P.short}$`,
        list: [`$${times(P.long, P.plank)}$`, `$${times(P.short, P.plank)}$`, `$${times(P.long % P.short, P.plank)}$`],
      },
      reveals: [],
    },
    {
      id: 'bila-qisma',
      kind: 'tip',
      lane: 'end',
      requires: 'baqi-qisma',
      title: 'دون إجراء القسمة',
      subtitle: 'الباقي يقسمه القاسم المشترك',
      context: { text: 'إذا عرفتَ أنّ $d$ يقسم العددين، فلا حاجة لقسمة الباقي على $d$: هو يقسمه حتمًا.' },
      reveals: [],
    },
    {
      id: 'burhan',
      kind: 'method',
      lane: 'center',
      requires: 'burhan',
      notebook: true,
      title: 'إيجاد k',
      subtitle: '$m = d \\times k$',
      reveals: ['khata-mithal', 'khulasa'],
    },
    {
      id: 'khata-mithal',
      kind: 'common_mistake',
      lane: 'start',
      requires: 'burhan',
      title: 'مثال أم برهان؟',
      subtitle: 'الأمثلة لا تبرهن',
      context: {
        parts: [
          { role: 'wrong', text: `تحقّقنا أنّ ${J.plank} يقسم $${J1} + ${J2}$، إذن الخاصية صحيحة دائمًا.` },
          { role: 'why', text: 'مثال واحد، أو ثلاثة، لا يغطّي كلّ الأعداد.' },
          {
            role: 'right',
            text: "نكتب الحالة العامّة بحروف: $a + b = d \\times k + d \\times k' = d \\times (k + k')$.",
          },
        ],
      },
      reveals: [],
    },
    {
      id: 'khulasa',
      kind: 'takeaway',
      lane: 'center',
      requires: 'burhan',
      title: 'قاسم مشترك يقسم…',
      subtitle: 'المجموع · الفرق · المضاعفات · الباقي',
      context: {
        text: 'إذا كان $d$ يقسم $a$ و $b$ فإنّه يقسم $a + b$ و $a - b$ وكلّ مضاعف لهما، ويقسم باقي القسمة الإقليدية للعدد $a$ على $b$.',
        note: 'ولإثبات أنّ $d$ يقسم $m$ نجد عددًا طبيعيًّا $k$ حيث $m = d \\times k$.',
      },
      reveals: [],
    },
  ],
  edges: [
    { from: 'khawass', to: 'majmu', label: 'نلصق ونقصّ' },
    { from: 'majmu', to: 'rappel', label: 'تذكّر' },
    { from: 'majmu', to: 'khata-aks', label: 'خطأ شائع' },
    { from: 'majmu', to: 'mudaaf', label: 'جمع متكرّر' },
    { from: 'mudaaf', to: 'mithal-1800', label: 'مثال' },
    { from: 'majmu', to: 'baqi', label: 'الباقي فرق' },
    { from: 'baqi', to: 'mithal-735', label: 'مثال' },
    { from: 'baqi', to: 'bila-qisma', label: 'نستعملها' },
    { from: 'baqi', to: 'burhan', label: 'نبرهن عليها' },
    { from: 'burhan', to: 'khata-mithal', label: 'خطأ شائع' },
    { from: 'burhan', to: 'khulasa', label: 'نستخلص' },
  ],
};

/** The memo sheets of the four keys, by the module that teaches them (1: the first key, 2: the next two, 3: the proof). */
export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'jam-wal-farq',
        type: 'regles',
        title: 'المجموع والفرق',
        summary: 'قاسم مشترك لعددين يقسم مجموعهما وفرقهما.',
        memo: {
          rule: `d\\mid a\\ ,\\ d\\mid b\\ \\Rightarrow\\ d\\mid a${R('+')}b\\ ,\\ d\\mid a${R('-')}b`,
          hook: 'قاسم الجزأين يقسم الكلّ والفرق',
          example: `${J.plank}\\mid${J1}\\ ,\\ ${J.plank}\\mid${J2}\\Rightarrow ${J.plank}\\mid${R(J1 + J2)}\\ ,\\ ${J.plank}\\mid${R(J2 - J1)}`,
          trap: `قلب الخاصية: ${J.plank} يقسم ${F1 + F2} = ${F1} + ${F2} ولا يقسم ${F1}`,
          exam: 'أكتب كلّ عدد على الشكل d × … ثمّ أُخرج d عاملًا مشتركًا',
          chip: `d\\mid a${R('\\pm')}b`,
          quiz: [
            {
              q: `$${J.plank}$ يقسم $${J1}$ و $${J2}$. إذن $${J.plank}$ يقسم:`,
              options: [`$${J1} + ${J2} + 1$`, `$${J2} - ${J1}$`, `$${J2} \\div ${J1}$`],
              correct: 1,
            },
            {
              q: `$${J.plank}$ يقسم $${F1 + F2} = ${F1} + ${F2}$. إذن:`,
              options: [
                `$${J.plank}$ يقسم $${F1}$`,
                `$${J.plank}$ يقسم $${F2}$`,
                `لا نستطيع أن نقول إنّ $${J.plank}$ يقسم $${F1}$`,
              ],
              correct: 2,
            },
          ],
        },
      },
    ],
    2: [
      {
        id: 'madaaf',
        type: 'regles',
        title: 'المضاعفات',
        summary: 'من يقسم عددًا يقسم كلّ مضاعف له.',
        memo: {
          rule: `d\\mid a\\ \\Rightarrow\\ d\\mid ${R('n')}\\times a`,
          hook: 'من يقسم العدد يقسم كلّ مضاعفاته',
          example: `${S.plank}\\mid${S.bridge}\\Rightarrow ${S.plank}\\mid${S.bridge}\\times${R(S.copies)}`,
          trap: 'قلب الخاصية: 6 يقسم 4 × 3 ولا يقسم 4',
          exam: 'أكتب a = d × k ثمّ n × a = d × (n × k)',
          chip: `d\\mid ${R('n')}\\times a`,
          quiz: [
            {
              q: `$${S.plank}$ يقسم $${S.bridge}$. إذن $${S.plank}$ يقسم:`,
              options: [`$${S.bridge} + 1$`, `$${S.bridge} \\times 7$`, `$${S.bridge} \\div 4$`],
              correct: 1,
            },
            {
              q: '$6$ يقسم $4 \\times 3$. هل $6$ يقسم $4$؟',
              options: ['نعم، دائمًا', 'لا: $4 = 6 \\times 0 + 4$', 'نعم، لأنّ 4 زوجي'],
              correct: 1,
            },
          ],
        },
      },
      {
        id: 'baqi-qisma',
        type: 'regles',
        title: 'باقي القسمة',
        summary: 'قاسم مشترك لعددين يقسم باقي القسمة الإقليدية لأحدهما على الآخر.',
        memo: {
          rule: `d\\mid a\\ ,\\ d\\mid b\\ ,\\ a=b\\times q+${R('r')}\\ \\Rightarrow\\ d\\mid ${R('r')}`,
          hook: 'الباقي فرق: يقسمه القاسم المشترك',
          example: `${P.long}=${P.short}\\times${Math.floor(P.long / P.short)}+${R(P.long % P.short)}\\ ,\\ ${times(P.long % P.short, P.plank)}`,
          trap: 'تطبيقها على قاسم لأحد العددين فقط',
          exam: 'أكتب القسمة الإقليدية ثمّ r = a − b × q',
          chip: `d\\mid ${R('r')}`,
          quiz: [
            {
              q: `$${P.plank}$ يقسم $${P.long}$ و $${P.short}$، و $${P.long} = ${P.short} \\times ${Math.floor(P.long / P.short)} + ${P.long % P.short}$. إذن $${P.plank}$ يقسم:`,
              options: [`$${Math.floor(P.long / P.short)}$`, `$${P.long % P.short}$`, `$${P.long + 1}$`],
              correct: 1,
            },
            {
              q: 'قاسم مشترك للعددين $a$ و $b$ يقسم أيضًا:',
              options: ['حاصل قسمة $a$ على $b$', 'باقي قسمة $a$ على $b$', '$a + 1$'],
              correct: 1,
            },
          ],
        },
      },
    ],
    3: [
      {
        id: 'burhan',
        type: 'methodes',
        title: 'كيف أبرهن أنّ d يقسم m؟',
        summary: 'يكفي أن نكتب m جداءً: d في عدد طبيعي — بالحروف لا بالأمثلة.',
        memo: {
          // the proof he assembled, in its own two letters (k and k′): the natural number found is k + k′
          rule: `a=d\\times k\\ ,\\ b=d\\times k'\\ \\Rightarrow\\ a+b=d\\times${R("(k+k')")}`,
          hook: 'نبدأ من الشرط بالحروف ونصل إلى جداء: d في عدد طبيعي',
          example: `${J1}+${J2}=${J.plank}\\times${J1 / J.plank}+${J.plank}\\times${J2 / J.plank}=${J.plank}\\times${R(`(${J1 / J.plank}+${J2 / J.plank})`)}`,
          trap: 'الاكتفاء بالتحقّق على أمثلة',
          exam: 'نفرض … ، إذن … = d × (…) وما بين القوسين عدد طبيعي',
          chip: `d\\times${R("(k+k')")}`,
          quiz: [
            {
              q: 'لإثبات أنّ $d$ يقسم $m$ يكفي أن نجد:',
              options: ['$m > d$', 'عددًا طبيعيًّا $k$ حيث $m = d \\times k$', 'ثلاثة أمثلة صحيحة'],
              correct: 1,
            },
            {
              q: "إذا كان $a = d \\times k$ و $b = d \\times k'$ فإنّ $a - b =$",
              options: ["$d \\times (k - k')$", "$d - (k - k')$", "$d \\times k \\times k'$"],
              correct: 0,
            },
          ],
        },
      },
    ],
  },
};

/** Where each node sits on the MAP (percent of the map box, drawn left-to-right; the lesson's « start » lane is on the RIGHT). */
const POSITIONS = {
  khawass: [50, 7],
  majmu: [50, 23],
  rappel: [82, 26],
  'khata-aks': [18, 30],
  mudaaf: [80, 48],
  'mithal-1800': [82, 68],
  baqi: [50, 47],
  'mithal-735': [20, 52],
  'bila-qisma': [18, 72],
  burhan: [50, 70],
  'khata-mithal': [80, 86],
  khulasa: [50, 92],
};

export const KNOWLEDGE = { graph: KNOWLEDGE_GRAPH, modules: LESSON_KNOWLEDGE.modules, positions: POSITIONS };
