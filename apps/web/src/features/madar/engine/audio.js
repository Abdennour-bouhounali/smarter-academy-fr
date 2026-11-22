/**
 * Les sons de « مدار », synthétisés (WebAudio) — aucun fichier audio.
 *
 * Le contexte audio naît au premier geste de l'élève (règle des navigateurs).
 * Muet : mémorisé par appareil (`localStorage`, une commodité, jamais une
 * donnée). Chaque son est court et doux : un jeu dans une salle de classe.
 */
const MUTE_KEY = 'madar.muted';

function readMuted() {
  try {
    return window.localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeMuted(muted) {
  try {
    window.localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch {
    // Stockage indisponible (navigation privée) : le réglage vaut pour la séance.
  }
}

export function createAudio() {
  let ctx = null;
  let master = null;
  let muted = readMuted();
  let noiseBuffer = null;

  function ensure() {
    if (muted) return null;
    if (!ctx) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
      master = ctx.createGain();
      master.gain.value = 0.32;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function tone({ freq, to, dur = 0.12, type = 'sine', gain = 0.5, delay = 0 }) {
    const c = ensure();
    if (!c) return;
    const t0 = c.currentTime + delay;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function noise({ dur = 0.3, gain = 0.5, from = 2000, to = 200 }) {
    const c = ensure();
    if (!c) return;
    if (!noiseBuffer) {
      noiseBuffer = c.createBuffer(1, c.sampleRate, c.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    const t0 = c.currentTime;
    const src = c.createBufferSource();
    src.buffer = noiseBuffer;
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(from, t0);
    filter.frequency.exponentialRampToValueAtTime(to, t0 + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter).connect(g).connect(master);
    src.start(t0);
    src.stop(t0 + dur);
  }

  // Une gamme pentatonique : les étoiles d'une série montent sans jamais grincer.
  const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
  const note = (n) => 523.25 * 2 ** (n / 12);

  return {
    get muted() { return muted; },
    setMuted(value) {
      muted = value;
      writeMuted(value);
      if (muted && ctx) ctx.suspend().catch(() => {});
      if (!muted && ctx) ctx.resume().catch(() => {});
    },
    unlock() { ensure(); },
    flip(lane) { tone({ freq: lane ? 300 : 420, to: lane ? 220 : 560, dur: 0.08, type: 'triangle', gain: 0.25 }); },
    star(combo) { tone({ freq: note(PENTA[Math.min(combo - 1, PENTA.length - 1) % PENTA.length]), dur: 0.16, type: 'sine', gain: 0.35 }); },
    multiplier(m) {
      [0, 4, 7, 12].forEach((n, i) => tone({ freq: note(n + m * 2), dur: 0.14, type: 'triangle', gain: 0.3, delay: i * 0.05 }));
    },
    near() { noise({ dur: 0.18, gain: 0.25, from: 6000, to: 800 }); tone({ freq: 880, to: 1320, dur: 0.1, type: 'sine', gain: 0.18 }); },
    shield() { tone({ freq: 440, to: 880, dur: 0.25, type: 'sine', gain: 0.3 }); },
    shieldBreak() { noise({ dur: 0.25, gain: 0.35, from: 4000, to: 300 }); tone({ freq: 660, to: 220, dur: 0.25, type: 'square', gain: 0.12 }); },
    comet() { tone({ freq: 980, to: 760, dur: 0.12, type: 'square', gain: 0.08 }); },
    crash() { noise({ dur: 0.7, gain: 0.7, from: 1800, to: 60 }); tone({ freq: 120, to: 40, dur: 0.6, type: 'sawtooth', gain: 0.25 }); },
    sector() { [0, 4, 7, 11, 14].forEach((n, i) => tone({ freq: note(n - 12), dur: 0.5, type: 'sine', gain: 0.22, delay: i * 0.07 })); },
    heart() { [7, 12, 16].forEach((n, i) => tone({ freq: note(n), dur: 0.22, type: 'sine', gain: 0.3, delay: i * 0.08 })); },
    wrong() { tone({ freq: 330, to: 260, dur: 0.22, type: 'triangle', gain: 0.2 }); },
    record() { [0, 4, 7, 12, 16, 19, 24].forEach((n, i) => tone({ freq: note(n), dur: 0.3, type: 'triangle', gain: 0.25, delay: i * 0.06 })); },
    go() { tone({ freq: 260, to: 780, dur: 0.35, type: 'sawtooth', gain: 0.12 }); noise({ dur: 0.4, gain: 0.2, from: 300, to: 3000 }); },
    dispose() { ctx?.close().catch(() => {}); ctx = null; },
  };
}

/** Une vibration courte, si l'appareil sait vibrer (téléphone). */
export function buzz(pattern) {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern);
  } catch {
    // Pas de vibration : rien à faire.
  }
}
