import { call, get, send, query } from './adminClient';
import { apiBlob } from '../apiClient';

export function fetchReports(token, filters = {}) {
  return call(`/admin/reports${query(filters)}`, get(token), 'Impossible de charger les signalements.');
}

export function fetchReport(token, id) {
  return call(`/admin/reports/${encodeURIComponent(id)}`, get(token), 'Impossible de charger le signalement.')
    .then((data) => data.report);
}

/** @param {{status?: string, priority?: string, assignedTo?: number|null, duplicateOfId?: number|null}} changes */
export function updateReport(token, id, changes) {
  return call(
    `/admin/reports/${encodeURIComponent(id)}`,
    send('PATCH', token, changes),
    'Impossible de mettre à jour le signalement.',
  ).then((data) => data.report);
}

/** Note INTERNE — jamais visible par l'élève. */
export function addReportNote(token, id, body) {
  return call(
    `/admin/reports/${encodeURIComponent(id)}/notes`,
    send('POST', token, { body }),
    'Impossible d’ajouter la note.',
  ).then((data) => data.note);
}

/**
 * La capture d'écran jointe, en URL d'objet (blob:) — la route est
 * authentifiée, une balise <img> ne peut donc pas la charger directement.
 * L'appelant révoque l'URL quand il n'en a plus besoin.
 */
export async function fetchReportScreenshotUrl(token, id) {
  const blob = await apiBlob(`/admin/reports/${encodeURIComponent(id)}/screenshot`, get(token));
  return URL.createObjectURL(blob);
}
