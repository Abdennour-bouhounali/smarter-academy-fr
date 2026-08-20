import { calculateCompletionPercentage } from '@smarter-academy/core';
import { storage } from '../../utils/storage';
import { putLessonProgress } from '../../services/lessonProgressService';
import { getTotalModules } from '../registry';

/**
 * Offline-safe sync layer for lesson progression, modeled on evidenceQueue.js
 * but with one structural difference: progress is LAST-SNAPSHOT-WINS per
 * lesson (a map keyed by lessonId holding the latest full snapshot, not an
 * append log). Replays are safe because the server merge is a union of
 * completed modules with latest-wins position — a stale snapshot can add
 * completions but never remove any.
 *
 * localStorage stays the synchronous read path and offline cache; the server
 * row is the cross-device truth and is folded back into storage after every
 * successful push (and on login by useLessonProgressSync).
 */

const QUEUE_KEY = 'smarter_progress_queue';

/** Per-lesson debounce timers for scheduleProgressSync. */
const pushTimers = new Map();

const DEBOUNCE_MS = 3000;

function readLessonData(lessonId) {
  try {
    return JSON.parse(storage.getItem(`smarter_lesson_${lessonId}`)) || {};
  } catch {
    return {};
  }
}

export function readProgressQueue() {
  try {
    const parsed = JSON.parse(storage.getItem(QUEUE_KEY) || '{}');

    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function writeProgressQueue(queue) {
  storage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Builds the server payload from the lesson's current storage state.
 * `status` is 'completed' only when the built lesson's module count is known
 * and every module is completed — the server keeps it monotonic anyway.
 *
 * @returns {{completedModules: string[], currentModule: ?number, status: string, lastActivityAt: string}|null}
 */
export function snapshotLessonProgress(lessonId) {
  const data = readLessonData(lessonId);
  const completedModules = Array.isArray(data.completedModules)
    ? data.completedModules.map(String)
    : [];
  if (completedModules.length === 0 && !data.currentModule && !data.lastVisitedAt) {
    return null; // nothing started — nothing to sync
  }

  const totalModules = getTotalModules(lessonId);
  const completed = totalModules != null
    && calculateCompletionPercentage(completedModules, totalModules) >= 100;

  return {
    completedModules,
    currentModule: data.currentModule ?? null,
    status: completed ? 'completed' : 'in_progress',
    lastActivityAt: new Date(data.lastVisitedAt || Date.now()).toISOString(),
  };
}

/** Parks the lesson's current snapshot for the next flush (replaces any older one). */
export function queueProgressSnapshot(lessonId) {
  const snapshot = snapshotLessonProgress(lessonId);
  if (!snapshot) return;

  writeProgressQueue({ ...readProgressQueue(), [lessonId]: snapshot });
}

/**
 * Folds a server progress row into the lesson's storage entry: union of
 * completed modules; position and timestamp only move forward when the server
 * row is newer than what this device has seen. completedExercises (XP
 * idempotency keys) are local-only and left untouched.
 */
export function mergeServerRowIntoStorage(lessonId, serverRow) {
  if (!serverRow) return;

  const local = readLessonData(lessonId);
  const serverAt = Date.parse(serverRow.lastActivityAt) || 0;

  const merged = {
    completedExercises: [],
    ...local,
    completedModules: [...new Set([
      ...(Array.isArray(local.completedModules) ? local.completedModules.map(String) : []),
      ...(Array.isArray(serverRow.completedModules) ? serverRow.completedModules.map(String) : []),
    ])],
  };

  if (serverAt > (local.lastVisitedAt || 0)) {
    if (serverRow.currentModule != null) merged.currentModule = serverRow.currentModule;
    merged.lastVisitedAt = serverAt;
  }

  storage.setItem(`smarter_lesson_${lessonId}`, JSON.stringify(merged));
}

/**
 * Attempts to push every parked snapshot. Accepted rows are removed and the
 * server's merged answer is folded back into storage; 422s are dropped
 * (permanently invalid — e.g. the lesson code no longer exists); anything
 * else (network, 5xx, auth) stays parked. Never throws.
 *
 * @param {string} token
 * @param {(token: string, lessonCode: string, snapshot: object) => Promise<object>} [put]
 *        Injectable for tests; defaults to the real service call.
 * @returns {Promise<{flushed: number, remaining: number}>}
 */
export async function flushProgressQueue(token, put = putLessonProgress) {
  const queue = readProgressQueue();
  const entries = Object.entries(queue);
  if (entries.length === 0 || !token) {
    return { flushed: 0, remaining: entries.length };
  }

  const stillQueued = {};
  let flushed = 0;

  for (const [lessonId, snapshot] of entries) {
    try {
      const serverRow = await put(token, lessonId, snapshot);
      mergeServerRowIntoStorage(lessonId, serverRow);
      flushed += 1;
    } catch (error) {
      if (error?.status === 422 || error?.status === 404) {
        flushed += 1;
      } else {
        stillQueued[lessonId] = snapshot;
      }
    }
  }

  writeProgressQueue(stillQueued);

  return { flushed, remaining: Object.keys(stillQueued).length };
}

/**
 * Debounced "something changed" entry point for useProgress: parks the
 * current snapshot immediately (so it survives a tab close) and pushes it
 * shortly after the writes settle. Without a token the snapshot just stays
 * parked for the post-login flush.
 */
export function scheduleProgressSync(token, lessonId) {
  queueProgressSnapshot(lessonId);
  if (!token) return;

  clearTimeout(pushTimers.get(lessonId));
  pushTimers.set(lessonId, setTimeout(() => {
    pushTimers.delete(lessonId);
    queueProgressSnapshot(lessonId); // refresh: later writes may have landed
    flushProgressQueue(token);
  }, DEBOUNCE_MS));
}
