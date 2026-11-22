/**
 * What « خريطة المعارف » shows for lesson `bahth-pgcd` (v2): the lesson's mind map (its cards and their labelled links),
 * the memo sheet of each of its five keys, and where each card sits on the full map.
 *
 * Written with the story's own numbers (`NUMBERS` of math.js, never retyped) and the two algorithms of math.js. The memo
 * items carry the ids of the five KEYS, which is what `pack.coach` and the board's « بطاقة المعارف » name. A card is open
 * when its key is held (`requires` is always a key); a card with `notebook` shows the memo sheet of its key. Card kinds:
 * only those of `kit/text.js`. Every option of a memo quiz is computed by `journey.test.js`: a distractor is a FALSE
 * equality (the draft offered « PGCD(152 ; 95) = PGCD(95 ; 247) » and « PGCD(962 ; 296) = PGCD(296 ; 666) » as wrong —
 * both are true).
 */
import {
  NUMBERS,
  SUBTRACTIONS,
  DIVISIONS,
  counted,
  differences,
  divTex,
  euclid,
  gcd,
  pgcdTex as P,
  subTex,
} from './math';

/** What CHANGES in a rule of the memo sheet (red). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;
/** « PGCD(a;b) » inside a memo formula. */
const p = (a, b) => `\\mathrm{PGCD}(${a};${b})`;
const { diff: DF, tarh: TR, fold: FD, iqlidis: IQ, sibaq: SB } = NUMBERS;
const [D1, D2, D3] = DF.gaps;
const [T1, T2] = TR.gaps;
const [F1, F2] = FD.gaps;
const [I1, I2] = IQ.gaps;
const [S1, S2] = SB.gaps;
const GD = gcd(D1, D2);
const GT = gcd(T1, T2);
const FOLD = euclid(F1, F2)[0];
const GF = gcd(F1, F2);
const EU = euclid(I1, I2);
const GI = gcd(I1, I2);
const RACE = euclid(S1, S2);
const RACE_SUBS = differences(S1, S2).length;
const SUBS_T = differences(T1, T2);

