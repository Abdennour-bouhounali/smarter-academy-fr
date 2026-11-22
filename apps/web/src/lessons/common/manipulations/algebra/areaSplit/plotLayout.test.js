import { describe, it, expect } from 'vitest';
import * as E from '@smarter-academy/core/arithmetic/expansion.js';
import { PLOT_TASKS } from '../../logic/areaSplit';
import { marginsOf, frameOf, fitUnit, geometry, badgeLayout, labelBoxes, sideLabelBoxes, overlaps, termLabel, visibleSpan, BADGE_R, U_MIN, U_MAX } from './plotLayout';
import { lineLayout, arcOf, chipText, chipWidth, CHIP_H, ARC_H } from './arrowsLayout';

const side = E.side;
const TASKS = [...PLOT_TASKS.beginner, ...PLOT_TASKS.advanced].map((t) => [t.id, t.h, t.w]);
// free-panel sweep: every plot the panel can build
const FREE = [];
for (const m1 of [0, 1, 2]) for (const n1 of [-6, -3, -2, 0, 1, 3, 6]) for (const m2 of [1, 2]) for (const n2 of [-6, -3, -2, 0, 1, 4, 6]) {
  const h = side(m1, n1); const w = side(m2, n2);
  if (E.isValidPlot(h, w) && (m1 > 0 || n1 > 0)) FREE.push([`free ${E.sideTex(h)} | ${E.sideTex(w)}`, h, w]);
}
const UNITS = [U_MIN, 16, 24, U_MAX];

describe('plotLayout — the visible parcels tile the plot exactly (no gap, no overlap), at every x and every size', () => {
  for (const [name, h, w] of [...TASKS, ...FREE]) {
    it(name, () => {
      const patches = E.patchesOf(h, w);
      for (let x = E.minX(h, w); x <= E.X_MAX; x += 1) {
        for (const u of [U_MIN, U_MAX]) {
          const g = geometry({ h, w, x, u, patches });
          const area = g.rects.reduce((a, r) => a + (r.seen.x1 - r.seen.x0) * (r.seen.y1 - r.seen.y0), 0);
          expect(Math.round(area), `${name} x=${x} u=${u}`).toBe(Math.round(g.W * g.H));
          g.rects.forEach((r, i) => {
            expect(r.seen.x0).toBeGreaterThanOrEqual(g.rect.x0 - 1e-6);
            expect(r.seen.x1).toBeLessThanOrEqual(g.rect.x1 + 1e-6);
            expect(r.seen.y0).toBeGreaterThanOrEqual(g.rect.y0 - 1e-6);
            expect(r.seen.y1).toBeLessThanOrEqual(g.rect.y1 + 1e-6);
            g.rects.slice(i + 1).forEach((q) => {
              const ix = Math.min(r.seen.x1, q.seen.x1) - Math.max(r.seen.x0, q.seen.x0);
              const iy = Math.min(r.seen.y1, q.seen.y1) - Math.max(r.seen.y0, q.seen.y0);
              expect(ix > 1e-6 && iy > 1e-6, `${r.id} / ${q.id} overlap at x=${x}`).toBe(false);
            });
          });
          // the area the drawing covers is honest: each parcel's visible rectangle is the (unpaved) part of its two spans
          // (a parcel's FULL area is |a|·|b| units², drawn FULL rect)
          patches.forEach((p, i) => {
            const f = g.rects[i].full;
            expect(Math.round(((f.x1 - f.x0) / u) * ((f.y1 - f.y0) / u))).toBe(E.patchArea(p, x));
          });
        }
      }
    });
  }
  it('visible spans: a bitten x-term shows only the lawn that is left', () => {
    expect(visibleSpan(side(1, -3), 0, 6)).toEqual({ from: 0, to: 3 });
    expect(visibleSpan(side(1, -3), 1, 6)).toEqual({ from: 3, to: 6 });
    expect(visibleSpan(side(1, 4), 0, 6)).toEqual({ from: 0, to: 6 });
    expect(visibleSpan(side(0, 3), 0, 6)).toEqual({ from: 0, to: 3 });
  });
});

describe('plotLayout — labels never collide (patch badges, area pills, brace labels, strip labels, side writings), at every size and x', () => {
  for (const [name, h, w] of [...TASKS, ...FREE]) {
    for (const scaffold of [true, false]) {
      it(`${name} ${scaffold ? 'مبتدئ' : 'متقدم'}`, () => {
        const patches = E.patchesOf(h, w);
        const M = marginsOf(h, w, scaffold);
        for (let x = E.minX(h, w); x <= E.X_MAX; x += 1) {
          for (const u of UNITS) {
            const g = geometry({ h, w, x, u, scaffold, patches });
            const badges = badgeLayout(g, { showArea: scaffold, areas: Object.fromEntries(patches.map((p) => [p.id, E.patchArea(p, x)])) });
            const boxes = [
              ...labelBoxes({ ...g, bracesTop: scaffold ? g.bracesTop : [], bracesLeft: scaffold ? g.bracesLeft : [], stripsW: scaffold ? g.stripsW : [], stripsH: scaffold ? g.stripsH : [] }, badges),
              ...sideLabelBoxes(g, E.sideTex(w), E.sideTex(h)),
            ];
            boxes.forEach((a, i) => boxes.slice(i + 1).forEach((b) => expect(overlaps(a, b), `${a.id} / ${b.id} at x=${x} u=${u}`).toBe(false)));
            // everything sits inside the fixed frame (computed at x = 9)
            const f = frameOf(h, w, u, scaffold);
            expect(f.M).toEqual(M);
            for (const b of boxes) {
              expect(b.x, `${b.id} left`).toBeGreaterThanOrEqual(-1);
              expect(b.y, `${b.id} top`).toBeGreaterThanOrEqual(-1);
              expect(b.x + b.w, `${b.id} right`).toBeLessThanOrEqual(f.vbW + 1);
              expect(b.y + b.h, `${b.id} bottom`).toBeLessThanOrEqual(f.vbH + 1);
            }
            // a badge disc is never cut by the plot edge
            for (const b of badges) {
              expect(b.cx - BADGE_R).toBeGreaterThanOrEqual(g.rect.x0 - BADGE_R);
              expect(b.cy + BADGE_R).toBeLessThanOrEqual(g.rect.y1 + BADGE_R);
            }
          }
        }
      });
    }
  }
});

