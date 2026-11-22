import { describe, it, expect } from 'vitest';
import { buildLessonMemo } from './buildLessonMemo';
import { lessonMemoPath } from './memoRoutes';

describe('buildLessonMemo — données manquantes', () => {
  it('une leçon sans contenu chargé donne des sections vides, jamais inventées', () => {
    const memo = buildLessonMemo({
      lesson: { id: 'x', title: 'Leçon', learningPoints: [] },
      config: { modules: [{ id: '01', number: 1, title: 'M1', stage: 'discovery', estimatedMin: 10 }] },
    });
    expect(memo.start).toBeNull();
    expect(memo.errors).toEqual([]);
    expect(memo.examples).toEqual([]);
    expect(memo.trace.bricks).toEqual([]);
    expect(memo.evaluation.exitTicket).toBeNull();
    expect(memo.differentiation.support.exercises).toEqual([]);
    expect(memo.phases).toHaveLength(1);
  });

  it('la différenciation suit la difficulté réelle des exercices et le niveau des manipulations', () => {
    const memo = buildLessonMemo({
      lesson: { id: 'x', title: 'L', learningPoints: [{ id: 'P1', title: 'p1' }] },
      config: {
        modules: [{ id: '01', number: 1, title: 'M1', stage: 'practice_lab', teachesLearningPointIds: ['P1'] }],
        resources: [{ kind: 'manipulation', module: 1, level: 'beginner', title: 'petit' }, { kind: 'manipulation', module: 1, level: 'advanced', title: 'grand' }],
      },
      content: { EXERCISES_1: [{ id: 'a', difficulty: 'facile', statement: 's1', learningPointId: 'P1', commonError: 'e1' }], EXERCISES_2: [{ id: 'b', difficulty: 'difficile', statement: 's2' }] },
    });
    expect(memo.differentiation.support.exercises.map((e) => e.id)).toEqual(['a']);
    expect(memo.differentiation.extension.exercises.map((e) => e.id)).toEqual(['b']);
    expect(memo.differentiation.support.manipulations.map((m) => m.title)).toEqual(['petit']);
    expect(memo.differentiation.core.manipulations.map((m) => m.title)).toEqual(['grand']);
    expect(memo.phases[0].vigilance).toEqual(['e1']);
    expect(memo.evaluation.exitTicket.id).toBe('a');
  });
});

describe('memoRoutes', () => {
  it('la route de la fiche du professeur est sous l’espace enseignant', () => {
    expect(lessonMemoPath('tayin-pgcd')).toBe('/enseignant/cours/tayin-pgcd/memoire');
  });
});
