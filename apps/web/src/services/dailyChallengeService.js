import { call, get, send } from './teacher/teacherClient';

/**
 * Transport du « Défi du jour » côté élève (docs/architecture/DAILY_CHALLENGE.md).
 *
 * Le client n'envoie JAMAIS un score, un temps, une justesse ou une série :
 * une position et une réponse brute, rien d'autre. Le serveur sert les
 * questions sans clé de réponse, chronomètre, juge et compte. Les erreurs
 * portent un `reason` clos (`expired`, `already_answered`, `window_closed`…)
 * que l'écran dit en français.
 */
const KEY = 'dailyChallenge';

/** L'écran du jour : défi, série, cumul, ce que la classe laisse voir. */
export function fetchTodayChallenge(token) {
  return call('/daily-challenge', get(token), KEY);
}

/** Ouvre — ou retrouve — LA tentative du jour. */
export function startChallenge(token) {
  return call('/daily-challenge/start', send('POST', token), KEY);
}

/** Sert la question suivante ; renvoie la même tant qu'elle n'est pas répondue. */
export function openNextQuestion(token, attemptId) {
  return call(`/daily-challenge/attempts/${encodeURIComponent(attemptId)}/next`, send('POST', token), KEY);
}

export function submitChallengeAnswer(token, attemptId, position, answer) {
  return call(`/daily-challenge/attempts/${encodeURIComponent(attemptId)}/answers`, send('POST', token, { position, answer }), KEY);
}

export function completeChallenge(token, attemptId) {
  return call(`/daily-challenge/attempts/${encodeURIComponent(attemptId)}/complete`, send('POST', token), KEY);
}

export function fetchChallengeHistory(token, days = 30) {
  return call(`/daily-challenge/history?days=${days}`, get(token), KEY);
}

export function fetchChallengeReview(token, attemptId) {
  return call(`/daily-challenge/attempts/${encodeURIComponent(attemptId)}/review`, get(token), KEY);
}
