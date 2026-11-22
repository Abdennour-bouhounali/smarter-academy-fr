/**
 * Les FIGURES du درس « قراءة مركبتي شعاع وتمثيلهما في معلم », en données GeoFigure (common/components/geoFigure.js :
 * points, segments, `vectors` (flèches), `grid` (la ورقة مرصوفة) et `axes` (les deux axes du معلم, graduations
 * entières) — d'après les figures du manuel (pp. 139–148, docs/sources/4am/unit12/extraction.json › figure, et le scan
 * rendu page à page). Aucune image. Chaque point est sur un nœud (ou un demi-nœud quand le texte l'impose), et chaque
 * composante que la leçon affirme est RECALCULÉE avec vectors.js dans content/figures.test.js.
 *
 * Analyse (règle du propriétaire, 2026-10-04) : les figures du manuel de ces pages sont lisibles mais petites, et deux
 * sont mal servies par le scan — ex-2 (presque effacée, D AU-DELÀ de la dernière graduation) et ex-5 (page inclinée) :
 * elles sont REDESSINÉES avec les mêmes points et des axes assez longs ; la figure de la طريقة (une bande haute,
 * E(1 ; 8)) est redessinée avec un autre E (le texte dit « نختار النقطة E ») ; les quatre معالم de معارف 2 sont
 * redessinés côte à côte, un par vignette. Les autres sont reproduites, en grand.
 */
export const REDRAWN = 'أعادت المنصّة رسم شكل الكتاب بوضوح أكبر، بنفس المعطيات';

/* ── أستعدّ 1 (p. 139) : le معلم et A, B, C, D ── */
export const FIG_PREP1 = {
  points: { O: [0, 0], A: [2, 3], B: [-3, 3], C: [3, 0], D: [-3, 0], H: [2, 0] },
  hidden: ['H'],
  grid: true,
  axes: true,
  segments: [{ from: 'B', to: 'A', dashed: true }, { from: 'B', to: 'D', dashed: true }, { from: 'A', to: 'H', dashed: true }],
  labels: { C: 's', D: 'sw', O: 'sw' },
  ariaLabel: 'معلم متعامد ومتجانس على المرصوفة: A و B على نفس الارتفاع فوق محور الفواصل، و C و D على محور الفواصل',
  maxWidth: 480,
};

/* ── نشاط 1 (p. 140) : A, C, B, les flèches « 8 » et « −2 » et AB ── */
const ACT1_POINTS = { O: [0, 0], I: [1, 0], J: [0, 1], A: [-2, 4], C: [6, 4], B: [6, 2] };
export const FIG_ACT1 = {
  points: ACT1_POINTS,
  grid: true,
  axes: true,
  segments: [{ from: 'A', to: 'C', label: '8', tone: 'rose' }, { from: 'C', to: 'B', label: '−2', tone: 'rose' }],
  vectors: [{ from: 'A', to: 'C', tone: 'rose' }, { from: 'C', to: 'B', tone: 'rose' }, { from: 'A', to: 'B', tone: 'indigo' }],
  labels: { I: 's', J: 'w', O: 'sw' },
  ariaLabel: 'معلم (O ; I , J) على المرصوفة: سهم أفقي من A إلى C مكتوب عليه 8، سهم شاقولي من C إلى B مكتوب عليه −2، وسهم من A إلى B',
  maxWidth: 560,
};
/* ── نشاط 1 (4) : D(3 ; −2), hors de la figure du manuel, et le trajet de B vers D ── */
export const FIG_ACT1_D = {
  points: { ...ACT1_POINTS, D: [3, -2], K: [3, 2] },
  hidden: ['K'],
  grid: true,
  axes: true,
  segments: [{ from: 'B', to: 'K', label: '−3', tone: 'emerald', dashed: true }, { from: 'K', to: 'D', label: '−4', tone: 'emerald', dashed: true }],
  vectors: [{ from: 'A', to: 'B', tone: 'indigo' }, { from: 'B', to: 'D', tone: 'emerald' }],
  labels: { I: 's', J: 'w', O: 'sw' },
  ariaLabel: 'المعلم نفسه مع النقطة D: من B نسير 3 وحدات نحو اليسار ثم 4 وحدات نحو الأسفل للوصول إلى D',
  caption: 'D لا تظهر في شكل الكتاب: أضافتها المنصّة من إحداثيتيها.',
  maxWidth: 560,
};

/* ── معارف 1 (p. 142) : OB et OM, leurs projections ── */
export const FIG_KNOW1 = {
  points: { O: [0, 0], B: [-3, 4], M: [4, 3], B1: [-3, 0], B2: [0, 4], M1: [4, 0], M2: [0, 3] },
  hidden: ['B1', 'B2', 'M1', 'M2'],
  grid: true,
  axes: true,
  segments: [['B', 'B1'], ['B', 'B2'], ['M', 'M1'], ['M', 'M2']].map(([f, t]) => ({ from: f, to: t, dashed: true })),
  vectors: [{ from: 'O', to: 'B', tone: 'rose' }, { from: 'O', to: 'M', tone: 'indigo' }],
  labels: { O: 'sw' },
  ariaLabel: 'معلم على المرصوفة: سهم من O إلى B فوق اليسار وسهم من O إلى M فوق اليمين، مع إسقاطيهما المتقطعين على المحورين',
  maxWidth: 480,
};

