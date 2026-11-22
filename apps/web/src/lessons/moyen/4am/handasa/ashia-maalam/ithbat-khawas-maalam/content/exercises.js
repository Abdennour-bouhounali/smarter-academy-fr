/**
 * Les exercices du MANUEL rattachés au درس 4 « توظيف الحساب الشعاعي والإحداثيات لإثبات الخواص الهندسية » et rendus au
 * module 4 (extraction.json → destinations : ex-13, 18, 19 p. 147 ; ex-21, 24, 26, 27 p. 149 « أتعمّق »). Énoncés au mot près,
 * un exercice à plusieurs parties découpé en une entrée par partie (la première porte l'énoncé). Réponses : extraction
 * (`answerSource: computed`, assertées par build-extraction.py, recalculées dans content/figures.test.js) ; chaque
 * distracteur est FAUX et sa confusion est dite (MISC-MAALAM-*). CORRECTIONS : ex-13 (unité absente → 1cm), ex-21 (« أربع
 * نقط » → ثلاث), ex-26 (le losange est ACBD) — une ligne chacune (content/exercises.js › CORRECTIONS) ; ex-24 Q3 lu
 * « AB و BC » (une ligne). Les figures sont des DONNÉES GeoFigure (content/figures.js).
 */
import { src } from '../../_unit/unitMeta.js';
import { LP } from './textbook.js';

const P147 = 'إحداثيتا منتصف قطعة - المسافة بين نقطتين';
const S = (n, part) => ({ ...src(`ex-${n}`, n <= 19 ? 147 : 149, n <= 19 ? P147 : 'أتعمّق', n), ...(part ? { part } : {}) });

export const CORRECTIONS = {
  ex13: 'صحّحت المنصّة خطأً مطبعيًا: وحدة الطول ناقصة في الكتاب «(الوحدة )» ، فأكملناها «(الوحدة 1cm)» كبقية التمارين؛ لا تتغيّر الأجوبة.',
  ex21: 'صحّحت المنصّة خطأً مطبعيًا: الكتاب يقول «أربع نقط» والمعطى ثلاث نقط فقط A و B و C.',
  ex24: 'السؤال 3 يعيد طلب الطولين AC و BD المحسوبين في السؤال 2؛ لاستنتاج السؤال 4 نحتاج الطولين AB و BC من المركبتين، فنحسبهما.',
  ex26: 'صحّحت المنصّة خطأً مطبعيًا: بالترتيب A ثم B ثم C ثم D يكون الرباعي متقاطع الضلعين؛ الرباعي المقصود هو ACBD (أضلاعه [AC] و [CB] و [BD] و [DA]).',
};

