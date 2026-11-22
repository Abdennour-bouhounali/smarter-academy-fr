import { describe, expect, it } from 'vitest';
import { boxesOf } from '../../../../../../common/gameworld/kit/authoring/forgeBlocks';
import { calculator, cut, rootOf, rounded } from './math';
import { COURTS, MISSION, STORY } from './story';

const M = STORY.mission;
const FRAC = `${MISSION.fracN}/${MISSION.fracD}`;
/** The solution, computed from the numbers of the card: the decimal side, the fraction side, the two values of the third. */
const right = () => {
  const [i, d] = rootOf(MISSION.exact).split(',');
  const [n, q] = rootOf(FRAC).split('/');
  const [b1, b2] = cut(MISSION.none, 2).split(',');
  const [c1, c2] = rounded(MISSION.none, 2).split(',');
  return { a1: i, a2: d, n, d: q, b1, b2, c1, c2 };
};

describe('the final mission of natiqa-ghayr-natiqa — it needs the three keys', () => {
  it('its numbers: a decimal side, a fraction side behind a long display, a side no number writes — none is a court of the story', () => {
    expect(rootOf(MISSION.exact)).toBe('3,6');
    expect(rootOf(FRAC)).toBe('5/6');
    expect(calculator(FRAC)).toBe('0,833333333'); // the trap: many digits, yet a fraction
    expect(rootOf(MISSION.none)).toBe(null);
    expect([cut(MISSION.none, 2), rounded(MISSION.none, 2)]).toEqual(['5,56', '5,57']); // the two differ
    const told = Object.values(COURTS);
    for (const x of [MISSION.exact, FRAC, MISSION.none]) expect(told).not.toContain(x);
  });

  it('the solution computed from the numbers is accepted — and an equal fraction too', () => {
    expect(M.check(right())).toBe('ok');
    expect(M.check({ ...right(), n: '10', d: '12' })).toBe('ok');
    expect(M.check({ ...right(), a2: '60' })).toBe('ok'); // 3,60 is 3,6
  });

  it('every box is named by the words beside it; a decimal line reads whole part, comma, decimals, the words on its right', () => {
    const lines = M.lines();
    expect(lines).toHaveLength(4);
    for (const l of lines) {
      const words = l.tokens.filter((t) => typeof t === 'string' && /[؀-ۿ]/.test(t));
      expect(words).toHaveLength(1);
      if (l.dir === 'ltr') {
        const i = l.tokens.indexOf(',');
        expect(l.tokens[i - 1].label).toBe('الوحدات');
        expect(l.tokens[i + 1].label).toBe('الجزء العشري');
        expect(l.tokens.indexOf(words[0])).toBe(l.tokens.length - 1);
      }
    }
    expect(lines.flatMap((l) => boxesOf(l.tokens).map((t) => t.slot))).toEqual([
      'a1',
      'a2',
      'n',
      'd',
      'b1',
      'b2',
      'c1',
      'c2',
    ]);
    // the second line is a fraction typed over a real bar
    expect(lines[1].tokens.find((t) => t.frac)?.frac.n.label).toBe('البسط');
  });

  it('a near miss gets a FACT of the world about the first line that does not hold, never « wrong »', () => {
    const r = right();
    const facts = [
      M.check({ ...r, a2: '5' }), // 3,5: a band
      M.check({ ...r, a2: '7' }), // 3,7: a jam
      M.check({ ...r, n: '833', d: '1000' }), // the calculator's digits: a band
      M.check({ ...r, n: '6', d: '7' }), // a jam
      M.check({ ...r, b2: '57' }), // by default above the side
      M.check({ ...r, b2: '55' }), // a nearer mark exists
      M.check({ ...r, b2: '555' }), // three decimals
      M.check({ ...r, c2: '56' }), // the lower mark: the middle leaves a band
      M.check({ ...r, c2: '58' }), // not one of the two marks
    ];
    for (const f of facts) {
      expect(f).not.toBe('ok');
      expect(f).not.toMatch(/خطأ|خاطئ|غلط/);
    }
    expect(facts[0]).toContain('شريط');
    expect(facts[1]).toContain('تزيد');
    expect(facts[2]).toContain('الحاسبة');
    expect(facts[7]).toContain('5,565');
    expect(facts[7]).toContain('30,969225');
    expect(new Set(facts).size).toBe(facts.length);
  });

  it('the story is whole: it ends after the mission', () => {
    expect(STORY.complete).not.toBe(false);
    expect(STORY.objective({ ter: STORY.terraces, state: { at: 5, keys: [] }, flags: {}, hold: null })).toMatch(
      /مهمّة/,
    );
  });
});
