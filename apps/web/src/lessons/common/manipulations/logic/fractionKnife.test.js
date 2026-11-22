import { describe, it, expect } from 'vitest';
import { frac, eq, cmp } from '@smarter-academy/core/arithmetic/linear.js';
import { LEVELS } from '../levels';
import * as L from './fractionKnife';

/** Le pgcd, recalculé ici indépendamment de la logique. */
const g = (a, b) => (b ? g(b, a % b) : a);

describe('fraction-knife — les mathématiques exactes', () => {
  it('sweep p/q (1 ≤ p ≤ q ≤ 30) × d ∈ 1..60: readable ⇔ q / gcd(p, q) divides d; the writing equals p/q; the straddle part is in ]0, 1[', () => {
    for (let q = 1; q <= 30; q += 1) {
      for (let p = 1; p <= q; p += 1) {
        const period = q / g(p, q);
        expect(L.readablePeriod(p, q)).toBe(period);
        for (let d = 1; d <= 60; d += 1) {
          const c = L.readCut(p, q, d);
          expect(c.readable, `${p}/${q} d=${d}`).toBe(d % period === 0);
          if (c.readable) {
            expect(eq(frac(c.a, d), frac(p, q)), `${c.writing} = ${p}/${q}`).toBe(true);
            expect(c.writing).toBe(`${c.a}/${d}`);
            expect(c.part).toBeNull();
          } else {
            expect(c.a).toBeNull();
            expect(cmp(c.part, 0)).toBe(1);
            expect(cmp(c.part, 1)).toBe(-1);
            // whole + part = p·d/q exactly
            expect(eq(frac(c.whole * q + c.part.n * (q / c.part.d), q), c.inShare)).toBe(true);
          }
        }
      }
    }
  });

  it('3/5 on the tray rail 1..20: readable exactly at 5, 10, 15, 20; at 10 a decimal fraction 0,6', () => {
    expect(L.readableDs(3, 5, 20)).toEqual([5, 10, 15, 20]);
    expect(L.readCut(3, 5, 10)).toMatchObject({ readable: true, a: 6, writing: '6/10', decimal: '0,6' });
    expect(L.readCut(3, 5, 15).decimal).toBeNull();
    expect(L.readCut(3, 5, 7)).toMatchObject({ readable: false, whole: 4 });
    expect(L.readCut(3, 5, 7).part).toEqual(frac(1, 5));
  });

  it('27/45: among the divisors of 45 below 45, readable exactly at 5 and 15 (9 and 3 straddle: 5,4 and 1,8)', () => {
    const divs = [1, 3, 5, 9, 15];
    expect(divs.filter((d) => L.readCut(27, 45, d).readable)).toEqual([5, 15]);
    expect(L.decimalText(L.readCut(27, 45, 9).inShare)).toBe('5,4');
    expect(L.decimalText(L.readCut(27, 45, 3).inShare)).toBe('1,8');
    expect(L.readCut(27, 45, 15).writing).toBe('9/15');
    expect(L.readCut(27, 45, 5).writing).toBe('3/5');
    // honest: re-cutting (not gluing) also reads — every multiple of 5 below 45
    expect(L.readableDs(27, 45, 44)).toEqual([5, 10, 15, 20, 25, 30, 35, 40]);
  });

  it('Amine\'s 4/6 is false (18/5 pieces, his 4 overflow by 2/5); 6/10 and 9/15 are true', () => {
    const v = L.judgeClaim(3, 5, [4, 6]);
    expect(v.ok).toBe(false);
    expect(v.cut.inShare).toEqual(frac(18, 5));
    expect(v.overflow).toEqual(frac(2, 5));
    expect(L.judgeClaim(3, 5, [6, 10]).ok).toBe(true);
    expect(L.judgeClaim(3, 5, [9, 15]).ok).toBe(true);
    expect(L.judgeClaim(3, 5, [5, 7]).ok).toBe(false);
  });

  it('the glue size divides both terms', () => {
    for (const [p, q, d] of [[27, 45, 45], [3, 5, 20], [12, 18, 36], [6, 8, 24]]) {
      for (let d2 = 1; d2 < d; d2 += 1) {
        const gl = L.glue(p, q, d, d2);
        if (!gl) continue;
        expect(d % gl.k).toBe(0);
        expect(gl.a % gl.k).toBe(0);
        expect(gl.a / gl.k).toBe(gl.a2);
        expect(d / gl.k).toBe(d2);
      }
    }
    expect(L.glue(27, 45, 45, 5)).toMatchObject({ k: 9, a: 27, a2: 3 });
    expect(L.glue(27, 45, 45, 9)).toBeNull();
    expect(L.glue(27, 45, 45, 10)).toBeNull(); // 10 ∤ 45 : a re-cut, not a glue
  });
});

