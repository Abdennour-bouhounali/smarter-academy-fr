import { describe, expect, it } from 'vitest';
import { DivisorIslesGame } from './Game';
import { T } from './strings';

// The purse chip names the bridges it pays: « قطع الجسرين » for a convoy of two, « قطع الجسر » for a convoy of ONE (lesson
// 8's workshop bridges and its store — the story walk saw « قطع الجسرين » over a single bridge, 2026-11-20).
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
  it('has a word for one bridge and for two', () => {
    expect(T.purse.one).toBe('قطع الجسر');
    expect(T.purse.label).toBe('قطع الجسرين');
  });
});
