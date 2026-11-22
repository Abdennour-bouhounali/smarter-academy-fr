import { describe, it, expect } from 'vitest';
import { BEM_2020 } from './bem2020';

const step = (id) => BEM_2020.steps.find((s) => s.id === id);

describe('BEM 2020 — the trees (mission 2)', () => {
  it('every datum of the copy is a phrase of the paper, and the question too', () => {
    const marks = BEM_2020.paper.filter((p) => p.mark).map((p) => p.mark);
    expect(marks).toEqual(BEM_2020.data.map((d) => d.id));
    expect(BEM_2020.paper.filter((p) => p.goal).map((p) => p.goal)).toEqual(BEM_2020.goals.map((g) => g.id));
  });
  it('the plan orders every hidden step, and each step taken too early has its guidance', () => {
    const plan = step('plan');
    expect([...plan.order].sort()).toEqual(BEM_2020.plan.map((x) => x.id).sort());
    plan.order.slice(1).forEach((id) => expect(BEM_2020.plan.find((x) => x.id === id).needs).not.toBe(''));
  });
  it('the official chain holds: 6 m, 204 m, 34 trees, 30600, 900, 225 %, 400 دج', () => {
    const right = {
      e0: { q: 1, r: 18 },
      e1: { q: 2, r: 6 },
      e2: { q: 3, r: 0 },
      gap: { d: 6 },
      around: { p: 204 },
      count: { n: 34 },
      left: { m: 30600 },
      each: { c: 900 },
      pct: { k: 225 },
      price: { x: 400 },
      answer: { x: 400 },
    };
    Object.entries(right).forEach(([id, v]) => {
      const r = step(id).check(v, {});
      expect(r.ok, id).toBe(true);
      expect(r.line, id).toBeTruthy();
    });
    expect(34 * 400 + 1.25 * 34 * 400 + 1400).toBe(32000);
  });
  it('a wrong answer always gets a guidance, and a spacing is planted whatever it is', () => {
    const wrong = {
      e0: { q: 1, r: 8 },
      e1: { q: 1, r: 24 },
      gap: { d: 5 },
      around: { p: 102 },
      count: { n: 35 },
      left: { m: 33400 },
      each: { c: 90 },
      pct: { k: 125 },
      price: { x: 720 },
      answer: { x: 4 },
    };
    Object.entries(wrong).forEach(([id, v]) => {
      const r = step(id).check(v, {});
      expect(r.ok, id).toBe(false);
      const fact = typeof r.fact === 'function' ? r.fact({ corners: 2 }) : r.fact;
      expect(fact.length, id).toBeGreaterThan(20);
    });
    expect(step('gap').check({ d: 5 }, {}).scene).toEqual({ ring: { d: 5 } });
    expect(step('gap').check({ d: 3 }, {})).toMatchObject({ ok: false, scene: { ring: { d: 3 } } });
  });
  it("the classmate's copy has ONE faulty line, every sound line says why it holds, and the plot counts for him", () => {
    const copy = step('copy');
    expect(copy.kind).toBe('review');
    expect(copy.lines.filter((l) => !l.holds).map((l) => l.id)).toEqual([copy.wrong]);
    expect(copy.lines.find((l) => l.id === copy.wrong).tex).toContain('+ 4 = 38');
    expect(copy.scene).toEqual({ ring: { d: 6, count: true } });
    expect(copy.why).toContain('34');
    expect(copy.lines.find((l) => l.id === 'c5').tex).toContain(String(Math.round(30600 / 38)));
  });
  it('money is « دج », never « DA »', () => expect(JSON.stringify(BEM_2020)).not.toMatch(/DA/));
});
