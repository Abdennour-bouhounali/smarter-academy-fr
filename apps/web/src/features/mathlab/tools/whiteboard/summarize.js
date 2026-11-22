/**
 * Le RÉSUMÉ d'une سبّورة. Un dessin Excalidraw pèse jusqu'à 2 Mo : il n'est
 * pas question d'en faire voyager une image dans une liste, ni de monter
 * Excalidraw pour une vignette. On ne garde donc que la SILHOUETTE — la
 * boîte de chaque trait, sa couleur, son type — plafonnée à quarante
 * éléments. C'est assez pour reconnaître son propre dessin parmi vingt.
 *
 * Le texte des éléments texte part avec : c'est ce qu'on cherche quand on a
 * écrit « المثلث ABC » sur sa سبّورة.
 *
 * @param {object} data  l'état sérialisé de la سبّورة
 * @returns {import('../../toolContract.js').MathLabSummary | null}
 */
export function summarizeWhiteboard(data) {
  const elements = Array.isArray(data?.elements) ? data.elements.filter((el) => el && el.isDeleted !== true) : [];
  if (elements.length === 0) return null;

  const box = boundsOf(elements);
  if (!box) return null;

  const shapes = [];
  for (const el of elements.slice(0, MAX_SHAPES)) {
    if (![el?.x, el?.y].every(Number.isFinite)) continue;
    shapes.push({
      t: String(el.type ?? 'rectangle').slice(0, 12),
      x: round(el.x), y: round(el.y),
      w: round(Number.isFinite(el.width) ? el.width : 0),
      h: round(Number.isFinite(el.height) ? el.height : 0),
      c: typeof el.strokeColor === 'string' ? el.strokeColor : '#1e1e1e',
    });
  }

  return {
    kind: 'strokes',
    text: elements
      // Les lettres A, B, C et les mesures « AB = 5 » du bureau de géométrie
      // ne sont pas ce qu'on CHERCHE : seul le texte écrit par l'élève compte.
      .filter((el) => el?.type === 'text' && typeof el.text === 'string' && el.text.trim() !== '' && !el.customData?.geo)
      .map((el) => el.text.trim().slice(0, 40))
      .slice(0, 6),
    detail: { box, shapes, total: elements.length },
  };
}

/**
 * Vingt-quatre silhouettes : assez pour reconnaître son dessin, et assez peu
 * pour que le résumé ENTIER (avec le texte écrit et le cadre) tienne sous les
 * 2 Ko que le serveur accepte — au-delà il l'ignore, et la carte perd son
 * aperçu. La borne est vérifiée par summaries.test.js sur un dessin de cinq
 * cents traits.
 */
const MAX_SHAPES = 24;

/** La boîte du dessin entier — le cadre de la miniature. */
function boundsOf(elements) {
  let minX = Infinity; let minY = Infinity; let maxX = -Infinity; let maxY = -Infinity;
  for (const el of elements) {
    if (![el?.x, el?.y].every(Number.isFinite)) continue;
    const w = Number.isFinite(el.width) ? el.width : 0;
    const h = Number.isFinite(el.height) ? el.height : 0;
    minX = Math.min(minX, el.x, el.x + w);
    minY = Math.min(minY, el.y, el.y + h);
    maxX = Math.max(maxX, el.x, el.x + w);
    maxY = Math.max(maxY, el.y, el.y + h);
  }
  if (!Number.isFinite(minX) || !Number.isFinite(maxX)) return null;

  return { x: round(minX), y: round(minY), w: round(Math.max(1, maxX - minX)), h: round(Math.max(1, maxY - minY)) };
}

const round = (v) => Math.round(v * 10) / 10;
