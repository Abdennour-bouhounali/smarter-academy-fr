import { call, get, send, query } from './adminClient';

export function fetchLessons(token, filters = {}) {
  return call(`/admin/content/lessons${query(filters)}`, get(token), 'Impossible de charger les leçons.')
    // `units` : les options du filtre « الوحدة », lues en base par l'API.
    .then((data) => ({ ...data.lessons, units: data.units ?? [] }));
}

export function fetchLesson(token, code) {
  return call(
    `/admin/content/lessons/${encodeURIComponent(code)}`,
    get(token),
    'Impossible de charger la leçon.',
  ).then((data) => data.lesson);
}

/**
 * Publier / masquer / archiver.
 * @param {'lesson'|'module'|'exercise'} type
 */
export function changeContentStatus(token, type, id, status) {
  return call(
    `/admin/content/${encodeURIComponent(type)}/${encodeURIComponent(id)}/status`,
    send('PATCH', token, { status }),
    'Impossible de changer l’état de publication.',
  );
}

/**
 * Changer le PALIER commercial — gratuit / premium.
 *
 * Route distincte de la publication, parce que les deux dimensions sont
 * indépendantes : on doit pouvoir vendre une leçon sans la republier, et la
 * retirer sans la rendre gratuite.
 *
 * `tier: null` n'est valable que pour un exercice, où il signifie « hérite du
 * palier de sa leçon ».
 *
 * @param {'lesson'|'exercise'} type
 * @param {'free'|'premium'|null} tier
 */
export function changeContentTier(token, type, id, tier) {
  return call(
    `/admin/content/${encodeURIComponent(type)}/${encodeURIComponent(id)}/tier`,
    send('PATCH', token, { tier }),
    'Impossible de changer le palier d’accès.',
  );
}

/**
 * LE MÊME geste de publication, sur une liste.
 *
 * Volontairement dans le même module que changeContentStatus, et pointant sur
 * le même service serveur : il n'existe pas un « moteur de publication en
 * lot » quelque part ailleurs. Le serveur traite contenu par contenu et
 * renvoie trois listes — ce qui a changé, ce qui était déjà dans cet état, et
 * ce qui a refusé avec son motif.
 *
 * @param {'lesson'|'module'|'exercise'} type
 * @param {number[]} ids
 * @returns {Promise<{applied: number[], unchanged: number[], failed: {id: number, message: string}[]}>}
 */
/**
 * L'état de TOUTE la banque d'exercices d'une leçon. Réponse : `applied`,
 * `unchanged`, `failed` — comme un lot.
 */
export function changeLessonExercisesStatus(token, lessonId, status) {
  return call(
    `/admin/content/lesson/${encodeURIComponent(lessonId)}/exercises-status`,
    send('PATCH', token, { status }),
    'تعذّر تغيير حالة بنك التمارين.',
  );
}

export function bulkChangeContentStatus(token, type, ids, status) {
  return call(
    `/admin/content/${encodeURIComponent(type)}/bulk-status`,
    send('POST', token, { ids, status }),
    'Impossible de changer l’état de publication.',
  );
}

/**
 * Le PALIER, sur une liste. Jumeau de bulkChangeContentStatus.
 *
 * `tier: null` — « hérite de la leçon » — n'est valable que pour des
 * exercices, et c'est le SERVEUR qui le refuse pour une leçon : la règle n'est
 * pas recopiée ici.
 *
 * @param {'lesson'|'exercise'} type
 * @param {'free'|'premium'|null} tier
 */
export function bulkChangeContentTier(token, type, ids, tier) {
  return call(
    `/admin/content/${encodeURIComponent(type)}/bulk-tier`,
    send('POST', token, { ids, tier }),
    'Impossible de changer le palier d’accès.',
  );
}
