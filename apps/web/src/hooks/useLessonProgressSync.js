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
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (!token) return undefined;

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
  }, [token]);
}
