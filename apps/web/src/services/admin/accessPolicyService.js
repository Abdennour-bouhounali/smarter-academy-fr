import { call, get, send } from './adminClient';

/** « الوصول والحدود » : réglages par palier et consommation. */
export function fetchAccessPolicies(token) {
  return call('/admin/access-policies', get(token), 'Impossible de charger les réglages d’accès.');
}

export function updateAccessPolicy(token, key, body) {
  return call(`/admin/access-policies/${encodeURIComponent(key)}`, send('PUT', token, body), 'Impossible d’enregistrer le réglage.').then((d) => d.feature);
}

export function fetchAccessUsage(token) {
  return call('/admin/access-usage', get(token), 'Impossible de charger la consommation.').then((d) => d.usage);
}

export function fetchUserFeatureUsage(token, userId) {
  return call(`/admin/users/${encodeURIComponent(userId)}/feature-usage`, get(token), 'Impossible de charger la consommation du compte.').then((d) => d.usage);
}
