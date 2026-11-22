/**
 * What « خريطة المعارف » shows for lesson `qisma-iqlidiya-baqi` (v2): the lesson's mind map (its cards and their labelled
 * links), the memo sheet of each of its five keys, and where each card sits on the full map.
 *
 * Written for the v2 lesson FROM SCRATCH, with the story's own numbers (`NUMBERS` of story.js — never retyped). The
 * memo items carry the ids of the five KEYS, which is what `pack.coach` and the board's « بطاقة المعارف » name.
 * A card is open when its key is held (`requires` is always a key); a card with `notebook` shows the memo sheet of its key.
 */
import { cabinsOf, fullPlanksOf, planksOf, travellersOf } from './counted';
import { NUMBERS, divide } from './story';

/** What CHANGES in a rule of the memo sheet (red). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;
const { count: C, groups: GR, rests: RS, scope: SC, cable: QY } = NUMBERS;
const COUNT = divide(C.a, C.probe);
const G8 = divide(GR.a, GR.probe);
const R6 = divide(RS.a, RS.probe);
const SCOPE = divide(SC.a, SC.plank);
const QUAY = divide(QY.a, QY.b);
const T = Math.floor(SCOPE.q / 10) * 10;
/** « a = b × q + r » of a division, in maths. */
const eq = (a, b) => `${a} = ${b} \\times ${divide(a, b).q} + ${divide(a, b).r}`;
/** The wrong writing of a division: one group less, the remainder b bigger. */
const WRONG = { a: GR.a, b: 6, q: divide(GR.a, 6).q - 1, r: divide(GR.a, 6).r + 6 };
/** The memo's estimate example: its own numbers (not the story's), a quotient of two digits. */
export const ESTIMATE = { a: 512, b: 16 };
/** The memo's station where nobody is left: the cabins needed are the quotient itself. */
export const EXACT = { a: 72, b: QY.b };

