/**
 * Les trois « مسائل » du درس 3 « إنشاءات هندسية وتطبيقات خاصية طالس » (modules 4, 5, 6) — des exercices
 * COMPLETS de type امتحان, résolus pas à pas (common/problems/GuidedProblem.jsx).
 *
 * AJOUTS DE LA PLATEFORME, déclarés comme tels (`addition('exam_style_problem')`) : le manuel ne les contient
 * pas. Ils restent dans le périmètre de la leçon : partager un segment en parts égales (rayon auxiliaire,
 * graduations au compas, parallèles), le point de rapport donné (dedans ET dehors), la longueur construite
 * comme quatrième proportionnel — toujours justifiés par Thalès (leçon 1), jamais la réciproque (leçon 2).
 * Une construction ne se « dessine » pas dans GuidedProblem : l'élève ORDONNE les étapes, choisit les marques,
 * et calcule les longueurs obtenues ; chaque énoncé qui dit « الشكل » porte sa figure (GeoFigure).
 *
 * La مسألة 1 est « مسألة الدرس » : son énoncé ET sa figure vivent dans `LESSON_CONFIG.lessonProblem`
 * (montrés dès le sommaire et rappelés au module 1, prolongement du laboratoire متقدم — deux parallèles
 * graduées, rapport 3/2 → ici 4/3 sur 10 cm), et se résolvent ici.
 *
 * Contextes : la banderole du derby (le monde du laboratoire), la menuiserie (partager une planche), le plan
 * d'une allée de jardin à une échelle donnée — familles réservées à cette leçon (rollout unités 9–14).
 * Chaque nombre est recalculé dans ./problems.test.js (fractions exactes, figures vérifiées).
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

/** Les quatre étapes de la construction du point de rapport donné (مسألة 1, question 1), dans l'ordre. */
const RATIO_STEPS = [
  'أرسم المستقيمين المتوازيين $(d_1)$ و $(d_2)$ اللذين يشملان $A$ و $B$',
  'أدرّج $(d_1)$ و $(d_2)$ بنفس فتحة المدور',
  'أعيّن $F$ على $(d_1)$ و $E$ على $(d_2)$ في جهتين مختلفتين',
  'أرسم $(EF)$ فيقطع $[AB]$ في $M$',
];
const orderRow = (label, k, correction) => ({ label, options: RATIO_STEPS, correct: k, correction });

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — لافتة الدربي',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🥁',
    source: SOURCE,
    statement: LESSON_CONFIG.lessonProblem.statement,
    figure: LESSON_CONFIG.lessonProblem.figure,
    data: [
      { id: 'sheet', text: 'طول اللافتة على ورقة التصميم 10 cm', useful: true },
      { id: 'ratio', text: 'نسبة MA إلى MB هي 4 إلى 3', useful: true },
      { id: 'tools', text: 'مسطرة غير مدرّجة ومدور فقط', useful: true },
      { id: 'real', text: 'طول اللافتة الحقيقية 35 m', useful: true },
      { id: 'prices', text: 'القماش الأخضر بـ 650 دج للمتر والأحمر بـ 600 دج للمتر', useful: true },
      { id: 'fans', text: 'سيحضر الدربي نحو 3000 مناصر', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'إنشاء النقطة M',
        question: 'ما الترتيب الصحيح لخطوات إنشاء النقطة $M$ بالمسطرة غير المدرّجة والمدور؟ ثم احسب الطول $AM$ على ورقة التصميم.',
        asks: ['ترتيب خطوات الإنشاء', 'الطول $AM$ على ورقة التصميم'],
        steps: [
          { kind: 'sort' },
          { kind: 'batch', role: 'answer', ask: 0, requires: ['nuqta-nisba'],
            prompt: 'رتّب خطوات الإنشاء:',
            rows: [
              orderRow('الخطوة الأولى:', 0, 'نبدأ بالمستقيمين المتوازيين: عليهما تُبنى وضعية طالس.'),
              orderRow('الخطوة الثانية:', 1, 'ندرّجهما بنفس الوحدة، وإلا فلن تكون النسبة بين التدريجات هي $\\dfrac{4}{3}$ .'),
              orderRow('الخطوة الثالثة:', 2, '$AF = 4$ و $BE = 3$ تدريجات، في جهتين مختلفتين لتقع $M$ بين $A$ و $B$ .'),
              orderRow('الخطوة الرابعة:', 3, 'المستقيم $(EF)$ يقطع $[AB]$ في النقطة المطلوبة.'),
            ] },
          { kind: 'choice', role: 'conclude', requires: ['talis-nisab'],
            prompt: 'لماذا تحقّق النقطة $M$ النسبة المطلوبة؟',
            options: [
              '$(AF) // (BE)$ ، فالمثلثان $MAF$ و $MBE$ في وضعية طالس: $\\dfrac{MA}{MB} = \\dfrac{AF}{BE} = \\dfrac{4}{3}$',
              'لأنّ $(EF)$ يوازي $(AB)$',
              'لأنّ $M$ منتصف $[EF]$',
            ],
            correct: 0,
            explain: 'المستقيمان $(d_1)$ و $(d_2)$ متوازيان، و $M$ نقطة تقاطع $(AB)$ و $(EF)$ : حسب خاصية طالس $\\dfrac{MA}{MB} = \\dfrac{AF}{BE}$ . ($(EF)$ يقطع $(AB)$ فلا يوازيه، و $ME$ لا يساوي $MF$ لأنّ $\\dfrac{MF}{ME} = \\dfrac{4}{3}$ أيضًا.)' },
          { kind: 'choice', role: 'translate', requires: ['nuqta-nisba', 'kitabat-tanasub'],
            prompt: 'من $\\dfrac{MA}{MB} = \\dfrac{4}{3}$ ، ما الكسر $\\dfrac{AM}{AB}$ ؟',
            options: ['$\\dfrac{4}{7}$', '$\\dfrac{4}{3}$', '$\\dfrac{3}{7}$'],
            cols: 3, correct: 0,
            explain: '$AB = MA + MB$ : سبعة أجزاء متساوية، و $AM$ أربعة منها، فـ $\\dfrac{AM}{AB} = \\dfrac{4}{4 + 3} = \\dfrac{4}{7}$ . ($\\dfrac{4}{3}$ نسبة الجزأين لا نسبة الجزء إلى الكل، و $\\dfrac{3}{7}$ هي $\\dfrac{MB}{AB}$ .)' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['nuqta-nisba'],
            prompt: 'الطول $AM$ على ورقة التصميم:',
            options: ['$\\dfrac{40}{7}$ cm', '$\\dfrac{40}{3}$ cm', '$\\dfrac{30}{7}$ cm', '$\\dfrac{10}{7}$ cm'],
            cols: 2, correct: 0,
            explain: '$AM = \\dfrac{4}{7} \\times 10 = \\dfrac{40}{7}$ cm ، أي حوالي 5,7 cm : لا يُقاس بالضبط، والإنشاء يعطيه دون قياس. ($\\dfrac{40}{3}$ أطول من اللافتة نفسها، و $\\dfrac{30}{7}$ هو $MB$ ، و $\\dfrac{10}{7}$ جزء واحد فقط.)' },
          { kind: 'solution', ask: 1, lines: [
            'نرسم $(d_1)$ و $(d_2)$ متوازيين يشملان $A$ و $B$ ، ندرّجهما بنفس الوحدة، نعيّن $F$ و $E$ في جهتين مختلفتين حيث $AF = 4$ و $BE = 3$ ، فيقطع $(EF)$ القطعة $[AB]$ في $M$ .',
            '$(AF) // (BE)$ : حسب خاصية طالس $\\dfrac{MA}{MB} = \\dfrac{AF}{BE} = \\dfrac{4}{3}$ ، إذن $\\dfrac{AM}{AB} = \\dfrac{4}{4 + 3} = \\dfrac{4}{7}$ .',
            '$AM = \\dfrac{4}{7} \\times 10 = \\dfrac{40}{7}$ cm : هذا طول الشريط الأخضر على ورقة التصميم.',
          ] },
        ],
      },
      {
        label: '2)', title: 'نقطة ثانية',
        question: 'وضع وليد العلامة $E$ في نفس جهة $F$ (مع $BE = 3$ دائمًا)، فقطع المستقيم $(EF)$ المستقيم $(AB)$ في نقطة $N$ . أين تقع النقطة $N$ ؟ احسب الطول $AN$ .',
        asks: ['موضع النقطة $N$', 'الطول $AN$'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['talis-nisab', 'nuqtatan'],
            prompt: '$(AF) // (BE)$ . ماذا تعطي خاصية طالس في المثلثين $NAF$ و $NBE$ ؟',
            options: [
              '$\\dfrac{NA}{NB} = \\dfrac{AF}{BE} = \\dfrac{4}{3}$',
              '$\\dfrac{NA}{NB} = \\dfrac{BE}{AF} = \\dfrac{3}{4}$',
              '$\\dfrac{NA}{AB} = \\dfrac{AF}{BE} = \\dfrac{4}{3}$',
            ],
            correct: 0,
            explain: 'الضلعان المتوازيان $[AF]$ و $[BE]$ يقابلان $N$ : $\\dfrac{NA}{NB} = \\dfrac{AF}{BE} = \\dfrac{4}{3}$ ، النسبة نفسها التي تحقّقها $M$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['nuqtatan'],
            prompt: 'أين تقع النقطة $N$ ؟',
            options: [
              'على المستقيم $(AB)$ خارج $[AB]$ ، بعد $B$',
              'على المستقيم $(AB)$ خارج $[AB]$ ، قبل $A$',
              'بين $A$ و $B$ ، في النقطة $M$ نفسها',
            ],
            correct: 0,
            explain: 'العلامتان في نفس الجهة: $(EF)$ لا يعبر $[AB]$ ، فـ $N$ خارجها. و $NA > NB$ : $N$ أقرب إلى $B$ ، فهي بعد $B$ .' },
          { kind: 'numeric', role: 'compute', requires: ['nuqtatan'],
            prompt: 'إذا كان $NA$ أربعة أجزاء متساوية و $NB$ ثلاثة منها، فطول الجزء الواحد:',
            expected: 10, suffix: 'cm',
            explain: '$N$ بعد $B$ ، فـ $NA - NB = AB$ : الفرق $4 - 3 = 1$ جزء، وهو $AB = 10$ cm .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['nuqtatan'],
            prompt: 'الطول $AN$ :',
            expected: 40, suffix: 'cm',
            explain: '$AN = 4 \\times 10 = 40$ cm ، و $NB = 3 \\times 10 = 30$ cm : $\\dfrac{40}{30} = \\dfrac{4}{3}$ .' },
          { kind: 'choice', role: 'conclude', requires: ['nuqtatan'],
            prompt: 'هل تصلح $N$ لفصل الشريطين؟',
            options: [
              'لا: $N$ خارج اللافتة، على بعد 30 cm بعد $B$ ، والفاصل يجب أن يكون نقطة من $[AB]$',
              'نعم: لأنّها تحقّق النسبة $\\dfrac{4}{3}$ أيضًا',
              'نعم: إذا قصّرنا اللافتة إلى 40 cm',
            ],
            correct: 0,
            explain: 'نقطتان من المستقيم $(AB)$ تحقّقان النسبة نفسها، لكن واحدة فقط بين $A$ و $B$ : هي $M$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$(AF) // (BE)$ : حسب خاصية طالس $\\dfrac{NA}{NB} = \\dfrac{AF}{BE} = \\dfrac{4}{3}$ .',
            'العلامتان في نفس الجهة، و $NA > NB$ : $N$ على $(AB)$ خارج $[AB]$ بعد $B$ ، و $NA - NB = AB = 10$ cm .',
            'الجزء الواحد 10 cm ، فـ $AN = 4 \\times 10 = 40$ cm : النقطة $N$ خارج اللافتة ولا تصلح لفصل الشريطين.',
          ] },
        ],
      },
      {
        label: '3)', title: 'قماش اللافتة الحقيقية',
        question: 'في اللافتة الحقيقية تفصل النقطة $M$ الشريطين بالنسبة نفسها. احسب طول الشريط الأخضر الحقيقي. ما طول الشريط الأحمر؟ احسب ثمن القماش اللازم.',
        asks: ['طول الشريط الأخضر', 'طول الشريط الأحمر', 'ثمن القماش'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['nuqta-nisba'],
            prompt: 'كيف نحسب طول الشريط الأخضر الحقيقي؟',
            options: ['$\\dfrac{4}{7} \\times 35$', '$\\dfrac{4}{3} \\times 35$', '$\\dfrac{40}{7} \\times 35$'],
            cols: 3, correct: 0,
            explain: 'النسبة $\\dfrac{AM}{AB} = \\dfrac{4}{7}$ لا تتغيّر من الورقة إلى اللافتة الحقيقية: نأخذ أربعة أسباع 35 m . ($\\dfrac{4}{3}$ نسبة الجزأين، و $\\dfrac{40}{7}$ طول على الورقة بالسنتيمتر لا نسبة.)' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'طول الشريط الأخضر الحقيقي:', expected: 20, suffix: 'm',
            explain: '$\\dfrac{4}{7} \\times 35 = \\dfrac{140}{7} = 20$ m .' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'طول الشريط الأحمر الحقيقي:', expected: 15, suffix: 'm',
            explain: '$35 - 20 = 15$ m ، وفعلًا $\\dfrac{20}{15} = \\dfrac{4}{3}$ .' },
          { kind: 'numeric', role: 'compute',
            prompt: 'ثمن القماش الأخضر:', expected: 13000, suffix: 'دج',
            explain: '$20 \\times 650 = 13000$ دج .' },
          { kind: 'numeric', role: 'compute',
            prompt: 'ثمن القماش الأحمر:', expected: 9000, suffix: 'دج',
            explain: '$15 \\times 600 = 9000$ دج .' },
          { kind: 'numeric', role: 'answer', ask: 2,
            prompt: 'الثمن الإجمالي للقماش:', expected: 22000, suffix: 'دج',
            explain: '$13000 + 9000 = 22000$ دج . (عدد المناصرين لا يدخل في الحساب.)' },
          { kind: 'solution', ask: 2, lines: [
            '$\\dfrac{AM}{AB} = \\dfrac{4}{7}$ ، فطول الشريط الأخضر $\\dfrac{4}{7} \\times 35 = 20$ m ، وطول الأحمر $35 - 20 = 15$ m .',
            'ثمن القماش: $20 \\times 650 + 15 \\times 600 = 13000 + 9000 = 22000$ دج .',
            'يحتاج الأنصار 20 m من القماش الأخضر و 15 m من الأحمر، بثمن 22000 دج .',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — ورشة النجارة',
    context: 'واجهة خزانة تُقسم إلى أدراج دون قياس',
    emoji: '🪚',
    source: SOURCE,
    statement: 'في ورشة نجارة يصنع حرفيّ خزانة صغيرة بثلاثة أدراج متساوية الارتفاع. ارتفاع واجهتها $AB = 80$ cm وعرضها 60 cm. العدد 80 لا يقبل القسمة على 3، فلا يقيس الحرفيّ ارتفاع الدرج: يرسم على اللوح نصف مستقيم $[Ax)$ ، ويعيّن عليه بفتحة مدور قدرها 15 cm علامات متقايسة $P_1$ و $P_2$ و $P_3$ ، ثم يرسم الموازيات كما في الشكل، فتقطع $[AB]$ في $M_1$ و $M_2$ . الخشب من شجر الأرز، ويحرص الحرفيّ على ألّا يُهدر منه شيئًا.',
    // A en bas, B en haut (1 unité = 10 cm) ; u = (0,8 ; 0,6), AP1 = 1,5 unité ; M1, M2 au tiers et aux deux tiers.
    figure: {
      points: { A: [0, 0], B: [0, 8], P1: [1.2, 0.9], P2: [2.4, 1.8], P3: [3.6, 2.7], M1: [0, 2.6666666666666665], M2: [0, 5.333333333333333] },
      segments: [
        { from: 'A', to: 'B', bold: true },
        { from: 'A', to: 'P1', ticks: 1 }, { from: 'P1', to: 'P2', ticks: 1 }, { from: 'P2', to: 'P3', ticks: 1 },
        { from: 'P3', to: 'B', arrows: 1, tone: 'indigo' },
        { from: 'P2', to: 'M2', arrows: 1, tone: 'emerald' }, { from: 'P1', to: 'M1', arrows: 1, tone: 'emerald' },
      ],
      rays: [{ from: 'A', through: 'P3', name: 'x', extend: 0.3 }],
      labels: { A: 'sw', B: 'w', M1: 'w', M2: 'w', P1: 'se', P2: 'se', P3: 'se' },
      ariaLabel: 'واجهة الخزانة [AB] عمودية، ونصف مستقيم [Ax) عليه ثلاث قطع متقايسة AP1 و P1P2 و P2P3، والمستقيم (P3B) والموازيان له المارّان بـ P1 و P2 يقطعان [AB] في M1 و M2',
      maxWidth: 260,
    },
    data: [
      { id: 'height', text: 'ارتفاع الواجهة 80 cm', useful: true },
      { id: 'three', text: 'ثلاثة أدراج متساوية الارتفاع', useful: true },
      { id: 'tools', text: 'نصف مستقيم مساعد ومدور وموازيات', useful: true },
      { id: 'width', text: 'عرض الخزانة 60 cm', useful: true },
      { id: 'opening', text: 'فتحة المدور 15 cm', useful: false },
      { id: 'cedar', text: 'الخشب من شجر الأرز', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'ثلاثة أدراج متساوية',
        question: 'لماذا تقسم هذه الموازيات الواجهة إلى ثلاثة أدراج متساوية الارتفاع؟ احسب ارتفاع الدرج الواحد.',
        asks: ['لماذا الأدراج متساوية؟', 'ارتفاع الدرج الواحد'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tabrir-taqsim', 'talis-nisab'],
            prompt: 'لماذا تكون الأدراج الثلاثة متساوية؟',
            options: [
              '$(P_1M_1)$ و $(P_2M_2)$ يوازيان $(P_3B)$ ، فحسب خاصية طالس في المثلث $AP_3B$ : $\\dfrac{AM_1}{AB} = \\dfrac{AP_1}{AP_3} = \\dfrac{1}{3}$ و $\\dfrac{AM_2}{AB} = \\dfrac{AP_2}{AP_3} = \\dfrac{2}{3}$',
              'لأنّ فتحة المدور 15 cm مناسبة للواجهة',
              'لأنّ $AP_1 = AM_1$',
            ],
            correct: 0,
            explain: '$AP_3 = 3AP_1$ و $AP_2 = 2AP_1$ : النقطتان $M_1$ و $M_2$ عند ثلث $AB$ وثلثيه مهما كانت فتحة المدور. (لو كانت الفتحة 20 cm لحصلنا على النقطتين نفسيهما، و $AP_1$ على $[Ax)$ لا على $[AB]$ .)' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['tabrir-taqsim'],
            prompt: 'ارتفاع الدرج الواحد:',
            options: ['$\\dfrac{80}{3}$ cm', '$15$ cm', '$20$ cm', '$\\dfrac{3}{80}$ cm'],
            cols: 2, correct: 0,
            explain: '$AM_1 = \\dfrac{1}{3} \\times 80 = \\dfrac{80}{3}$ cm ، أي حوالي 26,7 cm . (15 cm فتحة المدور، و 20 cm من قسمة 80 على 4 بعدّ النقط $ و $ و $ و $ ، و $\\dfrac{3}{80}$ نسبة مقلوبة.)' },
          { kind: 'solution', ask: 1, lines: [
            'نعيّن على $[Ax)$ ثلاث علامات متقايسة، نصل $P_3$ بـ $B$ ، ونرسم الموازيين لـ $(P_3B)$ المارّين بـ $P_1$ و $P_2$ .',
            'في المثلث $AP_3B$ ، حسب خاصية طالس $\\dfrac{AM_1}{AB} = \\dfrac{AP_1}{AP_3} = \\dfrac{1}{3}$ ، و $\\dfrac{AM_2}{AB} = \\dfrac{AP_2}{AP_3} = \\dfrac{2}{3}$ .',
            'ارتفاع كل درج $\\dfrac{80}{3}$ cm ، مهما كانت فتحة المدور.',
          ] },
        ],
      },
      {
        label: '2)', title: 'درج علوي أصغر',
        question: 'غيّر الزبون طلبه: درجان سفليان متساويان، ودرج علوي ارتفاعه نصف ارتفاع درج سفلي. كم علامة متقايسة يلزم الآن على $[Ax)$ ؟ احسب ارتفاع الدرج السفلي، ثم ارتفاع الدرج العلوي.',
        asks: ['عدد العلامات المتقايسة', 'ارتفاع الدرج السفلي', 'ارتفاع الدرج العلوي'],
        steps: [
          { kind: 'choice', role: 'translate',
            prompt: 'إذا كان الدرج العلوي جزءًا واحدًا، فكم جزءًا متساويًا في الواجهة كلها؟',
            options: ['$2 + 2 + 1 = 5$ أجزاء', '3 أجزاء: ثلاثة أدراج', '$2 + 1 = 3$ أجزاء'],
            correct: 0,
            explain: 'كل درج سفلي ضعف العلوي، أي جزءان: $2 + 2 + 1 = 5$ أجزاء متساوية. (ثلاثة أدراج لا تعني ثلاثة أجزاء متساوية، و $2 + 1$ نسيت أحد الدرجين السفليين.)' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['taqsim-qitaa'],
            prompt: 'عدد العلامات المتقايسة على $[Ax)$ :', expected: 5,
            explain: 'خمسة أجزاء متساوية: خمس علامات، ونصل الخامسة بـ $B$ .' },
          { kind: 'choice', role: 'conclude', requires: ['taqsim-qitaa', 'tabrir-taqsim'],
            prompt: 'نصل آخر علامة بـ $B$ . بأيّ علامتين نرسم الموازيين لهذا المستقيم، والنقطة $A$ في أسفل الواجهة؟',
            options: [
              'بـ $P_2$ و $P_4$',
              'بـ $P_1$ و $P_3$',
              'بـ $P_1$ و $P_2$',
            ],
            correct: 0,
            explain: 'الموازي المارّ بـ $P_2$ يقطع $[AB]$ على $\\dfrac{2}{5}$ من $AB$ انطلاقًا من $A$ ، والمارّ بـ $P_4$ على $\\dfrac{4}{5}$ منه: من الأسفل جزءان ثم جزءان ثم جزء. ($P_1$ و $P_3$ يجعلان الدرج الأسفل هو الصغير، و $P_1$ و $P_2$ يتركان للعلوي ثلاثة أجزاء.)' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['tabrir-taqsim'],
            prompt: 'ارتفاع الدرج السفلي:', expected: 32, suffix: 'cm',
            explain: '$\\dfrac{2}{5} \\times 80 = 32$ cm .' },
          { kind: 'numeric', role: 'answer', ask: 2, requires: ['tabrir-taqsim'],
            prompt: 'ارتفاع الدرج العلوي:', expected: 16, suffix: 'cm',
            explain: '$\\dfrac{1}{5} \\times 80 = 16$ cm ، وهو نصف 32 cm . والمجموع $32 + 32 + 16 = 80$ cm .' },
          { kind: 'solution', ask: 1, lines: [
            'الواجهة $2 + 2 + 1 = 5$ أجزاء متساوية: نعيّن على $[Ax)$ خمس علامات متقايسة، نصل $P_5$ بـ $B$ ونرسم الموازيين المارّين بـ $P_2$ و $P_4$ .',
            'حسب خاصية طالس الجزء الواحد $\\dfrac{1}{5} \\times 80 = 16$ cm .',
            'ارتفاع كل درج سفلي $2 \\times 16 = 32$ cm ، وارتفاع الدرج العلوي 16 cm .',
          ] },
        ],
      },
      {
        label: '3)', title: 'الشريط النحاسي',
        question: 'يلصق الحرفيّ على محيط واجهة كل درج من الخزانة الجديدة شريطًا نحاسيًا. احسب الطول الكلّي للشريط بالمتر. ما ثمنه إذا كان المتر بـ 350 دج؟',
        asks: ['الطول الكلّي للشريط', 'ثمن الشريط'],
        steps: [
          { kind: 'numeric', role: 'compute',
            prompt: 'محيط واجهة درج سفلي:', expected: 184, suffix: 'cm',
            explain: 'مستطيل بعداه 60 cm و 32 cm : $2 \\times (60 + 32) = 184$ cm .' },
          { kind: 'numeric', role: 'compute',
            prompt: 'محيط واجهة الدرج العلوي:', expected: 152, suffix: 'cm',
            explain: 'مستطيل بعداه 60 cm و 16 cm : $2 \\times (60 + 16) = 152$ cm .' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'الطول الكلّي للشريط:', expected: 5.2, display: '5,2', suffix: 'm',
            explain: 'درجان سفليان ودرج علوي: $2 \\times 184 + 152 = 520$ cm ، أي 5,2 m .' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'ثمن الشريط:', expected: 1820, suffix: 'دج',
            explain: '$5{,}2 \\times 350 = 1820$ دج .' },
          { kind: 'solution', ask: 1, lines: [
            'محيط واجهة درج سفلي $2 \\times (60 + 32) = 184$ cm ، ومحيط واجهة الدرج العلوي $2 \\times (60 + 16) = 152$ cm .',
            'الطول الكلّي $2 \\times 184 + 152 = 520$ cm ، أي 5,2 m .',
            'ثمن الشريط $5{,}2 \\times 350 = 1820$ دج .',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — ممرّ الحديقة',
    context: 'طول على المخطّط بنسبة معلومة، ثم مواضع أحواض الزهور',
    emoji: '🌳',
    source: SOURCE,
    statement: 'ترسم مهندسة البلدية مخطّط حديقة الحيّ الجديدة، ليتعاون السكان على نظافتها، بحيث يمثّل كل 7 m في الحديقة 3 cm على المخطّط. الممرّ الرئيسي طوله الحقيقي 10 m، وطوله على المخطّط لا يُقاس بالضبط بمسطرة مدرّجة. لترسمه دون قياس، أنشأت القطعة $[AB]$ كما في الشكل: على نصف مستقيم $[Ax)$ عيّنت بالمدور $C$ و $D$ حيث $AC = 7$ cm و $AD = 10$ cm ، وعلى نصف مستقيم $[Ay)$ عيّنت $E$ حيث $AE = 3$ cm ، ثم رسمت الموازي لـ $(CE)$ المارّ بـ $D$ فقطع $[Ay)$ في $B$ . مساحة الحديقة 1200 m².',
    // [Ay) horizontal, [Ax) de direction (0,6 ; 0,8) ; AE = 3, AB = 30/7 (problems.test.js vérifie (CE) // (DB)).
    figure: {
      points: { A: [0, 0], C: [4.2, 5.6], D: [6, 8], E: [3, 0], B: [4.285714285714286, 0] },
      segments: [
        { from: 'A', to: 'C', label: '7', labelSide: 1 }, { from: 'A', to: 'E', label: '3' },
        { from: 'C', to: 'E', arrows: 1, tone: 'indigo' }, { from: 'D', to: 'B', arrows: 1, tone: 'indigo' },
      ],
      rays: [{ from: 'A', through: 'D', name: 'x', extend: 0.12 }, { from: 'A', through: 'B', name: 'y', extend: 0.35 }],
      labels: { A: 'sw', C: 'w', D: 'w', E: 's', B: 's' },
      ariaLabel: 'نصفا مستقيمين [Ax) و [Ay)، على الأول C و D حيث AC = 7 و AD = 10، وعلى الثاني E حيث AE = 3، والموازي للمستقيم (CE) المارّ بـ D يقطع [Ay) في B',
      maxWidth: 280,
    },
    data: [
      { id: 'scale', text: 'كل 7 m في الحديقة تمثّل 3 cm على المخطّط', useful: true },
      { id: 'path', text: 'الطول الحقيقي للممرّ 10 m', useful: true },
      { id: 'ray-x', text: 'AC = 7 cm و AD = 10 cm على [Ax)', useful: true },
      { id: 'ray-y', text: 'AE = 3 cm على [Ay)', useful: true },
      { id: 'parallel', text: 'الموازي لـ (CE) المارّ بـ D يقطع [Ay) في B', useful: true },
      { id: 'area', text: 'مساحة الحديقة 1200 m²', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الممرّ على المخطّط',
        question: 'لماذا يمثّل الطول $AB$ الممرّ على المخطّط؟ احسب هذا الطول.',
        asks: ['لماذا يمثّل $AB$ الممرّ؟', 'طول الممرّ على المخطّط'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['kitabat-tanasub'],
            prompt: 'ماذا تعني «كل 7 m تمثّل 3 cm» لطول الممرّ $AB$ على المخطّط؟',
            options: ['$\\dfrac{7}{10} = \\dfrac{3}{AB}$', '$\\dfrac{7}{3} = \\dfrac{AB}{10}$', '$\\dfrac{10}{7} = \\dfrac{3}{AB}$'],
            correct: 0,
            explain: 'الأطوال على المخطّط تتناسب مع الأطوال الحقيقية: 7 m ↔ 3 cm و 10 m ↔ $AB$ ، أي $\\dfrac{7}{10} = \\dfrac{3}{AB}$ . (الثانية والثالثة تخلطان، في نسبة واحدة، طولًا حقيقيًا بطول على المخطّط.)' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['insha-tul', 'talis-nisab'],
            prompt: 'لماذا تحقّق النقطة $B$ هذا التناسب؟',
            options: [
              '$(CE) // (DB)$ ، فحسب خاصية طالس $\\dfrac{AC}{AD} = \\dfrac{AE}{AB}$',
              '$(CE) // (DB)$ ، فحسب خاصية طالس $\\dfrac{AC}{AD} = \\dfrac{AB}{AE}$',
              'لأنّ $AD - AC = AE$',
            ],
            correct: 0,
            explain: 'في المثلثين $ACE$ و $ADB$ : $C$ من $[AD]$ و $E$ من $[AB]$ و $(CE) // (DB)$ ، فـ $\\dfrac{AC}{AD} = \\dfrac{AE}{AB}$ أي $\\dfrac{7}{10} = \\dfrac{3}{AB}$ . (الثانية تقلب نسبة واحدة، و $10 - 7 = 3$ صدفة لا تبرّر شيئًا.)' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['insha-tul'],
            prompt: 'طول الممرّ على المخطّط $AB$ :',
            options: ['$\\dfrac{30}{7}$ cm', '$\\dfrac{21}{10}$ cm', '$\\dfrac{70}{3}$ cm', '$6$ cm'],
            cols: 2, correct: 0,
            explain: '$7 \\times AB = 10 \\times 3$ ، فـ $AB = \\dfrac{30}{7}$ cm ، أي حوالي 4,3 cm . ($\\dfrac{21}{10}$ من قلب نسبة، و $\\dfrac{70}{3}$ من $\\dfrac{7}{3} = \\dfrac{AB}{10}$ ، و 6 cm جمع بدل التناسب.)' },
          { kind: 'solution', ask: 1, lines: [
            '$C$ من $[AD]$ و $E$ من $[AB]$ و $(CE) // (DB)$ : حسب خاصية طالس $\\dfrac{AC}{AD} = \\dfrac{AE}{AB}$ ، أي $\\dfrac{7}{10} = \\dfrac{3}{AB}$ .',
            'هذا هو التناسب «7 m تمثّل 3 cm» مطبّقًا على 10 m ، إذن $[AB]$ يمثّل الممرّ.',
            '$7 \\times AB = 30$ ، فطول الممرّ على المخطّط $AB = \\dfrac{30}{7}$ cm .',
          ] },
        ],
      },
      {
        label: '2)', title: 'أحواض الزهور',
        question: 'تضع البلدية على الممرّ أحواض زهور تقسمه إلى 4 قطع متقايسة، مع حوض في كل طرف. كم حوضًا يلزم؟ كيف تعيّن المهندسة مواضعها على المخطّط دون قياس؟ احسب المسافة الحقيقية بين حوضين متتاليين.',
        asks: ['عدد الأحواض', 'تعيين المواضع على المخطّط', 'المسافة الحقيقية بين حوضين'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'عدد الأحواض:', expected: 5,
            explain: '4 قطع متتالية لها $4 + 1 = 5$ أطراف: ثلاثة أحواض داخل الممرّ وحوضان في الطرفين.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['taqsim-qitaa'],
            prompt: 'على المخطّط، تعيّن المهندسة المواضع هكذا:',
            options: [
              'أربع قطع متقايسة على نصف مستقيم مبدؤه $A$ ، تصل الرابعة بـ $B$ وترسم الموازيات المارّة بالعلامات الأخرى',
              'خمس قطع متقايسة لأنّ الأحواض خمسة، وتصل الخامسة بـ $B$',
              'تقسم $\\dfrac{30}{7}$ على 4 وتقيس النتيجة بالمسطرة المدرّجة',
            ],
            correct: 0,
            explain: 'المطلوب 4 قطع متقايسة: أربع علامات، ورتبة العلامة الموصولة بـ $B$ هي عدد القطع. (خمس علامات تعطي خمس قطع وستة أحواض، و $\\dfrac{30}{7} \\div 4$ لا يُقاس بالضبط.)' },
          { kind: 'choice', role: 'conclude', requires: ['tabrir-taqsim'],
            prompt: 'المسافة بين موضعين متتاليين على المخطّط:',
            options: ['$\\dfrac{15}{14}$ cm', '$\\dfrac{6}{7}$ cm', '$\\dfrac{120}{7}$ cm'],
            cols: 3, correct: 0,
            explain: '$\\dfrac{1}{4} \\times \\dfrac{30}{7} = \\dfrac{30}{28} = \\dfrac{15}{14}$ cm . ($\\dfrac{6}{7}$ قسمة على 5، و $\\dfrac{120}{7}$ ضرب في 4 بدل القسمة.)' },
          { kind: 'numeric', role: 'answer', ask: 2,
            prompt: 'المسافة الحقيقية بين حوضين متتاليين:', expected: 2.5, display: '2,5', suffix: 'm',
            explain: 'ربع الممرّ الحقيقي: $10 \\div 4 = 2{,}5$ m . (وعلى المخطّط $\\dfrac{15}{14}$ cm تمثّل فعلًا $\\dfrac{15}{14} \\times \\dfrac{7}{3} = \\dfrac{5}{2}$ m .)' },
          { kind: 'solution', ask: 2, lines: [
            '4 قطع متقايسة لها 5 أطراف: يلزم 5 أحواض.',
            'على المخطّط: أربع قطع متقايسة على نصف مستقيم مبدؤه $A$ ، نصل العلامة الرابعة بـ $B$ ونرسم الموازيات المارّة بالعلامات الأخرى، فتقطع $[AB]$ في مواضع الأحواض.',
            'المسافة الحقيقية بين حوضين متتاليين $10 \\div 4 = 2{,}5$ m .',
          ] },
        ],
      },
      {
        label: '3)', title: 'تكلفة التجهيز',
        question: 'ثمن الحوض الواحد 4500 دج، ويُمدّ أنبوب سقي على طول الممرّ كله بـ 180 دج للمتر. احسب ثمن الأحواض. احسب التكلفة الإجمالية للتجهيز.',
        asks: ['ثمن الأحواض', 'التكلفة الإجمالية'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'ثمن الأحواض:', expected: 22500, suffix: 'دج',
            explain: '$5 \\times 4500 = 22500$ دج .' },
          { kind: 'numeric', role: 'compute',
            prompt: 'ثمن أنبوب السقي:', expected: 1800, suffix: 'دج',
            explain: 'الأنبوب على الممرّ الحقيقي كله: $10 \\times 180 = 1800$ دج . (لا على طوله في المخطّط.)' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'التكلفة الإجمالية للتجهيز:', expected: 24300, suffix: 'دج',
            explain: '$22500 + 1800 = 24300$ دج .' },
          { kind: 'solution', ask: 1, lines: [
            'ثمن الأحواض $5 \\times 4500 = 22500$ دج ، وثمن أنبوب السقي $10 \\times 180 = 1800$ دج .',
            'التكلفة الإجمالية للتجهيز $22500 + 1800 = 24300$ دج .',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
