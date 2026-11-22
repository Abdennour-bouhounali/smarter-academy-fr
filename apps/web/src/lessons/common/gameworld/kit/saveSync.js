/**
 * THE STUDENT'S JOURNEY FOLLOWS HIM FROM ONE DEVICE TO THE NEXT (plan A2, 2026-11-17).
 *
 * The world's save lives in the browser (`scopedStorage`, one key per lesson) so the game never waits for the network.
 * This module keeps a copy on the server, in the student's PRIVATE store of in-lesson answers
 * (`GET/PUT /lessons/{code}/answers` — his alone, never evidence, never read by a teacher, a school or a parent):
 *   pull   before the world opens: when the server's copy is NEWER than the browser's, it replaces it;
 *   push   after each save, a few seconds later (one request for a burst of saves), and when the page is hidden.
 * That store takes small values, so the save is cut into chunks: `world:n` = how many, `world:0` … = the pieces, all
 * stamped with the same time. A copy whose pieces do not all carry that time is incomplete: it is ignored.
 * The newest save wins as a whole (the device's clock): two devices played at the same time do not merge.
 * Never in the teacher's preview, never without a session.
 */
import { scopedStorage as storage } from '../../../../utils/storage';
import { fetchLessonAnswers, putLessonAnswers } from '../../../../services/lessonAnswersService';

const CHUNK = 3600; // characters of base64 per piece: the store refuses a value over 6000
const PUSH_DELAY = 4000;
const PULL_TIMEOUT = 2500;
const saveKey = (lessonId) => `smarter_world_${lessonId}`;

// ───────────────────────────── the browser's copy ─────────────────────────────

export function readSave(lessonId) {
  try {
    return JSON.parse(storage.getItem(saveKey(lessonId)) || 'null');
  } catch {
    return null;
  }
}
/** Writes the save with the time it was made (`at`): what decides which copy is the newest. */
export function writeSave(lessonId, data, at = Date.now()) {
  try {
    storage.setItem(saveKey(lessonId), JSON.stringify({ ...data, at }));
  } catch {
    /* storage full or blocked: the game goes on, this save is lost */
  }
}

// ───────────────────────────── the pieces (pure) ─────────────────────────────

const toBase64 = (text) => {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
};
const fromBase64 = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0)));

/** The save as entries of the answers store: { 'world:n': { v, at }, 'world:0': { v, at }, … }. */
export function toEntries(save) {
  const at = Number(save?.at) || Date.now();
  const text = toBase64(JSON.stringify(save));
  const count = Math.max(1, Math.ceil(text.length / CHUNK));
  const out = { 'world:n': { v: count, at } };
  for (let i = 0; i < count; i += 1) out[`world:${i}`] = { v: text.slice(i * CHUNK, (i + 1) * CHUNK), at };
  return out;
}
/** The save the store holds, or null when there is none or when its pieces are not of one push. */
export function fromEntries(answers) {
  const head = answers?.['world:n'];
  const count = Number(head?.v);
  if (!head || !Number.isInteger(count) || count < 1) return null;
  let text = '';
  for (let i = 0; i < count; i += 1) {
    const piece = answers[`world:${i}`];
    if (!piece || piece.at !== head.at || typeof piece.v !== 'string') return null;
    text += piece.v;
  }
  try {
    const save = JSON.parse(fromBase64(text));
    return save && typeof save === 'object' ? { ...save, at: head.at } : null;
  } catch {
    return null;
  }
}
/** Is the server's copy the one to play from? Only when it is strictly newer than the browser's. */
export const serverWins = (local, remote) => Boolean(remote) && Number(remote.at) > (Number(local?.at) || 0);

// ───────────────────────────── pull and push ─────────────────────────────

/**
 * Before the world opens: brings the server's copy when it is newer. Never throws and never waits long — offline, or a
 * slow network, the student plays from the browser's copy. Resolves to true when the browser's copy was replaced.
 */
export async function pullSave(token, lessonId) {
  if (!token) return false;
  try {
    const answers = await Promise.race([
      fetchLessonAnswers(token, lessonId),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), PULL_TIMEOUT)),
    ]);
    const remote = fromEntries(answers);
    if (!serverWins(readSave(lessonId), remote)) return false;
    writeSave(lessonId, remote, remote.at);
    return true;
  } catch {
    return false;
  }
}

const timers = new Map();
async function pushNow(token, lessonId) {
  clearTimeout(timers.get(lessonId));
  timers.delete(lessonId);
  const save = readSave(lessonId);
  if (!token || !save) return;
  try {
    await putLessonAnswers(token, lessonId, toEntries(save));
  } catch {
    /* offline or refused: the next save tries again */
  }
}
/** After a save: one push a few seconds later, however many saves come in between. */
export function schedulePush(token, lessonId) {
  if (!token) return;
  clearTimeout(timers.get(lessonId));
  timers.set(
    lessonId,
    setTimeout(() => pushNow(token, lessonId), PUSH_DELAY),
  );
}
/** When the page is hidden or the world closes: what is waiting goes now. */
export function flushPush(token, lessonId) {
  if (timers.has(lessonId)) pushNow(token, lessonId);
}
