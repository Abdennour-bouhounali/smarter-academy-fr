/**
 * Le nom du contenu — une CLÉ, plus un nom accordé à la main.
 *
 * L'ancienne version portait le genre grammatical (« leçon » féminin,
 * « étape » féminin) et un helper `agree()` qui recollait « e » et « s ».
 * Aucune concaténation ne produit un pluriel juste dans toutes les langues :
 * c'est i18next qui le fait, avec les clés suffixées `_one` / `_other` du
 * catalogue (`admin.bulk.noun.*`). Le rôle de ce module se réduit donc à UN
 * seul : dire de quel nom il s'agit.
 *
 * `CONTENT_NOUNS` garde sa forme d'objet et son nom : les trois pages de
 * contenu passent `noun={CONTENT_NOUNS.lesson}` à `BulkActionBar`, et cette
 * signature ne bouge pas.
 */

/** Les trois types de contenu du panneau, et leur clé de pluralisation. */
export const CONTENT_NOUNS = {
  lesson: { key: 'lesson' },
  module: { key: 'module' },
  exercise: { key: 'exercise' },
};
