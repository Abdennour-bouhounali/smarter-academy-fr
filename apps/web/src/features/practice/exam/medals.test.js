import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { medalFor, rankFor, tally } from './medals';

const cases = JSON.parse(readFileSync(new URL('./medals.fixture.json', import.meta.url), 'utf8'));

describe('médailles — la règle partagée avec le serveur', () => {
  for (const c of cases) it(c.name, () => expect(medalFor(c.in)).toBe(c.medal));

  it('compte les médailles et leurs points', () => {
    expect(tally(['gold', 'silver', null, 'gold', 'bronze'])).toEqual({ gold: 2, silver: 1, bronze: 1, points: 9 });
  });

  it('monte de rang par paliers de points', () => {
    expect(rankFor(0)).toMatchObject({ rank: 'novice', next: 'diligent', toNext: 15 });
    expect(rankFor(15)).toMatchObject({ rank: 'diligent', next: 'excellent' });
    expect(rankFor(79)).toMatchObject({ rank: 'excellent', toNext: 1 });
    expect(rankFor(300)).toMatchObject({ rank: 'champion', next: null, progress: 1 });
  });
});
