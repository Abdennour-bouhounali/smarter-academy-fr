/**
 * Les six « وضعيات تدريبية » de أدمج تعلّماتي de l'unité 10 (modules 1 à 6) — des situations COMPLÈTES de type
 * امتحان autour du calcul trigonométrique dans le triangle rectangle, résolues pas à pas
 * (common/problems/GuidedProblem.jsx), AVANT la situation évaluée (« وضعية الاختبار النهائي », dernier module).
 *
 * Demande du propriétaire (2026-10-13) : que l'élève s'exerce sur beaucoup de situations avant celle sur laquelle il sera
 * évalué (modèle : unité 1, `wadiya-idmajiya-aadad`). Ce sont des AJOUTS DE LA PLATEFORME, déclarés comme tels
 * (`addition('exam_style_problem')`), jamais présentés comme des exercices du manuel. Chacune mobilise ce que la synthèse
 * mobilise (tangente, sinus, cosinus ; touche inverse ; cos² + sin² = 1 ; Pythagore ; Thalès dans une ligne de visée ou
 * une figure à parallèles) et rappelle la démarche en trois temps du manuel (قراءة · تحليل · تنفيذ), sans notion nouvelle.
 *
 *   1  l'ombre d'un arbre          tan, touche inverse, Pythagore, sin/tan avec un angle donné
 *   2  le téléphérique             sin, cos, tan dans deux triangles rectangles consécutifs
 *   3  le cerf-volant              cos² + sin² = 1 et tan = sin ÷ cos, puis l'angle
 *   4  la salle de lecture         Pythagore deux fois dans un pavé, puis l'angle de la diagonale
 *   5  trois sentiers (tableau)    tan, touche inverse, Pythagore, longueur par cos
 *   6  la largeur d'un oued        Thalès (parallèle à la rive), tan, Pythagore
 *
 * Aucune sous-étape n'est une `assessment` : la maîtrise vient du dernier module seulement. Chaque nombre, chaque
 * égalité écrite et chaque figure est recalculé dans ./problems.test.js. Une valeur est tissée dans chaque énoncé
 * (LESSON_DEVELOPMENT_GUIDE › « Values in story contexts »).
 */
import { addition } from '../../_unit/unitMeta.js';
import { boxFigure } from './figures.js';

const SOURCE = addition('exam_style_problem');

// ── 1 — l'arbre : P pied, T sommet (8 m), E bout de l'ombre (6 m), x = angle des rayons avec le sol ──
const FIG_TREE = {
  points: { P: [0, 0], T: [0, 8], E: [6, 0] },
  segments: [
    { from: 'P', to: 'T', label: '8m', bold: true },
    { from: 'P', to: 'E', label: '6m', tone: 'sky' },
    { from: 'T', to: 'E', tone: 'amber' },
  ],
  rightAngles: [['T', 'P', 'E']],
  angles: [{ at: 'E', from: 'P', to: 'T', label: 'x' }],
  labels: { P: 'sw', T: 'nw', E: 'se' },
  ariaLabel: 'شجرة زيتون [PT] ارتفاعها 8m شاقولية على أرض أفقية، وظلّها [PE] طوله 6m؛ الشعاع [TE] يصنع مع الأرض في E الزاوية x؛ المثلث PTE قائم في P',
  maxWidth: 300,
};

// ── 2 — le téléphérique (échelle 1/10) : O station basse, A pylône (600 m à 28°), B arrivée (AC = 400, CB = 300) ──
const FIG_CABLE = {
  points: { O: [0, 0], H: [52.98, 0], A: [52.98, 28.17], C: [92.98, 28.17], B: [92.98, 58.17] },
  segments: [
    { from: 'O', to: 'A', label: '600m', bold: true, tone: 'amber' },
    { from: 'A', to: 'B', bold: true, tone: 'emerald' },
    { from: 'O', to: 'H', dashed: true },
    { from: 'H', to: 'A', dashed: true },
    { from: 'A', to: 'C', label: '400m', dashed: true },
    { from: 'C', to: 'B', label: '300m', dashed: true },
  ],
  rightAngles: [['O', 'H', 'A'], ['A', 'C', 'B']],
  angles: [{ at: 'O', from: 'H', to: 'A', label: '28°' }],
  labels: { O: 'sw', H: 's', A: 'nw', C: 'se', B: 'ne' },
  caption: 'الشكل ليس بالسلّم الدقيق.',
  ariaLabel: 'تلفريك: الكابل [OA] طوله 600m يصنع مع الأفق الزاوية 28 درجة في O والنقطة H أسفل A على الأرض الأفقية، ثم الكابل [AB] نحو القمة B حيث AC = 400m أفقيا و CB = 300m شاقوليا والمثلثان OHA و ACB قائمان في H وفي C',
  maxWidth: 360,
};

// ── 3 — le cerf-volant : O main de l'enfant, K le cerf-volant (fil 50 m), H sous K à la hauteur de O (K à 30 m) ──
const FIG_KITE = {
  points: { O: [0, 0], H: [40, 0], K: [40, 30] },
  segments: [
    { from: 'O', to: 'K', label: '50m', bold: true, tone: 'violet' },
    { from: 'O', to: 'H', dashed: true },
    { from: 'H', to: 'K', label: '30m', dashed: true },
  ],
  rightAngles: [['O', 'H', 'K']],
  angles: [{ at: 'O', from: 'H', to: 'K', label: 'α' }],
  labels: { O: 'sw', H: 'se', K: 'ne' },
  ariaLabel: 'طائرة ورقية في النقطة K على ارتفاع 30m فوق النقطة H التي هي على مستوى يد الطفل O؛ الخيط [OK] طوله 50m يصنع مع الأفق الزاوية α؛ المثلث OHK قائم في H',
  maxWidth: 320,
};

// ── 4 — la salle de lecture : pavé ABCDEFGH 4 m × 3 m × 2,4 m, câble [AD] ──
const FIG_HALL = boxFigure({
  AB: 4, BC: 3, CD: 2.4, lab: { AB: '4m', BC: '3m', CD: '2,4m' }, maxWidth: 340,
  ariaLabel: 'قاعة مطالعة على شكل متوازي مستطيلات ABCDEFGH: AB = 4m و BC = 3m والحرف الشاقولي CD = 2,4m؛ القطعتان [AC] قطر الأرضية و [AD] مسار الكابل مرسومتان والمثلث ACD قائم في C',
});

