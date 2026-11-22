import { buildDefinition } from './sequenceModel.js';
import { generate } from './sequenceMath.js';

/**
 * Le RÉSUMÉ d'un document du مختبر المتتاليات : la famille, ses paramètres,
 * et les PREMIERS TERMES — calculés ici, une douzaine, parce que les termes
 * ne sont jamais stockés (sequenceState.js : on sait les refaire, donc on ne
 * les garde pas). Douze nombres suffisent à dessiner la miniature en points
 * et à reconnaître « 2, 5, 8, 11… » d'un coup d'œil.
 *
 * @param {object} data
 * @returns {import('../../toolContract.js').MathLabSummary | null}
 */
export function summarizeSequences(data) {
  const spec = data?.primary;
  if (!spec || typeof spec !== 'object') return null;

  let terms = [];
  try {
    const built = buildDefinition(spec);
    // `generate` rend des { n, value } : l'aperçu ne veut que les valeurs.
    if (built.ok) {
      terms = (generate(built.definition, PREVIEW_TERMS).terms ?? [])
        .map((term) => term?.value)
        .filter(Number.isFinite);
    }
  } catch {
    terms = [];
  }

  const text = [spec.kind];
  // Une suite explicite ou récurrente est reconnue par SA RÈGLE : c'est elle
  // qu'on cherche, pas le mot « explicit ».
  if (spec.kind === 'explicit' && typeof spec.explicitSource === 'string') text.push(spec.explicitSource.slice(0, 40));
  if (typeof spec.ruleSource === 'string' && spec.kind !== 'explicit' && spec.kind !== 'arithmetic' && spec.kind !== 'geometric') {
    text.push(spec.ruleSource.slice(0, 40));
  }

  return {
    kind: 'sequence',
    text,
    detail: {
      family: spec.kind,
      startIndex: spec.startIndex === 1 ? 1 : 0,
      terms: terms.slice(0, PREVIEW_TERMS).map((v) => Math.round(v * 1000) / 1000),
      compared: data?.secondary != null,
    },
  };
}

/** Douze termes : assez pour une silhouette, assez peu pour un résumé. */
const PREVIEW_TERMS = 12;
