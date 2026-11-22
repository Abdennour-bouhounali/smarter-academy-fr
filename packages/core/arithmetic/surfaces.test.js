import { describe, it, expect } from 'vitest';
import {
  area, perimeter, boundaryEdges, isConnected, hollows, hasHole, isValid, liftCheck, dropCheck, moveCheck, touchesSide,
  canonical, congruent, boundaryLoop, minPerimeter, maxPerimeter, areaRange, formatHalves, floorHalves, halvesInTwo, validPairing, key,
} from './surfaces.js';

const rect = (r0, c0, h, w) => { const o = []; for (let r = 0; r < h; r += 1) for (let c = 0; c < w; c += 1) o.push([r0 + r, c0 + c]); return o; };
const line = (n) => rect(0, 0, 1, n);

/** Tous les polyominos libres de n cases (croissance + forme canonique) — n ≤ 12. */
const LEVELS = [null, [[[0, 0]]]];
function freePolyominoes(n) {
  for (let k = LEVELS.length; k <= n; k += 1) {
    const level = LEVELS[k - 1];
    const next = new Map();
    for (const cells of level) {
      const set = new Set(cells.map(([r, c]) => key(r, c)));
      for (const [r, c] of cells) {
        for (const [dr, dc] of [[-1, 0], [0, 1], [1, 0], [0, -1]]) {
          const nr = r + dr; const nc = c + dc;
          if (set.has(key(nr, nc))) continue;
          const grown = [...cells, [nr, nc]];
          const k2 = canonical(grown);
          if (!next.has(k2)) next.set(k2, grown);
        }
      }
    }
    LEVELS[k] = [...next.values()];
  }
  return LEVELS[n];
}

describe('surfaces — area, perimeter, validity', () => {
  it('the 2 × 6 yard: 12 tiles, fence 16; the 3 × 4 yard: fence 14', () => {
    expect(area(rect(2, 2, 2, 6))).toBe(12);
    expect(perimeter(rect(2, 2, 2, 6))).toBe(16);
    expect(perimeter(rect(0, 0, 3, 4))).toBe(14);
    expect(perimeter(line(12))).toBe(26);
    expect(perimeter([[0, 0]])).toBe(4);
  });
  it('a duplicate cell is counted once', () => {
    expect(area([[0, 0], [0, 0], [0, 1]])).toBe(2);
    expect(perimeter([[0, 0], [0, 0], [0, 1]])).toBe(6);
  });
  it('boundary edges name the side that has no neighbour', () => {
    const e = boundaryEdges([[0, 0], [0, 1]]);
    expect(e).toHaveLength(6);
    expect(e.filter((x) => x.side === 'E')).toEqual([{ r: 0, c: 1, side: 'E' }]);
  });
  it('connectivity is by sides: two tiles meeting at a corner are NOT connected', () => {
    expect(isConnected([[0, 0], [1, 1]])).toBe(false);
    expect(isConnected([[0, 0], [0, 1], [1, 1]])).toBe(true);
    expect(isConnected([])).toBe(false);
  });
  it('a hollow is an empty cell that 4-moves cannot take out of the yard', () => {
    const ring = rect(0, 0, 3, 3).filter(([r, c]) => !(r === 1 && c === 1));
    expect(hollows(ring)).toEqual([[1, 1]]);
    expect(isValid(ring)).toBe(false);
    // a notch opening to the outside is not a hollow
    const notch = rect(0, 0, 3, 3).filter(([r, c]) => !(r === 1 && c === 2));
    expect(hasHole(notch)).toBe(false);
    expect(isValid(notch)).toBe(true);
    // only a DIAGONAL way out is still a hollow (4-moves)
    const diag = [[0, 1], [1, 0], [1, 2], [2, 1], [1, 1], [0, 0], [0, 2], [2, 0]].filter(([r, c]) => !(r === 1 && c === 1));
    expect(hasHole(diag)).toBe(true);
  });
});

