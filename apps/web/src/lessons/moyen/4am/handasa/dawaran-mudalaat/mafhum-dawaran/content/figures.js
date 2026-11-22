/**
 * Les FIGURES du درس « مفهوم الدوران وإنشاء صور أشكال هندسية بدوران », en données GeoFigure (common/components/geoFigure.js)
 * d'après les figures du manuel (pp. 151–160, docs/sources/4am/unit13/extraction.json › figure, et le scan rendu page à page).
 * Aucune image. Les coordonnées des images sont CALCULÉES ici (rot, arrondi à 4 décimales, pour dessiner) et chaque
 * réponse que la leçon affirme est RE-vérifiée par content/figures.test.js avec packages/core (rotation.imageCheck).
 *
 * Analyse (guide §5 « Textbook figures ») :
 *   • نشاط 1 : les trois « cornets » sur quadrillage sont lisibles — reproduits aux nœuds de l'extraction ;
 *   • نشاط 2 : le شريط de quatre vignettes — reproduit en quatre petites figures (le compas et la منقلة deviennent
 *     le cercle et la demi-droite qu'ils tracent) ;
 *   • نشاط 3 : la قطعة et la demi-droite du manuel étaient de minces bandes (O presque sur la droite) — REDESSINÉES
 *     (même concept, O plus loin, réponses recalculées) ; les figures de la droite sont RATTACHÉES à leur cas (écart
 *     « reading » de l'extraction) ;
 *   • التمرين 5 : aucune mesure imprimée ; la figure est redessinée EXACTE avec les angles lus sur le scan (120°, 150°,
 *     90°, 60° — extraction › discrepancies) et la leçon donne les écarts entre les branches comme données.
 */
export const REDRAWN = 'أعادت المنصّة رسم شكل الكتاب بوضوح أكبر، بنفس المعطيات';

const R4 = (v) => Math.round(v * 1e4) / 1e4;
/** L'image de p par le دوران de centre c, d'angle deg (sens direct si deg > 0) — pour DESSINER seulement. */
export const rot = (p, deg, c = [0, 0]) => {
  const a = (deg * Math.PI) / 180;
  const x = p[0] - c[0]; const y = p[1] - c[1];
  return [R4(c[0] + x * Math.cos(a) - y * Math.sin(a)), R4(c[1] + x * Math.sin(a) + y * Math.cos(a))];
};
export const polar = (r, deg) => rot([r, 0], deg);

/* ── أستعدّ 3 (p. 151) : x، O، z alignés, 145° entre [Oy) et [Ox) ── */
export const FIG_PREP3 = {
  points: { O: [0, 0], x: [-2.2, 0], z: [2.2, 0], y: polar(3.6, 35) },
  segments: [['x', 'z']],
  rays: [{ from: 'O', through: 'y' }],
  angles: [{ at: 'O', from: 'y', to: 'x', label: '145°', radius: 26 }],
  labels: { x: 's', z: 's', O: 's' },
  ariaLabel: 'مستقيم أفقي يمر بالنقط x و O و z، ونصف مستقيم من O نحو y إلى أعلى اليمين، والزاوية بين نصف المستقيم ونحو x قيسها 145 درجة',
  maxWidth: 340,
};

