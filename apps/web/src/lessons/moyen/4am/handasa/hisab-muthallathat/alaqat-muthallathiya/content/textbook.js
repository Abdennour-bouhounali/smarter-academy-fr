/**
 * Le contenu du درس 3 « العلاقات بين النسب المثلثية والإنشاءات الهندسية » (unité 10 « حساب المثلثات في المثلث
 * القائم », manuel pp. 117, 120, 121, 123–125) — données pures (aucun JSX). Chaque bloc porte sa `source` :
 *
 *   act-5             نشاط 5 p. 117 « العلاقات المثلثية » (module 1) — son 1) lit le tableau de نشاط 4 (leçon
 *                     « استعمال الحاسبة »), recopié ici comme le manuel le demande, sous la source act-5 ;
 *   know-4            معارف 4 p. 120 (module 2) — la coquille de l'encadré (« sin²x + sin²x = 1 ») CORRIGÉE en une
 *                     ligne (extraction › know-4 › correction) ;
 *   method-relations  طرائق p. 121 « استعمال العلاقات المثلثية » : cos x = 0,6 (module 3) ;
 *   method-construct  طرائق p. 121 « إنشاء هندسي لزاوية حادة… » : sin x = 2/5, tan x = 7/3 (modules 1 et 3) ;
 *   now-121           دوري الآن p. 121 : sin x = 0,4 ; cos x = 3/4 au laboratoire (module 3) ;
 *   qcm item 6        أؤكّد تعلّماتي p. 124 (module 8, l'إختبار أولي — extraction › destinations › qcm › duplicatedIn).
 * Les exercices ex-16 … ex-22, ex-30 sont dans content/exercises.js.
 *
 * Ce que la plateforme AJOUTE est déclaré : le monde du laboratoire (le cerf-volant, `interaction_generation`),
 * la condition « إن أمكن » formulée (`knowledge_formalization`), le diagnostic « أستعدّ » (`prerequisite_diagnostic`).
 * Les figures sont des DONNÉES GeoFigure (redessinées d'après extraction › figure, jamais une image du manuel).
 */
import { src, addition } from '../../_unit/unitMeta.js';

const PLATFORM = addition('interaction_generation');
const FORMAL = addition('knowledge_formalization');
export const LP = {
  P1: '4am_alaqat-muthallathiya_P1',
  P2: '4am_alaqat-muthallathiya_P2',
  P3: '4am_alaqat-muthallathiya_P3',
};

/* ── l'entrée : le cerf-volant sur la plage (plateforme) ──────────────────────── */

export const KITE = {
  source: PLATFORM,
  headline: 'طائرة ورقية على شاطئ سيدي فرج',
  text: 'يوم ريح على الشاطئ: يمسك أنيس خيط طائرته الورقية التي صنعها بنفسه بإتقان، والخيط مشدود. الخيط هو وتر مثلث قائم، وارتفاع الطائرة ضلعه الشاقولي، والمسافة على الرمل ضلعه الأفقي.',
  question: 'كيف نرسم، دون منقلة، زاوية الخيط إذا عرفنا جيبها فقط؟ وماذا يربط بين جيب الزاوية وجيب تمامها وظلها في المثلث الذي نرسمه؟',
};

/** Les laboratoires (angle-compass) ; leurs nombres sont ceux de levels.js (paire du type). */
export const LAB = {
  m1: {
    beginner: { targets: [{ ratio: 'sin', value: '3/5' }], theme: 'kite', title: 'على الشاطئ: زاوية جيبها 3 على 5' },
    advanced: { targets: [{ ratio: 'sin', value: '2/5' }, { ratio: 'tan', value: '7/3' }], theme: 'kite', title: 'طرائق ص 121: جيبها 2 على 5 ، ثم ظلها 7 على 3' },
  },
  // دوري الآن ص 121 (2) : cos x = 3/4 — le même instrument posé seul (un seul niveau)
  m3: { targets: [{ ratio: 'cos', value: '3/4' }], theme: 'kite', title: 'دوري الآن: زاوية جيب تمامها 3 على 4' },
};

/* ── module 1 : نشاط 5 ──────────────────────────────────────────────────────── */

