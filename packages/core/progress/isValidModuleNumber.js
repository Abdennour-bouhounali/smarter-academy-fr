/**
 * Est-ce un NUMÉRO de module exploitable ?
 *
 * Cette fonction existe parce que `0` est un numéro de module parfaitement
 * valide — une leçon qui ouvre sur « أستعدّ » (stage `prerequisite_check`)
 * commence à 0 — et que `if (moduleNumber)` le rejette silencieusement.
 * C'est exactement ce qui empêchait le module 0 d'être enregistré : la
 * progression d'une telle leçon plafonnait à 80 % et ne pouvait jamais se
 * terminer, sans la moindre erreur.
 *
 * La règle : on valide la NATURE de la valeur (un entier fini ≥ 0), jamais sa
 * vérité. Tout appelant qui décide « ai-je un module ? » passe par ici.
 *
 * @param {unknown} moduleNumber - la valeur à valider (nombre ou chaîne numérique).
 * @returns {boolean} vrai pour 0, 1, 2… et '0', '1' ; faux pour null,
 *          undefined, '', NaN, un négatif, un décimal ou du texte.
 */
export function isValidModuleNumber(moduleNumber) {
  // Seuls un nombre et une chaîne numérique sont des numéros. Tout le reste
  // est écarté AVANT `Number()`, dont les conversions complaisantes feraient
  // passer des valeurs qui n'ont aucun sens ici : `Number([])`, `Number('')`
  // et `Number(false)` valent tous 0.
  if (typeof moduleNumber === 'number') {
    return Number.isInteger(moduleNumber) && moduleNumber >= 0;
  }
  if (typeof moduleNumber !== 'string') return false;
  const trimmed = moduleNumber.trim();
  if (trimmed === '') return false;
  const n = Number(trimmed);
  return Number.isInteger(n) && n >= 0;
}
