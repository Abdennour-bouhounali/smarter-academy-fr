// The oracle of the neutral thinking-lab fixture (scripts/__fixtures__/thinking-lab/challenges/0318-four-arcs-area.json),
// kept from the deleted seed batch: the area is RECOMPUTED by numerical integration of the region (horizontal slices),
// never by the formula of the replay. Shape: ORACLE[id] = { answer, ceiling?, parts?[], tolerance? }, each (params, point) => value.

/** Simpson composite sur [a, b] (n pair ; fin, car la corde a des pointes en racine carrée aux bords des disques). */
function simpson(f, a, b, n = 400000) {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}

/** Longueur, à la hauteur y, de l'intersection des disques (cx, cy, r). */
function chordOfDisks(disks, y) {
  let lo = -Infinity;
  let hi = Infinity;
  for (const [cx, cy, r] of disks) {
    const dy = y - cy;
    if (Math.abs(dy) > r) return 0;
    const half = Math.sqrt(r * r - dy * dy);
    lo = Math.max(lo, cx - half);
    hi = Math.min(hi, cx + half);
  }
  return Math.max(0, hi - lo);
}

/** Aire de l'intersection de disques, intégrée en y sur [y0, y1]. */
const areaOfDisks = (disks, y0, y1) => simpson((y) => chordOfDisks(disks, y), y0, y1);

// Carré unité, quatre disques de rayon 1 centrés aux sommets.
const FOUR_ARCS_UNIT = areaOfDisks([[0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]], 0, 1);
// Triangle équilatéral unité, trois disques de rayon 1 centrés aux sommets (triangle de Reuleaux).
const REULEAUX_UNIT = areaOfDisks([[0, 0, 1], [1, 0, 1], [0.5, Math.sqrt(3) / 2, 1]], -0.2, 1.0);

export const ORACLE = {
  // #318 — une aire : elle change d'échelle comme x² (même figure, unité x).
  'four-arcs-area': {
    answer: (_params, { x }) => FOUR_ARCS_UNIT * x * x,
    ceiling: (_params, { x }) => REULEAUX_UNIT * x * x,
    tolerance: 1e-7,
  },
};