/** نشاط 5 (p. 117), au mot près (les degrés écrits $30^{\circ}$). */
export const ACT5 = {
  source: src('act-5', 117, 'أنشطة', 5),
  title: 'العلاقات المثلثية',
  part1: 'أ) باستعمال الجدول الوارد في النشاط السابق، انقل ثمّ أتمم: $\\dfrac{\\sin 30^{\\circ}}{\\cos 30^{\\circ}} = \\ldots$ و $(\\cos 30^{\\circ})^2 + (\\sin 30^{\\circ})^2 = \\ldots$ ؛ $\\dfrac{\\sin 45^{\\circ}}{\\cos 45^{\\circ}} = \\ldots$ و $(\\cos 45^{\\circ})^2 + (\\sin 45^{\\circ})^2 = \\ldots$ ؛ $\\dfrac{\\sin 60^{\\circ}}{\\cos 60^{\\circ}} = \\ldots$ و $(\\cos 60^{\\circ})^2 + (\\sin 60^{\\circ})^2 = \\ldots$ ب) ضع تخمينا حول النتائج السابقة.',
  part2: 'ABC مثلث قائم في A، ليكن x قيسا للزاوية $\\widehat{B}$ . أ) عبّر عن $\\cos x$ ، $\\sin x$ ، $\\tan x$ بدلالة أطوال أضلاع المثلث ABC. ب) اكتب المساواة التي تعبّر عن خاصيّة فيثاغورس في هذا المثلث. جـ) أثبت أنّ $(\\cos x)^2 + (\\sin x)^2 = 1$ . د) أثبت أنّ $\\tan x = \\dfrac{\\sin x}{\\cos x}$',
  // le tableau de نشاط 4 (المدوّر إلى الجزء من 100), tel que l'élève l'a rempli à la leçon précédente
  table: [
    { deg: 30, cos: '0{,}87', sin: '0{,}50', tan: '0{,}58' },
    { deg: 45, cos: '0{,}71', sin: '0{,}71', tan: '1{,}00' },
    { deg: 60, cos: '0{,}50', sin: '0{,}87', tan: '1{,}73' },
  ],
  // ABC قائم في A, x = l'angle B
  figure: {
    points: { A: [0, 0], B: [4, 0], C: [0, 3] },
    segments: [['A', 'B'], ['A', 'C'], { from: 'B', to: 'C', bold: true }],
    rightAngles: [['B', 'A', 'C']],
    angles: [{ at: 'B', from: 'C', to: 'A', label: 'x' }],
    labels: { A: 'sw', B: 'se', C: 'n' },
    ariaLabel: 'مثلث ABC قائم في A، وتره [BC]، و x قيس الزاوية B',
    maxWidth: 300,
  },
};

/** La table de نشاط 4 en LaTeX (un tableau KaTeX, dans une île LTR). */
export const TABLE_TEX = `\\begin{array}{|c|c|c|c|}\\hline x & \\cos x & \\sin x & \\tan x \\\\ \\hline ${ACT5.table.map((r) => `${r.deg}^{\\circ} & ${r.cos} & ${r.sin} & ${r.tan}`).join(' \\\\ \\hline ')} \\\\ \\hline \\end{array}`;

/* ── module 2 : معارف 4 ────────────────────────────────────────────────────── */

