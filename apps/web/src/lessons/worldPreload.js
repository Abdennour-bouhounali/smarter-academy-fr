/**
 * THE WORLD OF A LESSON, ASKED FOR EARLY (docs/architecture/BUNDLE_BOUNDARIES.md « World preload »).
 *
 * A v2 lesson's home is its game world: three.js, the world's code and the lesson's content (≈ 400 KB gzip, measured
 * 2026-11-21). They used to be discovered at the END of a chain of five downloads (routes → runtime → lesson home →
 * world shell → world). The pack FLAGS are in the entry bundle (`registry › lessonPackFlags`), so whoever knows that a
 * student is about to open a lesson — the route boundary, a link he points at, the unit page at rest — calls
 * `preloadWorld` and everything travels together. `LessonGameWorld` reads the SAME promises: nothing is fetched twice.
 *
 * A promise that failed is forgotten, so the next call tries again (a network that came back).
 * Light on purpose (it is in the entry bundle): the registry, the pack reader and a table of `() => import()`.
 */
import { lessonPackFlags } from './registry';
import { loadPackPart } from './lessonPack';
import { WORLDS } from './common/gameworld/worlds';

const asked = new Map();
function once(key, load) {
  if (!asked.has(key)) {
    const promise = load();
    asked.set(key, promise);
    promise.catch(() => asked.get(key) === promise && asked.delete(key));
  }
  return asked.get(key);
}

/** @returns {Promise<{ default: Function }>} the world's module (with three.js: one chunk shared by every world). */
export const loadWorld = (worldId) =>
  WORLDS[worldId] ? once(`world:${worldId}`, WORLDS[worldId]) : Promise.reject(new Error(`unknown world: ${worldId}`));

/** @returns {Promise<object|null>} the content the lesson's world is played with (its pack's `world` part). */
export const loadWorldContent = (lessonId) => once(`content:${lessonId}`, () => loadPackPart(lessonId, 'world'));

const quiet = (promise) => promise.catch(() => {});

/** The world's CODE alone (shared by the lessons of a unit) — for a page that lists lessons, at rest. */
export function preloadWorldCode(lessonId) {
  const worldId = lessonPackFlags(lessonId).world;
  if (worldId && WORLDS[worldId]) quiet(loadWorld(worldId));
}

/** Everything the lesson's world waits for. Nothing happens for a lesson without a world; never throws. */
export function preloadWorld(lessonId) {
  const worldId = lessonPackFlags(lessonId).world;
  if (!worldId || !WORLDS[worldId]) return;
  quiet(import('./common/gameworld/LessonGameWorld'));
  quiet(loadWorld(worldId));
  quiet(loadWorldContent(lessonId));
}
