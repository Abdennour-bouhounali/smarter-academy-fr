import { apiRequest, ApiError, classifyStatus } from './apiClient';

/**
 * L'autorité de publication, telle que le serveur la voit.
 *
 * Le catalogue des leçons vit dans le bundle (packages/core/curriculum), donc
 * sans cet appel le frontend n'a AUCUN moyen de savoir qu'une leçon vient
 * d'être masquée : il continuerait de l'afficher, et l'élève ne le
 * découvrirait qu'en butant sur un refus.
 *
 * Ce que renvoie le serveur est une liste de FERMETURES, pas d'ouvertures :
 * la base miroite le catalogue, elle ne le redéfinit pas. Absent de la liste
 * = ouvert.
 */
export async function fetchClosedContent(token) {
  const { ok, status, data } = await apiRequest('/content/availability', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!ok) {
    throw new ApiError(data?.message || 'Impossible de vérifier la disponibilité.', classifyStatus(status), status);
  }

  return data.closed;
}

/**
 * L'inventaire des exercices d'une leçon — servi par le REGISTRE.
 *
 * Remplace la lecture directe de l'index embarqué : un exercice masqué ne
 * doit plus apparaître dans la liste, et pas seulement échouer à l'ouverture.
 */
export async function fetchLessonExercises(token, lessonCode) {
  const { ok, status, data } = await apiRequest(
    `/lessons/${encodeURIComponent(lessonCode)}/exercises`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!ok) {
    throw new ApiError(data?.message || 'Impossible de charger les exercices.', classifyStatus(status), status);
  }

  return data;
}
