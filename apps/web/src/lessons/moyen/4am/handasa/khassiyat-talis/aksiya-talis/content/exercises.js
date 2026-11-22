/**
 * Les exercices du MANUEL rattachés au درس « الخاصية العكسية لخاصية طالس وإثبات التوازي » (extraction.json →
 * destinations : ex-7 p. 110, ex-10 … ex-16 p. 111, ex-23 … ex-25 p. 113 « أتعمّق »). Énoncés au mot près ; la
 * figure de chaque « لاحظ الشكل » est une donnée GeoFigure (content/figures.js) que le module dessine AVANT
 * l'exercice. L'interaction découpe la démarche du manuel (ordre des points, deux rapports, conclusion) en lignes
 * jugées séparément ; les valeurs sont celles calculées par l'extraction (`answerSource: computed`).
 * Tous les distracteurs sont FAUX (la confusion qu'ils portent est dite en commentaire).
 */
import { src } from '../../_unit/unitMeta.js';
import { FIG_EX } from './figures.js';

export const LP = {
  P1: '4am_aksiya-talis_P1',
  P2: '4am_aksiya-talis_P2',
};

const E = (n) => src(`ex-${n}`, n === 7 ? 110 : n >= 23 ? 113 : 111, n >= 23 ? 'أتعمّق' : 'أوظّف تعلّماتي', n);
const PARALLEL = (a, b) => `$${a} \\parallel ${b}$`;

