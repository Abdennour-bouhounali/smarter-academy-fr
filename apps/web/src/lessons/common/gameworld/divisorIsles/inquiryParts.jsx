/**
 * What every investigation screen of this world shares (`Inquiry.jsx` and the `Inquiry*.jsx` it mounts): the dev hooks of
 * the walks, the scene's horizontal frame, the world's timers, and the « yes / no » of a prediction. One copy, imported.
 */
import { useEffect, useRef } from 'react';

/** The walks' fast mode (dev only): `window.__forgeFast` shortens every animation of the world. */
export const FAST = () => import.meta.env.DEV && typeof window !== 'undefined' && window.__forgeFast;

/** Every screen exposes its state to the walks on `window.__inquiry` (dev only). */
export const expose = (state) => {
  if (import.meta.env.DEV) window.__inquiry = state;
};

/** The scene's frame in its 1000-wide viewBox: where a strip starts, and how long the longest strip is. */
export const X0 = 40;
export const SPAN = 920;

/** A short chain of timers that are all cleared when the screen leaves (shortened in the walks' fast mode). */
export function useLater() {
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  return (ms, fn) => timers.current.push(setTimeout(fn, FAST() ? Math.min(ms, 15) : ms));
}

/**
 * The two buttons « yes / no » of one prediction. `value` lights the one he chose (when the screen keeps it lit); `hook`
 * is the walks' attribute (`data-iq-say` unless the screen asks two predictions side by side).
 */
export function YesNo({ T, onSay, value = null, hook = 'data-iq-say' }) {
  return [
    [true, T.yes],
    [false, T.no],
  ].map(([v, label]) => (
    <button
      key={label}
      type="button"
      className={`rf-btn ${value === v ? 'is-on' : ''}`}
      onClick={() => onSay(v)}
      {...{ [hook]: v ? 'yes' : 'no' }}
    >
      {label}
    </button>
  ));
}
