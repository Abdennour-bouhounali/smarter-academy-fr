/**
 * Les exercices du MANUEL rattachés au درس « إحداثيتا منتصف قطعة مستقيم والمسافة بين نقطتين في معلم »
 * (extraction.json → destinations : ex-10, 11, 15, 16, 17, 20 « إحداثيتا منتصف قطعة - المسافة بين نقطتين », p. 147).
 * Énoncés au mot près ; un exercice à plusieurs parties est découpé en une entrée par partie (la première porte
 * l'énoncé). Une ثنائية se répond par `interaction: 'pair'` (PairQuestion, évaluateur `point` : fractions et virgules
 * acceptées, un seul nombre juste = réponse partielle). Une longueur exacte avec racine est un CHOIX dont les
 * distracteurs sont les erreurs du درس (somme des écarts, carré oublié, racine oubliée) — tous faux (figures.test.js).
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_muntasaf-masafa_P1',
  P2: '4am_muntasaf-masafa_P2',
};

const SEC = 'إحداثيتا منتصف قطعة - المسافة بين نقطتين';
const E = (n, part) => ({ ...src(`ex-${n}`, 147, SEC, n), ...(part ? { part } : {}) });

export const EXERCISES = [
  // تمرين 10 — I milieu de [AB] ; J tel que JB = OJ (J milieu de [OB])
  {
    id: 'ex-10-a', source: E(10, '1'), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'المستوي مزوّد بمعلم مبدؤه O. (الوحدة $1\\,\\mathrm{cm}$). A و B نقطتان من المستوي بحيث $A(-5\\,;\\,2)$ و $B(-6\\,;\\,-3)$ . 1) أوجد إحداثيتي النقطة I منتصف القطعة [AB]. 2) أوجد إحداثيتي النقطة J بحيث $\\overrightarrow{JB} = \\overrightarrow{OJ}$ .',
    interaction: 'pair',
    question: {
      prompt: '1) إحداثيتا I منتصف [AB]:',
      expected: { x: '-11/2', y: '-1/2' },
      explain: '$x_I = \\dfrac{-5 + (-6)}{2} = -\\dfrac{11}{2}$ و $y_I = \\dfrac{2 + (-3)}{2} = -\\dfrac{1}{2}$ : $I\\left(-\\dfrac{11}{2}\\,;\\,-\\dfrac{1}{2}\\right)$ .',
    },
    commonError: 'حساب $\\dfrac{x_B - x_A}{2}$ : نصف الفرق نصفُ مركبة الشعاع $\\overrightarrow{AB}$ ، لا فاصلة المنتصف.',
  },
  {
    id: 'ex-10-b', source: E(10, '2'), learningPointId: LP.P1, difficulty: 'moyen',
    interaction: 'pair',
    question: {
      prompt: '2) $\\overrightarrow{JB} = \\overrightarrow{OJ}$ يعني أن J منتصف [OB]. إحداثيتا J:',
      expected: { x: '-3', y: '-3/2' },
      explain: '$\\overrightarrow{OJ} = \\overrightarrow{JB}$ : J منتصف [OB]، فـ $x_J = \\dfrac{0 + (-6)}{2} = -3$ و $y_J = \\dfrac{0 + (-3)}{2} = -\\dfrac{3}{2}$ .',
    },
    commonError: 'أخذ J منتصف [AB] (هي I): الشعاعان المعطيان يمرّان بالمبدأ O والنقطة B.',
  },
  // تمرين 11 — le centre K d'un cercle de diamètre [AB]
  {
    id: 'ex-11', source: E(11), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'نعتبر النقطتين $A(5\\,;\\,9)$ ، $B(1\\,;\\,-3)$ . [AB] قطر للدائرة (𝒞). احسب إحداثيتي النقطة K مركز الدائرة (𝒞).',
    interaction: 'pair',
    question: {
      prompt: 'مركز الدائرة هو منتصف قطرها [AB]. إحداثيتا K:',
      expected: { x: '3', y: '3' },
      explain: '$x_K = \\dfrac{5 + 1}{2} = 3$ و $y_K = \\dfrac{9 + (-3)}{2} = 3$ : $K(3\\,;\\,3)$ .',
    },
    commonError: 'نسيان القسمة على 2: $(6\\,;\\,6)$ مجموع الإحداثيات لا المنتصف.',
  },
  // تمرين 15 — trois distances exactes
  {
    id: 'ex-15', source: E(15), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'تُعطى النقاط $K(0\\,;\\,2)$ ، $L(3\\,;\\,4)$ ، $M(1\\,;\\,2)$ . احسب القيمة المضبوطة لكل من: KL، KM، ML.',
    interaction: 'batch',
    question: {
      prompt: 'اختر القيمة المضبوطة لكل طول:',
      rows: [
        // 5 = 3 + 2 (les écarts additionnés) ; 13 = KL² (la racine oubliée)
        { label: 'KL', options: ['$\\sqrt{13}$', '$5$', '$13$'], correct: 0, correction: '$KL = \\sqrt{(3 - 0)^2 + (4 - 2)^2} = \\sqrt{9 + 4} = \\sqrt{13}$ .' },
        // 0 = l'écart vertical seul ; √2 = deux écarts de 1 imaginés
        { label: 'KM', options: ['$1$', '$0$', '$\\sqrt{2}$'], correct: 0, correction: '$KM = \\sqrt{(1 - 0)^2 + (2 - 2)^2} = \\sqrt{1} = 1$ : K و M على نفس الأفقي.' },
        // 4 = 2 + 2 (les écarts additionnés) ; 8 = ML² (la racine oubliée)
        { label: 'ML', options: ['$2\\sqrt{2}$', '$4$', '$8$'], correct: 0, correction: '$ML = \\sqrt{(3 - 1)^2 + (4 - 2)^2} = \\sqrt{8} = 2\\sqrt{2}$ .' },
      ],
      explain: 'القيمة المضبوطة تُكتب بجذر مبسّط، لا بقيمة مقرّبة.',
    },
    commonError: 'جمع الفرقين ($3 + 2 = 5$) بدل جذر مجموع مربعيهما.',
  },
  // تمرين 16 — A et B sur le cercle de centre O de rayon √2 ?
  {
    id: 'ex-16', source: E(16), learningPointId: LP.P2, difficulty: 'moyen',
    statement: '(𝒞) الدائرة التي مركزها O مبدأ المعلم ونصف قطرها $\\sqrt{2}$ . 1) هل النقطة $A(\\sqrt{2}\\,;\\,0)$ تنتمي إلى (𝒞)؟ 2) هل النقطة $B(\\sqrt{2}\\,;\\,\\sqrt{2})$ تنتمي إلى (𝒞)؟',
    interaction: 'trueFalse',
    question: {
      rows: [
        { text: 'A تنتمي إلى (𝒞).', answer: true, why: '$OA = \\sqrt{(\\sqrt{2})^2 + 0^2} = \\sqrt{2}$ : يساوي نصف القطر.' },
        { text: 'B تنتمي إلى (𝒞).', answer: false, why: '$OB = \\sqrt{(\\sqrt{2})^2 + (\\sqrt{2})^2} = \\sqrt{4} = 2 \\neq \\sqrt{2}$ .' },
      ],
      explain: 'تنتمي M إلى الدائرة إذا كان بعدها عن المركز يساوي نصف القطر (نقارن $OM^2$ بـ $r^2 = 2$).',
    },
    commonError: 'قراءة $\\sqrt{2} + \\sqrt{2}$ في المسافة OB: نربّع كل إحداثية ثم نجمع ثم نأخذ الجذر.',
  },
  // تمرين 17 — le rayon PM
  {
    id: 'ex-17', source: E(17), learningPointId: LP.P2, difficulty: 'facile',
    statement: 'احسب نصف قطر الدائرة (𝒞) التي مركزها النقطة $P(2\\,;\\,1)$ وتشمل النقطة $M(-1\\,;\\,1)$ .',
    interaction: 'numeric',
    question: {
      prompt: 'نصف القطر PM يساوي:',
      expected: 3,
      explain: '$PM = \\sqrt{(-1 - 2)^2 + (1 - 1)^2} = \\sqrt{9} = 3$ .',
    },
    commonError: 'كتابة $PM = -3$ : المسافة موجبة دائما، والجذر يزيل الإشارة.',
  },
  // تمرين 20 — symétriques, image par translation, K milieu de [MN]
  {
    id: 'ex-20-a', source: E(20, '3'), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'في معلم متعامد ومتجانس لمستوٍ، (الوحدة $1\\,\\mathrm{cm}$). تُعطى النقط $A(2\\,;\\,1)$ ، $B(3\\,;\\,-1)$ ، $C(-1\\,;\\,1)$ . 1) علّم النقط A، B، C. 2) M نظيرة C بالنسبة إلى النقطة A، N نظيرة C بالنسبة إلى النقطة B و K صورة النقطة B بالانسحاب الذي شعاعه $\\overrightarrow{CA}$ . 3) احسب إحداثيتي كل من النقط M، N و K ثم علّمها وتأكّد من الحسابات التي قُمت بها سابقا. 4) بيّن أنّ النقطة K هي منتصف [MN] بطريقتين مختلفتين (مرة باستعمال الإحداثيات ومرة باستعمال خواص هندسية).',
    interaction: 'pair',
    question: {
      prompt: '3) M نظيرة C بالنسبة إلى A يعني A منتصف [CM]. إحداثيتا M:',
      expected: { x: '5', y: '1' },
      explain: '$\\dfrac{-1 + x_M}{2} = 2$ و $\\dfrac{1 + y_M}{2} = 1$ إذن $M(5\\,;\\,1)$ .',
    },
    commonError: 'أخذ M منتصف [CA]: النظيرة أبعد من A بنفس المسافة، و A هي المنتصف.',
  },
  {
    id: 'ex-20-b', source: E(20, '3'), learningPointId: LP.P1, difficulty: 'moyen',
    interaction: 'pair',
    question: {
      prompt: '3) N نظيرة C بالنسبة إلى B. إحداثيتا N:',
      expected: { x: '7', y: '-3' },
      explain: 'B منتصف [CN]: $x_N = 2 \\times 3 - (-1) = 7$ و $y_N = 2 \\times (-1) - 1 = -3$ : $N(7\\,;\\,-3)$ .',
    },
  },
  {
    id: 'ex-20-c', source: E(20, '3'), learningPointId: LP.P1, difficulty: 'moyen',
    interaction: 'pair',
    question: {
      prompt: '3) K صورة B بالانسحاب الذي شعاعه $\\overrightarrow{CA}$ . إحداثيتا K:',
      expected: { x: '6', y: '-1' },
      explain: '$\\overrightarrow{CA}\\begin{pmatrix} 3 \\\\ 0 \\end{pmatrix}$ و $\\overrightarrow{BK} = \\overrightarrow{CA}$ إذن $K(3 + 3\\,;\\,-1 + 0) = (6\\,;\\,-1)$ .',
    },
  },
  {
    id: 'ex-20-d', source: E(20, '4'), learningPointId: LP.P1, difficulty: 'difficile',
    interaction: 'batch',
    question: {
      prompt: '4) K منتصف [MN] — بطريقتين:',
      rows: [
        // (1 ; −2) = la demi-différence (MUNTASAF-TARH), (12 ; −2) = la somme sans ÷ 2 (MUNTASAF-NISF)
        { label: 'بالإحداثيات', options: ['منتصف [MN] هو $\\left(\\dfrac{5 + 7}{2}\\,;\\,\\dfrac{1 + (-3)}{2}\\right) = (6\\,;\\,-1)$ ، أي K', 'منتصف [MN] هو $\\left(\\dfrac{7 - 5}{2}\\,;\\,\\dfrac{-3 - 1}{2}\\right) = (1\\,;\\,-2)$ ، فليس K', 'منتصف [MN] هو $(5 + 7\\,;\\,1 + (-3)) = (12\\,;\\,-2)$ ، فليس K'], correct: 0, correction: 'نجمع ثم نقسم على 2: $(6\\,;\\,-1)$ هي إحداثيتا K.' },
        { label: 'بخواص هندسية', options: ['A منتصف [CM] و B منتصف [CN]، و $\\overrightarrow{BK} = \\overrightarrow{CA} = \\overrightarrow{AM}$ : ABKM متوازي أضلاع، فـ $\\overrightarrow{MK} = \\overrightarrow{AB}$ ، و $\\overrightarrow{AB} = \\overrightarrow{KN}$ (مستقيم المنتصفين)، إذن $\\overrightarrow{MK} = \\overrightarrow{KN}$', 'لأن $MK = 1$ و $KN = 1$ على الرسم', 'لأن $\\overrightarrow{MK} = \\overrightarrow{NK}$'], correct: 0, correction: 'في المثلث CMN: (AB) يوازي (MN) و $AB = \\dfrac{MN}{2}$ ، ومع $\\overrightarrow{MK} = \\overrightarrow{AB}$ نحصل على $\\overrightarrow{MK} = \\overrightarrow{KN}$ .' },
      ],
      explain: 'الإحداثيات تكفي لإثبات أن نقطة منتصف قطعة؛ والخواص الهندسية تقدّم برهانا آخر.',
    },
    commonError: 'الاكتفاء بقراءة الرسم: القياس لا يُثبت، يلزم حساب أو خاصية.',
  },
];

/** Les figures dessinées APRÈS les réponses (la correction de l'exercice 20). */
export const partsOf = (n) => EXERCISES.filter((ex) => ex.id === `ex-${n}` || ex.id.startsWith(`ex-${n}-`));
export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
