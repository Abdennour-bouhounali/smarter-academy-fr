import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { explain, waveSay } from '../../../../../../common/gameworld/divisorIsles/strings';
import { ladder, isRight, PRACTICE_NODES, PRACTICE_MAP } from './practice';
import { KEYS } from './journey';
import { TEXT } from './text';

describe('حلبة التدريب — the practice ladder of « خواص قواسم عدد طبيعي »', () => {
  it('has one node per key and a summary node, each level named and placed on the hub', () => {
    expect(PRACTICE_NODES.map((n) => n.id)).toEqual([...KEYS, 'exam']);
    for (const node of PRACTICE_NODES) {
      expect(TEXT.levels[node.id], node.id).toHaveLength(node.levels.length);
      expect(PRACTICE_MAP.positions[node.id], node.id).toBeTruthy();
    }
    expect(ladder.LEVEL_ORDER).toHaveLength(10);
  });

  it('every wave of every level has exactly ONE right gate, a sentence and a guidance', () => {
    for (const { node, level, id } of ladder.LEVEL_ORDER) {
      for (let seed = 1; seed <= 40; seed += 1) {
        for (const w of ladder.makeRun(rng(seed * 7919 + level), node, level)) {
          expect(
            w.gates.filter((n) => isRight(w, n)),
            `${id} ${JSON.stringify(w)}`,
          ).toHaveLength(1);
          expect(new Set(w.gates).size).toBe(3);
          expect(waveSay(w), id).toBeTruthy();
          const g = explain(
            w,
            w.gates.find((n) => !isRight(w, n)),
          );
          expect(g.wrong && g.right, `${id} ${w.type}`).toBeTruthy();
          expect(`${waveSay(w)} ${g.wrong} ${g.right}`).not.toMatch(/undefined|NaN/);
          expect(w.key === PRACTICE_NODES[node].id || PRACTICE_NODES[node].id === 'exam').toBe(true);
          // mental arithmetic: inside the tables
          expect(w.a ?? w.gates[w.good], id).toBeLessThanOrEqual(100);
          if (w.type === 'remainder') expect(w.b * w.q + w.r).toBe(w.a);
          if (w.type === 'missing') expect(w.b * w.q).toBe(w.a);
        }
      }
    }
  });

  it('the sentences of THIS lesson (a sum, a difference, a common divisor, the remainder) are carried by the wave', () => {
    const LESSON_OWN = ['dividesSum', 'dividesDiff', 'commonDivisor', 'dividesRest'];
    const seen = new Set();
    for (const { node, level, id } of ladder.LEVEL_ORDER) {
      for (let seed = 1; seed <= 60; seed += 1) {
        for (const w of ladder.makeRun(rng(seed * 31337 + level * 7 + node), node, level)) {
          if (!LESSON_OWN.includes(w.type)) continue;
          seen.add(w.type);
          const right = w.gates[w.good];
          const tag = `${id} ${JSON.stringify(w)}`;
          // d divides a and b, and d is the ONE right gate
          expect([w.a % w.d, w.b % w.d, right], tag).toEqual([0, 0, w.d]);
          expect(
            w.gates.filter((n) => isRight(w, n)),
            tag,
          ).toEqual([w.d]);
          expect(Math.max(w.a, w.b, w.a + (w.type === 'dividesSum' ? w.b : 0)), tag).toBeLessThanOrEqual(100);
          if (w.type === 'dividesRest') expect([w.b * w.q + w.r, w.r < w.b, w.r % w.d], tag).toEqual([w.a, true, 0]);
          if (w.type === 'dividesDiff') expect(w.a, tag).toBeGreaterThan(w.b);
          // mental arithmetic: every gate is a divisor to try inside the tables
          expect(Math.max(...w.gates), tag).toBeLessThanOrEqual(10);
          // the sentence: LaTeX for the operation, plain words for the rest
          const said = {
            dividesSum: `عدد يقسم $${w.a} + ${w.b}$`,
            dividesDiff: `عدد يقسم $${w.a} - ${w.b}$`,
            commonDivisor: `قاسم مشترك للعددين ${w.a} و ${w.b}`,
            dividesRest: `عدد يقسم باقي قسمة ${w.a} على ${w.b}`,
          }[w.type];
          expect(waveSay(w)).toBe(said);
          // a guidance line for every wrong gate, and for the right one
          for (const n of w.gates.filter((x) => x !== right)) {
            const g = explain(w, n);
            expect(g.wrong, `${tag} ${n}`).toContain(String(n));
            expect(g.right).toContain(String(w.d));
          }
        }
      }
    }
    expect([...seen].sort()).toEqual([...LESSON_OWN].sort());
  });

  it('« باقٍ يعرفه القاسم »: d divides a and b, and the remainder is the ONLY gate that d divides', () => {
    const node = PRACTICE_NODES.findIndex((n) => n.id === 'baqi-qisma');
    for (let seed = 1; seed <= 60; seed += 1) {
      for (const w of ladder.makeRun(rng(seed * 104729), node, 0).filter((x) => x.type === 'remainder')) {
        const { d } = w;
        expect([w.a % d, w.b % d, w.r % d], JSON.stringify(w)).toEqual([0, 0, 0]);
        expect(w.gates.filter((n) => n % d === 0)).toEqual([w.r]);
      }
    }
  });
});
