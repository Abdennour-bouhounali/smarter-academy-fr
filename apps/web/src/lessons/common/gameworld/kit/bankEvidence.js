/**
 * A handed-in copy of a sitting served from the bank (bankSitting.js) goes to the PRACTICE ENGINE — the same path as the
 * exam sheets of « /espace/pratique » (EXERCISE_CONTRACT.md « Server-side evaluation »): a session at the sitting's level,
 * one question attempt per answered step, the RAW answer. The server reads each question in the content, re-computes its
 * verdict with its own evaluator, and writes the evidence (a `selfCheck` or `counted: false` step is never evidence). The
 * browser's outcome travels only as a prediction, compared and logged.
 *
 * Every id is chosen here once (session, attempts): a retry is the same request, so the server treats it as a duplicate.
 * What could not be sent is kept (per student, 30 days) and sent at the next hand-in or when the exam space opens. A copy
 * (or a step) the server REFUSES (4xx: a retry would never change it) is dropped — never silently: a warning in development
 * and a counter (`refusedSittings`), which no screen reads.
 */
import {
  startPracticeSession,
  openQuestion,
  submitAnswer,
  completeExercise,
  completeSession,
} from '../../../../services/practiceService';
import { scopedStorage as storage } from '../../../../utils/storage';

const KEY = 'smarter_world_sitting_queue';
const REFUSED = 'smarter_world_sitting_refused';
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
    storage.setItem(KEY, JSON.stringify(list.slice(-20)));
  } catch {
    /* storage full or blocked */
  }
};

/** A v4 uuid (the practice engine wants 36 characters for a session and an attempt). */
export function uuid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const b = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = b.map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/** A refusal that a retry would never change (4xx but a timeout or a rate limit). */
const refused = (e) => e?.status >= 400 && e.status < 500 && e.status !== 408 && e.status !== 429;

/** How many copies or steps the server has refused on this device (a trace for support; no screen shows it). */
export function refusedSittings() {
  try {
    return Number(storage.getItem(REFUSED)) || 0;
  } catch {
    return 0;
  }
}
function noteRefusal(what, sheet, e) {
  if (import.meta.env.DEV) console.warn(`[sitting] the server refused ${what}`, sheet.sessionId, e?.status, e?.message);
  try {
    storage.setItem(REFUSED, String(refusedSittings() + 1));
  } catch {
    /* storage full or blocked */
  }
}

async function post(token, sheet) {
  await startPracticeSession(token, sheet.lesson, sheet.sessionId, sheet.level);
  for (const it of sheet.items) {
    try {
      await openQuestion(token, sheet.sessionId, it.exerciseId, it.questionId, it.attemptUuid);
      await submitAnswer(token, sheet.sessionId, {
        attemptUuid: it.attemptUuid,
        answer: it.answer,
        outcome: it.outcome,
      });
    } catch (e) {
      // one step the server refuses (an exercise withdrawn, a question it cannot read) does not cost the others
      if (!refused(e)) throw e;
      noteRefusal(`the step ${it.exerciseId}:${it.questionId}`, sheet, e);
    }
  }
  for (const id of sheet.exercises) {
    if (sheet.items.some((it) => it.exerciseId === id)) await completeExercise(token, sheet.sessionId, id);
  }
  await completeSession(token, sheet.sessionId);
}

async function attempt(token, sheet) {
  try {
    await post(token, sheet);
    return 'sent';
  } catch (e) {
    if (!refused(e)) return 'later';
    noteRefusal('the copy', sheet, e);
    return 'refused';
  }
}

/** Sends one copy; on a network or server failure it is queued. Never throws. */
export async function sendSitting(token, sheet) {
  if (!token || !sheet?.items?.length) return 'skipped';
  const result = await attempt(token, sheet);
  if (result === 'later') write([...read(), { sheet, at: Date.now() }]);
  return result;
}

let flushing = null;

/**
 * Retries the copies waiting to be sent; returns how many left the queue. One flush at a time (a second call joins the
 * running one). The queue is READ AGAIN before it is written: a copy queued while this flush was waiting on the network
 * stays in it — only the copies this flush sent (or the server refused) leave.
 */
export function flushSittings(token) {
  if (!token) return Promise.resolve(0);
  flushing ??= (async () => {
    const waiting = read();
    const gone = new Set();
    for (const e of waiting) if ((await attempt(token, e.sheet)) !== 'later') gone.add(e.sheet?.sessionId);
    if (gone.size) write(read().filter((e) => !gone.has(e.sheet?.sessionId)));
    return gone.size;
  })().finally(() => {
    flushing = null;
  });
  return flushing;
}
