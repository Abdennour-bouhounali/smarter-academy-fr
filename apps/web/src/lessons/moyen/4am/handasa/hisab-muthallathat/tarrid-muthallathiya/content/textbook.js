/**
 * Le contenu du درس 4 « حل مشكلات وترييض وضعيات بتوظيف النسب المثلثية » (unité 10, manuel pp. 115–125) — données
 * pures (aucun JSX). Chaque bloc porte sa `source` :
 *
 *   challenge   تحدّ p. 115 (page d'unité, DOUBLON DÉCLARÉ — extraction › destinations › challenge › duplicatedIn
 *               « entrée de la leçon de modélisation : l'échelle, 1,9 m ») — module 1 ;
 *   ex-26       أتعمّق p. 125, résolu ligne à ligne au module 2 (l'arrondi précoce change le résultat) ;
 *   ex-27       أتعمّق p. 125, résolu par l'élève au module 2 (le triangle entier) ;
 *   ex-13, ex-24, ex-25, ex-28, ex-29 : content/exercises.js (module 3).
 *
 * La leçon n'a PAS d'activité ni de معارف du manuel : ce que la plateforme FORMULE (les étapes de la modélisation, la
 * résolution complète du triangle rectangle, l'arrondi en fin de calcul, un angle à partir de deux côtés) est déclaré
 * `addition('knowledge_formalization')` (« معارف من المنصّة ») ; le projecteur du stade et les nombres du test sont
 * `addition('interaction_generation')`. Les textes du manuel sont au mot près ; aucune coquille dans ces éléments
 * (extraction : `verified: true`) ; la lecture de l'ex-25 (30° en O) est celle de l'extraction (`reading`).
 */
import { src, addition } from '../../_unit/unitMeta.js';

const PLATFORM = addition('interaction_generation');
const FORMAL = addition('knowledge_formalization');
export const LP = {
  P1: '4am_tarrid-muthallathiya_P1',
  P2: '4am_tarrid-muthallathiya_P2',
  P3: '4am_tarrid-muthallathiya_P3',
};

/* ── module 1 : le تحدّ de la page d'unité ─────────────────────────────────── */

/** تحدّ (p. 115), au mot près (extraction › challenge) ; la figure est LadderFigure (components/). */
export const CHALLENGE = {
  source: src('challenge', 115, 'تحدّ'),
  text: 'اعتمادا على الشكل، احسب قيمة مقربة إلى الجزء من 10 لطول السلّم.',
  numbers: { height: '1,60', angle: 59 },
  ariaLabel: 'سلّم مستند إلى جدار شاقولي: رأس السلّم على الجدار على ارتفاع 1,60 m من الأرض، والسلّم يصنع مع الأرض الأفقية زاوية قيسها 59 درجة',
};

/** La وضعية de lancement pour la مذكرة du professeur (`ACTIVITY` : situation, questions, closing, source). */
export const ACTIVITY = {
  source: CHALLENGE.source,
  situation: 'يتطوّع رسّامو الجداريات لتجميل الحيّ، ويسندون سلّما إلى جدار: رأسه على ارتفاع $1{,}60\\,\\mathrm{m}$ والسلّم يصنع مع الأرض زاوية قيسها $59^{\\circ}$ . اعتمادا على الشكل، احسب قيمة مقربة إلى الجزء من 10 لطول السلّم.',
  text: CHALLENGE.text,
  questions: [
    'بالنسبة إلى الزاوية التي قيسها $59^{\\circ}$ ، ما طبيعة الضلع الذي طوله $1{,}60\\,\\mathrm{m}$ ؟ وما طبيعة السلّم؟',
    'ما النسبة المثلثية التي تربط الارتفاع المعلوم بطول السلّم المجهول؟',
    'احسب قيمة مقربة إلى الجزء من 10 لطول السلّم.',
  ],
  closing: 'نترجم الوضعية إلى مثلث قائم، نسمّي الأضلاع بالنسبة إلى الزاوية المعلومة، ونختار النسبة التي تربط المعلوم بالمجهول.',
};

/** Les laboratoires du module 1 (clinometer) — leurs nombres sont ceux de levels.js. */
export const LAB = {
  beginner: { mode: 'height', height: 24, minDistance: 10, maxDistance: 40, theme: 'floodlight' },
  advanced: { mode: 'ladder', height: 1.6, angle: 59, theme: 'mural' },
};

