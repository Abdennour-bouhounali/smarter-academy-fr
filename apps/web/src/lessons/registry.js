// Registry of every built lesson implementation, discovered from the
// lesson.config.js files under this directory. This — not coursesData.js —
// is the source of truth for a lesson's module structure: the catalogue
// describes what a lesson teaches, the config describes how it is built.
//
// A lesson present in the catalogue but absent here simply has no
// implementation yet (status 'coming_soon'); progress utilities must skip it
// rather than assume a module count.

const configModules = import.meta.glob('./**/lesson.config.js', { eager: true });

const configByLessonId = new Map();
for (const mod of Object.values(configModules)) {
  const config = mod.LESSON_CONFIG;
  if (config?.id) {
    configByLessonId.set(config.id, config);
  }
}

/**
 * @param {string} lessonId - the lesson's coursesData.js id / LESSON_CONFIG.id
 * @returns {object|null} the LESSON_CONFIG, or null when the lesson isn't built
 */
export function getLessonConfig(lessonId) {
  return configByLessonId.get(lessonId) ?? null;
}

/**
 * @param {string} lessonId
 * @returns {number|null} modules.length, or null when the lesson isn't built —
 *          never a fabricated default.
 */
export function getTotalModules(lessonId) {
  return configByLessonId.get(lessonId)?.modules?.length ?? null;
}

/**
 * Le CHEMIN du module `number` d'une leçon — jamais son numéro.
 *
 * Les routes d'un module sont déclarées avec `m.path`, construit sur son
 * SLUG (« /le-reservoir ») ; le modèle de progression, lui, raisonne en
 * NUMÉROS (1, 2, 3…). Assembler soi-même `${lesson.path}/${numéro}` produit
 * une URL qui ne correspond à aucune route : React Router la fait retomber
 * sur `*` — la page d'accueil marketing — sans la moindre erreur. C'est le
 * défaut qui rendait « Continuer » inopérant : le bouton n'était pas mort,
 * il menait à une porte qui n'existait pas.
 *
 * Cette fonction est le seul pont autorisé entre les deux mondes. Elle rend
 * `null` quand la leçon n'est pas construite ou quand le module n'existe
 * pas : l'appelant doit alors se rabattir sur l'index de la leçon plutôt que
 * de fabriquer un lien mort.
 *
 * @param {string} lessonId
 * @param {number|string} moduleNumber Le `number` du module (pas son index).
 * @returns {string|null}
 */
export function getModulePath(lessonId, moduleNumber) {
  const config = configByLessonId.get(lessonId);
  if (!config?.modules) return null;
  const wanted = Number(moduleNumber);
  if (!Number.isFinite(wanted)) return null;
  return config.modules.find((m) => Number(m.number) === wanted)?.path ?? null;
}
