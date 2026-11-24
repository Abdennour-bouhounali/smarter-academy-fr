/**
 * THE KEYS OF A FREE VIEW (`WorldRuntime.freeLook()`), pure. An angle is a direction on the ground: (sin a, cos a) in
 * (x, z), the convention of `heading()` and of the follow camera (`camDir`); « right » of an angle a is a − 90°.
 *
 * Two ways of reading ← ↑ → ↓ (`WorldRuntime.turnKeys()`):
 *   - the WORLD's clock (default; the `rootCourts` world, owner 2026-11-21): the keys are the hours of a clock whose twelve is
 *     the world's `heading()`, whatever he faces (`steerAngle`);
 *   - HIS OWN facing (the Algerian platform's pyramids world, owner 2026-11-24 — « when I press right he goes left »; « one click turns him by
 *     5° »): ← → TURN him — one press is one step of `step` degrees at once, a key held keeps turning at `rate` degrees
 *     a second after `delay` seconds, and let go he stands on the nearest step (a tap never overshoots) — and ↑ ↓ walk
 *     him forward and back along his facing; the lens behind him turns with him (`turnStep`).
 */

/** The direction he walks for the keys `ax` ({ x: −1 … 1 right, y: −1 … 1 forward }), twelve o'clock being `twelve`. */
export const steerAngle = (twelve, ax) => twelve - Math.atan2(ax.x, ax.y);

const RAD = Math.PI / 180;
/** The angle on the grid of `step` degrees nearest to `a`. */
export const onStep = (a, step) => Math.round(a / (step * RAD)) * step * RAD;

/**
 * One frame of turning: `t` = { view, way, held } (way 1 = turning right, −1 left, 0 none; held = seconds held), `x` the
 * keys' left-right (−1 … 1), `turn` = { step, rate, delay } in degrees, degrees a second and seconds. A press turns ONE
 * step at once; held past `delay` it turns at `rate`; let go, it rests on the nearest step.
 */
export function turnStep(t, x, dt, { step, rate, delay }) {
  const way = x > 0.5 ? 1 : x < -0.5 ? -1 : 0;
  if (!way) return t.way ? { view: onStep(t.view, step), way: 0, held: 0 } : t;
  if (way !== t.way) return { view: onStep(t.view, step) - way * step * RAD, way, held: 0 };
  const held = t.held + dt;
  const over = Math.max(0, Math.min(dt, held - delay));
  return { view: t.view - way * rate * RAD * over, way, held };
}
