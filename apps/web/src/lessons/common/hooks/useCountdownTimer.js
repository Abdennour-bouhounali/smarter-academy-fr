import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useCountdownTimer — opt-in countdown for a timed assessment.
 *
 * The student (or the lesson author, via `defaultEnabled`) decides whether
 * the timer runs at all; when disabled it stays inert (no interval, no
 * `expired` state) so a lesson can offer an untimed final test without any
 * behavioral difference from a timer that never existed.
 *
 * @param {number} durationSeconds - countdown length when enabled
 * @param {{ defaultEnabled?: boolean, onExpire?: () => void }} [opts]
 */
export function useCountdownTimer(durationSeconds, { defaultEnabled = false, onExpire } = {}) {
  const [enabled, setEnabled] = useState(defaultEnabled);
  // `enabled` lu au MOMENT de start() : la bascule « activer puis démarrer » se fait dans le même clic (TimerToggle :
  // setEnabled(true) puis start()) — avec l'état seul, start() lisait encore `false` et le minuteur ne partait JAMAIS
  // (signalé par le propriétaire, 2026-11-08).
  const enabledRef = useRef(defaultEnabled);
  const [remaining, setRemaining] = useState(durationSeconds);
  const [running, setRunning] = useState(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!enabled || !running) return undefined;
    if (remaining <= 0) return undefined;

    const id = setInterval(() => {
      setRemaining((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [enabled, running, remaining > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (enabled && running && remaining === 0) {
      setRunning(false);
      onExpireRef.current?.();
    }
  }, [enabled, running, remaining]);

  const start = useCallback(() => {
    if (!enabledRef.current) return;
    setRemaining(durationSeconds);
    setRunning(true);
  }, [durationSeconds]);

  const stop = useCallback(() => setRunning(false), []);

  const toggleEnabled = useCallback((next) => {
    enabledRef.current = next;
    setEnabled(next);
    setRunning(false);
    setRemaining(durationSeconds);
  }, [durationSeconds]);

  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
  const seconds = String(remaining % 60).padStart(2, '0');

  return {
    enabled,
    setEnabled: toggleEnabled,
    running,
    remaining,
    expired: enabled && running === false && remaining === 0,
    label: `${minutes}:${seconds}`,
    start,
    stop,
  };
}
