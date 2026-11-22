/**
 * elevator-reel — la GÉOMÉTRIE PURE de la tour (testée) : étages +9 … −9, rue au niveau 0. Tout en pixels du viewBox.
 * `fh` = hauteur d'un étage (≥ 20 px, budgétée sur l'écran par le composant). Le niveau f occupe la bande
 * [edge(f), edge(f) + fh] ; la cabine à l'étage f (peut être fractionnaire) est centrée sur `y(f)`.
 */
const TOP = 9;
export const LEVELS = 19; // −9 … 9

/** Hauteur d'un étage budgétée sur la hauteur de l'écran : 20 px au moins, 30 au plus. */
export const floorHeight = (screenH) => Math.max(20, Math.min(30, Math.floor((screenH - 430) / LEVELS)));

/**
 * À l'ÉCRAN DE JEU (`immersive`, 2026-10-27) : la hauteur d'un étage est celle qui fait tenir les 19 niveaux dans la hauteur
 * `avail` qui reste sous la consigne (cadre et marges compris), de 20 à 44 px.
 */
export const floorHeightFor = (avail) => Math.max(20, Math.min(44, Math.floor((avail - 48) / LEVELS)));

/** La largeur de la tour : 150 px sur un labo étroit, 280 sur un labo large, 40 % de l'écran (340 … 560) à l'écran de jeu. */
export function towerWidth(labWidth, wide, immersed = false) {
  if (immersed) return Math.max(340, Math.min(560, Math.floor(labWidth * 0.4)));
  return wide ? 280 : Math.max(132, Math.min(160, Math.floor(labWidth * 0.4)));
}

export function towerGeometry({ width, fh }) {
  const top = 24;
  const labelW = 30;
  const arrowsW = 24;
  // à l'écran de jeu (tour de plus de 300 px) la cabine grandit avec la tour : c'est elle qu'on regarde
  const shaftW = Math.max(40, Math.min(width > 300 ? 110 : 70, Math.round(width * 0.3)));
  const shaftX = width - arrowsW - shaftW - 4;
  const bodyX = labelW + 2;
  const H = top + LEVELS * fh + 12;
  const edge = (f) => top + (TOP - f) * fh; // bord haut de la bande du niveau f
  const y = (f) => edge(f) + fh / 2; // centre du niveau f (continu)
  return { width, fh, top, labelW, arrowsW, shaftW, shaftX, bodyX, H, edge, y, streetY: edge(0) + fh / 2, arrowX: shaftX + shaftW + 12 };
}
