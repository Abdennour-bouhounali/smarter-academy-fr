/**
 * Les FIGURES du درس « المضلعات المنتظمة وتطبيقاتها », en données GeoFigure (common/components/geoFigure.js : points,
 * segments, angles, `circles: [{ center, radius }]`, `arcs` centrés fléchés), d'après les figures du manuel (pp. 151–160,
 * docs/sources/4am/unit13/extraction.json › figure / platformFigure, et le scan rendu page à page). Aucune image.
 *
 * Les sommets d'un polygone régulier sont ceux de `rotation.regularVertices(O, r, n, start, sens)` arrondis au millième
 * (content/figures.test.js le vérifie, et recalcule chaque réponse que la leçon affirme sur CES coordonnées).
 *
 * ANALYSE des figures du manuel (règle du propriétaire, guide §5) :
 *   • أستعدّ 1, نشاط 5, معارف 5 (trois exemples), طرائق (trois figures), تمرين 13, تمرين 19 : lisibles, quasi carrées, une
 *     seule forme chacune — REPRODUITES (le cercle de l'hexagone, déformé en ellipse par le scan, est redessiné régulier) ;
 *   • تمرين 9, 14, 15, دوري الآن, le تحدّ : PAS de figure dans le manuel — figures de la plateforme (même concept que
 *     l'énoncé : A en haut, sens direct), annoncées comme telles ;
 *   • أؤكّد تعلّماتي 4 : un pentagone à côtés codés égaux et deux angles droits — reproduit tel quel (la figure EST la
 *     question).
 */
export const PLATFORM_FIG = 'شكل من المنصّة (لا شكل في الكتاب)';

const regular = (names, coords) => Object.fromEntries(names.map((n, i) => [n, coords[i]]));
const ring = (names) => names.map((n, i) => [n, names[(i + 1) % names.length]]);

/* ── أستعدّ 1 (p. 151) : ABC, 60° en C et en B ── */
export const FIG_PREP1 = {
  points: { A: [0, 0], B: [2, 3.464], C: [-2, 3.464] },
  segments: [['A', 'B'], ['B', 'C'], ['C', 'A']],
  angles: [{ at: 'C', from: 'A', to: 'B', label: '60°' }, { at: 'B', from: 'C', to: 'A', label: '60°' }],
  ariaLabel: 'مثلث ABC رأسه A في الأسفل و [BC] أفقي في الأعلى، والزاويتان في C و B قيس كل منهما 60 درجة',
  maxWidth: 300,
};

/* ── نشاط 5 (p. 153) : le triangle équilatéral MPN dans son cercle de centre O ── */
const ACT5_PTS = { O: [0, 0], M: [0, 2], N: [-1.732, -1], P: [1.732, -1] };
export const FIG_ACT5 = {
  points: ACT5_PTS,
  circles: [{ center: 'O', radius: 2 }],
  segments: [['M', 'N'], ['N', 'P'], ['P', 'M']],
  ariaLabel: 'دائرة مركزها O ومثلث متقايس الأضلاع MPN مرسوم داخلها: M في الأعلى، N في الأسفل على اليسار، P في الأسفل على اليمين',
  maxWidth: 340,
};
/* La même figure, après les réponses : les trois زوايا مركزية de 120° et la rotation P ↦ M (arc fléché, sens direct). */
export const FIG_ACT5_SOL = {
  points: ACT5_PTS,
  circles: [{ center: 'O', radius: 2 }],
  segments: [['M', 'N'], ['N', 'P'], ['P', 'M'], { from: 'O', to: 'M', dashed: true }, { from: 'O', to: 'N', dashed: true }, { from: 'O', to: 'P', dashed: true }],
  angles: [{ at: 'O', from: 'N', to: 'P', label: '120°' }],
  arcs: [{ center: 'O', from: 'P', to: 'M', sweep: 'ccw', arrow: true, label: '120°', tone: 'emerald' }],
  ariaLabel: 'المثلث MPN في دائرته: أنصاف الأقطار OM و ON و OP، الزاوية المركزية NOP قيسها 120 درجة، وقوس بسهم من P إلى M في الاتجاه المباشر',
  maxWidth: 360,
};

