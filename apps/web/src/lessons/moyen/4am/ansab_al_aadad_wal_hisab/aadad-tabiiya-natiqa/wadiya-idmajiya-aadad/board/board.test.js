import { describe, it, expect } from 'vitest';
import { SCRIPT } from './script';
import { lesson } from '../world';
import { groupsOf, railOf } from '../../../../../../../features/classSession/lessonScripts';

describe('« أدمج تعلّماتي » unit 1 — the lesson on the board', () => {
  it("is made of missions of the lesson, one station each, in the lesson's order", () => {
    expect(SCRIPT.steps.map((s) => s.kind)).toEqual(['mission', 'mission']);
    expect(SCRIPT.steps.map((s) => s.mission)).toEqual(lesson.missions.map((m) => m.id));
    for (const s of SCRIPT.steps) {
      expect(s.lesson).toBe('wadiya-idmajiya-aadad');
      expect(s.world).toBe('mission-isle');
      expect(s.title).toMatch(/دورة 20\d\d/);
    }
  });
  it("each station says what the class needs: a sheet, a pen, the mission's own minutes", () => {
    SCRIPT.steps.forEach((s, i) => {
      expect(s.needs).toHaveLength(3);
      expect(s.needs[2]).toBe(`${lesson.missions[i].minutes} دقيقة`);
    });
  });
  it('a cue is one short oral question: no Latin, no formula, 70 characters at most', () => {
    for (const s of SCRIPT.steps) {
      expect(s.cue.length).toBeLessThanOrEqual(70);
      expect(s.cue).not.toMatch(/[A-Za-z$\\=]/);
      expect(s.question).not.toMatch(/[A-Za-z$\\=]/);
      expect(s.text).not.toMatch(/DA|\$/);
    }
  });
  it("the board's rail and groups can be drawn from it", () => {
    expect(railOf(SCRIPT)).toHaveLength(2);
    expect(groupsOf(SCRIPT).flatMap((g) => g.steps)).toEqual([0, 1]);
  });
});