export const EXERCISES = [
  // تمرين 7 — « يبدو » متوازيين (p. 110)
  {
    id: 'ex-7', source: E(7), learningPointId: LP.P1, difficulty: 'moyen',
    statement: '1) أ) ارسم مثلثا ABC حيث AB = 4cm ، AC = 5cm ، BC = 6cm. ب) علّم النقطتين I و J حيث: I ∈ [AB] ، J ∈ [AC] و BI = CJ = 1cm. 2) يبدو أنّ المستقيمين (IJ) و (BC) متوازيان، هل هذا صحيح؟ برّر جوابك.',
    interaction: 'batch',
    question: {
      prompt: 'السؤال 2) — احسب النسبتين ثم احكم:',
      rows: [
        // 1/4 = BI/AB (القطعة بدل الضلع) ; 4/5 = AJ/AC
        { label: '$\\dfrac{AI}{AB}$', options: ['$\\dfrac{3}{4}$', '$\\dfrac{1}{4}$', '$\\dfrac{4}{5}$'], correct: 0, correction: '$AI = 4 - 1 = 3$ إذن $\\dfrac{AI}{AB} = \\dfrac{3}{4}$' },
        { label: '$\\dfrac{AJ}{AC}$', options: ['$\\dfrac{3}{4}$', '$\\dfrac{1}{5}$', '$\\dfrac{4}{5}$'], correct: 2, correction: '$AJ = 5 - 1 = 4$ إذن $\\dfrac{AJ}{AC} = \\dfrac{4}{5}$' },
        { label: 'المستقيمان (IJ) و (BC)', options: ['غير متوازيين', 'متوازيان'], correct: 0, correction: '$3 \\times 5 = 15$ و $4 \\times 4 = 16$ : $\\dfrac{3}{4} \\neq \\dfrac{4}{5}$ ، فالمستقيمان غير متوازيين.' },
      ],
      explain: '$\\dfrac{3}{4} \\neq \\dfrac{4}{5}$ فالمستقيمان غير متوازيين (يكفي عدم تساوي نسبتين).',
    },
    method: 'نحسب $\\dfrac{AI}{AB}$ و $\\dfrac{AJ}{AC}$ ونقارنهما بالجداء المتصالب؛ نسبتان مختلفتان تكفيان.',
    commonError: 'الحكم بالنظر إلى الشكل: «يبدو» ليس برهانا، والقطعتان BI و CJ متساويتان لا تعنيان أن النسبتين متساويتان.',
  },
  // تمرين 10
  {
    id: 'ex-10', source: E(10), learningPointId: LP.P1, difficulty: 'facile', figure: FIG_EX[10],
    statement: 'لاحظ الشكل المقابل. هل (AB) يوازي (EF)؟',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'ترتيب النقط', options: ['C بين A و E و C بين B و F: نفس الترتيب', 'النقط ليست مرتبة بنفس الترتيب'], correct: 0, correction: 'A و E في جهتين من C، و B و F في جهتين من C: الترتيب نفسه.' },
        // 2/5 و 4/10 : النسبتان CA/AE و CB/BF (القطعة بدل الطول من C)
        { label: '$\\dfrac{CA}{CE}$ و $\\dfrac{CB}{CF}$', options: ['$\\dfrac{2}{3}$ و $\\dfrac{2}{3}$', '$\\dfrac{2}{3}$ و $\\dfrac{3}{2}$', '$\\dfrac{2}{5}$ و $\\dfrac{2}{5}$'], correct: 0, correction: '$\\dfrac{CA}{CE} = \\dfrac{2}{3}$ و $\\dfrac{CB}{CF} = \\dfrac{4}{6} = \\dfrac{2}{3}$' },
        { label: 'الخلاصة', options: [PARALLEL('(AB)', '(EF)'), '(AB) لا يوازي (EF)'], correct: 0, correction: 'نسبتان متساويتان ونفس الترتيب: حسب الخاصية العكسية لخاصية طالس $(AB) \\parallel (EF)$ .' },
      ],
    },
  },
  // تمرين 11
  {
    id: 'ex-11', source: E(11), learningPointId: LP.P1, difficulty: 'facile', figure: FIG_EX[11],
    statement: 'لاحظ الشكل التالي: بيّن أنّ المستقيمين (MN) و (BC) متوازيان.',
    interaction: 'batch',
    question: {
      rows: [
        // 20 = MB ; 56 = AB + MB
        { label: 'AM', options: ['$16$', '$20$', '$56$'], correct: 0, correction: '$AM = AB - MB = 36 - 20 = 16$' },
        { label: '$\\dfrac{AM}{AB}$', options: ['$\\dfrac{5}{9}$', '$\\dfrac{4}{9}$', '$\\dfrac{4}{5}$'], correct: 1, correction: '$\\dfrac{16}{36} = \\dfrac{4}{9}$' },
        { label: '$\\dfrac{AN}{AC}$', options: ['$\\dfrac{4}{9}$', '$\\dfrac{4}{5}$', '$\\dfrac{5}{9}$'], correct: 0, correction: '$\\dfrac{20}{45} = \\dfrac{4}{9}$' },
        { label: 'الخلاصة', options: ['M من [AB] و N من [AC] (نفس الترتيب) والنسبتان متساويتان: (MN)//(BC)', 'النسبتان مختلفتان: (MN) لا يوازي (BC)'], correct: 0, correction: '$\\dfrac{AM}{AB} = \\dfrac{AN}{AC} = \\dfrac{4}{9}$ ونفس الترتيب، فحسب الخاصية العكسية لخاصية طالس $(MN) \\parallel (BC)$ .' },
      ],
    },
    commonError: 'استعمال MB = 20 مكان AM: النسبة تُكتب بطولين من الرأس A، فنحسب أولا AM = 16.',
  },
  // تمرين 12
  {
    id: 'ex-12', source: E(12), learningPointId: LP.P1, difficulty: 'facile', figure: FIG_EX[12],
    statement: 'لاحظ الشّكل المعطى: هل (BC) يوازي (AD)؟',
    interaction: 'batch',
    question: {
      rows: [
        { label: '$\\dfrac{EA}{EC}$', options: ['$\\dfrac{2}{3}$', '$\\dfrac{3}{2}$', '$\\dfrac{2}{5}$'], correct: 0, correction: '$\\dfrac{1{,}2}{1{,}8} = \\dfrac{2}{3}$' },
        // 3/2 = EB/ED (نسبة مقلوبة)
        { label: '$\\dfrac{ED}{EB}$', options: ['$\\dfrac{3}{2}$', '$\\dfrac{2}{3}$', '$\\dfrac{2}{5}$'], correct: 1, correction: '$\\dfrac{3{,}2}{4{,}8} = \\dfrac{2}{3}$' },
        { label: 'ترتيب النقط', options: ['E بين A و C و E بين D و B: نفس الترتيب', 'النقط ليست مرتبة بنفس الترتيب'], correct: 0, correction: 'E بين النقطتين في كل مرة: الترتيب نفسه.' },
        { label: 'الخلاصة', options: [PARALLEL('(BC)', '(AD)'), '(BC) لا يوازي (AD)'], correct: 0, correction: '$\\dfrac{EA}{EC} = \\dfrac{ED}{EB} = \\dfrac{2}{3}$ ونفس الترتيب: $(BC) \\parallel (AD)$ .' },
      ],
    },
  },
  // تمرين 13
  {
    id: 'ex-13', source: E(13), learningPointId: LP.P1, difficulty: 'moyen', figure: FIG_EX[13],
    statement: 'لاحظ الشكل المعطى: هل (EF) يوازي (BD)؟',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'AE', options: ['$5{,}6$', '$2{,}4$', '$10{,}4$'], correct: 0, correction: '$AE = 8 - 2{,}4 = 5{,}6$' },
        // 0,3 = EB/AB
        { label: '$\\dfrac{AE}{AB}$', options: ['$0{,}3$', '$0{,}7$', '$0{,}2$'], correct: 1, correction: '$\\dfrac{5{,}6}{8} = 0{,}7$' },
        { label: '$\\dfrac{AF}{AD}$', options: ['$0{,}2$', '$0{,}7$', '$0{,}8$'], correct: 0, correction: '$\\dfrac{1{,}2}{6} = 0{,}2$' },
        { label: 'الخلاصة', options: ['(EF) لا يوازي (BD)', PARALLEL('(EF)', '(BD)')], correct: 0, correction: '$0{,}7 \\neq 0{,}2$ : لو كان $(EF) \\parallel (BD)$ لتساوت النسبتان حسب خاصية طالس.' },
      ],
    },
    commonError: 'الاستنتاج من الزاوية القائمة أو من الشكل: التعامد لا يغيّر شيئا، النسبتان هما الحكم.',
  },
  // تمرين 14
  {
    id: 'ex-14', source: E(14), learningPointId: LP.P1, difficulty: 'difficile', figure: FIG_EX[14],
    statement: 'لاحظ الشكل المعطى: المستقيمان (d₁) و (d₂) متعامدان. هل (AB) يوازي (DC)؟',
    interaction: 'batch',
    question: {
      prompt: 'نحسب OD و OA بخاصية فيثاغورس في المثلثين القائمين ODC و OAB:',
      rows: [
        // 9 = OD² دون جذر ; 1 = 5 − 4
        { label: 'OD', options: ['$9$', '$1$', '$3$'], correct: 2, correction: '$OD^2 = 5^2 - 4^2 = 9$ ومنه $OD = 3$' },
        // 4 = OA² ; 1 = 2,5 − 1,5
        { label: 'OA', options: ['$2$', '$4$', '$1$'], correct: 0, correction: '$OA^2 = 2{,}5^2 - 1{,}5^2 = 4$ ومنه $OA = 2$' },
        { label: 'النسبتان', options: ['$\\dfrac{OA}{OC} = \\dfrac{OB}{OD} = \\dfrac{1}{2}$', '$\\dfrac{OA}{OC} = \\dfrac{1}{2}$ و $\\dfrac{OB}{OD} = \\dfrac{1}{3}$'], correct: 0, correction: '$\\dfrac{2}{4} = \\dfrac{1}{2}$ و $\\dfrac{1{,}5}{3} = \\dfrac{1}{2}$' },
        { label: 'الخلاصة', options: [PARALLEL('(AB)', '(DC)'), '(AB) لا يوازي (DC)'], correct: 0, correction: 'O بين A و C و O بين B و D (نفس الترتيب) والنسبتان متساويتان: $(AB) \\parallel (DC)$ .' },
      ],
    },
  },
  // تمرين 15
  {
    id: 'ex-15', source: E(15), learningPointId: LP.P1, difficulty: 'moyen', figure: FIG_EX[15],
    statement: 'لاحظ الشكل المعطى ABCD مستطيل. برهن أن المستقيمين (MN) و (BD) متوازيان.',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'طولا الضلعين', options: ['$AB = 10$ و $AD = 15$', '$AB = 15$ و $AD = 10$'], correct: 0, correction: 'في المستطيل $AB = DC = 10$ و $AD = BC = 15$' },
        { label: '$\\dfrac{AM}{AB}$ و $\\dfrac{AN}{AD}$', options: ['$\\dfrac{2}{15}$ و $\\dfrac{3}{10}$', '$\\dfrac{1}{5}$ و $\\dfrac{1}{5}$'], correct: 1, correction: '$\\dfrac{2}{10} = \\dfrac{1}{5}$ و $\\dfrac{3}{15} = \\dfrac{1}{5}$' },
        { label: 'الخلاصة', options: ['M من [AB] و N من [AD] (نفس الترتيب) والنسبتان متساويتان: (MN)//(BD)', 'لا يمكن الحكم دون قياس'], correct: 0, correction: 'حسب الخاصية العكسية لخاصية طالس في المثلث ABD: $(MN) \\parallel (BD)$ .' },
      ],
    },
    commonError: 'قسمة AM على AD: نقسم كل طول على الطول الموافق له على المستقيم نفسه ($\\dfrac{AM}{AB}$ و $\\dfrac{AN}{AD}$).',
  },
  // تمرين 16 — يونس وإيناس
  {
    id: 'ex-16', source: E(16), learningPointId: LP.P1, difficulty: 'moyen', figure: FIG_EX[16],
    statement: 'إليك الشكل المقابل. هل المستقيمان (MN) و (AP) متوازيان؟ إليك إجابتي التلميذين «يونس» و«إيناس».',
    items: [
      'إجابة يونس: النقط M، O، A والنقط N، O، P في استقامية وفي نفس الترتيب. $\\dfrac{ON}{OP} = \\dfrac{5}{3} \\approx 1{,}7$ و $\\dfrac{OM}{OA} = \\dfrac{9}{5{,}4} \\approx 1{,}7$ . حسب الخاصية العكسية لخاصية طالس، المستقيمات (MN) و (AP) متوازيات.',
      'إجابة إيناس: النقط M، O، A والنقط N، O، P في استقامية وفي نفس الترتيب. $\\dfrac{OP}{ON} = \\dfrac{3}{5} = 0{,}6$ و $\\dfrac{OA}{OM} = \\dfrac{5{,}4}{9} = 0{,}6$ . حسب الخاصية العكسية لخاصية طالس، المستقيمات (MN) و (AP) متوازيات.',
    ],
    interaction: 'choice',
    question: {
      prompt: 'أيّ التلميذين على صواب؟',
      // يونس : استنتاج صحيح بتبرير غير كاف ; كلاهما / لا أحد : خطأ
      options: ['إيناس', 'يونس', 'كلاهما', 'لا أحد منهما'],
      correct: 0, cols: 2,
      explain: 'قيمتان مقرّبتان متساويتان (≈ 1,7) لا تثبتان تساوي نسبتين ؛ إيناس كتبت قيمتين مضبوطتين متساويتين (0,6). (النسبتان في الحقيقة متساويتان $\\dfrac{5}{3} = \\dfrac{9}{5{,}4}$ ، لكن تبرير يونس غير كاف.)',
    },
    commonError: 'قيمتان مقرّبتان متساويتان لا تثبتان تساوي نسبتين: نقارن قيما مضبوطة أو نستعمل الجداء المتصالب.',
  },
  // تمرين 23 — أتعمّق
  {
    id: 'ex-23', source: E(23), learningPointId: LP.P1, difficulty: 'difficile', figure: FIG_EX[23],
    statement: 'الأطوال في الشكل هي بالسنتيمتر وليست حقيقية. (CB) و (LK) متوازيان. هل (CK) يوازي (DA)؟',
    interaction: 'batch',
    question: {
      prompt: 'حسب الترميز: AL = KB = 20 و CB = AK = 30. في المثلث ABC حيث (LK)//(CB):',
      rows: [
        // 3/2 = AK/KB ; 2/5 = KB/AB
        { label: '$\\dfrac{AK}{AB}$', options: ['$\\dfrac{3}{5}$', '$\\dfrac{3}{2}$', '$\\dfrac{2}{5}$'], correct: 0, correction: '$\\dfrac{30}{30 + 20} = \\dfrac{3}{5}$' },
        // 20 = AL ; 45 = CB ÷ (2/3)
        { label: 'LK', options: ['$20$', '$18$', '$45$'], correct: 1, correction: 'حسب خاصية طالس $\\dfrac{LK}{CB} = \\dfrac{3}{5}$ ومنه $LK = \\dfrac{3}{5} \\times 30 = 18$' },
        // 12 = 20 × 3/5 ; 100/3 = AC
        { label: 'LC', options: ['$\\dfrac{40}{3}$', '$12$', '$\\dfrac{100}{3}$'], correct: 0, correction: '$\\dfrac{AL}{AC} = \\dfrac{3}{5}$ ومنه $AC = \\dfrac{100}{3}$ و $LC = \\dfrac{100}{3} - 20 = \\dfrac{40}{3}$' },
        { label: 'المقارنة', options: ['$\\dfrac{LA}{LC} = \\dfrac{3}{2}$ و $\\dfrac{LD}{LK} = \\dfrac{3}{4}$', '$\\dfrac{LA}{LC} = \\dfrac{LD}{LK} = \\dfrac{3}{2}$'], correct: 0, correction: '$\\dfrac{20}{40/3} = \\dfrac{3}{2}$ و $\\dfrac{13{,}5}{18} = \\dfrac{3}{4}$' },
        { label: 'الخلاصة', options: ['(CK) لا يوازي (DA)', PARALLEL('(CK)', '(DA)')], correct: 0, correction: 'النسبتان مختلفتان: لو كان $(CK) \\parallel (DA)$ لتساوتا حسب خاصية طالس.' },
      ],
    },
    commonError: 'الحكم قبل حساب LK و LC: يلزم أولا خاصية طالس في المثلث ABC للحصول على الأطوال المجهولة.',
  },
  // تمرين 24 — مركزا الثقل
  {
    id: 'ex-24', source: E(24), learningPointId: LP.P2, difficulty: 'difficile', figure: FIG_EX[24],
    statement: 'ABC و DBC مثلثان، O هي منتصف [BC]. J هي مركز ثقل المثلث ABC و K هي مركز ثقل المثلث DBC. برهن أنّ (JK) يوازي (AD).',
    interaction: 'batch',
    question: {
      prompt: 'تذكّر: مركز ثقل مثلث يقع على كل متوسط، على ثلثي طوله ابتداء من الرأس.',
      rows: [
        // 2/3 = AJ/AO (من الرأس) ; 1/2 = منتصف
        { label: '$\\dfrac{OJ}{OA}$', options: ['$\\dfrac{2}{3}$', '$\\dfrac{1}{3}$', '$\\dfrac{1}{2}$'], correct: 1, correction: '$AJ = \\dfrac{2}{3}AO$ إذن $OJ = \\dfrac{1}{3}OA$' },
        { label: '$\\dfrac{OK}{OD}$', options: ['$\\dfrac{1}{3}$', '$\\dfrac{2}{3}$', '$\\dfrac{1}{2}$'], correct: 0, correction: '$OK = \\dfrac{1}{3}OD$ بالطريقة نفسها في المثلث DBC' },
        { label: 'ترتيب النقط', options: ['J بين O و A و K بين O و D: نفس الترتيب', 'النقط ليست مرتبة بنفس الترتيب'], correct: 0, correction: 'O و J و A على المتوسط [OA] و O و K و D على المتوسط [OD]: الترتيب نفسه.' },
        { label: 'الخلاصة', options: [PARALLEL('(JK)', '(AD)'), 'لا يمكن الحكم'], correct: 0, correction: 'حسب الخاصية العكسية لخاصية طالس على المستقيمين (OA) و (OD): $(JK) \\parallel (AD)$ .' },
      ],
    },
  },
  // تمرين 25 — D منتصف [EF]
  {
    id: 'ex-25', source: E(25), learningPointId: LP.P1, difficulty: 'difficile', figure: FIG_EX[25],
    statement: 'ABC مثلث كيفي. (AD) المتوسط المتعلّق بالضلع [BC]. M نقطة من [AD] تختلف عن A وعن D. المستقيم الذي يشمل M ويوازي (AC) يقطع [BC] في E، والمستقيم الذي يشمل M ويوازي (AB) يقطع [BC] في F. 1) ارسم شكلا مناسبا. 2) أثبت أنّ $\\dfrac{DE}{DC} = \\dfrac{DF}{DB}$ ، استنتج أنّ D هي منتصف [EF].',
    interaction: 'batch',
    question: {
      prompt: 'السؤال 2) — خاصية طالس مرتين:',
      rows: [
        // DM/MA : القطعة بدل الضلع ; AM/AD : الجزء الآخر
        { label: 'في المثلث DAC حيث (ME)//(AC): $\\dfrac{DE}{DC}$ =', options: ['$\\dfrac{DM}{DA}$', '$\\dfrac{DM}{MA}$', '$\\dfrac{AM}{AD}$'], correct: 0, correction: 'حسب خاصية طالس $\\dfrac{DE}{DC} = \\dfrac{DM}{DA}$' },
        { label: 'في المثلث DAB حيث (MF)//(AB): $\\dfrac{DF}{DB}$ =', options: ['$\\dfrac{MA}{DA}$', '$\\dfrac{DM}{DA}$', '$\\dfrac{DB}{DM}$'], correct: 1, correction: 'حسب خاصية طالس $\\dfrac{DF}{DB} = \\dfrac{DM}{DA}$' },
        { label: 'الاستنتاج', options: ['$\\dfrac{DE}{DC} = \\dfrac{DF}{DB}$ و $DB = DC$ إذن $DE = DF$ : D منتصف [EF]', 'D منتصف [EF] لأن M منتصف [AD]'], correct: 0, correction: 'D منتصف [BC] فإن $DB = DC$ ، ومنه $DE = DF$ و D بين E و F.' },
      ],
    },
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
