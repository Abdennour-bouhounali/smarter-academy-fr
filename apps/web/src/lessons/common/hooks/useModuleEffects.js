import { useCallback, useRef, useState } from 'react';
import { useEffectsPreference } from './useEffectsPreference';
import { playEffect } from '../utils/playEffect';

/**
 * useModuleEffects — one hook per content module, centralizing the
 * micro-celebration layer (sound/haptics, session streak) so individual
 * questions only need one extra call, not a copy of this logic at every
 * site.
 *
 * Call `react(isCorrect)` from the same place a question already reveals
 * its answer (right after `setChecked(true)`/`setRevealed(true)`) — never
 * gate it behind correctness, since this is a formative lesson: play the
 * "ok" chime and grow the streak on right answers, the "ko" chime and reset
 * the streak on wrong ones, in both cases regardless of whether the step
 * still counts as done. `react` returns a fresh id on every call — pass it
 * straight to that SPECIFIC question's own `<XPBurst tick={...} />` (never
 * share one id across several questions, or their bursts fire together).
 *
 * The streak is session-only (component state, not persisted) — see
 * docs/architecture/LESSON_INTEGRATION_GUIDE.md's UX polish section for why
 * that's a deliberate choice, not a gap.
 */
export function useModuleEffects() {
  const { enabled, toggle } = useEffectsPreference();
  const [streak, setStreak] = useState(0);
  const idRef = useRef(0);

  const react = useCallback(
    (isCorrect) => {
      playEffect(isCorrect ? 'ok' : 'ko', enabled);
      setStreak((s) => (isCorrect ? s + 1 : 0));
      idRef.current += 1;
      return idRef.current;
    },
    [enabled]
  );

  return { effectsEnabled: enabled, toggleEffects: toggle, streak, react };
}
