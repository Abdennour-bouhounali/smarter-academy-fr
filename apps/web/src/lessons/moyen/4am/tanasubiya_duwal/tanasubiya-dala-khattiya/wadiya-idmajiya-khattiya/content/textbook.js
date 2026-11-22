import { src, addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » (module 0) — le « أستعدّ » du manuel (p. 65, items 1–9) est réparti entre
 * les leçons 1, 2 et 4 (extraction › destinations › prep) : la synthèse n'en reçoit
 * aucun. Ses affirmations sont donc des AFFIRMATIONS DE LA PLATEFORME (« عبارة إضافية من
 * المنصّة »), dans la forme du manuel, sur ce que la situation mobilise :
 * Pythagore (le câble), la vitesse moyenne et les unités (la durée), la réduction en %
 * comme multiplication par 1 − t/100 (le ticket enfant), la lecture d'un graphique,
 * l'image et le coefficient d'une fonction linéaire, sa forme ax, et un pourcentage
 * d'un tout. Jamais les nombres du téléphérique du manuel.
 */
export const PREP_ITEMS = [
  { n: 1, skill: 'fithaghuras', text: '$ABC$ مثلث قائم في $A$ حيث $AB = 6\\,\\mathrm{cm}$ و $AC = 8\\,\\mathrm{cm}$ ، إذن $BC = 14\\,\\mathrm{cm}$.', answer: false,
    why: 'حسب مبرهنة فيثاغورس: $BC^2 = 6^2 + 8^2 = 36 + 64 = 100$ ، إذن $BC = 10\\,\\mathrm{cm}$ ، لا مجموع الضلعين.', source: addition('prerequisite_diagnostic') },
  { n: 2, skill: 'maqadir', text: 'دراجة تقطع $900\\,\\mathrm{m}$ في 3 دقائق: سرعتها المتوسطة $5\\,\\mathrm{m/s}$.', answer: true,
    why: '3 دقائق $= 180\\,\\mathrm{s}$ ، والسرعة المتوسطة $v = \\dfrac{d}{t} = \\dfrac{900}{180} = 5$ ، أي $5\\,\\mathrm{m/s}$.', source: addition('prerequisite_diagnostic') },
  { n: 3, skill: 'takhfid', text: 'تخفيض بـ 15% على ثمن $x$ يُترجم بالعبارة $x - 15$.', answer: false,
    why: 'التخفيض بـ 15% ينقص 15% من الثمن لا 15 دينارا: ندفع 85% منه، أي $0{,}85x$.', source: addition('prerequisite_diagnostic') },
  { n: 4, skill: 'takhfid', text: 'بعد تخفيض بـ 30% يصبح ثمن قدره 2000 DA مساويا لـ 1400 DA.', answer: true,
    why: 'ندفع $100\\% - 30\\% = 70\\%$ من الثمن: $2000 \\times 0{,}7 = 1400$.', source: addition('prerequisite_diagnostic') },
  { n: 5, skill: 'qiraa', text: 'على التمثيل البياني لدالة $f$ ، صورة العدد 3 هي ترتيب نقطة المنحنى التي فاصلتها 3.', answer: true,
    why: 'نقرأ صورة 3 بالانطلاق من 3 على محور الفواصل إلى المستقيم، ثم نقرأ ترتيب تلك النقطة على محور التراتيب.', source: addition('prerequisite_diagnostic') },
  { n: 6, skill: 'sura', text: 'صورة العدد $-4$ بالدالة الخطية $x \\longmapsto 2{,}5x$ هي $10$.', answer: false,
    why: '$2{,}5 \\times (-4) = -10$ : جداء عددين مختلفي الإشارة سالب.', source: addition('prerequisite_diagnostic') },
  { n: 7, skill: 'muamil', text: 'إذا كانت $f$ دالة خطية حيث $f(5) = 2$ فإنّ معاملها $2{,}5$.', answer: false,
    why: 'من $a \\times 5 = 2$ نجد $a = \\dfrac{2}{5} = 0{,}4$ : الصورة على العدد، لا العكس.', source: addition('prerequisite_diagnostic') },
  { n: 8, skill: 'shakl', text: 'الدالة $x \\longmapsto 3x + 2$ دالة خطية.', answer: false,
    why: 'الدالة الخطية من الشكل $x \\longmapsto ax$ فقط؛ هنا صورة 0 هي 2 لا 0.', source: addition('prerequisite_diagnostic') },
  { n: 9, skill: 'nisba', text: 'حضر 18 تلميذا من أصل 24: نسبة الحاضرين 75%.', answer: true,
    why: '$\\dfrac{18}{24} = 0{,}75 = \\dfrac{75}{100}$.', source: addition('prerequisite_diagnostic') },
];

/**
 * « أدمج تعلّماتي » (p. 74) — la وضعية du مصعد هوائي, au mot près, et son « تحليل الوضعية »
 * en trois étapes NOMMÉES par le manuel (gardées telles quelles). La figure
 * (components/CableCarFigure.jsx) est redessinée : A, H, B, l'angle droit en H,
 * AH = 2500 m, les altitudes 900 m et 1400 m.
 */
export const SITUATION = {
  source: src('situation', 74, 'أدمج تعلّماتي'),
  title: 'وضعية',
  text: '1) ينطلق مصعد هوائي من ارتفاع 900m ليصل ارتفاع 1400m (الشكل). ما هي المدة الزمنية (مقدّرة بالدقائق والثواني) لصعود واحد، إذا كانت سرعة المصعد الهوائي $5{,}5\\,\\mathrm{m/s}$؟ 2) ليكن $x$ سعر التذكرة لشخص بالغ لرحلة واحدة (ذهابا وإيابا). أ) عبّر عن تكلفة الرحلة بدلالة $x$ لعائلة متكوّنة من شخصين بالغين و 3 أطفال، علما أنّ كلّ طفل يستفيد من تخفيض قدرة 40% من قيمة $x$ . ب) ما هي أكبر قيمة لسعر التذكرة التي تسمح للعائلة بدفع ثمن الرحلة في حدود المبلغ المخصص لذلك والمقدر بـ 2000DA؟',
  q1: '1) ينطلق مصعد هوائي من ارتفاع 900m ليصل ارتفاع 1400m (الشكل). ما هي المدة الزمنية (مقدّرة بالدقائق والثواني) لصعود واحد، إذا كانت سرعة المصعد الهوائي $5{,}5\\,\\mathrm{m/s}$؟',
  q2: '2) ليكن $x$ سعر التذكرة لشخص بالغ لرحلة واحدة (ذهابا وإيابا).',
  q2a: 'أ) عبّر عن تكلفة الرحلة بدلالة $x$ لعائلة متكوّنة من شخصين بالغين و 3 أطفال، علما أنّ كلّ طفل يستفيد من تخفيض قدرة 40% من قيمة $x$ .',
  q2b: 'ب) ما هي أكبر قيمة لسعر التذكرة التي تسمح للعائلة بدفع ثمن الرحلة في حدود المبلغ المخصص لذلك والمقدر بـ 2000DA؟',
  figure: 'الحبل $[AB]$ ، و $H$ المسقط العمودي لـ $B$ على مستوى $A$ ، و $AH = 2500\\,\\mathrm{m}$.',
  caption: 'المصعد الهوائي',
  analysis: [
    { label: 'قراءة الوضعية وفهمها', text: 'قراءة نصّ المشكلة وفهم معاني المفردات الواردة فيه. فهم الوضعية وتشكيل صورة ذهنية لها. فهم التعليمات وإدراك المهمة المركّبة: التعبير عن تكلفة الرحلة بدلالة المتغيّر (سعر تذكرة الشخص البالغ) تعيين طبيعة الدالة.' },
    { label: 'تحليل الوضعية واختيار استراتيجية حل مناسبة', text: 'يتعلق الجزء الأول من المشكل بتعيين المدة الزمنية التي يستغرقها المصعد للانتقال من A إلى B. لذلك، نحتاج إلى تعيين المسافة AB. استغلال الفرق في الارتفاعين A و B والمعلومات الواردة على الرسم التخطيطي للمكان. في الجزء الثاني، يتعلق الأمر بتعيين عبارة تكلفة الرحلة بالنسبة إلى كلّ العائلة بدلالة سعر تذكرة شخص بالغ. عدة متغيرات يجب اعتبارها، منها تشكيل العائلة، تخفيض سعر التذكرة بالنسبة لكل طفل، حدود إمكانيات العائلة.' },
    { label: 'تنفيذ استراتيجية الحل المختارة', text: 'نوظف مبرهنة فيثاغورس ونمثل بيانيا الدالة الخطية التي ترفق بكل قيمة لـ x تكلفة الرحلة.' },
  ],
  // Les nombres de la situation : la plateforme ne les retape nulle part ailleurs.
  numbers: { altA: 900, altB: 1400, AH: 2500, speed: '5,5', adults: 2, children: 3, discount: 40, budget: 2000 },
};

/**
 * Les nombres de la PLATEFORME pour s'exercer au module 7 (`interactive_example`) — même
 * structure que le manuel, d'autres nombres, pour que les réponses du manuel (AB = 500√26,
 * ≈ 7 min 43,55 s, C(x) = 3,8x, 526 DA) restent celles de « وضعية الاختبار النهائي ».
 *   OTHER_CABLE   un autre téléphérique : 300 m → 800 m, 1200 m à l'horizontale, 5 m/s
 *                 (AB = 1300 m, 260 s = 4 min 20 s — triangle 5-12-13 agrandi 100 fois)
 *   FAMILY        une autre famille : 2 adultes et 2 enfants à −50 % (C(x) = 3x) ;
 *                 1500 DA → 500 DA exactement (niveau مبتدئ du laboratoire), puis 1600 DA → 533 DA.
 */
export const OTHER_CABLE = {
  source: addition('interactive_example'),
  text: 'مصعد هوائي آخر، يفحصه تقنيّوه بإتقان كل صباح، ينطلق من ارتفاع 300m ليصل ارتفاع 800m، والمسافة الأفقية بين نقطتي الانطلاق والوصول 1200m، وسرعته $5\\,\\mathrm{m/s}$.',
  numbers: { altA: 300, altB: 800, AH: 1200, speed: 5 },
};

export const FAMILY = {
  source: addition('interactive_example'),
  text: 'عائلة أخرى، ادّخر أفرادها ميزانية الرحلة بالتعاون، متكوّنة من شخصين بالغين وطفلين، وكلّ طفل يستفيد من تخفيض قدره 50% من قيمة $x$ (سعر تذكرة البالغ).',
  numbers: { adults: 2, children: 2, discount: 50, budget: 1500, budget2: 1600 },
};

/**
 * Les props du laboratoire `origin-line` du module 7, à ses DEUX niveaux — contrat des props
 * du brief de l'unité 6 §6 (manipulations/proportion/OriginLine.jsx, écrit par la leçon 3).
 * Écrites ici une fois : le module les étale, le test de rendu (lab.render.test.jsx) monte le
 * laboratoire avec exactement ces props. Mode `read` : la droite de coût est donnée, l'élève
 * glisse la sonde jusqu'à l'endroit où elle rencontre la ligne du budget (`cap`).
 *   مبتدئ  la famille de la plateforme : C(x) = 3x, budget 1500 DA → 500 DA, sur un nœud.
 *   متقدم  la famille du manuel : C(x) = 3,8x, budget 2000 DA → ≈ 526,3 DA, hors des nœuds.
 */
export const LAB = {
  beginner: { a: '3', mode: 'read', cap: '1500', xMin: '0', xMax: '700', yMin: '0', yMax: '2100', theme: 'budget' },
  advanced: { a: '3,8', mode: 'read', cap: '2000', xMin: '0', xMax: '700', yMin: '0', yMax: '2600', theme: 'budget' },
};

/**
 * Les corrections et les méthodes du module 7 — importées aussi par la carte
 * (knowledgeGraph.js) : une aide de la carte cite la leçon mot pour mot. Toute égalité
 * dans `$…$`. Les exemples chiffrés sont ceux de la PLATEFORME (OTHER_CABLE, FAMILY) :
 * les réponses du manuel n'apparaissent qu'en évaluation.
 */
export const REMARKS = {
  hatab: 'الحبل $[AB]$ وتر المثلث $AHB$ القائم في $H$ : ضلعاه المسافة الأفقية $AH$ والفرق بين الارتفاعين $BH$.',
  pythagore: 'في المصعد الآخر: $BH = 800 - 300 = 500$ و $AB^2 = 1200^2 + 500^2 = 1440000 + 250000 = 1690000$ ، إذن $AB = 1300\\,\\mathrm{m}$.',
  sumWrong: 'نكتب $AB = AH + BH = 1200 + 500 = 1700\\,\\mathrm{m}$.',
  sumWhy: 'الضلعان والوتر لا يُجمعان: مبرهنة فيثاغورس تربط مربّعات الأطوال، والوتر أقصر من مجموع الضلعين.',
  sumRight: '$AB^2 = AH^2 + BH^2$ ، ثم نأخذ الجذر التربيعي: $AB = \\sqrt{1690000} = 1300\\,\\mathrm{m}$.',
  mudda: 'المدة $t = \\dfrac{d}{v}$ : $\\dfrac{1300}{5} = 260$ ، أي $260\\,\\mathrm{s}$ ، و $260 = 4 \\times 60 + 20$ : 4 دقائق و 20 ثانية.',
  tifl: 'طفل يستفيد من تخفيض 50% يدفع $100\\% - 50\\% = 50\\%$ من $x$ ، أي $0{,}5x$.',
  taklifa: 'تكلفة العائلة الأخرى: $C(x) = 2x + 2 \\times 0{,}5x = 3x$ ، دالة خطية معاملها 3.',
  takhfidWrong: 'طفل يستفيد من تخفيض 25% : نكتب تذكرته $0{,}25x$.',
  takhfidWhy: 'العدد $0{,}25x$ هو مقدار التخفيض، لا ما يدفعه الطفل.',
  takhfidRight: 'بعد تخفيض $t\\%$ يدفع الطفل $\\left(1 - \\dfrac{t}{100}\\right)x$ : مع 25% يدفع $0{,}75x$ ؛ ومع 50% وحدها يتساوى المبلغان.',
  mizaniya: 'أكبر سعر هو فاصلة نقطة تقاطع مستقيم التكلفة مع خط الميزانية: $3x = 1500$ ، أي $x = 500$.',
  tadwirWrong: 'مع ميزانية 1600 DA نجد $x = \\dfrac{1600}{3} \\approx 533{,}33$ فنأخذ 534 DA.',
  tadwirWhy: 'السعر 534 DA يجعل التكلفة $3 \\times 534 = 1602$ ، أي أكثر من الميزانية.',
  tadwirRight: 'ندوّر نحو الأسفل: $3 \\times 533 = 1599$ ، فأكبر سعر بالدينار هو 533 DA.',
  notSolvedHere: 'حل وضعية الكتاب كاملا في «وضعية الاختبار النهائي»: هنا قرأنا الوضعية واخترنا الاستراتيجية، ثم طبّقناها على مصعد آخر وعائلة أخرى.',
};
