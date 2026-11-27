import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LESSONS, UNITS } from '../packages/core/curriculum/fr/net/learningNet.js';

// The generation queue (written by learning-net-queue.mjs): while 4e–6e have no lesson, it is the 3e year, unit by unit.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const { queue } = JSON.parse(readFileSync(join(ROOT, 'docs/curriculum/generation-queue.json'), 'utf8'));

describe('the generation queue', () => {
  it('holds every planned lesson once, in the order of the units of the year, each synthesis closing its unit', () => {
    const planned = LESSONS.filter((l) => l.status === 'planned');
    expect(queue.map((q) => q.code).sort()).toEqual(planned.map((l) => l.code).sort());
    const unitRank = new Map(UNITS.map((u) => [u.code, u.order]));
    const ranks = queue.map((q) => unitRank.get(q.unit));
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
    for (const u of UNITS) {
      const ofUnit = queue.filter((q) => q.unit === u.code);
      // a unit whose synthesis is BUILT (the first one, 2026-11-26) has nothing left to close: it is out of the queue
      const synthesisPlanned = planned.some((l) => l.code === u.synthesisLessonCode);
      if (synthesisPlanned) expect(ofUnit.at(-1)?.code, u.code).toBe(u.synthesisLessonCode);
      else
        expect(
          ofUnit.map((q) => q.code),
          u.code,
        ).not.toContain(u.synthesisLessonCode);
    }
  });

  it('is written in French, never in Arabic', () => {
    const md = readFileSync(join(ROOT, 'docs/curriculum/GENERATION_QUEUE.md'), 'utf8');
    expect(md).not.toMatch(/[؀-ۿ]/);
    expect(JSON.stringify(queue)).not.toMatch(/[؀-ۿ]/);
  });
});
