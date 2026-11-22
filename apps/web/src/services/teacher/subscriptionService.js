import { call, get, send } from './teacherClient';

/** Les offres ET ce que le gratuit accorde déjà en sièges (freeSeats). */
export function fetchPlanCatalog(token) {
  return call('/me/plans', get(token), 'plansLoad').then((d) => ({ plans: d.plans, freeSeats: d.freeSeats ?? null }));
}

export function fetchMySubscription(token) {
  return call('/me/subscription', get(token), 'plansLoad');
}

/** Une DEMANDE : le nombre d'élèves voulu, jamais un prix — le serveur le calcule. */
export function requestPlan(token, planId, note, studentSeats) {
  return call('/me/subscription-requests', send('POST', token, { planId, note: note || undefined, studentSeats: studentSeats || undefined }), 'planRequest');
}

export function cancelPlanRequest(token, requestId) {
  return call(`/me/subscription-requests/${encodeURIComponent(requestId)}/cancel`, send('POST', token), 'planRequest');
}
