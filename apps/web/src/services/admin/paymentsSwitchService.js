import { apiRequest, ApiError, classifyStatus } from '../apiClient';
import { get, send } from './adminClient';

/**
 * The online-payment switch (GET / PATCH /admin/payments/switch — PaymentGate, FRANCE_REBUILD_PLAN.md §4ter). The
 * answer carries NAMES of what is missing, never a value.
 *
 * @typedef {{ open: boolean, default: boolean, provider: string, mode: string, configured: boolean,
 *             missing: string[], lastChange: null | { at: ?string, by: null | { id: number, name: string } } }} PaymentsSwitch
 */

async function switchCall(options, fallbackMessage) {
  const { ok, status, data } = await apiRequest('/admin/payments/switch', options);
  if (!ok) {
    const error = new ApiError(data?.message || fallbackMessage, classifyStatus(status), status);
    // `payments_not_configured` (422) names what the provider lacks: the panel lists it.
    error.code = data?.code ?? null;
    error.missing = Array.isArray(data?.missing) ? data.missing : [];
    throw error;
  }
  return data.payments;
}

/** @returns {Promise<PaymentsSwitch>} */
export function fetchPaymentsSwitch(token) {
  return switchCall(get(token), 'Impossible de lire l’état du paiement.');
}

/** @returns {Promise<PaymentsSwitch>} */
export function updatePaymentsSwitch(token, open) {
  return switchCall(send('PATCH', token, { open }), 'Impossible de changer l’état du paiement.');
}
