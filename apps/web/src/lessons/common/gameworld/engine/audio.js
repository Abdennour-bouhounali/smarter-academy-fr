/**
 * Game sound, synthesised with WebAudio (no asset): short effects and a soft generative music loop.
 * Nothing sounds before the first user gesture (`unlock()` is called from the « start » button).
 */
const NOTE = (semi) => 220 * 2 ** (semi / 12);
const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];
/** A count that is heard: one step of the scale every two steps of the count, from `base` semitones up. */
const CLIMB = (p, base) => NOTE(PENTA[(p >> 1) % PENTA.length] + 12 * Math.floor((p >> 1) / PENTA.length) + base);

export class GameAudio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.musicOn = false;
    this.timer = null;
    this.step = 0;
  }

  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.enabled ? 0.9 : 0;
    this.master.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = this.musicWanted === false ? 0 : 0.16;
    this.musicGain.connect(this.master);
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.5;
    this.sfxGain.connect(this.master);
  }

  /** The paper mode: an exam has no music. The effects stay (a right answer still chimes). */
  setMusic(on) {
    this.musicWanted = on;
    if (this.musicGain && this.ctx) this.musicGain.gain.setTargetAtTime(on ? 0.16 : 0, this.ctx.currentTime, 0.35);
  }

  setEnabled(on) {
    this.enabled = on;
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(on ? 0.9 : 0, this.ctx.currentTime, 0.05);
  }

  tone({ f = 440, t = 0, d = 0.2, type = 'sine', g = 0.5, slide = 0, out = null, attack = 0.005 }) {
    if (!this.ctx) return;
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
    v.connect(out ?? this.sfxGain);
    o.start(now);
    o.stop(now + d + 0.05);
  }

  noise({ t = 0, d = 0.3, g = 0.3, from = 2000, to = 300 }) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime + t;
    const len = Math.floor(this.ctx.sampleRate * d);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filt = this.ctx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.Q.value = 0.8;
    filt.frequency.setValueAtTime(from, now);
    filt.frequency.exponentialRampToValueAtTime(to, now + d);
    const v = this.ctx.createGain();
    v.gain.setValueAtTime(g, now);
    v.gain.exponentialRampToValueAtTime(0.0001, now + d);
    src.connect(filt);
    filt.connect(v);
    v.connect(this.sfxGain);
    src.start(now);
  }

  play(name, p = 0) {
    if (!this.ctx || !this.enabled) return;
    switch (name) {
      case 'plank':
        this.tone({
          f: NOTE(PENTA[p % PENTA.length] + 12 * Math.floor(p / PENTA.length) + 3),
          d: 0.16,
          type: 'triangle',
          g: 0.5,
        });
        this.noise({ d: 0.05, g: 0.12, from: 3000, to: 900 });
        break;
      case 'success':
        [0, 4, 7, 12, 16].forEach((s, i) =>
          this.tone({ f: NOTE(s + 12), t: i * 0.09, d: 0.5, type: 'triangle', g: 0.4 }),
        );
        break;
      case 'fail':
        this.tone({ f: 220, d: 0.35, type: 'sawtooth', g: 0.18, slide: 0.55 });
        this.tone({ f: 165, t: 0.12, d: 0.4, type: 'sawtooth', g: 0.14, slide: 0.6 });
        break;
      case 'crumble':
        this.noise({ d: 0.7, g: 0.35, from: 900, to: 120 });
        break;
      case 'pick':
        this.tone({ f: 660, d: 0.09, type: 'square', g: 0.15 });
        this.tone({ f: 990, t: 0.07, d: 0.12, type: 'square', g: 0.15 });
        break;
      case 'jump':
        this.tone({ f: 300, d: 0.18, type: 'sine', g: 0.3, slide: 2.2 });
        break;
      case 'fall':
        this.tone({ f: 700, d: 0.8, type: 'sine', g: 0.3, slide: 0.15 });
        break;
      case 'crystal':
        this.tone({ f: 1320, d: 0.12, type: 'sine', g: 0.3 });
        this.tone({ f: 1760, t: 0.06, d: 0.22, type: 'sine', g: 0.25 });
        break;
      case 'gate':
        this.tone({ f: 880, d: 0.1, type: 'triangle', g: 0.35 });
        this.tone({ f: 1320, t: 0.08, d: 0.25, type: 'triangle', g: 0.35 });
        break;
      case 'hit':
        this.tone({ f: 140, d: 0.3, type: 'square', g: 0.3, slide: 0.5 });
        this.noise({ d: 0.25, g: 0.3, from: 600, to: 100 });
        break;
      case 'key':
        [0, 7, 12, 16, 19, 24].forEach((s, i) =>
          this.tone({ f: NOTE(s + 12), t: i * 0.11, d: 0.7, type: 'sine', g: 0.35 }),
        );
        break;
      case 'star':
        this.tone({ f: NOTE(24 + 4 * p), d: 0.35, type: 'triangle', g: 0.35 });
        break;
      case 'ui':
        this.tone({ f: 520, d: 0.06, type: 'sine', g: 0.2 });
        break;
      case 'wind':
        this.noise({ d: 1.8, g: 0.5, from: 300, to: 1800 });
        break;
      case 'paper':
        this.noise({ d: 0.35, g: 0.18, from: 5000, to: 1800 });
        break;
      // a chart that fills by itself: `sweep` is one step of the count (it climbs with p), `spark` a cell that lights in it
      case 'sweep':
        this.tone({ f: CLIMB(p, 12), d: 0.07, type: 'sine', g: 0.12 });
        break;
      case 'spark':
        this.tone({ f: CLIMB(p, 24), t: 0.02, d: 0.16, type: 'triangle', g: 0.16 });
        break;
      case 'lane':
        this.tone({ f: 500, d: 0.07, type: 'sine', g: 0.15, slide: 1.4 });
        break;
      case 'finale':
        [0, 4, 7, 12, 7, 12, 16, 19, 24].forEach((s, i) =>
          this.tone({ f: NOTE(s + 12), t: i * 0.16, d: 0.9, type: 'triangle', g: 0.4 }),
        );
        break;
      default:
        break;
    }
  }

  /** A slow four-chord loop with a plucked pentatonic line; `mood` 0 (day) → 1 (night) lowers and thins it. */
  startMusic() {
    if (!this.ctx || this.musicOn) return;
    this.musicOn = true;
    this.mood = 0;
    this.fast = false;
    const CHORDS = [
      [0, 7, 16],
      [-3, 4, 12],
      [-7, 5, 12],
      [-5, 7, 14],
    ];
    const tick = () => {
      if (!this.musicOn) return;
      const beat = this.fast ? 0.21 : 0.34;
      const s = this.step;
      this.step += 1;
      const chord = CHORDS[Math.floor(s / 16) % 4];
      if (s % 16 === 0)
        chord.forEach((n) =>
          this.tone({ f: NOTE(n - 12), d: beat * 16, type: 'sine', g: 0.22, out: this.musicGain, attack: 0.8 }),
        );
      const pattern = [0, 2, 1, 2, 0, 2, 1, 3];
      if (s % 2 === 0 || this.fast) {
        const n = chord[pattern[s % 8] % 3] + (pattern[s % 8] === 3 ? 12 : 0) + (s % 32 > 23 ? 12 : 0);
        this.tone({ f: NOTE(n + 12), d: beat * 1.8, type: 'triangle', g: 0.2 - this.mood * 0.06, out: this.musicGain });
      }
      if (this.fast && s % 4 === 0)
        this.tone({ f: 70, d: 0.14, type: 'sine', g: 0.5, slide: 0.5, out: this.musicGain });
      this.timer = setTimeout(tick, beat * 1000);
    };
    tick();
  }

  stopMusic() {
    this.musicOn = false;
    clearTimeout(this.timer);
  }

  dispose() {
    this.stopMusic();
    if (this.ctx) this.ctx.close().catch(() => {});
    this.ctx = null;
  }
}
