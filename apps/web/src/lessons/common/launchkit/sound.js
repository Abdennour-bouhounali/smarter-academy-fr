/**
 * The sounds of « L’échauffement » — its own palette on the small synthesiser of the lab (`lessonlab/sound.js › LabSound`:
 * WebAudio, no asset). ON by default; the switch of the launch turns everything off.
 *
 * Two rules. (1) A sound never tells right from wrong BEFORE the student hands in: the two boxes of a sort have each their
 * note, whatever the card. (2) The verdict is `good` (a segment lights) or `later` (two soft notes — never a buzzer).
 * The « flow »: a quiet bed of music gains a layer with each right answer in a row (0 → 3) and falls back at a miss. It is
 * show only — nothing is scored on it.
 */
import { LabSound, pitchOf } from '../lessonlab/sound';

const N = (semi) => 261.63 * 2 ** (semi / 12);

export const SOUNDS = {
  open: (s) => {
    s.noise({ d: 0.25, g: 0.1, from: 400, to: 1600 });
    [0, 7, 12].forEach((x, i) => s.tone({ f: N(x), t: 0.12 + i * 0.09, d: 0.4, g: 0.12, attack: 0.05 }));
  },
  go: (s) => {
    [0, 4, 7, 12].forEach((x, i) => s.tone({ f: N(x + 12), t: i * 0.07, d: 0.28, type: 'triangle', g: 0.18 }));
  },
  key: (s, n = 0) => {
    s.tone({ f: pitchOf(n), d: 0.07, type: 'triangle', g: 0.2 });
    s.noise({ d: 0.02, g: 0.04, from: 2600, to: 1400 });
  },
  erase: (s) => s.noise({ d: 0.12, g: 0.06, from: 1400, to: 700 }),
  slot: (s) => s.tone({ f: 560, d: 0.05, g: 0.12 }),
  lift: (s) => s.tone({ f: 420, d: 0.08, g: 0.12, slide: 1.5 }),
  drop: (s, yes = 1) => {
    s.tone({ f: 120, d: 0.09, g: 0.22, slide: 0.6 });
    s.tone({ f: N(yes ? 12 : 5), t: 0.03, d: 0.16, type: 'triangle', g: 0.16 });
  },
  back: (s) => s.tone({ f: 480, d: 0.14, g: 0.12, slide: 0.7 }),
  flag: (s, n = 0) => s.tone({ f: pitchOf(n), d: 0.06, type: 'triangle', g: 0.18 }),
  doubt: (s, on = 1) => {
    s.tone({ f: N(on ? 9 : 7), d: 0.1, g: 0.12 });
    s.tone({ f: N(on ? 7 : 9), t: 0.08, d: 0.14, g: 0.12 });
  },
  good: (s, k = 0) => {
    [12, 19, 24].forEach((x, i) => s.tone({ f: N(x + 2 * Math.min(3, k)), t: i * 0.045, d: 0.5, g: 0.19 }));
    s.noise({ t: 0.05, d: 0.25, g: 0.03, from: 7000, to: 9000 });
  },
  later: (s) => {
    s.tone({ f: N(-5), d: 0.16, g: 0.18 });
    s.tone({ f: N(-8), t: 0.13, d: 0.26, g: 0.15 });
  },
  charged: (s) => {
    [0, 4, 7, 12, 16].forEach((x, i) => s.tone({ f: N(x + 12), t: i * 0.07, d: 0.4, type: 'triangle', g: 0.18 }));
    s.tone({ f: 300, t: 0.1, d: 0.45, g: 0.08, slide: 3 });
  },
  step: (s) => {
    s.noise({ d: 0.07, g: 0.09, from: 3200, to: 1900 });
    s.tone({ f: N(14), t: 0.03, d: 0.12, g: 0.08 });
  },
  repaired: (s) => {
    s.tone({ f: 1800, d: 0.03, type: 'square', g: 0.06 });
    s.tone({ f: 2200, t: 0.09, d: 0.03, type: 'square', g: 0.06 });
    [7, 12, 16].forEach((x, i) => s.tone({ f: N(x + 12), t: 0.2 + i * 0.06, d: 0.4, type: 'triangle', g: 0.16 }));
  },
  star: (s) => {
    [12, 16, 19, 24, 28].forEach((x, i) => s.tone({ f: N(x), t: i * 0.08, d: 0.45, g: 0.14 }));
    s.tone({ f: N(36), t: 0.4, d: 0.6, g: 0.05 });
  },
  kit: (s, k = 1) => {
    for (let i = 0; i < Math.min(8, k); i += 1)
      s.tone({ f: N(12 + [0, 2, 4, 7, 9, 12, 14, 16][i]), t: i * 0.09, d: 0.3, type: 'triangle', g: 0.14 });
  },
  count: (s, n = 3) => s.tone({ f: n > 0 ? 440 : 880, d: n > 0 ? 0.16 : 0.5, type: 'square', g: 0.1 }),
  liftoff: (s) => {
    s.noise({ d: 1.25, g: 0.2, from: 200, to: 2400 });
    s.tone({ f: 110, d: 1.2, type: 'sawtooth', g: 0.1, slide: 6 });
    [12, 16, 19, 24].forEach((x, i) => s.tone({ f: N(x), t: 0.7 + i * 0.1, d: 0.5, type: 'triangle', g: 0.15 }));
  },
  ui: (s) => s.tone({ f: 620, d: 0.05, g: 0.13 }),
  on: (s) => {
    s.tone({ f: N(12), d: 0.1, type: 'triangle', g: 0.18 });
    s.tone({ f: N(19), t: 0.09, d: 0.2, type: 'triangle', g: 0.18 });
  },
};
export const SOUND_NAMES = Object.keys(SOUNDS);
export const GAP = { key: 0.03, flag: 0.035, drop: 0.05, open: 1 };

const CHORDS = [
  [0, 7, 16],
  [-3, 4, 12],
  [-7, 5, 12],
  [-5, 7, 14],
];
const BEAT = 0.42;

export class LaunchSound extends LabSound {
  constructor() {
    super(SOUNDS, GAP, '__launchSounds');
    this.flow = 0;
    this.bed = null;
    this.beat = 0;
  }

  /** The layers the bed plays on a beat, for a flow of 0 to 3 (pure: tested). */
  static layers(flow, beat) {
    const out = [];
    const chord = CHORDS[Math.floor(beat / 16) % 4];
    if (beat % 16 === 0) out.push({ f: N(chord[0] - 12), d: BEAT * 15, g: 0.05, attack: 0.6 });
    if (flow >= 1 && beat % 4 === 0)
      out.push({ f: N(chord[(beat / 4) % 3]), d: BEAT * 1.6, type: 'triangle', g: 0.045 });
    if (flow >= 2 && beat % 2 === 1) out.push({ f: N(chord[2] + 12), d: 0.05, g: 0.02 });
    if (flow >= 3) out.push({ f: N(chord[beat % 3] + 12), d: BEAT * 0.9, type: 'triangle', g: 0.035 });
    return out;
  }

  setFlow(n) {
    this.flow = Math.max(0, Math.min(3, n));
  }

  startBed() {
    if (this.bed) return;
    this.wake();
    if (!this.ctx) return;
    const tick = () => {
      try {
        for (const o of LaunchSound.layers(this.flow, this.beat)) this.tone(o);
      } catch {
        /* a sound never breaks the game */
      }
      this.beat += 1;
    };
    tick();
    this.bed = setInterval(tick, BEAT * 1000);
  }

  stopBed() {
    clearInterval(this.bed);
    this.bed = null;
  }
  dispose() {
    this.stopBed();
    super.dispose();
  }
}