export const KNOWLEDGE_GRAPH = {
  root: 'qisma',
  nodes: [
    {
      id: 'qisma',
      kind: 'concept',
      lane: 'center',
      requires: 'majmuaat-kamila',
      title: 'القسمة الإقليدية',
      subtitle: 'كم مجموعة كاملة؟ وكم يبقى؟',
      context: {
        text: `هوّة من ${C.a} خانة وألواح طولها ${C.probe}: كم لوحًا كاملًا يدخل فيها؟ وكم خانة تبقى فارغة؟`,
      },
      reveals: ['kamila'],
    },
    {
      id: 'kamila',
      kind: 'retain',
      lane: 'center',
      requires: 'majmuaat-kamila',
      notebook: true,
      title: 'المجموعات الكاملة',
      subtitle: 'الحاصل = عدد المجموعات الكاملة',
      reveals: ['rappel', 'mithal-kamila', 'asghar'],
    },
    {
      id: 'rappel',
      kind: 'prerequisite',
      lane: 'start',
      requires: 'majmuaat-kamila',
      title: 'جدول الضرب',
      subtitle: `$${C.probe} \\times ${COUNT.q} = ${C.probe * COUNT.q}$`,
      context: {
        text: `لنعرف كم مرّة يدخل ${C.probe} في ${C.a} نبحث في جدول ${C.probe} عن أكبر جداء لا يتجاوز ${C.a}.`,
      },
      reveals: [],
    },
    {
      id: 'mithal-kamila',
      kind: 'example',
      lane: 'end',
      requires: 'majmuaat-kamila',
      title: `${C.a} خانة وألواح ${C.probe}`,
      subtitle: fullPlanksOf(COUNT.q),
      context: {
        formula: `$${C.probe * COUNT.q} \\leq ${C.a} < ${C.probe * (COUNT.q + 1)}$`,
        text: `${planksOf(COUNT.q)} تغطّي ${C.probe * COUNT.q} خانة، واللوح التالي يحتاج ${C.probe * (COUNT.q + 1)}: لا يدخل، ويبقى ${COUNT.r}.`,
      },
      reveals: [],
    },
    {
      id: 'asghar',
      kind: 'retain',
      lane: 'center',
      requires: 'baqi-asghar',
      notebook: true,
      title: 'الباقي أصغر',
      subtitle: '$r < b$',
      reveals: ['khata-baqi', 'musawat'],
    },
    {
      id: 'khata-baqi',
      kind: 'common_mistake',
      lane: 'end',
      requires: 'baqi-asghar',
      title: 'باقٍ كبير',
      subtitle: `$${WRONG.a} = ${WRONG.b} \\times ${WRONG.q} + ${WRONG.r}$`,
      context: {
        parts: [
          {
            role: 'wrong',
            text: `$${WRONG.a} = ${WRONG.b} \\times ${WRONG.q} + ${WRONG.r}$: الحاصل ${WRONG.q} والباقي ${WRONG.r}.`,
          },
          { role: 'why', text: `المساواة صحيحة، لكنّ ${WRONG.r} ليس أصغر من ${WRONG.b}: يدخل ${WRONG.b} مرّة أخرى.` },
          { role: 'right', text: `$${eq(GR.a, 6)}$: الحاصل ${WRONG.q + 1} والباقي ${WRONG.r - WRONG.b}.` },
        ],
      },
      reveals: [],
    },
    {
      id: 'musawat',
      kind: 'definition',
      lane: 'center',
      requires: 'musawat-qisma',
      notebook: true,
      title: 'مساواة القسمة',
      subtitle: '$a = b \\times q + r$',
      reveals: ['asmaa', 'mithal-musawat', 'taqdir', 'masala'],
    },
    {
      id: 'asmaa',
      kind: 'term',
      lane: 'start',
      requires: 'musawat-qisma',
      title: 'أسماء الحدود',
      subtitle: 'المقسوم · المقسوم عليه · الحاصل · الباقي',
      context: {
        list: ['$a$: المقسوم', '$b$: المقسوم عليه', '$q$: الحاصل', '$r$: الباقي، و $r < b$'],
      },
      reveals: [],
    },
    {
      id: 'mithal-musawat',
      kind: 'example',
      lane: 'end',
      requires: 'musawat-qisma',
      title: `${RS.a} وألواح ${RS.probe}`,
      subtitle: `$${eq(RS.a, RS.probe)}$`,
      context: {
        formula: `$${RS.probe} \\times ${R6.q} + ${R6.r} = ${RS.probe * R6.q} + ${R6.r} = ${RS.a}$`,
        text: 'الألواح الكاملة مع الخانات الباقية تعيد طول الهوّة كاملًا.',
      },
      reveals: [],
    },
    {
      id: 'taqdir',
      kind: 'retain',
      lane: 'end',
      requires: 'taqdir-hasil',
      notebook: true,
      title: 'تقدير الحاصل',
      subtitle: 'العشرات أوّلًا، ثمّ الآحاد',
      reveals: ['mithal-taqdir'],
    },
    {
      id: 'mithal-taqdir',
      kind: 'example',
      lane: 'end',
      requires: 'taqdir-hasil',
      title: `${SC.a} على ${SC.plank}`,
      subtitle: `الحاصل بين ${T} و ${T + 10}`,
      context: {
        formula: `$${SC.plank} \\times ${T} = ${SC.plank * T} \\leq ${SC.a} < ${SC.plank * (T + 10)} = ${SC.plank} \\times ${T + 10}$`,
        list: [`$${SC.a} - ${SC.plank * T} = ${SC.a - SC.plank * T}$`, `$${eq(SC.a, SC.plank)}$`],
      },
      reveals: [],
    },
    {
      id: 'masala',
      kind: 'retain',
      lane: 'start',
      requires: 'baqi-fi-masala',
      notebook: true,
      title: 'الباقي في مسألة',
      subtitle: 'الممتلئة، اللازمة، أم الباقون؟',
      reveals: ['khata-masala', 'khulasa'],
    },
    {
      id: 'khata-masala',
      kind: 'common_mistake',
      lane: 'start',
      requires: 'baqi-fi-masala',
      title: 'الحاصل وحده',
      subtitle: `$${eq(QY.a, QY.b)}$`,
      context: {
        parts: [
          {
            role: 'wrong',
            text: `${travellersOf(QY.a)} وعربات تحمل ${QY.b}: $${eq(QY.a, QY.b)}$، «إذن تلزم ${cabinsOf(QUAY.q)}».`,
          },
          {
            role: 'why',
            text: `العربات الممتلئة ${QUAY.q} تحمل ${QY.b * QUAY.q} مسافرًا: يبقى ${travellersOf(QUAY.r)} في المحطّة.`,
          },
          { role: 'right', text: `تلزم عربة أخرى لمن بقي: $${QUAY.q} + 1 = ${QUAY.q + 1}$.` },
        ],
      },
      reveals: [],
    },
    {
      id: 'khulasa',
      kind: 'takeaway',
      lane: 'center',
      requires: 'baqi-fi-masala',
      title: 'القسمة الإقليدية',
      subtitle: '$a = b \\times q + r$ و $r < b$',
      context: {
        text: 'نضع أكبر عدد ممكن من المجموعات الكاملة ($q$)، ويبقى $r$ أصغر من $b$: $a = b \\times q + r$.',
        note: 'وللقسمة على عدد من رقمين نقدّر عشرات الحاصل أوّلًا. وفي مسألة نقرأ السؤال: الحاصل، الباقي، أم الحاصل زائد 1؟',
      },
      reveals: [],
    },
  ],
  edges: [
    { from: 'qisma', to: 'kamila', label: 'نعدّ الألواح' },
    { from: 'kamila', to: 'rappel', label: 'تذكّر' },
    { from: 'kamila', to: 'mithal-kamila', label: 'مثال' },
    { from: 'kamila', to: 'asghar', label: 'ماذا يبقى؟' },
    { from: 'asghar', to: 'khata-baqi', label: 'خطأ شائع' },
    { from: 'asghar', to: 'musawat', label: 'نعيد البناء' },
    { from: 'musawat', to: 'asmaa', label: 'المصطلحات' },
    { from: 'musawat', to: 'mithal-musawat', label: 'مثال' },
    { from: 'musawat', to: 'taqdir', label: 'أعداد كبيرة' },
    { from: 'musawat', to: 'masala', label: 'في مسألة' },
    { from: 'taqdir', to: 'mithal-taqdir', label: 'مثال' },
    { from: 'masala', to: 'khata-masala', label: 'خطأ شائع' },
    { from: 'masala', to: 'khulasa', label: 'نستخلص' },
  ],
};