/* ── نشاط 1 (p. 152) : (F), (F₁), (F′) sur quadrillage, O en bas ── */
const F = { A: [-1, 3], B: [-1, 6], C: [-4, 6] };
export const FIG_ACT1 = {
  points: {
    O: [0, 0], A: F.A, B: F.B, C: F.C, 'A₁': [1, 3], 'B₁': [1, 6], 'C₁': [4, 6], "A'": [3, 1], "B'": [6, 1], "C'": [6, 4],
  },
  grid: true,
  polygons: [{ points: ['A', 'B', 'C'], tone: 'indigo' }, { points: ['A₁', 'B₁', 'C₁'], tone: 'amber' }, { points: ["A'", "B'", "C'"], tone: 'emerald' }],
  segments: [
    { from: 'A', to: 'B', tone: 'indigo', bold: true }, { from: 'A', to: 'C', tone: 'indigo', bold: true },
    { from: 'A₁', to: 'B₁', tone: 'amber', bold: true }, { from: 'A₁', to: 'C₁', tone: 'amber', bold: true },
    { from: "A'", to: "B'", tone: 'emerald', bold: true }, { from: "A'", to: "C'", tone: 'emerald', bold: true },
  ],
  arcs: [{ from: 'C', to: 'B', sweep: 'cw', tone: 'indigo' }, { from: 'B₁', to: 'C₁', sweep: 'cw', tone: 'amber' }, { from: "C'", to: "B'", sweep: 'cw', tone: 'emerald' }],
  labels: { O: 's', A: 'w', 'A₁': 'e', B: 'n', 'B₁': 'n', C: 'w', 'C₁': 'e', "A'": 'w', "B'": 's', "C'": 'n' },
  ariaLabel: 'ورقة مرصوفة: ثلاثة أشكال متقايسة على هيئة مخروط مثلّج — (F) رأسه A في أعلى اليسار، (F₁) نظيره على اليمين، و (F′) مستلقٍ في أسفل اليمين — والنقطة O في الأسفل',
  maxWidth: 540,
};

/* ── نشاط 2 (p. 152) : le شريط, quatre vignettes (70° dans le sens de la flèche = direct) ── */
const A2 = polar(2, 25); const A2p = polar(2, 95);
const SENSE = (deg) => polar(2.6, deg);
export const FIG_ACT2_STEPS = [1, 2, 3, 4].map((n) => ({
  points: { O: [0, 0], A: A2, ...(n === 4 ? { "A'": A2p } : {}), s0: SENSE(-5), s1: SENSE(40), t: polar(2.7, 95), u: polar(2.6, 180), w: polar(2.6, 270) },
  hidden: ['s0', 's1', 't', 'u', 'w'],
  arcs: [{ center: 'O', from: 's0', to: 's1', sweep: 'ccw', arrow: true, tone: 'rose' }],
  ...(n >= 2 ? { circles: [{ center: 'O', through: 'A', tone: 'slate' }] } : {}),
  ...(n >= 3 ? { rays: [{ from: 'O', through: 't', tone: 'amber' }] } : {}),
  ...(n >= 3 ? { angles: [{ at: 'O', from: 'A', to: n === 4 ? "A'" : 't', label: '70°', arrow: true, tone: 'amber', radius: 34 }] } : {}),
  ariaLabel: [
    'المرحلة 1: النقطتان O و A، وسهم دائري يبيّن الاتجاه المباشر',
    'المرحلة 2: الدائرة التي مركزها O وتشمل A مرسومة بالمدور',
    'المرحلة 3: المنقلة على O وصفرها على [OA)، ونصف مستقيم بزاوية 70 درجة في اتجاه السهم',
    'المرحلة 4: نصف المستقيم يقطع الدائرة في A′، والزاوية AOA′ قيسها 70 درجة',
  ][n - 1],
  maxWidth: 300,
}));

