/**
 * LE PROCHAIN EXERCICE d'une séance — la décision, sans React ni réseau.
 *
 * Mastery V2, phase 9 : le serveur (`GET /practice/sessions/{id}/next`)
 * choisit l'exercice suivant d'après l'état de maîtrise — un point à
 * consolider, une erreur récente, un exercice pas encore vu. Le client ne
 * fait que suivre ce choix, avec deux replis :
 *
 *   1. l'appel échoue (`response` null), ou le sélecteur est coupé
 *      (`reason: 'disabled'`), ou il nomme un exercice que ce client ne
 *      connaît pas → l'ORDRE DU CONTENU : le premier exercice du niveau pas
 *      encore terminé dans cette séance (le comportement d'avant la phase 9) ;
 *   2. le serveur répond `exerciseId: null` → le niveau est épuisé : la
 *      séance se clôt, exactement comme après le dernier exercice.
 *
 * Aucun de ces chemins ne bloque : il y a toujours soit un exercice, soit
 * le bilan.
 *
 * @param {{
 *   response?: {exerciseId?: string|null, reason?: string}|null,
 *   fallbackIds?: string[],
 *   completedIds?: string[],
 * }} input
 * @returns {{exerciseId: string|null, reason: string, source: 'selector'|'order'}}
 *          `exerciseId: null` = fin de séance.
 */
export function decideNextExercise({ response = null, fallbackIds = [], completedIds = [] } = {}) {
  const done = new Set(completedIds);
  const inOrder = () => ({
    exerciseId: fallbackIds.find((id) => !done.has(id)) ?? null,
    reason: 'order',
    source: 'order',
  });

  if (!response || typeof response !== 'object' || response.reason === 'disabled') return inOrder();

  const id = response.exerciseId;
  if (id === null) return { exerciseId: null, reason: response.reason ?? 'order', source: 'selector' };
  if (typeof id !== 'string' || !id) return inOrder();

  // Un identifiant que le contenu livré ne connaît pas (index désynchronisé)
  // ou déjà fait ici ne peut pas s'ouvrir : on reprend l'ordre du contenu.
  if (fallbackIds.length > 0 && !fallbackIds.includes(id)) return inOrder();
  if (done.has(id)) return inOrder();

  return { exerciseId: id, reason: response.reason ?? 'order', source: 'selector' };
}

/** Les raisons qui méritent une petite phrase sous le titre de l'exercice. */
const SELECTION_HINT_REASONS = ['weak_learning_point', 'recent_misconception'];

/** La raison affichable (ou null) d'une décision. */
export function selectionHintReason(decision) {
  if (!decision || decision.source !== 'selector') return null;
  return SELECTION_HINT_REASONS.includes(decision.reason) ? decision.reason : null;
}
