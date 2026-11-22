/**
 * Les FIGURES du درس (GeoFigure, données pures) : des PLAQUES de 10 × 10 carreaux — l'unité est la plaque entière — dont une partie
 * est coloriée. Tout est dessiné par la plateforme (guide §5 « Textbook figures » : les plaques du manuel sont analysées, puis REDESSINÉES
 * avec d'autres parties coloriées). Chaque quantité attendue est recalculée dans ./content.test.js à partir des polygones.
 */

/** Une plaque 10 × 10 : les polygones sont des rectangles entiers (colonnes, puis une colonne partielle). `fills` = [[x0, x1, y0, y1], …]. */
function plate({ fills, ariaLabel, tone = 'sky' }) {
  const points = {};
  for (let i = 0; i <= 10; i += 1) for (let j = 0; j <= 10; j += 1) points[`p${i}_${j}`] = [i, j];
  const segments = [];
  for (let i = 0; i <= 10; i += 1) segments.push([`p${i}_0`, `p${i}_10`]);
  for (let j = 0; j <= 10; j += 1) segments.push([`p0_${j}`, `p10_${j}`]);
  const polygons = fills.map(([x0, x1, y0, y1]) => ({ points: [`p${x0}_${y0}`, `p${x1}_${y0}`, `p${x1}_${y1}`, `p${x0}_${y1}`], tone }));
  return { points, hidden: Object.keys(points), segments, polygons, ariaLabel };
}

/** act-2 / ex-4 (redessinées) : A = 4 colonnes (40 carreaux), B = 2 colonnes et 7 carreaux (27), C = une plaque pleine et 6 colonnes et 3 carreaux (163). */
export const PLATES = {
  A: plate({ fills: [[0, 4, 0, 10]], ariaLabel: 'صفيحة من مئة بلاطة لُوّنت أربعة أعمدة منها' }),
  B: plate({ fills: [[0, 2, 0, 10], [2, 3, 0, 7]], tone: 'amber', ariaLabel: 'صفيحة من مئة بلاطة لُوّن عمودان كاملان وسبع بلاطات من العمود الثالث' }),
  C1: plate({ fills: [[0, 10, 0, 10]], tone: 'rose', ariaLabel: 'صفيحة من مئة بلاطة لُوّنت كلها' }),
  C2: plate({ fills: [[0, 6, 0, 10], [6, 7, 0, 3]], tone: 'rose', ariaLabel: 'صفيحة ثانية من مئة بلاطة لُوّنت ستة أعمدة كاملة وثلاث بلاطات من العمود السابع' }),
};

export const FIGURES = {
  'act-2': [PLATES.A, PLATES.B, PLATES.C1, PLATES.C2],
};
/** Ce que chaque plaque représente en CARREAUX coloriés (recompté dans le test) : A, B, C1 + C2. */
export const PLATE_CELLS = { A: 40, B: 27, C: 163 };
