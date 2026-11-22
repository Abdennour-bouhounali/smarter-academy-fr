import { currentScene } from './transformState.js';
import { finalFigure } from './transformModel.js';
import * as M from './transformMath.js';

/**
 * Le RÉSUMÉ d'un document du مختبر التحويلات : la figure et son image, en
 * coordonnées, plus le nom des transformations posées.
 *
 * La vignette de « أعمالي » dessine les deux contours — c'est exactement ce
 * qui distingue deux documents de cet instrument l'un de l'autre — et la
 * recherche trouve « دوران » en cherchant le nom d'une transformation.
 *
 * `kind: 'shapes'` est une FORME d'aperçu nouvelle : aucune des huit
 * existantes ne dessine deux polygones superposés (MATH_LAB §5i.2). Le
 * dessin correspondant est ajouté à `work/WorkPreview.jsx`.
 *
 * La fonction est PURE et ne jette jamais : `summarizeDocument` (toolContract)
 * attrape de toute façon, mais une vignette ne vaut pas un travail perdu.
 *
 * @param {object} data
 * @returns {import('../../toolContract.js').MathLabSummary | null}
 */
export function summarizeTransformations(data) {
  const history = Array.isArray(data?.history) ? data.history : [];
  if (history.length === 0) return null;

  let scene;
  try {
    scene = currentScene({
      history,
      cursor: Number.isInteger(data?.cursor) ? Math.max(0, Math.min(history.length - 1, data.cursor)) : history.length - 1,
    });
  } catch {
    return null;
  }

  const figure = scene?.figures?.[0];
  if (!figure || !Array.isArray(figure.vertices) || figure.vertices.length === 0) return null;

  const source = figure.vertices.filter(M.isPoint).slice(0, 12);
  if (source.length === 0) return null;

  let image = [];
  try {
    image = finalFigure(source, scene.steps ?? []).filter(M.isPoint);
  } catch {
    image = [];
  }

  const kinds = (Array.isArray(scene.steps) ? scene.steps : [])
    .filter((step) => step?.enabled !== false)
    .map((step) => step?.kind)
    .filter(Boolean);

  return {
    kind: 'shapes',
    // Ce que la RECHERCHE lit : les familles posées, sans doublon.
    text: [...new Set(kinds)].slice(0, 6),
    detail: {
      c: typeof figure.color === 'string' ? figure.color : '#2563eb',
      // `a` : l'original. `b` : l'image, omise quand rien n'a bougé.
      a: source.map(round),
      b: M.sameVertices(source, image) ? [] : image.slice(0, 12).map(round),
    },
  };
}

const round = (point) => ({ x: Math.round(point.x * 100) / 100, y: Math.round(point.y * 100) / 100 });
