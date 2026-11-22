/**
 * Les trois « مسائل » du درس « الزاوية المحيطية والزاوية المركزية » (unité 13, modules 5, 6, 7) — des exercices COMPLETS
 * de type امتحان, résolus pas à pas (common/problems/GuidedProblem.jsx).
 *
 * AJOUTS DE LA PLATEFORME, déclarés comme tels (`addition('exam_style_problem')`) : le manuel ne les contient pas. Ils
 * restent dans le périmètre de la leçon : reconnaître une زاوية محيطية (sommet SUR le cercle — un sommet intérieur n'en est
 * pas une, exercice 12), خاصية 1 dans les deux sens (l'inscrit = la moitié de l'angle au centre ; l'angle au centre = le
 * double de l'inscrit), خاصية 2 (deux inscrits qui interceptent le même arc sont égaux), le cas du diamètre (angle plat
 * 180°, inscrit 90°) — jamais le دوران (درسان 1–2), ni le polygone régulier (درس 4), ni l'angle au centre rentrant.
 * Le piège de chaque مسألة : doubler au lieu de diviser par 2 (ou l'inverse quand on remonte de l'inscrit au centre).
 *
 * La مسألة 1 est « مسألة الدرس » : son énoncé ET sa figure vivent dans `LESSON_CONFIG.lessonProblem` (montrés dès le
 * sommaire et rappelés au module 1, prolongement du نشاط 4 du lab متقدم : un point sur le grand arc, puis l'extrémité d'un
 * diamètre). Les figures sont posées par leurs DIRECTIONS sur le cercle (`on`, content/figures.js) ; chaque angle et
 * chaque nombre est recalculé dans ./problems.test.js (rotation.js sur les points dessinés).
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';
import { on } from './figures.js';

const SOURCE = addition('exam_style_problem');
const ARC_AB = '$\\overset{\\frown}{AB}$';

/* مسألة 2 — l'amphithéâtre : A 58°, B 122° (la scène en haut, AOB = 64°), M 235°, L 300°, le photographe P à l'intérieur. */
export const FIG_MASALA_2 = {
  points: { O: [0, 0], A: on(58, 3), B: on(122, 3), M: on(235, 3), L: on(300, 3), P: [0.5, -1.3] },
  circles: [{ center: 'O', radius: 3 }],
  arcs: [{ center: 'O', from: 'A', to: 'B', sweep: 'ccw', tone: 'rose', bold: true }],
  segments: [
    { from: 'A', to: 'B', tone: 'rose', bold: true },
    { from: 'O', to: 'A', tone: 'indigo', dashed: true }, { from: 'O', to: 'B', tone: 'indigo', dashed: true },
    { from: 'M', to: 'A', tone: 'amber' }, { from: 'M', to: 'B', tone: 'amber' },
    { from: 'L', to: 'A', tone: 'emerald' }, { from: 'L', to: 'B', tone: 'emerald' },
    { from: 'P', to: 'A', tone: 'slate', dashed: true }, { from: 'P', to: 'B', tone: 'slate', dashed: true },
  ],
  angles: [{ at: 'M', from: 'A', to: 'B', tone: 'amber', label: '32°', radius: 28 }],
  ariaLabel: 'دائرة (𝒞) مركزها O، طرفا واجهة الخشبة A و B عليها، الكرسيان M و L على القوس الكبير والزاوية AMB قيسها 32 درجة، والمصوّر P داخل الدائرة',
  caption: 'شكل من المنصّة',
  maxWidth: 400,
};

