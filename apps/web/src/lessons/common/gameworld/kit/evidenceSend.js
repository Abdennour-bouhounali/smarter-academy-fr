/**
 * Sends the game's evidence to the server (POST /lessons/{lesson}/game-evidence) and keeps what could not be sent.
 * The server is idempotent by attemptId, so a retry is always safe. A refused payload (4xx) is dropped: retrying it would
 * never succeed. Storage is per student (`scopedStorage`); entries older than 30 days are forgotten.
 */
import { apiRequest } from '../../../../services/apiClient';
import { scopedStorage as storage } from '../../../../utils/storage';

const KEY = 'smarter_world_evidence_queue';
const MAX_AGE = 30 * 24 * 3600 * 1000;
const read = () => {
  try {
    return JSON.parse(storage.getItem(KEY) || '[]').filter((e) => Date.now() - e.at < MAX_AGE);
  } catch {
    return [];
  }
};
const write = (list) => {
  try {
    storage.setItem(KEY, JSON.stringify(list.slice(-200)));
  } catch {
    /* storage full or blocked */
  }
};

async function post(token, lessonCode, payload) {
  const { ok, status } = await apiRequest(`/lessons/${encodeURIComponent(lessonCode)}/game-evidence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return ok ? 'sent' : status >= 400 && status < 500 && status !== 408 && status !== 429 ? 'refused' : 'later';
}

/** Sends one piece of evidence; on a network or server failure it is queued for the next visit. Never throws. */
export async function sendGameEvidence(token, lessonCode, payload) {
  if (!token || !payload) return 'skipped';
  let result = 'later';
  try {
    result = await post(token, lessonCode, payload);
  } catch {
    result = 'later';
  }
  if (result === 'later') write([...read(), { lessonCode, payload, at: Date.now() }]);
  return result;
}

/** Retries what is waiting (called when the game opens, and when the connection comes back). */
export async function flushGameEvidence(token) {
  if (!token) return 0;
  const waiting = read();
  if (!waiting.length) return 0;
  const keep = [];
  for (const e of waiting) {
    let result = 'later';
    try {
      result = await post(token, e.lessonCode, e.payload);
    } catch {
      result = 'later';
    }
    if (result === 'later') keep.push(e);
  }
  write(keep);
  return waiting.length - keep.length;
}

export const newAttemptId = () =>
  globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `gw-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
