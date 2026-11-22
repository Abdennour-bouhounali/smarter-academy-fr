import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { explain, waveSay } from '../../../../../../common/gameworld/divisorIsles/strings';
import { ladder, isRight, PRACTICE_NODES, PRACTICE_MAP } from './practice';
import { KEYS } from './journey';
import { TEXT } from './text';
import { count, noun } from './counted';

const CAN = noun('علبة', 'علب', 'f');

const LESSON_OWN = ['quotient', 'byDefault', 'byExcess', 'full', 'needed', 'complete'];
/** Every wave of every level, for many seeds. */
function* allWaves(seeds = 40) {
  for (const { node, level, id } of ladder.LEVEL_ORDER)
    for (let seed = 1; seed <= seeds; seed += 1)
      for (const w of ladder.makeRun(rng(seed * 7919 + level * 31 + node), node, level)) yield { w, node, level, id };
}

describe('حلبة التدريب — the practice ladder of « القسمة الإقليدية وحصر حاصل القسمة »', () => {
  it('has one node per key and a summary node, each level named and placed on the hub', () => {
    expect(PRACTICE_NODES.map((n) => n.id)).toEqual([...KEYS, 'exam']);
    for (const node of PRACTICE_NODES) {
      expect(TEXT.levels[node.id], node.id).toHaveLength(node.levels.length);
      expect(PRACTICE_MAP.positions[node.id], node.id).toBeTruthy();
    }
    expect(ladder.LEVEL_ORDER).toHaveLength(8);
    for (const [from, to] of PRACTICE_MAP.edges) {
      expect(PRACTICE_MAP.positions[from], from).toBeTruthy();
      expect(PRACTICE_MAP.positions[to], to).toBeTruthy();
    }
  });

  it('every wave of every level has exactly ONE right gate, a sentence and a guidance, in mental-arithmetic sizes', () => {
    for (const { w, node, level, id } of allWaves()) {
      const tag = `${id} ${JSON.stringify(w)}`;
      expect(
        w.gates.filter((n) => isRight(w, n)),
        tag,
      ).toHaveLength(1);
      expect(new Set(w.gates).size, tag).toBe(3);
      expect(waveSay(w), tag).toBeTruthy();
      const g = explain(
        w,
        w.gates.find((n) => !isRight(w, n)),
      );
      expect(g.wrong && g.right, tag).toBeTruthy();
      expect(`${waveSay(w)} ${g.wrong} ${g.right}`).not.toMatch(/undefined|NaN/);
      expect(w.key === PRACTICE_NODES[node].id || PRACTICE_NODES[node].id === 'exam', tag).toBe(true);
      // the first level of a key node stays inside the tables; a second level estimates with a divisor of two digits —
      // or finds ONE digit with a divisor of three digits (`long`: fewer than ten times the divisor)
      const max = PRACTICE_NODES[node].id !== 'exam' && level === 0 ? 100 : w.long ? 4000 : 600;
      expect(w.a ?? w.gates[w.good], tag).toBeLessThanOrEqual(max);
      if (w.long) {
        expect(level, tag).toBe(1);
        expect(String(w.b), tag).toHaveLength(3);
        expect(w.a, tag).toBeLessThan(10 * w.b);
        expect(
          [...w.gates].sort((x, y) => x - y),
          tag,
        ).toEqual([w.q - 1, w.q, w.q + 1]); // neighbours: one product decides
      }
      if (w.r != null && w.q != null) expect(w.b * w.q + w.r, tag).toBe(w.a);
      if (w.r != null) expect(w.r, tag).toBeLessThan(w.b);
      if (w.type === 'missing') expect(w.b * w.q, tag).toBe(w.a);
    }
  });

  it('the sentences of THIS lesson are carried by the wave, and the right gate is computed from a and b', () => {
    const seen = new Set();
    for (const { w, id } of allWaves(60)) {
      if (!LESSON_OWN.includes(w.type)) continue;
      seen.add(w.type);
      const tag = `${id} ${JSON.stringify(w)}`;
      const right = w.gates[w.good];
      const q = Math.floor(w.a / w.b);
      const r = w.a % w.b;
      expect([q, r], tag).toEqual([w.q, w.r]);
      const expected = {
        quotient: q,
        byDefault: q,
        full: q,
        byExcess: q + 1,
        needed: q + 1,
        complete: w.b - r,
      }[w.type];
      expect(right, tag).toBe(expected);
      // the end of the bracket is asked only when the quotient is NOT a natural number
      if (['byDefault', 'byExcess', 'full', 'needed'].includes(w.type)) expect(r, tag).toBeGreaterThan(0);
      if (w.type === 'complete') {
        expect((w.a + right) % w.b, tag).toBe(0);
        for (const n of w.gates.filter((x) => x !== right)) expect((w.a + n) % w.b, tag).not.toBe(0);
      }
      expect(waveSay(w)).toBe(w.say);
      // a guidance line for every wrong gate, that names it
      for (const n of w.gates.filter((x) => x !== right)) {
        const g = explain(w, n);
        expect(g.wrong, `${tag} ${n}`).toContain(String(n));
        expect(g.right, tag).toBeTruthy();
      }
    }
    expect([...seen].sort()).toEqual([...LESSON_OWN].sort());
  });

  it('the bracket sentences name what they ask: by default, by excess, the boxes full, the boxes needed', () => {
    const says = { byDefault: 'حاصل القسمة بالنقصان', byExcess: 'حاصل القسمة بالزيادة' };
    const boxes = { full: 'عدد الصناديق المملوءة', needed: 'عدد الصناديق اللازمة' };
    for (const { w } of allWaves(20)) {
      if (says[w.type]) expect(w.say).toBe(`${says[w.type]}: $${w.a} \\div ${w.b}$`);
      if (boxes[w.type]) expect(w.say).toBe(`${boxes[w.type]}: ${count(w.a, CAN)}، ${w.b} في كلّ صندوق`);
    }
  });

  it('the second race of the first key asks what the lesson ADDS: one digit with a divisor of three digits', () => {
    const at = ladder.LEVEL_ORDER.find((x) => x.id === `${KEYS[0]}:2`);
    let long = 0;
    let all = 0;
    const planks = new Set();
    for (let seed = 1; seed <= 60; seed += 1)
      for (const w of ladder.makeRun(rng(seed * 7919 + 3), at.node, at.level)) {
        all += 1;
        if (!w.long) continue;
        long += 1;
        planks.add(w.b);
        expect(w.say).toBe(`حاصل قسمة ${w.a} على ${w.b}`);
        expect(isRight(w, w.gates[w.good])).toBe(true);
        expect(w.b * w.q <= w.a && w.a < w.b * (w.q + 1)).toBe(true);
        expect(w.why.right).toContain(`$${w.b} \\times ${w.q + 1} = ${w.b * (w.q + 1)}$ يتجاوزه`);
      }
    expect(long / all).toBeGreaterThan(0.25);
    expect(planks.size).toBeGreaterThan(30); // never the same few planks
    // the first race stays inside the tables: no long plank there
    const first = ladder.LEVEL_ORDER.find((x) => x.id === `${KEYS[0]}:1`);
    for (let seed = 1; seed <= 20; seed += 1)
      for (const w of ladder.makeRun(rng(seed * 31), first.node, first.level)) expect(w.long).toBeUndefined();
  });
});
