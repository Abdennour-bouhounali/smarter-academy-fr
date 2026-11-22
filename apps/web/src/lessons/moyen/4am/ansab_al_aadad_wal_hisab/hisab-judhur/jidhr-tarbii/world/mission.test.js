import { describe, expect, it } from 'vitest';
import { COURTS, MISSION, STORY, YARD } from './story';
import { COURSE } from './run';

const M = STORY.mission;
const right = () => {
  const side = Math.round(Math.sqrt(MISSION.feast));
  const low = Math.floor(Math.sqrt(MISSION.garden));
  return { side: String(side), low: String(low), high: String(low + 1), sq: String(MISSION.garden) };
};

describe('the final mission of jidhr-tarbii — it needs the three keys', () => {
  it('its numbers: a court with a whole side, a garden without one, and neither is a number of the story', () => {
    expect(Number.isInteger(Math.sqrt(MISSION.feast))).toBe(true);
    expect(Number.isInteger(Math.sqrt(MISSION.garden))).toBe(false);
    const told = [...Object.values(COURTS), ...YARD, ...COURSE.map(([a, t]) => String(a ** t))];
    expect(told).not.toContain(String(MISSION.feast));
    expect(told).not.toContain(String(MISSION.garden));
  });
  it('the solution computed from the numbers is accepted', () => {
    expect(M.check(right())).toBe('ok');
  });
  it('every box is named by the words beside it, and the lines ask one thing each', () => {
    const lines = M.lines();
    for (const l of lines) {
      const boxes = l.tokens.filter((t) => typeof t === 'object');
      const words = l.tokens.filter((t) => typeof t === 'string');
      expect(boxes).toHaveLength(1);
      expect(words.join('')).toMatch(/[؀-ۿ]/);
    }
    expect(lines.flatMap((l) => l.tokens.filter((t) => typeof t === 'object').map((t) => t.slot))).toEqual([
      'side',
      'low',
      'high',
      'sq',
    ]);
  });
  it('a near miss gets a FACT of the world, never « wrong »', () => {
    const r = right();
    const facts = [
      M.check({ ...r, side: String(Number(r.side) - 1) }), // a band
      M.check({ ...r, side: String(Number(r.side) + 1) }), // a jam
      M.check({ ...r, low: String(Number(r.low) + 1), high: String(Number(r.low) + 2) }), // the lower bound is too big
      M.check({ ...r, high: r.low }), // the upper bound is too small
      M.check({ ...r, low: String(Number(r.low) - 1) }), // not consecutive
      M.check({ ...r, sq: String(Number(r.low) ** 2) }), // the square of the side is the area
    ];
    for (const f of facts) {
      expect(f).not.toBe('ok');
      expect(f).not.toMatch(/خطأ|خاطئ|غلط/);
    }
    expect(facts[0]).toContain('شريط');
    expect(facts[1]).toContain('تزيد');
    expect(new Set(facts).size).toBe(facts.length);
  });
  it('the story is whole: it ends after the mission', () => {
    expect(STORY.complete).not.toBe(false);
    expect(STORY.objective({ ter: [{ id: 'aala' }], state: { at: 0, keys: [] }, flags: {}, hold: null })).toMatch(
      /مهمّة/,
    );
  });
});
