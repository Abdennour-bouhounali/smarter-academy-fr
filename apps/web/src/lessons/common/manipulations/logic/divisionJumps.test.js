import { describe, it, expect } from 'vitest';
import { divmod } from '@smarter-academy/core/arithmetic/divisibility.js';
import * as L from './divisionJumps';

/** The (a, b) the lesson uses: مبتدئ 47/6 then 48/6, متقدم 279/14 (نشاط 3), معارف 2 253/17. */
const USED = [[47, 6], [48, 6], [279, 14], [253, 17]];

/** Every q in 0..qMax, judged. */
const sweep = (a, b) => Array.from({ length: L.qMaxOf(a, b) + 1 }, (_, q) => L.judge(a, b, q));

describe('division-jumps — the verdicts, exact', () => {
  it('for the lesson\'s numbers and a sweep a ∈ 1..300, b ∈ 1..30: ONE exact q, = divmod; below it short, above it over', () => {
    const pairs = [...USED];
    for (let a = 1; a <= 300; a += 1) for (let b = 1; b <= 30; b += 1) pairs.push([a, b]);
    const bad = [];
    for (const [a, b] of pairs) {
      const { q: qq, r: rr } = divmod(a, b);
      const all = sweep(a, b);
      const exact = all.filter((v) => v.kind === 'exact');
      if (exact.length !== 1 || exact[0].q !== qq || exact[0].r !== rr || rr >= b || b * qq + rr !== a) bad.push(`${a}/${b} exact`);
      for (const v of all) {
        // below: r ≥ b, another group is possible; above: the group needs objects that do not exist
        if (v.q < qq && !(v.kind === 'short' && v.left >= b)) bad.push(`${a}/${b} q=${v.q} should be short`);
        if (v.q > qq && !(v.kind === 'over' && b * v.q > a && v.r === null)) bad.push(`${a}/${b} q=${v.q} should be over`);
      }
      // the track always reaches past the answer (at least one `over`)
      if (all.at(-1).kind !== 'over') bad.push(`${a}/${b} track`);
    }
    expect(pairs.length).toBe(4 + 300 * 30);
    expect(bad).toEqual([]);
  });

  it('the textbook\'s numbers: 47 = 6 × 7 + 5, 48 = 6 × 8, 279 = 14 × 19 + 13, 253 = 17 × 14 + 15', () => {
    expect(L.formalLine(47, 6)).toBe('47 = 6 × 7 + 5');
    expect(L.formalLine(48, 6)).toBe('48 = 6 × 8 + 0');
    expect(L.formalLine(279, 14)).toBe('279 = 14 × 19 + 13');
    expect(L.formalLine(253, 17)).toBe('253 = 17 × 14 + 15');
    expect(L.remainderLine(279, 14)).toBe('13 < 14');
    expect(L.bracketLine(279, 14)).toBe('14 × 19 ≤ 279 < 14 × 20');
    expect(L.bracketLine(253, 17)).toBe('17 × 14 ≤ 253 < 17 × 15');
    for (const [a, b] of USED) {
      expect(L.formalPieces(a, b).join(' ')).toBe(L.formalLine(a, b));
      expect(L.bracketPieces(a, b).join(' ')).toBe(L.bracketLine(a, b));
    }
    // « القفزة 20 تصل إلى 280 بعد 279 »
    expect(L.judge(279, 14, 20)).toMatchObject({ kind: 'over', need: 280, missing: 1 });
    // « 10 باقات؟ » : 140, still 139 left — another bouquet fits
    expect(L.judge(279, 14, 10)).toMatchObject({ kind: 'short', need: 140, left: 139 });
    expect(L.marksOf(279, 14)).toEqual([10, 20]);
    expect(L.marksOf(253, 17)).toEqual([]);
  });

  it('the three verdicts of the brief at 47/6', () => {
    expect(L.judge(47, 6, 8)).toMatchObject({ kind: 'over', ok: false, missing: 1, r: null });
    expect(L.judge(47, 6, 6)).toMatchObject({ kind: 'short', ok: false, left: 11, r: 11 });
    expect(L.judge(47, 6, 7)).toMatchObject({ kind: 'exact', ok: true, left: 5, r: 5 });
    expect(L.judge(47, 6, 0)).toMatchObject({ kind: 'short', left: 47 });
  });
});

