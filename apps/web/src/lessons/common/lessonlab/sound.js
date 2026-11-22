/**
 * The sounds of « Mon labo » — synthesised with WebAudio (no asset), its OWN small instrument (2026-11-17).
 *
 * The rule of the lab's sound: it says WHAT HAPPENED under the hand, never the rule of the lesson.
 *   - a NUMBER has a note (`pitchOf`): the wall, the flag, a digit, a divisor are heard as they move — 12 does not sound like 13;
 *   - « nothing is left » has ONE sound in every instrument (`fit`): the student sweeps the wall and HEARS where the rows are full;
 *   - « something is left » is a soft low pair of notes (`rest`) — never a buzzer: the lab has no wrong answer;
 *   - a material has its noise: scissors (`snip`), a pencil (`pencil`), a drawer (`drawer`), the wheel of a padlock (`click`).
 * Every name an instrument plays must exist in SOUNDS (checked by lab.test.js). The switch of the lab turns everything off.
 */
const SCALE = [0, 2, 4, 7, 9]; // pentatonic: any two notes of the lab sound well together
const N = (semi) => 261.63 * 2 ** (semi / 12);

/** The note of a number, in semitones above C4: five notes per octave, three octaves, then round again. */
export const noteOf = (n) => {
  const k = Math.max(0, Math.round(Number(n) || 0));
  return SCALE[k % 5] + 12 * (Math.floor(k / 5) % 3);
};
export const pitchOf = (n) => N(noteOf(n));

export const SOUNDS = {
  // ── the hand moves a number ──
  tick: (s, n = 0) => {
    s.tone({ f: pitchOf(n), d: 0.07, type: 'triangle', g: 0.22 });
    s.noise({ d: 0.025, g: 0.05, from: 2600, to: 1200 });
  },
  click: (s, digit = 0) => {
    s.tone({ f: 1500, d: 0.018, type: 'square', g: 0.05 });
    s.tone({ f: pitchOf(digit), t: 0.012, d: 0.09, type: 'triangle', g: 0.2 });
  },
  select: (s, n = 0) => s.tone({ f: pitchOf(n), d: 0.16, type: 'triangle', g: 0.2 }),
  pair: (s, n = 0) => {
    s.tone({ f: pitchOf(n), d: 0.3, type: 'triangle', g: 0.18 });
    s.tone({ f: pitchOf(n) * 1.5, t: 0.03, d: 0.34, g: 0.13 });
  },
  // ── what the numbers answer ──
  fit: (s) => {
    [12, 19, 24].forEach((x, i) => s.tone({ f: N(x), t: i * 0.045, d: 0.5, g: 0.19 }));
    s.tone({ f: N(31), t: 0.09, d: 0.35, g: 0.06 });
  },
  rest: (s) => {
    s.tone({ f: N(-5), d: 0.14, g: 0.2 });
    s.tone({ f: N(-8), t: 0.11, d: 0.22, g: 0.16 });
  },
  hop: (s, i = 0) => s.tone({ f: pitchOf(i), d: 0.2, type: 'triangle', g: 0.26, slide: 1.06 }),
  short: (s) => {
    s.tone({ f: N(7), d: 0.14, type: 'triangle', g: 0.18 });
    s.tone({ f: N(4), t: 0.12, d: 0.24, type: 'triangle', g: 0.15 });
  },
  found: (s, d = 1, e = 1) => {
    s.tone({ f: pitchOf(d), d: 0.32, type: 'triangle', g: 0.2 });
    s.tone({ f: pitchOf(e) * (d === e ? 2 : 1), t: 0.06, d: 0.4, g: 0.15 });
  },
  miss: (s) => s.tone({ f: 150, d: 0.05, g: 0.12 }),
  lamp: (s, ok = 1) =>
    ok
      ? (s.tone({ f: N(24), d: 0.3, g: 0.16 }), s.tone({ f: N(31), t: 0.03, d: 0.3, g: 0.07 }))
      : s.tone({ f: N(-5), d: 0.16, g: 0.18 }),
  lamps: (s, k = 1) => {
    for (let i = 0; i < Math.min(6, k); i += 1)
      s.tone({ f: N(24 + SCALE[i % 5]), t: 0.12 + i * 0.07, d: 0.22, g: 0.09 });
  },
  complete: (s) => {
    [0, 4, 7, 12, 16, 19].forEach((x, i) => s.tone({ f: N(x + 12), t: i * 0.07, d: 0.45, type: 'triangle', g: 0.18 }));
    s.noise({ t: 0.4, d: 0.5, g: 0.04, from: 7000, to: 9000 });
  },
  crown: (s) => {
    [0, 7, 12, 16].forEach((x, i) =>
      s.tone({ f: N(x + 12), t: i * 0.1, d: i === 3 ? 0.8 : 0.3, type: 'triangle', g: 0.2 }),
    );
    s.tone({ f: N(36), t: 0.34, d: 0.7, g: 0.05 });
  },
  // ── materials ──
  swap: (s) => {
    s.tone({ f: 330, d: 0.22, g: 0.17, slide: 2 });
    s.tone({ f: 660, d: 0.22, g: 0.17, slide: 0.5 });
  },
  snip: (s, side = 1) => {
    s.noise({ d: 0.04, g: 0.2, from: 6000, to: 3500 });
    s.noise({ t: 0.07, d: 0.05, g: 0.22, from: 5000, to: 2500 });
    s.tone({ f: pitchOf(side), t: 0.1, d: 0.25, type: 'triangle', g: 0.2 });
  },
  undo: (s) => s.tone({ f: 520, d: 0.2, g: 0.16, slide: 0.55 }),
  pencil: (s) => {
    [0, 0.07, 0.15].forEach((t, i) => s.noise({ t, d: 0.06 + i * 0.01, g: 0.1, from: 3200 + i * 500, to: 1900 }));
  },
  erase: (s) => s.noise({ d: 0.22, g: 0.07, from: 900, to: 1500 }),
  // ── the bench ──
  ui: (s) => s.tone({ f: 620, d: 0.05, g: 0.14 }),
  open: (s) => {
    s.tone({ f: 110, d: 0.12, g: 0.25, slide: 0.6 });
    s.tone({ f: N(7), t: 0.04, d: 0.12, type: 'triangle', g: 0.16 });
    s.tone({ f: N(12), t: 0.12, d: 0.22, type: 'triangle', g: 0.16 });
  },
  drawer: (s) => {
    s.noise({ d: 0.28, g: 0.12, from: 300, to: 1400 });
    s.tone({ f: 95, t: 0.24, d: 0.1, g: 0.25, slide: 0.6 });
  },
  shut: (s) => {
    s.noise({ d: 0.2, g: 0.1, from: 1200, to: 300 });
    s.tone({ f: 85, t: 0.16, d: 0.1, g: 0.25, slide: 0.6 });
  },
  dice: (s) => {
    for (let i = 0; i < 5; i += 1)
      s.tone({ f: 500 + ((i * 337) % 600), t: i * 0.045, d: 0.035, type: 'square', g: 0.06 });
    s.tone({ f: N(12), t: 0.26, d: 0.2, type: 'triangle', g: 0.2 });
  },
  quest: (s) => {
    [12, 16, 19, 24].forEach((x, i) => s.tone({ f: N(x), t: i * 0.08, d: 0.4, type: 'triangle', g: 0.2 }));
    s.tone({ f: N(36), t: 0.32, d: 0.5, g: 0.05 });
  },
  enter: (s) => {
    [0, 7, 16].forEach((x, i) => s.tone({ f: N(x), t: i * 0.11, d: 0.55 + i * 0.1, g: 0.11, attack: 0.08 }));
  },
  on: (s) => {
    s.tone({ f: N(12), d: 0.1, type: 'triangle', g: 0.18 });
    s.tone({ f: N(19), t: 0.09, d: 0.2, type: 'triangle', g: 0.18 });
  },
};
export const SOUND_NAMES = Object.keys(SOUNDS);