describe('fraction-knife — la géométrie (bandes)', () => {
  const widths = [180, 238, 280, 420, 860];
  it('bands: 1 row when it fits; 45 at a phone width → 3 bands of 15', () => {
    expect(L.bandsFor(20, 260)).toBe(1);
    expect(L.bandsFor(45, 260)).toBe(3);
    expect(L.bandsFor(45, 860)).toBe(1);
  });

  it('swept at five widths: each piece once, inside the width, ≥ 6 px long, the edge at the exact fraction', () => {
    for (const [p, q, max] of [[3, 5, 20], [27, 45, 45]]) {
      for (const width of widths) {
        const B = L.bandsFor(max, width);
        for (let d = 1; d <= max; d += 1) {
          const lay = L.trayLayout({ p, q, d, bands: B, width });
          expect(lay.pieces).toHaveLength(d);
          expect(new Set(lay.pieces.map((x) => x.i)).size).toBe(d);
          let sum = 0;
          for (const pc of lay.pieces) {
            expect(pc.len, `${p}/${q} w=${width} d=${d}`).toBeGreaterThanOrEqual(6);
            const segLen = pc.segs.reduce((acc, sg) => acc + sg.x1 - sg.x0, 0);
            expect(segLen).toBeCloseTo(pc.len, 6);
            for (const sg of pc.segs) {
              expect(sg.x0).toBeGreaterThanOrEqual(-1e-9);
              expect(sg.x1).toBeLessThanOrEqual(width + 1e-9);
              expect(sg.band).toBeGreaterThanOrEqual(0);
              expect(sg.band).toBeLessThan(B);
            }
            sum += segLen;
          }
          expect(sum).toBeCloseTo(width * B, 6);
          // the edge: unfolded distance from the start = p/q of the length
          const unfolded = lay.edge.band * width + (width - lay.edge.x);
          expect(unfolded).toBeCloseTo((p / q) * width * B, 6);
          // pieces in / part / out agree with the exact cut
          const c = L.readCut(p, q, d);
          const full = lay.pieces.filter((x) => x.in === 'full').length;
          const part = lay.pieces.filter((x) => x.in === 'part').length;
          expect(full).toBe(c.whole);
          expect(part).toBe(c.readable ? 0 : 1);
        }
      }
    }
  });

  it('at d = 45 in 3 bands no piece is split by a band end', () => {
    const lay = L.trayLayout({ p: 27, q: 45, d: 45, bands: 3, width: 240 });
    expect(lay.pieces.every((x) => x.segs.length === 1)).toBe(true);
    expect(lay.edge).toEqual({ band: 1, x: 240 - (12 / 15) * 240 });
  });

  it('the rail maps 1 … max from right to left', () => {
    const r = { x0: 20, x1: 220, max: 20 };
    expect(L.railX(1, r)).toBe(220);
    expect(L.railX(20, r)).toBe(20);
    expect(Math.round(L.railValue(L.railX(7, r), r))).toBe(7);
  });
});

