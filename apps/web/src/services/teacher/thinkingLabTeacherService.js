import { call, get, send } from './teacherClient';

/**
 * Transport de la « معاينة الأستاذ » du « مختبر التفكير » (docs/architecture/THINKING_LAB.md §8bis) :
 * lecture seule. Le serveur sert chaque défi ouvert (réponse, clés, relecture) à l'enseignant
 * seulement (`can:teacher`) et n'écrit rien — ni progression, ni tentative.
 */
const KEY = 'thinkingLab';

export const fetchTeacherChallenges = (token) => call('/teacher/thinking-lab/challenges', get(token), KEY);

/** @param {number} tuple  l'indice du jeu de nombres à voir (les nombres d'un élève sont un tuple parmi eux) */
export const fetchTeacherChallenge = (token, id, tuple = 0) =>
  call(`/teacher/thinking-lab/challenges/${encodeURIComponent(id)}?tuple=${tuple}`, get(token), KEY);

/** Teste une réponse avec le juge de l'élève ; `kind` : 'answer' | 'part' | 'ceiling'. */
export const checkTeacherAnswer = (token, id, { answer, tuple = 0, kind = 'answer', index = 0 }) =>
  call(`/teacher/thinking-lab/challenges/${encodeURIComponent(id)}/check`, send('POST', token, { answer, tuple, kind, index }), KEY);
