import { describe, expect, it } from 'vitest';
import { createOdd, pick, resultOf, step } from './sim.js';
import { makePuzzle } from './puzzle.js';
import { LIVES, SCHEDULE, timeLimit } from './constants.js';
import { maxPuzzles, maxRounds, perfectScore } from './bound.js';
import { perHit } from '../sniper/constants.js';
import { keyOf } from '../sniper/cards.js';
import { LEVELS, POSITIONS, posOf } from '../sniper/levels.js';

const DT = 1 / 60;
const run = (game, seconds, onEvent = () => {}) => {
  const end = (game.clock ?? 0) + seconds;
  while ((game.clock ?? 0) < end && game.status === 'playing') {
    game.clock = (game.clock ?? 0) + DT;
    for (const e of step(game, DT)) if (e) onEvent(e, game);
  }
};
/** Un joueur parfait et rapide : il touche « الدخيل » dès que l'énigme paraît. */
const perfect = (game) => { if (!game.reveal) pick(game, game.puzzle.oddIndex); };

describe('odd one out « الدخيل »', () => {
  it('every puzzle of every level has exactly ONE odd card, and all the others share one value', () => {
    for (const level of LEVELS) {
      for (let sub = 1; sub <= 3; sub += 1) {
        for (const seed of [11, 2026]) {
          for (const i of [0, 1, 2]) {
            const p = makePuzzle(seed, i, { level: level.n, sub });
            const where = `level ${level.n}/${sub} seed ${seed} puzzle ${i}`;
            expect(p.cards.length, where).toBeGreaterThanOrEqual(4);
            expect(p.cards.length, where).toBeLessThanOrEqual(5);
            expect(p.cards.filter((c) => c.odd), where).toHaveLength(1);
            const keys = new Set(p.cards.filter((c) => !c.odd).map((c) => keyOf(c.value)));
            expect(keys.size, where).toBe(1);
            expect([...keys][0], where).toBe(keyOf(p.common.value));
            expect(keyOf(p.cards[p.oddIndex].value), where).not.toBe(keyOf(p.common.value));
          }
        }
      }
    }
  });

  it('the odd card scores, an equal card or the clock costs a shield, and the answer stays on screen', () => {
    const game = createOdd(5, { start: posOf(20), warmup: false });
    const wrongIndex = game.puzzle.cards.findIndex((c) => !c.odd);
    expect(pick(game, wrongIndex)).toMatchObject({ type: 'wrong' });
    expect(game.lives).toBe(LIVES - 1);
    expect(pick(game, game.puzzle.oddIndex)).toBeNull();
    run(game, SCHEDULE.revealMs / 1000 + 0.05);
    expect(game.i).toBe(1);
    expect(pick(game, game.puzzle.oddIndex)).toMatchObject({ type: 'hit', points: perHit(20) });
    run(game, SCHEDULE.revealMs / 1000 + 0.05);
    run(game, timeLimit(game.i) + 0.05);
    expect(game.timeouts).toBe(1);
    expect(game.lives).toBe(LIVES - 2);
  });

  it('adapts every five puzzles and ends with no revive', () => {
    const climber = createOdd(9, { start: posOf(30), warmup: false });
    for (let n = 0; n < 10; n += 1) { perfect(climber); run(climber, SCHEDULE.revealMs / 1000 + 0.05); }
    expect(climber.rounds).toBe(2);
    expect(resultOf(climber).position).toBe(posOf(30) + 2);

    const lost = createOdd(9, { start: posOf(30), warmup: false });
    run(lost, 200);
    expect(lost.status).toBe('over');
    expect(step(lost, 1)).toEqual([]);
  });

  it('a perfect, fast player never goes above the server bound nor beyond the reachable rounds or level', () => {
    for (const start of [0, posOf(12), posOf(40, 2), POSITIONS - 2]) {
      const game = createOdd(3, { start });
      for (let n = 0; n < 60; n += 1) {
        perfect(game);
        run(game, SCHEDULE.revealMs / 1000 + DT);
        const seconds = game.clock;
        expect(game.score).toBeLessThanOrEqual(perfectScore(seconds, start));
        expect(game.i).toBeLessThanOrEqual(maxPuzzles(seconds));
        expect(game.rounds).toBeLessThanOrEqual(maxRounds(seconds));
        expect(game.peak).toBeLessThanOrEqual(Math.min(POSITIONS - 1, start + game.rounds));
      }
    }
  });

  it('never starts hard: five warm-up puzzles two levels below cost no shield', () => {
    const game = createOdd(6, { start: posOf(25) });
    expect(game.puzzle.level).toBe(23);
    for (let n = 0; n < 5; n += 1) {
      pick(game, game.puzzle.cards.findIndex((c) => !c.odd));
      run(game, SCHEDULE.revealMs / 1000 + 0.05);
    }
    expect(game.lives).toBe(LIVES);
    expect(game.puzzle.level).toBe(22);
  });

  it('is the same game for the same seed', () => {
    expect(makePuzzle(7, 3, { level: 15, sub: 2 })).toEqual(makePuzzle(7, 3, { level: 15, sub: 2 }));
    const auto = createOdd(4, { autopilot: true, start: posOf(33) });
    run(auto, 120);
    expect(auto.status).toBe('playing');
    expect(auto.hits).toBeGreaterThan(20);
  });
});
