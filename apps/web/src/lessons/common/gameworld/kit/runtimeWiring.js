/**
 * WHAT A RUNTIME OF A LESSON IS PLUGGED INTO — the save in the browser and its copy on the server, the answers that count
 * (sent to the server, which re-computes every verdict), a handed-in sitting, the end of the story. ONE wiring for the
 * world (`LessonWorld.jsx`) and for the lesson's tools opened without a world (`LessonTools.jsx`).
 */
import { useEffect } from 'react';
import { writeSave, schedulePush, flushPush } from './saveSync';
import { storyEndMarker } from './storyEnd';
import { sendGameEvidence, flushGameEvidence, newAttemptId } from './evidenceSend';
import { sendSitting, flushSittings, uuid } from './bankEvidence';

/** What waits to be sent goes when the connection is back, when the page is hidden, and when the runtime closes. */
export function useRuntimeFlush(tokenRef, lessonId) {
  useEffect(() => {
    const flush = () => {
      flushGameEvidence(tokenRef.current);
      flushSittings(tokenRef.current);
    };
    flush();
    window.addEventListener('online', flush);
    return () => window.removeEventListener('online', flush);
  }, [tokenRef]);
  useEffect(() => {
    const push = () => document.visibilityState === 'hidden' && flushPush(tokenRef.current, lessonId);
    document.addEventListener('visibilitychange', push);
    return () => {
      document.removeEventListener('visibilitychange', push);
      flushPush(tokenRef.current, lessonId);
    };
  }, [tokenRef, lessonId]);
}

/**
 * The callbacks a runtime is built with. `previewRef` (a teacher looking at what the student sees): nothing is sent.
 * `storyEnd` is returned too: the caller runs it once on the save it starts from.
 */
export function runtimeCallbacks({ config, lesson, tokenRef, previewRef, onModuleRef }) {
  // the end of the story completes the lesson: every module of the config is marked (storyEnd.js, LESSON_V2.md §1ter);
  // a save already finished repairs the progress of a student who ended the story before that rule
  const storyEnd = storyEndMarker(config, (n) => {
    if (!previewRef.current) onModuleRef.current?.(n);
  });
  return {
    storyEnd,
    onSave: (data) => {
      writeSave(config.id, data);
      storyEnd(data);
      // his journey follows him to his other devices (saveSync.js) — never from a teacher's preview
      if (!previewRef.current) schedulePush(tokenRef.current, config.id);
    },
    onModule: (n) => onModuleRef.current?.(n),
    onEvidence: (context, ev) => {
      if (previewRef.current) return;
      const payload = lesson.evidence.payloadOf(config.id, context, ev, newAttemptId());
      if (import.meta.env.DEV) (window.__evidence ??= []).push(payload);
      sendGameEvidence(tokenRef.current, config.id, payload);
    },
    // a handed-in sitting (bank sheets): to the practice engine, which re-computes every verdict on the server
    onSitting: (subject, answers) => {
      if (previewRef.current) return;
      const sheet = lesson.sittings.sheetOf(subject, answers, uuid);
      if (import.meta.env.DEV) (window.__sittingSheets ??= []).push(sheet);
      sendSitting(tokenRef.current, sheet);
    },
  };
}
