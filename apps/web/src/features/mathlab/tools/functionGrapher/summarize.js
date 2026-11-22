import { MAX_FUNCTIONS } from './grapherState.js';

/**
 * Le RÉSUMÉ d'un document du grapheur — quelques centaines d'octets qui
 * suffisent à « أعمالي » pour dessiner une vraie miniature et pour trouver
 * « x^2 » dans une recherche, SANS charger mafs, MathLive ni l'analyseur.
 *
 * On garde les EXPRESSIONS (c'est ce qu'on reconnaît d'un coup d'œil et ce
 * qu'on cherche), leur couleur (la miniature est lisible parce qu'elle
 * reprend les couleurs du document) et la fenêtre (une courbe dessinée hors
 * de sa fenêtre ne ressemble à rien). Jamais les points échantillonnés : la
 * miniature les recalcule, six fois moins finement.
 *
 * @param {object} data  l'état sérialisé du grapheur
 * @returns {import('../../toolContract.js').MathLabSummary | null}
 */
export function summarizeFunctionGrapher(data) {
  const functions = Array.isArray(data?.functions) ? data.functions.slice(0, MAX_FUNCTIONS) : [];
  const visible = functions.filter((fn) => fn?.visible !== false && typeof fn?.expression === 'string' && fn.expression.trim() !== '');
  if (visible.length === 0) return null;

  return {
    kind: 'curve',
    // Ce que la recherche lit : « f(x) = x^2 » se trouve en tapant « x^2 ».
    text: visible.map((fn) => `${fn.name ?? 'f'}(x) = ${fn.expression}`).slice(0, 6),
    detail: {
      curves: visible.map((fn) => ({ e: String(fn.expression).slice(0, 60), c: fn.color ?? '#2563eb' })),
      viewport: viewportOf(data?.viewport),
      points: Array.isArray(data?.points) ? data.points.length : 0,
      tangent: data?.tangent?.enabled === true,
    },
  };
}

/** La fenêtre, arrondie : l'aperçu n'a pas besoin de quinze décimales. */
function viewportOf(viewport) {
  if (!viewport || typeof viewport !== 'object') return null;
  const { xMin, xMax, yMin, yMax } = viewport;
  if (![xMin, xMax, yMin, yMax].every((v) => Number.isFinite(v))) return null;

  return { xMin: round(xMin), xMax: round(xMax), yMin: round(yMin), yMax: round(yMax) };
}

const round = (v) => Math.round(v * 100) / 100;