export const EXERCISES = [
  // تمرين 13 — A(3 ; 0), B(0 ; 2), C(2 ; 5), D(5 ; 3) : milieux confondus, AB = BC, AB² + BC² = AC², carré
  {
    id: 'ex-13-1', source: S(13, '1'), learningPointId: LP.P2, difficulty: 'facile', figure: 'ex13', correction: 'ex13',
    statement: 'في معلم متعامد ومتجانس لمستوٍ، (الوحدة 1cm). تُعطى النقط $A(3\\,;\\,0)$ ، $B(0\\,;\\,2)$ ، $C(2\\,;\\,5)$ ، $D(5\\,;\\,3)$ . 1) تحقّق أنّ للقطعتين [AC] و [BD] نفس المنتصف. ماذا تستنتج؟ 2) تحقّق أنّ AB = BC. ماذا تستنتج؟ 3) تحقّق أنّ $AB^2 + BC^2 = AC^2$ ماذا تستنتج؟ 4) ما نوع الرباعي ABCD؟',
    interaction: 'pair',
    question: {
      prompt: '1) إحداثيتا منتصف [AC] (وهما أيضا إحداثيتا منتصف [BD]):',
      expected: { x: '5/2', y: '5/2' },
      explain: 'منتصف [AC]: $\\left(\\dfrac{3 + 2}{2}\\,;\\,\\dfrac{0 + 5}{2}\\right) = \\left(\\dfrac{5}{2}\\,;\\,\\dfrac{5}{2}\\right)$ ، ومنتصف [BD]: $\\left(\\dfrac{0 + 5}{2}\\,;\\,\\dfrac{2 + 3}{2}\\right) = \\left(\\dfrac{5}{2}\\,;\\,\\dfrac{5}{2}\\right)$ . للقطرين نفس المنتصف: ABCD متوازي أضلاع.',
    },
    commonError: 'طرح الإحداثيتين بدل جمعهما: المنتصف نصف المجموع.',
  },
  {
    id: 'ex-13-2', source: S(13, '2'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'choice',
    question: {
      prompt: '2) $AB^2 = 13$ و $BC^2 = 13$ ، أي AB = BC. نستنتج أن:',
      options: ['متوازي الأضلاع ABCD معيّن', 'ABCD مستطيل', 'ABCD مربّع', 'المثلث ABC متقايس الأضلاع'],
      correct: 0, cols: 1,
      explain: 'متوازي أضلاع (السؤال 1) فيه ضلعان متتاليان متقايسان: معيّن. المستطيل يحتاج قطرين متقايسين، والمربّع الشرطين معا؛ و $AC^2 = 26 \\neq 13$ فالمثلث ABC ليس متقايس الأضلاع.',
    },
    commonError: 'استنتاج «مربّع» من ضلعين متتاليين متقايسين وحدهما.',
  },
  {
    id: 'ex-13-3', source: S(13, '3'), learningPointId: LP.P1, difficulty: 'moyen',
    interaction: 'choice',
    question: {
      prompt: '3) $AB^2 + BC^2 = 13 + 13 = 26 = AC^2$ . نستنتج أن:',
      options: ['المثلث ABC قائم في B', 'المثلث ABC قائم في A', 'المثلث ABC قائم في C', 'المثلث ABC متقايس الأضلاع'],
      correct: 0, cols: 2,
      explain: 'الضلع الذي يكون وحده هو [AC] ، المقابل للرأس B : حسب الخاصية العكسية لخاصية فيثاغورس، ABC قائم في B.',
    },
    commonError: 'وضع الزاوية القائمة عند A : الزاوية القائمة تقابل الضلع الأطول [AC].',
  },
  {
    id: 'ex-13-4', source: S(13, '4'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'choice',
    question: {
      prompt: '4) نوع الرباعي ABCD:',
      options: ['مربّع', 'معيّن وليس مربّعا', 'مستطيل وليس مربّعا', 'متوازي أضلاع فقط'],
      correct: 0, cols: 2,
      explain: 'معيّن (السؤال 2) فيه زاوية قائمة في B (السؤال 3): مربّع.',
    },
  },

  // تمرين 18 — A(1 ; 0), B(0 ; 3), C(3 ; 4) : AB = √10, AC = 2√5, I(2 ; 2), B ∈ (𝒞), (BI) ⊥ (AC), قائم ومتساوي الساقين
  {
    id: 'ex-18-1', source: S(18, '1'), learningPointId: LP.P1, difficulty: 'facile', figure: 'ex18',
    statement: 'في معلم متعامد ومتجانس لمستوٍ، (الوحدة 1cm). تُعطى النقط $A(1\\,;\\,0)$ ، $B(0\\,;\\,3)$ ، $C(3\\,;\\,4)$ . 1) احسب AB و AC. 2) عيّن إحداثيتي النقطة I مركز الدائرة (𝒞) التي قطرها [AC]. 3) بيّن أنّ B نقطة من الدائرة (𝒞). 4) بيّن أنّ (BI) ⊥ (AC). 5) ما نوع المثلث ABC.',
    interaction: 'batch',
    question: {
      prompt: '1) احسب:',
      rows: [
        { label: 'AB =', options: ['$\\sqrt{10}$', '$10$', '$4$'], correct: 0,
          correction: '$AB = \\sqrt{(0 - 1)^2 + (3 - 0)^2} = \\sqrt{1 + 9} = \\sqrt{10}$ ( $10$ هو $AB^2$ ، و $4 = 1 + 3$ جمع للفرقين).' },
        { label: 'AC =', options: ['$2\\sqrt{5}$', '$20$', '$6$'], correct: 0,
          correction: '$AC = \\sqrt{(3 - 1)^2 + (4 - 0)^2} = \\sqrt{4 + 16} = \\sqrt{20} = 2\\sqrt{5}$ .' },
      ],
    },
    commonError: 'نسيان الجذر: $(x_B - x_A)^2 + (y_B - y_A)^2$ هو $AB^2$ .',
  },
  {
    id: 'ex-18-2', source: S(18, '2'), learningPointId: LP.P3, difficulty: 'facile',
    interaction: 'pair',
    question: {
      prompt: '2) إحداثيتا I مركز الدائرة (𝒞) التي قطرها [AC]:',
      expected: { x: '2', y: '2' },
      explain: 'مركز الدائرة التي قطرها [AC] هو منتصف [AC]: $\\left(\\dfrac{1 + 3}{2}\\,;\\,\\dfrac{0 + 4}{2}\\right) = (2\\,;\\,2)$ .',
    },
  },
  {
    id: 'ex-18-3', source: S(18, '3'), learningPointId: LP.P3, difficulty: 'moyen',
    interaction: 'choice',
    question: {
      prompt: '3) B نقطة من الدائرة (𝒞) لأن:',
      options: [
        '$IB = \\sqrt{5}$ ونصف قطر (𝒞) هو $IA = \\dfrac{AC}{2} = \\sqrt{5}$',
        '$IB = \\sqrt{5}$ و $AC = 2\\sqrt{5}$ ، والطولان مختلفان',
        'B على محور التراتيب',
        '$BA = BC$',
      ],
      correct: 0, cols: 1,
      explain: '$IB = \\sqrt{(0 - 2)^2 + (3 - 2)^2} = \\sqrt{5}$ و $IA = \\sqrt{(1 - 2)^2 + (0 - 2)^2} = \\sqrt{5}$ : بعد B عن المركز يساوي نصف القطر. نقارن بنصف القطر لا بالقطر $AC$ ؛ و $BA = BC$ تضع B على محور [AC] لا على الدائرة.',
    },
    commonError: 'مقارنة IB بالقطر AC بدل نصف القطر.',
  },
  {
    id: 'ex-18-4', source: S(18, '4'), learningPointId: LP.P1, difficulty: 'difficile',
    interaction: 'choice',
    question: {
      prompt: '4) $(BI) \\perp (AC)$ لأن:',
      options: [
        '$BA = BC = \\sqrt{10}$ : ABC متساوي الساقين رأسه B ، و (BI) متوسط فهو ارتفاع أيضا',
        '$AB = AC$',
        '(BI) يوازي محور التراتيب',
        'I منتصف [AC] ، وكل مستقيم يشمل منتصف قطعة عمودي عليها',
      ],
      correct: 0, cols: 1,
      explain: '$BC = \\sqrt{(3 - 0)^2 + (4 - 3)^2} = \\sqrt{10} = BA$ : في المثلث متساوي الساقين رأسه B ، المتوسط النازل من B هو أيضا ارتفاع. ( $AB = \\sqrt{10} \\neq 2\\sqrt{5} = AC$ ، و (BI) ليس شاقوليا: $x_B = 0 \\neq 2 = x_I$ .)',
    },
    commonError: 'البحث عن جداء سلمي: في السنة الرابعة نثبت التعامد بالمثلث متساوي الساقين أو بعكس خاصية فيثاغورس.',
  },
  {
    id: 'ex-18-5', source: S(18, '5'), learningPointId: LP.P1, difficulty: 'moyen', figure: 'ex18done',
    interaction: 'choice',
    question: {
      prompt: '5) نوع المثلث ABC:',
      options: ['قائم في B ومتساوي الساقين', 'قائم في A', 'متقايس الأضلاع', 'متساوي الساقين وليس قائما'],
      correct: 0, cols: 2,
      explain: '$BA^2 + BC^2 = 10 + 10 = 20 = AC^2$ : قائم في B ، و $BA = BC$ : متساوي الساقين (و B على الدائرة التي قطرها [AC]).',
    },
  },

  // تمرين 19 — A(1 ; 0), B(−1/2 ; √3/2), C(−1/2 ; −√3/2) : متقايس الأضلاع, O مركز الدائرة المحيطة
  {
    id: 'ex-19-1', source: S(19, '1'), learningPointId: LP.P1, difficulty: 'difficile', figure: 'ex19',
    statement: 'المستوي مزود بمعلم متعامد ومتجانس، مبدؤه النقطة O. نعتبر النقط $A(1\\,;\\,0)$ ، $B\\left(-\\dfrac{1}{2}\\,;\\,\\dfrac{\\sqrt{3}}{2}\\right)$ ، $C\\left(-\\dfrac{1}{2}\\,;\\,-\\dfrac{\\sqrt{3}}{2}\\right)$ . 1) أثبت أن المثلث ABC متقايس الأضلاع. 2) تحقّق أن مبدأ المعلم هو مركز الدائرة المحيطة بالمثلث ABC.',
    interaction: 'choice',
    question: {
      prompt: '1) المثلث ABC متقايس الأضلاع لأن:',
      options: [
        '$AB^2 = BC^2 = AC^2 = 3$',
        '$AB = BC = AC = 3$',
        '$AB^2 = BC^2 = 3$ و $AC^2 = 1$',
        'زواياه تبدو متساوية على الشكل',
      ],
      correct: 0, cols: 1,
      explain: '$AB^2 = \\left(-\\dfrac{3}{2}\\right)^2 + \\left(\\dfrac{\\sqrt{3}}{2}\\right)^2 = \\dfrac{9}{4} + \\dfrac{3}{4} = 3$ ، $BC^2 = 0^2 + (\\sqrt{3})^2 = 3$ ، $AC^2 = 3$ : الأطوال الثلاثة $\\sqrt{3}$ (لا 3: هذه مربعاتها).',
    },
    commonError: 'نسيان الجذر: المربعات تساوي 3 والأطوال تساوي $\\sqrt{3}$ .',
  },
  {
    id: 'ex-19-2', source: S(19, '2'), learningPointId: LP.P3, difficulty: 'moyen', figure: 'ex19done',
    interaction: 'choice',
    question: {
      prompt: '2) مبدأ المعلم O هو مركز الدائرة المحيطة بالمثلث ABC لأن:',
      options: ['$OA = OB = OC = 1$', 'O منتصف [BC]', '$OA^2 + OB^2 = AB^2$', 'O على المستقيم (BC)'],
      correct: 0, cols: 2,
      explain: '$OA = 1$ و $OB^2 = \\dfrac{1}{4} + \\dfrac{3}{4} = 1$ و $OC^2 = 1$ : O على بعد واحد من الرؤوس الثلاثة. منتصف [BC] هو $\\left(-\\dfrac{1}{2}\\,;\\,0\\right)$ ، و $1 + 1 \\neq 3$ ، و O ليست على (BC) ( $x = -\\dfrac{1}{2}$ ).',
    },
  },

  // تمرين 21 (corrigé : trois points) — A(1 ; 2), B(4 ; 3), C(6 ; −3) : قائم في B
  {
    id: 'ex-21-2', source: S(21, '2'), learningPointId: LP.P1, difficulty: 'facile', figure: 'ex21', correction: 'ex21',
    statement: 'المستوي منسوب إلى معلم متعامد ومتجانس مبدؤه O. (الوحدة 1cm). A، B، C ثلاث نقط حيث $A(1\\,;\\,2)$ ، $B(4\\,;\\,3)$ ، $C(6\\,;\\,-3)$ . 1) علّم النقط A، B، C. 2) عيّن مركبتي كل شعاع من الأشعة $\\overrightarrow{AB}$ ، $\\overrightarrow{BC}$ و $\\overrightarrow{AC}$ . 3) احسب الأطوال AB، BC، AC. 4) ما نوع المثلث ABC.',
    interaction: 'batch',
    question: {
      prompt: '2) مركبتا كل شعاع (النقط معلَّمة على الشكل):',
      rows: [
        { label: '$\\overrightarrow{AB}$', options: ['$\\begin{pmatrix} 3 \\\\ 1 \\end{pmatrix}$', '$\\begin{pmatrix} -3 \\\\ -1 \\end{pmatrix}$', '$\\begin{pmatrix} 4 \\\\ 3 \\end{pmatrix}$'], correct: 0,
          correction: '$x_B - x_A = 4 - 1 = 3$ و $y_B - y_A = 3 - 2 = 1$ (النهاية ناقص المبدأ؛ $\\begin{pmatrix} 4 \\\\ 3 \\end{pmatrix}$ إحداثيتا B).' },
        { label: '$\\overrightarrow{BC}$', options: ['$\\begin{pmatrix} 2 \\\\ -6 \\end{pmatrix}$', '$\\begin{pmatrix} -2 \\\\ 6 \\end{pmatrix}$', '$\\begin{pmatrix} 2 \\\\ 6 \\end{pmatrix}$'], correct: 0,
          correction: '$6 - 4 = 2$ و $-3 - 3 = -6$ .' },
        { label: '$\\overrightarrow{AC}$', options: ['$\\begin{pmatrix} 5 \\\\ -5 \\end{pmatrix}$', '$\\begin{pmatrix} 5 \\\\ -1 \\end{pmatrix}$', '$\\begin{pmatrix} 7 \\\\ -1 \\end{pmatrix}$'], correct: 0,
          correction: '$6 - 1 = 5$ و $-3 - 2 = -5$ (و $\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$ : $3 + 2 = 5$ ، $1 - 6 = -5$ ).' },
      ],
    },
    commonError: 'الطرح المقلوب: المبدأ ناقص النهاية يعطي الشعاع المعاكس.',
  },
  {
    id: 'ex-21-3', source: S(21, '3'), learningPointId: LP.P1, difficulty: 'moyen',
    interaction: 'batch',
    question: {
      prompt: '3) الأطوال:',
      rows: [
        { label: 'AB =', options: ['$\\sqrt{10}$', '$4$', '$10$'], correct: 0, correction: '$\\sqrt{3^2 + 1^2} = \\sqrt{10}$ .' },
        { label: 'BC =', options: ['$2\\sqrt{10}$', '$8$', '$40$'], correct: 0, correction: '$\\sqrt{2^2 + (-6)^2} = \\sqrt{40} = 2\\sqrt{10}$ ( $8 = 2 + 6$ جمع للمركبتين، و $40$ هو $BC^2$ لا BC).' },
        { label: 'AC =', options: ['$5\\sqrt{2}$', '$10$', '$\\sqrt{10}$'], correct: 0, correction: '$\\sqrt{5^2 + (-5)^2} = \\sqrt{50} = 5\\sqrt{2}$ .' },
      ],
    },
    commonError: 'جمع المركبتين بدل تربيعهما: $|x| + |y|$ ليس الطول.',
  },
  {
    id: 'ex-21-4', source: S(21, '4'), learningPointId: LP.P1, difficulty: 'moyen',
    interaction: 'choice',
    question: {
      prompt: '4) نوع المثلث ABC:',
      options: ['قائم في B وليس متساوي الساقين', 'قائم ومتساوي الساقين في B', 'قائم في A', 'متساوي الساقين رأسه B'],
      correct: 0, cols: 1,
      explain: '$AB^2 + BC^2 = 10 + 40 = 50 = AC^2$ : قائم في B ؛ و $BC = 2\\sqrt{10} = 2AB$ فليس متساوي الساقين.',
    },
  },

  // تمرين 24 — A(1 ; 2), B(3 ; 4), C(5 ; 2), D(3 ; 0) : مستطيل، AB = BC، مربّع، (BD) ⊥ (AC)
  {
    id: 'ex-24-2', source: S(24, '2'), learningPointId: LP.P2, difficulty: 'moyen', figure: 'ex24',
    statement: 'المستوي مزود بمعلم متعامد ومتجانس $(O\\,;\\,\\vec{i},\\,\\vec{j})$ . 1) علّم النقط: $A(1\\,;\\,2)$ ، $B(3\\,;\\,4)$ ، $C(5\\,;\\,2)$ ، $D(3\\,;\\,0)$ . 2) بيّن أنّ للقطعتين [AC] و [BD] نفس الطول ونفس المنتصف ثم استنتج نوع الرباعي ABCD. 3) احسب مركبتي كل من الشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{BC}$ ثم احسب الطولين AC و BD. 4) استنتج أنّ (BD) ⊥ (AC).',
    interaction: 'choice',
    question: {
      prompt: '2) منتصف [AC] ومنتصف [BD] هو $(3\\,;\\,2)$ ، و $AC = BD = 4$ . نستنتج أن ABCD:',
      options: ['مستطيل', 'مربّع لأن قطريه متقايسان', 'معيّن', 'متوازي أضلاع لا يمكن أن يكون مستطيلا'],
      correct: 0, cols: 2,
      explain: 'قطران متناصفان: متوازي أضلاع؛ وقطراه متقايسان: مستطيل. ليقال «مربّع» يلزم دليل آخر (ضلعان متتاليان متقايسان) — السؤال 3.',
    },
    commonError: 'استنتاج «مربّع» من قطرين متقايسين ومتناصفين وحدهما.',
  },
  {
    id: 'ex-24-3', source: S(24, '3'), learningPointId: LP.P2, difficulty: 'moyen', correction: 'ex24',
    interaction: 'batch',
    question: {
      prompt: '3) المركبتان ثم الطولان AB و BC :',
      rows: [
        { label: '$\\overrightarrow{AB}$', options: ['$\\begin{pmatrix} 2 \\\\ 2 \\end{pmatrix}$', '$\\begin{pmatrix} -2 \\\\ -2 \\end{pmatrix}$', '$\\begin{pmatrix} 3 \\\\ 4 \\end{pmatrix}$'], correct: 0, correction: '$3 - 1 = 2$ و $4 - 2 = 2$ .' },
        { label: '$\\overrightarrow{BC}$', options: ['$\\begin{pmatrix} 2 \\\\ -2 \\end{pmatrix}$', '$\\begin{pmatrix} -2 \\\\ 2 \\end{pmatrix}$', '$\\begin{pmatrix} 2 \\\\ 2 \\end{pmatrix}$'], correct: 0, correction: '$5 - 3 = 2$ و $2 - 4 = -2$ .' },
        { label: 'AB و BC', options: ['$AB = BC = 2\\sqrt{2}$', '$AB = BC = 4$', '$AB = 2\\sqrt{2}$ و $BC = 0$'], correct: 0, correction: '$AB = \\sqrt{2^2 + 2^2} = \\sqrt{8} = 2\\sqrt{2}$ و $BC = \\sqrt{2^2 + (-2)^2} = 2\\sqrt{2}$ (و $AC = BD = 4$ من السؤال 2).' },
      ],
    },
  },
  {
    id: 'ex-24-4', source: S(24, '4'), learningPointId: LP.P2, difficulty: 'difficile',
    interaction: 'choice',
    question: {
      prompt: '4) $(BD) \\perp (AC)$ لأن:',
      options: [
        'المستطيل ABCD فيه ضلعان متتاليان متقايسان ( $AB = BC$ ): هو مربّع، وقطرا المربّع متعامدان',
        'قطري كل مستطيل متعامدان',
        '$AC = BD$',
        'للقطرين نفس المنتصف',
      ],
      correct: 0, cols: 1,
      explain: 'مستطيل (السؤال 2) ومعيّن ( $AB = BC$ ): مربّع، وقطرا المعيّن متعامدان. قطرا المستطيل غير المربّع ليسا متعامدين، والتقايس أو التناصف وحدهما لا يعطيان التعامد.',
    },
  },

  // تمرين 26 (corrigé : ACBD) — A(2 ; −2), B(−3 ; 3), C(−4 ; −3) : CA = CB, D(3 ; 4), معيّن، المساحة 35
  {
    id: 'ex-26-1', source: S(26, '1'), learningPointId: LP.P1, difficulty: 'moyen', figure: 'ex26', correction: 'ex26',
    statement: 'المستوي منسوب إلى معلم متعامد ومتجانس مبدؤه O. (الوحدة 1cm). نعتبر النقط $A(2\\,;\\,-2)$ ، $B(-3\\,;\\,3)$ ، $C(-4\\,;\\,-3)$ . 1) احسب القيم المضبوطة للأطوال AB ، BC ، AC. 2) ما نوع المثلث ABC؟ 3) احسب إحداثيتي النقطة D بحيث $\\overrightarrow{CA} = \\overrightarrow{BD}$ . 4) بيّن أن (AB) ⊥ (CD). 5) ماذا يُمثّل الجداء $\\dfrac{1}{2} \\times AB \\times CD$ بالنسبة للرباعي ACBD.',
    interaction: 'batch',
    question: {
      prompt: '1) القيم المضبوطة:',
      rows: [
        { label: 'AB =', options: ['$5\\sqrt{2}$', '$10$', '$50$'], correct: 0, correction: '$\\sqrt{(-5)^2 + 5^2} = \\sqrt{50} = 5\\sqrt{2}$ .' },
        { label: 'BC =', options: ['$\\sqrt{37}$', '$7$', '$37$'], correct: 0, correction: '$\\sqrt{(-1)^2 + (-6)^2} = \\sqrt{37}$ ( $7 = 1 + 6$ ).' },
        { label: 'AC =', options: ['$\\sqrt{37}$', '$\\sqrt{35}$', '$7$'], correct: 0, correction: '$\\sqrt{(-6)^2 + (-1)^2} = \\sqrt{37}$ ( $\\sqrt{35}$ يطرح المربعين: $36 - 1$ ).' },
      ],
    },
  },
  {
    id: 'ex-26-2', source: S(26, '2'), learningPointId: LP.P1, difficulty: 'moyen',
    interaction: 'choice',
    question: {
      prompt: '2) نوع المثلث ABC:',
      options: ['متساوي الساقين رأسه C وليس قائما', 'قائم في C', 'قائم ومتساوي الساقين', 'متقايس الأضلاع'],
      correct: 0, cols: 1,
      explain: '$CA = CB = \\sqrt{37}$ : متساوي الساقين رأسه C ؛ و $37 + 37 = 74 \\neq 50$ فليس قائما في C (ولا في A أو B: $50 + 37 \\neq 37$ ).',
    },
    commonError: 'الحكم بأنه قائم لأنه يبدو كذلك: نتحقق بالمربعات.',
  },
  {
    id: 'ex-26-3', source: S(26, '3'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'pair',
    question: {
      prompt: '3) إحداثيتا D حيث $\\overrightarrow{CA} = \\overrightarrow{BD}$ :',
      expected: { x: '3', y: '4' },
      explain: '$\\overrightarrow{CA}\\begin{pmatrix} 6 \\\\ 1 \\end{pmatrix}$ ، فـ $x_D - (-3) = 6$ و $y_D - 3 = 1$ : $D(3\\,;\\,4)$ .',
    },
    commonError: 'الطرح المقلوب: $\\overrightarrow{CA}$ هو $A - C$ لا $C - A$ .',
  },
  {
    id: 'ex-26-4', source: S(26, '4'), learningPointId: LP.P2, difficulty: 'difficile', figure: 'ex26done',
    interaction: 'choice',
    question: {
      prompt: '4) $(AB) \\perp (CD)$ لأن:',
      options: [
        '$\\overrightarrow{CA} = \\overrightarrow{BD}$ : CADB متوازي أضلاع، و $CA = CB$ ، فهو معيّن، وقطراه [AB] و [CD] متعامدان',
        'ABCD مستطيل',
        '$CA = BD$ وحدها',
        'المثلث ABC قائم في C',
      ],
      correct: 0, cols: 1,
      explain: 'متوازي الأضلاع CADB (أي ACBD) فيه ضلعان متتاليان متقايسان $CA = CB$ : معيّن، وقطرا المعيّن متعامدان.',
    },
  },
  {
    id: 'ex-26-5', source: S(26, '5'), learningPointId: LP.P2, difficulty: 'difficile',
    interaction: 'choice',
    question: {
      prompt: '5) الجداء $\\dfrac{1}{2} \\times AB \\times CD$ :',
      options: ['مساحة المعيّن ACBD ، وتساوي $35\\,\\mathrm{cm^2}$', 'محيط المعيّن ACBD', 'مساحة المعيّن ACBD ، وتساوي $70\\,\\mathrm{cm^2}$', 'طول القطر الثالث'],
      correct: 0, cols: 1,
      explain: 'مساحة المعيّن نصف جداء قطريه: $CD = \\sqrt{7^2 + 7^2} = 7\\sqrt{2}$ ، و $\\dfrac{1}{2} \\times 5\\sqrt{2} \\times 7\\sqrt{2} = \\dfrac{1}{2} \\times 70 = 35$ .',
    },
  },

  // تمرين 27 — A(−3 ; 1), B(1 ; 4), C(4 ; 0) : قائم ومتساوي الساقين في B, D(0 ; −3), مربّع
  {
    id: 'ex-27-1', source: S(27, '1'), learningPointId: LP.P1, difficulty: 'moyen', figure: 'ex27',
    statement: 'المستوي منسوب إلى معلم متعامد ومتجانس مبدؤه O. (الوحدة 1cm). نعتبر النقط $A(-3\\,;\\,1)$ ، $B(1\\,;\\,4)$ ، $C(4\\,;\\,0)$ . 1) علّم النقط A، B، C. ما نوع المثلث ABC؟ 2) D هي صورة النقطة A بالانسحاب الذي شعاعه $\\overrightarrow{BC}$ . أ) علّم النقطة D، احسب إحداثيتي النقطة D. ب) أثبت أنّ الرباعي ABCD مربع.',
    interaction: 'choice',
    question: {
      prompt: '1) نوع المثلث ABC:',
      options: ['قائم في B ومتساوي الساقين', 'قائم في A', 'متقايس الأضلاع', 'متساوي الساقين وليس قائما'],
      correct: 0, cols: 2,
      explain: '$AB^2 = 16 + 9 = 25$ ، $BC^2 = 9 + 16 = 25$ ، $AC^2 = 49 + 1 = 50 = 25 + 25$ : قائم في B ومتساوي الساقين ( $AB = BC = 5$ ).',
    },
  },
  {
    id: 'ex-27-2a', source: S(27, '2أ'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'pair',
    question: {
      prompt: '2) أ) إحداثيتا D صورة A بالانسحاب الذي شعاعه $\\overrightarrow{BC}$ :',
      expected: { x: '0', y: '-3' },
      explain: '$\\overrightarrow{BC}\\begin{pmatrix} 3 \\\\ -4 \\end{pmatrix}$ و $\\overrightarrow{AD} = \\overrightarrow{BC}$ : $D(-3 + 3\\,;\\,1 - 4) = (0\\,;\\,-3)$ .',
    },
  },
  {
    id: 'ex-27-2b', source: S(27, '2ب'), learningPointId: LP.P2, difficulty: 'difficile', figure: 'ex27done',
    interaction: 'choice',
    question: {
      prompt: '2) ب) الرباعي ABCD مربّع لأن:',
      options: [
        '$\\overrightarrow{AD} = \\overrightarrow{BC}$ (متوازي أضلاع) فيه زاوية قائمة في B وضلعان متتاليان متقايسان',
        '$\\overrightarrow{AD} = \\overrightarrow{BC}$ وحدها',
        'المثلث ABC قائم في B وحده',
        'أضلاعه تبدو متساوية على الشكل',
      ],
      correct: 0, cols: 1,
      explain: 'ABCD متوازي أضلاع (من A إلى D كما من B إلى C)، زاويته في B قائمة: مستطيل؛ و $AB = BC$ : معيّن؛ إذن مربّع.',
    },
    commonError: 'الاكتفاء بمتوازي الأضلاع: المربّع يحتاج زاوية قائمة (أو قطرين متقايسين) وضلعين متتاليين متقايسين.',
  },
];

/** Les parties d'un exercice (ex-13 → ex-13-1, ex-13-2…). */
export const partsOf = (n) => EXERCISES.filter((e) => e.id.startsWith(`ex-${n}-`));
