import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import RopeTriangle, { ropePoint, ropeFigure } from './tools/RopeTriangle';
import { validateGeoFigure } from '../components/geoFigure';

const VW = 560; // the drawing's viewBox (tools/RopeTriangle.jsx)
const VH = 370;
const noop = () => {};
const draw = (a, b, start) =>
  renderToString(
    <RopeTriangle a={a} b={b} start={start} play={noop} report={noop} range={{ a: [2, 30], b: [2, 30] }} />,
  ).replaceAll('<!-- -->', '');
const ropesOf = (html) => html.slice(html.indexOf('<svg'), html.indexOf('</svg>'));
const cardOf = (html) => html.slice(html.indexOf('data-ll-rope-figure'));
/** Every number a drawn attribute takes (x, cx…), to check that nothing leaves the drawing. */
const nums = (html, attr) =>
  [...ropesOf(html).matchAll(new RegExp(` ${attr}="([-\\d.]+)"`, 'g'))].map((m) => Number(m[1]));

describe('Mon labo — « La corde et le triangle » draws what it measures', () => {
  it('opens on a cut that is not parallel: the M handle calling the hand, no gold line, no chevron', () => {
    const html = draw(12, 9);
    // AB = 12, AC = 9; M on knot 4, N on knot 8: 4 × 9 ≠ 8 × 12
    expect(html).toContain('data-ll-rope="12:9" data-m="4" data-n="8" data-aligned="no"');
    expect(html).toContain('ll-pulse');
    expect(html).not.toContain('data-ll-rope-aligned');
    expect(html).toContain('data-ll-rope-verdict="crossing"');
    expect(html).toContain('data-ll-rope-figure="crossing"');
    // a knot every metre: 13 on AB, 10 on AC
    expect((html.match(/data-ll-rope-knot="m"/g) ?? []).length).toBe(13);
    expect((html.match(/data-ll-rope-knot="n"/g) ?? []).length).toBe(10);
    // the figure: the shared GeoFigure, its four pieces written, no chevron of a parallel
    expect(cardOf(html)).toContain('data-geo-figure');
    expect(cardOf(html)).not.toContain('<polyline');
    // no raw formula in the ropes' drawing
    expect(ropesOf(html)).not.toMatch(/\\|\$/);
  });

  it('two knots on one vertical line: the gold line, the chevrons, the verdict — and the pieces measured', () => {
    // 8 × 9 = 6 × 12: M at 8 of 12, N at 6 of 9
    const html = draw(12, 9, { m: 8, n: 6, moved: true, found: [8] });
    expect(html).toContain('data-m="8" data-n="6" data-aligned="yes"');
    expect(html).toContain('data-ll-rope-aligned');
    expect(html).toContain('data-ll-rope-verdict="parallel"');
    expect(html).toContain('ll-chip--good');
    expect(cardOf(html)).toContain('<polyline'); // the chevrons of (MN) ∥ (BC)
    expect(html).toContain('AM = 8');
    expect(html).toContain('MB = 4');
    expect(html).toContain('NC = 3');
    expect(html).not.toContain('ll-pulse'); // the hand has moved
    // the gold line stands on one x: the two knots at 8/12 and 6/9 of the same length
    const [x1, x2] = [nums(html, 'x1'), nums(html, 'x2')].map((xs) => xs.at(-1));
    expect(Math.abs(x1 - x2)).toBeLessThan(1e-9);
  });

  it('keeps the knots inside the ropes, and every mark inside the drawing', () => {
    for (const [a, b, start] of [
      [2, 2, null],
      [30, 30, { m: 29, n: 1, moved: true }],
      [7, 30, { m: 99, n: 0 }],
    ]) {
      const html = draw(a, b, start);
      const m = Number(html.match(/data-m="(\d+)"/)[1]);
      const n = Number(html.match(/data-n="(\d+)"/)[1]);
      expect(m).toBeGreaterThanOrEqual(1);
      expect(m).toBeLessThanOrEqual(a - 1);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(b - 1);
      for (const x of [...nums(html, 'x'), ...nums(html, 'cx'), ...nums(html, 'x1'), ...nums(html, 'x2')]) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(VW);
      }
      for (const y of [...nums(html, 'y'), ...nums(html, 'cy')]) {
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(VH);
      }
    }
  });

  it('draws its triangle through the shared GeoFigure with a valid spec, chevrons only when parallel', () => {
    for (const [a, b, m, n, aligned] of [
      [12, 9, 8, 6, true],
      [12, 9, 4, 8, false],
      [30, 2, 15, 1, true],
    ]) {
      const fig = ropeFigure(a, b, m, n, aligned);
      expect(validateGeoFigure(fig)).toEqual([]);
      const cut = fig.segments.find((s) => s.from === 'M' && s.to === 'N');
      expect(Boolean(cut.arrows)).toBe(aligned);
      expect(fig.segments.map((s) => s.label).filter(Boolean)).toEqual([
        String(m),
        String(a - m),
        String(n),
        String(b - n),
      ]);
    }
  });

  it('reads the pointer in ITS viewBox (560 × 370), not the kit default', () => {
    const svg = { getBoundingClientRect: () => ({ left: 0, top: 0, width: 560, height: 370 }) };
    expect(ropePoint(svg, { clientX: 280, clientY: 185 })).toEqual({ x: 280, y: 185 });
  });

  it('never writes an error, a ratio, or a word of the lesson’s keys', () => {
    for (const start of [null, { m: 8, n: 6, moved: true }]) {
      const html = draw(12, 9, start);
      expect(html).not.toMatch(/\bfau(?:x|sses?)\b|erreur|#f87171|#ef4444/i);
      expect(html).not.toMatch(
        /thalès|papillon|coefficient|proportion|agrandissement|réduction|rapport|\\frac|\\dfrac/i,
      );
    }
  });
});
