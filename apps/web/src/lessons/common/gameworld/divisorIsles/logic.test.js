import { describe, it, expect } from 'vitest';
import {
  divide,
  predictOptions,
  bridgeStars,
  SEGMENTS,
  ISLANDS,
  DASH_WAVES,
  buildLayout,
  checkDivision,
  STATUES,
  isDivisor,
} from './logic';
import { explain, waveSay } from './strings';

describe('أرخبيل القواسم — logic', () => {
  it('divides: a = b × q + r with r < b', () => {
    for (const a of [7, 15, 16, 42, 48, 120, 756])
      for (let b = 1; b <= 40; b += 1) {
        const { q, r } = divide(a, b);
        expect(b * q + r).toBe(a);
        expect(r).toBeLessThan(b);
      }
    expect(divide(756, 32)).toEqual({ q: 23, r: 20 });
    expect(divide(756, 36)).toEqual({ q: 21, r: 0 });
    expect(divide(7, 9)).toEqual({ q: 0, r: 7 });
  });

  it('always offers the true remainder, and at most b values for a small mould', () => {
    for (const seg of SEGMENTS.filter((s) => s.a))
      for (let b = 1; b <= 40; b += 1) {
        const opts = predictOptions(seg.a, b);
        expect(opts).toContain(divide(seg.a, b).r);
        expect(new Set(opts).size).toBe(opts.length);
        if (b <= 9 && b <= seg.a) expect(opts).toHaveLength(b);
      }
  });

  it('every bridge has a mould that holds, and the lesson contrasts are there', () => {
    const fits = (seg, list) => list.filter((b) => isDivisor(seg.a, b));
    const by = Object.fromEntries(SEGMENTS.map((s) => [s.id, s]));
    expect(fits(by.s15, by.s15.moulds)).toEqual([3]);
    expect(fits(by.s16, [3, ...by.s16.moulds])).toEqual([2, 4]); // the carried 3 fails first
    expect(fits(by.s42, by.s42.moulds)).toEqual([6, 7]); // 4 is even and fails: the « even » idea dies here
    expect(fits(by.s48, by.s48.storm.moulds)).toEqual([8]); // 48 = 6 × 8: the quotient is the only one
    expect(fits(by.s120, by.s120.moulds)).toEqual([6, 20]);
    expect(fits(by.s7, by.s7.moulds)).toEqual([]); // nothing on the pedestals: 1 and 7 come from the workshop
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9].filter((b) => isDivisor(7, b))).toEqual([1, 7]);
    expect(by.s756.boss.options.filter((b) => isDivisor(756, b))).toEqual([36]);
  });

  it('each dash wave has exactly one right gate', () => {
    for (const w of DASH_WAVES) expect(w.gates.filter(w.test)).toHaveLength(1);
  });

  it('stars: 1 to 3', () => {
    expect(bridgeStars({ firstPrediction: true, falls: 0 })).toBe(3);
    expect(bridgeStars({ firstPrediction: false, falls: 0 })).toBe(2);
    expect(bridgeStars({ firstPrediction: false, falls: 2 })).toBe(1);
    expect(bridgeStars({ firstPrediction: null, falls: 0 })).toBe(3);
  });

  it('lays the chain out without overlapping islands, one segment per gap', () => {
    const { islands, segs } = buildLayout();
    expect(islands).toHaveLength(ISLANDS.length);
    expect(segs).toHaveLength(ISLANDS.length - 1);
    for (let i = 0; i < islands.length; i += 1)
      for (let j = i + 1; j < islands.length; j += 1) {
        const d = Math.hypot(islands[i].x - islands[j].x, islands[i].z - islands[j].z);
        expect(d).toBeGreaterThan(islands[i].R + islands[j].R + 4);
      }
    for (const s of segs) expect(Math.hypot(s.ex - s.sx, s.ez - s.sz)).toBeCloseTo(s.len, 6);
  });

  it('checks the typed division of the last bridge', () => {
    expect(checkDivision(756, 32, 23, 20)).toBe('ok');
    expect(checkDivision(756, 32, 22, 52)).toBe('big');
    expect(checkDivision(756, 32, 23, 21)).toBe('sum');
    expect(checkDivision(756, 32, 24, 0)).toBe('long'); // 24 planks of 32 = 768 cells: longer than the gap
    expect(checkDivision(756, 36, 21, 0)).toBe('ok');
    expect(STATUES.big).toBe(STATUES.small * STATUES.q);
  });
});

describe('أرخبيل القواسم — a practice wave the lesson wrote itself', () => {
  it('a type this world does not know speaks its own `say` and its own guidance `why`', () => {
    const w = {
      type: 'lessonOwn',
      say: 'عدد يقسم $21 + 35$',
      why: { right: '7 يقسم 21 و 35', wrong: { 3: '3 لا يقسم 56', 5: '5 لا يقسم 56' } },
      gates: [3, 7, 5],
      good: 1,
    };
    expect(waveSay(w)).toBe('عدد يقسم $21 + 35$');
    expect(explain(w, 5)).toEqual({ wrong: '5 لا يقسم 56', right: '7 يقسم 21 و 35' });
    expect(explain({ type: 'lessonOwn', say: 'x', gates: [1, 2, 3], good: 0 }, 2)).toEqual({ wrong: '', right: '' });
  });
});
