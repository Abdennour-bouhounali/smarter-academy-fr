/**
 * L'ÉCHANTILLONNEUR : une fonction `x ↦ f(x)` et une fenêtre → des MORCEAUX
 * de courbe (polylignes en coordonnées mathématiques), prêts à être tracés.
 *
 * On ne relie JAMAIS deux échantillons aveuglément. Trois règles :
 *
 *  1. Une valeur non finie (NaN, ±∞) coupe la courbe : `1/x` en 0, `sqrt(x)`
 *     pour x < 0, `ln(x)` pour x ≤ 0.
 *  2. Un SAUT plus haut que la fenêtre entre deux échantillons voisins est
 *     suspect. On sonde le milieu (jusqu'à `PROBE_DEPTH` fois) : si les
 *     valeurs intermédiaires restent entre les deux extrémités, la fonction
 *     est simplement raide et on relie ; sinon c'est une asymptote (`1/x`,
 *     `tan x`) et on coupe. Une droite très pentue passe, un pôle non.
 *  3. À la frontière du domaine (un échantillon fini à côté d'un non fini),
 *     on cherche le bord par dichotomie pour que `sqrt(x)` parte de (0, 0),
 *     pas d'un pixel plus loin.
 *
 * Les ordonnées très grandes sont RAMENÉES à une bande hors écran
 * (`CLAMP_FACTOR` fois la hauteur de la fenêtre) : le SVG ne reçoit jamais
 * 1e300, et comme la bande est invisible, rien de ce qui se voit ne change.
 *
 * Densité : `SAMPLES_PER_PIXEL` échantillons par pixel de large. Une
 * oscillation plus fine qu'un pixel (sin(1/x) près de 0, sin(1000x)) ne
 * peut pas être représentée fidèlement — limitation assumée et documentée.
 */

const SAMPLES_PER_PIXEL = 1.5;
const MIN_SAMPLES = 64;
const MAX_SAMPLES = 4000;
const PROBE_DEPTH = 4;
export const CLAMP_FACTOR = 2;
const EDGE_BISECTIONS = 14;

const finite = Number.isFinite;

/**
 * @param {(x: number) => number} fn
 * @param {{xMin: number, xMax: number, yMin: number, yMax: number}} view   la fenêtre visible
 * @param {number} pixelWidth                                                 la largeur du tracé en pixels
 * @param {{domain?: {min?: number, max?: number} | null, scope?: object}} [options]
 * @returns {Array<Array<[number, number]>>}  des polylignes ; chacune a au moins deux points
 */
export function sampleFunction(fn, view, pixelWidth, options = {}) {
  const domain = options.domain ?? null;
  const xMin = Math.max(view.xMin, finite(domain?.min) ? domain.min : -Infinity);
  const xMax = Math.min(view.xMax, finite(domain?.max) ? domain.max : Infinity);
  if (!(xMax > xMin)) return [];

  const ySpan = Math.max(view.yMax - view.yMin, Number.EPSILON);
  const yLow = view.yMin - CLAMP_FACTOR * ySpan;
  const yHigh = view.yMax + CLAMP_FACTOR * ySpan;
  const clampY = (y) => (y < yLow ? yLow : y > yHigh ? yHigh : y);
  const evaluate = (x) => {
    const y = fn(x, options.scope);

    return typeof y === 'number' ? y : NaN;
  };

  const count = Math.min(MAX_SAMPLES, Math.max(MIN_SAMPLES, Math.round(pixelWidth * SAMPLES_PER_PIXEL)));
  const step = (xMax - xMin) / count;
  const xs = new Array(count + 1);
  const ys = new Array(count + 1);
  for (let i = 0; i <= count; i += 1) {
    const x = i === count ? xMax : xMin + i * step;
    xs[i] = x;
    ys[i] = evaluate(x);
  }

  const segments = [];
  let current = [];
  const close = () => {
    // Un morceau se trace s'il a une ÉTENDUE : deux points de même abscisse
    // (une fonction définie en un seul point) ne sont pas une courbe.
    if (current.length >= 2 && current[current.length - 1][0] - current[0][0] > 0) segments.push(current);
    current = [];
  };

  for (let i = 0; i <= count; i += 1) {
    const x = xs[i];
    const y = ys[i];

    if (!finite(y)) {
      // Le bord du domaine, si la courbe existait juste avant.
      if (current.length > 0) {
        const edge = findEdge(evaluate, xs[i - 1], x);
        if (edge) current.push([edge[0], clampY(edge[1])]);
      }
      close();
      continue;
    }

    if (current.length === 0 && i > 0 && !finite(ys[i - 1])) {
      // La courbe (re)commence : le bord exact d'abord.
      const edge = findEdge(evaluate, x, xs[i - 1]);
      if (edge) current.push([edge[0], clampY(edge[1])]);
    } else if (current.length > 0) {
      const previousY = ys[i - 1];
      if (Math.abs(y - previousY) > ySpan && !isContinuous(evaluate, xs[i - 1], previousY, x, y, PROBE_DEPTH)) {
        close();
      }
    }

    current.push([x, clampY(y)]);
  }
  close();

  return segments;
}

/**
 * Entre deux échantillons finis dont l'écart est suspect : la fonction
 * passe-t-elle CONTINÛMENT de y0 à y1 ? Vrai si chaque milieu sondé reste
 * entre ses deux extrémités (une pente raide), faux dès qu'un milieu est
 * non fini ou sort de l'intervalle (un pôle).
 */
export function isContinuous(evaluate, x0, y0, x1, y1, depth = PROBE_DEPTH) {
  const xm = (x0 + x1) / 2;
  const ym = evaluate(xm);
  if (!finite(ym)) return false;
  const low = Math.min(y0, y1);
  const high = Math.max(y0, y1);
  // Strictement entre les deux, au bruit numérique près : un milieu AU-DELÀ
  // des extrémités est de l'autre côté d'un pôle.
  const tolerance = (high - low) * 1e-9 + 1e-12;
  if (ym >= low - tolerance && ym <= high + tolerance) return true;
  if (depth <= 0) return false;

  return isContinuous(evaluate, x0, y0, xm, ym, depth - 1) && isContinuous(evaluate, xm, ym, x1, y1, depth - 1);
}

/**
 * Dichotomie entre un x où f est finie (`xInside`) et un x où elle ne l'est
 * pas (`xOutside`) : le dernier point fini trouvé, ou null si f n'est finie
 * nulle part entre les deux.
 */
function findEdge(evaluate, xInside, xOutside) {
  let inside = xInside;
  let outside = xOutside;
  let best = null;
  let yInside = evaluate(inside);
  if (finite(yInside)) best = [inside, yInside];
  for (let k = 0; k < EDGE_BISECTIONS; k += 1) {
    const mid = (inside + outside) / 2;
    const yMid = evaluate(mid);
    if (finite(yMid)) {
      inside = mid;
      yInside = yMid;
      best = [mid, yMid];
    } else {
      outside = mid;
    }
  }

  return best;
}