/** معارف 4 (p. 120) — l'encadré CORRIGÉ, la remarque et l'exemple 60°, au mot près. */
export const KNOW4 = {
  source: src('know-4', 120, 'معارف', 4),
  title: 'العلاقات المثلثية',
  property: 'من أجل كل x زاوية حادّة في مثلث قائم فإنّ: 1) $\\tan x = \\dfrac{\\sin x}{\\cos x}$ 2) $\\cos^2 x + \\sin^2 x = 1$',
  correction: 'صحّحت المنصّة خطأً مطبعيًا في الإطار: طُبع $\\sin^2 x + \\sin^2 x = 1$ والصحيح $\\cos^2 x + \\sin^2 x = 1$ ، كما في الملاحظة والمثال.',
  remark: 'ملاحظة: الكتابة $\\sin^2 x + \\cos^2 x = 1$ تعني $(\\sin x)^2 + (\\cos x)^2 = 1$',
  example: [
    'مثال: $\\cos 60^{\\circ} = \\dfrac{1}{2}$ و $\\sin 60^{\\circ} = \\dfrac{\\sqrt{3}}{2}$ ،',
    '$\\tan 60^{\\circ} = \\dfrac{\\frac{\\sqrt{3}}{2}}{\\frac{1}{2}} = \\sqrt{3}$ ،',
    '$(\\cos 60^{\\circ})^2 + (\\sin 60^{\\circ})^2 = \\left(\\dfrac{1}{2}\\right)^2 + \\left(\\dfrac{\\sqrt{3}}{2}\\right)^2 = \\dfrac{1}{4} + \\dfrac{3}{4} = 1$',
  ],
  // extraction › figure : la droite à gauche, l'angle de 60° en bas à droite ; hypoténuse 2, adjacent 1, opposé √3
  figure: {
    points: { C: [0, 0], B: [1, 0], A: [0, 1.732] },
    segments: [{ from: 'C', to: 'B', label: '1' }, { from: 'C', to: 'A', label: '√3' }, { from: 'A', to: 'B', label: '2', bold: true }],
    rightAngles: [['B', 'C', 'A']],
    angles: [{ at: 'B', from: 'A', to: 'C', label: '60°' }],
    labels: { A: 'n', B: 'se', C: 'sw' },
    ariaLabel: 'مثلث قائم وتره 2، والضلع المجاور للزاوية التي قيسها 60 درجة طوله 1، والضلع المقابل لها طوله جذر 3',
    maxWidth: 220,
  },
};

/* ── module 3 : طرائق ───────────────────────────────────────────────────────── */

/** طرائق (p. 121) — « استعمال العلاقات المثلثية », au mot près. */
export const METHOD_REL = {
  source: src('method-relations', 121, 'طرائق'),
  title: 'استعمال العلاقات المثلثية',
  exercise: 'x هو قيس زاوية حادة حيث $\\cos x = 0{,}6$ . احسب القيمة المضبوطة للعدد $\\sin x$ . استنتج عندئذ القيمة المضبوطة للعدد $\\tan x$ . أعط المدوّر إلى الجزء من 100 للعدد $\\tan x$ .',
  solution: [
    'نعلم أن $\\cos^2 x + \\sin^2 x = 1$ إذن $\\sin^2 x = 1 - \\cos^2 x$ . لكن $\\cos x = 0{,}6$ بالتالي $\\sin^2 x = 1 - 0{,}36$ أي $\\sin^2 x = (0{,}8)^2$ .',
    'إذن $\\sin x = 0{,}8$ ($\\sin x$ عدد موجب).',
    'لدينا $\\tan x = \\dfrac{\\sin x}{\\cos x}$ إذن $\\tan x = \\dfrac{0{,}8}{0{,}6} = \\dfrac{4}{3}$ أي $\\tan x = \\dfrac{4}{3}$ .',
    'لدينا $\\dfrac{4}{3} \\simeq 1{,}33333\\ldots$ إذن المدوّر إلى الجزء من 100 للعدد $\\tan x$ هو 1,33.',
  ],
};

