import { apiRequest, ApiError, classifyStatus } from './apiClient';

/**
 * Transport pour le moteur d'exercices — même forme que diagnosticService.js.
 *
 * La justesse d'une réponse est calculée par @smarter-academy/core AVANT
 * d'arriver ici (même frontière de confiance que le test final, documentée
 * dans LEARNING_ARCHITECTURE.md). Ce que le serveur possède : la propriété
 * de la séance, les points d'apprentissage crédités — lus dans le contenu,
 * pas dans la requête —, l'idempotence, et l'arithmétique de la maîtrise.
 */

async function call(path, options, fallbackMessage) {
  const { ok, status, data } = await apiRequest(path, options);
  if (!ok) {
    throw new ApiError(data?.message || fallbackMessage, classifyStatus(status), status);
  }

  return data;
}

const auth = (token, body) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  ...(body ? { body: JSON.stringify(body) } : {}),
});

/** L'état du Hub : niveaux, verrous, progression des points travaillés. */
export function fetchPracticeOverview(token, lessonCode) {
  return call(
    `/lessons/${encodeURIComponent(lessonCode)}/practice/overview`,
    { headers: { Authorization: `Bearer ${token}` } },
    'Impossible de charger la pratique.',
  );
}

/** Ouvre une séance, ou retrouve celle qui porte déjà cet identifiant. */
export function startPracticeSession(token, lessonCode, sessionId, level) {
  return call(
    `/lessons/${encodeURIComponent(lessonCode)}/practice/sessions`,
    auth(token, { sessionId, level }),
    'Impossible de démarrer la séance.',
  );
}

/** Une séance par son identifiant — ouverte ou terminée. */
export function fetchPracticeSession(token, sessionId) {
  return call(
    `/practice/sessions/${encodeURIComponent(sessionId)}`,
    { headers: { Authorization: `Bearer ${token}` } },
    'Séance introuvable.',
  );
}

/** Ouvre une question — c'est cette tentative qui portera les indices. */
export function openQuestion(token, sessionId, exerciseId, questionId, attemptUuid) {
  return call(
    `/practice/sessions/${encodeURIComponent(sessionId)}/questions`,
    auth(token, { exerciseId, questionId, attemptUuid }),
    'Impossible d’ouvrir la question.',
  );
}

/** Révèle l'indice suivant. Le serveur décide lequel : on ne peut pas sauter. */
export function requestHint(token, attemptUuid) {
  return call(
    `/practice/question-attempts/${encodeURIComponent(attemptUuid)}/hints`,
    auth(token),
    'Aucun indice supplémentaire.',
  );
}

/** Enregistre une réponse et la preuve d'apprentissage qui en découle. */
export function submitAnswer(token, sessionId, payload) {
  return call(
    `/practice/sessions/${encodeURIComponent(sessionId)}/answers`,
    auth(token, payload),
    'Impossible d’enregistrer ta réponse.',
  );
}

/** Marque un exercice terminé — ce qui fait avancer le déverrouillage. */
export function completeExercise(token, sessionId, exerciseId) {
  return call(
    `/practice/sessions/${encodeURIComponent(sessionId)}/exercise-completions`,
    auth(token, { exerciseId }),
    'Impossible de valider l’exercice.',
  );
}

/** Clôt la séance et renvoie son bilan. */
export function completeSession(token, sessionId) {
  return call(
    `/practice/sessions/${encodeURIComponent(sessionId)}/complete`,
    auth(token),
    'Impossible de clore la séance.',
  );
}

/** Ajoute une note au carnet. */
export function createNote(token, note) {
  return call('/practice/notes', auth(token, note), 'Impossible d’enregistrer ta note.');
}

/**
 * Les notes du carnet, éventuellement filtrées sur une leçon.
 *
 * Le serveur remonte les notes « à revoir » d'abord — c'est la lecture par
 * défaut du carnet, qui sert à traiter ce qui reste en suspens.
 */
export function fetchNotes(token, lessonCode = null) {
  const query = lessonCode ? `?lessonCode=${encodeURIComponent(lessonCode)}` : '';

  return call(
    `/practice/notes${query}`,
    { headers: { Authorization: `Bearer ${token}` } },
    'Impossible de charger ton carnet.',
  );
}

/**
 * Modifie une note : son texte, son type d'erreur, ou son état « traitée ».
 *
 * `completed` se pose ET se retire — une note remise à revoir est un geste
 * légitime, pas une correction d'erreur. Le serveur en conserve la date.
 */
export function updateNote(token, id, patch) {
  return call(
    `/practice/notes/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(patch),
    },
    'Impossible de modifier ta note.',
  );
}

/** Supprime définitivement une note du carnet. */
export function deleteNote(token, id) {
  return call(
    `/practice/notes/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    },
    'Impossible de supprimer ta note.',
  );
}
