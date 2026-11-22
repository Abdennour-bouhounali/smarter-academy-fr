import { call, get, send } from './adminClient';

/** Ce que la suppression définitive emportera — compté par le serveur. */
export function fetchUserDeletionPreview(token, id) {
  return call(
    `/admin/users/${encodeURIComponent(id)}/deletion-preview`,
    get(token),
    'تعذّر تحميل ما سيُحذف.',
  ).then((data) => data.summary);
}

/**
 * Suppression DÉFINITIVE. `confirmEmail` est l'adresse retapée par
 * l'administrateur : le serveur la revérifie.
 */
export function deleteUser(token, id, confirmEmail) {
  return call(
    `/admin/users/${encodeURIComponent(id)}`,
    send('DELETE', token, { confirmEmail }),
    'تعذّر حذف الحساب.',
  );
}