/** طرائق (p. 121) — « إنشاء هندسي لزاوية حادة علمت القيمة المضبوطة لإحدى نسبها المثلثية », au mot près. */
export const METHOD_CONSTRUCT = {
  source: src('method-construct', 121, 'طرائق'),
  title: 'إنشاء هندسي لزاوية حادة علمت القيمة المضبوطة لإحدى نسبها المثلثية',
  ex1: {
    exercise: 'تمرين 1: أنشئ، بدون استعمال منقلة زاوية قيسها x حيث $\\sin x = \\dfrac{2}{5}$ . تحقق بحاسبة ثم بمنقلة.',
    solution: [
      'نعتبر وحدة الطول (السنتيمتر مثلا).',
      'ننشئ زاوية قائمة $\\widehat{AOB}$ رأسها O.',
      'نعيّن على أحد ضلعيها النقطة A حيث $OA = 2\\,\\mathrm{cm}$ . نرسم الدائرة التي مركزها A ونصف قطرها $5\\,\\mathrm{cm}$ تقطع هذه الدائرة الضلع الثاني لهذه الزاوية في النقطة B.',
      'في المثلث AOB القائم في O، لدينا: $\\sin\\widehat{B} = \\dfrac{OA}{AB} = \\dfrac{2}{5}$ . إذن $x = \\widehat{B}$ .',
      'عند التحقق بحاسبة نجد $\\widehat{B} \\simeq 23{,}6^{\\circ}$ ، وبالمنقلة نجد $\\widehat{B} = 24^{\\circ}$ .',
    ],
    // extraction › figure : O en bas à gauche, A à droite (OA = 2), B au-dessus de O ; AB = 5
    figure: {
      points: { O: [0, 0], A: [2, 0], B: [0, 4.583] },
      segments: [{ from: 'O', to: 'A', label: '2cm' }, ['O', 'B'], { from: 'A', to: 'B', label: '5cm', tone: 'violet', bold: true }],
      rightAngles: [['A', 'O', 'B']],
      angles: [{ at: 'B', from: 'A', to: 'O', label: 'x' }],
      labels: { O: 'sw', A: 'se', B: 'n' },
      ariaLabel: 'مثلث AOB قائم في O، الضلع OA طوله 2 سنتيمتر، والوتر AB طوله 5 سنتيمتر رسم بالمدور، و x قيس الزاوية B',
      maxWidth: 220,
    },
  },
  ex2: {
    exercise: 'تمرين 2: أنشئ، بدون استعمال منقلة الزاوية التي قيسها x حيث $\\tan x = \\dfrac{7}{3}$ . تحقق بحاسبة ثم بمنقلة.',
    solution: [
      'نضع وحدة الطول هي 1cm.',
      'ننشئ زاوية قائمة $\\widehat{MNP}$ رأسها N.',
      'نعيّن على الضلعين النقطتين M و P حيث $MN = 7\\,\\mathrm{cm}$ و $NP = 3\\,\\mathrm{cm}$ (نستعمل مسطرة مدرّجة مدور).',
      'في المثلث MNP القائم في N، لدينا: $\\tan\\widehat{P} = \\dfrac{NM}{NP} = \\dfrac{7}{3}$ . إذن $x = \\widehat{P}$ .',
      'عند التحقق بحاسبة نجد $\\widehat{P} \\simeq 66{,}8^{\\circ}$ ، وبالمنقلة نجد $\\widehat{P} = 67^{\\circ}$ .',
    ],
    // extraction › figure : N en bas à gauche, P au-dessus (NP = 3), M à droite (MN = 7)
    figure: {
      points: { N: [0, 0], P: [0, 3], M: [7, 0] },
      segments: [{ from: 'N', to: 'P', label: '3cm' }, { from: 'N', to: 'M', label: '7cm' }, ['P', 'M']],
      rightAngles: [['M', 'N', 'P']],
      angles: [{ at: 'P', from: 'M', to: 'N', label: 'x' }],
      labels: { N: 'sw', P: 'n', M: 'se' },
      ariaLabel: 'مثلث MNP قائم في N، الضلع NP طوله 3 سنتيمتر والضلع NM طوله 7 سنتيمتر، و x قيس الزاوية P',
      maxWidth: 320,
    },
  },
};

/** دوري الآن (p. 121), au mot près ; ses réponses sont CALCULÉES (extraction › now-121 › answer). */
export const NOW = {
  source: src('now-121', 121, 'دوري الآن'),
  item1: 'x هو قيس زاوية حادة حيث $\\sin x = 0{,}4$ . احسب القيمة المضبوطة للعدد $\\cos x$ . أعط المدوّر إلى الجزء من 100 للعدد $\\cos x$ . استنتج المدوّر إلى الجزء من 100 للعدد $\\tan x$ .',
  item2: 'أنشئ، بدون استعمال منقلة، الزاوية التي قيسها x حيث $\\cos x = \\dfrac{3}{4}$ . تحقق بحاسبة ثم بمنقلة.',
};

