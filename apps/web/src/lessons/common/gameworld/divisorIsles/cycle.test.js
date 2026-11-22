import { describe, it, expect } from 'vitest';
import { cycleOf, largestLeft, probeOf, initCycle, cycleReducer, cycleNow, cycleResult, probeSaid } from './cycle';

/** A toy spec: two rounds and two probes (the words are the lesson's, not needed by the logic). */
const SPEC = {
  kind: 'cycle',
  rounds: [
    { b: 8, from: 44, count: 7 },
    { b: 4, from: 28, count: 6 },
  ],
  probes: [
    { b: 7, from: 21 },
    { b: 12, from: 30 },
  ],
};
const run = (spec, actions, from = initCycle()) => actions.reduce((s, a) => cycleReducer(spec, s, a), from);

describe('cycle — one plank on gaps that grow one cell at a time', () => {
  it('every step is the Euclidean division of its gap: a = b × q + r with 0 ≤ r < b, for every plank and start', () => {
    for (let b = 2; b <= 40; b += 1)
      for (let from = b; from <= 200; from += 7) {
        const { steps } = cycleOf(b, from, b + 3);
        expect(steps).toHaveLength(b + 3);
        steps.forEach((st, i) => {
          expect(st.a).toBe(from + i);
          expect(b * st.q + st.r).toBe(st.a);
          expect(st.r >= 0 && st.r < b, `${st.a} ÷ ${b}`).toBe(true);
        });
      }
  });

  it('the cells left climb by ONE at each new cell — except where they would be b: one more plank goes in, none is left', () => {
    for (let b = 2; b <= 40; b += 1)
      for (let from = b; from <= 160; from += 5) {
        const { steps } = cycleOf(b, from, 2 * b + 2);
        for (let i = 1; i < steps.length; i += 1) {
          const [prev, st] = [steps[i - 1], steps[i]];
          if (prev.r + 1 === b) {
            expect([st.r, st.q, st.wraps], `${st.a} ÷ ${b}`).toEqual([0, prev.q + 1, true]);
          } else {
            expect([st.r, st.q, st.wraps], `${st.a} ÷ ${b}`).toEqual([prev.r + 1, prev.q, false]);
          }
        }
        // b + 1 gaps in a row leave every number from 0 to b − 1, and nothing else
        const seen = new Set(steps.map((st) => st.r));
        expect([...seen].sort((x, y) => x - y)).toEqual(Array.from({ length: b }, (_, r) => r));
        expect(Math.max(...seen)).toBe(largestLeft(b));
        // a round never wraps on its first gap: that gap is shown, not grown to
        expect(steps[0].wraps).toBe(false);
        expect(steps.filter((st) => st.wraps).length).toBeGreaterThanOrEqual(1);
      }
  });

  it('a probe starts on a gap the plank fills and goes through one whole climb, the fall, and one more cell', () => {
    for (let b = 2; b <= 30; b += 1)
      for (let from = b; from <= 120; from += 11) {
        const p = probeOf(b, from);
        expect(p.start % b).toBe(0);
        expect(p.start <= from && from - p.start < b).toBe(true);
        expect(p.steps.map((st) => st.r)).toEqual([...Array.from({ length: b }, (_, r) => r), 0, 1 % b]);
        expect(p.steps.filter((st) => st.wraps).map((st) => st.a)).toEqual(b === 1 ? [] : [p.start + b]);
      }
  });
});

