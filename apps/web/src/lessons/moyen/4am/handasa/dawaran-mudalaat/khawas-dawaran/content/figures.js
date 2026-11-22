/**
 * Les FIGURES du درس « خواص الدوران وتوظيفها في الأشكال الهندسية », en données GeoFigure (common/components/geoFigure.js :
 * points, segments, polygones, angles droits, `angles` (avec `arrow` : le sens du دوران), `arcs` centrés, `grid`, `axes`)
 * d'après les figures du manuel (pp. 151–161, docs/sources/4am/unit13/extraction.json › figure, et le scan rendu page à
 * page). Aucune image. Chaque figure est ANALYSÉE (guide §5 « Textbook figures ») : reproduite quand le dessin du manuel
 * se lit, REDESSINÉE sinon avec le même concept — et chaque réponse est recalculée sur les coordonnées de la plateforme
 * avec rotation.js (content/figures.test.js).
 *
 *   FIG_PREP2       أستعدّ 2 (p. 151)            reproduite : triangle rectangle isocèle en A, codages
 *   FIG_KNOW3       معارف 3, l'exemple (p. 154)   REDESSINÉE : dans le manuel A, B, C et leurs images sont sur deux
 *                                                demi-droites à 20° l'une de l'autre — une bande où A′ touche A et B′
 *                                                touche B. Même concept (20° direct, AB = 2, trois points alignés),
 *                                                la droite (ABC) écartée de O : les images forment une seconde droite
 *   FIG_PERP        معارف (ajout de la plateforme) une droite et son image par 90° autour de O
 *   FIG_METHOD      طرائق p. 155                  reproduite (coordonnées lues) mais aérée : OAB, OCD rectangles
 *                                                isocèles EN O (le manuel ne le dit que sur la figure), [AC] et [BD]
 *   FIG_METHOD_TURN la même, avec les arcs A → B et C → D (sens direct)
 *   FIG_NOW155(_SOL) دوري الآن p. 155             REDESSINÉE : avec K (1,5 ; −0,7) du manuel l'image B′ tombe sur A ;
 *                                                K (5 ; −1) sépare la zone de la figure et celle de son image
 *   FIG_EX4(_SOL1/2) تمرين 4 p. 158              reproduite (ABC rectangle isocèle en A)
 *   FIG_EX8         تمرين 8 p. 159                reproduite, A à sa vraie hauteur (le manuel la dessine trop haut)
 *   FIG_EX17(_SOL)  تمرين 17 p. 161               dans un repère (les points de l'énoncé), puis le rectangle ABDC
 *   FIG_EX18        تمرين 18 p. 161               COMPLÉTÉE : scan presque effacé, nœuds relus (extraction › discrepancies)
 *   FIG_E2, FIG_E4  l'إختبار أولي (plateforme)
 */
import * as R from '@smarter-academy/core/arithmetic/rotation.js';

export const REDRAWN = 'أعادت المنصّة رسم شكل الكتاب بوضوح أكبر، بنفس المعطيات';
const r3 = (p) => [Math.round(p.x * 1000) / 1000, Math.round(p.y * 1000) / 1000];
const turn = (pt, center, alpha, dir = 'direct') => r3(R.rotateApprox({ x: pt[0], y: pt[1] }, { x: center[0], y: center[1] }, alpha, dir));

/* ── أستعدّ 2 (p. 151) : ABC rectangle en A, AB = AC ── */
export const FIG_PREP2 = {
  points: { A: [0, 2], B: [-2, 0], C: [2, 0] },
  segments: [{ from: 'A', to: 'B', ticks: 1 }, { from: 'A', to: 'C', ticks: 1 }, ['B', 'C']],
  rightAngles: [['B', 'A', 'C']],
  ariaLabel: 'مثلث ABC قائم في A، والضلعان [AB] و [AC] مرمّزان بنفس العلامة',
  maxWidth: 260,
};

