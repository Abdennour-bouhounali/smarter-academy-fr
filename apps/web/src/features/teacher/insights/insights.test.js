import { describe, expect, it } from 'vitest';
import { interventionDefaults, kindNeedsPoint, kindVisibleToStudent, outcomeLine, signalWhyParams, studentName, trajectoryColumns } from './insights';

describe('studentName', () => {
  it('never falls back on an email', () => {
    expect(studentName({ firstName: 'أمين', lastName: 'ب', email: 'x@y.dz' })).toBe('أمين ب');
    expect(studentName({ email: 'x@y.dz' }, 'تلميذ')).toBe('تلميذ');
  });
});

describe('interventionDefaults', () => {
  it('prefills from the signal and keeps the server-suggested gesture', () => {
    const d = interventionDefaults({ type: 'class_difficulty', actions: ['class_reinforcement', 'recommend_practice'], learningPoint: { code: 'P1' }, students: [{ id: 3 }, { id: 5 }] });
    expect(d).toEqual({ kind: 'class_reinforcement', studentIds: [3, 5], learningPointCode: 'P1', sourceSignal: 'class_difficulty' });
  });

  it('falls back to an individual follow-up when a point gesture has no point', () => {
    expect(interventionDefaults({ type: 'no_recent_activity', actions: ['recommend_practice'], learningPoint: null, students: [{ id: 1 }] }).kind).toBe('individual_followup');
  });
});

describe('kinds', () => {
  it('mirror the server rules', () => {
    expect(kindNeedsPoint('class_reinforcement')).toBe(true);
    expect(kindNeedsPoint('observation')).toBe(false);
    expect(kindVisibleToStudent('recommend_practice')).toBe(true);
    expect(kindVisibleToStudent('observation')).toBe(false);
  });
});

describe('signalWhyParams', () => {
  it('reads only the numbers the server sent', () => {
    const p = signalWhyParams({ indicator: { gap: 2, assessed: 3, members: 4 }, students: [{ status: 'gap', statusAtWindowStart: 'mastered', recent: { failures: 3, answered: 4 } }, { recent: { failures: 1, answered: 2 } }] });
    expect(p).toMatchObject({ count: 2, gap: 2, assessed: 3, members: 4, failures: 4, answered: 6, from: 'mastered', to: 'gap' });
  });
});

describe('trajectoryColumns', () => {
  it('keeps unknown apart and sums to 100', () => {
    const [col] = trajectoryColumns([{ until: 'x', counts: { mastered: 1, gap: 2, unknown: 1 } }]);
    expect(col.total).toBe(4);
    expect(col.segments.find((s) => s.key === 'unknown').percent).toBe(25);
    expect(col.segments.reduce((s, x) => s + x.percent, 0)).toBe(100);
  });
});

describe('outcomeLine', () => {
  it('is counts only', () => {
    expect(outcomeLine({ students: 7, withNewEvidence: 5, noNewEvidence: 2, improved: 4, declined: 0, unchanged: 1, firstAssessed: 0 }))
      .toEqual({ students: 7, withNewEvidence: 5, noNewEvidence: 2, improved: 4, declined: 0, unchanged: 1, firstAssessed: 0 });
    expect(outcomeLine(null)).toBeNull();
  });
});
