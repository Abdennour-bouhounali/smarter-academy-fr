import { useCallback, useEffect, useState } from 'react';
import { storage } from '../../../utils/storage';

const KEY = 'smarter_effects_enabled';

/**
 * Sound + haptics on/off — a DEVICE preference, not learning data. Stored in
 * the raw (unscoped) `storage`, never `scopedStorage`: it must stay the same
 * across login/logout on this browser, and is never synced to the server or
 * tied to an account. Two devices for the same student keep independent
 * preferences, exactly like OS-level volume.
 *
 * Defaults to OFF — sound/vibration must be an opt-in, never a surprise on
 * first visit.
 */
const EFFECTS_EVENT = 'sa:effects';

/** Écrit la préférence ET prévient tous les interrupteurs ouverts (page, labo, défi) : ils disent toujours la même chose (2026-10-28). */
function setEffectsEnabled(next) {
  storage.setItem(KEY, next ? '1' : '0');
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(EFFECTS_EVENT, { detail: !!next }));
}

export function useEffectsPreference() {
  const [enabled, setEnabled] = useState(() => storage.getItem(KEY) === '1');

  useEffect(() => {
    const on = (e) => setEnabled(!!e.detail);
    window.addEventListener(EFFECTS_EVENT, on);
    return () => window.removeEventListener(EFFECTS_EVENT, on);
  }, []);

  const toggle = useCallback(() => setEffectsEnabled(storage.getItem(KEY) !== '1'), []);

  return { enabled, toggle };
}
