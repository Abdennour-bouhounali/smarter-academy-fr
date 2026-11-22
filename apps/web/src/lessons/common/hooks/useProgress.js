import { useState, useCallback, useContext, useEffect } from 'react';
import { scopedStorage as storage } from '../../../utils/storage';
import { AuthContext } from '../../../context/AuthContext';
import { scheduleProgressSync } from '../progressQueue';
import { LESSON_PROGRESS_SYNCED_EVENT } from '../../../hooks/useLessonProgressSync';
import { useLearningViewer } from '../../../features/learning/learningViewer';
import { migrateLessonProgress, emptyLessonProgress } from '@smarter-academy/core';

/**
 * useProgress — Smarter Academy progression system.
 *
 * Data model in storage:
 *   smarter_global_xp                  → total XP across all lessons (number)
 *   smarter_lesson_{lessonId}          → JSON: { completedModules: string[], completedExercises: string[] }
 *
 * XP is GLOBAL (accumulates across all lessons).
 * Module completion and exercise completion are SCOPED to each lesson.
 * awardXP is IDEMPOTENT: each exerciseId can only reward XP once, ever.
 *
 * Storage is the synchronous read path and offline cache; for authenticated
 * students every module write also schedules a debounced push to the
 * cross-device lesson-progress API (see progressQueue.js — union merge on
 * the server makes replays and multi-device races safe). Anonymous visitors
 * stay purely local.
 *
 * Reads/writes go through `storage` (utils/storage.js), not `localStorage`
 * directly — see that file for why.
 *
 * QUI apprend écrit ; qui ne fait que lire n'écrit pas. Un enseignant (ou un
 * administrateur) parcourt la leçon avec les mêmes composants, mais
 * `learningViewer.tracksProgress` est faux pour lui : visite, complétion et
 * XP deviennent des gestes vides — ni en local, ni vers le serveur (qui les
 * refuserait de toute façon, middleware `learner`). Un seul point de garde,
 * ici, plutôt qu'une condition par composant.
 *
 * @param {string} lessonId - The unique lesson ID (e.g. 'MOD-3E-FONC-V2')
 */
export function useProgress(lessonId) {
  const storageKey = `smarter_lesson_${lessonId}`;
  const { token } = useContext(AuthContext);
  const { tracksProgress } = useLearningViewer();

  // ── Read initial state from storage ──────────────────────────────────────
  const readLessonData = () => {
    // Une leçon RENUMÉROTÉE (modules insérés) migre ses anciens numéros une
    // seule fois — @smarter-academy/core › moduleLayoutMigrations.
    const saved = storage.getItem(storageKey);
    try {
      return saved
        ? migrateLessonProgress(lessonId, JSON.parse(saved))
        : emptyLessonProgress(lessonId);
    } catch {
      return emptyLessonProgress(lessonId);
    }
  };

  const readGlobalXP = () => {
    const saved = storage.getItem('smarter_global_xp');
    return saved ? parseInt(saved, 10) : 0;
  };

  const [lessonData, setLessonData] = useState(readLessonData);
  const [xp, setXp] = useState(readGlobalXP);

  // La synchro serveur (useLessonProgressSync) est ASYNCHRONE : sur un
  // appareil neuf, une page de leçon ouverte par lien direct lisait un
  // stockage encore vide (0 %, modules fermés) et ne se corrigeait qu'au
  // remontage. On relit le stockage quand la synchro l'a rempli.
  useEffect(() => {
    const reread = () => setLessonData(readLessonData());
    window.addEventListener(LESSON_PROGRESS_SYNCED_EVENT, reread);
    return () => window.removeEventListener(LESSON_PROGRESS_SYNCED_EVENT, reread);
  }, [storageKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Persist helpers ───────────────────────────────────────────────────────
  const persistLessonData = (next) => {
    storage.setItem(storageKey, JSON.stringify(next));
  };

  const persistXP = (next) => {
    storage.setItem('smarter_global_xp', String(next));
  };

  // NOTE : plusieurs instances de useProgress coexistent sur une même page
  // (ModuleLayout + le module lui-même). Chaque écriture doit donc partir du
  // STOCKAGE (source de vérité), jamais de l'état React de l'instance :
  // persister depuis un état d'instance périmé écraserait les clés écrites
  // entre-temps par une autre instance (ex. markModuleCompleted du layout
  // qui effaçait les completedExercises tout juste posés par awardXP).

  // ── markModuleCompleted ───────────────────────────────────────────────────
  const markModuleCompleted = useCallback((moduleId) => {
    if (!tracksProgress) return;
    const saved = readLessonData();
    if (saved.completedModules.includes(moduleId)) {
      setLessonData(saved);
      return;
    }
    const next = {
      ...saved,
      completedModules: [...saved.completedModules, moduleId],
    };
    persistLessonData(next);
    setLessonData(next);
    scheduleProgressSync(token, lessonId);
  }, [storageKey, token, tracksProgress]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── markModuleVisited ─────────────────────────────────────────────────────
  const markModuleVisited = useCallback((moduleNumber) => {
    if (!lessonId || !tracksProgress) return;

    // Set global last course
    storage.setItem('smarter_last_course', lessonId);

    const saved = readLessonData();
    if (saved.currentModule === moduleNumber && Date.now() - (saved.lastVisitedAt || 0) < 60000) {
      return; // Debounce updates to avoid excessive writes
    }
    const next = {
      ...saved,
      currentModule: moduleNumber,
      lastVisitedAt: Date.now()
    };
    persistLessonData(next);
    setLessonData(next);
    scheduleProgressSync(token, lessonId);
  }, [lessonId, storageKey, token, tracksProgress]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── awardXP (idempotent) ──────────────────────────────────────────────────
  /**
   * Award XP for an exercise. Idempotent: if this exerciseId was already
   * awarded, the call is a no-op (no duplicate XP, survives page refresh).
   *
   * @param {{ moduleId: string, exerciseId: string, amount: number }} opts
   */
  const awardXP = useCallback(({ moduleId, exerciseId, amount }) => {
    if (!tracksProgress) return;
    const key = `${lessonId}:${moduleId}:${exerciseId}`;
    // Dedup contre le stockage (source de vérité synchrone), PAS dans un
    // updater React : un updater doit rester pur, et StrictMode l'exécute
    // deux fois en dev — le setXp imbriqué partait alors en double et l'XP
    // était comptée (et persistée) deux fois par exercice.
    const saved = readLessonData();
    if (saved.completedExercises.includes(key)) return; // already awarded
    const next = {
      ...saved,
      completedExercises: [...saved.completedExercises, key],
    };
    persistLessonData(next);
    setLessonData(next);

    // Award global XP
    const nextXp = readGlobalXP() + amount;
    persistXP(nextXp);
    setXp(nextXp);
  }, [lessonId, storageKey, tracksProgress]); // eslint-disable-line react-hooks/exhaustive-deps

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
    /** Numéro du dernier module visité (utilisé pour le statut « en cours »). */
    currentModule: lessonData.currentModule ?? null,
    markModuleCompleted,
    markModuleVisited,
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