export const KNOWLEDGE_GRAPH = {
  root: 'pgcd-tawil',
  nodes: [
    {
      id: 'pgcd-tawil',
      kind: 'concept',
      lane: 'center',
      requires: 'farq-yabqi',
      title: 'هوّتان طويلتان',
      subtitle: 'حصر القواسم يطول',
      context: {
        text: `أطول لوح يملأ هوّتين هو القاسم المشترك الأكبر لطوليهما. حين تطول الهوّتان (${I1} و ${I2}) يطول حصر قواسمهما: نبحث عن طريق أقصر.`,
      },
      reveals: ['rappel', 'farq'],
    },
    {
      id: 'rappel',
      kind: 'prerequisite',
      lane: 'start',
      requires: 'farq-yabqi',
      title: 'القسمة الإقليدية',
      subtitle: '$a = b \\times q + r$',
      context: { text: 'قسمة $a$ على $b$: $a = b \\times q + r$ حيث $0 \\leq r < b$؛ $q$ الحاصل و $r$ الباقي.' },
      reveals: [],
    },
    {
      id: 'farq',
      kind: 'relationship',
      lane: 'center',
      requires: 'farq-yabqi',
      notebook: true,
      title: 'الفرق يحفظ الألواح المشتركة',
      subtitle: '$\\mathrm{PGCD}(a ; b) = \\mathrm{PGCD}(b ; a - b)$',
      reveals: ['khata-farq', 'silsila', 'mithal-152'],
    },
    {
      id: 'khata-farq',
      kind: 'common_mistake',
      lane: 'end',
      requires: 'farq-yabqi',
      title: 'الفرق هو الجواب؟',
      subtitle: `$${P(D1, D2)} \\neq ${D3}$`,
      context: {
        parts: [
          { role: 'wrong', text: `$${D1} - ${D2} = ${D3}$، إذن $${P(D1, D2)} = ${D3}$.` },
          {
            role: 'why',
            text: `الفرق ${D3} يحلّ مكان العدد ${D1} فقط: $${D2} = ${D3} \\times 1 + ${D2 - D3}$، إذن ${D3} لا يقسم ${D2}.`,
          },
          { role: 'right', text: `$${P(D1, D2)} = ${P(D2, D3)} = ${GD}$.` },
        ],
      },
      reveals: [],
    },
    {
      id: 'mithal-152',
      kind: 'example',
      lane: 'start',
      requires: 'farq-yabqi',
      title: `${D1} و ${D2}`,
      subtitle: `$${P(D1, D2)} = ${P(D2, D3)}$`,
      context: {
        formula: `$${D1} - ${D2} = ${D3}$`,
        text: `اللوح ${DF.plank} يملأ الثلاثة: $${D1} = ${DF.plank} \\times ${D1 / DF.plank}$ و $${D2} = ${DF.plank} \\times ${D2 / DF.plank}$ و $${D3} = ${DF.plank} \\times ${D3 / DF.plank}$.`,
      },
      reveals: [],
    },
    {
      id: 'silsila',
      kind: 'method',
      lane: 'center',
      requires: 'khawarizmiyat-al-tarh',
      notebook: true,
      title: 'خوارزمية الفروق',
      subtitle: 'آخر فرق غير معدوم',
      reveals: ['khata-sifr', 'baqi', 'mithal-259'],
    },
    {
      id: 'khata-sifr',
      kind: 'common_mistake',
      lane: 'end',
      requires: 'khawarizmiyat-al-tarh',
      title: 'آخر فرق هو 0',
      subtitle: 'فهل القاسم المشترك الأكبر 0؟',
      context: {
        parts: [
          { role: 'wrong', text: `آخر فرق هو $${GT} - ${GT} = 0$، إذن $${P(T1, T2)} = 0$.` },
          { role: 'why', text: '0 ليس قاسمًا لأيّ عدد: الفرق 0 يقول إنّ الخوارزمية انتهت.' },
          { role: 'right', text: `نأخذ آخر فرق غير معدوم: $${P(T1, T2)} = ${GT}$.` },
        ],
      },
      reveals: [],
    },
    {
      id: 'mithal-259',
      kind: 'example',
      lane: 'start',
      requires: 'khawarizmiyat-al-tarh',
      title: `${T1} و ${T2}`,
      subtitle: `$${P(T1, T2)} = ${GT}$`,
      context: { list: SUBS_T.map((s) => `$${subTex(s)}$`) },
      reveals: [],
    },
    {
      id: 'baqi',
      kind: 'relationship',
      lane: 'center',
      requires: 'baqi-yabqi',
      notebook: true,
      title: 'الباقي يحفظ الألواح المشتركة',
      subtitle: '$\\mathrm{PGCD}(a ; b) = \\mathrm{PGCD}(b ; r)$',
      reveals: ['mithal-962', 'iqlidis', 'khata-hasil'],
    },
    {
      id: 'mithal-962',
      kind: 'example',
      lane: 'start',
      requires: 'baqi-yabqi',
      title: `${F1} و ${F2}`,
      subtitle: `$${P(F1, F2)} = ${P(F2, FOLD.r)}$`,
      context: {
        formula: `$${divTex(FOLD)}$`,
        text: `${counted(FOLD.q, SUBTRACTIONS)} للعدد ${F2} في قسمة واحدة: $${F1} - ${Array(FOLD.q).fill(F2).join(' - ')} = ${FOLD.r}$.`,
      },
      reveals: [],
    },
    {
      id: 'khata-hasil',
      kind: 'common_mistake',
      lane: 'end',
      requires: 'baqi-yabqi',
      title: 'الحاصل أم الباقي؟',
      subtitle: 'نكمل مع الباقي',
      context: {
        parts: [
          { role: 'wrong', text: `$${divTex(FOLD)}$، إذن $${P(F1, F2)} = ${P(F2, FOLD.q)}$.` },
          {
            role: 'why',
            text: `$${P(F2, FOLD.q)} = ${gcd(F2, FOLD.q)}$ بينما $${P(F1, F2)} = ${GF}$: الحاصل ${FOLD.q} يعدّ مرّات طرح ${F2}، ولا يحلّ مكان شيء.`,
          },
          { role: 'right', text: `$${P(F1, F2)} = ${P(F2, FOLD.r)} = ${GF}$.` },
        ],
      },
      reveals: [],
    },
    {
      id: 'iqlidis',
      kind: 'method',
      lane: 'center',
      requires: 'iqlidis',
      notebook: true,
      title: 'خوارزمية إقليدس',
      subtitle: 'آخر باقٍ غير معدوم',
      reveals: ['mithal-1833', 'muqarana', 'khulasa'],
    },
    {
      id: 'mithal-1833',
      kind: 'example',
      lane: 'start',
      requires: 'iqlidis',
      title: `${I1} و ${I2}`,
      subtitle: `$${P(I1, I2)} = ${GI}$`,
      context: { list: EU.map((s) => `$${divTex(s)}$`) },
      reveals: [],
    },
    {
      id: 'muqarana',
      kind: 'relationship',
      lane: 'center',
      requires: 'aqall-khutuwat',
      notebook: true,
      title: 'أيّ الخوارزميتين أسرع',
      subtitle: `${counted(RACE_SUBS, SUBTRACTIONS)} أم ${counted(RACE.length, DIVISIONS)}؟`,
      reveals: [],
    },
    {
      id: 'khulasa',
      kind: 'takeaway',
      lane: 'end',
      requires: 'aqall-khutuwat',
      title: 'كيف أبحث عنه؟',
      subtitle: 'الفروق · إقليدس · الأقصر',
      context: {
        text: 'نضع مكان العددين عددين أصغر لهما القواسم المشتركة نفسها: بالفرق (آخر فرق غير معدوم) أو بالباقي (آخر باقٍ غير معدوم).',
        note: 'خوارزمية إقليدس لا تحتاج خطوات أكثر من خوارزمية الفروق: نختارها حين يكون أحد العددين أكبر من الآخر بكثير.',
      },
      reveals: [],
    },
  ],
  edges: [
    { from: 'pgcd-tawil', to: 'rappel', label: 'تذكّر' },
    { from: 'pgcd-tawil', to: 'farq', label: 'كيف نجده؟' },
    { from: 'farq', to: 'khata-farq', label: 'خطأ شائع' },
    { from: 'farq', to: 'silsila', label: 'نعيد' },
    { from: 'farq', to: 'mithal-152', label: 'مثال' },
    { from: 'silsila', to: 'khata-sifr', label: 'خطأ شائع' },
    { from: 'silsila', to: 'baqi', label: 'نختصر' },
    { from: 'silsila', to: 'mithal-259', label: 'مثال' },
    { from: 'baqi', to: 'mithal-962', label: 'مثال' },
    { from: 'baqi', to: 'iqlidis', label: 'نعيد' },
    { from: 'baqi', to: 'khata-hasil', label: 'خطأ شائع' },
    { from: 'iqlidis', to: 'mithal-1833', label: 'مثال' },
    { from: 'iqlidis', to: 'muqarana', label: 'نقارن' },
    { from: 'iqlidis', to: 'khulasa', label: 'نستخلص' },
  ],
};

