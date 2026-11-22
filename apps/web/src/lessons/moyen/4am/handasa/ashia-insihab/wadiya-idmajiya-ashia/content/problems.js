/**
 * Les six « وضعيات تدريبية » de أدمج تعلّماتي (modules 1 à 6) — des situations COMPLÈTES de type امتحان qui mobilisent
 * les quatre دروس de l'unité 11 « الأشعة والانسحاب », résolues pas à pas (common/problems/GuidedProblem.jsx), AVANT la
 * وضعية du manuel (module 7) et la وضعية الاختبار النهائي (module 8). Modèle : l'unité 1, `wadiya-idmajiya-aadad`
 * (MASAIL_GENERATION_GUIDE §14).
 *
 * Demande du propriétaire (2026-10-13) : que l'élève s'exerce sur beaucoup de situations avant celle sur laquelle il
 * sera évalué. Ce sont des AJOUTS DE LA PLATEFORME (`addition('exam_style_problem')`), jamais des exercices du manuel.
 * Périmètre = les quatre دروس, rien d'autre : égalité de deux vecteurs et image par une translation (درس 1),
 * متوازي أضلاع et milieu (درس 2), علاقة شال et somme (درس 3), preuve par les vecteurs et plus court trajet (درس 4) ;
 * Pythagore et l'inégalité triangulaire sont des acquis (أستعدّ). Jamais la multiplication d'un vecteur par un nombre ni les
 * composantes dans un repère (unité 12) : les figures sont sur ورقة مرصوفة, l'élève COMPTE des carreaux.
 * Les nombres des trois situations déjà vues (7 / 6 / 2 du module 7, 9 / 3 / 4 / 2 de la وضعية الاختبار النهائي) ne reparaissent pas.
 *
 *   wadiya-1  frise de zellige : ABC (A(0 ; 0), B(3 ; 0), C(1 ; 2)) translaté par AA′ = (4 ; 0), 1 carreau = 5 cm :
 *             BB′ = CC′ → BB′C′C متوازي أضلاع ; AA″ = 20 + 20 = 40 cm ; 240 ÷ 20 = 12 triangles.
 *   wadiya-2  jardin ABCD : A(1 ; 1), B(8 ; 1), C(14 ; 9), AD = BC = (6 ; 8) → D(7 ; 9) ; BC² = 36 + 64 = 100 ; 1 carreau = 1 m ;
 *             périmètre 2 × (7 + 10) = 34 m ; 34 × 800 = 27 200 دج.
 *   wadiya-3  scouts : A(0 ; 0), B(4 ; 0), C(4 ; 3) (angle droit en B), 1 carreau = 100 m : AB + BC = AC, AB + BC + CA = 0 ;
 *             AC² = 25 → 500 m ; 700 − 500 = 200 m.
 *   wadiya-4  salle ABCD : A(0 ; 0), B(10 ; 4), C(14 ; 0), D(4 ; −4), O(7 ; 0) milieu de [AC] ; DO = OB (Chasles) ;
 *             AC = 14 m, BD = 10 m → 7 + 5 + 7 + 5 = 24 m ; 24 × 150 = 3 600 دج.
 *   wadiya-5  passerelle sur un canal : rives y = 0 et y = 2, A(−3 ; 6), B(5 ; −2), passerelle posée en x = 0 (pas l'optimum) :
 *             B′ = B + NM = (5 ; 0) ; AB′² = 8² + 6² = 100 → 10 carreaux ; (10 + 2) × 50 = 600 m ; 600 ÷ 60 = 10 min.
 *   wadiya-6  rampe : ABCD متوازي أضلاع A(0 ; 0), B(6 ; 0), C(10 ; 3), D(4 ; 3), E = C + AD = (14 ; 6) : BC = AD = CE → C milieu
 *             de [BE] ; BC = 250 cm → BE = 5 m ; 5 × 1500 = 7 500 دج.
 *
 * Chaque égalité (vectorielle sur les coordonnées des figures, numérique) est recalculée dans ./problems.test.js. Aucune
 * sous-étape n'est une `assessment` : la maîtrise vient de la وضعية الاختبار النهائي seulement. Les valeurs (إتقان العمل، النظافة،
 * التعاون، الأمانة، احترام الوقت، التكافل) sont tissées dans le contexte, sans toucher aux nombres.
 */
import { addition } from '../../_unit/unitMeta.js';

const SOURCE = addition('exam_style_problem');

/** Une rive horizontale entre y = y0 et y = y1, de x0 à x1 : quatre coins cachés et la bande teintée. */
const band = (prefix, x0, x1, y0, y1, tone) => ({
  points: { [`${prefix}1`]: [x0, y1], [`${prefix}2`]: [x1, y1], [`${prefix}3`]: [x1, y0], [`${prefix}4`]: [x0, y0] },
  polygon: { points: [`${prefix}1`, `${prefix}2`, `${prefix}3`, `${prefix}4`], tone },
  hidden: [`${prefix}1`, `${prefix}2`, `${prefix}3`, `${prefix}4`],
});

/** wadiya-1 : le mur (cadre caché) et les deux triangles du zellige. 1 carreau = 5 cm. */
const WALL = band('W', -1, 9, -1.5, 4.5, 'slate');
export const FIG_FRISE = {
  points: { ...WALL.points, A: [0, 0], B: [3, 0], C: [1, 2], "A'": [4, 0], "B'": [7, 0], "C'": [5, 2], "A''": [8, 0] },
  polygons: [WALL.polygon, { points: ['A', 'B', 'C'], tone: 'sky' }, { points: ["A'", "B'", "C'"], tone: 'amber' }],
  vectors: [{ from: 'A', to: "A'", tone: 'rose' }],
  hidden: [...WALL.hidden, "A''"],
  labels: { A: 'sw', B: 's', C: 'n', "A'": 's', "B'": 'se', "C'": 'n' },
  grid: true,
  ariaLabel: 'جزء من جدار عليه مثلث زخرفي ABC ومثلث A′B′C′ هو صورته بالانسحاب الذي شعاعه AA′، والشعاع AA′ أفقي نحو اليمين طوله أربعة مربعات',
  maxWidth: 440,
};

