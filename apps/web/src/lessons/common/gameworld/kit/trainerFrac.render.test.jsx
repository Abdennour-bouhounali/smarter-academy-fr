// « تدرّب » — the lines of an exam FORM (`Trainer.jsx › FormLines`), the fraction template `{ frac: { n, d } }` above
// all: a typed fraction is two boxes stacked over a real bar, numerator first, with the hooks every box has; a GIVEN
// fraction is printed in the same shape; a line without a fraction draws as it always did. Server render.
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { FormLines, TapOption } from './Trainer';

globalThis.window = globalThis.window ?? {};

// React's server render separates two text nodes with « <!-- --> »: the browser shows them as one text
const draw = (lines, v = {}) =>
  renderToString(<FormLines lines={lines} v={v} set={() => () => {}} locked={false} />).replaceAll('<!-- -->', '');
const box = (num, label) => ({ num, label });
const typed = (n, d) => ({ frac: { n: box(n, `البسط ${n}`), d: box(d, `المقام ${d}`) } });

describe('the fraction template of the trainer’s sheet', () => {
  it('a typed fraction: ONE stacked block — the numerator box, a real bar, the denominator box, in that order', () => {
    const html = draw([{ ltr: true, tokens: [{ frac: { n: 66, d: 78 } }, '=', typed('p', 'q')] }], { p: '11' });
    const blocks = html.match(/<span class="di-frac(?: di-frac--typed)?"[^>]*>/g);
    expect(blocks).toHaveLength(2);
    expect(blocks[1]).toContain('di-frac--typed');
    expect(blocks[0]).not.toContain('di-frac--typed');
    for (const b of blocks) {
      expect(b).toContain('dir="ltr"');
      expect(b).toContain('data-di-frac');
    }
    expect(html.match(/class="di-frac__bar"/g)).toHaveLength(2);
    // the boxes keep the hooks of every box: data-di-tr, aria-label; the numerator comes first (keyboard order)
    const p = html.indexOf('data-di-tr="p"');
    const bar = html.indexOf('di-frac__bar', html.indexOf('di-frac--typed'));
    const q = html.indexOf('data-di-tr="q"');
    expect(p).toBeGreaterThan(-1);
    expect(p).toBeLessThan(bar);
    expect(bar).toBeLessThan(q);
    expect(html).toContain('aria-label="البسط p"');
    expect(html).toContain('aria-label="المقام q"');
    expect(html).toContain('value="11"');
    // a box holds three digits (Num w = 3: 4.4ch wide, four characters typed at most)
    expect(html).toMatch(/data-di-tr="q"/);
    expect(html).toContain('width:4.4ch');
    // the given fraction is printed — 66 over its bar over 78 — never « 66/78 » as text
    expect(html).toMatch(/<b>66<\/b><span class="di-frac__bar"[^>]*><\/span><b>78<\/b>/);
    expect(html).not.toContain('66/78');
  });

  it('inside an RTL sentence: the fraction is an isolated LTR block between the words, and a choice follows', () => {
    const html = draw([
      {
        tokens: [
          'الكسر',
          { frac: { n: 35, d: 48 } },
          { choice: 'verdict', options: [{ value: 'irr', text: 'غير قابل للاختزال' }] },
        ],
      },
    ]);
    expect(html).toMatch(/^<div class="di-sheet__line">الكسر <span class="di-frac"/);
    expect(html.indexOf('di-frac')).toBeLessThan(html.indexOf('<select'));
    expect(html).toContain('data-di-tr="verdict"');
  });

  it('a line WITHOUT a fraction draws exactly as before the template', () => {
    const html = draw([
      { ltr: true, tokens: ['PGCD(66 ; 78)', '=', box('g', 'القاسم')] },
      { tokens: ['النتيجة', { strong: 12 }, { text: 'لوحًا', rtl: true }] },
    ]);
    expect(html).not.toContain('di-frac');
    expect(html).toContain('<div class="di-sheet__line" dir="ltr"><span>PGCD(66 ; 78)</span><span>=</span><input');
    expect(html).toContain('data-di-tr="g"');
    expect(html).toContain('<div class="di-sheet__line">النتيجة <b dir="ltr">12</b><span dir="rtl">لوحًا</span></div>');
  });
});

describe('a gate of a tap', () => {
  it('a fraction « p/q » is stacked over a real bar — never « p/q » as text; any other gate as it is written', () => {
    const html = renderToString(<TapOption n="4/49" />);
    expect(html).toMatch(
      /<span class="di-frac" dir="ltr" data-di-frac[^>]*><b>4<\/b><span class="di-frac__bar"[^>]*><\/span><b>49<\/b><\/span>/,
    );
    expect(html).not.toContain('4/49');
    expect(renderToString(<TapOption n="1,4" />)).toBe('1,4');
    expect(renderToString(<TapOption n="22" />)).toBe('22');
  });
});
