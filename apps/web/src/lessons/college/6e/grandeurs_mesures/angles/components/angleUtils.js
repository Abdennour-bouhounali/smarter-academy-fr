// Primitives de formatage mutualisées — on ne les reproduit pas ici.
import { formatDec, parseDec, roundTo } from '@smarter-academy/core';

export { formatDec, parseDec, roundTo };

/**
 * angleUtils — outils de mesure des angles (6e).
 *
 * Périmètre strict du programme : notion d'ouverture, vocabulaire
 * (aigu/droit/obtus/plat), mesure et construction au rapporteur en degrés
 * entiers. Pas d'angles orientés, pas de somme des angles d'un triangle.
 *
 * Convention d'angle : `deg` se mesure DEPUIS le côté portant le zéro,
 * dans le sens de l'ouverture. polarToXY prend un angle en degrés mesuré
 * depuis l'horizontale droite, sens ANTI-HORAIRE (convention
 * mathématique) — l'inverse de la convention horlogère de la leçon Durées,
 * d'où ce rappel explicite pour éviter les bugs de signe au copier-coller.
 */

/** Classe un angle : aigu (< 90), droit (= 90), obtus (> 90), plat (= 180). */
export function classify(deg, epsilon = 0.5) {
  if (Math.abs(deg - 180) <= epsilon) return 'plat';
  if (Math.abs(deg - 90) <= epsilon) return 'droit';
  return deg < 90 ? 'aigu' : 'obtus';
}

/** Libellé français de la classe, avec article. */
export function classLabel(deg) {
  const c = classify(deg);
  return { aigu: 'aigu', droit: 'droit', obtus: 'obtus', plat: 'plat' }[c];
}

/** Formate une mesure d'angle : « 65° ». */
export function formatDeg(deg) {
  return `${formatDec(deg)}°`;
}

/**
 * L'AUTRE graduation du rapporteur — celle qu'on lit quand on suit la
 * mauvaise échelle. Source unique de tous les distracteurs du Module 4.
 */
export function otherScale(deg) {
  return 180 - deg;
}

/** Compare deux angles : -1 | 0 | 1. */
export function compareAngles(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Position sur un cercle. `deg` depuis l'horizontale droite, sens anti-horaire. */
export function polarToXY(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

/** Angle (0-360, anti-horaire depuis l'horizontale droite) d'un point vu du centre. */
export function angleFromPointer(cx, cy, x, y) {
  const deg = (Math.atan2(cy - y, x - cx) * 180) / Math.PI;
  return (deg + 360) % 360;
}

/** Chemin SVG d'un arc de cercle, du degré `from` au degré `to`. */
export function arcPath(cx, cy, r, fromDeg, toDeg) {
  const a = polarToXY(cx, cy, r, fromDeg);
  const b = polarToXY(cx, cy, r, toDeg);
  const large = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0;
  // sweep = 0 : sens anti-horaire dans le repère SVG (y inversé).
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${large} 0 ${b.x} ${b.y}`;
}
