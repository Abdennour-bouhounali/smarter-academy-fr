import { apiRequest, ApiError, classifyStatus } from './apiClient';

/**
 * Submits a contact-form request.
 * @param {{name: string, email: string, message: string, classe?: string, ville?: string, objectif?: string, phone?: string}} formData
 * @throws {ApiError} On network failure or a non-2xx response.
 */
export async function submitContactRequest(formData) {
  const { ok, status, data } = await apiRequest('/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  if (!ok) {
    throw new ApiError(data?.message || 'Une erreur est survenue.', classifyStatus(status), status);
  }

  return data;
}

/**
 * Fetches all contact-form submissions (admin only).
 * @returns {Promise<Array>} The list of submissions, or an empty array if none.
 * @throws {ApiError} On network failure or a non-2xx response.
 */
export async function fetchContactSubmissions(token) {
  const { ok, status, data } = await apiRequest('/contact', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!ok) {
    throw new ApiError('Erreur lors de la récupération des messages', classifyStatus(status), status);
  }

  return data?.contacts || [];
}
