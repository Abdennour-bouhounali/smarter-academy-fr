import { call, get, send, query } from './adminClient';

export function fetchReports(token, filters = {}) {
  return call(`/admin/reports${query(filters)}`, get(token), 'Impossible de charger les signalements.');
}

export function fetchReport(token, id) {
  return call(`/admin/reports/${encodeURIComponent(id)}`, get(token), 'Impossible de charger le signalement.')
    .then((data) => data.report);
}

export function fetchReportClusters(token) {
  return call('/admin/reports/clusters', get(token), 'Impossible de charger les groupes.')
    .then((data) => data.clusters);
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
