import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { fetchAllLessonProgress } from '../services/lessonProgressService';
import { mergeServerRowIntoStorage, flushProgressQueue } from '../lessons/common/progressQueue';

/**
 * Mounted once inside the authenticated shell (see App.jsx). On login/app
 * start it hydrates local storage from the server's lesson-progress rows —
 * priming resume/dashboard computations before any lesson page opens — then
 * flushes whatever an offline session left parked. Also re-flushes whenever
 * connectivity returns.
 *
 * Fetch failures are silent: the local cache is the fallback, never a broken
 * dashboard.
 */
export function useLessonProgressSync() {
  const { token, user } = useContext(AuthContext);

  useEffect(() => {
    // Wait for `user` to resolve too, not just `token` — storage.js's
    // per-student scoping reads the current user id synchronously
    // (authUserId.js), which AuthContext only sets once fetchUser()/login()
    // resolves. Firing on `token` alone would read/write under the wrong
    // (anon) scope for the instant before that resolves.
    if (!token || !user) return undefined;

    let cancelled = false;
    (async () => {
      try {
        const progress = await fetchAllLessonProgress(token);
        if (cancelled) return;
        for (const [lessonCode, row] of Object.entries(progress)) {
          mergeServerRowIntoStorage(lessonCode, row);
        }
      } catch {
        // Offline or server hiccup — the local cache stands.
      }
      flushProgressQueue(token);
    })();

    const onOnline = () => flushProgressQueue(token);
    window.addEventListener('online', onOnline);

    return () => {
      cancelled = true;
      window.removeEventListener('online', onOnline);
    };
  }, [token, user]);
}
