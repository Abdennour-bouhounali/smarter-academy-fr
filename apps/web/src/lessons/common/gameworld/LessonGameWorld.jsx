/**
 * THE GAME WORLD OF A LESSON — a WORLD (a mechanic written once, for a unit) played with a lesson's CONTENT.
 *
 * The lesson names its world in its pack (`lesson.pack.js › world: { id, content }`, LESSON_V2.md); the worlds that exist
 * are the list of `worlds.js` — code, one entry per world, never one per lesson. Three things arrive together and
 * lazily, out of the entry bundle (BUNDLE_BOUNDARIES.md): the world (with three.js, ONE chunk shared by every world),
 * the lesson's content, and the student's journey when another device played further (`kit/saveSync.js`). The first two
 * are usually ON THEIR WAY ALREADY: whoever knew the student was coming asked for them (`lessons/worldPreload.js`).
 * While they arrive the student sees the world's loading screen (`WorldLoading`) — never a blank page. A load that
 * fails is tried again BY ITSELF, once: the page is loaded again (a browser remembers a chunk that failed — an
 * `import()` asked twice is not fetched twice, measured 2026-11-21 — and nothing of the journey is lost: it is saved),
 * at once, or the moment a lost connection is back. Only when that second try fails too: a sentence and a button.
 */
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { loadWorld, loadWorldContent } from '../../worldPreload';
import { pullSave } from './kit/saveSync';
import WorldLoading from './WorldLoading';

/** One automatic reload per lesson and per while: a load that fails again is told to the student, never looped. */
const RELOAD_KEY = 'smarter_world_reload';
const RELOAD_AGAIN_AFTER_MS = 120000;
function reloadedLately(lessonId) {
  try {
    const [id, at] = (sessionStorage.getItem(RELOAD_KEY) || '').split('|');
    return id === lessonId && Date.now() - Number(at) < RELOAD_AGAIN_AFTER_MS;
  } catch {
    return true; // no storage to remember the try: never reload by ourselves
  }
}
function reloadOnce(lessonId) {
  try {
    sessionStorage.setItem(RELOAD_KEY, `${lessonId}|${Date.now()}`);
  } catch {
    return;
  }
  window.location.reload();
}

/** `worldId` = the flag of the lesson's pack (`registry › lessonPackFlags(id).world`); the other props go to the world. */
export default function LessonGameWorld({ worldId, config, ...props }) {
  const auth = useContext(AuthContext);
  const [load, setLoad] = useState({ code: false, light: 0, ready: null, failed: false });
  const token = auth?.token ?? null;
  const { preview } = props;

  useEffect(() => {
    let alive = true;
    let again = null;
    const reload = () => alive && reloadOnce(config.id);
    setLoad({ code: false, light: 0, ready: null, failed: false });
    const landed = (promise, what) =>
      promise.then((value) => {
        if (alive) setLoad((s) => (what === 'code' ? { ...s, code: true } : { ...s, light: s.light + 1 }));
        return value;
      });
    Promise.all([
      landed(loadWorld(worldId), 'code'),
      landed(loadWorldContent(config.id), 'light'),
      // a teacher's preview plays from nothing and sends nothing: his journey is not the student's
      landed(preview ? Promise.resolve(false) : pullSave(token, config.id), 'light'),
    ]).then(
      ([world, lesson]) => {
        if (!alive) return;
        if (!lesson) setLoad((s) => ({ ...s, failed: true }));
        else setLoad((s) => ({ ...s, failed: false, ready: { World: world.default, lesson, lessonId: config.id } }));
      },
      () => {
        if (!alive) return;
        if (reloadedLately(config.id)) setLoad((s) => ({ ...s, failed: true }));
        // offline: the screen says so, and the load goes on by itself the moment the connection is back
        else if (navigator.onLine === false) window.addEventListener('online', reload, { once: true });
        else again = setTimeout(reload, 1500);
      },
    );
    return () => {
      alive = false;
      clearTimeout(again);
      window.removeEventListener('online', reload);
    };
    // the session and the preview are read when the load starts: a token refreshed meanwhile must not reload the world
  }, [worldId, config.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (load.ready?.lessonId === config.id) {
    const { World, lesson } = load.ready;
    return <World lesson={lesson} config={config} {...props} />;
  }
  // the bar's stage follows the WEIGHT of what landed: the world's code is nearly all of it (WorldLoading › stage)
  const stage = load.code ? 3 : load.light === 2 ? 2 : 1;
  return <WorldLoading lessonId={config.id} title={config.title} stage={stage} failed={load.failed} />;
}