/* ── نشاط 3 (pp. 152–153) : 72° dans le sens direct ── */
const SEG = { A: [-3, 2], B: [1, 2] };
export const FIG_ACT3_SEG = {
  points: { O: [0, 0], ...SEG, s0: polar(2.2, 300), s1: polar(2.2, 345) },
  hidden: ['s0', 's1'],
  segments: [['A', 'B']],
  arcs: [{ center: 'O', from: 's0', to: 's1', sweep: 'ccw', arrow: true, tone: 'rose' }],
  ariaLabel: 'قطعة أفقية [AB] فوق النقطة O، وسهم دائري يبيّن الاتجاه المباشر',
  caption: REDRAWN,
  maxWidth: 360,
};
export const FIG_ACT3_SEG_SOL = {
  points: { O: [0, 0], ...SEG, "A'": rot(SEG.A, 72), "B'": rot(SEG.B, 72) },
  segments: [['A', 'B'], { from: "A'", to: "B'", tone: 'emerald', bold: true },
    { from: 'O', to: 'A', dashed: true }, { from: 'O', to: "A'", dashed: true }, { from: 'O', to: 'B', dashed: true }, { from: 'O', to: "B'", dashed: true }],
  arcs: [{ center: 'O', from: 'A', to: "A'", sweep: 'ccw', arrow: true, tone: 'rose', dashed: true }, { center: 'O', from: 'B', to: "B'", sweep: 'ccw', arrow: true, tone: 'rose', dashed: true }],
  ariaLabel: 'القطعة [AB] وصورتها [A′B′] بالدوران الذي مركزه O وزاويته 72 درجة في الاتجاه المباشر، مع قوسين متقطعين من A إلى A′ ومن B إلى B′',
  caption: REDRAWN,
  maxWidth: 400,
};
/* الحالة الأولى : O ∈ (d) — deux points alignés par définition (la droite est le sujet) */
const D1 = { A: polar(1.6, 198) };
export const FIG_ACT3_LINE1 = {
  points: { O: [0, 0], A: D1.A },
  lines: [{ through: ['A', 'O'], name: '(d)', extend: [0.8, 1.8] }],
  ariaLabel: 'مستقيم (d) يمر بالنقطة A ثم بالنقطة O',
  maxWidth: 320,
};
export const FIG_ACT3_LINE1_SOL = {
  points: { O: [0, 0], A: D1.A, "A'": rot(D1.A, 72) },
  lines: [{ through: ['A', 'O'], name: '(d)', extend: [0.6, 1.2] }, { through: ["A'", 'O'], name: "(d')", tone: 'emerald', extend: [0.6, 1.2] }],
  arcs: [{ center: 'O', from: 'A', to: "A'", sweep: 'ccw', arrow: true, tone: 'rose', label: '72°' }],
  ariaLabel: 'المستقيم (d) المار بـ O وصورته المستقيم (OA′) الذي يصنع معه زاوية 72 درجة',
  maxWidth: 340,
};
/* الحالة الثانية : O ∉ (d) — la figure que le manuel plaçait en face de « الحالة الأولى » */
const D2 = { A: [-2, 1], B: [0, 1.5] };
export const FIG_ACT3_LINE2 = {
  points: { O: [0, 0], ...D2 },
  lines: [{ through: ['A', 'B'], name: '(d)', extend: [0.4, 0.6] }],
  labels: { O: 's' },
  ariaLabel: 'مستقيم (d) مائل تمر به النقطتان A و B، والنقطة O تحته',
  maxWidth: 320,
};
export const FIG_ACT3_LINE2_SOL = {
  points: { O: [0, 0], ...D2, "A'": rot(D2.A, 72), "B'": rot(D2.B, 72) },
  lines: [{ through: ['A', 'B'], name: '(d)', extend: [0.3, 0.5] }, { through: ["A'", "B'"], name: "(A'B')", tone: 'emerald', extend: [0.4, 0.6] }],
  segments: [{ from: 'O', to: 'A', dashed: true }, { from: 'O', to: "A'", dashed: true }, { from: 'O', to: 'B', dashed: true }, { from: 'O', to: "B'", dashed: true }],
  ariaLabel: 'المستقيم (d) وصورته المستقيم (A′B′) بالدوران الذي مركزه O وزاويته 72 درجة',
  maxWidth: 360,
};
/* جـ) نصف المستقيم [Ax) */
const HR = { A: [-3, 0], B: [-1.5, 1.5] };
export const FIG_ACT3_RAY = {
  points: { O: [0, 0], ...HR },
  rays: [{ from: 'A', through: 'B', name: 'x', extend: 0.5 }],
  labels: { O: 's', A: 's' },
  ariaLabel: 'نصف مستقيم [Ax) يبدأ من A ويمر بالنقطة B، والنقطة O على يمينه',
  caption: REDRAWN,
  maxWidth: 320,
};
export const FIG_ACT3_RAY_SOL = {
  points: { O: [0, 0], ...HR, "A'": rot(HR.A, 72), "B'": rot(HR.B, 72) },
  rays: [{ from: 'A', through: 'B', name: 'x', extend: 0.4 }, { from: "A'", through: "B'", tone: 'emerald', extend: 0.6 }],
  segments: [{ from: 'O', to: 'A', dashed: true }, { from: 'O', to: "A'", dashed: true }],
  ariaLabel: 'نصف المستقيم [Ax) وصورته نصف المستقيم [A′B′) الذي يبدأ من A′ صورة A',
  caption: REDRAWN,
  maxWidth: 360,
};
/* د) la دائرة (W, WA) */
const CI = { W: [-4.5, 3], A: [-4.5, 5] };
export const FIG_ACT3_CIRCLE = {
  points: { O: [0, 0], ...CI, s0: polar(1.5, 300), s1: polar(1.5, 350) },
  hidden: ['s0', 's1'],
  circles: [{ center: 'W', through: 'A' }],
  arcs: [{ center: 'O', from: 's0', to: 's1', sweep: 'ccw', arrow: true, tone: 'rose' }],
  ariaLabel: 'دائرة مركزها W والنقطة A في أعلاها، والنقطة O خارجها في أسفل اليمين، وسهم الاتجاه المباشر',
  maxWidth: 360,
};
export const FIG_ACT3_CIRCLE_SOL = {
  points: { O: [0, 0], ...CI, "W'": rot(CI.W, 72), "A'": rot(CI.A, 72) },
  circles: [{ center: 'W', through: 'A' }, { center: "W'", through: "A'", tone: 'emerald' }],
  segments: [{ from: 'W', to: 'A' }, { from: "W'", to: "A'", tone: 'emerald' }, { from: 'O', to: 'W', dashed: true }, { from: 'O', to: "W'", dashed: true }],
  arcs: [{ center: 'O', from: 'W', to: "W'", sweep: 'ccw', arrow: true, tone: 'rose', dashed: true }],
  ariaLabel: 'الدائرة التي مركزها W وصورتها الدائرة التي مركزها W′ صورة W ولها نفس نصف القطر',
  maxWidth: 400,
};

