import { describe, expect, it } from 'vitest';
import { createExplorer, step, revive, scoreOf, resultOf, levelData, LEVEL_COUNT, PHYSICS, SCORING } from './sim.js';
import { botInput } from './bot.js';
import { solveLevel } from './solver.js';

/** Miroir de ExplorerLevels::maxScore / minDurationMs (apps/api). */
function maxScore(n) {
  const l = levelData(n);
  const count = (ch) => l.rows.reduce((s, r) => s + r.split(ch).length - 1, 0);
  return count('c') * SCORING.crystal + count('?') * SCORING.block + (count('e') + count('f')) * SCORING.enemy
    + count('P') * SCORING.power + SCORING.completeBase + SCORING.completePerLevel * n + l.time * SCORING.timeBonusPerSecond;
}
function minDurationS(n) {
  const l = levelData(n);
  const find = (ch) => l.rows.map((r) => r.indexOf(ch)).find((x) => x >= 0);
  return ((find('G') - find('@')) / PHYSICS.runSpeed) * 0.8;
}

const play = (g, seconds, input) => {
  for (let i = 0; i < seconds * 60 && g.status === 'running'; i++) step(g, 1 / 60, typeof input === 'function' ? input(g) : input);
};

describe('explorer platformer', () => {
  it('loads every level with a start, a goal and a timer', () => {
    expect(LEVEL_COUNT).toBe(12);
    for (let n = 1; n <= LEVEL_COUNT; n++) {
      const g = createExplorer(n);
      expect(g.goal).not.toBeNull();
      expect(g.timeLeft).toBeGreaterThan(30);
      expect(g.totalCrystals).toBeGreaterThan(0);
    }
  });

  it('the astronaut lands on the ground and runs forward', () => {
    const g = createExplorer(1);
    play(g, 0.5, {});
    expect(g.player.onGround).toBe(true);
    const x0 = g.player.x;
    play(g, 0.5, { forward: true });
    expect(g.player.x).toBeGreaterThan(x0 + 2);
  });

  it('a held jump goes higher than a tapped one', () => {
    const peak = (holdFrames) => {
      const g = createExplorer(1);
      play(g, 0.5, {});
      const y0 = g.player.y;
      let top = y0;
      for (let i = 0; i < 60; i++) {
        step(g, 1 / 60, { jump: i < holdFrames });
        top = Math.min(top, g.player.y);
      }
      return y0 - top;
    };
    expect(peak(30)).toBeGreaterThan(2.2);
    expect(peak(30)).toBeGreaterThan(peak(2) + 1);
  });

  it('running off into a pit is a death, and revive returns to the checkpoint', () => {
    const g = createExplorer(1);
    play(g, 30, { forward: true });
    expect(g.status).toBe('dead');
    expect(revive(g)).toBe(true);
    expect(g.status).toBe('running');
    expect(g.player.invuln).toBeGreaterThan(0);
  });

  it('every level can be completed with the real physics (search over copies of the world)', () => {
    for (let n = 1; n <= LEVEL_COUNT; n++) {
      const r = solveLevel(n);
      expect(r.solved, `level ${n} stops at x=${r.furthest}`).toBe(true);
      // Une partie gagnante ne dépasse jamais le maximum du serveur, ni ne va plus vite que son minimum.
      expect(scoreOf(r.state)).toBeLessThanOrEqual(maxScore(n));
      expect(r.state.t).toBeGreaterThanOrEqual(minDurationS(n));
      expect(resultOf(r.state).completed).toBe(true);
    }
  });

  it('the simple bot behind the menu never breaks the rules either', () => {
    const g = createExplorer(1);
    for (let i = 0; i < 120 * 60 && g.status !== 'won'; i++) {
      step(g, 1 / 60, botInput(g));
      if (g.status === 'dead') revive(g);
    }
    expect(scoreOf(g)).toBeLessThanOrEqual(maxScore(1));
    expect(resultOf(g).crystals).toBeLessThanOrEqual(g.totalCrystals);
  });
});
