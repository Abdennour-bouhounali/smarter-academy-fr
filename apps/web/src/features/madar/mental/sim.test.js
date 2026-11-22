import { describe, expect, it } from 'vitest';
import { createMental, press, resultOf, step } from './sim.js';
import { LIVES, SCHEDULE, timeLimit } from './constants.js';
import { maxProblems, maxRounds, perfectScore } from './bound.js';
import { perHit } from '../sniper/constants.js';
import { POSITIONS, posOf } from '../sniper/levels.js';

const DT = 1 / 60;
const run = (game, seconds) => {
  const end = (game.clock ?? 0) + seconds;
  while ((game.clock ?? 0) < end && game.status === 'playing') {
    game.clock = (game.clock ?? 0) + DT;
    step(game, DT);
  }
};
const typeAll = (game, text) => [...text].map((k) => press(game, k)).filter(Boolean).pop();
const answer = (game) => typeAll(game, game.problem.answerText);
const wait = (game) => run(game, (SCHEDULE.feedbackMs / 1000) * 2 + DT);

describe('mental arithmetic game', () => {
  it('submits on its own when every slot is filled, and pays the level points + a speed bonus', () => {
    const game = createMental(3, { start: posOf(28), warmup: false });
    const e = answer(game);
    expect(e.type).toBe('hit');
    expect(e.points).toBeGreaterThanOrEqual(perHit(28));
    expect(e.points).toBeLessThanOrEqual(perHit(28) * 2);
    expect(press(game, '1')).toBeNull();
  });

  it('a wrong answer or the clock costs a shield', () => {
    const game = createMental(4, { start: posOf(10), warmup: false });
    const want = game.problem.answerText;
    const bad = want.slice(0, -1) + (want.endsWith('9') ? '8' : String(Number(want.at(-1)) + 1));
    expect(typeAll(game, bad).type).toBe('wrong');
    expect(game.lives).toBe(LIVES - 1);
    wait(game);
    run(game, timeLimit(game.i) + DT);
    expect(game.timeouts).toBe(1);
    expect(game.lives).toBe(LIVES - 2);
  });

  it('edits: back erases, the sign only first, one comma', () => {
    const game = createMental(5, { start: posOf(30) });
    press(game, '7');
    press(game, 'back');
    expect(game.typed).toBe('');
    press(game, '−');
    expect(press(game, '−')).toBeNull();
    expect(game.typed).toBe('−');
  });

  it('adapts every five answers and ends with no revive', () => {
    const game = createMental(9, { start: posOf(15), warmup: false });
    for (let n = 0; n < 10; n += 1) { answer(game); wait(game); }
    expect(game.rounds).toBe(2);
    expect(resultOf(game).position).toBe(posOf(15) + 2);
    const idle = createMental(9, { start: posOf(15), warmup: false });
    run(idle, 120);
    expect(idle.status).toBe('over');
  });

  it('a perfect, instant player never goes above the server bound', () => {
    for (const start of [0, posOf(20), POSITIONS - 3]) {
      const game = createMental(11, { start });
      for (let n = 0; n < 50; n += 1) {
        answer(game);
        run(game, SCHEDULE.feedbackMs / 1000 + DT);
        expect(game.score).toBeLessThanOrEqual(perfectScore(game.clock, start));
        expect(game.i).toBeLessThanOrEqual(maxProblems(game.clock));
        expect(game.rounds).toBeLessThanOrEqual(maxRounds(game.clock));
        expect(game.peak).toBeLessThanOrEqual(Math.min(POSITIONS - 1, start + game.rounds));
      }
    }
  });

  it('never starts hard: the warm-up is two levels easier, free, and a good warm-up climbs back fast', () => {
    const game = createMental(2, { start: posOf(20) });
    expect(game.problem.level).toBe(18);
    for (let n = 0; n < 5; n += 1) { typeAll(game, game.problem.answerText); wait(game); }
    expect(game.lives).toBe(LIVES);
    expect(game.problem.level).toBe(19);
    for (let n = 0; n < 5; n += 1) { typeAll(game, game.problem.answerText); wait(game); }
    expect(game.problem.level).toBe(20);
    for (let n = 0; n < 5; n += 1) { typeAll(game, game.problem.answerText); wait(game); }
    expect(resultOf(game).position).toBe(posOf(20) + 1);
  });

  it('the attract mode types the answers itself', () => {
    const game = createMental(1, { autopilot: true, start: posOf(20) });
    run(game, 60);
    expect(game.status).toBe('playing');
    expect(game.hits).toBeGreaterThan(10);
  });
});
