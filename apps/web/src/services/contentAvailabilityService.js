import { apiRequest, ApiError, classifyStatus } from './apiClient';
import { apiMessage } from './apiMessage';

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
  // Sans jeton : l'inventaire du VISITEUR (route publique, même calcul pour
  // un utilisateur null). Le catalogue embarqué ne porte aucun palier —
  // lessons.tier, en base, est la seule source de vérité — donc un visiteur
  // doit lui aussi demander au serveur ce qui est premium.
  const { ok, status, data } = token
    ? await apiRequest('/content/availability', { headers: { Authorization: `Bearer ${token}` } })
    : await apiRequest('/content/availability/public');

  if (!ok) {
    throw new ApiError(apiMessage('availability', data, status), classifyStatus(status), status);
  }

  // `closed` ET `access` : le premier dit ce qui est retiré, le second à quoi
  // l'élève a droit. Deux notions distinctes servies par un seul appel — voir
  // ContentAvailabilityContext pour pourquoi elles ne sont pas fusionnées.
  return { ...data.closed, access: data.access ?? null };
}

