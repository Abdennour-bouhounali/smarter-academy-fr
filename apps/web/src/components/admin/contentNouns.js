/**
 * Le nom du contenu — désormais une CLÉ, plus un nom français accordé.
 *
 * L'ancienne version portait le genre grammatical (« leçon » féminin,
 * « module » masculin) et un helper `agree()` qui recollait « e » et « s ».
 * C'était la bonne réponse à une interface française ; c'est la mauvaise à
 * une interface arabe, dont le nombre ne se décline pas en deux formes mais
 * en SIX catégories (`zero`, `one`, `two`, `few`, `many`, `other`) :
 *
 *     درس واحد · درسان · 3 دروس · 11 درساً · 100 درس
 *
 * Aucune concaténation ne produit ça correctement. C'est i18next qui le fait,
 * via `Intl.PluralRules('ar-DZ')` et les clés suffixées `_one`/`_two`/
 * `_few`/`_many`/`_other` du catalogue (`admin.bulk.noun.*`). Le rôle de ce
 * module se réduit donc à UN seul : dire de quel nom il s'agit.
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
