import { describe, it, expect } from 'vitest';
import {
  refOf,
  parseRef,
  exerciseBoardPath,
  summaryOf,
  choicesOf,
  keyOf,
  hasKey,
  sheetTotals,
  toggleRef,
  exercisesWord,
  questionsWord,
} from './exerciseBank';

const LESSON = 'lecon-a';

describe('بنك التمارين — the bank as a teacher uses it', () => {
  it('names an exercise by its level and its id, and opens it on the board of the class', () => {
    expect(refOf(3, 'ex-3e-lecon-a-l3-002')).toBe('3:ex-3e-lecon-a-l3-002');
    expect(parseRef('3:ex-3e-lecon-a-l3-002')).toEqual({ level: 3, id: 'ex-3e-lecon-a-l3-002' });
    expect(parseRef('x:1')).toBe(null);
    expect(parseRef(null)).toBe(null);
    expect(parseRef('3:../../etc')).toBe(null);
    expect(exerciseBoardPath(LESSON, 3, 'ex-1')).toBe('/enseignant/hissa/lecon-a?exercice=3%3Aex-1');
  });

  it('sums up an exercise of the bank and letters its choices (a neutral exercise written here)', () => {
    const exercise = {
      id: 'ex-1',
      level: 2,
      metadata: {
        title: 'Exercice 1',
        estimatedMinutes: 6,
        tags: ['diviseurs'],
        exam: { kind: 'official', badge: 'Brevet 2025' },
      },
      questions: [
        { id: 'q1', answerType: 'choice', choices: [{ content: 'oui', isCorrect: true }, { content: 'non' }] },
      ],
    };
    expect(summaryOf(exercise)).toEqual({
      id: 'ex-1',
      level: 2,
      title: 'Exercice 1',
      badge: 'Brevet 2025',
      official: true,
      minutes: 6,
      questions: 1,
      tags: ['diviseurs'],
    });
    expect(summaryOf({ id: 'ex-2', level: 1 })).toMatchObject({
      title: 'ex-2',
      minutes: 0,
      questions: 0,
      official: false,
    });
    expect(choicesOf(exercise.questions[0])).toEqual([
      { letter: 'أ', content: 'oui', right: true },
      { letter: 'ب', content: 'non', right: false },
    ]);
  });

  it('writes the key the way a teacher reads it', () => {
    expect(
      keyOf({
        answerType: 'choice',
        choices: [
          { content: 'نعم', isCorrect: false },
          { content: 'لا', isCorrect: true },
        ],
        solution: { lines: ['$137 = 5 \\times 27 + 2$'] },
      }),
    ).toEqual({ answer: 'ب) لا', lines: ['$137 = 5 \\times 27 + 2$'], result: null });
    expect(
      keyOf({
        answerType: 'rational',
        expectedAnswer: 196,
        solution: { lines: [], result: '4508 = 23 \\times 196 + 0' },
      }),
    ).toEqual({ answer: '196', lines: [], result: '4508 = 23 \\times 196 + 0' });
    expect(keyOf({ answerType: 'selfCheck' }).answer).toBe(null);
    expect(hasKey({ answerType: 'selfCheck' })).toBe(false);
  });

  it('counts the work of a class sheet and keeps the order the teacher chose', () => {
    const a = { questions: [{}, {}], metadata: { estimatedMinutes: 8 } };
    const b = { questions: [{}, {}, {}], metadata: { estimatedMinutes: 10 } };
    expect(sheetTotals([a, b])).toEqual({ exercises: 2, questions: 5, minutes: 18 });
    expect(sheetTotals([])).toEqual({ exercises: 0, questions: 0, minutes: 0 });
    expect(toggleRef(['1:a'], '2:b')).toEqual(['1:a', '2:b']);
    expect(toggleRef(['1:a', '2:b'], '1:a')).toEqual(['2:b']);
    expect([1, 2, 3, 11].map(exercisesWord)).toEqual(['تمرين واحد', 'تمرينان', '3 تمارين', '11 تمرينًا']);
    expect([1, 2, 5, 12].map(questionsWord)).toEqual(['سؤال واحد', 'سؤالان', '5 أسئلة', '12 سؤالًا']);
  });
});