/* ── معارف 2 (p. 142) : les quatre معالم, A(3 ; 2) dans chacun (une vignette chacun) ── */
const frame = (J, name) => {
  const A = [3 + 2 * J[0], 2 * J[1]];
  return {
    points: { O: [0, 0], I: [1, 0], J, A, A1: [3, 0], A2: [2 * J[0], 2 * J[1]] },
    hidden: ['A1', 'A2'],
    // l'axe (OJ) est tracé sur ≈ 2,6 unités quelle que soit la longueur OJ (la vignette reste un bloc, jamais une bande)
    rays: [{ from: 'O', through: 'I', extend: 3.6 }, { from: 'O', through: 'J', extend: 2.6 / Math.hypot(J[0], J[1]) - 1 }],
    segments: [{ from: 'A', to: 'A1', dashed: true }, { from: 'A', to: 'A2', dashed: true }],
    vectors: [{ from: 'O', to: 'A', tone: 'rose' }],
    labels: { O: 'sw', I: 's', J: 'w' },
    ariaLabel: `${name}: المحوران (OI) و (OJ)، والنقطة A التي إحداثياها 3 و 2، والسهم من O إلى A`,
    maxWidth: 360,
  };
};
export const FIG_KNOW2 = {
  'mutaamid-mutajanis': frame([0, 1], 'معلم متعامد ومتجانس'),
  mutaamid: frame([0, 0.6], 'معلم متعامد'),
  mutajanis: frame([0.5, 0.87], 'معلم متجانس'),
  kayfi: frame([0.3, 0.52], 'معلم كيفي'),
};

/* ── معارف 3 أ (p. 142) : AB « +7 puis +3 », CD « −5 puis +1 » ── */
export const FIG_KNOW3 = {
  points: { O: [0, 0], A: [-4, 2], B: [3, 5], C: [2, -3], D: [-3, -2], K: [3, 2], L: [-3, -3] },
  hidden: ['K', 'L'],
  grid: true,
  axes: true,
  segments: [
    { from: 'A', to: 'K', label: '+7', tone: 'indigo', dashed: true }, { from: 'K', to: 'B', label: '+3', tone: 'indigo', dashed: true },
    { from: 'C', to: 'L', label: '−5', tone: 'rose', dashed: true }, { from: 'L', to: 'D', label: '+1', tone: 'rose', dashed: true, labelSide: 1 },
  ],
  vectors: [{ from: 'A', to: 'B', tone: 'indigo' }, { from: 'C', to: 'D', tone: 'rose' }],
  labels: { O: 'sw' },
  ariaLabel: 'معلم على المرصوفة: من A ننتقل 7 وحدات نحو اليمين ثم 3 نحو الأعلى للوصول إلى B، ومن C ننتقل 5 وحدات نحو اليسار ثم وحدة نحو الأعلى للوصول إلى D',
  maxWidth: 520,
};

/* ── معارف (plateforme, module 2) : deux flèches à lire ── */
export const FIG_READ = {
  points: { O: [0, 0], E: [-4, -2], F: [0, 1], G: [4, 3], H: [2, -1] },
  grid: true,
  axes: true,
  vectors: [{ from: 'E', to: 'F', tone: 'indigo' }, { from: 'G', to: 'H', tone: 'rose' }],
  labels: { O: 'sw', F: 'nw' },
  ariaLabel: 'معلم على المرصوفة: سهم من E إلى F صاعد نحو اليمين، وسهم من G إلى H نازل نحو اليسار',
  maxWidth: 480,
};

/* ── طرائق (p. 143) : u(3 ; −4) depuis A(−2 ; 1) par A₁, puis EF ── */
export const FIG_METHOD = {
  points: { O: [0, 0], A: [-2, 1], 'A₁': [1, 1], B: [1, -3], E: [3, 3], K: [6, 3], F: [6, -1] },
  hidden: ['K'],
  grid: true,
  axes: true,
  segments: [
    { from: 'A', to: 'A₁', label: '+3', tone: 'sky', dashed: true }, { from: 'A₁', to: 'B', label: '−4', tone: 'sky', dashed: true },
    { from: 'E', to: 'K', tone: 'sky', dashed: true }, { from: 'K', to: 'F', tone: 'sky', dashed: true },
    { from: 'A', to: 'E', tone: 'slate', dashed: true }, { from: 'B', to: 'F', tone: 'slate', dashed: true },
  ],
  vectors: [{ from: 'A', to: 'B', tone: 'amber' }, { from: 'E', to: 'F', tone: 'amber' }],
  labels: { O: 'sw', 'A₁': 'ne', E: 'n', F: 's' },
  ariaLabel: 'معلم على المرصوفة: من A نسير 3 وحدات نحو اليمين إلى A₁ ثم 4 نحو الأسفل إلى B؛ والسهم من E إلى F يوازيه وله نفس الطول ونفس الاتجاه (EABF متوازي أضلاع)',
  caption: REDRAWN,
  maxWidth: 520,
};

