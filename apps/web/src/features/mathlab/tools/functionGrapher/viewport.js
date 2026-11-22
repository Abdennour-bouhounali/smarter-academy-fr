/**
 * LA FENÊTRE (viewport) du grapheur — logique pure.
 *
 * Une fenêtre est un rectangle du plan : `{ xMin, xMax, yMin, yMax }`. C'est
 * un ÉTAT explicite, jamais une transformation cachée dans un moteur : le
 * document l'enregistre, une leçon pourra l'imposer, l'explorateur de
 * dérivée de demain la lira. Toute interaction (glisser, molette, pincer,
 * clavier, boutons) est une fonction pure fenêtre → fenêtre.
 *
 * Le repère est ORTHONORMÉ : une unité en x fait autant de pixels qu'une
 * unité en y. `fitViewportToAspect` élargit l'axe le plus court pour que la
 * fenêtre épouse la boîte de pixels sans déformer le plan.
 */

export const DEFAULT_VIEWPORT = Object.freeze({ xMin: -8, xMax: 8, yMin: -6, yMax: 6 });

/** Les bornes de zoom : une fenêtre ne descend pas sous 1e-3 unités ni ne dépasse 1e6. */
export const MIN_SPAN = 1e-3;
const MAX_SPAN = 1e6;

const finite = Number.isFinite;

export function isValidViewport(view) {
  return Boolean(view)
    && finite(view.xMin) && finite(view.xMax) && finite(view.yMin) && finite(view.yMax)
    && view.xMax - view.xMin >= MIN_SPAN && view.yMax - view.yMin >= MIN_SPAN
    && view.xMax - view.xMin <= MAX_SPAN && view.yMax - view.yMin <= MAX_SPAN;
}

/** Une fenêtre enregistrée (ou une amorce de leçon) → une fenêtre sûre. */
export function normalizeViewport(view) {
  if (!isValidViewport(view)) return { ...DEFAULT_VIEWPORT };

  return { xMin: view.xMin, xMax: view.xMax, yMin: view.yMin, yMax: view.yMax };
}

/**
 * Élargit (jamais ne rétrécit) la fenêtre pour que xSpan / ySpan = width / height,
 * autour de son centre. Repère orthonormé garanti.
 */
export function fitViewportToAspect(view, width, height) {
  if (!(width > 0) || !(height > 0)) return { ...view };
  const aspect = width / height;
  const xSpan = view.xMax - view.xMin;
  const ySpan = view.yMax - view.yMin;
  const xCenter = (view.xMin + view.xMax) / 2;
  const yCenter = (view.yMin + view.yMax) / 2;
  if (xSpan / ySpan > aspect) {
    const half = xSpan / aspect / 2;

    return { xMin: view.xMin, xMax: view.xMax, yMin: yCenter - half, yMax: yCenter + half };
  }
  const half = (ySpan * aspect) / 2;

  return { xMin: xCenter - half, xMax: xCenter + half, yMin: view.yMin, yMax: view.yMax };
}

/**
 * Après un redimensionnement : on garde l'étendue en x (ce que l'élève a
 * choisi) et on recalcule y autour de son centre — sans élargir sans fin.
 */
export function resizeViewport(view, width, height) {
  if (!(width > 0) || !(height > 0)) return { ...view };
  const xSpan = view.xMax - view.xMin;
  const yCenter = (view.yMin + view.yMax) / 2;
  const half = (xSpan * height) / width / 2;

  return { xMin: view.xMin, xMax: view.xMax, yMin: yCenter - half, yMax: yCenter + half };
}

/** Déplacement en UNITÉS du plan (dx > 0 : le contenu part vers la droite… donc la fenêtre vers la gauche). */
export function panViewport(view, dxUnits, dyUnits) {
  return { xMin: view.xMin + dxUnits, xMax: view.xMax + dxUnits, yMin: view.yMin + dyUnits, yMax: view.yMax + dyUnits };
}

/**
 * Zoom d'un facteur (`factor` < 1 : on rapproche) autour d'un point du plan,
 * qui reste fixe sous le curseur. Borné par MIN_SPAN / MAX_SPAN.
 */
export function zoomViewport(view, factor, at = null) {
  const xSpan = view.xMax - view.xMin;
  const ySpan = view.yMax - view.yMin;
  let f = factor;
  if (!(f > 0) || !finite(f)) return { ...view };
  if (xSpan * f < MIN_SPAN) f = MIN_SPAN / xSpan;
  if (xSpan * f > MAX_SPAN) f = MAX_SPAN / xSpan;
  if (ySpan * f < MIN_SPAN) f = Math.max(f, MIN_SPAN / ySpan);
  if (ySpan * f > MAX_SPAN) f = Math.min(f, MAX_SPAN / ySpan);
  const [ax, ay] = at ?? [(view.xMin + view.xMax) / 2, (view.yMin + view.yMax) / 2];

  return {
    xMin: ax - (ax - view.xMin) * f,
    xMax: ax + (view.xMax - ax) * f,
    yMin: ay - (ay - view.yMin) * f,
    yMax: ay + (view.yMax - ay) * f,
  };
}

/** Un point en pixels (origine en haut à gauche de la boîte) → coordonnées du plan. */
export function pixelToMath(view, width, height, px, py) {
  return [
    view.xMin + (px / width) * (view.xMax - view.xMin),
    view.yMax - (py / height) * (view.yMax - view.yMin),
  ];
}

/** Coordonnées du plan → pixels dans la boîte. */
export function mathToPixel(view, width, height, x, y) {
  return [
    ((x - view.xMin) / (view.xMax - view.xMin)) * width,
    ((view.yMax - y) / (view.yMax - view.yMin)) * height,
  ];
}

/** Deux fenêtres « égales » à la précision d'un tracé — pour ne pas sauver un rien. */
export function sameViewport(a, b, epsilon = 1e-9) {
  if (!a || !b) return a === b;

  return Math.abs(a.xMin - b.xMin) < epsilon && Math.abs(a.xMax - b.xMax) < epsilon
    && Math.abs(a.yMin - b.yMin) < epsilon && Math.abs(a.yMax - b.yMax) < epsilon;
}