/**
 * The memo sheets of the five keys, by the module of the lesson's config the story marks when the key is his (1: the
 * full groups; 2: the remainder and the equality; 3: the estimate; 4: the leftover in a problem). Each quiz option is
 * computed from the numbers it names.
 */
export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'majmuaat-kamila',
        type: 'regles',
        title: 'المجموعات الكاملة',
        summary: 'الحاصل هو أكبر عدد من المجموعات الكاملة: نتوقّف عندما لا تدخل مجموعة أخرى.',
        memo: {
          rule: `b\\times ${R('q')}\\leq a<b\\times(${R('q')}+1)`,
          hook: 'أكبر عدد من المجموعات الكاملة، ثمّ نتوقّف',
          example: `${C.probe}\\times ${R(COUNT.q)}=${C.probe * COUNT.q}\\leq ${C.a}<${C.probe * (COUNT.q + 1)}`,
          trap: 'عدّ المجموعة التي لم تدخل، أو التوقّف ومجموعة أخرى ما زالت تدخل',
          exam: 'أُنجز القسمة وأتحقّق بالضرب أنّ مجموعة أخرى لا تدخل',
          chip: `a\\div b\\to ${R('q')}`,
          quiz: [
            {
              q: `كم لوحًا كاملًا طوله $${C.probe}$ يدخل في $${C.a}$ خانة؟`,
              options: [`$${COUNT.q - 1}$`, `$${COUNT.q}$`, `$${COUNT.q + 1}$`],
              correct: 1,
            },
            {
              q: `في هوّة من $${GR.a}$ خانة نتوقّف عند $${G8.q}$ ألواح طولها $${GR.probe}$ لأنّ:`,
              options: [
                `اللوح التالي يحتاج $${GR.probe * (G8.q + 1)}$ خانة`,
                `$${G8.q}$ عدد فردي`,
                `$${GR.probe} \\times ${G8.q} = ${GR.probe * G8.q}$ عدد زوجي`,
              ],
              correct: 0,
            },
          ],
        },
      },
    ],
    2: [
      {
        id: 'baqi-asghar',
        type: 'regles',
        title: 'الباقي أصغر من المقسوم عليه',
        summary: 'باقي القسمة على عدد هو أحد الأعداد من 0 إلى هذا العدد ناقص 1: أصغر دائمًا من المقسوم عليه.',
        memo: {
          rule: `0\\leq r\\leq ${R('b-1')}`,
          hook: 'لو بلغ الباقي المقسوم عليه لدخلت مجموعة أخرى',
          example: `${RS.a}=${RS.probe}\\times ${R6.q}+${R(R6.r)}\\ ,\\ ${R(R6.r)}<${RS.probe}`,
          trap: 'باقٍ يساوي المقسوم عليه أو يتجاوزه: القسمة لم تكتمل',
          exam: 'أتحقّق دائمًا: الباقي أصغر من المقسوم عليه',
          chip: `r<${R('b')}`,
          quiz: [
            {
              q: `ما أكبر باقٍ ممكن في قسمة إقليدية على $${GR.probe}$؟`,
              options: [`$${GR.probe}$`, `$${GR.probe - 1}$`, `$${GR.probe + 1}$`],
              correct: 1,
            },
            {
              q: `هل $${WRONG.a} = ${WRONG.b} \\times ${WRONG.q} + ${WRONG.r}$ هي القسمة الإقليدية للعدد $${WRONG.a}$ على $${WRONG.b}$؟`,
              options: [
                'نعم، المساواة صحيحة',
                `لا: $${WRONG.r}$ ليس أصغر من $${WRONG.b}$`,
                `نعم، لأنّ $${WRONG.r}$ أصغر من $${WRONG.a}$`,
              ],
              correct: 1,
            },
          ],
        },
      },
      {
        id: 'musawat-qisma',
        type: 'regles',
        title: 'مساواة القسمة الإقليدية',
        summary: 'المقسوم = المقسوم عليه × الحاصل + الباقي، والباقي أصغر من المقسوم عليه.',
        memo: {
          rule: `a=b\\times q+${R('r')}\\ ,\\ ${R('r')}<b`,
          hook: 'المقسوم = المقسوم عليه × الحاصل + الباقي',
          example: `${RS.a}=${RS.probe}\\times ${R6.q}+${R(R6.r)}`,
          trap: 'نسيان الباقي عند إعادة بناء المقسوم',
          exam: 'أكتب المساواة كاملة وأسمّي حدودها',
          chip: `a=b\\times q+${R('r')}`,
          quiz: [
            {
              q: `في قسمة إقليدية المقسوم عليه $${RS.probe}$ والحاصل $${R6.q}$ والباقي $${R6.r}$. المقسوم هو:`,
              options: [`$${RS.probe * R6.q}$`, `$${RS.a}$`, `$${RS.probe * (R6.q + 1)}$`],
              correct: 1,
            },
            {
              q: `في $${eq(C.a, C.probe)}$ العدد $${COUNT.q}$ هو:`,
              options: ['المقسوم عليه', 'الباقي', 'الحاصل'],
              correct: 2,
            },
          ],
        },
      },
    ],
    3: [
      {
        id: 'taqdir-hasil',
        type: 'methodes',
        title: 'تقدير الحاصل',
        summary: 'للقسمة على عدد من رقمين نقدّر عشرات الحاصل أوّلًا، ثمّ آحاده.',
        memo: {
          rule: `b\\times ${R('10t')}\\leq a<b\\times ${R('10(t+1)')}`,
          hook: 'العشرات أوّلًا، ثمّ الآحاد',
          example: `${SC.plank}\\times ${R(T)}=${SC.plank * T}\\leq ${SC.a}<${SC.plank * (T + 10)}=${SC.plank}\\times ${R(T + 10)}`,
          trap: 'حاصل خاطئ بعشرة: رقم العشرات منسيّ أو زائد',
          exam: 'أقدّر عدد أرقام الحاصل قبل أن أبدأ القسمة',
          chip: `10${R('t')}\\leq q<10(${R('t')}+1)`,
          quiz: [
            {
              q: `حاصل قسمة $${SC.a}$ على $${SC.plank}$ محصور بين:`,
              options: [`$${T / 10}$ و $${T / 10 + 1}$`, `$${T}$ و $${T + 10}$`, `$${T * 10}$ و $${(T + 10) * 10}$`],
              correct: 1,
            },
            {
              q: `لقسمة $${ESTIMATE.a}$ على $${ESTIMATE.b}$ نبدأ بحساب:`,
              options: [
                `$${ESTIMATE.b} \\times 30 = ${ESTIMATE.b * 30}$`,
                `$${ESTIMATE.b} \\times 3 = ${ESTIMATE.b * 3}$ فقط`,
                `$${ESTIMATE.a} - ${ESTIMATE.b} = ${ESTIMATE.a - ESTIMATE.b}$`,
              ],
              correct: 0,
            },
          ],
        },
      },
    ],
    4: [
      {
        id: 'baqi-fi-masala',
        type: 'methodes',
        title: 'الباقي في مسألة',
        summary:
          'قسمة واحدة تجيب عن ثلاثة أسئلة: كم مجموعة كاملة (الحاصل)، كم يبقى خارجها (الباقي)، وكم يلزم ليُؤخذ الكلّ (الحاصل، وواحدة أخرى إذا بقي شيء).',
        memo: {
          rule: `r=0\\to q\\qquad r\\neq 0\\to q+${R('1')}`,
          hook: 'أقرأ السؤال: الممتلئة، اللازمة، أم الباقون؟',
          example: `${QY.a}=${QY.b}\\times ${QUAY.q}+${R(QUAY.r)}\\ \\to\\ ${QUAY.q}+${R('1')}=${QUAY.q + 1}`,
          trap: 'الاكتفاء بالحاصل وقد بقي شيء، أو زيادة واحدة ولم يبقَ شيء',
          exam: 'أُنجز القسمة، ثمّ أكتب جملة تجيب عن السؤال المطروح',
          chip: `r\\neq 0\\to q+${R('1')}`,
          quiz: [
            {
              q: `في المحطّة $${QY.a}$ مسافرًا، وكلّ عربة تحمل $${QY.b}$: $${eq(QY.a, QY.b)}$. العربات اللازمة ليعبر الجميع:`,
              options: [`$${QUAY.q}$`, `$${QUAY.q + 1}$`, `$${QUAY.r}$`],
              correct: 1,
            },
            {
              q: `في المحطّة $${EXACT.a}$ مسافرًا، وكلّ عربة تحمل $${EXACT.b}$: $${eq(EXACT.a, EXACT.b)}$. العربات اللازمة ليعبر الجميع:`,
              options: [`$${EXACT.a / EXACT.b + 1}$`, `$${EXACT.a / EXACT.b}$`, `$${EXACT.b}$`],
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
  qisma: [50, 7],
  kamila: [50, 22],
  rappel: [82, 19],
  'mithal-kamila': [18, 25],
  asghar: [50, 37],
  'khata-baqi': [18, 42],
  musawat: [50, 52],
  asmaa: [82, 49],
  'mithal-musawat': [18, 58],
  taqdir: [30, 74],
  'mithal-taqdir': [14, 90],
  masala: [72, 66],
  'khata-masala': [86, 82],
  khulasa: [54, 92],
};

export const KNOWLEDGE = { graph: KNOWLEDGE_GRAPH, modules: LESSON_KNOWLEDGE.modules, positions: POSITIONS };
