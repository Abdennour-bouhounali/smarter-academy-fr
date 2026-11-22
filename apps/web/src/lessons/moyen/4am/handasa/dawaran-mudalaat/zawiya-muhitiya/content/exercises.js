/**
 * Les exercices du MANUEL rattachés au درس « الزاوية المحيطية والزاوية المركزية والعلاقة بينهما » (extraction.json →
 * destinations : ex-10, 11, 12 « الزوايا المحيطية و الزوايا المركزية », p. 159 ; ex-16 أتعمّق, p. 161 ; ex-20 question 1,
 * doublon déclaré de la synthèse, p. 161). Énoncés au mot près ; un exercice à plusieurs parties est découpé en une entrée par
 * partie (la première porte l'énoncé). Les figures sont des DONNÉES GeoFigure (content/figures.js) que le module dessine.
 * Tous les distracteurs sont faux (calculés ; la confusion qu'ils portent est dite en commentaire).
 *
 * Ce que l'extraction signale (discrepancies) et que la leçon HONORE :
 *   ex-10  D n'est pas fixé par le texte : la plateforme écrit la donnée de la figure, $\widehat{BOD} = 45^\circ$ (→ 22,5° et 97,5°) ;
 *   ex-11  les données ne sont que sur la figure ([AC] diamètre, 80°, le codage) : elles sont écrites ;
 *   ex-12  « هل الزاوية محيطية؟ » sans nom : complété par $\widehat{AMD}$ (une ligne « صحّحت المنصّة ») ; M nommé ;
 *   ex-16  D n'est pas fixé par les données : la plateforme fixe $\widehat{DOB} = 40^\circ$ (→ 60° et 50°).
 */
import { src, addition } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_zawiya-muhitiya_P1',
  P2: '4am_zawiya-muhitiya_P2',
  P3: '4am_zawiya-muhitiya_P3',
};

const SEC = 'الزوايا المحيطية و الزوايا المركزية';
const E = (n, part) => ({ ...src(`ex-${n}`, n <= 12 ? 159 : 161, n <= 12 ? SEC : 'أتعمّق', n), ...(part ? { part } : {}) });
const D = (s) => `$${s}^\\circ$`;
export const DATUM_SOURCE = addition('interaction_generation');