describe('division-jumps — the hand\'s path', () => {
  it('the default is q = 0, never an answer for the lesson\'s numbers, and never a trial', () => {
    for (const [a, b] of USED) {
      const s = L.init({ a, b, world: 'flowers' });
      expect(s.q).toBe(L.DEFAULT_Q);
      expect(L.judge(a, b, s.q).kind).not.toBe('exact');
      expect(s.trials).toEqual([]);
    }
  });

  it('live moves are not trials; commits are; the discovery needs over + short + exact on the lesson\'s a', () => {
    let s = L.init({ a: 47, b: 6, world: 'flowers', then: 48 });
    s = L.setQ(s, 9);
    expect(s.q).toBe(9);
    expect(s.trials).toEqual([]);
    expect(L.shownVerdict(s)).toBeNull();
    s = L.commitQ(s, 7);
    expect(L.shownVerdict(s).kind).toBe('exact');
    expect(L.discoveryReady(s)).toBe(false);
    expect(L.stillToTry(s)).toEqual(['over', 'short']);
    s = L.commitQ(s, 8);
    expect(L.trialEvidence(s.trials.at(-1))).toEqual({ a: 47, b: 6, q: 8, r: null, kind: 'over', ok: false });
    expect(L.stillToTry(s)).toEqual(['short']); // the view shows it only under an exact verdict
    s = L.setQ(s, 6);
    expect(L.shownVerdict(s)).toBeNull(); // a verdict belongs to the ribbon it judged
    s = L.commitQ(s, 6);
    expect(L.trialEvidence(s.trials.at(-1))).toEqual({ a: 47, b: 6, q: 6, r: 11, kind: 'short', ok: false });
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.trialEvidence(s.trials[0])).toEqual({ a: 47, b: 6, q: 7, r: 5, kind: 'exact', ok: true });
  });

  it('q is clamped to 0..qMax (the quotient + one started group + one (flowers) or two (line) too many)', () => {
    let s = L.init({ a: 47, b: 6, world: 'flowers', then: 48 });
    expect(s.qMax).toBe(9); // 48 → 8 bouquets, one too many still possible for both numbers
    expect(L.judge(48, 6, s.qMax).kind).toBe('over');
    s = L.commitQ(s, 99);
    expect(s.q).toBe(9);
    expect(L.init({ a: 279, b: 14, world: 'line' }).qMax).toBe(22);
    s = L.setQ(s, -3);
    expect(s.q).toBe(0);
    expect(L.qMaxOf(48, 6)).toBe(10);
    expect(L.qMaxOf(279, 14)).toBe(22);
    expect(L.qMaxOf(253, 17)).toBe(17);
  });

  it('the 47 → 48 contrast: offered after the exact stop, keeps the ribbon, does not count in the gate', () => {
    let s = L.init({ a: 47, b: 6, world: 'flowers', then: 48 });
    expect(L.canAddFlower(s)).toBe(false);
    s = L.commitQ(s, 7);
    expect(L.canAddFlower(s)).toBe(true);
    s = L.addFlower(s);
    expect(s.a).toBe(48);
    expect(s.q).toBe(7);
    expect(L.shownVerdict(s)).toBeNull();
    expect(L.judge(48, 6, 7)).toMatchObject({ kind: 'short', left: 6 }); // the new flower makes 6: another bouquet
    s = L.commitQ(s, 8);
    expect(L.shownVerdict(s)).toMatchObject({ kind: 'exact', left: 0 });
    expect(L.thenDone(s)).toBe(true);
    // trials on 48 never open the discovery of 47
    let only48 = L.addFlower(L.commitQ(L.init({ a: 47, b: 6, world: 'flowers', then: 48 }), 7));
    only48 = L.commitQ(L.commitQ(only48, 9), 2);
    expect(L.discoveryReady(only48)).toBe(false);
    s = L.backToFirst(s);
    expect(s.a).toBe(47);
    // the line world has no contrast
    expect(L.init({ a: 279, b: 14, world: 'line', then: 280 }).then).toBeNull();
  });

  it('reset clears the trial memory and comes back to the lesson\'s number', () => {
    let s = L.init({ a: 47, b: 6, world: 'flowers', then: 48 });
    s = L.addFlower(L.commitQ(s, 7));
    s = L.commitQ(s, 3);
    s = L.reset(s);
    expect(s).toEqual(L.init({ a: 47, b: 6, world: 'flowers', then: 48 }));
  });
});