/* ── معارف 1 (p. 154) : (F) → (F′) par 90° dans le sens des aiguilles (M ↦ M′) ── */
const FK = { M: [-2, 3], N: [-1, 5], P: [-3.5, 4.5] };
export const FIG_KNOW1 = {
  points: { O: [0, 0], ...FK, "M'": rot(FK.M, -90), "N'": rot(FK.N, -90), "P'": rot(FK.P, -90) },
  hidden: ['N', 'P', "N'", "P'"],
  polygons: [{ points: ['M', 'N', 'P'], tone: 'indigo' }, { points: ["M'", "N'", "P'"], tone: 'emerald' }],
  segments: [{ from: 'M', to: 'N', tone: 'indigo' }, { from: 'N', to: 'P', tone: 'indigo' }, { from: 'P', to: 'M', tone: 'indigo' },
    { from: "M'", to: "N'", tone: 'emerald' }, { from: "N'", to: "P'", tone: 'emerald' }, { from: "P'", to: "M'", tone: 'emerald' },
    { from: 'O', to: 'M', dashed: true }, { from: 'O', to: "M'", dashed: true }],
  rightAngles: [['M', 'O', "M'"]],
  arcs: [{ center: 'O', from: 'M', to: "M'", sweep: 'cw', arrow: true, tone: 'rose' }],
  ariaLabel: 'الشكل (F) وفيه M، وصورته (F′) وفيها M′ بالدوران الذي مركزه O وزاويته 90 درجة في اتجاه حركة عقارب الساعة، وسهم دائري في هذا الاتجاه',
  maxWidth: 380,
};