/* ── معارف 3, l'exemple (p. 154) : 20° direct, AB = 2 (REDESSINÉE) ── */
export const KNOW3_O = [0, -2];
export const KNOW3_PTS = { A: [4, 0], B: [6, 0], C: [8.5, 0] };
const k3 = Object.fromEntries(Object.entries(KNOW3_PTS).map(([n, p]) => [`${n}'`, turn(p, KNOW3_O, 20)]));
export const FIG_KNOW3 = {
  points: { O: KNOW3_O, ...KNOW3_PTS, ...k3 },
  segments: [{ from: 'A', to: 'C', tone: 'slate' }, { from: "A'", to: "C'", tone: 'indigo' },
    { from: 'O', to: 'A', dashed: true }, { from: 'O', to: "A'", dashed: true }],
  arcs: [{ center: 'O', from: 'A', to: "A'", sweep: 'ccw', arrow: true, tone: 'indigo' },
    { center: 'O', from: 'B', to: "B'", sweep: 'ccw', arrow: true, tone: 'indigo' },
    { center: 'O', from: 'C', to: "C'", sweep: 'ccw', arrow: true, tone: 'indigo' }],
  angles: [{ at: 'O', from: 'A', to: "A'", label: '20°', arrow: true }],
  ariaLabel: 'النقط A و B و C على مستقيم، وصورها A′ و B′ و C′ بالدوران الذي مركزه O وزاويته 20 درجة في الاتجاه المباشر على مستقيم آخر',
  caption: REDRAWN,
  maxWidth: 520,
};

/* ── معارف (ajout de la plateforme) : (d) et son image (d′) par 90° autour de O ── */
const PERP_PTS = { E: [1, 3], F: [4, 1] };
export const FIG_PERP = {
  points: { O: [0, 0], ...PERP_PTS, "E'": turn(PERP_PTS.E, [0, 0], 90), "F'": turn(PERP_PTS.F, [0, 0], 90) },
  lines: [{ through: ['E', 'F'], name: '(d)', tone: 'slate' }, { through: ["E'", "F'"], name: "(d')", tone: 'rose' }],
  arcs: [{ center: 'O', from: 'F', to: "F'", sweep: 'ccw', arrow: true, tone: 'rose' }],
  ariaLabel: 'المستقيم (d) المار بـ E و F وصورته (d′) المار بـ E′ و F′ بالدوران الذي مركزه O وزاويته 90 درجة: المستقيمان متعامدان',
  maxWidth: 420,
};

/* ── طرائق p. 155 : OAB et OCD rectangles isocèles EN O ── */
export const METHOD_PTS = { O: [0, 0], A: [4, -2], B: [2, 4], C: [-1, 2], D: [-2, -1] };
const methodBase = {
  points: METHOD_PTS,
  polygons: [{ points: ['O', 'A', 'B'], tone: 'emerald' }, { points: ['O', 'C', 'D'], tone: 'indigo' }],
  segments: [['O', 'A'], ['O', 'B'], ['A', 'B'], ['O', 'C'], ['O', 'D'], ['C', 'D'],
    { from: 'A', to: 'C', tone: 'amber', bold: true }, { from: 'B', to: 'D', tone: 'rose', bold: true }],
  rightAngles: [['A', 'O', 'B'], ['C', 'O', 'D']],
  labels: { O: 's' },
};
export const FIG_METHOD = {
  ...methodBase,
  ariaLabel: 'المثلثان OAB و OCD قائمان في O ومتساويا الساقين، والقطعتان [AC] و [BD]',
  caption: REDRAWN,
  maxWidth: 480,
};
export const FIG_METHOD_TURN = {
  ...methodBase,
  arcs: [{ center: 'O', from: 'A', to: 'B', sweep: 'ccw', arrow: true, tone: 'emerald' },
    { center: 'O', from: 'C', to: 'D', sweep: 'ccw', arrow: true, tone: 'indigo' }],
  ariaLabel: 'الدوران الذي مركزه O وزاويته 90 درجة في الاتجاه المباشر يحوّل A إلى B و C إلى D، فيحوّل [AC] إلى [BD]',
  maxWidth: 480,
};

