import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { explain, waveSay } from '../../../../../../common/gameworld/divisorIsles/strings';
import { ladder, isRight, PRACTICE_NODES, PRACTICE_MAP, divisorsOf, lastTry } from './practice';
import { KEYS } from './journey';
import { TEXT } from './text';

describe('حلبة التدريب — the practice ladder of « قواسم عدد طبيعي »', () => {
  it('has one node per key and a summary node, each level named', () => {
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
          expect(isRight(w, w.gates[w.good])).toBe(true);
          expect(new Set(w.gates).size).toBe(3);
          expect(waveSay(w), id).toBeTruthy();
          const g = explain(
            w,
            w.gates.find((n) => !isRight(w, n)),
          );
          expect(g.wrong && g.right, `${id} ${w.type}`).toBeTruthy();
          expect(`${g.wrong} ${g.right}`).not.toMatch(/undefined|NaN/);
          expect(w.key === PRACTICE_NODES[node].id || PRACTICE_NODES[node].id === 'exam').toBe(true);
          // mental arithmetic: inside the tables — except the divisibility rules, read on a number of three digits
          if (w.type !== 'divisibleBy') expect(w.a, id).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it('counts divisors and finds where the search stops', () => {
    expect(divisorsOf(60)).toEqual([1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60]);
    expect([24, 25, 26, 96, 105].map(lastTry)).toEqual([4, 5, 5, 9, 10]);
  });
});
