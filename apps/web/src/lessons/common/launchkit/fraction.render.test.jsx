import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Write } from './gestures';
import { makeQuestion, slotsOf } from './families';

const rng = (seed) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};
const noop = () => {};

describe('عُدّة الانطلاق — a fraction written in its own shape', () => {
  it('draws the two fractions with a real bar and ONE box inside the second, in reading order', () => {
    for (let seed = 1; seed <= 20; seed += 1) {
      const q = makeQuestion(rng(seed), '1am.m5.r02', 1 + (seed % 2), 'write');
      const html = renderToString(<Write q={q} value={{}} onChange={noop} locked={false} play={noop} />);
      const { n, d, m, side } = q.calc;
      expect(html).toContain(`data-lk-frac="${n}/${d}"`);
      expect(html).toContain(`data-lk-frac="${side === 'bottom' ? `${m}/▢` : `▢/${m}`}"`);
      expect(html.match(/class="lk-frac"/g)).toHaveLength(2);
      expect(html.match(/data-lk-slot="v"/g)).toHaveLength(1);
      expect(html).not.toMatch(/\\frac|\$/); // no raw formula: the bar is drawn
    }
  });

  it('draws a power with a REAL superscript (« 3am.m3.r06 »): no « ^ », no raw formula, the boxes after it', () => {
    const shapes = new Set();
    for (let seed = 1; seed <= 40; seed += 1) {
      const q = makeQuestion(rng(seed * 104729 + 17), '3am.m3.r06', 1 + (seed % 2), 'write', { first: seed % 7 === 0 });
      const html = renderToString(<Write q={q} value={{}} onChange={noop} locked={false} play={noop} />);
      const { x, n, d, e } = q.calc;
      expect(html.match(/class="lk-pow"/g)).toHaveLength(1);
      expect(html).toContain(`<sup>${e}</sup>`);
      expect(html.replace(/ data-lk-[a-z]+="[^"]*"/g, '')).not.toMatch(/\^|\\frac|\$/); // what is SEEN
      if (n != null) {
        shapes.add('fraction');
        expect(html).toContain(`data-lk-pow="${n}/${d}^${e}"`);
        expect(html).toContain(`data-lk-frac="${n}/${d}"`); // the base, with its bar, in brackets
        expect(html).toContain('data-lk-frac="▢/▢"'); // the answer: two boxes over a real bar
        expect(html.match(/lk-pow__paren/g)).toHaveLength(2);
        expect(html.indexOf('data-lk-slot="n"')).toBeLessThan(html.indexOf('data-lk-slot="d"'));
      } else {
        shapes.add(x < 0 ? 'negative' : 'whole');
        expect(html).toContain(`data-lk-pow="${x < 0 ? `(−${-x})` : x}^${e}"`);
        expect(html.match(/data-lk-slot="v"/g)).toHaveLength(1);
      }
    }
    expect([...shapes].sort()).toEqual(['fraction', 'negative', 'whole']);
  });

  it('reads the boxes inside a fraction like any other box', () => {
    expect(slotsOf(['47', '=', { slot: 'q' }, '+', { slot: 'r' }]).map((s) => s.slot)).toEqual(['q', 'r']);
    expect(slotsOf([{ frac: ['6', '8'] }, '=', { frac: ['3', { slot: 'v' }] }]).map((s) => s.slot)).toEqual(['v']);
    // a power holds no box: its base and its exponent are drawn
    expect(
      slotsOf([{ pow: [{ frac: ['2', '3'] }, '2'] }, '=', { frac: [{ slot: 'n' }, { slot: 'd' }] }]).map((s) => s.slot),
    ).toEqual(['n', 'd']);
  });
});