describe('plotLayout — the unit fits the screen and the frame never moves with x', () => {
  it('fitUnit stays in range, shrinks with the budget, and the frame is the x = 9 frame', () => {
    const [, h, w] = TASKS[3];
    const big = fitUnit({ h, w, width: 600, height: 500, scaffold: false });
    const small = fitUnit({ h, w, width: 380, height: 190, scaffold: false });
    expect(big).toBeGreaterThan(small);
    expect(small).toBeGreaterThanOrEqual(U_MIN);
    expect(big).toBeLessThanOrEqual(U_MAX);
    const f = frameOf(h, w, 20, false);
    expect(f.W).toBe(E.drawnLength(w, 9) * 20);
    expect(f.vbW).toBe(f.M.left + f.W + f.M.right);
  });
  it('term labels use the true minus sign', () => {
    expect(termLabel({ c: -3, p: 0 })).toBe('−3');
    expect(termLabel({ c: 1, p: 1 })).toBe('x');
    expect(termLabel({ c: 2, p: 1 })).toBe('2x');
  });
});

describe('arrowsLayout — the written line fits its width and the arcs run from an origin to a target of the same product', () => {
  const t = (c, p = 0) => ({ c, p });
  const exprs = {
    a1: { products: [E.product(1, [t(5)], [t(1, 1), t(2)])] },
    a2: { products: [E.product(1, [t(-3)], [t(1, 1), t(-4)])] },
    a3: { products: [E.product(1, [t(2, 1), t(1)], [t(1, 1), t(-3)])] },
    a4: { products: [E.product(1, [t(3)], [t(2), t(-1, 1)]), E.product(-1, [t(4)], [t(1, 1), t(-1)])] },
    free: { products: [E.product(1, [t(-6, 1), t(-6)], [t(-6, 1), t(-6)])] },
  };
  for (const [id, expr] of Object.entries(exprs)) {
    for (const width of [340, 380, 460, 620]) {
      it(`${id} at ${width}px: no chip overlaps another, all inside the width`, () => {
        const lay = lineLayout(expr, { width });
        expect(lay.scale).toBeGreaterThanOrEqual(0.55);
        const tks = lay.tokens;
        tks.forEach((a, i) => {
          expect(a.x).toBeGreaterThanOrEqual(0); expect(a.x + a.w).toBeLessThanOrEqual(width + 1);
          const b = tks[i + 1];
          if (b) expect(a.x + a.w, `${a.text} / ${b.text}`).toBeLessThanOrEqual(b.x + 0.001);
        });
        // chips are touch targets
        for (const c of tks.filter((q) => q.kind === 'chip')) { expect(c.w).toBeGreaterThanOrEqual(36); }
        expect(lay.chipH).toBeGreaterThanOrEqual(CHIP_H);
        // numbering: origins then targets run over the whole line
        expect(lay.origins.map((o) => o.oi)).toEqual(lay.origins.map((_, i) => i));
        expect(lay.targets.map((o) => o.tj)).toEqual(lay.targets.map((_, i) => i));
      });
    }
  }
  it('arcs: from the origin centre to the target centre, above the chips, inside the arc band', () => {
    const lay = lineLayout(exprs.a4, { width: 460 });
    const a = arcOf(lay, 0, 1);
    expect(a.y1).toBeLessThanOrEqual(lay.arcH);
    expect(a.cy).toBeGreaterThanOrEqual(-lay.arcH);
    expect(a.x2).toBeCloseTo(lay.targets[1].cx, 5);
    const nested = [arcOf(lay, 0, 0, { rank: 0 }), arcOf(lay, 0, 1, { rank: 1 })];
    expect(nested[1].peak).toBeGreaterThan(nested[0].peak - 1);
    for (const n of nested) expect(n.peak).toBeLessThanOrEqual(lay.arcH);
  });
  it('chip text: a term with its sign, true minus, x², x', () => {
    expect(chipText({ c: -3, p: 0 }, 0)).toBe('−3');
    expect(chipText({ c: -3, p: 0 }, 1)).toBe('− 3');
    expect(chipText({ c: 1, p: 1 }, 0)).toBe('x');
    expect(chipText({ c: 2, p: 2 }, 1)).toBe('+ 2x²');
    expect(chipWidth('x', 1)).toBeGreaterThanOrEqual(40);
    expect(ARC_H).toBeGreaterThan(CHIP_H);
  });
});
