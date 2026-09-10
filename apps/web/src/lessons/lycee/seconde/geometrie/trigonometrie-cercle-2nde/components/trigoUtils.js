/**
 * Le noyau mathématique de la leçon « Le cercle trigonométrique ».
 *
 * Tout ce que l'élève voit — la position du point, ses coordonnées, l'arc
 * parcouru, les valeurs remarquables — est CALCULÉ ici, jamais écrit à la main
 * dans un module. Un texte de correction et la figure qui l'accompagne ne
 * peuvent donc pas se contredire.
 */

/** Un tour complet, en radians. */
export const TAU = 2 * Math.PI;

/** Ramène un réel dans [0 ; 2π[ — l'enroulement fait plusieurs tours. */
export function principal(t) {
  const r = t % TAU;
  return r < 0 ? r + TAU : r;
}

/** Coordonnées du point du cercle associé au réel t (rayon 1, sens direct). */
export function pointOf(t) {
  return { x: Math.cos(t), y: Math.sin(t) };
}

/** Conversions — un demi-tour vaut π radians et 180 degrés, rien de plus. */
export const toDegrees = (rad) => (rad * 180) / Math.PI;
export const toRadians = (deg) => (deg * Math.PI) / 180;

/**
 * Les huit valeurs remarquables du premier tour, avec leur écriture exacte.
 * `tex` sert à l'affichage, `cos`/`sin` au calcul : les deux viennent de la
 * même source, donc la table affichée ne peut pas mentir sur la figure.
 */
export const REMARKABLE = [
  { t: 0, label: '0', cosTex: '1', sinTex: '0' },
  { t: Math.PI / 6, label: '\\dfrac{\\pi}{6}', cosTex: '\\dfrac{\\sqrt{3}}{2}', sinTex: '\\dfrac{1}{2}' },
  { t: Math.PI / 4, label: '\\dfrac{\\pi}{4}', cosTex: '\\dfrac{\\sqrt{2}}{2}', sinTex: '\\dfrac{\\sqrt{2}}{2}' },
  { t: Math.PI / 3, label: '\\dfrac{\\pi}{3}', cosTex: '\\dfrac{1}{2}', sinTex: '\\dfrac{\\sqrt{3}}{2}' },
  { t: Math.PI / 2, label: '\\dfrac{\\pi}{2}', cosTex: '0', sinTex: '1' },
  { t: (2 * Math.PI) / 3, label: '\\dfrac{2\\pi}{3}', cosTex: '-\\dfrac{1}{2}', sinTex: '\\dfrac{\\sqrt{3}}{2}' },
  { t: (3 * Math.PI) / 4, label: '\\dfrac{3\\pi}{4}', cosTex: '-\\dfrac{\\sqrt{2}}{2}', sinTex: '\\dfrac{\\sqrt{2}}{2}' },
  { t: Math.PI, label: '\\pi', cosTex: '-1', sinTex: '0' },
];

/** La valeur remarquable la plus proche de t, si t en est très proche. */
export function snapRemarkable(t, eps = 1e-6) {
  const p = principal(t);
  return REMARKABLE.find((r) => Math.abs(r.t - p) < eps) ?? null;
}

/**
 * Solutions de cos t = a sur [0 ; 2π[ — zéro, une ou DEUX, et c'est tout
 * l'enjeu : l'élève qui n'en donne qu'une a oublié la symétrie du cercle.
 */
export function solveCos(a) {
  if (a < -1 || a > 1) return [];
  const t = Math.acos(a);
  if (Math.abs(a - 1) < 1e-12) return [0];
  if (Math.abs(a + 1) < 1e-12) return [Math.PI];
  return [t, TAU - t];
}

/** Solutions de sin t = b sur [0 ; 2π[ : symétrie par rapport à l'axe VERTICAL. */
export function solveSin(b) {
  if (b < -1 || b > 1) return [];
  const t = Math.asin(b);
  if (Math.abs(b - 1) < 1e-12) return [Math.PI / 2];
  if (Math.abs(b + 1) < 1e-12) return [(3 * Math.PI) / 2];
  return b >= 0 ? [t, Math.PI - t] : [principal(t), Math.PI - t].sort((x, y) => x - y);
}

/** Formatage français d'un réel, pour les lectures approchées. */
export const fr = (v, dp = 2) => v.toFixed(dp).replace('.', ',').replace('-', '−');
