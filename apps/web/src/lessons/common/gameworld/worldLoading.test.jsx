import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import WorldLoading, { readWorldClock } from './WorldLoading';

describe('the loading screen of a game world — one clock per lesson', () => {
  it('the bar never goes back and never reaches the end by itself', () => {
    let last = 0;
    for (let t = 0; t <= 120000; t += 500) {
      const { shown } = readWorldClock('clock-a', 0, 1000 + t);
      expect(shown).toBeGreaterThanOrEqual(last);
      last = shown;
    }
    expect(last).toBeLessThan(0.14); // stage 0 creeps toward stage 1, it never claims it
    expect(readWorldClock('clock-a', 4, 122000).shown).toBeGreaterThanOrEqual(0.9);
    expect(readWorldClock('clock-a', 4, 124000).shown).toBeLessThan(1);
  });

  it('a new instance goes on where the last one was: a stage never goes back, the time is kept', () => {
    readWorldClock('clock-b', 0, 10000);
    const up = readWorldClock('clock-b', 3, 11000);
    const next = readWorldClock('clock-b', 0, 12000); // the next boundary mounts with its own (lower) stage
    expect(next.stage).toBe(3);
    expect(next.shown).toBeGreaterThanOrEqual(up.shown);
    expect(next.elapsed).toBe(2000);
  });

  it('another lesson, or a visit long after, starts from nothing', () => {
    readWorldClock('clock-c', 4, 20000);
    expect(readWorldClock('clock-d', 0, 20500)).toMatchObject({ stage: 0, elapsed: 0 });
    readWorldClock('clock-c', 2, 21000);
    expect(readWorldClock('clock-c', 0, 60000)).toMatchObject({ stage: 0, elapsed: 0 });
  });
});

describe('what the student reads while the world arrives', () => {
  it('the lesson’s name without raw LaTeX, a bar, a sentence — and the place of a note already there', () => {
    const html = renderToString(<WorldLoading lessonId="render-a" title="La racine $\\sqrt{a}$" stage={1} />);
    expect(html).toContain('role="status"');
    expect(html).toContain('On prépare ton monde');
    expect(html).not.toMatch(/[\u0600-\u06ff]/);
    expect(html).not.toContain('dir="rtl"');
    expect(html).toContain('gw-loading__bar');
    expect(html).toContain('gw-loading__note');
    expect(html).not.toContain('\\sqrt');
    expect(html).not.toContain('data-gw-retry');
  });

  it('a load that gave up says so and offers to try again', () => {
    const html = renderToString(<WorldLoading lessonId="render-b" title="Leçon" failed />);
    expect(html).toContain('data-gw-loading="failed"');
    expect(html).toContain('data-gw-retry');
    expect(html).toContain('Réessaie');
  });

  it('the world is ready beneath: the screen is no longer a status and no longer marked as loading', () => {
    const html = renderToString(<WorldLoading lessonId="render-c" title="Leçon" stage={4} leaving over />);
    expect(html).not.toContain('data-gw-loading');
    expect(html).not.toContain('role="status"');
    expect(html).toContain('gw-loading--leaving');
  });
});
