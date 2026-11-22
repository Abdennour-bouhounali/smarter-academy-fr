/**
 * Les trois « مسائل » du درس « استعمال الحاسبة لحساب النسب المثلثية وتعيين قياس زاوية » (modules 4, 5, 6) — des
 * exercices COMPLETS de type امتحان, résolus pas à pas (common/problems/GuidedProblem.jsx).
 *
 * AJOUTS DE LA PLATEFORME, déclarés comme tels (`addition('exam_style_problem')`) : le manuel ne les contient pas.
 * Ils restent dans le périmètre de la leçon : la calculatrice programmée en degrés (le piège R), la fonction directe
 * (angle → rapport), les touches inverses (rapport → angle ; sin⁻¹ n'est pas 1 ÷ sin), l'arrondi de la SEULE valeur
 * finale et la différence arrondi / valeur approchée par défaut. Les rapports dans un triangle rectangle et le calcul
 * d'un côté sont des acquis de la leçon 1 ; le triangle est toujours DONNÉ par la figure (la mise en situation
 * d'une وضعية est la leçon 4).
 *
 * La مسألة 1 est « مسألة الدرس » : son énoncé et sa figure vivent dans `LESSON_CONFIG.lessonProblem` (montrés dès le
 * sommaire et rappelés au module 1, dans le monde du lab متقدم : le drone qui filme la Corniche), et se résout ici.
 * Les figures 2 et 3 sont dessinées sur des coordonnées calculées (BC = 30 × tan 58°, BT = 45 × tan 32°).
 *
 * Chaque nombre est vérifié par calcul dans ./problems.test.js (Math.tan / sin / cos en degrés, les écrans à
 * 10 chiffres, les arrondis annoncés), chaque figure par figureQuality().
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';
import { key } from './textbook.js';

const SOURCE = addition('exam_style_problem');

/** Le sommet C de la مئذنة : BC = 30 × tan 58° ≈ 48,01 (au millième, pour que la figure dise vrai). */
const MINARET_H = Math.round(30 * Math.tan((58 * Math.PI) / 180) * 1000) / 1000;
/** La largeur de l'oued : BT = 45 × tan 32° ≈ 28,12 (au millième). */
const OUED_W = Math.round(45 * Math.tan((32 * Math.PI) / 180) * 1000) / 1000;

export const FIG_MINARET = {
  points: { A: [0, 0], E: [10, 0], B: [30, 0], C: [30, MINARET_H] },
  segments: [
    { from: 'A', to: 'E', label: '10 m' },
    { from: 'E', to: 'B', label: '20 m' },
    { from: 'B', to: 'C', bold: true },
    { from: 'A', to: 'C', tone: 'amber' },
    { from: 'E', to: 'C', tone: 'sky', dashed: true },
  ],
  rightAngles: [['A', 'B', 'C']],
  angles: [{ at: 'A', from: 'B', to: 'C', label: '58°' }, { at: 'E', from: 'B', to: 'C', label: '?' }],
  ariaLabel: 'المئذنة BC عمودية على الأرض في B. أمين في A على بعد 30 m من B يقرأ زاوية الارتفاع 58 درجة، وسليم في E على بعد 20 m من B، والزاوية عند E مطلوبة',
  maxWidth: 300,
};

