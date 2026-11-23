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
  checkCount,
  gapSign,
  STATUES,
  isDivisor,
} from './logic';
import { explain, waveSay, T } from './strings';
import { verifyClaim } from '../kit/claims';

describe('L’archipel des diviseurs — logic', () => {
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

  it('a last bridge announced by a LABEL: only the number of planks is typed; a plank that does not fill is built anyway', () => {
    expect(checkCount(504, 36, 14)).toBe('ok');
    expect(checkCount(504, 36, 15)).toBe('long');
    expect(checkCount(504, 36, 13)).toBe('short');
    expect(checkCount(504, 36, 1.5)).toBe('nan');
    expect(checkCount(504, 36, -1)).toBe('nan');
    // 48 does not fill 504: no count is right — the world builds what he chose and shows what is left
    for (const q of [0, 10, 11, 14]) expect(checkCount(504, 48, q)).toBe('open');
  });

  it('the sign over a gap: its count, or the story’s label for the last bridge — never the count then', () => {
    expect(gapSign({ a: 756 })).toBe('756\u00a0cases');
    expect(gapSign({ a: 1400 })).toBe('1\u202f400\u00a0cases');
    expect(gapSign({ a: 756, boss: { options: [32, 36], price: 1850 } })).toBe('756\u00a0cases');
    const label = { text: '2³ × 3² × 7', tex: '2^{3} \\times 3^{2} \\times 7' };
    expect(gapSign({ a: 504, boss: { label } })).toBe('2³ × 3² × 7\u00a0cases');
    expect(gapSign({ a: 504, boss: { label: { ...label, sign: 'Le dernier fossé' } } })).toBe('Le dernier fossé');
    expect(gapSign({ a: 504, boss: { label } })).not.toContain('504');
  });

  it('the statues’ sentences are named by the `phrase` claim’s ids, each with the meaning that claim gives it', () => {
    expect(STATUES.sentences.map((x) => x.id)).toEqual(['diviseur', 'divise', 'divisible', 'multiple']);
    const words = {
      diviseur: 'est un diviseur de',
      divise: 'divise',
      divisible: 'est divisible par',
      multiple: 'est un multiple de',
    };
    for (const st of STATUES.sentences) {
      expect(st.mid, st.id).toBe(words[st.id]);
      // written the right way round (the divisor first when `smallFirst`), the claim is true; the other way, false
      const right = st.smallFirst ? STATUES.small : STATUES.big;
      const wrong = st.smallFirst ? STATUES.big : STATUES.small;
      const claim = (first) => ({ kind: 'phrase', a: STATUES.big, b: STATUES.small, first, phrase: st.id });
      expect(verifyClaim(claim(right)), st.id).toBe(true);
      expect(verifyClaim(claim(wrong)), st.id).toBe(false);
      // each sentence has its hint, under the same id
      expect(typeof T.statues.hint[st.id], st.id).toBe('string');
    }
    expect(Object.keys(T.statues.hint).sort()).toEqual(STATUES.sentences.map((x) => x.id).sort());
  });
});

describe('L’archipel des diviseurs — a practice wave the lesson wrote itself', () => {
  it('a type this world does not know speaks its own `say` and its own guidance `why`', () => {
    const w = {
      type: 'lessonOwn',
      say: 'Un nombre qui divise $21 + 35$',
      why: { right: '7 divise 21 et 35', wrong: { 3: '3 ne divise pas 56', 5: '5 ne divise pas 56' } },
      gates: [3, 7, 5],
      good: 1,
    };
    expect(waveSay(w)).toBe('Un nombre qui divise $21 + 35$');
    expect(explain(w, 5)).toEqual({ wrong: '5 ne divise pas 56', right: '7 divise 21 et 35' });
    expect(explain({ type: 'lessonOwn', say: 'x', gates: [1, 2, 3], good: 0 }, 2)).toEqual({ wrong: '', right: '' });
  });
});
