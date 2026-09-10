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
/**
 * LE SIGNAL — appelé au clic, avant toute saisie.
 *
 * « Un élève a buté ici » est déjà une information exploitable, même s'il
 * referme la fenêtre sans rien écrire. Attendre l'envoi du formulaire ferait
 * perdre exactement ce qu'on cherche à mesurer.
 *
 * Le serveur déduplique : ouvrir et refermer la fenêtre plusieurs fois sur le
 * même contexte renvoie le même signalement, il n'en fabrique pas cinq.
 *
 * @param {string} token
 * @param {{ source: 'lesson'|'module'|'exercise'|'question'|'diagnostic',
 *   lessonCode?: string, grade?: string, moduleNumber?: number, step?: string,
 *   exerciseCode?: string, questionId?: string, sessionId?: string, attemptUuid?: string }} context
 * @returns {Promise<{id: number, source: string, submitted: boolean}>}
 */
export async function initiateReport(token, context) {
  const { ok, status, data } = await apiRequest('/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ ...context, ...collectDiagnostics() }),
  });

  if (!ok) {
    throw new ApiError(data?.message || 'Impossible d’ouvrir le signalement.', classifyStatus(status), status);
  }

  return data.report;
}

/**
 * LA COMPLÉTION — la catégorie et, si l'élève le veut, ses mots.
 *
 * La note reste facultative pour TOUTES les catégories, « Autre » comprise :
 * exiger une explication écrite ferait taire la moitié des élèves, et un
 * signalement sans mot reste un signalement.
 */
export async function completeReport(token, reportId, { category, note }) {
  const { ok, status, data } = await apiRequest(`/reports/${encodeURIComponent(reportId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ category, note: note || undefined }),
  });

  if (!ok) {
    throw new ApiError(data?.message || 'Impossible d’envoyer le signalement.', classifyStatus(status), status);
  }

  return data;
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

/**
 * Ce que l'élève peut signaler.
 *
 * Formulées comme des CONSTATS, jamais comme des diagnostics : « la
 * manipulation ne fonctionne pas » est ce que l'élève voit ; « bug
 * JavaScript » serait lui demander de poser un diagnostic à notre place.
 *
 * L'ordre suit ce qu'un élève rencontre le plus souvent, pas l'alphabet.
 */
export const REPORT_CATEGORIES = [
  { id: 'math_error', label: 'Erreur mathématique', hint: 'Un calcul, une formule, un graphique ou un raisonnement semble faux.' },
  { id: 'manipulation_not_working', label: 'La manipulation ne fonctionne pas', hint: 'Un élément à déplacer, à cliquer ou à régler ne réagit pas correctement.' },
  { id: 'unclear_question', label: 'Question peu claire', hint: 'L’énoncé ou la consigne est difficile à comprendre.' },
  { id: 'answer_correction_problem', label: 'Problème dans la réponse ou la correction', hint: 'La réponse attendue, la correction ou l’explication semble incorrecte.' },
  { id: 'display_problem', label: 'Problème d’affichage', hint: 'Quelque chose est mal placé, illisible, superposé ou manquant.' },
  { id: 'typo', label: 'Faute de texte', hint: 'Orthographe, notation ou formulation.' },
  { id: 'other', label: 'Autre', hint: 'Autre chose — dis-nous quoi ci-dessous.' },
];

/** Les sources de signalement, telles que le serveur les nomme. */
export const REPORT_SOURCES = {
  LESSON: 'lesson',
  MODULE: 'module',
  EXERCISE: 'exercise',
  QUESTION: 'question',
  DIAGNOSTIC: 'diagnostic',
};
