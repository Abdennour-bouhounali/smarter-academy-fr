import { describe, expect, it } from 'vitest';
import { buildSlides, displayName, HIDE_NAMES_BY_DEFAULT, stepForKey } from './meetingSlides';

const assessed = { mastered: 1, reinforce: 0, gap: 0, unassessed: 2 };
const blank = { mastered: 0, reinforce: 0, gap: 0, unassessed: 3 };

describe('buildSlides', () => {
  it('opens on a title, then one slide per lesson WITH evidence, then the students to watch (class report)', () => {
    const slides = buildSlides({
      type: 'class',
      payload: {
        lessons: [
          { code: 'a', learningPoints: [{ counts: assessed }] },
          { code: 'b', learningPoints: [{ counts: blank }] },
          { code: 'c', learningPoints: [{ counts: assessed }] },
        ],
        studentsToWatch: [{ id: 1 }],
      },
    });
    expect(slides.map((s) => s.kind)).toEqual(['title', 'lesson', 'lesson', 'toWatch']);
    expect(slides.map((s) => s.lesson?.code).filter(Boolean)).toEqual(['a', 'c']);
  });

  it('puts the hardest learning points first in a grade report', () => {
    const slides = buildSlides({ type: 'grade', payload: { hardest: [], map: { classes: [{ id: 1 }], lessons: [{ code: 'a', learningPoints: [{ byClass: { 1: assessed } }] }] } } });
    expect(slides.map((s) => s.kind)).toEqual(['title', 'hardest', 'lesson']);
    expect(slides[2].classes).toEqual([{ id: 1 }]);
  });

  it('gives one slide per grade in the term summary and survives an unknown type', () => {
    expect(buildSlides({ type: 'school_term', payload: { grades: [{}, {}] } })).toHaveLength(3);
    expect(buildSlides({ type: 'future', payload: {} })).toEqual([{ kind: 'title' }]);
  });
});

describe('displayName', () => {
  it('replaces names by a stable rank when hidden', () => {
    const placeholder = (n) => `تلميذ ${n}`;
    expect(displayName({ firstName: 'أمين', lastName: 'بوعلام' }, 0, false, placeholder)).toBe('أمين بوعلام');
    expect(displayName({ firstName: 'أمين' }, 2, true, placeholder)).toBe('تلميذ 3');
  });

  it('hides names by default for the wide meetings only', () => {
    expect(HIDE_NAMES_BY_DEFAULT).toContain('grade');
    expect(HIDE_NAMES_BY_DEFAULT).not.toContain('class');
  });
});

describe('stepForKey', () => {
  it('moves forward with the left arrow (RTL) and the clicker, back with the right arrow', () => {
    expect(stepForKey('ArrowLeft')).toBe(1);
    expect(stepForKey('PageDown')).toBe(1);
    expect(stepForKey('ArrowRight')).toBe(-1);
    expect(stepForKey('PageUp')).toBe(-1);
    expect(stepForKey('a')).toBe(0);
  });
});
