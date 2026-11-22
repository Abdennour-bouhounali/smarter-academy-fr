import { describe, it, expect } from 'vitest';
import {
  formatClock, formatSeconds, serverElapsed, rankMovement, scoreParts, canSubmit,
  correctAnswerText, progressDots, reasonKey, percent, STREAK_DAY_SYMBOL,
} from './challengeModel';

describe('challengeModel', () => {
  it('formats the clock without tenths and never negative', () => {
    expect(formatClock(0)).toBe('00:00');
    expect(formatClock(12_400)).toBe('00:12');
    expect(formatClock(75_000)).toBe('01:15');
    expect(formatClock(-5)).toBe('00:00');
  });

  it('formats seconds with a decimal comma', () => {
    expect(formatSeconds(14_230)).toBe('14,2');
    expect(formatSeconds(null)).toBe('—');
  });

  it('keeps the server timer across a phone whose clock is wrong', () => {
    // Le serveur a servi la question il y a 5 s ; le téléphone avance de 3 min.
    const phoneNow = Date.parse('2026-09-22T10:03:00Z');
    const elapsed = serverElapsed('2026-09-22T09:59:55Z', '2026-09-22T10:00:00Z', phoneNow);
    expect(elapsed(phoneNow)).toBe(5000);
    expect(elapsed(phoneNow + 2000)).toBe(7000);
  });

  it('reports a rank movement only when it really happened', () => {
    expect(rankMovement(6, 4)).toEqual({ direction: 'up', places: 2 });
    expect(rankMovement(2, 3)).toEqual({ direction: 'down', places: 1 });
    expect(rankMovement(3, 3)).toBeNull();
    expect(rankMovement(null, 3)).toBeNull();
    expect(rankMovement(4, null)).toBeNull();
  });

  it('lists score parts and shows a penalty only when there is one', () => {
    expect(scoreParts({ base: 400, speed: 32, streak: 10, penalty: 0 }).map((p) => p.key)).toEqual(['accuracy', 'speed', 'streak']);
    expect(scoreParts({ base: 400, speed: 32, streak: 10, penalty: 15 }).at(-1)).toEqual({ key: 'penalty', value: -15 });
  });

  it('knows when an answer is ready to submit', () => {
    expect(canSubmit({ answerType: 'choice' }, { choiceId: 'A' })).toBe(true);
    expect(canSubmit({ answerType: 'choice' }, {})).toBe(false);
    expect(canSubmit({ answerType: 'rational' }, { value: '  ' })).toBe(false);
    expect(canSubmit({ answerType: 'integerSet' }, { value: '1, 2' })).toBe(true);
    expect(canSubmit({ answerType: 'multiChoice' }, { choiceIds: [] })).toBe(false);
  });

  it('shows the content of the correct choice, never a letter', () => {
    const q = { choices: [{ id: 'A', content: '12' }, { id: 'B', content: '18' }] };
    expect(correctAnswerText(q, { correctChoiceIds: ['B'], correctAnswer: null })).toBe('18');
    expect(correctAnswerText({}, { correctChoiceIds: [], correctAnswer: [120, 132] })).toBe('120 ؛ 132');
    expect(correctAnswerText({}, { correctChoiceIds: [], correctAnswer: '7/4' })).toBe('7/4');
    expect(correctAnswerText({}, null)).toBeNull();
  });

  it('gives every progress state its own symbol', () => {
    const dots = progressDots(5, [
      { position: 1, isCorrect: true, outcome: 'correct' },
      { position: 2, isCorrect: false, outcome: 'incorrect' },
      { position: 3, isCorrect: false, outcome: 'partially_correct' },
    ], 4);
    expect(dots.map((d) => d.symbol)).toEqual(['✓', '✕', '◐', '●', '○']);
    expect(new Set(Object.values(STREAK_DAY_SYMBOL)).size).toBe(5);
  });

  it('maps refusal reasons and formats rates', () => {
    expect(reasonKey('expired')).toBe('expired');
    expect(reasonKey('something_else')).toBe('generic');
    expect(percent(0.823)).toBe('82 %');
    expect(percent(null)).toBe('—');
  });
});
