/**
 * Les SOURCES d'une مذكرة الدرس — le contenu de la leçon elle-même, jamais
 * une copie.
 *
 *   knowledge.jsx      LESSON_KNOWLEDGE : les briques (titre, résumé, type)
 *   content/*.js       ACTIVITY / ACTIVITY_A / SITUATION (le manuel),
 *                      EXERCISES / EXERCISES_1 / … (énoncé, correction,
 *                      commonError, difficulté)
 *
 * Les globs sont PARESSEUX et bornés au cycle moyen (BUNDLE_BOUNDARIES.md §4.3 ; 1AM–3AM
 * ajoutées le 2026-10-14 — leurs leçons y entrent d'elles-mêmes une fois générées) :
 * rien n'entre dans le lot d'entrée, seule la leçon ouverte est chargée, et
 * ses fichiers sont les mêmes lots que ceux de ses modules.
 * Le dossier d'une leçon porte son id (lesson.config.js `id`) — c'est la clé.
 */
const knowledgeFiles = import.meta.glob('../../../lessons/moyen/*/**/knowledge.jsx');
// Les tests de figures (content/figures.test.js, règle du propriétaire 2026-10-04) ne sont pas du contenu : exclus.
const contentFiles = import.meta.glob(['../../../lessons/moyen/*/**/content/*.js', '!../../../lessons/moyen/*/**/content/*.test.js']);

const lessonIdOf = (path, marker) => {
  const parts = path.split('/');
  const at = parts.lastIndexOf(marker);
  return at > 0 ? parts[at - 1] : null;
};

/** Les ids de leçon pour lesquels une source existe (test de couverture). */
export function memoSourceLessonIds() {
  const ids = new Set();
  for (const path of Object.keys(knowledgeFiles)) ids.add(lessonIdOf(path, 'knowledge.jsx'));
  for (const path of Object.keys(contentFiles)) ids.add(lessonIdOf(path, 'content'));
  ids.delete(null);
  return [...ids];
}

/**
 * @param {string} lessonId
 * @returns {Promise<{ knowledge: object|null, content: Record<string, unknown> }>}
 *   `content` fusionne les exports de tous les fichiers content/*.js.
 */
export async function loadLessonMemoSources(lessonId) {
  const knowledgeLoader = Object.entries(knowledgeFiles).find(([path]) => lessonIdOf(path, 'knowledge.jsx') === lessonId)?.[1];
  const contentLoaders = Object.entries(contentFiles).filter(([path]) => lessonIdOf(path, 'content') === lessonId).map(([, load]) => load);
  const [knowledgeModule, ...contentModules] = await Promise.all([
    knowledgeLoader ? knowledgeLoader() : Promise.resolve(null),
    ...contentLoaders.map((load) => load()),
  ]);
  return {
    knowledge: knowledgeModule?.LESSON_KNOWLEDGE ?? null,
    content: Object.assign({}, ...contentModules),
  };
}
