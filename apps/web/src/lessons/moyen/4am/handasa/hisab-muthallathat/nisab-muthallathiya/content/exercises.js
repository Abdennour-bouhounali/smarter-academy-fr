/**
 * Les exercices du MANUEL rattachés au درس « النسب المثلثية لزاوية حادة في مثلث قائم » (extraction.json →
 * destinations : ex-1, 2, 4, 5, 6 p. 122 et ex-9, 10, 12, 14, 15 p. 123). Énoncés au mot près ; un exercice à
 * plusieurs parties est découpé en une entrée par partie (la première porte l'énoncé). Les figures sont des DONNÉES
 * GeoFigure (content/figures.js) que le module dessine (`figure`).
 * Tous les distracteurs sont faux (calculés ; la confusion qu'ils portent est dite en commentaire).
 * ex-15 : le manuel annonce « عمر، ليلى ومختارية » puis attribue la tangente à « رضا » — on garde « رضا » (la liste).
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_nisab-muthallathiya_P1',
  P2: '4am_nisab-muthallathiya_P2',
  P3: '4am_nisab-muthallathiya_P3',
};

const SEC = 'النسب المثلثية - استعمال حاسبة';
const SEC2 = 'البرهان باستعمال النسب المثلثية';
const E = (n, part) => ({ ...src(`ex-${n}`, n <= 6 ? 122 : 123, n >= 12 ? SEC2 : SEC, n), ...(part ? { part } : {}) });
const near = (target, tol = 0.0001) => (x) => Number.isFinite(x) && Math.abs(x - target) <= tol;
const F = (a, b) => `$\\dfrac{${a}}{${b}}$`;

export const EXERCISES = [
  // تمرين 1 — JKL : 7,8 ; 10,4 ; 13
  {
    id: 'ex-1-a', source: E(1, '1'), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'JKL مثلث حيث $JK = 7{,}8\\,\\mathrm{cm}$ ، $JL = 10{,}4\\,\\mathrm{cm}$ ، $KL = 13\\,\\mathrm{cm}$ .',
    interaction: 'choice',
    question: {
      prompt: '1) برهن أن المثلث JKL قائم في J: الحجة هي',
      options: [
        '$7{,}8^2 + 10{,}4^2 = 60{,}84 + 108{,}16 = 169 = 13^2$ ، فحسب عكس خاصية فيثاغورس JKL قائم في J',
        '$7{,}8 + 10{,}4 = 18{,}2 \\neq 13$', // une somme de longueurs ne dit rien de l'angle droit
        'KL أطول الأضلاع الثلاثة، فالمثلث قائم', // nécessaire, pas suffisant
      ],
      correct: 0, cols: 1,
      explain: 'نقارن مربع أطول ضلع بمجموع مربعي الضلعين الآخرين: $169 = 169$ ، والزاوية القائمة تقابل الوتر [KL]، أي في J.',
    },
  },
  {
    id: 'ex-1-b', source: E(1, '2'), learningPointId: LP.P1, difficulty: 'facile',
    interaction: 'batch',
    question: {
      prompt: '2) احسب $\\tan\\widehat{K}$ ، $\\tan\\widehat{L}$ .',
      rows: [
        // 3/4 : la tangente renversée ; 4/5 = JL/KL est le sinus de K
        { label: '$\\tan\\widehat{K}$', options: [F(4, 3), F(3, 4), F(4, 5)], correct: 0, correction: '$\\tan\\widehat{K} = \\dfrac{JL}{JK} = \\dfrac{10{,}4}{7{,}8} = \\dfrac{4}{3}$ (المقابل على المجاور).' },
        // 4/3 : celle de K ; 3/5 = JK/KL est le sinus de L
        { label: '$\\tan\\widehat{L}$', options: [F(3, 4), F(4, 3), F(3, 5)], correct: 0, correction: '$\\tan\\widehat{L} = \\dfrac{JK}{JL} = \\dfrac{7{,}8}{10{,}4} = \\dfrac{3}{4}$ .' },
      ],
      explain: 'بالنسبة إلى K: المقابل [JL] والمجاور [JK]؛ بالنسبة إلى L يتبادلان.',
    },
    commonError: 'استعمال الوتر [KL] في الظل: الظل لا يستعمل الوتر، إنه المقابل على المجاور ($\\dfrac{10{,}4}{13} = \\dfrac{4}{5}$ هو جيب الزاوية K).',
  },
  // تمرين 2 — ABC : 10,5 ; 14 ; 17,5
  {
    id: 'ex-2', source: E(2), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'نفس الأسئلة بالنسبة للمثلث ABC حيث $AB = 10{,}5\\,\\mathrm{cm}$ ، $AC = 14\\,\\mathrm{cm}$ ، $BC = 17{,}5\\,\\mathrm{cm}$ .',
    interaction: 'batch',
    question: {
      prompt: '1) المثلث قائم في رأس، 2) احسب ظلّي الزاويتين الحادتين:',
      rows: [
        { label: 'المثلث قائم في', options: ['A', 'B', 'C'], correct: 0, correction: '$10{,}5^2 + 14^2 = 110{,}25 + 196 = 306{,}25 = 17{,}5^2$ : قائم في A (مقابل أطول ضلع [BC]).' },
        { label: '$\\tan\\widehat{B}$', options: [F(4, 3), F(3, 4), F(4, 5)], correct: 0, correction: '$\\tan\\widehat{B} = \\dfrac{AC}{AB} = \\dfrac{14}{10{,}5} = \\dfrac{4}{3}$ (و $\\dfrac{4}{5}$ هو $\\sin\\widehat{B}$).' },
        { label: '$\\tan\\widehat{C}$', options: [F(3, 4), F(4, 3), F(3, 5)], correct: 0, correction: '$\\tan\\widehat{C} = \\dfrac{AB}{AC} = \\dfrac{10{,}5}{14} = \\dfrac{3}{4}$ .' },
      ],
      explain: 'الزاوية القائمة تقابل أطول ضلع؛ ثم المقابل على المجاور لكل زاوية حادة.',
    },
  },
  // تمرين 4 — ABC : AC = 3,5 ; AB = 3,7 ; BC = 1,2 (dm)
  {
    id: 'ex-4', source: E(4), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'ABC مثلث حيث $AC = 3{,}5\\,\\mathrm{dm}$ ، $AB = 3{,}7\\,\\mathrm{dm}$ ، $BC = 1{,}2\\,\\mathrm{dm}$ . 1) أثبت أن المثلث ABC قائم. 2) احسب كلا من $\\cos\\widehat{A}$ ، $\\sin\\widehat{A}$ ، $\\tan\\widehat{A}$ .',
    interaction: 'batch',
    question: {
      prompt: 'اختر لكل سطر:',
      rows: [
        { label: 'المثلث قائم في', options: ['C', 'A', 'B'], correct: 0, correction: '$3{,}5^2 + 1{,}2^2 = 12{,}25 + 1{,}44 = 13{,}69 = 3{,}7^2$ : الوتر [AB] فالزاوية القائمة في C.' },
        // 12/37 : le sinus ; 37/35 : renversé (> 1)
        { label: '$\\cos\\widehat{A}$', options: [F(35, 37), F(12, 37), F(37, 35)], correct: 0, correction: '$\\cos\\widehat{A} = \\dfrac{AC}{AB} = \\dfrac{35}{37}$ (المجاور على الوتر).' },
        { label: '$\\sin\\widehat{A}$', options: [F(12, 37), F(35, 37), F(12, 35)], correct: 0, correction: '$\\sin\\widehat{A} = \\dfrac{BC}{AB} = \\dfrac{12}{37}$ (المقابل على الوتر).' },
        { label: '$\\tan\\widehat{A}$', options: [F(12, 35), F(35, 12), F(12, 37)], correct: 0, correction: '$\\tan\\widehat{A} = \\dfrac{BC}{AC} = \\dfrac{12}{35}$ (المقابل على المجاور).' },
      ],
      explain: 'نعيّن الوتر أولا (مقابل الزاوية القائمة)، ثم المقابل [BC] والمجاور [AC] بالنسبة إلى A.',
    },
    commonError: 'كتابة $\\cos\\widehat{A} = \\dfrac{AB}{AC}$ : الوتر في مقام جيب التمام دائما، و $\\dfrac{37}{35}$ أكبر من 1 فلا يكون جيب تمام.',
  },
  // تمرين 5 — KBC قائم في B : KB = 14, BC = 17
  {
    id: 'ex-5-a', source: E(5, '1'), learningPointId: LP.P1, difficulty: 'moyen', figure: 'ex5',
    statement: 'المثلث KBC الآتي قائم في B حيث $KB = 14\\,\\mathrm{cm}$ و $BC = 17\\,\\mathrm{cm}$ . تعطى القيمة المضبوطة ثم المدوّر إلى الجزء من 100.',
    interaction: 'choice',
    question: {
      prompt: '1) القيمة المضبوطة للعدد $\\tan\\widehat{CKB}$ هي:',
      options: [F(17, 14), F(14, 17), '$\\dfrac{17}{\\sqrt{485}}$'], // renversée ; le sinus
      correct: 0, cols: 3,
      explain: 'بالنسبة إلى K: المقابل [BC] والمجاور [KB]: $\\tan\\widehat{CKB} = \\dfrac{17}{14} \\approx 1{,}21$ .',
    },
  },
  {
    id: 'ex-5-b', source: E(5, '2'), learningPointId: LP.P1, difficulty: 'moyen',
    interaction: 'choice',
    question: {
      prompt: '2) بعد حساب الوتر $KC = \\sqrt{14^2 + 17^2} = \\sqrt{485}$ ، القيمة المضبوطة للعدد $\\sin\\widehat{CKB}$ هي:',
      options: ['$\\dfrac{17}{\\sqrt{485}}$', '$\\dfrac{14}{\\sqrt{485}}$', '$\\dfrac{\\sqrt{485}}{17}$'], // le cosinus ; renversé (> 1)
      correct: 0, cols: 3,
      explain: '$\\sin\\widehat{CKB} = \\dfrac{BC}{KC} = \\dfrac{17}{\\sqrt{485}}$ (و $\\dfrac{14}{\\sqrt{485}}$ هو جيب التمام).',
    },
  },
  {
    id: 'ex-5-c', source: E(5, '2'), learningPointId: LP.P1, difficulty: 'moyen',
    interaction: 'numeric',
    question: {
      prompt: 'المدوّر إلى الجزء من 100 للعدد $\\cos\\widehat{CKB} = \\dfrac{14}{\\sqrt{485}}$ :',
      expected: near(0.64), display: '0,64',
      explain: '$\\dfrac{14}{\\sqrt{485}} \\approx 0{,}6357$ ، فالمدوّر إلى الجزء من 100 هو $0{,}64$ (و $\\sin\\widehat{CKB} \\approx 0{,}77$).',
      explainFor: (n) => (near(0.63)(n) ? 'هذا مقرّب بالنقصان: الرقم الموالي 5 فالمدوّر هو $0{,}64$ .' : '$\\dfrac{14}{\\sqrt{485}} \\approx 0{,}6357$ ، فالمدوّر إلى الجزء من 100 هو $0{,}64$ .'),
    },
  },
  // تمرين 6 — JSK قائم في S : JK = 10, K = 55°
  {
    id: 'ex-6-a', source: E(6, '1'), learningPointId: LP.P3, difficulty: 'moyen', figure: 'ex6',
    statement: 'JSK مثلث قائم في S حيث $JK = 10\\,\\mathrm{cm}$ (الشكل).',
    interaction: 'choice',
    question: {
      prompt: '1) عيّن القيمة المضبوطة للطول SK.',
      options: ['$SK = 10 \\times \\cos 55^{\\circ}$', '$SK = 10 \\times \\sin 55^{\\circ}$', '$SK = \\dfrac{10}{\\cos 55^{\\circ}}$'], // c'est JS ; division au lieu du produit
      correct: 0, cols: 1,
      explain: 'بالنسبة إلى K: [SK] مجاور و [JK] وتر: $\\cos 55^{\\circ} = \\dfrac{SK}{10}$ ومنه $SK = 10\\cos 55^{\\circ}$ (لا كتابة أبسط منها).',
    },
    commonError: 'كتابة $SK = \\dfrac{10}{\\cos 55^{\\circ}}$ : المجهول SK في البسط فنضرب في جيب التمام، والنتيجة أصغر من الوتر 10.',
  },
  {
    id: 'ex-6-b', source: E(6, '2'), learningPointId: LP.P3, difficulty: 'moyen',
    interaction: 'numeric',
    question: {
      prompt: '2) احسب المدوّر إلى الجزء من 100 للطول SK (بالسنتيمتر).',
      expected: near(5.74), display: '5,74',
      explain: '$SK = 10 \\times \\cos 55^{\\circ} \\approx 5{,}7358$ ، فالمدوّر إلى الجزء من 100 هو $5{,}74$ .',
      explainFor: (n) => (near(8.19, 0.01)(n) ? 'هذا $10 \\times \\sin 55^{\\circ}$ ، أي JS. بالنسبة إلى K المجاور هو [SK]: $SK = 10 \\times \\cos 55^{\\circ} \\approx 5{,}74$ .' : '$SK = 10 \\times \\cos 55^{\\circ} \\approx 5{,}74$ .'),
    },
  },
  // تمرين 9 — BC = 5,2, ABC = 23°
  {
    id: 'ex-9', source: E(9), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'ABC مثلث قائم في A حيث $BC = 5{,}2\\,\\mathrm{cm}$ و $\\widehat{ABC} = 23^{\\circ}$ .',
    interaction: 'numeric',
    question: {
      prompt: 'احسب المدوّر إلى $\\dfrac{1}{10}$ للطول AC (بالسنتيمتر).',
      expected: near(2), display: '2,0',
      explain: 'بالنسبة إلى B: [AC] مقابل و [BC] وتر: $AC = 5{,}2 \\times \\sin 23^{\\circ} \\approx 2{,}03$ ، والمدوّر إلى الجزء من 10 هو $2{,}0$ .',
      explainFor: (n) => (near(4.8, 0.05)(n) ? 'هذا $5{,}2 \\times \\cos 23^{\\circ}$ أي AB. [AC] مقابل للزاوية B: $AC = 5{,}2 \\times \\sin 23^{\\circ} \\approx 2{,}0$ .' : '$AC = 5{,}2 \\times \\sin 23^{\\circ} \\approx 2{,}0$ .'),
    },
    commonError: 'أخذ جيب التمام: [AC] لا يمرّ بالرأس B فهو المقابل، والنسبة التي تجمع المقابل والوتر هي الجيب.',
  },
  // تمرين 10 — cos A = 1,5
  {
    id: 'ex-10', source: E(10), learningPointId: LP.P2, difficulty: 'facile',
    statement: 'أنهت نبيلة حل التمرين الذي اقترحه عليها أستاذ الرياضيات وكتبت $\\cos\\widehat{A} = 1{,}5$ . غير أن زميلتها مريم بيّنت لها خطأ نتيجتها دون إجراءها لأي حساب. ما رأيك أنت؟ اشرح.',
    interaction: 'choice',
    question: {
      prompt: 'ما رأيك؟',
      options: [
        'مريم محقة: جيب تمام زاوية حادة محصور بين 0 و 1 لأن الوتر أطول أضلاع المثلث القائم، و $1{,}5 > 1$',
        'نبيلة محقة: جيب التمام يتجاوز 1 إذا كان الضلع المجاور طويلا', // l'adjacent est toujours plus court que l'hypoténuse
        'لا يمكن الحكم دون معرفة أطوال أضلاع المثلث', // la borne suffit
      ],
      correct: 0, cols: 1,
      explain: 'جيب التمام = المجاور ÷ الوتر، والوتر أطول من المجاور: النسبة أصغر من 1 دائما، فـ 1,5 مستحيل دون أي حساب.',
    },
    commonError: 'الظن أن جيب التمام يمكن أن يتجاوز 1: البسط (المجاور) أصغر دائما من المقام (الوتر).',
  },
  // تمرين 12 — 3, 4, 5
  {
    id: 'ex-12-a', source: E(12, '1'), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'ABC مثلث حيث $AB = 3\\,\\mathrm{cm}$ ، $AC = 4\\,\\mathrm{cm}$ و $BC = 5\\,\\mathrm{cm}$ .',
    interaction: 'choice',
    question: {
      prompt: '1) أثبت أن المثلث ABC قائم في A:',
      options: ['$3^2 + 4^2 = 9 + 16 = 25 = 5^2$', '$3 + 4 + 5 = 12$', '$5 - 4 = 1 \\neq 3$'],
      correct: 0, cols: 1,
      explain: 'حسب عكس خاصية فيثاغورس: $AB^2 + AC^2 = BC^2$ ، فالمثلث قائم في A (مقابل [BC]).',
    },
  },
  {
    id: 'ex-12-b', source: E(12, '2'), learningPointId: LP.P1, difficulty: 'moyen',
    interaction: 'batch',
    question: {
      prompt: '2) احسب:',
      rows: [
        { label: '$\\cos\\widehat{B}$', options: [F(3, 5), F(4, 5), F(5, 3)], correct: 0, correction: '$\\cos\\widehat{B} = \\dfrac{AB}{BC} = \\dfrac{3}{5}$' },
        { label: '$\\sin\\widehat{B}$', options: [F(4, 5), F(3, 5), F(4, 3)], correct: 0, correction: '$\\sin\\widehat{B} = \\dfrac{AC}{BC} = \\dfrac{4}{5}$' },
        { label: '$\\tan\\widehat{B}$', options: [F(4, 3), F(3, 4), F(4, 5)], correct: 0, correction: '$\\tan\\widehat{B} = \\dfrac{AC}{AB} = \\dfrac{4}{3}$' },
        { label: '$\\cos\\widehat{C}$', options: [F(4, 5), F(3, 5), F(5, 4)], correct: 0, correction: '$\\cos\\widehat{C} = \\dfrac{AC}{BC} = \\dfrac{4}{5}$' },
        { label: '$\\sin\\widehat{C}$', options: [F(3, 5), F(4, 5), F(3, 4)], correct: 0, correction: '$\\sin\\widehat{C} = \\dfrac{AB}{BC} = \\dfrac{3}{5}$' },
        { label: '$\\tan\\widehat{C}$', options: [F(3, 4), F(4, 3), F(3, 5)], correct: 0, correction: '$\\tan\\widehat{C} = \\dfrac{AB}{AC} = \\dfrac{3}{4}$' },
      ],
      explain: 'الضلع [AC] مقابل للزاوية B ومجاور للزاوية C، و [AB] بالعكس: لكل زاوية مقابلها ومجاورها.',
    },
    commonError: 'نسخ نسب الزاوية B للزاوية C: المقابل والمجاور يتبادلان بين الزاويتين الحادتين، فـ $\\cos\\widehat{C} = \\sin\\widehat{B}$ .',
  },
  // تمرين 14 — la preuve
  {
    id: 'ex-14-a', source: E(14, '1'), learningPointId: LP.P1, difficulty: 'difficile', figure: 'ex14',
    statement: 'لاحظ الشكل المقابل.',
    interaction: 'choice',
    question: {
      prompt: '1) برهن أن $\\dfrac{AB}{OB} = \\dfrac{EF}{OE}$ :',
      options: [
        'في المثلث OAB القائم في A وفي المثلث OFE القائم في F، كل من النسبتين هي $\\sin\\widehat{O}$ (المقابل على الوتر)',
        'لأن $AB = EF$ و $OB = OE$', // faux : la figure les montre différents
        'لأن المثلثين متقايسان', // ils ne le sont pas (E est deux fois plus loin)
      ],
      correct: 0, cols: 1,
      explain: 'الزاوية $\\widehat{O}$ مشتركة: في OAB المقابل [AB] والوتر [OB]، وفي OFE المقابل [EF] والوتر [OE]. (ويمكن أيضا بخاصية طالس: (AB) // (EF).)',
    },
  },
  {
    id: 'ex-14-b', source: E(14, '2'), learningPointId: LP.P1, difficulty: 'difficile',
    interaction: 'choice',
    question: {
      prompt: '2) برهن أن $\\dfrac{AB}{OA} = \\dfrac{EF}{OF}$ :',
      options: [
        'كل من النسبتين هي $\\tan\\widehat{O}$ (المقابل على المجاور)',
        'كل من النسبتين هي $\\cos\\widehat{O}$', // OA est l'adjacent : AB/OA n'est pas un cosinus
        'لأن $OA = OF$', // faux
      ],
      correct: 0, cols: 1,
      explain: 'في OAB: [AB] مقابل و [OA] مجاور للزاوية O؛ وفي OFE: [EF] مقابل و [OF] مجاور: $\\tan\\widehat{O} = \\dfrac{AB}{OA} = \\dfrac{EF}{OF}$ .',
    },
  },
  // تمرين 15 — عمر، ليلى، رضا
  {
    id: 'ex-15', source: E(15), learningPointId: LP.P1, difficulty: 'moyen', figure: 'ex15',
    statement: 'طلب أستاذ الرياضيات من ثلاثة تلاميذ: عمر، ليلى ورضا الاختيار بين جيب تمام أو الجيب أو الظل لحساب قيس الزاوية $\\widehat{A}$ . عمر: جيب تمام — ليلى: الجيب — رضا: الظل. من الذي أحسن الاختيار؟ اشرح.',
    interaction: 'choice',
    question: {
      prompt: 'من الذي أحسن الاختيار؟',
      options: [
        'ليلى: المعلومان هما [BC] المقابل للزاوية A و [AC] الوتر، والنسبة التي تجمعهما هي الجيب',
        'عمر: جيب التمام يستعمل الوتر [AC]', // il faudrait l'adjacent [AB], inconnu
        'رضا: الظل يستعمل [BC]', // il faudrait aussi l'adjacent [AB], inconnu
      ],
      correct: 0, cols: 1,
      explain: '$\\sin\\widehat{A} = \\dfrac{BC}{AC} = \\dfrac{8{,}4}{10{,}5} = 0{,}8$ . جيب التمام والظل يحتاجان المجاور [AB] وهو غير معلوم.',
    },
    commonError: 'اختيار نسبة تستعمل ضلعا غير معلوم: نختار النسبة التي تجمع الضلعين المعلومين بالنسبة إلى الزاوية المطلوبة.',
  },
];

export const partsOf = (n) => EXERCISES.filter((ex) => ex.id === `ex-${n}` || ex.id.startsWith(`ex-${n}-`));
export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