/** « إن أمكن » — la condition FORMULÉE par la plateforme (معارف 1 du درس 1 : 0 < sin < 1 ; تمرين 18). */
export const POSSIBLE = {
  source: FORMAL,
  lines: [
    'قبل أن نحسب نسبة من أخرى نتأكّد أنها ممكنة: جيب زاوية حادة وجيب تمامها محصوران تمامًا بين 0 و 1 (الوتر أطول الأضلاع)، وظلها عدد موجب.',
    'إذا كان $\\sin x > 1$ أو $\\cos x > 1$ فلا توجد زاوية حادة بهذه النسبة: لا نحسب شيئًا.',
  ],
};

/* ── module 8 : l'item 6 de « أؤكّد تعلّماتي » (p. 124) ────────────────────── */

export const QCM6 = {
  source: src('qcm', 124, 'أؤكّد تعلّماتي', 6),
  text: 'من أجل كل قيس زاوية حادة في مثلث قائم، لدينا:',
  options: ['$\\cos^2 x = \\sin^2 x - 1$', '$\\cos^2 x = 1 - \\sin^2 x$', '$\\cos x = 1 - \\sin x$'],
  correct: 1,
};

/* ── module 0 : « أستعدّ » (plateforme — le manuel n'a pas d'item pour cette leçon) ─────────── */

/**
 * Six affirmations, une par acquis : Pythagore (fithaghuris), le carré d'une fraction (murabba-kasr), le carré d'un
 * quotient avec racine (murabba-jadhr), la racine d'un quotient (tabsit-jadhr), les définitions du درس 1
 * (taarif-nisab), les bornes du sinus (hasr-nisab, درس 1). Aucune n'utilise les nombres des modules (3/5, 2/5,
 * 7/3, 0,6, 0,4, 3/4).
 */