/* ── معارف 5 (p. 156) : les trois exemples (rayon 2, sommets dans le sens direct comme sur les dessins) ── */
export const FIG_KNOW5_TRI = {
  points: { O: [0, 0], A: [0.518, 1.932], B: [-1.932, -0.518], C: [1.414, -1.414] },
  circles: [{ center: 'O', radius: 2 }],
  segments: [['A', 'B'], ['B', 'C'], ['C', 'A'], { from: 'O', to: 'A', dashed: true }, { from: 'O', to: 'B', dashed: true }, { from: 'O', to: 'C', dashed: true }],
  angles: [{ at: 'A', from: 'B', to: 'C', label: '60°' }, { at: 'O', from: 'B', to: 'C', label: '120°' }],
  ariaLabel: 'مثلث متقايس الأضلاع ABC في دائرته المحيطة التي مركزها O: الزاوية في A قيسها 60 درجة والزاوية المركزية BOC قيسها 120 درجة',
  maxWidth: 300,
};
export const FIG_KNOW5_SQ = {
  points: { O: [0, 0], A: [-1.732, 1], B: [-1, -1.732], C: [1.732, -1], D: [1, 1.732] },
  circles: [{ center: 'O', radius: 2 }],
  segments: [...ring(['A', 'B', 'C', 'D']), { from: 'A', to: 'C', dashed: true }, { from: 'B', to: 'D', dashed: true }],
  rightAngles: [['D', 'O', 'C']],
  ariaLabel: 'مربع ABCD في دائرته المحيطة التي مركزها O: القطران [AC] و [BD] متعامدان في O، والزاوية المركزية DOC قائمة',
  maxWidth: 300,
};
export const FIG_KNOW5_HEX = {
  points: { O: [0, 0], A: [-1.992, 0.174], B: [-1.147, -1.638], C: [0.845, -1.813], D: [1.992, -0.174], E: [1.147, 1.638], F: [-0.845, 1.813] },
  circles: [{ center: 'O', radius: 2 }],
  segments: [...ring(['A', 'B', 'C', 'D', 'E', 'F']), { from: 'A', to: 'D', dashed: true }, { from: 'B', to: 'E', dashed: true }, { from: 'C', to: 'F', dashed: true }],
  angles: [{ at: 'O', from: 'E', to: 'F', label: '60°' }, { at: 'B', from: 'C', to: 'A', label: '120°' }],
  ariaLabel: 'سداسي منتظم ABCDEF في دائرته المحيطة التي مركزها O، والأقطار [AD] و [BE] و [CF] تمر بـ O: الزاوية المركزية FOE قيسها 60 درجة وزاوية السداسي في B قيسها 120 درجة',
  maxWidth: 480,
};

