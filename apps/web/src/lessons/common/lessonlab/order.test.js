import { describe, it, expect, vi } from 'vitest';
import { GRADES, GRADE_NAMES, placeOf, isReached, compareLessons } from './order';

// The generated order is EMPTY until the French lessons: a neutral order of four lessons over two grades stands in.
vi.mock('./lessonOrder.generated.json', () => ({
  default: { '6e': ['a6', 'b6'], '5e': ['a5'], '4e': [], '3e': ['a3'] },
}));

describe('Mon labo — where a lesson sits in the four years', () => {
  it('the four French grades in order, named as the catalogue names them', () => {
    expect(GRADES).toEqual(['6e', '5e', '4e', '3e']);
    expect(GRADES.every((g) => typeof GRADE_NAMES[g] === 'string' && GRADE_NAMES[g].length > 0)).toBe(true);
  });

  it('puts every earlier grade before a later one, and a lesson before the next of its grade', () => {
    expect(isReached('a6', 'a3')).toBe(true); // 6e before 3e
    expect(isReached('a3', 'a3')).toBe(true);
    expect(isReached('b6', 'a6')).toBe(false); // a later lesson of the same grade
    expect(isReached('a3', 'a6')).toBe(false);
    expect(isReached('inconnue', 'a3')).toBe(false);
    expect(placeOf('a5').grade).toBe('5e');
    expect(placeOf('inconnue')).toBeNull();
    expect(['a3', 'a6', 'a5', 'b6'].sort(compareLessons)).toEqual(['a6', 'b6', 'a5', 'a3']);
  });
});
