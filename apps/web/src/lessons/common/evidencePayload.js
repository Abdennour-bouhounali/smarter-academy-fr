/**
 * La charge utile V2 d'une preuve d'apprentissage du test final — la forme
 * que `POST /lessons/{code}/evidence` attend depuis Mastery V2 :
 *
 *     { questionCode, attemptId, answer: { picked } }
 *
 * Le client n'envoie PLUS `isCorrect`, `learningPointCodes` ni
 * `assessmentType` : le serveur est seul juge de la justesse, des points
 * d'apprentissage mesurés et de la difficulté (il les lit dans le registre
 * des items). Une question laissée sans réponse part avec `picked: null` —
 * le serveur l'enregistre comme `abandoned`.
 *
 * Fonctions PURES, séparées du hook pour être testables sans React.
 */

/**
 * Une question ne produit une preuve que si sa métadonnée la déclare
 * évaluative : `assessment.enabled` ET `type === 'assessment'`, ET qu'elle
 * porte des points d'apprentissage (`learningPointIds` — ou `learningPoints`,
 * la forme du registre). Les identifiants ne sont plus envoyés, mais leur
 * présence reste la marque d'une question évaluée : une question de
 * découverte ou d'entraînement ne fabrique jamais de preuve de maîtrise,
 * même mal configurée.
 *
 * @param {{assessment?: {enabled?: boolean, type?: string, learningPointIds?: string[], learningPoints?: unknown[]}}} question
 * @returns {boolean}
 */
export function isAssessedQuestion(question) {
  const meta = question?.assessment;
  if (!meta?.enabled || meta.type !== 'assessment') return false;
  const ids = meta.learningPointIds ?? meta.learningPoints;
  return Array.isArray(ids) && ids.length > 0;
}

/**
 * @param {{id: string}} question
 * @param {{picked?: number|null}|number|null|undefined} answer
 *        l'indice choisi (ou `{picked}`), `null`/`undefined` quand la
 *        question est restée sans réponse
 * @param {string} [attemptId] — injectable pour les tests
 * @returns {{questionCode: string, attemptId: string, answer: {picked: number|null}}}
 */
export function buildEvidencePayload(question, answer, attemptId = crypto.randomUUID()) {
  const picked = answer !== null && typeof answer === 'object' ? answer.picked : answer;

  return {
    questionCode: question.id,
    attemptId,
    answer: { picked: typeof picked === 'number' ? picked : null },
  };
}
