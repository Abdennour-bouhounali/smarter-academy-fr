/**
 * Le contenu du MANUEL pour le درس « الزاوية المحيطية والزاوية المركزية والعلاقة بينهما » (unité 13) — données pures (aucun
 * JSX), au mot près ; chaque bloc cite son élément de docs/sources/4am/unit13/extraction.json : أستعدّ 4 et 5 (p. 151,
 * module 0), نشاط 4 (p. 153, module 1), معارف 4 (p. 156, module 2), أؤكّد تعلّماتي 2 et 3 (p. 160, doublon déclaré, module 5).
 * Ce que la plateforme ajoute est déclaré (`addition(…)`) : les réponses écrites du نشاط 4, la طريقة « من القوس إلى الزاوية »
 * et le cas du diamètre (`knowledge_formalization` — le manuel n'a pas de page طرائق pour ce درس), les affirmations
 * d'« أستعدّ » de la plateforme.
 * Corrections (une ligne discrète chacune) : معارف 4 مثال 3 (« AOB و ANB » → AMB).
 */
import { src, addition } from '../../_unit/unitMeta.js';

const PLATFORM = addition('interaction_generation');
export const PLATFORM_SOURCE = PLATFORM;
export const FORMAL_SOURCE = addition('knowledge_formalization');

/** نشاط 4 (p. 153) — « الزاوية المركزية والزاوية المحيطية ». */
export const ACTIVITY = {
  source: src('act-4', 153, 'أنشطة', 4),
  title: 'الزاوية المركزية والزاوية المحيطية',
  situation: 'منطقة الجزاء في ملعب 5 جويلية: القائمان A و B على دائرة مرسومة على العشب. هل تتغير زاوية التسديد عندما يتحرّك الرامي على هذه الدائرة؟',
  intro: '(𝒞) هي دائرة مركزها النقطة O، A و B نقطتان من (𝒞). ارسم الزاوية $\\widehat{AOB}$ . ماذا تلاحظ بالنسبة إلى رأسها O؟ الزاوية $\\widehat{AOB}$ تسمى زاوية مركزية في الدائرة (𝒞). D نقطة من (𝒞) خارج القوس الملونة $\\overset{\\frown}{AB}$ . ارسم الزاوية $\\widehat{ADB}$ . ماذا تلاحظ بالنسبة إلى رأسها D؟',
  naming: 'الزاوية $\\widehat{ADB}$ هي زاوية محيطية في (𝒞) التي تحصر القوس $\\overset{\\frown}{AB}$ و $\\widehat{AOB}$ زاوية مركزية في (𝒞) التي تحصر القوس $\\overset{\\frown}{AB}$ . نقول إنّ الزاوية المركزية $\\widehat{AOB}$ والزاوية المحيطية $\\widehat{ADB}$ تحصران نفس القوس.',
  part1: '1) يقول مزيان: «إذا كان [AD] قطرًا في (𝒞)، فإنّ $\\widehat{AOB} = 2\\widehat{ADB}$ » هل هذا القول صحيح ؟ اشرح. أ) تحقق أنّ $2\\widehat{BAD} + \\widehat{AOB} = 180^\\circ$ وأنّ $\\widehat{ADB} + \\widehat{BAD} = 90^\\circ$ ب) استنتج قيمة $\\widehat{AOB}$ بدلالة $\\widehat{ADB}$ .',
  part2: '2) تضيف زميلته هوارية: « تبقى هذه العلاقة صحيحة إذا كان [AD] و [BD] وتران كيفيان في (𝒞)». هل هي على صواب؟ برّر إجابتك.',
  questions: [
    'ارسم الزاوية $\\widehat{AOB}$ . ماذا تلاحظ بالنسبة إلى رأسها O؟',
    'ارسم الزاوية $\\widehat{ADB}$ . ماذا تلاحظ بالنسبة إلى رأسها D؟',
    'يقول مزيان: «إذا كان [AD] قطرًا في (𝒞)، فإنّ $\\widehat{AOB} = 2\\widehat{ADB}$ » هل هذا القول صحيح؟',
    'تضيف هوارية: «تبقى هذه العلاقة صحيحة إذا كان [AD] و [BD] وتران كيفيان». هل هي على صواب؟',
  ],
  closing: 'الزاوية المحيطية $\\widehat{ADB}$ قيسها نصف قيس الزاوية المركزية $\\widehat{AOB}$ التي تحصر معها نفس القوس، مهما كان موضع D على الدائرة خارج القوس الملونة.',
};

