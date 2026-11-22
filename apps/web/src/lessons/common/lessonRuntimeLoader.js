import { useEffect } from 'react';
import { loadLessonLoaders } from '../registry';
import { preloadWorldCode } from '../worldPreload';

/**
 * THE ONE loader of the lesson runtime (common/lessonRuntime.jsx): one `import()` for the route factory and for the
 * prefetches — the browser memoises the module, so a prefetch then a navigation downloads nothing twice. The pages that
 * LIST lessons ask for it at the first idle moment, so a click on a lesson no longer waits for it; « / » never asks.
 * See docs/architecture/BUNDLE_BOUNDARIES.md.
 */
export const loadLessonRuntimeCore = () => import('./lessonRuntime');

let requested = false;

function whenIdle(run, timeout) {
  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout });
  else setTimeout(run, 200);
}

/** For a page that lists lessons: prefetches the runtime and the loaders' table after its first render. */
export function usePrefetchLessonRuntime() {
  useEffect(() => {
    if (typeof window === 'undefined' || requested) return;
    requested = true;
    whenIdle(() => Promise.all([loadLessonRuntimeCore(), loadLessonLoaders()]).catch(() => { requested = false; }), 4000);
  }, []);
}

/**
 * The CODE of the game worlds of these lessons (three.js and the world: ≈ 400 KB gzip, one chunk set per unit), asked
 * for once the page that lists them is shown and at rest — the student's click on a lesson no longer waits for it.
 * `enabled`: only for whoever plays the world (a student), never for a teacher reading the unit.
 */
export function usePrefetchWorlds(lessonIds, enabled) {
  const key = lessonIds.join('|');
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return undefined;
    const id = window.setTimeout(() => whenIdle(() => key.split('|').forEach(preloadWorldCode), 3000), 1500);
    return () => window.clearTimeout(id);
  }, [key, enabled]);
}
