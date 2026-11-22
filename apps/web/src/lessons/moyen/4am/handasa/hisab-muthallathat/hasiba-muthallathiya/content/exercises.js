/**
 * Les exercices du MANUEL rattachés au درس « استعمال الحاسبة لحساب النسب المثلثية وتعيين قياس زاوية »
 * (extraction.json → destinations : ex-3, ex-7, ex-8, ex-11 p. 122–123 « النسب المثلثية - استعمال حاسبة », ex-23
 * p. 123, placé par la mise en page sous « إنشاءات هندسية » mais exercice de calculatrice). Énoncés au mot près ;
 * un exercice à plusieurs parties est découpé en une entrée par partie (la première porte l'énoncé). Les figures
 * sont des DONNÉES GeoFigure (content/figures.js) que le module dessine (`figure`).
 * Tous les distracteurs sont faux (calculés ; la confusion qu'ils portent est dite en commentaire).
 * Les programmes de calculatrice sont du code LTR isolé (`key`).
 */
import { src } from '../../_unit/unitMeta.js';
import { key } from './textbook.js';

export const LP = {
  P1: '4am_hasiba-muthallathiya_P1',
  P2: '4am_hasiba-muthallathiya_P2',
  P3: '4am_hasiba-muthallathiya_P3',
};

const E = (n, part) => ({ ...src(`ex-${n}`, n === 3 || n === 7 ? 122 : 123, n === 23 ? 'إنشاءات هندسية' : 'النسب المثلثية - استعمال حاسبة', n), ...(part ? { part } : {}) });
const near = (target, tol = 1e-9) => (x) => Number.isFinite(x) && Math.abs(x - target) <= tol;