describe('cycle — the state machine of the screen', () => {
  it('a round: he says, the world shows, gap after gap; the last gap ends the round with all he said', () => {
    let s = initCycle();
    expect([s.part, s.stage, s.i]).toEqual(['round', 'guess', 0]);
    const { steps } = cycleNow(SPEC, s);
    expect(steps.map((st) => st.r)).toEqual([4, 5, 6, 7, 0, 1, 2]);
    // he says the next number each time — and 8 where the strip lays one more plank
    const says = [5, 6, 7, 8, 1, 2];
    says.forEach((n, k) => {
      s = cycleReducer(SPEC, s, { type: 'say', n });
      expect([s.stage, s.pending, s.i]).toEqual(['lay', n, k]);
      // a second answer while the world is laying changes nothing
      expect(cycleReducer(SPEC, s, { type: 'say', n: 0 })).toBe(s);
      s = cycleReducer(SPEC, s, { type: 'shown' });
      expect(s.i).toBe(k + 1);
      expect(s.stage).toBe(k + 1 < steps.length - 1 ? 'guess' : 'seen');
    });
    expect(s.rounds).toHaveLength(1);
    expect(s.rounds[0]).toEqual({
      b: 8,
      from: 44,
      steps: steps.map((st, k) => ({ a: st.a, r: st.r, said: k === 0 ? null : says[k - 1] })),
    });
    // the one gap where what he said is not what was left is the gap where a plank went in
    expect(s.rounds[0].steps.filter((st) => st.said !== null && st.said !== st.r)).toEqual([{ a: 48, r: 0, said: 8 }]);
    expect(cycleReducer(SPEC, s, { type: 'say', n: 1 })).toBe(s); // the round is over
  });

  it('refuses what is not a number of cells, and moves of another stage', () => {
    const s = initCycle();
    for (const n of [-1, 1.5, null, undefined, '3']) expect(cycleReducer(SPEC, s, { type: 'say', n })).toBe(s);
    for (const type of ['shown', 'next', 'grow', 'tick', 'unknown']) expect(cycleReducer(SPEC, s, { type })).toBe(s);
    expect(cycleReducer(SPEC, s, { type: 'max', n: 3 })).toBe(s);
    expect(cycleReducer(SPEC, s, { type: 'same', v: true })).toBe(s);
  });

  it('after the rounds, a probe: both answers are said BEFORE the world grows the gap; then every cell is a tick', () => {
    const playRound = (state) => {
      let s = state;
      const { steps } = cycleNow(SPEC, s);
      for (let k = 1; k < steps.length; k += 1) s = run(SPEC, [{ type: 'say', n: steps[k].r }, { type: 'shown' }], s);
      return s;
    };
    let s = playRound(initCycle());
    s = cycleReducer(SPEC, s, { type: 'next' });
    expect([s.part, s.ri, s.stage, s.i, s.guesses]).toEqual(['round', 1, 'guess', 0, []]);
    s = playRound(s);
    s = cycleReducer(SPEC, s, { type: 'next' });
    expect([s.part, s.pi, s.stage]).toEqual(['probe', 0, 'ask']);
    // nothing grows before both answers
    expect(cycleReducer(SPEC, s, { type: 'grow' })).toBe(s);
    s = cycleReducer(SPEC, s, { type: 'max', n: 7 });
    expect(cycleReducer(SPEC, s, { type: 'grow' })).toBe(s);
    s = cycleReducer(SPEC, s, { type: 'same', v: true });
    s = cycleReducer(SPEC, s, { type: 'grow' });
    expect([s.stage, s.i]).toEqual(['run', 0]);
    expect(cycleReducer(SPEC, s, { type: 'max', n: 6 })).toBe(s); // too late to change it
    const { steps } = cycleNow(SPEC, s);
    expect(steps).toHaveLength(9);
    for (let k = 1; k < steps.length; k += 1) {
      s = cycleReducer(SPEC, s, { type: 'tick' });
      expect(s.i).toBe(k);
    }
    expect(s.stage).toBe('seen');
    expect(s.probes).toEqual([{ b: 7, from: 21, max: 6, said: { max: 7, same: true } }]);
    expect(probeSaid(s.probes[0])).toEqual({ max: false, same: false });
    // the second probe, said as the world shows it
    s = cycleReducer(SPEC, s, { type: 'next' });
    expect([s.part, s.pi, s.stage, s.max, s.same]).toEqual(['probe', 1, 'ask', null, null]);
    s = run(SPEC, [{ type: 'max', n: 11 }, { type: 'same', v: false }, { type: 'grow' }], s);
    for (let k = 1; k < cycleNow(SPEC, s).steps.length; k += 1) s = cycleReducer(SPEC, s, { type: 'tick' });
    expect(probeSaid(s.probes[1])).toEqual({ max: true, same: true });
    expect(s.probes[1].from).toBe(24); // 30 is not filled by 12: the world starts on 24
    expect(s.done).toBe(false);
    s = cycleReducer(SPEC, s, { type: 'next' });
    expect(s.done).toBe(true);
    expect(cycleResult(s)).toEqual({ rounds: s.rounds, probes: s.probes });
    expect(cycleResult(s).rounds.map((r) => r.b)).toEqual([8, 4]);
  });

  it('clearing the box of a probe clears his answer; a spec without probes ends after its last round', () => {
    const spec = { rounds: [{ b: 3, from: 6, count: 3 }] };
    let s = run(spec, [{ type: 'say', n: 1 }, { type: 'shown' }, { type: 'say', n: 2 }, { type: 'shown' }]);
    expect(s.stage).toBe('seen');
    s = cycleReducer(spec, s, { type: 'next' });
    expect(s.done).toBe(true);
    let p = { ...initCycle(), part: 'probe', stage: 'ask' };
    p = cycleReducer(SPEC, p, { type: 'max', n: 5 });
    expect(p.max).toBe(5);
    p = cycleReducer(SPEC, p, { type: 'max', n: null });
    expect(p.max).toBe(null);
    expect(cycleReducer(SPEC, p, { type: 'same', v: 'yes' })).toBe(p);
  });
});