export const EXERCISES = [
  // تمرين 10 — ABC متقايس الأضلاع في دائرة مركزها O، [DE] قطر
  {
    id: 'ex-10-a', source: E(10, '1'), learningPointId: LP.P2, difficulty: 'facile', figure: 'ex10', datum: 'ex10',
    statement: 'ABC مثلث متقايس الأضلاع و O هي مركز الدّائرة المحيطة به. D و E نقطتان من هذه الدّائرة متناظرتان بالنسبة إلى O. عيّن أقياس الزوايا : $\\widehat{BOC}$ ، $\\widehat{BDC}$ ، $\\widehat{DAB}$ و $\\widehat{DBC}$ .',
    interaction: 'batch',
    question: {
      prompt: 'المثلث متقايس الأضلاع: $\\widehat{BAC} = 60^\\circ$ .',
      rows: [
        // 30° : la moitié au lieu du double ; 60° : l'angle inscrit recopié
        { label: '$\\widehat{BOC}$', options: [D(120), D(30), D(60)], correct: 0, correction: '$\\widehat{BOC}$ زاوية مركزية تحصر القوس BC مع الزاوية المحيطية $\\widehat{BAC}$ : $\\widehat{BOC} = 2 \\times 60^\\circ = 120^\\circ$ .' },
        // 120° : l'angle au centre ; 30° : la moitié de l'angle inscrit
        { label: '$\\widehat{BDC}$', options: [D(60), D(120), D(30)], correct: 0, correction: '$\\widehat{BDC}$ و $\\widehat{BAC}$ زاويتان محيطيتان تحصران القوس BC: $\\widehat{BDC} = \\widehat{BAC} = 60^\\circ$ .' },
      ],
      explain: 'زاوية المثلث المتقايس الأضلاع $60^\\circ$ ، ثم الخاصيتان: المحيطية نصف المركزية، والمحيطيتان اللتان تحصران نفس القوس متقايستان.',
    },
    commonError: 'كتابة $\\widehat{BOC} = 30^\\circ$ : الزاوية المركزية ضعف المحيطية، لا نصفها.',
  },
  {
    id: 'ex-10-b', source: E(10, '2'), learningPointId: LP.P2, difficulty: 'moyen', figure: 'ex10', datum: 'ex10',
    interaction: 'batch',
    question: {
      prompt: 'مع $\\widehat{BOD} = 45^\\circ$ (الشكل):',
      rows: [
        // 45° : l'angle au centre recopié ; 90° : le double
        { label: '$\\widehat{DAB}$', options: [D('22{,}5'), D(45), D(90)], correct: 0, correction: '$\\widehat{DAB}$ محيطية تحصر القوس DB مع الزاوية المركزية $\\widehat{DOB}$ : $\\widehat{DAB} = \\dfrac{45^\\circ}{2} = 22{,}5^\\circ$ .' },
        // 37,5° : DBA seulement ; 60° : ABC seulement
        { label: '$\\widehat{DBC}$', options: [D('97{,}5'), D('37{,}5'), D(60)], correct: 0, correction: '$\\widehat{DBA} = \\dfrac{1}{2}\\widehat{DOA} = \\dfrac{75^\\circ}{2} = 37{,}5^\\circ$ ، ثم $\\widehat{DBC} = \\widehat{DBA} + \\widehat{ABC} = 37{,}5^\\circ + 60^\\circ = 97{,}5^\\circ$ .' },
      ],
      explain: 'كل زاوية محيطية نبحث لها عن الزاوية المركزية التي تحصر معها نفس القوس.',
    },
    commonError: 'الاكتفاء بـ $\\widehat{DBA}$ : الزاوية $\\widehat{DBC}$ ضلعاها [BD) و [BC)، وتحوي [BA).',
  },
  // تمرين 11 — O، B و D على استقامية
  {
    id: 'ex-11', source: E(11), learningPointId: LP.P2, difficulty: 'difficile', figure: 'ex11', datum: 'ex11',
    statement: 'لاحظ الشكل التالي: برهن أن النقط O، B و D على استقامية.',
    interaction: 'batch',
    question: {
      prompt: 'البرهان، خطوة بخطوة:',
      rows: [
        // 160° : le double au lieu de la moitié ; 80° : l'angle au centre recopié
        { label: '$\\widehat{BAC}$', options: [D(40), D(160), D(80)], correct: 0, correction: '$\\widehat{BAC}$ محيطية و $\\widehat{BOC}$ مركزية تحصران القوس BC: $\\widehat{BAC} = \\dfrac{80^\\circ}{2} = 40^\\circ$ .' },
        // 40° : l'inscrit recopié ; 20° : la moitié
        { label: '$\\widehat{AOD}$', options: [D(80), D(40), D(20)], correct: 0, correction: '$\\widehat{ACD} = \\widehat{BAC} = 40^\\circ$ (الترميز)، و $\\widehat{ACD}$ محيطية تحصر القوس AD مع $\\widehat{AOD}$ : $\\widehat{AOD} = 80^\\circ$ .' },
        // 160° : 80 + 80 ; 100° : COD seul
        { label: '$\\widehat{BOD}$', options: ['$180^\\circ$ : O و B و D على استقامية', D(160), D(100)], correct: 0, correction: '[AC] قطر: $\\widehat{COD} = 180^\\circ - 80^\\circ = 100^\\circ$ ، و $\\widehat{BOD} = \\widehat{BOC} + \\widehat{COD} = 80^\\circ + 100^\\circ = 180^\\circ$ : زاوية مستقيمة.' },
      ],
      explain: 'زاوية $\\widehat{BOD}$ قيسها $180^\\circ$ يعني أن [OB) و [OD) نصفا مستقيم متعاكسان: O و B و D على استقامية.',
    },
    commonError: 'الاعتماد على الشكل وحده («تبدو على استقامية»): البرهان يمرّ بالأقياس $80^\\circ$ و $40^\\circ$ و $180^\\circ$ .',
  },
  // تمرين 12 — M داخل الدائرة
  {
    id: 'ex-12-a', source: E(12, '1'), learningPointId: LP.P1, difficulty: 'facile', figure: 'ex12', correction: 'ex12',
    statement: 'لاحظ الشكل أدناه : (P) دائرة مركزها O و [BD] قطر لها. (AB) و (CD) مستقيمان متقاطعان في M. 1) هل الزاوية $\\widehat{AMD}$ محيطية؟ 2) برهن أن $\\widehat{AMD} = \\widehat{CDB} + \\widehat{ABD}$ . 3) برهن أن $\\widehat{CMB} = \\dfrac{\\widehat{COB} + \\widehat{AOD}}{2}$ .',
    interaction: 'choice',
    question: {
      prompt: '1) هل الزاوية $\\widehat{AMD}$ محيطية؟',
      options: [
        'لا: رأسها M داخل الدائرة، لا عليها',
        'نعم: ضلعاها يقطعان الدائرة في A و D', // le sommet compte d'abord
        'نعم: لأن A و D نقطتان من الدائرة', // les extrémités ne suffisent pas
      ],
      correct: 0, cols: 1,
      explain: 'الزاوية المحيطية رأسها ينتمي إلى الدائرة؛ رأس $\\widehat{AMD}$ هو M داخل الدائرة.',
    },
    commonError: 'الاكتفاء بأن ضلعي الزاوية يقطعان الدائرة: الشرط الأول أن يكون رأسها على الدائرة.',
  },
  {
    id: 'ex-12-b', source: E(12, '2'), learningPointId: LP.P2, difficulty: 'moyen', figure: 'ex12',
    interaction: 'batch',
    question: {
      prompt: '2) في المثلث MBD:',
      rows: [
        // le supplément pris pour l'angle lui-même
        { label: 'A و M و B على استقامية، إذن', options: ['$\\widehat{AMD} = 180^\\circ - \\widehat{BMD}$', '$\\widehat{AMD} = \\widehat{BMD}$', '$\\widehat{AMD} = 90^\\circ$'], correct: 0, correction: 'الزاويتان $\\widehat{AMD}$ و $\\widehat{BMD}$ متجاورتان على المستقيم (AB): مجموعهما $180^\\circ$ .' },
        { label: 'ومجموع زوايا المثلث MBD يعطي', options: ['$\\widehat{AMD} = \\widehat{MBD} + \\widehat{MDB} = \\widehat{ABD} + \\widehat{CDB}$', '$\\widehat{AMD} = \\widehat{MBD} - \\widehat{MDB}$', '$\\widehat{AMD} = 2\\widehat{ABD}$'], correct: 0, correction: '$\\widehat{BMD} = 180^\\circ - \\widehat{MBD} - \\widehat{MDB}$ ، فـ $\\widehat{AMD} = \\widehat{MBD} + \\widehat{MDB}$ ؛ و $\\widehat{MBD} = \\widehat{ABD}$ و $\\widehat{MDB} = \\widehat{CDB}$ .' },
      ],
      explain: 'الزاوية الخارجية لمثلث تساوي مجموع الزاويتين الداخليتين غير المجاورتين لها.',
    },
  },
  {
    id: 'ex-12-c', source: E(12, '3'), learningPointId: LP.P2, difficulty: 'difficile', figure: 'ex12',
    interaction: 'batch',
    question: {
      prompt: '3) نحوّل كل زاوية محيطية إلى زاويتها المركزية:',
      rows: [
        // le double au lieu de la moitié
        { label: '$\\widehat{CDB}$', options: ['$\\dfrac{1}{2}\\widehat{COB}$', '$2\\widehat{COB}$', '$\\widehat{COB}$'], correct: 0, correction: '$\\widehat{CDB}$ محيطية و $\\widehat{COB}$ مركزية تحصران القوس CB.' },
        { label: '$\\widehat{ABD}$', options: ['$\\dfrac{1}{2}\\widehat{AOD}$', '$2\\widehat{AOD}$', '$\\widehat{AOB}$'], correct: 0, correction: '$\\widehat{ABD}$ محيطية و $\\widehat{AOD}$ مركزية تحصران القوس AD.' },
        { label: '$\\widehat{CMB}$', options: ['$\\widehat{AMD}$ (متقابلتان بالرأس) ومنه $\\dfrac{\\widehat{COB} + \\widehat{AOD}}{2}$', '$\\dfrac{1}{2}\\widehat{COB}$ لأنها محيطية', '$\\widehat{COB} + \\widehat{AOD}$'], correct: 0, correction: '$\\widehat{CMB} = \\widehat{AMD} = \\widehat{CDB} + \\widehat{ABD} = \\dfrac{\\widehat{COB} + \\widehat{AOD}}{2}$ ؛ في الشكل: $\\dfrac{60^\\circ + 60^\\circ}{2} = 60^\\circ$ .' },
      ],
      explain: 'زاوية رأسها داخل الدائرة ليست محيطية: قيسها نصف مجموع الزاويتين المركزيتين للقوسين اللذين يحصرهما ضلعاها وامتداداهما.',
    },
    commonError: 'معاملة $\\widehat{CMB}$ كزاوية محيطية (نصف $\\widehat{COB}$ فقط): رأسها M ليس على الدائرة.',
  },
  // تمرين 16 — أقياس زوايا المثلث AEC
  {
    id: 'ex-16-a', source: E(16, '1'), learningPointId: LP.P3, difficulty: 'moyen', figure: 'ex16', datum: 'ex16',
    statement: 'لاحظ الشكل التالي: عيّن أقياس زوايا المثلث AEC.',
    interaction: 'batch',
    question: {
      prompt: 'أبدأ بالمثلث EBC:',
      rows: [
        // 140° recopié ; 280° : le double
        { label: '$\\widehat{EBC}$', options: [D(70), D(140), D(280)], correct: 0, correction: '$\\widehat{EBC}$ محيطية تحصر القوس EC مع الزاوية المركزية $\\widehat{EOC} = 140^\\circ$ : $70^\\circ$ .' },
        // 80° : le double de BDC ; 20° : la moitié
        { label: '$\\widehat{BEC}$', options: [D(40), D(80), D(20)], correct: 0, correction: '$\\widehat{BEC}$ و $\\widehat{BDC}$ محيطيتان تحصران القوس BC: $\\widehat{BEC} = 40^\\circ$ .' },
        { label: '$\\widehat{ACE} = \\widehat{BCE}$', options: [D(70), D(40), D(110)], correct: 0, correction: 'في المثلث EBC: $180^\\circ - 70^\\circ - 40^\\circ = 70^\\circ$ ، و A على (CB) خلف B.' },
      ],
      explain: 'الزاويتان المحيطيتان اللتان تحصران نفس القوس متقايستان، والمحيطية نصف المركزية.',
    },
    commonError: 'أخذ $\\widehat{BEC} = 80^\\circ$ : الزاويتان $\\widehat{BEC}$ و $\\widehat{BDC}$ كلتاهما محيطيتان، فهما متقايستان.',
  },
  {
    id: 'ex-16-b', source: E(16, '2'), learningPointId: LP.P3, difficulty: 'difficile', figure: 'ex16', datum: 'ex16',
    interaction: 'batch',
    question: {
      prompt: 'مع $\\widehat{DOB} = 40^\\circ$ (الشكل):',
      rows: [
        // 40° : l'arc DB seul ; 120° : l'angle au centre DOC
        { label: '$\\widehat{AEC} = \\widehat{DEC}$', options: [D(60), D(40), D(120)], correct: 0, correction: '$\\widehat{DEC}$ محيطية تحصر القوس DC و $\\widehat{DOC} = \\widehat{DOB} + \\widehat{BOC} = 40^\\circ + 80^\\circ = 120^\\circ$ : $\\widehat{AEC} = 60^\\circ$ .' },
        { label: '$\\widehat{EAC}$', options: [D(50), D(70), D(60)], correct: 0, correction: 'في المثلث AEC: $180^\\circ - 70^\\circ - 60^\\circ = 50^\\circ$ .' },
      ],
      explain: '$\\widehat{BOC} = 2\\widehat{BDC} = 80^\\circ$ ، ثم مجموع أقياس زوايا المثلث AEC.',
    },
  },
  // تمرين 20 (BEM) — السؤال 1 فقط (doublon : la synthèse traite la question 2)
  {
    id: 'ex-20-a', source: E(20, '1'), learningPointId: LP.P2, difficulty: 'moyen', figure: 'ex20',
    statement: 'من امتحان شهادة التعليم المتوسط. (T) دائرة مركزها O وقطرها AB = 8cm، C نقطة من الدائرة حيث: BC = 3cm. 1) احسب بالتدوير إلى الوحدة من الدرجة قيس الزاوية $\\widehat{BAC}$ ثم استنتج قيس الزاوية $\\widehat{BOC}$ .',
    interaction: 'numeric',
    question: {
      prompt: 'المثلث ABC قائم في C ([AB] قطر): $\\sin\\widehat{BAC} = \\dfrac{3}{8}$ . قيس $\\widehat{BAC}$ مدوّرا إلى الوحدة (بالدرجة):',
      expected: 22,
      explain: '⁦ON 2nd sin⁻¹ ( 3 ÷ 8 ) =⁩ يعطي $22{,}02\\ldots$ ، إذن $\\widehat{BAC} \\approx 22^\\circ$ .',
    },
    commonError: 'استعمال $\\cos$ بدل $\\sin$ : [BC] هو الضلع المقابل للزاوية A و [AB] الوتر.',
  },
  {
    id: 'ex-20-b', source: E(20, '1'), learningPointId: LP.P2, difficulty: 'moyen', figure: 'ex20',
    interaction: 'numeric',
    question: {
      prompt: 'استنتج قيس $\\widehat{BOC}$ (بالدرجة، مدوّرا إلى الوحدة):',
      expected: 44,
      explain: '$\\widehat{BOC}$ مركزية و $\\widehat{BAC}$ محيطية تحصران القوس BC: $\\widehat{BOC} = 2\\widehat{BAC} \\approx 44^\\circ$ (والحساب الدقيق $44{,}05^\\circ$ يعطي أيضا $44^\\circ$).',
    },
    commonError: 'قسمة $22^\\circ$ على 2 : الزاوية المركزية ضعف المحيطية.',
  },
];

