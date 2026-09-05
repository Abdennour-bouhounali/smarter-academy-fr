/**
 * playEffect — short synthesized chime (WebAudio, no audio assets) plus a
 * light haptic pulse on supporting devices. Always call from a user-gesture
 * handler (a tap already is one) so autoplay/AudioContext restrictions never
 * block it, including on iOS Safari.
 *
 * @param {'ok'|'ko'} tone
 * @param {boolean} enabled  from useEffectsPreference — no-ops when false
 */
let sharedCtx = null;

export function playEffect(tone, enabled) {
  if (!enabled) return;

  try {
    // A context left over from a dev hot-reload, a backgrounded tab, or a
    // prior explicit close() is unusable — `resume()` on a closed context is
    // a silent no-op in most engines, so reusing it would mean this function
    // "succeeds" (no throw) while producing no sound at all. Recreate it.
    if (!sharedCtx || sharedCtx.state === 'closed') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      sharedCtx = new AudioCtx();
    }
    if (sharedCtx.state === 'suspended') sharedCtx.resume();

    const ctx = sharedCtx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (tone === 'ok') {
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
    } else {
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.15);
    }
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch {
    // Never let an audio failure break the lesson.
  }

  if (navigator.vibrate) {
    navigator.vibrate(tone === 'ok' ? 25 : [20, 40, 20]);
  }
}