/** Ce que la plateforme écrit des réponses du نشاط 4 (le livre les demande sans les écrire) — extraction › act-4 › answer. */
export const ACTIVITY_LINES = {
  source: PLATFORM,
  vertexO: 'رأس الزاوية $\\widehat{AOB}$ هو مركز الدائرة.',
  vertexD: 'رأس الزاوية $\\widehat{ADB}$ نقطة من الدائرة وضلعاها وتران [DA] و [DB].',
  isosceles: '$OA = OB$ (نصفا قطر) فالمثلث AOB متساوي الساقين: $\\widehat{OAB} = \\widehat{OBA} = \\widehat{BAD}$ لأن O تنتمي إلى [AD]، ومجموع زواياه $2\\widehat{BAD} + \\widehat{AOB} = 180^\\circ$ .',
  right: 'المثلث ABD قائم في B لأن [AD] قطر و B على الدائرة، إذن $\\widehat{ADB} + \\widehat{BAD} = 90^\\circ$ .',
  deduce: '$\\widehat{AOB} = 180^\\circ - 2\\widehat{BAD} = 180^\\circ - 2(90^\\circ - \\widehat{ADB}) = 2\\widehat{ADB}$ : قول مزيان صحيح.',
  example: 'على الشكل: $\\widehat{BAD} = 40^\\circ$ ، $\\widehat{ADB} = 50^\\circ$ ، $\\widehat{AOB} = 100^\\circ$ : $2 \\times 40^\\circ + 100^\\circ = 180^\\circ$ و $50^\\circ + 40^\\circ = 90^\\circ$ .',
  houaria: 'نعم، هوارية على صواب: مهما كان موضع D على القوس الكبير بقي قيس $\\widehat{ADB}$ هو $50^\\circ$ ، أي نصف $\\widehat{AOB} = 100^\\circ$ (نرسم القطر المار بـ D ونطبّق قول مزيان مرتين).',
};

/** معارف 4 (p. 156) — « الزاوية المحيطية و الزاوية المركزية في دائرة ». */
export const KNOW4 = {
  source: src('know-4', 156, 'معارف', 4),
  title: 'الزاوية المحيطية و الزاوية المركزية في دائرة',
  definitionIntro: 'تعريف: (𝒞) دائرة مركزها O.',
  central: 'نُسمّي زاوية مركزية في الدائرة (𝒞) كل زاوية رأسها المركز O.',
  inscribed: 'نُسمّي زاوية محيطية في الدائرة (𝒞) كل زاوية رأسها تنتمي إلى الدائرة (𝒞)، وضلعاها يقطعان الدائرة (𝒞).',
  property1: 'خاصية 1: قيس الزاوية المحيطية في دائرة، هو نصف قيس الزاوية المركزية التي تحصر معها نفس القوس',
  property2: 'خاصية 2: إذا كانت زاويتان محيطيتان في دائرة تحصران القوس نفسه فهما متقايستان.',
  example1: '$\\widehat{AOB}$ هي زاوية مركزية في الدائرة (𝒞)، تحصر القوس $\\overset{\\frown}{AB}$ . $\\widehat{MAN}$ هي زاوية محيطية في الدائرة (𝒞) تحصر القوس $\\overset{\\frown}{MN}$ .',
  example2: 'بما أنّ $\\widehat{AOB}$ زاوية مركزية و $\\widehat{AMB}$ زاوية محيطية وتحصران القوس $\\overset{\\frown}{AB}$ نفسه. فإنّ $\\widehat{AMB} = \\dfrac{1}{2}\\widehat{AOB}$ .',
  example3: 'بما أنّ $\\widehat{AMB}$ و $\\widehat{ANB}$ زاويتان محيطيتان وتحصران القوس $\\overset{\\frown}{AB}$ نفسه. فإنّ $\\widehat{AMB} = \\widehat{ANB}$ .',
  correction3: 'صحّحت المنصّة خطأً مطبعيًا: الكتاب كتب «بما أنّ $\\widehat{AOB}$ و $\\widehat{ANB}$ زاويتان محيطيتان»، و $\\widehat{AOB}$ زاوية مركزية؛ المقصود $\\widehat{AMB}$ .',
};

