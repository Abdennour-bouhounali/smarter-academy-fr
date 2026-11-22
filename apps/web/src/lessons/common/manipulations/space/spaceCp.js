/**
 * Aides communes aux questions pendant le labo des labos de l'espace (lot 4, `primitives/LabCheckpoint`).
 * `spread(options, seed)` déplace la bonne option à la place `seed mod n` (les options sont écrites « bonne d'abord » ; sans cela la bonne réponse
 * serait toujours la première). Déterministe : une question garde la même disposition à chaque rendu.
 */
export function spread(options, seed = 0) {
  const n = options.length;
  const at = options.findIndex((o) => o.correct);
  if (at < 0 || n < 2) return options;
  const to = ((seed % n) + n) % n;
  const rest = options.filter((_, i) => i !== at);
  return [...rest.slice(0, to), options[at], ...rest.slice(to)];
}
