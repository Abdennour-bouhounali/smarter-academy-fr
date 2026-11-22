/**
 * Les trois « مسائل » du درس 1 de l'unité 9 « خاصية طالس وحساب الأطوال » (modules 5, 6, 7) — des exercices
 * COMPLETS de type امتحان, résolus pas à pas (common/problems/GuidedProblem.jsx).
 *
 * AJOUTS DE LA PLATEFORME, déclarés comme tels (`addition('exam_style_problem')`) : le manuel ne les contient
 * pas. Ils restent dans le périmètre de la leçon : وضعية طالس et ses trois positions, les trois rapports égaux,
 * le calcul d'une longueur (جداء متصالب), deux rapports inégaux ⇒ non parallèles, le معامل k (تكبير / تصغير) —
 * plus les acquis antérieurs (deux droites perpendiculaires à une même droite, Pythagore). Jamais la réciproque
 * (درس 2), le partage d'un segment (درس 3) ni la minaret de la وضعية إدماجية.
 *
 * La مسألة 1 est « مسألة الدرس » : son énoncé ET sa figure vivent dans `LESSON_CONFIG.lessonProblem`
 * (montrés dès le sommaire et rappelés au module 1, prolongement du faisceau de niveau متقدم), et se résout ici.
 * Les مسائل 2 et 3 portent leur figure ici (GeoFigure, 1 unité = 1 m, coordonnées vérifiées par le test).
 *
 * Chaque nombre est vérifié par calcul EXACT dans ./problems.test.js.
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

/** مسألة 2 — S fin des deux ombres ; P pied du lampadaire, L son sommet ; H pied du palmier, T son sommet. */
const FIG_SHADOWS = {
  points: { S: [0, 0], P: [3, 0], H: [12, 0], L: [3, 4], T: [12, 16] },
  segments: [['S', 'H'], { from: 'S', to: 'T', tone: 'amber' }, { from: 'P', to: 'L', tone: 'slate' }, { from: 'H', to: 'T', tone: 'emerald' }],
  rightAngles: [['S', 'P', 'L'], ['S', 'H', 'T']],
  ariaLabel: 'عمود الإنارة [PL] والنخلة [HT] شاقوليان على الأرض (SH)، وشعاع الشمس (ST) يمرّ بقمّة العمود L وقمّة النخلة T، وينتهي الظلّان في S',
  maxWidth: 300,
};