// ── 6 — l'oued : A, B sur deux rives (AB ⟂ AC), C sur la rive de A, D ∈ [AC] avec CD = 20, E ∈ [CB] avec (DE) ∥ (AB) ──
const FIG_WADI = {
  points: { A: [0, 0], B: [0, 48], C: [60, 0], D: [40, 0], E: [40, 16] },
  segments: [
    { from: 'A', to: 'C', label: '60m' },
    { from: 'C', to: 'D', label: '20m', tone: 'sky', bold: true },
    { from: 'D', to: 'E', label: '16m', tone: 'amber', bold: true },
    { from: 'A', to: 'B', dashed: true },
    { from: 'B', to: 'C', tone: 'emerald' },
  ],
  rightAngles: [['B', 'A', 'C'], ['E', 'D', 'C']],
  angles: [{ at: 'C', from: 'A', to: 'B', label: 'x' }],
  labels: { A: 'sw', B: 'nw', C: 'se', D: 's', E: 'ne' },
  ariaLabel: 'وادٍ عرضه AB بين الضفتين؛ النقطة C على ضفة A حيث AC = 60m والنقطة D على [AC] بحيث CD = 20m؛ النقطة E على [CB] بحيث [DE] يوازي [AB] وDE = 16m؛ الزاوية x هي الزاوية ACB',
  maxWidth: 340,
};

