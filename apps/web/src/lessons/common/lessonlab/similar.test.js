import { describe, it, expect } from 'vitest';
import { SIM_K, cRange, sRange, cStart, similarOf, decimalOf, frac, feq } from './similar';
import { QUESTS, observe, luckyPair } from './logic';
import { toolById, clampFor } from './registry';

/** The same triangles, measured independently with floats (law of cosines). */
function floats(a, b, c, ki, s) {
  const k = SIM_K[ki][0] / SIM_K[ki][1];
  const cosA = (a * a + b * b - c * c) / (2 * a * b);
  const e = Math.sqrt(a * a + s * s - 2 * a * s * cosA);
  const t1 = [a, b, c].sort((x, y) => x - y);
  const t2 = [k * a, k * s, k * e].sort((x, y) => x - y);
  const q = t2.map((x, i) => x / t1[i]);
  const close = (x, y) => Math.abs(x - y) < 1e-9 * Math.max(1, Math.abs(x));
  return { q, eq: [close(q[0], q[1]), close(q[1], q[2])], k, e };
}

describe('Mon labo — « Les deux triangles » computes exactly what it shows', () => {
  it('writes a fraction as a short decimal, or says it cannot', () => {
    expect(decimalOf(frac(15, 2))).toBe('7,5');
    expect(decimalOf(frac(3, 4))).toBe('0,75');
    expect(decimalOf(frac(18))).toBe('18');
    expect(decimalOf(frac(1, 3))).toBe(null);
    expect(feq(frac(6, 4), frac(3, 2))).toBe(true);
  });

  it('opens ABC on a whole BC inside the triangle inequality, different from AB and AC when it can', () => {
    expect(cStart(12, 5)).toBe(13);
    for (let a = 2; a <= 12; a += 1)
      for (let b = 2; b <= 12; b += 1) {
        const [lo, hi] = cRange(a, b);
        const c = cStart(a, b);
        expect(c).toBeGreaterThanOrEqual(lo);
        expect(c).toBeLessThanOrEqual(hi);
        expect(c).toBeGreaterThan(Math.abs(a - b));
        expect(c).toBeLessThan(a + b);
      }
  });

  it('the = and ≠ between the quotients are the floats’ own, on a grid of triangles', () => {
    let same = 0;
    for (const a of [2, 3, 5, 6, 8, 12])
      for (const b of [2, 4, 5, 9, 12]) {
        const [lo, hi] = cRange(a, b);
        const [slo, shi] = sRange(a, b);
        for (let c = lo; c <= hi; c += 1)
          for (const ki of [0, 3, 5, 8])
            for (let s = slo; s <= shi; s += 1) {
              const S = similarOf(a, b, c, ki, s);
              const F = floats(a, b, c, ki, s);
              expect(S.rankedEq, `${a} ${b} ${c} ${ki} ${s}`).toEqual(F.eq);
              expect(S.same).toBe(F.eq[0] && F.eq[1]);
              // the second triangle keeps the angle of A at its first vertex, always
              expect(S.equalAngles).toContainEqual(['A', 'D']);
              // its lengths: the exact ones are exact, the others written to 0,01
              const e = S.t2.sides.EF;
              if (e.exact) expect(Number(e.text.replace(',', '.'))).toBeCloseTo(F.k * F.e, 9);
              else expect(e.text).toBe(`≈ ${(F.k * F.e).toFixed(2).replace('.', ',')}`);
              if (S.same) same += 1;
            }
      }
    expect(same).toBeGreaterThan(100);
  });

  it('ABC × k covers ABC: every quotient equal, by size AND by the names; its size is k’s', () => {
    for (let ki = 0; ki < SIM_K.length; ki += 1) {
      const S = similarOf(12, 5, 13, ki, 5);
      expect(S.same).toBe(true);
      expect(S.namedEq).toEqual([true, true]);
      const [n, d] = SIM_K[ki];
      expect(S.size).toBe(n < d ? 'smaller' : n > d ? 'bigger' : 'equal');
      expect(S.t2.sides.EF.exact).toBe(true);
      expect(S.equalAngles).toEqual([
        ['A', 'D'],
        ['B', 'E'],
        ['C', 'F'],
      ]);
    }
    // 5, 12, 13 × 1,5: the three sides ranked, written « 7,5 ÷ 5 », never evaluated
    const S = similarOf(12, 5, 13, 5, 5);
    expect(S.ranked.map((r) => `${S.t2.sides[r.t2].text} ÷ ${S.t1.sides[r.t1].text}`)).toEqual([
      '7,5 ÷ 5',
      '18 ÷ 12',
      '19,5 ÷ 13',
    ]);
    expect(S.t1.angles.A.text).toBe('= 90°');
    expect(S.t1.angles.B.text).toBe('≈ 23°');
  });

  it('its names moved round: the same triangle covers ABC, the quotients by the names are not equal', () => {
    for (const names of [1, 2]) {
      const S = similarOf(12, 5, 13, 1, 5, names);
      expect(S.same).toBe(true);
      expect(S.namedEq).not.toEqual([true, true]);
      expect(S.t2.labels).toEqual(names === 1 ? ['E', 'F', 'D'] : ['F', 'D', 'E']);
    }
    // a slide that pairs the sides the other way round: AB with DF — the same shape, unequal by the names
    const S = similarOf(6, 4, 8, 3, 9);
    expect(S.same).toBe(true);
    expect(S.namedEq).toEqual([false, false]);
  });

  it('one equal angle is not the same shape: the slide keeps Â and breaks the quotients', () => {
    const S = similarOf(12, 5, 13, 5, 7);
    expect(S.same).toBe(false);
    expect(S.size).toBe(null);
    expect(S.equalAngles).toEqual([['A', 'D']]);
    expect(S.rankedEq).toEqual([false, false]);
    expect(S.t2.sides.EF.text).toBe('≈ 20,84');
  });
});

