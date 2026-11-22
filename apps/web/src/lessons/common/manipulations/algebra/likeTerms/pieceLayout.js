/**
 * like-terms — la GÉOMÉTRIE des pièces, pure et testée (MANIPULATION_CONTRACT §7ter étape 9). Tout est à l'ÉCHELLE d'une unité `u` (px) :
 *   p = 1  une RÉGLETTE de longueur x·u et de largeur u ; une pile de n réglettes = n réglettes debout, côte à côte ;
 *   p = 2  une PLAQUE carrée de côté x·u — le côté de la plaque EST la longueur de la réglette ; n plaques = une pile décalée en
 *          diagonale (chaque bord visible : on peut les compter) ;
 *   p = 0  un CUBE d'arête u ; n cubes = une grille d'au plus `cubeCols(n)` colonnes.
 * Chaque pièce est dessinée UNE fois, aucune ne sort du cadre (balayé dans le test pour n = 1…12, x = 1…6).
 */
const SEAM = 1;
const plateOffset = (u) => Math.max(3, Math.round(u * 0.34));
const cubeGap = (u) => Math.max(1, Math.round(u * 0.14));
export const cubeDepth = (u) => Math.max(2, Math.round(u * 0.28));
const cubeCols = (n) => (n <= 6 ? n : Math.ceil(n / 2));

/** La pile de `n` pièces de forme `p`, à la longueur `x` et à l'unité `u` : `{ w, h, pieces: [{ x, y, w, h }] }`. */
export function bundleLayout({ n, p, x, u }) {
  const k = Math.max(0, Math.round(Math.abs(n)));
  if (k === 0) return { w: 0, h: 0, pieces: [] };
  if (p === 1) {
    const pieces = Array.from({ length: k }, (_, i) => ({ x: i * (u + SEAM), y: 0, w: u, h: x * u }));
    return { w: k * u + (k - 1) * SEAM, h: x * u, pieces };
  }
  if (p === 2) {
    const o = plateOffset(u);
    const side = x * u;
    // de la plaque du dessous (en bas à gauche) à celle du dessus (en haut à droite)
    const pieces = Array.from({ length: k }, (_, i) => ({ x: i * o, y: (k - 1 - i) * o, w: side, h: side }));
    return { w: side + (k - 1) * o, h: side + (k - 1) * o, pieces };
  }
  const cols = cubeCols(k);
  const rows = Math.ceil(k / cols);
  const g = cubeGap(u);
  const d = cubeDepth(u);
  const pieces = Array.from({ length: k }, (_, i) => ({ x: (i % cols) * (u + g), y: d + Math.floor(i / cols) * (u + g), w: u, h: u }));
  return { w: cols * u + (cols - 1) * g + d, h: rows * u + (rows - 1) * g + d, pieces };
}

/** Le plus grand encombrement d'une pile sur toute la plage de x (pour que la table ne saute pas quand la main change x). */
function maxBundleBox({ n, p, u, xMax = 6 }) {
  const l = bundleLayout({ n, p, x: xMax, u });
  return { w: l.w, h: l.h };
}

/**
 * L'unité `u` qui fait tenir la table d'UN regard (§8bis) : la plus grande (entre `min` et `max`) telle que les piles de l'expression,
 * dessinées à x = 6, tiennent en au plus `maxRows` rangées de largeur `width` et que la hauteur de la scène ne dépasse pas `height`.
 * `cards` : [{ n, p }] (une carte par pile) ; `extra` : la hauteur fixe autour (étiquettes, صواني, ligne écrite).
 */
export function fitUnit({ cards, width, height, extra = 0, trayRows = 1, min = 7, max = 18, pad = 16, label = 30, gap = 8, crates = 0 }) {
  for (let u = max; u > min; u -= 1) {
    const boxes = cards.map((c) => { const b = maxBundleBox({ ...c, u }); return { w: Math.max(56, b.w + pad), h: b.h + pad + label }; });
    const avail = width - crates * 46;
    let rows = 1; let line = 0; let rowH = 0; let total = 0;
    for (const b of boxes) {
      if (line > 0 && line + gap + b.w > avail) { rows += 1; total += rowH + gap; line = 0; rowH = 0; }
      line += (line > 0 ? gap : 0) + b.w;
      rowH = Math.max(rowH, b.h);
    }
    total += rowH;
    const trayH = trayRows * (6 * u + 3 * plateOffset(u) + pad + 36);
    if (rows <= 2 && total + trayH + extra <= height) return u;
  }
  return min;
}
