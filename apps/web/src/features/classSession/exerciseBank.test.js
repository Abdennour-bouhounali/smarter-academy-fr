import { describe, it, expect } from 'vitest';
import { exerciseIdsFor, loadExercise, levelCounts } from '../practice/practiceContent';
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

const LESSON = 'qasim-adad-tabii';
const loadAll = async () => {
  const out = [];
  for (const level of Object.keys(levelCounts(LESSON)).map(Number))
    for (const id of exerciseIdsFor(LESSON, level)) out.push(await loadExercise(LESSON, level, id));
  return out;
};

describe('بنك التمارين — the bank as a teacher uses it', () => {
  it('names an exercise by its level and its id, and opens it on the board of the class', () => {
    expect(refOf(3, 'ex-4am-qasim-adad-tabii-l3-002')).toBe('3:ex-4am-qasim-adad-tabii-l3-002');
    expect(parseRef('3:ex-4am-qasim-adad-tabii-l3-002')).toEqual({ level: 3, id: 'ex-4am-qasim-adad-tabii-l3-002' });
    expect(parseRef('x:1')).toBe(null);
    expect(parseRef(null)).toBe(null);
    expect(parseRef('3:../../etc')).toBe(null);
    expect(exerciseBoardPath(LESSON, 3, 'ex-1')).toBe('/enseignant/hissa/qasim-adad-tabii?exercice=3%3Aex-1');
  });

  it('gives the teacher a KEY for every question of the bank of the pilot: an answer or a solution, never nothing', async () => {
    const all = await loadAll();
    expect(all.length).toBe(50);
    expect(all.every(Boolean)).toBe(true);
    let questions = 0;
    for (const ex of all) {
      const s = summaryOf(ex);
      expect(s.title, ex.id).toBeTruthy();
      expect(s.questions).toBe(ex.questions.length);
      expect(s.minutes).toBeGreaterThan(0);
      for (const q of ex.questions) {
        questions += 1;
        expect(hasKey(q), `${ex.id} ${q.id}`).toBe(true);
        if (q.answerType === 'choice') {
          const k = keyOf(q);
          expect(k.answer, `${ex.id} ${q.id}`).toMatch(/^[أبجدهو]/);
          expect(choicesOf(q).filter((c) => c.right).length).toBeGreaterThan(0);
        }
      }
    }
    expect(questions).toBe(172);
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
