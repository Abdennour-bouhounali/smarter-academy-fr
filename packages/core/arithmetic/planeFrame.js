/**
 * LE MAÎTRE ORTHOGONAL DU PLAN sous le « مسيّرة الساحة » (1AM, unité 5 « الأعداد النسبية », درس « التعليم في المستوي », 2026-10-30) — arithmétique ENTIÈRE exacte, sans virgule flottante.
 *
 * Une coordonnée est un entier en DIXIÈMES d'unité (comme `graduatedLine.js`, dont `fmt` / `tex` sont repris) : 15 = 1,5 ; −30 = −3. Un POINT du plan est `{ x, y }` : la فاصلة (abscisse, lue sur l'axe horizontal) puis
 * le ترتيب (ordonnée, lu sur l'axe vertical) — l'ORDRE compte : (3 ; −2) et (−2 ; 3) sont deux endroits différents. Les lectures du labo sont : le point avec ses deux nombres dans l'ordre, la position sur un axe
 * (ordonnée nulle / abscisse nulle), le point aux nombres échangés, les symétriques par rapport aux axes, le même quart de plan (mêmes signes), l'origine d'un repère caché.
 * Importé PAR CHEMIN (`@smarter-academy/core/arithmetic/planeFrame.js`), jamais par le barrel du cœur (BUNDLE_BOUNDARIES §4).
 */
import { TENTH, fmt, tex } from './graduatedLine.js';

export { TENTH, fmt, tex };

/** Deux points sont les mêmes quand leurs deux coordonnées le sont. */
export const same = (p, q) => p.x === q.x && p.y === q.y;
/** Le point aux deux nombres ÉCHANGÉS : (3 ; −2) → (−2 ; 3) — l'erreur d'ordre. */
export const swap = (p) => ({ x: p.y, y: p.x });
/** Échanger ne change rien quand les deux nombres sont égaux. */
export const swapIsSame = (p) => p.x === p.y;
/** Où est le point par rapport aux axes : `x` (sur l'axe des abscisses : ordonnée nulle), `y` (sur l'axe des ordonnées : abscisse nulle), `origin`, ou `null`. */
export function onAxis(p) {
  if (p.x === 0 && p.y === 0) return 'origin';
  if (p.y === 0) return 'x';
  if (p.x === 0) return 'y';
  return null;
}
/** Le symétrique par rapport à l'axe des abscisses (garde l'abscisse, change le signe de l'ordonnée), à l'axe des ordonnées, à l'origine — jamais −0. */
const neg = (t) => (t === 0 ? 0 : -t);
export const reflectX = (p) => ({ x: p.x, y: neg(p.y) });
export const reflectY = (p) => ({ x: neg(p.x), y: p.y });
export const reflectO = (p) => ({ x: neg(p.x), y: neg(p.y) });
/** Le quart de plan numéroté comme le repère habituel : 1 (+ ; +), 2 (− ; +), 3 (− ; −), 4 (+ ; −) ; `null` si le point est sur un axe. */
export function quadrant(p) {
  if (p.x === 0 || p.y === 0) return null;
  return p.x > 0 ? (p.y > 0 ? 1 : 4) : (p.y > 0 ? 2 : 3);
}
/** Deux points d'un même quart de plan (hors axes) ont les mêmes signes. */
export const sameQuadrant = (p, q) => quadrant(p) !== null && quadrant(p) === quadrant(q);
export const sameAbscissa = (p, q) => p.x === q.x;
export const sameOrdinate = (p, q) => p.y === q.y;
/** Le tick entier à gauche (ou au-dessous) d'une coordonnée, en dixièmes : −15 → −20 ; 25 → 20 ; un tick est son propre plancher. */
export const floorTick = (t) => Math.floor(t / TENTH) * TENTH;
/** Le nombre de coordonnées EXACTES d'une lecture (0, 1 ou 2) — pour dire « une seule coordonnée est juste ». */
export const matching = (p, q) => (p.x === q.x ? 1 : 0) + (p.y === q.y ? 1 : 0);
/** Le point est-il dans le cadre du labo (|x| ≤ mx, |y| ≤ my, en dixièmes) ? */
export const inBox = (p, mx, my) => Math.abs(p.x) <= mx && Math.abs(p.y) <= my;
/** Un point écrit à la manière du livre : « (−3 ; 2) » (écran) et « (-3\,;\,2) » (KaTeX). */
export const pair = (p) => `(${fmt(p.x)} ; ${fmt(p.y)})`;
export const pairTex = (p) => `(${tex(p.x)}\\,;\\,${tex(p.y)})`;
/** La COURONNE carrée d'un point : max(|x|, |y|), en dixièmes — la cible du jet de sacs. */
export const ring = (p) => Math.max(Math.abs(p.x), Math.abs(p.y));
/** Les points d'un jet selon des couronnes carrées : `rings` = [[couronne maximale en dixièmes, points]…] triées ; au-delà de la dernière : 0 point. */
export function score(p, rings) {
  const r = ring(p);
  for (const [max, pts] of rings) if (r <= max) return pts;
  return 0;
}
/** L'ORIGINE d'un repère caché : une case est repérée par (colonne, ligne) sur la grille, un point connu a pour coordonnées (a ; b) en unités ; l'origine est à (colonne − a, ligne + b) (la ligne croît vers le bas). */
export const originFrom = (cell, coords) => ({ col: cell.col - coords.x, row: cell.row + coords.y });
/** Les coordonnées (en unités) d'une case (colonne, ligne) quand l'origine est à `origin` : la ligne croît vers le BAS sur la grille, l'ordonnée vers le HAUT. */
export const coordsOfCell = (cell, origin) => ({ x: cell.col - origin.col, y: origin.row - cell.row });
