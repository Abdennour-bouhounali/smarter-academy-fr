/**
 * Les exercices du MANUEL rattachés au درس 3 « العلاقات بين النسب المثلثية والإنشاءات الهندسية » (extraction.json →
 * destinations : ex-16 … ex-19 p. 123 « العلاقات المثلثية », ex-20 … ex-22 p. 123 « إنشاءات هندسية », ex-30 p. 125
 * « أتعمّق »). Énoncés au mot près. Une construction ne se corrige pas par mots-clés : chaque partie demande le
 * RAISONNEMENT (quel nombre devient l'hypoténuse, où est l'angle, ce que donne la calculatrice) ou une valeur
 * EXACTE (choix dont chaque distracteur est faux : racine oubliée, rapport inversé, somme au lieu des carrés).
 * Les réponses sont celles de l'extraction (`answerSource: computed`).
 */
import { src } from '../../_unit/unitMeta.js';
import { LP } from './textbook.js';

const S = (n, section, page = 123) => src(`ex-${n}`, page, section, n);
const REL = 'العلاقات المثلثية';
const CONS = 'إنشاءات هندسية';

export const EXERCISES = [
  // تمرين 16 — cos x = √2/2
  {
    id: 'ex-16', source: S(16, REL), learningPointId: LP.P2, difficulty: 'facile',
    statement: 'x هو قيس زاوية حادة حيث $\\cos x = \\dfrac{\\sqrt{2}}{2}$ . احسب، بدون استعمال حاسبة، القيمة المضبوطة للعدد $\\sin x$ . استنتج القيمة المضبوطة للعدد $\\tan x$ .',
    interaction: 'batch',
    question: {
      prompt: 'خطوة بخطوة:',
      rows: [
        { label: '$\\sin^2 x = 1 - \\cos^2 x =$', options: ['$\\dfrac{1}{2}$', '$1 - \\dfrac{\\sqrt{2}}{2}$', '$\\dfrac{1}{4}$'], correct: 0,
          correction: '$\\cos^2 x = \\dfrac{2}{4} = \\dfrac{1}{2}$ فـ $\\sin^2 x = 1 - \\dfrac{1}{2} = \\dfrac{1}{2}$ . ($1 - \\dfrac{\\sqrt{2}}{2}$ نسي التربيع.)' },
        { label: '$\\sin x =$', options: ['$\\dfrac{\\sqrt{2}}{2}$', '$\\dfrac{1}{2}$', '$\\dfrac{2}{\\sqrt{2}}$'], correct: 0,
          correction: '$\\sin x = \\sqrt{\\dfrac{1}{2}} = \\dfrac{1}{\\sqrt{2}} = \\dfrac{\\sqrt{2}}{2}$ (موجب). ($\\dfrac{1}{2}$ نسي الجذر، و $\\dfrac{2}{\\sqrt{2}} = \\sqrt{2} > 1$ .)' },
        { label: '$\\tan x = \\dfrac{\\sin x}{\\cos x} =$', options: ['$1$', '$\\dfrac{1}{2}$', '$\\sqrt{2}$'], correct: 0,
          correction: 'البسط والمقام متساويان: $\\tan x = 1$ (إنها الزاوية $45^{\\circ}$ ).' },
      ],
      explain: 'العلاقتان تكفيان: لا حاسبة ولا قيس للزاوية.',
    },
    method: 'من $\\cos^2 x + \\sin^2 x = 1$ نحسب $\\sin^2 x$ ثم نأخذ جذره الموجب، ثم $\\tan x = \\dfrac{\\sin x}{\\cos x}$ .',
    commonError: 'نسيان الجذر: $\\sin^2 x = \\dfrac{1}{2}$ لا يعني $\\sin x = \\dfrac{1}{2}$ .',
  },
  // تمرين 17 — sin x = √3/2
  {
    id: 'ex-17-1', source: { ...S(17, REL), part: '1' }, learningPointId: LP.P2, difficulty: 'facile',
    statement: 'x هو قيس زاوية حادة حيث $\\sin x = \\dfrac{\\sqrt{3}}{2}$ . 1) بدون استعمال حاسبة، عيّن القيمة المضبوطة للعدد $\\cos x$ . 2) استنتج قيمة مقربة للعدد $\\tan x$ تدوّر النتيجة إلى الجزء من 100.',
    interaction: 'choice',
    question: {
      prompt: '1) القيمة المضبوطة للعدد $\\cos x$ :',
      options: ['$\\dfrac{1}{2}$', '$\\dfrac{1}{4}$', '$1 - \\dfrac{\\sqrt{3}}{2}$'],
      correct: 0, cols: 3,
      explain: '$\\cos^2 x = 1 - \\dfrac{3}{4} = \\dfrac{1}{4}$ ، فـ $\\cos x = \\dfrac{1}{2}$ . ($\\dfrac{1}{4}$ هو $\\cos^2 x$ ، و $1 - \\dfrac{\\sqrt{3}}{2}$ يطرح النسبة نفسها بدل مربعها.)',
    },
    commonError: 'كتابة $\\cos x = 1 - \\sin x$ : العلاقة تخص المربعين.',
  },
  {
    id: 'ex-17-2', source: { ...S(17, REL), part: '2' }, learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'numeric',
    question: {
      prompt: '2) المدوّر إلى الجزء من 100 للعدد $\\tan x$ :',
      expected: 1.73, display: '1,73',
      explain: '$\\tan x = \\dfrac{\\frac{\\sqrt{3}}{2}}{\\frac{1}{2}} = \\sqrt{3} \\approx 1{,}7320$ ، والمدوّر إلى الجزء من 100 هو $1{,}73$ .',
    },
  },
  // تمرين 18 — le tableau « إن أمكن »
  {
    id: 'ex-18', source: S(18, REL), learningPointId: LP.P2, difficulty: 'difficile',
    statement: 'x قيس بالدرجات لزاوية حادة. بدون حساب قيمة x، أتمم إن أمكن الجدول الآتي: العمود 1: $\\cos x = 0{,}4$ ؛ العمود 2: $\\sin x = \\dfrac{3}{2}$ ؛ العمود 3: $\\sin x = \\dfrac{\\sqrt{5}}{2}$ .',
    interaction: 'batch',
    question: {
      prompt: 'لكل عمود:',
      rows: [
        { label: 'العمود 1: $\\sin x =$', options: ['$\\dfrac{\\sqrt{21}}{5}$', '$0{,}6$', '$0{,}84$'], correct: 0,
          correction: '$\\sin^2 x = 1 - 0{,}16 = 0{,}84 = \\dfrac{21}{25}$ ، فـ $\\sin x = \\dfrac{\\sqrt{21}}{5}$ . ($0{,}6 = 1 - 0{,}4$ والعلاقة بين المربعين، و $0{,}84$ هو $\\sin^2 x$ .)' },
        { label: 'العمود 1: $\\tan x =$', options: ['$\\dfrac{\\sqrt{21}}{2}$', '$\\dfrac{2}{\\sqrt{21}}$', '$\\dfrac{\\sqrt{21}}{5}$'], correct: 0,
          correction: '$\\tan x = \\dfrac{\\sqrt{21}}{5} \\div \\dfrac{2}{5} = \\dfrac{\\sqrt{21}}{2}$ . ($\\dfrac{2}{\\sqrt{21}}$ هو $\\dfrac{\\cos x}{\\sin x}$ .)' },
        { label: 'العمود 2: $\\sin x = \\dfrac{3}{2}$', options: ['غير ممكن', 'ممكن، و $\\cos x = \\dfrac{\\sqrt{5}}{2}$'], correct: 0,
          correction: '$\\dfrac{3}{2} > 1$ : لا توجد زاوية حادة جيبها أكبر من 1 (الوتر أطول الأضلاع). و $1 - \\dfrac{9}{4} < 0$ فلا جذر أصلًا.' },
        { label: 'العمود 3: $\\sin x = \\dfrac{\\sqrt{5}}{2}$', options: ['غير ممكن', 'ممكن، و $\\cos x = \\dfrac{1}{2}$'], correct: 0,
          correction: '$\\sqrt{5} > 2$ ، فـ $\\dfrac{\\sqrt{5}}{2} \\approx 1{,}118 > 1$ : غير ممكن ( $\\dfrac{5}{4} > 1$ ).' },
      ],
      explain: '« إن أمكن »: قبل الحساب نتأكّد أن الجيب وجيب التمام أصغر من 1.',
    },
    method: 'نتحقّق أولا أنّ $0 < \\sin x < 1$ و $0 < \\cos x < 1$ ، ثم نستعمل $\\cos^2 x + \\sin^2 x = 1$ و $\\tan x = \\dfrac{\\sin x}{\\cos x}$ .',
    commonError: 'حساب $\\cos x$ من $\\sin x = \\dfrac{\\sqrt{5}}{2}$ دون ملاحظة أنه أكبر من 1.',
  },
  // تمرين 19 — le triangle équilatéral de côté 1
  {
    id: 'ex-19', source: S(19, REL), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'ABC مثلث متقايس الأضلاع طول ضلعه 1، [AH] الارتفاع المتعلّق بالضلع [BC]. 1) أنجز شكلا مناسبا. 2) برّر صحة المساواة $\\cos 60^{\\circ} = \\dfrac{1}{2}$ واستنتج أنّ $\\sin 60^{\\circ} = \\dfrac{\\sqrt{3}}{2}$ و $\\tan 60^{\\circ} = \\sqrt{3}$ . 3) ما هو قيس الزاوية $\\widehat{BAH}$ ؟ برّر صحة المساواة $\\sin 30^{\\circ} = \\dfrac{1}{2}$ واستنتج أنّ $\\cos 30^{\\circ} = \\dfrac{\\sqrt{3}}{2}$ و $\\tan 30^{\\circ} = \\dfrac{\\sqrt{3}}{3}$',
    interaction: 'batch',
    question: {
      prompt: 'في المثلث ABH القائم في H :',
      rows: [
        { label: '$BH =$ (الارتفاع في مثلث متقايس الأضلاع متوسط أيضًا)', options: ['$\\dfrac{1}{2}$', '$1$', '$\\dfrac{\\sqrt{3}}{2}$'], correct: 0,
          correction: 'H منتصف [BC] : $BH = \\dfrac{1}{2}$ ، و $\\cos 60^{\\circ} = \\dfrac{BH}{AB} = \\dfrac{1}{2}$ .' },
        { label: 'من $\\cos^2 60^{\\circ} + \\sin^2 60^{\\circ} = 1$ : $\\sin 60^{\\circ} =$', options: ['$\\dfrac{\\sqrt{3}}{2}$', '$\\dfrac{3}{4}$', '$\\dfrac{1}{2}$'], correct: 0,
          correction: '$\\sin^2 60^{\\circ} = 1 - \\dfrac{1}{4} = \\dfrac{3}{4}$ فـ $\\sin 60^{\\circ} = \\dfrac{\\sqrt{3}}{2}$ ($\\dfrac{3}{4}$ هو المربع).' },
        { label: '$\\widehat{BAH} =$', options: ['$30^{\\circ}$', '$60^{\\circ}$', '$45^{\\circ}$'], correct: 0,
          correction: '$180^{\\circ} - 90^{\\circ} - 60^{\\circ} = 30^{\\circ}$ (الارتفاع منصّف أيضًا: $\\dfrac{60^{\\circ}}{2}$ ).' },
        { label: '$\\tan 30^{\\circ} = \\dfrac{\\sin 30^{\\circ}}{\\cos 30^{\\circ}} = \\dfrac{\\frac{1}{2}}{\\frac{\\sqrt{3}}{2}} =$', options: ['$\\dfrac{\\sqrt{3}}{3}$', '$\\sqrt{3}$', '$\\dfrac{\\sqrt{3}}{4}$'], correct: 0,
          correction: '$\\dfrac{1}{\\sqrt{3}} = \\dfrac{\\sqrt{3}}{3}$ . ($\\sqrt{3}$ هو $\\tan 60^{\\circ}$ : نسبة مقلوبة.)' },
      ],
      explain: 'في المثلث ABH : $\\sin 30^{\\circ} = \\dfrac{BH}{AB} = \\dfrac{1}{2}$ — جيب $30^{\\circ}$ هو جيب تمام $60^{\\circ}$ : الزاويتان متتامتان.',
    },
    commonError: 'قلب الظل: $\\tan 30^{\\circ} = \\dfrac{\\sin 30^{\\circ}}{\\cos 30^{\\circ}}$ وليس $\\dfrac{\\cos 30^{\\circ}}{\\sin 30^{\\circ}} = \\sqrt{3}$ .',
  },
  // تمرين 30 (أتعمّق) — le carré de côté 1
  {
    id: 'ex-30', source: S(30, 'أتعمّق', 125), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'ABCD مربع طول ضلعه 1. 1) برّر صحة المساواة $AC = \\sqrt{2}$ . 2) استنتج القيم المضبوطة لكل من $\\cos 45^{\\circ}$ ، $\\sin 45^{\\circ}$ ، $\\tan 45^{\\circ}$ .',
    interaction: 'batch',
    question: {
      prompt: 'في المثلث ABC القائم في B ، و $\\widehat{BAC} = 45^{\\circ}$ :',
      rows: [
        { label: '$AC =$', options: ['$\\sqrt{2}$', '$2$', '$1$'], correct: 0,
          correction: 'خاصية فيثاغورس: $AC^2 = 1^2 + 1^2 = 2$ فـ $AC = \\sqrt{2}$ .' },
        { label: '$\\cos 45^{\\circ} = \\dfrac{AB}{AC} =$', options: ['$\\dfrac{\\sqrt{2}}{2}$', '$\\sqrt{2}$', '$\\dfrac{1}{2}$'], correct: 0,
          correction: '$\\dfrac{1}{\\sqrt{2}} = \\dfrac{\\sqrt{2}}{2}$ . ($\\sqrt{2} > 1$ لا يكون جيب تمام.)' },
        { label: '$\\cos^2 45^{\\circ} + \\sin^2 45^{\\circ} =$', options: ['$1$', '$\\sqrt{2}$', '$\\dfrac{1}{2}$'], correct: 0,
          correction: '$\\dfrac{1}{2} + \\dfrac{1}{2} = 1$ ، و $\\sin 45^{\\circ} = \\dfrac{\\sqrt{2}}{2}$ أيضًا ( $\\dfrac{BC}{AC}$ )، فـ $\\tan 45^{\\circ} = 1$ .' },
      ],
      explain: 'القطر يقسم المربع إلى مثلثين قائمين متساويي الساقين: الزاويتان الحادتان $45^{\\circ}$ .',
    },
  },
  // تمرين 20 — cos = 0,18
  {
    id: 'ex-20', source: S(20, CONS), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'أنشئ، بدون استعمال منقلة، زاوية بحيث جيبها التمام يساوي 0,18. عيّن قيس هذه الزاوية. (بالحاسبة وبالمنقلة). تدوّر النتيجة إلى الدرجة.',
    interaction: 'batch',
    question: {
      prompt: 'الإنشاء:',
      rows: [
        { label: '$0{,}18 =$', options: ['$\\dfrac{9}{50}$', '$\\dfrac{18}{10}$', '$\\dfrac{1}{8}$'], correct: 0,
          correction: '$0{,}18 = \\dfrac{18}{100} = \\dfrac{9}{50}$ (أو $\\dfrac{1{,}8}{10}$ ).' },
        { label: 'ننقل على ضلع للزاوية القائمة', options: ['$1{,}8\\,\\mathrm{cm}$ ، ونرسم دائرة نصف قطرها $10\\,\\mathrm{cm}$ مركزها طرف القطعة', '$1{,}8\\,\\mathrm{cm}$ و $10\\,\\mathrm{cm}$ على الضلعين', '$10\\,\\mathrm{cm}$ ، ونرسم دائرة نصف قطرها $1{,}8\\,\\mathrm{cm}$'], correct: 0,
          correction: 'جيب التمام = المجاور ÷ الوتر: الوتر 10 بالمدور. (على الضلعين نحصل على ظل، ودائرة 1,8 لا تصل إلى الضلع الآخر.)' },
        { label: 'الزاوية x هي التي رأسها', options: ['طرف القطعة (مركز الدائرة)', 'النقطة التي قطعتها الدائرة', 'رأس الزاوية القائمة'], correct: 0,
          correction: 'عند مركز الدائرة الضلع المنقول مجاور والقطعة المرسومة بالمدور وتر: $\\cos x = \\dfrac{1{,}8}{10}$ .' },
      ],
      explain: 'بالحاسبة: $\\cos^{-1} 0{,}18 \\approx 79{,}6^{\\circ}$ ، أي $80^{\\circ}$ مدوّرًا إلى الدرجة.',
    },
    commonError: 'وضع 1,8 و 10 على ضلعي الزاوية القائمة: هكذا نحصل على ظل لا على جيب تمام.',
  },
  {
    id: 'ex-20-2', source: { ...S(20, CONS), part: 'قيس' }, learningPointId: LP.P3, difficulty: 'moyen',
    interaction: 'numeric',
    question: {
      prompt: 'قيس هذه الزاوية مدوّرًا إلى الدرجة (بالحاسبة):',
      expected: 80, display: '80',
      explain: '$\\cos^{-1}(0{,}18) \\approx 79{,}63^{\\circ}$ ، والمدوّر إلى الدرجة $80^{\\circ}$ — وبالمنقلة نقرأ نحو $80^{\\circ}$ .',
    },
  },
  // تمرين 21 — tan = 5,4
  {
    id: 'ex-21', source: S(21, CONS), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'أنشئ، بدون استعمال منقلة، زاوية ظلها يساوي 5,4. تحقق بالحاسبة وبالمنقلة.',
    interaction: 'batch',
    question: {
      prompt: 'الإنشاء:',
      rows: [
        { label: 'على ضلعي زاوية قائمة ننقل', options: ['$5{,}4\\,\\mathrm{cm}$ و $1\\,\\mathrm{cm}$', '$5{,}4\\,\\mathrm{cm}$ على ضلع ودائرة نصف قطرها $1\\,\\mathrm{cm}$', '$5{,}4\\,\\mathrm{cm}$ و $5{,}4\\,\\mathrm{cm}$'], correct: 0,
          correction: '$5{,}4 = \\dfrac{5{,}4}{1}$ (أو $\\dfrac{27}{5}$ ): الظل = المقابل ÷ المجاور، الضلعان كلاهما ضلعا الزاوية القائمة — لا مدور.' },
        { label: 'الزاوية x هي التي', options: ['يقابلها الضلع $5{,}4\\,\\mathrm{cm}$', 'يقابلها الضلع $1\\,\\mathrm{cm}$', 'رأسها رأس الزاوية القائمة'], correct: 0,
          correction: 'المقابل 5,4 والمجاور 1 : $\\tan x = 5{,}4$ . (الزاوية الأخرى ظلها $\\dfrac{1}{5{,}4}$ .)' },
        { label: 'بالحاسبة $\\tan^{-1} 5{,}4 \\approx$', options: ['$79{,}5^{\\circ}$', '$10{,}5^{\\circ}$', '$5{,}4^{\\circ}$'], correct: 0,
          correction: 'قريبة من $80^{\\circ}$ بالمنقلة. ($10{,}5^{\\circ}$ هي الزاوية الأخرى، و $5{,}4$ نسبة لا قيس.)' },
      ],
      explain: 'ظل كبير: الضلع المقابل أطول بكثير من المجاور، فالزاوية قريبة من $90^{\\circ}$ .',
    },
    commonError: 'رسم دائرة: في الظل لا وتر.',
  },
  // تمرين 22 — sin x = 3/5, au dixième
  {
    id: 'ex-22', source: S(22, CONS), learningPointId: LP.P3, difficulty: 'facile',
    statement: 'أنشئ، بدون استعمال منقلة، زاوية قيسها x يحقق $\\sin x = \\dfrac{3}{5}$ . أعط المدوّر إلى الجزء من 10 لهذا القيس. تحقق باستعمال حاسبة ثم بمنقلة.',
    interaction: 'numeric',
    question: {
      prompt: 'ننقل 3 على ضلع زاوية قائمة ونرسم دائرة نصف قطرها 5 مركزها طرف القطعة. المدوّر إلى الجزء من 10 لقيس x (بالحاسبة):',
      expected: 36.9, display: '36,9',
      explain: '$\\sin^{-1}\\left(\\dfrac{3}{5}\\right) \\approx 36{,}87^{\\circ}$ ، والمدوّر إلى الجزء من 10 هو $36{,}9^{\\circ}$ (والمنقلة تقرأ نحو $37^{\\circ}$ ).',
    },
    commonError: 'قراءة الزاوية عند مركز الدائرة: هناك جيب التمام هو $\\dfrac{3}{5}$ لا الجيب.',
  },
];

/** Les parties d'un exercice (ex-17 en a deux, ex-20 deux). */
export const partsOf = (n) => EXERCISES.filter((e) => e.id === `ex-${n}` || e.id.startsWith(`ex-${n}-`));
