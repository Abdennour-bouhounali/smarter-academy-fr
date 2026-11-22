import { getAllGradesSummary } from '../../utils/gradeSummary';

/**
 * Le nom d'un niveau (« 3e ») tel que le catalogue l'écrit — l'espace parent ne
 * retape pas la liste des niveaux. Un identifiant inconnu est rendu tel quel.
 */
export function gradeName(id) {
  if (!id) return '';
  return getAllGradesSummary().find((g) => g.id === id)?.name ?? id;
}
