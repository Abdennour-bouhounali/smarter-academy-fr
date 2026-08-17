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
