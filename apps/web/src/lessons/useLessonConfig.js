import { useEffect, useState } from 'react';
import { getLoadedLessonConfig, isLessonBuilt, loadLessonConfig } from './registry';

/**
 * Le LESSON_CONFIG complet d'une leçon, chargé AVEC elle (registry.js, deux couches).
 *
 * Synchrone quand il est déjà chargé — toujours le cas sur une page de la leçon,
 * dont le routes.jsx l'a importé : pas un rendu de retard. Ailleurs (page d'unité,
 * مذكرة الدرس), `null` le temps du chargement, puis la config.
 *
 * @param {string|null|undefined} lessonId
 * @returns {object|null}
 */
export function useLessonConfig(lessonId) {
  const [, setVersion] = useState(0);
  const config = lessonId ? getLoadedLessonConfig(lessonId) : null;
  const pending = Boolean(lessonId) && !config && isLessonBuilt(lessonId);
  useEffect(() => {
    if (!pending) return undefined;
    let alive = true;
    loadLessonConfig(lessonId).then(() => { if (alive) setVersion((v) => v + 1); }, () => {});
    return () => { alive = false; };
  }, [lessonId, pending]);
  return config;
}