/* ── طرائق (p. 157) ── */
const PENT = { O: [0, 0], A: [-1.176, 1.618], B: [-1.902, -0.618], C: [0, -2], D: [1.902, -0.618], E: [1.176, 1.618] };
export const FIG_METHOD_ANGLE = {
  points: PENT,
  circles: [{ center: 'O', radius: 2 }],
  segments: [...ring(['A', 'B', 'C', 'D', 'E']).map(([f, t]) => ({ from: f, to: t, tone: 'rose', bold: true })),
    ...['A', 'B', 'C', 'D', 'E'].map((n) => ({ from: 'O', to: n, dashed: true }))],
  angles: [{ at: 'A', from: 'B', to: 'E', label: '?' }],
  ariaLabel: 'خماسي منتظم ABCDE في دائرته المحيطة التي مركزها O، وأنصاف الأقطار متقطعة، والزاوية BAE معلّمة',
  maxWidth: 360,
};
export const FIG_METHOD_ANGLE_SOL = {
  points: PENT,
  circles: [{ center: 'O', radius: 2 }],
  segments: [...ring(['A', 'B', 'C', 'D', 'E']).map(([f, t]) => ({ from: f, to: t, tone: 'rose', bold: true })),
    { from: 'O', to: 'A', dashed: true }, { from: 'O', to: 'E', dashed: true }],
  polygons: [{ points: ['O', 'A', 'E'], tone: 'amber' }],
  angles: [{ at: 'O', from: 'E', to: 'A', label: '72°' }, { at: 'A', from: 'O', to: 'E', label: '54°' }, { at: 'E', from: 'A', to: 'O', label: '54°' }],
  ariaLabel: 'الخماسي المنتظم ABCDE والمثلث المتساوي الساقين AOE: الزاوية المركزية AOE قيسها 72 درجة وزاويتا القاعدة في A و E قيس كل منهما 54 درجة',
  maxWidth: 360,
};
export const FIG_METHOD_CONSTRUCT = {
  points: { O: [0, 0], A: [-1.5, 2.065], B: [-2.427, -0.789], C: [0, -2.552], D: [2.427, -0.789], E: [1.5, 2.065] },
  circles: [{ center: 'O', radius: 2.552 }],
  segments: ring(['A', 'B', 'C', 'D', 'E']).map(([f, t]) => ({ from: f, to: t, tone: 'rose', bold: true })),
  lines: [{ through: ['D', 'O'], name: '(Δ1)', dashed: true, extend: [0, 1] }, { through: ['C', 'O'], name: '(Δ2)', dashed: true, extend: [0, 1] }],
  angles: [{ at: 'A', from: 'B', to: 'E', label: '108°', arrow: true }],
  ariaLabel: 'خماسي منتظم ABCDE ودائرته المحيطة التي مركزها O: سهم 108 درجات من [AB] نحو [AE] في A، والمحور (Δ1) للقطعة [AB] يمر بـ O و D، والمحور (Δ2) للقطعة [AE] يمر بـ O و C',
  maxWidth: 400,
};
export const FIG_METHOD_SIDE = {
  points: { O: [0, 0], H: [-0.663, -0.557], A: [-1.628, 0.592], C: [1.327, 1.113], B: [0.301, -1.706] },
  circles: [{ center: 'O', radius: 1.732 }],
  segments: [['A', 'B'], ['B', 'C'], ['C', 'A'], { from: 'O', to: 'A', dashed: true }, { from: 'O', to: 'B', dashed: true }, { from: 'O', to: 'C', dashed: true }, ['O', 'H']],
  rightAngles: [['A', 'H', 'O']],
  ariaLabel: 'دائرة (E) مركزها O ونصف قطرها جذر 3، ومثلث متقايس الأضلاع ABC محاط بها، و H منتصف [AB] حيث [OH] يعامد [AB]',
  maxWidth: 340,
};

/* ── دوري الآن (p. 157) : l'heptagone (plateforme : rayon 2, A en haut, sens direct) ── */
export const FIG_NOW157 = {
  points: { O: [0, 0], ...regular(['A', 'B', 'C', 'D', 'E', 'F', 'G'], [[0, 2], [-1.564, 1.247], [-1.95, -0.445], [-0.868, -1.802], [0.868, -1.802], [1.95, -0.445], [1.564, 1.247]]) },
  circles: [{ center: 'O', radius: 2 }],
  segments: [...ring(['A', 'B', 'C', 'D', 'E', 'F', 'G']), { from: 'O', to: 'A', dashed: true }, { from: 'O', to: 'B', dashed: true }],
  ariaLabel: 'سباعي منتظم ABCDEFG في دائرته المحيطة التي مركزها O، ونصفا القطر [OA] و [OB]',
  caption: PLATFORM_FIG,
  maxWidth: 480,
};

