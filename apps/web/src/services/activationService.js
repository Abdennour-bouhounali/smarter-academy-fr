import { apiRequest } from './apiClient';
import { ApiError, classifyStatus } from '@smarter-academy/core';
import { apiMessage } from './apiMessage';

/**
 * La saisie d'un code d'activation (`/espace/activation`).
 *
 * Ce module n'accorde RIEN et ne décide RIEN : il transmet un code et rend ce
 * que le serveur a décidé. L'accès premium est une réponse du serveur
 * (`access`), jamais une déduction du client — un élève qui modifierait ce
 * fichier, son stockage local ou l'état React n'obtiendrait toujours rien,
 * parce que ContentAccess refuse côté API.
 *
 * ── Le MOTIF voyage avec l'erreur ───────────────────────────────────────
 * Le serveur rend un `reason` dans un vocabulaire clos (invalid,
 * already_activated, expired, revoked). Il est recopié sur l'ApiError parce
 * que ces quatre cas appellent quatre conduites différentes chez l'élève :
 * retaper, contacter le vendeur, ou ne rien faire. Un seul message « code
 * refusé » les laisserait tous à la même impasse.
 */
export async function redeemActivationCode(token, code) {
  const { ok, status, data } = await apiRequest('/activation-codes/redeem', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ code }),
  });

  if (!ok) {
    const error = new ApiError(
      apiMessage('activation', data, status),
      classifyStatus(status),
      status,
    );
    // Présent seulement sur un refus métier (422) ; absent sur un 429 ou une
    // panne réseau, où le type de l'erreur porte déjà toute l'information.
    error.reason = data?.reason ?? null;
    throw error;
  }

  return data;
}
