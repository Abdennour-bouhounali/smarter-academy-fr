// « Brevet blanc » of fraction-irreductible: the REAL bank (content/practice/3e/fraction-irreductible), served as it is.
import { describe, it, expect, beforeAll } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { keysOfPoints } from '../../../../../../common/gameworld/kit/bankSitting';
import { allQuestions } from '../../../../../../common/gameworld/kit/sitting';
import { describeSitting } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { evidence } from './evidence';
import { KEYS } from './journey';
import { LEVELS, sittings } from './sitting';

const ID = 'fraction-irreductible';

/** What the sitting reads of the lesson (`world/index.js › lesson`): its keys and its evidence. */
describeSitting({ id: ID, lesson: { keys: KEYS, evidence }, sittings, levels: LEVELS });

describe(`${ID} — its own sitting`, () => {
  beforeAll(() => sittings.prepare());

  it('every level of the bank is sat: ten sheets a level, a subject drawn at each seed', () => {
    const lesson = { keys: KEYS, evidence };
    for (const L of LEVELS) {
      expect(sittings.sheetIds(L.n).length, `level ${L.n}`).toBe(10);
      for (let seed = 1; seed <= 10; seed += 1)
        expect(allQuestions(sittings.makeSubject(rng(seed), L.n, [], keysOfPoints(ID, lesson))).length).toBeGreaterThan(
          0,
        );
    }
  });

  it('the four learning points of the bank map to keys of the lesson', () => {
    const keyOf = keysOfPoints(ID, { keys: KEYS, evidence });
    expect(Object.keys(keyOf).sort()).toEqual([1, 2, 3, 4].map((n) => `3e_${ID}_P${n}`));
  });
});
