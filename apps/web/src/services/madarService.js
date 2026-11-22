import { call, get, send } from './teacher/teacherClient';

/**
 * Transport de « Madar » côté élève (docs/architecture/MADAR_GAME.md).
 *
 * Le client n'envoie jamais un cœur, une durée ou une justesse : un score
 * (borné par le serveur avec la durée RÉELLE de la partie) et une réponse
 * brute. Les erreurs portent un `reason` clos (`no_hearts`, `daily_cap`,
 * `hearts_full`…) que l'écran dit en français.
 */
const KEY = 'madar';

/**
 * Les appels du jeu pour un ÉLÈVE (`classId` absent : /madar) ou pour un
 * ENSEIGNANT qui joue dans une de ses classes (« Défie ton professeur » :
 * /teacher/classrooms/{id}/madar/play). Mêmes réponses des deux côtés.
 */
export function madarApi(classId = null) {
  const base = classId ? `/teacher/classrooms/${encodeURIComponent(classId)}/madar/play` : '/madar';
  return {
    fetchMadar: (token) => call(base, get(token), KEY),
    startRun: (token, game = 'orbit', level = null) => call(`${base}/runs`, send('POST', token, { game, ...(level ? { level } : {}) }), KEY),
    reviveRun: (token, runId) => call(`${base}/runs/${encodeURIComponent(runId)}/revive`, send('POST', token), KEY),
    finishRun: (token, runId, score, stars, wave, completed, extra = {}) => call(`${base}/runs/${encodeURIComponent(runId)}/finish`, send('POST', token, { score, stars, ...(wave != null ? { wave } : {}), ...(completed != null ? { completed } : {}), ...extra }), KEY),
    chooseShip: (token, ship) => call(`${base}/ship`, send('PATCH', token, { ship }), KEY),
  };
}

export const fetchRefuel = (token) => call('/madar/refuel', send('POST', token), KEY);
export const answerRefuel = (token, refuelId, answer, left = false) => call(`/madar/refuel/${encodeURIComponent(refuelId)}/answer`, send('POST', token, { answer, left }), KEY);
/** La page a été quittée pendant la question (au retour, avec la durée de l'absence). */
export const markRefuelLeft = (token, refuelId, awayMs) => call(`/madar/refuel/${encodeURIComponent(refuelId)}/left`, send('POST', token, { awayMs }), KEY);
