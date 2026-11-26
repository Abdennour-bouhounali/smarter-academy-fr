// « Brevet blanc » of multiples-et-diviseurs-communs: the REAL bank (content/practice/3e/multiples-et-diviseurs-communs), served
// as it is — the shared suite, then the lesson's own: ten sheets a level, a subject at each seed, the three learning points of
// the bank mapped to keys of the lesson (K3 and K4 both prove P3: the first key of the road answers for a point).
import { describe, it, expect, beforeAll } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { keysOfPoints } from '../../../../../../common/gameworld/kit/bankSitting';
import { allQuestions } from '../../../../../../common/gameworld/kit/sitting';
import { describeSitting } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { evidence } from './evidence';
import { KEYS } from './journey';
import { LEVELS, sittings } from './sitting';
import { CARDS } from './knowledge';

const ID = 'multiples-et-diviseurs-communs';

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

  it('the three learning points of the bank map to keys of the lesson, each with the card that trains it', () => {
    const keyOf = keysOfPoints(ID, { keys: KEYS, evidence });
    expect(Object.keys(keyOf).sort()).toEqual([1, 2, 3].map((n) => `3e_${ID}_P${n}`));
    expect(keyOf[`3e_${ID}_P1`]).toBe('pilier-commun');
    expect(keyOf[`3e_${ID}_P2`]).toBe('ppcm-facteurs');
    // P3 is proved by two keys: the first one on the road answers for it
    expect(keyOf[`3e_${ID}_P3`]).toBe('traduire-rendez-vous');
    for (const key of Object.values(keyOf)) expect(CARDS.ofKey[key], key).toBeTruthy();
  });
});
