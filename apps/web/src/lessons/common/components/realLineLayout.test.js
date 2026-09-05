import { describe, it, expect } from 'vitest';
import {
  ticksBetween, labelEveryFor, lineGeometry, placeLabels, overlaps, clampCenter, snapValue,
  estimateTextWidth, DEFAULT_W,
} from './realLineLayout';
import { formatDec } from '@smarter-academy/core';

describe('ticksBetween', () => {
  it('includes both bounds and rounds float noise', () => {
    expect(ticksBetween(-1, 1, 0.5)).toEqual([-1, -0.5, 0, 0.5, 1]);
    expect(ticksBetween(0, 0.3, 0.1)).toEqual([0, 0.1, 0.2, 0.3]);
  });
  it('keeps ticks distinct at a 10^-7 step (zoom ×10^6)', () => {
    const t = ticksBetween(1.414213, 1.414214, 1e-7);
    expect(t).toHaveLength(11);
    expect(new Set(t).size).toBe(11);
  });
  it('is empty on a degenerate range', () => {
    expect(ticksBetween(2, 2, 1)).toEqual([]);
    expect(ticksBetween(0, 1, 0)).toEqual([]);
  });
});

describe('lineGeometry — labels never touch, at any width', () => {
  const cases = [[-10, 10, 1], [-1250.5, 1250.5, 250.5], [0, 1, 0.1], [-0.001, 0.001, 0.0005], [1, 2.2, 0.1], [-40, 40, 2]];
  for (const W of [300, 343, 480, 640, 1000]) {
    it(`width ${W}: edge labels inside the frame and neighbours separated`, () => {
      for (const [min, max, step] of cases) {
        const g = lineGeometry({ min, max, step, W });
        const labelled = g.ticks.filter((_, i) => i % g.labelEvery === 0);
        const boxes = labelled.map((v) => ({ x: g.toX(v), width: estimateTextWidth(formatDec(v), 13) }));
        expect(boxes[0].x - boxes[0].width / 2).toBeGreaterThanOrEqual(0);
        const lastB = boxes[boxes.length - 1];
        expect(lastB.x + lastB.width / 2).toBeLessThanOrEqual(W);
        for (let i = 1; i < boxes.length; i += 1) expect(overlaps(boxes[i - 1], boxes[i], 4)).toBe(false);
        expect(labelled.length).toBeGreaterThanOrEqual(2);
      }
    });
  }
  it('maps min and max to the axis ends and is invertible', () => {
    const g = lineGeometry({ min: -3, max: 7, step: 1 });
    expect(g.toX(-3)).toBeCloseTo(g.padL);
    expect(g.toX(7)).toBeCloseTo(DEFAULT_W - g.padR);
    expect(g.fromX(g.toX(2.5))).toBeCloseTo(2.5);
  });
  it('labelEveryFor grows as ticks get denser', () => {
    expect(labelEveryFor(40, 20)).toBe(1);
    expect(labelEveryFor(10, 20)).toBe(3);
  });
});

describe('placeLabels', () => {
  const noOverlapPerRow = (placed) => {
    for (const a of placed) for (const b of placed) {
      if (a !== b && a.row === b.row) expect(overlaps(a, b, 3)).toBe(false);
    }
  };
  it('never lets two labels of one row overlap, over a dense sweep', () => {
    for (let k = 0; k < 60; k += 1) {
      const items = [];
      for (let i = 0; i < 6; i += 1) items.push({ id: `p${i}`, x: 40 + ((i * 37 + k * 13) % 560), width: 30 + (i % 3) * 20 });
      noOverlapPerRow(placeLabels(items, { W: 640 }));
    }
  });
  it('keeps every label inside the frame', () => {
    const placed = placeLabels([{ id: 'a', x: 0, width: 60 }, { id: 'b', x: 640, width: 100 }], { W: 640 });
    for (const p of placed) {
      expect(p.x - p.width / 2).toBeGreaterThanOrEqual(0);
      expect(p.x + p.width / 2).toBeLessThanOrEqual(640);
    }
  });
  it('stacks coincident labels on distinct rows', () => {
    const placed = placeLabels([{ id: 'a', x: 300, width: 50 }, { id: 'b', x: 300, width: 50 }, { id: 'c', x: 300, width: 50 }]);
    expect(new Set(placed.map((p) => p.row)).size).toBe(3);
  });
});

describe('clampCenter / snapValue', () => {
  it('clamps symmetrically', () => {
    expect(clampCenter(5, 20, 640)).toBe(21);
    expect(clampCenter(635, 20, 640)).toBe(619);
    expect(clampCenter(300, 20, 640)).toBe(300);
  });
  it('snaps to the step and stays in range', () => {
    expect(snapValue(2.26, { min: -5, max: 5, snap: 0.5 })).toBe(2.5);
    expect(snapValue(9, { min: -5, max: 5, snap: 0.5 })).toBe(5);
    expect(snapValue(-0.26, { min: -5, max: 5, snap: 0.1 })).toBe(-0.3);
  });
});