/** wadiya-2 : trois sommets du jardin (D est à trouver, il n'est pas dessiné). 1 carreau = 1 m. */
export const FIG_JARDIN = {
  points: { A: [1, 1], B: [8, 1], C: [14, 9] },
  segments: [{ from: 'A', to: 'B', tone: 'emerald' }, { from: 'B', to: 'C', tone: 'emerald' }],
  labels: { A: 'sw', B: 'se', C: 'ne' },
  grid: true,
  ariaLabel: 'ورقة مرصوفة ضلع مربعها يمثّل متراً واحداً: القطعة [AB] أفقية طولها سبعة مربعات، والقطعة [BC] تصعد من B ستة مربعات نحو اليمين وثمانية مربعات نحو الأعلى، والنقطة D لم تُرسم بعد',
  maxWidth: 440,
};

/** wadiya-3 : le trajet des scouts, A → B (horizontal) puis B → C (vertical). 1 carreau = 100 m. */
export const FIG_SCOUTS = {
  points: { A: [0, 0], B: [4, 0], C: [4, 3] },
  vectors: [{ from: 'A', to: 'B', tone: 'amber' }, { from: 'B', to: 'C', tone: 'indigo' }],
  rightAngles: [['A', 'B', 'C']],
  labels: { A: 'sw', B: 'se', C: 'ne' },
  grid: true,
  ariaLabel: 'مخطط على ورقة مرصوفة ضلع مربعها يمثّل مئة متر: المخيم A، ثم عين الماء B على بعد أربعة مربعات أفقيا، ثم القمة C فوق B بثلاثة مربعات، والزاوية عند B قائمة',
  maxWidth: 380,
};

/** wadiya-4 : la salle ABCD, ses diagonales de 14 m et de 10 m, la lampe O. 1 unité = 1 m. */
export const FIG_SALLE = {
  points: { A: [0, 0], B: [10, 4], C: [14, 0], D: [4, -4], O: [7, 0] },
  polygons: [{ points: ['A', 'B', 'C', 'D'], tone: 'violet' }],
  segments: [{ from: 'A', to: 'C', label: '14 m' }, { from: 'B', to: 'D', label: '10 m' }],
  labels: { A: 'w', B: 'ne', C: 'e', D: 'sw', O: 'nw' },
  ariaLabel: 'قاعة على شكل متوازي أضلاع ABCD قطراها [AC] طوله 14 م و [BD] طوله 10 م، والمصباح عند النقطة O منتصف [AC]',
  maxWidth: 440,
};

/** wadiya-5 : le canal (rives y = 0 et y = 2), la maison A, l'école B, la passerelle [MN] posée en x = 0. 1 carreau = 50 m. */
const CANAL = band('R', -5, 8, 0, 2, 'sky');
export const FIG_CANAL = {
  points: { ...CANAL.points, A: [-3, 6], M: [0, 2], N: [0, 0], B: [5, -2] },
  polygons: [CANAL.polygon],
  segments: [
    { from: 'R1', to: 'R2', bold: true }, { from: 'R4', to: 'R3', bold: true },
    { from: 'A', to: 'M', tone: 'amber' }, { from: 'M', to: 'N', bold: true, tone: 'indigo' }, { from: 'N', to: 'B', tone: 'amber' },
  ],
  rightAngles: [['R1', 'M', 'N']],
  hidden: CANAL.hidden,
  labels: { A: 'n', B: 's', M: 'ne', N: 'se' },
  grid: true,
  ariaLabel: 'ورقة مرصوفة ضلع مربعها يمثّل خمسين مترا: قناة عرضها مربعان بين ضفتين أفقيتين، البيت A فوق الضفة العليا بأربعة مربعات، والمدرسة B تحت الضفة السفلى بمربعين وعلى بعد ثمانية مربعات أفقيا من A، والجسر [MN] عمودي على الضفتين، والمسلك من A إلى M ثم N ثم B',
  maxWidth: 460,
};

/** wadiya-6 : la rampe vue de côté. 1 carreau = 50 cm. */
const SOL = band('G', -1, 14, -2, 0, 'slate');
export const FIG_RAMPE = {
  points: { ...SOL.points, A: [0, 0], B: [6, 0], C: [10, 3], D: [4, 3], E: [14, 6] },
  polygons: [SOL.polygon, { points: ['A', 'B', 'C', 'D'], tone: 'indigo' }],
  segments: [{ from: 'C', to: 'E', tone: 'amber', bold: true }],
  hidden: SOL.hidden,
  labels: { A: 'sw', B: 'se', C: 'se', D: 'nw', E: 'ne' },
  grid: true,
  ariaLabel: 'مقطع جانبي لمنحدر على ورقة مرصوفة ضلع مربعها يمثّل خمسين سنتمترا: الرباعي ABCD متوازي أضلاع قاعدته [AB] على الأرض ودعامتاه المائلتان [AD] و [BC]، والدعامة [CE] تمتد من C نحو الأعلى واليمين',
  maxWidth: 460,
};

