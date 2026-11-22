import { call, get, send, query } from './adminClient';

/**
 * L'ACTIVATION MANUELLE — le seul geste commercial du produit algérien.
 * L'argent est reçu hors plateforme ; l'administrateur active l'offre sur le
 * compte, ou envoie un code. Les demandes ne sont qu'une file d'attente.
 * `role` vaut 'teachers' ou 'students'.
 */
export function fetchAccountSubscription(token, role, id) {
  return call(`/admin/${role}/${encodeURIComponent(id)}/subscription`, get(token), 'Impossible de charger l’état commercial.');
}

/** `studentSeats` est un NOMBRE d'élèves ; jamais un prix — le serveur le calcule de la version figée. */
export function activatePlan(token, role, id, { planId, planVersionId, endsAt, note, studentSeats }) {
  return call(`/admin/${role}/${encodeURIComponent(id)}/subscriptions`, send('POST', token, { planId, planVersionId, endsAt, note, studentSeats }), 'Impossible d’activer l’offre.');
}

export function issueActivationCode(token, role, id, { planId, planVersionId, redeemBy, accessDays, accessEndsAt, studentSeats }) {
  return call(`/admin/${role}/${encodeURIComponent(id)}/activation-codes`, send('POST', token, { planId, planVersionId, redeemBy, accessDays, accessEndsAt, studentSeats }), 'Impossible d’envoyer le code.');
}

export function fetchSubscriptionRequests(token, filters = {}) {
  return call(`/admin/subscription-requests${query(filters)}`, get(token), 'Impossible de charger les demandes.');
}

export function rejectSubscriptionRequest(token, requestId, reason, note) {
  return call(`/admin/subscription-requests/${encodeURIComponent(requestId)}/reject`, send('POST', token, { reason, note }), 'Impossible de refuser la demande.').then((d) => d.request);
}

/** @param {'suspend'|'resume'|'cancel'|'extend'|'change-plan'} action */
export function subscriptionAction(token, subscriptionId, action, payload = {}) {
  return call(`/admin/subscriptions/${encodeURIComponent(subscriptionId)}/${action}`, send('POST', token, payload), 'Impossible de modifier l’abonnement.');
}