/** Le monde du niveau مبتدئ (plateforme) : le projecteur du stade visé au clinomètre du téléphone. */
export const STADIUM = {
  source: PLATFORM,
  text: 'ليلة مباراة في الملعب: عمر، المتطوّع في نادي الحيّ، يريد معرفة ارتفاع كشّاف الإنارة بدقّة دون أن يتسلّقه. يضع هاتفه على خط التماس، يسدّد إلى رأس الكشّاف بتطبيق «مقياس الميل»، ويقيس المسافة إلى قاعدة العمود على الأرض.',
};

/** Les phrases que le module 1 écrit et que la carte reprend mot pour mot (A.10 : jamais retapées). */
export const REMARKS = {
  muqabilWatar: 'بالنسبة إلى الزاوية التي يصنعها السلّم مع الأرض، الارتفاع $1{,}60\\,\\mathrm{m}$ هو الضلع المقابل، والسلّم هو الوتر.',
  sinChoice: 'الجيب يربط المقابل بالوتر: $\\sin 59^{\\circ} = \\dfrac{1{,}6}{L}$ . جيب التمام يحتاج المجاور (بعد قاعدة السلّم عن الجدار) والظل لا يذكر الوتر.',
  ladderCalc: '$L = \\dfrac{1{,}6}{\\sin 59^{\\circ}} \\approx 1{,}866$ ، والمدوّر إلى الجزء من 10 هو $L \\approx 1{,}9\\,\\mathrm{m}$ .',
  darbWrong: 'من $\\sin 59^{\\circ} = \\dfrac{1{,}6}{L}$ نكتب $L = 1{,}6 \\times \\sin 59^{\\circ}$ .',
  darbWhy: 'المجهول L في المقام لا في البسط: الضرب يعطي $1{,}37\\,\\mathrm{m}$ ، سلّما أقصر من ارتفاع رأسه، والسلّم وتر، أي أطول أضلاع المثلث القائم.',
  darbRight: 'المجهول في المقام فنقسم: $L = \\dfrac{1{,}6}{\\sin 59^{\\circ}}$ .',
  nisbaWrong: 'لحساب ارتفاع الكشّاف من المسافة على الأرض نختار الجيب $\\sin\\alpha$ .',
  nisbaWhy: 'الجيب يربط المقابل بالوتر، والوتر هنا هو خط النظر الذي لا نعرف طوله؛ المسافة على الأرض هي الضلع المجاور.',
  nisbaRight: 'الارتفاع (المقابل) والمسافة (المجاور) يربطهما الظل: $h = d \\times \\tan\\alpha$ .',
  wobble: 'الهاتف يقرأ الزاوية مدوّرة إلى الدرجة، لذلك تختلف الارتفاعات المحسوبة ببعض أجزاء المتر؛ الكشّاف نفسه لم يتغيّر.',
};

/* ── module 2 : طرائق من المنصّة ──────────────────────────────────────────── */

/** Les étapes de la modélisation — FORMULÉES par la plateforme (le manuel n'a pas de معارف pour cette leçon). */
export const METHOD = {
  source: FORMAL,
  title: 'خطوات ترييض وضعية بالنسب المثلثية',
  lines: [
    'نرسم مثلثا قائما يترجم الوضعية: الشاقولي عمودي على الأفقي، فالزاوية القائمة عند قاعدة الجدار أو العمود.',
    'نحدّد الزاوية المعلومة، ثم نسمّي بالنسبة إليها الضلع المعلوم والضلع المطلوب: المقابل، المجاور أو الوتر.',
    'نختار النسبة التي تجمع هذين الضلعين: المقابل والوتر بالجيب، المجاور والوتر بجيب التمام، المقابل والمجاور بالظل.',
    'نكتب المساواة ونستخرج المجهول: إذا كان في البسط نضرب، وإذا كان في المقام نقسم.',
    'نحسب بالحاسبة (مبرمجة بالدرجة) ولا ندوّر إلا النتيجة الأخيرة.',
    'نفسّر ونتحقّق: الوتر أطول الأضلاع، والنتيجة ملائمة للوضعية.',
  ],
};

/** Résoudre le triangle rectangle ENTIER — FORMULÉ par la plateforme (ex-26 et ex-27 le demandent). */
export const SOLVE_ALL = {
  source: FORMAL,
  title: 'حلّ المثلث القائم كاملا',
  lines: [
    'الزاوية الحادة الثانية: مجموع الزاويتين الحادتين $90^{\\circ}$ .',
    'الضلع الثاني بنسبة مثلثية، والثالث بنسبة أخرى أو بخاصية فيثاغورس.',
    'كل الطرق تعطي النتيجة نفسها إذا حسبنا بالقيم المضبوطة؛ القيمة المدوّرة في حساب موالٍ قد تغيّرها.',
  ],
};

