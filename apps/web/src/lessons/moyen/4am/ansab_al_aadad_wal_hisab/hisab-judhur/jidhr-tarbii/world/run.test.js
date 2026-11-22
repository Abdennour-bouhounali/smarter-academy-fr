import { describe, expect, it } from 'vitest';
import { COURSE, RUN, others, round } from './run';

describe('« سباق المربّعات » — the course of gates', () => {
  it('fourteen gates: a number by itself from 1 to 10, then three times from 2 to 5', () => {
    expect(RUN.total).toBe(14);
    expect(COURSE.slice(0, 10).map(([a, t]) => a ** t)).toEqual([1, 4, 9, 16, 25, 36, 49, 64, 81, 100]);
    expect(COURSE.slice(10).map(([a, t]) => a ** t)).toEqual([8, 27, 64, 125]);
  });
  it('every gate: three different numbers, exactly one is the product, each with its fact', () => {
    for (let n = 0; n < COURSE.length; n += 1)
      for (const seed of [0, 0.3, 0.6, 0.99]) {
        const [a, times] = COURSE[n];
        const r = round(1, () => seed, n);
        const values = r.options.map((o) => Number(o.t));
        expect(new Set(values).size, `gate ${n}`).toBe(3);
        expect(values[r.right]).toBe(a ** times);
        expect(values.filter((v) => v === a ** times)).toHaveLength(1);
        expect(r.why).toHaveLength(3);
        for (const w of r.why) expect(w).toContain(`= ${a ** times}`);
      }
  });
  it('the other numbers are slips a student makes, never the product itself', () => {
    expect(others(2, 2).map((o) => o.v)).toEqual([6, 9]); // 2 × 2 = 2 + 2 = 4: the double is not offered
    expect(others(5, 3).map((o) => o.v)).toEqual([15, 25]);
  });
  it('no sentence of the run says « wrong »', () => {
    expect(JSON.stringify(RUN.text)).not.toMatch(/خطأ|خاطئ|غلط/);
  });
});
