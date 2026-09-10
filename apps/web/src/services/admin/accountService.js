import { call, get, send, query } from './adminClient';

export function fetchAccount(token) {
  return call('/admin/account', get(token), 'Impossible de charger le compte.')
    .then((data) => data.account);
}

export function updateProfile(token, { firstName, lastName }) {
  return call('/admin/account/profile', send('PATCH', token, { firstName, lastName }), 'Impossible de mettre à jour le profil.')
    .then((data) => data.account);
}

export function updateEmail(token, { currentPassword, email }) {
  return call('/admin/account/email', send('PATCH', token, { currentPassword, email }), 'Impossible de changer l’email.');
}

/**
 * Le mot de passe actuel est exigé, et les AUTRES sessions sont révoquées —
 * la réponse dit combien.
 */
export function updatePassword(token, { currentPassword, password, passwordConfirmation }) {
  return call(
    '/admin/account/password',
    send('PATCH', token, {
      currentPassword,
      password,
      password_confirmation: passwordConfirmation,
    }),
    'Impossible de changer le mot de passe.',
  );
}

export function fetchSubscriptions(token, filters = {}) {
  return call(`/admin/subscriptions${query(filters)}`, get(token), 'Impossible de charger les abonnements.');
}

export function fetchPayments(token, filters = {}) {
  return call(`/admin/payments${query(filters)}`, get(token), 'Impossible de charger les paiements.');
}

export function fetchActivityLog(token, filters = {}) {
  return call(`/admin/activity-log${query(filters)}`, get(token), 'Impossible de charger le journal.')
    .then((data) => data.logs);
}
