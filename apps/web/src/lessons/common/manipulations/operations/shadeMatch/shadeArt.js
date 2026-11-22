/**
 * La géométrie et la couleur PURES de « آلة مزج الألوان » (`shade-match`, thème `paintshop`). Rien ici ne juge : le verdict est dans `logic/shadeMatch.js`.
 *
 * LA COULEUR est HONNÊTE : elle dérive de la part de bleu exacte t = c / (c + d) (`logic/shadeMatch.js › depth`), un mélange LINÉAIRE du blanc de la boîte
 * (`WHITE`) vers le bleu du club (`BLUE`). Deux rapports égaux donnent donc la MÊME couleur au bit près ; 3/4 et 7/10 diffèrent d'environ 2 % de part de bleu :
 * l'œil ne tranche pas, l'aiguille tranche.
 */
const WHITE = [244, 247, 252];
const BLUE = [29, 78, 216];
const hex = (n) => Math.round(n).toString(16).padStart(2, '0');

/** `depth` ∈ [0, 1] → '#rrggbb'. */
export function shadeColor(depth) {
  const d = Math.max(0, Math.min(1, depth));
  return `#${[0, 1, 2].map((i) => hex(WHITE[i] + (BLUE[i] - WHITE[i]) * d)).join('')}`;
}

export const METER = Object.freeze({ w: 220, h: 118, cx: 110, cy: 104, r: 84, maxDeg: 62 });

/** L'angle (degrés, 0 = vertical, > 0 vers « أغمق ») de l'aiguille pour une position ∈ [−1, 1]. */
export const needleDeg = (pos) => Math.max(-1, Math.min(1, pos)) * METER.maxDeg;

/** Le point de l'arc du mesureur à l'angle `deg` et au rayon `r`. */
export function meterPoint(deg, r = METER.r) {
  const a = (deg * Math.PI) / 180;
  return { x: METER.cx + Math.sin(a) * r, y: METER.cy - Math.cos(a) * r };
}

/** Les graduations d'un verdict (une mesure essayée) : la position d'un tick sur l'arc — plus clair à gauche, plus foncé à droite, au plus près du centre si pile. */
export function tickDeg(verdict, pos) {
  if (verdict === 'match') return 0;
  return needleDeg(pos);
}

/** Le seau B : le niveau du liquide (0 … 1 de la hauteur utile) pour c + d mesures, de 0,18 à 0,90 (50 mesures) ; jamais vide. */
export const liquidLevel = (c, d) => 0.18 + 0.72 * Math.min(1, (c + d) / 50);

/** Les barrettes de comptage : d blanches à gauche, c bleues à droite, du fond vers le haut ; `max` barrettes par colonne selon la hauteur utile. */
export function tallyRungs(n, height, step = 2.1) {
  const per = Math.floor(height / step);
  return Array.from({ length: Math.min(n, per) }, (_, i) => i * step);
}
