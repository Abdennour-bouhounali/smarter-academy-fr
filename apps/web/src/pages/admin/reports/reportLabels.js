import { REPORT_CATEGORIES } from '../../../services/reportService';

/** D'où part un signalement, en français. */
export const SOURCE_LABELS = {
  lesson: 'Sommaire de leçon',
  module: 'Module',
  exercise: 'Exercice',
  question: 'Question',
  diagnostic: 'Diagnostic',
};

/**
 * Vocabulaire de catégories ANTÉRIEUR.
 *
 * Ces valeurs ne sont plus proposées à l'élève, mais elles existent en base
 * et doivent rester lisibles : un signalement de l'an dernier ne doit pas
 * s'afficher comme un code brut parce qu'on a renommé les catégories depuis.
 */
const LEGACY_LABELS = {
  content_error: 'Erreur dans le contenu (ancien)',
  wrong_answer: 'Réponse attendue fausse (ancien)',
  technical_problem: 'Problème technique (ancien)',
  interaction_problem: 'Interaction cassée (ancien)',
};

/** Le libellé d'une catégorie, courante ou héritée. */
export function categoryLabel(category) {
  if (!category) return '—';
  return REPORT_CATEGORIES.find((c) => c.id === category)?.label
    ?? LEGACY_LABELS[category]
    ?? category;
}
