import { describe, it, expect } from 'vitest';
import { divmod } from '@smarter-academy/core/arithmetic/divisibility.js';
import * as L from './digitCards';

const GRID = { from: 0, to: 48, columns: 7, divisors: [2, 5, 3] };
const CARDS = { digits: [4, 5, 9, 3], divisors: [2, 3, 5, 4, 9] };

/** Every tap of the colouring d on the whole table, in order. */
const tapAll = (s0, d) => {
  let s = L.openColouring(s0, s0.divisors.indexOf(d));
  for (let n = s.from; n <= s.to; n += 1) s = L.tapCell(s, n);
  return s;
};

/** Build the number `digitsInOrder` on the slots (each digit is one card). */
const build = (s0, digitsInOrder) => digitsInOrder.reduce((s, x, slot) => L.placeCard(s, s.digits.indexOf(x), slot), s0);

describe('digit-cards — arithmetic: the remainder decides, always', () => {
  it('equations and digit readings', () => {
    expect(L.equationText(21, 2)).toBe('21 = 2 × 10 + 1');
    expect(L.equationText(42, 3)).toBe('42 = 3 × 14');
    expect(L.equationWithRemainder(42, 3)).toBe('42 = 3 × 14 + 0');
    expect(L.equationText(0, 5)).toBe('0 = 5 × 0');
    expect(L.digitsOf(9534)).toEqual([9, 5, 3, 4]);
    expect(L.digitsOf(0)).toEqual([0]);
    expect(L.digitSum(9534)).toBe(21);
    expect(L.unitsDigit(47)).toBe(7);
  });
});

