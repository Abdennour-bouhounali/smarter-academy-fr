import { describe, it, expect } from 'vitest';
import { getAllGrades, courseLevels, getFlatAvailableLessons } from '@smarter-academy/core';
import { getAllGradesSummary, HOME_GRADES, AVAILABLE_LESSON_COUNT } from './gradeSummary';

describe('gradeSummary (virtual:grade-summary) = ce que le catalogue complet répond', () => {
  it('liste les mêmes classes que getAllGrades()', () => {
    expect(getAllGradesSummary()).toEqual(getAllGrades());
  });
  it('compte les mêmes leçons publiées', () => {
    expect(AVAILABLE_LESSON_COUNT).toBe(getFlatAvailableLessons(courseLevels).length);
  });
  it("donne à l'accueil les mêmes classes, dans le même ordre", () => {
    expect(HOME_GRADES).toEqual(courseLevels.flatMap((l) => l.grades.map((g) => ({ id: g.id, name: g.name, levelId: l.id }))));
  });
});
