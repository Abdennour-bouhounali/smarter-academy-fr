import { scopedStorage as storage } from '../../utils/storage';
import { submitLearningEvidence } from '../../services/learningEvidenceService';

/**
 * Offline-safe retry queue for learning-evidence submissions. A failed
 * submission must NEVER break or block the lesson (the student keeps
 * working; mastery evidence is a background concern) — it's parked here and
 * flushed later (on the browser's `online` event and on login, see
 * useEvidenceSubmission).
 *
 * Server-side idempotency by attemptId is what makes this safe: a submission
 * that actually reached the server before the connection dropped is a no-op
 * when the queue retries it.
 */

const QUEUE_KEY = 'smarter_evidence_queue';

/** Bound the queue so a long-offline session can't grow storage unboundedly. */
const MAX_QUEUED = 200;

export function readQueue() {
  try {
    const parsed = JSON.parse(storage.getItem(QUEUE_KEY) || '[]');

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(entries) {
  storage.setItem(QUEUE_KEY, JSON.stringify(entries.slice(-MAX_QUEUED)));
}

/**
 * @param {{lessonCode: string, evidence: object}} entry
 */
export function enqueueEvidence(entry) {
  writeQueue([...readQueue(), entry]);
}

/**
 * Attempts to submit every queued entry. Entries that fail again stay
 * queued; entries the server accepts (or reports as duplicates) are removed.
 * Never throws.
 *
 * @param {string} token
 * @param {(token: string, lessonCode: string, evidence: object) => Promise<any>} [submit]
 *        Injectable for tests; defaults to the real service call.
 * @returns {Promise<{flushed: number, remaining: number}>}
 */
export async function flushEvidenceQueue(token, submit = submitLearningEvidence) {
  const queue = readQueue();
  if (queue.length === 0 || !token) {
    return { flushed: 0, remaining: queue.length };
  }

  const stillQueued = [];
  let flushed = 0;

  for (const entry of queue) {
    try {
      await submit(token, entry.lessonCode, entry.evidence);
      flushed += 1;
    } catch (error) {
      // A 422 means the payload itself is invalid (e.g. a learning point
      // retired since it was queued) — retrying forever won't fix it, so
      // drop it rather than wedging the queue. Anything else (network,
      // 5xx, auth) is retryable.
      if (error?.status === 422) {
        flushed += 1;
      } else {
        stillQueued.push(entry);
      }
    }
  }

  writeQueue(stillQueued);

  return { flushed, remaining: stillQueued.length };
}