/**
 * The memo sheets of the five keys, by the module that teaches them (1: the difference and the subtractions, 2: the
 * remainder, 3: Euclid and the comparison).
 */
export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'farq-yabqi',
        type: 'regles',
        title: 'الفرق يحفظ الألواح المشتركة',
        summary: 'للعددين a و b وللعددين b و a − b القواسم المشتركة نفسها.',
        memo: {
          rule: `a>b\\ \\Rightarrow\\ ${p('a', 'b')}=${p('b', R('a-b'))}`,
          hook: 'نطرح الأصغر من الأكبر: الألواح المشتركة تبقى',
          example: `${p(D1, D2)}=${p(D2, R(D3))}`,
          trap: `أخذ الفرق ${D3} قاسمًا مشتركًا أكبر للعددين ${D1} و ${D2}: الفرق يحلّ مكان العدد الأكبر فقط`,
          exam: 'أحسب الفرق، ثمّ أكتب المساواة بالفرق مكان العدد الأكبر',
          chip: p('b', R('a-b')),
          quiz: [
            {
              q: `$${P(D1, D2)} = \\mathrm{PGCD}(${D2} ; \\ldots)$`,
              options: ['$1$', `$${D3}$`, '$5$'],
              correct: 1,
            },
            {
              q: `كلّ لوح يملأ الهوّتين ${D1} و ${D2} يملأ أيضًا:`,
              options: [`هوّة ${D3 + 1} خانة`, `هوّة ${D3} خانة`, `هوّة ${D2 + 1} خانة`],
              correct: 1,
            },
          ],
        },
      },
      {
        id: 'khawarizmiyat-al-tarh',
        type: 'methodes',
        title: 'خوارزمية الفروق',
        summary: 'نطرح الأصغر من الأكبر ونعيد حتّى نصل إلى فرق معدوم: القاسم المشترك الأكبر هو آخر فرق غير معدوم.',
        memo: {
          rule: `d_k\\neq 0\\ ,\\ d_{k+1}=0\\ \\Rightarrow\\ ${p('a', 'b')}=${R('d_k')}`,
          hook: 'نطرح ونعيد حتّى الصفر، ونأخذ ما قبله',
          example: `${SUBS_T.at(-2).x}-${SUBS_T.at(-2).y}=${R(SUBS_T.at(-2).d)}\\ ,\\ ${subTex(SUBS_T.at(-1))}`,
          trap: 'أخذ آخر فرق وهو 0، أو التوقّف عند الفرق الأوّل',
          exam: 'أكتب كلّ فرق في سطر: الأكبر ناقص الأصغر',
          chip: `${R('d_k')}\\neq 0`,
          quiz: [
            {
              q: `خوارزمية الفروق للعددين $${T1}$ و $${T2}$ تنتهي بـ $${GT} - ${GT} = 0$. إذن $${P(T1, T2)} =$`,
              options: ['$0$', `$${GT}$`, `$${T1 - T2}$`],
              correct: 1,
            },
            {
              q: `بعد $${subTex(SUBS_T[0])}$ نحسب:`,
              options: [`$${T2} - ${SUBS_T[0].d}$`, `$${T1} - ${SUBS_T[0].d}$`, `$${SUBS_T[0].d} - ${T2}$`],
              correct: 0,
            },
          ],
        },
      },
    ],
    2: [
      {
        id: 'baqi-yabqi',
        type: 'regles',
        title: 'الباقي يحفظ الألواح المشتركة',
        summary: 'إذا كان r باقي قسمة a على b فللعددين a و b وللعددين b و r القواسم المشتركة نفسها.',
        memo: {
          rule: `a=b\\times q+${R('r')}\\ \\Rightarrow\\ ${p('a', 'b')}=${p('b', R('r'))}`,
          hook: 'القسمة طرح متكرّر: الباقي يحفظ ما يحفظه الفرق',
          example: `${F1}=${F2}\\times${FOLD.q}+${R(FOLD.r)}\\ \\Rightarrow\\ ${p(F1, F2)}=${p(F2, R(FOLD.r))}`,
          trap: 'وضع الحاصل مكان الباقي',
          exam: 'أكتب القسمة الإقليدية، ثمّ المساواة بالباقي',
          chip: p('b', R('r')),
          quiz: [
            {
              q: `$${divTex(FOLD)}$. إذن $${P(F1, F2)} = \\mathrm{PGCD}(${F2} ; \\ldots)$`,
              options: [`$${FOLD.q}$`, `$${FOLD.r}$`, `$${FOLD.r + 1}$`],
              correct: 1,
            },
            {
              q: 'الباقي $r$ في $a = b \\times q + r$ يساوي:',
              options: ['$a - b \\times q$', '$a + b \\times q$', '$a - q$'],
              correct: 0,
            },
          ],
        },
      },
    ],
    3: [
      {
        id: 'iqlidis',
        type: 'methodes',
        title: 'خوارزمية إقليدس',
        summary:
          'نقسم، ثمّ نقسم القاسم على الباقي، حتّى نصل إلى باقٍ معدوم: القاسم المشترك الأكبر هو آخر باقٍ غير معدوم.',
        memo: {
          rule: `r_k\\neq 0\\ ,\\ r_{k+1}=0\\ \\Rightarrow\\ ${p('a', 'b')}=${R('r_k')}`,
          hook: 'نقسم القاسم على الباقي حتّى الصفر',
          example: `${EU.at(-2).a}=${EU.at(-2).b}\\times${EU.at(-2).q}+${R(EU.at(-2).r)}\\ ,\\ ${divTex(EU.at(-1))}`,
          trap: 'أخذ آخر حاصل، أو الباقي 0',
          exam: 'أكتب القسمات متتابعة: القاسم يصير مقسومًا، والباقي يصير قاسمًا',
          chip: `${R('r_k')}\\neq 0`,
          quiz: [
            {
              q: `$${divTex(EU.at(-2))}$ و $${divTex(EU.at(-1))}$. إذن $${P(I1, I2)} =$`,
              options: [`$${EU.at(-1).q}$`, `$${GI}$`, '$0$'],
              correct: 1,
            },
            {
              q: `بعد $${divTex(EU[0])}$ نقسم:`,
              options: [`$${EU[0].b}$ على $${EU[0].r}$`, `$${I1}$ على $${EU[0].r}$`, `$${EU[0].r}$ على $${EU[0].q}$`],
              correct: 0,
            },
          ],
        },
      },
      {
        id: 'aqall-khutuwat',
        type: 'regles',
        title: 'أيّ الخوارزميتين أسرع',
        summary: 'كلّ قسمة تجمع عمليات طرح بعدد حاصلها: خوارزمية إقليدس لا تحتاج خطوات أكثر من خوارزمية الفروق.',
        memo: {
          rule: `q_1+q_2+\\cdots+q_k\\ \\geq\\ ${R('k')}`,
          hook: 'قسمة واحدة تجمع عمليات طرح بعدد حاصلها',
          example: `${RACE.map((s) => s.q).join('+')}=${R(RACE_SUBS)}\\ \\geq\\ ${R(RACE.length)}`,
          trap: 'اختيار الفروق لعددين أحدهما أكبر من الآخر بكثير',
          exam: 'عددان متقاربان: الفروق قصيرة؛ وإلّا فإقليدس',
          chip: R('q_1+\\cdots+q_k'),
          quiz: [
            {
              q: `$${divTex(RACE[0])}$ و $${divTex(RACE[1])}$. كم عملية طرح تحتاج خوارزمية الفروق للعددين؟`,
              options: [`$${RACE.length}$`, `$${RACE_SUBS}$`, `$${gcd(S1, S2)}$`],
              correct: 1,
            },
            {
              q: 'أيّ الخوارزميتين لا تحتاج أبدًا خطوات أكثر من الأخرى؟',
              options: ['خوارزمية الفروق', 'خوارزمية إقليدس', 'لا يمكن المقارنة'],
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
 * map, which the walks measured (`qasim-mushtarak-akbar/world/knowledge.js`, `tayin-pgcd/world/knowledge.js`): SIX rows
 * (5, 23, 41, 59, 76, 93 — the second row lowered from lesson 5's 20.5: its card « الفرق يحفظ الألواح المشتركة » takes
 * two lines, and the labels « تذكّر », « كيف نجده؟ » touched its top, measured by this lesson's trainer walk), three cards a row at most, on the columns 17 %, 50 %, 83 % (a card is at most 15rem wide,
 * 8.6rem below 1101 px: at 17 % / 83 % it stays inside the box — 1366 × 768: 13 px to the edge; 1024 × 768: 29 px;
 * 1840 × 900: 33 px, as measured on lesson 5). Every link joins two NEIGHBOUR rows, so its label sits at 8.5 % or more
 * from both rows (between 23 and 41: 32; …), never under a card.
 */
const POSITIONS = {
  'pgcd-tawil': [50, 5],
  rappel: [17, 23],
  farq: [50, 23],
  'khata-farq': [17, 41],
  silsila: [50, 41],
  'mithal-152': [83, 41],
  'khata-sifr': [17, 59],
  baqi: [50, 59],
  'mithal-259': [83, 59],
  'mithal-962': [17, 76],
  iqlidis: [50, 76],
  'khata-hasil': [83, 76],
  'mithal-1833': [17, 93],
  muqarana: [50, 93],
  khulasa: [83, 93],
};

export const KNOWLEDGE = { graph: KNOWLEDGE_GRAPH, modules: LESSON_KNOWLEDGE.modules, positions: POSITIONS };
