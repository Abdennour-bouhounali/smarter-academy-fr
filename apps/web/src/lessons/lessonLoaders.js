// Les CHARGEURS paresseux des leçons construites — jamais dans le lot d'entrée.
//
// Ce module n'est atteint que par `import()` (registry.js › loadLessonLoaders) :
// même les tables de ses deux globs (un chemin et un nom de lot par leçon)
// restent hors du premier téléchargement. Chaque valeur est un `() => import()`
// — la configuration et les routes d'UNE leçon arrivent avec cette leçon.
//
// Les globs sont des LITTÉRAUX limités aux classes actives (Vite l'exige) ;
// registry.test.js échoue s'ils s'écartent de ACTIVE_GRADE_IDS, et
// scripts/check-routes.mjs vérifie que chaque leçon de l'index y est.
// Voir docs/architecture/BUNDLE_BOUNDARIES.md (§3 « Lesson route boundary »).

export const CONFIG_LOADERS = import.meta.glob(
  [
    './*/1am/**/lesson.config.js',
    './*/2am/**/lesson.config.js',
    './*/3am/**/lesson.config.js',
    './*/4am/**/lesson.config.js',
    './*/terminale_dz/**/lesson.config.js',
  ],
  { import: 'LESSON_CONFIG' },
);

export const ROUTES_LOADERS = import.meta.glob(
  [
    './*/1am/**/routes.jsx',
    './*/2am/**/routes.jsx',
    './*/3am/**/routes.jsx',
    './*/4am/**/routes.jsx',
    './*/terminale_dz/**/routes.jsx',
  ],
  { import: 'default' },
);

/** The PACK of a lesson (`lesson.pack.js`, LESSON_V2.md): a few lines of data whose content is behind its own imports. */
export const PACK_LOADERS = import.meta.glob(
  [
    './*/1am/**/lesson.pack.js',
    './*/2am/**/lesson.pack.js',
    './*/3am/**/lesson.pack.js',
    './*/4am/**/lesson.pack.js',
    './*/terminale_dz/**/lesson.pack.js',
  ],
  { import: 'LESSON_PACK' },
);

/** Le chargeur d'une leçon dans une table de glob : son dossier porte son id (generate-lesson-index.mjs). */
export function findLessonLoader(loaders, lessonId, fileName) {
  const suffix = `/${lessonId}/${fileName}`;
  for (const [path, load] of Object.entries(loaders)) if (path.endsWith(suffix)) return load;
  return null;
}