describe('Mon labo — « Les deux triangles »: « Essaie »', () => {
  const st = (x) => ({ a: 12, b: 5, c: 13, ki: 5, s: 5, rot: 2, flip: false, names: 0, ...x });
  it('ticks only what was made, after the hand moved', () => {
    expect(observe('similar', st({ ki: 1 }), new Set())).toEqual([]); // never moved
    expect(observe('similar', st({ ki: 1, moved: true }), new Set())).toEqual(['small']);
    expect(observe('similar', st({ moved: true }), new Set())).toEqual([]); // bigger, by the names equal
    expect(observe('similar', st({ s: 7, moved: true }), new Set())).toEqual(['angle']);
    expect(observe('similar', st({ names: 1, moved: true }), new Set())).toEqual(['names']);
    expect(observe('similar', st({ names: 1, rot: 0, moved: true }), new Set())).toEqual([]); // not turned
    expect(observe('similar', st({ ki: 0, names: 2, moved: true }), new Set())).toEqual(['small', 'names']);
    // a report that does not fit the numbers: nothing
    expect(observe('similar', st({ c: 40, moved: true }), new Set())).toEqual([]);
    const seen = new Set();
    expect(observe('similar', st({ ki: 1, moved: true }), seen)).toEqual(['small']);
    expect(observe('similar', st({ ki: 2, moved: true }), seen)).toEqual([]); // already made
  });

  it('names something to make, never a rule nor a word of the lesson’s tablets', () => {
    const tool = toolById('similar');
    const said = [...QUESTS.similar.map((q) => q.text), tool.name, tool.hint].join(' ');
    expect(QUESTS.similar).toHaveLength(3);
    expect(said).not.toMatch(
      /semblable|homologue|proportion|coefficient|agrandissement|réduction|rapport|thalès|papillon|\bfau(?:x|sses?)\b|180/i,
    );
  });

  it('the dice give two different sides inside the range', () => {
    const tool = toolById('similar');
    for (let i = 0; i < 100; i += 1) {
      const p = luckyPair(tool);
      expect(clampFor(tool, p.a, p.b)).toEqual(p);
      expect(p.a).not.toBe(p.b);
    }
  });
});