describe('digit-cards — grid (نشاط 4: 0 → 48, 7 columns)', () => {
  it('every multiple of 2, 3, 5 in 0..48 is found by the logic, and only those are accepted', () => {
    let s = L.initGrid(GRID);
    for (const d of [2, 5, 3]) {
      s = tapAll(s, d);
      const expected = [];
      for (let n = 0; n <= 48; n += 1) if (n % d === 0) expected.push(n);
      expect(L.multiplesOf(d, 0, 48)).toEqual(expected);
      expect(s.found[d]).toEqual(expected);
      expect(L.colouringComplete(s, d)).toBe(true);
    }
    expect(L.multiplesOf(2, 0, 48)).toHaveLength(25);
    expect(L.multiplesOf(5, 0, 48)).toHaveLength(10);
    expect(L.multiplesOf(3, 0, 48)).toHaveLength(17);
    expect(L.gridDiscoveryReady(s)).toBe(true);
    expect(L.discoveryReady(s)).toBe(true);
  });

  it('every refusal carries the right remainder, and the payload is exactly { mode, n, d, r, ok }', () => {
    let s = L.initGrid(GRID);
    for (const d of [2, 5, 3]) s = tapAll(s, d);
    expect(s.trials).toHaveLength(49 * 3);
    for (const tr of s.trials) {
      const { r } = divmod(tr.n, tr.d);
      expect(tr.r).toBe(r);
      expect(tr.ok).toBe(r === 0);
      expect(Object.keys(L.trialEvidence(tr))).toEqual(['mode', 'n', 'd', 'r', 'ok']);
    }
    let g = L.openColouring(L.initGrid(GRID), 0);
    g = L.tapCell(g, 21);
    expect(g.last).toMatchObject({ n: 21, d: 2, q: 10, r: 1, ok: false });
    expect(L.equationText(21, 2)).toBe('21 = 2 × 10 + 1');
    expect(g.found[2]).toEqual([]);
  });

  it('the colourings open in the textbook order; a tap before opening is nothing; a re-tap is not a trial', () => {
    let s = L.initGrid(GRID);
    expect(L.tapCell(s, 4)).toBe(s);
    expect(L.canOpen(s, 1)).toBe(false);
    expect(L.openColouring(s, 1)).toBe(s);
    s = L.openColouring(s, 0);
    s = L.tapCell(s, 4);
    s = L.tapCell(s, 4);
    expect(s.trials).toHaveLength(1);
    expect(s.last.again).toBe(true);
    s = tapAll(s, 2);
    expect(L.canOpen(s, 1)).toBe(true);
    expect(L.canOpen(s, 2)).toBe(false);
  });

  it('« أكمل » only after 5 cells coloured by hand; revealed cells are not trials', () => {
    let s = L.openColouring(L.initGrid(GRID), 0);
    for (const n of [0, 2, 4, 6]) s = L.tapCell(s, n);
    expect(L.canReveal(s)).toBe(false);
    expect(L.reveal(s)).toBe(s);
    s = L.tapCell(s, 7); // refused: does not count
    expect(L.canReveal(s)).toBe(false);
    s = L.tapCell(s, 8);
    expect(L.canReveal(s)).toBe(true);
    const n = s.trials.length;
    s = L.reveal(s);
    expect(s.trials).toHaveLength(n);
    expect(L.colouringComplete(s, 2)).toBe(true);
    expect(s.revealed[2]).toHaveLength(25 - 5);
    expect(L.canReveal(s)).toBe(false);
  });

  it('the ledger: units digits for 2 and 5; for 3 every units digit appears, and the digit sums repeat', () => {
    let s = L.initGrid(GRID);
    for (const d of [2, 5, 3]) s = tapAll(s, d);
    expect(L.ledger(s, 2)).toMatchObject({ units: [0, 2, 4, 6, 8], sums: null, count: 25, total: 25 });
    expect(L.ledger(s, 5)).toMatchObject({ units: [0, 5], sums: null, count: 10 });
    const l3 = L.ledger(s, 3);
    expect(l3.units).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(l3.sums).toEqual([0, 3, 6, 9, 12]);
    for (const x of l3.sums) expect(x % 3).toBe(0);
  });

  it('refutations from the student\'s own cells: same column, same units digit', () => {
    let s = L.initGrid(GRID);
    s = L.openColouring(s, 0);
    s = L.tapCell(s, 24);
    const col = L.columnRefutation(s);
    expect(col).toMatchObject({ d: 2, m: 24 });
    expect(L.columnOf(s, col.n)).toBe(L.columnOf(s, 24));
    expect(col.n % 2).toBe(1);
    for (const d of [2, 5]) s = tapAll(s, d);
    s = L.openColouring(s, 2);
    s = L.tapCell(s, 12);
    const u = L.unitsRefutation(s);
    expect(u).toMatchObject({ d: 3, m: 12, u: 2 });
    expect(u.n % 10).toBe(2);
    expect(u.n % 3).not.toBe(0);
    expect(L.unitsRefutation(L.initGrid(GRID))).toBeNull();
  });

  it('the table layout: 7 × 7 cells of ≥ 40 px fit 280 px, swept over widths', () => {
    for (const width of [280, 300, 320, 390, 640, 1000]) {
      const g = L.gridLayout({ count: 49, columns: 7, width, maxHeight: 600 });
      expect(g.rows).toBe(7);
      expect(g.cell, `width ${width}`).toBeGreaterThanOrEqual(40);
      expect(g.width).toBeLessThanOrEqual(width);
      expect(g.width).toBe(g.cell * 7);
    }
    expect(L.gridLayout({ count: 49, columns: 7, width: 280 }).cell).toBe(40);
    // a short screen keeps the 40 px floor; a narrow box never overflows
    expect(L.gridLayout({ count: 49, columns: 7, width: 400, maxHeight: 200 }).cell).toBe(40);
    expect(L.gridLayout({ count: 49, columns: 7, width: 266 }).width).toBeLessThanOrEqual(266);
  });
});

