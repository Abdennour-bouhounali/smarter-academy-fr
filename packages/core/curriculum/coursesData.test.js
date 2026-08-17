import { describe, it, expect } from 'vitest';
import { getAllGrades, courseLevels } from './coursesData';

describe('getAllGrades', () => {
  const grades = getAllGrades();

  it('returns one entry per grade across every level', () => {
    const expectedCount = courseLevels.reduce((sum, level) => sum + level.grades.length, 0);
    expect(grades).toHaveLength(expectedCount);
  });

  it('includes the current collège grades with their level', () => {
    expect(grades).toContainEqual({ id: '6e', name: '6ème', levelId: 'college', levelTitle: 'Collège' });
    expect(grades).toContainEqual({ id: '3e', name: '3ème', levelId: 'college', levelTitle: 'Collège' });
  });

  it('includes lycée grades, forward-compatibly', () => {
    expect(grades.some((g) => g.levelId === 'lycee')).toBe(true);
  });

  it('has no duplicate grade ids', () => {
    const ids = grades.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
