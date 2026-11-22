import { storage } from '../../../utils/storage';

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

/**
 * Les EFFETS DE JEU (2026-10-28, propriétaire : « ajoute des effets sonores » — labos, questions pendant le labo, défi « اختبر ذاكرتك »).
 * Même règle que `playEffect` : synthétisés (aucun fichier), muets tant que l'élève n'a pas activé « الصوت » (préférence de l'appareil,
 * `smarter_effects_enabled`, lue AU MOMENT de jouer : le bouton de la page et celui du défi disent la même chose), jamais bloquants.
 *   pop      la carte de questions s'ouvre        correct  une bonne réponse        wrong   une erreur / temps écoulé
 *   tick     une seconde des 3 dernières           start    le défi démarre          step    une étape du labo est faite
 *   win      tout est fait / défi parfait
 *   tooth    une dent de chaîne (`pitch` varie)  bell     un tour complet          flag    l'arrivée au but          over  le but dépassé
 */
const SFX = {
  pop: [[520, 0, 0.07, 'sine', 0.08], [780, 0.05, 0.08, 'sine', 0.07]],
  correct: [[660, 0, 0.09, 'triangle', 0.12], [990, 0.08, 0.16, 'triangle', 0.12]],
  wrong: [[240, 0, 0.12, 'sawtooth', 0.06], [180, 0.1, 0.2, 'sawtooth', 0.06]],
  tick: [[1200, 0, 0.03, 'square', 0.04]],
  start: [[392, 0, 0.08, 'triangle', 0.1], [523, 0.08, 0.08, 'triangle', 0.1], [784, 0.16, 0.18, 'triangle', 0.12]],
  step: [[523, 0, 0.1, 'triangle', 0.12], [659, 0.1, 0.1, 'triangle', 0.12], [784, 0.2, 0.1, 'triangle', 0.12], [1047, 0.3, 0.28, 'triangle', 0.14]],
  // le labo (gear-crank, 2026-10-28) : un déclic par dent de la chaîne, une cloche par tour complet de roue, l'arrivée au drapeau, le dépassement
  tooth: [[1700, 0, 0.018, 'square', 0.02]],
  bell: [[1568, 0, 0.28, 'sine', 0.08], [2093, 0.01, 0.22, 'sine', 0.035]],
  flag: [[784, 0, 0.1, 'triangle', 0.12], [1175, 0.09, 0.28, 'triangle', 0.12]],
  over: [[160, 0, 0.2, 'sawtooth', 0.07]],
  // « مختبر التفكير » (2026-11-01, THINKING_LAB.md §7) : une clé qui s'ouvre, l'étincelle d'une observation 👁,
  // une piste abandonnée ↩, « ليس بعد » (deux notes douces qui descendent — jamais un buzzer), le pas d'une relecture.
  lock: [[880, 0, 0.05, 'square', 0.05], [1320, 0.06, 0.12, 'triangle', 0.09]],
  spark: [[1568, 0, 0.08, 'sine', 0.07], [2349, 0.06, 0.14, 'sine', 0.06]],
  slide: [[440, 0, 0.18, 'triangle', 0.07], [330, 0.12, 0.22, 'triangle', 0.06]],
  notyet: [[523, 0, 0.14, 'sine', 0.08], [440, 0.14, 0.22, 'sine', 0.07]],
  stepTick: [[988, 0, 0.04, 'triangle', 0.05]],
  win: [[523, 0, 0.12, 'triangle', 0.12], [659, 0.12, 0.12, 'triangle', 0.12], [784, 0.24, 0.12, 'triangle', 0.12], [1047, 0.36, 0.14, 'triangle', 0.14],
    [784, 0.52, 0.1, 'triangle', 0.1], [1047, 0.62, 0.45, 'triangle', 0.15], [1319, 0.62, 0.45, 'sine', 0.06]],
};

/** La préférence « الصوت » de l'appareil, lue maintenant (aucun hook : utilisable depuis n'importe quel geste). */
export function effectsEnabledNow() {
  return storage.getItem('smarter_effects_enabled') === '1';
}

export function playSfx(name, { pitch = 1, enabled = effectsEnabledNow() } = {}) {
  const notes = SFX[name];
  if (!enabled || !notes) return;
  try {
    if (!sharedCtx || sharedCtx.state === 'closed') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      sharedCtx = new AudioCtx();
    }
    if (sharedCtx.state === 'suspended') sharedCtx.resume();
    const ctx = sharedCtx;
    const t0 = ctx.currentTime;
    for (const [freq, at, dur, type, vol] of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq * pitch, t0 + at);
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.0001, t0 + at);
      gain.gain.exponentialRampToValueAtTime(vol, t0 + at + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + at + dur);
      osc.start(t0 + at);
      osc.stop(t0 + at + dur + 0.02);
    }
  } catch {
    // Jamais un son ne casse la leçon.
  }
}
