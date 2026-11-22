import { describe, it, expect } from 'vitest';
import * as FS from './fairShare';
import { LEVELS } from '../levels';

const B = LEVELS['fair-share'].beginner.numbers.orders;
const A = LEVELS['fair-share'].advanced.numbers.orders;

describe('fair-share — judge (exact, b × (m / n) against a)', () => {
  it('the lesson numbers: 3 cakes for 4 children land at 3 quarters, 2 for 3 at 2 thirds', () => {
    expect(FS.judge(3, 4, 4, 3)).toMatchObject({ kind: 'exact', ok: true });
    expect(FS.judge(3, 4, 4, 2).kind).toBe('short');
    expect(FS.judge(3, 4, 4, 4).kind).toBe('over');
    expect(FS.judge(2, 3, 3, 2)).toMatchObject({ kind: 'exact', ok: true });
    expect(FS.judge(5, 6, 10, 8)).toMatchObject({ kind: 'short', left: { n: 1, d: 5 } });
    expect(FS.judge(5, 6, 10, 9)).toMatchObject({ kind: 'over', missing: { n: 2, d: 5 } });
    expect(FS.judge(7, 3, 10, 23).left).toEqual({ n: 1, d: 10 });
  });

  it('cutting in n = b parts lands at m = a for EVERY a and b (sweep); any n lands iff b divides a·n, at m = a·n / b', () => {
    for (let a = 1; a <= 12; a += 1) {
      for (let b = 2; b <= 8; b += 1) {
        for (let n = 1; n <= 12; n += 1) {
          const hits = [];
          for (let m = 0; m <= FS.mMaxOf(a, b, n); m += 1) if (FS.judge(a, b, n, m).ok) hits.push(m);
          expect(hits, `${a}/${b} n=${n}`).toEqual((a * n) % b === 0 ? [(a * n) / b] : []);
        }
        expect(FS.judge(a, b, b, a).ok).toBe(true);
        expect(a).toBeLessThanOrEqual(FS.mMaxOf(a, b, b));
      }
    }
  });

  it('the share limit always holds the exact share, never at its very end', () => {
    for (let a = 1; a <= 12; a += 1) for (let b = 1; b <= 9; b += 1) expect(FS.railMax(a, b) * b).toBeGreaterThan(a);
  });

  it('cutting in tenths NEVER lands for the four lesson orders (the contrast)', () => {
    for (const [a, b] of [...B, ...A]) {
      for (let m = 0; m <= FS.mMaxOf(a, b, 10); m += 1) expect(FS.judge(a, b, 10, m).ok, `${a}/${b} m=${m}`).toBe(false);
    }
  });

  it('decimal writing: 3/4 and 9/2 stop, 2/3 and 5/6 never do', () => {
    expect(B.map(([a, b]) => FS.decimalLands(a, b))).toEqual([true, false]);
    expect(A.map(([a, b]) => FS.decimalLands(a, b))).toEqual([false, false]);
    expect(FS.decimalDigits(3, 4)).toBe(2);
    expect(FS.decimalDigits(9, 2)).toBe(1);
  });
});

