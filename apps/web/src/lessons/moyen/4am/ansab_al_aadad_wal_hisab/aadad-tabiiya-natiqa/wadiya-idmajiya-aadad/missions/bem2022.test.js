import { describe, it, expect } from 'vitest';
import { BEM_2022 } from './bem2022';

const step = (id) => BEM_2022.steps.find((s) => s.id === id);
const said = (r, built = null) => (typeof r.fact === 'function' ? r.fact(built) : r.fact);

describe('BEM 2022 — the identical lots (mission 1), as data', () => {
  it('the paper holds what he underlines and the two questions; the two conditions come later', () => {
    expect(BEM_2022.paper.filter((p) => p.mark).map((p) => p.mark)).toEqual(['a', 'b', 'all', 'same']);
    expect(BEM_2022.data.filter((d) => d.late).map((d) => d.id)).toEqual(['all', 'same']);
    expect(BEM_2022.paper.filter((p) => p.goal).map((p) => p.goal)).toEqual(BEM_2022.goals.map((g) => g.id));
    expect(BEM_2022.quay(['a'])).toEqual([1188, null]);
    expect(JSON.stringify(BEM_2022)).not.toMatch(/DA/);
  });
  it('a free try is carried out whatever it is: crates left owe « كلّ الصناديق », identical lots owe « متماثلة »', () => {
    const t = step('tries');
    const seven = t.try(7, { vals: {}, data: [] });
    expect(seven).toMatchObject({ ok: false, owe: 'all' });
    expect(seven.scene.lots).toHaveLength(7);
    expect(seven.scene.left).toEqual({ a: 1188 % 7, b: 528 % 7 });
    expect(said(seven)).toContain('لا يقسم');
    const twelve = t.try(12, { vals: {}, data: [] });
    expect(twelve).toMatchObject({ ok: true, owe: 'same' });
    expect(twelve.lines.map((l) => l.tex)).toEqual(['1188 = 12 \\times 99 + 0', '528 = 12 \\times 44 + 0']);
    // the guidance grows with the failures, and never gives the answer
    expect(said(t.try(8, { vals: { tries: { worked: [], fails: [7] } }, data: [] }))).toContain('جرّب 6 أو 11');
    expect(said(t.try(100, { vals: { tries: { worked: [], fails: [7, 8, 5] } }, data: [] }))).not.toContain('132');
    expect(t.ready({ vals: { tries: { worked: [12], fails: [] } }, data: ['a', 'b', 'all', 'same'] })).toBe(true);
    expect(t.ready({ vals: { tries: { worked: [12], fails: [] } }, data: ['a', 'b', 'same'] })).toBe(false);
    expect(t.ready({ vals: { tries: { worked: [1], fails: [] } }, data: ['a', 'b', 'all', 'same'] })).toBe(false);
  });
  it('the chain holds: the two divisions laid in the depot, PGCD 132, 9 and 4 a lot, the sentence', () => {
    const e0 = step('e0').check({ q: 2, r: 132 }, {});
    expect(e0).toMatchObject({ ok: true, scene: { pairing: { big: 1188, small: 528, q: 2, r: 132 } } });
    expect(step('e1').check({ q: 4, r: 0 }, {})).toMatchObject({
      ok: true,
      scene: { pairing: { big: 528, small: 132, q: 4, r: 0 } },
    });
    expect(step('pgcd').check({ g: 132 }, {}).ok).toBe(true);
    const mine = { vals: { tries: { worked: [12], fails: [] } } };
    expect(step('rest').check({ n: 12 }, mine)).toMatchObject({ ok: true, line: { tex: '132 = 12 \\times 11 + 0' } });
    expect(step('attack').check({ n: 264 }, {}).ok).toBe(true);
    const content = step('content').check({ pa: 9, pb: 4 }, {});
    expect(content).toMatchObject({ ok: true, sceneOpts: { ship: true, cheer: true } });
    expect(content.scene.lots).toHaveLength(132);
    expect(step('answer').check({ sn: 132, sa: 1188, sb: 528 }, {}, 'pgcd').ok).toBe(true);
    expect(132 * 9).toBe(1188);
    expect(132 * 4).toBe(528);
  });
  it('a wrong answer always gets a guidance; a wrong content is built in the depot', () => {
    const wrong = [
      ['e0', { q: 2, r: 100 }, {}],
      ['e0', { q: 1, r: 660 }, {}],
      ['pgcd', { g: 4 }, {}],
      ['pgcd', { g: 7 }, {}],
      ['rest', { n: 5 }, { vals: { tries: { worked: [12], fails: [] } } }],
      ['attack', { n: 100 }, {}],
      ['content', { pa: 10, pb: 4 }, {}],
      ['content', { pa: 8, pb: 4 }, {}],
      ['answer', { sn: 132, sa: 1188, sb: 528 }, {}, 'rest'],
      ['answer', { sn: 132, sa: 1188, sb: 528 }, {}, 'common'],
      ['answer', { sn: 12, sa: 1188, sb: 528 }, {}, 'pgcd'],
    ];
    for (const [id, v, ctx, name] of wrong) {
      const r = step(id).check(v, ctx, name);
      expect(r.ok, `${id} ${JSON.stringify(v)}`).toBe(false);
      expect(said(r).length, id).toBeGreaterThan(15);
    }
    expect(step('content').check({ pa: 10, pb: 4 }, {}).scene.empty).toBeGreaterThan(0);
    expect(step('content').check({ pa: 8, pb: 4 }, {}).scene.left).toEqual({ a: 1188 - 132 * 8, b: 0 });
  });
  it('« أربط »: each question names what it needs, and what cannot be done without each', () => {
    for (const id of ['tie-most', 'tie-content']) {
      const s = step(id);
      expect(Object.keys(s.without).sort()).toEqual([...s.must].sort());
    }
    expect(step('tie-content').must).toContain('ans');
    expect(step('tie-content').ans({})).toContain('132');
  });
});
