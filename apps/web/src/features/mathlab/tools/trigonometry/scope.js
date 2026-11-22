import { MODES, UNITS } from './trigState.js';
import { CURRICULUM_ANGLES, SPECIAL_DEGREES } from './exactValues.js';
import { PRESETS } from './presets.js';

/**
 * مختبر المثلثات dans les deux مخابر (labScope.js, MATH_LAB.md §2.1).
 *
 * Au collège (4AM 4.2–4.3) : les rapports trigonométriques d'un angle AIGU
 * dans un triangle rectangle — sin, cos, tan —, leurs valeurs exactes à 30°,
 * 45°, 60° et leurs relations (tan = sin/cos). Le cercle trigonométrique, les
 * radians, les quadrants et les signes, la rotation, la périodicité, les
 * symétries, les réciproques sur un tour et la comparaison de deux angles
 * sont du lycée. Au lycée : tout.
 */
export const TRIGONOMETRY_SCOPES = Object.freeze(['moyen', 'secondaire']);

export const TRIGONOMETRY_CAPABILITIES = Object.freeze({
  moyen: Object.freeze({
    descriptionKey: 'tools.trigonometry.descriptionMoyen',
    modes: Object.freeze(['triangle']),
    units: Object.freeze(['deg']),
    specialAngles: CURRICULUM_ANGLES,
    presets: Object.freeze(['triangle', 'sohcahtoa']),
    panels: Object.freeze({
      rotation: false, layers: false, symmetry: false, inverse: false, compare: false, experiments: false,
    }),
    readings: Object.freeze({ radians: false, point: false, quadrant: false, signTable: false }),
  }),
  secondaire: null,
});

const ALL_PANELS = Object.freeze({
  rotation: true, layers: true, symmetry: true, inverse: true, compare: true, experiments: true,
});
const ALL_READINGS = Object.freeze({ radians: true, point: true, quadrant: true, signTable: true });

/** Ce que le laboratoire montre, capacités résolues (`null` = tout). */
export function trigonometryFeatures(capabilities) {
  const presetIds = capabilities?.presets ?? null;

  return {
    modes: capabilities?.modes ?? MODES,
    units: capabilities?.units ?? UNITS,
    specialAngles: capabilities?.specialAngles ?? SPECIAL_DEGREES,
    presets: presetIds ? PRESETS.filter((preset) => presetIds.includes(preset.id)) : PRESETS,
    panels: { ...ALL_PANELS, ...(capabilities?.panels ?? {}) },
    readings: { ...ALL_READINGS, ...(capabilities?.readings ?? {}) },
  };
}

/**
 * Un état ramené à ce que le مخبر montre : au collège, le triangle, les
 * degrés, et ni symétrie, ni réciproque, ni comparaison allumées. Les
 * valeurs du triangle sont GARDÉES.
 */
export function clampToFeatures(data, features) {
  let next = data;
  if (!features.modes.includes(next.mode)) {
    const mode = features.modes[0];
    next = { ...next, mode, layers: mode === 'triangle' ? { ...next.layers, triangle: true } : next.layers };
  }
  if (!features.units.includes(next.unit)) next = { ...next, unit: features.units[0] };
  if (!features.panels.symmetry && next.symmetry) next = { ...next, symmetry: null };
  if (!features.panels.inverse && next.inverse) next = { ...next, inverse: null };
  if (!features.panels.compare && next.compare?.enabled) next = { ...next, compare: { ...next.compare, enabled: false } };
  if (next.preset && !features.presets.some((preset) => preset.id === next.preset)) next = { ...next, preset: null };

  return next;
}
