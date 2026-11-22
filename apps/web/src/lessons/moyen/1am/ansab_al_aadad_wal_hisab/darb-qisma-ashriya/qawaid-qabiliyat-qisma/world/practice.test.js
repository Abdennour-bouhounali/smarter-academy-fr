import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { explain, waveSay } from '../../../../../../common/gameworld/divisorIsles/strings';
import { ladder, isRight, PRACTICE_NODES, PRACTICE_MAP, digitValue } from './practice';
import { KEYS } from './journey';
import { TEXT } from './text';

const digitSum = (n) =>
  String(n)
    .split('')
    .reduce((t, x) => t + Number(x), 0);
/** Every « a = b × q + r » and « a = b × q » written in a line is true. */
function equalitiesHold(line) {
  for (const [, a, b, q, r] of line.matchAll(/\$(\d+) = (\d+) \\times (\d+)(?: \+ (\d+))?\$/g))
    expect(Number(b) * Number(q) + Number(r ?? 0), line).toBe(Number(a));
  for (const [, sum, total] of line.matchAll(/\$((?:\d \+ )+\d) = (\d+)\$/g))
    expect(
      sum.split(' + ').reduce((t, x) => t + Number(x), 0),
      line,
    ).toBe(Number(total));
}
/** What is TRUE of a gate, computed here without the lesson's code: the reading keys are checked by their division. */
const TRUTH = {
  unitsBy: (w, n) => n % w.b === 0,
  notBy: (w, n) => n % w.b !== 0,
  sumBy: (w, n) => digitSum(n) % w.b === 0,
  sum3not9: (w, n) => digitSum(n) % 3 === 0 && digitSum(n) % 9 !== 0,
  last2By: (w, n) => (n % 100) % 4 === 0,
  digitFor: (w, n) => (w.b === 4 ? ((n * 10 + w.post) % 100) % 4 === 0 : digitSum(w.pre * 10 + n) % w.b === 0),
  remainder: (w, n) => n === w.a % w.b,
  divisibleBy: (w, n) => n % w.b === 0,
  multipleOf: (w, n) => n % w.b === 0,
  dividesNum: (w, n) => w.a % n === 0,
};

describe('حلبة التدريب — the practice ladder of « قواعد قابلية القسمة »', () => {
  it('has one node per key and a summary node, each level named and placed on the hub', () => {
    expect(PRACTICE_NODES.map((n) => n.id)).toEqual([...KEYS, 'exam']);
    for (const node of PRACTICE_NODES) {
      expect(TEXT.levels[node.id], node.id).toHaveLength(node.levels.length);
      expect(PRACTICE_MAP.positions[node.id], node.id).toBeTruthy();
    }
    expect(ladder.LEVEL_ORDER).toHaveLength(10);
  });

  it('every wave of every level has exactly ONE right gate — the same as the arithmetic says — a sentence and a guidance', () => {
    const seen = new Set();
    for (const { node, level, id } of ladder.LEVEL_ORDER) {
      for (let seed = 1; seed <= 50; seed += 1) {
        for (const w of ladder.makeRun(rng(seed * 7919 + level * 13 + node), node, level)) {
          seen.add(w.type);
          const tag = `${id} ${JSON.stringify(w)}`;
          expect(
            w.gates.filter((n) => isRight(w, n)),
            tag,
          ).toHaveLength(1);
          expect(
            w.gates.map((n) => TRUTH[w.type](w, n)),
            tag,
          ).toEqual(w.gates.map((n) => isRight(w, n)));
          expect(new Set(w.gates).size).toBe(3);
          expect(waveSay(w), id).toBeTruthy();
          // a guidance for EVERY wrong gate, and for the right one; every equality in them is true
          const g = explain(w, w.gates[w.good]);
          expect(g.right, tag).toBeTruthy();
          equalitiesHold(g.right);
          for (const n of w.gates.filter((x) => !isRight(w, x))) {
            const e = explain(w, n);
            expect(e.wrong, `${tag} ${n}`).toBeTruthy();
            equalitiesHold(e.wrong);
          }
          expect(JSON.stringify(w)).not.toMatch(/undefined|NaN/);
          expect(w.key === PRACTICE_NODES[node].id || PRACTICE_NODES[node].id === 'exam').toBe(true);
          // the reading keys read numbers of three or four digits; the remainder key stays inside the tables
          if (w.key === 'baqi-sifr') expect(Math.max(w.a ?? 0, ...w.gates), tag).toBeLessThanOrEqual(100);
          else if (w.type === 'digitFor')
            expect(
              w.gates.every((n) => n >= 0 && n <= 9),
              tag,
            ).toBe(true);
          else
            expect(
              w.gates.every((n) => n >= 100 && n <= 9999),
              tag,
            ).toBe(true);
          if (w.type === 'remainder') expect(w.b * w.q + w.r).toBe(w.a);
        }
      }
    }
    expect([...seen].sort()).toEqual(Object.keys(TRUTH).sort());
  });

  it('the wrong gates are the traps the rule is there for', () => {
    for (const { node, level, id } of ladder.LEVEL_ORDER) {
      for (let seed = 1; seed <= 40; seed += 1) {
        for (const w of ladder.makeRun(rng(seed * 104729 + node * 31 + level), node, level)) {
          const wrong = w.gates.filter((n) => !isRight(w, n));
          const tag = `${id} ${JSON.stringify(w)}`;
          if (w.type === 'sumBy' && w.b === 9)
            expect(
              wrong.some((n) => n % 3 === 0),
              tag,
            ).toBe(true);
          if (w.type === 'sumBy' && w.b === 3)
            expect(
              wrong.every((n) => [3, 6, 9].includes(n % 10)),
              tag,
            ).toBe(true);
          if (w.type === 'last2By')
            expect(
              wrong.every((n) => n % 2 === 0),
              tag,
            ).toBe(true);
          if (w.type === 'unitsBy' && w.b === 5)
            expect(
              wrong.some((n) => n % 2 === 0),
              tag,
            ).toBe(true);
          if (w.type === 'digitFor') expect(digitValue(w, w.gates[w.good]) % w.b).toBe(0);
        }
      }
    }
  });

  it('the sentences of THIS lesson are carried by the wave, with its LaTeX', () => {
    const w = ladder.waveOf(rng(5), 'digitFor', { b: 4, key: 'raqmayn-akhirayn' });
    expect(waveSay(w)).toBe(`رقم مكان □ ليقبل $${w.pre}\\square ${w.post}$ القسمة على 4`);
    const s = ladder.waveOf(rng(7), 'sum3not9', { digits: 3, key: 'majmu-arqam' });
    expect(waveSay(s)).toBe('عدد يقبل القسمة على 3 ولا يقبل القسمة على 9');
    const both = ladder.waveOf(rng(9), 'unitsBy', { b: 10, digits: 4, key: 'raqm-alahad' });
    expect(waveSay(both)).toBe('عدد يقبل القسمة على 2 وعلى 5');
    expect(both.gates[both.good] % 10).toBe(0);
  });
});
