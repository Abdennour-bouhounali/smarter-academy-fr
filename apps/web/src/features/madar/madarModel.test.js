import { describe, expect, it } from 'vitest';
import { adjustmentKind, countsAsLeft, crashOptions, formatScore, gamesByCategory, heartSlots, isFreeGame, nextShipGoal, playBlocker, rankMovement, remainingMs, timerTone } from './madarModel';

describe('madarModel', () => {
  it('formats scores in grouped western digits', () => {
    expect(formatScore(12345)).toBe('12,345');
    expect(formatScore(-3)).toBe('0');
    expect(formatScore(undefined)).toBe('0');
  });

  it('lays out heart slots', () => {
    expect(heartSlots(2, 5)).toEqual([true, true, false, false, false]);
  });

  it('offers revive with a heart, refuel without one, nothing past the limit', () => {
    expect(crashOptions({ hearts: 2, revives: 0, maxRevives: 2 })).toEqual({ revive: true, refuelToRevive: false, revivesLeft: 2 });
    expect(crashOptions({ hearts: 0, revives: 1, maxRevives: 2 })).toEqual({ revive: false, refuelToRevive: true, revivesLeft: 1 });
    expect(crashOptions({ hearts: 3, revives: 2, maxRevives: 2 })).toEqual({ revive: false, refuelToRevive: false, revivesLeft: 0 });
  });

  it('reports only a real rank movement', () => {
    expect(rankMovement(null)).toBeNull();
    expect(rankMovement({ before: null, after: 3 })).toEqual({ kind: 'up', to: 3 });
    expect(rankMovement({ before: 4, after: 2 })).toEqual({ kind: 'up', to: 2 });
    expect(rankMovement({ before: 2, after: 2 })).toEqual({ kind: 'same', to: 2 });
  });

  it('picks the closest locked ship as the next goal', () => {
    const ships = [
      { id: 'sahm', unlocked: true, rule: null },
      { id: 'saqr', unlocked: false, rule: { kind: 'best', threshold: 800, progress: 400 } },
      { id: 'mudhannab', unlocked: false, rule: { kind: 'refuel', threshold: 5, progress: 4 } },
    ];
    expect(nextShipGoal(ships).id).toBe('mudhannab');
    expect(nextShipGoal([{ id: 'sahm', unlocked: true, rule: null }])).toBeNull();
  });

  it('says why a run cannot start', () => {
    expect(playBlocker(null)).toBe('loading');
    expect(playBlocker({ available: false, reason: 'disabled_by_teacher' })).toBe('disabled_by_teacher');
    expect(playBlocker({ available: true, runsToday: 30, dailyRunCap: 30, hearts: 2 })).toBe('daily_cap');
    expect(playBlocker({ available: true, runsToday: 1, dailyRunCap: 30, hearts: 0 })).toBe('no_hearts');
    expect(playBlocker({ available: true, runsToday: 1, dailyRunCap: 30, hearts: 1 })).toBeNull();
  });

  it('a free maths game needs no heart, a game closed for the class or for this student blocks', () => {
    const games = [
      { id: 'orbit', category: 'fun', free: false, enabled: true, closedBy: null },
      { id: 'defense', category: 'fun', free: false, enabled: false, closedBy: 'student' },
      { id: 'explorer', category: 'fun', free: false, enabled: false, closedBy: 'class' },
      { id: 'sniper', category: 'math', free: true, enabled: true, closedBy: null },
    ];
    const state = { available: true, runsToday: 1, dailyRunCap: 30, hearts: 0, games };
    expect(playBlocker(state, 'orbit')).toBe('no_hearts');
    expect(playBlocker(state, 'sniper')).toBeNull();
    expect(playBlocker({ ...state, runsToday: 30 }, 'sniper')).toBe('daily_cap');
    expect(playBlocker(state, 'defense')).toBe('game_disabled_for_student');
    expect(playBlocker(state, 'explorer')).toBe('game_disabled');
    expect(isFreeGame(state, 'sniper')).toBe(true);
    expect(isFreeGame({}, 'sniper')).toBe(true);
    expect(isFreeGame(state, 'orbit')).toBe(false);
    const groups = gamesByCategory(games);
    expect(groups.fun.map((g) => g.id)).toEqual(['orbit', 'defense', 'explorer']);
    expect(groups.math.map((g) => g.id)).toEqual(['sniper']);
  });
});

describe('madarModel — integrity helpers', () => {
  it('counts down from the server time limit and never below zero', () => {
    expect(remainingMs(60, 15_000)).toBe(45_000);
    expect(remainingMs(60, 90_000)).toBe(0);
  });

  it('turns amber then red near the end', () => {
    expect(timerTone(50_000, 60_000)).toBe('calm');
    expect(timerTone(20_000, 60_000)).toBe('warn');
    expect(timerTone(9_000, 60_000)).toBe('danger');
  });

  it('ignores a very short absence (notification, keyboard)', () => {
    expect(countsAsLeft(800)).toBe(false);
    expect(countsAsLeft(1500)).toBe(true);
  });

  it('names a teacher adjustment by its applied effect', () => {
    expect(adjustmentKind(2)).toBe('gave');
    expect(adjustmentKind(-3)).toBe('took');
    expect(adjustmentKind(0)).toBe('warned');
  });
});
