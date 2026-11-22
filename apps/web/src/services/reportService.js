import { apiRequest, ApiError, classifyStatus } from './apiClient';
import { apiMessage } from './apiMessage';

/**
 * « Signaler un problème » — administrateur et AMBASSADEURS.
 *
 * UN envoi, multipart (depuis 2026-10-05) : le contexte, la catégorie, une
 * note facultative et une capture d'écran facultative (zone fautive déjà
 * encadrée). Le clic sur le bouton n'envoie RIEN.
 *
 * N'envoie que des CODES de contenu — jamais d'identifiant de base. Le
 * serveur reconstruit lui-même la leçon, le module et la tentative
 * (App\Domain\Admin\ReportService) : un client ne peut pas désigner le
 * contenu d'un autre.
 *
 * @param {string} token
 * @param {{
 *   source: 'lesson'|'module'|'exercise'|'question'|'diagnostic',
 *   context?: object, category: string, note?: string, screenshot?: Blob|null,
 * }} report
 */
export async function submitReport(token, { source, context = {}, category, note, screenshot = null }) {
  const body = new FormData();
  const fields = { source, ...context, ...collectDiagnostics(), category, note: note || undefined };
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === '') continue;
    body.append(key, String(value));
  }
  if (screenshot) {
    const extension = screenshot.type === 'image/webp' ? 'webp' : screenshot.type === 'image/jpeg' ? 'jpg' : 'png';
    body.append('screenshot', screenshot, `capture.${extension}`);
  }

  // Sans Content-Type : le navigateur pose lui-même la frontière multipart.
  const { ok, status, data } = await apiRequest('/reports', {
    method: 'POST',
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    body,
  });

  if (!ok) {
    throw new ApiError(apiMessage('reportSend', data, status), classifyStatus(status), status);
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
