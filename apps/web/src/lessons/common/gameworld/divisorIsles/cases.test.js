import { describe, it, expect } from 'vitest';
import { rng } from '../kit/random';
import { MISSIONS, WORLD_OF, makeMission, makeOrder, judge, answerOf, answerParts, count, facts } from './cases';

describe('La coopérative du verger — the real-world cases', () => {
  it('agrees French counted nouns: the digit, a no-break space, the singular for 0 and 1', () => {
    const F = ['caisse', 'caisses'];
    expect([0, 1, 2, 5, 11, 120].map((n) => count(F, n))).toEqual([
      '0\u00a0caisse',
      '1\u00a0caisse',
      '2\u00a0caisses',
      '5\u00a0caisses',
      '11\u00a0caisses',
      '120\u00a0caisses',
    ]);
  });

  it('speaks French and counts in euros: no Arabic letter, no dinar, « 4\u202f500\u00a0€ »', () => {
    const arabic = /[\u0600-\u06FF]/;
    for (const mission of Object.keys(MISSIONS))
      for (let seed = 1; seed <= 30; seed += 1)
        for (const o of makeMission(rng(seed * 13 + 2), mission)) {
          expect(o.brief).not.toMatch(arabic);
          expect(`${o.client} ${o.good.name}`).not.toMatch(arabic);
          o.steps.forEach((step, i) => {
            const words = [
              step.prompt,
              ...(step.tokens ?? []).map((t) => (typeof t === 'string' ? t : t.label)),
              ...(step.options ?? []).map((x) => x.sub),
              ...facts(o, i),
              judge(o, i, answerOf(o, i)).text,
            ].join(' ');
            expect(words).not.toMatch(arabic);
            expect(words).not.toMatch(/DA|DZD/);
          });
        }
    const trip = makeOrder(rng(9), 'trip', 0);
    const price = String(trip.price).replace(/(\d)(\d{3})$/, '$1\u202f$2');
    expect(trip.brief).toContain(`${price}\u00a0€`);
    expect(trip.steps[2].tokens).toContain('€');
  });

  it('every order of every mission is solvable: the right answer of each step is accepted, with text', () => {
    for (const mission of Object.keys(MISSIONS))
      for (let seed = 1; seed <= 80; seed += 1) {
        const orders = makeMission(rng(seed * 131 + mission.length), mission);
        expect(orders).toHaveLength(MISSIONS[mission].length);
        for (const o of orders) {
          expect(o.brief).not.toMatch(/\$C|undefined|NaN/);
          o.steps.forEach((step, i) => {
            const res = judge(o, i, answerOf(o, i));
            expect(res.ok, `${mission}/${o.kind}.${step.id} n=${o.n}`).toBe(true);
            expect(res.text.length).toBeGreaterThan(5);
            expect(res.text).not.toMatch(/undefined|NaN/);
            for (const s of res.sims) {
              expect(s.n % 1).toBe(0);
              expect(Math.ceil(s.n / s.b)).toBeLessThanOrEqual(40);
            }
          });
        }
      }
  });

  it('a choice step has exactly one right option (two for « 1 and the number itself »), and every wrong one is explained', () => {
    for (const mission of Object.keys(MISSIONS))
      for (let seed = 1; seed <= 60; seed += 1)
        for (const o of makeMission(rng(seed * 17 + 5), mission)) {
          o.steps.forEach((step, i) => {
            if (step.type !== 'choose') return;
            const values = step.options.map((x) => x.v);
            expect(new Set(values).size).toBe(values.length);
            if (step.pick === 2) {
              const pairs = values.flatMap((x, a) => values.slice(a + 1).map((y) => [x, y]));
              expect(pairs.filter((p) => judge(o, i, p).ok)).toEqual([[1, o.n]]);
              for (const p of pairs) if (!judge(o, i, p).ok) expect(judge(o, i, p).text).toContain('=');
            } else {
              expect(values.filter((v) => judge(o, i, v).ok)).toHaveLength(1);
              for (const v of values) if (!judge(o, i, v).ok) expect(judge(o, i, v).text.length).toBeGreaterThan(10);
            }
          });
        }
  });

  it('explains a wrong number by what it PRODUCES, without giving the answer', () => {
    const [o] = makeMission(rng(4), 'count');
    const wrong = judge(o, 0, { x: o.b + 1 });
    expect(wrong.ok).toBe(false);
    expect(wrong.text).not.toContain(`caisses de ${o.b} `);
    const trip = makeOrder(rng(9), 'trip', 0);
    const short = judge(trip, 0, { x: trip.q }); // the classic mistake: forgetting the truck of the remainder
    expect(short.ok).toBe(false);
    expect(short.text).toContain('sur le quai');
    expect(judge(trip, 1, { x: trip.r }).ok).toBe(false); // the remainder is not the number of empty places
    const cost = makeOrder(rng(3), 'cost', 0);
    expect(judge(cost, 0, { q: cost.q1 - 1, r: cost.r1 + cost.b1 }).text).toContain('plus petit que');
    expect(judge(cost, 0, { q: cost.q1 + 5, r: 0 }).ok).toBe(false);
  });

  it('keeps on the screen of every step ALL the data it needs: the story, and the results already found', () => {
    // for each step: the numbers the student must have in front of him to compute the answer
    const NEEDS = {
      'fit.crate': (o) => [o.n],
      'count.capacity': (o) => [o.n, o.q],
      'orders.order': (o) => [o.b],
      'special.two': (o) => [o.n],
      'cost.first': (o) => [o.n, o.b1],
      'cost.second': (o) => [o.n, o.b2],
      'cost.invoice': (o) => [o.q2, o.price],
      'profit.small': (o) => [o.n, o.b1],
      'profit.big': (o) => [o.n, o.b2],
      'profit.best': (o) => [o.q1, o.p1, o.q2, o.p2],
      'profit.income': (o) => [o.best, o.best === o.b1 ? o.q1 : o.q2, o.best === o.b1 ? o.p1 : o.p2],
      'trip.trucks': (o) => [o.n, o.b],
      'trip.empty': (o) => [o.b, o.r],
      'trip.rent': (o) => [o.q + 1, o.price],
      'share.each': (o) => [o.n, o.b],
      'share.guests': (o) => [o.n],
      'tiling.tile': (o) => [o.L],
      'tiling.all': (o) => [o.rows, o.q],
      'tiling.boxes': (o) => [o.total, o.box],
    };
    // a French number groups its thousands with a narrow no-break space (« 4\u202f500 »): read it as one number
    const numbers = (text) => new Set((text.replace(/(\d)\u202f(?=\d{3})/g, '$1').match(/\d+/g) ?? []).map(Number));
    for (const mission of Object.keys(MISSIONS))
      for (let seed = 1; seed <= 50; seed += 1)
        for (const o of makeMission(rng(seed * 29 + 1), mission)) {
          o.steps.forEach((step, i) => {
            const need = NEEDS[`${o.kind}.${step.id}`];
            expect(need, `${o.kind}.${step.id}`).toBeTruthy();
            const shown = numbers(
              `${facts(o, i).join(' ')} ${step.prompt} ${(step.tokens ?? []).filter((t) => typeof t === 'string').join(' ')} ${(step.options ?? []).map((x) => `${x.label} ${x.sub}`).join(' ')}`,
            );
            for (const n of need(o))
              expect(shown.has(n), `${o.kind}.${step.id} needs ${n}; shown: ${[...shown].join(', ')}`).toBe(true);
            for (const line of facts(o, i)) expect(line).not.toMatch(/undefined|NaN/);
          });
          // a result is added only once it is found: the facts of the first step never contain a later answer
          if (o.kind === 'tiling') {
            expect(numbers(facts(o, 0).join(' ')).has(o.total)).toBe(false);
            expect(facts(o, 2).join(' ')).toContain(String(o.total));
          }
          if (o.kind === 'cost') expect(facts(o, 0).join(' ')).not.toContain('ne conviennent pas');
        }
  });

  it('can show an answer again exactly as the student gave it', () => {
    const ti = makeOrder(rng(5), 'tiling', 0);
    const wrong = ti.steps[0].options.find((x) => x.v !== ti.s).v;
    expect(
      answerParts(ti.steps[0], wrong)
        .filter((p) => p.mine)
        .map((p) => p.text),
    ).toEqual([String(wrong)]);
    expect(
      answerParts(ti.steps[1], { x: 99 })
        .map((p) => p.text)
        .join(' '),
    ).toBe(`${ti.rows} × ${ti.q} = 99`);
    const sp = makeOrder(rng(5), 'special', 0);
    expect(
      answerParts(sp.steps[0], [1, sp.n])
        .filter((p) => p.mine)
        .map((p) => p.text),
    ).toEqual(['1', String(sp.n)]);
    for (const mission of Object.keys(MISSIONS))
      for (const o of makeMission(rng(11), mission))
        o.steps.forEach((st, i) => {
          const parts = answerParts(st, answerOf(o, i));
          expect(parts.some((p) => p.mine && p.text !== '')).toBe(true);
        });
  });

  it("plays three WORLDS: the depot, the friends' table and the tiler's site — each case carrying its value", () => {
    expect(new Set(Object.values(WORLD_OF))).toEqual(new Set(['depot', 'share', 'tiling']));
    for (const m of Object.keys(MISSIONS)) expect(WORLD_OF[m]).toBeTruthy();
    for (let seed = 1; seed <= 60; seed += 1) {
      const sh = makeOrder(rng(seed), 'share', seed % 2);
      expect(sh.r).toBeGreaterThan(0);
      expect(sh.n % sh.g).toBe(0);
      expect(sh.g).not.toBe(sh.b); // unfair at first, fair with the neighbours
      expect(sh.brief).toContain('équitablement');
      expect(sh.steps[1].options.filter((x) => sh.n % x.v === 0).map((x) => x.v)).toEqual([sh.g]);
      const ti = makeOrder(rng(seed), 'tiling', seed % 2);
      expect(ti.L % ti.s).toBe(0);
      expect(ti.total).toBe(ti.q * ti.rows);
      expect(ti.total % ti.box).not.toBe(0);
      expect(ti.boxes * ti.box - ti.total).toBe(ti.spare);
      expect(ti.spare).toBeGreaterThan(0);
      expect(ti.spare).toBeLessThan(ti.box);
      expect(ti.brief).toContain('travail soigné');
      expect(ti.steps.map((x) => x.id)).toEqual(['tile', 'all', 'boxes']);
      expect(sh.steps.map((x) => x.id)).toEqual(['each', 'guests']);
      expect(judge(ti, 2, { x: ti.boxes - 1 }).text).toContain('il lui manque'); // one box short
      expect(judge(ti, 2, { x: ti.boxes + 1 }).text).toContain('ne gaspille pas'); // one box too many: waste
      expect(judge(ti, 2, { x: ti.boxes }).text).toContain('pour les réparations');
    }
  });

  it('adds a calculation shortcut to a RIGHT step when one exists, and never to a wrong one', () => {
    let tips = 0;
    for (const mission of Object.keys(MISSIONS))
      for (let seed = 1; seed <= 40; seed += 1)
        for (const o of makeMission(rng(seed * 7 + 3), mission)) {
          o.steps.forEach((step, i) => {
            const right = judge(o, i, answerOf(o, i));
            if (right.tip) {
              tips += 1;
              expect(right.tip).not.toMatch(/undefined|NaN/);
            }
            if (step.type === 'choose' && step.pick !== 2)
              for (const x of step.options) {
                const res = judge(o, i, x.v);
                if (!res.ok) expect(res.tip).toBeUndefined();
              }
          });
        }
    expect(tips).toBeGreaterThan(200);
  });

  it('the remainder of a trip is never 0 and the two trays of a profit case never earn the same', () => {
    for (let seed = 1; seed <= 60; seed += 1) {
      {
        const o = makeOrder(rng(seed), 'trip', 0);
        expect(o.r).toBeGreaterThan(0);
        expect(o.n).toBe(o.b * o.q + o.r);
      }
      {
        const o = makeOrder(rng(seed), 'profit', 0);
        expect(o.q1 * o.p1).not.toBe(o.q2 * o.p2);
        expect(o.n % o.b1).toBe(0);
        expect(o.n % o.b2).toBe(0);
      }
      {
        const o = makeOrder(rng(seed), 'cost', 0);
        expect(o.n % o.b1).not.toBe(0);
        expect(o.n % o.b2).toBe(0);
      }
    }
  });
});
