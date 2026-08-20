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