/* ── معارف 2 (p. 154) : l'exemple 35° (A, A′ ; M, M′) puis 180° ── */
export const FIG_KNOW2 = {
  points: { O: [0, 0], A: [4, 0], "A'": polar(4, 35), M: polar(3, 55), "M'": [0, 3] },
  segments: [{ from: 'O', to: 'A', ticks: 2 }, { from: 'O', to: "A'", ticks: 2 }, { from: 'O', to: 'M', dashed: true }, { from: 'O', to: "M'", dashed: true }],
  arcs: [{ center: 'O', from: 'A', to: "A'", sweep: 'ccw', arrow: true, tone: 'rose', dashed: true }, { center: 'O', from: 'M', to: "M'", sweep: 'ccw', arrow: true, tone: 'rose', dashed: true }],
  angles: [{ at: 'O', from: 'A', to: "A'", label: '35°', radius: 30 }, { at: 'O', from: 'M', to: "M'", label: '35°', radius: 30 }],
  ariaLabel: 'A′ صورة A و M′ صورة M بالدوران الذي مركزه O وزاويته 35 درجة في الاتجاه المباشر: OA′ = OA و OM′ = OM',
  maxWidth: 380,
};
export const FIG_KNOW2_180 = {
  points: { "M'": [-5, 0], O: [0, 0], M: [5, 0] },
  segments: [{ from: "M'", to: 'O', ticks: 2 }, { from: 'O', to: 'M', ticks: 2 }],
  arcs: [{ center: 'O', from: 'M', to: "M'", sweep: 'ccw', arrow: true, tone: 'rose', dashed: true, label: '180°' }],
  labels: { "M'": 's', O: 's', M: 's' },
  ariaLabel: 'M و O و M′ على استقامية، و O منتصف [MM′]، ونصف دائرة متقطع من M إلى M′ مكتوب عليه 180 درجة',
  maxWidth: 360,
};

/* ── طرائق (p. 155) : تمرين 1 (50° direct) et تمرين 2 (40° indirect) ── */
export const FIG_METHOD_POINT = {
  points: { O: [0, 0], A: [3, 0], "A'": polar(3, 50), x: polar(4.4, 50) },
  segments: [['O', 'A']],
  rays: [{ from: 'O', through: 'x', tone: 'amber', extend: 0.1 }],
  arcs: [{ center: 'O', from: 'A', to: "A'", sweep: 'ccw', arrow: true, tone: 'rose', dashed: true }],
  angles: [{ at: 'O', from: 'A', to: 'x', label: '50°', arrow: true, tone: 'amber', radius: 30 }],
  labels: { x: 'n' },
  ariaLabel: '[OA] أفقي ونصف المستقيم [Ox) بزاوية 50 درجة في الاتجاه المباشر، و A′ عليه حيث OA′ = OA',
  maxWidth: 340,
};
const MS = { A: [3, 3], B: [7, 3] }; // redessinée : O plus bas (la bande du manuel), AB = 4 horizontal gardé
export const FIG_METHOD_SEG = {
  points: { O: [0, 0], ...MS },
  segments: [['A', 'B']],
  labels: { O: 's' },
  ariaLabel: 'القطعة [AB] أفقية والنقطة O تحتها على اليسار',
  caption: REDRAWN,
  maxWidth: 340,
};
export const FIG_METHOD_SEG_SOL = {
  points: { O: [0, 0], ...MS, "A'": rot(MS.A, -40), "B'": rot(MS.B, -40) },
  segments: [['A', 'B'], { from: "A'", to: "B'", tone: 'emerald', bold: true },
    { from: 'O', to: 'A', dashed: true, ticks: 1 }, { from: 'O', to: "A'", dashed: true, ticks: 1 }, { from: 'O', to: 'B', dashed: true, ticks: 2 }, { from: 'O', to: "B'", dashed: true, ticks: 2 }],
  arcs: [{ center: 'O', from: 'A', to: "A'", sweep: 'cw', arrow: true, tone: 'rose', dashed: true }, { center: 'O', from: 'B', to: "B'", sweep: 'cw', arrow: true, tone: 'rose', dashed: true }],
  labels: { O: 'w' },
  ariaLabel: 'القطعة [AB] وصورتها [A′B′] بالدوران الذي مركزه O وزاويته 40 درجة في الاتجاه غير المباشر، مع OA = OA′ و OB = OB′',
  maxWidth: 400,
};
/* دوري الآن (p. 155) : l'angle AOB de 45° et le centre K */
export const FIG_NOW = {
  points: { O: [0, 0], A: polar(3, 45), B: [4, 0], K: [1.5, -1.2] },
  segments: [['O', 'A'], ['O', 'B']],
  angles: [{ at: 'O', from: 'B', to: 'A', label: '45°', radius: 28 }],
  labels: { K: 's', O: 'w' },
  ariaLabel: 'زاوية AOB قيسها 45 درجة، [OB] أفقي، والنقطة K تحت [OB] قرب O',
  maxWidth: 320,
};

