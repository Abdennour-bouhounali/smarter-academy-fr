import { resolveScene } from './vectorScene.js';

/**
 * Le RÉSUMÉ d'un document du مختبر الأشعة : la scène OÙ L'ÉLÈVE EN EST —
 * les points et les أشعة, résolus, en coordonnées. La miniature les dessine
 * telles quelles ; la recherche trouve « AB » en cherchant un شعاع nommé.
 *
 * On résout la scène ici (les définitions stockées désignent souvent
 * d'autres objets : « le شعاع de A vers B »), et on ne garde que le pas
 * courant de l'historique — vingt copies de la même scène n'apprennent rien
 * à une vignette.
 *
 * @param {object} data
 * @returns {import('../../toolContract.js').MathLabSummary | null}
 */
export function summarizeVectors(data) {
  const history = Array.isArray(data?.history) ? data.history : [];
  if (history.length === 0) return null;
  const cursor = Number.isInteger(data?.cursor) ? Math.max(0, Math.min(history.length - 1, data.cursor)) : history.length - 1;

  let resolved;
  try {
    resolved = resolveScene(history[cursor]);
  } catch {
    return null;
  }

  // `resolveScene` rend des Map (id → objet résolu), pas des tableaux.
  const points = [...(resolved?.points?.values?.() ?? [])]
    .filter((p) => p?.resolved !== false && p?.position && Number.isFinite(p.position.x) && Number.isFinite(p.position.y))
    .slice(0, 12)
    .map((p) => ({ n: p.name ?? '', x: round(p.position.x), y: round(p.position.y) }));

  const vectors = [...(resolved?.vectors?.values?.() ?? [])]
    .filter((v) => v?.resolved !== false && v?.origin && v?.tip)
    .slice(0, 8)
    .map((v) => ({
      n: v.name ?? '',
      x1: round(v.origin.x), y1: round(v.origin.y),
      x2: round(v.tip.x), y2: round(v.tip.y),
      // La couleur vit sur la DÉFINITION, que le résolu garde sous `source`.
      c: typeof v.source?.color === 'string' ? v.source.color : '#2563eb',
    }));

  if (points.length === 0 && vectors.length === 0) return null;

  return {
    kind: 'vectors',
    text: vectors.map((v) => v.n).filter(Boolean).slice(0, 6),
    detail: { points, vectors },
  };
}

const round = (v) => Math.round(v * 100) / 100;
