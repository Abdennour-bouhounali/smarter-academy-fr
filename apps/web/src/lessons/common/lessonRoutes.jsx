import { lazy, Suspense } from 'react';
import { Navigate, Route } from 'react-router-dom';
import { loadLessonRuntimeCore } from './lessonRuntimeLoader';
import { rememberLessonConfig } from '../registry';
import LessonWaiting from '../LessonWaiting';

// The page frame (access gate, notebook anchor, return button) is the shared lazy lesson runtime: this file travels
// with a lesson's routes.jsx through the route boundary (lessons/lessonRouteBoundary.jsx), so it imports nothing heavy
// (docs/architecture/BUNDLE_BOUNDARIES.md).
const LessonPageFrame = lazy(() => loadLessonRuntimeCore().then((m) => ({ default: m.LessonPageFrame })));

/**
 * A `lazy()` that can be PRELOADED: `LessonPageFrame` calls `Component.preload()` at its first render, so the home's
 * code is asked for in parallel with the frame instead of after it.
 */
function lazyWithPreload(loader) {
  let promise = null;
  const load = () =>
    (promise ??= loader().catch((error) => {
      promise = null;
      throw error;
    }));
  const Component = lazy(load);
  Component.preload = load;
  return Component;
}

/**
 * THE ROUTES OF A V2 LESSON (docs/architecture/LESSON_V2.md §2) — one factory for every lesson; a lesson's
 * `routes.jsx` (at `lessons/college/<grade>/<theme>/<unit>/<lesson>/`) calls it:
 *
 *   import { buildLessonRoutes } from '<…>/common/lessonRoutes';
 *   export default function myLessonRoutes() {
 *     return buildLessonRoutes({ config: LESSON_CONFIG, basePath: LESSON_BASE_PATH, loadIndex: () => import('./index.jsx') });
 *   }
 *
 * The home (`index.jsx`, which renders `common/components/LessonIndex`) is the game world for a student and the
 * teacher's card for a teacher. A v2 lesson has no module page: each module ADDRESS of its config stays a route that
 * redirects to the home, so an old link (a report, a bookmark) never ends on a 404 — the module ids and numbers stay in
 * the config because progress is stored by them.
 */
export function buildLessonRoutes({ config, basePath, loadIndex }) {
  // Every page of the open lesson reads its config synchronously (registry.getLoadedLessonConfig).
  rememberLessonConfig(config);
  const LessonHome = lazyWithPreload(loadIndex);
  return (
    <Route key={`${config.id}-lesson`}>
      <Route
        key={`${config.id}-index`}
        path={basePath}
        element={
          <Suspense fallback={<LessonWaiting lessonId={config.id} title={config.title} />}>
            <LessonPageFrame config={config} Component={LessonHome} />
          </Suspense>
        }
      />
      {config.modules.map((m) => (
        <Route key={`${config.id}-${m.id}`} path={m.path} element={<Navigate to={basePath} replace />} />
      ))}
    </Route>
  );
}
