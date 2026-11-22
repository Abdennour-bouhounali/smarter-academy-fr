/**
 * LES COUCHES (§30) — le vocabulaire visuel de l'instrument.
 *
 * Ce module ne contient QUE la liste des couches et leur état d'ouverture.
 * Il vit à part de `trigState.js` pour une raison simple : les préréglages
 * (`presets.js`) ont besoin de la liste, et l'état a besoin des préréglages.
 * Mettre la liste dans l'état créerait un cycle d'imports — et un cycle en
 * ESM ne casse pas au chargement du module fautif, mais plus tard, sur un
 * `Object.keys(undefined)` incompréhensible. La liste est donc la FEUILLE
 * du graphe : elle n'importe rien.
 *
 * ── Pourquoi ces valeurs d'ouverture ─────────────────────────────────────
 * §30 : « Do not overcrowd the screen by default. Use progressive
 * disclosure. » §46 veut qu'en une seconde l'élève comprenne : il y a un
 * cercle, un point, il bouge, les valeurs suivent. Tout ce qui ne sert pas
 * cette phrase attend d'être demandé — la tangente, les deux graphes, les
 * marqueurs d'angles remarquables, l'indicateur de quadrant.
 */

export const DEFAULT_LAYERS = Object.freeze({
  axes: true,
  grid: true,
  circle: true,
  arc: true,
  radius: true,
  triangle: false,
  projections: true,
  coordinates: true,
  sinSegment: true,
  cosSegment: true,
  tangentLine: false,
  sineGraph: false,
  cosineGraph: false,
  values: true,
  quadrant: false,
  specialMarkers: false,
});

export const LAYER_KEYS = Object.freeze(Object.keys(DEFAULT_LAYERS));

/**
 * L'ordre des bascules dans le panneau, groupées comme on les pense : le
 * repère, puis le cercle, puis les lectures, puis les graphes. Un panneau
 * qui suit l'ordre alphabétique de l'objet ferait lire « arc, axes,
 * circle… » — l'ordre du code, pas celui de l'élève.
 */
export const LAYER_GROUPS = Object.freeze([
  { id: 'frame', keys: ['axes', 'grid', 'circle', 'specialMarkers'] },
  { id: 'angle', keys: ['arc', 'radius', 'triangle', 'quadrant'] },
  { id: 'readings', keys: ['projections', 'coordinates', 'sinSegment', 'cosSegment', 'tangentLine', 'values'] },
  { id: 'graphs', keys: ['sineGraph', 'cosineGraph'] },
]);
