import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { fetchFinalTestAttempt, putFinalTestAttempt, deleteFinalTestAttempt } from '../../../services/finalTestAttemptService';
import { useLearningViewer } from '../../../features/learning/learningViewer';
import { scopedStorage } from '../../../utils/storage';

/**
 * Persists the student's latest final-test (evaluation-module) attempt —
 * score + full per-question review — so revisiting the module always shows
 * the last completed attempt instead of a blank quiz, until the student
 * explicitly redoes it.
 *
 * Authenticated students: the server (lesson_final_test_attempts, one row
 * per user+lesson) is the cross-device source of truth; a scoped localStorage
 * copy is kept as a synchronous cache so the review screen doesn't flash
 * empty while the fetch is in flight. Anonymous visitors: local-only,
 * consistent with every other per-student key in this app.
 *
 * @param {string} lessonId
 */
export function useFinalTestAttempt(lessonId) {
  const { token: authToken } = useContext(AuthContext);
  // Le test final d'un enseignant ne se sauvegarde nulle part : il est traité
  // comme un visiteur (local seulement) — voir learningViewer.
  const { tracksProgress } = useLearningViewer();
  const token = tracksProgress ? authToken : null;
  const storageKey = `smarter_final_test_${lessonId}`;

  const readLocal = () => {
    try {
      const raw = scopedStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const [attempt, setAttempt] = useState(readLocal);
  const [loading, setLoading] = useState(!!token);
  // Un `save`/`redo` fait PENDANT la lecture serveur est plus récent qu'elle :
  // la réponse du serveur ne doit plus l'écraser.
  const localWriteRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    localWriteRef.current = false;
    setLoading(true);
    (async () => {
      try {
        const serverAttempt = await fetchFinalTestAttempt(token, lessonId);
        if (cancelled || localWriteRef.current) return;
        const local = readLocal();
        // Une tentative enregistrée hors ligne (PUT échoué) est plus récente
        // que « rien » ou qu'une tentative serveur plus ancienne : on la garde
        // et on la renvoie, au lieu de l'effacer au montage suivant.
        const localIsNewer = local?.submittedAt
          && (!serverAttempt?.submittedAt || Date.parse(local.submittedAt) > Date.parse(serverAttempt.submittedAt));
        if (localIsNewer) {
          putFinalTestAttempt(token, lessonId, local).catch(() => {});
          return;
        }
        setAttempt(serverAttempt);
        if (serverAttempt) {
          scopedStorage.setItem(storageKey, JSON.stringify(serverAttempt));
        } else {
          scopedStorage.removeItem(storageKey);
        }
      } catch {
        // Offline or server hiccup — the local cache (already loaded into
        // state on mount) stands; never block the module on this.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, lessonId]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * @param {{score: number, totalQuestions: number, answers: object[]}} result
   */
  const save = useCallback(
    (result) => {
      const record = { ...result, submittedAt: new Date().toISOString() };
      localWriteRef.current = true;
      setAttempt(record);
      scopedStorage.setItem(storageKey, JSON.stringify(record));

      if (token) {
        putFinalTestAttempt(token, lessonId, record).catch(() => {
          // Best-effort: the local copy already stands, and the next mount's
          // fetch re-sends it when it is newer than the server's (see above).
          // No offline queue
          // for this endpoint — an unsynced attempt is low-stakes (the
          // student can just redo/resubmit), unlike evidence/progress.
        });
      }
    },
    [token, lessonId, storageKey]
  );

  /** Clears the saved attempt — the "Redo" action. */
  const redo = useCallback(() => {
    localWriteRef.current = true;
    setAttempt(null);
    scopedStorage.removeItem(storageKey);

    if (token) {
      deleteFinalTestAttempt(token, lessonId).catch(() => {});
    }
  }, [token, lessonId, storageKey]);

  return { attempt, loading, save, redo };
}