describe('fraction-knife — مبتدئ (tray)', () => {
  const B = LEVELS['fraction-knife'].beginner.numbers;

  it('starts at d = 5 with 3/5 already in the notebook, no trial', () => {
    const s = L.init(B);
    expect(s.d).toBe(5);
    expect(L.stamps(s).map((x) => x.writing)).toEqual(['3/5']);
    expect(s.trials).toHaveLength(0);
    expect(L.shownCut(s)).toBeNull();
    expect(L.discoveryReady(s)).toBe(false);
  });

  it('a readable cut stamps once; an unreadable one stamps nothing; live moves are not trials', () => {
    let s = L.init(B);
    s = L.setD(s, 9);
    expect(s.trials).toHaveLength(0);
    s = L.commitD(s, 10);
    expect(L.stamps(s).map((x) => x.writing)).toEqual(['3/5', '6/10']);
    expect(L.stamps(s)[1].decimal).toBe('0,6');
    s = L.commitD(s, 10);
    expect(L.stamps(s)).toHaveLength(2);
    s = L.commitD(s, 7);
    expect(L.stamps(s)).toHaveLength(2);
    expect(L.shownCut(s)).toMatchObject({ readable: false, whole: 4 });
    expect(L.trialEvidence(s.trials[0])).toEqual({ kind: 'cut', share: '3/5', d: 10, inShare: '6', readable: true, writing: '6/10' });
    expect(L.trialEvidence(s.trials[2])).toEqual({ kind: 'cut', share: '3/5', d: 7, inShare: '21/5', readable: false });
  });

  it('Amine\'s claim opens after 2 writings, is judged only at d = 6, a wrong answer is refuted and can be redone', () => {
    let s = L.init(B);
    expect(L.canOpenClaim(s)).toBe(false);
    s = L.commitD(s, 10);
    expect(L.canOpenClaim(s)).toBe(true);
    s = L.openClaim(s);
    expect(L.claimCuttable(s)).toBe(false);
    expect(L.answerClaim(s, 'false')).toBe(s);
    s = L.commitD(s, 6);
    expect(L.claimCuttable(s)).toBe(true);
    s = L.answerClaim(s, 'true');
    expect(s.claim.state).toBe('wrong');
    expect(L.trialEvidence(s.trials.at(-1))).toEqual({ kind: 'claim', claim: '4/6', ok: false, answer: 'true' });
    s = L.answerClaim(s, 'false');
    expect(s.claim.state).toBe('right');
    expect(L.trialEvidence(s.trials.at(-1))).toMatchObject({ kind: 'claim', claim: '4/6', ok: true });
  });

  it('discoveryReady = 3 writings (one with d ≠ 5) + an unreadable cut + the claim judged', () => {
    let s = L.init(B);
    s = L.commitD(s, 10);
    s = L.commitD(s, 15);
    expect(L.discoveryReady(s)).toBe(false);
    s = L.commitD(s, 8);
    expect(L.discoveryReady(s)).toBe(false);
    s = L.openClaim(s);
    s = L.commitD(s, 6);
    s = L.answerClaim(s, 'false');
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.firstUnreadable(s)).toBe(8);
    expect(L.multiplyLines(s).map((x) => [x.k, x.a2, x.d2])).toEqual([[2, 6, 10], [3, 9, 15]]);
    expect(L.finishedShare(s)).toBe('3/5');
  });

  it('reset clears the notebook and the memory', () => {
    let s = L.init(B);
    s = L.commitD(s, 10);
    s = L.reset(s);
    expect(L.stamps(s)).toHaveLength(1);
    expect(s.trials).toHaveLength(0);
    expect(s.claim.state).toBe('closed');
  });
});

