/**
 * LA DÉRIVÉE NUMÉRIQUE — logique pure, sans DOM, sans calcul formel.
 *
 * Le mode « المماس » du grapheur ne dérive pas de formule : il MESURE la pente. En un point x,
 * la différence centrée  D(h) = (f(x+h) − f(x−h)) / 2h  est corrigée par
 * extrapolation de Richardson,  D = (4·D(h/2) − D(h)) / 3 , ce qui donne une
 * erreur en O(h⁴) : pour x², x³, sin, cos, exp, la valeur affichée est
 * exacte aux décimales montrées. `h` suit l'échelle de x (1e-4·max(1, |x|)).
 *
 * Trois cas où l'on REFUSE de rendre un nombre (`{ ok: false, reason }`) :
 *   - `undefined`  : f n'est pas finie en x, ou juste à côté (x hors du
 *                    domaine, bord du domaine — √x en 0, 1/x en 0) ;
 *   - `corner`     : les pentes à gauche et à droite ne se rejoignent pas
 *                    (|x| en 0). On le détecte en comparant leur écart à deux
 *                    pas : pour une fonction lisse il se divise par deux quand
 *                    h se divise par deux ; à un point anguleux il reste ;
 *   - `unstable`   : le résultat n'est pas fini.
 *
 * Ce que ce procédé ne sait pas : distinguer une fonction très courbée d'un
 * angle à l'échelle de h (une oscillation de période < 1e-3 autour de x),
 * ni « voir » une discontinuité de saut exactement entre x−h et x+h — la
 * pente mesurée y serait immense, et le tracé de f′ la coupe comme un pôle.
 */

import { isContinuous } from './functionSampler.js';

const finite = Number.isFinite;

/** Le pas relatif de la différence centrée. */
const DERIVATIVE_STEP = 1e-4;
/** Au-delà de cet écart RELATIF entre pentes gauche et droite (qui ne se résorbe pas), c'est un angle. */
const CORNER_TOLERANCE = 1e-3;

/**
 * @param {(x: number) => number} fn
 * @param {number} x
 * @returns {{ok: true, value: number} | {ok: false, reason: 'undefined' | 'corner' | 'unstable'}}
 */
export function derivativeAt(fn, x) {
  if (!finite(x)) return { ok: false, reason: 'undefined' };
  const y = fn(x);
  if (!finite(y)) return { ok: false, reason: 'undefined' };
  const h = DERIVATIVE_STEP * Math.max(1, Math.abs(x));
  const h2 = h / 2;
  const yPlus = fn(x + h);
  const yMinus = fn(x - h);
  const yPlus2 = fn(x + h2);
  const yMinus2 = fn(x - h2);
  if (!finite(yPlus) || !finite(yMinus) || !finite(yPlus2) || !finite(yMinus2)) return { ok: false, reason: 'undefined' };

  // Pentes à droite et à gauche, aux deux pas : un angle se voit à leur écart qui ne se résorbe pas.
  const right = (yPlus - y) / h;
  const left = (y - yMinus) / h;
  const right2 = (yPlus2 - y) / h2;
  const left2 = (y - yMinus2) / h2;
  const gap = Math.abs(right - left);
  const gap2 = Math.abs(right2 - left2);
  const scale = 1 + Math.abs(right2) + Math.abs(left2);
  if (gap2 > CORNER_TOLERANCE * scale && gap2 > 0.6 * gap) return { ok: false, reason: 'corner' };

  const central = (yPlus - yMinus) / (2 * h);
  const central2 = (yPlus2 - yMinus2) / (2 * h2);
  // À moins d'un pas d'un angle, les deux différences centrées ne s'accordent
  // plus (une fonction lisse les fait coïncider à O(h²) près) : on refuse.
  if (Math.abs(central - central2) > CORNER_TOLERANCE * scale) return { ok: false, reason: 'corner' };
  const value = (4 * central2 - central) / 3;
  if (!finite(value)) return { ok: false, reason: 'unstable' };

  return { ok: true, value };
}

/** f ↦ f′ comme fonction traçable : NaN partout où la dérivée n'est pas un nombre (le traceur y coupe). */
export function derivativeFunction(fn) {
  return (x) => {
    const result = derivativeAt(fn, x);

    return result.ok ? result.value : NaN;
  };
}

/**
 * La tangente en a : y = f(a) + f′(a)·(x − a), comme point + pente,
 * ou null si elle n'existe pas.
 */
export function tangentAt(fn, a) {
  const y = fn(a);
  const slope = derivativeAt(fn, a);
  if (!finite(y) || !slope.ok) return null;

  return { x: a, y, slope: slope.value };
}

/**
 * Un déplacement de A le long de f, de `current` à `next` : refusé (on
 * rend `current`) si f n'existe pas en `next`, ou si f ne passe pas
 * CONTINÛMENT de l'un à l'autre — même sonde que le traceur. 1/x ne se
 * franchit pas en 0 avec le doigt, comme sa courbe ne le franchit pas.
 */
export function constrainAlongCurve(fn, current, next, ySpan = 10) {
  if (next === current) return next;
  const y1 = fn(next);
  if (!finite(y1)) return current;
  const y0 = fn(current);
  // Un quart de la hauteur visible : un pas de doigt qui saute plus que cela
  // est sondé ; s'il cache un pôle, A reste où il est.
  if (finite(y0) && Math.abs(y1 - y0) > ySpan / 4 && !isContinuous(fn, current, y0, next, y1)) return current;

  return next;
}
