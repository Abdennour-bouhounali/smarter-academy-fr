/**
 * Les exercices du MANUEL rattachés au درس « المضلعات المنتظمة وتطبيقاتها » (extraction.json → destinations : ex-9
 * « صورة شكل بدوران », ex-13 et ex-14 « المضلعات المنتظمة » p. 159, ex-19 « أتعمّق » p. 161, et ex-15 « أتعمّق » p. 161 en
 * doublon déclaré — sa destination est la synthèse). Énoncés au mot près ; un exercice à plusieurs parties est découpé en
 * une entrée par partie (la première porte l'énoncé). Les figures sont des DONNÉES GeoFigure (content/figures.js) que le
 * module dessine (`figure`). Tous les distracteurs sont faux (calculés ; la confusion qu'ils portent est dite en
 * commentaire). UNE COQUILLE corrigée (extraction › discrepancies) : ex-15 nomme « ABCDEF » le polygone BCDEF (A est le
 * centre de la rotation, donc du pentagone) — le module le dit en une ligne (`correction`).
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_mudalaat-muntazama_P1',
  P2: '4am_mudalaat-muntazama_P2',
  P3: '4am_mudalaat-muntazama_P3',
};

const SECTIONS = { 9: 'صورة شكل بدوران', 13: 'المضلعات المنتظمة', 14: 'المضلعات المنتظمة', 15: 'أتعمّق', 19: 'أتعمّق' };
const PAGES = { 9: 159, 13: 159, 14: 159, 15: 161, 19: 161 };
const E = (n, part) => ({ ...src(`ex-${n}`, PAGES[n], SECTIONS[n], n), ...(part ? { part } : {}) });
const near = (target, tol = 0.006) => (x) => Math.abs(x - target) < tol;

export const EXERCISES = [
  // تمرين 9 — l'image du triangle équilatéral par 45°, et les autres rotations (165° direct, 75° indirect)
  {
    id: 'ex-9-a', source: E(9, '1'), learningPointId: LP.P3, difficulty: 'moyen', figure: 'ex9',
    statement: 'ABC مثلث متقايس الأضلاع مركزه O. 1) أنشئ صورة ABC بالدوران الذي مركزه O وزاويته $45^\\circ$ في الاتجاه المباشر. نسمي A′، B′، C′ صور الرؤوس A، B، C، على الترتيب، بهذا الدّوران. 2) هل يمكن أن يكون المثلث A′B′C′ صورة ABC بدورانات أخرى؟ اشرح.',
    interaction: 'choice',
    question: {
      prompt: '1) ماذا تعرف عن المثلث A′B′C′ ؟',
      options: [
        'متقايس الأضلاع ومركزه O أيضا: $OA\' = OB\' = OC\'$ و $A\'B\' = AB$',
        'متقايس الأضلاع ومركزه A′', // le centre bouge avec la figure : faux, O est le centre de la rotation
        'قائم ومتساوي الساقين', // la rotation conserve les angles : 60°, 60°, 60°
      ],
      correct: 0, cols: 1,
      explain: 'الدوران يحافظ على الأطوال: $A\'B\' = AB$ ، $B\'C\' = BC$ ، $C\'A\' = CA$ ؛ و O صورة نفسها، فـ $OA\' = OA$ … : A′B′C′ متقايس الأضلاع مركزه O.',
    },
  },
  {
    id: 'ex-9-b', source: E(9, '2'), learningPointId: LP.P2, difficulty: 'difficile', figure: 'ex9',
    interaction: 'choice',
    question: {
      prompt: '2) هل يمكن أن يكون المثلث A′B′C′ صورة ABC بدورانات أخرى (المثلث كشكل، دون ترتيب الرؤوس)؟',
      options: [
        'نعم: الدوران الذي مركزه O وزاويته $165^\\circ$ في الاتجاه المباشر، والذي مركزه O وزاويته $75^\\circ$ في الاتجاه غير المباشر',
        'لا: الدوران الذي يحوّل مثلثا إلى مثلث آخر وحيد', // oublie que ABC est sa propre image par (O, 120°)
        'نعم: كل دوران مركزه O', // 30° direct, par exemple, ne donne pas A′B′C′
      ],
      correct: 0, cols: 1,
      explain: 'ABC صورة نفسه بالدوران الذي مركزه O وزاويته $120^\\circ$ (خاصية 3، معارف 5): $45^\\circ + 120^\\circ = 165^\\circ$ في الاتجاه المباشر، و $45^\\circ - 120^\\circ = -75^\\circ$ أي $75^\\circ$ في الاتجاه غير المباشر.',
    },
    commonError: 'نسيان أن المثلث المتقايس الأضلاع صورة نفسه بالدوران الذي مركزه O وزاويته $120^\\circ$ .',
  },
  // تمرين 13 — le décagone
  {
    id: 'ex-13-a', source: E(13, '1'), learningPointId: LP.P2, difficulty: 'moyen', figure: 'ex13',
    statement: 'ABCDEFGHIJ عشاري منتظم مركزه O. احسب القيمة المضبوطة للزاوية $\\widehat{ABC}$ ثم للزاوية $\\widehat{AOB}$ .',
    interaction: 'numeric',
    question: {
      prompt: 'قيس الزاوية $\\widehat{ABC}$ (بالدرجات):',
      expected: 144,
      explain: '$\\widehat{AOB} = \\dfrac{360^\\circ}{10} = 36^\\circ$ ؛ المثلث OAB متساوي الساقين: $\\widehat{OBA} = \\dfrac{180^\\circ - 36^\\circ}{2} = 72^\\circ$ ، و $\\widehat{ABC} = 2 \\times 72^\\circ = 144^\\circ$ (أو $\\dfrac{(10-2) \\times 180^\\circ}{10}$).',
      explainFor: (n) => (n === 36 ? 'هذه الزاوية المركزية $\\widehat{AOB}$ ، لا زاوية العشاري.' : n === 72 ? 'هذه $\\widehat{OBA}$ وحدها: الزاوية $\\widehat{ABC}$ ضعفها.' : n === 18 ? 'قسمت $180^\\circ$ على 10: الزوايا المركزية العشر تملأ $360^\\circ$ .' : null),
    },
    commonError: 'الخلط بين الزاوية المركزية $\\widehat{AOB}$ وزاوية المضلع $\\widehat{ABC}$ .',
  },
  {
    id: 'ex-13-b', source: E(13, '2'), learningPointId: LP.P2, difficulty: 'facile', figure: 'ex13',
    interaction: 'numeric',
    question: {
      prompt: 'قيس الزاوية $\\widehat{AOB}$ (بالدرجات):',
      expected: 36,
      explain: '$\\widehat{AOB} = \\dfrac{360^\\circ}{10} = 36^\\circ$ (خاصية 2).',
      explainFor: (n) => (n === 18 ? 'الزوايا المركزية العشر تملأ دورة كاملة: $360^\\circ$ لا $180^\\circ$ .' : n === 144 ? 'هذه زاوية العشاري $\\widehat{ABC}$ .' : null),
    },
  },
  // تمرين 14 — l'octogone, OA = √8
  {
    id: 'ex-14-a', source: E(14, '1'), learningPointId: LP.P2, difficulty: 'moyen', figure: 'ex14',
    statement: 'ABCDEFGH ثماني منتظم مركزه O حيث $OA = \\sqrt{8}$ (الوحدة هي $\\mathrm{cm}$) 1) عيّن قيس الزاوية $\\widehat{ABC}$ . 2) لماذا (BH) يعامد (OA) في L؟ 3) قارن $\\sin\\widehat{BOL}$ و $\\cos\\widehat{BOL}$ ثم احسب $\\sin 45^\\circ$ و $\\cos 45^\\circ$ . 4) احسب OL و BL. 5) احسب مساحة ABCDEFGH.',
    interaction: 'numeric',
    question: {
      prompt: '1) قيس الزاوية $\\widehat{ABC}$ (بالدرجات):',
      expected: 135,
      explain: '$\\widehat{AOB} = \\dfrac{360^\\circ}{8} = 45^\\circ$ ، و $\\widehat{ABC} = 180^\\circ - 45^\\circ = 135^\\circ$ (أو $\\dfrac{6 \\times 180^\\circ}{8}$).',
      explainFor: (n) => (n === 45 ? 'هذه الزاوية المركزية، لا زاوية الثماني.' : null),
    },
  },
  {
    id: 'ex-14-b', source: E(14, '2'), learningPointId: LP.P1, difficulty: 'moyen', figure: 'ex14',
    interaction: 'choice',
    question: {
      prompt: '2) لماذا (BH) يعامد (OA) في L؟',
      options: [
        '$AB = AH$ (ضلعان) و $OB = OH$ (نصفا قطر): A و O على محور القطعة [BH]، فـ (OA) هو هذا المحور',
        'لأن L منتصف [OA]', // faux : OL = 2 et OA = √8 ≈ 2,83
        'لأن الثماني المنتظم مربع', // faux : huit côtés
      ],
      correct: 0, cols: 1,
      explain: 'نقطتان متساويتا البعد عن B و H تعيّنان محور [BH]: (OA) يعامد (BH) في منتصفها L.',
    },
  },
  {
    id: 'ex-14-c', source: E(14, '3'), learningPointId: LP.P3, difficulty: 'moyen', figure: 'ex14',
    interaction: 'batch',
    question: {
      prompt: '3) في المثلث BOL القائم في L، حيث $\\widehat{BOL} = 45^\\circ$ :',
      rows: [
        { label: 'المقارنة بين $\\sin\\widehat{BOL}$ و $\\cos\\widehat{BOL}$', options: ['متساويان لأن BL = OL', '$\\sin\\widehat{BOL} > \\cos\\widehat{BOL}$', '$\\sin\\widehat{BOL} < \\cos\\widehat{BOL}$'], correct: 0, correction: 'زاويتا المثلث BOL الحادتان $45^\\circ$ : متساوي الساقين، BL = OL، و $\\sin = \\dfrac{BL}{OB} = \\dfrac{OL}{OB} = \\cos$ .' },
        { label: '$\\sin 45^\\circ = \\cos 45^\\circ$', options: ['$\\dfrac{\\sqrt{2}}{2}$', '$\\dfrac{1}{2}$', '$\\dfrac{\\sqrt{3}}{2}$'], correct: 0, correction: 'من $\\sin^2 + \\cos^2 = 1$ و $\\sin = \\cos$ : $2\\sin^2 45^\\circ = 1$ ، $\\sin 45^\\circ = \\dfrac{\\sqrt{2}}{2}$ .' },
      ],
      explain: 'المثلث القائم المتساوي الساقين هو نصف مربع.',
    },
  },
  {
    id: 'ex-14-d', source: E(14, '4'), learningPointId: LP.P3, difficulty: 'moyen', figure: 'ex14',
    interaction: 'numeric',
    question: {
      prompt: '4) احسب الطول OL بالسنتيمتر (وهو يساوي BL).',
      expected: 2,
      explain: '$OL = OB \\times \\cos 45^\\circ = \\sqrt{8} \\times \\dfrac{\\sqrt{2}}{2} = \\dfrac{\\sqrt{16}}{2} = 2$ ، و $BL = OL = 2$ .',
      explainFor: (n) => (Math.abs(n - 2.83) < 0.01 ? 'هذا OA أي نصف القطر $\\sqrt{8}$ : L بين O و A.' : null),
    },
  },
  {
    id: 'ex-14-e', source: E(14, '5'), learningPointId: LP.P3, difficulty: 'difficile', figure: 'ex14',
    interaction: 'choice',
    question: {
      prompt: '5) مساحة الثماني ABCDEFGH:',
      options: [
        '$16\\sqrt{2} \\approx 22{,}63\\,\\mathrm{cm^2}$',
        '$32\\,\\mathrm{cm^2}$', // OB pris comme hauteur du triangle OAB (au lieu de BL)
        '$2\\sqrt{2}\\,\\mathrm{cm^2}$', // l'aire d'UN triangle OAB seulement
      ],
      correct: 0, cols: 1,
      explain: 'ثمانية مثلثات مثل OAB، ارتفاعها BL لأن (BL) يعامد (OA): $8 \\times \\dfrac{1}{2} \\times \\sqrt{8} \\times 2 = 8\\sqrt{8} = 16\\sqrt{2}$ .',
    },
    commonError: 'أخذ [OB] ارتفاعا للمثلث OAB: الارتفاع النازل من B هو [BL] لأن (BL) يعامد (OA).',
  },
  // تمرين 19 — l'hexagone de périmètre 96 m
  {
    id: 'ex-19-a', source: E(19, '1'), learningPointId: LP.P1, difficulty: 'facile', figure: 'ex19',
    statement: 'محيط السداسي المنتظم ABCDEF المقابل هو 96m. 1) أحسب طول ضلع منه. 2) [OH] هو ارتفاع في المثلث المتقايس الأضلاع OBC. - بيّن أنّ $OH = 8\\sqrt{3}$ m. 3) احسب المساحة المضبوطة للمثلث AOB ثم استنتج S مساحة السداسي المنتظم ABCDEF. 4) احسب النسبة $\\dfrac{S}{S\'}$ حيث S′ هي مساحة القرص الذي مركزه O ونصف قطره OA.',
    interaction: 'numeric',
    question: {
      prompt: '1) طول ضلع السداسي بالمتر:',
      expected: 16,
      explain: 'الأضلاع الستة متقايسة: $96 \\div 6 = 16$ ، وهو أيضا نصف قطر الدائرة المحيطة.',
      explainFor: (n) => (n === 48 ? 'قسمت على 2: للسداسي ستة أضلاع.' : null),
    },
  },
  {
    id: 'ex-19-b', source: E(19, '2'), learningPointId: LP.P3, difficulty: 'moyen', figure: 'ex19',
    interaction: 'choice',
    question: {
      prompt: '2) لماذا $OH = 8\\sqrt{3}$ m؟',
      options: [
        'H منتصف [BC] و OB = 16: $OH^2 = 16^2 - 8^2 = 192$ و $\\sqrt{192} = 8\\sqrt{3}$',
        '$OH = \\dfrac{16}{2} = 8$ ثم نضرب في $\\sqrt{3}$ دون سبب', // pas un argument
        'لأن $OH = OB = 16$', // [OH] est plus court que [OB] (côté de l'angle droit)
      ],
      correct: 0, cols: 1,
      explain: 'في المثلث OHB القائم في H (فيثاغورس): $OH^2 = OB^2 - HB^2$ .',
    },
  },
  {
    id: 'ex-19-c', source: E(19, '3'), learningPointId: LP.P3, difficulty: 'moyen', figure: 'ex19',
    interaction: 'choice',
    question: {
      prompt: '3) المساحة المضبوطة S للسداسي:',
      options: [
        '$S = 6 \\times 64\\sqrt{3} = 384\\sqrt{3}\\,\\mathrm{m^2}$',
        '$S = 64\\sqrt{3}\\,\\mathrm{m^2}$', // un seul triangle
        '$S = 6 \\times 128\\sqrt{3} = 768\\sqrt{3}\\,\\mathrm{m^2}$', // le ½ de l'aire du triangle oublié
      ],
      correct: 0, cols: 1,
      explain: 'مساحة AOB $= \\dfrac{16 \\times 8\\sqrt{3}}{2} = 64\\sqrt{3}$ ، والسداسي ستة مثلثات متقايسة.',
    },
  },
  {
    id: 'ex-19-d', source: E(19, '4'), learningPointId: LP.P3, difficulty: 'difficile', figure: 'ex19',
    interaction: 'choice',
    question: {
      prompt: '4) النسبة $\\dfrac{S}{S\'}$ :',
      options: [
        '$\\dfrac{3\\sqrt{3}}{2\\pi} \\approx 0{,}83$',
        '$\\dfrac{3\\sqrt{3}}{\\pi} \\approx 1{,}65$', // > 1 : l'hexagone ne peut pas dépasser son disque
        '$\\dfrac{12\\sqrt{3}}{\\pi} \\approx 6{,}62$', // S′ calculé avec 2πr (le périmètre) au lieu de πr²
      ],
      correct: 0, cols: 1,
      explain: '$S\' = \\pi \\times 16^2 = 256\\pi$ و $\\dfrac{384\\sqrt{3}}{256\\pi} = \\dfrac{3\\sqrt{3}}{2\\pi}$ : السداسي داخل القرص، فالنسبة أصغر من 1.',
    },
  },
  // تمرين 15 (doublon, corrigé) — cinq rotations de 72° autour de A : le pentagone BCDEF
  {
    id: 'ex-15-a', source: E(15, '1'), learningPointId: LP.P3, difficulty: 'difficile', figure: 'ex15', correction: 'ex15',
    statement: 'A و B نقطتان حيث AB = 4cm. C هي صورة B بالدّوران الذي مركزه A و زاويته $72^\\circ$ في الاتجاه المباشر. D هي صورة C، E صورة D و F صورة E بالدوران السابق. 1) احسب FB. 2) برهن أن المضلع BCDEF منتظم. 3) احسب مساحة الدائرة المحيطة بـ BCDEF.',
    interaction: 'numeric',
    question: {
      prompt: '1) احسب FB بالسنتيمتر، مدوّرا إلى 0,01:',
      expected: near(4.70),
      display: '4,70',
      explain: '$4 \\times 72^\\circ = 288^\\circ$ و $5 \\times 72^\\circ = 360^\\circ$ : صورة F هي B، فـ FB ضلع مثل BC. في المثلث المتساوي الساقين ABC: $BC = 2 \\times 4 \\times \\sin 36^\\circ \\approx 4{,}70$ .',
      explainFor: (n) => (n === 4 ? 'هذا AB، نصف القطر: الضلع يساوي نصف القطر في السداسي فقط.' : null),
    },
    commonError: 'أخذ FB مساويا لـ AB = 4: الضلع يساوي نصف القطر في السداسي المنتظم فقط.',
  },
  {
    id: 'ex-15-b', source: E(15, '2'), learningPointId: LP.P1, difficulty: 'moyen', figure: 'ex15',
    interaction: 'choice',
    question: {
      prompt: '2) لماذا BCDEF مضلع منتظم؟',
      options: [
        'رؤوسه على الدائرة التي مركزها A ونصف قطرها 4cm، وزواياه المركزية $\\widehat{BAC} = \\widehat{CAD} = \\ldots = 72^\\circ$ : أضلاعه متقايسة وزواياه متقايسة',
        'لأن أضلاعه متقايسة فقط', // l'égalité des côtés seule ne suffit pas (le losange)
        'لأن ABCDEF مضلع منتظم', // faux : AB = 4 ≠ BC ≈ 4,70 (la coquille du manuel)
      ],
      correct: 0, cols: 1,
      explain: 'الدوران يحافظ على الأطوال والزوايا: كل ضلع صورة الذي قبله، وكل زاوية صورة التي قبلها؛ و A مركز هذا الخماسي المنتظم.',
    },
  },
  {
    id: 'ex-15-c', source: E(15, '3'), learningPointId: LP.P1, difficulty: 'facile', figure: 'ex15',
    interaction: 'choice',
    question: {
      prompt: '3) مساحة الدائرة المحيطة بـ BCDEF:',
      options: [
        '$16\\pi \\approx 50{,}27\\,\\mathrm{cm^2}$',
        '$8\\pi \\approx 25{,}13\\,\\mathrm{cm^2}$', // 2πr : le périmètre
        '$4\\pi \\approx 12{,}57\\,\\mathrm{cm^2}$', // πr
      ],
      correct: 0, cols: 1,
      explain: 'الدائرة المحيطة مركزها A ونصف قطرها AB = 4: $\\pi \\times 4^2 = 16\\pi$ .',
    },
  },
];

/** La ligne « صحّحت المنصّة خطأً مطبعيًا » (extraction › discrepancies, ex-15). */
export const CORRECTIONS = {
  ex15: 'صحّحت المنصّة خطأً مطبعيًا: الكتاب يكتب «المضلع ABCDEF» ، لكن A مركز الدوران فهو مركز الخماسي المنتظم BCDEF ($5 \\times 72^\\circ = 360^\\circ$)، و ABCDEF ليس منتظما ($AB = 4 \\neq BC \\approx 4{,}70$).',
};

export const partsOf = (n) => EXERCISES.filter((ex) => ex.id === `ex-${n}` || ex.id.startsWith(`ex-${n}-`));
export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
