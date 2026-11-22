/**
 * Le RÉSUMÉ d'un document du مختبر التحليل, pour « أعمالي » (§5i.2).
 *
 * Fonction PURE : ni React, ni moteur, ni DOM. Elle tourne dans la coquille à
 * chaque sauvegarde et doit rester minuscule (le serveur ignore au-delà de
 * 2 Ko) — et surtout ne JAMAIS jeter : une vignette ne vaut pas le travail
 * d'un élève (toolContract.summarizeDocument).
 *
 * L'aperçu réutilise la forme `curve` que le grapheur a déjà : une carte
 * dessine une courbe échantillonnée, et « أعمالي » n'a pas une ligne à
 * ajouter pour ce nouvel instrument. C'est exactement ce que le contrat
 * promet — « un futur instrument qui produit une courbe réutilise l'aperçu
 * curve sans une ligne de plus ».
 *
 * Les échantillons sont calculés ICI, une trentaine, parce que le document ne
 * stocke jamais de points : la courbe se recalcule de son expression.
 */

import { compileSource } from '../functionGrapher/expressionEvaluator.js';

/** Trente points : assez pour une silhouette, assez peu pour un résumé. */
const PREVIEW_SAMPLES = 30;

/**
 * @param {object} data
 * @returns {import('../../toolContract.js').MathLabSummary | null}
 */
export function summarizeAnalysis(data) {
  const functions = Array.isArray(data?.functions) ? data.functions : null;
  if (!functions || functions.length === 0) return null;
  const primary = functions[0];
  if (!primary || typeof primary.source !== 'string' || !primary.source.trim()) return null;

  const view = normalizeView(data?.view);
  const samples = sampleCurve(primary.source, view, data?.parameters);

  // Ce que la RECHERCHE lit : l'expression et le laboratoire ouvert.
  const text = [primary.source.slice(0, 60)];
  const second = functions[1];
  if (second && typeof second.source === 'string' && second.source.trim()) {
    text.push(second.source.slice(0, 60));
  }
  if (typeof data?.lab === 'string') text.push(data.lab);

  /**
   * On rend des POLYLIGNES, pas des expressions.
   *
   * `WorkPreview` accepte les deux écritures de la forme « curve » :
   * `detail.curves` (des expressions qu'il rééchantillonne avec son petit
   * reconnaisseur de formes) et `detail.polylines` (des points déjà
   * calculés). On choisit la seconde, comme le مختبر المقاطع المخروطية, parce
   * que le reconnaisseur de la vignette ne comprend que « les formes
   * courantes du programme » et transformerait `\frac{x^2-1}{x-1}` en une
   * droite — une vignette qui MENT sur le contenu du document.
   *
   * Ici les points sont calculés par le vrai évaluateur, une fois, à la
   * sauvegarde ; la carte n'a plus qu'à les tracer.
   */
  const detail = {
    lab: typeof data?.lab === 'string' ? data.lab : 'secant',
    viewport: [view.xMin, view.xMax, view.yMin, view.yMax],
    polylines: [{ p: samples, c: primary.color ?? '#2563eb' }],
  };

  if (second && typeof second.source === 'string' && second.source.trim() && second.visible !== false) {
    const secondSamples = sampleCurve(second.source, view, data?.parameters);
    if (secondSamples.length > 0) detail.polylines.push({ p: secondSamples, c: second.color ?? '#db2777' });
  }

  return { kind: 'curve', text, detail };
}

/** Une fenêtre sûre, ou celle par défaut — l'aperçu doit toujours en avoir une. */
function normalizeView(view) {
  const fallback = { xMin: -6, xMax: 6, yMin: -4, yMax: 4 };
  if (!view || typeof view !== 'object') return fallback;
  const { xMin, xMax, yMin, yMax } = view;
  if (![xMin, xMax, yMin, yMax].every(Number.isFinite)) return fallback;
  if (!(xMax > xMin) || !(yMax > yMin)) return fallback;

  return {
    xMin: round(xMin), xMax: round(xMax), yMin: round(yMin), yMax: round(yMax),
  };
}

/**
 * La silhouette de la courbe : des `[x, y]` arrondis, `null` là où la
 * fonction n'est pas définie — l'aperçu y coupe son trait, comme le traceur.
 */
function sampleCurve(source, view, parameters) {
  let compiled;
  try {
    compiled = compileSource(source);
  } catch {
    return [];
  }
  if (!compiled.ok) return [];

  const scope = parameters && typeof parameters === 'object' ? parameters : undefined;
  const points = [];
  const step = (view.xMax - view.xMin) / (PREVIEW_SAMPLES - 1);
  for (let i = 0; i < PREVIEW_SAMPLES; i += 1) {
    const x = view.xMin + i * step;
    let y;
    try {
      y = compiled.fn(x, scope);
    } catch {
      y = NaN;
    }
    /**
     * Les points sont des `{x, y}` — c'est ce que `WorkPreview.polylinePath`
     * lit. Une ordonnée non finie devient un point SANS `y` : la vignette y
     * lève le crayon, et l'asymptote de 1/x reste une coupure au lieu d'un
     * trait qui traverse l'écran.
     *
     * Une ordonnée hors cadre est RAMENÉE au bord : l'aperçu ne s'étire pas
     * sur un pôle, et il n'a pas non plus à porter 1e300.
     */
    if (!Number.isFinite(y)) { points.push({ x: round(x), y: null }); continue; }

    /**
     * Un SAUT plus haut que la fenêtre entre deux échantillons voisins est un
     * pôle, pas une pente : on lève le crayon.
     *
     * L'échantillonneur de la vignette ne tombe presque jamais PILE sur le
     * pôle (pour 1/x sur [−5 ; 5] en trente points, aucun x ne vaut 0), donc
     * attendre une valeur non finie ne suffit pas : le résumé de 1/x
     * comptait zéro levée de crayon et la carte traçait un trait qui
     * traversait tout l'écran. C'est la même règle que
     * `functionSampler.isContinuous`, en beaucoup plus grossier — une
     * vignette de 160 px n'a pas besoin de sonder.
     */
    const previous = points[points.length - 1];
    const span = view.yMax - view.yMin;
    if (previous && previous.y !== null && Math.abs(y - previous.y) > span) {
      points.push({ x: round(x), y: null });
    }
    points.push({ x: round(x), y: round(clampToView(y, view)) });
  }

  return points;
}

function clampToView(y, view) {
  const span = view.yMax - view.yMin;
  const low = view.yMin - span;
  const high = view.yMax + span;

  return y < low ? low : y > high ? high : y;
}

/** Trois décimales : la vignette fait 200 pixels de large, le reste est du poids. */
function round(value) {
  return Math.round(value * 1000) / 1000;
}
