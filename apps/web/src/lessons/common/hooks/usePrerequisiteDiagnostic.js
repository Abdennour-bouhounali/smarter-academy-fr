import { useCallback, useState } from 'react';
import { scopedStorage } from '../../../utils/storage';

/**
 * Persists the student's Module 0 "prerequisite diagnostic" result — score,
 * per-skill breakdown and advice level — so revisiting the module shows the
 * last result instead of a blank quiz, until the student redoes it.
 *
 * Local-only, unlike useFinalTestAttempt: `stage: 'prerequisite_check'` is
 * documented (LESSON_STAGES) as client-side only and never persisted as
 * evidence — this diagnostic never gates access to Module 1, so there is no
 * cross-device mastery signal worth a server round-trip for it.
 *
 * @param {string} lessonId
 */
export function usePrerequisiteDiagnostic(lessonId) {
  const storageKey = `smarter_prereq_diagnostic_${lessonId}`;

  const readLocal = () => {
    try {
      const raw = scopedStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const [result, setResult] = useState(readLocal);

  /**
   * @param {{score: number, maxScore: number, skills: object, adviceLevel: string, answers: object}} data
   */
  const save = useCallback(
    (data) => {
      const record = { ...data, completed: true, completedAt: new Date().toISOString() };
      setResult(record);
      scopedStorage.setItem(storageKey, JSON.stringify(record));
    },
    [storageKey]
  );

  /** Clears the saved result — the "Refaire" action. */
  const redo = useCallback(() => {
    setResult(null);
    scopedStorage.removeItem(storageKey);
  }, [storageKey]);

  return { result, save, redo };
}
