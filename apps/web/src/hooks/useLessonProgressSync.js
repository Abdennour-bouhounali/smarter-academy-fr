import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { fetchAllLessonProgress } from '../services/lessonProgressService';
import { mergeServerRowIntoStorage, flushProgressQueue } from '../lessons/common/progressQueue';
import { flushEvidenceQueue } from '../lessons/common/evidenceQueue';
import { useLearningViewer } from '../features/learning/learningViewer';

/**
 * Mounted once inside the authenticated shell (see App.jsx). On login/app
 * start it hydrates local storage from the server's lesson-progress rows —
 * then flushes whatever an offline session left parked (lesson progress AND
 * final-test evidence). Also re-flushes whenever connectivity returns.
 *
 * The hydration is asynchronous: a lesson page opened before it lands reads
 * the local cache first, then re-reads storage when LESSON_PROGRESS_SYNCED_EVENT
 * fires (useProgress listens to it).
 *
 * Fetch failures are silent: the local cache is the fallback, never a broken
 * dashboard.
 */
/**
 * Émis sur `window` une fois les lignes du serveur fondues dans le stockage
 * local. Un tableau de bord qui a déjà lu le stockage à son montage (la
 * progression, calculée en mémo) peut ainsi se recalculer au lieu d'afficher
 * « jamais ouverte » une leçon que seul le serveur connaissait encore.
 */
export const LESSON_PROGRESS_SYNCED_EVENT = 'smarter:lesson-progress-synced';

export function useLessonProgressSync() {
  const { token, user } = useContext(AuthContext);
  const { tracksProgress } = useLearningViewer();
  const userId = user?.id ?? null;

  useEffect(() => {
    // Wait for `user` to resolve too, not just `token` — storage.js's
    // per-student scoping reads the current user id synchronously
    // (authUserId.js), which AuthContext only sets once fetchUser()/login()
    // resolves. Firing on `token` alone would read/write under the wrong
    // (anon) scope for the instant before that resolves.
    // Un lecteur qui n'apprend pas (enseignant, administrateur) n'a ni lignes
    // à rapatrier ni file à vider.
    if (!token || userId == null || !tracksProgress) return undefined;

    let cancelled = false;
    (async () => {
      try {
        const progress = await fetchAllLessonProgress(token);
        if (cancelled) return;
        for (const [lessonCode, row] of Object.entries(progress)) {
          mergeServerRowIntoStorage(lessonCode, row);
        }
        window.dispatchEvent(new CustomEvent(LESSON_PROGRESS_SYNCED_EVENT));
      } catch {
        // Offline or server hiccup — the local cache stands.
      }
      flushProgressQueue(token);
      // Les réponses d'un défi final parquées hors ligne repartent AUSSI ici,
      // pas seulement quand un défi final est rouvert (useEvidenceSubmission) :
      // sinon elles attendaient qu'un module « إختبار أولي » soit remonté.
      flushEvidenceQueue(token);
    })();

    const onOnline = () => { flushProgressQueue(token); flushEvidenceQueue(token); };
    window.addEventListener('online', onOnline);

    return () => {
      cancelled = true;
      window.removeEventListener('online', onOnline);
    };
    // `user?.id`, pas `user` : `/auth/me` remplace l'objet du compte gardé
    // (context/sessionUserCache.js) par un objet neuf du même élève — la
    // synchronisation ne doit pas repartir pour autant (2026-10-17).
  }, [token, userId, tracksProgress]);
}
