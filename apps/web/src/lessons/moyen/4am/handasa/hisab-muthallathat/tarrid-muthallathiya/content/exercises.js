/**
 * Les exercices du MANUEL rattachés au درس 4 « حل مشكلات وترييض وضعيات بتوظيف النسب المثلثية » et rendus au module 3
 * (extraction.json → destinations : ex-13 p. 123 « البرهان باستعمال النسب المثلثية », ex-24, ex-25, ex-28, ex-29 p. 125
 * « أتعمّق » ; ex-26 et ex-27 sont résolus au module 2, content/textbook.js). Énoncés au mot près, un exercice à
 * plusieurs parties découpé en une entrée par partie (la première porte l'énoncé). Réponses : extraction
 * (`answerSource: computed`) ; chaque distracteur est FAUX et sa confusion est dite (calculs : Math.sin/cos/tan en degrés).
 * Les figures sont des DONNÉES GeoFigure (content/figures.js), que le module dessine (`figure`).
 */
import { src } from '../../_unit/unitMeta.js';
import { LP } from './textbook.js';

const S125 = (n, part) => ({ ...src(`ex-${n}`, 125, 'أتعمّق', n), ...(part ? { part } : {}) });
const S123 = (part) => ({ ...src('ex-13', 123, 'البرهان باستعمال النسب المثلثية', 13), ...(part ? { part } : {}) });
const close = (v) => (n) => Number.isFinite(n) && Math.abs(n - v) < 1e-9;

