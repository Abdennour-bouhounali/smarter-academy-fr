/**
 * Les FIGURES de la leçon « التناسبية والتمثيل البياني » : des données `GeoFigure` (jamais une image) — un repère (axes + quadrillage), O et les points
 * d'un tableau. Les coordonnées viennent des tableaux de ./exercises.js (`pts`), jamais tapées deux fois ; ./content.test.js les REMESURE.
 */
const NAMES = ['A', 'B', 'C', 'D', 'E'];

/** Une figure de points d'un repère ; `rays` trace la demi-droite issue de O par le point nommé ; `through` : une droite par deux noms. */
export function planeFigure(points, { ariaLabel, withO = true, rays = [], lines = [], maxWidth = 300, caption } = {}) {
  const pts = {};
  if (withO) pts.O = [0, 0];
  points.forEach(([x, y], i) => { pts[NAMES[i]] = [x, y]; });
  const fig = { points: pts, axes: true, grid: true, ariaLabel, maxWidth };
  if (rays.length) fig.rays = rays.map((n) => ({ from: 'O', through: n, tone: 'amber' }));
  if (lines.length) fig.lines = lines;
  if (caption) fig.caption = caption;
  return fig;
}

/** Une ligne brisée : segments entre points consécutifs (O compris). */
export function brokenFigure(points, { ariaLabel, maxWidth = 320 } = {}) {
  const pts = { O: [0, 0] };
  points.forEach(([x, y], i) => { pts[NAMES[i]] = [x, y]; });
  const order = ['O', ...points.map((_, i) => NAMES[i])];
  const segments = order.slice(1).map((n, i) => ({ from: order[i], to: n, tone: 'indigo' }));
  return { points: pts, axes: true, grid: true, segments, ariaLabel, maxWidth };
}

/** Les trois cas de معارف 1 : proportionnelle, alignée sans O, brisée — les mêmes nombres sont REMESURÉS par ./content.test.js. */
export const CASE_POINTS = {
  prop: [[1, 1.5], [2, 3], [4, 6]],
  aligned: [[1, 3], [2, 5], [4, 9]],
  bent: [[1, 1], [2, 3], [4, 9]],
};
export const CASE_FIGURES = [
  planeFigure(CASE_POINTS.prop, { ariaLabel: 'ثلاث نقط على مستقيم يمرّ بالمبدأ O', rays: ['C'], maxWidth: 200 }),
  planeFigure(CASE_POINTS.aligned, { ariaLabel: 'ثلاث نقط على مستقيم لا يمرّ بالمبدأ O', lines: [{ through: ['A', 'C'], tone: 'amber' }], maxWidth: 200 }),
  planeFigure(CASE_POINTS.bent, { ariaLabel: 'ثلاث نقط ليست على استقامة واحدة', maxWidth: 200 }),
];
