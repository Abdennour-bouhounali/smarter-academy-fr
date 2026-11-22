import { apiBlob, apiRequest, ApiError, classifyStatus } from './apiClient';
import { apiMessage } from './apiMessage';

/**
 * Transport pour le moteur d'exercices — même forme que diagnosticService.js.
 *
 * Mastery V2 : la justesse d'une réponse est JUGÉE PAR LE SERVEUR. Le client
 * envoie la réponse brute (et, facultatif, sa prédiction `outcome` pour la
 * comparaison en ombre) ; la réponse porte `evaluation`, le verdict qui
 * s'affiche. Ce que le serveur possède : la propriété de la séance,
 * l'évaluation, les points d'apprentissage crédités — lus dans le contenu,
 * pas dans la requête —, l'idempotence, et l'arithmétique de la maîtrise.
 */

async function call(path, options) {
  const { ok, status, data } = await apiRequest(path, options);
  if (!ok) {
    const error = new ApiError(apiMessage('practice', data, status), classifyStatus(status), status);
    // Le CODE et le corps (un refus « الوصول والحدود » y porte son quota) :
    // lus par refusalFromError, jamais affichés tels quels.
    error.code = typeof data?.code === 'string' ? data.code : null;
    error.data = data ?? null;
    throw error;
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

/**
 * Enregistre une réponse ; le serveur la juge et en tire la preuve
 * d'apprentissage.
 *
 * @param {string} token
 * @param {string} sessionId
 * @param {{attemptUuid: string, answer: object|null, outcome?: string}} payload
 *        `outcome` n'est que la PRÉDICTION du client (comparaison en ombre).
 * @returns {Promise<{success: boolean, duplicate: boolean,
 *   attempt: {attemptUuid: string, outcome: string, evaluatedBy: string, hintsUsed: number},
 *   evaluation: {outcome: string, isCorrect: boolean, misconceptionId: string|null, normalized: string, feedbackKey: string}}>}
 */
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

/**
 * Le prochain exercice conseillé par le sélecteur (Mastery V2, phase 9).
 * `exerciseId: null` = niveau épuisé ; `reason: 'disabled'` = sélecteur
 * coupé côté serveur, le client reprend l'ordre du contenu
 * (features/practice/nextExercise.js).
 *
 * @returns {Promise<{success: boolean, exerciseId: string|null,
 *   reason: 'weak_learning_point'|'unseen'|'recent_misconception'|'order'|'disabled', candidates: number}>}
 */
export function fetchNextExercise(token, sessionId) {
  return call(
    `/practice/sessions/${encodeURIComponent(sessionId)}/next`,
    { headers: { Authorization: `Bearer ${token}` } },
    'Impossible de choisir l’exercice suivant.',
  );
}

/** La « خزانة الميداليات » de l'élève pour une leçon (médailles déduites des réponses). */
export function fetchLessonMedals(token, lessonCode) {
  return call(
    `/lessons/${encodeURIComponent(lessonCode)}/practice/medals`,
    { headers: { Authorization: `Bearer ${token}` } },
    'Impossible de lire les médailles.',
  );
}

/**
 * Les réponses ENREGISTRÉES de la séance, exercice par exercice — la source de
 * « التمرين السابق » (feuille d'examen, 2026-10-06), lue en base.
 */
export function fetchSessionAnswers(token, sessionId) {
  return call(
    `/practice/sessions/${encodeURIComponent(sessionId)}/answers`,
    { headers: { Authorization: `Bearer ${token}` } },
    'Impossible de relire les réponses de la séance.',
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
 * Les notes du carnet.
 *
 * Deux lectures du même point d'entrée :
 *  - `fetchNotes(token, 'lesson-code')` ou `fetchNotes(token)` : toutes les
 *    notes (hors archives), à revoir d'abord — la lecture historique ;
 *  - `fetchNotes(token, { view, q, sort, page, perPage, lessonCode, … })` :
 *    une PAGE de « Mon cahier », avec `meta` (total, hasMore), `counts` (les
 *    compteurs de l'en-tête) et `facets.lessons` (les leçons représentées).
 */
export function fetchNotes(token, params = null) {
  const search = new URLSearchParams();
  if (typeof params === 'string') {
    search.set('lessonCode', params);
  } else if (params && typeof params === 'object') {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '' && value !== false) search.set(key, String(value));
    });
  }
  const query = search.toString();

  return call(
    `/practice/notes${query ? `?${query}` : ''}`,
    { headers: { Authorization: `Bearer ${token}` } },
    'Impossible de charger ton carnet.',
  );
}

/** Une note seule, la mienne — 404 sinon. */
export function fetchNote(token, id) {
  return call(
    `/practice/notes/${encodeURIComponent(id)}`,
    { headers: { Authorization: `Bearer ${token}` } },
    'Impossible de charger cette note.',
  );
}

/** Une révision active : `known` (je la sais) ou `again` (à revoir plus tard). */
export function reviewNote(token, id, outcome) {
  return call(`/practice/notes/${encodeURIComponent(id)}/review`, auth(token, { outcome }), 'Impossible d’enregistrer la révision.');
}

/** Archiver, désarchiver, remettre à revoir ou supprimer plusieurs notes d'un coup. */
export function bulkNotes(token, ids, action) {
  return call('/practice/notes/bulk', auth(token, { ids, action }), 'Impossible d’appliquer l’action.');
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

/* ── Photos de copie et correction de l'enseignant (prototype BEM, 2026-10-06) ── */

/**
 * Joint UNE photo à l'étape ouverte (avant la réponse). Le refus porte un
 * `code` (`image_unsupported`, `image_too_large`, `image_limit_reached`,
 * `answer_locked`) que l'écran traduit.
 *
 * @param {Blob} blob  la photo déjà réduite par prepareAnswerImage
 * @returns {Promise<{success: boolean, image: {id: string, width: number, height: number, annotated: boolean}}>}
 */
export function uploadAnswerImage(token, attemptUuid, blob) {
  const body = new FormData();
  body.append('image', blob, 'copie.jpg');
  return call(
    `/practice/question-attempts/${encodeURIComponent(attemptUuid)}/images`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, body },
    'Impossible d’envoyer la photo.',
  );
}

/** Retire une photo — seulement avant d'avoir répondu. */
export function deleteAnswerImage(token, imageId) {
  return call(
    `/practice/answer-images/${encodeURIComponent(imageId)}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } },
    'Impossible de retirer la photo.',
  );
}

/** Les octets d'une photo de l'élève (`annotated` : la copie annotée par l'enseignant). */
export function fetchAnswerImage(token, imageId, annotated = false) {
  return apiBlob(
    `/practice/answer-images/${encodeURIComponent(imageId)}${annotated ? '?annotated=1' : ''}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
}

/** Une correction de l'enseignant, ouverte depuis la cloche (lecture seule). */
export function fetchAnswerReview(token, reviewId) {
  return call(
    `/practice/reviews/${encodeURIComponent(reviewId)}`,
    { headers: { Authorization: `Bearer ${token}` } },
    'Impossible d’ouvrir la correction.',
  );
}
