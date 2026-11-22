// The forge's last step (`RuleForge.jsx › UseLines`): a fraction is typed in its own shape — the token
// `{ frac: { n, d } }` (forgeBlocks.js › fractionBox / givenFraction) is ONE stacked block, numerator box, a real bar,
// denominator box, with the hooks every box has; a given fraction is printed in the same shape; a line without a fraction
// draws as before. Server render.
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { UseLines } from './RuleForge';
import { boxesOf, fractionBox, givenFraction, line } from './authoring/forgeBlocks';
import { slot } from './forge';

globalThis.window = globalThis.window ?? {};

const draw = (lines, vals = {}) =>
  renderToString(<UseLines lines={lines} vals={vals} onType={() => {}} />).replaceAll('<!-- -->', '');

describe('the forge’s last step — a fraction in its own shape', () => {
  it('66/78 = □/□: a printed fraction and a typed one, each a stacked block over a real bar, numerator first', () => {
    const html = draw([line([givenFraction(66, 78), '=', fractionBox('n', 'd', { w: 2 })])], { n: '11' });
    const blocks = html.match(/<span class="di-frac rf-frac[^"]*"[^>]*>/g);
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toContain('data-rf-frac="66/78"');
    expect(blocks[0]).not.toContain('di-frac--typed');
    expect(blocks[1]).toContain('data-rf-frac="n/d"');
    expect(blocks[1]).toContain('di-frac--typed');
    for (const b of blocks) expect(b).toContain('dir="ltr"');
    expect(html.match(/class="di-frac__bar"/g)).toHaveLength(2);
    // printed: 66 over its bar over 78 — never « 66/78 » as text
    expect(html).toMatch(/<b>66<\/b><span class="di-frac__bar"[^>]*><\/span><b>78<\/b>/);
    // typed: the numerator's box, the bar, the denominator's box — the hooks of every box, no label under them
    const n = html.indexOf('data-rf-use="n"');
    const bar = html.indexOf('di-frac__bar', html.indexOf('di-frac--typed'));
    const d = html.indexOf('data-rf-use="d"');
    expect(n).toBeGreaterThan(-1);
    expect(n).toBeLessThan(bar);
    expect(bar).toBeLessThan(d);
    expect(html).toContain('aria-label="البسط"');
    expect(html).toContain('aria-label="المقام"');
    expect(html).toContain('value="11"');
    expect(html).not.toContain('<small>البسط</small>');
  });

  it('a box beside fractions keeps its label on a one-line step; lines without a fraction draw as before', () => {
    const one = draw([line(['PGCD', '=', slot('g', 'PGCD', 2), givenFraction(5, 39), '=', fractionBox()])]);
    expect(one).toContain('<small>PGCD</small>');
    const plain = draw([line(['78', '=', slot('q', 'الحاصل', 2)]), line(['PGCD(66 ; 78)', '=', slot('g', 'PGCD', 2)])]);
    expect(plain).not.toContain('di-frac');
    expect(plain).toContain('data-rf-lines="2"');
    expect(plain).toContain('<b>78</b><b>=</b><label><input');
  });

  it('the boxes of a line, in reading order: a fraction gives its numerator’s box, then its denominator’s', () => {
    const tokens = [
      givenFraction(5, 39),
      '+',
      slot('a', 'x', 2),
      '=',
      fractionBox('s', 'w'),
      '=',
      fractionBox('n', 'd'),
    ];
    expect(boxesOf(tokens).map((t) => t.slot)).toEqual(['a', 's', 'w', 'n', 'd']);
    expect(boxesOf([givenFraction(1, 3)])).toEqual([]);
    expect(fractionBox('n', 'd', { nw: 2, dw: 3 }).frac.d.w).toBe(3);
  });
});