describe('digit-cards — cards (تمرين 26: 4, 5, 9, 3)', () => {
  it('all 24 arrangements checked for 2, 3, 4, 5, 9: the three maxima, none for 4 and 9', () => {
    const all = L.arrangements([4, 5, 9, 3]);
    expect(all).toHaveLength(24);
    for (const n of all) expect(L.digitSum(n)).toBe(21);
    const max = (d) => Math.max(...all.filter((n) => n % d === 0));
    expect(max(2)).toBe(9534);
    expect(max(3)).toBe(9543);
    expect(max(5)).toBe(9435);
    expect(L.validArrangements([4, 5, 9, 3], 3)).toHaveLength(24);
    expect(L.validArrangements([4, 5, 9, 3], 4)).toEqual([]);
    expect(L.validArrangements([4, 5, 9, 3], 9)).toEqual([]);
    expect(L.remaindersOf([4, 5, 9, 3], 9)).toEqual([3]);
    expect(L.remaindersOf([4, 5, 9, 3], 4)).toEqual([1, 2, 3]);
  });

  it('÷3 and ÷9 never change under ANY swap of two slots, for every arrangement', () => {
    const base = L.initCards(CARDS);
    for (const n of L.arrangements([4, 5, 9, 3])) {
      const s = build(base, L.digitsOf(n));
      expect(L.numberOf(s)).toBe(n);
      for (let i = 0; i < 4; i += 1) {
        for (let j = i + 1; j < 4; j += 1) {
          const m = L.numberOf(L.moveSlot(s, i, j));
          expect(m).not.toBe(n);
          for (const d of [3, 9]) expect(divmod(m, d).r === 0).toBe(divmod(n, d).r === 0);
        }
      }
    }
  });

  it('the hand: place, move, swap, return; the default is empty (never an answer)', () => {
    let s = L.initCards(CARDS);
    expect(L.numberOf(s)).toBeNull();
    expect(L.trayOf(s)).toEqual([0, 1, 2, 3]);
    s = L.placeCard(s, 2, 0); // 9 in the first slot
    expect(s.slots).toEqual([2, null, null, null]);
    s = L.placeCard(s, 1, 0); // 5 replaces 9, which returns to the tray
    expect(s.slots).toEqual([1, null, null, null]);
    expect(L.trayOf(s)).toEqual([0, 2, 3]);
    s = L.moveSlot(s, 0, 3);
    expect(s.slots).toEqual([null, null, null, 1]);
    s = L.returnCard(s, 3);
    expect(s.slots).toEqual([null, null, null, null]);
    expect(s.trials).toEqual([]);
  });

  it('claims: judged by the remainder, payload { mode, n, d, claim, r, ok }; the lamp opens and is re-judged', () => {
    let s = build(L.initCards(CARDS), [9, 5, 3, 4]);
    expect(L.lampState(s, 2)).toBe('closed');
    s = L.claim(s, 4, true); // 9534 = 4 × 2383 + 2 : wrong claim
    expect(s.last).toMatchObject({ kind: 'claim', n: 9534, d: 4, q: 2383, r: 2, ok: false });
    expect(L.trialEvidence(s.trials.at(-1))).toEqual({ mode: 'cards', n: 9534, d: 4, claim: 'yes', r: 2, ok: false });
    expect(L.lampState(s, 4)).toBe('no');
    expect(L.claim(s, 4, false)).toBe(s); // an open lamp takes no claim
    s = L.claim(s, 2, true);
    s = L.claim(s, 3, true);
    expect(L.trialEvidence(s.trials.at(-1))).toEqual({ mode: 'cards', n: 9534, d: 3, claim: 'yes', r: 0, ok: true });
    // swap the last two: 9543 — 3 kept, 2 flipped, 4 kept (still no)
    s = L.moveSlot(s, 2, 3);
    expect(L.numberOf(s)).toBe(9543);
    expect(s.flips).toEqual({ 2: 'flipped', 3: 'kept', 4: 'kept' });
    expect(s.swap).toEqual({ from: 9534, to: 9543 });
    expect(L.lampState(s, 2)).toBe('no');
    expect(L.lampState(s, 3)).toBe('yes');
    s = L.returnCard(s, 0);
    expect(L.lampState(s, 3)).toBe('wait');
    expect(s.flips).toBeNull();
  });

  it('a swap counts only with the 2 and 3 lamps open, and only if 3 kept while 2 flipped', () => {
    let s = build(L.initCards(CARDS), [9, 5, 3, 4]);
    s = L.moveSlot(s, 2, 3);
    expect(s.swap).toBeNull(); // lamps closed: nothing was seen
    s = L.claim(L.claim(s, 2, false), 3, true);
    s = L.moveSlot(s, 0, 1); // 5943: 2 kept (odd)
    expect(s.flips[2]).toBe('kept');
    expect(s.swap).toBeNull();
  });

  it('targets: the largest for 2, 3, 5 (divisible AND largest), « لا يوجد » for 4 and 9 only', () => {
    let s = L.initCards(CARDS);
    expect(L.reachableTargets(s)).toEqual([2, 3, 5]);
    s = build(s, [3, 5, 9, 4]); // 3594: divisible by 2, not the largest
    s = L.submitLargest(s, 2);
    expect(s.last).toMatchObject({ kind: 'largest', ok: false, reason: 'notLargest', larger: 3954 });
    expect(L.trialEvidence(s.trials.at(-1))).toEqual({ mode: 'cards', n: 3594, d: 2, claim: 'largest', r: 0, ok: false });
    s = L.submitLargest(s, 5);
    expect(s.last).toMatchObject({ reason: 'notDivisible', r: 4 });
    s = L.sayNone(s, 2);
    expect(s.last).toMatchObject({ kind: 'none', ok: false, example: 3594 });
    expect(L.trialEvidence(s.trials.at(-1))).toEqual({ mode: 'cards', n: null, d: 2, claim: 'none', r: null, ok: false });
    s = L.sayNone(s, 4);
    expect(s.last).toMatchObject({ ok: true, remainders: [1, 2, 3], count: 24 });
    s = L.sayNone(s, 9);
    expect(s.last).toMatchObject({ ok: true, remainders: [3] });
    expect(L.taskDone(s, 4) && L.taskDone(s, 9)).toBe(true);
    for (const [d, n] of [[2, 9534], [3, 9543], [5, 9435]]) {
      s = L.initCards(CARDS);
      s = build(s, L.digitsOf(n));
      s = L.submitLargest(s, d);
      expect(s.last.ok, `${d}`).toBe(true);
      expect(L.taskDone(s, d)).toBe(true);
    }
  });

  it('discoveryReady = the three reachable targets + the swap evidence', () => {
    let s = build(L.initCards(CARDS), [9, 5, 3, 4]);
    s = L.claim(L.claim(s, 2, true), 3, true);
    s = L.moveSlot(s, 2, 3);
    expect(s.swap).not.toBeNull();
    expect(L.discoveryReady(s)).toBe(false);
    for (const [d, n] of [[5, 9435], [3, 9543], [2, 9534]]) {
      // reach each target by rearranging the cards on the same lab (placing a placed card moves or swaps it)
      for (let slot = 0; slot < 4; slot += 1) s = L.placeCard(s, s.digits.indexOf(L.digitsOf(n)[slot]), slot);
      expect(L.numberOf(s)).toBe(n);
      expect(L.discoveryReady(s)).toBe(false);
      s = L.submitLargest(s, d);
    }
    expect(L.discoveryReady(s)).toBe(true);
    // the targets alone are not enough
    let t = L.initCards(CARDS);
    for (const [d, n] of [[5, 9435], [3, 9543], [2, 9534]]) {
      for (let slot = 0; slot < 4; slot += 1) t = L.placeCard(t, t.digits.indexOf(L.digitsOf(n)[slot]), slot);
      t = L.submitLargest(t, d);
    }
    expect(L.reachableTargets(t).every((d) => L.taskDone(t, d))).toBe(true);
    expect(L.discoveryReady(t)).toBe(false);
  });

  it('init dispatches on mode', () => {
    expect(L.init({ mode: 'cards', ...CARDS }).mode).toBe('cards');
    expect(L.init({ mode: 'grid', ...GRID }).mode).toBe('grid');
  });
});
