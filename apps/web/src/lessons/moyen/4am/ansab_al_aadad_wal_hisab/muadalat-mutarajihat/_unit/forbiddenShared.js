/**
 * Unité 4 « معادلات ومتراجحات » — outils communs aux signatures de مسألة (commit 0 du 2026-11-11).
 * Chaque leçon écrit SA signature dans `_unit/signatures/<leçon>.js` : `export const TEXT = [/regex/, …]` (ce qu'un texte montré à l'élève
 * avant la مسألة ne contient jamais). Ce fichier ne contient que des aides pures, sans signature.
 */

/** Le moins typographique U+2212 et le tiret sont lus pareil. */
const normMinus = (s) => String(s).replace(/−/g, '-');

/** Vrai si une chaîne montre l'une des signatures (le moins est normalisé). */
export const showsAny = (sigs, s) => sigs.some((re) => re.test(String(s)) || re.test(normMinus(s)));

/** Les lignes d'un texte sans ses commentaires ni ses métadonnées de source. */
export const visibleLines = (src) => src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '')
  .replace(/\s\/\/ .*$/gm, '')
  .replace(/src\([^)]*\)/g, '')
  .split('\n');
