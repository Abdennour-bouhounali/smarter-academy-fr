/**
 * Les situations d'exemple de la loi normale : des paramètres VRAISEMBLABLES
 * (le QI est construit N(100, 15²) ; une taille adulte ≈ N(170, 8²)) et une
 * question qui a un sens pour chacune.
 */
export const NORMAL_PRESETS = Object.freeze([
  { id: 'standard', level: 'beginner', params: { mu: 0, sigma: 1, x: 1.96, a: -1.96, b: 1.96, query: 'le', scale: 'z' } },
  { id: 'rule', level: 'beginner', params: { mu: 0, sigma: 1, x: 1, a: -1, b: 1, query: 'between', scale: 'z' } },
  { id: 'heights', level: 'intermediate', params: { mu: 170, sigma: 8, x: 180, a: 162, b: 178, query: 'between', scale: 'x' } },
  { id: 'marks', level: 'intermediate', params: { mu: 11, sigma: 3, x: 15, a: 8, b: 14, query: 'ge', scale: 'x' } },
  { id: 'iq', level: 'advanced', params: { mu: 100, sigma: 15, x: 130, a: 85, b: 115, query: 'ge', scale: 'x' } },
]);

export function getNormalPreset(id) {
  return NORMAL_PRESETS.find((preset) => preset.id === id) ?? null;
}

/** L'exemple dont les paramètres sont exactement ceux-ci (pour marquer la pastille active), ou `null`. */
export function matchingNormalPreset(params) {
  return NORMAL_PRESETS.find((preset) => Object.entries(preset.params).every(([key, value]) => params[key] === value))?.id ?? null;
}
