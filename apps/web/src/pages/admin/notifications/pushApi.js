import { call, get, send } from '../../../services/admin/adminClient';

// Notifications du tableau de bord sur l'appareil du compte connecté (BOOKS_STORE.md §6quater).
export const fetchPush = (token, endpoint) =>
  call(`/admin/push${endpoint ? `?endpoint=${encodeURIComponent(endpoint)}` : ''}`, get(token), 'Impossible de lire les notifications.');
export const savePushSubscription = (token, sub) => call('/admin/push/subscriptions', send('POST', token, sub), 'Activation impossible.');
export const savePushTopics = (token, endpoint, topics) => call('/admin/push/subscriptions', send('PATCH', token, { endpoint, topics }), 'Enregistrement impossible.');
export const removePushSubscription = (token, endpoint) => call('/admin/push/subscriptions', send('DELETE', token, { endpoint }), 'Désactivation impossible.');
export const testPush = (token) => call('/admin/push/test', send('POST', token, {}), 'Envoi du test impossible.');
