import { useCallback, useState } from 'react';
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
export function useEffectsPreference() {
  const [enabled, setEnabled] = useState(() => storage.getItem(KEY) === '1');

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      storage.setItem(KEY, next ? '1' : '0');
      return next;
    });
  }, []);

  return { enabled, toggle };
}