export const FIG_OUED = {
  points: { A: [0, 0], B: [45, 0], T: [45, OUED_W], U: [-3, 0], V: [51, 0], P: [-3, OUED_W], Q: [51, OUED_W] },
  segments: [
    { from: 'U', to: 'V', tone: 'emerald' },
    { from: 'P', to: 'Q', tone: 'emerald' },
    { from: 'A', to: 'B', label: '45 m' },
    { from: 'B', to: 'T', label: '?', tone: 'sky', bold: true },
    { from: 'A', to: 'T', dashed: true },
  ],
  rightAngles: [['A', 'B', 'T']],
  angles: [{ at: 'A', from: 'B', to: 'T', label: '32°' }],
  hidden: ['U', 'V', 'P', 'Q'],
  labels: { A: 'sw', B: 'se', T: 'ne' },
  ariaLabel: 'ضفّتا الوادي مستقيمتان متوازيتان. الوتد B والنقطة A على الضفة الأولى و AB يساوي 45 m، والصخرة T على الضفة الأخرى مقابل B، والزاوية عند A قيسها 32 درجة، وعرض الوادي BT مطلوب',
  maxWidth: 340,
};

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — درون الكورنيش',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🚁',
    source: SOURCE,
    statement: LESSON_CONFIG.lessonProblem.statement,
    figure: LESSON_CONFIG.lessonProblem.figure,
    data: [
      { id: 'alt', text: 'ارتفاع الدرون فوق الأرض 36 m', useful: true },
      { id: 'ground', text: 'المسافة الأفقية بين الدرون والمنصّة 48 m', useful: true },
      { id: 'beam', text: 'طول شعاع الكاميرا 60 m', useful: true },
      { id: 'right', text: 'الارتفاع عمودي على الأرض: المثلث قائم', useful: true },
      { id: 'battery', text: 'البطارية تكفي 25 دقيقة من الطيران', useful: false },
      { id: 'festival', text: 'التصوير في مهرجان الصيف', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'زاوية الكاميرا',
        question: 'احسب $\\tan\\widehat{DTH}$ ، ثم عيّن قيس الزاوية $\\widehat{DTH}$ مدوّرا إلى الوحدة.',
        asks: ['$\\tan\\widehat{DTH}$', 'قيس الزاوية $\\widehat{DTH}$ مدوّرا إلى الوحدة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['nisba-muthallathiya'],
            prompt: 'في المثلث $DHT$ القائم في $H$ ، أيّ نسبة تساوي $\\tan\\widehat{DTH}$ ؟',
            options: ['$\\dfrac{DH}{TH}$', '$\\dfrac{TH}{DH}$', '$\\dfrac{DH}{DT}$', '$\\dfrac{TH}{DT}$'],
            correct: 0, cols: 2,
            explain: 'الظل = المقابل ÷ المجاور: $[DH]$ مقابل للزاوية $\\widehat{DTH}$ و $[TH]$ مجاور لها. ( $\\dfrac{DH}{DT}$ هو الجيب.)' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['nisba-muthallathiya'],
            prompt: 'قيمة $\\tan\\widehat{DTH}$ (عدد عشري):', expected: 0.75, display: '0,75',
            explain: '$\\tan\\widehat{DTH} = \\dfrac{36}{48} = 0{,}75$ .' },
          { kind: 'choice', role: 'translate', requires: ['hasiba-zawiya'],
            prompt: 'نعرف ظل الزاوية ونريد قيسها. نضغط على الحاسبة:',
            options: [key('ON 2nd tan⁻¹ 0,75 ='), key('ON 1 ÷ 0,75 ='), key('ON tan 0,75 ='), key('ON 2nd sin⁻¹ 0,75 =')],
            correct: 0,
            explain: `${key('tan⁻¹')} (باللمسة ${key('2nd')}) تعطي الزاوية التي ظلها $0{,}75$ ، وليست مقلوب العدد: ${key('1 ÷ 0,75')} يعطي $1{,}333333333$ ، عدد لا زاوية. و ${key('tan 0,75')} يحسب ظل زاوية قيسها $0{,}75^{\\circ}$ ، و ${key('sin⁻¹')} للجيب لا للظل.` },
          { kind: 'numeric', role: 'compute', requires: ['hasiba-zawiya'],
            prompt: 'ما تعرضه الشاشة (بالدرجة)، مدوّرا إلى 0,01:', expected: 36.87, display: '36,87',
            explain: `${key('ON 2nd tan⁻¹ 0,75 =')} يعطي $36{,}86989765$ ؛ رقم الأجزاء من 1000 هو 9: نضيف 1.` },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['tadwir-dalaqa'],
            prompt: 'قيس الزاوية $\\widehat{DTH}$ مدوّرا إلى الوحدة (بالدرجة):', expected: 37, suffix: '°',
            explain: 'الشاشة $36{,}86989765$ : رقم الأجزاء من 10 هو 8، وهو أكبر من 5، فنضيف 1 إلى رقم الوحدات: $\\widehat{DTH} \\approx 37^{\\circ}$ .' },
          { kind: 'solution', lines: [
            'في المثلث $DHT$ القائم في $H$ : $\\tan\\widehat{DTH} = \\dfrac{DH}{TH} = \\dfrac{36}{48} = 0{,}75$ .',
            `بالحاسبة المبرمجة بالدرجة: ${key('ON 2nd tan⁻¹ 0,75 =')} يعطي $36{,}86989765$ .`,
            'إذن $\\widehat{DTH} \\approx 37^{\\circ}$ : تميل الكاميرا بزاوية $37^{\\circ}$ تقريبا عن الأرض.',
          ] },
        ],
      },
      {
        label: '2)', title: 'زاوية $50^{\\circ}$ وحاسبة الصديق',
        question: 'يريد المصوّر أن تميل الكاميرا بزاوية $50^{\\circ}$ عن الأرض، فيُبقي طول الشعاع $DT = 60$ m ويغيّر ارتفاع الدرون. حسب صديقه بحاسبته $\\sin 50$ فظهر على الشاشة $-0{,}2623748537$ . لماذا هذا العدد مرفوض، وما سببه؟ احسب الارتفاع الجديد $DH$ مدوّرا إلى 0,1 m.',
        asks: ['لماذا العدد الذي ظهر مرفوض، وما سببه؟', 'الارتفاع الجديد $DH$ مدوّرا إلى 0,1 m'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['barmaja-daraja'],
            prompt: 'ما الذي يجعل العدد الذي ظهر مرفوضًا، وما سببه؟',
            options: [
              `جيب زاوية حادة محصور بين 0 و 1 والعدد سالب: الحاسبة مبرمجة بالراديان ( ${key('R')} )، فنبرمجها بالدرجة`,
              'العدد صحيح، يكفي تدويره: $\\sin 50^{\\circ} \\approx -0{,}26$',
              `نسي الصديق اللمسة ${key('2nd')} قبل ${key('sin')}`,
              `يجب أن يكتب 50 قبل اللمسة ${key('sin')}`,
            ],
            correct: 0,
            explain: `جيب زاوية حادة عدد محصور تماما بين 0 و 1. $\\sin 50 = -0{,}2623748537$ هو جيب 50 راديانًا (الحرف ${key('R')} في أعلى الشاشة). بالدرجة: $\\sin 50^{\\circ} = 0{,}7660444431$ . و ${key('2nd')} يحوّل الحساب إلى قيس زاوية، وترتيب اللمسات صحيح.` },
          { kind: 'choice', role: 'translate', requires: ['nisba-muthallathiya'],
            prompt: 'الارتفاع الجديد $DH$ يُحسب بـ:',
            options: ['$DH = 60 \\times \\sin 50^{\\circ}$', '$DH = 60 \\times \\cos 50^{\\circ}$', '$DH = \\dfrac{60}{\\sin 50^{\\circ}}$', '$DH = 60 \\times \\tan 50^{\\circ}$'],
            correct: 0, cols: 2,
            explain: '$[DH]$ مقابل للزاوية و $[DT]$ وتر: $\\sin\\widehat{DTH} = \\dfrac{DH}{DT}$ ، إذن $DH = DT \\times \\sin 50^{\\circ}$ . ( $60 \\times \\cos 50^{\\circ}$ هي المسافة الأفقية $TH$ .)' },
          { kind: 'choice', role: 'conclude', requires: ['tadwir-dalaqa'],
            prompt: 'متى ندوّر؟',
            options: [
              'نحسب الجداء بأرقام الشاشة كلها، ثم ندوّر النتيجة النهائية',
              'ندوّر أوّلا جيب الزاوية إلى 0,01 ثم نضرب في 60',
              'ندوّر أوّلا الزاوية ثم الجيب ثم الجداء',
            ],
            correct: 0,
            explain: '$60 \\times 0{,}77 = 46{,}2$ بينما $60 \\times \\sin 50^{\\circ} = 45{,}96266659$ : التدوير المبكّر يغيّر رقم الأجزاء من 10. ندوّر النتيجة النهائية فقط.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hasiba-nisba', 'tadwir-dalaqa'],
            prompt: 'الارتفاع الجديد $DH$ مدوّرا إلى 0,1 m:', expected: 46, display: '46,0', suffix: 'm',
            explain: `${key('ON 60 × sin 50 =')} يعطي $45{,}96266659$ ؛ رقم الأجزاء من 100 هو 6، وهو أكبر من 5: $DH \\approx 46{,}0$ m.` },
          { kind: 'solution', lines: [
            '$-0{,}2623748537 < 0$ ، وجيب زاوية حادة محصور بين 0 و 1: الحاسبة كانت مبرمجة بالراديان، فنبرمجها بالدرجة.',
            '$\\sin\\widehat{DTH} = \\dfrac{DH}{DT}$ ، إذن $DH = 60 \\times \\sin 50^{\\circ}$ .',
            'بالحاسبة: $60 \\times \\sin 50^{\\circ} = 45{,}96266659$ ، إذن $DH \\approx 46{,}0$ m: يرتفع الدرون إلى 46 m تقريبا.',
          ] },
        ],
      },
      {
        label: '3)', title: 'شرط البلدية',
        question: 'تمنع البلدية طيران الدرون على ارتفاع يتجاوز 40 m قرب الشاطئ. هل يحترم الارتفاع الجديد هذا الشرط؟ عيّن أكبر قيس لزاوية الكاميرا، بعدد طبيعي من الدرجات، يُبقي الدرون على ارتفاع لا يتجاوز 40 m مع $DT = 60$ m.',
        asks: ['هل يحترم الارتفاع الجديد شرط البلدية؟', 'أكبر قيس لزاوية الكاميرا بعدد طبيعي من الدرجات'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0,
            prompt: 'هل يحترم الارتفاع الذي وجدته في السؤال 2) شرط البلدية؟',
            options: ['لا: $46{,}0 > 40$ ، الدرون أعلى من المسموح', 'نعم: طول الشعاع 60 m لم يتغيّر', 'نعم: $50^{\\circ}$ زاوية حادة'],
            correct: 0,
            explain: 'الشرط على الارتفاع $DH$ لا على الشعاع ولا على الزاوية: $DH \\approx 46{,}0$ m أكبر من 40 m.' },
          { kind: 'choice', role: 'translate', requires: ['nisba-muthallathiya'],
            prompt: 'ارتفاع 40 m بالضبط مع $DT = 60$ m يوافق زاوية $x$ حيث:',
            options: ['$\\sin x = \\dfrac{40}{60}$', '$\\tan x = \\dfrac{40}{60}$', '$\\cos x = \\dfrac{40}{60}$', '$\\sin x = \\dfrac{60}{40}$'],
            correct: 0, cols: 2,
            explain: 'الارتفاع مقابل للزاوية والشعاع وتر: $\\sin x = \\dfrac{DH}{DT}$ . ( $\\dfrac{60}{40} > 1$ لا يكون جيبا.)' },
          { kind: 'numeric', role: 'compute', requires: ['hasiba-zawiya'],
            prompt: 'قيس $x$ مدوّرا إلى 0,01 (بالدرجة):', expected: 41.81, display: '41,81',
            explain: `${key('ON 2nd sin⁻¹ ( 40 ÷ 60 ) =')} يعطي $41{,}8103149$ ، والقسمة داخل القوسين بكل أرقامها.` },
          { kind: 'choice', role: 'conclude', requires: ['tadwir-dalaqa'],
            prompt: 'هل يناسب البلدية المدوّر إلى الوحدة لهذا القيس؟',
            options: [
              'لا: $60 \\times \\sin 42^{\\circ} \\approx 40{,}1$ m يتجاوز 40 m؛ نأخذ القيمة المقربة بالنقصان',
              'نعم: المدوّر إلى الوحدة هو دائما الجواب',
              'لا: نأخذ $40^{\\circ}$ لأن الارتفاع 40 m',
            ],
            correct: 0,
            explain: '$60 \\times \\sin 42^{\\circ} = 40{,}14783638$ يتجاوز 40 m، و $60 \\times \\sin 41^{\\circ} = 39{,}36354174$ لا يتجاوزه. المدوّر يزيد هنا على القيمة الحدّية، فلا يحترم الشرط.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'أكبر قيس مسموح لزاوية الكاميرا (عدد طبيعي من الدرجات):', expected: 41, suffix: '°',
            explain: 'كلما كبرت الزاوية كبر جيبها فارتفع الدرون: أكبر عدد طبيعي من الدرجات لا يتجاوز $41{,}81^{\\circ}$ هو $41^{\\circ}$ .' },
          { kind: 'solution', lines: [
            '$46{,}0 > 40$ : الارتفاع الجديد لا يحترم شرط البلدية.',
            'ارتفاع 40 m يوافق $\\sin x = \\dfrac{40}{60}$ ، والحاسبة تعطي $x \\approx 41{,}81^{\\circ}$ .',
            '$60 \\times \\sin 42^{\\circ} \\approx 40{,}1$ m يتجاوز 40 m، بينما $60 \\times \\sin 41^{\\circ} \\approx 39{,}4$ m.',
            'أكبر زاوية مسموحة: $41^{\\circ}$ (لا المدوّر $42^{\\circ}$).',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — مئذنة مسجد الحيّ',
    context: 'ارتفاع المئذنة، زاوية سليم، وسلسلة المصابيح',
    emoji: '🕌',
    source: SOURCE,
    statement: 'يتطوّع أمين مع جيرانه لترميم مئذنة مسجد الحيّ، ويريد قياس ارتفاعها بدقّة دون الصعود إليها: وضع مقياس الميل على الأرض في النقطة $A$ على بعد $AB = 30$ m من قاعدة المئذنة $B$ ، وسدّد نحو قمّتها $C$ فقرأ زاوية الارتفاع $\\widehat{BAC} = 58^{\\circ}$ . ووقف زميله سليم في النقطة $E$ من $[AB]$ حيث $EB = 20$ m. الأرض أفقية والمئذنة عمودية عليها (في الشكل المقابل، المثلث $ABC$ قائم في $B$). بُنيت المئذنة سنة 1987.',
    figure: FIG_MINARET,
    data: [
      { id: 'ab', text: 'بعد أمين عن قاعدة المئذنة 30 m', useful: true },
      { id: 'angle', text: 'زاوية الارتفاع التي قرأها أمين 58°', useful: true },
      { id: 'eb', text: 'بعد سليم عن قاعدة المئذنة 20 m', useful: true },
      { id: 'right', text: 'المئذنة عمودية على الأرض الأفقية', useful: true },
      { id: 'year', text: 'بُنيت المئذنة سنة 1987', useful: false },
      { id: 'friends', text: 'أمين وسليم زميلان', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'ارتفاع المئذنة',
        question: 'احسب ارتفاع المئذنة $BC$ مدوّرا إلى 0,1 m.',
        asks: ['ارتفاع المئذنة $BC$ مدوّرا إلى 0,1 m'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['nisba-muthallathiya'],
            prompt: 'بالنسبة إلى الزاوية $\\widehat{BAC}$ : الضلع $[AB]$ معلوم والضلع $[BC]$ مطلوب. النسبة التي تربطهما:',
            options: ['$\\tan\\widehat{BAC} = \\dfrac{BC}{AB}$', '$\\sin\\widehat{BAC} = \\dfrac{BC}{AB}$', '$\\cos\\widehat{BAC} = \\dfrac{BC}{AB}$', '$\\tan\\widehat{BAC} = \\dfrac{AB}{BC}$'],
            correct: 0, cols: 2,
            explain: '$[BC]$ مقابل للزاوية $\\widehat{BAC}$ و $[AB]$ مجاور لها، والظل = المقابل ÷ المجاور. الجيب وجيب التمام يحتاجان الوتر $[AC]$ .' },
          { kind: 'choice', role: 'translate', requires: ['nisba-muthallathiya'],
            prompt: 'إذن:',
            options: ['$BC = 30 \\times \\tan 58^{\\circ}$', '$BC = \\dfrac{30}{\\tan 58^{\\circ}}$', '$BC = 30 \\times \\sin 58^{\\circ}$'],
            correct: 0,
            explain: 'من $\\tan 58^{\\circ} = \\dfrac{BC}{30}$ نضرب الطرفين في 30: $BC = 30 \\times \\tan 58^{\\circ}$ .' },
          { kind: 'numeric', role: 'compute', requires: ['hasiba-nisba', 'barmaja-daraja'],
            prompt: 'ما تعرضه الحاسبة لهذا الجداء، مدوّرا إلى 0,01:', expected: 48.01, display: '48,01',
            explain: `${key('ON 30 × tan 58 =')} يعطي $30 \\times \\tan 58^{\\circ} = 48{,}01003587$ . (حاسبة بالراديان تعطي $30 \\times \\tan 58 = 249{,}9257056$ : مئذنة بـ 250 m! نتأكّد من الحرف ${key('D')} .)` },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tadwir-dalaqa'],
            prompt: 'ارتفاع المئذنة $BC$ مدوّرا إلى 0,1 m:', expected: 48, display: '48,0', suffix: 'm',
            explain: 'الشاشة $48{,}01003587$ : رقم الأجزاء من 100 هو 1، وهو أصغر من 5، فنحتفظ برقم الأجزاء من 10 كما هو: $BC \\approx 48{,}0$ m.' },
          { kind: 'solution', lines: [
            'في المثلث $ABC$ القائم في $B$ : $\\tan\\widehat{BAC} = \\dfrac{BC}{AB}$ ، إذن $BC = 30 \\times \\tan 58^{\\circ}$ .',
            'بالحاسبة المبرمجة بالدرجة: $30 \\times \\tan 58^{\\circ} = 48{,}01003587$ .',
            'ارتفاع المئذنة $BC \\approx 48{,}0$ m.',
          ] },
        ],
      },
      {
        label: '2)', title: 'زاوية سليم',
        question: `يريد سليم أن يعرف زاوية الارتفاع $\\widehat{BEC}$ قبل أن يقيسها (نأخذ $BC = 48$ m). ضغط ${key('ON 2nd sin⁻¹')} ثم النسبة $\\dfrac{BC}{BE}$ فظهرت رسالة «خطأ رياضي». لماذا؟ عيّن قيس الزاوية $\\widehat{BEC}$ مدوّرا إلى 0,1.`,
        asks: ['لماذا ظهرت رسالة «خطأ رياضي»؟', 'قيس الزاوية $\\widehat{BEC}$ مدوّرا إلى 0,1'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['nisba-muthallathiya'],
            prompt: 'قيمة النسبة $\\dfrac{BC}{BE}$ :', expected: 2.4, display: '2,4',
            explain: '$\\dfrac{BC}{BE} = \\dfrac{48}{20} = 2{,}4$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['nisba-muthallathiya', 'hasiba-zawiya'],
            prompt: 'لماذا رفضت الحاسبة؟',
            options: [
              'جيب زاوية حادة أصغر من 1 وهذه النسبة أكبر من 1؛ ثم إنها ظل الزاوية $\\widehat{BEC}$ لا جيبها',
              'الحاسبة مبرمجة بالراديان',
              `كان يجب أن يضغط ${key('sin')} دون ${key('2nd')}`,
              'زاوية سليم أكبر من $90^{\\circ}$',
            ],
            correct: 0,
            explain: '$[BC]$ مقابل للزاوية $\\widehat{BEC}$ و $[BE]$ مجاور لها: $\\tan\\widehat{BEC} = \\dfrac{BC}{BE} = 2{,}4$ . والجيب نسبة ضلع إلى الوتر، أطول الأضلاع، فهو أصغر من 1: لا توجد زاوية جيبها $2{,}4$ .' },
          { kind: 'choice', role: 'translate', requires: ['hasiba-zawiya'],
            prompt: 'البرنامج الصحيح:',
            options: [key('ON 2nd tan⁻¹ 2,4 ='), key('ON tan 2,4 ='), key('ON 1 ÷ 2,4 ='), key('ON 2nd tan⁻¹ ( 20 ÷ 48 ) =')],
            correct: 0,
            explain: `${key('tan⁻¹')} (باللمسة ${key('2nd')}) يعطي الزاوية التي ظلها $2{,}4$ . أمّا ${key('1 ÷ 2,4')} فمقلوب العدد ( $0{,}4166666667$ )، و ${key('tan 2,4')} ظل زاوية قيسها $2{,}4^{\\circ}$ ، و $\\dfrac{20}{48}$ هو ظل الزاوية $\\widehat{BCE}$ لا $\\widehat{BEC}$ .` },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hasiba-zawiya', 'tadwir-dalaqa'],
            prompt: 'قيس الزاوية $\\widehat{BEC}$ مدوّرا إلى 0,1 (بالدرجة):', expected: 67.4, display: '67,4', suffix: '°',
            explain: `${key('ON 2nd tan⁻¹ 2,4 =')} يعطي $67{,}38013505$ ؛ رقم الأجزاء من 100 هو 8، وهو أكبر من 5: $\\widehat{BEC} \\approx 67{,}4^{\\circ}$ .` },
          { kind: 'solution', lines: [
            '$\\tan\\widehat{BEC} = \\dfrac{BC}{BE} = \\dfrac{48}{20} = 2{,}4$ : هذه النسبة ظل، وهي أكبر من 1، والجيب أصغر من 1، لذلك رفضت الحاسبة.',
            `بالحاسبة: ${key('ON 2nd tan⁻¹ 2,4 =')} يعطي $67{,}38013505$ .`,
            'سيقرأ سليم زاوية ارتفاع $\\widehat{BEC} \\approx 67{,}4^{\\circ}$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'سلسلة المصابيح',
        question: 'في ليلة المولد النبوي تُشدّ سلسلة مصابيح مستقيمة من القمّة $C$ إلى النقطة $A$ . احسب طول السلسلة $AC$ مدوّرا إلى 0,1 m. تُباع السلسلة بالمتر الكامل بـ 450 دج للمتر: كم يدفع المسجد؟',
        asks: ['طول السلسلة $AC$ مدوّرا إلى 0,1 m', 'المبلغ الذي يدفعه المسجد'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['nisba-muthallathiya'],
            prompt: 'بالمعطيات الأصلية ( $AB = 30$ m والزاوية $58^{\\circ}$ ) نكتب:',
            options: ['$\\cos 58^{\\circ} = \\dfrac{30}{AC}$', '$\\cos 58^{\\circ} = \\dfrac{AC}{30}$', '$\\sin 58^{\\circ} = \\dfrac{30}{AC}$', '$\\tan 58^{\\circ} = \\dfrac{30}{AC}$'],
            correct: 0, cols: 2,
            explain: '$[AB]$ مجاور للزاوية $\\widehat{BAC}$ و $[AC]$ وترها: $\\cos\\widehat{BAC} = \\dfrac{AB}{AC}$ ، ومنه $AC = \\dfrac{30}{\\cos 58^{\\circ}}$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hasiba-nisba', 'tadwir-dalaqa'],
            prompt: 'طول السلسلة $AC$ مدوّرا إلى 0,1 m:', expected: 56.6, display: '56,6', suffix: 'm',
            explain: `${key('ON 30 ÷ cos 58 =')} يعطي $\\dfrac{30}{\\cos 58^{\\circ}} = 56{,}61239744$ ؛ رقم الأجزاء من 100 هو 1، وهو أصغر من 5: $AC \\approx 56{,}6$ m. (خاصية فيثاغورس مع $BC \\approx 48{,}01$ تعطي الطول نفسه.)` },
          { kind: 'choice', role: 'conclude',
            prompt: 'السلسلة تُباع بالمتر الكامل. كم مترًا يشتري المسجد؟',
            options: ['57 m: أصغر عدد كامل من الأمتار يكفي', '56 m: نبتر الأرقام بعد الفاصلة', '56,6 m: الطول نفسه'],
            correct: 0,
            explain: '$56 < 56{,}6$ : سلسلة من 56 m لا تبلغ القمّة، ولا تُباع أجزاء المتر. نشتري 57 m.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'المبلغ الذي يدفعه المسجد:', expected: 25650, suffix: 'دج',
            explain: '$57 \\times 450 = 25650$ .' },
          { kind: 'solution', lines: [
            '$\\cos\\widehat{BAC} = \\dfrac{AB}{AC}$ ، إذن $AC = \\dfrac{30}{\\cos 58^{\\circ}} \\approx 56{,}6$ m.',
            'السلسلة تُباع بالمتر الكامل، و 56 m أقصر من $56{,}6$ m: نشتري 57 m.',
            'المبلغ: $57 \\times 450 = 25650$ ، أي يدفع المسجد 25650 دج.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — جسر فوق الوادي',
    context: 'عرض الوادي من زاوية، ثم التحقّق بالليزر',
    emoji: '🌉',
    source: SOURCE,
    statement: 'تريد البلدية إنجاز جسر للراجلين فوق وادٍ ضفّتاه مستقيمتان ومتوازيتان. غرس المهندس، الحريص على إتقان عمله، وتدًا في النقطة $B$ من الضفّة الأولى، مقابل صخرة $T$ على الضفّة الأخرى، بحيث يكون $(BT)$ عموديا على الضفّتين. ثم مشى على الضفّة الأولى إلى النقطة $A$ حيث $AB = 45$ m، وسدّد بالمزواة نحو الصخرة فقرأ $\\widehat{BAT} = 32^{\\circ}$ (في الشكل المقابل). عمق الماء في وسط الوادي 1,8 m. يزيد طول الجسر على عرض الوادي بـ 2 m من كل جهة للتثبيت، ويُركَّب من وحدات معدنية جاهزة طول كل وحدة 3 m وثمنها 68000 دج.',
    figure: FIG_OUED,
    data: [
      { id: 'ab', text: 'المسافة بين الوتد ونقطة التسديد 45 m', useful: true },
      { id: 'angle', text: 'زاوية التسديد 32°', useful: true },
      { id: 'perp', text: 'الخط بين الوتد والصخرة عمودي على الضفّتين', useful: true },
      { id: 'extra', text: 'يزيد الجسر 2 m من كل جهة', useful: true },
      { id: 'unit', text: 'وحدة الجسر طولها 3 m وثمنها 68000 دج', useful: true },
      { id: 'depth', text: 'عمق الماء في وسط الوادي 1,8 m', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'عرض الوادي',
        question: 'احسب عرض الوادي $BT$ مدوّرا إلى 0,1 m.',
        asks: ['عرض الوادي $BT$ مدوّرا إلى 0,1 m'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['nisba-muthallathiya'],
            prompt: 'العلاقة التي تعطي $BT$ :',
            options: ['$BT = 45 \\times \\tan 32^{\\circ}$', '$BT = 45 \\times \\sin 32^{\\circ}$', '$BT = \\dfrac{45}{\\tan 32^{\\circ}}$', '$BT = 45 \\times \\cos 32^{\\circ}$'],
            correct: 0, cols: 2,
            explain: '$[BT]$ مقابل للزاوية $\\widehat{BAT}$ و $[AB]$ مجاور لها: $\\tan\\widehat{BAT} = \\dfrac{BT}{AB}$ ، إذن $BT = 45 \\times \\tan 32^{\\circ}$ . الجيب وجيب التمام يحتاجان الوتر $[AT]$ .' },
          { kind: 'numeric', role: 'compute', requires: ['hasiba-nisba'],
            prompt: 'ما تعرضه الحاسبة لهذا الجداء، مدوّرا إلى 0,001:', expected: 28.119, display: '28,119',
            explain: `${key('ON 45 × tan 32 =')} يعطي $45 \\times \\tan 32^{\\circ} = 28{,}11912084$ .` },
          { kind: 'choice', role: 'conclude', requires: ['barmaja-daraja'],
            prompt: 'زميل المهندس وجد بحاسبته عرضًا قدره 29,7 m. ما خطؤه؟',
            options: [
              `حاسبته مبرمجة بالراديان ( ${key('R')} ): $45 \\times \\tan 32 = 29{,}74527187$`,
              'دوّر $\\tan 32^{\\circ}$ إلى 0,01 قبل الضرب',
              'ضرب في $\\sin 32^{\\circ}$ بدل $\\tan 32^{\\circ}$',
            ],
            correct: 0,
            explain: `بالدرجة $\\tan 32^{\\circ} = 0{,}6248693519$ ، أمّا $\\tan 32 = 0{,}6610060415$ فظلّ 32 راديانًا. النتيجة الخاطئة «معقولة» في الظاهر، لذلك نتأكّد من الحرف ${key('D')} قبل كل حساب. ( $45 \\times 0{,}62 = 27{,}9$ و $45 \\times \\sin 32^{\\circ} = 23{,}84636689$ .)` },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tadwir-dalaqa'],
            prompt: 'عرض الوادي $BT$ مدوّرا إلى 0,1 m:', expected: 28.1, display: '28,1', suffix: 'm',
            explain: 'الشاشة $28{,}11912084$ : رقم الأجزاء من 100 هو 1، وهو أصغر من 5: $BT \\approx 28{,}1$ m.' },
          { kind: 'solution', lines: [
            'في المثلث $ABT$ القائم في $B$ : $\\tan\\widehat{BAT} = \\dfrac{BT}{AB}$ ، إذن $BT = 45 \\times \\tan 32^{\\circ}$ .',
            'بالحاسبة المبرمجة بالدرجة: $45 \\times \\tan 32^{\\circ} = 28{,}11912084$ .',
            'عرض الوادي $BT \\approx 28{,}1$ m.',
          ] },
        ],
      },
      {
        label: '2)', title: 'التحقّق بالليزر',
        question: 'للتحقّق من قراءة المزواة، قاس مساعده بجهاز ليزر المسافة $AT$ فوجد 53 m. عيّن قيس الزاوية $\\widehat{BAT}$ انطلاقا من $AB$ و $AT$ ، مدوّرا إلى الوحدة. هل يؤكّد هذا القياس قراءة المزواة؟',
        asks: ['قيس الزاوية $\\widehat{BAT}$ انطلاقا من $AB$ و $AT$', 'هل يؤكّد القياس قراءة المزواة؟'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['nisba-muthallathiya'],
            prompt: 'النسبة التي تربط $AB$ و $AT$ بالزاوية $\\widehat{BAT}$ :',
            options: ['$\\cos\\widehat{BAT} = \\dfrac{45}{53}$', '$\\sin\\widehat{BAT} = \\dfrac{45}{53}$', '$\\tan\\widehat{BAT} = \\dfrac{45}{53}$', '$\\cos\\widehat{BAT} = \\dfrac{53}{45}$'],
            correct: 0, cols: 2,
            explain: '$[AB]$ مجاور للزاوية $\\widehat{BAT}$ و $[AT]$ وترها: جيب التمام = المجاور ÷ الوتر. ( $\\dfrac{53}{45} > 1$ لا يكون جيب تمام.)' },
          { kind: 'choice', role: 'translate', requires: ['hasiba-zawiya', 'tadwir-dalaqa'],
            prompt: 'البرنامج الذي يعطي قيس الزاوية دون تدوير مبكّر:',
            options: [key('ON 2nd cos⁻¹ ( 45 ÷ 53 ) ='), key('ON cos ( 45 ÷ 53 ) ='), key('ON 2nd sin⁻¹ ( 45 ÷ 53 ) ='), key('ON 2nd cos⁻¹ ( 53 ÷ 45 ) =')],
            correct: 0,
            explain: `نعرف جيب التمام ونريد الزاوية: ${key('2nd')} ثم ${key('cos⁻¹')} ، والقسمة داخل القوسين بكل أرقامها. ${key('cos')} وحدها تعطي جيب تمام زاوية قيسها أقلّ من $1^{\\circ}$ ( $0{,}9998902031$ )، و ${key('sin⁻¹')} تعطي الزاوية الأخرى ( $58{,}1092082^{\\circ}$ )، و $\\dfrac{53}{45}$ تعطي «خطأ رياضي».` },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tadwir-dalaqa'],
            prompt: 'قيس الزاوية $\\widehat{BAT}$ مدوّرا إلى الوحدة (بالدرجة):', expected: 32, suffix: '°',
            explain: 'الشاشة $31{,}8907918$ : رقم الأجزاء من 10 هو 8، وهو أكبر من 5: $\\widehat{BAT} \\approx 32^{\\circ}$ .' },
          { kind: 'choice', role: 'conclude', ask: 1,
            prompt: 'هل يؤكّد قياس الليزر قراءة المزواة؟',
            options: ['نعم: القياسان يعطيان $32^{\\circ}$ بالتدوير إلى الوحدة', 'لا: الشاشة لا تعرض $32$ بالضبط', 'لا يمكن الحكم: الليزر أدقّ من المزواة'],
            correct: 0,
            explain: 'المزواة تقرأ إلى الدرجة، والمدوّر إلى الوحدة للقيس $31{,}89^{\\circ}$ هو $32^{\\circ}$ : القياسان متوافقان.' },
          { kind: 'solution', lines: [
            'في المثلث $ABT$ القائم في $B$ : $\\cos\\widehat{BAT} = \\dfrac{AB}{AT} = \\dfrac{45}{53}$ .',
            `بالحاسبة: ${key('ON 2nd cos⁻¹ ( 45 ÷ 53 ) =')} يعطي $31{,}8907918$ ، إذن $\\widehat{BAT} \\approx 32^{\\circ}$ .`,
            'قياس الليزر يؤكّد قراءة المزواة $32^{\\circ}$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'وحدات الجسر',
        question: 'احسب طول الجسر. كم وحدة معدنية يلزم؟ وما ثمنها؟',
        asks: ['طول الجسر', 'عدد الوحدات المعدنية', 'ثمن الوحدات'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'طول الجسر (بالمتر، إلى 0,1):', expected: 32.1, display: '32,1', suffix: 'm',
            explain: '$28{,}1 + 2 + 2 = 32{,}1$ : عرض الوادي ومتران للتثبيت من كل جهة.' },
          { kind: 'numeric', role: 'compute',
            prompt: 'ناتج قسمة طول الجسر على طول الوحدة:', expected: 10.7, display: '10,7',
            explain: '$\\dfrac{32{,}1}{3} = 10{,}7$ .' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'عدد الوحدات المعدنية اللازمة:', expected: 11,
            explain: 'عشر وحدات تغطي $10 \\times 3 = 30$ m فقط، أقلّ من $32{,}1$ m: تلزم وحدة حادية عشرة. (هنا لا نبتر: الجسر لا يكتمل بـ 10 وحدات.)' },
          { kind: 'numeric', role: 'answer', ask: 2,
            prompt: 'ثمن الوحدات:', expected: 748000, suffix: 'دج',
            explain: '$11 \\times 68000 = 748000$ .' },
          { kind: 'solution', lines: [
            'طول الجسر: $28{,}1 + 2 \\times 2 = 32{,}1$ m.',
            '$\\dfrac{32{,}1}{3} = 10{,}7$ : عشر وحدات لا تكفي ( $10 \\times 3 = 30 < 32{,}1$ )، يلزم 11 وحدة.',
            'الثمن: $11 \\times 68000 = 748000$ ، أي 748000 دج.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