/* ── أوظّف تعلّماتي (p. 158–159) ── */
export const FIG_EX1 = {
  points: { O: [0, 0], C: polar(3, 22), B: polar(3, 67), A: polar(3, 117), D: polar(3, 247) },
  segments: [['O', 'A'], ['O', 'B'], ['O', 'C'], ['O', 'D']],
  angles: [
    { at: 'O', from: 'B', to: 'A', label: '50°', radius: 24 }, { at: 'O', from: 'C', to: 'B', label: '45°', radius: 34 },
    { at: 'O', from: 'A', to: 'D', label: '130°', radius: 24 }, { at: 'O', from: 'D', to: 'C', label: '135°', radius: 30 },
  ],
  ariaLabel: 'أربع قطع متقايسة [OA] و [OB] و [OC] و [OD]، B و O و D على استقامية؛ الزوايا AOB = 50° و BOC = 45° و COD = 135° و AOD = 130°',
  maxWidth: 360,
};
/* التمرين 2 : quatre triangles autour de O (① à gauche, ② en haut, ③ à droite, ④ en bas) */
const TRI = (apex, b1, b2) => ({ apex, b1, b2 });
const EX2T = { '①': TRI([-4, 0], [-2, -0.8], [-2, 0.8]), '②': TRI([0, 4], [-0.8, 2], [0.8, 2]), '③': TRI([4, 0], [2, 0.8], [2, -0.8]), '④': TRI([0, -4], [0.8, -2], [-0.8, -2]) };
export const FIG_EX2 = {
  points: {
    O: [0, 0], ...Object.fromEntries(Object.entries(EX2T).map(([n, t]) => [n, t.apex])),
    ...Object.fromEntries(Object.entries(EX2T).flatMap(([, t], i) => [[`b${i}1`, t.b1], [`b${i}2`, t.b2]])),
    e1: [-2, 0], e2: [2, 0], e3: [0, 2], e4: [0, -2],
  },
  hidden: ['b01', 'b02', 'b11', 'b12', 'b21', 'b22', 'b31', 'b32', 'e1', 'e2', 'e3', 'e4'],
  polygons: Object.keys(EX2T).map((n, i) => ({ points: [n, `b${i}1`, `b${i}2`], tone: 'amber' })),
  segments: [['e1', 'e2'], ['e3', 'e4'], ...Object.keys(EX2T).flatMap((n, i) => [{ from: n, to: `b${i}1`, tone: 'amber' }, { from: `b${i}1`, to: `b${i}2`, tone: 'amber' }, { from: `b${i}2`, to: n, tone: 'amber' }])],
  rightAngles: [['e2', 'O', 'e3']],
  labels: { O: 'se' },
  ariaLabel: 'صليب: قطعتان متعامدتان في O، وفي طرف كل ذراع مثلث رأسه نحو الخارج: المثلث 1 يسارا، 2 أعلى، 3 يمينا، 4 أسفل',
  maxWidth: 380,
};
/* التمرين 5 : l'éventail, REDESSINÉ exact (angle au sommet 30°, rotations de 120° ↺, 150° ↻, 90° ↻ ; AEF = AMN tourné de 60° ↻) */
const B5 = polar(4, 255); const D5 = polar(4, 285);
const fan = (deg) => [rot(B5, deg), rot(D5, deg)];
const [E5, F5] = fan(60); const [M5, N5] = fan(120); const [P5, Q5] = fan(210); const [R5, S5] = fan(270);
export const EX5_GAPS = { DAE: 30, FAM: 30, NAP: 60, QAR: 30, SAB: 60 };
export const FIG_EX5 = {
  points: { A: [0, 0], B: B5, D: D5, E: E5, F: F5, M: M5, N: N5, P: P5, Q: Q5, R: R5, S: S5 },
  polygons: [['B', 'D'], ['E', 'F'], ['M', 'N'], ['P', 'Q'], ['R', 'S']].map(([a, b], i) => ({ points: ['A', a, b], tone: i === 0 ? 'rose' : 'emerald' })),
  segments: [['B', 'D'], ['E', 'F'], ['M', 'N'], ['P', 'Q'], ['R', 'S']].flatMap(([a, b], i) => [
    { from: 'A', to: a, tone: i === 0 ? 'rose' : 'emerald' }, { from: a, to: b, tone: i === 0 ? 'rose' : 'emerald' }, { from: b, to: 'A', tone: i === 0 ? 'rose' : 'emerald' }]),
  angles: [{ at: 'B', from: 'D', to: 'A', label: '75°', radius: 18 }],
  ariaLabel: 'مروحة من خمسة مثلثات متقايسة رأسها المشترك A: ABD نحو الأسفل، AEF أسفل اليمين، AMN أعلى اليمين، APQ أعلى اليسار، ARS يسارا؛ الزاوية ABD قيسها 75 درجة',
  caption: REDRAWN,
  maxWidth: 480,
};
/* التمرين 7 : ① (ABC et CDE) et ② (HFG et HKL) sur quadrillage, O au-dessus */
export const FIG_EX7 = {
  points: { O: [0, 0], A: [-5, -4], B: [-1, -4], C: [-5, -2], D: [-3, 0], E: [-3, -2], H: [2, -5], F: [4, -5], G: [4, -1], K: [2, -3], L: [0, -3] },
  grid: true,
  polygons: [{ points: ['A', 'B', 'C'], tone: 'emerald' }, { points: ['C', 'D', 'E'], tone: 'emerald' }, { points: ['H', 'F', 'G'], tone: 'amber' }, { points: ['H', 'K', 'L'], tone: 'amber' }],
  segments: [['A', 'B'], ['B', 'C'], ['C', 'A'], ['C', 'D'], ['D', 'E'], ['E', 'C'], ['H', 'F'], ['F', 'G'], ['G', 'H'], ['H', 'K'], ['K', 'L'], ['L', 'H']],
  labels: { O: 'n', D: 'n', L: 's', K: 'e', E: 'e', C: 'w', A: 'sw', H: 'sw' },
  ariaLabel: 'ورقة مرصوفة: الشكل 1 (المثلثان ABC و CDE) على اليسار، والشكل 2 (المثلثان HFG و HKL) على اليمين، والنقطة O في الأعلى بينهما',
  maxWidth: 520,
};

/* ── أؤكّد تعلّماتي 1 (p. 160) : le rectangle ABCD de centre O, \widehat{BOC} = 60° ── */
export const FIG_QCM1 = {
  points: { O: [0, 0], A: polar(2, 30), B: polar(2, 150), C: polar(2, 210), D: polar(2, 330) },
  segments: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], ['A', 'C'], ['B', 'D']],
  angles: [{ at: 'O', from: 'B', to: 'C', label: '60°', radius: 22 }],
  ariaLabel: 'مستطيل ABCD قطراه [AC] و [BD] يتقاطعان في O، والزاوية BOC قيسها 60 درجة',
  maxWidth: 340,
};
