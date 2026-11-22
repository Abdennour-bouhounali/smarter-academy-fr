import { INVESTIGATIONS } from './investigations.js';

/**
 * Le RÉSUMÉ d'un document du مختبر القياس : l'enquête ouverte, où en est la
 * découverte, et combien de mesures ont été prises.
 *
 * C'est ce qui distingue deux documents de cet instrument l'un de l'autre —
 * « l'aire du triangle, 6 mesures, règle trouvée » n'est pas « le cercle,
 * 2 mesures, en cours ». La vignette réutilise la forme `shapes` (déjà
 * dessinée par « أعمالي » pour les تحويلات) : aucun dessin nouveau n'est
 * nécessaire, et l'aperçu montre l'objet mesuré.
 *
 * La fonction est PURE et ne jette jamais : une vignette ne vaut pas un
 * travail perdu (toolContract.summarizeDocument attrape de toute façon).
 *
 * @param {object} data
 * @returns {import('../../toolContract.js').MathLabSummary | null}
 */
export function summarizeMeasurement(data) {
  const id = typeof data?.investigation === 'string' ? data.investigation : null;
  const investigation = INVESTIGATIONS.find((entry) => entry.id === id);
  if (!investigation) return null;

  const record = data?.records?.[investigation.id];
  const observations = Array.isArray(record?.observations) ? record.observations.length : 0;
  const stage = typeof record?.stage === 'string' ? record.stage : 'exploring';

  // Les contours de l'objet mesuré, pour que l'aperçu montre un rectangle,
  // un triangle ou un cercle — pas une icône générique.
  const outline = outlineFor(investigation, data?.objects?.[investigation.id]);

  return {
    kind: 'shapes',
    // Ce que la RECHERCHE lit : l'enquête et son état, jamais la formule.
    text: [investigation.id, investigation.concept, stage].filter(Boolean).slice(0, 6),
    detail: {
      c: STAGE_COLORS[stage] ?? '#2563eb',
      a: outline,
      b: [],
      n: observations,
      s: stage,
    },
  };
}

/** Une couleur par étape : l'œil voit d'un coup où en est chaque document. */
const STAGE_COLORS = Object.freeze({
  exploring: '#64748b',
  conjecturing: '#b45309',
  testing: '#7c3aed',
  found: '#059669',
  explained: '#059669',
});

/** Le contour de l'objet mesuré, en coordonnées, borné à douze sommets. */
function outlineFor(investigation, params) {
  const read = (key, fallback) => {
    const value = Number(params?.[key]);

    return Number.isFinite(value) ? value : fallback;
  };

  try {
    if (investigation.stage === 'rectangle') {
      const l = read('length', 5);
      const w = read('width', 3);

      return [{ x: 0, y: 0 }, { x: l, y: 0 }, { x: l, y: w }, { x: 0, y: w }];
    }
    if (investigation.stage === 'triangle') {
      if (investigation.rightAngled) {
        const a = read('side1', 3);
        const b = read('side2', 4);

        return [{ x: 0, y: 0 }, { x: b, y: 0 }, { x: 0, y: a }];
      }
      const base = read('base', 6);

      return [{ x: 0, y: 0 }, { x: base, y: 0 }, { x: read('apex', base / 2), y: read('height', 4) }];
    }
    if (investigation.stage === 'cuboid') {
      const l = read('edge', read('length', 3));
      const w = read('edge', read('width', 3));

      return [{ x: 0, y: 0 }, { x: l, y: 0 }, { x: l, y: w }, { x: 0, y: w }];
    }
    if (investigation.stage === 'circle') {
      // Un octogone régulier suffit à évoquer le cercle en vignette, et
      // tient en huit points au lieu de trois cents.
      const r = read('radius', 3);

      return Array.from({ length: 8 }, (unused, index) => {
        const angle = (index * Math.PI) / 4;

        return { x: round(r * Math.cos(angle)), y: round(r * Math.sin(angle)) };
      });
    }
    // Le segment (les conversions) : un carré unité, l'objet de l'enquête.
    return [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 4 }, { x: 0, y: 4 }];
  } catch {
    return [];
  }
}

const round = (value) => Math.round(value * 100) / 100;