/** أتعمّق p. 125 — تمرين 26, au mot près ; résolu ligne à ligne (réponses : extraction › ex-26 › answer). */
export const EX26 = {
  source: src('ex-26', 125, 'أتعمّق', 26),
  statement: 'ABC مثلث قائم في A حيث $\\widehat{B} = 18^{\\circ}$ و BC = 6cm. 1) أنجز شكلا مناسبا. احسب AC. تدوّر النتيجة إلى الجزء من 10. 2) احسب AB في كل حالة مما يلي: • باستعمال $\\cos\\widehat{B}$ . • استعمال خاصية فيثاغورس. • استعمال $\\tan\\widehat{B}$ . • استعمال $\\sin\\widehat{C}$ .',
  solution: [
    'نرسم المثلث ABC قائما في A. بالنسبة إلى الزاوية $\\widehat{B}$ : [BC] هو الوتر (معلوم) و [AC] هو الضلع المقابل (مطلوب).',
    'النسبة التي تجمع المقابل والوتر هي الجيب: $\\sin\\widehat{B} = \\dfrac{AC}{BC}$ أي $\\sin 18^{\\circ} = \\dfrac{AC}{6}$ .',
    'المجهول في البسط فنضرب: $AC = 6 \\times \\sin 18^{\\circ} \\approx 1{,}854$ .',
    'ندوّر في النهاية إلى الجزء من 10: $AC \\approx 1{,}9\\,\\mathrm{cm}$ .',
  ],
  earlyNote: 'بالقيمة المدوّرة $AC \\approx 1{,}9$ تعطي $\\tan\\widehat{B}$ القيمة $\\dfrac{1{,}9}{\\tan 18^{\\circ}} \\approx 5{,}8$ بدل $5{,}7$ : استعمال قيمة مدوّرة في حساب لاحق يُراكم الخطأ.',
};

/** أتعمّق p. 125 — تمرين 27, au mot près ; l'élève le résout (réponses : extraction › ex-27 › answer). */
export const EX27 = {
  source: src('ex-27', 125, 'أتعمّق', 27),
  statement: 'MSF مثلث قائم في M حيث $\\widehat{S} = 32^{\\circ}$ و MF = 9cm. 1) احسب MS (تدوّر النتيجة إلى الجزء من 100). 2) احسب SF في كل حالة مما يلي: (تدوّر النتيجة إلى الجزء من 10). • بحساب $\\sin\\widehat{S}$ . • باستعمال خاصية فيثاغورث. • باستعمال $\\cos\\widehat{S}$ . • باستعمال $\\cos\\widehat{F}$ .',
};

/** Un angle à partir de deux côtés — exemple de la plateforme, sur le projecteur du module 1 (24 m vu de 30 m). */
export const ANGLE_FROM_SIDES = {
  source: PLATFORM,
  text: 'كشّاف الملعب ارتفاعه $24\\,\\mathrm{m}$ ، والهاتف على الأرض على بعد $30\\,\\mathrm{m}$ من قاعدة عموده. ما قيس زاوية النظر α التي يقرؤها الهاتف، مدوّرا إلى الدرجة؟',
  explain: 'المعلومان هما المقابل (24) والمجاور (30): $\\tan\\alpha = \\dfrac{24}{30} = 0{,}8$ ، ثم باللمسة العكسية $\\alpha \\approx 38{,}66^{\\circ}$ أي $\\alpha \\approx 39^{\\circ}$ — ما قرأه الهاتف في المختبر.',
};

/** Les vérifications qu'écrit le module 2 (reprises par la carte). */
export const CHECKS = {
  verify: 'نتحقّق من النتيجة: الوتر أطول أضلاع المثلث القائم، والجيب وجيب التمام أصغر من 1، ومجموع الزاويتين الحادتين $90^{\\circ}$ .',
  earlyWrong: 'في التمرين 26 نستعمل $AC \\approx 1{,}9$ لنحسب $AB = \\dfrac{1{,}9}{\\tan 18^{\\circ}}$ .',
  earlyWhy: 'القيمة المدوّرة تُدخل خطأ يكبر في الحساب الموالي: نجد $5{,}8$ بدل $5{,}7$ .',
  earlyRight: 'نحتفظ بالقيمة المضبوطة $AC = 6\\sin 18^{\\circ}$ (أو بكل أرقام الحاسبة) ولا ندوّر إلا النتيجة الأخيرة.',
};

