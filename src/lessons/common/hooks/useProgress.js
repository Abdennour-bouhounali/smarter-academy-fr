import { useState, useCallback } from 'react';

/**
 * useProgress — Smarter Academy progression system.
 *
 * Data model in localStorage:
 *   smarter_global_xp                  → total XP across all lessons (number)
 *   smarter_lesson_{lessonId}          → JSON: { completedModules: string[], completedExercises: string[] }
 *
 * XP is GLOBAL (accumulates across all lessons).
 * Module completion and exercise completion are SCOPED to each lesson.
 * awardXP is IDEMPOTENT: each exerciseId can only reward XP once, ever.
 *
 * @param {string} lessonId - The unique lesson ID (e.g. 'MOD-3E-FONC-V2')
 */
export function useProgress(lessonId) {
  const storageKey = `smarter_lesson_${lessonId}`;

  // ── Read initial state from localStorage ──────────────────────────────────
  const readLessonData = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved
        ? JSON.parse(saved)
        : { completedModules: [], completedExercises: [] };
    } catch {
      return { completedModules: [], completedExercises: [] };
    }
  };

  const readGlobalXP = () => {
    try {
      const saved = localStorage.getItem('smarter_global_xp');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  };

  const [lessonData, setLessonData] = useState(readLessonData);
  const [xp, setXp] = useState(readGlobalXP);

  // ── Persist helpers ───────────────────────────────────────────────────────
  const persistLessonData = (next) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Ignore storage errors silently
    }
  };

  const persistXP = (next) => {
    try {
      localStorage.setItem('smarter_global_xp', String(next));
    } catch {}
  };

  // ── markModuleCompleted ───────────────────────────────────────────────────
  const markModuleCompleted = useCallback((moduleId) => {
    setLessonData(prev => {
      if (prev.completedModules.includes(moduleId)) return prev;
      const next = {
        ...prev,
        completedModules: [...prev.completedModules, moduleId],
      };
      persistLessonData(next);
      return next;
    });
  }, [storageKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── awardXP (idempotent) ──────────────────────────────────────────────────
  /**
   * Award XP for an exercise. Idempotent: if this exerciseId was already
   * awarded, the call is a no-op (no duplicate XP, survives page refresh).
   *
   * @param {{ moduleId: string, exerciseId: string, amount: number }} opts
   */
  const awardXP = useCallback(({ moduleId, exerciseId, amount }) => {
    const key = `${lessonId}:${moduleId}:${exerciseId}`;
    setLessonData(prev => {
      if (prev.completedExercises.includes(key)) return prev; // already awarded
      const next = {
        ...prev,
        completedExercises: [...prev.completedExercises, key],
      };
      persistLessonData(next);

      // Award global XP
      setXp(prevXp => {
        const nextXp = prevXp + amount;
        persistXP(nextXp);
        return nextXp;
      });

      return next;
    });
  }, [lessonId, storageKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived values ────────────────────────────────────────────────────────
  const isModuleCompleted = useCallback(
    (moduleId) => lessonData.completedModules.includes(moduleId),
    [lessonData.completedModules]
  );

  const isExerciseCompleted = useCallback(
    (moduleId, exerciseId) =>
      lessonData.completedExercises.includes(`${lessonId}:${moduleId}:${exerciseId}`),
    [lessonId, lessonData.completedExercises]
  );

  return {
    xp,
    completedModules: lessonData.completedModules,
    markModuleCompleted,
    awardXP,
    isModuleCompleted,
    isExerciseCompleted,
    /** @deprecated Use awardXP instead */
    addXP: (amount) => {
      setXp(prev => {
        const next = prev + amount;
        persistXP(next);
        return next;
      });
    },
  };
}

