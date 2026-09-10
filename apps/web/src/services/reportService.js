import { apiRequest, ApiError, classifyStatus } from './apiClient';

/**
 * « Signaler un problème », côté élève.
 *
 * N'envoie que des CODES de contenu — jamais d'identifiant de base. Le
 * serveur reconstruit lui-même la leçon, le module et la tentative
 * (App\Domain\Admin\ReportService) : c'est ce qui permet à l'élève de ne rien
 * avoir à identifier, et ce qui empêche un client de désigner le contenu d'un
 * autre.
 *
 * @param {string} token
 * @param {{
 *   category: string, note?: string,
 *   lessonCode?: string, grade?: string, moduleNumber?: number, step?: string,
 *   exerciseCode?: string, questionId?: string, sessionId?: string, attemptUuid?: string,
 * }} report
 */
export async function createReport(token, report) {
  const { ok, status, data } = await apiRequest('/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ ...report, ...collectDiagnostics() }),
  });

  if (!ok) {
    throw new ApiError(data?.message || 'Impossible d’envoyer le signalement.', classifyStatus(status), status);
  }

  return data.report;
}

/**
 * Contexte technique, et RIEN de personnel : de quoi reproduire un bug
 * d'affichage, pas de quoi identifier quelqu'un. Le serveur ne conserve ces
 * champs que pour les catégories qui décrivent une panne.
 */
function collectDiagnostics() {
  if (typeof window === 'undefined') return {};

  return {
    route: window.location?.pathname,
    browser: detectBrowser(),
    os: detectOs(),
    screen: `${window.screen?.width ?? '?'}x${window.screen?.height ?? '?'}`,
  };
}

function detectBrowser() {
  const ua = navigator.userAgent || '';
  // Ordre volontaire : Edge et Opera contiennent « Chrome » dans leur UA, et
  // Chrome contient « Safari ». Le plus spécifique gagne.
  if (/Edg\//.test(ua)) return 'Edge';
  if (/OPR\//.test(ua)) return 'Opera';
  if (/Firefox\//.test(ua)) return 'Firefox';
  if (/Chrome\//.test(ua)) return 'Chrome';
  if (/Safari\//.test(ua)) return 'Safari';
  return 'Autre';
}

function detectOs() {
  const ua = navigator.userAgent || '';
  if (/Android/.test(ua)) return 'Android';
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
  if (/Windows/.test(ua)) return 'Windows';
  if (/Mac OS X/.test(ua)) return 'macOS';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Autre';
}

/** Les catégories proposées à l'élève, dans un ordre qui va du plus fréquent au moins. */
export const REPORT_CATEGORIES = [
  { id: 'wrong_answer', label: 'La réponse attendue est fausse' },
  { id: 'content_error', label: 'Erreur dans le contenu' },
  { id: 'unclear_question', label: 'Énoncé pas clair' },
  { id: 'display_problem', label: 'Problème d’affichage' },
  { id: 'interaction_problem', label: 'Ça ne réagit pas comme prévu' },
  { id: 'technical_problem', label: 'Problème technique' },
  { id: 'typo', label: 'Faute de frappe' },
  { id: 'other', label: 'Autre' },
];