/** Les données que le manuel ne met que SUR la figure, écrites par la plateforme (extraction › discrepancies). */
export const DATUMS = {
  ex10: 'معطى من الشكل (المنصّة): $\\widehat{BOD} = 45^\\circ$ — النص لا يعيّن موضع D، والشكل يضعه هكذا.',
  ex11: 'معطيات الشكل (المنصّة): [AC] قطر، $\\widehat{BOC} = 80^\\circ$ ، والزاويتان $\\widehat{BAC}$ و $\\widehat{ACD}$ متقايستان (الترميز).',
  ex16: 'معطى من الشكل (المنصّة): $\\widehat{DOB} = 40^\\circ$ — المعطيات $140^\\circ$ و $40^\\circ$ لا تعيّن موضع D وحدها.',
};
/** La ligne « صحّحت المنصّة » (extraction › discrepancies, ex-12). */
export const CORRECTIONS = {
  ex12: 'صحّحت المنصّة خطأً مطبعيًا: الكتاب كتب «1) هل الزاوية محيطية؟» دون اسمها؛ المقصود $\\widehat{AMD}$ . والنقطة M (تقاطع الوترين) سمّتها المنصّة على الشكل.',
};

export const partsOf = (n) => EXERCISES.filter((ex) => ex.id === `ex-${n}` || ex.id.startsWith(`ex-${n}-`));
export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
