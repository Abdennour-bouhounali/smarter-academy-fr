import { call, get, query } from './adminClient';

/** Le tableau de bord : compteurs, alertes, activité récente. */
export function fetchDashboard(token) {
  return call('/admin/dashboard', get(token), 'Impossible de charger le tableau de bord.')
    .then((data) => data.dashboard);
}

export function fetchPlatformAnalytics(token, range = {}) {
  return call(`/admin/analytics/platform${query(range)}`, get(token), 'Impossible de charger les statistiques.')
    .then((data) => data.analytics);
}

export function fetchLearningAnalytics(token, range = {}) {
  return call(`/admin/analytics/learning${query(range)}`, get(token), 'Impossible de charger les statistiques.')
    .then((data) => data.analytics);
}

export function fetchContentAnalytics(token, filters = {}) {
  return call(`/admin/analytics/content${query(filters)}`, get(token), 'Impossible de charger les statistiques.')
    .then((data) => data.analytics);
}

export function fetchLearningPointAnalytics(token, filters = {}) {
  return call(`/admin/analytics/learning-points${query(filters)}`, get(token), 'Impossible de charger les statistiques.')
    .then((data) => data.analytics);
}