/** The least time between two plays of the same sound (seconds): a fast drag ticks, it does not rattle. */
export const GAP = { tick: 0.035, click: 0.03, miss: 0.06, fit: 0.12, found: 0.05, lamps: 0.3, enter: 1 };

export class LabSound {
  /** `palette` / `gaps`: another page (« L’échauffement ») brings its own sounds to the same small instrument. */
  constructor(palette = SOUNDS, gaps = GAP, log = '__labSounds') {
    this.ctx = null;
    this.out = null;
    this.buf = null;
    this.last = {};
    this.palette = palette;
    this.gaps = gaps;
    this.log = log;
  }

  /** The context is made at the first sound — always inside a gesture of the student, so no browser blocks it. */
  wake() {
    if (this.ctx && this.ctx.state !== 'closed') {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      return;
    }
    const AC = typeof window !== 'undefined' ? window.AudioContext || window.webkitAudioContext : null;
    if (!AC) return;
    this.ctx = new AC();
    const comp = this.ctx.createDynamicsCompressor(); // several sounds at once (a tick, a chime, a star) never clip
    this.out = this.ctx.createGain();
    this.out.gain.value = 0.85;
    this.out.connect(comp);
    comp.connect(this.ctx.destination);
    const len = this.ctx.sampleRate;
    this.buf = this.ctx.createBuffer(1, len, len);
    const data = this.buf.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
  }

  tone({ f = 440, t = 0, d = 0.2, type = 'sine', g = 0.2, slide = 0, attack = 0.006 }) {
    const now = this.ctx.currentTime + t;
    const o = this.ctx.createOscillator();
    const v = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, now);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f * slide), now + d);
    v.gain.setValueAtTime(0.0001, now);
    v.gain.exponentialRampToValueAtTime(g, now + attack);
    v.gain.exponentialRampToValueAtTime(0.0001, now + d);
    o.connect(v);
    v.connect(this.out);
    o.start(now);
    o.stop(now + d + 0.05);
  }

  noise({ t = 0, d = 0.2, g = 0.1, from = 2000, to = 500 }) {
    const now = this.ctx.currentTime + t;
    const src = this.ctx.createBufferSource();
    src.buffer = this.buf;
    const filt = this.ctx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.Q.value = 0.9;
    filt.frequency.setValueAtTime(from, now);
    filt.frequency.exponentialRampToValueAtTime(to, now + d);
    const v = this.ctx.createGain();
    v.gain.setValueAtTime(g, now);
    v.gain.exponentialRampToValueAtTime(0.0001, now + d);
    src.connect(filt);
    filt.connect(v);
    v.connect(this.out);
    src.start(now, Math.random() * 0.5, d + 0.02);
  }

  /** Plays a sound of the palette; `p` and `q` are its numbers (the value under the hand, a divisor and its partner…). */
  play(name, p, q) {
    const make = this.palette[name];
    if (!make) return false;
    try {
      this.wake();
      if (!this.ctx) return false;
      const now = this.ctx.currentTime;
      if (now - (this.last[name] ?? -9) < (this.gaps[name] ?? 0)) return false;
      this.last[name] = now;
      make(this, p, q);
      if (import.meta.env?.DEV && typeof window !== 'undefined') (window[this.log] ??= []).push(name); // the walk listens here
      return true;
    } catch {
      return false;
    } // a sound never breaks the lab
  }

  dispose() {
    if (this.ctx) this.ctx.close().catch(() => {});
    this.ctx = null;
  }
}
