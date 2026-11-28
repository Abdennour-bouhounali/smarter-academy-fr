import { describe, expect, it } from 'vitest';
import { RIVER, approx, riverWidth } from './logic';
import { PLAN_BOX, PLAN_ER, erAt, landing, planPoints, stringFact } from './riverPlan';

describe('the geometer’s plan of the river', () => {
  it('the string reaches the post F only when R is in line with S and F', () => {
    const target = approx(RIVER.ER);
    expect(landing(RIVER, target)).toBeCloseTo(approx(RIVER.AS), 9);
    expect(stringFact(RIVER, target)).toBe('on');
    expect(stringFact(RIVER, target - 1)).toBe('left');
    expect(stringFact(RIVER, target + 1)).toBe('right');
    expect(target).toBeGreaterThan(PLAN_ER.min);
    expect(target).toBeLessThan(PLAN_ER.max);
    expect(PLAN_ER.start).not.toBe(target);
  });

  it('on the drawing R, S and the string’s end are in line, and one metre of R is SEEN at the post', () => {
    for (let er = PLAN_ER.min; er <= PLAN_ER.max; er += 1) {
      const { R, S, T } = planPoints(RIVER, er);
      const cross = (S.x - R.x) * (T.y - R.y) - (S.y - R.y) * (T.x - R.x);
      expect(Math.abs(cross)).toBeLessThan(1e-6);
    }
    const target = approx(RIVER.ER);
    const { T, F } = planPoints(RIVER, target);
    expect(T.x).toBeCloseTo(F.x, 6);
    // a miss of one metre lands at least 7 px from the post
    expect(Math.abs(planPoints(RIVER, target - 1).T.x - F.x)).toBeGreaterThan(7);
    expect(Math.abs(planPoints(RIVER, target + 1).T.x - F.x)).toBeGreaterThan(7);
  });

  it('the drawing stays inside its box, and the two triangles keep the true ratios', () => {
    const p = planPoints(RIVER, approx(RIVER.ER));
    for (const k of ['A', 'F', 'S', 'E', 'R', 'end'])
      expect(p[k].x > 0 && p[k].x < PLAN_BOX.w && p[k].y > 0 && p[k].y < PLAN_BOX.h, k).toBe(true);
    expect((p.E.x - p.S.x) / (p.S.x - p.A.x)).toBeCloseTo(approx(RIVER.SE) / approx(RIVER.AS), 9);
    expect((p.R.y - p.E.y) / (p.A.y - p.F.y)).toBeCloseTo(approx(RIVER.ER) / approx(riverWidth(RIVER)), 9);
  });

  it('a pointer on the drawing gives whole metres inside the allowed stretch', () => {
    for (let er = PLAN_ER.min; er <= PLAN_ER.max; er += 1) expect(erAt(RIVER, planPoints(RIVER, er).R.y)).toBe(er);
    expect(erAt(RIVER, 0)).toBe(PLAN_ER.min);
    expect(erAt(RIVER, 9999)).toBe(PLAN_ER.max);
  });
});
