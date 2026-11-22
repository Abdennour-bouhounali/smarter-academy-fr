/**
 * What « خريطة المعارف » shows for lesson `qisma-iqlidiya-hasr` (v2): the lesson's mind map (its cards and their labelled
 * links), the memo sheet of each of its three keys, and where each card sits on the full map.
 *
 * Written for the v2 lesson FROM SCRATCH, with the story's own numbers (`NUMBERS` of story.js — never retyped). The memo
 * items carry the ids of the three KEYS, which is what `pack.coach` and the board's « بطاقة المعارف » name.
 * A card is open when its key is held (`requires` is always a key); a card with `notebook` shows the memo sheet of its key.
 *
 * Words: in a Euclidean division b is « المقسوم عليه » (the word of the exercise bank and of the first year); « قاسم »
 * is kept for « b يقسم a » — the third key — and the link between the two is said once, on the card « أربع جمل ».
 * Every rule written here is true on the edges too (r = 0, a < b, a = b): the bracket is stated with 0 < r < b.
 */
import { BOX, TRIP, count } from './counted';
import { NUMBERS } from './story';

/** What CHANGES in a rule of the memo sheet (red). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;
const { long: L, bracket: H, exact: X, trips: P } = NUMBERS;
const div = (a, b) => ({ q: Math.floor(a / b), r: a % b });
const euclid = (a, b) => `${a} = ${b} \\times ${div(a, b).q} + ${div(a, b).r}`;
const [, L248, L365] = L.moulds;
const D365 = div(L.gap, L365);
const [H208, H312] = H.moulds;
const B208 = div(H.gap, H208);
const B312 = div(H.gap, H312);
const T = div(P.boxes, P.boat);
// the worked division of the example card, 4576 ÷ 248: ten planks, then a digit tried too big (9) and corrected (8)
const AFTER_TEN = L.gap - L248 * 10;
const D248 = div(L.gap, L248);
const UNITS = D248.q - 10;

export const KNOWLEDGE_GRAPH = {
  root: 'qisma',
  nodes: [
    {
      id: 'qisma',
      kind: 'concept',
      lane: 'center',
      requires: 'qisma-ay-adad',
      title: 'القسمة الإقليدية',
      subtitle: '$a = b \\times q + r$',
      context: { text: `هوّة من ${L.gap} خانة وألواح طولها ${L365}: كم لوحًا كاملًا؟ وكم خانة تبقى؟` },
      reveals: ['taqdir', 'mufradat'],
    },
    {
      id: 'mufradat',
      kind: 'prerequisite',
      lane: 'start',
      requires: 'qisma-ay-adad',
      title: 'أسماء الأعداد الأربعة',
      subtitle: 'المقسوم، المقسوم عليه، الحاصل، الباقي',
      context: {
        formula: `$${euclid(L.gap, L365)}$`,
        text: `${L.gap} المقسوم، ${L365} المقسوم عليه، ${D365.q} الحاصل، ${D365.r} الباقي.`,
      },
      reveals: [],
    },
    {
      id: 'taqdir',
      kind: 'method',
      lane: 'center',
      requires: 'qisma-ay-adad',
      notebook: true,
      title: 'القسمة على أيّ عدد',
      subtitle: '$r < b$',
      reveals: ['mithal-taqdir', 'khata-baqi', 'hasr', 'inidam'],
    },
    {
      id: 'mithal-taqdir',
      kind: 'example',
      lane: 'start',
      requires: 'qisma-ay-adad',
      title: `${L.gap} على ${L248}`,
      subtitle: 'نجرّب، نضرب، نصحّح',
      context: {
        list: [
          `$${L248} \\times 10 = ${L248 * 10}$ و $${L.gap} - ${L248 * 10} = ${AFTER_TEN}$`,
          `نجرّب ${UNITS + 1}: $${L248} \\times ${UNITS + 1} = ${L248 * (UNITS + 1)}$ يتجاوز ${AFTER_TEN}`,
          `ننقص إلى ${UNITS}: $${AFTER_TEN} - ${L248} \\times ${UNITS} = ${D248.r}$`,
        ],
        formula: `$${euclid(L.gap, L248)}$`,
      },
      reveals: [],
    },
    {
      id: 'khata-baqi',
      kind: 'common_mistake',
      lane: 'end',
      requires: 'qisma-ay-adad',
      title: 'باقٍ أكبر من المقسوم عليه',
      subtitle: `$${L.gap} = ${L365} \\times ${D365.q - 1} + ${D365.r + L365}$`,
      context: {
        parts: [
          {
            role: 'wrong',
            text: `$${L.gap} = ${L365} \\times ${D365.q - 1} + ${D365.r + L365}$ هي القسمة الإقليدية للعدد ${L.gap} على ${L365}.`,
          },
          { role: 'why', text: `المساواة صحيحة، لكنّ ${D365.r + L365} ليس أصغر من ${L365}: يدخل لوح آخر.` },
          { role: 'right', text: `$${euclid(L.gap, L365)}$ و ${D365.r} أصغر من ${L365}.` },
        ],
      },
      reveals: [],
    },
    {
      id: 'hasr',
      kind: 'relationship',
      lane: 'center',
      requires: 'hasr-hasil',
      notebook: true,
      title: 'حصر حاصل القسمة',
      subtitle: '$q < a \\div b < q + 1$',
      reveals: ['muqarraba', 'mithal-hasr', 'khata-lazim'],
    },
    {
      id: 'muqarraba',
      kind: 'tip',
      lane: 'end',
      requires: 'hasr-hasil',
      title: 'قيمتان مقرّبتان',
      subtitle: 'بالنقصان وبالزيادة',
      context: {
        // the bank's notation of the quotient, with a real fraction bar
        formula: `$${B208.q} < \\dfrac{${H.gap}}{${H208}} < ${B208.q + 1}$`,
        text: 'حاصل القسمة $a \\div b$ يُكتب أيضًا $\\frac{a}{b}$. إذا لم يكن الباقي معدومًا: $q$ قيمته المقرّبة إلى الوحدة بالنقصان، و $q + 1$ قيمته المقرّبة إلى الوحدة بالزيادة.',
        note: 'الأولى عدد الألواح الكاملة، والثانية عدد الألواح اللازمة.',
      },
      reveals: [],
    },
    {
      id: 'mithal-hasr',
      kind: 'example',
      lane: 'start',
      requires: 'hasr-hasil',
      title: `${H.gap} على ${H208}`,
      subtitle: `$${B208.q} < ${H.gap} \\div ${H208} < ${B208.q + 1}$`,
      context: {
        formula: `$${euclid(H.gap, H208)}$`,
        list: [
          `$${H208} \\times ${B208.q} = ${H208 * B208.q}$`,
          `$${H208} \\times ${B208.q + 1} = ${H208 * (B208.q + 1)}$`,
        ],
      },
      reveals: [],
    },
    {
      id: 'khata-lazim',
      kind: 'common_mistake',
      lane: 'end',
      requires: 'hasr-hasil',
      title: 'المملوءة أم اللازمة؟',
      subtitle: `${count(P.boxes, BOX)}، ${P.boat} في الرحلة`,
      context: {
        parts: [
          { role: 'wrong', text: `$${euclid(P.boxes, P.boat)}$، إذن تكفي ${count(T.q, TRIP)}.` },
          { role: 'why', text: `بعد ${count(T.q, TRIP, 'gen')} مملوءة يبقى على الرصيف ${count(T.r, BOX)}.` },
          {
            role: 'right',
            text: `${count(T.q, TRIP)} مملوءة، و ${count(T.q + 1, TRIP)} لازمة: القيمة بالزيادة.`,
          },
        ],
      },
      reveals: [],
    },
    {
      id: 'inidam',
      kind: 'relationship',
      lane: 'center',
      requires: 'inidam-baqi',
      notebook: true,
      title: 'انعدام الباقي',
      subtitle: '$r = 0$',
      reveals: ['siyagh', 'khulasa'],
    },
    {
      id: 'siyagh',
      kind: 'tip',
      lane: 'start',
      requires: 'inidam-baqi',
      title: 'أربع جمل لمعنى واحد',
      subtitle: `$${X.gap} = ${X.plank} \\times ${X.gap / X.plank}$`,
      context: {
        list: [
          'الباقي معدوم',
          `${X.gap} يقبل القسمة على ${X.plank}`,
          `${X.gap} مضاعف للعدد ${X.plank}`,
          `${X.plank} يقسم ${X.gap}`,
        ],
        // the ONE place that links the two words: the divisor of a division, and « a divisor of »
        note: `عندما يكون الباقي معدومًا، وعندئذ فقط، نقول إنّ المقسوم عليه ${X.plank} قاسم للعدد ${X.gap}.`,
      },
      reveals: [],
    },
    {
      id: 'khulasa',
      kind: 'takeaway',
      lane: 'center',
      requires: 'inidam-baqi',
      title: 'الحاصل والباقي',
      subtitle: 'كامل · بين عددين · مضبوط',
      context: {
        text: 'لكلّ عددين طبيعيين $a$ و $b$ ($b \\neq 0$): $a = b \\times q + r$ و $r < b$.',
        note: 'إذا كان $0 < r < b$ فإنّ $q < a \\div b < q + 1$؛ وإذا كان $r = 0$ فإنّ $a \\div b = q$ عدد طبيعي.',
      },
      reveals: [],
    },
  ],
  edges: [
    { from: 'qisma', to: 'taqdir', label: 'على أيّ عدد' },
    { from: 'qisma', to: 'mufradat', label: 'تذكّر' },
    { from: 'taqdir', to: 'mithal-taqdir', label: 'مثال' },
    { from: 'taqdir', to: 'khata-baqi', label: 'خطأ شائع' },
    { from: 'taqdir', to: 'hasr', label: 'الباقي ليس 0' },
    { from: 'taqdir', to: 'inidam', label: 'الباقي 0' },
    { from: 'hasr', to: 'muqarraba', label: 'نسمّي' },
    { from: 'hasr', to: 'mithal-hasr', label: 'مثال' },
    { from: 'hasr', to: 'khata-lazim', label: 'خطأ شائع' },
    { from: 'inidam', to: 'siyagh', label: 'نقول' },
    { from: 'inidam', to: 'khulasa', label: 'نستخلص' },
  ],
};

/** The memo sheets of the three keys, by the module that teaches them (1: the activity, 2: the knowledge). */
export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'qisma-ay-adad',
        type: 'regles',
        title: 'القسمة على أيّ عدد',
        summary:
          'نقسم على أيّ عدد غير معدوم، ولو من ثلاثة أرقام: نقدّر كلّ رقم من الحاصل، نضربه في المقسوم عليه، ونصحّحه؛ والباقي أصغر من المقسوم عليه.',
        memo: {
          rule: `a=b\\times q+${R('r')}\\ ,\\ ${R('r')}<b`,
          hook: 'رقم مجرَّب: جداؤه لا يتجاوز ما بقي، وما يبقى بعده أقصر من لوح',
          example: `${L.gap}=${L365}\\times${R(D365.q)}+${R(D365.r)}\\ ,\\ ${L365}\\times${D365.q + 1}=${L365 * (D365.q + 1)}`,
          trap: `قبول باقٍ أكبر من المقسوم عليه: ${L.gap} = ${L365} × ${D365.q - 1} + ${D365.r + L365}`,
          exam: 'أقدّر كلّ رقم من الحاصل بتقريب المقسوم عليه إلى مئة، أضربه في المقسوم عليه نفسه، أصحّحه، ثمّ أتحقّق أنّ الباقي أصغر من المقسوم عليه',
          chip: `${R('r')}<b`,
          quiz: [
            {
              q: `القسمة الإقليدية للعدد $${L.gap}$ على $${L365}$ هي:`,
              options: [
                `$${L.gap} = ${L365} \\times ${D365.q - 1} + ${D365.r + L365}$`,
                `$${euclid(L.gap, L365)}$`,
                `$${L.gap} = ${L365} \\times ${D365.q + 1} - ${L365 - D365.r}$`,
              ],
              correct: 1,
            },
            {
              q: `في قسمة إقليدية على $${L365}$، الباقي يمكن أن يكون:`,
              options: [`$${L365}$`, `$${L365 - 1}$`, `$${L365 + 1}$`],
              correct: 1,
            },
          ],
        },
      },
      {
        id: 'hasr-hasil',
        type: 'regles',
        title: 'حصر حاصل القسمة',
        summary:
          'إذا لم يكن الباقي معدومًا، يقع حاصل القسمة a ÷ b بين عددين طبيعيين متتاليين: الألواح الكاملة والألواح اللازمة.',
        memo: {
          rule: `a=b\\times q+r\\ ,\\ 0<r<b\\ \\Rightarrow\\ ${R('q')}<a\\div b<${R('q+1')}`,
          hook: 'باقٍ غير معدوم: الكاملة لا تكفي، والتي بعدها تكفي',
          example: `${R(B208.q)}<\\dfrac{${H.gap}}{${H208}}<${R(B208.q + 1)}`,
          trap: `أخذ الألواح الكاملة مكان اللازمة: ${count(T.q, TRIP)} لا تنقل ${count(P.boxes, BOX, 'acc')}`,
          exam: 'أنجز القسمة الإقليدية، ثمّ القيمة بالنقصان q والقيمة بالزيادة q + 1',
          chip: `${R('q')}<a\\div b<${R('q+1')}`,
          quiz: [
            {
              q: `$${euclid(H.gap, H312)}$. إذن:`,
              options: [
                `$${B312.r} < ${H.gap} \\div ${H312} < ${B312.r + 1}$`,
                `$${B312.q} < ${H.gap} \\div ${H312} < ${B312.q + 1}$`,
                `$${H.gap} \\div ${H312} = ${B312.q}$`,
              ],
              correct: 1,
            },
            {
              q: `قارب يحمل $${P.boat}$ صندوقًا، وعلى الرصيف $${P.boxes}$ صندوقًا. عدد الرحلات اللازمة:`,
              options: [`$${T.q}$`, `$${T.q + 1}$`, `$${T.r}$`],
              correct: 1,
            },
          ],
        },
      },
    ],
    2: [
      {
        id: 'inidam-baqi',
        type: 'regles',
        title: 'انعدام الباقي',
        summary: 'إذا كان الباقي 0 فإنّ a ÷ b عدد طبيعي: a يقبل القسمة على b، a مضاعف للعدد b، b يقسم a.',
        memo: {
          rule: `r=${R('0')}\\ \\Leftrightarrow\\ a=b\\times q\\ \\Leftrightarrow\\ a\\div b=${R('q')}`,
          hook: 'باقٍ معدوم: الكاملة هي اللازمة',
          example: `${X.gap}=${X.plank}\\times${X.gap / X.plank}+${R(0)}\\ ,\\ ${X.gap}\\div${X.plank}=${R(X.gap / X.plank)}`,
          trap: `قلب الجملة: ${X.plank} يقسم ${X.gap}، وليس ${X.gap} يقسم ${X.plank}`,
          exam: 'أنجز القسمة؛ إذا كان الباقي 0 أكتب a = b × q وأقول الجمل الأربع',
          chip: `r=${R('0')}`,
          quiz: [
            {
              q: `$${X.gap} = ${X.plank} \\times ${X.gap / X.plank}$. إذن:`,
              options: [
                `$${X.gap}$ يقسم $${X.plank}$`,
                `$${X.gap}$ مضاعف للعدد $${X.plank}$`,
                `$${X.plank}$ مضاعف للعدد $${X.gap}$`,
              ],
              correct: 1,
            },
            {
              q: `$${euclid(H.gap, H208)}$. هل $${H.gap} \\div ${H208}$ عدد طبيعي؟`,
              options: ['نعم', `لا: الباقي $${B208.r}$ ليس 0`, 'لا نستطيع أن نعرف'],
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
  mufradat: [82, 12],
  taqdir: [50, 27],
  'mithal-taqdir': [82, 34],
  'khata-baqi': [18, 30],
  hasr: [30, 52],
  muqarraba: [14, 66],
  'mithal-hasr': [34, 72],
  'khata-lazim': [16, 88],
  inidam: [70, 55],
  siyagh: [84, 74],
  khulasa: [62, 88],
};

export const KNOWLEDGE = { graph: KNOWLEDGE_GRAPH, modules: LESSON_KNOWLEDGE.modules, positions: POSITIONS };
