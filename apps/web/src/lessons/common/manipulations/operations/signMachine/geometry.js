/**
 * La géométrie du tableau lumineux de `sign-machine` — pure, testée (MANIPULATION_CONTRACT §7ter, étape 9).
 *
 * Neuf colonnes b = −4 … 4 (de gauche à droite : l'axe est un îlot LTR), une ligne 0 horizontale ; la barre de la colonne b va de la
 * ligne 0 jusqu'à a × b à l'ÉCHELLE (la même unité pour toutes les colonnes : le dessin EST l'argument, DNA §17.6). Au-dessus de la
 * plus haute barre possible et au-dessous de la plus basse, une marge loge la pilule de valeur ; sous le tableau, le rail du curseur.
 * Les marches d'écart (« +4 ») vivent dans l'intervalle entre deux colonnes (`gapW`) : la contremarche contre la colonne d'arrivée, l'écart écrit à côté.
 */
export const PILL_ROOM = 30;

/** `scaleMax` : le plus grand |a × b| que le niveau peut montrer (12 en مبتدئ, 16 en متقدم et en libre). */
export function boardGeometry({ width, scaleMax = 16, half = 96 }) {
  const W = Math.max(300, Math.round(width));
  const padX = 14;
  const colW = (W - padX * 2) / 9;
  const y0 = PILL_ROOM + half;
  const boardBottom = y0 + half + PILL_ROOM;
  const railY = boardBottom + 34;
  const H = railY + 44;
  const unit = half / scaleMax;
  const x = (b) => padX + (b + 4) * colW + colW / 2;
  const yOf = (p) => y0 - p * unit;
  /** La colonne la plus proche d'une abscisse (glisser sur le rail). */
  const bAt = (px) => Math.max(-4, Math.min(4, Math.round((px - padX - colW / 2) / colW) - 4));
  return { W, H, padX, colW, barW: Math.max(12, colW * 0.4), gapW: colW * 0.6, y0, half, unit, boardBottom, railY, x, yOf, bAt };
}
