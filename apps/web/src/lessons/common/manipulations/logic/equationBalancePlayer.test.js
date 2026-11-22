import { describe, it, expect } from 'vitest';
import * as B from './equationBalance.js';
import * as P from './equationBalancePlayer.js';

const ROUNDS = [['2x+3=11', 'r1', '4'], ['4x+3=-9', 'r2', '-3'], ['3x-2=10', 'r3', '4'], ['4x+3=6x', 'm2r1', '\\dfrac{3}{2}'], ['4x+1=x+8', 'm2r2', '\\dfrac{7}{3}']];

describe('equation-balance player logic', () => {
  ROUNDS.forEach(([eq, chains, x]) => {
    ['bags', 'units'].forEach((order) => {
      it(`${eq}: the ${order}-first plan reaches the bag, reads ${x} and opens the bags`, () => {
        const { lab } = P.playPlan(eq, P.efficientPlan(eq, order), { open: true });
        expect(B.isSolved(lab)).toBe(true);
        expect(B.fracLatex(B.readValue(lab))).toBe(x);
        expect(P.discoveryReached(lab)).toBe(true);
        const specs = P.chainsOf(chains);
        expect(specs.length).toBe(2);
        specs.forEach((sp) => expect(sp.reached(lab), `${eq} ${sp.id}`).toBe(true));
      });
    });
  });

  it('the line build has one decoy, distinct from both tiles, for every round and both orders', () => {
    ROUNDS.forEach(([eq, chains]) => {
      ['bags', 'units'].forEach((order) => {
        const plan = P.efficientPlan(eq, order);
        const sp = P.chainsOf(chains)[0];
        const stage = P.playPlan(eq, { steps: sp.build.when === 'first' ? plan.steps.slice(0, 1) : plan.steps, k: 1 }).lab;
        const b = P.lineBuild(stage, sp.build);
        expect(new Set(b.tiles).size, `${eq} ${order} ${b.tiles}`).toBe(3);
      });
    });
  });

  it('the council numbers: decoys 11, -6, 8, 10x, 9', () => {
    const dec = (eq, chains) => {
      const sp = P.chainsOf(chains)[0];
      const plan = P.efficientPlan(eq, 'bags');
      const stage = P.playPlan(eq, { steps: sp.build.when === 'first' ? plan.steps.slice(0, 1) : plan.steps, k: 1 }).lab;
      return P.lineBuild(stage, sp.build).decoy;
    };
    expect(dec('2x+3=11', 'r1')).toBe('11');
    expect(dec('4x+3=-9', 'r2')).toBe('-6');
    expect(dec('3x-2=10', 'r3')).toBe('8');
    expect(dec('4x+3=6x', 'm2r1')).toBe('10x');
    expect(dec('4x+1=x+8', 'm2r2')).toBe('9');
  });

  it('predictions: truths are computed', () => {
    expect(P.predictTruth('4x+3=-9', 'bagHolds')).toBe('balloons');
    expect(P.predictTruth('4x+3=-9', 'parts')).toBe('4');
    expect(P.predictTruth('3x-2=10', 'otherPanDo')).toBe('putBalls');
    expect(P.predictTruth('4x+3=6x', 'bagsLeft')).toBe('2');
    expect(P.predictTruth('4x+3=6x', 'whole')).toBe('no');
    expect(P.predictTruth('4x+1=x+8', 'bagsLeft')).toBe('3');
  });

  it('refusals: noneHere and full are not trials', () => {
    expect(P.isRefusal('tipped')).toBe(true);
    expect(P.isRefusal('noneHere')).toBe(false);
  });

  it('shownValues never lists a pan of 2 bags removed, 6 or -5 as a solution in the five rounds', () => {
    ROUNDS.forEach(([eq, chains]) => {
      const shown = P.shownValues({ eq, chains, predict: [] });
      expect(shown.length).toBeGreaterThan(10);
      expect(shown.filter((s) => s.role === 'solution' && ['6', '-5'].includes(s.v))).toEqual([]);
      expect(shown.filter((s) => s.role === 'op' && s.v === 'bags:2')).toEqual([]);
    });
  });
});
