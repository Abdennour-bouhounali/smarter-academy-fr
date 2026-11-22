/**
 * Les trois « مسائل » du درس 1 de l'unité 10 (modules 5, 6, 7) — des exercices COMPLETS de type امتحان,
 * résolus pas à pas (common/problems/GuidedProblem.jsx).
 *
 * AJOUTS DE LA PLATEFORME, déclarés comme tels (`addition('exam_style_problem')`) : le manuel ne les contient pas.
 * Ils restent dans le périmètre de la leçon : nommer وتر / مقابل / مجاور, écrire cos / sin / tan, la constance des
 * rapports pour un angle donné, 0 < sin, cos < 1, et calculer une longueur avec le sinus, le cosinus ou la tangente
 * (la calculatrice donne le rapport d'un angle CONNU, comme dans les طرائق) — jamais retrouver un angle à partir de
 * son rapport (درس 2), ni les relations cos² + sin² = 1 / tan = sin ÷ cos (درس 3).
 *
 * La مسألة 1 est « مسألة الدرس » : son énoncé et sa figure vivent dans `LESSON_CONFIG.lessonProblem` (montrés dès le
 * sommaire et rappelés au module 1, prolongement des rampes à 40° du niveau متقدم), et se résout ici.
 * La مسألة 2 n'a pas de figure : une rampe à 5° est une bande de rapport 11 / 1 (figureQuality la refuserait), et
 * l'énoncé ne renvoie à aucun شكل — l'élève situe D, E, F d'après le texte.
 *
 * Chaque nombre et chaque égalité écrite est vérifié par calcul dans ./problems.test.js.
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  // ── مسألة 1 — trois rampes : ABC (3 ; 1,8 ; 2,4), A′B′C′ (même angle, planche 2), MNP (40°, hauteur 1,2) ──
  {
    id: 'masala-1',
    title: 'مسألة 1 — منحدرات حديقة التزلّج',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🛹',
    source: SOURCE,
    statement: LESSON_CONFIG.lessonProblem.statement,
    figure: LESSON_CONFIG.lessonProblem.figure,
    data: [
      { id: 'first', text: 'المنحدر الأول: طول اللوح 3 m والارتفاع 1,8 m', useful: true },
      { id: 'beginner', text: 'منحدر المبتدئين: الزاوية نفسها ولوح طوله 2 m', useful: true },
      { id: 'pro', text: 'منحدر المحترفين: زاوية 40° وارتفاع منحدر المبتدئين', useful: true },
      { id: 'stock', text: 'ألواح المخزن: 1,8 m و 2 m فقط', useful: true },
      { id: 'hour', text: 'تفتح الحديقة على الساعة 9 صباحًا', useful: false },
      { id: 'visitors', text: 'نحو 200 متزلّج في الأسبوع', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'المنحدر الأول',
        question: 'احسب الطول $AB$. احسب $\\sin\\widehat{B}$ ، ثم احسب $\\tan\\widehat{B}$.',
        asks: ['الطول $AB$', 'جيب الزاوية $\\widehat{B}$', 'ظل الزاوية $\\widehat{B}$'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['fithaghuras'],
            prompt: 'المثلث $ABC$ قائم في $A$. طول الأرضية $AB$ (بالمتر):', expected: 2.4, display: '2,4',
            explain: 'خاصية فيثاغورس: $AB^2 = BC^2 - AC^2 = 9 - 3{,}24 = 5{,}76$ ، و $2{,}4 \\times 2{,}4 = 5{,}76$ ، إذن $AB = 2{,}4$ m.' },
          { kind: 'choice', role: 'translate', requires: ['jayb', 'muqabil-mujawir'],
            prompt: 'بالنسبة إلى الزاوية $\\widehat{B}$ ، الضلع المقابل والوتر هما:',
            options: ['$[AC]$ و $[BC]$', '$[AB]$ و $[BC]$', '$[AC]$ و $[AB]$'],
            correct: 0, cols: 3,
            explain: '$[AC]$ لا يمرّ بالرأس $B$ فهو المقابل، و $[BC]$ يقابل الزاوية القائمة فهو الوتر. ($[AB]$ هو المجاور.)' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['jayb'],
            prompt: '$\\sin\\widehat{B} =$', expected: 0.6, display: '0,6',
            explain: '$\\sin\\widehat{B} = \\dfrac{AC}{BC} = \\dfrac{1{,}8}{3} = 0{,}6$ : المقابل على الوتر.' },
          { kind: 'numeric', role: 'answer', ask: 2, requires: ['thill'],
            prompt: '$\\tan\\widehat{B} =$', expected: 0.75, display: '0,75',
            explain: '$\\tan\\widehat{B} = \\dfrac{AC}{AB} = \\dfrac{1{,}8}{2{,}4} = 0{,}75$ : المقابل على المجاور، والظل لا يستعمل الوتر.' },
          { kind: 'solution', ask: 0, lines: [
            'المثلث $ABC$ قائم في $A$: $AB^2 = 3^2 - 1{,}8^2 = 5{,}76$ ، إذن $AB = 2{,}4$ m.',
            '$\\sin\\widehat{B} = \\dfrac{AC}{BC} = \\dfrac{1{,}8}{3} = 0{,}6$.',
            '$\\tan\\widehat{B} = \\dfrac{AC}{AB} = \\dfrac{1{,}8}{2{,}4} = 0{,}75$.',
          ] },
        ],
      },
      {
        label: '2)', title: 'منحدر المبتدئين',
        question: 'دون أيّ قياس، احسب ارتفاع منحدر المبتدئين $A\'C\'$ ، ثم احسب طول أرضيته $A\'B\'$.',
        asks: ["الارتفاع $A'C'$", "طول الأرضية $A'B'$"],
        steps: [
          { kind: 'choice', role: 'conclude', requires: ['nisab-zawiya'],
            prompt: 'ماذا تعرف عن $\\sin\\widehat{B\'}$ دون أن تقيس شيئًا؟',
            options: [
              '$\\sin\\widehat{B\'} = \\sin\\widehat{B}$ : للمنحدرين الزاوية نفسها، والجيب لا يتعلق بطول اللوح',
              '$\\sin\\widehat{B\'} < \\sin\\widehat{B}$ لأنّ لوح منحدر المبتدئين أقصر',
              'لا يمكن معرفته دون قياس ارتفاع منحدر المبتدئين',
            ],
            correct: 0,
            explain: 'النسبة «المقابل على الوتر» لا تتعلق إلا بقيس الزاوية: كما في منحدراتك بزاوية $40^{\\circ}$ ، تغيّر طول اللوح ولم تتغيّر النسبة.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['nisab-zawiya', 'hisab-tul'],
            prompt: 'ارتفاع منحدر المبتدئين $A\'C\'$ (بالمتر):', expected: 1.2, display: '1,2',
            explain: '$\\dfrac{A\'C\'}{B\'C\'} = \\sin\\widehat{B} = 0{,}6$ ، ومنه $A\'C\' = 2 \\times 0{,}6 = 1{,}2$ m: المطلوب في البسط فنضرب.' },
          { kind: 'numeric', role: 'compute', requires: ['jayb'],
            prompt: 'في المنحدر الأول: $\\cos\\widehat{B} = \\dfrac{AB}{BC} =$', expected: 0.8, display: '0,8',
            explain: '$\\cos\\widehat{B} = \\dfrac{2{,}4}{3} = 0{,}8$ : المجاور على الوتر.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['nisab-zawiya', 'hisab-tul'],
            prompt: 'طول أرضية منحدر المبتدئين $A\'B\'$ (بالمتر):', expected: 1.6, display: '1,6',
            explain: '$\\cos\\widehat{B\'} = \\cos\\widehat{B} = 0{,}8$ ، ومنه $A\'B\' = 2 \\times 0{,}8 = 1{,}6$ m. (تحقّق بالظل: $\\dfrac{1{,}2}{1{,}6} = 0{,}75$.)' },
          { kind: 'solution', ask: 0, lines: [
            'للمنحدرين الزاوية نفسها، والنسب المثلثية لا تتعلق إلا بقيس الزاوية: $\\sin\\widehat{B\'} = 0{,}6$ و $\\cos\\widehat{B\'} = 0{,}8$.',
            '$\\sin\\widehat{B\'} = \\dfrac{A\'C\'}{B\'C\'}$ ومنه $A\'C\' = 2 \\times 0{,}6 = 1{,}2$ ، و $\\cos\\widehat{B\'} = \\dfrac{A\'B\'}{B\'C\'}$ ومنه $A\'B\' = 2 \\times 0{,}8 = 1{,}6$.',
            'ارتفاع منحدر المبتدئين 1,2 m وطول أرضيته 1,6 m.',
          ] },
        ],
      },
      {
        label: '3)', title: 'لوح منحدر المحترفين',
        question: 'احسب طول لوح منحدر المحترفين $NP$ مدوّرا إلى 0,01 m. أيّ لوح من المخزن يختار العمّال؟',
        asks: ['طول اللوح $NP$', 'اللوح الذي يختاره العمّال'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['jayb', 'hisab-tul'],
            prompt: 'في المثلث $MNP$ القائم في $M$ ، بالنسبة إلى الزاوية $\\widehat{N}$ ، الارتفاع $[MP]$ واللوح $[NP]$ هما:',
            options: ['المقابل والوتر: يربطهما الجيب', 'المجاور والوتر: يربطهما جيب التمام', 'المقابل والمجاور: يربطهما الظل'],
            correct: 0,
            explain: '$[MP]$ لا يمرّ بالرأس $N$ فهو المقابل، و $[NP]$ يقابل الزاوية القائمة فهو الوتر: $\\sin\\widehat{N} = \\dfrac{MP}{NP}$.' },
          { kind: 'choice', role: 'conclude', requires: ['hisab-tul'],
            prompt: 'من $\\sin 40^{\\circ} = \\dfrac{MP}{NP}$ نستنتج:',
            options: ['$NP = \\dfrac{1{,}2}{\\sin 40^{\\circ}}$', '$NP = 1{,}2 \\times \\sin 40^{\\circ}$', '$NP = \\dfrac{1{,}2}{\\cos 40^{\\circ}}$'],
            correct: 0, cols: 3,
            explain: 'الارتفاع $MP = 1{,}2$ m (ارتفاع منحدر المبتدئين)، والمطلوب $NP$ في المقام فنقسم. ($1{,}2 \\times \\sin 40^{\\circ}$ أصغر من الارتفاع نفسه فلا يكون وترا، وجيب التمام يربط المجاور بالوتر.)' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hisab-tul'],
            prompt: 'طول اللوح $NP$ مدوّرا إلى 0,01 (بالمتر):', expected: 1.87, display: '1,87',
            explain: 'بالحاسبة: $\\dfrac{1{,}2}{\\sin 40^{\\circ}} \\approx 1{,}87$ (الشاشة 1,866868592: الرقم الثالث بعد الفاصلة 6 فنرفع).' },
          { kind: 'choice', role: 'conclude', ask: 1,
            prompt: 'أيّ لوح يختار العمّال؟',
            options: [
              'اللوح ذا 2 m: لأنّ $1{,}87 > 1{,}8$ ، فاللوح ذو 1,8 m قصير',
              'اللوح ذا 1,8 m: لأنّ $\\dfrac{1{,}2}{\\cos 40^{\\circ}} \\approx 1{,}57$ وهو يكفي',
              'اللوح ذا 1,8 m: لأنه الأقصر والأرخص',
            ],
            correct: 0,
            explain: 'اللوح هو الوتر وطوله نحو 1,87 m: لوح 1,8 m لا يكفي. (القيمة 1,57 تأتي من جيب التمام، أي من الخلط بين المقابل والمجاور.)' },
          { kind: 'solution', ask: 0, lines: [
            'المثلث $MNP$ قائم في $M$: $\\sin\\widehat{N} = \\dfrac{MP}{NP}$ أي $\\sin 40^{\\circ} = \\dfrac{1{,}2}{NP}$.',
            'ومنه $NP = \\dfrac{1{,}2}{\\sin 40^{\\circ}} \\approx 1{,}87$ m.',
            'بما أنّ $1{,}87 > 1{,}8$ ، يختار العمّال اللوح الذي طوله 2 m.',
          ] },
        ],
      },
    ],
  },

  // ── مسألة 2 — rampe d'accès : DEF rectangle en E, EF = 3 × 15 cm = 0,45 m, D̂ = 5° ; espace libre 5,15 m ──
  {
    id: 'masala-2',
    title: 'مسألة 2 — منحدر الكرسي المتحرّك',
    context: 'مدخل المتوسطة: منحدر لتلميذ على كرسي متحرّك',
    emoji: '♿',
    source: SOURCE,
    illustration: { kind: 'scene', icon: 'house', bg: 'blue', chips: [{ label: 'ارتفاع الدرجة', value: 15, unit: 'cm', tone: 'blue' }, { label: 'زاوية المنحدر', value: 5, unit: '°', tone: 'amber' }, { label: 'الفضاء الحرّ', value: '5,15', unit: 'm', tone: 'green' }, { label: 'درابزين المتر', value: 2800, unit: 'دج', tone: 'rose' }], extra: ['person'], ariaLabel: 'مدخل متوسطة بثلاث درجات ارتفاع كل منها 15 cm، ومنحدر بزاوية 5°، وفضاء حرّ طوله 5,15 m ودرابزين ثمن المتر منه 2800 دج' },
    statement: 'قرّرت البلدية تهيئة مدخل متوسطة لتلميذ يتنقّل على كرسي متحرّك، وأصرّ زملاؤه على أن يدخل المتوسطة وحده مثلهم. باب المدخل مرتفع عن أرض الساحة بثلاث درجات، ارتفاع كلّ درجة 15 cm. سيُبنى منحدر مستقيم $[DF]$ : النقطة $D$ على أرض الساحة، والنقطة $F$ عند عتبة الباب، و $E$ نقطة الأرض الواقعة تحت $F$ مباشرة، فالمثلث $DEF$ قائم في $E$. لكي يصعد التلميذ وحده، يجب أن يصنع المنحدر مع الأرض زاوية $\\widehat{EDF} = 5^{\\circ}$. أمام الباب فضاء حرّ طوله 5,15 m، ويُركَّب على جانبي المنحدر درابزين ثمن المتر الواحد منه 2800 دج. في المتوسطة 640 تلميذًا.',
    data: [
      { id: 'steps', text: 'الباب مرتفع بثلاث درجات', useful: true },
      { id: 'step-height', text: 'ارتفاع الدرجة الواحدة 15 cm', useful: true },
      { id: 'angle', text: 'زاوية المنحدر مع الأرض 5°', useful: true },
      { id: 'space', text: 'الفضاء الحرّ أمام الباب 5,15 m', useful: true },
      { id: 'rail', text: 'ثمن المتر من الدرابزين 2800 دج', useful: true },
      { id: 'pupils', text: 'في المتوسطة 640 تلميذًا', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'طول المنحدر',
        question: 'احسب طول المنحدر $DF$ مدوّرا إلى 0,01 m.',
        asks: ['طول المنحدر $DF$'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'compute',
            prompt: 'الارتفاع $EF$ بالمتر:', expected: 0.45, display: '0,45',
            explain: '$3 \\times 15 = 45$ cm، أي $0{,}45$ m.' },
          { kind: 'choice', role: 'translate', requires: ['jayb', 'muqabil-mujawir'],
            prompt: 'بالنسبة إلى الزاوية $\\widehat{D}$ ، الضلعان $[EF]$ و $[DF]$ هما:',
            options: ['المقابل والوتر: يربطهما الجيب', 'المجاور والوتر: يربطهما جيب التمام', 'المقابل والمجاور: يربطهما الظل'],
            correct: 0,
            explain: '$[EF]$ لا يمرّ بالرأس $D$ فهو المقابل، و $[DF]$ يقابل الزاوية القائمة $E$ فهو الوتر.' },
          { kind: 'choice', role: 'conclude', requires: ['hisab-tul'],
            prompt: 'من $\\sin 5^{\\circ} = \\dfrac{EF}{DF}$ نستنتج:',
            options: ['$DF = \\dfrac{0{,}45}{\\sin 5^{\\circ}}$', '$DF = 0{,}45 \\times \\sin 5^{\\circ}$', '$DF = \\dfrac{\\sin 5^{\\circ}}{0{,}45}$'],
            correct: 0, cols: 3,
            explain: 'المطلوب $DF$ في المقام: $DF \\times \\sin 5^{\\circ} = 0{,}45$ ، فنقسم. ($0{,}45 \\times \\sin 5^{\\circ}$ أقصر من الارتفاع نفسه.)' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hisab-tul'],
            prompt: 'طول المنحدر $DF$ مدوّرا إلى 0,01 (بالمتر):', expected: 5.16, display: '5,16',
            explain: 'بالحاسبة: $\\dfrac{0{,}45}{\\sin 5^{\\circ}} \\approx 5{,}16$ (الشاشة 5,163170961).' },
          { kind: 'solution', ask: 0, lines: [
            '$EF = 3 \\times 15 = 45$ cm أي $0{,}45$ m، والمثلث $DEF$ قائم في $E$.',
            '$\\sin\\widehat{D} = \\dfrac{EF}{DF}$ أي $\\sin 5^{\\circ} = \\dfrac{0{,}45}{DF}$ ، ومنه $DF = \\dfrac{0{,}45}{\\sin 5^{\\circ}} \\approx 5{,}16$.',
            'طول المنحدر نحو 5,16 m.',
          ] },
        ],
      },
      {
        label: '2)', title: 'هل يتّسع الفضاء؟',
        question: 'احسب الطول الأفقي $DE$ للمنحدر مدوّرا إلى 0,01 m. هل يتّسع الفضاء الحرّ أمام الباب لهذا المنحدر؟',
        asks: ['الطول الأفقي $DE$', 'هل يتّسع الفضاء الحرّ للمنحدر؟'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['thill', 'hisab-tul'],
            prompt: 'لحساب $DE$ انطلاقًا من الارتفاع المعلوم $EF$ ، نكتب:',
            options: ['$\\tan 5^{\\circ} = \\dfrac{EF}{DE}$', '$\\sin 5^{\\circ} = \\dfrac{EF}{DE}$', '$\\tan 5^{\\circ} = \\dfrac{DE}{EF}$'],
            correct: 0, cols: 3,
            explain: 'بالنسبة إلى $\\widehat{D}$ : $[EF]$ مقابل و $[DE]$ مجاور، والظل هو المقابل على المجاور. ($[DE]$ ليس وترا، و $\\dfrac{DE}{EF}$ مقلوبة.)' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hisab-tul'],
            prompt: 'الطول الأفقي $DE$ مدوّرا إلى 0,01 (بالمتر):', expected: 5.14, display: '5,14',
            explain: '$DE = \\dfrac{0{,}45}{\\tan 5^{\\circ}} \\approx 5{,}14$ (الشاشة 5,143523536). نحسب من الارتفاع المضبوط 0,45 لا من القيمة المدوّرة 5,16.' },
          { kind: 'choice', role: 'conclude', ask: 1,
            prompt: 'هل يتّسع الفضاء الحرّ أمام الباب لهذا المنحدر؟',
            options: [
              'نعم: المنحدر يشغل على الأرض الطول الأفقي $DE$ ، و $5{,}14 < 5{,}15$',
              'لا: طول المنحدر $5{,}16$ m و $5{,}16 > 5{,}15$',
              'لا يمكن الحكم دون معرفة طول الدرابزين',
            ],
            correct: 0,
            explain: 'الفضاء الحرّ طول على الأرض، فنقارنه بالطول الأفقي $DE$ لا باللوح المائل $DF$ ، وهو الوتر فهو أطول من $DE$.' },
          { kind: 'solution', ask: 0, lines: [
            'بالنسبة إلى $\\widehat{D}$ : $\\tan 5^{\\circ} = \\dfrac{EF}{DE}$ ، ومنه $DE = \\dfrac{0{,}45}{\\tan 5^{\\circ}} \\approx 5{,}14$.',
            'الفضاء الحرّ يقاس على الأرض: $5{,}14 < 5{,}15$.',
            'إذن يتّسع الفضاء أمام الباب للمنحدر (بفارق صغير جدّا).',
          ] },
        ],
      },
      {
        label: '3)', title: 'ثمن الدرابزين',
        question: 'يُركَّب الدرابزين على جانبي المنحدر بطول اللوح $[DF]$. احسب ثمن الدرابزين مستعملا المدوّر الذي وجدته للطول $DF$.',
        asks: ['ثمن الدرابزين'],
        steps: [
          { kind: 'choice', role: 'translate',
            prompt: 'طول الدرابزين اللازم هو:',
            options: ['$2 \\times DF$', '$2 \\times DE$', '$DF$'],
            correct: 0, cols: 3,
            explain: 'درابزين على كلّ جانب من جانبي المنحدر، وكلّ واحد بطول اللوح المائل $DF$.' },
          { kind: 'numeric', role: 'compute',
            prompt: 'طول الدرابزين (بالمتر):', expected: 10.32, display: '10,32',
            explain: '$2 \\times 5{,}16 = 10{,}32$ m.' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'ثمن الدرابزين:', expected: 28896, suffix: 'دج',
            explain: '$10{,}32 \\times 2800 = 28896$.' },
          { kind: 'solution', lines: [
            'طول الدرابزين: $2 \\times 5{,}16 = 10{,}32$ m.',
            'الثمن: $10{,}32 \\times 2800 = 28896$ ، أي 28896 دج.',
          ] },
        ],
      },
    ],
  },

  // ── مسألة 3 — toit : RST isocèle de sommet T, RS = 8, H milieu de [RS], R̂ = 42° ; maison de 10 m ──
  {
    id: 'masala-3',
    title: 'مسألة 3 — سقف البيت',
    context: 'سقف مائل بوجهين يُغطّى بالقرميد',
    emoji: '🏠',
    source: SOURCE,
    statement: 'يبني مقاول أمين في مدينة باتنة بيتًا لأسرة بسيطة بإتقان؛ سقفه مائل بوجهين ليسيل عنه ماء المطر والثلج. مقطع السقف (الشكل المقابل) مثلث $RST$ متساوي الساقين رأسه $T$ ، حيث $RS = 8$ m هو عرض البيت، و $H$ منتصف $[RS]$ و $(TH)$ عمودي على $(RS)$. زاوية ميل السقف $\\widehat{TRH} = 42^{\\circ}$. طول البيت 10 m، وكلّ وجه من وجهي السقف مستطيل. ثمن المتر المربّع من القرميد مع تركيبه 1200 دج. للبيت 4 غرف، وثمن بابه الخشبي 25000 دج.',
    figure: {
      points: { R: [0, 0], S: [8, 0], H: [4, 0], T: [4, 3.602] },
      segments: [['R', 'T'], ['T', 'S'], ['R', 'H'], ['H', 'S'], { from: 'T', to: 'H', tone: 'slate' }],
      rightAngles: [['T', 'H', 'S']],
      angles: [{ at: 'R', from: 'H', to: 'T', label: '42°' }],
      ariaLabel: 'مقطع السقف: مثلث RST متساوي الساقين رأسه T، و H منتصف RS و TH عمودي على RS، والزاوية TRH قيسها 42 درجة',
      maxWidth: 360,
    },
    data: [
      { id: 'width', text: 'عرض البيت 8 m', useful: true },
      { id: 'mid', text: 'H منتصف عرض البيت والارتفاع عمودي عليه', useful: true },
      { id: 'angle', text: 'زاوية ميل السقف 42°', useful: true },
      { id: 'length', text: 'طول البيت 10 m', useful: true },
      { id: 'tile', text: 'ثمن المتر المربّع من القرميد 1200 دج', useful: true },
      { id: 'rooms', text: 'للبيت 4 غرف', useful: false },
      { id: 'door', text: 'ثمن الباب الخشبي 25000 دج', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'ارتفاع السقف',
        question: 'احسب ارتفاع السقف $TH$ مدوّرا إلى 0,01 m.',
        asks: ['ارتفاع السقف $TH$'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'compute',
            prompt: 'الطول $RH$ (بالمتر):', expected: 4,
            explain: '$H$ منتصف $[RS]$ : $RH = 8 \\div 2 = 4$ m.' },
          { kind: 'choice', role: 'translate', requires: ['thill', 'hisab-tul'],
            prompt: 'في المثلث $RHT$ القائم في $H$ ، بالنسبة إلى الزاوية $\\widehat{R}$ ، نكتب:',
            options: ['$\\tan\\widehat{R} = \\dfrac{TH}{RH}$', '$\\sin\\widehat{R} = \\dfrac{TH}{RH}$', '$\\tan\\widehat{R} = \\dfrac{RH}{TH}$'],
            correct: 0, cols: 3,
            explain: '$[TH]$ مقابل للزاوية $\\widehat{R}$ و $[RH]$ مجاور لها، والظل هو المقابل على المجاور. (الجيب يحتاج الوتر $[RT]$.)' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hisab-tul'],
            prompt: 'ارتفاع السقف $TH$ مدوّرا إلى 0,01 (بالمتر):', expected: 3.6, display: '3,60',
            explain: '$TH = 4 \\times \\tan 42^{\\circ} \\approx 3{,}60$ (الشاشة 3,601616177): المطلوب في البسط فنضرب.' },
          { kind: 'solution', ask: 0, lines: [
            '$H$ منتصف $[RS]$ إذن $RH = 4$ m، والمثلث $RHT$ قائم في $H$.',
            '$\\tan\\widehat{R} = \\dfrac{TH}{RH}$ أي $\\tan 42^{\\circ} = \\dfrac{TH}{4}$ ، ومنه $TH = 4 \\times \\tan 42^{\\circ} \\approx 3{,}60$.',
            'ارتفاع السقف نحو 3,60 m.',
          ] },
        ],
      },
      {
        label: '2)', title: 'قول العامل',
        question: 'قال أحد العمّال: «$RT = 4 \\times \\cos 42^{\\circ}$». برهن دون حساب أنّ قوله خاطئ، ثم احسب $RT$ مدوّرا إلى 0,01 m.',
        asks: ['برهن أنّ قول العامل خاطئ', 'الطول $RT$'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['hudud'],
            prompt: 'لماذا لا يمكن أن يكون $RT = 4 \\times \\cos 42^{\\circ}$ ؟',
            options: [
              '$0 < \\cos 42^{\\circ} < 1$ فالجداء أصغر من 4، بينما $[RT]$ وتر المثلث $RHT$ فهو أطول من $RH = 4$',
              '$\\cos 42^{\\circ} > 1$ فالجداء أطول من السقف كلّه',
              'في المثلث متساوي الساقين يجب أن يكون $RT = TH$',
            ],
            correct: 0,
            explain: 'جيب تمام زاوية حادة محصور تماما بين 0 و 1، والوتر أطول أضلاع المثلث القائم: الوتر لا يكون جداء ضلع آخر في جيب التمام. (في المثلث $RST$ الساقان المتقايسان هما $[TR]$ و $[TS]$.)' },
          { kind: 'choice', role: 'translate', requires: ['jayb', 'hisab-tul'],
            prompt: 'بالنسبة إلى الزاوية $\\widehat{R}$ ، النسبة التي تربط $RH$ و $RT$ هي:',
            options: ['$\\cos\\widehat{R} = \\dfrac{RH}{RT}$', '$\\sin\\widehat{R} = \\dfrac{RH}{RT}$', '$\\cos\\widehat{R} = \\dfrac{RT}{RH}$'],
            correct: 0, cols: 3,
            explain: '$[RH]$ مجاور للزاوية $\\widehat{R}$ و $[RT]$ هو الوتر: جيب التمام هو المجاور على الوتر. (العامل ضرب، والمطلوب في المقام.)' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hisab-tul'],
            prompt: 'الطول $RT$ مدوّرا إلى 0,01 (بالمتر):', expected: 5.38, display: '5,38',
            explain: '$RT = \\dfrac{4}{\\cos 42^{\\circ}} \\approx 5{,}38$ (الشاشة 5,382530918): المطلوب في المقام فنقسم.' },
          { kind: 'solution', ask: 0, lines: [
            '$[RT]$ وتر المثلث $RHT$ القائم في $H$ فهو أطول من $RH = 4$ ، و $0 < \\cos 42^{\\circ} < 1$ يعطي $4 \\times \\cos 42^{\\circ} < 4$ : قول العامل خاطئ.',
            '$\\cos 42^{\\circ} = \\dfrac{RH}{RT} = \\dfrac{4}{RT}$ ، ومنه $RT = \\dfrac{4}{\\cos 42^{\\circ}} \\approx 5{,}38$.',
            'طول وجه السقف من $R$ إلى $T$ نحو 5,38 m.',
          ] },
        ],
      },
      {
        label: '3)', title: 'ثمن القرميد',
        question: 'كلّ وجه من وجهي السقف مستطيل بُعداه $RT$ وطول البيت. احسب ثمن القرميد اللازم مستعملا المدوّر الذي وجدته للطول $RT$.',
        asks: ['ثمن القرميد'],
        steps: [
          { kind: 'choice', role: 'translate',
            prompt: 'مساحة السقف كلّه (بالمتر المربّع) هي:',
            options: ['$2 \\times RT \\times 10$', '$RS \\times 10$', '$RT \\times 10$'],
            correct: 0, cols: 3,
            explain: 'وجهان، كلّ وجه مستطيل بُعداه $RT$ و 10 m. ($RS \\times 10$ مساحة أرض البيت، والسقف المائل أوسع منها؛ و $RT \\times 10$ وجه واحد.)' },
          { kind: 'numeric', role: 'compute',
            prompt: 'مساحة السقف (بالمتر المربّع):', expected: 107.6, display: '107,6',
            explain: '$2 \\times 5{,}38 \\times 10 = 107{,}6$ m².' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'ثمن القرميد اللازم:', expected: 129120, suffix: 'دج',
            explain: '$107{,}6 \\times 1200 = 129120$.' },
          { kind: 'solution', lines: [
            'مساحة السقف: $2 \\times 5{,}38 \\times 10 = 107{,}6$ m².',
            'الثمن: $107{,}6 \\times 1200 = 129120$ ، أي 129120 دج.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
