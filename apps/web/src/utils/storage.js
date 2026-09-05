import { getCurrentUserId } from './authUserId';

/**
 * The one seam between this app's client-side persistence (progress, the
 * auth token, UI preferences like the last-selected course filters) and the
 * concrete storage mechanism. Every localStorage call in the app goes
 * through this object instead of calling `localStorage` directly — so a
 * future React Native port swaps this one file for an AsyncStorage/
 * SecureStore-backed implementation (same three methods) instead of hunting
 * down every call site across the app.
 *
 * Not implementing mobile storage now — this only isolates the existing
 * web behavior behind a small interface.
 */
export const storage = {
  getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Ignore storage errors silently (matches prior behavior — e.g. private browsing).
    }
  },
  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore storage errors silently.
    }
  },
};

/**
 * Per-student persistence (lesson progress, XP, offline queues) must be
 * independent from one user to another on a shared browser — logging in as
 * a different account must never read or merge into the previous account's
 * local data. `scopedStorage` prefixes every key with the current user id
 * (from `authUserId.js`, mirrored by AuthContext), falling back to an
 * `anon_` prefix for logged-out visitors so their local-only progress
 * (the documented anonymous-visitor behavior) stays separate from any
 * account's data too.
 *
 * Only for per-student keys — NOT for the auth token itself or app-wide UI
 * preferences (course filters), which must stay unscoped/shared.
 */
function scopedKey(key) {
  const userId = getCurrentUserId();
  return `u_${userId ?? 'anon'}_${key}`;
}

export const scopedStorage = {
  getItem(key) {
    return storage.getItem(scopedKey(key));
  },
  setItem(key, value) {
    storage.setItem(scopedKey(key), value);
  },
  removeItem(key) {
    storage.removeItem(scopedKey(key));
  },
};

/**
 * One-time migration for a browser that already has legacy, unscoped
 * per-student data (written before user-scoping existed) or anonymous data
 * from before this login. Called once per login (see AuthContext) so an
 * existing single-user browser doesn't lose its progress the first time
 * scoping is deployed, while a SECOND, different user logging in later on
 * the same browser gets a clean scope (the legacy keys are consumed by
 * whichever user logs in first, then removed).
 *
 * @param {string[]} legacyKeys - unscoped key names to migrate (e.g. 'smarter_global_xp')
 * @param {(key: string) => boolean} [lessonKeyMatcher] - optional predicate for
 *        dynamically-named legacy keys (e.g. `smarter_lesson_{id}`) that can't be
 *        listed by exact name; matched against every existing localStorage key.
 */
export function migrateLegacyStorageToUser(legacyKeys, lessonKeyMatcher) {
  const userId = getCurrentUserId();
  if (userId == null) return; // nothing to migrate into for an anonymous visitor

  for (const legacyKey of legacyKeys) {
    const value = storage.getItem(legacyKey);
    if (value == null) continue;
    const target = scopedKey(legacyKey);
    if (storage.getItem(target) == null) {
      storage.setItem(target, value);
    }
    storage.removeItem(legacyKey);
  }

  if (lessonKeyMatcher) {
    // localStorage isn't iterable via a stable API across all environments in
    // one line — Object.keys(localStorage) works in every browser this app targets.
    let allKeys;
    try {
      allKeys = Object.keys(localStorage);
    } catch {
      return;
    }
    for (const key of allKeys) {
      if (!lessonKeyMatcher(key)) continue;
      const value = storage.getItem(key);
      if (value == null) continue;
      const target = scopedKey(key);
      if (storage.getItem(target) == null) {
        storage.setItem(target, value);
      }
      storage.removeItem(key);
    }
  }
}