/**
 * La طريقة de la plateforme (`knowledge_formalization`) : le manuel n'a pas de page طرائق pour ce درس ; la méthode est
 * celle que ses exercices 10, 11, 12 et 16 demandent — « trouver un angle à partir de l'arc ».
 */
export const METHOD = {
  source: FORMAL_SOURCE,
  title: 'كيف نجد قيس زاوية انطلاقا من القوس الذي تحصره',
  steps: [
    'أحدّد رأس الزاوية: المركز O ← زاوية مركزية؛ نقطة من الدائرة وضلعاها يقطعانها ← زاوية محيطية؛ غير ذلك ← لا تُطبَّق الخاصيتان.',
    'أحدّد القوس الذي تحصره الزاوية (طرفاه على ضلعيها، ولا يحوي رأسها).',
    'أبحث عن زاوية معلومة تحصر نفس القوس: مركزية أو محيطية.',
    'المحيطية نصف المركزية؛ والمحيطيتان اللتان تحصران نفس القوس متقايستان.',
  ],
  exampleText: 'في عجلة الملاهي ببن عكنون (مركزها O)، النقطتان P و Q مقعدان والزاوية المركزية $\\widehat{POQ} = 130^\\circ$ . الكاميرا C على العجلة على القوس الكبير. ما قيس $\\widehat{PCQ}$ ؟ وما قيس $\\widehat{PKQ}$ حيث K نقطة أخرى من القوس الكبير؟',
  exampleSteps: [
    'رأس $\\widehat{PCQ}$ هو C، وهي على الدائرة وضلعاها يقطعانها: زاوية محيطية.',
    'تحصر القوس $\\overset{\\frown}{PQ}$ الذي لا يحوي C.',
    'الزاوية المركزية $\\widehat{POQ} = 130^\\circ$ تحصر نفس القوس.',
    '$\\widehat{PCQ} = \\dfrac{130^\\circ}{2} = 65^\\circ$ ، و $\\widehat{PKQ} = \\widehat{PCQ} = 65^\\circ$ (تحصران نفس القوس).',
  ],
  diameter: 'حالة القطر: إذا كان [BC] قطرا فإن الزاوية $\\widehat{BOC}$ زاوية مستقيمة قيسها $180^\\circ$ ، وكل زاوية محيطية $\\widehat{BAC}$ تحصر نصف الدائرة قيسها $\\dfrac{180^\\circ}{2} = 90^\\circ$ : المثلث ABC قائم في A.',
  notInscribed: 'إذا كان رأس الزاوية داخل الدائرة أو خارجها فليست زاوية محيطية: لا نقسم على 2 (تمرين 12).',
};

/** « أؤكّد تعلّماتي » (p. 160) — items 2 et 3 (extraction › destinations › qcm : duplicatedIn ce درس, module 5). */
const QCM_SRC = (n) => src('qcm', 160, 'أؤكّد تعلّماتي', n);
export const QCM = {
  2: {
    source: QCM_SRC(2), text: 'في الشكل الآتي',
    options: [
      'الزاوية $\\widehat{BAC}$ محيطية و الزاوية $\\widehat{BOC}$ مركزية مرفقة بها',
      'الزاوية $\\widehat{BDC}$ محيطية و الزاوية $\\widehat{BEC}$ مركزية مرفقة بها',
      'الزاوية $\\widehat{BDC}$ محيطية و الزاوية $\\widehat{BAC}$ مركزية مرفقة بها',
    ],
  },
  3: {
    source: QCM_SRC(3), text: 'في الشكل الآتي',
    options: ['$\\widehat{BAC} = \\dfrac{1}{2}\\widehat{BOC}$', '$\\widehat{BAC} = 2\\widehat{BOC}$', '$\\widehat{ABC} = \\widehat{ACB}$'],
    reading: '[BC] قطر: $\\widehat{BOC}$ زاوية مستقيمة قيسها $180^\\circ$ نعدّها زاوية مركزية (حالة القطر).',
  },
};