export const PREP_ITEMS = [
  { skill: 'fithaghuris', text: 'مثلث قائم ضلعا زاويته القائمة 5 و 12 : طول وتره 13.', answer: true, why: 'حسب خاصية فيثاغورس: $5^2 + 12^2 = 25 + 144 = 169 = 13^2$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'murabba', text: '$\\left(\\dfrac{2}{7}\\right)^2 = \\dfrac{4}{7}$', answer: false, why: 'نربّع البسط والمقام: $\\left(\\dfrac{2}{7}\\right)^2 = \\dfrac{2^2}{7^2} = \\dfrac{4}{49}$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'jadhr', text: '$\\left(\\dfrac{\\sqrt{5}}{3}\\right)^2 = \\dfrac{5}{9}$', answer: true, why: '$(\\sqrt{5})^2 = 5$ و $3^2 = 9$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'tabsit', text: '$\\sqrt{\\dfrac{5}{36}} = \\dfrac{5}{6}$', answer: false, why: '$\\sqrt{\\dfrac{5}{36}} = \\dfrac{\\sqrt{5}}{\\sqrt{36}} = \\dfrac{\\sqrt{5}}{6}$ : الجذر يبقى على 5.', source: addition('prerequisite_diagnostic') },
  { skill: 'taarif', text: 'في المثلث RST القائم في S : $\\tan\\widehat{R} = \\dfrac{ST}{RS}$', answer: true, why: 'الضلع المقابل للزاوية R هو [ST] والمجاور لها هو [RS] ، والظل = المقابل ÷ المجاور.', source: addition('prerequisite_diagnostic') },
  { skill: 'hasr', text: 'يمكن أن يكون جيب زاوية حادة في مثلث قائم مساويًا لـ 1,2 .', answer: false, why: 'الجيب = المقابل ÷ الوتر، والوتر أطول أضلاع المثلث القائم: الجيب محصور بين 0 و 1.', source: addition('prerequisite_diagnostic') },
];

/* ── ce que la مذكرة du professeur lit comme « وضعية الانطلاق » ────────────────────── */

export const ACTIVITY = {
  source: ACT5.source,
  title: 'نشاط 5 — العلاقات المثلثية (والطائرة الورقية)',
  text: KITE.text,
  questions: [
    'في المثلث الذي أنشأته لزاوية جيبها $\\dfrac{3}{5}$ ، ما جيب تمامها؟',
    'باستعمال جدول النشاط 4: احسب $\\dfrac{\\sin 30^{\\circ}}{\\cos 30^{\\circ}}$ و $(\\cos 30^{\\circ})^2 + (\\sin 30^{\\circ})^2$ وضع تخمينا.',
    'أثبت أنّ $(\\cos x)^2 + (\\sin x)^2 = 1$ و $\\tan x = \\dfrac{\\sin x}{\\cos x}$ باستعمال خاصية فيثاغورس.',
  ],
  closing: 'في كل مثلث قائم ومن أجل كل زاوية حادة x : $\\cos^2 x + \\sin^2 x = 1$ و $\\tan x = \\dfrac{\\sin x}{\\cos x}$ .',
};

/* ── les phrases que les modules écrivent (la carte des connaissances les cite) ─────────── */

export const LINES = {
  table: 'بقيم الجدول المدوّرة: $0{,}87^2 + 0{,}50^2 = 1{,}0069$ و $0{,}71^2 + 0{,}71^2 = 1{,}0082$ : قريبان جدًا من 1، والفرق سببه التدوير — لذلك نحتاج إلى برهان.',
  conjecture: 'التخمين: من أجل كل زاوية حادة x ، $\\dfrac{\\sin x}{\\cos x} = \\tan x$ و $(\\cos x)^2 + (\\sin x)^2 = 1$ .',
  proofSquares: '$(\\cos x)^2 + (\\sin x)^2 = \\dfrac{AB^2}{BC^2} + \\dfrac{AC^2}{BC^2} = \\dfrac{AB^2 + AC^2}{BC^2} = \\dfrac{BC^2}{BC^2} = 1$ (خاصية فيثاغورس: $BC^2 = AB^2 + AC^2$).',
  proofTan: '$\\dfrac{\\sin x}{\\cos x} = \\dfrac{AC}{BC} \\times \\dfrac{BC}{AB} = \\dfrac{AC}{AB} = \\tan x$ : الوتر يختزل.',
  sumWrong: 'نكتب $\\cos x + \\sin x = 1$ ، أي نجمع النسبتين بدل مربعيهما.',
  sumWhy: 'في المثلث 3 و 4 و 5 : $\\dfrac{4}{5} + \\dfrac{3}{5} = \\dfrac{7}{5}$ ، أما $\\dfrac{16}{25} + \\dfrac{9}{25} = 1$ : خاصية فيثاغورس تخص مربعات الأطوال.',
  sumRight: 'العلاقة تخص المربعين: $\\cos^2 x + \\sin^2 x = 1$ .',
  rootWrong: 'من $\\cos x = 0{,}6$ نكتب $\\sin x = 1 - 0{,}6 = 0{,}4$ .',
  rootWhy: 'العلاقة بين المربعين لا بين النسبتين: $0{,}6^2 + 0{,}4^2 = 0{,}52$ وليس 1.',
  rootRight: '$\\sin^2 x = 1 - \\cos^2 x = 1 - 0{,}36 = 0{,}64$ ثم $\\sin x = \\sqrt{0{,}64} = 0{,}8$ (عدد موجب).',
  legsWrong: 'لإنشاء زاوية جيبها $\\dfrac{2}{5}$ ننقل 2 و 5 على ضلعي الزاوية القائمة.',
  legsWhy: 'هكذا يكون $\\dfrac{2}{5}$ ظل الزاوية لا جيبها: الزاوية نحو $21{,}8^{\\circ}$ بدل $23{,}6^{\\circ}$ .',
  legsRight: 'مقام الجيب هو الوتر: ننقل 2 على ضلع للزاوية القائمة ونرسم بالمدور دائرة نصف قطرها 5 مركزها طرف القطعة.',
  construct: 'للجيب أو جيب التمام: البسط على ضلع للزاوية القائمة والمقام وتر بالمدور؛ للظل: البسط والمقام على ضلعي الزاوية القائمة.',
  check: 'نتحقّق بالحاسبة ($23{,}6^{\\circ}$) ثم بالمنقلة ($24^{\\circ}$): المنقلة تقرأ إلى الدرجة فقط.',
};