export const PROBLEMS = [
  // ═══ 1 — l'ombre d'un arbre : x = 53° (tan x = 8/6), TE = 10 ; à 35° : d ≈ 11,43 et ℓ ≈ 13,95 ═══
  {
    id: 'wadiya-1',
    title: 'الوضعية التدريبية 1 — ظلّ شجرة الزيتون',
    context: 'ظلّ شجرة وأشعة الشمس',
    emoji: '🌳',
    source: SOURCE,
    tone: 'sky',
    statement: 'في إطار حملة «مدرستي نظيفة وخضراء»، غرس تلاميذ القسم شجرة زيتون في ساحة المدرسة وتعاهدوا على سقيها كل أسبوع. ارتفاع الشجرة $8\\,\\mathrm{m}$ ، وفي الصباح كان طول ظلّها على الأرض الأفقية $6\\,\\mathrm{m}$ (الشكل المقابل). أشعة الشمس تصنع مع الأرض الزاوية $x$ .',
    figure: FIG_TREE,
    parts: [
      {
        label: '1)', title: 'زاوية أشعة الشمس',
        question: 'عيّن قيس الزاوية $x$ مدوّرًا إلى الدرجة، ثم احسب طول الشعاع $TE$ .',
        asks: ['قيس الزاوية $x$', 'طول الشعاع $TE$'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['nisab-tarif'],
            prompt: 'في المثلث $PTE$ القائم في $P$ ، بالنسبة إلى الزاوية $x$ ، الضلعان المعلومان $[PT]$ و $[PE]$ هما:',
            options: ['المقابل والمجاور: يربطهما الظل', 'المقابل والوتر: يربطهما الجيب', 'المجاور والوتر: يربطهما جيب التمام'],
            correct: 0, cols: 3,
            explain: '$[PT]$ لا يمرّ بالرأس $E$ فهو المقابل للزاوية $x$ ، و $[PE]$ يمرّ بها فهو المجاور (والوتر هو $[TE]$ المجهول): المقابل والمجاور يربطهما الظل.' },
          { kind: 'numeric', role: 'compute', requires: ['nisab-tarif'],
            prompt: 'ظلّ الزاوية $x$ مدوّرًا إلى 0,01 :', expected: 1.33, display: '1,33',
            explain: '$\\tan x = \\dfrac{PT}{PE} = \\dfrac{8}{6} \\approx 1{,}33$ : هذا العدد ظلّ الزاوية لا قيسها.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hasiba-aks', 'tadwir'],
            prompt: 'قيس الزاوية $x$ مدوّرًا إلى الدرجة:', expected: 53, suffix: '°',
            explain: 'باللمسة العكسية للظل على $\\dfrac{8}{6}$ نفسه: $x \\approx 53{,}13^{\\circ}$ ، أي $53^{\\circ}$ بالتدوير إلى الدرجة (ندوّر في آخر الحساب).' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['fithaghuris-fada'],
            prompt: 'طول الشعاع $TE$ (بالمتر):', expected: 10,
            explain: 'المثلث $PTE$ قائم في $P$ : $TE^2 = 8^2 + 6^2 = 64 + 36 = 100$ ، إذن $TE = 10\\,\\mathrm{m}$ .' },
          { kind: 'solution', ask: 0, lines: [
            'المثلث $PTE$ قائم في $P$ : $\\tan x = \\dfrac{PT}{PE} = \\dfrac{8}{6}$ ، ومنه $x \\approx 53^{\\circ}$ .',
            '$TE^2 = 8^2 + 6^2 = 100$ ، إذن $TE = 10\\,\\mathrm{m}$ .',
            'أشعة الشمس تصنع في الصباح زاوية قيسها $53^{\\circ}$ تقريبا مع الأرض، وطول الشعاع بين قمة الشجرة وطرف الظلّ $10\\,\\mathrm{m}$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'الظلّ بعد الظهر',
        question: 'بعد الظهر صارت أشعة الشمس تصنع مع الأرض الزاوية $35^{\\circ}$ . احسب طول الظلّ الجديد $d$ مدوّرًا إلى 0,01 ، ثم احسب طول الشعاع الجديد $\\ell$ مدوّرًا إلى 0,01 .',
        asks: ['طول الظلّ الجديد $d$', 'طول الشعاع الجديد $\\ell$'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['majhul-maqam'],
            prompt: 'الشجرة ارتفاعها $8\\,\\mathrm{m}$ ، والمجهول $d$ هو الضلع المجاور للزاوية $35^{\\circ}$ . المساواة الصحيحة:',
            options: ['$d = \\dfrac{8}{\\tan 35^{\\circ}}$', '$d = 8 \\times \\tan 35^{\\circ}$', '$d = \\dfrac{8}{\\sin 35^{\\circ}}$'],
            correct: 0, cols: 3,
            explain: '$\\tan 35^{\\circ} = \\dfrac{8}{d}$ والمجهول في المقام، فنقسم: $d = \\dfrac{8}{\\tan 35^{\\circ}}$ . (الضرب يعطي ظلّا أقصر من الشجرة، والجيب يخصّ الوتر لا المجاور.)' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['majhul-maqam', 'tadwir'],
            prompt: 'طول الظلّ الجديد $d$ (بالمتر):', expected: 11.43, display: '11,43',
            explain: 'بالحاسبة: $d = \\dfrac{8}{\\tan 35^{\\circ}} \\approx 11{,}43$ (الشاشة 11,42518...: الرقم الثالث 5 فنرفع).' },
          { kind: 'choice', role: 'translate', requires: ['nisab-tarif'],
            prompt: 'الشعاع $\\ell$ هو وتر المثلث، والارتفاع $8\\,\\mathrm{m}$ هو المقابل للزاوية $35^{\\circ}$ . المساواة الصحيحة:',
            options: ['$\\ell = \\dfrac{8}{\\sin 35^{\\circ}}$', '$\\ell = \\dfrac{8}{\\cos 35^{\\circ}}$', '$\\ell = 8 \\times \\sin 35^{\\circ}$'],
            correct: 0, cols: 3,
            explain: '$\\sin 35^{\\circ} = \\dfrac{8}{\\ell}$ : المقابل على الوتر، والمجهول في المقام فنقسم.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['majhul-maqam', 'tadwir'],
            prompt: 'طول الشعاع الجديد $\\ell$ (بالمتر):', expected: 13.95, display: '13,95',
            explain: 'بالحاسبة: $\\ell = \\dfrac{8}{\\sin 35^{\\circ}} \\approx 13{,}95$ . (تحقّق: $13{,}95 > 11{,}43$ والوتر أطول من كل ضلع قائم.)' },
          { kind: 'choice', role: 'conclude',
            prompt: 'قارن بين ظلّ الصباح $6\\,\\mathrm{m}$ وظلّ بعد الظهر $d$ . ماذا نستنتج؟',
            options: [
              'كلما صغرت الزاوية بين أشعة الشمس والأرض طال ظلّ الشجرة',
              'كلما صغرت الزاوية قصر ظلّ الشجرة',
              'طول الظلّ لا يتعلق بالزاوية',
            ],
            correct: 0,
            explain: 'الزاوية انتقلت من $53^{\\circ}$ إلى $35^{\\circ}$ فصار الظلّ من $6\\,\\mathrm{m}$ إلى نحو $11{,}43\\,\\mathrm{m}$ : الظلّ يطول بصغر الزاوية.' },
          { kind: 'solution', ask: 0, lines: [
            '$\\tan 35^{\\circ} = \\dfrac{8}{d}$ ومنه $d = \\dfrac{8}{\\tan 35^{\\circ}} \\approx 11{,}43\\,\\mathrm{m}$ .',
            '$\\sin 35^{\\circ} = \\dfrac{8}{\\ell}$ ومنه $\\ell = \\dfrac{8}{\\sin 35^{\\circ}} \\approx 13{,}95\\,\\mathrm{m}$ .',
            'بعد الظهر يبلغ ظلّ الشجرة نحو $11{,}43\\,\\mathrm{m}$ والشعاع نحو $13{,}95\\,\\mathrm{m}$ .',
          ] },
        ],
      },
    ],
  },

  // ═══ 2 — le téléphérique : OH ≈ 529,8 et HA ≈ 281,7 ; AB = 500 et ∠A ≈ 37° ; dénivelé ≈ 582 ; 220 s ═══
  {
    id: 'wadiya-2',
    title: 'الوضعية التدريبية 2 — التلفريك',
    context: 'كابل يصعد الجبل على مرحلتين',
    emoji: '🚠',
    source: SOURCE,
    tone: 'emerald',
    statement: 'في رحلة مدرسية إلى مدينة جبلية، حجز الأستاذ تذاكر التلفريك قبل أسبوع حتى يصل التلاميذ إلى المتحف في الموعد المحدّد. يصعد التلفريك على مرحلتين: كابل أول $[OA]$ طوله $600\\,\\mathrm{m}$ يصنع مع الأفق الزاوية $28^{\\circ}$ ، ثم كابل ثانٍ $[AB]$ نحو القمة حيث $AC = 400\\,\\mathrm{m}$ أفقيا و $CB = 300\\,\\mathrm{m}$ شاقوليا (الشكل المقابل). سرعة التلفريك $5\\,\\mathrm{m/s}$ .',
    figure: FIG_CABLE,
    parts: [
      {
        label: '1)', title: 'المرحلة الأولى',
        question: 'احسب الارتفاع $HA$ والبعد الأفقي $OH$ مدوّرين إلى 0,1 .',
        asks: ['الارتفاع $HA$', 'البعد الأفقي $OH$'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['nisab-tarif'],
            prompt: 'في المثلث $OHA$ القائم في $H$ ، بالنسبة إلى الزاوية $28^{\\circ}$ ، الارتفاع $HA$ والكابل $OA$ هما:',
            options: ['المقابل والوتر: يربطهما الجيب', 'المجاور والوتر: يربطهما جيب التمام', 'المقابل والمجاور: يربطهما الظل'],
            correct: 0, cols: 3,
            explain: '$[HA]$ لا يمرّ بالرأس $O$ فهو المقابل، و $[OA]$ يقابل الزاوية القائمة فهو الوتر: $\\sin 28^{\\circ} = \\dfrac{HA}{600}$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hasiba-aks', 'tadwir'],
            prompt: 'الارتفاع $HA$ مدوّرًا إلى 0,1 (بالمتر):', expected: 281.7, display: '281,7',
            explain: '$HA = 600 \\times \\sin 28^{\\circ} \\approx 281{,}7$ (الشاشة 281,68...: المجهول في البسط فنضرب).' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hasiba-aks', 'tadwir'],
            prompt: 'البعد الأفقي $OH$ مدوّرًا إلى 0,1 (بالمتر):', expected: 529.8, display: '529,8',
            explain: '$\\cos 28^{\\circ} = \\dfrac{OH}{600}$ ومنه $OH = 600 \\times \\cos 28^{\\circ} \\approx 529{,}8$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$\\sin 28^{\\circ} = \\dfrac{HA}{600}$ ومنه $HA = 600 \\times \\sin 28^{\\circ} \\approx 281{,}7\\,\\mathrm{m}$ .',
            '$\\cos 28^{\\circ} = \\dfrac{OH}{600}$ ومنه $OH = 600 \\times \\cos 28^{\\circ} \\approx 529{,}8\\,\\mathrm{m}$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'المرحلة الثانية',
        question: 'احسب طول الكابل $AB$ ، ثم عيّن قيس الزاوية $\\widehat{CAB}$ مدوّرًا إلى الدرجة.',
        asks: ['طول الكابل $AB$', 'قيس الزاوية $\\widehat{CAB}$'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['fithaghuris-fada'],
            prompt: 'المثلث $ACB$ قائم في $C$ . طول الكابل $AB$ (بالمتر):', expected: 500,
            explain: '$AB^2 = AC^2 + CB^2 = 400^2 + 300^2 = 160000 + 90000 = 250000$ ، إذن $AB = 500\\,\\mathrm{m}$ .' },
          { kind: 'numeric', role: 'compute', requires: ['nisab-tarif'],
            prompt: 'ظلّ الزاوية $\\widehat{CAB}$ :', expected: 0.75, display: '0,75',
            explain: 'المقابل $CB = 300$ والمجاور $AC = 400$ : $\\tan\\widehat{CAB} = \\dfrac{300}{400} = 0{,}75$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hasiba-aks', 'tadwir'],
            prompt: 'قيس الزاوية $\\widehat{CAB}$ مدوّرًا إلى الدرجة:', expected: 37, suffix: '°',
            explain: 'باللمسة العكسية للظل: $\\widehat{CAB} \\approx 36{,}87^{\\circ}$ ، أي $37^{\\circ}$ بالتدوير إلى الدرجة.' },
          { kind: 'solution', ask: 0, lines: [
            '$AB^2 = AC^2 + CB^2 = 400^2 + 300^2 = 250000$ ، إذن $AB = 500\\,\\mathrm{m}$ .',
            '$\\tan\\widehat{CAB} = \\dfrac{CB}{AC} = \\dfrac{300}{400} = 0{,}75$ ومنه $\\widehat{CAB} \\approx 37^{\\circ}$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'الارتفاع الكلي ومدة الرحلة',
        question: 'ما هو فارق الارتفاع بين المحطة $O$ والقمة $B$ مدوّرًا إلى الوحدة؟ وكم ثانية تدوم الرحلة كلها؟',
        asks: ['فارق الارتفاع بين $O$ و $B$', 'مدة الرحلة بالثواني'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tadwir'],
            prompt: 'فارق الارتفاع بين $O$ و $B$ مدوّرًا إلى الوحدة (بالمتر):', expected: 582,
            explain: '$HA + CB = 281{,}68 + 300 = 581{,}68$ ، أي $582\\,\\mathrm{m}$ بالتدوير إلى الوحدة (ندوّر النتيجة النهائية لا $281{,}7$ ).' },
          { kind: 'numeric', role: 'compute',
            prompt: 'طول مساري الكابلين معا $OA + AB$ (بالمتر):', expected: 1100,
            explain: '$OA + AB = 600 + 500 = 1100\\,\\mathrm{m}$ .' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'مدة الرحلة (السرعة $5\\,\\mathrm{m/s}$ ) بالثواني:', expected: 220, suffix: 'ثانية',
            explain: 'الزمن = المسافة ÷ السرعة: $1100 \\div 5 = 220$ ثانية، أي 3 دقائق و 40 ثانية.' },
          { kind: 'solution', ask: 0, lines: [
            'فارق الارتفاع: $HA + CB = 281{,}68 + 300 = 581{,}68$ ، أي $582\\,\\mathrm{m}$ تقريبا.',
            'طول المسار $OA + AB = 600 + 500 = 1100\\,\\mathrm{m}$ ، والزمن $1100 \\div 5 = 220$ ثانية.',
            'تدوم الرحلة 220 ثانية، أي 3 دقائق و 40 ثانية.',
          ] },
        ],
      },
    ],
  },

  // ═══ 3 — le cerf-volant : sin α = 0,6 ; cos α = 0,8 ; tan α = 0,75 ; OH = 40 ; hauteur 21 ; α ≈ 37° ═══
  {
    id: 'wadiya-3',
    title: 'الوضعية التدريبية 3 — الطائرة الورقية',
    context: 'خيط وطائرة ورقية في الحديقة',
    emoji: '🪁',
    source: SOURCE,
    tone: 'violet',
    statement: 'في حديقة الحيّ، ساعد سمير أخاه الصغير على إطلاق طائرته الورقية وتناوبا على إمساك الخيط. طول الخيط $OK = 50\\,\\mathrm{m}$ وهو مشدود، والطائرة $K$ على ارتفاع $30\\,\\mathrm{m}$ فوق مستوى يد الطفل $O$ (الشكل المقابل). نسمّي $\\alpha$ الزاوية التي يصنعها الخيط مع الأفق.',
    figure: FIG_KITE,
    parts: [
      {
        label: '1)', title: 'النسب المثلثية للزاوية $\\alpha$',
        question: 'احسب $\\sin\\alpha$ ، ثم استنتج $\\cos\\alpha$ دون استعمال الطول $OH$ ، ثم استنتج $\\tan\\alpha$ .',
        asks: ['$\\sin\\alpha$', '$\\cos\\alpha$', '$\\tan\\alpha$'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['nisab-tarif'],
            prompt: '$\\sin\\alpha = \\dfrac{HK}{OK} =$', expected: 0.6, display: '0,6',
            explain: 'المقابل للزاوية $\\alpha$ هو $HK = 30$ والوتر $OK = 50$ : $\\sin\\alpha = \\dfrac{30}{50} = 0{,}6$ .' },
          { kind: 'numeric', role: 'compute', requires: ['alaqa-asasiya'],
            prompt: 'من العلاقة $\\cos^2\\alpha + \\sin^2\\alpha = 1$ ، نجد $\\cos^2\\alpha =$', expected: 0.64, display: '0,64',
            explain: '$\\cos^2\\alpha = 1 - \\sin^2\\alpha = 1 - 0{,}6^2 = 1 - 0{,}36 = 0{,}64$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['alaqa-asasiya'],
            prompt: '$\\cos\\alpha =$', expected: 0.8, display: '0,8',
            explain: 'الزاوية حادة فجيب تمامها موجب: $\\cos\\alpha = \\sqrt{0{,}64} = 0{,}8$ .' },
          { kind: 'numeric', role: 'answer', ask: 2, requires: ['alaqa-asasiya'],
            prompt: '$\\tan\\alpha = \\dfrac{\\sin\\alpha}{\\cos\\alpha} =$', expected: 0.75, display: '0,75',
            explain: '$\\tan\\alpha = \\dfrac{0{,}6}{0{,}8} = 0{,}75$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$\\sin\\alpha = \\dfrac{HK}{OK} = \\dfrac{30}{50} = 0{,}6$ .',
            '$\\cos^2\\alpha = 1 - \\sin^2\\alpha = 1 - 0{,}36 = 0{,}64$ ومنه $\\cos\\alpha = 0{,}8$ .',
            '$\\tan\\alpha = \\dfrac{\\sin\\alpha}{\\cos\\alpha} = \\dfrac{0{,}6}{0{,}8} = 0{,}75$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'المسافة والخيط الأقصر',
        question: 'احسب المسافة الأفقية $OH$ ، ثم يقصّر سمير الخيط إلى $35\\,\\mathrm{m}$ مع بقاء الزاوية $\\alpha$ نفسها: احسب الارتفاع الجديد للطائرة.',
        asks: ['المسافة الأفقية $OH$', 'الارتفاع الجديد للطائرة'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['nisab-tarif'],
            prompt: 'بالنسبة إلى الزاوية $\\alpha$ ، الضلع $OH$ مجاور والخيط $OK$ وتر. إذن:',
            options: ['$OH = 50 \\times \\cos\\alpha$', '$OH = \\dfrac{50}{\\cos\\alpha}$', '$OH = 50 \\times \\sin\\alpha$'],
            correct: 0, cols: 3,
            explain: '$\\cos\\alpha = \\dfrac{OH}{50}$ والمجهول في البسط فنضرب: $OH = 50 \\times \\cos\\alpha$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['nisab-tarif'],
            prompt: 'المسافة الأفقية $OH$ (بالمتر):', expected: 40,
            explain: '$OH = 50 \\times 0{,}8 = 40\\,\\mathrm{m}$ . (تحقّق بفيثاغورس: $40^2 + 30^2 = 1600 + 900 = 2500 = 50^2$ .)' },
          { kind: 'choice', role: 'conclude', requires: ['nisab-tarif'],
            prompt: 'عند تقصير الخيط مع بقاء الطائرة في الاتجاه نفسه، $\\sin\\alpha$ :',
            options: ['لا يتغيّر: النسبة لا تتعلق إلا بقيس الزاوية', 'يصغر لأنّ الخيط صار أقصر', 'يتضاعف لأنّ الارتفاع تغيّر'],
            correct: 0,
            explain: 'المثلثان الجديد والقديم لهما الزاوية $\\alpha$ نفسها، والجيب يتعلق بالزاوية فقط: يبقى $\\sin\\alpha = 0{,}6$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['nisab-tarif'],
            prompt: 'الارتفاع الجديد للطائرة (بالمتر):', expected: 21,
            explain: '$35 \\times \\sin\\alpha = 35 \\times 0{,}6 = 21\\,\\mathrm{m}$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$\\cos\\alpha = \\dfrac{OH}{OK}$ ومنه $OH = 50 \\times 0{,}8 = 40\\,\\mathrm{m}$ .',
            'الزاوية $\\alpha$ لم تتغيّر فـ $\\sin\\alpha = 0{,}6$ ، والارتفاع الجديد $35 \\times 0{,}6 = 21\\,\\mathrm{m}$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'قيس الزاوية',
        question: 'عيّن قيس الزاوية $\\alpha$ مدوّرًا إلى الدرجة.',
        asks: ['قيس الزاوية $\\alpha$'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hasiba-aks', 'tadwir'],
            prompt: 'قيس الزاوية $\\alpha$ مدوّرًا إلى الدرجة:', expected: 37, suffix: '°',
            explain: 'من $\\sin\\alpha = 0{,}6$ وباللمسة العكسية للجيب: $\\alpha \\approx 36{,}87^{\\circ}$ ، أي $37^{\\circ}$ . (النتيجة نفسها بـ $\\tan\\alpha = 0{,}75$ ).' },
          { kind: 'choice', role: 'conclude',
            prompt: 'يريد سمير أن تكون الزاوية أكبر من $30^{\\circ}$ لتجنّب أسلاك الكهرباء القريبة. هل يحقّق ذلك؟',
            options: ['نعم، لأنّ $37^{\\circ} > 30^{\\circ}$', 'لا، لأنّ $37^{\\circ} < 30^{\\circ}$', 'لا يمكن الحكم دون معرفة طول الخيط'],
            correct: 0,
            explain: 'القيس $37^{\\circ}$ أكبر من $30^{\\circ}$ ، وطول الخيط لا يؤثر في قيس الزاوية.' },
          { kind: 'solution', ask: 0, lines: [
            '$\\sin\\alpha = 0{,}6$ ومنه $\\alpha \\approx 37^{\\circ}$ (باللمسة العكسية للجيب).',
            'الزاوية $37^{\\circ}$ أكبر من $30^{\\circ}$ فلا خطر على الطائرة من الأسلاك.',
          ] },
        ],
      },
    ],
  },

  // ═══ 4 — la salle de lecture : AC = 5, AD² = 30,76, AD ≈ 5,55 → câble de 6 m ; ∠DAC ≈ 26° ═══
  {
    id: 'wadiya-4',
    title: 'الوضعية التدريبية 4 — كابل قاعة المطالعة',
    context: 'قطر متوازي مستطيلات وزاويته',
    emoji: '📚',
    source: SOURCE,
    tone: 'amber',
    statement: 'لتشجيع التلاميذ على القراءة والبحث، قرّرت إدارة المدرسة تجهيز قاعة المطالعة بنقطة إنترنت. القاعة على شكل متوازي مستطيلات ABCDEFGH طولها $AB = 4\\,\\mathrm{m}$ وعرضها $BC = 3\\,\\mathrm{m}$ وارتفاعها $CD = 2{,}4\\,\\mathrm{m}$ (الحرف $[CD]$ شاقولي، الشكل المقابل). يمرّ الكابل في خط مستقيم من الزاوية $A$ من الأرض إلى الزاوية المقابلة $D$ من السقف.',
    figure: FIG_HALL,
    parts: [
      {
        label: '1)', title: 'طول الكابل',
        question: 'احسب $AC$ ، ثم احسب $AD$ مدوّرًا إلى 0,01 .',
        asks: ['الطول $AC$', 'الطول $AD$'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['fithaghuris-fada'],
            prompt: 'لحساب $AC$ ثم $AD$ نبحث عن مثلثين قائمين:',
            options: [
              '$ABC$ قائم في $B$ ثم $ACD$ قائم في $C$',
              '$ABC$ قائم في $A$ ثم $ACD$ قائم في $D$',
              'مثلث واحد يضمّ الأبعاد الثلاثة معا',
            ],
            correct: 0,
            explain: '$[AB]$ و $[BC]$ ضلعان متعامدان في أرضية القاعة، و $[CD]$ شاقولي عمودي على الأرضية فهو عمودي على $[AC]$ : المثلثان $ABC$ و $ACD$ قائمان في $B$ وفي $C$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['fithaghuris-fada'],
            prompt: 'قطر الأرضية $AC$ (بالمتر):', expected: 5,
            explain: '$AC^2 = AB^2 + BC^2 = 4^2 + 3^2 = 16 + 9 = 25$ ، إذن $AC = 5\\,\\mathrm{m}$ .' },
          { kind: 'numeric', role: 'compute', requires: ['fithaghuris-fada'],
            prompt: 'المربع $AD^2$ :', expected: 30.76, display: '30,76',
            explain: 'المثلث $ACD$ قائم في $C$ : $AD^2 = AC^2 + CD^2 = 5^2 + 2{,}4^2 = 25 + 5{,}76 = 30{,}76$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['fithaghuris-fada', 'tadwir'],
            prompt: 'الطول $AD$ مدوّرًا إلى 0,01 (بالمتر):', expected: 5.55, display: '5,55',
            explain: '$AD = \\sqrt{30{,}76} \\approx 5{,}55\\,\\mathrm{m}$ (الشاشة 5,546...: نقرّب إلى 5,55 ).' },
          { kind: 'solution', ask: 0, lines: [
            '$ABC$ قائم في $B$ : $AC^2 = 4^2 + 3^2 = 25$ ومنه $AC = 5\\,\\mathrm{m}$ .',
            '$ACD$ قائم في $C$ : $AD^2 = 5^2 + 2{,}4^2 = 25 + 5{,}76 = 30{,}76$ ومنه $AD \\approx 5{,}55\\,\\mathrm{m}$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'اختيار الكابل',
        question: 'يباع الكابل بقطع طولها $5{,}5\\,\\mathrm{m}$ أو $6\\,\\mathrm{m}$ أو $7\\,\\mathrm{m}$ . ما هي أقصر قطعة كافية؟',
        asks: ['أقصر قطعة كافية'],
        steps: [
          { kind: 'choice', role: 'translate',
            prompt: 'لتصل القطعة من $A$ إلى $D$ يجب أن يكون طولها:',
            options: ['أكبر من $AD$ أو يساويه', 'أصغر من $AD$', 'مساويا لـ $AC$ فقط'],
            correct: 0,
            explain: 'الكابل يصل $A$ بـ $D$ في خط مستقيم، فلا يقلّ طوله عن المسافة $AD$ .' },
          { kind: 'choice', role: 'conclude', ask: 0,
            prompt: 'أقصر قطعة كافية هي:',
            options: [
              '$6\\,\\mathrm{m}$ ، لأنّ $5{,}5 < 5{,}55 \\leq 6$',
              '$5{,}5\\,\\mathrm{m}$ ، لأنها الأقرب إلى $5{,}55$',
              '$7\\,\\mathrm{m}$ ، لأنها الأطول',
            ],
            correct: 0,
            explain: 'القطعة $5{,}5\\,\\mathrm{m}$ أقصر من $AD \\approx 5{,}55\\,\\mathrm{m}$ فلا تكفي؛ و $6\\,\\mathrm{m}$ تكفي وهي أقصر ما يكفي.' },
          { kind: 'solution', ask: 0, lines: [
            'الكابل يصل $A$ بـ $D$ في خط مستقيم، فيلزم طول لا يقلّ عن $AD \\approx 5{,}55\\,\\mathrm{m}$ .',
            'بما أنّ $5{,}5 < 5{,}55 \\leq 6$ ، فأقصر قطعة كافية طولها $6\\,\\mathrm{m}$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'ميل الكابل',
        question: 'عيّن قيس الزاوية $\\widehat{DAC}$ مدوّرًا إلى الدرجة.',
        asks: ['قيس الزاوية $\\widehat{DAC}$'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['nisab-tarif'],
            prompt: 'في المثلث $ACD$ القائم في $C$ : $\\tan\\widehat{DAC} = \\dfrac{CD}{AC} =$', expected: 0.48, display: '0,48',
            explain: 'المقابل للزاوية $\\widehat{DAC}$ هو $CD = 2{,}4$ والمجاور $AC = 5$ (القيمة المضبوطة، لا المدوّرة): $\\dfrac{2{,}4}{5} = 0{,}48$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hasiba-aks', 'tadwir'],
            prompt: 'قيس الزاوية $\\widehat{DAC}$ مدوّرًا إلى الدرجة:', expected: 26, suffix: '°',
            explain: 'باللمسة العكسية للظل: $\\widehat{DAC} \\approx 25{,}64^{\\circ}$ ، أي $26^{\\circ}$ . (بالجيب: $\\sin\\widehat{DAC} = \\dfrac{2{,}4}{\\sqrt{30{,}76}}$ يعطي النتيجة نفسها.)' },
          { kind: 'solution', ask: 0, lines: [
            '$\\tan\\widehat{DAC} = \\dfrac{CD}{AC} = \\dfrac{2{,}4}{5} = 0{,}48$ .',
            'ومنه $\\widehat{DAC} \\approx 26^{\\circ}$ : يصعد الكابل بميل نحو $26^{\\circ}$ على أرضية القاعة.',
          ] },
        ],
      },
    ],
  },

  // ═══ 5 — trois sentiers (tableau) : A 14°, B 28° (BC = 170), C 16° ; nouveau sentier à 18° sur 250 m ═══
  {
    id: 'wadiya-5',
    title: 'الوضعية التدريبية 5 — مسارات الهضبة',
    context: 'مسارات تصعد هضبة',
    emoji: '⛰️',
    source: SOURCE,
    tone: 'teal',
    table: {
      head: ['المسار', 'المسافة الأفقية', 'فارق الارتفاع'],
      rows: [['A', '200', '50'], ['B', '150', '80'], ['C', '240', '70']],
      caption: 'القيم بالمتر (m)',
    },
    statement: 'نظّمت الكشافة المدرسية خرجة لتنظيف غابة بجوار الهضبة وجمع النفايات من مساراتها. تمرّ على الهضبة ثلاثة مسارات مستقيمة A و B و C ، يلخّص الجدول التالي بُعد كل مسار الأفقي وفارق الارتفاع الذي يقطعه. يُعتبر المسار مناسبا للمبتدئين إذا صنع مع الأفق زاوية لا تتجاوز $20^{\\circ}$ .',
    parts: [
      {
        label: '1)', title: 'ميل كل مسار',
        question: 'عيّن قيس الزاوية التي يصنعها كل مسار مع الأفق، مدوّرًا إلى الدرجة.',
        asks: ['زاوية المسار A', 'زاوية المسار B', 'زاوية المسار C'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['nisab-tarif'],
            prompt: 'لمسار بعده الأفقي $a$ وفارق ارتفاعه $h$ ، الزاوية $\\theta$ التي يصنعها مع الأفق تحقّق:',
            options: ['$\\tan\\theta = \\dfrac{h}{a}$', '$\\tan\\theta = \\dfrac{a}{h}$', '$\\sin\\theta = \\dfrac{h}{a}$'],
            correct: 0, cols: 3,
            explain: 'المسار هو الوتر، وفارق الارتفاع هو المقابل للزاوية $\\theta$ والبعد الأفقي هو المجاور: المقابل والمجاور يربطهما الظل. (الجيب يحتاج إلى طول المسار نفسه.)' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hasiba-aks', 'tadwir'],
            prompt: 'زاوية المسار A ($\\tan\\theta = \\dfrac{50}{200} = 0{,}25$ ) مدوّرة إلى الدرجة:', expected: 14, suffix: '°',
            explain: 'باللمسة العكسية للظل: $\\theta_A \\approx 14{,}04^{\\circ}$ ، أي $14^{\\circ}$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hasiba-aks', 'tadwir'],
            prompt: 'زاوية المسار B ($\\tan\\theta = \\dfrac{80}{150}$ ) مدوّرة إلى الدرجة:', expected: 28, suffix: '°',
            explain: '$\\dfrac{80}{150} \\approx 0{,}5333$ ، وباللمسة العكسية للظل: $\\theta_B \\approx 28{,}07^{\\circ}$ ، أي $28^{\\circ}$ .' },
          { kind: 'numeric', role: 'answer', ask: 2, requires: ['hasiba-aks', 'tadwir'],
            prompt: 'زاوية المسار C ($\\tan\\theta = \\dfrac{70}{240}$ ) مدوّرة إلى الدرجة:', expected: 16, suffix: '°',
            explain: '$\\dfrac{70}{240} \\approx 0{,}2917$ ، وباللمسة العكسية للظل: $\\theta_C \\approx 16{,}26^{\\circ}$ ، أي $16^{\\circ}$ .' },
          { kind: 'solution', ask: 0, lines: [
            'في كل مسار نقسم فارق الارتفاع (المقابل) على البعد الأفقي (المجاور): $\\tan\\theta = \\dfrac{h}{a}$ .',
            'المسار A : $\\tan\\theta = \\dfrac{50}{200} = 0{,}25$ ومنه $\\theta \\approx 14^{\\circ}$ . المسار B : $\\tan\\theta = \\dfrac{80}{150}$ ومنه $\\theta \\approx 28^{\\circ}$ .',
            'المسار C : $\\tan\\theta = \\dfrac{70}{240}$ ومنه $\\theta \\approx 16^{\\circ}$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'المناسب للمبتدئين وطول مسار',
        question: 'ما هي المسارات المناسبة للمبتدئين؟ ثم احسب طول المسار B .',
        asks: ['المسارات المناسبة للمبتدئين', 'طول المسار $B$'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0,
            prompt: 'المسارات المناسبة للمبتدئين (زاويتها لا تتجاوز $20^{\\circ}$ ) هي:',
            options: ['A و C', 'B فقط', 'A و B و C'],
            correct: 0, cols: 3,
            explain: '$14^{\\circ}$ و $16^{\\circ}$ أصغر من $20^{\\circ}$ ، أمّا $28^{\\circ}$ فأكبر منها: المسار B أشدّ انحدارا.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['fithaghuris-fada'],
            prompt: 'طول المسار B ، وتر مثلث ضلعاه القائمان $150$ و $80$ (بالمتر):', expected: 170,
            explain: '$B^2 = 150^2 + 80^2 = 22500 + 6400 = 28900$ ، إذن الطول $170\\,\\mathrm{m}$ .' },
          { kind: 'solution', ask: 0, lines: [
            'الزوايا $14^{\\circ}$ و $28^{\\circ}$ و $16^{\\circ}$ : المسارات التي لا تتجاوز $20^{\\circ}$ هي A و C .',
            'طول المسار B : $150^2 + 80^2 = 28900$ ، إذن $170\\,\\mathrm{m}$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'مسار جديد',
        question: 'يريد الكشافة شقّ مسار جديد D يصنع مع الأفق الزاوية $18^{\\circ}$ ويمتدّ على بعد أفقي $250\\,\\mathrm{m}$ . احسب فارق ارتفاعه ثم طوله، مدوّرين إلى 0,1 .',
        asks: ['فارق ارتفاع المسار $D$', 'طول المسار $D$'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hasiba-aks', 'tadwir'],
            prompt: 'فارق ارتفاع المسار D مدوّرًا إلى 0,1 (بالمتر):', expected: 81.2, display: '81,2',
            explain: 'المقابل = المجاور × الظل: $250 \\times \\tan 18^{\\circ} \\approx 81{,}2$ (الشاشة 81,229...).' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['majhul-maqam', 'tadwir'],
            prompt: 'طول المسار D مدوّرًا إلى 0,1 (بالمتر):', expected: 262.9, display: '262,9',
            explain: '$\\cos 18^{\\circ} = \\dfrac{250}{D}$ والمجهول في المقام: $D = \\dfrac{250}{\\cos 18^{\\circ}} \\approx 262{,}9$ (الشاشة 262,865...).' },
          { kind: 'solution', ask: 0, lines: [
            '$\\tan 18^{\\circ} = \\dfrac{h}{250}$ ومنه $h = 250 \\times \\tan 18^{\\circ} \\approx 81{,}2\\,\\mathrm{m}$ .',
            '$\\cos 18^{\\circ} = \\dfrac{250}{D}$ ومنه $D = \\dfrac{250}{\\cos 18^{\\circ}} \\approx 262{,}9\\,\\mathrm{m}$ .',
          ] },
        ],
      },
    ],
  },

  // ═══ 6 — la largeur d'un oued : Thalès AB = 48 ; tan x = 0,8 → 39° ; BC ≈ 76,84 < 80 ═══
  {
    id: 'wadiya-6',
    title: 'الوضعية التدريبية 6 — عرض الوادي',
    context: 'قياس عرض وادٍ دون عبوره',
    emoji: '🌉',
    source: SOURCE,
    tone: 'indigo',
    statement: 'يريد تلاميذ قرية جبلية مساعدة سكانها على عبور الوادي بأمان، فتعاونوا على قياس عرضه $AB$ دون عبوره. غرسوا وتدا في $C$ على ضفة $A$ حيث $AC = 60\\,\\mathrm{m}$ و $(AB) \\perp (AC)$ ، ثم غرسوا وتدا ثانيا في $D$ من $[AC]$ حيث $CD = 20\\,\\mathrm{m}$ ، ووجّهوا خيطا من $D$ يوازي $(AB)$ ويلاقي $[CB]$ في $E$ ، فقاسوا $DE = 16\\,\\mathrm{m}$ (الشكل المقابل).',
    figure: FIG_WADI,
    parts: [
      {
        label: '1)', title: 'عرض الوادي',
        question: 'احسب العرض $AB$ .',
        asks: ['العرض $AB$'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['talis-nazar'],
            prompt: 'المستقيمان $(DE)$ و $(AB)$ متوازيان، و $D \\in [CA]$ و $E \\in [CB]$ . خاصية طالس تعطي:',
            options: [
              '$\\dfrac{DE}{AB} = \\dfrac{CD}{CA}$',
              '$\\dfrac{DE}{AB} = \\dfrac{CD}{DA}$',
              '$\\dfrac{DE}{AB} = \\dfrac{DA}{CA}$',
            ],
            correct: 0, cols: 3,
            explain: 'المثلثان $CDE$ و $CAB$ في وضعية طالس رأسهما $C$ : الضلع الكبير هو $CA$ (من $C$ إلى $A$) لا $DA$ . ($CA = 60$ هو الضلع الكبير، و $CD = 20$ هو الصغير.)' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['talis-nazar', 'majhul-maqam'],
            prompt: 'العرض $AB$ (بالمتر):', expected: 48,
            explain: '$\\dfrac{16}{AB} = \\dfrac{20}{60}$ ومنه $AB = \\dfrac{16 \\times 60}{20} = 48\\,\\mathrm{m}$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$(DE) \\parallel (AB)$ : المثلثان $CDE$ و $CAB$ في وضعية طالس، إذن $\\dfrac{DE}{AB} = \\dfrac{CD}{CA}$ أي $\\dfrac{16}{AB} = \\dfrac{20}{60}$ .',
            'ومنه $AB = \\dfrac{16 \\times 60}{20} = 48\\,\\mathrm{m}$ : عرض الوادي $48\\,\\mathrm{m}$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'الزاوية x',
        question: 'عيّن قيس الزاوية $x = \\widehat{ACB}$ مدوّرًا إلى الدرجة.',
        asks: ['قيس الزاوية $x$'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['nisab-tarif'],
            prompt: 'في المثلث $CAB$ القائم في $A$ : $\\tan x = \\dfrac{AB}{AC} =$', expected: 0.8, display: '0,8',
            explain: 'المقابل للزاوية $x$ هو $AB = 48$ والمجاور $AC = 60$ : $\\tan x = \\dfrac{48}{60} = 0{,}8$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hasiba-aks', 'tadwir'],
            prompt: 'قيس الزاوية $x$ مدوّرًا إلى الدرجة:', expected: 39, suffix: '°',
            explain: 'باللمسة العكسية للظل: $x \\approx 38{,}66^{\\circ}$ ، أي $39^{\\circ}$ بالتدوير إلى الدرجة. (تحقّق في المثلث الصغير: $\\tan x = \\dfrac{DE}{CD} = \\dfrac{16}{20} = 0{,}8$ .)' },
          { kind: 'solution', ask: 0, lines: [
            'المثلث $CAB$ قائم في $A$ : $\\tan x = \\dfrac{AB}{AC} = \\dfrac{48}{60} = 0{,}8$ .',
            'ومنه $x \\approx 39^{\\circ}$ (باللمسة العكسية للظل).',
          ] },
        ],
      },
      {
        label: '3)', title: 'طول الحبل',
        question: 'احسب الطول $BC$ مدوّرًا إلى 0,01 . هل يكفي حبل طوله $80\\,\\mathrm{m}$ لتمديده من $C$ إلى $B$ ؟',
        asks: ['الطول $BC$', 'هل يكفي الحبل'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['fithaghuris-fada', 'tadwir'],
            prompt: 'الطول $BC$ مدوّرًا إلى 0,01 (بالمتر):', expected: 76.84, display: '76,84',
            explain: 'المثلث $CAB$ قائم في $A$ : $BC^2 = AC^2 + AB^2 = 60^2 + 48^2 = 3600 + 2304 = 5904$ ، و $BC = \\sqrt{5904} \\approx 76{,}84\\,\\mathrm{m}$ .' },
          { kind: 'choice', role: 'conclude', ask: 1,
            prompt: 'هل يكفي حبل طوله $80\\,\\mathrm{m}$ ؟',
            options: ['نعم، لأنّ $76{,}84 < 80$', 'لا، لأنّ $76{,}84 > 80$', 'لا يمكن الجزم دون قياس $BC$ مباشرة'],
            correct: 0,
            explain: 'الحبل يصل $C$ بـ $B$ في خط مستقيم، وطوله $80$ أكبر من $BC \\approx 76{,}84$ ، فيكفي.' },
          { kind: 'solution', ask: 0, lines: [
            '$BC^2 = AC^2 + AB^2 = 60^2 + 48^2 = 5904$ ومنه $BC \\approx 76{,}84\\,\\mathrm{m}$ .',
            'بما أنّ $76{,}84 < 80$ ، فحبل طوله $80\\,\\mathrm{m}$ يكفي لتمديده من $C$ إلى $B$ .',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