describe('division-jumps — the flower block', () => {
  const WIDTHS = [240, 288, 358, 600, 760];
  it('at five widths and several heights: each flower once, inside the width and the height, whole bouquets per row', () => {
    for (const [a, b] of [[47, 6], [48, 6], [20, 3], [95, 12]]) {
      const slots = b * L.qMaxOf(Math.max(a, a + 1), b);
      for (const width of WIDTHS) {
        for (const maxHeight of [120, 200, 300, 420]) {
          const lay = L.flowerLayout({ slots, b, width, maxHeight });
          expect(lay.perRow % b, `${a}/${b} @${width}`).toBe(0);
          expect(lay.height).toBeLessThanOrEqual(maxHeight + 0.5);
          const seenAt = new Set();
          for (let i = 0; i < slots; i += 1) {
            const x = lay.x(i);
            const y = lay.y(i);
            expect(x, `${a}/${b} @${width} #${i}`).toBeGreaterThanOrEqual(-0.01);
            expect(x + lay.size).toBeLessThanOrEqual(width + 0.01);
            expect(y + lay.size).toBeLessThanOrEqual(lay.height + 0.01);
            const key = `${Math.round(x * 10)}|${Math.round(y * 10)}`;
            expect(seenAt.has(key), `two flowers at one place #${i}`).toBe(false);
            seenAt.add(key);
          }
          // reading order: right to left in a row, rows top to bottom
          expect(lay.x(1)).toBeLessThan(lay.x(0));
          if (lay.rows > 1) expect(lay.y(lay.perRow)).toBeGreaterThan(lay.y(0));
          // a pointer on flower i reads a position in [i, i + 1] (the ribbon's end follows the finger)
          for (let i = 0; i < slots; i += 1) {
            const pos = lay.posAt(lay.x(i) + lay.size / 2, lay.y(i) + lay.size / 2);
            expect(pos, `posAt #${i} @${width}`).toBeGreaterThanOrEqual(i);
            expect(pos).toBeLessThanOrEqual(i + 1);
          }
          expect(lay.posAt(width + 50, 0)).toBe(0);
        }
      }
    }
  });

  it('the block shrinks with the scene and becomes ONE row when it fits', () => {
    const big = L.flowerLayout({ slots: 60, b: 6, width: 760, maxHeight: 420 });
    const small = L.flowerLayout({ slots: 60, b: 6, width: 288, maxHeight: 160 });
    expect(small.size).toBeLessThan(big.size);
    const oneRow = L.flowerLayout({ slots: 12, b: 6, width: 760, maxHeight: 300 });
    expect(oneRow.rows).toBe(1);
  });

  it('the drawn scene (BOUQUET_ROWS): each bouquet\'s paper sleeve stays in its row, its ribbon across the stems, and every stem leans toward the bouquet\'s foot', () => {
    expect(L.BOUQUET_ROWS.lane + 1.08).toBeLessThanOrEqual(L.BOUQUET_ROWS.row);
    for (const [a, b] of [[47, 6], [279, 14], [20, 3]]) {
      const qMax = L.qMaxOf(a, b, 1);
      const slots = b * qMax;
      for (const width of [232, 300, 454, 760]) {
        for (const maxHeight of [150, 260, 420]) {
          const lay = L.flowerLayout({ slots, b, width, maxHeight, ...L.BOUQUET_ROWS });
          expect(lay.height).toBeLessThanOrEqual(maxHeight + 0.5);
          for (let g = 0; g < qMax; g += 1) {
            const sh = L.bouquetShape(lay, g, b);
            const row = Math.floor((g * b) / lay.perRow);
            // the sleeve ends before the next row
            expect(sh.bottom, `${a}/${b} @${width}×${maxHeight} g${g}`).toBeLessThanOrEqual((row + 1) * lay.rowH + 0.01);
            expect(sh.top).toBeGreaterThan(sh.y);
            expect(sh.band).toBeGreaterThan(sh.top);
            expect(sh.band).toBeLessThan(sh.bottom);
            // the paper covers exactly the b flowers of the bouquet (never a neighbour)
            expect(sh.x0).toBeLessThanOrEqual(lay.x(g * b + b - 1));
            expect(sh.x1).toBeGreaterThanOrEqual(lay.x(g * b) + lay.size);
            if (g + 1 < qMax && Math.floor(((g + 1) * b) / lay.perRow) === row) expect(sh.x0).toBeGreaterThan(lay.x((g + 1) * b) + lay.size);
            // stems lean toward the centre, symmetric
            expect(sh.leans).toHaveLength(b);
            for (let j = 0; j < b; j += 1) {
              const fc = lay.x(g * b + j) + lay.size / 2;
              if (Math.abs(sh.cx - fc) < 1e-6) expect(sh.leans[j]).toBeCloseTo(0, 6);
              else expect(Math.sign(sh.leans[j])).toBe(Math.sign(sh.cx - fc));
              expect(sh.leans[j] + sh.leans[b - 1 - j]).toBeCloseTo(0, 6);
            }
          }
        }
      }
    }
  });
});