describe('fraction-knife — متقدم (paper)', () => {
  const A = LEVELS['fraction-knife'].advanced.numbers;

  it('the textbook rectangles: 3/5 is figure 1; 6/10 and 12/20 stamped as figures 2 and 3; then the second share opens', () => {
    let s = L.init(A);
    expect(L.stamps(s)[0]).toMatchObject({ writing: '3/5', figure: 1 });
    expect(L.canOpenNext(s)).toBe(false);
    s = L.commitD(s, 20);
    s = L.commitD(s, 15);
    s = L.commitD(s, 10);
    expect(L.stamps(s).map((x) => [x.writing, x.figure])).toEqual([['3/5', 1], ['12/20', 3], ['9/15', null], ['6/10', 2]]);
    expect(L.targetsDone(s)).toEqual([true, true]);
    s = L.openNext(s);
    expect(s.stage).toBe(1);
    expect(s.d).toBe(45);
    expect(s.predicting).toBe(true);
    expect(L.stamps(s).map((x) => x.writing)).toEqual(['27/45']);
  });

  it('the prediction: up to 3 pins below 45, the knife locked until started, each pin judged once as the knife passes', () => {
    let s = L.openNext(L.commitD(L.commitD(L.init(A), 10), 20));
    expect(L.commitD(s, 30)).toBe(s);
    expect(L.canStartKnife(s)).toBe(false);
    s = L.togglePin(s, 9);
    s = L.togglePin(s, 15);
    s = L.togglePin(s, 3);
    s = L.togglePin(s, 4); // a fourth is refused
    expect(s.pins.map((p) => p.d)).toEqual([15, 9, 3]);
    s = L.togglePin(s, 45); // clamped below 45: 44
    expect(s.pins).toHaveLength(3);
    s = L.startKnife(s);
    expect(s.predicting).toBe(false);
    s = L.setD(s, 12); // passes 15
    expect(s.pins.find((p) => p.d === 15).state).toBe('readable');
    expect(s.pins.find((p) => p.d === 9).state).toBe('planted');
    s = L.commitD(s, 5); // passes 9 (straddle); 3 is not reached
    expect(s.pins.find((p) => p.d === 9).state).toBe('straddle');
    expect(s.pins.find((p) => p.d === 3).state).toBe('planted');
    const pins = s.trials.filter((t) => t.kind === 'pin').map(L.trialEvidence);
    expect(pins).toEqual([
      { kind: 'pin', share: '27/45', d: 15, readable: true },
      { kind: 'pin', share: '27/45', d: 9, readable: false },
    ]);
    s = L.setD(s, 2);
    s = L.setD(s, 5);
    expect(s.trials.filter((t) => t.kind === 'pin')).toHaveLength(3);
  });

  it('discoveryReady = targets + 27/45 brought to 5 + one refused d < 45; the glue is drawn after a readable coarser cut', () => {
    let s = L.openNext(L.commitD(L.commitD(L.init(A), 10), 20));
    s = L.startKnife(L.togglePin(s, 15));
    s = L.commitD(s, 15);
    expect(L.shownGlue(s)).toMatchObject({ k: 3, a: 27, a2: 9 });
    s = L.commitD(s, 5);
    expect(L.shownGlue(s)).toMatchObject({ k: 9, a2: 3 });
    expect(L.reachedReduced(s)).toBe(true);
    expect(L.discoveryReady(s)).toBe(false); // nothing refused yet
    s = L.commitD(s, 9);
    expect(L.shownGlue(s)).toBeNull();
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.refusedDivisor(s)).toBe(9);
    expect(L.reduceSteps(s).map((x) => x.k)).toEqual([3, 3]);
    expect(L.totalGlue(s)).toMatchObject({ k: 9, a2: 3 });
    expect(L.finishedShare(s)).toBe('27/45');
  });

  it('refusedDivisor falls back on 9 when the student refused a non-divisor', () => {
    let s = L.openNext(L.commitD(L.commitD(L.init(A), 10), 20));
    s = L.startKnife(L.togglePin(s, 7));
    s = L.commitD(s, 5);
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.refusedDivisor(s)).toBe(9);
    expect(L.reduceSteps(s).map((x) => x.k)).toEqual([9]);
  });
});
