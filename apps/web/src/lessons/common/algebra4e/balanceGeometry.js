/**
 * balanceGeometry — la géométrie de la balance, en nombres purs.
 *
 * Extraite de `BalanceScale.jsx` pour une raison précise : l'invariant
 * visuel (§17bis) exige que « tout état atteignable ait une mise en page
 * valide », et un invariant ne se vérifie pas à l'œil sur trois captures.
 * Ici il devient une fonction que `balanceGeometry.test.js` BALAIE sur
 * toute la plage d'écarts, au lieu de l'échantillonner.
 *
 * L'inclinaison est MATHÉMATIQUE : elle vient de l'écart réel entre les
 * deux plateaux, jamais d'un booléen « c'est faux ». Elle est compressée
 * par une tangente hyperbolique pour qu'un écart de 0,5 se voie et qu'un
 * écart de 10 000 ne sorte pas du cadre.
 */

export const W = 320;
export const H = 150;
export const MAX_TILT = 12;   // degrés
export const PIVOT_X = W / 2;
export const PIVOT_Y = 44;
export const ARM = 104;
export const PAN_DROP = 46;
export const PAN_HALF_WIDTH = 34;
export const PAN_DEPTH = 11;

/** L'angle du fléau pour un écart donné, borné à ±MAX_TILT. */
export function tiltFor(diff) {
  if (!Number.isFinite(diff) || diff === 0) return 0;
  return Math.sign(diff) * Math.tanh(Math.abs(diff) / 6) * MAX_TILT;
}

/**
 * La géométrie complète pour un écart donné : extrémités du fléau et
 * rectangles englobants des deux plateaux, dans le repère du viewBox.
 *
 * @param {number} diff  valeur(gauche) − valeur(droite) pour la valeur d'essai
 */
export function balanceGeometry(diff) {
  const tilt = tiltFor(diff);
  // Le plateau LOURD descend : un écart positif fait descendre la gauche.
  const angle = -tilt;
  const rad = (angle * Math.PI) / 180;
  const dx = Math.cos(rad) * ARM;
  const dy = Math.sin(rad) * ARM;

  const leftEnd = { x: PIVOT_X - dx, y: PIVOT_Y - dy };
  const rightEnd = { x: PIVOT_X + dx, y: PIVOT_Y + dy };

  const panBox = (at) => ({
    x0: at.x - PAN_HALF_WIDTH,
    x1: at.x + PAN_HALF_WIDTH,
    y0: at.y + PAN_DROP,
    y1: at.y + PAN_DROP + PAN_DEPTH,
  });

  return {
    tilt,
    angle,
    leftEnd,
    rightEnd,
    leftPan: panBox(leftEnd),
    rightPan: panBox(rightEnd),
    level: Math.abs(tilt) < 0.01,
  };
}