export const PROBLEMS = [
  {
    id: 'wadiya-1',
    title: 'الوضعية التدريبية 1 — زخرفة الجدار',
    context: 'شريط زليج يتكرّر بالانسحاب',
    emoji: '🧩',
    source: SOURCE,
    tone: 'sky',
    figure: FIG_FRISE,
    statement: "يزخرف الحرفي سليم جدار قاعة المطالعة في المدرسة بشريط من الزليج، وهو حريص على إتقان عمله فلا يترك فراغًا ولا يدع قطعتين تتداخلان. رسم على ورقة مرصوفة (ضلع المربع يمثّل 5 cm) المثلث $ABC$ ، ثم كرّره بالانسحاب الذي شعاعه $\\overrightarrow{AA'}$ فحصل على المثلث $A'B'C'$ ، ثم على المثلث $A''B''C''$ بالانسحاب نفسه ($A''$ صورة $A'$ ). يبلغ طول الجدار 240 cm، ويبدأ الشريط من أوّله.",
    parts: [
      {
        label: '1)', title: 'متوازي أضلاع في الشريط',
        question: "بيّن أنّ الرباعي $BB'C'C$ متوازي أضلاع.",
        asks: ["الرباعي $BB'C'C$ متوازي أضلاع"],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['sura-insihab'],
            prompt: "بما أنّ $B'$ صورة $B$ و $C'$ صورة $C$ بالانسحاب الذي شعاعه $\\overrightarrow{AA'}$ ، فإنّ:",
            options: [
              "$\\overrightarrow{BB'} = \\overrightarrow{AA'}$ و $\\overrightarrow{CC'} = \\overrightarrow{AA'}$",
              "$\\overrightarrow{B'B} = \\overrightarrow{AA'}$ و $\\overrightarrow{C'C} = \\overrightarrow{AA'}$",
              "$\\overrightarrow{BB'} = \\overrightarrow{A'A}$ و $\\overrightarrow{CC'} = \\overrightarrow{A'A}$",
            ],
            correct: 0,
            explain: "الشعاع يبدأ من النقطة وينتهي عند صورتها، وكل نقطة تنتقل بالشعاع نفسه $\\overrightarrow{AA'}$ ؛ كتابة الشعاع من الصورة إلى النقطة تعاكس الانسحاب." },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['mutawazi-tartib', 'tasawi-shuaayn'],
            prompt: "ماذا نستنتج من تساوي $\\overrightarrow{BB'}$ و $\\overrightarrow{CC'}$ ؟",
            options: [
              "الرباعي $BB'C'C$ متوازي أضلاع، لأنّ $\\overrightarrow{BB'} = \\overrightarrow{CC'}$ والنقط $B$ و $B'$ و $C$ ليست على استقامة واحدة",
              "الرباعي $BB'CC'$ متوازي أضلاع، لأنّ $\\overrightarrow{BB'} = \\overrightarrow{CC'}$",
              "الرباعي $BB'C'C$ معيّن، لأنّ $BB' = CC'$",
            ],
            correct: 0,
            explain: "من $B$ إلى $B'$ كما من $C$ إلى $C'$ : نقرأ الرؤوس بهذا الترتيب $B$ ثم $B'$ ثم $C'$ ثم $C$ . تساوي الطولين وحده لا يعطي متوازي أضلاع، ولا معيّنا." },
          { kind: 'solution', ask: 0, lines: [
            "$\\overrightarrow{BB'} = \\overrightarrow{AA'}$ و $\\overrightarrow{CC'} = \\overrightarrow{AA'}$ (صورة نقطة بالانسحاب الذي شعاعه $\\overrightarrow{AA'}$ ).",
            "إذن $\\overrightarrow{BB'} = \\overrightarrow{CC'}$ .",
            "والنقط $B$ و $B'$ و $C$ ليست على استقامة واحدة، إذن الرباعي $BB'C'C$ متوازي أضلاع.",
          ] },
        ],
      },
      {
        label: '2)', title: 'ما يتّسع له الجدار',
        question: "احسب بالسنتيمتر الطول $AA''$ ، ثم استنتج عدد المثلثات التي يتّسع لها الجدار.",
        asks: ["الطول $AA''$ بالسنتيمتر", 'عدد المثلثات التي يتّسع لها الجدار'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['alaqat-shal', 'sura-insihab'],
            prompt: "$A''$ صورة $A'$ بالانسحاب نفسه. أيّ كتابة صحيحة لـ $\\overrightarrow{AA''}$ ؟",
            options: [
              "$\\overrightarrow{AA''} = \\overrightarrow{AA'} + \\overrightarrow{A'A''}$ ، و $\\overrightarrow{A'A''} = \\overrightarrow{AA'}$",
              "$\\overrightarrow{AA''} = \\overrightarrow{AA'} + \\overrightarrow{A''A'}$",
              "$\\overrightarrow{AA''} = \\overrightarrow{AA'}$",
            ],
            correct: 0,
            explain: "علاقة شال: من $A$ إلى $A'$ ثم من $A'$ إلى $A''$ . وبما أنّ $A''$ صورة $A'$ بالانسحاب نفسه فإنّ $\\overrightarrow{A'A''} = \\overrightarrow{AA'}$ ." },
          { kind: 'numeric', role: 'compute',
            prompt: "طول $AA'$ بالسنتيمتر (ضلع المربع 5 cm):", expected: 20, suffix: 'cm',
            explain: 'الشعاع $\\overrightarrow{AA\'}$ أفقي يقطع أربعة مربعات: $4 \\times 5 = 20$ .' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: "الطول $AA''$ بالسنتيمتر:", expected: 40, suffix: 'cm',
            explain: "الشعاعان $\\overrightarrow{AA'}$ و $\\overrightarrow{A'A''}$ متساويان ولهما الاتجاه نفسه، فالطولان يجتمعان: $20 + 20 = 40$ ." },
          { kind: 'numeric', role: 'compute',
            prompt: 'كل مثلث يبدأ بعد سابقه بـ 20 cm. كم مرّة يُدخَل 20 في 240 ؟', expected: 12,
            explain: '$240 \\div 20 = 12$ .' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'عدد المثلثات التي يتّسع لها الجدار:', expected: 12, suffix: 'مثلثًا',
            explain: 'المثلث الأخير يبدأ عند $11 \\times 20 = 220$ cm وينتهي عند $220 + 15 = 235$ cm ، أي داخل الجدار (عرض المثلث ثلاثة مربعات: $3 \\times 5 = 15$ ). أمّا المثلث الثالث عشر فيبدأ عند 240 cm أي عند نهاية الجدار.' },
          { kind: 'solution', ask: 0, lines: [
            "$\\overrightarrow{AA''} = \\overrightarrow{AA'} + \\overrightarrow{A'A''}$ (علاقة شال) و $\\overrightarrow{A'A''} = \\overrightarrow{AA'}$ ، إذن $AA'' = 20 + 20 = 40$ cm.",
            'كل مثلث يبدأ بعد سابقه بـ 20 cm، و $240 \\div 20 = 12$ .',
            'يتّسع الجدار لـ 12 مثلثًا.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-2',
    title: 'الوضعية التدريبية 2 — حديقة الحي',
    context: 'ثلاثة رؤوس لمتوازي أضلاع',
    emoji: '🌳',
    source: SOURCE,
    tone: 'emerald',
    figure: FIG_JARDIN,
    statement: 'في حملة لنظافة الحي وتجميله، خصّصت جمعية الحي أرضًا مهملة لتحويلها إلى حديقة صغيرة. مخطط الأرض $ABCD$ متوازي أضلاع رُسم على ورقة مرصوفة (ضلع المربع يمثّل 1 m)، والشكل يُظهر منه الرؤوس $A$ و $B$ و $C$ فقط. يريد المتطوّعون تعيين الرأس $D$ ، ثم إحاطة الحديقة بسياج ثمن المتر الواحد منه 800 دج.',
    parts: [
      {
        label: '1)', title: 'الرأس D',
        question: 'عيّن النقطة $D$ حتى يكون $ABCD$ متوازي أضلاع.',
        asks: ['موضع النقطة $D$'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['mutawazi-tartib'],
            prompt: 'لكي يكون $ABCD$ متوازي أضلاع (الرؤوس بهذا الترتيب) يجب أن يتحقّق:',
            options: [
              '$\\overrightarrow{AD} = \\overrightarrow{BC}$',
              '$\\overrightarrow{AD} = \\overrightarrow{CB}$',
              '$\\overrightarrow{AB} = \\overrightarrow{CD}$',
            ],
            correct: 0,
            explain: '$\\overrightarrow{AB} = \\overrightarrow{DC}$ تكافئ $\\overrightarrow{AD} = \\overrightarrow{BC}$ : الضلعان المتقابلان $[AD]$ و $[BC]$ يعطيان شعاعين متساويين، ولا يكفي أن يتساوى الطولان أو أن نعكس الترتيب.' },
          { kind: 'numeric', role: 'compute',
            prompt: 'عدد المربعات التي يقطعها الشعاع $\\overrightarrow{BC}$ نحو اليمين:', expected: 6,
            explain: 'من $B$ إلى $C$ : ستة مربعات نحو اليمين.' },
          { kind: 'numeric', role: 'compute',
            prompt: 'عدد المربعات التي يقطعها الشعاع $\\overrightarrow{BC}$ نحو الأعلى:', expected: 8,
            explain: 'من $B$ إلى $C$ : ثمانية مربعات نحو الأعلى.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['mutawazi-tartib', 'tasawi-shuaayn'],
            prompt: 'أين تقع النقطة $D$ ؟',
            options: [
              'من $A$ نتقدّم 6 مربعات نحو اليمين و 8 مربعات نحو الأعلى، لأنّ $\\overrightarrow{AD} = \\overrightarrow{BC}$',
              'من $C$ نتقدّم 6 مربعات نحو اليسار و 8 مربعات نحو الأسفل',
              'من $A$ نتقدّم 8 مربعات نحو اليمين و 6 مربعات نحو الأعلى',
            ],
            correct: 0,
            explain: 'الشعاع $\\overrightarrow{AD}$ يساوي $\\overrightarrow{BC}$ : المنحى والاتجاه والطول نفسها، فنطبّق على $A$ ما قطعناه من $B$ إلى $C$ . الخيار الثاني يعيدنا إلى $B$ ، والثالث يبدّل ما قطعه الشعاع أفقيا وشاقوليا.' },
          { kind: 'solution', ask: 0, lines: [
            '$ABCD$ متوازي أضلاع، إذن $\\overrightarrow{AD} = \\overrightarrow{BC}$ .',
            'الشعاع $\\overrightarrow{BC}$ يقطع 6 مربعات نحو اليمين و 8 مربعات نحو الأعلى.',
            'النقطة $D$ هي النقطة التي نصل إليها من $A$ بالقطع نفسه: 6 مربعات نحو اليمين و 8 مربعات نحو الأعلى.',
          ] },
        ],
      },
      {
        label: '2)', title: 'السياج وثمنه',
        question: 'احسب طول السياج الذي يحيط بالحديقة، ثم ثمنه.',
        asks: ['طول السياج بالمتر', 'ثمن السياج بالدينار'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['mutawazi-tartib'],
            prompt: 'محيط الحديقة $ABCD$ يساوي:',
            options: [
              '$2 \\times (AB + BC)$ ، لأنّ $DC = AB$ و $AD = BC$',
              '$AB + BC$ فقط',
              '$AB \\times BC$',
            ],
            correct: 0,
            explain: 'في متوازي الأضلاع كل ضلع يساويه ضلعه المقابل، فالأضلاع الأربعة تعطي ضعف مجموع ضلعين متجاورين.' },
          { kind: 'numeric', role: 'compute', requires: ['fithaghuris'],
            prompt: 'طول $BC$ بالمتر (خاصية فيثاغورس بالمربعات الستة والثمانية):', expected: 10, suffix: 'm',
            explain: 'نحسب $6^2 + 8^2 = 36 + 64 = 100$ ، فـ $BC = 10$ m.' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'طول السياج (علمًا أنّ $AB = 7$ m):', expected: 34, suffix: 'm',
            explain: 'المحيط $2 \\times (7 + 10) = 34$ m.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'ثمن السياج:', expected: 27200, suffix: 'دج',
            explain: '$34 \\times 800 = 27200$ دج.' },
          { kind: 'solution', ask: 0, lines: [
            '$BC^2 = 6^2 + 8^2$ ، أي $36 + 64 = 100$ ، إذن $BC = 10$ m. و $AB = 7$ m.',
            'محيط الحديقة: $2 \\times (7 + 10) = 34$ m.',
            'ثمن السياج: $34 \\times 800 = 27200$ دج.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-3',
    title: 'الوضعية التدريبية 3 — رحلة الكشافة',
    context: 'مسار من مقطعين',
    emoji: '⛺',
    source: SOURCE,
    tone: 'teal',
    figure: FIG_SCOUTS,
    statement: 'في رحلة كشفية، تعاون أفراد الفوج في حمل المؤونة والخيام وسار الجميع معًا يشدّ بعضهم أزر بعض: انطلقوا من المخيم $A$ إلى عين الماء $B$ ، ثم من العين إلى القمة $C$ . على المخطط المرسوم على ورقة مرصوفة (ضلع المربع يمثّل 100 m) المسار من $A$ إلى $B$ أفقي، ومن $B$ إلى $C$ شاقولي.',
    parts: [
      {
        label: '1)', title: 'مجموع شعاعين',
        question: 'احسب $\\overrightarrow{AB} + \\overrightarrow{BC}$ ، ثم المجموع $\\overrightarrow{AB} + \\overrightarrow{BC} + \\overrightarrow{CA}$ .',
        asks: ['$\\overrightarrow{AB} + \\overrightarrow{BC}$', '$\\overrightarrow{AB} + \\overrightarrow{BC} + \\overrightarrow{CA}$'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['alaqat-shal'],
            prompt: 'بعلاقة شال، المجموع $\\overrightarrow{AB} + \\overrightarrow{BC}$ يساوي:',
            options: ['$\\overrightarrow{AC}$', '$\\overrightarrow{CA}$', '$\\overrightarrow{AB}$'],
            correct: 0,
            explain: '$\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$ : نصل من $A$ إلى $B$ ثم من $B$ إلى $C$ ، فنصل من $A$ إلى $C$ ؛ نهاية الشعاع الأول هي بداية الثاني.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['alaqat-shal', 'tasawi-shuaayn'],
            prompt: 'قيمة $\\overrightarrow{AB} + \\overrightarrow{BC} + \\overrightarrow{CA}$ هي:',
            options: ['$\\overrightarrow{0}$', '$\\overrightarrow{AC}$', '$\\overrightarrow{AB}$'],
            correct: 0,
            explain: '$\\overrightarrow{AB} + \\overrightarrow{BC} + \\overrightarrow{CA} = \\overrightarrow{AC} + \\overrightarrow{CA} = \\overrightarrow{0}$ : مسار مغلق يعود إلى نقطة الانطلاق، والشعاعان $\\overrightarrow{AC}$ و $\\overrightarrow{CA}$ متعاكسان.' },
          { kind: 'solution', ask: 0, lines: [
            '$\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$ (علاقة شال).',
            '$\\overrightarrow{AB} + \\overrightarrow{BC} + \\overrightarrow{CA} = \\overrightarrow{AC} + \\overrightarrow{CA} = \\overrightarrow{0}$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'العودة المباشرة',
        question: 'احسب المسافة $CA$ بالمتر، ثم احسب كم يوفّر الفوج بالعودة من $C$ إلى $A$ مباشرة بدل المرور بـ $B$ .',
        asks: ['المسافة $CA$ بالمتر', 'المسافة التي يوفّرها الفوج بالمتر'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['fithaghuris'],
            prompt: 'المثلث $ABC$ قائم في $B$ ، فحسب خاصية فيثاغورس:',
            options: ['$AC^2 = AB^2 + BC^2$', '$AC = AB + BC$', '$AB^2 = AC^2 + BC^2$'],
            correct: 0,
            explain: 'الوتر $[AC]$ هو الضلع المقابل للزاوية القائمة، ومربّعه يساوي مجموع مربّعي الضلعين القائمين.' },
          { kind: 'numeric', role: 'compute',
            prompt: 'قيمة $AC^2$ (الوحدة: مربع):', expected: 25,
            explain: '$4^2 + 3^2 = 16 + 9 = 25$ ، إذن $AC = 5$ مربعات.' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'المسافة $CA$ :', expected: 500, suffix: 'm',
            explain: '$5 \\times 100 = 500$ m.' },
          { kind: 'numeric', role: 'compute',
            prompt: 'طول المسار ذهابًا $A \\to B \\to C$ :', expected: 700, suffix: 'm',
            explain: '$(4 + 3) \\times 100 = 700$ m.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'ما يوفّره الفوج بالعودة المباشرة:', expected: 200, suffix: 'm',
            explain: '$700 - 500 = 200$ m.' },
          { kind: 'solution', ask: 0, lines: [
            '$AC^2 = 4^2 + 3^2$ ، أي $16 + 9 = 25$ ، إذن $AC = 5$ مربعات، أي $5 \\times 100 = 500$ m.',
            'المسار ذهابًا: $(4 + 3) \\times 100 = 700$ m.',
            'يوفّر الفوج $700 - 500 = 200$ m بالعودة المباشرة.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-4',
    title: 'الوضعية التدريبية 4 — مصباح القاعة',
    context: 'منتصف القطرين',
    emoji: '💡',
    source: SOURCE,
    tone: 'violet',
    figure: FIG_SALLE,
    statement: 'قاعة العرض في المدرسة $ABCD$ متوازي أضلاع. ركّب الكهربائي مصباحًا عند النقطة $O$ منتصف القطر $[AC]$ ، وحين طلب منه المدير فاتورة مفصّلة قدّمها بأمانة وحاسب على الكبلات التي استعملها فقط. طول القطر $[AC]$ هو 14 m وطول القطر $[BD]$ هو 10 m، وثمن المتر الواحد من الكبل 150 دج.',
    parts: [
      {
        label: '1)', title: 'منتصف القطر الثاني',
        question: 'بيّن أنّ $\\overrightarrow{DO} = \\overrightarrow{OB}$ ، ثم استنتج موضع $O$ بالنسبة إلى القطعة $[BD]$ .',
        asks: ['$\\overrightarrow{DO} = \\overrightarrow{OB}$', 'موضع $O$ بالنسبة إلى $[BD]$'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['alaqat-shal'],
            prompt: 'لندخل النقطة $C$ في $\\overrightarrow{DO}$ ، نكتب:',
            options: [
              '$\\overrightarrow{DO} = \\overrightarrow{DC} + \\overrightarrow{CO}$',
              '$\\overrightarrow{DO} = \\overrightarrow{DC} + \\overrightarrow{OC}$',
              '$\\overrightarrow{DO} = \\overrightarrow{CD} + \\overrightarrow{CO}$',
            ],
            correct: 0,
            explain: 'علاقة شال: نهاية الشعاع الأول $C$ هي بداية الثاني. في الخيارين الآخرين لا يتتابع الشعاعان من $D$ إلى $O$ .' },
          { kind: 'choice', role: 'conclude', requires: ['mutawazi-tartib', 'tasawi-shuaayn'],
            prompt: 'نعوّض $\\overrightarrow{DC}$ و $\\overrightarrow{CO}$ بشعاعين يساويانهما:',
            options: [
              '$\\overrightarrow{DC} = \\overrightarrow{AB}$ (لأنّ $ABCD$ متوازي أضلاع) و $\\overrightarrow{CO} = \\overrightarrow{OA}$ (لأنّ $O$ منتصف $[AC]$ )',
              '$\\overrightarrow{DC} = \\overrightarrow{BA}$ و $\\overrightarrow{CO} = \\overrightarrow{OA}$',
              '$\\overrightarrow{DC} = \\overrightarrow{AB}$ و $\\overrightarrow{CO} = \\overrightarrow{AO}$',
            ],
            correct: 0,
            explain: 'في متوازي الأضلاع $ABCD$ لدينا $\\overrightarrow{AB} = \\overrightarrow{DC}$ . وبما أنّ $O$ منتصف $[AC]$ فإنّ $\\overrightarrow{AO} = \\overrightarrow{OC}$ ، ومنه $\\overrightarrow{CO}$ يساوي $\\overrightarrow{OA}$ لا $\\overrightarrow{AO}$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['alaqat-shal', 'tasawi-shuaayn'],
            prompt: 'أيّ سلسلة تبرهن المطلوب؟',
            options: [
              '$\\overrightarrow{DO} = \\overrightarrow{DC} + \\overrightarrow{CO} = \\overrightarrow{AB} + \\overrightarrow{OA} = \\overrightarrow{OA} + \\overrightarrow{AB} = \\overrightarrow{OB}$',
              '$\\overrightarrow{DO} = \\overrightarrow{DC} + \\overrightarrow{CO} = \\overrightarrow{AB} + \\overrightarrow{AO} = \\overrightarrow{AO} + \\overrightarrow{AB}$ ، ثم نلاحظ على الشكل أنّ $DO = OB$',
              'على الشكل $O$ في وسط القطعة $[BD]$ ، إذن $\\overrightarrow{DO} = \\overrightarrow{OB}$',
            ],
            correct: 0,
            explain: 'بعد التعويض نرتّب الحدّين ليتتابعا: $\\overrightarrow{OA} + \\overrightarrow{AB} = \\overrightarrow{OB}$ . في السلسلة الثانية عُوّض $\\overrightarrow{CO}$ بالمعاكس، فلا يتتابع الشعاعان؛ والثالثة تقرأ الشكل ولا تستعمل المعطيات.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['mustaqim-muntasafayn', 'tasawi-shuaayn'],
            prompt: 'ماذا يعني $\\overrightarrow{DO} = \\overrightarrow{OB}$ ؟',
            options: [
              '$O$ منتصف القطعة $[BD]$',
              '$O$ تنتمي إلى القطعة $[BD]$ دون أن تكون منتصفها بالضرورة',
              '$OD = OB$ فقط، فقد تكون $O$ خارج القطعة $[BD]$',
            ],
            correct: 0,
            explain: 'تساوي الشعاعين $\\overrightarrow{DO}$ و $\\overrightarrow{OB}$ يعني أنّ $O$ على القطعة $[DB]$ وأنّ $DO = OB$ ، أي أنّ $O$ منتصفها. تساوي الطولين وحده لا يكفي.' },
          { kind: 'solution', ask: 0, lines: [
            '$\\overrightarrow{DO} = \\overrightarrow{DC} + \\overrightarrow{CO}$ (علاقة شال).',
            '$\\overrightarrow{DC} = \\overrightarrow{AB}$ (متوازي أضلاع) و $\\overrightarrow{CO} = \\overrightarrow{OA}$ ($O$ منتصف $[AC]$ )، إذن $\\overrightarrow{DO} = \\overrightarrow{AB} + \\overrightarrow{OA} = \\overrightarrow{OA} + \\overrightarrow{AB} = \\overrightarrow{OB}$ .',
            '$\\overrightarrow{DO} = \\overrightarrow{OB}$ ، إذن $O$ منتصف القطعة $[BD]$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'الكبلات وثمنها',
        question: 'احسب طول الكبل الذي يربط المصباح $O$ بالرؤوس الأربعة، ثم ثمنه.',
        asks: ['طول الكبل بالمتر', 'ثمن الكبل بالدينار'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['mustaqim-muntasafayn'],
            prompt: 'الطول $AO$ علمًا أنّ $O$ منتصف $[AC]$ :', expected: 7, suffix: 'm',
            explain: 'بما أنّ $O$ منتصف $[AC]$ فإنّ $AO = OC$ ، وكل منهما نصف $14$ : $14 \\div 2 = 7$ .' },
          { kind: 'numeric', role: 'compute', requires: ['mustaqim-muntasafayn'],
            prompt: 'الطول $OB$ علمًا أنّ $O$ منتصف $[BD]$ (النتيجة السابقة) وأنّ $BD = 10$ m:', expected: 5, suffix: 'm',
            explain: 'بما أنّ $O$ منتصف $[BD]$ فإنّ $OB = OD$ ، وكل منهما نصف $10$ : $10 \\div 2 = 5$ .' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'الطول الكلي للكبل $OA + OB + OC + OD$ :', expected: 24, suffix: 'm',
            explain: '$7 + 5 + 7 + 5 = 24$ m.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'ثمن الكبل:', expected: 3600, suffix: 'دج',
            explain: '$24 \\times 150 = 3600$ دج.' },
          { kind: 'solution', ask: 0, lines: [
            '$O$ منتصف $[AC]$ و $[BD]$ ، إذن $AO = OC = 14 \\div 2 = 7$ m و $OB = OD = 10 \\div 2 = 5$ m.',
            'طول الكبل: $7 + 5 + 7 + 5 = 24$ m.',
            'الثمن: $24 \\times 150 = 3600$ دج.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-5',
    title: 'الوضعية التدريبية 5 — جسر فوق القناة',
    context: 'أقصر مسلك يعبر قناة',
    emoji: '💧',
    source: SOURCE,
    tone: 'rose',
    figure: FIG_CANAL,
    statement: "يمرّ ياسين كل صباح بقناة للسقي في طريقه من بيته $A$ إلى مدرسته $B$ ، وهو لا يتأخّر عن أوّل حصة لأنه يحترم الوقت. تقرّر بناء جسر للمشاة $[MN]$ عمودي على ضفتي القناة (مستقيمان متوازيان)، فيصبح مسلكه $A \\to M \\to N \\to B$ . على مخطط مرسوم على ورقة مرصوفة (ضلع المربع يمثّل 50 m)، عرض القناة مربعان، و $A$ فوق الضفة العليا بأربعة مربعات، و $B$ تحت الضفة السفلى بمربعين وعلى بعد ثمانية مربعات أفقيا من $A$ . يريد ياسين أن يكون مسلكه أقصر ما يمكن، وهو يمشي بسرعة 60 m في الدقيقة.",
    parts: [
      {
        label: '1)', title: 'نقل B بشعاع الجسر',
        question: "عيّن النقطة $B'$ صورة $B$ بالانسحاب الذي شعاعه $\\overrightarrow{NM}$ ، ثم بيّن أنّ $NB = MB'$ .",
        asks: ["موضع النقطة $B'$", "$NB = MB'$"],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['sura-insihab'],
            prompt: "$B'$ صورة $B$ بالانسحاب الذي شعاعه $\\overrightarrow{NM}$ تعني:",
            options: ["$\\overrightarrow{BB'} = \\overrightarrow{NM}$", "$\\overrightarrow{BB'} = \\overrightarrow{MN}$", "$\\overrightarrow{BB'} = \\overrightarrow{AB}$"],
            correct: 0,
            explain: "الشعاع يبدأ من النقطة $B$ وينتهي عند صورتها $B'$ ، وله منحى $\\overrightarrow{NM}$ واتجاهه وطوله (عرض القناة). بالشعاع $\\overrightarrow{MN}$ تنزل $B$ بدل أن تصعد." },
          { kind: 'numeric', role: 'compute',
            prompt: 'عدد المربعات التي يصعدها الشعاع $\\overrightarrow{NM}$ (عرض القناة):', expected: 2,
            explain: 'الجسر عمودي على الضفتين وطوله عرض القناة: مربعان.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['sura-insihab'],
            prompt: "أين تقع النقطة $B'$ ؟",
            options: [
              'على الضفة السفلى، فوق $B$ بمربعين',
              'على الضفة العليا، فوق $B$ بأربعة مربعات',
              'تحت $B$ بمربعين',
            ],
            correct: 0,
            explain: "$B$ تحت الضفة السفلى بمربعين، والشعاع $\\overrightarrow{NM}$ يصعد مربعين، فتصل $B'$ إلى الضفة السفلى تمامًا. الخيار الثاني يصعد أربعة مربعات، والثالث ينزل." },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['mutawazi-tartib', 'tasawi-shuaayn'],
            prompt: "لماذا $NB = MB'$ ؟",
            options: [
              "لأنّ $\\overrightarrow{BB'} = \\overrightarrow{NM}$ ، فالرباعي $MB'BN$ متوازي أضلاع وضلعاه المتقابلان $[NB]$ و $[MB']$ متقايسان",
              "لأنّ $M$ منتصف القطعة $[NB']$",
              'لأنّ الجسر عمودي على الضفتين',
            ],
            correct: 0,
            explain: "تساوي الشعاعين $\\overrightarrow{NM}$ و $\\overrightarrow{BB'}$ يجعل $MB'BN$ متوازي أضلاع، وفي متوازي الأضلاع كل ضلع يساوي ضلعه المقابل. عمودية الجسر تعطي طوله لا هذا التساوي." },
          { kind: 'solution', ask: 0, lines: [
            "$\\overrightarrow{BB'} = \\overrightarrow{NM}$ : $B'$ على الضفة السفلى، فوق $B$ بمربعين.",
            "$\\overrightarrow{NM} = \\overrightarrow{BB'}$ ، إذن الرباعي $MB'BN$ متوازي أضلاع.",
            "ضلعاه المتقابلان $[NB]$ و $[MB']$ متقايسان: $NB = MB'$ .",
          ] },
        ],
      },
      {
        label: '2)', title: 'أقصر مسلك وزمنه',
        question: "احسب $AB'$ ، ثم استنتج طول أقصر مسلك وزمن قطعه.",
        asks: ["الطول $AB'$ بالمربعات", 'طول أقصر مسلك بالمتر', 'زمن قطعه بالدقائق'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['mutabayina-muthallathiya'],
            prompt: "طول المسلك $AM + MN + NB$ يساوي $AM + MB' + MN$ . يكون أقصر ما يمكن عندما:",
            options: ["$M$ على القطعة $[AB']$", '$M$ على القطعة $[AB]$', '$M$ في منتصف الضفة العليا'],
            correct: 0,
            explain: "$MN$ ثابت (عرض القناة)، و $AM + MB' \\geq AB'$ والمساواة فقط إذا كانت $M$ على $[AB']$ . الجسر عمودي على الضفتين فلا يتبع $[AB]$ ." },
          { kind: 'numeric', role: 'compute',
            prompt: "عدد المربعات الشاقولية بين $A$ و $B'$ :", expected: 6,
            explain: "$A$ فوق الضفة العليا بأربعة مربعات وعرض القناة مربعان و $B'$ على الضفة السفلى: $4 + 2 = 6$ ." },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['fithaghuris'],
            prompt: "الطول $AB'$ :", expected: 10, suffix: 'مربعات',
            explain: "أفقيا ثمانية مربعات وشاقوليا ستة: نحسب $8^2 + 6^2 = 64 + 36 = 100$ ، فـ $AB' = 10$ مربعات." },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: "طول أقصر مسلك $AB' + MN$ :", expected: 600, suffix: 'm',
            explain: '$(10 + 2) \\times 50 = 600$ m.' },
          { kind: 'numeric', role: 'answer', ask: 2,
            prompt: 'زمن قطع هذا المسلك:', expected: 10, suffix: 'دقائق',
            explain: '$600 \\div 60 = 10$ دقائق.' },
          { kind: 'solution', ask: 0, lines: [
            "$AB'^2 = 8^2 + 6^2$ ، أي $64 + 36 = 100$ ، إذن $AB' = 10$ مربعات.",
            "أقصر مسلك: $AB' + MN = 10 + 2 = 12$ مربعًا، أي $12 \\times 50 = 600$ m.",
            'زمن قطعه: $600 \\div 60 = 10$ دقائق.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'wadiya-6',
    title: 'الوضعية التدريبية 6 — منحدر المكتبة',
    context: 'دعامتان متساويتان في متوازي أضلاع',
    emoji: '♿',
    source: SOURCE,
    tone: 'indigo',
    figure: FIG_RAMPE,
    statement: 'تضامنًا مع زميل لهم يستعمل كرسيًّا متحرّكًا، قرّر أعضاء نادي المدرسة إنجاز منحدر عند مدخل المكتبة، وتبرّع جيران المدرسة بالألواح والمسامير. مقطع جانبي لهيكل المنحدر مرسوم على ورقة مرصوفة (ضلع المربع يمثّل 50 cm): $ABCD$ متوازي أضلاع دعامتاه المائلتان $[AD]$ و $[BC]$ ، و $E$ صورة $C$ بالانسحاب الذي شعاعه $\\overrightarrow{AD}$ . طول الدعامة $[BC]$ يساوي 250 cm، وثمن المتر الواحد من الخشب 1500 دج.',
    parts: [
      {
        label: '1)', title: 'منتصف القطعة',
        question: 'بيّن أنّ $C$ منتصف القطعة $[BE]$ .',
        asks: ['$C$ منتصف القطعة $[BE]$'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['mutawazi-tartib'],
            prompt: 'لأنّ $ABCD$ متوازي أضلاع فإنّ:',
            options: ['$\\overrightarrow{BC} = \\overrightarrow{AD}$', '$\\overrightarrow{BC} = \\overrightarrow{DA}$', '$\\overrightarrow{BC} = \\overrightarrow{AC}$'],
            correct: 0,
            explain: 'الضلعان المتقابلان $[BC]$ و $[AD]$ يعطيان شعاعين متساويين: من $B$ إلى $C$ كما من $A$ إلى $D$ .' },
          { kind: 'choice', role: 'translate', requires: ['sura-insihab'],
            prompt: '$E$ صورة $C$ بالانسحاب الذي شعاعه $\\overrightarrow{AD}$ تعني:',
            options: ['$\\overrightarrow{CE} = \\overrightarrow{AD}$', '$\\overrightarrow{EC} = \\overrightarrow{AD}$', '$\\overrightarrow{CE} = \\overrightarrow{DA}$'],
            correct: 0,
            explain: 'الشعاع يبدأ من $C$ وينتهي عند صورتها $E$ ، وهو يساوي شعاع الانسحاب $\\overrightarrow{AD}$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['mustaqim-muntasafayn', 'tasawi-shuaayn'],
            prompt: 'ماذا نستنتج؟',
            options: [
              '$\\overrightarrow{BC} = \\overrightarrow{AD} = \\overrightarrow{CE}$ ، إذن $C$ منتصف القطعة $[BE]$',
              '$BC = CE$ فقط، إذن $C$ منتصف القطعة $[BE]$',
              '$\\overrightarrow{BC} = \\overrightarrow{EC}$ ، إذن $C$ منتصف القطعة $[BE]$',
            ],
            correct: 0,
            explain: 'تساوي الشعاعين $\\overrightarrow{BC}$ و $\\overrightarrow{CE}$ يعني أنّ $C$ على القطعة $[BE]$ وفي منتصفها. تساوي الطولين وحده لا يضمن أنّ النقط على استقامة واحدة، و $\\overrightarrow{EC}$ يعاكس $\\overrightarrow{CE}$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$ABCD$ متوازي أضلاع، إذن $\\overrightarrow{BC} = \\overrightarrow{AD}$ .',
            "$E$ صورة $C$ بالانسحاب الذي شعاعه $\\overrightarrow{AD}$ ، إذن $\\overrightarrow{CE} = \\overrightarrow{AD}$ .",
            'ومنه $\\overrightarrow{BC} = \\overrightarrow{CE}$ ، أي أنّ $C$ منتصف القطعة $[BE]$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'الطول والثمن',
        question: 'احسب طول القطعة $[BE]$ بالمتر، ثم ثمن الخشب اللازم لها.',
        asks: ['طول القطعة $[BE]$ بالمتر', 'ثمن الخشب بالدينار'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['tasawi-shuaayn'],
            prompt: 'الطول $CE$ بالسنتيمتر (لأنّ $\\overrightarrow{CE} = \\overrightarrow{BC}$ ):', expected: 250, suffix: 'cm',
            explain: 'شعاعان متساويان لهما الطول نفسه: $CE = BC = 250$ cm.' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'الطول $BE$ بالمتر:', expected: 5, suffix: 'm',
            explain: 'بما أنّ $C$ منتصف $[BE]$ فإنّ $BE = BC + CE$ ، أي $250 + 250 = 500$ cm، أي 5 m.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'ثمن الخشب اللازم للقطعة $[BE]$ :', expected: 7500, suffix: 'دج',
            explain: '$5 \\times 1500 = 7500$ دج.' },
          { kind: 'solution', ask: 0, lines: [
            '$\\overrightarrow{CE} = \\overrightarrow{BC}$ ، إذن $CE = BC = 250$ cm.',
            '$C$ منتصف $[BE]$ ، إذن $BE = 250 + 250 = 500$ cm = 5 m.',
            'الثمن: $5 \\times 1500 = 7500$ دج.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
