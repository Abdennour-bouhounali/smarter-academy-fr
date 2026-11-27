// « Brevet blanc » of triangles-semblables: the REAL bank (content/practice/3e/triangles-semblables),
// served as it is — every level draws real sheets, every step markable to full points by its own key, its figures
// drawn, and the bank's learning points mapped to the lesson's keys.
import { describe, it, expect, beforeAll } from 'vitest';
import { describeSitting } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { keysOfPoints } from '../../../../../../common/gameworld/kit/bankSitting';
import { allQuestions } from '../../../../../../common/gameworld/kit/sitting';
import { evidence } from './evidence';
import { KEYS } from './journey';
import { LEVELS, sittings } from './sitting';

const ID = 'triangles-semblables';

/** What the sitting reads of the lesson (`world/index.js › lesson`): its keys and its evidence. */
const lesson = { keys: KEYS, evidence };
describeSitting({ id: ID, lesson, sittings, levels: LEVELS });

describe(`${ID} — its own sitting`, () => {
  beforeAll(() => sittings.prepare());

  it('every level of the bank is sat: ten sheets each, choices and typed lengths among the answers', () => {
    const types = new Set();
    for (const L of LEVELS) {
      expect(sittings.sheetIds(L.n).length, `level ${L.n}`).toBe(10);
      for (let seed = 1; seed <= 10; seed += 1)
        for (const q of allQuestions(sittings.makeSubject(rng(seed), L.n, [], keysOfPoints(ID, lesson))))
          types.add(q.answerType);
    }
    expect(types.has('choice')).toBe(true);
    expect(types.has('rational')).toBe(true);
  });

  it('the bank’s P1 and P4 sheets count on K1 (its last step computes k), its P2 and P3 sheets on K2 (it pairs the vertices)', () => {
    // P3 and P4 are proved by answers; `evidence.answerKeys` names the key whose last step teaches each (2026-11-27:
    // without it, a brevet sheet of mostly P4 steps counted on no key at all — the sitting walk)
    expect(keysOfPoints(ID, lesson)).toEqual({
      [`3e_${ID}_P1`]: KEYS[0],
      [`3e_${ID}_P2`]: KEYS[1],
      [`3e_${ID}_P4`]: KEYS[0],
      [`3e_${ID}_P3`]: KEYS[1],
    });
  });
});
