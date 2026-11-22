import { call, get, send, query } from './teacherClient';

/** « مدار » d'une classe, côté enseignant : réglages, semaine, écran du tableau. */
const KEY = 'madar';
const base = (id) => `/teacher/classrooms/${encodeURIComponent(id)}/madar`;

export const fetchClassMadarSettings = (token, id) => call(`${base(id)}/settings`, get(token), KEY);
export const updateClassMadarSettings = (token, id, values) => call(`${base(id)}/settings`, send('PATCH', token, values), KEY);
export const fetchClassMadarResults = (token, id, week, game) => call(`${base(id)}/results${query({ week, game })}`, get(token), KEY);
export const fetchClassMadarItems = (token, id) => call(`${base(id)}/items`, get(token), KEY);
export const setClassMadarItemLimit = (token, id, itemKey, seconds) => call(`${base(id)}/time-limits`, send('PUT', token, { itemKey, seconds }), KEY);
export const adjustStudentHearts = (token, id, values) => call(`${base(id)}/hearts`, send('POST', token, values), KEY);
/** Les jeux fermés pour UN élève de la classe (la liste entière ; [] = tout rouvrir). */
export const setStudentMadarGames = (token, id, studentId, disabledGames) => call(`${base(id)}/students/${encodeURIComponent(studentId)}/games`, send('PUT', token, { disabledGames }), KEY);
export const fetchClassMadarDisplay = (token, id, week, game) => call(`${base(id)}/display${query({ week, game })}`, get(token), KEY);
