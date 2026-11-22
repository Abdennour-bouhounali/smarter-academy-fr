/**
 * Les exercices du MANUEL rattachés au درس « حساب مركبتي شعاع وتساوي شعاعين في معلم » (extraction.json → destinations :
 * ex-6, 7, 8, 9 p. 146 « مركبتا شعاع علمت إحداثيات مبدئه ونهايته », ex-12, 14 p. 147). Énoncés au mot près ; un exercice à
 * plusieurs parties est découpé en une entrée par partie (la première porte l'énoncé). Les composantes et les points se
 * tapent comme une ثنائية (`pair`, l'évaluateur `point` : un seul nombre juste = réponse partielle) ; les natures et les
 * observations sont des choix dont chaque distracteur est faux (la confusion qu'il porte est dite en commentaire).
 * Coquilles corrigées (extraction › discrepancies) : ex-8 « CD(2;-5) » est le VECTEUR $\overrightarrow{CD}$ ; ex-12
 * « الرباعي ABCD » → ABDC (ABCD parcouru dans l'ordre est croisé). Chaque correction est une ligne `correction`.
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_hisab-murakkibatay_P1',
  P2: '4am_hisab-murakkibatay_P2',
  P3: '4am_hisab-murakkibatay_P3',
};

const E = (n, part) => {
  const page = n >= 12 ? 147 : 146;
  const section = n >= 12 ? 'إحداثيتا منتصف قطعة - المسافة بين نقطتين' : 'مركبتا شعاع علمت إحداثيات مبدئه ونهايته';
  return { ...src(`ex-${n}`, page, section, n), ...(part ? { part } : {}) };
};
const COMP = ['a', 'b'];

export const EXERCISES = [
  // تمرين 6 — مركبات MN، NP، MP في أربع حالات
  {
    id: 'ex-6-a', source: E(6, '1'), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'المستوي مزوّد بمعلم مبدؤه O. (الوحدة 1cm). في كل حالة مما يلي، عيّن مركبتي كل شعاع من الأشعة $\\overrightarrow{MN}$ ، $\\overrightarrow{NP}$ ، $\\overrightarrow{MP}$ . 1) $M(1\\,;\\,6)$ ، $N(-2\\,;\\,-6)$ ، $P(-2\\,;\\,4)$ . 2) $M\\left(-1\\,;\\,\\dfrac{1}{2}\\right)$ ، $N\\left(\\dfrac{1}{2}\\,;\\,\\dfrac{13}{3}\\right)$ ، $P(0\\,;\\,4)$ . 3) $M\\left(\\dfrac{3}{2}\\,;\\,\\dfrac{1}{2}\\right)$ ، $N\\left(\\dfrac{1}{4}\\,;\\,\\dfrac{5}{6}\\right)$ ، $P(-4\\,;\\,7)$ . 4) $M(\\sqrt{3}\\,;\\,2)$ ، $N(6\\,;\\,\\sqrt{3})$ ، $P\\left(\\dfrac{\\sqrt{3}}{3}\\,;\\,4\\right)$ .',
    interaction: 'pair',
    question: {
      prompt: 'الحالة 1) مركبتا الشعاع $\\overrightarrow{MN}$ (الأولى ثم الثانية):',
      expected: { x: '-3', y: '-12' }, names: COMP,
      explain: '$x_N - x_M = -2 - 1 = -3$ و $y_N - y_M = -6 - 6 = -12$ : $\\overrightarrow{MN}\\begin{pmatrix} -3 \\\\ -12 \\end{pmatrix}$ .',
    },
    commonError: 'حساب $x_M - x_N = 3$ : المبدأ ناقص النهاية يعطي مركبتي $\\overrightarrow{NM}$ .',
  },
  {
    id: 'ex-6-b', source: E(6, '1'), learningPointId: LP.P1, difficulty: 'facile',
    interaction: 'pair',
    question: {
      prompt: 'الحالة 1) مركبتا الشعاع $\\overrightarrow{MP}$ :',
      expected: { x: '-3', y: '-2' }, names: COMP,
      explain: '$x_P - x_M = -2 - 1 = -3$ و $y_P - y_M = 4 - 6 = -2$ . ونتحقق: $\\overrightarrow{MN} + \\overrightarrow{NP} = \\overrightarrow{MP}$ لأن $-3 + 0 = -3$ و $-12 + 10 = -2$ .',
    },
  },
  {
    id: 'ex-6-c', source: E(6, '2'), learningPointId: LP.P1, difficulty: 'moyen',
    interaction: 'pair',
    question: {
      prompt: 'الحالة 2) مركبتا الشعاع $\\overrightarrow{MN}$ (كسران، مثل 3/2):',
      expected: { x: '3/2', y: '23/6' }, names: COMP,
      explain: '$\\dfrac{1}{2} - (-1) = \\dfrac{3}{2}$ و $\\dfrac{13}{3} - \\dfrac{1}{2} = \\dfrac{26 - 3}{6} = \\dfrac{23}{6}$ .',
    },
    commonError: 'طرح البسطين والمقامين: نوحّد المقامات أولا.',
  },
  {
    id: 'ex-6-d', source: E(6, '4'), learningPointId: LP.P1, difficulty: 'difficile',
    interaction: 'choice',
    question: {
      prompt: 'الحالة 4) مركبتا الشعاع $\\overrightarrow{MP}$ :',
      options: [
        '$\\begin{pmatrix} -\\dfrac{2\\sqrt{3}}{3} \\\\ 2 \\end{pmatrix}$',
        '$\\begin{pmatrix} \\dfrac{2\\sqrt{3}}{3} \\\\ -2 \\end{pmatrix}$', // M − P : la soustraction à l'envers
        '$\\begin{pmatrix} 0 \\\\ 2 \\end{pmatrix}$', // √3/3 − √3 traité comme 0 (MISC : réduire les racines)
      ],
      correct: 0, cols: 3,
      explain: '$\\dfrac{\\sqrt{3}}{3} - \\sqrt{3} = \\dfrac{\\sqrt{3} - 3\\sqrt{3}}{3} = -\\dfrac{2\\sqrt{3}}{3}$ و $4 - 2 = 2$ (الحساب على الجذور، الوحدة 2).',
    },
  },
  // تمرين 7 — AB و BA، ثم OB و OA
  {
    id: 'ex-7-a', source: E(7, '1'), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'المستوي مزوّد بمعلم مبدؤه O. (الوحدة 1cm). $A(1{,}5\\,;\\,-6)$ ، $B(-3{,}5\\,;\\,-2{,}5)$ . 1) أوجد مركبتي كل من $\\overrightarrow{AB}$ و $\\overrightarrow{BA}$ ، ماذا تُلاحظ؟ 2) أوجد مركبتي كل من $\\overrightarrow{OB}$ و $\\overrightarrow{OA}$ ، ماذا تُلاحظ؟',
    interaction: 'pair',
    question: {
      prompt: '1) مركبتا الشعاع $\\overrightarrow{AB}$ (عددان عشريان بالفاصلة مثل 3,5):',
      expected: { x: '-5', y: '3,5' }, names: COMP,
      explain: '$x_B - x_A = -3{,}5 - 1{,}5 = -5$ و $y_B - y_A = -2{,}5 - (-6) = 3{,}5$ .',
    },
  },
  {
    id: 'ex-7-b', source: E(7, '1'), learningPointId: LP.P1, difficulty: 'facile',
    interaction: 'choice',
    question: {
      prompt: '1) مركبتا $\\overrightarrow{BA}$ ، وماذا تلاحظ؟',
      options: [
        '$\\overrightarrow{BA}\\begin{pmatrix} 5 \\\\ -3{,}5 \\end{pmatrix}$ : مركبتان معاكستان لمركبتي $\\overrightarrow{AB}$',
        '$\\overrightarrow{BA}\\begin{pmatrix} -5 \\\\ 3{,}5 \\end{pmatrix}$ : نفس مركبتي $\\overrightarrow{AB}$', // AB et BA ne sont pas égaux
        '$\\overrightarrow{BA}\\begin{pmatrix} 3{,}5 \\\\ -5 \\end{pmatrix}$ : المركبتان مبدّلتان', // TABDIL-X-Y
      ],
      correct: 0, cols: 1,
      explain: '$x_A - x_B = 1{,}5 + 3{,}5 = 5$ و $y_A - y_B = -6 + 2{,}5 = -3{,}5$ : $\\overrightarrow{BA}$ هو معاكس $\\overrightarrow{AB}$ ، مركبتاه بإشارتين معاكستين.',
    },
    commonError: 'الظن أن $\\overrightarrow{AB}$ و $\\overrightarrow{BA}$ لهما نفس المركبتين لأن لهما نفس الطول.',
  },
  {
    id: 'ex-7-c', source: E(7, '2'), learningPointId: LP.P1, difficulty: 'moyen',
    interaction: 'choice',
    question: {
      prompt: '2) مركبتا $\\overrightarrow{OB}$ و $\\overrightarrow{OA}$ ، وماذا تلاحظ؟',
      options: [
        '$\\overrightarrow{OB}\\begin{pmatrix} -3{,}5 \\\\ -2{,}5 \\end{pmatrix}$ و $\\overrightarrow{OA}\\begin{pmatrix} 1{,}5 \\\\ -6 \\end{pmatrix}$ : مركبتا $\\overrightarrow{OM}$ هما إحداثيتا M',
        '$\\overrightarrow{OB}\\begin{pmatrix} 3{,}5 \\\\ 2{,}5 \\end{pmatrix}$ و $\\overrightarrow{OA}\\begin{pmatrix} -1{,}5 \\\\ 6 \\end{pmatrix}$', // O − M : à l'envers
        'لا يمكن الحساب لأن O ليست من معطيات التمرين', // O(0 ; 0) est l'origine du repère
      ],
      correct: 0, cols: 1,
      explain: '$O(0\\,;\\,0)$ : $x_B - 0 = -3{,}5$ و $y_B - 0 = -2{,}5$ . مركبتا $\\overrightarrow{OM}$ هما إحداثيتا M، ومنه أيضا مركبتا $\\overrightarrow{AB}$ = مركبتا $\\overrightarrow{OB}$ ناقص مركبتي $\\overrightarrow{OA}$ .',
    },
  },
  // تمرين 8 — نقطة مجهولة من شعاع معلوم (CD : coquille corrigée)
  {
    id: 'ex-8-a', source: E(8, '1'), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'المستوي مزوّد بمعلم متعامد ومتجانس مبدؤه O. 1) عيّن إحداثيتي النقطة A حيث $B(-10\\,;\\,10)$ و $\\overrightarrow{AB}\\begin{pmatrix} 3 \\\\ 2 \\end{pmatrix}$ . 2) عيّن إحداثيتي النقطة D حيث $C(-4\\,;\\,1{,}5)$ و $\\overrightarrow{CD}\\begin{pmatrix} 2 \\\\ -5 \\end{pmatrix}$ .',
    correction: 'صحّحت المنصّة خطأً مطبعيًا: في الكتاب «CD(2;-5)» دون سهم، والمقصود الشعاع $\\overrightarrow{CD}\\begin{pmatrix} 2 \\\\ -5 \\end{pmatrix}$ (لو كانت D(2;−5) لكانت معطاة).',
    interaction: 'pair',
    question: {
      prompt: '1) إحداثيتا النقطة A:',
      expected: { x: '-13', y: '8' },
      explain: '$x_B - x_A = 3$ أي $-10 - x_A = 3$ ومنه $x_A = -13$ ؛ و $10 - y_A = 2$ ومنه $y_A = 8$ : $A(-13\\,;\\,8)$ .',
    },
    commonError: 'جمع المركبتين إلى إحداثيتي B: $(-7\\,;\\,12)$ هي صورة B، والمطلوب المبدأ A، أي B ناقص المركبتين.',
  },
  {
    id: 'ex-8-b', source: E(8, '2'), learningPointId: LP.P3, difficulty: 'moyen',
    interaction: 'pair',
    question: {
      prompt: '2) إحداثيتا النقطة D (عدد عشري بالفاصلة):',
      expected: { x: '-2', y: '-3,5' },
      explain: '$x_D - (-4) = 2$ ومنه $x_D = -2$ ؛ $y_D - 1{,}5 = -5$ ومنه $y_D = -3{,}5$ : $D(-2\\,;\\,-3{,}5)$ .',
    },
  },
  // تمرين 9 — AB = OP ثم AB = PO
  {
    id: 'ex-9-a', source: E(9, '1'), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'المستوي مزوّد بمعلم مبدؤه O. (الوحدة 1cm). A، B، P نقط من المستوي حيث $A(2\\,;\\,2)$ ، $B(-3\\,;\\,2{,}5)$ ، $P(x\\,;\\,y)$ . عيّن x و y في كل حالة من الحالتين الآتيتين: 1) $\\overrightarrow{AB} = \\overrightarrow{OP}$ 2) $\\overrightarrow{AB} = \\overrightarrow{PO}$',
    interaction: 'pair',
    question: {
      prompt: '1) $\\overrightarrow{AB} = \\overrightarrow{OP}$ : الثنائية $(x\\,;\\,y)$',
      expected: { x: '-5', y: '0,5' },
      explain: '$\\overrightarrow{AB}\\begin{pmatrix} -5 \\\\ 0{,}5 \\end{pmatrix}$ و $\\overrightarrow{OP}\\begin{pmatrix} x \\\\ y \\end{pmatrix}$ : تساوي المركبتين يعطي $x = -5$ و $y = 0{,}5$ .',
    },
  },
  {
    id: 'ex-9-b', source: E(9, '2'), learningPointId: LP.P2, difficulty: 'difficile',
    interaction: 'pair',
    question: {
      prompt: '2) $\\overrightarrow{AB} = \\overrightarrow{PO}$ : الثنائية $(x\\,;\\,y)$',
      expected: { x: '5', y: '-0,5' },
      explain: '$\\overrightarrow{PO}\\begin{pmatrix} 0 - x \\\\ 0 - y \\end{pmatrix}$ : $-x = -5$ و $-y = 0{,}5$ ، إذن $x = 5$ و $y = -0{,}5$ .',
    },
    commonError: 'كتابة $\\overrightarrow{PO}\\begin{pmatrix} x \\\\ y \\end{pmatrix}$ : مبدأ $\\overrightarrow{PO}$ هو P، فمركبتاه $0 - x$ و $0 - y$ .',
  },
  // تمرين 12 — D من AB + AC = AD (coquille : ABCD → ABDC)
  {
    id: 'ex-12-a', source: E(12, '1'), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'في معلم متعامد ومتجانس لمستوٍ، (الوحدة 1cm). تُعطى النقط $A(1\\,;\\,-1)$ ، $B(0\\,;\\,3)$ ، $C(-2\\,;\\,0)$ . 1) احسب إحداثيتي النقطة D بحيث $\\overrightarrow{AB} + \\overrightarrow{AC} = \\overrightarrow{AD}$ . 2) علّم النقط A، B، C، D. 3) ما نوع الرباعي ABDC؟ برّر إجابتك.',
    correction: 'صحّحت المنصّة خطأً مطبعيًا: في الكتاب «ما نوع الرباعي ABCD؟»، والرباعي A ثم B ثم C ثم D متقاطع؛ متوازي الأضلاع هو ABDC.',
    interaction: 'pair',
    question: {
      prompt: '1) إحداثيتا النقطة D:',
      expected: { x: '-3', y: '4' },
      explain: '$\\overrightarrow{AB}\\begin{pmatrix} -1 \\\\ 4 \\end{pmatrix}$ و $\\overrightarrow{AC}\\begin{pmatrix} -3 \\\\ 1 \\end{pmatrix}$ ، فـ $\\overrightarrow{AD}\\begin{pmatrix} -4 \\\\ 5 \\end{pmatrix}$ : $x_D = 1 - 4 = -3$ و $y_D = -1 + 5 = 4$ .',
    },
    commonError: 'نسيان أن مركبتي $\\overrightarrow{AD}$ ليستا إحداثيتي D: نضيفهما إلى إحداثيتي A.',
  },
  {
    id: 'ex-12-b', source: E(12, '3'), learningPointId: LP.P2, difficulty: 'difficile',
    interaction: 'choice',
    question: {
      prompt: '3) نوع الرباعي ABDC:',
      options: [
        'متوازي أضلاع لأن $\\overrightarrow{AB} = \\overrightarrow{CD}$ (كلاهما $\\begin{pmatrix} -1 \\\\ 4 \\end{pmatrix}$)',
        'مستطيل', // BC² = 13 ≠ AD² = 41 : diagonales inégales
        'معيّن', // AB² = 17 ≠ AC² = 10
      ],
      correct: 0, cols: 1,
      explain: '$\\overrightarrow{CD}\\begin{pmatrix} -3 + 2 \\\\ 4 - 0 \\end{pmatrix} = \\begin{pmatrix} -1 \\\\ 4 \\end{pmatrix}$ = مركبتا $\\overrightarrow{AB}$ : ABDC متوازي أضلاع. ليس معيّنا ($AB^2 = 17$ و $AC^2 = 10$) ولا مستطيلا (قطراه $BC^2 = 13$ و $AD^2 = 41$).',
    },
  },
  // تمرين 14 — D حيث AB = DC
  {
    id: 'ex-14-a', source: E(14, '2'), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'في معلم متعامد ومتجانس لمستوٍ، (الوحدة 1cm). تُعطى النقط $A(1\\,;\\,1)$ ، $B(-1\\,;\\,4)$ ، $C(3\\,;\\,3)$ . 1) علّم النقط A، B و C. 2) عيّن إحداثيتي النقطة D بحيث $\\overrightarrow{AB} = \\overrightarrow{DC}$ . 3) ما نوع الرباعي ABCD؟',
    interaction: 'pair',
    question: {
      prompt: '2) إحداثيتا النقطة D:',
      expected: { x: '5', y: '0' },
      explain: '$\\overrightarrow{AB}\\begin{pmatrix} -2 \\\\ 3 \\end{pmatrix}$ و $\\overrightarrow{DC}\\begin{pmatrix} 3 - x_D \\\\ 3 - y_D \\end{pmatrix}$ : $3 - x_D = -2$ و $3 - y_D = 3$ ، إذن $D(5\\,;\\,0)$ .',
    },
    commonError: 'حلّ $x_D - 3 = -2$ (الشعاع $\\overrightarrow{CD}$ بدل $\\overrightarrow{DC}$) فنجد $D(1\\,;\\,6)$ والرباعي ABCD متقاطع.',
  },
  {
    id: 'ex-14-b', source: E(14, '3'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'choice',
    question: {
      prompt: '3) نوع الرباعي ABCD:',
      options: [
        'متوازي أضلاع ($\\overrightarrow{AB} = \\overrightarrow{DC}$ و A، B، C ليست على استقامة واحدة)',
        'معيّن', // AB² = 13 ≠ BC² = 17
        'رباعي متقاطع', // ce serait D tel que AB = CD
      ],
      correct: 0, cols: 1,
      explain: 'تساوي الشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{DC}$ يعني أن ABCD متوازي أضلاع. ليس معيّنا لأن $AB^2 = 4 + 9 = 13$ و $BC^2 = 16 + 1 = 17$ .',
    },
  },
];

export const partsOf = (n) => EXERCISES.filter((ex) => ex.id === `ex-${n}` || ex.id.startsWith(`ex-${n}-`));
export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
