import { Suspense } from 'react';
import LessonAccessGate from './components/LessonAccessGate';
import LessonWaiting from '../LessonWaiting';
import ReturnToLessonButton from './components/ReturnToLessonButton';
import LessonNotebookAnchor from './notebook/LessonNotebookAnchor';

/**
 * THE LESSON RUNTIME — one lazy chunk shared by every mounted lesson, so the frame around a lesson page never travels
 * in the entry bundle (docs/architecture/BUNDLE_BOUNDARIES.md). The loading ladder of a lesson:
 *
 *   entry    → the light index (registry.js)
 *   lesson   → its routes.jsx and lesson.config.js, then this runtime (once for all lessons)
 *   page     → its index.jsx (the home: the game world, or the teacher's card)
 *   world    → the world's code (worldPreload.js)
 */

/**
 * The home of a v2 lesson in its frame: the tier gate BEFORE the page's code loads (a premium lesson this account
 * cannot open downloads nothing), then the page, the notebook anchor and the one-click return from a prerequisite
 * review opened by the launch kit.
 */
export function LessonPageFrame({ config, Component }) {
  // The page starts loading together with the frame (lessonRoutes.jsx › lazyWithPreload). Idempotent.
  Component.preload?.();
  return (
    <LessonAccessGate lessonId={config.id} title={config.title}>
      <Suspense fallback={<LessonWaiting lessonId={config.id} title={config.title} />}>
        <Component />
        <LessonNotebookAnchor config={config} />
        <ReturnToLessonButton />
      </Suspense>
    </LessonAccessGate>
  );
}
