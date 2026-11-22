import { describe, expect, it } from 'vitest';
import { AWAY_CAP_MS, IDLE_AFTER_MS, IDLE_CAP_MS, MAX_STEP_MS, createClock, drain, step, surfaceFor } from './studyClock';

const at = (clock, now, over = {}) => step(clock, { now, visible: true, focused: true, lastInputAt: now, surface: 'lesson', ...over });

describe('surfaceFor', () => {
  it('maps the student space to surfaces and ignores public pages', () => {
    expect(surfaceFor('/courses/moyen/4am/ansab/qasim-adad-tabii/1')).toBe('lesson');
    expect(surfaceFor('/courses/moyen/4am/ansab/units/u1')).toBe('other');
    expect(surfaceFor('/courses')).toBe('other');
    expect(surfaceFor('/espace/pratique/qasim/session/1')).toBe('practice');
    expect(surfaceFor('/espace/defi')).toBe('challenge');
    expect(surfaceFor('/espace/atelier/grapher')).toBe('lab');
    expect(surfaceFor('/espace/jeux/orbit')).toBe('game');
    expect(surfaceFor('/espace')).toBe('other');
    expect(surfaceFor('/books')).toBeNull();
    expect(surfaceFor('/')).toBeNull();
  });
});

describe('studyClock', () => {
  it('counts active time while the page is visible, focused and touched', () => {
    let c = createClock(0);
    c = at(c, 5_000);
    c = at(c, 10_000);
    expect(c.buckets.lesson.active).toBe(10_000);
  });

  it('turns into idle after the input window, and stops counting idle at the cap', () => {
    let c = createClock(0);
    const lastInputAt = 0;
    c = step(c, { now: IDLE_AFTER_MS, visible: true, focused: true, lastInputAt, surface: 'lesson' });
    expect(c.buckets.lesson.active).toBe(IDLE_AFTER_MS);
    let t = IDLE_AFTER_MS;
    for (let i = 0; i < 20; i++) {
      t += 60_000;
      c = step(c, { now: t, visible: true, focused: true, lastInputAt, surface: 'lesson' });
    }
    expect(c.buckets.lesson.idle).toBe(IDLE_CAP_MS);
  });

  it('counts a leave once per departure and caps a long absence', () => {
    let c = at(createClock(0), 1_000);
    let t = 1_000;
    for (let i = 0; i < 60; i++) {
      t += 60_000;
      c = at(c, t, { visible: false });
    }
    expect(c.buckets.lesson.leaves).toBe(1);
    expect(c.buckets.lesson.away).toBe(AWAY_CAP_MS);
    c = at(c, t + 1_000);
    c = at(c, t + 2_000, { focused: false });
    expect(c.buckets.lesson.leaves).toBe(2);
  });

  it('never lets one step cover more than MAX_STEP_MS (sleep, frozen tab)', () => {
    const c = at(createClock(0), 8 * 3600_000);
    expect(c.buckets.lesson.active).toBe(MAX_STEP_MS);
  });

  it('counts nothing outside the learning space', () => {
    const c = at(createClock(0), 5_000, { surface: null });
    expect(c.buckets).toEqual({});
  });

  it('drains whole seconds and keeps the remainder for the next beat', () => {
    let c = at(createClock(0), 2_500);
    const first = drain(c);
    expect(first.segments).toEqual([{ surface: 'lesson', active: 2, idle: 0, away: 0, leaves: 0 }]);
    c = at(first.clock, 3_100);
    expect(drain(c).segments[0].active).toBe(1);
    expect(drain(drain(c).clock).segments).toEqual([]);
  });
});
