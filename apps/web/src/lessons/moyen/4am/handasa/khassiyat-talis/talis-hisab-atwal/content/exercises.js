/**
 * Les exercices du MANUEL rattachés au درس « خاصية طالس وحساب الأطوال » (extraction.json → destinations :
 * ex-1 … ex-6, ex-8, ex-9 p. 110 « أوظّف تعلّماتي — خاصية طالس », ex-26 p. 113 « أتعمّق »). Énoncés au mot près ;
 * un exercice à plusieurs parties est découpé en une entrée par partie (la première porte l'énoncé). Les figures
 * sont des DONNÉES GeoFigure (content/figures.js) que le module dessine (`figure`).
 * Tous les distracteurs sont faux (calculés ; la confusion qu'ils portent est dite en commentaire).
 */
import { src } from '../../_unit/unitMeta.js';
import { withContext } from '../../../../../../common/textbook/exerciseParts.js';

export const LP = {
  P1: '4am_talis-hisab-atwal_P1',
  P2: '4am_talis-hisab-atwal_P2',
  P3: '4am_talis-hisab-atwal_P3',
};

const E = (n, part) => ({ ...src(`ex-${n}`, n === 26 ? 113 : 110, n === 26 ? 'أتعمّق' : 'خاصية طالس', n), ...(part ? { part } : {}) });
const near = (target, tol = 0.006) => (x) => Number.isFinite(x) && Math.abs(x - target) <= tol;

