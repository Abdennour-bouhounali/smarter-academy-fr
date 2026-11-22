// Registry of every built lesson implementation. This — not coursesData.js —
// is the source of truth for a lesson's module structure: the catalogue
// describes what a lesson teaches, the config describes how it is built.
//
// A lesson present in the catalogue but absent here simply has no
// implementation yet (status 'coming_soon'); progress utilities must skip it
// rather than assume a module count.
//
// TWO LAYERS since 2026-10-14 (docs/architecture/BUNDLE_BOUNDARIES.md §3,
// « Lesson index » and « Lesson route boundary »):
//
//   1. SYNCHRONOUS answers — built? how many modules? first module? path of
//      module n? — come from `lessonIndex.generated.json`, a light index
//      generated from the lesson.config.js files (scripts/generate-lesson-index.mjs,
//      kept fresh by `npm run check:lessons`). ≈ 20 bytes gzip per lesson, no Arabic.
//   2. The FULL LESSON_CONFIG (titles, resources, teachesLearningPointIds…)
//      is loaded WITH its lesson: `loadLessonConfig(id)` (async) or the
//      `useLessonConfig(id)` hook (lessons/useLessonConfig.js). Once loaded —
//      always the case on a lesson page, whose routes.jsx imported it — it is
//      readable synchronously with `getLoadedLessonConfig(id)`.
//
// Until 2026-10-14 this file globbed every lesson.config.js EAGERLY: 775 KB of
// configuration in every visitor's first download, growing with each lesson.
//
// Active-grade isolation (docs/ALGERIA_MIGRATION_AUDIT.md §15): the index only
// lists active grades (the generator filters on ACTIVE_GRADE_IDS), the lazy
// globs of lessonLoaders.js are literals scoped to the active grades, and this
// file filters again at runtime — defense in depth on top of the coursesData.js
// catalogue filter (activeGrades.js).
import { ACTIVE_GRADE_IDS } from '@smarter-academy/core';
import LESSON_INDEX from './lessonIndex.generated.json';

const entryById = new Map();
for (const entry of LESSON_INDEX.lessons) {
  if (!ACTIVE_GRADE_IDS.includes(entry.grade)) continue;
  entryById.set(entry.id, entry);
}

const basePathOf = (entry) => `/courses/${entry.level}/${entry.grade}/${entry.chapter}/${entry.id}`;

/**
 * The index entries of every built lesson of the active grades, with their
 * base path — what App.jsx needs to mount one lazy route boundary per lesson.
 * @returns {Array<{ id: string, grade: string, basePath: string }>}
 */
export function getBuiltLessons() {
  return [...entryById.values()].map((e) => ({ id: e.id, grade: e.grade, basePath: basePathOf(e) }));
}

/** @returns {boolean} whether the lesson has an implementation (a lesson.config.js). */
export function isLessonBuilt(lessonId) {
  return entryById.has(lessonId);
}

/** @returns {string|null} the lesson's LESSON_BASE_PATH, or null when it isn't built. */
export function getLessonBasePath(lessonId) {
  const entry = entryById.get(lessonId);
  return entry ? basePathOf(entry) : null;
}

/**
 * @param {string} lessonId
 * @returns {number|null} modules.length, or null when the lesson isn't built —
 *          never a fabricated default.
 */
export function getTotalModules(lessonId) {
  return entryById.get(lessonId)?.modules.length ?? null;
}

/**
 * Le NUMÉRO du premier module d'une leçon — pas toujours 1.
 *
 * Une leçon qui ouvre sur « أستعدّ » (stage `prerequisite_check`) commence à
 * 0. Sans cette information, « continuer » balayait 1..N et proposait le
 * module 1 à un élève qui n'avait pas encore fait le module 0.
 *
 * @param {string} lessonId
 * @returns {number|null} le plus petit `number` déclaré, ou null quand la
 *          leçon n'est pas construite — jamais un défaut fabriqué.
 */
