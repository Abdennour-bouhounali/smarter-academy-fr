// « Brevet blanc » of decomposer-en-facteurs-premiers: the REAL bank (content/practice/3e/decomposer-en-facteurs-premiers),
// served as it is — every level draws real sheets, every step markable to full points by its own key (the decompositions
// typed as the practice space's `FactorizationInput` writes them included), money in euros the French way.
import { describe, it, expect, beforeAll } from 'vitest';
import { describeSitting } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { keysOfPoints } from '../../../../../../common/gameworld/kit/bankSitting';
import { allQuestions } from '../../../../../../common/gameworld/kit/sitting';
import { evidence } from './evidence';
import { KEYS } from './journey';
import { LEVELS, sittings } from './sitting';

const ID = 'decomposer-en-facteurs-premiers';
/** What the sitting reads of the lesson (`world/index.js › lesson`, written by wave 2): its keys and its evidence. */
const lesson = { keys: KEYS, evidence };

describeSitting({ id: ID, lesson, sittings, levels: LEVELS });

describe('decomposer-en-facteurs-premiers — its own sitting', () => {
  beforeAll(() => sittings.prepare());

  it('every level of the bank is sat, the decompositions with it (level 4 holds one on every sheet)', () => {
    const types = new Set();
    for (const L of LEVELS) {
      expect(sittings.sheetIds(L.n).length, `level ${L.n}`).toBe(10);
      for (let seed = 1; seed <= 10; seed += 1)
        for (const q of allQuestions(sittings.makeSubject(rng(seed), L.n, [], keysOfPoints(ID, lesson))))
          types.add(q.answerType);
    }
    expect(types.has('factorization')).toBe(true);
  });

  it('a decomposition is marked as he types it, exponents raised; the bank’s own key earns the points', () => {
    const keyOf = keysOfPoints(ID, lesson);
    let seen = 0;
    for (let seed = 1; seed <= 20; seed += 1) {
      const s = sittings.makeSubject(rng(seed), 4, [], keyOf);
      for (const q of allQuestions(s).filter((x) => x.answerType === 'factorization')) {
        const latex = String(q.bank.expectedAnswer)
          .replace(/\^(\d+)/g, '^{$1}')
          .replace(/\*/g, '\\times ');
        const full = { [q.id]: { value: latex } };
        expect(sittings.totalMark({ ...s, exercises: s.exercises }, full), `${q.id} ${latex}`).toBeGreaterThan(0);
        seen += 1;
      }
    }
    expect(seen).toBeGreaterThan(5);
    // a key proves its point: the three learning points of the bank map to keys of the lesson
    expect(Object.keys(keyOf).sort()).toEqual([`3e_${ID}_P1`, `3e_${ID}_P2`, `3e_${ID}_P3`]);
  });
});
