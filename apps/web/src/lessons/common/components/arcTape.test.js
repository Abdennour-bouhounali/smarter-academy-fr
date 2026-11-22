import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import React from 'react';
import ArcTape from './ArcTape';
import { layoutArcTape, tapeLengths, validateArcTape, MIN_PART } from './arcTape';
import { validateStatementFigure } from './statementFigure';

const fig = (parts, whole, extra = {}) => ({ kind: 'tape', parts, whole, ariaLabel: 'مخطط بأقواس', ...extra });

describe('arcTape — « مخطط بأقواس »', () => {
  it('draws the textbook example 24,3 + 5,9 = 30,2 closed, the first part proportional', () => {
    const f = fig([{ label: '24,3', value: '24,3' }, { label: '5,9', value: 5.9 }], { label: '30,2', value: '30,2' });
    expect(validateArcTape(f)).toEqual([]);
    const L = layoutArcTape(f);
    expect(L.closed).toBe(true);
    expect(L.mismatch).toBeNull();
    const [a, b] = L.parts;
    expect(a.x2 - a.x1).toBeGreaterThan(b.x2 - b.x1);
    expect(L.whole.x2).toBeCloseTo(b.x2, 5);
  });

  it('computes a missing part from the whole (? = 15,1 − 9,7)', () => {
    const len = tapeLengths(fig([{ label: '؟', unknown: true }, { label: '9,7', value: '9,7' }], { label: '15,1', value: '15,1' }));
    expect(len.parts[0]).toBeCloseTo(5.4, 9);
    expect(len.closed).toBe(true);
  });

  it('keeps a small part readable (124 and 3: at least MIN_PART of the span)', () => {
    const L = layoutArcTape(fig([{ label: '124 cm', value: 124 }, { label: '3 cm', value: 3 }], { label: '127 cm', value: 127 }));
    const span = L.whole.x2 - L.whole.x1;
    expect(L.parts[1].x2 - L.parts[1].x1).toBeGreaterThanOrEqual(MIN_PART * span - 1e-6);
  });

  it('shows a GAP when the parts are too short and an OVERFLOW when they are too long', () => {
    const short = layoutArcTape(fig([{ label: '24,5', value: 24.5 }, { label: '5', value: 5 }], { label: '36', value: 36 }));
    expect(short.closed).toBe(false);
    expect(short.mismatch.kind).toBe('gap');
    expect(short.mismatch.x2).toBeGreaterThan(short.mismatch.x1);
    const long = layoutArcTape(fig([{ label: '24,5', value: 24.5 }, { label: '36', value: 36 }], { label: '13', value: 13 }));
    expect(long.mismatch.kind).toBe('overflow');
    expect(long.whole.x2).toBeLessThan(long.parts[1].x2);
  });

  it('refuses a statement figure that is false, unlabelled, unknown-keyed or without an Arabic aria-label', () => {
    expect(validateArcTape(fig([{ label: '2', value: 2 }, { label: '3', value: 3 }], { label: '6', value: 6 }))).toHaveLength(1);
    expect(validateArcTape(fig([{ label: '' }, { label: '3' }], { label: '□' })).join()).toMatch(/label/);
    expect(validateArcTape({ ...fig([{ label: 'a' }, { label: 'b' }], { label: 'c' }), color: 'red' }).join()).toMatch(/clé inconnue/);
    expect(validateArcTape(fig([{ label: 'a' }, { label: 'b' }], { label: 'c' }, { ariaLabel: 'tape' })).join()).toMatch(/ariaLabel/);
    expect(validateArcTape(fig([{ label: 'a' }], { label: 'c' })).join()).toMatch(/2 à 4/);
  });

  it('is dispatched by validateStatementFigure on kind « tape »', () => {
    expect(validateStatementFigure(fig([{ label: '2,7', value: '2,7' }, { label: '□', unknown: true }], { label: '7,03', value: '7,03' }))).toEqual([]);
  });

  it('renders LTR numbers, an RTL Arabic label, the unknown in rose and a unique hatch per tape', () => {
    const f = fig([{ label: 'ما يملكه', value: 24.5 }, { label: '□', unknown: true }], { label: '36', value: 36 });
    const html = renderToString(React.createElement('div', null, React.createElement(ArcTape, f), React.createElement(ArcTape, { ...f, parts: [{ label: '1', value: 1 }, { label: '2', value: 3 }] })));
    expect(html).toContain('aria-label="مخطط بأقواس"');
    expect(html).toContain('data-tape-label="unknown"');
    expect(html).toMatch(/direction:rtl/);
    const ids = [...html.matchAll(/<pattern id="([^"]+)"/g)].map((m) => m[1]);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
