/**
 * Le VOCABULAIRE des signalements, en CLÉS et non en chaînes.
 *
 * Ce module n'a plus le droit de porter du texte : la traduction vit dans le
 * catalogue (`i18n/locales/fr/admin.json`, section `reports`), et les pages
 * résolvent ces clés avec `t()`. Un module de chaînes en dur aurait rouvert
 * une seconde source de vérité — exactement ce que le contrat arabe interdit.
 */

/** D'où part un signalement — la clé de catalogue, pas le libellé. */
const SOURCE_KEYS = {
  lesson: 'reports.sourceLesson',
  module: 'reports.sourceModule',
  exercise: 'reports.sourceExercise',
  question: 'reports.sourceQuestion',
  diagnostic: 'reports.sourceDiagnostic',
};

/** Les origines proposées au filtre, dans l'ordre d'affichage. */
export const SOURCE_VALUES = Object.keys(SOURCE_KEYS);

/**
 * Les catégories COURANTES — celles que l'élève peut choisir aujourd'hui.
 * L'ordre suit `REPORT_CATEGORIES` de `services/reportService.js`, dont les
 * identifiants restent la source des valeurs envoyées au serveur.
 */
export const CATEGORY_KEYS = {
  math_error: 'reports.categoryMathError',
  manipulation_not_working: 'reports.categoryManipulationNotWorking',
  unclear_question: 'reports.categoryUnclearQuestion',
  answer_correction_problem: 'reports.categoryAnswerCorrectionProblem',
  display_problem: 'reports.categoryDisplayProblem',
  typo: 'reports.categoryTypo',
  other: 'reports.categoryOther',
};

/**
 * Vocabulaire de catégories ANTÉRIEUR.
 *
 * Ces valeurs ne sont plus proposées à l'élève, mais elles existent en base
 * et doivent rester lisibles : un signalement de l'an dernier ne doit pas
 * s'afficher comme un code brut parce qu'on a renommé les catégories depuis.
 */
const LEGACY_KEYS = {
  content_error: 'reports.legacyContentError',
  wrong_answer: 'reports.legacyWrongAnswer',
  technical_problem: 'reports.legacyTechnicalProblem',
  interaction_problem: 'reports.legacyInteractionProblem',
};

/**
 * La clé d'une catégorie, courante ou héritée.
 *
 * Renvoie `null` quand la catégorie est absente (la page affiche alors son
 * propre tiret), et `undefined` quand le code n'appartient à aucun des deux
 * vocabulaires — la page retombe alors sur le code brut plutôt que sur un
 * vide qu'on lirait comme un bug.
 */
export function categoryKey(category) {
  if (!category) return null;
  return CATEGORY_KEYS[category] ?? LEGACY_KEYS[category];
}

/** La clé d'une origine, ou `undefined` pour une source inconnue du serveur. */
export function sourceKey(source) {
  return SOURCE_KEYS[source];
}