export const EXERCISES = [
  // تمرين 1 — la فراشة (AB)//(EF), sécantes en O
  {
    id: 'ex-1-a', source: E(1, '1'), learningPointId: LP.P1, difficulty: 'facile', figure: 'ex1',
    statement: 'في الشكل المقابل، المستقيمان (AB) و (EF) متوازيان.',
    interaction: 'choice',
    question: {
      prompt: '1) اذكر المثلثين اللذين أطوال أحدهما متناسبة مع أطوال أضلاع الآخر.',
      // OAE et OBF ont des sommets alignés (ce ne sont pas des triangles) ; ABE et EFB ne sont pas en situation de Thalès
      options: ['OAB و OEF', 'OAE و OBF', 'ABE و EFB'],
      correct: 0, cols: 1,
      explain: 'المستقيمان (AE) و (BF) متقاطعان في O، و $(AB) \\parallel (EF)$ : المثلثان OAB و OEF في وضعية طالس.',
    },
  },
  {
    id: 'ex-1-b', source: E(1, '2'), learningPointId: LP.P1, difficulty: 'facile',
    interaction: 'choice',
    question: {
      prompt: '2) استنتج كل النسب المتساوية.',
      options: [
        '$\\dfrac{OA}{OE} = \\dfrac{OB}{OF} = \\dfrac{AB}{EF}$',
        '$\\dfrac{OA}{OF} = \\dfrac{OB}{OE} = \\dfrac{AB}{EF}$', // A associé à F : la correspondance des sommets est perdue
        '$\\dfrac{OA}{AE} = \\dfrac{OB}{BF} = \\dfrac{AB}{EF}$', // la قطعة AE au lieu du côté OE
      ],
      correct: 0, cols: 1,
      explain: 'A يقابل E و B يقابل F (طرفا المستقيمين المتوازيين): $\\dfrac{OA}{OE} = \\dfrac{OB}{OF} = \\dfrac{AB}{EF}$ .',
    },
    commonError: 'قرن A بـ F لأنهما على الخط نفسه من الشكل: الرأسان المتقابلان هما طرفا الضلعين المتوازيين (A مع E و B مع F).',
  },
  // تمرين 2 — BC = 5
  {
    id: 'ex-2', source: E(2), learningPointId: LP.P2, difficulty: 'facile', figure: 'ex2',
    statement: 'في الشكل المقابل، (EF) يوازي (BC).',
    interaction: 'numeric',
    question: {
      prompt: 'احسب BC.',
      expected: 5, display: '5',
      explain: '$AE = 3 + 3 = 6$ : $\\dfrac{AB}{AE} = \\dfrac{BC}{EF}$ أي $\\dfrac{3}{6} = \\dfrac{BC}{10}$ ومنه $BC = 5$ .',
      explainFor: (n) => (n === 10 / 3 || near(10 / 3, 0.01)(n) ? 'استعملت $\\dfrac{AB}{BE}$ ؟ الضلع هو $AE = 6$ لا القطعة $BE$ . $\\dfrac{3}{6} = \\dfrac{BC}{10}$ ومنه $BC = 5$ .' : '$\\dfrac{AB}{AE} = \\dfrac{BC}{EF}$ أي $\\dfrac{3}{6} = \\dfrac{BC}{10}$ ومنه $BC = 5$ .'),
    },
    commonError: 'أخذ القطعة BE = 3 بدل الضلع AE = 6 في النسبة: نقارن ضلعين لهما الرأس A.',
  },
  // تمرين 3 — quatre figures : justifier puis écrire les rapports
  {
    id: 'ex-3', source: E(3), learningPointId: LP.P1, difficulty: 'moyen', figure: 'ex3',
    statement: 'برّر أنّه في كل شكل من الأشكال الأربعة الآتية يمكن تطبيق خاصية طاليس ثم اكتب النسب الثلاث المتساوية.',
    interaction: 'batch',
    question: {
      prompt: 'اختر لكل شكل النسب الثلاث المتساوية:',
      rows: [
        { label: 'الشكل (1): $(AD) \\parallel (EB)$', options: ['$\\dfrac{CA}{CB} = \\dfrac{CD}{CE} = \\dfrac{AD}{BE}$', '$\\dfrac{CA}{CE} = \\dfrac{CD}{CB} = \\dfrac{AD}{BE}$', '$\\dfrac{CA}{AB} = \\dfrac{CD}{DE} = \\dfrac{AD}{BE}$'], correct: 0,
          correction: 'A يقابل B و D يقابل E: $\\dfrac{CA}{CB} = \\dfrac{CD}{CE} = \\dfrac{AD}{BE}$ .' },
        { label: 'الشكل (2): (HJ) و (FG) عموديان على (IF)', options: ['$\\dfrac{IH}{HF} = \\dfrac{IJ}{JG} = \\dfrac{HJ}{FG}$', '$\\dfrac{IH}{IF} = \\dfrac{IJ}{IG} = \\dfrac{HJ}{FG}$', '$\\dfrac{IF}{IH} = \\dfrac{IJ}{IG} = \\dfrac{HJ}{FG}$'], correct: 1,
          correction: 'مستقيمان عموديان على مستقيم واحد متوازيان: $(HJ) \\parallel (FG)$ ، ومنه $\\dfrac{IH}{IF} = \\dfrac{IJ}{IG} = \\dfrac{HJ}{FG}$ .' },
        { label: 'الشكل (3): زاويتان متماثلتان متقايستان في L و M', options: ["$\\dfrac{KK'}{KS} = \\dfrac{KL}{KM} = \\dfrac{K'L}{SM}$", "$\\dfrac{KK'}{K'S} = \\dfrac{KL}{LM} = \\dfrac{K'L}{SM}$", "$\\dfrac{KS}{KK'} = \\dfrac{KL}{KM} = \\dfrac{K'L}{SM}$"], correct: 0,
          correction: "زاويتان متماثلتان متقايستان: $(K'L) \\parallel (SM)$ ، ومنه $\\dfrac{KK'}{KS} = \\dfrac{KL}{KM} = \\dfrac{K'L}{SM}$ ." },
        { label: 'الشكل (4): الزوايا 40° و 35° و 105°', options: ['$\\dfrac{OP}{OR} = \\dfrac{ON}{OQ} = \\dfrac{PN}{QR}$', '$\\dfrac{OP}{OQ} = \\dfrac{ON}{OR} = \\dfrac{PN}{QR}$', '$\\dfrac{OP}{PQ} = \\dfrac{ON}{NR} = \\dfrac{PN}{QR}$'], correct: 1,
          correction: '$\\widehat{PNO} = 180° - 40° - 35° = 105° = \\widehat{ORQ}$ (متبادلتان داخليا) إذن $(PN) \\parallel (QR)$ ، ومنه $\\dfrac{OP}{OQ} = \\dfrac{ON}{OR} = \\dfrac{PN}{QR}$ .' },
      ],
      explain: 'في كل شكل نبرّر التوازي أولا، ثم نكتب النسب بالترتيب نفسه: رأس مشترك، ثم طرفا المستقيمين المتوازيين.',
    },
    commonError: 'كتابة $\\dfrac{IH}{HF}$ (قطعة على قطعة): النسب تقارن ضلعي المثلثين اللذين رأسهما المشترك I.',
  },
  // تمرين 4 — OD = 10/3, CD = 20/3, puis l'arrondi au dixième
  {
    id: 'ex-4-a', source: E(4, '1'), learningPointId: LP.P2, difficulty: 'moyen', figure: 'ex4',
    statement: 'في الرباعي ABCD الآتي، (AB) و (CD) متوازيان. (AC) و (BD) يتقاطعان في النقطة O.',
    interaction: 'fraction',
    question: {
      prompt: '1) احسب القيمة المضبوطة للطول OD (كسرا غير قابل للاختزال).',
      expected: '10/3',
      explain: '$\\dfrac{OA}{OC} = \\dfrac{OB}{OD}$ أي $\\dfrac{3}{5} = \\dfrac{2}{OD}$ ومنه $OD = \\dfrac{10}{3}$ .',
    },
    commonError: 'قلب إحدى النسبتين ($\\dfrac{3}{5} = \\dfrac{OD}{2}$ يعطي $1{,}2$): الأطوال في البسط من المثلث نفسه OAB.',
  },
  {
    id: 'ex-4-b', source: E(4, '1'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'fraction',
    question: {
      prompt: '1) احسب القيمة المضبوطة للطول CD.',
      expected: '20/3',
      explain: '$\\dfrac{OA}{OC} = \\dfrac{AB}{CD}$ أي $\\dfrac{3}{5} = \\dfrac{4}{CD}$ ومنه $CD = \\dfrac{20}{3}$ .',
    },
  },
  {
    id: 'ex-4-c', source: E(4, '2'), learningPointId: LP.P2, difficulty: 'facile',
    interaction: 'batch',
    question: {
      prompt: '2) جد المدوّر إلى الجزء من 10 لكل من OD و CD.',
      rows: [
        // 3,4 : arrondi par excès à tort ; 3 : la partie entière
        { label: '$OD = \\dfrac{10}{3}$', options: ['$3{,}3$', '$3{,}4$', '$3$'], correct: 0, correction: '$\\dfrac{10}{3} = 3{,}333\\ldots \\approx 3{,}3$' },
        { label: '$CD = \\dfrac{20}{3}$', options: ['$6{,}6$', '$6{,}7$', '$6$'], correct: 1, correction: '$\\dfrac{20}{3} = 6{,}666\\ldots \\approx 6{,}7$ (رقم المئات 6 أكبر من 5)' },
      ],
      explain: 'المدوّر إلى الجزء من 10: ننظر إلى رقم الأجزاء من 100.',
    },
  },
  // تمرين 5 — OF = 4/3, GH = 6, OGH agrandissement k = 3
  {
    id: 'ex-5-a', source: E(5, 'أ'), learningPointId: LP.P2, difficulty: 'moyen', figure: 'ex5',
    statement: 'الأطوال في الشكل هي بالسنتيمتر وليست حقيقية. المستقيمان (GF) و (EH) متقاطعان في O. المستقيمان (EF) و (GH) متوازيان.',
    interaction: 'fraction',
    question: {
      prompt: 'أ) احسب الطول OF.',
      expected: '4/3',
      explain: '$\\dfrac{OE}{OH} = \\dfrac{1{,}3}{3{,}9} = \\dfrac{1}{3}$ و $\\dfrac{OF}{OG} = \\dfrac{1}{3}$ ومنه $OF = \\dfrac{4}{3}$ .',
    },
  },
  {
    id: 'ex-5-b', source: E(5, 'أ'), learningPointId: LP.P2, difficulty: 'facile',
    interaction: 'numeric',
    question: {
      prompt: 'أ) احسب الطول GH.',
      expected: 6, display: '6',
      explain: '$\\dfrac{EF}{GH} = \\dfrac{1}{3}$ ومنه $GH = 3 \\times 2 = 6$ .',
    },
  },
  {
    id: 'ex-5-c', source: E(5, 'ب'), learningPointId: LP.P3, difficulty: 'moyen',
    interaction: 'choice',
    question: {
      prompt: 'ب) أيّ من المثلثين OEF و OGH يمثل تكبيرا للآخر؟ اذكر معامل التكبير.',
      options: [
        'OGH تكبير للمثلث OEF بمعامل 3',
        'OEF تكبير للمثلث OGH بمعامل 3', // le plus petit ne peut pas agrandir le plus grand
        'OGH تكبير للمثلث OEF بمعامل $\\dfrac{1}{3}$', // k < 1 est une réduction
      ],
      correct: 0, cols: 1,
      explain: 'أطوال OGH هي أطوال OEF مضروبة في 3 ($OH = 3 \\times 1{,}3 = 3{,}9$): $k = 3 > 1$ معامل تكبير.',
    },
    commonError: 'ذكر $\\dfrac{1}{3}$ معاملا للتكبير: معامل التكبير أكبر من 1، و $\\dfrac{1}{3}$ هو معامل تصغير OGH إلى OEF.',
  },
  // تمرين 6 — périmètre de BKL
  {
    id: 'ex-6', source: E(6), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'BEM مثلث حيث $BE = 12\\,\\mathrm{cm}$ ، $BM = 9\\,\\mathrm{cm}$ و $EM = 6\\,\\mathrm{cm}$ . K هي نقطة من [BE] حيث $EK = 4\\,\\mathrm{cm}$ والمستقيم الذي يشمل K ويوازي (EM) يقطع (BM) في L. 1) أنجز شكلا مناسبا.',
    interaction: 'numeric',
    question: {
      prompt: '2) احسب محيط المثلث BKL (بالسنتيمتر).',
      expected: 18, display: '18',
      explain: '$BK = 12 - 4 = 8$ و $k = \\dfrac{BK}{BE} = \\dfrac{8}{12} = \\dfrac{2}{3}$ : $BL = \\dfrac{2}{3} \\times 9 = 6$ و $KL = \\dfrac{2}{3} \\times 6 = 4$ ، المحيط $8 + 6 + 4 = 18$ .',
      explainFor: (n) => (n === 9 ? 'استعملت $\\dfrac{EK}{BE} = \\dfrac{1}{3}$ ؟ النقطة K تبعد عن B بـ $BK = 8$ : $k = \\dfrac{2}{3}$ ، المحيط $8 + 6 + 4 = 18$ .' : '$k = \\dfrac{8}{12} = \\dfrac{2}{3}$ : المحيط $\\dfrac{2}{3} \\times (12 + 9 + 6) = 18$ .'),
    },
    commonError: 'أخذ EK = 4 بدل BK = 8: الرأس المشترك هو B، فالنسبة $\\dfrac{BK}{BE}$ .',
  },
  // تمرين 8 — AP = 10, LP = 4
  {
    id: 'ex-8-a', source: E(8), learningPointId: LP.P2, difficulty: 'moyen', figure: 'ex8',
    statement: 'وحدة الطول هي السنتيمتر: في الشكل المقابل (NP)//(ML) و (MN) و (LP) يتقاطعان في A.',
    interaction: 'numeric',
    question: {
      prompt: 'احسب الطول AP.',
      expected: 10, display: '10',
      explain: '$\\dfrac{AM}{AN} = \\dfrac{AL}{AP}$ أي $\\dfrac{9}{15} = \\dfrac{6}{AP}$ ومنه $AP = \\dfrac{15 \\times 6}{9} = 10$ .',
      explainFor: (n) => (Math.abs(n - 3.6) < 0.01 ? 'هذا $\\dfrac{9 \\times 6}{15}$ : النسبة مقلوبة. $\\dfrac{9}{15} = \\dfrac{6}{AP}$ ومنه $AP = 10$ .' : '$\\dfrac{9}{15} = \\dfrac{6}{AP}$ ومنه $AP = 10$ .'),
    },
  },
  {
    id: 'ex-8-b', source: E(8), learningPointId: LP.P2, difficulty: 'facile',
    interaction: 'numeric',
    question: {
      prompt: 'احسب الطول LP.',
      expected: 4, display: '4',
      explain: 'L بين A و P: $LP = AP - AL = 10 - 6 = 4$ .',
    },
  },
  // تمرين 9 — pas d'angle droit marqué en B : Pythagore réciproque, puis Thalès
  {
    id: 'ex-9-a', source: E(9), learningPointId: LP.P1, difficulty: 'difficile', figure: 'ex9',
    statement: 'وحدة الطول هي السنتيمتر، والأطوال على الشكل ليست حقيقية. احسب AF.',
    interaction: 'choice',
    question: {
      prompt: 'قبل الحساب: لماذا المستقيمان (BD) و (AF) متوازيان؟',
      options: [
        'لأن $2{,}8^2 + 4{,}5^2 = 5{,}3^2$ فالمثلث ABD قائم في B، و (BD) و (AF) عموديان على (AB)',
        'لأن الشكل يبدو كذلك', // une figure « ليست حقيقية » ne prouve rien
        'لأن $AE \\neq ED$', // des longueurs inégales ne disent rien du parallélisme
      ],
      correct: 0, cols: 1,
      explain: '$AD = 3{,}3 + 2 = 5{,}3$ و $2{,}8^2 + 4{,}5^2 = 7{,}84 + 20{,}25 = 28{,}09 = 5{,}3^2$ : حسب عكس خاصية فيثاغورس ABD قائم في B.',
    },
    commonError: 'اعتبار الزاوية في B قائمة لأنها تبدو كذلك: لا ترميز لها في الشكل، نثبتها بعكس خاصية فيثاغورس.',
  },
  {
    id: 'ex-9-b', source: E(9), learningPointId: LP.P2, difficulty: 'difficile',
    interaction: 'numeric',
    question: {
      prompt: 'احسب AF.',
      expected: near(7.425, 0.0005), display: '7,425',
      explain: 'المثلثان EAF و EDB في وضعية طالس: $\\dfrac{AF}{BD} = \\dfrac{EA}{ED}$ أي $\\dfrac{AF}{4{,}5} = \\dfrac{3{,}3}{2}$ ومنه $AF = \\dfrac{4{,}5 \\times 3{,}3}{2} = 7{,}425$ .',
    },
  },
  // تمرين 26 — أتعمّق : la bissectrice (raisonnement)
  {
    id: 'ex-26', source: E(26), learningPointId: LP.P1, difficulty: 'difficile',
    statement: 'RST مثلثا كيفيا. منصف زاوية الرأس R يقطع الضلع [ST] في النقطة P. المستقيم الذي يشمل T ويوازي (RP) يقطع (SR) في النقطة E. 1) ارسم شكلا مناسبا. 2) أثبت أنّ $\\dfrac{ST}{SP} = \\dfrac{SE}{SR}$ ، واستنتج $\\dfrac{PT}{SP} = \\dfrac{RE}{SR}$ . 3) بيّن أنّ المثلث RTE متساوي الساقين. 4) بيّن أنّ $\\dfrac{PT}{SP} = \\dfrac{RT}{SR}$ .',
    interaction: 'reasoning',
    question: {
      solution: '2) $(RP) \\parallel (ET)$ : المثلثان SRP و SET في وضعية طالس فـ $\\dfrac{SP}{ST} = \\dfrac{SR}{SE}$ أي $\\dfrac{ST}{SP} = \\dfrac{SE}{SR}$ . بطرح 1 من الطرفين: $\\dfrac{ST - SP}{SP} = \\dfrac{SE - SR}{SR}$ أي $\\dfrac{PT}{SP} = \\dfrac{RE}{SR}$ . 3) الزاوية $\\widehat{RTE}$ تقايس $\\widehat{PRT}$ (متبادلتان داخليا) والزاوية $\\widehat{RET}$ تقايس $\\widehat{SRP}$ (متماثلتان)، وهما نصفا الزاوية R فهما متقايستان: $RE = RT$ . 4) نعوّض RE بـ RT في 2).',
    },
  },
];

// lecteur : les parties sans énoncé portent celui de la partie 1 (« pas d'aller-retour », common/textbook/exerciseParts.js)
export const partsOf = (n) => withContext(EXERCISES.filter((ex) => ex.id === `ex-${n}` || ex.id.startsWith(`ex-${n}-`)));
export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