describe('surfaces — lifting and dropping a tile (the three refusals)', () => {
  const yard = rect(2, 2, 2, 6);
  it('lifting a corner of the 2 × 6 yard is legal, lifting a bridge is not (splits)', () => {
    expect(liftCheck(yard, [2, 2])).toEqual({ ok: true });
    const dumbbell = [[0, 0], [0, 1], [0, 2], [1, 1], [2, 0], [2, 1], [2, 2]];
    expect(liftCheck(dumbbell, [1, 1])).toEqual({ ok: false, reason: 'splits' });
    expect(liftCheck(line(5), [0, 2])).toEqual({ ok: false, reason: 'splits' });
    expect(liftCheck(line(5), [0, 4])).toEqual({ ok: true });
  });
  it('lifting the middle of a block opens a hole', () => {
    expect(liftCheck(rect(0, 0, 3, 3), [1, 1])).toEqual({ ok: false, reason: 'hole' });
  });
  it('lifting where there is no tile / the last tile', () => {
    expect(liftCheck(yard, [0, 0])).toEqual({ ok: false, reason: 'absent' });
    expect(liftCheck([[4, 4]], [4, 4])).toEqual({ ok: true });
  });
  it('dropping: a full side is needed (detached = a corner or nothing), an occupied cell is not a drop', () => {
    expect(dropCheck(yard, [1, 2])).toEqual({ ok: true });
    expect(dropCheck(yard, [1, 1])).toEqual({ ok: false, reason: 'detached' }); // corner only
    expect(dropCheck(yard, [5, 5])).toEqual({ ok: false, reason: 'detached' });
    expect(dropCheck(yard, [2, 2])).toEqual({ ok: false, reason: 'occupied' });
    expect(dropCheck([], [3, 3])).toEqual({ ok: true });
  });
  it('dropping a tile that closes a hollow is refused (hole)', () => {
    const horseshoe = [[0, 0], [0, 1], [0, 2], [1, 0], [1, 2], [2, 0]]; // (1,1) is open to the outside through (2,1)
    expect(hasHole(horseshoe)).toBe(false);
    expect(dropCheck(horseshoe, [2, 1])).toEqual({ ok: false, reason: 'hole' });
  });
  it('moveCheck: the first refusal wins, and a legal move keeps the area', () => {
    expect(moveCheck(yard, [2, 2], [1, 3])).toEqual({ ok: true });
    expect(moveCheck(line(5), [0, 2], [1, 2])).toEqual({ ok: false, reason: 'splits' });
    expect(moveCheck(yard, [2, 2], [0, 0])).toEqual({ ok: false, reason: 'detached' });
    expect(touchesSide(yard, [1, 2])).toBe(true);
  });
});

describe('surfaces — canonical shape', () => {
  it('equal under translation, rotation and reflection; different shapes differ', () => {
    const L = [[0, 0], [1, 0], [2, 0], [2, 1]];
    const rotated = [[0, 0], [0, 1], [0, 2], [1, 0]];
    const mirrored = [[0, 1], [1, 1], [2, 1], [2, 0]];
    const moved = L.map(([r, c]) => [r + 5, c + 7]);
    expect(congruent(L, rotated)).toBe(true);
    expect(congruent(L, mirrored)).toBe(true);
    expect(congruent(L, moved)).toBe(true);
    expect(congruent(L, [[0, 0], [0, 1], [0, 2], [0, 3]])).toBe(false);
    expect(canonical([])).toBe('');
  });
  it('2 × 6 turned is the same yard', () => {
    expect(congruent(rect(0, 0, 2, 6), rect(3, 3, 6, 2))).toBe(true);
  });
});

describe('surfaces — the fence walked in one go', () => {
  it('a loop with exactly `perimeter` sides, each used once, every step continues the previous one', () => {
    const shapes = [rect(0, 0, 3, 4), line(5), [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2]], [[0, 0], [0, 1], [0, 2], [1, 1], [2, 0], [2, 1], [2, 2]]];
    for (const cells of shapes) {
      const loop = boundaryLoop(cells);
      expect(loop).toHaveLength(perimeter(cells));
      for (let i = 0; i < loop.length; i += 1) {
        const a = loop[i]; const b = loop[(i + 1) % loop.length];
        expect([a.x1, a.y1]).toEqual([b.x0, b.y0]);
      }
      expect(new Set(loop.map((e) => `${e.x0},${e.y0}>${e.x1},${e.y1}`)).size).toBe(loop.length);
    }
  });
  it('holds for EVERY hole-free polyomino up to 7 tiles, including those with a pinched corner', () => {
    for (let n = 1; n <= 7; n += 1) {
      for (const cells of freePolyominoes(n)) {
        if (!isValid(cells)) continue;
        const loop = boundaryLoop(cells);
        expect(loop.length, canonical(cells)).toBe(perimeter(cells));
        for (let i = 0; i < loop.length; i += 1) {
          const a = loop[i]; const b = loop[(i + 1) % loop.length];
          expect([a.x1, a.y1]).toEqual([b.x0, b.y0]);
        }
      }
    }
  });
  it('a yard whose two lobes touch only at a corner (joined elsewhere) is still one loop', () => {
    const cells = [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2], [2, 1], [3, 1]];
    const loop = boundaryLoop(cells);
    expect(loop).toHaveLength(perimeter(cells));
  });
});

