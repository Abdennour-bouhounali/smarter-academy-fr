import { PARAM_SYMBOLS, getShape, isShapeId } from './geometryState.js';

/**
 * Le RÉSUMÉ d'un document de géométrie dans l'espace. Le solide et ses
 * dimensions — c'est tout ce qu'il faut pour que « أعمالي » dessine sa
 * silhouette en SVG, sans jamais monter une scène three.js pour une vignette.
 *
 * @param {object} data
 * @returns {import('../../toolContract.js').MathLabSummary | null}
 */
export function summarizeGeometry3D(data) {
  // `getShape` retombe sur le cube pour un identifiant inconnu : un document
  // dont le solide ne veut rien dire n'a pas d'aperçu plutôt qu'un faux cube.
  if (!isShapeId(data?.shape)) return null;
  const shape = getShape(data.shape);
  const dimensions = data?.dimensions && typeof data.dimensions === 'object' ? data.dimensions : {};

  // « a = 2 », « r = 1.5 · h = 3 » : ce que l'élève lit sous la miniature.
  const text = shape.params
    .filter((param) => Number.isFinite(dimensions[param]))
    .map((param) => `${PARAM_SYMBOLS[param] ?? param} = ${dimensions[param]}`);

  return {
    kind: 'solid',
    // Le nom du solide est cherché par son libellé arabe (la carte le
    // connaît par le registre) ; ici on donne les dimensions.
    text,
    detail: {
      shape: shape.id,
      dimensions: Object.fromEntries(shape.params.map((param) => [param, dimensions[param] ?? null])),
    },
  };
}
