import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import Planks from './tools/Planks';

const noop = () => {};

describe('Mon labo — « La planche commune » draws what it reads', () => {
  it('draws the plank and the six lengths, each filled or with what is left, and no raw formula', () => {
    const html = renderToString(<Planks a={21} b={35} play={noop} report={noop} range={{ a: [1, 60], b: [1, 60] }} />);
    // the opening plank is 4: of 21, 35, 56, 14, 14, 63 it fills the sum alone
    expect(html).toContain('data-d="4"');
    expect(html).toContain('data-fits="001000"');
    for (const label of ['56', '35 − 21 = 14', '35 = 21 × 1 + 14', '3 × 21 = 63']) expect(html).toContain(label);
    expect(html).toContain('reste 1'); // 21 = 4 × 5 + 1
    expect(html).not.toMatch(/\\times|\$/);
    expect(html).toContain('data-ll-plank');
  });

  it('a plank longer than every length is brought back inside the drawing', () => {
    const html = renderToString(<Planks a={1} b={1} play={noop} report={noop} range={{ a: [1, 60], b: [1, 60] }} />);
    expect(html).toContain('data-d="3"'); // the span is 3 × 1: the plank cannot be longer
  });
});
