import { apiRequest, ApiError, classifyStatus } from './apiClient';
import { apiMessage } from './apiMessage';

/** « Que puis-je utiliser, et combien m'en reste-t-il ? » — GET /me/feature-access. */
export async function fetchFeatureAccess(token) {
  const { ok, status, data } = await apiRequest('/me/feature-access', { headers: { Authorization: `Bearer ${token}` } });
  if (!ok) throw new ApiError(apiMessage('generic', data, status), classifyStatus(status), status);

  return data;
}
