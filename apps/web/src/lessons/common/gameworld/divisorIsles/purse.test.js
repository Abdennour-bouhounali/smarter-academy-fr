import { describe, expect, it } from 'vitest';
import { DivisorIslesGame } from './Game';
import { T } from './strings';

// The purse chip names the bridges it pays: « Pièces des deux ponts » for a convoy of two, « Pièces du pont » for a convoy of ONE (lesson
// 8's workshop bridges and its store — the story walk saw « Pièces des deux ponts » over a single bridge, 2026-11-20).
const P = DivisorIslesGame.prototype;
const game = (segs, purse) => ({ segs, convoys: { c: { purse } }, convoyOf: P.convoyOf });

describe('the purse of a convoy', () => {
  it('counts the bridges it pays, and the coins their standing bridges spent', () => {
    const one = [{ convoy: 'c', a: 99, complete: true, builtWith: 33 }];
    expect(P.purseOf.call(game(one, 3), one[0])).toEqual({ of: 3, left: 0, n: 1 });
    const two = [
      { convoy: 'c', a: 24, complete: true, builtWith: 6 },
      { convoy: 'c', a: 36, complete: false, builtWith: null },
    ];
    expect(P.purseOf.call(game(two, 12), two[1])).toEqual({ of: 12, left: 8, n: 2 });
  });
  it('counts a standing WALKWAY as the planks of its crews to the pillar, not as one coin', () => {
    const quai = [{ convoy: 'c', kind: 'walkway', crews: [16, 20], a: 80, complete: true, builtWith: 80 }];
    expect(P.purseOf.call(game(quai, 14), quai[0])).toEqual({ of: 14, left: 5, n: 1 });
    const open = [{ convoy: 'c', kind: 'walkway', crews: [16, 20], a: 0, complete: false, builtWith: null }];
    expect(P.purseOf.call(game(open, 14), open[0])).toEqual({ of: 14, left: 14, n: 1 });
  });
  it('has a word for one bridge and for two', () => {
    expect(T.purse.one).toBe('Pièces du pont');
    expect(T.purse.label).toBe('Pièces des deux ponts');
  });
});
