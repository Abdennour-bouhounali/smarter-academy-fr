import { describe, it, expect } from 'vitest';
import {
  valueOf, isComplete, bestArrangement, worstArrangement, maxValue, minValue, blockCounts, barPct,
  duelScale, swap, placeNext, remainingCards, newHand, makeRng, canonicalCuts, readGroups, cutsAreCanonical,
  placeOf,
} from './cardUtils';

const HAND_A = [3, 9, 1, 2];
const HAND_B = [1, 2, 3, 4, 5];

function permutations(arr) {
  if (arr.length <= 1) return [arr];
  return arr.flatMap((d, i) => permutations([...arr.slice(0, i), ...arr.slice(i + 1)]).map((p) => [d, ...p]));
}

describe('valueOf / placeOf', () => {
  it('reads the slots left to right as a base-10 number', () => {
    expect(valueOf([9, 3, 2, 1])).toBe(9321);
    expect(valueOf([1, 2, 3, 4, 5])).toBe(12345);
  });
  it('counts an empty slot as 0 so the bar grows as cards are placed', () => {
    expect(valueOf([9, null, null, null])).toBe(9000);
    expect(valueOf([null, null, null, null])).toBe(0);
    expect(isComplete([9, null, 2, 1])).toBe(false);
    expect(isComplete([9, 3, 2, 1])).toBe(true);
  });
  it('gives each slot its place value', () => {
    expect([0, 1, 2, 3].map((i) => placeOf(i, 4))).toEqual([1000, 100, 10, 1]);
  });
});

describe('best / worst arrangement', () => {
  it('finds 9 321 and 1 239 for the opening hand', () => {
    expect(bestArrangement(HAND_A)).toEqual([9, 3, 2, 1]);
    expect(worstArrangement(HAND_A)).toEqual([1, 2, 3, 9]);
  });
  it('is the true extremum over all 24 arrangements', () => {
    const values = permutations(HAND_A).map(valueOf);
    expect(Math.max(...values)).toBe(maxValue(HAND_A));
    expect(Math.min(...values)).toBe(minValue(HAND_A));
  });
  it('never opens the smallest number with a 0', () => {
    expect(worstArrangement([0, 5, 2, 0])).toEqual([2, 0, 0, 5]);
    expect(minValue([0, 5, 2, 0])).toBe(2005);
  });
  it('THE DUEL: the smallest 5-card number beats the largest 4-card number, for every hand without 0', () => {
    const rng = makeRng(42);
    for (let k = 0; k < 500; k += 1) {
      const four = newHand(rng, 4);
      const five = newHand(rng, 5);
      expect(minValue(five)).toBeGreaterThan(maxValue(four));
    }
    expect(minValue(HAND_B)).toBe(12345);
    expect(maxValue(HAND_A)).toBe(9321);
  });
});

describe('blockCounts — the material never exceeds 9 of a kind', () => {
  it('maps a 4-slot arrangement to milliers / centaines / dizaines / unités', () => {
    expect(blockCounts([9, 3, 2, 1])).toEqual({ UM: 9, C: 3, D: 2, U: 1 });
    expect(blockCounts([9, null, null, null])).toEqual({ UM: 9, C: 0, D: 0, U: 0 });
  });
  it('right-aligns shorter arrangements (one digit moving across the strip)', () => {
    expect(blockCounts([8])).toEqual({ UM: 0, C: 0, D: 0, U: 8 });
    expect(blockCounts([8, 0])).toEqual({ UM: 0, C: 0, D: 8, U: 0 });
  });
  it('stays ≤ 9 per kind over every arrangement of every hand', () => {
    const rng = makeRng(7);
    for (let k = 0; k < 200; k += 1) {
      permutations(newHand(rng, 4)).forEach((p) => {
        Object.values(blockCounts(p)).forEach((n) => expect(n).toBeLessThanOrEqual(9));
      });
    }
  });
});

describe('bars — every reachable state has a valid layout', () => {
  it('never exceeds 100 % on the 9 999 scale', () => {
    permutations(HAND_A).forEach((p) => {
      const pct = barPct(valueOf(p), 9999);
      expect(pct).toBeGreaterThan(0);
      expect(pct).toBeLessThanOrEqual(100);
    });
  });
  it('duel scale contains both bars whatever B does', () => {
    permutations(HAND_B).forEach((p) => {
      const b = valueOf(p);
      const scale = duelScale(9321, b);
      expect(barPct(9321, scale)).toBeLessThanOrEqual(100);
      expect(barPct(b, scale)).toBe(100);
    });
  });
  it('is safe on degenerate inputs', () => {
    expect(barPct(5, 0)).toBe(0);
    expect(barPct(NaN, 10)).toBe(0);
    expect(duelScale(0, 0)).toBe(1);
  });
});

describe('gestures', () => {
  it('places into the first empty slot and swaps without mutating', () => {
    const s0 = [null, null, null, null];
    const s1 = placeNext(s0, 9);
    expect(s1).toEqual([9, null, null, null]);
    expect(s0).toEqual([null, null, null, null]);
    const full = [9, 3, 2, 1];
    expect(placeNext(full, 5)).toBe(full);
    expect(swap(full, 0, 3)).toEqual([1, 3, 2, 9]);
    expect(full).toEqual([9, 3, 2, 1]);
  });
  it('knows which cards are still in hand, one card at a time', () => {
    expect(remainingCards(HAND_A, [9, null, null, null])).toEqual([3, 1, 2]);
    expect(remainingCards([5, 5, 2], [5, null, null])).toEqual([5, 2]);
  });
  it('deals distinct non-zero digits, reproducibly', () => {
    const a = newHand(makeRng(11), 4);
    const b = newHand(makeRng(11), 4);
    expect(a).toEqual(b);
    expect(new Set(a).size).toBe(4);
    a.forEach((d) => expect(d).toBeGreaterThanOrEqual(1));
  });
});

describe('class cuts (Module 3)', () => {
  it('cuts every 3 digits from the right', () => {
    expect(canonicalCuts(4)).toEqual([1]);
    expect(canonicalCuts(5)).toEqual([2]);
    expect(canonicalCuts(6)).toEqual([3]);
    expect(canonicalCuts(7)).toEqual([1, 4]);
    expect(canonicalCuts(3)).toEqual([]);
  });
  it('reads any grouping, right or wrong', () => {
    expect(readGroups('2350700', [1, 4])).toEqual(['2', '350', '700']);
    expect(readGroups('2350700', [3, 6])).toEqual(['235', '070', '0']);
    expect(readGroups('3482', [])).toEqual(['3482']);
  });
  it('accepts only the canonical cuts, in any order', () => {
    expect(cutsAreCanonical(7, [4, 1])).toBe(true);
    expect(cutsAreCanonical(7, [3, 6])).toBe(false);
    expect(cutsAreCanonical(7, [1])).toBe(false);
  });
});