export const EXERCISES = [
  // تمرين 29 — le palmier : h = 10 × tan 36° ≈ 7,3 m
  {
    id: 'ex-29', source: S125(29), learningPointId: LP.P2, difficulty: 'facile', figure: 'ex29',
    statement: 'احسب ارتفاع النخلة باستعمال المعطيات المسجلة على الشكل. (تدوّر النتيجة إلى الجزء $\\dfrac{1}{10}$ ).',
    interaction: 'numeric',
    question: {
      prompt: 'ارتفاع النخلة h بالمتر (مدوّرا إلى الجزء من 10):',
      expected: close(7.3), display: '7,3',
      explain: 'بالنسبة إلى الزاوية $36^{\\circ}$ : المسافة 10 هي المجاور والارتفاع h هو المقابل، فـ $\\tan 36^{\\circ} = \\dfrac{h}{10}$ ومنه $h = 10 \\times \\tan 36^{\\circ} \\approx 7{,}265$ أي $h \\approx 7{,}3\\,\\mathrm{m}$ .',
      explainFor: (n) => (close(13.8)(n) ? 'قسمت على $\\tan 36^{\\circ}$ : المجهول h في البسط، فنضرب ( $h = 10 \\times \\tan 36^{\\circ}$ ).'
        : close(5.9)(n) ? 'هذا $10 \\times \\sin 36^{\\circ}$ : الجيب يحتاج الوتر (خط النظر)، والمعلوم هو المجاور.'
          : close(8.1)(n) ? 'هذا $10 \\times \\cos 36^{\\circ}$ : جيب التمام يربط المجاور بالوتر، لا بالارتفاع.'
            : close(7.2)(n) ? 'بترت $7{,}265$ : المدوّر إلى الجزء من 10 هو $7{,}3$ لأن الرقم الموالي 6 أكبر من 5.'
              : 'المسافة 10 مجاورة للزاوية $36^{\\circ}$ والارتفاع مقابل لها: $h = 10 \\times \\tan 36^{\\circ} \\approx 7{,}3\\,\\mathrm{m}$ .'),
    },
    method: 'نحدّد بالنسبة إلى الزاوية $36^{\\circ}$ المعلوم (المجاور 10) والمطلوب (المقابل h)، فنختار الظل ونضرب.',
    commonError: 'استعمال الجيب ( $10 \\times \\sin 36^{\\circ} \\approx 5{,}9$ ) لأن المطلوب «ارتفاع»: الجيب يحتاج الوتر.',
  },
  // تمرين 24 — le triangle dans un demi-cercle
  {
    id: 'ex-24-1', source: S125(24, '1'), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'ارسم دائرة مركزها O ونصف قطرها 2,5cm. ارسم قطرا [AB]. ضع نقطة C على الدائرة بحيث تبعد عن A بمسافة 3cm. 1) ماهو نوع المثلث ABC؟ علّل إجابتك. 2) احسب أقياس زوايا المثلث ABC.',
    interaction: 'choice',
    question: {
      prompt: '1) المثلث ABC:',
      options: [
        'قائم في C لأنه مرسوم في نصف دائرة قطرها [AB]',
        'قائم في A لأن A طرف القطر',
        'متقايس الساقين لأن OA = OB',
        'قائم في O لأن O مركز الدائرة',
      ],
      correct: 0, cols: 1,
      explain: 'كل مثلث رؤوسه على دائرة وأحد أضلاعه قطر لها قائم في الرأس الثالث: ABC قائم في C. (تحقّق: $AB = 5$ و $BC = 4$ و $3^2 + 4^2 = 25 = 5^2$ .) O ليس رأسا للمثلث، و $OA = OB$ لا يتعلّق بالضلعين [CA] و [CB].',
    },
    commonError: 'استعمال نسبة مثلثية قبل إثبات أن المثلث قائم: النسب المثلثية تُعرَّف في مثلث قائم فقط.',
  },
  {
    id: 'ex-24-2', source: S125(24, '2'), learningPointId: LP.P3, difficulty: 'moyen',
    interaction: 'batch',
    question: {
      prompt: '2) $AB = 2 \\times 2{,}5 = 5\\,\\mathrm{cm}$ و $AC = 3\\,\\mathrm{cm}$ . أقياس زوايا المثلث ABC (مدوّرة إلى الدرجة):',
      rows: [
        { label: '$\\widehat{C}$', options: ['$90^{\\circ}$', '$60^{\\circ}$', '$45^{\\circ}$'], correct: 0,
          correction: 'المثلث مرسوم في نصف دائرة قطرها [AB]: الزاوية في C قائمة.' },
        { label: '$\\widehat{B}$', options: ['$37^{\\circ}$', '$53^{\\circ}$', '$31^{\\circ}$'], correct: 0,
          correction: 'بالنسبة إلى B: AC مقابل و AB وتر، $\\sin\\widehat{B} = \\dfrac{3}{5} = 0{,}6$ ومنه $\\widehat{B} \\approx 36{,}87^{\\circ} \\approx 37^{\\circ}$ ( $53^{\\circ}$ هي الزاوية A، و $31^{\\circ}$ تقرأ $\\tan\\widehat{B} = \\dfrac{3}{5}$ ).' },
        { label: '$\\widehat{A}$', options: ['$53^{\\circ}$', '$37^{\\circ}$', '$59^{\\circ}$'], correct: 0,
          correction: 'الزاويتان الحادتان متتامتان: $90^{\\circ} - 37^{\\circ} = 53^{\\circ}$ (أو $\\cos\\widehat{A} = \\dfrac{3}{5}$ ).' },
      ],
      explain: 'نحلّ المثلث القائم كاملا: الزاوية القائمة، ثم زاوية بنسبة مثلثية، ثم الثالثة بالتتام.',
    },
    method: 'نثبت أن المثلث قائم (نصف دائرة)، ثم $\\sin\\widehat{B} = \\dfrac{AC}{AB}$ ، ثم $\\widehat{A} = 90^{\\circ} - \\widehat{B}$ .',
  },
  // تمرين 25 — le rectangle, 30° en O (lecture : extraction › ex-25 › reading)
  {
    id: 'ex-25-1', source: S125(25, '1'), learningPointId: LP.P1, difficulty: 'moyen', figure: 'ex25',
    statement: 'ABCD مستطيل، طولا قطريه 10cm. يتقاطع القطران في النقطة O (الشكل). 1) احسب قيس الزاوية $\\widehat{OAB}$ . 2) احسب طول وعرض المستطيل ABCD.',
    interaction: 'numeric',
    question: {
      prompt: '1) قيس الزاوية $\\widehat{OAB}$ بالدرجة:',
      expected: close(15), display: '15',
      explain: 'قطرا المستطيل متقايسان ومتناصفان: $OA = OD = 5$ ، فالمثلث AOD متقايس الساقين و $\\widehat{OAD} = \\dfrac{180^{\\circ} - 30^{\\circ}}{2} = 75^{\\circ}$ ، ثم $\\widehat{OAB} = 90^{\\circ} - 75^{\\circ} = 15^{\\circ}$ .',
      explainFor: (n) => (close(75)(n) ? '$75^{\\circ}$ هي الزاوية OAD ؛ والزاوية DAB قائمة، فـ $\\widehat{OAB} = 90^{\\circ} - 75^{\\circ}$ .'
        : close(30)(n) || close(60)(n) ? 'الزاوية $30^{\\circ}$ في O لا في A: نستعمل المثلث المتقايس الساقين AOD ( $OA = OD$ ).'
          : 'المثلث AOD متقايس الساقين: $\\widehat{OAD} = 75^{\\circ}$ ، و $\\widehat{OAB} = 90^{\\circ} - 75^{\\circ} = 15^{\\circ}$ .'),
    },
  },
  {
    id: 'ex-25-2', source: S125(25, '2'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'batch',
    question: {
      prompt: '2) في المثلث ABC القائم في B : الوتر $AC = 10\\,\\mathrm{cm}$ و $\\widehat{BAC} = 15^{\\circ}$ .',
      rows: [
        { label: 'الطول $AB$', options: ['$10 \\cos 15^{\\circ} \\approx 9{,}66\\,\\mathrm{cm}$', '$10 \\sin 15^{\\circ} \\approx 2{,}59\\,\\mathrm{cm}$', '$\\dfrac{10}{\\cos 15^{\\circ}} \\approx 10{,}35\\,\\mathrm{cm}$'], correct: 0,
          correction: 'AB مجاور للزاوية A و AC وتر: $\\cos 15^{\\circ} = \\dfrac{AB}{10}$ . القسمة تعطي طولا أكبر من الوتر، وهذا مستحيل.' },
        { label: 'العرض $BC$', options: ['$10 \\sin 15^{\\circ} \\approx 2{,}59\\,\\mathrm{cm}$', '$10 \\tan 15^{\\circ} \\approx 2{,}68\\,\\mathrm{cm}$', '$10 \\cos 15^{\\circ} \\approx 9{,}66\\,\\mathrm{cm}$'], correct: 0,
          correction: 'BC مقابل للزاوية A و AC وتر: $\\sin 15^{\\circ} = \\dfrac{BC}{10}$ . الظل يربط المقابل بالمجاور، لا بالوتر.' },
      ],
      explain: 'طول المستطيل $AB \\approx 9{,}66\\,\\mathrm{cm}$ وعرضه $AD = BC \\approx 2{,}59\\,\\mathrm{cm}$ ؛ تحقّق: $9{,}66^2 + 2{,}59^2 \\approx 100$ .',
    },
    commonError: 'جعل الزاوية $30^{\\circ}$ في A: هي في O، و $\\widehat{OAB} = 15^{\\circ}$ .',
  },
  // تمرين 28 — le parallélogramme : AH = 2,3 puis les angles
  {
    id: 'ex-28-1', source: S125(28, '2'), learningPointId: LP.P1, difficulty: 'moyen', figure: 'ex28',
    statement: 'ABCD متوازي أضلاع حيث CD = 4,5cm و BC = 2,7cm. [AH] الارتفاع المتعلّق بالضلع [CD]. مساحة ABCD هي 10,35cm². 1) أنجز شكلا باليد الحرة. 2) احسب الارتفاع AH. 3) استنتج قيسي الزاويتين $\\widehat{ADC}$ و $\\widehat{BCD}$ (تدوّر النتيجتان إلى الوحدة).',
    interaction: 'numeric',
    question: {
      prompt: '2) الارتفاع AH بالسنتيمتر:',
      expected: close(2.3), display: '2,3',
      explain: 'مساحة متوازي الأضلاع = القاعدة × الارتفاع: $4{,}5 \\times AH = 10{,}35$ ومنه $AH = \\dfrac{10{,}35}{4{,}5} = 2{,}3\\,\\mathrm{cm}$ .',
      explainFor: (n) => (close(3.83)(n) || close(3.8)(n) ? 'قسمت على BC = 2,7 : الارتفاع [AH] متعلّق بالضلع [CD] الذي طوله 4,5.'
        : close(4.6)(n) || close(4.5)(n) ? 'هذه مساحة مثلث؟ مساحة متوازي الأضلاع هي القاعدة × الارتفاع دون القسمة على 2.'
          : '$4{,}5 \\times AH = 10{,}35$ ومنه $AH = 2{,}3\\,\\mathrm{cm}$ .'),
    },
  },
  {
    id: 'ex-28-2', source: S125(28, '3'), learningPointId: LP.P3, difficulty: 'difficile',
    interaction: 'batch',
    question: {
      prompt: '3) في المثلث ADH القائم في H : $AH = 2{,}3$ و $AD = BC = 2{,}7$ (ضلعان متقابلان).',
      rows: [
        { label: '$\\widehat{ADC}$', options: ['$58^{\\circ}$', '$40^{\\circ}$', '$32^{\\circ}$'], correct: 0,
          correction: 'AH مقابل للزاوية D و AD وتر: $\\sin\\widehat{ADC} = \\dfrac{2{,}3}{2{,}7}$ ومنه $\\widehat{ADC} \\approx 58{,}4^{\\circ} \\approx 58^{\\circ}$ ( $40^{\\circ}$ تجعل 2,7 مجاورا، و $32^{\\circ}$ هي الزاوية DAH).' },
        { label: '$\\widehat{BCD}$', options: ['$122^{\\circ}$', '$58^{\\circ}$', '$32^{\\circ}$'], correct: 0,
          correction: 'زاويتان متتاليتان في متوازي أضلاع متكاملتان: $180^{\\circ} - 58^{\\circ} = 122^{\\circ}$ .' },
      ],
      explain: 'نختار المثلث القائم ADH الذي نعرف فيه ضلعين، ثم ننقل النتيجة إلى متوازي الأضلاع.',
    },
    commonError: 'حساب الزاوية بالقيمة $\\tan\\widehat{ADC} = \\dfrac{2{,}3}{2{,}7}$ : 2,7 هو الوتر AD لا المجاور DH.',
  },
  // تمرين 13 — prouver l'angle droit (réciproques de Pythagore et de Thalès), puis A ≈ 37°
  {
    id: 'ex-13-1', source: S123('1'), learningPointId: LP.P3, difficulty: 'difficile', figure: 'ex13',
    statement: 'إليك شكلا أنجز باليد الحرة. برهن أن (BE) عمودي على (AD). احسب المدوّر إلى الدرجة لقيس الزاوية $\\widehat{A}$ .',
    interaction: 'batch',
    question: {
      prompt: 'البرهان، خطوة خطوة ( $AC = 1{,}25 + 3 = 4{,}25$ و $AD = 2{,}4 + 1 = 3{,}4$ ):',
      rows: [
        { label: 'المثلث ACD قائم في D لأن', options: ['$3{,}4^2 + 2{,}55^2 = 18{,}0625 = 4{,}25^2$', '$3 + 1{,}25 = 4{,}25$', 'الشكل يبدو قائما في D'], correct: 0,
          correction: 'الخاصية العكسية لخاصية فيثاغورس: $11{,}56 + 6{,}5025 = 18{,}0625 = 4{,}25^2$ . المجموع $3 + 1{,}25$ يعطي AC فقط، وشكل باليد الحرة لا يُثبت شيئا.' },
        { label: '(BE) // (CD) لأن', options: ['$\\dfrac{AB}{AC} = \\dfrac{AE}{AD} = \\dfrac{12}{17}$ والنقط بنفس الترتيب', '$\\dfrac{AB}{AD} = \\dfrac{AE}{AC}$', 'BE أقصر من CD'], correct: 0,
          correction: 'الخاصية العكسية لخاصية طالس (الوحدة 9): $\\dfrac{3}{4{,}25} = \\dfrac{2{,}4}{3{,}4} = \\dfrac{12}{17}$ . أما $\\dfrac{3}{3{,}4} \\neq \\dfrac{2{,}4}{4{,}25}$ .' },
        { label: '(BE) ⊥ (AD) لأن', options: ['(BE) // (CD) و (CD) ⊥ (AD)', 'E منتصف [AD]', 'BE = CD'], correct: 0,
          correction: 'إذا توازى مستقيمان فكل مستقيم عمودي على أحدهما عمودي على الآخر. E ليست منتصف [AD] ( $2{,}4 \\neq 1$ ).' },
      ],
      explain: 'لا نستعمل نسبة مثلثية في مثلث قبل أن نثبت أنه قائم.',
    },
    commonError: 'اعتبار المثلث قائما لأن الشكل يبدو كذلك: الشكل منجز باليد الحرة، والزاوية القائمة تُبرهن.',
  },
  {
    id: 'ex-13-2', source: S123('2'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'numeric',
    question: {
      prompt: 'المدوّر إلى الدرجة لقيس الزاوية $\\widehat{A}$ :',
      expected: close(37), display: '37',
      explain: 'في المثلث ACD القائم في D: AD مجاور للزاوية A و AC وتر، $\\cos\\widehat{A} = \\dfrac{3{,}4}{4{,}25} = 0{,}8$ ومنه $\\widehat{A} \\approx 36{,}87^{\\circ} \\approx 37^{\\circ}$ .',
      explainFor: (n) => (close(53)(n) ? '$53^{\\circ}$ هي الزاوية C: بالنسبة إلى A ، [AD] مجاور و [CD] مقابل.'
        : close(36)(n) ? 'بترت $36{,}87$ : المدوّر إلى الدرجة هو 37.'
          : '$\\cos\\widehat{A} = \\dfrac{AD}{AC} = 0{,}8$ (أو $\\tan\\widehat{A} = \\dfrac{2{,}55}{3{,}4} = 0{,}75$ ) فـ $\\widehat{A} \\approx 37^{\\circ}$ .'),
    },
  },
];

/** Les parties d'un exercice (ex-24, ex-25, ex-28, ex-13 en ont deux). */
export const partsOf = (n) => EXERCISES.filter((e) => e.id === `ex-${n}` || e.id.startsWith(`ex-${n}-`));