/* ── دوري الآن p. 155 : un angle de 45°, K centre, 60° direct (REDESSINÉE) ── */
export const NOW155_PTS = { O: [0, 0], A: [2.121, 2.121], B: [4, 0] };
export const NOW155_K = [5, -1];
const now = Object.fromEntries(Object.entries(NOW155_PTS).map(([n, p]) => [`${n}'`, turn(p, NOW155_K, 60)]));
export const FIG_NOW155 = {
  points: { ...NOW155_PTS, K: NOW155_K },
  rays: [{ from: 'O', through: 'A' }, { from: 'O', through: 'B' }],
  angles: [{ at: 'O', from: 'B', to: 'A', label: '45°' }],
  ariaLabel: 'الزاوية AOB قيسها 45 درجة والنقطة K',
  caption: REDRAWN,
  maxWidth: 420,
};
export const FIG_NOW155_SOL = {
  points: { ...NOW155_PTS, K: NOW155_K, ...now },
  rays: [{ from: 'O', through: 'A' }, { from: 'O', through: 'B' }, { from: "O'", through: "A'", tone: 'rose' }, { from: "O'", through: "B'", tone: 'rose' }],
  segments: [{ from: 'K', to: 'O', dashed: true }, { from: 'K', to: "O'", dashed: true }],
  arcs: [{ center: 'K', from: 'O', to: "O'", sweep: 'ccw', arrow: true, tone: 'rose' }],
  angles: [{ at: 'O', from: 'B', to: 'A', label: '45°' }, { at: "O'", from: "B'", to: "A'", label: '45°' }],
  ariaLabel: 'الزاوية AOB وصورتها A′O′B′ بالدوران الذي مركزه K وزاويته 60 درجة في الاتجاه المباشر: قيسهما 45 درجة',
  maxWidth: 480,
};

/* ── تمرين 4 p. 158 : ABC rectangle en A et isocèle ── */
export const EX4_PTS = { A: [0, 0], B: [3, 0], C: [0, 3] };
export const FIG_EX4 = {
  points: EX4_PTS,
  segments: [{ from: 'A', to: 'B', ticks: 1 }, { from: 'A', to: 'C', ticks: 1 }, ['B', 'C']],
  rightAngles: [['B', 'A', 'C']],
  ariaLabel: 'مثلث ABC قائم في A ومتساوي الساقين',
  maxWidth: 260,
};
export const EX4_AP = turn(EX4_PTS.A, EX4_PTS.B, 90, 'indirect');
export const FIG_EX4_SOL1 = {
  points: { ...EX4_PTS, "A'": EX4_AP },
  polygons: [{ points: ['A', 'B', "A'", 'C'], tone: 'emerald' }],
  segments: [['A', 'B'], ['B', "A'"], ["A'", 'C'], ['C', 'A'], ['B', 'C']],
  arcs: [{ center: 'B', from: 'A', to: "A'", sweep: 'cw', arrow: true, tone: 'rose' }],
  rightAngles: [['B', 'A', 'C'], ['A', 'B', "A'"]],
  ariaLabel: 'A′ صورة A بالدوران الذي مركزه B وزاويته 90 درجة في الاتجاه غير المباشر، والرباعي ABA′C مربع',
  maxWidth: 300,
};
export const EX4_A1 = turn(EX4_PTS.A, EX4_PTS.C, 45);
export const EX4_B1 = turn(EX4_PTS.B, EX4_PTS.C, 45);
export const FIG_EX4_SOL2 = {
  points: { ...EX4_PTS, A1: EX4_A1, B1: EX4_B1 },
  polygons: [{ points: ['A', 'B', 'C'], tone: 'slate' }, { points: ['C', 'A1', 'B1'], tone: 'rose' }],
  segments: [['A', 'B'], ['B', 'C'], ['C', 'A'], { from: 'C', to: 'A1', tone: 'rose' }, { from: 'A1', to: 'B1', tone: 'rose' }, { from: 'B1', to: 'C', tone: 'rose' }],
  rightAngles: [['B', 'A', 'C'], ['C', 'A1', 'B1']],
  ariaLabel: 'المثلث CA1B1 صورة المثلث ABC بالدوران الذي مركزه C وزاويته 45 درجة في الاتجاه المباشر',
  maxWidth: 340,
};