export function getFirstModuleNumber(lessonId) {
  const modules = entryById.get(lessonId)?.modules;
  if (!Array.isArray(modules) || modules.length === 0) return null;
  const numbers = modules.map(([number]) => Number(number)).filter(Number.isFinite);
  return numbers.length > 0 ? Math.min(...numbers) : null;
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
 * de fabriquer un lien mort. (`m.path === LESSON_BASE_PATH/slug` pour chaque
 * module : le générateur de l'index le vérifie.)
 *
 * @param {string} lessonId
 * @param {number|string} moduleNumber Le `number` du module (pas son index).
 * @returns {string|null}
 */
export function getModulePath(lessonId, moduleNumber) {
  const entry = entryById.get(lessonId);
  if (!entry) return null;
  const wanted = Number(moduleNumber);
  if (!Number.isFinite(wanted)) return null;
  const slug = entry.modules.find(([number]) => Number(number) === wanted)?.[1];
  return slug ? `${basePathOf(entry)}/${slug}` : null;
}

/**
 * The id of some lesson with 2+ modules currently in the active registry, or
 * `null` if none is active. Test-only escape hatch: lets registry-behavior
 * tests exercise a real, currently-active lesson without hardcoding one —
 * which grade is active can change (see activeGrades.js) independently of
 * what those tests are actually checking.
 */
export function getAnyRegisteredLessonId() {
  for (const [id, entry] of entryById) {
    if (entry.modules.length >= 2) return id;
  }
  return null;
}

// ── The full configuration, loaded with the lesson ─────────────────────────

/** The lazy loaders module (two globs) — its own small chunk, never in the entry. */
export const loadLessonLoaders = () => import('./lessonLoaders.js');

const loadedConfigs = new Map();
const pendingConfigs = new Map();

/**
 * Records a lesson's LESSON_CONFIG once its code is loaded. The lesson route
 * factory (common/unit/buildLessonRoutes.jsx) calls it, so every page of an
 * open lesson reads its config synchronously.
 */
export function rememberLessonConfig(config) {
  if (config?.id && entryById.has(config.id)) loadedConfigs.set(config.id, config);
}

/**
 * @returns {object|null} the LESSON_CONFIG if it has already been loaded
 *          (always true on that lesson's own pages), else null.
 */
export function getLoadedLessonConfig(lessonId) {
  return loadedConfigs.get(lessonId) ?? null;
}

/**
 * @param {string} lessonId
 * @returns {Promise<object|null>} the LESSON_CONFIG, or null when the lesson
 *          isn't built (or belongs to an inactive grade).
 */
export function loadLessonConfig(lessonId) {
  if (!entryById.has(lessonId)) return Promise.resolve(null);
  if (loadedConfigs.has(lessonId)) return Promise.resolve(loadedConfigs.get(lessonId));
  if (!pendingConfigs.has(lessonId)) {
    const pending = loadLessonLoaders()
      .then(({ CONFIG_LOADERS, findLessonLoader }) => {
        const load = findLessonLoader(CONFIG_LOADERS, lessonId, 'lesson.config.js');
        return load ? load() : null;
      })
      .then((config) => {
        rememberLessonConfig(config);
        return loadedConfigs.get(lessonId) ?? null;
      })
      .finally(() => pendingConfigs.delete(lessonId));
    pendingConfigs.set(lessonId, pending);
  }
  return pendingConfigs.get(lessonId);
}

/**
 * @returns {Promise<Function|null>} the default export of the lesson's
 *          routes.jsx (its route factory), or null when it isn't built.
 */
export function loadLessonRoutesFactory(lessonId) {
  if (!entryById.has(lessonId)) return Promise.resolve(null);
  return loadLessonLoaders().then(({ ROUTES_LOADERS, findLessonLoader }) => {
    const load = findLessonLoader(ROUTES_LOADERS, lessonId, 'routes.jsx');
    return load ? load() : null;
  });
}

// ── The lesson's PACK (docs/architecture/LESSON_V2.md) ─────────────────────

const NO_PACK = Object.freeze({});

/**
 * What a lesson gives the platform beyond its modules, as FLAGS — answered at once, nothing loaded:
 * `{ phone?: true, world?: '<world id>', knowledge?: true, coach?: true, board?: true }`.
 * They are generated from the lesson's own `lesson.pack.js`; no list elsewhere names a lesson.
 * @returns {object} the flags, an empty object for a lesson without a pack.
 */
export function lessonPackFlags(lessonId) {
  return entryById.get(lessonId)?.pack ?? NO_PACK;
}

/** @returns {string[]} the ids of the lessons whose pack has this flag (« phone », « board »…). */
export function lessonsWithPack(flag) {
  return [...entryById.values()].filter((e) => e.pack?.[flag]).map((e) => e.id);
}

/**
 * @returns {Promise<object|null>} the lesson's LESSON_PACK (its content still behind
 *          each `() => import()`), or null when the lesson has none.
 */
export function loadLessonPack(lessonId) {
  if (!entryById.get(lessonId)?.pack) return Promise.resolve(null);
  return loadLessonLoaders().then(({ PACK_LOADERS, findLessonLoader }) => {
    const load = findLessonLoader(PACK_LOADERS, lessonId, 'lesson.pack.js');
    return load ? load() : null;
  });
}