describe('surfaces — known values', () => {
  it('perimeter is always even; minPerimeter / maxPerimeter', () => {
    expect(minPerimeter(12)).toBe(14);
    expect(minPerimeter(9)).toBe(12);
    expect(minPerimeter(5)).toBe(10);
    expect(minPerimeter(1)).toBe(4);
    expect(maxPerimeter(12)).toBe(26);
    expect(() => minPerimeter(0)).toThrow();
  });
  it('areaRange(p): p = 12 → 5…9, p = 20 → 9…25, p = 4 → 1…1', () => {
    expect(areaRange(12)).toEqual({ min: 5, max: 9 });
    expect(areaRange(20)).toEqual({ min: 9, max: 25 });
    expect(areaRange(4)).toEqual({ min: 1, max: 1 });
    expect(() => areaRange(13)).toThrow();
  });
  it('EVERY 12-tile yard: perimeter even, in 14…26, and 14 only for the full 3 × 4 rectangle; 16 is reached by many', () => {
    const all = freePolyominoes(12).filter(isValid);
    expect(all.length).toBeGreaterThan(58000); // 63 600 free dodecominoes, about 4 700 have a hollow
    const by = new Map();
    for (const cells of all) {
      const p = perimeter(cells);
      expect(p % 2).toBe(0);
      expect(p).toBeGreaterThanOrEqual(14);
      expect(p).toBeLessThanOrEqual(26);
      by.set(p, (by.get(p) ?? 0) + 1);
    }
    expect(by.get(14)).toBe(1);
    expect(congruent(all.find((c) => perimeter(c) === 14), rect(0, 0, 3, 4))).toBe(true);
    expect(by.get(16)).toBeGreaterThan(5);
    expect(by.get(26)).toBeGreaterThan(1);
    expect([...by.keys()].sort((a, b) => a - b)).toEqual([14, 16, 18, 20, 22, 24, 26]);
  }, 120000);
  it('with a fence of exactly 12 sticks the reachable areas are exactly 5…9 (every value, nothing else)', () => {
    const seen = new Set();
    for (let n = 1; n <= 12; n += 1) {
      for (const cells of freePolyominoes(n)) if (isValid(cells) && perimeter(cells) === 12) seen.add(n);
    }
    expect([...seen].sort((a, b) => a - b)).toEqual([5, 6, 7, 8, 9]);
  }, 120000);
  it('the minimum perimeter formula agrees with enumeration for n ≤ 9', () => {
    for (let n = 1; n <= 9; n += 1) {
      const ps = freePolyominoes(n).filter(isValid).map(perimeter);
      expect(Math.min(...ps)).toBe(minPerimeter(n));
      expect(Math.max(...ps)).toBe(maxPerimeter(n));
    }
  });
});

describe('surfaces — the floor: halves and the double tile', () => {
  it('14 whole + 4 halves = 16 unit ①; formatHalves writes the decimal comma', () => {
    expect(formatHalves(floorHalves(14, 4))).toBe('16');
    expect(formatHalves(floorHalves(14, 3))).toBe('15,5');
    expect(formatHalves(0)).toBe('0');
    expect(formatHalves(1)).toBe('0,5');
    expect(() => formatHalves(-1)).toThrow();
  });
  it('21 cells = 10,5 unit ② for ANY pairing (10 doubles + a half; 9 doubles + 3 halves; 0 doubles + 21 halves)', () => {
    for (const doubles of [10, 9, 8, 5, 1, 0]) expect(formatHalves(halvesInTwo(21, doubles))).toBe('10,5');
    expect(() => halvesInTwo(21, 11)).toThrow();
    expect(formatHalves(halvesInTwo(18, 9))).toBe('9');
  });
  it('a pairing is valid when the pairs are side-by-side floor cells, disjoint', () => {
    const floor = rect(0, 0, 2, 3);
    expect(validPairing(floor, [[[0, 0], [0, 1]], [[1, 0], [1, 1]]])).toBe(true);
    expect(validPairing(floor, [[[0, 0], [1, 1]]])).toBe(false);
    expect(validPairing(floor, [[[0, 0], [0, 1]], [[0, 1], [0, 2]]])).toBe(false);
    expect(validPairing(floor, [[[0, 2], [0, 3]]])).toBe(false);
  });
});