/* ── تمرين 8 p. 159 : le carré BCDE de centre O, le triangle équilatéral ABC, M et N sur (ED) ── */
export const EX8_PTS = { B: [-1, 1], C: [1, 1], D: [1, -1], E: [-1, -1], O: [0, 0], A: [0, 2.732], M: [-3, -1], N: [3, -1] };
export const FIG_EX8 = {
  points: EX8_PTS,
  segments: [{ from: 'A', to: 'B', ticks: 1 }, { from: 'A', to: 'C', ticks: 1 }, { from: 'B', to: 'C', ticks: 1 },
    { from: 'C', to: 'D', ticks: 1 }, ['D', 'E'], { from: 'E', to: 'B', ticks: 1 }, { from: 'B', to: 'D', dashed: true },
    { from: 'C', to: 'E', dashed: true }, { from: 'M', to: 'E', ticks: 2 }, { from: 'D', to: 'N', ticks: 2 }, ['M', 'B'], ['N', 'C']],
  rightAngles: [['E', 'B', 'C'], ['B', 'C', 'D'], ['C', 'D', 'E'], ['D', 'E', 'B']],
  labels: { O: 's', B: 'w', C: 'e', E: 's', D: 's' },
  ariaLabel: 'المربع BCDE مركزه O، والمثلث متقايس الأضلاع ABC فوقه، والنقطتان M و N على المستقيم (ED) حيث ME = EB و DN = DC',
  maxWidth: 480,
};

/* ── تمرين 17 p. 161 (BEM) : A(0 ; 4), B(−3 ; 1), C(5 ; −1) ; E milieu de [BC] ; D image de A par (E, 180°) ── */
export const EX17_PTS = { A: [0, 4], B: [-3, 1], C: [5, -1] };
export const FIG_EX17 = {
  points: EX17_PTS,
  grid: true, axes: true,
  ariaLabel: 'معلم متعامد ومتجانس فيه النقط A(0 ; 4) و B(−3 ; 1) و C(5 ; −1)',
  maxWidth: 480,
};
export const FIG_EX17_SOL = {
  points: { ...EX17_PTS, E: [1, 0], D: [2, -4] },
  grid: true, axes: true,
  polygons: [{ points: ['A', 'B', 'D', 'C'], tone: 'emerald' }],
  segments: [['A', 'B'], ['B', 'D'], ['D', 'C'], ['C', 'A'], { from: 'A', to: 'D', dashed: true }, { from: 'B', to: 'C', dashed: true }],
  rightAngles: [['B', 'A', 'C']],
  labels: { E: 'n' },
  ariaLabel: 'المستطيل ABDC قطراه [AD] و [BC] يتناصفان في E(1 ; 0)، و D(2 ; −4) صورة A بالدوران الذي مركزه E وزاويته 180 درجة',
  maxWidth: 480,
};

/* ── تمرين 18 p. 161 : figure COMPLÉTÉE (le scan est presque effacé) ── */
export const EX18_PTS = { A: [0, 1], B: [1, 0], "A'": [2, 0], "B'": [3, 1], M: [1, 3], N: [0, 2], P: [2, 2], "M'": [3, 3], "N'": [4, 2], "P'": [4, 4] };
export const FIG_EX18 = {
  points: EX18_PTS,
  grid: true, axes: true,
  polygons: [{ points: ['M', 'N', 'P'], tone: 'emerald' }, { points: ["M'", "N'", "P'"], tone: 'sky' }],
  segments: [['A', 'B'], ["A'", "B'"], ['M', 'N'], ['N', 'P'], ['P', 'M'], ["M'", "N'"], ["N'", "P'"], ["P'", "M'"]],
  ariaLabel: 'ورقة مرصوفة: القطعة [AB] وصورتها [A′B′]، والمثلث MNP وصورته M′N′P′',
  caption: 'أكملت المنصّة شكل الكتاب الباهت على عقد الشبكة، بنفس المعطيات',
  maxWidth: 480,
};

/* ── إختبار أولي (plateforme) ── */
export const FIG_E4 = {
  points: { O: [0, 0], A: [1, 2], B: [3, 1], K: [1, -3], L: [-1, 3], N: [-3, -1] },
  grid: true,
  polygons: [{ points: ['O', 'A', 'B'], tone: 'emerald' }],
  segments: [['O', 'A'], ['A', 'B'], ['B', 'O']],
  ariaLabel: 'ورقة مرصوفة: المثلث OAB والنقط K و L و N',
  maxWidth: 420,
};
