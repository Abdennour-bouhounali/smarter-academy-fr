import { describe, it, expect } from 'vitest';
import {
  exerciseRef,
  exerciseLabel,
  studentFacts,
  orderStudents,
  classFacts,
  exercisesOf,
  STATE_LABEL,
  STATES,
  isRight,
  studentWork,
} from './tracking';

const POINTS = [
  { code: 'P1', title: 'Le diviseur par le reste' },
  { code: 'P2', title: 'Le diviseur par le produit' },
];
const amine = {
  id: 1,
  firstName: 'Amine',
  lastName: 'S.',
  points: { P1: 'mastered', P2: 'reinforce' },
  exercises: [
    { exerciseId: 'ex-4am-x-l3-002', answered: 4, correct: 3, firstTry: 2 },
    { exerciseId: 'ex-4am-x-l1-001', answered: 3, correct: 3, firstTry: 3 },
  ],
  lastActivityAt: '2026-11-18 10:00:00',
};
const badr = {
  id: 2,
  firstName: 'Bastien',
  lastName: 'A.',
  points: { P1: 'gap' },
  exercises: [{ exerciseId: 'ex-4am-x-l1-001', answered: 2, correct: 0, firstTry: 0 }],
  lastActivityAt: '2026-11-17 10:00:00',
};
const chahd = { id: 3, firstName: 'Chloé', lastName: 'M.', points: [], exercises: [], lastActivityAt: null };
const dounia = {
  id: 4,
  firstName: 'Denise',
  lastName: 'B.',
  points: { P1: 'mastered', P2: 'mastered' },
  exercises: [],
  lastActivityAt: null,
};

describe('suivi de la classe — the class on one lesson', () => {
  it('reads an exercise as a teacher names it', () => {
    expect(exerciseRef('ex-4am-qasim-adad-tabii-l3-002')).toEqual({ level: 3, number: 2 });
    expect(exerciseLabel('ex-4am-qasim-adad-tabii-l3-002')).toBe('Niveau 3 · exercice 2');
    expect(exerciseRef('weird')).toEqual({ level: null, number: null });
    expect(exerciseLabel('weird')).toBe('weird');
    expect(STATES.every((s) => STATE_LABEL[s])).toBe(true);
  });

  it('gives one student in facts: states, exercises, questions right and right at the first try', () => {
    const f = studentFacts(amine, POINTS);
    expect(f).toMatchObject({
      states: ['mastered', 'reinforce'],
      mastered: 1,
      reinforce: 1,
      gaps: 0,
      exercises: 2,
      answered: 7,
      correct: 6,
      firstTry: 5,
      byLevel: { 1: 1, 3: 1 },
      started: true,
    });
    expect(studentFacts(chahd, POINTS)).toMatchObject({
      states: ['unassessed', 'unassessed'],
      exercises: 0,
      answered: 0,
      started: false,
      last: null,
    });
  });

  it('orders the class by who needs the teacher first — never by score', () => {
    expect(orderStudents([dounia, chahd, amine, badr], POINTS).map((s) => s.id)).toEqual([2, 1, 3, 4]); // a gap, « needs support », not started, the others
  });

  it('counts the class per savoir-faire and those who have not started', () => {
    const c = classFacts([amine, badr, chahd, dounia], POINTS);
    expect(c).toMatchObject({ students: 4, notStarted: 1, practising: 2 });
    expect(c.perPoint[0].counts).toEqual({ mastered: 2, reinforce: 0, gap: 1, unassessed: 1 });
    expect(c.perPoint[1].counts).toEqual({ mastered: 1, reinforce: 1, gap: 0, unassessed: 2 });
  });

  it('lists the exercises of a student in the order of the bank, with what is left to get right', () => {
    expect(exercisesOf(amine).map((e) => [e.level, e.number, e.missed])).toEqual([
      [1, 1, 0],
      [3, 2, 1],
    ]);
    expect(exercisesOf(chahd)).toEqual([]);
  });

  it('reads what one student did on one exercise, question by question', () => {
    expect(['correct', 'equivalent_correct', 'partially_correct', 'incorrect', 'abandoned', null].map(isRight)).toEqual(
      [true, true, false, false, false, false],
    );
    const ex = { questions: [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }] };
    const work = studentWork(ex, [
      {
        questionId: 'q2',
        attempts: [
          { attemptNumber: 2, outcome: 'correct' },
          { attemptNumber: 1, outcome: 'incorrect' },
        ],
      },
      { questionId: 'q1', attempts: [{ attemptNumber: 1, outcome: 'correct' }] },
    ]);
    expect(work.map((w) => [w.number, w.answered, w.right, w.firstTry, w.tries.length])).toEqual([
      [1, true, true, true, 1],
      [2, true, true, false, 2],
      [3, false, null, false, 0],
    ]);
    expect(work[1].tries.map((t) => t.attemptNumber)).toEqual([1, 2]);
    expect(studentWork(null, null)).toEqual([]);
  });
});