describe('fair-share — the flow', () => {
  it('opens on n = 1, m = 0 with no verdict and no trial; a split change is not a trial', () => {
    let s = FS.init({ orders: B });
    expect([s.n, s.m, s.trials.length, FS.shownVerdict(s)]).toEqual([1, 0, 0, null]);
    s = FS.setN(s, 4);
    expect([s.n, s.m, s.trials.length]).toEqual([4, 0, 0]);
    s = FS.setN(s, 99);
    expect(s.n).toBe(12);
    s = FS.setN(s, 0);
    expect(s.n).toBe(1);
  });
  it('the contrast: 3/4 by quarters, then 2/3 where tenths never land and thirds do', () => {
    let s = FS.init({ orders: B });
    s = FS.commitM(FS.setN(s, 4), 2);
    expect(FS.shownVerdict(s).kind).toBe('short');
    expect(FS.canNext(s)).toBe(false);
    s = FS.commitM(s, 3);
    expect(FS.shownVerdict(s).kind).toBe('exact');
    expect(FS.canNext(s)).toBe(true);
    expect(FS.discoveryReady(s)).toBe(false);
    s = FS.next(s);
    expect([s.a, s.b, s.n, s.m]).toEqual([2, 3, 1, 0]);
    s = FS.commitM(FS.setN(s, 10), 6);
    s = FS.commitM(s, 7);
    expect(s.trials.slice(-2).map((t) => t.kind)).toEqual(['short', 'over']);
    expect(FS.discoveryReady(s)).toBe(false);
    s = FS.commitM(FS.setN(s, 3), 2);
    expect(FS.shownVerdict(s)).toMatchObject({ kind: 'exact', ok: true });
    expect(FS.discoveryReady(s)).toBe(true);
    expect(s.trials.at(-1)).toMatchObject({ ruler: 'cut', n: 3, m: 2, x: '2/3' });
    expect(s.trials.at(-3)).toMatchObject({ ruler: 'dec' });
  });
  it('the verdict is only shown for the split and the pieces displayed', () => {
    let s = FS.commitM(FS.setN(FS.init({ orders: B }), 4), 3);
    expect(FS.shownVerdict(s)).not.toBeNull();
    s = FS.setN(s, 5);
    expect(FS.shownVerdict(s)).toBeNull();
    expect(s.m).toBe(0);
  });
  it('identical consecutive choices count once; m = 0 is no trial; clamps to the limit', () => {
    let s = FS.setN(FS.init({ orders: B }), 4);
    s = FS.commitM(s, 2);
    s = FS.commitM(s, 2);
    expect(s.trials).toHaveLength(1);
    s = FS.commitM(s, 0);
    expect(s.trials).toHaveLength(1);
    expect(FS.shownVerdict(s)).toBeNull();
    s = FS.commitM(s, 1000);
    expect(s.m).toBe(FS.mMaxOf(3, 4, 4));
    expect(s.m).toBe(4);
  });
  it('reset starts over, memory of trials included', () => {
    const s = FS.reset(FS.commitM(FS.setN(FS.init({ orders: B }), 4), 3));
    expect(s.trials).toHaveLength(0);
    expect([s.i, s.n, s.m]).toEqual([0, 1, 0]);
  });
});

describe('fair-share — what the formal phase and the discovery say (the student\'s own numbers)', () => {
  const played = () => {
    let s = FS.init({ orders: B });
    s = FS.commitM(FS.setN(s, 4), 3);
    s = FS.next(s);
    s = FS.commitM(FS.setN(s, 10), 6);
    s = FS.commitM(s, 7);
    return s;
  };
  it('formal: a/b for every order, the decimal when it exists, else the student\'s two tenths bounds', () => {
    const f = FS.formalOf(played());
    expect(f.map((o) => o.fraction)).toEqual(['3/4', '2/3']);
    expect(f[0].decimal).toBe('0,75');
    expect(f[1].decimal).toBeNull();
    expect(f[1].approx).toEqual({ below: '0,6', above: '0,7', fromTrials: true });
  });
  it('formal without both bounds falls back to the hundredths of the true quotient', () => {
    let s = FS.next(FS.commitM(FS.setN(FS.init({ orders: B }), 4), 3));
    s = FS.commitM(FS.setN(s, 3), 2);
    expect(FS.formalOf(s)[1].approx).toEqual({ below: '0,66', above: '0,67', fromTrials: false });
  });
  it('refutations: the nearest tenths trial is shown with its exact total and gap; the upside-down fraction overshoots', () => {
    const r = FS.refutations(played(), 1);
    expect(r.decimal).toMatchObject({ x: '0,7', total: '2,1', gap: '0,1', kind: 'over' });
    expect(r.inverse).toMatchObject({ x: '3/2', total: '9/2', kind: 'over' });
    expect(FS.refutations(FS.init({ orders: B }), 1).decimal).toBeNull();
  });
});

