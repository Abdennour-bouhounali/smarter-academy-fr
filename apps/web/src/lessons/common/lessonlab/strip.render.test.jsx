import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import Strip from './tools/Strip';

const noop = () => {};
const draw = (a, b, start) =>
  renderToString(
    <Strip a={a} b={b} start={start} play={noop} report={noop} range={{ a: [1, 999], b: [1, 999] }} />,
  ).replaceAll('<!-- -->', '');
const svgOf = (html) => html.slice(html.indexOf('<svg'), html.indexOf('</svg>'));
/** Every number a drawn attribute takes (x, width…), to check that nothing leaves the drawing (940 × 370). */
const xs = (html, attr) => [...svgOf(html).matchAll(new RegExp(` ${attr}="([-\\d.]+)"`, 'g'))].map((m) => Number(m[1]));

describe('مختبري — « شريط الكسر » draws what it reads', () => {
  it('opens on the piece 2, the handle calling the hand, the fraction drawn with its bar — no raw formula', () => {
    const html = draw(60, 96);
    expect(html).toContain('data-ll-strip="true" data-k="2" data-verdict="both" data-pieces="48" data-joints="47"');
    expect(html).toContain('ll-pulse'); // the handle was never moved
    expect(html).toContain('data-ll-strip-frac="cells" data-n="60" data-d="96"');
    expect(svgOf(html)).not.toMatch(/\\|\$/);
    expect(html).toContain('2 يقسم البسط والمقام معًا');
  });

  it('a piece that fills the strip but not the lit part: the light ends inside a piece, outlined; no fraction in pieces', () => {
    const html = draw(60, 96, { k: 8 });
    expect(html).toContain('data-verdict="b"');
    expect(html).toContain('data-ll-strip-cut="56:64"'); // 60 = 8 × 7 + 4: the eighth piece holds the end of the light
    expect(html).not.toContain('data-ll-strip-left=');
    expect(html).not.toContain('data-ll-strip-rewrite');
    expect(html).toContain('8 يقسم المقام وحده');
    expect(html).toContain('60 = 8 \\times 7 + 4');
  });

  it('a piece that divides both: the light ends on a joint and the fraction is written in pieces', () => {
    const html = draw(60, 96, { k: 12 });
    expect(html).toContain('data-ll-strip-onjoint="60"');
    expect(html).toContain('data-ll-strip-rewrite="5/8"');
    expect(html).toContain('data-ll-strip-frac="pieces" data-n="5" data-d="8"');
    expect(html).toContain('قطع 12: 5 مضاءة من 8');
  });

  it('a piece that divides neither: what is left at the end of the strip, and a verdict with no name', () => {
    const html = draw(63, 80, { k: 3, tried: [3, 5, 7] });
    expect(html).toContain('data-verdict="a"');
    expect(html).toContain('data-ll-strip-left="2"'); // 80 = 3 × 26 + 2
    const none = draw(63, 80, { k: 5 });
    expect(none).toContain('5 يقسم المقام وحده');
    const zero = draw(63, 80, { k: 11 });
    expect(zero).toContain('11 لا يقسم البسط ولا المقام');
    expect(html).toContain('data-ll-strip-tried="3,5,7"');
    expect(html).toContain('data-ll-strip-tried-k="7" data-verdict="a"');
  });

  it('three-digit terms: hundreds of pieces drawn as one bar, everything inside the drawing', () => {
    const many = draw(998, 999, { k: 2 });
    expect(many).toContain('data-joints="bar"');
    expect(many).not.toContain('data-ll-strip-joint=');
    expect(many).toContain('500 قطعة');
    for (const html of [
      many,
      draw(1, 999, { k: 998 }),
      draw(999, 2, { k: 2 }),
      draw(304, 368, { k: 16, tried: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 16] }),
    ]) {
      for (const x of xs(html, 'x')) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(940);
      }
      for (const y of xs(html, 'y')) {
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(370);
      }
    }
    // a fraction above 1: the lit part passes the end of the strip, both labels drawn
    expect(draw(999, 2, { k: 2 })).toContain('data-ll-strip-lit="999"');
  });
});