/* مسألة 3 — le rond-point : A 70°, B −2° (AOB = 72°), D 178° ([BD] diamètre), C 225°. */
export const FIG_MASALA_3 = {
  points: { O: [0, 0], A: on(70, 3), B: on(-2, 3), C: on(225, 3), D: on(178, 3) },
  circles: [{ center: 'O', radius: 3 }],
  arcs: [{ center: 'O', from: 'B', to: 'A', sweep: 'ccw', tone: 'emerald', bold: true }],
  segments: [
    { from: 'B', to: 'D', tone: 'indigo' }, { from: 'O', to: 'A', tone: 'emerald' },
    { from: 'C', to: 'A', tone: 'amber' }, { from: 'C', to: 'B', tone: 'amber' },
    ['D', 'A'], ['A', 'B'],
  ],
  angles: [{ at: 'C', from: 'A', to: 'B', tone: 'amber', label: '36°', radius: 28 }],
  ariaLabel: 'دائرة (𝒞) حافّة جزيرة الدوّار ومركزها O، أعمدة الإنارة A و B و C و D عليها، [BD] قطر، والزاوية ACB قيسها 36 درجة',
  caption: 'شكل من المنصّة',
  maxWidth: 400,
};

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — حصّة التسديد',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '⚽',
    source: SOURCE,
    statement: LESSON_CONFIG.lessonProblem.statement,
    figure: LESSON_CONFIG.lessonProblem.figure,
    data: [
      { id: 'circle', text: 'A و B و S و Y نقط من الدائرة (𝒞) التي مركزها O', useful: true },
      { id: 'central', text: 'قيس الزاوية المركزية AOB هو 76 درجة', useful: true },
      { id: 'samir', text: 'S خارج القوس الصغير AB', useful: true },
      { id: 'diameter', text: '[AY] قطر للدائرة (𝒞)', useful: true },
      { id: 'beginners', text: 'المبتدئون يحتاجون زاوية تسديد قيسها 42 درجة على الأقل', useful: true },
      { id: 'radius', text: 'نصف قطر الدائرة 11 مترًا', useful: false },
      { id: 'players', text: 'في الحصّة 14 لاعبًا', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'زاوية تسديد سمير',
        question: 'ما نوع الزاوية $\\widehat{ASB}$ في الدائرة (𝒞)؟ احسب قيس زاوية التسديد $\\widehat{ASB}$ .',
        asks: ['نوع الزاوية $\\widehat{ASB}$', 'قيس $\\widehat{ASB}$'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tarif'],
            prompt: 'الزاوية $\\widehat{ASB}$ في الدائرة (𝒞) هي:',
            options: [
              'زاوية محيطية: رأسها S على (𝒞) وضلعاها يقطعان (𝒞) في A و B',
              `زاوية مركزية لأنها تحصر القوس ${ARC_AB}`,
              'ليست محيطية لأن [SA] و [SB] ليسا قطرين',
            ],
            correct: 0,
            explain: 'رأس الزاوية المركزية هو المركز O. رأس $\\widehat{ASB}$ هو S، نقطة من (𝒞)، وضلعاها الوتران [SA] و [SB]: زاوية محيطية (لا يُشترط أن يكون ضلعاها قطرين).' },
          { kind: 'choice', role: 'translate', requires: ['khassiya-nisf', 'tariqa-qaws'],
            prompt: `الزاويتان $\\widehat{ASB}$ و $\\widehat{AOB}$ تحصران نفس القوس ${ARC_AB} ، إذن:`,
            options: [
              '$\\widehat{ASB} = \\dfrac{1}{2}\\widehat{AOB}$',
              '$\\widehat{ASB} = 2\\widehat{AOB}$',
              '$\\widehat{ASB} = \\widehat{AOB}$',
              '$\\widehat{ASB} = 180^\\circ - \\widehat{AOB}$',
            ],
            correct: 0, cols: 2,
            explain: 'قيس الزاوية المحيطية نصف قيس الزاوية المركزية التي تحصر معها نفس القوس — لا ضعفها، ولا يساويها.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['khassiya-nisf'], suffix: '°',
            prompt: 'قيس زاوية التسديد $\\widehat{ASB}$ بالدرجة:', expected: 38,
            explain: '$\\widehat{ASB} = \\dfrac{76^\\circ}{2} = 38^\\circ$ . (من يجد $152^\\circ$ ضاعف بدل أن يقسم على 2.)' },
          { kind: 'solution', ask: 1, lines: [
            `رأس الزاوية $\\widehat{ASB}$ هو S من (𝒞) وضلعاها وتران: زاوية محيطية تحصر القوس ${ARC_AB} مع الزاوية المركزية $\\widehat{AOB}$ .`,
            '$\\widehat{ASB} = \\dfrac{1}{2}\\widehat{AOB} = \\dfrac{76^\\circ}{2} = 38^\\circ$',
            'يسدّد سمير بزاوية قيسها $38^\\circ$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'يونس على طرف القطر',
        question: '[AY] قطر للدائرة (𝒞). احسب قيس زاوية تسديد يونس $\\widehat{AYB}$ ، ثم احسب قيس الزاوية $\\widehat{ABY}$ .',
        asks: ['قيس $\\widehat{AYB}$', 'قيس $\\widehat{ABY}$'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['khassiya-tasawi'],
            prompt: 'الزاويتان المحيطيتان $\\widehat{AYB}$ و $\\widehat{ASB}$ :',
            options: [
              `تحصران نفس القوس ${ARC_AB} لأن S و Y كلتاهما خارج القوس الصغير: متقايستان`,
              'غير متقايستين لأن [AY] قطر و [SA] ليس قطرًا',
              'تحصران قوسين مختلفين لأن Y أبعد من S عن المرمى',
            ],
            correct: 0,
            explain: `S و Y على القوس الكبير، فكلتا الزاويتين تحصر القوس الصغير ${ARC_AB} : زاويتان محيطيتان تحصران القوس نفسه متقايستان، سواء كان أحد ضلعيهما قطرًا أم لا (قول هوارية).` },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['khassiya-tasawi'], suffix: '°',
            prompt: 'قيس زاوية تسديد يونس $\\widehat{AYB}$ بالدرجة:', expected: 38,
            explain: '$\\widehat{AYB} = \\widehat{ASB} = 38^\\circ$ ، وأيضًا $\\dfrac{76^\\circ}{2} = 38^\\circ$ (قول مزيان: [AY] قطر).' },
          { kind: 'choice', role: 'translate', requires: ['qutr-qaima'],
            prompt: 'الزاوية $\\widehat{ABY}$ رأسها B على (𝒞) وتحصر نصف الدائرة $\\overset{\\frown}{AY}$ الذي لا يحوي B. الزاوية المركزية التي تحصر نفس القوس هي:',
            options: [
              'الزاوية المستقيمة $\\widehat{AOY}$ لأن [AY] قطر',
              'الزاوية $\\widehat{AOB}$',
              'الزاوية $\\widehat{ASB}$',
            ],
            correct: 0,
            explain: 'O منتصف القطر [AY]: الزاوية $\\widehat{AOY}$ مستقيمة قيسها $180^\\circ$ ، وهي الزاوية المركزية التي تحصر نصف الدائرة $\\overset{\\frown}{AY}$ . أما $\\widehat{AOB}$ فتحصر القوس AB، و $\\widehat{ASB}$ ليست مركزية.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['qutr-qaima'], suffix: '°',
            prompt: 'قيس الزاوية $\\widehat{ABY}$ بالدرجة:', expected: 90,
            explain: '$\\widehat{ABY} = \\dfrac{180^\\circ}{2} = 90^\\circ$ : المثلث ABY قائم في B.' },
          { kind: 'solution', ask: 0, lines: [
            `S و Y على القوس الكبير: $\\widehat{AYB}$ و $\\widehat{ASB}$ محيطيتان تحصران القوس ${ARC_AB} نفسه، إذن $\\widehat{AYB} = \\widehat{ASB} = 38^\\circ$ .`,
            '[AY] قطر: $\\widehat{AOY} = 180^\\circ$ ، و $\\widehat{ABY}$ محيطية تحصر معها نفس القوس، إذن $\\widehat{ABY} = \\dfrac{180^\\circ}{2} = 90^\\circ$ .',
            'يسدّد يونس بزاوية $38^\\circ$ مثل سمير، والمثلث ABY قائم في B.',
          ] },
        ],
      },
      {
        label: '3)', title: 'دائرة للمبتدئين',
        question: 'هل تناسب الدائرة (𝒞) المبتدئين؟ يريد المدرّب رسم دائرة أخرى مركزها $O_1$ تمرّ بالقائمين A و B، يرى منها كل رامٍ على قوسها الكبير المرمى بزاوية قيسها $42^\\circ$ بالضبط. احسب قيس الزاوية المركزية $\\widehat{AO_1B}$ .',
        asks: ['هل تناسب الدائرة (𝒞) المبتدئين؟', 'قيس $\\widehat{AO_1B}$'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['khassiya-tasawi'],
            prompt: 'من أيّ موضع على القوس الكبير للدائرة (𝒞)، زاوية التسديد:',
            options: [
              'قيسها $38^\\circ$ في كل المواضع، و $38^\\circ < 42^\\circ$ : (𝒞) لا تناسب المبتدئين',
              'تكبر كلما ابتعد الرامي عن المرمى: (𝒞) تناسب المبتدئين من بعيد',
              'قيسها $76^\\circ$ ، و $76^\\circ > 42^\\circ$ : (𝒞) تناسب المبتدئين',
            ],
            correct: 0,
            explain: `كل الزوايا المحيطية التي تحصر القوس ${ARC_AB} متقايسة: قيسها $38^\\circ$ أينما وقف الرامي على القوس الكبير، و $38^\\circ < 42^\\circ$ . ($76^\\circ$ هي الزاوية المركزية، رأسها O لا الرامي.)` },
          { kind: 'choice', role: 'translate', requires: ['khassiya-nisf'],
            prompt: 'في الدائرة الجديدة، زاوية التسديد المحيطية والزاوية المركزية $\\widehat{AO_1B}$ تحصران نفس القوس، إذن:',
            options: [
              '$\\widehat{AO_1B} = 2 \\times 42^\\circ$',
              '$\\widehat{AO_1B} = \\dfrac{42^\\circ}{2}$',
              '$\\widehat{AO_1B} = 42^\\circ$',
            ],
            correct: 0, cols: 3,
            explain: 'المحيطية نصف المركزية، فالمركزية ضعف المحيطية: هنا المعلوم هو الزاوية المحيطية، فنضرب في 2.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['khassiya-nisf'], suffix: '°',
            prompt: 'قيس الزاوية المركزية $\\widehat{AO_1B}$ بالدرجة:', expected: 84,
            explain: '$\\widehat{AO_1B} = 2 \\times 42^\\circ = 84^\\circ$ ، وفعلًا $\\dfrac{84^\\circ}{2} = 42^\\circ$ . (من يجد $21^\\circ$ قسم على 2 بدل أن يضرب في 2.)' },
          { kind: 'solution', ask: 1, lines: [
            'على (𝒞) كل زاوية تسديد من القوس الكبير قيسها $38^\\circ$ ، و $38^\\circ < 42^\\circ$ : الدائرة (𝒞) لا تناسب المبتدئين.',
            'في الدائرة الجديدة: $\\widehat{AO_1B} = 2 \\times 42^\\circ = 84^\\circ$',
            'يرسم المدرّب دائرة تمرّ بالقائمين A و B زاويتها المركزية $\\widehat{AO_1B} = 84^\\circ$ .',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — مسرح الهواء الطلق',
    context: 'زاوية رؤية الخشبة من الكراسي ومصابيح برج الإضاءة',
    emoji: '🎭',
    source: SOURCE,
    statement: `في مسرح الهواء الطلق لدار الثقافة، صُفّت كراسي الصفّ الأوّل على دائرة (𝒞) مركزها O، وطرفا واجهة الخشبة A و B نقطتان من (𝒞) كما في الشكل. من كرسيّه M على (𝒞) خارج القوس الصغير ${ARC_AB} ، قاس أنيس بتطبيق في هاتفه زاوية رؤية الخشبة فوجد $\\widehat{AMB} = 32^\\circ$ . يجلس صديقه وليد في الكرسي L من (𝒞) على نفس القوس الذي عليه M، ويقف المصوّر في النقطة P داخل الدائرة. في المركز O برج إضاءة: كل مصباح فيه يضيء حزمة زاويتها $25^\\circ$ ، وثمن المصباح الواحد 14500 دج. يتّسع المسرح لـ 320 متفرّجًا، ويبدأ العرض في التاسعة ليلًا في موعده احترامًا للحضور.`,
    figure: FIG_MASALA_2,
    data: [
      { id: 'circle', text: 'A و B و M نقط من الدائرة (𝒞) التي مركزها O، و M خارج القوس الصغير AB', useful: true },
      { id: 'amb', text: 'قيس الزاوية AMB هو 32 درجة', useful: true },
      { id: 'seats', text: 'L نقطة من (𝒞) على نفس القوس الذي عليه M، و P داخل الدائرة', useful: true },
      { id: 'lamp', text: 'حزمة المصباح 25 درجة', useful: true },
      { id: 'price', text: 'ثمن المصباح 14500 دج', useful: true },
      { id: 'seats-count', text: 'المسرح يتّسع لـ 320 متفرّجًا', useful: false },
      { id: 'time', text: 'يبدأ العرض في التاسعة ليلًا', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'من البرج في المركز',
        question: 'ما نوع الزاوية $\\widehat{AOB}$ ؟ احسب قيسها.',
        asks: ['نوع الزاوية $\\widehat{AOB}$', 'قيس $\\widehat{AOB}$'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tarif'],
            prompt: 'الزاوية $\\widehat{AOB}$ هي:',
            options: [
              `زاوية مركزية تحصر القوس ${ARC_AB} مع الزاوية المحيطية $\\widehat{AMB}$`,
              'زاوية محيطية لأن A و B على الدائرة',
              'ليست مركزية لأن O ليست على الدائرة',
            ],
            correct: 0,
            explain: 'رأس $\\widehat{AOB}$ هو المركز O: زاوية مركزية. الزاوية المحيطية رأسها على الدائرة، لا يكفي أن يكون طرفا ضلعيها عليها.' },
          { kind: 'choice', role: 'translate', requires: ['khassiya-nisf', 'tariqa-qaws'],
            prompt: `المعلوم هو الزاوية المحيطية $\\widehat{AMB}$ ، والمطلوب الزاوية المركزية التي تحصر معها القوس ${ARC_AB} . العلاقة الصحيحة:`,
            options: [
              '$\\widehat{AOB} = 2\\widehat{AMB}$',
              '$\\widehat{AOB} = \\dfrac{1}{2}\\widehat{AMB}$',
              '$\\widehat{AOB} = \\widehat{AMB}$',
              '$\\widehat{AOB} = 180^\\circ - \\widehat{AMB}$',
            ],
            correct: 0, cols: 2,
            explain: 'المحيطية نصف المركزية: $\\widehat{AMB} = \\dfrac{1}{2}\\widehat{AOB}$ ، فالمركزية ضعف المحيطية.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['khassiya-nisf'], suffix: '°',
            prompt: 'قيس $\\widehat{AOB}$ بالدرجة:', expected: 64,
            explain: '$\\widehat{AOB} = 2 \\times 32^\\circ = 64^\\circ$ . (من يجد $16^\\circ$ قسم على 2 بدل أن يضرب في 2.)' },
          { kind: 'solution', ask: 1, lines: [
            `$\\widehat{AOB}$ زاوية مركزية و $\\widehat{AMB}$ زاوية محيطية تحصران نفس القوس ${ARC_AB} ، إذن $\\widehat{AMB} = \\dfrac{1}{2}\\widehat{AOB}$ .`,
            '$\\widehat{AOB} = 2 \\times 32^\\circ = 64^\\circ$',
            'من برج الإضاءة في O تُرى واجهة الخشبة بزاوية قيسها $64^\\circ$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'وليد والمصوّر',
        question: 'ما قيس زاوية رؤية وليد $\\widehat{ALB}$ ؟ هل الزاوية $\\widehat{APB}$ التي يرى منها المصوّر الخشبة زاوية محيطية؟',
        asks: ['قيس $\\widehat{ALB}$', 'هل $\\widehat{APB}$ زاوية محيطية؟'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['khassiya-tasawi'],
            prompt: 'L و M على نفس القوس، فالزاويتان المحيطيتان $\\widehat{ALB}$ و $\\widehat{AMB}$ :',
            options: [
              `تحصران القوس ${ARC_AB} نفسه: متقايستان`,
              'مختلفتان لأن L أقرب من M إلى طرف الخشبة A',
              '$\\widehat{ALB}$ ضعف $\\widehat{AMB}$',
            ],
            correct: 0,
            explain: 'زاويتان محيطيتان تحصران القوس نفسه متقايستان، مهما كان موضع الكرسي على القوس الكبير.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['khassiya-tasawi'], suffix: '°',
            prompt: 'قيس زاوية رؤية وليد $\\widehat{ALB}$ بالدرجة:', expected: 32,
            explain: '$\\widehat{ALB} = \\widehat{AMB} = 32^\\circ$ ، وأيضًا $\\dfrac{64^\\circ}{2} = 32^\\circ$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['tarif'],
            prompt: 'الزاوية $\\widehat{APB}$ التي يرى منها المصوّر الخشبة:',
            options: [
              'ليست محيطية: رأسها P داخل الدائرة لا عليها، فلا نطبّق عليها الخاصيتين',
              'محيطية لأن ضلعيها يمرّان بالنقطتين A و B من الدائرة',
              'مركزية لأن P داخل الدائرة',
            ],
            correct: 0,
            explain: 'الزاوية المحيطية رأسها نقطة من الدائرة. P داخل (𝒞): $\\widehat{APB}$ ليست محيطية، وقيسها ليس $32^\\circ$ (على الشكل هي أكبر). والزاوية المركزية رأسها المركز O وحده.' },
          { kind: 'solution', ask: 1, lines: [
            `L و M على القوس الكبير: $\\widehat{ALB}$ و $\\widehat{AMB}$ محيطيتان تحصران القوس ${ARC_AB} نفسه، إذن $\\widehat{ALB} = \\widehat{AMB} = 32^\\circ$ .`,
            'رأس الزاوية $\\widehat{APB}$ هو P، و P داخل الدائرة لا عليها: $\\widehat{APB}$ ليست زاوية محيطية.',
            'يرى وليد الخشبة بزاوية قيسها $32^\\circ$ مثل أنيس، أما زاوية المصوّر فلا تُحسب بخاصية النصف.',
          ] },
        ],
      },
      {
        label: '3)', title: 'مصابيح برج الإضاءة',
        question: 'يريد التقنيّ أن يضيء من البرج O كل واجهة الخشبة بمصابيح توضع حزمها جنبًا إلى جنب. كم مصباحًا يلزم على الأقل؟ احسب ثمن هذه المصابيح.',
        asks: ['عدد المصابيح اللازمة', 'ثمن المصابيح'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['tarif'],
            prompt: 'الزاوية التي يجب أن تغطيها حزم المصابيح من البرج هي:',
            options: [
              'الزاوية المركزية $\\widehat{AOB}$ ، لأن البرج في المركز O',
              'الزاوية المحيطية $\\widehat{AMB}$ ، لأنها زاوية رؤية الجمهور',
              'زاوية المصوّر $\\widehat{APB}$',
            ],
            correct: 0,
            explain: 'رأس الحزم هو O: من البرج تُرى الواجهة بالزاوية المركزية $\\widehat{AOB} = 64^\\circ$ ، لا بزاوية كرسي على الدائرة.' },
          { kind: 'numeric', role: 'compute', suffix: '°',
            prompt: 'الزاوية التي يغطيها مصباحان متجاوران بالدرجة:', expected: 50,
            explain: '$2 \\times 25^\\circ = 50^\\circ$ ، و $50^\\circ < 64^\\circ$ : مصباحان لا يكفيان.' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'عدد المصابيح اللازمة على الأقل:', expected: 3,
            explain: '$3 \\times 25^\\circ = 75^\\circ$ تغطي $64^\\circ$ كلها، ومصباحان لا يغطيان إلا $50^\\circ$ . (من اعتمد $32^\\circ$ وجد مصباحين: البرج في المركز، لا على كرسي.)' },
          { kind: 'numeric', role: 'answer', ask: 1, suffix: 'دج',
            prompt: 'ثمن المصابيح:', expected: 43500,
            explain: '$3 \\times 14500 = 43500$ دج.' },
          { kind: 'solution', ask: 1, lines: [
            'المصابيح في المركز O: يجب أن تغطي حزمها الزاوية المركزية $\\widehat{AOB} = 64^\\circ$ .',
            'مصباحان يغطيان $2 \\times 25^\\circ = 50^\\circ$ فقط، وثلاثة تغطي $3 \\times 25^\\circ = 75^\\circ$ .',
            'يلزم 3 مصابيح على الأقل، ثمنها $3 \\times 14500 = 43500$ دج.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — أعمدة إنارة الدوّار',
    context: 'من عمود الإنارة إلى الزاوية المركزية، وعشب حوض الجزيرة',
    emoji: '💡',
    source: SOURCE,
    statement: `جزيرة دوّار في مدخل المدينة قرص مركزه O ونصف قطره 10 أمتار، وحافّته الدائرة (𝒞). نصبت البلدية على (𝒞) أربعة أعمدة إنارة A و B و C و D كما في الشكل، حيث [BD] قطر يمرّ بالنصب التذكاري المنصوب في O، والعمودان C و D خارج القوس الصغير ${ARC_AB} . من العمود C قاس تقنيّ الزاوية $\\widehat{ACB} = 36^\\circ$ . طول كل عمود 9 أمتار. تريد البلدية، حفاظًا على نظافة الجزيرة وجمالها، زرع الحوض المحصور بين [OA] و [OB] والقوس الصغير ${ARC_AB} بالعشب، بثمن 400 دج للمتر المربّع (نأخذ $\\pi = 3{,}14$).`,
    figure: FIG_MASALA_3,
    data: [
      { id: 'circle', text: 'A و B و C و D نقط من الدائرة (𝒞) التي مركزها O ونصف قطرها 10 أمتار', useful: true },
      { id: 'acb', text: 'قيس الزاوية ACB هو 36 درجة', useful: true },
      { id: 'diameter', text: '[BD] قطر، و C و D خارج القوس الصغير AB', useful: true },
      { id: 'grass', text: 'ثمن العشب 400 دج للمتر المربّع', useful: true },
      { id: 'pole', text: 'طول كل عمود إنارة 9 أمتار', useful: false },
      { id: 'monument', text: 'في المركز O نصب تذكاري', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'من العمود C',
        question: 'احسب قيس الزاوية المركزية $\\widehat{AOB}$ ، ثم عيّن قيس الزاوية $\\widehat{ADB}$ دون قياس.',
        asks: ['قيس $\\widehat{AOB}$', 'قيس $\\widehat{ADB}$'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['khassiya-nisf', 'tariqa-qaws'],
            prompt: `الزاوية المحيطية $\\widehat{ACB}$ والزاوية المركزية $\\widehat{AOB}$ تحصران نفس القوس ${ARC_AB} ، إذن:`,
            options: [
              '$\\widehat{AOB} = 2\\widehat{ACB}$',
              '$\\widehat{AOB} = \\dfrac{1}{2}\\widehat{ACB}$',
              '$\\widehat{AOB} = \\widehat{ACB}$',
            ],
            correct: 0, cols: 3,
            explain: 'المحيطية نصف المركزية، فالمركزية ضعف المحيطية: المعلوم هنا الزاوية المحيطية، فنضرب في 2.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['khassiya-nisf'], suffix: '°',
            prompt: 'قيس $\\widehat{AOB}$ بالدرجة:', expected: 72,
            explain: '$\\widehat{AOB} = 2 \\times 36^\\circ = 72^\\circ$ . (من يجد $18^\\circ$ قسم على 2 بدل أن يضرب في 2.)' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['khassiya-tasawi'], suffix: '°',
            prompt: 'قيس $\\widehat{ADB}$ بالدرجة:', expected: 36,
            explain: `C و D خارج القوس الصغير: $\\widehat{ADB}$ و $\\widehat{ACB}$ محيطيتان تحصران القوس ${ARC_AB} نفسه، فهما متقايستان: $\\widehat{ADB} = \\widehat{ACB} = 36^\\circ$ .` },
          { kind: 'solution', ask: 0, lines: [
            `$\\widehat{ACB}$ محيطية و $\\widehat{AOB}$ مركزية تحصران القوس ${ARC_AB} ، إذن $\\widehat{AOB} = 2 \\times 36^\\circ = 72^\\circ$ .`,
            `$\\widehat{ADB}$ و $\\widehat{ACB}$ محيطيتان تحصران القوس ${ARC_AB} نفسه، إذن $\\widehat{ADB} = \\widehat{ACB} = 36^\\circ$ .`,
            'الزاوية المركزية $72^\\circ$ ، ومن العمود D تُرى A و B بزاوية $36^\\circ$ كما من C.',
          ] },
        ],
      },
      {
        label: '2)', title: 'القطر [BD]',
        question: 'بيّن أنّ المثلث ABD قائم في A، ثم احسب قيس الزاوية $\\widehat{ABD}$ .',
        asks: ['المثلث ABD قائم في A', 'قيس $\\widehat{ABD}$'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qutr-qaima'],
            prompt: 'لماذا المثلث ABD قائم في A؟',
            options: [
              '$\\widehat{BAD}$ محيطية تحصر نصف الدائرة مع الزاوية المستقيمة $\\widehat{BOD} = 180^\\circ$ ، فقيسها نصفها',
              'لأن $\\widehat{AOB} = 2\\widehat{ADB}$',
              'لأن [OA] نصف قطر عمودي على [BD]',
            ],
            correct: 0,
            explain: '[BD] قطر فـ O منتصفه و $\\widehat{BOD}$ زاوية مستقيمة قيسها $180^\\circ$ ؛ $\\widehat{BAD}$ محيطية تحصر معها نصف الدائرة الذي لا يحوي A: $\\widehat{BAD} = \\dfrac{180^\\circ}{2} = 90^\\circ$ . (العلاقة $\\widehat{AOB} = 2\\widehat{ADB}$ صحيحة لكنها تخصّ القوس AB، لا الزاوية التي رأسها A.)' },
          { kind: 'choice', role: 'translate', requires: ['tariqa-qaws', 'majmu-zawaya'],
            prompt: 'لحساب قيس $\\widehat{ABD}$ نستعمل:',
            options: [
              'مجموع أقياس زوايا المثلث ABD، لأننا نعرف زاويتيه الأخريين',
              'خاصية النصف: $\\widehat{ABD} = \\dfrac{1}{2}\\widehat{AOB}$',
              'التقايس: $\\widehat{ABD} = \\widehat{ADB}$ لأنهما في نفس المثلث',
            ],
            correct: 0,
            explain: 'رأس $\\widehat{ABD}$ هو B وهي تحصر القوس AD، لا القوس AB: لا تحصر نفس القوس مع $\\widehat{AOB}$ ولا مع $\\widehat{ADB}$ . نعرف من المثلث ABD زاويتين، فنكمل إلى $180^\\circ$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['majmu-zawaya'], suffix: '°',
            prompt: 'قيس $\\widehat{ABD}$ بالدرجة:', expected: 54,
            explain: 'مجموع أقياس زوايا المثلث ABD هو $180^\\circ$ : $\\widehat{ABD} = 180^\\circ - 90^\\circ - 36^\\circ = 54^\\circ$ .' },
          { kind: 'solution', ask: 0, lines: [
            '[BD] قطر: $\\widehat{BOD} = 180^\\circ$ ، و $\\widehat{BAD}$ محيطية تحصر معها نفس القوس، إذن $\\widehat{BAD} = \\dfrac{180^\\circ}{2} = 90^\\circ$ : المثلث ABD قائم في A.',
            'في المثلث ABD: $\\widehat{ABD} = 180^\\circ - 90^\\circ - 36^\\circ = 54^\\circ$',
            'المثلث ABD قائم في A، وقيس الزاوية $\\widehat{ABD}$ هو $54^\\circ$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'عشب الحوض',
        question: `احسب مساحة الحوض المحصور بين [OA] و [OB] والقوس الصغير ${ARC_AB} ، ثم احسب ثمن زرعه بالعشب.`,
        asks: ['مساحة الحوض', 'ثمن العشب'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['tarif'],
            prompt: 'الحوض جزء من قرص الجزيرة. أيّ جزء هو؟',
            options: [
              'خُمس القرص، لأن $\\widehat{AOB} = 72^\\circ$ و $\\dfrac{72}{360} = \\dfrac{1}{5}$',
              'عُشر القرص، لأن $\\widehat{ACB} = 36^\\circ$ و $\\dfrac{36}{360} = \\dfrac{1}{10}$',
              'نصف القرص، لأن [BD] قطر',
            ],
            correct: 0,
            explain: 'الحوض محصور بين نصفي القطرين [OA] و [OB]: زاويته هي الزاوية المركزية $\\widehat{AOB} = 72^\\circ$ من الدورة الكاملة $360^\\circ$ . ($36^\\circ$ زاوية محيطية رأسها C، لا O.)' },
          { kind: 'numeric', role: 'compute',
            prompt: 'مساحة قرص الجزيرة كله بالمتر المربّع:', expected: 314,
            explain: '$3{,}14 \\times 10 \\times 10 = 314$ متر مربّع.' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'مساحة الحوض بالمتر المربّع:', expected: 62.8, display: '62,8',
            explain: '$\\dfrac{314}{5} = 62{,}8$ متر مربّع. (من أخذ العُشر وجد $31{,}4$ : الزاوية $36^\\circ$ رأسها على الدائرة، لا في المركز.)' },
          { kind: 'numeric', role: 'answer', ask: 1, suffix: 'دج',
            prompt: 'ثمن زرع الحوض بالعشب:', expected: 25120,
            explain: '$62{,}8 \\times 400 = 25120$ دج.' },
          { kind: 'solution', ask: 1, lines: [
            '$\\widehat{AOB} = 72^\\circ$ و $\\dfrac{72}{360} = \\dfrac{1}{5}$ : الحوض خُمس قرص الجزيرة.',
            'مساحة الحوض: $\\dfrac{3{,}14 \\times 10 \\times 10}{5} = 62{,}8$ متر مربّع.',
            'ثمن العشب: $62{,}8 \\times 400 = 25120$ دج.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
