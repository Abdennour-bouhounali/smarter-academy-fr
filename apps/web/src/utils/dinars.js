/** « 20 000 » — des centimes vers des dinars entiers, chiffres à poser en LTR. Aucun montant n'est décidé ici. */
export function formatDzd(cents) {
  return Math.round(Number(cents || 0) / 100).toLocaleString('fr-DZ');
}
