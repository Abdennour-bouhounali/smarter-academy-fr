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
 *
 * Mastery V2 : a 422 is NO LONGER dropped. Since the server is the only
 * judge of an item, « unknown to the registry » is a content-deployment
 * lag, not a corrupt payload — the entry stays, annotated with
 * `lastError: {status, message}` and its `retries` count, and is retried on
 * the next flush. The only thing that removes an entry without a successful
 * submission is age : `queuedAt` older than MAX_AGE_DAYS.
 *
 * Entry shape : `{lessonCode, evidence, queuedAt (ISO), retries, lastError}`.
 */

const QUEUE_KEY = 'smarter_evidence_queue';

/** Bound the queue so a long-offline session can't grow storage unboundedly. */
const MAX_QUEUED = 200;

/** Une preuve plus ancienne que cela n'a plus de valeur pédagogique : on la lâche. */
export const MAX_AGE_DAYS = 30;
const MAX_AGE_MS = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

function isExpired(entry, now) {
  const queuedAt = Date.parse(entry?.queuedAt ?? '');
  // Une entrée sans date lisible (file d'une version antérieure) garde la
  // sienne à partir de maintenant plutôt que d'être jetée.
  if (Number.isNaN(queuedAt)) return false;
  return now - queuedAt > MAX_AGE_MS;
}

function normalize(entry, nowIso) {
  return {
    ...entry,
    queuedAt: typeof entry.queuedAt === 'string' ? entry.queuedAt : nowIso,
    retries: Number.isInteger(entry.retries) ? entry.retries : 0,
    lastError: entry.lastError ?? null,
  };
}

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

/** Le nombre de preuves encore en attente d'envoi. */
export function pendingEvidenceCount() {
  return readQueue().length;
}

/**
 * @param {{lessonCode: string, evidence: object}} entry
 * @param {Date} [now] — injectable pour les tests
 */
export function enqueueEvidence(entry, now = new Date()) {
  writeQueue([...readQueue(), normalize(entry, now.toISOString())]);
}

/**
 * Attempts to submit every queued entry. Entries that fail again stay
 * queued (with `retries` incremented and `lastError` recorded); entries the
 * server accepts (or reports as duplicates) are removed; entries older than
 * MAX_AGE_DAYS are dropped. Never throws.
 *
 * @param {string} token
 * @param {(token: string, lessonCode: string, evidence: object) => Promise<any>} [submit]
 *        Injectable for tests; defaults to the real service call.
 * @param {Date} [now] — injectable for tests (expiry clock)
 * @returns {Promise<{flushed: number, remaining: number, expired: number}>}
 */
export async function flushEvidenceQueue(token, submit = submitLearningEvidence, now = new Date()) {
  const nowMs = now.getTime();
  const nowIso = now.toISOString();
  const queue = readQueue().map((entry) => normalize(entry, nowIso));
  const live = queue.filter((entry) => !isExpired(entry, nowMs));
  const expired = queue.length - live.length;

  if (live.length === 0 || !token) {
    if (expired > 0) writeQueue(live);

    return { flushed: 0, remaining: live.length, expired };
  }

  const sent = new Set();
  const failed = new Map();
  let flushed = 0;

  for (const entry of live) {
    try {
      await submit(token, entry.lessonCode, entry.evidence);
      sent.add(entryKey(entry));
      flushed += 1;
    } catch (error) {
      failed.set(entryKey(entry), {
        ...entry,
        retries: entry.retries + 1,
        lastError: {
          status: typeof error?.status === 'number' ? error.status : null,
          message: typeof error?.message === 'string' ? error.message : String(error),
        },
      });
    }
  }

  // La file est RELUE ici, pas réécrite depuis la copie du début : pendant
  // les `await`, une autre réponse a pu y être parquée (ou un autre flush l'a
  // vidée). On n'ôte que ce qui vient d'être accepté, on met à jour ce qui a
  // échoué, et tout le reste — ajouté entre-temps — est conservé.
  const stillQueued = [];
  for (const entry of readQueue()) {
    const normalized = normalize(entry, nowIso);
    const key = entryKey(normalized);
    if (sent.has(key) || isExpired(normalized, nowMs)) continue;
    stillQueued.push(failed.get(key) ?? normalized);
  }
  writeQueue(stillQueued);

  return { flushed, remaining: stillQueued.length, expired };
}

/** Une réponse est identifiée par sa leçon et sa preuve (attemptId + question). */
function entryKey(entry) {
  return JSON.stringify([entry.lessonCode, entry.evidence]);
}