export const EXERCISES = [
  // تمرين 3 — 40° : mesurer puis calculer
  {
    id: 'ex-3-a', source: E(3, '1'), learningPointId: LP.P1, difficulty: 'facile',
    statement: '1) أنشئ مثلثا قائما حيث قيس إحدى الزاويتين الحادتين هو $40^{\\circ}$ . اذكر الوسائل التي تستعملها لإنجاز الشكل. 2) بتدوير النتائج إلى الجزء من 100، احسب $\\sin 40^{\\circ}$ ، $\\cos 40^{\\circ}$ ، $\\tan 40^{\\circ}$ أ) باستعمال أقياس أطوال أضلاع المثلث. ب) باستعمال حاسبة. جـ) قارن النتائج المتحصّل عليها، ماذا تستنتج؟',
    interaction: 'choice',
    question: {
      prompt: '1) الوسائل التي نستعملها لإنجاز الشكل:',
      // la calculatrice ne trace rien ; sans rapporteur, 40° ne se construit pas (lesson 3 construit un RAPPORT donné)
      options: ['مسطرة مدرّجة، كوس (للزاوية القائمة) ومنقلة (للزاوية $40^{\\circ}$)', 'مسطرة مدرّجة وحاسبة', 'مسطرة غير مدرّجة ومدور فقط'],
      correct: 0, cols: 1,
      explain: 'الكوس يعطي الزاوية القائمة، والمنقلة تعطي $40^{\\circ}$ ، والمسطرة المدرّجة تقيس الأطوال. الحاسبة لا ترسم شيئا.',
    },
  },
  {
    id: 'ex-3-b', source: E(3, '2'), learningPointId: LP.P1, difficulty: 'facile', figure: 'ex3',
    statement: 'أنشأ تلميذ المثلث ABC القائم في C حيث $\\widehat{A} = 40^{\\circ}$ ، وقاس أضلاعه: $AB = 8\\,\\mathrm{cm}$ ، $AC = 6{,}1\\,\\mathrm{cm}$ ، $BC = 5{,}1\\,\\mathrm{cm}$ .',
    interaction: 'batch',
    question: {
      prompt: '2) ب) باستعمال حاسبة مبرمجة بالدرجة، المدوّر إلى الجزء من 100:',
      rows: [
        // par ligne : la troncature (0,76 ; 0,83), l'excès (0,65), l'autre rapport (0,77 ; 0,64) ou le rapport inversé (1,19)
        { label: '$\\sin 40^{\\circ}$', options: ['$0{,}64$', '$0{,}65$', '$0{,}77$'], correct: 0, correction: '$\\sin 40^{\\circ} = 0{,}6427876097 \\approx 0{,}64$ (الرقم الموالي 2 أصغر من 5)' },
        { label: '$\\cos 40^{\\circ}$', options: ['$0{,}76$', '$0{,}77$', '$0{,}64$'], correct: 1, correction: '$\\cos 40^{\\circ} = 0{,}7660444431 \\approx 0{,}77$ (الرقم الموالي 6: نضيف 1)' },
        { label: '$\\tan 40^{\\circ}$', options: ['$0{,}84$', '$0{,}83$', '$1{,}19$'], correct: 0, correction: '$\\tan 40^{\\circ} = 0{,}8390996312 \\approx 0{,}84$ ( $1{,}19$ هو مقلوبه)' },
      ],
      explain: 'نضغط ' + key('ON') + ' ثم الدالة ثم ' + key('40') + ' ثم ' + key('=') + '، ثم ندوّر إلى الجزء من 100.',
    },
    commonError: 'بتر الشاشة بدل تدويرها: $\\cos 40^{\\circ} = 0{,}766\\ldots$ مدوّره $0{,}77$ لا $0{,}76$ .',
  },
  {
    id: 'ex-3-c', source: E(3, '2'), learningPointId: LP.P1, difficulty: 'moyen',
    interaction: 'choice',
    question: {
      prompt: '2) أ) و جـ) بالقياس: $\\dfrac{BC}{AB} = \\dfrac{5{,}1}{8} \\approx 0{,}64$ ، $\\dfrac{AC}{AB} = \\dfrac{6{,}1}{8} \\approx 0{,}76$ ، $\\dfrac{BC}{AC} = \\dfrac{5{,}1}{6{,}1} \\approx 0{,}84$ . بمقارنتها بنتائج الحاسبة نستنتج:',
      options: [
        'القيم متقاربة جدا: الفرق الصغير ( $0{,}76$ بدل $0{,}77$ ) يأتي من دقة القياس، والنسب لا تتعلق إلا بقيس الزاوية',
        'الحاسبة أخطأت لأن القياس أدقّ منها',
        'النسب تتغير حسب طول الوتر الذي اختاره التلميذ',
      ],
      correct: 0, cols: 1,
      explain: 'القياس بالمسطرة دقيق إلى المليمتر فقط، أما الحاسبة فتعطي عشرة أرقام. لو رسم تلميذ آخر مثلثا أكبر بالزاوية نفسها لوجد النسب نفسها تقريبا.',
    },
  },
  // تمرين 7 — écrire le programme ; ACB ≈ 25°
  {
    id: 'ex-7-a', source: E(7), learningPointId: LP.P2, difficulty: 'moyen', figure: 'ex7',
    statement: 'في الشكل الآتي، احسب القيمة المقربة إلى الوحدة من الدرجة لـ $\\widehat{ACB}$ (اكتب البرنامج الذي تنفذه بالحاسبة).',
    interaction: 'choice',
    question: {
      prompt: 'المجاور للزاوية C هو [CB] والوتر هو [CA]: $\\cos\\widehat{ACB} = \\dfrac{CB}{CA} = \\dfrac{4}{4{,}4}$ . البرنامج الذي ننفذه:',
      // sans 2nd : cos d'un angle de 0,9° ; sin⁻¹ : l'angle dont le SINUS vaut 4/4,4 (65°)
      options: [
        key('ON 2nd cos⁻¹ ( 4 ÷ 4,4 ) ='),
        key('ON cos ( 4 ÷ 4,4 ) ='),
        key('ON 2nd sin⁻¹ ( 4 ÷ 4,4 ) ='),
      ],
      correct: 0, cols: 1,
      explain: 'نعرف جيب تمام الزاوية ونريد قيسها: اللمسة العكسية ' + key('2nd') + ' ثم ' + key('cos⁻¹') + '. بدون ' + key('2nd') + ' نحسب جيب تمام زاوية قيسها 0,9° تقريبا، وبـ ' + key('sin⁻¹') + ' نحصل على الزاوية الأخرى $\\widehat{CAB}$ .',
    },
    commonError: 'نسيان اللمسة ' + key('2nd') + ': ' + key('cos') + ' يحسب نسبة زاوية معلومة، ولا يعيّن زاوية من نسبتها.',
  },
  {
    id: 'ex-7-b', source: E(7), learningPointId: LP.P3, difficulty: 'moyen',
    interaction: 'numeric',
    question: {
      prompt: 'تظهر على الشاشة $24{,}61997733$ . القيمة المقربة إلى الوحدة من الدرجة لـ $\\widehat{ACB}$ :',
      expected: near(25), display: '25',
      explain: 'رقم الأجزاء من 10 هو 6، وهو أكبر من 5: $\\widehat{ACB} \\approx 25^{\\circ}$ .',
      explainFor: (n) => (n === 24 ? 'هذا بتر: الرقم الموالي 6 أكبر من 5، فنضيف 1: $\\widehat{ACB} \\approx 25^{\\circ}$ .' : 'الشاشة $24{,}61997733$ : رقم الأجزاء من 10 هو 6، إذن $\\widehat{ACB} \\approx 25^{\\circ}$ .'),
    },
  },
  // تمرين 8 — DE = 5,6 puis FED ≈ 37°
  {
    id: 'ex-8-a', source: E(8, '1'), learningPointId: LP.P1, difficulty: 'facile', figure: 'ex8',
    statement: 'FDE مثلث قائم في D (الشكل). 1) احسب DE. 2) احسب القيمة المقربة إلى الوحدة لقيس الزاوية $\\widehat{FED}$ .',
    interaction: 'numeric',
    question: {
      prompt: '1) $DE$ بالسنتيمتر:',
      expected: near(5.6), display: '5,6',
      explain: 'حسب خاصية فيثاغورس في المثلث FDE القائم في D: $DE^2 = EF^2 - DF^2 = 49 - 17{,}64 = 31{,}36$ ومنه $DE = \\sqrt{31{,}36} = 5{,}6\\,\\mathrm{cm}$ .',
      explainFor: (n) => (Math.abs(n - 2.8) < 1e-9 ? 'طرحت الطولين دون تربيع: $DE^2 = 7^2 - 4{,}2^2 = 31{,}36$ ومنه $DE = 5{,}6$ .' : '$DE = \\sqrt{7^2 - 4{,}2^2} = \\sqrt{31{,}36} = 5{,}6\\,\\mathrm{cm}$ .'),
    },
  },
  {
    id: 'ex-8-b', source: E(8, '2'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'choice',
    question: {
      prompt: '2) الطولان المعطيان في الشكل هما DF و EF. بالنسبة إلى الزاوية $\\widehat{FED}$ :',
      // DF/EF est le sinus (opposé / hypoténuse) ; DE/EF serait le cosinus, DF/DE la tangente
      options: ['$\\sin\\widehat{FED} = \\dfrac{DF}{EF} = \\dfrac{4{,}2}{7} = 0{,}6$', '$\\cos\\widehat{FED} = \\dfrac{DF}{EF} = 0{,}6$', '$\\tan\\widehat{FED} = \\dfrac{DF}{EF} = 0{,}6$'],
      correct: 0, cols: 1,
      explain: '[DF] يقابل الزاوية E و [EF] هو الوتر: $\\sin\\widehat{FED} = \\dfrac{4{,}2}{7} = 0{,}6$ (ويمكن أيضا استعمال $\\cos\\widehat{FED} = \\dfrac{DE}{EF} = \\dfrac{5{,}6}{7} = 0{,}8$).',
    },
  },
  {
    id: 'ex-8-c', source: E(8, '2'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'numeric',
    question: {
      prompt: '2) القيمة المقربة إلى الوحدة لقيس $\\widehat{FED}$ (بالدرجة):',
      expected: near(37), display: '37',
      explain: key('ON 2nd sin⁻¹ 0,6 =') + ' يعطي $36{,}86989765$ ، إذن $\\widehat{FED} \\approx 37^{\\circ}$ .',
      explainFor: (n) => (n === 53 ? 'هذا قيس الزاوية الأخرى $\\widehat{EFD}$ : استعملت ' + key('cos⁻¹') + ' مع $0{,}6$ . $\\sin\\widehat{FED} = 0{,}6$ يعطي $\\widehat{FED} \\approx 37^{\\circ}$ .' : n === 36 ? 'هذا بتر: $36{,}87$ مدوّره إلى الوحدة $37$ .' : key('ON 2nd sin⁻¹ 0,6 =') + ' يعطي $36{,}86989765$ ، إذن $\\widehat{FED} \\approx 37^{\\circ}$ .'),
    },
    commonError: 'اعتبار $0{,}6$ قيسا للزاوية: هي جيبها، والقيس يُعيَّن باللمسة ' + key('2nd') + ' ثم ' + key('sin⁻¹') + '.',
  },
  // تمرين 11 — TRI : tan R = 2/5, R ≈ 21,8°
  {
    id: 'ex-11-a', source: E(11, '1'), learningPointId: LP.P2, difficulty: 'facile', figure: 'ex11',
    statement: 'TRI هو مثلث قائم في I حيث $IT = 2\\,\\mathrm{cm}$ و $IR = 5\\,\\mathrm{cm}$ . 1) أنجز شكلا باليد الحرة. 2) احسب قيس الزاوية $\\widehat{R}$ . تدوّر النتيجة إلى الجزء من 10.',
    interaction: 'choice',
    question: {
      prompt: '1) الشكل باليد الحرة (أعلاه). بالنسبة إلى الزاوية R، الطولان المعلومان هما المقابل والمجاور:',
      options: ['$\\tan\\widehat{R} = \\dfrac{IT}{IR} = \\dfrac{2}{5} = 0{,}4$', '$\\tan\\widehat{R} = \\dfrac{IR}{IT} = 2{,}5$', '$\\sin\\widehat{R} = \\dfrac{IT}{IR} = 0{,}4$'],
      correct: 0, cols: 1,
      explain: '[IT] يقابل R و [IR] يجاورها، والوتر [TR] غير معلوم: الظل هو النسبة التي تربطهما. ( $\\dfrac{IR}{IT}$ هو ظل الزاوية T.)',
    },
  },
  {
    id: 'ex-11-b', source: E(11, '2'), learningPointId: LP.P3, difficulty: 'moyen',
    interaction: 'numeric',
    question: {
      prompt: '2) قيس $\\widehat{R}$ مدوّرا إلى الجزء من 10 (بالدرجة):',
      expected: near(21.8), display: '21,8',
      explain: key('ON 2nd tan⁻¹ 0,4 =') + ' يعطي $21{,}80140949$ ؛ رقم الأجزاء من 100 هو 0: $\\widehat{R} \\approx 21{,}8^{\\circ}$ .',
      explainFor: (n) => (Math.abs(n - 22) < 1e-9 ? 'هذا المدوّر إلى الوحدة؛ المطلوب الجزء من 10: $\\widehat{R} \\approx 21{,}8^{\\circ}$ .' : Math.abs(n - 68.2) < 1e-9 ? 'هذا قيس الزاوية T: $\\tan\\widehat{R} = \\dfrac{2}{5}$ يعطي $\\widehat{R} \\approx 21{,}8^{\\circ}$ .' : key('ON 2nd tan⁻¹ 0,4 =') + ' يعطي $21{,}80140949$ ، إذن $\\widehat{R} \\approx 21{,}8^{\\circ}$ .'),
    },
  },
  // تمرين 23 — ليلى et رضا : corriger les erreurs ; KML ≈ 56°
  {
    id: 'ex-23-a', source: E(23), learningPointId: LP.P2, difficulty: 'moyen', figure: 'ex23',
    statement: 'طلب أستاذ الرياضيات من تلاميذه حساب قيمة مقربة إلى الوحدة للزاوية $\\widehat{KML}$ اعتمادًا على الشكل الآتي: — ليلى: $\\cos\\widehat{KML} = \\dfrac{MK}{ML}$ ، $\\cos\\widehat{KML} = \\dfrac{5}{9}$ ، $\\widehat{KML} = 0{,}6$ — رضا: KLM قائم في K. $\\tan\\widehat{KML} = \\dfrac{MK}{ML}$ ، $\\tan\\widehat{KML} = \\dfrac{5}{9}$ ، $\\widehat{KML} = 29$ . صوّب الأخطاء المُرتكبة في الإجابتين مع الشرح.',
    interaction: 'choice',
    question: {
      prompt: 'خطأ ليلى:',
      options: [
        'اختيار جيب التمام صحيح، لكن $0{,}6$ هو مدوّر $\\cos\\widehat{KML}$ وليس قيس الزاوية: القيس يُعيَّن باللمسة ' + key('2nd') + ' ثم ' + key('cos⁻¹'),
        'كان عليها أن تستعمل الظل لأن الزاوية K قائمة',
        '$\\dfrac{5}{9}$ خطأ، والصواب $\\dfrac{9}{5}$',
      ],
      correct: 0, cols: 1,
      explain: 'المجاور للزاوية M هو [MK] والوتر هو [ML]: $\\cos\\widehat{KML} = \\dfrac{5}{9} \\approx 0{,}56$ . ليلى كتبت النسبة (مدوّرة) مكان القيس. ( $\\dfrac{9}{5} > 1$ لا يكون جيب تمام زاوية حادة.)',
    },
    commonError: 'كتابة النسبة مكان قيس الزاوية: $\\cos\\widehat{KML} \\approx 0{,}56$ عدد بلا وحدة، والقيس بالدرجة يُعيَّن باللمسة العكسية.',
  },
  {
    id: 'ex-23-b', source: E(23), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'choice',
    question: {
      prompt: 'خطأ رضا:',
      options: [
        '$\\dfrac{MK}{ML}$ هو المجاور على الوتر، أي جيب التمام وليس الظل (الظل هو $\\dfrac{KL}{MK}$ )، كما أن القيس يُكتب بالدرجة',
        'المثلث KLM ليس قائما في K',
        'كان عليه أن يكتب $\\tan\\widehat{KML} = \\dfrac{ML}{MK}$',
      ],
      correct: 0, cols: 1,
      explain: 'الظل = المقابل ÷ المجاور: $\\tan\\widehat{KML} = \\dfrac{KL}{MK}$ ، والطول KL غير معطى. أما $\\dfrac{MK}{ML}$ فهو $\\cos\\widehat{KML}$ . والعدد 29 يأتي من ' + key('tan⁻¹') + ' بنسبة خاطئة.',
    },
  },
  {
    id: 'ex-23-c', source: E(23), learningPointId: LP.P2, difficulty: 'difficile',
    interaction: 'numeric',
    question: {
      prompt: 'التصويب: القيمة المقربة إلى الوحدة لقيس $\\widehat{KML}$ (بالدرجة):',
      expected: near(56), display: '56',
      explain: key('ON 2nd cos⁻¹ ( 5 ÷ 9 ) =') + ' يعطي $56{,}2510114$ ، إذن $\\widehat{KML} \\approx 56^{\\circ}$ .',
      explainFor: (n) => (n === 29 ? 'هذا جواب رضا: $\\dfrac{5}{9}$ ليس ظل الزاوية M بل جيب تمامها. $\\widehat{KML} \\approx 56^{\\circ}$ .' : n === 34 ? 'هذا قيس الزاوية L: استعملت ' + key('sin⁻¹') + '. $\\cos\\widehat{KML} = \\dfrac{5}{9}$ يعطي $\\widehat{KML} \\approx 56^{\\circ}$ .' : key('ON 2nd cos⁻¹ ( 5 ÷ 9 ) =') + ' يعطي $56{,}2510114$ ، إذن $\\widehat{KML} \\approx 56^{\\circ}$ .'),
    },
  },
];

export const partsOf = (n) => EXERCISES.filter((ex) => ex.id === `ex-${n}` || ex.id.startsWith(`ex-${n}-`));
export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