/** مسألة 3 — le جمالون ABC (AB = AC = 5, BC = 6, hauteur 4) ; M, N à 0,3 et P, Q à 0,6 du sommet A. */
const FIG_TRUSS = {
  points: { A: [0, 4], B: [-3, 0], C: [3, 0], M: [-0.9, 2.8], N: [0.9, 2.8], P: [-1.8, 1.6], Q: [1.8, 1.6] },
  segments: [['A', 'B'], ['A', 'C'], ['B', 'C'], { from: 'M', to: 'N', tone: 'amber' }, { from: 'P', to: 'Q', tone: 'amber' }],
  labels: { A: 'n' },
  ariaLabel: 'الجمالون: المثلث ABC، و M و P على الدعامة [AB]، و N و Q على الدعامة [AC]، والعارضتان [MN] و [PQ] موازيتان للعارضة السفلى [BC]',
  maxWidth: 320,
};

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — شاشة العرض في الحيّ',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🎬',
    source: SOURCE,
    statement: LESSON_CONFIG.lessonProblem.statement,
    figure: LESSON_CONFIG.lessonProblem.figure,
    data: [
      { id: 'edges', text: 'طولا حافتي الحزمة حتى الشاشة الكبيرة: 10 m و 12 m', useful: true },
      { id: 'screen', text: 'عرض الشاشة الكبيرة: 6 m', useful: true },
      { id: 'parallel', text: 'الصورة على اللوحة موازية للشاشة الكبيرة وطرفاها على حافتي الحزمة', useful: true },
      { id: 'first', text: 'اللوحة أوّلًا على بعد 4 m من الجهاز على الحافة الأولى', useful: true },
      { id: 'chairs', text: 'الساحة تتّسع لـ 180 كرسيًّا', useful: false },
      { id: 'night', text: 'العرض ليليّ', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الصورة على اللوحة',
        question: "احسب $AC'$. ما عرض الصورة $B'C'$ على اللوحة؟",
        asks: ["الطول $AC'$", "عرض الصورة $B'C'$"],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['khassiyat-talis'],
            prompt: "لماذا نطبّق خاصية طالس على المثلثين $AB'C'$ و $ABC$؟",
            options: [
              "$B'$ من $[AB]$ و $C'$ من $[AC]$ و $(B'C') \\parallel (BC)$",
              'لأنّ اللوحة أصغر من الشاشة الكبيرة',
              "لأنّ $AB'$ أصغر من $AB$",
            ],
            correct: 0,
            explain: 'وضعية طالس: مستقيمان متقاطعان في $A$ يقطعهما مستقيمان متوازيان $(B\'C\')$ و $(BC)$. صِغَر اللوحة لا يكفي: لوحة مائلة صغيرة أيضًا.' },
          { kind: 'choice', role: 'translate', requires: ['khassiyat-talis'],
            prompt: 'حسب خاصية طالس:',
            options: [
              "$\\dfrac{AB'}{AB} = \\dfrac{AC'}{AC} = \\dfrac{B'C'}{BC}$",
              "$\\dfrac{AB'}{B'B} = \\dfrac{AC'}{C'C} = \\dfrac{B'C'}{BC}$",
              "$\\dfrac{AB}{AB'} = \\dfrac{AC'}{AC} = \\dfrac{B'C'}{BC}$",
            ],
            correct: 0, cols: 1,
            explain: "في كل نسبة: طول من المثلث $AB'C'$ على الطول الموافق له في المثلث $ABC$. ($B'B$ و $C'C$ قطعتان وليستا ضلعين، والنسبة المقلوبة لا تساوي الأخريين.)" },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hisab-atwal'],
            prompt: "$AC'$ بالمتر:", expected: 4.8, suffix: 'm',
            explain: "$\\dfrac{4}{10} = \\dfrac{AC'}{12}$ ومنه $AC' = \\dfrac{12 \\times 4}{10} = 4{,}8$." },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hisab-atwal'],
            prompt: "عرض الصورة $B'C'$ بالمتر:", expected: 2.4, suffix: 'm',
            explain: "$\\dfrac{B'C'}{6} = \\dfrac{4}{10}$ ومنه $B'C' = \\dfrac{6 \\times 4}{10} = 2{,}4$." },
          { kind: 'solution', ask: 0, lines: [
            "$B'$ من $[AB]$ و $C'$ من $[AC]$ و $(B'C') \\parallel (BC)$: حسب خاصية طالس $\\dfrac{AB'}{AB} = \\dfrac{AC'}{AC} = \\dfrac{B'C'}{BC}$.",
            "أي $\\dfrac{4}{10} = \\dfrac{AC'}{12} = \\dfrac{B'C'}{6}$.",
            "$AC' = \\dfrac{12 \\times 4}{10} = 4{,}8$ و $B'C' = \\dfrac{6 \\times 4}{10} = 2{,}4$: عرض الصورة على اللوحة 2,4 m.",
          ] },
        ],
      },
      {
        label: '2)', title: 'أين نضع اللوحة؟',
        question: "في محاولة ثانية حرّك التقنيّ اللوحة، فقاس $AB' = 4{,}5\\,\\mathrm{m}$ و $AC' = 5{,}6\\,\\mathrm{m}$. هل اللوحة موازية للشاشة الكبيرة؟ عيّن الطول $AB'$ الذي تملأ فيه الصورة اللوحة (عرضها 3 m) تمامًا وهي موازية للشاشة.",
        asks: ['هل اللوحة موازية للشاشة الكبيرة؟', "الطول $AB'$ الذي تملأ فيه الصورة اللوحة"],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['adam-tawazi'],
            prompt: 'لكي نعرف هل اللوحة موازية للشاشة الكبيرة، نقارن:',
            options: [
              "النسبتين $\\dfrac{AB'}{AB}$ و $\\dfrac{AC'}{AC}$",
              "الطولين $AB'$ و $AC'$",
              "الفرقين $AB - AB'$ و $AC - AC'$",
            ],
            correct: 0, cols: 1,
            explain: 'لو كان $(B\'C\') \\parallel (BC)$ لتساوت النسبتان حسب خاصية طالس؛ ويكفي عدم تساوي نسبتين لنفي التوازي.' },
          { kind: 'numeric', role: 'compute', requires: ['adam-tawazi'],
            prompt: "الجداء $AB' \\times AC$:", expected: 54,
            explain: '$4{,}5 \\times 12 = 54$.' },
          { kind: 'numeric', role: 'compute', requires: ['adam-tawazi'],
            prompt: "الجداء $AB \\times AC'$:", expected: 56,
            explain: '$10 \\times 5{,}6 = 56$.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['adam-tawazi'],
            prompt: 'هل اللوحة موازية للشاشة الكبيرة؟',
            options: [
              'لا: $54 \\neq 56$ إذن $\\dfrac{4{,}5}{10} \\neq \\dfrac{5{,}6}{12}$',
              'نعم: النسبتان متقاربتان',
              "نعم: $AB'$ و $AC'$ أصغر من $AB$ و $AC$",
            ],
            correct: 0, cols: 1,
            explain: "الجداءان المتصالبان مختلفان، فالنسبتان غير متساويتين: المستقيمان $(B'C')$ و $(BC)$ غير متوازيين. «متقاربتان» لا تعني «متساويتان»." },
          { kind: 'choice', role: 'translate', requires: ['hisab-atwal'],
            prompt: "لكي تملأ الصورة اللوحة تمامًا يجب أن يكون $B'C' = 3$ مع $(B'C') \\parallel (BC)$. نستعمل المساواة:",
            options: [
              "$\\dfrac{AB'}{10} = \\dfrac{3}{6}$",
              "$\\dfrac{AB'}{10} = \\dfrac{6}{3}$",
              "$\\dfrac{AB'}{12} = \\dfrac{3}{6}$",
            ],
            correct: 0, cols: 1,
            explain: "$\\dfrac{AB'}{AB} = \\dfrac{B'C'}{BC}$ مع $AB = 10$ و $BC = 6$. (النسبة $\\dfrac{6}{3}$ مقلوبة، و 12 هو $AC$ لا $AB$.)" },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hisab-atwal'],
            prompt: "الطول $AB'$ بالمتر:", expected: 5, suffix: 'm',
            explain: "$AB' = \\dfrac{10 \\times 3}{6} = 5$." },
          { kind: 'solution', ask: 0, lines: [
            "$4{,}5 \\times 12 = 54$ و $10 \\times 5{,}6 = 56$، إذن $\\dfrac{4{,}5}{10} \\neq \\dfrac{5{,}6}{12}$: اللوحة ليست موازية للشاشة الكبيرة.",
            "لكي يكون $B'C' = 3$ مع $(B'C') \\parallel (BC)$: $\\dfrac{AB'}{10} = \\dfrac{3}{6}$ ومنه $AB' = \\dfrac{10 \\times 3}{6} = 5$.",
            'يضع التقنيّ اللوحة موازية للشاشة على بعد 5 m من الجهاز، فتملؤها الصورة تمامًا.',
          ] },
        ],
      },
      {
        label: '3)', title: 'شاشة العرض الثاني',
        question: 'في العرض الثاني تُنصب الشاشة في $[DE]$، حيث $D$ على امتداد $[AB]$ بعد $B$ و $E$ على امتداد $[AC]$ بعد $C$ و $(DE) \\parallel (BC)$ و $AD = 15\\,\\mathrm{m}$. احسب معامل التكبير $k$ الذي يحوّل المثلث $ABC$ إلى المثلث $ADE$. احسب عرض الصورة $DE$. يملك النادي شاشة عرضها 8 m: هل تتّسع للصورة؟',
        asks: ['معامل التكبير $k$', 'عرض الصورة $DE$', 'هل تتّسع الشاشة التي عرضها 8 m للصورة؟'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['muamil-tanasub'],
            prompt: 'معامل التكبير $k$:',
            options: [
              '$k = \\dfrac{AD}{AB} = \\dfrac{15}{10} = \\dfrac{3}{2}$',
              '$k = \\dfrac{AB}{AD} = \\dfrac{10}{15} = \\dfrac{2}{3}$',
              '$k = AD - AB = 5$',
            ],
            correct: 0, cols: 1,
            explain: '$k = \\dfrac{AD}{AB} = \\dfrac{15}{10} = \\dfrac{3}{2}$ و $\\dfrac{3}{2} > 1$: المثلث $ADE$ تكبير للمثلث $ABC$. ($\\dfrac{2}{3}$ يحوّل $ADE$ إلى $ABC$، و 5 فرق وليس نسبة.)' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['muamil-tanasub'],
            prompt: 'عرض الصورة $DE$ بالمتر:', expected: 9, suffix: 'm',
            explain: '$DE = k \\times BC = \\dfrac{3}{2} \\times 6 = 9$.' },
          { kind: 'choice', role: 'conclude', ask: 2,
            prompt: 'هل تتّسع الشاشة التي عرضها 8 m للصورة؟',
            options: [
              'لا: $9 > 8$، فتخرج الصورة عن الشاشة',
              'نعم: $8 > 6$',
              'نعم: لأنّ $k > 1$',
            ],
            correct: 0, cols: 1,
            explain: 'عرض الصورة 9 m أكبر من عرض الشاشة 8 m. (مقارنة 8 بعرض الشاشة الأولى 6 m لا تفيد: الصورة كبرت.)' },
          { kind: 'solution', ask: 0, lines: [
            '$D$ و $E$ على امتداد $[AB]$ و $[AC]$ و $(DE) \\parallel (BC)$: المثلثان $ABC$ و $ADE$ في وضعية طالس.',
            '$k = \\dfrac{AD}{AB} = \\dfrac{15}{10} = \\dfrac{3}{2}$، و $\\dfrac{3}{2} > 1$: تكبير.',
            '$DE = \\dfrac{3}{2} \\times 6 = 9$: عرض الصورة 9 m، فالشاشة التي عرضها 8 m لا تتّسع لها.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — ظلّ النخلة',
    context: 'كم ارتفاع النخلة؟ وكم طول الحبل؟',
    emoji: '🌴',
    source: SOURCE,
    statement: 'في حديقة عمومية ببسكرة يتعاون سكان الحيّ على نظافتها، نخلة $[HT]$ عمرها 60 سنة وعمود إنارة $[PL]$ قائمان شاقوليًا على أرض مستوية. في لحظة من بعد الظهر ينتهي ظلّ العمود وظلّ النخلة في النقطة نفسها $S$: النقط $S$ و $P$ و $H$ على استقامة على الأرض، والنقط $S$ و $L$ و $T$ على استقامة على شعاع الشمس، كما في الشكل. طول العمود $PL = 4\\,\\mathrm{m}$ وطول ظلّه $SP = 3\\,\\mathrm{m}$، والمسافة بين العمود والنخلة $PH = 9\\,\\mathrm{m}$. ثمن المتر الواحد من سلسلة المصابيح 350 دج.',
    figure: FIG_SHADOWS,
    data: [
      { id: 'post', text: 'طول العمود 4 m وطول ظلّه 3 m', useful: true },
      { id: 'gap', text: 'المسافة بين العمود والنخلة 9 m', useful: true },
      { id: 'vertical', text: 'العمود والنخلة قائمان شاقوليًا', useful: true },
      { id: 'tip', text: 'الظلّان ينتهيان في النقطة نفسها', useful: true },
      { id: 'price', text: 'ثمن المتر من سلسلة المصابيح 350 دج', useful: true },
      { id: 'age', text: 'عمر النخلة 60 سنة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'ارتفاع النخلة',
        question: 'بيّن أنّ المستقيمين $(PL)$ و $(HT)$ متوازيان، ثم احسب ارتفاع النخلة $HT$.',
        asks: ['بيّن أنّ $(PL)$ و $(HT)$ متوازيان', 'ارتفاع النخلة $HT$'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0,
            prompt: 'لماذا المستقيمان $(PL)$ و $(HT)$ متوازيان؟',
            options: [
              'لأنّهما عموديان على المستقيم نفسه $(SH)$: العمود والنخلة شاقوليان',
              'لأنّ $L$ و $T$ على شعاع الشمس نفسه',
              'لأنّ $PL < HT$',
            ],
            correct: 0, cols: 1,
            explain: 'مستقيمان عموديان على مستقيم واحد متوازيان. أمّا $L$ و $T$ على شعاع الشمس فيجعلان $S$ و $L$ و $T$ على استقامة، لا التوازي.' },
          { kind: 'choice', role: 'translate', requires: ['khassiyat-talis'],
            prompt: 'المستقيمان $(SH)$ و $(ST)$ متقاطعان في $S$ و $(PL) \\parallel (HT)$. حسب خاصية طالس:',
            options: [
              '$\\dfrac{SP}{SH} = \\dfrac{SL}{ST} = \\dfrac{PL}{HT}$',
              '$\\dfrac{SP}{PH} = \\dfrac{SL}{LT} = \\dfrac{PL}{HT}$',
              '$\\dfrac{SH}{SP} = \\dfrac{SL}{ST} = \\dfrac{PL}{HT}$',
            ],
            correct: 0, cols: 1,
            explain: 'المثلثان $SPL$ و $SHT$: كل ضلع من الصغير على الضلع الموافق له في الكبير. ($PH$ و $LT$ قطعتان وليستا ضلعين للمثلث $SHT$.)' },
          { kind: 'numeric', role: 'compute',
            prompt: 'طول ظلّ النخلة $SH$ بالمتر:', expected: 12, suffix: 'm',
            explain: '$SH = SP + PH = 3 + 9 = 12$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hisab-atwal'],
            prompt: 'ارتفاع النخلة $HT$ بالمتر:', expected: 16, suffix: 'm',
            explain: '$\\dfrac{3}{12} = \\dfrac{4}{HT}$ ومنه $HT = \\dfrac{12 \\times 4}{3} = 16$. (بالقسمة على 9 بدل 12 نستعمل القطعة $PH$ بدل الضلع $SH$.)' },
          { kind: 'solution', ask: 0, lines: [
            '$(PL) \\perp (SH)$ و $(HT) \\perp (SH)$، إذن $(PL) \\parallel (HT)$.',
            'المستقيمان $(SH)$ و $(ST)$ متقاطعان في $S$: حسب خاصية طالس $\\dfrac{SP}{SH} = \\dfrac{PL}{HT}$ مع $SH = 3 + 9 = 12$.',
            '$\\dfrac{3}{12} = \\dfrac{4}{HT}$ ومنه $HT = \\dfrac{12 \\times 4}{3} = 16$: ارتفاع النخلة 16 m.',
          ] },
        ],
      },
      {
        label: '2)', title: 'حبل البستانيّ',
        question: 'يريد البستانيّ شدّ حبل مستقيم من النقطة $S$ إلى قمّة النخلة $T$، مارًّا بقمّة العمود $L$. احسب $SL$. استنتج طول الحبل $ST$. هل يكفيه حبل طوله 18 m؟',
        asks: ['الطول $SL$', 'طول الحبل $ST$', 'هل يكفيه حبل طوله 18 m؟'],
        steps: [
          { kind: 'choice', role: 'translate',
            prompt: 'في المثلث $SPL$ القائم في $P$، نحسب $SL$ بـ:',
            options: ['خاصية فيثاغورس', 'خاصية طالس', 'جمع الطولين $SP + PL$'],
            correct: 0,
            explain: 'نعرف ضلعي الزاوية القائمة $SP$ و $PL$: الوتر $SL$ بخاصية فيثاغورس. (الوتر أقصر من مجموع الضلعين.)' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: '$SL$ بالمتر:', expected: 5, suffix: 'm',
            explain: '$SL^2 = 3^2 + 4^2 = 9 + 16 = 25$ ومنه $SL = 5$.' },
          { kind: 'choice', role: 'translate', requires: ['hisab-atwal'],
            prompt: 'لحساب $ST$ نحتفظ بالمساواة:',
            options: [
              '$\\dfrac{SL}{ST} = \\dfrac{SP}{SH}$',
              '$\\dfrac{SL}{LT} = \\dfrac{SP}{SH}$',
              '$\\dfrac{ST}{SL} = \\dfrac{SP}{SH}$',
            ],
            correct: 0, cols: 1,
            explain: 'نسبتان من النسب الثلاث، فيهما $ST$ المطلوب وثلاثة أطوال معلومة. ($LT$ قطعة وليست ضلعًا، والنسبة $\\dfrac{ST}{SL}$ مقلوبة.)' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hisab-atwal'],
            prompt: 'طول الحبل $ST$ بالمتر:', expected: 20, suffix: 'm',
            explain: '$\\dfrac{5}{ST} = \\dfrac{3}{12}$ ومنه $ST = \\dfrac{5 \\times 12}{3} = 20$.' },
          { kind: 'choice', role: 'conclude', ask: 2,
            prompt: 'هل يكفي البستانيَّ حبل طوله 18 m؟',
            options: [
              'لا: $18 < 20$، ينقصه $20 - 18 = 2$ m',
              'نعم: $18 > 16$ وهو ارتفاع النخلة',
              'نعم: $18 > 12$ وهو طول ظلّ النخلة',
            ],
            correct: 0, cols: 1,
            explain: 'الحبل مائل على شعاع الشمس من $S$ إلى $T$، فطوله 20 m لا ارتفاع النخلة 16 m.' },
          { kind: 'solution', ask: 0, lines: [
            'المثلث $SPL$ قائم في $P$: $SL^2 = 3^2 + 4^2 = 25$ ومنه $SL = 5$.',
            'حسب خاصية طالس $\\dfrac{SL}{ST} = \\dfrac{SP}{SH}$ أي $\\dfrac{5}{ST} = \\dfrac{3}{12}$ ومنه $ST = \\dfrac{5 \\times 12}{3} = 20$.',
            '$18 < 20$: الحبل الذي طوله 18 m لا يكفي، يلزم حبل طوله 20 m على الأقل.',
          ] },
        ],
      },
      {
        label: '3)', title: 'سلسلة المصابيح',
        question: 'تريد البلدية تعليق سلسلة مصابيح على الحبل بين قمّة العمود $L$ وقمّة النخلة $T$. احسب طول السلسلة $LT$. كم تدفع البلدية ثمنًا للسلسلة؟',
        asks: ['طول السلسلة $LT$', 'ثمن السلسلة'],
        steps: [
          { kind: 'choice', role: 'translate',
            prompt: 'طول السلسلة $LT$ يساوي:',
            options: ['$ST - SL$', '$ST + SL$', '$HT - PL$'],
            correct: 0, cols: 3,
            explain: '$L$ بين $S$ و $T$ على الحبل، فـ $LT = ST - SL$. ($HT - PL$ فرق الارتفاعين، والسلسلة مائلة.)' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'طول السلسلة $LT$ بالمتر:', expected: 15, suffix: 'm',
            explain: '$LT = 20 - 5 = 15$.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'ثمن السلسلة:', expected: 5250, suffix: 'دج',
            explain: '$15 \\times 350 = 5250$.' },
          { kind: 'solution', lines: [
            '$LT = ST - SL = 20 - 5 = 15$: طول السلسلة 15 m.',
            'الثمن: $15 \\times 350 = 5250$، أي 5250 دج.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — جمالون السقف',
    context: 'عارضتان موازيتان للقاعدة: أطوال وثمن الخشب',
    emoji: '🏠',
    source: SOURCE,
    statement: 'في ورشة نجارة بتيزي وزو، يصنع نجّار يتقن عمله 4 جمالونات خشبية متماثلة لسقف منزل جبليّ ارتفاع جدرانه 3 m. الجمالون مثلث $ABC$: الدعامتان المائلتان $AB = AC = 5\\,\\mathrm{m}$ والعارضة السفلى $BC = 6\\,\\mathrm{m}$. لتقويته يثبّت عارضتين أفقيتين $[MN]$ و $[PQ]$ موازيتين لـ $(BC)$، حيث $M$ و $P$ من $[AB]$ و $N$ و $Q$ من $[AC]$، كما في الشكل. ثمن المتر الواحد من الخشب 650 دج.',
    figure: FIG_TRUSS,
    data: [
      { id: 'rafters', text: 'الدعامتان المائلتان 5 m لكلّ منهما', useful: true },
      { id: 'base', text: 'العارضة السفلى 6 m', useful: true },
      { id: 'parallel', text: 'العارضتان الأفقيتان موازيتان للعارضة السفلى', useful: true },
      { id: 'count', text: '4 جمالونات متماثلة', useful: true },
      { id: 'price', text: 'ثمن المتر من الخشب 650 دج', useful: true },
      { id: 'walls', text: 'ارتفاع جدران المنزل 3 m', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'العارضة الأولى',
        question: 'تُثبَّت العارضة $[MN]$ حيث $AM = 1{,}5\\,\\mathrm{m}$. احسب طولها $MN$.',
        asks: ['طول العارضة $MN$'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['khassiyat-talis'],
            prompt: 'لماذا المثلثان $AMN$ و $ABC$ في وضعية طالس؟',
            options: [
              '$M$ من $[AB]$ و $N$ من $[AC]$ و $(MN) \\parallel (BC)$',
              'لأنّ $AB = AC$',
              'لأنّ العارضة $[MN]$ أقصر من $[BC]$',
            ],
            correct: 0, cols: 1,
            explain: 'مستقيمان متقاطعان في $A$ يقطعهما مستقيمان متوازيان. تساوي الدعامتين لا علاقة له بوضعية طالس.' },
          { kind: 'choice', role: 'translate', requires: ['hisab-atwal'],
            prompt: 'نحتفظ بالمساواة:',
            options: [
              '$\\dfrac{AM}{AB} = \\dfrac{MN}{BC}$',
              '$\\dfrac{AM}{MB} = \\dfrac{MN}{BC}$',
              '$\\dfrac{AB}{AM} = \\dfrac{MN}{BC}$',
            ],
            correct: 0, cols: 1,
            explain: 'فيها $MN$ المطلوب و $AM$ و $AB$ و $BC$ المعلومة. ($MB$ قطعة وليست ضلعًا للمثلث $AMN$، و $\\dfrac{AB}{AM}$ مقلوبة.)' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hisab-atwal'],
            prompt: 'طول العارضة $MN$ بالمتر:', expected: 1.8, suffix: 'm',
            explain: '$\\dfrac{1{,}5}{5} = \\dfrac{MN}{6}$ ومنه $MN = \\dfrac{6 \\times 1{,}5}{5} = 1{,}8$.' },
          { kind: 'solution', ask: 0, lines: [
            '$M$ من $[AB]$ و $N$ من $[AC]$ و $(MN) \\parallel (BC)$: حسب خاصية طالس $\\dfrac{AM}{AB} = \\dfrac{AN}{AC} = \\dfrac{MN}{BC}$.',
            '$\\dfrac{1{,}5}{5} = \\dfrac{MN}{6}$ ومنه $MN = \\dfrac{6 \\times 1{,}5}{5} = 1{,}8$: طول العارضة 1,8 m.',
          ] },
        ],
      },
      {
        label: '2)', title: 'العارضة الثانية',
        question: 'طول العارضة الثانية $PQ = 3{,}6\\,\\mathrm{m}$. احسب معامل التصغير $k$ الذي يحوّل المثلث $ABC$ إلى المثلث $APQ$. احسب $AP$. على أيّ بعد من الرأس $B$ يثبّت النجّار النقطة $P$؟',
        asks: ['معامل التصغير $k$', 'الطول $AP$', 'بعد $P$ عن الرأس $B$'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['muamil-tanasub'],
            prompt: 'معامل التصغير $k$:',
            options: [
              '$k = \\dfrac{PQ}{BC} = \\dfrac{3{,}6}{6} = \\dfrac{3}{5}$',
              '$k = \\dfrac{BC}{PQ} = \\dfrac{5}{3}$',
              '$k = BC - PQ = 2{,}4$',
            ],
            correct: 0, cols: 1,
            explain: '$k = \\dfrac{3{,}6}{6} = \\dfrac{3}{5}$ و $\\dfrac{3}{5} < 1$: المثلث $APQ$ تصغير للمثلث $ABC$. ($\\dfrac{5}{3}$ يكبّر $APQ$ إلى $ABC$، و 2,4 فرق وليس نسبة.)' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['muamil-tanasub'],
            prompt: '$AP$ بالمتر:', expected: 3, suffix: 'm',
            explain: '$AP = k \\times AB = \\dfrac{3}{5} \\times 5 = 3$.' },
          { kind: 'choice', role: 'translate',
            prompt: 'بعد النقطة $P$ عن الرأس $B$ هو:',
            options: ['$BP = AB - AP$', '$BP = AP$', '$BP = k \\times AB$'],
            correct: 0, cols: 3,
            explain: '$P$ بين $A$ و $B$ على الدعامة: $BP = AB - AP$. ($k \\times AB$ هو $AP$ نفسه.)' },
          { kind: 'numeric', role: 'answer', ask: 2,
            prompt: '$BP$ بالمتر:', expected: 2, suffix: 'm',
            explain: '$BP = 5 - 3 = 2$.' },
          { kind: 'solution', ask: 0, lines: [
            '$(PQ) \\parallel (BC)$: المثلثان $APQ$ و $ABC$ في وضعية طالس، و $k = \\dfrac{PQ}{BC} = \\dfrac{3{,}6}{6} = \\dfrac{3}{5}$ (تصغير).',
            '$AP = \\dfrac{3}{5} \\times 5 = 3$ ومنه $BP = 5 - 3 = 2$.',
            'يثبّت النجّار النقطة $P$ على بعد 2 m من الرأس $B$، أي على بعد 3 m من القمّة $A$.',
          ] },
        ],
      },
      {
        label: '3)', title: 'ثمن الخشب',
        question: 'احسب طول الخشب اللازم لجمالون واحد (الدعامتان والعارضات الثلاث). كم يدفع النجّار ثمنًا لخشب الجمالونات الأربعة؟',
        asks: ['طول الخشب لجمالون واحد', 'ثمن خشب الجمالونات الأربعة'],
        steps: [
          { kind: 'choice', role: 'translate',
            prompt: 'طول الخشب لجمالون واحد هو:',
            options: ['$AB + AC + BC + MN + PQ$', '$AB + AC + BC$', '$AB + BC + MN + PQ$'],
            correct: 0, cols: 1,
            explain: 'خمس قطع: الدعامتان $[AB]$ و $[AC]$ والعارضات الثلاث $[BC]$ و $[MN]$ و $[PQ]$.' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'طول الخشب لجمالون واحد:', expected: 21.4, suffix: 'm',
            explain: '$5 + 5 + 6 + 1{,}8 + 3{,}6 = 21{,}4$.' },
          { kind: 'numeric', role: 'compute',
            prompt: 'طول الخشب للجمالونات الأربعة:', expected: 85.6, suffix: 'm',
            explain: '$4 \\times 21{,}4 = 85{,}6$.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'ثمن الخشب كلّه:', expected: 55640, suffix: 'دج',
            explain: '$85{,}6 \\times 650 = 55640$.' },
          { kind: 'solution', lines: [
            'لجمالون واحد: $5 + 5 + 6 + 1{,}8 + 3{,}6 = 21{,}4$، أي 21,4 m.',
            'للجمالونات الأربعة: $4 \\times 21{,}4 = 85{,}6$، أي 85,6 m.',
            'الثمن: $85{,}6 \\times 650 = 55640$، أي 55640 دج.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