/* ── أوظّف (p. 146) ── */
export const FIG_EX1 = {
  points: { O: [0, 0], A: [-1, 2], B: [3, -3], C: [0.5, 1], D: [-2.5, 0] },
  grid: { step: 0.5 },
  axes: true,
  polygons: [{ points: ['A', 'B', 'C', 'D'], tone: 'indigo' }],
  segments: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A']],
  labels: { O: 'sw', D: 'w', C: 'ne' },
  ariaLabel: 'الرباعي ABCD في معلم: A فوق اليسار، B تحت اليمين، C قرب محور التراتيب، و D على محور الفواصل',
  maxWidth: 480,
};
export const FIG_EX2 = {
  points: { O: [0, 0], A: [3, 3], B: [-3, 3], C: [0, 2], D: [7, -2], E: [-2, -2], F: [0, -2] },
  grid: true,
  axes: true,
  labels: { O: 'sw', C: 'e', F: 'e' },
  ariaLabel: 'معلم على المرصوفة والنقط A و B و C و D و E و F: C و F على محور التراتيب، و D بعيدة تحت اليمين',
  caption: `${REDRAWN}، ومدّت محور الفواصل حتى تظهر D.`,
  maxWidth: 520,
};
export const FIG_EX4 = {
  points: { O: [0, 0], U: [-2, 3], E: [3, -1], F: [1, 2] },
  grid: true,
  axes: true,
  vectors: [{ from: 'O', to: 'U', tone: 'indigo', label: 'u' }, { from: 'E', to: 'F', tone: 'indigo', label: 'u' }],
  labels: { O: 'sw' },
  ariaLabel: 'معلم على المرصوفة: ممثّلان للشعاع u، من O إلى U ومن E إلى F، متوازيان ولهما نفس الاتجاه ونفس الطول',
  maxWidth: 420,
};
export const FIG_EX5 = {
  points: { O: [0, 0], A: [-2, 4], B: [-1, -2], C: [6, -2] },
  grid: true,
  axes: true,
  vectors: [{ from: 'A', to: 'B', tone: 'indigo' }],
  labels: { O: 'sw', C: 'se', B: 'sw' },
  ariaLabel: 'معلم على المرصوفة: السهم من A إلى B نازل بشدّة، و C تحت اليمين',
  caption: REDRAWN,
  maxWidth: 480,
};
export const FIG_EX5_SOL = {
  points: { O: [0, 0], A: [-2, 4], B: [-1, -2], C: [6, -2], I: [5, 4] },
  grid: true,
  axes: true,
  polygons: [{ points: ['A', 'I', 'C', 'B'], tone: 'emerald' }],
  vectors: [{ from: 'A', to: 'B', tone: 'indigo' }, { from: 'A', to: 'I', tone: 'emerald' }, { from: 'B', to: 'C', tone: 'emerald' }],
  segments: [['I', 'C']],
  labels: { O: 'sw', C: 'se', B: 'sw' },
  ariaLabel: 'المعلم نفسه مع النقطة I: السهم من A إلى I يساوي السهم من B إلى C، والرباعي AICB متوازي أضلاع',
  maxWidth: 480,
};

/* ── أؤكّد تعلّماتي 1 (p. 148) ── */
export const FIG_QCM1 = {
  points: { O: [0, 0], A: [3, 2], B: [-2, -2], A1: [3, 0], A2: [0, 2], B1: [-2, 0], B2: [0, -2] },
  hidden: ['A1', 'A2', 'B1', 'B2'],
  grid: true,
  axes: true,
  segments: [['A', 'A1'], ['A', 'A2'], ['B', 'B1'], ['B', 'B2']].map(([f, t]) => ({ from: f, to: t, dashed: true })),
  vectors: [{ from: 'A', to: 'B', tone: 'rose' }],
  labels: { O: 'nw' },
  ariaLabel: 'معلم على المرصوفة: سهم من A فوق اليمين إلى B تحت اليسار، مع إسقاطاتهما المتقطعة على المحورين',
  maxWidth: 420,
};
/* ── إختبار (plateforme) : KL vers la gauche et le bas ── */
export const FIG_TEST_KL = {
  points: { O: [0, 0], K: [2, 3], L: [-3, 1] },
  grid: true,
  axes: true,
  vectors: [{ from: 'K', to: 'L', tone: 'indigo' }],
  labels: { O: 'sw' },
  ariaLabel: 'معلم على المرصوفة: سهم من K فوق اليمين إلى L على اليسار وأخفض قليلا',
  maxWidth: 420,
};
