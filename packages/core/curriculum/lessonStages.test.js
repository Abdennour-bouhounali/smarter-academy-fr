import { describe, it, expect } from 'vitest';
import { LESSON_STAGES, STAGE_ORDER, REQUIRED_STAGES, MAX_LESSON_MINUTES } from './lessonStages';

describe('lessonStages', () => {
  it('exposes the seven canonical stages in journey order', () => {
    expect(LESSON_STAGES).toEqual([
      'prerequisite_check',
      'trigger',
      'discovery',
      'manipulation',
      'formalization',
      'practice_lab',
      'evaluation',
    ]);
  });

  it('is frozen — the vocabulary cannot be mutated at runtime', () => {
    expect(Object.isFrozen(LESSON_STAGES)).toBe(true);
    expect(Object.isFrozen(STAGE_ORDER)).toBe(true);
    expect(Object.isFrozen(REQUIRED_STAGES)).toBe(true);
  });

  it('STAGE_ORDER mirrors the array order exactly', () => {
    LESSON_STAGES.forEach((stage, index) => {
      expect(STAGE_ORDER[stage]).toBe(index);
    });
    expect(Object.keys(STAGE_ORDER)).toHaveLength(LESSON_STAGES.length);
  });

  it('required stages are a subset of all stages, in journey order', () => {
    for (const stage of REQUIRED_STAGES) {
      expect(LESSON_STAGES).toContain(stage);
    }
    const orders = REQUIRED_STAGES.map((s) => STAGE_ORDER[s]);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  it('caps lessons at 90 minutes', () => {
    expect(MAX_LESSON_MINUTES).toBe(90);
  });
});
