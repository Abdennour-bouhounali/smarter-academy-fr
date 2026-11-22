import { describe, it, expect } from 'vitest';
import { lesson } from './index';
import { examLevelOpen, emptyExam } from '../../../../../../common/gameworld/kit/journey';

describe('« أدمج تعلّماتي » unit 1 — the content of its island', () => {
  it('has no key to forge, two depot missions in order and a bank mission', () => {
    expect(lesson.keys).toEqual([]);
    expect(lesson.missions.map((m) => m.id)).toEqual(['bem-2022-lots', 'bem-2020-trees']);
    expect(lesson.missions.every((m) => m.minutes > 0 && m.session.includes('شهادة التعليم المتوسط'))).toBe(true);
    expect(lesson.bank).toMatchObject({ level: 5 });
    expect(new Set([...lesson.missions.map((m) => m.id), lesson.bank.id]).size).toBe(3);
  });
  it('the exam space is open from the first minute, level by level', () => {
    expect(lesson.journey.examOpen([], {})).toBe(true);
    expect(examLevelOpen(emptyExam(), 1)).toBe(true);
    expect(examLevelOpen(emptyExam(), 2)).toBe(false);
    const { exam, result } = lesson.journey.applySitting(emptyExam(), 1, 8, 8, []);
    expect(result.passed).toBe(true);
    expect(examLevelOpen(exam, 2)).toBe(true);
  });
  it("the sitting is the lesson's own bank, five levels", () => {
    expect(lesson.sittings.lesson).toBe('wadiya-idmajiya-aadad');
    expect(lesson.sittings.levels.map((l) => l.n)).toEqual([1, 2, 3, 4, 5]);
  });
  it("carries the unit's endless game: a title, its levels and a round maker", () => {
    expect(lesson.endless.title.length).toBeGreaterThan(3);
    expect(lesson.endless.levels.length).toBeGreaterThanOrEqual(6);
    expect(lesson.endless.round(1).options).toHaveLength(3);
  });
  it('the recap names the eight lessons of the unit, once each', () => {
    expect(lesson.recap).toHaveLength(8);
    expect(new Set(lesson.recap.map((r) => r.id)).size).toBe(8);
  });
});