describe('fair-share — the coach is FOLLOWED to the end of the task (MANIPULATION_CONTRACT §8quater)', () => {
  it('walks pieces → again → split → again … → next → null, controls only', () => {
    let s = FS.init({ orders: B });
    expect(FS.coachOf(s)).toEqual({ id: 'pieces', target: '[data-fs-take]', gesture: 'tap' });
    s = FS.commitM(FS.setN(s, 4), 2);
    expect(FS.coachOf(s).id).toBe('again');
    s = FS.commitM(s, 1);
    expect(FS.coachOf(s)).toEqual({ id: 'split', target: '[data-fs-split]', gesture: 'tap' });
    s = FS.commitM(s, 3);
    expect(FS.coachOf(s)).toEqual({ id: 'next', target: '[data-fs-next-button]', gesture: 'tap' });
    s = FS.commitM(FS.setN(FS.next(s), 3), 2);
    expect(FS.coachOf(s)).toBeNull();
  });
  it('never names a value: only the controls', () => {
    const ids = new Set();
    let s = FS.init({ orders: B });
    for (const step of [(q) => q, (q) => FS.commitM(FS.setN(q, 4), 1), (q) => FS.commitM(q, 2), (q) => FS.commitM(q, 3), FS.next]) {
      s = step(s);
      const c = FS.coachOf(s);
      if (c) { ids.add(c.id); expect(c.target).toMatch(/^\[data-fs-(take|split|next-button)\]$/); }
    }
    expect([...ids].sort()).toEqual(['again', 'next', 'pieces', 'split'].sort());
  });
});

describe('fair-share — geometry swept at five widths', () => {
  const widths = [210, 256, 320, 480, 720];
  it('the table: N = b × rail round cakes, all inside the width, never overlapping', () => {
    for (const w of widths) {
      for (const [a, b] of [...B, ...A, [8, 5], [12, 8], [1, 2]]) {
        const t = FS.cakesLayout({ width: w, a, b });
        expect(t.N).toBe(b * FS.railMax(a, b));
        const cells = Array.from({ length: t.N }, (_, i) => t.cell(i));
        for (const c of cells) {
          expect(c.cx - c.r).toBeGreaterThanOrEqual(-1e-6);
          expect(c.cx + c.r).toBeLessThanOrEqual(w + 1e-6);
          expect(c.cy + c.r).toBeLessThanOrEqual(t.height + 1e-6);
        }
        for (let i = 0; i < cells.length; i += 1) {
          for (let j = i + 1; j < cells.length; j += 1) {
            expect(Math.hypot(cells[i].cx - cells[j].cx, cells[i].cy - cells[j].cy), `${w} ${a}/${b}`).toBeGreaterThanOrEqual(2 * cells[i].r - 1e-6);
          }
        }
      }
    }
  });
  it('slices: the kids take b × x cakes end to end, a kid can straddle two cakes, the rest is what b × x leaves', () => {
    const area = (list) => list.reduce((t, q) => t + (q.a1 - q.a0), 0);
    // 3 cakes for 4 kids at 0,75: each kid a 3/4 slice, 3 cakes covered whole, nothing left
    const ex = FS.slicesOf({ a: 3, b: 4, x: { n: 3, d: 4 } });
    expect(ex.total).toBeCloseTo(3, 9);
    expect(area(ex.kids)).toBeCloseTo(3, 9);
    expect(ex.rest).toEqual([]);
    expect(ex.kids.filter((q) => q.kid === 1).length).toBe(2); // kid 2 straddles cakes 0 and 1
    // 2 cakes for 3 kids at 0,6: 1,8 cakes taken, 0,2 left on the table
    const sh = FS.slicesOf({ a: 2, b: 3, x: { n: 6, d: 10 } });
    expect(area(sh.kids)).toBeCloseTo(1.8, 9);
    expect(area(sh.rest)).toBeCloseTo(0.2, 9);
    // 7 cakes for 3 kids at 3: nine cakes asked, two of them do not exist
    const ov = FS.slicesOf({ a: 7, b: 3, x: { n: 3, d: 1 } });
    expect(Math.max(...ov.kids.map((q) => q.cake))).toBe(8);
    expect(ov.rest).toEqual([]);
    for (const q of [...ex.kids, ...sh.kids, ...ov.kids]) { expect(q.a0).toBeGreaterThanOrEqual(0); expect(q.a1).toBeLessThanOrEqual(1 + 1e-9); expect(q.a1).toBeGreaterThan(q.a0); }
  });
  it('the kids: b slots across the width', () => {
    for (const w of widths) {
      for (const b of [3, 4, 5, 6]) {
        const k = FS.kidsLayout({ width: w, b });
        for (let i = 0; i < b; i += 1) {
          expect(k.cx(i) - k.slot / 2).toBeGreaterThanOrEqual(0);
          expect(k.cx(i) + k.slot / 2).toBeLessThanOrEqual(w);
        }
      }
    }
  });
});

