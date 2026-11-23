import { describe, expect, it } from 'vitest';
import { DivisorIslesGame } from './Game';

// The evidence a save from before a forge still gives (`Game.js › crossing`): it read the PILOT's segment ids
// (`{ s15: 3, s16: 4, s42: 6 }`), so on any other road every plank came out undefined. It reads the story's segments now.
const P = DivisorIslesGame.prototype;
const bridge = (id, a, holdsWith, extra = {}) => ({ id, kind: 'bridge', a, holdsWith, complete: false, ...extra });

describe('the crossing a forge tests a rule on', () => {
  it('the log, when there is one, as it is', () => {
    const log = [{ a: 60, b: 4 }];
    expect(P.crossing.call({ log, segs: [] })).toBe(log);
  });

  it('else the standing bridges of THE STORY’s road, each with the plank he laid — or the one the story names', () => {
    const segs = [
      bridge('g60', 60, 2, { complete: true, builtWith: 4 }),
      bridge('g72', 72, 3, { complete: true, builtWith: null }),
      bridge('g1400', 1400, 8, { complete: false }),
      { id: 'dash', kind: 'rail', complete: true },
      bridge('g0', 0, 5, { complete: true, standing: true }),
    ];
    expect(P.crossing.call({ log: [], segs, built: { g72: 9 } })).toEqual([
      { a: 60, b: 4 },
      { a: 72, b: 9 },
    ]);
    expect(P.crossing.call({ log: [], segs, built: {} })).toEqual([
      { a: 60, b: 4 },
      { a: 72, b: 3 },
    ]);
  });

  it('the pilot’s road still gives its three bridges with their planks', () => {
    const segs = [
      bridge('s15', 15, 3, { complete: true, builtWith: 3 }),
      bridge('s16', 16, 4, { complete: true, builtWith: 4 }),
      bridge('s42', 42, 6, { complete: true, builtWith: 6 }),
    ];
    expect(P.crossing.call({ log: [], segs, built: {} })).toEqual([
      { a: 15, b: 3 },
      { a: 16, b: 4 },
      { a: 42, b: 6 },
    ]);
  });

  it('no plank is ever undefined, and at most sixteen bridges are kept', () => {
    const segs = Array.from({ length: 20 }, (_, i) => bridge(`b${i}`, 10 + i, 1, { complete: true }));
    const out = P.crossing.call({ log: [], segs, built: {} });
    expect(out).toHaveLength(16);
    expect(out.every((x) => Number.isInteger(x.b))).toBe(true);
    expect(out[0].a).toBe(14);
  });
});