/* ── module 3 : la lecture de l'ex-25 (extraction › ex-25 › reading) ─────────────── */
export const READING_25 = 'قراءة الشكل: الزاوية $30^{\\circ}$ مرسومة في O بين [OA] و [OD] ، أي $\\widehat{AOD} = 30^{\\circ}$ (الشكل في الكتاب ليس بالسلّم).';

/* ── module 0 : « أستعدّ » (plateforme — le manuel n'a aucun item pour cette leçon) ── */

export const PREP_ITEMS = [
  { skill: 'maqam', text: 'إذا كان $\\dfrac{12}{x} = 4$ فإن $x = 48$ .', answer: false, why: 'المجهول في المقام: $12 = 4x$ ومنه $x = \\dfrac{12}{4} = 3$ ( $48 = 12 \\times 4$ يحلّ $\\dfrac{x}{12} = 4$ ).', source: addition('prerequisite_diagnostic') },
  { skill: 'bast', text: 'إذا كان $\\dfrac{x}{5} = 0{,}8$ فإن $x = 4$ .', answer: true, why: 'المجهول في البسط: نضرب الطرفين في 5، $x = 5 \\times 0{,}8 = 4$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'hadatan', text: 'في مثلث قائم، إذا كان قيس إحدى الزاويتين الحادتين $35^{\\circ}$ فإن قيس الأخرى $55^{\\circ}$ .', answer: true, why: 'مجموع زوايا المثلث $180^{\\circ}$ والقائمة $90^{\\circ}$ : $180 - 90 - 35 = 55$ ، فالزاويتان الحادتان متتامتان.', source: addition('prerequisite_diagnostic') },
  { skill: 'shaquli', text: 'عمود شاقولي مغروس في أرض أفقية لا يصنع معها زاوية قائمة إلا إذا كان قصيرا.', answer: false, why: 'الشاقولي عمودي دائما على الأفقي مهما كان طوله: الزاوية بينهما قائمة، ولذلك نجد مثلثا قائما في كل وضعية «ارتفاع ومسافة على الأرض».', source: addition('prerequisite_diagnostic') },
  { skill: 'nisab', text: 'في المثلث ABC القائم في A: $\\tan\\widehat{B} = \\dfrac{AB}{AC}$ .', answer: false, why: 'الظل = المقابل ÷ المجاور: المقابل للزاوية B هو [AC] والمجاور هو [AB]، فـ $\\tan\\widehat{B} = \\dfrac{AC}{AB}$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'hasiba', text: 'إذا كان $\\tan x = 1$ لزاوية حادة x فإن $x = 45^{\\circ}$ .', answer: true, why: 'باللمسة العكسية للظل على الحاسبة المبرمجة بالدرجة نجد $45^{\\circ}$ : في المثلث القائم المتساوي الساقين المقابل يساوي المجاور.', source: addition('prerequisite_diagnostic') },
  { skill: 'fithaghuris', text: 'في مثلث قائم ضلعا زاويته القائمة 6 و 8، طول الوتر 14.', answer: false, why: 'حسب خاصية فيثاغورس: $6^2 + 8^2 = 36 + 64 = 100$ ، فالوتر $\\sqrt{100} = 10$ (وليس $6 + 8$ ).', source: addition('prerequisite_diagnostic') },
];

/* ── module 4 : « إختبار أولي » — des nombres qui n'apparaissent nulle part ailleurs ─── */

export const TEST = {
  source: PLATFORM,
  title: 'أربع وضعيات جديدة من الواقع',
  minaret: 'من نقطة على الأرض على بعد $118\\,\\mathrm{m}$ من قاعدة منارة جامع الجزائر تُرى قمّتها بزاوية قيسها $66^{\\circ}$ مع الأرض الأفقية.',
  cable: 'تصعد عربة التلفريك في قسنطينة على كابل مستقيم يصنع مع الأفق زاوية قيسها $20^{\\circ}$ ، فترتفع $40\\,\\mathrm{m}$ عموديا.',
  dune: 'منحدر كثيب رملي في الصحراء طوله $18\\,\\mathrm{m}$ وينزل $6\\,\\mathrm{m}$ عموديا (التزلج على الرمال).',
  triangle: 'ABC مثلث قائم في A حيث $AB = 8\\,\\mathrm{cm}$ و $AC = 6\\,\\mathrm{cm}$ .',
  early: 'DEF مثلث قائم في D حيث $\\widehat{E} = 25^{\\circ}$ و $EF = 10\\,\\mathrm{cm}$ . حسبت سارة $DF = 10\\sin 25^{\\circ} \\approx 4{,}2$ ثم $DE = \\dfrac{4{,}2}{\\tan 25^{\\circ}}$ .',
};