describe('fair-share — « جرّب أعدادك » (the free order)', () => {
  it('opens a free order after the lesson orders, with a fresh state, and never counts for the discovery', () => {
    let s = FS.init({ orders: [[3, 4], [2, 3]] });
    s = FS.setCustom(s, 5, 3);
    expect(FS.isFree(s)).toBe(true);
    expect([s.a, s.b, s.i, s.base]).toEqual([5, 3, 2, 2]);
    expect(FS.discoveryReady(s)).toBe(false);
    s = FS.commitM(FS.setN(s, 3), 4);
    expect(s.trials.at(-1)).toMatchObject({ free: true, i: 2 });
    expect(FS.canNext(s)).toBe(false);
    expect(FS.formalOf(s)).toHaveLength(2);
    expect(FS.finishedEvidence(s).orders).toEqual(['3/4', '2/3']);
    expect(FS.trialEvidence(s.trials.at(-1)).free).toBe(true);
  });
  it('changing the numbers restarts the free order only; the lesson trials are kept; limits clamp', () => {
    let s = FS.init({ orders: [[3, 4], [2, 3]] });
    s = FS.commitM(FS.setN(s, 4), 3);
    s = FS.setCustom(s, 4, 3);
    s = FS.commitM(s, 3);
    expect(s.trials.filter((t) => t.free)).toHaveLength(1);
    s = FS.setCustom(s, 4, 5);
    expect(s.trials.filter((t) => t.free)).toHaveLength(0);
    expect(s.trials.filter((t) => !t.free)).toHaveLength(1);
    expect(s.orders).toHaveLength(3);
    s = FS.setCustom(s, 99, 99);
    expect([s.a, s.b]).toEqual([12, 8]);
    s = FS.setCustom(s, -4, 0);
    expect([s.a, s.b]).toEqual([1, 2]);
  });
  it('every free order is solvable: n = b, m = a lands, whatever the numbers', () => {
    const s = FS.init({ orders: [[3, 4]] });
    for (let a = 1; a <= 12; a += 1) {
      for (let b = 2; b <= 8; b += 1) {
        const f = FS.commitM(FS.setN(FS.setCustom(s, a, b), b), a);
        expect(f.last.verdict.kind, `${a}/${b}`).toBe('exact');
      }
    }
  });
  it('toGuided returns to the first lesson order not solved yet (else the last)', () => {
    let s = FS.init({ orders: [[3, 4], [2, 3]] });
    s = FS.setCustom(s, 5, 3);
    expect(FS.toGuided(s).i).toBe(0);
    s = FS.commitM(FS.setN(FS.toGuided(s), 4), 3);
    s = FS.setCustom(s, 5, 3);
    expect(FS.toGuided(s).i).toBe(1);
  });
});
