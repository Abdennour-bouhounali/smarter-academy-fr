import { normalizeTree, pathsOf, validateTree } from './probabilityTree.js';
import { toNumber } from '../algebra/rational.js';
import { sampleCurve } from './normalDistribution.js';
import { normalizeNormal } from './probabilityState.js';

/**
 * Le RÉSUMÉ d'un document d'احتمالات وإحصاء : l'expérience (ou la série),
 * et les EFFECTIFS déjà obtenus — quelques nombres, jamais les tirages.
 * La miniature en fait un diagramme en barres, dessiné en SVG comme
 * l'instrument lui-même le fait (aucune bibliothèque de graphiques).
 *
 * @param {object} data
 * @returns {import('../../toolContract.js').MathLabSummary | null}
 */
export function summarizeProbabilityStats(data) {
  try {
    return summarizeUnsafe(data);
  } catch {
    // Un résumé ne coûte jamais un document : un état illisible n'a pas de miniature.
    return null;
  }
}

function summarizeUnsafe(data) {
  if (data?.mode === 'tree') return summarizeTree(data.tree);
  if (data?.mode === 'normal') return summarizeNormal(data.normal);
  const mode = data?.mode === 'dataset' ? 'dataset' : 'experiment';

  if (mode === 'dataset') {
    const values = parseDataset(data?.dataset);
    if (values.length === 0) return null;

    return {
      kind: 'chart',
      text: [`${values.length}`],
      detail: { mode: 'dataset', bars: histogram(values), count: values.length },
    };
  }

  const counts = data?.simulation?.counts;
  const experiment = typeof data?.experiment === 'string' ? data.experiment : null;
  if (!experiment) return null;

  const bars = normalizeCounts(counts);

  return {
    kind: 'chart',
    text: [experiment],
    detail: {
      mode: 'experiment',
      experiment,
      bars,
      draws: Number.isFinite(data?.simulation?.total) ? data.simulation.total : 0,
    },
  };
}

/**
 * L'arbre : une barre par chemin complet, sa probabilité — la miniature
 * montre la LOI des issues. Un arbre pas encore valide n'a pas de loi :
 * plateau vide, jamais de fausses barres.
 */
function summarizeTree(raw) {
  const tree = normalizeTree(raw);
  const validation = validateTree(tree);
  const paths = pathsOf(tree, validation);
  const bars = validation.valid ? paths.slice(0, 64).map((p) => Math.round(toNumber(p.product) * 1000) / 1000) : [];

  return {
    kind: 'chart',
    text: [`${paths.length}`],
    detail: { mode: 'tree', bars, stages: tree.stages, leaves: paths.length },
  };
}

/** La loi normale : sa cloche, en seize barres (la densité échantillonnée sur μ ± 4σ). */
function summarizeNormal(raw) {
  const normal = normalizeNormal(raw);
  const curve = sampleCurve(normal.mu, normal.sigma, 'z', 16);
  const bars = curve.points.map((point) => Math.round(point.y * 1000) / 1000);

  return {
    kind: 'chart',
    text: [`N(${normal.mu}, ${normal.sigma}²)`],
    detail: { mode: 'normal', bars, mu: normal.mu, sigma: normal.sigma, query: normal.query },
  };
}

/** Les effectifs, quelle que soit la forme où l'instrument les a rangés. */
function normalizeCounts(counts) {
  if (Array.isArray(counts)) return counts.filter(Number.isFinite).slice(0, 12).map((v) => Math.max(0, v));
  if (counts && typeof counts === 'object') {
    return Object.values(counts).filter(Number.isFinite).slice(0, 12).map((v) => Math.max(0, v));
  }

  return [];
}

/** La série saisie, lue comme l'instrument la lit : séparateurs libres. */
function parseDataset(text) {
  if (typeof text !== 'string') return [];

  return text.split(/[\s;,]+/).map(Number).filter(Number.isFinite).slice(0, 500);
}

/** Huit classes : la miniature ne prétend pas remplacer le diagramme de l'outil. */
function histogram(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (!(max > min)) return [values.length];
  const bins = new Array(8).fill(0);
  for (const v of values) {
    bins[Math.min(7, Math.floor(((v - min) / (max - min)) * 8))] += 1;
  }

  return bins;
}
