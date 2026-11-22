// An answer sheet that does not fit at the 12 px floor is split into LEAVES at a boundary between two answers (sheetLeaves.js).
import { describe, it, expect } from 'vitest';
import { splitLeaves, leafIndex, quietOnLeaves, keepLeaf } from './sheetLeaves';

const covers = (leaves, n) => JSON.stringify(leaves.flat()) === JSON.stringify(Array.from({ length: n }, (_, i) => i));
const tallest = (leaves, h, fixed, gap) =>
  Math.max(...leaves.map((l) => fixed + l.reduce((t, i) => t + h[i], 0) + gap * (l.length - 1)));

describe('splitLeaves — where the answer sheet is split', () => {
  it('a sheet that fits stays ONE leaf (no control)', () => {
    expect(splitLeaves([50, 50, 50], { room: 400, fixed: 60, gap: 4 })).toEqual([[0, 1, 2]]);
    expect(splitLeaves([], { room: 400 })).toEqual([[]]);
  });

  it('eight answers that need 684 px in 581: two leaves, every answer once, in order, each leaf holding', () => {
    // the shape of a long sheet: three plain answers, five fractions (taller), a heading
    const h = [55, 60, 95, 95, 55, 95, 60, 60];
    const opt = { room: 581, fixed: 70, gap: 3 };
    const leaves = splitLeaves(h, opt);
    expect(leaves).toHaveLength(2);
    expect(covers(leaves, h.length)).toBe(true);
    expect(tallest(leaves, h, opt.fixed, opt.gap)).toBeLessThanOrEqual(opt.room);
  });

  it('splits evenly — never seven answers on the first leaf and one alone on the second', () => {
    const h = [50, 50, 50, 50, 50, 50, 50, 50];
    const leaves = splitLeaves(h, { room: 380, fixed: 20, gap: 0 }); // 7 fit on a leaf, 8 do not
    expect(leaves.map((l) => l.length)).toEqual([4, 4]);
  });

  it('as few leaves as the room allows', () => {
    const h = Array(9).fill(100);
    const leaves = splitLeaves(h, { room: 320, fixed: 0, gap: 0 }); // three a leaf
    expect(leaves.map((l) => l.length)).toEqual([3, 3, 3]);
  });

  it('an answer taller than the room alone is a leaf of its own', () => {
    const leaves = splitLeaves([50, 700, 50], { room: 300, fixed: 10, gap: 0 });
    expect(covers(leaves, 3)).toBe(true);
    expect(leaves.find((l) => l.includes(1))).toEqual([1]);
  });
});

describe('the leaves on screen', () => {
  it('leafIndex: the leaf of every answer', () => {
    expect(
      leafIndex(
        [
          [0, 1],
          [2, 3, 4],
        ],
        5,
      ),
    ).toEqual([0, 0, 1, 1, 1]);
  });

  it('a fraction line is said once per leaf — on each leaf that has a fraction', () => {
    const keys = ['f', null, 'f', 'f', 'g', 'f'];
    expect(
      [
        ...quietOnLeaves(keys, [
          [0, 1, 2],
          [3, 4, 5],
        ]),
      ].sort(),
    ).toEqual([2, 5]);
    expect([...quietOnLeaves(keys, [[0, 1, 2, 3, 4, 5]])].sort()).toEqual([2, 3, 5]);
  });

  it('after a new split, the leaf shown is the one that holds what was on screen', () => {
    expect(
      keepLeaf(null, 0, [
        [0, 1],
        [2, 3],
      ]),
    ).toBe(0);
    expect(
      keepLeaf(
        [
          [0, 1, 2],
          [3, 4, 5],
        ],
        1,
        [
          [0, 1],
          [2, 3],
          [4, 5],
        ],
      ),
    ).toBe(1);
  });
});
