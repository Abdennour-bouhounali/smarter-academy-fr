/**
 * The words of the pyramids world. This folder is ONE code for two countries, and this file picks the country's words:
 * `strings.fr.js` here in France, `strings.ar.js` in Algeria (the same keys). Every other file of the folder imports
 * `./strings` and holds no word of either language, no screen-reader label and no text direction (`DIR`).
 */
export * from './strings.fr';

/** A lesson's story may change any sentence (an object is merged one level deep). Code, not words: it stays here. */
export function withStory(base, over = {}) {
  const out = { ...base };
  for (const [k, v] of Object.entries(over))
    out[k] = v && typeof v === 'object' && !Array.isArray(v) && typeof base[k] === 'object' ? { ...base[k], ...v } : v;
  return out;
}