describe('division-jumps — the number line', () => {
  it('jumps of b from 0, every jump inside the line, xOf/valueAt inverse, no multiple of b printed in advance', () => {
    for (const [a, b] of [[279, 14], [253, 17], [47, 6]]) {
      for (const width of [240, 320, 480, 760]) {
        const qMax = L.qMaxOf(a, b);
        const lay = L.lineLayout({ a, b, qMax, width });
        expect(lay.L).toBe(b * qMax);
        expect(lay.L).toBeGreaterThan(a); // the line goes past a
        expect(lay.xOf(0)).toBe(lay.x0);
        expect(lay.xOf(lay.L)).toBeCloseTo(lay.x1, 6);
        for (let i = 1; i <= qMax; i += 1) {
          const j = lay.jump(i);
          expect(j.to - j.from).toBe(b);
          expect(j.x0).toBeGreaterThanOrEqual(lay.x0);
          expect(j.x1).toBeLessThanOrEqual(lay.x1 + 1e-9);
          expect(j.x1 - j.x0).toBeCloseTo(b * lay.k, 6);
          expect(Math.round(lay.valueAt(j.x1) / b)).toBe(i);
        }
        // graduation readable, labels spaced
        expect(lay.minor * lay.k).toBeGreaterThanOrEqual(5);
        expect(lay.major * lay.k).toBeGreaterThanOrEqual(34);
        expect(lay.major % 50).toBe(0);
        // a number is printed only on 0 and on round values that are NOT multiples of b
        const printed = lay.ticks.filter((tk) => tk.label).map((tk) => tk.v);
        expect(printed[0]).toBe(0);
        expect(printed.slice(1).filter((v) => v % b === 0), `${a}/${b} @${width}`).toEqual([]);
      }
    }
  });
});