/* ── أوظّف تعلّماتي (p. 159–161) ── */
/* تمرين 9 : ABC équilatéral de centre O (plateforme : rayon 2, A en haut) ; puis son image par la rotation (O, 45°, direct). */
const EX9 = { O: [0, 0], A: [0, 2], B: [-1.732, -1], C: [1.732, -1] };
export const FIG_EX9 = {
  points: EX9,
  circles: [{ center: 'O', radius: 2 }],
  segments: ring(['A', 'B', 'C']),
  ariaLabel: 'مثلث متقايس الأضلاع ABC مركزه O، في دائرته المحيطة',
  caption: PLATFORM_FIG,
  maxWidth: 340,
};
export const FIG_EX9_SOL = {
  points: { ...EX9, "A'": [-1.414, 1.414], "B'": [-0.518, -1.932], "C'": [1.932, 0.518] },
  circles: [{ center: 'O', radius: 2 }],
  segments: [...ring(['A', 'B', 'C']), ...ring(["A'", "B'", "C'"]).map(([f, t]) => ({ from: f, to: t, tone: 'emerald', bold: true }))],
  arcs: [{ center: 'O', from: 'A', to: "A'", sweep: 'ccw', arrow: true, label: '45°', tone: 'emerald' }],
  ariaLabel: 'المثلث ABC وصورته A′B′C′ بالدوران الذي مركزه O وزاويته 45 درجة في الاتجاه المباشر، وقوس بسهم من A إلى A′',
  caption: PLATFORM_FIG,
  maxWidth: 480,
};
/* تمرين 13 (p. 159) : le décagone, sommets dans le sens HORAIRE (A et B en haut), [OA], [OB], [OC], l'angle ABC. */
export const FIG_EX13 = {
  points: { O: [0, 0], ...regular(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'], [[-0.618, 1.902], [0.618, 1.902], [1.618, 1.176], [2, 0], [1.618, -1.176], [0.618, -1.902], [-0.618, -1.902], [-1.618, -1.176], [-2, 0], [-1.618, 1.176]]) },
  segments: [...ring(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']), ['O', 'A'], ['O', 'B'], ['O', 'C']],
  angles: [{ at: 'B', from: 'A', to: 'C' }],
  ariaLabel: 'عشاري منتظم ABCDEFGHIJ مركزه O، والقطع [OA] و [OB] و [OC]، والزاوية ABC معلّمة بقوس',
  maxWidth: 480,
};
/* تمرين 14 : l'octogone de centre O, OA = √8 (plateforme : A en haut, sens direct) ; (BH) coupe (OA) en L. */
export const FIG_EX14 = {
  points: { O: [0, 0], L: [0, 2], ...regular(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], [[0, 2.828], [-2, 2], [-2.828, 0], [-2, -2], [0, -2.828], [2, -2], [2.828, 0], [2, 2]]) },
  circles: [{ center: 'O', radius: 2.828 }],
  segments: [...ring(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']), ['B', 'H'], ['O', 'A'], { from: 'O', to: 'B', dashed: true }],
  labels: { L: 'se' },
  ariaLabel: 'ثماني منتظم ABCDEFGH مركزه O ونصف قطر دائرته جذر 8، والقطعة [BH] تقطع [OA] في L، ونصف القطر [OB]',
  caption: PLATFORM_FIG,
  maxWidth: 480,
};
/* تمرين 19 (p. 161) : l'hexagone (sens HORAIRE, A à gauche), rayon 16 m = côté ; [OH] ⊥ [BC]. */
export const FIG_EX19 = {
  points: { O: [0, 0], H: [0, 13.856], A: [-16, 0], B: [-8, 13.856], C: [8, 13.856], D: [16, 0], E: [8, -13.856], F: [-8, -13.856] },
  circles: [{ center: 'O', radius: 16 }],
  segments: [...ring(['A', 'B', 'C', 'D', 'E', 'F']).map(([f, t]) => ({ from: f, to: t, tone: 'rose', bold: true })),
    { from: 'A', to: 'D', dashed: true }, { from: 'B', to: 'E', dashed: true }, { from: 'C', to: 'F', dashed: true }, ['O', 'H']],
  rightAngles: [['B', 'H', 'O']],
  ariaLabel: 'سداسي منتظم ABCDEF في دائرته المحيطة التي مركزها O، والأقطار [AD] و [BE] و [CF] تمر بـ O، و [OH] يعامد [BC] في H',
  maxWidth: 480,
};
/* تمرين 15 (p. 161, après correction) : B, puis ses images par la rotation (A, 72°, direct) — le pentagone BCDEF de centre A. */
export const FIG_EX15 = {
  points: { A: [0, 0], ...regular(['B', 'C', 'D', 'E', 'F'], [[4, 0], [1.236, 3.804], [-3.236, 2.351], [-3.236, -2.351], [1.236, -3.804]]) },
  circles: [{ center: 'A', radius: 4 }],
  segments: [...ring(['B', 'C', 'D', 'E', 'F']), { from: 'A', to: 'B', dashed: true }, { from: 'A', to: 'C', dashed: true }],
  arcs: [{ center: 'A', from: 'B', to: 'C', sweep: 'ccw', arrow: true, label: '72°', tone: 'emerald' }],
  ariaLabel: 'نقطة A مركز دائرة نصف قطرها 4، و B عليها، و C و D و E و F صور متتالية بالدوران الذي مركزه A وزاويته 72 درجة في الاتجاه المباشر: الخماسي BCDEF',
  caption: PLATFORM_FIG,
  maxWidth: 420,
};

/* ── أؤكّد تعلّماتي 4 (p. 160) : le pentagone à côtés égaux et deux angles droits ── */
export const FIG_QCM4 = {
  points: { A: [0, 1], B: [1, 1], C: [1.866, 0.5], D: [1, 0], E: [0, 0] },
  segments: ring(['A', 'B', 'C', 'D', 'E']).map(([f, t]) => ({ from: f, to: t, ticks: 1 })),
  rightAngles: [['E', 'A', 'B'], ['D', 'E', 'A']],
  ariaLabel: 'خماسي ABCDE أضلاعه الخمسة مرمّزة متقايسة، والزاويتان في A و E قائمتان، و C رأس على اليمين',
  maxWidth: 340,
};

/* ── le تحدّ (p. 151), après la réponse : la construction de l'étoile (plateforme ; le manuel n'a que la photo du drapeau) ── */
export const FIG_CHALLENGE_SOL = {
  points: { O: [0, 0], A: [0, 8.507], B: [-8.09, 2.629], C: [-5, -6.882], D: [5, -6.882], E: [8.09, 2.629] },
  circles: [{ center: 'O', radius: 8.507 }],
  segments: [{ from: 'A', to: 'B', label: '10', tone: 'indigo', bold: true }, { from: 'B', to: 'C', dashed: true }, { from: 'C', to: 'D', dashed: true }, { from: 'D', to: 'E', dashed: true }, { from: 'E', to: 'A', dashed: true },
    ...[['A', 'C'], ['C', 'E'], ['E', 'B'], ['B', 'D'], ['D', 'A']].map(([f, t]) => ({ from: f, to: t, tone: 'rose', bold: true }))],
  angles: [{ at: 'O', from: 'A', to: 'B', label: '72°' }],
  ariaLabel: 'دائرة مركزها O ونصف قطرها حوالي 8,51 سنتيمتر، عليها خمسة رؤوس A و B و C و D و E بينها 72 درجة، والمسافة AB تساوي 10 سنتيمتر، والنجمة بفروعها الخمسة [AC] و [CE] و [EB] و [BD] و [DA]',
  caption: PLATFORM_FIG,
  maxWidth: 420,
};
