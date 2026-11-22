import * as C from './conicMath.js';
import { isConicObject } from './conicState.js';

/**
 * Le RÉSUMÉ d'un document du مختبر المقاطع المخروطية : les courbes, en
 * quelques dizaines de points, plus le nom des familles posées.
 *
 * La vignette de « أعمالي » dessine les contours — c'est exactement ce qui
 * distingue deux documents de cet instrument l'un de l'autre : un cercle et
 * une hyperbole ne se confondent pas d'un coup d'œil — et la recherche
 * trouve « قطع ناقص » en cherchant le nom d'une famille.
 *
 * `kind: 'curve'` est la forme d'aperçu du GRAPHEUR, réutilisée ici sans une
 * ligne de plus dans « أعمالي ». C'est la promesse de `toolContract.js` : le
 * `kind` nomme la FORME de l'aperçu, pas l'instrument. Mais l'aperçu du
 * grapheur dessine des EXPRESSIONS qu'il ré-échantillonne lui-même, et une
 * conique n'est pas une fonction de x — on lui passe donc des POINTS déjà
 * calculés, via `detail.polylines`, que `WorkPreview` sait tracer.
 *
 * La fonction est PURE et ne jette jamais : `summarizeDocument`
 * (toolContract) attrape de toute façon, mais une vignette ne vaut pas un
 * travail perdu.
 *
 * @param {object} data
 * @returns {import('../../toolContract.js').MathLabSummary | null}
 */
export function summarizeConics(data) {
  const objects = Array.isArray(data?.scene?.objects) ? data.scene.objects : [];
  const conics = objects.filter((object) => isConicObject(object) && C.isValidConic(object));
  if (conics.length === 0) return null;

  // La fenêtre du document, ou celle qui cadre les coniques — la vignette
  // doit montrer les courbes, pas un coin de plan vide.
  const viewport = readViewport(data?.viewport) ?? frameOf(conics);

  const curves = [];
  for (const conic of conics.slice(0, 3)) {
    let polylines;
    try {
      // 28 points par branche : assez pour reconnaître la forme dans
      // 160 × 90 px, assez peu pour tenir dans les 2 Ko du serveur.
      polylines = C.conicPolylines(conic, viewport, 28);
    } catch {
      polylines = [];
    }
    for (const points of polylines) {
      const sampled = points.filter(C.isPoint).map(round);
      if (sampled.length >= 2) curves.push({ c: conic.color ?? '#2563eb', p: sampled });
    }
    if (curves.length >= 4) break;
  }

  if (curves.length === 0) return null;

  return {
    kind: 'curve',
    // Ce que la RECHERCHE lit : les familles posées, sans doublon.
    text: [...new Set(conics.map((conic) => conic.kind))].slice(0, 6),
    detail: {
      viewport: [viewport.xMin, viewport.xMax, viewport.yMin, viewport.yMax].map((v) => Math.round(v * 10) / 10),
      polylines: curves.slice(0, 4),
    },
  };
}

function readViewport(raw) {
  if (!raw) return null;
  const { xMin, xMax, yMin, yMax } = raw;
  if (![xMin, xMax, yMin, yMax].every(Number.isFinite)) return null;
  if (!(xMax > xMin) || !(yMax > yMin)) return null;

  return { xMin, xMax, yMin, yMax };
}

/** Une fenêtre qui CADRE les coniques, quand le document n'en a pas enregistré. */
function frameOf(conics) {
  let spread = 1;
  let cx = 0;
  let cy = 0;
  for (const conic of conics) {
    cx += conic.h;
    cy += conic.k;
    spread = Math.max(spread, Math.abs(conic.r ?? 0), Math.abs(conic.a ?? 0), Math.abs(conic.b ?? 0), 2);
  }
  cx /= conics.length;
  cy /= conics.length;
  const half = spread * 1.8;

  return { xMin: cx - half, xMax: cx + half, yMin: cy - half * 0.6, yMax: cy + half * 0.6 };
}

/**
 * Un point arrondi pour la vignette — et jamais `-0`.
 *
 * `Math.round(-0.001 * 100) / 100` vaut `-0`, que `JSON.stringify` écrit
 * « 0 » : le résumé relu n'était alors plus égal au résumé envoyé, et
 * `summaries.test.js` le refuse à juste titre — un résumé doit survivre à
 * l'aller-retour JSON, sinon la carte affiche autre chose que ce qui a été
 * calculé. `+ 0` ramène `-0` à `0` sans toucher aux autres valeurs.
 */
const round = (point) => ({
  x: Math.round(point.x * 100) / 100 + 0,
  y: Math.round(point.y * 100) / 100 + 0,
});