/**
 * « أستعدّ » — les items 4 et 5 du manuel (p. 151 ; deux affirmations chacun, jugées séparément) et quatre affirmations de la
 * plateforme : les éléments du cercle, la somme des angles d'un triangle, le triangle isocèle, le triangle inscrit dans un
 * demi-cercle (le نشاط 4 en a besoin). Une affirmation par question, une compétence par affirmation ; aucune n'utilise les
 * nombres du نشاط 4.
 */
const PREP_ADD = addition('prerequisite_diagnostic');
const PREP_SRC = (n) => src('prep', 151, 'أستعدّ', n);
export const PREP_ITEMS = [
  { n: '4-1', skill: 'muhita', figure: 'prep4', text: 'في الشكل المقابل: (E) هي الدّائرة المحيطة بالمثلث ABD.', answer: true, why: 'الرؤوس A و B و D تنتمي إلى (E).', source: PREP_SRC(4) },
  { n: '4-2', skill: 'muhita', figure: 'prep4', text: 'في الشكل المقابل: (E) هي الدّائرة المحيطة بالمثلث BCD.', answer: true, why: 'الرؤوس B و C و D تنتمي إلى (E): دائرة واحدة تمرّ بالنقط الأربع.', source: PREP_SRC(4) },
  { n: '5-1', skill: 'muhita', figure: 'prep5', text: 'في الشكل المقابل: (E) هي الدّائرة المحيطة بالمثلث MNP.', answer: true, why: 'M و N و P تنتمي إلى (E)، والمثلث قائم في M لأن [PN] قطر.', source: PREP_SRC(5) },
  { n: '5-2', skill: 'muhita', figure: 'prep5', text: 'في الشكل المقابل: (E) هي الدّائرة المحيطة بالمثلث ONM.', answer: false, why: 'O مركز (E) فهي لا تنتمي إليها ($OM = ON = r$ و $OO = 0$): الدائرة المحيطة بالمثلث ONM مركزها منتصف [MN].', source: PREP_SRC(5) },
  { n: 'p1', skill: 'anasir', text: 'كل وتر في دائرة هو قطر لها.', answer: false, why: 'القطر وتر يشمل المركز؛ أما أغلب الأوتار فلا تمر بالمركز، وهي أقصر من القطر.', source: PREP_ADD },
  { n: 'p2', skill: 'majmu', text: 'في مثلث قيسا زاويتين منه $35^\\circ$ و $65^\\circ$ ، قيس الزاوية الثالثة $80^\\circ$ .', answer: true, why: 'مجموع أقياس زوايا المثلث $180^\\circ$ : $180^\\circ - 35^\\circ - 65^\\circ = 80^\\circ$ .', source: PREP_ADD },
  { n: 'p3', skill: 'saqayn', text: 'في المثلث RST، إذا كان $SR = ST$ فإن الزاويتين $\\widehat{SRT}$ و $\\widehat{STR}$ متقايستان.', answer: true, why: 'المثلث RST متساوي الساقين رأسه S: زاويتا القاعدة [RT] متقايستان.', source: PREP_ADD },
  { n: 'p4', skill: 'qaim', text: 'إذا كان [EF] قطرا لدائرة و G نقطة منها تختلف عن E و F، فإن المثلث EFG قائم في E.', answer: false, why: 'المثلث قائم في G، الرأس المقابل للقطر [EF] (الدائرة المحيطة بمثلث قائم قطرها الوتر).', source: PREP_ADD },
];

/** Les deux mondes du lab (levels.js) : مبتدئ = l'angle de tir (plateforme) ; متقدم = le نشاط 4 du manuel. */
export const LAB = {
  beginner: { source: PLATFORM, numbers: { r: 4, A: 150, B: 30, M: 250 } },
  advanced: { source: ACTIVITY.source, numbers: { r: 5, A: 140, B: 40, D: 280, stages: ['mezian', 'houaria', 'interior'] } },
};
