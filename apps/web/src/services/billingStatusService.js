import { apiRequest, ApiError, classifyStatus } from './apiClient';

/**
 * « Is online payment open? » — GET /billing/status, public, the same answer for a visitor and an account
 * (PaymentGate, docs/FRANCE_REBUILD_PLAN.md §4ter). Only `true` opens: any other body is read as closed.
 *
 * @returns {Promise<boolean>}
 */
export async function fetchBillingStatus() {
  const { ok, status, data } = await apiRequest('/billing/status');
  if (!ok) throw new ApiError('Impossible de lire l’état du paiement.', classifyStatus(status), status);

  return data?.open === true;
}
